#!/usr/bin/env python3
"""Validate data files and local links. Usage: python3 -I scripts/check.py"""
import json, re, sys
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _date(s):
    try:
        return datetime.strptime(s, "%Y-%m-%d")
    except (ValueError, TypeError):
        return None


def _load(root, name, problems):
    p = root / "data" / name
    if not p.exists():
        problems.append(f"data/{name}: missing")
        return None
    try:
        return json.loads(p.read_text())
    except json.JSONDecodeError as e:
        problems.append(f"data/{name}: invalid JSON ({e})")
        return None


def check_data(root):
    problems = []
    res = _load(root, "results.json", problems)
    if res is not None:
        for si, s in enumerate(res.get("seasons", None) or []):
            if not isinstance(s.get("year"), int):
                problems.append(f"results.json seasons[{si}]: year must be int")
            for ri, r in enumerate(s.get("races", [])):
                for k in ("event", "venue", "date"):
                    if not r.get(k):
                        problems.append(f"results.json seasons[{si}].races[{ri}]: missing {k}")
                if r.get("date") and not _date(r["date"]):
                    problems.append(f"results.json seasons[{si}].races[{ri}]: bad date {r['date']!r}")
        if "seasons" not in res:
            problems.append("results.json: missing 'seasons'")
    sch = _load(root, "schedule.json", problems)
    if sch is not None:
        if "races" not in sch:
            problems.append("schedule.json: missing 'races'")
        for i, r in enumerate(sch.get("races", [])):
            for k in ("event", "venue", "date"):
                if not r.get(k):
                    problems.append(f"schedule.json races[{i}]: missing {k}")
            d = _date(r.get("date"))
            if r.get("date") and not d:
                problems.append(f"schedule.json races[{i}]: bad date {r['date']!r}")
            if r.get("endDate"):
                e = _date(r["endDate"])
                if not e:
                    problems.append(f"schedule.json races[{i}]: bad endDate {r['endDate']!r}")
                elif d and e < d:
                    problems.append(f"schedule.json races[{i}]: endDate before date")
    sp = _load(root, "sponsors.json", problems)
    if sp is not None:
        if "sponsors" not in sp:
            problems.append("sponsors.json: missing 'sponsors'")
        for i, s in enumerate(sp.get("sponsors", [])):
            if not s.get("name"):
                problems.append(f"sponsors.json sponsors[{i}]: missing name")
            if s.get("logo") and not (root / s["logo"].lstrip("/")).exists():
                problems.append(f"sponsors.json sponsors[{i}]: logo not found {s['logo']}")
    return problems


class _Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if k in ("href", "src") and v:
                self.links.append(v)


def check_links(root):
    problems = []
    for page in sorted(root.rglob("*.html")):
        if any(part in (".superpowers", "docs") for part in page.relative_to(root).parts):
            continue
        p = _Links()
        p.feed(page.read_text())
        for link in p.links:
            if re.match(r"^(https?:|mailto:|tel:|#|data:)", link):
                continue
            path = link.split("#")[0].split("?")[0]
            if not path:
                continue
            target = root / path.lstrip("/") if path.startswith("/") else page.parent / path
            if target.is_dir():
                target = target / "index.html"
            if not target.exists():
                problems.append(f"{page.relative_to(root)}: broken link {link}")
    return problems


def main():
    problems = check_data(ROOT) + check_links(ROOT)
    for p in problems:
        print("PROBLEM:", p)
    print("OK" if not problems else f"{len(problems)} problem(s)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())

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
                if r.get("logo") and not _file_exists_exact_case(root, r["logo"]):
                    problems.append(f"results.json seasons[{si}].races[{ri}]: logo not found (case-sensitive) {r['logo']}")
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
            if r.get("time") and not re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", r["time"]):
                problems.append(f"schedule.json races[{i}]: bad time {r['time']!r} (use 24-hour HH:MM)")
            if r.get("logo") and not _file_exists_exact_case(root, r["logo"]):
                problems.append(f"schedule.json races[{i}]: logo not found (case-sensitive) {r['logo']}")
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
            if s.get("logo"):
                lp = root / s["logo"].lstrip("/")
                # exact-case match: macOS ignores case but GitHub Pages does not
                if not lp.parent.is_dir() or lp.name not in {f.name for f in lp.parent.iterdir()}:
                    problems.append(f"sponsors.json sponsors[{i}]: logo not found (case-sensitive) {s['logo']}")
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


def _file_exists_exact_case(root, src):
    # exact-case match: macOS ignores case but GitHub Pages does not
    lp = root / src.lstrip("/")
    return lp.parent.is_dir() and lp.name in {f.name for f in lp.parent.iterdir()}


def check_league(root):
    problems = []
    lg = _load(root, "league.json", problems)
    if lg is None:
        return problems
    if not isinstance(lg, dict):
        return problems + ["league.json: must be an object"]
    for k in ("name", "season"):
        if not lg.get(k):
            problems.append(f"league.json: missing {k}")
    for i, f in enumerate(lg.get("facts") or []):
        if not f.get("label") or not f.get("value"):
            problems.append(f"league.json facts[{i}]: needs label and value")
    for i, t in enumerate(lg.get("timeline") or []):
        if not t.get("label") or not t.get("time"):
            problems.append(f"league.json timeline[{i}]: needs label and time")
    for i, l in enumerate(lg.get("links") or []):
        if not l.get("label"):
            problems.append(f"league.json links[{i}]: missing label")
        if not str(l.get("url", "")).startswith("https://"):
            problems.append(f"league.json links[{i}]: url must start with https:// ({l.get('url')!r})")
    for i, lo in enumerate(lg.get("logos") or []):
        if not lo.get("name"):
            problems.append(f"league.json logos[{i}]: missing name")
        if not lo.get("src") or not _file_exists_exact_case(root, lo["src"]):
            problems.append(f"league.json logos[{i}]: logo not found (case-sensitive) {lo.get('src')!r}")
    return problems


class _Anchors(HTMLParser):
    def __init__(self):
        super().__init__()
        self.anchors = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.anchors.append(dict(attrs))


def check_external_links(root):
    """External links in pages open in a new tab, safely."""
    problems = []
    for page in sorted(root.rglob("*.html")):
        if any(part in (".superpowers", "docs") for part in page.relative_to(root).parts):
            continue
        p = _Anchors()
        p.feed(page.read_text())
        for a in p.anchors:
            href = a.get("href") or ""
            if href.startswith(("http://", "https://")):
                if a.get("target") != "_blank" or "noopener" not in (a.get("rel") or ""):
                    problems.append(f"{page.relative_to(root)}: external link {href} needs target=\"_blank\" and rel=\"noopener\"")
    return problems


def check_css(root):
    """Unbalanced braces make browsers silently drop the next rule."""
    text = re.sub(r"/\*.*?\*/", "", (root / "assets/css/style.css").read_text(), flags=re.S)
    depth = 0
    for n, line in enumerate(text.splitlines(), 1):
        depth += line.count("{") - line.count("}")
        if depth < 0:
            return [f"assets/css/style.css:{n}: unmatched '}}'"]
    return [] if depth == 0 else [f"assets/css/style.css: {depth} unclosed '{{'"]


def check_brand_link(root):
    """The header logo link must have an accessible name in every header state."""
    problems = []
    for page in sorted(root.rglob("*.html")):
        if any(part in (".superpowers", "docs") for part in page.relative_to(root).parts):
            continue
        text = page.read_text()
        if 'class="site-header"' not in text:
            continue
        m = re.search(r'<a class="box brand"[^>]*>', text)
        if not m or "aria-label=" not in m.group(0):
            problems.append(f"{page.relative_to(root)}: header logo link needs aria-label")
    return problems


def main():
    problems = check_data(ROOT) + check_links(ROOT) + check_css(ROOT) + check_brand_link(ROOT) + check_league(ROOT) + check_external_links(ROOT)
    for p in problems:
        print("PROBLEM:", p)
    print("OK" if not problems else f"{len(problems)} problem(s)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())

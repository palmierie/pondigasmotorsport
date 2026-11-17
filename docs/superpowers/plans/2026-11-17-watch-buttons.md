# Watch Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a green Watch button (YouTube link) to every Schedule row, Results row, and the home page's Next Race and Latest Result cards.

**Architecture:** Optional `watch` URL per round plus a default `watchUrl` at the top of `data/schedule.json` and `data/results.json`. `render.js` appends a `.row-watch` button to rows and feature cards when a valid https link exists; CSS adds a button column to rows and places the button under the text in cards. `scripts/check.py` validates the URLs.

**Tech Stack:** HTML, CSS, vanilla JS (ES modules), JSON, Python 3 check script. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-17-watch-buttons-design.md`

## Global Constraints

- Static site, no build step, no new libraries; root-absolute paths.
- Link resolution: a round's own `watch` wins; otherwise the file's top-level `watchUrl`; otherwise no button. Only values starting with `https://` are used; anything else is ignored when rendering.
- Defaults: `data/schedule.json` `"watchUrl": "https://www.youtube.com/@FoxxteccaOriginals/live"`; `data/results.json` `"watchUrl": "https://www.youtube.com/@FoxxteccaOriginals/streams"`.
- Labels: "Watch" on schedule rows and the Next Race card; "Watch replay" on results rows and the Latest Result card.
- Markup: `<span class="row-watch"><a class="btn watch-btn" href="<escaped url>" target="_blank" rel="noopener">Label<span class="visually-hidden"> (opens in a new tab)</span></a></span>` as the last child of the row/card; the row/card also gets class `has-watch`. The button is a separate link, never nested inside the title link.
- Green `.btn` style (white text, Rajdhani Bold, >= 19px); focus ring visible; no sideways scroll at 320px; text contrast >= 4.5:1.
- Keep `python3 -I scripts/check.py` and `render.test.html` (ALL PASS) green. Pages are edited directly; the old scratch generator must not be re-run.

## Review Focus

- A schedule row with a track logo tile, a long venue (50+ chars) and the Watch button at 320px and 375px: no overflow, no overlap, button reachable.
- Results rows with `row-meta` and `row-notes` lines: they do not run under the button on desktop.
- No link anywhere (no `watch`, no `watchUrl`): no button, no empty column or stray gap.
- A `watch` of `javascript:...` or `www.x.com`: not rendered, and `check.py` rejects it.
- Next Race and Latest Result cards at desktop and 375px, with and without a logo tile (including after a failed logo removes `has-logo`): button sits cleanly under the text.
- Schedule titles that are links (`link` field) plus a Watch button: two separate anchors, no nesting.
- Keyboard focus on the button is clearly visible.

## File Structure

- `data/schedule.json`, `data/results.json`: add `watchUrl` (and optional per-round `watch`).
- `assets/js/render.js`: `raceSpans` watch option; `renderSchedule`, `renderNextRace`, `renderResults`, `renderLatestResult` pass it.
- `assets/js/render.test.html`: tests.
- `assets/css/style.css`: row/card layout for the button.
- `scripts/check.py`: validates `watchUrl` and `watch`.
- `README.md`: field docs and the prompts section.

---

### Task 1: Data and validation

**Files:**
- Modify: `data/schedule.json`, `data/results.json`, `scripts/check.py`

**Interfaces:**
- Produces: top-level `watchUrl` (string, https) in both data files; optional `watch` (string, https) on any round.
- Produces: `check_data` reports `<file> watchUrl must start with https://` and `<file> <list>[i].watch must start with https://` for bad values (non-strings reported, never a crash).

- [ ] **Step 1: Extend `check_data`** in `scripts/check.py` for `watchUrl` and per-round `watch` in both files (schedule rounds in `races`, results rounds in each season's `races`).
- [ ] **Step 2: Add `watchUrl`** to both data files with the defaults from Global Constraints (keep all other fields).
- [ ] **Step 3: Run `python3 -I scripts/check.py`.** Expected: `OK`.
- [ ] **Step 4: Negative checks** in a temp copy of `data/`: set `watchUrl` to `javascript:alert(1)`, a round `watch` to `www.x.com`, and a round `watch` to the number `5`; confirm each is reported and nothing crashes.
- [ ] **Step 5: Commit** — `git add data scripts && git commit -m "feat: watch link data and validation"`

### Task 2: Watch button in rows and cards (test-first)

**Files:**
- Modify: `assets/js/render.test.html`, `assets/js/render.js`, `assets/css/style.css`

**Interfaces:**
- Consumes: `data.watchUrl`, round `watch` (Task 1).
- Produces in `render.js`: `raceSpans` accepts a new option `watch: { label: string, url: string } | null`; link is `r.watch` if it starts with `https://`, else `watch.url` if it starts with `https://`, else none. When a link exists it appends the Global Constraints markup and the `row`/`feature` helpers add class `has-watch`. `renderSchedule` and `renderNextRace` pass `{ label: "Watch", url: data.watchUrl }`; `renderResults` and `renderLatestResult` pass `{ label: "Watch replay", url: data.watchUrl }`.

- [ ] **Step 1: Add failing tests** (names exact): `schedule row shows a Watch button with the default link`, `round watch link overrides the default`, `no watch link means no button`, `non-https watch links are not rendered`, `watch link opens in a new tab with noopener and screen reader text`, `watch url is escaped in the attribute`, `results row shows a Watch replay button`, `next race feature shows a Watch button`, `latest result feature shows a Watch replay button`, `watch button is not nested inside the title link` (a round with `link` set renders two separate anchors).
- [ ] **Step 2: Run** (`python3 -m http.server 8000`, open `http://localhost:8000/assets/js/render.test.html`). Expected: the button-present tests FAIL; the "no button" and "non-https" tests may pass already and guard behavior.
- [ ] **Step 3: Implement in `render.js`** per the interface.
- [ ] **Step 4: Re-run tests.** Expected: `ALL PASS`.
- [ ] **Step 5: CSS.** Rows with `has-watch`: add a trailing `auto` column to the existing grids (the plain row and `.row.has-logo`), `.row-watch` `justify-self: end` and `align-self: center`; `.row-meta` and `.row-notes` must span only the text columns (not the button column); at `max-width: 720px` rows are one column and `.row-watch` is left-aligned below the text. Cards (`.feature`): `.row-watch` on its own row under the text (adjust the `.feature.has-logo` tile spans so the tile still spans the text rows only), left-aligned, with a small top margin. Keep `.row-watch .btn` at the standard button size.
- [ ] **Step 6: Verify in browser** `/schedule/`, `/results/` and `/` at desktop, 375px and 320px (also a temporary 50-char venue with the button at 320px; a temporary round with no link; a failed logo removing `has-logo` on a row and on the Next Race card); confirm the button has a visible focus ring via Tab; restore all temporary edits. Run `python3 -I scripts/check.py` (expected `OK`).
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: Watch buttons on schedule, results and home cards"`

### Task 3: README and final verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README:** document `watch` and `watchUrl` (examples in both the schedule and result snippets), the labels, and that exact per-race links override the default. Add `watch` to the prompts: in "After a race" and "Add rounds to the schedule", offer "optionally include the YouTube link for the stream".
- [ ] **Step 2: Final verification.** All seven pages at desktop and 375px: no console errors, no horizontal scroll; `render.test.html` `ALL PASS`; `python3 -I scripts/check.py` exits 0; `git status` clean except intended files.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "docs: watch link fields and prompts"`

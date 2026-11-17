# Track Logos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show each round's track logo in a dark square tile at the left of every schedule row and the home page's Next Race box.

**Architecture:** An optional `logo` path on each round in `data/schedule.json`; `render.js` emits a leading tile for rounds that have one (schedule rows and the Next Race feature only); CSS gives rows with a tile an extra grid column; the existing logo-error handler in `main.js` also hides the tile if its image fails.

**Tech Stack:** HTML, CSS, vanilla JS (ES modules), JSON, Python 3 check script. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-17-track-logos-design.md`

## Global Constraints

- Static site, no build step, no new libraries; root-absolute paths (`/assets/tracks/...`).
- Eight logos, `assets/tracks/<name>.webp` (WebP content, 300x300, transparent, white/colored artwork made for dark backgrounds): `road-atlanta`, `mid-ohio`, `monza`, `nurburgring`, `sonoma`, `brands-hatch`, `daytona`, `watkins-glen`, mapped to rounds 1 to 8 in that order.
- Tile: square, `--black` background, ~72px on desktop and ~56px at <= 720px, logo `object-fit: contain` and centered with padding (never stretched or cropped), square corners, `alt=""` (the venue text is adjacent).
- Logos appear on schedule rows and the Next Race box only; never on Results rows or the Latest Result box.
- A missing/failed logo hides the whole tile; the row keeps its text and layout.
- Keep restyle rules: no horizontal scroll at 320px, text contrast >= 4.5:1, focus visible; `python3 -I scripts/check.py` and `render.test.html` (ALL PASS) stay green.
- `schedule/index.html` and other pages are edited directly; the old page generator in scratch is not part of the repo and must not be re-run.

## Review Focus

- Logo fails to load: the tile disappears (no empty dark square) and the row layout stays intact.
- A round without a `logo` renders exactly as before (no gap, no `undefined`).
- 320px: tile plus a 50-character venue name and long event title wrap with no overflow or overlap.
- The Mid-Ohio logo (a thin banner) sits contained inside the tile, not cropped or stretched, and is as legible as possible.
- A `logo` value containing quotes or `<` is escaped inside the attribute.
- Results rows and the Latest Result box never show a tile even if a result entry has a `logo` field.
- Next Race box on the home page lays out cleanly with the tile at desktop and 375px.

## File Structure

- `assets/tracks/*.webp`: the eight logos.
- `data/schedule.json`: adds `logo` per round.
- `assets/js/render.js`: tile markup in `raceSpans` for schedule rows and the Next Race feature.
- `assets/js/render.test.html`: tests.
- `assets/js/main.js`: error handler hides the tile.
- `assets/css/style.css`: tile and `has-logo` row layout.
- `scripts/check.py`: validates schedule `logo` paths.
- `README.md`: field and credits.

---

### Task 1: Logo files, data and validation

**Files:**
- Create: `assets/tracks/*.webp` (eight files)
- Modify: `data/schedule.json`, `scripts/check.py`

**Interfaces:**
- Produces: each round in `data/schedule.json` gets `"logo": "/assets/tracks/<name>.webp"` (mapping in Global Constraints).
- Produces: `check_data` also reports, for every round with a `logo`, a path that is not a file with exact-case match (reuse `_file_exists_exact_case`), message `schedule.json races[i]: logo not found (case-sensitive) <path>`.

- [ ] **Step 1: Extend `check_data`** in `scripts/check.py` with the logo-path check described above (inside the schedule loop).
- [ ] **Step 2: Add the `logo` fields** to all eight rounds in `data/schedule.json` (files do not exist yet).
- [ ] **Step 3: Run `python3 -I scripts/check.py`.** Expected: exit 1 with eight `logo not found` problems.
- [ ] **Step 4: Copy the logos** from the scratch downloads (`dl-track-<name>/<name>.webp` inside the session scratchpad directory) into `assets/tracks/`; `file` on each must report `Web/P image`. If the scratch copies are gone, re-download them from the league site (https://foxxtecca.com/league round images, `format=300w`) into new empty temp directories and check `file` output first.
- [ ] **Step 5: Run `python3 -I scripts/check.py`.** Expected: `OK`.
- [ ] **Step 6: Negative check:** in a temp copy of `data/` + `assets/`, change one logo path to a wrong-case name; confirm the check reports it.
- [ ] **Step 7: Commit** — `git add assets/tracks data scripts && git commit -m "feat: track logo files, data and validation"`

### Task 2: Logo tile in schedule rows and Next Race box (test-first)

**Files:**
- Modify: `assets/js/render.test.html`, `assets/js/render.js`, `assets/js/main.js`, `assets/css/style.css`

**Interfaces:**
- Consumes: round `logo` (string path, optional).
- Produces in `render.js`: schedule rows (`renderSchedule`) and the Next Race feature (`renderNextRace`) render `<span class="row-logo"><img src="<escaped path>" alt="" data-logo></span>` as the first child, and the row `<li>` becomes `<li class="row box has-logo">` (feature: `<div class="box feature has-logo">`). Rounds without `logo` render unchanged. `renderResults` and `renderLatestResult` ignore `logo` (tile only when a new option `{ logo: true }` is passed to `raceSpans`/`row`/`feature` by the schedule and Next Race callers).
- Produces in `main.js`: the existing capture-phase `error` handler also does `img.closest(".row-logo")?.setAttribute("hidden", "")` when a `data-logo` image fails.

- [ ] **Step 1: Add failing tests** to `render.test.html` (names exact): `schedule row with logo renders a logo tile` (exact tile markup and `has-logo` class), `schedule row without logo renders no tile` (no `row-logo`, class stays `row box`), `logo path is escaped in the attribute` (a path with `"` and `<` never appears raw), `next race feature shows the logo tile`, `results rows never get a tile` (a result with `logo` set renders no `row-logo`), `latest result never gets a tile`.
- [ ] **Step 2: Run** (`python3 -m http.server 8000`, open `http://localhost:8000/assets/js/render.test.html`). Expected: the first, third and fourth tests FAIL; the others pass and guard behavior.
- [ ] **Step 3: Implement in `render.js`** per the interface (extend `raceSpans` options with `logo`, `row` and `feature` helpers with the `has-logo` class, and pass the option from `renderSchedule` and `renderNextRace` only).
- [ ] **Step 4: Re-run tests.** Expected: `ALL PASS`.
- [ ] **Step 5: Extend the `main.js` error handler** as specified.
- [ ] **Step 6: CSS:** `.row-logo` (square `72px`, `--black` background, flex-centered, `padding: 8px`, `flex-shrink: 0`), `.row-logo img` (`width: 100%; height: 100%; object-fit: contain`), `.row.has-logo` grid with an extra leading `72px` column (`72px minmax(0, 15rem) minmax(0, 1fr) minmax(0, 1fr)`) and `align-items: center`, `.feature.has-logo` laying the tile above or beside the text in a way that fits the box, and at `max-width: 720px` the tile at `56px` stacked above the row's text. Hidden tiles stay hidden (`[hidden]` rule exists).
- [ ] **Step 7: Verify in browser** `/schedule/` and `/` at desktop and 375px, then at 320px with a temporary 50-character venue; confirm the Mid-Ohio tile looks contained and legible; temporarily point one logo at a wrong path and confirm the tile disappears and the row keeps its layout; restore everything. `python3 -I scripts/check.py` (expected `OK`).
- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: track logo tiles on schedule rows and Next Race box"`

### Task 3: README, credits and final verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README:** document the optional `logo` field in the schedule example (path under `/assets/tracks/`, tile shown on schedule and Next Race), and add to Credits that track logos belong to their circuits and are used to identify the venues.
- [ ] **Step 2: Final verification.** All six pages at desktop and 375px: no console errors, no horizontal scroll; `render.test.html` shows `ALL PASS`; `python3 -I scripts/check.py` exits 0; `git status` clean except intended files.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "docs: track logo field and credits"`

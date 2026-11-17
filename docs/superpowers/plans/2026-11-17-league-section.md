# League Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a league box (logos, facts, Pro-AM race-day timeline, links, partners) to the top of the Schedule page, and show race time with time zone on every round.

**Architecture:** New `data/league.json` rendered by a new `renderLeague(data)` in `render.js` into a `data-render="league"` container; schedule rows and the Next Race box get an optional time label and time zone read from `data/schedule.json`. `scripts/check.py` validates the new file. All markup/CSS reuses the existing `.box`, `.btn`, `.rows` styles.

**Tech Stack:** HTML, CSS, vanilla JS (ES modules), JSON, Python 3 check script. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-17-league-section-design.md`

## Global Constraints

- Static site, no build step, no JS libraries; root-absolute paths (`/assets/...`, `/data/...`).
- League box is a dark (`--black`) header strip holding the logos (white artwork) plus an outlined `.box` body; square corners, no shadows; Rajdhani for headings/labels, system font for body; primary link is a green `.btn`.
- Eric is **Pro-AM**; all times Eastern, shown as "ET". Timeline: Practice 6:00 PM, Qualifying 7:00 PM, Race 7:10 PM, Broadcast 7:00 to 10:00 PM. Never show Pro-division times.
- Seed facts: League "The League", presented by Foxxtecca, Season 04, GT3, Pro-AM, 8 rounds, Tuesdays, $6,800 prize pool. Partners: Apex Racing TV (broadcast), Dakin Design (liveries), Superlap (sim center), The Roasted Record (fuel).
- Links: Watch live (primary) `https://www.youtube.com/@FoxxteccaStudios`; League site `https://foxxtecca.com/league`; League Discord `https://discord.com/invite/kPXwQfwpdQ`. No sign-up link.
- Include a "not affiliated" line; logos belong to their owners (noted in README).
- Logo files: `assets/logos/foxxtecca-logo.webp`, `assets/logos/apex-racing-logo.webp` (WebP content; both white on transparent, legible only on dark).
- Text contrast >= 4.5:1, focus visible on all links, no horizontal scroll at 320px; `python3 -I scripts/check.py` and `render.test.html` (ALL PASS) stay green.
- `schedule/index.html` is edited directly. The old page generator lived in a scratch folder and is not part of the repo; do not re-run it.

## Review Focus

- `league.json` missing or malformed: only the league section shows "Couldn't load this section."; the round rows below still render.
- Missing optional league fields (no tagline, facts, links, partners, logos, disclaimer): no empty box parts, stray separators or "undefined".
- A league link with a non-https URL (e.g. `javascript:`, `www.x.com`) is not rendered as a link, and `check.py` rejects it.
- A logo file that 404s: the dark strip shows the league/partner name as readable light text, not a collapsed or invisible image.
- Long partner or link labels wrap inside the box at 320px with no overflow; the timeline rows stay readable.
- `timeZone` set but a round has no `time` (or the reverse): no stray "ET" or label alone in the row.

## File Structure

- `data/league.json`: league content.
- `data/schedule.json`: adds top-level `timeLabel`, `timeZone`; each round's `time` becomes `19:10`.
- `assets/logos/`: two WebP logos.
- `assets/js/render.js`: `renderLeague`; time label/zone in `raceSpans`.
- `assets/js/render.test.html`: tests.
- `assets/js/main.js`: maps `league` to `/data/league.json`.
- `schedule/index.html`: adds the league container above the rounds.
- `assets/css/style.css`: league styles.
- `scripts/check.py`: `check_league`.
- `README.md`: league editing and logo credit.

---

### Task 1: League data, logos and validation

**Files:**
- Create: `data/league.json`, `assets/logos/foxxtecca-logo.webp`, `assets/logos/apex-racing-logo.webp`
- Modify: `data/schedule.json`, `scripts/check.py`

**Interfaces:**
- Produces `data/league.json` shape: `{"name": str, "season": str, "presentedBy": str?, "tagline": str?, "facts": [{"label": str, "value": str}]?, "timeline": [{"label": str, "time": str}]?, "timeZone": str?, "links": [{"label": str, "url": str, "primary": bool?}]?, "partners": [{"role": str, "name": str}]?, "logos": [{"name": str, "src": str}]?, "disclaimer": str?}`.
- Produces `data/schedule.json` additions: top-level `"timeLabel": "Race"`, `"timeZone": "ET"`; every round `"time": "19:10"`.
- Produces `check_league(root) -> list[str]` in `scripts/check.py`, called from `main()`.

- [ ] **Step 1: Write `check_league`** (before creating `league.json`): reports missing file; missing `name`/`season`; any `links[].url` not starting with `https://`; any `logos[].src` file not found with exact-case match (reuse the exact-case approach in `check_data`); `timeline[].time` and fact values being non-empty strings.
- [ ] **Step 2: Run `python3 -I scripts/check.py`.** Expected: exit 1 with `data/league.json: missing`.
- [ ] **Step 3: Copy the logos** from the scratch downloads into `assets/logos/` with `.webp` names (`foxxtecca-logo.png` -> `foxxtecca-logo.webp`, `apex-racing-logo.png` -> `apex-racing-logo.webp`); `file` on each must report `Web/P image`. If the scratch files are gone, re-download them from the league site's CDN URLs listed at https://foxxtecca.com/league (Foxxtecca site logo and the "header apex racing logo"), saving into a new empty temp directory first and checking `file` output.
- [ ] **Step 4: Create `data/league.json`** with the seed values from Global Constraints (timeline entries in order: Practice 6:00 PM, Qualifying 7:00 PM, Race 7:10 PM, Broadcast 7:00 PM - 10:00 PM; `timeZone: "ET"`; logos `Foxxtecca` and `Apex Racing`; disclaimer "Pon Di Gas Motorsport is not affiliated with Foxxtecca or Apex Racing. Logos belong to their owners."). Update `data/schedule.json` with `timeLabel`, `timeZone` and `time: "19:10"` on all eight rounds.
- [ ] **Step 5: Run `python3 -I scripts/check.py`.** Expected: `OK`.
- [ ] **Step 6: Negative checks.** In a temp copy of `data/`, set a link URL to `javascript:alert(1)`, then to `www.x.com`, then a logo `src` to a wrong-case filename; confirm `check_league` reports each (use the same temp-dir import technique used for earlier check tests).
- [ ] **Step 7: Commit** — `git add data assets/logos scripts && git commit -m "feat: league data, logos and validation"`

### Task 2: Race time with label and zone in rows (test-first)

**Files:**
- Modify: `assets/js/render.test.html`, `assets/js/render.js`

**Interfaces:**
- Consumes: `data.timeLabel?: string`, `data.timeZone?: string` on the schedule data object passed to `renderSchedule(data, today)` and `renderNextRace(data, today)`; round `time` ("HH:MM", 24-hour).
- Produces: schedule rows and the Next Race feature show `<span class="row-date">Tue, Nov 24, 2026 · Race 7:10 PM ET</span>`. Rules: label and zone are included only when the round has a valid `time`; label before the time, zone after it. Result rows are unchanged.

- [ ] **Step 1: Add failing tests** to `render.test.html` (names exact): `schedule row shows label, time and zone` (`{timeLabel:"Race", timeZone:"ET"}` + `time:"19:10"` yields `Race 7:10 PM ET`), `time without label or zone shows only the time` (yields `6:00 PM` and no `ET`), `zone without a round time shows no zone or label` (no `ET`, no `Race`), `next race feature shows label, time and zone`.
- [ ] **Step 2: Run** (`python3 -m http.server 8000`, open `http://localhost:8000/assets/js/render.test.html`). Expected: the first and fourth tests FAIL; the others may pass already (they guard behavior).
- [ ] **Step 3: Implement in `raceSpans`** (render.js): pass the label and zone from `data` into the schedule row/feature builders (extend `row` and `feature` call sites in `renderSchedule` and `renderNextRace`; `renderResults` and `renderLatestResult` pass nothing); build the time text as `[label, formatTime(time), time ? zone : ""]` joined by spaces, empty when `formatTime` is empty.
- [ ] **Step 4: Re-run.** Expected: `ALL PASS`.
- [ ] **Step 5: Verify in browser** `/schedule/` and `/`: rows and the Next Race box read "Tue, Nov 24, 2026 · Race 7:10 PM ET". Run `python3 -I scripts/check.py` (expected `OK`).
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: race time with label and time zone"`

### Task 3: League box (test-first)

**Files:**
- Modify: `assets/js/render.test.html`, `assets/js/render.js`, `assets/js/main.js`, `assets/css/style.css`, `schedule/index.html`

**Interfaces:**
- Consumes: `data/league.json` shape (Task 1).
- Produces `renderLeague(data) -> string` (exported; all text escaped). Markup: `<section class="league box">` containing, in order and each only when its data exists: `<div class="league-strip">` with one `<img data-logo class="league-logo" src alt=name>` plus `<span class="visually-hidden">name</span>` per logo (same fallback pattern as sponsors); `<div class="league-body">` with `<h2>` name + season, presenter line, tagline `<p>`, facts `<dl class="facts">`, timeline `<ol class="timeline">` of `<li><span>label</span><span>time ET</span></li>` (zone appended to each time only when `timeZone` is set), links `<p class="links">` (primary link as `<a class="btn" ...>`, others as `<a class="box" ...>`, all `rel="noopener"`), partners `<ul class="partners">`, disclaimer `<p class="disclaimer">`. Links whose url does not start with `https://` are skipped.
- Produces: `main.js` entry `league` rendered from `/data/league.json` (add to both the `sections` and `source` maps); `schedule/index.html` gets `<div data-render="league"><p class="empty">Loading…</p></div>` as a section above the rounds.

- [ ] **Step 1: Add failing tests** (names exact): `league renders name and season`, `league facts render as definition list`, `league timeline appends the time zone`, `league omits timeline when absent`, `league escapes html in text`, `league skips links with non-https urls`, `league primary link is a green button`, `league logo has name fallback text` (`data-logo` and `visually-hidden` name), `league with only name and season renders without undefined`, `empty league object renders nothing`.
- [ ] **Step 2: Run tests.** Expected: all ten FAIL (function missing).
- [ ] **Step 3: Implement `renderLeague`** per the interface; return `""` when `name` and `season` are both absent.
- [ ] **Step 4: Re-run tests.** Expected: `ALL PASS`.
- [ ] **Step 5: Wire `main.js` and `schedule/index.html`**; confirm the container is above the rounds.
- [ ] **Step 6: Write the CSS**: `.league` (no padding on the box itself), `.league-strip` (`--black` background, flex, gap, padding, logos `height: 40px; width: auto`, fallback name text in `--on-photo`), `.league-body` (padding, grid gap), `.facts` (two-column definition grid on desktop, one column on phones), `.timeline` (ruled rows, label left, time right, `overflow-wrap: anywhere`), `.links` (flex wrap, gap), `.partners` (small text list), `.disclaimer` (small, `--muted`). Heading in Rajdhani.
- [ ] **Step 7: Verify in browser** `/schedule/` at desktop, 375px and 320px: logos visible on the dark strip, facts and timeline legible, buttons focusable (Tab) with visible focus, no horizontal scroll, long partner/link labels wrap. Temporarily break the logo path (use a wrong-case filename in `league.json`) and confirm the strip shows the logo names as light text; restore. Temporarily rename `data/league.json` and confirm only the league section shows the error while the rounds below render; restore. `python3 -I scripts/check.py` (expected `OK`).
- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: league box on the schedule page"`

### Task 4: README, credits and final verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README:** document `data/league.json` (field list with a short example), the schedule file's `timeLabel`/`timeZone`, and a "Credits" note that the Foxxtecca and Apex Racing logos belong to their owners and are used with the owner's OK to identify the league.
- [ ] **Step 2: Final verification.** All six pages at desktop and 375px: no console errors, no horizontal scroll; the Next Race box on Home reads "Race 7:10 PM ET"; `render.test.html` shows `ALL PASS`; `python3 -I scripts/check.py` exits 0; `git status` clean except intended files.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "docs: league data, time zone and logo credits"`

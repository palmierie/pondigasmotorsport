# Pon Di Gas Motorsport

Static team site (results, schedule, sponsors) published with GitHub Pages. No build step.

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
python3 -I scripts/check.py   # validate data files and local links
```

Render tests: open `http://localhost:8000/assets/js/render.test.html` and look for `ALL PASS`.

## Updating content

Edit the JSON files in `data/`, then run `scripts/check.py` before pushing. Dates are `YYYY-MM-DD`.

**Add a result** (`data/results.json`, inside the season's `races`; create a new season object for a new year):
```json
{ "event": "Round 3", "venue": "Example Raceway", "date": "2026-07-18", "class": "Class A", "position": "P2", "notes": "Optional", "photo": "/assets/photos/round3.jpg", "logo": "/assets/tracks/example-raceway.webp", "watch": "https://www.youtube.com/watch?v=VIDEO_ID" }
```
`class`, `position`, `notes`, `photo`, `logo` and `watch` are optional. The `logo` (a track logo from `assets/tracks/`) shows in the home page's Latest Result box; the Results page rows don't show logos.

**Add a race to the schedule** (`data/schedule.json`). Past races drop off automatically:
```json
{ "event": "Round 4", "venue": "Sample Circuit", "date": "2027-09-04", "time": "18:00", "endDate": "2027-09-05", "link": "https://example.com", "logo": "/assets/tracks/sample-circuit.webp", "watch": "https://www.youtube.com/watch?v=VIDEO_ID" }
```
`time` (24-hour `HH:MM`, shown as e.g. 6:00 PM), `endDate`, `link`, `logo` and `watch` are optional. `logo` is a track logo from `assets/tracks/`, shown in a dark square tile on the Schedule page and in the Next Race box (logos should be artwork made for dark backgrounds; `scripts/check.py` reports a missing or wrong-case file). A time zone and label are shown next to `time` only if the top of the file sets `timeZone` and `timeLabel` (see "League info" below).

**Watch buttons.** Every race item (Schedule rows, Results rows, and the home page's Next Race and Latest Result cards) has a green button that opens YouTube in a new tab: "Watch" on schedule items, "Watch replay" on results items. The link is the round's own `watch` if it has one, otherwise the `watchUrl` at the top of the file (schedule: the channel's live page, results: its streams page). Only `https://` links are used, and `scripts/check.py` reports anything else. With no `watch` and no `watchUrl`, an item shows no button.

**Add a sponsor** (`data/sponsors.json`). Put the logo in `assets/logos/`:
```json
{ "name": "Acme", "logo": "/assets/logos/acme.svg", "url": "https://acme.example", "tier": "Major" }
```
Without a `logo`, the name is shown as text.

## Updating with Claude (copy-paste prompts)

Open this project in Claude Code, paste one of the prompts below and fill in the `<angle brackets>`. Claude follows this README, works on a branch, runs `scripts/check.py`, previews the pages and tells you what changed. Nothing goes live until you reply "Merge and push".

**How the site decides what to show**
- **Schedule page and Next Race box:** the rounds in `data/schedule.json` that haven't happened yet, soonest first. A finished round drops off by itself once its date has passed.
- **Latest Result box (home page):** the entry in `data/results.json` with the most recent date, even if its position says "Upcoming". The Results page lists every entry, newest first.
- **Watch buttons:** every race item links to the round's `watch` URL, or the file's default `watchUrl` if the round has none.
- **Track logos:** files in `assets/tracks/` (`road-atlanta`, `mid-ohio`, `monza`, `nurburgring`, `sonoma`, `brands-hatch`, `daytona`, `watkins-glen`). A new track needs its own logo file there.

**After a race: record the result**
```text
Read the README. In data/results.json, record <Round N> at <track> on <YYYY-MM-DD>: I finished <P3 / DNF / DSQ> in <class, e.g. GT3 Pro-AM>. Optional note: <note>. If there is already an "Upcoming" entry for this round, update it and keep its track logo and watch link; optional YouTube replay link for this race: <URL>, set as its "watch"; otherwise add a new entry with the track's logo from assets/tracks/. Run scripts/check.py, preview the home page and the Results page, and tell me what changed. Don't merge until I say so.
```

**Show the next race as "Upcoming" in Latest Result**
```text
Read the README. Add <Round N> at <track> on <YYYY-MM-DD> to data/results.json with class <class>, position "Upcoming" and the track's logo from assets/tracks/, the same way the existing Upcoming entry was done. Remember it becomes the Latest Result box because it has the newest date. Run scripts/check.py, preview the home page and tell me what changed. Don't merge until I say so.
```

**Add rounds to the schedule**
```text
Read the README. Add these rounds to data/schedule.json: <Round, date, track, race time (e.g. 7:10 PM ET)>, <next round...>. Use the track logos in assets/tracks/. If any track has no logo yet, stop and tell me which ones so I can add them. Optional YouTube stream link for each round: <URL per round, or leave blank to use the default>, set as "watch". Keep the existing timeLabel, timeZone and watchUrl. Run scripts/check.py, preview the Schedule page and the Next Race box on the home page, and tell me what changed. Don't merge until I say so.
```

**Change a round (date, time or track)**
```text
Read the README. In data/schedule.json, change <Round N> to <new date / new race time / new track>. If the track changes, switch to that track's logo in assets/tracks/. Run scripts/check.py, preview the Schedule page and the home page, and tell me what changed. Don't merge until I say so.
```

**Start a new season or league**
```text
Read the README. I'm starting <league name, season, class, division>. Update data/league.json with this info: <facts, race-day times, links, partners>. Replace the rounds in data/schedule.json with these: <list of rounds, dates, tracks, race time>. Keep last season's finished rounds in data/results.json under the right year, and don't delete any results. Use track logos from assets/tracks/ and tell me which tracks are missing one. Run scripts/check.py, preview the Schedule page, the Results page and the home page, and tell me what changed. Don't merge until I say so.
```

**Tips**
- Say the finish exactly as it should appear (`P3`, `DNF`, `DSQ`); the site shows it as typed.
- To add a photo to a result, put the file in `assets/photos/` (lowercase, no spaces) and give Claude the filename.
- After the site goes live, browsers can cache files for about 10 minutes. If a page looks wrong, do a hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows).

## Home hero video

The home page hero plays a muted, looping video over the photo (`--hero-img`, which stays as the fallback). `assets/js/hero-video.js` picks the file: `assets/video/hero-720p.mp4` on phones, `hero-1080p.mp4` by default, and `hero-1440p.mp4` on big monitors (1600px wide or more) and retina laptops. Visitors who ask their device for reduced motion or data saving get the photo and download no video. The video also pauses while the hero is off screen.

To use a different clip, make three muted MP4s with ffmpeg and replace the files (keep the names). Put your source clips in `assets/video/candidates/`: that folder is git-ignored, so test files never get committed. Aim for about 1.5 MB (720p), 3 MB (1080p) and 4.5 MB (1440p) for a 14-second clip.

```bash
ffmpeg -i source-1440p.mp4 -an -c:v libx264 -preset slow -crf 28 -profile:v high -level 5.0 -pix_fmt yuv420p -movflags +faststart hero-1440p.mp4
ffmpeg -i source-1080p.mp4 -an -c:v libx264 -preset slow -crf 28 -profile:v high -pix_fmt yuv420p -movflags +faststart hero-1080p.mp4
ffmpeg -i source-1080p.mp4 -an -vf scale=1280:-2 -c:v libx264 -preset slow -crf 28 -profile:v high -pix_fmt yuv420p -movflags +faststart hero-720p.mp4
```

A higher `-crf` number gives a smaller, softer file. WebM was tested and was not smaller than these MP4s at the same quality, so it is not used.

## Watch page

`watch/index.html` has one card per YouTube channel (Foxxtecca, Apex Racing TV, Eric Palmieri). To add or change a channel, copy one `<li>` in the `watch-grid` list and edit its link, name and description. Keep `target="_blank" rel="noopener"` on external links; `scripts/check.py` reports any that are missing. The nav and footer link to `/watch/` on every page.

## League info

`data/league.json` drives the league box at the top of the Schedule page. Every field except `name`/`season` is optional:

```json
{
  "name": "The League", "season": "Season 04", "presentedBy": "Presented by Foxxtecca",
  "tagline": "Short description.",
  "facts": [{ "label": "Class", "value": "GT3" }],
  "timeline": [{ "label": "Race", "time": "7:10 PM" }],
  "timeZone": "ET",
  "links": [{ "label": "Watch live", "url": "https://example.com", "primary": true }],
  "partners": [{ "role": "Broadcast", "name": "Apex Racing TV" }],
  "logos": [{ "name": "Foxxtecca", "src": "/assets/logos/foxxtecca-logo.webp" }],
  "disclaimer": "Not affiliated."
}
```

Link URLs must start with `https://` (other links are skipped, and `scripts/check.py` reports them). Logos shown in the dark strip should be white artwork. For a new season, update `data/league.json` and the rounds in `data/schedule.json`.

In `data/schedule.json`, the optional top-level `timeLabel` ("Race") and `timeZone` ("ET") are shown next to each round's `time`, e.g. "Race 7:10 PM ET".

The race-day times came from https://foxxtecca.com/league, which has typos in its time labels. Confirm them in the league's Discord or broadcast.

### Credits

The Foxxtecca and Apex Racing logos, and the track logos in `assets/tracks/`, belong to their owners (the league, its partners and the circuits) and are used to identify the league and venues Pon Di Gas Motorsport races at. Pon Di Gas Motorsport is not affiliated with either company.

## Styling

All styling is in `assets/css/style.css`. Colors and fonts are tokens at the top (`:root`): `--page`, `--ink`, `--green`, `--gold`, `--lion-red`, `--font-heading` (Rajdhani) and `--font-body`. The home hero photo is `--hero-img`; the banner on every other page (Watch, Results, Schedule, Sponsors, Team, Contact) sets its own `--hero-img` and `--hero-pos` on `.hero-page`. The faint white lion on the home hero is `.hero-lion` (`assets/brand/lion-white.svg`); its size, position and opacity are set there. A faint color lion (`assets/brand/lion-color.svg`) sits bottom-right behind every page, set by `body::before` at the end of `assets/css/style.css`; the heroes and footer cover it, and its opacity is `.09`. Outlined boxes with corner dots use the `.box` class; the schedule and results lists are `.rows`; sponsors are `.cells`.

## Placeholders to replace

- Hero copy and "Who we are" text
- All seed data in `data/` (results, schedule, sponsors)
- No contact email is published yet. When you add one, put a `mailto:` link on the Contact page and the Sponsors "Partner with us" button

## Publishing on a custom domain

Pages are linked from the site root (`/assets/...`), so the site renders correctly only at a domain root such as your custom domain. The default `<username>.github.io/pondigasmotorsport/` address will show an unstyled page until the custom domain is set up.

1. Create a file named `CNAME` in the repo root containing only your domain, e.g. `www.example.com`.
2. At your domain registrar, add DNS records:
   - Apex domain (`example.com`): four **A** records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - `www`: a **CNAME** record to `<your-github-username>.github.io`.
3. On GitHub: repo **Settings → Pages → Build and deployment**: source "Deploy from a branch", branch `main`, folder `/ (root)`.
4. Enter the custom domain in the same Pages settings and wait for the DNS check, then tick **Enforce HTTPS**.

DNS changes can take up to a few hours to take effect.

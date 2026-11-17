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
{ "event": "Round 3", "venue": "Example Raceway", "date": "2026-07-18", "class": "Class A", "position": "P2", "notes": "Optional", "photo": "/assets/photos/round3.jpg" }
```
`class`, `position`, `notes` and `photo` are optional.

**Add a race to the schedule** (`data/schedule.json`). Past races drop off automatically:
```json
{ "event": "Round 4", "venue": "Sample Circuit", "date": "2027-09-04", "time": "18:00", "endDate": "2027-09-05", "link": "https://example.com", "logo": "/assets/tracks/sample-circuit.webp" }
```
`time` (24-hour `HH:MM`, shown as e.g. 6:00 PM), `endDate`, `link` and `logo` are optional. `logo` is a track logo from `assets/tracks/`, shown in a dark square tile on the Schedule page and in the Next Race box (logos should be artwork made for dark backgrounds; `scripts/check.py` reports a missing or wrong-case file). A time zone and label are shown next to `time` only if the top of the file sets `timeZone` and `timeLabel` (see "League info" below).

**Add a sponsor** (`data/sponsors.json`). Put the logo in `assets/logos/`:
```json
{ "name": "Acme", "logo": "/assets/logos/acme.svg", "url": "https://acme.example", "tier": "Major" }
```
Without a `logo`, the name is shown as text.

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

All styling is in `assets/css/style.css`. Colors and fonts are tokens at the top (`:root`): `--page`, `--ink`, `--green`, `--gold`, `--lion-red`, `--font-heading` (Rajdhani) and `--font-body`. The hero photo is `--hero-img`. Outlined boxes with corner dots use the `.box` class; the schedule and results lists are `.rows`; sponsors are `.cells`.

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

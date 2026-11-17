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
{ "event": "Round 4", "venue": "Sample Circuit", "date": "2027-09-04", "endDate": "2027-09-05", "link": "https://example.com" }
```
`endDate` and `link` are optional.

**Add a sponsor** (`data/sponsors.json`). Put the logo in `assets/logos/`:
```json
{ "name": "Acme", "logo": "/assets/logos/acme.svg", "url": "https://acme.example", "tier": "Major" }
```
Without a `logo`, the name is shown as text.

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

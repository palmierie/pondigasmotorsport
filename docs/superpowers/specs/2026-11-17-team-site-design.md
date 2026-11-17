# Pondigas Motorsport Team Site: Design

## Intent
A static racing-team website showing results, schedule and sponsors, published on GitHub Pages at the owner's custom domain. Audience: fans, sponsors and prospective sponsors.

## Goals
- Clean, photo-led, spacious look modelled on https://tekt.com.au/ (layout and style only; no copied text or images).
- Results and schedule are updated by editing data files, not HTML.
- Works on phones; fast; no build step.
- Custom domain with HTTPS.

## Non-goals / anti-goals
- No backend, CMS, accounts or form handling.
- No Node tooling or build pipeline.
- Must not look loud or cluttered; must not reuse Tekt's content or imagery.

## Approaches considered
1. **Plain HTML/CSS/JS + JSON data (chosen).** Simplest, no tooling. Trade-offs: header/footer repeated per page; results rendered client-side.
2. Eleventy + GitHub Actions. Cleaner templating and SEO, but adds tooling to maintain. Revisit if the site grows.
3. Jekyll. No advantage over option 2 here.

## Design
- **Pages:** Home (hero, short about, next race, latest result, sponsor logos), Results (by season), Schedule (upcoming calendar), Sponsors (logo grid + "partner with us" call to action linking to email), Team/About (drivers, crew), Contact (email + social links only, no form).
- **Structure:** `index.html`, `results/`, `schedule/`, `sponsors/`, `team/`, `contact/`; shared `assets/css/style.css`, `assets/js/` (renders results/schedule from JSON), `data/results.json`, `data/schedule.json`, `data/sponsors.json`; `assets/logos/`, `assets/photos/`.
- **Header/footer:** duplicated in each page (accepted trade-off of option 1).
- **Domain:** `CNAME` file in repo root; DNS records at the registrar (set by the owner; exact records provided at build time); enable HTTPS in Pages settings.
- **Deploy:** GitHub Pages from `main`, root folder.
- **Style:** generous whitespace, large photography, card grids, simple top nav, numbered/stacked sections as on the reference site.

## Inputs needed from owner
Team name as displayed, logos (`assets/logos/`), photos (`assets/photos/`), domain name, social links, contact email, initial results and schedule data.

## Left to the builder
Exact colours and fonts (neutral, clean, tuned to the logos), responsive breakpoints, placeholder content until real data and photos arrive.

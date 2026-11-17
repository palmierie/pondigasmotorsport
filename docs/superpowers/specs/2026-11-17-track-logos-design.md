# Track Logos on the Schedule: Design

## Intent
Show each round's track logo next to the round on the Schedule page (and in the home page's Next Race box), using the logos the league publishes at https://foxxtecca.com/league.

## Goals
- A logo tile for each round, easy to update for a new season (data edit).
- Logos stay legible: they are artwork made for dark backgrounds (white text, red/blue accents).
- Same visual language as the rest of the site.

## Non-goals / anti-goals
- No logos in the Results page rows for now.
- Must not break a row if a logo is missing or fails to load.

## Approaches considered
1. **Dark square tile with the logo, at the left of each row and the Next Race box (chosen).** Matches the league box's dark logo strip; every logo stays legible.
2. Recolor logos to dark via CSS: ruins colored logos (Monza, Brands Hatch).
3. A separate logo grid in the league box: logos not next to their rounds.

## Design (my calls, for approval)
- **Assets:** eight WebP files (300x300, transparent; 10 to 32 KB each, about 134 KB total) downloaded from the league's CDN with the owner's OK into `assets/tracks/`: `road-atlanta.webp`, `mid-ohio.webp`, `monza.webp`, `nurburgring.webp`, `sonoma.webp`, `brands-hatch.webp`, `daytona.webp`, `watkins-glen.webp`. All checked visually; all legible on dark.
- **Data:** optional `"logo": "/assets/tracks/<name>.webp"` on each round in `data/schedule.json`.
- **Rendering:** rounds with a `logo` get a leading square dark (`--black`) tile (about 72px on desktop, 56px on phones) holding the logo, contained and centered, with `alt=""` (the venue name is already in the row). Rounds without one render as today. The Next Race feature box shows the same tile.
- **Failure handling:** if a logo fails to load, the whole tile is hidden (the row keeps its text). Reuses the existing `data-logo` error handler in `main.js`, extended to hide the tile.
- **Checks/tests:** `scripts/check.py` validates `schedule.json` logo paths (exact-case file existence); `render.test.html` gets tests for tile present, tile absent, and escaping.
- **README/credits:** document the field; credit that track logos belong to their circuits and are used to identify the venues.

## Constraints
Static, no build step; keep accessibility rules (no 320px overflow, contrast, focus), restyle tokens; `scripts/check.py` and render tests stay green.

## Left to the builder
Exact tile/row grid layout at each breakpoint; logo padding inside the tile.

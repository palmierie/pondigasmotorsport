# Restyle to match tekt.com.au: Design

## Intent
The first build copied Tekt's page structure but not its look. Restyle the site so it reads like https://tekt.com.au/ (calm, architectural, photo-led), using Pon Di Gas brand colors and Rajdhani for display type.

## What Tekt actually does (observed in a browser)
- Full-viewport hero photo with the headline on the photo; header is transparent and floats over it.
- Header is drawn as thin outlined boxes (logo box, one box per nav item) with small square dots at the box corners ("blueprint" look); boxes fill pale once the page scrolls.
- The same 1px outlined boxes with corner dots hold accordion lists and cards. Square corners everywhere, no shadows.
- Pale blue-grey page (#ECF1F4), dark text, light text on photos (#D0DBE4), pale buttons.
- Small left-hand labels with large, tightly set text to the right; very generous vertical spacing; a fixed bottom-left "Get in Touch" button.

## Goals
- Same visual language as above, applied to every page (Home, Results, Schedule, Sponsors, Team, Contact).
- Brand colors as accents; Rajdhani for titles, nav, buttons, labels; system font for body text.
- Still static, no build step, accessible, works at phone width.

## Non-goals / anti-goals
- Do not copy Tekt's text, images or fonts. Do not add animation libraries or any JS beyond the existing nav toggle and data rendering.
- Must not reduce contrast below WCAG AA for text.

## Approaches considered
1. CSS-only restyle of existing markup: cheapest, but the outlined header and corner-dot boxes need new markup.
2. **Restyle CSS and adjust markup per page (chosen):** new header structure, box wrappers, hero layout; JS render output gets box classes. Moderate work, closest result.
3. Rebuild with a framework: more than a six-page site needs.

## Design (my calls, for approval)
- **Fonts:** Rajdhani SemiBold/Bold (already in `assets/fonts/`) for h1-h4, nav, buttons, labels, dates. Body: system UI stack. No new font files.
- **Colors (tokens):** page `#ECF1F4`; text and 1px lines `#111111`; text on photos `#ECF1F4`; **buttons: brand green `#009B3A`, white text, Rajdhani SemiBold >= 19px (meets AA large-text contrast)**; gold `#FED100` for small highlights on dark areas only (low contrast on pale grey); lion red `#D80530` for rare highlights (e.g. a win). Footer `#111111`.
- **Header:** fixed, transparent over the hero; logo in an outlined box using the dark logo variant, one outlined box per nav link, corner dots; once scrolled, boxes gain a pale fill and the light logo variant. Mobile: logo box plus a Menu box that opens a stacked list of boxes.
- **Hero:** full viewport height (`100svh`), photo as now with a light dark overlay, headline large and left-aligned in the lower-middle; emblem removed from hero (logo is in the header).
- **Sections:** label-left / content-right two-column layout on desktop, stacked on phones; ~120px vertical spacing desktop.
- **Components:** outlined box with corner dots for Next Race, Latest Result, each schedule race and result row, sponsor cells, team cards. Schedule and Results render as ruled rows (date, round, venue, time) rather than rounded cards.
- **Fixed button:** bottom-left, green, "Follow us on Instagram" linking to the Instagram profile; smaller on phones.
- **Footer:** near-black with the dark logo, nav, Instagram; square corners.

## Constraints
No build step; paths root-absolute; keep `scripts/check.py` and render tests passing (update tests for any changed render output); GitHub Pages deploy unchanged.

## Left to the builder
Exact spacing and type scale (tuned against screenshots of Tekt), corner-dot implementation (CSS pseudo-elements preferred), scroll-state toggle for the header (small existing-style JS), and responsive breakpoints.

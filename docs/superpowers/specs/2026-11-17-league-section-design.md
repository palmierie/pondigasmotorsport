# League Section on the Schedule Page: Design

## Intent
Eric Palmieri races for Pon Di Gas Motorsport in "The League" (presented by Foxxtecca), an iRacing GT3 series. Visitors to the Schedule page should understand which league the rounds belong to, when race day runs, and where to watch, without leaving the site.

Source: https://foxxtecca.com/league (read 2026-11-17).

## Goals
- A league box at the top of the Schedule page: logos, short description, key facts, the Pro-AM race-day timeline (Eastern time), links, partners.
- Each round shows its race time with time zone ("Race 7:10 PM ET"), on the Schedule page and the home page's Next Race box.
- League information lives in a data file so next season is an edit, not a code change.
- Same visual language as the rest of the site (outlined boxes, corner dots, Rajdhani headings, green buttons).

## Non-goals / anti-goals
- No live standings, results scraping or API calls.
- Must not look like the league's own site or imply an affiliation; include a short "not affiliated" line.
- No Pro-division times (Eric is Pro-AM).

## Approaches considered
1. **League box driven by `data/league.json`, rendered on the Schedule page (chosen).**
2. Separate League page in the nav: more room, but one more page and it splits the schedule from its context.
3. Hard-coded HTML on the Schedule page: fastest, but next season means editing markup.

## Design (my calls, for approval)
- **`data/league.json`:** `{ "name", "season", "presentedBy", "tagline", "facts": [{"label","value"}], "timeline": [{"label","time"}], "timeZone": "ET", "links": [{"label","url","primary"?}], "partners": [{"role","name"}], "logos": [{"name","src"}], "disclaimer" }`. Seed values from the league site: GT3, Pro-AM, 8 rounds, Tuesdays, Season 04, $6,800 prize pool; timeline Practice 6:00 PM, Qualifying 7:00 PM, Race 7:10 PM, Broadcast 7:00 to 10:00 PM (ET); partners Apex Racing TV (broadcast), Dakin Design (liveries), Superlap (sim center), The Roasted Record (fuel).
- **Links:** Watch live (Foxxtecca Studios on YouTube; primary green button), League site (foxxtecca.com/league), League Discord. No sign-up link (not the team's call).
- **`data/schedule.json`:** top-level optional `"timeLabel": "Race"` and `"timeZone": "ET"`; each round's `time` becomes the race start `19:10`. Rows read "Tue, Nov 24, 2026 · Race 7:10 PM ET".
- **`renderLeague(data) -> string`** in `render.js`, `data-render="league"` on the Schedule page. Layout: dark (`--black`) header strip holding the logos (they are white artwork), then an outlined box body with name/season, tagline, facts as a definition list, the timeline as ruled rows, links as buttons, partners and the disclaimer in small text. Empty/missing data renders nothing or the shown fields only; never "undefined".
- **Logos:** `assets/logos/foxxtecca-logo.webp` and `assets/logos/apex-racing-logo.webp` (downloaded from the league's site with the owner's OK; the CDN serves WebP, so the files are named `.webp`). Both are white on transparent and only legible on the dark strip. Logo credit/ownership noted in README.
- **Checks:** `scripts/check.py` validates `league.json` shape, `https` URLs and that logo files exist (exact case); `render.test.html` covers `renderLeague` and the time label/zone.

## Constraints
Static, no build step, no JS libraries; keep restyle tokens and accessibility rules (alt text on logos, 4.5:1 text contrast, focus visible, 320px layout); keep `scripts/check.py` and render tests green.

## Data caveats
- The league page has typos in its time labels; times are approximate and should be checked against the league's Discord/broadcast.
- Dates were checked: all eight are Tuesdays (Nov 24, 2026 to Jan 26, 2027).

## Left to the builder
Exact markup/CSS for the dark strip and timeline rows, link ordering, small-text styles.

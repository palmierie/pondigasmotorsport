# Watch Buttons on Race Items: Design

## Intent
Every race item links out to YouTube: Schedule rows, Results rows, the home page's Next Race card and Latest Result card.

## Goals
- A green "Watch" button on each item (label "Watch replay" on results items).
- Default links work now; exact per-race links can be pasted in later.
- Same look and behavior as the site's other buttons and external links.

## Non-goals / anti-goals
- No embedded video players; no YouTube API calls.
- The button must not be nested inside another link (schedule titles can already be links).

## Design (approved by the owner in conversation)
- **Data:** optional `watch` (https URL) on any round in `data/schedule.json` or `data/results.json`. Optional top-level default `watchUrl` in each file: schedule `https://www.youtube.com/@FoxxteccaOriginals/live`, results `https://www.youtube.com/@FoxxteccaOriginals/streams` (both checked, HTTP 200). A round's own `watch` overrides the default; no `watch` and no default means no button. Non-`https://` values are skipped when rendering and rejected by `scripts/check.py`.
- **Rendering:** a `.btn` link, `target="_blank" rel="noopener"`, with the hidden "(opens in a new tab)" note, as the last item of each row and card. Label "Watch" for schedule items and the Next Race card; "Watch replay" for results rows and the Latest Result card.
- **Layout:** at the right end of rows on desktop; on phones it drops below the text, left-aligned. In the home cards it sits under the text. Rows with a track-logo tile keep their tile layout. Results rows' meta and notes lines must not span under the button.
- **Checks/tests:** render tests first (button present, default vs override, absent when no link, non-https skipped, escaped, new-tab attributes, results label); `check.py` validates the URLs; browser checks at desktop, 375px and 320px with a long venue name.

## Constraints
Static, no build step; keep accessibility rules (focus visible, contrast of the green button at its font size, no nested links, no sideways scroll at 320px); `scripts/check.py` and render tests stay green.

## Left to the builder
Exact grid columns for rows with and without a tile, button size, how the home cards place the button.

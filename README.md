# Our Trips

A static site, no build step. Each trip is its own page under `trips/`,
and `index.html` lists them and does the leave-day math automatically.

## Structure

```
index.html                — home page: year-at-a-glance total, upcoming trips, past trips
style.css                 — shared styling for every page
trips/2027-brazil.html    — Brazil, 13 Mar–4 Apr 2027
trips/2027-bali.html      — Bali, 21 Jul–4 Aug 2027
trips/_template.html      — copy this to start a new trip
```

## Adding a new trip

1. Copy `trips/_template.html` to `trips/your-trip-name.html`.
2. Fill in the hero (flag, name, dates, one-line pitch, the two headline
   numbers) and the four accordions underneath (Flights, Weather & entry,
   Accommodation, Cost). Add a Safety accordion too if it's relevant, copy
   the one from `trips/2027-brazil.html` as a pattern.
3. If the trip has more than one date/route option worth comparing, copy
   the `.tabrow` + extra `.tabpane` blocks from `trips/2027-brazil.html`
   and adjust the `showOpt()` script's `data-*` attributes to match.
4. On `index.html`, copy one of the `<a class="trip-link">` cards inside
   `<div id="upcoming">`, point its `href` at your new file, and set
   `data-leave="X"` to that trip's leave days — the total at the top of
   the page recalculates from that attribute automatically, nothing else
   to update by hand.
5. Commit and push.

## Archiving a trip once it's happened

Cut its `<a class="trip-link">` card out of `<div id="upcoming">` and
paste it into `<div id="past">` on `index.html`, and add `archived` to
its class (`class="trip-link archived"`). Because the year total is
computed only from cards inside `#upcoming`, archiving a trip removes
it from that total automatically — there's no leave-day math to redo
by hand. The trip's own page doesn't need to change at all.

## Colors for a new trip

Two accent pairs already exist: `--brazil` (green) and `--bali`
(terracotta), each with a matching `.hero.___` / `___-page` pair in
`style.css`. Reuse one of those for a new trip, or add a third: copy
the `--brazil` / `--brazil-deep` lines in `:root`, and the handful of
`.brazil-page` / `.hero.brazil` rules, renaming them for the new trip.

## One-time setup (if you haven't already)

Push this folder to a GitHub repo, then on vercel.com "Add New Project",
import that repo, Framework Preset "Other", no build command, Deploy.
Every push to `main` after that redeploys automatically to the same URL.

## Editing with Claude

This chat surface can produce new file versions but can't push to
GitHub itself, no persistent repo access between conversations. For
"ask Claude to update something and it goes live," use Claude Code
against a local clone of this repo — it can run `git commit` and
`git push` directly.

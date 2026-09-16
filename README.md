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
4. On `index.html`, copy one of the `<a class="polaroid">` cards inside
   `<div id="trip-data">`, point its `href` at your new file, add `brazil`
   or `bali` to its class for one of the existing two colors (or add a
   third — see below), and set `data-leave`, `data-year`, and `data-end`
   (the trip's return date, as `YYYY-MM-DD`). Everything else — which
   section it shows in, the leave totals — is computed automatically
   from those attributes.
5. Commit and push.

## Archiving

There's no button for this and no manual step — a trip moves itself from
"Upcoming" to "Past trips" on its own, the moment its `data-end` date is
behind today's date. That's checked fresh every time the page loads, so
there's nothing to remember to do. It also means an archived trip drops
out of that year's leave total automatically, since the total only ever
counts what's currently showing as upcoming.

A manual "archive" button was the other option, but a plain static page
like this has nowhere to persist that click, no backend, nothing shared
between you and your partner's browsers, so it would only ever remember
on whichever device tapped it. Date-based beats that on every count here.

## Colors for a new trip

Two accent pairs already exist: `--brazil` (green) and `--bali`
(terracotta), each with a matching `.hero.___` / `___-page` pair in
`style.css`. Reuse one of those for a new trip's own page, or add a
third: copy the `--brazil` / `--brazil-deep` lines in `:root`, and the
handful of `.brazil-page` / `.hero.brazil` rules, renaming them for the
new trip.

`index.html` is separate from this — it's self-contained (its own
`<style>`, not `style.css`), so its polaroid colors don't have to match
a trip's own page. `brazil` and `bali` there currently map to mint and
yellow. A third trip can reuse either, or take its own color by adding
a class following the same pattern inside `index.html`'s `<style>`.

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

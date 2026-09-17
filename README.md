# Tripsy

A static site, no build step. Each trip is its own page under `trips/`,
and `index.html` lists them and does the leave-day math automatically.

## Structure

```
index.html                — home page: year-at-a-glance total, upcoming trips, past trips, "+ Add a trip"
add-trip.html             — quick-add form; posts to api/add-trip.js
api/add-trip.js           — serverless function: commits a new trip straight to this repo
style.css                 — shared styling for every trip page
trips/2027-brazil.html    — Brazil, 13 Mar–4 Apr 2027
trips/2027-bali.html      — Bali, 21 Jul–4 Aug 2027
trips/_template.html      — copy this to start a new trip by hand
```

## Adding a new trip

1. Copy `trips/_template.html` to `trips/your-trip-name.html`.
2. Fill in the hero (flag, name, dates, one-line pitch, the two headline
   numbers) and the four accordions underneath (Flights, Weather & entry,
   Accommodation, Cost). Add a Safety accordion too if it's relevant, copy
   the one from `trips/2027-brazil.html` as a pattern.
   In Flights, put a `.leg-price` line under every flight's `.leg-meta`
   (pp and both, same format as the Cost breakdown) — this is the standing
   convention now, not a one-off. Skip it for ground transport that isn't
   separately costed. If one fare covers a round trip in a single
   booking, price the outbound leg only and add "(covers the return too)"
   instead of repeating the number on the way back.
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

## Adding a trip from the app

`add-trip.html` (linked as "+ Add a trip" at the bottom of the home
page) is the quicker path — destination, dates, leave days, total
cost, one line on why. Submitting it calls `api/add-trip.js`, a small
serverless function that runs on Vercel, not in the browser, which
commits a new file under `trips/` and adds its card to `index.html`
directly in the GitHub repo. That commit triggers the same auto-deploy
as pushing by hand, so within roughly a minute the new trip is live
for anyone on any device, nothing is stored locally to just one
browser.

It picks a color automatically, cycling through the four themes
below, and it only captures the basics. The Flights, Weather & entry,
and Accommodation accordions come in as placeholders, the same "fill
in" shape as `_template.html`. Treat it as creating the skeleton, then
either edit that trip's page by hand the same way as the manual
process above, or open a chat with Claude (or Claude Code, if you want
it to commit directly) and ask it to flesh out a specific trip's
detail using the real numbers — same conventions apply, including the
`.leg-price` rule.

This needs a one-time setup before it'll work, since the function
needs permission to write to the repo on your behalf:

1. On GitHub: Settings &rarr; Developer settings &rarr; Personal
   access tokens &rarr; Fine-grained tokens &rarr; Generate new token.
   Scope it to this one repo only, and under Repository permissions
   give it **Contents: Read and write**. Nothing else.
2. On Vercel: this project &rarr; Settings &rarr; Environment
   Variables. Add `GITHUB_TOKEN` (the token you just made) and
   `GITHUB_REPO` (as `owner/repo`, e.g. `FelipeReis26/trip-planner`).
3. Redeploy once (Vercel &rarr; Deployments &rarr; Redeploy) so the
   function picks up the new variables.

The token only ever lives on Vercel's servers as an environment
variable; it's never sent to the browser, so it isn't visible in the
page source or dev tools the way anything in `index.html` or
`style.css` would be.

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

Four themes exist now: `brazil` (mint), `bali` (yellow), `pink`, and
`sky`, each with a matching `.hero.___` and `___-page` set of rules in
`style.css` (hero background, tab-active color, chip color). Adding a
trip from the app cycles through these four automatically based on
how many trip cards already exist, so you don't have to choose. Adding
one by hand, just pick any of the four and use its name as both the
hero class and the body class.

A fifth trip added by hand can reuse any of the four, or take its own
color: add a `--name` variable in `style.css`'s `:root`, then copy the
handful of `.hero.brazil` / `.brazil-page` rules, renaming them.
`api/add-trip.js`'s `THEMES` array would need the new name added too
if you want the app's auto-rotation to include it.

`index.html` is separate from this — it's self-contained (its own
`<style>`, not `style.css`) — so it has its own matching set of
`.polaroid.brazil` / `.polaroid.bali` / `.polaroid.pink` /
`.polaroid.sky` rules for the photo color on each card.

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

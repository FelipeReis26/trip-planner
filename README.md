# Tripsy

A static site, no build step. Each trip is its own page under `trips/`.
`trips.json` is the list of trips the home page reads and does the
leave-day math from — `index.html` itself has no trip data in it at
all, on purpose, so handing you a new `index.html` for a layout or
style change never risks overwriting a trip added through the app.

## Structure

```
index.html                — home page: fetches trips.json, renders cards, does the leave math
trips.json                — the trip list itself: one entry per trip, the actual source of truth
add-trip.html             — quick-add form; posts to api/add-trip.js
api/add-trip.js           — serverless function: adds a trip page + a trips.json entry
api/delete-trip.js        — serverless function: removes a trip page + its trips.json entry
style.css                 — shared styling for every trip page
trips/2027-brazil.html    — Brazil, 13 Mar–4 Apr 2027
trips/2026-qatar.html     — Qatar, 26 Nov–1 Dec 2026
trips/2026-st-louis.html  — St. Louis, 22–31 Oct 2026 (work trip)
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
4. Add an entry to `trips.json` — copy one of the existing objects in
   the array and adjust it: `slug` (matching your new filename, no
   `.html`), `theme` (`brazil`, `bali`, `pink`, or `sky` — see below),
   `flag`, `name`, `leave` (a number), `year`, `end` (the trip's return
   date, `YYYY-MM-DD`), and `meta` (the one-line summary shown on the
   card). Where it sits in the array decides display order among
   trips in the same section — everything else (which section it
   shows in, the leave totals) is computed automatically from `year`
   and `end`. `index.html` itself doesn't need touching for this.
5. Commit and push.

## Adding a trip from the app

`add-trip.html` (linked as "+ Add a trip" at the bottom of the home
page) is the quicker path — destination, dates, leave days, total
cost, one line on why. Submitting it calls `api/add-trip.js`, a small
serverless function that runs on Vercel, not in the browser, which
commits a new file under `trips/` and appends its entry to
`trips.json` — two separate commits, straight to the GitHub repo,
`index.html` is never touched. That triggers the same auto-deploy as
pushing by hand, so within roughly a minute the new trip is live for
anyone on any device, nothing is stored locally to just one browser.

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

## Deleting a trip

Every trip page has a small "Delete this trip" link at the bottom,
under the back link. It confirms once, then calls `api/delete-trip.js`
— the same kind of function as adding a trip, just the reverse: it
deletes `trips/{slug}.html` and removes that trip's entry from
`trips.json`, in one commit each. `index.html` is never touched here
either. Same redeploy delay as adding one, up to a minute before it's
gone from the home page too.

This uses the same `GITHUB_TOKEN` / `GITHUB_REPO` environment
variables as adding a trip — no separate setup needed if that's
already configured.

Building a trip by hand from `_template.html`? It already has the
button wired up, just update the slug and name in it to match.

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
how many entries `trips.json` already has, so you don't have to
choose. Adding one by hand, just pick any of the four and use its
name as both the hero class, the body class, and the `theme` value
in its `trips.json` entry.

A fifth trip added by hand can reuse any of the four, or take its own
color: add a `--name` variable in `style.css`'s `:root`, then copy the
handful of `.hero.brazil` / `.brazil-page` rules, renaming them.
`api/add-trip.js`'s `THEMES` array would need the new name added too
if you want the app's auto-rotation to include it.

`index.html` is separate from this — it's self-contained (its own
`<style>`, not `style.css`) — so it has its own matching set of
`.polaroid.brazil` / `.polaroid.bali` / `.polaroid.pink` /
`.polaroid.sky` rules for the photo color on each card, keyed off
each entry's `theme` value in `trips.json`.

## One-time setup (if you haven't already)

Push this folder to a GitHub repo, then on vercel.com "Add New Project",
import that repo, Framework Preset "Other", no build command, Deploy.
Every push to `main` after that redeploys automatically to the same URL.

## Password-protecting the site

Three files work together to gate the whole site behind one shared
password: `middleware.js` (repo root) runs before any page is served
and checks for a valid session cookie; `login.html` is the actual
login screen, styled to match the rest of the site rather than the
browser's plain native popup; `api/login.js` checks the password and
sets that cookie. Anyone without it gets redirected to `/login.html`,
and lands back on whichever page they originally asked for once
they're in.

To turn it on:

1. On Vercel: this project → Settings → Environment Variables. Add
   `SITE_PASSWORD` with whatever password you want, checked for at
   least Production.
2. Redeploy once (Deployments → latest → Redeploy) so it picks up the
   new variable.

The cookie holds a hash of the password, not the password itself,
and is `HttpOnly` (JavaScript on the page can't read it) and `Secure`
(HTTPS only). It lasts 30 days, so nobody's re-entering the password
every visit, just occasionally.

Until `SITE_PASSWORD` is set, `middleware.js` deliberately lets
requests through unauthenticated rather than lock everyone out with
a half-finished setup — so the site is genuinely open until you've
done the two steps above, not protected by default.

To change the password later, just update the environment variable's
value and redeploy — everyone's existing session cookie stops
matching automatically, no separate step needed. To remove protection
entirely, delete `SITE_PASSWORD` from Environment Variables (or
delete `middleware.js`) and redeploy.

## Editing with Claude

This chat surface can produce new file versions but can't push to
GitHub itself, no persistent repo access between conversations. For
"ask Claude to update something and it goes live," use Claude Code
against a local clone of this repo — it can run `git commit` and
`git push` directly.

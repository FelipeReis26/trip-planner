# Our Trips

A tiny static site for planning trips. No build step, no framework, just
HTML, CSS, and a little vanilla JS where a page needs interactive tabs
(like the Brazil options). That's deliberate: it means Vercel can deploy
it with zero configuration, and any future edit is just "change a file,
push it."

## One-time setup

1. Create a new GitHub repo (empty, no template).
2. Push this folder to it:
   ```
   git init
   git add .
   git commit -m "First trip: Brazil & Bali 2027"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. Go to vercel.com, "Add New Project," import that GitHub repo.
   Framework preset: "Other" (or it may auto-detect as a static site).
   No build command, no output directory needed. Click Deploy.
4. You now have a permanent URL (something like `our-trips.vercel.app`,
   or attach your own domain later in Vercel's settings).

## Every time after that

Any push to `main` redeploys automatically to the same URL, usually
live within about 30 seconds. There's nothing to re-import or reconfigure.

## Adding a new trip

1. Copy `trips/_template.html` to `trips/your-trip-name.html`.
2. Fill in the content — it uses the same building blocks as the
   Brazil & Bali page (`.timeline` for the itinerary, `.stats` for the
   quick numbers, `.block` + `.kv` for grouped detail like weather,
   entry requirements, or accommodation).
3. Add a card for it on `index.html`, under "Upcoming" — copy the
   existing `<a class="trip-link">` block and point the `href` at your
   new file.
4. Commit and push. That's the whole workflow.

## Archiving a trip once it's happened

Move its `<a class="trip-link">` card from the "Upcoming" section to
"Past trips" on `index.html`, and add `archived` to its class
(`class="trip-link archived"`) so it's visually greyed out. The trip
page itself doesn't need to change.

## Files

```
index.html              — home page, lists every trip
style.css                — shared styling, used by every page
trips/2027-brazil-bali.html   — the first trip
trips/_template.html     — copy this to start a new trip
```

## Doing future edits with Claude

This chat surface (claude.ai) can produce new versions of these files,
but it can't push to GitHub for you — there's no persistent repo or
git credentials here between conversations. For the "ask Claude to
change something, it goes live" loop you actually want, use
**Claude Code** (desktop, or the mobile app's remote access to it)
pointed at a local clone of this repo. It can edit files, run
`git commit` and `git push` directly, and Vercel picks up the rest.

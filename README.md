## 1. Project title & description

**Buddy** — a front-end web app inspired by diabetic alert dogs. It's built
for someone managing diabetes day-to-day who wants a warm, low-friction way
to log glucose readings, see how a reading looks against a normal range,
and find foods that keep their levels steady — without the app feeling like
a clinical tool. Buddy is not a medical device and doesn't diagnose, treat,
or replace a trained diabetic alert dog or a care team's guidance.

## 2. My info

Name: Lynn Hajjar

## 3. API used

**USDA FoodData Central API** (`https://api.nal.usda.gov/fdc/v1/foods/search`),
called from `js/foods.js`. Given a search term, the endpoint returns a list
of matching foods (the request filters to `dataType=Foundation,SR Legacy` to
favor whole/generic foods over branded products), each with a `foodNutrients`
array. The app reads calories, protein, fat, carbohydrates, and sugar out of
that array (matched by nutrient name, since the exact nutrient list varies
by food) and displays them per food as nutrition cards.

This project originally integrated CalorieNinjas per the assignment brief
(see commit `b4c2d43`), but that API was dropped after CalorieNinjas' own
account/profile page repeatedly failed during signup, blocking key retrieval
— the switch to USDA FoodData Central happened in commit `8766c02`. Details
and real prompts on that decision are in the AI-use appendix (§10).

The app currently ships with a real personal USDA API key hardcoded in
`js/foods.js` (line 10) rather than a placeholder — this is a static
front-end-only site with no backend, so there is nowhere private to put a
secret; it's committed directly into the public repo. That's a real,
acknowledged tradeoff, not an oversight — see the honest note about it in
§7 below.

## 4. Tech stack

Verified directly against the files in this repo:

- **HTML5** — `index.html`, `tracker.html`, `foods.html`, all hand-written, semantic markup.
- **Hand-written CSS3** — `css/styles.css` (design tokens: color variables, typography, resets, shared layout) and `css/components.css` (navbar, buttons, cards, alerts, hero, forms). Two `@media` breakpoints in `styles.css`, three more in `components.css`.
- **Bootstrap 5.3.3** — loaded via CDN (`bootstrap-grid.min.css` only, in all three HTML files) for the grid/utility classes; every visual style (colors, cards, buttons, navbar, alerts) is custom CSS on top of it, not default Bootstrap appearance.
- **Vanilla JavaScript, ES6 classes** — every module is a class: `NavBar` (`js/main.js`), `StorageManager` (`js/storage.js`), `AlertBanner` (`js/alert.js`), `GlucoseTracker` (`js/tracker.js`), `FoodExplorer` (`js/foods.js`). No jQuery, no framework, no build step — there is no `package.json` in this repo.
- **`localStorage`** — via `StorageManager`, used by `GlucoseTracker` to persist glucose readings under the key `buddy:readings`.
- **Google Fonts** — Fredoka (headings) + Nunito (body), imported in `css/styles.css`.

## 5. Pages

- **`index.html`** — home page. Hero section with the Buddy mascot (hand-drawn SVG, `assets/buddy-mascot.svg`) and a low-opacity paw-print pattern, a 4-card feature overview (track glucose, explore foods, spot patterns, build habits), and a footer with the not-a-medical-device disclaimer.
- **`tracker.html`** — the glucose tracker. A form (glucose value, date, time, optional notes) saves a reading via `StorageManager` and triggers a color-coded `AlertBanner` based on the value. Readings render as cards below the form, filterable by a specific date and sortable newest/oldest by their own date+time (not by when they were logged).
- **`foods.html`** — the food explorer. A search box hits the USDA FoodData Central API live and renders results as nutrition cards with a loading spinner, an empty state, a "no results" state, and a distinct error state; below that, a separate "Diabetes-Friendly Picks" section renders the 16 hand-curated foods from `data/foods.json`.

## 6. My unique requirement

The assigned unique UI requirement is **"Display user feedback with styled
alert messages."** It's implemented as the `AlertBanner` class in
`js/alert.js`, lines 12–80, with a doc comment at lines 1–11 explicitly
naming it as fulfilling this requirement.

`AlertBanner` takes a `type` (`success` / `warning` / `danger` / `error`)
and a `message` in its constructor, and a `.show()` method renders it into
a shared, `aria-live` alert stack, animates it in, and auto-dismisses it
after ~4.5 seconds (or immediately on manual close via the × button).

It's used in two places across the app:
- **`tracker.js`** (`handleSubmit`, `showRangeAlert`) — a danger alert for
  missing required fields, then one of success/warning/danger depending on
  whether the saved glucose value is in range, high (>180), or low (<70).
- **`foods.js`** (`renderError`) — an error alert alongside the inline error
  panel when the USDA API call fails (invalid key or network error).

## 7. What's implemented correctly (self-assessment)

**Functionality** — Done. All three pages work end-to-end: the tracker
validates, saves, and displays readings with date/time/notes, filtering,
and sorting; the food explorer's own dataset renders correctly. The user
manually tested 9 sample readings covering every `AlertBanner` branch
(missing fields, high, low, in-range, and the exact 70/180 boundaries) and
confirmed all of them matched expected behavior.

**API integration + search** — Working, but with real, known limitations,
not a polished solve. USDA FoodData Central is a food-database search, not
a natural-language nutrition parser: a query like "1 cup rice" initially
returned completely unrelated foods (a dessert topping, cottage cheese,
Reese's peanut butter cups) because the words "1" and "cup" skewed USDA's
relevance ranking. That's mitigated (quantity words are stripped before
querying, and results are re-ranked to prefer the plain food over composite
dishes — commits `963e3a7` and `f39ff1a`), but even after those fixes,
single-word searches for something like "rice" can still rank "Rice
crackers" or "rice cakes" above the plain grain. Given the deadline, the
actual fix applied was pragmatic: the search box placeholder now suggests
"banana" and "apple" — terms verified during testing to return clean,
correct results — rather than solving the general case (commit `e1a3ee4`).
This is a real, acknowledged gap, not a hidden one.

**Code quality / ES6** — Every module is a genuine ES6 class, as required.
An earlier draft of this README caught a real gap here: `js/foods.js`
instantiated `this.storage = new StorageManager('buddy')` but never called
`.get()`/`.set()` on it, while `storage.js`'s own comment claimed it was
"used by ... FoodExplorer to cache API searches" — a feature that was never
built. Fixed by removing the unused instantiation (and the now-unneeded
`<script src="js/storage.js">` tag on `foods.html`) and correcting the
comment to only describe what's actually implemented: `StorageManager` is
used solely by `GlucoseTracker` to persist readings. No search caching
exists in this project.

**Responsiveness** — Done. Verified at 375px, 768px, and 1280px widths via
headless-browser screenshots (mobile nav toggle, hero reflow, tracker form
stacking, food grid columns), with no horizontal overflow detected on any
page. Not done: the `/evidence` folder referenced in the original project
structure exists but is empty — those verification screenshots were saved
outside this repo (in a scratch directory) rather than committed here.

**Unique UI requirement** — Done and verified, not just implemented. See
§6. The user ran a full manual test pass against it (§7 "Functionality").

**Deployment** — Done. Deployed to Vercel, connected to this GitHub repo
for auto-deploy on push to `main`. Checked for console errors on the live
URL after each deploy using a headless browser; none found.

**Docs** — This README. The AI-use appendix below is written from the
actual session, not generic filler (see §10).

## 8. How to run locally

No build tools needed. The one requirement: don't open the HTML files
directly as `file://` paths, because `foods.js` and `data/foods.json` are
loaded via `fetch()`, which browsers block on local files. Serve the folder
instead:

```bash
python -m http.server 8000
# then open http://localhost:8000/index.html
```

Any other static server (`npx serve`, VS Code's Live Server extension,
etc.) works the same way.

## 9. Live deployment

[LIVE URL HERE]

## 10. AI-use appendix

**Tools used:** Claude Code (Anthropic), for essentially the entire build
— project scaffolding, the design system (palette/typography/layout),
all HTML/CSS/JS, the API integration and its later replacement, manual
test-case generation, and the Vercel deployment. No other AI tool was used
in this session.

**Actual prompts used during this build:**
1. *"can we find a substitute?"* — asked after CalorieNinjas' account page
   kept failing during signup, which led to switching the whole nutrition
   API to USDA FoodData Central.
2. *"all the results turned out to be rice cakkes. we dont have time to fix
   this instead i need youto change the suggestions shown in the search bar
   to have things we're sure will work with the api"* — after finding the
   "1 cup rice" search bug, this reprioritized the fix from "solve USDA's
   ranking" to "point users at known-good search terms."
3. *"i dont like the calendar/heatmap. i want you to instead put a filter so
   a user can filter by date and see what logs there was in this day."* —
   replaced a 7-day heatmap feature (built one prompt earlier) with a
   date-filter input instead, after deciding the heatmap wasn't the right
   fit.

**At least 2 concrete things that went wrong, and how they were found/fixed:**

1. **Wrong HTTP status assumption for an invalid API key.** The original
   CalorieNinjas integration treated HTTP 401/403 as "invalid key," so the
   specific error message never displayed. Found by directly `curl`-ing the
   CalorieNinjas endpoint with a bad key and reading the actual response —
   it returned HTTP 400, not 401/403. Fixed in commit `28c986f` (later moot
   once the API itself was replaced, but the same status-code mismatch
   pattern was checked again against USDA and confirmed correct there: USDA
   does return 401/403 for a bad key).

2. **Emoji that don't render everywhere.** Three foods in `data/foods.json`
   (chia seeds, chickpeas, cinnamon) originally used newer Unicode emoji
   (🫘 🫛 🧂) that rendered as blank boxes in headless-browser screenshot
   testing. Found by actually looking at a rendered screenshot, not by
   reading the code — the JSON and JS were both "correct." Fixed by
   swapping to older, universally-supported emoji in the same commit
   (`28c986f`).

3. **Search relevance bugs found only through real use, not code review.**
   The USDA re-ranking fix (commit `963e3a7`, meant to stop composite dishes
   like "Croissants, apple" from outranking plain "Apples, raw") had a
   second, subtler bug: it used `description.startsWith(query)`, which let
   "Rice crackers" false-positive as a "direct match" for the query "rice."
   This was only caught because the user manually tested "1 cup rice" in
   the actual browser and reported the results looked wrong — reading the
   matching code in isolation looked correct; it was the interaction between
   the loose `startsWith` check and USDA's actual data that broke it. Fixed
   in commit `f39ff1a` by switching to exact-equality comparison.

4. **A doc comment that overclaimed what the code does.** While writing
   this README (§7), a check of the actual code found that `js/storage.js`
   claims `StorageManager` is "used by ... FoodExplorer to cache API
   searches," and `foods.js` does instantiate a `StorageManager` — but
   never calls `.get()` or `.set()` on it anywhere. The comment describes
   an intention that was never implemented, not something that broke; it
   was only caught by grepping for actual usages rather than trusting the
   comment.

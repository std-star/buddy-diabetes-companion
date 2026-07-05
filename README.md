# Buddy — A Friendly Diabetes Companion

**Author:** Lynn Hajjar

Buddy is a front-end web app inspired by diabetic alert dogs. It helps someone
managing diabetes log glucose readings, explore diabetes-friendly foods, and
build small daily habits — with a warm, encouraging tone instead of a
clinical one.

**Buddy is not a medical device.** It doesn't diagnose, treat, or replace a
trained diabetic alert dog or a care team's guidance.

## Pages

- `index.html` — home page: hero, feature overview, footer disclaimer.
- `tracker.html` — glucose tracker: log readings, see instant feedback, view reading history.
- `foods.html` — food explorer: live nutrition search (USDA FoodData Central API) + a curated diabetes-friendly food grid.

## Tech

Plain HTML5, hand-written CSS3, and vanilla ES6-class JavaScript. Bootstrap 5
(CDN, grid/utilities only) is used under a fully custom design system —
palette, type, cards, buttons, alerts, and the hero are all custom CSS, not
default Bootstrap styling. No backend, no build step. Data persists in
`localStorage`.

## Running locally

Because `foods.js` uses `fetch('data/foods.json')`, the app needs to be served
over `http://`, not opened directly as a `file://` path (browsers block
`fetch` on local files). From the project root:

```bash
python -m http.server 8000
# then open http://localhost:8000/index.html
```

## API used

**[USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide)** — powers
the search box on `foods.html`. Given a food name, it returns matching foods
(filtered to the "Foundation" and "SR Legacy" data types, which cover whole/
generic foods rather than noisy branded products) with calories, carbs,
protein, fat, and sugar per 100g, rendered as nutrition cards.

The app ships with USDA's public `DEMO_KEY` (rate-limited to ~30 requests/
hour per IP, meant for testing) so search works out of the box. For normal
use, get a free key instantly at
[api.data.gov/signup](https://api.data.gov/signup/) (no email verification,
no account dashboard — the key is shown on the page and emailed immediately)
and paste it into `FoodExplorer.API_KEY` at the top of `js/foods.js`. Without
a valid key, the search still works end-to-end — it just shows the styled
"invalid API key" error state instead of results.

*(We originally built this against the CalorieNinjas Nutrition API per the
assignment brief, but switched to USDA FoodData Central after CalorieNinjas'
own account/profile page repeatedly failed during signup — see the AI-use
appendix below.)*

## Unique requirement: styled alert messages

This project's assigned unique UI requirement is **"Display user feedback
with styled alert messages."** It's implemented in `js/alert.js` as the
`AlertBanner` class (see the doc comment at the top of that file, which flags
it explicitly).

`AlertBanner` is a small, reusable, self-contained class:

```js
new AlertBanner('success', 'Nice, 110 mg/dL is in range!').show();
```

- Constructor takes a `type` (`success` / `warning` / `danger` / `error`) and a `message`.
- `.show()` renders it into a shared alert stack, animates it in, and auto-dismisses after ~4.5s (or on manual close).
- Used on `tracker.html` for both validation errors (missing fields) and save feedback (high / low / in-range readings).
- Used on `foods.html` to surface API errors (invalid key, network failure) alongside the inline error panel.

## Data

`data/foods.json` holds 16 hand-curated diabetes-friendly foods (name,
emoji placeholder, description, glycemic index, and why it's recommended),
rendered as the "Diabetes-Friendly Picks" grid — separate from the live API
search section.

## Folder structure

```
/
  index.html
  tracker.html
  foods.html
  css/
    styles.css        design tokens, reset, shared layout
    components.css     navbar, buttons, cards, alerts, mascot, hero
  js/
    main.js             NavBar class (shared nav across pages)
    storage.js           StorageManager class (localStorage wrapper)
    alert.js             AlertBanner class (unique requirement)
    tracker.js            GlucoseTracker class
    foods.js              FoodExplorer class
  data/
    foods.json
  assets/
    buddy-mascot.svg
    paw-icon.svg
  evidence/
    (screenshots go here)
```

---

## AI-use appendix

> **TODO (Lynn):** fill this in honestly before submitting. Below is a
> starting structure — replace the bracketed notes with what actually
> happened while you built this. Don't leave generic placeholder text in
> the final submission; be specific about real prompts and real bugs.

**Tools used:** [e.g. Claude Code — name any others]

**What I used it for:** [e.g. scaffolding the file structure, writing the
initial CSS design system, drafting the GlucoseTracker/FoodExplorer classes,
debugging]

**2–3 actual prompts I used:**
1. [paste a real prompt you typed]
2. [paste a real prompt you typed]
3. [paste a real prompt you typed]

**At least 2 things the AI got wrong, and how I found/fixed them:**
1. [e.g. a specific bug you hit, how you noticed it (console error, visual bug,
   testing on your phone, etc.), and what the actual fix was]
2. [same — a second concrete instance]

*(Note: during development, a few real issues came up if you want a starting
point — describe them in your own words, or swap in different ones you
personally ran into:*
- *three food emoji in `data/foods.json` initially used newer Unicode
  characters that rendered as blank boxes in some environments, caught by
  loading the page in a browser and looking at it;*
- *the original CalorieNinjas integration checked HTTP 401/403 for an
  invalid key, but CalorieNinjas actually returns 400 for that case, so the
  specific error message wasn't showing — found by curling the API directly
  and comparing the real response to what the code expected;*
- *CalorieNinjas' own account/profile page repeatedly failed to load during
  signup (an issue on their end, not something AI-generated code could fix),
  so the project switched to the USDA FoodData Central API instead — worth
  noting as an example of a real external blocker, not a code bug.)*

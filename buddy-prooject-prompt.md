# Claude Code Prompt — "Buddy" Final Project

---

You are a senior full-stack developer helping me finish a university front-end final project **today**, due tomorrow (July 5, 2026). Prioritize a working, polished result over exhaustive engineering. Read `/mnt/skills/public/frontend-design/SKILL.md` and the ui-ux-pro-max skill before writing any CSS — I do not want this to look like default Bootstrap. No backend, no frameworks, no build tools. Plain HTML/CSS/JS only.

## Project

"Buddy" — a friendly diabetes companion app inspired by Diabetic Alert Dogs. NOT a medical device, doesn't claim to replace a service dog. Warm, playful, trustworthy tone — think Duolingo/Headspace/Apple Health, not a hospital site.

## Hard constraints

- HTML5 semantic markup, hand-written CSS3, Bootstrap 5 (via CDN) for grid/components only — override its default look with a custom design system, don't leave default Bootstrap blue/navbar/cards.
- Vanilla JavaScript only, ES6 classes for every module (no jQuery, no frameworks, no build step).
- No backend. Persist data with `localStorage`.
- Folder structure:
  ```
  /
    index.html
    tracker.html
    foods.html
    /css
      styles.css        (design tokens, resets, shared layout)
      components.css     (buttons, cards, navbar, alerts, mascot)
    /js
      main.js            (Navbar/shared init, ES6 classes)
      storage.js          (class StorageManager — localStorage wrapper)
      alert.js            (class AlertBanner — reusable, see below)
      tracker.js          (class GlucoseTracker)
      foods.js            (class FoodExplorer — handles both API + local dataset)
    /data
      foods.json          (15+ hand-curated diabetes-friendly foods)
    /assets
      buddy-mascot.svg     (simple flat SVG dog illustration, drawn as paths — no external images/photos)
      paw-icon.svg
    /evidence
      (screenshots go here later)
    README.md
  ```

## Design system (avoid generic Bootstrap look)

- Custom CSS variables in `:root`: a teal + deep-blue palette (not Bootstrap default `#0d6efd`), warm off-white background (not pure white), one warm coral/amber accent for alerts/CTAs.
- Google Fonts: a rounded friendly display font for headings (Fredoka or Quicksand) + a clean sans for body text (Inter or Nunito). Import via `<link>`.
- Rounded cards (16-20px radius), soft multi-layer shadows, generous spacing.
- Hero section should NOT be the generic "text left, image right" default — give it an asymmetric layout with the Buddy SVG mascot tucked in, a subtle paw-print pattern as a background accent (low-opacity SVG, not an image file).
- Consistent navbar across all 3 pages, sticky, with the Buddy logo mark.

## Page 1 — Home (`index.html`)

- Hero: Buddy branding, one-line explanation of the app, mascot illustration, CTA button linking to tracker.html
- Features section (3-4 cards: track glucose, explore foods, build habits, etc.)
- Footer with a friendly note that this is not a medical device

## Page 2 — Glucose Tracker (`tracker.html`)

`class GlucoseTracker`:
- Form: glucose value (number), date (date input), optional notes (textarea)
- On submit: validate (all required fields except notes) → save to localStorage via `StorageManager` → render an `AlertBanner`:
  - Missing fields → error alert
  - Value > 180 → warning alert ("high — consider a check-in")
  - Value < 70 → danger alert ("low — please take care")
  - Otherwise → success alert ("nice, in range!")
  - Always show a generic success toast on save regardless of range, in addition to the range-specific one, OR combine into one message — your call, keep it simple
- List previous readings below the form as Bootstrap cards (or a table on wider screens), newest first, with date/value/notes, pulled from `StorageManager`
- This alert system is my assigned unique UI requirement ("Display user feedback with styled alert messages") — make `AlertBanner` a genuinely reusable class (constructor takes type + message, has a `.show()` / auto-dismiss), and use it for both save-confirmations and form errors. Add a code comment above the class explicitly noting this fulfills the assignment's unique requirement.

## Page 3 — Food Explorer (`foods.html`)

`class FoodExplorer`:
- **API section**: search box → fetch from **CalorieNinjas Nutrition API** (`https://api.calorieninjas.com/v1/nutrition?query=...`, header `X-Api-Key: YOUR_KEY`). Display calories, carbs, protein, fat, sugar per result in styled cards. Handle loading spinner, empty state ("search for a food to see its nutrition"), and error state (bad key / no results / network error) distinctly.
- **Own dataset section**: load `data/foods.json` (15+ items: name, image — use a simple placeholder icon/emoji or generated SVG, not scraped photos, short description, glycemic index, why it's recommended) and render as responsive Bootstrap card grid, separate from the API section, clearly labeled "Diabetes-Friendly Picks" or similar.

## Storage class

`class StorageManager` — generic wrapper around `localStorage.getItem/setItem` with JSON parse/stringify, used by both the tracker and (optionally) to cache food searches.

## Git workflow — do this as we go, not at the end

After each of the following milestones, make a real commit with a descriptive message (this is graded — no single bulk commit):
1. Project scaffold + folder structure
2. Shared navbar/footer + design tokens (colors, fonts)
3. Home page complete
4. StorageManager + AlertBanner classes
5. Tracker page complete and working
6. foods.json + own-dataset card grid
7. API integration (CalorieNinjas) with loading/error/empty states
8. Search functionality wired up
9. Responsive pass (mobile/tablet fixes)
10. README + final polish

## README.md — write this last, must include

- My name (Lynn Hajjar)
- API used (CalorieNinjas Nutrition API) and what it's for
- Brief project description
- Explanation of the unique requirement (styled alert messages) and where it's implemented
- **AI-use appendix**: which AI tools were used and for what, 2-3 actual prompts used, and at least 2 specific things the AI got wrong and how I found/fixed them — I will fill in the real specifics once we hit actual bugs, don't fabricate generic placeholders here, flag it for me to complete honestly.

## Deployment

Once working locally, help me deploy to Vercel (connect the GitHub repo, zero-config static deploy) and confirm no console errors on the live URL.

## Order of work

1. Scaffold + design tokens + navbar (commit)
2. Home page (commit)
3. AlertBanner + StorageManager (commit)
4. Tracker page fully working (commit)
5. foods.json + card grid (commit)
6. API integration + states (commit)
7. Search (commit)
8. Responsive polish pass across all 3 pages (commit)
9. README (commit)
10. Deploy + verify live URL

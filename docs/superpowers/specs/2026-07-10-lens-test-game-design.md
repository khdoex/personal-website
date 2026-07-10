# Mercek Testi — blind lens taste-test game

Date: 2026-07-10

## Purpose

Kaan's girlfriend is getting a Fujifilm X-S20 and must choose between two lens
paths. This game turns the decision into a playful, personal experience on
kaanhho.com and ends with a written recommendation grounded in her own choices.

- **sigma** path: Sigma 18-50mm f/2.8 DC DN, bought once, directly.
- **fuji** path: XC 15-45 kit bundle now, used XF 18-55 f/2.8-4 later.

## Route & entry

`/lens-test`, added as `lens` tab in the nav and to the sitemap. Turkish UI.
Page follows the site's City Lights design system (mono headings, accent,
`reveal` animation, surface/border tokens).

## Game flow (client, `components/lens-test/LensGame.tsx`)

1. **Intro** — explains rules, asks her name (used in the report).
2. **Blind image round** — 16 photos (8 per lens, sampled from a pool of 12+12,
   shuffled per playthrough). One at a time, rated: Bana göre değil / Fena
   değil / Bayıldım (0/1/2). No lens identification anywhere: neutral
   filenames (`p01.jpg`…), EXIF stripped at curation time.
3. **Verbal round** — 8 Turkish multiple-choice questions (photo/video, low
   light, bokeh, budget style, second-hand comfort, weight, upgrade
   philosophy, one-lens vs collection). Each option carries sigma/fuji weights
   and a Turkish `tag` clause reused inside the report.
4. **Report** — payload POSTed to `/api/lens-report`; server recomputes scores
   and returns a personal Turkish report + verdict.
5. **Reveal** — which photo was which lens with her ratings, score bar,
   "sonuçları kopyala" (clipboard summary to send Kaan), replay, and Wikimedia
   Commons photo credits (license compliance).

## Images

Curated from Wikimedia Commons "Taken with …" categories:

- Sigma pool: `Sigma 18-50mm F2.8 DC DN` + `Sigma 18-50mm F2.8 EX DC Macro`
  (the DC DN category alone is one photographer's transit documentation —
  too monotone for a fair taste test).
- Fuji pool: `Fujifilm X-E2/X-T1 and XF18-55mmF2.8-4` categories.

Hand-reviewed for quality, variety parity (landscape / night / street /
portrait-subject / animal / detail on both sides), no lens-revealing content,
no NSFW. Re-encoded to ≤1400px JPEG, EXIF stripped, shuffled neutral names.
Manifest with lens + attribution in `lib/lens-test/images.json` (~3.6 MB total
in `public/lens-test/`).

## Scoring (`lib/lens-test/game.ts`)

- Image round: per-lens average rating (0-2) scaled by `IMAGE_WEIGHT` (8 pts).
- Verbal round: option weights summed (0-2 per question, 8 questions).
- Verdict = higher total; margin < 8% is reported as "kıl payı".
- `IMAGE_WEIGHT` and per-option weights are the tuning knobs — deliberately
  kept as plain data at the top of the file.

Honest caveat encoded in the design: pool photos come from different
photographers/cameras, so the image round measures taste correlation, not
optics. The verbal round carries the path decision; the blind round makes it
personal and fun.

## Report generation (`app/api/lens-report/route.ts`)

- Validates payload shape strictly (ids against manifest, option bounds).
- If `DEEPSEEK_API_KEY` secret is set: DeepSeek `deepseek-chat` writes a warm
  4-5 paragraph Turkish report from a structured summary (40s timeout).
- On any failure or missing key: deterministic Turkish fallback report built
  from the same scores and tags. The game is fully functional without the key.
- Enable DeepSeek with: `npx wrangler secret put DEEPSEEK_API_KEY` + redeploy.

## No persistence

Results live in the browser; the copy button is the data channel back to Kaan.
No DB, no analytics, nothing stored server-side.

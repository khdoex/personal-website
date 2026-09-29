# Kaan Hacihaliloglu — Personal Website

Personal portfolio website built with Next.js, TypeScript, and Tailwind CSS.

## Overview

This site presents:
- Professional profile and current research focus
- Projects and technical work
- Blog posts (Markdown and MDX)
- Resume viewer and PDF download

Behind the pages is one 3D world (three.js): Istanbul at night. The first visit
to the home page opens with a ride in from deep space through a tube that
doubles as the loading bar, past the planet, and down through the clouds into
the city. Every page after that is a view of it (the old city's skyline at
dusk, the Bosphorus Bridge, Galata, the Maiden's Tower, dawn over Asia), and
the resume flies to a scene per entry: Istanbul, Padova's Prato della Valle,
and up above the city the physics years (Saturn and a pair of black holes) and
the interpretability years (a transformer and the refusal direction).

## Tech Stack

- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- three.js for the world, loaded as its own chunk after hydration
- MD/Markdown parsing via remark + gray-matter

## Run locally

1. Install dependencies:

   npm install

2. Start development server:

   npm run dev

3. Open:

   http://localhost:3000

## Scripts

- `npm run dev` — run local dev server (regenerates the copy when `content/site.md` is saved)
- `npm run build` — production build
- `npm run content` — check `content/site.md` and regenerate `lib/content.generated.ts`
- `npm run start` — run production server
- `npm run lint` — run lint checks
- `npm run build:cloudflare` — build for OpenNext/Cloudflare
- `npm run preview:cloudflare` — local Cloudflare preview
- `npm run deploy:cloudflare` — deploy to Cloudflare

## Content structure

- `content/site.md` — every word a visitor reads: home page, about, projects,
  resume, the Turkish page, the ride's lines and the 3D captions. Edit it and
  run `npm run content`; a mistake is reported with its line number.
- `app/` — routes and page components
- `components/` — shared UI (navigation, footer)
- `components/world/` — the 3D world: `World.tsx` (mounted once in the layout),
  `gate.ts` (decides before first paint whether the ride plays), and the engine
  in `engine/` (the ride's tube and planet, the city in `engine/city/`, the
  resume's scenes in space, camera shots)
- `lib/posts.ts` — blog loading/parsing utilities
- `lib/resume.ts`, `lib/projects.ts`, `lib/currently.ts` — typed views of `content/site.md`
- `posts/` — markdown blog content
- `public/` — static assets (images, resume PDF)
- `public/world/` — the planet's data textures, baked by `scripts/world-textures.py`

Useful query strings: `?intro=1` plays the ride again, `?intro=0` skips it,
`?quality=high|medium|low` forces a rendering tier, `?debug` exposes
`window.__world`.

## SEO and AI discoverability

- `lib/site.ts` holds identity data (name spellings, handles, profiles); `lib/seo.ts` builds per-page metadata (`pageMetadata`, one canonical per page) and the JSON-LD graph (WebSite, Person, ProfilePage, BreadcrumbList, BlogPosting).
- `/tr` is the Turkish landing page, linked to `/` with hreflang.
- `public/llms.txt` is the hand-written profile for LLM agents; `/llms-full.txt` appends the full resume, projects and post text, generated at build time from the same data files.
- `/feed.xml` is the RSS feed; `/robots.txt` explicitly allows AI crawlers.
- Blog posts accept `description` and `lang` frontmatter (`lang` is otherwise guessed).

## Deployment

Configured for Cloudflare deployment via OpenNext and Wrangler.

## Notes

The visual language is Istanbul at night: a dark blue ground, leaf green for
what is alive, sun gold for time and city lights, sky blue for figures. `docs/design-system.md` records every rule and the reason for it,
including how the world stays out of the way of reading: blog posts have no
world at all, and every page works without JavaScript or WebGL.

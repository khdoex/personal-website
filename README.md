# Kaan Hacihaliloglu — Personal Website

Personal portfolio website built with Next.js, TypeScript, and Tailwind CSS.

## Overview

This site presents:
- Professional profile and current research focus
- Projects and technical work
- Blog posts (Markdown and MDX)
- Resume viewer and PDF download

The site is still and light: one reading column, no animation, dates and
labels in mono beside the text.

## Tech Stack

- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
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
  resume, navigation and footer. Edit it and run
  `npm run content`; a mistake is reported with its line number.
- `app/` — routes and page components
- `components/` — shared UI (navigation, footer)
- `lib/posts.ts` — blog loading/parsing utilities
- `lib/resume.ts`, `lib/projects.ts`, `lib/currently.ts` — typed views of `content/site.md`
- `posts/` — markdown blog content
- `public/` — static assets (images, resume PDF)

## SEO and AI discoverability

- `lib/site.ts` holds identity data (name spellings, handles, profiles); `lib/seo.ts` builds per-page metadata (`pageMetadata`, one canonical per page) and the JSON-LD graph (WebSite, Person, ProfilePage, BreadcrumbList, BlogPosting).
- `public/llms.txt` is the hand-written profile for LLM agents; `/llms-full.txt` appends the full resume, projects and post text, generated at build time from the same data files.
- `/feed.xml` is the RSS feed; `/robots.txt` explicitly allows AI crawlers.
- Blog posts accept `description` and `lang` frontmatter (`lang` is otherwise guessed).

## Deployment

Configured for Cloudflare deployment via OpenNext and Wrangler.

## Notes

A warm off-white ground, near-black text, green for links, and gold and blue
only inside figures. `docs/design-system.md` records every rule and the reason
for it.

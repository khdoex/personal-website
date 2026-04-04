# Kaan Hacihaliloglu — Personal Website

Personal portfolio website built with Next.js, TypeScript, and Tailwind CSS.

## Overview

This site presents:
- Professional profile and current research focus
- Projects and technical work
- Blog posts (Markdown-based)
- Generative media experiments
- Resume viewer and PDF download

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

- `npm run dev` — run local dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — run lint checks
- `npm run build:cloudflare` — build for OpenNext/Cloudflare
- `npm run preview:cloudflare` — local Cloudflare preview
- `npm run deploy:cloudflare` — deploy to Cloudflare

## Content structure

- `app/` — routes and page components
- `components/` — shared UI (navigation, footer)
- `lib/projects.ts` — projects data source
- `lib/posts.ts` — blog loading/parsing utilities
- `posts/` — markdown blog content
- `public/` — static assets (images, videos, resume PDF)

## Deployment

Configured for Cloudflare deployment via OpenNext and Wrangler.

## Notes

The site uses a dark, terminal-inspired visual language with a clean and professional content tone.

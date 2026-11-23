# Light Research Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn kaanhho.com into a still, light, single-grid research index by removing the 3D world, the intro and all motion, and moving to a light palette.

**Architecture:** Most of the work is deletion. Every page already sits on `components/layout/Canvas.tsx` (except home), and every colour is a token on `:root` in `app/globals.css`, so the palette is a value swap. The home page is rebuilt from two existing reference implementations: the `currently` rows in `app/about/page.tsx` and the post rows in `app/blog/page.tsx`.

**Tech Stack:** Next.js 15 (app router), React 18, Tailwind 3, framer-motion (kept for figure types only), Playwright (`npm run verify`).

**Spec:** `docs/superpowers/specs/2026-11-24-light-research-index-design.md`

## Global Constraints

- No motion anywhere: no `@keyframes`, no `transition*` or `duration-*` classes, no `scroll-behavior: smooth`, no scroll listeners that change style. Link hover may change a colour instantly.
- Text tokens clear WCAG AA (4.5) on `background` and on `surface`. `muted-dark` never carries text.
- Token values, exactly: `background #fbfaf7`, `surface #f2f0ea`, `border #e4e1d9`, `muted-dark #b4b0a6`, `muted #666b72`, `accent #1f7a4d`, `sun #8f6500`, `sky #2462a8`, `foreground #33373d`, `heading #16181b`. Stored as bare sRGB channels like the existing ones (`--background: 251 250 247; /* #fbfaf7 */`).
- Dates use `muted`. `sun` and `sky` appear only inside figures.
- Copy comes from `content/site.md`. The only copy changes: new `hero.role` = `ai engineer · interpretability · istanbul`; `pdf: download pdf` moves from `resume-teaser` to `hero`; the `intro`, `world`, `about-teaser`, `resume-teaser` sections, `hero.location/time/scroll`, `contact.email` and every `scene:` line are deleted.
- `components/lens-test/`, `app/lens-test/`, `app/api/lens-report/` are not touched.
- Fonts stay: Newsreader and JetBrains Mono.
- Commit messages explain why. No attribution trailers. Commit only when Kaan has asked for the commits; otherwise stop at each "Commit" step with the change staged and the message drafted.

## Review Focus

1. **A deleted key left in `site.md` turns into visible text.** The parser treats any line with an unknown key as body text, so a stray `scene: bogazici` renders as a paragraph on /resume. Expected: none of the deleted keys reach the page. Test in Task 1 and Task 4.
2. **Content stays hidden without JavaScript.** `Reveal` server-renders `opacity:0` and relies on hydration to clear it. Expected: every page shows all its text with JS off. Test in Task 2.
3. **Phone width.** The new role line and the link row on home must wrap at 375px with no horizontal scroll. Expected: `npm run verify` reports `overflow=0px` at 375. Test in Task 4.
4. **Faint figure fills vanish on light.** Fills such as `rgb(var(--sky) / 0.55)` and `opacity="0.045"` were tuned for a dark ground. Expected: every band, bar and zero line in the figure post stays visible. Test in Task 3.
5. **First screen on a laptop.** Expected: at 1440x900 the top of the "currently" section is above the fold. Test in Task 4.

---

### Task 1: Remove the 3D world and the intro

**Files:**
- Delete: `components/world/` (all), `components/layout/Scrim.tsx`, `public/world/`, `scripts/world-textures.py`
- Modify: `app/layout.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/projects/page.tsx`, `app/resume/page.tsx`, `components/home/CurrentlyList.tsx`, `app/globals.css` (the `world` block, lines ~70-206, the ride block ~207-332, the `.scrim` block ~411-441, and the `--world-*` tokens), `content/site.md`, `scripts/build-content.mjs`, `lib/content-types.ts`, `lib/content.generated.ts` (regenerated), `scripts/design-lint.mjs`, `package.json`, `package-lock.json`, `bun.lock`

**Interfaces:**
- Produces: `SiteContent` without `intro` and `world`; `StoryChapter` = `{ title: string; period?: string; body: InlineText[] }`. `SceneName` and `WorldLabels` are deleted.

- [ ] **Step 1: Add the failing gate.** In `scripts/design-lint.mjs` add a rule:
  `{ id: 'world', what: 'import of the 3D world, the intro or the scrim', why: 'the site has no world (spec 2026-11-24)', baseline: 0, pattern: /components\/world|layout\/Scrim|from 'three'|data-station/g }`.
  Also delete the `components/world/engine/` clause from the `canvas-number` rule's `skip`.
- [ ] **Step 2: Run it.** `npm run lint:design`. Expected: `FAIL  world` with hits in `app/layout.tsx`, `app/page.tsx`, `app/resume/page.tsx` and others.
- [ ] **Step 3: Remove the world.**
  - `app/layout.tsx`: remove `World`, `IntroOverlay`, `INTRO_GATE` and its `<script>`, and the `suppressHydrationWarning` comment and attribute that existed only for the gate.
  - `app/page.tsx`: remove the `ReplayButton` paragraph and every `data-station` attribute. Leave the rest for Task 4.
  - `components/home/CurrentlyList.tsx`: remove the `world` import and the four `onMouse*`/`onFocus`/`onBlur` handlers.
  - `app/resume/page.tsx`: remove `data-station={chapter.scene}`. Remove `<Scrim window />`. `app/about/page.tsx`, `app/projects/page.tsx`: remove `<Scrim />`.
  - Delete the files listed above and the CSS blocks listed above.
  - `npm uninstall three @types/three`, then `bun remove three @types/three` so both lockfiles agree.
- [ ] **Step 4: Remove the world's copy.** Delete `## intro`, `## world` and every `scene:` line from `content/site.md`, and the `scene` mention in the `resume-story` comment. In `scripts/build-content.mjs` delete the `intro` and `world` schema entries, `scene` from `resume-story`'s `itemKeys`, `SCENES`, the `scene()` helper, and the `intro`/`world` blocks of the output. In `lib/content-types.ts` delete `SceneName`, `WorldLabels`, `StoryChapter.scene`, `SiteContent.intro`, `SiteContent.world`. Run `npm run content`.
- [ ] **Step 5: Check stray keys (Review Focus 1).** `grep -cE "scene: |saturn|black hole" lib/content.generated.ts` Expected: `0`.
- [ ] **Step 6: Run the gates.** `npm run lint:design` Expected: `PASS  world  0`. `npm run build` Expected: exit 0.
- [ ] **Step 7: Commit.**
  ```bash
  git add -A app components content lib scripts public package.json package-lock.json bun.lock
  git commit -m "Remove the 3D world and the intro ride

  The site is meant to read as a calm research page for hiring managers.
  The world was 9.5k lines of three.js working against that."
  ```

### Task 2: Remove all motion

**Files:**
- Delete: `components/motion/Reveal.tsx`, `components/ReadingProgress.tsx`, `components/home/IstanbulClock.tsx`
- Modify: every file that imports `Reveal` (`app/page.tsx`, `app/not-found.tsx`, `app/projects/page.tsx`, `app/resume/page.tsx`, `app/about/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `components/AboutHero.tsx`, `components/home/CurrentlyList.tsx`, `components/ui/Entry.tsx`), `components/mdx/ScrollFigure.tsx`, `components/mdx/RefusalToy.tsx`, `components/Navigation.tsx`, `components/Footer.tsx`, `components/layout/Gutter.tsx`, `app/layout.tsx`, `app/globals.css`, `scripts/design-lint.mjs`

**Interfaces:**
- Produces: `Entry({ gutter?: ReactNode; children: ReactNode; className?: string })`. The `delay` prop is gone. `ScrollFigure` keeps its props; `useFigureProgress()` always returns a `MotionValue` fixed at 1.

- [ ] **Step 1: Add the failing gate.** In `scripts/design-lint.mjs` add a rule:
  `{ id: 'motion', what: 'animation, transition or smooth scroll', why: 'the site has no motion (spec 2026-11-24)', baseline: 0, pattern: /@keyframes|\btransition(?:-[\w[\],-]+)?\b|\bduration-\d+|scroll-behavior:\s*smooth|motion\/Reveal|ReadingProgress|IstanbulClock|\bbreathe\b|\barrive\b|\bglass\b/g }`.
- [ ] **Step 2: Run it.** `npm run lint:design` Expected: `FAIL  motion`, with hits in `app/globals.css`, `components/Navigation.tsx` and every `Reveal` importer.
- [ ] **Step 3: Unwrap `Reveal`.** A `<Reveal>` with no `className` becomes its children. A `<Reveal className=…>` becomes `<div className=…>`. In `Entry`, always render the plain `div` branch. Drop every `delay=` argument at call sites.
- [ ] **Step 4: Make the rest still.**
  - `ScrollFigure.tsx`: remove `useScroll` and `useReducedMotion`; the provider always gets `staticProgress`. Remove `transition-colors` from the dialog buttons.
  - `AboutHero.tsx`: no `motion.div`, no `useScroll`/`useTransform`, no mask, no filter. Layout is finished in Task 5; here it only has to stop moving.
  - `app/blog/[slug]/page.tsx`: remove `<ReadingProgress />`. `app/page.tsx`: remove `<IstanbulClock>` and its separator span, the `scroll-line` block, and the `breathe` dots.
  - `Navigation.tsx`: remove the `scrolled` state and its effect, the `clear` logic, `transition-*` classes and the breathing dot. The bar is `relative border-b border-border bg-background`, in normal flow on every route (no `fixed`, no `absolute`, no blur).
  - `app/layout.tsx`: `<main className="min-h-screen">` (drop `pt-16`).
  - `Footer.tsx`: drop `bg-background/60 backdrop-blur-md`.
  - `Gutter.tsx`: `lg:top-24` becomes `lg:top-8`.
  - `app/globals.css`: delete `scroll-behavior: smooth`, every `@keyframes` and the rules that use them (`.arrive`, `.breathe`, `.dot` if unused, `.scroll-line`, `.reveal`, `.cursor-blink`, the figure-dialog entrance, `.glass` and its `@layer` block, `.reveal-root`, `--breath`), and the reduced-motion media blocks that only existed for these. `.u-link` keeps an underline on hover with no animation.
  - `RefusalToy.tsx`: remove its `transition*` classes only.
- [ ] **Step 5: Run the gates.** `npm run lint:design` Expected: `PASS  motion  0`. `npm run build` Expected: exit 0.
- [ ] **Step 6: Check no-JS rendering (Review Focus 2).** Start the dev server (`preview_start` name `dev`). For each route in `scripts/verify.mjs`, `curl -s localhost:3000<route> | grep -c 'opacity:0'` Expected: `0` for each.
- [ ] **Step 7: Commit.** Message: "Remove all motion: the fades, the parallax, the clock and the progress bar".

### Task 3: Light palette

**Files:**
- Modify: `app/globals.css:5-18` (tokens and the palette comment), `app/layout.tsx` (`themeColor`), `components/ui/Meta.tsx` (`date` tone), `app/blog/[slug]/page.tsx:168` (`text-sun` on the date), `scripts/contrast.mjs`, figure files under `components/mdx/` only where Step 6 finds a problem
- Temporary, never committed: `posts/rich/prompt-injection-defense-inside-model-en.mdx` (`listed`)

**Interfaces:**
- Produces: the ten token values in Global Constraints. `Meta` tones stay `muted` and `date`; both map to `text-muted`.

- [ ] **Step 1: Make the contrast gate check `surface`.** In `scripts/contrast.mjs`, rate each `TEXT` token against both `background` and `surface`, failing below 4.5 on either. Print both ratios on the line.
- [ ] **Step 2: Run it.** `npm run contrast` Expected: two ratios per text token. Pass or fail is not meaningful yet; this step only proves the new check runs.
- [ ] **Step 3: Swap the tokens.** Set the ten values from Global Constraints. Rewrite the palette comment at the top of `:root` in one or two plain sentences. `themeColor: '#fbfaf7'`. `Meta` `date: 'text-muted'`. The post header `time` uses `text-muted`.
- [ ] **Step 4: Run the gates.** `npm run contrast` Expected (ground, surface): `heading 17.04 15.61`, `foreground 11.47 10.50`, `sky 5.94 5.44`, `muted 5.14 4.71`, `accent 5.09 4.67`, `sun 4.99 4.57`, all PASS. `npm run lint:design` and `npm run build` Expected: pass.
- [ ] **Step 5: Screenshot the figures (Review Focus 4).** Set `listed: true` in `prompt-injection-defense-inside-model-en.mdx`. With the dev server running, open `/blog/prompt-injection-defense-inside-model-en` at 1440 wide and screenshot every figure.
- [ ] **Step 6: Fix fills that vanish.** For each figure where a band, bar segment, interval or zero line cannot be seen on the light ground, raise that fill's alpha or switch it to the next token step (`border` to `muted-dark`). Do not change data or poles. Re-screenshot.
- [ ] **Step 7: Revert the flag.** `git checkout posts/rich/prompt-injection-defense-inside-model-en.mdx`. `git status --short posts` Expected: empty.
- [ ] **Step 8: Commit.** Message: "Move to a light palette: 7 of the 8 research sites readers know are light". Report to Kaan that `public/images/og-kaan-hacihaliloglu.jpg` and `app/icon.svg` are still dark, with a screenshot of each.

### Task 4: Home page

**Files:**
- Delete: `components/home/SectionLabel.tsx`, `components/home/CurrentlyList.tsx`
- Modify: `app/page.tsx` (rewrite), `content/site.md` (`hero`, `about-teaser`, `resume-teaser`, `contact`), `scripts/build-content.mjs`, `lib/content-types.ts`, `lib/content.generated.ts`

**Interfaces:**
- Consumes: `Entry` (Task 2), `Canvas`, `Gutter`, `Meta`, `Inline`, `profiles` from `components/Footer.tsx`, `PERSON.email` from `lib/site.ts`, `getAllPosts()`.
- Produces: `SiteContent.hero = { role: string; pdf: string; body: InlineText[] }`, `SiteContent.contact = { label: string; body: InlineText[] }`. `aboutTeaser` and `resumeTeaser` are deleted from `SiteContent`.

- [ ] **Step 1: Change the copy.** In `content/site.md`, `## hero`: replace `location`, `time`, `scroll` with `role: ai engineer · interpretability · istanbul` and `pdf: download pdf`, and rewrite its comment to describe the header. Delete `## about-teaser` and `## resume-teaser`. Delete `email:` from `## contact` and its mention in the comment. Mirror the keys in `scripts/build-content.mjs` and `lib/content-types.ts`. Run `npm run content`.
- [ ] **Step 2: Check stray keys (Review Focus 1).** `grep -cE "location: |time: |scroll: |tell me anything|more about me" lib/content.generated.ts` Expected: `0`.
- [ ] **Step 3: Rewrite `app/page.tsx`.** Keep `metadata` and `JsonLd` as they are. One `<Canvas className="pb-28 pt-16 md:pt-24">` holding, in order:
  1. `<header className="lg:col-start-2">`: `h1` `PERSON.name` in `font-serif text-h2 font-normal text-heading` (visible, no `sr-only`); `<Meta>{hero.role}</Meta>`; each `hero.body` paragraph in `font-serif text-lead text-foreground`; a `flex flex-wrap gap-x-5 gap-y-2 font-mono text-meta` row with `mailto:` + `PERSON.email` showing the address, then `profiles` (`rel="me noopener noreferrer"`, `target="_blank"`), then `/documents/resume.pdf` with `download="KaanHacihaliloglu_Resume.pdf"` and label `hero.pdf`. Links are `u-link text-muted hover:text-accent`.
  2. `<Rule className="col-span-full mt-16" />`, `<Gutter className="mt-8"><Meta>{currently.label}</Meta></Gutter>`, then one `Entry` per `currently.items` item, copied from the rows in `app/about/page.tsx:54-77`.
  3. `Rule`, `<Gutter className="mt-8"><Meta>{writingTeaser.label}</Meta></Gutter>`, the `writingTeaser.body` paragraphs in the reading column (`font-serif text-sm text-muted`), one `Entry` per post (latest 4) with `<Meta as="time" tone="date">{date}</Meta>` in the gutter and the title, excerpt and reading-time line copied from `app/blog/page.tsx:79-98`, then a `/blog` link labelled `writingTeaser.link`.
  4. `Rule`, `<Gutter className="mt-8"><Meta>{contact.label}</Meta></Gutter>`, the `contact.body` paragraphs, and a plain `mailto:` link showing `PERSON.email`.
  No arrows in link text.
- [ ] **Step 4: Run the gates.** `npm run lint:design` and `npm run build` Expected: pass.
- [ ] **Step 5: Phone width and first screen (Review Focus 3 and 5).** With the dev server running: `npm run verify` Expected: every line `PASS`, `overflow=0px`. Then in the browser at 1440x900 on `/`: `document.querySelector('main h2').getBoundingClientRect().top < 900` (the first "currently" row title) Expected: `true`. Screenshot home at 1440 and 375.
- [ ] **Step 6: Commit.** Message: "Rebuild the home page as a research index: who, what, where to read".

### Task 5: About and resume

**Files:**
- Modify: `components/AboutHero.tsx`, `app/about/page.tsx`, `app/resume/page.tsx` (`Story`)

**Interfaces:**
- Consumes: `Canvas`, `Gutter`, `Entry` (Task 2).

- [ ] **Step 1: About.** `AboutHero` becomes a plain `Canvas` section: `h1` "about" and the story in the reading column (`lg:col-start-2`), and the portrait `next/image` (`/images/kaan-hacihaliloglu.png`, `alt="Kaan Hacihaliloglu"`, 1086x1448) in the right track (`lg:col-start-3 lg:row-start-1`), about 220px wide. Below `lg` the portrait sits above the heading at `max-w-[12rem]`. The component no longer needs `'use client'`.
- [ ] **Step 2: Resume story.** In `Story`, the chapter `div` loses `flex min-h-[62svh] max-w-[30rem] flex-col justify-center`. The chapter title moves to the gutter as `<Meta>` above the period (`<Meta tone="date">`). The paragraphs stay in the reading column.
- [ ] **Step 3: Run the gates.** `npm run lint:design`, `npm run build` Expected: pass. `npm run verify` Expected: all `PASS`. Screenshot /about and /resume at 1440 and 375.
- [ ] **Step 4: Commit.** Message: "Still, plain about and resume pages: a static portrait, the story as rows".

### Task 6: Docs and gate baselines

**Files:**
- Modify: `docs/design-system.md`, `scripts/design-lint.mjs` (baselines), `README.md` only if it mentions the world

- [ ] **Step 1: Lower baselines.** `npm run lint:design`; for each rule that prints "under baseline, lower it to N", set its baseline to N. Delete `CANVAS_ALLOW` entries whose files no longer exist.
- [ ] **Step 2: Rewrite the design system doc.** In `docs/design-system.md`: the Colour table gets the ten new values with ratios on ground and surface and a short reason (light, matching the reference sites; dates moved to `muted`); delete "World paint"; Figure poles keep their reasoning with the new hex values; the Motion section becomes one short paragraph saying there is none and why; the Canvas section loses the home exception; delete "The world"; the Copy section drops the ride and the scene captions; the Gate section lists the new `world` and `motion` rules. Same voice as the file: plain sentences with reasons, no em dashes.
- [ ] **Step 3: Final check.** `npm run contrast && npm run lint:design && npm run build` Expected: all pass. `grep -rn "world\|ride" docs/design-system.md` Expected: no reference to the 3D world.
- [ ] **Step 4: Commit.** Message: "Record the still, light identity in the design system".

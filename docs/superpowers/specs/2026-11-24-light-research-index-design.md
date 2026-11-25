# v4: a still, light research index

**Date:** 2026-11-24
**Status:** Approved by Kaan, 2026-11-24, with all calls listed at the end
**Supersedes:** the 3D world (commits from 2026-09-29 on) and the dark palette in
`docs/design-system.md`. It keeps the Editorial + Instrument structure from
`docs/superpowers/specs/2026-09-20-site-visual-identity-design.md`.

## Intent

The site must read as simple, clear and professional to three readers, in this
order:

1. Hiring managers at AI labs. They should leave having read the research and
   knowing what Kaan works on.
2. Investors. They should understand SCL and see that Kaan builds things.
3. Curious people. A clear site serves them with nothing extra.

Today the home page is five full-screen sections over a three.js model of
Istanbul, with an intro "ride" from space, glass panels, and fade-ins on scroll.
Kaan decided to remove all of it. He wants a site with no animation that is easy
to read.

## What "professional" means here

"Professional" is measured against 8 sites that the first reader already knows:
Chris Olah, Neel Nanda, Lilian Weng, Andrej Karpathy, Owain Evans, Transformer
Circuits (Anthropic), Jack Morris, gwern.

| trait                                                        | count  |
|--------------------------------------------------------------|--------|
| no motion beyond link hover                                  | 8 of 8 |
| one narrow centred column of text                            | 8 of 8 |
| the first lines give name, role and affiliation as plain text| 6 of 8 |
| work as a dated list, each item a title plus one line        | 5 of 8 |
| light background by default                                  | 7 of 8 |

The closest model is transformer-circuits.pub: a serif title and a short
summary, then rows with a small date in a left column and the title plus one
line on the right. The existing `Canvas` grid, which has a left gutter for dates,
already produces this layout.

## Goals

- No motion anywhere. No intro, no scroll-triggered fades, no parallax, no
  breathing dots, no live clock. Link hover may change a colour, with no
  transition duration.
- A light palette. Every text token clears WCAG AA (4.5) on the ground and on
  `surface`.
- On the home page, the first screen says who Kaan is, what he researches, and
  where to read or reach him, with no scrolling on a 1440x900 laptop.
- Every page sits on the three-track `Canvas`. The home page is no longer an
  exception.
- The copy stays the same. Words come from `content/site.md` as they do today.
  Copy that only described the world (the ride lines, the scroll hint, the
  clock label, the scene captions) is removed.

## Non-goals

- New writing, new research pages, or changes to the meaning of any copy.
  Kaan said to keep the content as it is.
- A dark mode or theme toggle. The site is light only, the same way it was
  dark only before.
- Changing fonts. Newsreader (serif) and JetBrains Mono stay.
- Changes to `/lens-test` and `/api/lens-report`. That page is archived and
  unlinked, and it stays excluded from the design lint.
- Removing `framer-motion` from the dependencies. The figure components import
  its types and hooks. Removing it is a separate cleanup.

## Anti-goals

The result fails, even if it builds, if:

- it looks like a developer-portfolio template (cards, gradients, hero
  illustrations, icon grids);
- anything moves without a click;
- a text colour misses AA on the ground;
- the home page needs scrolling before a reader learns what Kaan researches.

## Approaches considered

- **A. Return to Editorial + Instrument, dark.** Remove the world and rebuild
  the home page in the single-column style from 2026-09-20. Cheapest, but
  different from 7 of the 8 reference sites.
- **B. Same structure, light ground.** A, plus a light palette with the same
  token names. The figures already use tokens only, so the extra work is
  checking their alpha-graded fills on the light ground. **Chosen by Kaan.**
- **C. Classic academic homepage** (photo, bio, papers list). Rejected. It needs
  a papers list, and the content stays as it is.

## Design

### Palette

The token names stay, so classes like `text-muted` and `rgb(var(--sky))` keep
working. Only the channel values on `:root` in `app/globals.css` change. Ratios
below were computed with the same WCAG formula as `scripts/contrast.mjs`.

| token        | hex       | on ground | on surface | carries                         |
|--------------|-----------|-----------|------------|---------------------------------|
| `background` | `#fbfaf7` | 1.00      |            | the ground, a warm off-white    |
| `surface`    | `#f2f0ea` | 1.09      | 1.00       | code blocks, figure grounds     |
| `border`     | `#e4e1d9` | 1.25      | 1.15       | hairlines                       |
| `muted-dark` | `#b4b0a6` | 2.07      | 1.90       | ticks and marks, never text     |
| `muted`      | `#666b72` | 5.14      | 4.71       | dates, labels, captions         |
| `accent`     | `#1f7a4d` | 5.09      | 4.67       | links and active state only     |
| `sun`        | `#8f6500` | 4.99      | 4.57       | the adverse figure pole only    |
| `sky`        | `#2462a8` | 5.94      | 5.44       | the cool figure pole only       |
| `foreground` | `#33373d` | 11.47     | 10.50      | prose                           |
| `heading`    | `#16181b` | 17.04     | 15.61      | headings                        |

Two jobs change (proposals by Claude, see the end):

- Dates move from `sun` to `muted`. Gold dates on a light ground read as
  brown, and only one accent then stays in the page chrome: green for links.
  `sun` keeps only its figure job.
- The green accent stays green for continuity, darkened to pass AA.

The `--world-*` tokens are deleted. The `themeColor` in `app/layout.tsx` becomes
`#fbfaf7`.

### Layout

Every page uses `components/layout/Canvas.tsx`: left gutter 160px for dates and
section labels, reading column 660px, right gutter 220px. Below `lg` the
layout is one column. This is the rule from `docs/design-system.md`. Only the
home-page exception is removed.

Navigation: a static bar at the top of each page. It does not stay fixed, has
no blur, does not change on scroll, and has no dot. The full name is on the
left. Blog, projects, about and resume are on the right. The footer stays as it
is, without the blur.

### Home page

Sketch at desktop width (gutter on the left, reading column on the right):

```
kaan hacihaliloglu                        blog  projects  about  resume
-----------------------------------------------------------------------

              Kaan Hacihaliloglu
              ai engineer · llm interpretability · istanbul

              currently i am tech lead at SCL, writing my thesis, and
              doing research on the interpretability and safety of
              large language models.

              email · github · x.com · linkedin · huggingface · cv (pdf)

-----------------------------------------------------------------------
currently     refusal geometry in llms
2025          msc thesis at sabancı: how refusal and harmfulness ...

2024          SCL, synthetic consumer lab
              ...
-----------------------------------------------------------------------
writing       <post title>
2024-03       <excerpt>                                    all writing
-----------------------------------------------------------------------
```

In order:

1. **Header.** A visible `h1` with the name (it is `sr-only` today). One mono
   line with role and place. Then the `hero` paragraph from `site.md`.
   Then one line of links: the email address, the four profiles from
   `components/Footer.tsx`, and the resume PDF.

   The role line is a new `role` key under `## hero` in `site.md`, with the
   value Kaan wrote for the pre-world home page: `ai engineer · interpretability
   · istanbul`. It replaces `location`. The email link shows the address from
   `PERSON.email`. The PDF link keeps the existing `pdf` label, moved from
   `resume-teaser` to `hero`. These are the only copy changes.
2. **Currently.** The `currently` items as `Entry` rows: `since` in the gutter,
   the title (a link when `link` is set) and the description in the column.
3. **Writing.** The latest listed posts as `Entry` rows: the date in the
   gutter, the title and excerpt in the column, and a link to `/blog`. Language
   and reading time stay as mono meta.
4. **Contact.** The `contact` paragraph and the email as a plain link. No button.

The `about-teaser` and `resume-teaser` blocks leave the home page. Their pages
are one click away in the bar. Their copy stays in `site.md` only if another
page reads it. Otherwise it is deleted together with its schema entry.

### Other pages

- **/about.** `AboutHero` loses the parallax, the scroll fade and the radial
  mask. The portrait becomes a plain static image in the right gutter at
  desktop width, and sits above the story on a phone. `Scrim` is removed.
- **/resume.** The story chapters lose `data-station` and `min-h-[62svh]`. They
  become normal paragraphs with the chapter name in the gutter. `Scrim` is
  removed.
- **/projects, /blog, 404.** `Scrim` and `Reveal` are removed. The layout does
  not change.
- **/blog/[slug].** `ReadingProgress` is removed. Figures render in their final
  state: `ScrollFigure` gives its children a progress value fixed at 1 and
  does not read the scroll. The figures keep their data and colours.

### What is deleted

- `components/world/**`, `components/layout/Scrim.tsx`,
  `components/motion/Reveal.tsx`, `components/home/IstanbulClock.tsx`,
  `components/home/SectionLabel.tsx` if unused, `components/ReadingProgress.tsx`.
- `World`, `IntroOverlay` and the `INTRO_GATE` script in `app/layout.tsx`.
- `public/world/`, `scripts/world-textures.py`, and the `three` dependency.
- From `app/globals.css`: the intro, `.arrive`, `.breathe`, `.glass`,
  `.scroll-line` and `.reveal-root` rules, `--breath`, and the `--world-*`
  tokens.
- From `content/site.md`, `lib/content-types.ts` and
  `scripts/build-content.mjs`: the `intro` and `world` sections, `hero.time`,
  `hero.scroll`, and the comments that describe scenes.
- `CurrentlyList`'s link to the world store (`world.highlight`).

`Entry` keeps its row layout and loses `Reveal`. The `delay` prop goes.

### Documentation and gates

`docs/design-system.md` is updated in the same change: the colour table and its
reasoning, a short Motion section ("there is none, and why"), the Canvas
section without the home exception, and "The world" section deleted.
`scripts/contrast.mjs` also rates the text tokens against `surface`.

Done means:

- `npm run contrast` passes, with every text token at 4.5 or more on
  `background` and on `surface`.
- `npm run lint:design` passes. Baselines go down where counts drop.
- `npm run build` passes.
- No import of `components/world`, `Reveal`, `Scrim`, `ReadingProgress`,
  `IstanbulClock` or `three` remains, and no class `breathe`, `arrive` or
  `glass` remains. The check matches imports and class names only, so copy
  such as "all three intervals" does not trip it.
- Every page is checked by screenshot at 1440px and 375px: home, about,
  resume, projects, blog, one post with figures, and the 404. Both figure
  posts are unlisted and return 404. For the check, set `listed: true` on
  `prompt-injection-defense-inside-model-en.mdx` locally, take the
  screenshots, and revert it. That change is never committed.
- In the figures, each alpha-graded fill (for example
  `rgb(var(--sky) / 0.55)` or `opacity="0.045"`) was tuned for the dark
  ground. Each one is checked on the light ground and raised where a band or
  bar disappears.

### Delivery

Small commits that can each be reverted on their own, after Kaan approves, in
this order: (1) remove the world and the intro, (2) remove motion, (3) light
palette and figure check, (4) home page, (5) the other pages, (6) docs and
gates. Nothing is committed or pushed without his request.

## Left to the builder

- Exact spacing and type sizes, within the existing type scale.
- How to fix the hex literals in the 5 figure files, as long as each figure
  stays readable on the light ground and uses tokens where it can.
- Whether `SectionLabel` survives as the gutter label or merges into `Meta`.
- The OG image (`PERSON.ogImage`) and the favicon (`app/icon.svg`, a navy tile
  with gold "kh"). Flag both to Kaan. Do not redraw them.
- The sticky gutter offset (`top-24`) once the nav is no longer fixed.

## Calls made by Claude, for Kaan to check

- Dates in `muted` instead of gold.
- Green stays the link accent, darkened.
- The portrait stays on /about only. The home page has no photo.
- The about and resume teasers leave the home page.
- `ReadingProgress` is removed.
- Figures render static at their final state.
- The navigation bar scrolls away with the page.
- The home role line reuses the pre-world copy, under a new `role` key.
- Figure posts are checked by flipping `listed` locally, never committed.

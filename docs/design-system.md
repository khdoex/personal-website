# Design system

The rules this site is built on, with the reason behind each one. A rule with no
reason attached gets broken by the next person who finds it inconvenient.

Values live in two files. `app/globals.css` defines the colour tokens on `:root`
and the prose rules. `tailwind.config.ts` exposes the tokens as colour keys and
holds the type scale. Two scripts check them: `npm run contrast` rates the token
values, `npm run lint:design` checks how components spend them.

## Two registers

A register here is a set of type choices tied to a kind of content. There are
two, and they never overlap.

**Editorial** carries anything read in sequence: headings, prose, page
structure. Newsreader, a serif drawn for screen reading, 18px at a 1.65 line
height.

**Instrument** carries anything scanned: dates, labels, tags, axis ticks, table
figures, code. JetBrains Mono with `font-variant-numeric: tabular-nums`, which
holds every digit to the same width so a column of numbers keeps one straight
edge.

The split tells a reader, before a word is read, whether something is an
argument or a measurement. Mixing the two removes that signal, and the site has
little else to work with: two published posts, one portrait, no photography.

`components/ui/Meta.tsx` is the instrument register in component form. Every
date, label, tag and axis mark goes through it, which is what keeps the tracking
and the tabular numerals consistent.

One trap worth naming. SVG `<text>` inherits `font-family` like any other
element, so every axis tick inside a figure picks up the serif set on `body`
unless it is put back. `app/globals.css` sets `.prose svg text` to mono for
exactly this. Without that rule a figure's axis reads as prose.

## Colour

Nine tokens, no tenth. Ratios are measured against the ground `#10151a`, the
page background. A contrast ratio compares the relative luminance of two
colours; WCAG AA asks for 4.5 on body text.

| token        | hex       | ratio | carries                                   |
|--------------|-----------|-------|-------------------------------------------|
| `heading`    | `#eef3f7` | 16.43 | headings                                  |
| `foreground` | `#b8c4cf` | 10.34 | prose                                     |
| `accent`     | `#5ec4ff` |  9.45 | links, active state, positive figure pole |
| `amber`      | `#d98e48` |  6.92 | dates, adverse figure pole                |
| `muted`      | `#7b8a97` |  5.18 | captions, labels, secondary prose         |
| `muted-dark` | `#48545f` |  2.37 | ticks and hairline marks, never text      |
| `border`     | `#232c34` |  1.29 | hairlines                                 |
| `surface`    | `#161c22` |  1.07 | code blocks, figure grounds               |
| `background` | `#10151a` |  1.00 | the ground                                |

**`muted-dark` never carries text, at any size.** At 2.37 it misses AA by a wide
margin, and it is dark enough that the failure stays invisible on a good monitor
in a dark room, which is how it spread. Before the rebuild it carried text in 27
places. None remain.

The bar is on text, and on nothing else. What the token is for is a mark a
reader looks at rather than reads, and that covers more than a hairline: the 1px
tick in `components/ui/Rule.tsx`, and inside a figure the neutral bar segment,
the connecting rule, the shaded band and the axis zero. The zero reference in
`PromptDefenseBehaviorGeometryFigure` is the case that settled the wording. That
line carries the figure's whole claim, that all three intervals cross zero, so
`border` at 1.29 was too quiet for it. `muted-dark` is the step meant for a mark
that has to be seen without being read.

What `muted-dark` keeps getting reached for is a third grey between `muted` and
the ground, for a label meant to sit quieter than a caption. No such grey clears
AA on this ground. Hierarchy below `muted` comes from typeface and size instead.

**No hex literal in a component.** A literal is a colour nobody rated and nobody
can change from one place. `components/mdx/` held 89 of them across 26 distinct
values, most of them near-duplicates of tokens that already existed: `#8aa0b1`
beside `muted`, `#e8eef4` beside `heading`. Two greys a reader cannot tell apart
still cost a maintainer a decision every time. All 89 are gone. One literal
stands, the `themeColor` in `app/layout.tsx`, which Next serves as a browser
meta tag where a CSS variable cannot be read.

The tokens hold bare sRGB channels rather than colours, so `var(--accent)` is
not a colour anywhere a colour is expected. In an SVG attribute or a JavaScript
colour constant, write `rgb(var(--accent))`, and `rgb(var(--accent) / 0.6)` for
a graded step. In a class, write `text-accent` or `bg-amber/5`.

### Figure poles

A figure usually compares two things, and the two need colours. Cyan (`accent`)
is the defended or positive pole. Amber (`amber`) is the adverse or attacked
pole.

The figures had invented a red and green pair for this, `#dc645c` against
`#83b892`. Red against green is the most common colour-vision deficiency, so
that pairing is the worst available choice for a data figure. Blue against
orange stays separable under every common deficiency, and both tokens already
exist for other jobs. So the palette holds at two colours rather than growing to
four. Amber picks up a second meaning beyond dates, and it stays unambiguous
because a date and a figure mark never sit in the same place.

Decided 2026-09-21, applied the same day. The red and green constants are gone.

Two figures compare four things rather than two, and they grade within the hues
instead of adding a third. `PromptDefenseBehaviorFigure` splits five answer
sequences into a target pair and an injected pair: `accent` and `accent` at 55%,
`amber` and `amber` at 55%, `muted` for the right-censored remainder.
`PromptGuardResidualRiskFigure` does the same with `amber` and `amber` at 55%
over a `muted-dark` neutral. Lightness separates the members of a pair, hue
separates the poles, and nothing in either figure asks a reader to tell red from
green.

`PromptActionBoundaryFigure` grades for a different reason. Its three layers are
an ordering rather than a pair: the model defense the post argues is not
sufficient, the detector between them, and the action boundary outside the model
that decides. Painting the first and the third the same cyan said the opposite
of the argument, so layer 01 takes `accent` at 70%, layer 02 `amber`, layer 03
`accent` at full, and the figure now runs in the direction the prose does.

A graded step that carries text has a floor the fill grades do not. `accent` at
55% rates 3.65 against the ground and misses AA; at 70% it rates 5.19 and clears
it. Grade a fill, a bar or a rule as far as it still reads. Grade text only as
far as 4.5.

## Type scale

Nine steps in `tailwind.config.ts`, 18px base, 1.25 ratio.

| name      | size                      | use                                |
|-----------|---------------------------|------------------------------------|
| `tick`    | 11px                      | figure chrome only                 |
| `meta`    | 13px                      | mono labels and dates              |
| `sm`      | 15px                      | small prose, captions              |
| `base`    | 18px                      | body                               |
| `lead`    | 22px                      | standfirsts, index titles          |
| `h3`      | 28px                      | section heads                      |
| `h2`      | 36px                      | page and post titles               |
| `h1`      | 48px                      | unused on pages today              |
| `display` | clamp(40px, 6vw, 64px)    | the landing masthead               |

Headings inside prose are set in `app/globals.css` rather than through these
utilities, and they sit one step lower: a post's own `h2` is 28px, because the
post title above it already holds 36px. The sizes come off the same scale.

`tick` sits below `meta` because the figures needed it. Their legends, axis
captions and in-figure notes ran at 9, 10 and 11 pixels, and 13px wrapped a
five-key legend onto another line. Rather than keep three arbitrary sizes the
scale grew by one step and all 48 uses moved onto it. It is for chrome inside
`components/mdx/` and nowhere else; text a reader reads in sequence starts at
`sm`.

Two rules follow from having a scale at all.

**No arbitrary sizes, the `text-[Npx]` form.** 49 stood in the codebase, at 9,
10 and 11 pixels among others. A size picked inside one component answers to
nothing, so it drifts, and nothing pulls it back. One stands, the language
switch in `app/blog/[slug]/page.tsx`.

**No Tailwind default size names**: `text-xs`, `text-lg`, `text-xl`, `text-2xl`,
`text-3xl`, `text-4xl`. Those resolve to Tailwind's own scale, which then runs
alongside this one as a second, invisible scale. `text-sm` and `text-base` are
safe because the config overrides both. 33 stood, nearly all `text-xs` in figure
chrome where `text-meta` was the step that was meant. Three remain, in the
footer and the post header.

## Canvas

`components/layout/Canvas.tsx` owns the page grid and is the only place its
numbers appear. Three tracks inside `max-w-[1168px]` with `px-6 md:px-8`:

- left gutter, 160px: dates, section labels, status marks, reading progress. It
  behaves as a plotting axis, which is where the instrument vocabulary came
  from in the first place.
- reading column, 660px: all prose.
- right gutter, 220px: margin notes, and figures that bleed across all three.
- `gap-x-8` between tracks.

Below Tailwind's `lg` breakpoint the grid collapses to a single column. Gutter
content moves above the entry it belongs to and margin notes render inline.

Rows inherit the tracks through `lg:grid-cols-subgrid` rather than redeclaring
them, so the column gap is defined once. `components/ui/Entry.tsx` is the one
row component, and it replaced four hand-copied `[3rem_1fr]` grids.

The measure is set in pixels rather than in `ch` units. A `ch` resolves against
each element's own font size, so `65ch` on a 16px mono header, on 18px prose,
and on a figure beside them lands on three different right edges. Five sites
used `65ch` before the rebuild and could not be lined up. Pixels put all of them
on one edge.

Four numbers are reserved: 1168, 660, 220 and 160. They may appear outside
`Canvas.tsx` only where a reason is recorded in the allowlist at the top of
`scripts/design-lint.mjs`. Eight entries stand there today. They cover the nav
and footer outer width, which align to the canvas edge without having tracks;
the prose measure in CSS, which cannot read the component; and the margin note,
which is absolutely positioned out of the grid flow and so has to carry the
right-track width itself.

## Motion

`components/motion/Reveal.tsx` is the whole motion budget. A rise on viewport
entry, 0.55s, reversible.

Nothing else. No parallax, no cursor effects, no scroll-jacking, no page
transitions. The site's argument is that its visuals carry data, and decorative
motion contradicts that argument on every page it appears.

`Reveal` honours `prefers-reduced-motion` through `useReducedMotion`, and the
way it does so is load-bearing. It always renders a `motion.div`: swapping the
element type on the reduced-motion branch causes a hydration mismatch that
strands content at opacity 0. The from-state ships in the server markup, and a
client that prefers reduced motion never runs the animation that would clear it,
so `.reveal-root` in `app/globals.css` clears it in CSS, which the browser
resolves without waiting for hydration. Any new reduced-motion branch needs the
same guard.

`framer-motion` stays a dependency because 13 components under `components/mdx/`
use it for scroll-driven figures.

## The gate

`npm run contrast` rates the nine token values against the ground.
`npm run lint:design` checks the five rules above that a script can see:
`text-muted-dark` outside `Rule.tsx`, hex literals, canvas numbers, arbitrary
font sizes, and off-scale size names.

The design lint carries a baseline per rule, which is the count that stood when
the gate was written. It fails only when a count rises above its baseline, and
it prints how far each rule still is from zero. Demanding zero on day one would
have made the gate unrunnable, and an unrunnable gate gets ignored. Lower a
baseline whenever a count drops.

`components/lens-test/` is excluded from the lint. That page is archived and
unlinked from both nav and sitemap.

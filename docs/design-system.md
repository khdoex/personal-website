# Design system

The rules this site is built on, with the reason behind each one. A rule with no
reason attached gets broken by the next person who finds it inconvenient.

Values live in two files. `app/globals.css` defines the colour tokens on `:root`
and the prose rules. `tailwind.config.ts` exposes the tokens as colour keys and
holds the type scale. Two scripts check them: `npm run contrast` rates the token
values, `npm run lint:design` checks how components spend them.

Words live in a third: `content/site.md` holds every line a visitor reads (see
[Copy](#copy)).

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

Ten tokens, no eleventh. A warm off-white ground with near-black text, green
for what a reader can click, and gold and blue kept for the two poles of a
figure. Ratios are measured against the ground `#fbfaf7` and against `surface`,
the ground of code blocks and figures. A contrast ratio compares the relative
luminance of two colours; WCAG AA asks for 4.5 on body text.

| token        | hex       | ground | surface | carries                              |
|--------------|-----------|--------|---------|--------------------------------------|
| `heading`    | `#16181b` | 17.04  | 15.61   | headings                             |
| `foreground` | `#33373d` | 11.47  | 10.50   | prose                                |
| `sky`        | `#2462a8` |  5.94  |  5.44   | the cool figure pole, only in figures|
| `muted`      | `#666b72` |  5.14  |  4.71   | dates, captions, labels              |
| `accent`     | `#1f7a4d` |  5.09  |  4.67   | links and active state               |
| `sun`        | `#8f6500` |  4.99  |  4.57   | the adverse figure pole, only in figures |
| `muted-dark` | `#b4b0a6` |  2.07  |  1.90   | ticks and hairline marks, never text |
| `border`     | `#e4e1d9` |  1.25  |  1.15   | hairlines                            |
| `surface`    | `#f2f0ea` |  1.09  |  1.00   | code blocks, figure grounds          |
| `background` | `#fbfaf7` |  1.00  |         | the ground                           |

The ground is light because the readers this site is for, people hiring at AI
labs, already read research on light pages. Of 8 research sites they know, 7
are light by default. Dates moved from gold to `muted`: gold dark enough to
read on a light ground turns brown, and it left a second colour in the page
chrome. Green is now the only colour outside the figures.

Decided 2026-11-24, when the 3D world and the dark palette were removed. The
token names stayed, so no class had to change. Before that the ground was a
dark blue `#0a1428`, set 2026-09-29.

**`muted-dark` never carries text, at any size.** At 2.07 it misses AA by a wide
margin, and it is dark enough that the failure stays invisible on a good monitor
in a dark room, which is how it spread. Before the rebuild it carried text in 27
places. None remain.

The bar is on text, and on nothing else. What the token is for is a mark a
reader looks at rather than reads, and that covers more than a hairline: the 1px
tick in `components/ui/Rule.tsx`, and inside a figure the neutral bar segment,
the connecting rule, the shaded band and the axis zero. The zero reference in
`PromptDefenseBehaviorGeometryFigure` is the case that settled the wording. That
line carries the figure's whole claim, that all three intervals cross zero, so
`border` was too quiet for it. `muted-dark` is the step meant for a mark that
has to be seen without being read.

What `muted-dark` keeps getting reached for is a third grey between `muted` and
the ground, for a label meant to sit quieter than a caption. No such grey clears
AA on this ground. Hierarchy below `muted` comes from typeface and size instead.

**No hex literal in a component.** A literal is a colour nobody rated and nobody
can change from one place. `components/mdx/` held 89 of them across 26 distinct
values, most of them near-duplicates of tokens that already existed. Two greys a
reader cannot tell apart still cost a maintainer a decision every time. All 89
are gone. One literal stands, the `themeColor` in `app/layout.tsx`, which Next
serves as a browser meta tag where a CSS variable cannot be read.

The tokens hold bare sRGB channels rather than colours, so `var(--accent)` is
not a colour anywhere a colour is expected. In an SVG attribute or a JavaScript
colour constant, write `rgb(var(--accent))`, and `rgb(var(--accent) / 0.6)` for
a graded step. In a class, write `text-accent` or `bg-sun/5`.

### Figure poles

A figure usually compares two things, and the two need colours. Sky (`sky`) is
the defended or positive pole. Sun (`sun`) is the adverse or attacked pole.

The figures had invented a red and green pair for this, `#dc645c` against
`#83b892`. Red against green is the most common colour-vision deficiency, so
that pairing is the worst available choice for a data figure. Blue against
yellow stays separable under every common deficiency. That is also why the
green `accent` is never a pole, though it is the palette's most visible colour:
green and gold sit on the same confusion line for protan and deutan readers, and
a figure that set them against each other would repeat the red and green
mistake one step over. Green is for what a reader can act on; figures compare in
blue and gold.

Decided 2026-09-21 with cyan and amber, carried over 2026-09-29 to sky and sun,
and to their light values on 2026-11-24. The red and green constants are gone.

Two figures compare four things rather than two, and they grade within the hues
instead of adding a third. `PromptDefenseBehaviorFigure` splits five answer
sequences into a target pair and an injected pair: `sky` and `sky` at 55%, `sun`
and `sun` at 55%, `muted` for the right-censored remainder.
`PromptGuardResidualRiskFigure` does the same with `sun` and `sun` at 55% over a
`muted-dark` neutral. Lightness separates the members of a pair, hue separates
the poles, and nothing in either figure asks a reader to tell red from green.

`PromptActionBoundaryFigure` grades for a different reason. Its three layers are
an ordering rather than a pair: the model defense the post argues is not
sufficient, the detector between them, and the action boundary outside the model
that decides. Painting the first and the third the same blue said the opposite
of the argument, so layer 01 takes `muted`, layer 02 `sun`, layer 03 `sky`, and
the figure runs in the direction the prose does. On the dark ground layer 01
was `sky` at 70%.

A graded step that carries text has a floor the fill grades do not. On the
light ground `sky` at 70% rates 3.19 and misses AA, and it only clears 4.5 near
90%, where it no longer looks lighter. So text never takes a graded step: it
takes a full token. Grade a fill, a bar or a rule as far as it still reads.
The `graded-text` rule in `npm run lint:design` fails on any text colour with
an opacity step.

## Type scale

Ten steps in `tailwind.config.ts`, 18px base, 1.25 ratio.

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
| `display` | clamp(40px, 6vw, 64px)    | unused since 2026-11-24            |
| `hero`    | clamp(44px, 7.5vw, 92px)  | unused since 2026-11-24            |

Headings inside prose are set in `app/globals.css` rather than through these
utilities, and they sit one step lower: a post's own `h2` is 28px, because the
post title above it already holds 36px. The sizes come off the same scale.

`hero` was the percent counter of the intro ride, which is gone. The step
stays in the config until something needs a size past 64px, which is not a
page title.

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
chrome where `text-meta` was the step that was meant. Two remain, in the post
header.

## Canvas

`components/layout/Canvas.tsx` owns the page grid and is the only place its
numbers appear. Three tracks inside `max-w-[1168px]` with `px-6 md:px-8`:

- left gutter, 160px: dates, section labels and status marks. It
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

Every page sits on the canvas, the home page included.

Four numbers are reserved: 1168, 660, 220 and 160. They may appear outside
`Canvas.tsx` only where a reason is recorded in the allowlist at the top of
`scripts/design-lint.mjs`. Eight entries stand there today. They cover the nav
and footer outer width, which align to the canvas edge without having tracks;
the prose measure in CSS, which cannot read the component; and the margin note,
which is absolutely positioned out of the grid flow and so has to carry the
right-track width itself.

## Motion

There is none. Nothing moves unless the reader clicks or scrolls: no fades on
arrival, no parallax, no breathing marks, no smooth scrolling, no hover
transitions. A link changes colour on hover at once.

The site is for people deciding whether to read the research, and motion spent
their attention on the page instead of the work. Every research site they
already read is still. Text that waits for an animation is also text that can
fail to appear: the old fade-in shipped `opacity:0` in the server markup.

Figures render in their final state. `ScrollFigure` hands its children a
progress value fixed at 1, so the figure components keep their `framer-motion`
types and hooks but never animate. `framer-motion` stays a dependency for that
reason only.

The one exception is the archived `/lens-test` page, which keeps its `.reveal`
fade and `@keyframes rise`. It is unlinked and out of scope.

Decided 2026-11-24, with the removal of the 3D world.

## Copy

Every word a visitor reads lives in `content/site.md`: the home page, the about
story, the projects, the whole resume, the navigation and the footer.
`scripts/build-content.mjs` checks it against the shape the pages need and
emits `lib/content.generated.ts`, typed by `lib/content-types.ts`; a mistake
stops the build with the line number. `npm run dev` and `npm run build` run it,
and the dev server regenerates it on save. `lib/resume.ts`, `lib/projects.ts`
and `lib/currently.ts` keep their exports, so `llms-full.txt` and the JSON-LD
read the same words the pages show.

What stays in code on purpose: titles and descriptions for search engines
(`lib/seo.ts` and each page's metadata) and identity data (`lib/site.ts`),
because both are tuned for crawlers rather than read on the page.

## The gate

`npm run contrast` rates the text tokens against the ground and against
`surface`, and fails below 4.5 on either. `npm run lint:design` checks the
eight rules above that a script can see: `text-muted-dark` outside `Rule.tsx`,
any import of the old 3D world or its scrim, any animation, transition or
smooth scroll, text coloured at partial opacity, hex literals, canvas numbers, arbitrary font sizes, and
off-scale size names.

The design lint carries a baseline per rule, which is the count that stood when
the gate was written. It fails only when a count rises above its baseline, and
it prints how far each rule still is from zero. Demanding zero on day one would
have made the gate unrunnable, and an unrunnable gate gets ignored. Lower a
baseline whenever a count drops.

`components/lens-test/` is excluded from the lint. That page is archived and
unlinked from both nav and sitemap.

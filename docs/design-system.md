# Design system

The rules this site is built on, with the reason behind each one. A rule with no
reason attached gets broken by the next person who finds it inconvenient.

Values live in two files. `app/globals.css` defines the colour tokens on `:root`
and the prose rules. `tailwind.config.ts` exposes the tokens as colour keys and
holds the type scale. Two scripts check them: `npm run contrast` rates the token
values, `npm run lint:design` checks how components spend them.

Words live in a third: `content/site.md` holds every line a visitor reads (see
[Copy](#copy)). The 3D world behind the pages has a section of its own, [The
world](#the-world).

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
and the tabular numerals consistent. The labels the world pins beside things in
3D (the city under the light, the captions in the resume's scenes, the words a
transformer reads) are instrument too: mono, 13px, never serif.

One trap worth naming. SVG `<text>` inherits `font-family` like any other
element, so every axis tick inside a figure picks up the serif set on `body`
unless it is put back. `app/globals.css` sets `.prose svg text` to mono for
exactly this. Without that rule a figure's axis reads as prose.

## Colour

Ten tokens, no eleventh. The palette is the Earth at night seen from orbit: a
dark blue ground, leaf green for anything alive, sun gold for time and for the
lights of cities, sky blue for the cool pole of a figure. Ratios are measured
against the ground `#0a1428`, the page background. A contrast ratio compares the
relative luminance of two colours; WCAG AA asks for 4.5 on body text.

| token        | hex       | ratio | carries                                         |
|--------------|-----------|-------|-------------------------------------------------|
| `heading`    | `#f4efe3` | 16.00 | headings                                        |
| `sun`        | `#f4cd5e` | 12.02 | dates, the adverse figure pole, the name        |
| `foreground` | `#c5cfdb` | 11.65 | prose                                           |
| `accent`     | `#86d6a4` | 10.64 | links, active state, what breathes              |
| `sky`        | `#7fb8f5` |  8.81 | the cool figure pole                            |
| `muted`      | `#8797ad` |  6.17 | captions, labels, secondary prose               |
| `muted-dark` | `#3b4d68` |  2.14 | ticks and hairline marks, never text            |
| `border`     | `#1b2a44` |  1.28 | hairlines                                       |
| `surface`    | `#0f1b31` |  1.07 | code blocks, figure grounds                     |
| `background` | `#0a1428` |  1.00 | the ground                                      |

The heading white is warm (`#f4efe3`, moonlight on paper) rather than the cold
white it replaced, so it sits with the gold instead of against it. The ground is
a clear blue, not a blue-black: the night over the city and the page are meant
to read as the same dark.

Decided 2026-09-29 with the move to the 3D world, replacing a near-black ground
with one cyan signal and an amber for dates. `amber` became `sun` and `accent`
went from cyan to green; `sky` is new, for the figures (see
[Figure poles](#figure-poles)).

**`muted-dark` never carries text, at any size.** At 2.14 it misses AA by a wide
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
serves as a browser meta tag where a CSS variable cannot be read. The rule holds
inside the WebGL engine too: `components/world/engine/palette.ts` reads the
tokens from the stylesheet at runtime, so the world has no colour of its own.

The tokens hold bare sRGB channels rather than colours, so `var(--accent)` is
not a colour anywhere a colour is expected. In an SVG attribute or a JavaScript
colour constant, write `rgb(var(--accent))`, and `rgb(var(--accent) / 0.6)` for
a graded step. In a class, write `text-accent` or `bg-sun/5`.

### World paint

A second block on `:root`, the `--world-*` tokens, paints the world: Istanbul
at night (the deep ocean for the water and the dark walls, forest for the
hills, city light for windows, lamps and floodlit stone, dusk for the sunset
and the sunrise), and the planet the ride passes on its way down. They are read
once by the engine and handed to the shaders as they are (colour management is
off, so a channel of 40 reaches the screen as 40). They are never a class and
never text, so `npm run contrast` does not rate them. Change them to repaint
the world; nothing else reads them.

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

Decided 2026-09-21 with cyan and amber, carried over 2026-09-29 to sky and sun.
The red and green constants are gone.

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
of the argument, so layer 01 takes `sky` at 70%, layer 02 `sun`, layer 03 `sky`
at full, and the figure now runs in the direction the prose does.

A graded step that carries text has a floor the fill grades do not. `sky` at 55%
rates 3.48 against the ground and misses AA; at 70% it rates 4.91 and clears it.
Grade a fill, a bar or a rule as far as it still reads. Grade text only as far
as 4.5.

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
| `display` | clamp(40px, 6vw, 64px)    | mastheads: /tr, the 404            |
| `hero`    | clamp(44px, 7.5vw, 92px)  | the home greeting, the ride's counter |

Headings inside prose are set in `app/globals.css` rather than through these
utilities, and they sit one step lower: a post's own `h2` is 28px, because the
post title above it already holds 36px. The sizes come off the same scale.

`hero` sits above `display` for one job: the greeting over the city on the
home page, and the percent counter of the ride that leads to it. Beside a
skyline across half the screen, 64px read as a caption. It is the only step that
grows past 64px, and it is not for page titles.

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

The home page is the one page off the canvas. The city takes one side of each
section and the text the other, alternating down the page, so its sections sit
on a wide twelve-column grid (`max-w-[1280px]`) instead of the three tracks. Its
text still uses the two registers and the type scale.

Four numbers are reserved: 1168, 660, 220 and 160. They may appear outside
`Canvas.tsx` only where a reason is recorded in the allowlist at the top of
`scripts/design-lint.mjs`. Eight entries stand there today. They cover the nav
and footer outer width, which align to the canvas edge without having tracks;
the prose measure in CSS, which cannot read the component; and the margin note,
which is absolutely positioned out of the grid flow and so has to carry the
right-track width itself.

## Motion

The site used to spend its whole motion budget on `Reveal`, on the argument that
its visuals carry data and decorative motion contradicts that. The 3D world
changes where the motion lives, not the argument. Motion now has two homes, and
the rule is what each one may do.

**The world** (`components/world/`, see [The world](#the-world)) is the only
thing that moves on its own. It plays the ride in from deep space once per
session, flies the camera between pages and between the sections of a page, and
breathes. Nothing in the page's text layer moves except on the reader's own
scroll.

**The breath** is one period, seven seconds in and out, set as `--breath` in
`app/globals.css` and as `BREATH` in the engine. Only small marks breathe: the
green status dots, the scroll line, the stars, and the floodlights and lamps of
the city. Text never breathes.

**`Reveal`** (`components/motion/Reveal.tsx`) is unchanged: a rise on viewport
entry, 0.55s, reversible. The hero uses `.arrive` in CSS instead, because it has
to wait for the ride to land and a viewport observer cannot.

**Reading pages are still.** A blog post has no world at all: the canvas stops
drawing and the ground is flat. No parallax, no cursor effects, no
scroll-jacking. The reader's scroll only ever moves the camera, never the text.

`Reveal` honours `prefers-reduced-motion` through `useReducedMotion`, and the
way it does so is load-bearing. It always renders a `motion.div`: swapping the
element type on the reduced-motion branch causes a hydration mismatch that
strands content at opacity 0. The from-state ships in the server markup, and a
client that prefers reduced motion never runs the animation that would clear it,
so `.reveal-root` in `app/globals.css` clears it in CSS, which the browser
resolves without waiting for hydration. Any new reduced-motion branch needs the
same guard.

Reduced motion reaches the world too: no ride, no breathing, and the camera
cuts between shots instead of flying. The city is drawn once per change and
then left alone.

`framer-motion` stays a dependency because 13 components under `components/mdx/`
use it for scroll-driven figures.

## The world

One WebGL scene, drawn with three.js behind every page but the blog posts: the
site lives in Istanbul, at night. The page never depends on it: every word is
server-rendered in the HTML, and the site reads the same with no JavaScript,
without WebGL, with Save-Data on and with reduced motion. In those cases the
gradients on `.world` stand in for the sky.

- `components/world/World.tsx` is mounted once in the root layout, so it
  survives client-side navigation and a route change is a camera move rather
  than a reload. It loads the engine as a separate chunk after hydration, so
  the page's own JavaScript does not grow.
- `components/world/gate.ts` runs inline in `<head>` before the first paint and
  decides whether the home page opens with the ride. It has to run that early:
  a page that painted first and hid itself second would flash. The ride plays on
  a direct visit to `/`, once per browser session, and never for crawlers,
  automation, reduced motion, Save-Data or a missing WebGL. `?intro=1` forces
  it, `?intro=0` skips it. If the engine has not booted after nine seconds the
  page shows itself anyway.
- The ride: deep space, the tube, the planet, and a fall through the cloud into
  the city. The tube is the loading bar. It holds a hundred rings, one per
  percent; a ring lights up once that much of the world has loaded, and the
  camera may not pass an unlit ring, so a slow connection slows the ride rather
  than freezing it. The planet shows only here, for the fall: the camera drops
  toward the light over Istanbul, the cloud closes over it, and the city is
  underneath when it clears. Esc, the skip button, or tabbing into the page ends
  the ride, and however slowly a machine draws, the page is never held back
  more than about sixteen seconds.
- The city (`engine/city/`) is built from primitives, not pictures: the ground
  and the Bosphorus (`terrain.ts`, `water.ts`, which mirrors the city), a street
  plan that the buildings fill block by block and the lamps light
  (`common.ts`, `buildings.ts`), the floodlit monuments (`landmarks.ts`), the
  Bosphorus Bridge (`bridge.ts`), ferries and gulls (`life.ts`), and a sky with
  an hour: `dusk` and `dawn` in each shot move the glow from the west to the
  east and put the lights out. Fog takes the sky's colour at the horizon in
  every direction, so the edges of the ground melt into it. Padova
  (`padova.ts`: Prato della Valle, Santa Giustina, the Santo) is a second place
  on the same ground, far to the west.
- The camera follows the page through stations: any element marked
  `data-station`. The home page's sections name their shots in
  `components/world/engine/shots.ts` (`HOME`), one night from dusk over the old
  city to dawn over Asia; the resume's entries name a scene (`SCENES`) through
  the `scene:` key in `content/site.md`; every other page has one shot
  (`ROUTES`). Between stations the camera blends, holding each shot around its
  section and travelling in between. Between places (Istanbul, Padova, and the
  resume's two scenes in space above the city) it never blends across the
  ground: it draws back, climbs through the cloud, crosses, and comes down.
- The resume's scenes are framed into the width its text column leaves free,
  measured from the page, so a scene never sits under the words it illustrates.
  Pages with text over the world render `components/layout/Scrim.tsx` first,
  which shades the text side only.
- Labels pinned in 3D are ordinary DOM text, positioned by the engine every
  frame, placed in priority order and hidden rather than allowed to overlap one
  another or leave the screen.
- Three quality tiers, chosen from what the browser reports, set resolution,
  star count, building count, reflection size and noise octaves. The low tier
  drops the two most expensive things per pixel, the water's mirror and the
  street plan, and a device that runs slow for two seconds steps its resolution
  down. `?quality=` forces a tier and `?debug` exposes `window.__world`
  (`?debug=paused` stops the clock, so a screenshot script can step it exactly).
- The planet in the ride is real geography repainted. `public/world/` holds data
  textures, not pictures: where land is, where the city lights are, how dry and
  how high the ground is. `scripts/world-textures.py` bakes them from NASA
  imagery (not copyrighted) and documents where each comes from.

## Copy

Every word a visitor reads lives in `content/site.md`: the ride's lines, the
home page, the about story, the projects, the whole resume, the Turkish page,
the captions in the 3D scenes, the navigation and the footer.
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

`npm run contrast` rates the ten token values against the ground.
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

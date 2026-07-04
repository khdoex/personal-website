# Content Refresh: Projects Page + Homepage Copy

**Date:** 2026-07-04
**Status:** Approved design, pending implementation

## Goal

Align the site's content with Kaan's current identity (mech interp thesis + AI engineering at SCL). Today the homepage promises interpretability work while the projects page shows only 2022-era coursework ML; the blog's one post predates the current direction. Fix the projects page and homepage copy. All prose follows the `kaans-voice` skill (`~/.claude/skills/kaans-voice/SKILL.md`).

## Scope

In: `lib/projects.ts`, `app/projects/page.tsx`, homepage hero paragraph in `app/page.tsx`.
Out: blog changes, notes section, RSS/OG/SEO, interactive demos (each is a later, separate cycle).

## Changes

### 1. `lib/projects.ts`

- Extend `Project`: add `status: 'current' | 'earlier'`; make `githubUrl` optional.
- Add new first entry (thesis, `status: 'current'`, no `githubUrl`), description (approved copy):

  > msc thesis at sabanci: how refusal and harmfulness live in the internal geometry of llms. ask a model something harmful and it refuses, that refusal can be shown as a direction in activation space, and jailbreaks work by pushing the model off it. i am mapping what those attacks actually do to the representations, no public repo yet, we will see where it goes.

  Title: `refusal geometry in llms` (lowercase, per voice skill). Tags: `Mechanistic Interpretability`, `Refusal Directions`, `LLM Safety`.
- Mark the three existing projects `status: 'earlier'`. Content otherwise untouched.

### 2. `app/projects/page.tsx`

- Render two groups from the same array: `current` first, then `earlier` under a small mono `earlier work` label (same label treatment as `currently` on the homepage).
- `source →` link renders only when `githubUrl` exists (it already conditionally renders `demoUrl`; mirror that).
- Numbering continues across both groups (01, 02, ...).
- Replace subtitle with approved copy:

  > mostly the thesis these days: where refusal lives inside llms. the older ml projects moved down to earlier work, they had their time.

### 3. `app/page.tsx`

- Replace hero paragraph with approved copy:

  > physicist turned ai engineer. my msc thesis was on the refusal direction in llms: the place inside the model where "i can't help with that" comes from, and what happens if you move it. these days i am at SCL, building an ai based market research engine (and still poking at model internals when i can).

- No structural changes; the `currently` section stays as is.

## Error handling

None needed beyond the conditional `source →` link; data is static and typed.

## Testing / verification

- `npm run build` passes (typecheck catches the interface change everywhere).
- Visual check in browser (`npm run dev`): both sections render, thesis entry shows no source link, numbering and reveal animations intact, mobile layout unbroken.

## Future upgrade path

When the thesis repo goes public, add `githubUrl` to the entry - one-line change.

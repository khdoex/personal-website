# Content Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the projects page and homepage hero with Kaan's current identity (interp thesis + SCL), per the approved spec at `docs/superpowers/specs/2026-07-04-content-refresh-design.md`.

**Architecture:** Static content site (Next.js 15 app router, Tailwind, no test framework). All data lives in `lib/projects.ts`; the projects page renders it. Changes are data + presentational. Verification is typecheck, production build, and a browser check, since there is no runtime logic beyond conditional rendering.

**Tech Stack:** Next.js 15, TypeScript, Tailwind. Playwright (already a devDependency) for the browser screenshot check.

## Global Constraints

- All user-facing copy is exact, pre-approved text from the spec. Do NOT rephrase, capitalize, or "fix" it. Lowercase is intentional.
- No em dashes anywhere in copy.
- Do NOT commit without Kaan's explicit go-ahead (his global CLAUDE.md). The final step offers a single commit; wait for his answer.
- Match existing styling classes exactly; this is a content change, not a redesign.

---

### Task 1: Data model + thesis entry in `lib/projects.ts`

**Files:**
- Modify: `lib/projects.ts` (whole file, 30 lines)

**Interfaces:**
- Produces: `Project` interface gains `status: 'current' | 'earlier'`; `githubUrl` becomes optional (`githubUrl?: string`). Task 2 consumes `Project` and `projects` from `@/lib/projects` and filters on `status`.

- [ ] **Step 1: Replace the interface and add the thesis entry**

Replace the interface block at the top of `lib/projects.ts`:

```ts
export interface Project {
  title: string;
  description: string;
  status: 'current' | 'earlier';
  githubUrl?: string;
  tags: string[];
  demoUrl?: string;
}
```

Insert as the FIRST element of the `projects` array:

```ts
  {
    title: "refusal geometry in llms",
    description: "msc thesis at sabanci: how refusal and harmfulness live in the internal geometry of llms. ask a model something harmful and it refuses, that refusal can be shown as a direction in activation space, and jailbreaks work by pushing the model off it. i am mapping what those attacks actually do to the representations, no public repo yet, we will see where it goes.",
    status: "current",
    tags: ["Mechanistic Interpretability", "Refusal Directions", "LLM Safety"],
  },
```

Add `status: "earlier",` to each of the three existing entries (after their `description` field). Touch nothing else in them.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no output. (The page component doesn't reference `status` yet, and `githubUrl` loosening is backward-compatible, so this passes before Task 2.)

---

### Task 2: Two-section rendering in `app/projects/page.tsx`

**Files:**
- Modify: `app/projects/page.tsx` (full rewrite, currently 69 lines)

**Interfaces:**
- Consumes: `Project`, `projects` from `@/lib/projects` (Task 1 shape).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Replace the file content**

```tsx
import { Project, projects } from '@/lib/projects'
import Link from 'next/link'

export const metadata = {
  title: 'Projects | Kaan Hacihaliloglu',
}

function ProjectRow({
  project,
  number,
  delay,
}: {
  project: Project
  number: number
  delay: number
}) {
  return (
    <div
      className="reveal group grid md:grid-cols-[3rem_1fr] gap-4 py-7"
      style={{ '--d': delay } as React.CSSProperties}
    >
      <span className="font-mono text-xs text-muted-dark pt-0.5 group-hover:text-accent transition-colors">
        {String(number).padStart(2, '0')}
      </span>
      <div>
        <h2 className="font-mono text-base font-medium text-heading">
          {project.title}
        </h2>
        <p className="text-sm text-muted leading-relaxed mt-2 max-w-xl">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 font-mono text-[11px] text-muted-dark">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {(project.githubUrl || project.demoUrl) && (
          <div className="flex gap-5 mt-4 font-mono text-xs">
            {project.githubUrl && (
              <Link
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="u-link text-accent hover:text-heading"
              >
                source →
              </Link>
            )}
            {project.demoUrl && (
              <Link
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="u-link text-muted hover:text-accent"
              >
                demo →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Projects() {
  const current = projects.filter((p) => p.status === 'current')
  const earlier = projects.filter((p) => p.status === 'earlier')

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
      <header className="mb-12">
        <h1
          className="reveal font-mono text-lg font-semibold text-heading"
          style={{ '--d': 0 } as React.CSSProperties}
        >
          projects
        </h1>
        <p
          className="reveal text-muted mt-3 max-w-xl leading-relaxed"
          style={{ '--d': 1 } as React.CSSProperties}
        >
          mostly the thesis these days: where refusal lives inside llms. the
          older ml projects moved down to earlier work, they had their time.
        </p>
      </header>

      <div className="divide-y divide-border border-y border-border">
        {current.map((project, i) => (
          <ProjectRow
            key={project.title}
            project={project}
            number={i + 1}
            delay={2 + i}
          />
        ))}
      </div>

      <p
        className="reveal font-mono text-xs text-muted-dark mt-14 mb-2"
        style={{ '--d': 3 + current.length } as React.CSSProperties}
      >
        earlier work
      </p>
      <div className="divide-y divide-border border-y border-border">
        {earlier.map((project, i) => (
          <ProjectRow
            key={project.title}
            project={project}
            number={current.length + i + 1}
            delay={4 + current.length + i}
          />
        ))}
      </div>
    </div>
  )
}
```

Notes for the implementer: `ProjectRow` exists because the row markup is now used by two sections (DRY); numbering continues across sections via `current.length + i + 1`; the `earlier work` label copies the exact classes of the `currently` label on the homepage (`font-mono text-xs text-muted-dark mb-2`) plus `mt-14` for separation.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 3: Homepage hero copy in `app/page.tsx`

**Files:**
- Modify: `app/page.tsx:27-34` (the hero `<p>` only)

**Interfaces:** none.

- [ ] **Step 1: Replace the hero paragraph text**

The `<p className="reveal text-base leading-relaxed max-w-xl mt-6" ...>` element keeps its className and style; only its children change to:

```tsx
          physicist turned ai engineer. my msc thesis was on the refusal
          direction in llms: the place inside the model where &quot;i
          can&apos;t help with that&quot; comes from, and what happens if you
          move it. these days i am at SCL, building an ai based market
          research engine (and still poking at model internals when i can).
```

(`&quot;`/`&apos;` because next lint rejects raw quotes in JSX text.)

- [ ] **Step 2: Lint + typecheck**

Run: `npm run lint && npx tsc --noEmit`
Expected: both exit 0, no unescaped-entities errors.

---

### Task 4: Build + browser verification

**Files:**
- Create: none (throwaway screenshot script goes in the session scratchpad, not the repo)

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: exit 0, all routes compile ( `/`, `/projects`, `/blog`, `/blog/[slug]`, `/resume`).

- [ ] **Step 2: Browser check**

Start `npm run dev` in the background. With Playwright (already installed), screenshot `http://localhost:3000/` and `http://localhost:3000/projects` at desktop (1280px) and mobile (390px) widths. Verify visually:
- hero shows the new paragraph, quotes render as real quotes
- projects page: thesis entry is 01 with NO `source →` link; `earlier work` label; old entries numbered 02-04 with their links intact
- reveal animation delays still stagger top-to-bottom

Then stop the dev server.

- [ ] **Step 3: Show Kaan the result and offer a single commit**

Present screenshots/summary. If he approves committing:

```bash
git add lib/projects.ts app/projects/page.tsx app/page.tsx docs/superpowers/specs/2026-07-04-content-refresh-design.md docs/superpowers/plans/2026-07-04-content-refresh.md
git commit -m "Refresh content: lead with interp thesis, demote coursework to earlier work

Copy written in Kaan's voice via the kaans-voice skill.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

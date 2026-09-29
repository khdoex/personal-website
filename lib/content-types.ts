// The shape of content/site.md once scripts/build-content.mjs has read it.
// The generated module is typed against this, so a change to the parser
// that drifts from what the pages expect fails the typecheck.

/**
 * Text that may carry inline markdown: [text](href), *em*, **strong**.
 * Render it with components/ui/Inline.tsx; lib/inline.ts has plainInline
 * for places that need bare text (meta tags, feeds).
 */
export type InlineText = string

export interface Fact {
  label: string
  value: string
}

export interface CurrentItem {
  since: string
  title: string
  desc: InlineText
  href?: string
}

export interface Project {
  title: string
  description: InlineText
  status: 'current' | 'earlier'
  githubUrl?: string
  tags: string[]
  demoUrl?: string
}

/** What the 3D world shows while a resume entry is being read. */
export type SceneName = 'istanbul' | 'padova' | 'physics' | 'interpretability'

export interface ResumeEntry {
  period: string
  title: string
  org?: string
  href?: string
  orgHref?: string
  summary: string
  detail?: string[]
  scene?: SceneName
}

export interface WorldLabels {
  captions: {
    saturn: string
    blackHole: string
    transformer: string
    refusal: string
    harmful: string
    harmless: string
  }
  /** The prompt the transformer reads, one word per token. */
  prompt: string[]
  answer: string
}

export interface SkillGroup {
  label: string
  items: string
}

export interface SiteContent {
  intro: { lines: string[]; skip: string; replay: string }
  hero: {
    greeting: string
    name?: string
    location: string
    time: string
    scroll: string
    body: InlineText[]
  }
  currently: { label: string; items: CurrentItem[] }
  aboutTeaser: { label: string; link: string; body: InlineText[]; facts: Fact[] }
  resumeTeaser: { label: string; link: string; pdf: string; body: InlineText[] }
  writingTeaser: { label: string; link: string; body: InlineText[] }
  contact: { label: string; email: string; body: InlineText[] }
  about: { story: InlineText[]; handles: InlineText }
  projects: { intro: InlineText[]; items: Project[] }
  writing: { intro: InlineText[] }
  resume: {
    pdf: string
    summary: string
    experience: ResumeEntry[]
    education: ResumeEntry[]
    projects: ResumeEntry[]
    skills: SkillGroup[]
    certifications: ResumeEntry[]
    languages: string
  }
  tr: {
    name: string
    tagline: string
    factsLabel: string
    story: InlineText[]
    facts: Fact[]
    links: { blog: string; projects: string; resume: string; email: string; english: string }
  }
  notFound: { title: string; body: InlineText[] }
  world: WorldLabels
  navigation: { home: string; blog: string; projects: string; about: string; resume: string }
  footer: { line: string }
}

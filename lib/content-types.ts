// The shape of content/site.md once scripts/build-content.mjs has read it.
// The generated module is typed against this, so a change to the parser
// that drifts from what the pages expect fails the typecheck.

/**
 * Text that may carry inline markdown: [text](href), *em*, **strong**.
 * Render it with components/ui/Inline.tsx; lib/inline.ts has plainInline
 * for places that need bare text (meta tags, feeds).
 */
export type InlineText = string

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

export interface StoryChapter {
  title: string
  period?: string
  body: InlineText[]
}

export interface ResumeEntry {
  period: string
  title: string
  org?: string
  href?: string
  orgHref?: string
  summary: string
  detail?: string[]
}

export interface SkillGroup {
  label: string
  items: string
}

export interface SiteContent {
  hero: { role: string; pdf: string; body: InlineText[] }
  currently: { label: string; items: CurrentItem[] }
  writingTeaser: { label: string; link: string; body: InlineText[] }
  contact: { label: string; body: InlineText[] }
  about: { story: InlineText[]; handles: InlineText }
  projects: { intro: InlineText[]; items: Project[] }
  writing: { intro: InlineText[] }
  resume: {
    pdf: string
    summary: string
    /** The story at the top of the page, oldest first. */
    story: { label: string; chapters: StoryChapter[] }
    experience: ResumeEntry[]
    education: ResumeEntry[]
    projects: ResumeEntry[]
    skills: SkillGroup[]
    certifications: ResumeEntry[]
    languages: string
  }
  notFound: { title: string; body: InlineText[] }
  navigation: { home: string; blog: string; projects: string; about: string; resume: string }
  footer: { line: string }
}

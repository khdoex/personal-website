import {
  about,
  experience,
  education,
  resumeProjects,
  skills,
  certifications,
  languages,
  type ResumeEntry,
} from '@/lib/resume'
import Canvas from '@/components/layout/Canvas'
import Gutter from '@/components/layout/Gutter'
import Meta from '@/components/ui/Meta'
import Entry from '@/components/ui/Entry'
import Inline from '@/components/ui/Inline'
import Reveal from '@/components/motion/Reveal'
import JsonLd from '@/components/JsonLd'
import Scrim from '@/components/layout/Scrim'
import { breadcrumbNode, graph, pageMetadata } from '@/lib/seo'
import { content } from '@/lib/content.generated'

export const metadata = pageMetadata({
  absoluteTitle: 'Resume · Kaan Hacihaliloglu, AI Engineer (CV)',
  description:
    'Resume of Kaan Hacihaliloglu: AI Engineer at Synthetic Consumer Lab, with SoundBoost, Live The World and Allianz TR along the way. MSc Data Science at Sabancı, BSc Physics at Boğaziçi. PDF download.',
  path: '/resume',
})

function EntryRow({ entry, delay }: { entry: ResumeEntry; delay: number }) {
  return (
    <Entry
      className="border-t border-border"
      delay={delay}
      gutter={<Meta tone="date">{entry.period}</Meta>}
    >
      <h3 className="font-serif text-lead font-normal text-heading">
        {entry.href ? (
          <a href={entry.href} target="_blank" rel="noopener noreferrer" className="u-link hover:text-accent">
            {entry.title}
          </a>
        ) : (
          entry.title
        )}
        {entry.org && (
          <span className="text-muted">
            {' · '}
            {entry.orgHref ? (
              <a href={entry.orgHref} target="_blank" rel="noopener noreferrer" className="u-link hover:text-accent">
                {entry.org}
              </a>
            ) : (
              entry.org
            )}
          </span>
        )}
      </h3>
      {entry.summary && (
        <p className="mt-2 font-serif text-sm text-muted">{entry.summary}</p>
      )}
      {entry.detail && (
        <details className="mt-3">
          <summary className="inline-block font-mono text-meta text-muted transition-colors hover:text-accent">
            <span className="if-closed">+ detail</span>
            <span className="if-open">− detail</span>
          </summary>
          <ul className="mt-2 space-y-1.5">
            {entry.detail.map((line) => (
              <li key={line} className="border-l border-border pl-4 font-serif text-sm text-muted">
                {line}
              </li>
            ))}
          </ul>
        </details>
      )}
    </Entry>
  )
}

/**
 * The story before the list, oldest first. Each chapter is a station: the
 * world goes to its place while it is read, and the chapters stand tall so
 * each place holds for a while. After the last one the world stays put, and
 * the list below reads over a still scene.
 */
function Story() {
  const { label, chapters } = content.resume.story
  return (
    <>
      <Gutter className="mt-4">
        <Reveal>
          <Meta>{label}</Meta>
        </Reveal>
      </Gutter>
      {chapters.map((chapter, i) => (
        <Entry
          key={chapter.title}
          className="border-t border-border"
          delay={i === 0 ? 0.08 : 0}
          gutter={chapter.period && <Meta tone="date">{chapter.period}</Meta>}
        >
          <div data-station={chapter.scene} className="flex min-h-[62svh] max-w-[30rem] flex-col justify-center">
            <h2 className="font-serif text-h3 font-normal text-heading">{chapter.title}</h2>
            {chapter.body.map((paragraph, k) => (
              <p key={k} className="mt-4 font-serif text-lead text-foreground">
                <Inline text={paragraph} />
              </p>
            ))}
          </div>
        </Entry>
      ))}
    </>
  )
}

// The label leads its own rows. Both arrive on their own viewport entry, so
// the section no longer needs a hand-tuned place in a page-wide cascade.
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <Gutter className="mt-14">
        <Reveal>
          <Meta>{label}</Meta>
        </Reveal>
      </Gutter>
      {children}
    </>
  )
}

export default function Resume() {
  return (
    <Canvas className="pb-28 pt-16 md:pt-24">
      <Scrim window />
      <JsonLd data={graph(breadcrumbNode([{ name: 'Resume', path: '/resume' }]))} />
      <header className="mb-10 lg:col-start-2">
        <Reveal>
          <div className="flex items-baseline justify-between gap-6">
            <h1 className="font-serif text-h2 font-normal text-heading">resume</h1>
            <a
              href="/documents/resume.pdf"
              download="KaanHacihaliloglu_Resume.pdf"
              className="u-link shrink-0 font-mono text-meta text-accent hover:text-heading"
            >
              {content.resume.pdf}
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-4 font-serif text-lead text-muted">{about}</p>
        </Reveal>
      </header>

      <Story />

      <Section label="experience">
        {experience.map((entry, i) => (
          <EntryRow key={entry.title + entry.period} entry={entry} delay={i * 0.08} />
        ))}
      </Section>

      <Section label="education">
        {education.map((entry, i) => (
          <EntryRow key={entry.title} entry={entry} delay={i * 0.08} />
        ))}
      </Section>

      <Section label="projects">
        {resumeProjects.map((entry, i) => (
          <EntryRow key={entry.title} entry={entry} delay={i * 0.08} />
        ))}
      </Section>

      <Section label="skills">
        {skills.map((group, i) => (
          <Entry
            key={group.label}
            className="border-t border-border"
            delay={i * 0.08}
            gutter={<Meta>{group.label}</Meta>}
          >
            <span className="font-serif text-sm text-foreground">{group.items}</span>
          </Entry>
        ))}
      </Section>

      <Section label="certifications">
        {certifications.map((entry, i) => (
          <Entry key={entry.title} className="border-t border-border" delay={i * 0.08}>
            <span className="font-serif text-sm text-heading">{entry.title}</span>
            <Meta className="ml-3">
              {entry.org}
            </Meta>
          </Entry>
        ))}
      </Section>

      <Section label="languages">
        <Entry className="border-t border-border" delay={0}>
          <span className="font-serif text-sm text-foreground">{languages}</span>
        </Entry>
      </Section>
    </Canvas>
  )
}

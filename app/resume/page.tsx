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
import Reveal from '@/components/motion/Reveal'

export const metadata = {
  title: 'Resume | Kaan Hacihaliloglu',
}

function EntryRow({ entry }: { entry: ResumeEntry }) {
  return (
    <Entry className="border-t border-border" gutter={<Meta tone="date">{entry.period}</Meta>}>
      <h3 className="font-serif text-lead font-normal text-heading">
        {entry.href ? (
          <a href={entry.href} target="_blank" rel="noopener noreferrer" className="u-link hover:text-accent">
            {entry.title} ↗
          </a>
        ) : (
          entry.title
        )}
        {entry.org && (
          <span className="text-muted">
            {' · '}
            {entry.orgHref ? (
              <a href={entry.orgHref} target="_blank" rel="noopener noreferrer" className="u-link hover:text-accent">
                {entry.org} ↗
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

function Section({
  label,
  delay,
  children,
}: {
  label: string
  delay: number
  children: React.ReactNode
}) {
  return (
    <>
      <Gutter className="mt-14">
        <Reveal delay={delay}>
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
      <header className="mb-10 lg:col-start-2">
        <Reveal>
          <div className="flex items-baseline justify-between gap-6">
            <h1 className="font-serif text-h2 font-normal text-heading">resume</h1>
            <a
              href="/documents/resume.pdf"
              download="KaanHacihaliloglu_Resume.pdf"
              className="u-link shrink-0 font-mono text-meta text-accent hover:text-heading"
            >
              download pdf ↓
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-4 font-serif text-lead text-muted">{about}</p>
        </Reveal>
      </header>

      <Section label="experience" delay={0.16}>
        {experience.map((entry) => (
          <EntryRow key={entry.title + entry.period} entry={entry} />
        ))}
      </Section>

      <Section label="education" delay={0.24}>
        {education.map((entry) => (
          <EntryRow key={entry.title} entry={entry} />
        ))}
      </Section>

      <Section label="projects" delay={0.32}>
        {resumeProjects.map((entry) => (
          <EntryRow key={entry.title} entry={entry} />
        ))}
      </Section>

      <Gutter className="mt-14">
        <Meta>skills</Meta>
      </Gutter>
      {skills.map((group) => (
        <Entry key={group.label} className="border-t border-border" gutter={<Meta>{group.label}</Meta>}>
          <span className="font-serif text-sm text-foreground">{group.items}</span>
        </Entry>
      ))}

      <Gutter className="mt-14">
        <Meta>certifications</Meta>
      </Gutter>
      {certifications.map((entry) => (
        <Entry key={entry.title} className="border-t border-border">
          <span className="font-serif text-sm text-heading">{entry.title}</span>
          <Meta className="ml-3">
            {entry.org}
          </Meta>
        </Entry>
      ))}

      <Gutter className="mt-14">
        <Meta>languages</Meta>
      </Gutter>
      <Entry className="border-t border-border">
        <span className="font-serif text-sm text-foreground">{languages}</span>
      </Entry>
    </Canvas>
  )
}

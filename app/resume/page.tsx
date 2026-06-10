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

export const metadata = {
  title: 'Resume | Kaan Hacihaliloglu',
}

function EntryRow({ entry }: { entry: ResumeEntry }) {
  return (
    <div className="grid md:grid-cols-[7rem_1fr] gap-x-6 gap-y-1 py-5">
      <span className="font-mono text-xs text-amber pt-0.5">{entry.period}</span>
      <div>
        <h3 className="font-mono text-sm font-medium text-heading">
          {entry.href ? (
            <a
              href={entry.href}
              target="_blank"
              rel="noopener noreferrer"
              className="u-link hover:text-accent"
            >
              {entry.title} ↗
            </a>
          ) : (
            entry.title
          )}
          {entry.org && <span className="text-muted font-normal"> · {entry.org}</span>}
        </h3>
        {entry.summary && (
          <p className="text-sm text-muted leading-relaxed mt-1.5 max-w-xl">
            {entry.summary}
          </p>
        )}
        {entry.detail && (
          <details className="mt-2">
            <summary className="font-mono text-xs text-muted-dark hover:text-accent transition-colors inline-block">
              <span className="if-closed">+ detail</span>
              <span className="if-open">− detail</span>
            </summary>
            <ul className="mt-2 space-y-1.5">
              {entry.detail.map((line) => (
                <li key={line} className="text-sm text-muted leading-relaxed max-w-xl pl-4 border-l border-border">
                  {line}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  )
}

function Section({ label, children, delay }: { label: string; children: React.ReactNode; delay: number }) {
  return (
    <section className="reveal mb-12" style={{ '--d': delay } as React.CSSProperties}>
      <p className="font-mono text-xs text-muted-dark mb-2">{label}</p>
      <div className="divide-y divide-border border-y border-border">
        {children}
      </div>
    </section>
  )
}

export default function Resume() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
      <header className="mb-10">
        <div className="reveal flex items-baseline justify-between gap-6" style={{ '--d': 0 } as React.CSSProperties}>
          <h1 className="font-mono text-lg font-semibold text-heading">resume</h1>
          <a
            href="/documents/resume.pdf"
            download="KaanHacihaliloglu_Resume.pdf"
            className="u-link font-mono text-xs text-accent hover:text-heading shrink-0"
          >
            download pdf ↓
          </a>
        </div>
        <p className="reveal text-muted mt-4 max-w-xl leading-relaxed" style={{ '--d': 1 } as React.CSSProperties}>
          {about}
        </p>
      </header>

      <Section label="experience" delay={2}>
        {experience.map((entry) => (
          <EntryRow key={entry.title + entry.period} entry={entry} />
        ))}
      </Section>

      <Section label="education" delay={3}>
        {education.map((entry) => (
          <EntryRow key={entry.title} entry={entry} />
        ))}
      </Section>

      <Section label="projects" delay={4}>
        {resumeProjects.map((entry) => (
          <EntryRow key={entry.title} entry={entry} />
        ))}
      </Section>

      <section className="reveal mb-12" style={{ '--d': 5 } as React.CSSProperties}>
        <p className="font-mono text-xs text-muted-dark mb-2">skills</p>
        <div className="border-y border-border divide-y divide-border">
          {skills.map((group) => (
            <div key={group.label} className="grid md:grid-cols-[10rem_1fr] gap-x-6 gap-y-1 py-3">
              <span className="font-mono text-xs text-muted-dark pt-0.5">{group.label}</span>
              <span className="text-sm text-foreground">{group.items}</span>
            </div>
          ))}
        </div>
      </section>

      <Section label="certifications" delay={6}>
        {certifications.map((entry) => (
          <div key={entry.title} className="py-3 font-mono text-xs">
            <span className="text-heading">{entry.title}</span>
            <span className="text-muted-dark"> · {entry.org}</span>
          </div>
        ))}
      </Section>

      <section className="reveal" style={{ '--d': 7 } as React.CSSProperties}>
        <p className="font-mono text-xs text-muted-dark mb-2">languages</p>
        <p className="text-sm text-foreground border-y border-border py-3">{languages}</p>
      </section>
    </div>
  )
}

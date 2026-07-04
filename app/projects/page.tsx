import { Project, projects } from '@/lib/projects'
import Link from 'next/link'
import Reveal from '@/components/motion/Reveal'

export const metadata = {
  title: 'Projects | Kaan Hacihaliloglu',
}

function ProjectRow({ project, number }: { project: Project; number: number }) {
  return (
    <Reveal className="group grid md:grid-cols-[3rem_1fr] gap-4 py-7">
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
    </Reveal>
  )
}

export default function Projects() {
  const current = projects.filter((p) => p.status === 'current')
  const earlier = projects.filter((p) => p.status === 'earlier')

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
      <header className="mb-12">
        <Reveal>
          <h1 className="font-mono text-lg font-semibold text-heading">
            projects
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-muted mt-3 max-w-xl leading-relaxed">
            mostly the thesis these days: where refusal lives inside llms. the
            older ml projects moved down to earlier work, they had their time.
          </p>
        </Reveal>
      </header>

      <div className="divide-y divide-border border-y border-border">
        {current.map((project, i) => (
          <ProjectRow key={project.title} project={project} number={i + 1} />
        ))}
      </div>

      <Reveal className="mt-14 mb-2">
        <p className="font-mono text-xs text-muted-dark">earlier work</p>
      </Reveal>
      <div className="divide-y divide-border border-y border-border">
        {earlier.map((project, i) => (
          <ProjectRow
            key={project.title}
            project={project}
            number={current.length + i + 1}
          />
        ))}
      </div>
    </div>
  )
}

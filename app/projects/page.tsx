import { projects } from '@/lib/projects'
import Link from 'next/link'

export const metadata = {
  title: 'Projects | Kaan Hacihaliloglu',
}

export default function Projects() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
      <header className="mb-12">
        <h1 className="reveal font-mono text-lg font-semibold text-heading" style={{ '--d': 0 } as React.CSSProperties}>
          projects
        </h1>
        <p className="reveal text-muted mt-3 max-w-xl leading-relaxed" style={{ '--d': 1 } as React.CSSProperties}>
          Research projects, ML implementations, and competition solutions.
        </p>
      </header>

      <div className="divide-y divide-border border-y border-border">
        {projects.map((project, i) => (
          <div
            key={project.title}
            className="reveal group grid md:grid-cols-[3rem_1fr] gap-4 py-7"
            style={{ '--d': 2 + i } as React.CSSProperties}
          >
            <span className="font-mono text-xs text-muted-dark pt-0.5 group-hover:text-accent transition-colors">
              {String(i + 1).padStart(2, '0')}
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
              <div className="flex gap-5 mt-4 font-mono text-xs">
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-link text-accent hover:text-heading"
                >
                  source →
                </Link>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

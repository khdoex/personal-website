import { projects } from '@/lib/projects'
import { Github, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function Projects() {
  return (
    <div className="animate-fade-in">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-16">
        <div className="mb-12">
          <p className="font-mono text-sm text-accent mb-2">~/projects</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
            Projects
          </h1>
          <p className="text-muted mt-3 max-w-xl">
            Research projects, ML implementations, and competition solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="group border border-border rounded-lg overflow-hidden hover:border-accent/40 transition-all"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted">[{String(index + 1).padStart(2, '0')}]</span>
                  <h2 className="font-mono text-base font-semibold text-white group-hover:text-accent transition-colors">
                    {project.title}
                  </h2>
                </div>

                <p className="text-sm text-muted leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 font-mono text-xs border border-border rounded text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3 pt-1">
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:text-accent-light transition-colors"
                  >
                    <Github size={14} /> source
                  </Link>
                  {project.demoUrl && (
                    <Link
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-terminal-amber hover:text-white transition-colors"
                    >
                      <ExternalLink size={14} /> demo
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

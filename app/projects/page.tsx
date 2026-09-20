import { Project, projects } from '@/lib/projects'
import Link from 'next/link'
import Canvas from '@/components/layout/Canvas'
import Gutter from '@/components/layout/Gutter'
import Rule from '@/components/ui/Rule'
import Meta from '@/components/ui/Meta'
import Entry from '@/components/ui/Entry'
import Reveal from '@/components/motion/Reveal'

export const metadata = {
  title: 'Projects | Kaan Hacihaliloglu',
}

// Shared body for a project: title, description, tags, links. The wrapper
// around it differs by section — the current project sits in an Entry with
// its own gutter cell, the earlier ones sit under one shared sticky label —
// so the wrapper is not this component's concern.
function ProjectBody({ project }: { project: Project }) {
  return (
    <>
      <h2 className="font-serif text-h3 font-normal text-heading">{project.title}</h2>
      <p className="mt-3 font-serif text-base text-foreground">{project.description}</p>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {project.tags.map((tag) => (
          <li key={tag}>
            <Meta>{tag}</Meta>
          </li>
        ))}
      </ul>
      {(project.githubUrl || project.demoUrl) && (
        <p className="mt-4 flex gap-5">
          {project.githubUrl && (
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="u-link font-mono text-meta text-accent hover:text-heading"
            >
              source →
            </Link>
          )}
          {project.demoUrl && (
            <Link
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="u-link font-mono text-meta text-accent hover:text-heading"
            >
              demo →
            </Link>
          )}
        </p>
      )}
    </>
  )
}

function ProjectEntry({ project }: { project: Project }) {
  return (
    <Entry className="border-t border-border" gutter={<Meta>active</Meta>}>
      <ProjectBody project={project} />
    </Entry>
  )
}

export default function Projects() {
  const current = projects.filter((p) => p.status === 'current')
  const earlier = projects.filter((p) => p.status === 'earlier')

  return (
    <Canvas className="pb-28 pt-16 md:pt-24">
      <header className="mb-16 lg:col-start-2">
        <Reveal>
          <h1 className="font-serif text-h2 font-normal text-heading">projects</h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-4 font-serif text-lead text-muted">
            mostly the thesis these days: where refusal lives inside llms. the
            older ml projects moved down to earlier work, they had their time.
          </p>
        </Reveal>
      </header>

      {current.map((project) => (
        <ProjectEntry key={project.title} project={project} />
      ))}

      <Rule className="col-span-full mt-16" />

      <div className="col-span-full mt-8 grid grid-cols-1 lg:grid-cols-subgrid">
        <Gutter sticky>
          <Meta>earlier work</Meta>
        </Gutter>

        <div className="lg:col-start-2">
          {earlier.map((project) => (
            <div key={project.title} className="border-t border-border py-7">
              <ProjectBody project={project} />
            </div>
          ))}
        </div>
      </div>
    </Canvas>
  )
}

import PageNav from '@/components/PageNav'
import { projects } from '@/lib/projects'
import { Github, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function Projects() {
  return (
    <main className="min-h-screen p-8">
      <PageNav title="Projects" />
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              key={project.title}
              className="block group"
            >
              <div className="h-full bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-all duration-300 border border-gray-700/50 hover:border-gray-600 cursor-pointer">
                {project.image && (
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {project.title}
                </h2>
                
                <p className="text-gray-300 mb-4 line-clamp-3">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 text-sm bg-gray-700/50 text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <span
                    className="flex items-center gap-2 text-gray-300 group-hover:text-white transition-colors"
                  >
                    <Github size={20} />
                    <span>View on GitHub</span>
                  </span>
                  {project.demoUrl && (
                    <span
                      onClick={(e) => {
                        e.preventDefault()
                        window.open(project.demoUrl, '_blank')
                      }}
                      className="flex items-center gap-2 text-gray-300 group-hover:text-white transition-colors"
                    >
                      <ExternalLink size={20} />
                      <span>Live Demo</span>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
} 
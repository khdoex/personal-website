import PageNav from '@/components/PageNav'
import { projects } from '@/lib/projects'
import { Github, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Projects() {
  return (
    <main className="min-h-screen p-8 relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 -z-[5]" />
      
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
              <div className="h-full bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/10 shadow-xl 
                           hover:bg-black/50 transition-all duration-300 hover:border-white/20">
                {project.image && (
                  <div className="mb-4 overflow-hidden rounded-lg relative h-48">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors drop-shadow-lg">
                  {project.title}
                </h2>
                
                <p className="text-white/90 mb-4 line-clamp-3 drop-shadow-md">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 text-sm bg-white/10 text-white/80 rounded backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <span className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                    <Github size={20} />
                    <span>View on GitHub</span>
                  </span>
                  {project.demoUrl && (
                    <span
                      onClick={(e) => {
                        e.preventDefault()
                        window.open(project.demoUrl, '_blank')
                      }}
                      className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors"
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
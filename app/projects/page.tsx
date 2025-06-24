import PageNav from '@/components/PageNav'
import { projects } from '@/lib/projects'
import { Github, ExternalLink, Star, GitFork } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Projects() {
  return (
    <main className="min-h-screen relative">
      
      <div className="max-w-6xl mx-auto px-8 py-8">
        <PageNav title="Technical Portfolio" />
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            A collection of research projects, machine learning implementations, and software solutions 
            demonstrating expertise in data science, AI, and software engineering.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl 
                         hover:bg-white/10 transition-all duration-500 hover:border-white/20 hover:transform hover:scale-[1.02]"
            >
              {project.image && (
                <div className="mb-6 overflow-hidden rounded-xl relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300 leading-tight">
                  {project.title}
                </h2>
                
                <p className="text-white/80 leading-relaxed text-lg">
                  {project.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1.5 text-sm bg-white/10 text-white/90 rounded-full backdrop-blur-sm 
                               border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 
                             rounded-lg font-medium transition-all duration-300 border border-white/20 
                             hover:border-white/40 group/btn flex-1 justify-center"
                  >
                    <Github size={20} className="group-hover/btn:rotate-12 transition-transform" />
                    <span>View Source</span>
                  </Link>
                  
                  {project.demoUrl && (
                    <Link
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 
                               rounded-lg font-medium transition-all duration-300 group/btn flex-1 justify-center"
                    >
                      <ExternalLink size={20} className="group-hover/btn:rotate-12 transition-transform" />
                      <span>Live Demo</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Project Number Badge */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center 
                            text-white/60 text-sm font-medium backdrop-blur-sm">
                {String(index + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Interested in Collaboration?</h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              I'm always open to discussing new projects, research opportunities, 
              or innovative applications of machine learning and AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="mailto:kaanhacihaliloglu@gmail.com"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 
                         rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105"
              >
                Get In Touch
              </Link>
              <Link 
                href="/resume"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 
                         rounded-lg font-semibold transition-all duration-300 border border-white/20 hover:border-white/40"
              >
                View Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 
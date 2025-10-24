import { projects } from '@/lib/projects'
import { Github, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Projects() {
  return (
    <div className="animate-fade-in">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Technical Portfolio
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed">
            A collection of research projects, machine learning implementations, and software
            solutions demonstrating expertise in data science and AI.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {projects.map((project) => (
            <article
              key={project.title}
              className="group border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 hover:bg-zinc-900/30 transition-all"
            >
              {project.image && (
                <div className="relative h-48 bg-zinc-900 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}

              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h2>

                <p className="text-zinc-400 leading-relaxed">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-zinc-900 text-zinc-300 rounded-full border border-zinc-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-400 hover:text-white font-medium text-sm transition-colors"
                  >
                    <Github size={18} />
                    <span>Source</span>
                  </Link>

                  {project.demoUrl && (
                    <Link
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                    >
                      <ExternalLink size={18} />
                      <span>Live Demo</span>
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Call to Action */}
        <div className="max-w-2xl mx-auto text-center p-8 border border-zinc-800 rounded-xl bg-zinc-900/30">
          <h3 className="text-2xl font-semibold mb-3 text-white">Interested in Collaboration?</h3>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            I'm always open to discussing new projects, research opportunities, or innovative
            applications of machine learning and AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="mailto:kaanhacihaliloglu@gmail.com"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Get In Touch
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View Resume
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

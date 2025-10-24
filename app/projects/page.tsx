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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Technical Portfolio
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed">
            A collection of research projects, machine learning implementations, and software
            solutions demonstrating expertise in data science and AI.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {projects.map((project) => (
            <article
              key={project.title}
              className="group border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all"
            >
              {project.image && (
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}

              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h2>

                <p className="text-gray-600 leading-relaxed">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full border border-gray-200"
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
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
                  >
                    <Github size={18} />
                    <span>Source</span>
                  </Link>

                  {project.demoUrl && (
                    <Link
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
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
        <div className="max-w-2xl mx-auto text-center p-8 border border-gray-200 rounded-xl bg-gray-50">
          <h3 className="text-2xl font-semibold mb-3">Interested in Collaboration?</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
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
              className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View Resume
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

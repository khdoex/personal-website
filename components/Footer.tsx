'use client'

import Link from 'next/link'
import { Github, Mail, Twitter, MapPin, GraduationCap, Calendar } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black/60 backdrop-blur-sm border-t border-white/10 mt-16">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Kaan Hacıhaliloğlu</h3>
            <p className="text-white/80 leading-relaxed">
              Data Scientist & AI Engineer pursuing MSc in Data Science at Sabanci University. 
              Specializing in machine learning, NLP, computer vision, and generative AI.
            </p>
            <div className="flex items-center gap-2 text-white/70">
              <MapPin size={16} />
              <span>Istanbul, Turkey</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <GraduationCap size={16} />
              <span>Sabanci University - MSc Data Science</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/projects" className="text-white/80 hover:text-blue-300 transition-colors">
                Projects
              </Link>
              <Link href="/blog" className="text-white/80 hover:text-blue-300 transition-colors">
                Research Blog
              </Link>
              <Link href="/media" className="text-white/80 hover:text-blue-300 transition-colors">
                AI Creations
              </Link>
              <Link href="/resume" className="text-white/80 hover:text-blue-300 transition-colors">
                Resume
              </Link>
            </div>
            <div className="pt-4">
              <Link 
                href="mailto:kaanhacihaliloglu@gmail.com"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                <Mail size={16} />
                Get In Touch
              </Link>
            </div>
          </div>

          {/* Research Interests & Connect */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Research Focus</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                'Machine Learning',
                'NLP',
                'Computer Vision', 
                'Audio AI',
                'Generative Models',
                'Data Science'
              ].map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 text-sm bg-white/10 text-white/90 rounded-full backdrop-blur-sm border border-white/20"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              <a
                href="https://github.com/khdoex"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://x.com/kaanhho"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                aria-label="Twitter/X"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:kaanhacihaliloglu@gmail.com"
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/60 text-sm">
            © {currentYear} Kaan Hacıhaliloğlu. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
            <span className="hidden md:inline">•</span>
            <span>Built with Next.js & TypeScript</span>
          </div>
        </div>
      </div>
    </footer>
  )
} 
import Link from 'next/link'
import { Github, Mail, Twitter } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Kaan Hacıhaliloğlu</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Data Scientist & AI Researcher pursuing MSc in Data Science at Sabanci University,
              Istanbul.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/projects" className="text-gray-600 hover:text-gray-900 transition-colors">
                Projects
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">
                Blog
              </Link>
              <Link href="/media" className="text-gray-600 hover:text-gray-900 transition-colors">
                Media
              </Link>
              <Link href="/resume" className="text-gray-600 hover:text-gray-900 transition-colors">
                Resume
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com/khdoex"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://x.com/kaanhho"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                aria-label="Twitter/X"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:kaanhacihaliloglu@gmail.com"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-600">
          <div>© {currentYear} Kaan Hacıhaliloğlu. All rights reserved.</div>
          <div>Built with Next.js & TypeScript</div>
        </div>
      </div>
    </footer>
  )
}

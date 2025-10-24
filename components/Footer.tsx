import Link from 'next/link'
import { Github, Mail, Twitter } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-800 bg-black/50 mt-auto">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-white">Kaan Hacıhaliloğlu</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Data Scientist & AI Researcher pursuing MSc in Data Science at Sabanci University,
              Istanbul.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-white">Quick Links</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/projects" className="text-zinc-400 hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/blog" className="text-zinc-400 hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/media" className="text-zinc-400 hover:text-white transition-colors">
                Media
              </Link>
              <Link href="/resume" className="text-zinc-400 hover:text-white transition-colors">
                Resume
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-white">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com/khdoex"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://x.com/kaanhho"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                aria-label="Twitter/X"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:kaanhacihaliloglu@gmail.com"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-zinc-500">
          <div>© {currentYear} Kaan Hacıhaliloğlu. All rights reserved.</div>
          <div>Built with Next.js & TypeScript</div>
        </div>
      </div>
    </footer>
  )
}

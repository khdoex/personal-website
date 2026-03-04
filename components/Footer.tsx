import { Github, Mail, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-sm text-muted">
            &copy; {new Date().getFullYear()} kaan_h
          </span>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/khdoex"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent transition-colors"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
            <a
              href="https://x.com/kaanhho"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent transition-colors"
              aria-label="X"
            >
              <Twitter size={18} />
            </a>
            <a
              href="mailto:kaanhacihaliloglu@gmail.com"
              className="text-muted hover:text-accent transition-colors"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

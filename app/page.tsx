import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 py-20 md:py-28">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white font-mono leading-[1.1]">
            kaan hho<span className="text-terminal-cursor animate-blink">_</span>
          </h1>

          <p className="text-lg text-foreground max-w-2xl leading-relaxed">
            Working on LLM interpretability & safety. Building AI systems
            at SCL Synthetic Consumer Lab. MSc Data Science @ Sabanci University.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 bg-accent-deep hover:bg-accent-deep/80 text-white px-5 py-2.5 rounded font-mono text-sm transition-colors"
            >
              <span className="text-terminal-green">&gt;</span> view_projects
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 border border-border hover:border-accent/40 hover:bg-surface text-foreground px-5 py-2.5 rounded font-mono text-sm transition-colors"
            >
              <span className="text-terminal-green">&gt;</span> resume
            </Link>
            <Link
              href="mailto:kaanhacihaliloglu@gmail.com"
              className="inline-flex items-center gap-2 border border-border hover:border-accent/40 hover:bg-surface text-foreground px-5 py-2.5 rounded font-mono text-sm transition-colors"
            >
              <span className="text-terminal-green">&gt;</span> contact
            </Link>
          </div>
        </div>
      </section>

      {/* Current Work */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 pb-16">
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-surface border-b border-border flex items-center gap-2">
            <span className="font-mono text-xs text-muted">~</span>
            <span className="font-mono text-xs text-accent">current_work</span>
          </div>

          <div className="divide-y divide-border">
            <div className="p-5 hover:bg-surface/50 transition-colors">
              <div className="flex items-start gap-3">
                <span className="font-mono text-sm text-terminal-green mt-0.5">&gt;</span>
                <div>
                  <h3 className="font-mono text-base font-semibold text-white">LLM Interpretability & Safety</h3>
                  <p className="text-sm text-muted mt-1">Research on mechanistic interpretability and alignment</p>
                </div>
              </div>
            </div>

            <div className="p-5 hover:bg-surface/50 transition-colors">
              <div className="flex items-start gap-3">
                <span className="font-mono text-sm text-terminal-green mt-0.5">&gt;</span>
                <div>
                  <h3 className="font-mono text-base font-semibold text-white">SCL Synthetic Consumer Lab</h3>
                  <p className="text-sm text-muted mt-1">AI Engineer — building intelligent consumer simulation systems</p>
                </div>
              </div>
            </div>

            <div className="p-5 hover:bg-surface/50 transition-colors">
              <div className="flex items-start gap-3">
                <span className="font-mono text-sm text-terminal-green mt-0.5">&gt;</span>
                <div>
                  <h3 className="font-mono text-base font-semibold text-white">MSc Data Science — Sabanci University</h3>
                  <p className="text-sm text-muted mt-1">Graduate studies in machine learning and data science</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Grid */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { href: '/blog', label: '/blog', desc: 'Writing about ML and AI research' },
            { href: '/projects', label: '/projects', desc: 'Technical work & competition solutions' },
            { href: '/media', label: '/media', desc: 'Generative AI experiments' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block p-5 border border-border rounded-lg hover:border-accent/40 hover:bg-surface/50 transition-all"
            >
              <h3 className="font-mono text-base font-semibold text-white group-hover:text-accent transition-colors">
                {item.label}
              </h3>
              <p className="text-sm text-muted mt-1.5">{item.desc}</p>
              <div className="flex items-center gap-1.5 mt-3 font-mono text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                explore <ArrowRight size={12} />
              </div>
            </Link>
          ))}

          <div className="p-5 border border-border rounded-lg bg-surface/30">
            <h3 className="font-mono text-base font-semibold text-white">/about</h3>
            <p className="text-sm text-muted mt-1.5">Istanbul, Turkey</p>
            <div className="flex gap-3 mt-3 font-mono text-xs text-muted">
              <a href="https://github.com/khdoex" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">github</a>
              <a href="https://x.com/kaanhho" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">x.com</a>
              <a href="mailto:kaanhacihaliloglu@gmail.com" className="hover:text-accent transition-colors">email</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

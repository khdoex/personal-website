import Link from 'next/link'

const currently = [
  {
    title: 'Mechanistic Interpretability',
    desc: 'Investigating how refusal behavior and safety representations are encoded inside large language models',
  },
  {
    title: 'SCL · Synthetic Consumer Lab',
    desc: 'AI Engineer building synthetic consumer systems for realistic behavior simulation and market research workflows',
  },
  {
    title: 'MSc Data Science, Sabancı University',
    desc: 'Thesis on refusal direction analysis in large language models',
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 pt-24 md:pt-36 pb-20">
        <p className="reveal font-mono text-[13px] tracking-[0.2em] uppercase text-muted" style={{ '--d': 0 } as React.CSSProperties}>
          Kaan Hacihaliloglu · AI engineer &amp; researcher
        </p>

        <h1
          className="reveal font-display text-5xl md:text-7xl leading-[1.05] tracking-tight text-foreground mt-6"
          style={{ '--d': 1 } as React.CSSProperties}
        >
          Taking language models apart,{' '}
          <em>one refusal at a time.</em>
        </h1>

        <p
          className="reveal text-lg leading-relaxed text-muted max-w-xl mt-8"
          style={{ '--d': 2 } as React.CSSProperties}
        >
          I work on mechanistic interpretability, studying how safety and
          refusal behavior are represented inside large language models. At
          SCL, I build synthetic consumer AI systems.
        </p>

        <div
          className="reveal flex flex-wrap items-center gap-x-8 gap-y-3 mt-10 font-mono text-sm"
          style={{ '--d': 3 } as React.CSSProperties}
        >
          <Link href="/blog" className="u-link text-foreground hover:text-accent">
            read the blog →
          </Link>
          <Link href="/projects" className="u-link text-muted hover:text-accent">
            projects
          </Link>
          <Link href="/resume" className="u-link text-muted hover:text-accent">
            resume
          </Link>
          <a href="mailto:kaanhacihaliloglu@gmail.com" className="u-link text-muted hover:text-accent">
            say hello
          </a>
        </div>
      </section>

      {/* Currently */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 pb-28">
        <p
          className="reveal font-mono text-[13px] tracking-[0.2em] uppercase text-muted-dark mb-2"
          style={{ '--d': 4 } as React.CSSProperties}
        >
          Currently
        </p>

        <div className="divide-y divide-border border-y border-border">
          {currently.map((item, i) => (
            <div
              key={item.title}
              className="reveal group grid grid-cols-[3rem_1fr] gap-4 py-7 transition-colors"
              style={{ '--d': 5 + i } as React.CSSProperties}
            >
              <span className="font-mono text-xs text-muted-dark pt-1.5 group-hover:text-accent transition-colors">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h2 className="font-serif text-xl text-foreground group-hover:translate-x-1 transition-transform duration-300">
                  {item.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed mt-1.5 max-w-xl">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

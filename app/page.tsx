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
      <section className="max-w-3xl mx-auto px-6 md:px-8 pt-24 md:pt-32 pb-20">
        <h1 className="reveal font-mono text-lg font-semibold text-heading" style={{ '--d': 0 } as React.CSSProperties}>
          kaan hacihaliloglu
        </h1>

        <p
          className="reveal text-base leading-relaxed max-w-xl mt-6"
          style={{ '--d': 1 } as React.CSSProperties}
        >
          Physicist turned AI engineer, interested in what&apos;s actually
          happening inside language models and building products in the day
          at SCL.
        </p>

        <div
          className="reveal flex flex-wrap items-center gap-x-7 gap-y-3 mt-10 font-mono text-[13px]"
          style={{ '--d': 2 } as React.CSSProperties}
        >
          <Link href="/blog" className="u-link text-heading hover:text-accent">
            blog →
          </Link>
          <Link href="/projects" className="u-link text-muted hover:text-accent">
            projects
          </Link>
          <Link href="/resume" className="u-link text-muted hover:text-accent">
            resume
          </Link>
          <a href="mailto:kaanhacihaliloglu@gmail.com" className="u-link text-muted hover:text-accent">
            email
          </a>
        </div>
      </section>

      {/* Currently */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 pb-28">
        <p
          className="reveal font-mono text-xs text-muted-dark mb-2"
          style={{ '--d': 3 } as React.CSSProperties}
        >
          currently
        </p>

        <div className="divide-y divide-border border-y border-border">
          {currently.map((item, i) => (
            <div
              key={item.title}
              className="reveal group grid grid-cols-[3rem_1fr] gap-4 py-6"
              style={{ '--d': 4 + i } as React.CSSProperties}
            >
              <span className="font-mono text-xs text-muted-dark pt-0.5 group-hover:text-accent transition-colors">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h2 className="font-mono text-base font-medium text-heading">
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

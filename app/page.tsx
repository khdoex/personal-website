import Link from 'next/link'
import Reveal from '@/components/motion/Reveal'

export default function Home() {
  return (
    <div>
      {/* Hero — the currently list moved to /about; the landing stays quiet */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 pt-24 md:pt-32 pb-28">
        <Reveal>
          <h1 className="font-mono text-lg font-semibold text-heading">
            kaan hacihaliloglu
          </h1>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="text-base leading-relaxed max-w-xl mt-6">
            physicist turned ai engineer. my msc thesis was on the refusal
            direction in llms: the place inside the model where &quot;i
            can&apos;t help with that&quot; comes from, and what happens if you
            move it. these days i am at SCL, building an ai based market
            research engine (and still poking at model internals when i can).
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 mt-10 font-mono text-[13px]">
            <Link href="/blog" className="u-link text-heading hover:text-accent">
              blog →
            </Link>
            <Link href="/projects" className="u-link text-muted hover:text-accent">
              projects
            </Link>
            <Link href="/about" className="u-link text-muted hover:text-accent">
              about
            </Link>
            <Link href="/resume" className="u-link text-muted hover:text-accent">
              resume
            </Link>
            <a href="mailto:kaanhacihaliloglu@gmail.com" className="u-link text-muted hover:text-accent">
              email
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

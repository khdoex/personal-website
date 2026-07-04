import AboutHero from '@/components/AboutHero'
import Reveal from '@/components/motion/Reveal'

export const metadata = {
  title: 'About | Kaan Hacihaliloglu',
}

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

const story = [
  <>
    i studied physics, and it left me one habit i cannot turn off: asking what
    is actually happening underneath. most of ai today runs on models nobody
    can fully open up and read. that is either scary or interesting, i picked
    interesting.
  </>,
  <>
    after physics i tried a computer science master&apos;s in padova. it did
    not work out, and i wrote about why on the blog, in turkish. the short
    version: i could not feel myself getting better, so i stopped. it was the
    right call, i still think about it though.
  </>,
  <>
    now my thesis at sabanci is on the refusal direction in llms. when a model
    says &quot;i can&apos;t help with that&quot;, something specific happens
    inside, and it can be shown as a direction in activation space. i am
    mapping how jailbreaks move the model off that direction, and what that
    means for defense (or attack).
  </>,
  <>
    at SCL i build an ai based market research engine: synthetic consumers
    that behave like real ones, which is a strange sentence to write. days are
    product, nights are model internals. the two feed each other more than i
    expected, we will see where it goes.
  </>,
]

export default function About() {
  return (
    <div className="pb-28">
      <AboutHero>
        <div className="space-y-5 mt-8">
          {story.map((paragraph, i) => (
            <Reveal key={i} delay={i === 0 ? 0.08 : 0}>
              <p className="text-base leading-relaxed">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </AboutHero>

      {/* Currently — moved here from the homepage */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 pt-8">
        <Reveal>
          <p className="font-mono text-xs text-muted-dark mb-2">currently</p>
        </Reveal>

        <div className="divide-y divide-border border-y border-border">
          {currently.map((item, i) => (
            <Reveal
              key={item.title}
              className="group grid grid-cols-[3rem_1fr] gap-4 py-6"
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
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}

import AboutHero from '@/components/AboutHero'
import { currently } from '@/lib/currently'
import Canvas from '@/components/layout/Canvas'
import Gutter from '@/components/layout/Gutter'
import Rule from '@/components/ui/Rule'
import Meta from '@/components/ui/Meta'
import Entry from '@/components/ui/Entry'
import Reveal from '@/components/motion/Reveal'

export const metadata = {
  title: 'About | Kaan Hacihaliloglu',
}

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
        <div className="mt-8 space-y-6">
          {story.map((paragraph, i) => (
            <Reveal key={i} delay={i === 0 ? 0.08 : 0}>
              <p className="font-serif text-base text-foreground">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </AboutHero>

      <Canvas className="pt-8">
        <Rule className="col-span-full" />

        <Gutter className="mt-8">
          <Meta>currently</Meta>
        </Gutter>

        {currently.map((item, i) => (
          <Entry
            key={item.title}
            delay={i * 0.08}
            gutter={<Meta tone="date">{item.since}</Meta>}
          >
            <h2 className="font-serif text-lead font-normal text-heading">
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-link hover:text-accent"
                >
                  {item.title} ↗
                </a>
              ) : (
                item.title
              )}
            </h2>
            <p className="mt-2 font-serif text-sm text-muted">{item.desc}</p>
          </Entry>
        ))}

        <p className="mt-10 max-w-[54ch] font-serif text-sm text-muted lg:col-start-2">
          online i am khdoex on github, and kaanhho most other places (x,
          huggingface). same person, i just could not keep one handle straight.
        </p>
      </Canvas>
    </div>
  )
}

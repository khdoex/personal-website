import AboutHero from '@/components/AboutHero'
import { currently } from '@/lib/currently'
import Canvas from '@/components/layout/Canvas'
import Gutter from '@/components/layout/Gutter'
import Rule from '@/components/ui/Rule'
import Meta from '@/components/ui/Meta'
import Entry from '@/components/ui/Entry'
import Reveal from '@/components/motion/Reveal'
import JsonLd from '@/components/JsonLd'
import Scrim from '@/components/layout/Scrim'
import { PERSON } from '@/lib/site'
import { content } from '@/lib/content.generated'
import Inline from '@/components/ui/Inline'
import { breadcrumbNode, graph, pageMetadata, profilePageNode } from '@/lib/seo'

export const metadata = pageMetadata({
  absoluteTitle: 'About Kaan Hacihaliloglu (kaanhho) · AI Engineer, Physicist',
  description:
    'About Kaan Hacihaliloglu (Hacıhaliloğlu), known as kaanhho and khdoex: physics at Boğaziçi, MSc thesis at Sabancı on the refusal direction in LLMs, AI engineer at SCL and SoundBoost.',
  path: '/about',
  type: 'profile',
})


export default function About() {
  return (
    <div className="pb-28">
      <Scrim />
      <JsonLd
        data={graph(
          profilePageNode({ path: '/about', name: `About ${PERSON.name}` }),
          breadcrumbNode([{ name: 'About', path: '/about' }])
        )}
      />
      <AboutHero>
        <div className="mt-8 space-y-6">
          {content.about.story.map((paragraph, i) => (
            <Reveal key={i} delay={i === 0 ? 0.08 : 0}>
              <p className="font-serif text-base text-foreground">
                <Inline text={paragraph} />
              </p>
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
                  {item.title}
                </a>
              ) : (
                item.title
              )}
            </h2>
            <p className="mt-2 font-serif text-sm text-muted">
              <Inline text={item.desc} />
            </p>
          </Entry>
        ))}

        <p className="mt-10 max-w-[54ch] font-serif text-sm text-muted lg:col-start-2">
          <Inline text={content.about.handles} />
        </p>
      </Canvas>
    </div>
  )
}

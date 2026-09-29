import Link from 'next/link'
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

// Turkish landing. Exists so Turkish queries ("kaan yapay zeka",
// "kaan hacıhaliloğlu") land on a page actually written in Turkish, paired
// with the English homepage through hreflang.
export const metadata = pageMetadata({
  absoluteTitle: 'Kaan Hacıhaliloğlu (kaanhho) · Yapay Zeka Mühendisi',
  description:
    'Kaan Hacıhaliloğlu (Hacihaliloglu, kaanhho): İstanbul’da yapay zeka mühendisi. Büyük dil modellerinde reddetme davranışını mekanistik yorumlanabilirlikle araştırıyor, SCL’de yapay zeka ile pazar araştırması motoru geliştiriyor.',
  path: '/tr',
  type: 'profile',
  locale: 'tr_TR',
  languages: { en: '/', tr: '/tr', 'x-default': '/' },
})

export default function Turkish() {
  const tr = content.tr

  return (
    <div lang="tr">
      <Scrim />
      <JsonLd
        data={graph(
          profilePageNode({
            path: '/tr',
            name: `${PERSON.nameTr} · ${PERSON.jobTitleTr}`,
            inLanguage: 'tr',
          }),
          breadcrumbNode([{ name: 'Türkçe', path: '/tr' }])
        )}
      />
      <Canvas className="pb-28 pt-24 md:pt-32">
        <header className="lg:col-start-2">
          <Reveal>
            <h1 className="font-serif text-display font-normal text-heading">
              {tr.name}
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6">
              <Meta>{tr.tagline}</Meta>
            </p>
          </Reveal>
        </header>

        <div className="mt-10 space-y-6 lg:col-start-2">
          {tr.story.map((paragraph, i) => (
            <Reveal key={i} delay={i === 0 ? 0.16 : 0}>
              <p className="font-serif text-base text-foreground">
                <Inline text={paragraph} />
              </p>
            </Reveal>
          ))}
        </div>

        <Rule className="col-span-full mt-16" />

        <Gutter className="mt-8">
          <Meta>{tr.factsLabel}</Meta>
        </Gutter>

        {tr.facts.map((fact, i) => (
          <Entry
            key={fact.label}
            className={i === 0 ? '' : 'border-t border-border'}
            delay={i * 0.05}
            gutter={<Meta tone="date">{fact.label}</Meta>}
          >
            <p className="font-serif text-base text-foreground">{fact.value}</p>
          </Entry>
        ))}

        <Rule className="col-span-full mt-16" />

        <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 lg:col-start-2">
          <Link href="/blog" className="u-link font-mono text-meta text-accent">
            {tr.links.blog}
          </Link>
          <Link href="/projects" className="u-link font-mono text-meta text-muted hover:text-accent">
            {tr.links.projects}
          </Link>
          <Link href="/resume" className="u-link font-mono text-meta text-muted hover:text-accent">
            {tr.links.resume}
          </Link>
          <a
            href={`mailto:${PERSON.email}`}
            className="u-link font-mono text-meta text-muted hover:text-accent"
          >
            {tr.links.email}
          </a>
          <Link
            href="/"
            hrefLang="en"
            className="u-link font-mono text-meta text-muted hover:text-accent"
          >
            {tr.links.english}
          </Link>
        </div>
      </Canvas>
    </div>
  )
}

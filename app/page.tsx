import Link from 'next/link'
import Reveal from '@/components/motion/Reveal'
import JsonLd from '@/components/JsonLd'
import { PERSON } from '@/lib/site'
import { graph, pageMetadata, profilePageNode } from '@/lib/seo'

export const metadata = pageMetadata({
  absoluteTitle:
    'Kaan Hacihaliloglu (kaanhho) · AI Engineer & LLM Interpretability Researcher',
  description:
    'Kaan Hacihaliloglu (Hacıhaliloğlu, kaanhho): physicist turned AI engineer in Istanbul. Researches refusal and safety in LLMs through mechanistic interpretability, builds an AI market research engine at SCL.',
  path: '/',
  type: 'profile',
  languages: { en: '/', tr: '/tr', 'x-default': '/' },
})

export default function Home() {
  return (
    <div>
      <JsonLd
        data={graph(profilePageNode({ path: '/', name: `${PERSON.name} (kaanhho)` }))}
      />
      {/* Hero — the currently list moved to /about; the landing stays quiet */}
      <section className="max-w-3xl mx-auto px-6 md:px-8 pt-24 md:pt-32 pb-28">
        <Reveal>
          <h1 className="font-mono text-lg font-semibold text-heading">
            kaan hacihaliloglu
          </h1>
          <p className="font-mono text-xs text-muted-dark mt-2">
            ai engineer · istanbul · kaanhho
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="text-base leading-relaxed max-w-xl mt-6">
            physics grad turned into ai engineer, working on refusal mechanics
            and safety in llm through interpretability. working on SCL, a new
            way of doing market research.
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
            <Link href="/tr" hrefLang="tr" className="u-link text-muted hover:text-accent">
              türkçe
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

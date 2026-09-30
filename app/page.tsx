import type { CSSProperties } from 'react'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import Meta from '@/components/ui/Meta'
import Inline from '@/components/ui/Inline'
import Reveal from '@/components/motion/Reveal'
import JsonLd from '@/components/JsonLd'
import { profiles } from '@/components/Footer'
import SectionLabel from '@/components/home/SectionLabel'
import IstanbulClock from '@/components/home/IstanbulClock'
import CurrentlyList from '@/components/home/CurrentlyList'
import ReplayButton from '@/components/world/ReplayButton'
import { content } from '@/lib/content.generated'
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

// Stagger index for .arrive (globals.css): the hero comes in piece by piece
// once the ride lands.
const at = (i: number) => ({ '--i': i }) as CSSProperties

// Each section is one station for the camera (data-station, read by
// components/world): the scene sits opposite the text, so the columns
// alternate sides as the page goes down.
const wrap = 'mx-auto grid w-full max-w-[1280px] grid-cols-1 px-6 md:px-10 lg:grid-cols-12'
const panel = 'max-lg:glass max-lg:rounded-2xl max-lg:p-6'
const left = `${panel} lg:col-span-6 xl:col-span-5`
const right = `${panel} lg:col-span-6 lg:col-start-7 xl:col-span-5 xl:col-start-8`

function Greeting({ text, name }: { text: string; name?: string }) {
  const at = name ? text.indexOf(name) : -1
  if (!name || at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <span className="italic">{name}</span>
      {text.slice(at + name.length)}
    </>
  )
}

export default async function Home() {
  const posts = (await getAllPosts()).slice(0, 4)
  const { intro, hero, currently, aboutTeaser, resumeTeaser, writingTeaser, contact, resume } = content

  return (
    <>
      <JsonLd
        data={graph(profilePageNode({ path: '/', name: `${PERSON.name} (kaanhho)` }))}
      />

      {/* hero */}
      <section data-station="hero" className="relative flex min-h-[calc(100svh-4rem)] items-start lg:items-center">
        <div className={wrap}>
          {/* On a phone the skyline sits at the bottom, so the words sit high. */}
          <header className="pb-32 pt-12 lg:col-span-7 lg:pt-10 xl:col-span-6">
            <p className="arrive flex flex-wrap items-center gap-x-3 gap-y-1" style={at(0)}>
              <span className="font-mono text-meta text-muted">{hero.location}</span>
              <span aria-hidden className="h-px w-6 bg-border" />
              <IstanbulClock label={hero.time} />
            </p>
            <h1 className="arrive mt-6 font-serif text-hero font-normal tracking-[-0.015em] text-heading" style={at(1)}>
              <Greeting text={hero.greeting} name={hero.name} />
            </h1>
            {hero.body.map((paragraph, i) => (
              <p key={i} className="arrive mt-7 max-w-[34rem] font-serif text-lead text-foreground" style={at(2 + i)}>
                <Inline text={paragraph} />
              </p>
            ))}
            {currently.items[0] && (
              <p className="arrive mt-9 flex flex-wrap items-center gap-x-3 gap-y-1" style={at(3 + hero.body.length)}>
                <span aria-hidden className="dot breathe text-accent" />
                <span className="font-mono text-meta text-muted">{currently.label}</span>
                <a href="#currently" className="u-link font-serif text-base text-heading hover:text-accent">
                  {currently.items[0].title}
                </a>
              </p>
            )}
          </header>
        </div>
        <div className="pointer-events-none absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="arrive flex flex-col items-center gap-3" style={at(6)}>
            <span className="hidden font-mono text-meta text-muted sm:inline">{hero.scroll}</span>
            <span aria-hidden className="scroll-line" />
          </div>
        </div>
      </section>

      {/* currently: the bosphorus bridge, lit in the colour of what is pointed at */}
      <section id="currently" data-station="currently" className="relative flex min-h-[100svh] items-center py-24">
        <div className={wrap}>
          <div className={right}>
            <Reveal>
              <SectionLabel n="01" label={currently.label} />
            </Reveal>
            <CurrentlyList items={currently.items} />
          </div>
        </div>
      </section>

      {/* about: boğaziçi's hill over bebek, rumelihisarı below it */}
      <section data-station="about" className="relative flex min-h-[100svh] items-start pb-24 pt-28">
        <div className={wrap}>
          <div className={left}>
            <Reveal>
              <SectionLabel n="02" label={aboutTeaser.label} />
            </Reveal>
            {aboutTeaser.body.map((paragraph, i) => (
              <Reveal key={i} delay={0.08}>
                <p className="mt-8 font-serif text-lead text-foreground">
                  <Inline text={paragraph} />
                </p>
              </Reveal>
            ))}
            <Reveal delay={0.16}>
              <dl className="mt-10 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-t border-border pt-6">
                {aboutTeaser.facts.map((fact) => (
                  <div key={fact.label} className="contents">
                    <dt>
                      <Meta>{fact.label}</Meta>
                    </dt>
                    <dd className="font-serif text-base text-heading">
                      <Inline text={fact.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={0.24}>
              <p className="mt-10">
                <Link href="/about" className="u-link font-mono text-meta text-accent hover:text-heading">
                  {aboutTeaser.link} <span aria-hidden>→</span>
                </Link>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* resume: kanyon on büyükdere caddesi, the traffic going by */}
      <section data-station="resume" className="relative flex min-h-[100svh] items-center py-24">
        <div className={wrap}>
          <div className={right}>
            <Reveal>
              <SectionLabel n="03" label={resumeTeaser.label} />
            </Reveal>
            {resumeTeaser.body.map((paragraph, i) => (
              <Reveal key={i} delay={0.08}>
                <p className="mt-8 font-serif text-lead text-foreground">
                  <Inline text={paragraph} />
                </p>
              </Reveal>
            ))}
            <ol className="mt-8">
              {resume.experience.slice(0, 3).map((entry, i) => (
                <li key={entry.title + entry.period} className="border-t border-border py-5">
                  <Reveal delay={0.08 * i}>
                    <Meta tone="date">{entry.period}</Meta>
                    <p className="mt-1.5 font-serif text-lead text-heading">
                      {entry.title}
                      {entry.org && <span className="text-muted"> · {entry.org}</span>}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>
            <Reveal delay={0.24}>
              <p className="mt-6 flex flex-wrap gap-x-7 gap-y-3 border-t border-border pt-6">
                <Link href="/resume" className="u-link font-mono text-meta text-accent hover:text-heading">
                  {resumeTeaser.link} <span aria-hidden>→</span>
                </Link>
                <a
                  href="/documents/resume.pdf"
                  download="KaanHacihaliloglu_Resume.pdf"
                  className="u-link font-mono text-meta text-muted hover:text-accent"
                >
                  {resumeTeaser.pdf} <span aria-hidden>↓</span>
                </a>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* writing: galata, across the golden horn */}
      <section data-station="writing" className="relative flex min-h-[100svh] items-center py-24">
        <div className={wrap}>
          <div className={left}>
            <Reveal>
              <SectionLabel n="04" label={writingTeaser.label} />
            </Reveal>
            {writingTeaser.body.map((paragraph, i) => (
              <Reveal key={i} delay={0.08}>
                <p className="mt-8 font-serif text-lead text-foreground">
                  <Inline text={paragraph} />
                </p>
              </Reveal>
            ))}
            <ol className="mt-8">
              {posts.map((post, i) => (
                <li key={post.data.slug} className="border-t border-border">
                  <Reveal delay={0.08 * i}>
                    <Link href={`/blog/${post.data.slug}`} className="group block py-5">
                      <span className="flex items-center gap-3">
                        <Meta as="time" tone="date">{post.data.date}</Meta>
                        <Meta>
                          {post.data.readingTime} {post.data.language === 'tr' ? 'dk' : 'min'}
                        </Meta>
                      </span>
                      <span className="mt-1.5 block font-serif text-lead text-heading transition-colors group-hover:text-accent">
                        {post.data.title}
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ol>
            <Reveal delay={0.24}>
              <p className="border-t border-border pt-6">
                <Link href="/blog" className="u-link font-mono text-meta text-accent hover:text-heading">
                  {writingTeaser.link} <span aria-hidden>→</span>
                </Link>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* contact: dawn over the asian side */}
      <section data-station="contact" className="relative flex min-h-[100svh] items-start pb-40 pt-28">
        <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10">
          <div className={`${panel} mx-auto max-w-2xl text-center`}>
            <Reveal className="flex justify-center">
              <SectionLabel n="05" label={contact.label} />
            </Reveal>
            {contact.body.map((paragraph, i) => (
              <Reveal key={i} delay={0.08}>
                <p className="mt-8 font-serif text-h3 font-normal text-heading">
                  <Inline text={paragraph} />
                </p>
              </Reveal>
            ))}
            <Reveal delay={0.16}>
              <p className="mt-10">
                <a
                  href={`mailto:${PERSON.email}`}
                  className="inline-flex items-center gap-3 rounded-full border border-accent/50 bg-background/40 px-6 py-3 font-mono text-meta text-accent backdrop-blur-sm transition-colors hover:border-accent hover:bg-accent/10"
                >
                  <span aria-hidden className="dot breathe text-accent" />
                  {contact.email}
                </a>
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <p className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
                {profiles.map((profile) => (
                  <a
                    key={profile.href}
                    href={profile.href}
                    target="_blank"
                    rel="me noopener noreferrer"
                    className="u-link font-mono text-meta text-muted hover:text-accent"
                  >
                    {profile.label}
                  </a>
                ))}
              </p>
            </Reveal>
            <Reveal delay={0.32}>
              <p className="mt-12">
                <ReplayButton>{intro.replay}</ReplayButton>
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}

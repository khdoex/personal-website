import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import Meta from '@/components/ui/Meta'
import Inline from '@/components/ui/Inline'
import JsonLd from '@/components/JsonLd'
import { profiles } from '@/components/Footer'
import Canvas from '@/components/layout/Canvas'
import Gutter from '@/components/layout/Gutter'
import Rule from '@/components/ui/Rule'
import Entry from '@/components/ui/Entry'
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
})

export default async function Home() {
  const posts = (await getAllPosts()).slice(0, 4)
  const { hero, currently, writingTeaser, contact } = content
  const link = 'u-link text-muted hover:text-accent'

  return (
    <Canvas className="pb-28 pt-16 md:pt-24">
      <JsonLd
        data={graph(profilePageNode({ path: '/', name: `${PERSON.name} (kaanhho)` }))}
      />

      <header className="lg:col-start-2">
        <h1 className="font-serif text-h2 font-normal text-heading">{PERSON.name}</h1>
        <p className="mt-2">
          <Meta>{hero.role}</Meta>
        </p>
        {hero.body.map((paragraph, i) => (
          <p key={i} className="mt-6 font-serif text-lead text-foreground">
            <Inline text={paragraph} />
          </p>
        ))}
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-meta">
          <a href={`mailto:${PERSON.email}`} className={link}>
            {PERSON.email}
          </a>
          {profiles.map((profile) => (
            <a
              key={profile.href}
              href={profile.href}
              target="_blank"
              rel="me noopener noreferrer"
              className={link}
            >
              {profile.label}
            </a>
          ))}
          <a href="/documents/resume.pdf" download="KaanHacihaliloglu_Resume.pdf" className={link}>
            {hero.pdf}
          </a>
        </p>
      </header>

      <Rule className="col-span-full mt-16" />
      <Gutter className="mt-8">
        <Meta>{currently.label}</Meta>
      </Gutter>
      {currently.items.map((item) => (
        <Entry key={item.title} gutter={<Meta tone="date">{item.since}</Meta>}>
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

      <Rule className="col-span-full mt-8" />
      <Gutter className="mt-8">
        <Meta>{writingTeaser.label}</Meta>
      </Gutter>
      <div className="mt-8 lg:col-start-2">
        {writingTeaser.body.map((paragraph, i) => (
          <p key={i} className="font-serif text-sm text-muted">
            <Inline text={paragraph} />
          </p>
        ))}
      </div>
      {posts.map((post) => (
        <Entry
          key={post.data.slug}
          gutter={<Meta as="time" tone="date">{post.data.date}</Meta>}
        >
          <Link href={`/blog/${post.data.slug}`} className="group block">
            <span className="font-serif text-lead text-heading group-hover:text-accent">
              {post.data.title}
            </span>
            {post.data.excerpt && (
              <p className="mt-2 max-w-[54ch] font-serif text-sm text-muted">
                {post.data.excerpt}
              </p>
            )}
            <p className="mt-3">
              <Meta>
                {post.data.readingTime} {post.data.language === 'tr' ? 'dk' : 'min'}
              </Meta>
            </p>
          </Link>
        </Entry>
      ))}
      <p className="lg:col-start-2">
        <Link href="/blog" className="u-link font-mono text-meta text-accent hover:text-heading">
          {writingTeaser.link}
        </Link>
      </p>

      <Rule className="col-span-full mt-16" />
      <Gutter className="mt-8">
        <Meta>{contact.label}</Meta>
      </Gutter>
      <div className="mt-8 lg:col-start-2">
        {contact.body.map((paragraph, i) => (
          <p key={i} className="font-serif text-lead text-foreground">
            <Inline text={paragraph} />
          </p>
        ))}
        <p className="mt-4 font-mono text-meta">
          <a href={`mailto:${PERSON.email}`} className="u-link text-accent hover:text-heading">
            {PERSON.email}
          </a>
        </p>
      </div>
    </Canvas>
  )
}

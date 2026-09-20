import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import Canvas from '@/components/layout/Canvas'
import Gutter from '@/components/layout/Gutter'
import Rule from '@/components/ui/Rule'
import Meta from '@/components/ui/Meta'
import Entry from '@/components/ui/Entry'
import Reveal from '@/components/motion/Reveal'
import { currently } from '@/lib/currently'

export default async function Home() {
  const posts = (await getAllPosts()).slice(0, 4)

  return (
    <Canvas className="pb-28 pt-24 md:pt-32">
      <header className="lg:col-start-2">
        <Reveal>
          <h1 className="font-serif text-display font-normal text-heading">
            kaan hacihaliloglu
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 font-serif text-lead text-foreground">
            physics grad turned ai engineer, working on refusal mechanics and
            safety in llms through interpretability. building SCL, a new way
            of doing market research.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6">
            <Meta>
              ai engineer · interpretability · istanbul 41.0°N 28.9°E
            </Meta>
          </p>
        </Reveal>
      </header>

      <Rule className="col-span-full mt-16" />

      <Gutter className="mt-8">
        <Meta>writing</Meta>
      </Gutter>

      {posts.map((post, i) => (
        <Entry
          key={post.data.slug}
          className="border-t border-border"
          delay={i * 0.08}
          gutter={<Meta as="time" tone="date">{post.data.date}</Meta>}
        >
          <Link href={`/blog/${post.data.slug}`} className="group block">
            <span className="font-serif text-lead text-heading transition-colors group-hover:text-accent">
              {post.data.title}
            </span>
            <span className="ml-3">
              <Meta>
                {post.data.readingTime} {post.data.language === 'tr' ? 'dk' : 'min'}
              </Meta>
            </span>
          </Link>
        </Entry>
      ))}

      <p className="mt-6 lg:col-start-2">
        <Link href="/blog" className="u-link font-mono text-meta text-accent">
          all writing
        </Link>
      </p>

      <Rule className="col-span-full mt-16" />

      <Gutter className="mt-8">
        <Meta>currently</Meta>
      </Gutter>

      {currently.map((item, i) => (
        <Entry
          key={item.title}
          delay={i * 0.08}
          gutter={<Meta tone="date">{item.since}</Meta>}
        >
          {item.href ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="u-link font-serif text-lead text-heading hover:text-accent"
            >
              {item.title}
            </a>
          ) : (
            <span className="font-serif text-lead text-heading">{item.title}</span>
          )}
        </Entry>
      ))}

      <Rule className="col-span-full mt-16" />

      <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 lg:col-start-2">
        <Link href="/projects" className="u-link font-mono text-meta text-muted hover:text-accent">
          projects
        </Link>
        <Link href="/about" className="u-link font-mono text-meta text-muted hover:text-accent">
          about
        </Link>
        <Link href="/resume" className="u-link font-mono text-meta text-muted hover:text-accent">
          resume
        </Link>
        <a
          href="mailto:kaanhacihaliloglu@gmail.com"
          className="u-link font-mono text-meta text-muted hover:text-accent"
        >
          email
        </a>
      </div>
    </Canvas>
  )
}

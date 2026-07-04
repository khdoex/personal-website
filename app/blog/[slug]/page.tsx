import { getPostBySlug } from '@/lib/posts'
import { getRichPost } from '@/lib/rich-posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReadingProgress from '@/components/ReadingProgress'
import Reveal from '@/components/motion/Reveal'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const rich = getRichPost(slug)
  if (rich) {
    return { title: `${rich.meta.title} | Kaan Hacihaliloglu` }
  }
  try {
    const post = await getPostBySlug(slug)
    return { title: `${post.data.title} | Kaan Hacihaliloglu` }
  } catch {
    return {}
  }
}

function PostShell({
  title,
  date,
  readingTime,
  children,
}: {
  title: string
  date: string
  readingTime: number
  children: React.ReactNode
}) {
  return (
    <>
      <ReadingProgress />
      <article className="max-w-2xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
        <header className="mb-12">
          <Reveal>
            <Link
              href="/blog"
              className="u-link inline-block font-mono text-xs text-muted hover:text-accent"
            >
              ← writing
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-mono text-xl md:text-2xl font-semibold leading-snug text-heading mt-8">
              {title}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="font-mono text-xs mt-4">
              <time className="text-amber">{date}</time>
              <span className="text-muted-dark"> · {readingTime} min read</span>
            </p>
          </Reveal>
        </header>
        {children}
      </article>
    </>
  )
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params

  const rich = getRichPost(slug)
  if (rich) {
    const { Component, meta } = rich
    return (
      <PostShell title={meta.title} date={meta.date} readingTime={meta.readingTime}>
        <div className="prose xl:relative">
          <Component />
        </div>
      </PostShell>
    )
  }

  try {
    const post = await getPostBySlug(slug)
    return (
      <PostShell
        title={post.data.title}
        date={post.data.date}
        readingTime={post.data.readingTime}
      >
        <Reveal>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.data.content }}
          />
        </Reveal>
      </PostShell>
    )
  } catch {
    return notFound()
  }
}

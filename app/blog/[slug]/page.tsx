// Scoped to this route so pages without math never pay for the stylesheet.
import 'katex/dist/katex.min.css'
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
  language,
  alternateSlug,
  children,
}: {
  title: string
  date: string
  readingTime: number
  language?: 'en' | 'tr'
  alternateSlug?: string
  children: React.ReactNode
}) {
  return (
    <>
      <ReadingProgress />
      <article className="blog-article mx-auto max-w-5xl px-6 pb-28 pt-16 md:px-8 md:pt-24">
        <header className="mb-12 max-w-[65ch]">
          <Reveal>
            <div className="flex items-center justify-between gap-5">
              <Link
                href="/blog"
                className="u-link inline-block font-mono text-xs text-muted hover:text-accent"
              >
                ← {language === 'tr' ? 'yazılar' : 'writing'}
              </Link>
              {language && alternateSlug && (
                <nav aria-label={language === 'tr' ? 'yazı dili' : 'post language'} className="flex items-center gap-2 font-mono text-[11px]">
                  {language === 'tr' ? (
                    <>
                      <span className="text-heading" aria-current="page">tr</span>
                      <span className="text-muted-dark">/</span>
                      <Link href={`/blog/${alternateSlug}`} className="u-link text-muted hover:text-accent">en</Link>
                    </>
                  ) : (
                    <>
                      <Link href={`/blog/${alternateSlug}`} className="u-link text-muted hover:text-accent">tr</Link>
                      <span className="text-muted-dark">/</span>
                      <span className="text-heading" aria-current="page">en</span>
                    </>
                  )}
                </nav>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-mono text-xl md:text-2xl font-semibold leading-snug text-heading mt-8">
              {title}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="font-mono text-xs mt-4">
              <time className="text-amber">{date}</time>
              <span className="text-muted-dark"> · {readingTime} {language === 'tr' ? 'dk okuma' : 'min read'}</span>
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
      <PostShell
        title={meta.title}
        date={meta.date}
        readingTime={meta.readingTime}
        language={meta.language}
        alternateSlug={meta.alternateSlug}
      >
        <div className="prose rich-prose xl:relative">
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
        language={post.data.language}
      >
        {/* No Reveal here: a body taller than ~4 viewports never reaches the
            viewport-amount threshold and would stay invisible. */}
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.data.content }}
        />
      </PostShell>
    )
  } catch {
    return notFound()
  }
}

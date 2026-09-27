import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { getRichPost } from '@/lib/rich-posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReadingProgress from '@/components/ReadingProgress'
import Reveal from '@/components/motion/Reveal'
import JsonLd from '@/components/JsonLd'
import { blogPostingNode, breadcrumbNode, graph, pageMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
}

interface PostSeo {
  title: string
  slug: string
  date: string
  description: string
  lang: string
  wordCount?: number
}

// Prerender every known post at build time; unknown slugs still 404.
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.data.slug }))
}

async function seoFor(slug: string): Promise<PostSeo | null> {
  const rich = getRichPost(slug)
  if (rich) {
    return {
      ...rich.meta,
      description: rich.meta.description ?? rich.meta.title,
      lang: rich.meta.lang ?? 'en',
    }
  }
  try {
    const { data } = await getPostBySlug(slug)
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await seoFor(slug)
  if (!post) return {}
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: 'article',
    locale: post.lang === 'tr' ? 'tr_TR' : 'en_US',
    publishedTime: post.date,
  })
}

async function PostShell({
  slug,
  title,
  date,
  readingTime,
  children,
}: {
  slug: string
  title: string
  date: string
  readingTime: number
  children: React.ReactNode
}) {
  const seo = await seoFor(slug)
  return (
    <>
      {seo && (
        <JsonLd
          data={graph(
            blogPostingNode({ ...seo, inLanguage: seo.lang }),
            breadcrumbNode([
              { name: 'Writing', path: '/blog' },
              { name: title, path: `/blog/${slug}` },
            ])
          )}
        />
      )}
      <ReadingProgress />
      <article
        lang={seo?.lang}
        className="max-w-2xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28"
      >
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
      <PostShell slug={slug} title={meta.title} date={meta.date} readingTime={meta.readingTime}>
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
        slug={slug}
        title={post.data.title}
        date={post.data.date}
        readingTime={post.data.readingTime}
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

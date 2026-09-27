// Scoped to this route so pages without math never pay for the stylesheet.
import 'katex/dist/katex.min.css'
import { getAllPosts, getPostBySlug, plainExcerpt } from '@/lib/posts'
import { getRichPost } from '@/lib/rich-posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReadingProgress from '@/components/ReadingProgress'
import Reveal from '@/components/motion/Reveal'
import Canvas from '@/components/layout/Canvas'
import JsonLd from '@/components/JsonLd'
import { blogPostingNode, breadcrumbNode, graph, pageMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
}

/**
 * An unlisted rich post is a draft. The route treats it as if it does not
 * exist, so it 404s rather than staying readable to anyone holding the link.
 */
function publishedRichPost(slug: string) {
  const rich = getRichPost(slug)
  return rich && rich.meta.listed !== false ? rich : undefined
}

interface PostSeo {
  title: string
  slug: string
  date: string
  description: string
  language: 'en' | 'tr'
  alternateSlug?: string
}

// Prerender every published post at build time; anything else 404s.
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.data.slug }))
}

async function seoFor(slug: string): Promise<PostSeo | null> {
  const rich = publishedRichPost(slug)
  if (rich) {
    const { meta } = rich
    return {
      title: meta.title,
      slug: meta.slug,
      date: meta.date,
      description: meta.excerpt ?? meta.title,
      language: meta.language ?? 'en',
      // Only point at a translation that is itself published.
      alternateSlug:
        meta.alternateSlug && publishedRichPost(meta.alternateSlug)
          ? meta.alternateSlug
          : undefined,
    }
  }
  try {
    const { data } = await getPostBySlug(slug)
    return {
      title: data.title,
      slug: data.slug,
      date: data.date,
      description: data.excerpt ?? plainExcerpt(data.content),
      language: data.language ?? 'en',
    }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await seoFor(slug)
  if (!post) return {}
  // A bilingual post points search engines at its translation.
  const languages = post.alternateSlug
    ? {
        [post.language]: `/blog/${post.slug}`,
        [post.language === 'tr' ? 'en' : 'tr']: `/blog/${post.alternateSlug}`,
      }
    : undefined
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: 'article',
    locale: post.language === 'tr' ? 'tr_TR' : 'en_US',
    languages,
    publishedTime: post.date,
  })
}

async function PostJsonLd({ slug }: { slug: string }) {
  const post = await seoFor(slug)
  if (!post) return null
  return (
    <JsonLd
      data={graph(
        blogPostingNode({ ...post, inLanguage: post.language }),
        breadcrumbNode([
          { name: 'Writing', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ])
      )}
    />
  )
}

function PostShell({
  slug,
  title,
  date,
  readingTime,
  language,
  alternateSlug,
  children,
}: {
  slug: string
  title: string
  date: string
  readingTime: number
  language?: 'en' | 'tr'
  alternateSlug?: string
  children: React.ReactNode
}) {
  return (
    <>
      <PostJsonLd slug={slug} />
      <ReadingProgress />
      <article lang={language}>
        <Canvas className="pb-28 pt-16 md:pt-24">
          <header className="mb-12 max-w-[660px] lg:col-start-2">
            <Reveal>
              <div className="flex items-center justify-between gap-5">
                <Link
                  href="/blog"
                  className="u-link inline-block font-mono text-xs text-muted hover:text-accent"
                >
                  {language === 'tr' ? 'yazılar' : 'writing'}
                </Link>
                {language && alternateSlug && (
                  <nav aria-label={language === 'tr' ? 'yazı dili' : 'post language'} className="flex items-center gap-2 font-mono text-[11px]">
                    {language === 'tr' ? (
                      <>
                        <span className="text-heading" aria-current="page">tr</span>
                        <span className="text-muted">/</span>
                        <Link href={`/blog/${alternateSlug}`} className="u-link text-muted hover:text-accent">en</Link>
                      </>
                    ) : (
                      <>
                        <Link href={`/blog/${alternateSlug}`} className="u-link text-muted hover:text-accent">tr</Link>
                        <span className="text-muted">/</span>
                        <span className="text-heading" aria-current="page">en</span>
                      </>
                    )}
                  </nav>
                )}
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="font-serif text-h2 font-normal text-heading mt-8">
                {title}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="font-mono text-xs mt-4">
                <time className="text-amber">{date}</time>
                <span className="text-muted"> · {readingTime} {language === 'tr' ? 'dk okuma' : 'min read'}</span>
              </p>
            </Reveal>
          </header>
          {children}
        </Canvas>
      </article>
    </>
  )
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params

  const rich = publishedRichPost(slug)
  if (rich) {
    const { Component, meta } = rich
    return (
      <PostShell
        slug={slug}
        title={meta.title}
        date={meta.date}
        readingTime={meta.readingTime}
        language={meta.language}
        alternateSlug={meta.alternateSlug}
      >
        <div className="prose rich-prose lg:col-start-2">
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
        language={post.data.language}
      >
        {/* No Reveal here: a body taller than ~4 viewports never reaches the
            viewport-amount threshold and would stay invisible. */}
        <div
          className="prose lg:col-start-2"
          dangerouslySetInnerHTML={{ __html: post.data.content }}
        />
      </PostShell>
    )
  } catch {
    return notFound()
  }
}

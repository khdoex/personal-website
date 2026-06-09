import { getPostBySlug } from '@/lib/posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReadingProgress from '@/components/ReadingProgress'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  try {
    const post = await getPostBySlug(slug)
    return { title: `${post.data.title} | Kaan Hacihaliloglu` }
  } catch {
    return {}
  }
}

export default async function BlogPost({ params }: Props) {
  const resolvedParams = await params

  try {
    const post = await getPostBySlug(resolvedParams.slug)

    return (
      <>
        <ReadingProgress />
        <article className="max-w-2xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
          <header className="mb-12">
            <Link
              href="/blog"
              className="reveal u-link inline-block font-mono text-xs text-muted hover:text-accent"
              style={{ '--d': 0 } as React.CSSProperties}
            >
              ← writing
            </Link>
            <h1
              className="reveal font-mono text-xl md:text-2xl font-semibold leading-snug text-heading mt-8"
              style={{ '--d': 1 } as React.CSSProperties}
            >
              {post.data.title}
            </h1>
            <p
              className="reveal font-mono text-xs mt-4"
              style={{ '--d': 2 } as React.CSSProperties}
            >
              <time className="text-amber">{post.data.date}</time>
              <span className="text-muted-dark"> · {post.data.readingTime} min read</span>
            </p>
          </header>

          <div
            className="reveal prose"
            style={{ '--d': 3 } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: post.data.content }}
          />
        </article>
      </>
    )
  } catch {
    return notFound()
  }
}

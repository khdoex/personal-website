import { getPostBySlug } from '@/lib/posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BlogPost({ params }: Props) {
  const resolvedParams = await params

  try {
    const post = await getPostBySlug(resolvedParams.slug)

    return (
      <div className="animate-fade-in">
        <article className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Blog</span>
          </Link>

          {/* Header */}
          <header className="mb-12 pb-8 border-b border-gray-200">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {post.data.title}
            </h1>
            <p className="text-gray-600">{post.data.date}</p>
          </header>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.data.content }}
          />
        </article>
      </div>
    )
  } catch (error) {
    return notFound()
  }
}

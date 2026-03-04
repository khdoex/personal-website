import { getPostBySlug } from '@/lib/posts'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BlogPost({ params }: Props) {
  const resolvedParams = await params

  try {
    const post = await getPostBySlug(resolvedParams.slug)

    return (
      <div className="animate-fade-in">
        <article className="max-w-3xl mx-auto px-6 md:px-8 py-16">
          <header className="mb-10 pb-6 border-b border-border">
            <p className="font-mono text-xs text-muted mb-3">{post.data.date}</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
              {post.data.title}
            </h1>
          </header>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.data.content }}
          />
        </article>
      </div>
    )
  } catch (error) {
    return notFound()
  }
}

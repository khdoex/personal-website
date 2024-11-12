import { getPostBySlug, type Post } from '@/lib/posts'
import PageNav from '@/components/PageNav'
import { notFound } from 'next/navigation'

export default async function BlogPost({ params }: { params: { slug: string } }) {
  try {
    const post = await getPostBySlug(params.slug)

    return (
      <main className="min-h-screen p-8 bg-gray-900">
        <PageNav title={post.data.title} />
        <article className="max-w-2xl mx-auto mt-12">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">{post.data.title}</h1>
            <p className="text-gray-400">{post.data.date}</p>
          </header>
          <div 
            className="prose prose-lg prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.data.content }}
          />
        </article>
      </main>
    )
  } catch (error) {
    return notFound()
  }
} 
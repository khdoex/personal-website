import { getPostBySlug } from '@/lib/posts'
import PageNav from '@/components/PageNav'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BlogPost({ params }: Props) {
  // Wait for params to resolve
  const resolvedParams = await params
  
  try {
    const post = await getPostBySlug(resolvedParams.slug)

    return (
      <main className="min-h-screen p-8 relative">
        <div className="absolute inset-0 bg-black/40 -z-[5]" />
        
        <PageNav title={post.data.title} />
        <article className="max-w-2xl mx-auto mt-12">
          <header className="mb-12 bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/10 shadow-xl">
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              {post.data.title}
            </h1>
            <p className="text-white/70">{post.data.date}</p>
          </header>
          <div 
            className="prose prose-lg prose-invert max-w-none bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/10 shadow-xl"
            dangerouslySetInnerHTML={{ __html: post.data.content }}
          />
        </article>
      </main>
    )
  } catch (error) {
    return notFound()
  }
} 
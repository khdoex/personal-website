import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function Blog() {
  const posts = await getAllPosts()

  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">
        <div className="mb-12">
          <p className="font-mono text-sm text-accent mb-2">~/blog</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
            Research Blog
          </h1>
          <p className="text-muted mt-3 max-w-xl">
            Writing about machine learning, AI research, and data science.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-2">
            {posts.map((post) => (
              <Link
                key={post.data.slug}
                href={`/blog/${post.data.slug}`}
                className="group flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent/40 hover:bg-surface/50 transition-all"
              >
                <div>
                  <h2 className="font-mono text-base font-semibold text-white group-hover:text-accent transition-colors">
                    {post.data.title}
                  </h2>
                  <span className="font-mono text-xs text-muted mt-1">{post.data.date}</span>
                </div>
                <ArrowRight size={16} className="text-muted group-hover:text-accent transition-colors" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-border rounded-lg p-8">
            <p className="font-mono text-sm text-muted">
              <span className="text-terminal-green">&gt;</span> no posts yet — coming soon.
            </p>
            <div className="flex gap-3 mt-4">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 bg-accent-deep hover:bg-accent-deep/80 text-white px-4 py-2 rounded font-mono text-sm transition-colors"
              >
                view_projects <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

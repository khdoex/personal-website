import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'

export const metadata = {
  title: 'Writing | Kaan Hacihaliloglu',
}

export default async function Blog() {
  const posts = await getAllPosts()

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
      <header className="mb-12">
        <h1 className="reveal font-mono text-lg font-semibold text-heading" style={{ '--d': 0 } as React.CSSProperties}>
          writing
        </h1>
        <p className="reveal text-muted mt-3 max-w-xl leading-relaxed" style={{ '--d': 1 } as React.CSSProperties}>
          Notes on machine learning, interpretability research, and the
          occasional detour through life.
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="divide-y divide-border border-y border-border">
          {posts.map((post, i) => (
            <Link
              key={post.data.slug}
              href={`/blog/${post.data.slug}`}
              className="reveal group flex flex-col md:flex-row md:items-baseline gap-1.5 md:gap-6 py-5"
              style={{ '--d': 2 + i } as React.CSSProperties}
            >
              <time className="font-mono text-xs text-amber md:w-28 shrink-0">
                {post.data.date}
              </time>
              <span className="text-base font-medium text-heading group-hover:text-accent transition-colors">
                {post.data.title}
              </span>
              <span className="font-mono text-xs text-muted-dark md:ml-auto shrink-0">
                {post.data.readingTime} min
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="reveal font-mono text-sm text-muted" style={{ '--d': 2 } as React.CSSProperties}>
          nothing here yet.
        </p>
      )}
    </div>
  )
}

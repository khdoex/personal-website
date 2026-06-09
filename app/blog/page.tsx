import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'

export const metadata = {
  title: 'Writing | Kaan Hacihaliloglu',
}

export default async function Blog() {
  const posts = await getAllPosts()

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
      <header className="mb-14">
        <p className="reveal font-mono text-[13px] tracking-[0.2em] uppercase text-muted" style={{ '--d': 0 } as React.CSSProperties}>
          Writing
        </p>
        <h1 className="reveal font-display text-4xl md:text-6xl tracking-tight text-foreground mt-4" style={{ '--d': 1 } as React.CSSProperties}>
          Notes &amp; essays<em className="text-accent">.</em>
        </h1>
        <p className="reveal text-muted mt-5 max-w-xl leading-relaxed" style={{ '--d': 2 } as React.CSSProperties}>
          On machine learning, interpretability research, and the occasional
          detour through life.
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="divide-y divide-border border-y border-border">
          {posts.map((post, i) => (
            <Link
              key={post.data.slug}
              href={`/blog/${post.data.slug}`}
              className="reveal group flex flex-col md:flex-row md:items-baseline gap-1.5 md:gap-6 py-6"
              style={{ '--d': 3 + i } as React.CSSProperties}
            >
              <time className="font-mono text-xs text-muted-dark md:w-28 shrink-0 group-hover:text-accent transition-colors">
                {post.data.date}
              </time>
              <span className="font-serif text-xl md:text-2xl text-foreground group-hover:text-accent group-hover:translate-x-1 transition-all duration-300">
                {post.data.title}
              </span>
              <span className="font-mono text-xs text-muted-dark md:ml-auto shrink-0">
                {post.data.readingTime} min
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="reveal font-serif text-xl text-muted italic" style={{ '--d': 3 } as React.CSSProperties}>
          Nothing here yet — soon.
        </p>
      )}
    </div>
  )
}

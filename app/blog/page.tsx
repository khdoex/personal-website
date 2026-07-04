import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'
import Reveal from '@/components/motion/Reveal'

export const metadata = {
  title: 'Writing | Kaan Hacihaliloglu',
}

export default async function Blog() {
  const posts = await getAllPosts()

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
      <header className="mb-12">
        <Reveal>
          <h1 className="font-mono text-lg font-semibold text-heading">
            writing
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-muted mt-3 max-w-xl leading-relaxed">
            Notes on machine learning, interpretability research, and the
            occasional detour through life.
          </p>
        </Reveal>
      </header>

      {posts.length > 0 ? (
        <div className="divide-y divide-border border-y border-border">
          {posts.map((post) => (
            <Reveal key={post.data.slug}>
              <Link
                href={`/blog/${post.data.slug}`}
                className="group flex flex-col md:flex-row md:items-baseline gap-1.5 md:gap-6 py-5"
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
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <p className="font-mono text-sm text-muted">nothing here yet.</p>
        </Reveal>
      )}
    </div>
  )
}

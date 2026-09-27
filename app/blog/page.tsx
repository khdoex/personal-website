import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'
import Reveal from '@/components/motion/Reveal'
import JsonLd from '@/components/JsonLd'
import { SITE_URL } from '@/lib/site'
import { PERSON_ID, breadcrumbNode, graph, pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Writing',
  description:
    'Blog of Kaan Hacihaliloglu (kaanhho): notes on machine learning, LLM interpretability research, and the occasional detour through life, in English and Turkish.',
  path: '/blog',
})

export default async function Blog() {
  const posts = await getAllPosts()
  const blogNode = {
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    url: `${SITE_URL}/blog`,
    name: 'Kaan Hacihaliloglu · writing',
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/blog/${post.data.slug}#article`,
      headline: post.data.title,
      url: `${SITE_URL}/blog/${post.data.slug}`,
      datePublished: post.data.date,
    })),
  }

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
      <JsonLd
        data={graph(blogNode, breadcrumbNode([{ name: 'Writing', path: '/blog' }]))}
      />
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

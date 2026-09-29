import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'
import Canvas from '@/components/layout/Canvas'
import Gutter from '@/components/layout/Gutter'
import Meta from '@/components/ui/Meta'
import Reveal from '@/components/motion/Reveal'
import JsonLd from '@/components/JsonLd'
import { SITE_URL } from '@/lib/site'
import { PERSON_ID, breadcrumbNode, graph, pageMetadata } from '@/lib/seo'
import { content } from '@/lib/content.generated'
import Inline from '@/components/ui/Inline'

export const metadata = pageMetadata({
  title: 'Writing',
  description:
    'Blog of Kaan Hacihaliloglu (kaanhho): notes on LLM interpretability, machine learning, and the occasional detour through life, in English and Turkish.',
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
      inLanguage: post.data.language ?? 'en',
    })),
  }

  // Newest year first; posts inside a year keep the order getAllPosts gives.
  const years = [...new Set(posts.map((p) => p.data.date.slice(0, 4)))].sort().reverse()

  return (
    <Canvas className="pb-28 pt-16 md:pt-24">
      <JsonLd
        data={graph(blogNode, breadcrumbNode([{ name: 'Writing', path: '/blog' }]))}
      />
      <header className="mb-16 lg:col-start-2">
        <Reveal>
          <h1 className="font-serif text-h2 font-normal text-heading">writing</h1>
        </Reveal>
        {content.writing.intro.map((paragraph, i) => (
          <Reveal key={i} delay={0.08}>
            <p className="mt-4 font-serif text-lead text-muted">
              <Inline text={paragraph} />
            </p>
          </Reveal>
        ))}
      </header>

      {posts.length === 0 && (
        <p className="lg:col-start-2">
          <Meta>nothing here yet.</Meta>
        </p>
      )}

      {years.map((year) => (
        <div key={year} className="col-span-full grid grid-cols-1 lg:grid-cols-subgrid">
          <Gutter sticky>
            <Meta>{year}</Meta>
          </Gutter>

          <div className="lg:col-start-2">
            {posts
              .filter((post) => post.data.date.startsWith(year))
              .map((post, i) => (
                <Reveal
                  key={post.data.slug}
                  delay={i * 0.08}
                  className="border-t border-border py-7"
                >
                  <article>
                    <Link href={`/blog/${post.data.slug}`} className="group block">
                      <span className="font-serif text-lead text-heading transition-colors group-hover:text-accent">
                        {post.data.title}
                      </span>
                      {post.data.excerpt && (
                        <p className="mt-2 max-w-[54ch] font-serif text-sm text-muted">
                          {post.data.excerpt}
                        </p>
                      )}
                      <p className="mt-3">
                        <Meta as="time" tone="date">{post.data.date}</Meta>
                        <Meta className="ml-3">
                          {post.data.readingTime}{' '}
                          {post.data.language === 'tr' ? 'dk' : 'min'}
                        </Meta>
                      </p>
                    </Link>
                  </article>
                </Reveal>
              ))}
          </div>
        </div>
      ))}
    </Canvas>
  )
}

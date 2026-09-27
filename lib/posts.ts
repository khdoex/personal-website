import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { richPosts } from './rich-posts'
import { rawPosts, type RawPost } from './markdown-posts.generated'

// Posts arrive as a bundled module rather than from disk. The Cloudflare
// Workers runtime has no filesystem, so a request-time read always failed
// there. scripts/build-posts.mjs does the reading at build time.

export interface PostData {
  title: string
  date: string
  slug: string
  content: string
  readingTime: number
  language?: 'en' | 'tr'
  excerpt?: string
}

export interface Post {
  data: PostData
}

function stripTags(htmlString: string): string {
  return htmlString.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Plain-text opening of a post, for meta descriptions and feeds. */
export function plainExcerpt(contentHtml: string, max = 155): string {
  const text = stripTags(contentHtml)
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

function readingTimeOf(contentHtml: string): number {
  const words = stripTags(contentHtml).split(' ').filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

async function parseMarkdownPost(raw: string, slug: string): Promise<PostData> {
  const { data, content } = matter(raw)
  const processed = await remark().use(html).process(content)
  const contentHtml = processed.toString()

  return {
    title: data.title || slug,
    date: data.date || new Date().toISOString().slice(0, 10),
    slug,
    content: contentHtml,
    readingTime: readingTimeOf(contentHtml),
    language: data.language,
    excerpt: data.excerpt,
  }
}

/**
 * Parses an uploaded .html file (e.g. exported from an editor).
 * Title comes from <title>, falling back to the first <h1>, then the filename.
 * Date comes from <meta name="date" content="YYYY-MM-DD">, falling back to file mtime.
 * Only the <body> content is kept; <script> and <style> tags are dropped so
 * posts inherit the site's reading typography.
 */
function parseHtmlPost(raw: string, slug: string, mtime: Date): PostData {
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  let content = bodyMatch ? bodyMatch[1] : raw
  content = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

  const titleTag = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const firstH1 = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const title = (titleTag && stripTags(titleTag[1])) || (firstH1 && stripTags(firstH1[1])) || slug

  // The post header already renders the title — drop a duplicate leading <h1>.
  if (firstH1 && stripTags(firstH1[1]) === title) {
    content = content.replace(firstH1[0], '')
  }

  const metaDate = raw.match(/<meta\s+name=["']date["']\s+content=["']([^"']+)["']/i)
  const date = metaDate ? metaDate[1] : mtime.toISOString().slice(0, 10)

  return {
    title,
    date,
    slug,
    content: content.trim(),
    readingTime: readingTimeOf(content),
  }
}

async function loadPost({ fileName, raw, mtime }: RawPost): Promise<Post | null> {
  if (fileName.endsWith('.md')) {
    return { data: await parseMarkdownPost(raw, fileName.replace(/\.md$/, '')) }
  }
  if (fileName.endsWith('.html')) {
    return { data: parseHtmlPost(raw, fileName.replace(/\.html$/, ''), new Date(mtime)) }
  }
  return null
}

export async function getAllPosts(): Promise<Post[]> {
  const filePosts = await Promise.all(rawPosts.map(loadPost))

  const richAsPosts: Post[] = richPosts.filter(({ meta }) => meta.listed !== false).map(({ meta }) => ({
    data: { ...meta, content: '' },
  }))
  const richSlugs = new Set(richAsPosts.map((post) => post.data.slug))

  return filePosts
    .filter((post): post is Post => post !== null)
    // On a slug collision the rich post wins (matches the [slug] route).
    .filter((post) => !richSlugs.has(post.data.slug))
    .concat(richAsPosts)
    .sort((a, b) => b.data.date.localeCompare(a.data.date))
}

export async function getPostBySlug(slug: string): Promise<Post> {
  if (!slug) {
    throw new Error('Slug is required')
  }

  for (const ext of ['md', 'html']) {
    const entry = rawPosts.find((post) => post.fileName === `${slug}.${ext}`)
    if (entry) {
      const post = await loadPost(entry)
      if (post) return post
    }
  }

  throw new Error(`Post not found: ${slug}`)
}

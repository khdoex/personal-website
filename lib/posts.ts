import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

export interface PostData {
  title: string
  date: string
  slug: string
  content: string
  readingTime: number
}

export interface Post {
  data: PostData
}

function stripTags(htmlString: string): string {
  return htmlString.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
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

async function loadPost(fileName: string): Promise<Post | null> {
  const fullPath = path.join(postsDirectory, fileName)
  const raw = fs.readFileSync(fullPath, 'utf8')

  if (fileName.endsWith('.md')) {
    return { data: await parseMarkdownPost(raw, fileName.replace(/\.md$/, '')) }
  }
  if (fileName.endsWith('.html')) {
    const mtime = fs.statSync(fullPath).mtime
    return { data: parseHtmlPost(raw, fileName.replace(/\.html$/, ''), mtime) }
  }
  return null
}

export async function getAllPosts(): Promise<Post[]> {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPosts = await Promise.all(fileNames.map(loadPost))

  return allPosts
    .filter((post): post is Post => post !== null)
    .sort((a, b) => (a.data.date < b.data.date ? 1 : -1))
}

export async function getPostBySlug(slug: string): Promise<Post> {
  if (!slug) {
    throw new Error('Slug is required')
  }

  for (const ext of ['md', 'html']) {
    const fileName = `${slug}.${ext}`
    if (fs.existsSync(path.join(postsDirectory, fileName))) {
      const post = await loadPost(fileName)
      if (post) return post
    }
  }

  throw new Error(`Post not found: ${slug}`)
}

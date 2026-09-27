import { getAllPosts, plainExcerpt } from '@/lib/posts'
import { SITE_URL, SITE_NAME, PERSON } from '@/lib/site'

export const dynamic = 'force-static'

const escape = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export async function GET() {
  const posts = await getAllPosts()
  const items = posts
    .map(({ data }) => {
      const url = `${SITE_URL}/blog/${data.slug}`
      return `    <item>
      <title>${escape(data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(data.date).toUTCString()}</pubDate>
      <dc:creator>${escape(PERSON.name)}</dc:creator>
      <dc:language>${data.language ?? 'en'}</dc:language>
      <description>${escape(data.excerpt ?? plainExcerpt(data.content))}</description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(SITE_NAME)} · writing</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes on machine learning, LLM interpretability research, and the occasional detour through life, by ${escape(PERSON.name)} (kaanhho).</description>
    <language>en</language>
${items}
  </channel>
</rss>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}

import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getAllPosts } from '@/lib/posts'

// Plain urlset on purpose. Next writes hreflang (xhtml:link) and image
// entries *before* lastmod/changefreq/priority, but the sitemap 0.9 schema
// only allows extension elements after them, so adding either made the file
// schema-invalid (a likely cause of Search Console's "Sitemap could not be
// read").
// Both signals already live elsewhere: hreflang in each page's <head>
// (pageMetadata `languages`), the portrait in the Person JSON-LD.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: '', priority: 1 },
    { path: '/tr', priority: 0.9 },
    { path: '/about', priority: 0.9 },
    { path: '/resume', priority: 0.8 },
    { path: '/projects', priority: 0.7 },
    { path: '/blog', priority: 0.7 },
  ].map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority,
  }))

  const posts = await getAllPosts()
  const postRoutes = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.data.slug}`,
    lastModified: new Date(post.data.date),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...postRoutes]
}

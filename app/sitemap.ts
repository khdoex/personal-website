import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getAllPosts } from '@/lib/posts'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/about', '/projects', '/blog', '/resume'].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.7,
    })
  )

  const posts = await getAllPosts()
  const postRoutes = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.data.slug}`,
    lastModified: new Date(post.data.date),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...postRoutes]
}

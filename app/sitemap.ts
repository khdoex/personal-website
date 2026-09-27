import type { MetadataRoute } from 'next'
import { SITE_URL, PERSON } from '@/lib/site'
import { getAllPosts } from '@/lib/posts'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const portrait = `${SITE_URL}${PERSON.image}`
  // The English home and the Turkish page are translations of each other.
  const homeAlternates = {
    languages: { en: SITE_URL, tr: `${SITE_URL}/tr` },
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: '', priority: 1, alternates: homeAlternates, images: [portrait] },
    { path: '/tr', priority: 0.9, alternates: homeAlternates },
    { path: '/about', priority: 0.9, images: [portrait] },
    { path: '/resume', priority: 0.8 },
    { path: '/projects', priority: 0.7 },
    { path: '/blog', priority: 0.7 },
  ].map(({ path, ...rest }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    ...rest,
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

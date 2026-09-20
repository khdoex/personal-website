import type { ComponentType } from 'react'

export interface RichPostMeta {
  title: string
  date: string
  slug: string
  readingTime: number
  language?: 'en' | 'tr'
  alternateSlug?: string
  listed?: boolean
}

export interface RichPost {
  meta: RichPostMeta
  Component: ComponentType
}

// Authoring a new rich post: drop posts/rich/<slug>.mdx (exporting meta),
// import it above, add one entry here.
export const richPosts: RichPost[] = []

export function getRichPost(slug: string): RichPost | undefined {
  return richPosts.find((post) => post.meta.slug === slug)
}

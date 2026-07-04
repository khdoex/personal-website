import type { ComponentType } from 'react'
import InsideTheMedium, {
  meta as insideTheMediumMeta,
} from '@/posts/rich/inside-the-medium.mdx'
import TracingRefusal, {
  meta as tracingRefusalMeta,
} from '@/posts/rich/tracing-refusal.mdx'

export interface RichPostMeta {
  title: string
  date: string
  slug: string
  readingTime: number
}

export interface RichPost {
  meta: RichPostMeta
  Component: ComponentType
}

// Authoring a new rich post: drop posts/rich/<slug>.mdx (exporting meta),
// import it above, add one entry here.
export const richPosts: RichPost[] = [
  { meta: tracingRefusalMeta, Component: TracingRefusal },
  { meta: insideTheMediumMeta, Component: InsideTheMedium },
]

export function getRichPost(slug: string): RichPost | undefined {
  return richPosts.find((post) => post.meta.slug === slug)
}

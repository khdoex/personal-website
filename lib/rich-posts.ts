import type { ComponentType } from 'react'
import PromptInjectionDefenseInsideModel, { meta as promptInjectionDefenseInsideModelMeta } from '@/posts/rich/prompt-injection-defense-inside-model.mdx'
import PromptInjectionDefenseInsideModelEn, { meta as promptInjectionDefenseInsideModelEnMeta } from '@/posts/rich/prompt-injection-defense-inside-model-en.mdx'

export interface RichPostMeta {
  title: string
  date: string
  slug: string
  readingTime: number
  language?: 'en' | 'tr'
  alternateSlug?: string
  listed?: boolean
  excerpt?: string
}

export interface RichPost {
  meta: RichPostMeta
  Component: ComponentType
}

// Authoring a new rich post: drop posts/rich/<slug>.mdx (exporting meta),
// import it above, add one entry here.
export const richPosts: RichPost[] = [
  { meta: promptInjectionDefenseInsideModelMeta, Component: PromptInjectionDefenseInsideModel },
  { meta: promptInjectionDefenseInsideModelEnMeta, Component: PromptInjectionDefenseInsideModelEn },
]

export function getRichPost(slug: string): RichPost | undefined {
  return richPosts.find((post) => post.meta.slug === slug)
}

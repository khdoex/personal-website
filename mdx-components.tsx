import type { ComponentType } from 'react'

type MDXComponents = Record<string, ComponentType<Record<string, unknown>>>

// Required by @next/mdx. Element styling comes from the .prose CSS in
// globals.css; custom components are imported inside each .mdx file.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return components
}

declare module '*.mdx' {
  import type { ComponentType } from 'react'

  export const meta: {
    title: string
    date: string
    slug: string
    readingTime: number
  }

  const Component: ComponentType
  export default Component
}

import createMDX from '@next/mdx'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'mdx'],
  images: {
    unoptimized: true, // Cloudflare Workers deploy has no image optimizer
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

// $inline$ and $$display$$ math in rich .mdx posts, rendered to static HTML at
// build time. Plain .md posts run a separate remark pipeline and are unaffected.
const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
})

export default withMDX(nextConfig)

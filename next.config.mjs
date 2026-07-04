import createMDX from '@next/mdx'

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

const withMDX = createMDX({})

export default withMDX(nextConfig)

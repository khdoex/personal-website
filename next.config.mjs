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
  async redirects() {
    return [
      // Portrait was renamed so the filename carries the name (image search).
      {
        source: '/images/kaan.png',
        destination: '/images/kaan-hacihaliloglu.png',
        permanent: true,
      },
    ]
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)

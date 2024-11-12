const withMDX = require('@next/mdx')()

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    domains: ['your-image-domain.com'], // Add your image domains here
  },
  mdx: {
    extension: /\.mdx?$/,
  },
}

module.exports = withMDX(nextConfig)

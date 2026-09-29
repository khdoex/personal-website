import { execFile } from 'node:child_process'
import { watch } from 'node:fs'
import createMDX from '@next/mdx'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'
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

// $inline$ and $$display$$ math in rich .mdx posts, rendered to static HTML at
// build time. Plain .md posts run a separate remark pipeline and are unaffected.
const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
})

// Under `next dev`, saving content/site.md regenerates lib/content.generated.ts,
// which Next then hot-reloads like any other module. The directory is watched
// rather than the file because editors that save by rename would otherwise
// detach the watcher after the first save. The env flag keeps the watcher to
// one process: Next evaluates this config in more than one, and children
// inherit the flag.
function watchContent() {
  if (process.env.CONTENT_WATCHING) return
  process.env.CONTENT_WATCHING = '1'
  let timer
  watch('content', (_event, file) => {
    if (file !== 'site.md') return
    clearTimeout(timer)
    timer = setTimeout(() => {
      execFile(process.execPath, ['scripts/build-content.mjs'], (error, stdout, stderr) => {
        process.stdout.write(stdout)
        if (error) process.stderr.write(stderr)
      })
    }, 150)
  })
}

export default function config(phase) {
  if (phase === PHASE_DEVELOPMENT_SERVER) watchContent()
  return withMDX(nextConfig)
}

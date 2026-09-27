import fs from 'fs'
import path from 'path'
import { getAllPosts } from '@/lib/posts'
import { projects } from '@/lib/projects'
import {
  about,
  experience,
  education,
  resumeProjects,
  skills,
  certifications,
  languages,
  type ResumeEntry,
} from '@/lib/resume'
import { SITE_URL } from '@/lib/site'

// Built once at build time: public/llms.txt (the curated summary) followed by
// everything else on the site as plain text, generated from the same data
// files the pages render, so it cannot drift from what humans see.
export const dynamic = 'force-static'

const stripHtml = (html: string) =>
  html
    .replace(/<\/(p|h[1-6]|li|blockquote)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

function entry(e: ResumeEntry): string {
  const head = [e.period, e.title, e.org].filter(Boolean).join(' · ')
  const lines = [`### ${head}`]
  if (e.orgHref) lines.push(`Organization: ${e.orgHref}`)
  if (e.href) lines.push(`Link: ${e.href}`)
  if (e.summary) lines.push('', e.summary)
  if (e.detail) lines.push('', ...e.detail.map((d) => `- ${d}`))
  return lines.join('\n')
}

export async function GET() {
  const summary = fs.readFileSync(
    path.join(process.cwd(), 'public', 'llms.txt'),
    'utf8'
  )
  const posts = await getAllPosts()

  const sections = [
    summary.trim(),
    '---',
    '# Full site content',
    `Everything below is generated from ${SITE_URL} at build time.`,
    '## Resume summary',
    about,
    '## Experience',
    ...experience.map(entry),
    '## Education',
    ...education.map(entry),
    '## Resume projects and awards',
    ...resumeProjects.map(entry),
    '## Skills',
    skills.map((s) => `- ${s.label}: ${s.items}`).join('\n'),
    '## Certifications',
    certifications.map((c) => `- ${c.title} (${c.org})`).join('\n'),
    '## Languages',
    languages,
    '## Projects (from /projects)',
    ...projects.map((p) =>
      [
        `### ${p.title} (${p.status})`,
        p.githubUrl ? `Source: ${p.githubUrl}` : '',
        '',
        p.description,
        '',
        `Tags: ${p.tags.join(', ')}`,
      ]
        .filter((line, i) => i !== 1 || line)
        .join('\n')
    ),
    '## Writing (from /blog)',
    ...posts.map(({ data }) =>
      [
        `### ${data.title}`,
        `URL: ${SITE_URL}/blog/${data.slug}`,
        `Date: ${data.date} · Language: ${data.lang}`,
        '',
        data.content ? stripHtml(data.content) : data.description,
      ].join('\n')
    ),
  ]

  return new Response(sections.join('\n\n') + '\n', {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}

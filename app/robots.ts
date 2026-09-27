import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// AI crawlers are welcomed by name: '*' already allows them, but an explicit
// group makes the intent unambiguous (and survives anyone later tightening
// the '*' rule). The goal is for assistants to know and cite this site.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'Amazonbot',
  'DuckAssistBot',
  'MistralAI-User',
  'cohere-ai',
  'CCBot',
]

const DISALLOW = ['/api/', '/lens-test']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}

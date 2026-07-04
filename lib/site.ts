// Single source of truth for site identity and SEO. Used by layout metadata,
// the Person JSON-LD, the sitemap, and robots.
export const SITE_URL = 'https://kaanhho.com'

export const PERSON = {
  name: 'Kaan Hacihaliloglu',
  // Handles people actually search for. These become schema.org alternateName,
  // which is what ties queries like "kaanhho" / "khdoex" to this page.
  handles: ['kaanhho', 'khdoex'],
  jobTitle: 'AI Engineer',
  knowsAbout: [
    'Mechanistic Interpretability',
    'LLM Safety',
    'Machine Learning',
    'Large Language Models',
  ],
  // Profile URLs. sameAs is the strongest structured signal linking the
  // handles above to one identity; add LinkedIn / Scholar here when ready.
  sameAs: [
    'https://github.com/khdoex',
    'https://x.com/kaanhho',
    'https://huggingface.co/kaanhho',
  ],
}

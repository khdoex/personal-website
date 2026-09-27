import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, PERSON } from '@/lib/site'

// Stable node ids so every page's JSON-LD points at the same Person and
// WebSite. Search engines and LLM crawlers merge nodes that share an @id,
// which is how the handles, profiles and pages collapse into one identity.
export const PERSON_ID = `${SITE_URL}/#person`
export const WEBSITE_ID = `${SITE_URL}/#website`

const abs = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`

export const OG_IMAGE = {
  url: PERSON.ogImage,
  width: 1200,
  height: 630,
  alt: 'Kaan Hacihaliloglu (kaanhho), AI engineer and LLM interpretability researcher',
}

/**
 * Per-page metadata. Every page gets its own canonical (the root layout used
 * to set canonical "/" for everything, which told Google that /about,
 * /resume and every post were duplicates of the homepage).
 */
export function pageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  type = 'website',
  locale = 'en_US',
  languages,
  publishedTime,
}: {
  title?: string
  absoluteTitle?: string
  description: string
  path: string
  type?: 'website' | 'article' | 'profile'
  locale?: 'en_US' | 'tr_TR'
  languages?: Record<string, string>
  publishedTime?: string
}): Metadata {
  const fullTitle = absoluteTitle ?? `${title} | ${SITE_NAME}`
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: path, languages },
    openGraph: {
      title: fullTitle,
      description,
      url: abs(path),
      siteName: SITE_NAME,
      images: [OG_IMAGE],
      locale,
      alternateLocale: locale === 'en_US' ? ['tr_TR'] : ['en_US'],
      ...(type === 'article'
        ? { type, publishedTime, authors: [SITE_URL] }
        : type === 'profile'
          ? {
              type,
              firstName: PERSON.givenName,
              lastName: PERSON.familyName,
              username: PERSON.handles[0],
            }
          : { type }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      creator: '@kaanhho',
      site: '@kaanhho',
      images: [OG_IMAGE],
    },
  }
}

export function personNode() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PERSON.name,
    alternateName: PERSON.alternateNames,
    givenName: PERSON.givenName,
    familyName: PERSON.familyName,
    url: SITE_URL,
    mainEntityOfPage: SITE_URL,
    image: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#portrait`,
      url: abs(PERSON.image),
      contentUrl: abs(PERSON.image),
      width: PERSON.imageSize.width,
      height: PERSON.imageSize.height,
      caption: PERSON.name,
    },
    email: `mailto:${PERSON.email}`,
    jobTitle: [PERSON.jobTitle, PERSON.jobTitleTr, 'Interpretability Researcher'],
    description: PERSON.shortBio,
    disambiguatingDescription:
      'Kaan Hacihaliloglu, AI engineer and LLM interpretability researcher based in Istanbul, known online as kaanhho (X, Hugging Face, LinkedIn) and khdoex (GitHub).',
    knowsAbout: PERSON.knowsAbout,
    knowsLanguage: [
      { '@type': 'Language', name: 'Turkish', alternateName: 'tr' },
      { '@type': 'Language', name: 'English', alternateName: 'en' },
    ],
    nationality: { '@type': 'Country', name: PERSON.country },
    homeLocation: {
      '@type': 'Place',
      name: `${PERSON.city}, ${PERSON.country}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: PERSON.city,
        addressCountry: 'TR',
      },
    },
    hasOccupation: [
      {
        '@type': 'Occupation',
        name: 'AI Engineer',
        alternateName: ['Yapay Zeka Mühendisi', 'Machine Learning Engineer'],
        occupationLocation: { '@type': 'City', name: PERSON.city },
        skills:
          'Machine learning, deep learning, large language models, AI agents, mechanistic interpretability, LLM safety, PyTorch, TransformerLens, nnsight, Python, TypeScript, FastAPI, Laravel, Django, Next.js, Redis',
      },
      {
        '@type': 'Occupation',
        name: 'Interpretability Researcher',
        description:
          'Mechanistic interpretability of refusal behavior in large language models.',
      },
    ],
    worksFor: PERSON.organizations.map((org) => ({
      '@type': 'Organization',
      name: org.name,
      url: org.url,
    })),
    affiliation: [...PERSON.organizations, ...PERSON.pastOrganizations].map(
      (org) => ({ '@type': 'Organization', name: org.name, url: org.url })
    ),
    alumniOf: PERSON.alumniOf.map((org) => ({
      '@type': 'CollegeOrUniversity',
      name: org.name,
      url: org.url,
    })),
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'degree',
        name: 'B.Sc. in Physics',
        recognizedBy: { '@type': 'CollegeOrUniversity', name: 'Boğaziçi University' },
      },
    ],
    sameAs: PERSON.sameAs,
  }
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: ['kaanhho', 'kaanhho.com', PERSON.nameTr],
    description: PERSON.shortBio,
    inLanguage: ['en', 'tr'],
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
  }
}

/** ProfilePage: Google's documented type for "this page is about a person". */
export function profilePageNode({
  path,
  name,
  inLanguage = 'en',
}: {
  path: string
  name: string
  inLanguage?: string
}) {
  return {
    '@type': 'ProfilePage',
    '@id': `${abs(path)}#profilepage`,
    url: abs(path),
    name,
    inLanguage,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: { '@id': PERSON_ID },
    about: { '@id': PERSON_ID },
  }
}

export function breadcrumbNode(trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: SITE_NAME, path: '/' }, ...trail].map(
      (item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: abs(item.path),
      })
    ),
  }
}

export function blogPostingNode({
  title,
  description,
  slug,
  date,
  inLanguage,
  wordCount,
}: {
  title: string
  description: string
  slug: string
  date: string
  inLanguage: string
  wordCount?: number
}) {
  const url = abs(`/blog/${slug}`)
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    datePublished: date,
    dateModified: date,
    inLanguage,
    wordCount,
    image: abs(PERSON.ogImage),
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    isPartOf: { '@id': `${SITE_URL}/blog#blog` },
  }
}

/** Wraps nodes into one @graph document. */
export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes }
}

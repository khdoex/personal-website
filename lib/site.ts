// Single source of truth for site identity and SEO. Used by layout metadata,
// the JSON-LD graph, the sitemap, robots, llms-full.txt and the RSS feed.
export const SITE_URL = 'https://kaanhho.com'
export const SITE_NAME = 'Kaan Hacihaliloglu'

export const PERSON = {
  name: 'Kaan Hacihaliloglu',
  // Turkish spelling. Search engines mostly fold ı/ğ to i/g, but not always,
  // so both spellings appear in visible copy and in the structured data.
  nameTr: 'Kaan Hacıhaliloğlu',
  givenName: 'Kaan',
  familyName: 'Hacihaliloglu',
  // Handles people actually search for. These become schema.org alternateName,
  // which is what ties queries like "kaanhho" / "khdoex" to this page.
  handles: ['kaanhho', 'khdoex'],
  alternateNames: [
    'Kaan Hacıhaliloğlu',
    'Hacihaliloglu',
    'Hacıhaliloğlu',
    'kaanhho',
    'khdoex',
    'Kaan H.',
  ],
  jobTitle: 'AI Engineer',
  jobTitleTr: 'Yapay Zeka Mühendisi',
  email: 'kaanhacihaliloglu@gmail.com',
  image: '/images/kaan-hacihaliloglu.png',
  imageSize: { width: 1086, height: 1448 },
  // 1200x630 social card (rendered from the site's palette + portrait).
  ogImage: '/images/og-kaan-hacihaliloglu.jpg',
  city: 'Istanbul',
  country: 'Türkiye',
  // One-sentence bios reused by meta descriptions and the Person schema.
  shortBio:
    'Physicist turned AI engineer. Researches mechanistic interpretability and refusal behavior in large language models (MSc thesis, Sabancı University) and builds an AI market research engine at SCL (Synthetic Consumer Lab).',
  shortBioTr:
    'Fizikten yapay zekaya geçmiş bir yapay zeka mühendisi. Sabancı Üniversitesi’ndeki yüksek lisans tezinde büyük dil modellerinde (LLM) reddetme davranışını ve mekanistik yorumlanabilirliği araştırıyor, SCL’de (Synthetic Consumer Lab) yapay zeka tabanlı bir pazar araştırması motoru geliştiriyor.',
  knowsAbout: [
    'Artificial Intelligence',
    'Machine Learning',
    'Deep Learning',
    'Large Language Models',
    'Mechanistic Interpretability',
    'AI Safety',
    'LLM Safety',
    'Refusal Directions',
    'Activation Steering',
    'Sparse Autoencoders',
    'AI Agents',
    'Synthetic Consumers',
    'Market Research',
    'Audio Machine Learning',
    'Physics',
    'PyTorch',
    'Python',
    'TypeScript',
    'Next.js',
    'FastAPI',
  ],
  // Organizations he engineers for (used in the Person schema worksFor).
  organizations: [
    {
      name: 'SCL (Synthetic Consumer Lab)',
      url: 'https://synthetic-consumers.com/',
    },
    { name: 'SoundBoost', url: 'https://soundboost.ai' },
  ],
  pastOrganizations: [
    { name: 'Live The World', url: 'https://livetheworld.com/' },
    { name: 'Allianz Türkiye', url: 'https://www.allianz.com.tr/' },
  ],
  alumniOf: [
    { name: 'Sabancı University', url: 'https://sabanciuniv.edu/' },
    { name: 'Boğaziçi University', url: 'https://boun.edu.tr/' },
    { name: 'University of Padua', url: 'https://www.unipd.it/en/' },
  ],
  // Profile URLs. sameAs is the strongest structured signal linking the
  // handles above to one identity.
  sameAs: [
    'https://github.com/khdoex',
    'https://x.com/kaanhho',
    'https://huggingface.co/kaanhho',
    'https://www.linkedin.com/in/kaanhho/',
    'https://www.instagram.com/kaanhho/',
  ],
}

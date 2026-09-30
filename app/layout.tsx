import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import JsonLd from '@/components/JsonLd'
import World from '@/components/world/World'
import IntroOverlay from '@/components/world/IntroOverlay'
import { INTRO_GATE } from '@/components/world/gate'
import { content } from '@/lib/content.generated'
import { SITE_URL, SITE_NAME, PERSON } from '@/lib/site'
import { OG_IMAGE, graph, personNode, websiteNode } from '@/lib/seo'

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
});
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a1428',
};

const DEFAULT_TITLE =
  'Kaan Hacihaliloglu (kaanhho) · AI Engineer & LLM Interpretability Researcher'
const DEFAULT_DESCRIPTION =
  'Kaan Hacihaliloglu (Hacıhaliloğlu, kaanhho): physicist turned AI engineer in Istanbul. Researches refusal and safety in LLMs through mechanistic interpretability, builds an AI market research engine at SCL.'

// Canonical URLs are set per page (see pageMetadata in lib/seo.ts). Setting
// one here would leak into every route that forgets to override it.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  // Google ignores meta keywords; Bing and Yandex still read them a little.
  keywords: [
    'Kaan Hacihaliloglu',
    'Kaan Hacıhaliloğlu',
    'Hacihaliloglu',
    'Hacıhaliloğlu',
    'kaanhho',
    'khdoex',
    'Kaan AI engineer',
    'Kaan yapay zeka',
    'yapay zeka mühendisi',
    'AI engineer Istanbul',
    'mechanistic interpretability',
    'LLM safety',
    'refusal direction',
    'Synthetic Consumer Lab',
    'Sabancı University',
  ],
  authors: [{ name: PERSON.name, url: SITE_URL }],
  creator: PERSON.name,
  publisher: PERSON.name,
  alternates: {
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: `${SITE_NAME} · writing` }],
    },
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['tr_TR'],
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    creator: '@kaanhho',
    site: '@kaanhho',
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning: the intro gate below may set data-intro on
    // <html> before React hydrates, which React would otherwise report.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
        {/* Pointers for LLM agents: the plain-text profile and full dump. */}
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="llms.txt" />
        <link rel="alternate" type="text/markdown" href="/llms-full.txt" title="llms-full.txt" />
      </head>
      <body
        className={`${jetbrainsMono.variable} ${newsreader.variable} antialiased`}
      >
        <JsonLd data={graph(websiteNode(), personNode())} />
        <World labels={content.world} email={PERSON.email} />
        {/* Outside <main>: the ride hides main, and its instruments must show. */}
        <IntroOverlay
          brand={content.navigation.home}
          coords={content.hero.location}
          lines={content.intro.lines}
          skip={content.intro.skip}
        />
        <Navigation labels={content.navigation} />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer line={content.footer.line} />
      </body>
    </html>
  )
}

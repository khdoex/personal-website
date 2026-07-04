import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { SITE_URL, PERSON } from '@/lib/site'

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1d252c',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Kaan Hacihaliloglu (kaanhho) | AI Engineer & Interpretability Researcher",
  description: "Kaan Hacihaliloglu — physicist turned AI engineer. Researching mechanistic interpretability and refusal behavior in LLMs, building synthetic consumer AI at SCL. Also known as kaanhho and khdoex.",
  keywords: ["Kaan Hacihaliloglu", "kaanhho", "khdoex", "AI engineer", "mechanistic interpretability", "LLM safety", "refusal behavior", "machine learning", "Sabancı University"],
  authors: [{ name: "Kaan Hacihaliloglu", url: SITE_URL }],
  creator: "Kaan Hacihaliloglu",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kaan Hacihaliloglu (kaanhho) | AI Engineer & Interpretability Researcher",
    description: "Physicist turned AI engineer. Mechanistic interpretability and refusal behavior in LLMs, building synthetic consumer AI at SCL.",
    url: SITE_URL,
    siteName: "Kaan Hacihaliloglu",
    type: "website",
    locale: "en_US",
    images: [{ url: "/images/kaan.png", width: 1086, height: 1448, alt: "Kaan Hacihaliloglu" }],
  },
  twitter: {
    card: "summary",
    title: "Kaan Hacihaliloglu (kaanhho) | AI Engineer & Interpretability Researcher",
    description: "Physicist turned AI engineer. Mechanistic interpretability and refusal behavior in LLMs.",
    creator: "@kaanhho",
    images: ["/images/kaan.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon-4.svg',
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PERSON.name,
  alternateName: PERSON.handles,
  url: SITE_URL,
  image: `${SITE_URL}/images/kaan.png`,
  jobTitle: PERSON.jobTitle,
  description:
    "Physicist turned AI engineer and interpretability researcher. Builds production AI systems at SCL and researches mechanistic interpretability and refusal behavior in large language models.",
  knowsAbout: PERSON.knowsAbout,
  knowsLanguage: ["English", "Turkish"],
  hasOccupation: {
    "@type": "Occupation",
    name: "AI Engineer",
    skills:
      "Machine learning, deep learning, large language models, mechanistic interpretability, LLM safety, PyTorch, full-stack web development, TypeScript, React, Next.js, backend engineering",
  },
  worksFor: { "@type": "Organization", name: "SCL (Synthetic Consumer Lab)" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Sabancı University" },
  sameAs: PERSON.sameAs,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} ${plexSans.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <Navigation />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

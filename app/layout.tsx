import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

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
  title: "Kaan Hacihaliloglu | AI Engineer & Researcher",
  description: "Researching mechanistic interpretability and refusal behavior in LLMs. Building synthetic consumer AI at SCL. MSc Data Science at Sabancı University.",
  keywords: ["AI engineer", "mechanistic interpretability", "LLM safety", "refusal behavior", "machine learning", "data science", "Sabancı University"],
  authors: [{ name: "Kaan Hacihaliloglu" }],
  creator: "Kaan Hacihaliloglu",
  openGraph: {
    title: "Kaan Hacihaliloglu | AI Engineer & Researcher",
    description: "Researching mechanistic interpretability and refusal behavior in LLMs. Building synthetic consumer AI at SCL.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Kaan Hacihaliloglu | AI Engineer & Researcher",
    description: "Researching mechanistic interpretability and refusal behavior in LLMs.",
    creator: "@kaanhho",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon-4.svg',
  },
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
        <Navigation />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

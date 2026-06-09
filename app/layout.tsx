import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Instrument_Serif, Newsreader } from "next/font/google";
import "./globals.css";
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0c0a',
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
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${newsreader.variable} antialiased`}
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

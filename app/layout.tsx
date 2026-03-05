import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "Kaan Hacihaliloglu | AI Engineer & Researcher",
  description: "Researching cross-lingual mechanistic interpretability in LLMs. Building synthetic consumer AI at SCL. MSc Data Science at Sabancı University.",
  keywords: ["AI engineer", "mechanistic interpretability", "LLM safety", "cross-lingual", "machine learning", "data science", "Sabancı University"],
  authors: [{ name: "Kaan Hacihaliloglu" }],
  creator: "Kaan Hacihaliloglu",
  openGraph: {
    title: "Kaan Hacihaliloglu | AI Engineer & Researcher",
    description: "AI Engineer working on LLM interpretability & safety. Building AI systems at SCL.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaan Hacihaliloglu | AI Engineer & Researcher",
    description: "AI Engineer working on LLM interpretability & safety",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        <main className="min-h-screen pt-14">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

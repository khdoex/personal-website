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
  description: "AI Engineer working on LLM interpretability & safety. MSc Data Science at Sabanci University. Building AI systems at SCL Synthetic Consumer Lab.",
  keywords: ["AI engineer", "LLM interpretability", "AI safety", "machine learning", "data science", "Sabanci University"],
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
    icon: '/favicon.ico',
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

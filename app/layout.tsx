import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { ThemeProvider } from '@/contexts/ThemeContext'
import VerticalBackgrounds from '@/components/VerticalBackgrounds'
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
  title: "Kaan Hacıhaliloğlu | Data Scientist & AI Researcher",
  description: "MSc Data Science student at Sabanci University specializing in machine learning, audio AI, and generative models. Explore my research, projects, and AI experiments.",
  keywords: ["data science", "machine learning", "artificial intelligence", "audio AI", "generative models", "research", "Sabanci University"],
  authors: [{ name: "Kaan Hacıhaliloğlu" }],
  creator: "Kaan Hacıhaliloğlu",
  openGraph: {
    title: "Kaan Hacıhaliloğlu | Data Scientist & AI Researcher",
    description: "MSc Data Science student specializing in machine learning, audio AI, and generative models",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaan Hacıhaliloğlu | Data Scientist & AI Researcher",
    description: "MSc Data Science student specializing in machine learning, audio AI, and generative models",
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
        <ThemeProvider>
          <VerticalBackgrounds />
          <header className="p-4 flex justify-end">
            <ThemeSwitcher />
          </header>
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}

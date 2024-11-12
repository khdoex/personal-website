import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { ThemeProvider } from '@/contexts/ThemeContext'
import VerticalBackgrounds from '@/components/VerticalBackgrounds'
import SocialLinks from '@/components/SocialLinks'

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
  title: "kaanhho",
  description: "Personal website and portfolio of Kaan Hacıhaliloğlu",
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
          <SocialLinks />
        </ThemeProvider>
      </body>
    </html>
  )
}

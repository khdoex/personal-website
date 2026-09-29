'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { SiteContent } from '@/lib/content-types'

export default function Navigation({ labels }: { labels: SiteContent['navigation'] }) {
  const pathname = usePathname()
  const isReading = pathname.startsWith('/blog/')
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)

  const navItems = [
    { href: '/blog', label: labels.blog },
    { href: '/projects', label: labels.projects },
    { href: '/about', label: labels.about },
    { href: '/resume', label: labels.resume },
  ]

  // On the home page the bar stays out of the way of the planet until the
  // reader scrolls; everywhere else it keeps its glass from the start.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const clear = isHome && !scrolled

  return (
    <nav
      className={`site-nav ${isReading ? 'absolute' : 'fixed'} top-0 left-0 right-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${
        clear
          ? 'border-transparent bg-transparent'
          : 'border-border/70 bg-background/70 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto w-full max-w-[1168px] px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-serif text-lead font-medium text-heading hover:text-accent transition-colors whitespace-nowrap shrink-0"
          >
            <span aria-hidden className="dot breathe text-accent" style={{ width: 6, height: 6 }} />
            {labels.home}
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative font-mono text-meta transition-colors ${
                    isActive ? 'text-accent' : 'text-muted hover:text-heading'
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={`absolute -top-2 left-0 h-1.5 w-px bg-accent transition-opacity duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { SiteContent } from '@/lib/content-types'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navigation({ labels }: { labels: SiteContent['navigation'] }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/blog', label: labels.blog },
    { href: '/projects', label: labels.projects },
    { href: '/about', label: labels.about },
    { href: '/resume', label: labels.resume },
  ]

  return (
    <nav className="relative border-b border-border bg-background">
      <div className="mx-auto w-full max-w-[1168px] px-4 min-[360px]:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* On a phone the name stacks, one word a line, so it and the four
              links share the bar without crowding; on the narrowest the links
              and the margins come down a step as well. */}
          <Link
            href="/"
            className="flex items-center font-serif text-sm leading-tight sm:text-lead sm:leading-normal font-medium text-heading hover:text-accent shrink-0"
          >
            <span className="w-min sm:w-auto sm:whitespace-nowrap">{labels.home}</span>
          </Link>

          <div className="flex items-center gap-1.5 min-[375px]:gap-2 min-[400px]:gap-3 sm:gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-mono text-tick min-[360px]:text-meta ${
                    isActive ? 'text-accent' : 'text-muted hover:text-heading'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {/* Five items crowd the bar on a phone, so there the switch sits in the footer. */}
            <ThemeToggle className="hidden sm:inline font-mono text-meta text-muted hover:text-heading" />
          </div>
        </div>
      </div>
    </nav>
  )
}

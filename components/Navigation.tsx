'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/blog', label: 'blog' },
  { href: '/projects', label: 'projects' },
  { href: '/about', label: 'about' },
  { href: '/resume', label: 'resume' },
]

export default function Navigation() {
  const pathname = usePathname()
  const isReading = pathname.startsWith('/blog/')

  return (
    <nav className={`${isReading ? 'absolute' : 'fixed'} top-0 left-0 right-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md`}>
      <div className="mx-auto w-full max-w-[1168px] px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-serif text-lead font-medium text-heading hover:text-accent transition-colors whitespace-nowrap shrink-0"
          >
            kaan h.
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

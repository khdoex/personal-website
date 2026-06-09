'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/blog', label: 'blog' },
  { href: '/projects', label: 'projects' },
  { href: '/resume', label: 'resume' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-mono text-sm font-semibold text-heading hover:text-accent transition-colors"
          >
            kaan h.<span className="cursor-blink text-accent">▊</span>
          </Link>

          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative font-mono text-[13px] transition-colors ${
                    isActive ? 'text-accent' : 'text-muted hover:text-heading'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-200 ${
                      isActive ? 'w-full' : 'w-0'
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

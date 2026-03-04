'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/blog', label: '/blog' },
  { href: '/projects', label: '/projects' },
  { href: '/media', label: '/media' },
  { href: '/resume', label: '/resume' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="font-mono text-sm font-semibold tracking-tight text-white hover:text-accent transition-colors"
          >
            kaanhho
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded font-mono text-sm transition-colors ${
                    isActive
                      ? 'text-accent bg-surface'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

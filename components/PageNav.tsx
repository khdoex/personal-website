'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface PageNavProps {
  title: string
}

export default function PageNav({ title }: PageNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleBack = () => {
    // If we're in a blog post, go back to blog listing
    if (pathname.startsWith('/blog/') && pathname !== '/blog') {
      router.push('/blog')
    }
    // If we're in media, projects, or other main sections, go to home
    else if (['/media', '/projects', '/resume', '/blog'].includes(pathname)) {
      router.push('/')
    }
    // For any other case, use browser back
    else {
      router.back()
    }
  }

  return (
    <div className="flex items-center gap-4 mb-6">
      <Link 
        href="/"
        className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10"
      >
        <Home size={24} />
      </Link>
      <button
        onClick={handleBack}
        className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="page-title mb-0">{title}</h1>
    </div>
  )
} 
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
    // Define main sections and their parent routes
    const routes = {
      '/blog': '/',
      '/projects': '/',
      '/resume': '/',
      '/media': '/',
    }

    // Check if current path is a blog post
    if (pathname.startsWith('/blog/') && pathname !== '/blog') {
      router.push('/blog')
      return
    }

    // For main sections, go to home
    if (routes[pathname as keyof typeof routes]) {
      router.push('/')
      return
    }

    // For any other case, try browser back
    try {
      window.history.back()
    } catch {
      // Fallback to home if history.back() fails
      router.push('/')
    }
  }

  return (
    <div className="flex items-center gap-4 mb-6">
      <Link 
        href="/"
        className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10"
        aria-label="Home"
      >
        <Home size={24} />
      </Link>
      <button
        onClick={handleBack}
        className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10"
        aria-label="Go back"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="page-title mb-0 drop-shadow-lg">{title}</h1>
    </div>
  )
} 
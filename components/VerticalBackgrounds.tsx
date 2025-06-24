'use client'

import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'

const VerticalBackgrounds = () => {
  const { theme } = useTheme()
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/getImages')
      .then(res => res.json())
      .then(data => {
        setImages(data.images || [])
      })
      .catch(error => {
        console.error("Error fetching background images:", error)
        setImages([])
      })
  }, [])

  if (theme === 'classic') return null

  // Use vertical strips with multiple images
  return (
    <div className="fixed inset-0 -z-10">
      <div className="flex h-screen">
        {images.length > 0 ? (
          images.slice(0, 6).map((image, i) => (
            <div key={image} className="flex-1">
              <div className="relative w-full h-full">
                <Image
                  src={`/images/backgrounds/${image}`}
                  alt=""
                  fill
                  className="object-cover opacity-80"
                  priority={i < 2}
                />
              </div>
            </div>
          ))
        ) : (
          // Fallback gradient if no images are available
          <div className="w-full h-full bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-blue-900/70 to-indigo-900/80" />
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-800/20 via-purple-900/10 to-slate-800/30 animate-pulse-gentle" />
          </div>
        )}
      </div>
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  )
}

export default VerticalBackgrounds
'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState, useRef } from 'react'

const VerticalBackgrounds = () => {
  const { theme } = useTheme()
  const [images, setImages] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/getImages')
      .then(res => res.json())
      .then(data => {
        console.log('Images loaded:', data.images)
        setImages(data.images)
      })
  }, [])

  // Don't render anything if theme is classic
  if (theme === 'classic') {
    return null
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 -z-10"
    >
      <div className="flex h-screen overflow-hidden">
        {images.map((image, index) => (
          <div 
            key={image} 
            className="relative flex-1 min-w-[200px] transition-opacity duration-500"
          >
            <img
              src={`/backgrounds/${image}`}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover ${
                theme === 'gradient' ? 'opacity-50' : 'opacity-0'
              }`}
              style={{
                maxWidth: '100%',
                height: '100%'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default VerticalBackgrounds
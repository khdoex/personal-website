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
        setImages(data.images)
      })
  }, [])

  if (theme === 'classic') return null

  // Option 1: Subtle single image (current)
  // const backgroundImage = images[0]
  // if (!backgroundImage) return null

  // Professional gradient background with darker blue tones
  return (
    <div className="fixed inset-0 -z-10">
      <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
        {/* Primary dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-blue-900/70 to-indigo-900/80" />
        
        {/* Subtle animated overlay */}
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-800/20 via-purple-900/10 to-slate-800/30 animate-pulse-gentle" />
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] [background-size:24px_24px]" />
        </div>
        
        {/* Additional depth layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-blue-950/30" />
      </div>
    </div>
  )

  // Uncomment below and comment above for subtle image option
  /*
  const backgroundImage = images[0]
  if (!backgroundImage) return null

        return (
        <div className="fixed inset-0 -z-10">
          <div className="relative w-full h-full">
            <Image
              src={`/images/backgrounds/${backgroundImage}`}
              alt=""
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/60" />
          </div>
        </div>
      )
  */
}

export default VerticalBackgrounds
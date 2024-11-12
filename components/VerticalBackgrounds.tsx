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

  return (
    <div className="fixed inset-0 -z-10">
      <div className="flex h-screen">
        {images.map((image, i) => (
          <div key={image} className="flex-1">
            <div className="relative w-full h-full">
              <Image
                src={`/backgrounds/${image}`}
                alt=""
                fill
                className="object-cover opacity-100"
                priority
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VerticalBackgrounds
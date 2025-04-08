'use client'

import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'

const VerticalBackgrounds = () => {
  const { theme } = useTheme()
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/getImages')
      .then(res => res.json())
      .then(data => {
        const images: string[] = data.images
        if (images && images.length > 0) {
          const randomIndex = Math.floor(Math.random() * images.length)
          setBackgroundImage(images[randomIndex])
        }
      })
      .catch(error => console.error("Error fetching background images:", error));
  }, [])

  if (theme === 'classic' || !backgroundImage) return null

  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src={`/backgrounds/${backgroundImage}`}
        alt="Random background image"
        fill
        className="object-cover w-full h-full"
        priority
      />
    </div>
  )
}

export default VerticalBackgrounds
'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Palette } from 'lucide-react'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setTheme(theme === 'gradient' ? 'classic' : 'gradient')}
        className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10"
        aria-label="Toggle theme"
      >
        <Palette size={24} />
      </button>
    </div>
  )
} 
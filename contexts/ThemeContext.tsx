'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'gradient' | 'classic'
type BackgroundImage = string | null

interface ThemeContextType {
  theme: Theme
  backgroundImage: BackgroundImage
  setTheme: (theme: Theme) => void
  setBackgroundImage: (image: BackgroundImage) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('gradient') // Default to gradient (image theme)
  const [backgroundImage, setBackgroundImage] = useState<BackgroundImage>(null)

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) setThemeState(savedTheme)
  }, [])

  // Persist theme changes
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const getBackgroundClass = () => {
    if (theme === 'classic') {
      return 'bg-gray-900 text-white'
    }
    return 'bg-transparent text-white'
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        backgroundImage, 
        setTheme, 
        setBackgroundImage 
      }}
    >
      <div className={`min-h-screen transition-colors duration-300 ${getBackgroundClass()}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 
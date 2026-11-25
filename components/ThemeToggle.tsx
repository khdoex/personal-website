'use client'

/**
 * Switches between the light and dark themes and remembers the choice. Which
 * label shows is decided in CSS from the theme on <html>, so the server and the
 * first client render agree and the label is right before any script runs.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement
    const current =
      root.dataset.theme ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    const next = current === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {}
  }

  return (
    <button type="button" onClick={toggle} className={className}>
      <span className="theme-to-dark">dark</span>
      <span className="theme-to-light">light</span>
    </button>
  )
}

'use client'

import { useEffect } from 'react'
import { useWorld, world } from './store'

/**
 * The instruments over the ride: the percent counter (the tube's rings
 * passed), a line of copy for each stretch of the trip, and a way out. Only
 * visible while <html data-intro="play">, which the head gate sets.
 */
export default function IntroOverlay({
  brand,
  coords,
  lines,
  skip,
}: {
  brand: string
  coords: string
  lines: string[]
  skip: string
}) {
  const percent = useWorld((s) => s.percent)
  const line = lines[Math.min(lines.length - 1, Math.floor((percent / 100) * lines.length))] ?? ''

  useEffect(() => {
    const playing = () => document.documentElement.getAttribute('data-intro') === 'play'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && playing()) world.skip()
    }
    // Anyone tabbing into the page wants the page: the ride ends there.
    const onFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null
      if (playing() && target && !target.closest('.intro-hud')) world.skip()
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocus)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocus)
    }
  }, [])

  return (
    <div className="intro-hud">
      <div className="intro-top">
        <span className="font-serif text-lead text-heading">{brand}</span>
        <span className="font-mono text-meta tabular-nums text-muted">{coords}</span>
      </div>

      <div className="intro-bottom">
        <div className="intro-meter">
          <span className="intro-percent font-mono tabular-nums text-heading">
            {String(percent).padStart(3, '0')}
            <span className="text-sun">%</span>
          </span>
          <span className="intro-bar" aria-hidden>
            <span style={{ transform: `scaleX(${percent / 100})` }} />
          </span>
          <span key={line} className="intro-line font-mono text-meta text-muted" aria-live="polite">
            {line}
          </span>
        </div>

        <button type="button" onClick={() => world.skip()} className="intro-skip u-link font-mono text-meta text-muted hover:text-accent">
          {skip} <span aria-hidden>→</span>
          <kbd className="intro-kbd">esc</kbd>
        </button>
      </div>
    </div>
  )
}

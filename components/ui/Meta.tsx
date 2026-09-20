import type { ReactNode } from 'react'

const tones = {
  muted: 'text-muted',
  date: 'text-amber',
  faint: 'text-muted-dark',
} as const

/**
 * The instrument register. Every date, label, tag and axis mark. Tabular
 * numerals so figures in a column line up.
 */
export default function Meta({
  children,
  tone = 'muted',
  className = '',
}: {
  children: ReactNode
  tone?: keyof typeof tones
  className?: string
}) {
  return (
    <span
      className={`font-mono text-meta tabular-nums tracking-[0.04em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

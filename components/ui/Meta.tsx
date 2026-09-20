import type { ReactNode } from 'react'

const tones = {
  muted: 'text-muted',
  date: 'text-amber',
} as const

// Two tones, no third. --muted-dark sits at 2.37 against the ground and
// fails AA, so no text tone maps to it; Rule's 1px tick is the only
// sanctioned use of that token. Hierarchy between a label and body text
// comes from typeface and size, not from a third grey.

/**
 * The instrument register. Every date, label, tag and axis mark. Tabular
 * numerals so figures in a column line up.
 */
export default function Meta({
  children,
  tone = 'muted',
  className = '',
  as = 'span',
}: {
  children: ReactNode
  tone?: keyof typeof tones
  className?: string
  as?: 'span' | 'time'
}) {
  const Tag = as
  return (
    <Tag
      className={`font-mono text-meta tabular-nums tracking-[0.04em] ${tones[tone]} ${className}`}
    >
      {children}
    </Tag>
  )
}

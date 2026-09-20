import type { ReactNode } from 'react'

/**
 * The left track. Holds dates, section labels and status marks. Sticky when a
 * label should stay beside a group that is taller than the viewport.
 */
export default function Gutter({
  children,
  sticky = false,
  className = '',
}: {
  children: ReactNode
  sticky?: boolean
  className?: string
}) {
  return (
    <div
      className={`lg:col-start-1 ${sticky ? 'lg:sticky lg:top-24 lg:self-start' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

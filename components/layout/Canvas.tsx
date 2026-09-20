import type { ReactNode } from 'react'

/**
 * The three-track page grid. A left gutter that behaves as an axis, the
 * reading column, and a right gutter for margin notes and bleeding figures.
 * This is the only place the tracks and the collapse breakpoint are defined.
 */
export default function Canvas({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`mx-auto grid w-full max-w-[1168px] grid-cols-1 gap-x-8 px-6 md:px-8 lg:grid-cols-[160px_minmax(0,660px)_220px] ${className}`}
    >
      {children}
    </div>
  )
}

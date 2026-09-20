import type { ReactNode } from 'react'

/**
 * One row of a list, inheriting Canvas's tracks through subgrid rather than
 * redeclaring them. Replaces the four hand-copied [3rem_1fr] grids.
 * Must be rendered as a direct child of Canvas.
 */
export default function Entry({
  gutter,
  children,
  className = '',
}: {
  gutter?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`col-span-full grid grid-cols-1 gap-x-8 gap-y-2 py-7 lg:grid-cols-subgrid ${className}`}
    >
      <div className="lg:col-start-1">{gutter}</div>
      <div className="lg:col-start-2">{children}</div>
    </div>
  )
}

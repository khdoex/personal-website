import type { ReactNode } from 'react'
import Reveal from '@/components/motion/Reveal'

const row = 'col-span-full grid grid-cols-1 gap-x-8 gap-y-2 py-7 lg:grid-cols-subgrid'

/**
 * One row of a list, inheriting Canvas's tracks through subgrid rather than
 * redeclaring them. Replaces the four hand-copied [3rem_1fr] grids.
 * Must be rendered as a direct child of Canvas.
 *
 * With a delay the row arrives on scroll. Reveal's motion.div carries the
 * subgrid classes itself rather than sitting between Canvas and the row,
 * because subgrid only inherits from a direct grid child.
 */
export default function Entry({
  gutter,
  children,
  className = '',
  delay,
}: {
  gutter?: ReactNode
  children: ReactNode
  className?: string
  delay?: number
}) {
  const cells = (
    <>
      <div className="lg:col-start-1">{gutter}</div>
      <div className="lg:col-start-2">{children}</div>
    </>
  )

  if (delay === undefined) {
    return <div className={`${row} ${className}`}>{cells}</div>
  }

  return (
    <Reveal delay={delay} className={`${row} ${className}`}>
      {cells}
    </Reveal>
  )
}

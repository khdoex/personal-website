'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Viewport-entry rise. Reversible: scrolling away rewinds it, so arriving
 * again replays it (the "everything arrives" language from the v2 spec).
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()

  // Always render motion.div: swapping element types on the reduced-motion
  // branch causes an SSR hydration mismatch that strands content at
  // opacity 0. The from-state is serialised into the SSR markup, and a
  // client that prefers reduced motion never runs the animation that would
  // clear it, so the reveal-root class hands that case to CSS, which the
  // browser resolves without waiting for hydration.
  return (
    <motion.div
      className={className ? `reveal-root ${className}` : 'reveal-root'}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

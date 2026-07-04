'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import {
  motionValue,
  useReducedMotion,
  useScroll,
  type MotionValue,
} from 'framer-motion'

const FigureProgress = createContext<MotionValue<number> | null>(null)

export function useFigureProgress(): MotionValue<number> {
  const value = useContext(FigureProgress)
  if (!value) {
    throw new Error('useFigureProgress must be used inside <ScrollFigure>')
  }
  return value
}

/**
 * Figure wrapper that owns a scroll-scrubbed progress value (0 at figure
 * entering the lower viewport, 1 well before it reaches the top) and hands
 * it to child figure primitives via context. Scrolling back rewinds.
 */
export default function ScrollFigure({
  n,
  caption,
  children,
}: {
  n?: number
  caption: string
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const staticProgress = useRef(motionValue(1)).current
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.35'],
  })

  return (
    <figure ref={ref} className="my-10">
      <div className="rounded-lg border border-border bg-surface px-5 py-5">
        <FigureProgress.Provider value={reduced ? staticProgress : scrollYProgress}>
          {children}
        </FigureProgress.Provider>
      </div>
      <figcaption className="font-mono text-xs text-muted mt-3">
        {n !== undefined && <span className="text-amber">fig {n}</span>}
        {n !== undefined && ' · '}
        {caption}
      </figcaption>
    </figure>
  )
}

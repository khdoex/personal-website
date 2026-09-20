import type { ReactNode } from 'react'

/**
 * A parenthetical thought. On wide screens it sits in the canvas's right
 * track, aligned to the paragraph it follows. Below the collapse it renders
 * as a quiet inline aside.
 */
export default function MarginNote({ children }: { children: ReactNode }) {
  return (
    <span className="block my-4 rounded border border-border bg-surface/60 px-4 py-3 font-mono text-meta text-muted not-italic lg:absolute lg:left-[calc(100%+2rem)] lg:my-0 lg:w-[220px] lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
      <span aria-hidden className="text-accent">* </span>
      {children}
    </span>
  )
}

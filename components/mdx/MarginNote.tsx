import type { ReactNode } from 'react'

/**
 * A parenthetical thought, typeset properly. On wide screens it floats out
 * into the right gutter beside the paragraph; on smaller screens it renders
 * as a quiet inline aside.
 */
export default function MarginNote({ children }: { children: ReactNode }) {
  return (
    <span className="block my-4 rounded border border-border bg-surface/60 px-4 py-3 font-mono text-xs text-muted leading-relaxed not-italic xl:float-right xl:clear-right xl:-mr-[17rem] xl:ml-6 xl:my-0 xl:w-56 xl:border-0 xl:bg-transparent xl:px-0 xl:py-0">
      <span aria-hidden className="text-accent">
        *{' '}
      </span>
      {children}
    </span>
  )
}

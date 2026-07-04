import type { ReactNode } from 'react'

/** Terminal-card frame for interactive post widgets. */
export default function Widget({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="my-10 rounded-lg border border-border bg-surface overflow-hidden">
      <div className="font-mono text-[11px] text-muted-dark px-4 py-2 border-b border-border">
        ~/{title}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

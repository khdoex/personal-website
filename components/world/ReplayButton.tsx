'use client'

import { useWorld, world } from './store'

/** Plays the ride in again. Hidden where there is no world to ride through. */
export default function ReplayButton({ children }: { children: React.ReactNode }) {
  const failed = useWorld((s) => s.failed)
  if (failed) return null
  return (
    <button
      type="button"
      onClick={() => world.replay()}
      className="replay u-link font-mono text-meta text-muted hover:text-accent"
    >
      <span aria-hidden className="mr-2 inline-block">↺</span>
      {children}
    </button>
  )
}

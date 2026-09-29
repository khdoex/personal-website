'use client'

import { useEffect, useState } from 'react'

const format = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Istanbul',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * The time where Kaan is. Rendered only after mount: the server's clock is
 * not the reader's, and a mismatch would fail hydration.
 */
export default function IstanbulClock({ label }: { label: string }) {
  const [now, setNow] = useState<string | null>(null)

  useEffect(() => {
    const tick = () => setNow(format.format(new Date()))
    tick()
    const id = window.setInterval(tick, 15_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className="font-mono text-meta tabular-nums text-muted">
      {label} <span className="text-heading">{now ?? '--:--'}</span>
    </span>
  )
}

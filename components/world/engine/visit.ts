// How long the site has been open in front of this visitor: counted only
// while the tab is visible, carried across pages and reloads in the same tab.
// The plane with the email runs on this clock.

const KEY = 'world:visit'

export interface Visit {
  /** Seconds the site has been open and visible. */
  seconds(): number
  /** When the next plane is due, on the same clock. */
  readonly due: number
  /** A plane has just set off: the next is due a while from now. */
  flew(): void
  dispose(): void
}

export function createVisit(first: number, every: number): Visit {
  let saved = 0
  let due = first
  try {
    const raw = JSON.parse(sessionStorage.getItem(KEY) ?? 'null')
    if (raw && Number.isFinite(raw.seconds) && Number.isFinite(raw.due)) {
      saved = raw.seconds
      due = raw.due
    }
  } catch {
    // storage blocked: the clock starts from zero on every page load
  }
  const visible = () => document.visibilityState === 'visible'
  let since: number | null = visible() ? performance.now() : null
  const seconds = () => saved + (since === null ? 0 : (performance.now() - since) / 1000)
  const save = () => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ seconds: seconds(), due }))
    } catch {
      // as above
    }
  }
  const onVisibility = () => {
    if (visible()) {
      if (since === null) since = performance.now()
    } else if (since !== null) {
      saved = seconds()
      since = null
      save()
    }
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pagehide', save)
  const timer = window.setInterval(save, 10_000)

  return {
    seconds,
    get due() {
      return due
    },
    flew() {
      due = seconds() + every
      save()
    },
    dispose() {
      save()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', save)
      window.clearInterval(timer)
    },
  }
}

import { useSyncExternalStore } from 'react'

// The one channel between the WebGL engine and the React UI. The engine
// writes phase and progress; the HUD, the skip button and the satellite
// highlights read them. Kept outside React so the engine, which is plain
// TypeScript, can write without a render.

export type Phase = 'boot' | 'space' | 'tunnel' | 'dive' | 'arrive' | 'live'

export interface WorldState {
  phase: Phase
  /** How far the ride has come, 0..100: the tube is the first half, the fall to the city the second. */
  percent: number
  /** True once WebGL is known to be missing or broken. */
  failed: boolean
}

export interface WorldControls {
  skip(): void
  replay(): void
  highlight(index: number | null): void
}

let state: WorldState = { phase: 'boot', percent: 0, failed: false }
const listeners = new Set<() => void>()
const noop = () => {}
let controls: WorldControls = { skip: noop, replay: noop, highlight: noop }

export const worldStore = {
  get: () => state,
  set(patch: Partial<WorldState>) {
    const next = { ...state, ...patch }
    if ((Object.keys(patch) as (keyof WorldState)[]).every((k) => next[k] === state[k])) return
    state = next
    listeners.forEach((l) => l())
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

export function setWorldControls(next: WorldControls | null) {
  controls = next ?? { skip: noop, replay: noop, highlight: noop }
}

export const world: WorldControls = {
  skip: () => controls.skip(),
  replay: () => controls.replay(),
  highlight: (i) => controls.highlight(i),
}

const serverState: WorldState = { phase: 'boot', percent: 0, failed: false }

export function useWorld<T>(select: (s: WorldState) => T): T {
  return useSyncExternalStore(
    worldStore.subscribe,
    () => select(state),
    () => select(serverState)
  )
}

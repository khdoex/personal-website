import { Vector3 } from 'three'

export const DEG = Math.PI / 180
export const TAU = Math.PI * 2

export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t))

/**
 * Frame-rate independent exponential approach: the fraction of the way to
 * the target to cover this frame, for a rate lambda in 1/s.
 */
export const dampFactor = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt)

/** Shortest signed angle from a to b, in radians. */
export const angleDelta = (a: number, b: number) => {
  const d = (b - a) % TAU
  return d > Math.PI ? d - TAU : d < -Math.PI ? d + TAU : d
}

/**
 * A point on the unit sphere from latitude and longitude in degrees, in the
 * frame three's SphereGeometry maps an equirectangular texture onto:
 * longitude 0 on +X, -90 on +Z, +90 on -Z, north on +Y.
 */
export function geo(latDeg: number, lonDeg: number, radius = 1, out = new Vector3()) {
  const lat = latDeg * DEG
  const lon = lonDeg * DEG
  return out.set(
    radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    -radius * Math.cos(lat) * Math.sin(lon)
  )
}

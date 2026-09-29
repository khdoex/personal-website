// Where the camera stands for each part of the site. A shot is a handful of
// numbers; the director blends between them as the page scrolls or the route
// changes, so moving through the site reads as flying around one planet.
//
// Units: the planet has radius 1. Angles are degrees. The sun sits at
// azimuth -138, latitude 16 (see earth.ts), so a camera at azimuth -63 sees
// the day side on its left and the night side, with the cities lit, on its
// right.

export interface Shot {
  /** What the camera circles: the planet at the origin, or a scene out in space. */
  cx: number
  cy: number
  cz: number
  /** Distance from that centre. */
  dist: number
  /** Camera latitude and azimuth around the planet. */
  lat: number
  lon: number
  /** Turns the view off the planet's centre: up, sideways, and around. */
  pitch: number
  yaw: number
  roll: number
  fov: number
  /** Lens shift as a fraction of the viewport; +x moves the planet right, +y up. */
  shiftX: number
  shiftY: number
  /** 0 lets the planet turn on its own; 1 turns Istanbul to face the camera... */
  face: number
  /** ...this many degrees east of the camera's meridian. */
  faceOffset: number
  orbits: number
  sun: number
  beacon: number
  aurora: number
  /** Where the light on the planet is: 0 Istanbul, 1 Padova, in between on the way. */
  place: number
  /** How present the resume's two scenes out in space are, 0..1. */
  physics: number
  llm: number
  /** Opacity of the whole canvas, for pages where text sits over it. */
  canvas: number
}

export type ShotSpec = Shot & { portrait?: Partial<Shot> }

const base: Shot = {
  cx: 0,
  cy: 0,
  cz: 0,
  dist: 4.75,
  lat: 14,
  lon: -63,
  pitch: 0,
  yaw: 0,
  roll: -8,
  fov: 34,
  shiftX: 0.22,
  shiftY: 0,
  face: 1,
  faceOffset: 22,
  orbits: 0.25,
  sun: 0,
  beacon: 1,
  aurora: 1,
  place: 0,
  physics: 0,
  llm: 0,
  canvas: 1,
}

const shot = (s: Partial<Shot>, portrait?: Partial<Shot>): ShotSpec => ({ ...base, ...s, portrait })

/** The home page, one shot per section, top to bottom. */
export const HOME: Record<string, ShotSpec> = {
  hero: shot({}, { dist: 5.4, fov: 40, shiftX: 0, shiftY: -0.42, roll: -4 }),
  currently: shot(
    { dist: 5.6, lat: 30, lon: -20, roll: 6, shiftX: -0.23, shiftY: 0.02, face: 0, orbits: 1, beacon: 0.6 },
    { dist: 6.4, fov: 40, shiftX: 0, shiftY: 0.3 }
  ),
  about: shot(
    // Down to the horizon over Istanbul at night, the sun just behind the edge.
    { dist: 1.75, lat: 10, lon: 22, pitch: 42, roll: -3, fov: 42, shiftX: 0, face: 1, faceOffset: 4, orbits: 0 },
    { pitch: 46, fov: 50 }
  ),
  resume: shot(
    // The other side of the world in daylight: the Americas, green and gold.
    { dist: 4.5, lat: 6, lon: -100, roll: 9, shiftX: -0.26, face: 1, faceOffset: 104, orbits: 0.2, beacon: 0 },
    { dist: 4.4, fov: 40, shiftX: 0, shiftY: 0.3 }
  ),
  writing: shot(
    { dist: 8.5, lat: 6, lon: 140, roll: -14, shiftX: 0.3, shiftY: 0.2, face: 0, orbits: 0.15, beacon: 0.3 },
    { dist: 10, fov: 40, shiftX: 0.2, shiftY: 0.32 }
  ),
  contact: shot(
    // Straight across from the sun (azimuth -138 + 180). From 1.8 radii the
    // planet's edge is 34 degrees off its centre; the sun is 16 degrees up,
    // so with the camera 18 degrees up the sun sits right on the edge. The
    // pitch then puts that edge below the text.
    { dist: 1.8, lat: 18, lon: 41.7, pitch: 39, roll: 0, fov: 44, shiftX: 0, face: 0, orbits: 0, sun: 1, beacon: 0.5 },
    { pitch: 42, fov: 52 }
  ),
}

/**
 * Every other page gets one shot, and blog posts get none: reading wins. The
 * resume has a table of its own, SCENES, below.
 */
export const ROUTES: Record<'about' | 'projects' | 'blog' | 'lost', ShotSpec> = {
  about: shot(
    { dist: 1.75, lat: 10, lon: 22, pitch: 42, roll: -3, fov: 42, shiftX: 0, face: 1, faceOffset: 4, orbits: 0 },
    { pitch: 48, fov: 52 }
  ),
  projects: shot(
    { dist: 6.8, lat: 26, lon: -30, roll: 5, shiftX: 0.35, shiftY: 0.04, face: 0, orbits: 1, beacon: 0.6 },
    { dist: 7.6, fov: 40, shiftX: 0.1, shiftY: 0.32 }
  ),
  blog: shot(
    { dist: 9, lat: 10, lon: 100, roll: -12, shiftX: 0.34, shiftY: -0.28, face: 0, orbits: 0.15, beacon: 0.3 },
    { dist: 11, fov: 40, shiftX: 0.18, shiftY: -0.34 }
  ),
  lost: shot(
    { dist: 30, lat: 40, lon: 200, roll: 30, shiftX: 0.3, shiftY: 0.28, face: 0, orbits: 0, beacon: 0.2, aurora: 0.4 },
    { dist: 34, fov: 40, shiftX: 0.15, shiftY: 0.32 }
  ),
}

/** Where the resume's two scenes out in space are. */
export const PHYSICS_AT: [number, number, number] = [-72, 14, -96]
export const LLM_AT: [number, number, number] = [80, -6, -88]

/**
 * The resume, entry by entry (the scene: key in content/site.md). Places on
 * the planet turn it to face the city; physics and interpretability fly out
 * to their own corners of space. Everything sits right of centre, where the
 * resume's text column is not.
 */
export const SCENES: Record<string, ShotSpec> = {
  istanbul: shot(
    { dist: 5.2, lat: 30, lon: 18, roll: -6, shiftX: 0.33, face: 1, faceOffset: 0, place: 0, orbits: 0.12, beacon: 1 },
    { dist: 6.8, fov: 40, shiftX: 0, shiftY: 0.27 }
  ),
  padova: shot(
    { dist: 4.9, lat: 36, lon: 6, roll: -6, shiftX: 0.33, face: 1, faceOffset: 0, place: 1, orbits: 0.12, beacon: 1 },
    { dist: 6.4, fov: 40, shiftX: 0, shiftY: 0.27 }
  ),
  physics: shot(
    {
      cx: PHYSICS_AT[0], cy: PHYSICS_AT[1] + 0.6, cz: PHYSICS_AT[2],
      dist: 21, lat: 8, lon: -80, roll: -3, fov: 34, shiftX: 0.33,
      face: 0, orbits: 0, beacon: 0, physics: 1,
    },
    { dist: 33, fov: 44, shiftX: 0, shiftY: 0.24 }
  ),
  interpretability: shot(
    {
      cx: LLM_AT[0], cy: LLM_AT[1] + 0.55, cz: LLM_AT[2],
      dist: 14, lat: 10, lon: -84, roll: 0, fov: 34, shiftX: 0.33,
      face: 0, orbits: 0, beacon: 0, llm: 1,
    },
    { dist: 21, fov: 44, shiftX: 0, shiftY: 0.24 }
  ),
}

/**
 * On the resume, the scene is framed into whatever width the text leaves
 * free on the right, measured from the page. The shots above are drawn for
 * a column 440px wide; a narrower one pulls the camera back, a wider one
 * brings it in. Too narrow a column, and the scene sits behind the text,
 * under the page's scrim.
 */
export function frameToColumn(shot: Shot, width: number, textEdge: number) {
  const free = width - textEdge - 16
  if (free < 240) {
    shot.shiftX = 0
    return shot
  }
  shot.shiftX = (textEdge + 16 + free / 2) / width - 0.5
  shot.dist *= Math.min(1.5, Math.max(0.8, 440 / free))
  return shot
}

export type RouteKind = 'home' | 'hidden' | 'resume' | 'about' | 'projects' | 'blog' | 'lost'

export function routeKind(pathname: string): RouteKind {
  // ROUTES must hold a shot for every kind that is not home, hidden or resume.

  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return 'home'
  if (path === '/about' || path === '/tr') return 'about'
  if (path === '/projects') return 'projects'
  if (path === '/resume') return 'resume'
  if (path === '/blog') return 'blog'
  if (path.startsWith('/blog/') || path.startsWith('/lens-test')) return 'hidden'
  return 'lost'
}

export function resolve(spec: ShotSpec, portrait: boolean): Shot {
  return portrait && spec.portrait ? { ...spec, ...spec.portrait } : spec
}

export const SHOT_KEYS = Object.keys(base) as (keyof Shot)[]

export function blend(a: Shot, b: Shot, t: number, out: Shot): Shot {
  for (const k of SHOT_KEYS) out[k] = a[k] + (b[k] - a[k]) * t
  return out
}

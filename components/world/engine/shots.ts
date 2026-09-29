import { ISTANBUL_AT, PADOVA_AT } from './city/common'

// Where the camera stands for each part of the site. A shot is a handful of
// numbers; the director blends between them as the page scrolls or the route
// changes, so moving through the site reads as one flight around Istanbul,
// from dusk over the old city to dawn over Asia.
//
// Units: about ten metres. The city's frame has +x east, +z south, y up,
// and its ground at ISTANBUL_AT. The camera circles a centre: at lon 0 it
// stands east of it looking west, at lon -90 south of it looking north.

export interface Shot {
  /** What the camera looks at, in world space. */
  cx: number
  cy: number
  cz: number
  /** Distance from that centre. */
  dist: number
  /** Camera elevation and azimuth around the centre, in degrees. */
  lat: number
  lon: number
  /** Turns the view off the centre: up, sideways, and around. */
  pitch: number
  yaw: number
  roll: number
  fov: number
  /** Lens shift as a fraction of the viewport; +x moves the scene right, +y up. */
  shiftX: number
  shiftY: number
  /** The hour: a sunset glowing in the west, and a sunrise in the east with the lights going out. */
  dusk: number
  dawn: number
  /** How thick the air is, 1 as usual. Views from high up want less. */
  haze: number
  /** How present the resume's two scenes up in space are, 0..1. */
  physics: number
  llm: number
  /** Opacity of the whole canvas, for pages where text sits over it. */
  canvas: number
}

export type ShotSpec = Shot & { portrait?: Partial<Shot> }

const I = ISTANBUL_AT
const P = PADOVA_AT

/** A point in Istanbul, in the city's own frame. */
const city = (x: number, y: number, z: number) => ({ cx: I.x + x, cy: I.y + y, cz: I.z + z })
/** A point in Padova, in its own frame. */
const padova = (x: number, y: number, z: number) => ({ cx: P.x + x, cy: P.y + y, cz: P.z + z })

const base: Shot = {
  ...city(0, 0, 0),
  dist: 110,
  lat: 4,
  lon: 0,
  pitch: 0,
  yaw: 0,
  roll: 0,
  fov: 40,
  shiftX: 0,
  shiftY: 0,
  dusk: 0,
  dawn: 0,
  haze: 1,
  physics: 0,
  llm: 0,
  canvas: 1,
}

const shot = (s: Partial<Shot>, portrait?: Partial<Shot>): ShotSpec => ({ ...base, ...s, portrait })

// The views, named so pages can share them.
const V = {
  /** From the water off Salacak, west over the old city: Topkapı, Hagia Sophia, the Blue Mosque, Süleymaniye. */
  skyline: { ...city(-34, 8, -8), dist: 120, lat: -1.8, lon: 4, fov: 30 },
  /** Low over the water, north up the Bosphorus to the bridge and its lights. */
  bridge: { ...city(62, 6, -250), dist: 160, lat: -1, lon: -97, fov: 28 },
  /** From the Golden Horn up to Galata, the tower above the roofs. */
  galata: { ...city(-28, 12, -96), dist: 60, lat: -5, lon: -76, fov: 36 },
  /** Close by the Maiden's Tower on its rock, the lamp turning. */
  maiden: { ...city(80, 3.5, 10), dist: 34, lat: 3, lon: 196, fov: 36 },
  /** From the gallery of the Galata Tower, over the Golden Horn to Süleymaniye on its hill. */
  horn: { ...city(-92, 6, -22), dist: 97, lat: 8.3, lon: 45, fov: 40, haze: 0.8 },
  /** From the shore of the Sea of Marmara up to the Blue Mosque's six minarets, Hagia Sophia behind. */
  mosque: { ...city(-30, 9, 12), dist: 80, lat: 1, lon: -76, fov: 34 },
  /** From the mouth of the Golden Horn, east to Üsküdar and Çamlıca as the sun comes up. */
  sunrise: { ...city(150, 10, -40), dist: 150, lat: 1, lon: 178, fov: 34, haze: 0.6 },
}

/** The home page, one shot per section, top to bottom: one night, dusk to dawn. */
export const HOME: Record<string, ShotSpec> = {
  hero: shot({ ...V.skyline, shiftX: 0.2, shiftY: -0.1, dusk: 1 }, { dist: 150, fov: 44, shiftX: 0.06, shiftY: -0.26 }),
  currently: shot({ ...V.bridge, shiftX: -0.2, dusk: 0.3 }, { dist: 120, fov: 50, shiftX: 0, shiftY: 0.26 }),
  about: shot({ ...V.galata, shiftX: 0.2 }, { dist: 74, fov: 50, shiftX: 0, shiftY: 0.26 }),
  resume: shot({ ...V.maiden, shiftX: -0.2 }, { dist: 48, fov: 50, shiftX: 0, shiftY: 0.26 }),
  writing: shot({ ...V.horn, shiftX: 0.2 }, { dist: 112, fov: 48, shiftX: 0, shiftY: 0.26 }),
  contact: shot({ ...V.sunrise, shiftY: -0.3, dawn: 0.8 }, { dist: 170, fov: 52, shiftY: -0.32 }),
}

/** Where the resume's two scenes are: up in space, straight above the city. */
export const PHYSICS_AT: [number, number, number] = [I.x - 320, I.y + 2600, I.z - 900]
export const LLM_AT: [number, number, number] = [I.x + 320, I.y + 2600, I.z - 900]

/**
 * Every other page gets one shot, and blog posts get none: reading wins. The
 * resume has a table of its own, SCENES, below.
 */
export const ROUTES: Record<'about' | 'projects' | 'blog' | 'lost', ShotSpec> = {
  about: shot({ ...V.galata, lon: -64, shiftX: 0.26 }, { dist: 74, fov: 50, shiftX: 0, shiftY: 0.28 }),
  projects: shot({ ...V.bridge, lon: -96, shiftX: 0.26, dusk: 0.3 }, { dist: 120, fov: 50, shiftX: 0, shiftY: 0.28 }),
  blog: shot({ ...V.horn, shiftX: 0.26 }, { dist: 112, fov: 48, shiftX: 0, shiftY: 0.28 }),
  // Lost: adrift in space, a long way out from anything.
  lost: shot(
    {
      cx: PHYSICS_AT[0], cy: PHYSICS_AT[1], cz: PHYSICS_AT[2],
      dist: 150, lat: 30, lon: 160, roll: 24, fov: 36, shiftX: 0.3, shiftY: 0.2, physics: 0.5,
    },
    { dist: 180, fov: 44, shiftX: 0.1, shiftY: 0.3 }
  ),
}

/**
 * The resume, entry by entry (the scene: key in content/site.md). Istanbul
 * and Padova are places on the ground; physics and interpretability are up
 * in space above them. Everything sits right of centre, where the resume's
 * text column is not.
 */
export const SCENES: Record<string, ShotSpec> = {
  istanbul: shot({ ...V.mosque, shiftX: 0.3 }, { dist: 100, fov: 46, shiftX: 0, shiftY: 0.27 }),
  // Prato della Valle from the south: the canal and its statues, Santa
  // Giustina close on the right, the Santo's domes and towers beyond.
  padova: shot(
    { ...padova(0, 2, 0), dist: 115, lat: 26, lon: -96, pitch: 10, fov: 36, shiftX: 0.3 },
    { dist: 140, fov: 48, shiftX: 0, shiftY: 0.27 }
  ),
  physics: shot(
    {
      cx: PHYSICS_AT[0], cy: PHYSICS_AT[1] + 0.6, cz: PHYSICS_AT[2],
      dist: 21, lat: 8, lon: -80, roll: -3, fov: 34, shiftX: 0.33, physics: 1,
    },
    { dist: 33, fov: 44, shiftX: 0, shiftY: 0.24 }
  ),
  interpretability: shot(
    {
      cx: LLM_AT[0], cy: LLM_AT[1] + 0.55, cz: LLM_AT[2],
      dist: 14, lat: 10, lon: -84, fov: 34, shiftX: 0.33, llm: 1,
    },
    { dist: 21, fov: 44, shiftX: 0, shiftY: 0.24 }
  ),
}

/** Where a shot is. Moving between places is a flight up through the cloud and down again. */
export type Place = 'istanbul' | 'padova' | 'space'

export function placeOf(s: Shot): Place {
  if (s.cy - I.y > 1500) return 'space'
  return Math.abs(s.cx - P.x) < 2500 ? 'padova' : 'istanbul'
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

import { BufferAttribute, Vector3, type BufferGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Palette } from '../palette'

// What the city scenes share: where they are, the air between the camera and
// everything (fog), the hour (dusk, night, dawn), and the helpers that turn
// primitive shapes into floodlit landmarks.

/** Istanbul's origin in world space: far below the ride, so the two never meet. */
export const ISTANBUL_AT = new Vector3(0, -10000, 0)
/** Padova sits on the same ground, far to the west. */
export const PADOVA_AT = new Vector3(-6000, -10000, 0)

/**
 * The camera layer for what the water never shows: roofs and the clutter on
 * them, hidden from below by the walls anyway. The main camera sees it; the
 * reflection's does not, and draws the city a little faster for it.
 */
export const ABOVE_ONLY = 1

/** West, where the sun sets over the old city; east, where it rises over Asia. */
export const WEST = new Vector3(-1, 0, 0.12).normalize()
export const EAST = new Vector3(1, 0, -0.18).normalize()

/**
 * Uniforms every city material reads. One object, shared by reference, so a
 * change of hour reaches every building at once. (The water clones its
 * uniforms, so it is updated by hand; see water.ts.)
 */
export function createAtmosphere(palette: Palette) {
  return {
    /** The air at the horizon, away from any glow. */
    uFogColor: { value: new Vector3() },
    uFogDensity: { value: 0.0024 },
    /** 1 while the city's lights are on; falls toward dawn. */
    uLights: { value: 1 },
    /** 0 at night, 1 just after sunset: the glow in the west. */
    uDusk: { value: 0 },
    /** 0 at night, 1 at sunrise: the glow in the east, warm light on everything. */
    uDawn: { value: 0 },
    uTime: { value: 0 },
    uBreath: { value: 0 },
    uSunDir: { value: EAST.clone().setY(0.12).normalize() },
    uWest: { value: WEST },
    uEast: { value: EAST },
    cGlow: { value: palette.dusk },
    cSunset: { value: palette.sun },
    cHaze: { value: palette.city },
  }
}

export type Atmosphere = ReturnType<typeof createAtmosphere>

/**
 * The colour of the air in a direction, at the horizon: the sky's own
 * horizon, so fogged ground and sky meet without a seam. The sky dome uses
 * the same function. Needs the atmosphere's uniforms.
 */
export const airGLSL = /* glsl */ `
  uniform vec3 uFogColor, uWest, uEast, cGlow, cSunset, cHaze;
  uniform float uDusk, uDawn;
  vec3 air(vec3 dir) {
    vec2 flatDir = normalize(dir.xz + vec2(1e-5));
    float west = max(dot(flatDir, uWest.xz), 0.0);
    float east = max(dot(flatDir, uEast.xz), 0.0);
    vec3 c = uFogColor + cHaze * 0.04 * (1.0 - uDawn * 0.7);
    // The glow of a sun just under the horizon takes the place of the blue,
    // gold where the sun is, a warm band a long way round either side.
    c = mix(c, mix(cGlow, cSunset, pow(west, 14.0)), (0.1 + 0.9 * pow(west, 3.0)) * uDusk * 0.72);
    c = mix(c, mix(cGlow, cSunset, pow(east, 12.0)), (0.1 + 0.9 * pow(east, 2.6)) * uDawn * 0.78);
    return c;
  }
`

/** Fog as a GLSL function of a world position; needs the atmosphere's uniforms. */
export const fogGLSL = /* glsl */ `
  ${airGLSL}
  uniform float uFogDensity;
  float fogAmount(float dist) {
    return clamp(1.0 - exp(-pow(dist * uFogDensity, 1.25)), 0.0, 1.0);
  }
  // Ground seen through the haze stays darker than the glow in the sky
  // behind it, so land stands as a silhouette against a sunset. Water
  // mirrors the sky, so it takes the whole glow (fogSky).
  vec3 fog(vec3 col, vec3 posW) {
    vec3 d = posW - cameraPosition;
    float dist = max(length(d), 1e-4);
    return mix(col, mix(uFogColor, air(d / dist), 0.5), fogAmount(dist));
  }
  vec3 fogSky(vec3 col, vec3 posW) {
    vec3 d = posW - cameraPosition;
    float dist = max(length(d), 1e-4);
    return mix(col, air(d / dist), fogAmount(dist));
  }
`

/**
 * Tags a primitive for the landmark shader: aFlood is how strongly
 * floodlights catch it (1 at the foot of a wall, less toward the top), aEmit
 * how much it glows by itself (a minaret's balcony ring, a lit window).
 * flood may be a number or a function of the vertex's height within the part.
 */
export function tag(geometry: BufferGeometry, flood: number | ((t: number) => number), emit = 0): BufferGeometry {
  const g = geometry.index ? geometry.toNonIndexed() : geometry
  g.computeBoundingBox()
  const box = g.boundingBox!
  const pos = g.getAttribute('position')
  const n = pos.count
  const floodArr = new Float32Array(n)
  const emitArr = new Float32Array(n)
  const span = Math.max(1e-4, box.max.y - box.min.y)
  for (let i = 0; i < n; i++) {
    const t = (pos.getY(i) - box.min.y) / span
    floodArr[i] = typeof flood === 'number' ? flood : flood(t)
    emitArr[i] = emit
  }
  g.setAttribute('aFlood', new BufferAttribute(floodArr, 1))
  g.setAttribute('aEmit', new BufferAttribute(emitArr, 1))
  if (!g.getAttribute('normal')) g.computeVertexNormals()
  g.deleteAttribute('uv')
  return g
}

/** Moves a geometry into place: translate, then turn about y. */
export function at(geometry: BufferGeometry, x: number, y: number, z: number, ry = 0): BufferGeometry {
  if (ry) geometry.rotateY(ry)
  geometry.translate(x, y, z)
  return geometry
}

export function merge(parts: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(parts, false)
  if (!merged) throw new Error('city: could not merge landmark parts')
  for (const p of parts) p.dispose()
  return merged
}

/** Deterministic randomness, so the city is the same city on every visit. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ------------------------------------------------------------------ streets

/**
 * The street plan. The city is cut into neighbourhoods (the cells of a
 * jittered grid, each claiming the ground nearest its centre), and each
 * neighbourhood has its own grid of blocks at its own angle, the way a city
 * that grew one quarter at a time does. The buildings stand on the blocks;
 * the terrain lights the streets between them. The GLSL below computes the
 * same plan, so the two agree.
 */
export const DISTRICT = 120
export const BLOCK = 6.5
export const STREET = 0.7

/**
 * An integer hash of a grid cell, 0..1. Written in 32-bit integer steps so
 * the GLSL twin below gets the same answer to the last bit that matters.
 */
function hashCell(x: number, y: number, salt: number) {
  let h = (Math.imul(x | 0, 1597334677) ^ Math.imul(y | 0, 3812015801 | 0) ^ Math.imul(salt, 2654435761 | 0)) >>> 0
  h = (Math.imul(h, 747796405) + 2891336453) >>> 0
  h = Math.imul(((h >>> ((h >>> 28) + 4)) ^ h) >>> 0, 277803737) >>> 0
  h = ((h >>> 22) ^ h) >>> 0
  return h / 4294967295
}

/** The neighbourhood a point is in: its angle and centre. */
export function district(x: number, z: number) {
  const cx = Math.floor(x / DISTRICT)
  const cz = Math.floor(z / DISTRICT)
  let best = Infinity
  let second = Infinity
  let cell = districtCell(cx, cz)
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const c = districtCell(cx + i, cz + j)
      const d = (x - c.ox) ** 2 + (z - c.oz) ** 2
      if (d < best) {
        second = best
        best = d
        cell = c
      } else if (d < second) {
        second = d
      }
    }
  }
  // Roughly how far to the road along the neighbourhood's edge.
  const edge = (Math.sqrt(second) - Math.sqrt(best)) / 2
  return { ...cell, edge }
}

/** One neighbourhood of the jittered grid: its centre and the angle of its streets. */
export function districtCell(gx: number, gz: number) {
  return {
    gx,
    gz,
    ox: (gx + 0.2 + 0.6 * hashCell(gx, gz, 1)) * DISTRICT,
    oz: (gz + 0.2 + 0.6 * hashCell(gx, gz, 2)) * DISTRICT,
    angle: hashCell(gx, gz, 3) * Math.PI * 0.5,
  }
}

/** A point in its neighbourhood's street grid, in blocks. */
export function streetCoords(x: number, z: number) {
  const { angle, ox, oz, edge } = district(x, z)
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const dx = x - ox
  const dz = z - oz
  return { u: (c * dx + s * dz) / BLOCK, v: (-s * dx + c * dz) / BLOCK, angle, edge }
}

export const streetsGLSL = /* glsl */ `
  float hashCell(vec2 g, uint salt) {
    ivec2 i = ivec2(g);
    uint h = (uint(i.x) * 1597334677u) ^ (uint(i.y) * 3812015801u) ^ (salt * 2654435761u);
    h = h * 747796405u + 2891336453u;
    h = ((h >> ((h >> 28u) + 4u)) ^ h) * 277803737u;
    h = (h >> 22u) ^ h;
    return float(h) / 4294967295.0;
  }
  // xy: the point in its neighbourhood's grid, in blocks. z: the
  // neighbourhood's angle. w: roughly how far to the road along its edge.
  vec4 streetCoords(vec2 p) {
    vec2 cell = floor(p / ${DISTRICT.toFixed(1)});
    float best = 1e20;
    float second = 1e20;
    float angle = 0.0;
    vec2 o = vec2(0.0);
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = cell + vec2(float(i), float(j));
        vec2 c = vec2(g.x + 0.2 + 0.6 * hashCell(g, 1u), g.y + 0.2 + 0.6 * hashCell(g, 2u)) * ${DISTRICT.toFixed(1)};
        vec2 d = p - c;
        float dd = dot(d, d);
        if (dd < best) {
          second = best;
          best = dd;
          angle = hashCell(g, 3u) * 1.5707963;
          o = c;
        } else if (dd < second) {
          second = dd;
        }
      }
    }
    vec2 d = p - o;
    float cs = cos(angle);
    float sn = sin(angle);
    return vec4(vec2(cs * d.x + sn * d.y, -sn * d.x + cs * d.y) / ${BLOCK.toFixed(1)}, angle, (sqrt(second) - sqrt(best)) * 0.5);
  }
`

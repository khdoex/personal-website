import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Mesh,
  Points,
  ShaderMaterial,
} from 'three'
import { BLOCK, fogGLSL, rng, STREET, streetsGLSL, type Atmosphere } from './common'
import { parkAmount, type Park } from './trees'
import type { Palette } from '../palette'

// Istanbul's ground, drawn from memory rather than from a survey: the
// historic peninsula with its hills, the Golden Horn, Beyoğlu and Galata to
// the north of it, the Bosphorus between Europe and Asia, the Maiden's Tower
// on its rock. One unit is about ten metres, and distances are pulled in so
// the skyline reads from the water. +x is east, -z is north.

type Poly = [number, number][]

const PENINSULA: Poly = [
  [-1100, -58], [-520, -58], [-380, -62], [-260, -56], [-160, -50], [-90, -44], [-40, -38], [-6, -32],
  [10, -24], [14, -12], [8, 4], [-8, 20], [-40, 36], [-100, 48], [-200, 56], [-320, 60], [-520, 66], [-1100, 80],
]
const BEYOGLU: Poly = [
  [-1100, -84], [-520, -84], [-380, -86], [-260, -82], [-160, -76], [-90, -70], [-40, -64], [0, -60], [22, -66],
  // Karaköy, Beşiktaş, Ortaköy under the first bridge
  [30, -90], [30, -140], [26, -200], [30, -280],
  // Arnavutköy, then the bay at Bebek under Boğaziçi's hill
  [27, -310], [20, -335], [16, -352], [19, -372], [27, -392],
  // Rumelihisarı reaches out into the narrows, under the second bridge
  [36, -420], [38, -440], [34, -462], [30, -500],
  [26, -680], [36, -1100], [-1100, -1100],
]
const ASIA: Poly = [
  [96, 70], [98, 36], [100, 8], [98, -20], [104, -60], [100, -120], [106, -200], [100, -300],
  // Kandilli and Anadoluhisarı, pushing into the narrows from the other side
  [104, -360], [97, -400], [92, -430], [94, -452], [100, -480],
  [102, -520], [106, -680], [96, -1100], [1100, -1100], [1100, 230], [640, 190], [250, 160], [170, 120], [130, 100],
]
export const ISLET = { x: 80, z: 10, r: 3.6 }
/** The Galata Bridge, low across the mouth of the Golden Horn: Eminönü to Karaköy. */
export const GALATA_BRIDGE = { from: [-17, -31] as [number, number], to: [-9, -64] as [number, number], y: 1.6 }
/** The European shore from Karaköy up to the narrows, for the coast road along it. */
export const EUROPEAN_SHORE: Poly = BEYOGLU.slice(8, 22)
/** The Asian shore from Kadıköy up past Anadoluhisarı, for its own coast road. */
export const ASIAN_SHORE: Poly = ASIA.slice(0, 13)

const LANDS = [PENINSULA, BEYOGLU, ASIA]

const HILLS: [number, number, number, number][] = [
  // x, z, height, spread
  [-8, -8, 3, 18], // Topkapı
  [-35, 10, 4.2, 26], // Sultanahmet
  [-95, -22, 7, 30], // Süleymaniye
  [-190, -5, 9.5, 55], // Fatih
  [-30, -95, 6, 26], // Galata
  [-40, -175, 13, 60], // Taksim
  [-20, -340, 15, 85], // up the European shore
  [-6, -396, 7, 30], // Boğaziçi's hill over Bebek
  [-95, -390, 5, 90], // the Levent plateau
  [150, -20, 7, 40], // Üsküdar
  [240, -110, 21, 55], // Çamlıca
  [210, -320, 13, 90],
  [-500, -300, 18, 200],
  [500, -250, 16, 220],
]

function segDist(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax
  const dz = bz - az
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)))
  const qx = ax + dx * t - px
  const qz = az + dz * t - pz
  return Math.sqrt(qx * qx + qz * qz)
}

/** Signed distance to a polygon's edge: positive inside, negative outside. */
function polySdf(poly: Poly, x: number, z: number) {
  let d = Infinity
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[j]
    const [bx, bz] = poly[i]
    d = Math.min(d, segDist(x, z, ax, az, bx, bz))
    if (bz > z !== az > z && x < ((ax - bx) * (z - bz)) / (az - bz) + bx) inside = !inside
  }
  return inside ? d : -d
}

/** How far inside land a point is (negative: that far out to sea). */
export function landSdf(x: number, z: number) {
  let d = ISLET.r - Math.hypot(x - ISLET.x, z - ISLET.z)
  for (const poly of LANDS) d = Math.max(d, polySdf(poly, x, z))
  return d
}

function hills(x: number, z: number) {
  let h = 0
  for (const [hx, hz, height, spread] of HILLS) {
    const d2 = ((x - hx) ** 2 + (z - hz) ** 2) / (spread * spread)
    h += height * Math.exp(-d2)
  }
  return h
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/** Ground height at a point: the sea floor under water, hills on land. */
export function heightAt(x: number, z: number) {
  const d = landSdf(x, z)
  const ripple = Math.sin(x * 0.11) * Math.cos(z * 0.13) * 0.8 + Math.sin(x * 0.037 + z * 0.05) * 1.2
  const land = 1.1 + (hills(x, z) + ripple * 0.6) * smooth(0, 22, d)
  return -4 + (land + 4) * smooth(-1.2, 3, d)
}

// Vertex spacing is dense around the Bosphorus mouth, where the camera
// looks, and loose at the edges, where fog has the last word.
function warp(u: number, lo: number, hi: number, center: number, k: number) {
  const s = Math.sinh(k * (u - 0.5)) / Math.sinh(k / 2)
  return s < 0 ? center + s * (center - lo) : center + s * (hi - center)
}

/**
 * Night ground: dark, a shade lighter up the hills, its streets lit. Land is
 * whatever stands more than a metre or so above the water.
 */
export function createGroundMaterial(palette: Palette, atmos: Atmosphere, streets = true) {
  return new ShaderMaterial({
    defines: { STREETS: streets ? 1 : 0 },
    uniforms: {
      ...atmos,
      cLow: { value: palette.oceanDeep },
      cHigh: { value: palette.forest },
      cWarm: { value: palette.city },
      cRim: { value: palette.atmosphere },
    },
    vertexShader: /* glsl */ `
      // Optional, for open ground: aPlaza turns the street grid off for a
      // paved square, aPark for woods, and aGlow is lamplight pooled on the
      // paving. Ground without them reads 0.
      attribute float aPlaza;
      attribute float aPark;
      attribute float aGlow;
      varying vec3 vPosW;
      varying vec3 vLocal;
      varying vec3 vN;
      varying float vPlaza;
      varying float vPark;
      varying float vGlow;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        vLocal = position;
        vPlaza = aPlaza;
        vPark = aPark;
        vGlow = aGlow;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogGLSL}
      ${streetsGLSL}
      uniform float uLights;
      uniform vec3 uSunDir;
      uniform vec3 cLow, cHigh, cWarm, cRim;
      varying vec3 vPosW;
      varying vec3 vLocal;
      varying vec3 vN;
      varying float vPlaza;
      varying float vPark;
      varying float vGlow;
      void main() {
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vPosW);
        float h = vLocal.y;
        // Night ground: a dark blue-green, a shade lighter up the hills.
        vec3 col = mix(cLow * 0.85, mix(cLow, cHigh, 0.3) * 0.65, smoothstep(0.0, 18.0, h));
        // Streets, lit: the neighbourhood grids the buildings stand in, and
        // the wider roads where neighbourhoods meet.
        // Where a street is thinner than a pixel, draw what it adds up to.
        float lamps = ${((2 * STREET) / BLOCK * 0.55 * 2.2).toFixed(3)} + 0.03;
        #if STREETS
        vec4 sc = streetCoords(vLocal.xz);
        vec2 fu = fract(sc.xy);
        vec2 dd = min(fu, 1.0 - fu) * ${BLOCK.toFixed(1)};
        float px = max(length(fwidth(vLocal.xz)), 1e-4);
        float street = 1.0 - smoothstep(${(STREET / 2).toFixed(2)} - px, ${(STREET / 2).toFixed(2)} + px, min(dd.x, dd.y));
        float road = 1.0 - smoothstep(0.55 - px, 0.55 + px, sc.w);
        // Pools of light under the lamps, a lamp every few metres down each
        // street, rather than a street lit evenly end to end.
        float along = (dd.x < dd.y ? sc.y : sc.x) * ${BLOCK.toFixed(1)};
        float pools = 0.3 + 0.7 * pow(0.5 + 0.5 * cos(along * 2.1), 3.0);
        float fine = smoothstep(0.4, 1.4, px / ${STREET.toFixed(2)});
        lamps = mix(max(street * pools, road * (0.5 + 0.5 * pools)) * 0.6, lamps, fine);
        #endif
        #if STREETS
        // Gardens, courtyards and bare lots between the blocks: patches a
        // shade greener or darker, so the ground is never one flat colour.
        vec2 gp = vLocal.xz * 0.21;
        vec2 gi = floor(gp);
        vec2 gf = fract(gp);
        gf = gf * gf * (3.0 - 2.0 * gf);
        float g00 = hashCell(gi, 11u), g10 = hashCell(gi + vec2(1.0, 0.0), 11u);
        float g01 = hashCell(gi + vec2(0.0, 1.0), 11u), g11 = hashCell(gi + vec2(1.0, 1.0), 11u);
        float patchy = mix(mix(g00, g10, gf.x), mix(g01, g11, gf.x), gf.y);
        float land = smoothstep(0.8, 2.0, h);
        col = mix(col, mix(cLow, cHigh, 0.5) * 0.5, smoothstep(0.62, 0.9, patchy) * 0.55 * land);
        col *= 1.0 - 0.18 * smoothstep(0.45, 0.1, patchy) * land;
        #endif
        // Only on dry ground, and thinning out up the steepest slopes.
        float dry = smoothstep(0.6, 1.6, h) * smoothstep(0.55, 0.85, N.y);
        col += cWarm * lamps * dry * (1.0 - max(vPlaza, vPark)) * uLights * 0.32;
        // Under the trees the ground is darker and greener.
        col = mix(col, mix(cLow, cHigh, 0.45) * 0.45, vPark * 0.75);
        col += cWarm * vGlow * uLights * 0.3;
        // The glow the lit streets throw back into the air above them.
        col += cWarm * 0.02 * dry * uLights;
        col += cRim * pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.04;
        col += cWarm * max(dot(N, uSunDir), 0.0) * uDawn * 0.22;
        gl_FragColor = vec4(fog(col, vPosW), 1.0);
      }
    `,
  })
}

export function createTerrain(palette: Palette, atmos: Atmosphere, detail: number, streets = true, parks: Park[] = []) {
  const nx = Math.round(360 * detail)
  const nz = Math.round(310 * detail)
  const positions = new Float32Array((nx + 1) * (nz + 1) * 3)
  const park = new Float32Array((nx + 1) * (nz + 1))
  const indices: number[] = []
  for (let j = 0; j <= nz; j++) {
    const z = warp(j / nz, -1100, 520, -60, 3.2)
    for (let i = 0; i <= nx; i++) {
      const x = warp(i / nx, -1100, 1100, 40, 3.4)
      positions.set([x, heightAt(x, z), z], (j * (nx + 1) + i) * 3)
      park[j * (nx + 1) + i] = parkAmount(parks, x, z)
    }
  }
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i
      const b = a + 1
      const c = a + nx + 1
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('aPark', new BufferAttribute(park, 1))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  const material = createGroundMaterial(palette, atmos, streets)
  const mesh = new Mesh(geometry, material)
  mesh.frustumCulled = false

  // Lamps along every shore: the necklace of light the Bosphorus is known
  // for at night, and the first thing its water reflects.
  const random = rng(7)
  const lamps: number[] = []
  const lampSeed: number[] = []
  for (const poly of [...LANDS]) {
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [ax, az] = poly[j]
      const [bx, bz] = poly[i]
      const len = Math.hypot(bx - ax, bz - az)
      for (let s = 0; s < len; s += 2.4) {
        const t = s / len
        const x = ax + (bx - ax) * t
        const z = az + (bz - az) * t
        // Only where the camera can see a shore.
        if (x < -300 || x > 330 || z < -580 || z > 110) continue
        const dx = (bz - az) / len
        const dz = -(bx - ax) / len
        const inset = 1.2 + random() * 0.6
        lamps.push(x + dx * inset, 0.9 + random() * 0.5, z + dz * inset)
        lampSeed.push(random())
      }
    }
  }
  // And along both rails of the Galata Bridge.
  {
    const [ax, az] = GALATA_BRIDGE.from
    const [bx, bz] = GALATA_BRIDGE.to
    const len = Math.hypot(bx - ax, bz - az)
    const ux = (bx - ax) / len
    const uz = (bz - az) / len
    for (let t = 0.8; t < len; t += 1.8) {
      for (const side of [-1.1, 1.1]) {
        lamps.push(ax + ux * t - uz * side, GALATA_BRIDGE.y + 0.85, az + uz * t + ux * side)
        lampSeed.push(random())
      }
    }
  }
  const lampGeometry = new BufferGeometry()
  lampGeometry.setAttribute('position', new BufferAttribute(new Float32Array(lamps), 3))
  lampGeometry.setAttribute('aSeed', new BufferAttribute(new Float32Array(lampSeed), 1))
  const lampMaterial = new ShaderMaterial({
    uniforms: { ...atmos, uPixelRatio: { value: 1 }, cLamp: { value: palette.city } },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uPixelRatio, uTime;
      varying float vSeed;
      varying float vDist;
      void main() {
        vSeed = aSeed;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vDist = length(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
        gl_PointSize = clamp(90.0 / vDist, 1.2, 4.5) * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogGLSL}
      uniform float uLights, uTime, uBreath;
      uniform vec3 cLamp;
      varying float vSeed;
      varying float vDist;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float glow = exp(-r * r * 5.0);
        float flicker = 0.85 + 0.15 * sin(uTime * (1.0 + vSeed * 3.0) + vSeed * 50.0);
        vec3 col = cLamp * glow * flicker * uLights * (1.1 + 0.18 * uBreath);
        gl_FragColor = vec4(col * (1.0 - fogAmount(vDist) * 0.85), 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const shore = new Points(lampGeometry, lampMaterial)
  shore.frustumCulled = false

  return {
    mesh,
    shore,
    materials: [material, lampMaterial],
    dispose() {
      geometry.dispose()
      material.dispose()
      lampGeometry.dispose()
      lampMaterial.dispose()
    },
  }
}

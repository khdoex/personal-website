import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  PlaneGeometry,
  Points,
  Quaternion,
  ShaderMaterial,
  Vector3,
  BoxGeometry,
  Color,
  CylinderGeometry,
} from 'three'
import { at, fogGLSL, merge, rng, tag, type Atmosphere } from './common'
import type { Palette } from '../palette'

// What moves on and over the water: ferries crossing between the
// continents, tankers working up and down the strait, a tour boat strung
// with lights, motorboats cutting across, fishing boats and sailboats riding
// at anchor, their wakes, and gulls. Everything afloat rolls with the waves
// and carries its lights: red to port, green to starboard, white on the
// mast. The boats borrow the monuments' material, so their windows are lit
// the same gold.

type Route = { from: [number, number]; to: [number, number]; period: number; phase: number }

export const ROUTES: Route[] = [
  { from: [-8, -54], to: [97, -28], period: 70, phase: 0.1 }, // Karaköy - Üsküdar
  { from: [-46, -36], to: [99, 36], period: 84, phase: 0.55 }, // Eminönü - Kadıköy
  { from: [24, -150], to: [99, -120], period: 58, phase: 0.3 }, // Beşiktaş - Üsküdar
]

/** Motorboats, fast across the strait and back. */
const DASHES: Route[] = [
  { from: [24, -362], to: [94, -388], period: 44, phase: 0.2 }, // Bebek - Kandilli
  { from: [30, -232], to: [99, -258], period: 52, phase: 0.7 }, // Ortaköy - Beylerbeyi
]

/** A light on a vessel: x, y, z in its own frame, and what it is (see LIGHT_COLOURS). */
type Light = [number, number, number, number]

/** Half a cylinder closing one end of a hull: +1 the bow (toward +x), -1 the stern. */
const hullEnd = (r: number, h: number, x: number, y: number, end: 1 | -1) =>
  new CylinderGeometry(r, r, h, 12, 1, false, end > 0 ? 0 : Math.PI, Math.PI).translate(x, y, 0)

function ferryGeometry(): BufferGeometry {
  const parts: BufferGeometry[] = [
    // The hull, rounded at both ends the way the city's ferries are.
    tag(new BoxGeometry(6.2, 1.1, 2.1).translate(0, 0.35, 0), 0.12),
    tag(hullEnd(1.05, 1.1, 3.1, 0.35, 1), 0.12),
    tag(hullEnd(1.05, 1.1, -3.1, 0.35, -1), 0.12),
    tag(at(new BoxGeometry(5.6, 0.9, 1.9), -0.3, 1.35, 0), 0.35),
    tag(at(new BoxGeometry(5.9, 0.08, 2.05), -0.3, 1.8, 0), 0.5),
    tag(at(new BoxGeometry(1.6, 0.7, 1.6), 1.4, 2.15, 0), 0.4),
    tag(at(new CylinderGeometry(0.28, 0.32, 1.1, 8), -1.2, 2.3, 0), 0.3),
    tag(at(new CylinderGeometry(0.3, 0.3, 0.16, 8), -1.2, 3.12, 0), 0.6),
    tag(at(new CylinderGeometry(0.05, 0.05, 1.4, 4), 1.9, 2.6, 0), 0.2),
  ]
  // Two rows of cabin windows down each side, lit.
  for (let k = 0; k < 9; k++) {
    for (const z of [-0.97, 0.97]) {
      parts.push(tag(new BoxGeometry(0.34, 0.34, 0.05).translate(-2.8 + k * 0.62, 1.4, z), 0.2, 1))
      if (k > 1 && k < 8) parts.push(tag(new BoxGeometry(0.3, 0.26, 0.05).translate(-2.6 + k * 0.62, 0.62, z * 1.08), 0.15, 0.7))
    }
  }
  return merge(parts)
}
const FERRY_LIGHTS: Light[] = [
  [1.9, 3.4, 0, 2],
  [2.5, 1.95, -1.05, 0],
  [2.5, 1.95, 1.05, 1],
  [-3.9, 1.3, 0, 2],
]

/** The middle of the strait, south to north: the tankers' lane. */
const LANE: [number, number][] = [
  [58, 120], [62, 20], [64, -100], [66, -250], [62, -330], [64, -400], [66, -452], [68, -560], [70, -760],
]

function tankerGeometry(): BufferGeometry {
  const parts: BufferGeometry[] = [
    // hull and deck, long and low, the bow rounded
    tag(new BoxGeometry(17, 1.3, 2.7).translate(0, 0.2, 0), 0.1),
    tag(hullEnd(1.35, 1.3, 8.5, 0.2, 1), 0.1),
    tag(at(new BoxGeometry(12, 0.25, 2.3), 1, 0.95, 0), 0.18),
    // pipes down the deck, and the manifold amidships
    tag(at(new BoxGeometry(11, 0.1, 0.1), 1, 1.2, -0.4), 0.3),
    tag(at(new BoxGeometry(11, 0.1, 0.1), 1, 1.2, 0.4), 0.3),
    tag(at(new BoxGeometry(0.6, 0.4, 1.8), 0.5, 1.1, 0), 0.3),
    // the bridge at the stern, its funnel, the mast forward
    tag(at(new BoxGeometry(2.8, 2.6, 2.5), -6.6, 0.9, 0), (t) => 0.45 - 0.2 * t),
    tag(at(new BoxGeometry(1.2, 0.5, 2.9), -6.6, 3.5, 0), 0.3),
    tag(at(new CylinderGeometry(0.4, 0.45, 1.6, 8), -7.6, 3.6, 0), 0.25),
    tag(at(new CylinderGeometry(0.05, 0.05, 2.6, 4), 6.8, 1, 0), 0.2),
  ]
  // Bridge windows, and a string of deck lights down the length.
  for (let k = 0; k < 5; k++) {
    for (const z of [-1.26, 1.26]) parts.push(tag(new BoxGeometry(0.34, 0.3, 0.05).translate(-7.6 + k * 0.5, 2.9, z), 0.2, 0.95))
  }
  for (let k = 0; k < 10; k++) parts.push(tag(new BoxGeometry(0.1, 0.1, 0.1).translate(-4 + k * 1.2, 1.35, 0), 0, 0.9))
  return merge(parts)
}
const TANKER_LIGHTS: Light[] = [
  [6.8, 3.7, 0, 2],
  [-6.6, 4.4, 0, 2],
  [-6.2, 3.6, -1.46, 0],
  [-6.2, 3.6, 1.46, 1],
  [-8.6, 1.2, 0, 2],
]

function boatGeometry(): BufferGeometry {
  return merge([
    tag(new BoxGeometry(1.7, 0.5, 0.9).translate(0, 0.1, 0), 0.15),
    tag(hullEnd(0.45, 0.5, 0.85, 0.1, 1), 0.15),
    tag(at(new BoxGeometry(0.7, 0.5, 0.7), -0.3, 0.35, 0), 0.3),
    tag(at(new CylinderGeometry(0.03, 0.03, 1, 4), 0.5, 0.35, 0), 0.2),
  ])
}
const BOAT_LIGHTS: Light[] = [
  [0.5, 1.4, 0, 3],
  [-0.3, 0.75, 0.37, 3],
]

function tourGeometry(): BufferGeometry {
  const parts: BufferGeometry[] = [
    tag(new BoxGeometry(5, 0.8, 1.8).translate(0, 0.2, 0), 0.12),
    tag(hullEnd(0.9, 0.8, 2.5, 0.2, 1), 0.12),
    tag(at(new BoxGeometry(4.2, 0.75, 1.6), -0.3, 0.6, 0), 0.35),
    tag(at(new BoxGeometry(4.4, 0.06, 1.7), -0.3, 1.35, 0), 0.5),
    tag(at(new CylinderGeometry(0.04, 0.04, 1.6, 4), 1.2, 1.4, 0), 0.2),
  ]
  for (let k = 0; k < 8; k++) {
    for (const z of [-0.81, 0.81]) parts.push(tag(new BoxGeometry(0.34, 0.36, 0.05).translate(-2.1 + k * 0.52, 0.98, z), 0.2, 1.1))
  }
  return merge(parts)
}
/** Strings of coloured bulbs from the mast down to the bow and the stern, and the usual lights. */
function tourLights(): Light[] {
  const out: Light[] = [[2.8, 1, -0.6, 0], [2.8, 1, 0.6, 1]]
  const top: [number, number] = [1.2, 3]
  for (const [ex, ey] of [[3.4, 0.95], [-2.6, 1.4]] as const) {
    const n = 12
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1)
      const x = top[0] + (ex - top[0]) * t
      const y = top[1] + (ey - top[1]) * t - Math.sin(Math.PI * t) * 0.35
      out.push([x, y, 0, 4 + (i % 3)])
    }
  }
  return out
}

function speedboatGeometry(): BufferGeometry {
  return merge([
    tag(new BoxGeometry(1.4, 0.34, 0.62).translate(0, 0.05, 0), 0.2),
    tag(hullEnd(0.31, 0.34, 0.7, 0.05, 1), 0.2),
    tag(at(new BoxGeometry(0.5, 0.26, 0.56), -0.1, 0.22, 0), 0.35),
  ])
}
const SPEED_LIGHTS: Light[] = [
  [0.9, 0.3, -0.25, 0],
  [0.9, 0.3, 0.25, 1],
  [-0.2, 0.62, 0, 2],
]

function sailboatGeometry(): BufferGeometry {
  return merge([
    tag(new BoxGeometry(1.5, 0.36, 0.55).translate(0, 0.05, 0), 0.25),
    tag(hullEnd(0.275, 0.36, 0.75, 0.05, 1), 0.25),
    tag(at(new CylinderGeometry(0.02, 0.025, 2.6, 4), 0.1, 0.2, 0), 0.35),
    tag(at(new BoxGeometry(0.04, 0.04, 1.2), 0, 0.5, 0).rotateY(Math.PI / 2), 0.3),
  ])
}
const SAIL_LIGHTS: Light[] = [[0.1, 2.85, 0, 2]]

/** Where along a polyline, and which way it points, a distance s along it. */
function alongLane(points: [number, number][], s: number) {
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i]
    const [bx, bz] = points[i + 1]
    const len = Math.hypot(bx - ax, bz - az)
    if (s <= len || i === points.length - 2) {
      const t = Math.min(1, s / len)
      return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, heading: Math.atan2(-(bz - az), bx - ax) }
    }
    s -= len
  }
  return { x: points[0][0], z: points[0][1], heading: 0 }
}

const laneLength = LANE.slice(1).reduce((sum, [x, z], i) => sum + Math.hypot(x - LANE[i][0], z - LANE[i][1]), 0)

/** Rolls, pitches and lifts a floating thing a little, each on its own clock. */
function float(holder: Group, time: number, seed: number, size = 1) {
  holder.rotation.x = Math.sin(time * 0.9 + seed * 7) * 0.035 / size
  holder.rotation.z = Math.sin(time * 0.7 + seed * 3) * 0.02 / size
  holder.position.y = Math.sin(time * 1.1 + seed * 5) * 0.08
}

/** Out and back along a route, slowing into each end: where, and which way it faces. */
function shuttle(route: Route, time: number) {
  const u = ((time / route.period + route.phase) % 1) * 2
  const outbound = u < 1
  const t = outbound ? u : 2 - u
  const e = 0.5 - 0.5 * Math.cos(Math.PI * t)
  const [ax, az] = route.from
  const [bx, bz] = route.to
  return {
    x: ax + (bx - ax) * e,
    z: az + (bz - az) * e,
    heading: Math.atan2(-(bz - az), bx - ax) + (outbound ? 0 : Math.PI),
    moving: Math.sin(Math.PI * t),
  }
}

/** lite: the ferries, the tankers, the tour boat and a few fishing boats, and nothing more. */
export function createLife(palette: Palette, atmos: Atmosphere, landmarkMaterial: ShaderMaterial, gullCount: number, lite = false) {
  const group = new Group()

  // ------------------------------------------------------------ the lights
  const lightMaterial = new ShaderMaterial({
    uniforms: {
      ...atmos,
      uPixelRatio: { value: 1 },
      cRed: { value: new Color(1, 0.3, 0.24) },
      cGreen: { value: palette.accent },
      cWhite: { value: palette.heading },
      cGold: { value: palette.city },
      cSun: { value: palette.sun },
      cSky: { value: palette.sky },
    },
    vertexShader: /* glsl */ `
      attribute float aKind;
      uniform float uPixelRatio;
      varying float vKind;
      varying float vDist;
      void main() {
        vKind = aKind;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vDist = length(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
        gl_PointSize = clamp((aKind > 3.5 ? 220.0 : 380.0) / vDist, 3.0, 7.0) * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uFogDensity, uTime;
      uniform vec3 cRed, cGreen, cWhite, cGold, cSun, cSky;
      varying float vKind;
      varying float vDist;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        int k = int(vKind + 0.5);
        vec3 col = k == 0 ? cRed : k == 1 ? cGreen : k == 2 ? cWhite : k == 3 ? cGold : k == 4 ? cSun : k == 5 ? cGreen : cSky;
        // The tour boat's bulbs shimmer a little.
        float twinkle = k > 3 ? 0.75 + 0.25 * sin(uTime * 3.0 + vKind * 2.1 + gl_FragCoord.x * 0.05) : 1.0;
        float f = 1.0 - exp(-pow(vDist * uFogDensity, 1.25));
        gl_FragColor = vec4(col * (exp(-r * r * 6.0) * 1.0 + exp(-r * r * 24.0) * 1.8) * twinkle * (1.0 - 0.7 * f), 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const lightGeometries: BufferGeometry[] = []
  /** A vessel's lights, to ride in its rolling frame. */
  const lights = (list: Light[]) => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(list.flatMap(([x, y, z]) => [x, y, z])), 3))
    g.setAttribute('aKind', new BufferAttribute(new Float32Array(list.map((l) => l[3])), 1))
    lightGeometries.push(g)
    const p = new Points(g, lightMaterial)
    p.frustumCulled = false
    return p
  }
  const ferryLights = lights(FERRY_LIGHTS)
  const tankerLights = lights(TANKER_LIGHTS)
  const boatLights = lights(BOAT_LIGHTS)
  const tourLightList = lights(tourLights())
  const speedLights = lights(SPEED_LIGHTS)
  const sailLights = lights(SAIL_LIGHTS)

  // ---------------------------------------------------------------- wakes
  const wakeMaterial = new ShaderMaterial({
    uniforms: { ...atmos, cFoam: { value: palette.heading } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vPosW;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uFogDensity;
      uniform vec3 cFoam;
      varying vec2 vUv;
      varying vec3 vPosW;
      void main() {
        // uv.x: across the wake, uv.y: 0 at the stern, 1 far behind.
        float spread = 0.08 + vUv.y * 0.42;
        float x = abs(vUv.x - 0.5);
        float arms = exp(-pow((x - spread) / 0.035, 2.0)) + exp(-pow(x / (0.06 + vUv.y * 0.08), 2.0)) * 0.6;
        float churn = 0.6 + 0.4 * sin(vUv.y * 40.0 - uTime * 3.0 + vUv.x * 20.0);
        float fade = pow(1.0 - vUv.y, 1.6);
        float f = 1.0 - exp(-pow(length(cameraPosition - vPosW) * uFogDensity, 1.25));
        gl_FragColor = vec4(cFoam * arms * churn * fade * 0.16 * (1.0 - f), 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  })
  const wakeGeometries: BufferGeometry[] = []
  const wake = (width: number, length: number, behind: number) => {
    const g = new PlaneGeometry(width, length).rotateX(-Math.PI / 2).rotateY(Math.PI / 2).translate(-behind - length / 2, 0.05, 0)
    wakeGeometries.push(g)
    return new Mesh(g, wakeMaterial)
  }

  // Each vessel sits in a holder that its course moves and turns; the hull
  // inside rolls on the waves with its lights, the wake stays flat on the water.
  const vessel = (geometry: BufferGeometry, light: Points, wakeMesh?: Mesh) => {
    const holder = new Group()
    const rolling = new Group()
    rolling.add(new Mesh(geometry, landmarkMaterial), light.clone())
    holder.add(rolling)
    if (wakeMesh) holder.add(wakeMesh)
    group.add(holder)
    return { holder, rolling, wake: wakeMesh }
  }

  // ---------------------------------------------------------------- ferries
  const ferryGeo = ferryGeometry()
  const ferries = ROUTES.map(() => vessel(ferryGeo, ferryLights, wake(9, 26, 3.5)))

  // Two tankers in the strait, one each way, slow enough to take the length
  // of a long read to pass.
  const tankerGeo = tankerGeometry()
  const tankers = [0.15, 0.62].map((phase, i) => ({ ...vessel(tankerGeo, tankerLights, wake(12, 40, 8)), phase, dir: i === 0 ? 1 : -1 }))

  // A tour boat strung with lights, slowly up the European shore and back.
  const tourGeo = tourGeometry()
  const tour = vessel(tourGeo, tourLightList, wake(6, 16, 2.4))
  const TOUR: [number, number][] = [[40, -236], [36, -290], [30, -340], [34, -392], [44, -424]]
  const tourLength = TOUR.slice(1).reduce((sum, [x, z], i) => sum + Math.hypot(x - TOUR[i][0], z - TOUR[i][1]), 0)

  // Motorboats, quick across and back, a long white wake behind.
  const speedGeo = speedboatGeometry()
  const dashes = lite ? [] : DASHES
  const speedboats = dashes.map(() => vessel(speedGeo, speedLights, wake(4, 22, 0.8)))

  // Fishing boats at anchor off the shores, each with its lamp.
  const boatGeo = boatGeometry()
  const moorings: [number, number, number][] = [
    [37, -344, 0.4], [38, -368, 2.1], [30, -300, 1.2], [94, -150, 2.8], [92, -60, 0.9], [46, 58, 1.7], [-12, 30, 3], [18, -120, 0.2],
    [92, -172, 1.1], [95, -333, 2.4], [27, -318, 0.7], [36, -522, 1.9], [96, -505, 0.3], [101, 22, 2.6], [22, -82, 1.4], [-60, -48, 0.8],
  ]
  const boats = moorings.slice(0, lite ? 8 : undefined).map(([x, z, heading], i) => {
    const v = vessel(boatGeo, boatLights)
    v.holder.position.set(x, 0, z)
    v.holder.rotation.y = heading
    return { ...v, x, z, seed: i * 1.37 }
  })

  // Sailboats moored in Bebek bay, an anchor light at the top of each mast.
  const sailGeo = sailboatGeometry()
  const moored = lite ? [] : [[24, -346], [26.5, -352], [23.5, -358], [27, -361], [25, -366], [28.5, -356]]
  const sails = moored.map(([x, z], i) => {
    const v = vessel(sailGeo, sailLights)
    v.holder.position.set(x, 0, z)
    v.holder.rotation.y = 1.2 + i * 0.3
    return { ...v, x, z, seed: 3 + i * 0.91 }
  })

  // ------------------------------------------------------------------ gulls
  // A body and two wings, hinged at the body; the vertex shader flaps them.
  // It flies toward +z, the outer wing swept back the way a gull's is.
  const half = (sx: number) => [
    0, 0, 0.1, sx * 0.5, 0.04, 0.04, 0, 0, -0.1,
    sx * 0.5, 0.04, 0.04, sx * 0.45, 0.03, -0.1, 0, 0, -0.1,
    sx * 0.5, 0.04, 0.04, sx * 0.95, 0.02, -0.12, sx * 0.45, 0.03, -0.1,
  ]
  const wing: number[] = [
    ...half(-1),
    ...half(1),
    // the body, head forward, and the fan of the tail
    0, 0.01, 0.24, 0.05, 0, 0.05, -0.05, 0, 0.05,
    0.05, 0, 0.05, 0.04, 0, -0.18, -0.05, 0, 0.05,
    -0.05, 0, 0.05, 0.04, 0, -0.18, -0.04, 0, -0.18,
    0.04, 0, -0.18, 0.08, 0, -0.3, -0.08, 0, -0.3,
    0.04, 0, -0.18, -0.08, 0, -0.3, -0.04, 0, -0.18,
  ]
  const gullGeo = new BufferGeometry()
  gullGeo.setAttribute('position', new BufferAttribute(new Float32Array(wing), 3))
  const gullMaterial = new ShaderMaterial({
    uniforms: { ...atmos, cGull: { value: palette.heading }, cWarm: { value: palette.city } },
    vertexShader: /* glsl */ `
      attribute float aPhase;
      uniform float uTime;
      varying vec3 vPosW;
      void main() {
        vec3 p = position;
        float flap = sin(uTime * 5.5 + aPhase * 6.28) * 0.55 + 0.15;
        // The outer wing bends further than the inner.
        p.y += abs(p.x) * flap * (1.0 + 0.4 * smoothstep(0.5, 0.95, abs(p.x)));
        vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogGLSL}
      uniform float uLights;
      uniform vec3 cGull, cWarm;
      varying vec3 vPosW;
      void main() {
        // Lit from below by the city.
        vec3 col = mix(cGull * 0.35, cWarm * 0.55, 0.4 * uLights);
        gl_FragColor = vec4(fog(col, vPosW), 1.0);
      }
    `,
    side: DoubleSide,
  })
  const gulls = new InstancedMesh(gullGeo, gullMaterial, gullCount)
  const random = rng(5)
  const flocks: [number, number, number][] = [
    [80, 10, 7], // over the Maiden's Tower
    [-28, -96, 16], // round Galata
    [20, -40, 9], // the Golden Horn mouth
    [-30, 5, 22], // over Sultanahmet
    [60, -250, 12], // under the bridge
    [30, -370, 10], // off Bebek
  ]
  const birds = Array.from({ length: gullCount }, (_, i) => {
    const [cx, cz, cy] = flocks[i % flocks.length]
    return {
      cx: cx + (random() - 0.5) * 16,
      cz: cz + (random() - 0.5) * 16,
      cy: cy + random() * 8,
      r: 6 + random() * 14,
      speed: (0.12 + random() * 0.12) * (random() < 0.5 ? -1 : 1),
      phase: random() * Math.PI * 2,
      bob: random() * 10,
    }
  })
  gullGeo.setAttribute('aPhase', new InstancedBufferAttribute(new Float32Array(birds.map((b) => b.phase)), 1))
  gulls.frustumCulled = false
  group.add(gulls)

  const m = new Matrix4()
  const q = new Quaternion()
  const up = new Vector3(0, 1, 0)
  const p = new Vector3()
  const s = new Vector3(1, 1, 1)
  // The boats that only rock where they lie, gathered once rather than every frame.
  const rocking = [boats, sails]

  return {
    group,
    materials: [wakeMaterial, gullMaterial, lightMaterial],
    /** The vessels' lights, which need the pixel ratio. */
    lightMaterial,
    update(time: number) {
      ROUTES.forEach((route, i) => {
        const at = shuttle(route, time)
        const { holder, rolling, wake: w } = ferries[i]
        holder.position.set(at.x, 0, at.z)
        holder.rotation.y = at.heading
        if (w) w.visible = at.moving > 0.25
        float(rolling, time, i)
      })
      dashes.forEach((route, i) => {
        const at = shuttle(route, time)
        const { holder, rolling, wake: w } = speedboats[i]
        holder.position.set(at.x, 0, at.z)
        holder.rotation.y = at.heading
        if (w) w.visible = at.moving > 0.2
        float(rolling, time * 1.6, 7 + i, 0.5)
        // Bow up when it runs.
        rolling.rotation.z += 0.06 * at.moving
      })
      for (const tanker of tankers) {
        const u = (((time / 900 + tanker.phase) % 1) + 1) % 1
        const d = (tanker.dir > 0 ? u : 1 - u) * laneLength
        const at = alongLane(LANE, d)
        // Keep to the right-hand side of the lane, as ships in the strait do.
        const side = 5 * tanker.dir
        tanker.holder.position.set(at.x + Math.sin(at.heading) * side, 0, at.z + Math.cos(at.heading) * side)
        tanker.holder.rotation.y = at.heading + (tanker.dir > 0 ? 0 : Math.PI)
        float(tanker.rolling, time, tanker.phase * 10, 3)
      }
      {
        // The tour boat: up the shore and back, over four minutes.
        const u = ((time / 240) % 1) * 2
        const outbound = u < 1
        const at = alongLane(TOUR, (outbound ? u : 2 - u) * tourLength)
        tour.holder.position.set(at.x, 0, at.z)
        tour.holder.rotation.y = at.heading + (outbound ? 0 : Math.PI)
        float(tour.rolling, time, 11, 1.5)
      }
      for (const fleet of rocking) {
        for (const boat of fleet) {
          float(boat.rolling, time, boat.seed, 0.6)
          boat.holder.position.x = boat.x + Math.sin(time * 0.05 + boat.seed) * 0.8
          boat.holder.position.z = boat.z + Math.cos(time * 0.04 + boat.seed) * 0.8
        }
      }
      for (let i = 0; i < birds.length; i++) {
        const b = birds[i]
        const a = b.phase + time * b.speed
        p.set(b.cx + Math.cos(a) * b.r, b.cy + Math.sin(time * 0.6 + b.bob) * 0.8, b.cz + Math.sin(a) * b.r)
        q.setFromAxisAngle(up, -a + (b.speed > 0 ? 0 : Math.PI))
        m.compose(p, q, s)
        gulls.setMatrixAt(i, m)
      }
      gulls.instanceMatrix.needsUpdate = true
    },
    dispose() {
      for (const g of [ferryGeo, tankerGeo, boatGeo, tourGeo, speedGeo, sailGeo, gullGeo, ...wakeGeometries, ...lightGeometries]) g.dispose()
      wakeMaterial.dispose()
      gullMaterial.dispose()
      lightMaterial.dispose()
    },
  }
}

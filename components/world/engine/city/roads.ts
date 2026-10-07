import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  Mesh,
  Points,
  ShaderMaterial,
} from 'three'
import { fogGLSL, rng, type Atmosphere } from './common'
import type { Palette } from '../palette'

// The avenues and the coast road: a strip of sodium light on the ground, a
// lamp every so often down the middle, and traffic both ways all night,
// headlights one way and tail lights the other.

export interface Route {
  points: [number, number][]
  /** A fixed height for a road off the ground: a bridge's deck. */
  level?: number
  /** Lanes each way, as distances from the middle of the road. */
  lanes: number[]
  cars: number
  /** Width of the lit strip. */
  width: number
  lampEvery: number
}

/** Distance from a point to a polyline, for keeping buildings off the road. */
export function distToRoute(points: [number, number][], x: number, z: number) {
  let best = Infinity
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i]
    const [bx, bz] = points[i + 1]
    const dx = bx - ax
    const dz = bz - az
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)))
    best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z))
  }
  return best
}

/** The route every unit or so along its length, with its heading. */
function sample(points: [number, number][], height: (x: number, z: number) => number, level?: number) {
  const out: { x: number; y: number; z: number; tx: number; tz: number; s: number }[] = []
  let s = 0
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i]
    const [bx, bz] = points[i + 1]
    const len = Math.hypot(bx - ax, bz - az)
    const n = Math.max(1, Math.ceil(len))
    for (let k = 0; k < n; k++) {
      const t = k / n
      const x = ax + (bx - ax) * t
      const z = az + (bz - az) * t
      out.push({ x, y: level ?? height(x, z), z, tx: (bx - ax) / len, tz: (bz - az) / len, s: s + len * t })
    }
    s += len
  }
  const [lx, lz] = points[points.length - 1]
  const prev = out[out.length - 1]
  out.push({ x: lx, y: level ?? height(lx, lz), z: lz, tx: prev.tx, tz: prev.tz, s })
  return out
}

export function createRoads(
  palette: Palette,
  atmos: Atmosphere,
  routes: Route[],
  height: (x: number, z: number) => number,
  lampMaterial: ShaderMaterial
) {
  const group = new Group()
  const random = rng(17)
  const glow: number[] = []
  const glowSide: number[] = []
  const glowIndex: number[] = []
  const lamps: number[] = []
  const lampSeed: number[] = []
  type Car = { path: ReturnType<typeof sample>; length: number; lane: number; dir: 1 | -1; s: number; speed: number }
  const cars: Car[] = []

  for (const route of routes) {
    const path = sample(route.points, height, route.level)
    const length = path[path.length - 1].s
    // The lit strip: a ribbon a little above the ground.
    const base = glow.length / 3
    for (const p of path) {
      for (const side of [-1, 1]) {
        glow.push(p.x - p.tz * side * route.width * 0.5, p.y + 0.4, p.z + p.tx * side * route.width * 0.5)
        glowSide.push(side)
      }
    }
    for (let i = 0; i < path.length - 1; i++) {
      const a = base + i * 2
      glowIndex.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
    for (const p of path) {
      if (Math.round(p.s) % route.lampEvery !== 0) continue
      lamps.push(p.x, p.y + 1.6, p.z)
      lampSeed.push(random())
    }
    for (let i = 0; i < route.cars; i++) {
      const dir = i % 2 === 0 ? 1 : -1
      const lane = route.lanes[Math.floor(random() * route.lanes.length)]
      cars.push({ path, length, lane: lane * dir, dir, s: random() * length, speed: 3.2 + random() * 2.4 })
    }
  }

  const glowGeometry = new BufferGeometry()
  glowGeometry.setAttribute('position', new BufferAttribute(new Float32Array(glow), 3))
  glowGeometry.setAttribute('aSide', new BufferAttribute(new Float32Array(glowSide), 1))
  glowGeometry.setIndex(glowIndex)
  const glowMaterial = new ShaderMaterial({
    uniforms: { ...atmos, cRoad: { value: palette.city } },
    vertexShader: /* glsl */ `
      attribute float aSide;
      varying float vSide;
      varying vec3 vPosW;
      void main() {
        vSide = aSide;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogGLSL}
      uniform float uLights;
      uniform vec3 cRoad;
      varying float vSide;
      varying vec3 vPosW;
      void main() {
        // Brightest down the middle, under the lamps; an avenue outshines
        // the side streets around it.
        float across = 1.0 - vSide * vSide;
        float f = fogAmount(length(cameraPosition - vPosW));
        gl_FragColor = vec4(cRoad * (0.05 + 0.14 * across) * uLights * (1.0 - f), 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  })
  const strip = new Mesh(glowGeometry, glowMaterial)
  strip.frustumCulled = false

  const lampGeometry = new BufferGeometry()
  lampGeometry.setAttribute('position', new BufferAttribute(new Float32Array(lamps), 3))
  lampGeometry.setAttribute('aSeed', new BufferAttribute(new Float32Array(lampSeed), 1))
  const lampPoints = new Points(lampGeometry, lampMaterial)
  lampPoints.frustumCulled = false

  // Cars move on the CPU: a few hundred positions a frame is nothing, and
  // it keeps them on the road however it bends.
  const carPositions = new Float32Array(cars.length * 3)
  const carDir = new Float32Array(cars.map((c) => c.dir))
  const carGeometry = new BufferGeometry()
  const positionAttribute = new BufferAttribute(carPositions, 3)
  positionAttribute.setUsage(DynamicDrawUsage)
  carGeometry.setAttribute('position', positionAttribute)
  carGeometry.setAttribute('aDir', new BufferAttribute(carDir, 1))
  const carMaterial = new ShaderMaterial({
    uniforms: { ...atmos, uPixelRatio: { value: 1 }, cHead: { value: palette.heading }, cTail: { value: palette.dusk } },
    vertexShader: /* glsl */ `
      attribute float aDir;
      uniform float uPixelRatio;
      varying float vDir;
      varying float vDist;
      void main() {
        vDir = aDir;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vDist = length(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
        gl_PointSize = clamp(170.0 / vDist, 2.4, 6.0) * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uFogDensity;
      uniform vec3 cHead, cTail;
      varying float vDir;
      varying float vDist;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float f = 1.0 - exp(-pow(vDist * uFogDensity, 1.25));
        vec3 col = vDir > 0.0 ? cHead : cTail;
        gl_FragColor = vec4(col * (exp(-r * r * 3.0) * 1.2 + exp(-r * r * 16.0) * 0.8) * (1.0 - 0.7 * f), 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const traffic = new Points(carGeometry, carMaterial)
  traffic.frustumCulled = false

  group.add(strip, lampPoints, traffic)

  const place = (car: Car, time: number, out: Float32Array, i: number) => {
    const { path, length } = car
    let s = (car.s + car.dir * car.speed * time) % length
    if (s < 0) s += length
    // Find the sample (the path is dense and even, so an index estimate is close).
    let k = Math.min(path.length - 2, Math.floor((s / length) * (path.length - 1)))
    while (k > 0 && path[k].s > s) k--
    while (k < path.length - 2 && path[k + 1].s < s) k++
    const a = path[k]
    const b = path[k + 1]
    const t = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0
    const x = a.x + (b.x - a.x) * t
    const z = a.z + (b.z - a.z) * t
    out[i * 3] = x - a.tz * car.lane
    out[i * 3 + 1] = a.y + (b.y - a.y) * t + 0.55
    out[i * 3 + 2] = z + a.tx * car.lane
  }

  return {
    group,
    materials: [glowMaterial, carMaterial],
    carMaterial,
    update(time: number) {
      for (let i = 0; i < cars.length; i++) place(cars[i], time, carPositions, i)
      positionAttribute.needsUpdate = true
    },
    dispose() {
      glowGeometry.dispose()
      glowMaterial.dispose()
      lampGeometry.dispose()
      carGeometry.dispose()
      carMaterial.dispose()
    },
  }
}

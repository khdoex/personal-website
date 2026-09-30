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
  Quaternion,
  ShaderMaterial,
  Vector3,
  BoxGeometry,
  CylinderGeometry,
} from 'three'
import { at, fogGLSL, merge, rng, tag, type Atmosphere } from './common'
import type { Palette } from '../palette'

// What moves on and over the water: ferries crossing between the
// continents, tankers working up and down the strait, fishing boats riding
// at anchor off the shore, their wakes, and gulls. Everything afloat rolls
// with the waves. The boats borrow the monuments' material, so their
// windows are lit the same gold.

type Route = { from: [number, number]; to: [number, number]; period: number; phase: number }

export const ROUTES: Route[] = [
  { from: [-8, -54], to: [97, -28], period: 70, phase: 0.1 }, // Karaköy - Üsküdar
  { from: [-46, -36], to: [99, 36], period: 84, phase: 0.55 }, // Eminönü - Kadıköy
  { from: [24, -150], to: [99, -120], period: 58, phase: 0.3 }, // Beşiktaş - Üsküdar
]

function ferryGeometry(): BufferGeometry {
  const parts: BufferGeometry[] = [
    tag(new BoxGeometry(7.2, 1.1, 2.1).translate(0, 0.35, 0), 0.12),
    tag(at(new BoxGeometry(5.6, 0.9, 1.9), -0.3, 1.35, 0), 0.35),
    tag(at(new BoxGeometry(1.6, 0.7, 1.6), 1.4, 2.15, 0), 0.4),
    tag(at(new CylinderGeometry(0.28, 0.32, 1.1, 8), -1.2, 2.3, 0), 0.3),
    tag(at(new CylinderGeometry(0.05, 0.05, 1.4, 4), 1.9, 2.6, 0), 0.2),
    // the mast light
    tag(at(new BoxGeometry(0.14, 0.14, 0.14), 1.9, 3.35, 0), 0, 1.6),
  ]
  // A row of cabin windows down each side, lit.
  for (let k = 0; k < 9; k++) {
    for (const z of [-0.97, 0.97]) {
      parts.push(tag(new BoxGeometry(0.34, 0.34, 0.05).translate(-2.8 + k * 0.62, 1.4, z), 0.2, 1))
    }
  }
  return merge(parts)
}

/** The middle of the strait, south to north: the tankers' lane. */
const LANE: [number, number][] = [
  [58, 120], [62, 20], [64, -100], [66, -250], [62, -330], [64, -400], [66, -452], [68, -560], [70, -760],
]

function tankerGeometry(): BufferGeometry {
  const parts: BufferGeometry[] = [
    // hull and deck, long and low
    tag(new BoxGeometry(17, 1.3, 2.7).translate(0, 0.2, 0), 0.1),
    tag(new CylinderGeometry(1.35, 1.35, 1.3, 12, 1, false, 0, Math.PI).rotateY(Math.PI / 2).translate(8.5, 0.2, 0), 0.1),
    tag(at(new BoxGeometry(12, 0.25, 2.3), 1, 0.95, 0), 0.18),
    // the bridge at the stern, its funnel, the mast forward
    tag(at(new BoxGeometry(2.8, 2.6, 2.5), -6.6, 0.9, 0), (t) => 0.45 - 0.2 * t),
    tag(at(new BoxGeometry(1.2, 0.5, 2.9), -6.6, 3.5, 0), 0.3),
    tag(at(new CylinderGeometry(0.4, 0.45, 1.6, 8), -7.6, 3.6, 0), 0.25),
    tag(at(new CylinderGeometry(0.05, 0.05, 2.6, 4), 6.8, 1, 0), 0.2),
    tag(at(new BoxGeometry(0.16, 0.16, 0.16), 6.8, 3.7, 0), 0, 1.8),
    tag(at(new BoxGeometry(0.16, 0.16, 0.16), -6.6, 4.3, 0), 0, 1.6),
  ]
  // Bridge windows, and a string of deck lights down the length.
  for (let k = 0; k < 5; k++) {
    for (const z of [-1.26, 1.26]) parts.push(tag(new BoxGeometry(0.34, 0.3, 0.05).translate(-7.6 + k * 0.5, 2.9, z), 0.2, 0.95))
  }
  for (let k = 0; k < 10; k++) parts.push(tag(new BoxGeometry(0.1, 0.1, 0.1).translate(-4 + k * 1.2, 1.35, 0), 0, 0.9))
  return merge(parts)
}

function boatGeometry(): BufferGeometry {
  return merge([
    tag(new BoxGeometry(2.2, 0.5, 0.9).translate(0, 0.1, 0), 0.15),
    tag(at(new BoxGeometry(0.7, 0.5, 0.7), -0.3, 0.35, 0), 0.3),
    tag(at(new CylinderGeometry(0.03, 0.03, 1, 4), 0.5, 0.35, 0), 0.2),
    tag(at(new BoxGeometry(0.14, 0.14, 0.14), 0.5, 0.95, 0), 0, 1.5),
  ])
}

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

export function createLife(palette: Palette, atmos: Atmosphere, landmarkMaterial: ShaderMaterial, gullCount: number) {
  const group = new Group()

  // ---------------------------------------------------------------- ferries
  const ferryGeo = ferryGeometry()
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
  // Each vessel sits in a holder that the route moves and turns; the hull
  // inside it rolls on the waves, the wake stays flat on the water.
  const ferries = ROUTES.map(() => {
    const holder = new Group()
    const rolling = new Group()
    rolling.add(new Mesh(ferryGeo, landmarkMaterial))
    const wake = new Mesh(new PlaneGeometry(9, 26).rotateX(-Math.PI / 2).rotateY(Math.PI / 2).translate(-16.5, 0.05, 0), wakeMaterial)
    holder.add(rolling, wake)
    group.add(holder)
    return { holder, rolling, wake }
  })

  // Two tankers in the strait, one each way, slow enough to take the length
  // of a long read to pass.
  const tankerGeo = tankerGeometry()
  const tankers = [0.15, 0.62].map((phase, i) => {
    const holder = new Group()
    const rolling = new Group()
    rolling.add(new Mesh(tankerGeo, landmarkMaterial))
    const wake = new Mesh(new PlaneGeometry(12, 40).rotateX(-Math.PI / 2).rotateY(Math.PI / 2).translate(-28, 0.05, 0), wakeMaterial)
    holder.add(rolling, wake)
    group.add(holder)
    return { holder, rolling, phase, dir: i === 0 ? 1 : -1 }
  })

  // Fishing boats at anchor off the shores, each with its lamp.
  const boatGeo = boatGeometry()
  const moorings: [number, number, number][] = [
    [32, -345, 0.4], [34, -365, 2.1], [30, -300, 1.2], [94, -150, 2.8], [92, -60, 0.9], [46, 58, 1.7], [-12, 30, 3], [18, -120, 0.2],
  ]
  const boats = moorings.map(([x, z, heading], i) => {
    const holder = new Group()
    holder.add(new Mesh(boatGeo, landmarkMaterial))
    holder.position.set(x, 0, z)
    holder.rotation.y = heading
    group.add(holder)
    return { holder, x, z, seed: i * 1.37 }
  })

  // ------------------------------------------------------------------ gulls
  // Two wings, hinged at the body; the vertex shader flaps them.
  const wing: number[] = [
    0, 0, -0.12, 0, 0, 0.12, -0.9, 0.05, 0,
    0, 0, 0.12, 0, 0, -0.12, 0.9, 0.05, 0,
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
        p.y += abs(p.x) * flap;
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

  return {
    group,
    materials: [wakeMaterial, gullMaterial],
    update(time: number) {
      ROUTES.forEach((route, i) => {
        // Out and back, slowing into each pier.
        const u = ((time / route.period + route.phase) % 1) * 2
        const outbound = u < 1
        const t = outbound ? u : 2 - u
        const e = 0.5 - 0.5 * Math.cos(Math.PI * t)
        const [ax, az] = route.from
        const [bx, bz] = route.to
        const { holder, rolling, wake } = ferries[i]
        holder.position.set(ax + (bx - ax) * e, 0, az + (bz - az) * e)
        const heading = Math.atan2(-(bz - az), bx - ax) + (outbound ? 0 : Math.PI)
        holder.rotation.y = heading
        wake.visible = Math.sin(Math.PI * t) > 0.25
        float(rolling, time, i)
      })
      for (const tanker of tankers) {
        const u = (((time / 900 + tanker.phase) % 1) + 1) % 1
        const s = (tanker.dir > 0 ? u : 1 - u) * laneLength
        const at = alongLane(LANE, s)
        // Keep to the right-hand side of the lane, as ships in the strait do.
        const side = 5 * tanker.dir
        tanker.holder.position.set(at.x + Math.sin(at.heading) * side, 0, at.z + Math.cos(at.heading) * side)
        tanker.holder.rotation.y = at.heading + (tanker.dir > 0 ? 0 : Math.PI)
        float(tanker.rolling, time, tanker.phase * 10, 3)
      }
      for (const boat of boats) {
        float(boat.holder, time, boat.seed, 0.6)
        boat.holder.position.x = boat.x + Math.sin(time * 0.05 + boat.seed) * 0.8
        boat.holder.position.z = boat.z + Math.cos(time * 0.04 + boat.seed) * 0.8
      }
      birds.forEach((b, i) => {
        const a = b.phase + time * b.speed
        p.set(b.cx + Math.cos(a) * b.r, b.cy + Math.sin(time * 0.6 + b.bob) * 0.8, b.cz + Math.sin(a) * b.r)
        q.setFromAxisAngle(up, -a + (b.speed > 0 ? 0 : Math.PI))
        m.compose(p, q, s)
        gulls.setMatrixAt(i, m)
      })
      gulls.instanceMatrix.needsUpdate = true
    },
    dispose() {
      ferryGeo.dispose()
      tankerGeo.dispose()
      boatGeo.dispose()
      gullGeo.dispose()
      wakeMaterial.dispose()
      gullMaterial.dispose()
      group.traverse((o) => {
        const mesh = o as Mesh
        if (mesh.geometry && ![ferryGeo, tankerGeo, boatGeo].includes(mesh.geometry)) mesh.geometry.dispose()
      })
    },
  }
}

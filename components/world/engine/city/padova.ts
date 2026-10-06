import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  Points,
  ShaderMaterial,
  SphereGeometry,
  type Camera,
} from 'three'
import { createBuildings } from './buildings'
import { at, merge, PADOVA_AT, rng, tag, type Atmosphere } from './common'
import { box, cone, createFloodMaterial, cylinder, domeLight, hemisphere, ringAt } from './landmarks'
import { createGroundMaterial } from './terrain'
import { createTrees, type Tree } from './trees'
import { createWater } from './water'
import type { Palette } from '../palette'
import type { Quality } from '../quality'

// Padova at night: Prato della Valle, the great oval square with a canal
// round its island and a ring of statues along both banks, the basilica of
// Santa Giustina on its south-east side, and past the rooftops to the north
// the domes and slender towers of the Santo. The same units as Istanbul,
// the same pulled-up proportions.

const TAU = Math.PI * 2
/** The island's half-axes (east-west, north-south), and the canal round it. */
const RING = { a: 11, b: 24, canal: 2.2 }
/** The paving round the canal, out to the street. */
const PLAZA = { a: 25, b: 40 }
const GROUND = 1.2
const WATER = 0.3

const SANTA_GIUSTINA: [number, number] = [21, 47]
const SANTO: [number, number] = [-8, -84]

/** A point on an ellipse with half-axes a, b, at angle t. */
const onEllipse = (a: number, b: number, t: number): [number, number] => [a * Math.cos(t), b * Math.sin(t)]

// ------------------------------------------------------------------ ground

/**
 * The ground as rings of ellipses around the square's centre: the island,
 * the sunk canal with its two walls, the paving, then the town, flat to the
 * horizon. aPlaza turns the town's street grid off on the island and the
 * paving; aGlow is where the lamps pool light on them.
 */
function groundGeometry() {
  type Ring = { a: number; b: number; y: number; plaza: number; glow: number }
  const { a, b, canal } = RING
  const rings: Ring[] = [
    { a: 0.01, b: 0.01, y: GROUND, plaza: 1, glow: 0.5 },
    { a: 1.8, b: 1.8, y: GROUND, plaza: 1, glow: 0.35 },
    { a: a * 0.45, b: b * 0.45, y: GROUND, plaza: 1, glow: 0.05 },
    { a: a * 0.6, b: b * 0.6, y: GROUND, plaza: 1, glow: 0.3 },
    { a: a * 0.75, b: b * 0.75, y: GROUND, plaza: 1, glow: 0.05 },
    { a: a - 0.9, b: b - 0.9, y: GROUND, plaza: 1, glow: 0.45 },
    { a, b, y: GROUND, plaza: 1, glow: 0.3 },
    { a, b, y: GROUND, plaza: 1, glow: 0.2 },
    { a, b, y: -1, plaza: 1, glow: 0 },
    { a: a + canal, b: b + canal, y: -1, plaza: 1, glow: 0 },
    { a: a + canal, b: b + canal, y: GROUND, plaza: 1, glow: 0.2 },
    { a: a + canal, b: b + canal, y: GROUND, plaza: 1, glow: 0.3 },
    { a: a + canal + 1, b: b + canal + 1, y: GROUND, plaza: 1, glow: 0.45 },
    { a: (a + PLAZA.a) / 2 + 2, b: (b + PLAZA.b) / 2 + 2, y: GROUND, plaza: 1, glow: 0.06 },
    { a: PLAZA.a, b: PLAZA.b, y: GROUND, plaza: 1, glow: 0.25 },
    { a: PLAZA.a + 2, b: PLAZA.b + 2, y: GROUND, plaza: 0, glow: 0 },
  ]
  for (const k of [1.4, 2, 3, 4.5, 7, 11, 17, 26, 40]) rings.push({ a: PLAZA.a * k, b: PLAZA.a * k * 1.2, y: GROUND, plaza: 0, glow: 0 })

  const seg = 144
  const pos: number[] = []
  const plaza: number[] = []
  const glow: number[] = []
  for (const r of rings) {
    for (let i = 0; i < seg; i++) {
      const [x, z] = onEllipse(r.a, r.b, (i / seg) * TAU)
      pos.push(x, r.y, z)
      plaza.push(r.plaza)
      glow.push(r.glow)
    }
  }
  const index: number[] = []
  for (let k = 0; k < rings.length - 1; k++) {
    for (let i = 0; i < seg; i++) {
      const a0 = k * seg + i
      const a1 = k * seg + ((i + 1) % seg)
      const b0 = a0 + seg
      const b1 = a1 + seg
      index.push(a0, a1, b0, a1, b1, b0)
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('aPlaza', new BufferAttribute(new Float32Array(plaza), 1))
  g.setAttribute('aGlow', new BufferAttribute(new Float32Array(glow), 1))
  g.setIndex(index)
  g.computeVertexNormals()
  return g
}

// --------------------------------------------------------------- the square

function statue(r: () => number): BufferGeometry {
  const h = 0.8 + r() * 0.25
  return merge([
    tag(box(0.6, 0.95, 0.6), (t) => 0.95 - 0.3 * t),
    tag(at(cylinder(0.16, 0.24, h, 8), 0, 0.95, 0), (t) => 1.05 - 0.35 * t),
    tag(at(new SphereGeometry(0.14, 8, 6), 0, 0.95 + h + 0.1, 0), 0.6),
  ])
}

function square(): { geometry: BufferGeometry; lamps: number[]; trees: Tree[] } {
  const random = rng(21)
  const parts: BufferGeometry[] = []
  const lamps: number[] = []
  const trees: Tree[] = []
  const { a, b, canal } = RING
  const bridgeAt = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
  const nearBridge = (t: number) => bridgeAt.some((c) => Math.abs(Math.atan2(Math.sin(t - c), Math.cos(t - c))) < 0.09)

  // Two rings of statues, on the island's bank and on the outer one: 78 in all.
  const rows: [number, number, number][] = [
    [a - 0.55, b - 0.55, 40],
    [a + canal + 0.55, b + canal + 0.55, 38],
  ]
  for (const [ea, eb, n] of rows) {
    for (let i = 0; i < n; i++) {
      const t = ((i + 0.5) / n) * TAU
      if (nearBridge(t)) continue
      const [x, z] = onEllipse(ea, eb, t)
      parts.push(at(statue(random), x, GROUND - 0.05, z))
    }
  }
  // Four bridges over the canal, on the axes.
  for (const t of bridgeAt) {
    const [x0, z0] = onEllipse(a - 0.6, b - 0.6, t)
    const [x1, z1] = onEllipse(a + canal + 0.6, b + canal + 0.6, t)
    const len = Math.hypot(x1 - x0, z1 - z0)
    const angle = Math.atan2(x1 - x0, z1 - z0)
    const bridge = merge([
      tag(box(1.8, 0.35, len).translate(0, GROUND - 0.2, 0), 0.5),
      tag(at(box(0.18, 0.45, len), -0.85, GROUND + 0.1, 0), (t2) => 0.9 - 0.3 * t2),
      tag(at(box(0.18, 0.45, len), 0.85, GROUND + 0.1, 0), (t2) => 0.9 - 0.3 * t2),
    ])
    parts.push(at(bridge, (x0 + x1) / 2, 0, (z0 + z1) / 2, angle))
  }
  // Trees along the island's paths, in two rings.
  for (const [ta, tb, n] of [
    [a * 0.52, b * 0.52, 30],
    [a * 0.82, b * 0.82, 44],
  ] as const) {
    for (let i = 0; i < n; i++) {
      const t = ((i + random() * 0.3) / n) * TAU
      if (nearBridge(t)) continue
      const [x, z] = onEllipse(ta, tb, t)
      trees.push([x, z, 0, 1.7 + random() * 0.6])
    }
  }
  // The fountain in the middle.
  parts.push(tag(cylinder(1.7, 1.8, 0.45, 24), 0.7))
  parts.push(tag(at(cone(0.2, 1.3, 8), 0, 0.45, 0), 0.4, 0.5))
  // Lamps: round the outer bank, and along the island's paths.
  for (const [la, lb, n] of [
    [a + canal + 1.4, b + canal + 1.4, 36],
    [a - 1.2, b - 1.2, 30],
    [a * 0.6, b * 0.6, 20],
    [PLAZA.a - 0.8, PLAZA.b - 0.8, 44],
  ] as const) {
    for (let i = 0; i < n; i++) {
      const [x, z] = onEllipse(la, lb, ((i + 0.25) / n) * TAU)
      parts.push(tag(at(new CylinderGeometry(0.03, 0.04, 1.3, 4).translate(0, 0.65, 0), x, GROUND, z), 0.3))
      lamps.push(x, GROUND + 1.4, z)
    }
  }
  return { geometry: merge(parts), lamps, trees }
}

// ------------------------------------------------------------- the churches

/** A dome on a drum with a pointed lantern, the way the Venetian ones end. */
function venetianDome(r: number, drum: number, spire: number) {
  return merge([
    tag(cylinder(r * 1.02, r * 1.05, drum, 20), 0.9),
    tag(at(hemisphere(r, 1.05, 20), 0, drum, 0), domeLight),
    tag(at(cylinder(r * 0.16, r * 0.2, r * 0.45, 8), 0, drum + r * 1.02, 0), 0.6, 0.3),
    tag(at(cone(r * 0.2, spire, 8), 0, drum + r * 1.47, 0), 0.45),
  ])
}

function santaGiustina(): BufferGeometry {
  const parts: BufferGeometry[] = [
    // the brick nave and aisles; the front was never faced in marble
    tag(box(8, 6.5, 30), (t) => 0.8 - 0.35 * t),
    tag(at(box(12, 4, 22), 0, 0, 2), (t) => 0.75 - 0.3 * t),
    tag(at(box(16, 5.5, 5), 0, 0, 9), (t) => 0.8 - 0.35 * t),
  ]
  // Eight domes along the church, the biggest over the crossing.
  const domes: [number, number, number][] = [
    [0, -11, 2],
    [0, -5, 2.2],
    [0, 1.5, 2.2],
    [0, 9, 3],
    [-5.5, 9, 1.8],
    [5.5, 9, 1.8],
    [0, 14, 2.1],
    [0, -1.8, 1.7],
  ]
  for (const [x, z, r] of domes) parts.push(at(venetianDome(r, r * 0.5, r * 0.9), x, 6.5, z))
  // The bell tower beside the apse.
  parts.push(tag(at(box(1.8, 15, 1.8), 6, 0, 16), (t) => 0.95 - 0.4 * t))
  parts.push(tag(at(box(2, 1.6, 2), 6, 15, 16), 0.8, 0.35))
  parts.push(tag(at(cone(1.2, 3.4, 8), 6, 16.6, 16), 0.4))
  return merge(parts)
}

function santo(): BufferGeometry {
  const parts: BufferGeometry[] = [
    tag(box(11, 6.5, 26), (t) => 0.9 - 0.35 * t),
    tag(at(box(7, 7.5, 3), 0, 0, 12.5), (t) => 0.95 - 0.35 * t), // the front
    tag(at(box(15, 5, 8), 0, 0, -2), (t) => 0.85 - 0.3 * t), // the transept
  ]
  // Seven domes: two down the nave, the tall cone over the crossing, and
  // the rest round the choir.
  parts.push(at(venetianDome(2.8, 1.2, 2.2), 0, 6.5, 7.5))
  parts.push(at(venetianDome(2.8, 1.2, 2.2), 0, 6.5, 1.5))
  parts.push(tag(at(cylinder(2.6, 2.8, 3.2, 16), 0, 6.5, -4.5), 0.9))
  parts.push(tag(at(cone(2.8, 7.5, 16), 0, 9.7, -4.5), (t) => 0.95 - 0.6 * t))
  parts.push(tag(at(cylinder(0.15, 0.15, 1.6, 4), 0, 17.2, -4.5), 0.5))
  parts.push(at(venetianDome(2.2, 0.8, 1.8), -5.2, 5, -2))
  parts.push(at(venetianDome(2.2, 0.8, 1.8), 5.2, 5, -2))
  parts.push(at(venetianDome(2.6, 1, 2), 0, 6.5, -10))
  // The two slender bell towers, like minarets, and the octagonal lantern.
  for (const x of [-5.6, 5.6]) {
    parts.push(tag(at(cylinder(0.45, 0.55, 14, 10), x, 0, -7.5), (t) => 1 - 0.35 * t))
    parts.push(tag(ringAt(0.7, 11.5).translate(x, 0, -7.5), 1, 1))
    parts.push(tag(at(cylinder(0.5, 0.5, 1.6, 10), x, 14, -7.5), 0.8, 0.4))
    parts.push(tag(at(cone(0.55, 2.6, 10), x, 15.6, -7.5), 0.45))
  }
  parts.push(tag(at(cylinder(1.3, 1.4, 12, 8), 0, 0, -14.5), (t) => 0.95 - 0.35 * t))
  parts.push(tag(at(cone(1.4, 3.2, 8), 0, 12, -14.5), 0.45))
  return merge(parts)
}

// ----------------------------------------------------------------- the whole

export function createPadova(palette: Palette, quality: Quality, atmos: Atmosphere) {
  const group = new Group()
  group.position.copy(PADOVA_AT)

  const tier = quality.tier
  const lite = tier === 'low'
  const ground = new Mesh(groundGeometry(), createGroundMaterial(palette, atmos, !lite))
  ground.frustumCulled = false

  const flood = createFloodMaterial(palette, atmos)
  const { geometry: squareGeometry, lamps, trees: islandTrees } = square()
  const trees = createTrees(palette, atmos, { rows: islandTrees }, () => GROUND, () => false, 1, lite ? 0 : 1)
  const stone = new Mesh(
    merge([
      squareGeometry,
      at(santaGiustina(), SANTA_GIUSTINA[0], GROUND - 0.2, SANTA_GIUSTINA[1], -0.55),
      at(santo(), SANTO[0], GROUND - 0.2, SANTO[1], 0.08),
    ]),
    flood
  )
  stone.frustumCulled = false

  const lampGeometry = new BufferGeometry()
  lampGeometry.setAttribute('position', new BufferAttribute(new Float32Array(lamps), 3))
  const lampMaterial = new ShaderMaterial({
    uniforms: { ...atmos, uPixelRatio: { value: 1 }, cLamp: { value: palette.city } },
    vertexShader: /* glsl */ `
      uniform float uPixelRatio;
      varying float vDist;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vDist = length(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
        gl_PointSize = clamp(80.0 / vDist, 1.2, 4.0) * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uLights, uFogDensity;
      uniform vec3 cLamp;
      varying float vDist;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float f = 1.0 - exp(-pow(vDist * uFogDensity, 1.25));
        gl_FragColor = vec4(cLamp * exp(-r * r * 5.0) * uLights * 1.1 * (1.0 - 0.85 * f), 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const lampPoints = new Points(lampGeometry, lampMaterial)
  lampPoints.frustumCulled = false

  const inPlaza = (x: number, z: number, margin: number) =>
    (x / (PLAZA.a + margin)) ** 2 + (z / (PLAZA.b + margin)) ** 2 < 1
  const buildings = createBuildings(
    palette,
    atmos,
    tier === 'high' ? 5000 : tier === 'medium' ? 3200 : 1200,
    {
      height: () => GROUND,
      inland: (x, z) => (inPlaza(x, z, 3) ? -1 : 100),
      bounds: [-260, 260, -300, 260],
      focus: [[0, -20]],
      reach: 140,
      clear: [
        [SANTA_GIUSTINA[0], SANTA_GIUSTINA[1], 19],
        [SANTO[0], SANTO[1] + 2, 17],
        [SANTO[0], SANTO[1] + 18, 9],
      ],
      // Three to five storeys of old palazzi over their arcades, a few taller.
      rise: (_x, _z, r) => 1.1 + r * 1.2 + (r > 0.95 ? 0.9 : 0),
      style: (_x, _z, _h, r) => (r < 0.82 ? 5 : 1),
    },
    29,
    lite
  )

  const water = createWater(palette, atmos, 90, 256, 256, !lite, { origin: PADOVA_AT, taps: tier === 'high' ? 6 : 4 })
  water.mesh.position.y = WATER

  group.add(ground, stone, lampPoints, trees.group, buildings.group, water.mesh)
  const texScale = tier === 'high' ? 0.4 : tier === 'medium' ? 0.3 : 0.25

  return {
    group,
    /** The ground is flat: this is how high it stands. */
    ground: GROUND,
    watch(camera: Camera) {
      water.watch(camera)
    },
    resize(width: number, height: number, pixelRatio: number) {
      water.resize(width * pixelRatio * texScale, height * pixelRatio * texScale)
      lampMaterial.uniforms.uPixelRatio.value = pixelRatio
      for (const m of buildings.points) m.uniforms.uPixelRatio.value = pixelRatio
    },
    update(visible: boolean) {
      group.visible = visible
      if (!visible) return
      buildings.material.uniforms.uLit.value = 0.36 - 0.1 * atmos.uDawn.value
      water.sync()
    },
    dispose() {
      ground.geometry.dispose()
      ground.material.dispose()
      stone.geometry.dispose()
      flood.dispose()
      lampGeometry.dispose()
      lampMaterial.dispose()
      buildings.dispose()
      trees.dispose()
      water.dispose()
    },
  }
}

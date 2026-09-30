import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  Points,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three'
import { createBeacons } from './beacons'
import { at, fogGLSL, merge, tag, type Atmosphere } from './common'
import { GALATA_BRIDGE, heightAt } from './terrain'
import type { Palette } from '../palette'

// Istanbul's skyline, built from a handful of shapes. At night the city is
// dark and its monuments are floodlit from below, so what reads is outline
// and gold: domes brightest at their foot, minarets lit up their shafts, a
// ring of light at every balcony. Proportions are Ottoman; sizes are pulled
// up so the silhouettes carry from the water.

const TAU = Math.PI * 2

// ------------------------------------------------------------------ parts

export const cylinder = (rTop: number, rBottom: number, h: number, seg = 12) =>
  new CylinderGeometry(rTop, rBottom, h, seg, 1).translate(0, h / 2, 0)
export const cone = (r: number, h: number, seg = 12) => new ConeGeometry(r, h, seg, 1).translate(0, h / 2, 0)
export const box = (w: number, h: number, d: number) => new BoxGeometry(w, h, d).translate(0, h / 2, 0)
export const hemisphere = (r: number, squash = 1, seg = 28) => new SphereGeometry(r, seg, 12, 0, TAU, 0, Math.PI / 2).scale(1, squash, 1)
const halfDome = (r: number, facing: number) =>
  new SphereGeometry(r, 18, 8, 0, Math.PI, 0, Math.PI / 2).rotateY(facing)
export const ringAt = (r: number, y: number) => new TorusGeometry(r, Math.max(0.07, r * 0.09), 5, 18).rotateX(Math.PI / 2).translate(0, y, 0)

/** A dome is brightest where the floodlights hit it, at its foot. */
export const domeLight = (t: number) => 1.05 - 0.7 * t

/** An Ottoman pencil minaret: a fluted shaft, balconies ringed with light, a lead cone. */
export function minaret(h: number, r: number, balconies: number): BufferGeometry {
  const parts: BufferGeometry[] = []
  const baseH = h * 0.1
  const shaftH = h * 0.66
  parts.push(tag(cylinder(r * 1.25, r * 1.35, baseH, 8), 0.95))
  parts.push(tag(at(cylinder(r * 0.86, r, shaftH, 12), 0, baseH, 0), (t) => 0.95 - 0.2 * t))
  for (let b = 0; b < balconies; b++) {
    const y = baseH + shaftH * (0.62 + (0.38 * b) / Math.max(1, balconies)) + (b > 0 ? 0 : 0)
    parts.push(tag(ringAt(r * 1.45, y), 1, 1))
    parts.push(tag(at(cylinder(r * 1.4, r * 1.1, h * 0.012, 12), 0, y - h * 0.012, 0), 0.9))
  }
  const top = baseH + shaftH
  parts.push(tag(at(cylinder(r * 0.72, r * 0.84, h * 0.07, 12), 0, top, 0), 0.8))
  parts.push(tag(at(cone(r * 0.98, h * 0.2, 12), 0, top + h * 0.07, 0), (t) => 0.55 - 0.35 * t))
  parts.push(tag(at(cylinder(0.05, 0.05, h * 0.05, 4), 0, top + h * 0.27, 0), 0.6))
  return merge(parts)
}

/** A dome on its drum, with a finial, and the ring of lit windows round the drum. */
export function domeOnDrum(r: number, drumH: number, squash = 0.92): BufferGeometry {
  const parts = [
    tag(cylinder(r * 1.02, r * 1.05, drumH, 28), 1),
    tag(at(hemisphere(r, squash), 0, drumH, 0), domeLight),
    tag(at(cylinder(0.06, 0.09, r * 0.35, 5), 0, drumH + r * squash, 0), 0.5),
  ]
  const n = Math.max(10, Math.round(r * 5))
  for (let k = 0; k < n; k++) {
    const a = ((k + 0.5) / n) * TAU
    const g = new BoxGeometry(r * 0.2, drumH * 0.46, 0.06).rotateY(a).translate(Math.sin(a) * r * 1.05, drumH * 0.5, Math.cos(a) * r * 1.05)
    parts.push(tag(g, 0.3, 0.7))
  }
  return merge(parts)
}

interface MosqueSpec {
  dome: number
  drum: number
  base: [number, number, number]
  semi: number[] // directions (radians) with a half dome
  minarets: [number, number, number, number][] // x, z, height, balconies
  smallDomes?: [number, number, number][] // x, z, r (on the roof)
  court?: [number, number, number, number] // x, z, w, d: a courtyard with a row of small domes
}

function mosque(spec: MosqueSpec): BufferGeometry {
  const [bw, bh, bd] = spec.base
  const parts: BufferGeometry[] = [tag(box(bw, bh, bd), (t) => 0.95 - 0.45 * t)]
  parts.push(at(domeOnDrum(spec.dome, spec.drum), 0, bh, 0))
  for (const dir of spec.semi) {
    const sr = spec.dome * 0.72
    parts.push(tag(at(halfDome(sr, dir), Math.sin(dir) * spec.dome * 0.62, bh, Math.cos(dir) * spec.dome * 0.62), domeLight))
  }
  for (const [x, z, r] of spec.smallDomes ?? []) {
    parts.push(tag(at(cylinder(r, r, r * 0.3, 16), x, bh, z), 0.95))
    parts.push(tag(at(hemisphere(r, 0.9, 16), x, bh + r * 0.3, z), domeLight))
  }
  if (spec.court) {
    const [cx, cz, cw, cd] = spec.court
    parts.push(tag(at(box(cw, bh * 0.55, cd), cx, 0, cz), (t) => 0.85 - 0.35 * t))
    const n = Math.max(3, Math.round(cw / 2.4))
    for (let i = 0; i < n; i++) {
      const x = cx - cw / 2 + ((i + 0.5) * cw) / n
      parts.push(tag(at(hemisphere(0.8, 0.8, 12), x, bh * 0.55, cz - cd / 2 + 0.9), domeLight))
      parts.push(tag(at(hemisphere(0.8, 0.8, 12), x, bh * 0.55, cz + cd / 2 - 0.9), domeLight))
    }
  }
  for (const [x, z, h, balconies] of spec.minarets) parts.push(at(minaret(h, 0.42, balconies), x, 0, z))
  return merge(parts)
}

// --------------------------------------------------------------- monuments

function hagiaSophia(): BufferGeometry {
  const parts: BufferGeometry[] = [
    at(
      mosque({
        dome: 5.6,
        drum: 1.3,
        base: [15, 6.5, 13],
        semi: [Math.PI / 2, -Math.PI / 2],
        minarets: [
          [-8.4, -7.4, 17, 1],
          [8.4, -7.4, 16, 1],
          [-8.4, 7.4, 17.5, 1],
          [8.4, 7.4, 16.5, 1],
        ],
      }),
      0, 0, 0
    ),
  ]
  // The buttresses that hold the old dome up.
  for (const [x, z] of [[-6.8, -6], [6.8, -6], [-6.8, 6], [6.8, 6]]) {
    parts.push(tag(at(box(2.2, 8.4, 2.4), x, 0, z), (t) => 0.9 - 0.4 * t))
  }
  return merge(parts)
}

function blueMosque(): BufferGeometry {
  return mosque({
    dome: 5.2,
    drum: 1.6,
    base: [15, 7, 15],
    semi: [0, Math.PI / 2, Math.PI, -Math.PI / 2],
    smallDomes: [
      [-5.4, -5.4, 1.7],
      [5.4, -5.4, 1.7],
      [-5.4, 5.4, 1.7],
      [5.4, 5.4, 1.7],
    ],
    court: [0, 15, 15, 12],
    minarets: [
      [-8.2, -8.2, 20, 3],
      [8.2, -8.2, 20, 3],
      [-8.2, 8.2, 20, 3],
      [8.2, 8.2, 20, 3],
      [-8.2, 21.5, 17, 2],
      [8.2, 21.5, 17, 2],
    ],
  })
}

function suleymaniye(): BufferGeometry {
  return mosque({
    dome: 5.8,
    drum: 1.8,
    base: [16, 7.5, 14],
    semi: [0, Math.PI],
    smallDomes: [
      [-5.8, 0, 2],
      [5.8, 0, 2],
    ],
    court: [0, -15, 16, 13],
    minarets: [
      [-8.5, -8, 22, 3],
      [8.5, -8, 22, 3],
      [-8.5, -21.5, 17, 2],
      [8.5, -21.5, 17, 2],
    ],
  })
}

function yeniCami(): BufferGeometry {
  return mosque({
    dome: 4.2,
    drum: 1.2,
    base: [12, 6, 12],
    semi: [0, Math.PI / 2, Math.PI, -Math.PI / 2],
    smallDomes: [
      [-4.4, -4.4, 1.3],
      [4.4, -4.4, 1.3],
      [-4.4, 4.4, 1.3],
      [4.4, 4.4, 1.3],
    ],
    minarets: [
      [-6.6, 6.6, 16, 3],
      [6.6, 6.6, 16, 3],
    ],
  })
}

function galataTower(): BufferGeometry {
  const parts: BufferGeometry[] = [
    tag(cylinder(1.8, 1.95, 11, 20), (t) => 1.0 - 0.4 * t),
    // the gallery, lit all the way round, and its windows
    tag(ringAt(2.05, 11.2), 1, 1),
    tag(at(cylinder(1.95, 1.9, 1.6, 20), 0, 11, 0), 0.9, 0.55),
    tag(at(cone(2.1, 5.2, 20), 0, 12.6, 0), (t) => 0.55 - 0.4 * t),
    tag(at(cylinder(0.05, 0.05, 1.4, 4), 0, 17.8, 0), 0.5),
  ]
  // Rows of lit windows up the shaft.
  for (let row = 0; row < 4; row++) {
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * TAU + row * 0.4
      const g = new BoxGeometry(0.34, 0.6, 0.1).rotateY(-a).translate(Math.sin(a) * 1.9, 2.2 + row * 2.2, Math.cos(a) * 1.9)
      parts.push(tag(g, 0.4, 0.8))
    }
  }
  return merge(parts)
}

function maidensTower(): BufferGeometry {
  const parts: BufferGeometry[] = [
    // the rock, and the terrace walled round on top of it
    tag(new SphereGeometry(4.2, 18, 8, 0, TAU, 0, Math.PI / 2).scale(1, 0.3, 0.75).translate(0, -0.4, 0), 0.2),
    tag(box(7, 0.9, 4.4), (t) => 0.7 - 0.2 * t),
    // the house, two storeys, and the tower rising from its east end
    tag(at(box(4.4, 2.4, 3), -0.8, 0.9, 0), (t) => 1 - 0.35 * t),
    tag(at(box(3.2, 1.4, 2.4), -1, 3.3, 0), (t) => 0.8 - 0.3 * t),
    tag(at(cylinder(0.95, 1.05, 6.2, 8), 1.9, 0.9, 0), (t) => 1 - 0.4 * t),
    tag(ringAt(1.1, 7.1), 1, 1),
    tag(at(hemisphere(0.95, 1.1, 14), 1.9, 7.1, 0), domeLight),
    tag(at(cylinder(0.32, 0.36, 0.7, 8), 1.9, 8.1, 0), 1, 1.4),
    tag(at(cone(0.36, 0.7, 8), 1.9, 8.8, 0), 0.5),
    tag(at(cylinder(0.03, 0.03, 0.9, 4), 1.9, 9.5, 0), 0.4),
  ]
  // Lit windows: two rows along the house, a column up the tower.
  for (const zf of [1.52, -1.52]) {
    for (let k = 0; k < 6; k++) {
      parts.push(tag(new BoxGeometry(0.34, 0.5, 0.06).translate(-2.7 + k * 0.72, 1.6, zf), 0.3, 0.85))
      if (k > 0 && k < 5) parts.push(tag(new BoxGeometry(0.3, 0.42, 0.06).translate(-2.5 + k * 0.62, 3.85, zf * 0.8), 0.3, 0.7))
    }
  }
  for (let k = 0; k < 3; k++) {
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const g = new BoxGeometry(0.24, 0.5, 0.06).rotateY(a).translate(1.9 + Math.sin(a) * 0.98, 3 + k * 1.3, Math.cos(a) * 0.98)
      parts.push(tag(g, 0.3, 0.75))
    }
  }
  return merge(parts)
}

function topkapi(): BufferGeometry {
  const parts: BufferGeometry[] = []
  const halls: [number, number, number, number, number][] = [
    [-6, -2, 10, 2.4, 5],
    [4, 1, 8, 2.2, 6],
    [-2, 7, 12, 2, 4],
    [8, -7, 6, 2.6, 5],
  ]
  for (const [x, z, w, h, d] of halls) parts.push(tag(at(box(w, h, d), x, 0, z), (t) => 0.75 - 0.3 * t))
  for (const [x, z, r] of [[-6, -2, 1.3], [4, 1, 1.5], [8, -7, 1.1]] as const) {
    parts.push(tag(at(hemisphere(r, 0.8, 14), x, 2.3, z), domeLight))
  }
  // The Tower of Justice.
  parts.push(tag(at(box(1.8, 9, 1.8), -1, 0, -5), (t) => 0.85 - 0.2 * t))
  parts.push(tag(at(cone(1.5, 3.2, 8), -1, 9, -5), (t) => 0.5 - 0.3 * t))
  return merge(parts)
}

function galataBridge(): BufferGeometry {
  const [ax, az] = GALATA_BRIDGE.from
  const [bx, bz] = GALATA_BRIDGE.to
  const len = Math.hypot(bx - ax, bz - az)
  const angle = Math.atan2(bx - ax, bz - az)
  const parts: BufferGeometry[] = [tag(box(2.4, 0.5, len).translate(0, GALATA_BRIDGE.y - 0.25, 0), 0.3, 0)]
  // Piers, and the lamp posts along each rail.
  for (let k = 1; k < 8; k++) parts.push(tag(at(box(1.6, GALATA_BRIDGE.y, 0.5), 0, 0, -len / 2 + (k * len) / 8), 0.2))
  for (let t = -len / 2 + 0.8; t < len / 2; t += 1.8) {
    for (const x of [-1.1, 1.1]) parts.push(tag(at(cylinder(0.04, 0.05, 0.8, 4), x, GALATA_BRIDGE.y, t), 0.4))
  }
  return at(merge(parts), (ax + bx) / 2, 0, (az + bz) / 2, angle)
}

function cypresses(points: [number, number][]): BufferGeometry {
  return merge(points.map(([x, z]) => tag(at(cone(0.32, 1.7 + Math.abs(Math.sin(x * z)) * 1.3, 7), x, heightAt(x, z) - 0.1, z), 0.05)))
}

function camlica(): BufferGeometry {
  const parts: BufferGeometry[] = [
    // the TV tower: a shaft, a pod, a mast
    tag(cylinder(0.7, 1.4, 26, 10), (t) => 0.8 - 0.3 * t),
    tag(at(cylinder(2.4, 2.4, 2.4, 14), 0, 24, 0), 0.7, 0.5),
    tag(at(cylinder(0.25, 0.4, 12, 6), 0, 26.4, 0), 0.5),
    tag(at(cylinder(0.12, 0.12, 0.6, 4), 0, 38.4, 0), 0, 1.5),
  ]
  const mosqueParts = mosque({
    dome: 4.8,
    drum: 1.4,
    base: [13, 6, 13],
    semi: [0, Math.PI / 2, Math.PI, -Math.PI / 2],
    minarets: [
      [-7.5, -7.5, 21, 3],
      [7.5, -7.5, 21, 3],
      [-7.5, 7.5, 21, 3],
      [7.5, 7.5, 21, 3],
    ],
  })
  parts.push(at(mosqueParts, -22, 0, 10))
  return merge(parts)
}

// --------------------------------------------------------------- the whole

/** Where the monuments stand, in the terrain's frame. */
export const SITES = {
  hagiaSophia: [-16, -2] as [number, number],
  blueMosque: [-34, 16] as [number, number],
  suleymaniye: [-92, -22] as [number, number],
  yeniCami: [-44, -30] as [number, number],
  topkapi: [2, -14] as [number, number],
  galata: [-28, -96] as [number, number],
  maidens: [80, 10] as [number, number],
  camlica: [240, -110] as [number, number],
  bridge: [26, 104, -250] as [number, number, number],
}

/**
 * The floodlit stone every monument is drawn with. Parts carry aFlood and
 * aEmit (see tag() in common.ts).
 */
export function createFloodMaterial(palette: Palette, atmos: Atmosphere) {
  return new ShaderMaterial({
    uniforms: {
      ...atmos,
      cStone: { value: palette.oceanDeep },
      cFlood: { value: palette.city },
      cWarm: { value: palette.dusk },
      cCream: { value: palette.heading },
      cEmit: { value: palette.sun },
    },
    vertexShader: /* glsl */ `
      attribute float aFlood;
      attribute float aEmit;
      varying float vFlood;
      varying float vEmit;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      void main() {
        vFlood = aFlood;
        vEmit = aEmit;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogGLSL}
      uniform float uLights, uBreath;
      uniform vec3 uSunDir;
      uniform vec3 cStone, cFlood, cWarm, cCream, cEmit;
      varying float vFlood;
      varying float vEmit;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      void main() {
        vec3 N = normalize(vNormalW);
        vec3 V = normalize(cameraPosition - vPosW);
        // Floodlights stand on the ground in front of a monument and aim up
        // at it: walls and the lower half of every dome catch the light, the
        // tops fall away into the dark.
        vec3 toLight = normalize(vec3(V.x, 0.0, V.z) * 0.9 - vec3(0.0, 0.55, 0.0));
        float facing = max(dot(N, toLight), 0.0);
        // The floodlights breathe with the page, barely.
        float lit = pow(clamp(vFlood, 0.0, 1.2), 1.3) * (0.14 + 0.86 * facing) * uLights * (0.95 + 0.08 * uBreath);
        vec3 flood = mix(cWarm, cFlood, 0.55 + 0.35 * vFlood);
        flood = mix(flood, cCream, 0.3 * lit * lit);
        vec3 col = cStone * 0.28 + flood * lit * 1.05;
        col += cEmit * vEmit * uLights * 1.3;
        // Edges turned away pick up the sky behind them.
        col += air(-V) * pow(1.0 - max(dot(N, V), 0.0), 4.0) * 0.3;
        col += cWarm * max(dot(N, uSunDir), 0.0) * uDawn * 0.45;
        gl_FragColor = vec4(fog(col, vPosW), 1.0);
      }
    `,
  })
}

/** Monuments are drawn at this fraction of the size they are built at above. */
const SCALE = 0.6

export function createLandmarks(palette: Palette, atmos: Atmosphere) {
  const place = (g: BufferGeometry, [x, z]: [number, number], sink = 0.3, ry = 0) => {
    g.scale(SCALE, SCALE, SCALE)
    return at(g, x, heightAt(x, z) - sink, z, ry)
  }

  const parts: BufferGeometry[] = [
    place(hagiaSophia(), SITES.hagiaSophia, 0.3, 0.15),
    place(blueMosque(), SITES.blueMosque, 0.3, 0.1),
    place(suleymaniye(), SITES.suleymaniye, 0.3, -0.05),
    place(yeniCami(), SITES.yeniCami, 0.3, 0.3),
    place(topkapi(), SITES.topkapi, 0.2, 0.4),
    place(galataTower(), SITES.galata, 0.2),
    place(maidensTower(), SITES.maidens, 0, -0.4),
    place(camlica(), SITES.camlica, 0.4),
    galataBridge(),
    cypresses([
      [6, -4], [9, -9], [-3, -22], [-9, 4], [-24, 30], [-44, 28], [-50, 4], [-80, -12], [-104, -34], [-70, -28],
      [12, -18], [-20, -24], [-60, 12], [-30, 38],
    ]),
  ]

  const material = createFloodMaterial(palette, atmos)
  const mesh = new Mesh(merge(parts), material)
  mesh.frustumCulled = false
  const group = new Group()
  group.add(mesh)

  // The Maiden's Tower was a lighthouse: a slow beam turns over the water.
  const beamMaterial = new ShaderMaterial({
    uniforms: { ...atmos, cBeam: { value: palette.heading } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uLights;
      uniform vec3 cBeam;
      varying vec2 vUv;
      void main() {
        float along = vUv.y;
        float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
        // Soft across, brightest a little way out from the lamp.
        float fall = pow(along, 1.2) * smoothstep(1.0, 0.9, along);
        gl_FragColor = vec4(cBeam * pow(edge, 2.0) * fall * 0.16 * uLights, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  })
  const beam = new Mesh(new ConeGeometry(5, 40, 20, 1, true).rotateZ(Math.PI / 2).translate(20, 0, 0), beamMaterial)
  // Under the Galata Bridge's deck, the restaurants along both sides of its
  // lower level: strings of coloured bulbs just over the water.
  const bulbs: number[] = []
  const bulbColour: number[] = []
  const tints = [palette.city, palette.accent, palette.sky, palette.sun, palette.heading]
  {
    const [ax, az] = GALATA_BRIDGE.from
    const [bx, bz] = GALATA_BRIDGE.to
    const len = Math.hypot(bx - ax, bz - az)
    const ux = (bx - ax) / len
    const uz = (bz - az) / len
    for (let t = 3; t < len - 3; t += 0.42) {
      for (const side of [-1.35, 1.35]) {
        bulbs.push(ax + ux * t - uz * side, GALATA_BRIDGE.y - 0.62, az + uz * t + ux * side)
        const c = tints[Math.floor(t * 1.7 + (side > 0 ? 2 : 0)) % tints.length]
        bulbColour.push(c.r, c.g, c.b)
      }
    }
  }
  const bulbGeometry = new BufferGeometry()
  bulbGeometry.setAttribute('position', new BufferAttribute(new Float32Array(bulbs), 3))
  bulbGeometry.setAttribute('aColor', new BufferAttribute(new Float32Array(bulbColour), 3))
  const bulbMaterial = new ShaderMaterial({
    uniforms: { ...atmos, uPixelRatio: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vDist;
      void main() {
        vColor = aColor;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vDist = length(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
        gl_PointSize = clamp(110.0 / vDist, 1.4, 4.0) * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uLights, uFogDensity;
      varying vec3 vColor;
      varying float vDist;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float f = 1.0 - exp(-pow(vDist * uFogDensity, 1.25));
        gl_FragColor = vec4(vColor * exp(-r * r * 5.0) * 1.1 * uLights * (1.0 - 0.8 * f), 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const strings = new Points(bulbGeometry, bulbMaterial)
  strings.frustumCulled = false
  group.add(strings)

  // The red lamps up the mast on Çamlıca.
  const [cx, cz] = SITES.camlica
  const cg = heightAt(cx, cz) - 0.4
  const warning = createBeacons(palette, atmos, [
    cx, cg + 38.9 * SCALE, cz,
    cx + 0.3, cg + 26.6 * SCALE, cz,
    cx - 0.3, cg + 26.6 * SCALE, cz,
  ])
  group.add(warning.points)

  const beamPivot = new Group()
  const lamp = new Vector3(1.9 * SCALE, 8.45 * SCALE, 0).applyAxisAngle(new Vector3(0, 1, 0), -0.4)
  beamPivot.position.set(SITES.maidens[0] + lamp.x, heightAt(...SITES.maidens) + lamp.y, SITES.maidens[1] + lamp.z)
  beamPivot.add(beam)
  group.add(beamPivot)

  return {
    group,
    materials: [material, beamMaterial],
    beaconMaterial: warning.material,
    bulbMaterial,
    update(time: number) {
      beamPivot.rotation.y = time * 0.35
    },
    dispose() {
      group.traverse((o) => {
        const m = o as Mesh
        if (m.geometry) m.geometry.dispose()
      })
      material.dispose()
      beamMaterial.dispose()
      warning.dispose()
      bulbMaterial.dispose()
    },
  }
}

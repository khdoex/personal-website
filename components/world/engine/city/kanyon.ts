import {
  BoxGeometry,
  BufferAttribute,
  ExtrudeGeometry,
  Mesh,
  ShaderMaterial,
  Shape,
  type BufferGeometry,
} from 'three'
import { at, fogGLSL, merge, type Atmosphere } from './common'
import type { Palette } from '../palette'

// Kanyon, in Levent on Büyükdere Caddesi: a shopping street cut down through
// four storeys like a canyon, its terraces stepping back as they rise, every
// level lined with lit shopfronts; the office tower beside it on the avenue,
// and the curved block of flats behind. At night the canyon glows from inside.

/** Where it stands: the canyon opens east onto the avenue. */
export const KANYON: [number, number] = [-103, -372]

const LEVELS = 4
const LEVEL_H = 0.62
/** The canyon's floor, half a width, and how far each level steps back. */
const GAP = 0.9
const STEP = 0.28
const WEST = -9
const EAST = 8

/** The canyon's line: it bends twice on its way through. */
const centre = (x: number) => 1.5 * Math.sin(x * 0.32 + 0.4)

type Kind = 0 | 1 | 2 | 3 | 4 // outer wall, shopfront, tower, floor, railing light

/** Tags every vertex of a part with what it is, so one shader can light them all. */
function kind(g: BufferGeometry, k: Kind | ((nx: number, ny: number, nz: number, x: number, z: number) => Kind)) {
  const geometry = g.index ? g.toNonIndexed() : g
  geometry.deleteAttribute('uv')
  const n = geometry.getAttribute('normal')
  const p = geometry.getAttribute('position')
  const kinds = new Float32Array(p.count)
  for (let i = 0; i < p.count; i++) {
    kinds[i] = typeof k === 'number' ? k : k(n.getX(i), n.getY(i), n.getZ(i), p.getX(i), p.getZ(i))
  }
  geometry.setAttribute('aKind', new BufferAttribute(kinds, 1))
  return geometry
}

/** A plan drawn in x and z, stood up into a slab from y0 to y1. */
function slab(points: [number, number][], y0: number, y1: number) {
  const shape = new Shape()
  shape.moveTo(points[0][0], -points[0][1])
  for (const [x, z] of points.slice(1)) shape.lineTo(x, -z)
  shape.closePath()
  return new ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments: 1 })
    .rotateX(-Math.PI / 2)
    .translate(0, y0, 0)
}

/** One side of the canyon at one level: its footprint follows the bend. */
function side(sign: 1 | -1, level: number) {
  const inner = GAP + level * STEP
  const pts: [number, number][] = []
  const steps = 34
  for (let i = 0; i <= steps; i++) {
    const x = WEST + ((EAST - WEST) * i) / steps
    pts.push([x, centre(x) + sign * inner])
  }
  for (let i = steps; i >= 0; i--) {
    const x = WEST + ((EAST - WEST) * i) / steps
    const depth = sign > 0 ? 4.2 + 1.1 * Math.cos(x * 0.25) : 4.6 + 1.2 * Math.sin(x * 0.21)
    pts.push([x, centre(x) + sign * (GAP + depth)])
  }
  const g = slab(sign > 0 ? pts : pts.reverse(), level * LEVEL_H, (level + 1) * LEVEL_H)
  // Faces turned toward the canyon are shopfronts; the rest is outer wall,
  // and the tops are the terrace floors the next level steps back from.
  return kind(g, (nx, ny, nz, x, z) => {
    if (ny > 0.5) return 3
    if (ny < -0.5 || Math.abs(nx) > 0.9) return 0
    const towardCanyon = Math.abs(z - centre(x)) < inner + 0.05
    return towardCanyon ? 1 : 0
  })
}

/** The rails along each terrace, a thin line of light. */
function railing(sign: 1 | -1, level: number) {
  const parts: BufferGeometry[] = []
  const inner = GAP + level * STEP
  for (let x = WEST + 0.3; x < EAST - 0.3; x += 0.5) {
    const z0 = centre(x) + sign * inner
    const z1 = centre(x + 0.5) + sign * inner
    const angle = Math.atan2(0.5, z1 - z0)
    parts.push(kind(at(new BoxGeometry(0.04, 0.05, Math.hypot(0.5, z1 - z0)), x + 0.25, (level + 1) * LEVEL_H + 0.18, (z0 + z1) / 2, angle), 4))
  }
  return merge(parts)
}

/** The office tower on the avenue: a rounded plan, thirty storeys of offices. */
function tower() {
  const pts: [number, number][] = []
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2
    const r = 1 + 0.18 * Math.cos(2 * a)
    pts.push([Math.cos(a) * 2.9 * r, Math.sin(a) * 1.7 * r])
  }
  return kind(slab(pts, 0, 12.5), (nx, ny) => (ny > 0.5 ? 3 : 2))
}

/** The flats behind: a long block bent into an arc. */
function residence() {
  const pts: [number, number][] = []
  for (let i = 0; i <= 16; i++) {
    const a = -0.9 + (1.8 * i) / 16
    pts.push([Math.sin(a) * 8, -Math.cos(a) * 8 + 8])
  }
  for (let i = 16; i >= 0; i--) {
    const a = -0.9 + (1.8 * i) / 16
    pts.push([Math.sin(a) * 6.2, -Math.cos(a) * 6.2 + 8])
  }
  return kind(slab(pts, 0, 8.2), (nx, ny) => (ny > 0.5 ? 3 : 2))
}

export function createKanyon(palette: Palette, atmos: Atmosphere, ground: number) {
  const parts: BufferGeometry[] = []
  for (let level = 0; level < LEVELS; level++) {
    for (const sign of [1, -1] as const) {
      parts.push(side(sign, level))
      if (level > 0) parts.push(railing(sign, level - 1))
    }
  }
  // Two footbridges across the canyon.
  for (const [x, level] of [[-2.5, 2], [3.5, 1]] as const) {
    const w = 2 * (GAP + level * STEP) + 0.2
    parts.push(kind(at(new BoxGeometry(1.1, 0.12, w), x, (level + 1) * LEVEL_H, centre(x)), 3))
    parts.push(kind(at(new BoxGeometry(1.1, 0.04, 0.04), x, (level + 1) * LEVEL_H + 0.2, centre(x) - w / 2), 4))
    parts.push(kind(at(new BoxGeometry(1.1, 0.04, 0.04), x, (level + 1) * LEVEL_H + 0.2, centre(x) + w / 2), 4))
  }
  parts.push(at(tower(), 5, 0, 9.5, 0.3))
  parts.push(at(residence(), -6, 0, -13, 0))
  const geometry = merge(parts)

  const material = new ShaderMaterial({
    uniforms: {
      ...atmos,
      cWall: { value: palette.oceanDeep },
      cStone: { value: palette.arid },
      cShop: { value: palette.city },
      cWhite: { value: palette.heading },
      cCool: { value: palette.ice },
    },
    vertexShader: /* glsl */ `
      attribute float aKind;
      varying float vKind;
      varying vec3 vLocal;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      void main() {
        vKind = aKind;
        vLocal = position;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogGLSL}
      uniform float uLights, uTime, uBreath;
      uniform vec3 uSunDir;
      uniform vec3 cWall, cStone, cShop, cWhite, cCool;
      varying float vKind;
      varying vec3 vLocal;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }
      void main() {
        vec3 N = normalize(vNormalW);
        float y = vLocal.y;
        // Along the wall: the long walls run east and west, the tower turns.
        float along = abs(N.x) > 0.7 ? vLocal.z : vLocal.x;
        vec3 col = cWall * 0.45;
        if (vKind < 0.5) {
          // Outer walls: a band of warm-lit stone at every floor, dark glass
          // between, so the building's curves draw themselves in light.
          float f = fract(y / ${LEVEL_H.toFixed(2)});
          float band = smoothstep(0.6, 0.66, f) * (1.0 - smoothstep(0.9, 0.96, f));
          col = mix(cWall * 0.38, mix(cStone, cShop, 0.5) * 0.55, band * (0.55 + 0.45 * uLights));
          float win = step(0.3, fract(along / 0.45)) * (1.0 - smoothstep(0.55, 0.6, f));
          col += cShop * win * step(0.62, hash(floor(vec2(along / 0.45, y / ${LEVEL_H.toFixed(2)})))) * 0.45 * uLights;
        } else if (vKind < 1.5) {
          // The canyon's shopfronts: each level a row of lit windows, most
          // shops open, a few dark, a sign now and then in cool white.
          vec2 cell = vec2(floor(along / 1.1), floor(y / ${LEVEL_H.toFixed(2)}));
          float f = fract(y / ${LEVEL_H.toFixed(2)});
          float glass = smoothstep(0.08, 0.14, f) * (1.0 - smoothstep(0.78, 0.84, f));
          float mullion = step(0.06, fract(along / 1.1));
          float open = step(0.18, hash(cell));
          vec3 light = mix(cShop, cWhite, step(0.86, hash(cell + 7.0)) * 0.6);
          col = mix(cWall * 0.35, light * (0.85 + 0.35 * hash(cell + 3.0)), glass * mullion * open * uLights);
        } else if (vKind < 2.5) {
          // Office floors: a grid of windows, about half lit this late.
          vec2 cell = vec2(floor(along / 0.32), floor(y / 0.4));
          vec2 f = fract(vec2(along / 0.32, y / 0.4));
          float win = step(0.12, f.x) * step(f.y, 0.72);
          float lit = step(0.5, hash(cell)) * uLights;
          col = mix(cWall * 0.5, mix(cShop, cCool, step(0.7, hash(cell + 1.0))) * 0.8, win * lit);
          float fine = smoothstep(0.35, 0.9, max(fwidth(along / 0.32), fwidth(y / 0.4)));
          col = mix(col, cWall * 0.5 + cShop * 0.22 * uLights, fine);
        } else if (vKind < 3.5) {
          // Terrace floors and roofs, lit a little by the shops below.
          col = cWall * 0.5 + cShop * 0.08 * uLights;
        } else {
          col = cWhite * 1.1 * uLights;
        }
        col += cStone * max(dot(N, uSunDir), 0.0) * uDawn * 0.2;
        gl_FragColor = vec4(fog(col, vPosW), 1.0);
      }
    `,
  })
  const mesh = new Mesh(geometry, material)
  mesh.position.set(KANYON[0], ground - 0.2, KANYON[1])
  mesh.scale.setScalar(1.25)
  mesh.frustumCulled = false

  return {
    mesh,
    material,
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}

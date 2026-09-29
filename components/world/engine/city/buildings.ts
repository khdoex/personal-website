import {
  BoxGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from 'three'
import { BLOCK, DISTRICT, district, districtCell, fogGLSL, rng, STREET, type Atmosphere } from './common'
import type { Palette } from '../palette'

// The city between the monuments: the street plan walked block by block,
// each block built up with one to four buildings, dark, each with its own
// grid of windows, some lit. The street lamps below throw a little light up
// their walls. One draw call.

export interface Plot {
  /** Ground height at a point. */
  height(x: number, z: number): number
  /** How far inside land a point is. */
  inland(x: number, z: number): number
  /** Keep-clear circles around monuments: x, z, radius. */
  clear: [number, number, number][]
  /** The rectangle to fill: x0, x1, z0, z1. */
  bounds: [number, number, number, number]
  /** Where the camera mostly looks: buildings crowd toward it. */
  focus: [number, number]
  /** How far from the focus the city thins out. */
  reach: number
  /** How tall a building at a point is, from a random number. Towers (over 6) stand slender on their plot. */
  rise(x: number, z: number, r: number): number
}

export function createBuildings(palette: Palette, atmos: Atmosphere, count: number, plot: Plot, seed = 11) {
  const random = rng(seed)
  // No floor: nobody sees it.
  const geometry = new BoxGeometry(1, 1, 1).translate(0, 0.5, 0)
  const index = geometry.getIndex()!
  geometry.setIndex(Array.from(index.array).filter((_, i) => Math.floor(i / 6) !== 3))
  const material = new ShaderMaterial({
    uniforms: {
      ...atmos,
      uLit: { value: 0.42 },
      cWall: { value: palette.oceanDeep },
      cSand: { value: palette.arid },
      cWarm: { value: palette.city },
      cCool: { value: palette.ice },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      varying vec3 vLocal;
      varying vec3 vNormalL;
      varying vec3 vSize;
      varying float vSeed;
      varying vec3 vPosW;
      void main() {
        vLocal = position;
        vNormalL = normal;
        vSeed = aSeed;
        vSize = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogGLSL}
      uniform float uLights, uLit, uTime;
      uniform vec3 uSunDir;
      uniform vec3 cWall, cSand, cWarm, cCool;
      varying vec3 vLocal;
      varying vec3 vNormalL;
      varying vec3 vSize;
      varying float vSeed;
      varying vec3 vPosW;
      float hash(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.zyx + 31.32);
        return fract((p.x + p.y) * p.z);
      }
      void main() {
        // Walls: dark, a few a shade warmer, like old stone and render.
        vec3 wall = mix(cWall * 0.55, mix(cWall, cSand, 0.18) * 0.6, step(0.7, fract(vSeed * 7.13)));
        wall *= 0.85 + 0.3 * fract(vSeed * 3.71);
        vec3 col = wall;
        float height = vLocal.y * vSize.y;
        if (vNormalL.y < 0.5) {
          float along = abs(vNormalL.x) > 0.5 ? vLocal.z * vSize.z : vLocal.x * vSize.x;
          vec2 cell = vec2(along / 0.3, height / 0.34);
          vec2 id = floor(cell);
          vec2 f = fract(cell);
          float win = step(0.24, f.x) * step(f.x, 0.76) * step(0.3, f.y) * step(f.y, 0.8);
          float face = dot(vNormalL, vec3(1.0, 2.0, 3.0));
          float h = hash(vec3(id, vSeed * 97.0 + face));
          // Some buildings are mostly dark; some are mostly lit.
          float busy = 0.55 + 0.9 * (fract(vSeed * 11.3) - 0.5);
          float on = step(1.0 - uLit * busy, h);
          // A window now and then goes out or comes on.
          on *= step(0.02, fract(h * 13.7 + floor(uTime * 0.08 + h * 9.0) * 0.37));
          vec3 light = mix(cWarm, cCool, step(0.84, fract(h * 7.31)));
          // Far away the grid is finer than a pixel: show its average.
          float fine = smoothstep(0.35, 0.9, max(fwidth(cell.x), fwidth(cell.y)));
          // (A little brighter than the true average: at a distance lit
          // windows read as points of light, and the eye counts them up.)
          float lit = mix(win * on, uLit * busy * 0.5, fine);
          col += light * lit * uLights * 0.9;
          // The street lamps light the bottom of the walls.
          col += cWarm * 0.1 * exp(-height * 2.2) * uLights;
        }
        col += cSand * max(dot(vNormalL, uSunDir), 0.0) * uDawn * 0.18;
        gl_FragColor = vec4(fog(col, vPosW), 1.0);
      }
    `,
  })

  const mesh = new InstancedMesh(geometry, material, count)
  const seeds = new Float32Array(count)
  const m = new Matrix4()
  const q = new Quaternion()
  const up = new Vector3(0, 1, 0)
  const pos = new Vector3()
  const scale = new Vector3()
  const [x0, x1, z0, z1] = plot.bounds
  const [fx, fz] = plot.focus
  const inner = BLOCK - STREET - 0.5
  const reach = Math.ceil((DISTRICT * 1.2) / BLOCK)
  let placed = 0

  const build = (x: number, z: number, angle: number, w: number, d: number, r: number) => {
    if (placed >= count || plot.inland(x, z) < Math.max(w, d) * 0.5 + 0.4) return
    const h = plot.rise(x, z, r)
    pos.set(x, plot.height(x, z) - 0.4, z)
    q.setFromAxisAngle(up, -angle)
    scale.set(h > 6 ? Math.min(w, 3.4) : w, h + 0.4, h > 6 ? Math.min(d, 3.4) : d)
    m.compose(pos, q, scale)
    mesh.setMatrixAt(placed, m)
    seeds[placed] = random()
    placed++
  }

  // Blocks nearest the focus first, so a smaller budget still fills the
  // part of the city the camera sees.
  const blocks: { x: number; z: number; angle: number; near: number }[] = []
  for (let gz = Math.floor(z0 / DISTRICT) - 1; gz <= Math.floor(z1 / DISTRICT) + 1; gz++) {
    for (let gx = Math.floor(x0 / DISTRICT) - 1; gx <= Math.floor(x1 / DISTRICT) + 1; gx++) {
      const cell = districtCell(gx, gz)
      const c = Math.cos(cell.angle)
      const sn = Math.sin(cell.angle)
      for (let j = -reach; j < reach; j++) {
        for (let i = -reach; i < reach; i++) {
          const u = (i + 0.5) * BLOCK
          const v = (j + 0.5) * BLOCK
          const x = cell.ox + c * u - sn * v
          const z = cell.oz + sn * u + c * v
          if (x < x0 || x > x1 || z < z0 || z > z1) continue
          const own = district(x, z)
          if (own.gx !== gx || own.gz !== gz || own.edge < BLOCK * 0.55) continue
          if (plot.inland(x, z) < 1.5) continue
          if (plot.clear.some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r)) continue
          const near = Math.exp(-Math.hypot(x - fx, z - fz) / plot.reach)
          blocks.push({ x, z, angle: cell.angle, near })
        }
      }
    }
  }
  blocks.sort((a, b) => b.near - a.near)

  for (const b of blocks) {
    if (placed >= count) break
    // Thinner away from where the camera looks; the lit streets carry on.
    if (random() > 0.25 + 0.75 * Math.sqrt(b.near)) continue
    const c = Math.cos(b.angle)
    const sn = Math.sin(b.angle)
    const at = (du: number, dv: number) => [b.x + c * du - sn * dv, b.z + sn * du + c * dv] as const
    const pattern = random()
    const g = 0.35 // the gap between buildings on one block
    if (pattern < 0.25) {
      build(b.x, b.z, b.angle, inner, inner, random())
    } else if (pattern < 0.6) {
      const a = inner * (0.35 + 0.3 * random())
      const [ax, az] = at(-inner / 2 + a / 2, 0)
      const [bx, bz] = at(a / 2 + g / 2, 0)
      build(ax, az, b.angle, a - g / 2, inner, random())
      build(bx, bz, b.angle, inner - a - g / 2, inner, random())
    } else {
      const h = (inner - g) / 2
      for (const [su, sv] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        if (random() < 0.12) continue // a courtyard, a garden, a lot
        const [px, pz] = at((su * (h + g)) / 2, (sv * (h + g)) / 2)
        build(px, pz, b.angle, h, h, random())
      }
    }
  }
  mesh.count = placed
  geometry.setAttribute('aSeed', new InstancedBufferAttribute(seeds, 1))
  mesh.instanceMatrix.needsUpdate = true
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

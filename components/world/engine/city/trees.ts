import {
  BufferAttribute,
  CylinderGeometry,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  LatheGeometry,
  Group,
  Matrix4,
  Quaternion,
  ShaderMaterial,
  Vector2,
  Vector3,
  type BufferGeometry,
} from 'three'
import { fogGLSL, merge, rng, type Atmosphere } from './common'
import { MOON_DIR } from './sky'
import { noise } from '../glsl'
import type { Palette } from '../palette'

// Woods: Boğaziçi's hill, the slope under Rumelihisarı, the palace gardens,
// the parks up the shores, the cypresses of the old cemeteries. Three kinds
// of tree: plane trees and oaks with lumpy crowns, the stone pines that
// stand like umbrellas along the Bosphorus, and dark cypresses. Their leaves
// are nearly black at night, warmed underneath by the lamps along the
// paths, and they move a little in the wind. One draw call a kind.

/** 0 a plane tree or an oak, 1 a stone pine, 2 a cypress. */
export type Species = 0 | 1 | 2

/**
 * A park: its middle, its radius, how many trees it holds, and what share
 * of them are stone pines and cypresses (the rest broadleaf).
 */
export type Park = [number, number, number, number, number?, number?]

/** A tree placed by hand: x, z, kind, size. */
export type Tree = [number, number, Species, number]

/** How far inside a park a point is, 0 outside, 1 well in. */
export function parkAmount(parks: Park[], x: number, z: number) {
  let v = 0
  for (const [px, pz, r] of parks) {
    const d = Math.hypot(x - px, z - pz)
    v = Math.max(v, Math.min(1, Math.max(0, (r - d) / 6)))
  }
  return v
}

/** Tags a part of a tree: 0 the trunk, 1 leaves. */
function part(g: BufferGeometry, leaves: number) {
  const geometry = g.index ? g.toNonIndexed() : g
  geometry.deleteAttribute('uv')
  geometry.setAttribute('aLeaf', new BufferAttribute(new Float32Array(geometry.getAttribute('position').count).fill(leaves), 1))
  return geometry
}

/** The three kinds, a unit or so tall, standing on y = 0. detail: 1 round crowns, 0 cheaper facets. */
function shapes(detail: number): BufferGeometry[] {
  const blob = (r: number, x: number, y: number, z: number, squash = 1) =>
    part(new IcosahedronGeometry(r, detail).scale(1, squash, 1).translate(x, y, z), 1)
  const broadleaf = merge([
    part(new CylinderGeometry(0.045, 0.07, 0.6, 6).translate(0, 0.3, 0), 0),
    blob(0.5, 0, 0.95, 0, 0.92),
    blob(0.38, 0.32, 0.8, 0.1),
    blob(0.4, -0.3, 0.86, -0.12),
    blob(0.34, 0.04, 0.76, 0.34),
    blob(0.32, -0.08, 1.24, -0.04),
  ])
  const pine = merge([
    part(new CylinderGeometry(0.04, 0.07, 1.2, 6).rotateZ(0.07).translate(0.03, 0.6, 0), 0),
    blob(0.62, 0, 1.28, 0, 0.42),
    blob(0.42, 0.38, 1.2, 0.12, 0.45),
    blob(0.42, -0.34, 1.22, -0.16, 0.45),
  ])
  const profile = [
    [0, 0.02], [0.16, 0.14], [0.23, 0.5], [0.22, 0.95], [0.16, 1.4], [0.08, 1.8], [0, 2.02],
  ].map(([r, y]) => new Vector2(r, y))
  const cypress = merge([part(new LatheGeometry(profile, detail > 0 ? 9 : 6), 1)])
  return [broadleaf, pine, cypress]
}

export interface Grove {
  parks?: Park[]
  /** Trees placed one by one, like the rings round Prato della Valle. */
  rows?: Tree[]
}

export function createTrees(
  palette: Palette,
  atmos: Atmosphere,
  grove: Grove,
  height: (x: number, z: number) => number,
  keepOut: (x: number, z: number) => boolean,
  scale = 1,
  detail = 1
) {
  const random = rng(53)
  const material = new ShaderMaterial({
    // The leaves' clumps cost two noise lookups a pixel: not on the cheapest trees.
    defines: { OCTAVES: 1, CLUMPS: detail > 0 ? 1 : 0 },
    uniforms: {
      ...atmos,
      uMoonDir: { value: MOON_DIR },
      cLeaf: { value: palette.forest },
      cDeep: { value: palette.oceanDeep },
      cLamp: { value: palette.city },
      cSky: { value: palette.sky },
    },
    vertexShader: /* glsl */ `
      attribute float aShade;
      attribute float aLeaf;
      uniform float uTime;
      varying float vShade;
      varying float vLeaf;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      varying float vUp;
      void main() {
        vShade = aShade;
        vLeaf = aLeaf;
        vUp = position.y;
        // The wind moves the crowns, never the foot of the trunk.
        vec3 p = position;
        float bend = max(p.y - 0.4, 0.0);
        p.x += sin(uTime * 0.8 + aShade * 31.0) * 0.025 * bend;
        p.z += sin(uTime * 0.63 + aShade * 17.0) * 0.018 * bend;
        vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogGLSL}
      ${noise}
      uniform float uLights;
      uniform vec3 uSunDir, uMoonDir;
      uniform vec3 cLeaf, cDeep, cLamp, cSky;
      varying float vShade;
      varying float vLeaf;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      varying float vUp;
      void main() {
        vec3 N = normalize(vNormalW);
        vec3 V = normalize(cameraPosition - vPosW);
        vec3 col;
        if (vLeaf < 0.5) {
          col = cDeep * 0.7 + cLamp * 0.05 * uLights;
        } else {
          // Night leaves: nearly black green, in clumps of light and shade.
          #if CLUMPS
          float n = snoise(vPosW * 2.6) * 0.5 + snoise(vPosW * 6.3) * 0.25;
          #else
          float n = 0.0;
          #endif
          col = mix(cDeep * 0.6, cLeaf * 0.34, 0.42 + 0.4 * vShade) * (0.8 + 0.45 * n);
          // The undersides warmed by the lamps along the paths; the tops
          // catch the moon and the sky.
          col += cLamp * 0.08 * smoothstep(0.3, -0.8, N.y) * uLights;
          col += cSky * (0.05 * max(dot(N, uMoonDir), 0.0) + 0.025 * max(N.y, 0.0)) * (0.7 + 0.6 * max(n, 0.0));
        }
        col += air(-V) * pow(1.0 - abs(dot(N, V)), 3.0) * 0.12;
        col += cLeaf * max(dot(N, uSunDir), 0.0) * uDawn * 0.3;
        gl_FragColor = vec4(fog(col, vPosW), 1.0);
      }
    `,
  })

  // Where each tree goes, by kind.
  const planted: [number, number, number, number, number][][] = [[], [], []]
  for (const [px, pz, r, n, pines = 0, cypresses = 0] of grove.parks ?? []) {
    const want = Math.round(n * scale)
    let got = 0
    for (let tries = 0; got < want && tries < want * 20; tries++) {
      const a = random() * Math.PI * 2
      const d = Math.sqrt(random()) * r
      const x = px + Math.cos(a) * d
      const z = pz + Math.sin(a) * d
      const ground = height(x, z)
      if (ground < 1.6 || keepOut(x, z)) continue
      const k = random()
      const kind = k < cypresses ? 2 : k < cypresses + pines ? 1 : 0
      planted[kind].push([x, ground, z, 1.5 + random() * 1.7, random()])
      got++
    }
  }
  for (const [x, z, kind, size] of grove.rows ?? []) planted[kind].push([x, height(x, z), z, size, random()])

  const geometries = shapes(detail)
  const group = new Group()
  const m = new Matrix4()
  const q = new Quaternion()
  const p = new Vector3()
  const s = new Vector3()
  const up = new Vector3(0, 1, 0)
  const meshes = geometries.map((geometry, kind) => {
    const list = planted[kind]
    const mesh = new InstancedMesh(geometry, material, Math.max(1, list.length))
    list.forEach(([x, y, z, size, shade], i) => {
      p.set(x, y - 0.05, z)
      q.setFromAxisAngle(up, shade * Math.PI * 2)
      // Cypresses tall and thin; the others a little taller or wider each.
      const tall = kind === 2 ? 1.1 + shade * 0.5 : 1 + (shade - 0.5) * 0.4
      s.set(size, size * tall, size)
      mesh.setMatrixAt(i, m.compose(p, q, s))
    })
    mesh.count = list.length
    geometry.setAttribute('aShade', new InstancedBufferAttribute(new Float32Array(list.map((t) => t[4])), 1))
    mesh.instanceMatrix.needsUpdate = true
    mesh.frustumCulled = false
    if (list.length) group.add(mesh)
    return mesh
  })

  return {
    group,
    meshes,
    dispose() {
      for (const g of geometries) g.dispose()
      material.dispose()
    },
  }
}

import {
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from 'three'
import { fogGLSL, rng, type Atmosphere } from './common'
import type { Palette } from '../palette'

// Woods: Boğaziçi's hill, the slope under Rumelihisarı, the palace gardens
// at Topkapı. Dark leaf green, lit a little from below where the paths are,
// in one draw call.

/** A park: its middle, its radius, and how many trees it holds. */
export type Park = [number, number, number, number]

/** How far inside a park a point is, 0 outside, 1 well in. */
export function parkAmount(parks: Park[], x: number, z: number) {
  let v = 0
  for (const [px, pz, r] of parks) {
    const d = Math.hypot(x - px, z - pz)
    v = Math.max(v, Math.min(1, Math.max(0, (r - d) / 6)))
  }
  return v
}

export function createTrees(
  palette: Palette,
  atmos: Atmosphere,
  parks: Park[],
  height: (x: number, z: number) => number,
  keepOut: (x: number, z: number) => boolean,
  scale = 1
) {
  const random = rng(53)
  const total = Math.round(parks.reduce((n, p) => n + p[3], 0) * scale)
  const geometry = new IcosahedronGeometry(1, 1)
  const material = new ShaderMaterial({
    uniforms: { ...atmos, cLeaf: { value: palette.forest }, cDeep: { value: palette.oceanDeep }, cLamp: { value: palette.city } },
    vertexShader: /* glsl */ `
      attribute float aShade;
      varying float vShade;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      varying float vUp;
      void main() {
        vShade = aShade;
        vUp = position.y;
        vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogGLSL}
      uniform float uLights;
      uniform vec3 uSunDir;
      uniform vec3 cLeaf, cDeep, cLamp;
      varying float vShade;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      varying float vUp;
      void main() {
        vec3 N = normalize(vNormalW);
        // Night leaves: nearly black green, the undersides warmed by the
        // lamps along the paths, the edges catching the sky.
        vec3 col = mix(cDeep * 0.6, cLeaf * 0.32, 0.45 + 0.4 * vShade);
        col += cLamp * 0.07 * smoothstep(0.3, -0.8, vUp) * uLights;
        col += air(normalize(vPosW - cameraPosition)) * pow(1.0 - abs(dot(N, normalize(cameraPosition - vPosW))), 3.0) * 0.12;
        col += cLeaf * max(dot(N, uSunDir), 0.0) * uDawn * 0.3;
        gl_FragColor = vec4(fog(col, vPosW), 1.0);
      }
    `,
  })

  const mesh = new InstancedMesh(geometry, material, Math.max(1, total))
  const shade = new Float32Array(Math.max(1, total))
  const m = new Matrix4()
  const q = new Quaternion()
  const p = new Vector3()
  const s = new Vector3()
  let placed = 0
  for (const [px, pz, r, n] of parks) {
    const want = Math.round(n * scale)
    let got = 0
    for (let tries = 0; got < want && tries < want * 20; tries++) {
      const a = random() * Math.PI * 2
      const d = Math.sqrt(random()) * r
      const x = px + Math.cos(a) * d
      const z = pz + Math.sin(a) * d
      const ground = height(x, z)
      if (ground < 1.6 || keepOut(x, z)) continue
      const size = 0.8 + random() * 0.9
      p.set(x, ground + size * 0.9, z)
      q.setFromAxisAngle(new Vector3(0, 1, 0), random() * Math.PI)
      s.set(size, size * (1 + random() * 0.4), size)
      m.compose(p, q, s)
      mesh.setMatrixAt(placed, m)
      shade[placed] = random()
      placed++
      got++
    }
  }
  mesh.count = placed
  geometry.setAttribute('aShade', new InstancedBufferAttribute(shade, 1))
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false

  return {
    mesh,
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}

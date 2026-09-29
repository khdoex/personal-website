import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  LineLoop,
  Points,
  ShaderMaterial,
  Vector3,
  type Color,
} from 'three'
import { DEG, TAU } from './math'
import type { Palette } from './palette'

// One satellite per thing Kaan is working on, in the order the page lists
// them: leaf, sun, sky. Each drags a fading trail along its orbit, and the
// one whose entry is under the pointer burns brighter.

const SPECS = [
  { radius: 1.42, tiltX: 16, tiltZ: -10, yaw: 20, period: 44 },
  { radius: 1.7, tiltX: -32, tiltZ: 20, yaw: 140, period: 61 },
  { radius: 2.0, tiltX: 50, tiltZ: 6, yaw: 255, period: 80 },
]
const SEGMENTS = 256

export function createOrbits(palette: Palette) {
  const group = new Group()
  const colors: Color[] = [palette.accent, palette.sun, palette.sky]

  const orbits = SPECS.map((spec, i) => {
    const holder = new Group()
    holder.rotation.set(spec.tiltX * DEG, spec.yaw * DEG, spec.tiltZ * DEG, 'YXZ')
    group.add(holder)

    const positions = new Float32Array(SEGMENTS * 3)
    const ts = new Float32Array(SEGMENTS)
    for (let k = 0; k < SEGMENTS; k++) {
      const a = (k / SEGMENTS) * TAU
      positions.set([Math.cos(a) * spec.radius, 0, -Math.sin(a) * spec.radius], k * 3)
      ts[k] = k / SEGMENTS
    }
    const lineGeometry = new BufferGeometry()
    lineGeometry.setAttribute('position', new BufferAttribute(positions, 3))
    lineGeometry.setAttribute('aT', new BufferAttribute(ts, 1))
    const lineMaterial = new ShaderMaterial({
      uniforms: {
        uSat: { value: 0 },
        uOpacity: { value: 0 },
        uHighlight: { value: 0 },
        uColor: { value: colors[i] },
      },
      vertexShader: /* glsl */ `
        attribute float aT;
        varying float vT;
        void main() {
          vT = aT;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uSat, uOpacity, uHighlight;
        uniform vec3 uColor;
        varying float vT;
        void main() {
          float behind = fract(uSat - vT);
          float trail = pow(1.0 - behind, 6.0);
          float a = (0.07 + 0.2 * uHighlight + 0.85 * trail) * uOpacity;
          gl_FragColor = vec4(uColor, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    const line = new LineLoop(lineGeometry, lineMaterial)
    holder.add(line)

    const satGeometry = new BufferGeometry()
    satGeometry.setAttribute('position', new BufferAttribute(new Float32Array(3), 3))
    const satMaterial = new ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: 1 },
        uSize: { value: 12 },
        uOpacity: { value: 0 },
        uColor: { value: colors[i] },
        uWhite: { value: palette.heading },
      },
      vertexShader: /* glsl */ `
        uniform float uPixelRatio, uSize;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * uPixelRatio;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        uniform vec3 uColor, uWhite;
        void main() {
          float r = length(gl_PointCoord - 0.5) * 2.0;
          float core = exp(-r * r * 40.0);
          float halo = exp(-r * r * 6.0) * 0.5;
          gl_FragColor = vec4((mix(uColor, uWhite, core * 0.6) * (core + halo)) * uOpacity, 1.0);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    const satellite = new Points(satGeometry, satMaterial)
    satellite.frustumCulled = false
    holder.add(satellite)

    return { spec, lineMaterial, satMaterial, satGeometry, phase: Math.random() }
  })

  const highlight = [0, 0, 0]
  const p = new Vector3()

  return {
    group,
    /** opacity: 0..1 for the whole set; active: index under the pointer, or null. */
    update(time: number, dt: number, opacity: number, active: number | null, pixelRatio: number) {
      orbits.forEach((o, i) => {
        highlight[i] += ((active === i ? 1 : 0) - highlight[i]) * (1 - Math.exp(-8 * dt))
        const t = (o.phase + time / o.spec.period) % 1
        const a = t * TAU
        p.set(Math.cos(a) * o.spec.radius, 0, -Math.sin(a) * o.spec.radius)
        const attr = o.satGeometry.getAttribute('position') as BufferAttribute
        attr.setXYZ(0, p.x, p.y, p.z)
        attr.needsUpdate = true
        const dim = active !== null && active !== i ? 0.45 : 1
        o.lineMaterial.uniforms.uSat.value = t
        o.lineMaterial.uniforms.uOpacity.value = opacity * dim
        o.lineMaterial.uniforms.uHighlight.value = highlight[i]
        o.satMaterial.uniforms.uOpacity.value = opacity * (0.75 + 0.5 * highlight[i]) * dim
        o.satMaterial.uniforms.uSize.value = 12 + 10 * highlight[i]
        o.satMaterial.uniforms.uPixelRatio.value = pixelRatio
      })
      group.visible = opacity > 0.002
    },
    dispose() {
      orbits.forEach((o) => {
        o.lineMaterial.dispose()
        o.satMaterial.dispose()
        o.satGeometry.dispose()
      })
      group.traverse((obj) => {
        const g = (obj as LineLoop).geometry
        if (g) g.dispose()
      })
    },
  }
}

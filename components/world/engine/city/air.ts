import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, DynamicDrawUsage, Points, ShaderMaterial } from 'three'
import type { Atmosphere } from './common'
import type { Palette } from '../palette'

// Airliners far off over the city, on their way in to the airports: too
// high and too far to be more than their lights. A white strobe that
// double-flashes, a red beacon, a steady light at the wingtips. They take
// a couple of minutes to cross the sky; now and then one is in view.

type Flight = { from: [number, number, number]; to: [number, number, number]; period: number; phase: number }

const FLIGHTS: Flight[] = [
  { from: [1400, 150, -1000], to: [-1400, 120, -700], period: 150, phase: 0 },
  { from: [-1300, 140, -150], to: [200, 170, -1400], period: 130, phase: 0.35 },
  { from: [1300, 120, 200], to: [-600, 150, -1300], period: 170, phase: 0.6 },
  { from: [1400, 130, 400], to: [1200, 110, -1300], period: 160, phase: 0.8 },
]

/** Each aircraft's lights, offset from its middle: x along its heading, y up; and what each is. */
const LIGHTS: [number, number, number][] = [
  [0, 0, 0], // strobe
  [-0.2, -0.3, 1], // beacon under the belly
  [0.1, 0, 2], // steady light
]

export function createAir(palette: Palette, atmos: Atmosphere) {
  const n = FLIGHTS.length * LIGHTS.length
  const positions = new Float32Array(n * 3)
  const kinds = new Float32Array(n)
  const phases = new Float32Array(n)
  FLIGHTS.forEach((f, i) =>
    LIGHTS.forEach(([, , kind], k) => {
      kinds[i * LIGHTS.length + k] = kind
      phases[i * LIGHTS.length + k] = f.phase * 7.3
    })
  )
  const geometry = new BufferGeometry()
  const position = new BufferAttribute(positions, 3)
  position.setUsage(DynamicDrawUsage)
  geometry.setAttribute('position', position)
  geometry.setAttribute('aKind', new BufferAttribute(kinds, 1))
  geometry.setAttribute('aPhase', new BufferAttribute(phases, 1))
  const material = new ShaderMaterial({
    uniforms: {
      uTime: atmos.uTime,
      uFogDensity: atmos.uFogDensity,
      uPixelRatio: { value: 1 },
      cWhite: { value: palette.heading },
      cRed: { value: new Color(1, 0.25, 0.2) },
    },
    vertexShader: /* glsl */ `
      attribute float aKind;
      attribute float aPhase;
      uniform float uTime, uPixelRatio;
      varying float vOn;
      varying float vKind;
      varying float vDist;
      void main() {
        vKind = aKind;
        float t = uTime + aPhase;
        if (aKind < 0.5) {
          float f = fract(t / 1.3);
          vOn = step(f, 0.05) + step(0.14, f) * step(f, 0.19);
        } else if (aKind < 1.5) {
          vOn = 0.2 + 0.8 * pow(max(sin(t * 3.2), 0.0), 4.0);
        } else {
          vOn = 0.45;
        }
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vDist = length(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
        gl_PointSize = (aKind < 0.5 ? 7.0 : 4.5) * uPixelRatio * (0.6 + 0.4 * vOn);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uFogDensity;
      uniform vec3 cWhite, cRed;
      varying float vOn;
      varying float vKind;
      varying float vDist;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float f = 1.0 - exp(-pow(vDist * uFogDensity, 1.25));
        vec3 col = vKind > 0.5 && vKind < 1.5 ? cRed : cWhite;
        gl_FragColor = vec4(col * (exp(-r * r * 6.0) * 0.7 + exp(-r * r * 26.0) * 1.4) * vOn * (1.0 - 0.55 * f), 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const points = new Points(geometry, material)
  points.frustumCulled = false

  return {
    points,
    material,
    update(time: number) {
      FLIGHTS.forEach((f, i) => {
        const u = (((time / f.period + f.phase) % 1) + 1) % 1
        const dx = f.to[0] - f.from[0]
        const dz = f.to[2] - f.from[2]
        const len = Math.hypot(dx, dz)
        LIGHTS.forEach(([along, up], k) => {
          const j = (i * LIGHTS.length + k) * 3
          positions[j] = f.from[0] + dx * u + (dx / len) * along
          positions[j + 1] = f.from[1] + (f.to[1] - f.from[1]) * u + up
          positions[j + 2] = f.from[2] + dz * u + (dz / len) * along
        })
      })
      position.needsUpdate = true
    },
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}

import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Points, ShaderMaterial } from 'three'
import type { Atmosphere } from './common'
import type { Palette } from '../palette'

// Red lights on everything tall, for the aircraft: the tops of the towers,
// the bridges' pylons, the mast on Çamlıca. Most pulse together, slowly,
// the way they do over a real city at night; a few burn steady.

export function createBeacons(palette: Palette, atmos: Atmosphere, positions: number[]) {
  const n = positions.length / 3
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  // Every fourth one steady; the rest keep the city's beat.
  geometry.setAttribute('aSteady', new BufferAttribute(new Float32Array(n).map((_, i) => (i % 4 === 3 ? 1 : 0)), 1))
  const material = new ShaderMaterial({
    uniforms: {
      uTime: atmos.uTime,
      uFogDensity: atmos.uFogDensity,
      uPixelRatio: { value: 1 },
      cRed: { value: new Color(1, 0.22, 0.16).lerp(palette.dusk, 0.25) },
    },
    vertexShader: /* glsl */ `
      attribute float aSteady;
      uniform float uPixelRatio, uTime;
      varying float vOn;
      varying float vDist;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vDist = length(cameraPosition - wp.xyz);
        vOn = mix(0.3 + 0.7 * pow(max(sin(uTime * 2.2), 0.0), 2.0), 0.75, aSteady);
        gl_Position = projectionMatrix * viewMatrix * wp;
        gl_PointSize = clamp(560.0 / vDist, 5.5, 11.0) * uPixelRatio * (0.8 + 0.3 * vOn);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uFogDensity;
      uniform vec3 cRed;
      varying float vOn;
      varying float vDist;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float f = 1.0 - exp(-pow(vDist * uFogDensity, 1.25));
        gl_FragColor = vec4(cRed * (exp(-r * r * 6.0) * 1.1 + exp(-r * r * 26.0) * 2.4) * vOn * (1.0 - 0.6 * f), 1.0);
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
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}

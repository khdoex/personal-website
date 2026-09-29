import { AdditiveBlending, Mesh, PlaneGeometry, ShaderMaterial, type Vector3 } from 'three'
import type { Palette } from './palette'

// The sun, far out along the light direction. A billboard rather than a
// point, so the planet hides it fragment by fragment: from the night side
// the core sits behind the limb and only the halo shows around the edge,
// which is the sunrise the page ends on.

export function createSun(palette: Palette, sunDir: Vector3) {
  const material = new ShaderMaterial({
    uniforms: {
      uSize: { value: 26 },
      uIntensity: { value: 0 },
      uBreath: { value: 0 },
      cCore: { value: palette.heading },
      cHalo: { value: palette.sun },
      cDusk: { value: palette.dusk },
    },
    vertexShader: /* glsl */ `
      uniform float uSize;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * uSize;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uIntensity, uBreath;
      uniform vec3 cCore, cHalo, cDusk;
      varying vec2 vUv;
      void main() {
        vec2 c = (vUv - 0.5) * 2.0;
        float r = length(c);
        float core = exp(-r * r * 220.0) * 2.6;
        float halo = exp(-r * 5.5) * 0.6 + exp(-r * r * 2.4) * 0.12;
        float streak = exp(-abs(c.y) * 110.0) * exp(-abs(c.x) * 2.4) * 0.55;
        vec3 col = cCore * core + mix(cDusk, cHalo, 0.45) * halo + cHalo * streak;
        gl_FragColor = vec4(col * uIntensity * (0.94 + 0.1 * uBreath), 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const mesh = new Mesh(new PlaneGeometry(2, 2), material)
  mesh.position.copy(sunDir).multiplyScalar(90)
  mesh.frustumCulled = false

  return {
    mesh,
    update(intensity: number, breath: number) {
      material.uniforms.uIntensity.value = intensity
      material.uniforms.uBreath.value = breath
      mesh.visible = intensity > 0.002
    },
    dispose() {
      mesh.geometry.dispose()
      material.dispose()
    },
  }
}

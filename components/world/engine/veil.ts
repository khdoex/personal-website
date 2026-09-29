import { Mesh, PlaneGeometry, ShaderMaterial, Vector3 } from 'three'
import { noise } from './glsl'
import type { Palette } from './palette'

// Cloud, drawn over everything: what the camera flies through on its way
// down to the city, and on its way up out of it. At full strength it covers
// the whole frame, which is when the world behind it may change.

export function createVeil(palette: Palette) {
  const material = new ShaderMaterial({
    defines: { OCTAVES: 1 },
    uniforms: {
      uVeil: { value: 0 },
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uRush: { value: 0 },
      cCloud: { value: new Vector3() },
      cMoon: { value: palette.sky.clone().lerp(palette.heading, 0.5) },
      cLit: { value: palette.city },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      ${noise}
      uniform float uVeil, uTime, uAspect, uRush;
      uniform vec3 cCloud, cMoon, cLit;
      varying vec2 vUv;
      void main() {
        vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
        float r = length(p);
        // Two banks of cloud at different depths. Each grows from far and
        // small to near and large as the camera flies into it, then gives
        // way to the next: the feeling of passing through.
        float n = 0.0;
        for (int k = 0; k < 2; k++) {
          float depth = fract(uRush * 0.35 + float(k) * 0.5);
          float scale = mix(3.2, 0.7, depth);
          float seen = smoothstep(0.0, 0.3, depth) * smoothstep(1.0, 0.7, depth);
          vec3 q = vec3(p * scale, float(k) * 7.0 + floor(uRush * 0.35 + float(k) * 0.5) * 3.1 + uTime * 0.04);
          n += (snoise(q) * 0.65 + snoise(q * 2.3 + 5.0) * 0.3) * seen;
        }
        float cover = clamp(uVeil * 2.2 - 0.6 + n * 0.5 - r * 0.3 * (1.0 - uVeil), 0.0, 1.0);
        // Moonlit on top, the city's glow underneath.
        vec3 col = mix(cCloud, cMoon, 0.28 + 0.18 * n) + cLit * 0.05 * (1.0 - n);
        col *= 1.0 - 0.15 * r;
        gl_FragColor = vec4(col, cover);
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
  const mesh = new Mesh(new PlaneGeometry(2, 2), material)
  mesh.frustumCulled = false
  mesh.renderOrder = 998
  mesh.visible = false

  return {
    mesh,
    update(time: number, veil: number, rush: number, aspect: number, colour: Vector3) {
      const u = material.uniforms
      u.uVeil.value = veil
      u.uTime.value = time
      u.uRush.value = rush
      u.uAspect.value = aspect
      u.cCloud.value.copy(colour)
      mesh.visible = veil > 0.002
    },
    dispose() {
      mesh.geometry.dispose()
      material.dispose()
    },
  }
}

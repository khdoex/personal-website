import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  Points,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  type Texture,
  type WebGLRenderer,
} from 'three'
import { bakeEquirect } from './bake'
import type { Palette } from './palette'

// The galactic plane: tilted so the band crosses the frame diagonally from
// the default camera, which reads as depth rather than as a stripe.
const GALACTIC_POLE = new Vector3(0.32, 1, 0.46).normalize()

/**
 * The sky behind everything: a nebula baked once into an equirectangular
 * texture, drawn on a sphere that travels with the camera so it always
 * reads as infinitely far away.
 */
export function createBackground(renderer: WebGLRenderer, palette: Palette, size: number, octaves: number) {
  const baked = bakeEquirect(
    renderer,
    size,
    /* glsl */ `
      vec3 pole = normalize(uPole);
      float b = dot(dir, pole);
      float band = exp(-b * b * 7.0);
      float core = exp(-b * b * 34.0);
      float clouds = fbm(dir * 2.2);
      float fine = fbm(dir * 7.5 + 4.0);
      float dust = smoothstep(-0.25, 0.75, clouds + 0.4 * fine);
      vec3 col = mix(uSpace, uGround, 0.35 + 0.5 * band);
      col += uSky * band * dust * 0.075;
      col += uHeading * core * dust * 0.06;
      col += uAurora * pow(max(fbm(dir * 3.1 + 9.0), 0.0), 2.4) * (0.35 + band) * 0.055;
      col += uSun * pow(max(fbm(dir * 2.4 - 5.0), 0.0), 3.0) * 0.05 * (0.3 + band);
      float lanes = smoothstep(0.05, 0.55, fbm(dir * 5.2 + 13.0));
      col = mix(col, uSpace, lanes * core * 0.6);
      color = vec4(col, 1.0);
    `,
    {
      uPole: { value: GALACTIC_POLE },
      uSpace: { value: palette.space },
      uGround: { value: palette.background },
      uSky: { value: palette.sky },
      uHeading: { value: palette.heading },
      uAurora: { value: palette.aurora },
      uSun: { value: palette.sun },
    },
    { octaves, mipmaps: false, hdr: true }
  )

  const material = new ShaderMaterial({
    uniforms: {
      uMap: { value: baked.texture },
      uBrightness: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        // Pinned just inside the far plane, so it sits behind everything
        // without being clipped by it.
        gl_Position = vec4(p.xy, p.w * 0.999999, p.w);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uBrightness;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        vec2 uv = vec2(atan(-d.z, d.x) / 6.28318530718 + 0.5, asin(clamp(d.y, -1.0, 1.0)) / 3.14159265359 + 0.5);
        vec3 col = texture2D(uMap, uv).rgb * uBrightness;
        // Half a step of noise per pixel: the dark gradients would band in
        // eight bits without it.
        float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        col += (n - 0.5) / 255.0;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: BackSide,
    depthWrite: false,
  })
  const mesh = new Mesh(new SphereGeometry(10, 48, 24), material)
  mesh.frustumCulled = false
  mesh.renderOrder = -10

  return {
    mesh,
    material,
    dispose() {
      mesh.geometry.dispose()
      material.dispose()
      baked.dispose()
    },
  }
}

/**
 * Stars. Most are the warm white of the headings; a few carry the palette's
 * sky, sun and leaf, so the night reads as this site's night. Each twinkles
 * on its own clock, and the whole field brightens a little on every breath.
 */
export function createStars(count: number, palette: Palette) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)

  const tints: [Color, number][] = [
    [palette.heading, 0.72],
    [palette.sky, 0.14],
    [palette.sun, 0.1],
    [palette.accent, 0.04],
  ]
  const v = new Vector3()
  const tangent = new Vector3(1, 0, 0).cross(GALACTIC_POLE).normalize()
  const bitangent = new Vector3().crossVectors(GALACTIC_POLE, tangent)

  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.42) {
      // Crowd toward the galactic band.
      const a = Math.random() * Math.PI * 2
      const spread = (Math.random() + Math.random() + Math.random() - 1.5) * 0.28
      v.copy(tangent).multiplyScalar(Math.cos(a))
        .addScaledVector(bitangent, Math.sin(a))
        .addScaledVector(GALACTIC_POLE, spread)
        .normalize()
    } else {
      v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
      if (v.lengthSq() > 1 || v.lengthSq() < 1e-4) {
        i--
        continue
      }
      v.normalize()
    }
    v.multiplyScalar(500)
    positions.set([v.x, v.y, v.z], i * 3)

    let pick = Math.random()
    let tint = tints[0][0]
    for (const [c, w] of tints) {
      if (pick < w) {
        tint = c
        break
      }
      pick -= w
    }
    const lum = 0.55 + Math.random() * 0.45
    colors.set([tint.r * lum, tint.g * lum, tint.b * lum], i * 3)
    sizes[i] = 1.2 + Math.random() ** 8 * 5.5
    phases[i] = Math.random()
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('aColor', new BufferAttribute(colors, 3))
  geometry.setAttribute('aSize', new BufferAttribute(sizes, 1))
  geometry.setAttribute('aPhase', new BufferAttribute(phases, 1))

  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBreath: { value: 0 },
      uPixelRatio: { value: 1 },
      uBrightness: { value: 1 },
      uTwinkle: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform float uBreath;
      uniform float uPixelRatio;
      uniform float uBrightness;
      uniform float uTwinkle;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_Position.z = gl_Position.w * 0.99999; // in front of the sky, behind everything else
        float tw = 0.72 + 0.28 * sin(uTime * (0.5 + aPhase * 2.2) + aPhase * 60.0);
        vAlpha = mix(1.0, tw, uTwinkle) * uBrightness * (0.9 + 0.12 * uBreath);
        vColor = aColor;
        gl_PointSize = aSize * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float glow = exp(-d * d * 5.0);
        float core = smoothstep(0.35, 0.0, d);
        float a = (glow * 0.7 + core * 0.6) * vAlpha;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vColor, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })

  const points = new Points(geometry, material)
  points.frustumCulled = false
  points.renderOrder = -9

  return {
    points,
    material,
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}

export function bakeClouds(renderer: WebGLRenderer, size: number, octaves: number): { texture: Texture; dispose: () => void } {
  // Coverage only, in red. Domain-warped noise gives the swirls; the latitude
  // term thins the subtropics and thickens the storm tracks, the way the real
  // cloud map is organised.
  return bakeEquirect(
    renderer,
    size,
    /* glsl */ `
      vec3 q = dir * 1.8;
      vec3 warp = vec3(fbm(q + 1.3), fbm(q + 7.7), fbm(q - 3.1));
      float c = fbm(dir * 3.6 + warp * 1.6);
      float streak = fbm(vec3(dir.x * 2.0, dir.y * 9.0, dir.z * 2.0) + warp);
      float band = abs(dir.y);
      float belts = 0.18 * cos(band * 10.0) + 0.14 * smoothstep(0.5, 0.8, band) - 0.06;
      float cover = smoothstep(0.02, 0.5, c + 0.35 * streak * 0.5 + belts);
      color = vec4(cover, 0.0, 0.0, 1.0);
    `,
    {},
    { octaves, mipmaps: true, hdr: false }
  )
}

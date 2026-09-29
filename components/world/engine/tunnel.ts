import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Group,
  LineSegments,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  TubeGeometry,
  Vector3,
} from 'three'
import { noise } from './glsl'
import type { Palette } from './palette'
import type { Quality } from './quality'

// The ride in. The camera leaves deep space on a straight line, enters a
// tube and follows it to the exit, where the page is waiting. The tube is the
// loading bar: it holds 100 rings, one per percent, and a ring lights up
// once that much of the world has loaded. The camera may not pass an unlit
// ring, so a slow connection slows the ride rather than freezing it.

export const TUBE_RADIUS = 3.2
/** Length of the straight approach before the mouth, in world units. */
export const APPROACH = 80

const PATH: [number, number, number][] = [
  [0, 0, 0],
  [0, 0, -34],
  [5, 3, -74],
  [14, 8, -114],
  [10, 2, -154],
  [-3, -6, -194],
  [-13, -5, -234],
  [-8, 4, -274],
  [2, 7, -314],
  [5, 2, -354],
  [0, 0, -394],
  [0, 0, -420],
]

export function createTunnel(palette: Palette, quality: Quality) {
  const curve = new CatmullRomCurve3(PATH.map((p) => new Vector3(...p)), false, 'centripetal')
  const length = curve.getLength()
  const group = new Group()

  const tubeMaterial = new ShaderMaterial({
    defines: { OCTAVES: 2 },
    uniforms: {
      uTime: { value: 0 },
      uLoaded: { value: 0 },
      uFade: { value: 1 },
      cA: { value: palette.sky },
      cB: { value: palette.accent },
      cC: { value: palette.sun },
      cWhite: { value: palette.heading },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      ${noise}
      uniform float uTime;
      uniform float uLoaded;
      uniform float uFade;
      uniform vec3 cA, cB, cC, cWhite;
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        float u = vUv.x;
        float v = vUv.y;

        // One ring per percent. Each is broken into ticks, like a gauge.
        float rc = u * 100.0;
        float ringIndex = floor(rc);
        float ring = exp(-pow((fract(rc) - 0.5) * 20.0, 2.0));
        ring *= step(0.14, fract(v * 24.0 + ringIndex * 0.37));
        float loaded = step(ringIndex + 1.0, uLoaded * 100.0 + 0.001);

        // Filaments running the length of the tube, and dashes of light
        // streaming along them toward the camera.
        float fil = pow(0.5 + 0.5 * sin(v * 6.2831 * 14.0 + sin(u * 31.0 + uTime * 0.7) * 0.9), 22.0);
        float lane = floor(v * 14.0);
        float flow = fract(u * 90.0 + uTime * (1.1 + hash11(lane) * 0.9) + hash11(lane + 7.0));
        float dash = smoothstep(0.0, 0.1, flow) * smoothstep(0.7, 0.1, flow);
        float haze = 0.5 + 0.5 * snoise(vec3(u * 40.0, v * 6.0, uTime * 0.3));

        vec3 grad = u < 0.5 ? mix(cA, cB, u * 2.0) : mix(cB, cC, u * 2.0 - 1.0);
        vec3 col = grad * (fil * dash * 1.5 + 0.035 + 0.035 * haze);
        col += mix(grad * 0.14, mix(grad, cWhite, 0.4) * 1.3, loaded) * ring;

        // Rings right beside the camera would fill the screen with glare;
        // they fade in over the first few metres ahead instead.
        float near = smoothstep(1.2, 10.0, vDepth);
        float far = 1.0 - smoothstep(55.0, 150.0, vDepth);
        gl_FragColor = vec4(col * near * far * uFade, 1.0);
      }
    `,
    side: BackSide,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const tube = new Mesh(
    new TubeGeometry(curve, quality.tubeSegments, TUBE_RADIUS, quality.tubeRadial, false),
    tubeMaterial
  )
  tube.frustumCulled = false
  group.add(tube)

  // Streaks: short lines parked along the tube that the camera tears past.
  const streakCount = quality.tier === 'low' ? 700 : 1500
  const frames = curve.computeFrenetFrames(400, false)
  const positions = new Float32Array(streakCount * 6)
  const colors = new Float32Array(streakCount * 8)
  const p = new Vector3()
  const off = new Vector3()
  for (let i = 0; i < streakCount; i++) {
    const u = 0.02 + Math.random() * 0.96
    const k = Math.min(399, Math.round(u * 399))
    const a = Math.random() * Math.PI * 2
    const r = TUBE_RADIUS * (0.3 + Math.random() * 0.6)
    curve.getPointAt(u, p)
    off.copy(frames.normals[k]).multiplyScalar(Math.cos(a) * r).addScaledVector(frames.binormals[k], Math.sin(a) * r)
    p.add(off)
    const len = 1.5 + Math.random() * 4
    positions.set([p.x, p.y, p.z], i * 6)
    p.addScaledVector(frames.tangents[k], len)
    positions.set([p.x, p.y, p.z], i * 6 + 3)
    const c = u < 0.5 ? palette.sky.clone().lerp(palette.accent, u * 2) : palette.accent.clone().lerp(palette.sun, u * 2 - 1)
    c.lerp(palette.heading, Math.random() * 0.5)
    // The tail fades to nothing, the head carries the colour.
    colors.set([c.r, c.g, c.b, 1, c.r, c.g, c.b, 0], i * 8)
  }
  const streakGeometry = new BufferGeometry()
  streakGeometry.setAttribute('position', new BufferAttribute(positions, 3))
  streakGeometry.setAttribute('aColor', new BufferAttribute(colors, 4))
  const streakMaterial = new ShaderMaterial({
    uniforms: { uFade: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec4 aColor;
      varying vec4 vColor;
      varying float vDepth;
      void main() {
        vColor = aColor;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uFade;
      varying vec4 vColor;
      varying float vDepth;
      void main() {
        float near = smoothstep(0.5, 4.0, vDepth);
        float far = 1.0 - smoothstep(40.0, 110.0, vDepth);
        gl_FragColor = vec4(vColor.rgb, vColor.a * near * far * uFade);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const streaks = new LineSegments(streakGeometry, streakMaterial)
  streaks.frustumCulled = false
  group.add(streaks)

  // The mouth: a ring of ticks turning slowly, seen from deep space.
  const mouthMaterial = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uFade: { value: 1 },
      cRing: { value: palette.accent },
      cTick: { value: palette.sun },
      cCore: { value: palette.sky },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uFade;
      uniform vec3 cRing, cTick, cCore;
      varying vec2 vUv;
      void main() {
        vec2 c = (vUv - 0.5) * 2.0;
        float r = length(c);
        float a = atan(c.y, c.x) / 6.2831853 + 0.5;
        float ring = exp(-pow((r - 0.62) * 34.0, 2.0));
        float ticks = step(0.55, fract(a * 60.0 + uTime * 0.15)) * exp(-pow((r - 0.7) * 40.0, 2.0));
        float outer = exp(-pow((r - 0.8) * 60.0, 2.0)) * step(0.5, fract(a * 6.0 - uTime * 0.05));
        float core = exp(-r * r * 6.0) * 0.18;
        vec3 col = cRing * ring * 1.2 + cTick * ticks * 0.9 + cRing * outer * 0.6 + cCore * core;
        gl_FragColor = vec4(col * uFade, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const mouth = new Mesh(new PlaneGeometry(TUBE_RADIUS * 3.2, TUBE_RADIUS * 3.2), mouthMaterial)
  const start = curve.getPointAt(0)
  mouth.position.copy(start)
  mouth.lookAt(start.clone().sub(curve.getTangentAt(0)))
  group.add(mouth)

  // The exit: light at the end of the tube that swells as the camera nears.
  const exitMaterial = new ShaderMaterial({
    uniforms: {
      uIntensity: { value: 0 },
      cCore: { value: palette.heading },
      cHalo: { value: palette.sun },
    },
    vertexShader: mouthMaterial.vertexShader,
    fragmentShader: /* glsl */ `
      uniform float uIntensity;
      uniform vec3 cCore, cHalo;
      varying vec2 vUv;
      void main() {
        float r = length((vUv - 0.5) * 2.0);
        vec3 col = cCore * exp(-r * r * 9.0) * 1.4 + cHalo * exp(-r * 3.0) * 0.8;
        gl_FragColor = vec4(col * uIntensity, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const exit = new Mesh(new PlaneGeometry(TUBE_RADIUS * 4, TUBE_RADIUS * 4), exitMaterial)
  const end = curve.getPointAt(0.995)
  exit.position.copy(end)
  exit.lookAt(end.clone().sub(curve.getTangentAt(1)))
  group.add(exit)

  const tangent = new Vector3()

  return {
    group,
    curve,
    length,
    /**
     * Where the camera is and where it looks, for a distance s travelled
     * from the start of the approach. Returns the fraction of the tube done.
     */
    pose(s: number, position: Vector3, target: Vector3): number {
      if (s < APPROACH) {
        curve.getTangentAt(0, tangent)
        position.copy(start).addScaledVector(tangent, s - APPROACH)
        position.y += (1 - s / APPROACH) * 3.5
        target.copy(start).addScaledVector(tangent, 6)
        return 0
      }
      const u = Math.min(1, (s - APPROACH) / length)
      curve.getPointAt(u, position)
      curve.getPointAt(Math.min(1, u + 0.014), target)
      if (u > 0.985) target.addScaledVector(curve.getTangentAt(1, tangent), 4)
      return u
    },
    update(time: number, loaded: number, u: number, fade: number) {
      tubeMaterial.uniforms.uTime.value = time
      tubeMaterial.uniforms.uLoaded.value = loaded
      tubeMaterial.uniforms.uFade.value = fade
      streakMaterial.uniforms.uFade.value = fade
      mouthMaterial.uniforms.uTime.value = time
      mouthMaterial.uniforms.uFade.value = fade
      exitMaterial.uniforms.uIntensity.value = fade * Math.max(0, (u - 0.7) / 0.3) ** 2 * 2.2
    },
    dispose() {
      group.traverse((o) => {
        const m = o as Mesh
        if (m.geometry) m.geometry.dispose()
        if (m.material) (m.material as ShaderMaterial).dispose()
      })
    },
  }
}

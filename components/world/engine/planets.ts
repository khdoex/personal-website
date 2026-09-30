import {
  DoubleSide,
  Group,
  Mesh,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three'
import { noise } from './glsl'
import type { Palette } from './palette'

// The two bodies the camera passes before the tube: a ringed gas giant in
// the sun's golds on the left, a small cold moon on the right. They only
// exist for the first two seconds of the ride, so they are cheap on purpose.

const LIGHT = new Vector3(-0.55, 0.45, 0.7).normalize()

const lit = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vObj = position;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

export interface GiantOptions {
  radius: number
  light: Vector3
  segments: number
  octaves: number
}

/**
 * A ringed gas giant in the sun's golds, with the Cassini gap and the
 * planet's shadow laid across the rings. The intro passes one on the way to
 * the tube; the resume's physics scene has another as its Saturn.
 */
export function createGiant(palette: Palette, { radius, light, segments, octaves }: GiantOptions) {
  const giant = new Mesh(
    new SphereGeometry(radius, segments, segments / 2),
    new ShaderMaterial({
      defines: { OCTAVES: Math.min(octaves, 4) },
      uniforms: {
        uLight: { value: light },
        uTime: { value: 0 },
        cCream: { value: palette.heading },
        cGold: { value: palette.sun },
        cOchre: { value: palette.arid },
        cStorm: { value: palette.dusk },
        cNight: { value: palette.oceanDeep },
      },
      vertexShader: lit,
      fragmentShader: /* glsl */ `
        ${noise}
        uniform vec3 uLight;
        uniform float uTime;
        uniform vec3 cCream, cGold, cOchre, cStorm, cNight;
        varying vec3 vObj;
        varying vec3 vNormalW;
        varying vec3 vPosW;
        void main() {
          vec3 n = normalize(vObj);
          // Bands first, turbulence second: latitude carries the pattern,
          // a little noise only frays the edges between bands.
          float turb = fbm(vec3(n.x * 1.6, n.y * 5.0, n.z * 1.6 + uTime * 0.02)) * 0.07;
          float lat = n.y + turb;
          float bands = smoothstep(0.25, 0.75, 0.5 + 0.5 * sin(lat * 19.0));
          float fine = 0.5 + 0.5 * sin(lat * 57.0 + 1.3 + turb * 20.0);
          vec3 col = mix(cOchre, cCream, bands);
          col = mix(col, cGold, fine * 0.28);
          col = mix(col, cOchre * 0.8, smoothstep(0.75, 0.95, abs(n.y)) * 0.6);
          float spot = smoothstep(0.2, 0.0, length(vec2(atan(n.z, n.x) - 0.9, (n.y + 0.28) * 2.6)));
          col = mix(col, cStorm, spot * 0.75);
          vec3 N = normalize(vNormalW);
          vec3 V = normalize(cameraPosition - vPosW);
          float ndl = dot(N, uLight);
          float day = smoothstep(-0.1, 0.55, ndl);
          col = mix(cNight * 0.5, col * (0.35 + 0.75 * max(ndl, 0.0)), day);
          col += cCream * pow(1.0 - max(dot(N, V), 0.0), 4.0) * 0.35 * day;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  )

  const inner = radius * 1.35
  const outer = radius * 2.25
  const ringMaterial = new ShaderMaterial({
    uniforms: {
      uInner: { value: inner },
      uOuter: { value: outer },
      uRadius: { value: radius },
      uLight: { value: light },
      uCenter: { value: new Vector3() },
      cCream: { value: palette.heading },
      cOchre: { value: palette.arid },
    },
    vertexShader: lit,
    fragmentShader: /* glsl */ `
      uniform float uInner, uOuter, uRadius;
      uniform vec3 uLight;
      uniform vec3 uCenter;
      uniform vec3 cCream, cOchre;
      varying vec3 vObj;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      void main() {
        float t = (length(vObj.xy) - uInner) / (uOuter - uInner);
        float bands = 0.5 + 0.5 * sin(t * 95.0) * sin(t * 23.0 + 1.0);
        float gap = smoothstep(0.55, 0.57, t) * (1.0 - smoothstep(0.62, 0.64, t));
        float edge = smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.9, 1.0, t));
        float alpha = (0.3 + 0.7 * bands) * edge * (1.0 - 0.92 * gap) * 0.75;
        // The planet's shadow falls across the rings on the far side.
        vec3 p = vPosW - uCenter;
        float along = dot(p, uLight);
        float off = length(p - along * uLight);
        float shadow = along < 0.0 ? smoothstep(uRadius * 0.92, uRadius * 1.05, off) : 1.0;
        vec3 col = mix(cOchre, cCream, bands) * (0.25 + 0.75 * shadow);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  })
  const rings = new Mesh(new RingGeometry(inner, outer, 192, 1), ringMaterial)
  rings.rotation.set(-1.18, 0.32, 0.18)
  giant.add(rings)

  return {
    mesh: giant,
    /** The rings, whose plane anything orbiting the planet keeps to. */
    rings,
    update(time: number, spin = 0.02) {
      ;(giant.material as ShaderMaterial).uniforms.uTime.value = time
      giant.rotation.y = 0.6 + time * spin
      giant.getWorldPosition(ringMaterial.uniforms.uCenter.value)
    },
  }
}

export function createPlanets(palette: Palette, octaves: number, segments: number) {
  const group = new Group()

  const giant = createGiant(palette, { radius: 9, light: LIGHT, segments, octaves })
  giant.mesh.position.set(-27, 7, 6)
  giant.mesh.rotation.set(0.25, 0.6, -0.35)
  group.add(giant.mesh)

  const moon = new Mesh(
    new SphereGeometry(1.6, 48, 24),
    new ShaderMaterial({
      defines: { OCTAVES: Math.min(octaves, 4) },
      uniforms: {
        uLight: { value: LIGHT },
        cLight: { value: palette.muted },
        cCold: { value: palette.sky },
        cNight: { value: palette.oceanDeep },
      },
      vertexShader: lit,
      fragmentShader: /* glsl */ `
        ${noise}
        uniform vec3 uLight;
        uniform vec3 cLight, cCold, cNight;
        varying vec3 vObj;
        varying vec3 vNormalW;
        varying vec3 vPosW;
        void main() {
          vec3 n = normalize(vObj);
          float craters = fbm(n * 5.0);
          vec3 col = mix(cLight, cCold, 0.35 + 0.4 * craters);
          float ndl = dot(normalize(vNormalW), uLight);
          col = mix(cNight * 0.4, col * (0.25 + 0.8 * max(ndl, 0.0)), smoothstep(-0.05, 0.4, ndl));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  )
  moon.position.set(15, -6, 26)
  group.add(moon)

  return {
    group,
    update(time: number) {
      giant.update(time)
      moon.rotation.y = time * 0.05
    },
    dispose() {
      group.traverse((o) => {
        const m = o as Mesh
        if (m.isMesh) {
          m.geometry.dispose()
          ;(m.material as ShaderMaterial).dispose()
        }
      })
    },
  }
}

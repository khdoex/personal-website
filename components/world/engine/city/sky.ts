import {
  AdditiveBlending,
  BackSide,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  type Camera,
  type Object3D,
} from 'three'
import { airGLSL, type Atmosphere } from './common'
import { noise } from '../glsl'
import type { Palette } from '../palette'

// The sky over the city: a gold band where the sun has just set, deep blue
// overhead, the city's own warm haze low all round, long clouds lit from
// underneath, and a crescent moon. At dawn the glow moves to the east. At
// the horizon it is exactly the colour of the fog, so the ground's far
// edges melt into it. Climb above the cloud and it gives way to space.

/** Keeps an object centred on whichever camera is drawing it, the reflection's included. */
export function followCamera(object: Object3D, offset?: Vector3) {
  object.onBeforeRender = (_renderer, _scene, camera: Camera) => {
    object.position.copy(camera.position)
    if (offset) object.position.add(offset)
    object.updateMatrixWorld()
  }
}

export function createCitySky(palette: Palette, atmos: Atmosphere, clouds = true) {
  const material = new ShaderMaterial({
    defines: { OCTAVES: 3, CLOUDS: clouds ? 1 : 0 },
    uniforms: {
      ...atmos,
      uSpace: { value: 0 },
      cSpace: { value: palette.space },
      cNavy: { value: palette.background },
      cOcean: { value: palette.ocean },
      cSky: { value: palette.sky },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.999998, p.w);
      }
    `,
    fragmentShader: /* glsl */ `
      ${noise}
      ${airGLSL}
      uniform float uTime, uSpace;
      uniform vec3 cSpace, cNavy, cOcean, cSky;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        float up = max(h, 0.0);
        vec3 horizon = air(d);
        // Night: space-dark overhead, a deep blue lower down. Toward dawn
        // the whole dome lifts toward the palette's sky blue.
        vec3 zenith = mix(mix(cSpace, cNavy, 0.55), mix(cOcean, cSky, 0.12), uDawn);
        vec3 upper = mix(mix(cNavy, cOcean, 0.62), mix(cOcean, cSky, 0.3), uDawn);
        vec3 col = mix(uFogColor, upper, smoothstep(0.0, 0.25, up));
        col = mix(col, zenith, smoothstep(0.25, 0.95, up));
        // The glows hug the horizon: what air() adds there fades going up.
        col = max(col + (horizon - uFogColor) * exp(-up * 9.0), 0.0);

        // Long low clouds, lit from underneath by the city and the glow.
        #if CLOUDS
        vec2 cp = d.xz / max(h + 0.1, 0.04);
        float n = snoise(vec3(cp * vec2(0.55, 1.9), uTime * 0.008)) * 0.6 + snoise(vec3(cp * vec2(1.3, 4.0), 3.0 + uTime * 0.01)) * 0.4;
        float band = smoothstep(0.02, 0.1, h) * (1.0 - smoothstep(0.3, 0.55, h));
        float clouds = smoothstep(0.25, 0.8, n) * band;
        vec3 under = mix(mix(upper, cHaze, 0.12), horizon, 0.55);
        col = mix(col, under, clouds * 0.45);
        #endif

        // The sun itself at dawn, just clear of the hills over Asia.
        vec3 sunDir = normalize(uEast + vec3(0.0, 0.012, 0.0));
        float toSun = max(dot(d, sunDir), 0.0);
        col += (cSunset * smoothstep(0.99985, 0.99992, toSun) * 1.4 + mix(cGlow, cSunset, 0.5) * pow(toSun, 160.0) * 0.3) * uDawn * uDawn;

        // Below the horizon it is the air itself.
        col = mix(col, horizon, step(h, 0.0));
        gl_FragColor = vec4(col, 1.0 - uSpace);
      }
    `,
    side: BackSide,
    transparent: true,
    depthWrite: false,
  })
  const dome = new Mesh(new SphereGeometry(10, 48, 24), material)
  dome.frustumCulled = false
  dome.renderOrder = -9.5
  followCamera(dome)

  // A young crescent moon, low in the west, following the sun down.
  const moonDir = new Vector3(-0.993, 0.25, -0.122).normalize()
  const moonMaterial = new ShaderMaterial({
    uniforms: { uOpacity: { value: 1 }, cMoon: { value: palette.heading }, cGlow: { value: palette.sky } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * 38.0;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      uniform vec3 cMoon, cGlow;
      varying vec2 vUv;
      void main() {
        vec2 c = (vUv - 0.5) * 2.0;
        float r = length(c);
        float disk = smoothstep(0.2, 0.19, r);
        float bite = smoothstep(0.19, 0.17, length(c - vec2(0.085, 0.045)));
        float crescent = disk * (1.0 - bite);
        float glow = exp(-r * 5.0) * 0.4 + exp(-r * r * 30.0) * 0.25;
        vec3 col = cMoon * crescent * 1.1 + mix(cGlow, cMoon, 0.5) * glow * 0.5;
        gl_FragColor = vec4(col * uOpacity, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const moon = new Mesh(new PlaneGeometry(2, 2), moonMaterial)
  moon.frustumCulled = false
  moon.renderOrder = -8
  followCamera(moon, moonDir.clone().multiplyScalar(900))

  const fogNight = palette.ocean.clone().lerp(palette.atmosphere, 0.2).lerp(palette.background, 0.38)
  const fogMorning = palette.ocean.clone().lerp(palette.sky, 0.42).lerp(palette.dusk, 0.12)
  const fogScratch = fogNight.clone()

  return {
    dome,
    moon,
    material,
    update(space: number, dawn: number) {
      material.uniforms.uSpace.value = space
      dome.visible = space < 0.999
      moonMaterial.uniforms.uOpacity.value = (1 - dawn * 0.8) * (1 - space)
      moon.visible = space < 0.999
    },
    /** The plain colour of the air at the horizon, for the fog, at an hour. */
    fogColor(dawn: number, out: Vector3) {
      const c = fogScratch.copy(fogNight).lerp(fogMorning, dawn)
      return out.set(c.r, c.g, c.b)
    },
    dispose() {
      dome.geometry.dispose()
      material.dispose()
      moon.geometry.dispose()
      moonMaterial.dispose()
    },
  }
}

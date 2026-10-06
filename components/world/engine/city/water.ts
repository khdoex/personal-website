import {
  type Camera,
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  RedFormat,
  ShaderMaterial,
  UnsignedByteType,
  Vector3,
  Vector4,
} from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { ABOVE_ONLY, fogGLSL, type Atmosphere } from './common'
import { MOON_DIR } from './sky'
import type { Palette } from '../palette'

// The Bosphorus: a mirror of everything above it, broken up by waves. The
// strait runs south, fastest in the middle, and carries its ripples with it;
// the waves bend each light on the far shore into the long streak lit water
// makes at night; the moon lays a path of glints toward itself; and all along
// the shores the water laps in a thin line of foam.

/** How far each point of a rectangle is from the waterline, baked once. */
export interface ShoreMap {
  texture: DataTexture
  /** x0, z0, 1 / width, 1 / depth, in the place's own frame. */
  rect: Vector4
}

const SHORE_RANGE = 40

/**
 * Bakes a signed distance to land (positive on land) into a small texture
 * the water reads its shoreline from. offset moves the line to where the
 * ground actually meets the water.
 */
export function bakeShore(
  sdf: (x: number, z: number) => number,
  [x0, z0, x1, z1]: [number, number, number, number],
  [w, h]: [number, number],
  offset = 0
): ShoreMap {
  const data = new Uint8Array(w * h)
  for (let j = 0; j < h; j++) {
    const z = z0 + ((j + 0.5) / h) * (z1 - z0)
    for (let i = 0; i < w; i++) {
      const x = x0 + ((i + 0.5) / w) * (x1 - x0)
      const d = (sdf(x, z) - offset) / (2 * SHORE_RANGE) + 0.5
      data[j * w + i] = Math.round(Math.min(1, Math.max(0, d)) * 255)
    }
  }
  const texture = new DataTexture(data, w, h, RedFormat, UnsignedByteType)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.needsUpdate = true
  return { texture, rect: new Vector4(x0, z0, 1 / (x1 - x0), 1 / (z1 - z0)) }
}

export interface WaterOptions {
  /** The place's origin in world space, so the water can use the place's own frame. */
  origin: Vector3
  shore?: ShoreMap
  /** 1 where the strait runs; 0 for still water. */
  current?: number
  /** How many times the mirror is read per pixel to blur it where the waves are too fine to draw. */
  taps?: number
}

const seaUniforms = (palette: Palette, atmos: Atmosphere, options: WaterOptions) => ({
  ...atmos,
  cDeep: { value: palette.oceanDeep },
  cShallow: { value: palette.ocean },
  cMoon: { value: palette.heading },
  cFoam: { value: palette.heading.clone().lerp(palette.city, 0.45) },
  cSky: { value: palette.sky },
  uOrigin: { value: options.origin.clone() },
  uMoonDir: { value: MOON_DIR.clone() },
  tShore: { value: options.shore?.texture ?? null },
  uShoreRect: { value: options.shore?.rect.clone() ?? new Vector4() },
  uHasShore: { value: options.shore ? 1 : 0 },
  uCurrent: { value: options.current ?? 0 },
})

/** The sea's motion, shared by the mirrored and the plain water. */
const seaGLSL = /* glsl */ `
  uniform sampler2D tShore;
  uniform vec4 uShoreRect;
  uniform float uHasShore, uCurrent;
  uniform vec3 uOrigin, uMoonDir;

  // Metres (well, units) from the waterline: negative out on the water.
  float shoreDistance(vec2 p) {
    if (uHasShore < 0.5) return -${SHORE_RANGE.toFixed(1)};
    vec2 uv = (p - uShoreRect.xy) * uShoreRect.zw;
    vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
    float v = texture2D(tShore, clamp(uv, 0.0, 1.0)).r;
    return mix(-${SHORE_RANGE.toFixed(1)}, (v - 0.5) * ${(2 * SHORE_RANGE).toFixed(1)}, inside.x * inside.y);
  }

  // The current: south down the strait, fastest in the middle of it, and a
  // slow drift everywhere else.
  vec2 flowAt(vec2 p, float d) {
    float strait = smoothstep(18.0, 40.0, p.x) * smoothstep(118.0, 94.0, p.x) * smoothstep(70.0, 10.0, p.y) * uCurrent;
    float middle = smoothstep(0.0, 16.0, -d);
    return vec2(0.05, 1.0) * strait * (0.3 + 0.9 * middle) + vec2(-0.3, 0.14) * (1.0 - strait) * 0.3;
  }

  // How much of a train of frequency k a pixel can still show, px being how
  // much water one pixel covers. A wave shorter than a few pixels fades out
  // before it can alias into moiré; far off, and at a glancing angle, only
  // the long waves are left.
  float keep(float k, float px) {
    return 1.0 - smoothstep(0.6, 1.8, k * px);
  }

  // The slope the trains a pixel cannot show would have added, squared, on
  // average: the water is still that rough, only finer than the eye can
  // follow, and the mirror blurs by as much.
  float lostSlope;

  // One train of waves: its slope, for a direction, a frequency, a speed,
  // a height; what of it the pixel cannot show goes into lostSlope.
  vec2 train(vec2 q, vec2 dir, float k, float w, float a, float t, float px) {
    float c = keep(k, px);
    lostSlope += k * k * a * a * (1.0 - c * c) * 0.5;
    return dir * (k * a * c * cos(dot(q, dir) * k - t * w));
  }

  // Waves from several directions at once, carried along by the current, and
  // a long swell under them.
  vec2 seaSlope(vec2 p, vec2 flow, float t, float px) {
    lostSlope = 0.0;
    vec2 q = p - flow * t * 1.6;
    q += 0.9 * vec2(sin(q.y * 0.13 + t * 0.21), cos(q.x * 0.11 - t * 0.17));
    vec2 g = vec2(0.0);
    g += train(q, vec2(0.83, 0.55), 0.55, 0.9, 1.0, t, px);
    g += train(q, vec2(-0.45, 0.89), 0.9, 1.25, 0.75, t, px);
    g += train(q, vec2(0.2, -0.98), 1.6, 1.8, 0.5, t, px);
    g += train(q, vec2(0.97, 0.24), 2.7, 2.5, 0.36, t, px);
    g += train(q, vec2(-0.71, -0.7), 4.3, 3.3, 0.24, t, px);
    g += train(q, vec2(0.37, 0.93), 6.9, 4.3, 0.15, t, px);
    g += train(p, vec2(-0.6, 0.8), 0.16, 0.45, 1.6, t, px);
    return g;
  }

  // The moon's glints. Where the waves are too fine to draw, their glints
  // are still there, too many to count: the path goes on as a soft band.
  float moonGlint(vec3 R, float px) {
    float rough = smoothstep(0.04, 0.5, px);
    return pow(max(dot(R, uMoonDir), 0.0), mix(380.0, 40.0, rough)) * mix(0.85, 0.24, rough);
  }

  // Foam lapping at the shore: a line at the water's edge, and fainter ones
  // rolling in toward it.
  float foamAt(vec2 p, float d, float t, float px) {
    float wobble = sin(p.x * 0.31 + p.y * 0.23) * 1.5 + sin(p.x * 0.07 - p.y * 0.11 + t * 0.3) * 1.2;
    // (Rolling lines finer than a pixel show as what they add up to.)
    float lap = mix(pow(0.5 + 0.5 * sin(-d * 2.4 + t * 1.3 + wobble), 4.0), 0.27, smoothstep(0.25, 1.0, px * 2.4));
    float band = smoothstep(-2.8, -0.4, d) * (1.0 - smoothstep(-0.1, 0.4, d));
    float edge = smoothstep(-0.9, -0.1, d) * (1.0 - smoothstep(0.0, 0.5, d));
    return band * lap * 0.6 + edge * (0.6 + 0.4 * sin(t * 0.8 + wobble));
  }
`

export function createWater(
  palette: Palette,
  atmos: Atmosphere,
  size: number,
  textureWidth: number,
  textureHeight: number,
  reflect: boolean,
  options: WaterOptions
) {
  if (!reflect) return createPlainWater(palette, atmos, size, options)
  const shader = {
    name: 'Bosphorus',
    uniforms: {
      color: { value: null },
      tDiffuse: { value: null },
      textureMatrix: { value: null },
      ...seaUniforms(palette, atmos, options),
    },
    vertexShader: /* glsl */ `
      uniform mat4 textureMatrix;
      varying vec4 vUv;
      varying vec3 vPosW;
      void main() {
        vUv = textureMatrix * vec4(position, 1.0);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogGLSL}
      ${seaGLSL}
      const int TAPS = ${Math.max(1, Math.round(options.taps ?? 6))};
      uniform sampler2D tDiffuse;
      uniform float uTime, uLights;
      uniform vec3 cDeep, cShallow, cMoon, cFoam, cSky;
      varying vec4 vUv;
      varying vec3 vPosW;
      void main() {
        vec3 toCam = cameraPosition - vPosW;
        float dist = length(toCam);
        vec3 V = toCam / dist;
        vec2 p = vPosW.xz - uOrigin.xz;
        float t = uTime;
        // How much water one pixel covers, the long way.
        float px = max(length(dFdx(p)), length(dFdy(p)));
        float d = shoreDistance(p);
        vec2 flow = flowAt(p, d);
        vec2 g = seaSlope(p, flow, t, px);
        // The waves bend the mirror, a little across the screen and more up
        // and down, which draws each light into the long streak lit water
        // makes; in the camera's own frame, whichever way it faces.
        float calm = 1.0 / (1.0 + dist * 0.012);
        vec3 tilt = mat3(viewMatrix) * vec3(-g.x, 0.0, -g.y);
        vec4 uv = vUv;
        uv.x += tilt.x * 0.0035 * calm * uv.w;
        uv.y += tilt.z * 0.011 * calm * uv.w;
        // The waves too fine to draw still roughen the mirror: blur it up and
        // down by as much, the way far lights on water stretch into streaks.
        // The taps start at a different place in every pixel, so the blur
        // reads as water rather than as copies.
        float spread = sqrt(lostSlope) * 0.022;
        float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
        vec3 refl = vec3(0.0);
        for (int i = 0; i < TAPS; i++) {
          vec4 tap = uv;
          tap.y += ((float(i) + jitter) / float(TAPS) - 0.5) * 2.0 * spread * uv.w;
          refl += texture2DProj(tDiffuse, tap).rgb;
        }
        refl /= float(TAPS);
        // More mirror at a glancing angle, more deep water looking down.
        float fres = 0.28 + 0.72 * pow(1.0 - max(V.y, 0.0), 5.0);
        vec3 deep = mix(cDeep * 0.55, cShallow * 0.5, uDawn * 0.6);
        vec3 col = mix(deep, refl * 0.92, fres);
        // The moon's path: glints wherever a wave turns it toward the eye.
        vec3 N = normalize(vec3(-g.x * 0.09 * calm, 1.0, -g.y * 0.09 * calm));
        vec3 R = reflect(-V, N);
        col += cMoon * moonGlint(R, px) * (1.0 - uDawn * 0.8);
        // Lines the current draws down the middle of the strait, where they
        // are still wider than a pixel.
        float along = p.y * 0.05 + sin(p.x * 0.35 + p.y * 0.02) * 0.6 - t * length(flow) * 0.1;
        float lines = pow(0.5 + 0.5 * sin(p.x * 1.7 + sin(along * 3.0) * 2.0), 12.0) * (1.0 - smoothstep(0.06, 0.25, px));
        col += cSky * 0.018 * lines * length(flow);
        col += cFoam * foamAt(p, d, t, px) * (0.06 + 0.14 * uLights);
        gl_FragColor = vec4(fogSky(col, vPosW), 1.0);
      }
    `,
  }

  const water = new Reflector(new PlaneGeometry(size, size), {
    shader,
    textureWidth,
    textureHeight,
    clipBias: 0.003,
    multisample: 0,
  })
  water.rotation.x = -Math.PI / 2
  water.frustumCulled = false
  const material = water.material as ShaderMaterial

  return {
    mesh: water,
    /** The reflector copies its uniforms, so the shared air is handed over by hand. */
    sync() {
      const u = material.uniforms
      u.uTime.value = atmos.uTime.value
      u.uLights.value = atmos.uLights.value
      u.uFogColor.value.copy(atmos.uFogColor.value)
      u.uFogDensity.value = atmos.uFogDensity.value
      u.uDawn.value = atmos.uDawn.value
      u.uDusk.value = atmos.uDusk.value
    },
    resize(width: number, height: number) {
      water.getRenderTarget().setSize(Math.max(64, Math.round(width)), Math.max(64, Math.round(height)))
    },
    /** The mirror leaves out what it would never show (see ABOVE_ONLY), for this camera. */
    watch(camera: Camera) {
      water.getReflectionCamera(camera).layers.disable(ABOVE_ONLY)
    },
    dispose() {
      water.geometry.dispose()
      water.dispose()
      options.shore?.texture.dispose()
    },
  }
}

/**
 * Water without the mirror, for devices that cannot afford drawing the city
 * twice: the sky it would reflect, worked out from the angle, the same waves,
 * the moon's glints and the foam.
 */
function createPlainWater(palette: Palette, atmos: Atmosphere, size: number, options: WaterOptions) {
  const material = new ShaderMaterial({
    uniforms: { ...seaUniforms(palette, atmos, options), cLit: { value: palette.city } },
    vertexShader: /* glsl */ `
      varying vec3 vPosW;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      ${fogGLSL}
      ${seaGLSL}
      uniform float uTime, uLights;
      uniform vec3 cDeep, cShallow, cLit, cMoon, cFoam;
      varying vec3 vPosW;
      void main() {
        vec3 toCam = cameraPosition - vPosW;
        float dist = length(toCam);
        vec3 V = toCam / dist;
        vec2 p = vPosW.xz - uOrigin.xz;
        float px = max(length(dFdx(p)), length(dFdy(p)));
        float d = shoreDistance(p);
        vec2 g = seaSlope(p, flowAt(p, d), uTime, px);
        float calm = 1.0 / (1.0 + dist * 0.012);
        vec3 N = normalize(vec3(-g.x * 0.09 * calm, 1.0, -g.y * 0.09 * calm));
        vec3 R = reflect(-V, N);
        vec3 sky = mix(air(R), uFogColor * 0.55, smoothstep(0.0, 0.35, R.y));
        float fres = 0.28 + 0.72 * pow(1.0 - max(V.y, 0.0), 5.0);
        vec3 deep = mix(cDeep * 0.55, cShallow * 0.5, uDawn * 0.6);
        vec3 col = mix(deep, sky, fres) + cLit * 0.03 * (0.5 + 0.5 * g.x) * uLights;
        col += cMoon * moonGlint(R, px) * (1.0 - uDawn * 0.8);
        col += cFoam * foamAt(p, d, uTime, px) * (0.06 + 0.14 * uLights);
        gl_FragColor = vec4(fogSky(col, vPosW), 1.0);
      }
    `,
  })
  const mesh = new Mesh(new PlaneGeometry(size, size), material)
  mesh.rotation.x = -Math.PI / 2
  mesh.frustumCulled = false
  return {
    mesh,
    sync() {},
    resize() {},
    // No mirror, nothing to leave out of it.
    watch() {},
    dispose() {
      mesh.geometry.dispose()
      material.dispose()
      options.shore?.texture.dispose()
    },
  }
}

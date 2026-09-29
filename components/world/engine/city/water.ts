import { Mesh, PlaneGeometry, ShaderMaterial } from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { fogGLSL, type Atmosphere } from './common'
import type { Palette } from '../palette'

// The Bosphorus: a mirror of everything above it, broken up by ripples. The
// ripple offsets the reflection mostly up and down the screen, so each light
// on the far shore stretches into the long streak lit water makes at night.

export function createWater(
  palette: Palette,
  atmos: Atmosphere,
  size: number,
  textureWidth: number,
  textureHeight: number,
  reflect = true
) {
  if (!reflect) return createPlainWater(palette, atmos, size)
  const shader = {
    name: 'Bosphorus',
    uniforms: {
      color: { value: null },
      tDiffuse: { value: null },
      textureMatrix: { value: null },
      ...atmos,
      cDeep: { value: palette.oceanDeep },
      cShallow: { value: palette.ocean },
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
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform vec3 cDeep, cShallow;
      varying vec4 vUv;
      varying vec3 vPosW;
      void main() {
        vec3 toCam = cameraPosition - vPosW;
        float dist = length(toCam);
        vec3 V = toCam / dist;
        vec2 p = vPosW.xz;
        float t = uTime;
        // A few travelling ripples, summed as a slope.
        vec2 g = vec2(0.0);
        g += vec2(0.8, 0.3) * cos(dot(p, vec2(0.8, 0.3)) * 0.9 + t * 1.1);
        g += vec2(-0.4, 0.9) * cos(dot(p, vec2(-0.4, 0.9)) * 1.4 - t * 0.9) * 0.7;
        g += vec2(0.2, -1.0) * cos(dot(p, vec2(0.2, -1.0)) * 2.9 + t * 1.7) * 0.45;
        g += vec2(0.95, 0.1) * cos(dot(p, vec2(0.95, 0.1)) * 4.3 - t * 2.3) * 0.3;
        g += vec2(-0.7, -0.6) * cos(dot(p, vec2(-0.7, -0.6)) * 7.1 + t * 3.1) * 0.18;
        float calm = 1.0 / (1.0 + dist * 0.012);
        vec4 uv = vUv;
        uv.x += g.x * 0.004 * calm * uv.w;
        uv.y += (g.y * 0.022 + g.x * 0.006) * calm * uv.w;
        vec3 refl = texture2DProj(tDiffuse, uv).rgb;
        // More mirror at a glancing angle, more deep water looking down.
        float fres = 0.28 + 0.72 * pow(1.0 - max(V.y, 0.0), 5.0);
        vec3 deep = mix(cDeep * 0.55, cShallow * 0.5, uDawn * 0.6);
        vec3 col = mix(deep, refl * 0.92, fres);
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
      u.uFogColor.value.copy(atmos.uFogColor.value)
      u.uFogDensity.value = atmos.uFogDensity.value
      u.uDawn.value = atmos.uDawn.value
      u.uDusk.value = atmos.uDusk.value
    },
    resize(width: number, height: number) {
      water.getRenderTarget().setSize(Math.max(64, Math.round(width)), Math.max(64, Math.round(height)))
    },
    dispose() {
      water.geometry.dispose()
      water.dispose()
    },
  }
}

/**
 * Water without the mirror, for devices that cannot afford drawing the city
 * twice: the sky it would reflect, worked out from the angle, and a shimmer.
 */
function createPlainWater(palette: Palette, atmos: Atmosphere, size: number) {
  const material = new ShaderMaterial({
    uniforms: { ...atmos, cDeep: { value: palette.oceanDeep }, cShallow: { value: palette.ocean }, cLit: { value: palette.city } },
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
      uniform float uTime, uLights;
      uniform vec3 cDeep, cShallow, cLit;
      varying vec3 vPosW;
      void main() {
        vec3 toCam = cameraPosition - vPosW;
        float dist = length(toCam);
        vec3 V = toCam / dist;
        vec2 p = vPosW.xz;
        float ripple = sin(p.x * 0.9 + uTime * 1.1) * sin(p.y * 1.3 - uTime * 0.8) * 0.5 + 0.5;
        vec3 R = vec3(-V.x, V.y, -V.z);
        vec3 sky = mix(air(R), uFogColor * 0.55, smoothstep(0.0, 0.35, R.y));
        float fres = 0.28 + 0.72 * pow(1.0 - max(V.y, 0.0), 5.0);
        vec3 deep = mix(cDeep * 0.55, cShallow * 0.5, uDawn * 0.6);
        vec3 col = mix(deep, sky * (0.85 + 0.2 * ripple), fres) + cLit * 0.03 * ripple * uLights;
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
    dispose() {
      mesh.geometry.dispose()
      material.dispose()
    },
  }
}

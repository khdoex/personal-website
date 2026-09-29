import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  DataTexture,
  DoubleSide,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  Points,
  RGBAFormat,
  RepeatWrapping,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  type Texture,
} from 'three'
import { noise } from './glsl'
import { geo, TAU } from './math'
import type { Palette } from './palette'
import type { Quality } from './quality'

// The home planet, radius 1 at the origin. Real geography, repainted: the
// textures in public/world carry only data (where land is, where the lights
// are, how dry and how high the ground is) and every colour comes from the
// palette. See scripts/world-textures.py for where the data comes from.

export const ISTANBUL = { lat: 41.0082, lon: 28.9784 }

const surfaceVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  varying vec3 vObjN;
  void main() {
    vUv = uv;
    vObjN = normal;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

function placeholder(value: number): DataTexture {
  const t = new DataTexture(new Uint8Array([value, value, value, 255]), 1, 1, RGBAFormat)
  t.needsUpdate = true
  return t
}

export function createEarth(palette: Palette, quality: Quality, clouds: Texture) {
  const group = new Group()
  const spin = new Group() // turns with the planet: surface, clouds, the beacon
  group.add(spin)

  const segs = quality.sphereSegments
  const sunDir = new Vector3(-0.72, 0.28, 0.64).normalize()

  const surfaceMaterial = new ShaderMaterial({
    defines: { OCTAVES: 2 },
    uniforms: {
      uLand: { value: placeholder(0) },
      uLights: { value: placeholder(0) },
      uBiome: { value: placeholder(0) },
      uClouds: { value: clouds },
      uSunDir: { value: sunDir },
      uTime: { value: 0 },
      uBreath: { value: 0 },
      uCloudShift: { value: 0 },
      uLightsBoost: { value: 1 },
      uTexel: { value: new Vector2(1 / 1024, 1 / 512) },
      uRelief: { value: 0.035 },
      cOceanDeep: { value: palette.oceanDeep },
      cOcean: { value: palette.ocean },
      cShallow: { value: palette.shallow },
      cForest: { value: palette.forest },
      cMeadow: { value: palette.meadow },
      cArid: { value: palette.arid },
      cIce: { value: palette.ice },
      cCity: { value: palette.city },
      cDusk: { value: palette.dusk },
      cAtmo: { value: palette.atmosphere },
    },
    vertexShader: surfaceVertex,
    fragmentShader: /* glsl */ `
      ${noise}
      uniform sampler2D uLand, uLights, uBiome, uClouds;
      uniform vec3 uSunDir;
      uniform float uTime, uBreath, uCloudShift, uLightsBoost, uRelief;
      uniform vec2 uTexel;
      uniform vec3 cOceanDeep, cOcean, cShallow, cForest, cMeadow, cArid, cIce, cCity, cDusk, cAtmo;
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      varying vec3 vObjN;

      void main() {
        vec3 N = normalize(vNormalW);
        vec3 V = normalize(cameraPosition - vPosW);
        vec3 L = normalize(uSunDir);

        float land = texture2D(uLand, vUv).r;
        float landM = smoothstep(0.35, 0.65, land);
        // A blurred read of the same mask (a coarser mip) says how near
        // the coast a patch of sea is.
        float coast = texture2D(uLand, vUv, 3.5).r;
        vec3 biome = texture2D(uBiome, vUv).rgb;

        float n1 = snoise(vObjN * 11.0);
        float n2 = snoise(vObjN * 27.0);
        float grain = n1 * 0.65 + n2 * 0.35;

        vec3 ocean = mix(cOceanDeep, cOcean, 0.52 + 0.16 * n1);
        ocean = mix(ocean, cShallow, smoothstep(0.03, 0.5, coast) * 0.7 * (1.0 - landM));

        vec3 green = mix(cForest, cMeadow, clamp(0.42 + 0.38 * grain, 0.0, 1.0));
        vec3 ground = mix(green, cArid, smoothstep(0.05, 0.75, biome.r + 0.04 * grain));
        ground = mix(ground, cIce, smoothstep(0.3, 0.85, biome.g));
        vec3 surf = mix(ocean, ground, landM);
        float lat = abs(vObjN.y);
        surf = mix(surf, cIce, smoothstep(0.9, 0.965, lat + 0.015 * n1) * (1.0 - landM) * 0.85);

        // Relief: the elevation channel's slope, by central differences in
        // texture space, tipped onto the sphere's east and north. (Screen-
        // space derivatives of a magnified texture shade every texel as a
        // flat facet, which reads as a mosaic.)
        vec2 e = uTexel * 1.5;
        float hE = texture2D(uBiome, vUv + vec2(e.x, 0.0)).b - texture2D(uBiome, vUv - vec2(e.x, 0.0)).b;
        float hN = texture2D(uBiome, vUv + vec2(0.0, e.y)).b - texture2D(uBiome, vUv - vec2(0.0, e.y)).b;
        vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), N) + vec3(1e-4, 0.0, 0.0));
        vec3 north = cross(N, east);
        float coslat = max(0.15, sqrt(1.0 - vObjN.y * vObjN.y));
        vec3 Nb = normalize(N - uRelief * landM * (east * hE / (e.x * 6.2831 * coslat) + north * hN / (e.y * 3.1416)));

        float ndl = dot(Nb, L);
        float ndlS = dot(N, L);
        float day = smoothstep(-0.1, 0.22, ndlS);

        float cloud = texture2D(uClouds, vUv + vec2(uCloudShift, 0.0)).r;

        vec3 col = surf * (0.1 + 0.98 * clamp(ndl, 0.0, 1.0)) * (1.0 - 0.3 * cloud * day);
        vec3 night = mix(cOceanDeep * 0.55, mix(cOceanDeep, cForest, 0.35) * 0.5, landM);
        col = mix(night, col, day);

        float dusk = exp(-pow(ndlS * 4.6 - 0.1, 2.0));
        col += cDusk * dusk * 0.14;

        vec3 H = normalize(L + V);
        float nh = max(dot(N, H), 0.0);
        float spec = pow(nh, 360.0) * 0.4 * (1.0 - landM) * day;
        col += mix(cDusk, cIce, 0.35) * spec;

        // City lights, on the night side only, a little brighter on each
        // breath and dimmed where cloud sits over them.
        float lights = texture2D(uLights, vUv).r;
        float dark = 1.0 - smoothstep(-0.22, 0.08, ndlS);
        float flicker = 0.86 + 0.14 * snoise(vObjN * 280.0 + uTime * 0.7);
        float glowL = pow(lights, 1.15);
        vec3 city = mix(cCity, cIce, smoothstep(0.55, 1.0, lights) * 0.45);
        col += city * glowL * dark * (2.1 + 0.6 * uBreath) * flicker * uLightsBoost * (1.0 - 0.5 * cloud);

        float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
        col += mix(cAtmo, cDusk, dusk * 0.8) * fres * (0.06 + 0.55 * day);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
  const surface = new Mesh(new SphereGeometry(1, segs, segs / 2), surfaceMaterial)
  spin.add(surface)

  const cloudMaterial = new ShaderMaterial({
    uniforms: {
      uClouds: { value: clouds },
      uSunDir: { value: sunDir },
      uOpacity: { value: 0.55 },
      cCloud: { value: palette.ice },
      cDusk: { value: palette.dusk },
      cNight: { value: palette.oceanDeep },
    },
    vertexShader: surfaceVertex,
    fragmentShader: /* glsl */ `
      uniform sampler2D uClouds;
      uniform vec3 uSunDir;
      uniform float uOpacity;
      uniform vec3 cCloud, cDusk, cNight;
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      varying vec3 vObjN;
      void main() {
        float c = texture2D(uClouds, vUv).r;
        vec3 N = normalize(vNormalW);
        float ndl = dot(N, normalize(uSunDir));
        float day = smoothstep(-0.14, 0.32, ndl);
        vec3 col = mix(cNight * 0.8, cCloud, day);
        col += cDusk * exp(-pow(ndl * 4.0, 2.0)) * 0.4;
        vec3 V = normalize(cameraPosition - vPosW);
        float limb = smoothstep(0.0, 0.25, dot(N, V));
        gl_FragColor = vec4(col, c * uOpacity * (0.22 + 0.78 * day) * limb);
      }
    `,
    transparent: true,
    depthWrite: false,
  })
  const cloudShell = new Mesh(new SphereGeometry(1.012, segs, segs / 2), cloudMaterial)
  spin.add(cloudShell)

  const atmosphereMaterial = new ShaderMaterial({
    uniforms: {
      uSunDir: { value: sunDir },
      uBreath: { value: 0 },
      uIntensity: { value: 1 },
      cAtmo: { value: palette.atmosphere },
      cDusk: { value: palette.dusk },
      cWhite: { value: palette.heading },
    },
    vertexShader: surfaceVertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uSunDir;
      uniform float uBreath, uIntensity;
      uniform vec3 cAtmo, cDusk, cWhite;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      void main() {
        vec3 N = normalize(vNormalW);
        vec3 V = normalize(cameraPosition - vPosW);
        vec3 L = normalize(uSunDir);
        // 0 at the edge of the shell, about 0.4 where it meets the planet.
        float facing = -dot(N, V);
        // Seen from the night side the lit air is a thin ring, not a halo:
        // the glow tightens onto the limb and turns to dusk gold, brightest
        // on the side the sun is coming up.
        float backlit = smoothstep(0.1, -0.7, dot(normalize(cameraPosition), L));
        float glow = pow(smoothstep(0.0, 0.42, facing), mix(2.1, 7.0, backlit));
        float sun = dot(N, L);
        float day = smoothstep(-0.35, 0.45, sun);
        float dusk = exp(-pow(sun * 4.5, 2.0));
        vec3 col = mix(cAtmo * 0.08, cAtmo, day) + cDusk * dusk * 0.4;
        float fwd = max(dot(-V, L), 0.0);
        col = mix(col, mix(cAtmo, cDusk, 0.65), backlit * 0.7);
        col *= mix(1.0, 0.3 + 1.6 * pow(fwd, 10.0), backlit);
        col += cDusk * pow(fwd, 14.0) * 0.9 + cWhite * pow(fwd, 80.0) * 1.2;
        gl_FragColor = vec4(col * glow * uIntensity * (0.9 + 0.16 * uBreath), 1.0);
      }
    `,
    side: BackSide,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const atmosphere = new Mesh(new SphereGeometry(1.1, segs / 2, segs / 4), atmosphereMaterial)
  group.add(atmosphere)

  // Aurora: a curtain around each pole, lit only on the night side. It does
  // not turn with the planet; the real ovals stay put under the sun too.
  const auroraMaterial = new ShaderMaterial({
    defines: { OCTAVES: 2 },
    uniforms: {
      uTime: { value: 0 },
      uBreath: { value: 0 },
      uIntensity: { value: 1 },
      uSunDir: { value: sunDir },
      cAurora: { value: palette.aurora },
      cSky: { value: palette.sky },
      cSun: { value: palette.sun },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vPosW;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      ${noise}
      uniform float uTime, uBreath, uIntensity;
      uniform vec3 uSunDir;
      uniform vec3 cAurora, cSky, cSun;
      varying vec2 vUv;
      varying vec3 vPosW;
      void main() {
        float x = vUv.x;
        float t = uTime;
        float wave = sin(x * 6.2831 * 4.0 + t * 0.3) * 0.1 + sin(x * 6.2831 * 9.0 - t * 0.45) * 0.05;
        float rays = pow(0.5 + 0.5 * snoise(vec3(x * 46.0, t * 0.22, 1.0)), 2.2);
        float folds = 0.5 + 0.5 * sin(x * 6.2831 * 13.0 + t * 0.6 + snoise(vec3(x * 6.0, t * 0.1, 3.0)) * 2.4);
        float h = vUv.y + wave;
        float vertical = smoothstep(0.0, 0.12, h) * (1.0 - smoothstep(0.22, 1.0, h));
        vec3 col = mix(cAurora, mix(cSky, cAurora, 0.35), smoothstep(0.25, 1.0, h));
        col += cSun * smoothstep(0.1, 0.0, h) * 0.3;
        float night = 1.0 - smoothstep(-0.25, 0.15, dot(normalize(vPosW), normalize(uSunDir)));
        float a = rays * (0.35 + 0.65 * folds) * vertical * night * uIntensity * (0.7 + 0.4 * uBreath);
        gl_FragColor = vec4(col * a * 1.3, 1.0);
      }
    `,
    side: DoubleSide,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const auroraLat = 67 * (Math.PI / 180)
  const r0 = 1.01
  const r1 = 1.075
  for (const pole of [1, -1]) {
    const curtain = new Mesh(
      new CylinderGeometry(r1 * Math.cos(auroraLat), r0 * Math.cos(auroraLat), (r1 - r0) * Math.sin(auroraLat), 192, 1, true),
      auroraMaterial
    )
    curtain.position.y = pole * ((r0 + r1) / 2) * Math.sin(auroraLat)
    if (pole < 0) curtain.rotation.x = Math.PI
    group.add(curtain)
  }

  // The light where Kaan is: a point over Istanbul that breathes, with a
  // ring going out from it on each half breath. The ride falls toward it.
  const beaconGeometry = new BufferGeometry()
  beaconGeometry.setAttribute('position', new BufferAttribute(new Float32Array(3), 3))
  const beaconMaterial = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBreath: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: 72 },
      uOpacity: { value: 1 },
      uPeriod: { value: 3.5 },
      cCore: { value: palette.sun },
      cRing: { value: palette.city },
    },
    vertexShader: /* glsl */ `
      uniform float uPixelRatio, uSize;
      varying float vFacing;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vFacing = dot(normalize(wp.xyz), normalize(cameraPosition - wp.xyz));
        gl_Position = projectionMatrix * viewMatrix * wp;
        gl_PointSize = uSize * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uBreath, uOpacity, uPeriod;
      uniform vec3 cCore, cRing;
      varying float vFacing;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float core = exp(-r * r * 90.0) * 1.8 + exp(-r * r * 14.0) * 0.5;
        float phase = fract(uTime / uPeriod);
        float ring = exp(-pow((r - phase) * 14.0, 2.0)) * (1.0 - phase) * 0.9;
        float vis = smoothstep(0.02, 0.22, vFacing) * uOpacity;
        vec3 col = cCore * core * (0.8 + 0.4 * uBreath) + cRing * ring;
        gl_FragColor = vec4(col * vis, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const beacon = new Points(beaconGeometry, beaconMaterial)
  beacon.frustumCulled = false
  beacon.position.copy(geo(ISTANBUL.lat, ISTANBUL.lon)).multiplyScalar(1.004)
  spin.add(beacon)

  let cloudDrift = 0

  return {
    group,
    spin,
    sunDir,
    setTextures({ land, lights, biome }: { land?: Texture; lights?: Texture; biome?: Texture }) {
      const u = surfaceMaterial.uniforms
      for (const [key, tex] of [['uLand', land], ['uLights', lights], ['uBiome', biome]] as const) {
        if (!tex) continue
        tex.wrapS = RepeatWrapping
        tex.minFilter = LinearMipmapLinearFilter
        tex.magFilter = LinearFilter
        tex.anisotropy = 4
        tex.needsUpdate = true
        u[key].value = tex
        if (key === 'uBiome' && tex.image) {
          const img = tex.image as { width: number; height: number }
          u.uTexel.value.set(1 / img.width, 1 / img.height)
        }
      }
    },
    update(time: number, dt: number, breath: number, pixelRatio: number, lightsBoost: number, auroraIntensity: number) {
      cloudDrift += dt * 0.0045
      cloudShell.rotation.y = cloudDrift
      const su = surfaceMaterial.uniforms
      su.uTime.value = time
      su.uBreath.value = breath
      su.uCloudShift.value = -cloudDrift / TAU
      su.uLightsBoost.value = lightsBoost
      atmosphereMaterial.uniforms.uBreath.value = breath
      auroraMaterial.uniforms.uTime.value = time
      auroraMaterial.uniforms.uBreath.value = breath
      auroraMaterial.uniforms.uIntensity.value = auroraIntensity
      beaconMaterial.uniforms.uTime.value = time
      beaconMaterial.uniforms.uBreath.value = breath
      beaconMaterial.uniforms.uPixelRatio.value = pixelRatio
    },
    setBeaconOpacity(o: number) {
      beaconMaterial.uniforms.uOpacity.value = o
    },
    dispose() {
      group.traverse((o) => {
        const m = o as Mesh
        if (m.geometry) m.geometry.dispose()
        if (m.material) (m.material as ShaderMaterial).dispose()
      })
      for (const key of ['uLand', 'uLights', 'uBiome'] as const) {
        ;(surfaceMaterial.uniforms[key].value as Texture).dispose()
      }
    },
  }
}

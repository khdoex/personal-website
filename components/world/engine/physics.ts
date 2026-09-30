import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  LineSegments,
  Mesh,
  NormalBlending,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  type Color,
  type Object3D,
  type Texture,
} from 'three'
import { createGiant } from './planets'
import type { Palette } from './palette'
import type { Quality } from './quality'
import { PHYSICS_AT } from './shots'

// The Boğaziçi years, up in space above the city: Saturn, a pair of
// black holes circling each other, and the sheet of spacetime under them,
// dented by the two masses and rippling with the waves their orbit sends
// out. Everything here is lit or tinted from the palette, like the city.

// Laid out tall rather than wide: on the resume the scene lives in the
// column right of the text. The black holes above, Saturn below, the sheet
// of spacetime under both.
const LIGHT = new Vector3(-0.5, 0.42, 0.76).normalize()
const SATURN = new Vector3(0.5, -1.9, 1.5)
const SATURN_RADIUS = 1.3
const PRIMARY = new Vector3(0.5, 3.4, -3)
const BINARY_RADIUS = 3.2
const BINARY_PERIOD = 34

function createBlackHole(palette: Palette, sky: Texture, size: number) {
  const material = new ShaderMaterial({
    uniforms: {
      uSize: { value: size },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uSky: { value: sky },
      cHot: { value: palette.heading },
      cDisk: { value: palette.sun },
      cCool: { value: palette.dusk },
    },
    vertexShader: /* glsl */ `
      uniform float uSize;
      varying vec2 vP;
      varying vec3 vCenterDir;
      varying vec3 vRight;
      varying vec3 vUp;
      varying float vAngular;
      void main() {
        vP = position.xy * 2.0;
        vec4 centerW = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        vec3 toC = centerW.xyz - cameraPosition;
        float d = length(toC);
        vCenterDir = toC / d;
        vRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vAngular = (uSize * 0.5) / d;
        vec4 mv = viewMatrix * centerW;
        mv.xy += position.xy * uSize;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uOpacity;
      uniform sampler2D uSky;
      uniform vec3 cHot, cDisk, cCool;
      varying vec2 vP;
      varying vec3 vCenterDir;
      varying vec3 vRight;
      varying vec3 vUp;
      varying float vAngular;

      float hash13(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.zyx + 31.32);
        return fract((p.x + p.y) * p.z);
      }
      // A star field of its own, dense enough that the lensing shows.
      vec3 stars(vec3 d) {
        vec3 g = d * 160.0;
        vec3 f = fract(g) - 0.5;
        float h = hash13(floor(g));
        return vec3(step(0.955, h) * exp(-dot(f, f) * 30.0) * (h - 0.955) * 24.0);
      }
      vec3 sky(vec3 d) {
        vec2 uv = vec2(atan(-d.z, d.x) / 6.2831853 + 0.5, asin(clamp(d.y, -1.0, 1.0)) / 3.1415927 + 0.5);
        return texture2D(uSky, uv).rgb + stars(d) * cHot;
      }

      void main() {
        vec2 p = vP;
        float r = length(p);
        if (r > 1.0) discard;
        float rs = 0.13;          // the shadow
        float thetaE = rs * 2.0;  // the Einstein radius

        // A point lens: the sky seen at p is the sky at src, pulled in
        // toward the hole. At the Einstein radius the patch straight behind
        // the hole is smeared into a ring; inside it the image flips.
        vec2 src = p * (1.0 - (thetaE * thetaE) / max(r * r, 1e-4));
        vec3 dir = normalize(vCenterDir + (src.x * vRight + src.y * vUp) * vAngular);
        float shadow = 1.0 - smoothstep(rs * 0.96, rs * 1.04, r);
        float cover = 1.0 - smoothstep(0.42, 0.95, r);
        vec3 col = sky(dir) * (1.0 - shadow) * cover;

        // The accretion disk, tipped almost edge-on: a band in front of the
        // shadow on the near side, beside it everywhere else.
        vec2 dp = vec2(p.x, p.y / 0.24);
        float dr = length(dp);
        float ang = atan(dp.y, dp.x);
        float inner = rs * 1.8;
        float outer = rs * 5.4;
        float band = smoothstep(inner, inner * 1.15, dr) * (1.0 - smoothstep(outer * 0.5, outer, dr));
        float swirl = 0.55 + 0.45 * sin(ang * 4.0 - uTime * 1.6 + dr * 38.0);
        float streak = 0.72 + 0.28 * sin(dr * 140.0 - uTime * 4.0);
        float doppler = 1.0 + 0.8 * cos(ang);
        float heat = clamp(1.0 - (dr - inner) / (outer - inner), 0.0, 1.0);
        vec3 disk = mix(cCool, mix(cDisk, cHot, heat * heat), heat);
        float front = mix(1.0, step(p.y, 0.0), shadow);
        vec3 glow = disk * band * swirl * streak * doppler * front * 1.2;

        // The far side of the disk, bent up over the top of the shadow, a
        // thin second image under it, and the photon ring.
        float up = p.y / max(r, 1e-4);
        float arc = exp(-pow((r - rs * 1.42) / (rs * 0.3), 2.0)) * smoothstep(-0.4, 0.55, up);
        float arcLow = exp(-pow((r - rs * 1.14) / (rs * 0.09), 2.0)) * smoothstep(0.1, -0.7, up) * 0.55;
        float photon = exp(-pow((r - rs * 1.05) / (rs * 0.035), 2.0));
        float side = 1.0 + 0.6 * (p.x / max(r, 1e-4));
        glow += mix(cDisk, cHot, 0.55) * (arc + arcLow) * side * (0.88 + 0.12 * sin(uTime * 0.7));
        glow += cHot * photon;

        // Premultiplied: the lensed sky replaces the sky behind the hole,
        // the light of the disk adds on top.
        float alpha = max(shadow, cover) * uOpacity;
        gl_FragColor = vec4((col + glow) * uOpacity, alpha);
      }
    `,
    transparent: true,
    premultipliedAlpha: true,
    blending: NormalBlending,
    depthWrite: false,
  })
  const mesh = new Mesh(new PlaneGeometry(1, 1), material)
  mesh.frustumCulled = false
  return { mesh, material }
}

function createGrid(palette: Palette, quality: Quality) {
  const span = 64
  const lines = quality.tier === 'low' ? 24 : 33
  const segments = quality.tier === 'low' ? 48 : 96
  const verts: number[] = []
  for (let i = 0; i < lines; i++) {
    const a = -span / 2 + (span * i) / (lines - 1)
    for (let k = 0; k < segments; k++) {
      const b0 = -span / 2 + (span * k) / segments
      const b1 = -span / 2 + (span * (k + 1)) / segments
      verts.push(a, 0, b0, a, 0, b1) // along z
      verts.push(b0, 0, a, b1, 0, a) // along x
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBreath: { value: 0 },
      uOpacity: { value: 0 },
      uWellA: { value: new Vector3() },
      uWellB: { value: new Vector3() },
      cLine: { value: palette.sky },
      cDeep: { value: palette.accent },
    },
    vertexShader: /* glsl */ `
      uniform float uTime, uBreath;
      uniform vec3 uWellA, uWellB;
      varying float vFade;
      varying float vDepth;
      void main() {
        vec3 p = position;
        float dA = length(p.xz - uWellA.xz);
        float dB = length(p.xz - uWellB.xz);
        float well = 4.2 / (1.0 + dA * dA * 0.16) + 1.8 / (1.0 + dB * dB * 0.5);
        // Gravitational waves from the pair, going out on every breath.
        float wave = sin(dA * 0.9 - uTime * 1.4) * 0.3 * exp(-dA * 0.06) * smoothstep(2.0, 6.0, dA) * (0.6 + 0.4 * uBreath);
        p.y -= well;
        p.y += wave;
        vDepth = clamp(well / 4.2, 0.0, 1.0);
        vFade = 1.0 - smoothstep(8.0, 20.0, length(position.xz));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      uniform vec3 cLine, cDeep;
      varying float vFade;
      varying float vDepth;
      void main() {
        vec3 col = mix(cLine, cDeep, vDepth * 0.7);
        gl_FragColor = vec4(col, (0.16 + 0.4 * vDepth) * vFade * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const grid = new LineSegments(geometry, material)
  grid.position.y = -5.2
  grid.frustumCulled = false
  return { grid, material }
}

/** Titan in its orange haze, Rhea, Enceladus: round Saturn in the plane of its rings. */
function createMoons(palette: Palette, rings: Object3D) {
  const specs: [number, number, number, Color, Color][] = [
    // radius, orbit (in planet radii), period in seconds, surface, haze
    [0.13, 3.6, 46, palette.arid.clone().multiplyScalar(0.85), palette.dusk],
    [0.07, 2.75, 29, palette.heading.clone().multiplyScalar(0.7), palette.sky.clone().multiplyScalar(0.4)],
    [0.05, 2.35, 17, palette.ice, palette.sky],
  ]
  const moons = specs.map(([r, orbit, period, base, haze], i) => {
    const material = new ShaderMaterial({
      uniforms: { uLight: { value: LIGHT }, cBase: { value: base }, cHaze: { value: haze } },
      vertexShader: /* glsl */ `
        varying vec3 vNormalW;
        varying vec3 vPosW;
        void main() {
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vPosW = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uLight, cBase, cHaze;
        varying vec3 vNormalW;
        varying vec3 vPosW;
        void main() {
          vec3 N = normalize(vNormalW);
          float d = max(dot(N, uLight), 0.0);
          float rim = pow(1.0 - max(dot(N, normalize(cameraPosition - vPosW)), 0.0), 3.0);
          gl_FragColor = vec4(cBase * (0.03 + 0.97 * d) + cHaze * rim * (0.2 + 0.8 * d) * 0.6, 1.0);
        }
      `,
    })
    // Placed in the rings' frame, which keeps the scene's units.
    const mesh = new Mesh(new SphereGeometry(r, 20, 14), material)
    rings.add(mesh)
    return { mesh, orbit: orbit * SATURN_RADIUS, period, phase: i * 2.1 }
  })
  return {
    update(time: number) {
      for (const m of moons) {
        const a = m.phase + (time / m.period) * Math.PI * 2
        m.mesh.position.set(Math.cos(a) * m.orbit, Math.sin(a) * m.orbit, 0)
      }
    },
  }
}

/**
 * Gas pulled off the smaller black hole and spiralling into the larger: a
 * stream of sparks, gold where it leaves, white-hot where it falls in.
 */
function createStream(palette: Palette, count: number) {
  const phase = new Float32Array(count)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    phase[i] = i / count
    seed[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute('aPhase', new BufferAttribute(phase, 1))
  geometry.setAttribute('aSeed', new BufferAttribute(seed, 1))
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uPixelRatio: { value: 1 },
      uFrom: { value: new Vector3() },
      uTo: { value: new Vector3() },
      cGold: { value: palette.sun },
      cHot: { value: palette.heading },
    },
    vertexShader: /* glsl */ `
      attribute float aPhase;
      attribute float aSeed;
      uniform float uTime, uPixelRatio;
      uniform vec3 uFrom, uTo;
      varying float vT;
      void main() {
        float t = fract(aPhase + uTime * 0.05);
        vT = t;
        vec3 dir = uTo - uFrom;
        vec3 side = normalize(cross(dir, vec3(0.0, 1.0, 0.0)));
        vec3 up = normalize(cross(side, dir));
        // Along a curve that swings wide of the straight line, then round and
        // round the larger hole, closing in.
        float fall = t * t;
        vec3 p = mix(uFrom, uTo, fall) + side * sin(t * 3.1416) * 1.4;
        float swirl = aSeed * 6.2832 + t * 18.0;
        float r = mix(0.12, 0.9, 1.0 - t) * (0.5 + 0.5 * fract(aSeed * 7.3)) + smoothstep(0.7, 1.0, t) * 0.25;
        p += (side * cos(swirl) + up * sin(swirl) * 0.35) * r;
        vec4 wp = modelMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * viewMatrix * wp;
        gl_PointSize = (1.4 + 2.4 * t) * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      uniform vec3 cGold, cHot;
      varying float vT;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float fade = smoothstep(0.0, 0.08, vT) * (1.0 - smoothstep(0.93, 1.0, vT));
        gl_FragColor = vec4(mix(cGold, cHot, vT) * exp(-r * r * 4.0) * fade * uOpacity * 0.8, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const points = new Points(geometry, material)
  points.frustumCulled = false
  return { points, material }
}

export function createPhysics(palette: Palette, quality: Quality, sky: Texture) {
  const group = new Group()
  group.position.set(...PHYSICS_AT)

  const saturn = createGiant(palette, {
    radius: SATURN_RADIUS,
    light: LIGHT,
    segments: quality.sphereSegments,
    octaves: quality.octaves,
  })
  saturn.mesh.position.copy(SATURN)
  saturn.mesh.rotation.set(0.35, 0.5, -0.28)
  group.add(saturn.mesh)
  const moons = createMoons(palette, saturn.rings)

  const primary = createBlackHole(palette, sky, 7.5)
  primary.mesh.position.copy(PRIMARY)
  const companion = createBlackHole(palette, sky, 2.6)
  group.add(primary.mesh, companion.mesh)

  const { grid, material: gridMaterial } = createGrid(palette, quality)
  group.add(grid)
  const stream = createStream(palette, quality.tier === 'low' ? 160 : 420)
  group.add(stream.points)

  const anchorSaturn = new Vector3()
  const anchorHole = new Vector3()

  return {
    group,
    /** Where the captions pin, in world space. */
    anchors: { saturn: anchorSaturn, blackHole: anchorHole },
    setPixelRatio(pixelRatio: number) {
      stream.material.uniforms.uPixelRatio.value = pixelRatio
    },
    update(time: number, breath: number, weight: number) {
      group.visible = weight > 0.002
      if (!group.visible) return
      const a = (time / BINARY_PERIOD) * Math.PI * 2
      companion.mesh.position.set(
        PRIMARY.x + Math.cos(a) * BINARY_RADIUS,
        PRIMARY.y - 0.8 + Math.sin(a * 2) * 0.3,
        PRIMARY.z + Math.sin(a) * BINARY_RADIUS
      )
      for (const hole of [primary, companion]) {
        hole.material.uniforms.uTime.value = time
        hole.material.uniforms.uOpacity.value = weight
      }
      saturn.update(time, 0.03)
      moons.update(time)
      const su = stream.material.uniforms
      su.uTime.value = time
      su.uOpacity.value = weight
      su.uFrom.value.copy(companion.mesh.position)
      su.uTo.value.copy(PRIMARY)
      const gu = gridMaterial.uniforms
      gu.uTime.value = time
      gu.uBreath.value = breath
      gu.uOpacity.value = weight
      gu.uWellA.value.set(PRIMARY.x, 0, PRIMARY.z)
      gu.uWellB.value.set(companion.mesh.position.x, 0, companion.mesh.position.z)
      anchorSaturn.copy(SATURN).add(group.position)
      anchorSaturn.x += SATURN_RADIUS * 1.6
      anchorSaturn.y += SATURN_RADIUS * 0.9
      anchorHole.copy(PRIMARY).add(group.position)
      anchorHole.y += 1.1
      anchorHole.x += 1.3
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

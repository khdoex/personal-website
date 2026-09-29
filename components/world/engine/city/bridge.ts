import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Group,
  LineSegments,
  Mesh,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three'
import { at, fogGLSL, merge, rng, type Atmosphere } from './common'
import type { Palette } from '../palette'

// The Bosphorus Bridge, which lights its cables in colours that run from one
// continent to the other. Here they run in the site's three: leaf, sun and
// sky. Pointing at one of the things Kaan is working on floods the whole
// bridge with that thing's colour. Traffic crosses all night.

const TOWER_H = 17
const DECK_Y = 6.2
const INSET = 6

/** The colour of the lights at a point along the bridge, 0 at the European end, 1 at the Asian. */
const ledGLSL = /* glsl */ `
  uniform float uHighlight, uHighlightMix;
  uniform vec3 cA, cB, cC;
  vec3 pick(float i) { return i < 0.5 ? cA : (i < 1.5 ? cB : cC); }
  vec3 ledColor(float t) {
    float w = fract(t * 1.5 - uTime * 0.05) * 3.0;
    vec3 wave = mix(pick(floor(w)), pick(mod(floor(w) + 1.0, 3.0)), smoothstep(0.7, 1.0, fract(w)));
    return mix(wave, pick(mod(max(uHighlight, 0.0), 3.0)), uHighlightMix);
  }
`

export function createBridge(palette: Palette, atmos: Atmosphere, [x0, x1, z]: [number, number, number]) {
  const span = x1 - x0
  const towers = [x0 + INSET, x1 - INSET]
  const shared = {
    ...atmos,
    uPixelRatio: { value: 1 },
    uHighlight: { value: -1 },
    uHighlightMix: { value: 0 },
    uX0: { value: x0 },
    uSpan: { value: span },
    cA: { value: palette.accent },
    cB: { value: palette.sun },
    cC: { value: palette.sky },
    cSteel: { value: palette.oceanDeep },
    cLamp: { value: palette.city },
    cTail: { value: palette.dusk },
  }

  // ----------------------------------------------------------- the structure
  const parts: BufferGeometry[] = []
  const part = (g: BufferGeometry, kind: number) => {
    const n = g.getAttribute('position').count
    g.setAttribute('aPart', new BufferAttribute(new Float32Array(n).fill(kind), 1))
    g.deleteAttribute('uv')
    return g
  }
  for (const tx of towers) {
    for (const dz of [-1.6, 1.6]) parts.push(part(at(new BoxGeometry(0.9, TOWER_H, 0.9).translate(0, TOWER_H / 2, 0), tx, 0, z + dz), 0))
    for (const y of [DECK_Y + 1.2, TOWER_H - 1.4]) parts.push(part(at(new BoxGeometry(0.7, 0.7, 4), tx, y, z), 0))
  }
  parts.push(part(at(new BoxGeometry(span + 30, 0.6, 3.4), (x0 + x1) / 2, DECK_Y, z), 1))
  const structure = new Mesh(
    merge(parts),
    new ShaderMaterial({
      uniforms: shared,
      vertexShader: /* glsl */ `
        attribute float aPart;
        uniform float uX0, uSpan;
        varying float vPart;
        varying float vT;
        varying vec3 vLocal;
        varying vec3 vNormalW;
        varying vec3 vPosW;
        void main() {
          vPart = aPart;
          vLocal = position;
          vT = (position.x - uX0) / uSpan;
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vPosW = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime, uLights;
        uniform vec3 cSteel, cLamp;
        ${ledGLSL}
        ${fogGLSL}
        varying float vPart;
        varying float vT;
        varying vec3 vLocal;
        varying vec3 vNormalW;
        varying vec3 vPosW;
        void main() {
          vec3 N = normalize(vNormalW);
          vec3 V = normalize(cameraPosition - vPosW);
          vec3 col = cSteel * 0.25;
          if (vPart < 0.5) {
            // The towers, washed from below in the colour of the lights.
            float up = clamp(vLocal.y / ${TOWER_H.toFixed(1)}, 0.0, 1.0);
            col += ledColor(vT) * (0.2 + 0.5 * (1.0 - 0.6 * up)) * (0.55 + 0.45 * max(dot(N, V), 0.0)) * uLights;
          } else {
            // The deck: dark underneath, its edge lit by the lamps along it.
            col += cLamp * 0.22 * (1.0 - abs(N.y)) * uLights;
          }
          gl_FragColor = vec4(fog(col, vPosW), 1.0);
        }
      `,
    })
  )
  structure.frustumCulled = false

  // -------------------------------------------------------- cables and lights
  // Main cables hang from tower to tower and run down to anchors on each
  // shore; suspenders drop from them to the deck.
  const [ta, tb] = towers
  const cableAt = (x: number) => {
    const t = (x - ta) / (tb - ta)
    return TOWER_H - (TOWER_H - DECK_Y - 1.4) * (1 - (2 * t - 1) ** 2)
  }
  const lines: number[] = []
  const lineT: number[] = []
  const leds: number[] = []
  const ledT: number[] = []
  const ledKind: number[] = []
  const pushLine = (a: Vector3, b: Vector3) => {
    lines.push(a.x, a.y, a.z, b.x, b.y, b.z)
    lineT.push((a.x - x0) / span, (b.x - x0) / span)
  }
  for (const dz of [-1.6, 1.6]) {
    const main: Vector3[] = []
    for (let i = 0; i <= 64; i++) main.push(new Vector3(ta + ((tb - ta) * i) / 64, cableAt(ta + ((tb - ta) * i) / 64), z + dz))
    const backA = [new Vector3(ta, TOWER_H, z + dz), new Vector3((ta + x0 - 12) / 2, (TOWER_H + DECK_Y) / 2 - 1, z + dz), new Vector3(x0 - 12, DECK_Y, z + dz)]
    const backB = [new Vector3(tb, TOWER_H, z + dz), new Vector3((tb + x1 + 12) / 2, (TOWER_H + DECK_Y) / 2 - 1, z + dz), new Vector3(x1 + 12, DECK_Y, z + dz)]
    for (const cable of [main, backA, backB]) {
      const curve = new CatmullRomCurve3(cable)
      const pts = curve.getSpacedPoints(Math.max(8, Math.round(curve.getLength() / 0.7)))
      for (let i = 0; i < pts.length - 1; i++) pushLine(pts[i], pts[i + 1])
      for (const p of pts) {
        leds.push(p.x, p.y, p.z)
        ledT.push((p.x - x0) / span)
        ledKind.push(0)
      }
    }
    for (let x = ta + 2.6; x < tb - 1; x += 2.6) pushLine(new Vector3(x, cableAt(x), z + dz), new Vector3(x, DECK_Y + 0.3, z + dz))
    // Lamps along the deck.
    for (let x = x0 - 14; x <= x1 + 14; x += 2.2) {
      leds.push(x, DECK_Y + 0.75, z + dz * 1.12)
      ledT.push((x - x0) / span)
      ledKind.push(1)
    }
  }
  // Traffic, both ways: each car is a light that knows its lane and its pace.
  const random = rng(3)
  for (let i = 0; i < 56; i++) {
    const lane = [-1.1, -0.45, 0.45, 1.1][i % 4]
    leds.push(0, DECK_Y + 0.45, z + lane)
    ledT.push(random())
    ledKind.push(lane < 0 ? 2 : 3)
  }

  const lineGeometry = new BufferGeometry()
  lineGeometry.setAttribute('position', new BufferAttribute(new Float32Array(lines), 3))
  lineGeometry.setAttribute('aT', new BufferAttribute(new Float32Array(lineT), 1))
  const cables = new LineSegments(
    lineGeometry,
    new ShaderMaterial({
      uniforms: shared,
      vertexShader: /* glsl */ `
        attribute float aT;
        varying float vT;
        varying float vDist;
        void main() {
          vT = aT;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vDist = length(cameraPosition - wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime, uLights, uFogDensity;
        ${ledGLSL}
        varying float vT;
        varying float vDist;
        void main() {
          float f = 1.0 - exp(-pow(vDist * uFogDensity, 1.25));
          gl_FragColor = vec4(ledColor(vT) * 0.45 * uLights * (1.0 - f), 1.0);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
  )
  cables.frustumCulled = false

  const ledGeometry = new BufferGeometry()
  ledGeometry.setAttribute('position', new BufferAttribute(new Float32Array(leds), 3))
  ledGeometry.setAttribute('aT', new BufferAttribute(new Float32Array(ledT), 1))
  ledGeometry.setAttribute('aKind', new BufferAttribute(new Float32Array(ledKind), 1))
  const ledMaterial = new ShaderMaterial({
    uniforms: shared,
    vertexShader: /* glsl */ `
      attribute float aT;
      attribute float aKind;
      uniform float uPixelRatio, uTime, uX0, uSpan;
      varying float vT;
      varying float vKind;
      varying float vDist;
      void main() {
        vT = aT;
        vKind = aKind;
        vec3 p = position;
        if (aKind > 1.5) {
          // A car: aT is where it started; it crosses in about a minute.
          float len = uSpan + 28.0;
          float run = fract(aT + uTime * (0.016 + 0.006 * fract(aT * 17.0)));
          p.x = uX0 - 14.0 + (aKind > 2.5 ? run : 1.0 - run) * len;
        }
        vec4 wp = modelMatrix * vec4(p, 1.0);
        vDist = length(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
        float size = aKind < 0.5 ? 150.0 : (aKind < 1.5 ? 110.0 : 80.0);
        gl_PointSize = clamp(size / vDist, 1.2, aKind < 0.5 ? 6.0 : 4.0) * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uLights, uFogDensity;
      uniform vec3 cLamp, cTail;
      ${ledGLSL}
      varying float vT;
      varying float vKind;
      varying float vDist;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float glow = exp(-r * r * 5.0);
        vec3 col = vKind < 0.5 ? ledColor(vT) * (1.0 + 0.4 * uHighlightMix) : (vKind < 1.5 ? cLamp * 0.8 : (vKind < 2.5 ? cLamp : cTail) * 0.9);
        float f = 1.0 - exp(-pow(vDist * uFogDensity, 1.25));
        float on = vKind > 1.5 ? 1.0 : uLights;
        gl_FragColor = vec4(col * glow * on * (1.0 - 0.8 * f), 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const lights = new Points(ledGeometry, ledMaterial)
  lights.frustumCulled = false

  const group = new Group()
  group.add(structure, cables, lights)

  return {
    group,
    materials: [structure.material, cables.material, ledMaterial],
    ledMaterial,
    update(highlight: number | null, dt: number) {
      if (highlight !== null) shared.uHighlight.value = highlight
      shared.uHighlightMix.value += ((highlight === null ? 0 : 1) - shared.uHighlightMix.value) * (1 - Math.exp(-6 * dt))
    },
    dispose() {
      structure.geometry.dispose()
      structure.material.dispose()
      lineGeometry.dispose()
      cables.material.dispose()
      ledGeometry.dispose()
      ledMaterial.dispose()
    },
  }
}

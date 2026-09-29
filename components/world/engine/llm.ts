import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  ConeGeometry,
  Group,
  LineSegments,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three'
import type { Palette } from './palette'
import { LLM_AT } from './shots'

// The Sabancı years: a language model laid out in space. On the left, a
// transformer as a stack of layers, one vertical line per token (the
// residual stream), attention arcs moving information between tokens, and a
// forward pass climbing the stack. On the right, the plot the thesis is
// about: activations of harmful and harmless prompts as two clouds, the
// refusal direction as the arrow between them, and a jailbreak pushing a
// harmful prompt back along it.

// Laid out tall rather than wide, like the physics scene: the model above,
// the plot below, both in the column right of the resume's text.
const LAYERS = 8
const SPACING = 0.34
const STACK_X = 0
const STACK_Y = 1.9
const WIDTH = 2.4
const DEPTH = 0.9
const BOTTOM = STACK_Y - 1.6
const TOP = STACK_Y + 1.55
const CLOUD_AT = new Vector3(0.2, -2.1, -0.3)
const DIR = new Vector3(1, 0.5, -0.25).normalize()
const HARMLESS = new Vector3(-0.6, -0.34, 0.12)
const HARMFUL = HARMLESS.clone().addScaledVector(DIR, 1.3)

const layerY = (l: number) => STACK_Y + (l - (LAYERS - 1) / 2) * SPACING

function additive(uniforms: Record<string, { value: unknown }>, vertexShader: string, fragmentShader: string) {
  return new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
}

function gaussian() {
  return (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 0.87
}

export function createModel(palette: Palette, tokenCount: number) {
  const group = new Group()
  group.position.set(...LLM_AT)
  const materials: ShaderMaterial[] = []
  const T = Math.max(3, Math.min(8, tokenCount))
  const streamX = (i: number) => STACK_X - WIDTH / 2 + (WIDTH * (i + 0.5)) / T

  // ------------------------------------------------------------ the layers
  const layers: ShaderMaterial[] = []
  for (let l = 0; l < LAYERS; l++) {
    const material = additive(
      {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uLayer: { value: l / (LAYERS - 1) },
        uFeature: { value: l === 5 ? 1 : 0 },
        cEdge: { value: palette.sky },
        cNeuron: { value: palette.heading },
        cHot: { value: palette.sun },
        cFeature: { value: palette.accent },
      },
      /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      /* glsl */ `
        uniform float uTime, uOpacity, uLayer, uFeature;
        uniform vec3 cEdge, cNeuron, cHot, cFeature;
        varying vec2 vUv;
        void main() {
          vec2 q = abs(vUv - 0.5) * 2.0;
          float m = max(q.x, q.y);
          float edge = smoothstep(0.955, 0.99, m) * (1.0 - smoothstep(0.995, 1.0, m));
          vec2 g = vUv * vec2(20.0, 7.0);
          vec2 f = fract(g) - 0.5;
          vec2 id = floor(g);
          float h = fract(sin(dot(id + uLayer * 17.0, vec2(12.9898, 78.233))) * 43758.5453);
          float act = smoothstep(0.3, 1.0, 0.5 + 0.5 * sin(h * 40.0 + uTime * (0.7 + h)));
          float neuron = exp(-dot(f, f) * 34.0);
          // The forward pass: a band of activity climbing the stack.
          float pass = exp(-pow(fract(uTime * 0.16) * 1.35 - 0.1 - uLayer, 2.0) * 50.0);
          float feature = step(0.9, h) * uFeature;
          vec3 col = cEdge * (0.035 + edge * 0.5);
          col += mix(cNeuron * 0.28, cHot, pass) * neuron * (0.2 + 0.8 * act) * (0.3 + 0.7 * pass);
          col += cFeature * neuron * feature * (0.55 + 0.45 * sin(uTime * 2.0 + h * 10.0));
          gl_FragColor = vec4(col * uOpacity, 1.0);
        }
      `
    )
    const slab = new Mesh(new PlaneGeometry(WIDTH, DEPTH), material)
    slab.rotation.x = -Math.PI / 2
    slab.position.set(STACK_X, layerY(l), 0)
    group.add(slab)
    layers.push(material)
    materials.push(material)
  }

  // ------------------------------------------------ residual streams, pulses
  const streamPos: number[] = []
  const streamT: number[] = []
  for (let i = 0; i < T; i++) {
    const steps = 32
    for (let k = 0; k < steps; k++) {
      const y0 = BOTTOM + ((TOP - BOTTOM) * k) / steps
      const y1 = BOTTOM + ((TOP - BOTTOM) * (k + 1)) / steps
      streamPos.push(streamX(i), y0, 0, streamX(i), y1, 0)
      streamT.push(k / steps, (k + 1) / steps)
    }
  }
  const streamGeometry = new BufferGeometry()
  streamGeometry.setAttribute('position', new BufferAttribute(new Float32Array(streamPos), 3))
  streamGeometry.setAttribute('aT', new BufferAttribute(new Float32Array(streamT), 1))
  const streamMaterial = additive(
    { uOpacity: { value: 0 }, cLow: { value: palette.sky }, cHigh: { value: palette.heading } },
    /* glsl */ `
      attribute float aT;
      varying float vT;
      void main() {
        vT = aT;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    /* glsl */ `
      uniform float uOpacity;
      uniform vec3 cLow, cHigh;
      varying float vT;
      void main() {
        gl_FragColor = vec4(mix(cLow, cHigh, vT), (0.28 + 0.3 * vT) * uOpacity);
      }
    `
  )
  group.add(new LineSegments(streamGeometry, streamMaterial))
  materials.push(streamMaterial)

  const pulseCount = T * 2
  const pulseGeometry = new BufferGeometry()
  pulseGeometry.setAttribute('position', new BufferAttribute(new Float32Array(pulseCount * 3), 3))
  const pulseMaterial = additive(
    { uOpacity: { value: 0 }, uPixelRatio: { value: 1 }, cPulse: { value: palette.sun } },
    /* glsl */ `
      uniform float uPixelRatio;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 9.0 * uPixelRatio;
      }
    `,
    /* glsl */ `
      uniform float uOpacity;
      uniform vec3 cPulse;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        gl_FragColor = vec4(cPulse * (exp(-r * r * 12.0) + exp(-r * r * 60.0)) * uOpacity, 1.0);
      }
    `
  )
  const pulses = new Points(pulseGeometry, pulseMaterial)
  pulses.frustumCulled = false
  group.add(pulses)
  materials.push(pulseMaterial)

  // --------------------------------------------------------------- attention
  // Causal: a token only reads from the ones before it.
  const arcPos: number[] = []
  const arcAttr: number[] = []
  for (let l = 0; l < LAYERS; l++) {
    for (let n = 0; n < 3; n++) {
      const to = 1 + ((l * 3 + n * 2) % (T - 1))
      const from = (to * 7 + l + n) % to
      const a = new Vector3(streamX(from), layerY(l) + 0.02, 0)
      const b = new Vector3(streamX(to), layerY(l) + 0.02, 0)
      const lift = 0.14 + 0.07 * (to - from)
      const steps = 20
      const p = new Vector3()
      const q = new Vector3()
      const at = (t: number, out: Vector3) => {
        out.lerpVectors(a, b, t)
        out.y += Math.sin(Math.PI * t) * lift
        out.z += Math.sin(Math.PI * t) * lift * 1.6
        return out
      }
      for (let k = 0; k < steps; k++) {
        at(k / steps, p)
        at((k + 1) / steps, q)
        arcPos.push(p.x, p.y, p.z, q.x, q.y, q.z)
        arcAttr.push(k / steps, l / (LAYERS - 1), (k + 1) / steps, l / (LAYERS - 1))
      }
    }
  }
  const arcGeometry = new BufferGeometry()
  arcGeometry.setAttribute('position', new BufferAttribute(new Float32Array(arcPos), 3))
  arcGeometry.setAttribute('aTL', new BufferAttribute(new Float32Array(arcAttr), 2))
  const arcMaterial = additive(
    { uTime: { value: 0 }, uOpacity: { value: 0 }, cArc: { value: palette.accent } },
    /* glsl */ `
      attribute vec2 aTL;
      varying vec2 vTL;
      void main() {
        vTL = aTL;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    /* glsl */ `
      uniform float uTime, uOpacity;
      uniform vec3 cArc;
      varying vec2 vTL;
      void main() {
        float pass = exp(-pow(fract(uTime * 0.16) * 1.35 - 0.1 - vTL.y, 2.0) * 50.0);
        float flow = pow(1.0 - fract(vTL.x - uTime * 0.9), 6.0);
        gl_FragColor = vec4(cArc, (0.12 + 0.55 * pass + 0.35 * flow * (0.3 + pass)) * uOpacity);
      }
    `
  )
  group.add(new LineSegments(arcGeometry, arcMaterial))
  materials.push(arcMaterial)

  // ------------------------------------------------------- activation space
  const cloud = new Group()
  cloud.position.copy(CLOUD_AT)
  group.add(cloud)

  const perCluster = 170
  const cloudPos = new Float32Array(perCluster * 2 * 3)
  const cloudCol = new Float32Array(perCluster * 2 * 3)
  const seeds = new Float32Array(perCluster * 2)
  for (let i = 0; i < perCluster * 2; i++) {
    const harmful = i >= perCluster
    const c = harmful ? HARMFUL : HARMLESS
    const color = harmful ? palette.sun : palette.sky
    cloudPos.set([c.x + gaussian() * 0.24, c.y + gaussian() * 0.2, c.z + gaussian() * 0.24], i * 3)
    cloudCol.set([color.r, color.g, color.b], i * 3)
    seeds[i] = Math.random() * 100
  }
  const cloudGeometry = new BufferGeometry()
  cloudGeometry.setAttribute('position', new BufferAttribute(cloudPos, 3))
  cloudGeometry.setAttribute('aColor', new BufferAttribute(cloudCol, 3))
  cloudGeometry.setAttribute('aSeed', new BufferAttribute(seeds, 1))
  const cloudMaterial = additive(
    { uTime: { value: 0 }, uOpacity: { value: 0 }, uPixelRatio: { value: 1 } },
    /* glsl */ `
      attribute vec3 aColor;
      attribute float aSeed;
      uniform float uTime, uPixelRatio;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        vec3 p = position + 0.025 * vec3(sin(uTime * 0.7 + aSeed), sin(uTime * 0.6 + aSeed * 1.3), sin(uTime * 0.8 + aSeed * 0.7));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = 5.0 * uPixelRatio;
      }
    `,
    /* glsl */ `
      uniform float uOpacity;
      varying vec3 vColor;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        gl_FragColor = vec4(vColor * (exp(-r * r * 8.0) * 0.9) * uOpacity, 1.0);
      }
    `
  )
  const cloudPoints = new Points(cloudGeometry, cloudMaterial)
  cloudPoints.frustumCulled = false
  cloud.add(cloudPoints)
  materials.push(cloudMaterial)

  // The plot's frame: a box and three axes, the way a figure would draw it.
  const half = 1.05
  const box: number[] = []
  const corners = [-half, half]
  for (const x of corners) for (const y of corners) box.push(x, y, -half, x, y, half)
  for (const x of corners) for (const z of corners) box.push(x, -half, z, x, half, z)
  for (const y of corners) for (const z of corners) box.push(-half, y, z, half, y, z)
  for (let k = -2; k <= 2; k++) {
    const t = (k / 2.5) * half
    box.push(t, -half, half, t, -half + 0.08, half) // ticks on x
    box.push(-half, t, half, -half + 0.08, t, half) // ticks on y
  }
  const frameGeometry = new BufferGeometry()
  frameGeometry.setAttribute('position', new BufferAttribute(new Float32Array(box), 3))
  const frameMaterial = additive(
    { uOpacity: { value: 0 }, cFrame: { value: palette.muted } },
    /* glsl */ `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    /* glsl */ `
      uniform float uOpacity;
      uniform vec3 cFrame;
      void main() { gl_FragColor = vec4(cFrame, 0.3 * uOpacity); }
    `
  )
  cloud.add(new LineSegments(frameGeometry, frameMaterial))
  materials.push(frameMaterial)

  // The refusal direction: from the harmless mean through the harmful one.
  const tail = HARMLESS.clone().addScaledVector(DIR, -0.35)
  const tip = HARMFUL.clone().addScaledVector(DIR, 0.45)
  const arrowGeometry = new BufferGeometry()
  arrowGeometry.setAttribute('position', new BufferAttribute(new Float32Array([tail.x, tail.y, tail.z, tip.x, tip.y, tip.z]), 3))
  const arrowMaterial = additive(
    { uOpacity: { value: 0 }, uBreath: { value: 0 }, cArrow: { value: palette.accent } },
    /* glsl */ `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    /* glsl */ `
      uniform float uOpacity, uBreath;
      uniform vec3 cArrow;
      void main() { gl_FragColor = vec4(cArrow * (1.1 + 0.5 * uBreath), uOpacity); }
    `
  )
  cloud.add(new LineSegments(arrowGeometry, arrowMaterial))
  materials.push(arrowMaterial)
  const head = new Mesh(new ConeGeometry(0.07, 0.22, 16), arrowMaterial)
  head.position.copy(tip)
  head.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), DIR)
  cloud.add(head)

  // A jailbreak: a harmful prompt pushed back against the direction, until
  // it sits among the harmless ones. Then it resets.
  const jbGeometry = new BufferGeometry()
  const jbSteps = 40
  const jbPos: number[] = []
  const jbT: number[] = []
  const jbStart = HARMFUL.clone().add(new Vector3(0.05, 0.12, 0.1))
  const jbEnd = jbStart.clone().addScaledVector(DIR, -1.25).add(new Vector3(0, 0.2, 0.05))
  const jb = new Vector3()
  for (let k = 0; k <= jbSteps; k++) {
    jb.lerpVectors(jbStart, jbEnd, k / jbSteps)
    jb.y += Math.sin((Math.PI * k) / jbSteps) * 0.18
    jbPos.push(jb.x, jb.y, jb.z)
    jbT.push(k / jbSteps)
  }
  const jbLine: number[] = []
  const jbLineT: number[] = []
  for (let k = 0; k < jbSteps; k++) {
    jbLine.push(...jbPos.slice(k * 3, k * 3 + 3), ...jbPos.slice(k * 3 + 3, k * 3 + 6))
    jbLineT.push(jbT[k], jbT[k + 1])
  }
  jbGeometry.setAttribute('position', new BufferAttribute(new Float32Array(jbLine), 3))
  jbGeometry.setAttribute('aT', new BufferAttribute(new Float32Array(jbLineT), 1))
  const jbMaterial = additive(
    { uOpacity: { value: 0 }, uHead: { value: 0 }, cJail: { value: palette.dusk } },
    /* glsl */ `
      attribute float aT;
      varying float vT;
      void main() {
        vT = aT;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    /* glsl */ `
      uniform float uOpacity, uHead;
      uniform vec3 cJail;
      varying float vT;
      void main() {
        float seen = step(vT, uHead) * (0.25 + 0.75 * smoothstep(uHead - 0.35, uHead, vT));
        gl_FragColor = vec4(cJail, seen * uOpacity);
      }
    `
  )
  cloud.add(new LineSegments(jbGeometry, jbMaterial))
  materials.push(jbMaterial)
  const jbHeadGeometry = new BufferGeometry()
  jbHeadGeometry.setAttribute('position', new BufferAttribute(new Float32Array(3), 3))
  const jbHeadMaterial = additive(
    { uOpacity: { value: 0 }, uPixelRatio: { value: 1 }, cJail: { value: palette.dusk }, cWhite: { value: palette.heading } },
    /* glsl */ `
      uniform float uPixelRatio;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 13.0 * uPixelRatio;
      }
    `,
    /* glsl */ `
      uniform float uOpacity;
      uniform vec3 cJail, cWhite;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float core = exp(-r * r * 30.0);
        gl_FragColor = vec4(mix(cJail, cWhite, core * 0.6) * (core + exp(-r * r * 6.0) * 0.5) * uOpacity, 1.0);
      }
    `
  )
  const jbHead = new Points(jbHeadGeometry, jbHeadMaterial)
  jbHead.frustumCulled = false
  cloud.add(jbHead)
  materials.push(jbHeadMaterial)

  // The probe: layer six read out into the plot, drawn as a dashed line.
  const probeFrom = new Vector3(STACK_X + WIDTH / 2 + 0.05, layerY(5), 0)
  const probeTo = CLOUD_AT.clone().add(new Vector3(half, half, 0))
  const probeGeometry = new BufferGeometry()
  probeGeometry.setAttribute('position', new BufferAttribute(new Float32Array([...probeFrom.toArray(), ...probeTo.toArray()]), 3))
  probeGeometry.setAttribute('aT', new BufferAttribute(new Float32Array([0, 1]), 1))
  const probeMaterial = additive(
    { uOpacity: { value: 0 }, uTime: { value: 0 }, cProbe: { value: palette.accent } },
    /* glsl */ `
      attribute float aT;
      varying float vT;
      void main() {
        vT = aT;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    /* glsl */ `
      uniform float uOpacity, uTime;
      uniform vec3 cProbe;
      varying float vT;
      void main() {
        float dash = step(0.5, fract(vT * 22.0 - uTime * 0.8));
        gl_FragColor = vec4(cProbe, dash * 0.55 * uOpacity);
      }
    `
  )
  group.add(new LineSegments(probeGeometry, probeMaterial))
  materials.push(probeMaterial)

  // ------------------------------------------------------------ anchors
  const anchors = {
    transformer: new Vector3(),
    refusal: new Vector3(),
    harmful: new Vector3(),
    harmless: new Vector3(),
    answer: new Vector3(),
    tokens: Array.from({ length: T }, () => new Vector3()),
  }
  const local = new Vector3()
  const world = (v: Vector3, out: Vector3, parent: Group) => {
    local.copy(v)
    return out.copy(local.applyMatrix4(parent.matrixWorld))
  }

  const pulsePos = pulseGeometry.getAttribute('position') as BufferAttribute
  const jbHeadPos = jbHeadGeometry.getAttribute('position') as BufferAttribute

  return {
    group,
    tokens: T,
    anchors,
    update(time: number, breath: number, weight: number, pixelRatio: number) {
      group.visible = weight > 0.002
      if (!group.visible) return
      for (const m of materials) m.uniforms.uOpacity.value = weight
      for (const m of layers) m.uniforms.uTime.value = time
      arcMaterial.uniforms.uTime.value = time
      cloudMaterial.uniforms.uTime.value = time
      probeMaterial.uniforms.uTime.value = time
      arrowMaterial.uniforms.uBreath.value = breath
      for (const m of [pulseMaterial, cloudMaterial, jbHeadMaterial]) m.uniforms.uPixelRatio.value = pixelRatio

      for (let i = 0; i < pulseCount; i++) {
        const stream = i % T
        const f = (time * 0.22 + stream * 0.13 + (i >= T ? 0.5 : 0)) % 1
        pulsePos.setXYZ(i, streamX(stream), BOTTOM + (TOP - BOTTOM) * f, 0)
      }
      pulsePos.needsUpdate = true

      // One push per breath, resting at each end.
      const phase = (time % 7) / 7
      const head = Math.min(1, Math.max(0, (phase - 0.1) / 0.65))
      const eased = head * head * (3 - 2 * head)
      jbMaterial.uniforms.uHead.value = eased
      jb.lerpVectors(jbStart, jbEnd, eased)
      jb.y += Math.sin(Math.PI * eased) * 0.18
      jbHeadPos.setXYZ(0, jb.x, jb.y, jb.z)
      jbHeadPos.needsUpdate = true

      cloud.rotation.y = Math.sin(time * 0.14) * 0.45
      group.updateMatrixWorld()
      // Centred annotations, the way a figure labels itself: a title over
      // the model, its answer under the title, each cluster named beside
      // itself, the arrow named under the plot.
      world(new Vector3(STACK_X, TOP + 0.62, 0), anchors.transformer, group)
      world(new Vector3(STACK_X, TOP + 0.3, 0), anchors.answer, group)
      world(CLOUD_AT.clone().add(new Vector3(0, -half - 0.32, 0)), anchors.refusal, group)
      world(HARMFUL.clone().add(new Vector3(0, 0.4, 0)), anchors.harmful, cloud)
      world(HARMLESS.clone().add(new Vector3(0, -0.4, 0)), anchors.harmless, cloud)
      anchors.tokens.forEach((v, i) => world(new Vector3(streamX(i), BOTTOM - 0.12, 0), v, group))
    },
    dispose() {
      group.traverse((o) => {
        const m = o as Mesh
        if (m.geometry) m.geometry.dispose()
      })
      for (const m of materials) m.dispose()
    },
  }
}

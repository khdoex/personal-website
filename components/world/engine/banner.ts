import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  Vector3,
  type PerspectiveCamera,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { DEG, lerp, smoothstep, TAU } from './math'
import type { Palette } from './palette'

// A small plane that tows Kaan's email across the sky, the way planes tow
// ads along a beach in summer. It crosses the view in PASS seconds, high up
// where the sky is, from the side the page's words are on toward the side
// the city is on, so the banner ends its pass in the open. The cloth flaps
// behind it, lit from below by the city; the plane's own lights blink.

/** Seconds from one edge of the view to the other, banner and all. */
export const PASS = 5

/** The banner's length, in the city's units. The rest is sized from it. */
const LENGTH = 10
/** The plane is drawn this much bigger than it is built below, to hold its own against the banner. */
const CRAFT = 1.4
/** From the plane's origin forward to the propeller, and back to the tow hook. */
const NOSE = 0.66 * CRAFT
const TAIL = 0.48 * CRAFT
const ROPE = 1.9

/** Tags a part of the plane: 0 painted skin, 1 lit cabin, 2 dark metal. */
function part(g: BufferGeometry, tone: number) {
  const geometry = g.index ? g.toNonIndexed() : g
  geometry.deleteAttribute('uv')
  const n = geometry.getAttribute('position').count
  geometry.setAttribute('aTone', new BufferAttribute(new Float32Array(n).fill(tone), 1))
  return geometry
}

/** A high-wing tow plane, nose along +x, right wing along +z. */
function aircraft() {
  // Cylinders stand along y; this lays one along x with its top forward.
  const along = (g: BufferGeometry) => g.rotateZ(-Math.PI / 2)
  const parts = [
    part(along(new CylinderGeometry(0.075, 0.03, 0.95, 12)), 0),
    part(along(new CylinderGeometry(0.056, 0.075, 0.16, 12)).translate(0.555, 0, 0), 0),
    part(new BoxGeometry(0.3, 0.09, 0.13).translate(0.16, 0.075, 0), 1),
    part(new BoxGeometry(0.23, 0.024, 1.9).translate(0.15, 0.135, 0), 0),
    part(new BoxGeometry(0.2, 0.21, 0.016).translate(-0.4, 0.1, 0), 0),
    part(new BoxGeometry(0.16, 0.016, 0.6).translate(-0.41, 0.015, 0), 0),
  ]
  for (const side of [-1, 1]) {
    // The struts from the belly out to the wing, the legs, the wheels.
    parts.push(part(new BoxGeometry(0.018, 0.018, 0.43).rotateX(-side * 0.41).translate(0.13, 0.035, side * 0.255), 2))
    parts.push(part(new BoxGeometry(0.02, 0.12, 0.02).rotateX(-side * 0.59).translate(0.3, -0.105, side * 0.08), 2))
    parts.push(part(new CylinderGeometry(0.042, 0.042, 0.026, 12).rotateX(Math.PI / 2).translate(0.3, -0.16, side * 0.11), 2))
  }
  const geometry = mergeGeometries(parts, false)
  for (const p of parts) p.dispose()
  if (!geometry) throw new Error('banner: could not build the plane')
  return geometry.scale(CRAFT, CRAFT, CRAFT)
}

/**
 * The words, white on black: the banner's shader reads them as a mask, so
 * the ink and the cloth take the palette's colours. The canvas keeps its
 * first width; a font that arrives later is fitted into it.
 */
function inkCanvas(text: string, family: string) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const height = 160
  const size = 104
  const fontAt = (px: number) => `500 ${px}px ${family}`
  if (ctx) {
    ctx.font = fontAt(size)
    canvas.width = Math.min(4096, Math.ceil(ctx.measureText(text).width + height * 1.3))
  }
  canvas.height = height
  const draw = () => {
    if (!ctx) return
    ctx.font = fontAt(size)
    const room = canvas.width - height * 1.1
    const px = Math.min(size, (size * room) / Math.max(1, ctx.measureText(text).width))
    ctx.font = fontAt(px)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, height)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    // Lowercase words: centre the x-height, not the capitals.
    const x = ctx.measureText('x').actualBoundingBoxAscent || px * 0.45
    ctx.fillText(text, canvas.width / 2, height / 2 + x / 2)
  }
  draw()
  return { canvas, draw, spec: fontAt(size) }
}

export function createBanner(palette: Palette, text: string, family: string, anisotropy: number) {
  const group = new Group()
  const craft = new Group()
  group.add(craft)

  // ------------------------------------------------------------ the plane
  const craftGeometry = aircraft()
  const craftMaterial = new ShaderMaterial({
    uniforms: {
      cPaint: { value: palette.heading },
      cMetal: { value: palette.background },
      cWarm: { value: palette.city },
      cSky: { value: palette.sky },
    },
    vertexShader: /* glsl */ `
      attribute float aTone;
      varying float vTone;
      varying vec3 vN;
      varying vec3 vPosW;
      void main() {
        vTone = aTone;
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 cPaint, cMetal, cWarm, cSky;
      varying float vTone;
      varying vec3 vN;
      varying vec3 vPosW;
      void main() {
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vPosW);
        vec3 skin = vTone > 1.5 ? cMetal * 1.4 : cPaint;
        // At night the city lights it from below, the sky a little from above.
        vec3 col = skin * (0.1 + cWarm * 0.42 * max(-N.y, 0.0) + cSky * 0.1 * max(N.y, 0.0));
        col += cSky * pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.22;
        if (vTone > 0.5 && vTone < 1.5) col = cWarm * (0.55 + 0.25 * max(dot(N, V), 0.0));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
  const body = new Mesh(craftGeometry, craftMaterial)

  // The propeller, too fast to see: a faint disc with the blades strobing in it.
  const propMaterial = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, cTint: { value: palette.heading } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 cTint;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        float blade = pow(abs(cos(atan(p.y, p.x) + uTime * 7.0)), 18.0);
        float a = (0.05 + 0.2 * blade) * smoothstep(1.0, 0.82, r) * smoothstep(0.06, 0.22, r);
        gl_FragColor = vec4(cTint * a, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  })
  const prop = new Mesh(new CircleGeometry(0.22 * CRAFT, 32).rotateY(Math.PI / 2).translate(0.64 * CRAFT, 0, 0), propMaterial)

  // Navigation lights: red on the left wingtip, green on the right, white
  // at the tail; strobes that double-flash on both tips, a red beacon on the fin.
  const red = [1, 0.28, 0.22]
  const green = [palette.accent.r, palette.accent.g, palette.accent.b]
  const white = [palette.heading.r, palette.heading.g, palette.heading.b]
  const lights: [number[], number[], number, number][] = [
    [[0.15, 0.135, -0.96], red, 0, 9],
    [[0.15, 0.135, 0.96], green, 0, 9],
    [[-0.49, 0.03, 0], white, 0, 7],
    [[0.13, 0.135, -0.97], white, 1, 18],
    [[0.13, 0.135, 0.97], white, 1, 18],
    [[-0.42, 0.215, 0], red, 2, 12],
  ]
  const lightGeometry = new BufferGeometry()
  lightGeometry.setAttribute('position', new BufferAttribute(new Float32Array(lights.flatMap(([p]) => p.map((c) => c * CRAFT))), 3))
  lightGeometry.setAttribute('aColor', new BufferAttribute(new Float32Array(lights.flatMap(([, c]) => c)), 3))
  lightGeometry.setAttribute('aKind', new BufferAttribute(new Float32Array(lights.map(([, , k]) => k)), 1))
  lightGeometry.setAttribute('aSize', new BufferAttribute(new Float32Array(lights.map(([, , , s]) => s)), 1))
  const lightMaterial = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aKind;
      attribute float aSize;
      uniform float uTime, uPixelRatio;
      varying vec3 vColor;
      void main() {
        float on = 1.0;
        if (aKind > 0.5 && aKind < 1.5) {
          float f = fract(uTime / 1.2);
          on = step(f, 0.04) + step(0.13, f) * step(f, 0.17);
        } else if (aKind > 1.5) {
          on = pow(max(sin(uTime * 3.4), 0.0), 5.0);
        }
        vColor = aColor * on;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        gl_FragColor = vec4(vColor * (exp(-r * r * 5.0) * 0.8 + exp(-r * r * 30.0)), 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const navLights = new Points(lightGeometry, lightMaterial)
  craft.add(body, prop, navLights)

  // ------------------------------------------------------------ the banner
  const ink = inkCanvas(text, family)
  const texture = new CanvasTexture(ink.canvas)
  texture.anisotropy = anisotropy
  document.fonts?.load(ink.spec).then(() => {
    ink.draw()
    texture.needsUpdate = true
  }, () => undefined)
  const height = (LENGTH * ink.canvas.height) / ink.canvas.width
  const clothMaterial = new ShaderMaterial({
    uniforms: {
      tInk: { value: texture },
      uTime: { value: 0 },
      /** 1 when the rope holds the banner by its right-hand end (uv.x 1), 0 by its left. */
      uHeld: { value: 0 },
      uHeight: { value: height },
      cCloth: { value: palette.heading },
      cInk: { value: palette.background },
      cHem: { value: palette.accent },
      cWarm: { value: palette.city },
    },
    vertexShader: /* glsl */ `
      uniform float uTime, uHeld, uHeight;
      varying vec2 vUv;
      varying float vLight;
      void main() {
        vUv = uv;
        // s: 0 where the rope holds the cloth, 1 at the end that flies free.
        float s = mix(uv.x, 1.0 - uv.x, uHeld);
        float amp = uHeight * (0.025 + 0.2 * s * s);
        float ph = s * 10.0 - uTime * 7.5 + uv.y * 0.9;
        float ph2 = ph * 2.2 + 1.3 - uv.y * 1.7;
        vec3 p = position;
        p.z += (sin(ph) + 0.35 * sin(ph2)) * amp;
        // The free end flutters up and down, and its corners most.
        float corner = abs(uv.y - 0.5) * 2.0;
        p.y += (sin(ph * 0.5) * 0.06 + sin(ph2 * 1.3) * 0.03 * corner) * uHeight * s * s;
        // The folds catch the light or turn away from it.
        vLight = 0.86 + 0.2 * clamp((cos(ph) + 0.6 * cos(ph2)) * amp * 3.5 / uHeight, -1.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tInk;
      uniform vec3 cCloth, cInk, cHem, cWarm;
      varying vec2 vUv;
      varying float vLight;
      void main() {
        float ink = texture2D(tInk, vUv).r;
        // A leaf-green hem along the top and the bottom.
        float w = fwidth(vUv.y);
        float hem = 1.0 - smoothstep(0.045 - w, 0.045 + w, min(vUv.y, 1.0 - vUv.y));
        // Lit from below by the city: warmer and brighter toward the bottom.
        vec3 cloth = mix(cCloth, cHem, hem) * (0.84 - 0.16 * vUv.y) + cWarm * 0.1 * (1.0 - vUv.y);
        gl_FragColor = vec4(mix(cloth, cInk, ink) * vLight, 1.0);
      }
    `,
    side: DoubleSide,
  })
  const cloth = new Mesh(new PlaneGeometry(LENGTH, height, 64, 4), clothMaterial)
  cloth.position.x = -(TAIL + ROPE + LENGTH / 2)

  // The pole that keeps the leading edge upright, and the rope to the hook:
  // one line to a ring, then a bridle to the top and the bottom of the pole.
  const hold = -(TAIL + ROPE)
  const pole = new Mesh(new BoxGeometry(0.06, height * 1.08, 0.06).translate(hold, 0, 0), craftMaterial)
  pole.geometry.deleteAttribute('uv')
  pole.geometry.setAttribute('aTone', new BufferAttribute(new Float32Array(pole.geometry.getAttribute('position').count).fill(2), 1))
  const ring = hold + ROPE * 0.28
  const ropeGeometry = new BufferGeometry()
  ropeGeometry.setAttribute(
    'position',
    new BufferAttribute(
      new Float32Array([
        -TAIL, 0.02 * CRAFT, 0, ring, 0, 0,
        ring, 0, 0, hold, height * 0.5, 0,
        ring, 0, 0, hold, -height * 0.5, 0,
      ]),
      3
    )
  )
  const ropeMaterial = new LineBasicMaterial({ color: palette.heading.clone().multiplyScalar(0.45) })
  const rope = new LineSegments(ropeGeometry, ropeMaterial)
  group.add(cloth, pole, rope)

  for (const o of [body, prop, navLights, cloth, pole, rope]) o.frustumCulled = false
  group.visible = false

  // ------------------------------------------------------------ the flight
  let flying = false
  let t = 0
  let dir: 1 | -1 = -1
  let depth = 20
  let row = 0.5
  const a = new Vector3()
  const b = new Vector3()
  const xAxis = new Vector3()
  const yAxis = new Vector3(0, 1, 0)
  const zAxis = new Vector3()
  const basis = new Matrix4()

  /** A point on the ray through a spot on the screen, at the flight's depth, in the camera's frame. */
  const ray = (camera: PerspectiveCamera, nx: number, ny: number, out: Vector3) => {
    out.set(nx, ny, 0.5).applyMatrix4(camera.projectionMatrixInverse)
    return out.multiplyScalar(depth / -out.z)
  }

  const stop = () => {
    flying = false
    group.visible = false
  }

  return {
    group,
    /** True while a pass is under way. */
    get flying() {
      return flying
    },
    /**
     * Sets off. direction: +1 flies left to right, -1 right to left. row:
     * how high on the screen, -1 at the bottom and 1 at the top.
     */
    launch(camera: PerspectiveCamera, direction: 1 | -1, row0: number) {
      const aspect = camera.aspect
      // The banner's height as a share of the view's: big enough to read on
      // a phone, where it is wider than the screen, and on a wide screen,
      // where it spans half of it.
      const share = lerp(0.056, 0.08, smoothstep(0.46, 1.4, aspect))
      depth = height / (share * 2 * Math.tan((camera.fov * DEG) / 2))
      dir = direction
      row = row0
      t = 0
      // The words read left to right either way: turned round when the
      // plane flies left, so the rope holds the cloth by its left end.
      cloth.rotation.y = dir < 0 ? Math.PI : 0
      clothMaterial.uniforms.uHeld.value = dir > 0 ? 1 : 0
      flying = true
      group.visible = true
    },
    stop,
    /** Moves the plane along its pass for the camera as it stands this frame. */
    update(dt: number, camera: PerspectiveCamera) {
      if (!flying) return
      t += dt
      const u = t / PASS
      if (u >= 1) {
        stop()
        return
      }
      camera.updateMatrixWorld()
      // A shallow arc across the sky, and a little unsteadiness in the air.
      const ny = row + 0.05 * Math.sin(Math.PI * u) + 0.012 * Math.sin(t * 2.1)
      const left = ray(camera, -1, ny, a).x
      const right = ray(camera, 1, ny, b).x
      const trail = TAIL + ROPE + LENGTH + 0.6
      const [x0, x1] = dir < 0 ? [right + NOSE + 0.6, left - trail] : [left - NOSE - 0.6, right + trail]
      // A touch slower mid-screen, where the words are read.
      const p = u + (0.22 * Math.sin(TAU * u)) / TAU
      group.position.set(lerp(x0, x1, p), b.y, -depth).applyMatrix4(camera.matrixWorld)
      // Level flight along the screen, whatever the camera's pitch.
      xAxis.setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize().multiplyScalar(dir)
      zAxis.crossVectors(xAxis, yAxis)
      basis.makeBasis(xAxis, yAxis, zAxis)
      group.quaternion.setFromRotationMatrix(basis)
      craft.rotation.set(0.07 * Math.sin(t * 1.3), 0, 0.03 * Math.sin(t * 0.9 + 1))
      propMaterial.uniforms.uTime.value = t
      lightMaterial.uniforms.uTime.value = t
      clothMaterial.uniforms.uTime.value = t
    },
    setPixelRatio(pixelRatio: number) {
      lightMaterial.uniforms.uPixelRatio.value = pixelRatio
    },
    dispose() {
      craftGeometry.dispose()
      craftMaterial.dispose()
      prop.geometry.dispose()
      propMaterial.dispose()
      lightGeometry.dispose()
      lightMaterial.dispose()
      cloth.geometry.dispose()
      clothMaterial.dispose()
      texture.dispose()
      pole.geometry.dispose()
      ropeGeometry.dispose()
      ropeMaterial.dispose()
    },
  }
}

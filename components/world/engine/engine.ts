import {
  ColorManagement,
  LinearSRGBColorSpace,
  Mesh,
  NoToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  type Texture,
} from 'three'
import { worldStore } from '../store'
import { createEarth } from './earth'
import { createModel } from './llm'
import { angleDelta, clamp, dampFactor, DEG, easeOutCubic, lerp, smoothstep, TAU } from './math'
import { createOrbits } from './orbits'
import { createPhysics } from './physics'
import { readPalette } from './palette'
import { createPlanets } from './planets'
import { detectQuality, type Quality } from './quality'
import {
  blend,
  frameToColumn,
  HOME,
  resolve,
  ROUTES,
  routeKind,
  SCENES,
  SHOT_KEYS,
  type RouteKind,
  type Shot,
  type ShotSpec,
} from './shots'
import { bakeClouds, createBackground, createStars } from './sky'
import { createSun } from './sun'
import { APPROACH, createTunnel } from './tunnel'

export interface Anchor {
  id: string
  top: number
  height: number
}

export type CaptionKey = 'saturn' | 'blackHole' | 'transformer' | 'refusal' | 'harmful' | 'harmless' | 'answer'

/** DOM labels the engine pins to points in the scene, every frame. */
export interface EngineLabels {
  /** The light's label, and the text inside it the engine rewrites as the light travels. */
  place: HTMLElement | null
  placeText: HTMLElement | null
  names: { istanbul: string; padova: string }
  /** Captions in the resume's scenes. */
  captions: Partial<Record<CaptionKey, HTMLElement>>
  /** One per word of the prompt the transformer reads. */
  tokens: HTMLElement[]
}

export interface EngineOptions {
  /** 'full' plays the ride in from deep space; 'none' only settles into orbit. */
  intro: 'full' | 'none'
  reducedMotion: boolean
  route: string
  labels: EngineLabels
  quality?: string | null
  /** 'on' exposes window.__world; 'paused' also stops the clock so only __world.advance moves it. */
  debug?: 'on' | 'paused' | null
}

/** One breath, in seconds. The same as --breath in app/globals.css. */
export const BREATH = 7
const SPACE_T = 2.1
const TUBE_T = 3.0
/** After this long the ride stops waiting for the network and lands anyway. */
const MAX_RIDE = 20
const ARRIVED_KEY = 'world:arrived'

type EnginePhase = 'space' | 'tunnel' | 'live'

export class Engine {
  private readonly renderer: WebGLRenderer
  private readonly scene = new Scene()
  private readonly camera = new PerspectiveCamera(40, 1, 0.05, 1000)
  private readonly quality: Quality
  private readonly opts: EngineOptions

  private readonly background: ReturnType<typeof createBackground>
  private readonly stars: ReturnType<typeof createStars>
  private readonly planets: ReturnType<typeof createPlanets>
  private readonly tunnel: ReturnType<typeof createTunnel>
  private readonly earth: ReturnType<typeof createEarth>
  private readonly orbits: ReturnType<typeof createOrbits>
  private readonly sun: ReturnType<typeof createSun>
  private readonly physics: ReturnType<typeof createPhysics>
  private readonly model: ReturnType<typeof createModel>
  private readonly clouds: ReturnType<typeof bakeClouds>
  private readonly flash: Mesh<PlaneGeometry, ShaderMaterial>

  private phase: EnginePhase = 'live'
  private time = 0
  private raf = 0
  private last = 0
  private running = false
  private hidden = false

  // the ride
  private rideT = 0
  private s = 0
  private tubeT = 0
  private loadedTasks = 0
  private readonly totalTasks = 4
  private frontier = 0
  private flashLevel = 0
  private shake = 0
  private arriveT = 99
  private revealed = false

  // live camera
  private route: RouteKind = 'home'
  private readonly cur: Shot
  private readonly target: Shot
  private spin = 0
  private drift = 0
  private anchors: { id: string; at: number }[] = []
  private anchorSource: Anchor[] = []
  private scrollY = 0
  private docHeight = 0
  /** Right edge of the page's text column, in px, where the page reports one. */
  private textEdge = 0
  private width = 1
  private height = 1
  private pixelRatio = 1
  private highlightIndex: number | null = null
  private placeLon = 0
  private placeText = ''
  private canvasOpacity = -1
  /** 0..1, the canvas fading in over the CSS sky when the world first draws. */
  private fade = 0

  // adaptive resolution
  private slowFor = 0
  private frameAvg = 16

  private readonly look = new Vector3()
  private readonly v = new Vector3()

  constructor(private readonly host: HTMLElement, opts: EngineOptions) {
    this.opts = opts
    // Colours arrive from the stylesheet as display values and leave the
    // shaders as display values. Converting them to linear light and back
    // would shift every token.
    ColorManagement.enabled = false

    this.renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    this.renderer.outputColorSpace = LinearSRGBColorSpace
    this.renderer.toneMapping = NoToneMapping
    const canvas = this.renderer.domElement
    canvas.setAttribute('aria-hidden', 'true')
    canvas.className = 'world-canvas'
    host.appendChild(canvas)

    this.quality = detectQuality(this.renderer.getContext(), opts.quality)
    const palette = readPalette()
    this.renderer.setClearColor(palette.space)

    this.background = createBackground(this.renderer, palette, this.quality.backgroundSize, this.quality.octaves)
    this.stars = createStars(this.quality.stars, palette)
    this.planets = createPlanets(palette, this.quality.octaves, this.quality.sphereSegments)
    this.tunnel = createTunnel(palette, this.quality)
    this.clouds = bakeClouds(this.renderer, this.quality.cloudMapSize, this.quality.octaves)
    this.earth = createEarth(palette, this.quality, this.clouds.texture)
    this.orbits = createOrbits(palette)
    this.sun = createSun(palette, this.earth.sunDir)
    this.physics = createPhysics(palette, this.quality, this.background.material.uniforms.uMap.value)
    this.model = createModel(palette, opts.labels.tokens.length || 6)

    this.flash = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        uniforms: { uFlash: { value: 0 }, cA: { value: palette.heading }, cB: { value: palette.sun } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform float uFlash;
          uniform vec3 cA, cB;
          varying vec2 vUv;
          void main() {
            float r = length(vUv - 0.5) * 1.6;
            gl_FragColor = vec4(mix(cA, cB, clamp(r, 0.0, 1.0) * 0.7), uFlash * (1.0 - 0.3 * r * r));
          }
        `,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      })
    )
    this.flash.frustumCulled = false
    this.flash.renderOrder = 999

    this.scene.add(
      this.background.mesh,
      this.stars.points,
      this.planets.group,
      this.tunnel.group,
      this.earth.group,
      this.orbits.group,
      this.sun.mesh,
      this.physics.group,
      this.model.group,
      this.flash
    )

    this.route = routeKind(opts.route)
    this.cur = { ...this.shotFor(this.route) }
    this.target = { ...this.cur }

    this.resize()
    this.loadTextures()
    this.renderer
      .compileAsync(this.scene, this.camera)
      .catch(() => undefined)
      .then(() => this.taskDone())

    canvas.addEventListener('webglcontextlost', this.onContextLost)

    if (opts.intro === 'full' && this.route === 'home' && !opts.reducedMotion) {
      this.startRide()
    } else {
      this.settle(!opts.reducedMotion)
    }

    if (opts.debug) {
      ;(window as unknown as { __world: unknown }).__world = {
        engine: this,
        advance: (seconds: number) => this.advance(seconds),
      }
    }
    this.setRoute(opts.route)
    if (opts.debug !== 'paused') this.start()
    else this.renderFrame()
  }

  // ------------------------------------------------------------------ public

  setRoute(pathname: string) {
    const kind = routeKind(pathname)
    this.route = kind
    this.computeAnchors()
    const wasHidden = this.hidden
    this.hidden = kind === 'hidden'
    this.host.dataset.route = kind
    if (this.hidden) {
      this.stop()
      return
    }
    if (this.phase !== 'live' && kind !== 'home') this.skip()
    if (wasHidden && !this.opts.reducedMotion) this.arriveT = 0
    if (this.opts.debug !== 'paused') this.start()
    if (this.opts.reducedMotion) this.snap()
  }

  setAnchors(anchors: Anchor[], docHeight: number, textEdge = 0) {
    this.anchorSource = anchors
    this.docHeight = docHeight
    this.textEdge = textEdge
    this.computeAnchors()
    if (this.opts.reducedMotion) this.snap()
  }

  setScroll(y: number) {
    this.scrollY = y
    if (this.opts.reducedMotion) this.snap()
  }

  setHighlight(index: number | null) {
    this.highlightIndex = index
    if (this.opts.reducedMotion) this.renderFrame()
  }

  skip() {
    if (this.phase === 'live') return
    this.land(false)
  }

  replay() {
    if (this.route !== 'home' || this.opts.reducedMotion) return
    document.documentElement.setAttribute('data-intro', 'play')
    window.scrollTo(0, 0)
    this.scrollY = 0
    this.startRide()
    this.frontier = 0
  }

  dispose() {
    this.stop()
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost)
    this.background.dispose()
    this.stars.dispose()
    this.planets.dispose()
    this.tunnel.dispose()
    this.earth.dispose()
    this.orbits.dispose()
    this.sun.dispose()
    this.physics.dispose()
    this.model.dispose()
    this.clouds.dispose()
    this.flash.geometry.dispose()
    this.flash.material.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }

  resize() {
    const w = Math.max(1, this.host.clientWidth)
    const h = Math.max(1, this.host.clientHeight)
    this.width = w
    this.height = h
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, this.quality.maxPixelRatio)
    this.renderer.setPixelRatio(this.pixelRatio)
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.computeAnchors()
    if (this.opts.reducedMotion) this.snap()
  }

  // ------------------------------------------------------------------ loop

  private start() {
    if (this.running || this.hidden) return
    this.running = true
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  private stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  private frame = (now: number) => {
    if (!this.running) return
    this.raf = requestAnimationFrame(this.frame)
    const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000))
    this.last = now
    if (this.opts.reducedMotion) {
      // Nothing moves on its own; the loop only exists to settle once.
      this.running = false
      this.snap()
      return
    }
    this.tick(dt)
    this.renderFrame()
    this.adapt(dt)
  }

  /** Steps the clock by a fixed amount and draws once. For screenshots. */
  private advance(seconds: number) {
    const step = 1 / 60
    for (let t = 0; t < seconds - 1e-6; t += step) this.tick(step)
    this.renderFrame()
  }

  private tick(dt: number) {
    this.time += dt
    const breath = 0.5 - 0.5 * Math.cos((this.time / BREATH) * TAU)

    if (this.phase === 'live') this.tickLive(dt)
    else this.tickRide(dt)

    if (this.flashLevel > 0 && this.phase === 'live') this.flashLevel *= Math.exp(-dt * 4.2)
    if (this.flashLevel < 0.002) this.flashLevel = 0
    this.flash.material.uniforms.uFlash.value = this.flashLevel
    this.flash.visible = this.flashLevel > 0

    const su = this.stars.material.uniforms
    su.uTime.value = this.time
    su.uBreath.value = breath
    su.uPixelRatio.value = this.pixelRatio
    this.background.mesh.position.copy(this.camera.position)
    this.stars.points.position.copy(this.camera.position)

    this.earth.update(this.time, dt, breath, this.pixelRatio, 1, this.cur.aurora)
    const light = this.earth.setPlace(this.cur.place)
    this.placeLon = light.lon
    this.writePlace(light.lat, light.lon)
    this.earth.setBeaconOpacity(this.cur.beacon)
    const live = this.phase === 'live'
    this.physics.update(this.time, breath, live ? this.cur.physics : 0)
    this.model.update(this.time, breath, live ? this.cur.llm : 0, this.pixelRatio)
    this.orbits.update(this.time, dt, this.phase === 'live' ? this.cur.orbits : 0, this.highlightIndex, this.pixelRatio)
    this.sun.update(this.phase === 'live' ? this.cur.sun : 0, breath)
    this.planets.update(this.time)
  }

  private renderFrame() {
    this.renderer.render(this.scene, this.camera)
    this.placeLabels()
  }

  private adapt(dt: number) {
    this.frameAvg += (dt * 1000 - this.frameAvg) * 0.05
    this.slowFor = this.frameAvg > 28 ? this.slowFor + dt : 0
    if (this.slowFor > 2 && this.pixelRatio > 0.75) {
      this.pixelRatio = Math.max(0.75, this.pixelRatio - 0.25)
      this.renderer.setPixelRatio(this.pixelRatio)
      this.renderer.setSize(this.width, this.height, false)
      this.slowFor = 0
      this.frameAvg = 16
    }
  }

  // ------------------------------------------------------------------ the ride

  private startRide() {
    this.phase = 'space'
    this.rideT = 0
    this.s = 0
    this.tubeT = 0
    this.revealed = false
    this.arriveT = 99
    this.flashLevel = 0
    this.setRideVisibility(true)
    worldStore.set({ phase: 'space', percent: 0 })
  }

  private setRideVisibility(riding: boolean) {
    this.planets.group.visible = riding
    this.tunnel.group.visible = riding
    this.earth.group.visible = !riding
    this.orbits.group.visible = !riding
  }

  private tickRide(dt: number) {
    this.rideT += dt
    const loaded = this.loadedTasks / this.totalTasks
    this.frontier += (loaded - this.frontier) * dampFactor(3.5, dt)
    if (loaded >= 1 && this.frontier > 0.992) this.frontier = 1

    const L = this.tunnel.length
    if (this.phase === 'space') {
      const k = Math.min(1, this.rideT / SPACE_T)
      this.s = APPROACH * k * k
      if (k >= 1) {
        this.phase = 'tunnel'
        worldStore.set({ phase: 'tunnel' })
      }
    } else {
      const vA = (2 * APPROACH) / SPACE_T
      const a = (2 * (L - vA * TUBE_T)) / (TUBE_T * TUBE_T)
      const allowed = this.frontier >= 1 ? Infinity : APPROACH + Math.max(0, this.frontier - 0.04) * L
      const gate = allowed === Infinity ? 1 : smoothstep(0, 16, allowed - this.s)
      this.tubeT += dt * gate
      this.s = Math.min(APPROACH + vA * this.tubeT + 0.5 * a * this.tubeT * this.tubeT, APPROACH + L)
    }

    const u = this.tunnel.pose(this.s, this.camera.position, this.look)
    // Past the mouth the giant and the moon are behind the walls.
    this.planets.group.visible = this.s < APPROACH + 6
    const c = this.camera
    c.up.set(0, 1, 0)
    c.lookAt(this.look)
    c.rotateZ(Math.sin(u * Math.PI * 3) * 0.24 * smoothstep(0, 0.08, u))
    c.fov = this.phase === 'space' ? 50 : lerp(50, 80, smoothstep(0, 0.6, u))
    c.clearViewOffset()
    c.updateProjectionMatrix()

    this.tunnel.update(this.time, this.frontier, u, 1)
    this.flashLevel = smoothstep(0.94, 1, u)
    this.fade = Math.min(1, this.fade + dt / 0.9)
    this.setCanvasOpacity(this.fade)
    worldStore.set({ percent: Math.min(100, Math.floor(u * 100.5)) })

    if (u >= 0.999 || this.rideT > MAX_RIDE) this.land(true)
  }

  /** Out of the tube: the flash, the cut to the planet, the page. */
  private land(boom: boolean) {
    this.phase = 'live'
    this.setRideVisibility(false)
    this.settle(true, boom)
    this.flashLevel = boom ? 1 : 0
    this.shake = boom ? 1 : 0
    worldStore.set({ phase: 'arrive', percent: 100 })
    if (!boom) this.reveal()
  }

  /** Start just off the target shot and let the damping bring the camera in. */
  private settle(animate: boolean, far = false) {
    this.phase = 'live'
    this.setRideVisibility(false)
    this.shotFor(this.route, this.target)
    Object.assign(this.cur, this.target)
    this.spin = this.faceAngle(this.cur)
    this.drift = this.spin
    if (animate) {
      const k = far ? 1 : 0.35
      this.cur.dist = this.target.dist * (1 + 1.9 * k)
      this.cur.lat = this.target.lat + 14 * k
      this.cur.lon = this.target.lon - 48 * k
      this.cur.roll = this.target.roll + 24 * k
      this.cur.fov = this.target.fov + 14 * k
      this.cur.pitch = this.target.pitch * (1 - 0.5 * k)
      this.spin -= 0.9 * k
      this.arriveT = 0
    } else {
      this.arriveT = 99
    }
    if (!far) this.reveal()
  }

  private reveal() {
    if (this.revealed) return
    this.revealed = true
    document.documentElement.setAttribute('data-intro', 'done')
    worldStore.set({ phase: 'live' })
    try {
      sessionStorage.setItem(ARRIVED_KEY, '1')
    } catch {
      // private mode: the ride will simply play again next time
    }
  }

  // ------------------------------------------------------------------ live

  private tickLive(dt: number) {
    this.arriveT += dt
    if (!this.revealed && this.arriveT > 0.45) this.reveal()

    this.targetShot(this.target)
    const lambda = this.arriveT < 3 ? lerp(1.5, 3.2, smoothstep(0.8, 3, this.arriveT)) : 3.2
    const f = dampFactor(lambda, dt)
    for (const k of SHOT_KEYS) this.cur[k] += (this.target[k] - this.cur[k]) * f

    // The planet turns on its own, or turns Istanbul toward the camera.
    const face = clamp(this.cur.face)
    this.drift += dt * 0.028 * (1 - face)
    this.drift += angleDelta(this.drift, this.spin) * face * dampFactor(2, dt)
    const facing = this.faceAngle(this.cur)
    const desired = this.drift + angleDelta(this.drift, facing) * face
    this.spin += angleDelta(this.spin, desired) * dampFactor(this.arriveT < 3 ? 1.6 : 2.4, dt)

    this.shake *= Math.exp(-dt * 3.4)
    this.fade = Math.min(1, this.fade + dt / 1.1)
    this.applyShot(this.cur)
    this.applyCanvasOpacity()
  }

  /** The spin that puts the light faceOffset degrees east of the camera's meridian. */
  private faceAngle(shot: Shot) {
    return (shot.lon + shot.faceOffset - this.placeLon) * DEG
  }

  private applyShot(shot: Shot) {
    const c = this.camera
    const lat = shot.lat * DEG
    const lon = shot.lon * DEG
    c.position.set(
      shot.cx + shot.dist * Math.cos(lat) * Math.cos(lon),
      shot.cy + shot.dist * Math.sin(lat),
      shot.cz - shot.dist * Math.cos(lat) * Math.sin(lon)
    )
    c.up.set(0, 1, 0)
    c.lookAt(shot.cx, shot.cy, shot.cz)
    c.rotateX(shot.pitch * DEG)
    c.rotateY(shot.yaw * DEG)
    c.rotateZ(shot.roll * DEG)
    if (this.shake > 0.001) {
      c.rotateX((Math.random() - 0.5) * 0.012 * this.shake)
      c.rotateY((Math.random() - 0.5) * 0.012 * this.shake)
    }
    c.fov = shot.fov
    c.setViewOffset(this.width, this.height, -shot.shiftX * this.width, shot.shiftY * this.height, this.width, this.height)
    c.updateProjectionMatrix()
    this.earth.spin.rotation.y = this.spin
  }

  private applyCanvasOpacity() {
    let o = this.cur.canvas * easeOutCubic(this.fade)
    // Over a page of text the planet steps back once the reader scrolls in.
    // The resume is the exception: its scenes are the point, and the page
    // lays a scrim under its text instead.
    if (this.route !== 'home' && this.route !== 'resume') o *= 1 - 0.62 * smoothstep(0, this.height * 0.9, this.scrollY)
    this.setCanvasOpacity(o)
  }

  private setCanvasOpacity(o: number) {
    if (Math.abs(o - this.canvasOpacity) > 0.002 || (o === 1 && this.canvasOpacity !== 1)) {
      this.canvasOpacity = o
      this.renderer.domElement.style.opacity = o.toFixed(3)
    }
  }

  /** Reduced motion: no flight, the camera cuts to where it should be. */
  private snap() {
    if (this.hidden) return
    this.fade = 1
    this.targetShot(this.target, true)
    Object.assign(this.cur, this.target)
    this.spin = this.faceAngle(this.cur) * this.cur.face + this.spin * (1 - this.cur.face)
    this.phase = 'live'
    this.setRideVisibility(false)
    this.tick(0)
    this.applyShot(this.cur)
    this.applyCanvasOpacity()
    this.reveal()
    this.renderFrame()
  }

  /** Pages whose shot follows the reader: the home page's sections, the resume's entries. */
  private table(): Record<string, ShotSpec> | null {
    return this.route === 'home' ? HOME : this.route === 'resume' ? SCENES : null
  }

  private shotFor(kind: RouteKind, out?: Shot): Shot {
    const portrait = this.width / this.height < 0.8
    const spec =
      kind === 'home' || kind === 'hidden' ? HOME.hero : kind === 'resume' ? SCENES.istanbul : ROUTES[kind]
    const shot = resolve(spec, portrait)
    return out ? Object.assign(out, shot) : { ...shot }
  }

  private computeAnchors() {
    const table = this.table()
    const max = Math.max(0, this.docHeight - this.height)
    // The reading line sits a little above the middle of the screen.
    this.anchors = table
      ? this.anchorSource
          .filter((a) => a.id in table)
          .map((a) => ({ id: a.id, at: clamp(a.top + a.height / 2 - this.height * 0.45, 0, max) }))
          .sort((a, b) => a.at - b.at)
      : []
  }

  private targetShot(out: Shot, cut = false) {
    this.followReader(out, cut)
    if (this.route === 'resume' && this.textEdge > 0 && this.width / this.height >= 0.8) {
      frameToColumn(out, this.width, this.textEdge)
    }
    return out
  }

  private followReader(out: Shot, cut: boolean) {
    const table = this.table()
    if (!table || this.anchors.length === 0) return this.shotFor(this.route, out)
    const portrait = this.width / this.height < 0.8
    const shotOf = (id: string) => resolve(table[id], portrait)
    const y = this.scrollY
    const list = this.anchors
    if (y <= list[0].at) return Object.assign(out, shotOf(list[0].id))
    for (let i = 0; i < list.length - 1; i++) {
      const a = list[i]
      const b = list[i + 1]
      if (y <= b.at) {
        const t = b.at > a.at ? (y - a.at) / (b.at - a.at) : 1
        // Hold each shot around its section, travel in between.
        const eased = smoothstep(0.18, 0.82, t)
        return cut ? Object.assign(out, shotOf(eased < 0.5 ? a.id : b.id)) : blend(shotOf(a.id), shotOf(b.id), eased, out)
      }
    }
    return Object.assign(out, shotOf(list[list.length - 1].id))
  }

  // ------------------------------------------------------------------ labels

  /** The light's label: the city's name, and coordinates that count as it travels. */
  private writePlace(lat: number, lon: number) {
    const { placeText, names } = this.opts.labels
    if (!placeText) return
    // Truncated, not rounded, the way the site has always written Istanbul.
    const f = (x: number) => (Math.floor(Math.abs(x) * 10) / 10).toFixed(1)
    const name = this.cur.place < 0.5 ? names.istanbul : names.padova
    const text = `${name} · ${f(lat)}°${lat >= 0 ? 'N' : 'S'} ${f(lon)}°${lon >= 0 ? 'E' : 'W'}`
    if (text !== this.placeText) {
      this.placeText = text
      placeText.textContent = text
    }
  }

  private readonly labelSizes = new WeakMap<HTMLElement, { w: number; h: number }>()
  /** Boxes of the labels already placed this frame, to keep the next ones clear of them. */
  private placed: [number, number, number, number][] = []

  private labelSize(el: HTMLElement) {
    let size = this.labelSizes.get(el)
    if (!size) {
      const text = el.querySelector<HTMLElement>('.world-label-text') ?? el.querySelector<HTMLElement>('span') ?? el
      size = { w: text.offsetWidth, h: text.offsetHeight }
      if (size.w > 0) this.labelSizes.set(el, size)
    }
    return size
  }

  /**
   * Moves a label to a point in the scene. 'tick' labels hang to the right
   * of their point on a short tick, or to the left when the right has no
   * room; 'center' labels sit centred on it; 'token' labels hang centred
   * under it. Labels are placed in the order they are called, and one that
   * would leave the screen or land on a label already placed stays hidden.
   * The CSS offsets of each style are mirrored in the boxes below.
   */
  private pin(el: HTMLElement | null | undefined, at: Vector3, weight: number, mode: 'tick' | 'center' | 'token' = 'tick'): boolean {
    if (!el) return false
    let visible = 0
    if (weight > 0.01 && !this.hidden && this.phase === 'live') {
      this.v.copy(at).project(this.camera)
      const x = (this.v.x * 0.5 + 0.5) * this.width
      const y = (-this.v.y * 0.5 + 0.5) * this.height
      if (this.v.z < 1 && x > 0 && x < this.width && y > 0 && y < this.height) {
        const { w, h } = this.labelSize(el)
        const margin = 8
        let box: [number, number, number, number] | null = null
        let left = false
        if (mode === 'tick') {
          const right: [number, number, number, number] = [x + 44, y - 44, x + 44 + w, y - 44 + h]
          const leftBox: [number, number, number, number] = [x - 44 - w, y - 44, x - 44, y - 44 + h]
          if (this.fits(right, margin)) box = right
          else if (this.fits(leftBox, margin)) {
            box = leftBox
            left = true
          }
        } else {
          const top = mode === 'center' ? y - h / 2 : y
          const b: [number, number, number, number] = [x - w / 2, top, x + w / 2, top + h]
          if (this.fits(b, margin)) box = b
        }
        if (box) {
          this.placed.push(box)
          visible = weight * clamp(this.canvasOpacity)
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
          if (mode === 'tick') el.classList.toggle('world-label--left', left)
        }
      }
    }
    el.style.opacity = visible.toFixed(3)
    return visible > 0
  }

  private fits([x0, y0, x1, y1]: [number, number, number, number], margin: number) {
    if (x0 < margin || y0 < margin || x1 > this.width - margin || y1 > this.height - margin) return false
    return this.placed.every(([a0, b0, a1, b1]) => x1 + 4 < a0 || x0 - 4 > a1 || y1 + 2 < b0 || y0 - 2 > b1)
  }

  private placeLabels() {
    this.placed = []
    const { place, captions, tokens } = this.opts.labels
    const { position, facing } = this.earth.beacon(this.camera.position)
    this.pin(place, position, smoothstep(0.25, 0.5, facing) * smoothstep(0.85, 1, this.cur.beacon))

    const physics = smoothstep(0.6, 1, this.cur.physics)
    this.pin(captions.blackHole, this.physics.anchors.blackHole, physics)
    this.pin(captions.saturn, this.physics.anchors.saturn, physics)

    const llm = smoothstep(0.6, 1, this.cur.llm)
    const a = this.model.anchors
    this.pin(captions.transformer, a.transformer, llm, 'center')
    this.pin(captions.answer, a.answer, llm, 'center')
    this.pin(captions.refusal, a.refusal, llm, 'center')
    this.pin(captions.harmful, a.harmful, llm, 'center')
    this.pin(captions.harmless, a.harmless, llm, 'center')
    // The prompt reads as a sentence or not at all: if one word has no room,
    // none of them show.
    const before = this.placed.length
    const shown = tokens.map((el, i) => (a.tokens[i] ? this.pin(el, a.tokens[i], llm, 'token') : false))
    if (shown.some((ok) => !ok)) {
      tokens.forEach((el) => (el.style.opacity = '0'))
      this.placed.length = before
    }
  }

  // ------------------------------------------------------------------ loading

  private taskDone() {
    this.loadedTasks = Math.min(this.totalTasks, this.loadedTasks + 1)
  }

  private loadTextures() {
    const size = this.quality.textureSize
    const loader = new TextureLoader()
    const load = (file: string) =>
      new Promise<Texture | undefined>((done) => {
        loader.load(
          `/world/${file}`,
          (t) => done(t),
          undefined,
          () => done(undefined) // a missing texture costs detail, never the landing
        )
      }).then((t) => {
        this.taskDone()
        return t
      })
    load(`land-${size}.png`).then((land) => this.earth.setTextures({ land }))
    load(`lights-${size}.jpg`).then((lights) => this.earth.setTextures({ lights }))
    load(`biome-${size}.jpg`).then((biome) => this.earth.setTextures({ biome }))
  }

  private onContextLost = (event: Event) => {
    event.preventDefault()
    this.stop()
    this.renderer.domElement.style.opacity = '0'
    this.reveal()
    worldStore.set({ failed: true })
  }
}

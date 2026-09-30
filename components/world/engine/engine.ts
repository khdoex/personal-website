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
import { createBanner } from './banner'
import { ABOVE_ONLY, createAtmosphere, ISTANBUL_AT, PADOVA_AT } from './city/common'
import { createIstanbul } from './city/istanbul'
import { createPadova } from './city/padova'
import { createCitySky, followCamera } from './city/sky'
import { heightAt } from './city/terrain'
import { createEarth, ISTANBUL } from './earth'
import { createModel } from './llm'
import { clamp, dampFactor, DEG, easeInOutCubic, easeOutCubic, lerp, smoothstep, TAU } from './math'
import { createPhysics } from './physics'
import { readPalette } from './palette'
import { createPlanets } from './planets'
import { detectQuality, type Quality } from './quality'
import {
  blend,
  frameToColumn,
  HOME,
  placeOf,
  resolve,
  ROUTES,
  routeKind,
  SCENES,
  SHOT_KEYS,
  type Place,
  type RouteKind,
  type Shot,
  type ShotSpec,
} from './shots'
import { bakeClouds, createBackground, createStars } from './sky'
import { APPROACH, createTunnel } from './tunnel'
import { createVeil } from './veil'
import { createVisit, type Visit } from './visit'

export interface Anchor {
  id: string
  top: number
  height: number
}

export type CaptionKey = 'saturn' | 'blackHole' | 'transformer' | 'refusal' | 'harmful' | 'harmless' | 'answer'

/** DOM labels the engine pins to points in the scene, every frame. */
export interface EngineLabels {
  /** Captions in the resume's scenes. */
  captions: Partial<Record<CaptionKey, HTMLElement>>
  /** One per word of the prompt the transformer reads. */
  tokens: HTMLElement[]
}

export interface EngineOptions {
  /** 'full' plays the ride in from deep space; 'none' only settles into place. */
  intro: 'full' | 'none'
  reducedMotion: boolean
  route: string
  labels: EngineLabels
  quality?: string | null
  /** 'on' exposes window.__world; 'paused' also stops the clock so only __world.advance moves it. */
  debug?: 'on' | 'paused' | null
  /** What the plane's banner says: the email, from lib/site.ts. None, no plane. */
  email?: string
}

/** One breath, in seconds. The same as --breath in app/globals.css. */
export const BREATH = 7
const SPACE_T = 2.1
const TUBE_T = 3.0
/** From the mouth of the tube, down through the cloud to Istanbul. */
const DIVE_T = 2.8
/** The globe turns Istanbul to a camera at this longitude: just past the sunset, the lights coming on. */
const DIVE_LON = -33
/** After this long the ride stops waiting for the network and lands anyway. */
const MAX_RIDE = 20
/**
 * The same, in wall-clock seconds, for machines that draw too slowly for the
 * ride's own clock to be any guide: a page is never held back longer.
 */
const MAX_RIDE_WALL = 16
const REVEAL_WALL = 2.5
/** The page comes in this long after the camera breaks out of the cloud. */
const REVEAL_AFTER = 1.5
const ARRIVED_KEY = 'world:arrived'
/** The cloud over the city, by height above the water: thickest at peak. */
const CLOUD = { low: 300, peak: 600, high: 900 }
/** Seconds on the site before the plane with the email first flies over, and between its passes. */
const PLANE_FIRST = 120
const PLANE_EVERY = 120

type EnginePhase = 'space' | 'tunnel' | 'dive' | 'live'

const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

/** How much cloud is around a camera at this height over the city. */
function cloudAt(altitude: number) {
  return altitude < CLOUD.peak
    ? smoothstep(CLOUD.low, CLOUD.peak, altitude)
    : 1 - smoothstep(CLOUD.peak, CLOUD.high, altitude)
}

export class Engine {
  private readonly renderer: WebGLRenderer
  private readonly scene = new Scene()
  private readonly camera = new PerspectiveCamera(40, 1, 0.05, 5000)
  private readonly quality: Quality
  private readonly opts: EngineOptions

  private readonly background: ReturnType<typeof createBackground>
  private readonly stars: ReturnType<typeof createStars>
  private readonly planets: ReturnType<typeof createPlanets>
  private readonly tunnel: ReturnType<typeof createTunnel>
  private readonly earth: ReturnType<typeof createEarth>
  private readonly atmos: ReturnType<typeof createAtmosphere>
  private readonly istanbul: ReturnType<typeof createIstanbul>
  private readonly padova: ReturnType<typeof createPadova>
  private readonly sky: ReturnType<typeof createCitySky>
  private readonly physics: ReturnType<typeof createPhysics>
  private readonly model: ReturnType<typeof createModel>
  private readonly clouds: ReturnType<typeof bakeClouds>
  private readonly veil: ReturnType<typeof createVeil>
  private readonly flash: Mesh<PlaneGeometry, ShaderMaterial>
  /** Darkens the text's side of the frame, as much as the shot asks. */
  private readonly shade: Mesh<PlaneGeometry, ShaderMaterial>
  /** The plane that tows the email over the city, and the clock it keeps. */
  private readonly banner: ReturnType<typeof createBanner>
  private readonly visit: Visit

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
  private diveT = 0
  private diveVeil = 0
  private loadedTasks = 0
  private readonly totalTasks = 4
  private frontier = 0
  private flashLevel = 0
  private shake = 0
  private arriveT = 99
  private revealAt = 0.45
  private revealed = false
  /** performance.now() when the ride started, and when it came out of the cloud. */
  private rideWall = 0
  private arriveWall = 0

  // live camera
  private route: RouteKind = 'home'
  private readonly cur: Shot
  private readonly target: Shot
  /** The place the camera is in, or flying to. */
  private place: Place = 'istanbul'
  /** A flight between places: up through the cloud, across, and down. */
  private hop: { from: Shot; t: number; duration: number; lift: number } | null = null
  /** A shot set by hand through window.__world.look, overriding the page's. */
  private forced: Shot | null = null
  private lift = 0
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
  private canvasOpacity = -1
  /** 0..1, the canvas fading in over the CSS sky when the world first draws. */
  private fade = 0
  /** How far the cloud has streamed past, for the veil's pattern. */
  private rush = 0
  private lastY = 0

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
    // The sky and the stars stay centred on whichever camera draws them,
    // the water's reflection included.
    followCamera(this.background.mesh)
    followCamera(this.stars.points)
    this.planets = createPlanets(palette, this.quality.octaves, this.quality.sphereSegments)
    this.tunnel = createTunnel(palette, this.quality)
    this.clouds = bakeClouds(this.renderer, this.quality.cloudMapSize, this.quality.octaves)
    this.earth = createEarth(palette, this.quality, this.clouds.texture)
    this.atmos = createAtmosphere(palette)
    this.istanbul = createIstanbul(palette, this.quality, this.atmos)
    this.padova = createPadova(palette, this.quality, this.atmos)
    this.sky = createCitySky(palette, this.atmos, this.quality.tier !== 'low')
    this.physics = createPhysics(palette, this.quality, this.background.material.uniforms.uMap.value)
    this.model = createModel(palette, opts.labels.tokens.length || 6)
    this.veil = createVeil(palette)
    this.sky.fogColor(0, this.atmos.uFogColor.value)
    // The camera sees roofs; the water's mirror of it does not need to.
    this.camera.layers.enable(ABOVE_ONLY)
    this.istanbul.watch(this.camera)
    this.padova.watch(this.camera)

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

    this.shade = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        uniforms: { uShade: { value: 0 }, uSide: { value: 0 }, cGround: { value: palette.background } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform float uShade, uSide;
          uniform vec3 cGround;
          varying vec2 vUv;
          void main() {
            // uSide -1: the text is on the left; +1: on the right.
            float x = uSide < 0.0 ? 1.0 - vUv.x : vUv.x;
            float a = smoothstep(0.3, 0.62, x) * 0.82 * uShade;
            gl_FragColor = vec4(cGround, a);
          }
        `,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      })
    )
    this.shade.frustumCulled = false
    this.shade.renderOrder = 997

    this.banner = createBanner(
      palette,
      opts.email ?? '',
      getComputedStyle(document.body).fontFamily,
      this.renderer.capabilities.getMaxAnisotropy()
    )
    this.visit = createVisit(PLANE_FIRST, PLANE_EVERY)

    this.scene.add(
      this.background.mesh,
      this.stars.points,
      this.planets.group,
      this.tunnel.group,
      this.earth.group,
      this.istanbul.group,
      this.padova.group,
      this.sky.dome,
      this.sky.moon,
      this.sky.venus,
      this.physics.group,
      this.model.group,
      this.banner.group,
      this.shade,
      this.veil.mesh,
      this.flash
    )

    this.route = routeKind(opts.route)
    this.cur = { ...this.shotFor(this.route) }
    this.target = { ...this.cur }
    this.place = placeOf(this.cur)

    this.resize()
    this.loadTextures()
    // Compiled with everything else, so its first pass does not stutter;
    // hidden again before anything is drawn.
    this.banner.group.visible = true
    this.renderer
      .compileAsync(this.scene, this.camera)
      .catch(() => undefined)
      .then(() => this.taskDone())
    this.banner.group.visible = false

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
        // Sends the plane over now, whatever the clock says.
        plane: () => this.launchPlane(),
        // Points the camera at any shot, in the city's own frame, for
        // screenshots while a view is being tuned. null gives it back.
        look: (spec: (Partial<Shot> & { x?: number; y?: number; z?: number }) | null) => {
          if (!spec) {
            this.forced = null
            return
          }
          const { x, y, z, ...rest } = spec
          this.forced = {
            ...this.shotFor(this.route),
            ...rest,
            ...(x !== undefined && { cx: ISTANBUL_AT.x + x }),
            ...(y !== undefined && { cy: ISTANBUL_AT.y + y }),
            ...(z !== undefined && { cz: ISTANBUL_AT.z + z }),
          }
        },
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
      this.banner.stop()
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
    if (this.opts.reducedMotion) {
      this.tick(0.5)
      this.renderFrame()
    }
  }

  skip() {
    if (this.phase === 'live') return
    this.settle(true)
    worldStore.set({ phase: 'arrive', percent: 100 })
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
    this.istanbul.dispose()
    this.padova.dispose()
    this.sky.dispose()
    this.physics.dispose()
    this.model.dispose()
    this.clouds.dispose()
    this.veil.dispose()
    this.flash.geometry.dispose()
    this.flash.material.dispose()
    this.shade.geometry.dispose()
    this.shade.material.dispose()
    this.banner.dispose()
    this.visit.dispose()
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
    this.istanbul.resize(w, h, this.pixelRatio)
    this.padova.resize(w, h, this.pixelRatio)
    this.banner.setPixelRatio(this.pixelRatio)
    this.physics.setPixelRatio(this.pixelRatio)
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
    else if (this.phase === 'dive') this.tickDive(dt)
    else this.tickRide(dt)

    if (this.flashLevel > 0 && (this.phase === 'live' || this.phase === 'dive')) this.flashLevel *= Math.exp(-dt * 4.2)
    if (this.flashLevel < 0.002) this.flashLevel = 0
    this.flash.material.uniforms.uFlash.value = this.flashLevel
    this.flash.visible = this.flashLevel > 0

    // What is drawn follows from where the camera is. Under the cloud it is
    // the city and its sky; above it, space.
    const live = this.phase === 'live'
    const { x, y } = this.camera.position
    const altitude = y - ISTANBUL_AT.y
    const grounded = live && altitude < CLOUD.peak
    const inCity = grounded && Math.abs(x - ISTANBUL_AT.x) < 3000
    const inPadova = grounded && Math.abs(x - PADOVA_AT.x) < 3000
    const space = inCity || inPadova ? 0 : 1
    // The ride comes down at dusk, whatever hour the page was left at.
    const dusk = live ? this.cur.dusk : 1
    const dawn = live ? this.cur.dawn : 0
    const a = this.atmos
    a.uTime.value = this.time
    a.uBreath.value = breath
    a.uDusk.value = dusk
    a.uDawn.value = dawn
    a.uLights.value = 1 - 0.85 * smoothstep(0.45, 1, dawn)
    a.uFogDensity.value = 0.0024 * (live ? this.cur.haze : 1)
    this.sky.fogColor(dawn, a.uFogColor.value)
    this.sky.update(space, dawn)
    // Under the city's sky, space is out of sight: no need to draw it.
    this.background.mesh.visible = space > 0
    this.istanbul.update(this.time, dt, this.highlightIndex, inCity)
    this.padova.update(inPadova)
    this.flyPlane(dt, space === 0)
    // The city is big and far: a nearer near plane would waste the depth
    // buffer's precision and set the shoreline flickering.
    const near = space < 1 ? 0.5 : 0.02
    if (this.camera.near !== near) {
      this.camera.near = near
      this.camera.updateProjectionMatrix()
    }
    // Near the ground the city's own light washes most stars out, and the
    // ones low over the horizon go first.
    const su = this.stars.material.uniforms
    su.uTime.value = this.time
    su.uBreath.value = breath
    su.uPixelRatio.value = this.pixelRatio
    su.uBrightness.value = space < 1 ? 0.5 - 0.4 * dawn : 1
    su.uHorizon.value = 1 - space

    const cloud = live ? cloudAt(altitude) : this.diveVeil
    const climb = Math.abs(this.camera.position.y - this.lastY)
    this.lastY = this.camera.position.y
    this.rush += this.phase === 'dive' ? dt * 0.8 : Math.min(0.2, climb / 900) + dt * 0.02
    this.veil.update(this.time, cloud, this.rush, this.width / this.height, a.uFogColor.value)
    const shade = live ? this.cur.shade : 0
    this.shade.material.uniforms.uShade.value = shade
    this.shade.material.uniforms.uSide.value = this.cur.shiftX > 0.02 ? -1 : this.cur.shiftX < -0.02 ? 1 : 0
    this.shade.visible = shade > 0.01 && Math.abs(this.cur.shiftX) > 0.02

    if (this.earth.group.visible) this.earth.update(this.time, dt, breath, this.pixelRatio, 1, 0.6)
    this.physics.update(this.time, breath, live ? this.cur.physics : 0)
    this.model.update(this.time, breath, live ? this.cur.llm : 0, this.pixelRatio)
    if (this.planets.group.visible) this.planets.update(this.time)
  }

  private renderFrame() {
    this.renderer.render(this.scene, this.camera)
    this.placeLabels()
  }

  private adapt(dt: number) {
    this.frameAvg += (dt * 1000 - this.frameAvg) * 0.05
    this.slowFor = this.frameAvg > 28 ? this.slowFor + dt : 0
    const floor = this.quality.tier === 'low' ? 0.5 : 0.75
    if (this.slowFor > 2 && this.pixelRatio > floor) {
      this.pixelRatio = Math.max(floor, this.pixelRatio - 0.25)
      this.renderer.setPixelRatio(this.pixelRatio)
      this.renderer.setSize(this.width, this.height, false)
      this.istanbul.resize(this.width, this.height, this.pixelRatio)
      this.padova.resize(this.width, this.height, this.pixelRatio)
      this.banner.setPixelRatio(this.pixelRatio)
      this.physics.setPixelRatio(this.pixelRatio)
      this.slowFor = 0
      this.frameAvg = 16
    }
  }

  // ------------------------------------------------------------------ the ride

  private startRide() {
    this.banner.stop()
    this.phase = 'space'
    this.rideT = 0
    this.s = 0
    this.tubeT = 0
    this.diveT = 0
    this.diveVeil = 0
    this.revealed = false
    this.arriveT = 99
    this.flashLevel = 0
    this.rideWall = performance.now()
    this.setVisibility('ride')
    worldStore.set({ phase: 'space', percent: 0 })
  }

  private setVisibility(stage: 'ride' | 'dive' | 'live') {
    this.planets.group.visible = stage === 'ride'
    this.tunnel.group.visible = stage === 'ride'
    this.earth.group.visible = stage === 'dive'
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
    // The tube is the first half of the counter; the fall to the city the rest.
    worldStore.set({ percent: Math.min(50, Math.floor(u * 50.5)) })

    if (u >= 0.999) this.startDive()
    else if (this.rideT > MAX_RIDE || this.overdue()) this.skip()
  }

  /** Out of the tube: the flash, then the planet, falling toward Istanbul. */
  private startDive() {
    this.phase = 'dive'
    this.diveT = 0
    this.diveVeil = 0
    this.flashLevel = 1
    this.shake = 1
    this.setVisibility('dive')
    worldStore.set({ phase: 'dive', percent: 50 })
  }

  private tickDive(dt: number) {
    this.diveT += dt
    const u = Math.min(1, this.diveT / DIVE_T)
    // Height over the surface falls by the same fraction every moment, the
    // way a fall looks from inside it.
    const altitude = 2.6 * Math.exp(-2.8 * u)
    const lat = lerp(22, ISTANBUL.lat, easeInOutCubic(u)) * DEG
    const lon = DIVE_LON * DEG
    const d = 1 + altitude
    const c = this.camera
    c.position.set(d * Math.cos(lat) * Math.cos(lon), d * Math.sin(lat), -d * Math.cos(lat) * Math.sin(lon))
    c.up.set(0, 1, 0)
    c.lookAt(0, 0, 0)
    c.rotateZ((1 - u) * 0.2)
    this.shake *= Math.exp(-dt * 3.4)
    if (this.shake > 0.001) {
      c.rotateX((Math.random() - 0.5) * 0.012 * this.shake)
      c.rotateY((Math.random() - 0.5) * 0.012 * this.shake)
    }
    c.fov = lerp(38, 52, u)
    c.clearViewOffset()
    c.updateProjectionMatrix()
    this.earth.spin.rotation.y = (DIVE_LON - ISTANBUL.lon) * DEG
    this.earth.setBeaconOpacity(1 - smoothstep(0.5, 0.8, u))

    this.diveVeil = smoothstep(0.55, 1, u)
    this.fade = Math.min(1, this.fade + dt / 0.9)
    this.setCanvasOpacity(this.fade)
    worldStore.set({ percent: Math.min(100, 50 + Math.floor(u * 50.5)) })
    if (u >= 1) this.arrive()
    else if (this.overdue()) this.skip()
  }

  /** True once the ride has taken longer on the clock than any ride should. */
  private overdue() {
    return this.opts.debug !== 'paused' && performance.now() - this.rideWall > MAX_RIDE_WALL * 1000
  }

  /** Through the cloud over Istanbul: the city from high above, then down to the water. */
  private arrive() {
    this.enterLive()
    this.targetShot(this.target)
    Object.assign(this.cur, this.target)
    const ground = this.target.cy - ISTANBUL_AT.y
    this.cur.lat = 86
    this.cur.dist = (CLOUD.peak - ground) / Math.sin(86 * DEG)
    this.cur.lon = this.target.lon + 40
    this.cur.roll = this.target.roll - 12
    this.cur.fov = this.target.fov + 12
    this.cur.pitch = 0
    this.place = placeOf(this.target)
    this.arriveT = 0
    this.arriveWall = performance.now()
    this.revealAt = REVEAL_AFTER
    worldStore.set({ phase: 'arrive', percent: 100 })
  }

  private enterLive() {
    this.phase = 'live'
    this.setVisibility('live')
    this.hop = null
    this.lift = 0
    this.diveVeil = 0
  }

  /** Start just off the target shot and let the damping bring the camera in. */
  private settle(animate: boolean) {
    this.enterLive()
    this.shotFor(this.route, this.target)
    Object.assign(this.cur, this.target)
    this.place = placeOf(this.cur)
    if (animate) {
      const k = 0.35
      this.cur.dist = this.target.dist * (1 + 1.9 * k)
      this.cur.lat = this.target.lat + 14 * k
      this.cur.lon = this.target.lon - 48 * k
      this.cur.roll = this.target.roll + 24 * k
      this.cur.fov = this.target.fov + 14 * k
      this.cur.pitch = this.target.pitch * (1 - 0.5 * k)
      this.arriveT = 0
    } else {
      this.arriveT = 99
    }
    this.revealAt = 0.45
    this.reveal()
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
    const late = this.opts.debug !== 'paused' && performance.now() - this.arriveWall > REVEAL_WALL * 1000
    if (!this.revealed && (this.arriveT > this.revealAt || late)) this.reveal()

    this.targetShot(this.target)
    const place = placeOf(this.target)
    if (place !== this.place) {
      // Somewhere else: up through the cloud, across, and down again.
      const dx = this.target.cx - this.cur.cx
      const dy = this.target.cy - this.cur.cy
      const dz = this.target.cz - this.cur.cz
      const across = Math.hypot(dx, dz)
      this.hop = {
        from: { ...this.cur },
        t: 0,
        duration: clamp(1.5 + Math.hypot(across, dy) / 4000, 1.8, 3.2),
        lift: across * 0.3,
      }
      this.place = place
    }

    if (this.hop) {
      const hop = this.hop
      hop.t = Math.min(1, hop.t + dt / hop.duration)
      blend(hop.from, this.target, smootherstep(hop.t), this.cur)
      // The camera draws back from what it was looking at before it sets
      // off, travels, and closes in on the new place at the end.
      const move = smootherstep(clamp((hop.t - 0.14) / 0.72))
      this.cur.cx = lerp(hop.from.cx, this.target.cx, move)
      this.cur.cy = lerp(hop.from.cy, this.target.cy, move)
      this.cur.cz = lerp(hop.from.cz, this.target.cz, move)
      this.cur.dist *= 1 + 2.5 * smoothstep(0, 0.35, hop.t) * (1 - smoothstep(0.65, 1, hop.t))
      this.lift = hop.lift * Math.sin(Math.PI * move) ** 2
      if (hop.t >= 1) {
        this.hop = null
        this.lift = 0
      }
    } else {
      const lambda = this.arriveT < 3 ? lerp(1.5, 3.2, smoothstep(0.8, 3, this.arriveT)) : 3.2
      const f = dampFactor(lambda, dt)
      for (const k of SHOT_KEYS) this.cur[k] += (this.target[k] - this.cur[k]) * f
    }

    this.fade = Math.min(1, this.fade + dt / 1.1)
    this.applyShot(this.cur)
    this.applyCanvasOpacity()
  }

  private applyShot(shot: Shot) {
    const c = this.camera
    const lat = shot.lat * DEG
    const lon = shot.lon * DEG
    const cy = shot.cy + this.lift
    c.position.set(
      shot.cx + shot.dist * Math.cos(lat) * Math.cos(lon),
      cy + shot.dist * Math.sin(lat),
      shot.cz - shot.dist * Math.cos(lat) * Math.sin(lon)
    )
    // Never into the hills: the camera rides over them.
    const x = c.position.x - ISTANBUL_AT.x
    const z = c.position.z - ISTANBUL_AT.z
    if (Math.abs(x) < 1500 && Math.abs(z) < 1500) {
      c.position.y = Math.max(c.position.y, ISTANBUL_AT.y + heightAt(x, z) + 3)
    } else if (Math.abs(c.position.x - PADOVA_AT.x) < 1500) {
      c.position.y = Math.max(c.position.y, PADOVA_AT.y + this.padova.ground + 3)
    }
    c.up.set(0, 1, 0)
    c.lookAt(shot.cx, cy, shot.cz)
    c.rotateX(shot.pitch * DEG)
    c.rotateY(shot.yaw * DEG)
    c.rotateZ(shot.roll * DEG)
    c.fov = shot.fov
    c.setViewOffset(this.width, this.height, -shot.shiftX * this.width, shot.shiftY * this.height, this.width, this.height)
    c.updateProjectionMatrix()
  }

  private applyCanvasOpacity() {
    let o = this.cur.canvas * easeOutCubic(this.fade)
    // Over a page of text the world steps back once the reader scrolls in.
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
    this.enterLive()
    this.targetShot(this.target, true)
    Object.assign(this.cur, this.target)
    this.place = placeOf(this.cur)
    this.tick(0)
    this.applyShot(this.cur)
    // Once more, now the camera is where it will stay: what is drawn
    // depends on where that is.
    this.tick(0)
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
      kind === 'home' || kind === 'hidden' ? HOME.hero : kind === 'resume' ? SCENES.bogazici : ROUTES[kind]
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
    if (this.forced) return Object.assign(out, this.forced)
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
        const A = shotOf(a.id)
        const B = shotOf(b.id)
        // Two places are never blended: past halfway, the camera sets off for
        // the other. Once it has, it needs a clear step back before it turns
        // round again, so a reader resting near the halfway line does not
        // send it back and forth.
        if (cut) return Object.assign(out, eased < 0.5 ? A : B)
        if (placeOf(A) !== placeOf(B)) {
          const towardB = this.place === placeOf(B) ? eased > 0.35 : eased > 0.65
          return Object.assign(out, towardB ? B : A)
        }
        return blend(A, B, eased, out)
      }
    }
    return Object.assign(out, shotOf(list[list.length - 1].id))
  }

  // ------------------------------------------------------------------ the plane

  /**
   * Every two minutes someone spends on the site, a plane tows the email
   * across the sky: only over a city, once the camera has settled, and never
   * for a reader who asked for less motion.
   */
  private flyPlane(dt: number, overCity: boolean) {
    const plane = this.banner
    if (plane.flying) {
      plane.update(dt, this.camera)
      // Off through the cloud to somewhere else, the camera leaves it behind.
      plane.group.visible = plane.flying && overCity
      return
    }
    if (this.opts.reducedMotion || !this.opts.email || this.opts.debug === 'paused') return
    const settled = this.phase === 'live' && this.revealed && !this.hop && this.arriveT > 3 && overCity
    if (settled && this.visit.seconds() >= this.visit.due) this.launchPlane()
  }

  private launchPlane() {
    const portrait = this.width / this.height < 0.8
    // From the side the words are on toward the side the city is on, so the
    // banner finishes its pass in the open.
    const dir = this.cur.shiftX > 0.02 ? 1 : -1
    // High in the sky; on a phone whose words hold the top of the screen,
    // low, in the strip of sky between them and the skyline.
    const row = portrait && this.cur.shiftY < -0.1 ? -0.26 : 0.5
    this.banner.launch(this.camera, dir, row)
    this.visit.flew()
  }

  // ------------------------------------------------------------------ labels

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
    if (weight > 0.01 && !this.hidden && this.phase === 'live' && !this.hop) {
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
    const { captions, tokens } = this.opts.labels

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

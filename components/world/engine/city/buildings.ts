import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from 'three'
import { createBeacons } from './beacons'
import { ABOVE_ONLY, BLOCK, DISTRICT, district, districtCell, fogGLSL, merge, rng, STREET, type Atmosphere } from './common'
import { MOON_DIR } from './sky'
import type { Palette } from '../palette'

// The city between the monuments: the street plan walked block by block,
// each block built up with one to four buildings, each drawn by its kind.
// Blocks of flats with balconies and a clutter of water tanks and solar
// heaters on their roofs; older houses and hans under tiled roofs; offices in
// bands of glass; the yalıs lit at the water's edge; glass towers with a
// crown of light and a red lamp for the aircraft. Shops light the street
// floor. Walls, roofs and rooftops are one draw call each.

/**
 * What kind of building stands on a plot. Each draws its walls its own way.
 * 0 a block of flats: balconies, a flat roof with tanks and heaters on it
 * 1 an older house or han: tall windows, a tiled roof
 * 2 offices or newer flats: bands of wide windows, a flat roof
 * 3 a yalı: a wooden mansion at the water's edge, painted, lit, a tiled roof
 * 4 a tower: glass, lit a floor at a time, a crown of light on top
 * 5 a palazzo over an arcade, the way Padova builds, under a tiled roof
 * 6 a tower's crown (the builder puts these on the towers itself)
 */
export type Style = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** A building placed by hand rather than grown from the street plan. */
export interface Extra {
  x: number
  z: number
  w: number
  d: number
  h: number
  angle: number
  style: Style
}

export interface Plot {
  /** Ground height at a point. */
  height(x: number, z: number): number
  /** How far inside land a point is. */
  inland(x: number, z: number): number
  /** Keep-clear circles around monuments: x, z, radius. */
  clear: [number, number, number][]
  /** The rectangle to fill: x0, x1, z0, z1. */
  bounds: [number, number, number, number]
  /** Where the camera mostly looks: buildings crowd toward these. */
  focus: [number, number][]
  /** How far from a focus the city thins out. */
  reach: number
  /** Ground that must stay open: a road, a campus lawn. */
  avoid?(x: number, z: number): boolean
  /** How tall a building at a point is, from a random number. Towers (over 6) stand slender on their plot. */
  rise(x: number, z: number, r: number): number
  /** What kind of building it is, from where it is, its height and a random number. Blocks of flats by default. */
  style?(x: number, z: number, h: number, r: number): Style
  /** Buildings placed by hand, on top of the ones the street plan grows. */
  extra?: Extra[]
  /** How many of the flat roofs nearest the focus get their tanks and heaters. */
  rooftops?: number
}

const TILED = new Set<Style>([1, 3, 5])

interface Spec {
  x: number
  y: number
  z: number
  angle: number
  w: number
  d: number
  h: number
  style: Style
  seed: number
  /** For a floor set on top of a building: how high above the street it starts. */
  base?: number
}

/** How far each building's foot is sunk into the ground, so slopes never show under it. */
const SINK = 0.4

// ----------------------------------------------------------------- shapes

/** Tags a part with what it is made of, for the rooftop shader. */
function made(g: BufferGeometry, part: number) {
  const geometry = g.index ? g.toNonIndexed() : g
  geometry.deleteAttribute('uv')
  geometry.setAttribute('aPart', new BufferAttribute(new Float32Array(geometry.getAttribute('position').count).fill(part), 1))
  return geometry
}

/** A tiled roof over a unit square: hipped, its ridge along x, one unit high. */
function hipRoof() {
  const r = 0.24
  const v = [
    // front and back slopes, down to the eaves
    -0.5, 0, 0.5, 0.5, 0, 0.5, r, 1, 0,
    -0.5, 0, 0.5, r, 1, 0, -r, 1, 0,
    0.5, 0, -0.5, -0.5, 0, -0.5, -r, 1, 0,
    0.5, 0, -0.5, -r, 1, 0, r, 1, 0,
    // the hipped ends
    0.5, 0, 0.5, 0.5, 0, -0.5, r, 1, 0,
    -0.5, 0, -0.5, -0.5, 0, 0.5, -r, 1, 0,
  ]
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(v), 3))
  g.computeVertexNormals()
  return g
}

/**
 * What stands on a flat roof in Istanbul, in real units: the stair
 * housing with a lamp over its door, a solar heater with its tank, a round
 * water tank, a dish. 0 concrete, 1 painted metal, 2 glass, 3 a lamp.
 * Eighty-odd triangles: from the heights the camera keeps to, anything
 * finer (legs, an aerial) is narrower than a pixel and only shimmers.
 */
function rooftopKit() {
  const box = (w: number, h: number, d: number, x: number, y: number, z: number) => new BoxGeometry(w, h, d).translate(x, y + h / 2, z)
  const parts = [
    made(box(0.5, 0.42, 0.46, -0.3, 0, -0.26), 0),
    // the lamp: a pane facing out over the door
    made(new PlaneGeometry(0.08, 0.06).translate(-0.3, 0.33, -0.005), 3),
    // the heater's glass leaning on the roof, its tank along the top edge
    made(new BoxGeometry(0.62, 0.025, 0.36).rotateX(0.6).translate(0.28, 0.112, 0.22), 2),
    made(new CylinderGeometry(0.065, 0.065, 0.66, 6).rotateZ(Math.PI / 2).translate(0.28, 0.27, 0.07), 1),
    // the water tank, open underneath, where the roof hides it
    made(new CylinderGeometry(0.12, 0.12, 0.26, 7, 1, true).translate(0.36, 0.13, -0.34), 1),
    made(new CircleGeometry(0.12, 7, -Math.PI / 2).rotateX(-Math.PI / 2).translate(0.36, 0.26, -0.34), 1),
    // the dish, its face tipped up to the sky
    made(new ConeGeometry(0.1, 0.05, 6).rotateX(Math.PI - 1.1).translate(-0.05, 0.14, 0.34), 1),
  ]
  return merge(parts)
}

// ----------------------------------------------------------------- shaders

const vertex = /* glsl */ `
  attribute float aSeed;
  attribute float aStyle;
  attribute float aBase;
  varying float vBase;
  varying vec3 vLocal;
  varying vec3 vNormalL;
  varying vec3 vNormalW;
  varying vec3 vSize;
  varying float vSeed;
  varying float vStyle;
  varying vec3 vPosW;
  void main() {
    vLocal = position;
    vNormalL = normal;
    vSeed = aSeed;
    vStyle = aStyle;
    vBase = aBase;
    vSize = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
    vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

/** Light that falls on everything outdoors: the moon from the west, the sunset's glow, the dawn. */
const outdoorGLSL = /* glsl */ `
  uniform vec3 uSunDir, uMoonDir;
  vec3 outdoor(vec3 N, vec3 sky, vec3 warm) {
    return sky * 0.03 * max(dot(N, uMoonDir), 0.0)
      + cGlow * 0.05 * max(dot(N, uWest), 0.0) * uDusk
      + warm * max(dot(N, uSunDir), 0.0) * uDawn * 0.18;
  }
`

const wallFragment = /* glsl */ `
  ${fogGLSL}
  ${outdoorGLSL}
  uniform float uLights, uLit, uTime;
  uniform vec3 cWall, cSand, cWarm, cCool, cSky, cGreen, cSun, cRose, cCream;
  varying vec3 vLocal;
  varying vec3 vNormalL;
  varying vec3 vNormalW;
  varying vec3 vSize;
  varying float vSeed;
  varying float vStyle;
  varying float vBase;
  varying vec3 vPosW;
  float hash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  void main() {
    int style = int(vStyle + 0.5);
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    float r1 = fract(vSeed * 7.13);
    float r2 = fract(vSeed * 3.71);
    float r3 = fract(vSeed * 11.3);
    float r4 = fract(vSeed * 5.97);
    // Height above the street (a building's foot is sunk into the ground).
    float height = vLocal.y * vSize.y - vBase;
    // Walls: dark render, some a shade warmer, like old stone and plaster.
    vec3 wall = mix(cWall * 0.55, mix(cWall, cSand, 0.18) * 0.6, step(0.7, r1)) * (0.85 + 0.3 * r2);
    vec3 paint = r4 < 0.3 ? cSand : (r4 < 0.55 ? cRose : (r4 < 0.8 ? cCream : mix(cSky, cCream, 0.55)));
    vec3 col = wall;
    float along = abs(vNormalL.x) > 0.5 ? vLocal.z * vSize.z : vLocal.x * vSize.x;
    float face = dot(vNormalL, vec3(1.0, 2.0, 3.0));

    if (vNormalL.y > 0.5) {
      // A flat roof: the parapet catches a little of the glow, the rest is dark.
      vec2 q = vLocal.xz * vSize.xz;
      float edge = min(vSize.x * 0.5 - abs(q.x), vSize.z * 0.5 - abs(q.y));
      float rim = 1.0 - smoothstep(0.03, 0.09, edge);
      col = cWall * (0.62 + 0.18 * hash(vec3(floor(q * 1.7), vSeed * 13.0))) + cSky * 0.012;
      col += (cWarm * 0.08 * uLights + cSky * 0.06) * rim;
      if (style == 6) col += mix(cSky, cSun, step(0.5, r1)) * 0.25 * rim * uLights;
    } else if (style == 6) {
      // A tower's crown: a band of light round the top, in one of the palette's colours.
      vec3 glow = r1 < 0.4 ? cSky : (r1 < 0.75 ? cSun : cCool);
      float band = smoothstep(0.3, 0.4, vLocal.y) * (1.0 - smoothstep(0.82, 0.9, vLocal.y));
      float fins = 0.55 + 0.45 * step(0.35, fract(along / 0.2));
      float fine = smoothstep(0.3, 0.8, fwidth(along / 0.2));
      col = cWall * 0.35 + glow * (0.06 + 0.75 * band * mix(fins, 0.8, fine)) * uLights;
    } else if (style == 4) {
      // Glass: the sky in it, the mullions, and offices lit a floor at a time.
      vec2 cell = vec2(along / 0.25, height / 0.36);
      vec2 f = fract(cell);
      vec3 R = reflect(-V, N);
      float fres = 0.25 + 0.75 * pow(1.0 - max(dot(N, V), 0.0), 3.0);
      vec3 glass = mix(cWall * 0.3, air(R) * 0.75, fres * 0.8);
      float frame = max(1.0 - smoothstep(0.0, 0.08, min(f.x, 1.0 - f.x)), 1.0 - smoothstep(0.0, 0.12, min(f.y, 1.0 - f.y)));
      float h = hash(vec3(floor(cell.y), floor(along / 1.5), vSeed * 97.0 + face));
      float on = step(1.0 - uLit * 1.05, h);
      vec3 office = mix(cCool, cWarm, step(0.66, fract(h * 7.3))) * (0.62 + 0.3 * fract(h * 3.1));
      float fine = smoothstep(0.35, 0.9, max(fwidth(cell.x), fwidth(cell.y)));
      float lit = mix(on * (1.0 - frame), uLit * 0.45, fine);
      col = glass * (1.0 - 0.45 * frame * (1.0 - fine)) + office * lit * uLights * 0.85;
      // The lobby, lit, at the foot.
      col += cWarm * 0.4 * (1.0 - smoothstep(0.3, 0.36, height)) * uLights;
    } else {
      // Everything with windows in a wall: the grid, and the window within
      // each cell, differ by kind.
      vec2 size = vec2(0.3, 0.34);
      vec4 box = vec4(0.24, 0.76, 0.3, 0.8);
      float busy = 0.55 + 0.9 * (r3 - 0.5);
      if (style == 1) { size = vec2(0.34, 0.42); box = vec4(0.3, 0.7, 0.22, 0.86); }
      else if (style == 2) { size = vec2(0.5, 0.34); box = vec4(0.06, 0.94, 0.34, 0.8); }
      else if (style == 3) { size = vec2(0.24, 0.42); box = vec4(0.18, 0.82, 0.2, 0.86); busy = 1.3 + 0.5 * r3; }
      else if (style == 5) { size = vec2(0.36, 0.42); box = vec4(0.3, 0.7, 0.25, 0.85); }
      // Old houses and palazzi keep a little of their paint where light
      // reaches it; a yalı is painted, and floodlit from the water.
      if (style == 1 || style == 5) wall = mix(wall, paint * 0.3, 0.35);
      if (style == 3) wall = mix(wall, paint * 0.5, 0.7) + paint * 0.1 * uLights * (1.0 - vLocal.y * 0.6);
      col = wall;
      vec2 cell = vec2(along / size.x, height / size.y);
      vec2 id = floor(cell);
      // Far away the grid is finer than a pixel: show what it adds up to.
      // (A little brighter than the true average: at a distance lit windows
      // read as points of light, and the eye counts them up.)
      float fine = smoothstep(0.35, 0.9, max(fwidth(cell.x), fwidth(cell.y)));
      // A window's light on average: warm, one in six cold.
      vec3 glow = mix(cWarm, cCool, 0.16);
      if (fine > 0.995) {
        // So far that no single window shows: only the sum, and none of the
        // work of drawing each one.
        float lit = uLit * busy * 0.5;
        #if DETAIL
        if (id.y > -0.5 && id.y < 0.5 && style != 3) lit = style == 5 ? 0.4 : 0.25;
        #endif
        col += glow * lit * uLights * 0.9;
      } else {
        vec2 f = fract(cell);
        vec2 w = (f - box.xz) / (box.yw - box.xz);
        // Below the street, where a slope bares a building's foot: no windows.
        float win = step(0.0, w.x) * step(w.x, 1.0) * step(0.0, w.y) * step(w.y, 1.0) * step(-0.5, id.y);
        // Balconies on some columns of a block of flats: a rail across the
        // foot of a door that reaches down behind it.
        float rail = 0.0;
        #if DETAIL
        if (style == 0 && id.y > 0.5 && hash(vec3(id.x, 3.0, vSeed * 17.0 + face)) < 0.45) {
          rail = step(0.05, f.x) * step(f.x, 0.95) * step(f.y, 0.32) * (0.6 + 0.8 * smoothstep(0.26, 0.3, f.y));
          w.y = (f.y - 0.32) / (box.w - 0.32);
          win = step(0.0, w.x) * step(w.x, 1.0) * step(0.0, w.y) * step(w.y, 1.0);
        }
        #endif
        float h = hash(vec3(id, vSeed * 97.0 + face));
        float on = step(1.0 - uLit * busy, h);
        // A window now and then goes out or comes on.
        on *= step(0.02, fract(h * 13.7 + floor(uTime * 0.08 + h * 9.0) * 0.37));
        vec3 light = mix(cWarm, cCool, step(0.84, fract(h * 7.31)));
        float inside = 1.0;
        #if DETAIL
        // Here and there a television: cold, restless.
        float tv = step(0.94, fract(h * 3.17));
        light = mix(light, cSky * (0.55 + 0.3 * sin(uTime * 5.0 + h * 40.0) + 0.15 * sin(uTime * 13.0 + h * 7.0)), tv);
        // The lamp hangs high in a room, so a window is brighter at the top;
        // some have their curtains half drawn.
        float curtain = step(0.55, fract(h * 5.3)) * smoothstep(0.16, 0.34, abs(w.x - 0.5));
        inside = (0.78 + 0.34 * clamp(w.y, 0.0, 1.0)) * (1.0 - 0.55 * curtain);
        #endif
        float lit = mix(win * on * inside, uLit * busy * 0.5, fine);
        #if DETAIL
        if (id.y > -0.5 && id.y < 0.5 && style != 3) {
          // The street floor: shops for most, an arcade in Padova.
          vec2 s = vec2(along / 1.05, height / size.y);
          vec2 sf = fract(s);
          float sh = hash(vec3(floor(s.x), 7.0, vSeed * 41.0 + face));
          if (style == 5) {
            // Arches, lit from inside by the arcade's lamps.
            vec2 a = vec2(fract(along / 0.62) - 0.5, height / size.y);
            float open = step(abs(a.x), 0.38) * step(a.y, 0.62) + step(length(vec2(a.x / 0.38, (a.y - 0.62) / 0.3)), 1.0) * step(0.62, a.y);
            lit = mix(min(open, 1.0) * (0.55 + 0.25 * a.y), 0.4, fine);
            light = cWarm;
          } else {
            float glass = step(0.06, sf.x) * step(sf.x, 0.94) * step(0.12, sf.y) * step(sf.y, 0.78);
            float mullion = step(0.05, fract(sf.x * 3.0 + 0.02));
            float board = step(0.06, sf.x) * step(sf.x, 0.94) * step(0.84, sf.y) * step(sf.y, 0.96) * step(0.62, sh);
            float open = step(0.48, sh);
            lit = mix(glass * mullion * open * (0.45 + 0.4 * sf.y) * (0.7 + 0.5 * fract(sh * 9.7)), 0.25, fine);
            light = mix(cWarm, cCool, step(0.75, fract(sh * 5.1)));
            vec3 signColor = sh < 0.75 ? cGreen : (sh < 0.88 ? cSky : cSun);
            col += signColor * board * (1.0 - fine) * 0.6 * uLights;
          }
        }
        #endif
        // Nearing the cut-off each window's colour gives way to the average, so
        // the two meet without a seam.
        col += mix(light, glow, fine) * lit * uLights * 0.9;
        col += (cWarm * 0.06 * uLights + cSky * 0.025) * rail * (1.0 - fine);
      }
      // The street lamps light the bottom of the walls.
      col += cWarm * 0.1 * exp(-height * 2.2) * uLights;
    }
    col += outdoor(N, cSky, cSand);
    gl_FragColor = vec4(fog(col, vPosW), 1.0);
  }
`

const roofFragment = /* glsl */ `
  ${fogGLSL}
  ${outdoorGLSL}
  uniform float uLights;
  uniform vec3 cTile, cWall, cWarm, cSky;
  varying vec3 vLocal;
  varying vec3 vNormalW;
  varying vec3 vSize;
  varying float vSeed;
  varying vec3 vPosW;
  void main() {
    vec3 N = normalize(vNormalW);
    float r1 = fract(vSeed * 7.13);
    // Old tiles, dark at night, some roofs redder than others.
    vec3 col = cTile * (0.12 + 0.1 * r1) + cWall * 0.3;
    // Rows of tiles along the eaves, and the channels between them.
    float rows = vLocal.y * vSize.y / 0.045;
    float fine = smoothstep(0.3, 0.8, fwidth(rows));
    col *= mix(0.72 + 0.28 * smoothstep(0.0, 0.35, fract(rows)), 0.86, fine);
    // The eaves catch the lamps in the street below.
    col += cWarm * 0.1 * pow(1.0 - vLocal.y, 8.0) * uLights;
    col += cSky * 0.025 * max(N.y, 0.0);
    col += outdoor(N, cSky, cTile);
    gl_FragColor = vec4(fog(col, vPosW), 1.0);
  }
`

const kitVertex = /* glsl */ `
  uniform float uPixel;
  attribute float aSeed;
  attribute float aPart;
  varying float vSeed;
  varying float vPart;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vSeed = aSeed;
    vPart = aPart;
    vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
    // A roof's clutter under three pixels across is left out, behind the far
    // plane: its triangles would cost more than they show.
    vec4 foot = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix[3];
    float across = 1.2 * length(instanceMatrix[0].xyz) * projectionMatrix[1][1] / max(foot.w, 0.001);
    if (across < 3.0 * uPixel) gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
  }
`

const kitFragment = /* glsl */ `
  ${fogGLSL}
  ${outdoorGLSL}
  uniform float uLights;
  uniform vec3 cWall, cIce, cWarm, cSky;
  varying float vSeed;
  varying float vPart;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    vec3 col = mix(cWall, cIce, 0.06) * 0.95;
    if (vPart > 0.5 && vPart < 1.5) {
      // Tanks, painted white once: the city's glow on them.
      col = mix(cWall, cIce, 0.3) * 0.75 + cWarm * 0.06 * uLights;
    } else if (vPart > 1.5 && vPart < 2.5) {
      // The heater's glass holds the sky.
      vec3 R = reflect(-V, N);
      col = cWall * 0.3 + air(R) * 0.7 * (0.35 + 0.65 * pow(1.0 - max(dot(N, V), 0.0), 2.0));
    } else if (vPart > 2.5) {
      col = cWarm * 1.3 * step(0.45, fract(vSeed * 13.1)) * uLights;
    }
    col += cSky * 0.05 * pow(1.0 - max(dot(N, V), 0.0), 3.0);
    col += outdoor(N, cSky, cIce);
    gl_FragColor = vec4(fog(col, vPosW), 1.0);
  }
`

// ----------------------------------------------------------------- the city

/**
 * lite: plainer walls for devices that draw every pixel on the CPU: windows,
 * but no shops, balconies, curtains or televisions.
 */
export function createBuildings(palette: Palette, atmos: Atmosphere, count: number, plot: Plot, seed = 11, lite = false) {
  const random = rng(seed)
  const specs: Spec[] = []
  const [x0, x1, z0, z1] = plot.bounds
  const inner = BLOCK - STREET - 0.5
  const reach = Math.ceil((DISTRICT * 1.2) / BLOCK)

  const build = (x: number, z: number, angle: number, w: number, d: number, r: number) => {
    if (specs.length >= count || plot.inland(x, z) < Math.max(w, d) * 0.5 + 0.4) return
    if (plot.avoid?.(x, z)) return
    const h = plot.rise(x, z, r)
    const tower = h > 6
    specs.push({
      x,
      y: plot.height(x, z) - SINK,
      z,
      angle,
      w: tower ? Math.min(w, 3.4) : w,
      d: tower ? Math.min(d, 3.4) : d,
      h: h + SINK,
      style: tower ? 4 : (plot.style?.(x, z, h, random()) ?? 0),
      seed: random(),
    })
  }

  // Blocks nearest the focus first, so a smaller budget still fills the
  // part of the city the camera sees.
  const blocks: { x: number; z: number; angle: number; near: number }[] = []
  for (let gz = Math.floor(z0 / DISTRICT) - 1; gz <= Math.floor(z1 / DISTRICT) + 1; gz++) {
    for (let gx = Math.floor(x0 / DISTRICT) - 1; gx <= Math.floor(x1 / DISTRICT) + 1; gx++) {
      const cell = districtCell(gx, gz)
      const c = Math.cos(cell.angle)
      const sn = Math.sin(cell.angle)
      for (let j = -reach; j < reach; j++) {
        for (let i = -reach; i < reach; i++) {
          const u = (i + 0.5) * BLOCK
          const v = (j + 0.5) * BLOCK
          const x = cell.ox + c * u - sn * v
          const z = cell.oz + sn * u + c * v
          if (x < x0 || x > x1 || z < z0 || z > z1) continue
          const own = district(x, z)
          if (own.gx !== gx || own.gz !== gz || own.edge < BLOCK * 0.55) continue
          if (plot.inland(x, z) < 1.5) continue
          if (plot.clear.some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r)) continue
          const near = Math.max(...plot.focus.map(([fx, fz]) => Math.exp(-Math.hypot(x - fx, z - fz) / plot.reach)))
          blocks.push({ x, z, angle: cell.angle, near })
        }
      }
    }
  }
  blocks.sort((a, b) => b.near - a.near)

  for (const b of blocks) {
    if (specs.length >= count) break
    // Thinner away from where the camera looks; the lit streets carry on.
    if (random() > 0.25 + 0.75 * Math.sqrt(b.near)) continue
    const c = Math.cos(b.angle)
    const sn = Math.sin(b.angle)
    const at = (du: number, dv: number) => [b.x + c * du - sn * dv, b.z + sn * du + c * dv] as const
    const pattern = random()
    const g = 0.35 // the gap between buildings on one block
    if (pattern < 0.25) {
      build(b.x, b.z, b.angle, inner, inner, random())
    } else if (pattern < 0.6) {
      const a = inner * (0.35 + 0.3 * random())
      const [ax, az] = at(-inner / 2 + a / 2, 0)
      const [bx, bz] = at(a / 2 + g / 2, 0)
      build(ax, az, b.angle, a - g / 2, inner, random())
      build(bx, bz, b.angle, inner - a - g / 2, inner, random())
    } else {
      const h = (inner - g) / 2
      for (const [su, sv] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        if (random() < 0.12) continue // a courtyard, a garden, a lot
        const [px, pz] = at((su * (h + g)) / 2, (sv * (h + g)) / 2)
        build(px, pz, b.angle, h, h, random())
      }
    }
  }
  const grown = specs.length
  for (const e of plot.extra ?? []) {
    specs.push({ ...e, y: plot.height(e.x, e.z) - SINK, h: e.h + SINK, seed: random() })
  }

  // On top of what stands: a crown on every tower, with the aircraft's red
  // lamps on it, and on some tall blocks of flats a smaller floor set back.
  const beacons: number[] = []
  const tops: Spec[] = []
  for (const s of specs) {
    const r = random()
    if (s.style === 4) {
      const ch = 0.55 + 0.45 * r
      tops.push({ ...s, y: s.y + s.h, w: s.w * 0.82, d: s.d * 0.82, h: ch, style: 6, base: s.h - SINK })
      const c = Math.cos(s.angle)
      const sn = Math.sin(s.angle)
      for (const k of [-1, 1]) {
        const u = (k * s.w * 0.82) / 2
        const v = (k * s.d * 0.82) / 2
        beacons.push(s.x + c * u - sn * v, s.y + s.h + ch + 0.08, s.z + sn * u + c * v)
      }
    } else if ((s.style === 0 || s.style === 2) && s.h > 2.6 && r > 0.8 && s.w > 1.6 && s.d > 1.6) {
      tops.push({ ...s, y: s.y + s.h, w: s.w * 0.55, d: s.d * 0.6, h: 0.34, base: s.h - SINK })
    }
  }
  const walls = [...specs, ...tops]

  // ------------------------------------------------------------ the walls
  // No floor: nobody sees it.
  const geometry = new BoxGeometry(1, 1, 1).translate(0, 0.5, 0)
  const index = geometry.getIndex()!
  geometry.setIndex(Array.from(index.array).filter((_, i) => Math.floor(i / 6) !== 3))
  const colours = {
    cWall: { value: palette.oceanDeep },
    cSand: { value: palette.arid },
    cWarm: { value: palette.city },
    cCool: { value: palette.ice },
    cSky: { value: palette.sky },
    cGreen: { value: palette.accent },
    cSun: { value: palette.sun },
    cRose: { value: palette.dusk.clone().lerp(palette.heading, 0.35) },
    cCream: { value: palette.heading },
  }
  const material = new ShaderMaterial({
    defines: { DETAIL: lite ? 0 : 1 },
    uniforms: { ...atmos, uLit: { value: 0.42 }, uMoonDir: { value: MOON_DIR }, ...colours },
    vertexShader: vertex,
    fragmentShader: wallFragment,
  })
  const mesh = new InstancedMesh(geometry, material, Math.max(1, walls.length))
  const m = new Matrix4()
  const q = new Quaternion()
  const up = new Vector3(0, 1, 0)
  const pos = new Vector3()
  const scale = new Vector3()
  walls.forEach((s, i) => {
    pos.set(s.x, s.y, s.z)
    q.setFromAxisAngle(up, -s.angle)
    scale.set(s.w, s.h, s.d)
    mesh.setMatrixAt(i, m.compose(pos, q, scale))
  })
  mesh.count = walls.length
  geometry.setAttribute('aSeed', new InstancedBufferAttribute(new Float32Array(walls.map((s) => s.seed)), 1))
  geometry.setAttribute('aStyle', new InstancedBufferAttribute(new Float32Array(walls.map((s) => s.style)), 1))
  // How far below the street each box starts: the sink for a building on
  // the ground; for a floor set on top of one, minus the height it stands at,
  // so its windows carry on the floors below it.
  geometry.setAttribute(
    'aBase',
    new InstancedBufferAttribute(new Float32Array(walls.map((w, i) => (i < specs.length ? SINK : -(w.base ?? 0)))), 1)
  )
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false

  // ------------------------------------------------------------ the roofs
  // (Not for the cheapest tier: a roof is one more surface over every house.)
  const tiled = lite ? [] : specs.filter((s) => TILED.has(s.style))
  const roofGeometry = hipRoof()
  const roofMaterial = new ShaderMaterial({
    uniforms: { ...atmos, uMoonDir: { value: MOON_DIR }, cTile: { value: palette.dusk }, ...colours },
    vertexShader: vertex,
    fragmentShader: roofFragment,
  })
  const roofs = new InstancedMesh(roofGeometry, roofMaterial, Math.max(1, tiled.length))
  tiled.forEach((s, i) => {
    // The ridge runs the long way.
    const turn = s.d > s.w
    const w = turn ? s.d : s.w
    const d = turn ? s.w : s.d
    pos.set(s.x, s.y + s.h, s.z)
    q.setFromAxisAngle(up, -s.angle + (turn ? Math.PI / 2 : 0))
    scale.set(w + 0.16, Math.min(0.9, Math.max(0.28, d * 0.34)), d + 0.16)
    roofs.setMatrixAt(i, m.compose(pos, q, scale))
  })
  roofs.count = tiled.length
  roofGeometry.setAttribute('aSeed', new InstancedBufferAttribute(new Float32Array(tiled.map((s) => s.seed)), 1))
  roofGeometry.setAttribute('aStyle', new InstancedBufferAttribute(new Float32Array(tiled.map((s) => s.style)), 1))
  roofs.instanceMatrix.needsUpdate = true
  roofs.frustumCulled = false

  // ------------------------------------------------------- the rooftops
  // Only the nearest roofs: further off, a tank is smaller than a pixel.
  const flat = specs
    .slice(0, grown)
    .filter((s) => (s.style === 0 || s.style === 2) && Math.min(s.w, s.d) > 1.3)
    .slice(0, plot.rooftops ?? 0)
  const kitGeometry = rooftopKit()
  const kitMaterial = new ShaderMaterial({
    // uPixel: the height of a pixel on screen, in clip space (2 / pixels tall).
    uniforms: { ...atmos, uMoonDir: { value: MOON_DIR }, cIce: { value: palette.ice }, uPixel: { value: 2 / 900 }, ...colours },
    vertexShader: kitVertex,
    fragmentShader: kitFragment,
  })
  const kits = new InstancedMesh(kitGeometry, kitMaterial, Math.max(1, flat.length))
  const kitSeeds = new Float32Array(Math.max(1, flat.length))
  const covered = new Set(tops.filter((t) => t.style !== 6).map((t) => `${t.x},${t.z}`))
  let kitCount = 0
  for (const s of flat) {
    if (covered.has(`${s.x},${s.z}`)) continue
    const k = Math.min(1.15, Math.max(0.55, Math.min(s.w, s.d) / 1.9))
    const room = [(s.w - 1.3 * k) / 2, (s.d - 1.3 * k) / 2]
    const du = (random() - 0.5) * 2 * Math.max(0, room[0])
    const dv = (random() - 0.5) * 2 * Math.max(0, room[1])
    const c = Math.cos(s.angle)
    const sn = Math.sin(s.angle)
    pos.set(s.x + c * du - sn * dv, s.y + s.h, s.z + sn * du + c * dv)
    q.setFromAxisAngle(up, -s.angle + Math.floor(random() * 4) * (Math.PI / 2))
    scale.setScalar(k)
    kits.setMatrixAt(kitCount, m.compose(pos, q, scale))
    kitSeeds[kitCount] = s.seed
    kitCount++
  }
  kits.count = kitCount
  kitGeometry.setAttribute('aSeed', new InstancedBufferAttribute(kitSeeds, 1))
  kits.instanceMatrix.needsUpdate = true
  kits.frustumCulled = false

  // Roofs and rooftops never show in the water: from below the walls hide them.
  roofs.layers.set(ABOVE_ONLY)
  kits.layers.set(ABOVE_ONLY)

  const lamps = createBeacons(palette, atmos, beacons)
  const group = new Group()
  group.add(mesh, roofs, lamps.points)
  if (kitCount > 0) group.add(kits)

  return {
    group,
    mesh,
    material,
    /** Point materials, which need the pixel ratio. */
    points: [lamps.material],
    /** The canvas's height in device pixels, for the rooftops' cut-off. */
    resize(pixelsTall: number) {
      kitMaterial.uniforms.uPixel.value = 2 / Math.max(1, pixelsTall)
    },
    dispose() {
      geometry.dispose()
      material.dispose()
      roofGeometry.dispose()
      roofMaterial.dispose()
      kitGeometry.dispose()
      kitMaterial.dispose()
      lamps.dispose()
    },
  }
}

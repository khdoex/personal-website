import { BoxGeometry, ConeGeometry, type BufferGeometry } from 'three'
import type { Extra } from './buildings'
import { at, merge, tag } from './common'
import { box, cylinder, domeLight, hemisphere } from './landmarks'
import { heightAt, landSdf } from './terrain'

// The Bosphorus shore at night. Its palaces stand at the water's edge,
// floodlit: Dolmabahçe's long front and its clock tower, Çırağan, Beylerbeyi
// on the Asian side under the first bridge, Kuleli's two towers at
// Çengelköy. Between them, on both shores, the yalıs: old wooden mansions
// with their feet in the water and their windows lit.

/** Which way the land lies from the water: -1 west (Europe), +1 east (Asia). */
type Side = -1 | 1

/** The waterline, where the ground meets the water (see bakeShore in water.ts). */
const WATERLINE = 1.75

/** Going inland from the middle of the strait at a given z, where the land is inset deep. */
export function shoreX(z: number, side: Side, inset: number) {
  let x = 60
  for (let i = 0; i < 480 && landSdf(x, z) < inset; i++) x += side * 0.25
  return x
}

/** Stretches of shore lined with yalıs: which side, and from where to where going north. */
const STRETCHES: { side: Side; from: number; to: number }[] = [
  { side: -1, from: -262, to: -408 }, // Kuruçeşme, Arnavutköy, Bebek
  { side: -1, from: -460, to: -580 }, // past the fortress: Emirgan, Yeniköy
  { side: 1, from: -135, to: -244 }, // Kuzguncuk, up to the first bridge
  { side: 1, from: -278, to: -313 }, // between Beylerbeyi and Kuleli
  { side: 1, from: -336, to: -446 }, // Çengelköy, Vaniköy, Kandilli, Anadoluhisarı
  { side: 1, from: -462, to: -580 }, // Kanlıca
]

/** True where a z along either shore has yalıs in front of the city. */
export function yaliShore(z: number) {
  return STRETCHES.some(({ from, to }) => z <= from + 2 && z >= to - 2)
}

/** The yalıs, as buildings for the city to put up with the rest: two or three storeys, painted, at the water. */
export function yalis(random: () => number): Extra[] {
  const out: Extra[] = []
  for (const { side, from, to } of STRETCHES) {
    let z = from
    while (z > to) {
      // Some small, some grand; most of them two or three storeys.
      const grand = random() < 0.2
      const w = grand ? 4 + random() * 1.8 : 1.8 + random() * 1.9
      const d = grand ? 2.2 + random() * 0.5 : 1.5 + random() * 0.7
      z -= w / 2
      // Now and then a garden, a boathouse, a gap to the water.
      if (random() > 0.22) {
        const inset = WATERLINE + d / 2 + (random() < 0.3 ? random() * 0.9 : 0)
        const dx = shoreX(z - 0.6, side, inset) - shoreX(z + 0.6, side, inset)
        out.push({
          x: shoreX(z, side, inset),
          z,
          w,
          d,
          h: grand ? 1.5 + random() * 0.6 : 0.9 + random() * 0.9,
          angle: Math.atan2(-1.2, dx),
          style: 3,
        })
      }
      z -= w / 2 + 0.2 + random() * (random() < 0.15 ? 5 : 1.6)
    }
  }
  return out
}

// ------------------------------------------------------------ the palaces

/** Lit windows in a row along a wall that faces the water. */
function windows(parts: BufferGeometry[], x: number, y: number, z0: number, z1: number, rows: number, step: number, emit = 0.85) {
  for (let r = 0; r < rows; r++) {
    for (let z = z0; z >= z1; z -= step) {
      parts.push(tag(new BoxGeometry(0.04, 0.36, step * 0.46).translate(x, y + 0.3 + r * 0.62, z), 0.3, emit))
    }
  }
}

/** A pyramid roof: a four-sided cone turned square to its walls. */
const pyramid = (r: number, h: number) => new ConeGeometry(r, h, 4).rotateY(Math.PI / 4).translate(0, h / 2, 0)

function dolmabahce(parts: BufferGeometry[]) {
  const depth = 1.8
  const x = shoreX(-110, -1, WATERLINE + depth / 2)
  const g = heightAt(x, -110) - 0.3
  const front = x + depth / 2 + 0.02
  // The long front on the water, a quay wall before it.
  parts.push(tag(at(box(depth, 1.9, 21), x, g, -109.5), (t) => 1 - 0.3 * t))
  parts.push(tag(at(box(depth + 0.2, 0.14, 21.2), x, g + 1.9, -109.5), 0.8))
  windows(parts, front, g, -99.6, -119.6, 2, 0.5)
  parts.push(tag(at(box(0.3, 0.7, 24), x + depth / 2 + 0.35, -0.4, -109.5), 0.7))
  // The central pavilion, taller, and the ceremonial hall under its dome at the north end.
  parts.push(tag(at(box(2.4, 2.5, 3.2), x - 0.3, g, -106), (t) => 1 - 0.35 * t))
  parts.push(tag(at(box(3.2, 2.9, 4.6), x - 0.7, g, -117.5), (t) => 1 - 0.35 * t))
  parts.push(tag(at(hemisphere(1.5, 0.7, 20), x - 0.7, g + 2.9, -117.5), domeLight))
  // The clock tower on the square behind.
  const cx = x - 4.5
  const cg = heightAt(cx, -124) - 0.2
  parts.push(tag(at(box(0.8, 3.4, 0.8), cx, cg, -124), (t) => 1 - 0.35 * t))
  parts.push(tag(at(box(1, 0.25, 1), cx, cg + 3.4, -124), 0.8))
  parts.push(tag(at(cylinder(0.32, 0.36, 0.9, 12), cx, cg + 3.65, -124), 0.8, 0.25))
  parts.push(tag(at(hemisphere(0.34, 1.1, 12), cx, cg + 4.55, -124), domeLight))
  for (const [dx, dz] of [[0.41, 0], [-0.41, 0], [0, 0.41], [0, -0.41]]) {
    parts.push(tag(new BoxGeometry(dz ? 0.3 : 0.03, 0.3, dz ? 0.03 : 0.3).translate(cx + dx, cg + 2.9, -124 + dz), 0.3, 1.1))
  }
}

function ciragan(parts: BufferGeometry[]) {
  const depth = 1.7
  const x = shoreX(-193, -1, WATERLINE + depth / 2)
  const g = heightAt(x, -193) - 0.3
  parts.push(tag(at(box(depth, 2.2, 13), x, g, -193), (t) => 1 - 0.3 * t))
  parts.push(tag(at(box(depth + 0.2, 0.14, 13.2), x, g + 2.2, -193), 0.8))
  windows(parts, x + depth / 2 + 0.02, g + 0.5, -187, -199, 2, 0.46)
  // The colonnade along its foot.
  for (let z = -187; z >= -199; z -= 0.6) parts.push(tag(at(cylinder(0.06, 0.07, 0.62, 6), x + depth / 2 + 0.2, g, z), 1))
  parts.push(tag(at(box(0.3, 0.7, 15), x + depth / 2 + 0.45, -0.4, -193), 0.7))
  // The newer wing behind it.
  parts.push(tag(at(box(2.2, 2.6, 6), x - 2.4, g + 0.3, -190), (t) => 0.7 - 0.3 * t))
  windows(parts, x - 2.4 + 1.12, g + 0.4, -187.6, -192.4, 3, 0.4, 0.6)
}

function beylerbeyi(parts: BufferGeometry[]) {
  const depth = 1.6
  const x = shoreX(-266, 1, WATERLINE + depth / 2)
  const g = heightAt(x, -266) - 0.3
  parts.push(tag(at(box(depth, 1.7, 8), x, g, -266), (t) => 1 - 0.3 * t))
  parts.push(tag(at(box(depth + 0.2, 0.12, 8.2), x, g + 1.7, -266), 0.8))
  windows(parts, x - depth / 2 - 0.02, g, -262.4, -269.6, 2, 0.5)
  // Its two little pavilions on the water, under pyramid roofs.
  for (const z of [-260.6, -271.4]) {
    const px = shoreX(z, 1, WATERLINE + 0.55)
    const pg = heightAt(px, z) - 0.3
    parts.push(tag(at(box(1.1, 0.95, 1.1), px, pg, z), (t) => 1 - 0.3 * t))
    parts.push(tag(at(pyramid(0.85, 0.55), px, pg + 0.95, z), 0.5))
    parts.push(tag(new BoxGeometry(0.04, 0.4, 0.5).translate(px - 0.57, pg + 0.5, z), 0.3, 0.9))
  }
}

function kuleli(parts: BufferGeometry[]) {
  const depth = 1.6
  const x = shoreX(-324, 1, WATERLINE + depth / 2)
  const g = heightAt(x, -324) - 0.3
  parts.push(tag(at(box(depth, 1.8, 10), x, g, -324), (t) => 1 - 0.3 * t))
  windows(parts, x - depth / 2 - 0.02, g, -319.8, -328.2, 2, 0.46)
  // The two towers, tall and pointed.
  for (const z of [-318.6, -329.4]) {
    parts.push(tag(at(box(0.95, 4.2, 0.95), x, g, z), (t) => 1 - 0.4 * t))
    parts.push(tag(at(box(1.1, 0.16, 1.1), x, g + 4.2, z), 0.8))
    parts.push(tag(at(pyramid(0.78, 1.4), x, g + 4.36, z), (t) => 0.6 - 0.4 * t))
    parts.push(tag(new BoxGeometry(0.04, 0.5, 0.32).translate(x - 0.5, g + 3.3, z), 0.3, 0.9))
  }
}

/** The palaces, in the monuments' floodlit stone (see createFloodMaterial in landmarks.ts). */
export function createPalaces(): BufferGeometry {
  const parts: BufferGeometry[] = []
  dolmabahce(parts)
  ciragan(parts)
  beylerbeyi(parts)
  kuleli(parts)
  return merge(parts)
}

/** Where the palaces stand, for the city to keep clear: x, z, radius. */
export function palaceGrounds(): [number, number, number][] {
  return [
    [shoreX(-110, -1, 5), -110, 13],
    [shoreX(-124, -1, 6), -124, 4],
    [shoreX(-193, -1, 5), -193, 8.5],
    [shoreX(-266, 1, 4), -266, 5.5],
    [shoreX(-324, 1, 4), -324, 6.5],
  ]
}

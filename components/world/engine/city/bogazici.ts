import { BoxGeometry, ConeGeometry, ExtrudeGeometry, Shape, type BufferGeometry } from 'three'
import { at, merge, rng, tag } from './common'
import { box, cone, cylinder } from './landmarks'
import { heightAt } from './terrain'

// Boğaziçi University's south campus: the old Robert College buildings, stone
// under slate roofs, on a wooded hill over Bebek, their windows lit among the
// trees. Below it the walls and towers of Rumelihisarı climb from the shore,
// floodlit, where the Bosphorus is at its narrowest.

/** The middle of the campus lawn. */
export const CAMPUS: [number, number] = [-6, -396]
/** Where the fortress stands, for the shots and the buildings to keep clear of. */
export const FORTRESS: [number, number] = [24, -432]

/** The lawn and the halls round it, where no tree grows: x, z, radius. */
export const CAMPUS_OPEN: [number, number, number][] = [
  [-6, -396, 9],
  [1, -395, 5],
  [-12, -404, 5],
  [-14, -388, 4.5],
  [-21, -397, 4.5],
  [4, -408, 3.5],
  [3, -383, 3.5],
  [-32, -408, 5],
  [-33, -387, 4.5],
]

/** A pitched roof: a prism with its ridge along z. */
function gable(w: number, h: number, d: number): BufferGeometry {
  const shape = new Shape()
  shape.moveTo(-w / 2, 0)
  shape.lineTo(w / 2, 0)
  shape.lineTo(0, h)
  shape.closePath()
  return new ExtrudeGeometry(shape, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2)
}

/**
 * A stone hall: walls, a slate roof along its length, and rows of windows on
 * the long sides, some lit. Built with its length along z, then turned.
 */
function hall(w: number, h: number, d: number, floors: number, random: () => number, arched = false) {
  const parts: BufferGeometry[] = [
    tag(box(w, h, d), (t) => 0.62 - 0.3 * t),
    tag(at(box(w + 0.3, 0.18, d + 0.3), 0, h, 0), 0.4),
    tag(at(gable(w + 0.3, w * 0.42, d + 0.3), 0, h + 0.18, 0), 0.1),
  ]
  const floorH = h / floors
  const across = Math.max(2, Math.round(d / 0.85))
  for (let f = 0; f < floors; f++) {
    for (let k = 0; k < across; k++) {
      const z = -d / 2 + ((k + 0.5) * d) / across
      const tall = arched ? floorH * 0.62 : floorH * 0.42
      for (const side of [-1, 1]) {
        const lit = random() < 0.62 ? 0.55 + random() * 0.4 : 0
        parts.push(tag(new BoxGeometry(0.06, tall, 0.34).translate((side * (w + 0.06)) / 2, f * floorH + floorH * 0.3 + tall / 2, z), 0.25, lit))
      }
    }
  }
  return merge(parts)
}

/** A square tower with a pyramid roof and a lit clock face toward the water. */
function clockTower(h: number) {
  return merge([
    tag(box(1.7, h, 1.7), (t) => 0.7 - 0.3 * t),
    tag(at(box(1.9, 0.2, 1.9), 0, h, 0), 0.45),
    tag(new ConeGeometry(1.45, 1.8, 4).rotateY(Math.PI / 4).translate(0, h + 0.2 + 0.9, 0), 0.12),
    tag(new BoxGeometry(0.06, 0.8, 0.8).translate(0.88, h - 1.1, 0), 0.3, 0.9),
  ])
}

function campus() {
  const random = rng(31)
  const [cx, cz] = CAMPUS
  const parts: BufferGeometry[] = []
  const place = (g: BufferGeometry, x: number, z: number, ry: number) => {
    parts.push(at(g, cx + x, heightAt(cx + x, cz + z) - 0.35, cz + z, ry))
  }
  // Round the south lawn, most of them looking out over the Bosphorus.
  place(merge([hall(3.6, 3.4, 8, 2, random, true), at(clockTower(6.2), 0, 0, -4.8)]), 7, 1, 0) // the long hall above the view
  place(hall(3.4, 3.8, 7.5, 4, random), -6, -8, Math.PI / 2 + 0.1) // the oldest, four storeys
  place(hall(3.2, 3.4, 6.5, 3, random), -8, 8, Math.PI / 2 - 0.12)
  place(hall(3, 3, 6, 3, random), -15, -1, 0.05)
  place(hall(2.6, 2.4, 4.5, 2, random), 10, -12, 0.4)
  place(hall(2.8, 2.6, 5, 2, random), 9, 13, -0.3)
  // Newer buildings further back, up the hill.
  place(hall(4, 2.6, 7, 3, random), -26, -12, 0.25)
  place(hall(4, 2.4, 6, 3, random), -27, 9, -0.15)

  const lamps: number[] = []
  // Lamps along the paths: round the lawn, and down the hill to the gate.
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2
    const x = cx + Math.cos(a) * 10.5
    const z = cz + Math.sin(a) * 9
    lamps.push(x, heightAt(x, z) + 1.3, z)
  }
  for (let i = 0; i < 12; i++) {
    const x = cx + 12 + i * 1.6
    const z = cz + 16 + Math.sin(i * 0.8) * 2.5
    lamps.push(x, heightAt(x, z) + 1.3, z)
  }
  return { geometry: merge(parts), lamps }
}

// ------------------------------------------------------------ Rumelihisarı

/** The three great towers, and the curtain wall that ties them up the hill. */
const TOWERS: [number, number, number, number][] = [
  [33, -440, 2.8, 8], // Halil Paşa, at the water
  [31, -418, 2.3, 6.5], // Sarıca Paşa, on the shore to the south
  [13, -446, 2.5, 7.5], // Zağanos Paşa, up the hill
]
const WALL: [number, number][] = [
  [31, -418], [22, -413], [15, -421], [11, -433], [13, -446], [22, -448], [33, -440], [35, -429], [31, -418],
]

function crenellate(parts: BufferGeometry[], ax: number, az: number, bx: number, bz: number, top: (x: number, z: number) => number) {
  const len = Math.hypot(bx - ax, bz - az)
  const angle = Math.atan2(bx - ax, bz - az)
  for (let s = 0.4; s < len; s += 0.9) {
    const x = ax + ((bx - ax) * s) / len
    const z = az + ((bz - az) * s) / len
    parts.push(tag(at(new BoxGeometry(0.62, 0.45, 0.4), x, top(x, z) + 0.22, z, angle + Math.PI / 2), 0.7))
  }
}

function fortress() {
  const parts: BufferGeometry[] = []
  const wallH = 2.6
  // Walls climbing the slope in short stepped pieces, each on its own footing.
  const top = (x: number, z: number) => heightAt(x, z) + wallH
  for (let i = 0; i < WALL.length - 1; i++) {
    const [ax, az] = WALL[i]
    const [bx, bz] = WALL[i + 1]
    const len = Math.hypot(bx - ax, bz - az)
    const angle = Math.atan2(bx - ax, bz - az)
    const pieces = Math.max(1, Math.round(len / 1.6))
    for (let k = 0; k < pieces; k++) {
      const t = (k + 0.5) / pieces
      const x = ax + (bx - ax) * t
      const z = az + (bz - az) * t
      const ground = heightAt(x, z)
      parts.push(tag(at(new BoxGeometry(0.8, wallH + 1.2, len / pieces + 0.05).translate(0, (wallH + 1.2) / 2, 0), x, ground - 1.2, z, angle), (u) => 1 - 0.4 * u))
    }
    crenellate(parts, ax, az, bx, bz, top)
    // A small round tower at each corner that is not one of the great three.
    const corner = TOWERS.some(([tx, tz]) => Math.hypot(tx - ax, tz - az) < 1)
    if (!corner && i > 0) {
      const g = heightAt(ax, az)
      parts.push(tag(at(cylinder(0.95, 1.05, wallH + 2, 10), ax, g - 1, az), (u) => 1 - 0.4 * u))
    }
  }
  for (const [x, z, r, h] of TOWERS) {
    const g = heightAt(x, z) - 1
    parts.push(tag(at(cylinder(r, r * 1.06, h, 14), x, g, z), (u) => 1.05 - 0.45 * u))
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2
      parts.push(tag(at(new BoxGeometry(0.5, 0.5, 0.5), x + Math.cos(a) * r * 0.95, g + h + 0.25, z + Math.sin(a) * r * 0.95), 0.7))
    }
    parts.push(tag(at(cone(r * 0.92, r * 1.3, 14), x, g + h + 0.1, z), (u) => 0.4 - 0.3 * u))
  }
  return merge(parts)
}

export function createBogazici() {
  const { geometry, lamps } = campus()
  return { geometry: merge([geometry, fortress()]), lamps }
}

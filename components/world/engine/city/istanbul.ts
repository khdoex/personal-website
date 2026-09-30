import { BufferAttribute, BufferGeometry, Group, Mesh, Points } from 'three'
import { CAMPUS, CAMPUS_OPEN, createBogazici, FORTRESS } from './bogazici'
import { createBridge } from './bridge'
import { createBuildings } from './buildings'
import { ISTANBUL_AT, rng, type Atmosphere } from './common'
import { createKanyon, KANYON } from './kanyon'
import { createLandmarks, SITES } from './landmarks'
import { createLife } from './life'
import { createRoads, distToRoute, type Route } from './roads'
import { createTerrain, EUROPEAN_SHORE, heightAt, landSdf } from './terrain'
import { createTrees, type Park } from './trees'
import { bakeShore, createWater } from './water'
import type { Palette } from '../palette'
import type { Quality } from '../quality'

// Istanbul at night, where the ride lands and the site lives: the old city
// on its peninsula, Galata across the Golden Horn, Asia across the
// Bosphorus and the two bridges over it, Boğaziçi's campus on its hill above
// Bebek, and inland the towers of Levent along Büyükdere Caddesi, Kanyon
// among them. It reads the engine's atmosphere, so a change of hour (dusk,
// deep night, dawn over Asia) reaches every stone at once.

/** Where the towers stand: Levent round Kanyon, and Maslak further up the avenue. */
const TOWERS: [number, number, number][] = [
  [-92, -425, 42],
  [-106, -540, 40],
]

/** Woods: Boğaziçi's hill, the slope round Rumelihisarı, the gardens below Topkapı. */
const PARKS: Park[] = [
  [CAMPUS[0] + 2, CAMPUS[1], 38, 460],
  [FORTRESS[0] - 4, FORTRESS[1] - 3, 16, 70],
  [SITES.topkapi[0] - 4, SITES.topkapi[1] + 2, 17, 90],
]

/** The second bridge, across the narrows at Rumelihisarı. */
export const SECOND_BRIDGE: [number, number, number] = [28, 102, -452]

/** Büyükdere Caddesi, from Mecidiyeköy up through Levent to Maslak. */
const BUYUKDERE: [number, number][] = [
  [-52, -180], [-62, -240], [-74, -300], [-86, -350], [-89, -372], [-95, -420], [-101, -480], [-106, -560], [-110, -640],
]

/** The coast road on the European side, a little inland of the water. */
function coastRoad(): [number, number][] {
  return EUROPEAN_SHORE.map(([x, z]) => {
    let px = x - 2.6
    while (landSdf(px, z) < 1.8 && px > x - 12) px -= 0.5
    return [px, z] as [number, number]
  })
}

export function createIstanbul(palette: Palette, quality: Quality, atmos: Atmosphere) {
  const group = new Group()
  group.position.copy(ISTANBUL_AT)

  const tier = quality.tier
  // The low tier gets no mirror on the water and no street plan on the
  // ground: the two things that cost the most per pixel.
  const lite = tier === 'low'
  const terrain = createTerrain(palette, atmos, tier === 'high' ? 1 : tier === 'medium' ? 0.75 : 0.55, !lite, PARKS)
  const landmarks = createLandmarks(palette, atmos)
  const bridge = createBridge(palette, atmos, SITES.bridge)
  const second = createBridge(palette, atmos, SECOND_BRIDGE, 'lamps')

  // Boğaziçi's campus and Rumelihisarı, in the monuments' floodlit stone.
  const bogazici = createBogazici()
  const campus = new Mesh(bogazici.geometry, landmarks.materials[0])
  campus.frustumCulled = false
  const random = rng(41)
  const campusLampGeometry = new BufferGeometry()
  campusLampGeometry.setAttribute('position', new BufferAttribute(new Float32Array(bogazici.lamps), 3))
  campusLampGeometry.setAttribute(
    'aSeed',
    new BufferAttribute(new Float32Array(bogazici.lamps.length / 3).map(() => random()), 1)
  )
  const campusLamps = new Points(campusLampGeometry, terrain.materials[1])
  campusLamps.frustumCulled = false

  const trees = createTrees(
    palette,
    atmos,
    PARKS,
    heightAt,
    (x, z) =>
      CAMPUS_OPEN.some(([cx, cz, r]) => Math.hypot(x - cx, z - cz) < r) ||
      Math.hypot(x - FORTRESS[0], z - FORTRESS[1]) < 11 ||
      Math.hypot(x - SITES.topkapi[0], z - SITES.topkapi[1]) < 11,
    tier === 'high' ? 1 : tier === 'medium' ? 0.7 : 0.4
  )

  const kanyon = createKanyon(palette, atmos, heightAt(...KANYON))
  const coast = coastRoad()
  const routes: Route[] = [
    { points: BUYUKDERE, lanes: [0.55, 1.1], cars: tier === 'low' ? 90 : 260, width: 3, lampEvery: 3 },
    { points: coast, lanes: [0.5], cars: tier === 'low' ? 30 : 70, width: 1.8, lampEvery: 4 },
  ]
  const roads = createRoads(palette, atmos, routes, heightAt, terrain.materials[1])

  const buildings = createBuildings(palette, atmos, tier === 'high' ? 16000 : tier === 'medium' ? 9500 : 2600, {
    height: heightAt,
    inland: landSdf,
    bounds: [-420, 420, -660, 150],
    // The mouth of the Bosphorus, Bebek under the campus, and Levent.
    focus: [
      [40, -80],
      [10, -370],
      [-90, -390],
    ],
    reach: 150,
    clear: [
      [SITES.hagiaSophia[0], SITES.hagiaSophia[1], 9],
      [SITES.blueMosque[0], SITES.blueMosque[1] + 5, 12],
      [SITES.suleymaniye[0], SITES.suleymaniye[1] - 4, 12],
      [SITES.yeniCami[0], SITES.yeniCami[1], 7],
      [SITES.topkapi[0], SITES.topkapi[1], 11],
      [SITES.galata[0], SITES.galata[1], 3.5],
      [SITES.camlica[0] - 7, SITES.camlica[1] + 3, 15],
      [SITES.bridge[0] - 4, SITES.bridge[2], 10],
      [SITES.bridge[1] + 4, SITES.bridge[2], 10],
      [SECOND_BRIDGE[0] + 2, SECOND_BRIDGE[2], 8],
      [SECOND_BRIDGE[1] - 2, SECOND_BRIDGE[2], 8],
      [CAMPUS[0], CAMPUS[1], 34],
      [FORTRESS[0], FORTRESS[1], 16],
      [KANYON[0], KANYON[1], 17],
      // the square in front of it on the avenue
      [KANYON[0] + 17, KANYON[1] + 2, 9],
    ],
    avoid: (x, z) =>
      distToRoute(BUYUKDERE, x, z) < routes[0].width / 2 + 1.4 || distToRoute(coast, x, z) < routes[1].width / 2 + 1,
    rise(x, z, r) {
      // Low round Kanyon, so the avenue sees it; the towers stand behind.
      if (Math.hypot(x - KANYON[0], z - KANYON[1]) < 40) return 0.7 + r * 0.8
      for (const [tx, tz, tr] of TOWERS) {
        if (Math.hypot(x - tx, z - tz) < tr && r < 0.16) return 6 + r * 80
      }
      // Low in the old city, a little taller up the shores and in Asia.
      const old = x < 20 && z > -60
      const rise = old ? 0 : Math.min(1, (-z - 60) / 420 + (x > 100 ? 0.25 : 0))
      return 0.8 + r * (0.9 + 1.5 * rise) + (r > 0.96 ? 2.2 * rise : 0)
    },
  })
  const life = createLife(palette, atmos, landmarks.materials[0], tier === 'low' ? 14 : 30)
  // The reflection is drawn at a fraction of the screen's resolution; the
  // ripples hide the softness.
  const texScale = tier === 'high' ? 0.5 : tier === 'medium' ? 0.4 : 0.3
  // The waterline, baked once from the same outline the ground is made
  // from: the ground meets the water about 1.7 units inside it.
  const shore = bakeShore(landSdf, [-260, -620, 360, 180], lite ? [160, 206] : [256, 330], 1.66)
  const water = createWater(palette, atmos, 4400, 512, 512, !lite, { origin: ISTANBUL_AT, shore, current: 1 })

  group.add(
    terrain.mesh,
    terrain.shore,
    landmarks.group,
    bridge.group,
    second.group,
    campus,
    campusLamps,
    trees.mesh,
    kanyon.mesh,
    roads.group,
    buildings.mesh,
    life.group,
    water.mesh
  )
  const points = [terrain.materials[1], bridge.ledMaterial, second.ledMaterial, roads.carMaterial]

  return {
    group,
    resize(width: number, height: number, pixelRatio: number) {
      water.resize(width * pixelRatio * texScale, height * pixelRatio * texScale)
      for (const m of points) m.uniforms.uPixelRatio.value = pixelRatio
    },
    update(time: number, dt: number, highlight: number | null, visible: boolean) {
      group.visible = visible
      if (!visible) return
      buildings.material.uniforms.uLit.value = 0.34 - 0.1 * atmos.uDawn.value
      water.sync()
      landmarks.update(time)
      bridge.update(highlight, dt)
      roads.update(time)
      life.update(time)
    },
    dispose() {
      terrain.dispose()
      landmarks.dispose()
      bridge.dispose()
      second.dispose()
      bogazici.geometry.dispose()
      trees.dispose()
      campusLampGeometry.dispose()
      kanyon.dispose()
      roads.dispose()
      buildings.dispose()
      life.dispose()
      water.dispose()
    },
  }
}

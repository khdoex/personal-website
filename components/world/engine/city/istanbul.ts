import { BufferAttribute, BufferGeometry, Group, Mesh, Points, type Camera } from 'three'
import { createAir } from './air'
import { CAMPUS, CAMPUS_OPEN, createBogazici, FORTRESS } from './bogazici'
import { createBridge } from './bridge'
import { createBuildings } from './buildings'
import { ISTANBUL_AT, rng, type Atmosphere } from './common'
import { createKanyon, KANYON } from './kanyon'
import { createLandmarks, SITES } from './landmarks'
import { createLife } from './life'
import { createRoads, distToRoute, type Route } from './roads'
import { createPalaces, palaceGrounds, yaliShore, yalis } from './shore'
import { ASIAN_SHORE, createTerrain, EUROPEAN_SHORE, GALATA_BRIDGE, heightAt, landSdf } from './terrain'
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

/**
 * Woods and gardens: x, z, radius, trees, and the share of them that are
 * stone pines and cypresses (the rest broadleaf).
 */
const PARKS: Park[] = [
  [CAMPUS[0] + 2, CAMPUS[1], 38, 460, 0.18, 0.08], // Boğaziçi's hill
  [FORTRESS[0] - 4, FORTRESS[1] - 3, 16, 70, 0.45, 0.25], // the slope round Rumelihisarı
  [SITES.topkapi[0] - 4, SITES.topkapi[1] + 2, 17, 90, 0.1, 0.3], // Topkapı's gardens
  [-6, -24, 7, 36, 0.05, 0.1], // Gülhane, down to the water
  [4, -198, 13, 150, 0.15, 0.06], // Yıldız, up the hill from Çırağan
  [-36, -150, 9, 60, 0.1, 0.05], // Maçka
  [12, -505, 17, 150, 0.3, 0.06], // Emirgan
  [128, -150, 15, 130, 0.35, 0.05], // Fethi Paşa, over Kuzguncuk
  [134, 6, 17, 150, 0, 0.85], // Karacaahmet's cypresses
  [124, -392, 18, 140, 0.4, 0.1], // the woods over Kandilli
  [232, -104, 15, 90, 0.3, 0.1], // round the top of Çamlıca
]

/** The second bridge, across the narrows at Rumelihisarı. */
export const SECOND_BRIDGE: [number, number, number] = [28, 102, -452]

/** Büyükdere Caddesi, from Mecidiyeköy up through Levent to Maslak. */
const BUYUKDERE: [number, number][] = [
  [-52, -180], [-62, -240], [-74, -300], [-86, -350], [-89, -372], [-95, -420], [-101, -480], [-106, -560], [-110, -640],
]

/**
 * A coast road, a little inland of the water: behind the yalıs and the
 * palaces, which have their feet in it. side: which way is inland along x.
 */
function coastRoad(shore: [number, number][], side: -1 | 1): [number, number][] {
  return shore.map(([x, z]) => {
    let px = x + side * 2.6
    while (landSdf(px, z) < 4.6 && Math.abs(px - x) < 14) px += side * 0.5
    return [px, z] as [number, number]
  })
}

/** Kennedy Caddesi, round the old city's shore on the Sea of Marmara. */
function kennedy(): [number, number][] {
  const shore: [number, number][] = [[13, -10], [7, 6], [-9, 21], [-40, 34], [-100, 46], [-200, 54], [-320, 58]]
  return shore.map(([x, z]) => {
    let pz = z
    while (landSdf(x, pz) < 3 && pz > z - 14) pz -= 0.5
    return [x, pz] as [number, number]
  })
}

/**
 * What kind of building stands where: older houses under tiled roofs in the
 * old city, round Galata and in Üsküdar; blocks of flats everywhere, a few
 * offices among them, more of them the taller they get.
 */
function istanbulStyle(x: number, z: number, h: number, r: number) {
  const old = (x < 20 && z > -60) || (x > -60 && x < 32 && z > -130 && z <= -60) || (x > 100 && z > -100 && z < 60)
  if (old) return r < 0.62 ? 1 : 0
  if (h > 3.4) return r < 0.45 ? 2 : 0
  return r < 0.12 ? 1 : r < 0.3 ? 2 : 0
}

export function createIstanbul(palette: Palette, quality: Quality, atmos: Atmosphere) {
  const group = new Group()
  group.position.copy(ISTANBUL_AT)

  const tier = quality.tier
  // The low tier gets no mirror on the water and no street plan on the
  // ground: the two things that cost the most per pixel.
  const lite = tier === 'low'
  // The cheapest tier keeps to the three woods the camera sees most.
  const parks = lite ? PARKS.slice(0, 3) : PARKS
  const terrain = createTerrain(palette, atmos, tier === 'high' ? 1 : tier === 'medium' ? 0.75 : 0.46, !lite, parks)
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
    { parks },
    heightAt,
    (x, z) =>
      CAMPUS_OPEN.some(([cx, cz, r]) => Math.hypot(x - cx, z - cz) < r) ||
      Math.hypot(x - FORTRESS[0], z - FORTRESS[1]) < 11 ||
      Math.hypot(x - SITES.topkapi[0], z - SITES.topkapi[1]) < 11,
    tier === 'high' ? 1 : tier === 'medium' ? 0.7 : 0.3,
    lite ? 0 : 1
  )

  const kanyon = createKanyon(palette, atmos, heightAt(...KANYON))
  const coast = coastRoad(EUROPEAN_SHORE, -1)
  const asian = coastRoad(ASIAN_SHORE, 1)
  const few = tier === 'low' ? 0.35 : 1
  const routes: Route[] = [
    { points: BUYUKDERE, lanes: [0.55, 1.1], cars: Math.round(260 * few), width: 3, lampEvery: 3 },
    { points: coast, lanes: [0.5], cars: Math.round(90 * few), width: 1.8, lampEvery: 4 },
    { points: asian, lanes: [0.5], cars: Math.round(80 * few), width: 1.8, lampEvery: 4 },
    { points: kennedy(), lanes: [0.5, 1], cars: Math.round(110 * few), width: 2.4, lampEvery: 3 },
    { points: [GALATA_BRIDGE.from, GALATA_BRIDGE.to], level: GALATA_BRIDGE.y, lanes: [0.45], cars: Math.round(14 * few), width: 1.6, lampEvery: 99 },
  ].slice(0, lite ? 2 : undefined)
  const roads = createRoads(palette, atmos, routes, heightAt, terrain.materials[1])

  // The palaces on the water, in the monuments' floodlit stone.
  const palaces = new Mesh(createPalaces(), landmarks.materials[0])
  palaces.frustumCulled = false
  const onShore = (x: number, z: number) => x > 0 && x < 140 && yaliShore(z) && landSdf(x, z) < 6.4

  const buildings = createBuildings(palette, atmos, tier === 'high' ? 18000 : tier === 'medium' ? 10000 : 2600, {
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
      // the woods and gardens, the campus's own aside
      ...PARKS.slice(3).map(([x, z, r]) => [x, z, r * 0.9] as [number, number, number]),
      [KANYON[0], KANYON[1], 17],
      // the square in front of it on the avenue
      [KANYON[0] + 17, KANYON[1] + 2, 9],
      ...palaceGrounds(),
    ],
    // The avenue and the coast roads; and the strip of shore the yalıs stand on.
    avoid: (x, z) =>
      distToRoute(BUYUKDERE, x, z) < routes[0].width / 2 + 1.4 ||
      distToRoute(coast, x, z) < routes[1].width / 2 + 1 ||
      distToRoute(asian, x, z) < 1.8 / 2 + 1 ||
      onShore(x, z),
    style: istanbulStyle,
    extra: yalis(rng(61)),
    rooftops: tier === 'high' ? 6000 : tier === 'medium' ? 2400 : 0,
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
  }, 11, lite)
  const life = createLife(palette, atmos, landmarks.materials[0], lite ? 14 : 36, lite)
  const air = createAir(palette, atmos)
  // The reflection is drawn at a fraction of the screen's resolution; the
  // ripples hide the softness.
  const texScale = tier === 'high' ? 0.5 : tier === 'medium' ? 0.4 : 0.3
  // The waterline, baked once from the same outline the ground is made
  // from: the ground meets the water about 1.7 units inside it.
  const shore = bakeShore(landSdf, [-260, -620, 360, 180], lite ? [160, 206] : [256, 330], 1.66)
  const water = createWater(palette, atmos, 4400, 512, 512, !lite, {
    origin: ISTANBUL_AT,
    shore,
    current: 1,
    taps: tier === 'high' ? 6 : 4,
  })

  group.add(
    terrain.mesh,
    terrain.shore,
    landmarks.group,
    bridge.group,
    second.group,
    campus,
    campusLamps,
    palaces,
    trees.group,
    kanyon.group,
    roads.group,
    buildings.group,
    life.group,
    air.points,
    water.mesh
  )
  const points = [
    terrain.materials[1],
    bridge.ledMaterial,
    bridge.beaconMaterial,
    second.ledMaterial,
    second.beaconMaterial,
    roads.carMaterial,
    life.lightMaterial,
    air.material,
    landmarks.beaconMaterial,
    landmarks.bulbMaterial,
    kanyon.beaconMaterial,
    ...buildings.points,
  ]

  return {
    group,
    /** Tells the water which camera will look at it. */
    watch(camera: Camera) {
      water.watch(camera)
    },
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
      air.update(time)
    },
    dispose() {
      terrain.dispose()
      landmarks.dispose()
      bridge.dispose()
      second.dispose()
      bogazici.geometry.dispose()
      palaces.geometry.dispose()
      trees.dispose()
      campusLampGeometry.dispose()
      kanyon.dispose()
      roads.dispose()
      buildings.dispose()
      life.dispose()
      air.dispose()
      water.dispose()
    },
  }
}

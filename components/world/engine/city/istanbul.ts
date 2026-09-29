import { Group } from 'three'
import { createBridge } from './bridge'
import { createBuildings } from './buildings'
import { ISTANBUL_AT, type Atmosphere } from './common'
import { createLandmarks, SITES } from './landmarks'
import { createLife } from './life'
import { createTerrain, heightAt, landSdf } from './terrain'
import { createWater } from './water'
import type { Palette } from '../palette'
import type { Quality } from '../quality'

// Istanbul at night, where the ride lands and the site lives: the old city
// on its peninsula, Galata across the Golden Horn, Asia across the
// Bosphorus, the bridge between them. It reads the engine's atmosphere, so
// a change of hour (dusk over the old city, deep night, dawn over Asia)
// reaches every stone at once.

/** Levent, where the towers are, up the European shore behind the bridge. */
const TOWERS: [number, number, number] = [-95, -470, 70]

export function createIstanbul(palette: Palette, quality: Quality, atmos: Atmosphere) {
  const group = new Group()
  group.position.copy(ISTANBUL_AT)

  const tier = quality.tier
  // The low tier gets no mirror on the water and no street plan on the
  // ground: the two things that cost the most per pixel.
  const lite = tier === 'low'
  const terrain = createTerrain(palette, atmos, tier === 'high' ? 1 : tier === 'medium' ? 0.75 : 0.55, !lite)
  const landmarks = createLandmarks(palette, atmos)
  const bridge = createBridge(palette, atmos, SITES.bridge)
  const buildings = createBuildings(palette, atmos, tier === 'high' ? 15000 : tier === 'medium' ? 9000 : 2600, {
    height: heightAt,
    inland: landSdf,
    bounds: [-420, 420, -640, 150],
    focus: [40, -80],
    reach: 190,
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
    ],
    rise(x, z, r) {
      if (Math.hypot(x - TOWERS[0], z - TOWERS[1]) < TOWERS[2] && r < 0.12) return 6 + r * 90
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
  const water = createWater(palette, atmos, 4400, 512, 512, !lite)

  group.add(terrain.mesh, terrain.shore, landmarks.group, bridge.group, buildings.mesh, life.group, water.mesh)
  const points = [terrain.materials[1], bridge.ledMaterial]

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
      life.update(time)
    },
    dispose() {
      terrain.dispose()
      landmarks.dispose()
      bridge.dispose()
      buildings.dispose()
      life.dispose()
      water.dispose()
    },
  }
}

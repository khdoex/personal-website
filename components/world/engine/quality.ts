// How much the device can take. Three tiers, decided once from what the
// browser reports, then walked down at runtime if frames run slow.

export type Tier = 'high' | 'medium' | 'low'

export interface Quality {
  tier: Tier
  maxPixelRatio: number
  stars: number
  textureSize: 1024 | 2048
  tubeSegments: number
  tubeRadial: number
  sphereSegments: number
  backgroundSize: number
  cloudMapSize: number
  octaves: number
}

// Past one and a half device pixels to a CSS pixel the world, behind the
// text and softened by fog, looks no sharper; it only costs more: a retina
// screen at 2 draws nearly twice the pixels it does at 1.5.
const PRESETS: Record<Tier, Quality> = {
  high: {
    tier: 'high',
    maxPixelRatio: 1.5,
    stars: 6500,
    textureSize: 2048,
    tubeSegments: 900,
    tubeRadial: 56,
    sphereSegments: 128,
    backgroundSize: 1024,
    cloudMapSize: 2048,
    octaves: 6,
  },
  medium: {
    tier: 'medium',
    maxPixelRatio: 1.25,
    stars: 4200,
    textureSize: 2048,
    tubeSegments: 600,
    tubeRadial: 40,
    sphereSegments: 96,
    backgroundSize: 512,
    cloudMapSize: 1024,
    octaves: 5,
  },
  low: {
    tier: 'low',
    maxPixelRatio: 1,
    stars: 2600,
    textureSize: 1024,
    tubeSegments: 360,
    tubeRadial: 28,
    sphereSegments: 64,
    backgroundSize: 256,
    cloudMapSize: 512,
    octaves: 4,
  },
}

export function detectQuality(gl: WebGLRenderingContext | WebGL2RenderingContext, forced?: string | null): Quality {
  if (forced === 'high' || forced === 'medium' || forced === 'low') return PRESETS[forced]

  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 8
  const coarse = matchMedia('(pointer: coarse)').matches
  const small = Math.min(screen.width, screen.height) < 700

  let renderer = ''
  try {
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER))
  } catch {
    // some browsers refuse the query; judge on the rest
  }
  // A software rasteriser draws every pixel on the CPU.
  const software = /swiftshader|llvmpipe|software|basic render/i.test(renderer)

  if (software || cores <= 2 || memory <= 2) return PRESETS.low
  if ((coarse && small) || cores <= 4 || memory <= 4) return PRESETS.medium
  return PRESETS.high
}

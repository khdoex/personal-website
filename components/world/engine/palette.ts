import { Color } from 'three'

// The globe is painted from the same tokens as the page. They are stored in
// app/globals.css as bare sRGB channels ("10 20 40"), read here once, and
// handed to the shaders as they are. Colour management is off for the whole
// engine (see engine.ts), so a channel of 40 reaches the screen as 40 and the
// ocean is exactly the colour the stylesheet says it is.

const TOKENS = {
  background: '--background',
  heading: '--heading',
  foreground: '--foreground',
  muted: '--muted',
  accent: '--accent',
  sun: '--sun',
  sky: '--sky',
  space: '--world-space',
  oceanDeep: '--world-ocean-deep',
  ocean: '--world-ocean',
  shallow: '--world-ocean-shallow',
  forest: '--world-forest',
  meadow: '--world-meadow',
  arid: '--world-arid',
  ice: '--world-ice',
  city: '--world-city',
  atmosphere: '--world-atmosphere',
  dusk: '--world-dusk',
  aurora: '--world-aurora',
} as const

export type PaletteKey = keyof typeof TOKENS
export type Palette = Record<PaletteKey, Color>

export function readPalette(root: Element = document.documentElement): Palette {
  const style = getComputedStyle(root)
  const palette = {} as Palette
  for (const [key, name] of Object.entries(TOKENS) as [PaletteKey, string][]) {
    const channels = style.getPropertyValue(name).trim().split(/\s+/).map(Number)
    const [r, g, b] = channels.length === 3 && channels.every((c) => Number.isFinite(c))
      ? channels
      : [128, 128, 128] // a missing token shows up as flat grey, not as a crash
    palette[key] = new Color(r / 255, g / 255, b / 255)
  }
  return palette
}

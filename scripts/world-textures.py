"""Bake the data textures the home page globe is painted from.

Not part of the build. Run once, by hand, when the textures need rebaking:

    pip install pillow numpy
    python3 scripts/world-textures.py <source-dir>

<source-dir> holds four NASA-derived images, as redistributed with the
three-globe examples (github.com/vasturiano/three-globe, example/img/):

    earth-water.png        water mask, NASA Blue Marble
    earth-night.jpg        city lights, NASA Earth at Night (Black Marble)
    earth-blue-marble.jpg  true colour, NASA Blue Marble
    earth-topology.png     elevation, NASA Blue Marble topography

NASA imagery is not copyrighted. The globe never shows these pictures as
they are: each is reduced to one scalar field, and the shader in
components/world/engine/shaders.ts repaints those fields in the site's own
palette. So the textures carry data (where land is, where people are, how
dry the ground is), and colour stays with the tokens in app/globals.css.

Outputs, in public/world/, each at a full and a half size:

    land-<w>.png     land mask, 1 on land, soft 1-2px coast
    lights-<w>.jpg   city lights, 0..1
    biome-<w>.jpg    R aridity (0 forest, 1 desert), G ice, B elevation
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
OUT = Path(__file__).resolve().parent.parent / 'public' / 'world'
OUT.mkdir(parents=True, exist_ok=True)


def load(name, mode):
    return Image.open(SRC / name).convert(mode)


def to_img(a):
    return Image.fromarray(np.clip(a * 255 + 0.5, 0, 255).astype(np.uint8))


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


# Land: the water mask inverted. The source draws rivers as 1px water lines,
# which read as cracks at globe scale and triple the PNG, so a morphological
# close (dilate, then erode) fills them while lakes and seas stay open. The
# source is 1600 wide, so the full size is an upsample; Lanczos keeps the
# coast soft rather than stair-stepped.
water = load('earth-water.png', 'L')
land_src = Image.fromarray(255 - np.asarray(water))
land_src = land_src.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))

# The coast itself is refined against the 4096-wide true-colour map, where
# water is the only thing blue-dominant: forest, desert and ice all have
# B - R below 15, deep and shallow sea sit well above it. Only a band a few
# pixels either side of the mask's coast is reclassified, so a dark lake or
# a wetland far inland cannot turn into sea.
bm_full = np.asarray(load('earth-blue-marble.jpg', 'RGB')).astype(np.float32)
big = (bm_full.shape[1], bm_full.shape[0])
mask_big = np.asarray(
    land_src.resize(big, Image.BILINEAR).filter(ImageFilter.GaussianBlur(3))
).astype(np.float32) / 255
coastal = (mask_big > 0.02) & (mask_big < 0.98)
bm_land = (bm_full[..., 2] - bm_full[..., 0]) < 15
land_big = np.where(coastal, bm_land, mask_big > 0.5).astype(np.float32)
land_src = Image.fromarray((land_big * 255).astype(np.uint8))
land_src = land_src.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))

# Lights: the Black Marble paints unlit ground a moonlit blue, so brightness
# alone would light up every desert. Cities are warm or neutral, the base is
# blue, and R - 0.3B separates them: over open ocean it stays below zero at
# the 99th percentile.
night = np.asarray(load('earth-night.jpg', 'RGB')).astype(np.float32)
lights = np.clip((night[..., 0] - 0.3 * night[..., 2] - 2.0) / 72.0, 0, 1) ** 0.85

# Biome: from the true-colour map. Deserts are bright and warm, forests dark,
# ice bright and neutral. Water pixels are zeroed by the land mask later.
bm = np.asarray(load('earth-blue-marble.jpg', 'RGB')).astype(np.float32)
r, g, b = bm[..., 0], bm[..., 1], bm[..., 2]
luma = 0.299 * r + 0.587 * g + 0.114 * b
warmth = np.clip((r - b) / 70.0, 0, 1)
aridity = smoothstep(45, 150, luma) * warmth
ice = smoothstep(150, 225, np.minimum(np.minimum(r, g), b))
aridity = aridity * (1 - ice)

topo = np.asarray(load('earth-topology.png', 'L')).astype(np.float32) / 255.0

for w in (2048, 1024):
    h = w // 2
    land_img = land_src.resize((w, h), Image.LANCZOS)
    land_img.save(OUT / f'land-{w}.png', optimize=True)

    lights_img = to_img(lights).resize((w, h), Image.LANCZOS)
    lights_img.save(OUT / f'lights-{w}.jpg', quality=82, optimize=True, progressive=True)

    # The biome fields are low frequency, so they ship at half the size of
    # the others. A light blur hides the resampling of three sources that
    # disagree slightly on where the coast is.
    bw, bh = w // 2, h // 2
    land_small = np.asarray(land_img.resize((bw, bh), Image.LANCZOS)).astype(np.float32) / 255
    chans = [
        np.asarray(to_img(aridity).resize((bw, bh), Image.LANCZOS)).astype(np.float32) / 255,
        np.asarray(to_img(ice).resize((bw, bh), Image.LANCZOS)).astype(np.float32) / 255,
        np.asarray(to_img(topo).resize((bw, bh), Image.LANCZOS)).astype(np.float32) / 255,
    ]
    rgb = np.stack([c * np.clip(land_small * 1.4, 0, 1) for c in chans], axis=-1)
    biome = Image.fromarray(np.clip(rgb * 255 + 0.5, 0, 255).astype(np.uint8), 'RGB')
    biome = biome.filter(ImageFilter.GaussianBlur(0.6))
    # 4:4:4, so no channel bleeds into its neighbour through chroma subsampling.
    biome.save(OUT / f'biome-{w}.jpg', quality=90, subsampling=0, optimize=True)

for f in sorted(OUT.iterdir()):
    print(f'{f.name:20s} {f.stat().st_size / 1024:7.1f} KB')

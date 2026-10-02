#!/usr/bin/env python3
"""
SD LIVING — artwork -> lamp texture pipeline.

Takes black-line-art-on-white plates and produces the two texture kinds the
3D lamps need:

  <name>_panel.png   RGBA. Alpha = the physical acrylic silhouette (artwork +
                     everything enclosed by it). RGB = black where the printed
                     line art is, white where the acrylic should glow.
                     -> used as map + emissiveMap + alphaTest cutout, so the
                        shadow the lamp throws on the wall is the real motif.

  <name>_window.png  RGB. A black cylinder wrap with a rounded glowing window
                     in the middle and the motif sitting black inside it.
                     -> used as emissiveMap on the cylinder lamps.
"""

import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import numpy as np

RAW = os.path.join(os.path.dirname(__file__), '..', 'public', 'art', 'raw')
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'art')

PANEL_MAX = 1024
WIN_W, WIN_H = 1024, 1024


def load_gray(path, max_dim=PANEL_MAX):
    im = Image.open(path).convert('L')
    # autocrop to the ink
    arr = np.array(im)
    ink = arr < 200
    if ink.any():
        ys, xs = np.where(ink)
        pad = 6
        im = im.crop((
            max(xs.min() - pad, 0),
            max(ys.min() - pad, 0),
            min(xs.max() + pad, im.width),
            min(ys.max() + pad, im.height),
        ))
    scale = max_dim / max(im.size)
    im = im.resize((max(int(im.width * scale), 1), max(int(im.height * scale), 1)), Image.LANCZOS)
    return im


def panel_mask(gray, thresh=140):
    """artwork + enclosed interior = the physical acrylic piece."""
    w, h = gray.size
    arr = np.array(gray)
    binary = np.where(arr < thresh, 0, 255).astype(np.uint8)

    # pad with white so flood fill always has an exterior foothold
    padded = Image.new('L', (w + 8, h + 8), 255)
    padded.paste(Image.fromarray(binary), (4, 4))

    ImageDraw.floodfill(padded, (0, 0), 128, thresh=10)
    parr = np.array(padded)[4:h + 4, 4:w + 4]

    inside = (parr != 128)  # art itself + anything the art encloses
    return inside


def build_panel(name, gray, close=6):
    w, h = gray.size
    inside = panel_mask(gray)

    alpha = Image.fromarray((inside * 255).astype(np.uint8))
    # close pinholes / tidy the cut edge
    alpha = alpha.filter(ImageFilter.MaxFilter(close | 1))
    alpha = alpha.filter(ImageFilter.MinFilter(close | 1))
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.7))

    # RGB: keep the antialiased grayscale -> black art, white glow
    rgb = gray.point(lambda v: 255 if v > 200 else v)

    out = Image.merge('RGBA', (rgb, rgb, rgb, alpha))

    # a little breathing room so the alpha edge never clips on the texture border
    canvas = Image.new('RGBA', (w + 24, h + 24), (0, 0, 0, 0))
    canvas.paste(out, (12, 12))
    canvas.save(os.path.join(OUT, f'{name}_panel.png'))
    print(f'  {name}_panel.png  {canvas.size}')
    return canvas


def rounded_rect_mask(size, box, radius):
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).rounded_rectangle(box, radius=radius, fill=255)
    return m


def build_window(name, gray, arch=True):
    """Black cylinder wrap with a glowing rounded window + black motif inside."""
    canvas = Image.new('L', (WIN_W, WIN_H), 0)

    # window occupies the front ~44% of the circumference
    wx0, wx1 = int(WIN_W * 0.28), int(WIN_W * 0.72)
    wy0, wy1 = int(WIN_H * 0.10), int(WIN_H * 0.90)
    radius = int((wx1 - wx0) * (0.46 if arch else 0.08))

    win = rounded_rect_mask((WIN_W, WIN_H), (wx0, wy0, wx1, wy1), radius)
    canvas.paste(255, (0, 0), win)

    # fit the motif inside the window with margin
    mw, mh = int((wx1 - wx0) * 0.80), int((wy1 - wy0) * 0.80)
    g = gray.copy()
    g.thumbnail((mw, mh), Image.LANCZOS)

    inside = panel_mask(g)
    art_alpha = Image.fromarray(((np.array(g) < 170) * 255).astype(np.uint8))
    art_alpha = art_alpha.filter(ImageFilter.GaussianBlur(0.5))

    px = wx0 + ((wx1 - wx0) - g.width) // 2
    py = wy0 + ((wy1 - wy0) - g.height) // 2
    canvas.paste(0, (px, py), art_alpha)

    # thin dark inner frame line, like the etched border on the real lamps
    d = ImageDraw.Draw(canvas)
    inset = int((wx1 - wx0) * 0.045)
    d.rounded_rectangle(
        (wx0 + inset, wy0 + inset, wx1 - inset, wy1 - inset),
        radius=max(radius - inset, 4), outline=0, width=max(int(WIN_W * 0.006), 2),
    )

    out = Image.merge('RGB', (canvas, canvas, canvas))
    out.save(os.path.join(OUT, f'{name}_window.png'))
    print(f'  {name}_window.png {out.size}')
    return out


PLATES = {
    'ganesha':   dict(panel=True,  window=True),
    'shiva':     dict(panel=True,  window=True),
    'devi':      dict(panel=False, window=True),
    'ram':       dict(panel=False, window=True),
    'hands':     dict(panel=True,  window=False),
    'floral':    dict(panel=True,  window=True),
    'ballerina': dict(panel=True,  window=False),
    'mother':    dict(panel=True,  window=False),
    'feather':   dict(panel=True,  window=False),
}


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, cfg in PLATES.items():
        src = os.path.join(RAW, f'{name}.png')
        if not os.path.exists(src):
            print(f'! missing {src}')
            continue
        print(f'{name}:')
        gray = load_gray(src)
        if cfg['panel']:
            build_panel(name, gray)
        if cfg['window']:
            build_window(name, gray)


if __name__ == '__main__':
    main()

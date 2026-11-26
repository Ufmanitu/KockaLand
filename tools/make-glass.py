#!/usr/bin/env python3
"""Az üvegablak-lámpák nyomatának kivágása a referencia-fotókból → src/glass-img.js
   python3 tools/make-glass.py <night.jpg> <rose.jpg> <sword.jpg>
   A fotókon az ívelt panel külső (keretes) kontúrja két körívből áll; a kivágás a panel téglalapja, a kontúron kívüli rész feketére maszkolva."""
import sys, io, math, base64, json
from PIL import Image, ImageDraw, ImageFilter

# xl, xr: a panel külső széle; apex: a csúcs y-ja; ys: az ív kezdete (ahol az oldalak elkezdenek hajlani); yb: a panel alja (a keret alsó széle). Mind a fotó pixeleiben.
SPEC = {
    'night': dict(xl=333, xr=745, apex=85, ys=385, yb=847),
    'rose':  dict(xl=320, xr=707, apex=148, ys=420, yb=905),
    'sword': dict(xl=320, xr=783, apex=45, ys=420, yb=988),
}
UP = 1.5      # felskálázás (a GPU így is simítana, de a Lanczos + enyhe élesítés kevésbé maszatos)
INSET = 1.5   # px: a maszk ennyivel a külső élen belül (a háttér-szegély ne szivárogjon be)

def arch_mask(w, h, rise, ys, scale, inset):
    """a panel alakja (0..w, 0..h kivágás-koordinátákban; ys, rise a kivágás tetejétől mérve) szuperszámolt maszk"""
    S = 4
    m = Image.new('L', (int(w * scale * S), int(h * scale * S)), 0)
    d = ImageDraw.Draw(m)
    hw = w / 2.0
    R = (rise * rise + hw * hw) / (2 * hw)
    pts = []
    N = 80
    # bal ív: középpont (R, ys); a (0, ys)-től a csúcsig
    th_end = math.acos((hw - R) / R)
    for i in range(N + 1):
        t = math.pi + (th_end - math.pi) * i / N
        pts.append((R + R * math.cos(t), ys - R * math.sin(t)))
    right = [(w - x, y) for (x, y) in reversed(pts[:-1])]
    poly = [(0, h)] + pts + right + [(w, h)]
    k = scale * S
    d.polygon([(x * k, y * k) for (x, y) in poly], fill=255)
    m = m.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    if inset > 0:   # befelé zsugorítás: min-szűrő
        r = int(round(inset * scale)) * 2 + 1
        m = m.filter(ImageFilter.MinFilter(max(3, r)))
        m = m.filter(ImageFilter.GaussianBlur(0.6))
    return m

def find_stars(crop, limit=22, mind=14):
    """az éjszakai nyomat fényes pontjai (csillagok, hullócsillag-fejek) a felső ~40%-ban → [[u, v], …] (u balról, v fentről, 0..1);
       a 2D/3D csillogás pontosan ezekre ül"""
    import numpy as np
    g = np.asarray(crop.convert('L').filter(ImageFilter.GaussianBlur(1.2))).astype(float)
    h, w = g.shape; win = 11; pts = []
    for y in range(8, int(h * 0.40)):
        for x in range(8, w - 8):
            v = g[y, x]
            if v < 175: continue
            if v >= g[y - win // 2:y + win // 2 + 1, x - win // 2:x + win // 2 + 1].max(): pts.append((v, x, y))
    pts.sort(reverse=True); keep = []
    for v, x, y in pts:
        if all(math.hypot(x - a, y - b) >= mind for _, a, b in keep): keep.append((v, x, y))
        if len(keep) >= limit: break
    return [[round(x / w, 3), round(y / h, 3)] for _, x, y in keep]

def main(paths):
    out = {}
    for name, path in zip(['night', 'rose', 'sword'], paths):
        sp = SPEC[name]
        im = Image.open(path).convert('RGB')
        w, h = sp['xr'] - sp['xl'], sp['yb'] - sp['apex']
        crop = im.crop((sp['xl'], sp['apex'], sp['xr'], sp['yb']))
        big = crop.resize((int(w * UP), int(h * UP)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))
        mask = arch_mask(w, h, sp['ys'] - sp['apex'], sp['ys'] - sp['apex'], UP, INSET)
        # a kontúron kívül: a keret feketéje
        bg = Image.new('RGB', big.size, (8, 8, 9))
        big = Image.composite(big, bg, mask)
        buf = io.BytesIO(); big.save(buf, 'JPEG', quality=88, subsampling=0, optimize=True)
        b = buf.getvalue()
        out[name] = dict(w=w, h=h, rise=sp['ys'] - sp['apex'], iw=big.width, ih=big.height, src='data:image/jpeg;base64,' + base64.b64encode(b).decode(), stars=find_stars(crop) if name == 'night' else None)
        print(name, w, h, big.size, len(b) // 1024, 'KB', file=sys.stderr)
    js = "/* ===== Üvegablak-lámpák: a nyomatok (a referencia-fotókból kivágva, a panel külső kontúrjára maszkolva) – GENERÁLT: tools/make-glass.py ===== */\n'use strict';\n\n"
    js += '/* w,h: a panel mérete a fotó pixeleiben (a 3D modell egysége); rise: az ív magassága az oldalak ívkezdetétől a csúcsig; iw,ih: a kép pixelmérete; stars: a fényes pontok [u balról, v fentről] */\n'
    js += 'const GL_ART = {\n'
    for k, v in out.items():
        js += '  %s: { w: %d, h: %d, rise: %d, iw: %d, ih: %d,%s src: %s },\n' % (k, v['w'], v['h'], v['rise'], v['iw'], v['ih'], (' stars: ' + json.dumps(v['stars']) + ',') if v['stars'] else '', json.dumps(v['src']))
    js += '};\n'
    open('src/glass-img.js', 'w').write(js)

if __name__ == '__main__':
    main(sys.argv[1:4])

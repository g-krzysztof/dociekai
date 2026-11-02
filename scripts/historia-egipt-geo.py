#!/usr/bin/env python3
"""Mapa Egiptu dla L19 (`egipt-dar-nilu`): ląd i Nil z Natural Earth 10m (domena publiczna)
plus siatka zasięgu wylewu do malowania palcem.

Użycie: python3 scripts/historia-egipt-geo.py <katalog z geojson NE 10m> <plik.ts>
Pliki NE: ne_10m_land, ne_10m_rivers_lake_centerlines
(https://github.com/nvkelso/natural-earth-vector/tree/master/geojson) — nie trzymać w repo.

Jeziora celowo pominięte: Jezioro Nasera powstało dopiero po zbudowaniu Wysokiej Tamy (1970).

Zasięg wylewu to PRZYBLIŻENIE: dolina = pas ±8 km wokół koryta Nilu na południe od Kairu
(dolina ma zwykle 5–20 km szerokości), delta = ląd w trójkącie Kair – Aleksandria – Port Said,
Fajum = koło 25 km, oazy = koła 20 km wokół środków (Siwa, Baharija, Farafra, Dachla, Charga).
"""
import json, math, sys

LON0, LON1, LAT0, LAT1 = 25.0, 34.6, 23.6, 31.8
WIDTH = 600.0
K = math.cos(math.radians((LAT0 + LAT1) / 2))
S = WIDTH / ((LON1 - LON0) * K)
HEIGHT = (LAT1 - LAT0) * S
KM_PER_PX = 111.32 / S
CELL = 5.0
COLS = int(math.ceil(WIDTH / CELL))
ROWS = int(math.ceil(HEIGHT / CELL))


def proj(c):
    return ((c[0] - LON0) * K * S, (LAT1 - c[1]) * S)


def inside(pt, poly):
    x, y = pt
    c = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            c = not c
        j = i
    return c


def seg_dist(p, a, b):
    ax, ay = a; bx, by = b; px, py = p
    dx, dy = bx - ax, by - ay
    L = dx * dx + dy * dy
    t = 0 if L == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / L))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


def simplify(pts, tol):
    if len(pts) < 3:
        return pts
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = seg_dist(pts[i], pts[0], pts[-1])
        if d > dmax:
            dmax, idx = d, i
    if dmax > tol:
        return simplify(pts[: idx + 1], tol)[:-1] + simplify(pts[idx:], tol)
    return [pts[0], pts[-1]]


def in_box(c, m=1.5):
    return LON0 - m <= c[0] <= LON1 + m and LAT0 - m <= c[1] <= LAT1 + m


def path(pts, close):
    s = 'M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    return s + ('Z' if close else '')


def clip_poly(pts, m=4.0):
    """Sutherland–Hodgman do prostokąta widoku z marginesem m px."""
    x0, x1, y0, y1 = -m, WIDTH + m, -m, HEIGHT + m

    def clip(pts, inside_fn, inter):
        out = []
        for i in range(len(pts)):
            a, b = pts[i - 1], pts[i]
            if inside_fn(b):
                if not inside_fn(a):
                    out.append(inter(a, b))
                out.append(b)
            elif inside_fn(a):
                out.append(inter(a, b))
        return out

    def ix(x):
        return lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]))

    def iy(y):
        return lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y)

    for inside_fn, inter in [
        (lambda p: p[0] >= x0, ix(x0)), (lambda p: p[0] <= x1, ix(x1)),
        (lambda p: p[1] >= y0, iy(y0)), (lambda p: p[1] <= y1, iy(y1)),
    ]:
        if not pts:
            return []
        pts = clip(pts, inside_fn, inter)
    return pts


ne = sys.argv[1]
land = json.load(open(f'{ne}/ne_10m_land.geojson'))
land_polys = []
for f in land['features']:
    g = f['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for poly in polys:
        ring = poly[0]
        if not any(in_box(c) for c in ring):
            continue
        land_polys.append([proj(c) for c in ring])

rivers = json.load(open(f'{ne}/ne_10m_rivers_lake_centerlines.geojson'))
nile = []
for f in rivers['features']:
    n = f['properties'].get('name') or ''
    if n not in ('Nile', 'Rosetta Branch', 'Damietta Branch'):
        continue
    g = f['geometry']
    lines = g['coordinates'] if g['type'] == 'MultiLineString' else [g['coordinates']]
    for line in lines:
        pts = [proj(c) for c in line if in_box(c, 0.3)]
        if len(pts) > 1:
            nile.append(pts)

CAIRO_LAT = 30.1
valley_segs = []
for line in nile:
    for a, b in zip(line, line[1:]):
        if a[1] >= proj((0, CAIRO_LAT))[1] - 2:
            valley_segs.append((a, b))

delta_tri = [proj((31.25, 30.05)), proj((29.75, 31.3)), proj((32.45, 31.4))]
fayum = proj((30.75, 29.35))
OASES = [
    ('siwa', 'Siwa', (25.52, 29.20)), ('bahrija', 'Baharija', (28.85, 28.35)),
    ('farafra', 'Farafra', (27.97, 27.06)), ('dachla', 'Dachla', (29.0, 25.5)),
    ('charga', 'Charga', (30.55, 25.45)),
]
oases_px = [(oid, name, proj(c)) for oid, name, c in OASES]

# BBoxy wielokątów lądu, żeby siatka liczyła się szybko
land_bb = [(min(x for x, _ in p), max(x for x, _ in p), min(y for _, y in p), max(y for _, y in p), p) for p in land_polys]


def is_land(pt):
    for x0, x1, y0, y1, p in land_bb:
        if x0 <= pt[0] <= x1 and y0 <= pt[1] <= y1 and inside(pt, p):
            return True
    return False


VALLEY_PX = 8 / KM_PER_PX
rows = []
for r in range(ROWS):
    row = []
    for c in range(COLS):
        pt = ((c + 0.5) * CELL, (r + 0.5) * CELL)
        if not is_land(pt):
            # koryto Nilu w dolinie też jest „wodą”, ale na lądzie — zostaje dolina
            row.append('.')
            continue
        ch = 'd'
        if any(seg_dist(pt, a, b) <= VALLEY_PX for a, b in valley_segs):
            ch = 'v'
        elif inside(pt, delta_tri):
            ch = 'D'
        elif math.hypot(pt[0] - fayum[0], pt[1] - fayum[1]) <= 25 / KM_PER_PX:
            ch = 'f'
        else:
            for i, (_, _, o) in enumerate(oases_px):
                if math.hypot(pt[0] - o[0], pt[1] - o[1]) <= 20 / KM_PER_PX:
                    ch = str(i + 1)
        row.append(ch)
    rows.append(''.join(row))

land_paths = [path(simplify(c, 0.5), True) for c in (clip_poly(p) for p in land_polys) if len(c) > 2]
nile_paths = [path(simplify(l, 0.4), False) for l in nile]

PLACES = [
    ('memfis', 'Memfis', (31.25, 29.85)), ('teby', 'Teby', (32.64, 25.70)),
    ('elefantyna', 'Elefantyna', (32.89, 24.09)), ('giza', 'Giza', (31.13, 29.98)),
]


def pt_ts(p):
    return f'{{ x: {p[0]:.1f}, y: {p[1]:.1f} }}'


out = ['// Wygenerowane przez scripts/historia-egipt-geo.py z Natural Earth 10m (domena publiczna). Nie edytuj ręcznie.',
       '// Zasięg wylewu (siatka FLOOD_ROWS) to przybliżenie — opis w nagłówku skryptu.',
       f'export const EG_VIEW = {{ w: {WIDTH:.0f}, h: {HEIGHT:.1f} }};',
       f'export const EG_KM_PER_PX = {KM_PER_PX:.3f};',
       f'export const EG_CELL = {CELL:.0f};',
       f'export const EG_COLS = {COLS};',
       f'export const EG_ROWS = {ROWS};',
       f'export const EG_CAIRO_Y = {proj((0, CAIRO_LAT))[1]:.1f};',
       'export const EG_LAND: string[] = [', *[f"  '{p}'," for p in land_paths], '];',
       'export const EG_NILE: string[] = [', *[f"  '{p}'," for p in nile_paths], '];',
       '/** Komórki: . morze · d pustynia · v dolina · D delta · f Fajum · 1–5 oazy (EG_OASES). */',
       'export const FLOOD_ROWS: string[] = [', *[f"  '{r}'," for r in rows], '];',
       'export const EG_OASES = [',
       *[f"  {{ id: '{oid}', name: '{name}', at: {pt_ts(p)} }}," for oid, name, p in oases_px], '] as const;',
       'export const EG_PLACES = [',
       *[f"  {{ id: '{pid}', name: '{name}', at: {pt_ts(proj(c))} }}," for pid, name, c in PLACES], '] as const;',
       f'export const EG_FAYUM = {pt_ts(fayum)};',
       ]
open(sys.argv[2], 'w').write('\n'.join(out) + '\n')
print('size', WIDTH, HEIGHT, 'grid', COLS, ROWS, 'km/px', KM_PER_PX, 'land polys', len(land_polys), 'nile', len(nile))
from collections import Counter
print(Counter(''.join(rows)))

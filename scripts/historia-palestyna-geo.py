#!/usr/bin/env python3
"""Mapa dla L29 (`judaizm-i-nauczanie-jezusa`): Palestyna za czasów Jezusa — ląd, Jezioro
Galilejskie, Morze Martwe i Jordan z Natural Earth 1:10m (domena publiczna).

Użycie: python3 scripts/historia-palestyna-geo.py <katalog z geojson NE>
Pliki NE: ne_10m_land, ne_10m_lakes, ne_10m_rivers_lake_centerlines
(https://github.com/nvkelso/natural-earth-vector/tree/master/geojson) — nie trzymać w repo.

Miejscowości (współrzędne dzisiejszych miejsc, Wikipedia): Jerozolima 31.7767 N 35.2345 E
(Stare Miasto), Betlejem 31.7054 N 35.2024 E, Nazaret 32.7019 N 35.3033 E,
Kafarnaum 32.8811 N 35.5750 E. Środek kadru zapisany też w układzie mapy MED z L22
(geo-srodziemne.ts), żeby przybliżanie mogło zacząć od całego imperium.
"""
import json, math, os, sys

NE = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'src/app/historia/klasa-4/components/lessons/judaizm-i-nauczanie-jezusa/geo-palestyna.ts')

LON0, LON1, LAT0, LAT1, W = 34.0, 36.4, 31.2, 33.3, 500.0
K = math.cos(math.radians((LAT0 + LAT1) / 2))
S = W / ((LON1 - LON0) * K)
H = (LAT1 - LAT0) * S
KM_PER_PX = 111.2 / S

# Rzut mapy MED (scripts/historia-grecja-geo.py): View(-10, 42, 29, 56), szerokość 600.
M_LON0, M_LON1, M_LAT0, M_LAT1, M_W = -10.0, 42.0, 29.0, 56.0, 600.0
M_K = math.cos(math.radians((M_LAT0 + M_LAT1) / 2))
M_S = M_W / ((M_LON1 - M_LON0) * M_K)


def p(lon, lat):
    return ((lon - LON0) * K * S, (LAT1 - lat) * S)


def mp(lon, lat):
    return ((lon - M_LON0) * M_K * M_S, (M_LAT1 - lat) * M_S)


def load(name):
    return json.load(open(os.path.join(NE, name + '.geojson')))


def clip_box(ring):
    """Sutherland–Hodgman do ramki z zapasem (lon/lat)."""
    box = (LON0 - 0.3, LAT0 - 0.3, LON1 + 0.3, LAT1 + 0.3)
    def clip(pts, inside, inter):
        out = []
        for i in range(len(pts)):
            a, b = pts[i - 1], pts[i]
            if inside(b):
                if not inside(a):
                    out.append(inter(a, b))
                out.append(b)
            elif inside(a):
                out.append(inter(a, b))
        return out
    def ix(x):
        return lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]))
    def iy(y):
        return lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y)
    pts = [tuple(q[:2]) for q in ring]
    for inside, inter in (
        (lambda q: q[0] >= box[0], ix(box[0])),
        (lambda q: q[0] <= box[2], ix(box[2])),
        (lambda q: q[1] >= box[1], iy(box[1])),
        (lambda q: q[1] <= box[3], iy(box[3])),
    ):
        if not pts:
            break
        pts = clip(pts, inside, inter)
    return pts


def rings(geom):
    if geom['type'] == 'Polygon':
        return [geom['coordinates'][0]]
    if geom['type'] == 'MultiPolygon':
        return [poly[0] for poly in geom['coordinates']]
    return []


def path_closed(pts):
    xy = [p(*q) for q in pts]
    return 'M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in xy) + 'Z'


def area_polys(name, pick=None):
    out = []
    for f in load(name)['features']:
        if pick and f['properties'].get('name') != pick:
            continue
        for r in rings(f['geometry']):
            c = clip_box(r)
            if len(c) >= 3:
                out.append(path_closed(c))
    return ''.join(out)


def jordan():
    out = []
    for f in load('ne_10m_rivers_lake_centerlines')['features']:
        if f['properties'].get('name') != 'Jordan':
            continue
        g = f['geometry']
        lines = g['coordinates'] if g['type'] == 'MultiLineString' else [g['coordinates']]
        for line in lines:
            xy = [p(*q[:2]) for q in line if LON0 - 0.3 < q[0] < LON1 + 0.3 and LAT0 - 0.3 < q[1] < LAT1 + 0.3]
            if len(xy) >= 2:
                out.append('M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in xy))
    return ''.join(out)


PLACES = {
    'jerozolima': (35.2345, 31.7767),
    'betlejem': (35.2024, 31.7054),
    'nazaret': (35.3033, 32.7019),
    'kafarnaum': (35.5750, 32.8811),
}

land = area_polys('ne_10m_land')
galilea = area_polys('ne_10m_lakes', 'Sea of Galilee')
martwe = area_polys('ne_10m_lakes', 'Dead Sea')
places = {k: [round(c, 1) for c in p(*v)] for k, v in PLACES.items()}
center = mp((LON0 + LON1) / 2, (LAT0 + LAT1) / 2)
med_w = (LON1 - LON0) * M_K * M_S

with open(OUT, 'w') as f:
    f.write('// Wygenerowane: scripts/historia-palestyna-geo.py — nie edytuj ręcznie.\n')
    f.write('// Ląd, jeziora i Jordan: Natural Earth 1:10m (domena publiczna). Miejscowości: dzisiejsze współrzędne (Wikipedia).\n\n')
    f.write(f'export const PAL_VIEW = {{ w: {W:.1f}, h: {H:.1f} }} as const;\n')
    f.write(f'/** Ile kilometrów to jeden piksel mapy (rzut prostokątny z poprawką cos szerokości). */\n')
    f.write(f'export const PAL_KM_PER_PX = {KM_PER_PX:.4f};\n')
    f.write(f'export const PAL_LAND = {json.dumps(land)};\n')
    f.write(f'export const PAL_GALILEA = {json.dumps(galilea)};\n')
    f.write(f'export const PAL_MARTWE = {json.dumps(martwe)};\n')
    f.write(f'export const PAL_JORDAN = {json.dumps(jordan())};\n')
    f.write(f'/** Prawdziwe położenia miejscowości w pikselach mapy. */\n')
    f.write(f'export const PAL_PLACES: Readonly<Record<string, readonly [number, number]>> = {json.dumps(places)};\n')
    f.write(f'/** Kadr tej mapy na mapie MED (L22): środek i szerokość w pikselach MED. */\n')
    f.write(f'export const PAL_ON_MED = {{ cx: {center[0]:.1f}, cy: {center[1]:.1f}, w: {med_w:.2f} }} as const;\n')
print(OUT, W, H, KM_PER_PX, places)

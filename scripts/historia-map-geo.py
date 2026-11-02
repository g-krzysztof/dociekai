#!/usr/bin/env python3
"""Wycina kontury lądu, rzek i jezior z Natural Earth (domena publiczna) i zapisuje
je jako ścieżki SVG w module TS dla map kursu historii (silnik `hist-map`, L9).

Użycie: python3 scripts/historia-map-geo.py <katalog z geojson NE 10m> <plik.ts>
Inny kadr: GEO_BOX="lon0,lon1,lat0,lat1" GEO_TOL=0.6 (L10: GEO_BOX="7.6,24.6,43.4,54.9" — Włochy → Polska).
Pliki NE: ne_10m_land, ne_10m_lakes, ne_10m_rivers_lake_centerlines, ne_10m_rivers_europe
(https://github.com/nvkelso/natural-earth-vector/tree/master/geojson).

Rzut: prostokątny z poprawką cos(szerokości środkowej) — na obszarze Polski
błąd odległości < 3%, czyli mniej, niż dziecko zmierzy linijką.
"""
import json, math, sys, os

LON0, LON1, LAT0, LAT1 = (
    [float(v) for v in os.environ['GEO_BOX'].split(',')] if os.environ.get('GEO_BOX') else (13.8, 27.0, 48.3, 55.2)
)
WIDTH = 600.0
K = math.cos(math.radians((LAT0 + LAT1) / 2))
S = WIDTH / ((LON1 - LON0) * K)
HEIGHT = (LAT1 - LAT0) * S
TOL = float(os.environ.get('GEO_TOL', 0.6))

RIVERS = {
    'Vistula': 'Wisła', 'Oder': 'Odra', 'Warta': 'Warta', 'Bug': 'Bug', 'Dniester': 'Dniestr',
    'Neman': 'Niemen', 'San': 'San', 'Narew': 'Narew', 'Pilica': 'Pilica', 'Noteć': 'Noteć',
    'Po': 'Pad', 'Danube': 'Dunaj', 'Elbe': 'Łaba', 'Adige': 'Adyga',
}


def proj(c):
    return ((c[0] - LON0) * K * S, (LAT1 - c[1]) * S)


def clip_poly(pts):
    """Sutherland–Hodgman do prostokąta [0,W]×[0,H] (w pikselach)."""
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

    for inside, inter in [
        (lambda p: p[0] >= 0, ix(0)), (lambda p: p[0] <= WIDTH, ix(WIDTH)),
        (lambda p: p[1] >= 0, iy(0)), (lambda p: p[1] <= HEIGHT, iy(HEIGHT)),
    ]:
        if not pts:
            return []
        pts = clip(pts, inside, inter)
    return pts


def inside_box(p, m=0):
    return -m <= p[0] <= WIDTH + m and -m <= p[1] <= HEIGHT + m


def split_line(pts):
    """Linia → kawałki leżące w kadrze (z jednym punktem zapasu na krawędzi)."""
    parts, cur = [], []
    for i, p in enumerate(pts):
        if inside_box(p, 4):
            if not cur and i > 0:
                cur.append(pts[i - 1])
            cur.append(p)
        elif cur:
            cur.append(p)
            parts.append(cur)
            cur = []
    if cur:
        parts.append(cur)
    return [c for c in parts if len(c) > 1]


def dp(pts, tol):
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    n = math.hypot(dx, dy) or 1e-9
    best, idx = -1, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * (pts[i][0] - a[0]) - dx * (pts[i][1] - a[1])) / n if n > 1e-9 else math.hypot(pts[i][0] - a[0], pts[i][1] - a[1])
        if d > best:
            best, idx = d, i
    if best > tol:
        return dp(pts[: idx + 1], tol)[:-1] + dp(pts[idx:], tol)
    return [a, b]


def fmt(pts, close):
    s = 'M' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    return s + ('Z' if close else '')


def polys(geom):
    if geom['type'] == 'Polygon':
        return [geom['coordinates']]
    if geom['type'] == 'MultiPolygon':
        return geom['coordinates']
    return []


def lines(geom):
    if geom['type'] == 'LineString':
        return [geom['coordinates']]
    if geom['type'] == 'MultiLineString':
        return geom['coordinates']
    return []


def area(pts):
    return abs(sum(pts[i - 1][0] * pts[i][1] - pts[i][0] * pts[i - 1][1] for i in range(len(pts)))) / 2


def load(d, name):
    return json.load(open(os.path.join(d, name + '.geojson')))


def main():
    d, out = sys.argv[1], sys.argv[2]
    land = []
    for ft in load(d, 'ne_10m_land')['features']:
        for poly in polys(ft['geometry']):
            ring = clip_poly([proj(c) for c in poly[0]])
            if len(ring) > 2 and area(ring) > 4:
                land.append(fmt(dp(ring + [ring[0]], TOL)[:-1], True))
    lakes = []
    for ft in load(d, 'ne_10m_lakes')['features']:
        for poly in polys(ft['geometry']):
            ring = clip_poly([proj(c) for c in poly[0]])
            if len(ring) > 2 and area(ring) > 6:
                lakes.append(fmt(dp(ring + [ring[0]], TOL)[:-1], True))
    rivers = {}
    for f in ['ne_10m_rivers_lake_centerlines', 'ne_10m_rivers_europe']:
        for ft in load(d, f)['features']:
            name = RIVERS.get(ft['properties'].get('name'))
            if not name or not ft['geometry']:
                continue
            for ln in lines(ft['geometry']):
                for part in split_line([proj(c) for c in ln]):
                    rivers.setdefault(name, []).append(fmt(dp(part, TOL), False))
    with open(out, 'w') as fh:
        fh.write('// WYGENEROWANE przez scripts/historia-map-geo.py — nie edytuj ręcznie.\n')
        fh.write('// Kontury: Natural Earth 1:10m (domena publiczna), https://www.naturalearthdata.com\n\n')
        fh.write(f'export const GEO_VIEW = {{ width: {WIDTH:.0f}, height: {HEIGHT:.1f} }};\n')
        fh.write(f'/** Rzut: x = (lon − {LON0}) · {K * S:.4f}, y = ({LAT1} − lat) · {S:.4f}. */\n')
        fh.write(f'export const GEO_PROJ = {{ lon0: {LON0}, lat1: {LAT1}, kx: {K * S:.4f}, ky: {S:.4f} }};\n')
        fh.write(f'/** Kilometry na piksel (1° szerokości = 111,2 km). */\n')
        fh.write(f'export const KM_PER_PX = {111.2 / S:.4f};\n\n')
        fh.write('export const GEO_LAND: string[] = ' + json.dumps(land) + ';\n\n')
        fh.write('export const GEO_LAKES: string[] = ' + json.dumps(lakes) + ';\n\n')
        fh.write('export const GEO_RIVERS: { name: string; d: string }[] = ' +
                 json.dumps([{'name': k, 'd': ' '.join(v)} for k, v in rivers.items()], ensure_ascii=False) + ';\n')


main()

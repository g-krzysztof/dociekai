#!/usr/bin/env python3
"""Mapy dla L22 (`grecja-gory-i-morze`): Morze Egejskie z siatką terenu i Morze Śródziemne
z dzisiejszymi państwami i greckimi koloniami.

Użycie: python3 scripts/historia-grecja-geo.py <katalog z geojson NE> <katalog wyjściowy>
Pliki NE: ne_10m_land, ne_50m_land, ne_10m_admin_0_countries_pol (domena publiczna,
https://github.com/nvkelso/natural-earth-vector/tree/master/geojson) — nie trzymać w repo.
Wariant `_pol` = granice z punktu widzenia Polski (Krym w Ukrainie).

Wysokości terenu: ETOPO1 (NOAA, domena publiczna) przez publiczne API opentopodata.org,
próbkowane w środku każdej kratki lądu; wynik jest w pliku cache obok danych NE.

Teren kratki: 0 morze · 1 nizina (< 250 m) · 2 wyżyna (250–700 m) · 3 góry (> 700 m) ·
4 przeprawa promem (Dardanele — ląd przerwany cieśniną, w starożytności przeprawiano się łodzią).
"""
import json, math, os, sys, time, urllib.request
from heapq import heappush, heappop

NE, OUT = sys.argv[1], sys.argv[2]


def load(name):
    return json.load(open(os.path.join(NE, name + '.geojson')))


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


def polygons(geom):
    if geom['type'] == 'Polygon':
        return [geom['coordinates']]
    if geom['type'] == 'MultiPolygon':
        return geom['coordinates']
    return []


class View:
    def __init__(s, lon0, lon1, lat0, lat1, width=600.0):
        s.lon0, s.lon1, s.lat0, s.lat1 = lon0, lon1, lat0, lat1
        s.k = math.cos(math.radians((lat0 + lat1) / 2))
        s.s = width / ((lon1 - lon0) * s.k)
        s.w, s.h = width, (lat1 - lat0) * s.s
        s.km = 111.32 / s.s

    def p(s, c):
        return ((c[0] - s.lon0) * s.k * s.s, (s.lat1 - c[1]) * s.s)

    def unp(s, x, y):
        return (s.lon0 + x / (s.k * s.s), s.lat1 - y / s.s)

    def near(s, c, m=2.0):
        return s.lon0 - m <= c[0] <= s.lon1 + m and s.lat0 - m <= c[1] <= s.lat1 + m

    def clip(s, pts, m=4.0):
        x0, x1, y0, y1 = -m, s.w + m, -m, s.h + m

        def cl(pts, ins, inter):
            out = []
            for i in range(len(pts)):
                a, b = pts[i - 1], pts[i]
                if ins(b):
                    if not ins(a):
                        out.append(inter(a, b))
                    out.append(b)
                elif ins(a):
                    out.append(inter(a, b))
            return out

        def ix(xv):
            return lambda a, b: (xv, a[1] + (b[1] - a[1]) * (xv - a[0]) / (b[0] - a[0]))

        def iy(yv):
            return lambda a, b: (a[0] + (b[0] - a[0]) * (yv - a[1]) / (b[1] - a[1]), yv)

        for ins, inter in ((lambda q: q[0] >= x0, ix(x0)), (lambda q: q[0] <= x1, ix(x1)),
                           (lambda q: q[1] >= y0, iy(y0)), (lambda q: q[1] <= y1, iy(y1))):
            if not pts:
                break
            pts = cl(pts, ins, inter)
        return pts


def path(rings):
    return ''.join('M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in r) + 'Z' for r in rings)


def rings_for(view, geoms, tol, min_area):
    out = []
    for g in geoms:
        for poly in polygons(g):
            ring = poly[0]
            if not any(view.near(c) for c in ring):
                continue
            pts = view.clip([view.p(c) for c in ring])
            if len(pts) < 3:
                continue
            pts = simplify(pts + [pts[0]], tol)[:-1]
            if len(pts) < 3:
                continue
            area = abs(sum(pts[i - 1][0] * pts[i][1] - pts[i][0] * pts[i - 1][1] for i in range(len(pts)))) / 2
            if area >= min_area:
                out.append(pts)
    return out


# ───────────── 1. Morze Egejskie ─────────────
A = View(20.0, 29.6, 35.0, 41.6)
CELL = 8.0
COLS, ROWS = int(math.ceil(A.w / CELL)), int(math.ceil(A.h / CELL))
land10 = load('ne_10m_land')
raw_land = []
for f in land10['features']:
    for poly in polygons(f['geometry']):
        if any(A.near(c, 0.5) for c in poly[0]):
            raw_land.append(poly[0])

grid = [[0] * COLS for _ in range(ROWS)]
need = []
for r in range(ROWS):
    for c in range(COLS):
        lon, lat = A.unp((c + 0.5) * CELL, (r + 0.5) * CELL)
        if any(inside((lon, lat), ring) for ring in raw_land):
            need.append((r, c, lat, lon))

cache_f = os.path.join(NE, 'etopo-grecja.json')
cache = json.load(open(cache_f)) if os.path.exists(cache_f) else {}
todo = [n for n in need if f'{n[0]},{n[1]}' not in cache]
for i in range(0, len(todo), 100):
    chunk = todo[i:i + 100]
    locs = '|'.join(f'{lat:.4f},{lon:.4f}' for _, _, lat, lon in chunk)
    with urllib.request.urlopen(f'https://api.opentopodata.org/v1/etopo1?locations={locs}') as resp:
        res = json.load(resp)['results']
    for (r, c, _, _), x in zip(chunk, res):
        cache[f'{r},{c}'] = x['elevation']
    json.dump(cache, open(cache_f, 'w'))
    time.sleep(1.1)

for r, c, _, _ in need:
    e = cache[f'{r},{c}'] or 0
    grid[r][c] = 1 if e < 250 else 2 if e < 700 else 3

# przeprawa przez Dardanele (Sestos – Abydos i okolice)
fa, fb = A.p((26.36, 40.12)), A.p((26.72, 40.42))
for r in range(ROWS):
    for c in range(COLS):
        if grid[r][c] == 0 and seg_dist(((c + 0.5) * CELL, (r + 0.5) * CELL), fa, fb) < 1.2 * CELL:
            grid[r][c] = 4

CITIES = {
    'ateny': ('Ateny', 23.70, 37.96, None),
    'korynt': ('Korynt', 22.88, 37.91, (22.99, 37.88, 'Kenchreje', 0)),
    'sparta': ('Sparta', 22.43, 37.08, (22.57, 36.76, 'Gytejon', 45)),
    'milet': ('Milet', 27.28, 37.53, None),
}

# Najkrótsze drogi (Dijkstra po kratkach) — tylko kontrola, czy liczniki dni są rozsądne.
KMD = {1: 30, 2: 18, 3: 10, 4: 5, 0: 90}


def cell_of(lon, lat):
    x, y = A.p((lon, lat))
    return int(y // CELL), int(x // CELL)


def dijkstra(src, dst, walk, ends):
    dist = {src: 0}
    pq = [(0, src)]
    while pq:
        d, u = heappop(pq)
        if u == dst:
            return d
        if d > dist[u]:
            continue
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                v = (u[0] + dr, u[1] + dc)
                if v == u or not (0 <= v[0] < ROWS and 0 <= v[1] < COLS):
                    continue
                t = grid[v[0]][v[1]]
                ok = (t != 0) if walk else (t == 0 or v in ends)
                if not ok:
                    continue
                tt = t if walk else 0
                km = math.hypot(dr, dc) * CELL * A.km
                nd = d + km / KMD[tt]
                if nd < dist.get(v, 1e9):
                    dist[v] = nd
                    heappush(pq, (nd, v))
    return None


def around(cell, rad=1):
    return {(cell[0] + a, cell[1] + b) for a in range(-rad, rad + 1) for b in range(-rad, rad + 1)}


start = cell_of(23.70, 37.96)
for key, (name, lon, lat, port) in CITIES.items():
    if key == 'ateny':
        continue
    dst = cell_of(lon, lat)
    w = dijkstra(start, dst, True, set())
    pc = cell_of(port[0], port[1]) if port else dst
    s = dijkstra(start, pc, False, around(start) | around(pc, 2))
    extra = (port[3] / KMD[1]) if port else 0
    print(f'{name}: lądem {w and round(w, 1)} dni, morzem {s and round(s + extra, 1)} dni', file=sys.stderr)

land_a = rings_for(A, [f['geometry'] for f in land10['features']], 0.6, 2.0)
rows = [''.join(str(v) for v in row) for row in grid]
city_xy = {k: {'name': v[0], 'xy': [round(a, 1) for a in A.p((v[1], v[2]))],
               **({'port': {'name': v[3][2], 'xy': [round(a, 1) for a in A.p((v[3][0], v[3][1]))], 'km': v[3][3]}} if v[3] else {})}
           for k, v in CITIES.items()}

with open(os.path.join(OUT, 'geo-egejskie.ts'), 'w') as fo:
    fo.write('// Wygenerowane: scripts/historia-grecja-geo.py — nie edytuj ręcznie.\n')
    fo.write('// Ląd: Natural Earth 1:10m (domena publiczna). Teren: ETOPO1 (NOAA, domena publiczna),\n')
    fo.write('// wysokość w środku kratki: 1 nizina < 250 m, 2 wyżyna 250–700 m, 3 góry > 700 m, 0 morze, 4 prom (Dardanele).\n\n')
    fo.write(f'export const AEGEAN_VIEW = {{ w: {A.w:.1f}, h: {A.h:.1f} }} as const;\n')
    fo.write(f'export const AEGEAN_KM_PER_PX = {A.km:.4f};\n')
    fo.write(f'export const TERRAIN_CELL = {CELL};\n')
    fo.write(f'export const TERRAIN_COLS = {COLS};\nexport const TERRAIN_ROWS = {ROWS};\n')
    fo.write('export const TERRAIN: readonly string[] = ' + json.dumps(rows, indent=2) + ';\n\n')
    fo.write(f'export const AEGEAN_LAND = {json.dumps(path(land_a))};\n\n')
    fo.write('export const AEGEAN_CITIES = ' + json.dumps(city_xy, ensure_ascii=False, indent=2) + ' as const;\n')

# ───────────── 2. Morze Śródziemne i Czarne ─────────────
M = View(-10.0, 42.0, 29.0, 56.0)
land50 = load('ne_50m_land')
countries = load('ne_10m_admin_0_countries_pol')

# Daty tradycyjne (założenie wg autorów starożytnych), w przybliżeniu — J. Boardman, „The Greeks Overseas”
# (4. wyd. 1999) i hasła Wikipedii poszczególnych miast. Rok ujemny = p.n.e.
COLONIES = [
    ('kyme', 'Kyme', 14.05, 40.85, -740, 'Chalkida'),
    ('naxos', 'Naksos', 15.27, 37.82, -734, 'Chalkida'),
    ('syrakuzy', 'Syrakuzy', 15.29, 37.07, -733, 'Korynt'),
    ('sybaris', 'Sybaris', 16.49, 39.72, -720, 'Achaja'),
    ('tarent', 'Tarent', 17.24, 40.47, -706, 'Sparta'),
    ('bizancjum', 'Bizancjum', 28.98, 41.01, -667, 'Megara'),
    ('istros', 'Istros', 28.77, 44.55, -657, 'Milet'),
    ('sinope', 'Synopa', 35.15, 42.03, -631, 'Milet'),
    ('kyrena', 'Kyrena', 21.86, 32.82, -631, 'Thera'),
    ('epidamnos', 'Epidamnos', 19.45, 41.32, -627, 'Korkyra i Korynt'),
    ('naukratis', 'Naukratis', 30.61, 30.90, -620, 'miasta jońskie'),
    ('apollonia', 'Apollonia', 27.70, 42.42, -610, 'Milet'),
    ('massalia', 'Massalia', 5.37, 43.30, -600, 'Fokaja'),
    ('pantikapajon', 'Pantikapajon', 36.47, 45.35, -600, 'Milet'),
    ('emporion', 'Emporion', 3.12, 42.13, -575, 'Massalia'),
    ('odessos', 'Odessos', 27.91, 43.20, -575, 'Milet'),
    ('alalia', 'Alalia', 9.51, 42.10, -565, 'Fokaja'),
    ('olbia', 'Olbia', 31.90, 46.69, -550, 'Milet'),
]

cpolys = []
for f in countries['features']:
    p = f['properties']
    rings = [poly[0] for poly in polygons(f['geometry'])]
    if not any(any(M.near(c, 0) for c in r) for r in rings):
        continue
    cpolys.append((p['ADM0_A3'], p.get('NAME_PL') or p['NAME'], rings, f['geometry']))


def country_at(lon, lat):
    for code, name, rings, _ in cpolys:
        if any(inside((lon, lat), r) for r in rings):
            return code
    best, bd = None, 1e9   # punkt na samym brzegu: najbliższe państwo w promieniu ~20 km
    for code, name, rings, _ in cpolys:
        for r in rings:
            for c in r[::2]:
                d = math.hypot((c[0] - lon) * math.cos(math.radians(lat)), c[1] - lat)
                if d < bd:
                    best, bd = code, d
    return best if bd < 0.2 else None


col_out = []
for cid, name, lon, lat, year, mother in COLONIES:
    code = country_at(lon, lat)
    assert code, name
    x, y = M.p((lon, lat))
    col_out.append({'id': cid, 'name': name, 'xy': [round(x, 1), round(y, 1)], 'year': year, 'mother': mother, 'country': code})
    print(f'{name}: {code}', file=sys.stderr)

grc = M.p((23.70, 37.96))
c_out = []
for code, name, rings, geom in cpolys:
    rr = rings_for(M, [geom], 0.5, 1.5)
    if not rr:
        continue
    c_out.append({'id': code, 'name': name, 'd': path(rr)})
land_m = rings_for(M, [f['geometry'] for f in land50['features']], 0.5, 1.5)

with open(os.path.join(OUT, 'geo-srodziemne.ts'), 'w') as fo:
    fo.write('// Wygenerowane: scripts/historia-grecja-geo.py — nie edytuj ręcznie.\n')
    fo.write('// Ląd i państwa: Natural Earth (domena publiczna), granice w wariancie z punktu widzenia Polski.\n')
    fo.write('// Kolonie: daty tradycyjne, w przybliżeniu (J. Boardman, „The Greeks Overseas”, 1999; Wikipedia).\n')
    fo.write('// Państwo kolonii wyliczone przez punkt w wielokącie, nie wpisane ręcznie.\n\n')
    fo.write(f'export const MED_VIEW = {{ w: {M.w:.1f}, h: {M.h:.1f} }} as const;\n')
    fo.write(f'export const MED_ATENY: readonly [number, number] = [{grc[0]:.1f}, {grc[1]:.1f}];\n')
    fo.write(f'export const MED_LAND = {json.dumps(path(land_m))};\n\n')
    fo.write('export const MED_COUNTRIES: readonly { id: string; name: string; d: string }[] = ' + json.dumps(c_out, ensure_ascii=False) + ';\n\n')
    fo.write('export const COLONIES: readonly { id: string; name: string; xy: readonly [number, number]; year: number; mother: string; country: string }[] = '
             + json.dumps(col_out, ensure_ascii=False, indent=2) + ';\n')

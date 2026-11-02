#!/usr/bin/env python3
"""Mapa świata dla L15 (wędrówki ludzi): ląd (ne_50m_land) i głębokie morze
(ne_10m_bathymetry_K_200 — wszystko głębiej niż 200 m) z Natural Earth (domena
publiczna) jako ścieżki SVG. Szelf = to, co nie jest ani lądem, ani głębią: gdy
w epoce lodowej poziom morza spada, szelf staje się lądem (Beringia, Sunda).

Użycie: python3 scripts/historia-world-geo.py <katalog z geojson NE> <plik.ts>
Pliki: https://github.com/nvkelso/natural-earth-vector/tree/master/geojson (nie trzymać w repo).
Rzut prostokątny (równoodległościowy), kadr lon −180…180, lat −56…78, szerokość 1000.
"""
import json, sys, os

LON0, LON1, LAT0, LAT1 = -180.0, 180.0, -56.0, 78.0
W = 1000.0
S = W / (LON1 - LON0)
H = (LAT1 - LAT0) * S


def proj(c):
    x = (c[0] - LON0) * S
    y = (LAT1 - c[1]) * S
    return (min(max(x, 0), W), min(max(y, 0), H))


def dp(pts, tol):
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        L = (dx * dx + dy * dy) ** 0.5 or 1e-9
        best, bi = 0, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs(dy * px - dx * py + bx * ay - by * ax) / L
            if d > best:
                best, bi = d, i
        if best > tol and bi > 0:
            keep[bi] = True
            stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]


def rings(geom):
    if geom['type'] == 'Polygon':
        yield from geom['coordinates']
    elif geom['type'] == 'MultiPolygon':
        for poly in geom['coordinates']:
            yield from poly


def path(fc, tol, min_area):
    out = []
    for f in fc['features']:
        for ring in rings(f['geometry']):
            raw = [proj(c) for c in ring]
            if raw[0] == raw[-1]:
                raw = raw[:-1]
            if len(raw) < 3:
                continue
            # pierścień zamknięty: dzielimy w punkcie najdalszym od startu, inaczej DP nie ma odcinka
            far = max(range(len(raw)), key=lambda i: (raw[i][0] - raw[0][0]) ** 2 + (raw[i][1] - raw[0][1]) ** 2)
            pts = dp(raw[: far + 1], tol)[:-1] + dp(raw[far:] + [raw[0]], tol)[:-1]
            if len(pts) < 4:
                continue
            area = abs(sum(pts[i - 1][0] * pts[i][1] - pts[i][0] * pts[i - 1][1] for i in range(len(pts)))) / 2
            if area < min_area:
                continue
            out.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z')
    return ''.join(out)


src, dst = sys.argv[1], sys.argv[2]
land = json.load(open(os.path.join(src, 'ne_50m_land.geojson')))
deep = json.load(open(os.path.join(src, 'ne_10m_bathymetry_K_200.geojson')))
land_d = path(land, 0.6, 4)
deep_d = path(deep, 0.6, 4)
with open(dst, 'w') as fh:
    fh.write('// Wygenerowane przez scripts/historia-world-geo.py z Natural Earth (domena publiczna). Nie edytować ręcznie.\n')
    fh.write(f'export const WORLD_VIEW = {{ w: {W:.0f}, h: {H:.1f} }};\n')
    fh.write(f'export const WORLD_BOX = {{ lon0: {LON0}, lon1: {LON1}, lat0: {LAT0}, lat1: {LAT1} }};\n')
    fh.write(f'/** Ląd dzisiejszy. */\nexport const WORLD_LAND = {json.dumps(land_d)};\n')
    fh.write(f'/** Morze głębsze niż 200 m — nie odsłania się nawet w epoce lodowej. */\nexport const WORLD_DEEP = {json.dumps(deep_d)};\n')
print(len(land_d), len(deep_d))

#!/usr/bin/env python3
"""Składa kawałki układanki regionów (L12) z konturów województw i zapisuje je
jako ścieżki SVG w rzucie mapy Polski kursu historii (`hist-map/geo-polska.ts`).

Użycie: python3 scripts/historia-regiony-geo.py <wojewodztwa.geojson> <plik.ts>
Wymaga `shapely` (np. w venv: `python3 -m venv v && v/bin/pip install shapely`).
Kontury województw: github.com/ppatrzyk/polska-geojson (`wojewodztwa-min.geojson`,
dane PRG GUGiK, licencja otwarta) — nie trzymać w repo.

Regiony historyczne nie mają urzędowych granic. Kawałki to **przybliżenie**:
sklejone współczesne województwa, które najlepiej pokrywają dany region. Lekcja
mówi o tym dziecku wprost.
"""
import json, sys
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

LON0, LAT1, KX, KY = 13.8, 55.2, 45.4545, 73.4211  # = GEO_PROJ z geo-polska.ts

PIECES = [
    ('pomorze', 'Pomorze', ['zachodniopomorskie', 'pomorskie']),
    ('warmia-mazury', 'Warmia i Mazury', ['warmińsko-mazurskie']),
    ('podlasie', 'Podlasie', ['podlaskie']),
    ('kujawy', 'Kujawy', ['kujawsko-pomorskie']),
    ('ziemia-lubuska', 'Ziemia Lubuska', ['lubuskie']),
    ('wielkopolska', 'Wielkopolska', ['wielkopolskie']),
    ('mazowsze', 'Mazowsze', ['mazowieckie']),
    ('ziemia-lodzka', 'Ziemia Łódzka', ['łódzkie']),
    ('lubelszczyzna', 'Lubelszczyzna', ['lubelskie']),
    ('slask', 'Śląsk', ['dolnośląskie', 'opolskie', 'śląskie']),
    ('malopolska', 'Małopolska', ['małopolskie', 'świętokrzyskie', 'podkarpackie']),
]


def proj(lon, lat):
    return ((lon - LON0) * KX, (LAT1 - lat) * KY)


def main():
    src, out = sys.argv[1], sys.argv[2]
    woj = {f['properties']['nazwa']: shape(f['geometry']) for f in json.load(open(src))['features']}
    from shapely.affinity import affine_transform
    rows = []
    for pid, name, parts in PIECES:
        g = unary_union([woj[p].buffer(0.002) for p in parts]).buffer(-0.002)
        g = affine_transform(g, [KX, 0, 0, -KY, -LON0 * KX, LAT1 * KY]).simplify(0.7)
        polys = [g] if g.geom_type == 'Polygon' else sorted(g.geoms, key=lambda p: -p.area)[:1]
        ring = list(polys[0].exterior.coords)[:-1]
        d = 'M' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in ring) + 'Z'
        c = polys[0].representative_point()
        x0, y0, x1, y1 = polys[0].bounds
        rows.append(
            f"  {{ id: '{pid}', name: '{name}', d: '{d}', label: [{c.x:.1f}, {c.y:.1f}], box: [{x0:.1f}, {y0:.1f}, {x1:.1f}, {y1:.1f}] }},"
        )
    with open(out, 'w') as f:
        f.write('// WYGENEROWANE przez scripts/historia-regiony-geo.py — nie edytuj ręcznie.\n')
        f.write('// Kontury: województwa (PRG GUGiK przez github.com/ppatrzyk/polska-geojson), sklejone w przybliżone regiony.\n\n')
        f.write("export type RegionId =\n" + '\n'.join(f"  | '{p[0]}'" for p in PIECES) + ';\n\n')
        f.write('export interface RegionShape {\n  id: RegionId;\n  name: string;\n  /** Ścieżka w układzie `GEO_VIEW` (600 × 506,6). */\n  d: string;\n  /** Punkt na podpis (na pewno wewnątrz kształtu). */\n  label: readonly [number, number];\n  /** x0, y0, x1, y1 */\n  box: readonly [number, number, number, number];\n}\n\n')
        f.write('export const REGION_SHAPES: RegionShape[] = [\n' + '\n'.join(rows) + '\n];\n')


main()

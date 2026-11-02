#!/usr/bin/env python3
"""Mapa dla L26 (`od-wioski-do-imperium`): zasięg państwa rzymskiego w ośmiu chwilach
od 500 p.n.e. do 395 n.e., na mapie Morza Śródziemnego z L22 (geo-srodziemne.ts).

Użycie: python3 scripts/historia-rzym-geo.py

Granice są **przybliżone i zgrubne**: każdy obszar to kilkupunktowy wielokąt w lon/lat,
który może wychodzić w morze — na ekranie przycina go kontur lądu (clipPath z MED_LAND),
więc wybrzeża są dokładne, a granice lądowe tylko orientacyjne. Przebiegi wg map
w: R. Talbert (red.), „Barrington Atlas of the Greek and Roman World”, 2000, oraz
Wikipedia („Roman Republic”, „Roman Empire”, artykuły o prowincjach) — daty przyłączeń
w komentarzach przy obszarach.

Wynik: src/app/historia/klasa-4/components/lessons/od-wioski-do-imperium/geo-imperium.ts
— ścieżki obszarów w pikselach mapy, etapy (rok → obszary), względny zasięg etapu
(liczony próbkowaniem lądu) i udział każdego dzisiejszego państwa w imperium z 117 r.
(próbkowanie jego wielokąta) — klasy liczone, nie wpisywane ręcznie.
"""
import json, math, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src/app/historia/klasa-4/components/lessons/grecja-gory-i-morze/geo-srodziemne.ts')
OUT = os.path.join(ROOT, 'src/app/historia/klasa-4/components/lessons/od-wioski-do-imperium/geo-imperium.ts')

# Ten sam rzut co MED w scripts/historia-grecja-geo.py: View(-10, 42, 29, 56), szerokość 600.
LON0, LON1, LAT0, LAT1, W = -10.0, 42.0, 29.0, 56.0, 600.0
K = math.cos(math.radians((LAT0 + LAT1) / 2))
S = W / ((LON1 - LON0) * K)
H = (LAT1 - LAT0) * S


def p(lon, lat):
    return ((lon - LON0) * K * S, (LAT1 - lat) * S)


def lat_of(y):
    return LAT1 - y / S


# --- obszary (lon, lat), zgrubnie; morze przytnie kontur lądu -------------------------------
REGIONS = {
    'latium': [(11.8, 42.4), (13.3, 42.3), (13.5, 41.4), (12.9, 41.2), (11.8, 41.6)],
    # Italia na południe od linii Arno–Rubikon, przed 264 p.n.e.
    'italia': [(9.95, 43.95), (11.2, 44.05), (12.45, 44.15), (13.6, 44.2), (15.2, 42.6), (17.5, 41.7), (18.7, 40.3),
               (18.6, 39.6), (17.3, 38.6), (16.3, 37.8), (15.72, 38.2), (15.3, 38.9), (12.0, 40.6), (10.0, 42.0)],
    # Galia Przedalpejska, 222–191 p.n.e.
    'italia_n': [(6.6, 45.0), (7.0, 46.2), (9.0, 46.5), (12.5, 46.6), (13.8, 45.7), (13.6, 44.2), (12.45, 44.15),
                 (11.2, 44.05), (9.95, 43.95), (8.0, 43.7), (7.5, 43.8)],
    'sycylia': [(12.2, 38.3), (15.6, 38.35), (15.4, 36.5), (12.2, 37.4)],  # 241 p.n.e.
    'sardkors': [(8.0, 39.0), (9.9, 39.0), (9.7, 43.1), (8.4, 43.1)],  # 238 p.n.e.
    'hisp_e': [(-9.5, 36.9), (-5.6, 35.95), (-1.0, 36.5), (3.5, 39.5), (3.5, 42.4), (1.0, 42.5), (-1.5, 42.0),
               (-4.5, 40.5), (-7.0, 39.0), (-8.0, 38.0)],  # 218–133 p.n.e.
    'hisp_all': [(-10.0, 36.5), (-5.6, 35.95), (-1.0, 36.5), (3.5, 39.0), (3.6, 42.6), (-2.0, 43.6), (-10.0, 44.0)],  # 19 p.n.e.
    'africa': [(8.2, 37.1), (11.2, 37.4), (11.2, 35.0), (9.5, 35.0), (8.3, 36.0)],  # Kartagina, 146 p.n.e.
    'macgr': [(19.2, 42.2), (23.5, 42.0), (24.5, 41.0), (26.3, 40.9), (26.3, 36.1), (20.0, 36.1), (19.0, 40.0)],  # 148–146 p.n.e.
    'asia': [(26.0, 40.9), (29.5, 41.0), (30.5, 40.0), (30.5, 37.0), (28.0, 36.4), (26.0, 37.5)],  # 133 p.n.e.
    'ilirikum': [(13.6, 45.6), (15.5, 45.0), (19.5, 42.0), (19.0, 41.8), (15.0, 43.5), (13.6, 44.8)],  # wybrzeże, II–I w. p.n.e.
    'gallia': [(-5.0, 48.6), (-1.6, 43.3), (3.2, 42.4), (7.5, 43.8), (6.6, 45.0), (7.0, 46.2), (8.6, 46.6), (9.6, 47.6),
               (7.6, 47.6), (8.3, 49.0),
               (8.3, 50.0), (7.6, 50.4), (7.0, 50.9), (6.5, 51.7), (4.4, 52.1), (1.5, 51.2), (-5.5, 49.5)],  # 121–51 p.n.e.
    'syria': [(35.5, 37.0), (38.5, 36.8), (38.5, 33.0), (35.8, 33.0), (34.8, 33.2), (35.5, 36.0)],  # 64 p.n.e.
    'pontus': [(29.5, 41.2), (41.5, 41.6), (39.0, 40.3), (31.0, 40.3), (29.5, 40.5)],  # 74–63 p.n.e.
    'cylicja': [(30.5, 37.2), (30.5, 36.2), (36.2, 36.0), (36.3, 37.1), (33.0, 37.5)],
    'cypr': [(32.2, 34.5), (34.7, 34.5), (34.7, 35.8), (32.2, 35.3)],  # 58 p.n.e.
    'cyrena': [(19.6, 31.0), (25.2, 31.4), (25.2, 33.2), (19.6, 32.6)],  # 74 p.n.e.
    'kreta': [(23.4, 34.8), (26.4, 34.8), (26.4, 35.8), (23.4, 35.8)],  # 67 p.n.e.
    'numidia': [(5.5, 36.9), (8.3, 37.1), (8.3, 35.3), (5.5, 35.6)],  # 46 p.n.e.
    'egipt': [(25.0, 31.6), (32.5, 31.6), (32.6, 30.0), (32.5, 24.0), (31.2, 24.0), (30.6, 29.5), (29.5, 30.4), (25.0, 31.0)],  # 30 p.n.e.
    'dalmacja': [(13.6, 45.6), (15.5, 45.0), (19.0, 44.9), (19.6, 44.3), (20.5, 43.0), (20.0, 42.2), (19.0, 41.8),
                 (15.0, 43.5)],  # Dalmacja, 9 n.e.
    'malta': [(14.0, 35.7), (14.7, 35.7), (14.7, 36.15), (14.0, 36.15)],  # 218 p.n.e.
    'judea': [(34.2, 31.2), (35.6, 31.2), (35.7, 33.2), (34.8, 33.2)],  # 6 n.e.
    'galacja': [(31.0, 40.3), (35.0, 40.5), (35.0, 38.0), (30.5, 38.0)],  # 25 p.n.e.
    'alpy': [(7.0, 46.2), (9.5, 47.6), (12.0, 48.6), (16.5, 48.2), (16.0, 46.5), (13.8, 45.7), (12.5, 46.6), (9.0, 46.5)],  # 15 p.n.e.
    'pannonia': [(16.5, 48.2), (18.9, 47.8), (18.9, 45.8), (20.5, 44.8), (19.0, 44.3), (15.5, 45.0), (13.8, 45.7), (16.0, 46.5)],  # 9 n.e.
    'mezja': [(20.5, 44.8), (22.5, 44.6), (22.9, 43.8), (25.5, 43.65), (28.0, 44.1), (29.7, 45.2), (29.7, 44.0), (28.0, 43.0),
              (23.5, 42.0), (19.2, 42.2), (19.5, 42.0), (19.0, 44.3)],  # 6 n.e.
    'brytania': [(-6.0, 50.0), (1.8, 51.0), (1.8, 53.0), (-1.5, 55.1), (-3.0, 55.1), (-3.6, 54.6), (-3.3, 54.0), (-4.8, 53.5),
                 (-5.5, 51.5)],  # 43–84 n.e.
    'dacja': [(21.0, 46.5), (22.2, 47.6), (24.5, 47.8), (26.0, 46.5), (25.2, 45.4), (24.5, 44.5), (22.5, 44.6), (21.3, 45.0)],  # 106 n.e.
    'mauretania': [(-7.0, 33.8), (-6.4, 35.9), (-1.0, 35.9), (5.5, 36.9), (5.5, 35.6), (1.0, 35.2), (-2.0, 34.6), (-6.0, 33.4)],  # 40 n.e.
    'tracja': [(22.9, 42.6), (26.3, 42.4), (28.2, 42.0), (29.2, 41.2), (26.3, 40.6), (23.5, 41.5)],  # 46 n.e.
    'kapadocja': [(35.0, 40.5), (41.8, 41.6), (42.0, 38.0), (38.5, 37.0), (35.0, 38.0)],  # 17 n.e.
    'arabia': [(34.2, 31.2), (35.6, 31.2), (37.0, 32.6), (38.0, 31.5), (37.0, 29.0), (34.9, 29.0), (32.6, 30.0)],  # 106 n.e.
    'mezopotamia': [(38.5, 36.8), (42.0, 37.5), (42.0, 33.0), (38.5, 33.0)],  # 116 n.e., na krótko
    'agri': [(7.6, 47.6), (9.5, 47.6), (10.5, 48.8), (9.6, 49.5), (8.8, 50.4), (8.3, 50.0), (8.3, 49.0)],  # ok. 74–85 n.e.
}

R_133 = ['italia', 'italia_n', 'sycylia', 'malta', 'sardkors', 'hisp_e', 'africa', 'macgr', 'asia']
R_44 = R_133 + ['ilirikum', 'gallia', 'syria', 'pontus', 'cylicja', 'cypr', 'cyrena', 'kreta', 'numidia']
R_14 = R_44 + ['hisp_all', 'dalmacja', 'egipt', 'judea', 'galacja', 'alpy', 'pannonia', 'mezja']
R_117 = R_14 + ['brytania', 'dacja', 'mauretania', 'tracja', 'kapadocja', 'arabia', 'mezopotamia', 'agri']
R_271 = [r for r in R_117 if r not in ('dacja', 'agri', 'mezopotamia')]

STAGES = [
    (-500, 'Rzym to jedno miasto nad Tybrem z okolicą.', ['latium']),
    (-264, 'Rzym rządzi całą Italią — zaczynają się wojny z Kartaginą.', ['italia']),
    (-133, 'Po wojnach z Kartaginą: Sycylia, Hiszpania, Afryka, Grecja.', R_133),
    (-44, 'Śmierć Cezara: Galia, Syria i wybrzeża Afryki są rzymskie.', R_44),
    (14, 'Śmierć Augusta, pierwszego cesarza: Egipt i Bałkany aż do Dunaju.', R_14),
    (117, 'Cesarz Trajan: Brytania, Dacja, Arabia, Mezopotamia.', R_117),
    (271, 'Rzym oddaje Dację i ziemie za Renem.', R_271),
    (395, 'Cesarstwo dzieli się na zachodnie i wschodnie.', R_271),
]

# Granica podziału z 395 r.: zgrubnie po południku ok. 19,2° (Drina na Bałkanach,
# zatoka Wielka Syrta w Afryce).
SPLIT_LON = 19.2


def inside(pt, ring):
    x, y = pt
    c = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            c = not c
        j = i
    return c


def parse_path(d):
    rings = []
    for part in re.split(r'Z', d):
        pts = re.findall(r'[ML](-?[\d.]+),(-?[\d.]+)', part)
        if len(pts) >= 3:
            rings.append([(float(a), float(b)) for a, b in pts])
    return rings


def bbox(rings):
    xs = [x for r in rings for x, _ in r]
    ys = [y for r in rings for _, y in r]
    return min(xs), min(ys), max(xs), max(ys)


src = open(SRC, encoding='utf-8').read()
land = parse_path(json.loads(re.search(r'export const MED_LAND = (".*?");', src).group(1)))
countries = json.loads(re.search(r'export const MED_COUNTRIES[^=]*= (\[.*?\]);\n', src, re.S).group(1))

px_regions = {rid: [p(lon, lat) for lon, lat in ring] for rid, ring in REGIONS.items()}
land_boxes = [(r, bbox([r])) for r in land]


def in_land(pt):
    x, y = pt
    return any(b[0] <= x <= b[2] and b[1] <= y <= b[3] and inside(pt, r) for r, b in land_boxes)


def in_regions(pt, ids):
    return any(inside(pt, px_regions[i]) for i in ids)


# Zasięg etapu: próbki lądu co 2 px, ważone powierzchnią (cos szerokości).
STEP = 2.0
land_pts = []
y = STEP / 2
while y < H:
    x = STEP / 2
    while x < W:
        if in_land((x, y)):
            land_pts.append((x, y, math.cos(math.radians(lat_of(y)))))
        x += STEP
    y += STEP
km2_per_px2 = (111.32 / S) ** 2 / K  # px w poziomie = 1/(K*S) stopnia długości
stage_out = []
for year, label, ids in STAGES:
    area = sum(w for x, y, w in land_pts if in_regions((x, y), ids)) * STEP * STEP * km2_per_px2
    stage_out.append({'year': year, 'label': label, 'regions': ids, 'km2': round(area / 1000) * 1000})

# Udział dzisiejszych państw w imperium z 117 r.
SKIP = {'ESB', 'WSB', 'JEY', 'IMN'}
shares = {}
for c in countries:
    if c['id'] in SKIP:
        continue
    rings = parse_path(c['d'])
    x0, y0, x1, y1 = bbox(rings)
    span = max(x1 - x0, y1 - y0)
    step = 1.0 if span > 40 else 0.25
    tot = hit = 0
    yy = y0 + step / 2
    while yy < y1:
        xx = x0 + step / 2
        while xx < x1:
            if any(inside((xx, yy), r) for r in rings):
                tot += 1
                if in_regions((xx, yy), R_117):
                    hit += 1
            xx += step
        yy += step
    if tot:
        shares[c['id']] = round(hit / tot, 2)


def path(ring):
    return 'M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in ring) + 'Z'


os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as fo:
    fo.write('// Wygenerowane: scripts/historia-rzym-geo.py — nie edytuj ręcznie.\n')
    fo.write('// Granice przybliżone i zgrubne (przycinane konturem lądu z geo-srodziemne.ts); źródła w skrypcie.\n')
    fo.write('// km2 i udziały państw liczone próbkowaniem mapy w rzucie MED — tylko do porównań między etapami.\n\n')
    fo.write('export const IMPERIUM_REGIONS: Readonly<Record<string, string>> = ' +
             json.dumps({k: path(v) for k, v in px_regions.items()}) + ';\n\n')
    fo.write('export const IMPERIUM_STAGES: readonly { year: number; label: string; regions: readonly string[]; km2: number }[] = ' +
             json.dumps(stage_out, ensure_ascii=False) + ';\n\n')
    fo.write(f'/** Południk podziału z 395 r. w pikselach mapy. */\nexport const SPLIT_X = {p(SPLIT_LON, 40)[0]:.1f};\n\n')
    fo.write('/** Udział powierzchni dzisiejszego państwa (z MED_COUNTRIES) w imperium z 117 r. */\n')
    fo.write('export const SHARE_117: Readonly<Record<string, number>> = ' + json.dumps(shares) + ';\n')
print('etapy:', [(s['year'], s['km2']) for s in stage_out])
print('udziały:', sorted(shares.items(), key=lambda kv: -kv[1]))

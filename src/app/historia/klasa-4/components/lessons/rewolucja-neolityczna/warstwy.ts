/**
 * Gdzie mogło się zacząć? (L16, blok 2) — czysta logika warstw. Każda
 * warstwa to obszar w lon/lat, zamieniany na siatkę kratek co 0,5°. Rolnictwo
 * mogło się zacząć tam, gdzie są naraz: dzikie zboża, dzikie kozy i owce
 * oraz woda — z deszczu albo z rzeki. Przecięcie zapala Żyzny Półksiężyc.
 *
 * Obszary są celowo przybliżone (rysowane ręcznie na podstawie map
 * zasięgu dzikiej pszenicy i jęczmienia, kozy bezoarowej i muflona oraz
 * granicy rolnictwa bez nawadniania ok. 250 mm opadu rocznie — Wikipedia
 * „Fertile Crescent”, „Neolithic founder crops”). Errata kursu: Półksiężyc
 * to Tygrys i Eufrat z Lewantem; dolina Nilu to obszar sąsiedni i podobny —
 * tu nie zapala się, bo nie rosły tam dzikie zboża.
 */

export type LonLat = [number, number];
export type LayerId = 'deszcz' | 'rzeki' | 'zboza' | 'zwierzeta';

export const BOX = { lon0: 24, lon1: 62, lat0: 14, lat1: 44 };
export const STEP = 0.5;

export interface Layer {
  id: LayerId;
  name: string;
  hint: string;
  color: string;
}

export const LAYERS: Layer[] = [
  { id: 'deszcz', name: 'Deszcz', hint: 'Tu pada dość, żeby zboże rosło bez podlewania.', color: '#3b82f6' },
  { id: 'rzeki', name: 'Rzeki', hint: 'Woda z rzeki — można nosić ją na pole.', color: '#0891b2' },
  { id: 'zboza', name: 'Dzikie zboża', hint: 'Tu rosły dzikie pszenica i jęczmień.', color: '#ca8a04' },
  { id: 'zwierzeta', name: 'Dzikie kozy i owce', hint: 'Tu żyły zwierzęta, które dało się oswoić.', color: '#9a3412' },
];

export const RAIN: LonLat[] = [
  [33.8, 31.2], [34.6, 32.6], [35.4, 33.8], [35.9, 35.6], [36.6, 36.6], [38, 37.2], [40.5, 37.4], [42.6, 37.2],
  [44.4, 36], [45.8, 34.6], [47.4, 33.2], [49, 31.6], [51, 30.2], [53.5, 29.2], [56, 28.4], [57.6, 30.4],
  [56.4, 33.6], [54, 36.6], [50, 38], [46.2, 39.2], [44, 41.2], [40, 41.6], [35.6, 42.2], [30, 41.6],
  [26.2, 40.4], [26.2, 37.2], [28.4, 36.4], [32, 36.2], [34.2, 35.8], [35.2, 34.6], [34.6, 33.2],
];

export const GRAIN: LonLat[] = [
  [34.8, 31.0], [35.3, 32.4], [35.9, 34.2], [36.4, 35.9], [37.6, 37.4], [39.6, 38.3], [42.2, 38.1], [44.2, 37.2],
  [45.7, 35.6], [47.2, 34.1], [48.4, 32.7], [47.5, 32.1], [45.8, 33.4], [44, 35], [42, 36.2], [39.6, 36.3],
  [37.6, 35.6], [36.6, 34.2], [35.8, 32.6], [35.4, 31.0],
];

export const ANIMALS: LonLat[] = [
  [34.6, 30.8], [35.2, 33], [35.6, 35.4], [33, 36.4], [29.6, 36.8], [29.6, 38.6], [33, 39.2], [37, 39.6],
  [41, 40.6], [45, 40.2], [48.4, 38.6], [53, 37.2], [57.2, 35.2], [59.2, 31.2], [57, 28], [53, 28.8],
  [50, 30.2], [47.4, 31.8], [45.2, 33.2], [43.2, 34.8], [41.4, 35.6], [39.2, 35.6], [37.4, 34.6], [36.6, 33],
  [36, 30.8],
];

/** Rzeki jako linie (lon, lat): Eufrat, Tygrys, Szatt al-Arab, Jordan, Nil. */
export const RIVERS: { name: string; line: LonLat[] }[] = [
  { name: 'Eufrat', line: [[38.5, 39.5], [38.6, 37.5], [38.3, 36.6], [40, 35.3], [41.2, 34.4], [42.4, 33.8], [44, 32.4], [45.7, 31.2], [47, 31], [48, 30.4]] },
  { name: 'Tygrys', line: [[40.2, 38.2], [42.2, 37.3], [43.1, 36.3], [43.6, 34.8], [44.4, 33.3], [45.6, 32.5], [46.8, 31.6], [47.4, 31], [48, 30.4], [48.6, 29.9]] },
  { name: 'Jordan', line: [[35.6, 33.2], [35.55, 32.4], [35.55, 31.8]] },
  { name: 'Nil', line: [[32.5, 15.6], [33.5, 18], [32, 20], [31, 22], [32.9, 24.1], [32.6, 25.7], [31.2, 27.2], [30.8, 29.5], [31.2, 30.1], [31, 31.5]] },
];

/** Jak daleko od rzeki (w stopniach) da się jeszcze nosić wodę na pole. */
export const RIVER_REACH = 0.6;

export function pointInPolygon([x, y]: LonLat, poly: LonLat[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function distToSegment([px, py]: LonLat, [ax, ay]: LonLat, [bx, by]: LonLat): number {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export function nearRiver(p: LonLat): boolean {
  return RIVERS.some((r) => r.line.some((a, i) => i > 0 && distToSegment(p, r.line[i - 1], a) <= RIVER_REACH));
}

export function inLayer(id: LayerId, p: LonLat): boolean {
  switch (id) {
    case 'deszcz':
      return pointInPolygon(p, RAIN);
    case 'rzeki':
      return nearRiver(p);
    case 'zboza':
      return pointInPolygon(p, GRAIN);
    case 'zwierzeta':
      return pointInPolygon(p, ANIMALS);
  }
}

/** Rolnictwo mogło się zacząć: zboża + zwierzęta + woda (deszcz albo rzeka). */
export function isCradle(p: LonLat): boolean {
  return inLayer('zboza', p) && inLayer('zwierzeta', p) && (inLayer('deszcz', p) || inLayer('rzeki', p));
}

export interface Cell {
  lon: number;
  lat: number;
  layers: LayerId[];
  cradle: boolean;
}

/** Siatka kratek (środki co `STEP`) z warstwami, które je pokrywają. */
export function buildGrid(): Cell[] {
  const cells: Cell[] = [];
  for (let lat = BOX.lat0 + STEP / 2; lat < BOX.lat1; lat += STEP) {
    for (let lon = BOX.lon0 + STEP / 2; lon < BOX.lon1; lon += STEP) {
      const p: LonLat = [lon, lat];
      const layers = LAYERS.map((l) => l.id).filter((id) => inLayer(id, p));
      if (layers.length) cells.push({ lon, lat, layers, cradle: isCradle(p) });
    }
  }
  return cells;
}

/** Werdykt dla miejsca, w którym dziecko postawiło wioskę przed nałożeniem warstw. */
export function judgeVillage(p: LonLat): { ok: boolean; missing: LayerId[] } {
  const missing: LayerId[] = [];
  if (!inLayer('zboza', p)) missing.push('zboza');
  if (!inLayer('zwierzeta', p)) missing.push('zwierzeta');
  if (!inLayer('deszcz', p) && !inLayer('rzeki', p)) missing.push('deszcz');
  return { ok: missing.length === 0, missing };
}

/** Jerycho i Çatalhöyük — pierwsze duże osady (baza F-III.1-21, F-III.1-22). */
export const SITES: { id: string; name: string; at: LonLat }[] = [
  { id: 'jerycho', name: 'Jerycho', at: [35.44, 31.87] },
  { id: 'catal', name: 'Çatalhöyük', at: [32.83, 37.67] },
];

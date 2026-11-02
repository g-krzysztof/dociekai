import {
  AEGEAN_CITIES,
  AEGEAN_KM_PER_PX,
  AEGEAN_LAND,
  AEGEAN_VIEW,
  TERRAIN,
  TERRAIN_CELL,
  TERRAIN_COLS,
  TERRAIN_ROWS,
} from './geo-egejskie';

/**
 * Czysta logika bloku 1 — **Z Aten do…**. Wędrowiec albo statek idzie za palcem
 * z prędkością zależną od terenu pod nim; licznik dni rośnie o przebyte km
 * podzielone przez dzienny marsz w tym terenie.
 *
 * Tempo dzienne to rzędy wielkości, nie pomiar: piechur 30 km po równinie
 * (tak liczy ORBIS, Stanford Geospatial Network Model of the Roman World, dla
 * marszu pieszego), wolniej po wyżynach i górskich ścieżkach; statek kupiecki
 * pod żaglem ok. 70 km na dzień żeglugi (ok. 4 węzły przez dzień, nocą stawano
 * przy brzegu).
 */

export type Mode = 'pieszo' | 'statek';
export type CityId = 'korynt' | 'sparta' | 'milet';
/** 0 morze · 1 nizina · 2 wyżyna · 3 góry · 4 prom */
export type Terrain = 0 | 1 | 2 | 3 | 4;

export const KM_PER_DAY: Record<Terrain, number> = { 0: 70, 1: 30, 2: 18, 3: 10, 4: 5 };
export const TERRAIN_NAME: Record<Terrain, string> = {
  0: 'morze',
  1: 'nizina',
  2: 'wyżyna',
  3: 'góry',
  4: 'przeprawa łodzią',
};
/** Prędkość na ekranie: px mapy na sekundę za każdy km dziennego marszu. */
export const PX_PER_S_PER_KMD = 2.4;
/** Promień „dotarłeś” i strefy portu, w której statek może stać przy lądzie. */
export const ARRIVE_R = 12;
export const START = AEGEAN_CITIES.ateny.xy as readonly [number, number];

export interface Dest {
  id: CityId;
  name: string;
  xy: readonly [number, number];
  /** Gdzie zawija statek (dla Koryntu — Kenchreje, dla Sparty — Gytejon). */
  port: { name: string; xy: readonly [number, number]; km: number } | null;
}

export const DESTS: Dest[] = (['korynt', 'sparta', 'milet'] as const).map((id) => {
  const c = AEGEAN_CITIES[id] as { name: string; xy: readonly [number, number]; port?: { name: string; xy: readonly [number, number]; km: number } };
  return { id, name: c.name, xy: c.xy, port: c.port ?? null };
});

// ── ląd z rysunku mapy: ten sam kształt, który dziecko widzi ──
type Ring = { pts: [number, number][]; x0: number; x1: number; y0: number; y1: number };

function parseRings(d: string): Ring[] {
  return d
    .split('M')
    .filter(Boolean)
    .map((part) => {
      const pts = part
        .replace('Z', '')
        .split('L')
        .map((p) => p.split(',').map(Number) as [number, number]);
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      return { pts, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    });
}

const RINGS = parseRings(AEGEAN_LAND);

function inRing(x: number, y: number, r: Ring) {
  if (x < r.x0 || x > r.x1 || y < r.y0 || y > r.y1) return false;
  let c = false;
  const p = r.pts;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i];
    const [xj, yj] = p[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

export function isLand(x: number, y: number) {
  return RINGS.some((r) => inRing(x, y, r));
}

export function gridAt(x: number, y: number): Terrain {
  const c = Math.floor(x / TERRAIN_CELL);
  const r = Math.floor(y / TERRAIN_CELL);
  if (r < 0 || c < 0 || r >= TERRAIN_ROWS || c >= TERRAIN_COLS) return 0;
  return Number(TERRAIN[r][c]) as Terrain;
}

/** Teren pod punktem: kształt lądu z rysunku, wysokość z siatki ETOPO1. */
export function terrainAt(x: number, y: number): Terrain {
  const g = gridAt(x, y);
  if (g === 4) return 4;
  if (!isLand(x, y)) return 0;
  return g === 0 ? 1 : g;
}

function near(x: number, y: number, p: readonly [number, number], r = ARRIVE_R) {
  return Math.hypot(x - p[0], y - p[1]) <= r;
}

/** Czy wolno stanąć w tym punkcie. Statek może dotknąć lądu tylko w porcie startu i celu. */
export function canStand(x: number, y: number, mode: Mode, dest: Dest): boolean {
  if (x < 0 || y < 0 || x > AEGEAN_VIEW.w || y > AEGEAN_VIEW.h) return false;
  const t = terrainAt(x, y);
  if (mode === 'pieszo') return t !== 0;
  if (t === 0 || t === 4) return true;
  return near(x, y, START, ARRIVE_R * 1.5) || near(x, y, (dest.port ?? dest).xy, ARRIVE_R * 1.5);
}

const SLIDE_TURNS = [25, 50, 70, 90, 120, 150];

export interface StepResult {
  x: number;
  y: number;
  days: number;
  terrain: Terrain;
  /** Palec ciągnie w miejsce, gdzie nie wolno (statek na ląd, piechur w morze). */
  blocked: boolean;
  /** Strona ślizgu (1 / -1), którą warto próbować w następnym kroku — inaczej żeton drga w miejscu w zatoczce. */
  side: 1 | -1;
}

/**
 * Jeden krok animacji: ruch w stronę palca z prędkością terenu. Gdy prosty ruch
 * jest zabroniony, skręca coraz bardziej w bok (statek sunie wzdłuż brzegu, piechur wzdłuż wody).
 */
export function step(
  pos: { x: number; y: number },
  target: { x: number; y: number },
  dt: number,
  mode: Mode,
  dest: Dest,
  side: 1 | -1 = 1
): StepResult {
  const t0 = terrainAt(pos.x, pos.y);
  const here: Terrain = mode === 'statek' && t0 !== 4 ? 0 : t0 === 0 ? 1 : t0;
  const dx = target.x - pos.x;
  const dy = target.y - pos.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.5) return { ...pos, days: 0, terrain: here, blocked: false, side };
  const max = Math.min(dist, KM_PER_DAY[here] * PX_PER_S_PER_KMD * dt);
  const base = Math.atan2(dy, dx);
  // prosto do palca, a gdy nie wolno — coraz bardziej w bok (ślizg wzdłuż brzegu),
  // najpierw w stronę, w którą żeton ślizgał się ostatnio
  const turns: [number, 1 | -1][] = [[0, side], ...SLIDE_TURNS.map((t) => [t * side, side] as [number, 1 | -1]), ...SLIDE_TURNS.map((t) => [-t * side, -side as 1 | -1] as [number, 1 | -1])];
  for (const [turn, s] of turns) {
    const a = base + (turn * Math.PI) / 180;
    const len = max * Math.max(0.35, Math.cos((turn * Math.PI) / 180));
    const x = pos.x + Math.cos(a) * len;
    const y = pos.y + Math.sin(a) * len;
    if (canStand(x, y, mode, dest)) {
      const moved = Math.hypot(x - pos.x, y - pos.y);
      return { x, y, days: (moved * AEGEAN_KM_PER_PX) / KM_PER_DAY[here], terrain: here, blocked: turn !== 0, side: s };
    }
  }
  return { ...pos, days: 0, terrain: here, blocked: true, side: -side as 1 | -1 };
}

export function arrived(pos: { x: number; y: number }, mode: Mode, dest: Dest) {
  return near(pos.x, pos.y, mode === 'statek' ? (dest.port ?? dest).xy : dest.xy);
}

/** Dni pieszo z portu do miasta po przypłynięciu (Gytejon → Sparta: 45 km doliną Eurotasu). */
export function portWalkDays(dest: Dest) {
  return dest.port ? dest.port.km / KM_PER_DAY[1] : 0;
}

export type Results = Partial<Record<`${CityId}-${Mode}`, number>>;

export function formatDays(d: number) {
  if (d < 1) return 'niecały dzień';
  const n = Math.round(d);
  return `${n} ${n === 1 ? 'dzień' : 'dni'}`;
}

/** Werdykt po obu drogach do jednego miasta. */
export function compare(dest: Dest, res: Results): string | null {
  const w = res[`${dest.id}-pieszo`];
  const s = res[`${dest.id}-statek`];
  if (w === undefined || s === undefined) return null;
  const ratio = w / Math.max(s, 0.5);
  if (dest.id === 'milet')
    return `Statkiem przez wyspy — ${formatDays(s)}. Pieszo dookoła morza — ${formatDays(w)}. Milet leży po drugiej stronie morza: dla Greka był bliżej niż niejedna wioska za górą.`;
  if (dest.id === 'sparta')
    return ratio > 1.3
      ? `Nawet do Sparty, która leży w głębi lądu, statek był szybszy (${formatDays(s)} z marszem z portu kontra ${formatDays(w)} pieszo) — choć trzeba opłynąć cały półwysep.`
      : `Do Sparty obie drogi wyszły podobnie (${formatDays(s)} statkiem z marszem z portu, ${formatDays(w)} pieszo). Sparta leży w głębi lądu, za górami — dlatego była tak odcięta od innych.`;
  return `Do Koryntu pieszo ${formatDays(w)}, statkiem ${formatDays(s)}. Korynt miał dwa porty, po obu stronach przesmyku — żył z morza.`;
}

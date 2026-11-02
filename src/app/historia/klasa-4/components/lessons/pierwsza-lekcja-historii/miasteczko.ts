/**
 * Blok 3 — „Gdzie postawić szkołę?” — geometria planu i przebieg stulecia,
 * bez Reacta. Miasteczko, rzeka i kronika są **wymyślone** (i tak podpisane
 * w lekcji) — to model, nie mapa.
 *
 * Plan ma układ 400 × 300. Rzeka płynie dołem; nad nią leży płaska łąka, wyżej
 * miasteczko. Wielka woda sięga **pod przydrożny krzyż** — nieco ponad skraj
 * łąki — i tak mówi kronika. Kto ją przeczyta, wie, gdzie nie budować; kto nie
 * przeczyta, dowie się sto lat później. Konsekwencja, nie ocena (F-I.1-09).
 */

export const PLAN_W = 400;
export const PLAN_H = 300;
export const SCHOOL_W = 30;
export const SCHOOL_H = 20;

const r1 = (n: number) => Math.round(n * 10) / 10;

// Krzywe terenu są dopasowane do malowanego planu (`plan-miasteczka.jpg`,
// ten sam układ 4:3) — zmiana którejkolwiek wymaga nowego obrazu.

/** Górny brzeg rzeki. */
export const riverTop = (x: number) => r1(226.5 + 5.5 * Math.sin((x - 40) / 44.6));
/** Skraj łąki — dalej w górę zaczyna się skarpa miasteczka. */
export const meadowEdge = (x: number) => r1(167 + 2 * Math.sin(x / 70 + 0.5));
/** Dokąd sięga wielka woda (pod krzyż). */
export const bigFlood = (x: number) => r1(155 + 2.5 * Math.sin(x / 60 + 1));
/** Dokąd sięga mała woda. */
export const smallFlood = (x: number) => r1(riverTop(x) - 28);

/** Przydrożny krzyż — znak z kroniki, stoi na linii wielkiej wody. */
export const CROSS = { x: 118, y: bigFlood(118) };

export const RYNEK = { x: 205, y: 58, w: 58, h: 40 };
export const RYNEK_CENTER = { x: RYNEK.x + RYNEK.w / 2, y: RYNEK.y + RYNEK.h / 2 };

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const LIBRARY: Rect = { x: 148, y: 108, w: 34, h: 22 };
export const CHURCH: Rect = { x: 282, y: 36, w: 26, h: 42 };

/** Domy wokół rynku — zajęte działki. */
export const HOUSES: Rect[] = [
  { x: 180, y: 40, w: 20, h: 16 },
  { x: 180, y: 62, w: 20, h: 16 },
  { x: 180, y: 84, w: 20, h: 16 },
  { x: 206, y: 102, w: 20, h: 16 },
  { x: 232, y: 102, w: 20, h: 16 },
  { x: 206, y: 34, w: 20, h: 18 },
  { x: 232, y: 34, w: 20, h: 18 },
  { x: 258, y: 34, w: 20, h: 18 },
  { x: 268, y: 84, w: 20, h: 16 },
  { x: 268, y: 106, w: 20, h: 16 },
  { x: 150, y: 70, w: 20, h: 16 },
  { x: 150, y: 44, w: 20, h: 16 },
];

export const OBSTACLES: Rect[] = [RYNEK, LIBRARY, CHURCH, ...HOUSES];

/** Las na wzgórzu w lewym górnym rogu. */
export const FOREST = { x: 0, y: 0, w: 110, h: 78 };

export type Zone = 'laka' | 'miasto' | 'wzgorze';

export const ZONES: Record<Zone, { name: string; cost: string; costLevel: 1 | 2 | 3 }> = {
  laka: { name: 'łąka nad rzeką', cost: 'niski — płasko i dużo miejsca na boisko', costLevel: 1 },
  miasto: { name: 'skarpa przy miasteczku', cost: 'średni — ciasno, trzeba wykupić ogrody', costLevel: 2 },
  wzgorze: { name: 'wzgórze', cost: 'wysoki — stromo, trzeba wyrównać stok albo wyciąć las', costLevel: 3 },
};

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export function schoolRect(cx: number, cy: number): Rect {
  return { x: cx - SCHOOL_W / 2, y: cy - SCHOOL_H / 2, w: SCHOOL_W, h: SCHOOL_H };
}

/** Dlaczego nie tu — albo `null`, gdy wolno budować. */
export function placementProblem(cx: number, cy: number): string | null {
  const rect = schoolRect(cx, cy);
  if (rect.x < 2 || rect.x + rect.w > PLAN_W - 2 || rect.y < 2) return 'Za blisko skraju planu.';
  if (rect.y + rect.h > riverTop(cx) - 2) return 'Tu płynie rzeka.';
  const hit = OBSTACLES.find((o) => overlaps(rect, { x: o.x - 2, y: o.y - 2, w: o.w + 4, h: o.h + 4 }));
  if (hit === RYNEK) return 'Tu jest rynek — plac musi zostać wolny.';
  if (hit === LIBRARY) return 'Tu stoi biblioteka.';
  if (hit === CHURCH) return 'Tu stoi kościół.';
  if (hit) return 'Ta działka jest zajęta — stoi na niej dom.';
  return null;
}

export function zoneAt(cx: number, cy: number): Zone {
  if (cy + SCHOOL_H / 2 >= meadowEdge(cx)) return 'laka';
  const inForest = cx < FOREST.x + FOREST.w && cy < FOREST.y + FOREST.h;
  if (inForest || (cx > 330 && cy < 130)) return 'wzgorze';
  return 'miasto';
}

/** 1 jednostka planu = 3 m; dziecko idzie ok. 70 m na minutę. */
export function walkMinutes(cx: number, cy: number): number {
  const d = Math.hypot(cx - RYNEK_CENTER.x, cy - RYNEK_CENTER.y);
  return Math.max(1, Math.round((d * 3) / 70));
}

export type FloodSize = 'mala' | 'wielka';

export interface Flood {
  year: number;
  size: FloodSize;
}

/** Sto lat od otwarcia szkoły. Wielka woda — „za życia co drugiego dziadka”. */
export const CENTURY_FLOODS: Flood[] = [
  { year: 9, size: 'mala' },
  { year: 31, size: 'wielka' },
  { year: 58, size: 'mala' },
  { year: 84, size: 'wielka' },
];

export const floodLine = (size: FloodSize, x: number) => (size === 'wielka' ? bigFlood(x) : smallFlood(x));

/** Czy woda wchodzi do szkoły: dolna krawędź budynku poniżej linii wody. */
export function isFlooded(cx: number, cy: number, size: FloodSize): boolean {
  return cy + SCHOOL_H / 2 > floodLine(size, cx);
}

export interface CenturyResult {
  zone: Zone;
  walk: number;
  floodedIn: number[];
}

export function runCentury(cx: number, cy: number): CenturyResult {
  return {
    zone: zoneAt(cx, cy),
    walk: walkMinutes(cx, cy),
    floodedIn: CENTURY_FLOODS.filter((f) => isFlooded(cx, cy, f.size)).map((f) => f.year),
  };
}

/** Wielokąt wody od linii zalewu do dołu planu — do rysowania. */
export function floodPolygon(size: FloodSize): string {
  const pts: string[] = [];
  for (let x = 0; x <= PLAN_W; x += 10) pts.push(`${x},${floodLine(size, x)}`);
  return `${pts.join(' ')} ${PLAN_W},${PLAN_H} 0,${PLAN_H}`;
}

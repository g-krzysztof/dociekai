/**
 * Plan bitwy pod Grunwaldem (15 VII 1410, F-II.4-17) — L9 blok 3.
 *
 * Układ w kilometrach, początek we wsi Grunwald, x na wschód, y na północ.
 * Położenie wsi z OpenStreetMap (Nominatim, 2026-10-08): Grunwald 53.4853 N
 * 20.0915 E, Stębark 53.4954 N 20.1335 E, Łodwigowo 53.4696 N 20.1193 E —
 * przeliczone na km. Rozstawienie wojsk uproszczone za Wikipedią
 * („Bitwa pod Grunwaldem”, pl/en): wojska polsko-litewskie na wschód od
 * Łodwigowa i Stębarka, na skraju lasów przy jeziorze Łubień; Polacy lewe
 * skrzydło, Litwini prawe; Krzyżacy w trójkącie wsi, obóz za ich linią.
 * Przebieg: Litwini atakują, potem się cofają do lasu (Krzyżacy gonią); Polacy
 * walczą; wielki mistrz rusza z odwodem; Litwini wracają i uderzają z tyłu;
 * Ulrich von Jungingen ginie, obóz krzyżacki zdobyty. Jezioro i las — schemat,
 * nie pomiar.
 */

export type KmXY = readonly [number, number];

export const GRUNWALD_GEO = [20.0915, 53.4853] as const;

/** Prostokąt planu (km): wszystko, co plan pokazuje. */
export const PLAN_BOX = { x0: -0.8, x1: 5.6, y0: -2.6, y1: 1.9 };

export const VILLAGES: { name: string; at: KmXY; side: 'l' | 'r' | 't' | 'b' }[] = [
  { name: 'Grunwald', at: [0, 0], side: 'b' },
  { name: 'Stębark', at: [2.78, 1.12], side: 't' },
  { name: 'Łodwigowo', at: [1.84, -1.73], side: 'b' },
];

export const LAKE: KmXY[] = [
  [4.3, -1.2],
  [4.75, -1.0],
  [5.05, -1.35],
  [5.0, -2.0],
  [4.6, -2.35],
  [4.25, -1.95],
  [4.15, -1.5],
];

export const FOREST: KmXY[] = [
  [4.4, 1.9],
  [5.6, 1.9],
  [5.6, -2.6],
  [5.15, -2.6],
  [5.15, -0.8],
  [4.6, -0.6],
  [4.35, 0.2],
  [4.55, 1.0],
];

export const CAMP: KmXY = [0.55, -0.55];

export type Side = 'zakon' | 'polska' | 'litwa';

export interface Unit {
  id: string;
  side: Side;
  label: string;
  /** Położenie na początku każdej z faz 0…4 (5 punktów). */
  path: KmXY[];
  /** Od której fazy oddział jest rozbity (blednie). */
  brokenFrom?: number;
}

export const UNITS: Unit[] = [
  {
    id: 'z1',
    side: 'zakon',
    label: 'Krzyżacy',
    path: [
      [2.1, 0.55],
      [2.3, 0.6],
      [3.9, 1.2],
      [3.2, 0.9],
      [2.2, 0.4],
    ],
    brokenFrom: 4,
  },
  {
    id: 'z2',
    side: 'zakon',
    label: 'Krzyżacy',
    path: [
      [1.6, -0.3],
      [1.6, -0.3],
      [2.2, -0.25],
      [2.2, -0.25],
      [1.4, -0.45],
    ],
    brokenFrom: 4,
  },
  {
    id: 'z3',
    side: 'zakon',
    label: 'Krzyżacy',
    path: [
      [1.25, -1.0],
      [1.25, -1.0],
      [1.9, -1.0],
      [1.9, -1.0],
      [1.2, -0.9],
    ],
    brokenFrom: 4,
  },
  {
    id: 'mistrz',
    side: 'zakon',
    label: 'wielki mistrz',
    path: [
      [0.75, 0.05],
      [0.75, 0.05],
      [0.75, 0.05],
      [2.6, -0.1],
      [1.9, -0.2],
    ],
    brokenFrom: 4,
  },
  {
    id: 'litwa',
    side: 'litwa',
    label: 'Litwini',
    path: [
      [3.95, 0.9],
      [2.7, 0.65],
      [5.15, 1.35],
      [3.4, 0.4],
      [2.2, 0.95],
    ],
  },
  {
    id: 'p1',
    side: 'polska',
    label: 'Polacy',
    path: [
      [3.65, -0.2],
      [3.65, -0.2],
      [2.5, -0.2],
      [2.9, -0.15],
      [1.05, -0.2],
    ],
  },
  {
    id: 'p2',
    side: 'polska',
    label: 'Polacy',
    path: [
      [3.35, -1.15],
      [3.35, -1.15],
      [2.2, -1.0],
      [2.2, -1.0],
      [0.75, -0.95],
    ],
  },
];

export const PHASES: { title: string; text: string }[] = [
  {
    title: 'Rano',
    text: 'Dwa wojska stoją naprzeciw siebie. Krzyżacy — między trzema wsiami, Polacy i Litwini — na skraju lasu przy jeziorze Łubień.',
  },
  {
    title: 'Atak Litwinów',
    text: 'Pierwsi ruszają Litwini na prawym skrzydle i uderzają na Krzyżaków.',
  },
  {
    title: 'Odwrót do lasu',
    text: 'Litwini cofają się do lasu, a część Krzyżaków rusza za nimi w pogoń. Polacy walczą z resztą wojsk zakonu.',
  },
  {
    title: 'Ostatnie natarcie',
    text: 'Wielki mistrz Ulrich von Jungingen rusza z odwodem. Litwini wracają z lasu i uderzają z boku.',
  },
  {
    title: 'Wieczorem',
    text: 'Krzyżacy otoczeni. Wielki mistrz ginie, obóz zakonu zostaje zdobyty. Polacy i Litwini wygrywają.',
  },
];

export const LAST_PHASE = PHASES.length - 1;

/** Bieżąca faza na suwaku: 0 przy t = 0, potem k dla t ∈ (k − 1, k]. */
export function phaseAt(t: number): number {
  return Math.max(0, Math.min(LAST_PHASE, Math.ceil(t - 1e-9)));
}

/** Położenie oddziału w chwili `t ∈ [0, LAST_PHASE]` — liniowo między fazami. */
export function unitAt(unit: Unit, t: number): KmXY {
  const c = Math.max(0, Math.min(LAST_PHASE, t));
  const i = Math.min(Math.floor(c), LAST_PHASE - 1);
  const f = c - i;
  const [ax, ay] = unit.path[i];
  const [bx, by] = unit.path[i + 1];
  return [
    Math.round((ax + (bx - ax) * f) * 1000) / 1000,
    Math.round((ay + (by - ay) * f) * 1000) / 1000,
  ];
}

/**
 * Ruch w bieżącej fazie (do strzałki): skąd → dokąd. Faza k to ruch z położenia
 * k − 1 do k — strzałka pokazuje, co dzieje się (albo właśnie się stało) w tej
 * fazie. `null`, gdy oddział stoi albo suwak jest na początku.
 */
export function moveInPhase(unit: Unit, t: number): [KmXY, KmXY] | null {
  const k = phaseAt(t);
  if (k === 0) return null;
  const a = unit.path[k - 1];
  const b = unit.path[k];
  return Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.05 ? null : [a, b];
}

// ─── Przybliżanie: mapa → plan ─────────────────────────────────────────────────

/** Największe przybliżenie suwaka (plan wypełnia ekran). */
export const MAX_ZOOM = 140;

/** Suwak 0…1 → przybliżenie 1…MAX_ZOOM (logarytmicznie — każdy kawałek suwaka to tyle samo „razy”). */
export function zoomOf(s: number): number {
  return Math.exp(Math.max(0, Math.min(1, s)) * Math.log(MAX_ZOOM));
}

/** Od jakiego przybliżenia rysunek jest planem (pokazuje kilka km). */
export const PLAN_FROM_ZOOM = 60;

export function planOpacity(z: number): number {
  return Math.max(0, Math.min(1, (z - 35) / (PLAN_FROM_ZOOM - 35)));
}

/** Szerokość pokazanego terenu w km przy danym przybliżeniu. */
export function shownWidthKm(viewWidth: number, kmPerPx: number, z: number): number {
  return (viewWidth * kmPerPx) / z;
}

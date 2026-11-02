/**
 * Skala Osi dziejów — czysta matematyka położenia, bez Reacta i bez pikseli.
 *
 * Położenie wydarzenia to `u ∈ [0, 1]` (0 = lewy koniec, 1 = dziś). Komponent
 * zamienia `u` na piksele (`uToPx`), wstawiając między 1 r. p.n.e. a 1 r. n.e.
 * **szczelinę stałej szerokości** (`GAP_PX`) — roku zero nie ma, więc na osi
 * jest dziura, a nie kreska (patrz `dating.ts`).
 *
 * Dwa tryby z programu:
 * - `ludzkosc` — „cała ludzkość”, **logarytmicznie** po latach wstecz od dziś,
 *   żeby 300 000 lat i ostatnie 100 lat zmieściły się na jednym ekranie.
 *   Podziałka ma wtedy nierówną gęstość i trzeba ją dziecku pokazać
 *   (etykiety „lat temu”), inaczej oś wygląda na kłamstwo (karta L6);
 * - `piramidy` — „od piramid do dziś”, **liniowo** od 3500 p.n.e.
 */

import { anchorAstro, toAstro, toRoman, type Dating } from './dating';

export type TimelineMode = 'ludzkosc' | 'piramidy';

export const TIMELINE_MODES: Record<TimelineMode, { label: string; hint: string }> = {
  ludzkosc: { label: 'Cała ludzkość', hint: 'Im bliżej dziś, tym gęstsza podziałka.' },
  piramidy: { label: 'Od piramid do dziś', hint: 'Każde 500 lat zajmuje tyle samo miejsca. Pionowa kreska to początek naszej ery.' },
};

/** Najdawniejszy punkt trybu „cała ludzkość” — pierwsi ludzie (L15). */
export const HUMANITY_YEARS_AGO = 300_000;
/** Przesunięcie logarytmu: bez niego ostatni rok zająłby pół osi. */
const LOG_OFFSET = 10;
/** Lewy koniec trybu liniowego (rok historyczny) — przed pismem i państwem egipskim. */
export const LINEAR_START_YEAR = -3500;

/** Szerokość szczeliny roku zero i marginesy osi — wspólne dla rysowania i przeliczania wskaźnika. */
export const GAP_PX = 14;
export const PAD_PX = 12;

/**
 * Położenie roku astronomicznego (może być ułamkowy) na osi, `u ∈ [0, 1]`.
 * Wartości spoza zakresu trybu są przycinane — komponent rysuje je przy krawędzi
 * ze strzałką „wcześniej”.
 */
export function astroToU(astro: number, mode: TimelineMode, now: number): number {
  const nowAstro = toAstro(now);
  let u: number;
  if (mode === 'piramidy') {
    const start = toAstro(LINEAR_START_YEAR);
    u = (astro - start) / (nowAstro - start);
  } else {
    const ago = Math.max(0, nowAstro - astro);
    const top = Math.log10(HUMANITY_YEARS_AGO + LOG_OFFSET);
    const bottom = Math.log10(LOG_OFFSET);
    u = (top - Math.log10(ago + LOG_OFFSET)) / (top - bottom);
  }
  return Math.min(1, Math.max(0, u));
}

/** Odwrotność `astroToU` — do odczytu, gdzie dziecko upuściło pinezkę. */
export function uToAstro(u: number, mode: TimelineMode, now: number): number {
  const nowAstro = toAstro(now);
  const clamped = Math.min(1, Math.max(0, u));
  if (mode === 'piramidy') {
    const start = toAstro(LINEAR_START_YEAR);
    return start + clamped * (nowAstro - start);
  }
  const top = Math.log10(HUMANITY_YEARS_AGO + LOG_OFFSET);
  const bottom = Math.log10(LOG_OFFSET);
  const ago = 10 ** (top - clamped * (top - bottom)) - LOG_OFFSET;
  return nowAstro - ago;
}

/** Czy wydarzenie wypada przed lewym końcem trybu (rysowane przy krawędzi, ze strzałką). */
export function isBeforeRange(astro: number, mode: TimelineMode, now: number): boolean {
  if (mode === 'piramidy') return astro < toAstro(LINEAR_START_YEAR);
  return toAstro(now) - astro > HUMANITY_YEARS_AGO;
}

export function datingToU(dating: Dating, mode: TimelineMode, now: number): number {
  return astroToU(anchorAstro(dating, now), mode, now);
}

/** Szczelina leży między 1 r. p.n.e. (astro 0) a 1 r. n.e. (astro 1) — w jej środku. */
export function gapU(mode: TimelineMode, now: number): number {
  return astroToU(0.5, mode, now);
}

/**
 * `u` → piksele w osi o szerokości `width`: marginesy po bokach, szczelina
 * dokładana za rokiem zero. Tych samych liczb używa `pxToU` przy przeciąganiu.
 */
export function uToPx(u: number, afterGap: boolean, width: number): number {
  return PAD_PX + u * (width - 2 * PAD_PX - GAP_PX) + (afterGap ? GAP_PX : 0);
}

/**
 * Piksele → `u` (wskaźnik dziecka). W szczelinie wskaźnik przykleja się do
 * jej brzegu bliższego palcowi — w roku zero nie da się niczego przypiąć.
 */
export function pxToU(px: number, width: number, mode: TimelineMode, now: number): number {
  const inner = width - 2 * PAD_PX - GAP_PX;
  if (inner <= 0) return 0;
  const g = gapU(mode, now);
  const gapStart = uToPx(g, false, width);
  const gapEnd = gapStart + GAP_PX;
  let u: number;
  if (px <= gapStart) u = (px - PAD_PX) / inner;
  else if (px >= gapEnd) u = (px - PAD_PX - GAP_PX) / inner;
  else u = px - gapStart < gapEnd - px ? g - 1e-6 : g + 1e-6;
  return Math.min(1, Math.max(0, u));
}

export interface Tick {
  u: number;
  afterGap: boolean;
  label: string;
  /** Duża kreska z podpisem czy drobna bez podpisu. */
  major: boolean;
}

/** Podziałka trybu. Rok bieżący podaje komponent (`now`), żeby „dziś” się nie starzało. */
export function ticksFor(mode: TimelineMode, now: number): Tick[] {
  const g = gapU(mode, now);
  const make = (astro: number, label: string, major = true): Tick => {
    const u = astroToU(astro, mode, now);
    return { u, afterGap: u > g, label, major };
  };

  if (mode === 'piramidy') {
    const ticks: Tick[] = [];
    for (let year = LINEAR_START_YEAR; year <= now; year += 500) {
      if (year === 0) continue;
      // Co 1000 lat z podpisem, co 500 — kreska bez podpisu (na telefonie inaczej się nie zmieści).
      const major = year % 1000 === 0;
      const label = year < 0 ? `${-year} p.n.e.` : String(year);
      ticks.push(make(toAstro(year), label, major));
    }
    return ticks;
  }

  const nowAstro = toAstro(now);
  // Same liczby — „lat temu” komponent podpisuje raz, pod osią (na telefonie nie zmieści się przy każdej kresce).
  const agoLabel = (years: number) =>
    years >= 10_000 ? `${Math.round(years / 1000)} tys.` : String(years);
  return [
    make(nowAstro - 300_000, agoLabel(300_000)),
    make(nowAstro - 100_000, agoLabel(100_000), false),
    make(nowAstro - 10_000, agoLabel(10_000)),
    make(nowAstro - 1000, agoLabel(1000)),
    make(nowAstro - 100, agoLabel(100)),
    make(nowAstro - 10, agoLabel(10), false),
    make(nowAstro, 'dziś'),
  ];
}

export interface Era {
  id: 'prehistoria' | 'starozytnosc' | 'sredniowiecze' | 'nowozytnosc' | 'wspolczesnosc';
  label: string;
  /** Rok historyczny początku; `null` = od lewego końca osi. */
  from: number | null;
  color: string;
}

/**
 * Epoki z bazy wiedzy (`F-I.4-11`, prehistoria przed pismem): granice to pismo
 * (ok. 3400 p.n.e.), upadek cesarstwa zachodniego (476), wyprawa Kolumba (1492)
 * i odzyskanie niepodległości (1918) — tak jak w karcie L6. Kolory to jasne
 * tła pasów, nie znaczenie — epoki różni tylko podpis.
 */
export const ERAS: Era[] = [
  { id: 'prehistoria', label: 'prehistoria', from: null, color: 'hsl(30 30% 50% / 0.10)' },
  { id: 'starozytnosc', label: 'starożytność', from: -3400, color: 'hsl(40 70% 50% / 0.16)' },
  { id: 'sredniowiecze', label: 'średniowiecze', from: 476, color: 'hsl(200 50% 50% / 0.14)' },
  { id: 'nowozytnosc', label: 'nowożytność', from: 1492, color: 'hsl(150 40% 45% / 0.14)' },
  { id: 'wspolczesnosc', label: 'współczesność', from: 1918, color: 'hsl(280 40% 55% / 0.14)' },
];

export interface EraBand {
  era: Era;
  fromU: number;
  toU: number;
  fromAfterGap: boolean;
  toAfterGap: boolean;
}

/** Pasy epok w danym trybie — epoka, która w całości wypada przed lewym końcem, znika. */
export function eraBands(mode: TimelineMode, now: number): EraBand[] {
  const g = gapU(mode, now);
  return ERAS.map((era, i) => {
    const fromU = era.from === null ? 0 : astroToU(toAstro(era.from), mode, now);
    const next = ERAS[i + 1];
    const toU = next?.from != null ? astroToU(toAstro(next.from), mode, now) : 1;
    return { era, fromU, toU, fromAfterGap: fromU > g, toAfterGap: toU > g || toU === 1 };
  }).filter((band) => band.toU > band.fromU);
}

/**
 * Rozkład podpisów na rzędy nad osią: zachłannie, od lewej, każdy podpis idzie
 * do pierwszego rzędu, w którym się mieści. Co się nie zmieści w `maxLanes`,
 * dostaje `lane: null` — kropkę bez podpisu (podpis po stuknięciu).
 */
export function assignLanes(
  items: { id: string; px: number; labelPx: number }[],
  maxLanes: number,
  gapPx = 6,
  /** Szerokość osi — podpis przy krawędzi jest do niej dosuwany, więc rzędy liczy się z dosuniętego. */
  widthPx = Infinity
): Record<string, number | null> {
  const ends: number[] = [];
  const out: Record<string, number | null> = {};
  [...items]
    .map((item) => ({ ...item, left: Math.max(0, Math.min(item.px - item.labelPx / 2, widthPx - item.labelPx)) }))
    .sort((a, b) => a.left - b.left)
    .forEach((item) => {
      const { left } = item;
      const lane = ends.findIndex((end) => end + gapPx <= left);
      if (lane >= 0) {
        ends[lane] = left + item.labelPx;
        out[item.id] = lane;
      } else if (ends.length < maxLanes) {
        ends.push(left + item.labelPx);
        out[item.id] = ends.length - 1;
      } else {
        out[item.id] = null;
      }
    });
  return out;
}

export interface CenturyMark {
  /** Wiek dodatni (`5` = V w.); strona szczeliny w `bc`. */
  century: number;
  bc: boolean;
  /** Środek wieku (do podpisu) i jego granica od strony dawniejszej (do kreski). */
  midU: number;
  edgeU: number;
  afterGap: boolean;
  label: string;
  /** Czy ten wiek dostaje podpis przy tej szerokości osi (co 1, 2, 5 albo 10 wieków). */
  labeled: boolean;
}


/**
 * Podziałka w wiekach rzymskich (od L7) — tylko tryb liniowy „od piramid do dziś”;
 * w trybie logarytmicznym wieki miałyby różne szerokości i zlewały się przy dziś.
 * Kreska stoi na **granicy wieku** (n.e. między …00 a …01, p.n.e. między …01 a …00),
 * podpis w środku. Gęstość podpisów dobiera się do szerokości osi: co tyle wieków,
 * żeby podpis miał ≥ 26 px; podpisane są wieki podzielne przez krok (i zawsze I).
 */
export function centuryMarks(mode: TimelineMode, now: number, width: number): CenturyMark[] {
  if (mode !== 'piramidy' || width <= 0) return [];
  const inner = width - 2 * PAD_PX - GAP_PX;
  const span = toAstro(now) - toAstro(LINEAR_START_YEAR);
  const pxPerCentury = (inner * 100) / span;
  const step = [1, 2, 5, 10].find((s) => s * pxPerCentury >= 26) ?? 10;
  const marks: CenturyMark[] = [];
  const firstBc = Math.ceil(-LINEAR_START_YEAR / 100);
  const lastCe = Math.ceil(now / 100);
  for (let c = firstBc; c >= 1; c--) {
    // c w. p.n.e. = lata c·100 … (c−1)·100+1 p.n.e. → astro −c·100+1 … −(c−1)·100
    const edgeU = astroToU(-c * 100 + 0.5, mode, now);
    const midU = astroToU(-c * 100 + 50.5, mode, now);
    marks.push({ century: c, bc: true, midU, edgeU, afterGap: false, label: toRoman(c), labeled: c % step === 0 || c === 1 });
  }
  for (let c = 1; c <= lastCe; c++) {
    const edgeU = astroToU((c - 1) * 100 + 0.5, mode, now);
    const midU = astroToU(Math.min((c - 1) * 100 + 50.5, toAstro(now)), mode, now);
    marks.push({ century: c, bc: false, midU, edgeU, afterGap: true, label: toRoman(c), labeled: c % step === 0 || c === 1 || c === lastCe });
  }
  // Bieżący wiek jest zawsze podpisany — sąsiad z kroku podziałki, który by na nim stanął, ustępuje.
  if (lastCe % step !== 0) {
    marks.forEach((m) => {
      if (!m.bc && m.century !== lastCe && m.century > lastCe - step) m.labeled = false;
    });
  }
  return marks;
}

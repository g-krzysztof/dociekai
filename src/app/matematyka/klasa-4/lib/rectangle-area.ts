/**
 * Pole prostokąta i kwadratu — jedna czysta funkcja karmi widżet, przykłady i
 * klucz odpowiedzi (ta sama zasada co `lib/area.ts` czy `lib/area-units.ts`).
 *
 * Cały temat stoi na jednym przejściu: „policz wszystkie kratki” → „policz
 * jeden rząd i pomnóż przez liczbę rzędów”. Dlatego kafelkowanie opisane jest
 * rzędami (`buildRowTiling`), a nie płaską listą komórek — widżet animuje
 * dokładnie ten krok, który jest treścią lekcji.
 */

export interface RectangleSpec {
  /** Liczba kratek w rzędzie (bok poziomy). */
  width: number;
  /** Liczba rzędów (bok pionowy). */
  height: number;
}

export const rectangleArea = ({ width, height }: RectangleSpec): number => width * height;

export const rectanglePerimeter = ({ width, height }: RectangleSpec): number =>
  2 * (width + height);

export const isSquare = ({ width, height }: RectangleSpec): boolean => width === height;

/** Zapis działania na pole — dla kwadratu ten sam bok dwa razy. */
export const areaFormula = (rect: RectangleSpec): string =>
  `${rect.width} · ${rect.height} = ${rectangleArea(rect)}`;

/* ─────────────────────────── kafelkowanie rzędami ─────────────────────────── */

export interface TilingRow {
  /** Indeks rzędu od góry, `0` to rząd wzorcowy, który dziecko układa samo. */
  index: number;
  /** Ile kratek w tym rzędzie — zawsze tyle samo, o to właśnie chodzi. */
  cells: number;
  /** Ile kratek leży na planszy po ułożeniu tego rzędu. */
  runningTotal: number;
}

export interface RowTiling {
  spec: RectangleSpec;
  rows: TilingRow[];
  perRow: number;
  total: number;
}

/**
 * Prostokąt rozpisany rząd po rzędzie. Suma narastająca (`runningTotal`) jest
 * tu po to, żeby licznik pod planszą pokazywał to samo, co widać na kafelkach —
 * nigdy nie liczony osobno w komponencie.
 */
export function buildRowTiling(spec: RectangleSpec): RowTiling {
  const rows: TilingRow[] = Array.from({ length: spec.height }, (_, index) => ({
    index,
    cells: spec.width,
    runningTotal: spec.width * (index + 1),
  }));
  return { spec, rows, perRow: spec.width, total: rectangleArea(spec) };
}

/* ─────────────────────────── prostokąty o tym samym polu ─────────────────────────── */

/**
 * Wszystkie prostokąty o zadanym polu i całkowitych bokach, przycięte do
 * `maxSide` (plansza ma stały rozmiar). Posortowane rosnąco po szerokości,
 * więc przeciąganie w prawo zawsze poszerza prostokąt.
 */
export function factorRectangles(area: number, maxSide: number): RectangleSpec[] {
  const list: RectangleSpec[] = [];
  for (let width = 1; width <= maxSide; width += 1) {
    if (area % width !== 0) continue;
    const height = area / width;
    if (height > maxSide) continue;
    list.push({ width, height });
  }
  return list;
}

/** Prostokąt o najkrótszym obwodzie spośród podanych — im bliżej kwadratu, tym krócej. */
export function shortestPerimeter(options: RectangleSpec[]): RectangleSpec {
  return options.reduce((best, item) =>
    rectanglePerimeter(item) < rectanglePerimeter(best) ? item : best
  );
}

/** Brakujący bok, gdy znasz pole i jeden bok: `P : a = b`. */
export const missingSide = (area: number, known: number): number => area / known;

/* ───────────────────────────────── ściąga ───────────────────────────────── */

export const RECTANGLE_AREA_RULES: string[] = [
  'Pole prostokąta to liczba kratek jednostkowych, które się w nim mieszczą — ale nie musisz ich liczyć po jednej.',
  'W każdym rzędzie leży tyle samo kratek, więc wystarczy policzyć jeden rząd i pomnożyć przez liczbę rzędów.',
  'Stąd wzór: pole prostokąta = a · b, gdzie a i b to długości dwóch sąsiednich boków.',
  'Kwadrat to prostokąt o równych bokach, więc jego pole to a · a — ten sam bok pomnożony przez siebie.',
  'Oba boki muszą być w tej samej jednostce. Bok w metrach razy bok w metrach daje pole w metrach kwadratowych.',
  'Ze wzoru da się też cofnąć: jeśli znasz pole i jeden bok, drugi bok policzysz dzieleniem — b = P : a.',
  'Pole to nie obwód: prostokąty o tym samym polu potrafią mieć zupełnie różne obwody, a najkrótszy ma ten najbardziej podobny do kwadratu.',
];

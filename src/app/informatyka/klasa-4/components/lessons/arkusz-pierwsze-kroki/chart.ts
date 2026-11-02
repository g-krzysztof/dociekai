import { addr, displayValue, type Box, type CellValue } from '../../../lib/formula';

/**
 * Wykres jako **czysta funkcja zaznaczenia** — dokładnie tak, jak robi to
 * prawdziwy arkusz, kiedy klikasz „Wstaw → Wykres”.
 *
 * Program nie wie, co dziecko miało na myśli. Patrzy na zaznaczony prostokąt i
 * zgaduje według dwóch reguł, które znają Excel, LibreOffice i Arkusze Google:
 *
 * - jeśli **pierwsza kolumna** zaznaczenia to tekst — są to podpisy pod słupkami;
 * - jeśli **pierwszy wiersz** to tekst — są to nazwy serii (legenda).
 *
 * Wszystko inne to liczby do narysowania. Stąd biorą się dwie usterki z bloku o
 * wykresach, i obie są wierne, nie wymyślone: zaznaczony wiersz „Razem” staje
 * się zwykłym słupkiem, a zaznaczenie bez kolumny z nazwami daje podpisy
 * „1, 2, 3…”, z których nic nie wynika.
 *
 * Ta sama funkcja rysuje też wykres dziecka w zadaniu i w jego nagrodzie
 * (`sheet-studio.tsx`).
 */

export type ChartKind = 'column' | 'line' | 'pie';

export interface ChartSeriesModel {
  name: string;
  values: (number | null)[];
}

export interface ChartModel {
  kind: ChartKind;
  categories: string[];
  series: ChartSeriesModel[];
  /** Czy podpisy wzięły się z danych, czy program wstawił numery. */
  namedCategories: boolean;
}

export const CHART_KIND_LABEL: Record<ChartKind, string> = {
  column: 'kolumnowy',
  line: 'liniowy',
  pie: 'kołowy',
};

const isText = (value: CellValue | undefined) => value?.t === 'str';
const isEmpty = (value: CellValue | undefined) => !value || value.t === 'empty';

/**
 * Jak program rozkłada zaznaczenie: czy pierwsza kolumna to podpisy, czy pierwszy
 * wiersz to nazwy serii, i gdzie zaczynają się liczby.
 */
export interface ChartLayout {
  labelCol: boolean;
  headerRow: boolean;
  /** Pole z samymi liczbami (bez podpisów i nagłówka). */
  data: Box;
}

export function chartLayout(values: Record<string, CellValue>, box: Box): ChartLayout {
  const at = (col: number, row: number) => values[addr(col, row)];
  const width = box.c2 - box.c1 + 1;
  const height = box.r2 - box.r1 + 1;

  /* Pierwsza kolumna to podpisy, gdy nie ma w niej liczb (poza ewentualnym narożnikiem). */
  let labelCol = false;
  if (width > 1) {
    let texts = 0;
    let numbers = 0;
    for (let row = box.r1; row <= box.r2; row += 1) {
      const value = at(box.c1, row);
      if (isText(value)) texts += 1;
      else if (value?.t === 'num') numbers += 1;
    }
    labelCol = texts > 0 && numbers === 0;
  }

  /* Pierwszy wiersz to nazwy serii, gdy w kolumnach danych stoi tam tekst. */
  const dataC1 = box.c1 + (labelCol ? 1 : 0);
  let headerRow = false;
  if (height > 1) {
    let texts = 0;
    let numbers = 0;
    for (let col = dataC1; col <= box.c2; col += 1) {
      const value = at(col, box.r1);
      if (isText(value)) texts += 1;
      else if (value?.t === 'num') numbers += 1;
    }
    headerRow = texts > 0 && numbers === 0;
  }
  return { labelCol, headerRow, data: { c1: dataC1, c2: box.c2, r1: box.r1 + (headerRow ? 1 : 0), r2: box.r2 } };
}

export function chartFromBox(
  values: Record<string, CellValue>,
  box: Box,
  kind: ChartKind
): ChartModel {
  const at = (col: number, row: number) => values[addr(col, row)];
  const { labelCol, headerRow, data } = chartLayout(values, box);

  const categories: string[] = [];
  for (let row = data.r1; row <= data.r2; row += 1) {
    categories.push(labelCol ? displayValue(at(box.c1, row)) : String(row - data.r1 + 1));
  }

  const series: ChartSeriesModel[] = [];
  for (let col = data.c1; col <= data.c2; col += 1) {
    const list: (number | null)[] = [];
    for (let row = data.r1; row <= data.r2; row += 1) {
      const value = at(col, row);
      list.push(value?.t === 'num' ? value.v : null);
    }
    series.push({
      name: headerRow && !isEmpty(at(col, box.r1)) ? displayValue(at(col, box.r1)) : `Seria ${series.length + 1}`,
      values: list,
    });
  }

  return { kind, categories, series, namedCategories: labelCol };
}

/** Największa wartość z podpisem — do zdań „co czytelnik wyczyta z wykresu”. */
export function chartMax(model: ChartModel, seriesIndex = 0): { label: string; value: number; index: number } | null {
  const list = model.series[seriesIndex]?.values ?? [];
  let best: { label: string; value: number; index: number } | null = null;
  list.forEach((value, index) => {
    if (value === null) return;
    if (!best || value > best.value) best = { label: model.categories[index] ?? '', value, index };
  });
  return best;
}

export function chartMin(model: ChartModel, seriesIndex = 0): { label: string; value: number; index: number } | null {
  const list = model.series[seriesIndex]?.values ?? [];
  let best: { label: string; value: number; index: number } | null = null;
  list.forEach((value, index) => {
    if (value === null) return;
    if (!best || value < best.value) best = { label: model.categories[index] ?? '', value, index };
  });
  return best;
}

/** Działki osi: 1, 2 albo 5 razy potęga dziesięciu, najwyżej pięć kresek. */
export function niceTicks(max: number, min = 0): number[] {
  const low = Math.min(0, min);
  const span = Math.max(max - low, 1);
  const raw = span / 5;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((factor) => factor * power).find((candidate) => span / candidate <= 5) ?? power * 10;
  const ticks: number[] = [];
  for (let tick = Math.floor(low / step) * step; tick <= max + step * 0.001; tick += step) ticks.push(Number(tick.toFixed(6)));
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}


/**
 * Mnożenie i dzielenie ułamka dziesiętnego przez 10, 100 lub 1000 rozłożone
 * na „przeskok przecinka o tyle miejsc, ile zer ma liczba" + ewentualne
 * dopełnienie brakujących miejsc zerami. Ta sama dyscyplina co `decimal.ts` /
 * `decimal-addition.ts`: jedna czysta funkcja karmi i widżet, i rozpisane
 * przykłady, i klucz odpowiedzi do ćwiczeń.
 *
 * Liczby trzymamy jako ciąg cyfr + pozycja przecinka, nigdy jako `number` —
 * 0,07 · 100 w float64 potrafi dać 7,000000000000001, a lekcja ma pokazywać
 * dokładnie te cyfry, które wychodzą z przesunięcia przecinka.
 *
 * Zakres klasy 4: dzielnik/mnożnik ∈ {10, 100, 1000}; wynik nieujemny.
 */

import { formatDecimal, parseDecimal, type DecimalValue } from './decimal';

export type ScalingOp = 'x10' | 'x100' | 'x1000' | 'd10' | 'd100' | 'd1000';

export interface ScalingOpMeta {
  op: ScalingOp;
  /** „· 10", „: 100"… */
  label: string;
  /** 10, 100 albo 1000. */
  factor: number;
  /** 1, 2 albo 3. */
  zeros: number;
  /** `true` = mnożenie (przecinek w prawo), `false` = dzielenie (w lewo). */
  multiply: boolean;
}

export const SCALING_OPS: ScalingOpMeta[] = [
  { op: 'x10', label: '· 10', factor: 10, zeros: 1, multiply: true },
  { op: 'x100', label: '· 100', factor: 100, zeros: 2, multiply: true },
  { op: 'x1000', label: '· 1000', factor: 1000, zeros: 3, multiply: true },
  { op: 'd10', label: ': 10', factor: 10, zeros: 1, multiply: false },
  { op: 'd100', label: ': 100', factor: 100, zeros: 2, multiply: false },
  { op: 'd1000', label: ': 1000', factor: 1000, zeros: 3, multiply: false },
];

export const scalingMeta = (op: ScalingOp): ScalingOpMeta =>
  SCALING_OPS.find((m) => m.op === op) ?? SCALING_OPS[0];

export interface ResultCell {
  char: string;
  /** `true`, gdy to zero dopisane przez przesunięcie przecinka (a nie cyfra oryginału). */
  added: boolean;
}

export interface DecimalScaling {
  inputText: string;
  op: ScalingOp;
  meta: ScalingOpMeta;
  /** Kierunek przeskoku przecinka. */
  direction: 'right' | 'left';
  /** Ile miejsc przeskakuje przecinek (= liczba zer mnożnika/dzielnika). */
  hops: number;
  /** Cyfry wyniku w kolejności — z zaznaczeniem, które są dopisanymi zerami. */
  cells: ResultCell[];
  /** Pozycja przecinka w `cells` PRZED operacją (indeks: 0 = przed pierwszą cyfrą). */
  commaFrom: number;
  /** Pozycja przecinka w `cells` PO operacji. */
  commaTo: number;
  /** Ile zer dziecko musi dopisać. */
  zerosToFill: number;
  /** Gotowy zapis wyniku, np. „0,042" albo „350". */
  resultText: string;
}

/** Znaczące cyfry liczby (bez wiodącego „0" części całkowitej) + pozycja przecinka. */
function significantDigits(value: DecimalValue): { digits: string[]; point: number } {
  const wholeStr = value.whole === 0 ? '' : String(value.whole);
  const digits = [...wholeStr, ...value.digits.map(String)];
  return { digits, point: wholeStr.length };
}

/**
 * Buduje pełny rozkład `inputText <op> {10|100|1000}` jako przeskok przecinka.
 * `inputText` w zapisie polskim („3,5", „0,07") lub z kropką.
 */
export function scaleDecimal(inputText: string, op: ScalingOp): DecimalScaling {
  const meta = scalingMeta(op);
  const value = parseDecimal(inputText);
  const { digits: sig, point } = significantDigits(value);

  let cells: ResultCell[];
  let commaFrom: number;
  let commaTo: number;

  if (meta.multiply) {
    const newPoint = point + meta.zeros;
    const appended = Math.max(0, newPoint - sig.length);
    cells = [
      ...sig.map((char) => ({ char, added: false })),
      ...Array.from({ length: appended }, () => ({ char: '0', added: true })),
    ];
    commaFrom = point;
    commaTo = newPoint;
    // Zdejmij wiodące zera części całkowitej (0,042 · 100 = 4,2, nie „04,2").
    while (commaTo > 1 && cells[0]?.char === '0' && !cells[0].added) {
      cells = cells.slice(1);
      commaTo -= 1;
      commaFrom = Math.max(0, commaFrom - 1);
    }
  } else {
    const newPoint = point - meta.zeros;
    const prepend = newPoint <= 0 ? 1 - newPoint : 0;
    cells = [
      ...Array.from({ length: prepend }, () => ({ char: '0', added: true })),
      ...sig.map((char) => ({ char, added: false })),
    ];
    commaFrom = prepend + point;
    commaTo = prepend + newPoint;
  }

  const resultText = trimTrailingZeros(cellsToText(cells, commaTo));

  return {
    inputText: formatDecimal(value),
    op,
    meta,
    direction: meta.multiply ? 'right' : 'left',
    hops: meta.zeros,
    cells,
    commaFrom,
    commaTo,
    zerosToFill: cells.filter((c) => c.added).length,
    resultText,
  };
}

/** Składa cyfry z pozycją przecinka w zapis polski. Przecinek na końcu = brak części ułamkowej. */
export function cellsToText(cells: ResultCell[], comma: number): string {
  const chars = cells.map((c) => c.char);
  if (comma >= chars.length) return chars.join('');
  if (comma <= 0) return `0,${chars.join('')}`;
  return `${chars.slice(0, comma).join('')},${chars.slice(comma).join('')}`;
}

/** „3,50" → „3,5", „0,60" → „0,6", „350" → „350". Do klucza odpowiedzi w ćwiczeniach. */
export function trimTrailingZeros(text: string): string {
  if (!text.includes(',')) return text;
  const trimmed = text.replace(/0+$/, '').replace(/,$/, '');
  return trimmed === '' ? '0' : trimmed;
}

export const DECIMAL_SCALING_RULES: string[] = [
  'Policz zera mnożnika lub dzielnika: 10 ma jedno zero, 100 — dwa, 1000 — trzy. Tyle miejsc przeskoczy przecinek.',
  'Mnożenie przesuwa przecinek w prawo — liczba rośnie (3,5 · 100 = 350).',
  'Dzielenie przesuwa przecinek w lewo — liczba maleje (4,2 : 100 = 0,042).',
  'Gdy przecinek wychodzi poza cyfry, dopisz brakujące miejsca zerami — z prawej przy mnożeniu, z lewej przy dzieleniu.',
  'Jeśli po dzieleniu przed przecinkiem nic nie zostaje, napisz tam 0 (0,042, nie ,042).',
];

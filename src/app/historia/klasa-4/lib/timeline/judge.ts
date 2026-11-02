/**
 * Sędzia „przypnij pinezkę” — czysta funkcja.
 *
 * Dziecko upuszcza pinezkę na osi; przyjmujemy ją, gdy spełnia **oba** warunki:
 * 1. leży blisko prawdziwego miejsca (`tolerance` w jednostkach `u`), i
 * 2. **kolejność jest dobra** — między miejscem upuszczenia a prawdziwym
 *    miejscem nie stoi żadna pinezka, która już wisi na osi. Na osi czasu liczy
 *    się kolejność (zdanie L6), więc „prawie dobrze, ale przed piramidami,
 *    choć było po nich” to błąd, a nie przybliżenie.
 *
 * Odrzucenie zawsze nazywa konkret: kierunek i — jeśli się da — sąsiada,
 * względem którego kolejność się nie zgadza.
 */

export interface PlacedPin {
  id: string;
  label: string;
  /** Datowanie po polsku, do komunikatu, np. „ok. 2500 p.n.e.”. */
  when: string;
  /** Rok astronomiczny kotwicy — decyduje o kolejności. */
  astro: number;
  u: number;
}

export type DropVerdict =
  | { ok: true }
  | {
      ok: false;
      /** W którą stronę przesunąć: `later` = w prawo (to było później). */
      direction: 'later' | 'earlier';
      /** Pinezka na osi, z którą kolejność się nie zgadza — najbliższa prawdziwemu miejscu. */
      neighbour?: PlacedPin;
      /** Daleko od celu (ponad trzy tolerancje) — „sporo”, a nie „trochę”. */
      far: boolean;
    };

/** Domyślna tolerancja: ok. 6% długości osi — na telefonie ~20 px, na komputerze ~70 px. */
export const DEFAULT_TOLERANCE = 0.06;

export function judgeDrop(args: {
  targetU: number;
  targetAstro: number;
  droppedU: number;
  placed: PlacedPin[];
  tolerance?: number;
}): DropVerdict {
  const { targetU, targetAstro, droppedU, placed, tolerance = DEFAULT_TOLERANCE } = args;
  const direction = droppedU < targetU ? 'later' : 'earlier';

  // Pinezki, które dziecko „przeskoczyło”: na osi leżą między upuszczeniem a celem,
  // a w czasie są po drugiej stronie celu niż miejsce upuszczenia.
  const crossed = placed.filter((pin) =>
    direction === 'later'
      ? pin.u >= droppedU && pin.astro < targetAstro
      : pin.u <= droppedU && pin.astro > targetAstro
  );

  if (crossed.length === 0 && Math.abs(droppedU - targetU) <= tolerance) return { ok: true };

  const neighbour = crossed.sort((a, b) => Math.abs(a.u - targetU) - Math.abs(b.u - targetU))[0];
  return { ok: false, direction, neighbour, far: Math.abs(droppedU - targetU) > 3 * tolerance };
}

/** Komunikat werdyktu po polsku — nazywa sąsiada albo kierunek. */
export function verdictMessage(verdict: DropVerdict, label: string): string {
  if (verdict.ok) return `Przypięte! „${label}” wisi na swoim miejscu.`;
  const later = verdict.direction === 'later';
  const side = later ? 'w prawo' : 'w lewo';
  const rel = later ? 'później' : 'wcześniej';
  if (verdict.neighbour) {
    return `To było ${rel} niż „${verdict.neighbour.label}” (${verdict.neighbour.when}) — przesuń ${side}, ${later ? 'za tę pinezkę' : 'przed nią'}.`;
  }
  return `To było ${verdict.far ? 'dużo' : 'trochę'} ${rel} — przesuń ${verdict.far ? 'sporo' : 'trochę'} ${side}.`;
}

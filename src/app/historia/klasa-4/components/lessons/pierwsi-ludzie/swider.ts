/**
 * Świder ogniowy (L15, blok 1) — czysta logika. Dziecko kręci patykiem,
 * wodząc palcem w lewo i w prawo; liczy się TEMPO, czyli liczba zawróceń
 * w ostatniej sekundzie. Za wolno — drewno tylko się grzeje (ciepło staje
 * na progu dymu i opada); szybko — dym, potem żar.
 */

/** Okno, w którym liczymy zawrócenia. */
export const TEMPO_WINDOW_MS = 1000;
/** Tyle zawróceń na sekundę to „szybko” — drewno zaczyna się żarzyć. */
export const FAST = 5;
/** Poniżej tego tempa patyk ledwo się kręci — drewno stygnie. */
export const SLOW = 2;
/** Do tej granicy dochodzi ciepło przy wolnym kręceniu — dym się nie pojawi. */
export const WARM_CAP = 34;
export const SMOKE_AT = 40;
export const EMBER_AT = 100;

export type FireStage = 'zimne' | 'cieple' | 'dym' | 'zar';

/** Zawrócenia z ostatniej sekundy na sekundę. */
export function tempoAt(reversals: readonly number[], now: number): number {
  const from = now - TEMPO_WINDOW_MS;
  let n = 0;
  for (const t of reversals) if (t > from && t <= now) n++;
  return n * (1000 / TEMPO_WINDOW_MS);
}

/**
 * Jeden krok symulacji (`dt` w sekundach). Szybko: ciepło rośnie tym prędzej,
 * im szybciej się kręci. Średnio: rośnie powoli, ale tylko do `WARM_CAP`.
 * Wolno albo wcale: stygnie.
 */
export function stepHeat(heat: number, tempo: number, dt: number): number {
  if (heat >= EMBER_AT) return EMBER_AT;
  let next: number;
  if (tempo >= FAST) next = heat + (14 + (tempo - FAST) * 3) * dt;
  else if (tempo >= SLOW) next = heat < WARM_CAP ? Math.min(WARM_CAP, heat + 8 * dt) : heat - 2 * dt;
  else next = heat - 6 * dt;
  return Math.max(0, Math.min(EMBER_AT, next));
}

export function stageOf(heat: number): FireStage {
  if (heat >= EMBER_AT) return 'zar';
  if (heat >= SMOKE_AT) return 'dym';
  if (heat > 8) return 'cieple';
  return 'zimne';
}

/** Podpowiedź pod świdrem — mówi, co się dzieje, z liczbą zawróceń dziecka. */
export function tempoHint(tempo: number, heat: number): string {
  const n = Math.round(tempo);
  if (heat >= EMBER_AT) return 'Jest żar! Przenieś go do hubki z suchej trawy.';
  if (n === 0) return heat > 0 ? 'Patyk stoi — drewno stygnie.' : 'Wodź palcem po patyku w lewo i w prawo.';
  if (tempo < SLOW) return `${n} na sekundę — za wolno, drewno stygnie.`;
  if (tempo < FAST) {
    return heat >= WARM_CAP - 1
      ? `${n} na sekundę — drewno jest ciepłe, ale dymu nie będzie. Szybciej!`
      : `${n} na sekundę — drewno się grzeje. Szybciej!`;
  }
  return heat >= SMOKE_AT ? `${n} na sekundę — dymi! Nie przerywaj.` : `${n} na sekundę — dobrze, tak trzymaj.`;
}

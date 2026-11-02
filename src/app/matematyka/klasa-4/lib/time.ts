/**
 * Czyste funkcje do liczenia upływu czasu — ten sam „roman.ts"/„mass.ts" dla tej
 * lekcji: rozkład na skoki, formatowanie i klucz odpowiedzi liczą z tych samych
 * funkcji, więc widget, przykład i ćwiczenie nie mogą się rozjechać.
 */

import { digital24 } from './clock';

export const MINUTES_PER_HOUR = 60;
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = MINUTES_PER_HOUR * SECONDS_PER_MINUTE;

export function totalMinutes(hours24: number, minutes: number): number {
  return hours24 * MINUTES_PER_HOUR + minutes;
}

export function fromTotalMinutes(total: number): { hours24: number; minutes: number } {
  const dayMinutes = 24 * MINUTES_PER_HOUR;
  const wrapped = ((total % dayMinutes) + dayMinutes) % dayMinutes;
  return { hours24: Math.floor(wrapped / MINUTES_PER_HOUR), minutes: Math.round(wrapped % MINUTES_PER_HOUR) };
}

function clockLabel(total: number): string {
  const { hours24, minutes } = fromTotalMinutes(total);
  return digital24(hours24, minutes);
}

function hoursWord(n: number): string {
  if (n === 1) return 'godzina';
  if (n >= 2 && n <= 4) return 'godziny';
  return 'godzin';
}

/** np. formatDuration(155) === '2 h 35 min' — pomija składnik, który wyszedł na zero. */
export function formatDuration(minutesDelta: number): string {
  const h = Math.floor(minutesDelta / MINUTES_PER_HOUR);
  const m = Math.round(minutesDelta % MINUTES_PER_HOUR);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export interface TimeJump {
  id: string;
  kind: 'minutes' | 'hours';
  fromTotal: number;
  toTotal: number;
  deltaMinutes: number;
  /** Krótki podpis na chipie/plakietce, np. „+40 min" albo „+2 h". */
  shortLabel: string;
  /** Pełne zdanie do narracji pod zegarem. */
  caption: string;
}

/**
 * Rozkłada odcinek [startTotal, endTotal] (minuty od północy, `endTotal` >
 * `startTotal`, bez przekraczania północy) na maksymalnie trzy skoki metodą
 * „doliczania": najpierw do pełnej godziny, potem pełne godziny, na końcu
 * reszta minut — dokładnie ta sama strategia co `<JumpLine>` z Modułu 1, tylko
 * po tarczy zegara zamiast po otwartej osi liczbowej. To, który skok się
 * pojawia, zależy wyłącznie od tego, czy start/koniec leżą na pełnej godzinie
 * — patrz przypadki w komentarzach przy wywołaniach w komponentach lekcji.
 */
export function buildTimeJumps(startTotal: number, endTotal: number): TimeJump[] {
  const jumps: TimeJump[] = [];
  let cursor = startTotal;

  const nextHourBoundary = Math.ceil(startTotal / MINUTES_PER_HOUR) * MINUTES_PER_HOUR;
  if (startTotal % MINUTES_PER_HOUR !== 0 && nextHourBoundary <= endTotal) {
    const delta = nextHourBoundary - cursor;
    jumps.push({
      id: 'to-hour',
      kind: 'minutes',
      fromTotal: cursor,
      toTotal: nextHourBoundary,
      deltaMinutes: delta,
      shortLabel: `+${delta} min`,
      caption: `${delta} min do pełnej godziny — z ${clockLabel(cursor)} do ${clockLabel(nextHourBoundary)}.`,
    });
    cursor = nextHourBoundary;
  }

  const lastHourBoundary = Math.floor(endTotal / MINUTES_PER_HOUR) * MINUTES_PER_HOUR;
  if (lastHourBoundary > cursor) {
    const delta = lastHourBoundary - cursor;
    const wholeHours = delta / MINUTES_PER_HOUR;
    jumps.push({
      id: 'whole-hours',
      kind: 'hours',
      fromTotal: cursor,
      toTotal: lastHourBoundary,
      deltaMinutes: delta,
      shortLabel: `+${wholeHours} h`,
      caption: `${wholeHours} ${hoursWord(wholeHours)} do przodu — z ${clockLabel(cursor)} do ${clockLabel(lastHourBoundary)}.`,
    });
    cursor = lastHourBoundary;
  }

  if (endTotal > cursor) {
    const delta = endTotal - cursor;
    jumps.push({
      id: 'remaining-minutes',
      kind: 'minutes',
      fromTotal: cursor,
      toTotal: endTotal,
      deltaMinutes: delta,
      shortLabel: `+${delta} min`,
      caption: `Jeszcze ${delta} min — z ${clockLabel(cursor)} do ${clockLabel(endTotal)}.`,
    });
    cursor = endTotal;
  }

  return jumps;
}

export const TIME_RULES: string[] = [
  'Doba ma 24 godziny, godzina 60 minut, a minuta 60 sekund — nie 100, jak przy zwykłych liczbach.',
  'Zamieniając godziny na minuty, mnożysz przez 60: 3 h = 3 × 60 = 180 min.',
  'Zamieniając minuty na sekundy, też mnożysz przez 60: 4 min = 4 × 60 = 240 s.',
  'Upływ czasu liczysz „doliczając" od początku do końca: najpierw do pełnej godziny, potem pełne godziny, na końcu resztę minut.',
  'Licząc upływ czasu w słupku, „pożyczasz" od godzin nie 10, tylko 60 minut — to jedyna różnica względem zwykłego odejmowania.',
  'Sprawdzaj się zdrowym rozsądkiem: wynik typu „3 h 75 min" nie ma sensu — 75 minut to już godzina i 15 minut, trzeba to zamienić.',
];

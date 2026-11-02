/**
 * Blok 1 L20 — fizyka sań z blokiem. Czyste funkcje, bez Reacta.
 *
 * Model: blok 2,5 t (najmniejsze bloki piramid, baza F-III.4-16). Jeden
 * człowiek ciągnie długo z siłą ok. 300 N, więc ciężar bloku to ok. 83
 * „ludzkie siły”. Potrzebna liczba ludzi = ciężar × (opór piasku), a na
 * pochylni = ciężar × (sin kąta + opór × cos kąta).
 *
 * Opór piasku (współczynnik tarcia sań) — rząd wielkości z pomiarów A. Fall
 * i in., Physical Review Letters 112 (2014): suchy ok. 0,55, zwilżony w sam
 * raz około połowy tego, za mokry znowu rośnie (błoto). Liczby zaokrąglone
 * do lekcji, sens zachowany: woda w sam raz zmniejsza siłę o połowę.
 */

export const BLOCK_PEOPLE = 83.3;
export const ROPE_MAX = 40;
export const WORKERS_MIN = 10;
export const WORKERS_STEP = 2;

/** Odcinki toru na płaskim (po 2 m). */
export const SEGMENTS = 12;
export const SEGMENT_M = 2;

/** Opór piasku w zależności od tego, ile razy polano odcinek. */
export function friction(wet: number): number {
  if (wet <= 0) return 0.55;
  if (wet === 1) return 0.38;
  if (wet === 2) return 0.28;
  if (wet === 3) return 0.42;
  return 0.6;
}

export type SandState = 'suchy' | 'wilgotny' | 'w-sam-raz' | 'mokry' | 'bloto';

export function sandState(wet: number): SandState {
  if (wet <= 0) return 'suchy';
  if (wet === 1) return 'wilgotny';
  if (wet === 2) return 'w-sam-raz';
  if (wet === 3) return 'mokry';
  return 'bloto';
}

export const SAND_LABEL: Record<SandState, string> = {
  suchy: 'suchy piasek',
  wilgotny: 'lekko wilgotny',
  'w-sam-raz': 'wilgotny w sam raz',
  mokry: 'za mokry',
  bloto: 'błoto',
};

/** Ilu ludzi trzeba, żeby ruszyć blok po płaskim odcinku. */
export function neededFlat(wet: number): number {
  return Math.ceil(BLOCK_PEOPLE * friction(wet));
}

/** Pochylnia: wysokość warstwy stała, dziecko zmienia długość podstawy. */
export const RAMP_RISE_M = 20;
export const RAMP_MIN_M = 25;
export const RAMP_MAX_M = 140;
/** Pochylnię polewano tak samo — opór jak na piasku „w sam raz”. */
export const RAMP_FRICTION = friction(2);

export function rampAngleDeg(lengthM: number): number {
  return (Math.atan(RAMP_RISE_M / lengthM) * 180) / Math.PI;
}

export function neededRamp(lengthM: number): number {
  const a = Math.atan(RAMP_RISE_M / lengthM);
  return Math.ceil(BLOCK_PEOPLE * (Math.sin(a) + RAMP_FRICTION * Math.cos(a)));
}

export type PullVerdict =
  | { ok: true }
  | { ok: false; kind: 'za-malo-ludzi'; needed: number; workers: number }
  | { ok: false; kind: 'lina-za-krotka'; needed: number }
  | { ok: false; kind: 'bloto'; needed: number; workers: number };

/** Sędzia pociągnięcia liny po płaskim — decyduje odcinek pod przodem sań. */
export function judgeFlatPull(wet: number, workers: number): PullVerdict {
  const needed = neededFlat(wet);
  if (workers >= needed) return { ok: true };
  if (sandState(wet) === 'bloto' || sandState(wet) === 'mokry') return { ok: false, kind: 'bloto', needed, workers };
  if (needed > ROPE_MAX) return { ok: false, kind: 'lina-za-krotka', needed };
  return { ok: false, kind: 'za-malo-ludzi', needed, workers };
}

/** Sędzia pociągnięcia na pochylni. */
export function judgeRampPull(lengthM: number, workers: number): PullVerdict {
  const needed = neededRamp(lengthM);
  if (workers >= needed) return { ok: true };
  if (needed > ROPE_MAX) return { ok: false, kind: 'lina-za-krotka', needed };
  return { ok: false, kind: 'za-malo-ludzi', needed, workers };
}

/** Najkrótsza pochylnia (co 1 m), po której wciągnie blok pełna lina. */
export function shortestWorkingRamp(): number {
  for (let l = RAMP_MIN_M; l <= RAMP_MAX_M; l++) if (neededRamp(l) <= ROPE_MAX) return l;
  return RAMP_MAX_M;
}

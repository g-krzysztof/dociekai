/**
 * Blok 3 — skok w dal z ciężarkami (halteres), konkurencja pięcioboju
 * (F-IV.4-07). Czysta logika, bez Reacta.
 *
 * Model oparty na eksperymencie A. E. Minetti, L. P. Ardigò, „Halteres used
 * in ancient Olympic long jump”, Nature 420 (2002), s. 141–142: ciężarki
 * wymachiwane do przodu w chwili odbicia wydłużały skok z miejsca o ok. 17 cm,
 * ale tylko przy dobrej koordynacji — źle zgrane przeszkadzały. Skok w modelu
 * jest z miejsca (tak skakano najpewniej i w Olimpii); długość bazowa 2,90 m
 * to nasze założenie, nie rekord.
 */

/** Okres wymachu rąk (ms): od tyłu do przodu i z powrotem. */
export const SWING_MS = 1400;
export const BASE_M = 2.9;
export const BONUS_M = 0.17;
export const PENALTY_M = 0.1;

/** Faza wymachu w chwili `t` (ms): kąt rąk −1 (w tyle) … +1 (z przodu) i czy ręce lecą do przodu. */
export function swingAt(t: number): { arm: number; forward: boolean } {
  const theta = ((t % SWING_MS) / SWING_MS) * 2 * Math.PI;
  return { arm: Math.round(Math.sin(theta) * 1000) / 1000, forward: Math.cos(theta) > 0 };
}

export type Timing = 'w-sam-raz' | 'za-wczesnie' | 'za-pozno' | 'bez';

export interface Jump {
  weights: boolean;
  metres: number;
  timing: Timing;
}

export function jump(weights: boolean, t: number): Jump {
  if (!weights) return { weights, metres: BASE_M, timing: 'bez' };
  const { arm, forward } = swingAt(t);
  const bonus = arm >= 0 ? BONUS_M * arm : PENALTY_M * arm;
  const metres = Math.round((BASE_M + bonus) * 100) / 100;
  const timing: Timing = arm >= 0.85 ? 'w-sam-raz' : forward ? 'za-wczesnie' : 'za-pozno';
  return { weights, metres, timing };
}

export const TIMING_TEXT: Record<Timing, string> = {
  'w-sam-raz': 'Odbicie w sam raz — ciężarki z przodu pociągnęły cię dalej.',
  'za-wczesnie': 'Za wcześnie — ręce jeszcze nie doleciały do przodu.',
  'za-pozno': 'Za późno — ręce już wracały do tyłu.',
  bez: 'Bez ciężarków — sam rozpęd nóg i rąk.',
};

export const formatM = (m: number) => m.toFixed(2).replace('.', ',') + ' m';

import type { LevelConfig } from '../data/levels';

export interface CustomerOrder {
  itemName: string;
  priceGr: number;
  paidGr: number;
  changeGr: number;
  patienceMs: number;
}

type Rng = () => number;

/** Towary na straganie — same nazwy, cena jest losowana osobno przez poziom. */
const ITEM_NAMES = [
  'Kosmiczny lizak',
  'Meteorytowa gumka',
  'Bilet na kometę',
  'Puszka gwiezdnego soku',
  'Antenka do skafandra',
  'Mapa galaktyki',
  'Sakiewka pyłu gwiezdnego',
  'Bilecik na orbitę',
  'Zestaw śrubek do UFO',
  'Kosmiczna czekolada',
  'Naklejka planety',
  'Latarka laserowa',
  'Kapsuła z nasionami',
  'Kubek na antygrawitację',
  'Skarpetki termiczne',
];

function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function pickSmallestAbove(candidates: readonly number[], value: number): number {
  const sorted = [...candidates].sort((a, b) => a - b);
  return sorted.find((c) => c > value) ?? sorted[sorted.length - 1];
}

export function patienceForRound(level: LevelConfig, roundIndex: number): number {
  return Math.max(level.patienceMinMs, level.patienceStartMs - level.decayPerRoundMs * roundIndex);
}

function generatePrice(level: LevelConfig, rng: Rng): number {
  const raw = randInt(rng, level.priceMinGr, level.priceMaxGr);
  return level.useGrosze ? roundToStep(raw, 5) : roundToStep(raw, 100);
}

export function generateOrder(
  level: LevelConfig,
  roundIndex: number,
  rng: Rng = Math.random,
  speedMultiplier = 1,
): CustomerOrder {
  const priceGr = generatePrice(level, rng);
  const paidGr = pickSmallestAbove(level.paymentNominals, priceGr);
  const itemName = ITEM_NAMES[randInt(rng, 0, ITEM_NAMES.length - 1)];
  return {
    itemName,
    priceGr,
    paidGr,
    changeGr: paidGr - priceGr,
    patienceMs: patienceForRound(level, roundIndex) * speedMultiplier,
  };
}

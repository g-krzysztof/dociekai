import type { LevelConfig, RoundKind } from '../data/levels';
import {
  ASYMMETRIC_SHAPES,
  BOKI_SHAPES,
  SHAPE_SIDES,
  SYMMETRIC_SHAPES,
  TYP_SHAPES,
  type CrystalVisual,
} from './shapes';

export interface BayOption {
  id: string;
  label: string;
}

export interface CrystalRound {
  kind: RoundKind;
  prompt: string;
  visual: CrystalVisual;
  bays: BayOption[];
  correctBayId: string;
  travelDurationMs: number;
}

type Rng = () => number;

function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

export function travelDurationForRound(level: LevelConfig, roundIndex: number): number {
  return Math.max(level.travelMinMs, level.travelStartMs - level.decayPerRoundMs * roundIndex);
}

const TYP_BAYS: BayOption[] = [
  { id: 'kolo', label: 'Koło' },
  { id: 'trojkat', label: 'Trójkąt' },
  { id: 'kwadrat', label: 'Kwadrat' },
  { id: 'prostokat', label: 'Prostokąt' },
];

const BOKI_BAYS: BayOption[] = [
  { id: '3', label: '3 boki' },
  { id: '4', label: '4 boki' },
  { id: '5', label: '5 boków' },
  { id: '6', label: '6 boków' },
];

const KAT_BAYS: BayOption[] = [
  { id: 'ostry', label: 'Kąt ostry' },
  { id: 'prosty', label: 'Kąt prosty' },
  { id: 'rozwarty', label: 'Kąt rozwarty' },
];

const SYMETRIA_BAYS: BayOption[] = [
  { id: 'tak', label: 'Ma symetrię' },
  { id: 'nie', label: 'Brak symetrii' },
];

interface RawRound {
  prompt: string;
  visual: CrystalVisual;
  bays: BayOption[];
  correctBayId: string;
}

function generateTypRound(rng: Rng): RawRound {
  const shapeId = pick(rng, TYP_SHAPES);
  return { prompt: 'Jaki to kształt?', visual: { kind: 'shape', shapeId }, bays: TYP_BAYS, correctBayId: shapeId };
}

function generateBokiRound(rng: Rng): RawRound {
  const shapeId = pick(rng, BOKI_SHAPES);
  const sides = SHAPE_SIDES[shapeId]!;
  return { prompt: 'Ile ma boków?', visual: { kind: 'shape', shapeId }, bays: BOKI_BAYS, correctBayId: String(sides) };
}

/** Bufory 15° wokół granic (75→90→105) — żeby żadna runda nie trafiła w wartość niejednoznaczną wzrokowo. */
function generateKatRound(rng: Rng): RawRound {
  const category = pick(rng, ['ostry', 'prosty', 'rozwarty'] as const);
  const degrees = category === 'prosty' ? 90 : category === 'ostry' ? randInt(rng, 20, 75) : randInt(rng, 105, 160);
  const mirrored = rng() < 0.5;
  return { prompt: 'Jaki to kąt?', visual: { kind: 'angle', degrees, mirrored }, bays: KAT_BAYS, correctBayId: category };
}

function generateSymetriaRound(rng: Rng): RawRound {
  const symmetric = rng() < 0.5;
  const shapeId = pick(rng, symmetric ? SYMMETRIC_SHAPES : ASYMMETRIC_SHAPES);
  return {
    prompt: 'Czy ta figura ma oś symetrii?',
    visual: { kind: 'shape', shapeId },
    bays: SYMETRIA_BAYS,
    correctBayId: symmetric ? 'tak' : 'nie',
  };
}

function generateForKind(kind: RoundKind, rng: Rng): RawRound {
  switch (kind) {
    case 'typ':
      return generateTypRound(rng);
    case 'boki':
      return generateBokiRound(rng);
    case 'kat':
      return generateKatRound(rng);
    case 'symetria':
      return generateSymetriaRound(rng);
  }
}

export function generateRound(
  level: LevelConfig,
  roundIndex: number,
  rng: Rng = Math.random,
  speedMultiplier = 1,
): CrystalRound {
  const kind = pick(rng, level.roundKinds);
  const raw = generateForKind(kind, rng);
  return { kind, ...raw, travelDurationMs: travelDurationForRound(level, roundIndex) * speedMultiplier };
}

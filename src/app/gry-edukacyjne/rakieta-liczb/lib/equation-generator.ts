import type { LevelConfig, LevelId } from '../data/levels';

export interface RoundResult {
  question: string;
  correctAnswer: number;
  options: [number, number, number];
  correctIndex: number;
  travelDurationMs: number;
}

type Rng = () => number;

function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function travelDurationForRound(level: LevelConfig, roundIndex: number): number {
  return Math.max(level.travelMinMs, level.travelStartMs - level.decayPerRoundMs * roundIndex);
}

/**
 * Próbuje kolejnych strategii "prawdopodobnego błędu", odrzuca duplikaty
 * (między sobą i z poprawną odpowiedzią) i dobija do 2 dystraktorów zawsze —
 * fallback jitter gwarantuje terminację nawet gdy wszystkie strategie się zdublują.
 */
function pickDistinctDistractors(
  correct: number,
  strategies: Array<() => number>,
  min = 0,
): [number, number] {
  const seen = new Set<number>([correct]);
  const results: number[] = [];

  for (const strategy of strategies) {
    if (results.length >= 2) break;
    const candidate = strategy();
    if (!seen.has(candidate) && candidate >= min) {
      seen.add(candidate);
      results.push(candidate);
    }
  }

  let jitter = 2;
  while (results.length < 2) {
    for (const sign of [1, -1]) {
      if (results.length >= 2) break;
      const candidate = correct + jitter * sign;
      if (!seen.has(candidate) && candidate >= min) {
        seen.add(candidate);
        results.push(candidate);
      }
    }
    jitter += 1;
  }

  return [results[0], results[1]];
}

/** Losuje pozycję poprawnej odpowiedzi na nowo co rundę — nigdy nie klastruje jej na jednym pasie. */
function assembleOptions(
  correct: number,
  distractors: [number, number],
  rng: Rng,
): { options: [number, number, number]; correctIndex: number } {
  const correctIndex = Math.floor(rng() * 3);
  const rest = [...distractors];
  const options = [0, 0, 0] as [number, number, number];
  for (let lane = 0; lane < 3; lane++) {
    options[lane] = lane === correctIndex ? correct : (rest.shift() as number);
  }
  return { options, correctIndex };
}

interface RawRound {
  question: string;
  correct: number;
  distractors: [number, number];
}

function generateStartRound(rng: Rng): RawRound {
  const isAddition = rng() < 0.5;
  let a: number, b: number, correct: number, op: '+' | '−';
  if (isAddition) {
    op = '+';
    a = randInt(rng, 1, 18);
    b = randInt(rng, 1, 20 - a);
    correct = a + b;
  } else {
    op = '−';
    a = randInt(rng, 2, 20);
    b = randInt(rng, 1, Math.max(1, a - 1));
    correct = a - b;
  }
  const distractors = pickDistinctDistractors(correct, [
    () => correct + 1,
    () => correct - 1,
    () => (isAddition ? Math.abs(a - b) : a + b),
  ]);
  return { question: `${a} ${op} ${b} = ?`, correct, distractors };
}

function generateTabliczkaRound(rng: Rng): RawRound {
  const isMultiplication = rng() < 0.5;
  if (isMultiplication) {
    const a = randInt(rng, 2, 10);
    const b = randInt(rng, 2, 10);
    const correct = a * b;
    const distractors = pickDistinctDistractors(correct, [
      () => a * (b + 1),
      () => a * Math.max(1, b - 1),
      () => a + b,
    ]);
    return { question: `${a} × ${b} = ?`, correct, distractors };
  }
  const divisor = randInt(rng, 2, 10);
  const quotient = randInt(rng, 2, 10);
  const dividend = divisor * quotient;
  const distractors = pickDistinctDistractors(quotient, [
    () => quotient + 1,
    () => Math.max(1, quotient - 1),
    () => divisor,
  ]);
  return { question: `${dividend} : ${divisor} = ?`, correct: quotient, distractors };
}

function swapTens(n: number): number {
  const s = Math.abs(n).toString();
  if (s.length !== 2) return n + 9;
  const swapped = parseInt(s[1] + s[0], 10);
  return swapped === n ? n + 9 : swapped;
}

function generateDwucyfroweRound(rng: Rng): RawRound {
  const kind = randInt(rng, 0, 2);
  if (kind === 0) {
    const a = randInt(rng, 10, 69);
    const b = randInt(rng, 10, 30);
    const correct = a + b;
    const distractors = pickDistinctDistractors(correct, [
      () => correct + 10,
      () => correct - 10,
      () => swapTens(correct),
    ]);
    return { question: `${a} + ${b} = ?`, correct, distractors };
  }
  if (kind === 1) {
    const a = randInt(rng, 30, 98);
    const b = randInt(rng, 10, a - 10);
    const correct = a - b;
    const distractors = pickDistinctDistractors(correct, [
      () => correct + 10,
      () => correct - 10,
      () => swapTens(correct),
    ]);
    return { question: `${a} − ${b} = ?`, correct, distractors };
  }
  const a = randInt(rng, 11, 39);
  const b = randInt(rng, 2, 9);
  const correct = a * b;
  const distractors = pickDistinctDistractors(correct, [
    () => a * (b + 1),
    () => (a + 10) * b,
    () => swapTens(correct),
  ]);
  return { question: `${a} × ${b} = ?`, correct, distractors };
}

/**
 * Cztery ręcznie napisane szablony wyrażeń — `correct` i `mistake` liczone
 * bezpośrednio z tych samych operandów wg wzoru, nigdy przez parsowanie
 * stringa ani eval(). `mistake` to zawsze konkretny, typowy błąd ucznia:
 * liczenie od lewej bez precedencji (dla wyrażeń bez nawiasów) albo
 * zastosowanie precedencji z pominięciem nawiasu (dla wyrażeń z nawiasami).
 */
const KOLEJNOSC_TEMPLATES: Array<(rng: Rng) => { text: string; correct: number; mistake: number }> = [
  (rng) => {
    const a = randInt(rng, 2, 9);
    const b = randInt(rng, 2, 9);
    const c = randInt(rng, 2, 9);
    return { text: `${a} + ${b} × ${c} = ?`, correct: a + b * c, mistake: (a + b) * c };
  },
  (rng) => {
    const a = randInt(rng, 2, 9);
    const b = randInt(rng, 3, 9);
    const c = randInt(rng, 2, b - 1);
    return { text: `${a} × ${b} − ${c} = ?`, correct: a * b - c, mistake: a * (b - c) };
  },
  (rng) => {
    const a = randInt(rng, 2, 9);
    const b = randInt(rng, 2, 9);
    const c = randInt(rng, 2, 9);
    return { text: `(${a} + ${b}) × ${c} = ?`, correct: (a + b) * c, mistake: a + b * c };
  },
  (rng) => {
    const a = randInt(rng, 5, 12);
    const b = randInt(rng, 2, a - 1);
    const c = randInt(rng, 2, 9);
    const d = randInt(rng, 2, 9);
    return { text: `(${a} − ${b}) × (${c} + ${d}) = ?`, correct: (a - b) * (c + d), mistake: a - b * c + d };
  },
];

function generateKolejnoscRound(rng: Rng): RawRound {
  const template = KOLEJNOSC_TEMPLATES[randInt(rng, 0, KOLEJNOSC_TEMPLATES.length - 1)];
  const { text, correct, mistake } = template(rng);
  const distractors = pickDistinctDistractors(correct, [
    () => mistake,
    () => correct + randInt(rng, 2, 6) * (rng() < 0.5 ? 1 : -1),
  ]);
  return { question: text, correct, distractors };
}

function generateForLevel(id: LevelId, rng: Rng): RawRound {
  switch (id) {
    case 'start':
      return generateStartRound(rng);
    case 'tabliczka':
      return generateTabliczkaRound(rng);
    case 'dwucyfrowe':
      return generateDwucyfroweRound(rng);
    case 'kolejnosc':
      return generateKolejnoscRound(rng);
  }
}

export function generateRound(
  level: LevelConfig,
  roundIndex: number,
  rng: Rng = Math.random,
  speedMultiplier = 1,
): RoundResult {
  const raw = generateForLevel(level.id, rng);
  const { options, correctIndex } = assembleOptions(raw.correct, raw.distractors, rng);
  return {
    question: raw.question,
    correctAnswer: raw.correct,
    options,
    correctIndex,
    travelDurationMs: travelDurationForRound(level, roundIndex) * speedMultiplier,
  };
}

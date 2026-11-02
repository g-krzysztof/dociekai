import type { LevelConfig, TaskKind } from '../data/levels';
import {
  randomFraction,
  randomTankCapacity,
  yieldsInteger,
  compareFractions,
  addFractions,
  formatFraction,
  extendToDenominator,
} from './fractions';

/** Ile litrów dolać — odpowiedź to liczba (poziom 1 i 3). */
export interface LitersRound {
  kind: 'liters';
  taskType: 'multiply' | 'add' | 'decimal';
  prompt: string;
  tankCapacity: number;
  /** Ułamek pomocniczy pokazywany przy rozstrzygnięciu (np. suma ułamków). */
  hintFraction?: { num: number; den: number };
  answer: number;
  /** Wartości na przyciskach do wyboru (poprawna + dystraktory), w losowej kolejności. */
  options: number[];
}

/** Dopisanie licznika przy zablokowanym mianowniku — rozszerzanie i dopełnianie (poziom 2). */
export interface NumeratorRound {
  kind: 'numerator';
  taskType: 'extend' | 'complete';
  prompt: string;
  baseNum: number;
  baseDen: number;
  targetDen: number;
  answer: number;
  options: number[];
}

/** Który zbiornik ma więcej paliwa — porównywanie (poziom 2). */
export interface CompareRound {
  kind: 'compare';
  taskType: 'compare';
  prompt: string;
  fractionA: { num: number; den: number };
  fractionB: { num: number; den: number };
  answer: 'A' | 'B' | 'equal';
}

export type FractionRound = LitersRound | NumeratorRound | CompareRound;
export type RoundAnswer = number | 'A' | 'B' | 'equal';

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function niceStep(value: number): number {
  const abs = Math.abs(value);
  if (abs <= 20) return 1;
  if (abs <= 100) return 5;
  if (abs <= 500) return 25;
  return 50;
}

/**
 * Próbuje kolejnych strategii "prawdopodobnego błędu" (np. dodanie liczników
 * i mianowników osobno), odrzuca duplikaty i te spoza zakresu, a dobija do
 * `count` dystraktorów jitterem wokół poprawnej odpowiedzi — fallback
 * gwarantuje terminację nawet gdy wszystkie strategie się zdublują.
 */
function pickDistinctDistractors(
  correct: number,
  strategies: Array<() => number>,
  count: number,
  min: number,
  max: number,
): number[] {
  const seen = new Set<number>([correct]);
  const results: number[] = [];

  for (const strategy of strategies) {
    if (results.length >= count) break;
    const candidate = Math.round(strategy());
    if (!seen.has(candidate) && candidate >= min && candidate <= max) {
      seen.add(candidate);
      results.push(candidate);
    }
  }

  const step = niceStep(correct);
  for (let jitter = 1; results.length < count && jitter * step <= max - min; jitter++) {
    for (const sign of [1, -1]) {
      if (results.length >= count) break;
      const candidate = correct + jitter * step * sign;
      if (!seen.has(candidate) && candidate >= min && candidate <= max) {
        seen.add(candidate);
        results.push(candidate);
      }
    }
  }

  return results;
}

/** Buduje listę przycisków: poprawna odpowiedź + dystraktory, w losowej kolejności. */
function buildOptions(
  correct: number,
  strategies: Array<() => number>,
  count: number,
  min: number,
  max: number,
): number[] {
  const distractors = pickDistinctDistractors(correct, strategies, Math.max(0, count - 1), min, max);
  return shuffle([correct, ...distractors]);
}

function generateMultiplyRound(optionCount: number): LitersRound {
  const fractions = [
    { num: 1, den: 2 },
    { num: 1, den: 3 },
    { num: 2, den: 3 },
    { num: 1, den: 4 },
    { num: 3, den: 4 },
    { num: 1, den: 5 },
    { num: 2, den: 5 },
    { num: 3, den: 5 },
    { num: 4, den: 5 },
    { num: 1, den: 8 },
    { num: 3, den: 8 },
    { num: 5, den: 8 },
    { num: 7, den: 8 },
    { num: 1, den: 10 },
    { num: 3, den: 10 },
    { num: 7, den: 10 },
    { num: 9, den: 10 },
  ];

  let tankCapacity: number;
  let fraction: (typeof fractions)[0];

  // Upewnij się, że wynik jest całkowity
  do {
    tankCapacity = randomTankCapacity();
    fraction = fractions[Math.floor(Math.random() * fractions.length)];
  } while (!yieldsInteger(fraction.num, fraction.den, tankCapacity));

  const answer = (tankCapacity * fraction.num) / fraction.den;
  const sliceValue = tankCapacity / fraction.den;

  return {
    kind: 'liters',
    taskType: 'multiply',
    prompt: `${formatFraction(fraction.num, fraction.den)} z ${tankCapacity} litrów`,
    tankCapacity,
    hintFraction: { num: fraction.num, den: fraction.den },
    answer,
    options: buildOptions(
      answer,
      [
        () => tankCapacity - answer, // dolał resztę zamiast żądanej części
        () => sliceValue, // policzył tylko jedną część zamiast fraction.num części
        () => (tankCapacity * fraction.den) / fraction.num, // zamienił licznik z mianownikiem
      ],
      optionCount,
      0,
      tankCapacity,
    ),
  };
}

function generateAddRound(optionCount: number): LitersRound {
  // Pary z mianownikami, które łatwo się dodają (wspólne wielokrotności)
  const fractionPairs = [
    { a: { num: 1, den: 4 }, b: { num: 1, den: 4 } },
    { a: { num: 1, den: 4 }, b: { num: 1, den: 2 } },
    { a: { num: 1, den: 3 }, b: { num: 1, den: 6 } },
    { a: { num: 1, den: 2 }, b: { num: 1, den: 4 } },
    { a: { num: 3, den: 8 }, b: { num: 1, den: 4 } },
    { a: { num: 1, den: 5 }, b: { num: 2, den: 5 } },
    { a: { num: 2, den: 5 }, b: { num: 1, den: 10 } },
    { a: { num: 1, den: 6 }, b: { num: 1, den: 3 } },
    { a: { num: 3, den: 10 }, b: { num: 1, den: 5 } },
    { a: { num: 2, den: 3 }, b: { num: 1, den: 6 } },
  ];

  const pair = fractionPairs[Math.floor(Math.random() * fractionPairs.length)];
  const sum = addFractions(pair.a.num, pair.a.den, pair.b.num, pair.b.den);

  // Pojemność musi być wielokrotnością mianownika sumy, żeby wynik był całkowity
  const rawCapacity = randomTankCapacity();
  const tankCapacity = Math.min(Math.ceil(rawCapacity / sum.den) * sum.den, 3000);
  const answer = (tankCapacity * sum.num) / sum.den;

  return {
    kind: 'liters',
    taskType: 'add',
    prompt: `${formatFraction(pair.a.num, pair.a.den)} + ${formatFraction(pair.b.num, pair.b.den)} z ${tankCapacity} litrów`,
    tankCapacity,
    hintFraction: sum,
    answer,
    options: buildOptions(
      answer,
      [
        // klasyczny błąd: dodał liczniki i mianowniki osobno, bez wspólnego mianownika
        () => (tankCapacity * (pair.a.num + pair.b.num)) / (pair.a.den + pair.b.den),
        () => (tankCapacity * pair.a.num) / pair.a.den, // policzył tylko pierwszy ułamek
        () => (tankCapacity * pair.b.num) / pair.b.den, // policzył tylko drugi ułamek
      ],
      optionCount,
      0,
      tankCapacity,
    ),
  };
}

function generateDecimalRound(optionCount: number): LitersRound {
  const decimalFractions = [
    { decimal: 0.25, fraction: { num: 1, den: 4 } },
    { decimal: 0.5, fraction: { num: 1, den: 2 } },
    { decimal: 0.75, fraction: { num: 3, den: 4 } },
    { decimal: 0.2, fraction: { num: 1, den: 5 } },
    { decimal: 0.4, fraction: { num: 2, den: 5 } },
    { decimal: 0.6, fraction: { num: 3, den: 5 } },
    { decimal: 0.8, fraction: { num: 4, den: 5 } },
    { decimal: 0.125, fraction: { num: 1, den: 8 } },
    { decimal: 0.375, fraction: { num: 3, den: 8 } },
    { decimal: 0.625, fraction: { num: 5, den: 8 } },
    { decimal: 0.875, fraction: { num: 7, den: 8 } },
    { decimal: 0.1, fraction: { num: 1, den: 10 } },
    { decimal: 0.3, fraction: { num: 3, den: 10 } },
    { decimal: 0.7, fraction: { num: 7, den: 10 } },
    { decimal: 0.9, fraction: { num: 9, den: 10 } },
  ];

  const entry = decimalFractions[Math.floor(Math.random() * decimalFractions.length)];
  const rawCapacity = randomTankCapacity();
  const tankCapacity = Math.min(Math.ceil(rawCapacity / entry.fraction.den) * entry.fraction.den, 3000);
  const answer = (tankCapacity * entry.fraction.num) / entry.fraction.den;

  // Losowo pokaż jako ułamek dziesiętny lub zwykły
  const showAsDecimal = Math.random() < 0.5;

  return {
    kind: 'liters',
    taskType: 'decimal',
    prompt: showAsDecimal
      ? `${entry.decimal} z ${tankCapacity} litrów`
      : `${formatFraction(entry.fraction.num, entry.fraction.den)} z ${tankCapacity} litrów`,
    tankCapacity,
    hintFraction: entry.fraction,
    answer,
    options: buildOptions(
      answer,
      [
        () => tankCapacity - answer, // dolał resztę zamiast żądanej części
        () => answer / 10, // przesunięty przecinek w jedną stronę
        () => answer * 10, // przesunięty przecinek w drugą stronę
      ],
      optionCount,
      0,
      tankCapacity,
    ),
  };
}

function generateExtendRound(optionCount: number): NumeratorRound {
  const base = randomFraction({ denMin: 2, denMax: 8, simplifiedOnly: true });
  // base.den <= 8, więc *2 zawsze mieści się w limicie 20 — lista nigdy nie jest pusta.
  const multipliers = [2, 3, 4, 5].filter((m) => base.den * m <= 20);
  const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
  const targetDen = base.den * multiplier;
  const answer = extendToDenominator(base.num, base.den, targetDen);

  return {
    kind: 'numerator',
    taskType: 'extend',
    prompt: `${formatFraction(base.num, base.den)} = ?/${targetDen}`,
    baseNum: base.num,
    baseDen: base.den,
    targetDen,
    answer,
    options: buildOptions(
      answer,
      [
        () => base.num, // zapomniał pomnożyć licznik przez tę samą liczbę
        () => targetDen - answer, // pomylił z dopełnieniem do całości
        () => base.den, // pomylił licznik z mianownikiem
      ],
      optionCount,
      0,
      targetDen,
    ),
  };
}

function generateCompleteRound(optionCount: number): NumeratorRound {
  const base = randomFraction({ denMin: 2, denMax: 12, simplifiedOnly: true });
  // Mianownik zostaje ten sam — dopełnienie do całości bez skracania.
  const answer = base.den - base.num;

  return {
    kind: 'numerator',
    taskType: 'complete',
    prompt: `Ile brakuje do pełnego zbiornika po ${formatFraction(base.num, base.den)}?`,
    baseNum: base.num,
    baseDen: base.den,
    targetDen: base.den,
    answer,
    options: buildOptions(
      answer,
      [
        () => base.num, // podał licznik zamiast brakującej części
        () => base.den, // podał cały mianownik
      ],
      optionCount,
      0,
      base.den,
    ),
  };
}

function generateCompareRound(): CompareRound {
  const a = randomFraction({ denMin: 2, denMax: 12 });
  const b = randomFraction({ denMin: 2, denMax: 12, exclude: [a] });

  const cmp = compareFractions(a.num, a.den, b.num, b.den);
  const answer: 'A' | 'B' | 'equal' = cmp === -1 ? 'B' : cmp === 1 ? 'A' : 'equal';

  return {
    kind: 'compare',
    taskType: 'compare',
    prompt: 'Który zbiornik ma więcej paliwa?',
    fractionA: a,
    fractionB: b,
    answer,
  };
}

/** Ile ms trwa runda na danym poziomie — maleje z każdą kolejną rundą, aż do minimum. */
export function travelDurationForRound(level: LevelConfig, roundIndex: number): number {
  return Math.max(level.travelMinMs, level.travelStartMs - level.decayPerRoundMs * roundIndex);
}

/** Losuje jedną rundę z rodzajów zadań dozwolonych na danym poziomie. */
export function generateRound(level: LevelConfig): FractionRound {
  const taskType: TaskKind = level.taskKinds[Math.floor(Math.random() * level.taskKinds.length)];
  switch (taskType) {
    case 'multiply':
      return generateMultiplyRound(level.answerOptions);
    case 'add':
      return generateAddRound(level.answerOptions);
    case 'decimal':
      return generateDecimalRound(level.answerOptions);
    case 'extend':
      return generateExtendRound(level.answerOptions);
    case 'complete':
      return generateCompleteRound(level.answerOptions);
    case 'compare':
      return generateCompareRound();
  }
}

/** Sprawdza odpowiedź gracza dla danej rundy. */
export function checkAnswer(round: FractionRound, answer: RoundAnswer): boolean {
  if (round.kind === 'compare') return answer === round.answer;
  return typeof answer === 'number' && answer === round.answer;
}

/** Zwraca tekst poprawnej odpowiedzi do wyświetlenia po błędzie/spóźnieniu. */
export function getCorrectAnswerText(round: FractionRound): string {
  switch (round.kind) {
    case 'liters':
      return `${round.answer} litrów`;
    case 'numerator':
      return `${round.answer}/${round.targetDen}`;
    case 'compare':
      if (round.answer === 'equal') return 'Ułamki są równe';
      return round.answer === 'A' ? 'Zbiornik A miał więcej' : 'Zbiornik B miał więcej';
  }
}

import type { LevelId } from '../data/levels';

export interface LevelBest {
  bestScore: number;
  bestCombo: number;
  bestRounds: number;
}

const EMPTY_BEST: LevelBest = { bestScore: 0, bestCombo: 0, bestRounds: 0 };

function storageKey(levelId: LevelId): string {
  return `dociekai:game-rakieta-liczb:level-${levelId}`;
}

export function readLevelBest(levelId: LevelId): LevelBest {
  if (typeof window === 'undefined') return EMPTY_BEST;
  try {
    const raw = window.localStorage.getItem(storageKey(levelId));
    if (!raw) return EMPTY_BEST;
    const parsed = JSON.parse(raw) as Partial<LevelBest>;
    return {
      bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
      bestCombo: typeof parsed.bestCombo === 'number' ? parsed.bestCombo : 0,
      bestRounds: typeof parsed.bestRounds === 'number' ? parsed.bestRounds : 0,
    };
  } catch {
    return EMPTY_BEST;
  }
}

/** Zapisuje wynik przebiegu, zwraca zaktualizowany rekord i czy to nowy rekord wyniku. */
export function writeRunResult(
  levelId: LevelId,
  run: { score: number; combo: number; rounds: number },
): { best: LevelBest; isNewHighScore: boolean } {
  const prev = readLevelBest(levelId);
  const isNewHighScore = run.score > prev.bestScore;
  const best: LevelBest = {
    bestScore: Math.max(prev.bestScore, run.score),
    bestCombo: Math.max(prev.bestCombo, run.combo),
    bestRounds: Math.max(prev.bestRounds, run.rounds),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(storageKey(levelId), JSON.stringify(best));
    } catch {
      /* zapis postępu jest opcjonalny — gra działa też bez localStorage */
    }
  }
  return { best, isNewHighScore };
}

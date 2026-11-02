export type SpeedOption = 'relaxed' | 'normal' | 'fast';

/** Mnożnik czasu rundy — większy = więcej czasu na policzenie odpowiedzi. */
export const SPEED_MULTIPLIERS: Record<SpeedOption, number> = {
  relaxed: 1.6,
  normal: 1,
  fast: 0.7,
};

export const SPEED_LABELS: Record<SpeedOption, string> = {
  relaxed: 'Spokojnie',
  normal: 'Normalnie',
  fast: 'Szybko',
};

const SPEED_KEY = 'dociekai:game-ulamkowa-stacja:speed';

export function readSpeed(): SpeedOption {
  if (typeof window === 'undefined') return 'normal';
  try {
    const raw = window.localStorage.getItem(SPEED_KEY);
    if (raw === 'relaxed' || raw === 'normal' || raw === 'fast') return raw;
  } catch {
    /* preferencja tempa jest opcjonalna — gra działa też bez zapisu */
  }
  return 'normal';
}

export function writeSpeed(speed: SpeedOption): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SPEED_KEY, speed);
  } catch {
    /* preferencja tempa jest opcjonalna — gra działa też bez zapisu */
  }
}

import type { Korpus } from '../korpus/types';

/**
 * Narzędzia czytania (E4c, zwrot 2026-10-19) —
 * zamiast nagrań lektora: linijka, rozmiar liter, odstępy i sylaby na żądanie.
 * Ustawienia to wygoda jednego czytelnika, więc żyją tylko w `localStorage`
 * tej przeglądarki (bez konta i bez serwera); brak magazynu = domyślne.
 */

export type TextSize = 0 | 1 | 2;

export interface ReadingSettings {
  size: TextSize;
  wide: boolean;
  ruler: boolean;
}

export const DEFAULT_READING: ReadingSettings = { size: 1, wide: false, ruler: false };

const KEY = 'dociekai:pol-czytanie';

export function loadReading(): ReadingSettings {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_READING;
    const v = JSON.parse(raw) as Partial<ReadingSettings>;
    return {
      size: v.size === 0 || v.size === 1 || v.size === 2 ? v.size : DEFAULT_READING.size,
      wide: typeof v.wide === 'boolean' ? v.wide : DEFAULT_READING.wide,
      ruler: typeof v.ruler === 'boolean' ? v.ruler : DEFAULT_READING.ruler,
    };
  } catch {
    return DEFAULT_READING;
  }
}

export function saveReading(s: ReadingSettings): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* tryb prywatny albo zablokowany magazyn — ustawienia tylko do końca wizyty */
  }
}

/** Klasy tekstu dla rozmiaru i odstępów. */
export function textClass(s: ReadingSettings): string {
  // `!` — `KorpusText` ma własne `text-base sm:text-lg`, które inaczej wygrywałoby na szerokim ekranie.
  const size = ['text-[16px]!', 'text-[18px]!', 'text-[21px]!'][s.size];
  return `${size} ${s.wide ? 'leading-[2.2]! tracking-[0.01em]' : 'leading-[1.75]!'}`;
}

function words(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;
}

/**
 * Koniec pierwszej części odcinka: ostatni akapit, po którym przeczytana jest
 * co najmniej jedna trzecia słów (i nie mniej niż 200). Zwraca indeks akapitu
 * w `korpus.blocks` i id ostatniego zdania; `null`, gdy odcinek jest krótki
 * (wtedy część = całość) albo pierwszy akapit już zjada ponad połowę.
 */
export function firstPart(k: Korpus): { block: number; unit: string } | null {
  const per = k.blocks.map((ids) => ids.reduce((sum, id) => sum + words(k.unitById[id].text), 0));
  const total = per.reduce((a, b) => a + b, 0);
  if (total < 450 || k.blocks.length < 3) return null;
  const goal = Math.max(200, total / 3);
  let acc = 0;
  for (let b = 0; b < k.blocks.length - 1; b++) {
    acc += per[b];
    if (acc >= goal) {
      if (acc > total * 0.6) return null;
      const ids = k.blocks[b];
      return { block: b, unit: ids[ids.length - 1] };
    }
  }
  return null;
}

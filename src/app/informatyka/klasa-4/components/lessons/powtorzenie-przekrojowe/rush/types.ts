import type { ComponentType } from 'react';

/**
 * Umowa mikro-gry z bloku „Rush roku”. Gra zna tylko własną planszę i **raz**
 * woła `finish` — czas, komunikat po grze i przejście dalej należą do ramki
 * (`rush-roku.tsx`). Dzięki temu dziewięć gier o dziewięciu różnych gestach
 * nie powtarza ani jednej linijki odmierzania czasu.
 */
export interface GameProps {
  /** `true` — zadanie wykonane; `false` — pomyłka. Kolejne wywołania są ignorowane. */
  finish: (won: boolean) => void;
  /** Ziarno wariantu — stałe w obrębie jednej próby, inne przy kolejnej. */
  seed: number;
}

export interface GameDef {
  id: string;
  /** Numer działu (0–8), z którego pochodzi umiejętność. */
  n: number;
  /** Okrzyk — dwa, trzy słowa. */
  cue: string;
  /** Jedno zdanie o tym, co jest do zrobienia. */
  how: string;
  seconds: number;
  /** Co było do zrobienia — pokazywane po pomyłce. */
  reveal: string;
  Game: ComponentType<GameProps>;
}

/** Deterministyczny „losowy” wybór z ziarna — bez `Math.random`, żeby SSR i klient się zgadzały. */
export const pick = <T,>(items: readonly T[], seed: number, offset = 0): T =>
  items[Math.abs(seed + offset) % items.length];

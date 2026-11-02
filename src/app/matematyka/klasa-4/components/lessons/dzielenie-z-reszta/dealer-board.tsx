'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface Token {
  key: string;
  column: number;
  row: number;
  isRemainder: boolean;
}

function buildTokens(total: number, groups: number): Token[] {
  const quotient = Math.floor(total / groups);
  const tokens: Token[] = [];
  for (let i = 0; i < total; i++) {
    const isRemainder = i >= quotient * groups;
    if (isRemainder) {
      tokens.push({ key: `t-${i}`, column: groups + 2, row: 2 + (i - quotient * groups), isRemainder: true });
    } else {
      tokens.push({ key: `t-${i}`, column: (i % groups) + 1, row: 2 + Math.floor(i / groups), isRemainder: false });
    }
  }
  return tokens;
}

export interface DealerBoardProps {
  total: number;
  groups: number;
  color: string;
  /** Gdy `false`, plansza pokazuje tylko puste grupy i tacę reszty — bez rozdanych żetonów. */
  dealt: boolean;
  ariaLabel: string;
  className?: string;
}

/**
 * Plansza rozdawania: `total` żetonów trafia po kolei (jak karty rozdawane
 * przy stole) do `groups` grup, a to, co nie starczyło na kolejną pełną
 * kolejkę, ląduje osobno w kolumnie "Reszta". Każdy żeton wjeżdża w swoje
 * docelowe miejsce z osobnym opóźnieniem (`delay: i * 0.045`) — pierwsza w
 * kursie choreografia, w której WIELE niezależnych elementów pojawia się
 * jeden po drugim, budując wrażenie fizycznego rozdawania, zamiast jednej
 * animowanej wartości (`RomanOdometer`) czy garstki żetonów przesuwających
 * się razem (`PlaceShiftBoard`). Sama plansza nie liczy nic — woła ją
 * caller, który już zna `total`/`groups`.
 */
export function DealerBoard({ total, groups, color, dealt, ariaLabel, className }: DealerBoardProps) {
  const quotient = Math.floor(total / groups);
  const remainder = total % groups;
  const maxRows = Math.max(quotient, remainder, 1);
  const tokens = dealt ? buildTokens(total, groups) : [];
  const remainderBg = 'color-mix(in oklch, #f59e0b 10%, white)';

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      <div
        className="grid gap-x-1 gap-y-1.5"
        style={{ gridTemplateColumns: `repeat(${groups}, minmax(0, 1fr)) 10px minmax(0, 1fr)` }}
      >
        {/* Tace grup i reszty w tle, rozciągnięte na wszystkie wiersze żetonów */}
        {Array.from({ length: groups }).map((_, b) => (
          <div
            key={`tray-${b}`}
            aria-hidden
            className="border"
            style={{ gridColumn: b + 1, gridRow: `2 / span ${maxRows}`, borderColor: `${color}33` }}
          />
        ))}
        <div
          aria-hidden
          className="border border-dashed"
          style={{
            gridColumn: groups + 2,
            gridRow: `2 / span ${maxRows}`,
            borderColor: '#f59e0b55',
            backgroundColor: remainderBg,
          }}
        />

        {/* Nagłówki */}
        {Array.from({ length: groups }).map((_, b) => (
          <span
            key={`label-${b}`}
            className="text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
            style={{ gridColumn: b + 1, gridRow: 1 }}
          >
            Grupa {b + 1}
          </span>
        ))}
        <span
          className="text-center text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400"
          style={{ gridColumn: groups + 2, gridRow: 1 }}
        >
          Reszta
        </span>

        {/* Żetony */}
        <AnimatePresence>
          {tokens.map((token, i) => (
            <motion.div
              key={token.key}
              initial={{ opacity: 0, y: -14, scale: 0.4 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ delay: i * 0.045, type: 'spring', stiffness: 380, damping: 22 }}
              className="mx-auto my-0.5 aspect-square w-[70%] rounded-full border-2"
              style={{
                gridColumn: token.column,
                gridRow: token.row,
                borderColor: token.isRemainder ? '#d97706' : color,
                backgroundColor: token.isRemainder ? '#f59e0b33' : `${color}33`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

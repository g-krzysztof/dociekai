'use client';

import { AnimatePresence, motion } from 'framer-motion';

const COLUMNS = 7;
const COLUMN_LABELS = [
  'jedności',
  'dziesiątki',
  'setki',
  'tysiące',
  'dzies. tys.',
  'setki tys.',
  'miliony',
];

/**
 * Pozycja kolumny w siatce CSS (1-indeksowana), z przerwami po klasie
 * tysięcy i po klasie milionów: [miliony] · [tysiące×3] · [jedności×3].
 */
function gridColumnOf(c: number): number {
  if (c === 6) return 1;
  return c >= 3 ? 8 - c : 9 - c;
}

interface Tile {
  key: string;
  char: string;
  isFiller: boolean;
}

/**
 * Rozkłada `base` na żetony-cyfry i przesuwa je o `exponent` kolumn rzędów
 * wielkości. Cyfry bazowej liczby trzymają stały klucz (`base-<rząd>`), więc
 * przy zmianie wykładnika ten sam żeton tylko zmienia kolumnę — to on się
 * animuje. Dopisane/skreślone zera dostają osobne klucze (`filler-<kolumna>`)
 * i tylko wjeżdżają/znikają, nie przesuwają się.
 */
function buildTiles(base: number, exponent: number): (Tile | null)[] {
  const baseDigits = String(Math.max(0, Math.floor(base)))
    .split('')
    .reverse();
  const tiles: (Tile | null)[] = [];
  for (let c = 0; c < COLUMNS; c++) {
    const baseColumn = c - exponent;
    if (baseColumn >= 0 && baseColumn < baseDigits.length) {
      tiles.push({ key: `base-${baseColumn}`, char: baseDigits[baseColumn], isFiller: false });
    } else if (exponent > 0 && c < exponent) {
      tiles.push({ key: `filler-${c}`, char: '0', isFiller: true });
    } else {
      tiles.push(null);
    }
  }
  return tiles;
}

export interface PlaceShiftBoardProps {
  base: number;
  exponent: number;
  color: string;
  ariaLabel: string;
  className?: string;
}

/**
 * Plansza rzędów wielkości: cyfry liczby bazowej jako osobne żetony na
 * siedmiu kolumnach (jedności…miliony, z przerwami między klasami). Przy
 * zmianie `exponent` żetony same przesuwają się do nowej kolumny — pozycję
 * liczy automatycznie `layout` z framer-motion (Framer mierzy poprzednie i
 * nowe miejsce w DOM i sam animuje przejście), inny mechanizm niż ręcznie
 * liczone `cx`/`cy`/`y` w `JumpLine` czy `RomanOdometer`. Nowe zera (dopisane
 * przy mnożeniu) czy skreślone zera (przy dzieleniu) wjeżdżają/znikają przez
 * `AnimatePresence` w tym samym miejscu, bez przeliczania pozycji
 * pozostałych cyfr.
 */
export function PlaceShiftBoard({ base, exponent, color, ariaLabel, className }: PlaceShiftBoardProps) {
  const tiles = buildTiles(base, exponent);
  const fillerBg = `color-mix(in oklch, ${color} 10%, white)`;

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      <div
        className="grid gap-x-1 gap-y-2"
        style={{
          gridTemplateColumns:
            'minmax(0, 1fr) 10px repeat(3, minmax(0, 1fr)) 10px repeat(3, minmax(0, 1fr))',
        }}
      >
        {/* Etykiety klas — rozpięte nad swoimi kolumnami */}
        <span
          className="text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
          style={{ gridColumn: '1 / span 1', gridRow: 1 }}
        >
          miliony
        </span>
        <span
          className="text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
          style={{ gridColumn: '3 / span 3', gridRow: 1 }}
        >
          tysiące
        </span>
        <span
          className="text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
          style={{ gridColumn: '7 / span 3', gridRow: 1 }}
        >
          jedności
        </span>

        {/* Rozdzielacze klas */}
        <div aria-hidden className="border-l border-dashed border-border" style={{ gridColumn: 2, gridRow: '1 / span 3' }} />
        <div aria-hidden className="border-l border-dashed border-border" style={{ gridColumn: 6, gridRow: '1 / span 3' }} />

        {/* Nagłówki kolumn (rzędy wielkości) */}
        {COLUMN_LABELS.map((label, c) => (
          <span
            key={label}
            className="self-end text-center text-[10px] leading-tight text-muted-foreground"
            style={{ gridColumn: gridColumnOf(c), gridRow: 2 }}
          >
            {label}
          </span>
        ))}

        {/* Żetony-cyfry */}
        <AnimatePresence mode="popLayout" initial={false}>
          {tiles.map(
            (tile, c) =>
              tile && (
                <motion.div
                  key={tile.key}
                  layout
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="flex aspect-square items-center justify-center border-2 font-mono text-lg font-black tabular-nums sm:text-2xl"
                  style={{
                    gridColumn: gridColumnOf(c),
                    gridRow: 3,
                    borderColor: tile.isFiller ? `${color}55` : color,
                    backgroundColor: tile.isFiller ? fillerBg : `${color}1a`,
                    color,
                  }}
                >
                  {tile.char}
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

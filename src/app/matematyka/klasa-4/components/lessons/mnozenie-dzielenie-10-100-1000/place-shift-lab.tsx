'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatWithClassSpaces } from '../../../lib/place-value';
import { PlaceShiftBoard } from './place-shift-board';
import { PowerDial } from './power-dial';

const PRESETS = [8, 250, 600, 4000];

/** Ile zer kończy liczbę — decyduje, przez ile potęg dziesięciu da się ją podzielić bez reszty. */
function trailingZeros(n: number): number {
  const digits = String(n).split('').reverse();
  let count = 0;
  while (count < digits.length - 1 && digits[count] === '0') count++;
  return count;
}

function miejsc(n: number): string {
  return n === 1 ? 'miejsce' : 'miejsca';
}

function zer(n: number): string {
  return n === 1 ? 'zero' : 'zera';
}

function captionFor(base: number, exponent: number): string {
  if (exponent === 0) return 'To liczba, od której zaczynasz. Przesuń suwak, żeby ją pomnożyć albo podzielić.';
  if (exponent > 0) {
    return `Każda cyfra przesunęła się o ${exponent} ${miejsc(exponent)} w lewo, a z prawej dopisało się ${exponent} ${zer(exponent)} — to mnożenie przez ${10 ** exponent}.`;
  }
  const abs = -exponent;
  return `Każda cyfra przesunęła się o ${abs} ${miejsc(abs)} w prawo, a z prawej zniknęło ${abs} ${zer(abs)} — to dzielenie przez ${10 ** abs}.`;
}

interface PlaceShiftLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: dziecko wybiera liczbę bazową i przeciąga `PowerDial`, żeby
 * na żywo zobaczyć w `PlaceShiftBoard`, jak mnożenie/dzielenie przez 10, 100
 * i 1000 przesuwa cyfry po rzędach wielkości. Ukończone, gdy dziecko
 * odwiedzi co najmniej 4 różne, niezerowe wykładniki — wśród siedmiu
 * możliwych (±1, ±2, ±3) to matematycznie wymusza użycie obu kierunków.
 */
export function PlaceShiftLab({ color, onComplete }: PlaceShiftLabProps) {
  const [base, setBase] = useState(PRESETS[0]);
  const [exponent, setExponent] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set());

  const zeros = trailingZeros(base);
  const disabledExponents = [-1, -2, -3].filter((e) => zeros < -e);
  const value = base * 10 ** exponent;

  const changeExponent = (next: number) => {
    setExponent(next);
    if (next === 0 || visited.has(next)) return;
    const updated = new Set(visited).add(next);
    setVisited(updated);
    if (updated.size >= 4) onComplete?.();
  };

  const pickBase = (next: number) => {
    setBase(next);
    setExponent(0);
  };

  const equation = useMemo(() => {
    if (exponent === 0) return formatWithClassSpaces(base);
    const symbol = exponent > 0 ? '×' : ':';
    const factor = 10 ** Math.abs(exponent);
    return `${formatWithClassSpaces(base)} ${symbol} ${factor.toLocaleString('pl-PL')} = ${formatWithClassSpaces(value)}`;
  }, [base, exponent, value]);

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => pickBase(preset)}
            className={cn(
              'border px-3 py-1.5 font-mono text-sm font-bold tabular-nums transition-all hover:-translate-y-0.5 hover:shadow-md',
              base === preset && 'text-white'
            )}
            style={base === preset ? { backgroundColor: color, borderColor: color } : undefined}
          >
            {preset.toLocaleString('pl-PL')}
          </button>
        ))}
      </div>

      <p
        className="mb-4 text-center font-mono text-2xl font-black tabular-nums sm:text-3xl"
        style={{ color }}
      >
        {equation}
      </p>

      <PlaceShiftBoard
        base={base}
        exponent={exponent}
        color={color}
        ariaLabel={`Plansza rzędów wielkości dla liczby ${base}, aktualnie ${equation}`}
        className="mx-auto mb-6 max-w-md"
      />

      <PowerDial value={exponent} onChange={changeExponent} color={color} disabled={disabledExponents} />

      {visited.size < 4 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Wypróbuj jeszcze {4 - visited.size} {visited.size === 3 ? 'inne ustawienie' : 'inne ustawienia'}{' '}
          suwaka (i mnożenie, i dzielenie), żeby zaliczyć ten krok.
        </p>
      )}

      {disabledExponents.length > 0 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Wyszarzone dzielenia są zablokowane — {base.toLocaleString('pl-PL')} nie ma na końcu tylu zer, żeby
          podzielić się bez reszty.
        </p>
      )}

      <motion.div
        key={captionFor(base, exponent)}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex items-start gap-3 p-4 text-sm leading-relaxed"
        style={{ backgroundColor: `${color}0f` }}
      >
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
        <p>{captionFor(base, exponent)}</p>
      </motion.div>
    </div>
  );
}

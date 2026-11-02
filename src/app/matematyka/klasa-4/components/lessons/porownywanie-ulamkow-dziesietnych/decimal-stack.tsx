'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Plus, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { DecimalNumeral } from '../../guides/zapis-dziesietny/decimal-numeral';
import {
  compareDecimals,
  decimalToNumber,
  formatDecimal,
  parseDecimal,
  type DecimalValue,
} from '../../../lib/decimal';

interface Round {
  /** Liczby w kolejności „jak wpadają” — celowo NIE posortowane. */
  cards: string[];
}

/**
 * Zestawy dobrane pod klasyczne pułapki porównywania:
 * — „więcej cyfr po przecinku = większa liczba” (0,65 vs 0,7; 0,506 na końcu),
 * — część całkowita rozstrzyga przed przecinkiem (2,1 vs 1,6 vs 0,84),
 * — ten sam początek, różnica dopiero w setnych/tysięcznych (1,53 vs 1,505).
 */
const ROUNDS: Round[] = [
  { cards: ['0,7', '0,65', '0,8', '0,58', '0,506'] },
  { cards: ['1,6', '1,53', '1,505', '0,84', '2,1'] },
];

const firstCard = (roundIndex: number): DecimalValue =>
  parseDecimal(ROUNDS[roundIndex].cards[0]);

interface DecimalStackProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka (flagship): dziecko buduje uporządkowaną wieżę — od największej
 * liczby na górze do najmniejszej na dole — wstawiając karty PO JEDNEJ w luki
 * rosnącej wieży. Wieża jest utrzymywana w stanie jako lista posortowana:
 * każde wstawienie jest sprawdzane jako porównanie z sąsiadami, a gdy karta
 * trafia nie na swoje miejsce, komunikat mówi dokładnie, które porównanie
 * sąsiadów się nie zgadza. Proporcjonalny pasek przy każdej liczbie pokazuje
 * na oko, że 0,7 to więcej niż 0,65 — mimo że „65” wygląda na więcej niż „7”.
 */
export function DecimalStack({ color, onComplete }: DecimalStackProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [placed, setPlaced] = useState<DecimalValue[]>(() => [firstCard(0)]);
  const [queueIndex, setQueueIndex] = useState(1);
  const [wrong, setWrong] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${queueIndex}-${finished}`);

  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];
  const values = useMemo(() => round.cards.map(parseDecimal), [round]);
  const scale = useMemo(
    () => Math.max(1, Math.ceil(Math.max(...values.map(decimalToNumber)) * 2) / 2),
    [values]
  );

  const incoming = values[queueIndex] as DecimalValue | undefined;
  const roundDone = incoming === undefined;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const tryInsert = (slot: number) => {
    if (!incoming) return;
    const above = placed[slot - 1];
    const below = placed[slot];

    if (above && compareDecimals(above, incoming) < 0) {
      setWrong(
        `${formatDecimal(incoming)} jest większe niż ${formatDecimal(above)} — musi stać wyżej.`
      );
      setShakeKey((k) => k + 1);
      return;
    }
    if (below && compareDecimals(incoming, below) < 0) {
      setWrong(
        `${formatDecimal(incoming)} jest mniejsze niż ${formatDecimal(below)} — musi stać niżej.`
      );
      setShakeKey((k) => k + 1);
      return;
    }

    setWrong(null);
    setPlaced((prev) => [...prev.slice(0, slot), incoming, ...prev.slice(slot)]);
    setQueueIndex((n) => n + 1);
  };

  const nextRound = () => {
    if (roundIndex + 1 < ROUNDS.length) {
      setPlaced([firstCard(roundIndex + 1)]);
      setQueueIndex(1);
      setWrong(null);
      setRoundIndex((i) => i + 1);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Masz wyczucie kolejności liczb z przecinkiem!</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Nie liczy się, ile cyfr jest po przecinku — liczy się część całkowita, a potem rzędy po
          kolei od lewej. Zaraz nazwiemy tę regułę dokładnie.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* Kropki rund */}
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{ROUNDS.length}
        </span>
      </div>

      {/* Liczba do ułożenia + polecenie */}
      {!roundDone && incoming ? (
        <div className="mb-5 border-2 p-3 sm:p-4" style={{ borderColor: color, backgroundColor: `${color}10` }}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
            Twoja liczba
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={`incoming-${roundIndex}-${queueIndex}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <CardRow value={incoming} scale={scale} color={color} highlighted />
            </motion.div>
          </AnimatePresence>
          <p className="mt-3 text-sm leading-relaxed">
            Kliknij pasek <strong style={{ color: textColor }}>„＋ wstaw tutaj”</strong> w wieży
            poniżej, w miejscu, gdzie ta liczba pasuje. Liczby mają iść{' '}
            <strong>od największej na górze do najmniejszej na dole</strong> — a dłuższy pasek to
            większa liczba.
          </p>
        </div>
      ) : (
        <div
          className="mb-5 flex items-center gap-2 border border-dashed p-3 text-sm text-muted-foreground"
          style={{ borderColor: `${color}59` }}
        >
          <Sparkles className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          Wszystkie liczby na miejscu — sprawdź kolejność poniżej.
        </div>
      )}

      {/* Wieża + pola do wstawiania */}
      <motion.div
        key={shakeKey}
        animate={shakeKey ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
            Wieża
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <ArrowUp className="h-3.5 w-3.5" aria-hidden /> większe u góry
          </span>
        </div>

        {!roundDone && <InsertSlot onClick={() => tryInsert(0)} color={color} />}
        {placed.map((value, i) => (
          <div key={`${formatDecimal(value)}-${i}`}>
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="my-1"
            >
              <CardRow value={value} scale={scale} color={color} />
            </motion.div>
            {!roundDone && <InsertSlot onClick={() => tryInsert(i + 1)} color={color} />}
          </div>
        ))}

        <div className="mt-2 flex justify-end">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <ArrowDown className="h-3.5 w-3.5" aria-hidden /> mniejsze na dole
          </span>
        </div>
      </motion.div>

      {wrong && !roundDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-3 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <ArrowDown className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            <strong>Nie tutaj. </strong>
            {wrong}
          </p>
        </motion.div>
      )}

      {roundDone && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <div
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 p-4 text-center"
            style={{ backgroundColor: `${color}0f` }}
          >
            {placed.map((value, i) => (
              <span key={`chain-${i}`} className="inline-flex items-center gap-2">
                {i > 0 && (
                  <span className="font-mono text-lg font-black" style={{ color }} aria-hidden>
                    &gt;
                  </span>
                )}
                <DecimalNumeral value={value} color={color} className="text-lg sm:text-xl" />
              </span>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={nextRound}>
              {roundIndex + 1 < ROUNDS.length ? 'Następny zestaw' : 'Zakończ'}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function InsertSlot({ onClick, color }: { onClick: () => void; color: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Wstaw liczbę w tym miejscu"
      className="my-1.5 flex w-full cursor-pointer items-center justify-center gap-1.5 border-2 border-dashed py-2 text-[11px] font-bold uppercase tracking-wide transition-colors hover:brightness-95"
      style={{
        borderColor: `${color}80`,
        backgroundColor: `${color}12`,
        color: `color-mix(in oklch, ${color} 88%, black)`,
      }}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
      wstaw tutaj
    </button>
  );
}

function CardRow({
  value,
  scale,
  color,
  highlighted = false,
}: {
  value: DecimalValue;
  scale: number;
  color: string;
  highlighted?: boolean;
}) {
  const pct = Math.min(100, (decimalToNumber(value) / scale) * 100);

  return (
    <div
      className={cn(
        'flex items-center gap-3 border p-2.5 sm:gap-4 sm:p-3',
        highlighted && 'border-2'
      )}
      style={{
        borderColor: highlighted ? color : `${color}40`,
        backgroundColor: highlighted ? `${color}12` : `${color}08`,
      }}
    >
      <DecimalNumeral
        value={value}
        color={color}
        className="w-[4.5rem] shrink-0 text-right text-xl sm:w-24 sm:text-2xl"
      />
      <div className="h-3.5 flex-1 overflow-hidden bg-black/5 dark:bg-white/10">
        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

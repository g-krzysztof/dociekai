'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Merge, Split } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { FractionNotation } from '../../fraction-notation';
import { FractionBarGlyph } from '../../fraction-bar-glyph';

/** Powyżej tylu odcinków pasek przestaje być czytelny — mnożenie ponad ten próg jest zablokowane. */
const MAX_DENOMINATOR = 24;
const FACTORS = [2, 3, 4] as const;

interface Fraction {
  licznik: number;
  mianownik: number;
}

export interface SplitFoldRound {
  id: string;
  label: string;
  start: Fraction;
  target: Fraction;
  /** Zdanie podsumowujące, co się właśnie stało — pokazywane po dojściu do celu. */
  note: string;
}

interface ChainStep {
  op: string;
  value: Fraction;
}

interface SplitFoldBoardProps {
  color: string;
  rounds: SplitFoldRound[];
  onComplete?: () => void;
}

function fillSet(licznik: number): Set<number> {
  return new Set(Array.from({ length: licznik }, (_, i) => i));
}

/**
 * Flagowy mechanizm lekcji. Jeden pasek, dwie operacje: **podziel każdy
 * kawałek na k** (×k) i **połącz kawałki po k** (÷k). Obie przemalowują pasek,
 * ale ZAMALOWANA ILOŚĆ ZOSTAJE TA SAMA — dowodzi tego drugi, niepodzielony
 * pasek pod spodem, który nie drgnie przez całą rundę. To pierwszy widżet
 * w kursie, w którym operacja przekształca wszystkie części naraz przy
 * zachowanym niezmienniku (`FractionBar` też zmienia mianownik, ale kasuje
 * przy tym licznik — tutaj wartość jest właśnie tym, co się nie zmienia).
 *
 * Przyciski ÷k są zawsze klikalne: przy niepodzielnej parze liczb dają shake
 * i wyjaśnienie („8 nie dzieli się przez 3 bez reszty"), zamiast być martwe —
 * to właśnie ten komunikat uczy, kiedy skracanie jest w ogóle możliwe
 * (zasada „żaden klik nie jest złym kliknięciem"). Blokowane są tylko ×k,
 * które wyprowadziłyby mianownik poza `MAX_DENOMINATOR`.
 */
export function SplitFoldBoard({ color, rounds, onComplete }: SplitFoldBoardProps) {
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState<Fraction>(() => rounds[0].start);
  const [chain, setChain] = useState<ChainStep[]>([]);
  const [refused, setRefused] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const containerRef = useSectionScrollAnchor(index);

  const round = rounds[index] ?? rounds[rounds.length - 1];
  const isLast = index === rounds.length - 1;
  const matched = current.licznik === round.target.licznik && current.mianownik === round.target.mianownik;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const ratio = current.licznik / current.mianownik;

  const apply = (op: string, value: Fraction) => {
    setRefused(null);
    setChain((prev) => [...prev, { op, value }]);
    setCurrent(value);
  };

  const refuse = (message: string) => {
    setRefused(message);
    setShakeKey((prev) => prev + 1);
  };

  const split = (k: number) => {
    if (matched) return;
    if (current.mianownik * k > MAX_DENOMINATOR) {
      refuse(`Po podzieleniu na ${k} kawałków byłoby ich ${current.mianownik * k} — za dużo, żeby zmieściły się na pasku.`);
      return;
    }
    apply(`×${k}`, { licznik: current.licznik * k, mianownik: current.mianownik * k });
  };

  const merge = (k: number) => {
    if (matched) return;
    if (current.licznik % k !== 0 || current.mianownik % k !== 0) {
      const guilty = current.licznik % k !== 0 ? current.licznik : current.mianownik;
      refuse(`${guilty} nie dzieli się przez ${k} bez reszty — żeby połączyć kawałki po ${k}, obie liczby ułamka muszą się przez ${k} dzielić.`);
      return;
    }
    apply(`÷${k}`, { licznik: current.licznik / k, mianownik: current.mianownik / k });
  };

  const next = () => {
    if (!isLast) {
      const nextRound = rounds[index + 1];
      setIndex(index + 1);
      setCurrent(nextRound.start);
      setChain([]);
      setRefused(null);
      return;
    }
    onComplete?.();
  };

  if (index >= rounds.length) return null;

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {rounds.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{rounds.length}
        </span>
      </div>

      <p className="mb-5 text-sm font-semibold leading-relaxed sm:text-base">{round.label}</p>

      <div className="grid gap-6 md:grid-cols-[1fr_150px] md:items-center">
        <div>
          {/* Pasek, który się przedziela */}
          <motion.div key={current.mianownik} initial={{ opacity: 0.45 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <FractionBarGlyph
              color={color}
              mianownik={current.mianownik}
              filled={fillSet(current.licznik)}
              ariaLabel={`Pasek podzielony na ${current.mianownik} równych części, zamalowane ${current.licznik}`}
            />
          </motion.div>

          {/* Niezmiennik — ta sama ilość, bez podziałek */}
          <div className="mt-3">
            <div className="h-4 w-full" style={{ backgroundColor: `${color}14` }}>
              <div className="h-full" style={{ width: `${Math.round(ratio * 10000) / 100}%`, backgroundColor: `${color}b3` }} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Ten pasek pokazuje, ile tego jest — i nie drgnie, cokolwiek zrobisz wyżej.
            </p>
          </div>

          {/* Łańcuch przekształceń */}
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm tabular-nums">
            <span className="font-bold" style={{ color: textColor }}>
              {round.start.licznik}/{round.start.mianownik}
            </span>
            {chain.map((step, i) => (
              <span key={`${step.op}-${i}`} className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color }}>
                  {step.op}
                </span>
                <span className="font-bold" style={{ color: textColor }}>
                  {step.value.licznik}/{step.value.mianownik}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <FractionNotation licznik={current.licznik} mianownik={current.mianownik} color={color} licznikRevealed mianownikRevealed size="md" />
          <p className="text-center text-xs text-muted-foreground">
            Cel: {round.target.licznik}/{round.target.mianownik}
          </p>
        </div>
      </div>

      <motion.div
        key={`ops-${shakeKey}`}
        animate={refused ? { x: [0, -7, 7, -7, 7, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-6 grid gap-4 sm:grid-cols-2"
      >
        <OpGroup
          color={color}
          icon={<Split className="h-4 w-4" aria-hidden />}
          title="Podziel każdy kawałek na…"
          disabled={matched}
          prefix="×"
          onPick={split}
          isBlocked={(k) => current.mianownik * k > MAX_DENOMINATOR}
        />
        <OpGroup
          color={color}
          icon={<Merge className="h-4 w-4" aria-hidden />}
          title="Połącz kawałki po…"
          disabled={matched}
          prefix="÷"
          onPick={merge}
          isBlocked={() => false}
        />
      </motion.div>

      <AnimatePresence>
        {refused && !matched && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center text-sm leading-relaxed text-muted-foreground"
          >
            {refused}
          </motion.p>
        )}
      </AnimatePresence>

      {matched && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex flex-wrap items-center justify-between gap-4 bg-emerald-50 p-4 dark:bg-emerald-950/40"
        >
          <p className="flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            <span>{round.note}</span>
          </p>
          <Button onClick={next} style={{ backgroundColor: color }} className="gap-1.5 text-white hover:opacity-90">
            {isLast ? 'Dalej' : 'Kolejne zadanie'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

interface OpGroupProps {
  color: string;
  icon: ReactNode;
  title: string;
  prefix: string;
  disabled: boolean;
  onPick: (k: number) => void;
  isBlocked: (k: number) => boolean;
}

function OpGroup({ color, icon, title, prefix, disabled, onPick, isBlocked }: OpGroupProps) {
  return (
    <div className="border p-4" style={{ borderColor: `${color}33` }}>
      <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
        {icon}
        {title}
      </p>
      <div className="flex gap-2">
        {FACTORS.map((k) => {
          const blocked = isBlocked(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => onPick(k)}
              disabled={disabled || blocked}
              className={cn(
                'h-12 flex-1 border-2 font-mono text-lg font-black transition-all disabled:cursor-not-allowed disabled:opacity-40',
                !disabled && !blocked && 'hover:-translate-y-0.5 hover:shadow-md'
              )}
              style={{ borderColor: `${color}55`, color }}
            >
              {prefix}
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}

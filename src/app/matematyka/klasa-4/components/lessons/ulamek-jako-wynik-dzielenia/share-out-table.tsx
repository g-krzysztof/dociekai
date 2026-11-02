'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Scissors, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { FractionBarGlyph } from '../../fraction-bar-glyph';
import { FractionNotation } from '../../fraction-notation';
import { toMixed, formatMixed } from '../../../lib/mixed-number';

export interface ShareRound {
  id: string;
  /** Ile takich samych przedmiotów mamy do podziału. */
  items: number;
  /** Między ile osób dzielimy. */
  people: number;
  /** Gotowa fraza „3 czekolady” — dane niosą polską odmianę, kod jej nie skleja. */
  itemsLabel: string;
  /** Gotowe pytanie „Na ile równych części pokroić każdą czekoladę?”. */
  cutQuestion: string;
  label: string;
  /** Do wyboru: część liczb dzieli się przez liczbę osób, część nie — i to jest sedno zadania. */
  cutOptions: number[];
  note: string;
}

interface ShareOutTableProps {
  color: string;
  rounds: ShareRound[];
  onComplete?: () => void;
}

function fullSet(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

/** Polska odmiana po „po …”: liczba pojedyncza tylko dla jedynki, dalej miejscownik mnogi. */
function piecesLabel(count: number): string {
  return count === 1 ? 'jednym kawałku' : `${count} kawałkach`;
}

/**
 * Flagowy mechanizm lekcji „ułamek jako wynik dzielenia”. Dziecko nie
 * rozwiązuje działania — decyduje, **na ile części pokroić każdy przedmiot**,
 * a dopiero potem próbuje rozdać kawałki po równo. Wybór, który nie dzieli
 * się przez liczbę osób, kończy się odmową i konkretnym zdaniem dlaczego
 * (ta sama zasada co odmowy w `SplitFoldBoard`: komunikat JEST treścią
 * nauczaną). Każdy poprawny wybór rozdaje każdej osobie tyle samo kawałków
 * z KAŻDEGO przedmiotu — i to jest wizualny dowód, że `a : b = a/b`.
 *
 * Nowość względem biblioteki: to pierwszy widżet, w którym dziecko ustawia
 * parametr, którego zgodność z drugim parametrem decyduje o wykonalności
 * działania, i w którym **kilka różnych poprawnych wyborów daje tę samą
 * wartość** (pokroić na 4 albo na 8 przy 4 osobach) — czyli przy okazji
 * wraca rozszerzanie ułamka z poprzedniej lekcji.
 */
export function ShareOutTable({ color, rounds, onComplete }: ShareOutTableProps) {
  const [index, setIndex] = useState(0);
  const [cut, setCut] = useState<number | null>(null);
  const [dealt, setDealt] = useState(false);
  const [refused, setRefused] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const containerRef = useSectionScrollAnchor(index);

  const round = rounds[index] ?? rounds[rounds.length - 1];
  const isLast = index === rounds.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  /** Ile kawałków z jednego przedmiotu przypada na jedną osobę. Ułamkowe = podziału nie da się wykonać. */
  const perPersonFromEachItem = cut !== null ? cut / round.people : 0;
  const canDeal = cut !== null && cut % round.people === 0;
  const perPersonTotal = canDeal ? round.items * perPersonFromEachItem : 0;
  const share = toMixed(round.items, round.people);

  const pickCut = (value: number) => {
    if (dealt) return;
    setCut(value);
    setRefused(null);
  };

  const deal = () => {
    if (cut === null || dealt) return;
    if (!canDeal) {
      setRefused(
        `Krojenie na ${cut} części przy ${round.people} osobach nie zadziała — ${cut} nie dzieli się przez ${round.people} bez reszty, więc kawałki nie rozejdą się po równo. Spróbuj innego krojenia.`
      );
      setShakeKey((prev) => prev + 1);
      return;
    }
    setDealt(true);
  };

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setCut(null);
      setDealt(false);
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

      {/* Przedmioty do podziału — pokrojone dokładnie tak, jak wybrało dziecko */}
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
        <Scissors className="h-4 w-4" aria-hidden />
        Do podziału: {round.itemsLabel}
      </div>

      <div className="border p-3" style={{ borderColor: `${color}33` }}>
        {/* Pasek ma stały viewBox 320×70, więc na pełnej szerokości kontenera urósłby
            do kilkuset pikseli wysokości — trzy takie bloki zjadłyby cały ekran. */}
        <div className="mx-auto max-w-sm space-y-3">
          {Array.from({ length: round.items }, (_, i) => (
            <FractionBarGlyph
              key={`item-${i}-${cut ?? 1}`}
              color={color}
              mianownik={cut ?? 1}
              filled={fullSet(cut ?? 1)}
              ariaLabel={cut === null ? `Sztuka ${i + 1}, jeszcze w całości` : `Sztuka ${i + 1} pokrojona na ${cut} równych części`}
            />
          ))}
        </div>
      </div>

      {/* Wybór krojenia */}
      <div className="mt-5 border p-4" style={{ borderColor: `${color}33` }}>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
          {round.cutQuestion}
        </p>
        <motion.div
          key={`cuts-${shakeKey}`}
          animate={refused ? { x: [0, -7, 7, -7, 7, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-wrap gap-2"
        >
          {round.cutOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => pickCut(option)}
              disabled={dealt}
              aria-pressed={cut === option}
              className={cn(
                'h-12 min-w-[64px] flex-1 border-2 font-mono text-lg font-black transition-all disabled:cursor-not-allowed disabled:opacity-50',
                !dealt && 'hover:-translate-y-0.5 hover:shadow-md'
              )}
              style={
                cut === option
                  ? { borderColor: color, backgroundColor: `${color}1f`, color }
                  : { borderColor: `${color}55`, color }
              }
            >
              {option}
            </button>
          ))}
        </motion.div>

        {cut !== null && !dealt && (
          <div className="mt-4 flex justify-end">
            <Button onClick={deal} style={{ backgroundColor: color }} className="gap-1.5 text-white hover:opacity-90">
              <Users className="h-4 w-4" aria-hidden />
              Rozdaj {round.people} osobom
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {refused && !dealt && (
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

      {/* Talerze — każda osoba dostaje po tyle samo kawałków z KAŻDEGO przedmiotu */}
      {dealt && cut !== null && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
            Talerze
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: round.people }, (_, personIndex) => (
              <motion.div
                key={`plate-${personIndex}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: personIndex * 0.12, duration: 0.3 }}
                className="border p-3"
                style={{ borderColor: `${color}55` }}
              >
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Osoba {personIndex + 1}</p>
                <div className="mx-auto max-w-[280px] space-y-3">
                  {Array.from({ length: round.items }, (_, itemIndex) => (
                    <FractionBarGlyph
                      key={`plate-${personIndex}-item-${itemIndex}`}
                      color={color}
                      mianownik={cut}
                      filled={fullSet(perPersonFromEachItem)}
                      ariaLabel={`Z ${itemIndex + 1}. przedmiotu: ${perPersonFromEachItem} z ${cut} części`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {`Po ${piecesLabel(perPersonFromEachItem)} z każdej z ${round.items} sztuk — razem ${perPersonTotal}/${cut}.`}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Odczyt: dzielenie i ułamek to jedno i to samo */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border p-4" style={{ borderColor: `${color}33` }}>
            <span className="font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>
              {round.items} : {round.people}
            </span>
            <span className="font-mono text-2xl font-black" style={{ color }} aria-hidden>
              =
            </span>
            <FractionNotation licznik={round.items} mianownik={round.people} color={color} size="md" />
            {cut !== round.people && (
              <>
                <span className="font-mono text-2xl font-black" style={{ color }} aria-hidden>
                  =
                </span>
                <FractionNotation licznik={perPersonTotal} mianownik={cut} color={color} size="md" />
              </>
            )}
            {share.whole > 0 && (
              <>
                <span className="font-mono text-2xl font-black" style={{ color }} aria-hidden>
                  =
                </span>
                <span className="font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>
                  {formatMixed(share)}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {dealt && (
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
            {isLast ? 'Dalej' : 'Kolejny podział'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

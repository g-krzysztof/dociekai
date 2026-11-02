'use client';

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Ramka jednej części testu końcowego: kropki postępu, jedno zadanie naraz,
 * „Dalej” dopiero po sprawdzeniu i krótkie podsumowanie części.
 *
 * Zadanie samo pilnuje swojej planszy i **raz** woła `onDone(ok)`; ramka niczego
 * o nim nie wie. Dzięki temu cztery części o czterech różnych gestach (kot
 * przeciągany po siatce, wpisywana formuła, styl nadany akapitowi, hasło
 * złożone z klocków) dzielą jedną mechanikę zaliczania.
 *
 * Test jest **jedną próbą**: zadanie po sprawdzeniu się blokuje i pokazuje, co
 * było do zrobienia. Nie jest to kara — to ten sam wzorzec „konsekwencja zamiast
 * oceny”, tylko bez replaya, bo replay zamieniłby test w ćwiczenie i wynik
 * przestałby coś mierzyć.
 */

export interface ItemProps {
  color: string;
  /** Wołane dokładnie raz, po sprawdzeniu. */
  onDone: (ok: boolean) => void;
}

export interface PartItem {
  id: string;
  /** Tytuł zadania — pojawia się w podsumowaniu części. */
  title: string;
  Item: ComponentType<ItemProps>;
}

export function PartFrame({
  color,
  items,
  onScore,
  onComplete,
}: {
  color: string;
  items: PartItem[];
  /** `null` przy starcie i po resecie bloku; liczba dobrych zadań po skończeniu części. */
  onScore: (score: number | null) => void;
  onComplete?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>(() => items.map(() => null));
  const [summary, setSummary] = useState(false);
  const reported = useRef(false);
  const scoreRef = useRef(onScore);
  scoreRef.current = onScore;

  useEffect(() => {
    scoreRef.current(null);
  }, []);

  const current = results[index];
  const item = items[index];

  const done = (ok: boolean) => {
    setResults((prev) => prev.map((value, i) => (i === index ? ok : value)));
  };

  const next = () => {
    if (index + 1 < items.length) {
      setIndex(index + 1);
      return;
    }
    setSummary(true);
    if (!reported.current) {
      reported.current = true;
      onScore(results.filter(Boolean).length);
      onComplete?.();
    }
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <ol className="mb-4 flex items-center gap-2" aria-label="Postęp części">
        {items.map((entry, i) => {
          const result = results[i];
          return (
            <li key={entry.id} className="flex items-center gap-2">
              <span
                className={cn(
                  'grid h-7 min-w-7 place-items-center px-1 text-xs font-bold text-white',
                  result === true ? 'bg-emerald-600' : result === false ? 'bg-rose-600' : i === index && !summary ? '' : 'bg-slate-300 dark:bg-zinc-700'
                )}
                style={i === index && !summary && result === null ? { backgroundColor: color } : undefined}
                aria-label={`Zadanie ${i + 1}: ${result === true ? 'dobrze' : result === false ? 'źle' : 'do zrobienia'}`}
              >
                {result === true ? <Check className="h-4 w-4" strokeWidth={3.5} /> : result === false ? <X className="h-4 w-4" strokeWidth={3.5} /> : i + 1}
              </span>
              {i < items.length - 1 && <span className="h-0.5 w-5 bg-border" aria-hidden />}
            </li>
          );
        })}
      </ol>

      {summary ? (
        <div>
          <p className="text-lg font-bold">
            Ta część: {results.filter(Boolean).length} z {items.length}.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {items.map((entry, i) => (
              <li key={entry.id} className="flex items-center gap-2">
                {results[i] ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <X className="h-4 w-4 text-rose-600" aria-hidden />}
                {entry.title}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Wynik zostaje zapisany — zobaczysz go w podsumowaniu testu.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={item.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Zadanie {index + 1} z {items.length}
            </p>
            <item.Item color={color} onDone={done} />
            {current !== null && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 px-6 text-sm font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {index + 1 < items.length ? 'Dalej →' : 'Zobacz wynik części →'}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

/**
 * Pasek sprawdzania pod zadaniem: przycisk „Sprawdź” (nieaktywny, dopóki
 * zadanie nie jest gotowe do sprawdzenia) i, po sprawdzeniu, werdykt z wyjaśnieniem.
 */
export function CheckBar({
  ready,
  checked,
  ok,
  onCheck,
  explain,
  color,
  readyHint = 'Zrób zadanie, potem sprawdź.',
}: {
  ready: boolean;
  checked: boolean;
  ok: boolean;
  onCheck: () => void;
  explain: ReactNode;
  color: string;
  readyHint?: string;
}) {
  return (
    <div className="mt-4" aria-live="polite">
      {!checked ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onCheck}
            disabled={!ready}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: color }}
          >
            Sprawdź
          </button>
          {!ready && <span className="text-xs text-muted-foreground">{readyHint}</span>}
        </div>
      ) : (
        <div className={cn('border px-3 py-2.5 text-sm leading-snug', ok ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-rose-500/50 bg-rose-500/10')}>
          <p className="flex items-center gap-2 font-bold">
            {ok ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <X className="h-4 w-4 text-rose-600" aria-hidden />}
            {ok ? 'Dobrze.' : 'Nie tym razem.'}
          </p>
          <div className="mt-1">{explain}</div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Check, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { STEPS, runRecipe, type Step } from './recipe';

/**
 * Symulator — **maszyna, która naprawdę próbuje wykonać twój przepis**.
 *
 * Kolejność kroków sprawdzamy wykonaniem, nie porównaniem z wzorcem: każdy krok
 * ma warunki wstępne i skutki (`needs` / `gives` w `recipe.ts`), a `runRecipe()`
 * idzie po liście i zatrzymuje się na pierwszym kroku, którego nie da się
 * zrobić. Dwie konsekwencje, obie ważne:
 *  - **poprawnych kolejności jest więcej niż jedna** (mycie truskawek i obieranie
 *    banana są od siebie niezależne), więc dziecko nie zgaduje jednego układu
 *    wpisanego do danych, tylko szuka układu wykonalnego;
 *  - **komunikat o błędzie jest konkretny i śmieszny** („włączasz blender, a w
 *    środku pusto”), bo powstaje z tego, czego w danym momencie brakuje.
 *
 * To jest zapowiedziany w programie most do modułu 5: przepis to
 * algorytm, a komputer wykonuje go dosłownie — łącznie z głupotami.
 *
 * Przesuwanie strzałkami, nie przeciąganiem: lista ma być obsługiwalna palcem na
 * telefonie i klawiaturą, a nic tu nie udaje przeciągalnego.
 */

interface StepShuffleProps {
  color: string;
  onComplete?: () => void;
}

export function StepShuffle({ color, onComplete }: StepShuffleProps) {
  const [order, setOrder] = useState<Step[]>(STEPS);
  const [result, setResult] = useState<ReturnType<typeof runRecipe> | null>(null);
  const [runs, setRuns] = useState(0);

  const reported = useRef(false);
  const solved = result?.failedAt === -1;
  const anchorRef = useSectionScrollAnchor(solved ? 'gotowe' : 'praca');

  useEffect(() => {
    if (!solved || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [solved, onComplete]);

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= order.length || solved) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    setResult(null);
  };

  const run = () => {
    setResult(runRecipe(order));
    setRuns(runs + 1);
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Kroki przepisu pomieszały się. Ustaw je tak, żeby dało się je wykonać po kolei.
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        Potem naciśnij „Wykonaj przepis” — kucharz zrobi dokładnie to, co napisałeś/napisałaś, i
        dokładnie w tej kolejności.
      </p>

      <ol className="space-y-1.5">
        {order.map((step, i) => {
          const failed = result?.failedAt === i;
          const passed = result != null && (result.failedAt === -1 || i < result.failedAt);
          return (
            <li
              key={step.id}
              className={cn(
                'flex items-center gap-2 border-2 bg-white p-2 dark:bg-zinc-900',
                failed && 'border-amber-500'
              )}
              style={!failed ? { borderColor: passed ? color : `${color}33` } : undefined}
            >
              <span
                className="w-6 shrink-0 text-center font-mono text-sm font-bold tabular-nums"
                style={{ color }}
              >
                {passed && !failed ? <Check className="mx-auto h-4 w-4" aria-hidden /> : i + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm sm:text-base">{step.text}</span>
              <span className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || solved}
                  aria-label={`Przesuń krok „${step.text}” wyżej`}
                  className="flex h-8 w-8 items-center justify-center border disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === order.length - 1 || solved}
                  aria-label={`Przesuń krok „${step.text}” niżej`}
                  className="flex h-8 w-8 items-center justify-center border disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      {!solved && (
        <button
          type="button"
          onClick={run}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          <Play className="h-4 w-4" aria-hidden />
          Wykonaj przepis
        </button>
      )}

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={`${result.failedAt}-${runs}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'mt-4 p-3',
              result.failedAt >= 0 && 'border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30'
            )}
            style={result.failedAt === -1 ? { backgroundColor: `${color}14` } : undefined}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              {result.failedAt === -1 && (
                <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              )}
              <span>
                {result.failedAt >= 0 && (
                  <strong>Zatrzymało się na kroku {result.failedAt + 1}. </strong>
                )}
                {result.message}
              </span>
            </p>

            {result.failedAt === -1 && (
              <>
                <p className="mt-2 text-sm leading-relaxed">
                  Zwróć uwagę na jedno: <strong>poprawnych kolejności jest kilka</strong>. Nie ma
                  znaczenia, czy najpierw umyjesz truskawki, czy obierzesz banana — ale jedno i
                  drugie musi być przed wrzuceniem do blendera. Tak właśnie działa każdy przepis i
                  każda instrukcja: część kroków ma sztywną kolejność, a część nie.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Przepis, który da się wykonać krok po kroku i który nie wymaga zgadywania, ma w
                  informatyce własną nazwę: <strong>algorytm</strong>. Wrócisz do niego w module o
                  myśleniu komputacyjnym — a potem będziesz takie przepisy pisać dla komputera.
                </p>
              </>
            )}

            {result.failedAt >= 0 && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Kucharz nie domyśla się, o co ci chodziło — robi dokładnie to, co jest napisane.
                Przesuń kroki strzałkami i spróbuj jeszcze raz.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {runs > 0 && !solved && (
        <p className="mt-2 text-xs tabular-nums text-muted-foreground">prób: {runs}</p>
      )}
    </div>
  );
}

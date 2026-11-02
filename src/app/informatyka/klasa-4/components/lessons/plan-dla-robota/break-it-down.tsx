'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Split } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Haczyk lekcji — **rozbijanie kroku, który wygląda na krok**.
 *
 * „Zrób kanapkę” brzmi jak polecenie. Dla robota nie jest: nie ma w nim ani
 * jednej czynności do wykonania, tylko nazwa całej roboty. Blok daje dziecku
 * jedno narzędzie i jedno pytanie. Narzędzie: przycisk „rozbij na mniejsze”.
 * Pytanie, powtarzane przy każdym kroku: **czy robot wie, jak to zrobić, bez
 * zastanawiania się?**
 *
 * Nowe w kursie jest to, że **zadanie rozwiązuje się przez powtarzanie tej samej
 * czynności aż do zatrzymania** — i że kryterium zatrzymania jest jawne, a nie
 * uznaniowe. Jedna gałąź rozbija się dwa razy (masło), więc widać, że to nie jest
 * „lista na jednym poziomie”, tylko schodzenie w dół tak długo, jak trzeba.
 */

interface Step {
  id: string;
  text: string;
  /** `null` — krok wykonalny; tablica — kroki, na które się rozpada. */
  parts: string[] | null;
  /** Dlaczego ten krok jeszcze nie jest krokiem. */
  why?: string;
}

const STEPS: Record<string, Step> = {
  skladniki: {
    id: 'skladniki',
    text: 'Przygotuj składniki',
    parts: ['chleb', 'ser', 'narzedzia'],
    why: 'Które składniki? Skąd je wziąć? Robot nie wie, od czego zacząć.',
  },
  chleb: { id: 'chleb', text: 'Wyjmij chleb z chlebaka', parts: null },
  ser: { id: 'ser', text: 'Wyjmij ser z lodówki', parts: null },
  narzedzia: { id: 'narzedzia', text: 'Połóż na blacie nóż i deskę', parts: null },

  zrob: {
    id: 'zrob',
    text: 'Zrób kanapkę',
    parts: ['kromka', 'maslo', 'plaster'],
    why: 'To jest nazwa całej roboty, a nie czynność. Dokładnie to, co miało zostać rozłożone.',
  },
  kromka: { id: 'kromka', text: 'Połóż kromkę chleba na desce', parts: null },
  maslo: {
    id: 'maslo',
    text: 'Posmaruj kromkę masłem',
    parts: ['nabierz', 'rozsmaruj'],
    why: 'Prawie krok — ale wciąż składa się z dwóch osobnych ruchów, i to w ustalonej kolejności.',
  },
  nabierz: { id: 'nabierz', text: 'Nabierz masło na nóż', parts: null },
  rozsmaruj: { id: 'rozsmaruj', text: 'Rozsmaruj masło po kromce', parts: null },
  plaster: { id: 'plaster', text: 'Połóż plaster sera na kromce', parts: null },

  posprzataj: {
    id: 'posprzataj',
    text: 'Posprzątaj po sobie',
    parts: ['schowaj', 'umyj'],
    why: 'Posprzątać można na sto sposobów. Robot potrzebuje wiedzieć, co dokładnie odłożyć i co umyć.',
  },
  schowaj: { id: 'schowaj', text: 'Schowaj ser i chleb z powrotem', parts: null },
  umyj: { id: 'umyj', text: 'Umyj nóż i wytrzyj deskę', parts: null },
};

const START = ['skladniki', 'zrob', 'posprzataj'];

interface BreakItDownProps {
  color: string;
  onComplete?: () => void;
}

export function BreakItDown({ color, onComplete }: BreakItDownProps) {
  const [plan, setPlan] = useState<string[]>(START);
  const [note, setNote] = useState<string | null>(null);
  const [splits, setSplits] = useState(0);

  const reported = useRef(false);
  const tooBig = plan.filter((id) => STEPS[id].parts !== null);
  const done = tooBig.length === 0;
  const anchorRef = useSectionScrollAnchor(done ? 'gotowe' : `plan-${plan.length}`);

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const split = (id: string) => {
    const step = STEPS[id];
    if (!step.parts) return;
    setPlan((prev) => prev.flatMap((x) => (x === id ? (step.parts as string[]) : [x])));
    setSplits(splits + 1);
    setNote(step.why ?? null);
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Wytłumacz robotowi, jak zrobić kanapkę.
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Przy każdym kroku zadaj jedno pytanie: <strong>czy robot wie, jak to zrobić, bez
        zastanawiania się?</strong> Jeśli nie — rozbij go na mniejsze.
      </p>

      <ol className="space-y-1.5">
        {plan.map((id, i) => {
          const step = STEPS[id];
          const big = step.parts !== null;
          return (
            <li
              key={`${id}-${i}`}
              className={cn(
                'flex items-center gap-2.5 border-2 bg-white p-2.5 dark:bg-zinc-900',
                big && 'border-amber-500'
              )}
              style={!big ? { borderColor: `${color}55` } : undefined}
            >
              <span
                className="w-6 shrink-0 text-center font-mono text-sm font-bold tabular-nums"
                style={{ color: big ? '#d97706' : color }}
              >
                {big ? '?' : i + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm sm:text-base">{step.text}</span>
              {big ? (
                <button
                  type="button"
                  onClick={() => split(id)}
                  className="inline-flex shrink-0 items-center gap-1.5 border-2 border-amber-500 px-2.5 py-1.5 text-xs font-semibold"
                >
                  <Split className="h-3.5 w-3.5" aria-hidden />
                  Rozbij na mniejsze
                </button>
              ) : (
                <Check className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-xs tabular-nums text-muted-foreground">
        kroków w planie: <strong className="text-foreground">{plan.length}</strong> · do rozbicia:{' '}
        <strong className={cn(tooBig.length > 0 && 'text-amber-700 dark:text-amber-500')}>
          {tooBig.length}
        </strong>
      </p>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Z trzech ogólników zrobiło się {plan.length} kroków — po {splits} rozbiciach. Każdy
                da się teraz wykonać bez zastanawiania.
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              To się nazywa <strong>rozkładaniem problemu na części</strong> i jest pierwszą rzeczą,
              którą robi się przed każdym programem. Zwróć uwagę na jedną rzecz: „posmaruj masłem”
              trzeba było rozbić <strong>drugi raz</strong>. Nie ma reguły „dziel na trzy” — dzieli
              się tak długo, aż kroki staną się wykonalne.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              I jeszcze jedno, o czym przekonasz się za chwilę: gotowy plan trzeba przeczytać
              <strong> w kolejności</strong>. Kroki wykonalne to dopiero połowa roboty — druga połowa
              to ustawienie ich tak, żeby dało się je wykonać jeden po drugim.
            </p>
          </motion.div>
        ) : note ? (
          <motion.p
            key={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 p-3 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            {note}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

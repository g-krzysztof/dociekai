'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ClipboardCheck, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Zadanie praktyczne offline — polecenie + lista kontrolna „czy udało się”.
 *
 * Kurs jest w przeglądarce, a spora część zadań wymaga programów, których na
 * stronie nie ma (Paint, edytor tekstu, Scratch, arkusz). Takie zadania
 * prowadzimy jako instrukcję plus listę kontrolną, nie jako ćwiczenie klikane
 * na stronie.
 *
 * To jest też miejsce, w którym lądują zadania obowiązkowe **Z-1 … Z-10**:
 * `brief` niesie ich dosłowne brzmienie, a każdy podpunkt zadania musi mieć
 * osobną pozycję listy kontrolnej. Żadnego z nich nie wolno skrócić.
 *
 * Wspólne dla kursów blokowych od 2026-09-25: w historii to wyjątek dla pracy
 * poza ekranem (karta badacza własnej okolicy w L12–L14, udział w obchodach
 * w L11) — zadanie, które zostawia dowód, idzie przez `TaskShell`.
 *
 * Odhaczenia żyją tylko w tym montowaniu komponentu — trwały jest wynik bloku,
 * który powłoka lekcji zapisuje po zaznaczeniu wszystkich pozycji.
 */

export interface PracticeSection {
  /** Nagłówek grupy pozycji, np. „Twoje miejsce pracy”. */
  label: string;
  items: string[];
}

interface PracticeTaskProps {
  color: string;
  /** Polecenie zadania — przy Z-1…Z-10 dosłowne brzmienie z programu kursu. */
  brief: ReactNode;
  sections: PracticeSection[];
  /** Podpowiedzi i alternatywy programów pokazane pod listą. */
  hint?: ReactNode;
  /** Tekst po odhaczeniu wszystkiego — domyślnie ogólny. */
  doneText?: string;
  onComplete?: () => void;
}

export function PracticeTask({
  color,
  brief,
  sections,
  hint,
  doneText = 'Wszystko odhaczone. To jest ta część lekcji, która zostaje z tobą po zamknięciu strony.',
  onComplete,
}: PracticeTaskProps) {
  const [checked, setChecked] = useState<string[]>([]);

  const allItems = sections.flatMap((section) =>
    section.items.map((item, i) => `${section.label}-${i}`)
  );
  const finished = checked.length === allItems.length;

  const toggle = (key: string) => {
    const next = checked.includes(key)
      ? checked.filter((item) => item !== key)
      : [...checked, key];
    setChecked(next);
    if (next.length === allItems.length) onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <div className="min-w-0 text-sm leading-relaxed sm:text-base">{brief}</div>
      </div>

      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.label}>
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-wide"
              style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
            >
              {section.label}
            </p>
            <ul className="divide-y border">
              {section.items.map((item, i) => {
                const key = `${section.label}-${i}`;
                const isChecked = checked.includes(key);
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      aria-pressed={isChecked}
                      className="flex w-full cursor-pointer items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/40"
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border"
                        style={
                          isChecked
                            ? { backgroundColor: color, borderColor: color }
                            : { borderColor: 'var(--border)' }
                        }
                      >
                        {isChecked && <Check className="h-3.5 w-3.5 text-white" aria-hidden />}
                      </span>
                      <span
                        className={cn(
                          'text-sm leading-relaxed',
                          isChecked && 'text-muted-foreground line-through'
                        )}
                      >
                        {item}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {hint && (
        <div className="mt-5 border-l-2 pl-3 text-sm text-muted-foreground" style={{ borderColor: `${color}66` }}>
          {hint}
        </div>
      )}

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex items-start gap-2 border-t-2 pt-4 text-sm font-medium"
            style={{ borderColor: color }}
          >
            <PartyPopper className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            {doneText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Key, Leaf, Pencil, Ruler as RulerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { RulerMeasure, type MeasuredObjectShape } from './ruler-measure';

const MAX_MM = 200;

interface Round {
  id: string;
  name: string;
  icon: typeof Pencil;
  shape: MeasuredObjectShape;
  objectMm: number;
}

const ROUNDS: Round[] = [
  { id: 'olowek', name: 'Ołówek', icon: Pencil, shape: 'pencil', objectMm: 160 },
  { id: 'klucz', name: 'Klucz', icon: Key, shape: 'key', objectMm: 60 },
  { id: 'lisc', name: 'Liść', icon: Leaf, shape: 'leaf', objectMm: 90 },
];

interface RulerMeasureLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Pomiar: trzy rundy mierzenia przedmiotów przeciąganą suwmiarką na
 * `<RulerMeasure>` — praktyczna umiejętność czytania linijki, zanim w
 * Przykładach dziecko zacznie przeliczać już gotowe liczby po drabince.
 * Każda runda resetuje `value`/`checked` niezależnie — ten sam "no wrong
 * click, only try again" duch co reszta kursu, tylko przeniesiony na
 * ciągłe przeciąganie: pomiar niedokładny nie blokuje, tylko prosi o
 * poprawkę.
 */
export function RulerMeasureLab({ color, onComplete }: RulerMeasureLabProps) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState(0);
  const [checked, setChecked] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${checked}`);

  const round = ROUNDS[index];
  const Icon = round.icon;
  const isLast = index === ROUNDS.length - 1;
  const correct = checked && value === round.objectMm;
  const wrong = checked && value !== round.objectMm;

  const change = (mm: number) => {
    setValue(mm);
    setChecked(false);
  };

  const check = () => setChecked(true);

  const next = () => {
    if (isLast) {
      onComplete?.();
      return;
    }
    setIndex((prev) => prev + 1);
    setValue(0);
    setChecked(false);
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{ROUNDS.length}
        </span>
      </div>

      <p className="mb-4 flex items-center gap-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
        <RulerIcon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
        Przeciągnij okrągły uchwyt suwmiarki tak, żeby zrównał się dokładnie z końcem przedmiotu.
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={round.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-3 flex items-center justify-center gap-2 text-base font-bold sm:text-lg">
            <Icon className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            Zmierz: {round.name}
          </p>

          <RulerMeasure
            color={color}
            maxMm={MAX_MM}
            objectMm={round.objectMm}
            shape={round.shape}
            value={value}
            onChange={change}
            locked={correct}
          />

          <p className="mt-3 text-center font-mono text-lg font-black tabular-nums" style={{ color }}>
            Twój pomiar: {value} mm{value % 10 === 0 ? ` = ${value / 10} cm` : ''}
          </p>

          {correct && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-emerald-50 p-4 text-center text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
            >
              <strong>Dokładnie! </strong>
              {round.name.toLowerCase()} ma {round.objectMm} mm, czyli {round.objectMm / 10} cm.
            </motion.div>
          )}

          {wrong && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-amber-50 p-4 text-center text-sm leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            >
              Jeszcze nie dokładnie — przesuń suwmiarkę tak, żeby stykała się z samym końcem
              przedmiotu, i sprawdź ponownie.
            </motion.div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            {!correct && (
              <Button onClick={check} variant="outline">
                Sprawdź pomiar
              </Button>
            )}
            {correct && <Button onClick={next}>{isLast ? 'Zakończ' : 'Następny przedmiot'}</Button>}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

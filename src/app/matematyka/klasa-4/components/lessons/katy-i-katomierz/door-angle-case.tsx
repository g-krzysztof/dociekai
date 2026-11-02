'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AngleBuilder } from './angle-builder';

const REAL_ANGLE = 70;
const GUESS_OPTIONS = [40, 70, 110, 150];

interface DoorAngleCaseProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: „zgadnij, potem sprawdź" (ten sam gating co w
 * `RoundingMachine`) połączone z drugą narracją `AngleBuilder`. Dziecko
 * najpierw szacuje kąt otwarcia drzwi ze zdjęcia, potem odtwarza go na
 * tarczy i porównuje strzał z prawdziwym pomiarem.
 */
export function DoorAngleCase({ color, onComplete }: DoorAngleCaseProps) {
  const [guess, setGuess] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const diff = guess === null ? null : Math.abs(guess - REAL_ANGLE);

  const finish = () => {
    setChecked(true);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed">
        Na zdjęciu drzwi są uchylone pod pewnym kątem. Najpierw zgadnij, ile ma ten kąt — dopiero
        potem sprawdzisz to naprawdę, odtwarzając go na tarczy.
      </p>

      <div className="grid grid-cols-4 gap-2">
        {GUESS_OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            disabled={guess !== null}
            onClick={() => setGuess(value)}
            className={cn(
              'cursor-pointer border px-2 py-3 text-center font-mono text-base font-bold transition-all disabled:cursor-not-allowed',
              guess === null && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
              guess !== null && guess !== value && 'opacity-40'
            )}
            style={guess === value ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined}
          >
            {value}°
          </button>
        ))}
      </div>

      {guess !== null && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 border-t pt-5">
          <p className="mb-4 text-sm text-muted-foreground">
            Twój strzał: <strong className="font-mono">{guess}°</strong>. Teraz przeciągnij ramię
            tak, żeby naprawdę odtworzyć kąt otwarcia drzwi.
          </p>
          <AngleBuilder
            color={color}
            targets={[{ degrees: REAL_ANGLE, prompt: 'Odtwórz kąt otwarcia drzwi ze zdjęcia' }]}
            onComplete={finish}
          />
        </motion.div>
      )}

      {checked && diff !== null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          Drzwi były uchylone na około <strong>{REAL_ANGLE}°</strong>. Twój strzał różnił się o{' '}
          <strong>{diff}°</strong> —{' '}
          {diff <= 15
            ? 'naprawdę celne oko!'
            : 'z czasem, im więcej kątów zobaczysz, tym lepiej będziesz je szacować na oko.'}
        </motion.div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageIcon, Save } from 'lucide-react';

/**
 * Haczyk lekcji: dziecko zgaduje, ile „waży” jedno zdjęcie z telefonu, a potem
 * dostaje to zestawione z dyskietką sprzed trzydziestu lat. Pointa: jedno
 * dzisiejsze zdjęcie NIE mieści się na jednej dyskietce — trzeba trzech. Skąd
 * w ogóle wiadomo, ile „waży” plik? To pytanie otwiera blok o jednostkach.
 *
 * Suwak jest w megabajtach, żeby dziecko oswoiło jednostkę, zanim ją nazwiemy.
 * Blok kończy się po sprawdzeniu odpowiedzi (samo zgadnięcie niczego nie mierzy,
 * ale i nic nie blokuje — chodzi o zaskoczenie, nie o wynik).
 */

/** Dzisiejsze zdjęcie z telefonu to zwykle 3–6 MB; bierzemy 4 jako okrągłą wartość. */
const PHOTO_MB = 4;
/** Dyskietka 3,5 cala — 1,44 MB. */
const FLOPPY_MB = 1.44;

interface PhotoWeightHookProps {
  color: string;
  onComplete?: () => void;
}

export function PhotoWeightHook({ color, onComplete }: PhotoWeightHookProps) {
  const [guess, setGuess] = useState(1);
  const [checked, setChecked] = useState(false);

  const check = () => {
    if (checked) return;
    setChecked(true);
    onComplete?.();
  };

  const floppiesNeeded = Math.ceil(PHOTO_MB / FLOPPY_MB);
  /** Skala paska: najdłuższy element to zdjęcie, dostaje 100%. */
  const bar = (mb: number) => `${(mb / PHOTO_MB) * 100}%`;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-5 flex items-start gap-2 text-sm leading-relaxed sm:text-base">
        <ImageIcon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
        <span>
          Robisz telefonem jedno zwykłe zdjęcie. <strong>Ile ono „waży”?</strong> Ustaw suwak na
          swoją odpowiedź, potem sprawdź.
        </span>
      </p>

      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor="photo-weight-guess" className="text-sm font-semibold">
          Twoja odpowiedź
        </label>
        <span className="font-mono text-2xl font-bold tabular-nums" style={{ color }}>
          {guess} MB
        </span>
      </div>
      <input
        id="photo-weight-guess"
        type="range"
        min={0}
        max={20}
        step={1}
        value={guess}
        onChange={(event) => setGuess(Number(event.target.value))}
        disabled={checked}
        className="h-6 w-full cursor-pointer"
        style={{ accentColor: color }}
      />
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>0 MB</span>
        <span>20 MB</span>
      </div>

      {!checked && (
        <button
          type="button"
          onClick={check}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 border-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          Sprawdź
        </button>
      )}

      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4"
            style={{ borderColor: color }}
          >
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold">Jedno zdjęcie z telefonu</span>
                  <span className="font-mono font-bold tabular-nums" style={{ color }}>
                    ok. {PHOTO_MB} MB
                  </span>
                </div>
                <div className="h-4 bg-muted">
                  <div className="h-full" style={{ width: bar(PHOTO_MB), backgroundColor: color }} />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold">Dyskietka z lat 90.</span>
                  <span className="font-mono font-bold tabular-nums text-muted-foreground">
                    {FLOPPY_MB} MB
                  </span>
                </div>
                <div className="h-4 bg-muted">
                  <div
                    className="h-full"
                    style={{ width: bar(FLOPPY_MB), backgroundColor: 'var(--muted-foreground)' }}
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed">
              <Save className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Twoje jedno zdjęcie <strong>nie zmieściłoby się</strong> na jednej dyskietce —
                potrzebowałoby aż <strong>{floppiesNeeded}</strong>. A skąd właściwie wiadomo, że
                zdjęcie „waży” tyle a tyle? Czym się to mierzy? O tym jest następny blok.
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

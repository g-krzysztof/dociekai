'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DrogaPiechura } from './droga-piechura';
import { AUGUST, judgePrediction, walkYears, type Verdict } from './obliczanie';

/** Ile pikseli przeciągnięcia drogi to jeden krok piechura. */
const PX_PER_STEP = 22;

type Phase = 'przewiduj' | 'idz' | 'wynik';

/**
 * Blok 1 — **„Ile lat żył Oktawian August?”** (`haczyk`).
 *
 * Gest nowy w kursie: najpierw **przewiduje** (wpisuje liczbę), potem
 * **prowadzi piechura rok po roku** — ciągnie drogę w prawo, tylko do przodu —
 * a licznik kroków liczy sam. Przy szczelinie piechur przeskakuje z 1 p.n.e.
 * prosto na 1 n.e. Rozbieżność przewidywania z licznikiem to odkrycie lekcji.
 */
export function PiechurAugusta({ color, onComplete }: { color: string; onComplete: () => void }) {
  const years = useMemo(() => walkYears(AUGUST.born, AUGUST.died), []);
  const last = years.length - 1;
  const [phase, setPhase] = useState<Phase>('przewiduj');
  const [guess, setGuess] = useState('');
  const [prediction, setPrediction] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const drag = useRef<{ x: number; base: number } | null>(null);
  const reported = useRef(false);

  const jumped = years[index] === 1 && index > 0;

  useEffect(() => {
    if (phase !== 'idz' || index < last || prediction === null) return;
    setVerdict(judgePrediction(prediction, last));
    setPhase('wynik');
  }, [phase, index, last, prediction]);

  useEffect(() => {
    if (phase === 'wynik' && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [phase, onComplete]);

  const step = (n: number) => setIndex((i) => Math.min(last, Math.max(i, i + n)));

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (phase !== 'idz') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, base: index };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const steps = Math.floor((e.clientX - drag.current.x) / PX_PER_STEP);
    // Tylko do przodu: ruch w lewo nie cofa piechura.
    const target = Math.min(last, drag.current.base + Math.max(0, steps));
    setIndex((i) => Math.max(i, target));
  };
  const onUp = () => {
    drag.current = null;
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (phase !== 'idz') return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    }
  };

  const save = () => {
    const n = Number(guess);
    if (!Number.isInteger(n) || n <= 0 || n > 200) return;
    setPrediction(n);
    setPhase('idz');
  };

  return (
    <div className="space-y-4">
      <div className="border bg-muted/30 p-4 text-sm leading-relaxed" style={{ borderColor: color }}>
        <p>
          <strong>Oktawian August</strong>, pierwszy cesarz rzymski, urodził się w roku <strong>63 p.n.e.</strong>, a
          zmarł w roku <strong>14 n.e.</strong> Ile lat żył?
        </p>
      </div>

      {phase === 'przewiduj' && (
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            Twoje przewidywanie — bez liczenia na kartce:
            <input
              inputMode="numeric"
              value={guess}
              onChange={(e) => setGuess(e.target.value.replace(/\D/g, '').slice(0, 3))}
              className="w-28 border-2 bg-background px-3 py-2 font-mono text-2xl tabular-nums"
              style={{ borderColor: color }}
              aria-label="Ile lat żył August — przewidywanie"
            />
          </label>
          <button
            type="submit"
            disabled={!guess}
            className="border-2 px-4 py-2 text-sm font-semibold disabled:opacity-40"
            style={{ borderColor: color }}
          >
            Zapisz i sprawdź piechurem
          </button>
        </form>
      )}

      {phase !== 'przewiduj' && (
        <>
          <p className="text-sm leading-relaxed">
            Piechur stoi na roku urodzenia Augusta. <strong>Ciągnij drogę palcem w prawo</strong> — za każdy rok życia
            piechur robi jeden krok. Licznik liczy sam.
          </p>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Droga piechura — strzałka w prawo to jeden krok"
            aria-valuemin={0}
            aria-valuemax={last}
            aria-valuenow={index}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={onKey}
            className={cn('touch-none outline-none focus-visible:ring-2', phase === 'idz' && 'cursor-grab')}
          >
            <DrogaPiechura years={years} index={index} color={color} jumped={jumped} />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span>
              Twoje przewidywanie: <strong className="font-mono tabular-nums">{prediction}</strong>
            </span>
            <span>
              Kroki piechura: <strong className="font-mono text-lg tabular-nums" style={{ color }}>{index}</strong>
            </span>
            {phase === 'idz' && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ChevronsRight className="h-4 w-4" aria-hidden /> ciągnij w prawo
              </span>
            )}
          </div>
          {jumped && phase === 'idz' && (
            <p className="text-sm font-semibold text-destructive" aria-live="polite">
              Hop! Po roku 1 p.n.e. piechur stanął od razu na roku 1 n.e. Roku zero nie było.
            </p>
          )}
        </>
      )}

      {phase === 'wynik' && verdict && (
        <div className="border bg-muted/30 p-4 text-sm leading-relaxed" aria-live="polite">
          <p>{verdict.message}</p>
          <p className="mt-2">
            63 + 14 daje 77 — jakby między 1 p.n.e. a 1 n.e. stał jeszcze rok zero. A takiego roku nie było, więc August
            żył <strong>76 lat</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

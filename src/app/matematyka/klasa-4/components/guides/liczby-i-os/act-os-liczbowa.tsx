'use client';

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NumberLine, type LineMarker } from '../../number-line';
import { Beat, GuideAct } from '../guide-act';

const PRACTICE_TARGET = 70;

export function ActOsLiczbowa({ color }: { color: string }) {
  return (
    <GuideAct id="os-liczbowa" mode="flow">
      <OsLiczbowaBody color={color} />
    </GuideAct>
  );
}

function OsLiczbowaBody({ color }: { color: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const correct = picked === PRACTICE_TARGET;

  const markers: LineMarker[] = [];
  if (picked !== null && !checked) markers.push({ value: picked, filled: false, color });
  if (checked) {
    markers.push({ value: PRACTICE_TARGET, color: '#10b981', label: String(PRACTICE_TARGET) });
    if (picked !== null && picked !== PRACTICE_TARGET) {
      markers.push({ value: picked, color: '#f43f5e', filled: false });
    }
  }

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Oś liczbowa</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Prosta linia, na której liczby stoją w kolejności, w równych odstępach.
      </p>

      <Beat at={0.1} className="mb-6">
        <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
          <NumberLine
            min={0}
            max={20}
            majorStep={4}
            minorStep={1}
            color={color}
            markers={[
              { value: 0, label: 'zero', color },
              { value: 12, label: '12', color },
            ]}
            ariaLabel="Oś liczbowa od 0 do 20 z zaznaczonym zerem i liczbą 12"
          />
        </div>
      </Beat>

      <Beat at={0.3} className="mb-3">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          <strong>Zero</strong> to początek. Odległość między sąsiednimi kreskami to zawsze{' '}
          <strong>ta sama jednostka</strong>.
        </p>
      </Beat>
      <Beat at={0.45} className="mb-8">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Liczby rosną w prawo — im dalej w prawo, tym większa liczba.
        </p>
      </Beat>

      <Beat at={0.6}>
        <div
          className="border-l-4 p-4 sm:p-5"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p
            className="mb-1 text-xs font-bold uppercase tracking-[0.15em]"
            style={{ color: textColor }}
          >
            Spróbuj sam
          </p>
          <p className="mb-4 text-sm leading-relaxed sm:text-base">
            Kliknij na osi miejsce, w którym jest liczba <strong>{PRACTICE_TARGET}</strong>.
          </p>

          <div className="mb-4 border bg-white p-4 dark:bg-zinc-900/80">
            <NumberLine
              min={0}
              max={100}
              majorStep={20}
              minorStep={10}
              color={color}
              markers={markers}
              onPick={checked ? undefined : setPicked}
              ariaLabel={`Oś liczbowa od 0 do 100, kliknij aby zaznaczyć liczbę ${PRACTICE_TARGET}`}
            />
          </div>

          {!checked ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {picked === null ? 'Dotknij osi, żeby postawić punkt.' : `Zaznaczono: ${picked}`}
              </p>
              <button
                type="button"
                onClick={() => setChecked(true)}
                disabled={picked === null}
                className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderColor: color, color }}
              >
                Sprawdź
              </button>
            </div>
          ) : (
            <p
              className={cn(
                'flex items-start gap-2 p-3 text-sm leading-relaxed',
                correct
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              {correct ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              )}
              {correct ? 'Dokładnie tam!' : `Prawie — ${PRACTICE_TARGET} to zielony punkt.`}
            </p>
          )}
        </div>
      </Beat>
    </>
  );
}

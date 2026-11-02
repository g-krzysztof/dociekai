'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Beat, GuideAct } from '../guide-act';
import { ColumnGrid } from '../../column-grid';
import {
  ALIGNMENT_CORRECT_CELLS,
  ALIGNMENT_EXAMPLE,
  ALIGNMENT_WRONG_CELLS,
  PRACTICE_CORRECT_CELLS,
  PRACTICE_WRONG_CELLS,
  ALIGNMENT_PRACTICE_EXAMPLE,
} from './guide-content';

export function ActUstawianieLiczb({ color }: { color: string }) {
  return (
    <GuideAct id="ustawianie-liczb" mode="flow">
      <UstawianieLiczbBody color={color} />
    </GuideAct>
  );
}

function UstawianieLiczbBody({ color }: { color: string }) {
  const [showCorrect, setShowCorrect] = useState(true);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Ustawianie liczb</h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Cyfry ustawiamy jedna pod drugą według miejsca dziesiętnego, które zajmują — nie według
        tego, którą cyfrę zapisaliśmy jako pierwszą.
      </p>

      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        <div className="border p-4 sm:p-5">
          <p
            className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground"
            aria-hidden
          >
            Źle — {ALIGNMENT_EXAMPLE.short} pod dziesiątkami
          </p>
          <div className="flex justify-center overflow-x-auto">
            <ColumnGrid
              color={color}
              operator="+"
              cells={ALIGNMENT_WRONG_CELLS}
              ariaLabel={`Błędnie: ${ALIGNMENT_EXAMPLE.long} plus ${ALIGNMENT_EXAMPLE.short}, wynik 174`}
            />
          </div>
        </div>
        <div className="border-2 p-4 sm:p-5" style={{ borderColor: color, backgroundColor: `${color}0c` }}>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: textColor }}>
            Dobrze — {ALIGNMENT_EXAMPLE.short} pod jednościami
          </p>
          <div className="flex justify-center overflow-x-auto">
            <ColumnGrid
              color={color}
              operator="+"
              cells={ALIGNMENT_CORRECT_CELLS}
              showPlaceLabels
              ariaLabel={`Poprawnie: ${ALIGNMENT_EXAMPLE.long} plus ${ALIGNMENT_EXAMPLE.short}, wynik ${ALIGNMENT_EXAMPLE.correctSum}`}
            />
          </div>
        </div>
      </div>

      <Beat at={0.3} className="mb-8">
        <p className="max-w-2xl text-base leading-relaxed sm:text-lg">
          Ta sama cyfra{' '}
          <strong className="font-mono" style={{ color }}>
            {ALIGNMENT_EXAMPLE.short}
          </strong>
          , dwa różne miejsca — i dwa zupełnie różne wyniki.{' '}
          <strong>Liczy się tylko to, pod którą kolumną cyfra faktycznie stoi.</strong>
        </p>
      </Beat>

      <div
        className="mb-8 grid gap-3 border-l-4 p-4 sm:p-5"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <p className="text-sm leading-relaxed sm:text-base">
          <strong style={{ color: textColor }}>Reguła:</strong> jedności stają pod jednościami,
          dziesiątki pod dziesiątkami, setki pod setkami — licząc zawsze od prawej strony.
        </p>
        <p className="text-sm leading-relaxed sm:text-base">
          Gdy liczba jest krótsza, jej brakujące kolumny <strong>zostają puste</strong> — nigdy nie
          dopisujemy jej cyfr z lewej strony, tylko dlatego że tam jest miejsce.
        </p>
      </div>

      <p className="mb-3 text-sm font-semibold" style={{ color: textColor }}>
        Sprawdź sam: {ALIGNMENT_PRACTICE_EXAMPLE.long} + {ALIGNMENT_PRACTICE_EXAMPLE.short}
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: 'wrong', label: 'Pokaż źle', active: !showCorrect },
          { key: 'correct', label: 'Pokaż dobrze', active: showCorrect },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setShowCorrect(option.key === 'correct')}
            aria-pressed={option.active}
            className={cn(
              'cursor-pointer border px-4 py-2 text-sm font-semibold transition-all',
              !option.active && 'hover:-translate-y-0.5 hover:shadow-md'
            )}
            style={
              option.active
                ? { borderColor: color, backgroundColor: `${color}14`, color }
                : { borderColor: `${color}59`, color }
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center overflow-x-auto border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <ColumnGrid
          color={color}
          operator="+"
          cells={showCorrect ? PRACTICE_CORRECT_CELLS : PRACTICE_WRONG_CELLS}
          showPlaceLabels={showCorrect}
          ariaLabel={
            showCorrect
              ? `Poprawnie: ${ALIGNMENT_PRACTICE_EXAMPLE.long} plus ${ALIGNMENT_PRACTICE_EXAMPLE.short}, wynik ${ALIGNMENT_PRACTICE_EXAMPLE.correctSum}`
              : `Błędnie: ${ALIGNMENT_PRACTICE_EXAMPLE.long} plus ${ALIGNMENT_PRACTICE_EXAMPLE.short}, wynik 853`
          }
        />
      </div>
    </>
  );
}

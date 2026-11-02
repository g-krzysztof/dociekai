'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import type { ColumnPlace } from '../../../lib/column-algorithm';

const NUMBER = 236;
const MULTIPLIER = 4;
const CORRECT_RESULT = NUMBER * MULTIPLIER;
/** Zosia policzyła 3 × 4 = 12 w kolumnie dziesiątek, ale zapomniała dodać przeniesienie 2 z jedności — powinno być 12 + 2 = 14. */
const WRONG_RESULT = 924;
const MISTAKE_PLACE: ColumnPlace = 'dziesiątki';

/** Kolejność kolumn od lewej, dokładnie tak, jak renderuje je `<ColumnGrid>` — przyciski pod spodem stoją w tej samej kolejności. */
const PLACES: ColumnPlace[] = ['setki', 'dziesiątki', 'jedności'];

function cellsFor(highlightPlace: ColumnPlace | null): ColumnCellData[] {
  return [
    { place: 'setki', top: 2, bottom: null, result: 9, carry: 1, highlight: highlightPlace === 'setki' },
    { place: 'dziesiątki', top: 3, bottom: null, result: 2, carry: 2, highlight: highlightPlace === 'dziesiątki' },
    { place: 'jedności', top: 6, bottom: MULTIPLIER, result: 4, highlight: highlightPlace === 'jedności' },
  ];
}

const CORRECT_CELLS: ColumnCellData[] = [
  { place: 'setki', top: 2, bottom: null, result: 9, carry: 1 },
  { place: 'dziesiątki', top: 3, bottom: null, result: 4, carry: 2 },
  { place: 'jedności', top: 6, bottom: MULTIPLIER, result: 4 },
];

interface MistakeHuntProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: zamiast liczyć nowe działanie od zera, dziecko
 * audytuje już rozwiązane (ale błędne) mnożenie pisemne — klika bezpośrednio
 * kolumnę w siatce, w której podejrzewa błąd, zamiast wybierać opis błędu
 * z listy tekstowej (tak jak zadanie D w `<MnozenieDrill>`). To pierwsza w
 * kursie interakcja, w której trzeba wskazać *konkretne miejsce* w już
 * gotowym zapisie działania, a nie zbudować albo rozwiązać działanie od
 * nowa — sprawdzanie własnej (lub cudzej) pracy jest osobną umiejętnością
 * od samego liczenia.
 */
export function MistakeHunt({ color, onComplete }: MistakeHuntProps) {
  const [found, setFound] = useState(false);
  const [wrongPick, setWrongPick] = useState<ColumnPlace | null>(null);
  const [value, setValue] = useState('');
  const [answered, setAnswered] = useState(false);

  const isCorrectTotal = Number(value.trim().replace(',', '.')) === CORRECT_RESULT;

  const pickPlace = (place: ColumnPlace) => {
    if (found || wrongPick) return;
    if (place === MISTAKE_PLACE) {
      setFound(true);
      return;
    }
    setWrongPick(place);
    setTimeout(() => setWrongPick(null), 600);
  };

  const submitTotal = (event: FormEvent) => {
    event.preventDefault();
    if (answered || !value.trim()) return;
    setAnswered(true);
    if (Number(value.trim().replace(',', '.')) === CORRECT_RESULT) onComplete?.();
  };

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Search className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Zosia policzyła w zeszycie {NUMBER} × {MULTIPLIER} i wyszło jej {WRONG_RESULT}. To zła
          odpowiedź — w jednej kolumnie się pomyliła. Kliknij tę kolumnę.
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="mb-4 flex justify-center overflow-x-auto">
          <ColumnGrid
            color={color}
            operator="×"
            cells={cellsFor(found ? MISTAKE_PLACE : null)}
            showPlaceLabels
            reserveAnnotationRow
            ariaLabel={`Zapis Zosi: ${NUMBER} razy ${MULTIPLIER}, wynik ${WRONG_RESULT}`}
          />
        </div>

        {!found ? (
          <div className="grid grid-cols-3 gap-2">
            {PLACES.map((place) => (
              <button
                key={place}
                type="button"
                onClick={() => pickPlace(place)}
                className={cn(
                  'flex items-center justify-center gap-1.5 border-2 px-3 py-3 text-sm font-semibold capitalize transition-all',
                  wrongPick === place
                    ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    : 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={wrongPick === place ? undefined : { borderColor: `${color}55`, color }}
              >
                {wrongPick === place && <X className="h-4 w-4 shrink-0" aria-hidden />}
                {place}
              </button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <p className="text-center text-sm leading-relaxed sm:text-base">
              <strong>Dokładnie tu!</strong> Jedności oddały dziesiątkom przeniesienie 2, ale w
              dziesiątkach policzono tylko 3 × 4 = 12, zapominając dodać te 2. Powinno być
              12 + 2 = 14, czyli zapisujemy 4 (z przeniesieniem 1 dalej).
            </p>

            <form onSubmit={submitTotal} className="flex flex-wrap items-center justify-center gap-2">
              <label htmlFor="mistake-hunt-total" className="text-sm font-semibold">
                Poprawny wynik:
              </label>
              <Input
                id="mistake-hunt-total"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={answered}
                inputMode="numeric"
                autoComplete="off"
                placeholder={`${NUMBER} × ${MULTIPLIER}`}
                className={cn(
                  'w-28 font-mono text-base',
                  answered && isCorrectTotal && 'border-emerald-500',
                  answered && !isCorrectTotal && 'border-rose-400'
                )}
              />
              {!answered && (
                <Button type="submit" disabled={!value.trim()}>
                  Sprawdź
                </Button>
              )}
              {answered && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm font-semibold',
                    isCorrectTotal ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {isCorrectTotal ? (
                    <>
                      <Check className="h-4 w-4" /> Dobrze!
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" /> Poprawna odpowiedź: {CORRECT_RESULT}
                    </>
                  )}
                </span>
              )}
            </form>

            {answered && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex justify-center overflow-x-auto">
                  <ColumnGrid
                    color={color}
                    operator="×"
                    cells={CORRECT_CELLS}
                    showPlaceLabels
                    reserveAnnotationRow
                    ariaLabel={`Poprawny zapis: ${NUMBER} razy ${MULTIPLIER}, wynik ${CORRECT_RESULT}`}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

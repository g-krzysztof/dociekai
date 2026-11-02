'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { RulerVisual } from './ruler-visual';

const EDGE_MARGIN_MM = 8;

interface Claim {
  id: string;
  label: string;
  /** Biernik, do zdania „Kuba przyłożył ... do brzegu" (np. „zakładkę do książki"). */
  accusative: string;
  /** Dopełniacz, do zdania „Prawdziwa długość ...:" (np. „zakładki do książki"). */
  genitive: string;
  claimedMm: number;
  trueLengthMm: number;
  wrong: boolean;
}

/** Kuba przyłożył zakładkę do fizycznego brzegu starej linijki zamiast do kreski 0 — odczyt z podziałki wyszedł o 8 mm za mały. */
const CLAIMS: Claim[] = [
  { id: 'olowek', label: 'Ołówek', accusative: 'ołówek', genitive: 'ołówka', claimedMm: 82, trueLengthMm: 82, wrong: false },
  {
    id: 'zakladka',
    label: 'Zakładka do książki',
    accusative: 'zakładkę do książki',
    genitive: 'zakładki do książki',
    claimedMm: 42,
    trueLengthMm: 50,
    wrong: true,
  },
  { id: 'gumka', label: 'Gumka do mazania', accusative: 'gumkę do mazania', genitive: 'gumki do mazania', claimedMm: 34, trueLengthMm: 34, wrong: false },
];

interface RulerMistakeHuntProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: audyt cudzej pracy (ten sam wzorzec co `MistakeHunt` z
 * mnożenia pisemnego) — zamiast liczyć od zera, dziecko klika, który z trzech
 * już zapisanych pomiarów jest błędny, potem wpisuje poprawną długość.
 */
export function RulerMistakeHunt({ color, onComplete }: RulerMistakeHuntProps) {
  const [found, setFound] = useState(false);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [answered, setAnswered] = useState(false);

  const mistake = CLAIMS.find((claim) => claim.wrong)!;
  const isCorrectValue = Number(value.trim().replace(',', '.')) === mistake.trueLengthMm;

  const pick = (id: string) => {
    if (found) return;
    if (id === mistake.id) {
      setFound(true);
      return;
    }
    setWrongPick(id);
    setTimeout(() => setWrongPick(null), 500);
  };

  const submitValue = (event: FormEvent) => {
    event.preventDefault();
    if (answered || !value.trim()) return;
    setAnswered(true);
    if (Number(value.trim().replace(',', '.')) === mistake.trueLengthMm) onComplete?.();
  };

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Search className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Kuba zmierzył starą linijką trzy przedmioty i zapisał wyniki. Jeden pomiar jest błędny —
          kliknij go.
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        {!found ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {CLAIMS.map((claim) => (
              <button
                key={claim.id}
                type="button"
                onClick={() => pick(claim.id)}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-1 border-2 px-3 py-4 text-center transition-all',
                  wrongPick === claim.id
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40'
                    : 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={wrongPick === claim.id ? undefined : { borderColor: `${color}55` }}
              >
                {wrongPick === claim.id && <X className="h-4 w-4 shrink-0 text-rose-500" aria-hidden />}
                <span className="text-sm font-semibold">{claim.label}</span>
                <span className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
                  {claim.claimedMm} mm
                </span>
              </button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <p className="text-center text-sm leading-relaxed sm:text-base">
              <strong>Dokładnie tu!</strong> Kuba przyłożył {mistake.accusative} do fizycznego
              brzegu linijki, a nie do kreski 0. Ten brzeg to {EDGE_MARGIN_MM} mm martwej,
              nieoznaczonej podziałki — odczyt z linijki wyszedł o tyle za mały.
            </p>

            <div className="space-y-4">
              <div>
                <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-rose-500">
                  Tak zmierzył Kuba — od brzegu
                </p>
                <RulerVisual
                  color={color}
                  maxMm={70}
                  edgeMarginMm={EDGE_MARGIN_MM}
                  segmentStartMm={-EDGE_MARGIN_MM}
                  segmentEndMm={mistake.claimedMm}
                />
              </div>
              <div>
                <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Tak trzeba — od kreski 0
                </p>
                <RulerVisual
                  color={color}
                  maxMm={70}
                  segmentStartMm={0}
                  segmentEndMm={mistake.trueLengthMm}
                  highlightZero
                />
              </div>
            </div>

            <form onSubmit={submitValue} className="flex flex-wrap items-center justify-center gap-2">
              <label htmlFor="ruler-mistake-hunt-value" className="text-sm font-semibold">
                Prawdziwa długość {mistake.genitive}:
              </label>
              <Input
                id="ruler-mistake-hunt-value"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={answered}
                inputMode="numeric"
                autoComplete="off"
                placeholder="mm"
                className={cn(
                  'w-24 font-mono text-base',
                  answered && isCorrectValue && 'border-emerald-500',
                  answered && !isCorrectValue && 'border-rose-400'
                )}
              />
              <span className="text-sm text-muted-foreground">mm</span>
              {!answered && (
                <Button type="submit" disabled={!value.trim()}>
                  Sprawdź
                </Button>
              )}
              {answered && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm font-semibold',
                    isCorrectValue ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {isCorrectValue ? (
                    <>
                      <Check className="h-4 w-4" /> Dobrze!
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" /> Poprawnie: {mistake.trueLengthMm} mm
                    </>
                  )}
                </span>
              )}
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

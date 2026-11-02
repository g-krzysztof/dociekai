'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Receipt, Sparkles, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { buildDecimalAddition } from '../../../lib/decimal-addition';
import { ColumnAddGrid } from './column-add-grid';

const ITEMS = [
  { name: 'sok', price: '2,80' },
  { name: 'bułka', price: '1,45' },
  { name: 'jabłko', price: '0,90' },
];

type Step = 'q1' | 'q2' | 'closer' | 'done';

function eq(value: string, expected: string): boolean {
  return value.trim().replace(/\s/g, '').replace('.', ',') === expected;
}

interface ShopTotalTaskProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: rachunek ze szkolnego sklepiku. Dziecko najpierw sumuje
 * trzy kwoty (grosze pod groszami), potem dokłada czwarty produkt do gotowej
 * sumy, a na końcu sprawdza, czy banknot 10 zł wystarczy. Każdą odpowiedź
 * potwierdza rozpisany słupek.
 */
export function ShopTotalTask({ color, onComplete }: ShopTotalTaskProps) {
  const [step, setStep] = useState<Step>('q1');
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const [closerPick, setCloserPick] = useState<'tak' | 'nie' | null>(null);
  const containerRef = useSectionScrollAnchor(`${step}-${a1}-${a2}-${closerPick ?? ''}`);

  const ok1 = eq(v1, '5,15');
  const ok2 = eq(v2, '6,35');

  const sum1a = buildDecimalAddition('2,80', '1,45');
  const sum1b = buildDecimalAddition('4,25', '0,90');
  const sum2 = buildDecimalAddition('5,15', '1,20');

  const submit1 = (event: FormEvent) => {
    event.preventDefault();
    if (a1 || !v1.trim()) return;
    setA1(true);
  };
  const submit2 = (event: FormEvent) => {
    event.preventDefault();
    if (a2 || !v2.trim()) return;
    setA2(true);
  };

  if (step === 'done') {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Rachunek policzony co do grosza</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Kwoty w złotych to ułamki dziesiętne z dwoma miejscami po przecinku. Dodajesz je tak samo
          jak każde inne liczby z przecinkiem: grosze pod groszami, złote pod złotymi, przecinek pod
          przecinkiem.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* Paragon */}
      <div className="mx-auto mb-5 w-fit border-2 border-dashed p-4" style={{ borderColor: `${color}59` }}>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <Receipt className="h-4 w-4" style={{ color }} aria-hidden />
          Sklepik szkolny
        </p>
        <ul className="space-y-1 font-mono text-sm">
          {ITEMS.map((item) => (
            <li key={item.name} className="flex justify-between gap-8">
              <span>{item.name}</span>
              <span className="tabular-nums" style={{ color }}>
                {item.price} zł
              </span>
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence mode="wait">
        {/* Runda 1 — suma trzech kwot */}
        {step === 'q1' && (
          <motion.div
            key="q1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <p className="mb-4 text-base font-bold leading-snug sm:text-lg">
              Ile kosztują razem te trzy rzeczy?
            </p>
            <form onSubmit={submit1} className="flex flex-wrap items-center gap-2">
              <Input
                value={v1}
                onChange={(event) => setV1(event.target.value)}
                disabled={a1}
                inputMode="decimal"
                autoComplete="off"
                placeholder="np. 5,15"
                className={cn(
                  'w-32 font-mono text-base',
                  a1 && ok1 && 'border-emerald-500',
                  a1 && !ok1 && 'border-rose-400'
                )}
              />
              <span className="text-sm text-muted-foreground">zł</span>
              {!a1 ? (
                <Button type="submit" disabled={!v1.trim()}>
                  Sprawdź
                </Button>
              ) : (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm font-semibold',
                    ok1 ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {ok1 ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  {ok1 ? 'Dobrze!' : 'Poprawnie: 5,15 zł'}
                </span>
              )}
            </form>

            {a1 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                <p className="mb-3 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  Dodajemy dwie kwoty naraz. Najpierw sok i bułka, potem do wyniku jabłko.
                </p>
                <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-4">
                  <ColumnAddGrid addition={sum1a} color={color} revealed={sum1a.columns.length} showAllZeros />
                  <ColumnAddGrid addition={sum1b} color={color} revealed={sum1b.columns.length} showAllZeros />
                </div>
                <p className="mt-3 text-center font-mono text-base font-bold" style={{ color }}>
                  2,80 + 1,45 + 0,90 = 5,15 zł
                </p>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setStep('q2')}>Dalej</Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Runda 2 — dokładamy czwarty produkt */}
        {step === 'q2' && (
          <motion.div
            key="q2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <p className="mb-4 text-base font-bold leading-snug sm:text-lg">
              Dokładasz jeszcze wodę za <span style={{ color }}>1,20 zł</span>. Jaki jest teraz cały
              rachunek? (poprzednia suma to 5,15 zł)
            </p>
            <form onSubmit={submit2} className="flex flex-wrap items-center gap-2">
              <Input
                value={v2}
                onChange={(event) => setV2(event.target.value)}
                disabled={a2}
                inputMode="decimal"
                autoComplete="off"
                placeholder="np. 6,35"
                className={cn(
                  'w-32 font-mono text-base',
                  a2 && ok2 && 'border-emerald-500',
                  a2 && !ok2 && 'border-rose-400'
                )}
              />
              <span className="text-sm text-muted-foreground">zł</span>
              {!a2 ? (
                <Button type="submit" disabled={!v2.trim()}>
                  Sprawdź
                </Button>
              ) : (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm font-semibold',
                    ok2 ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {ok2 ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  {ok2 ? 'Dobrze!' : 'Poprawnie: 6,35 zł'}
                </span>
              )}
            </form>

            {a2 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                <div className="flex justify-center">
                  <ColumnAddGrid addition={sum2} color={color} revealed={sum2.columns.length} showAllZeros />
                </div>
                <p className="mt-3 text-center font-mono text-base font-bold" style={{ color }}>
                  5,15 + 1,20 = 6,35 zł
                </p>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setStep('closer')}>Dalej</Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Zamknięcie — czy 10 zł wystarczy */}
        {step === 'closer' && (
          <motion.div
            key="closer"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <p className="mb-4 text-base font-bold leading-snug sm:text-lg">
              Płacisz banknotem 10 zł. Czy wystarczy na rachunek 6,35 zł?
            </p>
            <div className="grid gap-2 sm:max-w-xs">
              {(['tak', 'nie'] as const).map((option) => {
                const reveal = closerPick !== null;
                const isPick = closerPick === option;
                const isAnswer = option === 'tak';
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => closerPick === null && setCloserPick(option)}
                    disabled={reveal}
                    className={cn(
                      'flex items-center gap-3 border px-4 py-3 text-left text-sm transition-all sm:text-base',
                      !reveal && 'cursor-pointer hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                      reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                      reveal && isPick && !isAnswer && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                      reveal && !isPick && !isAnswer && 'opacity-55'
                    )}
                  >
                    {option === 'tak' ? 'Tak, wystarczy' : 'Nie, za mało'}
                  </button>
                );
              })}
            </div>

            {closerPick && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
              >
                6,35 zł to mniej niż 10 zł — porównujemy części całkowite: 6 &lt; 10. Wystarczy, a
                reszty dostaniesz 10,00 − 6,35 = 3,65 zł.
              </motion.div>
            )}

            {closerPick && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => {
                    setStep('done');
                    onComplete?.();
                  }}
                >
                  <Check className="mr-1 h-4 w-4" /> Zakończ zadanie
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

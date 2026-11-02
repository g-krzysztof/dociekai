'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Package, Sparkles, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { ScaleShiftMini } from './scale-shift-mini';

type Step = 'q1' | 'q2' | 'q3' | 'closer' | 'done';

function eq(value: string, expected: string): boolean {
  return value.trim().replace(/\s/g, '').replace('.', ',') === expected;
}

interface BulkPriceTaskProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: „hurt" — z ceny/masy paczki na jedną sztukę (dzielenie
 * przez 10/100/1000) i z jednej sztuki na dużą liczbę sztuk (mnożenie). Każdą
 * odpowiedź potwierdza mały obraz przeskoku przecinka. Kształt jak
 * `ShopTotalTask` z lekcji o dodawaniu.
 */
export function BulkPriceTask({ color, onComplete }: BulkPriceTaskProps) {
  const [step, setStep] = useState<Step>('q1');
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [v3, setV3] = useState('');
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const [a3, setA3] = useState(false);
  const [closerPick, setCloserPick] = useState<'tak' | 'nie' | null>(null);
  const containerRef = useSectionScrollAnchor(`${step}-${a1}-${a2}-${a3}-${closerPick ?? ''}`);

  const ok1 = eq(v1, '0,0045');
  const ok2 = eq(v2, '1,29');
  const ok3 = eq(v3, '80');

  const submit = (event: FormEvent, guard: boolean, setter: (v: boolean) => void, value: string) => {
    event.preventDefault();
    if (guard || !value.trim()) return;
    setter(true);
  };

  if (step === 'done') {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Hurt policzony przecinkiem</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          „Tyle sztuk waży tyle” → jedna sztuka to dzielenie przez 10, 100 albo 1000. „Jedna sztuka
          ma tyle” → dużo sztuk to mnożenie. Za każdym razem wystarczy przesunąć przecinek o tyle
          miejsc, ile zer.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        <Package className="h-4 w-4" style={{ color }} aria-hidden />
        Sklep z narzędziami — sprzedaż na sztuki
      </p>

      <AnimatePresence mode="wait">
        {step === 'q1' && (
          <motion.div
            key="q1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <p className="mb-4 text-base font-bold leading-snug sm:text-lg">
              Pudełko <span style={{ color }}>1000 gwoździ</span> waży 4,5 kg. Ile waży jeden gwóźdź?
            </p>
            <form onSubmit={(e) => submit(e, a1, setA1, v1)} className="flex flex-wrap items-center gap-2">
              <Input
                value={v1}
                onChange={(e) => setV1(e.target.value)}
                disabled={a1}
                inputMode="decimal"
                autoComplete="off"
                placeholder="np. 0,0045"
                className={cn('w-36 font-mono text-base', a1 && ok1 && 'border-emerald-500', a1 && !ok1 && 'border-rose-400')}
              />
              <span className="text-sm text-muted-foreground">kg</span>
              {!a1 ? (
                <Button type="submit" disabled={!v1.trim()}>
                  Sprawdź
                </Button>
              ) : (
                <span className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', ok1 ? 'text-emerald-600' : 'text-rose-600')}>
                  {ok1 ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  {ok1 ? 'Dobrze!' : 'Poprawnie: 0,0045 kg'}
                </span>
              )}
            </form>
            {a1 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                <div className="mb-3">
                  <ScaleShiftMini input="4,5" op="d1000" color={color} />
                </div>
                <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  „1000 sztuk waży 4,5 kg” → jedna sztuka to 4,5 : 1000. Przecinek o 3 w lewo, dwa zera
                  z przodu: 0,0045 kg.
                </p>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setStep('q2')}>Dalej</Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 'q2' && (
          <motion.div
            key="q2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <p className="mb-4 text-base font-bold leading-snug sm:text-lg">
              Paczka <span style={{ color }}>10 rolek</span> taśmy kosztuje 12,90 zł. Ile kosztuje jedna
              rolka?
            </p>
            <form onSubmit={(e) => submit(e, a2, setA2, v2)} className="flex flex-wrap items-center gap-2">
              <Input
                value={v2}
                onChange={(e) => setV2(e.target.value)}
                disabled={a2}
                inputMode="decimal"
                autoComplete="off"
                placeholder="np. 1,29"
                className={cn('w-32 font-mono text-base', a2 && ok2 && 'border-emerald-500', a2 && !ok2 && 'border-rose-400')}
              />
              <span className="text-sm text-muted-foreground">zł</span>
              {!a2 ? (
                <Button type="submit" disabled={!v2.trim()}>
                  Sprawdź
                </Button>
              ) : (
                <span className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', ok2 ? 'text-emerald-600' : 'text-rose-600')}>
                  {ok2 ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  {ok2 ? 'Dobrze!' : 'Poprawnie: 1,29 zł'}
                </span>
              )}
            </form>
            {a2 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                <div className="mb-3">
                  <ScaleShiftMini input="12,90" op="d10" color={color} />
                </div>
                <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  12,90 : 10 — przecinek o 1 w lewo: 1,290, czyli 1,29 zł. Zero na końcu można pominąć.
                </p>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setStep('q3')}>Dalej</Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 'q3' && (
          <motion.div
            key="q3"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <p className="mb-4 text-base font-bold leading-snug sm:text-lg">
              Jeden płaski klocek ma grubość <span style={{ color }}>0,8 cm</span>. Jak wysoka jest wieża
              ze 100 takich klocków?
            </p>
            <form onSubmit={(e) => submit(e, a3, setA3, v3)} className="flex flex-wrap items-center gap-2">
              <Input
                value={v3}
                onChange={(e) => setV3(e.target.value)}
                disabled={a3}
                inputMode="decimal"
                autoComplete="off"
                placeholder="np. 80"
                className={cn('w-28 font-mono text-base', a3 && ok3 && 'border-emerald-500', a3 && !ok3 && 'border-rose-400')}
              />
              <span className="text-sm text-muted-foreground">cm</span>
              {!a3 ? (
                <Button type="submit" disabled={!v3.trim()}>
                  Sprawdź
                </Button>
              ) : (
                <span className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', ok3 ? 'text-emerald-600' : 'text-rose-600')}>
                  {ok3 ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  {ok3 ? 'Dobrze!' : 'Poprawnie: 80 cm'}
                </span>
              )}
            </form>
            {a3 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                <div className="mb-3">
                  <ScaleShiftMini input="0,8" op="x100" color={color} />
                </div>
                <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  100 klocków to 0,8 · 100. Przecinek o 2 w prawo, jedno zero do dopisania: 80 cm.
                </p>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setStep('closer')}>Dalej</Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 'closer' && (
          <motion.div
            key="closer"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <p className="mb-4 text-base font-bold leading-snug sm:text-lg">
              A gdyby wieża miała <span style={{ color }}>1000</span> takich klocków po 0,8 cm — czy
              byłaby wyższa niż 5 metrów?
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
                    {option === 'tak' ? 'Tak, wyższa niż 5 m' : 'Nie, niższa niż 5 m'}
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
                0,8 · 1000 — przecinek o 3 w prawo, dwa zera do dopisania: 800 cm. A 800 cm to 8 m,
                więc wieża jest wyższa niż 5 m.
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

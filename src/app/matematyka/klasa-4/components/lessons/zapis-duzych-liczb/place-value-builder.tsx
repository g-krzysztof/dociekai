'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Delete, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { CLASS_LABELS, digitGroups, digitsOf } from './place-value';

interface Round {
  value: number;
  words: string;
}

const ROUNDS: Round[] = [
  { value: 2_500, words: 'dwa tysiące pięćset' },
  { value: 47_328, words: 'czterdzieści siedem tysięcy trzysta dwadzieścia osiem' },
  { value: 350_604, words: 'trzysta pięćdziesiąt tysięcy sześćset cztery' },
  { value: 5_200_018, words: 'pięć milionów dwieście tysięcy osiemnaście' },
];

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

interface PlaceValueBuilderProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: dziecko poznaje wzór „setki-dziesiątki-jedności” powtarzający
 * się w każdej klasie, potem sam buduje 4 coraz większe liczby z cyfr.
 */
export function PlaceValueBuilder({ color, onComplete }: PlaceValueBuilderProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [input, setInput] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${finished}`);

  const round = ROUNDS[roundIndex];
  const target = digitsOf(round.value);
  const groups = digitGroups(round.value);
  const complete = input.length === target.length;
  const allCorrect = complete && input.every((digit, i) => digit === target[i]);
  const moduleTextColor = `color-mix(in oklch, ${color} 88%, black)`;

  const pressDigit = (digit: number) => {
    if (checked || input.length >= target.length) return;
    setInput((prev) => [...prev, digit]);
  };

  const backspace = () => {
    if (checked || input.length === 0) return;
    setInput((prev) => prev.slice(0, -1));
  };

  const check = () => setChecked(true);

  const next = () => {
    if (roundIndex + 1 < ROUNDS.length) {
      setRoundIndex((prev) => prev + 1);
      setInput([]);
      setChecked(false);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Umiesz już budować duże liczby!</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Od 4 cyfr aż po miliony — ten sam wzór klas działa za każdym razem. W następnym kroku
          zobaczysz, jak te liczby się czyta na głos.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Legenda: wzór powtarzający się w każdej klasie */}
      <div className="border p-5 sm:p-6" style={{ backgroundColor: `${color}0a` }}>
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Duże liczby dzielimy na <strong>klasy</strong> — grupy po trzy cyfry, licząc od prawej.
          W każdej klasie powtarza się dokładnie ten sam wzór:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {(['setki', 'dziesiątki', 'jedności'] as const).map((name) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              <span
                className="flex h-11 w-11 items-center justify-center border font-mono text-lg font-bold"
                style={{ borderColor: `${color}59`, color }}
              >
                •
              </span>
              <span className="text-xs font-semibold text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Ten sam wzór wraca w klasie jedności, w klasie tysięcy i w klasie milionów.
        </p>
      </div>

      {/* Ćwiczenie budowania liczby */}
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          {ROUNDS.map((_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 transition-colors"
              style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
            />
          ))}
          <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
            {roundIndex + 1}/{ROUNDS.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={roundIndex}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <p className="mb-5 text-base font-bold leading-snug sm:text-lg">
              Zbuduj liczbę: <span style={{ color: moduleTextColor }}>„{round.words}”</span>
            </p>

            {/* Sloty na cyfry, pogrupowane w klasy */}
            <div className="mb-6 flex flex-wrap items-end justify-center gap-x-5 gap-y-3">
              {groups.map((group, gi) => {
                const startIndex = groups.slice(0, gi).reduce((sum, g) => sum + g.digits.length, 0);
                return (
                  <div key={gi} className="flex flex-col items-center gap-1.5">
                    <div className="flex gap-1">
                      {group.digits.map((_, di) => {
                        const flatIndex = startIndex + di;
                        const filled = flatIndex < input.length;
                        const isNext = flatIndex === input.length;
                        const isCorrect = checked && filled && input[flatIndex] === target[flatIndex];
                        const isWrong = checked && filled && input[flatIndex] !== target[flatIndex];

                        return (
                          <span
                            key={di}
                            className={cn(
                              'flex h-11 w-9 items-center justify-center border font-mono text-xl font-bold tabular-nums sm:h-12 sm:w-10 sm:text-2xl',
                              !checked && isNext && 'border-2',
                              isCorrect && 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40',
                              isWrong && 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                            )}
                            style={!checked && isNext ? { borderColor: color } : undefined}
                          >
                            {filled ? input[flatIndex] : ''}
                          </span>
                        );
                      })}
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {CLASS_LABELS[group.className]}
                    </span>
                  </div>
                );
              })}
            </div>

            {!checked ? (
              <div className="flex flex-col items-center gap-4">
                <div className="grid grid-cols-5 gap-2">
                  {KEYPAD.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => pressDigit(Number(label))}
                      disabled={input.length >= target.length}
                      className="h-11 w-11 cursor-pointer border font-mono text-lg font-bold transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={backspace}
                    disabled={input.length === 0}
                    aria-label="Cofnij ostatnią cyfrę"
                    className="col-span-2 flex h-11 items-center justify-center gap-1.5 border text-sm font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                  >
                    <Delete className="h-4 w-4" aria-hidden />
                    Cofnij
                  </button>
                </div>
                {complete && <Button onClick={check}>Sprawdź</Button>}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex items-start gap-3 p-4 text-sm leading-relaxed',
                  allCorrect
                    ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                    : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
                )}
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>
                  <strong>{allCorrect ? 'Dobrze! ' : 'Prawie. '}</strong>
                  {allCorrect ? (
                    'Cyfry trafiły na właściwe miejsca w każdej klasie.'
                  ) : (
                    <>
                      Poprawny zapis to <strong>{target.join('')}</strong>. Sprawdź, w której klasie
                      cyfra nie pasowała.
                    </>
                  )}
                </p>
              </motion.div>
            )}

            {checked && (
              <div className="mt-4 flex justify-end">
                <Button onClick={next}>
                  {roundIndex + 1 < ROUNDS.length ? (
                    'Następna liczba'
                  ) : (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Zakończ
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

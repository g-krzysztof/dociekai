'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

export interface AuditRound {
  id: string;
  /** Czyja to praca — żeby było jasne, że oceniamy cudzy zeszyt, nie własny błąd. */
  who: string;
  story: string;
  /** Rozpisane rozwiązanie, linijka po linijce — dokładnie jedna z nich jest błędna. */
  lines: string[];
  wrongIndex: number;
  /** Podpowiedź po kliknięciu w dobrą linijkę — ma kierować, nie karcić. */
  hint: string;
  fixPrompt: string;
  answer: string;
  unit?: string;
  note: string;
}

interface SumMistakeAuditProps {
  color: string;
  rounds: AuditRound[];
  onComplete?: () => void;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(',', '.');
}

/**
 * Audyt cudzej pracy: dziecko nie liczy od zera, tylko wskazuje palcem
 * konkretną linijkę, w której rozwiązanie się wykoleiło, a dopiero potem
 * dopisuje poprawkę (ten sam układ co `MistakeHunt`/`PrzesuniecieHunt`).
 * Trzy rundy celują w trzy różne, typowe pomyłki: dodany mianownik,
 * zostawiony ułamek niewłaściwy w liczbie mieszanej i użycie reguły
 * jednakowych mianowników tam, gdzie mianowniki są różne.
 *
 * Kliknięcie w poprawną linijkę nic nie blokuje — daje drgnięcie i zdanie
 * o tym, dlaczego akurat ta linijka jest w porządku.
 */
export function SumMistakeAudit({ color, rounds, onComplete }: SumMistakeAuditProps) {
  const [index, setIndex] = useState(0);
  const [found, setFound] = useState(false);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [value, setValue] = useState('');
  const [fixed, setFixed] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${found}-${fixed}`);

  const round = rounds[index];
  const isLast = index === rounds.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const pickLine = (i: number) => {
    if (found) return;
    if (i === round.wrongIndex) {
      setFound(true);
      return;
    }
    setShakeIndex(i);
    setShakeKey((prev) => prev + 1);
  };

  const submitFix = (event: FormEvent) => {
    event.preventDefault();
    if (fixed) return;
    if (normalize(value) === normalize(round.answer)) {
      setFixed(true);
      setWrongAnswer(false);
      return;
    }
    setWrongAnswer(true);
    setShakeKey((prev) => prev + 1);
  };

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setFound(false);
      setShakeIndex(null);
      setValue('');
      setFixed(false);
      setWrongAnswer(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {rounds.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{rounds.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={round.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
            {round.who}
          </p>
          <p className="mb-4 text-sm leading-relaxed sm:text-base">{round.story}</p>

          <p className="mb-2 text-sm font-semibold">
            {found ? 'Znalezione. Teraz dopisz poprawkę.' : 'Kliknij linijkę, w której rozwiązanie się wykoleiło.'}
          </p>

          <ol className="divide-y border">
            {round.lines.map((line, i) => {
              const isWrong = i === round.wrongIndex;
              const shaking = shakeIndex === i && !found;
              return (
                <li key={line}>
                  <motion.button
                    type="button"
                    onClick={() => pickLine(i)}
                    disabled={found}
                    animate={shaking ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    key={shaking ? `${i}-${shakeKey}` : i}
                    transition={{ duration: 0.35 }}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left font-mono text-sm transition-colors',
                      !found && 'hover:bg-muted/50',
                      found && isWrong && 'bg-rose-50 dark:bg-rose-950/40',
                      found && !isWrong && 'opacity-60'
                    )}
                  >
                    <span className="w-5 shrink-0 font-mono text-sm font-bold leading-none tabular-nums" style={{ color }}>
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 leading-relaxed">{line}</span>
                    {found && isWrong && <PenLine className="h-4 w-4 shrink-0 text-rose-600" aria-hidden />}
                  </motion.button>
                </li>
              );
            })}
          </ol>

          {!found && shakeIndex !== null && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {round.hint}
            </motion.p>
          )}

          {found && !fixed && (
            <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onSubmit={submitFix} className="mt-4 border p-4" style={{ borderColor: `${color}40` }}>
              <p className="mb-3 text-sm leading-relaxed">{round.fixPrompt}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value);
                    setWrongAnswer(false);
                  }}
                  inputMode="numeric"
                  className="w-28"
                  aria-label="Twoja poprawka"
                />
                {round.unit && <span className="text-sm text-muted-foreground">{round.unit}</span>}
                <Button type="submit" style={{ backgroundColor: color }} className="text-white hover:opacity-90">
                  Sprawdź
                </Button>
              </div>
              {wrongAnswer && (
                <motion.p key={shakeKey} animate={{ x: [0, -6, 6, -4, 4, 0] }} transition={{ duration: 0.35 }} className="mt-3 text-sm text-rose-600">
                  Jeszcze nie to. Spróbuj raz jeszcze — nic się nie psuje.
                </motion.p>
              )}
            </motion.form>
          )}

          {fixed && (
            <>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-start gap-3 bg-emerald-50 p-4 dark:bg-emerald-950/40">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">{round.note}</p>
              </motion.div>
              <div className="mt-4 flex justify-end">
                <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
                  {isLast ? 'Do quizu' : 'Następny zeszyt'}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Check, Paintbrush } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

type Kind = 'objetosc' | 'powierzchnia';

interface Question {
  id: string;
  text: string;
  kind: Kind;
  why: string;
}

/**
 * Sześć pytań ze świata. Połowa pyta o wnętrze, połowa o zewnętrze — i tylko to
 * je różni, bo bryła w obu przypadkach bywa ta sama.
 */
const QUESTIONS: Question[] = [
  {
    id: 'piasek',
    text: 'Ile piasku zmieści się w skrzyni?',
    kind: 'objetosc',
    why: 'Piasek wchodzi do środka — pytamy, ile się mieści, więc to objętość.',
  },
  {
    id: 'farba',
    text: 'Ile farby trzeba, żeby pomalować skrzynię z zewnątrz?',
    kind: 'powierzchnia',
    why: 'Farba kładzie się na ścianach. Liczy się to, co widać z zewnątrz — pole powierzchni.',
  },
  {
    id: 'papier',
    text: 'Ile papieru pójdzie na owinięcie prezentu?',
    kind: 'powierzchnia',
    why: 'Papier okrywa ściany pudełka, czyli jego siatkę. To pole powierzchni.',
  },
  {
    id: 'woda',
    text: 'Ile litrów wody wleje się do akwarium?',
    kind: 'objetosc',
    why: 'Woda wypełnia wnętrze — pytanie o litry to zawsze pytanie o objętość.',
  },
  {
    id: 'plytki',
    text: 'Iloma płytkami trzeba wyłożyć ściany basenu?',
    kind: 'powierzchnia',
    why: 'Płytki przyklejają się do ścian, jedna obok drugiej — liczymy pole, nie zawartość.',
  },
  {
    id: 'klocki',
    text: 'Ile klocków o boku 1 cm zapełni pudełko?',
    kind: 'objetosc',
    why: 'Klocki wchodzą do środka warstwami. Liczba kostek jednostkowych to objętość.',
  },
];

const KINDS: { id: Kind; label: string; hint: string; icon: typeof Box }[] = [
  { id: 'objetosc', label: 'Objętość', hint: 'ile się MIEŚCI w środku', icon: Box },
  { id: 'powierzchnia', label: 'Pole powierzchni', hint: 'ile trzeba, żeby OBŁOŻYĆ z zewnątrz', icon: Paintbrush },
];

/**
 * Rozgrzewka: **jedno pytanie, dwa różne pomiary.** Poprzednia lekcja liczyła
 * objętość, ta liczy pole powierzchni — a najczęstszy błąd w całym module to
 * pomylenie tych dwóch. Zamiast tłumaczyć różnicę zdaniem, każemy ją rozstrzygać
 * sześć razy z rzędu na pytaniach ze świata.
 *
 * Zły wybór drga i mówi dlaczego, nigdy nie blokuje. Rozstrzyga pole `kind`
 * w danych, a uzasadnienia siedzą w liście `sr-only`, więc treść odsłaniana
 * klikiem jest w DOM od początku.
 */
export function VolumeOrSurface({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [picked, setPicked] = useState<Record<string, Kind>>({});
  const [wrong, setWrong] = useState<Record<string, Kind | null>>({});
  const solvedCount = QUESTIONS.filter((q) => picked[q.id] === q.kind).length;
  const allDone = solvedCount === QUESTIONS.length;
  const containerRef = useSectionScrollAnchor(allDone ? 'done' : String(solvedCount));
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const pick = (question: Question, kind: Kind) => {
    if (picked[question.id] === question.kind) return;
    if (kind === question.kind) {
      const next = { ...picked, [question.id]: kind };
      setWrong((prev) => ({ ...prev, [question.id]: null }));
      setPicked(next);
      if (QUESTIONS.every((q) => next[q.id] === q.kind)) onComplete?.();
      return;
    }
    setWrong((prev) => ({ ...prev, [question.id]: kind }));
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {KINDS.map(({ id, label, hint, icon: Icon }) => (
          <div key={id} className="border-l-2 p-3" style={{ borderColor: color, backgroundColor: `${color}0d` }}>
            <p className="flex items-center gap-2 font-bold" style={{ color: textColor }}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      <ol className="divide-y border">
        {QUESTIONS.map((question) => {
          const choice = picked[question.id];
          const solved = choice === question.kind;
          const missed = wrong[question.id];

          return (
            <li key={question.id} className="p-4">
              <p className="mb-3 text-sm sm:text-base">{question.text}</p>
              <motion.div
                key={`${question.id}-${missed ?? 'none'}-${solved}`}
                animate={missed && !solved ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
                transition={{ duration: 0.4 }}
                className="grid gap-2 sm:grid-cols-2"
              >
                {KINDS.map(({ id, label }) => {
                  const isAnswer = id === question.kind;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => pick(question, id)}
                      disabled={solved}
                      className={cn(
                        'cursor-pointer border px-3 py-2 text-center text-sm font-semibold transition-all',
                        !solved && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                        solved && !isAnswer && 'opacity-40',
                        solved && 'cursor-default',
                      )}
                      style={
                        (solved && isAnswer) || (missed === id && !solved)
                          ? {
                              borderColor: color,
                              backgroundColor: isAnswer ? `${color}1a` : undefined,
                              color: isAnswer ? textColor : undefined,
                            }
                          : undefined
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </motion.div>
              <AnimatePresence>
                {(solved || missed) && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    {solved
                      ? question.why
                      : 'Jeszcze nie. Zapytaj siebie: czy coś wchodzi do ŚRODKA, czy kładzie się NA ścianach?'}
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-center text-sm text-muted-foreground">
        Rozstrzygnięte{' '}
        <span className="font-mono font-bold tabular-nums" style={{ color }}>
          {solvedCount}
        </span>{' '}
        z {QUESTIONS.length}
      </p>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 border-t-2 p-4"
          style={{ borderColor: color, backgroundColor: `${color}0f` }}
        >
          <p className="flex items-center gap-2 font-bold" style={{ color: textColor }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Wszystkie sześć rozstrzygnięte
          </p>
          <p className="mt-1 text-sm leading-relaxed">
            Ta sama skrzynia, dwa zupełnie różne pytania. Objętość liczyłeś na poprzedniej lekcji —
            teraz czas na to, co na zewnątrz.
          </p>
        </motion.div>
      )}

      <ul className="sr-only">
        {QUESTIONS.map((question) => (
          <li key={question.id}>
            {question.text} To pytanie o{' '}
            {question.kind === 'objetosc' ? 'objętość' : 'pole powierzchni'}. {question.why}
          </li>
        ))}
      </ul>
    </div>
  );
}

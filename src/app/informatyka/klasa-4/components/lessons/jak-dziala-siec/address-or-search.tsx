'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Search, TextCursorInput, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Ćwiczenie lekcji: pięć sytuacji, w których trzeba rozstrzygnąć, czy wpisać
 * dokładny adres, czy skorzystać z wyszukiwarki. To ćwiczenie, nie test — zła
 * odpowiedź nie zamyka pozycji i nie pokazuje właściwej, tylko odsyła do jednego
 * pytania: czy znam dokładny adres tej strony? Odpowiedzi rozrzucone
 * (szukanie, adres, szukanie, adres, szukanie). Blok kończy się po poprawnym
 * rozstrzygnięciu wszystkich pięciu.
 */

const OPTIONS = [
  { id: 'adres', label: 'Wpiszę adres', icon: TextCursorInput },
  { id: 'szukanie', label: 'Użyję wyszukiwarki', icon: Search },
] as const;

type OptionId = (typeof OPTIONS)[number]['id'];

interface Scenario {
  id: string;
  text: string;
  answer: OptionId;
  note: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'wieza',
    text: 'Chcesz zobaczyć zdjęcia wieży Eiffla nocą.',
    answer: 'szukanie',
    note: 'Nie znasz żadnego adresu, tylko opis tego, czego szukasz. Wpisz słowa do wyszukiwarki, a ona pokaże pasujące strony.',
  },
  {
    id: 'zeszyt',
    text: 'Nauczyciel podał ci w zeszycie adres: dociekai.pl.',
    answer: 'adres',
    note: 'Masz dokładny adres. Wpisz go w pasku adresu — trafisz od razu na tę jedną stronę, bez przeglądania listy wyników.',
  },
  {
    id: 'szkola',
    text: 'Chcesz wejść na stronę swojej szkoły, ale nie pamiętasz adresu.',
    answer: 'szukanie',
    note: 'Wpisz nazwę szkoły i miejscowość do wyszukiwarki. Gdy już znajdziesz właściwą stronę, dodaj ją do ulubionych — następnym razem nie będziesz szukać.',
  },
  {
    id: 'plakat',
    text: 'Na plakacie konkursu zapamiętałeś/zapamiętałaś krótki adres strony.',
    answer: 'adres',
    note: 'Adres masz w głowie — wpisz go wprost. Wyszukiwarka byłaby tu okrężną drogą do miejsca, które już znasz.',
  },
  {
    id: 'slonce',
    text: 'Chcesz sprawdzić, o której jutro wschodzi słońce w twoim mieście.',
    answer: 'szukanie',
    note: 'To pytanie, nie adres. Zadaj je wyszukiwarce własnymi słowami — odpowiedź pokaże się od razu nad listą stron.',
  },
];

interface AddressOrSearchProps {
  color: string;
  onComplete?: () => void;
}

export function AddressOrSearch({ color, onComplete }: AddressOrSearchProps) {
  const [answers, setAnswers] = useState<Record<string, OptionId>>({});

  const solved = SCENARIOS.filter((scenario) => answers[scenario.id] === scenario.answer).length;
  const finished = solved === SCENARIOS.length;

  const choose = (scenario: Scenario, optionId: OptionId) => {
    if (answers[scenario.id] === scenario.answer) return;
    const next = { ...answers, [scenario.id]: optionId };
    setAnswers(next);
    if (SCENARIOS.every((item) => next[item.id] === item.answer)) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      {/* Dwie drogi */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="border p-3" style={{ borderColor: `${color}55` }}>
          <p className="mb-1.5 flex items-center gap-2 font-bold" style={{ color }}>
            <TextCursorInput className="h-4 w-4 shrink-0" aria-hidden />
            Wpisz adres
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Gdy wiesz <strong>dokładnie</strong>, na którą stronę chcesz wejść, i znasz jej adres.
            Przeglądarka idzie tam prosto.
          </p>
        </div>
        <div className="border p-3" style={{ borderColor: `${color}55` }}>
          <p className="mb-1.5 flex items-center gap-2 font-bold" style={{ color }}>
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            Użyj wyszukiwarki
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Gdy wiesz, <strong>czego</strong> szukasz, ale nie znasz adresu. Opisujesz to słowami, a
            wyszukiwarka daje listę stron.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Pięć sytuacji. W każdej wybierz, <strong>jak najszybciej dotrzesz na miejsce</strong>.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {solved}/{SCENARIOS.length}
        </p>
      </div>

      <ol className="space-y-4">
        {SCENARIOS.map((scenario, index) => {
          const said = answers[scenario.id];
          const settled = said === scenario.answer;
          const wrong = said !== undefined && !settled;

          return (
            <li key={scenario.id} className="border p-3 sm:p-4">
              <p className="mb-3 flex gap-2 text-sm leading-relaxed sm:text-base">
                <span className="font-mono font-bold" style={{ color }}>
                  {index + 1}.
                </span>
                <span>{scenario.text}</span>
              </p>

              <div className="flex flex-wrap gap-2">
                {OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const picked = said === option.id;
                  const isRight = settled && picked;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => choose(scenario, option.id)}
                      disabled={settled}
                      aria-pressed={picked}
                      className={cn(
                        'inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                        settled ? 'cursor-default' : 'cursor-pointer hover:bg-muted/60',
                        picked && !isRight && 'border-red-600 text-red-700 dark:text-red-400'
                      )}
                      style={
                        isRight ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined
                      }
                    >
                      {isRight ? (
                        <Check className="h-4 w-4 shrink-0" aria-hidden />
                      ) : (
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      )}
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {said !== undefined && (
                  <motion.p
                    key={settled ? 'ok' : 'nope'}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 border-l-2 pl-3 text-sm leading-relaxed"
                    style={{ borderColor: settled ? color : '#dc2626' }}
                  >
                    {wrong ? (
                      <>
                        <span className="mr-1 inline-flex items-center font-semibold text-red-700 dark:text-red-400">
                          <X className="mr-1 h-4 w-4" aria-hidden />
                          Jeszcze nie.
                        </span>
                        Zadaj sobie jedno pytanie: czy znam dokładny adres tej strony?
                      </>
                    ) : (
                      scenario.note
                    )}
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Jedno pytanie rozstrzyga za każdym razem:</strong> znam dokładny adres, czy tylko
            wiem, czego szukam? Adres → wpisz go w pasku adresu. Opis → oddaj słowa wyszukiwarce.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

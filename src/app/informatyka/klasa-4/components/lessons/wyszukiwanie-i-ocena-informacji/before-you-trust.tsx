'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Zamknięcie lekcji: dziecko składa własną krótką listę pytań, które zadaje
 * sobie, zanim uwierzy w coś z sieci. Wybiera dokładnie trzy z sześciu — bo
 * lista, której nie da się zapamiętać, nie działa. Potem dostaje ją jako kartkę.
 *
 * Wzorzec „zbuduj regułę z klocków” z `NamingRule` — nie „wybierz jedną z listy”.
 * Bez dobrze/źle: każde z pytań jest sensowne, chodzi o wybór własnych trzech.
 */

const QUESTIONS = [
  'Kto to napisał? Czy jest podpisany autor?',
  'Kiedy to powstało? Czy jest data?',
  'Czy potwierdza to drugie, poważne źródło?',
  'Czy ktoś chce mi przy okazji coś sprzedać?',
  'Czy każą mi się spieszyć albo natychmiast udostępnić?',
  'Czy to brzmi zbyt dobrze (albo zbyt strasznie), żeby było prawdą?',
];

const PICK_COUNT = 3;

interface BeforeYouTrustProps {
  color: string;
  onComplete?: () => void;
}

export function BeforeYouTrust({ color, onComplete }: BeforeYouTrustProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const toggle = (question: string) => {
    if (saved) return;
    setPicked((prev) => {
      if (prev.includes(question)) return prev.filter((item) => item !== question);
      if (prev.length >= PICK_COUNT) return prev;
      return [...prev, question];
    });
  };

  const save = () => {
    if (saved || picked.length !== PICK_COUNT) return;
    setSaved(true);
    onComplete?.();
  };

  /** Kolejność na kartce zgodna z listą, nie z kolejnością klikania. */
  const chosenInOrder = QUESTIONS.filter((question) => picked.includes(question));

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Złóż swoją listę „zanim uwierzę”. <strong>Zaznacz trzy pytania</strong> — te, które
        najłatwiej ci będzie sobie zadać za każdym razem. Trzy, bo dłuższej listy nikt nie pamięta.
      </p>

      <ul className="space-y-2">
        {QUESTIONS.map((question) => {
          const isOn = picked.includes(question);
          const blocked = !isOn && picked.length >= PICK_COUNT && !saved;
          return (
            <li key={question}>
              <button
                type="button"
                onClick={() => toggle(question)}
                disabled={saved || blocked}
                aria-pressed={isOn}
                className={cn(
                  'flex w-full items-start gap-3 border p-3 text-left text-sm leading-relaxed transition-colors',
                  saved || blocked ? 'cursor-default' : 'cursor-pointer hover:bg-muted/40',
                  isOn && 'font-medium',
                  blocked && 'opacity-45'
                )}
                style={isOn ? { borderColor: color, backgroundColor: `${color}12` } : undefined}
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border"
                  style={
                    isOn
                      ? { backgroundColor: color, borderColor: color }
                      : { borderColor: 'var(--border)' }
                  }
                >
                  {isOn && <Check className="h-3.5 w-3.5 text-white" aria-hidden />}
                </span>
                <span className="min-w-0">{question}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-muted-foreground">
        Wybrano {picked.length} z {PICK_COUNT}.
      </p>

      {!saved && (
        <button
          type="button"
          onClick={save}
          disabled={picked.length !== PICK_COUNT}
          className={cn(
            'mt-4 inline-flex items-center gap-2 border-2 px-4 py-2 text-sm font-semibold transition-colors',
            picked.length === PICK_COUNT
              ? 'cursor-pointer hover:bg-muted/50'
              : 'cursor-not-allowed opacity-40'
          )}
          style={{ borderColor: color, color }}
        >
          To moja lista
        </button>
      )}

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto mt-6 max-w-md border-t-2 p-6 text-center"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color }}>
            Zanim uwierzę, pytam
          </p>
          <ol className="mt-4 space-y-2 text-left">
            {chosenInOrder.map((question, index) => (
              <li key={question} className="flex gap-2.5 text-sm font-medium leading-snug sm:text-base">
                <span className="font-mono font-bold" style={{ color }}>
                  {index + 1}.
                </span>
                <span>{question}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">
            Przepisz to na kartkę przy biurku. Gdy w sieci coś cię zaskoczy — przejdź te trzy
            pytania, zanim to podasz dalej.
          </p>
        </motion.div>
      )}
    </div>
  );
}

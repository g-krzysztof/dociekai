'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Ćwiczenie lekcji: dziecko układa osiem programów według tego, do czego służą
 * — pisanie tekstu, rysowanie, liczby, pokaz slajdów — a nie według nazwy albo
 * tego, kto je zrobił. Przy trafieniu dostaje krótką notatkę z licencją
 * programu (płatny / darmowy / open source), co przygotowuje grunt pod dylemat
 * i zadanie Z-2.
 *
 * To ćwiczenie, nie test: zła odpowiedź nie zamyka pozycji i nie pokazuje
 * właściwej (byłaby ściągą), tylko odsyła do jednego pytania — co ten program
 * tworzy. Blok kończy się po poprawnym rozstrzygnięciu wszystkich ośmiu.
 *
 * Poprawne odpowiedzi są rozrzucone po pozycjach (1,2,3,4,4,2,1,3), żeby dziecko
 * nie łapało rytmu zamiast myśleć — ta sama zasada co w całym kursie.
 */

const PURPOSES = [
  { id: 'tekst', label: 'Pisanie tekstu' },
  { id: 'obraz', label: 'Rysowanie i zdjęcia' },
  { id: 'liczby', label: 'Liczby i tabele' },
  { id: 'pokaz', label: 'Pokaz slajdów' },
] as const;

type PurposeId = (typeof PURPOSES)[number]['id'];

interface Program {
  id: string;
  name: string;
  purpose: PurposeId;
  note: string;
}

const PROGRAMS: Program[] = [
  {
    id: 'notatnik',
    name: 'Notatnik',
    purpose: 'tekst',
    note: 'Najprostszy edytor tekstu, wbudowany w Windows. Zapisuje czysty tekst, bez formatowania. Za darmo, bo jest częścią systemu.',
  },
  {
    id: 'gimp',
    name: 'GIMP',
    purpose: 'obraz',
    note: 'Rozbudowany edytor grafiki: warstwy, retusz zdjęć, rysowanie. Darmowy i open source — każdy może zajrzeć do jego kodu i go poprawić.',
  },
  {
    id: 'calc',
    name: 'LibreOffice Calc',
    purpose: 'liczby',
    note: 'Arkusz kalkulacyjny: komórki, tabele, obliczenia, wykresy. Darmowy, część pakietu LibreOffice.',
  },
  {
    id: 'impress',
    name: 'LibreOffice Impress',
    purpose: 'pokaz',
    note: 'Program do prezentacji — slajdy z tekstem, obrazem i przejściami. Darmowy.',
  },
  {
    id: 'powerpoint',
    name: 'Microsoft PowerPoint',
    purpose: 'pokaz',
    note: 'Najbardziej znany program do prezentacji. Płatny — część pakietu Microsoft 365.',
  },
  {
    id: 'krita',
    name: 'Krita',
    purpose: 'obraz',
    note: 'Edytor grafiki lubiany przez rysowników i twórców komiksów. Darmowy i open source.',
  },
  {
    id: 'docs',
    name: 'Dokumenty Google',
    purpose: 'tekst',
    note: 'Edytor tekstu, który działa w przeglądarce i zapisuje pracę w chmurze. Darmowy, ale trzeba mieć konto Google.',
  },
  {
    id: 'excel',
    name: 'Microsoft Excel',
    purpose: 'liczby',
    note: 'Najbardziej znany arkusz kalkulacyjny. Płatny — część pakietu Microsoft 365.',
  },
];

interface WhatIsItForProps {
  color: string;
  onComplete?: () => void;
}

export function WhatIsItFor({ color, onComplete }: WhatIsItForProps) {
  const [answers, setAnswers] = useState<Record<string, PurposeId>>({});

  const solved = PROGRAMS.filter((program) => answers[program.id] === program.purpose).length;
  const finished = solved === PROGRAMS.length;

  const choose = (program: Program, purpose: PurposeId) => {
    if (answers[program.id] === program.purpose) return;
    const next = { ...answers, [program.id]: purpose };
    setAnswers(next);
    if (PROGRAMS.every((item) => next[item.id] === item.purpose)) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Osiem programów. Przy każdym wskaż, <strong>do czego służy</strong> — nie po nazwie, tylko
          po tym, co się w nim tworzy.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {solved}/{PROGRAMS.length}
        </p>
      </div>

      <ul className="divide-y border">
        {PROGRAMS.map((program) => {
          const said = answers[program.id];
          const settled = said === program.purpose;
          const wrong = said !== undefined && !settled;

          return (
            <li key={program.id} className="p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <p className="flex min-w-0 flex-1 items-center gap-2 font-semibold leading-snug">
                  {settled && <Check className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />}
                  {program.name}
                </p>

                <div className="flex flex-wrap gap-2">
                  {PURPOSES.map((purpose) => {
                    const picked = said === purpose.id;
                    const isRight = settled && picked;
                    return (
                      <button
                        key={purpose.id}
                        type="button"
                        onClick={() => choose(program, purpose.id)}
                        disabled={settled}
                        aria-pressed={picked}
                        className={cn(
                          'inline-flex items-center border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm',
                          settled ? 'cursor-default' : 'cursor-pointer hover:bg-muted/60',
                          picked && !isRight && 'border-red-600 text-red-700 dark:text-red-400'
                        )}
                        style={
                          isRight
                            ? { borderColor: color, backgroundColor: `${color}14`, color }
                            : undefined
                        }
                      >
                        {purpose.label}
                      </button>
                    );
                  })}
                </div>
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
                        Pomyśl, co powstaje w tym programie: tekst, obraz, tabela liczb czy slajdy?
                      </>
                    ) : (
                      program.note
                    )}
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Wszystkie osiem poukładane.</strong> Programy grupuje się po tym, do czego
            służą — nie po nazwie ani po tym, kto je zrobił. W każdej grupie jest coś płatnego i coś
            darmowego, a często też coś <strong>open source</strong>: takiego, którego kod każdy
            może obejrzeć i poprawić. O tym jest następny blok.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

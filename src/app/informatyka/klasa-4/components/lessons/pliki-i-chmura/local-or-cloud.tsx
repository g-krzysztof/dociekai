'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Cloud, HardDrive, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Ćwiczenie lekcji: pięć sytuacji z życia, w których trzeba rozstrzygnąć, gdzie
 * zapisać plik — lokalnie (na tym urządzeniu), w chmurze, czy w obu miejscach.
 * Realizuje `[3.7]`: świadomy zapis lokalny i chmurowy.
 *
 * To ćwiczenie, nie test — zła odpowiedź nie zamyka pozycji i nie pokazuje
 * właściwej, tylko odsyła do dwóch pytań: czy będzie internet i czy plik ma być
 * widoczny z innego urządzenia. Odpowiedzi rozrzucone (1, 2, 3, 3, 1). Blok
 * kończy się po poprawnym rozstrzygnięciu wszystkich pięciu.
 */

const OPTIONS = [
  { id: 'local', label: 'Lokalnie' },
  { id: 'cloud', label: 'W chmurze' },
  { id: 'both', label: 'Jedno i drugie' },
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
    id: 'autobus',
    text: 'Chcesz otworzyć plik w autobusie, gdzie nie ma zasięgu.',
    answer: 'local',
    note: 'Chmura potrzebuje internetu. Bez zasięgu otworzysz tylko to, co jest zapisane na samym urządzeniu.',
  },
  {
    id: 'nauczyciel',
    text: 'Nauczyciel ma zobaczyć twoją pracę ze swojego komputera, jeszcze dziś.',
    answer: 'cloud',
    note: 'Wrzucasz plik do chmury i wysyłasz link. Nauczyciel otwiera go u siebie — bez pendrive’a i bez twojego komputera.',
  },
  {
    id: 'awaria',
    text: 'Twój laptop nagle przestał się włączać, a praca ma przetrwać.',
    answer: 'both',
    note: 'Jedna kopia to żadna kopia. Plik w chmurze przetrwa awarię laptopa, a kopia lokalna ratuje, gdy nie ma internetu. Najlepiej mieć obie.',
  },
  {
    id: 'program',
    text: 'Rysujesz w programie, który potrafi zapisać tylko na dysku komputera.',
    answer: 'both',
    note: 'Najpierw zapis lokalny, bo program inaczej nie umie. Zaraz potem wgraj kopię gotowego pliku do chmury — wtedy masz i jedno, i drugie.',
  },
  {
    id: 'pewnosc',
    text: 'Chcesz mieć pewność, że plik jest — nawet bez konta i bez internetu.',
    answer: 'local',
    note: 'Chmura wymaga konta i połączenia. Plik na twoim dysku jest twój od razu, bez logowania się gdziekolwiek.',
  },
];

interface LocalOrCloudProps {
  color: string;
  onComplete?: () => void;
}

export function LocalOrCloud({ color, onComplete }: LocalOrCloudProps) {
  const [answers, setAnswers] = useState<Record<string, OptionId>>({});

  const solved = SCENARIOS.filter((s) => answers[s.id] === s.answer).length;
  const finished = solved === SCENARIOS.length;

  const choose = (scenario: Scenario, optionId: OptionId) => {
    if (answers[scenario.id] === scenario.answer) return;
    const next = { ...answers, [scenario.id]: optionId };
    setAnswers(next);
    if (SCENARIOS.every((item) => next[item.id] === item.answer)) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      {/* Dwa miejsca zapisu */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="border p-3" style={{ borderColor: `${color}55` }}>
          <p className="mb-1.5 flex items-center gap-2 font-bold" style={{ color }}>
            <HardDrive className="h-4 w-4 shrink-0" aria-hidden />
            Na tym urządzeniu (lokalnie)
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Plik leży na dysku twojego komputera albo telefonu. Działa bez internetu i bez konta,
            ale jest tylko tu — i znika razem ze sprzętem, jeśli ten się zepsuje.
          </p>
        </div>
        <div className="border p-3" style={{ borderColor: `${color}55` }}>
          <p className="mb-1.5 flex items-center gap-2 font-bold" style={{ color }}>
            <Cloud className="h-4 w-4 shrink-0" aria-hidden />
            W chmurze
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Plik leży na serwerze firmy (Dysk Google, OneDrive, iCloud). Sięgniesz po niego z
            każdego urządzenia i łatwo go udostępnisz — ale potrzebujesz internetu, konta i
            zaufania do tej firmy.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Pięć sytuacji. W każdej wybierz, <strong>gdzie zapisać plik</strong>.
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
                        isRight
                          ? { borderColor: color, backgroundColor: `${color}14`, color }
                          : undefined
                      }
                    >
                      {isRight && <Check className="h-4 w-4 shrink-0" aria-hidden />}
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
                        Zadaj dwa pytania: czy w tej sytuacji będzie internet i czy plik ma być
                        widoczny z innego urządzenia?
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
            <strong>Dwa pytania rozstrzygają prawie każdy taki wybór:</strong> czy będzie internet i
            czy plik ma być widoczny z innego urządzenia. Lokalnie — pewne i bez sieci. W chmurze —
            dostępne zewsząd i przeżyje awarię sprzętu. To, czego naprawdę nie chcesz stracić,
            trzymaj w obu miejscach.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

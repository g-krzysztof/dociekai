'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Wyjaśnienie lekcji: jednostki informacji jako drabinka. Bit i bajt tłumaczymy
 * przez konkret (żarówka świeci / nie świeci; jeden bajt = jeden znak), a każdy
 * następny szczebel to „mniej więcej tysiąc” poprzednich — z przykładem, co się
 * w takiej porcji mieści.
 *
 * Świadomie liczymy skokami po 1000, nie 1024: dla porównań w tej lekcji to bez
 * znaczenia, a dziecko nie musi na tym etapie mnożyć przez 1024. Ta uwaga jest
 * wprost pod drabinką, żeby nie utrwalić nieprawdy.
 *
 * Blok kończy się po otwarciu wszystkich sześciu szczebli.
 */

interface Rung {
  id: string;
  unit: string;
  short: string;
  /** Krótkie zdanie widoczne od razu. */
  is: string;
  /** Ile poprzednich jednostek — odsłaniane po kliknięciu (puste dla bitu). */
  made: string;
  /** Co się w tej porcji mieści. */
  holds: string;
}

const RUNGS: Rung[] = [
  {
    id: 'bit',
    unit: 'bit',
    short: 'bit',
    is: 'najmniejsza porcja informacji: 0 albo 1',
    made: 'Niżej już nic nie ma. Bit to jak jedna żarówka — świeci albo nie świeci, trzeciej możliwości brak.',
    holds: 'jedna odpowiedź „tak / nie”',
  },
  {
    id: 'bajt',
    unit: 'bajt',
    short: 'B',
    is: '8 bitów — tyle, ile trzeba na jeden znak',
    made: 'Osiem bitów obok siebie. Osiem żarówek daje 256 różnych układów — akurat tyle, żeby każdej literze, cyfrze i znakowi przypisać swój.',
    holds: 'jedna litera, np. A',
  },
  {
    id: 'kb',
    unit: 'kilobajt',
    short: 'KB',
    is: 'mniej więcej tysiąc bajtów',
    made: 'około 1000 bajtów',
    holds: 'krótki e-mail bez obrazków — jakieś piętnaście linijek tekstu',
  },
  {
    id: 'mb',
    unit: 'megabajt',
    short: 'MB',
    is: 'mniej więcej tysiąc kilobajtów',
    made: 'około 1000 KB, czyli już milion bajtów',
    holds: 'minuta piosenki w słabej jakości albo zdjęcie sprzed dwudziestu lat',
  },
  {
    id: 'gb',
    unit: 'gigabajt',
    short: 'GB',
    is: 'mniej więcej tysiąc megabajtów',
    made: 'około 1000 MB, czyli miliard bajtów',
    holds: 'jakieś 250 dzisiejszych zdjęć z telefonu albo pół godziny filmu',
  },
  {
    id: 'tb',
    unit: 'terabajt',
    short: 'TB',
    is: 'mniej więcej tysiąc gigabajtów',
    made: 'około 1000 GB, czyli bilion bajtów',
    holds: 'cała twoja biblioteka zdjęć, filmów i gier — i jeszcze zostanie miejsce',
  },
];

interface ByteLadderProps {
  color: string;
  onComplete?: () => void;
}

export function ByteLadder({ color, onComplete }: ByteLadderProps) {
  const [seen, setSeen] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  const reveal = (id: string) => {
    setOpen((prev) => (prev === id ? null : id));
    if (seen.includes(id)) return;
    const next = [...seen, id];
    setSeen(next);
    if (next.length === RUNGS.length) onComplete?.();
  };

  const finished = seen.length === RUNGS.length;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Wszystko w komputerze — litery, dźwięk, obraz — jest zapisane porcjami tej samej rodziny.
          <strong> Wejdź po każdym szczeblu</strong> od dołu i zobacz, co się w danej porcji mieści.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {seen.length}/{RUNGS.length}
        </p>
      </div>

      {/* Drabinka od największej porcji u góry do bitu na dole — jak drabina. */}
      <ol className="space-y-1.5">
        {RUNGS.slice().reverse().map((rung) => {
          const isSeen = seen.includes(rung.id);
          const isOpen = open === rung.id;
          return (
            <li key={rung.id}>
              <button
                type="button"
                onClick={() => reveal(rung.id)}
                aria-expanded={isOpen}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 border p-3 text-left transition-colors',
                  isOpen ? '' : 'hover:bg-muted/40'
                )}
                style={isOpen ? { borderColor: color, backgroundColor: `${color}0f` } : undefined}
              >
                <span
                  className="flex h-10 w-14 shrink-0 flex-col items-center justify-center border font-mono font-bold leading-none"
                  style={{
                    borderColor: isSeen ? color : 'var(--border)',
                    color: isSeen ? color : 'var(--muted-foreground)',
                  }}
                >
                  <span className="text-base">{rung.short}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-snug">{rung.unit}</span>
                  <span className="block text-xs text-muted-foreground">{rung.is}</span>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="border border-t-0 p-3 text-sm leading-relaxed"
                      style={{ borderColor: color }}
                    >
                      <p className="text-muted-foreground">{rung.made}</p>
                      <p className="mt-2">
                        <span
                          className="text-xs font-bold uppercase tracking-wide"
                          style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
                        >
                          Zmieści się tu:{' '}
                        </span>
                        {rung.holds}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Naprawdę komputer robi te skoki po 1024, nie po 1000 — ale do porównań w tej lekcji różnica
        jest bez znaczenia i „mniej więcej tysiąc” w zupełności wystarczy.
      </p>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Cała drabinka przejdziona.</strong> Zapamiętaj z niej jedno: każdy szczebel to
            mniej więcej <strong>tysiąc</strong> poprzednich. Dlatego „4 MB” to jakieś cztery
            miliony bajtów — i dlatego jedno zdjęcie nie mieści się na dyskietce, która ma ich
            tylko półtora miliona.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

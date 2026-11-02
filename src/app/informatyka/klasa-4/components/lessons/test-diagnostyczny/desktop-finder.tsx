'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calculator,
  FileText,
  Folder,
  Globe,
  Image as ImageIcon,
  Music,
  Palette,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import type { DrillScore } from './mouse-keyboard-drill';

/**
 * Sprawdzian „uruchamianie programu”: makieta pulpitu i cztery polecenia
 * w rodzaju „chcesz narysować kartkę — w co klikasz”. Zamiast pytać o nazwy
 * programów, każe je wskazać wśród innych ikon — a przy okazji rozdziela
 * programy od plików, bo na pulpicie leżą jedne i drugie.
 *
 * Pulpit jest **makietą systemu**, więc świadomie nie trzyma się języka
 * wizualnego kursu (numerały, płaskie panele) — ma wyglądać jak pulpit,
 * tak samo jak tarcza zegara w matematyce wygląda jak zegar.
 */

interface DesktopIcon {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Kolor kafelka ikony — pulpit żyje własną paletą, nie kolorem modułu. */
  tint: string;
  /** Czym to jest, gdy dziecko kliknie nie w to co trzeba. */
  what: string;
}

const ICONS: DesktopIcon[] = [
  { id: 'przegladarka', label: 'Przeglądarka', icon: Globe, tint: '#2563eb', what: 'przeglądarka internetowa — nią wchodzi się na strony' },
  { id: 'edytor', label: 'Edytor tekstu', icon: FileText, tint: '#0d9488', what: 'edytor tekstu — w nim się pisze i formatuje dokumenty' },
  { id: 'rysowanie', label: 'Rysowanie', icon: Palette, tint: '#7c3aed', what: 'program do rysowania — w nim powstają obrazki' },
  { id: 'arkusz', label: 'Arkusz', icon: Calculator, tint: '#16a34a', what: 'arkusz kalkulacyjny — do tabel i obliczeń' },
  { id: 'dokumenty', label: 'Moje dokumenty', icon: Folder, tint: '#f59e0b', what: 'folder, czyli teczka na pliki — nie program' },
  { id: 'wakacje', label: 'wakacje.jpg', icon: ImageIcon, tint: '#db2777', what: 'plik ze zdjęciem — nie program' },
  { id: 'piosenka', label: 'piosenka.mp3', icon: Music, tint: '#ea580c', what: 'plik z muzyką — nie program' },
  { id: 'kosz', label: 'Kosz', icon: Trash2, tint: '#64748b', what: 'kosz — trafiają tu skasowane pliki' },
];

interface Round {
  prompt: string;
  answerId: string;
  explanation: string;
}

const ROUNDS: Round[] = [
  {
    prompt: 'Chcesz narysować kartkę urodzinową dla babci. W co klikasz?',
    answerId: 'rysowanie',
    explanation: 'Obrazek powstaje w programie do rysowania — w szkole zwykle jest to Paint, ale równie dobrze zadziała GIMP albo Photopea w przeglądarce.',
  },
  {
    prompt: 'Chcesz sprawdzić na stronie internetowej, ile ma metrów wieża Eiffla.',
    answerId: 'przegladarka',
    explanation: 'Strony internetowe otwiera przeglądarka. To ona jest programem — wyszukiwarka (np. Google) to dopiero strona, którą się w niej otwiera.',
  },
  {
    prompt: 'Chcesz napisać notatkę z lekcji i ją zapisać.',
    answerId: 'edytor',
    explanation: 'Tekst pisze się w edytorze tekstu: Notatnik, MS Word, LibreOffice Writer albo Dokumenty Google. Każdy z nich się nadaje.',
  },
  {
    prompt: 'Na pulpicie leżą programy i pliki. Kliknij plik z muzyką.',
    answerId: 'piosenka',
    explanation: 'To plik, a nie program — poznasz go po nazwie z kropką i rozszerzeniem (.mp3 to dźwięk, .jpg to obraz). Program sam otworzy się, żeby go odtworzyć.',
  },
];

interface DesktopFinderProps {
  color: string;
  onFinish?: (result: DrillScore) => void;
}

export function DesktopFinder({ color, onFinish }: DesktopFinderProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [missed, setMissed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index] ?? ROUNDS[ROUNDS.length - 1];
  const answered = picked === round.answerId;

  const choose = (id: string) => {
    if (answered) return;
    setPicked(id);
    if (id === round.answerId) {
      if (!missed) setScore((prev) => prev + 1);
      return;
    }
    setMissed(true);
  };

  const next = () => {
    if (index + 1 < ROUNDS.length) {
      setIndex(index + 1);
      setPicked(null);
      setMissed(false);
      return;
    }
    setFinished(true);
    onFinish?.({ score, total: ROUNDS.length });
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Uruchamianie programów — wynik
        </p>
        <p className="mb-4 text-2xl font-bold" style={{ color }}>
          {score} / {ROUNDS.length}
        </p>
        <p className="text-sm leading-relaxed">
          Do zapamiętania na resztę kursu: <strong>program</strong> coś robi (rysuje, pisze, liczy,
          otwiera strony), a <strong>plik</strong> to wynik takiej pracy — poznasz go po kropce
          i rozszerzeniu w nazwie. Na pulpicie ikonę programu otwiera się{' '}
          <strong>podwójnym kliknięciem</strong>.
        </p>
      </div>
    );
  }

  const pickedIcon = picked ? ICONS.find((item) => item.id === picked) : null;

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-xs font-bold tracking-wide" style={{ color }}>
          ZADANIE {index + 1} Z {ROUNDS.length}
        </p>
        <p className="font-mono text-xs text-muted-foreground">punkty: {score}</p>
      </div>

      <p className="mb-4 text-base font-semibold leading-relaxed">{round.prompt}</p>

      {/* Makieta pulpitu — celowo wygląda jak system, nie jak reszta strony. */}
      <div className="border bg-gradient-to-b from-sky-900 to-slate-900 p-4 sm:p-6">
        <ul className="grid grid-cols-4 gap-2 sm:gap-4">
          {ICONS.map((item) => {
            const Icon = item.icon;
            const isPicked = picked === item.id;
            const isAnswer = item.id === round.answerId;
            return (
              <li key={item.id}>
                <motion.button
                  type="button"
                  onClick={() => choose(item.id)}
                  animate={isPicked && !isAnswer ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'flex w-full cursor-pointer flex-col items-center gap-1.5 border-2 border-transparent p-2 text-center transition-colors',
                    'hover:border-white/40 hover:bg-white/10',
                    isPicked && isAnswer && 'border-emerald-400 bg-emerald-400/20',
                    isPicked && !isAnswer && 'border-amber-400 bg-amber-400/20'
                  )}
                >
                  <Icon className="h-7 w-7 sm:h-9 sm:w-9" style={{ color: item.tint }} aria-hidden />
                  <span className="text-[11px] font-medium leading-tight text-white sm:text-xs">
                    {item.label}
                  </span>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 min-h-[3.5rem]">
        <AnimatePresence mode="wait">
          {picked && !answered && pickedIcon && (
            <motion.p
              key={`miss-${picked}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm leading-relaxed text-amber-700 dark:text-amber-500"
            >
              To {pickedIcon.what}. Poszukaj jeszcze raz.
            </motion.p>
          )}
          {answered && (
            <motion.div key="hit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <p className="mb-3 text-sm leading-relaxed">{round.explanation}</p>
              <button
                type="button"
                onClick={next}
                className="cursor-pointer border-t-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/40"
                style={{ borderColor: color, color }}
              >
                {index + 1 < ROUNDS.length ? 'Następne zadanie' : 'Pokaż wynik'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

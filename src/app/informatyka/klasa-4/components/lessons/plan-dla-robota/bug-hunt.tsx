'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { MazeView } from './maze-view';
import { COMMAND_LABEL, MAZE_B, STATUS_TEXT, run, shortest, type Command } from './robot';

/**
 * Blok `debugowanie` — **krokowe wykonanie cudzego programu**.
 *
 * Poprzedni blok kazał program napisać. Ten stawia przed gotowym, który nie
 * działa — i to jest zupełnie inna umiejętność: trzeba czytać czyjś plan,
 * zatrzymywać go w połowie i porównywać, co miało się stać, z tym, co się stało.
 * Dlatego nie ma tu przycisku „uruchom”, tylko **„wykonaj jedną instrukcję”**:
 * podświetlona linia i robot ruszający o jedno pole to pierwszy w kursie
 * debugger.
 *
 * Program różni się od poprawnego **jedną instrukcją** i dziecko nie dostaje
 * podpowiedzi, którą. Musi dojść do miejsca awarii i cofnąć się myślą o krok:
 * robot rozbija się nie tam, gdzie jest błąd, tylko tam, gdzie wychodzą jego
 * skutki — a to jest najważniejsza rzecz, jakiej uczy debugowanie.
 */

/** Poprawne rozwiązanie planszy B — z niego powstaje program z usterką. */
const CORRECT = shortest(MAZE_B);
/**
 * Psujemy **trzecią** instrukcję, zamieniając jazdę naprzód na obrót. To nie jest
 * dowolny wybór: przy tej usterce robot jedzie jeszcze przez dwie instrukcje i
 * rozbija się dopiero na szóstej, o kamień. Gdyby zepsuć sam zakręt, awaria
 * wyszłaby o jedną instrukcję dalej i cała pointa bloku („robot zatrzymuje się
 * gdzie indziej, niż jest błąd”) byłaby ledwie widoczna.
 */
const BROKEN_AT = 2;
const BROKEN: Command[] = CORRECT.map((c, i) => (i === BROKEN_AT ? 'w-lewo' : c));

interface BugHuntProps {
  color: string;
  onComplete?: () => void;
}

export function BugHunt({ color, onComplete }: BugHuntProps) {
  const [program, setProgram] = useState<Command[]>(BROKEN);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(done ? 'gotowe' : 'praca');

  const frames = run(program, MAZE_B);
  const current = frames[Math.min(step, frames.length - 1)];
  const atEnd = step >= frames.length - 1;
  const crashed = atEnd && current.status !== 'cel';
  const solved = atEnd && current.status === 'cel';

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const fix = (index: number, command: Command) => {
    setProgram(program.map((c, i) => (i === index ? command : c)));
    setPicked(null);
    setStep(0);
    setNote('Poprawione. Uruchom program od początku i sprawdź, czy teraz dojedzie.');
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Kuba napisał program dla robota. Robot nie dojeżdża. Znajdź, dlaczego.
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Nie uruchamiaj całości — wykonuj <strong>po jednej instrukcji</strong> i patrz, czy robot
        robi to, czego się spodziewasz.
      </p>

      {/* Siatka dopiero od `sm` — `sticky` niżej nie zadziała w elemencie siatki, bo
          jego kontenerem jest własny wiersz, a nie cały blok z listingiem. */}
      <div className="space-y-5 sm:grid sm:gap-5 sm:space-y-0 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        {/*
          Poniżej `sm` plansza i listing stoją jeden pod drugim, a przycisk
          „wykonaj jedną instrukcję" jest na samym dole — bez przyklejenia dziecko
          krokowało program, nie widząc robota, czyli traciło jedyną rzecz, po
          której poznaje, gdzie program przestał być dobry.
        */}
        <div className="sticky top-9 z-10 -mx-4 bg-white px-4 pb-2 dark:bg-zinc-900 sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:pb-0 dark:sm:bg-transparent">
          <MazeView
            maze={MAZE_B}
            pose={current.pose}
            status={current.status}
            color={color}
            trail={frames.slice(0, step + 1).map((f) => f.pose)}
          />
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            wykonano: {step} z {program.length} instrukcji
          </p>
        </div>

        <div className="min-w-0">
          <ol className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {program.map((command, i) => {
              const running = current.at === i && step > 0;
              const passed = step > 0 && i < current.at;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => !done && setPicked(picked === i ? null : i)}
                    disabled={done}
                    className={cn(
                      'flex w-full items-center gap-2 border px-2 py-1 text-left text-xs transition',
                      !done && 'hover:bg-black/5 dark:hover:bg-white/5',
                      running && 'font-semibold'
                    )}
                    style={
                      running
                        ? { borderColor: crashed ? '#d97706' : color, backgroundColor: `${color}14` }
                        : picked === i
                          ? { borderColor: color }
                          : undefined
                    }
                  >
                    <span
                      className="w-5 shrink-0 text-center font-mono tabular-nums"
                      style={{ color: passed ? color : undefined }}
                    >
                      {passed ? '✓' : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">{COMMAND_LABEL[command]}</span>
                  </button>

                  {picked === i && !done && (
                    <div className="mt-1 flex flex-wrap gap-1.5 border-l-2 pl-2" style={{ borderColor: color }}>
                      <span className="w-full text-[11px] text-muted-foreground">
                        Zamień tę instrukcję na:
                      </span>
                      {(['naprzod', 'w-lewo', 'w-prawo'] as Command[])
                        .filter((c) => c !== command)
                        .map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => fix(i, c)}
                            className="border px-2 py-1 text-[11px]"
                            style={{ borderColor: `${color}66` }}
                          >
                            {COMMAND_LABEL[c]}
                          </button>
                        ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={atEnd || done}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: color }}
            >
              <SkipForward className="h-4 w-4" aria-hidden />
              Wykonaj jedną instrukcję
            </button>
            {step > 0 && !done && (
              <button
                type="button"
                onClick={() => setStep(0)}
                className="border-2 px-3 py-2 text-sm font-medium"
                style={{ borderColor: `${color}55` }}
              >
                Od początku
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Jedna instrukcja — obrót w złą stronę — i cały plan przestawał działać.
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Zwróć uwagę na najważniejszą rzecz w całym tym bloku:{' '}
              <strong>robot zatrzymał się w zupełnie innym miejscu, niż był błąd</strong>. Awaria
              wyszła dopiero kilka instrukcji później, przy kamieniu. Dlatego szukanie błędu zaczyna
              się od pytania „gdzie jeszcze było dobrze?”, a nie „gdzie się zepsuło”.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Wykonywanie programu <strong>po jednej instrukcji</strong> to narzędzie, którego używają
              wszyscy programiści świata. Ma nawet własną nazwę: <strong>debugowanie</strong>, od
              angielskiego <em>bug</em> — robak, czyli usterka.
            </p>
          </motion.div>
        ) : solved ? (
          <motion.div
            key="solved"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>Robot dojechał do celu. Program Kuby jest naprawiony.</span>
            </p>
            <button
              type="button"
              onClick={() => setDone(true)}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              Dlaczego tak trudno było to znaleźć?
            </button>
          </motion.div>
        ) : crashed ? (
          <motion.p
            key={`crash-${current.at}-${program.join()}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            <strong>Stop na instrukcji {current.at + 1}. </strong>
            {STATUS_TEXT[current.status as 'skala' | 'poza-plansza']} Uwaga: to nie znaczy, że błąd
            jest w tej instrukcji. Cofnij się i sprawdź, w którym miejscu robot ostatni raz stał tam,
            gdzie powinien — kliknij instrukcję, żeby ją podmienić.
          </motion.p>
        ) : note ? (
          <motion.p
            key={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 p-3 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            {note}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

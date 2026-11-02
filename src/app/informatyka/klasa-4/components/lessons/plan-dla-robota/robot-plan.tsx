'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Check, Play, RotateCcw, RotateCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { MazeView } from './maze-view';
import {
  COMMAND_LABEL,
  MAZE_A,
  STATUS_TEXT,
  run,
  shortest,
  type Command,
  type Frame,
  type Pose,
} from './robot';

/**
 * Symulator — **różnica między sterowaniem a programowaniem, przeżyta dwa razy
 * na tej samej planszy**.
 *
 * Runda pierwsza to pilot: naciskasz strzałkę, robot rusza natychmiast, widzisz
 * skutek i poprawiasz w locie. Dziecko dojeżdża do celu bez trudu i ma prawo
 * pomyśleć, że właśnie napisało program. Nie napisało. Runda druga zabiera
 * natychmiastowy skutek: **całą drogę trzeba ułożyć z góry, a robot rusza
 * dopiero na koniec** — i wtedy okazuje się, że trzeba myśleć za kogoś, kto
 * widzi świat inaczej niż ty (robot nie ma „w prawo”, ma tylko „naprzód” i
 * „obróć się”).
 *
 * To jest ta sama para „wykonaj to samo dwa razy”, co `AbacusDrill`/`PascalinaSim`
 * w lekcji 3 — cała lekcja mieści się w różnicy między dwiema rundami, więc obie
 * muszą być na identycznej planszy.
 *
 * Werdykt liczy `run()` ze wspólnego `robot.ts`: nic nie jest porównywane z
 * zapisaną odpowiedzią, robot po prostu jedzie i zatrzymuje się tam, gdzie musi.
 */

const COMMANDS: { id: Command; icon: typeof ArrowUp }[] = [
  { id: 'naprzod', icon: ArrowUp },
  { id: 'w-lewo', icon: RotateCcw },
  { id: 'w-prawo', icon: RotateCw },
];

type Phase = 'pilot' | 'program' | 'koniec';

interface RobotPlanProps {
  color: string;
  onComplete?: () => void;
}

export function RobotPlan({ color, onComplete }: RobotPlanProps) {
  const [phase, setPhase] = useState<Phase>('pilot');
  const [pose, setPose] = useState<Pose>({ ...MAZE_A.start });
  const [trail, setTrail] = useState<Pose[]>([{ ...MAZE_A.start }]);
  const [moves, setMoves] = useState(0);
  const [program, setProgram] = useState<Command[]>([]);
  const [frames, setFrames] = useState<Frame[] | null>(null);
  const [shown, setShown] = useState(0);
  const [tries, setTries] = useState(0);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(phase);
  const best = shortest(MAZE_A).length;

  const pilotDone = phase === 'pilot' && pose.x === MAZE_A.goal.x && pose.y === MAZE_A.goal.y;
  const current = frames ? frames[Math.min(shown, frames.length - 1)] : null;
  const programDone = current?.status === 'cel';

  useEffect(() => {
    if (phase !== 'koniec' || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [phase, onComplete]);

  /* Wykonanie programu odtwarzamy klatka po klatce — robot ma jechać, nie teleportować się. */
  useEffect(() => {
    if (!frames || shown >= frames.length - 1) return;
    const timer = window.setTimeout(() => setShown((v) => v + 1), 380);
    return () => window.clearTimeout(timer);
  }, [frames, shown]);

  const drive = (command: Command) => {
    if (phase !== 'pilot' || pilotDone) return;
    const result = run([command], { ...MAZE_A, start: pose });
    const last = result[result.length - 1];
    setPose(last.pose);
    setTrail((prev) => [...prev, last.pose]);
    setMoves(moves + 1);
  };

  const startProgram = () => {
    setPhase('program');
    setPose({ ...MAZE_A.start });
    setTrail([{ ...MAZE_A.start }]);
    setProgram([]);
    setFrames(null);
    setShown(0);
  };

  const push = (command: Command) => {
    if (frames) return;
    setProgram([...program, command]);
  };

  const drop = (index: number) => {
    if (frames) return;
    setProgram(program.filter((_, i) => i !== index));
  };

  const launch = () => {
    const result = run(program, MAZE_A);
    setFrames(result);
    setShown(0);
    setTries(tries + 1);
  };

  const reset = () => {
    setFrames(null);
    setShown(0);
  };

  const shownPose = phase === 'pilot' ? pose : (current?.pose ?? MAZE_A.start);
  const shownTrail =
    phase === 'pilot' ? trail : (frames ?? []).slice(0, shown + 1).map((f) => f.pose);
  const status = phase === 'pilot' ? (pilotDone ? 'cel' : 'idzie') : (current?.status ?? 'idzie');
  const finished = frames != null && shown >= frames.length - 1;

  if (phase === 'koniec') {
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm font-semibold sm:text-base" style={{ color }}>
          Ta sama plansza, dwa zupełnie różne zadania.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="border-l-2 p-3" style={{ borderColor: color }}>
            <p className="text-sm font-semibold">Sterowanie</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Naciskasz — robot rusza. Widzisz, co się stało, i poprawiasz. Myślisz{' '}
              <strong className="text-foreground">w trakcie</strong>, więc pomyłka nic nie kosztuje.
            </p>
          </div>
          <div className="border-l-2 p-3" style={{ borderColor: color }}>
            <p className="text-sm font-semibold">Programowanie</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Cała droga musi być gotowa, <strong className="text-foreground">zanim</strong> robot
              ruszy. Myślisz z góry — i to za kogoś, kto nie widzi tego, co ty.
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed sm:text-base">
          Najtrudniejsze w drugiej rundzie nie były zakręty, tylko to, że robot{' '}
          <strong>nie ma pojęcia „w prawo”</strong>. Ma tylko „naprzód” i „obróć się” — a to, gdzie
          jest jego prawo, zależy od tego, jak aktualnie stoi. Pisząc plan, trzeba było przez cały
          czas siedzieć w jego głowie.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          I jeszcze jedno, co pewnie rzuciło ci się w oczy: „idź naprzód” powtarzało się pięć razy z
          rzędu. W prawdziwym programie nie pisze się tego pięć razy —{' '}
          <strong>mówi się „powtórz pięć razy”</strong>. Tym zajmiesz się w module o Scratchu.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          {phase === 'pilot'
            ? 'Runda 1 z 2 — doprowadź robota do celu pilotem.'
            : 'Runda 2 z 2 — ta sama plansza, ale teraz ułóż CAŁY program, zanim robot ruszy.'}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {phase === 'pilot' ? `ruchów: ${moves}` : `instrukcji: ${program.length}`}
        </p>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        {phase === 'pilot'
          ? 'Każde naciśnięcie działa natychmiast — widzisz skutek i możesz się poprawić.'
          : 'Robot nie zna kierunku „w prawo”. Zna tylko „naprzód” i „obróć się” — i to, jak akurat stoi.'}
      </p>

      <div className="grid gap-5 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <div>
          <MazeView maze={MAZE_A} pose={shownPose} status={status} color={color} trail={shownTrail} />
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            Robot patrzy <strong>{['w górę', 'w prawo', 'w dół', 'w lewo'][shownPose.dir]}</strong>
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {COMMANDS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => (phase === 'pilot' ? drive(item.id) : push(item.id))}
                  disabled={pilotDone || (phase === 'program' && frames !== null)}
                  className="inline-flex items-center gap-1.5 border-2 px-2.5 py-2 text-xs font-medium transition hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/5"
                  style={{ borderColor: `${color}55` }}
                >
                  <Icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  {COMMAND_LABEL[item.id]}
                </button>
              );
            })}
          </div>

          {phase === 'program' && (
            <>
              <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Twój program
              </p>
              {program.length === 0 ? (
                <p className="text-xs italic text-muted-foreground">
                  Pusto. Klikaj polecenia powyżej — dopiszą się tutaj po kolei.
                </p>
              ) : (
                <ol className="max-h-56 space-y-1 overflow-y-auto pr-1">
                  {program.map((command, i) => (
                    <li
                      key={i}
                      className={cn(
                        'flex items-center gap-2 border px-2 py-1 text-xs',
                        current && current.at === i && 'font-semibold'
                      )}
                      style={
                        current && current.at === i
                          ? { borderColor: color, backgroundColor: `${color}14` }
                          : undefined
                      }
                    >
                      <span className="w-5 shrink-0 text-center font-mono tabular-nums">{i + 1}</span>
                      <span className="min-w-0 flex-1">{COMMAND_LABEL[command]}</span>
                      {!frames && (
                        <button
                          type="button"
                          onClick={() => drop(i)}
                          aria-label={`Usuń instrukcję ${i + 1}`}
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      )}
                    </li>
                  ))}
                </ol>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {!frames ? (
                  <button
                    type="button"
                    onClick={launch}
                    disabled={program.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                    style={{ backgroundColor: color }}
                  >
                    <Play className="h-4 w-4" aria-hidden />
                    Uruchom program
                  </button>
                ) : (
                  finished &&
                  !programDone && (
                    <button
                      type="button"
                      onClick={reset}
                      className="border-2 px-3 py-2 text-sm font-medium"
                      style={{ borderColor: `${color}55` }}
                    >
                      Popraw program
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {pilotDone ? (
          <motion.div
            key="pilot-ok"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Cel osiągnięty w {moves} ruchach. Tylko że to nie był program — to było{' '}
                <strong>sterowanie</strong>. Przy każdym naciśnięciu widziałeś/widziałaś, co się
                stało, i mogłeś/mogłaś się poprawić.
              </span>
            </p>
            <button
              type="button"
              onClick={startProgram}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              A teraz to samo bez patrzenia
            </button>
          </motion.div>
        ) : finished && programDone ? (
          <motion.div
            key="program-ok"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Program przejechał całą trasę — {program.length}{' '}
                {program.length === 1 ? 'instrukcja' : 'instrukcji'}, {tries}{' '}
                {tries === 1 ? 'podejście' : 'podejścia'}. Najkrócej da się w {best}.
              </span>
            </p>
            <button
              type="button"
              onClick={() => setPhase('koniec')}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              Czym to się różniło od pilota?
            </button>
          </motion.div>
        ) : finished && current ? (
          <motion.p
            key={`stop-${tries}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            {current.status === 'idzie' ? (
              <>
                <strong>Program się skończył, a robot nie dojechał.</strong> Stoi tam, gdzie skończyły
                się instrukcje — i będzie tak stał. Dopisz dalszy ciąg.
              </>
            ) : (
              <>
                <strong>Zatrzymał się na instrukcji {current.at + 1}. </strong>
                {STATUS_TEXT[current.status as 'skala' | 'poza-plansza']}
              </>
            )}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

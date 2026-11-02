'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Play, RotateCcw, Timer, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GAMES } from './games';
import { moduleByN } from '../year';
import { plural } from '../../../../lib/plural';

/**
 * Blok 1 — **Rush roku**: dziewięć mikro-gier, po jednej na dział kursu.
 *
 * Każda gra to jeden gest z jednej lekcji (suwak monitora, przeciąganie plików,
 * krzyżyk w oknie, uchwyt zmiany rozmiaru, znaki niedrukowane, szufladki,
 * tarcza kierunku, tace maszyny, lampki czuwania) — dziecko robi go od razu,
 * bez wstępu. Ramka odmierza czas i podsumowuje; **gry nie uczą od nowa**, tylko
 * sprawdzają, czy ręce pamiętają.
 *
 * Trzy rzeczy, które ramka robi świadomie:
 *
 * - **Zegar można wyłączyć** („bez zegara”). Powtórka roku nie ma nikogo
 *   stresować, a dziecko, które pracuje wolniej, nie powinno przegrywać z paskiem
 *   zamiast z zadaniem.
 * - **Porażka nie blokuje niczego.** Po rundzie widać, co było do zrobienia
 *   (`reveal`), a nieudane gry da się powtórzyć od razu, bez zegara.
 * - **Do mapy roku idzie pierwsza próba.** Udane powtórzenie liczy się jako
 *   „umiem”, ale dział, w którym się pomyliłeś za pierwszym razem, dostaje
 *   znak do powtórki — bo o to w mapie chodzi.
 */

type Phase = 'intro' | 'cue' | 'play' | 'after' | 'summary';

interface Outcome {
  /** Czy pierwsza próba się udała. */
  first: boolean;
  /** Czy ostatnia próba się udała. */
  final: boolean;
}

/** Wynik pierwszych prób: numer działu → czy się udało. */
export type RushFirstTry = Record<number, boolean>;

const CUE_MS = 1500;
const WIN_PAUSE_MS = 1100;
const STAGE = 'h-[23rem]';

export function RushRoku({
  color,
  onResults,
  onComplete,
}: {
  color: string;
  onResults?: (results: RushFirstTry) => void;
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [calm, setCalm] = useState(false);
  const [pass, setPass] = useState(1);
  const [queue, setQueue] = useState<string[]>(GAMES.map((game) => game.id));
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [results, setResults] = useState<Record<string, Outcome>>({});
  const [lastWon, setLastWon] = useState<boolean | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const phaseRef = useRef<Phase>('intro');
  const reported = useRef(false);
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;

  const setPhaseBoth = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const game = GAMES.find((item) => item.id === queue[index]) ?? GAMES[0];
  const mod = moduleByN(game.n);
  const timerOn = !calm && pass === 1;

  // Do mapy roku idą tylko pierwsze próby.
  useEffect(() => {
    const first: RushFirstTry = {};
    GAMES.forEach((item) => {
      if (results[item.id]) first[item.n] = results[item.id].first;
    });
    onResultsRef.current?.(first);
  }, [results]);

  const begin = () => {
    setQueue(GAMES.map((item) => item.id));
    setIndex(0);
    setPass(1);
    setAttempt((value) => value + 1);
    setLastWon(null);
    setPhaseBoth('cue');
  };

  const advance = useCallback(() => {
    setLastWon(null);
    setTimedOut(false);
    if (index + 1 < queue.length) {
      setIndex((value) => value + 1);
      setAttempt((value) => value + 1);
      setPhaseBoth('cue');
    } else {
      setPhaseBoth('summary');
      if (!reported.current) {
        reported.current = true;
        onComplete?.();
      }
    }
  }, [index, queue.length, onComplete]);

  // Okrzyk → gra.
  useEffect(() => {
    if (phase !== 'cue') return;
    const id = window.setTimeout(() => setPhaseBoth('play'), CUE_MS);
    return () => window.clearTimeout(id);
  }, [phase, index, attempt]);

  const finishGame = useCallback(
    (won: boolean, byTimer = false) => {
      if (phaseRef.current !== 'play') return;
      setPhaseBoth('after');
      setLastWon(won);
      setTimedOut(byTimer);
      setResults((prev) => {
        const before = prev[game.id];
        return {
          ...prev,
          [game.id]: { first: before ? before.first : won, final: won },
        };
      });
    },
    [game.id]
  );

  // Zegar gry.
  useEffect(() => {
    if (phase !== 'play' || !timerOn) return;
    const id = window.setTimeout(() => finishGame(false, true), game.seconds * 1000);
    return () => window.clearTimeout(id);
  }, [phase, timerOn, game.seconds, finishGame, attempt]);

  // Wygrana przechodzi dalej sama; porażka czeka na „Dalej”.
  useEffect(() => {
    if (phase !== 'after' || lastWon !== true) return;
    const id = window.setTimeout(advance, WIN_PAUSE_MS);
    return () => window.clearTimeout(id);
  }, [phase, lastWon, advance]);

  const failed = GAMES.filter((item) => results[item.id] && !results[item.id].final);
  const firstTryWins = GAMES.filter((item) => results[item.id]?.first).length;

  const retryFailed = () => {
    setQueue(failed.map((item) => item.id));
    setIndex(0);
    setPass(2);
    setAttempt((value) => value + 1);
    setLastWon(null);
    setPhaseBoth('cue');
  };

  const Game = game.Game;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {phase === 'intro' ? (
        <div className="mx-auto max-w-xl py-2 text-center">
          <p className="text-base leading-relaxed sm:text-lg">
            Dziewięć mikro-gier. <strong>Każda z jednego działu roku</strong>, każda w kilkanaście sekund. Nikt nie
            tłumaczy, jak się gra — rozpoznasz to rękami.
          </p>
          <label className="mx-auto mt-4 flex w-fit cursor-pointer items-center gap-3 border px-4 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={calm}
              onChange={(event) => setCalm(event.target.checked)}
              className="h-4 w-4 cursor-pointer accent-slate-700"
            />
            <span className="text-left">
              <span className="font-semibold">Bez zegara</span>
              <span className="block text-xs text-muted-foreground">Ta sama gra, ale nikt cię nie goni.</span>
            </span>
          </label>
          <div className="mt-5">
            <button
              type="button"
              onClick={begin}
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 px-8 text-base font-bold text-white"
              style={{ backgroundColor: color }}
            >
              <Play className="h-5 w-5" aria-hidden /> Start
            </button>
          </div>
        </div>
      ) : phase === 'summary' ? (
        <Summary
          results={results}
          firstTryWins={firstTryWins}
          failedCount={failed.length}
          onRetry={retryFailed}
          color={color}
        />
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wide" style={{ color: mod.color }}>
              Gra {index + 1} z {queue.length} · {mod.short}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" aria-hidden />
              {timerOn ? `${game.seconds} s` : 'bez zegara'}
            </span>
          </div>

          <div className="mb-3 h-1.5 w-full overflow-hidden bg-muted" aria-hidden>
            {phase === 'play' && timerOn && (
              <motion.div
                key={`${game.id}-${attempt}`}
                className="h-full"
                style={{ backgroundColor: mod.color }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: game.seconds, ease: 'linear' }}
              />
            )}
            {(phase === 'cue' || !timerOn) && <div className="h-full w-full opacity-30" style={{ backgroundColor: mod.color }} />}
          </div>

          <div className={cn('relative overflow-hidden border bg-muted/20', STAGE)}>
            {phase === 'cue' && (
              <div className="grid h-full place-items-center px-4 text-center">
                <div>
                  <p className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: mod.color }}>
                    {game.cue}
                  </p>
                  <p className="mt-3 text-sm leading-snug text-muted-foreground sm:text-base">{game.how}</p>
                </div>
              </div>
            )}
            {(phase === 'play' || phase === 'after') && (
              <div className={cn('h-full p-3', phase === 'after' && 'pointer-events-none')}>
                <Game key={`${game.id}-${attempt}`} finish={finishGame} seed={attempt + game.n} />
              </div>
            )}
          </div>

          <div className="mt-3 min-h-[6.25rem]" aria-live="polite">
            <AnimatePresence mode="wait">
              {phase === 'after' && lastWon !== null ? (
                <motion.div
                  key="verdict"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'border px-3 py-2.5 text-sm leading-snug',
                    lastWon ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-rose-500/50 bg-rose-500/10'
                  )}
                >
                  {lastWon ? (
                    <p className="flex items-center gap-2 font-bold">
                      <Check className="h-4 w-4 text-emerald-600" aria-hidden /> Jest!
                    </p>
                  ) : (
                    <>
                      <p className="flex items-center gap-2 font-bold">
                        <X className="h-4 w-4 text-rose-600" aria-hidden />
                        {timedOut ? 'Czas minął.' : 'Nie tym razem.'} Oto o co chodziło:
                      </p>
                      <p className="mt-1">{game.reveal}</p>
                      <button
                        type="button"
                        onClick={advance}
                        className="mt-2 inline-flex min-h-9 cursor-pointer items-center border px-4 text-xs font-semibold hover:border-primary/50 hover:text-primary"
                      >
                        {index + 1 < queue.length ? 'Dalej →' : 'Podsumowanie →'}
                      </button>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.p key="how" className="text-sm leading-snug text-muted-foreground">
                  {phase === 'play' ? game.how : ''}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

/** „Zostało jedno zadanie”, „Zostały dwa zadania”, „Zostało pięć zadań”. */
function leftText(value: number): string {
  if (value === 1) return 'Zostało jedno zadanie';
  return value >= 2 && value <= 4 ? `Zostały ${value} zadania` : `Zostało ${value} zadań`;
}

function Summary({
  results,
  firstTryWins,
  failedCount,
  onRetry,
  color,
}: {
  results: Record<string, Outcome>;
  firstTryWins: number;
  failedCount: number;
  onRetry: () => void;
  color: string;
}) {
  return (
    <div>
      <p className="text-center text-base font-semibold sm:text-lg">
        Za pierwszym razem: {firstTryWins} z {GAMES.length}.
      </p>
      <ul className="mt-4 grid grid-cols-3 gap-2">
        {GAMES.map((game) => {
          const mod = moduleByN(game.n);
          const Icon = mod.icon;
          const outcome = results[game.id];
          const ok = outcome?.first;
          const recovered = outcome && !outcome.first && outcome.final;
          return (
            <li
              key={game.id}
              className={cn(
                'flex min-h-[6rem] flex-col items-center justify-center gap-1 border-2 px-1 py-2 text-center',
                ok ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-amber-500/60 bg-amber-500/10'
              )}
            >
              <Icon className="h-5 w-5" style={{ color: mod.color }} aria-hidden />
              <span className="text-xs font-semibold leading-tight">{mod.short}</span>
              <span className="text-[11px] leading-tight text-muted-foreground">
                {ok ? '✓ za pierwszym razem' : recovered ? '✓ za drugim razem' : '✗ do powtórki'}
              </span>
              {!ok && (
                <Link href={mod.href} className="text-[11px] font-medium underline underline-offset-2 hover:text-primary">
                  zajrzyj do działu
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-4 text-center">
        {failedCount > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              {leftText(failedCount)}, {plural(failedCount, 'które się nie udało', 'które się nie udały', 'które się nie udały')}. Spróbuj
              jeszcze raz — tym razem bez zegara.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 border-2 px-6 text-sm font-bold"
              style={{ borderColor: color, color }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Zagraj nieudane jeszcze raz
            </button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Wszystkie dziewięć — ręce pamiętają cały rok.</p>
        )}
      </div>
    </div>
  );
}

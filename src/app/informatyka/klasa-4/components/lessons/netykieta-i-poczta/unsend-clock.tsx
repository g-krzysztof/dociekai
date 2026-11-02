'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCcw, Send, Timer, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Zamknięcie lekcji: jedyna zasada netykiety, której nie da się przekazać
 * zdaniem „nie pisz w złości” — bo wszyscy to wiedzą i wszyscy tak robią.
 *
 * Dlatego ten blok nie pyta „co byś zrobił”. Wpisuje dziecku złośliwą
 * odpowiedź **na jego oczach, znak po znaku** (tak, jak piszą palce, zanim
 * pomyśli głowa), a potem daje dwa przyciski: wysłać albo odłożyć telefon na
 * dziesięć sekund. Obie drogi mają swój ciąg dalszy w czasie rzeczywistym:
 *
 *  - wysłanie daje pięciosekundowy pasek „cofnij wysyłanie” — a jeśli minie,
 *    konsekwencje dochodzą same, jedna po drugiej;
 *  - pauza to naprawdę dziesięć sekund, w których nie da się nic zrobić —
 *    i dopiero po nich dziecko widzi swój tekst jeszcze raz.
 *
 * Nikt tu nie mówi, która droga jest lepsza. Dziecko czyta swoją własną
 * wiadomość po dziesięciu sekundach i samo to widzi.
 */

const DRAFT =
  'sam jesteś beznadziejny, nikt cię nie lubi i wszyscy się z ciebie śmieją za plecami';

const CALM_OPTIONS = [
  'Serio? Nie było mi miło to czytać.',
  'Słabe. Skasuj to, proszę.',
];

const AFTERMATH = [
  'Kacper: „no i co, obraziłeś się? 😂”',
  'Zosia zrobiła zrzut ekranu twojej odpowiedzi.',
  'Twoja odpowiedź krąży po klasowej grupie. Teraz to o tobie piszą, że przesadziłeś/przesadziłaś.',
];

type Phase = 'scene' | 'typing' | 'choice' | 'undo' | 'aftermath' | 'pause' | 'rethink' | 'done';
type Ending = 'sent' | 'undone' | 'calm';

const UNDO_MS = 5000;
const PAUSE_SECONDS = 10;

interface UnsendClockProps {
  color: string;
  onComplete?: () => void;
}

export function UnsendClock({ color, onComplete }: UnsendClockProps) {
  const [phase, setPhase] = useState<Phase>('scene');
  const [typed, setTyped] = useState(0);
  const [undoLeft, setUndoLeft] = useState(UNDO_MS);
  const [shown, setShown] = useState(0);
  const [pauseLeft, setPauseLeft] = useState(PAUSE_SECONDS);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [seen, setSeen] = useState<Ending[]>([]);
  const [calmPick, setCalmPick] = useState<string | null>(null);

  // Odpowiedź pisze się sama — tak jak piszą palce, zanim pomyśli głowa.
  useEffect(() => {
    if (phase !== 'typing') return;
    if (typed >= DRAFT.length) {
      const timer = window.setTimeout(() => setPhase('choice'), 400);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setTyped((prev) => prev + 1), 26);
    return () => window.clearTimeout(timer);
  }, [phase, typed]);

  // Pasek „cofnij wysyłanie” — pięć sekund i ani chwili dłużej.
  useEffect(() => {
    if (phase !== 'undo') return;
    if (undoLeft <= 0) {
      setPhase('aftermath');
      return;
    }
    const timer = window.setTimeout(() => setUndoLeft((prev) => prev - 100), 100);
    return () => window.clearTimeout(timer);
  }, [phase, undoLeft]);

  // Konsekwencje dochodzą same, jedna po drugiej.
  useEffect(() => {
    if (phase !== 'aftermath') return;
    if (shown >= AFTERMATH.length) {
      const timer = window.setTimeout(() => finish('sent'), 900);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setShown((prev) => prev + 1), shown === 0 ? 900 : 1900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, shown]);

  // Dziesięć sekund, w których naprawdę nie da się nic zrobić.
  useEffect(() => {
    if (phase !== 'pause') return;
    if (pauseLeft <= 0) {
      setPhase('rethink');
      return;
    }
    const timer = window.setTimeout(() => setPauseLeft((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, pauseLeft]);

  const finish = (why: Ending) => {
    setEnding(why);
    setPhase('done');
    setSeen((prev) => (prev.includes(why) ? prev : [...prev, why]));
    onComplete?.();
  };

  const replay = () => {
    setPhase('scene');
    setTyped(0);
    setUndoLeft(UNDO_MS);
    setShown(0);
    setPauseLeft(PAUSE_SECONDS);
    setEnding(null);
    setCalmPick(null);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Kacper napisał pod twoim zdjęciem: <em>„ale beznadziejnie wyszedłeś 😂”</em>. Zrobiło ci
          się przykro i zaraz odpiszesz. <strong>Zobacz, co się stanie dalej.</strong>
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {seen.length}/3 zakończenia
        </p>
      </div>

      <div className="mx-auto max-w-lg border bg-zinc-100 dark:bg-zinc-800">
        {/* Komentarz Kacpra */}
        <div className="border-b bg-white p-3 dark:bg-zinc-900">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold">Kacper: </span>
            <span className="text-muted-foreground">ale beznadziejnie wyszedłeś 😂</span>
          </p>
        </div>

        {/* Twoja odpowiedź */}
        <div className="p-3">
          {phase === 'scene' ? (
            <button
              type="button"
              onClick={() => setPhase('typing')}
              className="w-full cursor-pointer border-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted/50"
              style={{ borderColor: color, color }}
            >
              Odpisz mu
            </button>
          ) : (
            <div
              className={cn(
                'min-h-16 border bg-white p-2.5 text-sm leading-relaxed dark:bg-zinc-900',
                (phase === 'rethink' || phase === 'done') && 'text-muted-foreground'
              )}
            >
              {phase === 'done' && ending === 'calm' ? (
                <span>{calmPick}</span>
              ) : (
                <>
                  {DRAFT.slice(0, typed)}
                  {phase === 'typing' && (
                    <motion.span
                      className="ml-0.5 inline-block h-4 w-0.5 align-middle"
                      style={{ backgroundColor: color }}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Dwa wyjścia */}
          {phase === 'choice' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex flex-col gap-2 sm:flex-row"
            >
              <button
                type="button"
                onClick={() => setPhase('undo')}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                <Send className="h-4 w-4" aria-hidden />
                Wyślij
              </button>
              <button
                type="button"
                onClick={() => setPhase('pause')}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 border-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted/50"
                style={{ borderColor: color, color }}
              >
                <Timer className="h-4 w-4" aria-hidden />
                Odłóż telefon na 10 sekund
              </button>
            </motion.div>
          )}

          {/* Pięć sekund na cofnięcie */}
          {phase === 'undo' && (
            <div className="mt-3 border bg-zinc-800 p-2.5 text-white">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium">Wysłano.</span>
                <button
                  type="button"
                  onClick={() => finish('undone')}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold uppercase tracking-wide underline underline-offset-2"
                >
                  <Undo2 className="h-3.5 w-3.5" aria-hidden />
                  Cofnij wysyłanie
                </button>
              </div>
              <div className="mt-2 h-1 overflow-hidden bg-zinc-600">
                <div
                  className="h-full bg-white transition-[width] duration-100 ease-linear"
                  style={{ width: `${(undoLeft / UNDO_MS) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Dziesięć sekund, w których nic nie robisz */}
          {phase === 'pause' && (
            <div className="mt-3 border-l-4 py-4 pl-4 text-center" style={{ borderColor: color }}>
              <p className="font-mono text-3xl font-black tabular-nums" style={{ color }}>
                {pauseLeft}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Nie da się nic kliknąć. O to właśnie chodzi.
              </p>
            </div>
          )}
        </div>

        {/* Co się dzieje po wysłaniu */}
        {phase === 'aftermath' && (
          <div className="border-t bg-white p-3 dark:bg-zinc-900" aria-live="polite">
            {AFTERMATH.slice(0, shown).map((event) => (
              <motion.p
                key={event}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-1.5 text-sm leading-relaxed text-muted-foreground last:mb-0"
              >
                {event}
              </motion.p>
            ))}
          </div>
        )}
      </div>

      {/* Po pauzie: przeczytaj to jeszcze raz */}
      <AnimatePresence>
        {phase === 'rethink' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-4 max-w-lg border-l-4 p-4"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <p className="text-sm font-bold" style={{ color }}>
              Minęło dziesięć sekund. Przeczytaj jeszcze raz, co chciałeś/chciałaś wysłać.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Nadal to wysyłasz — czy piszesz inaczej?
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPhase('undo')}
                className="cursor-pointer border px-3 py-2 text-left text-sm leading-snug transition-colors hover:bg-muted/50"
              >
                {DRAFT}
              </button>
              {CALM_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setCalmPick(option);
                    finish('calm');
                  }}
                  className="cursor-pointer border px-3 py-2 text-left text-sm leading-snug transition-colors hover:bg-muted/50"
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zakończenia */}
      <AnimatePresence>
        {phase === 'done' && ending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            {ending === 'calm' && (
              <p className="mb-3 border bg-zinc-50 p-3 dark:bg-zinc-800/60">
                <span className="font-semibold">Kacper: </span>
                <span className="text-muted-foreground">
                  sorry, głupi żart. już kasuję 🙈
                </span>
              </p>
            )}

            <p className="text-base font-bold" style={{ color }}>
              {ending === 'sent' && 'Wysłane. Nie da się tego cofnąć.'}
              {ending === 'undone' && 'Zdążyłeś/zdążyłaś — o włos.'}
              {ending === 'calm' && 'Sprawa zamknięta w dwóch zdaniach.'}
            </p>

            <p className="mt-2">
              {ending === 'sent' &&
                'Kacper napisał jedno przykre zdanie, ty odpisałeś/odpisałaś trzy — i to twoja odpowiedź poszła dalej. W sieci zostaje nie to, co czułeś/czułaś, tylko to, co kliknąłeś/kliknęłaś.'}
              {ending === 'undone' &&
                'W tej aplikacji akurat było pięć sekund na cofnięcie. W większości nie ma ich wcale, a nawet skasowaną wiadomość ktoś zdąży przeczytać albo zrobić jej zrzut. Nie licz na cofanie.'}
              {ending === 'calm' &&
                'Ta sama sprawa, ten sam ty, tylko dziesięć sekund później. Zwróć uwagę, że nie odpuściłeś/odpuściłaś — powiedziałeś/powiedziałaś wprost, że to było nie w porządku. Tylko bez rzeczy, których nie da się cofnąć.'}
            </p>

            <div className="mt-4 border-t pt-3">
              <p className="mb-2 font-semibold">Trzy zakończenia tej samej sytuacji:</p>
              <ul className="space-y-1.5">
                {[
                  ['sent', 'Wysłane w złości — konsekwencje idą dalej same.'],
                  ['undone', 'Cofnięte w ostatniej chwili — ale na to nie ma co liczyć.'],
                  ['calm', 'Napisane po dziesięciu sekundach — sprawa załatwiona.'],
                ].map(([id, text]) => {
                  const done = seen.includes(id as Ending);
                  return (
                    <li key={id} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">
                        {done ? (
                          <Check className="h-4 w-4" style={{ color }} aria-hidden />
                        ) : (
                          <span
                            className="block h-4 w-4 border"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        )}
                      </span>
                      <span className={cn(!done && 'text-muted-foreground')}>{text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="mt-4 border-l-2 pl-3 font-medium" style={{ borderColor: color }}>
              Wiadomości nie da się cofnąć. Złość — da się. Potrzebuje tylko kilkunastu sekund i
              odłożonego telefonu.
            </p>

            <button
              type="button"
              onClick={replay}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 border-2 px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
              style={{ borderColor: color, color }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              {seen.length < 3 ? 'Odegraj jeszcze raz, inną drogą' : 'Odegraj jeszcze raz'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

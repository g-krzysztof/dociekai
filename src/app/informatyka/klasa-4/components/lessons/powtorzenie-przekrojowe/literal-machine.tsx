'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bot, Check, Play, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ROUNDS,
  SENTENCE,
  effective,
  fileFrom,
  sameValues,
  type Field,
  type FieldValue,
  type Round,
  type RoundId,
  type Told,
  type Values,
  type Verdict,
} from './literal';
import { CatScene, FileScene, PosterScene, type PosterPlace } from './literal-scenes';

/**
 * Blok 2 — **Dosłowniak**. Maszyna, która robi dokładnie to, co jej powiesz, a
 * czego nie powiesz, tam wstawia coś od siebie. Trzy polecenia z trzech działów
 * roku (Scratch, grafika, pliki) — za każdym razem to samo zjawisko w innym
 * przebraniu, więc zdanie lekcji dziecko **przeżywa**, zamiast zgadywać je z
 * klucza.
 *
 * Trzy decyzje, na których blok stoi:
 *
 * - **Pierwsze uruchomienie wolno zrobić od razu.** „Wykonaj” stoi pod polami i
 *   nic nie każe ich ruszyć: kto naciśnie je bez namysłu, zobaczy, jak
 *   Dosłowniak zgaduje. To konsekwencja zamiast oceny — nikt nie mówi, że źle,
 *   scena mówi sama.
 * - **„Sprawdź” to osobny ruch dziecka.** Po uruchomieniu strona nie ogłasza
 *   wyniku; dziecko patrzy na scenę i mówi „tak, o to chodziło” albo „nie,
 *   poprawię”. „Tak” przy złym wyniku jest zapamiętane (`tooSoon`) i idzie na
 *   mapę roku jako „uwierzyłeś za wcześnie” — drugą połowę zdania lekcji
 *   dziecko ćwiczy tym samym przyciskiem, którym kończy każde polecenie.
 * - **Werdykt nazywa, co się nie zgadza, ale nie podaje wartości.** „Załącznik
 *   ma 12 MB” — tak; „wybierz JPG” — nie.
 */

export interface LiteralSummary {
  /** Numer działu → ile razy dziecko uwierzyło złemu wynikowi w poleceniu z tego działu. */
  trustedTooSoon: Record<number, number>;
  /** Czy wszystkie polecenia są zrobione i zdanie roku odsłonięte. */
  sentence: boolean;
}

interface Note {
  tone: 'ok' | 'warn' | 'info';
  text: string;
  problems?: string[];
}

interface RoundState {
  told: Told;
  /** Wartości z ostatniego uruchomienia (z uzupełnionymi domyślnymi). */
  ran: Values | null;
  /** To, co dziecko powiedziało w chwili ostatniego uruchomienia. */
  ranTold: Told;
  verdict: Verdict | null;
  runs: number;
  /** Czy pierwsze uruchomienie było „od razu” — bez jednego słowa od dziecka. */
  hasty: boolean | null;
  firstOk: boolean | null;
  firstDid: string | null;
  tooSoon: number;
  checked: boolean;
  done: boolean;
  note: Note | null;
}

const blank = (): RoundState => ({
  told: {},
  ran: null,
  ranTold: {},
  verdict: null,
  runs: 0,
  hasty: null,
  firstOk: null,
  firstDid: null,
  tooSoon: 0,
  checked: false,
  done: false,
  note: null,
});

const initial = () => Object.fromEntries(ROUNDS.map((round) => [round.id, blank()])) as Record<RoundId, RoundState>;

export function LiteralMachine({
  color,
  onSummary,
  onComplete,
}: {
  color: string;
  onSummary?: (summary: LiteralSummary) => void;
  onComplete?: () => void;
}) {
  const [activeId, setActiveId] = useState<RoundId>(ROUNDS[0].id);
  const [states, setStates] = useState<Record<RoundId, RoundState>>(initial);
  const summaryRef = useRef(onSummary);
  summaryRef.current = onSummary;
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const reported = useRef(false);

  const round = ROUNDS.find((item) => item.id === activeId) ?? ROUNDS[0];
  const state = states[round.id];
  const allDone = ROUNDS.every((item) => states[item.id].done);

  const dirty = state.ran !== null && !sameValues(effective(round, state.told), state.ran);
  const shown = state.verdict !== null && !dirty ? state.verdict : null;
  const failed = state.checked && shown !== null && !shown.ok;

  useEffect(() => {
    const trustedTooSoon: Record<number, number> = {};
    for (const item of ROUNDS) {
      if (states[item.id].tooSoon > 0) trustedTooSoon[item.module] = states[item.id].tooSoon;
    }
    summaryRef.current?.({ trustedTooSoon, sentence: allDone });
  }, [states, allDone]);

  useEffect(() => {
    if (allDone && !reported.current) {
      reported.current = true;
      completeRef.current?.();
    }
  }, [allDone]);

  const patch = (id: RoundId, change: (current: RoundState) => RoundState) =>
    setStates((prev) => ({ ...prev, [id]: change(prev[id]) }));

  const setField = (field: Field, value: FieldValue) =>
    patch(round.id, (current) =>
      current.done ? current : { ...current, told: { ...current.told, [field.id]: value }, checked: false, note: null }
    );

  const run = () => {
    const values = effective(round, state.told);
    const verdict = round.judge(values);
    const told = state.told;
    patch(round.id, (current) => ({
      ...current,
      ran: values,
      ranTold: told,
      verdict,
      runs: current.runs + 1,
      hasty: current.hasty ?? Object.keys(told).length === 0,
      firstOk: current.firstOk ?? verdict.ok,
      firstDid: current.firstDid ?? verdict.did[0],
      checked: false,
      note: null,
    }));
  };

  const check = (said: 'yes' | 'no') => {
    const verdict = state.verdict;
    if (!verdict) return;
    patch(round.id, (current) => {
      if (said === 'yes' && verdict.ok) {
        return { ...current, checked: true, done: true, note: { tone: 'ok', text: 'Sprawdziłeś i masz rację — to jest to, o co ci chodziło.' } };
      }
      if (said === 'yes') {
        return {
          ...current,
          checked: true,
          tooSoon: current.tooSoon + 1,
          note: {
            tone: 'warn',
            text: 'Jeszcze nie. Dosłowniak zrobił dokładnie to, co powiedziałeś — tylko że nie to, o co ci chodziło:',
            problems: verdict.problems,
          },
        };
      }
      return {
        ...current,
        checked: true,
        note: verdict.ok
          ? { tone: 'info', text: 'Przejrzyj listę jeszcze raz — wszystko się zgadza. Jeśli tak uważasz, powiedz „tak”.' }
          : { tone: 'info', text: 'Dobrze, że sprawdziłeś. Coś tu nie gra:', problems: verdict.problems },
      };
    });
  };

  const nextRound = ROUNDS.find((item) => !states[item.id].done && item.id !== round.id);

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Poznaj <strong>Dosłowniaka</strong>. To maszyna, która robi <strong>dokładnie to, co jej powiesz</strong> — ani
        trochę więcej, ani mniej. Czego nie powiesz, tam wstawi coś od siebie. Masz trzy polecenia z trzech działów
        roku: ustal, o co ci chodzi, każ je wykonać i <strong>sprawdź, czy wyszło to, o co ci chodziło</strong>.
      </p>

      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
        {ROUNDS.map((item, index) => {
          const active = item.id === activeId;
          const done = states[item.id].done;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveId(item.id)}
                aria-pressed={active}
                className={cn(
                  'flex min-h-11 w-full cursor-pointer items-center gap-2.5 border-2 px-3 py-2 text-left text-sm transition-colors',
                  active ? 'bg-muted/60' : 'hover:bg-muted/40'
                )}
                style={{ borderColor: active ? color : 'var(--border)' }}
              >
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: color }}
                  aria-hidden
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : index + 1}
                </span>
                <span className="min-w-0 flex-1 font-medium leading-snug">{item.world}</span>
                {done && <span className="shrink-0 text-xs text-muted-foreground">gotowe</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-7">
        {/* Wejście: co mówisz i czego chcesz. */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mówisz</p>
          <p className="mt-1 border bg-muted/40 px-3 py-2 text-base font-semibold leading-snug" style={{ borderColor: color }}>
            „{round.say}”
          </p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chcesz, żeby</p>
          <ul className="mt-1.5 space-y-1.5">
            {round.wants.map((want, index) => {
              const mark = state.checked && shown ? shown.wants[index] : undefined;
              return (
                <li key={want} className="flex items-start gap-2 text-sm leading-snug">
                  <span
                    className={cn(
                      'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border text-white',
                      mark === true && 'border-emerald-600 bg-emerald-600',
                      mark === false && 'border-rose-600 bg-rose-600'
                    )}
                    aria-hidden
                  >
                    {mark === true && <Check className="h-3 w-3" strokeWidth={3.5} />}
                    {mark === false && <X className="h-3 w-3" strokeWidth={3.5} />}
                  </span>
                  <span>{want}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 border bg-muted/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Czego nie powiesz, to Dosłowniak wstawi od siebie
            </p>
            <ul className="mt-3 space-y-3">
              {round.fields.map((field) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  told={state.told[field.id]}
                  color={color}
                  blamed={failed && shown !== null && shown.broken.includes(field.id)}
                  locked={state.done}
                  onChange={(value) => setField(field, value)}
                />
              ))}
            </ul>
          </div>

          {!state.done && (
            <div className="mt-4">
              <button
                type="button"
                onClick={run}
                disabled={state.ran !== null && !dirty}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 px-5 py-2 text-sm font-bold text-white disabled:cursor-default disabled:opacity-40"
                style={{ backgroundColor: color }}
              >
                {state.runs === 0 ? <Play className="h-4 w-4" aria-hidden /> : <RotateCcw className="h-4 w-4" aria-hidden />}
                {state.runs === 0 ? 'Wykonaj polecenie' : 'Wykonaj jeszcze raz'}
              </button>
            </div>
          )}
        </div>

        {/* Wyjście: co Dosłowniak zrobił i czy to jest to. */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dosłowniak robi</p>
          <div className={cn('mt-1 border bg-muted/20 p-3 transition-opacity', dirty && 'opacity-60')}>
            <Scene round={round} ran={state.ran} color={color} />
          </div>

          <div className="mt-3 min-h-[6.75rem]" aria-live="polite">
            {state.ran && state.verdict && (
              <motion.div
                key={state.runs}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: dirty ? 0.6 : 1, y: 0 }}
                className="border bg-white p-3 text-sm leading-snug dark:bg-zinc-900"
              >
                <p className="flex items-center gap-2 font-semibold">
                  <Bot className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  „Zrobiłem dokładnie to, co powiedziałeś.”
                </p>
                <p className="mt-1">{state.verdict.did[0]}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {round.fields.some((field) => !(field.id in state.ranTold))
                    ? `Od siebie dodałem: ${round.fields
                        .filter((field) => !(field.id in state.ranTold))
                        .map((field) => field.why)
                        .join(' ')}`
                    : 'Niczego od siebie nie dodawałem — wszystko powiedziałeś sam.'}
                </p>
              </motion.div>
            )}
          </div>

          {shown && !state.done && (
            <div className="mt-3">
              <p className="text-sm font-semibold">Czy to jest to, o co ci chodziło?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => check('yes')}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 border-2 px-4 py-2 text-sm font-bold"
                  style={{ borderColor: color, color }}
                >
                  <Check className="h-4 w-4" aria-hidden /> Tak, o to chodziło
                </button>
                <button
                  type="button"
                  onClick={() => check('no')}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 border-2 px-4 py-2 text-sm font-semibold hover:bg-muted/50"
                >
                  <X className="h-4 w-4" aria-hidden /> Nie, poprawię
                </button>
              </div>
            </div>
          )}

          <div className="mt-3 min-h-[5.25rem]" aria-live="polite">
            <AnimatePresence mode="wait">
              {state.note && (
                <motion.div
                  key={state.note.text + (state.note.problems?.join('|') ?? '')}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'border px-3 py-2 text-sm leading-snug',
                    state.note.tone === 'ok' && 'border-emerald-500/50 bg-emerald-500/10',
                    state.note.tone === 'warn' && 'border-amber-500/60 bg-amber-500/10',
                    state.note.tone === 'info' && 'bg-muted/50'
                  )}
                >
                  <p>{state.note.text}</p>
                  {state.note.problems && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-5">
                      {state.note.problems.map((problem) => (
                        <li key={problem}>{problem}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {state.done && nextRound && (
            <button
              type="button"
              onClick={() => setActiveId(nextRound.id)}
              className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: color, color }}
            >
              Następne polecenie <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>{allDone && <SentenceCard states={states} />}</AnimatePresence>
    </div>
  );
}

function Scene({ round, ran, color }: { round: Round; ran: Values | null; color: string }) {
  if (round.id === 'kot') return <CatScene steps={ran ? (ran.kroki as number) : null} color={color} />;
  if (round.id === 'napis') {
    return <PosterScene size={ran ? (ran.rozmiar as number) : 12} place={ran ? (ran.miejsce as PosterPlace) : 'gora'} />;
  }
  return <FileScene file={ran ? fileFrom(ran) : null} />;
}

function FieldRow({
  field,
  told,
  color,
  blamed,
  locked,
  onChange,
}: {
  field: Field;
  told: FieldValue | undefined;
  color: string;
  blamed: boolean;
  locked: boolean;
  onChange: (value: FieldValue) => void;
}) {
  const said = told !== undefined;
  const legend = `${field.id}-legend`;
  return (
    <li className={cn('-mx-2 px-2 py-1', blamed && 'border border-rose-500/60 bg-rose-500/5')} role="group" aria-labelledby={legend}>
      <p id={legend} className="text-sm font-medium">
        {field.label}
      </p>

      {field.kind === 'slider' ? (
        <>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {said ? (
              <>
                Powiedziałeś: <strong className="text-foreground">{field.format(told as number)}</strong>
              </>
            ) : (
              <>Nie powiedziałeś — Dosłowniak weźmie {field.format(field.fallback)}.</>
            )}
          </p>
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={said ? (told as number) : field.min}
            onChange={(event) => onChange(Number(event.target.value))}
            disabled={locked}
            aria-labelledby={legend}
            aria-valuetext={said ? field.format(told as number) : 'nie powiedziano'}
            className={cn('mt-1.5 h-8 w-full cursor-pointer', !said && 'opacity-50')}
            style={{ accentColor: color }}
          />
        </>
      ) : (
        <div className="mt-1.5 flex flex-wrap gap-2">
          {field.options.map((option) => {
            const chosen = said ? told === option.id : false;
            const guess = !said && option.id === field.fallback;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                aria-pressed={chosen}
                disabled={locked}
                className={cn(
                  'min-h-9 cursor-pointer border-2 px-3 py-1.5 text-left text-sm leading-snug disabled:cursor-default',
                  chosen ? 'font-semibold text-white' : 'bg-white hover:bg-muted/50 dark:bg-zinc-900',
                  guess && 'border-dashed'
                )}
                style={chosen ? { backgroundColor: color, borderColor: color } : guess ? { borderColor: 'currentColor' } : undefined}
              >
                {option.label}
                {guess && <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">od Dosłowniaka</span>}
              </button>
            );
          })}
        </div>
      )}
    </li>
  );
}

/** Zdanie o pierwszym uruchomieniu, w dwóch częściach: co zrobiło dziecko i co odpowiedziała maszyna. */
function recapLine(state: RoundState): { lead: string; did?: string } {
  if (state.hasty) return { lead: 'Wykonałeś od razu, więc Dosłowniak zgadywał.', did: state.firstDid ?? undefined };
  if (state.firstOk) return { lead: 'Powiedziałeś, o co ci chodzi — wyszło za pierwszym razem.' };
  return { lead: 'Coś powiedziałeś, ale nie wszystko.', did: state.firstDid ?? undefined };
}

function SentenceCard({ states }: { states: Record<RoundId, RoundState> }) {
  const tooSoon = ROUNDS.reduce((sum, round) => sum + states[round.id].tooSoon, 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 border-2 p-4 sm:p-5"
      style={{ borderColor: SENTENCE.color, backgroundColor: `${SENTENCE.color}12` }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: SENTENCE.color }}>
        Jak to poszło za pierwszym razem
      </p>
      <ul className="mt-2 space-y-1.5 text-sm leading-snug">
        {ROUNDS.map((round) => {
          const line = recapLine(states[round.id]);
          return (
            <li key={round.id}>
              <strong>{round.world}:</strong> {line.lead}
              {line.did && <span className="block text-xs text-muted-foreground">Dosłowniak: {line.did}</span>}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm leading-snug text-muted-foreground">
        {tooSoon === 0
          ? 'Za każdym razem sprawdziłeś wynik, zanim powiedziałeś „tak”.'
          : `Uwierzyłeś wynikowi, który nie był dobry, ${tooSoon} ${tooSoon === 1 ? 'raz' : 'razy'}. Dosłowniak nie sprawdzi tego za ciebie.`}
      </p>

      <div className="mt-4 border-t pt-4 text-center" style={{ borderColor: `${SENTENCE.color}55` }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: SENTENCE.color }}>
          {SENTENCE.lead}
        </p>
        <p className="mt-2 text-lg font-bold leading-snug sm:text-xl">{SENTENCE.text}</p>
      </div>
    </motion.div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Lock, Redo2, Save, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Ćwiczenie o cofaniu zmian — **jedyny widżet w kursie, który się przewija**.
 *
 * „Ctrl+Z cofa ostatni krok” to zdanie, które dziecko i tak zna. Czego nie wie,
 * i czego nie da się powiedzieć jednym zdaniem, to trzy rzeczy, które tu wychodzą
 * z samej mechaniki suwaka:
 *
 *  1. **Cofanie zdejmuje z końca.** Nie da się wyjąć kroku ze środka — żeby
 *     usunąć kleks z kroku 4, trzeba wrócić przed niego i stracić kroki 5–8.
 *  2. **Ponowienie przepada, gdy narysujesz coś nowego.** Gałąź przyszłości
 *     znika w chwili, gdy dziecko klika „rysuj dalej” — widzi to na osi.
 *  3. **Cofanie ma koniec.** Edytor pamięta ostatnich kilka kroków (tu sześć),
 *     starsze są zamknięte na kłódkę. Jedynym prawdziwym cofnięciem jest plik
 *     zapisany po ważnym etapie.
 *
 * Trzy zadania odhaczają się same, gdy dziecko na te trzy rzeczy wpadnie —
 * żadne z nich nie jest pytaniem z odpowiedziami do wyboru.
 */

/** Ile kroków wstecz pamięta ten edytor — prawdziwe edytory mają podobny limit. */
const MEMORY = 6;

type Piece = 'tlo' | 'korpus' | 'dziob' | 'kleks' | 'okno' | 'skrzydla' | 'ogien' | 'gwiazdy';

const PIECE_LABEL: Record<Piece, string> = {
  tlo: 'Tło',
  korpus: 'Korpus',
  dziob: 'Dziób',
  kleks: 'Kleks',
  okno: 'Okno',
  skrzydla: 'Skrzydła',
  ogien: 'Ogień',
  gwiazdy: 'Gwiazdy',
};

const FIRST_RUN: Piece[] = [
  'tlo',
  'korpus',
  'dziob',
  'kleks',
  'okno',
  'skrzydla',
  'ogien',
  'gwiazdy',
];
const REDRAW: Piece[] = ['tlo', 'korpus', 'dziob', 'okno', 'skrzydla', 'ogien', 'gwiazdy'];
/** Krok, po którym rysunek jest jeszcze bez kleksa — cel pierwszego zadania. */
const BEFORE_BLOT = 3;

function Shape({ piece }: { piece: Piece }) {
  switch (piece) {
    case 'tlo':
      return <rect x={0} y={0} width={200} height={240} fill="#0f172a" />;
    case 'korpus':
      return <rect x={75} y={70} width={50} height={110} rx={10} fill="#f4f4f5" />;
    case 'dziob':
      return <polygon points="75,72 125,72 100,26" fill="#ef4444" />;
    case 'kleks':
      return (
        <g fill="#18181b">
          <circle cx={138} cy={96} r={27} />
          <circle cx={116} cy={122} r={17} />
          <circle cx={152} cy={126} r={11} />
        </g>
      );
    case 'okno':
      return (
        <g>
          <circle cx={100} cy={104} r={15} fill="#7dd3fc" />
          <circle cx={100} cy={104} r={15} fill="none" stroke="#94a3b8" strokeWidth={3} />
        </g>
      );
    case 'skrzydla':
      return (
        <g fill="#ef4444">
          <polygon points="75,148 75,188 52,196" />
          <polygon points="125,148 125,188 148,196" />
        </g>
      );
    case 'ogien':
      return (
        <g>
          <polygon points="84,180 116,180 100,228" fill="#f59e0b" />
          <polygon points="92,180 108,180 100,210" fill="#fde047" />
        </g>
      );
    case 'gwiazdy':
      return (
        <g fill="#fef9c3">
          <circle cx={28} cy={40} r={3} />
          <circle cx={168} cy={54} r={2.5} />
          <circle cx={44} cy={168} r={2.5} />
          <circle cx={158} cy={200} r={3} />
          <circle cx={20} cy={104} r={2} />
        </g>
      );
    default:
      return null;
  }
}

interface HistoryScrubProps {
  color: string;
  onComplete?: () => void;
}

export function HistoryScrub({ color, onComplete }: HistoryScrubProps) {
  const [steps, setSteps] = useState<Piece[]>(FIRST_RUN);
  const [cursor, setCursor] = useState(FIRST_RUN.length);
  const [foundBefore, setFoundBefore] = useState(false);
  const [redrawn, setRedrawn] = useState(false);
  const [hitLimit, setHitLimit] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const reported = useRef(false);

  /** Starsze kroki wypadły z pamięci programu — poniżej tej granicy cofnąć się nie da. */
  const floor = Math.max(0, steps.length - MEMORY);
  const hasBlot = steps.includes('kleks');
  const allDone = foundBefore && redrawn && hitLimit;

  useEffect(() => {
    if (!allDone || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [allDone, onComplete]);

  const goTo = (value: number) => {
    if (value < floor) {
      setCursor(floor);
      setHitLimit(true);
      setNote('limit');
      return;
    }
    setCursor(value);
    setNote(null);
    if (hasBlot && value === BEFORE_BLOT) setFoundBefore(true);
  };

  const undo = () => {
    if (cursor <= floor) {
      setHitLimit(true);
      setNote('limit');
      return;
    }
    goTo(cursor - 1);
  };

  const redo = () => {
    if (cursor >= steps.length) {
      setNote(redrawn ? 'przepadlo' : 'koniec');
      return;
    }
    goTo(cursor + 1);
  };

  const redraw = () => {
    setSteps(REDRAW);
    setCursor(REDRAW.length);
    setRedrawn(true);
    setNote('przepadlo');
  };

  const tasks = [
    { id: 'przed', label: 'Cofnij rysunek do stanu tuż przed kleksem', done: foundBefore },
    { id: 'dalej', label: 'Narysuj dalszy ciąg bez kleksa', done: redrawn },
    { id: 'limit', label: 'Sprawdź, jak daleko wstecz sięga pamięć edytora', done: hitLimit },
  ];

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Ten rysunek powstał w ośmiu krokach. W czwartym poszło coś nie tak.{' '}
        <strong>Przesuwaj suwak</strong> — zobaczysz, jak obrazek buduje się i rozbiera krok po
        kroku.
      </p>

      <div className="grid gap-5 md:grid-cols-[200px_minmax(0,1fr)]">
        <div>
          <div
            className="mx-auto w-full max-w-[200px] border-2"
            style={{ borderColor: `${color}55` }}
          >
            <svg
              viewBox="0 0 200 240"
              className="block h-auto w-full bg-white"
              role="img"
              aria-label={`Rysunek po ${cursor} krokach`}
            >
              <rect x={0} y={0} width={200} height={240} fill="#ffffff" />
              {steps.slice(0, cursor).map((piece, i) => (
                <Shape key={`${piece}-${i}`} piece={piece} />
              ))}
            </svg>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground tabular-nums">
            Krok {cursor} z {steps.length}
          </p>
        </div>

        <div className="min-w-0">
          {/* Oś historii — ten sam ruch co „Cofnij”, tylko widać, co się dzieje */}
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Historia rysunku
          </label>
          <input
            type="range"
            min={0}
            max={steps.length}
            step={1}
            value={cursor}
            onChange={(event) => goTo(Number(event.target.value))}
            className="w-full cursor-pointer accent-current"
            style={{ color }}
            aria-label="Przewiń historię rysunku"
          />

          <ol className="mt-2 flex flex-wrap gap-1">
            {steps.map((piece, i) => {
              const locked = i < floor;
              const applied = i < cursor;
              return (
                <li key={`${piece}-${i}`}>
                  <button
                    type="button"
                    onClick={() => goTo(i + 1)}
                    className={cn(
                      'inline-flex cursor-pointer items-center gap-1 border px-2 py-1 text-xs font-medium transition-colors',
                      applied
                        ? 'text-white'
                        : 'bg-white text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
                      locked && 'opacity-50'
                    )}
                    style={applied ? { backgroundColor: color, borderColor: color } : undefined}
                  >
                    {locked && <Lock className="h-3 w-3" aria-hidden />}
                    {i + 1}. {PIECE_LABEL[piece]}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={undo}
              className="inline-flex cursor-pointer items-center gap-1.5 border px-3 py-2 text-xs font-bold transition-colors hover:border-primary/50"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden />
              Cofnij <span className="font-mono opacity-60">Ctrl+Z</span>
            </button>
            <button
              type="button"
              onClick={redo}
              className="inline-flex cursor-pointer items-center gap-1.5 border px-3 py-2 text-xs font-bold transition-colors hover:border-primary/50"
            >
              <Redo2 className="h-3.5 w-3.5" aria-hidden />
              Ponów <span className="font-mono opacity-60">Ctrl+Y</span>
            </button>
            {hasBlot && cursor === BEFORE_BLOT && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                type="button"
                onClick={redraw}
                className="inline-flex cursor-pointer items-center gap-1.5 px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: color }}
              >
                Rysuj dalej — bez kleksa
              </motion.button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {note && (
              <motion.p
                key={note}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 border-l-4 bg-muted/40 p-3 text-sm leading-relaxed"
                style={{ borderColor: color }}
              >
                {note === 'limit' && (
                  <>
                    <strong>Dalej wstecz się nie da.</strong> Ten edytor pamięta ostatnich {MEMORY}{' '}
                    kroków — starsze są zamknięte na kłódkę. Dlatego{' '}
                    <strong>plik zapisuje się po każdym ważnym etapie</strong>: zapis jest jedynym
                    cofnięciem, które nie ma limitu.
                  </>
                )}
                {note === 'przepadlo' && (
                  <>
                    <strong>Kroki 5–8 przepadły — i to jest normalne.</strong> W chwili, gdy po
                    cofnięciu rysujesz coś nowego, stara przyszłość znika. „Ponów” nie ma już czego
                    przywrócić.
                  </>
                )}
                {note === 'koniec' && <>Jesteś na ostatnim kroku — nie ma czego ponawiać.</>}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Trzy rzeczy do odkrycia — odhaczają się same, gdy dziecko na nie wpadnie */}
      <div className="mt-5 border-t pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Do odkrycia
        </p>
        <ul className="space-y-1.5">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-2 text-sm leading-snug">
              <span className="mt-0.5 w-4 shrink-0">
                {task.done ? (
                  <Check className="h-4 w-4" style={{ color }} aria-hidden />
                ) : (
                  <span className="block h-3.5 w-3.5 border" aria-hidden />
                )}
              </span>
              <span className={cn(task.done && 'text-muted-foreground line-through')}>
                {task.label}
              </span>
            </li>
          ))}
        </ul>

        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-2 border-l-4 bg-muted/40 p-3 text-sm leading-relaxed"
              style={{ borderColor: color }}
            >
              <Save className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                <strong>Cofanie zdejmuje z końca, ma limit i gubi przyszłość.</strong> Zapisany plik
                nie ma żadnej z tych wad — dlatego przy dłuższym rysunku zapisuj po każdym etapie,
                który szkoda byłoby stracić.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

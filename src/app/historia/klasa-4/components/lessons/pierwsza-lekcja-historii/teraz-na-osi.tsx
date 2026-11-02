'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, GripVertical, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import {
  BUBBLES,
  JARS,
  MARKER_END,
  MARKER_START,
  PAST_THINGS,
  hoursToU,
  judgeJar,
  passedThings,
  predictionReport,
  type Meaning,
} from './teraz';

/**
 * Blok 1 — **„To już historia?”**
 *
 * Część A — gest nowy w kursie: **dziecko ciągnie znacznik „teraz” po osi**.
 * Najpierw zaznacza, co według niego jest już historią (prawie nikt nie
 * zaznacza śniadania), potem przeciąga znacznik od piramid do dziś: wszystko,
 * co zostaje za nim, szarzeje i dostaje stempel „przeszłość” — także śniadanie
 * sprzed trzech godzin. Znacznik jedzie tylko do przodu: czasu nie da się cofnąć.
 *
 * Część B — trzy znaczenia słowa: dziecko przeciąga słowo „historia” z dymka
 * domownika do jednego z trzech słoików. Dymki idą po jednym, słoiki stoją pod
 * spodem — wszystko naraz na ekranie telefonu. Pomyłka: słoik się trzęsie,
 * a pod spodem pada wskazówka z samego zdania.
 */
export function TerazNaOsi({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [axisDone, setAxisDone] = useState(false);

  return (
    <div className="space-y-8">
      <PastAxis color={color} onDone={() => setAxisDone(true)} />
      {/* Słoiki przychodzą po osi, więc ich koniec jest końcem bloku. */}
      {axisDone && <ThreeJars color={color} onDone={onComplete} />}
    </div>
  );
}

// ─── Część A ───

function PastAxis({ color, onDone }: { color: string; onDone: () => void }) {
  const [predicted, setPredicted] = useState<string[]>([]);
  const [phase, setPhase] = useState<'predict' | 'drag' | 'done'>('predict');
  const [marker, setMarker] = useState(MARKER_START);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const passed = passedThings(marker);
  const report = predictionReport(predicted);

  const moveTo = (u: number) => {
    // Czas płynie w jedną stronę: znacznik nie wraca.
    const next = Math.min(MARKER_END, Math.max(marker, u));
    setMarker(next);
    if (next >= MARKER_END && phase === 'drag') {
      setPhase('done');
      onDone();
    }
  };

  const uFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return marker;
    return (clientX - rect.left) / rect.width;
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (phase !== 'drag') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    moveTo(uFromPointer(e.clientX));
  };
  const onPointerUp = () => setDragging(false);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (phase !== 'drag') return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveTo(marker + (e.shiftKey ? 0.1 : 0.03));
    }
  };

  const togglePrediction = (id: string) =>
    setPredicted((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  return (
    <div className="space-y-4">
      {phase === 'predict' ? (
        <div className="space-y-3">
          <p className="text-base leading-relaxed">
            Co z tego jest już <strong>historią</strong>? Stuknij wszystko, co według ciebie się nadaje. Nie ma kary za
            pomyłkę — zaraz sprawdzimy.
          </p>
          <div className="flex flex-wrap gap-2">
            {PAST_THINGS.map((thing) => {
              const on = predicted.includes(thing.id);
              return (
                <button
                  key={thing.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => togglePrediction(thing.id)}
                  className={cn(
                    'rounded-full border px-3 py-2 text-sm transition-colors',
                    on ? 'font-semibold text-white' : 'bg-white hover:bg-muted dark:bg-zinc-900'
                  )}
                  style={on ? { backgroundColor: color, borderColor: color } : undefined}
                >
                  {on && <Check className="mr-1 inline h-3.5 w-3.5" aria-hidden />}
                  {thing.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setPhase('drag')}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            Sprawdzam na osi
          </button>
        </div>
      ) : (
        <p className="text-base leading-relaxed">
          {phase === 'drag' ? (
            <>
              Złap znacznik <strong>„teraz”</strong> i ciągnij go w prawo — od najdawniejszych czasów do dzisiejszej
              chwili. Patrz, co zostaje za nim.
            </>
          ) : (
            <>Znacznik stanął na „teraz”. Za nim zostało wszystko.</>
          )}
        </p>
      )}

      {phase !== 'predict' && (
        <div className="rounded-lg border bg-white px-3 pb-6 pt-2 dark:bg-zinc-900/80 sm:px-5 sm:pb-3">
          {/* Karty stoją poza pasem znacznika (82–118 px), żeby „teraz” niczego nie zasłaniało. */}
          <div className="relative mx-2 h-[212px] sm:mx-5">
            <div ref={trackRef} className="absolute inset-x-0 top-[96px] h-2 rounded-full bg-muted">
              {/* To, co już minęło — szare. */}
              <div className="absolute inset-y-0 left-0 rounded-full bg-zinc-400/60" style={{ width: `${marker * 100}%` }} />
            </div>

            {PAST_THINGS.map((thing, index) => {
              const u = hoursToU(thing.hours);
              const isPast = passed.includes(thing.id);
              const above = index % 2 === 0;
              return (
                <div key={thing.id}>
                  {/* Kreska trafia dokładnie w punkt czasu… */}
                  <div
                    className="absolute w-px bg-zinc-400"
                    style={{ left: `${u * 100}%`, top: above ? 80 : 104, height: above ? 16 : 24 }}
                  />
                  {/* …a karta stoi nad nią, dosunięta do środka przy krawędziach osi. */}
                  <div
                    className={cn(
                      'absolute w-[66px] -translate-x-1/2 rounded-md border px-1 pb-1 pt-2.5 text-center text-[11px] leading-tight transition-colors duration-300 sm:w-[112px] sm:text-xs',
                      isPast ? 'border-zinc-300 bg-zinc-100 text-zinc-500 dark:bg-zinc-800' : 'bg-white dark:bg-zinc-900'
                    )}
                    style={{
                      left: `clamp(33px, ${u * 100}%, calc(100% - 33px))`,
                      ...(above ? { bottom: 132 } : { top: 128 }),
                    }}
                  >
                    <span className="block font-medium">{thing.label}</span>
                    <span className="block text-[10px] text-muted-foreground">{thing.ago}</span>
                    {isPast && (
                      <motion.span
                        initial={{ scale: 1.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rotate-[-6deg] whitespace-nowrap rounded border-2 px-1 text-[9px] font-bold uppercase leading-none tracking-wide"
                        style={{ color, borderColor: color, backgroundColor: 'var(--background)' }}
                      >
                        przeszłość
                      </motion.span>
                    )}
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              role="slider"
              aria-label="Znacznik teraz"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(marker * 100)}
              disabled={phase !== 'drag'}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
              className={cn(
                'absolute top-[82px] z-10 flex h-9 -translate-x-1/2 touch-none select-none items-center gap-0.5 rounded-full border-2 bg-white pl-1 pr-2.5 text-xs font-bold shadow-md dark:bg-zinc-900',
                phase === 'drag' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              )}
              style={{ left: `${marker * 100}%`, borderColor: color, color }}
            >
              <GripVertical className="h-4 w-4" aria-hidden />
              teraz
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
          <p>
              Zaznaczyłeś/zaznaczyłaś {report.hit} z {report.total}.{' '}
              {report.missed.length > 0 ? (
                <>
                  Nie wyglądało ci na historię:{' '}
                  <strong>{report.missed.map((thing) => thing.label).join(', ')}</strong>. A znacznik minął{' '}
                  {report.missed.length === 1 ? 'to' : 'je'} tak samo jak piramidę.
                </>
              ) : (
                <>Wszystko — brawo, nawet śniadanie!</>
              )}
          </p>
          <p>
            <strong>Przeszłość to wszystko, co już minęło</strong> — i to sprzed 4600 lat, i to sprzed trzech godzin. Nawet
            chwila, w której złapałeś/złapałaś znacznik, jest już przeszłością. Ale historycy nie opowiadają o każdym
            śniadaniu: wybierają to, co ważne, i to, po czym zostały ślady.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Część B ───

function ThreeJars({ color, onDone }: { color: string; onDone: () => void }) {
  const [placed, setPlaced] = useState<Record<string, Meaning>>({});
  const [wrong, setWrong] = useState<{ jar: Meaning; clue: string; n: number } | null>(null);
  const [drag, setDrag] = useState<{ dx: number; dy: number; x0: number; y0: number } | null>(null);
  const jarRefs = useRef<Partial<Record<Meaning, HTMLButtonElement | null>>>({});

  const current = BUBBLES.find((b) => !placed[b.id]);
  const placedCount = Object.keys(placed).length;

  const drop = (jar: Meaning) => {
    if (!current) return;
    const verdict = judgeJar(current.id, jar);
    if (!verdict.ok) {
      setWrong((prev) => ({ jar, clue: verdict.clue ?? '', n: (prev?.n ?? 0) + 1 }));
      return;
    }
    setWrong(null);
    const next = { ...placed, [current.id]: jar };
    setPlaced(next);
    if (Object.keys(next).length === BUBBLES.length) onDone();
  };

  const jarAt = (x: number, y: number): Meaning | undefined =>
    (Object.keys(JARS) as Meaning[]).find((jar) => {
      const rect = jarRefs.current[jar]?.getBoundingClientRect();
      return rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });

  const onPointerDown = (e: PointerEvent<HTMLSpanElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ dx: 0, dy: 0, x0: e.clientX, y0: e.clientY });
  };
  const onPointerMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (!drag) return;
    setDrag({ ...drag, dx: e.clientX - drag.x0, dy: e.clientY - drag.y0 });
  };
  const onPointerUp = (e: PointerEvent<HTMLSpanElement>) => {
    if (!drag) return;
    setDrag(null);
    const jar = jarAt(e.clientX, e.clientY);
    if (jar) drop(jar);
  };

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">
        Słowo „historia” znaczy w domu trzy różne rzeczy. Przeciągnij je z dymka do słoika, do którego pasuje — podpowiedź
        jest zawsze w samym zdaniu.
      </p>

      <div className="rounded-lg border bg-white p-4 dark:bg-zinc-900/80">
        {current ? (
          <div className="min-h-[92px]">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {current.who} mówi · dymek {placedCount + 1} z {BUBBLES.length}
            </p>
            <p className="rounded-2xl rounded-tl-none bg-muted/60 px-4 py-3 text-base leading-loose">
              {current.before}
              <span
                role="button"
                tabIndex={-1}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => setDrag(null)}
                className={cn(
                  'relative inline-block touch-none select-none rounded-md border-2 border-dashed px-2 font-semibold',
                  drag ? 'z-20 cursor-grabbing shadow-lg' : 'cursor-grab'
                )}
                style={{
                  borderColor: color,
                  color,
                  backgroundColor: 'var(--background)',
                  transform: drag ? `translate(${drag.dx}px, ${drag.dy}px)` : undefined,
                }}
              >
                {current.word}
              </span>
              {current.after}
            </p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">
            Wszystkie sześć słów w słoikach. Jedno słowo — trzy znaczenia: <strong>opowieść</strong>,{' '}
            <strong>przeszłość</strong> i <strong>nauka o przeszłości</strong>. Na lekcjach historii chodzi o to trzecie:
            historycy badają przeszłość ludzi i starają się opowiadać ją tak, jak naprawdę było. A pytanie z osi — co jest
            „już historią” — dotyczyło drugiego słoika: przeszłości.
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {(Object.keys(JARS) as Meaning[]).map((jar) => {
          const inJar = BUBBLES.filter((b) => placed[b.id] === jar);
          const shaking = wrong?.jar === jar;
          return (
            <motion.button
              key={shaking ? `${jar}-${wrong?.n}` : jar}
              ref={(el) => {
                jarRefs.current[jar] = el;
              }}
              type="button"
              disabled={!current}
              onClick={() => drop(jar)}
              aria-label={`Słoik: ${JARS[jar].label}`}
              initial={shaking ? { x: 0 } : false}
              animate={shaking ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className={cn(
                'flex min-h-[130px] flex-col items-center rounded-b-3xl rounded-t-lg border-2 border-t-8 bg-white px-1.5 pb-2 pt-2 text-center dark:bg-zinc-900',
                shaking && 'border-red-400'
              )}
              style={shaking ? undefined : { borderColor: `${color}66` }}
            >
              <span className="text-sm font-bold leading-tight" style={{ color }}>
                {JARS[jar].label}
              </span>
              <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{JARS[jar].test}</span>
              <span className="mt-auto flex flex-wrap justify-center gap-1 pt-2">
                {inJar.map((b) => (
                  <span key={b.id} className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: color }}>
                    {b.who.toLowerCase()}
                  </span>
                ))}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="min-h-[1.5rem] text-sm leading-relaxed" aria-live="polite">
        {wrong ? (
          <span className="text-red-700 dark:text-red-400">
            Nie ten słoik. {wrong.clue}
          </span>
        ) : current ? (
          <span className="text-muted-foreground">
            Nie chce się przeciągać? Stuknij słoik. W słoikach: {placedCount}{' '}
            {plural(placedCount, { one: 'słowo', few: 'słowa', many: 'słów' })}.
          </span>
        ) : null}
      </p>

      {!current && (
        <button
          type="button"
          onClick={() => {
            setPlaced({});
            setWrong(null);
          }}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Wysyp słoiki i spróbuj jeszcze raz
        </button>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Hand, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fallsUntil, GAP_CANDIDATES, GAP_INDEX, judgeGap, MORNING_CHAIN, type GapVerdict } from './domino';

const FALL_STEP_MS = 420;
const PUSH_PX = 28;

type Round = 'pierwsza' | 'luka';

/**
 * Blok 1 — **„Domino poranka”** (haczyk).
 *
 * Gesty nowe w kursie: **popchnięcie pierwszej kostki** (przeciągnięcie jej
 * palcem w prawo — albo stuknięcie / Enter) i **wstawienie brakującego
 * ogniwa**. W pierwszej rundzie łańcuch przewraca się sam, a pod kostkami
 * dopisuje się poranek Oli. W drugiej jednej kostki brakuje; dziecko
 * przeciąga do luki jedną z trzech i popycha znowu. Kostka, która nie wynika
 * z poprzedniej, nie upadnie (łańcuch staje przed nią), a ta, która nie
 * prowadzi dalej, upadnie, ale nie przewróci następnej — to konsekwencja,
 * nie ocena. Sędzia: `judgeGap` w `domino.ts`.
 */
export function DominoPoranka({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [round, setRound] = useState<Round>('pierwsza');
  const [fallen, setFallen] = useState(-1);
  const [target, setTarget] = useState<number | null>(null);
  const [inGap, setInGap] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<GapVerdict | null>(null);
  const [tried, setTried] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number; sx: number; sy: number } | null>(null);
  const slotRef = useRef<HTMLButtonElement>(null);
  const pushStart = useRef<number | null>(null);

  const running = target !== null && fallen < target;
  const pushed = target !== null;

  // Przewracanie kostka po kostce — bez udziału dziecka.
  useEffect(() => {
    if (target === null || fallen >= target) return;
    const t = window.setTimeout(() => setFallen((f) => f + 1), FALL_STEP_MS);
    return () => window.clearTimeout(t);
  }, [fallen, target]);

  // Łańcuch się zatrzymał — w drugiej rundzie dopiero teraz sędzia mówi, co się stało.
  useEffect(() => {
    if (round !== 'luka' || target === null || fallen < target || !inGap) return;
    setVerdict(judgeGap(inGap));
  }, [round, target, fallen, inGap]);

  const tileAt = (i: number) => {
    if (round === 'luka' && i === GAP_INDEX) {
      const c = GAP_CANDIDATES.find((x) => x.id === inGap);
      return c ? { id: c.id, time: c.time, text: c.text } : null;
    }
    return MORNING_CHAIN[i];
  };

  const push = () => {
    if (pushed) return;
    if (round === 'luka' && !inGap) return;
    setFallen(-1);
    setTarget(round === 'pierwsza' ? MORNING_CHAIN.length - 1 : fallsUntil(inGap));
  };

  const standUp = () => {
    setTarget(null);
    setFallen(-1);
    setVerdict(null);
  };

  const startGapRound = () => {
    setRound('luka');
    standUp();
  };

  const placeInGap = (id: string) => {
    if (pushed && verdict?.ok) return;
    standUp();
    setInGap(id);
    setSelected(null);
  };

  const retry = () => {
    if (inGap) setTried((prev) => (prev.includes(inGap) ? prev : [...prev, inGap]));
    setInGap(null);
    standUp();
  };

  // Popchnięcie: przeciągnięcie pierwszej kostki w prawo.
  const onFirstDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    pushStart.current = e.clientX;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // bez przechwycenia też zadziała stuknięcie
    }
  };
  const onFirstMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (pushStart.current === null) return;
    if (e.clientX - pushStart.current > PUSH_PX) {
      pushStart.current = null;
      push();
    }
  };
  const onFirstUp = () => {
    pushStart.current = null;
  };

  // Przeciąganie kandydata do luki (duch przy palcu, upuszczenie nad luką).
  const onCandDown = (id: string) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (verdict?.ok) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // stuknięcie dalej działa
    }
    setDrag({ id, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
  };
  const onCandMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
  };
  const onCandUp = (id: string) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const moved = Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8;
    const r = slotRef.current?.getBoundingClientRect();
    const over = r && e.clientX >= r.left - 16 && e.clientX <= r.right + 16 && e.clientY >= r.top - 24 && e.clientY <= r.bottom + 24;
    setDrag(null);
    if (over) placeInGap(id);
    else if (!moved) setSelected((s) => (s === id ? null : id));
  };

  const caption = (() => {
    const lines: { time: string; text: string; i: number }[] = [];
    for (let i = 0; i <= Math.min(fallen, MORNING_CHAIN.length - 1); i++) {
      const t = tileAt(i);
      if (t) lines.push({ time: t.time, text: t.text, i });
    }
    return lines;
  })();

  const stoppedAt = target !== null && !running && target < MORNING_CHAIN.length - 1 ? target + 1 : null;
  const firstRoundDone = round === 'pierwsza' && target !== null && !running;

  return (
    <div className="space-y-5">
      <p className="text-base leading-relaxed">
        {round === 'pierwsza' ? (
          <>
            Każda kostka to jedno zdarzenie z poranka Oli <span className="text-muted-foreground">(postać wymyślona)</span>.{' '}
            <strong>Popchnij pierwszą kostkę palcem w prawo</strong> i patrz, co się stanie.
          </>
        ) : (
          <>
            Teraz jednej kostki brakuje. <strong>Przeciągnij do luki jedną z trzech kostek</strong> i popchnij łańcuch
            jeszcze raz. Upadnie tylko taka kostka, która <em>wynika</em> z poprzedniej — i przewróci następną tylko
            wtedy, gdy ją <em>powoduje</em>.
          </>
        )}
      </p>

      {/* Wyświetlacz: rząd kostek + kronika poranka pod nim. Ostatnia kostka po upadku wystaje ~80 px w prawo —
          stąd zapas `pr-16` i `overflow-hidden` (inaczej poziomy scroll na 390 px). */}
      <div className="overflow-hidden border bg-muted/30 p-3 sm:p-4">
        <div className="flex items-end justify-start gap-1.5 pb-2 pr-16 pt-6 sm:justify-center sm:gap-5 sm:pr-20" aria-label="Rząd kostek domina">
          {MORNING_CHAIN.map((_, i) => {
            const t = tileAt(i);
            const isGap = round === 'luka' && i === GAP_INDEX;
            const down = i <= fallen;
            const stopped = stoppedAt === i;
            if (isGap && !t) {
              return (
                <button
                  key="slot"
                  ref={slotRef}
                  type="button"
                  aria-label={selected ? 'Wstaw wybraną kostkę do luki' : 'Pusta luka w łańcuchu'}
                  onClick={() => selected && placeInGap(selected)}
                  className={cn(
                    'flex h-20 w-9shrink-0 items-center justify-center border-2 border-dashed text-lg font-bold sm:h-24 sm:w-12',
                    (selected || drag) && 'animate-pulse'
                  )}
                  style={{ borderColor: color, color }}
                >
                  ?
                </button>
              );
            }
            const first = i === 0;
            return (
              <motion.button
                key={`${i}-${t?.id}`}
                ref={isGap ? slotRef : undefined}
                type="button"
                disabled={!first && !isGap}
                aria-label={
                  first
                    ? `Pierwsza kostka, ${t?.time} — przeciągnij w prawo albo naciśnij, żeby popchnąć`
                    : isGap
                      ? `Wstawiona kostka: ${t?.text} — naciśnij, żeby wyjąć`
                      : `Kostka ${t?.time}`
                }
                onPointerDown={first ? onFirstDown : undefined}
                onPointerMove={first ? onFirstMove : undefined}
                onPointerUp={first ? onFirstUp : undefined}
                onPointerCancel={first ? onFirstUp : undefined}
                onClick={first ? push : isGap && !pushed ? () => setInGap(null) : undefined}
                animate={
                  stopped
                    ? { rotate: [0, 9, -3, 6, 0] }
                    : { rotate: down ? 68 : 0, x: down ? 6 : 0 }
                }
                transition={stopped ? { duration: 0.6 } : { type: 'spring', stiffness: 260, damping: 18 }}
                style={{ transformOrigin: '100% 100%', borderColor: isGap ? color : undefined }}
                className={cn(
                  'relative flex h-20 w-9shrink-0 touch-none flex-col items-center justify-start border-2 bg-white pt-1.5 text-[10px] font-semibold tabular-nums shadow-sm disabled:cursor-default dark:bg-zinc-900 sm:h-24 sm:w-12 sm:text-xs',
                  first && !pushed && 'cursor-grab ring-2 ring-offset-2',
                  stopped && 'border-destructive'
                )}
              >
                <span>{t?.time}</span>
                <span className="mt-2 block h-px w-5 bg-current opacity-30" aria-hidden />
                <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-current opacity-40" aria-hidden />
                {first && !pushed && (
                  <Hand className="absolute -left-1 -top-6 h-4 w-4 animate-pulse" style={{ color }} aria-hidden />
                )}
              </motion.button>
            );
          })}
        </div>

        <ol className="mt-3 min-h-[3rem] space-y-1.5 border-t pt-3 text-sm leading-snug" aria-live="polite">
          {caption.length === 0 && (
            <li className="text-muted-foreground">Kostki stoją. Nic się jeszcze nie wydarzyło.</li>
          )}
          {caption.map((c) => (
            <motion.li
              key={`${c.i}-${c.text}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn('flex gap-2', round === 'luka' && c.i === GAP_INDEX && 'font-semibold')}
            >
              <span className="w-11 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{c.time}</span>
              <span>
                {c.i > 0 && <span className="mr-1 text-muted-foreground">więc</span>}
                {c.text}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* Taca z kandydatami — tylko w drugiej rundzie. */}
      {round === 'luka' && !verdict?.ok && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kostki do wyboru — przeciągnij do luki (albo stuknij kostkę, a potem lukę)
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {GAP_CANDIDATES.map((c) => {
              const used = inGap === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={used || running}
                  onPointerDown={onCandDown(c.id)}
                  onPointerMove={onCandMove}
                  onPointerUp={onCandUp(c.id)}
                  onPointerCancel={() => setDrag(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      placeInGap(c.id);
                    }
                  }}
                  className={cn(
                    'flex touch-none gap-3 border-2 bg-white p-3 text-left text-sm leading-snug transition-opacity disabled:opacity-35 dark:bg-zinc-900',
                    selected === c.id ? 'font-semibold' : 'border-transparent',
                    tried.includes(c.id) && !used && 'opacity-60'
                  )}
                  style={selected === c.id ? { borderColor: color } : undefined}
                >
                  <span className="font-mono text-xs font-bold tabular-nums" style={{ color }}>
                    {c.time}
                  </span>
                  <span>{c.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {drag && (
        <div
          className="pointer-events-none fixed z-50 w-40 -translate-x-1/2 -translate-y-1/2 border-2 bg-white p-2 text-xs shadow-lg dark:bg-zinc-900"
          style={{ left: drag.x, top: drag.y, borderColor: color }}
          aria-hidden
        >
          {GAP_CANDIDATES.find((c) => c.id === drag.id)?.text}
        </div>
      )}

      {/* Sterowanie i wynik. */}
      <div className="flex flex-wrap items-center gap-3">
        {!pushed && (round === 'pierwsza' || inGap) && (
          <button
            type="button"
            onClick={push}
            className="inline-flex items-center gap-1.5 border-2 px-4 py-2 text-sm font-semibold"
            style={{ borderColor: color, color }}
          >
            <Hand className="h-4 w-4" aria-hidden /> Popchnij pierwszą kostkę
          </button>
        )}
        {firstRoundDone && (
          <button
            type="button"
            onClick={startGapRound}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            Ustaw kostki jeszcze raz <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {firstRoundDone && (
        <p className="bg-muted/60 p-4 text-base leading-relaxed">
          Jeden telefon, którego nikt nie podłączył do ładowarki — i cały poranek poleciał. Każda kostka ma swoje <strong>„dlaczego?”</strong>{' '}
          (kostkę przed nią) i swoje <strong>„co z tego wynikło?”</strong> (kostkę za nią). Historycy mówią na to:{' '}
          <strong>przyczyna</strong> i <strong>skutek</strong>.
        </p>
      )}

      {verdict && !verdict.ok && (
        <div className="space-y-3 border-l-2 border-destructive pl-4" aria-live="polite">
          <p className="text-sm font-semibold">
            {verdict.breaksAt === 'next'
              ? 'Wstawiona kostka upadła, ale nie przewróciła następnej.'
              : 'Łańcuch stanął przed wstawioną kostką — nie przewróciła jej poprzednia.'}
          </p>
          <p className="text-sm leading-relaxed">{verdict.why}</p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm font-semibold"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Wyjmij kostkę i spróbuj innej
          </button>
        </div>
      )}

      {verdict?.ok && (
        <div className="space-y-3 border-2 p-4" style={{ borderColor: color }} aria-live="polite">
          <p className="text-base leading-relaxed">
            <strong>Łańcuch przewrócił się do końca.</strong> {verdict.why}
          </p>
          <p className="text-base leading-relaxed">
            Zauważ: „autobus odjechał” jest <strong>skutkiem</strong> zaspania i jednocześnie <strong>przyczyną</strong>{' '}
            spóźnienia. W łańcuchu prawie każda kostka gra obie role naraz — w historii jest tak samo.
          </p>
          {!finished && (
            <button
              type="button"
              onClick={() => {
                setFinished(true);
                onComplete();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              Dalej — do prawdziwej historii <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

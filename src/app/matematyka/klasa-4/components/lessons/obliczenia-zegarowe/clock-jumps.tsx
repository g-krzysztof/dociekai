'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, AnimatePresence, motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { ClockFace, CLOCK_FACE_RADIUS } from '../../clock-face';
import { arcPath } from '../../../lib/clock';
import { formatDuration, type TimeJump } from '../../../lib/time';

const ARC_RADIUS = CLOCK_FACE_RADIUS - 10;

interface ClockJumpsProps {
  color: string;
  jumps: TimeJump[];
  /** Ile pierwszych skoków jest już „wykonanych" — w pełni sterowane przez rodzica, tak jak `jumps` w `<JumpLine>`. */
  revealedCount: number;
  size?: number;
  ariaLabel: string;
}

/**
 * Krążąca po tarczy zegara wersja `<JumpLine>` z Modułu 1: ta sama strategia
 * „doliczania" (najpierw do pełnej godziny, potem pełne godziny, na końcu
 * reszta minut), tylko po okręgu zamiast po otwartej osi. Wskazówka minutowa
 * płynnie „zmiata" każdy skok minutowy (animacja liczby minut od-do przez
 * `framer-motion`'s `animate()`), a przy pełnogodzinnym skoku kręci się przez
 * tyle pełnych obrotów, ile trwa skok — dosłowna wizualizacja „tyle godzin
 * minęło". Każdy ukończony skok zostawia trwały, kolorowy łuk na tarczy
 * (skoki minutowe) albo plakietkę „+N h" (skoki godzinowe — wskazówka
 * minutowa wraca w to samo miejsce, więc nie ma czego rysować jako łuk).
 */
export function ClockJumps({ color, jumps, revealedCount, size = 240, ariaLabel }: ClockJumpsProps) {
  const startTotal = jumps[0]?.fromTotal ?? 0;
  const targetFor = useCallback(
    (count: number) => (count === 0 ? startTotal : (jumps[count - 1]?.toTotal ?? startTotal)),
    [jumps, startTotal]
  );

  const [runningTotal, setRunningTotal] = useState(() => targetFor(revealedCount));
  const [activeJumpId, setActiveJumpId] = useState<string | null>(null);
  const runningTotalRef = useRef(runningTotal);
  const prevRevealedRef = useRef(revealedCount);

  // Nowy zestaw skoków (np. kolejna runda ćwiczenia) — dopasuj stan od razu,
  // zanim drugi efekt zdąży cokolwiek animować.
  useEffect(() => {
    const snap = targetFor(revealedCount);
    runningTotalRef.current = snap;
    setRunningTotal(snap);
    setActiveJumpId(null);
    prevRevealedRef.current = revealedCount;
    // revealedCount celowo pominięte — ten efekt ma reagować wyłącznie na
    // nowy zestaw skoków, nie na każdą zmianę revealedCount (tym zajmuje się
    // drugi efekt niżej).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumps, targetFor]);

  useEffect(() => {
    const prev = prevRevealedRef.current;
    prevRevealedRef.current = revealedCount;
    if (revealedCount === prev) return;

    if (revealedCount < prev) {
      const snap = targetFor(revealedCount);
      runningTotalRef.current = snap;
      setRunningTotal(snap);
      setActiveJumpId(null);
      return;
    }

    let cancelled = false;
    (async () => {
      for (let i = prev; i < revealedCount; i++) {
        const jump = jumps[i];
        if (!jump) continue;
        setActiveJumpId(jump.id);
        await new Promise<void>((resolve) => {
          animate(runningTotalRef.current, jump.toTotal, {
            duration: jump.kind === 'hours' ? 1.2 : 0.75,
            ease: 'easeInOut',
            onUpdate: (value) => {
              runningTotalRef.current = value;
              setRunningTotal(value);
            },
            onComplete: resolve,
          });
        });
        if (cancelled) return;
      }
      if (!cancelled) setActiveJumpId(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [revealedCount, jumps, targetFor]);

  const hours24 = Math.floor(runningTotal / 60) % 24;
  const minutes = runningTotal % 60;
  const completedTotal =
    revealedCount === 0 ? 0 : jumps.slice(0, revealedCount).reduce((sum, j) => sum + j.deltaMinutes, 0);
  const activeJump = jumps.find((j) => j.id === activeJumpId);

  return (
    <div className="flex flex-col items-center gap-4" role="img" aria-label={ariaLabel}>
      <div className="relative">
        <ClockFace
          color={color}
          hours24={hours24}
          minutes={minutes}
          size={size}
          ariaLabel={ariaLabel}
          overlay={
            <>
              {jumps.slice(0, revealedCount).map((jump) =>
                jump.kind === 'minutes' ? (
                  <motion.path
                    key={jump.id}
                    d={arcPath(ARC_RADIUS, (jump.fromTotal % 60) * 6, jump.deltaMinutes * 6)}
                    fill="none"
                    stroke={color}
                    strokeWidth={9}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.85 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                ) : null
              )}
            </>
          }
        />

        <AnimatePresence>
          {activeJump?.kind === 'hours' && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-x-0 top-3 flex justify-center"
            >
              <span
                className="inline-flex items-center gap-1 border-2 bg-white px-2 py-0.5 font-mono text-sm font-bold tabular-nums dark:bg-zinc-900"
                style={{ borderColor: color, color }}
              >
                <RotateCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '0.9s' }} aria-hidden />
                {activeJump.shortLabel}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {jumps.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {jumps.map((jump, i) => {
            const done = i < revealedCount;
            const active = jump.id === activeJumpId;
            return (
              <span
                key={jump.id}
                className="inline-flex items-center gap-1 border px-2.5 py-1 font-mono text-xs font-bold tabular-nums transition-all sm:text-sm"
                style={{
                  borderColor: done || active ? color : `${color}33`,
                  backgroundColor: done ? `${color}14` : undefined,
                  color: done || active ? color : 'var(--muted-foreground)',
                  opacity: done || active ? 1 : 0.5,
                }}
              >
                {jump.shortLabel}
              </span>
            );
          })}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground sm:text-base">
        Razem dotąd:{' '}
        <span className="font-mono font-bold tabular-nums" style={{ color }}>
          {formatDuration(completedTotal)}
        </span>
      </p>
    </div>
  );
}

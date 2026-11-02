'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FractionNotation } from '../../fraction-notation';

const WIDTH = 640;
const HEIGHT = 110;
const PAD_L = 34;
const PAD_R = 34;
const LINE_Y = 62;
const PLOT_W = WIDTH - PAD_L - PAD_R;
const HIT_RADIUS = 22;

export interface FractionLineRound {
  label: string;
  licznik: number;
  mianownik: number;
}

interface FractionLineLabProps {
  color: string;
  rounds: FractionLineRound[];
  /** Etykiety końców odcinka — domyślnie „0"/„1", w narracji szlaku np. „Start"/„Meta". */
  endpointLabels?: [string, string];
  onComplete?: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Pierwszy w kursie ciągły drag PO SAMEJ OSI LICZBOWEJ — nie po osobnym torze
 * jak uchwyt mianownika we `FractionBar`, nie po okręgu jak w `AngleBuilder`.
 * Odcinek 0–1 jest z góry podzielony na `mianownik` (zadany przez rundę)
 * równych części; dziecko przeciąga punkt wzdłuż tych podziałek, licznik
 * buduje się na żywo z pozycji (ile podziałek od zera przeszedł punkt).
 * Runda kończy się, gdy pozycja dokładnie trafi w zadany ułamek — bez
 * blokady, dowolna liczba prób, tak jak we `FractionBar`.
 *
 * Reużyty w dwóch narracjach tej lekcji — budowanie pojęcia (Nowe pojęcie,
 * odcinek 0–1) i szlak turystyczny (Zadanie problemowe, Start–Meta) — ten sam
 * mechanizm, dwie etykiety końców osi (por. `AngleBuilder`).
 */
export function FractionLineLab({ color, rounds, endpointLabels = ['0', '1'], onComplete }: FractionLineLabProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const round = rounds[roundIndex];
  const totalTicks = round?.mianownik ?? 1;
  const isLast = roundIndex === rounds.length - 1;
  const matched = Boolean(round) && position === round.licznik;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const xOf = (index: number) => PAD_L + (index / totalTicks) * PLOT_W;

  const setFromClientX = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const scale = WIDTH / rect.width;
    const localX = (clientX - rect.left) * scale;
    const ratio = clamp((localX - PAD_L) / PLOT_W, 0, 1);
    setPosition(Math.round(ratio * totalTicks));
  };

  const next = () => {
    if (!isLast) {
      setRoundIndex((prev) => prev + 1);
      setPosition(0);
      return;
    }
    onComplete?.();
  };

  if (!round) return null;

  const handleX = xOf(position);

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {rounds.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{rounds.length}
        </span>
      </div>

      <p className="mb-6 text-sm font-semibold leading-relaxed sm:text-base">{round.label}</p>

      <div className="grid gap-8 md:grid-cols-[1fr_170px] md:items-center">
        <div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-auto w-full touch-none select-none"
            role="img"
            aria-label={`Odcinek od ${endpointLabels[0]} do ${endpointLabels[1]} podzielony na ${totalTicks} równych części, przeciągnij punkt`}
          >
            <line x1={PAD_L} y1={LINE_Y} x2={WIDTH - PAD_R} y2={LINE_Y} stroke={color} strokeOpacity={0.3} strokeWidth={2} />

            {Array.from({ length: totalTicks + 1 }, (_, i) => {
              const isEnd = i === 0 || i === totalTicks;
              return (
                <g key={i}>
                  <line
                    x1={xOf(i)}
                    y1={LINE_Y - (isEnd ? 12 : 6)}
                    x2={xOf(i)}
                    y2={LINE_Y + (isEnd ? 12 : 6)}
                    stroke={color}
                    strokeOpacity={isEnd ? 0.7 : 0.4}
                    strokeWidth={isEnd ? 2.5 : 1.5}
                  />
                  {isEnd && (
                    <text x={xOf(i)} y={LINE_Y + 28} textAnchor="middle" fontSize={12} fontWeight={700} fill={textColor}>
                      {i === 0 ? endpointLabels[0] : endpointLabels[1]}
                    </text>
                  )}
                </g>
              );
            })}

            {!hasInteracted && (
              <motion.circle
                cx={handleX}
                cy={LINE_Y}
                fill="none"
                stroke={color}
                strokeWidth={2}
                initial={{ r: 10, opacity: 0.7 }}
                animate={{ r: [10, 20, 10], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              />
            )}

            <motion.circle
              cx={handleX}
              cy={LINE_Y}
              r={9}
              fill={matched ? '#10b981' : color}
              stroke="white"
              strokeWidth={2}
              animate={{ cx: handleX }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              pointerEvents="none"
            />

            <circle
              cx={handleX}
              cy={LINE_Y}
              r={HIT_RADIUS}
              fill="transparent"
              role="slider"
              aria-label="Pozycja punktu na osi"
              aria-valuemin={0}
              aria-valuemax={totalTicks}
              aria-valuenow={position}
              tabIndex={0}
              style={{ cursor: dragging ? 'grabbing' : 'grab' }}
              onPointerDown={(event) => {
                event.preventDefault();
                (event.currentTarget as SVGCircleElement).setPointerCapture(event.pointerId);
                setDragging(true);
                setHasInteracted(true);
                setFromClientX(event.clientX);
              }}
              onPointerMove={(event) => {
                if (dragging) setFromClientX(event.clientX);
              }}
              onPointerUp={() => setDragging(false)}
              onPointerCancel={() => setDragging(false)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                  setHasInteracted(true);
                  setPosition((prev) => Math.min(totalTicks, prev + 1));
                }
                if (event.key === 'ArrowLeft') {
                  setHasInteracted(true);
                  setPosition((prev) => Math.max(0, prev - 1));
                }
              }}
            />
          </svg>

          <p className="mt-2 text-xs" style={{ color: textColor }}>
            Przeciągnij punkt po osi — zatrzaśnie się na najbliższej podziałce.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <FractionNotation licznik={position} mianownik={totalTicks} color={color} licznikRevealed mianownikRevealed size="md" />
          <p className="text-center text-xs text-muted-foreground">
            Cel: {round.licznik}/{round.mianownik}
          </p>
        </div>
      </div>

      {matched && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex flex-wrap items-center justify-between gap-3 bg-emerald-50 p-4 dark:bg-emerald-950/40"
        >
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Dokładnie tam! To jest {round.licznik}/{round.mianownik}.
          </p>
          <Button onClick={next} style={{ backgroundColor: color }} className="gap-1.5 text-white hover:opacity-90">
            {isLast ? 'Dalej' : 'Kolejny punkt'}
            {isLast ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

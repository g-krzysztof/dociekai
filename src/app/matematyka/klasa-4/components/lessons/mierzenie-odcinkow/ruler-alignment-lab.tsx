'use client';

import { useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, Move, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { buildTicks, tickHeightForMm } from './ruler-geometry';

const WORLD_MM = 170;
const RULER_LEN_MM = 110;
const PAD = 14;
const OFFSET_MIN = 0;
const OFFSET_MAX = WORLD_MM - RULER_LEN_MM;

const SEGMENT_Y = 26;
const RULER_TICK_TOP = 62;
const LABEL_Y = RULER_TICK_TOP + 30;
const HEIGHT = LABEL_Y + 10;
const WIDTH = WORLD_MM + PAD * 2;

interface Round {
  segmentStart: number;
  length: number;
  initialOffset: number;
  labelA: string;
  labelB: string;
}

/** Dwie rundy: pierwsza wymaga przesunąć linijkę w prawo, druga — w lewo, żeby technika nie skojarzyła się z jednym kierunkiem. */
const ROUNDS: Round[] = [
  { segmentStart: 38, length: 47, initialOffset: 0, labelA: 'A', labelB: 'B' },
  { segmentStart: 12, length: 98, initialOffset: 60, labelA: 'C', labelB: 'D' },
];

const RULER_TICKS = buildTicks(RULER_LEN_MM);

interface RulerAlignmentLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: dziecko przeciąga linijkę, aż kreska 0 trafi dokładnie w
 * początek odcinka, potem odczytuje i wpisuje długość. Odcinek stoi w stałym
 * miejscu "świata" (viewBox), linijka to przesuwana grupa `<g transform=
 * "translate(offset,0)">` — dzięki temu wyrównanie zera z punktem A jest
 * dosłownie zgodnością współrzędnych, nie efektem wizualnym na oko.
 */
export function RulerAlignmentLab({ color, onComplete }: RulerAlignmentLabProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const round = ROUNDS[roundIndex];

  const [offset, setOffset] = useState(round.initialOffset);
  const [dragging, setDragging] = useState(false);
  const [value, setValue] = useState('');
  const [answered, setAnswered] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const grabLocalRef = useRef(0);

  const aligned = offset === round.segmentStart;
  const isLastRound = roundIndex === ROUNDS.length - 1;
  const isCorrectValue = Number(value.trim().replace(',', '.')) === round.length;

  const worldMmFromClientX = (clientX: number): number => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return offset;
    const scale = WIDTH / rect.width;
    return (clientX - rect.left) * scale - PAD;
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGRectElement>) => {
    if (aligned) return;
    (event.target as Element).setPointerCapture?.(event.pointerId);
    grabLocalRef.current = worldMmFromClientX(event.clientX) - offset;
    setDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGRectElement>) => {
    if (!dragging || aligned) return;
    const worldMm = worldMmFromClientX(event.clientX);
    const next = Math.round(worldMm - grabLocalRef.current);
    setOffset(Math.min(OFFSET_MAX, Math.max(OFFSET_MIN, next)));
  };

  const handlePointerUp = () => setDragging(false);

  const submitReading = (event: FormEvent) => {
    event.preventDefault();
    if (answered || !value.trim()) return;
    setAnswered(true);
    if (Number(value.trim().replace(',', '.')) === round.length) onComplete?.();
  };

  const nextRound = () => {
    if (isLastRound) return;
    const next = ROUNDS[roundIndex + 1];
    setRoundIndex((prev) => prev + 1);
    setOffset(next.initialOffset);
    setValue('');
    setAnswered(false);
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{ROUNDS.length}
        </span>
      </div>

      <div
        className="mb-4 flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Move className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Przeciągnij linijkę tak, aby kreska <strong>0</strong> trafiła dokładnie w punkt{' '}
          <strong>{round.labelA}</strong>. Dopiero wtedy odczyt przy punkcie{' '}
          <strong>{round.labelB}</strong> będzie prawdziwą długością.
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mx-auto h-auto w-full max-w-3xl touch-none select-none"
        role="img"
        aria-label={`Odcinek ${round.labelA}${round.labelB}, linijka przesunięta o ${offset} mm od punktu ${round.labelA}`}
      >
        {/* Odcinek — stały w świecie */}
        <line
          x1={PAD + round.segmentStart}
          y1={SEGMENT_Y}
          x2={PAD + round.segmentStart + round.length}
          y2={SEGMENT_Y}
          stroke={color}
          strokeWidth={3}
        />
        <circle cx={PAD + round.segmentStart} cy={SEGMENT_Y} r={4.5} fill={color} />
        <circle cx={PAD + round.segmentStart + round.length} cy={SEGMENT_Y} r={4.5} fill={color} />
        <text
          x={PAD + round.segmentStart}
          y={SEGMENT_Y - 10}
          textAnchor="middle"
          className="fill-foreground font-mono text-[8px] font-bold"
        >
          {round.labelA}
        </text>
        <text
          x={PAD + round.segmentStart + round.length}
          y={SEGMENT_Y - 10}
          textAnchor="middle"
          className="fill-foreground font-mono text-[8px] font-bold"
        >
          {round.labelB}
        </text>

        {/* Linijka — przesuwana grupa, ticki liczone raz w lokalnych współrzędnych 0..RULER_LEN_MM */}
        <g transform={`translate(${PAD + offset}, 0)`}>
          <rect
            x={-4}
            y={RULER_TICK_TOP - 10}
            width={RULER_LEN_MM + 8}
            height={34}
            rx={2}
            className="fill-amber-50 dark:fill-zinc-800"
            stroke={aligned ? '#16a34a' : 'currentColor'}
            strokeOpacity={aligned ? 1 : 0.25}
            strokeWidth={aligned ? 2 : 1}
          />
          {RULER_TICKS.map(({ mm, height: h }) => {
            const tickH = h === 'cm' ? 16 : h === 'five' ? 11 : 6;
            return (
              <g key={mm}>
                <line
                  x1={mm}
                  y1={RULER_TICK_TOP}
                  x2={mm}
                  y2={RULER_TICK_TOP + tickH}
                  stroke={mm === 0 ? (aligned ? '#16a34a' : color) : 'currentColor'}
                  strokeOpacity={mm === 0 ? 1 : h === 'cm' ? 0.75 : 0.4}
                  strokeWidth={mm === 0 ? 2.6 : h === 'cm' ? 1.4 : 1}
                />
                {h === 'cm' && (
                  <text
                    x={mm}
                    y={LABEL_Y}
                    textAnchor="middle"
                    className="fill-muted-foreground font-mono text-[6px]"
                  >
                    {mm / 10}
                  </text>
                )}
              </g>
            );
          })}
          {/* Uchwyt do przeciągania całej linijki */}
          <rect
            x={-4}
            y={RULER_TICK_TOP - 10}
            width={RULER_LEN_MM + 8}
            height={34}
            fill="transparent"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ cursor: aligned ? 'default' : 'grab', touchAction: 'none' }}
          />
        </g>

        {/* Prowadnice od środków A/B w dół do podziałki — rysowane NAD linijką (dalej w drzewie SVG),
            żeby było widać, na którą kreskę skali faktycznie trafiają, nie tylko "na oko". Wysokość
            liczona z lokalnej pozycji na przesuniętej linijce (mm − offset), więc linia kończy się
            dokładnie na końcu właściwej kreski (cm/5mm/1mm), a nie generycznie na wysokości kreski cm. */}
        <g pointerEvents="none">
          {[
            PAD + round.segmentStart,
            PAD + round.segmentStart + round.length,
          ].map((x, i) => {
            const worldMm = round.segmentStart + (i === 0 ? 0 : round.length);
            const localMm = Math.min(RULER_LEN_MM, Math.max(0, worldMm - offset));
            return (
              <line
                key={x}
                x1={x}
                y1={SEGMENT_Y + 5}
                x2={x}
                y2={RULER_TICK_TOP + tickHeightForMm(localMm)}
                stroke={aligned ? '#16a34a' : color}
                strokeOpacity={aligned ? 0.7 : 0.4}
                strokeDasharray="2 2"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </g>
      </svg>

      {!aligned && (
        <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">
          Zero linijki jest teraz {offset > round.segmentStart ? 'za daleko w prawo' : 'za daleko w lewo'}.
        </p>
      )}

      {aligned && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <p className="mb-3 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <Check className="mr-1 inline h-4 w-4" aria-hidden />
            Zero trafiło dokładnie w {round.labelA}. Teraz odczytaj, gdzie kończy się odcinek.
          </p>
          <form onSubmit={submitReading} className="flex flex-wrap items-center justify-center gap-2">
            <label htmlFor="ruler-lab-reading" className="text-sm font-semibold">
              Odcinek {round.labelA}
              {round.labelB} ma:
            </label>
            <Input
              id="ruler-lab-reading"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              disabled={answered}
              inputMode="numeric"
              autoComplete="off"
              placeholder="mm"
              className={cn(
                'w-24 font-mono text-base',
                answered && isCorrectValue && 'border-emerald-500',
                answered && !isCorrectValue && 'border-rose-400'
              )}
            />
            <span className="text-sm text-muted-foreground">mm</span>
            {!answered && (
              <Button type="submit" disabled={!value.trim()}>
                Sprawdź
              </Button>
            )}
            {answered && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-semibold',
                  isCorrectValue ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {isCorrectValue ? (
                  <>
                    <Check className="h-4 w-4" /> Dobrze!
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" /> Poprawnie: {round.length} mm
                  </>
                )}
              </span>
            )}
          </form>

          {answered && !isLastRound && (
            <div className="mt-4 flex justify-center">
              <Button onClick={nextRound}>Druga runda</Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

'use client';

import { useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Minus, MoveHorizontal, MoveRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GeoFigureMarks, VIEW_HEIGHT, VIEW_WIDTH } from './geo-figure';
import { clampToCanvas, type GeoPoint } from './geo-shape';
import {
  validateFigure,
  type DrawnFigure,
  type FigureTarget,
  type FigureType,
} from './construction-geometry';

export interface BoardPoint {
  label: string;
  x: number;
  y: number;
}

export interface ConstructionRound {
  id: string;
  instruction: string;
  points: BoardPoint[];
  target: FigureTarget;
}

const TOOLS: { type: FigureType; label: string; icon: typeof Minus }[] = [
  { type: 'odcinek', label: 'Odcinek', icon: Minus },
  { type: 'polprosta', label: 'Półprosta', icon: MoveRight },
  { type: 'prosta', label: 'Prosta', icon: MoveHorizontal },
];

/** Trzy prowadzone rundy: te same litery i punkty co dawny `WorkedExamples`. */
export const CONSTRUCTION_ROUNDS: ConstructionRound[] = [
  {
    id: 'odcinek-kl',
    instruction: 'Narysuj odcinek łączący punkty K i L.',
    points: [
      { label: 'K', x: 70, y: 150 },
      { label: 'L', x: 250, y: 60 },
    ],
    target: { type: 'odcinek', start: 'K', through: 'L' },
  },
  {
    id: 'polprosta-mn',
    instruction: 'Narysuj półprostą, która zaczyna się w punkcie M i przechodzi przez punkt N.',
    points: [
      { label: 'M', x: 230, y: 150 },
      { label: 'N', x: 90, y: 70 },
    ],
    target: { type: 'polprosta', start: 'M', through: 'N' },
  },
  {
    id: 'prosta-cd',
    instruction: 'Narysuj prostą przechodzącą przez punkty C i D.',
    points: [
      { label: 'C', x: 60, y: 80 },
      { label: 'D', x: 260, y: 140 },
    ],
    target: { type: 'prosta', start: 'C', through: 'D' },
  },
];

interface ConstructionBoardProps {
  color: string;
  rounds?: ConstructionRound[];
  onComplete?: () => void;
}

/**
 * Tablica konstrukcyjna: zamiast biernego "zgadnij nazwę → pokaż" (dawny
 * `WorkedExamples`), dziecko wybiera narzędzie (odcinek/półprosta/prosta) i
 * klika dwa punkty, żeby samemu *narysować* figurę. Rysunek — zarówno
 * narysowany, jak i podgląd pod kursorem — idzie przez `GeoFigureMarks`
 * (ten sam komponent co `GeoBuilder`/`ClassifyDrill`), więc cała matematyka
 * rysunkowa ma jedno źródło prawdy; nowa jest tylko warstwa interakcji i
 * walidacji z `construction-geometry.ts`.
 */
export function ConstructionBoard({ color, rounds = CONSTRUCTION_ROUNDS, onComplete }: ConstructionBoardProps) {
  const [index, setIndex] = useState(0);
  const [tool, setTool] = useState<FigureType>(rounds[0].target.type);
  const [picked, setPicked] = useState<string[]>([]);
  const [drawn, setDrawn] = useState<DrawnFigure | null>(null);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [message, setMessage] = useState('');
  const [cursor, setCursor] = useState<GeoPoint | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const round = rounds[index] ?? rounds[rounds.length - 1];
  const isLast = index === rounds.length - 1;
  const solved = status === 'correct';

  const pointsMap: Record<string, BoardPoint> = Object.fromEntries(
    round.points.map((p) => [p.label, p])
  );

  const handleMouseMove = (e: ReactMouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursor({
      x: ((e.clientX - rect.left) / rect.width) * VIEW_WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * VIEW_HEIGHT,
    });
  };

  const selectPoint = (label: string) => {
    if (solved) return;
    // Po błędnej próbie nowy klik punktu zaczyna rysowanie od nowa — nigdy hard lock.
    if (status === 'wrong') {
      setPicked([label]);
      setDrawn(null);
      setStatus('idle');
      setMessage('');
      return;
    }
    if (picked.includes(label)) return;
    const next = [...picked, label];
    setPicked(next);
    if (next.length === 2) {
      const figure: DrawnFigure = { type: tool, from: next[0], through: next[1] };
      setDrawn(figure);
      const result = validateFigure(round.target, figure);
      if (result.correct) {
        setStatus('correct');
        setMessage('Dobrze!');
      } else {
        setStatus('wrong');
        setMessage(result.message);
      }
    }
  };

  const clearBoard = () => {
    setPicked([]);
    setDrawn(null);
    setStatus('idle');
    setMessage('');
    setCursor(null);
  };

  const next = () => {
    if (!isLast) {
      const nextRound = rounds[index + 1];
      setTool(nextRound.target.type);
      setIndex((prev) => prev + 1);
      clearBoard();
      return;
    }
    onComplete?.();
  };

  // Podgląd: po kliknięciu pierwszego punktu, co powstanie po kliknięciu drugiego —
  // przyciąga się do najbliższego punktu na tablicy w promieniu ~30px.
  const previewPoint: GeoPoint | null = (() => {
    if (picked.length !== 1 || !cursor || solved) return null;
    const pickedPoint = pointsMap[picked[0]];
    if (Math.hypot(cursor.x - pickedPoint.x, cursor.y - pickedPoint.y) < 14) return null;
    const snapRadius = 30;
    let nearest: GeoPoint | null = null;
    let nearestDist = snapRadius * snapRadius;
    for (const p of round.points) {
      if (p.label === picked[0]) continue;
      const d = (p.x - cursor.x) ** 2 + (p.y - cursor.y) ** 2;
      if (d < nearestDist) {
        nearestDist = d;
        nearest = { x: p.x, y: p.y };
      }
    }
    return nearest ?? clampToCanvas(cursor, VIEW_WIDTH, VIEW_HEIGHT);
  })();

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {rounds.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{rounds.length}
        </span>
      </div>

      <p className="mb-4 text-base font-semibold leading-relaxed sm:text-lg">{round.instruction}</p>

      {/* Narzędzia */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          const active = tool === t.type;
          return (
            <button
              key={t.type}
              type="button"
              onClick={() => setTool(t.type)}
              disabled={solved}
              className={cn(
                'flex items-center gap-1.5 border px-3 py-1.5 text-sm font-semibold transition-all',
                !solved && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-sm'
              )}
              style={{
                borderColor: active ? color : `${color}45`,
                backgroundColor: active ? `${color}1f` : 'transparent',
                color: active ? color : undefined,
              }}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {t.label}
            </button>
          );
        })}
        {(picked.length > 0 || status === 'wrong') && !solved && (
          <button
            type="button"
            onClick={clearBoard}
            className="ml-auto flex items-center gap-1.5 border border-transparent px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Wyczyść
          </button>
        )}
      </div>

      {/* Tablica */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full border touch-none"
        style={{ backgroundColor: `${color}05` }}
        role="img"
        aria-label="Tablica konstrukcyjna z punktami do rysowania figur"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setCursor(null)}
      >
        {/* Podgląd za kursorem — co powstanie po kliknięciu drugiego punktu */}
        {picked.length === 1 && previewPoint && !solved && (
          <g opacity={0.4} pointerEvents="none" aria-hidden>
            <GeoFigureMarks
              color={color}
              kind={tool}
              pointA={pointsMap[picked[0]]}
              pointB={previewPoint}
              labelA=""
              labelB=""
              strokeWidth={3}
            />
          </g>
        )}

        {/* Narysowana figura */}
        {drawn && (
          <GeoFigureMarks
            color={solved ? color : '#dc2626'}
            kind={drawn.type}
            pointA={pointsMap[drawn.from]}
            pointB={pointsMap[drawn.through]}
            labelA=""
            labelB=""
            strokeWidth={4}
          />
        )}

        {/* Punkty */}
        {round.points.map((point) => {
          const isPicked = picked.includes(point.label);
          return (
            <g
              key={point.label}
              role="button"
              tabIndex={solved ? -1 : 0}
              aria-label={`Punkt ${point.label}`}
              onClick={() => selectPoint(point.label)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectPoint(point.label);
                }
              }}
              className={cn('cursor-pointer focus:outline-none', solved && 'pointer-events-none')}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={isPicked ? 9 : 7}
                fill={isPicked ? color : 'white'}
                stroke={color}
                strokeWidth={3}
              />
              <text x={point.x} y={point.y - 14} fontSize="16" fontWeight="700" textAnchor="middle" fill={color}>
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Komunikat */}
      {picked.length === 1 && !solved && (
        <p className="mt-3 text-sm text-muted-foreground">Kliknij teraz drugi punkt, aby zakończyć figurę.</p>
      )}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('mt-4 flex items-start gap-2 text-sm leading-relaxed sm:text-base', !solved && 'text-red-600')}
          style={solved ? { color } : undefined}
        >
          {solved && <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
          {message}
        </motion.p>
      )}

      {status === 'wrong' && (
        <p className="mt-2 text-sm text-muted-foreground">
          Kliknij punkty jeszcze raz — możesz zacząć od dowolnego z nich.
        </p>
      )}

      {solved && (
        <div className="mt-5 flex justify-end">
          <Button onClick={next} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Następne zadanie'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

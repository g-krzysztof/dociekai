'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Flag, RotateCcw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GRID_SIZE, cellKind, step, type GameGrid } from './game-content';

/**
 * Nagrodą za ułożenie planszy jest przejście przez NIĄ, nie ptaszek — ta sama
 * zasada co w `quiz-player.tsx`. Sterowanie działa z klawiatury (strzałki) i
 * dotykiem (przyciski pod planszą), żeby tester bez klawiatury też zagrał.
 */

interface GamePlayerProps {
  color: string;
  grid: GameGrid;
  onWon?: () => void;
}

const DIRECTIONS = [
  { id: 'up' as const, icon: ArrowUp, key: 'ArrowUp' },
  { id: 'left' as const, icon: ArrowLeft, key: 'ArrowLeft' },
  { id: 'down' as const, icon: ArrowDown, key: 'ArrowDown' },
  { id: 'right' as const, icon: ArrowRight, key: 'ArrowRight' },
];

export function GamePlayer({ color, grid, onWon }: GamePlayerProps) {
  const [position, setPosition] = useState(grid.start ?? 0);
  const [won, setWon] = useState(false);
  const reported = useRef(false);

  useEffect(() => {
    setPosition(grid.start ?? 0);
    setWon(false);
  }, [grid.start]);

  useEffect(() => {
    if (won && !reported.current) {
      reported.current = true;
      onWon?.();
    }
  }, [won, onWon]);

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (won) return;
    const next = step(position, direction);
    if (next === null) return;
    if (cellKind(grid, next) === 'obstacle') return;
    setPosition(next);
    if (next === grid.goal) setWon(true);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const found = DIRECTIONS.find((item) => item.key === event.key);
      if (!found) return;
      event.preventDefault();
      move(found.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, won, grid]);

  const restart = () => {
    setPosition(grid.start ?? 0);
    setWon(false);
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div
        className="mx-auto grid w-fit gap-1"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
          const kind = cellKind(grid, index);
          const here = position === index;
          return (
            <div
              key={index}
              className={cn('flex h-10 w-10 items-center justify-center border sm:h-12 sm:w-12')}
              style={
                kind === 'goal'
                  ? { backgroundColor: '#16a34a22', borderColor: '#16a34a' }
                  : kind === 'obstacle'
                    ? { backgroundColor: '#d4643a22', borderColor: '#d4643a' }
                    : undefined
              }
            >
              {here ? (
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} aria-hidden />
              ) : kind === 'goal' ? (
                <Flag className="h-4 w-4 text-[#16a34a]" aria-hidden />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid w-fit grid-cols-3 gap-1">
        <div />
        <ArrowButton icon={ArrowUp} color={color} label="Idź w górę" onClick={() => move('up')} />
        <div />
        <ArrowButton icon={ArrowLeft} color={color} label="Idź w lewo" onClick={() => move('left')} />
        <ArrowButton icon={ArrowDown} color={color} label="Idź w dół" onClick={() => move('down')} />
        <ArrowButton icon={ArrowRight} color={color} label="Idź w prawo" onClick={() => move('right')} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Steruj strzałkami na klawiaturze albo przyciskami wyżej.</p>

      {won && (
        <div className="mt-4 flex items-center gap-2.5 border-l-2 p-3" style={{ borderColor: color, backgroundColor: `${color}0f` }}>
          <Trophy className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />
          <p className="text-sm font-semibold" style={{ color }}>
            Meta!
          </p>
          <button
            type="button"
            onClick={restart}
            className="ml-auto inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/50"
            style={{ borderColor: color, color }}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Jeszcze raz
          </button>
        </div>
      )}
    </div>
  );
}

function ArrowButton({
  icon: Icon,
  color,
  label,
  onClick,
}: {
  icon: typeof ArrowUp;
  color: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center border transition-colors hover:bg-muted/50"
      style={{ borderColor: `${color}55`, color }}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}

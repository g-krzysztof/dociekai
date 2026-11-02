'use client';

import { useState } from 'react';
import { Flag, MapPin, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GRID_SIZE, cellKind, type GameGrid } from './game-content';

type Tool = 'start' | 'goal' | 'obstacle';

const TOOLS: { id: Tool; label: string; icon: typeof MapPin }[] = [
  { id: 'start', label: 'Start', icon: MapPin },
  { id: 'goal', label: 'Meta', icon: Flag },
  { id: 'obstacle', label: 'Przeszkoda', icon: X },
];

interface GameBuilderProps {
  color: string;
  grid: GameGrid;
  onChange: (grid: GameGrid) => void;
}

export function GameBuilder({ color, grid, onChange }: GameBuilderProps) {
  const [tool, setTool] = useState<Tool>('start');

  const click = (index: number) => {
    if (tool === 'start') {
      onChange({ ...grid, start: grid.start === index ? null : index });
      return;
    }
    if (tool === 'goal') {
      onChange({ ...grid, goal: grid.goal === index ? null : index });
      return;
    }
    if (grid.start === index || grid.goal === index) return;
    const obstacles = grid.obstacles.includes(index)
      ? grid.obstacles.filter((item) => item !== index)
      : [...grid.obstacles, index];
    onChange({ ...grid, obstacles });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTool(item.id)}
            className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm font-medium transition-colors"
            style={tool === item.id ? { backgroundColor: color, borderColor: color, color: 'white' } : undefined}
          >
            <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Wybierz narzędzie, potem stuknij w pole planszy. Jedno pole to jeden start i jedna meta —
        przeszkód może być więcej.
      </p>

      <div
        className="mx-auto mt-4 grid w-fit gap-1"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
          const kind = cellKind(grid, index);
          return (
            <button
              key={index}
              type="button"
              onClick={() => click(index)}
              aria-label={`Pole ${index + 1}`}
              className={cn(
                'flex h-10 w-10 items-center justify-center border text-xs font-semibold sm:h-12 sm:w-12',
                kind === 'empty' && 'hover:bg-muted/50'
              )}
              style={
                kind === 'start'
                  ? { backgroundColor: `${color}22`, borderColor: color, color }
                  : kind === 'goal'
                    ? { backgroundColor: '#16a34a22', borderColor: '#16a34a', color: '#16a34a' }
                    : kind === 'obstacle'
                      ? { backgroundColor: '#d4643a22', borderColor: '#d4643a', color: '#d4643a' }
                      : undefined
              }
            >
              {kind === 'start' && <MapPin className="h-4 w-4" aria-hidden />}
              {kind === 'goal' && <Flag className="h-4 w-4" aria-hidden />}
              {kind === 'obstacle' && <Square className="h-4 w-4" aria-hidden />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

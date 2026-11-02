'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrayGrid } from '../wlasnosci-dzialan/array-grid';
import { IsoCube } from '../../iso-cube';

const OPTIONS = [1, 2, 3, 4, 5];

interface SquareCubeBuilderProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: jeden suwak liczby `n` steruje jednocześnie płaskim
 * kwadratem (`ArrayGrid`, już istniejący prymityw) i przestrzennym
 * sześcianem (`IsoCube`, nowy) — pokazuje na żywo, że kwadrat to n × n
 * (dwa wymiary), a sześcian to n × n × n (trzy wymiary), tej samej liczby.
 */
export function SquareCubeBuilder({ color, onComplete }: SquareCubeBuilderProps) {
  const [n, setN] = useState(2);
  const [visited, setVisited] = useState<Set<number>>(new Set([2]));

  const pick = (value: number) => {
    setN(value);
    if (!visited.has(value)) {
      const updated = new Set(visited).add(value);
      setVisited(updated);
      if (updated.size >= 3) onComplete?.();
    }
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => pick(value)}
            className={cn(
              'w-11 border py-2 text-center font-mono text-lg font-bold tabular-nums transition-all hover:-translate-y-0.5 hover:shadow-md',
              n === value && 'text-white'
            )}
            style={n === value ? { backgroundColor: color, borderColor: color } : undefined}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Kwadrat</p>
          <ArrayGrid
            rows={n}
            cols={n}
            color={color}
            ariaLabel={`Kwadrat o boku ${n}, siatka ${n} na ${n}`}
            className="mx-auto h-auto w-full max-w-[180px]"
          />
          <p className="mt-3 font-mono text-xl font-black tabular-nums sm:text-2xl" style={{ color }}>
            {n} × {n} = {n * n}
          </p>
        </div>

        <div className="text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sześcian</p>
          <IsoCube
            dims={{ x: n, y: n, z: n }}
            maxDim={5}
            color={color}
            ariaLabel={`Sześcian o boku ${n}, złożony z ${n * n * n} małych kostek`}
          />
          <p className="mt-3 font-mono text-xl font-black tabular-nums sm:text-2xl" style={{ color }}>
            {n} × {n} × {n} = {n * n * n}
          </p>
        </div>
      </div>

      {visited.size < 3 && (
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Wypróbuj jeszcze {3 - visited.size} {3 - visited.size === 1 ? 'inną liczbę' : 'inne liczby'}, żeby
          zaliczyć ten krok.
        </p>
      )}
    </div>
  );
}

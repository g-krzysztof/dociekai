'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FactTriangle } from '../../fact-triangle';
import { GuideAct } from '../guide-act';
import { FACT_FAMILIES } from './guide-content';

type Vertex = 'a' | 'b' | 'c';

export function ActRodzinyLiczb({ color }: { color: string }) {
  const [familyKey, setFamilyKey] = useState<'addition' | 'multiplication'>('addition');
  const [highlight, setHighlight] = useState<Vertex | null>(null);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const family = FACT_FAMILIES.find((item) => item.key === familyKey)!;

  const chips: { vertex: Vertex; value: number; term: string }[] = [
    { vertex: 'a', value: family.a, term: family.aLabel },
    { vertex: 'b', value: family.b, term: family.bLabel },
    { vertex: 'c', value: family.c, term: family.cLabel },
  ];

  return (
    <GuideAct id="rodziny-liczb" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Rodziny liczb</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Trzy liczby z jednego działania są ze sobą powiązane — znasz dwie, trzecią masz za darmo.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {FACT_FAMILIES.map((item) => {
          const active = item.key === familyKey;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setFamilyKey(item.key);
                setHighlight(null);
              }}
              aria-pressed={active}
              className={cn(
                'cursor-pointer border px-4 py-2 text-sm font-semibold transition-all',
                !active && 'hover:-translate-y-0.5 hover:shadow-md'
              )}
              style={
                active
                  ? { borderColor: color, backgroundColor: `${color}14`, color }
                  : { borderColor: `${color}59`, color }
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[220px_1fr]">
        <FactTriangle
          a={family.a}
          b={family.b}
          c={family.c}
          color={color}
          highlight={highlight}
          ariaLabel={`Trójkąt faktów: ${family.a}, ${family.b} i ${family.c}`}
        />

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip.vertex}
                type="button"
                onClick={() => setHighlight(chip.vertex)}
                aria-pressed={highlight === chip.vertex}
                className={cn(
                  'flex cursor-pointer items-center gap-2 border px-3 py-1.5 font-mono text-sm font-bold transition-all',
                  highlight !== chip.vertex && 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={
                  highlight === chip.vertex
                    ? { borderColor: color, backgroundColor: `${color}14`, color }
                    : { borderColor: `${color}40`, color }
                }
              >
                {chip.value}
                <span className="text-xs font-semibold uppercase tracking-wide">{chip.term}</span>
              </button>
            ))}
          </div>
          <p className="text-sm leading-relaxed sm:text-base">{family.sentence}</p>
        </div>
      </div>

      <p className="mt-4 text-xs" style={{ color: textColor }}>
        Kliknij liczbę obok trójkąta, żeby zobaczyć, który wierzchołek to ona.
      </p>
    </GuideAct>
  );
}

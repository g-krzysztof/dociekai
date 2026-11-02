'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { WedgeShape } from '../od-pisma-do-alfabetu/tabliczka-widget';

/**
 * Przypominajka L19 (z L18, dystans 1): tabliczka z liczbą zapisaną klinami
 * (2 kliny kątowe = 20, 4 pionowe = 4). Dziecko ustawia licznik i sprawdza.
 * Most do tematu: w Egipcie pisarze też liczyli worki zboża.
 */
const VALUE = 24;
const WEDGES = [
  { kind: 'katowy' as const, x: 60, y: 60 },
  { kind: 'katowy' as const, x: 88, y: 60 },
  { kind: 'pionowy' as const, x: 128, y: 40 },
  { kind: 'pionowy' as const, x: 148, y: 40 },
  { kind: 'pionowy' as const, x: 168, y: 40 },
  { kind: 'pionowy' as const, x: 188, y: 40 },
];

export function KlinyPrzypominajka({ color }: { color: string }) {
  const [n, setN] = useState(10);
  const [state, setState] = useState<'idle' | 'miss' | 'ok'>('idle');

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Pisarz z Ur odcisnął na tabliczce, ile worków jęczmienia przyjął. Ile to?
      </p>
      <svg viewBox="0 0 240 110" className="w-full max-w-[240px] border bg-[#d9c3a0]" role="img" aria-label="Tabliczka z liczbą zapisaną pismem klinowym">
        {WEDGES.map((w, i) => (
          <WedgeShape key={i} w={w} />
        ))}
      </svg>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-label="mniej" disabled={state === 'ok'} onClick={() => setN((v) => Math.max(0, v - 1))} className="border p-2">
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center font-mono text-lg tabular-nums">{n}</span>
        <button type="button" aria-label="więcej" disabled={state === 'ok'} onClick={() => setN((v) => Math.min(99, v + 1))} className="border p-2">
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={state === 'ok'}
          onClick={() => setState(n === VALUE ? 'ok' : 'miss')}
          className="ml-2 border-2 px-3 py-2 text-sm font-semibold"
          style={{ borderColor: color }}
        >
          Sprawdź
        </button>
      </div>
      {state === 'miss' && (
        <p className="text-sm text-destructive">
          {n === 6 ? 'Każdy klin liczy się inaczej — kątowy to dziesięć.' : 'Jeszcze nie. Klin pionowy to 1, kątowy to 10.'}
        </p>
      )}
      {state === 'ok' && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Tak, 24 worki. W Egipcie pisarze też liczyli worki zboża — tylko że ich rok zależał od jednej rzeki. Dziś
          zobaczysz, jak bardzo.
        </p>
      )}
    </div>
  );
}

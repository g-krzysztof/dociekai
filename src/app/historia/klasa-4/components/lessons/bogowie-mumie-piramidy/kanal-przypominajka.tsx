'use client';

import { useState } from 'react';

/**
 * Przypominajka L20 (z L17, dystans 3): który z trzech kanałów doprowadzi
 * wodę z rzeki do pola? Liczby to wysokości terenu; woda płynie tylko
 * w dół. Most do tematu: kamień też sam nie pojedzie pod górę.
 */
const CANALS = [
  { id: 'a', heights: [5, 4, 5, 3], label: 'A' },
  { id: 'b', heights: [5, 4, 3, 2], label: 'B' },
  { id: 'c', heights: [5, 6, 4, 2], label: 'C' },
];
const GOOD = 'b';

export function KanalPrzypominajka({ color }: { color: string }) {
  const [pick, setPick] = useState<string | null>(null);
  const ok = pick === GOOD;
  const picked = CANALS.find((c) => c.id === pick);
  const blockAt = picked ? picked.heights.findIndex((h, i) => i > 0 && h > picked.heights[i - 1]) : -1;

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Rzeka jest po lewej, pole po prawej. Liczby to wysokości terenu. <strong>Którym kanałem woda dopłynie do pola?</strong>
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {CANALS.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={ok}
            onClick={() => setPick(c.id)}
            className="border-2 p-2 text-left"
            style={{ borderColor: pick === c.id ? color : undefined }}
          >
            <span className="mb-1 block text-xs font-semibold">Kanał {c.label}</span>
            <span className="flex items-center gap-1 font-mono text-sm">
              <span className="text-[10px]">rzeka</span>
              {c.heights.map((h, i) => (
                <span key={i} className="flex h-7 w-7 items-center justify-center border bg-[#e9dcc0] dark:bg-zinc-800">
                  {h}
                </span>
              ))}
              <span className="text-[10px]">pole</span>
            </span>
          </button>
        ))}
      </div>
      {picked && !ok && (
        <p className="text-sm text-destructive">
          Woda staje na {blockAt + 1}. kratce: z wysokości {picked.heights[blockAt - 1]} nie wejdzie na {picked.heights[blockAt]}.
        </p>
      )}
      {ok && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Tak — w kanale B teren cały czas opada. Woda nie popłynie pod górę. Kamienny blok też sam nie pojedzie — dziś będziesz go
          wciągać.
        </p>
      )}
    </div>
  );
}

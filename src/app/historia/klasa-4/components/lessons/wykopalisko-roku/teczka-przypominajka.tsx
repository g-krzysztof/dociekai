'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Przypominajka L32 (z L31, dystans 1): które zdanie to fakt (da się
 * sprawdzić), a które czyjeś zdanie — tak jak zakreślacz w teczce postaci.
 */
const SENTENCES = [
  { id: 'a', text: 'Perykles zmarł w 429 r. p.n.e. podczas zarazy w Atenach.', fakt: true },
  { id: 'b', text: 'Kleopatra była najmądrzejszą królową w dziejach.', fakt: false },
  { id: 'c', text: 'Konstantyn przeniósł stolicę nad cieśninę Bosfor.', fakt: true },
];

export function TeczkaPrzypominajka({ color }: { color: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  const s = SENTENCES.find((x) => x.id === picked);
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        W teczce postaci zakreślałeś/łaś fakty i oceny. <strong>Które z tych zdań to czyjeś zdanie, a nie fakt?</strong>
      </p>
      <div className="space-y-1.5">
        {SENTENCES.map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={picked === x.id}
            onClick={() => setPicked(x.id)}
            className={cn('block w-full border-2 bg-white px-3 py-1.5 text-left text-sm dark:bg-zinc-900', picked === x.id && 'font-semibold')}
            style={picked === x.id ? { borderColor: x.fakt ? 'var(--destructive)' : color } : undefined}
          >
            {x.text}
          </button>
        ))}
      </div>
      {s?.fakt && <p className="text-sm text-destructive">To da się sprawdzić w źródłach: kto, co, kiedy. Szukaj zdania, w którym ktoś ocenia.</p>}
      {s && !s.fakt && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Tak — „najmądrzejsza” to ocena. Dziś też będziesz czytać ślady — warstwa po warstwie.
        </p>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Przypominajka L21 (z L18, dystans 3): Fenicjanin pisał same spółgłoski.
 * Dziecko stuka litery, których by nie zapisał — samogłoski gasną.
 * Most do tematu: Egipcjanie też pisali szkielet ze spółgłosek.
 */
const WORD = 'PAPIRUS';
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

export function SpolgloskiPrzypominajka({ color }: { color: string }) {
  const [off, setOff] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);
  const need = [...WORD].map((l, i) => (VOWELS.has(l) ? i : -1)).filter((i) => i >= 0);
  const ok = need.every((i) => off.has(i));

  const tap = (i: number) => {
    if (ok) return;
    if (!VOWELS.has(WORD[i])) {
      setWrong(i);
      return;
    }
    setWrong(null);
    setOff((prev) => new Set(prev).add(i));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Fenicjanin zapisywał tylko spółgłoski. <strong>Stuknij litery, których by nie napisał.</strong>
      </p>
      <div className="flex gap-1">
        {[...WORD].map((l, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tap(i)}
            className={cn(
              'flex h-10 w-9 items-center justify-center border font-mono text-lg font-bold transition-opacity',
              off.has(i) && 'opacity-20 line-through',
              wrong === i && 'border-destructive text-destructive',
            )}
          >
            {l}
          </button>
        ))}
      </div>
      {wrong !== null && !ok && (
        <p className="text-sm text-destructive">{WORD[wrong]} to spółgłoska — tę Fenicjanin by zapisał.</p>
      )}
      {ok && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Zostało P P R S. Egipcjanie też pisali samymi spółgłoskami — a jednak dziś potrafimy czytać ich pismo. Zobaczysz, jak to odkryto.
        </p>
      )}
    </div>
  );
}

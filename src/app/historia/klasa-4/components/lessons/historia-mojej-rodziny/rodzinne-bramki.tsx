'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MINI_CATEGORY_LABEL, MINI_ITEMS, judgeMiniGate, type MiniGate } from './przypominajka-l5';

const GATE_QUESTION: Record<MiniGate, string> = {
  touch: 'Da się tego dotknąć?',
  writing: 'Jest na tym pismo?',
};

/**
 * Przypominajka L5 — trzy pamiątki z rodzinnego kufra przez dwie bramki
 * z L2 (dystans 3). Poza postępem (slot `entry` w powłoce lekcji).
 */
export function RodzinneBramki({ color }: { color: string }) {
  const [index, setIndex] = useState(0);
  const [gate, setGate] = useState<MiniGate>('touch');
  const [hint, setHint] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const item = MINI_ITEMS[index];
  const finished = results.length === MINI_ITEMS.length;

  const answer = (value: boolean) => {
    if (!item) return;
    if (!judgeMiniGate(item, gate, value)) {
      setHint(gate === 'touch' ? item.hintTouch : item.hintWriting);
      return;
    }
    setHint(null);
    if (gate === 'touch' && item.touch) {
      setGate('writing');
      return;
    }
    setResults((prev) => [...prev, `${item.name} → ${MINI_CATEGORY_LABEL[item.category]}`]);
    setIndex((i) => i + 1);
    setGate('touch');
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        W drugiej lekcji przepuszczałeś/łaś przedmioty przez dwie bramki. Szybko — jeszcze trzy pamiątki z rodzinnego
        kufra, wszystkie przydadzą się dziś.
      </p>
      {results.length > 0 && (
        <ul className="space-y-1 text-sm">
          {results.map((r) => (
            <li key={r} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> {r}
            </li>
          ))}
        </ul>
      )}
      {!finished && item && (
        <div className="space-y-2 border p-3">
          <p className="text-sm font-semibold">{item.name}</p>
          <p className="text-sm">
            Bramka {gate === 'touch' ? '1' : '2'}: <strong>{GATE_QUESTION[gate]}</strong>
          </p>
          <div className="flex gap-2">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => answer(v)}
                className={cn('min-w-[4.5rem] border px-3 py-1.5 text-sm font-semibold bg-white hover:bg-muted dark:bg-zinc-900')}
              >
                {v ? 'Tak' : 'Nie'}
              </button>
            ))}
          </div>
          {hint && (
            <p className="text-sm font-medium text-destructive" aria-live="polite">
              {hint}
            </p>
          )}
        </div>
      )}
      {finished && (
        <p className="text-sm font-semibold leading-relaxed" style={{ color }}>
          Dziś zajrzymy do rodzinnego kufra — pamiątki opowiedzą nam historię naszej rodziny.
        </p>
      )}
    </div>
  );
}

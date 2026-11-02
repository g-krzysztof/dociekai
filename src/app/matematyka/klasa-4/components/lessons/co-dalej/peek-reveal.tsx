'use client';

import { useState, type ReactNode } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

/**
 * Karta zapowiedzi tematu klasy 5 (kroki „ułamki" / „liczby ujemne" /
 * „prędkość"). Dwustopniowo, jak `LessonRewardCard`: najpierw „co już umiesz",
 * potem klik odsłania „co nowego", a drugi klik („Rozumiem") potwierdza i
 * kończy krok. To zapowiedź — nie ma tu odpowiedzi do sprawdzenia.
 */
interface PeekRevealProps {
  color: string;
  title: string;
  known: ReactNode;
  whatsNew: ReactNode;
  onSeen: () => void;
}

export function PeekReveal({ color, title, known, whatsNew, onSeen }: PeekRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [ack, setAck] = useState(false);
  const textColor = `color-mix(in oklch, ${color} 82%, black)`;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p
        className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em]"
        style={{ color: textColor }}
      >
        Klasa 5
      </p>
      <h3 className="mb-4 text-lg font-bold sm:text-xl">{title}</h3>

      <div className="mb-4 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
        <span className="font-semibold">Co już umiesz z klasy 4:</span> {known}
      </div>

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          style={{ backgroundColor: color }}
        >
          Zobacz, co z tego wyrasta
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <div className="border-t-2 p-4" style={{ borderColor: color, backgroundColor: `${color}0c` }}>
          <p
            className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
            style={{ color: textColor }}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Co nowego w klasie 5
          </p>
          <div className="text-sm leading-relaxed">{whatsNew}</div>

          {!ack ? (
            <button
              type="button"
              onClick={() => {
                setAck(true);
                onSeen();
              }}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
              style={{ borderColor: color, color: textColor }}
            >
              Rozumiem — to zobaczę w klasie 5
            </button>
          ) : (
            <p
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: textColor }}
            >
              <Check className="h-4 w-4" aria-hidden /> Zanotowane
            </p>
          )}
        </div>
      )}
    </div>
  );
}

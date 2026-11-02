'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ERAS, type Era } from '../../../lib/timeline/scale';
import { formatYear } from './wieki';

/** Trzy karty z tej lekcji, zanim padnie słowo „wiek”. */
const CARDS = [
  { id: 'grunwald', year: 1410, event: 'Grunwald' },
  { id: 'termopile', year: -480, event: 'Termopile' },
  { id: 'kopernik', year: 1543, event: 'książka Kopernika' },
];

/** Epoka roku — z tych samych granic co Oś dziejów (`ERAS`), bez prehistorii. */
function eraOf(year: number): Era {
  return [...ERAS].reverse().find((era) => era.from === null || year >= era.from)!;
}

const SHOWN = ERAS.filter((era) => era.from !== null);

/**
 * Przypominajka L7 (z L6, dystans 1): stuknij kartę, potem epokę, do której
 * należy — granice z osi z poprzedniej lekcji. Poza postępem (slot `entry`).
 */
export function KartyWEpokach({ color }: { color: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, Era['id']>>({});
  const [miss, setMiss] = useState<string | null>(null);
  const finished = CARDS.every((c) => placed[c.id]);

  const drop = (era: Era) => {
    const card = CARDS.find((c) => c.id === picked);
    if (!card) return;
    const right = eraOf(card.year);
    if (right.id !== era.id) {
      setMiss(`${card.event} (${formatYear(card.year)}) nie mieści się w epoce „${era.label}” — sprawdź jej granice.`);
      return;
    }
    setMiss(null);
    setPlaced((p) => ({ ...p, [card.id]: era.id }));
    setPicked(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Pamiętasz granice epok? Stuknij kartę, a potem epokę, do której należy.
      </p>
      <div className="flex flex-wrap gap-2">
        {CARDS.filter((c) => !placed[c.id]).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setPicked(c.id)}
            className={cn('border px-3 py-1.5 text-sm', picked === c.id && 'font-semibold')}
            style={picked === c.id ? { borderColor: color } : undefined}
          >
            {c.event} <span className="font-mono text-xs tabular-nums text-muted-foreground">{formatYear(c.year)}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {SHOWN.map((era, i) => (
          <button
            key={era.id}
            type="button"
            onClick={() => drop(era)}
            disabled={!picked}
            className="flex min-h-[3.5rem] flex-col border p-2 text-left disabled:cursor-default"
            style={{ background: era.color }}
          >
            <span className="text-sm font-medium">{era.label}</span>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              od {era.from! < 0 ? 'ok. ' : ''}{formatYear(era.from!)}
              {SHOWN[i + 1] ? ` do ${formatYear(SHOWN[i + 1].from!)}` : ''}
            </span>
            <span className="text-xs font-semibold">
              {CARDS.filter((c) => placed[c.id] === era.id)
                .map((c) => c.event)
                .join(', ')}
            </span>
          </button>
        ))}
      </div>
      {miss && (
        <p className="text-sm text-destructive" aria-live="polite">
          {miss}
        </p>
      )}
      {finished && (
        <p className="text-sm" aria-live="polite">
          Epoki są długie — setki i tysiące lat. Dziś podzielisz czas na krótsze, równe kawałki: <strong>wieki</strong>.
        </p>
      )}
    </div>
  );
}

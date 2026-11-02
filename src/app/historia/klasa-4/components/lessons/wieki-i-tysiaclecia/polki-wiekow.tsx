'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toRoman } from '../../../lib/timeline/dating';
import { timelineNow } from '../../../lib/timeline/use-timeline-pins';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { coveredPrefix, hiddenDigits, judgeShelf, shelfCardsCE, shelvesCE, type Verdict } from './wieki';

/**
 * Blok 2 — **Półki wieków** (`cwiczenie`).
 *
 * Gest nowy w kursie: **zasłania palcem dwie ostatnie cyfry roku** —
 * przeciąga kciuk na koniec karty — i dopiero wtedy karta da się odłożyć na
 * półkę z cyfrą rzymską. Reguła „+1, chyba że pod palcem 00” wychodzi z ruchu:
 * odrzucenie mówi, ile zostało pod palcem i na którym sznurze leży koralik.
 * Pułapki z karty: 1900, 1901, 2000, 100.
 */
export function PolkiWiekow({ color, onComplete }: { color: string; onComplete: () => void }) {
  const now = timelineNow();
  const cards = useMemo(() => shelfCardsCE(now), [now]);
  const shelves = useMemo(() => shelvesCE(now), [now]);
  const [index, setIndex] = useState(0);
  const [covered, setCovered] = useState(false);
  const [shelved, setShelved] = useState<Record<number, number[]>>({});
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [armed, setArmed] = useState<'karta' | null>(null);
  const reported = useRef(false);

  const card = cards[index];
  const finished = index >= cards.length;

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [finished, onComplete]);

  const cover = () => {
    setCovered(true);
    setArmed(null);
  };

  const shelve = (shelf: number) => {
    if (!card || !covered) return;
    const v = judgeShelf(card.year, shelf);
    setVerdict(v);
    setArmed(null);
    if (!v.ok) return;
    setShelved((s) => ({ ...s, [shelf]: [...(s[shelf] ?? []), card.year] }));
    setCovered(false);
    setIndex((i) => i + 1);
  };

  const { bind, drag, hover } = useDragToken({
    disabled: finished,
    onDrop: (id, target) => {
      if (id === 'kciuk' && target === 'cyfry') cover();
      if (id === 'karta' && target?.startsWith('polka-')) shelve(Number(target.slice(6)));
    },
    // Stuknięcie kciuka kładzie go od razu na cyfrach — jest tylko jedno miejsce, gdzie może trafić.
    onTap: (id) => (id === 'kciuk' ? cover() : setArmed((a) => (a === 'karta' ? null : 'karta'))),
  });

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Na każdej karcie jest rok. <strong>Przeciągnij kciuk na dwie ostatnie cyfry</strong>, a potem odłóż kartę na
        półkę jej wieku. Pamiętaj o koralikach: wiek kończy się na roku z dwoma zerami.
      </p>

      {!finished && card && (
        <div className="flex flex-wrap items-center gap-3">
          <div
            {...(covered ? bind('karta') : {})}
            className={cn(
              'flex min-w-[11rem] select-none flex-col border-2 bg-background px-4 py-2',
              covered ? 'cursor-grab touch-none' : '',
              armed === 'karta' && 'bg-muted'
            )}
            style={{ borderColor: color }}
            role={covered ? 'button' : undefined}
            tabIndex={covered ? 0 : undefined}
            aria-label={covered ? `Karta ${card.year} — przeciągnij na półkę` : undefined}
          >
            <span className="flex items-baseline font-mono text-3xl font-bold tabular-nums">
              <span>{coveredPrefix(card.year) || ''}</span>
              <span
                data-drop="cyfry"
                className={cn(
                  'relative ml-0.5 inline-flex min-w-[2.6ch] justify-center',
                  !covered && 'border-b-2 border-dashed',
                  hover === 'cyfry' && 'bg-muted'
                )}
                style={!covered ? { borderColor: color } : undefined}
              >
                {covered ? (
                  <Hand className="h-8 w-8 -rotate-12" style={{ color }} aria-label="zasłonięte kciukiem" />
                ) : (
                  hiddenDigits(card.year)
                )}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">{card.event}</span>
          </div>

          {!covered && (
            <button
              type="button"
              {...bind('kciuk')}
              className="flex touch-none select-none items-center gap-2 border-2 px-3 py-2 text-sm font-semibold"
              style={{ borderColor: color }}
            >
              <Hand className="h-5 w-5" aria-hidden /> kciuk
            </button>
          )}

          {covered && (
            <p className="text-sm" aria-live="polite">
              Pod palcem: <strong className="font-mono">{hiddenDigits(card.year)}</strong>. Zostało:{' '}
              <strong className="font-mono">{coveredPrefix(card.year)}</strong>.
            </p>
          )}
        </div>
      )}

      <DragGhost drag={drag}>
        {drag?.id === 'kciuk' ? (
          <Hand className="h-8 w-8" style={{ color }} />
        ) : card ? (
          <span className="border-2 bg-background px-3 py-1 font-mono text-lg font-bold" style={{ borderColor: color }}>
            {coveredPrefix(card.year)}✋
          </span>
        ) : null}
      </DragGhost>

      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
        {shelves.map((s) => (
          <button
            key={s}
            type="button"
            data-drop={`polka-${s}`}
            onClick={() => armed === 'karta' && shelve(s)}
            className={cn('flex min-h-[5.5rem] flex-col border-b-4 bg-muted/30 p-1.5 text-left', hover === `polka-${s}` && 'bg-muted')}
            style={{ borderBottomColor: color }}
            aria-label={`Półka ${toRoman(s)} wiek`}
          >
            <span className="font-serif text-lg font-bold leading-none" style={{ color }}>
              {toRoman(s)}
            </span>
            <span className="text-[10px] text-muted-foreground">wiek</span>
            <span className="mt-auto flex flex-wrap gap-0.5">
              {(shelved[s] ?? []).map((y) => (
                <span key={y} className="border bg-background px-1 font-mono text-[10px] tabular-nums">
                  {y}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>

      {verdict && !finished && (
        <p className={cn('text-sm leading-relaxed', !verdict.ok && 'text-destructive')} aria-live="polite">
          {verdict.ok ? <strong className="text-success">{verdict.message}</strong> : verdict.message}
        </p>
      )}

      {!finished && (
        <p className="text-xs text-muted-foreground">
          Karta {index + 1} z {cards.length}
        </p>
      )}

      {finished && (
        <div className="border bg-muted/30 p-4 text-sm leading-relaxed">
          <p className="font-semibold">Reguła, którą masz już w palcu:</p>
          <p className="mt-1">
            Zasłoń dwie ostatnie cyfry. <strong>Pod palcem dwa zera</strong> — wiek to liczba, która została (1900 →
            XIX). <strong>Pod palcem coś innego</strong> — dodaj jeden (1901 → XX, 1410 → XV). A rok 100 to wciąż I wiek:
            setny koralik zamyka pierwszy sznur.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import {
  CHANGE_REASONS,
  erasWithEnd,
  judgeReason,
  MEDIEVAL_ENDS,
  REASON_ORDER,
  type ChangeKind,
  type ReasonVerdict,
} from './epoki';

const FLAG_ID = 'flaga-konca';

/**
 * Blok 4 — **„Kiedy skończyło się średniowiecze?”** (`refleksja`).
 *
 * Gest nowy w kursie: **wbija flagę „koniec średniowiecza”** w jedną z czterech
 * kandydatur (przeciągnięcie albo stuknij flagę → stuknij kartę), a potem
 * **dokańcza zdanie „bo najważniejsza zmiana dotyczy…”**. Nie ma złej granicy;
 * jest tylko obowiązek podania, dlaczego — powód musi pasować do tego, co
 * zmieniło wybrane wydarzenie (napisane na jego karcie, więc to czytanie,
 * a nie zgadywanie klucza autora). Nagroda: długości epok liczone od granicy
 * dziecka i to, że historycy też wybierają różnie.
 */
export function KoniecSredniowiecza({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [flagSelected, setFlagSelected] = useState(false);
  const [reason, setReason] = useState<ChangeKind | null>(null);
  const [verdict, setVerdict] = useState<ReasonVerdict | null>(null);
  const reported = useRef(false);

  const accepted = verdict?.ok === true;
  const candidate = MEDIEVAL_ENDS.find((m) => m.id === chosen);

  useEffect(() => {
    if (accepted && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [accepted, onComplete]);

  const plant = (id: string | null) => {
    if (!id || !MEDIEVAL_ENDS.some((m) => m.id === id)) return;
    setChosen(id);
    setFlagSelected(false);
    setVerdict(null);
    setReason(null);
  };

  const { drag, hover, bind } = useDragToken({
    disabled: accepted,
    onDrop: (_id, target) => plant(target),
    onTap: () => setFlagSelected((s) => !s),
  });

  const pickReason = (kind: ChangeKind) => {
    if (!chosen || accepted) return;
    setReason(kind);
    setVerdict(judgeReason(chosen, kind));
  };

  const lengths = candidate ? erasWithEnd(candidate.year) : null;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Granica średniowiecza i nowożytności to nie kreska, którą ktoś narysował na niebie. Historycy proponują różne
        wydarzenia — w podręcznikach znajdziesz co najmniej cztery. Wbij flagę w to, które <strong>ty</strong> uważasz
        za koniec średniowiecza.
      </p>

      {!accepted && (
        <button
          type="button"
          {...bind(FLAG_ID)}
          aria-pressed={flagSelected}
          aria-label="Flaga: koniec średniowiecza. Przeciągnij na kartę albo stuknij, potem stuknij kartę."
          className={cn(
            'inline-flex touch-none items-center gap-2 border-2 bg-background px-3 py-2 text-sm font-semibold',
            accepted ? 'cursor-default' : 'cursor-grab',
            flagSelected && 'ring-2 ring-offset-2',
            drag && 'opacity-40'
          )}
          style={{ borderColor: color, color, ['--tw-ring-color' as string]: color }}
        >
          <Flag className="h-4 w-4" aria-hidden /> koniec średniowiecza
        </button>
      )}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {MEDIEVAL_ENDS.map((m) => {
          const isChosen = chosen === m.id;
          return (
            <div
              key={m.id}
              data-drop={m.id}
              role="button"
              tabIndex={accepted ? -1 : 0}
              aria-label={`${m.when}, ${m.label}: ${m.what}`}
              onClick={() => (flagSelected || chosen) && !accepted && plant(m.id)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !accepted) {
                  e.preventDefault();
                  plant(m.id);
                }
              }}
              className={cn(
                'relative flex flex-col gap-1 border p-2.5 text-left text-xs leading-snug transition-colors sm:text-sm',
                hover === m.id && 'bg-muted',
                isChosen ? 'border-2' : flagSelected && 'border-dashed',
                !accepted && 'cursor-pointer'
              )}
              style={isChosen ? { borderColor: color } : undefined}
            >
              <span className="font-mono text-xs font-bold tabular-nums" style={{ color }}>
                {m.when}
              </span>
              <span className="font-semibold">{m.label}</span>
              <span className="text-muted-foreground">{m.what}</span>
              {isChosen && (
                <Flag className="absolute right-2 top-2 h-4 w-4" style={{ color }} aria-label="tu stoi twoja flaga" />
              )}
            </div>
          );
        })}
      </div>

      {candidate && (
        <div className="space-y-2 border p-3">
          <p className="text-sm">
            Średniowiecze skończyło się w <strong>{candidate.when}</strong> ({candidate.label}), bo najważniejsza zmiana
            dotyczy tego…
          </p>
          <div className="flex flex-wrap gap-2">
            {REASON_ORDER.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => pickReason(kind)}
                disabled={accepted}
                className={cn(
                  'border px-2.5 py-1.5 text-left text-sm',
                  reason === kind && verdict && (verdict.ok ? 'border-success bg-success/10 font-semibold' : 'border-destructive bg-destructive/5')
                )}
              >
                {CHANGE_REASONS[kind]}
              </button>
            ))}
          </div>
          {verdict && !verdict.ok && (
            <p className="text-sm text-destructive" aria-live="polite">
              Przeczytaj kartę jeszcze raz: wydarzenie „{verdict.candidate.label}” zmieniło przede wszystkim to,{' '}
              {CHANGE_REASONS[verdict.candidate.changed]}, a nie to, {CHANGE_REASONS[verdict.chosen]}. Zmień powód — albo
              przenieś flagę na wydarzenie, które pasuje do twojego powodu.
            </p>
          )}
        </div>
      )}

      {accepted && candidate && lengths && (
        <div className="space-y-2 bg-muted/30 p-4 text-sm leading-relaxed" aria-live="polite">
          <p>
            <strong className="text-success">Masz granicę i masz powód — tak pracuje historyk.</strong> Przy twojej granicy
            średniowiecze trwa {lengths.sredniowiecze} {plural(lengths.sredniowiecze, { one: 'rok', few: 'lata', many: 'lat' })}, a
            nowożytność {lengths.nowozytnosc} {plural(lengths.nowozytnosc, { one: 'rok', few: 'lata', many: 'lat' })}.
          </p>
          <p>
            W polskich podręcznikach najczęściej spotkasz rok 1492 — i tej granicy używamy na naszej osi. Ale w innych
            książkach przeczytasz o 1453 roku, a niektórzy historycy w ogóle nie podają jednej daty i mówią o „przełomie
            XV i XVI wieku”. Żadne z nich się nie myli: każde wybrało inną zmianę jako najważniejszą — tak jak ty.
          </p>
        </div>
      )}

      <DragGhost drag={drag}>
        <span className="inline-flex items-center gap-2 border-2 bg-background px-3 py-2 text-sm font-semibold" style={{ borderColor: color, color }}>
          <Flag className="h-4 w-4" aria-hidden /> koniec średniowiecza
        </span>
      </DragGhost>
    </div>
  );
}

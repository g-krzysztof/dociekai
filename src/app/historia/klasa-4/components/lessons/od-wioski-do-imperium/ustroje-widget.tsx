'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { REGIMES, startTrip, step, type NodeId, type RegimeId, type Trip } from './ustroje';

/**
 * Blok 2 — **Kto decyduje?** Gest: dziecko prowadzi żeton „Wojna?” przez
 * schemat władzy (przeciąga na instytucję albo stuk-stuk) — w królestwie,
 * w republice i w cesarstwie. Każda instytucja mówi, co może; zły krok
 * odbija żeton z powodem. W republice pierwsze głosowanie kończy się „nie”.
 */
export function UstrojeWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [current, setCurrent] = useState(0);
  const [trips, setTrips] = useState<Record<RegimeId, Trip>>({ krolestwo: startTrip(), republika: startTrip(), cesarstwo: startTrip() });
  const [say, setSay] = useState<{ ok: boolean; text: string } | null>(null);
  const [selected, setSelected] = useState(false);
  const reported = useRef(false);

  const regime = REGIMES[current];
  const trip = trips[regime.id];
  const allDone = REGIMES.every((r) => trips[r.id].decided);

  useEffect(() => {
    if (allDone && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [allDone, onDone]);

  const move = (target: string | null) => {
    if (!target?.startsWith('ustroj-')) return;
    setSelected(false);
    const r = step(regime.id, trip, target.slice(7) as NodeId);
    setSay({ ok: r.ok, text: r.say });
    if (r.ok) setTrips((t) => ({ ...t, [regime.id]: r.trip }));
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (_id, target) => move(target),
    onTap: () => setSelected((s) => !s),
    disabled: trip.decided,
  });

  const at = trip.path[trip.path.length - 1];
  const name = (id: NodeId) => regime.nodes.find((n) => n.id === id)?.name ?? id;

  const token = (
    <button
      type="button"
      {...bind('wojna')}
      aria-pressed={selected}
      disabled={trip.decided}
      className={cn('flex touch-none select-none items-center gap-1.5 border-2 bg-white px-3 py-1.5 text-sm font-bold dark:bg-zinc-900', drag && 'opacity-40')}
      style={{ borderColor: color, boxShadow: selected ? `0 0 0 2px ${color}` : undefined }}
    >
      <Swords className="h-4 w-4" aria-hidden /> Wojna?
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Ustrój">
        {REGIMES.map((r, i) => {
          const unlocked = i === 0 || trips[REGIMES[i - 1].id].decided;
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={i === current}
              disabled={!unlocked}
              onClick={() => {
                setCurrent(i);
                setSay(null);
              }}
              className={cn('border-2 px-3 py-1.5 text-left text-sm disabled:opacity-40', i === current && 'font-semibold')}
              style={{ borderColor: i === current ? color : 'var(--border)' }}
            >
              {r.name} {trips[r.id].decided && '✓'}
              <span className="block text-[11px] font-normal text-muted-foreground">{r.when}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border bg-muted/30 p-3">
        {!trip.decided ? token : <span className="text-sm font-semibold" style={{ color }}>Decyzja zapadła.</span>}
        <span className="text-xs text-muted-foreground">
          {trip.decided ? '' : selected ? 'Stuknij instytucję.' : 'Przeciągnij żeton na tego, kto ma się zająć sprawą.'}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {regime.nodes.map((n) => {
          const isHover = hover === `ustroj-${n.id}`;
          const here = at === n.id;
          return (
            <div
              key={n.id}
              data-drop={`ustroj-${n.id}`}
              role="button"
              tabIndex={0}
              onClick={() => selected && move(`ustroj-${n.id}`)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !trip.decided) move(`ustroj-${n.id}`);
              }}
              className={cn('border-2 bg-white p-3 text-sm leading-snug transition-colors dark:bg-zinc-900/70', (isHover || selected) && 'bg-muted')}
              style={{ borderColor: here || isHover ? color : 'var(--border)' }}
            >
              <p className="font-semibold">{n.name}</p>
              <p className="mt-1 text-muted-foreground">{n.role}</p>
              {here && (
                <motion.p layoutId="ustroj-here" className="mt-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
                  ● żeton jest tutaj
                </motion.p>
              )}
            </div>
          );
        })}
      </div>

      {trip.path.length > 0 && (
        <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          Droga sprawy:
          {trip.path.map((id, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ArrowRight className="h-3 w-3" aria-hidden />}
              <span className="font-semibold text-foreground">{name(id)}</span>
            </span>
          ))}
        </p>
      )}

      <div aria-live="polite" className="min-h-[2.5rem] text-sm leading-relaxed">
        {say && <p className={say.ok ? '' : 'text-destructive'}>{say.text}</p>}
        {trip.decided && current < REGIMES.length - 1 && (
          <button
            type="button"
            onClick={() => {
              setCurrent(current + 1);
              setSay(null);
            }}
            className="mt-2 border-2 px-3 py-1.5 text-sm font-semibold"
            style={{ borderColor: color, color }}
          >
            Dalej: {REGIMES[current + 1].name.toLowerCase()} →
          </button>
        )}
      </div>

      {allDone && (
        <div className="space-y-2 border-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p>
            <strong>Ta sama sprawa, trzy drogi:</strong>{' '}
            {REGIMES.map((r, i) => {
              const n = trips[r.id].path.length;
              return (
                <span key={r.id}>
                  {r.name.toLowerCase()} — {n} {plural(n, { one: 'krok', few: 'kroki', many: 'kroków' })}
                  {i < REGIMES.length - 1 ? ', ' : '.'}
                </span>
              );
            })}
          </p>
          <p>
            <strong>Republika</strong> (łac. <em>res publica</em> — „sprawa publiczna”) dzieliła władzę między wielu ludzi:
            senat radził, konsulowie, wybierani tylko na rok, wnosili sprawy i dowodzili, a obywatele głosowali. Taka
            sprawa może utknąć — w 200 roku p.n.e. zgromadzenie naprawdę najpierw odrzuciło wojnę z Macedonią. W 27 roku
            p.n.e. Oktawian August został pierwszym <strong>cesarzem</strong>: senat obradował dalej, ale decydował jeden
            człowiek.
          </p>
        </div>
      )}

      <DragGhost drag={drag}>{drag ? token : null}</DragGhost>
    </div>
  );
}

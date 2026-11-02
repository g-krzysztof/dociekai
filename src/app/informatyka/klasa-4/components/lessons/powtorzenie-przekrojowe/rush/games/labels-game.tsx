'use client';

import { useState } from 'react';
import { Cat, Dog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pick, type GameProps } from '../types';
import { useDragChips } from '../drag';

/**
 * Dział 7 — **ZŁA ETYKIETA!** Maszyna uczy się z tego, co leży w tacach, więc
 * jeden źle podpisany przykład uczy ją źle. Dziecko ma znaleźć go i **przenieść
 * do właściwej tacy** — poprawia dane, nie model. Przeniesienie poprawnej
 * karty tylko tworzy nowy błąd, więc kończy grę.
 */

type Tray = 'koty' | 'psy';

interface Card {
  id: string;
  kind: Tray;
}

const VARIANTS: { koty: Card[]; psy: Card[]; wrong: string }[] = [
  {
    koty: [
      { id: 'k1', kind: 'koty' },
      { id: 'k2', kind: 'koty' },
      { id: 'x', kind: 'psy' },
      { id: 'k3', kind: 'koty' },
    ],
    psy: [
      { id: 'p1', kind: 'psy' },
      { id: 'p2', kind: 'psy' },
      { id: 'p3', kind: 'psy' },
      { id: 'p4', kind: 'psy' },
    ],
    wrong: 'x',
  },
  {
    koty: [
      { id: 'k1', kind: 'koty' },
      { id: 'k2', kind: 'koty' },
      { id: 'k3', kind: 'koty' },
      { id: 'k4', kind: 'koty' },
    ],
    psy: [
      { id: 'p1', kind: 'psy' },
      { id: 'x', kind: 'koty' },
      { id: 'p2', kind: 'psy' },
      { id: 'p3', kind: 'psy' },
    ],
    wrong: 'x',
  },
];

export function LabelsGame({ finish, seed }: GameProps) {
  const variant = pick(VARIANTS, seed);
  const [trays] = useState<Record<Tray, Card[]>>({ koty: variant.koty, psy: variant.psy });
  const { dragging, bind } = useDragChips({
    onDrop: (id, zone) => {
      if (!zone) return;
      const from: Tray = trays.koty.some((card) => card.id === id) ? 'koty' : 'psy';
      if (zone === from) return;
      finish(id === variant.wrong);
    },
  });

  const renderTray = (tray: Tray, title: string) => (
    <div
      data-zone={tray}
      className="flex min-h-[9.5rem] flex-1 flex-col border-2 border-dashed bg-muted/30 p-2"
    >
      <p className="pointer-events-none mb-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Taca: {title}
      </p>
      <div className="pointer-events-none grid flex-1 grid-cols-2 place-items-center gap-2">
        {trays[tray].map((card) => {
          const Icon = card.kind === 'koty' ? Cat : Dog;
          return (
            <div
              key={card.id}
              {...bind(card.id)}
              className={cn(
                'pointer-events-auto grid h-14 w-14 select-none place-items-center border-2 bg-white shadow-sm dark:bg-zinc-800',
                card.kind === 'koty' ? 'text-orange-500' : 'text-sky-600',
                dragging === card.id && 'shadow-lg'
              )}
              aria-label={card.kind === 'koty' ? 'Rysunek kota' : 'Rysunek psa'}
            >
              <Icon className="h-8 w-8" aria-hidden />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="flex gap-2">
        {renderTray('koty', 'KOTY')}
        {renderTray('psy', 'PSY')}
      </div>
      <p className="border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-2 text-sm leading-snug">
        Maszyna: „Uczę się dokładnie z tego, co leży w tacach. Co jest w tacy KOTY, to dla mnie kot.”
      </p>
    </div>
  );
}

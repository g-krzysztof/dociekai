'use client';

import { useState } from 'react';
import { ERAS, type Era } from '../../../lib/timeline/scale';

/**
 * Przypominajka L14 (z L6, dystans 8): trzy chwile z życia legendy o smoku —
 * dziecko stuka epokę każdej z nich na pasku epok z L6. Karty idą po kolei.
 * Daty: Kadłubek ok. 1200 (pierwsza spisana wersja), kronika Bielskiego 1597
 * (szewc Skuba), pomnik smoka Bronisława Chromego pod Wawelem 1972
 * (Wikipedia „Smok wawelski”).
 */
const CARDS = [
  { id: 'kadlubek', year: 1200, text: 'Kronikarz spisuje legendę o smoku', when: 'ok. 1200' },
  { id: 'bielski', year: 1597, text: 'W kronice pojawia się szewc Skuba', when: '1597' },
  { id: 'pomnik', year: 1972, text: 'Pod Wawelem staje pomnik smoka', when: '1972' },
];

const SHOWN = ERAS.filter((e) => e.from !== null && e.from > 0);

function eraOf(year: number): Era {
  return [...ERAS].reverse().find((e) => e.from === null || year >= e.from)!;
}

export function SmokWEpokach({ color }: { color: string }) {
  const [i, setI] = useState(0);
  const [miss, setMiss] = useState<string | null>(null);
  const card = CARDS[i];
  const done = i >= CARDS.length;

  const tap = (era: Era) => {
    if (!card) return;
    const right = eraOf(card.year);
    if (right.id !== era.id) {
      setMiss(`${card.when} nie mieści się w epoce „${era.label}” — ${era.label} zaczyna się w ${era.from} roku.`);
      return;
    }
    setMiss(null);
    setI(i + 1);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">Legenda o smoku żyje bardzo długo. W której epoce zdarzyła się każda z tych chwil? Stuknij epokę.</p>
      <div className="min-h-[2.5rem] border-l-2 pl-3 text-sm" style={{ borderColor: color }} aria-live="polite">
        {done ? (
          <span>Trzy epoki, jedna legenda — i ciągle się zmienia. Dziś zobaczysz, jak.</span>
        ) : (
          <>
            <span className="font-semibold">{card.text}</span>{' '}
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{card.when}</span>
          </>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {SHOWN.map((era, k) => (
          <button
            key={era.id}
            type="button"
            disabled={done}
            onClick={() => tap(era)}
            className="flex min-h-[3.25rem] flex-col border p-2 text-left disabled:cursor-default"
            style={{ background: era.color }}
          >
            <span className="text-sm font-medium">{era.label}</span>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              od {era.from}
              {SHOWN[k + 1] ? ` do ${SHOWN[k + 1].from}` : ''}
            </span>
            <span className="text-[11px] font-semibold">
              {CARDS.slice(0, i)
                .filter((c) => eraOf(c.year).id === era.id)
                .map((c) => c.when)
                .join(', ')}
            </span>
          </button>
        ))}
      </div>
      {miss && <p className="text-sm text-destructive">{miss}</p>}
    </div>
  );
}

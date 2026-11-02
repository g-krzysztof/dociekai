'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { driftHours } from './obliczanie';

/**
 * D — **29 lutego** (poza postępem). Suwak lat i przełącznik „co cztery lata
 * 29 lutego”: bez niego kalendarz ucieka Słońcu o 6 godzin rocznie bez końca,
 * z nim dryf rośnie trzy lata i wraca do zera — przestaje dryfować.
 */
export function DwudziestyDziewiaty({ color }: { color: string }) {
  const [years, setYears] = useState(0);
  const [leap, setLeap] = useState(false);
  const hours = driftHours(years, leap);
  const width = Math.min(100, (hours / 72) * 100);

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p>
        Rok Słońca trwa ok. <strong>365 dni i 6 godzin</strong>, a w kalendarzu jest 365 dni. Co roku kalendarz zostaje o
        6 godzin z tyłu. Przesuń lata i patrz na pasek spóźnienia.
      </p>
      <label className="block">
        Mija lat: <strong className="font-mono tabular-nums">{years}</strong>
        <input type="range" min={0} max={12} value={years} onChange={(e) => setYears(Number(e.target.value))} className="mt-1 w-full" style={{ accentColor: color }} />
      </label>
      <div className="h-6 border bg-muted/30">
        <div className="h-full transition-[width] duration-200" style={{ width: `${width}%`, background: color }} />
      </div>
      <p aria-live="polite">
        Kalendarz spóźnia się o <strong className="tabular-nums">{hours}</strong>{' '}
        {plural(hours, { one: 'godzinę', few: 'godziny', many: 'godzin' })}
        {hours >= 24 ? ` — to już ${Math.floor(hours / 24)} ${plural(Math.floor(hours / 24), { one: 'dzień', few: 'dni', many: 'dni' })}` : ''}.
      </p>
      <button
        type="button"
        role="switch"
        aria-checked={leap}
        onClick={() => setLeap((l) => !l)}
        className={cn('flex items-center gap-3 border-2 px-3 py-2 font-semibold')}
        style={{ borderColor: color }}
      >
        <span className="inline-block h-5 w-9 border p-0.5">
          <span className={cn('block h-full w-1/2 transition-transform', leap && 'translate-x-full')} style={{ background: color }} />
        </span>
        Co cztery lata dodaj 29 lutego
      </button>
      {leap && <p>Cztery razy po 6 godzin to 24 godziny — cały dzień. Dodatkowy 29 lutego go oddaje i pasek wraca do zera.</p>}
    </div>
  );
}

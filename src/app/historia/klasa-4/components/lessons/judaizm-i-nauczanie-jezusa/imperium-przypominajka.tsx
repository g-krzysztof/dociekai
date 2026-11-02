'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { countryClass } from '../od-wioski-do-imperium/imperium';

/**
 * Przypominajka L29 (z L26, dystans 3): które dzisiejsze państwa leżały całe
 * w imperium z 117 r. — sędzią jest udział liczony z mapy L26 (`countryClass`).
 * Most do bloku 1: dzisiejszy Izrael to dawna Palestyna pod władzą Rzymu.
 */
const OPTIONS = [
  { id: 'POL', label: 'Polska' },
  { id: 'ISR', label: 'Izrael' },
  { id: 'ITA', label: 'Włochy' },
  { id: 'IRL', label: 'Irlandia' },
  { id: 'LBN', label: 'Liban' },
];
const GOAL = OPTIONS.filter((o) => countryClass(o.id) === 'cale').map((o) => o.id);

export function ImperiumPrzypominajka({ color }: { color: string }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const wrong = picked.filter((id) => !GOAL.includes(id));
  const missing = GOAL.filter((id) => !picked.includes(id));
  const ok = checked && wrong.length === 0 && missing.length === 0;

  const toggle = (id: string) => {
    setChecked(false);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Trzy lekcje temu stukałeś/łaś dzisiejsze państwa na mapie imperium z 117 roku.{' '}
        <strong>Które z tych państw leżały w imperium całe?</strong> Stuknij wszystkie i sprawdź.
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={picked.includes(o.id)}
            onClick={() => toggle(o.id)}
            className={cn('border-2 bg-white px-3 py-1.5 text-sm dark:bg-zinc-900', picked.includes(o.id) && 'font-semibold')}
            style={picked.includes(o.id) ? { borderColor: checked && wrong.includes(o.id) ? 'var(--destructive)' : color } : undefined}
          >
            {o.label}
          </button>
        ))}
      </div>
      {!ok && (
        <button type="button" onClick={() => setChecked(true)} className="border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
          Sprawdź
        </button>
      )}
      {checked && !ok && (
        <p className="text-sm text-destructive">
          {wrong.length > 0
            ? 'Czerwona ramka: to państwo leżało poza imperium albo tylko częściowo w nim.'
            : 'Brakuje jeszcze jednego państwa — imperium sięgało daleko na wschód Morza Śródziemnego.'}
        </p>
      )}
      {ok && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Tak — Włochy, Liban i Izrael. Na ziemiach dzisiejszego Izraela leżała w starożytności Palestyna. Właśnie tam dzieje
          się ta lekcja.
        </p>
      )}
    </div>
  );
}

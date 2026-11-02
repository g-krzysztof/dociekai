'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Przypominajka L26 (z L23, dystans 3): kto w Atenach głosował nad wojną
 * i flotą — most do bloku „Kto decyduje?”.
 */
const OPTIONS = [
  { id: 'wszyscy', label: 'wszyscy mieszkańcy', why: 'Nie wszyscy — kobiety, niewolnicy i przybysze nie głosowali. Pamiętasz sito?' },
  { id: 'obywatele', label: 'dorośli mężczyźni-obywatele', why: '' },
  { id: 'krol', label: 'król', why: 'Ateny nie miały króla — to była demokracja.' },
];

export function AtenyPrzypominajka({ color }: { color: string }) {
  const [pick, setPick] = useState<string | null>(null);
  const opt = OPTIONS.find((o) => o.id === pick);
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Trzy lekcje temu byłeś/łaś na wzgórzu Pnyks. <strong>Kto w Atenach głosował o wojnie i flocie?</strong>
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setPick(o.id)}
            className={cn('border-2 bg-white px-3 py-1.5 text-sm dark:bg-zinc-900', pick === o.id && 'font-semibold')}
            style={pick === o.id ? { borderColor: o.id === 'obywatele' ? color : 'var(--destructive)' } : undefined}
          >
            {o.label}
          </button>
        ))}
      </div>
      {opt && opt.id !== 'obywatele' && <p className="text-sm text-destructive">{opt.why}</p>}
      {opt?.id === 'obywatele' && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Tak — zgromadzenie obywateli. W tym samym czasie, po drugiej stronie morza, rosło miasto, które wymyśliło
          własny sposób rządzenia. Zobaczysz, czym różnił się od ateńskiego.
        </p>
      )}
    </div>
  );
}

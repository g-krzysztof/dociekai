'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Przypominajka L27 (z L26, dystans 1): w jakim ustroju żył Cezar w 46 r. p.n.e.?
 * Republika trwała od 509 do 27 p.n.e. — dziecko wnioskuje z dat.
 */
const OPTIONS = [
  { id: 'krolestwo', label: 'królestwo (do 509 p.n.e.)', why: 'Ostatniego króla Rzymianie wygnali ponad czterysta lat przed Cezarem.' },
  { id: 'republika', label: 'republika (509–27 p.n.e.)', why: '' },
  { id: 'cesarstwo', label: 'cesarstwo (od 27 p.n.e.)', why: 'Pierwszym cesarzem był August — w 27 roku p.n.e., kilkanaście lat po Cezarze.' },
];

export function UstrojPrzypominajka({ color }: { color: string }) {
  const [pick, setPick] = useState<string | null>(null);
  const opt = OPTIONS.find((o) => o.id === pick);
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        W ostatniej lekcji prowadziłeś/łaś wojnę przez trzy ustroje. <strong>Dziś jest rok 46 p.n.e. W jakim ustroju żyje
        Rzym?</strong>
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setPick(o.id)}
            className={cn('border-2 bg-white px-3 py-1.5 text-sm dark:bg-zinc-900', pick === o.id && 'font-semibold')}
            style={pick === o.id ? { borderColor: o.id === 'republika' ? color : 'var(--destructive)' } : undefined}
          >
            {o.label}
          </button>
        ))}
      </div>
      {opt && opt.id !== 'republika' && <p className="text-sm text-destructive">{opt.why}</p>}
      {opt?.id === 'republika' && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Republika — jeszcze. Juliusz Cezar właśnie wrócił ze zwycięskich wojen i świętuje triumf. Wielu się boi, że chce
          rządzić sam.
        </p>
      )}
    </div>
  );
}

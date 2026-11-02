'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Przypominajka L24 (z L21, dystans 3): słowo „papier” przyszło znad Nilu.
 * Most do bloku 3 — słowa, które żyją dłużej niż ludzie, którzy je wymyślili.
 */
const PLANTS = [
  { id: 'len', label: 'len', why: 'Z lnu tkano w Egipcie płótno — także to do owijania mumii. Pisano na czymś innym.' },
  { id: 'papirus', label: 'papirus', why: '' },
  { id: 'palma', label: 'palma daktylowa', why: 'Palma dawała daktyle i liście na kosze, ale nie kartki.' },
];

export function PapierPrzypominajka({ color }: { color: string }) {
  const [pick, setPick] = useState<string | null>(null);
  const plant = PLANTS.find((p) => p.id === pick);
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Trzy lekcje temu robiłeś/łaś kartkę jak Egipcjanin. <strong>Od jakiej rośliny pochodzi słowo „papier”?</strong>
      </p>
      <div className="flex flex-wrap gap-2">
        {PLANTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPick(p.id)}
            className={cn('border-2 bg-white px-3 py-1.5 text-sm dark:bg-zinc-900', pick === p.id && 'font-semibold')}
            style={pick === p.id ? { borderColor: p.id === 'papirus' ? color : 'var(--destructive)' } : undefined}
          >
            {p.label}
          </button>
        ))}
      </div>
      {plant && plant.id !== 'papirus' && <p className="text-sm text-destructive">{plant.why}</p>}
      {plant?.id === 'papirus' && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Papirus — trzcina znad Nilu. Egipcjan dawno nie ma, a ich słowo nosisz w plecaku. Dziś zobaczysz, że Grecy
          zostawili nam w mowie całe opowieści.
        </p>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { KazimierzMap, MapLegend } from '../mapa-i-plan/mapa-kazimierza';
import { judgeTap, type MapTap } from '../mapa-i-plan/kazimierz';

/**
 * Przypominajka L12 (z L9, dystans 3): na mapie Kazimierza Wielkiego stuknij
 * miejsce koronacji — odpowiedź czyta się z legendy. Most do trzech stolic
 * w bloku `regiony`. Poza postępem.
 */
export function KoronaZLegendy({ color }: { color: string }) {
  const [note, setNote] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [hit, setHit] = useState<string | null>(null);

  const onTap = (tap: MapTap) => {
    if (ok) return;
    const v = judgeTap('koronacja', tap);
    setNote(v.note);
    setOk(v.ok);
    setHit(v.hit ?? null);
  };

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p>
        Pamiętasz mapę z legendą? Stuknij miasto, w którym koronowano Kazimierza Wielkiego. Podpowiedź
        jest w legendzie, nie w twojej pamięci.
      </p>
      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <KazimierzMap onTap={onTap} hits={hit ? new Set([hit]) : undefined} showTitle={false} />
        <MapLegend compact />
      </div>
      {note && (
        <p className={`flex items-start gap-2 border-l-4 pl-3 ${ok ? '' : 'border-amber-500'}`} style={ok ? { borderColor: color } : undefined}>
          {ok && <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />}
          <span>
            {note}
            {ok && ' Kraków był wtedy stolicą — ale nie pierwszą i nie ostatnią. Dziś przewieziesz koronę przez wszystkie trzy.'}
          </span>
        </p>
      )}
    </div>
  );
}

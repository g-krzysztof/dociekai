'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AtrybutGlyph } from '../bogowie-i-mity/atrybut';
import type { AttributeId } from '../bogowie-i-mity/olimp';

/**
 * Przypominajka L25 (z L24, dystans 1): igrzyska w Olimpii odbywały się ku
 * czci Zeusa (F-IV.4-06). Dziecko stuka atrybut boga — z drzewa Olimpu.
 */
const OPTIONS: { id: AttributeId; label: string; why: string }[] = [
  { id: 'trojzab', label: 'trójząb', why: 'Trójząb to znak Posejdona, władcy morza. Olimpia leży w głębi lądu.' },
  { id: 'piorun', label: 'piorun', why: '' },
  { id: 'sowa', label: 'sowa', why: 'Sowa to znak Ateny — jej święto, z zawodami, miały Ateny. Olimpia czciła kogoś ważniejszego.' },
];

export function ZeusPrzypominajka({ color }: { color: string }) {
  const [pick, setPick] = useState<AttributeId | null>(null);
  const option = OPTIONS.find((o) => o.id === pick);
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        W ostatniej lekcji sadzałeś/łaś bogów na drzewie Olimpu. Igrzyska w Olimpii były świętem ku czci najważniejszego
        z nich. <strong>Stuknij jego znak.</strong>
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setPick(o.id)}
            className={cn('flex items-center gap-1.5 border-2 bg-white px-3 py-1.5 text-sm dark:bg-zinc-900', pick === o.id && 'font-semibold')}
            style={pick === o.id ? { borderColor: o.id === 'piorun' ? color : 'var(--destructive)' } : undefined}
          >
            <AtrybutGlyph id={o.id} className="h-4 w-4" />
            {o.label}
          </button>
        ))}
      </div>
      {option && option.id !== 'piorun' && <p className="text-sm text-destructive">{option.why}</p>}
      {option?.id === 'piorun' && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Zeus. W Olimpii stała jego świątynia z ogromnym posągiem — jednym z siedmiu cudów świata. Co cztery lata
          zjeżdżali tu Grecy ze wszystkich polis.
        </p>
      )}
    </div>
  );
}

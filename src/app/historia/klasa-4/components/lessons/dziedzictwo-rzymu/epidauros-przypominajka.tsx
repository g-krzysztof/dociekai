'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Przypominajka L28 (z L25, dystans 3): dlaczego w Epidauros słychać było
 * aktora w ostatnim rzędzie — budowla pracuje dzięki kształtowi, nie maszynie.
 * Most do akweduktu: woda płynie, bo trasa ma właściwy kształt.
 */
const OPTIONS = [
  { id: 'trabka', label: 'aktorzy mieli metalowe trąbki do mówienia', why: 'Nie — aktor mówił własnym głosem, bez żadnych urządzeń.' },
  { id: 'zbocze', label: 'widownia stała stromo na zboczu', why: '' },
  { id: 'cisza', label: 'widzowie musieli siedzieć w zupełnej ciszy', why: 'Cisza pomaga, ale w ostatnim rzędzie na płaskim polu i tak nie słychać prawie nic — pamiętasz 3%?' },
];

export function EpidaurosPrzypominajka({ color }: { color: string }) {
  const [pick, setPick] = useState<string | null>(null);
  const opt = OPTIONS.find((o) => o.id === pick);
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Trzy lekcje temu siedziałeś/łaś w ostatnim rzędzie teatru w Epidauros. <strong>Dlaczego słychać tam było aktora?</strong>
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setPick(o.id)}
            className={cn('border-2 bg-white px-3 py-1.5 text-left text-sm dark:bg-zinc-900', pick === o.id && 'font-semibold')}
            style={pick === o.id ? { borderColor: o.id === 'zbocze' ? color : 'var(--destructive)' } : undefined}
          >
            {o.label}
          </button>
        ))}
      </div>
      {opt && opt.id !== 'zbocze' && <p className="text-sm text-destructive">{opt.why}</p>}
      {opt?.id === 'zbocze' && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Tak — teatr działał dzięki kształtowi. Rzymianie poszli dalej: ich budowle działały tak dobrze, że niektóre
          służą do dziś.
        </p>
      )}
    </div>
  );
}

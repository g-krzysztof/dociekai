'use client';

import { useState } from 'react';

/**
 * Przypominajka L18 (z L15, dystans 3): dziecko stuka kontynenty w kolejności,
 * w jakiej docierali do nich ludzie wędrujący z Afryki (daty z L15: Azja
 * 60 tys., Australia 50 tys., Europa 45 tys., Ameryka 15 tys. lat temu).
 * Most do tematu: przez te dziesiątki tysięcy lat nikt niczego nie zapisał.
 */
const ORDER = [
  { id: 'azja', label: 'Azja', ago: 60 },
  { id: 'australia', label: 'Australia', ago: 50 },
  { id: 'europa', label: 'Europa', ago: 45 },
  { id: 'ameryka', label: 'Ameryka', ago: 15 },
];
const SHOWN = ['europa', 'ameryka', 'azja', 'australia'];

export function KontynentyKolejno({ color }: { color: string }) {
  const [done, setDone] = useState<string[]>([]);
  const [miss, setMiss] = useState(false);
  const all = done.length === ORDER.length;

  const tap = (id: string) => {
    if (done.includes(id) || all) return;
    if (ORDER[done.length].id !== id) {
      setMiss(true);
      return;
    }
    setMiss(false);
    setDone([...done, id]);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Pamiętasz wędrówkę ludzi z Afryki? Stuknij kontynenty w kolejności, w jakiej ludzie do nich docierali.
      </p>
      <div className="flex flex-wrap gap-2">
        {SHOWN.map((id) => {
          const c = ORDER.find((o) => o.id === id)!;
          const k = done.indexOf(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => tap(id)}
              disabled={k >= 0}
              className="flex items-center gap-2 border px-3 py-1.5 text-sm disabled:cursor-default"
              style={k >= 0 ? { borderColor: color } : undefined}
            >
              {k >= 0 && (
                <span className="font-mono font-bold" style={{ color }}>
                  {k + 1}
                </span>
              )}
              {c.label}
              {k >= 0 && <span className="text-xs text-muted-foreground">{c.ago} tys. lat temu</span>}
            </button>
          );
        })}
      </div>
      {miss && <p className="text-sm text-destructive">Jeszcze nie ten — ludzie szli dalej od najbliższego lądu.</p>}
      {all && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Wiemy to z kości, narzędzi i malowideł — ale nikt z tych wędrowców niczego nie zapisał. Przez
          dziesiątki tysięcy lat wszystko, co ludzie wiedzieli, mieściło się w ich głowach. Dziś zobaczysz,
          co się zmieniło, kiedy zaczęli pisać.
        </p>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';

/**
 * Przypominajka L17 (z L16, dystans 1): cztery kroki od pola do miasta —
 * dziecko stuka je w kolejności, w jakiej jeden wynika z drugiego
 * (każdy wymaga poprzedniego: bez siewu nie ma nadwyżki, bez nadwyżki
 * nikt nie może przestać zdobywać jedzenia).
 */
const STEPS = [
  { id: 'siew', text: 'Ludzie sieją zboże i zostają przy polu.' },
  { id: 'nadwyzka', text: 'W spichlerzu zostaje więcej ziarna, niż zjedzą.' },
  { id: 'garncarz', text: 'Garncarz nie musi zdobywać jedzenia.' },
  { id: 'miasto', text: 'Wioska rośnie i staje się miastem.' },
];
const SHOWN = ['garncarz', 'miasto', 'siew', 'nadwyzka'];

export function OdPolaDoMiasta({ color }: { color: string }) {
  const [order, setOrder] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);
  const done = order.length === STEPS.length;

  const tap = (id: string) => {
    if (order.includes(id) || done) return;
    const expected = STEPS[order.length];
    if (expected.id !== id) {
      setMiss(`To jeszcze nie teraz — najpierw musi się wydarzyć coś, bez czego to by nie było możliwe.`);
      return;
    }
    setMiss(null);
    setOrder([...order, id]);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">Stuknij te zdania po kolei: od tego, co było pierwsze, do tego, co z niego wynikło.</p>
      <ul className="space-y-1.5">
        {SHOWN.map((id) => {
          const s = STEPS.find((x) => x.id === id)!;
          const k = order.indexOf(id);
          return (
            <li key={id}>
              <button type="button" onClick={() => tap(id)} disabled={k >= 0} className="flex w-full items-center gap-2 border px-2 py-1.5 text-left text-sm disabled:cursor-default" style={k >= 0 ? { borderColor: color } : undefined}>
                <span className="w-5 font-mono font-bold tabular-nums" style={{ color }}>
                  {k >= 0 ? k + 1 : ''}
                </span>
                {s.text}
              </button>
            </li>
          );
        })}
      </ul>
      {miss && <p className="text-sm text-destructive">{miss}</p>}
      {done && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Tak to szło w Żyznym Półksiężycu. Dziś zobaczysz, jak wyglądały pierwsze miasta — i kto nimi rządził.
        </p>
      )}
    </div>
  );
}

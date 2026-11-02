'use client';

import { useState } from 'react';
import { BookMarked, Check, Zap } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { PASKI, odloz, przykladZPolki, zwrotKursu, type Dziennik, type Polka } from './zwroty';

/**
 * L12 blok 2 — „Dwie półki” `[3.7]` `[3.10]`. Dziecko odkłada zwinięte paski
 * na półkę „wytrzymało” albo „pękło” według **własnego dziennika** z bloku 1:
 * werdykt porównuje z zapisaną próbą, nie z naszą listą, a pasek bez próby
 * nie da się odłożyć. Po zapełnieniu obu półek pada termin „związek
 * frazeologiczny”, wyjaśniony na pierwszym zwrocie z półki dziecka.
 */

export interface StanPolek {
  polozone: Record<string, Polka>;
  kolejnosc: string[];
}

interface Props {
  color: string;
  dziennik: Dziennik;
  initial?: StanPolek | null;
  onState?: (s: StanPolek) => void;
  onComplete: () => void;
}

const POLKI: { id: Polka; label: string }[] = [
  { id: 'wytrzymalo', label: 'wytrzymało' },
  { id: 'peklo', label: 'pękło' },
];

export function DwiePolki({ color, dziennik, initial, onState, onComplete }: Props) {
  const [stan, setStan] = useState<StanPolek>(() => initial ?? { polozone: {}, kolejnosc: [] });
  const [wybrany, setWybrany] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const gotowe = stan.kolejnosc.length === PASKI.length;

  const poloz = (id: string, polka: Polka) => {
    if (stan.polozone[id]) return;
    const p = PASKI.find((x) => x.id === id)!;
    const o = odloz(id, polka, dziennik);
    setWybrany(null);
    if (!o.ok) {
      if (o.powod === 'brak-proby') setMsg(`„${p.zwrot}” — tego paska jeszcze nie sprawdzono. Najpierw go wytnij i wklej słowo (blok wyżej).`);
      else
        setMsg(
          `Zajrzyj do dziennika: „${p.zwrot}” po wymianie „${p.slowo}” na „${o.proba.wklejone}” ${o.proba.wynik === 'peklo' ? 'pękło' : 'wytrzymało'}. Ten pasek leży na drugiej półce.`
        );
      return;
    }
    const s = { polozone: { ...stan.polozone, [id]: polka }, kolejnosc: [...stan.kolejnosc, id] };
    setStan(s);
    onState?.(s);
    setMsg('');
    if (s.kolejnosc.length === PASKI.length) onComplete();
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target?.startsWith('polka:')) poloz(id, target.slice(6) as Polka);
    },
    onTap: (id) => {
      setWybrany((w) => (w === id ? null : id));
      setMsg('');
    },
    disabled: gotowe,
  });

  const naTacy = PASKI.filter((p) => !stan.polozone[p.id]);
  const przyklad = gotowe ? przykladZPolki(stan.kolejnosc, dziennik) : undefined;
  const zw = przyklad?.frazeologizm ? zwrotKursu(przyklad.frazeologizm) : undefined;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Odłóż każdy pasek na półkę — tak, jak wyszło w twoim dzienniku. Przeciągnij zwinięty pasek albo go stuknij, a potem stuknij półkę.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {POLKI.map((pk) => {
          const tu = stan.kolejnosc.filter((id) => stan.polozone[id] === pk.id);
          return (
            <button
              key={pk.id}
              type="button"
              data-drop={`polka:${pk.id}`}
              onClick={() => wybrany && poloz(wybrany, pk.id)}
              className="flex min-h-[7.5rem] flex-col border-2 text-left"
              style={{
                borderColor: drag.hover === `polka:${pk.id}` || wybrany ? color : '#d6c7a1',
                background: drag.hover === `polka:${pk.id}` ? `${color}18` : undefined,
              }}
              data-testid={`polka-${pk.id}`}
            >
              <span className="flex items-center gap-2 border-b px-3 py-1.5 text-sm font-semibold">
                {pk.id === 'peklo' ? <Zap className="h-4 w-4 text-amber-600" aria-hidden /> : <Check className="h-4 w-4" style={{ color }} aria-hidden />}
                {pk.label}
                <span className="ml-auto font-mono text-xs text-muted-foreground">{tu.length}</span>
              </span>
              <span className="flex flex-1 flex-wrap content-end gap-1.5 p-2">
                {tu.map((id) => (
                  <span key={id} className="border bg-[#fffdf6] px-2 py-0.5 font-serif text-sm dark:bg-zinc-800">
                    {PASKI.find((x) => x.id === id)!.zwrot}
                  </span>
                ))}
              </span>
              {/* deska półki */}
              <span aria-hidden className="block h-2 w-full" style={{ background: '#c9a978' }} />
            </button>
          );
        })}
      </div>

      {!gotowe && (
        <div className="mt-3 border bg-[#f5efe0] p-2 dark:bg-zinc-800">
          <p className="text-xs text-muted-foreground">Na stole: zwinięte paski</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {naTacy.map((p) => (
              <button
                key={p.id}
                type="button"
                {...drag.bind(p.id)}
                className="touch-none rounded-full border bg-white px-3 py-1 font-serif text-sm dark:bg-zinc-900"
                style={wybrany === p.id ? { borderColor: color, background: `${color}22` } : undefined}
                data-testid={`zwoj-${p.id}`}
              >
                {p.zwrot}
                {!dziennik[p.id] && <span className="ml-1 text-xs text-muted-foreground">(niesprawdzony)</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {msg}
      </p>

      {gotowe && przyklad && zw && (
        <div className="border-2 p-3 text-sm leading-relaxed sm:text-base" style={{ borderColor: color }}>
          <p className="flex items-start gap-2">
            <BookMarked className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            <span>
              „{zw.zwrot[0].toUpperCase() + zw.zwrot.slice(1)}” nie mówi o tym, co znaczy każde słowo osobno — znaczy: <strong>{zw.objasnienie}</strong>. Dlatego
              po wymianie „{przyklad.slowo}” na „{dziennik[przyklad.id]!.wklejone}” pasek pękł.
            </span>
          </p>
          <p className="mt-2">
            Słowa, które razem znaczą coś innego niż każde osobno i nie dają się wymieniać, to <strong>związek frazeologiczny</strong>. Na półce
            „wytrzymało” leżą zwykłe połączenia: tam każde słowo znaczy to, co znaczy, więc wolno je wymienić na bliskoznaczne.
          </p>
        </div>
      )}

      <DragGhost drag={drag.drag}>
        {drag.drag && <span className="block rounded-full border bg-white px-3 py-1 font-serif text-sm">{PASKI.find((x) => x.id === drag.drag!.id)?.zwrot}</span>}
      </DragGhost>
    </div>
  );
}

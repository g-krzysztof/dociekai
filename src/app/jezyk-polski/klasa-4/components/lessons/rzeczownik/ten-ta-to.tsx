'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { PlanszaWyspy, RzeczWyspy } from './rysunki-wyspy';
import {
  MAX_ILE,
  TABLICZEK,
  dolozKopie,
  ileNapis,
  ocenTabliczke,
  slowo,
  tabliczkiGotowe,
  type Postawiona,
  type StanTabliczek,
  type Tabliczka,
} from './rzeczy';

/**
 * L14 blok 2 — „Ten, ta, to — i ile”. Każda postawiona rzecz dostaje pustą
 * tabliczkę; dziecko przybija na nią „ten”, „ta” albo „to” (półgłosem:
 * „ta latarnia”), zła tabliczka odpada. Stuknięcie rzeczy dokłada kopię,
 * a napis nad nią zmienia się na żywo: dom → dwa domy → pięć domów.
 * Werdykt rodzaju z danych SGJP.
 */

interface Props {
  color: string;
  rzeczy: Postawiona[];
  initial?: StanTabliczek | null;
  onState?: (s: StanTabliczek) => void;
  onZmiana?: (id: string, patch: { tabliczka?: Tabliczka; ile?: number }) => void;
  onComplete: () => void;
}

const TABLICZKI: Tabliczka[] = ['ten', 'ta', 'to'];

export function TenTaTo({ color, rzeczy, initial, onState, onZmiana, onComplete }: Props) {
  const [st, setSt] = useState<StanTabliczek>(() => initial ?? { tabliczki: {}, ile: {} });
  const [wybrana, setWybrana] = useState<Tabliczka | null>(null);
  const [odpada, setOdpada] = useState<{ id: string; t: Tabliczka } | null>(null);
  const [msg, setMsg] = useState('');
  const z = rzeczy.slice(0, TABLICZEK);
  const gotowe = tabliczkiGotowe(rzeczy, st);

  const zapisz = (s: StanTabliczek) => {
    setSt(s);
    onState?.(s);
    if (tabliczkiGotowe(rzeczy, s) && !gotowe) onComplete();
  };

  const przybij = (rid: string, t: Tabliczka) => {
    const r = z.find((x) => x.id === rid);
    if (!r || st.tabliczki[rid]) return;
    const s = slowo(r.slowo);
    const o = ocenTabliczke(s, t);
    setWybrana(null);
    if (!o.ok) {
      setOdpada({ id: rid, t });
      setMsg(`„${o.brzmi}”? Powiedz to półgłosem — brzmi dziwnie. Tabliczka odpadła z brzękiem.`);
      return;
    }
    setOdpada(null);
    setMsg(`„${o.brzmi}” — tabliczka trzyma.`);
    onZmiana?.(rid, { tabliczka: t });
    zapisz({ ...st, tabliczki: { ...st.tabliczki, [rid]: t } });
  };

  const drag = useDragToken({
    onDrop: (t, target) => {
      if (target?.startsWith('tab:')) przybij(target.slice(4), t as Tabliczka);
    },
    onTap: (t) => {
      setWybrana((w) => (w === t ? null : (t as Tabliczka)));
      setMsg('Teraz stuknij pustą tabliczkę pod rzeczą.');
    },
  });

  const doloz = (rid: string) => {
    const r = z.find((x) => x.id === rid)!;
    const s = slowo(r.slowo);
    if (s.policzalne === false) {
      setMsg(s.id === 'mgla' ? 'Mgły nie dołożysz stuknięciem — leży jedna, nad całą wyspą.' : 'Wiatru nie dołożysz stuknięciem — wieje jeden.');
      return;
    }
    const n = dolozKopie(st.ile[rid] ?? 1);
    onZmiana?.(rid, { ile: n });
    setMsg(n === 1 ? `Znowu jedna rzecz: ${ileNapis(s, 1)}.` : `${ileNapis(s, n)}.`.replace(/^./, (c) => c.toUpperCase()));
    zapisz({ ...st, ile: { ...st.ile, [rid]: n } });
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Przybij tabliczkę „ten”, „ta” albo „to” pod każdą rzeczą. Powiedz półgłosem, jak brzmi. Potem stukaj rzeczy, żeby było ich więcej.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {TABLICZKI.map((t) => (
          <button
            key={t}
            type="button"
            {...drag.bind(t)}
            className="touch-none border-2 bg-[#f5ead6] px-4 py-1 font-serif text-lg dark:bg-zinc-800"
            style={{ borderColor: wybrana === t ? color : '#a8846a', background: wybrana === t ? `${color}22` : undefined }}
            data-testid={`tabliczka-${t}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="relative mt-3 overflow-hidden border">
        <div aria-hidden className="absolute inset-0 opacity-50">
          <PlanszaWyspy />
        </div>
        <ul className="relative grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
          {z.map((r) => {
            const s = slowo(r.slowo);
            const n = st.ile[r.id] ?? 1;
            const t = st.tabliczki[r.id];
            const zla = odpada?.id === r.id;
            return (
              <li key={r.id} className="flex flex-col items-center border bg-white/80 p-1.5 dark:bg-zinc-900/80">
                <span className="min-h-[1.5rem] text-center font-serif text-sm font-semibold sm:text-base" aria-live="polite" data-testid={`napis-${r.slowo}`}>
                  {ileNapis(s, n)}
                </span>
                <button type="button" onClick={() => doloz(r.id)} className="flex h-14 w-full items-end justify-center" aria-label={`Dołóż: ${s.tekst}`} data-testid={`doloz-${r.slowo}`}>
                  {Array.from({ length: n }, (_, k) => (
                    <span key={k} className={`-mx-1.5 inline-block ${n > 3 ? 'w-7' : 'w-9'} animate-in zoom-in-50 duration-300`} style={{ transform: `translateY(${(k % 2) * -4}px)` }}>
                      <RzeczWyspy id={r.slowo} className="h-auto w-full" />
                    </span>
                  ))}
                </button>
                <span
                  data-drop={t ? undefined : `tab:${r.id}`}
                  onClick={() => wybrana && przybij(r.id, wybrana)}
                  className={`mt-1 flex h-8 min-w-[4rem] items-center justify-center border-2 px-2 font-serif text-base ${zla ? 'animate-in slide-in-from-top-2' : ''}`}
                  style={{
                    borderColor: t ? color : zla ? '#dc2626' : drag.hover === `tab:${r.id}` ? color : '#a8846a',
                    borderStyle: t ? 'solid' : 'dashed',
                    background: t ? '#f5ead6' : undefined,
                    color: t ? undefined : zla ? '#dc2626' : '#a8a29e',
                  }}
                  data-testid={`tab-${r.slowo}`}
                >
                  {t ? `${t} ${s.tekst}` : zla ? <s>{odpada.t}</s> : '…'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-3 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {msg}
      </p>
      {!gotowe && z.every((r) => st.tabliczki[r.id]) && !z.some((r) => (st.ile[r.id] ?? 1) >= MAX_ILE) && (
        <p className="text-sm text-muted-foreground">Tabliczki wiszą. Stukaj jedną rzecz, aż będzie ich pięć — patrz na napis.</p>
      )}

      {gotowe && (
        <div className="mt-2 border-2 p-3 text-sm leading-relaxed sm:text-base" style={{ borderColor: color }}>
          <p className="flex items-start gap-2">
            <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            <span>
              Rzeczownik ma <strong>rodzaj</strong> — słychać go w „ten”, „ta”, „to” — i <strong>liczbę</strong>: jedna rzecz albo wiele (dom —
              domy). Kiedy rzeczy przybywa, zmienia się końcówka. A słowa „dwa”, „trzy”, „pięć” mówią, ile czegoś jest — to{' '}
              <strong>liczebniki</strong>.
            </span>
          </p>
        </div>
      )}

      <DragGhost drag={drag.drag}>{drag.drag && <span className="block border-2 bg-[#f5ead6] px-4 py-1 font-serif text-lg">{drag.drag.id}</span>}</DragGhost>
    </div>
  );
}

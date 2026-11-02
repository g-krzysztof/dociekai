'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { HASLA_KURSU } from '../../../data/slownik/hasla';
import { RAMY, kafelek, odwiedz, ramaGotowa } from './przestaw';
import { Rysunek } from './rysunki';

/**
 * L10 blok 3 — „Przestaw znaczenie”. Dziecko wymienia jedno słowo przy
 * „zamku” kafelkiem (przeciągnięcie na miejsce w zdaniu albo stuknięcie
 * kafelka), a rysunek przeskakuje na inne znaczenie i słownik sam otwiera się
 * na nowym numerze. Każde z trzech zdań trzeba doprowadzić do każdego z trzech
 * znaczeń. Kafelek bez znaczenia („z bliska”) zostawia rysunek bez odpowiedzi.
 */

export interface StanPrzestaw {
  rama: number;
  /** id ramy → odwiedzone znaczenia. */
  odwiedzone: Record<string, number[]>;
}

const ZAMEK = HASLA_KURSU.zamek;

interface Props {
  color: string;
  initial?: StanPrzestaw | null;
  onState?: (s: StanPrzestaw) => void;
  onComplete: () => void;
}

export function PrzestawZnaczenie({ color, initial, onState, onComplete }: Props) {
  const [stan, setStan] = useState<StanPrzestaw>(
    () => initial ?? { rama: 0, odwiedzone: Object.fromEntries(RAMY.map((r) => [r.id, odwiedz([], kafelek(r, r.start).zn)])) }
  );
  const ukonczone = stan.rama >= RAMY.length;
  const r = RAMY[Math.min(stan.rama, RAMY.length - 1)];
  const [wslocie, setWslocie] = useState<string>(r.start);
  const [msg, setMsg] = useState('');

  const k = kafelek(r, wslocie);
  const odw = stan.odwiedzone[r.id] ?? [];
  const gotowa = ramaGotowa(odw);

  const wstaw = (id: string) => {
    if (ukonczone || id === wslocie) return;
    const nowy = kafelek(r, id);
    setWslocie(id);
    const o = odwiedz(odw, nowy.zn);
    const s = { ...stan, odwiedzone: { ...stan.odwiedzone, [r.id]: o } };
    setStan(s);
    onState?.(s);
    if (nowy.zn === 0) setMsg(`Z „${nowy.tekst}” zamek może być każdy — rysunek nie wie, co narysować.`);
    else if (ramaGotowa(o) && !gotowa) setMsg(`Trzy znaczenia, jedno zdanie. Za każdym razem zmieniło się tylko słowo obok zamku.`);
    else setMsg(`Teraz to zamek ${ZAMEK.znaczenia[nowy.zn - 1].nazwa === 'budowla' ? '— budowla' : ZAMEK.znaczenia[nowy.zn - 1].nazwa}. Słownik otworzył się na numerze ${nowy.zn}.`);
  };

  const dalej = () => {
    const nr = stan.rama + 1;
    const s = { ...stan, rama: nr };
    setStan(s);
    onState?.(s);
    setMsg('');
    if (nr < RAMY.length) setWslocie(RAMY[nr].start);
    else onComplete();
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target === 'slot') wstaw(id);
    },
    onTap: wstaw,
    disabled: ukonczone,
  });

  if (ukonczone) {
    return (
      <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
        <p className="flex items-center gap-2 font-semibold">
          <Check className="h-5 w-5" style={{ color }} aria-hidden />
          Trzy zdania, każde w trzech znaczeniach.
        </p>
        <p className="mt-2 text-sm leading-relaxed sm:text-base">
          Słowo „zamek” stało w miejscu. Znaczenie zmieniało to, co stało obok: wzgórze, piwnica, kurtka. To <strong>sąsiednie słowa
          wybierają znaczenie</strong>, a słownik podaje wszystkie, z których się wybiera.
        </p>
      </div>
    );
  }

  const tacka = r.kafelki.filter((x) => x.id !== wslocie);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Zdanie {stan.rama + 1} z {RAMY.length}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_15rem]">
        {/* Rysunek znaczenia. */}
        <div className="flex h-36 items-center justify-center border bg-[#fbf9f3] dark:bg-zinc-800 sm:h-44" style={{ color }} data-testid="rysunek">
          {k.zn ? (
            <Rysunek key={k.zn} kind={ZAMEK.znaczenia[k.zn - 1].rysunek!} className="h-28 w-36 animate-in fade-in zoom-in-95 duration-300 sm:h-36 sm:w-44" />
          ) : (
            <div className="flex items-center gap-2 opacity-35">
              {ZAMEK.znaczenia.map((z) => (
                <Rysunek key={z.nazwa} kind={z.rysunek!} className="h-14 w-16" />
              ))}
              <span className="font-mono text-3xl">?</span>
            </div>
          )}
        </div>
        {/* Słownik otwarty na numerze. */}
        <ol className="border bg-[#fbf9f3] p-2 text-sm dark:bg-zinc-800" style={{ borderColor: color }} aria-label="Hasło zamek">
          <li className="font-serif text-lg font-bold">zamek</li>
          {ZAMEK.znaczenia.map((z, i) => {
            const n = i + 1;
            const akt = k.zn === n;
            return (
              <li key={n} className="mt-1 flex items-start gap-1.5 px-1 py-0.5" style={akt ? { background: `${color}22`, outline: `2px solid ${color}` } : undefined}>
                <span className="font-mono font-bold">{n}.</span>
                <span className="leading-snug">{z.nazwa}</span>
                {odw.includes(n) && <Check className="ml-auto h-4 w-4 shrink-0" style={{ color }} aria-label="było" />}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Zdanie z miejscem na kafelek. */}
      <p className="mt-4 font-serif text-lg leading-loose sm:text-xl">
        {r.przed}{' '}
        <span
          data-drop="slot"
          className="inline-block border-2 border-dashed px-2 leading-normal"
          style={{ borderColor: color, background: drag.hover === 'slot' ? `${color}22` : undefined }}
        >
          {k.tekst}
        </span>
        {r.po}
      </p>

      <p className="mt-3 text-sm text-muted-foreground">Przeciągnij kafelek na miejsce w ramce — albo stuknij kafelek.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tacka.map((x) => (
          <button key={x.id} type="button" {...drag.bind(x.id)} className="touch-none border bg-white px-3 py-1.5 font-serif text-base dark:bg-zinc-900">
            {x.tekst}
          </button>
        ))}
      </div>

      <p className="mt-3 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {msg}
      </p>
      {gotowa && (
        <button type="button" onClick={dalej} className="mt-1 border-2 px-3 py-1.5 text-sm font-medium" style={{ borderColor: color }}>
          {stan.rama + 1 < RAMY.length ? 'Następne zdanie' : 'Gotowe'}
        </button>
      )}

      <DragGhost drag={drag.drag}>
        {drag.drag && <span className="block border bg-white px-3 py-1.5 font-serif text-base">{kafelek(r, drag.drag.id).tekst}</span>}
      </DragGhost>
    </div>
  );
}

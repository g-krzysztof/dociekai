'use client';

import { useState } from 'react';
import { Check, Equal, Shapes } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { PanelDzwigni, Walki } from './maszyna';
import { SKRZYNIA, START, forma, skutek, wynikProb, wyraz, type Dzwignia, type Dzwignie } from './odmiana';

/**
 * L13 blok 1 — „Odmieniarka”. Dziecko kładzie wyraz ze skrzyni na taśmie
 * i pociąga dźwignie (ile? kto? kiedy?). Wynik wyrazu liczy się dopiero po
 * wszystkich trzech — dźwignia, która wyrazu nie dotyczy, też go nie zmienia.
 * Wyraz, który nie zmienił się nigdzie, maszyna oddaje słowami „nic nie
 * musiałam robić”.
 */

export type WynikiOdmiany = Record<string, 'zmienia' | 'stoi'>;
export interface StanOdmieniarki {
  wyniki: WynikiOdmiany;
}

interface Props {
  color: string;
  initial?: StanOdmieniarki | null;
  onState?: (s: StanOdmieniarki) => void;
  onComplete: () => void;
}

interface Proba {
  id: string;
  d: Dzwignie;
  pociagniete: Dzwignia[];
  widziane: string[];
  ostatni: { k: Dzwignia; przed: string; po: string; zmiana: boolean } | null;
  n: number;
}

export function Odmieniarka({ color, initial, onState, onComplete }: Props) {
  const [wyniki, setWyniki] = useState<WynikiOdmiany>(() => initial?.wyniki ?? {});
  const [proba, setProba] = useState<Proba | null>(null);
  const gotowe = SKRZYNIA.every((id) => wyniki[id]);

  const [uwaga, setUwaga] = useState('');
  const poloz = (id: string) => {
    if (wyniki[id]) return;
    if (proba && !wyniki[proba.id] && proba.n > 0) {
      setUwaga(`Najpierw dokończ „${wyraz(proba.id).tekst}” — pociągnij pozostałe dźwignie.`);
      return;
    }
    setUwaga('');
    setProba({ id, d: START, pociagniete: [], widziane: [], ostatni: null, n: 0 });
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target === 'tasma') poloz(id);
    },
    onTap: poloz,
  });

  const pull = (k: Dzwignia) => {
    if (!proba) return;
    const w = wyraz(proba.id);
    const s = skutek(w, proba.d, k);
    const p: Proba = {
      ...proba,
      d: s.d,
      pociagniete: proba.pociagniete.includes(k) ? proba.pociagniete : [...proba.pociagniete, k],
      widziane: [...proba.widziane, s.po],
      ostatni: { k, przed: s.przed, po: s.po, zmiana: s.zmiana },
      n: proba.n + 1,
    };
    setProba(p);
    setUwaga('');
    const wynik = wynikProb(w, p.pociagniete, p.widziane);
    if (wynik && !wyniki[p.id]) {
      const nw = { ...wyniki, [p.id]: wynik };
      setWyniki(nw);
      onState?.({ wyniki: nw });
      if (SKRZYNIA.every((id) => nw[id])) onComplete();
    }
  };

  const w = proba ? wyraz(proba.id) : null;
  const wynik = proba ? wyniki[proba.id] : undefined;
  const brakuje = proba ? (['ile', 'kto', 'kiedy'] as Dzwignia[]).filter((k) => !proba.pociagniete.includes(k)) : [];
  const naSkrzyni = SKRZYNIA.filter((id) => !wyniki[id] && id !== proba?.id);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Połóż wyraz ze skrzyni na taśmie i pociągnij każdą dźwignię w dół. Patrz, co wałki robią z wyrazem.
      </p>

      {/* Skrzynia */}
      <div className="mt-3 border bg-[#efe6d2] p-2 dark:bg-zinc-800">
        <p className="text-xs text-muted-foreground">Skrzynia z łodzi</p>
        <div className="mt-1.5 flex min-h-[2.5rem] flex-wrap gap-2">
          {naSkrzyni.map((id) => (
            <button key={id} type="button" {...drag.bind(id)} className="touch-none border bg-white px-3 py-1 font-serif text-base dark:bg-zinc-900" data-testid={`skrzynia-${id}`}>
              {wyraz(id).tekst}
            </button>
          ))}
          {naSkrzyni.length === 0 && <span className="text-sm text-muted-foreground">Pusta.</span>}
        </div>
      </div>

      {/* Maszyna */}
      <div className="mt-3 grid select-none gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <div
            data-drop="tasma"
            className="flex h-12 items-center justify-center border-2 border-dashed px-2 text-sm"
            style={{ borderColor: drag.hover === 'tasma' ? color : '#a8a29e', background: drag.hover === 'tasma' ? `${color}18` : 'repeating-linear-gradient(90deg,#e7e5e4 0 10px,#f5f5f4 10px 20px)' }}
            data-testid="tasma"
          >
            {w ? (
              <span className="font-serif text-base">
                na taśmie: <strong>{w.tekst}</strong>
              </span>
            ) : (
              <span className="text-muted-foreground">tu połóż wyraz</span>
            )}
          </div>
          <div className="mt-2">
            <Walki tekst={w && proba ? forma(w, proba.d) : ''} klucz={proba ? `${proba.id}-${proba.n}` : 'pusto'} color={color} pusty="wałki czekają" />
          </div>
        </div>
        <PanelDzwigni d={proba?.d ?? START} color={color} disabled={!proba} pociagniete={proba?.pociagniete} onPull={pull} />
      </div>

      <div className="mt-3 min-h-[4.5rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {uwaga && <p className="text-amber-700 dark:text-amber-400">{uwaga}</p>}
        {proba?.ostatni &&
          (proba.ostatni.zmiana ? (
            <p>
              Maszyna: <span className="font-serif">{proba.ostatni.przed}</span> → <strong className="font-serif">{proba.ostatni.po}</strong>
            </p>
          ) : (
            <p>
              Maszyna: <span className="font-serif">{proba.ostatni.po}</span> — <em>nic nie musiałam robić</em>.
            </p>
          ))}
        {proba && !wynik && brakuje.length > 0 && proba.n > 0 && (
          <p className="text-muted-foreground">Jeszcze {brakuje.map((k) => `${k}?`).join(', ')} — dopiero wtedy wiadomo.</p>
        )}
        {wynik && w && (
          <p className="mt-1 flex items-start gap-2">
            {wynik === 'zmienia' ? <Shapes className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden /> : <Equal className="mt-0.5 h-5 w-5 shrink-0 text-stone-500" aria-hidden />}
            <span>
              {wynik === 'zmienia' ? (
                <>
                  „{w.tekst}” zmienia kształt. Odłożony do magazynu.
                </>
              ) : (
                <>
                  „{w.tekst}” pod każdą dźwignią wyszedł taki sam. Odłożony do magazynu.
                </>
              )}
            </span>
          </p>
        )}
      </div>

      {/* Magazyn */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        {(['zmienia', 'stoi'] as const).map((r) => (
          <div key={r} className="border p-2">
            <p className="text-xs font-semibold text-muted-foreground">{r === 'zmienia' ? 'zmienia kształt' : 'zostaje taki sam'}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {SKRZYNIA.filter((id) => wyniki[id] === r).map((id) => (
                <span key={id} className="border bg-[#fffdf6] px-1.5 font-serif dark:bg-zinc-800">
                  {wyraz(id).tekst}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {gotowe && (
        <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed sm:text-base">
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
          <span>
            Skrzynia pusta. Jedne wyrazy zmieniają kształt, kiedy zmienia się „ile”, „kto” albo „kiedy” — inne zostają takie same, cokolwiek
            pociągniesz.
          </span>
        </p>
      )}

      <DragGhost drag={drag.drag}>{drag.drag && <span className="block border bg-white px-3 py-1 font-serif text-base">{wyraz(drag.drag.id).tekst}</span>}</DragGhost>
    </div>
  );
}


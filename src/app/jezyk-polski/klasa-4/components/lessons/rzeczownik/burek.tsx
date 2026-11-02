'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { PlanszaWyspy, RzeczWyspy } from './rysunki-wyspy';
import { DO_NAZWANIA, MAX_IMIENIA, POWOD_IMIENIA, ocenImie, slowo, upuscPsa } from './rzeczy';

/**
 * L14 blok 3 — „Burek, nie pies” `[3.8]`. „Pies” upuszczony dwa razy stawia
 * dwa różne psy; „Burek” stawia jednego, a drugi raz biegnie do tego samego.
 * Potem dziecko nadaje imiona trzem rzeczom i całej wyspie: tabliczka z małą
 * literą świeci i nie zawiśnie. Werdykt tylko budowy (wielka litera, litery,
 * bez cyfr) — imiona to wolny tekst dziecka i zostają na urządzeniu.
 */

export interface StanImion {
  psy: { burek: boolean }[];
  burekProby: number;
  imiona: Record<string, string>;
}

interface Props {
  color: string;
  initial?: StanImion | null;
  onState?: (s: StanImion) => void;
  onImie?: (klucz: string, imie: string) => void;
  onComplete: () => void;
}

const KLUCZE = [...DO_NAZWANIA, 'wyspa'] as const;

export function BurekNiePies({ color, initial, onState, onImie, onComplete }: Props) {
  const [st, setSt] = useState<StanImion>(() => initial ?? { psy: [], burekProby: 0, imiona: {} });
  const [msg, setMsg] = useState('');
  const [skok, setSkok] = useState(0);
  const [pola, setPola] = useState<Record<string, string>>(() => ({ ...(initial?.imiona ?? {}) }));
  const [bledy, setBledy] = useState<Record<string, string>>({});
  const psow = st.psy.filter((p) => !p.burek).length;
  const odblokowane = psow >= 2 && st.burekProby >= 2;
  const gotowe = KLUCZE.every((k) => st.imiona[k]);

  const zapisz = (s: StanImion) => {
    setSt(s);
    onState?.(s);
  };

  const upusc = (co: 'pies' | 'Burek') => {
    const r = upuscPsa(st.psy, co);
    const s = { ...st, psy: r.psy, burekProby: co === 'Burek' ? st.burekProby + 1 : st.burekProby };
    zapisz(s);
    if (co === 'pies') setMsg(r.nowy ? 'Stoi kolejny pies — jakikolwiek pies.' : 'Psów jest już dość.');
    else if (r.nowy) setMsg('„Burek” postawił jednego, konkretnego psa — z tabliczką.');
    else {
      setSkok((n) => n + 1);
      setMsg('Burek już jest! Słowo „Burek” nie stawia nowego psa — biegnie do tego samego. Jest tylko jeden Burek.');
    }
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target === 'laka') upusc(id as 'pies' | 'Burek');
    },
    onTap: (id) => upusc(id as 'pies' | 'Burek'),
  });

  const zawies = (k: string) => {
    const v = (pola[k] ?? '').trim();
    const o = ocenImie(v);
    if (!o.ok) {
      setBledy((b) => ({ ...b, [k]: POWOD_IMIENIA[o.powod] }));
      return;
    }
    setBledy((b) => ({ ...b, [k]: '' }));
    const s = { ...st, imiona: { ...st.imiona, [k]: v } };
    zapisz(s);
    onImie?.(k, v);
    if (KLUCZE.every((x) => s.imiona[x]) && !gotowe) onComplete();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Upuść na łąkę „pies” — dwa razy. Potem „Burek” — też dwa razy. Patrz, co się dzieje.
      </p>
      <div className="mt-2 flex gap-2">
        {(['pies', 'Burek'] as const).map((w) => (
          <button key={w} type="button" {...drag.bind(w)} className="touch-none border bg-white px-3 py-1 font-serif text-base dark:bg-zinc-900" data-testid={`pies-${w}`}>
            {w}
          </button>
        ))}
      </div>
      <div
        data-drop="laka"
        className="relative mt-2 h-32 overflow-hidden border"
        style={{ borderColor: drag.hover === 'laka' ? color : undefined }}
        data-testid="laka"
      >
        <div aria-hidden className="absolute inset-0 scale-[2.2]">
          <PlanszaWyspy />
        </div>
        <div className="relative flex h-full items-end justify-center gap-3 pb-2">
          {st.psy.map((p, i) => (
            <div key={p.burek ? `burek-${skok}` : i} className={`flex w-16 flex-col items-center ${p.burek ? 'animate-in slide-in-from-left-8 duration-500' : 'animate-in zoom-in-50'}`}>
              {p.burek && <span className="border bg-[#f5ead6] px-1.5 font-serif text-xs">Burek</span>}
              <RzeczWyspy id="pies" className="h-auto w-full" />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-2 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {msg}
      </p>

      {odblokowane && (
        <div className="mt-2 border-t pt-3">
          <p className="text-sm leading-relaxed sm:text-base">
            „Pies” to każdy pies. „Burek” to <strong>ten jeden</strong>. Nadaj imiona trzem rzeczom z wyspy — i całej wyspie. Wymyśl je.
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {KLUCZE.map((k) => {
              const wisi = st.imiona[k];
              const blad = bledy[k];
              return (
                <li key={k} className="flex items-center gap-3 border p-2">
                  <div className="relative h-12 w-14 shrink-0 overflow-hidden">
                    {k === 'wyspa' ? <PlanszaWyspy /> : <RzeczWyspy id={k} className="h-full w-full" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{k === 'wyspa' ? 'wyspa' : slowo(k).tekst}</p>
                    {wisi ? (
                      <p className="mt-0.5 inline-flex items-center gap-1.5 border-2 bg-[#f5ead6] px-2 font-serif text-base" style={{ borderColor: color }} data-testid={`wisi-${k}`}>
                        <Check className="h-4 w-4" style={{ color }} aria-hidden /> {wisi}
                      </p>
                    ) : (
                      <form
                        className="mt-0.5 flex gap-1.5"
                        onSubmit={(e) => {
                          e.preventDefault();
                          zawies(k);
                        }}
                      >
                        <input
                          value={pola[k] ?? ''}
                          onChange={(e) => {
                            setPola((p) => ({ ...p, [k]: e.target.value }));
                            setBledy((b) => ({ ...b, [k]: '' }));
                          }}
                          maxLength={MAX_IMIENIA + 4}
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          aria-label={`Imię: ${k === 'wyspa' ? 'wyspa' : slowo(k).tekst}`}
                          className="min-w-0 flex-1 border-2 bg-[#fffdf6] px-2 py-1 font-serif text-base dark:bg-zinc-800"
                          style={{ borderColor: blad ? '#dc2626' : '#a8846a', boxShadow: blad ? '0 0 0 3px #fecaca' : undefined }}
                          data-testid={`imie-${k}`}
                        />
                        <button type="submit" className="border-2 px-2 text-sm font-medium" style={{ borderColor: color }}>
                          Zawieś
                        </button>
                      </form>
                    )}
                    <p className="min-h-[1.25rem] text-xs text-red-600 dark:text-red-400" aria-live="polite">
                      {blad}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {gotowe && (
        <div className="mt-3 border-2 p-3 text-sm leading-relaxed sm:text-base" style={{ borderColor: color }}>
          <p>
            Wyspa nazywa się teraz <strong>{st.imiona.wyspa}</strong>. „Pies”, „latarnia”, „łódka” to <strong>nazwy pospolite</strong> — pasują do
            każdego psa, każdej latarni. „{st.imiona.pies}”, „{st.imiona.latarnia}”, „{st.imiona.lodka}” to <strong>nazwy własne</strong> —
            wskazują jedną, tę rzecz. Nazwę własną piszemy wielką literą.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Imiona są zapisane tylko na tym urządzeniu.</p>
        </div>
      )}

      <DragGhost drag={drag.drag}>{drag.drag && <span className="block border bg-white px-3 py-1 font-serif text-base">{drag.drag.id}</span>}</DragGhost>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Check, ChefHat } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import {
  KOLORY,
  KOSZ,
  KSZTALTY,
  PUSTA,
  RAMY,
  SMAKI,
  ZAMOWIENIA,
  dolozPietro,
  nalozForme,
  ocenTort,
  polejLukrem,
  wRamie,
  zdejmijPietro,
  type Budowa,
  type Kolor,
  type Ksztalt,
  type Ocena,
  type Rama,
  type Smak,
} from './tort';

/**
 * L16 blok 2 — „Tort na zamówienie”. Na mecie cukiernik ma trzy zamówienia
 * mieszkańców wyspy, zapisane przymiotnikami. Dziecko buduje tort z części
 * (forma, piętra biszkoptu, lukier — przeciągnięcie na paterę albo
 * stuknięcie; stuknięcie piętra zdejmuje je), a klient porównuje go z
 * zamówieniem cecha po cesze: każdy przymiotnik zapala się albo gaśnie przy
 * swojej części. Po trzecim torcie padają terminy, a słowa z kosza L14
 * dziecko sprawdza własnym uchem w dwóch zdaniach: „jak?” i „jaki?”.
 */

export interface StanTortu {
  przyjete: number;
  kosz: Record<string, Rama>;
}

interface Props {
  color: string;
  initial?: StanTortu | null;
  onState?: (s: StanTortu) => void;
  onTort?: (b: Budowa) => void;
  onComplete: () => void;
}

export function TortNaZamowienie({ color, initial, onState, onTort, onComplete }: Props) {
  const [stan, setStan] = useState<StanTortu>(() => initial ?? { przyjete: 0, kosz: {} });
  const [budowa, setBudowa] = useState<Budowa>(PUSTA);
  const [oceny, setOceny] = useState<Ocena[] | null>(null);
  const [msg, setMsg] = useState('');
  const [wybrane, setWybrane] = useState<string | null>(null);
  const [koszMsg, setKoszMsg] = useState('');

  const torty = stan.przyjete >= ZAMOWIENIA.length;
  const koszGotowy = KOSZ.every((k) => stan.kosz[k.id]);
  const gotowe = torty && koszGotowy;
  const z = ZAMOWIENIA[Math.min(stan.przyjete, ZAMOWIENIA.length - 1)];
  const przyjety = oceny?.every((o) => o.ok) ?? false;

  const zapisz = (s: StanTortu) => {
    setStan(s);
    onState?.(s);
  };

  const zmien = (b: Budowa) => {
    setBudowa(b);
    setOceny(null);
  };

  function poloz(id: string) {
    if (torty || przyjety) return;
    const [rodzaj, wartosc] = id.split(':');
    if (rodzaj === 'f') {
      zmien(nalozForme(budowa, wartosc as Ksztalt));
      setMsg(budowa.ksztalt && budowa.ksztalt !== wartosc ? 'Forma zmieniona — wszystkie piętra mają teraz ten kształt.' : '');
    } else if (rodzaj === 's') {
      const r = dolozPietro(budowa, wartosc as Smak);
      if (!r.ok) {
        setMsg(r.powod === 'brak-formy' ? 'Biszkopt rozlałby się po paterze. Najpierw forma.' : 'Patera uniesie najwyżej trzy piętra. Stuknij piętro, żeby je zdjąć.');
        return;
      }
      zmien(r.budowa);
      setMsg('');
    } else if (rodzaj === 'l') {
      const r = polejLukrem(budowa, wartosc as Kolor);
      if (!r.ok) {
        setMsg('Lukier nie ma czego polać. Najpierw biszkopt.');
        return;
      }
      zmien(r.budowa);
      setMsg('');
    }
  }

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target === 'patera') poloz(id);
    },
    onTap: poloz,
    disabled: torty || przyjety,
  });

  function podaj() {
    const o = ocenTort(budowa, z);
    setOceny(o);
    if (o.every((x) => x.ok)) {
      setMsg(`${z.kto}: „Dokładnie taki, jak ${z.id === 'dzieci' ? 'zamawialiśmy' : 'zamawiałem'}!”`);
      onTort?.(budowa);
    } else {
      const zle = o.filter((x) => !x.ok).length;
      setMsg(`${z.kto} porównuje tort z kartką: ${zle === 1 ? 'jedno słowo się nie zgadza' : `${zle} słowa się nie zgadzają`}.`);
    }
  }

  function nastepne() {
    const s = { ...stan, przyjete: stan.przyjete + 1 };
    zapisz(s);
    setBudowa(PUSTA);
    setOceny(null);
    setMsg('');
  }

  function doRamy(rama: Rama) {
    if (!wybrane || gotowe) return;
    const k = KOSZ.find((x) => x.id === wybrane)!;
    if (k.rama !== rama) {
      setKoszMsg(`„${wRamie(k.tekst, rama)}” — przeczytaj to półgłosem. Brzmi dziwnie? Spróbuj drugiego zdania.`);
      return;
    }
    const s = { ...stan, kosz: { ...stan.kosz, [k.id]: rama } };
    zapisz(s);
    setWybrane(null);
    setKoszMsg(`„${wRamie(k.tekst, rama)}” — brzmi dobrze. „${k.tekst}” odpowiada na pytanie ${RAMY[rama].pytanie}`);
    if (KOSZ.every((x) => s.kosz[x.id])) onComplete();
  }

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      {!torty && (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
              Zamówienie {stan.przyjete + 1} z {ZAMOWIENIA.length} · {z.kto}
            </p>
          </div>
          <p className="mt-1 border-l-4 bg-[#fffdf6] px-3 py-2 font-serif text-lg leading-relaxed dark:bg-zinc-800" style={{ borderColor: color }} data-testid="zamowienie">
            {z.zdanie.map((c, i) =>
              typeof c === 'string' ? (
                <span key={i}>{c}</span>
              ) : (
                <SlowoZamowienia key={i} tekst={z.slowa[c].tekst} ocena={oceny?.[c]} />
              ),
            )}
          </p>

          <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,300px)_1fr] md:items-start">
            <div
              data-drop="patera"
              className="relative mx-auto w-full max-w-[260px] border bg-[#fbf7ef] dark:bg-zinc-800 md:max-w-[300px]"
              style={{ outline: drag.hover === 'patera' ? `3px solid ${color}` : undefined }}
              data-testid="patera"
            >
              <TortRysunek budowa={budowa} onZdejmij={(i) => !przyjety && zmien(zdejmijPietro(budowa, i))} />
            </div>

            <div className="min-w-0 space-y-2">
              <Polka nazwa="Formy">
                {KSZTALTY.map((k) => (
                  <Czesc key={k.id} bind={drag.bind(`f:${k.id}`)} aktywna={budowa.ksztalt === k.id} testid={`f-${k.id}`}>
                    <svg viewBox="0 0 30 20" className="h-5 w-7" aria-hidden>
                      {k.id === 'okragly' ? <ellipse cx={15} cy={10} rx={13} ry={8} fill="none" stroke="#57534e" strokeWidth={1.5} /> : <rect x={3} y={3} width={24} height={14} fill="none" stroke="#57534e" strokeWidth={1.5} />}
                    </svg>
                    {k.nazwa}
                  </Czesc>
                ))}
              </Polka>
              <Polka nazwa="Biszkopty">
                {SMAKI.map((s) => (
                  <Czesc key={s.id} bind={drag.bind(`s:${s.id}`)} testid={`s-${s.id}`}>
                    <span className="inline-block h-4 w-6 border border-stone-500" style={{ background: s.kolor }} aria-hidden />
                    {s.nazwa}
                  </Czesc>
                ))}
              </Polka>
              <Polka nazwa="Lukier">
                {KOLORY.map((l) => (
                  <Czesc key={l.id} bind={drag.bind(`l:${l.id}`)} aktywna={budowa.kolor === l.id} testid={`l-${l.id}`}>
                    <span className="inline-block h-4 w-4 rounded-full border border-stone-500" style={{ background: l.kolor }} aria-hidden />
                    {l.nazwa}
                  </Czesc>
                ))}
              </Polka>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!przyjety ? (
              <button
                type="button"
                onClick={podaj}
                disabled={budowa.pietra.length === 0}
                className="inline-flex items-center gap-1.5 border px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: color, borderColor: color }}
              >
                <ChefHat className="h-4 w-4" aria-hidden /> Podaj tort
              </button>
            ) : (
              <button type="button" onClick={nastepne} className="inline-flex items-center gap-1.5 border px-4 py-2 text-sm font-semibold text-white" style={{ background: color, borderColor: color }}>
                {stan.przyjete + 1 < ZAMOWIENIA.length ? 'Następne zamówienie' : 'Zamknij cukiernię'}
              </button>
            )}
          </div>
          <div className="mt-2 min-h-[4.5rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
            {msg && <p>{msg}</p>}
            {oceny && !przyjety && (
              <ul className="mt-1 space-y-0.5">
                {oceny.map((o, i) =>
                  o.ok ? null : (
                    <li key={i}>
                      <span className="font-serif line-through decoration-red-500">{z.slowa[i].tekst}</span> — {o.uwaga}
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        </>
      )}

      {torty && (
        <div className="space-y-4">
          <div className="border-l-4 bg-stone-50 px-3 py-2 text-sm leading-relaxed dark:bg-zinc-800 sm:text-base" style={{ borderColor: color }}>
            <p>
              Ślimakiem sterowały słowa, które mówią, <strong>jak?</strong> coś się dzieje: szybko, cicho, ostrożnie. To{' '}
              <strong>przysłówki</strong>.
            </p>
            <p className="mt-2">
              Tort budowały słowa, które mówią, <strong>jaki?</strong> jest przedmiot: okrągły, czekoladowy, różowy. To{' '}
              <strong>przymiotniki</strong> — malują rzecz, o której mowa.
            </p>
          </div>

          <div>
            <p className="text-sm leading-relaxed sm:text-base">
              W koszu z wyspy czekają trzy słowa. Wybierz słowo i stuknij zdanie, do którego pasuje. Przeczytaj je półgłosem — ucho podpowie.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {KOSZ.filter((k) => !stan.kosz[k.id]).map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setWybrane(k.id)}
                  className="border-2 px-3 py-1.5 font-serif text-base"
                  style={wybrane === k.id ? { borderColor: color, background: `${color}18` } : undefined}
                  aria-pressed={wybrane === k.id}
                  data-testid={`kosz-${k.id}`}
                >
                  {k.tekst}
                </button>
              ))}
              {koszGotowy && <p className="text-sm text-muted-foreground">Kosz jest pusty.</p>}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(['jak', 'jaki'] as Rama[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => doRamy(r)}
                  disabled={!wybrane}
                  className="border p-3 text-left disabled:cursor-default"
                  style={{ borderColor: wybrane ? color : undefined }}
                  data-testid={`rama-${r}`}
                >
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{RAMY[r].pytanie}</span>
                  <span className="mt-1 block font-serif text-lg">
                    {RAMY[r].przed} <span className="inline-block min-w-[4rem] border-b-2 border-dashed" />
                    {RAMY[r].po}
                  </span>
                  <span className="mt-1 block min-h-[1.5rem] font-serif text-sm" style={{ color }}>
                    {KOSZ.filter((k) => stan.kosz[k.id] === r)
                      .map((k) => k.tekst)
                      .join(' · ')}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
              {koszMsg}
            </p>
          </div>

          {gotowe && (
            <p className="flex items-start gap-2 border-t pt-3 text-sm leading-relaxed sm:text-base">
              <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
              <span>
                Przymiotnik zmienia końcówkę razem z rzeczownikiem: <em>okrągły tort</em>, <em>okrągła tarta</em>, <em>okrągłe ciasto</em>. Przysłówek
                zostaje taki sam: <em>ślimak pełznie szybko</em>, <em>ślimaki pełzną szybko</em> — pamiętasz kamienny tor odmieniarki?
              </span>
            </p>
          )}
        </div>
      )}

      <DragGhost drag={drag.drag}>
        {drag.drag && <span className="block border-2 bg-white px-3 py-1 text-sm shadow">{nazwaCzesci(drag.drag.id)}</span>}
      </DragGhost>
    </div>
  );
}

function nazwaCzesci(id: string): string {
  const [r, w] = id.split(':');
  if (r === 'f') return KSZTALTY.find((k) => k.id === w)!.nazwa;
  if (r === 's') return SMAKI.find((k) => k.id === w)!.nazwa;
  return KOLORY.find((k) => k.id === w)!.nazwa;
}

function SlowoZamowienia({ tekst, ocena }: { tekst: string; ocena?: Ocena }) {
  const styl = !ocena ? 'border-b-2 border-dotted border-stone-400' : ocena.ok ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100' : 'bg-stone-200 text-stone-500 line-through decoration-red-500 dark:bg-zinc-700';
  return <span className={`px-0.5 font-semibold transition-colors duration-500 ${styl}`}>{tekst}</span>;
}

function Polka({ nazwa, children }: { nazwa: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{nazwa}</p>
      <div className="mt-1 grid grid-cols-2 gap-1.5">{children}</div>
    </div>
  );
}

function Czesc({ bind, aktywna, testid, children }: { bind: ReturnType<ReturnType<typeof useDragToken>['bind']>; aktywna?: boolean; testid: string; children: React.ReactNode }) {
  return (
    <button type="button" {...bind} className="inline-flex touch-none items-center gap-1.5 border-2 px-2 py-1.5 text-left text-sm leading-tight" style={aktywna ? { borderColor: '#a16207', background: '#fef9c3' } : undefined} data-testid={testid}>
      {children}
    </button>
  );
}

const SZER = [150, 116, 84];
const WYS = 30;

/** Tort z boku: piętra od dołu, biszkopt widać w boku, lukier na wierzchu każdego piętra z zaciekami. */
function TortRysunek({ budowa, onZdejmij }: { budowa: Budowa; onZdejmij: (i: number) => void }) {
  const lukier = KOLORY.find((k) => k.id === budowa.kolor)?.kolor;
  const okragly = budowa.ksztalt !== 'kwadratowy';
  return (
    <svg viewBox="0 0 200 170" className="block h-auto w-full" role="img" aria-label={opisTortu(budowa)}>
      <ellipse cx={100} cy={152} rx={88} ry={10} fill="#e7e5e4" stroke="#a8a29e" />
      <path d="M92 160 h16 l4 8 h-24 z" fill="#d6d3d1" stroke="#a8a29e" />
      {budowa.ksztalt && budowa.pietra.length === 0 && (
        okragly ? <ellipse cx={100} cy={146} rx={75} ry={8} fill="none" stroke="#78716c" strokeDasharray="4 3" /> : <rect x={25} y={138} width={150} height={10} fill="none" stroke="#78716c" strokeDasharray="4 3" />
      )}
      {budowa.pietra.map((s, i) => {
        const w = SZER[i];
        const x = 100 - w / 2;
        const y = 146 - (i + 1) * WYS;
        const fill = SMAKI.find((k) => k.id === s)!.kolor;
        return (
          <g key={i} onClick={() => onZdejmij(i)} className="cursor-pointer" data-testid={`pietro-${i}`}>
            {okragly ? (
              <>
                <path d={`M${x} ${y} V${y + WYS} A${w / 2} 7 0 0 0 ${x + w} ${y + WYS} V${y}`} fill={fill} stroke="#57534e" strokeWidth={1} />
                <ellipse cx={100} cy={y} rx={w / 2} ry={7} fill={lukier ?? fill} stroke="#57534e" strokeWidth={1} />
              </>
            ) : (
              <>
                <rect x={x} y={y} width={w} height={WYS} fill={fill} stroke="#57534e" strokeWidth={1} />
                <path d={`M${x} ${y} L${x + 10} ${y - 8} H${x + w - 10} L${x + w} ${y} Z`} fill={lukier ?? fill} stroke="#57534e" strokeWidth={1} />
              </>
            )}
            {lukier && (
              <path
                d={`M${x} ${y} ${Array.from({ length: Math.floor(w / 14) }, (_, j) => `q7 ${j % 2 ? 6 : 11} 14 0`).join(' ')} V${y} Z`}
                fill={lukier}
                stroke="#57534e"
                strokeWidth={0.6}
              />
            )}
          </g>
        );
      })}
      {!budowa.ksztalt && (
        <text x={100} y={90} textAnchor="middle" fontSize={11} fill="#78716c">
          pusta patera
        </text>
      )}
    </svg>
  );
}

function opisTortu(b: Budowa): string {
  if (!b.ksztalt) return 'Pusta patera.';
  if (b.pietra.length === 0) return `Na paterze ${b.ksztalt === 'okragly' ? 'okrągła' : 'kwadratowa'} forma, bez biszkoptu.`;
  return `Tort ${b.ksztalt === 'okragly' ? 'okrągły' : 'kwadratowy'}, piętra od dołu: ${b.pietra.join(', ')}${b.kolor ? `, lukier ${KOLORY.find((k) => k.id === b.kolor)!.nazwa.replace('lukier ', '')}` : ', bez lukru'}.`;
}

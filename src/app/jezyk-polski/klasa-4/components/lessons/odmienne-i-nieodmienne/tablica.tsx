'use client';

import { useState, type ReactNode } from 'react';
import { ArrowDownToLine, Check } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { PanelDzwigni, Walki } from './maszyna';
import { START, TABLICE, forma, naTablicy, oddajOdRazu, pasuje, pociagnij, tablicaGotowa, wyraz, type Dzwignia, type Dzwignie } from './odmiana';

/**
 * L13 blok 3 — „Zdanie się nie klei” `[3.1]`. Na nabrzeżu tablica ze
 * zdaniem z wyrazów w formie słownikowej, a obrazek nad nią rozjechany.
 * Dziecko przeciąga wyraz do odmieniarki, ustawia dźwignie, aż forma pasuje,
 * i odkłada go na tablicę; obrazek składa się kawałek po kawałku. Wyrazy
 * nieodmienne maszyna oddaje od razu — pasują w każdym zdaniu. Dwie tablice.
 */

export interface StanTablic {
  wstawione: Record<string, Record<string, string>>;
}

interface Props {
  color: string;
  initial?: StanTablic | null;
  onState?: (s: StanTablic) => void;
  onComplete: () => void;
}

export function ZdanieSieNieKlei({ color, initial, onState, onComplete }: Props) {
  const [stan, setStan] = useState<StanTablic>(() => initial ?? { wstawione: {} });
  const [nr, setNr] = useState(() => (initial && tablicaGotowa(TABLICE[0], initial.wstawione[TABLICE[0].id] ?? {}) ? 1 : 0));
  const [wMaszynie, setWMaszynie] = useState<{ id: string; d: Dzwignie; n: number } | null>(null);
  const [msg, setMsg] = useState('');
  const t = TABLICE[nr];
  const wst = stan.wstawione[t.id] ?? {};
  const gotowa = tablicaGotowa(t, wst);
  const wszystko = TABLICE.every((x) => tablicaGotowa(x, stan.wstawione[x.id] ?? {}));

  const zapisz = (nw: Record<string, string>) => {
    const s = { wstawione: { ...stan.wstawione, [t.id]: nw } };
    setStan(s);
    onState?.(s);
    if (TABLICE.every((x) => tablicaGotowa(x, s.wstawione[x.id] ?? {})) && !wszystko) onComplete();
  };

  const doMaszyny = (id: string) => {
    if (gotowa) return;
    const w = wyraz(id);
    if (oddajOdRazu(id)) {
      setWMaszynie(null);
      setMsg(`„${w.lemat}” — maszyna oddaje od razu: nic nie musiała robić. Taki wyraz pasuje w każdym zdaniu.`);
      zapisz({ ...wst, [id]: w.lemat });
      return;
    }
    setWMaszynie({ id, d: START, n: 0 });
    setMsg(`„${w.lemat}” w maszynie. Ustaw dźwignie tak, żeby pasował do zdania, i odłóż go na tablicę.`);
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (id === 'wynik') {
        if (target === 'tablica') odloz();
        return;
      }
      if (target === 'maszyna') doMaszyny(id);
    },
    onTap: (id) => (id === 'wynik' ? odloz() : doMaszyny(id)),
  });

  const pull = (k: Dzwignia) => {
    if (!wMaszynie) return;
    setWMaszynie({ ...wMaszynie, d: pociagnij(wMaszynie.d, k), n: wMaszynie.n + 1 });
  };

  function odloz() {
    if (!wMaszynie) return;
    const w = wyraz(wMaszynie.id);
    const f = forma(w, wMaszynie.d);
    const nw = { ...wst, [w.id]: f };
    const i = t.wyrazy.findIndex((x) => x.id === w.id);
    const ok = pasuje(t, i, nw);
    setMsg(ok ? `„${f}” pasuje — kawałek obrazka wrócił na miejsce.` : `„${f}” dalej się nie klei z resztą zdania. Weź go jeszcze raz do maszyny.`);
    setWMaszynie(null);
    zapisz(nw);
  }

  const wynik = wMaszynie ? forma(wyraz(wMaszynie.id), wMaszynie.d) : '';

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tablica {nr + 1} z {TABLICE.length}
        </p>
      </div>

      <div className="mt-2 grid gap-3 sm:grid-cols-[200px_1fr] sm:items-start">
        <div className="mx-auto w-full max-w-[220px] border bg-[#fbf9f3] p-1 dark:bg-zinc-800" style={{ color }}>
          <Obrazek tablica={t.id} pasuje={(id) => pasuje(t, t.wyrazy.findIndex((x) => x.id === id), wst)} />
        </div>
        <div
          data-drop="tablica"
          className="border-4 bg-[#2f4f3e] px-3 py-3 text-lg leading-loose text-white sm:text-xl"
          style={{ borderColor: drag.hover === 'tablica' ? color : '#8b6b43' }}
          data-testid="tablica"
        >
          {t.wyrazy.map((x, i) => {
            const ok = pasuje(t, i, wst);
            const tekst = naTablicy(t, i, wst);
            const wMasz = wMaszynie?.id === x.id;
            return (
              <span key={x.id}>
                {x.stale || ok ? (
                  <span className="font-serif" style={ok && !x.stale ? { textDecoration: 'underline', textDecorationColor: '#86efac', textUnderlineOffset: 4 } : undefined}>
                    {tekst}
                  </span>
                ) : (
                  <button
                    type="button"
                    {...drag.bind(x.id)}
                    className={`touch-none border border-dashed px-1.5 font-serif ${wMasz ? 'opacity-30' : ''}`}
                    style={{ borderColor: '#fca5a5' }}
                    data-testid={`tab-${x.id}`}
                  >
                    {tekst}
                  </button>
                )}
                {i < t.wyrazy.length - 1 ? ' ' : t.koniec}
              </span>
            );
          })}
        </div>
      </div>

      {/* Maszyna */}
      <div className="mt-3 grid select-none gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <div
            data-drop="maszyna"
            className="flex h-10 items-center justify-center border-2 border-dashed text-sm"
            style={{ borderColor: drag.hover === 'maszyna' ? color : '#a8a29e', background: drag.hover === 'maszyna' ? `${color}18` : undefined }}
            data-testid="wlot"
          >
            {wMaszynie ? (
              <span>
                w maszynie: <strong className="font-serif">{wyraz(wMaszynie.id).lemat}</strong>
              </span>
            ) : (
              <span className="text-muted-foreground">wlot odmieniarki — przeciągnij tu wyraz z tablicy</span>
            )}
          </div>
          <div className="mt-2">
            <Walki tekst={wynik} klucz={wMaszynie ? `${wMaszynie.id}-${wMaszynie.n}` : 'pusto'} color={color} pusty="wałki czekają" />
          </div>
          {wMaszynie && (
            <button
              type="button"
              {...drag.bind('wynik')}
              className="mt-2 flex touch-none items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-medium"
              style={{ borderColor: color }}
              data-testid="odloz"
            >
              <ArrowDownToLine className="h-4 w-4" aria-hidden /> Odłóż „{wynik}” na tablicę
            </button>
          )}
        </div>
        <PanelDzwigni d={wMaszynie?.d ?? START} color={color} disabled={!wMaszynie} onPull={pull} />
      </div>

      <p className="mt-3 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {msg}
      </p>

      {gotowa && (
        <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
          <p className="flex items-center gap-2">
            <Check className="h-5 w-5" style={{ color }} aria-hidden /> Zdanie się klei.
          </p>
          {nr < TABLICE.length - 1 && (
            <button
              type="button"
              onClick={() => {
                setNr(nr + 1);
                setMsg('');
              }}
              className="border-2 px-3 py-1.5 text-sm font-medium"
              style={{ borderColor: color }}
            >
              Druga tablica
            </button>
          )}
        </div>
      )}
      {wszystko && nr === TABLICE.length - 1 && (
        <p className="mt-3 text-sm leading-relaxed sm:text-base">
          Wyrazy odmienne trzeba dopasować do zdania: ile, kto, kiedy. Nieodmienne wchodzą do każdego zdania takie, jakie są. Wszystkie wyrazy z
          tej lekcji zostają w magazynie w porcie — przydadzą się na wyspie.
        </p>
      )}

      <DragGhost drag={drag.drag}>
        {drag.drag && (
          <span className="block border bg-white px-3 py-1 font-serif text-base">{drag.drag.id === 'wynik' ? wynik : wyraz(drag.drag.id).lemat}</span>
        )}
      </DragGhost>
    </div>
  );
}

/** Obrazek nad tablicą: kawałek wraca na miejsce, gdy jego wyraz pasuje. */
function Obrazek({ tablica, pasuje }: { tablica: string; pasuje: (id: string) => boolean }) {
  const kawalek = (id: string, child: ReactNode, przesun = 'translate(10 -6) rotate(8)') => {
    const ok = pasuje(id);
    return (
      <g style={{ opacity: ok ? 1 : 0.35, transition: 'opacity 400ms, transform 400ms' }} transform={ok ? undefined : przesun}>
        {child}
      </g>
    );
  };
  return (
    <svg viewBox="0 0 200 130" className="block h-auto w-full" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {tablica === 'koty' ? (
        <>
          {kawalek(
            'dzis',
            <>
              <circle cx="170" cy="24" r="10" />
              <path d="M170 6 v-4 M186 24 h4 M158 12 l-3 -3 M182 12 l3 -3" />
            </>,
            'translate(-20 20) rotate(-20)'
          )}
          <path d="M6 116 H194" strokeWidth={1.4} />
          {kawalek(
            'maly',
            <>
              {/* ślady małych łapek */}
              {[14, 24, 34, 100, 110].map((x, i) => (
                <g key={x} transform={`translate(${x} ${i % 2 ? 122 : 126})`} fill="currentColor" stroke="none">
                  <circle cx="0" cy="0" r="2" />
                  <circle cx="-2" cy="-3" r="0.9" />
                  <circle cx="0" cy="-3.6" r="0.9" />
                  <circle cx="2" cy="-3" r="0.9" />
                </g>
              ))}
            </>
          )}
          {kawalek(
            'kot',
            <>
              {[40, 120].map((x) => (
                <g key={x} transform={`translate(${x} 74)`}>
                  <ellipse cx="18" cy="26" rx="20" ry="13" />
                  <circle cx="40" cy="14" r="9" />
                  <path d="M34 7 l1 -8 5 6 M43 6 l4 -7 2 9" />
                  <path d="M-2 24 q-10 -8 -4 -18" />
                </g>
              ))}
            </>,
            'translate(0 -10) scale(1.08)'
          )}
          {kawalek(
            'pic',
            <>
              <path d="M84 116 q8 -10 16 0 Z M162 116 q8 -10 16 0 Z" />
              <path d="M82 98 q4 6 6 12 M162 98 q4 6 4 12" />
            </>,
            'translate(16 4)'
          )}
          {kawalek(
            'mleko',
            <path d="M88 112 h8 M166 112 h8" stroke="#94a3b8" strokeWidth={3} />
          )}
        </>
      ) : (
        <>
          {kawalek(
            'jutro',
            <>
              <rect x="150" y="10" width="40" height="36" />
              <path d="M150 20 H190 M160 6 v8 M180 6 v8" />
              <path d="M160 34 h14 l-4 -4 m4 4 l-4 4" />
            </>,
            'translate(-30 10) rotate(-15)'
          )}
          {kawalek(
            'spiewac',
            <>
              {[30, 70, 110].map((x) => (
                <g key={x} transform={`translate(${x} 60)`}>
                  <circle cx="0" cy="0" r="9" />
                  <ellipse cx="0" cy="4" rx="3" ry="2.5" />
                  <path d="M0 9 V36 M0 18 L-10 26 M0 18 L10 26 M0 36 L-7 52 M0 36 L7 52" />
                </g>
              ))}
            </>,
            'translate(12 8) rotate(6)'
          )}
          {kawalek(
            'glosno',
            <>
              <path d="M130 40 v-18 l14 -4 v18" />
              <circle cx="127" cy="40" r="3.5" fill="currentColor" />
              <circle cx="141" cy="36" r="3.5" fill="currentColor" />
              <path d="M150 64 v-14 M150 50 l8 -2" />
              <circle cx="147" cy="64" r="3" fill="currentColor" />
            </>
          )}
          <path d="M6 116 H194" strokeWidth={1.4} />
        </>
      )}
    </svg>
  );
}

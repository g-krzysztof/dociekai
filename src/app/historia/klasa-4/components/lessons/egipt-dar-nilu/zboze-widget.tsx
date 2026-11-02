'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Minus, Plus } from 'lucide-react';
import { plural } from '@/lib/plural';
import { FAMILY_NEEDS, HARVEST, PYRAMID, STOPS, judgeScoop, leftAfter, type LevelId } from './nil';

/**
 * Blok 3 — **dokąd płynie zboże**. Dziecko zagarnia palcem worki z kopca
 * chłopa Ipiego (przeciągnięcie po workach zaznacza je, stuknięcie przełącza
 * jeden) i oddaje tyle, ile zapisał pisarz. Każdy przystanek zapala na piramidzie
 * tych, którzy z tego zboża żyją. Potem rok niskiego Nilu: najpierw przewidywanie,
 * ile zostanie rodzinie, potem to samo liczenie. Na końcu dwa głosy (rekonstrukcja).
 */
type Year = 'good' | 'bad';
const worki = (n: number) => `${n} ${plural(n, { one: 'worek', few: 'worki', many: 'worków' })}`;

export function ZbozeWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [year, setYear] = useState<Year>('good');
  const [stop, setStop] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [why, setWhy] = useState<string | null>(null);
  const [fed, setFed] = useState<Set<LevelId>>(() => new Set());
  const [guess, setGuess] = useState<number | null>(null);
  const [guessDraft, setGuessDraft] = useState(5);
  const sweeping = useRef(false);
  const reported = useRef(false);

  const pile = leftAfter(year, stop);
  const finished = stop === STOPS.length;
  const allDone = year === 'bad' && finished;
  const needGuess = year === 'bad' && guess === null;

  useEffect(() => {
    if (allDone && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [allDone, onDone]);

  const mark = (i: number) => setSelected((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const sackAt = (e: PointerEvent) => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-sack]');
    return el ? Number(el.dataset.sack) : null;
  };

  const give = () => {
    const s = STOPS[stop];
    const v = judgeScoop(selected.size, s, year);
    if (!v.ok) {
      setWhy(v.why ?? null);
      return;
    }
    setWhy(null);
    setSelected(new Set());
    setFed((prev) => new Set([...prev, ...s.feeds]));
    setStop(stop + 1);
  };

  const startBadYear = () => {
    setYear('bad');
    setStop(0);
    setSelected(new Set());
    setFed(new Set());
  };

  const current = STOPS[stop];
  const left = leftAfter(year, STOPS.length);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        {year === 'good' ? (
          <>
            <strong>Dobry rok, 16 łokci.</strong> Chłop Ipi zebrał {worki(HARVEST.good)} jęczmienia. Pisarz Mahu
            zmierzył pole sznurem i zapisał zbiór. Teraz chodzi od przystanku do przystanku i mówi, ile się należy.
            <strong> Zagarnij palcem</strong> tyle worków, ile trzeba, i oddaj.
          </>
        ) : (
          <>
            <strong>Rok niskiego Nilu, 13 łokci.</strong> Woda doszła tylko do jednego pola. Ipi zebrał zaledwie{' '}
            {worki(HARVEST.bad)}. Pisarz liczy znowu — w złym roku faraon i świątynia biorą mniej.
          </>
        )}
      </p>

      {needGuess ? (
        <div className="space-y-2 border p-3">
          <p className="text-sm">
            Zanim zaczniesz: ile worków — Twoim zdaniem — zostanie rodzinie Ipiego do jedzenia? Rodzina zjada{' '}
            {worki(FAMILY_NEEDS)} od żniw do żniw.
          </p>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="mniej" onClick={() => setGuessDraft((g) => Math.max(0, g - 1))} className="border p-2">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-24 text-center font-mono text-lg tabular-nums">{worki(guessDraft)}</span>
            <button type="button" aria-label="więcej" onClick={() => setGuessDraft((g) => Math.min(HARVEST.bad, g + 1))} className="border p-2">
              <Plus className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setGuess(guessDraft)} className="ml-2 border-2 px-3 py-2 text-sm font-semibold" style={{ borderColor: color }}>
              Tak sądzę
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-3">
            {!finished && current && (
              <div className="border-l-4 p-3 text-sm" style={{ borderColor: color }}>
                <p className="font-semibold">
                  {current.who}: {worki(current[year])}
                </p>
                <p className="text-muted-foreground">{current.says}</p>
              </div>
            )}
            <div
              className="grid touch-none grid-cols-5 gap-1.5 sm:grid-cols-10"
              onPointerDown={(e) => {
                if (finished) return;
                const i = sackAt(e);
                if (i === null) return;
                sweeping.current = true;
                toggle(i);
              }}
              onPointerMove={(e) => {
                if (!sweeping.current) return;
                const i = sackAt(e);
                if (i !== null) mark(i);
              }}
              onPointerUp={() => (sweeping.current = false)}
              onPointerCancel={() => (sweeping.current = false)}
              onPointerLeave={() => (sweeping.current = false)}
            >
              {Array.from({ length: pile }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  data-sack={i}
                  disabled={finished}
                  aria-pressed={selected.has(i)}
                  aria-label={`worek ${i + 1}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggle(i);
                    }
                  }}
                  className="flex aspect-square items-center justify-center border text-lg"
                  style={selected.has(i) ? { borderColor: color, background: `${color}33` } : undefined}
                >
                  🌾
                </button>
              ))}
            </div>
            {!finished && (
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={give} disabled={selected.size === 0} className="border-2 px-4 py-2 text-sm font-semibold disabled:opacity-40" style={{ borderColor: color }}>
                  Oddaj {worki(selected.size)}
                </button>
                <span className="text-sm text-muted-foreground">u Ipiego: {worki(pile)}</span>
              </div>
            )}
            {why && (
              <p className="text-sm text-destructive" role="status">
                {why}
              </p>
            )}
          </div>
          <Pyramid fed={fed} color={color} />
        </div>
      )}

      {finished && year === 'good' && (
        <div className="space-y-2 border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: color }} role="status">
          <p>
            Ipiemu zostało {worki(left)} do jedzenia. Rodzina zje {worki(FAMILY_NEEDS)}, a{' '}
            {worki(left - FAMILY_NEEDS)} wymieni na targu na dzban albo lniane płótno. Popatrz na piramidę: z jego
            zboża żyją ludzie, którzy sami nie sieją.
          </p>
          <button type="button" onClick={startBadYear} className="border px-3 py-1.5">
            Następny rok
          </button>
        </div>
      )}

      {allDone && (
        <div className="space-y-3">
          <p className="border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: '#b91c1c' }} role="status">
            Zostały {worki(left)} — a rodzina potrzebuje {worki(FAMILY_NEEDS)}.{' '}
            {guess === left
              ? 'Dokładnie tak, jak przewidziałeś/łaś.'
              : `Przewidywałeś/łaś ${worki(guess ?? 0)}. Ziarna na siew nie wolno ruszyć — inaczej za rok nie będzie czego zasiać.`}{' '}
            W takim roku ratunkiem był spichlerz faraona — ten sam, do którego Ipi oddawał worki w dobrych latach.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Voice who="Ipi, chłop" color={color}>
              „Ja siałem, ja żąłem, ja nosiłem worki. A z dwudziestu zostało mi dziesięć. Gdy Nil jest niski, moje
              dzieci są głodne, a spichlerz faraona pełny.”
            </Voice>
            <Voice who="Mahu, pisarz" color={color}>
              „Bez podatku nie byłoby spichlerzy na złe lata ani żołnierzy przy granicy, ani ludzi, którzy kopią
              kanały. Ktoś musi liczyć, żeby starczyło dla wszystkich.”
            </Voice>
          </div>
          <p className="text-xs text-muted-foreground">
            Rozmowa to rekonstrukcja — Ipi i Mahu są wymyśleni, a liczby worków podane dla przykładu. Kierunek, w którym
            płynęło zboże, zgadza się z tym, co mówią papirusy i sceny z grobowców.
          </p>
        </div>
      )}
    </div>
  );
}

function Voice({ who, color, children }: { who: string; color: string; children: React.ReactNode }) {
  return (
    <figure className="border p-3 text-sm leading-relaxed">
      <figcaption className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        {who}
      </figcaption>
      <blockquote>{children}</blockquote>
    </figure>
  );
}

function Pyramid({ fed, color }: { fed: Set<LevelId>; color: string }) {
  const n = PYRAMID.length;
  return (
    <svg viewBox="0 0 220 200" className="mx-auto w-full max-w-[240px]" role="img" aria-label="Piramida społeczna Egiptu">
      {PYRAMID.map((l, i) => {
        const y = 8 + i * 26;
        const half = 24 + i * 13;
        const lit = fed.has(l.id);
        return (
          <g key={l.id}>
            <polygon
              points={`${110 - half},${y + 24} ${110 + half},${y + 24} ${110 + half - 7},${y} ${110 - half + 7},${y}`}
              fill={lit ? color : '#efe6d2'}
              opacity={lit ? 0.85 : 1}
              stroke="#b79d6a"
              strokeWidth="0.8"
            />
            <text x="110" y={y + 16} fontSize={i === 0 ? 9 : 10} textAnchor="middle" fill={lit ? '#fff' : '#5b4a2a'}>
              {l.name}
              {i === n - 2 ? ' — najwięcej' : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

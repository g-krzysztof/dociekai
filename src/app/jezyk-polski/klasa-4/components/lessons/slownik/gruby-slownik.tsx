'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Timer } from 'lucide-react';
import { plural } from '@/lib/plural';
import { LEMATY } from '../../../data/slownik/lematy';
import { HASLA_KURSU } from '../../../data/slownik/hasla';
import {
  krokBezwladnosci,
  liczbaRozkladowek,
  pagina,
  pikseliNaRozkladowke,
  powod,
  sprawdzHaslo,
  wskazowka,
  zbudujSlownik,
  type Slownik,
} from './slownik';

/**
 * L10 blok 1 — „Gruby słownik”. Dziecko **kartkuje słownik kciukiem**:
 * pociągnięcie w bok przerzuca strony z bezwładnością (szybki ruch = wiele
 * stron, strony zwalniają same), stuknięcie brzegu przewraca jedną
 * rozkładówkę, wycięcia z literami skaczą do litery. Trzy rundy, słownik
 * coraz grubszy. Sekundnik rusza z pierwszym ruchem; po czasie słownik nie
 * mówi „przegrałeś”, tylko pokazuje, gdzie dziecko stoi i dlaczego to nie tu.
 */

/** Hasła, których nie chcemy w słowniku dla dziesięciolatka, i sztuczne lematy SGJP. */
const BLOKADA = new Set(['trup', 'zabić', 'zabijać', 'piwo', 'wódka', 'krewa', 'krewić', 'kroplić', 'krople', 'kropelki', 'kręt']);
const HASLA = LEMATY.filter((w) => !BLOKADA.has(w));
const NA_STRONE = 6;
const SASIEDZI = ['kot', 'krowa', 'kreda', 'kredka', 'kredens', 'krem', 'kreska', 'kret', 'kretowisko', 'kasza', 'kawa'];

export const RUNDY = [
  { strony: 40, cel: 'kot', limit: 40 },
  { strony: 150, cel: 'krowa', limit: 60 },
  { strony: 400, cel: 'kreda', limit: 90 },
] as const;

const SLOWNIKI: Slownik[] = RUNDY.map((r) => zbudujSlownik(HASLA, r.strony, NA_STRONE, SASIEDZI));

export type Rekordy = (number | null)[];

function czas(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

/** Szare kreski udające treść hasła — długość stała dla słowa (bez losowania przy renderze). */
function kreski(w: string): [number, number] {
  let h = 7;
  for (const c of w) h = (h * 31 + c.charCodeAt(0)) % 997;
  return [55 + (h % 40), 25 + ((h >> 3) % 45)];
}

function stronyPodLitera(s: Slownik, litera: string): number {
  return s.strony.filter((st) => st.some((w) => w.startsWith(litera))).length;
}

function wstepRundy(i: number): ReactNode {
  const r = RUNDY[i];
  if (i === 0)
    return (
      <>
        Cienki słownik, {r.strony} stron. Szukasz słowa <strong>{r.cel}</strong>. Na początek wystarczy pierwsza litera — i hasła
        u góry stron.
      </>
    );
  if (i === 1)
    return (
      <>
        Grubszy słownik: {r.strony} stron. Hasła na K zajmują tu {plural(stronyPodLitera(SLOWNIKI[1], 'k'), { one: 'stronę', few: 'strony', many: 'stron' })}{' '}
        — sama pierwsza litera nie wystarczy. Szukasz: <strong>{r.cel}</strong>.
      </>
    );
  return (
    <>
      Gruby słownik: {r.strony} stron. Szukasz: <strong>{r.cel}</strong>. Obok mieszkają kredka, kredens i kret — patrz na
      kolejne litery.
    </>
  );
}

interface Props {
  color: string;
  initial?: Rekordy | null;
  onRekordy?: (r: Rekordy) => void;
  onComplete: () => void;
}

export function GrubySlownik({ color, initial, onRekordy, onComplete }: Props) {
  const [rekordy, setRekordy] = useState<Rekordy>(() => initial ?? [null, null, null]);
  const ukonczone = rekordy[2] != null;
  const [runda, setRunda] = useState(() => {
    const i = initial ? initial.findIndex((x) => x == null) : 0;
    return i < 0 ? 2 : i;
  });
  const [faza, setFaza] = useState<'szukam' | 'znalezione'>('szukam');
  const [poz, setPoz] = useState(0);
  const [ruch, setRuch] = useState(false);
  const [start, setStart] = useState<number | null>(null);
  const [sekundy, setSekundy] = useState(0);
  const [wynik, setWynik] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const slownik = SLOWNIKI[runda];
  const cel = RUNDY[runda].cel;
  const max = liczbaRozkladowek(slownik) - 1;
  const pxNa = pikseliNaRozkladowke(max + 1);

  // Fizyka w refach (60 klatek na sekundę bez przebudowy całego widżetu), render z `poz`.
  const p = useRef(0);
  const v = useRef(0);
  const cel_ = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const ostatni = useRef(0);
  const gest = useRef<{ x: number; p0: number; t: number; lx: number; lt: number; moved: boolean; id: number } | null>(null);
  const przeciagniety = useRef(false);

  const ruszSekundnik = useCallback(() => setStart((s) => s ?? Date.now()), []);

  const petla = useCallback(
    (t: number) => {
      const dt = Math.min(48, t - (ostatni.current || t));
      ostatni.current = t;
      if (cel_.current != null) {
        const d = cel_.current - p.current;
        p.current += d * Math.min(1, dt / 90);
        if (Math.abs(d) < 0.02) {
          p.current = cel_.current;
          cel_.current = null;
        }
      } else if (v.current !== 0) {
        const k = krokBezwladnosci(p.current, v.current, dt, max);
        p.current = k.p;
        v.current = k.v;
      }
      const dalej = cel_.current != null || v.current !== 0;
      if (!dalej && !gest.current) p.current = Math.round(p.current);
      setPoz(Math.round(p.current * 100) / 100);
      if (dalej) raf.current = requestAnimationFrame(petla);
      else {
        raf.current = null;
        setRuch(false);
      }
    },
    [max]
  );

  const animuj = useCallback(() => {
    setRuch(true);
    if (raf.current == null) {
      ostatni.current = 0;
      raf.current = requestAnimationFrame(petla);
    }
  }, [petla]);

  useEffect(() => () => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
  }, []);

  // Sekundnik.
  useEffect(() => {
    if (start == null || faza !== 'szukam') return;
    const id = window.setInterval(() => setSekundy(Math.floor((Date.now() - start) / 1000)), 250);
    return () => window.clearInterval(id);
  }, [start, faza]);

  const skocz = (rozkladowka: number) => {
    if (faza !== 'szukam') return;
    ruszSekundnik();
    v.current = 0;
    cel_.current = Math.max(0, Math.min(max, rozkladowka));
    animuj();
  };

  const onDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (faza !== 'szukam' || e.button > 0) return;
    cel_.current = null;
    v.current = 0;
    gest.current = { x: e.clientX, p0: p.current, t: e.timeStamp, lx: e.clientX, lt: e.timeStamp, moved: false, id: e.pointerId };
    przeciagniety.current = false;
  };
  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const g = gest.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    if (!g.moved && Math.abs(dx) < 6) return;
    if (!g.moved) {
      g.moved = true;
      przeciagniety.current = true;
      ruszSekundnik();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* bez przechwycenia ruch działa, dopóki palec jest nad słownikiem */
      }
      setRuch(true);
    }
    const dt = Math.max(1, e.timeStamp - g.lt);
    // Palec w lewo = strony do przodu (jak kciuk przerzucający kartki od prawej).
    v.current = Math.max(-0.25, Math.min(0.25, -(e.clientX - g.lx) / pxNa / dt));
    g.lx = e.clientX;
    g.lt = e.timeStamp;
    p.current = Math.max(0, Math.min(max, g.p0 - dx / pxNa));
    setPoz(Math.round(p.current * 100) / 100);
  };
  const onUp = (e: ReactPointerEvent<HTMLElement>) => {
    const g = gest.current;
    gest.current = null;
    if (!g || g.id !== e.pointerId || !g.moved) return;
    // Palec zatrzymany przed puszczeniem — bez rozpędu.
    if (e.timeStamp - g.lt > 80) v.current = 0;
    animuj();
  };

  /** Stuknięcie brzegu (nie hasła): prawa połowa — jedna rozkładówka dalej, lewa — wstecz. */
  const onBookClick = (e: MouseEvent<HTMLDivElement>) => {
    if (przeciagniety.current) {
      przeciagniety.current = false;
      return;
    }
    if ((e.target as HTMLElement).closest('button')) return;
    const r = e.currentTarget.getBoundingClientRect();
    skocz(Math.round(p.current) + (e.clientX > r.left + r.width / 2 ? 1 : -1));
  };

  const stuknij = (w: string) => {
    if (faza !== 'szukam' || przeciagniety.current) return;
    ruszSekundnik();
    const s = sprawdzHaslo(cel, w);
    setMsg(s.tekst);
    if (!s.trafione) return;
    const t = start == null ? 0 : Math.max(1, Math.round((Date.now() - start) / 1000));
    setWynik(t);
    setSekundy(t);
    setFaza('znalezione');
    const nowe = rekordy.map((x, i) => (i === runda ? (x == null ? t : Math.min(x, t)) : x));
    setRekordy(nowe);
    onRekordy?.(nowe);
    if (runda === 2 && rekordy[2] == null) onComplete();
  };

  const nowaRunda = (i: number) => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = null;
    p.current = 0;
    v.current = 0;
    cel_.current = null;
    setPoz(0);
    setRuch(false);
    setRunda(i);
    setFaza('szukam');
    setStart(null);
    setSekundy(0);
    setWynik(null);
    setMsg('');
  };

  const s = Math.round(poz);
  const { pierwsze, ostatnie } = pagina(slownik, s);
  const pokazPodpowiedz = faza === 'szukam' && start != null && sekundy >= RUNDY[runda].limit;
  const tuBylo = useMemo(() => {
    const w = wskazowka(slownik, s, cel);
    return `Stoisz na stronach „${pierwsze} – ${ostatnie}”. ${powod(cel, w)}`;
  }, [slownik, s, cel, pierwsze, ostatnie]);

  const frac = poz - Math.floor(poz);
  const kartka = ruch && Math.abs(poz - s) > 0.02;
  const grubL = Math.round(2 + (10 * s) / Math.max(1, max));
  const grubP = Math.round(2 + 10 - (10 * s) / Math.max(1, max));
  const definicja = HASLA_KURSU[cel]?.znaczenia[0]?.tekst;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Runda {runda + 1} z 3 · {RUNDY[runda].strony} stron
        </p>
        <p className="flex items-center gap-1.5 font-mono text-sm tabular-nums" aria-label="Sekundnik">
          <Timer className="h-4 w-4" aria-hidden style={{ color }} />
          {czas(sekundy)}
          {rekordy[runda] != null && <span className="ml-2 text-xs text-muted-foreground">rekord {czas(rekordy[runda]!)}</span>}
        </p>
      </div>
      <p className="mt-2 min-h-[3rem] text-sm leading-relaxed sm:text-base">{wstepRundy(runda)}</p>

      {/* Słownik: rozkładówka, brzegi kartek, kartka w ruchu. */}
      <div
        className="relative mt-3 flex touch-pan-y select-none cursor-ew-resize"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClick={onBookClick}
        data-testid="slownik"
      >
        <div
          aria-hidden
          className="shrink-0 border-y border-l border-zinc-300 dark:border-zinc-600"
          style={{ width: grubL, background: 'repeating-linear-gradient(90deg,#e4e0d6 0 1px,#faf8f2 1px 3px)' }}
        />
        {[0, 1].map((k) => {
          const nr = s * 2 + k;
          const strona = slownik.strony[nr];
          return (
            <div
              key={k}
              className={`relative min-w-0 flex-1 border-y border-zinc-300 bg-[#fbf9f3] px-2 pb-6 pt-2 dark:border-zinc-600 dark:bg-zinc-800 sm:px-4 ${k === 0 ? 'border-r' : ''}`}
            >
              <p className="truncate border-b border-zinc-300 pb-1 text-center font-serif text-[11px] italic text-zinc-600 dark:text-zinc-300 sm:text-xs">
                {strona[0]} – {strona[strona.length - 1]}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {strona.map((w) => {
                  const [a, b] = kreski(w);
                  const trafione = faza === 'znalezione' && w === cel;
                  return (
                    <li key={w}>
                      <button
                        type="button"
                        onClick={() => stuknij(w)}
                        className="block w-full px-0.5 text-left outline-offset-1"
                        style={trafione ? { background: `${color}26`, outline: `2px solid ${color}` } : undefined}
                      >
                        <span className="block truncate font-serif text-sm font-bold sm:text-base">{w}</span>
                        <span className="mt-0.5 block h-1 bg-zinc-300 dark:bg-zinc-600" style={{ width: `${a}%` }} />
                        <span className="mt-0.5 block h-1 bg-zinc-300 dark:bg-zinc-600" style={{ width: `${b}%` }} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <span className="absolute bottom-1 left-0 right-0 text-center font-mono text-[10px] text-zinc-500">{nr + 1}</span>
            </div>
          );
        })}
        <div
          aria-hidden
          className="shrink-0 border-y border-r border-zinc-300 dark:border-zinc-600"
          style={{ width: grubP, background: 'repeating-linear-gradient(90deg,#faf8f2 0 2px,#e4e0d6 2px 3px)' }}
        />
        {kartka && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-1/2 border border-zinc-300 bg-[#f3efe4] shadow-md dark:bg-zinc-700"
            style={
              frac < 0.5
                ? { left: '50%', transformOrigin: 'left', transform: `scaleX(${Math.cos(frac * Math.PI).toFixed(2)})` }
                : { right: '50%', transformOrigin: 'right', transform: `scaleX(${(-Math.cos(frac * Math.PI)).toFixed(2)})` }
            }
          />
        )}
      </div>

      {/* Pas kciuka + strzałki. */}
      <div className="mt-2 flex items-stretch gap-2">
        <button type="button" aria-label="Poprzednia rozkładówka" onClick={() => skocz(s - 1)} className="border px-2" disabled={faza !== 'szukam'}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div
          className="flex h-11 flex-1 touch-none select-none items-center justify-center border text-xs text-muted-foreground cursor-ew-resize"
          style={{ background: 'repeating-linear-gradient(90deg,transparent 0 6px,rgba(120,113,108,.18) 6px 7px)' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          data-testid="pas-kciuka"
        >
          ← kartkuj kciukiem →
        </div>
        <button type="button" aria-label="Następna rozkładówka" onClick={() => skocz(s + 1)} className="border px-2" disabled={faza !== 'szukam'}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Wycięcia z literami. */}
      <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Wycięcia z literami">
        {slownik.litery.map(({ litera, strona }) => {
          const tu = [...slownik.strony[s * 2], ...slownik.strony[s * 2 + 1]].some((w) => w.startsWith(litera));
          return (
            <button
              key={litera}
              type="button"
              onClick={() => skocz(Math.floor(strona / 2))}
              disabled={faza !== 'szukam'}
              className="h-8 w-8 border text-sm font-semibold uppercase"
              style={tu ? { background: color, color: 'white', borderColor: color } : undefined}
            >
              {litera}
            </button>
          );
        })}
      </div>

      <div className="mt-3 min-h-[4.5rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {faza === 'znalezione' ? (
          <div className="border p-3" style={{ borderColor: color }}>
            <p>
              <strong className="font-serif text-lg">{cel}</strong> — {definicja}
            </p>
            <p className="mt-1 text-muted-foreground">
              Znalezione w {czas(wynik ?? 0)}
              {rekordy[runda] === wynik ? ' — to twój rekord tej rundy.' : `. Rekord: ${czas(rekordy[runda] ?? 0)}.`}
            </p>
          </div>
        ) : (
          <>
            <p>{msg}</p>
            {pokazPodpowiedz && (
              <p className="mt-1">
                <span className="font-semibold">Tu było: </span>
                {tuBylo}
              </p>
            )}
          </>
        )}
      </div>

      {faza === 'znalezione' && (
        <div className="mt-2 flex flex-wrap gap-2">
          {runda < 2 && (
            <button type="button" onClick={() => nowaRunda(runda + 1)} className="border-2 px-3 py-1.5 text-sm font-medium" style={{ borderColor: color }}>
              Grubszy słownik — runda {runda + 2}
            </button>
          )}
          <button type="button" onClick={() => nowaRunda(runda)} className="flex items-center gap-1.5 border px-3 py-1.5 text-sm">
            <RotateCcw className="h-4 w-4" aria-hidden /> Jeszcze raz — pobij rekord
          </button>
        </div>
      )}
      {ukonczone && faza === 'znalezione' && runda === 2 && (
        <p className="mt-3 text-sm leading-relaxed">
          Im grubszy słownik, tym więcej liter trzeba porównać. Słownik nie ma wyszukiwarki — ma porządek: najpierw pierwsza litera,
          potem druga, trzecia… A hasła u góry stron mówią, czy szukane słowo jest tutaj, dalej czy wcześniej.
        </p>
      )}
      {ukonczone && faza === 'szukam' && runda === 2 && start == null && (
        <p className="mt-2 text-xs text-muted-foreground">
          Rekordy: {rekordy.map((r, i) => `runda ${i + 1} — ${r == null ? '…' : czas(r)}`).join(', ')}.
        </p>
      )}
    </div>
  );
}

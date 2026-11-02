'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { Twarz } from '../../twarz/twarz';
import { LEMATY } from '../../../data/slownik/lematy';
import { HASLA_KURSU } from '../../../data/slownik/hasla';
import { krokBezwladnosci, liczbaRozkladowek, pagina, pikseliNaRozkladowke, zbudujSlownik } from '../slownik/slownik';
import { RysunekZwrotu } from './rysunki-l12';
import { OPOWIESC, coWHasle, ocenObjasnienie, zwrotKursu } from './zwroty';

/**
 * L12 blok 3 — „Zuzia słucha babci” `[3.7]` `[3.5]`. Babcia opowiada, a Zuzia
 * (5 lat) rozumie zwroty dosłownie — jej chmurka myśli rysuje dosłowny obraz.
 * Dziecko kartkuje słownik z L10 (kciukiem, z bezwładnością), szuka hasła
 * jednego ze słów zwrotu i podaje Zuzi objaśnienie spod znaku ◊; chmurka się
 * przemalowuje. Rozstrzyga słownik: objaśnienie innego zwrotu (np. „mieć pełne
 * ręce roboty”) Zuzia odrzuca, a hasło bez zwrotu mówi, gdzie szukać dalej.
 * Jedyna „postać reaguje” w module 3.
 */

export interface StanZuzi {
  /** Ile zdań opowieści jest odsłoniętych (1…5). */
  doKad: number;
  wyjasnione: string[];
}

interface Props {
  color: string;
  initial?: StanZuzi | null;
  onState?: (s: StanZuzi) => void;
  onComplete: () => void;
}

const BLOKADA = new Set(['trup', 'zabić', 'zabijać', 'piwo', 'wódka', 'krewa', 'krewić', 'kroplić', 'krople', 'kropelki', 'kręt']);
const WYMAGANE = Object.keys(HASLA_KURSU);
const SLOWNIK = zbudujSlownik(
  LEMATY.filter((w) => !BLOKADA.has(w)),
  120,
  5,
  WYMAGANE
);
const MAX = liczbaRozkladowek(SLOWNIK) - 1;
const PX = pikseliNaRozkladowke(MAX + 1);
const ZWROTY_OPOWIESCI = OPOWIESC.filter((z) => z.zwrot).map((z) => z.zwrot!);

export function ZuziaSlucha({ color, initial, onState, onComplete }: Props) {
  const [stan, setStan] = useState<StanZuzi>(() => initial ?? { doKad: 1, wyjasnione: [] });
  const [haslo, setHaslo] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [odrzut, setOdrzut] = useState<string | null>(null);

  const zdanie = OPOWIESC[stan.doKad - 1];
  const czeka = zdanie.zwrot && !stan.wyjasnione.includes(zdanie.zwrot) ? zdanie.zwrot : undefined;
  const koniec = stan.doKad === OPOWIESC.length && !czeka;

  const zapisz = (s: StanZuzi) => {
    setStan(s);
    onState?.(s);
  };

  const dalej = () => {
    if (czeka || stan.doKad >= OPOWIESC.length) return;
    zapisz({ ...stan, doKad: stan.doKad + 1 });
    setMsg('');
    setOdrzut(null);
  };

  const podaj = (id: string) => {
    if (!czeka) {
      setMsg('Zuzia na razie wszystko rozumie. Posłuchaj, co babcia mówi dalej.');
      return;
    }
    const o = ocenObjasnienie(czeka, id);
    if (!o.ok) {
      setOdrzut(o.podany.zwrot);
      setMsg(`Zuzia kręci głową. To objaśnienie zwrotu „${o.podany.zwrot}”, a babcia powiedziała co innego.`);
      return;
    }
    const wyj = [...stan.wyjasnione, id];
    zapisz({ ...stan, wyjasnione: wyj });
    setOdrzut(null);
    setMsg('');
    if (ZWROTY_OPOWIESCI.every((z) => wyj.includes(z))) onComplete();
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target === 'chmurka') podaj(id);
    },
    onTap: podaj,
  });

  const otworz = (w: string) => {
    setHaslo(w);
    const c = coWHasle(w, czeka);
    if (!czeka) setMsg('');
    else if (c === 'jest') setMsg('Jest! Za znakiem ◊ stoi zwrot z opowieści. Przeciągnij jego objaśnienie do chmurki Zuzi albo je stuknij.');
    else if (c === 'pod-innym')
      setMsg(`Słowo „${w}” jest w tym zwrocie, ale zwrotu pod tym hasłem nie ma. Słownik stawia go pod innym słowem z tego zwrotu.`);
    else if (c === 'obok') setMsg(`Pod hasłem „${w}” nie ma tego zwrotu. Szukaj hasła, które jest jednym ze słów zwrotu.`);
    else setMsg(`„${w}” — to hasło nic tu nie wyjaśni. Szukaj jednego ze słów zwrotu.`);
  };

  const pokazany = czeka ? zdanie : [...OPOWIESC.slice(0, stan.doKad)].reverse().find((z) => z.zwrot);
  const rysunek = czeka ? zdanie.doslownie : pokazany && stan.wyjasnione.includes(pokazany.zwrot!) ? pokazany.sens : undefined;
  const wpis = haslo ? HASLA_KURSU[haslo] : undefined;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      {/* Opowieść i Zuzia */}
      <div className="grid gap-3 sm:grid-cols-[1fr_250px]">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Babcia opowiada</p>
          <ol className="mt-1 space-y-1 font-serif text-base leading-relaxed sm:text-lg">
            {OPOWIESC.slice(0, stan.doKad).map((z, k) => (
              <li key={k} className={k === stan.doKad - 1 ? '' : 'text-sm text-muted-foreground sm:text-base'}>
                {z.tekst}
              </li>
            ))}
          </ol>
          {!czeka && !koniec && (
            <button type="button" onClick={dalej} className="mt-2 flex items-center gap-1.5 border-2 px-3 py-1 text-sm font-medium" style={{ borderColor: color }}>
              <MessageCircle className="h-4 w-4" aria-hidden /> Babcia mówi dalej
            </button>
          )}
        </div>
        <div className="flex items-end gap-2">
          <div className="shrink-0">
            <Twarz kto="zuzia" mina={czeka ? 'zdziwienie' : koniec || rysunek ? 'usmiech' : 'spokoj'} size={76} label="Zuzia" />
          </div>
          <div
            data-drop="chmurka"
            className="relative min-w-0 flex-1 rounded-[45%] border-2 bg-[#fbf9f3] px-3 py-2 dark:bg-zinc-800"
            style={{ borderColor: drag.hover === 'chmurka' ? color : '#cbd5e1', background: drag.hover === 'chmurka' ? `${color}22` : undefined }}
            data-testid="chmurka"
          >
            <div className="mx-auto h-[86px] w-[108px]" style={{ color: czeka ? '#b45309' : color }}>
              {rysunek ? <RysunekZwrotu key={rysunek} kind={rysunek} className="h-full w-full animate-in fade-in duration-500" /> : <span className="block h-full" />}
            </div>
            <span aria-hidden className="absolute -bottom-2 left-1 h-3 w-3 rounded-full border-2 bg-[#fbf9f3] dark:bg-zinc-800" style={{ borderColor: '#cbd5e1' }} />
          </div>
        </div>
      </div>
      <p className="mt-2 min-h-[2.75rem] text-sm italic leading-relaxed sm:text-base" aria-live="polite">
        {czeka ? `Zuzia: „${zdanie.zuziaPyta}”` : pokazany && stan.wyjasnione.includes(pokazany.zwrot!) ? `Zuzia: „${pokazany.zuziaRozumie}”` : ' '}
      </p>


      {/* Hasło */}
      <div className="mt-2 min-h-[6rem] border p-3" style={{ borderColor: wpis ? color : undefined }} data-testid="haslo-l12">
        {haslo && wpis ? (
          <>
            <p className="font-serif">
              <strong className="text-lg">{wpis.haslo}</strong>{' '}
              {wpis.znaczenia.map((z, k) => (
                <span key={k}>
                  {wpis.znaczenia.length > 1 && <b>{k + 1}. </b>}
                  {z.tekst}
                  {k < wpis.znaczenia.length - 1 ? ' ' : '.'}
                </span>
              ))}
            </p>
            {wpis.zwroty?.length ? (
              <div className="mt-2 flex flex-col gap-1.5">
                {wpis.zwroty.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    {...drag.bind(z.id)}
                    className="touch-none border bg-[#fffdf6] px-2 py-1 text-left font-serif text-sm dark:bg-zinc-800 sm:text-base"
                    style={odrzut === z.zwrot ? { borderColor: '#dc2626' } : undefined}
                    data-testid={`zwrot-${z.id}`}
                  >
                    ◊ <i>{z.zwrot}</i> — {z.objasnienie}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Pod tym hasłem nie ma zwrotów ze znakiem ◊.</p>
            )}
          </>
        ) : haslo ? (
          <p className="font-serif">
            <strong className="text-lg">{haslo}</strong> <span className="text-sm text-muted-foreground">— hasło bez zwrotów ze znakiem ◊.</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Stuknij hasło w słowniku poniżej, a tutaj otworzy się jego wpis.</p>
        )}
      </div>

      <p className="mt-2 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {msg}
      </p>

      <SlownikKieszonkowy color={color} wybrane={haslo} onOtworz={otworz} />

      {koniec && (
        <p className="mt-3 border-t pt-3 text-sm leading-relaxed sm:text-base">
          Zuzia zrozumiała całą opowieść. Związku frazeologicznego nie zgadniesz z pojedynczych słów — ale słownik ma go pod jednym z nich, za
          znakiem ◊. Czasem pod pierwszym słowem, czasem pod drugim.
        </p>
      )}

      <DragGhost drag={drag.drag}>
        {drag.drag && <span className="block max-w-[16rem] border bg-white px-2 py-1 font-serif text-sm">{zwrotKursu(drag.drag.id)?.objasnienie}</span>}
      </DragGhost>
    </div>
  );
}

/** Słownik z L10 w wersji do szukania: kartkowanie kciukiem z bezwładnością, wycięcia liter, żywa pagina. */
function SlownikKieszonkowy({ color, wybrane, onOtworz }: { color: string; wybrane: string | null; onOtworz: (w: string) => void }) {
  const [poz, setPoz] = useState(0);
  const p = useRef(0);
  const v = useRef(0);
  const cel = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const ostatni = useRef(0);
  const gest = useRef<{ x: number; p0: number; lx: number; lt: number; moved: boolean; id: number } | null>(null);

  const petla = useCallback((t: number) => {
    const dt = Math.min(48, t - (ostatni.current || t));
    ostatni.current = t;
    if (cel.current != null) {
      const d = cel.current - p.current;
      p.current += d * Math.min(1, dt / 90);
      if (Math.abs(d) < 0.02) {
        p.current = cel.current;
        cel.current = null;
      }
    } else if (v.current !== 0) {
      const k = krokBezwladnosci(p.current, v.current, dt, MAX);
      p.current = k.p;
      v.current = k.v;
    }
    const ruch = cel.current != null || v.current !== 0;
    if (!ruch && !gest.current) p.current = Math.round(p.current);
    setPoz(Math.round(p.current * 100) / 100);
    raf.current = ruch ? requestAnimationFrame(petla) : null;
  }, []);

  const animuj = () => {
    if (raf.current == null) {
      ostatni.current = 0;
      raf.current = requestAnimationFrame(petla);
    }
  };
  useEffect(() => () => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
  }, []);

  const skocz = (r: number) => {
    v.current = 0;
    cel.current = Math.max(0, Math.min(MAX, r));
    animuj();
  };

  const onDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button > 0) return;
    cel.current = null;
    v.current = 0;
    gest.current = { x: e.clientX, p0: p.current, lx: e.clientX, lt: e.timeStamp, moved: false, id: e.pointerId };
  };
  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const g = gest.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    if (!g.moved && Math.abs(dx) < 6) return;
    if (!g.moved) {
      g.moved = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ruch działa i bez przechwycenia */
      }
    }
    const dt = Math.max(1, e.timeStamp - g.lt);
    v.current = Math.max(-0.25, Math.min(0.25, -(e.clientX - g.lx) / PX / dt));
    g.lx = e.clientX;
    g.lt = e.timeStamp;
    p.current = Math.max(0, Math.min(MAX, g.p0 - dx / PX));
    setPoz(Math.round(p.current * 100) / 100);
  };
  const onUp = (e: ReactPointerEvent<HTMLElement>) => {
    const g = gest.current;
    gest.current = null;
    if (!g || !g.moved) return;
    if (e.timeStamp - g.lt > 80) v.current = 0;
    animuj();
  };

  const s = Math.round(poz);
  const { pierwsze, ostatnie } = pagina(SLOWNIK, s);

  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Słownik z pracowni</p>
        <p className="truncate font-serif text-xs italic text-muted-foreground">
          {pierwsze} – {ostatnie}
        </p>
      </div>
      <div className="mt-1 grid grid-cols-2 border border-zinc-300 bg-[#fbf9f3] dark:border-zinc-600 dark:bg-zinc-800" data-testid="slownik-l12">
        {[0, 1].map((k) => {
          const strona = SLOWNIK.strony[s * 2 + k];
          return (
            <ul key={k} className={`min-w-0 px-2 py-1.5 ${k === 0 ? 'border-r border-zinc-300 dark:border-zinc-600' : ''}`}>
              {strona.map((w) => (
                <li key={w}>
                  <button
                    type="button"
                    onClick={() => onOtworz(w)}
                    className="block w-full truncate px-0.5 text-left font-serif text-sm font-bold sm:text-base"
                    style={wybrane === w ? { background: `${color}26`, outline: `2px solid ${color}` } : undefined}
                  >
                    {w}
                  </button>
                </li>
              ))}
            </ul>
          );
        })}
      </div>
      <div className="mt-1.5 flex items-stretch gap-2">
        <button type="button" aria-label="Poprzednia rozkładówka" onClick={() => skocz(s - 1)} className="border px-2">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div
          className="flex h-10 flex-1 touch-none select-none items-center justify-center border text-xs text-muted-foreground cursor-ew-resize"
          style={{ background: 'repeating-linear-gradient(90deg,transparent 0 6px,rgba(120,113,108,.18) 6px 7px)' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          data-testid="pas-kciuka-l12"
        >
          ← kartkuj kciukiem →
        </div>
        <button type="button" aria-label="Następna rozkładówka" onClick={() => skocz(s + 1)} className="border px-2">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1" role="group" aria-label="Wycięcia z literami">
        {SLOWNIK.litery.map(({ litera, strona }) => {
          const tu = Math.floor(strona / 2) <= s && [...SLOWNIK.strony[s * 2], ...SLOWNIK.strony[s * 2 + 1]].some((w) => w.startsWith(litera));
          return (
            <button
              key={litera}
              type="button"
              onClick={() => skocz(Math.floor(strona / 2))}
              className="h-7 w-7 border text-xs font-semibold uppercase"
              style={tu ? { background: color, color: 'white', borderColor: color } : undefined}
            >
              {litera}
            </button>
          );
        })}
      </div>
    </div>
  );
}

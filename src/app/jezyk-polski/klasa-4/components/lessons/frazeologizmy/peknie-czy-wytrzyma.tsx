'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowRight, Check, Scissors, Zap } from 'lucide-react';
import { plural } from '@/lib/plural';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { RysunekZwrotu } from './rysunki-l12';
import { PASKI, poWymianie, probuj, punktyObwodu, tnij, wycietoDosc, type Dziennik, type Pasek } from './zwroty';

/**
 * L12 blok 1 — „Pęknie czy wytrzyma?” `[3.7]`. Dziecko prowadzi nożyczki
 * palcem po przerywanej linii wokół słowa (cięcie liczone geometrią: punkty
 * obwodu zaliczone w tolerancji, skrót przez środek słowa nic nie tnie),
 * słowo odpada, a w lukę wkleja wyraz bliskoznaczny z szufladki (jak w L11).
 * Zwykłe połączenie wytrzymuje, związek frazeologiczny pęka i zostaje po nim
 * dosłowny rysunek. Każda próba trafia do dziennika śledztwa — z niego
 * korzysta blok 2.
 */

export interface StanProb {
  dziennik: Dziennik;
}

interface Props {
  color: string;
  initial?: StanProb | null;
  onState?: (s: StanProb) => void;
  onComplete: () => void;
}

type Faza = 'tnij' | 'wklej' | 'wynik';

export function PeknieCzyWytrzyma({ color, initial, onState, onComplete }: Props) {
  const [dziennik, setDziennik] = useState<Dziennik>(() => initial?.dziennik ?? {});
  const pierwszyWolny = (d: Dziennik) => PASKI.findIndex((p) => !d[p.id]);
  const [i, setI] = useState(() => {
    const k = pierwszyWolny(initial?.dziennik ?? {});
    return k < 0 ? PASKI.length - 1 : k;
  });
  const p = PASKI[i];
  const zrobione = Object.keys(dziennik).length;
  const wszystko = zrobione === PASKI.length;
  const [faza, setFaza] = useState<Faza>(() => (initial?.dziennik?.[PASKI[i].id] ? 'wynik' : 'tnij'));

  const zapisz = (d: Dziennik) => {
    setDziennik(d);
    onState?.({ dziennik: d });
  };

  const wklej = (slowo: string) => {
    if (faza !== 'wklej') return;
    const proba = probuj(p, slowo);
    const d = { ...dziennik, [p.id]: proba };
    zapisz(d);
    setFaza('wynik');
    if (Object.keys(d).length === PASKI.length && !wszystko) onComplete();
  };

  const drag = useDragToken({
    onDrop: (slowo, target) => {
      if (target === 'luka') wklej(slowo);
    },
    onTap: wklej,
    disabled: faza !== 'wklej',
  });

  const nastepny = () => {
    const k = pierwszyWolny(dziennik);
    if (k < 0) return;
    setI(k);
    setFaza('tnij');
  };

  const proba = dziennik[p.id];
  const peklo = faza === 'wynik' && proba?.wynik === 'peklo';

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Pasek {i + 1} z {PASKI.length}
        </p>
        <p className="text-xs text-muted-foreground">
          W dzienniku: {zrobione} {plural(zrobione, { one: 'próba', few: 'próby', many: 'prób' })}
        </p>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
        <figure className="mx-auto w-40 sm:w-full">
          <div
            key={faza === 'wynik' ? `wynik-${p.id}` : p.id}
            className={`aspect-[5/4] border bg-[#fbf9f3] p-2 dark:bg-zinc-800 ${faza === 'wynik' && !peklo ? 'animate-in zoom-in-90 duration-300' : ''}`}
            style={{ color: peklo ? '#b45309' : color }}
            data-testid="rysunek-paska"
          >
            <RysunekZwrotu key={peklo ? 'dosl' : 'sens'} kind={peklo && p.doslownie ? p.doslownie : p.sens} className="h-full w-full animate-in fade-in duration-300" />
          </div>
          <figcaption className="mt-1 min-h-[2rem] text-center text-xs text-muted-foreground">
            {peklo ? 'Tak to brzmi dosłownie.' : 'Co znaczy zdanie.'}
          </figcaption>
        </figure>

        <div className="min-w-0">
          <PasekPapieru key={p.id} p={p} faza={faza} color={color} wklejone={proba?.wklejone} peklo={peklo} hover={drag.hover === 'luka'} onCut={() => setFaza('wklej')} />

          {/* Szufladka — zawsze ma swoje miejsce. */}
          <div className="mt-3 min-h-[4.5rem] border bg-[#f5efe0] p-2 dark:bg-zinc-800" data-testid="szufladka-l12">
            {faza === 'wklej' ? (
              <>
                <p className="text-xs text-muted-foreground">Szufladka z wyrazami bliskoznacznymi: przeciągnij słowo w lukę albo je stuknij.</p>
                <div className="mt-2 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                  {p.szufladka.map((w) => (
                    <button key={w} type="button" {...drag.bind(w)} className="touch-none border bg-white px-3 py-1.5 font-serif text-base dark:bg-zinc-900">
                      {w}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {faza === 'tnij' ? 'Najpierw wytnij słowo — szufladka wysunie się sama.' : 'Szufladka zamknięta.'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 min-h-[4.5rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {faza === 'wynik' && proba && (
          <p className="flex items-start gap-2">
            {peklo ? (
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            ) : (
              <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            )}
            <span>
              {peklo ? (
                <>
                  <strong>Pękło!</strong> Nikt tak nie mówi: „{poWymianie(p, proba.wklejone)}” W tym zwrocie „{p.slowo}” nie znaczyło tego, co zwykle — po wymianie został tylko dosłowny obraz.
                </>
              ) : (
                <>
                  <strong>Wytrzymało.</strong> „{poWymianie(p, proba.wklejone)}” — zdanie mówi to samo, rysunek tylko drgnął.
                </>
              )}
            </span>
          </p>
        )}
      </div>

      {faza === 'wynik' && !wszystko && (
        <button type="button" onClick={nastepny} className="flex items-center gap-2 border-2 px-3 py-1.5 text-sm font-medium" style={{ borderColor: color }}>
          Następny pasek <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}

      {/* Dziennik śledztwa. */}
      <div className="mt-4 border-t pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dziennik śledztwa</p>
        {zrobione === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">Pusto. Każde cięcie zapisze się tutaj.</p>
        ) : (
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2" data-testid="dziennik">
            {PASKI.filter((x) => dziennik[x.id]).map((x) => {
              const d = dziennik[x.id];
              return (
                <li key={x.id} className="flex items-center gap-2 border px-2 py-1">
                  {d.wynik === 'peklo' ? <Zap className="h-4 w-4 shrink-0 text-amber-600" aria-label="pękło" /> : <Check className="h-4 w-4 shrink-0" style={{ color }} aria-label="wytrzymało" />}
                  <span className="min-w-0">
                    <span className="font-serif">{x.zwrot}</span>
                    <span className="text-muted-foreground"> · {x.slowo} → {d.wklejone}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {wszystko && faza === 'wynik' && (
        <p className="mt-3 text-sm leading-relaxed sm:text-base">
          Dziennik pełny. Jedne zdania przeżyły wymianę słowa, inne pękły, choć w lukę szły słowa o tym samym znaczeniu. Czym się różnią?
          Sprawdzisz to przy półkach.
        </p>
      )}

      <DragGhost drag={drag.drag}>{drag.drag && <span className="block border bg-white px-3 py-1.5 font-serif text-base">{drag.drag.id}</span>}</DragGhost>
    </div>
  );
}

/** Pasek papieru ze zdaniem; wokół słowa przerywana linia do cięcia. */
function PasekPapieru({
  p,
  faza,
  color,
  wklejone,
  peklo,
  hover,
  onCut,
}: {
  p: Pasek;
  faza: Faza;
  color: string;
  wklejone?: string;
  peklo: boolean;
  hover: boolean;
  onCut: () => void;
}) {
  const box = useRef<HTMLSpanElement>(null);
  const geo = useRef<{ left: number; top: number; w: number; h: number; pts: { x: number; y: number }[] } | null>(null);
  const ostatni = useRef<{ x: number; y: number } | null>(null);
  const [zaliczone, setZaliczone] = useState<Set<number>>(() => new Set());
  const [nozyczki, setNozyczki] = useState<{ x: number; y: number } | null>(null);
  const [spada, setSpada] = useState(false);
  const [wymiar, setWymiar] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (faza !== 'wklej') return;
    const id = requestAnimationFrame(() => setSpada(true));
    return () => cancelAnimationFrame(id);
  }, [faza]);

  const lokalnie = (e: ReactPointerEvent) => {
    const g = geo.current!;
    return { x: Math.round(e.clientX - g.left), y: Math.round(e.clientY - g.top) };
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (faza !== 'tnij' || !box.current || e.button > 0) return;
    const r = box.current.getBoundingClientRect();
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    geo.current = { left: r.left, top: r.top, w, h, pts: punktyObwodu(w, h) };
    setWymiar({ w, h });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* bez przechwycenia cięcie działa, dopóki palec jest nad paskiem */
    }
    ostatni.current = lokalnie(e);
    setNozyczki(ostatni.current);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = geo.current;
    if (!g || !ostatni.current || faza !== 'tnij') return;
    const b = lokalnie(e);
    const a = ostatni.current;
    ostatni.current = b;
    setNozyczki(b);
    setZaliczone((z) => {
      const nz = tnij(z, g.pts, a, b, g.w, g.h);
      return nz.size === z.size ? z : nz;
    });
  };
  const onUp = () => {
    ostatni.current = null;
    setNozyczki(null);
  };

  const pts = geo.current?.pts;
  useEffect(() => {
    if (faza === 'tnij' && pts && wycietoDosc(zaliczone, pts.length)) {
      ostatni.current = null;
      setNozyczki(null);
      onCut();
    }
  }, [zaliczone, pts, faza, onCut]);

  const postep = pts ? Math.round((100 * zaliczone.size) / pts.length) : 0;
  const pustyZnak = /^[.,!?]/.test(p.po);

  return (
    <div>
      <div
        className={`relative border bg-[#fffdf6] px-3 py-4 font-serif text-lg leading-loose dark:bg-zinc-800 sm:text-xl ${faza === 'tnij' ? 'touch-none cursor-crosshair' : ''} ${peklo ? 'overflow-visible' : ''}`}
        style={{ borderColor: '#d6c7a1' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        data-testid="pasek"
      >
        <span className={`inline-block transition-transform duration-500 ${peklo ? '-translate-x-1 -rotate-2' : ''}`}>{p.przed}</span>{' '}
        {peklo && <span aria-hidden className="mx-0.5 inline-block font-sans text-amber-600">⚡</span>}
        <span className={`inline-block transition-transform duration-500 ${peklo ? 'translate-x-1 rotate-2' : ''}`}>
          <span className="relative inline-block">
            {faza === 'tnij' ? (
              <span ref={box} className="relative inline-block px-2 py-0.5" data-testid="do-wyciecia">
                {p.slowo}
                <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                  <rect x="0" y="0" width="100%" height="100%" fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="5 4" />
                  {pts?.map((q, k) =>
                    zaliczone.has(k) ? <circle key={k} cx={q.x} cy={q.y} r={2.2} fill={color} /> : null
                  )}
                </svg>
                {nozyczki && wymiar && (
                  <Scissors className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2" style={{ left: nozyczki.x, top: nozyczki.y, color }} aria-hidden />
                )}
              </span>
            ) : (
              <span
                data-drop="luka"
                className="relative inline-block min-w-[4.5rem] border-2 border-dashed px-2 py-0.5 text-center"
                style={{ borderColor: wklejone ? 'transparent' : color, background: hover ? `${color}30` : wklejone ? `${color}18` : undefined }}
                data-testid="luka"
              >
                {wklejone ?? ' '}
                {faza === 'wklej' && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-0 px-2 py-0.5 transition-all duration-700 ease-in"
                    style={{ transform: spada ? 'translateY(70px) rotate(24deg)' : 'none', opacity: spada ? 0 : 1 }}
                  >
                    {p.slowo}
                  </span>
                )}
              </span>
            )}
          </span>
          {pustyZnak ? '' : ' '}
          {p.po}
        </span>
      </div>
      <div className="mt-1 flex min-h-[2rem] flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        {faza === 'tnij' ? (
          <>
            <span>
              <Scissors className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              Poprowadź palcem nożyczki po przerywanej linii dookoła słowa. {postep > 0 && `Wycięte: ${Math.min(100, Math.round(postep / 0.8))}%`}
            </span>
            <button type="button" onClick={onCut} className="border px-2 py-1 text-xs">
              Wytnij bez wodzenia
            </button>
          </>
        ) : (
          <span>{faza === 'wklej' ? 'Słowo odpadło. Wklej w lukę inne o tym samym znaczeniu.' : ' '}</span>
        )}
      </div>
    </div>
  );
}

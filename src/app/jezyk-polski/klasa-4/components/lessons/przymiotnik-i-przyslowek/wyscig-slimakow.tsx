'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Check, Flag, RotateCcw } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import {
  KAFELKI,
  KARTY,
  ODCINKI,
  REKA,
  coSieStalo,
  fragment,
  ileZaliczonych,
  postepRywala,
  probkuj,
  prowadz,
  przejazd,
  punkt,
  type KartaId,
  type OdcinekId,
  type Probki,
  type Przejazd,
} from './wyscig';

/**
 * L16 blok 1 — „Wyścig ślimaków”. Przed odcinkiem dziecko kładzie na ślimaku
 * kartę z ręki (przeciągnięcie na tor albo stuknięcie), potem prowadzi go
 * palcem po drodze. Karta ustawia, JAK ślimak pełznie: tempo, kołysanie,
 * przyczepność, stuk muszli. Wynik zależy tylko od karty — palec wyznacza
 * drogę, rywal rusza się w proporcji do ślimaka dziecka. Pięć odcinków:
 * prosta z rywalem, lód na zakręcie, śpiący pies, wąska kładka i finał,
 * w którym dziecko składa „szybciej” z kafelków.
 */

export interface StanWyscigu {
  zaliczone: Partial<Record<OdcinekId, KartaId>>;
}

interface Props {
  color: string;
  initial?: StanWyscigu | null;
  onState?: (s: StanWyscigu) => void;
  onComplete: () => void;
}

const W = 240;
const H = 320;
const SLIMAK = '#d97706';
const RYWAL = '#64748b';

export function WyscigSlimakow({ color, initial, onState, onComplete }: Props) {
  const [stan, setStan] = useState<StanWyscigu>(() => initial ?? { zaliczone: {} });
  const zaliczonych = ileZaliczonych(stan.zaliczone);
  const gotowe = zaliczonych === ODCINKI.length;
  const [etap, setEtap] = useState(() => Math.min(zaliczonych, ODCINKI.length - 1));
  const o = ODCINKI[etap];
  const droga = useMemo(() => probkuj(o.d), [o.d]);
  const drogaRywala = useMemo(() => (o.rywal ? probkuj(o.rywal.d) : null), [o.rywal]);

  const [karta, setKarta] = useState<KartaId | null>(() => (gotowe ? stan.zaliczone.final ?? null : null));
  const [frac, setFrac] = useState(() => (gotowe ? 1 : 0));
  const [koniec, setKoniec] = useState<Przejazd | null>(() => (gotowe ? { wynik: 'meta' } : null));
  const [ciej, setCiej] = useState(gotowe);
  const [msg, setMsg] = useState(() => (gotowe ? 'Wszystkie odcinki przejechane.' : ''));
  const fracRef = useRef(frac);
  const celRef = useRef(frac);
  const wcisniety = useRef(false);
  const svg = useRef<SVGSVGElement>(null);

  const zeruj = () => {
    fracRef.current = 0;
    celRef.current = 0;
    setFrac(0);
    setKoniec(null);
    setKarta(null);
    setMsg('');
  };

  // Ślimak sunie do celu wyznaczonego palcem, w tempie karty.
  useEffect(() => {
    if (!karta || koniec) return;
    const p = przejazd(o, karta);
    const doKonca = p.wynik === 'upadek' ? p.przy : 1;
    const tempo = KARTY[karta].tempo;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const cel = Math.min(celRef.current, doKonca);
      if (fracRef.current < cel) {
        const nf = Math.min(cel, fracRef.current + (tempo * dt) / droga.len);
        fracRef.current = nf;
        setFrac(Math.round(nf * 10000) / 10000);
        if (nf >= doKonca - 1e-6) {
          zakoncz(p, karta);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // zakoncz czyta bieżący stan, a efekt startuje tylko przy nowej karcie albo odcinku
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [karta, koniec, o, droga.len]);

  function zakoncz(p: Przejazd, k: KartaId) {
    setKoniec(p);
    setMsg(coSieStalo(o, k, p));
    if (p.wynik !== 'meta') return;
    const zaliczone = { ...stan.zaliczone, [o.id]: k };
    const s = { zaliczone };
    setStan(s);
    onState?.(s);
    if (ileZaliczonych(zaliczone) === ODCINKI.length && !gotowe) onComplete();
  }

  function poloz(id: string) {
    if (gotowe) return;
    if (id === 'ciej') {
      dolacz();
      return;
    }
    if (koniec || fracRef.current > 0) {
      setMsg('W biegu karty się nie zmienia. Zacznij odcinek od startu, jeśli chcesz inną.');
      return;
    }
    const k = id as KartaId;
    setKarta(k);
    setMsg(`Na ślimaku leży karta „${KARTY[k].slowo}”. Prowadź go palcem po drodze do mety.`);
  }

  function dolacz() {
    if (ciej) return;
    setCiej(true);
    setMsg(`„${KAFELKI.rdzen}” + „${KAFELKI.koncowka}” = „${KAFELKI.razem}”. Nowa karta jest w ręce.`);
  }

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (id === 'ciej') {
        if (target === 'kafel-szybko') dolacz();
        return;
      }
      if (target === 'slimak') poloz(id);
    },
    onTap: poloz,
    disabled: gotowe,
  });

  // Palec prowadzi ślimaka: liczy się punkt drogi najbliższy palcowi.
  const doPlanszy = (e: ReactPointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const prowadzPalcem = (e: ReactPointerEvent) => {
    const { x, y } = doPlanszy(e);
    celRef.current = prowadz(droga, celRef.current, x, y);
  };
  const down = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.button > 0 || gotowe || koniec) return;
    if (!karta) {
      setMsg('Najpierw połóż na ślimaku kartę z ręki.');
      return;
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* bez przechwycenia też działa */
    }
    wcisniety.current = true;
    prowadzPalcem(e);
  };
  const move = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (wcisniety.current) prowadzPalcem(e);
  };
  const up = () => {
    wcisniety.current = false;
  };
  const klawisz = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!karta || koniec || gotowe) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      celRef.current = Math.min(1, celRef.current + 30 / droga.len);
    }
  };

  const dalej = () => {
    setEtap((n) => Math.min(n + 1, ODCINKI.length - 1));
    zeruj();
  };

  const ch = karta ? KARTY[karta].chwiej : 5;
  const ja = punkt(droga, frac, ch);
  const ryw = drogaRywala ? punkt(drogaRywala, karta ? postepRywala(o, karta, frac) : 0, 4) : null;
  const slad = useMemo(() => {
    const kroki: string[] = [];
    const n = Math.ceil((frac * droga.len) / 4);
    for (let j = 0; j <= n; j++) {
      const q = punkt(droga, Math.min(frac, (j * 4) / droga.len), ch);
      kroki.push(`${q.x},${q.y}`);
    }
    return kroki.join(' ');
  }, [frac, droga, ch]);

  const upadek = koniec?.wynik === 'upadek' ? koniec.rodzaj : null;
  const reka: KartaId[] = o.id === 'final' && ciej ? [...REKA, 'szybciej'] : REKA;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          Odcinek {etap + 1} z {ODCINKI.length} · {o.nazwa}
        </p>
        <p className="text-xs text-muted-foreground" aria-hidden>
          {ODCINKI.map((x) => (stan.zaliczone[x.id] ? '●' : '○')).join(' ')}
        </p>
      </div>
      <p className="mt-1 min-h-[3rem] text-sm leading-relaxed sm:text-base">{o.opis}</p>

      <div className="mt-2 grid gap-4 md:grid-cols-[minmax(0,300px)_1fr] md:items-start">
        <div data-drop="slimak" className="relative mx-auto w-full max-w-[300px] border" style={{ outline: drag.hover === 'slimak' ? `3px solid ${color}` : undefined }}>
          <svg
            ref={svg}
            viewBox={`0 0 ${W} ${H}`}
            className={`block h-auto w-full touch-none select-none ${karta && !koniec ? 'cursor-grab' : ''}`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onKeyDown={klawisz}
            tabIndex={0}
            role="img"
            aria-label={`Tor: ${o.nazwa}. Ślimak przejechał ${Math.round(frac * 100)} procent drogi.`}
            data-testid="tor"
          >
            <rect width={W} height={H} fill="#eef3e2" />
            <Tlo o={o.id} droga={droga} obudzony={upadek === 'pies'} />
            {drogaRywala && <path d={o.rywal!.d} stroke="#e9dcc0" strokeWidth={26} strokeLinecap="round" fill="none" />}
            {o.id !== 'kladka' && <path d={o.d} stroke="#e9dcc0" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
            {o.id === 'kladka' && <Kladka />}
            <path d={o.d} fill="none" stroke="none" data-droga="" />

            {o.id === 'lod' && o.strefa && <polyline points={fragment(droga, o.strefa[0], o.strefa[1])} stroke="#cfe8f5" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.95} />}
            <Meta x={(o.rywal ? 70 : punkt(droga, 1).x - 20)} y={punkt(droga, 1).y - 4} w={o.rywal ? 100 : 40} />
            <polyline points={slad} stroke="#a3a3a3" strokeWidth={1.4} fill="none" opacity={0.7} strokeDasharray="1 2" />
            {ryw && <Slimak x={ryw.x} y={ryw.y} kat={ryw.kat} kolor={RYWAL} />}
            <Slimak x={ja.x} y={ja.y} kat={ja.kat} kolor={SLIMAK} upadek={upadek} />
          </svg>
          {karta && (
            <span className="pointer-events-none absolute left-2 top-2 border bg-white/90 px-2 py-0.5 font-serif text-sm dark:bg-zinc-900/90" style={{ borderColor: SLIMAK }}>
              na ślimaku: {KARTY[karta].slowo}
            </span>
          )}
          {o.rywal?.karta && (
            <span className="pointer-events-none absolute right-2 top-2 border bg-white/90 px-2 py-0.5 font-serif text-sm dark:bg-zinc-900/90" style={{ borderColor: RYWAL }}>
              rywal: {KARTY[o.rywal.karta].slowo}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ręka kart</p>
          <div className="mt-1 grid grid-cols-3 gap-1.5">
            {reka.map((k) => (
              <button
                key={k}
                type="button"
                {...drag.bind(k)}
                className="touch-none border-2 px-1 py-2 text-center font-serif text-base disabled:opacity-60"
                style={karta === k ? { borderColor: SLIMAK, background: '#fef3c7', color: '#78350f' } : undefined}
                aria-pressed={karta === k}
                data-testid={`karta-${k}`}
              >
                {KARTY[k].slowo}
              </button>
            ))}
          </div>

          {o.id === 'final' && !gotowe && (
            <div className="mt-3 border border-dashed p-2">
              <p className="text-xs text-muted-foreground">Karta z dwoma kafelkami — połącz je:</p>
              <div className="mt-1 flex items-center gap-1 font-serif text-base">
                <span data-drop="kafel-szybko" className="border-2 px-2 py-1" style={{ borderColor: drag.hover === 'kafel-szybko' ? color : undefined }}>
                  {ciej ? KAFELKI.razem : KAFELKI.rdzen}
                </span>
                {!ciej && (
                  <button type="button" {...drag.bind('ciej')} className="touch-none border-2 border-dashed px-2 py-1" data-testid="kafel-ciej">
                    {KAFELKI.koncowka}
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="mt-3 min-h-[4.5rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
            {msg || 'Przeciągnij kartę na tor albo ją stuknij. Potem prowadź ślimaka palcem od startu do mety.'}
          </p>

          <div className="mt-1 flex min-h-[2.5rem] flex-wrap gap-2">
            {!gotowe && (frac > 0 || koniec) && (
              <button type="button" onClick={zeruj} className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm">
                <RotateCcw className="h-4 w-4" aria-hidden /> Od startu odcinka
              </button>
            )}
            {koniec?.wynik === 'meta' && etap < ODCINKI.length - 1 && (
              <button type="button" onClick={dalej} className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm font-semibold text-white" style={{ background: color, borderColor: color }}>
                <Flag className="h-4 w-4" aria-hidden /> Dalej: {ODCINKI[etap + 1].nazwa.toLowerCase()}
              </button>
            )}
          </div>
        </div>
      </div>

      {gotowe && (
        <p className="mt-3 flex items-start gap-2 border-t pt-3 text-sm leading-relaxed sm:text-base">
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
          <span>
            Twoje karty: {ODCINKI.map((x) => `„${KARTY[stan.zaliczone[x.id]!].slowo}”`).join(', ')}. Żadna nie mówiła, kim jest ślimak ani jaki ma
            kolor muszli — każda mówiła, <strong>jak</strong> się porusza. Na mecie czeka cukiernik.
          </span>
        </p>
      )}

      <DragGhost drag={drag.drag}>
        {drag.drag && (
          <span className="block border-2 bg-amber-50 px-3 py-1 font-serif text-base" style={{ borderColor: SLIMAK }}>
            {drag.drag.id === 'ciej' ? KAFELKI.koncowka : KARTY[drag.drag.id as KartaId].slowo}
          </span>
        )}
      </DragGhost>
    </div>
  );
}

/** Ślimak zwrócony w górę (kat 0); upadek przesuwa go w bok w jego własnym układzie. */
function Slimak({ x, y, kat, kolor, upadek }: { x: number; y: number; kat: number; kolor: string; upadek?: string | null }) {
  const schowany = upadek === 'pies';
  const zsuw =
    upadek === 'poslizg'
      ? { transform: 'translate(38px, 6px) rotate(150deg)', opacity: 0.8 }
      : upadek === 'woda'
        ? { transform: 'translate(16px, 0px) scale(0.8)', opacity: 0.3 }
        : { transform: 'none', opacity: 1 };
  return (
    <g transform={`translate(${x} ${y}) rotate(${kat})`}>
      <g style={{ ...zsuw, transition: 'transform 700ms ease-in, opacity 700ms ease-in' }}>
        {!schowany && (
          <>
            <path d="M-4 8 Q-5 -6 0 -12 Q5 -6 4 8 Z" fill="#e7d3b0" stroke="#78716c" strokeWidth={0.8} />
            <path d="M-2 -11 L-4 -18 M2 -11 L4 -18" stroke="#78716c" strokeWidth={0.8} />
            <circle cx={-4} cy={-18} r={1} fill="#78716c" />
            <circle cx={4} cy={-18} r={1} fill="#78716c" />
          </>
        )}
        <circle cx={0} cy={3} r={7} fill={kolor} stroke="#44403c" strokeWidth={0.9} opacity={0.9} />
        <path d="M0 3 m-4 0 a4 4 0 1 0 4 -4 a2.6 2.6 0 1 0 -2.4 3" fill="none" stroke="#44403c" strokeWidth={0.8} />
      </g>
      {upadek === 'woda' && (
        <g fill="none" stroke="#60a5fa" strokeWidth={1}>
          <circle cx={16} cy={0} r={6} />
          <circle cx={16} cy={0} r={11} opacity={0.6} />
        </g>
      )}
    </g>
  );
}

function Meta({ x, y, w }: { x: number; y: number; w: number }) {
  const n = Math.round(w / 6);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * 6} y={y - 3} width={6} height={3} fill={i % 2 ? '#fafaf9' : '#44403c'} />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <rect key={`b${i}`} x={x + i * 6} y={y} width={6} height={3} fill={i % 2 ? '#44403c' : '#fafaf9'} />
      ))}
    </g>
  );
}

function Kladka() {
  return (
    <g>
      <path d="M120 296 L120 205 M120 125 L120 30" stroke="#e9dcc0" strokeWidth={30} strokeLinecap="round" fill="none" />
      <rect x={0} y={120} width={W} height={92} fill="#cfe3f1" />
      <path d="M10 140 q10 -5 20 0 t20 0 M150 160 q10 -5 20 0 t20 0 M30 190 q10 -5 20 0 t20 0 M170 196 q10 -5 20 0 t20 0" stroke="#93c5fd" strokeWidth={1.2} fill="none" />
      <rect x={116} y={112} width={8} height={108} fill="#c8a27a" stroke="#78716c" strokeWidth={0.8} />
      <path d="M116 140 H124 M116 170 H124 M116 200 H124" stroke="#78716c" strokeWidth={0.6} />
    </g>
  );
}

/** Tło odcinka: rów przy lodzie, pies przy drodze, kępki trawy. */
function Tlo({ o, droga, obudzony }: { o: OdcinekId; droga: Probki; obudzony: boolean }) {
  return (
    <g>
      <g stroke="#a3b18a" strokeWidth={1} fill="none">
        <path d="M20 60 l3 -7 l3 7 M206 250 l3 -7 l3 7 M30 270 l3 -7 l3 7 M210 70 l3 -7 l3 7" />
      </g>
      {o === 'lod' && (
        <g>
          <ellipse cx={226} cy={176} rx={20} ry={44} fill="#b8a07a" opacity={0.55} />
          <path d="M214 140 q8 36 0 72" stroke="#8b7355" strokeWidth={1} fill="none" />
        </g>
      )}
      {o === 'pies' && <Pies obudzony={obudzony} x={punkt(droga, 0.5).x - 40} y={punkt(droga, 0.5).y - 46} />}
    </g>
  );
}

function Pies({ x, y, obudzony }: { x: number; y: number; obudzony: boolean }) {
  return (
    <g transform={`translate(${Math.round(x)} ${Math.round(y)}) scale(1.5)`}>
      <path d="M22 8 q12 0 10 -10" fill="none" stroke="#57534e" strokeWidth={2} strokeLinecap="round" />
      <ellipse cx={4} cy={6} rx={22} ry={11} fill="#e2c295" stroke="#57534e" strokeWidth={1} />
      <ellipse cx={10} cy={2} rx={7} ry={5} fill="#b9895c" />
      <ellipse cx={-22} cy={15} rx={6} ry={3} fill="#e2c295" stroke="#57534e" strokeWidth={0.8} />
      <ellipse cx={-12} cy={16} rx={6} ry={3} fill="#e2c295" stroke="#57534e" strokeWidth={0.8} />
      <circle cx={-20} cy={2} r={10} fill="#e2c295" stroke="#57534e" strokeWidth={1} />
      <ellipse cx={-30} cy={7} rx={7} ry={4.5} fill="#f1dcbc" stroke="#57534e" strokeWidth={0.8} />
      <circle cx={-36} cy={6} r={1.8} fill="#292524" />
      <path d="M-20 -7 q9 -1 9 9 q-1 9 -7 8 q-4 -6 -2 -17 z" fill="#a8764c" stroke="#57534e" strokeWidth={0.8} />
      {obudzony ? (
        <>
          <circle cx={-25} cy={0} r={1.8} fill="#292524" />
          <path d="M-30 -14 l-2 -6 M-24 -16 l0 -7 M-18 -15 l2 -6" stroke="#dc2626" strokeWidth={1.2} />
        </>
      ) : (
        <>
          <path d="M-28 0 q2.5 2 5 0" stroke="#292524" strokeWidth={1} fill="none" />
          <path d="M-10 -14 q3 -2 6 0 M-2 -21 q3 -2 6 0" stroke="#78716c" strokeWidth={0.9} fill="none" />
        </>
      )}
    </g>
  );
}

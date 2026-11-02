'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { MED_LAND } from '../grecja-gory-i-morze/geo-srodziemne';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import {
  CITIES,
  JOURNEYS,
  LETTERS,
  OLD_GMINY,
  ROUTES,
  getCity,
  gminyAfter,
  judgeLetter,
  judgeRoute,
  judgeTap,
  onTradeRoute,
  type CityId,
  type XY,
} from './pawel';

type Phase = 'podroz' | 'koniec-podrozy' | 'listy' | 'szlaki' | 'gotowe';

const VIEWS = {
  wschod: [338, 216, 230, 184],
  calosc: [238, 168, 330, 264],
} as const;
type Box = readonly [number, number, number, number];

const SEA = '#dbe8ef';
const LAND = '#efe8d6';

/**
 * Blok 1 — **Szlakiem Pawła**. Gesty: stuka miasto nazwane w dzienniku podróży
 * (statek albo wędrowiec płynie tam sam, w nowym mieście wyrasta gmina);
 * po trzeciej podróży przeciąga listy Pawła do gmin według adresata — list
 * do Rzymian odsłania gminę, która była w Rzymie przed Pawłem; po drodze do
 * Rzymu pokazuje szlaki i stuka ten, którym wiara mogła dojść do Rzymu.
 * `onDone` po trafnym szlaku.
 */
export function SzlakWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('podroz');
  const [j, setJ] = useState(0);
  const [s, setS] = useState(0);
  const [trail, setTrail] = useState<{ a: XY; b: XY; journey: number }[]>([]);
  const [moving, setMoving] = useState<{ a: XY; b: XY; by: 'morze' | 'lad'; t: number } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [wrongCity, setWrongCity] = useState<CityId | null>(null);
  const [letters, setLetters] = useState<Record<string, CityId>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [route, setRoute] = useState<string | null>(null);
  const [routeMsg, setRouteMsg] = useState<string | null>(null);
  const reported = useRef(false);

  const journey = JOURNEYS[Math.min(j, JOURNEYS.length - 1)];
  const step = journey.steps[s];
  const visitedCities: CityId[] = [journey.start, ...journey.steps.slice(0, s).map((x) => x.to)];
  const here = getCity(s === 0 ? journey.start : journey.steps[s - 1].to).xy;
  const romeKnown = Boolean(letters['l-rzy']) || j >= 3;
  const gminy = new Set<CityId>(phase === 'szlaki' || phase === 'gotowe' ? gminyAfter(3, JOURNEYS[3].steps.length) : gminyAfter(Math.min(j, 3), phase === 'podroz' ? s : journey.steps.length));
  if (romeKnown) gminy.add('rzym');
  const wide = phase === 'listy' || j >= 3;

  // Kadr mapy płynie między widokiem wschodu a całym morzem.
  const [box, setBox] = useState<Box>(VIEWS.wschod);
  useEffect(() => {
    const from = box;
    const to = wide ? VIEWS.calosc : VIEWS.wschod;
    if (from.every((v, i) => v === to[i])) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / 900);
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      setBox(from.map((v, i) => Math.round((v + (to[i] - v) * e) * 10) / 10) as unknown as Box);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wide]);

  // Napisy mają stałą wielkość na ekranie — liczymy je z szerokości mapy w pikselach.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [px, setPx] = useState(600);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setPx(e.contentRect.width || 600));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const u = box[2] / px; // jednostki mapy na piksel ekranu

  // Ruch statku albo wędrowca.
  useEffect(() => {
    if (!moving || moving.t >= 1) return;
    let raf = 0;
    const t0 = performance.now() - moving.t * 1;
    const dist = Math.hypot(moving.b[0] - moving.a[0], moving.b[1] - moving.a[1]);
    const dur = Math.max(600, Math.min(1500, dist * 18));
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      setMoving((m) => (m ? { ...m, t } : m));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moving?.a, moving?.b]);

  const arrived = !moving || moving.t >= 1;

  const tapCity = (id: CityId) => {
    if (phase !== 'podroz' || !step || !arrived) return;
    const v = judgeTap(step, id, visitedCities);
    if (!v.ok) {
      setMsg(v.message);
      setWrongCity(id);
      return;
    }
    setMsg(null);
    setWrongCity(null);
    const b = getCity(step.to).xy;
    setMoving({ a: here, b, by: step.by, t: 0 });
    setTrail((tr) => [...tr, { a: here, b, journey: j }]);
    if (s + 1 >= journey.steps.length) {
      setS(s + 1);
      setPhase('koniec-podrozy');
    } else setS(s + 1);
  };

  const nextJourney = () => {
    if (j === 2) {
      setPhase('listy');
      return;
    }
    if (j === 3) {
      setPhase('szlaki');
      return;
    }
    setJ(j + 1);
    setS(0);
    setMoving(null);
    setPhase('podroz');
  };

  const dropLetter = (id: string, target: string | null) => {
    setPicked(null);
    if (!target?.startsWith('c:')) return;
    const v = judgeLetter(id, target.slice(2) as CityId);
    if (!v.ok) {
      setMsg(v.message);
      return;
    }
    setMsg(null);
    setLetters((l) => ({ ...l, [id]: target.slice(2) as CityId }));
  };
  const { drag, hover, bind } = useDragToken({
    onDrop: dropLetter,
    onTap: (id) => setPicked((p) => (p === id ? null : id)),
    disabled: phase !== 'listy',
  });
  const lettersDone = LETTERS.every((l) => letters[l.id]);

  const startRome = () => {
    setJ(3);
    setS(0);
    setMoving(null);
    setPhase('podroz');
  };

  const tapRoute = (id: string) => {
    if (phase !== 'szlaki') return;
    setRoute(id);
    const v = judgeRoute(id);
    if (!v.ok) {
      setRouteMsg(v.message);
      return;
    }
    setRouteMsg(null);
    setPhase('gotowe');
    if (!reported.current) {
      reported.current = true;
      onDone();
    }
  };

  const tokenAt: XY = moving ? [moving.a[0] + (moving.b[0] - moving.a[0]) * moving.t, moving.a[1] + (moving.b[1] - moving.a[1]) * moving.t] : here;
  const tokenBy = moving?.by ?? 'lad';
  const fs = 12 * u;
  const allGminy = [...gminy];
  const onRoute = allGminy.filter(onTradeRoute).length;

  return (
    <div className="space-y-3">
      {/* Dziennik — nad mapą, żeby zdanie i mapa były widoczne naraz. */}
      <div className="min-h-[5.5rem] border-l-2 bg-white p-3 text-sm leading-relaxed dark:bg-zinc-900" style={{ borderColor: color }}>
        {phase === 'podroz' && step && (
          <>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
              {journey.title} · dziennik
            </p>
            <p>{step.log}</p>
            <p className="mt-1 text-xs text-muted-foreground">Stuknij na mapie miasto, o którym mówi zdanie.</p>
          </>
        )}
        {phase === 'koniec-podrozy' && (
          <>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
              {journey.title} · koniec
            </p>
            <p>
              {j < 3
                ? `Na mapie stoi już ${allGminy.length} ${plural(allGminy.length, { one: 'gmina', few: 'gminy', many: 'gmin' })} — małych wspólnot chrześcijan, które spotykały się w domach.`
                : 'Paweł dotarł do Rzymu jako więzień. Według tradycji zginął tam za panowania Nerona.'}
            </p>
            <button type="button" onClick={nextJourney} className="mt-2 border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
              {j < 2 ? 'Następna podróż' : j === 2 ? 'Paweł pisze listy' : 'Pokaż szlaki imperium'}
            </button>
          </>
        )}
        {phase === 'listy' && (
          <p>
            Paweł nie mógł być wszędzie, więc pisał do gmin listy. Dziś są częścią Biblii.{' '}
            <strong>Zanieś każdy list do miasta, do którego go wysłano</strong> — przeciągnij go na mapę albo stuknij list,
            a potem miasto.
          </p>
        )}
        {(phase === 'szlaki' || phase === 'gotowe') && (
          <p>
            Na mapie są teraz główne drogi i szlaki statków. {onRoute} z {allGminy.length}{' '}
            {plural(allGminy.length, { one: 'gminy', few: 'gmin', many: 'gmin' })} leży w porcie albo przy rzymskiej drodze — tam,
            gdzie stale przejeżdżali kupcy, żołnierze i podróżni.{' '}
            {phase === 'szlaki' && (
              <strong>Gmina w Rzymie powstała, zanim przybył tam Paweł. Stuknij szlak, którym nowa wiara mogła dotrzeć do Rzymu.</strong>
            )}
          </p>
        )}
      </div>

      {phase === 'listy' && (
        <div className="flex flex-wrap gap-2 border border-dashed p-2">
          {LETTERS.filter((l) => !letters[l.id]).map((l) => (
            <button
              key={l.id}
              type="button"
              {...bind(l.id)}
              className={cn('touch-none border-2 bg-[#fbf6e9] px-2.5 py-1.5 text-left text-sm dark:bg-zinc-900', drag?.id === l.id && 'opacity-30')}
              style={{ borderColor: picked === l.id ? color : undefined }}
            >
              ✉ {l.title}
            </button>
          ))}
          {lettersDone && <span className="text-sm text-muted-foreground">Wszystkie listy doręczone.</span>}
        </div>
      )}

      <div ref={wrapRef} className="mx-auto max-w-[640px] touch-manipulation border" style={{ background: SEA }}>
        <svg viewBox={box.join(' ')} className="block h-auto w-full select-none" role="img" aria-label="Mapa wschodniej części Morza Śródziemnego z trasami podróży Pawła">
          <path d={MED_LAND} fill={LAND} stroke="#b8ab8a" strokeWidth={0.6 * u} />

          {(phase === 'szlaki' || phase === 'gotowe') &&
            ROUTES.map((rt) => {
              const d = 'M' + rt.pts.map((p) => p.join(',')).join('L');
              const active = route === rt.id;
              const good = active && phase === 'gotowe';
              return (
                <g key={rt.id} data-route={rt.id} onClick={() => tapRoute(rt.id)} className={phase === 'szlaki' ? 'cursor-pointer' : undefined}>
                  <path d={d} fill="none" stroke="transparent" strokeWidth={16 * u} />
                  <path
                    d={d}
                    fill="none"
                    stroke={good ? color : active ? 'var(--destructive)' : rt.kind === 'droga' ? '#8a6a3a' : '#3f7ea6'}
                    strokeWidth={(active ? 3.2 : 2) * u}
                    strokeDasharray={rt.kind === 'morze' ? `${5 * u} ${4 * u}` : undefined}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

          {trail.map((t, i) => (
            <line
              key={i}
              x1={t.a[0]}
              y1={t.a[1]}
              x2={t.b[0]}
              y2={t.b[1]}
              stroke={color}
              strokeOpacity={t.journey === j && phase !== 'szlaki' && phase !== 'gotowe' ? 0.9 : 0.35}
              strokeWidth={1.6 * u}
              strokeDasharray={`${3 * u} ${2.5 * u}`}
            />
          ))}

          {CITIES.map((c) => {
            const isG = gminy.has(c.id);
            const old = OLD_GMINY.includes(c.id) || c.id === 'rzym' || c.id === 'puteoli';
            const hidden = c.id === 'rzym' && !wide;
            if (hidden) return null;
            const [x, y] = c.xy;
            const lx = c.label === 'l' ? x - 6 * u : c.label === 'r' ? x + 6 * u : x;
            const ly = c.label === 't' ? y - 7 * u : c.label === 'b' ? y + 7 * u + fs * 0.7 : y + fs * 0.35;
            const anchor = c.label === 'l' ? 'end' : c.label === 'r' ? 'start' : 'middle';
            const dropId = phase === 'listy' ? `c:${c.id}` : undefined;
            const isHover = hover === dropId && dropId;
            return (
              <g
                key={c.id}
                data-drop={dropId}
                onClick={() => (phase === 'listy' ? picked && dropLetter(picked, `c:${c.id}`) : tapCity(c.id))}
                className={phase === 'podroz' || phase === 'listy' ? 'cursor-pointer' : undefined}
                role={phase === 'podroz' ? 'button' : undefined}
                aria-label={c.name}
              >
                <circle cx={x} cy={y} r={11 * u} fill={isHover ? color : 'transparent'} fillOpacity={0.2} />
                {isG && (
                  <g transform={`translate(${x + (c.label === 'r' ? -9 : 3) * u} ${y - 10 * u}) scale(${u})`}>
                    <path d="M0,6 L4,2 L8,6 L8,11 L0,11 Z" fill={old ? '#fff' : color} stroke={old ? color : '#fff'} strokeWidth={1} />
                  </g>
                )}
                <circle cx={x} cy={y} r={3 * u} fill={wrongCity === c.id ? 'var(--destructive)' : '#2b2b2b'} stroke="#fff" strokeWidth={1 * u} />
                <text
                  x={lx}
                  y={ly}
                  fontSize={fs}
                  textAnchor={anchor}
                  fill="#2b2b2b"
                  stroke={LAND}
                  strokeWidth={3 * u}
                  paintOrder="stroke"
                  fontWeight={isG ? 700 : 400}
                >
                  {c.name}
                </text>
              </g>
            );
          })}

          {phase !== 'listy' && phase !== 'szlaki' && phase !== 'gotowe' && (
            <g transform={`translate(${tokenAt[0]} ${tokenAt[1]}) scale(${u})`} pointerEvents="none">
              {tokenBy === 'morze' ? (
                <>
                  <path d="M-8,2 L8,2 L5,7 L-5,7 Z" fill="#6b4a2b" stroke="#fff" strokeWidth={1} />
                  <path d="M0,1 L0,-11 L7,0 Z" fill="#fff" stroke={color} strokeWidth={1.2} />
                </>
              ) : (
                <circle r={5.5} fill={color} stroke="#fff" strokeWidth={2} />
              )}
            </g>
          )}
        </svg>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 8 11" aria-hidden>
            <path d="M0,6 L4,2 L8,6 L8,11 L0,11 Z" fill={color} />
          </svg>
          gmina założona w podróżach Pawła
        </span>
        <span className="inline-flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 8 11" aria-hidden>
            <path d="M0,6 L4,2 L8,6 L8,11 L0,11 Z" fill="#fff" stroke={color} />
          </svg>
          gmina, która była, zanim przyszedł Paweł
        </span>
      </div>

      {msg && <p className="text-sm text-destructive">{msg}</p>}
      {routeMsg && <p className="text-sm text-destructive">{routeMsg}</p>}

      {phase === 'listy' && letters['l-rzy'] && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          W Rzymie stoi gmina, choć Paweł nigdy tam nie był! Ktoś przyniósł tam nową wiarę wcześniej — może kupiec, żołnierz albo
          niewolnik, który przypłynął statkiem ze wschodu.
        </p>
      )}
      {phase === 'listy' && lettersDone && (
        <button type="button" onClick={startRome} className="border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
          Paweł płynie do Rzymu
        </button>
      )}

      {phase === 'gotowe' && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Tak — tym szlakiem płynęły do Italii statki i ludzie ze wschodu, a z nimi nowe pomysły. Chrześcijaństwo nie szło przez
          pustynie i góry z dala od ludzi: szło <strong>drogami handlu</strong>, od portu do portu i od miasta do miasta, razem
          z kupcami, żołnierzami i podróżnymi. Dzięki rzymskim drogom i spokojnym morzom imperium w ciągu kilkudziesięciu lat
          gminy były już w wielu miastach.
        </p>
      )}

      <DragGhost drag={drag}>
        <span className="block border-2 bg-[#fbf6e9] px-2.5 py-1.5 text-sm" style={{ borderColor: color }}>
          ✉ {LETTERS.find((l) => l.id === drag?.id)?.title}
        </span>
      </DragGhost>
    </div>
  );
}

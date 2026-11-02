'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Play, RotateCcw, School, X } from 'lucide-react';
import { img } from '@/lib/media';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import {
  CENTURY_FLOODS,
  CROSS,
  LIBRARY,
  PLAN_H,
  PLAN_W,
  RYNEK,
  SCHOOL_H,
  SCHOOL_W,
  ZONES,
  floodPolygon,
  isFlooded,
  placementProblem,
  runCentury,
  walkMinutes,
  zoneAt,
  type CenturyResult,
  type Flood,
} from './miasteczko';

/**
 * Blok 3 — **„Gdzie postawić szkołę?”** (dylemat). Gest nowy w kursie:
 * dziecko **stawia budynek na planie i ogląda stulecie w przyspieszeniu**.
 *
 * Łąka nad rzeką kusi: tania, płaska, blisko. Kronika w bibliotece (stuknij
 * budynek — ale nikt nie każe) mówi, że wielka woda przychodzi „za życia co
 * drugiego dziadka” i sięga pod przydrożny krzyż. Po otwarciu szkoły mija sto
 * lat; co wylew, woda rośnie na planie. Wynik to konsekwencja, nie ocena:
 * koszt, droga dzieci i to, ile razy woda weszła do klas. Czas można cofnąć
 * i postawić szkołę jeszcze raz — próby zostają obok siebie do porównania.
 *
 * Blok zalicza się po pierwszym przewinięciu stulecia, gdziekolwiek stoi szkoła.
 */

type Phase = 'place' | 'century' | 'result';

interface Attempt extends CenturyResult {
  n: number;
}

const YEAR_MS = 55;

const PLAN_IMG = img('/images/historia/lekcje/pierwsza-lekcja-historii/plan-miasteczka.jpg');

/** Podpis na akwareli — jasna obwódka pod literami, żeby czytał się na każdym tle. */
const LABEL = {
  fill: '#5c4d38',
  fontWeight: 600,
  stroke: '#fbf6e9',
  strokeWidth: 2.2,
  strokeLinejoin: 'round',
  paintOrder: 'stroke',
} as const;
const FLOOD_PAUSE_MS = 1600;

export function SzkolaNadRzeka({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>('place');
  const [year, setYear] = useState(0);
  const [flood, setFlood] = useState<Flood | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [chronicleOpen, setChronicleOpen] = useState(false);
  const [chronicleRead, setChronicleRead] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const reported = useRef(false);

  const problem = pos ? placementProblem(pos.x, pos.y) : null;

  const toPlan = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    const x = ((clientX - rect.left) / rect.width) * PLAN_W;
    const y = ((clientY - rect.top) / rect.height) * PLAN_H;
    return { x: Math.round(Math.min(PLAN_W - 16, Math.max(16, x))), y: Math.round(Math.min(PLAN_H - 11, Math.max(11, y))) };
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (phase !== 'place') return;
    // Stuknięcie w bibliotekę otwiera kronikę, nie stawia szkoły.
    if ((e.target as Element).closest('[data-library]')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    const p = toPlan(e.clientX, e.clientY);
    if (p) setPos(p);
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const p = toPlan(e.clientX, e.clientY);
    if (p) setPos(p);
  };
  const onPointerUp = () => setDragging(false);

  // Stulecie w przyspieszeniu: rok po roku, z przystankiem przy każdym wylewie.
  useEffect(() => {
    if (phase !== 'century') return;
    if (flood) {
      const t = window.setTimeout(() => setFlood(null), FLOOD_PAUSE_MS);
      return () => window.clearTimeout(t);
    }
    if (year >= 100) {
      const t = window.setTimeout(() => {
        if (!pos) return;
        setAttempts((prev) => [...prev, { ...runCentury(pos.x, pos.y), n: prev.length + 1 }]);
        setPhase('result');
        if (!reported.current) {
          reported.current = true;
          onComplete();
        }
      }, 300);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      const next = year + 1;
      setYear(next);
      const hit = CENTURY_FLOODS.find((f) => f.year === next);
      if (hit) setFlood(hit);
    }, YEAR_MS);
    return () => window.clearTimeout(t);
  }, [phase, year, flood, pos, onComplete]);

  const startCentury = () => {
    if (!pos || problem) return;
    setYear(0);
    setFlood(null);
    setPhase('century');
  };

  const rewind = () => {
    setPhase('place');
    setYear(0);
    setFlood(null);
    setPos(null);
  };

  const last = attempts[attempts.length - 1];
  const schoolWet = !!(pos && flood && isFlooded(pos.x, pos.y, flood.size));
  // Licznik zostaje na planie do końca stulecia — sam wylew miga tylko na chwilę.
  const floodsSoFar = CENTURY_FLOODS.filter((f) => f.year <= year).length;
  const wetSoFar = pos ? CENTURY_FLOODS.filter((f) => f.year <= year && isFlooded(pos.x, pos.y, f.size)).length : 0;

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">
        Miasteczko nad rzeką potrzebuje nowej szkoły. <strong>Ty decydujesz, gdzie stanie.</strong> Przeciągnij palcem po
        planie. Potem otworzysz szkołę i zobaczysz, co się z nią stanie przez sto lat. W bibliotece leży kronika
        miasteczka — możesz do niej zajrzeć.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        {/* Plan — sufit szerokości, żeby na telefonie zmieścił się razem z przyciskiem. */}
        <div className="mx-auto w-full max-w-[560px] lg:sticky lg:top-20">
          <div className="relative overflow-hidden rounded-lg border bg-[#f3efe2]">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${PLAN_W} ${PLAN_H}`}
              className={cn('block h-auto w-full touch-none select-none', phase === 'place' && 'cursor-crosshair')}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              role="img"
              aria-label="Plan wymyślonego miasteczka: na dole rzeka, nad nią szeroka łąka, wyżej rynek z domami, kościół i biblioteka, w lewym górnym rogu las na wzgórzu. Przy drodze na skraju łąki stoi krzyż."
            >
              {/* Malowany plan — ta sama siatka 400 × 300; krzywe terenu w `miasteczko.ts` są do niego dopasowane. */}
              <image href={PLAN_IMG} x={0} y={0} width={PLAN_W} height={PLAN_H} preserveAspectRatio="none" />
              <text x={RYNEK.x + RYNEK.w / 2} y={RYNEK.y + RYNEK.h - 5} textAnchor="middle" fontSize={8} {...LABEL}>
                rynek
              </text>
              {/* Biblioteka z kroniką */}
              <g
                data-library
                role="button"
                tabIndex={0}
                aria-label="Biblioteka — otwórz kronikę miasteczka"
                onClick={() => {
                  setChronicleOpen(true);
                  setChronicleRead(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setChronicleOpen(true);
                    setChronicleRead(true);
                  }
                }}
                className="cursor-pointer"
              >
                <rect
                  x={LIBRARY.x - 1}
                  y={LIBRARY.y - 1}
                  width={LIBRARY.w + 2}
                  height={LIBRARY.h + 2}
                  rx={2}
                  fill="transparent"
                  stroke="#6d5a96"
                  strokeWidth={1}
                  strokeDasharray="3 2"
                />
                <text x={LIBRARY.x + LIBRARY.w / 2} y={LIBRARY.y + LIBRARY.h + 8} textAnchor="middle" fontSize={7.5} {...LABEL} fill="#4c3a70">
                  biblioteka
                </text>
                {!chronicleRead && (
                  <circle cx={LIBRARY.x + LIBRARY.w} cy={LIBRARY.y} r={4} fill={color}>
                    <animate attributeName="r" values="3;5;3" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
              {/* Przydrożny krzyż jest namalowany — tu tylko podpis. */}
              <text x={CROSS.x + 7} y={CROSS.y - 6} fontSize={7.5} {...LABEL} fill="#6b5b45">
                krzyż
              </text>

              {/* Woda w czasie wylewu */}
              <AnimatePresence>
                {flood && (
                  <motion.polygon
                    key={flood.year}
                    points={floodPolygon(flood.size)}
                    fill="#5b9cc4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.55 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  />
                )}
              </AnimatePresence>

              {/* Szkoła */}
              {pos && (
                <g transform={`translate(${pos.x - SCHOOL_W / 2} ${pos.y - SCHOOL_H / 2})`}>
                  <rect
                    width={SCHOOL_W}
                    height={SCHOOL_H}
                    rx={2}
                    fill={problem ? '#fecaca' : schoolWet ? '#93c5fd' : '#fde68a'}
                    stroke={problem ? '#dc2626' : color}
                    strokeWidth={2}
                  />
                  <path d={`M4 ${SCHOOL_H - 4} h${SCHOOL_W - 8}`} stroke={problem ? '#dc2626' : color} strokeWidth={1} />
                  <text x={SCHOOL_W / 2} y={12} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#44403c">
                    szkoła
                  </text>
                </g>
              )}
            </svg>

            {phase !== 'place' && (
              <div className="pointer-events-none absolute left-2 top-2 rounded-md bg-white/90 px-2 py-1 text-sm font-bold tabular-nums shadow-sm dark:bg-zinc-900/90">
                rok {year} <span className="font-normal text-muted-foreground">z 100</span>
                {flood && (
                  <span className="ml-2 font-semibold text-sky-700">
                    {flood.size === 'wielka' ? 'wielka woda!' : 'wylew'}
                  </span>
                )}
                {floodsSoFar > 0 && (
                  <span className="block text-xs font-semibold text-sky-800 dark:text-sky-300">
                    wylewy: {floodsSoFar} · w szkole: {wetSoFar}
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Miasteczko, rzeka i kronika są wymyślone na potrzeby ćwiczenia.</p>
        </div>

        {/* Panel decyzji */}
        <div className="space-y-3">
          {phase === 'place' && (
            <>
              {/* Przycisk nad opisem miejsca: opis pojawia się i zmienia wysokość, a przycisk ma stać w miejscu. */}
              <button
                type="button"
                onClick={startCentury}
                disabled={!pos || !!problem}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: color }}
              >
                <Play className="h-4 w-4" aria-hidden /> Otwórz szkołę i przewiń 100 lat
              </button>
              {pos ? (
                problem ? (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
                    {problem}
                  </p>
                ) : (
                  <dl className="space-y-1 rounded-md border bg-white p-3 text-sm dark:bg-zinc-900">
                    <div>
                      <dt className="inline font-semibold">Miejsce: </dt>
                      <dd className="inline">{ZONES[zoneAt(pos.x, pos.y)].name}</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold">Koszt budowy: </dt>
                      <dd className="inline">{ZONES[zoneAt(pos.x, pos.y)].cost}</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold">Droga z rynku: </dt>
                      <dd className="inline">
                        ok. {walkMinutes(pos.x, pos.y)}{' '}
                        {plural(walkMinutes(pos.x, pos.y), { one: 'minuta', few: 'minuty', many: 'minut' })} pieszo
                      </dd>
                    </div>
                  </dl>
                )
              ) : (
                <p className="text-sm text-muted-foreground">Dotknij planu w miejscu, gdzie ma stanąć szkoła.</p>
              )}
            </>
          )}

          {phase === 'century' && (
            <p className="text-sm leading-relaxed" aria-live="polite">
              {flood
                ? schoolWet
                  ? `Rok ${flood.year}: woda wchodzi do szkoły!`
                  : `Rok ${flood.year}: rzeka wylała — szkoła stoi sucha.`
                : 'Lata mijają. Dzieci przychodzą i odchodzą…'}
            </p>
          )}

          {phase === 'result' && last && (
            <ResultCard result={last} chronicleRead={chronicleRead} onRewind={rewind} />
          )}

          {attempts.length > 1 && (
            <div className="rounded-md border p-3 text-xs">
              <p className="mb-1 font-semibold">Twoje próby</p>
              <ul className="space-y-1">
                {attempts.map((a) => (
                  <li key={a.n}>
                    {a.n}. {ZONES[a.zone].name} · koszt {['', 'niski', 'średni', 'wysoki'][ZONES[a.zone].costLevel]} ·{' '}
                    {a.walk} min · zalana {a.floodedIn.length}×
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>{chronicleOpen && <Chronicle onClose={() => setChronicleOpen(false)} />}</AnimatePresence>
    </div>
  );
}

/** „9, 31 i 58” */
function listYears(years: number[]): string {
  return years.length < 2 ? years.join('') : `${years.slice(0, -1).join(', ')} i ${years[years.length - 1]}`;
}

function ResultCard({
  result,
  chronicleRead,
  onRewind,
}: {
  result: CenturyResult;
  chronicleRead: boolean;
  onRewind: () => void;
}) {
  const wet = result.floodedIn.length;
  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
      <p className="font-semibold">Sto lat minęło.</p>
      {wet > 0 ? (
        <p>
          Woda weszła do szkoły {wet} {plural(wet, { one: 'raz', few: 'razy', many: 'razy' })} — w roku{' '}
          {listYears(result.floodedIn)}. Ławki, książki, podłogi do wymiany; dzieci uczyły się w remizie.{' '}
          {chronicleRead
            ? 'Kronika ostrzegała: wielka woda przychodzi za życia co drugiego dziadka i sięga pod krzyż.'
            : 'A w bibliotece przez cały czas leżała kronika, która o tym mówiła. Zajrzyj do niej.'}
        </p>
      ) : (
        <p>
          Przez sto lat ani razu pod wodą — cztery wylewy przeszły obok. Ale ta sucha szkoła miała swoją cenę: koszt
          budowy {ZONES[result.zone].cost.split(' — ')[0]}, a dzieci szły z rynku ok. {result.walk} min.
        </p>
      )}
      <p>
        Tak działa historia: ludzie, którzy zapisali dawne powodzie, podpowiadają dziś, gdzie nie budować.{' '}
        <strong>Kto zna przeszłość, może przewidzieć skutki swoich decyzji</strong> — choć gotowej odpowiedzi nie dostaje.
      </p>
      <button
        type="button"
        onClick={onRewind}
        className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm font-semibold dark:bg-zinc-900"
      >
        <RotateCcw className="h-4 w-4" aria-hidden /> Cofnij czas i postaw szkołę jeszcze raz
      </button>
    </div>
  );
}

function Chronicle({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Kronika miasteczka"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border bg-[#fbf6e9] p-5 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} className="absolute right-3 top-3 rounded p-1 hover:bg-black/5" aria-label="Zamknij kronikę">
          <X className="h-4 w-4" />
        </button>
        <p className="mb-3 flex items-center gap-2 text-sm font-bold">
          <BookOpen className="h-4 w-4" aria-hidden /> Kronika miasteczka
        </p>
        <div className="space-y-3 font-serif text-[15px] leading-relaxed">
          <p>
            <em>Roku Pańskiego 1813, w dzień Świętego Jana:</em> woda wielka przyszła nocą. Zalała wszystkie łąki nad rzeką i doszła
            aż pod krzyż przy drodze. Siano popłynęło.
          </p>
          <p>
            <em>Po latach, spisane przez następnego kronikarza:</em> znów wielka woda, znów pod sam krzyż. Młyn na łące
            trzeba było stawiać od nowa.
          </p>
          <p>
            <em>Dopisek:</em> Starzy ludzie mówią, że małe wody przychodzą często, a wielka woda —{' '}
            <strong>za życia co drugiego dziadka</strong>. Nie budujcie niżej krzyża.
          </p>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <School className="h-3.5 w-3.5" aria-hidden /> Kronika wymyślona na potrzeby ćwiczenia.
        </p>
      </motion.div>
    </motion.div>
  );
}

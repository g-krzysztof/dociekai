'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { SourcePassport } from '../../source-desk/source-passport';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import { getCorePin } from '../../../lib/timeline/pins';
import { GEO_LAKES, GEO_LAND, GEO_RIVERS, GEO_VIEW } from '../../hist-map/geo-legiony';
import { HYMN, HYMN_BANK, HYMN_FIELDS } from './hymn-dane';
import {
  ALPS,
  CITIES,
  START,
  judgeRoute,
  proj as projLabel,
  routeEvents,
  type P,
  type RouteEvent,
} from './trasa';

const AUDIO = '/audio/historia/lekcje/symbole-narodowe/mazurek-instrumentalny.mp3';

/**
 * L10 blok 3 (źródło) — pieśń Legionów jako źródło: tekst z nagraniem,
 * **paszport pieśni** (kto / kiedy / gdzie / po co) i **trasa z refrenu
 * prowadzona palcem po mapie** — wersy zapalają się, gdy legiony robią to,
 * o czym śpiewają. Na koniec pinezka „Mazurek Dąbrowskiego” (1797); „hymn
 * państwowy” (1927) zawisa sam z zaliczeniem bloku.
 */
export function HymnLegionow({
  color,
  lesson,
  done,
  onComplete,
}: {
  color: string;
  lesson: string;
  done: boolean;
  onComplete: () => void;
}) {
  const [passport, setPassport] = useState(false);
  const [routeOk, setRouteOk] = useState(false);

  return (
    <div className="space-y-5">
      <section className="border p-4 sm:p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          Źródło: pieśń z 1797 roku, dziś hymn
        </p>
        <Lyrics color={color} events={[]} />
        <div className="mt-4 space-y-1">
          <audio controls preload="none" src={AUDIO} className="w-full max-w-md">
            Twoja przeglądarka nie odtwarza dźwięku.
          </audio>
          <p className="text-xs text-muted-foreground">
            Nagranie instrumentalne hymnu — Wikimedia Commons, domena publiczna. Tekst: zwrotka
            pierwsza, refren i zwrotka druga w brzmieniu z ustawy o godle, barwach i hymnie.
          </p>
        </div>
      </section>

      <SourcePassport
        color={color}
        fields={HYMN_FIELDS}
        bank={HYMN_BANK}
        locked={passport}
        onDone={() => setPassport(true)}
        intro={
          <p className="text-sm leading-relaxed">
            Każde źródło ma paszport. Przeczytaj tekst jeszcze raz — odpowiedzi kryją się w nim
            samym. Stuknij karteczkę, potem pole.
          </p>
        }
      />

      {passport && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border p-4 sm:p-5"
        >
          <p className="mb-3 text-sm leading-relaxed">
            Pieśń to też mapa. Śpiewający wiedzą, skąd idą i dokąd. <strong>Poprowadź palcem
            legiony</strong> z Reggio nell&apos;Emilia — miasta, w którym pieśń powstała — tak, jak
            mówi tekst. Wersy zapalą się, gdy zrobisz to, o czym śpiewają.
          </p>
          <TrasaLegionow color={color} onDone={() => setRouteOk(true)} />
        </motion.section>
      )}

      {routeOk && (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="space-y-2 border bg-muted/40 p-4 text-sm leading-relaxed">
            <p>
              W 1797 r. Polski nie było na mapie — podzielili ją sąsiedzi. Legioniści we Włoszech
              śpiewali, że <strong>Polska żyje, dopóki żyją oni</strong>: ludzie, którzy ją
              pamiętają i chcą do niej wrócić. Dąbrowski naprawdę wkroczył z wojskiem do Poznania —
              w 1806 r., razem z armią Napoleona.
            </p>
            <p>
              Państwo wróciło dopiero w 1918 r., a w <strong>1927 r.</strong> pieśń legionów
              została hymnem. Dziś „kiedy my żyjemy” znaczy coś jeszcze: Polska jest taka, jacy są
              jej ludzie — także ty.
            </p>
          </div>
          <PrzypnijPinezke
            pin={getCorePin('hymn')}
            color={color}
            lesson={lesson}
            done={done}
            onPinned={onComplete}
          />
        </motion.section>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- tekst */

function Lyrics({ color, events }: { color: string; events: RouteEvent[] }) {
  const lit = (e?: RouteEvent) => (e ? events.includes(e) : false);
  return (
    <div className="grid gap-x-8 gap-y-3 font-serif text-[15px] leading-snug sm:grid-cols-3">
      {HYMN.map((stanza, i) => (
        <div key={i} className={stanza[0].refrain ? 'italic' : ''}>
          {stanza.map((line) => (
            <p key={line.text}>
              {line.parts
                ? line.parts.map((part) => <Lit key={part.text} on={lit(part.lights)} color={color} text={part.text} />)
                : <Lit on={lit(line.lights)} color={color} text={line.text} />}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function Lit({ on, color, text }: { on: boolean; color: string; text: string }) {
  return (
    <span
      className="rounded-sm transition-colors duration-500"
      style={on ? { background: `${color}26`, color, fontWeight: 600 } : undefined}
    >
      {text}
    </span>
  );
}

/* ---------------------------------------------------------------- trasa */

function TrasaLegionow({ color, onDone }: { color: string; onDone: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [path, setPath] = useState<P[]>([START]);
  // lustro stanu do sędziowania przy puszczeniu palca — ostatnie ruchy mogą nie zdążyć do renderu
  const pathRef = useRef<P[]>([START]);
  const [ok, setOk] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dragging = useRef(false);
  const events = routeEvents(path);
  const head = path[path.length - 1];

  const toSvg = (e: PointerEvent<SVGSVGElement>): P | null => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(m.inverse());
    return [Math.round(q.x * 10) / 10, Math.round(q.y * 10) / 10];
  };

  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (ok) return;
    const p = toSvg(e);
    if (!p) return;
    // chwytamy tylko znacznik — palec na mapie gdzie indziej nic nie rysuje
    if (Math.hypot(p[0] - head[0], p[1] - head[1]) > 34) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    setMessage(null);
  };

  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const p = toSvg(e);
    if (!p) return;
    const last = pathRef.current[pathRef.current.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 5) return;
    pathRef.current = [...pathRef.current, p];
    setPath(pathRef.current);
  };

  const up = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const v = judgeRoute(routeEvents(pathRef.current));
    if (v.ok) {
      setOk(true);
      onDone();
    } else setMessage(v.message);
  };

  const reset = () => {
    pathRef.current = [START];
    setPath([START]);
    setMessage(null);
  };

  const d = 'M' + path.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className="space-y-3">
      <div className="space-y-1 border p-3 font-serif text-[15px] italic leading-snug">
        <p>
          Marsz, marsz, Dąbrowski,{' '}
          <Lit on={events.includes('wlochy')} color={color} text="z ziemi włoskiej do Polski." />
        </p>
        <p>
          <Lit on={events.includes('wisla')} color={color} text="Przejdziem Wisłę, " />
          <Lit on={events.includes('warta')} color={color} text="przejdziem Wartę," />{' '}
          <Lit on={ok} color={color} text="będziem Polakami." />
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${GEO_VIEW.width} ${GEO_VIEW.height}`}
        className="mx-auto block h-auto max-h-[76vh] w-full max-w-[560px] touch-none select-none border bg-sky-100 dark:bg-sky-950"
        role="img"
        aria-label="Mapa od północnych Włoch do ziem polskich. Przeciągnij znacznik legionów."
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <defs>
          <pattern id="alpy-kreski" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#a8a29e" strokeWidth="2" />
          </pattern>
        </defs>
        {GEO_LAND.map((dd, i) => (
          <path key={i} d={dd} fill="#f5f0e6" stroke="#a8a29e" strokeWidth={0.8} />
        ))}
        {GEO_LAKES.map((dd, i) => (
          <path key={i} d={dd} fill="#bae6fd" />
        ))}
        <path
          d={'M' + ALPS.map(([x, y]) => `${x},${y}`).join(' ') + 'Z'}
          fill="url(#alpy-kreski)"
          stroke="#a8a29e"
          strokeWidth={0.8}
        />
        <text x={ALPS[4][0] - 30} y={ALPS[4][1] + 30} fontSize={22} fill="#78716c" fontStyle="italic">
          Alpy
        </text>
        {GEO_RIVERS.map((r) => {
          const key = r.name === 'Wisła' || r.name === 'Warta';
          return (
            <path
              key={r.name}
              d={r.d}
              fill="none"
              stroke={key ? '#0284c7' : '#7dd3fc'}
              strokeWidth={key ? 3 : 1.4}
              strokeLinejoin="round"
            />
          );
        })}
        <RiverLabel name="Wisła" at={[19.0, 52.85]} />
        <RiverLabel name="Warta" at={[17.6, 52.0]} />
        <RiverLabel name="Odra" at={[15.15, 52.2]} faint />
        <RiverLabel name="Dunaj" at={[17.4, 47.75]} faint />
        <RiverLabel name="Pad" at={[11.3, 45.15]} faint />
        <text x={592} y={30} fontSize={17} fill="#78716c" textAnchor="end">
          ziemie polskie
        </text>
        <text x={592} y={50} fontSize={17} fill="#78716c" textAnchor="end">
          w 1797 r. podzielone
        </text>
        {CITIES.map((c) => (
          <g key={c.name}>
            <circle cx={c.p[0]} cy={c.p[1]} r={5} fill="#44403c" />
            <text x={c.p[0] + (c.dx ?? 7)} y={c.p[1] + (c.dy ?? -7)} fontSize={20} fontWeight={600} fill="#292524">
              {c.name}
            </text>
          </g>
        ))}
        <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 8" />
        <g transform={`translate(${head[0]} ${head[1]})`} className={ok ? '' : 'cursor-grab'}>
          {!ok && path.length === 1 && (
            <circle r={22} fill="none" stroke={color} strokeWidth={2} opacity={0.5}>
              <animate attributeName="r" values="14;26;14" dur="1.6s" repeatCount="indefinite" />
            </circle>
          )}
          <circle r={13} fill={color} stroke="#fff" strokeWidth={3} />
        </g>
      </svg>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {!ok && (
          <button
            type="button"
            onClick={reset}
            className="flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Trasa od nowa
          </button>
        )}
        {message && (
          <p className={events.includes('warta') && !ok ? 'text-destructive' : 'text-muted-foreground'} aria-live="polite">
            {message}
          </p>
        )}
        {ok && (
          <p className="flex items-center gap-2" aria-live="polite">
            <Check className="h-4 w-4" style={{ color }} aria-hidden />
            Z ziemi włoskiej przez Alpy, przez Wisłę i Wartę — tak, jak w pieśni.
          </p>
        )}
      </div>
    </div>
  );
}

function RiverLabel({ name, at, faint }: { name: string; at: [number, number]; faint?: boolean }) {
  // prosty rzut jak w trasa.ts — podpisy nie biorą udziału w sędziowaniu
  const [x, y] = projLabel(at[0], at[1]);
  return (
    <text x={x} y={y} fontSize={faint ? 16 : 20} fontStyle="italic" fill={faint ? '#38bdf8' : '#0369a1'} fontWeight={faint ? 400 : 600}>
      {name}
    </text>
  );
}

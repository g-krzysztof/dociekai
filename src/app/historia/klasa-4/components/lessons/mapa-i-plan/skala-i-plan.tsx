'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, Ruler, ZoomIn } from 'lucide-react';
import { getCorePin } from '../../../lib/timeline/pins';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import { KM_PER_PX } from '../../hist-map/geo-polska';
import { KazimierzMap, MAP_COLORS, MAP_H, MAP_W, MapLayers, cityXY } from './mapa-kazimierza';
import {
  KRAKOW_GNIEZNO_KM,
  RULER_SNAP,
  judgeRuler,
  niceScaleKm,
  project,
  type XY,
} from './kazimierz';
import {
  CAMP,
  FOREST,
  GRUNWALD_GEO,
  LAKE,
  LAST_PHASE,
  PHASES,
  PLAN_BOX,
  PLAN_FROM_ZOOM,
  UNITS,
  VILLAGES,
  moveInPhase,
  phaseAt,
  planOpacity,
  shownWidthKm,
  unitAt,
  zoomOf,
  type KmXY,
  type Side,
} from './grunwald';

/**
 * Blok 3 — **Skala i plan** (`symulator`).
 *
 * A. **Linijka podziałki:** dziecko przeciąga oba końce linijki na Kraków
 *    i Gniezno (końce przyklejają się do kropek), liczy kratki po 50 km i wpisuje
 *    odczyt. Sędzia `judgeRuler` sprawdza położenie końców i odczyt (± pół kratki).
 * B. **Przybliżenie:** suwak przybliża mapę na Grunwald (logarytmicznie, ×1…×140);
 *    podziałka zmienia się na żywo, a od ok. ×60 rysunek staje się **planem**
 *    bitwy — wtedy suwak czasu bitwy rusza oddziały i strzałki.
 * C. Pinezka „Grunwald” na Osi dziejów.
 */

const SIDE_COLOR: Record<Side, string> = { zakon: '#33302c', polska: '#b3262b', litwa: '#2f7d4f' };

export function SkalaIPlan({
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
  const [rulerOk, setRulerOk] = useState(false);
  const [battleOver, setBattleOver] = useState(false);

  return (
    <div className="space-y-6">
      <section>
        <h4
          className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
          style={{ color }}
        >
          <Ruler className="h-4 w-4" aria-hidden /> Linijka podziałki
        </h4>
        <RulerStage color={color} onDone={() => setRulerOk(true)} />
      </section>

      {rulerOk && (
        <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <h4
            className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
            style={{ color }}
          >
            <ZoomIn className="h-4 w-4" aria-hidden /> Od mapy do planu
          </h4>
          <ZoomStage color={color} onBattleOver={() => setBattleOver(true)} />
        </motion.section>
      )}

      {battleOver && (
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t pt-4"
        >
          <p className="mb-3 text-sm leading-relaxed">
            Bitwa pod Grunwaldem odbyła się 15 lipca <strong>1410</strong> roku — czterdzieści lat
            po śmierci Kazimierza Wielkiego. Będziesz się jej uczyć w starszych klasach; dziś
            przypnij ją na swojej osi.
          </p>
          <PrzypnijPinezke
            pin={getCorePin('grunwald')}
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

// ─── A. Linijka ────────────────────────────────────────────────────────────────

/** Punkt wskaźnika w układzie współrzędnych `<svg>`. */
function svgPoint(svg: SVGSVGElement, x: number, y: number): XY {
  const pt = svg.createSVGPoint();
  pt.x = x;
  pt.y = y;
  const m = svg.getScreenCTM();
  if (!m) return [x, y];
  const p = pt.matrixTransform(m.inverse());
  return [p.x, p.y];
}

const CITY_SNAP_IDS = [
  'krakow',
  'gniezno',
  'poznan',
  'plock',
  'leczyca',
  'kruszwica',
  'bedzin',
  'sandomierz',
];

function snap(p: XY): XY {
  for (const id of CITY_SNAP_IDS) {
    const c = cityXY(id);
    if (Math.hypot(p[0] - c[0], p[1] - c[1]) <= RULER_SNAP) return c;
  }
  return p;
}

function ScaleBar({
  x,
  y,
  km,
  pxPerKm,
  steps = 2,
}: {
  x: number;
  y: number;
  km: number;
  pxPerKm: number;
  steps?: number;
}) {
  const seg = km * pxPerKm;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect
        x={x - 8}
        y={y - 20}
        width={seg * steps + 44}
        height={34}
        fill="#fffaf0"
        fillOpacity={0.9}
      />
      {Array.from({ length: steps }, (_, i) => (
        <rect
          key={i}
          x={x + i * seg}
          y={y}
          width={seg}
          height={6}
          fill={i % 2 ? '#fff' : MAP_COLORS.ink}
          stroke={MAP_COLORS.ink}
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: steps + 1 }, (_, i) => (
        <text
          key={i}
          x={x + i * seg}
          y={y - 5}
          fontSize={14}
          textAnchor="middle"
          fill={MAP_COLORS.ink}
        >
          {km * i}
        </text>
      ))}
      <text x={x + seg * steps + 8} y={y + 7} fontSize={14} fill={MAP_COLORS.ink}>
        km
      </text>
    </g>
  );
}

const PX_PER_KM = 1 / KM_PER_PX;

function RulerStage({ color, onDone }: { color: string; onDone: () => void }) {
  const [a, setA] = useState<XY>([40, 420]);
  const [b, setB] = useState<XY>([150, 380]);
  const [grab, setGrab] = useState<'a' | 'b' | null>(null);
  const [reading, setReading] = useState('');
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const reported = useRef(false);

  const handlers = (which: 'a' | 'b') => ({
    onPointerDown: (e: PointerEvent<SVGCircleElement>) => {
      if (note?.ok) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setGrab(which);
    },
    onPointerMove: (e: PointerEvent<SVGCircleElement>) => {
      if (grab !== which) return;
      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;
      const [x, y] = svgPoint(svg, e.clientX, e.clientY);
      const p: XY = [Math.max(0, Math.min(MAP_W, x)), Math.max(0, Math.min(MAP_H, y))];
      if (which === 'a') setA(p);
      else setB(p);
    },
    onPointerUp: () => {
      if (grab !== which) return;
      setGrab(null);
      if (which === 'a') setA((p) => snap(p));
      else setB((p) => snap(p));
    },
  });

  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const tick = 50 * PX_PER_KM;
  const ticks = Math.floor(len / tick + 1e-6);

  const check = () => {
    const v = judgeRuler(a, b, reading.trim() === '' ? null : Number(reading.replace(',', '.')));
    if (v.ok) {
      setNote({
        ok: true,
        text: `Tak — z Krakowa do Gniezna jest w linii prostej ok. ${KRAKOW_GNIEZNO_KM} km. Na ekranie to tylko kawałek — podziałka mówi, ile razy teren został pomniejszony. Gdyby jechać wozem po 30 km dziennie, droga zajęłaby ponad 10 dni.`,
      });
      if (!reported.current) {
        reported.current = true;
        onDone();
      }
      return;
    }
    const text =
      v.reason === 'konce'
        ? 'Połóż końce linijki dokładnie na kropkach: jeden na Krakowie, drugi na Gnieźnie. Przyklejają się, gdy są blisko.'
        : v.reason === 'puste'
          ? 'Linijka leży dobrze. Policz kratki i wpisz, ile to kilometrów.'
          : v.reason === 'odczyt-za-malo'
            ? `Za mało. Każda kratka linijki to 50 km — policz je jeszcze raz, razem z kawałkiem na końcu.`
            : `Za dużo. Każda kratka linijki to 50 km, a nie 100 — policz jeszcze raz.`;
    setNote({ ok: false, text });
  };

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start md:gap-4">
      {/* `touch-none` na całej mapie: na telefonie palec na mapie ciągnie linijkę, nie przewija strony. */}
      <div className="touch-none">
        <KazimierzMap label="Mapa z linijką podziałki">
          <ScaleBar x={20} y={490} km={100} pxPerKm={PX_PER_KM} />
          <g
            transform={`translate(${a[0]} ${a[1]}) rotate(${ang})`}
            style={{ pointerEvents: 'none' }}
          >
            <rect
              x={0}
              y={-7}
              width={len}
              height={14}
              fill="#f7e8b0"
              fillOpacity={0.85}
              stroke="#8a6d1c"
              strokeWidth={1}
            />
            {Array.from({ length: ticks + 1 }, (_, i) => (
              <g key={i}>
                <line
                  x1={i * tick}
                  y1={-7}
                  x2={i * tick}
                  y2={i % 2 === 0 ? 7 : 2}
                  stroke="#5c4710"
                  strokeWidth={1.2}
                />
                {i % 2 === 0 && i > 0 && (
                  <text
                    x={i * tick}
                    y={-10}
                    fontSize={13}
                    textAnchor="middle"
                    fill="#5c4710"
                    stroke="#fffaf0"
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    {i * 50}
                  </text>
                )}
              </g>
            ))}
          </g>
          {(['a', 'b'] as const).map((w) => {
            const p = w === 'a' ? a : b;
            return (
              <g key={w}>
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={7}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ pointerEvents: 'none' }}
                />
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={24}
                  fill="transparent"
                  className="cursor-grab touch-none"
                  data-ruler={w}
                  {...handlers(w)}
                />
              </g>
            );
          })}
        </KazimierzMap>
      </div>

      <div className="space-y-3 border p-3 text-sm leading-relaxed sm:p-4">
        <p>
          Na dole mapy jest <strong>podziałka</strong>: jeden odcinek to 100 km w terenie. Linijka
          ma kratki po 50 km.
        </p>
        <p>
          <strong>Przeciągnij końce linijki</strong> (kolorowe kropki) — jeden na Kraków, drugi na
          Gniezno. Potem policz kratki.
        </p>
        <label className="flex flex-wrap items-center gap-2">
          <span>Z Krakowa do Gniezna jest ok.</span>
          <input
            type="number"
            inputMode="numeric"
            value={reading}
            disabled={note?.ok}
            onChange={(e) => setReading(e.target.value)}
            className="w-20 border px-2 py-1 text-right tabular-nums"
            aria-label="Odległość w kilometrach"
          />
          <span>km</span>
        </label>
        {!note?.ok && (
          <button
            type="button"
            onClick={check}
            className="cursor-pointer border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-muted"
            style={{ borderColor: color, color }}
          >
            Sprawdź
          </button>
        )}
        {note && (
          <p
            className="p-2"
            style={{ backgroundColor: note.ok ? `${color}17` : '#fde8e4' }}
            aria-live="polite"
          >
            {note.ok && <Check className="mr-1 inline h-4 w-4" style={{ color }} aria-hidden />}
            {note.text}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── B. Przybliżenie i plan bitwy ──────────────────────────────────────────────

const G = project(GRUNWALD_GEO);
const PLAN_CENTER: KmXY = [(PLAN_BOX.x0 + PLAN_BOX.x1) / 2, (PLAN_BOX.y0 + PLAN_BOX.y1) / 2];
const TARGET: XY = [G[0] + PLAN_CENTER[0] * PX_PER_KM, G[1] - PLAN_CENTER[1] * PX_PER_KM];

function viewCenter(z: number): XY {
  const w = Math.min(1, Math.log(z) / Math.log(6));
  return [MAP_W / 2 + (TARGET[0] - MAP_W / 2) * w, MAP_H / 2 + (TARGET[1] - MAP_H / 2) * w];
}

function ZoomStage({ color, onBattleOver }: { color: string; onBattleOver: () => void }) {
  const [s, setS] = useState(0);
  const [t, setT] = useState(0);
  const reported = useRef(false);

  const z = zoomOf(s);
  const c = viewCenter(z);
  const isPlan = z >= PLAN_FROM_ZOOM;
  const pxPerKm = z * PX_PER_KM;
  const scaleKm = niceScaleKm(pxPerKm);
  const widthKm = shownWidthKm(MAP_W, KM_PER_PX, z);
  const planOp = planOpacity(z);
  const phase = phaseAt(t);

  useEffect(() => {
    if (t >= LAST_PHASE && !reported.current) {
      reported.current = true;
      onBattleOver();
    }
  }, [t, onBattleOver]);

  /** km planu → współrzędne ekranu (viewBox). */
  const scr = ([xk, yk]: KmXY): XY => [
    Math.round(((G[0] + xk * PX_PER_KM - c[0]) * z + MAP_W / 2) * 10) / 10,
    Math.round(((G[1] - yk * PX_PER_KM - c[1]) * z + MAP_H / 2) * 10) / 10,
  ];
  const poly = (pts: readonly KmXY[]) => 'M' + pts.map((p) => scr(p).join(',')).join(' ') + 'Z';
  const gScreen = scr([0, 0]);

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start md:gap-4">
      <figure className="border-2 bg-[#fffaf0] p-2" style={{ borderColor: MAP_COLORS.ink }}>
        <p
          className="mb-1.5 text-center font-serif text-sm font-semibold sm:text-base"
          style={{ color: MAP_COLORS.ink }}
        >
          {isPlan
            ? 'Plan bitwy pod Grunwaldem (15 lipca 1410 r.)'
            : 'Polska za panowania Kazimierza Wielkiego (1333–1370)'}
        </p>
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="block h-auto w-full select-none"
          role="img"
          aria-label={isPlan ? 'Plan bitwy pod Grunwaldem' : 'Mapa przybliżana na Grunwald'}
        >
          <defs>
            <clipPath id="l9-zoom-clip">
              <rect x={0} y={0} width={MAP_W} height={MAP_H} />
            </clipPath>
          </defs>
          <g clipPath="url(#l9-zoom-clip)">
            <g opacity={1 - planOp * 0.85}>
              <g
                transform={`translate(${MAP_W / 2} ${MAP_H / 2}) scale(${z}) translate(${-c[0]} ${-c[1]})`}
              >
                <MapLayers showSymbols={z < 2.2} />
              </g>
            </g>

            {/* Znak bitwy na mapie — stałej wielkości, póki nie ma planu. */}
            {planOp < 1 && (
              <g opacity={1 - planOp} style={{ pointerEvents: 'none' }}>
                <path
                  d={`M${gScreen[0] - 7},${gScreen[1] - 7} L${gScreen[0] + 7},${gScreen[1] + 7} M${gScreen[0] + 7},${gScreen[1] - 7} L${gScreen[0] - 7},${gScreen[1] + 7}`}
                  stroke={MAP_COLORS.ink}
                  strokeWidth={3}
                />
                <text
                  x={gScreen[0] + 11}
                  y={gScreen[1] + 4}
                  fontSize={14}
                  fontWeight={600}
                  fill={MAP_COLORS.ink}
                  stroke="#fffaf0"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  Grunwald
                </text>
              </g>
            )}

            {planOp > 0 && (
              <g opacity={planOp}>
                <path
                  d={poly([
                    [PLAN_BOX.x0 - 3, PLAN_BOX.y1 + 3],
                    [PLAN_BOX.x1 + 3, PLAN_BOX.y1 + 3],
                    [PLAN_BOX.x1 + 3, PLAN_BOX.y0 - 3],
                    [PLAN_BOX.x0 - 3, PLAN_BOX.y0 - 3],
                  ])}
                  fill="#eef0dc"
                />
                <path d={poly(FOREST)} fill="#9cc391" stroke="#5f8f55" strokeWidth={1} />
                <path
                  d={poly(LAKE)}
                  fill={MAP_COLORS.sea}
                  stroke={MAP_COLORS.river}
                  strokeWidth={1.2}
                />
                <text
                  {...textAt(scr([4.62, -1.72]))}
                  fontSize={15}
                  fontStyle="italic"
                  textAnchor="middle"
                  fill={MAP_COLORS.river}
                >
                  jez. Łubień
                </text>
                <text
                  {...textAt(scr([5.05, 1.55]))}
                  fontSize={15}
                  fontStyle="italic"
                  textAnchor="middle"
                  fill="#3f6b37"
                >
                  las
                </text>
                {VILLAGES.map((v) => {
                  const [x, y] = scr(v.at);
                  return (
                    <g key={v.name}>
                      <rect
                        x={x - 6}
                        y={y - 6}
                        width={12}
                        height={12}
                        fill="#fff"
                        stroke={MAP_COLORS.ink}
                        strokeWidth={1.5}
                      />
                      <text
                        x={v.side === 'l' ? x - 10 : x}
                        y={v.side === 't' ? y - 11 : v.side === 'b' ? y + 21 : y + 4}
                        textAnchor={v.side === 'l' ? 'end' : 'middle'}
                        fontSize={16}
                        fontWeight={600}
                        fill={MAP_COLORS.ink}
                        stroke="#fffaf0"
                        strokeWidth={3}
                        paintOrder="stroke"
                      >
                        {v.name}
                      </text>
                    </g>
                  );
                })}
                <CampMark at={scr(CAMP)} taken={phase >= LAST_PHASE} />
                {isPlan &&
                  UNITS.map((u) => {
                    const mv = moveInPhase(u, t);
                    return mv ? (
                      <Arrow
                        key={`m-${u.id}`}
                        from={scr(mv[0])}
                        to={scr(mv[1])}
                        color={SIDE_COLOR[u.side]}
                      />
                    ) : null;
                  })}
                {UNITS.map((u) => {
                  const [x, y] = scr(unitAt(u, isPlan ? t : 0));
                  const broken = u.brokenFrom !== undefined && t >= u.brokenFrom - 0.01;
                  return (
                    <g key={u.id} opacity={broken ? 0.35 : 1}>
                      <rect
                        x={x - 20}
                        y={y - 9}
                        width={40}
                        height={18}
                        fill={SIDE_COLOR[u.side]}
                        stroke="#fff"
                        strokeWidth={1.5}
                      />
                      {u.side === 'zakon' && (
                        <path
                          d={`M${x - 4},${y} L${x + 4},${y} M${x},${y - 5} L${x},${y + 5}`}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      )}
                      {u.id === 'mistrz' && (
                        <text
                          x={x}
                          y={y - 12}
                          fontSize={14}
                          textAnchor="middle"
                          fill={MAP_COLORS.ink}
                          stroke="#fffaf0"
                          strokeWidth={3}
                          paintOrder="stroke"
                        >
                          wielki mistrz
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            <ScaleBar x={20} y={MAP_H - 16} km={scaleKm} pxPerKm={pxPerKm} steps={2} />
          </g>
        </svg>
      </figure>

      <div className="flex flex-col gap-3 border p-3 text-sm leading-relaxed sm:p-4">
        <label className="block">
          <span className="mb-1 flex items-center justify-between gap-2 font-semibold">
            <span>Przybliżenie</span>
            <span className="tabular-nums text-muted-foreground">
              ×{z < 10 ? z.toFixed(1).replace('.', ',') : Math.round(z)}
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.005}
            value={s}
            onChange={(e) => setS(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: color }}
            aria-label="Przybliżenie mapy"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Na rysunku mieści się teraz ok.{' '}
          <strong className="tabular-nums">
            {widthKm >= 20 ? Math.round(widthKm) : widthKm.toFixed(1).replace('.', ',')} km
          </strong>{' '}
          terenu wszerz. Odcinek podziałki: {String(scaleKm).replace('.', ',')} km.
        </p>
        <p className="p-2" style={{ backgroundColor: isPlan ? `${color}17` : '#f4f1ea' }}>
          {isPlan ? (
            <>
              <strong>To już plan</strong> — mały obszar, kilka kilometrów, narysowany w dużej
              skali. Widać na nim wsie, jezioro i ustawienie wojsk. Na mapie całej Polski bitwa była
              tylko krzyżykiem.
            </>
          ) : z > 2.2 ? (
            <>
              Na mapie ubywa szczegółów: zostają rzeki i krzyżyk bitwy. Mapa pokazuje{' '}
              <strong>duży obszar w małej skali</strong>. Przybliżaj dalej.
            </>
          ) : (
            <>Przesuń suwak w prawo — przybliżysz okolice Grunwaldu, na północ od Królestwa.</>
          )}
        </p>

        {isPlan && (
          <div className="order-first border-b pb-3">
            <label className="block">
              <span className="mb-1 flex items-center justify-between gap-2 font-semibold">
                <span>Przebieg bitwy</span>
                <span className="text-muted-foreground">{PHASES[phase].title}</span>
              </span>
              <input
                type="range"
                min={0}
                max={LAST_PHASE}
                step={0.02}
                value={t}
                onChange={(e) => setT(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: color }}
                aria-label="Czas bitwy"
              />
            </label>
            <p className="mt-1.5">{PHASES[phase].text}</p>
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
              {(['polska', 'litwa', 'zakon'] as const).map((sd) => (
                <li key={sd} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-5"
                    style={{ backgroundColor: SIDE_COLOR[sd] }}
                    aria-hidden
                  />
                  {sd === 'polska'
                    ? 'wojska polskie'
                    : sd === 'litwa'
                      ? 'wojska litewskie'
                      : 'wojska zakonu'}
                </li>
              ))}
              <li className="flex items-center gap-1.5">
                <span aria-hidden>→</span> ruch wojsk
              </li>
              <li className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 border border-current" aria-hidden /> wieś
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function textAt([x, y]: XY) {
  return { x, y };
}

function Arrow({ from, to, color }: { from: XY; to: XY; color: string }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  const tip: XY = [to[0] - ux * 18, to[1] - uy * 18];
  const head = `M${tip[0]},${tip[1]} L${Math.round((tip[0] - ux * 10 - uy * 6) * 10) / 10},${Math.round((tip[1] - uy * 10 + ux * 6) * 10) / 10} L${Math.round((tip[0] - ux * 10 + uy * 6) * 10) / 10},${Math.round((tip[1] - uy * 10 - ux * 6) * 10) / 10} Z`;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <line
        x1={from[0]}
        y1={from[1]}
        x2={tip[0]}
        y2={tip[1]}
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray="7 4"
      />
      <path d={head} fill={color} />
    </g>
  );
}

function CampMark({ at: [x, y], taken }: { at: XY; taken: boolean }) {
  return (
    <g>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <rect
            key={i}
            x={Math.round((x + Math.cos(a) * 14 - 3) * 10) / 10}
            y={Math.round((y + Math.sin(a) * 14 - 3) * 10) / 10}
            width={6}
            height={6}
            fill={taken ? SIDE_COLOR.polska : '#7a6a4f'}
          />
        );
      })}
      <text
        x={x}
        y={y + 30}
        fontSize={14}
        textAnchor="middle"
        fill={MAP_COLORS.ink}
        stroke="#fffaf0"
        strokeWidth={3}
        paintOrder="stroke"
      >
        obóz zakonu
      </text>
    </g>
  );
}

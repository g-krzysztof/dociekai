'use client';

import { useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { arrowheadPoints, rightAngleMarker, type GeoPoint } from '../../../lib/lines';

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 200;
const GRID_STEP = 20;

const LINE_K_Y = 170;
const EKIERKA_LEG = 50;
/** Niewidoczny margines celu kliknięcia/dotyku wokół prostokąta ekierki — łatwiej ją złapać niż samą rysowaną krawędź. */
const HIT_MARGIN = 12;

/** Punkt P dla rundy prostopadłej. */
const P_PERP: GeoPoint = { x: 180, y: LINE_K_Y - EKIERKA_LEG };
/** Pozycja linijki (pionowej) w rundzie równoległej. */
const RULER_X = 76;
/** Punkt P dla rundy równoległej — blisko linijki, żeby konstrukcja nie rozjeżdżała się na pół szerokości kartki. */
const P_PAR: GeoPoint = { x: 168, y: 90 };

const RULER_TOP = 16;
const RULER_BOTTOM = VIEW_HEIGHT - 16;
const RULER_TICK_STEP = 10;
/** Podziałka linijki: krótka kreska co 10 jednostek, dłuższa („centymetrowa") co piątą. */
const RULER_TICKS = Array.from(
  { length: Math.floor((RULER_BOTTOM - RULER_TOP) / RULER_TICK_STEP) + 1 },
  (_, i) => ({ y: RULER_TOP + i * RULER_TICK_STEP, long: i % 5 === 0 })
);

/** Czas „dosunięcia" ekierki po kliknięciu „Rysuj", zanim narzędzie zniknie i odsłoni gotową prostą. */
const SETTLE_MS = 300;
const SETTLE_TRANSITION = { duration: SETTLE_MS / 1000, ease: 'easeOut' as const };

/**
 * Krótkie kreski graduacji wzdłuż dwóch przyprostokątnych ekierki (jak realne
 * oznaczenia na krawędzi fizycznego narzędzia). Obie przyprostokątne są zawsze
 * osiowe (pionowa + pozioma), więc kierunek liczy się ze znaku różnicy, bez
 * trygonometrii.
 */
function buildLegTicks(vertex: GeoPoint, vertLegEnd: GeoPoint, horizLegEnd: GeoPoint) {
  const step = 12;
  const tickLen = 4;
  const vertDir = Math.sign(vertLegEnd.y - vertex.y) || 1;
  const horizDir = Math.sign(horizLegEnd.x - vertex.x) || 1;
  const vertLen = Math.abs(vertLegEnd.y - vertex.y);
  const horizLen = Math.abs(horizLegEnd.x - vertex.x);
  const ticks: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let d = step; d < vertLen; d += step) {
    const y = vertex.y + vertDir * d;
    ticks.push({ x1: vertex.x, y1: y, x2: vertex.x + horizDir * tickLen, y2: y });
  }
  for (let d = step; d < horizLen; d += step) {
    const x = vertex.x + horizDir * d;
    ticks.push({ x1: x, y1: vertex.y, x2: x, y2: vertex.y + vertDir * tickLen });
  }
  return ticks;
}

interface EkierkaBoardProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Przykłady: rysowanie ekierką i linijką. Dwie rundy konstrukcji:
 * 1) prostopadła do prostej k przez punkt P — ekierka jedzie po prostej k,
 *    aż jej pionowe ramię trafi w punkt P;
 * 2) równoległa do prostej k przez punkt P — ekierka jedzie po linijce,
 *    jej poziome ramię musi trafić w wysokość punktu P.
 * Przycisk „Rysuj" jest zablokowany (`disabled`), dopóki ekierka nie trafi
 * we właściwą pozycję — ta sama bramka „zgadnij, potem sprawdź" co w
 * RoundingMachine. Kliknięcie „Rysuj" dosuwa ekierkę do idealnej pozycji
 * sprężystą animacją, dopiero potem odsłania gotową prostą — to jedna,
 * celowo zbudowana chwila triumfu, nie twardy przeskok.
 */
export function EkierkaBoard({ color, onComplete }: EkierkaBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, '');
  const gridId = `ekierka-grid-${uid}`;
  const shadowId = `ekierka-shadow-${uid}`;

  const [round, setRound] = useState<0 | 1>(0);
  const [ex, setEx] = useState(96);
  const [ey, setEy] = useState(150);
  const [dragging, setDragging] = useState(false);
  const [pendingReveal, setPendingReveal] = useState<'perp' | 'par' | null>(null);
  const [drawnPerp, setDrawnPerp] = useState(false);
  const [drawnPar, setDrawnPar] = useState(false);

  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  // Krawędzie prostej k z grotami (to prosta, nie odcinek).
  const kLeft: GeoPoint = { x: 20, y: LINE_K_Y };
  const kRight: GeoPoint = { x: VIEW_WIDTH - 20, y: LINE_K_Y };

  const perpAligned = Math.abs(ex - P_PERP.x) <= 4;
  const parAligned = Math.abs(ey - P_PAR.y) <= 4;
  const aligned = round === 0 ? perpAligned : parAligned;
  const alreadyDrawn = round === 0 ? drawnPerp : drawnPar;

  const pointerToCanvas = (event: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = VIEW_WIDTH / rect.width;
    const scaleY = VIEW_HEIGHT / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const startDrag = (event: React.PointerEvent) => {
    event.preventDefault();
    (event.currentTarget as SVGElement).setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const moveEkierka = (event: React.PointerEvent) => {
    if (!dragging) return;
    const point = pointerToCanvas(event);
    if (!point) return;
    if (round === 0) {
      setEx(Math.min(260, Math.max(66, point.x)));
    } else {
      setEy(Math.min(RULER_BOTTOM - EKIERKA_LEG, Math.max(RULER_TOP, point.y)));
    }
  };

  const stopDrag = () => setDragging(false);

  const drawPerpendicular = () => {
    if (!perpAligned || drawnPerp) return;
    setEx(P_PERP.x);
    setPendingReveal('perp');
    window.setTimeout(() => {
      setDrawnPerp(true);
      setPendingReveal(null);
    }, SETTLE_MS);
  };

  const drawParallel = () => {
    if (!parAligned || drawnPar) return;
    setEy(P_PAR.y);
    setPendingReveal('par');
    window.setTimeout(() => {
      setDrawnPar(true);
      setPendingReveal(null);
    }, SETTLE_MS);
  };

  // Wierzchołki ekierki dla bieżącej rundy — kąt prosty zawsze w `vertex`.
  const vertex: GeoPoint = round === 0 ? { x: ex, y: LINE_K_Y } : { x: RULER_X, y: ey };
  const vertTip: GeoPoint =
    round === 0 ? { x: ex, y: LINE_K_Y - EKIERKA_LEG } : { x: RULER_X, y: ey + EKIERKA_LEG };
  const horizTip: GeoPoint =
    round === 0 ? { x: ex + EKIERKA_LEG, y: LINE_K_Y } : { x: RULER_X + EKIERKA_LEG, y: ey };
  const ekierkaPoints = `${vertex.x},${vertex.y} ${vertTip.x},${vertTip.y} ${horizTip.x},${horizTip.y}`;
  const toolNotch = rightAngleMarker(vertex, vertTip, horizTip, 7);
  const toolTicks = buildLegTicks(vertex, vertTip, horizTip);
  const labelAnchor: GeoPoint = { x: horizTip.x + 4, y: horizTip.y + 14 };

  const perpMark = rightAngleMarker(
    { x: P_PERP.x, y: LINE_K_Y },
    { x: P_PERP.x, y: LINE_K_Y - 30 },
    { x: P_PERP.x + 30, y: LINE_K_Y },
    14
  );

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {round === 0 ? (
          <>
            Narysuj prostą <strong>prostopadłą</strong> do prostej k przez punkt P. Przeciągnij
            ekierkę po prostej k tak, żeby jej pionowe ramię znalazło się dokładnie pod punktem P —
            a potem naciśnij <strong>„Rysuj”</strong>.
          </>
        ) : (
          <>
            Narysuj prostą <strong>równoległą</strong> do prostej k przez punkt P. Przytrzymaj
            ekierkę przy linijce i przesuń ją w dół tak, żeby jej poziome ramię znalazło się
            dokładnie na wysokości punktu P — a potem naciśnij <strong>„Rysuj”</strong>.
          </>
        )}
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-label={`Konstrukcja ekierką: prosta k oraz punkt P — ${round === 0 ? 'prosta prostopadła' : 'prosta równoległa'}`}
      >
        <defs>
          <pattern id={gridId} width={GRID_STEP} height={GRID_STEP} patternUnits="userSpaceOnUse">
            <path
              d={`M ${GRID_STEP} 0 L 0 0 0 ${GRID_STEP}`}
              fill="none"
              stroke={`${color}1f`}
              strokeWidth={1}
            />
          </pattern>
          <filter id={shadowId} x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor={color} floodOpacity={0.35} />
          </filter>
        </defs>

        {/* Kartka w kratkę — ta sama konwencja co zeszyt z okładki lekcji, i wypełnia ramkę zamiast pustego białego tła */}
        <rect x={0} y={0} width={VIEW_WIDTH} height={VIEW_HEIGHT} fill={`url(#${gridId})`} />

        {/* Linijka w rundzie równoległej — bryła z podziałką, nie goła linia */}
        {round === 1 && (
          <>
            <rect
              x={RULER_X - 3}
              y={RULER_TOP}
              width={6}
              height={RULER_BOTTOM - RULER_TOP}
              fill={`${color}14`}
              stroke={textColor}
              strokeWidth={1.5}
            />
            {RULER_TICKS.map((tick) => (
              <line
                key={tick.y}
                x1={RULER_X + 3}
                y1={tick.y}
                x2={RULER_X + 3 + (tick.long ? 7 : 4)}
                y2={tick.y}
                stroke={textColor}
                strokeWidth={tick.long ? 1.5 : 1}
              />
            ))}
            <text
              x={RULER_X - 6}
              y={22}
              style={{ fontSize: 12, fontWeight: 700 }}
              fill={textColor}
              textAnchor="end"
            >
              linijka
            </text>
          </>
        )}

        {/* Prosta k (z grotami — to prosta, nie odcinek) */}
        <line x1={kLeft.x} y1={kLeft.y} x2={kRight.x} y2={kRight.y} stroke={color} strokeWidth={3} />
        <polygon points={arrowheadPoints({ x: kLeft.x + 40, y: kLeft.y }, kLeft, 8)} fill={color} />
        <polygon points={arrowheadPoints({ x: kRight.x - 40, y: kRight.y }, kRight, 8)} fill={color} />
        <text x={kLeft.x + 8} y={LINE_K_Y - 10} style={{ fontSize: 18, fontWeight: 800 }} fill={color}>
          k
        </text>

        {/* Punkt P — pulsujący pierścień, gdy ekierka jest już wyrównana i czeka tylko na „Rysuj" */}
        {aligned && !alreadyDrawn && !pendingReveal && (
          <motion.circle
            cx={round === 0 ? P_PERP.x : P_PAR.x}
            cy={round === 0 ? P_PERP.y : P_PAR.y}
            fill="none"
            stroke={color}
            strokeWidth={2}
            initial={{ r: 9, opacity: 0.9 }}
            animate={{ r: [9, 13, 9], opacity: [0.9, 0.25, 0.9] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <circle cx={round === 0 ? P_PERP.x : P_PAR.x} cy={round === 0 ? P_PERP.y : P_PAR.y} r={5} fill={color} />
        <text
          x={(round === 0 ? P_PERP.x : P_PAR.x) + 10}
          y={(round === 0 ? P_PERP.y : P_PAR.y) - 8}
          style={{ fontSize: 18, fontWeight: 800 }}
          fill={color}
        >
          P
        </text>

        {/* Narysowana prostopadła */}
        {drawnPerp && (
          <>
            <line x1={P_PERP.x} y1={16} x2={P_PERP.x} y2={VIEW_HEIGHT - 4} stroke={color} strokeWidth={3} />
            <path
              d={`M ${perpMark.onLine1.x} ${perpMark.onLine1.y} L ${perpMark.outer.x} ${perpMark.outer.y} L ${perpMark.onLine2.x} ${perpMark.onLine2.y}`}
              fill="none"
              stroke={color}
              strokeWidth={2}
            />
          </>
        )}

        {/* Narysowana równoległa */}
        {drawnPar && <line x1={kLeft.x} y1={P_PAR.y} x2={kRight.x} y2={P_PAR.y} stroke={color} strokeWidth={3} />}

        {/* Ekierka — bryła z cieniem (fizyczny, chwytalny przedmiot), kątem prostym i podziałką na ramionach.
            Kliknięcie „Rysuj" ustawia dokładną pozycję od razu (stan), a `key` na settle-cyklu wymusza
            odtworzenie „popu" zatrzaśnięcia — nie polegamy na `onAnimationComplete` dla surowego
            atrybutu `points` (framer-motion niezawodnie animuje tylko rozpoznane typy wartości; zamiast
            tego stan „narysowane" odsłania zwykły `setTimeout` zgrany z czasem tej animacji). */}
        {!drawnPerp && !drawnPar && (
          <>
            <motion.g
              key={pendingReveal ? `settle-${pendingReveal}` : 'idle'}
              initial={pendingReveal ? { scale: 1.18, opacity: 0.65 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={pendingReveal ? SETTLE_TRANSITION : { duration: 0 }}
              style={{ transformOrigin: `${vertex.x}px ${vertex.y}px` }}
            >
              <polygon
                points={ekierkaPoints}
                fill={`${color}22`}
                stroke={textColor}
                strokeWidth={2}
                filter={`url(#${shadowId})`}
                pointerEvents="none"
              />
              <path
                d={`M ${toolNotch.onLine1.x} ${toolNotch.onLine1.y} L ${toolNotch.outer.x} ${toolNotch.outer.y} L ${toolNotch.onLine2.x} ${toolNotch.onLine2.y}`}
                fill="none"
                stroke={textColor}
                strokeWidth={1.25}
                pointerEvents="none"
              />
              {toolTicks.map((tick, i) => (
                <line
                  key={i}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke={textColor}
                  strokeWidth={1}
                  pointerEvents="none"
                />
              ))}
              <text
                x={labelAnchor.x}
                y={labelAnchor.y}
                style={{ fontSize: 12, fontWeight: 700 }}
                fill={textColor}
                pointerEvents="none"
              >
                ekierka
              </text>
            </motion.g>

            {/* Większy niewidoczny cel przeciągania niż sam rysowany trójkąt */}
            {!pendingReveal && (
              <rect
                x={Math.min(vertex.x, vertTip.x, horizTip.x) - HIT_MARGIN}
                y={Math.min(vertex.y, vertTip.y, horizTip.y) - HIT_MARGIN}
                width={Math.abs(horizTip.x - vertex.x) + HIT_MARGIN * 2}
                height={Math.abs(vertTip.y - vertex.y) + HIT_MARGIN * 2}
                fill="transparent"
                style={{ cursor: dragging ? 'grabbing' : 'grab' }}
                onPointerDown={startDrag}
                onPointerMove={moveEkierka}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
              />
            )}
          </>
        )}
      </svg>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button
          size="lg"
          disabled={round === 0 ? !perpAligned || drawnPerp : !parAligned || drawnPar}
          onClick={round === 0 ? drawPerpendicular : drawParallel}
          style={{ backgroundColor: color }}
        >
          {round === 0 ? 'Rysuj prostą prostopadłą' : 'Rysuj prostą równoległą'}
        </Button>

        {round === 0 && drawnPerp && (
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setRound(1);
              setDrawnPerp(false);
            }}
          >
            Rysuj równoległą →
          </Button>
        )}
        {round === 1 && drawnPar && (
          <Button size="lg" variant="outline" onClick={() => onComplete?.()}>
            Zrozumiałem, idziemy dalej
          </Button>
        )}
      </div>

      {round === 0 && drawnPerp && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <strong>Prostopadła narysowana!</strong> Pionowe ramię ekierki było prostopadłe do
          prostej k, więc poprowadzona wzdłuż niego prosta też jest prostopadła — a kwadracik
          potwierdza kąt prosty.
        </motion.div>
      )}
      {round === 1 && drawnPar && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <strong>Równoległa narysowana!</strong> Przesuwając ekierkę wzdłuż linijki, trzymałeś/aś
          jej poziome ramię cały czas równolegle do prostej k — więc prosta poprowadzona wzdłuż
          tego ramienia też jest równoległa.
        </motion.div>
      )}
    </div>
  );
}

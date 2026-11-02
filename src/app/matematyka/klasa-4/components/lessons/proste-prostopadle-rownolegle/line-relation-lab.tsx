'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { extendFar, rightAngleMarker, round, type GeoPoint } from '../../../lib/lines';
import { useTweenedNumber } from '../../../lib/use-tweened-number';

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 210;

/** Stała prosta k — pozioma. */
const LINE_K_Y = 54;
/** Oś obrotu ruchomej prostej l — wyśrodkowana w ramce, żeby dial nie „uciekał” w dół. */
const PIVOT: GeoPoint = { x: 160, y: 128 };
const HANDLE_RADIUS = 58;
/** Uchwyt ma dodatkowy niewidoczny margines na kliknięcie/dotyk, większy niż jego rysowany promień. */
const HIT_RADIUS = 26;
const SNAP_DEG = 6;

/** Kąt ostry między prostą l (o kierunku `angle`) a poziomą prostą k. */
function acuteAngle(angleDeg: number): number {
  const normalized = ((angleDeg % 180) + 180) % 180;
  return Math.min(normalized, 180 - normalized);
}

function polar(center: GeoPoint, angleDeg: number, radius: number): GeoPoint {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: round(center.x + Math.cos(rad) * radius),
    y: round(center.y + Math.sin(rad) * radius),
  };
}

/** Podziałka protraktora wokół osi obrotu — co 30°, z dłuższą, kolorową kreską na czterech pozycjach specjalnych (0/90/180/270). */
const DIAL_TICKS = Array.from({ length: 12 }, (_, i) => i * 30).map((deg) => {
  const isMajor = deg % 90 === 0;
  const reach = isMajor ? 9 : 5;
  return {
    deg,
    isMajor,
    inner: polar(PIVOT, deg, HANDLE_RADIUS - reach),
    outer: polar(PIVOT, deg, HANDLE_RADIUS + reach),
  };
});

const SNAPPED_SPRING = { type: 'spring' as const, stiffness: 320, damping: 22 };
const FREE_DRAG = { duration: 0 };

interface LineRelationLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: laboratorium relacji. Dziecko obraca prostą l wokół punktu O
 * i na żywo widzi, kiedy proste stają się równoległe (snap do 0°, symbol ∥)
 * albo prostopadłe (snap do 90°, kwadracik kąta prostego). Odkrycie obu
 * relacji kończy widżet.
 */
export function LineRelationLab({ color, onComplete }: LineRelationLabProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  // `setAngle` skacze (przeciąganie 1:1), `tweenAngle` płynnie przechodzi
  // (przyciski −10°/+10°), żeby klik nie ciął prostej z pozycji na pozycję.
  const {
    value: angle,
    set: setAngle,
    tweenTo: tweenAngle,
    stop: stopAngleTween,
  } = useTweenedNumber(23);
  const [dragging, setDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [found, setFound] = useState({ parallel: false, perpendicular: false });
  const [done, setDone] = useState(false);

  const acute = acuteAngle(angle);
  const isParallel = acute <= SNAP_DEG;
  const isPerpendicular = acute >= 90 - SNAP_DEG;
  const snapTransition = isParallel || isPerpendicular ? SNAPPED_SPRING : FREE_DRAG;

  // Snap do najbliższej poziomej/pionowej pozycji, żeby „złapać” relację.
  const snappedAngle = isParallel
    ? Math.round(angle / 180) * 180
    : isPerpendicular
      ? Math.round((angle - 90) / 180) * 180 + 90
      : angle;

  if (isParallel && !found.parallel) setFound((prev) => ({ ...prev, parallel: true }));
  if (isPerpendicular && !found.perpendicular) setFound((prev) => ({ ...prev, perpendicular: true }));

  const handle = polar(PIVOT, snappedAngle, HANDLE_RADIUS);
  const dirX = Math.cos((snappedAngle * Math.PI) / 180);
  const dirY = Math.sin((snappedAngle * Math.PI) / 180);
  const anchor: GeoPoint = { x: round(PIVOT.x + dirX), y: round(PIVOT.y + dirY) };
  const lStart = extendFar(anchor, PIVOT);
  const lEnd = extendFar(PIVOT, anchor);
  const labelPos = polar(PIVOT, snappedAngle, HANDLE_RADIUS + 30);

  // Prostopadłość: kwadracik kąta prostego w punkcie przecięcia z k (x = 160).
  const perpMark = isPerpendicular
    ? rightAngleMarker(
        { x: PIVOT.x, y: LINE_K_Y },
        { x: PIVOT.x, y: LINE_K_Y - 40 },
        { x: PIVOT.x + 60, y: LINE_K_Y },
        14
      )
    : null;

  const pointerToAngle = (event: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = VIEW_WIDTH / rect.width;
    const scaleY = VIEW_HEIGHT / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    setAngle((Math.atan2(y - PIVOT.y, x - PIVOT.x) * 180) / Math.PI);
  };

  const finish = () => {
    setDone(true);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold" aria-live="polite">
          Kąt między prostymi:{' '}
          <span className="font-mono" style={{ color }}>
            {Math.round(acute)}°
          </span>
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 border px-2 py-1 transition-colors duration-300',
              found.parallel ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' : 'text-muted-foreground'
            )}
          >
            {found.parallel ? <Check className="h-3.5 w-3.5" /> : <span className="font-mono">∥</span>}
            równoległe
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 border px-2 py-1 transition-colors duration-300',
              found.perpendicular ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' : 'text-muted-foreground'
            )}
          >
            {found.perpendicular ? <Check className="h-3.5 w-3.5" /> : <span className="font-mono">⊥</span>}
            prostopadłe
          </span>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Chwyć kółko i obracaj prostą <strong>l</strong> wokół punktu O. Znajdź pozycję, w której
        proste są <strong>równoległe</strong> (symbol ∥), i taką, w której są{' '}
        <strong>prostopadłe</strong> (kwadracik kąta prostego i symbol ⊥).
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-label="Laboratorium: pozioma prosta k i obracana prosta l z kółkiem-uchwytem"
      >
        {/* Prosta k */}
        <line
          x1={16}
          y1={LINE_K_Y}
          x2={VIEW_WIDTH - 16}
          y2={LINE_K_Y}
          stroke={color}
          strokeWidth={3}
        />
        <text x={24} y={LINE_K_Y - 10} style={{ fontSize: 18, fontWeight: 800 }} fill={color}>
          k
        </text>

        {/* Tarcza obrotu: cienki pierścień + podziałka protraktora, żeby okrąg czytał się jako pokrętło, nie tajemnicza kropkowana linia */}
        <circle cx={PIVOT.x} cy={PIVOT.y} r={HANDLE_RADIUS} fill="none" stroke={`${color}22`} strokeWidth={1.5} />
        {DIAL_TICKS.map((tick) => (
          <line
            key={tick.deg}
            x1={tick.inner.x}
            y1={tick.inner.y}
            x2={tick.outer.x}
            y2={tick.outer.y}
            stroke={tick.isMajor ? color : `${color}55`}
            strokeWidth={tick.isMajor ? 2 : 1}
          />
        ))}

        {/* Prosta l — przez punkt O w kierunku uchwytu; magnetyczny snap animuje się sprężyście, wolna jazda śledzi kursor 1:1 */}
        <motion.line
          animate={{ x1: lStart.x, y1: lStart.y, x2: lEnd.x, y2: lEnd.y }}
          transition={snapTransition}
          stroke={color}
          strokeWidth={3}
        />
        <text x={lEnd.x - 20} y={lEnd.y + 4} style={{ fontSize: 18, fontWeight: 800 }} fill={color}>
          l
        </text>

        {/* Punkt O */}
        <circle cx={PIVOT.x} cy={PIVOT.y} r={4} fill={color} />
        <text x={PIVOT.x + 7} y={PIVOT.y - 8} style={{ fontSize: 15, fontWeight: 800 }} fill={color}>
          O
        </text>

        <AnimatePresence>
          {/* Znacznik relacji równoległej: dwie kreski ∥ między prostymi */}
          {isParallel && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <line x1={220} y1={LINE_K_Y + 12} x2={214} y2={PIVOT.y - 12} stroke={color} strokeWidth={2.5} />
              <line x1={236} y1={LINE_K_Y + 12} x2={230} y2={PIVOT.y - 12} stroke={color} strokeWidth={2.5} />
            </motion.g>
          )}

          {/* Znacznik relacji prostopadłej: kwadracik kąta prostego */}
          {isPerpendicular && perpMark && (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              d={`M ${perpMark.onLine1.x} ${perpMark.onLine1.y} L ${perpMark.outer.x} ${perpMark.outer.y} L ${perpMark.onLine2.x} ${perpMark.onLine2.y}`}
              fill="none"
              stroke={color}
              strokeWidth={2}
            />
          )}
        </AnimatePresence>

        {/* Kątowy odczyt tuż przy uchwycie — informacja zwrotna dokładnie tam, gdzie patrzy dziecko w trakcie przeciągania */}
        {dragging && (
          <text
            x={labelPos.x}
            y={labelPos.y}
            style={{ fontSize: 13, fontWeight: 700 }}
            fill={color}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {Math.round(acute)}°
          </text>
        )}

        {/* Zaproszenie do interakcji: pulsujący pierścień, znika po pierwszym dotknięciu */}
        {!hasInteracted && !done && (
          <motion.circle
            cx={handle.x}
            cy={handle.y}
            fill="none"
            stroke={color}
            strokeWidth={2}
            initial={{ r: 13, opacity: 0.7 }}
            animate={{ r: [13, 24, 13], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        {/* Uchwyt obracania — czysto wizualny, klik przechwytuje większy niewidoczny okrąg poniżej */}
        <motion.circle
          animate={{ cx: handle.x, cy: handle.y }}
          transition={snapTransition}
          r={13}
          fill={`${color}22`}
          stroke={color}
          strokeWidth={3}
          pointerEvents="none"
        />
        <motion.circle animate={{ cx: handle.x, cy: handle.y }} transition={snapTransition} r={5} fill={color} pointerEvents="none" />

        {/* Większy niewidoczny cel kliknięcia/dotyku — łatwiej złapać niż samą rysowaną obwódkę */}
        {!done && (
          <motion.circle
            animate={{ cx: handle.x, cy: handle.y }}
            transition={snapTransition}
            r={HIT_RADIUS}
            fill="transparent"
            style={{ cursor: dragging ? 'grabbing' : 'grab' }}
            onPointerDown={(event) => {
              event.preventDefault();
              (event.currentTarget as SVGCircleElement).setPointerCapture(event.pointerId);
              stopAngleTween();
              setDragging(true);
              setHasInteracted(true);
            }}
            onPointerMove={(event) => {
              if (dragging) pointerToAngle(event);
            }}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
          />
        )}
      </svg>

      {/* Precyzyjne obracanie (dostępność/klawiatura) */}
      <div className="mt-3 flex items-center justify-center gap-4 border-t pt-3">
        <Button variant="outline" size="sm" onClick={() => tweenAngle((prev) => prev - 10)} disabled={done}>
          −10°
        </Button>
        <span className="text-xs text-muted-foreground">obrót ręczny</span>
        <Button variant="outline" size="sm" onClick={() => tweenAngle((prev) => prev + 10)} disabled={done}>
          +10°
        </Button>
      </div>

      {found.parallel && found.perpendicular && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <strong>Znalazłeś/aś obie relacje!</strong> Równoległe proste nigdy się nie przecinają
          (k {`∥`} l), a prostopadłe przecinają się pod kątem prostym (k {`⊥`} l).
        </motion.div>
      )}

      {!done && found.parallel && found.perpendicular && (
        <div className="mt-4 flex justify-end">
          <Button onClick={finish}>
            Zrozumiałem, idziemy dalej
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

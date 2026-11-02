'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, RotateCw, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  boxPolyhedron,
  projectPolyhedron,
  round3,
  type BoxSpec,
  type Polyhedron,
  type SolidPoint,
} from '../lib/solids';

export type SolidPart = 'sciany' | 'krawedzie' | 'wierzcholki';

/** Największy prostopadłościan, jaki ten widżet kiedykolwiek pokaże. */
export const MAX_SIDE = 6;
const SCALE = 26;
/** Stały kadr liczony z przekątnej NAJWIĘKSZEJ możliwej bryły — dzięki temu
 *  zmiana wymiarów dokłada bok, zamiast przeskalowywać cały rysunek. */
const REACH = (Math.sqrt(3) * MAX_SIDE * SCALE) / 2;
const PAD = 18;
const VIEW = Math.round(REACH + PAD);

const START_YAW = 0.62;
const START_PITCH = 0.4;
/** Powyżej ~65° kamera zagląda na bryłę z góry i rysunek przestaje czytać się jako bryła. */
const PITCH_LIMIT = 1.1;
/** Krok przycisków obrotu. Celowo duży (45°): przyciski są ścieżką dostępności
 *  dla kogoś, kto nie przeciąga myszą, a przy drobnym kroku obejrzenie bryły
 *  z drugiej strony kosztowałoby kilkanaście kliknięć. */
const STEP = Math.PI / 4;
/** Ruch większy niż tyle pikseli to już przeciąganie, a nie klik w część bryły. */
const DRAG_SLOP = 5;

/**
 * Klikanie po częściach bryły. Klikalne jest wyłącznie to, co w danym ustawieniu
 * **widać** — dzięki temu policzenie wszystkich sześciu ścian wymaga obrócenia
 * bryły, a nie tylko cierpliwości.
 */
export interface SolidPicking {
  part: SolidPart;
  /** Zaznaczone elementy: `face.id`, `edge.id` albo indeks wierzchołka jako string. */
  marked: string[];
  onPick: (id: string) => void;
}

/** Bryła do pokazania: prostopadłościan opisany wymiarami albo dowolny
 *  wielościan z `lib/solids.ts` (graniastosłup, ostrosłup, …). Dokładnie jedno. */
type SolidSource =
  | { spec: BoxSpec; polyhedron?: never }
  | { polyhedron: Polyhedron; spec?: never };

type SolidSpinnerProps = SolidSource & {
  color: string;
  /** Która część bryły jest w tej chwili wyróżniona (klik chipa obok). */
  highlight?: SolidPart | null;
  /** `false` = rysunek pokazuje wyłącznie to, co widać z zewnątrz (bez linii przerywanych). */
  showHidden?: boolean;
  /** Włącza klikanie po częściach bryły — patrz `SolidPicking`. */
  picking?: SolidPicking;
  /** Zaznaczone elementy bez włączania klikania (widżet steruje bryłą skądinąd). */
  marked?: string[];
  ariaLabel: string;
  className?: string;
};

function centroidOf(points: SolidPoint[]): SolidPoint {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: round3(sum.x / points.length), y: round3(sum.y / points.length) };
}

/**
 * Prostopadłościan, który dziecko obraca **przeciągnięciem** — pierwszy widżet
 * kursu z ruchem kamery wokół bryły (`ZoomOutWorld` przesuwał kadr, ale scena
 * była płaska). Obrót jest po to, żeby zobaczyć na własne oczy, że ścian jest
 * sześć, a nie trzy: trzy pozostałe są po prostu z drugiej strony.
 *
 * Rysunek trzyma się konwencji rysunku technicznego, której uczy przewodnik
 * `jezyk-bryl`: krawędzie widoczne — linia ciągła, krawędzie zasłonięte — linia
 * przerywana. O tym, która jest która, decyduje `projectPolyhedron` (normalne
 * ścian), nigdy ręcznie wpisana lista.
 *
 * Przeciąganie jest wygodą, nie jedynym sterowaniem — obok stoją przyciski
 * obrotu i reset (ta sama zasada co w `PowerDial`).
 *
 * Współdzielony (`components/`, nie folder jednej lekcji) — pierwszym
 * konsumentem był przewodnik `jezyk-bryl`, drugim lekcja
 * `opis-prostopadloscianu`; ta sama zasada „promuj po drugim użyciu" co przy
 * `NumberLine`/`FactTriangle`/`PartChip`.
 *
 * Uwaga na przyszłe zmiany: obrót celowo NIE używa `setPointerCapture`, tylko
 * nasłuchu na `window`. Przechwycenie wskaźnika przekierowałoby też `click` na
 * samo `<svg>`, więc tryb `picking` (klikanie w pojedyncze ściany i krawędzie)
 * przestałby działać.
 */
export function SolidSpinner({
  spec,
  polyhedron,
  color,
  highlight = null,
  showHidden = true,
  picking,
  marked,
  ariaLabel,
  className,
}: SolidSpinnerProps) {
  const [yaw, setYaw] = useState(START_YAW);
  const [pitch, setPitch] = useState(START_PITCH);
  const [dragging, setDragging] = useState(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  const solid = useMemo(
    () =>
      projectPolyhedron(polyhedron ?? boxPolyhedron(spec as BoxSpec), {
        yaw,
        pitch,
        scale: SCALE,
      }),
    [spec, polyhedron, yaw, pitch]
  );

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    last.current = { x: event.clientX, y: event.clientY };
    moved.current = false;
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: PointerEvent) => {
      const from = last.current;
      if (!from) return;
      const dx = event.clientX - from.x;
      const dy = event.clientY - from.y;
      if (Math.abs(dx) > DRAG_SLOP || Math.abs(dy) > DRAG_SLOP) moved.current = true;
      last.current = { x: event.clientX, y: event.clientY };
      setYaw((prev) => prev + dx * 0.011);
      setPitch((prev) => Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, prev + dy * 0.009)));
    };
    const onUp = () => {
      setDragging(false);
      last.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging]);

  /** Klik liczy się tylko wtedy, gdy nie był końcem przeciągania. */
  const pick = (id: string) => {
    if (moved.current || !picking) return;
    picking.onPick(id);
  };

  const isMarked = (id: string) => (picking?.marked ?? marked ?? []).includes(id);
  const pickable = (part: SolidPart) => picking?.part === part;

  const faceFill = highlight === 'sciany' ? `${color}4d` : `${color}26`;
  const edgeWidth = highlight === 'krawedzie' ? 4.5 : 2.5;
  const vertexRadius = highlight === 'wierzcholki' ? 6.5 : 3.5;

  return (
    <div className={cn('select-none', className)}>
      <svg
        viewBox={`${-VIEW} ${-VIEW} ${2 * VIEW} ${2 * VIEW}`}
        className={cn(
          'mx-auto h-auto w-full max-w-[300px] touch-none',
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        role="img"
        aria-label={ariaLabel}
        data-solid-spinner
        data-dragging={dragging || undefined}
        onPointerDown={handlePointerDown}
      >
        {/* Ściany od najdalszej — rysujemy tylko zwrócone do patrzącego; przy
            bryle wypukłej reszta i tak byłaby zamalowana. */}
        {solid.faces
          .filter((face) => face.visible)
          .map((face) => (
            <polygon
              key={face.id}
              points={face.points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill={isMarked(face.id) ? `${color}73` : faceFill}
              stroke="none"
              className={pickable('sciany') ? 'cursor-pointer' : undefined}
              onClick={pickable('sciany') ? () => pick(face.id) : undefined}
              data-face={face.id}
              data-marked={isMarked(face.id) || undefined}
            />
          ))}

        {/* Krawędzie zasłonięte — linia przerywana NA WIERZCHU ścian, bo to
            właśnie „prześwietlenie” bryły, a nie element pod spodem. */}
        {showHidden &&
          solid.edges
            .filter((edge) => edge.hidden)
            .map((edge) => (
              <line
                key={edge.id}
                x1={edge.a.x}
                y1={edge.a.y}
                x2={edge.b.x}
                y2={edge.b.y}
                stroke={color}
                strokeOpacity={isMarked(edge.id) ? 0.85 : 0.55}
                strokeWidth={isMarked(edge.id) ? edgeWidth * 1.9 : edgeWidth * 0.8}
                strokeDasharray="7 6"
                strokeLinecap="round"
                data-edge="hidden"
                data-marked={isMarked(edge.id) || undefined}
              />
            ))}

        {solid.edges
          .filter((edge) => !edge.hidden)
          .map((edge) => (
            <line
              key={edge.id}
              x1={edge.a.x}
              y1={edge.a.y}
              x2={edge.b.x}
              y2={edge.b.y}
              stroke={color}
              strokeWidth={isMarked(edge.id) ? edgeWidth * 2.2 : edgeWidth}
              strokeOpacity={isMarked(edge.id) ? 1 : 0.9}
              strokeLinecap="round"
              data-edge="visible"
              data-marked={isMarked(edge.id) || undefined}
            />
          ))}

        {solid.vertices
          .filter((vertex) => showHidden || !vertex.hidden)
          .map((vertex) => (
            <circle
              key={vertex.index}
              cx={vertex.point.x}
              cy={vertex.point.y}
              r={isMarked(String(vertex.index)) ? vertexRadius * 1.9 : vertexRadius}
              fill={vertex.hidden ? 'white' : color}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={vertex.hidden ? '3 3' : undefined}
              data-vertex={vertex.hidden ? 'hidden' : 'visible'}
              data-marked={isMarked(String(vertex.index)) || undefined}
            />
          ))}

        {/* Ptaszki na policzonych ścianach — bez nich zaznaczona ściana ginie
            wśród sąsiednich odcieni tego samego koloru. */}
        {pickable('sciany') &&
          solid.faces
            .filter((face) => face.visible && isMarked(face.id))
            .map((face) => {
              const center = centroidOf(face.points);
              return (
                <circle
                  key={`dot-${face.id}`}
                  cx={center.x}
                  cy={center.y}
                  r={6}
                  fill={color}
                  pointerEvents="none"
                />
              );
            })}

        {/* Warstwa celów klikania — grube, przezroczyste kształty NA WIERZCHU,
            bo sama krawędź (2,5 px) i wierzchołek (3,5 px) są za cienkie na palec. */}
        {pickable('krawedzie') &&
          solid.edges
            .filter((edge) => !edge.hidden)
            .map((edge) => (
              <line
                key={`hit-${edge.id}`}
                x1={edge.a.x}
                y1={edge.a.y}
                x2={edge.b.x}
                y2={edge.b.y}
                stroke="transparent"
                strokeWidth={18}
                strokeLinecap="round"
                pointerEvents="stroke"
                className="cursor-pointer"
                onClick={() => pick(edge.id)}
                data-hit={edge.id}
              />
            ))}

        {pickable('wierzcholki') &&
          solid.vertices
            .filter((vertex) => !vertex.hidden)
            .map((vertex) => (
              <circle
                key={`hit-${vertex.index}`}
                cx={vertex.point.x}
                cy={vertex.point.y}
                r={14}
                fill="transparent"
                pointerEvents="all"
                className="cursor-pointer"
                onClick={() => pick(String(vertex.index))}
                data-hit={vertex.index}
              />
            ))}
      </svg>

      {/* Cztery kierunki, nie dwa: przy samym obrocie w poziomie dolna ściana
          NIGDY nie wychodzi na wierzch (kamera stoi nad bryłą), więc widżet
          liczący wszystkie sześć ścian byłby nie do skończenia bez myszy. */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <SpinButton label="Obróć w lewo" color={color} onClick={() => setYaw((p) => p - STEP)}>
          <RotateCcw className="h-4 w-4" aria-hidden />
        </SpinButton>
        <SpinButton
          label="Obróć do góry"
          color={color}
          onClick={() => setPitch((p) => Math.max(-PITCH_LIMIT, p - STEP))}
        >
          <ChevronUp className="h-4 w-4" aria-hidden />
        </SpinButton>
        <SpinButton
          label="Ustaw jak na początku"
          color={color}
          onClick={() => {
            setYaw(START_YAW);
            setPitch(START_PITCH);
          }}
        >
          <Undo2 className="h-4 w-4" aria-hidden />
        </SpinButton>
        <SpinButton
          label="Obróć do dołu"
          color={color}
          onClick={() => setPitch((p) => Math.min(PITCH_LIMIT, p + STEP))}
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </SpinButton>
        <SpinButton label="Obróć w prawo" color={color} onClick={() => setYaw((p) => p + STEP)}>
          <RotateCw className="h-4 w-4" aria-hidden />
        </SpinButton>
      </div>
      <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Chwyć bryłę i obróć ją
      </p>
    </div>
  );
}

interface SpinButtonProps {
  label: string;
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}

function SpinButton({ label, color, onClick, children }: SpinButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors hover:opacity-70"
      style={{ borderColor: `${color}59`, color }}
    >
      {children}
    </button>
  );
}

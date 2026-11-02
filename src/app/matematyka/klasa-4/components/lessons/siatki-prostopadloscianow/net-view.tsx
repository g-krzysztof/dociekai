'use client';

import type { BoxSpec } from '../../../lib/solids';
import {
  dimValue,
  foldPieces,
  netBounds,
  netCamera,
  projectNet,
  type FacePairId,
  type NetPiece,
  type NetPoint,
} from '../../../lib/box-net';

/** Kadr rysunku — stały, żeby zmiana wzoru siatki dokładała prostokąty zamiast przeskalowywać całość. */
const VIEW_W = 440;
const VIEW_H = 300;
const PAD = 26;
/** Ile najwyżej może przybliżyć kamera przy pełnym złożeniu. */
const MAX_ZOOM = 2.4;

/**
 * Trzy odcienie koloru modułu — po jednym na parę ścian przeciwległych.
 * Dzięki temu „dno i wieko są identyczne" widać, zanim ktokolwiek to powie.
 */
const PAIR_FILL: Record<FacePairId, string> = {
  'gora-dol': '4d',
  'przod-tyl': '26',
  'lewo-prawo': '73',
  brak: '1a',
};

/** Prostokąt opisany na rzucie — do liczenia skali i wyśrodkowania. */
function extent(faces: { points: NetPoint[] }[]) {
  const xs = faces.flatMap((face) => face.points.map((point) => point.x));
  const ys = faces.flatMap((face) => face.points.map((point) => point.y));
  return {
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    cy: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}

/** Czy podpis mieści się w swojej ścianie poziomo (szacunek szerokości pisma). */
function upright(face: { points: NetPoint[] }, text: string): boolean {
  const { width, height } = extent([face]);
  const needed = text.length * 5.6 + 6;
  return needed <= width || width >= height;
}

interface NetViewProps {
  pieces: NetPiece[];
  /** 0 = siatka leży płasko, 1 = zamknięte pudełko. */
  t: number;
  color: string;
  /** Co pisać na prostokątach: nazwy ścian, wymiary (wtedy `spec`) albo nic.
   *  Wymiary idą bez jednostki — ta stoi raz, w podpisie pod rysunkiem. */
  labels?: 'nazwy' | 'wymiary' | 'none';
  spec?: BoxSpec;
  /** Prostokąty do wyróżnienia — np. dwa, które przy składaniu wchodzą na siebie. */
  highlight?: string[];
  onPick?: (id: string) => void;
  /** Rozmiar największej siatki zestawu — rysunek nie zmienia skali przy przełączaniu wzorów. */
  frame?: { width: number; height: number };
  ariaLabel: string;
  className?: string;
}

/**
 * Rysunek siatki na dowolnym etapie składania. Ten sam komponent rysuje siatkę
 * płasko (`t = 0`), pudełko (`t = 1`) i każdą klatkę pomiędzy — bo wszystkie
 * trzy to ta sama funkcja `foldPieces` z innym argumentem.
 *
 * Kamera jedzie razem ze składaniem (`netCamera`): przy `t = 0` patrzymy na
 * kartkę prostopadle, przy `t = 1` z góry i z boku, czyli tak, jak cały moduł
 * rysuje bryły. Ściany rysują się posortowane malarsko, więc przy złym układzie
 * naprawdę widać, jak dwa prostokąty nachodzą na siebie.
 */
export function NetView({
  pieces,
  t,
  color,
  labels = 'none',
  spec,
  highlight = [],
  onPick,
  frame,
  ariaLabel,
  className,
}: NetViewProps) {
  const size = frame ?? netBounds(pieces);
  const flatScale = Math.min((VIEW_W - 2 * PAD) / size.width, (VIEW_H - 2 * PAD) / size.height);

  // Kamera dojeżdża do bryły w miarę składania: płaska siatka zajmuje cały kadr,
  // a złożone pudełko jest od niej dużo mniejsze i bez tego zostawałoby samotną
  // figurką pośrodku pustego prostokąta. Skala przy `t = 0` pozostaje wspólna
  // dla wszystkich wzorów (liczy się z `frame`), więc przełączenie wzoru nadal
  // nie zmienia wielkości kwadratów.
  const closed = extent(projectNet(foldPieces(pieces, 1), netCamera(1, 1)));
  const closedScale =
    closed.width > 0.01 && closed.height > 0.01
      ? Math.min((VIEW_W - 2 * PAD) / closed.width, (VIEW_H - 2 * PAD) / closed.height)
      : flatScale;
  const zoomed = Math.min(Math.max(flatScale, closedScale), flatScale * MAX_ZOOM);
  const scale = flatScale + (zoomed - flatScale) * t;

  const projected = projectNet(foldPieces(pieces, t), netCamera(t, scale));

  const { cx, cy } = extent(projected);

  // Podpisy znikają, gdy tylko siatka zaczyna się podnosić — na obracającym się
  // prostokącie tekst i tak przestaje być czytelny.
  const labelOpacity = Math.max(0, 1 - t * 8);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={className ?? 'h-auto w-full'}
      role="img"
      aria-label={ariaLabel}
    >
      <g transform={`translate(${VIEW_W / 2 - cx} ${VIEW_H / 2 - cy})`}>
        {projected.map((face) => {
          const marked = highlight.includes(face.id);
          const piece = pieces.find((item) => item.id === face.id);
          const text =
            labels === 'nazwy'
              ? (piece?.short ?? '')
              : labels === 'wymiary' && spec && piece?.dims
                ? `${dimValue(spec, piece.dims[0])} × ${dimValue(spec, piece.dims[1])}`
                : null;

          return (
            <g key={face.id}>
              {/* Podkład w kolorze karty — bez niego ściany prześwitują przez
                  siebie i złożone pudełko wygląda jak szklane. */}
              <polygon
                points={face.points.map((point) => `${point.x},${point.y}`).join(' ')}
                className="fill-white dark:fill-zinc-900"
              />
              <polygon
                points={face.points.map((point) => `${point.x},${point.y}`).join(' ')}
                fill={marked ? '#dc2626' : `${color}${PAIR_FILL[face.pair]}`}
                fillOpacity={marked ? 0.45 : 1}
                stroke={marked ? '#b91c1c' : color}
                strokeWidth={marked ? 2.5 : 1.5}
                strokeLinejoin="round"
                onClick={onPick ? () => onPick(face.id) : undefined}
                className={onPick ? 'cursor-pointer' : undefined}
              />
              {text && labelOpacity > 0.02 && (
                <text
                  x={face.center.x}
                  y={face.center.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  opacity={labelOpacity}
                  // Wąski i wysoki prostokąt dostaje podpis pionowo — inaczej
                  // tekst wychodzi poza swoją ścianę i siada na sąsiedniej.
                  transform={
                    upright(face, text) ? undefined : `rotate(-90 ${face.center.x} ${face.center.y})`
                  }
                  // Podpis leży NA barwnej ścianie, więc bierze kolor neutralny,
                  // a nie kolor modułu — ten przy ciemnym motywie zlewałby się z tłem.
                  className="fill-zinc-700 text-[11px] font-semibold dark:fill-zinc-100"
                >
                  {text}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

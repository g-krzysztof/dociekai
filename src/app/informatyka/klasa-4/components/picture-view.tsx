'use client';

import type { CSSProperties, PointerEventHandler, ReactNode, Ref } from 'react';
import { cn } from '@/lib/utils';


/** Biel płótna — tło, którym „rozmiar płótna” dokłada miejsce, i tło kartki. */
export const PAPER = '#ffffff';

/** Obraz rastrowy: szerokość, wysokość i kolory komórek wierszami. */
export interface Picture {
  w: number;
  h: number;
  cells: string[];
}

export const at = (w: number, x: number, y: number) => y * w + x;

/**
 * Podgląd obrazka — wspólny dla lekcji modułu 3.
 *
 * Wypromowany z `lessons/rozmiar-i-napisy/` w chwili, gdy `formaty-i-kartka`
 * stała się jego drugim konsumentem („promote on second use” — ta sama zasada
 * co `LessonImageCard` czy `useSectionScrollAnchor`). Razem z nim przyjechał tu
 * typ `Picture` i stała `PAPER`, bo obie lekcje operują na tym samym modelu.
 *
 * Rysuje każdy piksel jako osobny prostokąt w układzie współrzędnych samego
 * obrazka (`viewBox="0 0 w h"`), więc jedna komórka to zawsze jedna jednostka.
 * Dzięki temu widżet steruje wielkością pikseli **szerokością pudełka na
 * ekranie**, a nie przeliczaniem współrzędnych — a napisy z `CaptionLab` da się
 * pozycjonować w pikselach obrazu, tak jak robi to prawdziwy edytor.
 *
 * `shapeRendering="crispEdges"` jest tu obowiązkowe: bez niego przeglądarka
 * wygładza krawędzie sąsiednich prostokątów i przez środek obrazka lecą jasne
 * szpary.
 */
interface PictureViewProps {
  pic: Picture;
  /** Uchwyt na `<svg>` — potrzebny wszędzie, gdzie widżet przelicza punkt ekranu na piksel. */
  ref?: Ref<SVGSVGElement>;
  /** Podpis dla czytnika ekranu — obraz jest treścią, nie dekoracją. */
  label: string;
  className?: string;
  style?: CSSProperties;
  /** Warstwa rysowana na obrazku (ramka kadru, napisy) — w jednostkach obrazu. */
  children?: ReactNode;
  onPointerDown?: PointerEventHandler<SVGSVGElement>;
  onPointerMove?: PointerEventHandler<SVGSVGElement>;
  onPointerUp?: PointerEventHandler<SVGSVGElement>;
}

export function PictureView({
  pic,
  ref,
  label,
  className,
  style,
  children,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: PictureViewProps) {
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${pic.w} ${pic.h}`}
      className={cn('block h-auto w-full', className)}
      style={style}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <rect x={0} y={0} width={pic.w} height={pic.h} fill={PAPER} />
      {pic.cells.map((color, i) =>
        color === PAPER ? null : (
          <rect
            key={i}
            x={i % pic.w}
            y={Math.floor(i / pic.w)}
            width={1}
            height={1}
            fill={color}
          />
        )
      )}
      {children}
    </svg>
  );
}

/** Szachownica „tu nic nie ma” pod obrazkiem — jak w edytorze grafiki. */
export function CheckerDefs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width={2} height={2} patternUnits="userSpaceOnUse">
        <rect x={0} y={0} width={2} height={2} fill="#ffffff" />
        <rect x={0} y={0} width={1} height={1} fill="#e6e6e6" />
        <rect x={1} y={1} width={1} height={1} fill="#e6e6e6" />
      </pattern>
    </defs>
  );
}

/** Zamiana punktu na ekranie na współrzędne piksela obrazu. */
export function toPixel(
  event: { clientX: number; clientY: number },
  svg: SVGSVGElement | null,
  pic: Picture
): { x: number; y: number } {
  const rect = svg?.getBoundingClientRect();
  if (!rect || rect.width === 0) return { x: 0, y: 0 };
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * pic.w);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * pic.h);
  return {
    x: Math.min(pic.w - 1, Math.max(0, x)),
    y: Math.min(pic.h - 1, Math.max(0, y)),
  };
}

'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from 'react';
import type { AxisPin } from '../../lib/timeline/axis-model';
import {
  assignLanes,
  centuryMarks,
  eraBands,
  GAP_PX,
  gapU,
  ticksFor,
  uToPx,
  type TimelineMode,
} from '../../lib/timeline/scale';

/**
 * Rysunek Osi dziejów — silnik `timeline`, sama prezentacja. Nie wie nic
 * o postępie ani o magazynach: dostaje gotowe punkty (`AxisPin[]`) i tryb.
 *
 * Od góry: opcjonalna „taca” (`trayHeight`, na pinezkę do przypięcia) → rzędy
 * podpisów → pas osi pokolorowany epokami, z pinezkami → nazwy epok →
 * podziałka. Szczelina roku zero jest przerwą w pasie z jedną pionową kreską
 * (granica p.n.e./n.e.) — nie „//”, bo na rysunku technicznym to znak przerwy
 * w skali, a skala jest ciągła. Pełny komentarz o roku zero należy do L8.
 */

export const LANE_H = 22;
const STRIP_H = 18;
const STEM_GAP = 8;
const ERA_ROW_H = 14;
const TICK_ROW_H = 16;
const CENTURY_ROW_H = 16;
const PAD_LINE = 12;

/** Szerokość podpisu na oko, z zapasem — wystarcza do rozkładania rzędów (11 px, font bezszeryfowy). */
export const labelWidth = (text: string) => Math.round(text.length * 6.6 + 20);

export interface TimelineAxisLayout {
  width: number;
  /** Środek pasa osi w pionie (px od góry). */
  axisY: number;
  /** `u` → px w poziomie, z uwzględnieniem szczeliny. */
  x: (u: number, afterGap: boolean) => number;
}

interface TimelineAxisProps {
  mode: TimelineMode;
  now: number;
  pins: AxisPin[];
  /** Kolor pinezek rdzenia — zwykle kolor modułu lekcji. */
  color: string;
  showEras?: boolean;
  maxLanes?: number;
  /** Miejsce nad podpisami na pinezkę, którą dziecko dopiero przypina. */
  trayHeight?: number;
  /** Rząd wieków w cyfrach rzymskich pod podziałką (od L7; tylko tryb liniowy). */
  showCenturies?: boolean;
  /** Pinezki wyróżnione (np. sąsiad z werdyktu). */
  highlightIds?: string[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Warstwa nad osią (np. przeciągana pinezka) — dostaje wymiary po zmierzeniu. */
  overlay?: (layout: TimelineAxisLayout) => ReactNode;
  trackRef?: Ref<HTMLDivElement>;
}

export function TimelineAxis({
  mode,
  now,
  pins,
  color,
  showEras = true,
  maxLanes = 3,
  trayHeight = 0,
  showCenturies = false,
  highlightIds = [],
  selectedId = null,
  onSelect,
  overlay,
  trackRef,
}: TimelineAxisProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = boxRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const lanesTop = trayHeight;
  const axisY = lanesTop + maxLanes * LANE_H + STEM_GAP + STRIP_H / 2;
  const stripTop = axisY - STRIP_H / 2;
  const centuries = useMemo(
    () => (showCenturies ? centuryMarks(mode, now, width) : []),
    [showCenturies, mode, now, width]
  );
  const centuryTop = stripTop + STRIP_H + (showEras ? ERA_ROW_H : 0) + TICK_ROW_H + 2;
  const height = centuryTop + (centuries.length ? CENTURY_ROW_H : 0) + 2;

  const x = (u: number, afterGap: boolean) => uToPx(u, afterGap, width);
  const g = gapU(mode, now);
  const gapLeft = width ? uToPx(g, false, width) : 0;

  const lanes = useMemo(
    () =>
      width
        ? assignLanes(
            pins.map((pin) => ({
              id: pin.id,
              px: uToPx(pin.u, pin.afterGap, width),
              labelPx: labelWidth(pin.beforeRange ? `‹ ${pin.label}` : pin.label),
            })),
            maxLanes,
            6,
            width
          )
        : {},
    [pins, width, maxLanes]
  );

  const clampLabel = (center: number, w: number) => Math.min(Math.max(center - w / 2, 0), width - w);
  const layout: TimelineAxisLayout = { width, axisY, x };

  const setRefs = (node: HTMLDivElement | null) => {
    boxRef.current = node;
    if (typeof trackRef === 'function') trackRef(node);
    else if (trackRef) (trackRef as { current: HTMLDivElement | null }).current = node;
  };

  return (
    <div ref={setRefs} className="relative w-full select-none" style={{ height }}>
      {width > 0 && (
        <>
          {/* Pas osi: epoki jako tła, przerwa roku zero */}
          <div
            className="absolute overflow-hidden rounded-full border border-border bg-muted/40"
            style={{ top: stripTop, left: 0, right: 0, height: STRIP_H }}
            aria-hidden
          >
            {showEras &&
              eraBands(mode, now).map((band) => {
                const left = band.fromU === 0 ? 0 : x(band.fromU, band.fromAfterGap);
                const right = band.toU === 1 ? width : x(band.toU, band.toAfterGap);
                return (
                  <div
                    key={band.era.id}
                    className="absolute inset-y-0"
                    style={{ left, width: Math.max(0, right - left), background: band.era.color }}
                  />
                );
              })}
          </div>

          {/* Mgła pinezek „bez daty” (legenda) — rozmyty pas na osi */}
          {pins
            .filter((pin) => pin.mist)
            .map((pin) => {
              const m = pin.mist!;
              const left = x(m.fromU, m.fromAfterGap);
              const right = x(m.toU, m.toAfterGap);
              return (
                <div
                  key={`mgla-${pin.id}`}
                  className="absolute"
                  style={{
                    top: stripTop - 6,
                    left,
                    width: Math.max(8, right - left),
                    height: STRIP_H + 12,
                    background: 'radial-gradient(ellipse at center, color-mix(in oklch, var(--muted-foreground) 55%, transparent), transparent 75%)',
                    filter: 'blur(2px)',
                  }}
                  aria-hidden
                />
              );
            })}

          {/* Szczelina roku zero — przerwa w pasie z jedną pionową kreską: granica er, nie przerwa w skali */}
          <div
            className="absolute bg-background"
            style={{ top: stripTop - 3, left: gapLeft, width: GAP_PX, height: STRIP_H + 6 }}
            aria-hidden
          >
            <svg width={GAP_PX} height={STRIP_H + 6} className="text-muted-foreground">
              <line x1={GAP_PX / 2} y1={0} x2={GAP_PX / 2} y2={STRIP_H + 6} stroke="currentColor" strokeWidth={1.5} />
            </svg>
          </div>

          {/* Nazwy epok — tylko tam, gdzie pas jest dość szeroki na podpis */}
          {showEras &&
            eraBands(mode, now).map((band) => {
              const left = band.fromU === 0 ? 0 : x(band.fromU, band.fromAfterGap);
              const right = band.toU === 1 ? width : x(band.toU, band.toAfterGap);
              const w = labelWidth(band.era.label) - 8;
              if (right - left < w) return null;
              return (
                <span
                  key={band.era.id}
                  className="absolute truncate text-center text-[10px] italic leading-none text-muted-foreground"
                  style={{ top: stripTop + STRIP_H + 3, left, width: right - left }}
                >
                  {band.era.label}
                </span>
              );
            })}

          {/* Podziałka */}
          {ticksFor(mode, now).map((tick) => {
            const px = x(tick.u, tick.afterGap);
            const w = labelWidth(tick.label) - 10;
            return (
              <div key={tick.label} aria-hidden>
                <span
                  className="absolute w-px bg-muted-foreground/60"
                  style={{ left: px, top: stripTop + STRIP_H - (tick.major ? 7 : 4), height: tick.major ? 7 : 4 }}
                />
                {tick.major && (
                  <span
                    className="absolute whitespace-nowrap text-center text-[10px] leading-none tabular-nums text-muted-foreground"
                    style={{
                      top: stripTop + STRIP_H + (showEras ? ERA_ROW_H : 0) + 4,
                      left: clampLabel(px, w),
                      width: w,
                    }}
                  >
                    {tick.label}
                  </span>
                )}
              </div>
            );
          })}

          {/* Wieki rzymskie: kreska na granicy wieku, podpis w środku; p.n.e. kursywą (po lewej od szczeliny) */}
          {centuries.length > 0 && (
            <div aria-hidden>
              <span
                className="absolute h-px bg-muted-foreground/30"
                style={{ left: PAD_LINE, right: PAD_LINE, top: centuryTop }}
              />
              {centuries.map((mark) => {
                const edge = x(mark.edgeU, mark.afterGap);
                const mid = x(mark.midU, mark.afterGap);
                return (
                  <div key={`${mark.bc ? 'p' : 'n'}${mark.century}`}>
                    <span
                      className="absolute w-px bg-muted-foreground/40"
                      style={{ left: edge, top: centuryTop, height: mark.labeled ? 5 : 3 }}
                    />
                    {mark.labeled && (
                      <span
                        className={`absolute -translate-x-1/2 whitespace-nowrap font-serif text-[10px] leading-none text-muted-foreground ${mark.bc ? 'italic' : 'font-semibold'}`}
                        style={{ left: mid, top: centuryTop + 5 }}
                      >
                        {mark.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pinezki: łodyga od podpisu do kropki na pasie */}
          {pins.map((pin) => {
            const px = x(pin.u, pin.afterGap);
            const lane = lanes[pin.id];
            const highlighted = highlightIds.includes(pin.id);
            const selected = selectedId === pin.id;
            const text = pin.beforeRange ? `‹ ${pin.label}` : pin.label;
            const w = labelWidth(text);
            const labelTop = lane == null ? null : lanesTop + (maxLanes - 1 - lane) * LANE_H;
            const dotColor = pin.variant === 'personal' ? 'var(--foreground)' : color;
            return (
              <div key={pin.id}>
                {labelTop != null && (
                  <span
                    className="absolute w-px"
                    style={{
                      left: px,
                      top: labelTop + LANE_H - 3,
                      height: axisY - (labelTop + LANE_H - 3),
                      background: dotColor,
                      opacity: highlighted || selected ? 0.9 : 0.35,
                    }}
                    aria-hidden
                  />
                )}
                {labelTop != null && (
                  <button
                    type="button"
                    onClick={() => onSelect?.(selected ? null : pin.id)}
                    className={`absolute truncate rounded-full border px-1.5 text-[11px] leading-[18px] transition-colors ${
                      highlighted
                        ? 'border-destructive bg-destructive/10 font-semibold text-foreground'
                        : selected
                          ? 'border-foreground bg-background font-semibold text-foreground'
                          : 'border-border bg-background text-foreground/85'
                    } ${pin.variant === 'uncertain' ? 'border-dashed' : ''} ${pin.variant === 'legend' ? 'border-dotted italic' : ''}`}
                    style={{ top: labelTop, left: clampLabel(px, w), width: w, height: 20 }}
                    title={`${pin.label} — ${pin.when}`}
                  >
                    {text}
                  </button>
                )}
                <button
                  type="button"
                  aria-label={`${pin.label}, ${pin.when}`}
                  onClick={() => onSelect?.(selected ? null : pin.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5"
                  style={{ left: px, top: axisY }}
                >
                  <span
                    className={`block h-2.5 w-2.5 rounded-full ${pin.variant === 'uncertain' || pin.variant === 'legend' ? 'border-2 border-dashed bg-background' : pin.variant === 'personal' ? 'border-2 bg-background' : ''}`}
                    style={{
                      background: pin.variant === 'core' ? dotColor : undefined,
                      borderColor: dotColor,
                      boxShadow: highlighted || selected
                        ? `0 0 0 3px color-mix(in oklch, ${highlighted ? 'var(--destructive)' : 'var(--foreground)'} 25%, transparent)`
                        : undefined,
                    }}
                  />
                </button>
              </div>
            );
          })}

          {overlay?.(layout)}
        </>
      )}
    </div>
  );
}

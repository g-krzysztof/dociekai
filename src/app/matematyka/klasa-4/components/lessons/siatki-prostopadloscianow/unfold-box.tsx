'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NetView } from './net-view';
import { useFoldValue } from './use-fold';
import {
  buildBoxNet,
  netBounds,
  netFaceGroups,
  DIM_LABEL,
  NET_PATTERNS,
  type NetPatternId,
} from '../../../lib/box-net';
import type { BoxSpec } from '../../../lib/solids';

/** Pudełko, które rozkładamy — te same liczby wracają w podpisach i w legendzie par. */
const SPEC: BoxSpec = { width: 6, depth: 4, height: 3 };
const UNIT = 'cm';

/** Wspólny kadr dla wszystkich trzech wzorów — przełączenie wzoru nie może przeskalować rysunku. */
const FRAME = NET_PATTERNS.reduce(
  (acc, pattern) => {
    const bounds = netBounds(buildBoxNet(SPEC, pattern.id));
    return { width: Math.max(acc.width, bounds.width), height: Math.max(acc.height, bounds.height) };
  },
  { width: 0, height: 0 }
);

/**
 * Rozkładanie pudełka — flagowa interakcja lekcji o siatkach i pierwszy widżet
 * kursu, w którym **rysunek płaski i bryła to ten sam obiekt w dwóch skrajnych
 * położeniach jednego suwaka**. Każda ściana obraca się wokół swojego zawiasu
 * (`foldPieces` z `lib/box-net.ts`), a kamera jedzie razem z ruchem: przy
 * złożonym pudełku patrzymy z góry i z boku, przy rozłożonej siatce —
 * prostopadle na kartkę.
 *
 * Trzy wzory siatki opisują **to samo pudełko** rozcięte wzdłuż innych
 * krawędzi. Krok kończy się dopiero po rozłożeniu wszystkich trzech, bo to
 * właśnie kontrast między nimi niesie treść: siatka nie jest jedna.
 *
 * Kolory prostokątów idą z par ścian przeciwległych, więc „dno i wieko są
 * identyczne" widać, zanim padnie zdanie.
 */
export function UnfoldBox({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [pattern, setPattern] = useState<NetPatternId>('krzyz');
  const [seen, setSeen] = useState<Set<NetPatternId>>(new Set());
  const [dragging, setDragging] = useState(false);
  /** 0 = zamknięte pudełko, 1 = siatka leżąca płasko. */
  const { value: open, set: setOpen, nudge, animateTo, stop } = useFoldValue(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const pieces = buildBoxNet(SPEC, pattern);
  const groups = netFaceGroups(SPEC);
  const current = NET_PATTERNS.find((item) => item.id === pattern) as (typeof NET_PATTERNS)[number];
  const finished = seen.size === NET_PATTERNS.length;

  const setFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    setOpen((clientX - rect.left) / rect.width);
  };

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    stop();
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event.clientX);
  };

  // Rozłożenie do końca zalicza wzór — a trzy zaliczone wzory kończą krok.
  useEffect(() => {
    if (open < 0.985) return;
    setSeen((prev) => (prev.has(pattern) ? prev : new Set(prev).add(pattern)));
  }, [open, pattern]);

  useEffect(() => {
    if (seen.size === NET_PATTERNS.length) completeRef.current?.();
  }, [seen]);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm font-semibold" style={{ color: textColor }}>
          Pudełko {SPEC.width} {UNIT} × {SPEC.depth} {UNIT} × {SPEC.height} {UNIT}
        </p>
        <div className="flex items-center gap-2">
          {NET_PATTERNS.map((item) => (
            <span
              key={item.id}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: seen.has(item.id) ? color : `${color}33` }}
              aria-hidden
            />
          ))}
          <span className="text-xs font-semibold text-muted-foreground">
            rozłożone wzory: {seen.size} z {NET_PATTERNS.length}
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {NET_PATTERNS.map((item) => {
          const active = item.id === pattern;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPattern(item.id)}
              className={cn(
                'cursor-pointer border px-3 py-1.5 text-sm font-semibold transition-colors',
                !active && 'hover:opacity-70'
              )}
              style={
                active
                  ? { borderColor: color, backgroundColor: `${color}14`, color: textColor }
                  : { borderColor: `${color}40` }
              }
              aria-pressed={active}
            >
              rozcięcie „{item.name}”
              {seen.has(item.id) && <Check className="ml-1 inline h-3.5 w-3.5" aria-hidden />}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
        <div className="border" style={{ borderColor: `${color}33` }}>
          <NetView
            pieces={pieces}
            t={1 - open}
            color={color}
            labels="nazwy"
            frame={FRAME}
            ariaLabel={
              open > 0.5
                ? `Siatka pudełka rozłożona na płasko, wzór „${current.name}”`
                : 'Złożone pudełko'
            }
          />
        </div>

        <ul className="space-y-2">
          <li className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            trzy pary identycznych ścian
          </li>
          {groups.map((group) => (
            <li key={group.pair} className="flex items-start gap-2 text-sm">
              <span
                className="mt-0.5 h-4 w-4 shrink-0 border"
                style={{
                  backgroundColor: `${color}${group.pair === 'gora-dol' ? '4d' : group.pair === 'przod-tyl' ? '26' : '73'}`,
                  borderColor: color,
                }}
                aria-hidden
              />
              <span className="leading-snug">
                {group.label}
                <span className="block font-mono text-xs tabular-nums text-muted-foreground">
                  {group.sides[0]} × {group.sides[1]} {UNIT} ({DIM_LABEL[group.dims[0]]} ×{' '}
                  {DIM_LABEL[group.dims[1]]})
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suwak: pełny obszar dotykowy ma zapas w pionie, żeby gałka mieściła
          się w prostokącie elementu łapiącego zdarzenia. */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Stopień rozłożenia pudełka"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(open * 100)}
        aria-valuetext={`${Math.round(open * 100)}% rozłożenia`}
        onPointerDown={startDrag}
        onPointerMove={(event) => dragging && setFromPointer(event.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            nudge(0.05);
            event.preventDefault();
          }
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            nudge(-0.05);
            event.preventDefault();
          }
        }}
        className="mt-5 cursor-ew-resize touch-none select-none py-6"
      >
        <div className="relative h-2" style={{ backgroundColor: `${color}26` }}>
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${open * 100}%`, backgroundColor: color }}
          />
          <motion.span
            className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow-sm dark:bg-zinc-900"
            style={{ left: `${open * 100}%`, borderColor: color }}
            animate={{ scale: dragging ? 1.15 : 1 }}
            aria-hidden
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground">
          <span>pudełko</span>
          <span>siatka</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => animateTo(1)}
          className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:opacity-70"
          style={{ borderColor: color, color: textColor }}
        >
          Rozłóż
        </button>
        <button
          type="button"
          onClick={() => animateTo(0)}
          className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:opacity-70"
          style={{ borderColor: `${color}59`, color: textColor }}
        >
          Złóż z powrotem
        </button>
      </div>

      <p className="mt-4 border-l-4 pl-4 text-sm leading-relaxed sm:text-base" style={{ borderColor: color }}>
        {open > 0.6 ? (
          current.note
        ) : (
          <>
            Przeciągnij suwak albo naciśnij <strong>Rozłóż</strong> — ściany odchylą się po
            krawędziach, tak jak karton, z którego zdjęto taśmę. Nic nie ubywa i nic nie dochodzi:
            te same sześć ścian, tylko na płasko.
          </>
        )}
      </p>

      {finished && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-3 border p-3 text-sm leading-relaxed sm:text-base"
          style={{ backgroundColor: `${color}0f`, borderColor: `${color}59` }}
        >
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
          <span>
            Trzy różne siatki, a pudełko za każdym razem to samo. To dlatego, że{' '}
            <strong style={{ color: textColor }}>siatka zależy od tego, wzdłuż których krawędzi
            rozetniesz bryłę</strong> — a rozciąć da się na wiele sposobów.
          </span>
        </motion.p>
      )}

      {/* Opisy wszystkich wzorów zawsze w DOM — widżet odsłania je po kolei,
          ale treść nie może istnieć wyłącznie w stanie po kliknięciu. */}
      <ul className="sr-only">
        {NET_PATTERNS.map((item) => (
          <li key={item.id}>
            Siatka „{item.name}”: {item.note}
          </li>
        ))}
      </ul>
    </div>
  );
}

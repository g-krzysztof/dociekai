'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowRight, Coins, CookingPot, MousePointerClick, Paintbrush, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DIG_LAYERS,
  FINDS_SHALLOW_FIRST,
  depthLabel,
  findById,
  isFindRevealed,
  judgeFindOrder,
} from './wykopalisko';

const COLS = 12;
const ROWS = 3;
const CELLS_PER_LAYER = COLS * ROWS;

/**
 * Blok 2 — **„Wykopalisko”** (symulator; pierwszy konsument silnika `dig`).
 *
 * Gest nowy w kursie: **dziecko odsłania warstwy ziemi pędzelkiem**
 * (przeciągnięcie ściera komórki warstwy), odczytuje głębokość znaleziska
 * z linijki, a potem układa trzy znaleziska od najpłytszego do najgłębszego.
 * Kolejność wynika z jego własnych pomiarów — regułę **głębiej = dawniej**
 * odkrywa samo (F-I.2-09, F-I.2-10).
 *
 * Warstwy to model do ćwiczenia, nie prawdziwe stanowisko (podpis pod osią).
 */
export function Wykopalisko({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [uncovered, setUncovered] = useState<Record<string, string[]>>({});
  /** Warstwy z faktycznie odsłoniętym znaleziskiem (sędzia `isFindRevealed`). */
  const [revealed, setRevealed] = useState<string[]>([]);
  const [phase, setPhase] = useState<'dig' | 'order' | 'done'>('dig');

  const allRevealed = revealed.length === DIG_LAYERS.length;

  const uncover = (layerId: string, key: string) =>
    setUncovered((prev) => {
      const have = prev[layerId] ?? [];
      if (have.includes(key)) return prev;
      return { ...prev, [layerId]: [...have, key] };
    });

  const markRevealed = (layerId: string) =>
    setRevealed((prev) => (prev.includes(layerId) ? prev : [...prev, layerId]));

  return (
    <div className="space-y-6">
      <p className="text-base leading-relaxed">
        Archeolog nie zgaduje, co leży pod ziemią — <strong>odsłania warstwy jedna po drugiej, od góry, i mierzy, jak
        głęboko coś leżało</strong>. Przeciągnij palcem po warstwie jak pędzelkiem i zobacz, co się pod nią kryje.
        Do niższej warstwy dostaniesz się dopiero wtedy, gdy odsłonisz znalezisko w wyższej.
      </p>

      <div className="grid gap-2 sm:grid-cols-[3rem_1fr] sm:gap-3">
        <DepthRuler />
        <div className="space-y-2" aria-label="Przekrój wykopaliska">
          {DIG_LAYERS.map((layer, i) => (
            <DigLayerView
              key={layer.id}
              locked={i > 0 && !revealed.includes(DIG_LAYERS[i - 1].id)}
              layerId={layer.id}
              name={layer.name}
              hint={layer.hint}
              color={color}
              uncovered={uncovered[layer.id] ?? []}
              revealed={revealed.includes(layer.id)}
              onUncover={uncover}
              onRevealed={markRevealed}
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Model do ćwiczenia: prawdziwe wykopalisko ma więcej warstw, a głębokości zależą od miejsca.
      </p>

      {revealed.length > 0 && <FindCards revealed={revealed} color={color} />}

      {allRevealed && phase === 'dig' && (
        <button
          type="button"
          onClick={() => setPhase('order')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          Wszystkie trzy na wierzchu — ułóż je na osi <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}

      {(phase === 'order' || phase === 'done') && (
        <MiniAxis
          color={color}
          locked={phase === 'done'}
          onDone={() => {
            setPhase('done');
            onComplete();
          }}
        />
      )}

      {phase === 'done' && <StratigraphyNote color={color} />}
    </div>
  );
}

// ─── Przekrój ───

function DepthRuler() {
  return (
    <div aria-hidden className="hidden select-none sm:block">
      <div className="flex h-full flex-col justify-between py-1 text-right text-xs tabular-nums text-muted-foreground">
        <span>0</span>
        <span>50&nbsp;cm</span>
        <span>100&nbsp;cm</span>
        <span>150&nbsp;cm</span>
      </div>
    </div>
  );
}

const LAYER_BG: Record<string, string> = {
  humus: 'bg-amber-100 dark:bg-amber-950/40',
  glina: 'bg-orange-200/80 dark:bg-orange-950/50',
  piasek: 'bg-yellow-100 dark:bg-yellow-950/30',
};

/** Zwarta ziemia (nieprzetarta) — kryje, dopóki jej nie zetrzesz. */
const SOIL_BG: Record<string, string> = {
  humus: 'bg-amber-300 dark:bg-amber-700',
  glina: 'bg-orange-400 dark:bg-orange-800',
  piasek: 'bg-yellow-300 dark:bg-yellow-700',
};

function DigLayerView({
  layerId,
  name,
  hint,
  color,
  uncovered,
  revealed,
  locked,
  onUncover,
  onRevealed,
}: {
  locked: boolean;
  layerId: string;
  name: string;
  hint: string;
  color: string;
  uncovered: string[];
  revealed: boolean;
  onUncover: (layerId: string, key: string) => void;
  onRevealed: (layerId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const layer = DIG_LAYERS.find((l) => l.id === layerId)!;
  /** Pędzelek podążający za kursorem (mysz) albo palcem (dotyk w ruchu). */
  const [brush, setBrush] = useState<{ x: number; y: number } | null>(null);

  const cellFromPointer = (clientX: number, clientY: number): string | null => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    const col = Math.min(COLS - 1, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * COLS)));
    const row = Math.min(ROWS - 1, Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * ROWS)));
    return `${row}-${col}`;
  };

  /** Ścieranie jednej komórki (sędzia odkrycia siedzi w efekcie niżej). */
  const digAt = (clientX: number, clientY: number) => {
    const key = cellFromPointer(clientX, clientY);
    if (!key) return;
    onUncover(layerId, key);
  };

  // Sędzia odkrycia — w efekcie, po każdej aktualizacji stanu (bez wyścigów):
  // warstwa zaliczona, gdy starte są wszystkie komórki spod znaleziska.
  useEffect(() => {
    if (revealed) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    if (isFindRevealed(layer.spot, uncovered, rect.width, rect.height, COLS, ROWS)) {
      onRevealed(layerId);
    }
  }, [uncovered, revealed, layer, layerId, onRevealed]);

  const moveBrush = (clientX: number, clientY: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) {
      setBrush(null);
      return;
    }
    setBrush({ x: clientX - rect.left, y: clientY - rect.top });
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (locked) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Bez przechwycenia i tak działa (ruch przy wciśniętym przycisku).
    }
    digAt(e.clientX, e.clientY);
    moveBrush(e.clientX, e.clientY);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (locked) return;
    moveBrush(e.clientX, e.clientY);
    if (e.buttons === 0) return;
    digAt(e.clientX, e.clientY);
  };

  const percent = Math.round((uncovered.length / CELLS_PER_LAYER) * 100);

  return (
    <div className="space-y-1">
      <p className="text-sm">
        <strong>{name}</strong> <span className="text-muted-foreground">— {hint}</span>
        {revealed && (
          <span className="ml-2 inline-block bg-black/70 px-2 py-0.5 text-xs font-semibold text-white dark:bg-white/80 dark:text-black">
            odkryte!
          </span>
        )}
      </p>
      <div
        ref={ref}
        role="img"
        aria-label={
          locked
            ? `${name}: jeszcze zasłonięta. Najpierw odsłoń znalezisko w warstwie wyżej.`
            : revealed
              ? `${name}: znalezisko odsłonięte (odsłonięte ${percent} procentów warstwy).`
              : `${name}: odsłonięte ${percent} procentów. Przeciągnij pędzelkiem, żeby odsłonić znalezisko.`
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setBrush(null)}
        className={cn(
          'relative h-28 w-full touch-none overflow-hidden border select-none',
          locked ? 'cursor-not-allowed' : 'cursor-none',
          LAYER_BG[layerId]
        )}
      >
        {/* Znalezisko leży POD ziemią od początku — widać je tylko tam,
            gdzie komórki starto. Każde w innym miejscu warstwy. */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${layer.spot.x * 100}%`, top: `${layer.spot.y * 100}%` }}
        >
          <FindGlyph findId={layer.find.id} />
        </div>
        {/* Zwarta ziemia — znika pod pędzelkiem, odsłaniając to, co pod nią. */}
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }} aria-hidden>
          {Array.from({ length: CELLS_PER_LAYER }, (_, i) => {
            const key = `${Math.floor(i / COLS)}-${i % COLS}`;
            const gone = uncovered.includes(key);
            return (
              <div
                key={key}
                className={cn('border border-black/10', gone ? 'opacity-0' : SOIL_BG[layerId])}
              />
            );
          })}
        </div>
        {/* Pędzelek zamiast strzałki */}
        {brush && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[65%]"
            style={{ left: brush.x, top: brush.y }}
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white/95 shadow-md"
              style={{ borderColor: color }}
            >
              <Paintbrush className="h-5 w-5" style={{ color }} />
            </span>
          </div>
        )}
        {locked && (
          <p className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/25 px-3 text-center text-sm font-semibold text-white">
            Najpierw odsłoń warstwę wyżej
          </p>
        )}
      </div>
      <p className="text-xs tabular-nums text-muted-foreground" aria-live="polite">
        {locked ? 'Czeka na swoją kolej' : `Odsłonięte: ${percent}%${revealed ? ' — znalezisko na wierzchu' : ''}`}
      </p>
    </div>
  );
}

function FindGlyph({ findId }: { findId: string }) {
  const Icon = findId === 'skorupa' ? CookingPot : Coins;
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white shadow dark:bg-zinc-900">
      <Icon className="h-6 w-6" aria-hidden />
    </span>
  );
}

// ─── Karty znalezisk ───

function FindCards({ revealed, color }: { revealed: string[]; color: string }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-3">
      {DIG_LAYERS.filter((layer) => revealed.includes(layer.id)).map((layer) => (
        <li key={layer.id} className="border p-3 text-sm leading-relaxed">
          <p className="font-semibold" style={{ color }}>
            {layer.find.name}
          </p>
          <p className="mt-1">{layer.find.card}</p>
          <p className="mt-1 text-xs tabular-nums text-muted-foreground">
            Głębokość: <strong>{depthLabel(layer.find.depthCm)}</strong>
          </p>
        </li>
      ))}
    </ul>
  );
}

// ─── Mini-oś ───

/**
 * Stała kolejność przycisków — ani poprawna, ani odwrócona, żeby klikanie
 * „od lewej” albo „od prawej” niczego nie dawało.
 */
const START_ORDER = ['skorupa', 'denar', 'grosz'];

const SLOT_LABEL = ['najpłycej', 'w środku', 'najgłębiej'];

function MiniAxis({ color, locked, onDone }: { color: string; locked: boolean; onDone: () => void }) {
  const [order, setOrder] = useState<string[]>(locked ? FINDS_SHALLOW_FIRST : []);
  const [hint, setHint] = useState<string | null>(null);

  const tap = (id: string) => {
    if (locked || hint || order.includes(id)) return;
    const next = [...order, id];
    setOrder(next);
    if (next.length === START_ORDER.length) {
      const verdict = judgeFindOrder(next);
      if (verdict.ok) {
        onDone();
      } else {
        setHint(verdict.hint ?? null);
      }
    }
  };

  const reset = () => {
    setOrder([]);
    setHint(null);
  };

  return (
    <div className="space-y-3 border p-4">
      <p className="text-base leading-relaxed">
        <MousePointerClick className="mr-1 inline h-4 w-4" style={{ color }} aria-hidden />
        Trzy znaleziska, trzy głębokości. <strong>Stuknij je po kolei — od tego, które leżało najpłycej
        (najmłodsze), do tego, które leżało najgłębiej.</strong> Głębokości masz na kartach powyżej.
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Znaleziska do ułożenia">
        {START_ORDER.map((id) => {
          const find = findById(id);
          const taken = order.includes(id);
          return (
            <button
              key={id}
              type="button"
              disabled={locked || taken || Boolean(hint)}
              onClick={() => tap(id)}
              className="border bg-white px-3 py-2 text-sm transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-35 disabled:hover:bg-white dark:bg-zinc-900"
            >
              {find.name}
            </button>
          );
        })}
      </div>
      <ol className="grid gap-2 sm:grid-cols-3" aria-label="Kolejność od najpłytszego">
        {SLOT_LABEL.map((label, i) => {
          const id = order[i];
          return (
            <li
              key={label}
              className={cn('min-h-[3.25rem] border-2 px-3 py-2 text-sm', id ? 'font-semibold text-white' : 'border-dashed')}
              style={id ? { backgroundColor: color, borderColor: color } : { borderColor: color }}
            >
              <span className={cn('block text-xs font-normal', id ? 'text-white/85' : 'text-muted-foreground')}>
                {i + 1}. {label}
              </span>
              {id ? findById(id).name : '…'}
            </li>
          );
        })}
      </ol>
      {hint && !locked && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-destructive" aria-live="polite">
            {hint}
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Ułóż od nowa
          </button>
        </div>
      )}
      {locked && (
        <p className="text-sm font-semibold" style={{ color }} aria-live="polite">
          Dobrze: 20 centymetrów pod trawą grosz, 80 cm skorupa, 150 cm srebrna moneta. Płycej znaczy później,
          głębiej znaczy dawniej.
        </p>
      )}
    </div>
  );
}

// ─── Wniosek ───

function StratigraphyNote({ color }: { color: string }) {
  return (
    <div className="space-y-3 border-2 p-4" style={{ borderColor: color }}>
      <p className="text-base leading-relaxed">
        <strong>Odkryłeś/łaś główną zasadę wykopalisk: głębiej = dawniej.</strong> To, co leży niżej, trafiło
        pod ziemię wcześniej. Archeolodzy nazywają układ warstw <em>stratygrafią</em> — ale nazwy nie musisz
        pamiętać, wystarczy zasada.
      </p>
      <div className="flex flex-wrap items-center gap-4 bg-muted p-3">
        <p className="w-full text-sm font-semibold">Obie monety obok siebie — w tej samej skali (powiększone):</p>
        <svg width={120} height={60} viewBox="0 0 120 60" role="img" aria-label="Denar (19 mm) jest większy od grosza (15,5 mm)">
          <circle cx={30} cy={30} r={19} fill="none" strokeWidth={2.5} stroke={color} />
          <circle cx={88} cy={30} r={15.5} fill="none" strokeWidth={2.5} stroke="currentColor" opacity={0.55} />
        </svg>
        <ul className="text-sm leading-relaxed">
          <li>
            <strong style={{ color }}>Srebrna moneta — 19 mm</strong> (sprzed ok. 1000 lat)
          </li>
          <li>1 grosz — 15,5 mm (z dziś)</li>
        </ul>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Twoja karta znaleziska (trzy karty powyżej) zostaje z tobą — a napis z najgłębszej monety odczytasz
        w następnym bloku.
      </p>
    </div>
  );
}

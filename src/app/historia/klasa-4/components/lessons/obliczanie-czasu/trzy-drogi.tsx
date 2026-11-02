'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Footprints } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { DrogaPiechura } from './droga-piechura';
import {
  ROADS,
  describe,
  evaluate,
  judgeAbacus,
  roadNumbers,
  stepsBetween,
  walkYears,
  type AbacusSetup,
  type Op,
  type Road,
  type Verdict,
} from './obliczanie';

const EMPTY: AbacusSetup = { left: null, right: null, op: '-', minusOne: false };

/**
 * Blok 2 — **Trzy drogi** (`cwiczenie`).
 *
 * Trzy pary dat: obie n.e. (Kazimierz Wielki), obie p.n.e. (Kleopatra VII),
 * z dwóch er (August). Dla każdej dziecko **ustawia działanie na liczydle lat**
 * — kładzie liczby w okienka (przeciągnięcie albo stuknięcie), przestawia
 * dźwignię − / + i zapadkę „− 1” — a potem **puszcza piechura**, który idzie
 * tę drogę naprawdę. Sędzia przyjmuje każde działanie, które daje tyle, ile
 * kroków zrobił piechur. Reguły wychodzą z trzech przejść, tabela na końcu
 * zbiera to, co ustawiło samo dziecko.
 */
export function TrzyDrogi({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [roadIndex, setRoadIndex] = useState(0);
  const [setup, setSetup] = useState<AbacusSetup>(EMPTY);
  const [solved, setSolved] = useState<AbacusSetup[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [walk, setWalk] = useState<number | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const reported = useRef(false);

  const road = ROADS[roadIndex];
  const finished = roadIndex >= ROADS.length;
  const years = useMemo(() => (road ? walkYears(road.from, road.to) : []), [road]);
  const steps = road ? stepsBetween(road.from, road.to) : 0;
  const walking = walk !== null && walk < steps;

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [finished, onComplete]);

  // Piechur idzie sam — szybko, ale widać każdy krok.
  useEffect(() => {
    if (walk === null || walk >= steps) return;
    const t = window.setTimeout(() => setWalk((w) => (w === null ? w : w + 1)), 1600 / steps);
    return () => window.clearTimeout(t);
  }, [walk, steps]);

  // Koniec marszu → werdykt.
  useEffect(() => {
    if (!road || walk === null || walk < steps || verdict) return;
    setVerdict(judgeAbacus(road, setup));
  }, [walk, steps, road, setup, verdict]);

  const change = (patch: Partial<AbacusSetup>) => {
    setSetup((s) => ({ ...s, ...patch }));
    setVerdict(null);
    setWalk(null);
  };

  const put = (token: string, slot: 'left' | 'right') => {
    const value = Number(token.slice(4));
    const other = slot === 'left' ? 'right' : 'left';
    change({ [slot]: value, ...(setup[other] === value ? { [other]: null } : {}) });
    setArmed(null);
  };

  const { bind, drag, hover } = useDragToken({
    disabled: walking || finished,
    onDrop: (id, target) => {
      if (target === 'okno-left' || target === 'okno-right') put(id, target.slice(5) as 'left' | 'right');
    },
    onTap: (id) => setArmed((a) => (a === id ? null : id)),
  });

  const next = () => {
    setSolved((s) => [...s, setup]);
    setRoadIndex((i) => i + 1);
    setSetup(EMPTY);
    setVerdict(null);
    setWalk(null);
  };

  if (finished) return <Summary color={color} solved={solved} />;

  const numbers = roadNumbers(road);
  const value = evaluate(setup);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm leading-relaxed">
          <strong>{road.who}</strong> — {road.what}. Ile lat żył{road.id === 'kleopatra' ? 'a' : ''}?
        </p>
        <span className="text-xs text-muted-foreground">
          Droga {roadIndex + 1} z {ROADS.length}
        </span>
      </div>

      {/* Liczby do położenia na liczydle — same wartości, bez er. */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Liczby z dat:</span>
        {numbers.map((n) => {
          const id = `num-${n}`;
          const used = setup.left === n || setup.right === n;
          return (
            <button
              key={id}
              type="button"
              {...bind(id)}
              className={cn(
                'touch-none select-none border-2 px-3 py-1 font-mono text-lg font-bold tabular-nums',
                used && 'opacity-40',
                armed === id && 'bg-muted'
              )}
              style={{ borderColor: color }}
            >
              {n}
            </button>
          );
        })}
      </div>

      <DragGhost drag={drag}>
        {drag && (
          <span className="border-2 bg-background px-3 py-1 font-mono text-lg font-bold" style={{ borderColor: color }}>
            {drag.id.slice(4)}
          </span>
        )}
      </DragGhost>

      {/* Liczydło lat. */}
      <div className="flex flex-wrap items-center gap-2 border bg-muted/20 p-3" aria-label="Liczydło lat">
        <Slot id="okno-left" value={setup.left} hover={hover} color={color} onTap={() => armed && put(armed, 'left')} />
        <button
          type="button"
          onClick={() => change({ op: (setup.op === '-' ? '+' : '-') as Op })}
          disabled={walking}
          className="flex h-12 w-12 flex-col items-center justify-center border-2 bg-background text-2xl font-bold"
          style={{ borderColor: color }}
          aria-label={`Dźwignia działania: ${setup.op === '-' ? 'odejmij' : 'dodaj'} — stuknij, żeby przestawić`}
        >
          <span className="transition-transform" style={{ transform: setup.op === '+' ? 'rotate(90deg)' : undefined }}>
            {setup.op === '-' ? '−' : '+'}
          </span>
        </button>
        <Slot id="okno-right" value={setup.right} hover={hover} color={color} onTap={() => armed && put(armed, 'right')} />
        <button
          type="button"
          onClick={() => change({ minusOne: !setup.minusOne })}
          disabled={walking}
          aria-pressed={setup.minusOne}
          className={cn('flex h-12 items-center gap-2 border-2 px-3 text-sm font-semibold', !setup.minusOne && 'border-dashed text-muted-foreground')}
          style={setup.minusOne ? { borderColor: color, background: `color-mix(in oklch, ${color} 18%, transparent)` } : undefined}
        >
          <span className={cn('inline-block h-4 w-7 border p-0.5')}>
            <span className={cn('block h-full w-1/2 bg-foreground/70 transition-transform', setup.minusOne && 'translate-x-full')} />
          </span>
          − 1
        </button>
        <span className="ml-auto font-mono text-2xl font-bold tabular-nums">= {value ?? '?'}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={value === null || walking || verdict?.ok}
          onClick={() => {
            setVerdict(null);
            setWalk(0);
          }}
          className="flex items-center gap-2 border-2 px-4 py-2 text-sm font-semibold disabled:opacity-40"
          style={{ borderColor: color }}
        >
          <Footprints className="h-4 w-4" aria-hidden /> Puść piechura
        </button>
        {verdict?.ok && (
          <button type="button" onClick={next} className="border-2 px-4 py-2 text-sm font-semibold text-white" style={{ background: color, borderColor: color }}>
            {roadIndex + 1 < ROADS.length ? 'Następna droga' : 'Zobacz swoje trzy drogi'}
          </button>
        )}
      </div>

      {walk !== null && (
        <div>
          <DrogaPiechura years={years} index={Math.min(walk, steps)} color={color} />
          <p className="mt-1 text-sm">
            Kroki piechura: <strong className="font-mono tabular-nums" style={{ color }}>{Math.min(walk, steps)}</strong>
          </p>
        </div>
      )}

      {verdict && (
        <p className={cn('text-sm leading-relaxed', !verdict.ok && 'text-destructive')} aria-live="polite">
          {verdict.ok ? <strong className="text-success">{verdict.message}</strong> : verdict.message}
        </p>
      )}
    </div>
  );
}

function Slot({
  id,
  value,
  hover,
  color,
  onTap,
}: {
  id: string;
  value: number | null;
  hover: string | null;
  color: string;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      data-drop={id}
      onClick={onTap}
      className={cn('flex h-12 min-w-[4.5rem] items-center justify-center border-2 bg-background px-2 font-mono text-xl font-bold tabular-nums', value === null && 'border-dashed', hover === id && 'bg-muted')}
      style={{ borderColor: color }}
      aria-label={value === null ? 'Puste okienko liczydła' : `Okienko liczydła: ${value}`}
    >
      {value ?? ''}
    </button>
  );
}

/** Tabela z trzech przejść — reguły z tego, co dziecko samo ustawiło. */
function Summary({ color, solved }: { color: string; solved: AbacusSetup[] }) {
  const rows: { road: Road; label: string }[] = ROADS.map((road) => ({
    road,
    label: road.from > 0 ? 'obie daty naszej ery' : road.to < 0 ? 'obie daty przed naszą erą' : 'daty z dwóch er',
  }));
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p className="font-semibold">Twoje trzy drogi:</p>
      <div className="grid gap-1.5">
        {rows.map(({ road, label }, i) => (
          <div key={road.id} className="grid grid-cols-[1fr_auto] items-center gap-2 border bg-muted/30 px-3 py-2" style={{ borderColor: color }}>
            <span>
              <strong>{label}</strong> <span className="text-muted-foreground">({road.who})</span>
            </span>
            <span className="font-mono tabular-nums">
              {describe(solved[i])} = {evaluate(solved[i])}
            </span>
          </div>
        ))}
      </div>
      <p>
        <strong>Ta sama era</strong> — od większej liczby odejmujesz mniejszą (w naszej erze większa jest data
        późniejsza, przed naszą erą — wcześniejsza). <strong>Dwie ery</strong> — piechur przechodzi przez szczelinę,
        więc liczby dodajesz i zabierasz jeden rok, którego nie było.
      </p>
    </div>
  );
}

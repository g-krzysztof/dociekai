'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Play, RotateCcw, Star, StepForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { evaluateSheet, formatNumber, type Box, type RawCells } from '../../../lib/formula';
import { SheetGrid, boxText, sameBox } from '../arkusz-pierwsze-kroki/sheet-grid';

/**
 * Blok „Co dalej” — **zajrzenie do klasy 5**, nie nauka jej. Trzy zabawki, po
 * jednej na każdy temat, który zapowiada program kursu (dłuższe projekty,
 * arkusz „na poważnie”, więcej algorytmiki). Każda pokazuje **mechanikę**, którą
 * dziecko zna z klasy 4 od strony skutku, i dokłada do niej jedno pojęcie, którego
 * jeszcze nie ma: zmienną, funkcję na zakresie, sortowanie.
 *
 * Zabawki niczego nie oceniają i nie mają dobrej odpowiedzi — blok kończy się,
 * gdy dziecko wypróbowało wszystkie trzy. To ten sam pomysł co `SetkaGrid` w
 * kursie matematyki: podgląd, który wzbudza ciekawość, zamiast lekcji na zapas.
 */

type ToyId = 'zmienna' | 'arkusz' | 'sortowanie';

const TOYS: { id: ToyId; label: string; lead: string; text: string }[] = [
  {
    id: 'zmienna',
    label: 'Dłuższe projekty',
    lead: 'Gra, która pamięta wynik.',
    text: 'W klasie 5 dłuższe programy potrzebują pamięci. Licznik punktów w grze to zmienna — liczba z nazwą, którą program zmienia w trakcie działania.',
  },
  {
    id: 'arkusz',
    label: 'Arkusz na poważnie',
    lead: 'Jedno zaznaczenie, kilka odpowiedzi.',
    text: 'Suma to dopiero początek. Arkusz ma dziesiątki funkcji, które biorą zaznaczony zakres i od razu mówią o nim coś ważnego.',
  },
  {
    id: 'sortowanie',
    label: 'Więcej algorytmiki',
    lead: 'Jak komputer układa po kolei.',
    text: 'W module o myśleniu komputacyjnym porządkowałeś/porządkowałaś skrzynki wagą. Komputer robi to jednym sposobem: porównuje sąsiadów i zamienia.',
  },
];

export function NextYearPeek({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [active, setActive] = useState<ToyId>('zmienna');
  const [seen, setSeen] = useState<Record<ToyId, boolean>>({ zmienna: false, arkusz: false, sortowanie: false });
  const reported = useRef(false);

  const mark = (id: ToyId) => setSeen((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  const allSeen = Object.values(seen).every(Boolean);

  useEffect(() => {
    if (allSeen && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [allSeen, onComplete]);

  const toy = TOYS.find((item) => item.id === active) ?? TOYS[0];

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Rok się kończy — ale to nie jest koniec drogi. W klasie 5 czekają <strong>dłuższe projekty, arkusz na poważnie i
        więcej algorytmiki</strong>. Wypróbuj po jednej zabawce z każdej z tych trzech rzeczy. Niczego nie musisz jeszcze
        umieć.
      </p>

      <div role="tablist" aria-label="Trzy zapowiedzi klasy 5" className="mt-4 grid grid-cols-3 gap-2">
        {TOYS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active === item.id}
            onClick={() => setActive(item.id)}
            className={cn('flex min-h-12 cursor-pointer items-center justify-center gap-1.5 border-2 px-2 text-center text-xs font-semibold leading-tight sm:text-sm', active === item.id ? 'bg-muted' : 'hover:bg-muted/40')}
            style={{ borderColor: active === item.id ? color : 'var(--border)' }}
          >
            {seen[item.id] && <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} aria-hidden />}
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 border bg-muted/40 p-3 text-sm leading-relaxed">
        <p className="font-semibold">{toy.lead}</p>
        <p className="mt-1 text-muted-foreground">{toy.text}</p>
      </div>

      <div className="mt-4 min-h-[19rem]">
        {active === 'zmienna' && <PointsToy color={color} onSeen={() => mark('zmienna')} />}
        {active === 'arkusz' && <RangeToy color={color} onSeen={() => mark('arkusz')} />}
        {active === 'sortowanie' && <SortToy color={color} onSeen={() => mark('sortowanie')} />}
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground">Wypróbowane: {Object.values(seen).filter(Boolean).length} z 3.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Zmienna                                                             */
/* ------------------------------------------------------------------ */

const GAME_SECONDS = 10;

function PointsToy({ color, onSeen }: { color: string; onSeen: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'run' | 'over'>('idle');
  const [points, setPoints] = useState(0);
  const [left, setLeft] = useState(GAME_SECONDS);
  const [pos, setPos] = useState({ x: 50, y: 45 });

  const hop = () => setPos({ x: 10 + Math.random() * 78, y: 12 + Math.random() * 62 });

  useEffect(() => {
    if (phase !== 'run') return;
    const tick = window.setInterval(() => setLeft((value) => value - 1), 1000);
    const jump = window.setInterval(hop, 1200);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(jump);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'run' && left <= 0) {
      setPhase('over');
      onSeen();
    }
  }, [phase, left, onSeen]);

  const start = () => {
    setPoints(0);
    setLeft(GAME_SECONDS);
    setPhase('run');
    hop();
  };

  const level2 = points > 4;

  return (
    <div>
      <div className={cn('relative h-56 overflow-hidden border transition-colors', level2 ? 'bg-indigo-100 dark:bg-indigo-950/60' : 'bg-sky-50 dark:bg-sky-950/40')}>
        <div className="absolute left-2 top-2 flex items-center gap-2 text-xs font-semibold">
          <span className="bg-orange-500 px-2 py-1 text-white">punkty</span>
          <span className="min-w-8 border bg-white px-2 py-1 text-center tabular-nums text-zinc-900" aria-live="polite">
            {points}
          </span>
        </div>
        <div className="absolute right-2 top-2 text-xs tabular-nums text-muted-foreground">{phase === 'run' ? `${left} s` : ''}</div>
        <div className="absolute bottom-2 left-2 text-[11px] font-mono text-muted-foreground">
          jeżeli punkty &gt; 4 to: {level2 ? 'poziom 2 ✓' : 'poziom 1'}
        </div>

        {phase === 'run' && (
          <motion.button
            type="button"
            key={`${pos.x}-${pos.y}`}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => {
              setPoints((value) => value + 1);
              hop();
            }}
            aria-label="Gwiazdka — złap ją"
            className="absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <Star className="h-10 w-10 fill-amber-400 text-amber-500" aria-hidden />
          </motion.button>
        )}

        {phase !== 'run' && (
          <div className="absolute inset-0 grid place-items-center bg-white/70 p-4 text-center dark:bg-zinc-900/70">
            <div>
              {phase === 'over' && (
                <p className="mb-3 text-sm font-semibold">
                  Zmienna <span className="font-mono">punkty</span> urosła do {points}.{' '}
                  {level2 ? 'Warunek „większe niż 4” się spełnił — jest poziom 2.' : 'Do poziomu 2 zabrakło punktów.'}
                </p>
              )}
              <button type="button" onClick={start} className="inline-flex min-h-11 cursor-pointer items-center gap-2 px-6 text-sm font-bold text-white" style={{ backgroundColor: color }}>
                {phase === 'over' ? <RotateCcw className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
                {phase === 'over' ? 'Jeszcze raz' : `Łap gwiazdki (${GAME_SECONDS} s)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Zakres                                                              */
/* ------------------------------------------------------------------ */

const RUNNERS: RawCells = {
  A1: 'Biegacz',
  B1: 'Czas (s)',
  A2: 'Ala',
  B2: '31',
  A3: 'Bartek',
  B3: '27',
  A4: 'Celina',
  B4: '35',
  A5: 'Dawid',
  B5: '29',
  A6: 'Ewa',
  B6: '33',
  A7: 'Franek',
  B7: '26',
};

function RangeToy({ color, onSeen }: { color: string; onSeen: () => void }) {
  const [selection, setSelection] = useState<Box | null>(null);
  const [tried, setTried] = useState<Box[]>([]);
  const values = useMemo(() => evaluateSheet(RUNNERS, {}), []);

  const numbers = useMemo(() => {
    if (!selection) return [] as number[];
    const list: number[] = [];
    for (let row = selection.r1; row <= selection.r2; row += 1) {
      for (let col = selection.c1; col <= selection.c2; col += 1) {
        const key = `${String.fromCharCode(65 + col)}${row + 1}`;
        const value = values[key];
        if (value?.t === 'num') list.push(value.v);
      }
    }
    return list;
  }, [selection, values]);

  useEffect(() => {
    if (tried.length >= 2) onSeen();
  }, [tried, onSeen]);

  const stats = numbers.length
    ? [
        { name: 'SUMA', value: numbers.reduce((a, b) => a + b, 0) },
        { name: 'ŚREDNIA', value: numbers.reduce((a, b) => a + b, 0) / numbers.length },
        { name: 'MAX', value: Math.max(...numbers) },
        { name: 'MIN', value: Math.min(...numbers) },
      ]
    : null;

  return (
    <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
      <SheetGrid
        cols={2}
        rows={7}
        cells={RUNNERS}
        values={values}
        color={color}
        widths={[90, 76]}
        mode="range"
        selection={selection}
        onGesture={(box, _origin, phase) => {
          setSelection(box);
          if (phase === 'end') setTried((prev) => (prev.some((item) => sameBox(item, box)) ? prev : [...prev, box]));
        }}
        caption={selection ? `Zaznaczone: ${boxText(selection)}` : 'Przeciągnij po komórkach z czasami.'}
      />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Arkusz mówi o zaznaczeniu</p>
        {stats ? (
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {stats.map((item) => (
              <li key={item.name} className="border p-2">
                <p className="font-mono text-[11px] text-muted-foreground">={item.name}(…)</p>
                <p className="text-lg font-bold tabular-nums">{formatNumber(item.value)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Zaznacz kilka czasów — suma, średnia, największy i najmniejszy wynik policzą się same.</p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Spróbuj dwóch różnych zaznaczeń (razem z nazwami też się da).</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sortowanie                                                          */
/* ------------------------------------------------------------------ */

interface SortState {
  bars: { id: number; value: number }[];
  i: number;
  j: number;
  compares: number;
  swaps: number;
  compared: [number, number] | null;
  /** Co komputer właśnie zrobił — jedno zdanie pod słupkami. */
  note: string;
  done: boolean;
}

const START_BARS = [5, 2, 7, 1, 6, 3].map((value, id) => ({ id, value }));

const freshSort = (): SortState => ({ bars: START_BARS, i: 0, j: 0, compares: 0, swaps: 0, compared: null, note: '', done: false });

/** Jeden krok sortowania bąbelkowego: porównaj sąsiadów j i j+1, w razie potrzeby zamień. */
function sortStep(state: SortState): SortState {
  if (state.done) return state;
  const n = state.bars.length;
  const bars = [...state.bars];
  const left = bars[state.j].value;
  const right = bars[state.j + 1].value;
  const swap = left > right;
  if (swap) [bars[state.j], bars[state.j + 1]] = [bars[state.j + 1], bars[state.j]];
  let { i, j } = state;
  const compared: [number, number] = [state.j, state.j + 1];
  j += 1;
  if (j > n - i - 2) {
    i += 1;
    j = 0;
  }
  return {
    bars,
    i,
    j,
    compares: state.compares + 1,
    swaps: state.swaps + (swap ? 1 : 0),
    compared,
    note: swap ? `Porównał ${left} i ${right}: ${left} jest większe, więc zamienia je miejscami.` : `Porównał ${left} i ${right}: ${left} nie jest większe, więc zostają, jak są.`,
    done: i >= n - 1,
  };
}

function SortToy({ color, onSeen }: { color: string; onSeen: () => void }) {
  const [state, setState] = useState<SortState>(freshSort);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (!auto) return;
    if (state.done) {
      setAuto(false);
      return;
    }
    const id = window.setTimeout(() => setState((prev) => sortStep(prev)), 420);
    return () => window.clearTimeout(id);
  }, [auto, state]);

  useEffect(() => {
    if (state.done) onSeen();
  }, [state.done, onSeen]);

  const max = Math.max(...START_BARS.map((bar) => bar.value));

  return (
    <div>
      <div className="flex h-44 items-end justify-center gap-2 border bg-muted/20 p-3">
        {state.bars.map((bar, index) => {
          const isCompared = state.compared && (state.compared[0] === index || state.compared[1] === index) && !state.done;
          return (
            <motion.div
              key={bar.id}
              layout
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="flex w-10 flex-col items-center justify-end gap-1 sm:w-12"
              style={{ height: '100%' }}
            >
              <span className="text-xs font-bold tabular-nums">{bar.value}</span>
              <div
                className={cn('w-full', state.done ? 'bg-emerald-500' : isCompared ? 'bg-amber-500' : 'bg-slate-400 dark:bg-zinc-500')}
                style={{ height: `${(bar.value / max) * 100 - 16}%` }}
              />
            </motion.div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setState((prev) => sortStep(prev))}
          disabled={state.done || auto}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          <StepForward className="h-4 w-4" aria-hidden /> Krok
        </button>
        <button
          type="button"
          onClick={() => setAuto(true)}
          disabled={state.done || auto}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 border-2 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play className="h-4 w-4" aria-hidden /> Do końca
        </button>
        <button
          type="button"
          onClick={() => {
            setAuto(false);
            setState(freshSort());
          }}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 border px-3 text-sm text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Od początku
        </button>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground" aria-live="polite">
          porównania: {state.compares} · zamiany: {state.swaps}
        </span>
      </div>
      <p className="mt-2 min-h-[2.5rem] text-sm leading-snug text-muted-foreground">
        {state.done
          ? `Gotowe: ${state.compares} porównań i ${state.swaps} zamian. W klasie 5 sprawdzisz, czy da się to zrobić szybciej.`
          : state.note || 'Naciśnij „Krok”: komputer porówna dwa sąsiednie słupki i, jeśli trzeba, zamieni je miejscami.'}
      </p>
    </div>
  );
}

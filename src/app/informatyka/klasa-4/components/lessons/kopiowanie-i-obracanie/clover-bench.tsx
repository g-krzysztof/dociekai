'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, ClipboardPaste, RotateCcw, RotateCw, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PAPER,
  at,
  boxHeight,
  boxWidth,
  cut,
  inkBox,
  normalizeBox,
  paste,
  rotateStamp,
  sameGrid,
  type Box,
  type Grid,
  type Stamp,
} from './stamp';

/**
 * Symulator lekcji — **warsztat, w którym nie wolno rysować**.
 *
 * Dziecko dostaje jeden listek i cztery puste miejsca wokół łodygi. Ołówka nie
 * ma w ogóle: jedyna droga do czterolistnej koniczyny prowadzi przez
 * zaznaczenie, kopiowanie, obrót i wklejenie — czyli dokładnie przez to, czego
 * wymaga zadanie obowiązkowe Z-5 w prawdziwym programie.
 *
 * W środku siedzi klasyczna pułapka Painta, której nie da się opowiedzieć:
 * **wklejony prostokąt domyślnie przynosi ze sobą własne białe tło** i wygryza
 * kawałek sąsiedniego listka albo łodygi. Nikt o tym nie uprzedza — po prostu
 * po drugim wklejeniu w koniczynie robi się biała dziura, a przełącznik
 * „przezroczyste tło” stoi na wierzchu paska narzędzi i czeka, aż dziecko
 * skojarzy jedno z drugim.
 *
 * Werdykt jest liczony **przez porównanie płótna z wzorcem** złożonym tymi
 * samymi funkcjami (`expectedGrid`), a nie z listy warunków — dlatego łapie
 * wygryzione tło niezależnie od tego, który listek i w jakiej kolejności je
 * wygryzł.
 */

const W = 20;
const H = 15;

const LEAF = '#4ade80';
const VEIN = '#16a34a';
const STEM = '#15803d';
/**
 * Łąka pod koniczyną. Nie jest ozdobą: gdyby całe płótno było białe, biel
 * przynoszona przez nieprzezroczyste wklejenie nie miałaby czego zamalować i
 * pułapka tego bloku byłaby niewidoczna. Listek wzorcowy leży POZA łąką, na
 * bieli — dzięki temu kopia niesie ze sobą właśnie biel.
 */
const MEADOW = '#dcfce7';
const MEADOW_FROM = 6;

/**
 * Listek pod rękę: kwadrat pięć na pięć, zaokrąglony, z ogonkiem na dole.
 * Kwadrat jest tu celowy — po obrocie zajmuje dokładnie tyle samo miejsca, więc
 * cztery pola wokół środka mają ten sam rozmiar i dziecko nie musi zgadywać,
 * czy listek się zmieści. Puste narożniki sprawiają, że sąsiednie listki się
 * nie zlewają.
 */
const LEAF_ROWS: [number, number[]][] = [
  [0, [1, 2, 3]],
  [1, [0, 1, 2, 3, 4]],
  [2, [0, 1, 2, 3, 4]],
  [3, [1, 2, 3]],
  [4, [2]],
];
const LEAF_VEIN: [number, number][] = [
  [2, 1],
  [2, 2],
  [2, 3],
];
/** Gdzie leży listek wzorcowy — w rogu płótna, poza koniczyną. */
const SOURCE = { x: 0, y: 0 };
const SOURCE_BOX: Box = { x0: 0, y0: 0, x1: 4, y1: 4 };

interface Slot {
  id: string;
  label: string;
  /** Lewy górny róg SAMEGO rysunku listka, nie ramki zaznaczenia. */
  x: number;
  y: number;
  /** Ile ćwiartek obrotu w prawo musi mieć listek w tym miejscu. */
  rot: number;
  w: number;
  h: number;
}

const SLOTS: Slot[] = [
  { id: 'gora', label: 'u góry', x: 9, y: 1, rot: 0, w: 5, h: 5 },
  { id: 'prawo', label: 'z prawej', x: 12, y: 4, rot: 1, w: 5, h: 5 },
  { id: 'dol', label: 'na dole', x: 9, y: 7, rot: 2, w: 5, h: 5 },
  { id: 'lewo', label: 'z lewej', x: 6, y: 4, rot: 3, w: 5, h: 5 },
];

function startGrid(): Grid {
  const grid = new Array<string>(W * H).fill(PAPER);
  for (let y = 0; y < H; y += 1) {
    for (let x = MEADOW_FROM; x < W; x += 1) grid[at(W, x, y)] = MEADOW;
  }
  LEAF_ROWS.forEach(([y, xs]) => {
    xs.forEach((x) => {
      grid[at(W, SOURCE.x + x, SOURCE.y + y)] = LEAF;
    });
  });
  LEAF_VEIN.forEach(([x, y]) => {
    grid[at(W, SOURCE.x + x, SOURCE.y + y)] = VEIN;
  });
  for (let y = 12; y <= 14; y += 1) grid[at(W, 11, y)] = STEM;
  return grid;
}

function turn(stamp: Stamp, times: number): Stamp {
  let out = stamp;
  for (let i = 0; i < ((times % 4) + 4) % 4; i += 1) out = rotateStamp(out);
  return out;
}

/** Kładzie kawałek tak, żeby jego RYSUNEK zaczynał się dokładnie w miejscu docelowym. */
function placeAt(
  grid: Grid,
  stamp: Stamp,
  slot: { x: number; y: number },
  transparent: boolean
): Grid {
  const ink = inkBox(stamp);
  if (!ink) return grid;
  return paste(grid, W, H, stamp, { x: slot.x - ink.x0, y: slot.y - ink.y0 }, transparent);
}

interface Placed {
  rot: number;
}

/**
 * Jak MA wyglądać płótno przy takim komplecie postawionych listków — złożone
 * tymi samymi funkcjami, zawsze przezroczyście. Porównanie z nim wychwytuje
 * wygryzione tło niezależnie od tego, ile listków już stoi i w jakiej
 * kolejności zostały postawione. Biały margines niechlujnego zaznaczenia jest
 * tu bez znaczenia — przezroczyste wklejenie i tak go pomija.
 */
function expectedGrid(placed: Record<string, Placed>): Grid {
  const base = startGrid();
  const leaf = cut(base, W, SOURCE_BOX);
  return SLOTS.reduce((grid, slot) => {
    const entry = placed[slot.id];
    return entry ? placeAt(grid, turn(leaf, entry.rot), slot, true) : grid;
  }, base);
}

interface CloverBenchProps {
  color: string;
  onComplete?: () => void;
}

export function CloverBench({ color, onComplete }: CloverBenchProps) {
  const [grid, setGrid] = useState<Grid>(startGrid);
  const [sel, setSel] = useState<Box | null>(null);
  const [clip, setClip] = useState<Stamp | null>(null);
  const [held, setHeld] = useState<Stamp | null>(null);
  const [heldRot, setHeldRot] = useState(0);
  const [placed, setPlaced] = useState<Record<string, Placed>>({});
  const [transparent, setTransparent] = useState(false);
  const [history, setHistory] = useState<{ grid: Grid; placed: Record<string, Placed> }[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [sawBite, setSawBite] = useState(false);
  const [done, setDone] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const anchor = useRef<{ x: number; y: number } | null>(null);
  const reported = useRef(false);

  const count = Object.keys(placed).length;

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const toCell = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * W);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * H);
    return { x: Math.min(W - 1, Math.max(0, x)), y: Math.min(H - 1, Math.max(0, y)) };
  };

  const pointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (done) return;
    svgRef.current = event.currentTarget;
    const cell = toCell(event);

    /* Kopia w ręku — stuknięcie w puste miejsce stawia ją tam (tap-tap, nie
       przeciąganie). Pola sąsiadują ze sobą i ich ramki zachodzą na siebie w
       rogach, więc liczy się NAJBLIŻSZY środek, nie pierwsze trafione pole. */
    if (held) {
      const free = SLOTS.filter((item) => !placed[item.id]);
      const nearest = free
        .map((item) => ({
          item,
          d: Math.hypot(cell.x + 0.5 - (item.x + item.w / 2), cell.y + 0.5 - (item.y + item.h / 2)),
        }))
        .sort((a, b) => a.d - b.d)[0];
      if (nearest && nearest.d <= 6) drop(nearest.item);
      else setNote('Stuknij w jedno z przerywanych pól wokół łodygi — tam ma trafić listek.');
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    anchor.current = cell;
    setSel(normalizeBox(cell, cell));
    setNote(null);
  };

  const pointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!anchor.current) return;
    setSel(normalizeBox(anchor.current, toCell(event)));
  };

  const pointerUp = () => {
    anchor.current = null;
  };

  const copy = () => {
    if (!sel) return;
    const covers =
      sel.x0 <= SOURCE_BOX.x0 &&
      sel.y0 <= SOURCE_BOX.y0 &&
      sel.x1 >= SOURCE_BOX.x1 &&
      sel.y1 >= SOURCE_BOX.y1;
    if (!covers) {
      setNote('Kopiuje się to, co jest w ramce — a w twojej nie mieści się cały listek z lewego górnego rogu.');
      return;
    }
    setClip(cut(grid, W, sel));
    setNote(
      boxWidth(sel) > 6 || boxHeight(sel) > 6
        ? 'Skopiowane. Zaznaczenie jest jednak sporo większe od listka, a razem z nim skopiowała się biel wokół — to się jeszcze odezwie.'
        : 'Skopiowane. Na ekranie nic się nie zmieniło, bo kopia poszła do schowka.'
    );
  };

  const doPaste = () => {
    if (!clip) {
      setNote('Najpierw zaznacz listek i naciśnij „Kopiuj”.');
      return;
    }
    setHeld(clip);
    setHeldRot(0);
    setSel(null);
    setNote('Kopia jest w ręku. Obróć ją tak, żeby pasowała do pustego miejsca, i stuknij w to miejsce.');
  };

  const rotate = (direction: 1 | -1) => {
    if (!held) {
      setNote('Obracać można to, co masz w ręku — najpierw wklej kopię.');
      return;
    }
    setHeld(turn(held, direction));
    setHeldRot((value) => (((value + direction) % 4) + 4) % 4);
  };

  const drop = (slot: Slot) => {
    if (!held) return;
    const next = placeAt(grid, held, slot, transparent);
    setHistory((prev) => [...prev.slice(-5), { grid, placed }]);
    setGrid(next);
    const nextPlaced = { ...placed, [slot.id]: { rot: heldRot } };
    setPlaced(nextPlaced);
    setHeld(null);

    if (heldRot !== slot.rot) {
      setNote(
        `Listek ${slot.label} jest przekręcony — jego ogonek nie sięga środka koniczyny. Cofnij, obróć go inaczej i postaw jeszcze raz.`
      );
      return;
    }

    /* Ile kratek TO wklejenie zamalowało na biało — stąd wiadomo, czy pułapka
       właśnie się zatrzasnęła, czy tylko wisi jeszcze po wcześniejszym listku. */
    const eaten = grid.filter((cellColor, i) => cellColor !== PAPER && next[i] === PAPER).length;
    if (eaten > 0) {
      setSawBite(true);
      setNote(
        `Popatrz, co się zrobiło wokół listka: wklejony prostokąt przyniósł ze sobą własne białe tło i zamalował nim ${eaten} kratek tego, co było pod spodem. Cofnij i poszukaj na pasku przełącznika, który tę biel wyłącza.`
      );
      return;
    }

    if (!sameGrid(next, expectedGrid(nextPlaced))) {
      setSawBite(true);
      setNote(
        'Ten listek stanął czysto, ale gdzieś wcześniej biel z wklejenia zamalowała kawałek rysunku i wciąż tam jest. Cofaj się do tamtego listka albo zacznij od nowa — tym razem z włączonym przezroczystym tłem.'
      );
      return;
    }

    const complete = SLOTS.every((item) => nextPlaced[item.id]?.rot === item.rot);
    if (!complete) {
      setNote('Stoi na swoim miejscu. Zostały jeszcze puste pola — wklej kolejną kopię.');
      return;
    }
    setNote(null);
    setDone(true);
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) {
      setNote('Nie ma czego cofać — jeszcze nic nie zostało postawione.');
      return;
    }
    setGrid(last.grid);
    setPlaced(last.placed);
    setHistory((prev) => prev.slice(0, -1));
    setHeld(null);
    setNote('Cofnięte. Wklejenie to jeden krok historii — cały listek zniknął naraz.');
  };

  const reset = () => {
    setGrid(startGrid());
    setSel(null);
    setClip(null);
    setHeld(null);
    setHeldRot(0);
    setPlaced({});
    setHistory([]);
    setNote(null);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm leading-relaxed sm:text-base">
        Na płótnie jest <strong>jeden listek i łodyga</strong>. Zrób z tego czterolistną koniczynę.
      </p>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Ołówek w tym warsztacie jest wyłączony — drugiego listka nie narysujesz. Masz zaznaczenie,
        kopiowanie, obrót i wklejanie. To wystarczy.
      </p>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <div className="border-2" style={{ borderColor: `${color}44` }}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className={cn('block h-auto w-full touch-none bg-white', held ? 'cursor-copy' : 'cursor-crosshair')}
              role="img"
              aria-label="Płótno z listkiem i pustymi miejscami na koniczynę"
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerCancel={pointerUp}
            >
              <rect x={0} y={0} width={W} height={H} fill="#ffffff" />
              {grid.map((cellColor, i) =>
                cellColor === PAPER ? null : (
                  <rect
                    key={i}
                    x={i % W}
                    y={Math.floor(i / W)}
                    width={1}
                    height={1}
                    fill={cellColor}
                  />
                )
              )}

              {SLOTS.filter((slot) => !placed[slot.id]).map((slot) => (
                <rect
                  key={slot.id}
                  x={slot.x}
                  y={slot.y}
                  width={slot.w}
                  height={slot.h}
                  fill={held ? `${color}18` : 'none'}
                  stroke={held ? color : '#cbd5e1'}
                  strokeWidth={0.16}
                  strokeDasharray="0.5 0.4"
                />
              ))}

              {sel && !held && (
                <rect
                  x={sel.x0}
                  y={sel.y0}
                  width={boxWidth(sel)}
                  height={boxHeight(sel)}
                  fill="#1d4ed810"
                  stroke="#1d4ed8"
                  strokeWidth={0.16}
                  strokeDasharray="0.4 0.3"
                />
              )}
            </svg>
          </div>

          <p className="mt-2 text-xs tabular-nums text-muted-foreground">
            Narysowane listki: <strong className="text-foreground">1</strong> · Listki w koniczynie:{' '}
            <strong className="text-foreground">{count}</strong> z 4
          </p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            <Tool label="Kopiuj" icon={Copy} onClick={copy} disabled={!sel || done} hint="Ctrl+C" />
            <Tool
              label="Wklej"
              icon={ClipboardPaste}
              onClick={doPaste}
              disabled={!clip || done}
              hint="Ctrl+V"
            />
            <Tool
              label="Obróć w prawo"
              icon={RotateCw}
              onClick={() => rotate(1)}
              disabled={!held || done}
            />
            <Tool
              label="Obróć w lewo"
              icon={RotateCcw}
              onClick={() => rotate(-1)}
              disabled={!held || done}
            />
            <Tool label="Cofnij" icon={Undo2} onClick={undo} disabled={done} hint="Ctrl+Z" />
            <button
              type="button"
              onClick={reset}
              disabled={done}
              className="border px-2 py-1.5 text-xs text-muted-foreground transition disabled:opacity-40"
            >
              Zacznij od nowa
            </button>
          </div>

          <label
            className={cn(
              'flex cursor-pointer items-start gap-2 border-2 p-2.5 text-xs leading-snug transition',
              transparent ? 'font-medium' : 'border-dashed'
            )}
            style={{ borderColor: transparent ? color : undefined }}
          >
            <input
              type="checkbox"
              checked={transparent}
              onChange={(event) => setTransparent(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-current"
              style={{ color }}
            />
            <span>
              Przezroczyste tło
              <span className="mt-0.5 block text-muted-foreground">
                {transparent
                  ? 'Biel z wklejanego prostokąta nie zamaluje tego, co pod spodem.'
                  : 'Wklejany prostokąt przynosi ze sobą całe swoje tło.'}
              </span>
            </span>
          </label>

          {held && (
            <div className="border p-2.5 text-center">
              <p className="mb-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                Kopia w ręku
              </p>
              <StampPreview stamp={held} />
              <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                obrót: {heldRot * 90}°
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {note && !done && (
          <motion.p
            key={note}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 p-3 text-sm leading-relaxed"
            style={{ borderColor: color, backgroundColor: `${color}0f` }}
          >
            {note}
          </motion.p>
        )}
      </AnimatePresence>

      {done && (
        <div className="mt-4 p-4" style={{ backgroundColor: `${color}14` }}>
          <p className="flex items-start gap-2 text-sm font-semibold sm:text-base" style={{ color }}>
            <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Czterolistna koniczyna — a narysowany był jeden listek.
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            Cztery listki, cztery różne ustawienia, jedna kopia w schowku. Gdyby koniczyna miała
            osiem listków, w schowku wciąż leżałby ten sam jeden — zmieniłaby się tylko liczba
            wklejeń.{' '}
            {sawBite && (
              <>
                Po drodze zobaczyłeś/zobaczyłaś jeszcze coś, o czym nie mówi żaden podręcznik:{' '}
                <strong>wklejony prostokąt domyślnie przynosi ze sobą swoje tło</strong>. W Paincie
                ten przełącznik nazywa się „przezroczyste zaznaczenie”.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function Tool({
  label,
  icon: Icon,
  onClick,
  disabled,
  hint,
}: {
  label: string;
  icon: typeof Copy;
  onClick: () => void;
  disabled: boolean;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 border px-2 py-1.5 text-left text-xs transition hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/5"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="min-w-0">
        {label}
        {hint && <span className="block font-mono text-[10px] text-muted-foreground">{hint}</span>}
      </span>
    </button>
  );
}

function StampPreview({ stamp }: { stamp: Stamp }) {
  return (
    <svg
      viewBox={`0 0 ${stamp.w} ${stamp.h}`}
      className="mx-auto block h-auto w-full max-w-[86px]"
      role="img"
      aria-label="Podgląd kopii w ręku"
    >
      <rect x={0} y={0} width={stamp.w} height={stamp.h} fill="#ffffff" />
      {stamp.cells.map((cellColor, i) =>
        cellColor === PAPER ? null : (
          <rect
            key={i}
            x={i % stamp.w}
            y={Math.floor(i / stamp.w)}
            width={1}
            height={1}
            fill={cellColor}
          />
        )
      )}
    </svg>
  );
}

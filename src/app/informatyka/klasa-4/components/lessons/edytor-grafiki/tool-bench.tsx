'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Circle,
  Eraser,
  Minus,
  PaintBucket,
  Paintbrush,
  Pencil,
  Square,
  Undo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Symulator lekcji — **prawdziwa mała pracownia graficzna**, nie makieta.
 *
 * Kubełek robi tu autentyczne wypełnianie obszaru (przeszukiwanie wszerz po
 * sąsiadach w tym samym kolorze), linia idzie algorytmem Bresenhama, figury
 * rastrują się na siatkę, a cofanie zdejmuje ze stosu migawek. Dzięki temu
 * zamówienia da się sprawdzać uczciwie: warunek patrzy na **wykonaną operację**
 * (jakim narzędziem, ile komórek, jak duży prostokąt), a nie na to, co dziecko
 * kliknęło w menu.
 *
 * Sześć zamówień prowadzi przez wszystkie narzędzia z tematu `[3.1]` i jest tak
 * ułożonych, żeby każde narzędzie było **jedynym sensownym wyjściem**: kleks
 * ściera się gumką, nieba nie da się zamalować ołówkiem w rozsądnym czasie,
 * a okrągłe słońce wymaga włączenia „równo” (czyli klawisza Shift w prawdziwym
 * edytorze). Po zamówieniach płótno zostaje do swobodnego rysowania.
 */

const W = 24;
const H = 16;
const CELL = 14;
const PAPER = '#ffffff';

/** Wiersz linii horyzontu — dzieli płótno na dwa zamknięte obszary do wypełnienia. */
const HORIZON = 10;
const HORIZON_COLOR = '#4d7c0f';
const KITE_COLOR = '#ef4444';
const BLOT_COLOR = '#a855f7';

const SKY = '#7dd3fc';
const GRASS = '#86efac';
const WALL = '#c2854a';
const SUN = '#fde047';
const INK = '#1f2937';

const PALETTE = [
  { hex: SKY, label: 'niebieski' },
  { hex: GRASS, label: 'zielony' },
  { hex: WALL, label: 'brązowy' },
  { hex: SUN, label: 'żółty' },
  { hex: KITE_COLOR, label: 'czerwony' },
  { hex: INK, label: 'czarny' },
];

type Tool = 'olowek' | 'pedzel' | 'gumka' | 'kubelek' | 'linia' | 'prostokat' | 'elipsa';

const TOOLS: { id: Tool; label: string; icon: typeof Pencil; hint: string }[] = [
  { id: 'olowek', label: 'Ołówek', icon: Pencil, hint: 'Kreska na jedną kratkę — rysujesz ręką.' },
  { id: 'pedzel', label: 'Pędzel', icon: Paintbrush, hint: 'To samo co ołówek, tylko grubsze.' },
  {
    id: 'gumka',
    label: 'Gumka',
    icon: Eraser,
    hint: 'Przywraca biel. Nie „usuwa” — zamalowuje na biało.',
  },
  {
    id: 'kubelek',
    label: 'Kubełek',
    icon: PaintBucket,
    hint: 'Zalewa kolorem cały obszar aż do pierwszej innej barwy.',
  },
  {
    id: 'linia',
    label: 'Linia',
    icon: Minus,
    hint: 'Przyciśnij i przeciągnij — kreska wyjdzie idealnie prosta.',
  },
  {
    id: 'prostokat',
    label: 'Prostokąt',
    icon: Square,
    hint: 'Przeciągnij na ukos. Z „równo” wychodzi kwadrat.',
  },
  {
    id: 'elipsa',
    label: 'Elipsa',
    icon: Circle,
    hint: 'Przeciągnij na ukos. Z „równo” wychodzi koło.',
  },
];

const idx = (x: number, y: number) => y * W + x;

/** Kleks, który ktoś zostawił na płótnie — pierwsze zamówienie każe go zetrzeć. */
const BLOT = [
  [3, 3],
  [4, 3],
  [5, 3],
  [4, 2],
  [4, 4],
  [3, 4],
].map(([x, y]) => idx(x, y));

/** Latawiec — do niego dochodzi sznurek w ostatnim zamówieniu. */
const KITE = [
  [19, 1],
  [18, 2],
  [19, 2],
  [20, 2],
  [19, 3],
].map(([x, y]) => idx(x, y));
const KITE_AT = { x: 19, y: 2 };

function startGrid(): string[] {
  const grid = new Array<string>(W * H).fill(PAPER);
  for (let x = 0; x < W; x += 1) grid[idx(x, HORIZON)] = HORIZON_COLOR;
  BLOT.forEach((i) => {
    grid[i] = BLOT_COLOR;
  });
  KITE.forEach((i) => {
    grid[i] = KITE_COLOR;
  });
  return grid;
}

interface Cell {
  x: number;
  y: number;
}

interface Op {
  tool: Tool;
  color: string;
  /** Ile komórek naprawdę zmieniło kolor. */
  count: number;
  box: { x0: number; y0: number; x1: number; y1: number };
  /** Długość kreski w kratkach — tylko dla narzędzia Linia. */
  len: number;
  from: Cell;
  to: Cell;
}

interface Order {
  id: string;
  title: string;
  brief: string;
  tool: Tool;
  /** Warunek czyta wykonaną operację i płótno po niej — nigdy wybór z menu. */
  check: (op: Op, grid: string[]) => boolean;
  /**
   * Podpowiedź po nietrafionej próbie — mówi, czego brakuje, nie podaje
   * narzędzia wprost. Funkcja (nie goły string) dla zamówień z progiem
   * rozmiaru/pozycji: bez konkretnych, ZMIERZONYCH liczb dziecko (i my przy
   * debugowaniu) nie ma jak odróżnić „o kratkę za mały” od realnej usterki —
   * oko bardzo łatwo myli się o jedną kratkę przy ocenie rysunku na ekranie.
   */
  miss: string | ((op: Op) => string);
}

function cellWord(n: number): string {
  if (n === 1) return 'kratkę';
  const lastTwo = n % 100;
  const lastDigit = n % 10;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return 'kratki';
  return 'kratek';
}

const ORDERS: Order[] = [
  {
    id: 'kleks',
    title: 'Zetrzyj fioletowy kleks',
    brief:
      'Ktoś zostawił na płótnie kleks. Usuń go, zanim zaczniesz malować — inaczej zostanie dziura w kolorze.',
    tool: 'gumka',
    check: (_op, grid) => BLOT.every((i) => grid[i] === PAPER),
    miss: 'Kleks wciąż jest. Poszukaj narzędzia, które przywraca biel, i przejedź po nim.',
  },
  {
    id: 'niebo',
    title: 'Zamaluj niebo na niebiesko — jednym ruchem',
    brief:
      'Nad linią horyzontu jest biało. Ołówkiem to jakieś dwieście kliknięć. Jest narzędzie, które robi to raz.',
    tool: 'kubelek',
    check: (op) => op.tool === 'kubelek' && op.color === SKY && op.count >= 100,
    miss: 'Jednym ruchem, nie kreska po kresce. I sprawdź, czy masz wybrany niebieski.',
  },
  {
    id: 'trawa',
    title: 'Zamaluj trawę na zielono',
    brief:
      'Pod horyzontem tak samo. Zwróć uwagę, gdzie kolor się zatrzymuje — i dlaczego akurat tam.',
    tool: 'kubelek',
    check: (op) => op.tool === 'kubelek' && op.color === GRASS && op.count >= 60,
    miss: 'Wybierz zielony i kliknij pod linią horyzontu.',
  },
  {
    id: 'dom',
    title: 'Postaw dom na trawie',
    brief:
      'Ściana to prostokąt — co najmniej 4 kratki szerokości i 3 wysokości, a jego SPÓD ma dotykać trawy (wysoki dom też się liczy — nie może tylko wisieć w powietrzu, oderwany od ziemi). Przerywana ramka na płótnie pokazuje przykładowy rozmiar.',
    tool: 'prostokat',
    /**
     * Liczy się SPÓD (`y1`), nie góra: dom może być wysoki i sięgać w niebo,
     * byle dotykał ziemi. Pierwsza wersja sprawdzała górę (`y0`) i odrzucała
     * poprawnie narysowany wysoki dom jako „wisi w powietrzu” — dokładnie
     * odwrotnie, niż powinna.
     */
    check: (op) =>
      op.tool === 'prostokat' &&
      op.box.x1 - op.box.x0 >= 3 &&
      op.box.y1 - op.box.y0 >= 2 &&
      op.box.y1 >= HORIZON,
    miss: (op) => {
      if (op.tool !== 'prostokat') return 'Ściana to zamówienie na prostokąt — użyj tego narzędzia.';
      const w = op.box.x1 - op.box.x0 + 1;
      const h = op.box.y1 - op.box.y0 + 1;
      if (op.box.y1 < HORIZON) {
        return `Masz prostokąt ${w}×${h} kratek — ale cały wisi nad trawą. Spód musi sięgać w trawę.`;
      }
      return `Masz prostokąt ${w}×${h} kratek — potrzeba co najmniej 4 szerokości i 3 wysokości. Narysuj większy.`;
    },
  },
  {
    id: 'slonce',
    title: 'Powieś na niebie okrągłe słońce',
    brief:
      'Uwaga: okrągłe, nie jajowate — włącz „równo” (jak Shift w edytorze) i narysuj kółko co najmniej tak duże jak przerywany okrąg na płótnie, nad linią horyzontu.',
    tool: 'elipsa',
    check: (op) =>
      op.tool === 'elipsa' &&
      op.box.x1 - op.box.x0 >= 3 &&
      op.box.x1 - op.box.x0 === op.box.y1 - op.box.y0 &&
      op.box.y1 < HORIZON,
    miss: (op) => {
      if (op.tool !== 'elipsa') return 'Słońce to zamówienie na elipsę — użyj tego narzędzia.';
      const w = op.box.x1 - op.box.x0 + 1;
      const h = op.box.y1 - op.box.y0 + 1;
      if (op.box.y1 >= HORIZON) {
        return `Masz figurę ${w}×${h} kratek, ale sięga do trawy albo niżej — słońce ma być całe nad horyzontem.`;
      }
      if (w !== h) {
        return `Wyszedł owal ${w}×${h} kratek, nie koło — włącz „równo” (jak Shift) i narysuj jeszcze raz.`;
      }
      return `Masz kółko ${w}×${h} kratek — potrzeba co najmniej 4×4. Narysuj większe.`;
    },
  },
  {
    id: 'sznurek',
    title: 'Doczep latawcowi sznurek',
    brief:
      'Jedna prosta kreska od latawca w dół, co najmniej tak długa jak przerywana linia przy latawcu. Odręcznie wyszłaby fala — to narzędzie rysuje prosto.',
    tool: 'linia',
    check: (op) => {
      const touchesKite =
        Math.abs(op.from.x - KITE_AT.x) + Math.abs(op.from.y - KITE_AT.y) <= 3 ||
        Math.abs(op.to.x - KITE_AT.x) + Math.abs(op.to.y - KITE_AT.y) <= 3;
      return op.tool === 'linia' && op.len >= 5 && touchesKite;
    },
    miss: (op) => {
      if (op.tool !== 'linia') return 'Sznurek to zamówienie na linię — użyj tego narzędzia.';
      const touchesKite =
        Math.abs(op.from.x - KITE_AT.x) + Math.abs(op.from.y - KITE_AT.y) <= 3 ||
        Math.abs(op.to.x - KITE_AT.x) + Math.abs(op.to.y - KITE_AT.y) <= 3;
      if (!touchesKite) {
        return `Kreska ma ${op.len} ${cellWord(op.len)}, ale nie zaczyna się przy latawcu — zacznij tuż przy nim.`;
      }
      return `Kreska ma ${op.len} ${cellWord(op.len)} — potrzeba co najmniej 5. Przeciągnij dalej.`;
    },
  },
];

/**
 * Przerywany szkic przykładowego rozmiaru — bez niego dziecko nie ma żadnego
 * punktu odniesienia na rozmiar/miejsce i nie wie, kiedy zamówienie jest
 * zrobione. Celowo RYSOWANY WIĘKSZY niż surowe minimum z `check()`: rysowanie
 * dokładnie na granicy progu (np. prostokąt, którego górna krawędź trafia
 * dokładnie na linię horyzontu) zostawia zero marginesu na niedoskonałość
 * ręki czy zaokrąglenie piksela do kratki — a to i tak dziecko zobaczyłoby
 * jako „narysowałem to samo, a nie zalicza”.
 */
type Guide =
  | { kind: 'rect'; box: { x0: number; y0: number; x1: number; y1: number } }
  | { kind: 'ellipse'; box: { x0: number; y0: number; x1: number; y1: number } }
  | { kind: 'line'; from: Cell; to: Cell };

const GUIDES: Partial<Record<string, Guide>> = {
  dom: { kind: 'rect', box: { x0: 2, y0: HORIZON + 2, x1: 6, y1: HORIZON + 5 } },
  slonce: { kind: 'ellipse', box: { x0: 8, y0: 2, x1: 12, y1: 6 } },
  sznurek: { kind: 'line', from: { x: KITE_AT.x, y: KITE_AT.y + 1 }, to: { x: KITE_AT.x, y: KITE_AT.y + 6 } },
};

/** Wypełnianie obszaru — przeszukiwanie wszerz po sąsiadach w tym samym kolorze. */
function floodFill(grid: string[], seed: Cell, color: string): number[] {
  const target = grid[idx(seed.x, seed.y)];
  if (target === color) return [];
  const changed: number[] = [];
  const queue: Cell[] = [seed];
  const seen = new Set<number>([idx(seed.x, seed.y)]);
  while (queue.length > 0) {
    const cell = queue.shift() as Cell;
    changed.push(idx(cell.x, cell.y));
    const neighbours: Cell[] = [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 },
    ];
    neighbours.forEach((next) => {
      if (next.x < 0 || next.y < 0 || next.x >= W || next.y >= H) return;
      const key = idx(next.x, next.y);
      if (seen.has(key) || grid[key] !== target) return;
      seen.add(key);
      queue.push(next);
    });
  }
  return changed;
}

/** Kreska Bresenhama — dlatego linia narzędziem jest idealnie prosta. */
function lineCells(from: Cell, to: Cell): number[] {
  const cells: number[] = [];
  let x = from.x;
  let y = from.y;
  const dx = Math.abs(to.x - x);
  const dy = -Math.abs(to.y - y);
  const sx = x < to.x ? 1 : -1;
  const sy = y < to.y ? 1 : -1;
  let error = dx + dy;
  for (;;) {
    cells.push(idx(x, y));
    if (x === to.x && y === to.y) break;
    const doubled = 2 * error;
    if (doubled >= dy) {
      error += dy;
      x += sx;
    }
    if (doubled <= dx) {
      error += dx;
      y += sy;
    }
  }
  return cells;
}

function box(from: Cell, to: Cell, even: boolean) {
  let x1 = to.x;
  let y1 = to.y;
  if (even) {
    const side = Math.min(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
    x1 = from.x + Math.sign(to.x - from.x || 1) * side;
    y1 = from.y + Math.sign(to.y - from.y || 1) * side;
  }
  return {
    x0: Math.max(0, Math.min(from.x, x1)),
    y0: Math.max(0, Math.min(from.y, y1)),
    x1: Math.min(W - 1, Math.max(from.x, x1)),
    y1: Math.min(H - 1, Math.max(from.y, y1)),
  };
}

/**
 * „Równo” dla linii działa inaczej niż dla figur: Shift w edytorze przyciąga
 * kreskę do poziomu, pionu albo ukosu 45°, a nie do kwadratowej ramki. Bez tego
 * pionowy sznurek latawca rysowany z włączonym „równo” miałby długość zera.
 */
function lineEnd(from: Cell, to: Cell, even: boolean): Cell {
  if (!even) return to;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > 2 * Math.abs(dy)) return { x: to.x, y: from.y };
  if (Math.abs(dy) > 2 * Math.abs(dx)) return { x: from.x, y: to.y };
  const side = Math.min(Math.abs(dx), Math.abs(dy));
  return { x: from.x + Math.sign(dx || 1) * side, y: from.y + Math.sign(dy || 1) * side };
}

function rectCells(area: ReturnType<typeof box>): number[] {
  const cells: number[] = [];
  for (let y = area.y0; y <= area.y1; y += 1) {
    for (let x = area.x0; x <= area.x1; x += 1) cells.push(idx(x, y));
  }
  return cells;
}

function ellipseCells(area: ReturnType<typeof box>): number[] {
  const cx = (area.x0 + area.x1) / 2;
  const cy = (area.y0 + area.y1) / 2;
  const rx = (area.x1 - area.x0) / 2 + 0.5;
  const ry = (area.y1 - area.y0) / 2 + 0.5;
  const cells: number[] = [];
  for (let y = area.y0; y <= area.y1; y += 1) {
    for (let x = area.x0; x <= area.x1; x += 1) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) cells.push(idx(x, y));
    }
  }
  return cells;
}

function brushCells(cell: Cell): number[] {
  const cells: number[] = [];
  for (let y = cell.y; y <= cell.y + 1; y += 1) {
    for (let x = cell.x; x <= cell.x + 1; x += 1) {
      if (x < W && y < H) cells.push(idx(x, y));
    }
  }
  return cells;
}

interface ToolBenchProps {
  color: string;
  onComplete?: () => void;
}

export function ToolBench({ color, onComplete }: ToolBenchProps) {
  const [grid, setGrid] = useState<string[]>(startGrid);
  const [history, setHistory] = useState<string[][]>([]);
  const [tool, setTool] = useState<Tool>('olowek');
  const [ink, setInk] = useState(INK);
  const [even, setEven] = useState(false);
  const [step, setStep] = useState(0);
  const [miss, setMiss] = useState<string | null>(null);
  const [free, setFree] = useState(false);
  const [finished, setFinished] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const anchor = useRef<Cell | null>(null);
  const working = useRef<string[] | null>(null);
  /** Płótno sprzed rozpoczęcia kreski — przy przeciąganiu `grid` jest już pomalowany. */
  const before = useRef<string[] | null>(null);
  const touched = useRef<{ count: number; x0: number; y0: number; x1: number; y1: number } | null>(
    null
  );
  const [preview, setPreview] = useState<{ cells: number[]; color: string } | null>(null);

  const order = ORDERS[step];
  const guide = !free ? GUIDES[order?.id ?? ''] : undefined;

  const toCell = (event: ReactPointerEvent<SVGSVGElement>): Cell => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * W);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * H);
    return { x: Math.min(W - 1, Math.max(0, x)), y: Math.min(H - 1, Math.max(0, y)) };
  };

  /** Zamyka operację: zapisuje migawkę do cofania i sprawdza bieżące zamówienie. */
  const commit = (next: string[], op: Op, before: string[] = grid) => {
    setHistory((prev) => [...prev.slice(-7), before]);
    setGrid(next);
    setPreview(null);
    if (free || !order) return;
    if (order.check(op, next)) {
      setMiss(null);
      const isLast = step === ORDERS.length - 1;
      if (isLast) setFree(true);
      else setStep(step + 1);
      return;
    }
    if (op.count > 0) setMiss(typeof order.miss === 'function' ? order.miss(op) : order.miss);
  };

  const paint = (cells: number[], color: string, base: string[]): string[] => {
    const next = [...base];
    cells.forEach((cell) => {
      next[cell] = color;
    });
    return next;
  };

  const start = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (finished) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    const cell = toCell(event);
    anchor.current = cell;
    const paintColor = tool === 'gumka' ? PAPER : ink;

    if (tool === 'kubelek') {
      const changed = floodFill(grid, cell, paintColor);
      const next = paint(changed, paintColor, grid);
      commit(next, {
        tool,
        color: paintColor,
        count: changed.length,
        box: { x0: 0, y0: 0, x1: W - 1, y1: H - 1 },
        len: 0,
        from: cell,
        to: cell,
      });
      dragging.current = false;
      return;
    }

    if (tool === 'olowek' || tool === 'pedzel' || tool === 'gumka') {
      const cells = tool === 'olowek' ? [idx(cell.x, cell.y)] : brushCells(cell);
      const next = paint(cells, paintColor, grid);
      before.current = grid;
      working.current = next;
      touched.current = { count: cells.length, x0: cell.x, y0: cell.y, x1: cell.x, y1: cell.y };
      setGrid(next);
      return;
    }

    setPreview({ cells: [idx(cell.x, cell.y)], color: paintColor });
  };

  const move = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging.current || !anchor.current) return;
    const cell = toCell(event);
    const paintColor = tool === 'gumka' ? PAPER : ink;

    if (tool === 'olowek' || tool === 'pedzel' || tool === 'gumka') {
      const base = working.current ?? grid;
      const cells = tool === 'olowek' ? [idx(cell.x, cell.y)] : brushCells(cell);
      if (cells.every((i) => base[i] === paintColor)) return;
      const next = paint(cells, paintColor, base);
      working.current = next;
      const seen = touched.current;
      if (seen) {
        touched.current = {
          count: seen.count + cells.length,
          x0: Math.min(seen.x0, cell.x),
          y0: Math.min(seen.y0, cell.y),
          x1: Math.max(seen.x1, cell.x),
          y1: Math.max(seen.y1, cell.y),
        };
      }
      setGrid(next);
      return;
    }

    const area = box(anchor.current, cell, even);
    const cells =
      tool === 'linia'
        ? lineCells(anchor.current, lineEnd(anchor.current, cell, even))
        : tool === 'prostokat'
          ? rectCells(area)
          : ellipseCells(area);
    setPreview({ cells, color: paintColor });
  };

  const stop = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging.current || !anchor.current) return;
    dragging.current = false;
    const from = anchor.current;
    const cell = toCell(event);
    const paintColor = tool === 'gumka' ? PAPER : ink;

    if (tool === 'olowek' || tool === 'pedzel' || tool === 'gumka') {
      const next = working.current;
      const seen = touched.current;
      const start = before.current;
      working.current = null;
      touched.current = null;
      before.current = null;
      anchor.current = null;
      if (!next || !seen) return;
      commit(
        next,
        {
          tool,
          color: paintColor,
          count: seen.count,
          box: { x0: seen.x0, y0: seen.y0, x1: seen.x1, y1: seen.y1 },
          len: 0,
          from,
          to: cell,
        },
        start ?? next
      );
      return;
    }

    if (tool === 'kubelek') {
      anchor.current = null;
      return;
    }

    const area = box(from, cell, even);
    const end = tool === 'linia' ? lineEnd(from, cell, even) : cell;
    const cells =
      tool === 'linia'
        ? lineCells(from, end)
        : tool === 'prostokat'
          ? rectCells(area)
          : ellipseCells(area);
    anchor.current = null;
    const next = paint(cells, paintColor, grid);
    commit(next, {
      tool,
      color: paintColor,
      count: cells.length,
      box: area,
      len: tool === 'linia' ? Math.max(Math.abs(end.x - from.x), Math.abs(end.y - from.y)) + 1 : 0,
      from,
      to: end,
    });
  };

  const undo = () => {
    if (history.length === 0) return;
    setGrid(history[history.length - 1]);
    setHistory((prev) => prev.slice(0, -1));
    setMiss(null);
  };

  const finish = () => {
    setFinished(true);
    onComplete?.();
  };

  const activeTool = TOOLS.find((item) => item.id === tool);
  const previewSet = new Set(preview?.cells ?? []);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          {/* Przybornik — świadomie wygląda jak pasek narzędzi edytora, nie jak reszta kursu */}
          <div className="flex flex-wrap items-center gap-1.5 border bg-zinc-100 p-2 dark:bg-zinc-800">
            {TOOLS.map((item) => {
              const Icon = item.icon;
              const active = item.id === tool;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTool(item.id)}
                  aria-pressed={active}
                  title={item.label}
                  className={cn(
                    'inline-flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors',
                    active
                      ? 'border-transparent text-white'
                      : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200'
                  )}
                  style={active ? { backgroundColor: color } : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="sr-only">{item.label}</span>
                </button>
              );
            })}

            <span className="mx-1 h-6 w-px bg-zinc-300 dark:bg-zinc-600" aria-hidden />

            {PALETTE.map((item) => (
              <button
                key={item.hex}
                type="button"
                onClick={() => setInk(item.hex)}
                aria-pressed={ink === item.hex}
                title={item.label}
                className={cn(
                  'h-8 w-8 cursor-pointer border-2 transition-transform',
                  ink === item.hex
                    ? 'scale-110 border-zinc-900 dark:border-white'
                    : 'border-zinc-300'
                )}
                style={{ backgroundColor: item.hex }}
              >
                <span className="sr-only">Kolor {item.label}</span>
              </button>
            ))}

            <span className="mx-1 h-6 w-px bg-zinc-300 dark:bg-zinc-600" aria-hidden />

            <button
              type="button"
              onClick={() => setEven((prev) => !prev)}
              aria-pressed={even}
              className={cn(
                'inline-flex h-9 cursor-pointer items-center gap-1.5 border px-2.5 text-xs font-bold transition-colors',
                even
                  ? 'border-transparent text-white'
                  : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200'
              )}
              style={even ? { backgroundColor: color } : undefined}
            >
              równo
            </button>

            <button
              type="button"
              onClick={undo}
              disabled={history.length === 0}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 border border-zinc-300 bg-white px-2.5 text-xs font-bold text-zinc-600 transition-colors hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden />
              Cofnij
            </button>
          </div>

          {/* Płótno */}
          <div className="overflow-x-auto border border-t-0 bg-zinc-200 p-3 dark:bg-zinc-800">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W * CELL} ${H * CELL}`}
              className="mx-auto block h-auto w-full min-w-[300px] max-w-[460px] cursor-crosshair bg-white shadow-sm"
              style={{ touchAction: 'none' }}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={stop}
              onPointerCancel={stop}
              role="application"
              aria-label="Płótno edytora grafiki — rysuj palcem albo myszką"
            >
              <rect x={0} y={0} width={W * CELL} height={H * CELL} fill={PAPER} />
              {grid.map((cellColor, i) =>
                cellColor === PAPER && !previewSet.has(i) ? null : (
                  <rect
                    key={i}
                    x={(i % W) * CELL}
                    y={Math.floor(i / W) * CELL}
                    width={CELL}
                    height={CELL}
                    fill={previewSet.has(i) ? (preview?.color ?? cellColor) : cellColor}
                    opacity={previewSet.has(i) ? 0.65 : 1}
                  />
                )
              )}
              {/* Siatka kratek — żeby było widać, że obraz składa się z kwadracików */}
              <g stroke="#00000012" strokeWidth={1}>
                {Array.from({ length: W - 1 }, (_, i) => (
                  <line
                    key={`v${i}`}
                    x1={(i + 1) * CELL}
                    y1={0}
                    x2={(i + 1) * CELL}
                    y2={H * CELL}
                  />
                ))}
                {Array.from({ length: H - 1 }, (_, i) => (
                  <line
                    key={`h${i}`}
                    x1={0}
                    y1={(i + 1) * CELL}
                    x2={W * CELL}
                    y2={(i + 1) * CELL}
                  />
                ))}
              </g>
              {guide && (
                <g pointerEvents="none" opacity={0.6} stroke={color} fill="none">
                  {guide.kind === 'rect' && (
                    <rect
                      x={guide.box.x0 * CELL}
                      y={guide.box.y0 * CELL}
                      width={(guide.box.x1 - guide.box.x0 + 1) * CELL}
                      height={(guide.box.y1 - guide.box.y0 + 1) * CELL}
                      strokeWidth={2}
                      strokeDasharray="5 4"
                    />
                  )}
                  {guide.kind === 'ellipse' && (
                    <ellipse
                      cx={((guide.box.x0 + guide.box.x1 + 1) / 2) * CELL}
                      cy={((guide.box.y0 + guide.box.y1 + 1) / 2) * CELL}
                      rx={((guide.box.x1 - guide.box.x0 + 1) / 2) * CELL}
                      ry={((guide.box.y1 - guide.box.y0 + 1) / 2) * CELL}
                      strokeWidth={2}
                      strokeDasharray="5 4"
                    />
                  )}
                  {guide.kind === 'line' && (
                    <line
                      x1={(guide.from.x + 0.5) * CELL}
                      y1={(guide.from.y + 0.5) * CELL}
                      x2={(guide.to.x + 0.5) * CELL}
                      y2={(guide.to.y + 0.5) * CELL}
                      strokeWidth={3}
                      strokeDasharray="5 4"
                      strokeLinecap="round"
                    />
                  )}
                </g>
              )}
            </svg>
          </div>

          <p className="mt-2 text-xs leading-snug text-muted-foreground">
            <strong>{activeTool?.label}:</strong> {activeTool?.hint}
          </p>
          {guide && (
            <p className="mt-1 text-xs italic leading-snug text-muted-foreground">
              Przerywany szkic na płótnie pokazuje przykładowy rozmiar — narysuj tyle, ile on, albo więcej.
            </p>
          )}
        </div>

        {/* Lista zamówień */}
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Zamówienia ({Math.min(step + (free ? 1 : 0), ORDERS.length)} z {ORDERS.length})
          </p>
          <ol className="space-y-1.5">
            {ORDERS.map((item, i) => {
              const isDone = free || i < step;
              const isNow = !free && i === step;
              return (
                <li
                  key={item.id}
                  className={cn(
                    'flex items-start gap-2 border-l-2 py-1.5 pl-2.5 text-sm leading-snug transition-colors',
                    isNow ? 'font-semibold' : 'border-transparent text-muted-foreground'
                  )}
                  style={isNow ? { borderColor: color } : undefined}
                >
                  <span className="mt-0.5 w-4 shrink-0">
                    {isDone ? (
                      <Check className="h-4 w-4" style={{ color }} aria-hidden />
                    ) : (
                      <span className="font-mono text-xs tabular-nums">{i + 1}</span>
                    )}
                  </span>
                  <span className={cn('min-w-0', isDone && 'line-through opacity-60')}>
                    {item.title}
                  </span>
                </li>
              );
            })}
          </ol>

          <AnimatePresence mode="wait">
            {!free && order && (
              <motion.p
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 border-l-4 bg-muted/40 p-3 text-sm leading-relaxed"
                style={{ borderColor: color }}
              >
                {order.brief}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {miss && !free && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 border border-amber-300 bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
              >
                {miss}{' '}
                <span className="opacity-70">Nie podoba się? Cofnij i spróbuj jeszcze raz.</span>
              </motion.p>
            )}
          </AnimatePresence>

          {free && (
            <div
              className="mt-3 border-l-4 bg-muted/40 p-3 text-sm leading-relaxed"
              style={{ borderColor: color }}
            >
              <p className="font-bold">Wszystkie sześć zamówień zrobione.</p>
              <p className="mt-1.5">
                Płótno jest teraz twoje — dorysuj ołówkiem, pędzlem, czym chcesz. Zauważ, ile z tego
                obrazka powstało w jednym ruchu, a ile trzeba było rysować ręką.
              </p>
              {!finished && (
                <button
                  type="button"
                  onClick={finish}
                  className="mt-3 w-full cursor-pointer px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: color }}
                >
                  Mój obrazek jest gotowy
                </button>
              )}
              {finished && (
                <p className="mt-3 flex items-start gap-2 text-sm font-medium">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  Znasz już cały przybornik. Teraz najciekawsze: co się dzieje, gdy kubełek dostanie
                  obszar, który tylko wygląda na zamknięty.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

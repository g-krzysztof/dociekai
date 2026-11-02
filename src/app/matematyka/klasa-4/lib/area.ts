/**
 * Pole figury na kratownicy — jedna czysta funkcja karmi widżet, przykłady i
 * klucz odpowiedzi (ta sama zasada co `lib/decimal.ts` czy `lib/roman.ts`).
 *
 * Figura opisana jest komórkami kratki, a nie ścieżką SVG: dzięki temu
 * `figureArea()` liczy pole dokładnie tak, jak liczy je dziecko (całe kratki +
 * połówki), a obrys rysuje się automatycznie jako krawędzie między komórką
 * należącą do figury a komórką spoza niej. Nic nie jest wpisywane na oko.
 *
 * Układ współrzędnych jest SVG-owy: `x` rośnie w prawo, `y` w dół, komórka
 * `(x, y)` zajmuje kwadrat od `(x, y)` do `(x + 1, y + 1)`.
 */

export interface GridCell {
  x: number;
  y: number;
}

/**
 * Który trójkąt połówkowy jest wypełniony — nazwa mówi, przy którym rogu
 * komórki leży wypełniona połówka. `tl` i `br` dzielą przekątną prawy-górny ↔
 * lewy-dolny, `tr` i `bl` — lewy-górny ↔ prawy-dolny.
 */
export type HalfCut = 'tl' | 'tr' | 'br' | 'bl';

export interface HalfCell extends GridCell {
  cut: HalfCut;
}

/** Figura złożona wyłącznie z całych kratek — do zalewania i porównywania. */
export interface CellFigure {
  /** Liczba kolumn planszy (nie figury) — kafelki nie mogą wyjść poza planszę. */
  width: number;
  /** Liczba wierszy planszy. */
  height: number;
  cells: GridCell[];
}

/** Figura z całymi kratkami i połówkami — do sklejania połówek. */
export interface MixedFigure {
  width: number;
  height: number;
  wholes: GridCell[];
  halves: HalfCell[];
}

/** Zaokrąglenie do 3 miejsc — ta sama zasada co w `lib/clock.ts` (identyczny SSR i klient). */
const round3 = (value: number): number => Math.round(value * 1000) / 1000;

export const cellKey = ({ x, y }: GridCell): string => `${x},${y}`;

/** Pole figury z samych całych kratek. */
export const cellArea = (figure: CellFigure): number => figure.cells.length;

/**
 * Pole figury z połówkami. Dwie połówki to jedna kratka — dlatego liczba
 * połówek w każdej figurze kursu jest parzysta i pole wychodzi całkowite.
 */
export const mixedArea = (figure: MixedFigure): number =>
  figure.wholes.length + figure.halves.length / 2;

/* ────────────────────────────── krawędzie ────────────────────────────── */

/**
 * Krawędź kratki. `h` to odcinek poziomy od `(x, y)` do `(x + 1, y)`
 * (rozdziela komórki `(x, y - 1)` i `(x, y)`), `v` to odcinek pionowy od
 * `(x, y)` do `(x, y + 1)` (rozdziela `(x - 1, y)` i `(x, y)`).
 */
export interface GridEdge {
  x: number;
  y: number;
  dir: 'h' | 'v';
}

export const edgeKey = ({ x, y, dir }: GridEdge): string => `${dir}:${x},${y}`;

/** Krawędź rozdzielająca dwie sąsiadujące komórki — kierunek wynika z ich położenia. */
export function edgeBetween(a: GridCell, b: GridCell): GridEdge {
  if (a.y === b.y) return { dir: 'v', x: Math.max(a.x, b.x), y: a.y };
  return { dir: 'h', x: a.x, y: Math.max(a.y, b.y) };
}

/**
 * Obrys figury: każda krawędź, po której jednej stronie jest komórka figury, a
 * po drugiej nie ma. Liczone z samego zbioru komórek — obrys nigdy nie rozjedzie
 * się z tym, co pokazuje wypełnienie.
 */
export function outlineEdges(figure: CellFigure): GridEdge[] {
  const inside = new Set(figure.cells.map(cellKey));
  const edges: GridEdge[] = [];
  const seen = new Set<string>();

  for (const cell of figure.cells) {
    const neighbours: [GridCell, GridEdge][] = [
      [{ x: cell.x, y: cell.y - 1 }, { dir: 'h', x: cell.x, y: cell.y }],
      [{ x: cell.x, y: cell.y + 1 }, { dir: 'h', x: cell.x, y: cell.y + 1 }],
      [{ x: cell.x - 1, y: cell.y }, { dir: 'v', x: cell.x, y: cell.y }],
      [{ x: cell.x + 1, y: cell.y }, { dir: 'v', x: cell.x + 1, y: cell.y }],
    ];
    for (const [neighbour, edge] of neighbours) {
      if (inside.has(cellKey(neighbour))) continue;
      const key = edgeKey(edge);
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push(edge);
    }
  }
  return edges;
}

/* ────────────────────────────── zalewanie ────────────────────────────── */

export interface FloodResult {
  /** Kolejne fale zalewania — `layers[0]` to komórka startowa. */
  layers: GridCell[][];
  /** Wszystkie zalane komórki, w kolejności odwiedzania. */
  filled: GridCell[];
  /** Czy zalanie wyszło poza figurę (dziura w obrysie albo start spoza figury). */
  escaped: boolean;
  /** Czy komórka startowa należała do figury. */
  startedInside: boolean;
}

/**
 * Zalewanie planszy kafelkami od komórki `seed`, falami (BFS). Ściany to obrys
 * figury pomniejszony o `openEdges` — dzięki temu ta sama funkcja obsługuje
 * figurę szczelną i figurę z dziurą, przez którą kafelki uciekają na całą
 * planszę. Granica planszy zatrzymuje zalewanie zawsze.
 *
 * Fale, a nie zwykła lista, bo widżet animuje każdą falę osobno — kolejność
 * i moment pojawienia się kafelka mają być funkcją odległości od startu.
 */
export function floodLayers(
  figure: CellFigure,
  seed: GridCell,
  openEdges: GridEdge[] = [],
): FloodResult {
  const open = new Set(openEdges.map(edgeKey));
  const walls = new Set(outlineEdges(figure).map(edgeKey).filter((key) => !open.has(key)));
  const inside = new Set(figure.cells.map(cellKey));

  const inBoard = ({ x, y }: GridCell) =>
    x >= 0 && y >= 0 && x < figure.width && y < figure.height;

  const layers: GridCell[][] = [];
  const filled: GridCell[] = [];
  const visited = new Set<string>();

  if (!inBoard(seed)) {
    return { layers, filled, escaped: false, startedInside: false };
  }

  const startedInside = inside.has(cellKey(seed));
  let frontier: GridCell[] = [seed];
  visited.add(cellKey(seed));

  while (frontier.length > 0) {
    layers.push(frontier);
    filled.push(...frontier);
    const next: GridCell[] = [];
    for (const cell of frontier) {
      const steps: GridCell[] = [
        { x: cell.x, y: cell.y - 1 },
        { x: cell.x, y: cell.y + 1 },
        { x: cell.x - 1, y: cell.y },
        { x: cell.x + 1, y: cell.y },
      ];
      for (const step of steps) {
        if (!inBoard(step)) continue;
        const key = cellKey(step);
        if (visited.has(key)) continue;
        if (walls.has(edgeKey(edgeBetween(cell, step)))) continue;
        visited.add(key);
        next.push(step);
      }
    }
    frontier = next;
  }

  const escaped = filled.some((cell) => inside.has(cellKey(cell)) !== startedInside);
  return { layers, filled, escaped, startedInside };
}

/* ──────────────────────────── połówki kratek ──────────────────────────── */

/** Rogi komórki w kolejności cyklicznej: lewy-górny → prawy-górny → prawy-dolny → lewy-dolny. */
const CORNERS: readonly [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

const CUT_ROTATION: Record<HalfCut, number> = { tl: 0, tr: 1, br: 2, bl: 3 };

/**
 * Trzy wierzchołki trójkąta połówkowego, w kolejności obróconej razem z samym
 * cięciem. Stała kolejność jest tu istotna: framer-motion animuje atrybut `d`,
 * interpolując liczby po kolei, więc odpowiadające sobie wierzchołki muszą stać
 * na tych samych pozycjach w obu ścieżkach — inaczej połówka nie „przelatuje”
 * na tacę, tylko wywija się w środku.
 */
export function halfVertices(x: number, y: number, cut: HalfCut): [number, number][] {
  const k = CUT_ROTATION[cut];
  return [0, 1, 3].map((offset) => {
    const [dx, dy] = CORNERS[(offset + k) % 4];
    return [x + dx, y + dy] as [number, number];
  });
}

/** Ścieżka SVG trójkąta połówkowego — `unit` skaluje kratkę na piksele. */
export function halfPath(x: number, y: number, cut: HalfCut, unit = 1): string {
  const [a, b, c] = halfVertices(x, y, cut).map(
    ([px, py]) => [round3(px * unit), round3(py * unit)] as [number, number],
  );
  return `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]} Z`;
}

/**
 * Dwie połówki sklejone w jedną całą kratkę na tacy: pierwsza ląduje jako `tl`,
 * druga jako `br`, więc razem wypełniają dokładnie kwadrat.
 */
export const MERGE_CUTS: readonly [HalfCut, HalfCut] = ['tl', 'br'];

/* ───────────────────────────────── ściąga ───────────────────────────────── */

export const AREA_RULES: string[] = [
  'Pole figury to powierzchnia, którą figura zajmuje — mierzymy je liczbą kwadratów jednostkowych, które się w niej mieszczą.',
  'Kwadrat jednostkowy musi być za każdym razem taki sam. Porównywać pola dwóch figur można tylko wtedy, gdy mierzysz je tą samą kratką.',
  'Figura musi być zamknięta. Jeśli w obrysie jest dziura, kafelki „uciekają” i pola nie da się policzyć.',
  'Dwie połówki kratki to jedna cała kratka — połówki dobieraj w pary i dopiero potem doliczaj do wyniku.',
  'Ten sam kształt można zmieniać, a pole zostaje — przesuwanie kawałków figury nic nie dodaje ani nie odejmuje.',
  'Pole to nie obwód: obwód mierzysz wzdłuż brzegu (długość), a pole liczysz w środku (kratki).',
];

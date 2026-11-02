/**
 * Maszyna, która uczy się rysunków dziecka — bloki 2 i 3 lekcji o sztucznej
 * inteligencji.
 *
 * **To jest prawdziwy model, nie udawanie.** Nie ma tu żadnej listy „tak
 * wygląda słońce”: maszyna nie wie o słońcach nic, dopóki dziecko nie narysuje
 * jej przykładów. Uczenie polega na zapamiętaniu przykładów, a rozpoznawanie —
 * na znalezieniu wśród nich trzech najbardziej podobnych do nowego rysunku
 * i policzeniu, z której tacy jest ich więcej (metoda najbliższych sąsiadów).
 *
 * Wybór tej metody jest dydaktyczny, a nie tylko wygodny: **da się ją pokazać
 * palcem**. Odpowiedź maszyny zawsze ma uzasadnienie w postaci trzech rysunków
 * dziecka, więc pomyłka nie jest magią, tylko czymś, co widać — „najbardziej
 * przypominał jej twój domek numer dwa”. Dokładnie na tym stoi blok 3: zmiana
 * danych zmienia sąsiadów, a sąsiedzi zmieniają odpowiedź.
 *
 * Jak rysunek staje się liczbami: kreski są skalowane do wspólnego rozmiaru
 * i środkowane (duże słońce w rogu i małe na środku to dla maszyny ten sam
 * kształt), odciskane w siatce 20 × 20 i lekko rozmywane, żeby kreska
 * przesunięta o włos nie była kreską zupełnie gdzie indziej. Podobieństwo to
 * iloczyn skalarny dwóch takich siatek — od 0 (nic wspólnego) do 1 (to samo).
 *
 * Wszystko liczy się w przeglądarce dziecka. Rysunki nie wychodzą nigdzie.
 */

export interface Point {
  x: number;
  y: number;
}

export type Stroke = Point[];
export type Doodle = Stroke[];

/** Rozmiar płótna do rysowania w jednostkach SVG. */
export const PAD = 300;
const GRID = 20;

/** Poniżej tego rozmiaru rysunek jest kropką, nie kształtem. */
const MIN_SIZE = 12;

export function doodleBox(doodle: Doodle) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const stroke of doodle) {
    for (const point of stroke) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }
  return { minX, minY, maxX, maxY, size: Math.max(maxX - minX, maxY - minY) };
}

/** Czy z tego da się już coś rozpoznać — pusta kartka i pojedyncza kropka nie. */
export function isDrawable(doodle: Doodle): boolean {
  const points = doodle.reduce((sum, stroke) => sum + stroke.length, 0);
  return points >= 2 && doodleBox(doodle).size >= MIN_SIZE;
}

/** Rysunek jako liczby: siatka 20 × 20, rozmyta i znormalizowana. */
export function featurize(doodle: Doodle): number[] | null {
  if (!isDrawable(doodle)) return null;
  const box = doodleBox(doodle);
  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;
  const grid = new Array<number>(GRID * GRID).fill(0);

  const toGrid = (point: Point) => ({
    u: (((point.x - cx) / box.size) * 0.86 + 0.5) * GRID,
    v: (((point.y - cy) / box.size) * 0.86 + 0.5) * GRID,
  });

  const stamp = (u: number, v: number) => {
    const i = Math.floor(u);
    const j = Math.floor(v);
    for (let dj = -1; dj <= 1; dj += 1) {
      for (let di = -1; di <= 1; di += 1) {
        const x = i + di;
        const y = j + dj;
        if (x < 0 || y < 0 || x >= GRID || y >= GRID) continue;
        const weight = Math.max(0, 1 - Math.hypot(x + 0.5 - u, y + 0.5 - v) / 1.3);
        grid[y * GRID + x] = Math.max(grid[y * GRID + x], weight);
      }
    }
  };

  for (const stroke of doodle) {
    if (stroke.length === 1) {
      const point = toGrid(stroke[0]);
      stamp(point.u, point.v);
      continue;
    }
    for (let k = 1; k < stroke.length; k += 1) {
      const a = toGrid(stroke[k - 1]);
      const b = toGrid(stroke[k]);
      const steps = Math.max(1, Math.ceil(Math.hypot(b.u - a.u, b.v - a.v) / 0.3));
      for (let s = 0; s <= steps; s += 1) {
        stamp(a.u + ((b.u - a.u) * s) / steps, a.v + ((b.v - a.v) * s) / steps);
      }
    }
  }

  const blurred = blur(blur(grid));
  const norm = Math.hypot(...blurred);
  return norm === 0 ? null : blurred.map((value) => value / norm);
}

function blur(grid: number[]): number[] {
  const out = new Array<number>(GRID * GRID).fill(0);
  const kernel = [1, 2, 1];
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      let sum = 0;
      let weight = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= GRID || yy >= GRID) continue;
          const w = kernel[dx + 1] * kernel[dy + 1];
          sum += grid[yy * GRID + xx] * w;
          weight += w;
        }
      }
      out[y * GRID + x] = sum / weight;
    }
  }
  return out;
}

export function similarity(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += a[i] * b[i];
  return Math.max(0, Math.min(1, sum));
}

// ─── Model ────────────────────────────────────────────────────────────────

export type TrayId = 'a' | 'b';

export interface Example {
  id: string;
  doodle: Doodle;
  vec: number[];
  /** Taca, do której dziecko włożyło rysunek — czyli etykieta przykładu. */
  tray: TrayId;
}

export interface Neighbor {
  example: Example;
  similarity: number;
}

export interface Guess {
  tray: TrayId;
  /** Trzej najbliżsi sąsiedzi, od najbardziej podobnego. */
  neighbors: Neighbor[];
  votes: Record<TrayId, number>;
}

/** Ilu sąsiadów pyta maszyna. Trzech — przy dwóch tacach głosowanie nigdy nie remisuje. */
export const K = 3;

/**
 * Rozpoznanie: trzech najbardziej podobnych i głosowanie. Przy mniej niż
 * trzech przykładach głosują ci, którzy są; remis (możliwy tylko wtedy)
 * rozstrzyga najbliższy.
 */
export function guess(vec: number[], examples: Example[]): Guess | null {
  if (examples.length === 0) return null;
  const neighbors = examples
    .map((example) => ({ example, similarity: similarity(vec, example.vec) }))
    .sort((x, y) => y.similarity - x.similarity)
    .slice(0, K);
  const votes: Record<TrayId, number> = { a: 0, b: 0 };
  neighbors.forEach((neighbor) => {
    votes[neighbor.example.tray] += 1;
  });
  const tray: TrayId =
    votes.a === votes.b ? neighbors[0].example.tray : votes.a > votes.b ? 'a' : 'b';
  return { tray, neighbors, votes };
}

// ─── Pary rzeczy do narysowania ───────────────────────────────────────────

export interface Thing {
  id: ShapeId;
  /** Mianownik: „maszyna mówi: słońce”. */
  name: string;
  /** Biernik: „narysuj słońce”. */
  acc: string;
}

export type ShapeId = 'slonce' | 'domek' | 'ryba' | 'drzewo' | 'serce' | 'gwiazdka' | 'kot';

export interface Pair {
  id: 'slonce-domek' | 'ryba-drzewo' | 'serce-gwiazdka';
  a: Thing;
  b: Thing;
  /** Co narysować w doświadczeniu „coś spoza tac” — rzecz niepodobna do żadnej z dwóch. */
  stranger: string;
}

export const PAIRS: Pair[] = [
  {
    id: 'slonce-domek',
    a: { id: 'slonce', name: 'słońce', acc: 'słońce' },
    b: { id: 'domek', name: 'domek', acc: 'domek' },
    stranger: 'rybę, parasol albo samochód',
  },
  {
    id: 'ryba-drzewo',
    a: { id: 'ryba', name: 'ryba', acc: 'rybę' },
    b: { id: 'drzewo', name: 'drzewo', acc: 'drzewo' },
    stranger: 'słońce, parasol albo samochód',
  },
  {
    id: 'serce-gwiazdka',
    a: { id: 'serce', name: 'serce', acc: 'serce' },
    b: { id: 'gwiazdka', name: 'gwiazdka', acc: 'gwiazdkę' },
    stranger: 'rybę, parasol albo domek',
  },
];

export const pairById = (id: Pair['id']) => PAIRS.find((pair) => pair.id === id) ?? PAIRS[0];

// ─── Rysunki przykładowe ──────────────────────────────────────────────────

/**
 * Rysunki „jak z ręki” generowane kodem. Służą dwóm celom: w bloku 3 zastępują
 * tace dziecka, które nie przeszło jeszcze bloku 2, a w teście silnika dają
 * powtarzalne dane do sprawdzenia, czy maszyna w ogóle umie odróżnić te kształty.
 * Każdy ma ziarno — to samo ziarno zawsze daje ten sam rysunek.
 */
export function sampleDoodle(shape: ShapeId, seed: number): Doodle {
  const random = mulberry32(seed * 7919 + shape.length * 104729);
  const jitter = (amount: number) => (random() - 0.5) * 2 * amount;
  const scale = 0.7 + random() * 0.45;
  const angle = jitter(0.16);
  const offsetX = jitter(30);
  const offsetY = jitter(30);

  /*
   * Zaokrąglenie do dziesiątych nie jest kosmetyką: `Math.sin` i `Math.cos` dają
   * w Node i w przeglądarce wyniki różne na ostatniej cyfrze, więc rysunek
   * policzony na serwerze nie zgadzałby się z tym z przeglądarki i React
   * zgłaszałby niezgodność hydracji.
   */
  const tenth = (value: number) => Math.round(value * 10) / 10;
  const place = (strokes: [number, number][][]): Doodle =>
    strokes.map((stroke) =>
      stroke.map(([x, y]) => {
        const dx = x * scale;
        const dy = y * scale;
        return {
          x: tenth(PAD / 2 + offsetX + dx * Math.cos(angle) - dy * Math.sin(angle) + jitter(2.5)),
          y: tenth(PAD / 2 + offsetY + dx * Math.sin(angle) + dy * Math.cos(angle) + jitter(2.5)),
        };
      })
    );

  const ring = (cx: number, cy: number, rx: number, ry: number, steps = 28, wobble = 5) => {
    const start = random() * Math.PI * 2;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const t = start + (i / steps) * Math.PI * 2;
      const r = 1 + jitter(wobble / 60);
      return [cx + Math.cos(t) * rx * r, cy + Math.sin(t) * ry * r] as [number, number];
    });
  };

  switch (shape) {
    case 'slonce': {
      const r = 42 + jitter(8);
      const rays = 7 + Math.floor(random() * 4);
      const long = 22 + jitter(8);
      const strokes: [number, number][][] = [ring(0, 0, r, r)];
      for (let i = 0; i < rays; i += 1) {
        const t = (i / rays) * Math.PI * 2 + jitter(0.12);
        strokes.push([
          [Math.cos(t) * (r + 10), Math.sin(t) * (r + 10)],
          [Math.cos(t) * (r + 10 + long), Math.sin(t) * (r + 10 + long)],
        ]);
      }
      return place(strokes);
    }
    case 'domek': {
      const w = 62 + jitter(10);
      const h = 55 + jitter(10);
      const roof = 45 + jitter(10);
      const body: [number, number][] = [
        [-w, -h / 2 + 20],
        [-w, h + 20],
        [w, h + 20],
        [w, -h / 2 + 20],
      ];
      const top: [number, number][] = [
        [-w - 12, -h / 2 + 20],
        [0, -h / 2 - roof + 20],
        [w + 12, -h / 2 + 20],
        [-w - 12, -h / 2 + 20],
      ];
      const door: [number, number][] = [
        [-12, h + 20],
        [-12, h - 10],
        [12, h - 10],
        [12, h + 20],
      ];
      return place(random() > 0.35 ? [body, top, door] : [body, top]);
    }
    case 'ryba': {
      const rx = 62 + jitter(10);
      const ry = 32 + jitter(6);
      const body = ring(0, 0, rx, ry);
      const tail: [number, number][] = [
        [rx - 4, 0],
        [rx + 38, -28 + jitter(6)],
        [rx + 38, 28 + jitter(6)],
        [rx - 4, 0],
      ];
      const eye = ring(-rx * 0.55, -ry * 0.2, 4, 4, 8, 1);
      return place([body, tail, eye]);
    }
    case 'drzewo': {
      const crown = 48 + jitter(8);
      const trunkW = 12 + jitter(3);
      const trunk: [number, number][] = [
        [-trunkW, 95],
        [-trunkW, crown - 18],
      ];
      const trunk2: [number, number][] = [
        [trunkW, 95],
        [trunkW, crown - 18],
      ];
      return place([ring(0, -20, crown, crown * (0.9 + jitter(0.1))), trunk, trunk2]);
    }
    case 'serce': {
      const s = 4.2 + jitter(0.5);
      const points: [number, number][] = [];
      for (let i = 0; i <= 32; i += 1) {
        const t = (i / 32) * Math.PI * 2;
        const x = 16 * Math.sin(t) ** 3;
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        points.push([x * s, y * s]);
      }
      return place([points]);
    }
    case 'gwiazdka': {
      const outer = 72 + jitter(10);
      const inner = outer * (0.4 + jitter(0.06));
      const points: [number, number][] = [];
      for (let i = 0; i <= 10; i += 1) {
        const t = -Math.PI / 2 + (i / 10) * Math.PI * 2;
        const r = i % 2 === 0 ? outer : inner;
        points.push([Math.cos(t) * r, Math.sin(t) * r]);
      }
      return place([points]);
    }
    case 'kot': {
      const head = ring(0, 10, 50, 44);
      const earL: [number, number][] = [
        [-44, -12],
        [-38, -62],
        [-12, -30],
      ];
      const earR: [number, number][] = [
        [44, -12],
        [38, -62],
        [12, -30],
      ];
      const whiskers: [number, number][][] = [
        [
          [-20, 20],
          [-75, 10],
        ],
        [
          [-20, 28],
          [-75, 34],
        ],
        [
          [20, 20],
          [75, 10],
        ],
        [
          [20, 28],
          [75, 34],
        ],
      ];
      return place([head, earL, earR, ...whiskers]);
    }
  }
}

/** Mały, powtarzalny generator liczb losowych — to samo ziarno, ten sam rysunek. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gotowe tace dla dziecka, które trafiło do bloku 3 bez własnych rysunków. */
export function sampleTrays(pair: Pair, perTray = 5): Example[] {
  const make = (thing: Thing, tray: TrayId, index: number): Example => {
    const doodle = sampleDoodle(thing.id, index + 1);
    return { id: `wzor-${thing.id}-${index}`, doodle, vec: featurize(doodle) ?? [], tray };
  };
  return [
    ...Array.from({ length: perTray }, (_, i) => make(pair.a, 'a', i)),
    ...Array.from({ length: perTray }, (_, i) => make(pair.b, 'b', i)),
  ];
}

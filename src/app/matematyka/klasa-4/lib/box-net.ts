/**
 * Siatki prostopadłościanów — geometria dla lekcji `siatki-prostopadloscianow`.
 *
 * Cała lekcja stoi na jednym mechanizmie: **siatka to zbiór prostokątów spiętych
 * zawiasami**, a złożenie bryły to obrót każdego prostokąta wokół jego zawiasu
 * o 90°. Dzięki temu ten sam kod:
 * - rysuje siatkę na płasko (`t = 0`),
 * - animuje składanie i rozkładanie (`0 < t < 1`),
 * - rozstrzyga, czy dany układ kwadratów w ogóle złoży się w pudełko
 *   (`foldCubeNet` — spacer po siatce z pilnowaniem, na którą ścianę bryły
 *   trafia każdy kwadrat).
 *
 * O poprawności układu decyduje więc **symulacja złożenia**, a nie lista
 * dozwolonych wzorów wpisana w dane — to ta sama zasada co `splitRegions`
 * w `lib/area-split.ts` czy `countPolyhedron` w `lib/solids.ts`.
 *
 * Zasady rysunkowe: każda współrzędna licząca się z sin/cos
 * przechodzi przez `round3`, bo inaczej SSR i klient wyliczą różne float64 na
 * tym samym atrybucie SVG i React zgłosi hydration mismatch.
 */

import { round3, type BoxSpec } from './solids';

/** Trzy wymiary prostopadłościanu — tymi słowami opisuje je moduł. */
export type BoxDim = 'dlugosc' | 'szerokosc' | 'wysokosc';

export const DIM_LABEL: Record<BoxDim, string> = {
  dlugosc: 'długość',
  szerokosc: 'szerokość',
  wysokosc: 'wysokość',
};

/** Wartość wymiaru z opisu bryły (`BoxSpec` trzyma je jako width/depth/height). */
export function dimValue(spec: BoxSpec, dim: BoxDim): number {
  if (dim === 'dlugosc') return spec.width;
  if (dim === 'szerokosc') return spec.depth;
  return spec.height;
}

/** Krawędź prostokąta siatki, wzdłuż której jest on zawiasem spięty z sąsiadem. */
export type NetSide = 'top' | 'bottom' | 'left' | 'right';

/** Sześć ścian pudełka — nazwy takie, jakby bryła stała na stole. */
export type BoxFaceId = 'dol' | 'gora' | 'przod' | 'tyl' | 'lewo' | 'prawo';

export const FACE_LABEL: Record<BoxFaceId, string> = {
  dol: 'ściana dolna',
  gora: 'ściana górna',
  przod: 'ściana przednia',
  tyl: 'ściana tylna',
  lewo: 'ściana lewa',
  prawo: 'ściana prawa',
};

/** Krótka nazwa na podpis wprost na prostokącie siatki — „ściana przednia" tam nie mieści się. */
export const FACE_SHORT: Record<BoxFaceId, string> = {
  dol: 'dno',
  gora: 'wieko',
  przod: 'przód',
  tyl: 'tył',
  lewo: 'lewa',
  prawo: 'prawa',
};

/** Ściany przeciwległe są identyczne — para jest tu tożsamością koloru i wymiarów. */
export type FacePairId = 'gora-dol' | 'przod-tyl' | 'lewo-prawo' | 'brak';

export const FACE_PAIR: Record<BoxFaceId, FacePairId> = {
  dol: 'gora-dol',
  gora: 'gora-dol',
  przod: 'przod-tyl',
  tyl: 'przod-tyl',
  lewo: 'lewo-prawo',
  prawo: 'lewo-prawo',
};

/**
 * Jeden prostokąt siatki: położenie na płaskiej kartce (`u` w prawo, `v` w dół)
 * plus zawias, którym trzyma się rodzica. Korzeń (`parent: null`) zostaje
 * nieruchomo na stole — to na nim staje złożone pudełko.
 */
export interface NetPiece {
  id: string;
  label: string;
  /** Nazwa, która mieści się wprost na prostokącie rysunku („dno", „wieko"). */
  short: string;
  u: number;
  v: number;
  w: number;
  h: number;
  parent: string | null;
  /** Która krawędź TEGO prostokąta jest wspólna z rodzicem. */
  hinge: NetSide | null;
  /** Wymiary bryły, którymi jest ten prostokąt — `null` dla siatek jednostkowych. */
  dims: [BoxDim, BoxDim] | null;
  pair: FacePairId;
}

export interface NetVec3 {
  x: number;
  y: number;
  z: number;
}

export interface NetPoint {
  x: number;
  y: number;
}

/** Prostokąt siatki po złożeniu o `t` — cztery rogi w przestrzeni. */
export interface FoldedFace {
  id: string;
  label: string;
  pair: FacePairId;
  quad: NetVec3[];
}

export interface ProjectedNetFace {
  id: string;
  label: string;
  pair: FacePairId;
  points: NetPoint[];
  /** Środek rzutu — pod podpis ściany. */
  center: NetPoint;
  /** Średnia głębokość; sortowanie malarskie idzie rosnąco (od najdalszej). */
  depth: number;
}

/* ------------------------------------------------------------------ */
/* Wzory siatek prostopadłościanu                                      */
/* ------------------------------------------------------------------ */

export type NetPatternId = 'krzyz' | 'pas' | 'schodki';

export interface NetPattern {
  id: NetPatternId;
  name: string;
  /** Jednym zdaniem: czym ten rozkład różni się od pozostałych. */
  note: string;
}

export const NET_PATTERNS: NetPattern[] = [
  {
    id: 'krzyz',
    name: 'krzyż',
    note: 'Dno w środku, cztery ściany boczne dookoła niego, wieko doczepione do tylnej ściany.',
  },
  {
    id: 'pas',
    name: 'pas',
    note: 'Cztery ściany boczne w jednym rzędzie — jak opaska owinięta wokół pudełka — a dno i wieko po przeciwnych stronach.',
  },
  {
    id: 'schodki',
    name: 'schodki',
    note: 'Cztery ściany jedna pod drugą, a dwie boczne doczepione z lewej i z prawej — wygląda inaczej, a składa się w to samo pudełko.',
  },
];

/**
 * Sześć prostokątów siatki dla zadanego pudełka. Wymiary prostokątów biorą się
 * wprost z `spec`, więc rysunek nie może rozjechać się z liczbami w treści:
 * `a` = długość, `b` = szerokość, `c` = wysokość.
 */
export function buildBoxNet(spec: BoxSpec, pattern: NetPatternId): NetPiece[] {
  const a = spec.width;
  const b = spec.depth;
  const c = spec.height;

  const face = (
    id: BoxFaceId,
    u: number,
    v: number,
    w: number,
    h: number,
    parent: string | null,
    hinge: NetSide | null,
    dims: [BoxDim, BoxDim]
  ): NetPiece => ({
    id,
    label: FACE_LABEL[id],
    short: FACE_SHORT[id],
    u,
    v,
    w,
    h,
    parent,
    hinge,
    dims,
    pair: FACE_PAIR[id],
  });

  const pieces: NetPiece[] =
    pattern === 'krzyz'
      ? [
          face('dol', c, c, a, b, null, null, ['dlugosc', 'szerokosc']),
          face('lewo', 0, c, c, b, 'dol', 'right', ['wysokosc', 'szerokosc']),
          face('prawo', c + a, c, c, b, 'dol', 'left', ['wysokosc', 'szerokosc']),
          face('tyl', c, 0, a, c, 'dol', 'bottom', ['dlugosc', 'wysokosc']),
          face('przod', c, c + b, a, c, 'dol', 'top', ['dlugosc', 'wysokosc']),
          face('gora', c, -b, a, b, 'tyl', 'bottom', ['dlugosc', 'szerokosc']),
        ]
      : pattern === 'pas'
        ? [
            // Korzeniem jest dno — złożone pudełko ma stanąć na stole, a nie
            // położyć się na ścianie przedniej.
            face('dol', 0, b + c, a, b, null, null, ['dlugosc', 'szerokosc']),
            face('przod', 0, b, a, c, 'dol', 'bottom', ['dlugosc', 'wysokosc']),
            face('prawo', a, b, b, c, 'przod', 'left', ['szerokosc', 'wysokosc']),
            face('tyl', a + b, b, a, c, 'prawo', 'left', ['dlugosc', 'wysokosc']),
            face('lewo', 2 * a + b, b, b, c, 'tyl', 'left', ['szerokosc', 'wysokosc']),
            face('gora', a + b, 0, a, b, 'tyl', 'bottom', ['dlugosc', 'szerokosc']),
          ]
        : [
            face('tyl', 0, 0, a, c, 'dol', 'bottom', ['dlugosc', 'wysokosc']),
            face('dol', 0, c, a, b, null, null, ['dlugosc', 'szerokosc']),
            face('przod', 0, c + b, a, c, 'dol', 'top', ['dlugosc', 'wysokosc']),
            face('gora', 0, 2 * c + b, a, b, 'przod', 'top', ['dlugosc', 'szerokosc']),
            face('lewo', -b, c + b, b, c, 'przod', 'right', ['szerokosc', 'wysokosc']),
            face('prawo', a, 0, b, c, 'tyl', 'left', ['szerokosc', 'wysokosc']),
          ];

  return normalizeNet(pieces);
}

/** Przesuwa całą siatkę tak, żeby zaczynała się w (0, 0) — wzory liczą się wygodniej ze znakami. */
export function normalizeNet(pieces: NetPiece[]): NetPiece[] {
  const minU = Math.min(...pieces.map((piece) => piece.u));
  const minV = Math.min(...pieces.map((piece) => piece.v));
  return pieces.map((piece) => ({ ...piece, u: piece.u - minU, v: piece.v - minV }));
}

/** Rozmiar płaskiej siatki — z tego liczy się `viewBox` widżetu. */
export function netBounds(pieces: NetPiece[]): { width: number; height: number } {
  const maxU = Math.max(...pieces.map((piece) => piece.u + piece.w));
  const maxV = Math.max(...pieces.map((piece) => piece.v + piece.h));
  const minU = Math.min(...pieces.map((piece) => piece.u));
  const minV = Math.min(...pieces.map((piece) => piece.v));
  return { width: maxU - minU, height: maxV - minV };
}

/* ------------------------------------------------------------------ */
/* Składanie                                                           */
/* ------------------------------------------------------------------ */

function sub(a: NetVec3, b: NetVec3): NetVec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a: NetVec3, b: NetVec3): NetVec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dot(a: NetVec3, b: NetVec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function scale(v: NetVec3, k: number): NetVec3 {
  return { x: v.x * k, y: v.y * k, z: v.z * k };
}

function add(a: NetVec3, b: NetVec3): NetVec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function normalize(v: NetVec3): NetVec3 {
  const length = Math.sqrt(dot(v, v)) || 1;
  return scale(v, 1 / length);
}

function centroid3(points: NetVec3[]): NetVec3 {
  const sum = points.reduce((acc, p) => add(acc, p), { x: 0, y: 0, z: 0 });
  return scale(sum, 1 / points.length);
}

/** Obrót punktu wokół prostej (`p0`, kierunek `axis`) o kąt `angle` — wzór Rodriguesa. */
function rotateAboutLine(point: NetVec3, p0: NetVec3, axis: NetVec3, angle: number): NetVec3 {
  const v = sub(point, p0);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const rotated = add(
    add(scale(v, c), scale(cross(axis, v), s)),
    scale(axis, dot(axis, v) * (1 - c))
  );
  return add(rotated, p0);
}

/** Cztery rogi prostokąta na płaskiej kartce: `u` w prawo, `v` w dół (czyli `y = -v`). */
function flatQuad(piece: NetPiece): NetVec3[] {
  return [
    { x: piece.u, y: -piece.v, z: 0 },
    { x: piece.u + piece.w, y: -piece.v, z: 0 },
    { x: piece.u + piece.w, y: -(piece.v + piece.h), z: 0 },
    { x: piece.u, y: -(piece.v + piece.h), z: 0 },
  ];
}

/** Odcinek zawiasu w płaskich współrzędnych — wspólna krawędź z rodzicem. */
function hingeSegment(piece: NetPiece): [NetVec3, NetVec3] {
  const left = piece.u;
  const right = piece.u + piece.w;
  const top = -piece.v;
  const bottom = -(piece.v + piece.h);

  if (piece.hinge === 'top') {
    return [
      { x: left, y: top, z: 0 },
      { x: right, y: top, z: 0 },
    ];
  }
  if (piece.hinge === 'bottom') {
    return [
      { x: left, y: bottom, z: 0 },
      { x: right, y: bottom, z: 0 },
    ];
  }
  if (piece.hinge === 'left') {
    return [
      { x: left, y: top, z: 0 },
      { x: left, y: bottom, z: 0 },
    ];
  }
  return [
    { x: right, y: top, z: 0 },
    { x: right, y: bottom, z: 0 },
  ];
}

interface FoldLink {
  p0: NetVec3;
  axis: NetVec3;
}

/**
 * Zawias prostokąta: prosta, wokół której się obraca, z kierunkiem dobranym
 * tak, żeby obrót **podnosił** kawałek nad kartkę (w stronę `+z`). Znak liczy
 * się z geometrii, a nie z wpisanej ręcznie tabelki — dzięki temu dowolny nowy
 * wzór siatki złoży się poprawnie bez dopisywania wyjątków.
 */
function foldLink(piece: NetPiece): FoldLink | null {
  if (!piece.parent || !piece.hinge) return null;

  const [a, b] = hingeSegment(piece);
  let axis = normalize(sub(b, a));

  const middle = centroid3(flatQuad(piece));
  const offset = sub(middle, a);
  const perpendicular = sub(offset, scale(axis, dot(axis, offset)));
  if (cross(axis, perpendicular).z < 0) axis = scale(axis, -1);

  return { p0: a, axis };
}

/**
 * Siatka złożona w `t` (0 = leży płasko, 1 = zamknięte pudełko). Każdy kawałek
 * obraca się wokół własnego zawiasu, a potem jedzie z całą gałęzią rodziców —
 * dokładnie tak, jak przy składaniu kartonu ręką.
 */
export function foldPieces(pieces: NetPiece[], t: number): FoldedFace[] {
  const byId = new Map(pieces.map((piece) => [piece.id, piece]));
  const angle = (t * Math.PI) / 2;

  const chainOf = (piece: NetPiece): FoldLink[] => {
    const links: FoldLink[] = [];
    let current: NetPiece | undefined = piece;
    const guard = new Set<string>();

    while (current && !guard.has(current.id)) {
      guard.add(current.id);
      const link = foldLink(current);
      if (link) links.push(link);
      current = current.parent ? byId.get(current.parent) : undefined;
    }

    return links;
  };

  return pieces.map((piece) => {
    const links = chainOf(piece);
    return {
      id: piece.id,
      label: piece.label,
      pair: piece.pair,
      quad: flatQuad(piece).map((point) => {
        const folded = links.reduce(
          (acc, link) => rotateAboutLine(acc, link.p0, link.axis, angle),
          point
        );
        return { x: round3(folded.x), y: round3(folded.y), z: round3(folded.z) };
      }),
    };
  });
}

export interface NetCamera {
  yaw: number;
  pitch: number;
  scale: number;
}

/**
 * Kamera wędrująca razem ze składaniem: przy `t = 0` patrzymy na kartkę
 * prostopadle (siatka czyta się jak w zeszycie), przy `t = 1` z góry i z boku,
 * czyli tak, jak cały moduł rysuje bryły.
 */
export function netCamera(t: number, scale: number): NetCamera {
  return { yaw: round3(0.62 * t), pitch: round3(-0.95 * t), scale };
}

/** Rzut równoległy — ta sama konwencja co `projectPolyhedron`, tylko bez liczenia widoczności. */
export function projectNet(faces: FoldedFace[], camera: NetCamera): ProjectedNetFace[] {
  const { yaw, pitch, scale: k } = camera;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);

  const project = (v: NetVec3) => {
    const x1 = v.x * cy + v.z * sy;
    const z1 = -v.x * sy + v.z * cy;
    const y2 = v.y * cp - z1 * sp;
    const z2 = v.y * sp + z1 * cp;
    return { point: { x: round3(x1 * k), y: round3(-y2 * k) }, depth: z2 };
  };

  return faces
    .map((face) => {
      const projected = face.quad.map(project);
      const points = projected.map((item) => item.point);
      const depth = projected.reduce((sum, item) => sum + item.depth, 0) / projected.length;
      const center = {
        x: round3(points.reduce((sum, p) => sum + p.x, 0) / points.length),
        y: round3(points.reduce((sum, p) => sum + p.y, 0) / points.length),
      };
      return { id: face.id, label: face.label, pair: face.pair, points, center, depth: round3(depth) };
    })
    .sort((a, b) => a.depth - b.depth);
}

/* ------------------------------------------------------------------ */
/* Czy ten układ kwadratów złoży się w pudełko?                        */
/* ------------------------------------------------------------------ */

export interface NetCell {
  col: number;
  row: number;
}

export const cellKey = (cell: NetCell): string => `${cell.col}:${cell.row}`;

export interface CubeNetCell extends NetCell {
  key: string;
  /** Ściana bryły, na którą trafia ten kwadrat po złożeniu (`null`, gdy układ jest rozspójny). */
  face: BoxFaceId | null;
  parent: string | null;
  hinge: NetSide | null;
}

export type CubeNetProblem = 'liczba' | 'rozspojna' | 'kolizja';

export interface CubeNetResult {
  ok: boolean;
  problem: CubeNetProblem | null;
  cells: CubeNetCell[];
  /** Kwadraty, które po złożeniu trafiają na tę samą ścianę. */
  clash: string[];
  clashFace: BoxFaceId | null;
  /** Ściana bryły, której w takim układzie nikt nie zakrywa. */
  missing: BoxFaceId | null;
  message: string;
}

interface Frame {
  /** Normalna kwadratu po złożeniu — ona wskazuje ścianę bryły. */
  n: NetVec3;
  /** Kierunek „w prawo” po kartce. */
  r: NetVec3;
  /** Kierunek „w dół” po kartce. */
  d: NetVec3;
}

const START_FRAME: Frame = {
  n: { x: 0, y: 0, z: 1 },
  r: { x: 1, y: 0, z: 0 },
  d: { x: 0, y: 1, z: 0 },
};

const negate = (v: NetVec3): NetVec3 => ({ x: -v.x, y: -v.y, z: -v.z });

/**
 * Przejście do sąsiedniego kwadratu = zagięcie kartki o 90° wzdłuż wspólnej
 * krawędzi. Normalna kwadratu wskakuje wtedy na miejsce kierunku, w którym
 * poszliśmy — i to wystarczy, żeby wiedzieć, na której ścianie bryły wyląduje.
 */
function step(frame: Frame, direction: NetSide): Frame {
  if (direction === 'right') return { n: frame.r, r: negate(frame.n), d: frame.d };
  if (direction === 'left') return { n: negate(frame.r), r: frame.n, d: frame.d };
  if (direction === 'bottom') return { n: frame.d, r: frame.r, d: negate(frame.n) };
  return { n: negate(frame.d), r: frame.r, d: frame.n };
}

/** Nazwa ściany bryły, na którą patrzy dana normalna — kwadrat startowy jest dnem. */
function faceOfNormal(n: NetVec3): BoxFaceId {
  if (n.z > 0.5) return 'dol';
  if (n.z < -0.5) return 'gora';
  if (n.y > 0.5) return 'przod';
  if (n.y < -0.5) return 'tyl';
  return n.x > 0.5 ? 'prawo' : 'lewo';
}

const NEIGHBOURS: { side: NetSide; dc: number; dr: number }[] = [
  { side: 'right', dc: 1, dr: 0 },
  { side: 'left', dc: -1, dr: 0 },
  { side: 'bottom', dc: 0, dr: 1 },
  { side: 'top', dc: 0, dr: -1 },
];

/** Krawędź dziecka wspólna z rodzicem leży po przeciwnej stronie niż kierunek marszu. */
const OPPOSITE: Record<NetSide, NetSide> = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top',
};

const ALL_FACES: BoxFaceId[] = ['dol', 'gora', 'przod', 'tyl', 'lewo', 'prawo'];

/** Czy układ trzyma się w jednym kawałku — każdy kwadrat styka się z sąsiadem całą krawędzią. */
export function netConnected(cells: NetCell[]): boolean {
  if (cells.length === 0) return true;

  const keys = new Set(cells.map(cellKey));
  const seen = new Set([cellKey(cells[0])]);
  const queue = [cells[0]];

  while (queue.length > 0) {
    const current = queue.pop() as NetCell;
    for (const { dc, dr } of NEIGHBOURS) {
      const next = { col: current.col + dc, row: current.row + dr };
      const key = cellKey(next);
      if (keys.has(key) && !seen.has(key)) {
        seen.add(key);
        queue.push(next);
      }
    }
  }

  return seen.size === keys.size;
}

/**
 * Spacer po układzie kwadratów z pilnowaniem, na którą ścianę bryły trafia
 * każdy z nich. Układ jest siatką dokładnie wtedy, gdy sześć kwadratów zakryje
 * sześć różnych ścian — a gdy tak nie jest, wiadomo **które dwa** kwadraty
 * wylądowały na sobie i której ściany zabrakło.
 */
export function foldCubeNet(cells: NetCell[]): CubeNetResult {
  const unique = new Map(cells.map((cell) => [cellKey(cell), cell]));
  const list = [...unique.values()];

  const empty: CubeNetResult = {
    ok: false,
    problem: 'liczba',
    cells: list.map((cell) => ({ ...cell, key: cellKey(cell), face: null, parent: null, hinge: null })),
    clash: [],
    clashFace: null,
    missing: null,
    message:
      list.length < 6
        ? `Pudełko ma 6 ścian, a tu jest kwadratów ${list.length}. Dołóż brakujące.`
        : `Pudełko ma 6 ścian, a tu jest kwadratów ${list.length}. Zdejmij nadmiar.`,
  };

  if (list.length !== 6) return empty;

  const seed = list[0];
  const visited = new Map<string, { cell: NetCell; frame: Frame; parent: string | null; hinge: NetSide | null }>();
  visited.set(cellKey(seed), { cell: seed, frame: START_FRAME, parent: null, hinge: null });

  const queue = [cellKey(seed)];
  while (queue.length > 0) {
    const key = queue.shift() as string;
    const current = visited.get(key);
    if (!current) continue;

    for (const { side, dc, dr } of NEIGHBOURS) {
      const next = { col: current.cell.col + dc, row: current.cell.row + dr };
      const nextKey = cellKey(next);
      if (!unique.has(nextKey) || visited.has(nextKey)) continue;

      visited.set(nextKey, {
        cell: next,
        frame: step(current.frame, side),
        parent: key,
        hinge: OPPOSITE[side],
      });
      queue.push(nextKey);
    }
  }

  const walked = list.map((cell) => {
    const key = cellKey(cell);
    const found = visited.get(key);
    return {
      ...cell,
      key,
      face: found ? faceOfNormal(found.frame.n) : null,
      parent: found?.parent ?? null,
      hinge: found?.hinge ?? null,
    } satisfies CubeNetCell;
  });

  if (visited.size !== list.length) {
    return {
      ok: false,
      problem: 'rozspojna',
      cells: walked,
      clash: walked.filter((cell) => cell.face === null).map((cell) => cell.key),
      clashFace: null,
      missing: null,
      message:
        'Ten układ rozpada się na osobne kawałki. Siatka musi trzymać się w jednym kawałku — każdy kwadrat styka się z sąsiadem całą krawędzią.',
    };
  }

  const byFace = new Map<BoxFaceId, string[]>();
  for (const cell of walked) {
    if (!cell.face) continue;
    byFace.set(cell.face, [...(byFace.get(cell.face) ?? []), cell.key]);
  }

  const collision = [...byFace.entries()].find(([, keys]) => keys.length > 1);
  if (collision) {
    const [face, keys] = collision;
    const missing = ALL_FACES.find((item) => !byFace.has(item)) ?? null;
    return {
      ok: false,
      problem: 'kolizja',
      cells: walked,
      clash: keys,
      clashFace: face,
      missing,
      message: `Przy składaniu dwa kwadraty nachodzą na siebie — oba trafiają w to samo miejsce (${FACE_LABEL[face]}), a ${missing ? FACE_LABEL[missing] : 'jedna ze ścian'} zostaje odkryta.`,
    };
  }

  return {
    ok: true,
    problem: null,
    cells: walked,
    clash: [],
    clashFace: null,
    missing: null,
    message: 'Sześć kwadratów zakrywa sześć różnych ścian — ten układ zamyka się w pudełko.',
  };
}

/**
 * Ten sam układ kwadratów podany dalej jako `NetPiece[]` — czyli gotowy do
 * złożenia na ekranie. Drzewo zawiasów pochodzi z tego samego spaceru, który
 * rozstrzyga poprawność, więc animacja pokazuje dokładnie to, co policzył
 * `foldCubeNet`: przy złym układzie dwa kwadraty naprawdę wchodzą na siebie.
 */
export function cubeNetPieces(result: CubeNetResult): NetPiece[] {
  return result.cells.map((cell) => ({
    id: cell.key,
    label: cell.face ? FACE_LABEL[cell.face] : 'kwadrat',
    short: cell.face ? FACE_SHORT[cell.face] : '',
    u: cell.col,
    v: cell.row,
    w: 1,
    h: 1,
    parent: cell.parent,
    hinge: cell.hinge,
    dims: null,
    pair: cell.face ? FACE_PAIR[cell.face] : 'brak',
  }));
}

/** Wygodny skrót dla treści statycznych: układ kwadratów prosto do rysunku. */
export function cellsToPieces(cells: NetCell[]): NetPiece[] {
  return cubeNetPieces(foldCubeNet(cells));
}

/* ------------------------------------------------------------------ */
/* Liczby, które lekcja wypisuje obok rysunków                         */
/* ------------------------------------------------------------------ */

export interface NetFaceGroup {
  pair: FacePairId;
  label: string;
  dims: [BoxDim, BoxDim];
  sides: [number, number];
  area: number;
}

/**
 * Trzy pary ścian z wymiarami i polem — jedno źródło dla podpisów na siatce,
 * dla przykładów i dla klucza odpowiedzi w ćwiczeniach.
 */
export function netFaceGroups(spec: BoxSpec): NetFaceGroup[] {
  const build = (
    pair: FacePairId,
    label: string,
    dims: [BoxDim, BoxDim]
  ): NetFaceGroup => {
    const sides: [number, number] = [dimValue(spec, dims[0]), dimValue(spec, dims[1])];
    return { pair, label, dims, sides, area: sides[0] * sides[1] };
  };

  return [
    build('gora-dol', 'dno i wieko', ['dlugosc', 'szerokosc']),
    build('przod-tyl', 'przód i tył', ['dlugosc', 'wysokosc']),
    build('lewo-prawo', 'lewa i prawa', ['szerokosc', 'wysokosc']),
  ];
}

/** Pole całej siatki, czyli pole powierzchni bryły — suma trzech par ścian. */
export function netTotalArea(spec: BoxSpec): number {
  return netFaceGroups(spec).reduce((sum, group) => sum + 2 * group.area, 0);
}

/**
 * Pole jednej ściany. `netFaceGroups` opisuje pary, a to jest ten sam wynik
 * zaadresowany pojedynczą ścianą — potrzebne wszędzie tam, gdzie dziecko klika
 * ściany po kolei (`PaintTheBox`), a nie od razu parami.
 */
export function faceArea(spec: BoxSpec, face: BoxFaceId): number {
  const pair = FACE_PAIR[face];
  return netFaceGroups(spec).find((group) => group.pair === pair)?.area ?? 0;
}

/** Grupa (para ścian), do której należy dana ściana — do podpisów „a druga taka sama". */
export function faceGroupOf(spec: BoxSpec, face: BoxFaceId): NetFaceGroup | undefined {
  return netFaceGroups(spec).find((group) => group.pair === FACE_PAIR[face]);
}

/**
 * Pole powierzchni pomniejszone o wskazane ściany — tyle realnie się maluje,
 * oklejania albo obija, gdy skrzynia stoi na ziemi (dno odpada) albo nie ma wieka.
 */
export function surfaceWithout(spec: BoxSpec, skip: BoxFaceId[]): number {
  const all: BoxFaceId[] = ['dol', 'gora', 'przod', 'tyl', 'lewo', 'prawo'];
  return all
    .filter((face) => !skip.includes(face))
    .reduce((sum, face) => sum + faceArea(spec, face), 0);
}

/** Ile pełnych opakowań (puszek farby, arkuszy papieru) trzeba na daną powierzchnię. */
export function packsNeeded(area: number, perPack: number): number {
  return Math.ceil(area / perPack);
}

export const SURFACE_RULES: string[] = [
  'Pole powierzchni to pole całej siatki — suma pól sześciu ścian bryły.',
  'Objętość mówi, ile się w środku MIEŚCI; pole powierzchni — ile trzeba, żeby bryłę OBŁOŻYĆ z zewnątrz.',
  'Ściany chodzą parami, więc liczy się trzy prostokąty i każdy bierze się dwa razy.',
  'Dno i wieko to długość × szerokość, przód i tył — długość × wysokość, boki — szerokość × wysokość.',
  'Stąd wzór: P = 2 · (a · b + a · c + b · c).',
  'Pole powierzchni podaje się w jednostkach kwadratowych (cm², m²), a objętość w sześciennych (cm³, m³).',
  'Dwie bryły o tej samej objętości mogą mieć różne pola powierzchni — im bardziej płaska bryła, tym więcej materiału na obłożenie.',
  'Gdy czegoś nie trzeba obłożyć (skrzynia stoi na ziemi, pudełko nie ma wieka), odejmij pole tej ściany.',
];

export const NET_RULES: string[] = [
  'Siatka to powierzchnia bryły rozcięta wzdłuż kilku krawędzi i rozłożona na płasko — nic nie ubywa i nic nie dochodzi.',
  'Siatka prostopadłościanu ma zawsze 6 prostokątów, bo bryła ma 6 ścian.',
  'Prostokąty łączą się w 3 pary identycznych: dno z wiekiem, przód z tyłem, lewa z prawą.',
  'Krawędzie, wzdłuż których dwa prostokąty się stykają, muszą mieć tę samą długość — inaczej po złożeniu nie zejdą się razem.',
  'Jedno pudełko ma wiele różnych siatek — zależą od tego, wzdłuż których krawędzi je rozetniesz.',
  'Nie każdy układ 6 prostokątów jest siatką: przy składaniu dwa mogą trafić na to samo miejsce, a inna ściana zostanie odkryta.',
  'Sześcian ma 11 różnych siatek — i tylko tyle, choć kwadraty da się ułożyć na dużo więcej sposobów.',
];

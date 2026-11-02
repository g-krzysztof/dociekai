/**
 * Wspólna geometria brył dla modułu `bryly` — jedna czysta funkcja, z której
 * renderuje się i rysunek, i liczniki części, i klucz odpowiedzi (ta sama
 * zasada co `lib/circle.ts` / `lib/area.ts`).
 *
 * Model jest opisany raz jako wielościan (`Polyhedron`: wierzchołki + ściany
 * jako indeksy), a `projectPolyhedron` rzutuje go na płaszczyznę i rozstrzyga
 * WIDOCZNOŚĆ: która ściana jest zwrócona do patrzącego, która krawędź jest
 * zasłonięta (rysowana linią przerywaną — to konwencja, której uczy przewodnik
 * `przewodnik-jezyk-bryl`) i który wierzchołek jest schowany za bryłą.
 *
 * Zasady:
 * - każda współrzędna liczona z sin/cos MUSI być zaokrąglona do 3 miejsc po
 *   przecinku (`round3`), inaczej SSR i klient wyliczą różne float64 na tym
 *   samym atrybucie SVG i React zgłosi hydration mismatch;
 * - kolejność wierzchołków w ścianie może być dowolna — normalną prostujemy
 *   względem środka bryły, więc nie da się „odwrócić” ściany literówką.
 *   Wymaga to bryły wypukłej, i tylko takie tu opisujemy.
 */

export interface SolidVec3 {
  x: number;
  y: number;
  z: number;
}

export interface SolidPoint {
  x: number;
  y: number;
}

/** Układ: x w prawo, y do góry, z w stronę patrzącego. */
export interface PolyhedronFace {
  id: string;
  /** Polska nazwa ściany — używana w podpisach i `aria-label`. */
  label: string;
  /** Indeksy wierzchołków obiegające ścianę (kolejność dowolna, byle po obwodzie). */
  corners: number[];
}

export interface Polyhedron {
  vertices: SolidVec3[];
  faces: PolyhedronFace[];
}

export interface ProjectedVertex {
  index: number;
  point: SolidPoint;
  /** Wierzchołek schowany za bryłą — nie należy do żadnej widocznej ściany. */
  hidden: boolean;
}

export interface ProjectedEdge {
  id: string;
  from: number;
  to: number;
  a: SolidPoint;
  b: SolidPoint;
  /** Krawędź niewidoczna — obie sąsiadujące ściany są odwrócone od patrzącego. */
  hidden: boolean;
}

export interface ProjectedFace {
  id: string;
  label: string;
  points: SolidPoint[];
  /** Średnia głębokość — do sortowania malarskiego (rosnąco = od najdalszej). */
  depth: number;
  visible: boolean;
}

export interface ProjectedSolid {
  vertices: ProjectedVertex[];
  edges: ProjectedEdge[];
  faces: ProjectedFace[];
  /** Połowa największego wymiaru rzutu — z tego liczy się `viewBox`. */
  reach: number;
}

export interface SolidView {
  /** Obrót wokół osi pionowej, w radianach. */
  yaw: number;
  /** Przechylenie kamery, w radianach (dodatnie = patrzymy z góry). */
  pitch: number;
  scale: number;
}

export function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Wymiary prostopadłościanu w jednostkach modelu. */
export interface BoxSpec {
  /** Długość — wzdłuż osi x. */
  width: number;
  /** Wysokość — wzdłuż osi y. */
  height: number;
  /** Szerokość (głębokość) — wzdłuż osi z. */
  depth: number;
}

/** Znaki rogów sześcianu jednostkowego; indeks rogu = pozycja na tej liście. */
const CORNER_SIGNS: ReadonlyArray<readonly [number, number, number]> = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

const BOX_FACES: PolyhedronFace[] = [
  { id: 'przod', label: 'ściana przednia', corners: [4, 5, 6, 7] },
  { id: 'tyl', label: 'ściana tylna', corners: [0, 1, 2, 3] },
  { id: 'gora', label: 'ściana górna', corners: [3, 2, 6, 7] },
  { id: 'dol', label: 'ściana dolna', corners: [0, 1, 5, 4] },
  { id: 'lewo', label: 'ściana lewa', corners: [0, 3, 7, 4] },
  { id: 'prawo', label: 'ściana prawa', corners: [1, 2, 6, 5] },
];

/** Prostopadłościan (a przy równych wymiarach — sześcian) wyśrodkowany w zerze. */
export function boxPolyhedron({ width, height, depth }: BoxSpec): Polyhedron {
  return {
    vertices: CORNER_SIGNS.map(([sx, sy, sz]) => ({
      x: (sx * width) / 2,
      y: (sy * height) / 2,
      z: (sz * depth) / 2,
    })),
    faces: BOX_FACES,
  };
}

/**
 * Ostrosłup o podstawie `sides`-kąta foremnego. Podstawa leży na dole,
 * wierzchołek na górze; całość wyśrodkowana w połowie wysokości, żeby obrót
 * nie wywracał bryły poza kadr.
 */
export function pyramidPolyhedron(sides: number, radius: number, height: number): Polyhedron {
  const base: SolidVec3[] = Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    return {
      x: round3(Math.cos(angle) * radius),
      y: -height / 2,
      z: round3(Math.sin(angle) * radius),
    };
  });
  const apex = sides;

  return {
    vertices: [...base, { x: 0, y: height / 2, z: 0 }],
    faces: [
      { id: 'podstawa', label: 'podstawa', corners: base.map((_, i) => i) },
      ...base.map((_, i) => ({
        id: `bok-${i}`,
        label: 'ściana boczna',
        corners: [i, (i + 1) % sides, apex],
      })),
    ],
  };
}

/** Graniastosłup o podstawie `sides`-kąta foremnego (podstawa dolna i górna + boki). */
export function prismPolyhedron(sides: number, radius: number, height: number): Polyhedron {
  const ring = (y: number): SolidVec3[] =>
    Array.from({ length: sides }, (_, i) => {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      return { x: round3(Math.cos(angle) * radius), y, z: round3(Math.sin(angle) * radius) };
    });

  const bottom = ring(-height / 2);
  const top = ring(height / 2);

  return {
    vertices: [...bottom, ...top],
    faces: [
      { id: 'podstawa-dolna', label: 'podstawa dolna', corners: bottom.map((_, i) => i) },
      { id: 'podstawa-gorna', label: 'podstawa górna', corners: top.map((_, i) => sides + i) },
      ...bottom.map((_, i) => ({
        id: `bok-${i}`,
        label: 'ściana boczna',
        corners: [i, (i + 1) % sides, sides + ((i + 1) % sides), sides + i],
      })),
    ],
  };
}

/**
 * Obrót całej bryły w przestrzeni modelu — kolejno wokół osi x, y, z.
 * Przydaje się, gdy budowniczy stawia bryłę „na sztorc”, a rysunek potrzebuje
 * jej położonej (graniastosłup trójkątny leżący jak namiot).
 */
export function rotatePolyhedron(
  solid: Polyhedron,
  angles: { x?: number; y?: number; z?: number }
): Polyhedron {
  const { x: ax = 0, y: ay = 0, z: az = 0 } = angles;

  const spin = (v: SolidVec3): SolidVec3 => {
    let { x, y, z } = v;
    if (ax) {
      const c = Math.cos(ax);
      const s = Math.sin(ax);
      [y, z] = [y * c - z * s, y * s + z * c];
    }
    if (ay) {
      const c = Math.cos(ay);
      const s = Math.sin(ay);
      [x, z] = [x * c + z * s, -x * s + z * c];
    }
    if (az) {
      const c = Math.cos(az);
      const s = Math.sin(az);
      [x, y] = [x * c - y * s, x * s + y * c];
    }
    return { x: round3(x), y: round3(y), z: round3(z) };
  };

  return { vertices: solid.vertices.map(spin), faces: solid.faces };
}

function subtract(a: SolidVec3, b: SolidVec3): SolidVec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a: SolidVec3, b: SolidVec3): SolidVec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dot(a: SolidVec3, b: SolidVec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function centroid(points: SolidVec3[]): SolidVec3 {
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z }),
    { x: 0, y: 0, z: 0 }
  );
  return { x: sum.x / points.length, y: sum.y / points.length, z: sum.z / points.length };
}

/** Obrót wokół osi pionowej (yaw), potem przechylenie kamery (pitch). */
function rotate(v: SolidVec3, yaw: number, pitch: number): SolidVec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = v.x * cy + v.z * sy;
  const z1 = -v.x * sy + v.z * cy;

  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return {
    x: x1,
    y: v.y * cp - z1 * sp,
    z: v.y * sp + z1 * cp,
  };
}

/** Pary indeksów krawędzi ściany, znormalizowane do `min-max`. */
function faceEdgeKeys(corners: number[]): string[] {
  return corners.map((corner, i) => {
    const next = corners[(i + 1) % corners.length];
    return corner < next ? `${corner}-${next}` : `${next}-${corner}`;
  });
}

/**
 * Rzut równoległy bryły na płaszczyznę rysunku wraz z rozstrzygnięciem
 * widoczności. Zwraca ściany posortowane malarsko (od najdalszej), więc
 * wystarczy je narysować po kolei, bez bufora głębi — ten sam chwyt co
 * `IsoCube`, tylko z obrotem sterowanym z zewnątrz.
 */
export function projectPolyhedron(solid: Polyhedron, view: SolidView): ProjectedSolid {
  const { yaw, pitch, scale } = view;
  const rotated = solid.vertices.map((v) => rotate(v, yaw, pitch));
  const middle = centroid(rotated);

  const points: SolidPoint[] = rotated.map((v) => ({
    x: round3(v.x * scale),
    y: round3(-v.y * scale),
  }));

  const faces: ProjectedFace[] = solid.faces.map((face) => {
    const corners = face.corners.map((i) => rotated[i]);
    const raw = cross(subtract(corners[1], corners[0]), subtract(corners[2], corners[0]));
    // Normalna prostowana względem środka bryły — dzięki temu kolejność
    // wierzchołków w opisie ściany nie może odwrócić jej „strony”.
    const outward = dot(raw, subtract(centroid(corners), middle)) >= 0 ? raw : cross(
      subtract(corners[2], corners[0]),
      subtract(corners[1], corners[0])
    );

    return {
      id: face.id,
      label: face.label,
      points: face.corners.map((i) => points[i]),
      depth: round3(centroid(corners).z),
      // Kamera stoi na +z, więc ściana jest widoczna, gdy jej normalna
      // ma dodatnią składową z. Zero (ściana „na kant”) traktujemy jak zasłoniętą.
      visible: outward.z > 0.0001,
    };
  });

  const visibleFaces = faces.filter((face) => face.visible);
  const visibleEdgeKeys = new Set(
    visibleFaces.flatMap((face) => {
      const source = solid.faces.find((item) => item.id === face.id);
      return source ? faceEdgeKeys(source.corners) : [];
    })
  );
  const visibleCorners = new Set(
    visibleFaces.flatMap((face) => solid.faces.find((item) => item.id === face.id)?.corners ?? [])
  );

  const edgeKeys = new Set(solid.faces.flatMap((face) => faceEdgeKeys(face.corners)));
  const edges: ProjectedEdge[] = [...edgeKeys].map((key) => {
    const [from, to] = key.split('-').map(Number);
    return {
      id: key,
      from,
      to,
      a: points[from],
      b: points[to],
      hidden: !visibleEdgeKeys.has(key),
    };
  });

  const vertices: ProjectedVertex[] = points.map((point, index) => ({
    index,
    point,
    hidden: !visibleCorners.has(index),
  }));

  const reach = points.reduce((max, p) => Math.max(max, Math.abs(p.x), Math.abs(p.y)), 0);

  return {
    vertices,
    edges,
    faces: faces.sort((a, b) => a.depth - b.depth),
    reach: round3(reach),
  };
}

/** Oś modelu, wzdłuż której leży wymiar/krawędź prostopadłościanu. */
export type BoxAxis = 'x' | 'y' | 'z';

export interface BoxEdgeGroup {
  axis: BoxAxis;
  /** Nazwa wymiaru, którym jest ta czwórka krawędzi. */
  label: string;
  length: number;
  /** Klucze krawędzi w formacie `min-max` — te same, którymi posługuje się `projectPolyhedron`. */
  edgeIds: string[];
}

const AXIS_ORDER: BoxAxis[] = ['x', 'y', 'z'];
const AXIS_INDEX: Record<BoxAxis, 0 | 1 | 2> = { x: 0, y: 1, z: 2 };
const AXIS_LABEL: Record<BoxAxis, string> = { x: 'długość', y: 'wysokość', z: 'szerokość' };

function axisLength(spec: BoxSpec, axis: BoxAxis): number {
  if (axis === 'x') return spec.width;
  if (axis === 'y') return spec.height;
  return spec.depth;
}

/**
 * Dwanaście krawędzi prostopadłościanu rozłożone na trzy czwórki równoległych —
 * i to właśnie te trzy długości są długością, szerokością i wysokością bryły.
 * Cała lekcja `opis-prostopadloscianu` stoi na tym rozkładzie: widżet
 * podświetla czwórkę, przykłady wypisują jej długość, a klucz odpowiedzi
 * (`4 × (a + b + c)`) liczy się z tej samej listy, nie z osobnej stałej.
 */
export function boxEdgeGroups(spec: BoxSpec): BoxEdgeGroup[] {
  return AXIS_ORDER.map((axis) => {
    const index = AXIS_INDEX[axis];
    const edgeIds: string[] = [];

    for (let a = 0; a < CORNER_SIGNS.length; a++) {
      for (let b = a + 1; b < CORNER_SIGNS.length; b++) {
        const differing = CORNER_SIGNS[a].filter((sign, i) => sign !== CORNER_SIGNS[b][i]).length;
        if (differing === 1 && CORNER_SIGNS[a][index] !== CORNER_SIGNS[b][index]) {
          edgeIds.push(`${a}-${b}`);
        }
      }
    }

    return { axis, label: AXIS_LABEL[axis], length: axisLength(spec, axis), edgeIds };
  });
}

export interface BoxFacePair {
  axis: BoxAxis;
  /** Jak nazwać tę parę w zdaniu, np. „przód i tył”. */
  label: string;
  faceIds: [string, string];
  /** Wymiary prostokąta, którym jest każda ze ścian tej pary. */
  sides: [number, number];
}

/**
 * Sześć ścian to trzy pary ścian przeciwległych — a ściany w parze są
 * identycznymi prostokątami. Wymiary każdej pary to dwa z trzech wymiarów bryły.
 */
export function boxFacePairs(spec: BoxSpec): BoxFacePair[] {
  return [
    { axis: 'z', label: 'przód i tył', faceIds: ['przod', 'tyl'], sides: [spec.width, spec.height] },
    { axis: 'y', label: 'góra i dół', faceIds: ['gora', 'dol'], sides: [spec.width, spec.depth] },
    { axis: 'x', label: 'lewa i prawa', faceIds: ['lewo', 'prawo'], sides: [spec.depth, spec.height] },
  ];
}

/** Ile drutu/patyczków pójdzie na sam szkielet bryły: `4 × (a + b + c)`. */
export function boxSkeletonLength(spec: BoxSpec): number {
  return boxEdgeGroups(spec).reduce((sum, group) => sum + group.length * group.edgeIds.length, 0);
}

/** Czy wszystkie trzy wymiary są równe — czyli czy to sześcian. */
export function isCube(spec: BoxSpec): boolean {
  return spec.width === spec.height && spec.height === spec.depth;
}

export const BOX_RULES: string[] = [
  'Prostopadłościan ma 6 ścian, 12 krawędzi i 8 wierzchołków — niezależnie od tego, jak jest duży.',
  'Każda ściana prostopadłościanu jest prostokątem, a ściany przeciwległe są identyczne — stąd 3 pary ścian.',
  'Dwanaście krawędzi dzieli się na 3 czwórki krawędzi równoległych i równej długości.',
  'Te trzy długości to długość, szerokość i wysokość — trzy liczby opisują całą bryłę.',
  'Sześcian to prostopadłościan, w którym wszystkie trzy wymiary są równe, więc każda ściana jest kwadratem.',
  'Na sam szkielet bryły potrzeba 4 × (długość + szerokość + wysokość) drutu.',
  'Naraz widać najwyżej 3 ściany, 9 krawędzi i 7 wierzchołków — resztę trzeba doliczyć, obracając bryłę.',
];

/** Sześć brył, które kurs nazywa po imieniu (patrz przewodnik `jezyk-bryl`). */
export type SolidKind =
  | 'prostopadloscian'
  | 'graniastoslup'
  | 'ostroslup'
  | 'walec'
  | 'stozek'
  | 'kula';

/** Czy powierzchnię bryły da się złożyć z samych płaskich ścian. */
export type SurfaceKind = 'plaskie' | 'zaokraglone';

export interface SolidCounts {
  sciany: number;
  krawedzie: number;
  wierzcholki: number;
}

/** Klucze wszystkich krawędzi bryły — te same, którymi posługuje się `projectPolyhedron`. */
export function polyhedronEdgeIds(solid: Polyhedron): string[] {
  return [...new Set(solid.faces.flatMap((face) => faceEdgeKeys(face.corners)))];
}

/**
 * Ściany, krawędzie i wierzchołki policzone **z modelu bryły**, a nie ze wzoru
 * wpisanego obok rysunku. Dzięki temu widżet, przykłady i klucz odpowiedzi nie
 * mogą się rozjechać, gdy zmieni się liczba boków podstawy — a o to właśnie
 * chodzi w lekcji `rozpoznawanie-bryl`, w której podstawa jest suwakiem.
 */
export function countPolyhedron(solid: Polyhedron): SolidCounts {
  return {
    sciany: solid.faces.length,
    krawedzie: polyhedronEdgeIds(solid).length,
    wierzcholki: solid.vertices.length,
  };
}

/** Przymiotnik od liczby boków podstawy: 3 → „trójkątny”, 6 → „sześciokątny”. */
const BASE_ADJECTIVE: Record<number, string> = {
  3: 'trójkątny',
  4: 'czworokątny',
  5: 'pięciokątny',
  6: 'sześciokątny',
  7: 'siedmiokątny',
  8: 'ośmiokątny',
};

/** Nazwa wielokąta podstawy: 3 → „trójkąt”, 6 → „sześciokąt”. */
const BASE_NOUN: Record<number, string> = {
  3: 'trójkąt',
  4: 'czworokąt',
  5: 'pięciokąt',
  6: 'sześciokąt',
  7: 'siedmiokąt',
  8: 'ośmiokąt',
};

export function basePolygonName(sides: number): string {
  return BASE_NOUN[sides] ?? `${sides}-kąt`;
}

/** Pełna nazwa bryły — „graniastosłup pięciokątny”. Bryła bierze nazwę od podstawy. */
export function solidName(kind: 'graniastoslup' | 'ostroslup', sides: number): string {
  const noun = kind === 'graniastoslup' ? 'graniastosłup' : 'ostrosłup';
  return `${noun} ${BASE_ADJECTIVE[sides] ?? `${sides}-kątny`}`;
}

export const SOLID_FAMILY_RULES: string[] = [
  'Bryły dzielą się na te o samych płaskich ścianach (graniastosłupy i ostrosłupy) i te z powierzchnią zaokrągloną (walec, stożek, kula).',
  'Graniastosłup ma dwie identyczne podstawy naprzeciw siebie, a między nimi ściany boczne.',
  'Ostrosłup ma jedną podstawę, a wszystkie ściany boczne schodzą się w jednym wierzchołku na górze.',
  'Bryła bierze nazwę od swojej podstawy: graniastosłup o podstawie pięciokąta to graniastosłup pięciokątny.',
  'Graniastosłup o podstawie n-kąta ma n + 2 ściany, 3n krawędzi i 2n wierzchołków.',
  'Ostrosłup o podstawie n-kąta ma n + 1 ścian, 2n krawędzi i n + 1 wierzchołków.',
  'Prostopadłościan to graniastosłup czworokątny, a sześcian — jego szczególny przypadek o wszystkich krawędziach równych.',
  'Toczą się tylko bryły z powierzchnią zaokrągloną: kula w każdą stronę, walec i stożek tylko po swojej okrągłej stronie.',
];

/** Ile czego ma prostopadłościan — liczone z modelu, nie wpisane ręcznie. */
export function countBoxParts(): { sciany: number; krawedzie: number; wierzcholki: number } {
  const box = boxPolyhedron({ width: 2, height: 2, depth: 2 });
  const edges = new Set(box.faces.flatMap((face) => faceEdgeKeys(face.corners)));
  return { sciany: box.faces.length, krawedzie: edges.size, wierzcholki: box.vertices.length };
}

export const BOX_PARTS = countBoxParts();

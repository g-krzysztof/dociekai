/**
 * Wspólny silnik lekcji o rozmiarze obrazu i napisach.
 *
 * Cztery widżety tej lekcji pracują na **jednym obrazku** — scenie z latarnią
 * morską zapisanej jako siatka 32 × 24 pikseli. To nie jest ozdoba: cała lekcja
 * mówi o tym, że obraz jest skończoną liczbą pikseli, więc obrazek musi być
 * naprawdę policzalny (768 pikseli, nie „jakaś grafika”). Dziecko widzi go w
 * bloku 1 malutki, w bloku 2 przycięty, w bloku 3 przerobiony na trzy zamówienia,
 * a w bloku 4 — powiększony do dokładnie tych wymiarów, których wymaga zadanie
 * obowiązkowe Z-6 (1096 × 756 px).
 *
 * Wszystkie przekształcenia są czystymi funkcjami bez stanu — ta sama dyscyplina
 * co `stamp.ts` w lekcji o kopiowaniu i `media-capacity.ts` w lekcji o nośnikach.
 * Dzięki temu **werdykt każdego bloku powstaje z wykonania operacji**, a nie z
 * listy warunków wpisanych z ręki: `CanvasOrImage` sprawdza rozwiązanie,
 * uruchamiając tę samą funkcję z parametrami zamówienia i porównując wynik.
 *
 * Dwie operacje, których nie wolno mylić (to jest sedno lekcji):
 *  - `resample` — **rozmiar obrazu**: ta sama treść na innej liczbie pikseli.
 *    Nic nie znika i nic nie dochodzi, ale szczegóły ubywają bezpowrotnie.
 *  - `resizeCanvas` — **rozmiar płótna**: ta sama treść w innej ramie. Piksele
 *    zostają jak były, tyle że dochodzi puste tło albo brzeg przepada.
 */

/* `Picture`, `PAPER` i `at` mieszkają we wspólnym `components/picture-view.tsx`
   od chwili, gdy lekcja o formatach stała się ich drugim konsumentem; tutaj
   tylko re-eksport, żeby widżety tej lekcji importowały je tak jak dotąd. */
export { PAPER, at, type Picture } from '../../picture-view';
import { PAPER, at, type Picture } from '../../picture-view';

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const SKY = '#cfe7f7';
const GLOW = '#f8e3c2';
const SUN_C = '#f6b93b';
const SEA = '#4a90d9';
const DEEP = '#1d4ed8';
const FOAM = '#dff1fb';
const GRASS = '#4f7f3c';
const ROCK = '#6b5844';
const SHADE = '#3f3327';
const WALL = '#f7fafc';
const BAND = '#d33b3b';
const IRON = '#33415a';
const LAMP_C = '#fbe158';
const BIRD = '#4b5768';

/** Litera w `ART` → kolor komórki. Nazwy służą też komunikatom w `CaptionLab`. */
const PALETTE: Record<string, { color: string; name: string }> = {
  '.': { color: SKY, name: 'niebo' },
  ',': { color: GLOW, name: 'jasne niebo nad morzem' },
  o: { color: SUN_C, name: 'słońce' },
  '~': { color: SEA, name: 'morze' },
  '=': { color: DEEP, name: 'ciemne morze' },
  f: { color: FOAM, name: 'piana na falach' },
  '^': { color: GRASS, name: 'trawa' },
  '#': { color: ROCK, name: 'skała' },
  x: { color: SHADE, name: 'ciemna skała' },
  W: { color: WALL, name: 'biała ściana latarni' },
  R: { color: BAND, name: 'czerwony pas latarni' },
  D: { color: IRON, name: 'ciemna blacha latarni' },
  Y: { color: LAMP_C, name: 'światło latarni' },
  b: { color: BIRD, name: 'mewa' },
};

/**
 * Scena 32 × 24. Rysowana znakami, bo w tej postaci da się ją przeczytać i
 * poprawić w kodzie — a przy 768 komórkach tablica liczb byłaby nie do
 * utrzymania. Latarnia stoi w kolumnach 13–18, słońce po prawej, morze i skała
 * dają dwa duże obszary o skrajnej jasności (to na nich `CaptionLab` liczy
 * kontrast napisu).
 */
const ART = [
  '................................',
  '................................',
  '................................',
  '...............DD.......oooo....',
  '..............DDDD.....oooooo...',
  '..............YYYY.....oooooo...',
  '.........b.b..DDDD.....oooooo...',
  '..........b..WWWWWW.....oooo....',
  '....b.b.......WWWW..............',
  '.....b........WWWW..............',
  '..............RRRR..............',
  '..............RRRR..............',
  ',,,,,,,,,,,,,,WWWW,,,,,,,,,,,,,,',
  ',,,,,,,,,,,,,,WWWW,,,,,,,,,,,,,,',
  '~~~~~~~~~~~~~~RRRR~~~~~~~~~~~~~~',
  '~~~=~~~~~~~~~~RRRR~~~~~~~=~~~~~~',
  '====f=====f===WWWW===f======f===',
  '^^^^^^^^^^^^^^WDDW^^^^^^^^^^^^^^',
  '^^^^^^^^^^^^^^WDDW^^^^^^^^^^^^^^',
  '#^##########^###^###########^###',
  '################################',
  '################################',
  'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
];

export const SCENE_W = 32;
export const SCENE_H = 24;

function buildScene(): Picture {
  const cells: string[] = [];
  ART.forEach((row) => {
    for (let x = 0; x < SCENE_W; x += 1) {
      cells.push(PALETTE[row[x]]?.color ?? SKY);
    }
  });
  return { w: SCENE_W, h: SCENE_H, cells };
}

export const SCENE: Picture = buildScene();

/** Ile pikseli ma obraz — liczba, wokół której kręci się cała lekcja. */
export const pixelCount = (pic: Picture) => pic.w * pic.h;

/** Głowa latarni z lampą — to, co ma się zmieścić w kwadratowym awatarze. */
export const LAMP_HEAD: Rect = { x0: 13, y0: 3, x1: 18, y1: 9 };
/** Cała latarnia od czapy po drzwi — jej nie wolno zasłonić napisem. */
export const TOWER: Rect = { x0: 13, y0: 3, x1: 18, y1: 18 };
/** Pas z linią wody: morze, piana i trawa nad klifem. */
export const SHORE: Rect = { x0: 0, y0: 14, x1: 31, y1: 18 };

export const rectW = (r: Rect) => r.x1 - r.x0 + 1;
export const rectH = (r: Rect) => r.y1 - r.y0 + 1;

/**
 * **Rozmiar obrazu.** Ta sama treść przeliczona na inną liczbę pikseli metodą
 * najbliższego sąsiada — czyli tak, jak robi to każdy prosty edytor bez
 * wygładzania. Kluczowe dla lekcji: zmniejszenie **wyrzuca** komórki, a
 * powiększenie ich nie odtwarza, tylko powiela te, które zostały.
 */
export function resample(pic: Picture, w: number, h: number): Picture {
  const cells = new Array<string>(w * h);
  for (let y = 0; y < h; y += 1) {
    const sy = Math.min(pic.h - 1, Math.floor(((y + 0.5) * pic.h) / h));
    for (let x = 0; x < w; x += 1) {
      const sx = Math.min(pic.w - 1, Math.floor(((x + 0.5) * pic.w) / w));
      cells[at(w, x, y)] = pic.cells[at(pic.w, sx, sy)];
    }
  }
  return { w, h, cells };
}

export type AnchorRow = 'gora' | 'srodek' | 'dol';
export type AnchorCol = 'lewo' | 'srodek' | 'prawo';
export interface Anchor {
  row: AnchorRow;
  col: AnchorCol;
}

/**
 * **Rozmiar płótna.** Piksele obrazka zostają nietknięte, zmienia się rama
 * dookoła nich: przy większym płótnie dochodzi puste tło, przy mniejszym brzegi
 * przepadają. `anchor` mówi, gdzie w nowej ramie stanie stary obrazek — to
 * właśnie ta jedna nastawa decyduje, czy pasek na podpis wyjdzie u dołu, czy u
 * góry.
 */
export function resizeCanvas(pic: Picture, w: number, h: number, anchor: Anchor): Picture {
  const cells = new Array<string>(w * h).fill(PAPER);
  const ox =
    anchor.col === 'lewo' ? 0 : anchor.col === 'srodek' ? Math.floor((w - pic.w) / 2) : w - pic.w;
  const oy =
    anchor.row === 'gora' ? 0 : anchor.row === 'srodek' ? Math.floor((h - pic.h) / 2) : h - pic.h;
  for (let y = 0; y < pic.h; y += 1) {
    const ty = y + oy;
    if (ty < 0 || ty >= h) continue;
    for (let x = 0; x < pic.w; x += 1) {
      const tx = x + ox;
      if (tx < 0 || tx >= w) continue;
      cells[at(w, tx, ty)] = pic.cells[at(pic.w, x, y)];
    }
  }
  return { w, h, cells };
}

/** Kadrowanie: okno o zadanym rozmiarze przesunięte w wybrane miejsce obrazu. */
export function crop(pic: Picture, x0: number, y0: number, w: number, h: number): Picture {
  const cells = new Array<string>(w * h).fill(PAPER);
  for (let y = 0; y < h; y += 1) {
    const sy = y0 + y;
    if (sy < 0 || sy >= pic.h) continue;
    for (let x = 0; x < w; x += 1) {
      const sx = x0 + x;
      if (sx < 0 || sx >= pic.w) continue;
      cells[at(w, x, y)] = pic.cells[at(pic.w, sx, sy)];
    }
  }
  return { w, h, cells };
}

export function samePicture(a: Picture, b: Picture): boolean {
  return a.w === b.w && a.h === b.h && a.cells.every((color, i) => color === b.cells[i]);
}

/** Czy prostokąt `inner` mieści się w całości w oknie o podanym położeniu. */
export function fitsInside(inner: Rect, x0: number, y0: number, w: number, h: number): boolean {
  return inner.x0 >= x0 && inner.y0 >= y0 && inner.x1 < x0 + w && inner.y1 < y0 + h;
}

/** Kształt obrazu skrócony do najprostszej postaci, np. „4:3”. */
export function shapeOf(w: number, h: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

/* ── Jasność i kontrast — do oceny czytelności napisu ──────────────────────── */

function channel(value: number): number {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** Względna jasność koloru w zapisie `#rrggbb` (wzór z WCAG). */
export function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Stosunek kontrastu dwóch jasności — 1 to kolory nie do odróżnienia. */
export function contrastOf(lumA: number, lumB: number): number {
  const light = Math.max(lumA, lumB);
  const dark = Math.min(lumA, lumB);
  return (light + 0.05) / (dark + 0.05);
}

export interface Underneath {
  /** Średnia jasność pikseli pod napisem. */
  lum: number;
  /** Nazwa koloru, którego pod napisem jest najwięcej — do komunikatu. */
  dominant: string;
}

const NAME_BY_COLOR = new Map(
  Object.values(PALETTE).map((entry) => [entry.color, entry.name] as const)
);

/**
 * Co leży pod ramką napisu. Kontrast liczymy ze **średniej jasności** wszystkich
 * zakrytych pikseli, a nazwę bierzemy z koloru, którego jest najwięcej — dzięki
 * temu komunikat mówi „napis stoi na morzu”, a nie „kontrast 2,1”.
 */
export function underneath(pic: Picture, rect: Rect): Underneath {
  const counts = new Map<string, number>();
  let sum = 0;
  let n = 0;
  const x0 = Math.max(0, Math.floor(rect.x0));
  const y0 = Math.max(0, Math.floor(rect.y0));
  const x1 = Math.min(pic.w - 1, Math.ceil(rect.x1));
  const y1 = Math.min(pic.h - 1, Math.ceil(rect.y1));
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const color = pic.cells[at(pic.w, x, y)];
      counts.set(color, (counts.get(color) ?? 0) + 1);
      sum += luminance(color);
      n += 1;
    }
  }
  if (n === 0) return { lum: 1, dominant: 'pusty margines' };
  let best = PAPER;
  let bestCount = -1;
  counts.forEach((count, color) => {
    if (count > bestCount) {
      best = color;
      bestCount = count;
    }
  });
  return { lum: sum / n, dominant: NAME_BY_COLOR.get(best) ?? 'puste tło' };
}

/** Czy dwa prostokąty w ogóle się na siebie nakładają. */
export function overlaps(a: Rect, b: Rect): boolean {
  return !(a.x1 < b.x0 || a.x0 > b.x1 || a.y1 < b.y0 || a.y0 > b.y1);
}

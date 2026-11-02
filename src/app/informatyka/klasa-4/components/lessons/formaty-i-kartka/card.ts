/**
 * Wspólny silnik lekcji o formatach plików graficznych.
 *
 * Cała lekcja stoi na jednej rzeczy: **waga pliku jest tu liczona naprawdę, z
 * pikseli obrazka**, a nie wpisana z ręki do danych. Dzięki temu reguła „rysunek
 * → PNG, zdjęcie → JPG” nie jest zdaniem do zapamiętania — wychodzi z wagi,
 * którą dziecko samo zmierzy, i zmienia się razem z obrazkiem. To ta sama
 * dyscyplina „jedna czysta funkcja”, co `media-capacity.ts` w lekcji 5,
 * `stamp.ts` w lekcji 15 i `scene.ts` w lekcji 16.
 *
 * **Model jest uproszczony i lekcja mówi to wprost.** Prawdziwe formaty liczą
 * się inaczej (PNG filtruje wiersze i pakuje je algorytmem Deflate, JPG rozkłada
 * bloki 8 × 8 na fale kosinusowe), ale mechanizm, który tu odtwarzamy, jest
 * prawdziwy i to on decyduje o proporcjach:
 *  - **BMP** nic nie ściska — waży dokładnie tyle, ile ma pikseli razy trzy bajty;
 *  - **PNG** ściska **bezstratnie**, zapisując ciągi jednakowych pikseli zamiast
 *    każdego z osobna (`runs`), więc płaskie rysunki chudną drastycznie, a
 *    zaszumione zdjęcia prawie wcale;
 *  - **GIF** najpierw **wyrzuca kolory** (paleta), potem ściska tak jak PNG;
 *  - **JPG** najpierw **wyrzuca szczegóły** (`blur`), potem ściska — dlatego
 *    wygrywa na zdjęciach i przegrywa na ostrych krawędziach.
 *
 * Kluczowa konsekwencja: `weigh()` dla JPG i GIF liczy wagę **obrazu po
 * stracie**, więc waga i widoczne zepsucie zawsze pochodzą z tej samej operacji.
 * Nie da się pokazać małego pliku, który wygląda idealnie.
 */

import { PAPER, at, type Picture } from '../../picture-view';

export type { Picture };
export { PAPER, at };

export type Format = 'bmp' | 'png' | 'gif' | 'jpg';

export const FORMATS: {
  id: Format;
  label: string;
  /** Jednozdaniowy opis mechanizmu — nie marketing, tylko co format robi z pikselami. */
  how: string;
  lossy: boolean;
  transparency: boolean;
}[] = [
  {
    id: 'bmp',
    label: 'BMP',
    how: 'Zapisuje każdy piksel osobno i niczego nie ściska.',
    lossy: false,
    transparency: false,
  },
  {
    id: 'png',
    label: 'PNG',
    how: 'Ściska bez straty: zamiast stu jednakowych pikseli zapisuje „sto razy ten kolor”.',
    lossy: false,
    transparency: true,
  },
  {
    id: 'gif',
    label: 'GIF',
    how: 'Najpierw wyrzuca kolory (zostaje najwyżej 256), potem ściska bez straty.',
    lossy: true,
    transparency: true,
  },
  {
    id: 'jpg',
    label: 'JPG',
    how: 'Najpierw wyrzuca drobne szczegóły, potem ściska. Straconego nie da się odzyskać.',
    lossy: true,
    transparency: false,
  },
];

export const formatInfo = (id: Format) => FORMATS.find((f) => f.id === id) ?? FORMATS[0];

/* ── Scena: kartka urodzinowa ─────────────────────────────────────────────── */

const BG = '#fdf6ea';

/** Litera w `ART` → kolor komórki. Płaskie, wyraziste plamy — to rysunek, nie zdjęcie. */
const PALETTE: Record<string, string> = {
  '.': BG,
  o: '#e4572e',
  p: '#3d7ea6',
  '|': '#a1907a',
  c: '#f0e2cf',
  F: '#f5a623',
  '#': '#e07a9b',
  '=': '#c48b5a',
  _: '#ccd2d9',
  T: '#a8763e',
  '1': '#f5a623',
  '2': '#5aa469',
};

/**
 * Kartka urodzinowa 32 × 24. Celowo **płaska i o małej liczbie kolorów** — to
 * jest obrazek, na którym PNG wygrywa, i lekcja potrzebuje go w tej postaci,
 * żeby porównanie ze „zdjęciem” (niżej) w ogóle miało sens.
 */
const ART = [
  '................................',
  '.......oooo.........pppp........',
  '......oooooo.......pppppp.......',
  '......oooooo.......pppppp.......',
  '......oooooo.......pppppp.......',
  '.......oooo.........pppp........',
  '........||...........||.........',
  '........|.............|.........',
  '.......|...............|........',
  '.......|...............|........',
  '......1.................2.......',
  '.............F..F..F............',
  '.............c..c..c............',
  '.............c..c..c............',
  '.............c..c..c............',
  '........################........',
  '........################........',
  '........================........',
  '........================........',
  '........================........',
  '.......__________________.......',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

export const CARD_W = 32;
export const CARD_H = 24;

function build(): Picture {
  const cells: string[] = [];
  ART.forEach((row) => {
    for (let x = 0; x < CARD_W; x += 1) cells.push(PALETTE[row[x]] ?? BG);
  });
  return { w: CARD_W, h: CARD_H, cells };
}

/** Rysunek: duże płaskie plamy, kilkanaście kolorów. */
export const CARD: Picture = build();

/* ── Narzędzia na kolorach ────────────────────────────────────────────────── */

const hex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
export const toHex = (r: number, g: number, b: number) => `#${hex(r)}${hex(g)}${hex(b)}`;
export const rgb = (color: string): [number, number, number] => [
  parseInt(color.slice(1, 3), 16),
  parseInt(color.slice(3, 5), 16),
  parseInt(color.slice(5, 7), 16),
];

/**
 * Deterministyczny szum — ten sam przy renderze na serwerze i w przeglądarce,
 * więc obrazek nie „mruga” po hydracji. `Math.random()` byłby tu błędem.
 */
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * „Zdjęcie”: ta sama scena, ale każdy piksel lekko inny od sąsiada — dokładnie
 * to, czym aparat różni się od kredki. Żadne dwa sąsiednie piksele nie są
 * identyczne, więc ściskanie ciągów (PNG) nie ma czego ściskać i waga skacze.
 */
export function photoize(pic: Picture, amount = 26): Picture {
  const cells = pic.cells.map((color, i) => {
    const [r, g, b] = rgb(color);
    const n1 = (noise(i + 1) - 0.5) * amount;
    const n2 = (noise(i + 7777) - 0.5) * amount;
    const n3 = (noise(i + 31337) - 0.5) * amount;
    return toHex(r + n1, g + n2, b + n3);
  });
  return { ...pic, cells };
}

export const PHOTO: Picture = photoize(CARD);

/** Ile jest ciągów jednakowych pikseli, czytając obrazek wierszami. */
export function runs(pic: Picture): number {
  let count = 0;
  for (let y = 0; y < pic.h; y += 1) {
    let prev = '';
    for (let x = 0; x < pic.w; x += 1) {
      const color = pic.cells[at(pic.w, x, y)];
      if (color !== prev) {
        count += 1;
        prev = color;
      }
    }
  }
  return count;
}

/** Ile różnych kolorów jest w obrazku. */
export function colorCount(pic: Picture): number {
  return new Set(pic.cells).size;
}

/**
 * Redukcja palety — mechanizm GIF-a i pierwszy z dwóch suwaków w `SqueezeBox`.
 * Kolory zaokrąglamy do siatki, więc bliskie odcienie zlewają się w jeden.
 */
export function quantize(pic: Picture, levels: number): Picture {
  if (levels >= 256) return pic;
  const step = 255 / (levels - 1);
  const cells = pic.cells.map((color) => {
    const [r, g, b] = rgb(color);
    return toHex(
      Math.round(r / step) * step,
      Math.round(g / step) * step,
      Math.round(b / step) * step
    );
  });
  return { ...pic, cells };
}

/**
 * Redukcja do palety — mechanizm GIF-a. Bierzemy `maxColors` najczęstszych
 * kolorów obrazka i każdy piksel zastępujemy najbliższym z nich. To jest
 * prawdziwa różnica między GIF-em a PNG: **GIF ma tablicę kolorów o stałej
 * długości**, więc na rysunku nie traci nic (kolorów jest mniej niż miejsc w
 * tablicy), a na zdjęciu traci sporo i i tak nie ma czego ściskać.
 */
export function paletteReduce(pic: Picture, maxColors: number): Picture {
  const freq = new Map<string, number>();
  pic.cells.forEach((color) => freq.set(color, (freq.get(color) ?? 0) + 1));
  if (freq.size <= maxColors) return pic;
  const palette = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors)
    .map(([color]) => rgb(color));
  const cache = new Map<string, string>();
  const cells = pic.cells.map((color) => {
    const hit = cache.get(color);
    if (hit) return hit;
    const [r, g, b] = rgb(color);
    let best = palette[0];
    let bestD = Infinity;
    palette.forEach((p) => {
      const d = (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    });
    const out = toHex(best[0], best[1], best[2]);
    cache.set(color, out);
    return out;
  });
  return { ...pic, cells };
}

/**
 * Utrata szczegółów — mechanizm JPG-a. Każdy piksel zbliża się do średniej ze
 * swojego bloku `size × size`, więc drobne różnice między sąsiadami znikają, a
 * na ostrych krawędziach robią się kwadraty.
 *
 * `offset` przesuwa siatkę bloków o jeden piksel. To nie jest ozdobnik: bez
 * niego drugie zapisanie tego samego pliku **nic już nie zmienia** (bloki są
 * jednolite, więc średnia równa się kolorowi) i cały blok `SaveAgain`
 * pokazywałby, że stratny zapis psuje obraz raz i przestaje. W prawdziwym
 * JPG-u siatka 8 × 8 też nie trafia dwa razy w to samo miejsce, bo obraz po
 * drodze się zmienia — dlatego kolejne zapisy psują dalej.
 */
export function blur(pic: Picture, size = 2, strength = 0.55, offset = 0): Picture {
  const cells = [...pic.cells];
  for (let by = -offset; by < pic.h; by += size) {
    for (let bx = -offset; bx < pic.w; bx += size) {
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let y = Math.max(0, by); y < Math.min(by + size, pic.h); y += 1) {
        for (let x = Math.max(0, bx); x < Math.min(bx + size, pic.w); x += 1) {
          const [cr, cg, cb] = rgb(pic.cells[at(pic.w, x, y)]);
          r += cr;
          g += cg;
          b += cb;
          n += 1;
        }
      }
      if (n === 0) continue;
      const ar = r / n;
      const ag = g / n;
      const ab = b / n;
      for (let y = Math.max(0, by); y < Math.min(by + size, pic.h); y += 1) {
        for (let x = Math.max(0, bx); x < Math.min(bx + size, pic.w); x += 1) {
          const i = at(pic.w, x, y);
          const [cr, cg, cb] = rgb(pic.cells[i]);
          cells[i] = toHex(
            cr + (ar - cr) * strength,
            cg + (ag - cg) * strength,
            cb + (ab - cb) * strength
          );
        }
      }
    }
  }
  return { ...pic, cells };
}

/** Tablica kolorów GIF-a — prawdziwe ograniczenie tego formatu. */
export const GIF_COLORS = 256;

/**
 * Jedno zapisanie do JPG: najpierw strata szczegółów, potem zaokrąglenie kolorów.
 * `pass` to numer zapisu — przesuwa siatkę bloków, żeby kolejne zapisy psuły dalej.
 */
export function saveAsJpg(pic: Picture, pass = 0): Picture {
  return quantize(blur(pic, 2, 0.5, pass % 2), 40);
}

/** Co naprawdę wyląduje w pliku danego formatu — z tego liczy się i waga, i podgląd. */
export function encode(pic: Picture, format: Format): Picture {
  if (format === 'jpg') return saveAsJpg(pic);
  if (format === 'gif') return paletteReduce(pic, GIF_COLORS);
  return pic;
}

/**
 * Waga pliku w bajtach. Liczona z **obrazu po stracie**, więc mały plik zawsze
 * znaczy, że coś naprawdę odpadło — nie da się tu pokazać pliku, który jest
 * jednocześnie lekki i nietknięty.
 *
 * Stałe to nagłówki plików (BMP naprawdę ma 54 bajty nagłówka, GIF niesie
 * tablicę kolorów), a `runs × 3` to zapis „ile razy ten kolor”.
 */
export function weigh(pic: Picture, format: Format): number {
  const pixels = pic.w * pic.h;
  if (format === 'bmp') return 54 + pixels * 3;
  const coded = encode(pic, format);
  if (format === 'png') return 60 + runs(coded) * 3;
  if (format === 'gif') return 800 + runs(coded) * 2;
  return 300 + runs(coded) * 2;
}

/**
 * Ile pikseli różni się między dwoma obrazami tej samej wielkości. `tolerance`
 * jest tu konieczna: stratny zapis rusza **każdy** piksel o włos, więc licznik
 * bez progu zawsze pokazuje komplet i niczego nie mierzy. Liczymy różnice, które
 * naprawdę widać.
 */
export function diffPixels(a: Picture, b: Picture, tolerance = 12): number {
  return a.cells.reduce((sum, color, i) => {
    const [r1, g1, b1] = rgb(color);
    const [r2, g2, b2] = rgb(b.cells[i]);
    const far =
      Math.abs(r1 - r2) > tolerance ||
      Math.abs(g1 - g2) > tolerance ||
      Math.abs(b1 - b2) > tolerance;
    return far ? sum + 1 : sum;
  }, 0);
}

/** Waga w postaci, którą czyta się bez wysiłku: „1,4 kB”, „2358 B”. */
export function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  return `${(bytes / 1000).toFixed(1).replace('.', ',')} kB`;
}

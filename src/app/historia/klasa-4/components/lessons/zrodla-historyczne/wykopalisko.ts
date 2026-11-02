/**
 * Blok 2 — „Wykopalisko” (symulator, pierwszy konsument silnika `dig`) —
 * dane i sędzia, bez Reacta.
 *
 * Trzy warstwy ziemi, w każdej jedno znalezisko z własną głębokością.
 * Dziecko odsłania warstwy pędzelkiem, odczytuje głębokości z linijki,
 * a potem układa znaleziska od najpłytszego do najgłębszego — kolejność
 * wynika z jego własnych pomiarów, nie z klucza autora (F-I.2-09, F-I.2-10).
 * Wniosek, który odkrywa samo: **głębiej = dawniej** (stratygrafia).
 *
 * Fakty (baza F-I.2-08 + sprawdzenie 2026-09-26 z Wikipedią i NBP):
 * - denar z napisem PRINCES POLONIE: srebro, śr. ok. 19,2 mm (18–20 mm),
 *   emisja Bolesława Chrobrego, datowanie ok. roku 1000 (zjazd gnieźnieński);
 *   pierwszy zachowany w oryginale zapis nazwy Polski; awers: ptak w prawo,
 *   rewers: krzyż. W lekcji: „sprzed ok. 1000 lat”, głębokość umowna 150 cm
 *   (scenka jest wymyślona — tak głęboko monety się zdarzają, ale ta warstwa
 *   to model, nie prawdziwe stanowisko).
 * - moneta 1 grosz: śr. 15,5 mm (specyfikacja NBP) — obok denara w tej samej
 *   skali, żeby było widać różnicę 19 mm kontra 15,5 mm.
 */

export interface Find {
  id: string;
  name: string;
  /** Co dziecko czyta na karcie, gdy znalezisko wyjdzie spod ziemi. */
  card: string;
  /** Głębokość w cm — z niej wynika kolejność na mini-osi. */
  depthCm: number;
}

export interface DigLayer {
  id: string;
  name: string;
  hint: string;
  find: Find;
  /**
   * Gdzie leży znalezisko (ułamki szerokości/wysokości warstwy) — każde
   * w innym miejscu. Znak leży pod zwartą ziemią i wyłania się stopniowo
   * spod ścieranych komórek; karta znaleziska wypełnia się po odsłonięciu
   * ponad połowy warstwy.
   */
  spot: { x: number; y: number };
}

export const DIG_LAYERS: DigLayer[] = [
  {
    id: 'humus',
    name: 'Jasna ziemia',
    hint: 'Tuż pod trawą — to, co zgubiono niedawno.',
    spot: { x: 0.22, y: 0.5 },
    find: {
      id: 'grosz',
      name: 'Moneta 1 grosz',
      card: 'Zwykły 1 grosz — średnica 15,5 mm. Ktoś zgubił go całkiem niedawno, może nawet w tym roku.',
      depthCm: 20,
    },
  },
  {
    id: 'glina',
    name: 'Glina',
    hint: 'Głębiej — tu leżą rzeczy sprzed kilkuset lat.',
    spot: { x: 0.74, y: 0.45 },
    find: {
      id: 'skorupa',
      name: 'Skorupa glinianego garnka',
      card: 'Kawałek glinianego garnka, który ktoś kilkaset lat temu wytoczył na kole garncarskim — na długo przed twoimi pradziadkami.',
      depthCm: 80,
    },
  },
  {
    id: 'piasek',
    name: 'Piasek',
    hint: 'Najgłębiej — tu czekają rzeczy sprzed tysiąca lat.',
    spot: { x: 0.48, y: 0.55 },
    find: {
      id: 'denar',
      name: 'Srebrna moneta z napisem',
      card: 'Srebrna moneta sprzed ok. 1000 lat — średnica 19 mm. W otoku napis, który odczytasz w następnym bloku.',
      depthCm: 150,
    },
  },
];

/** Znaleziska od najpłytszego do najgłębszego — jedyna poprawna kolejność. */
export const FINDS_SHALLOW_FIRST: string[] = [...DIG_LAYERS]
  .sort((a, b) => a.find.depthCm - b.find.depthCm)
  .map((layer) => layer.find.id);

/**
 * Średnica żetonu znaleziska w pikselach — musi zgadzać się z klasą
 * `h-12 w-12` w `FindGlyph` (`wykopalisko-blok.tsx`). Z niej liczy się
 * odcisk znaleziska na siatce komórek.
 */
export const FIND_DIAMETER_PX = 48;

/**
 * Odcisk znaleziska: klucze komórek (`rząd-kolumna`), które przecina koło
 * żetonu. Czysta funkcja — wymiary warstwy w pikselach podaje widok.
 */
export function findFootprint(
  spot: { x: number; y: number },
  widthPx: number,
  heightPx: number,
  cols: number,
  rows: number
): string[] {
  if (widthPx <= 0 || heightPx <= 0) return [];
  const cx = spot.x * widthPx;
  const cy = spot.y * heightPx;
  const r = FIND_DIAMETER_PX / 2;
  const keys: string[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x0 = (col * widthPx) / cols;
      const x1 = ((col + 1) * widthPx) / cols;
      const y0 = (row * heightPx) / rows;
      const y1 = ((row + 1) * heightPx) / rows;
      // Najbliższy środkowi punkt prostokąta — trafienie, gdy w kole.
      const nx = Math.min(Math.max(cx, x0), x1);
      const ny = Math.min(Math.max(cy, y0), y1);
      if ((cx - nx) ** 2 + (cy - ny) ** 2 <= r * r) keys.push(`${row}-${col}`);
    }
  }
  return keys;
}

/**
 * Sędzia odkrycia: warstwa jest odsłonięta, gdy starte są WSZYSTKIE komórki
 * spod znaleziska — nie „połowa warstwy”. Dzięki temu „odkryte” znaczy
 * dokładnie to, co widać: przedmiot wyszedł na wierzch.
 */
export function isFindRevealed(
  spot: { x: number; y: number },
  uncovered: string[],
  widthPx: number,
  heightPx: number,
  cols: number,
  rows: number
): boolean {
  const footprint = findFootprint(spot, widthPx, heightPx, cols, rows);
  return footprint.length > 0 && footprint.every((key) => uncovered.includes(key));
}

export function findById(id: string): Find {
  const layer = DIG_LAYERS.find((l) => l.find.id === id);
  if (!layer) throw new Error(`Nie ma znaleziska „${id}” w wykopalisku`);
  return layer.find;
}

export interface OrderVerdict {
  ok: boolean;
  /** Konkret do poprawki — nazywa znaleziska, nie „spróbuj jeszcze raz”. */
  hint?: string;
}

/**
 * Sędzia mini-osi: pełna sekwencja stuknięć musi iść od najpłytszego
 * znaleziska do najgłębszego. Błąd nazywa parę do zamiany.
 */
export function judgeFindOrder(placed: string[]): OrderVerdict {
  for (let i = 0; i < placed.length; i++) {
    if (placed[i] !== FINDS_SHALLOW_FIRST[i]) {
      const shouldBe = findById(FINDS_SHALLOW_FIRST[i]);
      const put = findById(placed[i]);
      return {
        ok: false,
        hint: `„${put.name}” leżał ${put.depthCm > shouldBe.depthCm ? 'głębiej' : 'płycej'} niż „${shouldBe.name}” — sprawdź głębokości na kartach i zamień je.`,
      };
    }
  }
  return { ok: true };
}

/** „20 cm pod powierzchnią” — podpis na karcie znaleziska. */
export function depthLabel(depthCm: number): string {
  return `${depthCm} cm pod powierzchnią`;
}

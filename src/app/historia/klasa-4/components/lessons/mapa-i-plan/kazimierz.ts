import { KM_PER_PX } from '../../hist-map/geo-polska';
import { pointInPolygon, project, type LonLat, type XY } from '../../hist-map/geo';

export type { LonLat, XY } from '../../hist-map/geo';
export { pointInPolygon, polyPath, project } from '../../hist-map/geo';

/**
 * Dane mapy „Polska za panowania Kazimierza Wielkiego (1333–1370)” — L9.
 *
 * Kontury lądu i rzek: Natural Earth (`geo-polska.ts`, generowane skryptem
 * `scripts/historia-map-geo.py`). **Granice historyczne narysowane ręcznie**,
 * w długości i szerokości geograficznej, i uproszczone do kilkunastu punktów:
 * wzorem *faktów* był stan z baz F-II.4-11…13 (1333 = Wielkopolska i Małopolska
 * z ziemiami sieradzką i łęczycką; do 1370 przyłączone m.in. Ruś Halicka i okolice
 * Płocka) oraz atlasowy przebieg granic (Kujawy i ziemia dobrzyńska wróciły
 * w 1343 po pokoju kaliskim; ziemia płocka 1351–1370; Ruś z ziemią rzeszowską
 * i sanocką od 1340). Pominięte drobne nabytki zachodnie (Wschowa, Santok,
 * Drezdenko, Wałcz) — na tej skali to kilka pikseli.
 *
 * Zamki: tylko takie, które Kazimierz zbudował albo przebudował w kamieniu
 * (Będzin, Łęczyca, Sandomierz, Kruszwica — z niej została Mysia Wieża,
 * Przemyśl, Lwów — Wysoki Zamek). Koronacja: Kraków, 25 IV 1333 (F-II.4-12).
 */

// Punkty wspólne dwóch obszarów — jeden zapis, żeby granice się nie rozjechały.
const N3: LonLat = [17.75, 53.05];
const K1: LonLat = [18.15, 52.75];
const K2: LonLat = [18.25, 52.45];
const K3: LonLat = [18.9, 52.35];
const L1: LonLat = [19.55, 52.25];
const P1: LonLat = [19.6, 52.6];
const P2: LonLat = [19.7, 52.95];
const R1: LonLat = [22.75, 50.6];
const R2: LonLat = [21.95, 50.45];
const R3: LonLat = [21.6, 49.8];
const R4: LonLat = [21.45, 49.42];

export type RegionId = 'krolestwo' | 'kujawy' | 'plock' | 'rus';

export interface Region {
  id: RegionId;
  name: string;
  /** `1333` = ciemna czerwień (państwo na początku rządów), `1370` = przyłączone. */
  layer: 1333 | 1370;
  points: LonLat[];
  /** Gdzie postawić podpis obszaru. */
  label?: LonLat;
}

export const REGIONS: Region[] = [
  {
    id: 'krolestwo',
    name: 'Wielkopolska i Małopolska',
    layer: 1333,
    points: [
      [16.0, 52.95],
      [16.6, 53.15],
      [17.3, 53.25],
      N3,
      K1,
      K2,
      K3,
      L1,
      [19.95, 51.95],
      [20.3, 51.6],
      [20.6, 51.45],
      [21.2, 51.55],
      [21.65, 51.6],
      [22.1, 51.85],
      [22.6, 51.95],
      [23.0, 51.55],
      [23.1, 51.0],
      R1,
      R2,
      R3,
      R4,
      [20.9, 49.35],
      [20.3, 49.4],
      [20.0, 49.25],
      [19.6, 49.45],
      [19.3, 49.7],
      [19.15, 50.0],
      [18.95, 50.3],
      [19.0, 50.6],
      [18.6, 50.95],
      [18.2, 51.2],
      [17.6, 51.4],
      [17.2, 51.55],
      [16.7, 51.65],
      [16.3, 51.85],
      [15.9, 52.2],
      [15.7, 52.5],
    ],
  },
  {
    id: 'kujawy',
    name: 'Kujawy z ziemią dobrzyńską',
    layer: 1370,
    points: [
      N3,
      [18.3, 53.1],
      [18.55, 52.98],
      [18.75, 53.0],
      [19.3, 53.12],
      P2,
      P1,
      L1,
      K3,
      K2,
      K1,
    ],
  },
  {
    id: 'plock',
    name: 'ziemia płocka',
    layer: 1370,
    points: [P1, P2, [20.0, 53.15], [20.45, 53.0], [20.35, 52.6], [20.1, 52.35], L1],
  },
  {
    id: 'rus',
    name: 'Ruś Halicka',
    layer: 1370,
    points: [
      R1,
      [23.6, 50.55],
      [24.4, 50.4],
      [25.2, 50.15],
      [25.9, 49.7],
      [25.9, 49.1],
      [25.2, 48.85],
      [24.4, 48.6],
      [23.4, 48.9],
      [22.6, 49.1],
      [21.9, 49.35],
      R4,
      R3,
      R2,
    ],
    label: [24.6, 49.55],
  },
];

export type CityKind = 'miasto' | 'zamek' | 'koronacja';

export interface City {
  id: string;
  name: string;
  at: LonLat;
  kind: CityKind;
  /** Po której stronie znaku napisać nazwę. */
  side?: 'l' | 'r' | 't' | 'b';
  /** Poza Królestwem — szara kropka. */
  outside?: boolean;
}

export const CITIES: City[] = [
  { id: 'krakow', name: 'Kraków', at: [19.94, 50.06], kind: 'koronacja', side: 'b' },
  { id: 'gniezno', name: 'Gniezno', at: [17.6, 52.53], kind: 'miasto', side: 't' },
  { id: 'poznan', name: 'Poznań', at: [16.93, 52.41], kind: 'miasto', side: 'b' },
  { id: 'kruszwica', name: 'Kruszwica', at: [18.33, 52.68], kind: 'zamek', side: 'b' },
  { id: 'leczyca', name: 'Łęczyca', at: [19.21, 52.06], kind: 'zamek', side: 'l' },
  { id: 'bedzin', name: 'Będzin', at: [19.13, 50.33], kind: 'zamek', side: 'l' },
  { id: 'sandomierz', name: 'Sandomierz', at: [21.75, 50.68], kind: 'zamek', side: 't' },
  { id: 'przemysl', name: 'Przemyśl', at: [22.77, 49.78], kind: 'zamek', side: 'b' },
  { id: 'lwow', name: 'Lwów', at: [24.03, 49.84], kind: 'zamek', side: 't' },
  { id: 'plock', name: 'Płock', at: [19.71, 52.55], kind: 'miasto', side: 'r' },
  {
    id: 'warszawa',
    name: 'Warszawa',
    at: [21.01, 52.23],
    kind: 'miasto',
    side: 'r',
    outside: true,
  },
  { id: 'torun', name: 'Toruń', at: [18.6, 53.01], kind: 'miasto', side: 't', outside: true },
];

/** Podpisy krain poza Królestwem (kursywą, szarym). */
export const NEIGHBOURS: { name: string; at: LonLat }[] = [
  { name: 'Zakon krzyżacki', at: [19.6, 54.0] },
  { name: 'Mazowsze', at: [21.3, 52.75] },
  { name: 'Litwa', at: [25.0, 53.6] },
  { name: 'Śląsk', at: [16.7, 50.9] },
  { name: 'Węgry', at: [21.0, 48.75] },
  { name: 'Morze Bałtyckie', at: [16.3, 54.85] },
];

export const MAP_TITLE = ['Polska', 'za panowania Kazimierza Wielkiego', '(1333–1370)'] as const;

// ─── Blok 2: czytanie mapy stuknięciem — sędziowie ──────────────────────────────

/** Co dziecko stuknęło na mapie. */
export type MapTap =
  | { kind: 'region'; id: RegionId }
  | { kind: 'city'; id: string }
  | { kind: 'title'; index: number }
  | { kind: 'outside' };

export interface TapVerdict {
  ok: boolean;
  /** Zdanie dla dziecka: co stuknęło i co mówi o tym legenda. */
  note: string;
  /** Id obszaru/miasta zaliczonego (do podświetlenia). */
  hit?: string;
}

export type ReadQuestionId = 'gdzie' | 'kiedy' | 'koronacja' | 'przylaczone' | 'zamek-rus';

const regionOf = (id: RegionId) => REGIONS.find((r) => r.id === id)!;
const cityOf = (id: string) => CITIES.find((c) => c.id === id)!;

export function regionAt(at: LonLat): Region | undefined {
  return REGIONS.find((r) => pointInPolygon(at, r.points));
}

export function judgeTap(question: ReadQuestionId, tap: MapTap): TapVerdict {
  switch (question) {
    case 'gdzie':
      if (tap.kind !== 'title')
        return {
          ok: false,
          note: 'Odpowiedź jest w tytule mapy, nad rysunkiem — stuknij słowo w tytule.',
        };
      if (tap.index === 0)
        return {
          ok: true,
          note: '„Polska” — tytuł mówi, jaki obszar pokazuje mapa.',
          hit: 'title-0',
        };
      return {
        ok: false,
        note: `„${MAP_TITLE[tap.index]}” mówi o czasie, a nie o miejscu. Gdzie?`,
      };
    case 'kiedy':
      if (tap.kind !== 'title')
        return { ok: false, note: 'Czas też jest w tytule mapy — stuknij słowo w tytule.' };
      if (tap.index === 0) return { ok: false, note: '„Polska” mówi, gdzie. A kiedy?' };
      return {
        ok: true,
        note:
          tap.index === 2
            ? '1333–1370 — lata panowania króla. Mapa pokazuje te właśnie lata, nie dzisiejszą Polskę.'
            : '„Za panowania Kazimierza Wielkiego” — to też odpowiedź „kiedy”: w latach 1333–1370.',
        hit: `title-${tap.index}`,
      };
    case 'koronacja':
      if (tap.kind === 'city' && cityOf(tap.id).kind === 'koronacja')
        return {
          ok: true,
          note: 'Korona przy Krakowie — według legendy to miejsce koronacji. Kazimierz został koronowany w Krakowie w 1333 roku.',
          hit: tap.id,
        };
      if (tap.kind === 'city' && cityOf(tap.id).kind === 'zamek')
        return {
          ok: false,
          note: `${cityOf(tap.id).name}: wieża w legendzie to zamek króla, nie koronacja. Szukaj korony.`,
        };
      if (tap.kind === 'city')
        return {
          ok: false,
          note: `${cityOf(tap.id).name} ma zwykłą kropkę — to po prostu miasto. Szukaj znaku z legendy.`,
        };
      return {
        ok: false,
        note: 'Koronacji nie zaznacza kolor, tylko znak. Sprawdź w legendzie, jak wygląda.',
      };
    case 'przylaczone': {
      const region =
        tap.kind === 'region'
          ? regionOf(tap.id)
          : tap.kind === 'city'
            ? regionAt(cityOf(tap.id).at)
            : undefined;
      if (!region)
        return {
          ok: false,
          note: 'Tu nie ma czerwieni — według legendy to ziemie poza Królestwem.',
        };
      if (region.layer === 1333)
        return {
          ok: false,
          note: `Ciemna czerwień — ${region.name} należała do Polski już w 1333 roku, na początku rządów.`,
        };
      return {
        ok: true,
        note: `Jasna czerwień: ${region.name} — przyłączona za rządów Kazimierza.`,
        hit: region.id,
      };
    }
    case 'zamek-rus': {
      if (tap.kind !== 'city')
        return {
          ok: false,
          note: 'Zamek to znak, nie kolor. Sprawdź w legendzie, jak wygląda, a potem szukaj na Rusi.',
        };
      const city = cityOf(tap.id);
      if (city.kind !== 'zamek')
        return {
          ok: false,
          note: `${city.name} nie ma znaku zamku. Sprawdź w legendzie, jak wygląda zamek króla.`,
        };
      const region = regionAt(city.at);
      if (region?.id !== 'rus')
        return {
          ok: false,
          note: `${city.name} to zamek króla, ale stoi na ziemi ${region?.layer === 1333 ? 'ciemnej — w dawnym Królestwie' : `jasnej — to ${region?.name}`}. Ruś Halicka leży dalej na południowy wschód.`,
        };
      return {
        ok: true,
        note: `${city.name} — zamek króla na Rusi Halickiej, którą przyłączył do Polski.`,
        hit: city.id,
      };
    }
  }
}

/** Ile jest ziem przyłączonych do odnalezienia. */
export const ANNEXED_IDS = REGIONS.filter((r) => r.layer === 1370).map((r) => r.id);

// ─── Blok 3: linijka podziałki ─────────────────────────────────────────────────

export function distanceKm(a: XY, b: XY): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]) * KM_PER_PX;
}

/** Prawdziwa odległość Kraków–Gniezno na tej mapie (ok. 320 km). */
export const KRAKOW_GNIEZNO_KM = Math.round(
  distanceKm(project(cityOf('krakow').at), project(cityOf('gniezno').at))
);

/** Jak blisko miasta musi leżeć koniec linijki (w jednostkach mapy). */
export const RULER_SNAP = 14;
/** Tolerancja odczytu — kratka linijki to 50 km, więc połowa kratki. */
export const READING_TOLERANCE_KM = 25;

export type RulerVerdict =
  | { ok: true; km: number }
  | { ok: false; reason: 'konce' | 'odczyt-za-malo' | 'odczyt-za-duzo' | 'puste'; km: number };

export function judgeRuler(start: XY, end: XY, reading: number | null): RulerVerdict {
  const krakow = project(cityOf('krakow').at);
  const gniezno = project(cityOf('gniezno').at);
  const ends =
    (Math.hypot(start[0] - krakow[0], start[1] - krakow[1]) <= RULER_SNAP &&
      Math.hypot(end[0] - gniezno[0], end[1] - gniezno[1]) <= RULER_SNAP) ||
    (Math.hypot(start[0] - gniezno[0], start[1] - gniezno[1]) <= RULER_SNAP &&
      Math.hypot(end[0] - krakow[0], end[1] - krakow[1]) <= RULER_SNAP);
  const km = Math.round(distanceKm(start, end));
  if (!ends) return { ok: false, reason: 'konce', km };
  if (reading === null || Number.isNaN(reading)) return { ok: false, reason: 'puste', km };
  if (reading < KRAKOW_GNIEZNO_KM - READING_TOLERANCE_KM)
    return { ok: false, reason: 'odczyt-za-malo', km };
  if (reading > KRAKOW_GNIEZNO_KM + READING_TOLERANCE_KM)
    return { ok: false, reason: 'odczyt-za-duzo', km };
  return { ok: true, km };
}

/**
 * Podziałka „ładna” dla danego przybliżenia: długość odcinka w km z szeregu
 * 1-2-5, taka, żeby na ekranie miała 60–150 jednostek mapy.
 */
export function niceScaleKm(pxPerKm: number): number {
  const steps = [0.5, 1, 2, 5, 10, 20, 50, 100, 200];
  return steps.find((km) => km * pxPerKm >= 60) ?? 200;
}

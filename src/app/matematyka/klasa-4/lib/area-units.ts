/**
 * Jednostki pola — jedna czysta funkcja karmi drabinkę, tabelę przeliczników i
 * treść przewodnika (ta sama zasada co `lib/length.ts` / `lib/mass.ts`).
 *
 * Kluczowa własność, na której stoi cały przewodnik: **każdy szczebel to ×100**,
 * bez ani jednego wyjątku — mm² → cm² → dm² → m² → ar → hektar → km². To dlatego,
 * że bok rośnie ×10 (albo ×100 przy arze i hektarze), a pole rośnie o kwadrat tej
 * krotności. Drabinka jednostek długości ma wyjątek przy m→km; ta nie ma żadnego.
 */

export interface AreaUnit {
  /** Symbol jednostki, np. `cm²`. */
  code: string;
  /** Nazwa w mianowniku, np. „centymetr kwadratowy”. */
  name: string;
  /** Bok kwadratu o polu równym tej jednostce, np. „1 cm”. */
  side: string;
  /** Co realnie ma mniej więcej takie pole. */
  example: string;
}

/** Od najmniejszej do największej. Sąsiednie szczeble dzieli zawsze 100. */
export const AREA_UNITS: readonly AreaUnit[] = [
  {
    code: 'mm²',
    name: 'milimetr kwadratowy',
    side: '1 mm',
    example: 'łebek szpilki',
  },
  {
    code: 'cm²',
    name: 'centymetr kwadratowy',
    side: '1 cm',
    example: 'paznokieć małego palca',
  },
  {
    code: 'dm²',
    name: 'decymetr kwadratowy',
    side: '1 dm, czyli 10 cm',
    example: 'dłoń dorosłego człowieka',
  },
  {
    code: 'm²',
    name: 'metr kwadratowy',
    side: '1 m',
    example: 'blat dużego biurka',
  },
  {
    code: 'a',
    name: 'ar',
    side: '10 m',
    example: 'niewielki ogródek działkowy',
  },
  {
    code: 'ha',
    name: 'hektar',
    side: '100 m',
    example: 'nieco więcej niż boisko piłkarskie',
  },
  {
    code: 'km²',
    name: 'kilometr kwadratowy',
    side: '1 km',
    example: 'duże osiedle albo park miejski',
  },
];

/** Krotność między sąsiednimi szczeblami — do `UnitLadder`. Zawsze 100, bez wyjątków. */
export const AREA_STEP = 100;
export const areaStepRatio = (): number => AREA_STEP;

export function areaUnitIndex(code: string): number {
  return AREA_UNITS.findIndex((unit) => unit.code === code);
}

/** Ile jednostek `toCode` mieści się w jednej jednostce `fromCode` (albo odwrotnie, gdy < 1). */
export function convertArea(value: number, fromCode: string, toCode: string): number {
  const from = areaUnitIndex(fromCode);
  const to = areaUnitIndex(toCode);
  if (from < 0 || to < 0) return Number.NaN;
  return value * AREA_STEP ** (from - to);
}

/**
 * Pary „bok razy k, więc pole razy k²” — to jedyne zdanie, które trzeba z tego
 * przewodnika zapamiętać, więc liczby do niego liczy jedna funkcja, a nie ręcznie
 * wpisana tabelka.
 */
export interface SquareZoomCase {
  id: string;
  /** Jednostka dużego kwadratu. */
  bigUnit: string;
  /** Jednostka małych kwadracików, na które go dzielimy. */
  smallUnit: string;
  /** Ile razy dłuższy jest bok dużego kwadratu. */
  sideRatio: number;
  /** Zdanie ze świata, żeby to nie był sam rysunek. */
  story: string;
}

export const ZOOM_CASES: SquareZoomCase[] = [
  {
    id: 'dm-cm',
    bigUnit: 'dm²',
    smallUnit: 'cm²',
    sideRatio: 10,
    story:
      'Kwadrat o boku 1 dm — mniej więcej dłoń dorosłego. Bok ma 10 cm, więc wzdłuż niego zmieści się 10 centymetrowych kwadracików.',
  },
  {
    id: 'm-dm',
    bigUnit: 'm²',
    smallUnit: 'dm²',
    sideRatio: 10,
    story:
      'Teraz kwadrat o boku 1 m — tyle mniej więcej ma blat dużego biurka. Jego bok to 10 dm.',
  },
];

/** Pole kwadratu o boku `sideRatio` małych jednostek, liczone, nie wpisane. */
export const zoomArea = (item: SquareZoomCase): number => item.sideRatio * item.sideRatio;

export const AREA_UNIT_RULES: string[] = [
  'Jednostka pola to zawsze kwadrat: 1 cm² to pole kwadratu o boku 1 cm, 1 m² — o boku 1 m.',
  'Gdy bok rośnie 10 razy, pole rośnie 100 razy — bo powiększa się i wzdłuż, i w poprzek.',
  'Dlatego sąsiednie jednostki pola dzieli 100, a nie 10: 1 cm² = 100 mm², 1 dm² = 100 cm², 1 m² = 100 dm².',
  'Ar to kwadrat o boku 10 m, czyli 100 m². Hektar to kwadrat o boku 100 m, czyli 100 arów i 10 000 m².',
  '1 km² to kwadrat o boku 1 km, czyli 100 hektarów i milion metrów kwadratowych.',
  'Cała drabinka mm² → cm² → dm² → m² → ar → hektar → km² idzie równym krokiem ×100 — ani razu ×10.',
];

/* ────────────────────────── skala rzeczywista ────────────────────────── */

/**
 * Bok kwadratu o polu 1 jednostki, w milimetrach. To NIE jest osobna tabelka:
 * `AREA_UNITS` jest tak dobrane, że i-ty szczebel ma bok dokładnie `10^i` mm
 * (1 mm, 1 cm, 1 dm, 1 m, 10 m = ar, 100 m = hektar, 1000 m = km). Właśnie
 * dlatego sąsiednie szczeble dzieli 100: bok rośnie ×10, więc pole ×10².
 *
 * Karmi `ZoomOutWorld` — kamera lekcji rysuje świat w milimetrach i skaluje
 * się o dekadę na szczebel, więc każdy kwadrat jednostkowy siedzi w następnym
 * jako dokładnie jedna setna jego pola. Nic nie jest rysowane „mniej więcej”.
 */
export const areaUnitSideMm = (index: number): number => 10 ** index;

/** Ile jednostek `code` mieści się w metrze kwadratowym (albo ile m² ma jedna) — do tabeli przeliczników. */
export const areaUnitInSquareMeters = (code: string): number => convertArea(1, code, 'm²');

/* ─────────────────────────── zamiana jednostek ─────────────────────────── */

/** Jeden szczebel drabinki: albo ×100 w dół (ku mniejszym), albo :100 w górę. */
export interface AreaHop {
  from: AreaUnit;
  to: AreaUnit;
  /** `down` — ku mniejszym jednostkom (mnożymy ×100); `up` — ku większym (dzielimy :100). */
  direction: 'down' | 'up';
  before: number;
  after: number;
}

export interface AreaConversion {
  value: number;
  from: AreaUnit;
  to: AreaUnit;
  hops: AreaHop[];
  result: number;
}

/**
 * Zamiana rozpisana na pojedyncze szczeble drabinki — nie na jedno mnożenie
 * przez 10 000. Dziecko ma zobaczyć, że każdy szczebel to ta sama operacja
 * powtórzona tyle razy, ile szczebli dzieli jednostki; stąd lista skoków, a nie
 * sam wynik. Ta sama funkcja karmi przykłady, klucz odpowiedzi i podpowiedzi
 * w audycie ogłoszeń.
 */
export function buildAreaConversion(
  value: number,
  fromCode: string,
  toCode: string,
): AreaConversion {
  const fromIndex = areaUnitIndex(fromCode);
  const toIndex = areaUnitIndex(toCode);
  const from = AREA_UNITS[fromIndex];
  const to = AREA_UNITS[toIndex];

  const hops: AreaHop[] = [];
  if (fromIndex < 0 || toIndex < 0) return { value, from, to, hops, result: Number.NaN };

  const direction: 'down' | 'up' = toIndex < fromIndex ? 'down' : 'up';
  const step = direction === 'down' ? -1 : 1;

  let current = value;
  for (let i = fromIndex; i !== toIndex; i += step) {
    const before = current;
    const after = direction === 'down' ? before * AREA_STEP : before / AREA_STEP;
    hops.push({ from: AREA_UNITS[i], to: AREA_UNITS[i + step], direction, before, after });
    current = after;
  }

  return { value, from, to, hops, result: current };
}

/** Liczba w polskim zapisie z odstępami między klasami — jeden format w całej lekcji. */
export const formatArea = (value: number): string => value.toLocaleString('pl-PL');

export const AREA_UNIT_PRACTICE_RULES: string[] = [
  'Jednostkę dobieraj tak, żeby liczba była wygodna: paznokieć w cm², pokój w m², las w hektarach.',
  'Krok w dół drabinki (ku mniejszej jednostce) to ×100 — do liczby dopisujesz dwa zera.',
  'Krok w górę drabinki (ku większej jednostce) to :100 — z liczby zdejmujesz dwa zera.',
  'Ile szczebli, tyle razy powtarzasz ten sam krok: z m² na cm² są dwa szczeble, więc ×100 dwa razy, czyli ×10 000.',
  'Ar to 100 m², hektar to 100 arów i 10 000 m². Działki i pola liczy się w arach i hektarach, nie w metrach.',
  'Zanim porównasz dwa pola, zamień je na tę samą jednostkę — inaczej większa liczba wcale nie znaczy większego pola.',
];

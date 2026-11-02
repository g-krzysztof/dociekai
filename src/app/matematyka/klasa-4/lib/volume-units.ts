/**
 * Jednostki objętości — jedna czysta funkcja karmi drabinkę, tabelę, listę
 * naczyń i klucz odpowiedzi (ta sama zasada co `lib/area-units.ts`, którego to
 * jest bezpośredni bliźniak o jeden wymiar wyżej).
 *
 * Dwie własności, na których stoi cały przewodnik:
 * 1. **Każdy szczebel to ×1000**, bez wyjątku — bok rośnie ×10, a objętość
 *    o *sześcian* tej krotności, więc mm³ → cm³ → dm³ → m³ idzie równym krokiem
 *    po tysiąc (drabinka pola szła po sto, długości po dziesięć).
 * 2. **Pojemność i objętość to ta sama wielkość w dwóch zestawach nazw**:
 *    1 ml = 1 cm³ i 1 l = 1 dm³. Dlatego `capacityLabel` i `volumeLabel` liczą
 *    z tej samej liczby mililitrów — nie da się ich rozjechać.
 */

export interface VolumeUnit {
  /** Symbol jednostki, np. `cm³`. */
  code: string;
  /** Nazwa w mianowniku, np. „centymetr sześcienny”. */
  name: string;
  /** Bok sześcianu o objętości równej tej jednostce, np. „1 cm”. */
  side: string;
  /** To samo w jednostkach pojemności, jeśli ma tam swoją nazwę. */
  capacity?: string;
  /** Co realnie ma mniej więcej taką objętość. */
  example: string;
}

/** Od najmniejszej do największej. Sąsiednie szczeble dzieli zawsze 1000. */
export const VOLUME_UNITS: readonly VolumeUnit[] = [
  {
    code: 'mm³',
    name: 'milimetr sześcienny',
    side: '1 mm',
    example: 'ziarnko maku',
  },
  {
    code: 'cm³',
    name: 'centymetr sześcienny',
    side: '1 cm',
    capacity: '1 ml',
    example: 'kostka cukru',
  },
  {
    code: 'dm³',
    name: 'decymetr sześcienny',
    side: '1 dm, czyli 10 cm',
    capacity: '1 l',
    example: 'karton mleka',
  },
  {
    code: 'm³',
    name: 'metr sześcienny',
    side: '1 m',
    capacity: '1000 l',
    example: 'duży zbiornik na deszczówkę',
  },
];

/** Krotność między sąsiednimi szczeblami — do `UnitLadder`. Zawsze 1000, bez wyjątków. */
export const VOLUME_STEP = 1000;
export const volumeStepRatio = (): number => VOLUME_STEP;

/** Szczeble, które realnie pokazuje drabinka — mm³ dorzuciłby skok o miliard. */
export const LADDER_UNITS: readonly VolumeUnit[] = VOLUME_UNITS.slice(1);

export function volumeUnitIndex(code: string): number {
  return VOLUME_UNITS.findIndex((unit) => unit.code === code);
}

/** Ile jednostek `toCode` mieści się w `value` jednostkach `fromCode`. */
export function convertVolume(value: number, fromCode: string, toCode: string): number {
  const from = volumeUnitIndex(fromCode);
  const to = volumeUnitIndex(toCode);
  if (from < 0 || to < 0) return Number.NaN;
  return value * VOLUME_STEP ** (from - to);
}

/**
 * Bok sześcianu o objętości 1 jednostki, w milimetrach. To nie osobna tabelka:
 * `VOLUME_UNITS` jest tak dobrane, że i-ty szczebel ma bok dokładnie `10^i` mm
 * (1 mm, 1 cm, 1 dm, 1 m). Właśnie dlatego sąsiednie szczeble dzieli 1000 —
 * bok rośnie ×10, więc objętość ×10³.
 */
export const volumeUnitSideMm = (index: number): number => 10 ** index;

/* ───────────────────────── bok a objętość ───────────────────────── */

/**
 * Pary „bok razy k, więc objętość razy k³” — jedyne zdanie, które trzeba z tego
 * przewodnika zapamiętać, więc liczby do niego liczy funkcja, a nie ręcznie
 * wpisana tabelka.
 */
export interface CubeZoomCase {
  id: string;
  /** Jednostka dużego sześcianu. */
  bigUnit: string;
  /** Jednostka małych kostek, na które go dzielimy. */
  smallUnit: string;
  /** Ile razy dłuższy jest bok dużego sześcianu. */
  sideRatio: number;
  /** Zdanie ze świata, żeby to nie był sam rysunek. */
  story: string;
}

export const ZOOM_CASES: CubeZoomCase[] = [
  {
    id: 'dm-cm',
    bigUnit: 'dm³',
    smallUnit: 'cm³',
    sideRatio: 10,
    story:
      'Sześcian o boku 1 dm — mniej więcej karton mleka ściśnięty do kostki. Jego bok ma 10 cm, więc wzdłuż niego stanie 10 centymetrowych kostek.',
  },
  {
    id: 'm-dm',
    bigUnit: 'm³',
    smallUnit: 'dm³',
    sideRatio: 10,
    story:
      'Teraz sześcian o boku 1 m — tyle mniej więcej ma zbiornik na deszczówkę. Jego bok to 10 dm, czyli 10 kartonów mleka w rzędzie.',
  },
];

/** Ile małych kostek w jednej warstwie dużego sześcianu. */
export const zoomLayer = (item: CubeZoomCase): number => item.sideRatio * item.sideRatio;
/** Ile małych kostek mieści cały duży sześcian — warstwa razy liczba warstw. */
export const zoomVolume = (item: CubeZoomCase): number => zoomLayer(item) * item.sideRatio;

/* ───────────────────────── pojemność naczyń ───────────────────────── */

/**
 * Naczynie opisane **jedną** liczbą — pojemnością w mililitrach. Obie etykiety
 * (pojemnościowa i objętościowa) liczą się z niej, więc nie da się wpisać
 * naczynia, w którym „1,5 l” stałoby obok innej liczby niż „1,5 dm³”. To jest
 * cała teza aktu o litrze.
 */
export interface Vessel {
  id: string;
  name: string;
  ml: number;
  note: string;
}

export const VESSELS: Vessel[] = [
  {
    id: 'lyzeczka',
    name: 'łyżeczka do herbaty',
    ml: 5,
    note: 'Na opakowaniach syropu piszą „5 ml”, a to dokładnie tyle, co 5 kostek o boku 1 cm.',
  },
  {
    id: 'szklanka',
    name: 'szklanka',
    ml: 250,
    note: 'Cztery takie szklanki to równo litr — stąd „szklanka to ćwierć litra”.',
  },
  {
    id: 'butelka',
    name: 'butelka wody',
    ml: 1500,
    note: 'Popularna duża butelka. Półtora litra to półtora decymetra sześciennego.',
  },
  {
    id: 'wiadro',
    name: 'wiadro',
    ml: 10_000,
    note: 'Zwykłe wiadro to około 10 litrów, czyli 10 kartonów mleka.',
  },
  {
    id: 'wanna',
    name: 'wanna napełniona do połowy',
    ml: 150_000,
    note: 'Sto pięćdziesiąt litrów wody — tyle zużywa jedna dłuższa kąpiel.',
  },
  {
    id: 'zbiornik',
    name: 'zbiornik na deszczówkę',
    ml: 1_000_000,
    note: 'Tysiąc litrów, czyli tysiąc decymetrów sześciennych. Ta objętość ma własną nazwę: 1 m³.',
  },
];

/** Liczba w polskim zapisie — jeden format w całym przewodniku. */
export const formatVolume = (value: number): string => value.toLocaleString('pl-PL');

/**
 * Ta sama objętość nazwana po „pojemnościowemu”. Próg jest jeden — tysiąc
 * mililitrów to litr — więc liczba przed jednostką jest identyczna jak w
 * `volumeLabel`. To nie zbieg okoliczności, tylko sedno tego przewodnika.
 */
export function capacityLabel(ml: number): string {
  return ml < 1000 ? `${formatVolume(ml)} ml` : `${formatVolume(ml / 1000)} l`;
}

/** Ta sama objętość nazwana po „sześciennemu”. Ten sam próg, ta sama liczba. */
export function volumeLabel(ml: number): string {
  return ml < 1000 ? `${formatVolume(ml)} cm³` : `${formatVolume(ml / 1000)} dm³`;
}

/* ───────────────────────── zamiana jednostek ───────────────────────── */

/** Jeden szczebel drabinki: albo ×1000 w dół (ku mniejszym), albo :1000 w górę. */
export interface VolumeHop {
  from: VolumeUnit;
  to: VolumeUnit;
  /** `down` — ku mniejszym jednostkom (mnożymy); `up` — ku większym (dzielimy). */
  direction: 'down' | 'up';
  before: number;
  after: number;
}

export interface VolumeConversion {
  value: number;
  from: VolumeUnit;
  to: VolumeUnit;
  hops: VolumeHop[];
  result: number;
}

/**
 * Zamiana rozpisana na pojedyncze szczeble drabinki, a nie na jedno mnożenie
 * przez milion — dziecko ma zobaczyć ten sam krok powtórzony tyle razy, ile
 * szczebli dzieli jednostki (ten sam wzorzec co `buildAreaConversion`).
 */
export function buildVolumeConversion(
  value: number,
  fromCode: string,
  toCode: string,
): VolumeConversion {
  const fromIndex = volumeUnitIndex(fromCode);
  const toIndex = volumeUnitIndex(toCode);
  const from = VOLUME_UNITS[fromIndex];
  const to = VOLUME_UNITS[toIndex];

  const hops: VolumeHop[] = [];
  if (fromIndex < 0 || toIndex < 0) return { value, from, to, hops, result: Number.NaN };

  const direction: 'down' | 'up' = toIndex < fromIndex ? 'down' : 'up';
  const step = direction === 'down' ? -1 : 1;

  let current = value;
  for (let i = fromIndex; i !== toIndex; i += step) {
    const before = current;
    const after = direction === 'down' ? before * VOLUME_STEP : before / VOLUME_STEP;
    hops.push({ from: VOLUME_UNITS[i], to: VOLUME_UNITS[i + step], direction, before, after });
    current = after;
  }

  return { value, from, to, hops, result: current };
}

export const VOLUME_UNIT_RULES: string[] = [
  'Jednostka objętości to zawsze sześcian: 1 cm³ to objętość sześcianu o boku 1 cm, 1 m³ — o boku 1 m.',
  'Trójka w górze mówi, że bok został wzięty trzy razy: wzdłuż, w poprzek i na wysokość.',
  'Gdy bok rośnie 10 razy, objętość rośnie 1000 razy — bo powiększa się we wszystkich trzech kierunkach naraz.',
  'Dlatego sąsiednie jednostki objętości dzieli 1000: 1 cm³ = 1000 mm³, 1 dm³ = 1000 cm³, 1 m³ = 1000 dm³.',
  'Pojemność to ta sama wielkość, tylko inaczej nazwana: 1 ml = 1 cm³, a 1 l = 1 dm³.',
  'Stąd 1 m³ = 1000 dm³ = 1000 litrów, a 1 litr = 1000 ml = 1000 cm³.',
];

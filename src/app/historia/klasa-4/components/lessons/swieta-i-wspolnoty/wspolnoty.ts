/**
 * L11 blok 1 — kręgi wspólnot. Czyste funkcje, bez Reacta.
 *
 * Plansza to trzy obszary, które na siebie zachodzą:
 *  - prostokąt **obywatele Unii Europejskiej** (każdy obywatel państwa Unii);
 *  - koło **wspólnota państwowa — obywatele Polski** (z urodzenia albo z wyboru,
 *    F-II.1-04), w całości wewnątrz Unii, bo Polska należy do Unii;
 *  - koło **naród polski** (język, historia, kultura, tradycja — F-II.1-05),
 *    które zachodzi na koło Polski i wystaje poza Unię (Polonia, F-II.1-10).
 *
 * Miejsce postaci nie jest kluczem autora: wynika z trzech zdań, które każda
 * postać mówi o sobie (paszport → obywatelstwo, państwo w Unii → Unia, język
 * i to, kim się czuje → naród). Sędzia odrzuca z cytatem zdania, które
 * przeczy położeniu.
 */

export const VIEW = { w: 380, h: 300 } as const;

/** Prostokąt Unii. */
export const UE = { x: 8, y: 26, w: 256, h: 266 } as const;
/** Koło Polski — całe w Unii. */
export const PL = { cx: 128, cy: 168, r: 86 } as const;
/** Koło narodu — zachodzi na Polskę i wystaje poza Unię. */
export const NAROD = { cx: 236, cy: 168, r: 86 } as const;

export type Zone = 'pl-narod' | 'pl' | 'ue-narod' | 'narod' | 'ue' | 'poza';

export interface Membership {
  ue: boolean;
  pl: boolean;
  narod: boolean;
}

function inCircle(c: { cx: number; cy: number; r: number }, x: number, y: number) {
  return (x - c.cx) ** 2 + (y - c.cy) ** 2 <= c.r ** 2;
}

function inUe(x: number, y: number) {
  return x >= UE.x && x <= UE.x + UE.w && y >= UE.y && y <= UE.y + UE.h;
}

/** Przynależność punktu planszy. Koło Polski leży w Unii, więc `pl` ⇒ `ue`. */
export function membershipAt(x: number, y: number): Membership {
  const pl = inCircle(PL, x, y);
  return { pl, ue: pl || inUe(x, y), narod: inCircle(NAROD, x, y) };
}

export function zoneOf(m: Membership): Zone {
  if (m.pl) return m.narod ? 'pl-narod' : 'pl';
  if (m.narod) return m.ue ? 'ue-narod' : 'narod';
  return m.ue ? 'ue' : 'poza';
}

export const zoneAt = (x: number, y: number) => zoneOf(membershipAt(x, y));

/** Opis miejsca słowami — do potwierdzenia, gdzie postać stoi. */
export const ZONE_LABEL: Record<Zone, string> = {
  'pl-narod': 'obywatel Polski i naród polski',
  pl: 'obywatel Polski, ale nie w kręgu narodu',
  'ue-narod': 'naród polski, obywatel innego państwa Unii',
  narod: 'naród polski, poza Unią',
  ue: 'obywatel Unii, poza oboma kołami',
  poza: 'poza wszystkimi kręgami',
};

export interface Person {
  id: string;
  name: string;
  /** Skąd — krótko, do żetonu. */
  where: string;
  /** Inicjał na żetonie. */
  initial: string;
  /** Trzy zdania postaci — z nich wynika miejsce. */
  says: string[];
  truth: Membership;
  /** Cytat rozstrzygający każdą z trzech przynależności (do odrzutu). */
  quote: Record<keyof Membership, string>;
}

export const PEOPLE: Person[] = [
  {
    id: 'zosia',
    name: 'Zosia',
    where: 'Lublin',
    initial: 'Z',
    says: [
      'Urodziłam się w Lublinie i mam polski dowód osobisty.',
      'W domu mówimy po polsku, a babcia uczy mnie starych kolęd.',
      'Czuję się Polką.',
    ],
    truth: { ue: true, pl: true, narod: true },
    quote: {
      pl: 'Zosia mówi: „mam polski dowód osobisty”.',
      ue: 'Zosia ma polski dowód, a Polska należy do Unii Europejskiej.',
      narod: 'Zosia mówi: „W domu mówimy po polsku… Czuję się Polką”.',
    },
  },
  {
    id: 'barbara',
    name: 'Pani Barbara',
    where: 'Chicago',
    initial: 'B',
    says: [
      'Urodziłam się w Chicago i mam tylko amerykański paszport.',
      'W domu mówimy po polsku, w soboty uczę w polskiej szkole, a 11 listopada idę na polską akademię.',
      'Czuję się Polką.',
    ],
    truth: { ue: false, pl: false, narod: true },
    quote: {
      pl: 'Pani Barbara mówi: „mam tylko amerykański paszport”. Koło Polski to obywatele Polski.',
      ue: 'Pani Barbara ma tylko paszport Stanów Zjednoczonych — a USA nie należą do Unii Europejskiej.',
      narod: 'Pani Barbara mówi: „W domu mówimy po polsku… Czuję się Polką”.',
    },
  },
  {
    id: 'minh',
    name: 'Pan Minh',
    where: 'Warszawa',
    initial: 'M',
    says: [
      'Przyjechałem z Wietnamu dwadzieścia lat temu. Od dziesięciu lat jestem obywatelem Polski — mam polski paszport.',
      'W domu mówimy po wietnamsku i obchodzimy wietnamski Nowy Rok.',
      'Czuję się Wietnamczykiem, ale Polska to mój dom.',
    ],
    truth: { ue: true, pl: true, narod: false },
    quote: {
      pl: 'Pan Minh mówi: „jestem obywatelem Polski — mam polski paszport”. Obywatelem można zostać z wyboru.',
      ue: 'Pan Minh jest obywatelem Polski, a Polska należy do Unii.',
      narod: 'Pan Minh mówi: „Czuję się Wietnamczykiem”. Do narodu należy się przez język, kulturę i to, kim się czujesz — a to co innego niż paszport.',
    },
  },
  {
    id: 'kasia',
    name: 'Kasia',
    where: 'Wilno',
    initial: 'K',
    says: [
      'Mieszkam w Wilnie, na Litwie. Mam litewski paszport.',
      'Chodzę do polskiej szkoły, w domu mówimy po polsku.',
      'Czuję się Polką.',
    ],
    truth: { ue: true, pl: false, narod: true },
    quote: {
      pl: 'Kasia mówi: „Mam litewski paszport”. Obywatelką Polski nie jest.',
      ue: 'Kasia ma paszport litewski — a Litwa należy do Unii Europejskiej, więc Kasia też jest obywatelką Unii.',
      narod: 'Kasia mówi: „w domu mówimy po polsku… Czuję się Polką”.',
    },
  },
  {
    id: 'lukas',
    name: 'Pan Lukas',
    where: 'Kraków',
    initial: 'L',
    says: [
      'Jestem Niemcem, mam niemiecki paszport.',
      'Od roku pracuję w Krakowie i uczę się polskiego.',
      'W domu mówimy po niemiecku.',
    ],
    truth: { ue: true, pl: false, narod: false },
    quote: {
      pl: 'Pan Lukas mówi: „mam niemiecki paszport”. To, że mieszka w Polsce, nie czyni go jej obywatelem.',
      ue: 'Pan Lukas ma paszport niemiecki — Niemcy należą do Unii.',
      narod: 'Pan Lukas mówi: „Jestem Niemcem… W domu mówimy po niemiecku”.',
    },
  },
];

export const TY_ID = 'ty';

export interface Placement {
  x: number;
  y: number;
}

export interface WspolnotyError {
  personId: string;
  message: string;
}

/**
 * Sędzia: dla każdej postaci porównuje przynależność punktu z prawdą
 * i zwraca jeden odrzut na postać — z cytatem dla pierwszej niezgodności
 * (kolejność: państwo, Unia, naród). Postać „Ty” nie jest sędziowana.
 */
export function judgeWspolnoty(
  placed: Record<string, Placement | undefined>,
  people: Person[] = PEOPLE
): { ok: boolean; missing: string[]; errors: WspolnotyError[] } {
  const missing = people.filter((p) => !placed[p.id]).map((p) => p.id);
  const errors: WspolnotyError[] = [];
  for (const p of people) {
    const at = placed[p.id];
    if (!at) continue;
    const m = membershipAt(at.x, at.y);
    const key = (['pl', 'ue', 'narod'] as const).find((k) => m[k] !== p.truth[k]);
    if (key) errors.push({ personId: p.id, message: p.quote[key] });
  }
  return { ok: missing.length === 0 && errors.length === 0, missing, errors };
}

/** Punkt „wzorcowy” w każdej strefie — do testów i do podpowiedzi. */
export const ZONE_SAMPLE: Record<Zone, Placement> = {
  'pl-narod': { x: 182, y: 168 },
  pl: { x: 90, y: 168 },
  'ue-narod': { x: 245, y: 95 },
  narod: { x: 296, y: 168 },
  ue: { x: 30, y: 50 },
  poza: { x: 350, y: 20 },
};

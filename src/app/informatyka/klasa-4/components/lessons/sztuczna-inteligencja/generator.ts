/**
 * Mały generator obrazków z bloku 4 — `[3.6]`: *tworzy treści z wykorzystaniem
 * prostych narzędzi sztucznej inteligencji* oraz formułowanie zapytania
 * i sprawdzanie wyniku.
 *
 * **To jest makieta, i lekcja mówi to wprost.** Prawdziwy generator rozumie
 * prawie każde słowo; ten zna sześć rzeczy (zwierzę, ile, co robi, gdzie, pora
 * roku, pora dnia) i słowa, które je nazywają. Ale robi dokładnie to, co robią
 * prawdziwe, w tym jednym miejscu, na którym stoi blok: **czego nie napiszesz,
 * to dopowie sam** — biorąc to, co w jego przykładach najczęstsze, i losując
 * resztę. Dlatego ta sama prośba daje za każdym razem inny obrazek, a jedynym
 * sposobem, żeby dostać to, o co chodzi, jest to powiedzieć.
 *
 * Słownik jest jawny w interfejsie: słowa, których generator nie zna, są
 * dziecku wypisane („tych słów nie znam i je pomijam”), a nie połykane po
 * cichu. Formy odmiany są podane pełnymi listami, nie rdzeniami — rdzeń „lat”
 * złapałby „latarnię”, a rdzeń „noc” — „nocleg”.
 */

export type Animal = 'lis' | 'kot' | 'sowa' | 'jez';
export type Season = 'wiosna' | 'lato' | 'jesien' | 'zima';
export type Daytime = 'dzien' | 'noc';
export type Action = 'spi' | 'bawi';
export type Where = 'drzewo' | 'staw' | 'laka';
export type Count = 1 | 2 | 3;

export interface Request {
  animal?: Animal;
  count?: Count;
  action?: Action;
  place?: Where;
  season?: Season;
  daytime?: Daytime;
}

export type SlotId = keyof Request;

export interface Picture extends Required<Request> {
  /** Ziarno drobiazgów, których prośba nie dotyczy: miejsce drzewa, gwiazdy, rozstaw zwierząt. */
  seed: number;
  /** Numer zwierzęcia, które nie śpi, choć powinno — błąd generatora do znalezienia w bloku 4. */
  awake?: number;
}

export const SLOTS: { id: SlotId; name: string }[] = [
  { id: 'animal', name: 'zwierzę' },
  { id: 'count', name: 'ile' },
  { id: 'action', name: 'co robi' },
  { id: 'place', name: 'gdzie' },
  { id: 'season', name: 'pora roku' },
  { id: 'daytime', name: 'pora dnia' },
];

export const VALUE_NAME: { [S in SlotId]: Record<string, string> } = {
  animal: { lis: 'lis', kot: 'kot', sowa: 'sowa', jez: 'jeż' },
  count: { 1: 'jedno', 2: 'dwa', 3: 'trzy' },
  action: { spi: 'śpi', bawi: 'bawi się' },
  place: { drzewo: 'pod drzewem', staw: 'nad stawem', laka: 'na łące' },
  season: { wiosna: 'wiosna', lato: 'lato', jesien: 'jesień', zima: 'zima' },
  daytime: { dzien: 'dzień', noc: 'noc' },
};

export function slotValue(slot: SlotId, request: Request): string | null {
  const value = request[slot];
  return value === undefined ? null : VALUE_NAME[slot][String(value)];
}

/** Zamówienie siostry — to, co ma być na obrazku. */
export const BRIEF: Required<Request> = {
  animal: 'lis',
  count: 2,
  action: 'spi',
  place: 'drzewo',
  season: 'zima',
  daytime: 'noc',
};

/**
 * Porównanie słów bez ogonków: dziesięciolatek pisze „spią”, „zima”, „sniegu”
 * — i to nie jest inne słowo, tylko to samo napisane szybciej. Bez tego jeden
 * brakujący ogonek zatrzymywał blok w miejscu, a werdykt mówił „nie znam”
 * o słowie, które zna. To nie jest rdzeń: forma dalej musi być cała.
 */
const fold = (word: string) =>
  word
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l');

const words = (...list: string[]) => list;

interface Entry {
  slot: SlotId;
  value: Request[SlotId];
  /** Zwierzę w liczbie mnogiej („lisy”) — wiadomo, że więcej niż jedno, ale nie ile. */
  plural?: boolean;
}

const VOCABULARY: (Entry & { forms: string[] })[] = [
  { slot: 'animal', value: 'lis', forms: words('lis', 'lisa', 'lisek', 'liska', 'liskiem', 'lisem', 'lisie', 'lisowi', 'lisica', 'lisiczka', 'lisku') },
  { slot: 'animal', value: 'lis', plural: true, forms: words('lisy', 'lisów', 'liski', 'lisków', 'lisami', 'liskami', 'lisom', 'lisice', 'lisiczki') },
  { slot: 'animal', value: 'kot', forms: words('kot', 'kota', 'kotek', 'kotka', 'kotem', 'kotkiem', 'kotu', 'kocie', 'kociak', 'kociaka', 'kiciuś', 'kotku') },
  { slot: 'animal', value: 'kot', plural: true, forms: words('koty', 'kotów', 'kotki', 'kotków', 'kotami', 'kotom', 'kociaki', 'kociaków') },
  { slot: 'animal', value: 'sowa', forms: words('sowa', 'sowę', 'sową', 'sowie', 'sówka', 'sówkę', 'puszczyk') },
  { slot: 'animal', value: 'sowa', plural: true, forms: words('sowy', 'sów', 'sowami', 'sowom', 'sówki', 'sówek', 'puszczyki') },
  { slot: 'animal', value: 'jez', forms: words('jeż', 'jeża', 'jeżem', 'jeżu', 'jeżowi', 'jeżyk', 'jeżyka', 'jeżykiem') },
  { slot: 'animal', value: 'jez', plural: true, forms: words('jeże', 'jeży', 'jeżów', 'jeżyki', 'jeżyków', 'jeżami', 'jeżom') },

  /* Liczby główne, zbiorowe („oba”, „dwójka”) i porządkowe: „jeden lis i drugi lis” to dwa lisy. */
  { slot: 'count', value: 1, forms: words('jeden', 'jedna', 'jedno', 'jednego', 'jedną', 'jednym', 'jednej', 'sam', 'sama', 'samo', 'samotny', 'samotna', 'samotne', '1') },
  { slot: 'count', value: 2, forms: words('dwa', 'dwie', 'dwóch', 'dwoje', 'dwaj', 'dwu', 'dwoma', 'dwiema', 'dwojga', 'para', 'parę', 'parka', 'parkę', 'oba', 'obaj', 'obie', 'oboje', 'obu', 'obydwa', 'obydwaj', 'obydwie', 'obydwoje', 'obydwu', 'dwójka', 'dwójkę', 'dwójką', 'dwójki', 'drugi', 'druga', 'drugie', 'drugiego', 'drugiej', 'drugim', 'drugą', 'drugiemu', '2') },
  { slot: 'count', value: 3, forms: words('trzy', 'trzech', 'troje', 'trzej', 'trojga', 'trzema', 'trójka', 'trójkę', 'trójką', 'trójki', 'trzeci', 'trzecia', 'trzecie', 'trzeciego', 'trzeciej', 'trzecim', 'trzecią', '3') },

  { slot: 'action', value: 'spi', forms: words('śpi', 'śpią', 'spać', 'śpiący', 'śpiąca', 'śpiące', 'śpiących', 'śpiącego', 'śpiącym', 'śpiącymi', 'drzemie', 'drzemią', 'drzemka', 'drzemkę', 'drzemce', 'zasypia', 'zasypiają', 'zasnął', 'zasnęła', 'zasnęły', 'zasnęli', 'uśpione', 'uśpiony', 'sen', 'śnie', 'snem') },
  { slot: 'action', value: 'bawi', forms: words('bawi', 'bawią', 'bawić', 'bawiące', 'bawiący', 'bawiących', 'biega', 'biegają', 'biegnie', 'biegną', 'skacze', 'skaczą', 'goni', 'gonią', 'harcuje', 'harcują', 'tańczy', 'tańczą') },

  { slot: 'place', value: 'drzewo', forms: words('drzewo', 'drzewem', 'drzewa', 'drzewie', 'drzewkiem', 'drzewko', 'drzewku', 'drzewami', 'drzewach', 'jabłonią', 'jabłoń', 'dębem', 'dąb', 'choinką', 'choinka', 'choinki', 'choince', 'świerkiem', 'świerk', 'sosną', 'sosna', 'brzozą', 'brzoza') },
  { slot: 'place', value: 'staw', forms: words('staw', 'stawem', 'stawu', 'stawie', 'jezioro', 'jeziorem', 'jeziora', 'jeziorze', 'rzeka', 'rzeką', 'rzeki', 'rzece', 'woda', 'wodą', 'wody', 'wodzie', 'sadzawka', 'sadzawką', 'strumyk', 'strumykiem') },
  { slot: 'place', value: 'laka', forms: words('łąka', 'łąką', 'łąki', 'łące', 'łąkę', 'łąkach', 'trawa', 'trawą', 'trawie', 'trawy', 'polana', 'polaną', 'polanie', 'polu', 'pole') },

  { slot: 'season', value: 'wiosna', forms: words('wiosna', 'wiosną', 'wiosny', 'wiośnie', 'wiosenny', 'wiosenna', 'wiosenne', 'wiosenną', 'wiosennym', 'wiosennej') },
  { slot: 'season', value: 'lato', forms: words('lato', 'latem', 'lecie', 'letni', 'letnia', 'letnie', 'letnią', 'letnim', 'letniej', 'wakacje', 'wakacjach') },
  { slot: 'season', value: 'jesien', forms: words('jesień', 'jesienią', 'jesieni', 'jesienny', 'jesienna', 'jesienne', 'jesienną', 'jesiennym', 'jesiennej') },
  { slot: 'season', value: 'zima', forms: words('zima', 'zimą', 'zimy', 'zimie', 'zimę', 'zimowy', 'zimowa', 'zimowe', 'zimową', 'zimowym', 'zimowej', 'śnieg', 'śniegu', 'śniegiem', 'śnieżny', 'śnieżna', 'śnieżne', 'zaśnieżony', 'zaśnieżona', 'zaśnieżone', 'zimno', 'mróz', 'mrozie', 'mroźna', 'mroźny', 'mroźną', 'mroźnej') },

  { slot: 'daytime', value: 'noc', forms: words('noc', 'nocą', 'nocy', 'nocny', 'nocna', 'nocne', 'nocną', 'nocnym', 'nocnej', 'nocka', 'nockę', 'północ', 'północy', 'północą', 'wieczór', 'wieczorem', 'wieczorny', 'wieczorna', 'księżyc', 'księżycem', 'księżyca', 'księżycu', 'gwiazdy', 'gwiazdami', 'gwiazd', 'gwiazdach', 'ciemno', 'ciemności') },
  { slot: 'daytime', value: 'dzien', forms: words('dzień', 'dnia', 'dniem', 'rano', 'ranek', 'rankiem', 'południe', 'południu', 'popołudnie', 'popołudniu', 'słońce', 'słońcem', 'słońca', 'słońcu', 'słoneczny', 'słoneczna', 'słoneczne', 'słoneczną', 'jasno') },
];

/** Formy bez ogonków → wpis. Zbiór jest jawny wyżej; tu tylko przyspieszamy szukanie. */
const LOOKUP = new Map<string, Entry>();
for (const { forms, ...entry } of VOCABULARY) for (const form of forms) LOOKUP.set(fold(form), entry);

/**
 * Słowa, które nic nie zmieniają na obrazku, ale nie są też „nieznane” —
 * przyimki, spójniki, grzecznościowe „proszę” i słowa o samym obrazku.
 * Bez tej listy generator zgłaszałby dziecku „nie znam słowa »pod«”, co
 * byłoby nieprawdą o tym, jak działa: „pod drzewem” rozumie po słowie „drzewem”.
 */
const NEUTRAL = new Set(
  words(
    'pod', 'nad', 'na', 'w', 'we', 'przy', 'obok', 'koło', 'za', 'przed', 'i', 'oraz', 'a', 'z', 'ze', 'się', 'o', 'u', 'do', 'po', 'od',
    'jest', 'są', 'ma', 'mają', 'to', 'ten', 'ta', 'te', 'który', 'która', 'które', 'razem', 'sobie', 'siebie', 'bardzo', 'też', 'tylko', 'każdy', 'każda',
    'pierwszy', 'pierwsza', 'pierwsze', 'pierwszego',
    'obrazek', 'obraz', 'obrazka', 'rysunek', 'ilustracja', 'ilustrację', 'narysuj', 'namaluj', 'pokaż', 'zrób', 'stwórz', 'wygeneruj', 'daj',
    'proszę', 'mi', 'mnie', 'dla', 'mojej', 'moja', 'mój', 'siostry', 'siostra', 'bajki', 'bajka', 'bajkę', 'dobranoc',
    'mały', 'mała', 'małe', 'małych', 'duży', 'duża', 'duże', 'dużym', 'rudy', 'ruda', 'rude', 'rudych', 'rudym', 'ładny', 'ładne', 'piękny', 'piękne',
    'puszysty', 'puszyste', 'słodki', 'słodkie', 'wesoły', 'wesołe', 'spokojnie', 'spokojny', 'spokojne', 'tam', 'tu', 'tutaj'
  ).map(fold)
);

/**
 * „Nie latem”, „bez słońca”, „i nie bawią się”. Mały generator słowa po „nie”
 * **pomija** i mówi o tym dziecku — zamiast brać „latem” za zamówienie lata,
 * czego dziecko nie miałoby jak zrozumieć. Wskazówka dla niego jest ta sama,
 * której trzyma się każdy, kto pisze prośby do prawdziwych generatorów:
 * napisz, co ma być, a nie czego ma nie być.
 */
const NEGATORS = new Set(['nie', 'bez']);
/** Ile słów po „nie” szukamy tego, czemu zaprzeczono („nie ma w ogóle słońca”). */
const NEGATION_REACH = 3;

/** Liczba przy tych słowach mówi o nich, nie o zwierzętach: „pod jednym drzewem”, „jednej zimowej nocy”. */
const NOT_ABOUT_ANIMALS = new Set<SlotId>(['place', 'season', 'daytime']);

export interface Parsed {
  request: Request;
  /** Słowa, których generator nie zna — pokazywane dziecku, nie połykane. */
  unknown: string[];
  /** „Lisy śpią” bez liczby — wiadomo tylko, że więcej niż jeden. Generator zgaduje wtedy 2 albo 3. */
  many: boolean;
  /** Fragmenty z „nie” i „bez”, które generator pominął — pokazywane dziecku. */
  negated: string[];
}

/**
 * Jak mały generator czyta prośbę:
 *
 * - **Zwierzę, co robi, gdzie, pora roku, pora dnia** — wygrywa ostatnie słowo.
 * - **Ile** — wygrywa **największa** liczba mówiąca o zwierzętach, nie ostatnia.
 *   Dzieci wyliczają: „jeden lis śpi…, drugi lis też”, „dwa lisy, jeden obok
 *   drugiego” — przy „ostatnie wygrywa” słowo „jeden” kasowało „dwa” i blok
 *   stawał, choć w prośbie było wszystko. Liczą się też powtórzenia połączone
 *   samymi spójnikami („lis i lis”, „lisek obok liska”), ale nie każde kolejne
 *   wspomnienie („lis śpi, a nad lisem księżyc” to jeden lis).
 * - Liczba przed miejscem albo porą („pod jednym drzewem”) do zwierząt nie należy.
 * - Słowo po „nie” / „bez” jest pomijane i wypisywane w `negated`.
 */
export function parsePrompt(text: string): Parsed {
  const request: Request = {};
  const unknown: string[] = [];
  const negated: string[] = [];
  const counts: Count[] = [];
  let many = false;

  const raw = text
    .toLowerCase()
    .normalize('NFC')
    .replace(/[.,;:!?…„”“"'()«»/\-–—]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const tokens = raw.map(fold);
  const entries = tokens.map((token) => LOOKUP.get(token));

  let negation: { from: number; left: number } | null = null;
  /** Ile razy pod rząd, przedzielone tylko słowami obojętnymi, padło to samo zwierzę w liczbie pojedynczej. */
  let chain = { animal: undefined as Request['animal'], length: 0 };

  tokens.forEach((token, index) => {
    const entry = entries[index];
    const neutral = NEUTRAL.has(token);

    if (NEGATORS.has(token)) {
      negation = { from: index, left: NEGATION_REACH };
      chain = { animal: undefined, length: 0 };
      return;
    }
    if (negation && entry) {
      negated.push(raw.slice(negation.from, index + 1).join(' '));
      negation = null;
      return;
    }
    if (negation) {
      negation.left -= 1;
      if (negation.left === 0) negation = null;
    }

    if (!entry) {
      if (!neutral) {
        chain = { animal: undefined, length: 0 };
        if (!unknown.includes(raw[index])) unknown.push(raw[index]);
      }
      return;
    }

    if (entry.slot === 'animal' && !entry.plural) {
      chain = chain.animal === entry.value ? { ...chain, length: chain.length + 1 } : { animal: entry.value as Request['animal'], length: 1 };
      if (chain.length >= 2) counts.push(Math.min(3, chain.length) as Count);
    } else {
      chain = { animal: undefined, length: 0 };
    }

    if (entry.slot === 'count') {
      const next = entries.slice(index + 1, index + 3).find(Boolean);
      if (!next || !NOT_ABOUT_ANIMALS.has(next.slot)) counts.push(entry.value as Count);
      return;
    }
    if (entry.plural) many = true;
    (request as Record<SlotId, unknown>)[entry.slot] = entry.value;
  });

  if (counts.length > 0) request.count = Math.max(...counts) as Count;
  return { request, unknown, many: many && request.count === undefined, negated };
}

/**
 * Co generator bierze, gdy czegoś nie napiszesz — **to, co w jego przykładach
 * najczęstsze**. Obrazków z kotem w dzień jest na świecie dużo więcej niż
 * z sową w zimową noc, więc tak też losuje. Wagi są jawne, bo blok o tym mówi.
 */
const TYPICAL: { [S in SlotId]: [NonNullable<Request[S]>, number][] } = {
  animal: [
    ['kot', 40],
    ['lis', 25],
    ['jez', 20],
    ['sowa', 15],
  ],
  count: [
    [1, 60],
    [2, 25],
    [3, 15],
  ],
  action: [
    ['bawi', 70],
    ['spi', 30],
  ],
  place: [
    ['laka', 50],
    ['drzewo', 30],
    ['staw', 20],
  ],
  season: [
    ['lato', 45],
    ['wiosna', 25],
    ['jesien', 20],
    ['zima', 10],
  ],
  daytime: [
    ['dzien', 85],
    ['noc', 15],
  ],
};

/** „Lisy” bez liczby: zgaduje, ile, ale jednego lisa z „lisów” nie narysuje. */
const TYPICAL_MANY: [Count, number][] = [
  [2, 65],
  [3, 35],
];

export function generate(request: Request, seed: number, many = false): { picture: Picture; guessed: SlotId[] } {
  const random = mulberry32(seed);
  const guessed: SlotId[] = [];
  const pick = <S extends SlotId>(slot: S): NonNullable<Request[S]> => {
    const given = request[slot];
    if (given !== undefined) return given as NonNullable<Request[S]>;
    guessed.push(slot);
    const table = (slot === 'count' && many ? TYPICAL_MANY : TYPICAL[slot]) as [NonNullable<Request[S]>, number][];
    const total = table.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = random() * total;
    for (const [value, weight] of table) {
      roll -= weight;
      if (roll <= 0) return value;
    }
    return table[0][0];
  };

  const picture: Picture = {
    animal: pick('animal'),
    count: pick('count'),
    action: pick('action'),
    place: pick('place'),
    season: pick('season'),
    daytime: pick('daytime'),
    seed: Math.floor(random() * 100000),
  };
  return { picture, guessed };
}

export function matchesBrief(request: Request): boolean {
  return SLOTS.every((slot) => request[slot.id] === BRIEF[slot.id]);
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

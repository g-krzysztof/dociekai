/**
 * Blok 1 — „To już historia?” — dane i sędziowie, bez Reacta.
 *
 * Część A: rzeczy na osi „ile temu”. Oś jest logarytmiczna po czasie wstecz
 * (od 3 godzin do 4600 lat, z przesunięciem), żeby śniadanie i piramida zmieściły się na jednym
 * pasku — ten sam pomysł co tryb „cała ludzkość” Osi dziejów, tylko w godzinach.
 *
 * Część B: trzy znaczenia słowa „historia” (F-I.1-01). Każde zdanie ma w sobie
 * wskazówkę, która przesądza o słoiku (ktoś opowiada / coś minęło / ktoś bada
 * albo się uczy) — przyporządkowanie wynika z samego zdania, nie z klucza autora.
 */

export const HOURS_PER_YEAR = 24 * 365;

export interface PastThing {
  id: string;
  label: string;
  /** Jak dawno — do podpisu pod rzeczą. */
  ago: string;
  /** Ile godzin temu — z tego wynika położenie na osi. */
  hours: number;
}

/**
 * Piramida Cheopsa w Gizie: ok. 2560 p.n.e. → ok. 4600 lat temu (F-III.2, errata
 * nie dotyczy). Zamek — dowolny zamek z XIV w. („ok. 700 lat”). Babcia — urodzona
 * ok. 65 lat temu („narodziny”, nie „urodziny” — urodziny to coroczne przyjęcie). Pierwszy ząb wyrasta ok. 6. miesiąca życia, więc u dziesięciolatka
 * „prawie 10 lat temu”.
 */
export const PAST_THINGS: PastThing[] = [
  { id: 'piramida', label: 'piramida w Egipcie', ago: 'ok. 4600 lat temu', hours: 4600 * HOURS_PER_YEAR },
  { id: 'zamek', label: 'zamek na wzgórzu', ago: 'ok. 700 lat temu', hours: 700 * HOURS_PER_YEAR },
  { id: 'babcia', label: 'narodziny babci', ago: 'ok. 65 lat temu', hours: 65 * HOURS_PER_YEAR },
  { id: 'zab', label: 'pierwszy ząbek, który ci wyrósł', ago: 'prawie 10 lat temu', hours: 9.5 * HOURS_PER_YEAR },
  { id: 'wakacje', label: 'ostatnie wakacje', ago: 'kilka tygodni temu', hours: 5 * 7 * 24 },
  { id: 'sniadanie', label: 'dzisiejsze śniadanie', ago: '3 godziny temu', hours: 3 },
];

/** Lewy koniec osi (najdawniej). */
const MAX_HOURS = 6000 * HOURS_PER_YEAR;
/**
 * Przesunięcie logarytmu (jak `LOG_OFFSET` Osi dziejów): bez niego ostatnie
 * godziny zajęłyby pół paska, a sześć kart nie zmieściłoby się na telefonie.
 */
const OFFSET_HOURS = 100;

/**
 * Położenie na osi `u ∈ [0, 1]`: 0 = najdawniej, 1 = teraz. Rzeczy zajmują
 * środek paska (0.04–0.94), żeby znacznik miał skąd ruszyć i dokąd dojść.
 */
export function hoursToU(hours: number): number {
  const lo = Math.log10(OFFSET_HOURS);
  const hi = Math.log10(MAX_HOURS + OFFSET_HOURS);
  const t = (Math.log10(Math.min(MAX_HOURS, Math.max(0, hours)) + OFFSET_HOURS) - lo) / (hi - lo);
  return Math.round((0.94 - t * 0.9) * 1000) / 1000;
}

/** Znacznik „teraz” stoi tu na starcie — przed najdawniejszą rzeczą. */
export const MARKER_START = 0.02;
/** Tyle trzeba dociągnąć, żeby znacznik stanął na „teraz”. */
export const MARKER_END = 0.97;

/** Rzeczy, które znacznik już minął. */
export function passedThings(marker: number): string[] {
  return PAST_THINGS.filter((thing) => hoursToU(thing.hours) <= marker).map((thing) => thing.id);
}

/**
 * Porównanie przewidywania z tym, co pokazał znacznik. Wszystkie rzeczy są
 * przeszłością — więc „pominięte” to te, których dziecko nie zaznaczyło
 * jako historii (prawie zawsze śniadanie i wakacje).
 */
export function predictionReport(predicted: string[]) {
  const missed = PAST_THINGS.filter((thing) => !predicted.includes(thing.id));
  return { hit: PAST_THINGS.length - missed.length, total: PAST_THINGS.length, missed };
}

// ─── Część B: trzy słoiki ───

export type Meaning = 'opowiesc' | 'przeszlosc' | 'nauka';

export const JARS: Record<Meaning, { label: string; test: string }> = {
  opowiesc: { label: 'opowieść', test: 'ktoś komuś coś opowiada' },
  przeszlosc: { label: 'przeszłość', test: 'coś się skończyło, już minęło' },
  nauka: { label: 'nauka o przeszłości', test: 'ktoś bada dawne czasy albo się ich uczy' },
};

export interface Bubble {
  id: string;
  who: string;
  /** Zdanie przed i po słowie „historia” (odmienionym). */
  before: string;
  word: string;
  after: string;
  meaning: Meaning;
  /** Co w zdaniu przesądza — mówimy to przy pomyłce. */
  clue: string;
}

/** Kolejność wymieszana: znaczenia nie idą parami ani po kolei. */
export const BUBBLES: Bubble[] = [
  {
    id: 'dziadek',
    who: 'Dziadek',
    before: 'Siadaj, opowiem ci ',
    word: 'historię',
    after: ' o tym, jak nasz pies uciekł na wesele sąsiadów.',
    meaning: 'opowiesc',
    clue: 'Dziadek zaraz będzie opowiadał — słowo „opowiem” jest w zdaniu.',
  },
  {
    id: 'brat',
    who: 'Starszy brat',
    before: 'Jutro mam sprawdzian z ',
    word: 'historii',
    after: ' — uczymy się o dawnych Egipcjanach.',
    meaning: 'nauka',
    clue: 'Brat się uczy o dawnych czasach — to przedmiot w szkole, nauka o przeszłości.',
  },
  {
    id: 'tata',
    who: 'Tata',
    before: 'Nasz stary telewizor z kineskopem przeszedł już do ',
    word: 'historii',
    after: '. Nikt takich nie robi.',
    meaning: 'przeszlosc',
    clue: 'Nikt tu niczego nie opowiada ani nie bada — telewizor po prostu należy do tego, co minęło.',
  },
  {
    id: 'ciocia',
    who: 'Ciocia',
    before: 'W pracy zajmuję się ',
    word: 'historią',
    after: ': w archiwum sprawdzam w starych dokumentach, jak ludzie żyli sto lat temu.',
    meaning: 'nauka',
    clue: 'Ciocia bada dawne czasy w dokumentach — to praca historyka, nauka o przeszłości.',
  },
  {
    id: 'mama',
    who: 'Mama',
    before: 'Ta kłótnia z ciocią to już ',
    word: 'historia',
    after: ' — dawno się pogodziłyśmy.',
    meaning: 'przeszlosc',
    clue: 'Kłótnia się skończyła i minęła — nikt jej nie opowiada ani nie bada.',
  },
  {
    id: 'babcia',
    who: 'Babcia',
    before: 'Ale to była ',
    word: 'historia',
    after: '! Kot wszedł do piekarni i wyszedł z bułką — opowiadam ją wszystkim.',
    meaning: 'opowiesc',
    clue: 'Babcia opowiada tę przygodę wszystkim — to opowieść.',
  },
];

export function judgeJar(bubbleId: string, jar: Meaning): { ok: boolean; clue?: string } {
  const bubble = BUBBLES.find((b) => b.id === bubbleId);
  if (!bubble) return { ok: false };
  return bubble.meaning === jar ? { ok: true } : { ok: false, clue: bubble.clue };
}

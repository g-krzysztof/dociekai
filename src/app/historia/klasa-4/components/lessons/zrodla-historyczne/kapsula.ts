/**
 * Blok 1 — „Kapsuła czasu” — dane i logika, bez Reacta.
 *
 * Dziecko pakuje 5 z 6 rzeczy z własnego plecaka do kapsuły, potem zgaduje
 * (przewidywanie), co archeolog z roku 3026 powie o dwóch z nich, a na końcu
 * patrzy, jak scena odczytu toczy się bez niego: archeolog czyta po swojemu
 * każdą rzecz, która JEST w kapsule (lista zakupów to „modlitwa”, gumka to
 * „amulet”). Puenta: przedmiot bez kontekstu łatwo źle zrozumieć — dziecko
 * wie, bo żyje dziś (F-I.2-02, F-I.2-03).
 *
 * Każda z sześciu rzeczy ma swoją scenę i swoje pytanie: cokolwiek dziecko
 * zostawi w plecaku, archeolog komentuje dokładnie to, co zakopało. Lista
 * zakupów jest na zwykłej kartce, nie na paragonie — papier termiczny blaknie
 * po kilku latach i do 3026 r. byłby pusty.
 *
 * Archeolog z 3026 r. jest jawnie oznaczony jako postać wymyślona (filar 5).
 */

export interface CapsuleItem {
  id: string;
  name: string;
  /** Jedno zdanie, co to jest dziś — dziecko to wie, archeolog nie. */
  today: string;
}

/** Sześć rzeczy z plecaka, do kapsuły wchodzi pięć — jedna decyzja zostaje. */
export const CAPSULE_ITEMS: CapsuleItem[] = [
  { id: 'bilet', name: 'Bilet autobusowy', today: 'Kartonik, który kasuje się w autobusie.' },
  { id: 'lista', name: 'Lista zakupów', today: 'Kartka od mamy: mleko, chleb, jabłka, ser.' },
  { id: 'gumka', name: 'Gumka do ścierania', today: 'Mała kostka, którą ściera się ołówkowe błędy.' },
  { id: 'zeszyt', name: 'Zeszyt do historii', today: 'Zeszyt, w którym zapisujesz to, czego nauczyłeś/łaś się na lekcjach.' },
  { id: 'klucz', name: 'Klucz do domu', today: 'Mały ząbkowany klucz, którym otwiera się drzwi do domu.' },
  { id: 'zdjecie', name: 'Zdjęcie z klasą', today: 'Zdjęcie całej klasy z wycieczki.' },
];

export const TO_PACK = 5;

export function packReady(packed: string[]): boolean {
  return packed.length === TO_PACK;
}

export interface ProphecyOption {
  id: string;
  text: string;
}

export interface Prophecy {
  itemId: string;
  question: string;
  /** Kolejność odpowiedzi celowo różna przy różnych rzeczach — bez wzoru do odgadnięcia. */
  options: ProphecyOption[];
  /** Którą odpowiedź dziecko zwykle zna (ma kontekst) — do raportu. */
  todayPick: string;
  /** Co o tym samym przedmiocie powie archeolog bez kontekstu. */
  digPick: string;
}

export const PROPHECIES: Prophecy[] = [
  {
    itemId: 'lista',
    question: 'Archeolog rozkłada kartkę z równymi rzędami słów. Co twoim zdaniem o niej powie?',
    options: [
      { id: 'modlitwa', text: 'Że to święty tekst — modlitwa' },
      { id: 'zakupy', text: 'Że to lista rzeczy do kupienia' },
    ],
    todayPick: 'zakupy',
    digPick: 'modlitwa',
  },
  {
    itemId: 'gumka',
    question: 'Archeolog obraca w palcach małą, gładką kostkę. Co o niej powie?',
    options: [
      { id: 'gumka', text: 'Że to gumka do ścierania' },
      { id: 'amulet', text: 'Że to amulet na szczęście' },
    ],
    todayPick: 'gumka',
    digPick: 'amulet',
  },
  {
    itemId: 'klucz',
    question: 'Archeolog podnosi mały ząbkowany kawałek metalu. Co o nim powie?',
    options: [
      { id: 'berlo', text: 'Że to berło wodza' },
      { id: 'klucz', text: 'Że to klucz do drzwi' },
    ],
    todayPick: 'klucz',
    digPick: 'berlo',
  },
  {
    itemId: 'zdjecie',
    question: 'Archeolog ogląda obrazek z rzędami dziecięcych twarzy. Co o nim powie?',
    options: [
      { id: 'klasa', text: 'Że to zdjęcie klasy' },
      { id: 'rod', text: 'Że to portret rodziny królewskiej' },
    ],
    todayPick: 'klasa',
    digPick: 'rod',
  },
  {
    itemId: 'bilet',
    question: 'Archeolog znajduje kartonik z cyframi i dziurką. Co o nim powie?',
    options: [
      { id: 'zeton', text: 'Że to żeton do gry' },
      { id: 'bilet', text: 'Że to bilet na przejazd' },
    ],
    todayPick: 'bilet',
    digPick: 'zeton',
  },
  {
    itemId: 'zeszyt',
    question: 'Archeolog kartkuje zeszyt pełen dat i imion królów. Co o nim powie?',
    options: [
      { id: 'notatki', text: 'Że to notatki ucznia' },
      { id: 'kronika', text: 'Że to kronika królestwa' },
    ],
    todayPick: 'notatki',
    digPick: 'kronika',
  },
];

/** Tyle rzeczy dziecko przewiduje — wybrane spośród tych, które zakopało. */
export const PROPHECY_COUNT = 2;

/** Pytania o rzeczy, które naprawdę są w kapsule (kolejność jak w `PROPHECIES`). */
export function prophecyFor(packed: string[]): Prophecy[] {
  return PROPHECIES.filter((p) => packed.includes(p.itemId)).slice(0, PROPHECY_COUNT);
}

export interface DigScene {
  itemId: string;
  /** Słowa archeologa — żartobliwie błędne, bo nie zna kontekstu. */
  says: string;
  /** Sprostowanie do werdyktu: „lista zakupów to nie modlitwa”. */
  truth: string;
}

export const DIG_SCENES: DigScene[] = [
  {
    itemId: 'lista',
    says: 'Kartka z równymi rzędami słów: mleko, chleb, jabłka… To musiała być modlitwa! Odmawiali ją, żeby bogowie jedzenia sprzyjali.',
    truth: 'lista zakupów to nie modlitwa',
  },
  {
    itemId: 'gumka',
    says: 'Mała, gładka, wytarta od noszenia w kieszeni… Amulet! Pocierali go pewnie przed sprawdzianem — sprawdzian to był taki ich obrzęd.',
    truth: 'gumka to nie amulet',
  },
  {
    itemId: 'klucz',
    says: 'Ząbkowany, z metalu, pasuje tylko do jednych drzwi… Berło małego wodza! Kto je miał, ten rządził całym domem.',
    truth: 'klucz to nie berło',
  },
  {
    itemId: 'zdjecie',
    says: 'Dwadzieścioro dzieci w równych rzędach, wszystkie w odświętnych strojach… Portret rodziny królewskiej! Tylu następców tronu — to musiało być wielkie królestwo.',
    truth: 'zdjęcie klasy to nie portret królewskiej rodziny',
  },
  {
    itemId: 'bilet',
    says: 'Kartonik z cyframi i wybitą dziurką… Żeton do gry! Kto nazbierał najwięcej dziurek, ten wygrywał.',
    truth: 'bilet to nie żeton do gry',
  },
  {
    itemId: 'zeszyt',
    says: 'Daty, imiona królów, rysunek zamku na marginesie… Kronika królestwa! Pisał ją nadworny kronikarz — sądząc po literach, bardzo młody.',
    truth: 'zeszyt to nie kronika królestwa',
  },
];

/** Sceny dla rzeczy w kapsule: najpierw te, które dziecko przewidywało, potem reszta. */
export function scenesFor(packed: string[]): DigScene[] {
  const predicted = prophecyFor(packed).map((p) => p.itemId);
  const inCapsule = DIG_SCENES.filter((s) => packed.includes(s.itemId));
  return [
    ...predicted.map((id) => inCapsule.find((s) => s.itemId === id)!),
    ...inCapsule.filter((s) => !predicted.includes(s.itemId)),
  ];
}

export function itemById(id: string): CapsuleItem {
  const item = CAPSULE_ITEMS.find((i) => i.id === id);
  if (!item) throw new Error(`Nie ma przedmiotu „${id}” w kapsule`);
  return item;
}

export function optionText(itemId: string, optionId: string): string | null {
  return PROPHECIES.find((p) => p.itemId === itemId)?.options.find((o) => o.id === optionId)?.text ?? null;
}

/**
 * Raport przewidywania: ile razy dziecko wybrało odpowiedź „z kontekstem”
 * (zwykle trafia — bo żyje dziś), a ile razy wybrało tak jak archeolog.
 */
export function prophecyReport(picks: Record<string, string>): { withContext: number; likeArchaeologist: number } {
  let withContext = 0;
  let likeArchaeologist = 0;
  for (const prophecy of PROPHECIES) {
    const pick = picks[prophecy.itemId];
    if (!pick) continue;
    if (pick === prophecy.todayPick) withContext += 1;
    if (pick === prophecy.digPick) likeArchaeologist += 1;
  }
  return { withContext, likeArchaeologist };
}

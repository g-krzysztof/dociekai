/**
 * L33 — Test końcowy: dwanaście zadań **wykonywanych**, po trzy w czterech
 * częściach (czas, ślady, mapa i miejsce, dziedzictwo). Jedna próba na
 * zadanie — wynik zapisuje się od razu, a pod zadaniem pojawia się
 * wyjaśnienie. Sędziowie poniżej to czyste funkcje (selftest w scripts/).
 *
 * Daty: piramidy w Gizie ok. 2500 p.n.e., pierwsze igrzyska 776 p.n.e.,
 * śmierć Cezara 44 p.n.e., edykt mediolański 313 — te same co na Osi dziejów.
 */

export type PartId = 'czas' | 'slady' | 'mapa' | 'dziedzictwo';

export interface Task {
  id: string;
  part: PartId;
  /** Czego dowodzi trafne rozwiązanie — do podsumowania „co już umiesz”. */
  skill: string;
  /** Lekcja, do której warto wrócić przy pomyłce: `<moduł>/<lekcja>` i jej numer. */
  lesson: { href: string; label: string };
}

export const PARTS: readonly { id: PartId; title: string }[] = [
  { id: 'czas', title: 'Czas' },
  { id: 'slady', title: 'Ślady przeszłości' },
  { id: 'mapa', title: 'Mapa i miejsce' },
  { id: 'dziedzictwo', title: 'Dziedzictwo starożytności' },
];

const L = (href: string, label: string) => ({ href, label });

export const TASKS: readonly Task[] = [
  { id: 'os', part: 'czas', skill: 'układasz wydarzenia na osi, także przed naszą erą', lesson: L('czas-i-miejsce/os-czasu-i-epoki', 'L6 Oś czasu i epoki') },
  { id: 'lata', part: 'czas', skill: 'liczysz lata między datami z dwóch er', lesson: L('czas-i-miejsce/obliczanie-czasu', 'L8 Ile lat minęło?') },
  { id: 'wieki', part: 'czas', skill: 'zamieniasz rok na wiek', lesson: L('czas-i-miejsce/wieki-i-tysiaclecia', 'L7 W którym to wieku?') },
  { id: 'bramki', part: 'slady', skill: 'rozpoznajesz źródła pisane, niepisane i niematerialne', lesson: L('warsztat-historyka/zrodla-historyczne', 'L2 Ślady przeszłości') },
  { id: 'opinia', part: 'slady', skill: 'odróżniasz fakt od czyjejś opinii', lesson: L('warsztat-historyka/wiarygodnosc-zrodla', 'L3 Czy źródło mówi prawdę?') },
  { id: 'swiadek', part: 'slady', skill: 'wiesz, które źródło stoi bliżej wydarzenia', lesson: L('warsztat-historyka/wiarygodnosc-zrodla', 'L3 Czy źródło mówi prawdę?') },
  { id: 'legenda', part: 'mapa', skill: 'czytasz mapę z legendą', lesson: L('czas-i-miejsce/mapa-i-plan', 'L9 Mapa i plan historyczny') },
  { id: 'kolonia', part: 'mapa', skill: 'łączysz starożytne miasto z dzisiejszym państwem', lesson: L('starozytna-grecja/grecja-gory-i-morze', 'L22 Kraina gór i morza') },
  { id: 'zasieg', part: 'mapa', skill: 'wiesz, kiedy Rzym był największy', lesson: L('starozytny-rzym/od-wioski-do-imperium', 'L26 Od wioski do imperium') },
  { id: 'ulica', part: 'dziedzictwo', skill: 'widzisz ślady Grecji i Rzymu na dzisiejszej ulicy', lesson: L('starozytny-rzym/dziedzictwo-rzymu', 'L28 Rzymianie budowali na zawsze') },
  { id: 'anachronizmy', part: 'dziedzictwo', skill: 'wyłapujesz rzeczy nie z tej epoki', lesson: L('starozytny-egipt/bogowie-mumie-piramidy', 'L20 Bogowie, mumie, piramidy') },
  { id: 'flaga', part: 'dziedzictwo', skill: 'wiesz, jak wywiesić flagę Polski', lesson: L('mala-i-duza-ojczyzna/symbole-narodowe', 'L10 Godło, barwy, hymn') },
];

export const tasksOf = (part: PartId) => TASKS.filter((t) => t.part === part);

// ─── A. Czas ────────────────────────────────────────────────────────────────

export const AXIS_EVENTS: readonly { id: string; label: string; year: number; when: string }[] = [
  { id: 'cezar', label: 'śmierć Juliusza Cezara', year: -44, when: '44 p.n.e.' },
  { id: 'piramidy', label: 'budowa piramid w Gizie', year: -2500, when: 'ok. 2500 p.n.e.' },
  { id: 'edykt', label: 'wolność dla chrześcijan', year: 313, when: '313 n.e.' },
  { id: 'igrzyska', label: 'pierwsze igrzyska w Olimpii', year: -776, when: '776 p.n.e.' },
];

export function judgeAxis(order: readonly string[]): boolean {
  const years = order.map((id) => AXIS_EVENTS.find((e) => e.id === id)!.year);
  return years.length === AXIS_EVENTS.length && years.every((y, i) => i === 0 || years[i - 1] < y);
}

/** Od 44 p.n.e. do 313 n.e.: 44 + 313 − 1 (roku zero nie było). */
export const YEARS_FROM = -44;
export const YEARS_TO = 313;
export const YEARS_ANSWER = 356;

export function judgeYears(input: string): boolean {
  return Number(input.trim()) === YEARS_ANSWER;
}

export const CENTURY_ITEMS: readonly { id: string; year: string; options: readonly string[]; answer: string }[] = [
  { id: 'r1900', year: '1900', options: ['XVIII w.', 'XIX w.', 'XX w.'], answer: 'XIX w.' },
  { id: 'r480', year: '480 p.n.e.', options: ['IV w. p.n.e.', 'V w. p.n.e.', 'VI w. p.n.e.'], answer: 'V w. p.n.e.' },
];

export function judgeCenturies(picked: Readonly<Record<string, string>>): boolean {
  return CENTURY_ITEMS.every((c) => picked[c.id] === c.answer);
}

// ─── B. Ślady ───────────────────────────────────────────────────────────────

export type SourceKind = 'pisane' | 'niepisane' | 'niematerialne';

export const SOURCES: readonly { id: string; name: string; kind: SourceKind }[] = [
  { id: 'grot', name: 'krzemienny grot włóczni z wykopaliska', kind: 'niepisane' },
  { id: 'legenda', name: 'legenda o smoku, którą opowiada babcia', kind: 'niematerialne' },
  { id: 'list', name: 'list Pliniusza do cesarza Trajana', kind: 'pisane' },
];

export function judgeSources(picked: Readonly<Record<string, SourceKind>>): boolean {
  return SOURCES.every((s) => picked[s.id] === s.kind);
}

export const OPINION_TEXT: readonly { id: string; text: string; opinion: boolean }[] = [
  { id: 'o1', text: 'Partenon zbudowano w Atenach w V wieku p.n.e.', opinion: false },
  { id: 'o2', text: 'To najpiękniejsza budowla, jaką kiedykolwiek wzniesiono.', opinion: true },
  { id: 'o3', text: 'Świątynia stoi na wzgórzu zwanym Akropolem.', opinion: false },
];

export function judgeOpinion(id: string): boolean {
  return OPINION_TEXT.find((o) => o.id === id)?.opinion === true;
}

export const WITNESSES: readonly { id: string; name: string; close: boolean }[] = [
  { id: 'film', name: 'film o Peryklesie nakręcony w 2015 roku', close: false },
  { id: 'tukidydes', name: 'opis Tukidydesa, Ateńczyka, który znał Peryklesa', close: true },
];

export function judgeWitness(id: string): boolean {
  return WITNESSES.find((w) => w.id === id)?.close === true;
}

// ─── C. Mapa i miejsce ──────────────────────────────────────────────────────

export type MapSign = 'zamek' | 'kosciol' | 'mlyn' | 'most';

/** Plan wymyślonej wsi; legenda mówi, co znaczy każdy znak. Szukamy młyna. */
export const PLAN_SIGNS: readonly { id: string; sign: MapSign; x: number; y: number }[] = [
  { id: 's1', sign: 'kosciol', x: 60, y: 40 },
  { id: 's2', sign: 'zamek', x: 150, y: 30 },
  { id: 's3', sign: 'mlyn', x: 170, y: 95 },
  { id: 's4', sign: 'most', x: 95, y: 85 },
];

export const PLAN_TARGET: MapSign = 'mlyn';

export function judgeSign(id: string): boolean {
  return PLAN_SIGNS.find((s) => s.id === id)?.sign === PLAN_TARGET;
}

/** Syrakuzy — kolonia Koryntu na Sycylii (733 p.n.e.); dziś Włochy. */
export const COLONY_ANSWER = 'ITA';

export function judgeCountry(id: string): boolean {
  return id === COLONY_ANSWER;
}

// ─── D. Dziedzictwo ─────────────────────────────────────────────────────────

/** Ulica dziś: trzy ślady Grecji i Rzymu, reszta to zwykła ulica. */
export const STREET_ITEMS: readonly { id: string; label: string; ancient: boolean }[] = [
  { id: 'kolumny', label: 'kolumny przed wejściem do muzeum', ancient: true },
  { id: 'luk', label: 'łuk bramy nad przejazdem', ancient: true },
  { id: 'teatr', label: 'napis TEATR nad drzwiami', ancient: true },
  { id: 'latarnia', label: 'latarnia uliczna', ancient: false },
  { id: 'piekarnia', label: 'napis PIEKARNIA nad sklepem', ancient: false },
  { id: 'rower', label: 'rower przypięty do barierki', ancient: false },
];

export const STREET_NEED = 3;

export function judgeStreet(picked: readonly string[]): boolean {
  return picked.length === STREET_NEED && picked.every((id) => STREET_ITEMS.find((s) => s.id === id)?.ancient);
}

/** Budowa piramid ok. 2500 p.n.e.: koni i wielbłądów w Egipcie jeszcze nie było, kolumn greckich też. */
export const EGYPT_ITEMS: readonly { id: string; label: string; anachronism: boolean }[] = [
  { id: 'sanie', label: 'drewniane sanie z kamiennym blokiem', anachronism: false },
  { id: 'wielblad', label: 'wielbłąd z jucznymi workami', anachronism: true },
  { id: 'lodz', label: 'łódź z pęków papirusu na Nilu', anachronism: false },
  { id: 'kolumna', label: 'grecka kolumna z kręconą głowicą', anachronism: true },
  { id: 'palma', label: 'palma daktylowa', anachronism: false },
];

export const EGYPT_NEED = 2;

export function judgeEgypt(picked: readonly string[]): boolean {
  return picked.length === EGYPT_NEED && picked.every((id) => EGYPT_ITEMS.find((s) => s.id === id)?.anachronism);
}

/** Flaga RP: biały pas u góry, czerwony u dołu (ustawa o godle, barwach i hymnie, art. 6). */
export function judgeFlag(topIsWhite: boolean): boolean {
  return topIsWhite;
}

// ─── Wynik ──────────────────────────────────────────────────────────────────

export function partScore(results: Readonly<Record<string, boolean>>, part: PartId): { ok: number; done: number; total: number } {
  const ts = tasksOf(part);
  return {
    ok: ts.filter((t) => results[t.id] === true).length,
    done: ts.filter((t) => t.id in results).length,
    total: ts.length,
  };
}

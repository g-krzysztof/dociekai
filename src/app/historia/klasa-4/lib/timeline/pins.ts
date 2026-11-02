/**
 * Katalog pinezek rdzenia Osi dziejów — dane, bez Reacta.
 *
 * **Pinezka nie jest osobnym stanem.** Wisi na osi dziecka wtedy, gdy blok,
 * w którym dziecko ją przypina, jest zaliczony (`from[].block`) — albo, dopóki
 * lekcja nie jest zbudowana i blok nie ma jeszcze id, gdy cała lekcja jest
 * ukończona. Oś jest więc wyprowadzana z postępu lekcji przy każdym odczycie
 * (ta sama filozofia co seria nauki: zapisujemy surowe fakty, nic
 * zagregowanego) i synchronizuje się z kontem razem z postępem, bez nowego
 * kontraktu backendu. Reset bloku zdejmuje pinezkę — i tak ma być.
 *
 * Skąd lista: sekcje „Zostaje:” kart lekcji i zestaw rdzenia Osi dziejów. Budując lekcję: **wpisz `block`** przy
 * jej pinezkach (id bloku „przypnij”) i popraw datowanie, jeśli karta się zmieni.
 * Pinezki osobiste (rok urodzenia z L1, lata rodzinne z L5) są gdzie indziej —
 * `personal-storage.ts`, bo to dane dziecka, a nie programu.
 */

import type { Dating } from './dating';

export interface PinSource {
  /** `<moduł>/<lekcja>` — jak klucz postępu kursu. */
  lesson: string;
  /** Id bloku, którego zaliczenie przypina pinezkę; brak = cała lekcja ukończona. */
  block?: string;
}

export interface TimelinePin {
  id: string;
  /** Krótki podpis na osi (mieści się w jednym wierszu na telefonie). */
  label: string;
  dating: Dating;
  /** Jedna pinezka może przyjść z kilku lekcji (1918 w L6 i L11) — wystarczy dowolna. */
  from: PinSource[];
  /** Pinezka ze znakiem zapytania: źródła się nie zgadzają (Psie Pole, L3). */
  uncertain?: boolean;
  /** Blok rozszerzenia (R) — pinezka tylko wtedy, gdy dziecko go zrobiło. */
  extension?: boolean;
  /**
   * Pinezka „bez daty” (legenda, L14): na osi wisi we mgle rozciągniętej
   * między latami `from`–`to` (lata historyczne), z podpisem `when` zamiast daty.
   */
  mist?: { from: number; to: number; when: string };
}

const L = {
  zrodla: 'warsztat-historyka/zrodla-historyczne',
  wiarygodnosc: 'warsztat-historyka/wiarygodnosc-zrodla',
  przyczyny: 'warsztat-historyka/przyczyny-i-skutki',
  epoki: 'czas-i-miejsce/os-czasu-i-epoki',
  obliczanie: 'czas-i-miejsce/obliczanie-czasu',
  mapa: 'czas-i-miejsce/mapa-i-plan',
  symbole: 'mala-i-duza-ojczyzna/symbole-narodowe',
  swieta: 'mala-i-duza-ojczyzna/swieta-i-wspolnoty',
  regiony: 'mala-i-duza-ojczyzna/regiony-i-mala-ojczyzna',
  legendy: 'mala-i-duza-ojczyzna/legendy-prawda-i-fikcja',
  pierwsiLudzie: 'poczatki-cywilizacji/pierwsi-ludzie',
  neolit: 'poczatki-cywilizacji/rewolucja-neolityczna',
  mezopotamia: 'poczatki-cywilizacji/mezopotamia',
  pismo: 'poczatki-cywilizacji/od-pisma-do-alfabetu',
  nil: 'starozytny-egipt/egipt-dar-nilu',
  piramidy: 'starozytny-egipt/bogowie-mumie-piramidy',
  osiagniecia: 'starozytny-egipt/osiagniecia-egipcjan',
  grecja: 'starozytna-grecja/grecja-gory-i-morze',
  ateny: 'starozytna-grecja/ateny-i-demokracja',
  teatr: 'starozytna-grecja/teatr-igrzyska-filozofia',
  rzym: 'starozytny-rzym/od-wioski-do-imperium',
  cezar: 'starozytny-rzym/rzym-czasow-cezara',
  dziedzictwo: 'starozytny-rzym/dziedzictwo-rzymu',
  jezus: 'narodziny-chrzescijanstwa/judaizm-i-nauczanie-jezusa',
  katakumby: 'narodziny-chrzescijanstwa/od-katakumb-do-religii-panujacej',
  wykopalisko: 'podsumowanie/wykopalisko-roku',
} as const;

const y = (year: number, approx?: boolean): Dating => ({ kind: 'year', year, approx });
const c = (century: number, part?: 'poczatek' | 'polowa' | 'koniec'): Dating => ({
  kind: 'century',
  century,
  part,
});

export const CORE_PINS: TimelinePin[] = [
  // Moduł 4 — pradzieje i pierwsze cywilizacje
  { id: 'pierwsi-ludzie', label: 'pierwsi ludzie', dating: { kind: 'ago', years: 300_000 }, from: [{ lesson: L.pierwsiLudzie, block: 'wedrowki' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'neolit', label: 'rewolucja neolityczna', dating: y(-10_000, true), from: [{ lesson: L.neolit, block: 'schemat' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'jerycho', label: 'Jerycho', dating: { kind: 'range', from: -9000, to: -8001, approx: true }, from: [{ lesson: L.neolit, block: 'schemat' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'miasta-panstwa-sumer', label: 'miasta-państwa Sumerów', dating: { kind: 'range', from: -4000, to: -3000, approx: true }, from: [{ lesson: L.mezopotamia, block: 'kanaly' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'hammurabi', label: 'Hammurabi', dating: c(-18), from: [{ lesson: L.mezopotamia, block: 'sad' }], extension: true },
  { id: 'pismo', label: 'pismo', dating: y(-3400, true), from: [{ lesson: L.epoki, block: 'epoki' }, { lesson: L.pismo, block: 'magazyn' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'alfabet-fenicki', label: 'alfabet fenicki', dating: c(-11), from: [{ lesson: L.pismo, block: 'alef' }, { lesson: L.wykopalisko, block: 'os' }] },
  // Moduł 5 — Egipt
  { id: 'panstwo-egipskie', label: 'państwo egipskie', dating: y(-3000, true), from: [{ lesson: L.nil, block: 'wstega' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'piramidy-giza', label: 'piramidy w Gizie', dating: y(-2500, true), from: [{ lesson: L.piramidy, block: 'sanie' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'tutanchamon', label: 'grobowiec Tutanchamona', dating: y(1922), from: [{ lesson: L.piramidy, block: 'grobowiec' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'hieroglify', label: 'odczytanie hieroglifów', dating: y(1822), from: [{ lesson: L.osiagniecia, block: 'kartusze' }, { lesson: L.wykopalisko, block: 'os' }] },
  // Moduł 6 — Grecja
  { id: 'polis', label: 'greckie miasta-państwa', dating: c(-8), from: [{ lesson: L.grecja, block: 'polis' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'igrzyska', label: 'pierwsze igrzyska', dating: y(-776), from: [{ lesson: L.teatr, block: 'igrzyska' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'perykles', label: 'Ateny Peryklesa', dating: c(-5), from: [{ lesson: L.ateny, block: 'dzien' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'igrzyska-nowozytne', label: 'nowożytne igrzyska', dating: y(1896), from: [{ lesson: L.teatr, block: 'igrzyska' }, { lesson: L.wykopalisko, block: 'os' }] },
  // Moduł 7 — Rzym
  { id: 'rzym', label: 'założenie Rzymu (legenda)', dating: y(-753), from: [{ lesson: L.rzym, block: 'wilczyca' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'kalendarz-julianski', label: 'kalendarz juliański', dating: y(-46), from: [{ lesson: L.obliczanie }], extension: true },
  { id: 'cezar', label: 'śmierć Cezara', dating: y(-44), from: [{ lesson: L.cezar, block: 'cezar' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'pompeje', label: 'Pompeje', dating: y(79), from: [{ lesson: L.dziedzictwo }], extension: true },
  { id: 'podzial-cesarstwa', label: 'podział cesarstwa', dating: y(395), from: [{ lesson: L.rzym, block: 'imperium' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'upadek-rzymu', label: 'upadek Rzymu', dating: y(476), from: [{ lesson: L.epoki, block: 'epoki' }, { lesson: L.rzym, block: 'imperium' }, { lesson: L.wykopalisko, block: 'os' }] },
  // Moduł 8 — chrześcijaństwo
  { id: 'jezus', label: 'działalność Jezusa', dating: y(30, true), from: [{ lesson: L.jezus, block: 'palestyna' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'chrzescijanstwo', label: 'narodziny chrześcijaństwa', dating: c(1), from: [{ lesson: L.katakumby, block: 'szlak' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'edykt', label: 'wolność wyznania', dating: y(313), from: [{ lesson: L.katakumby, block: 'trzysta' }, { lesson: L.wykopalisko, block: 'os' }] },
  { id: 'religia-panujaca', label: 'religia panująca', dating: c(4, 'koniec'), from: [{ lesson: L.katakumby, block: 'trzysta' }, { lesson: L.wykopalisko, block: 'os' }] },
  // Moduły 1–3 — warsztat, czas, ojczyzna (wydarzenia spoza starożytności)
  { id: 'moneta-polska', label: 'moneta z nazwą Polski', dating: y(1000, true), from: [{ lesson: L.zrodla, block: 'moneta' }] },
  // Legenda bez daty: mgła przed początkiem państwa (966 — chrzest, pierwsza pewna data w dziejach Polski).
  { id: 'lech', label: 'Lech (legenda)', dating: { kind: 'range', from: 600, to: 965, approx: true }, mist: { from: 600, to: 966, when: 'czas legendy — przed 966' }, from: [{ lesson: L.legendy, block: 'legendy' }] },
  { id: 'psie-pole', label: 'bitwa na Psim Polu', dating: y(1109), from: [{ lesson: L.wiarygodnosc, block: 'dylemat' }], uncertain: true },
  { id: 'orzel-w-koronie', label: 'orzeł w koronie', dating: y(1295), from: [{ lesson: L.symbole, block: 'orzel' }] },
  { id: 'grunwald', label: 'Grunwald', dating: y(1410), from: [{ lesson: L.mapa, block: 'skala' }] },
  { id: 'druk', label: 'druk', dating: c(15, 'polowa'), from: [{ lesson: L.przyczyny, block: 'drukarnia' }] },
  { id: 'kolumb', label: 'Kolumb w Ameryce', dating: y(1492), from: [{ lesson: L.epoki, block: 'epoki' }] },
  { id: 'kalendarz-gregorianski', label: 'kalendarz gregoriański', dating: y(1582), from: [{ lesson: L.obliczanie, block: 'pazdziernik' }] },
  { id: 'warszawa-stolica', label: 'Warszawa stolicą', dating: c(16, 'koniec'), from: [{ lesson: L.regiony, block: 'regiony' }] },
  { id: 'konstytucja', label: 'Konstytucja 3 maja', dating: y(1791), from: [{ lesson: L.swieta, block: 'kalendarz' }] },
  { id: 'hymn', label: 'Mazurek Dąbrowskiego', dating: y(1797), from: [{ lesson: L.symbole, block: 'hymn' }] },
  { id: 'niepodleglosc', label: 'niepodległość', dating: y(1918), from: [{ lesson: L.epoki, block: 'epoki' }, { lesson: L.swieta, block: 'kalendarz' }] },
  { id: 'bitwa-warszawska', label: 'Bitwa Warszawska', dating: y(1920), from: [{ lesson: L.swieta, block: 'kalendarz' }] },
  { id: 'hymn-panstwowy', label: 'hymn państwowy', dating: y(1927), from: [{ lesson: L.symbole, block: 'hymn' }] },
];

export function getCorePin(id: string): TimelinePin {
  const pin = CORE_PINS.find((p) => p.id === id);
  if (!pin) throw new Error(`Nie ma pinezki „${id}” w CORE_PINS`);
  return pin;
}

/** Postęp lekcji w kształcie z magazynu kursu, kluczowany `<moduł>/<lekcja>`. */
export type ProgressByLesson = Record<string, { completed: string[]; total: number } | undefined>;

/** Czy pinezka wisi na osi przy danym postępie — czysta funkcja, patrz nagłówek pliku. */
export function isPinEarned(pin: TimelinePin, progress: ProgressByLesson): boolean {
  return pin.from.some(({ lesson, block }) => {
    const entry = progress[lesson];
    if (!entry) return false;
    if (block) return entry.completed.includes(block);
    return entry.total > 0 && entry.completed.length >= entry.total;
  });
}

export function earnedPins(progress: ProgressByLesson): TimelinePin[] {
  return CORE_PINS.filter((pin) => isPinEarned(pin, progress));
}

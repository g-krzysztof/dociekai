/**
 * Program kursu historii dla klasy 4 szkoły podstawowej.
 * Źródło zakresu i podziału na moduły: podstawa programowa z rozporządzenia MEN z 11 marca 2026 r., Dz.U. 2026 poz. 378,
 * obowiązująca w klasie IV od 1 września 2026 r.; klasa 4 = działy 1–8).
 *
 * To jedyne miejsce z treścią programu — hub `/historia/klasa-4`, spis treści
 * i strony modułów renderują wyłącznie te dane. Program zmienia się najpierw
 * w programie, dopiero potem tutaj.
 *
 * Odsyłacze `[5.2]` w opisach to numery wymagań szczegółowych dla klas IV–VI
 * (dział.wymaganie); ich dosłowne brzmienie jest w podstawie programowej.
 */

/**
 * `available` = moduł ma **choć jedną opublikowaną lekcję**; `soon` = nie ma
 * w nim jeszcze niczego do kliknięcia. Przełączaj razem z pierwszą lekcją
 * modułu — od tego zależy kolor numeru i kłódka na półce kursu.
 */
export type ModuleStatus = 'available' | 'soon';

/** Do której części roku szkolnego należy moduł (harmonogram ~33 tygodni). */
export type ModuleTrack = 'start' | 'semestr-1' | 'semestr-2' | 'final';

export interface HistModule {
  /** Numer modułu z programu (0–9). */
  number: number;
  slug: string;
  title: string;
  /** Cel modułu — jedno zdanie na kafelek. */
  goal: string;
  /** Dłuższy opis na podstronie modułu. */
  intro: string;
  track: ModuleTrack;
  /** Orientacyjny wymiar godzin, np. „4 h”. */
  hours: string;
  /** Tygodnie z harmonogramu rocznego, np. „2–5”. */
  weeks: string;
  /** Kolor przewodni modułu (akcenty, numer, ramki). */
  color: string;
  /** Nazwa ikony z `@/components/ui/module-icon`. */
  icon: string;
  /** Ilustracja modułu (klucz `img()` / ścieżka w public/) — sunburst od E4b. */
  image?: string;
  /** Hasła tematów pokazywane jako chipy na kafelku. */
  highlights: string[];
  /** Jednostki tematyczne — w historii jedna jednostka to jedna lekcja online. */
  lessons: string[];
  status: ModuleStatus;
}

export const HIST_MODULES: HistModule[] = [
  {
    number: 0,
    slug: 'start',
    title: 'Start',
    goal: 'Dowiedzieć się, czym jest historia i czym różni się od baśni i legendy.',
    intro:
      'Pierwsza lekcja historii: co znaczy słowo „historia”, skąd wiadomo, że postać żyła naprawdę, i po co w ogóle poznawać przeszłość. Na koniec zakładasz własną oś dziejów, która będzie rosła przez cały rok.',
    track: 'start',
    hours: '1 h',
    weeks: '1',
    color: '#4f46e5',
    icon: 'Compass',
    image: '/images/historia/modul-00-start.jpg',
    highlights: ['czym jest historia', 'historia, legenda, baśń', 'twoja oś dziejów'],
    lessons: ['Pierwsza lekcja historii — przeszłość, opowieść i nauka o przeszłości'],
    status: 'available',
  },
  {
    number: 1,
    slug: 'warsztat-historyka',
    title: 'Warsztat historyka',
    goal: 'Wiedzieć, skąd znamy przeszłość i jak historyk sprawdza, czy źródło mówi prawdę.',
    intro:
      'Źródła pisane, niepisane i niematerialne, praca archeologa, porównywanie relacji, fakty i opinie, przyczyny i skutki — a na koniec twoja rodzina jako pierwsze archiwum, które badasz samodzielnie.',
    track: 'semestr-1',
    hours: '4 h',
    weeks: '2–5',
    color: '#9a3412',
    icon: 'Search',
    image: '/images/historia/modul-01-warsztat-historyka.jpg',
    highlights: ['źródła historyczne', 'wiarygodność', 'przyczyny i skutki', 'historia rodziny'],
    lessons: [
      'Ślady przeszłości — źródła historyczne i praca archeologa',
      'Czy źródło mówi prawdę? — kto, kiedy, po co; fakt a opinia',
      'Dlaczego i co z tego wynikło — przyczyny i skutki',
      'Historia mojej rodziny — pamiątki, pokolenia, drzewo genealogiczne',
    ],
    status: 'available',
  },
  {
    number: 2,
    slug: 'czas-i-miejsce',
    title: 'Czas i miejsce',
    goal: 'Umieścić wydarzenie w czasie i w przestrzeni: oś, epoka, wiek, upływ lat, mapa.',
    intro:
      'Oś czasu i epoki historyczne, wieki i tysiąclecia przed naszą erą i naszej ery, liczenie lat bez roku zerowego oraz czytanie mapy historycznej i planu za pomocą legendy.',
    track: 'semestr-1',
    hours: '4 h',
    weeks: '6–9',
    color: '#0f766e',
    icon: 'Hourglass',
    image: '/images/historia/modul-02-czas-i-miejsce.jpg',
    highlights: ['oś czasu i epoki', 'wieki', 'upływ lat', 'mapa i plan'],
    lessons: [
      'Oś czasu i epoki historyczne',
      'W którym to wieku? — wiek, stulecie, tysiąclecie',
      'Ile lat minęło? — obliczanie czasu i dawne kalendarze',
      'Mapa i plan historyczny — tytuł, legenda, podziałka',
    ],
    status: 'available',
  },
  {
    number: 3,
    slug: 'mala-i-duza-ojczyzna',
    title: 'Mała i duża ojczyzna',
    goal: 'Rozpoznać symbole i święta wspólnoty oraz nauczyć się czytać historię własnej okolicy.',
    intro:
      'Godło, barwy i hymn, święta państwowe i symbole Unii Europejskiej, regiony Polski i ich tradycje, ślady historii w nazwach ulic i zabytkach, legendy — i to, jak odróżnić w nich prawdę od zmyślenia.',
    track: 'semestr-1',
    hours: '5 h',
    weeks: '10–14',
    color: '#dc2626',
    icon: 'Flag',
    image: '/images/historia/modul-03-mala-i-duza-ojczyzna.jpg',
    highlights: ['symbole narodowe', 'święta państwowe', 'regiony Polski', 'historia okolicy', 'legendy'],
    lessons: [
      'Godło, barwy, hymn — symbole narodowe',
      'Wspólnoty i święta państwowe; symbole Unii Europejskiej',
      'Dlaczego regiony się różnią — mała ojczyzna, gwary, stroje, tradycje',
      'Jak czytać swoją okolicę — ślady historii, bohaterowie, zabytki',
      'Co w legendzie jest prawdą?',
    ],
    status: 'available',
  },
  {
    number: 4,
    slug: 'poczatki-cywilizacji',
    title: 'Początki cywilizacji',
    goal: 'Zrozumieć, jak z wędrujących grup powstały wioski, miasta i pismo.',
    intro:
      'Koczownicy i ogień, rewolucja neolityczna i pierwsze wioski, miasta-państwa Mezopotamii i droga od obrazków do alfabetu.',
    track: 'semestr-2',
    hours: '4 h',
    weeks: '15–18',
    color: '#65a30d',
    icon: 'Flame',
    image: '/images/historia/modul-04-poczatki-cywilizacji.jpg',
    highlights: ['koczownicy', 'rewolucja neolityczna', 'Mezopotamia', 'pismo i alfabet'],
    lessons: [
      'Koczownicy — ogień, polowanie, wędrówki',
      'Od zbieracza do rolnika — rewolucja neolityczna',
      'Pierwsze miasta — Mezopotamia',
      'Po co ludziom pismo — od piktogramu do alfabetu',
    ],
    status: 'available',
  },
  {
    number: 5,
    slug: 'starozytny-egipt',
    title: 'Starożytny Egipt',
    goal: 'Opisać życie nad Nilem i to, co zawdzięczamy Egipcjanom.',
    intro:
      'Rok rolnika nad Nilem, faraon i społeczeństwo, wiara w życie po śmierci, piramidy i mumie, a także hieroglify, kalendarz, mierzenie pól i medycyna.',
    track: 'semestr-2',
    hours: '3 h',
    weeks: '19–21',
    color: '#ca8a04',
    icon: 'Pyramid',
    image: '/images/historia/modul-05-starozytny-egipt.jpg',
    highlights: ['dar Nilu', 'faraon', 'piramidy', 'hieroglify'],
    lessons: [
      'Egipt darem Nilu — rok nad rzeką i społeczeństwo',
      'Bogowie, mumie, piramidy',
      'Co zawdzięczamy Egipcjanom',
    ],
    status: 'available',
  },
  {
    number: 6,
    slug: 'starozytna-grecja',
    title: 'Dziedzictwo starożytnej Grecji',
    goal: 'Opisać polis i demokrację ateńską oraz to, co zostało po Grekach.',
    intro:
      'Góry i morze, które ukształtowały Greków, Ateny w czasach Peryklesa i to, kto naprawdę głosował, mity i bogowie Olimpu, teatr, igrzyska i filozofia.',
    track: 'semestr-2',
    hours: '4 h',
    weeks: '22–25',
    color: '#2563eb',
    icon: 'Landmark',
    image: '/images/historia/modul-06-starozytna-grecja.jpg',
    highlights: ['polis', 'demokracja ateńska', 'mitologia', 'teatr i igrzyska', 'filozofia'],
    lessons: [
      'Kraina gór i morza — polis i greckie kolonie',
      'Ateny Peryklesa — demokracja, agora, Akropol',
      'Olimp i mity',
      'Teatr, igrzyska, filozofia',
    ],
    status: 'available',
  },
  {
    number: 7,
    slug: 'starozytny-rzym',
    title: 'Dziedzictwo starożytnego Rzymu',
    goal: 'Opisać Rzym, jego ustroje i zasięg oraz to, co zostało po Rzymianach.',
    intro:
      'Od wioski nad Tybrem do imperium: królestwo, republika i cesarstwo, życie w Rzymie czasów Juliusza Cezara oczami różnych ludzi, a na koniec akwedukty, drogi, prawo i łacina, które przetrwały do dziś.',
    track: 'semestr-2',
    hours: '3 h',
    weeks: '26–28',
    color: '#7e22ce',
    icon: 'Shield',
    image: '/images/historia/modul-07-starozytny-rzym.jpg',
    highlights: ['republika i cesarstwo', 'Rzym Cezara', 'akwedukty i drogi', 'łacina i prawo'],
    lessons: [
      'Od wioski do imperium',
      'Jeden dzień, trzy życia — Rzym czasów Cezara',
      'Rzymianie budowali na zawsze — dziedzictwo Rzymu',
    ],
    status: 'available',
  },
  {
    number: 8,
    slug: 'narodziny-chrzescijanstwa',
    title: 'Narodziny chrześcijaństwa',
    goal: 'Przedstawić założenia chrześcijaństwa i jego drogę od prześladowań do religii panującej.',
    intro:
      'Judaizm i wiara w jednego Boga, Dekalog, nauczanie Jezusa i apostołowie, a potem trzysta lat: podróże wzdłuż szlaków handlowych, prześladowania, edykt mediolański i wpływ chrześcijaństwa na Europę.',
    track: 'semestr-2',
    hours: '2 h',
    weeks: '29–30',
    color: '#0e7490',
    icon: 'Fish',
    image: '/images/historia/modul-08-narodziny-chrzescijanstwa.jpg',
    highlights: ['judaizm i monoteizm', 'Dekalog', 'podróże apostołów', 'edykt mediolański'],
    lessons: [
      'Z judaizmu do chrześcijaństwa',
      'Od katakumb do religii panującej',
    ],
    status: 'available',
  },
  {
    number: 9,
    slug: 'podsumowanie',
    title: 'Podsumowanie roku',
    goal: 'Zebrać rok w całość i sprawdzić, co naprawdę zostało.',
    intro:
      'Teczka wybranej postaci ze starożytności z własną oceną, powtórzenie całego roku jako wykopalisko warstwa po warstwie i test końcowy z zapowiedzią klasy 5.',
    track: 'final',
    hours: '3 h',
    weeks: '31–33',
    color: '#475569',
    icon: 'Trophy',
    image: '/images/historia/modul-09-podsumowanie.jpg',
    highlights: ['teczka postaci', 'wykopalisko roku', 'test końcowy'],
    lessons: [
      'Teczka postaci — źródła, ocena, wystawa',
      'Wykopalisko roku — powtórzenie przekrojowe',
      'Test końcowy i most do klasy 5',
    ],
    status: 'available',
  },
];

/** Polska odmiana rzeczownika „temat”: 1 temat, 2–4 tematy, 5+ tematów. */
export function topicsWord(count: number): string {
  if (count === 1) return 'temat';
  const last = count % 10;
  const lastTwo = count % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'tematy';
  return 'tematów';
}

export const getModuleBySlug = (slug: string): HistModule | undefined =>
  HIST_MODULES.find((m) => m.slug === slug);

/** Statystyki pod hero — liczone z danych; mapowanie jednostka → lekcja jest 1:1. */
export const CURRICULUM_STATS = {
  modules: HIST_MODULES.length,
  topics: HIST_MODULES.reduce((sum, m) => sum + m.lessons.length, 0),
  onlineLessons: '33',
  hours: '~33',
};

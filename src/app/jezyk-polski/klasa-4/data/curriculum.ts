/**
 * Program kursu języka polskiego dla klasy 4 szkoły podstawowej.
 * Źródło zakresu i podziału na moduły: podstawa programowa z rozporządzenia MEN z 11 marca 2026 r., Dz.U. 2026 poz. 378,
 * załącznik nr 2; klasa 4 = część wymagań dla klas IV–VI według programów wydawców).
 *
 * To jedyne miejsce z treścią programu — hub `/jezyk-polski/klasa-4`, spis treści
 * i strony modułów renderują wyłącznie te dane. Program zmienia się najpierw
 * w programie, dopiero potem tutaj.
 */

/**
 * `available` = moduł ma **choć jedną opublikowaną lekcję**; `soon` = nie ma
 * w nim jeszcze niczego do kliknięcia. Przełączaj razem z pierwszą lekcją
 * modułu — od tego zależy kolor numeru i kłódka na półce kursu.
 */
export type ModuleStatus = 'available' | 'soon';

/** Do której części roku szkolnego należy moduł (harmonogram ~33 tygodni). */
export type ModuleTrack = 'start' | 'semestr-1' | 'semestr-2' | 'final';

export interface PolModule {
  /** Numer modułu z programu (0–12). */
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
  /** Tygodnie z harmonogramu rocznego, np. „2–4”; Pracownia lektury biegnie przez cały rok. */
  weeks: string;
  /** Kolor przewodni modułu (akcenty, numer, ramki). */
  color: string;
  /** Nazwa ikony z `@/components/ui/module-icon`. */
  icon: string;
  /** Ilustracja modułu (klucz `img()` / ścieżka w public/) — sunburst (E7b). */
  image?: string;
  /** Hasła tematów pokazywane jako chipy na kafelku. */
  highlights: string[];
  /** Jednostki tematyczne — jedna jednostka to jedna lekcja online. */
  lessons: string[];
  status: ModuleStatus;
}

export const POL_MODULES: PolModule[] = [
  {
    number: 0,
    slug: 'start',
    title: 'Start',
    goal: 'Zobaczyć, że słowa coś robią, i wybrać pierwszą książkę na rok.',
    intro:
      'Pierwsze spotkanie z mieszkańcami kamienicy przy Lipowej: to samo krótkie zdanie raz prosi, raz rozkazuje, raz rozśmiesza. Potem pierwsze strony sześciu książek bez okładek — wybierasz tę, którą chcesz czytać, i zakładasz swoją Półkę czytelnika.',
    track: 'start',
    hours: '2 h',
    weeks: '1',
    color: '#0e7490',
    icon: 'Compass',
    image: '/images/jezyk-polski/modul-00-start.jpg',
    highlights: ['słowa, które działają', 'nadawca i odbiorca', 'wybór książki', 'Półka czytelnika'],
    lessons: [
      'Język działa',
      'Ja czytelnik',
    ],
    status: 'available',
  },
  {
    number: 1,
    slug: 'komunikacja',
    title: 'Porozumiewanie się',
    goal: 'Mówić tak, żeby inni zrozumieli — i słuchać tak, żeby zrozumieć innych.',
    intro:
      'Ta sama sprawa powiedziana koledze, sąsiadce i dyrektorowi, twarz i ton, które odwracają znaczenie słów, słuchanie ze zrozumieniem i własne zdanie poparte powodem.',
    track: 'semestr-1',
    hours: '4 h',
    weeks: '2–4',
    color: '#2563eb',
    icon: 'ArrowLeftRight',
    image: '/images/jezyk-polski/modul-01-komunikacja.jpg',
    highlights: ['grzeczność językowa', 'mina, postawa i ton', 'słuchanie', 'argument'],
    lessons: [
      'Do kogo mówię?',
      'Twarz i ton',
      'Słucham uważnie',
      'Moje zdanie',
    ],
    status: 'available',
  },
  {
    number: 2,
    slug: 'ja-i-my',
    title: 'Ja i my',
    goal: 'Mówić o swoich uczuciach i potrzebach oraz zrozumieć, do jakich wspólnot należysz.',
    intro:
      'Komunikat „ja” zamiast wyrzutu, kręgi wspólnot — rodzina, klasa, kamienica, kraj — i dwa teksty pisane w pierwszej osobie liczby mnogiej: Mazurek Dąbrowskiego i „Rota”.',
    track: 'semestr-1',
    hours: '3 h',
    weeks: '5–7',
    color: '#dc2626',
    icon: 'Flag',
    image: '/images/jezyk-polski/modul-02-ja-i-my.jpg',
    highlights: ['emocje i potrzeby', 'wspólnoty', 'hymn i „Rota”'],
    lessons: [
      'Emocje i potrzeby',
      'Moje wspólnoty',
      'Mazurek i „Rota”',
    ],
    status: 'available',
  },
  {
    number: 3,
    slug: 'slowa',
    title: 'Słowa i znaczenia',
    goal: 'Wiedzieć, że znaczenie słowa zależy od zdania, i umieć szukać w słowniku.',
    intro:
      'Słowa wieloznaczne, szukanie w słowniku po alfabecie, zdrobnienia i zgrubienia, synonimy i antonimy oraz związki frazeologiczne, które znaczą coś innego niż każde słowo osobno.',
    track: 'semestr-1',
    hours: '3 h',
    weeks: '8–9',
    color: '#7c3aed',
    icon: 'Search',
    image: '/images/jezyk-polski/modul-03-slowa.jpg',
    highlights: ['słownik', 'wieloznaczność', 'synonimy i zdrobnienia', 'frazeologizmy'],
    lessons: [
      'Słownik',
      'Słowa mają kolor',
      'Frazeologizmy',
    ],
    status: 'available',
  },
  {
    number: 4,
    slug: 'czesci-mowy',
    title: 'Części mowy',
    goal: 'Rozpoznawać części mowy po tym, co robią w zdaniu i jak się odmieniają.',
    intro:
      'Wyrazy odmienne i nieodmienne, rzeczownik z rodzajem i liczbą, czasownik z czasem i osobą, przymiotnik i przysłówek, a na koniec małe słowa: przyimki, spójniki i zaimki.',
    track: 'semestr-1',
    hours: '5 h',
    weeks: '10–13',
    color: '#059669',
    icon: 'Blocks',
    image: '/images/jezyk-polski/modul-04-czesci-mowy.jpg',
    highlights: ['odmienne i nieodmienne', 'rzeczownik', 'czasownik', 'przymiotnik i przysłówek', 'przyimek i spójnik'],
    lessons: [
      'Odmienne i nieodmienne',
      'Rzeczownik',
      'Czasownik',
      'Przymiotnik i przysłówek',
      'Małe słowa',
    ],
    status: 'available',
  },
  {
    number: 5,
    slug: 'opowiesci',
    title: 'Opowieści',
    goal: 'Rozpoznać świat przedstawiony i zrozumieć, czym różnią się baśń, mit, przypowieść i legenda.',
    intro:
      'Miejsce, czas, bohaterowie, zdarzenia i narrator; baśń, mity greckie, przypowieści biblijne opowiedziane własnymi słowami i legenda wystawiona w papierowym teatrzyku.',
    track: 'semestr-1',
    hours: '5 h',
    weeks: '14–17',
    color: '#d97706',
    icon: 'Sparkles',
    image: '/images/jezyk-polski/modul-05-opowiesci.jpg',
    highlights: ['świat przedstawiony', 'baśń', 'mit', 'przypowieść', 'teatrzyk'],
    lessons: [
      'Świat przedstawiony',
      'Baśń',
      'Mity',
      'Przypowieści',
      'Teatrzyk z legendy',
    ],
    status: 'available',
  },
  {
    number: 6,
    slug: 'zdanie',
    title: 'Zdanie i znaki',
    goal: 'Budować zdania, które stoją, i stawiać znaki, które mówią, o co chodzi.',
    intro:
      'Podmiot i orzeczenie, kropka, pytajnik i wykrzyknik, zdania złożone z przecinkiem przed „ale”, „bo” i „że” oraz zapis dialogu z myślnikiem.',
    track: 'semestr-2',
    hours: '4 h',
    weeks: '18–20',
    color: '#4f46e5',
    icon: 'Workflow',
    image: '/images/jezyk-polski/modul-06-zdanie.jpg',
    highlights: ['podmiot i orzeczenie', 'znaki na końcu zdania', 'zdanie złożone', 'dialog'],
    lessons: [
      'Kręgosłup zdania',
      'Znaki na końcu zdania',
      'Zdania złożone',
      'Dialog',
    ],
    status: 'soon',
  },
  {
    number: 7,
    slug: 'ortografia',
    title: 'Ortografia',
    goal: 'Pisać poprawnie, bo znasz regułę — nie dlatego, że zgadujesz.',
    intro:
      'Głoski i litery, ó i rz wymienne, ż, ch i h w rodzinach wyrazów, pisownia „nie” z różnymi częściami mowy oraz korekta i dyktando z pamięci, w których każdy błąd dostaje regułę.',
    track: 'semestr-2',
    hours: '5 h',
    weeks: '21–24',
    color: '#be123c',
    icon: 'PenLine',
    image: '/images/jezyk-polski/modul-07-ortografia.jpg',
    highlights: ['głoski i litery', 'ó i rz', 'ż, ch, h', '„nie” z wyrazami', 'korekta i dyktando'],
    lessons: [
      'Głoski i litery',
      'Ó i rz',
      'Ż, ch i h',
      '„Nie” z wyrazami',
      'Korekta i dyktando',
    ],
    status: 'soon',
  },
  {
    number: 8,
    slug: 'poezja',
    title: 'Poezja',
    goal: 'Rozpoznać budowę wiersza i usłyszeć, jak dobór słów i głos zmieniają jego sens.',
    intro:
      'Wers, strofa, rym i rytm, epitet, porównanie i wyrazy dźwiękonaśladowcze, a na koniec wiersz czytany na głos według twojej własnej partytury.',
    track: 'semestr-2',
    hours: '3 h',
    weeks: '25–26',
    color: '#65a30d',
    icon: 'Leaf',
    image: '/images/jezyk-polski/modul-08-poezja.jpg',
    highlights: ['wers i rym', 'epitet i porównanie', 'czytanie na głos'],
    lessons: [
      'Wers, strofa, rym',
      'Epitet i porównanie',
      'Czytam na głos',
    ],
    status: 'soon',
  },
  {
    number: 9,
    slug: 'pisanie',
    title: 'Piszę',
    goal: 'Zaplanować tekst i napisać go w formie, której wymaga sytuacja.',
    intro:
      'Plan i notatka, list i zaproszenie, opis przedmiotu, po którym da się go rozpoznać, oraz opowiadanie z napięciem i dialogiem.',
    track: 'semestr-2',
    hours: '4 h',
    weeks: '27–29',
    color: '#0891b2',
    icon: 'FileText',
    image: '/images/jezyk-polski/modul-09-pisanie.jpg',
    highlights: ['plan i notatka', 'list', 'opis przedmiotu', 'opowiadanie'],
    lessons: [
      'Plan i notatka',
      'List i zaproszenie',
      'Opis przedmiotu',
      'Opowiadanie',
    ],
    status: 'soon',
  },
  {
    number: 10,
    slug: 'media',
    title: 'Media',
    goal: 'Odróżniać fakt od opinii i rozpoznawać chwyty, które mają na ciebie wpłynąć.',
    intro:
      'Fakt i opinia w wiadomości, język reklamy od środka i z perspektywy kupującego oraz to, ile naprawdę zostaje w głowie z przewijanego potoku.',
    track: 'semestr-2',
    hours: '3 h',
    weeks: '30–31',
    color: '#9333ea',
    icon: 'Target',
    image: '/images/jezyk-polski/modul-10-media.jpg',
    highlights: ['fakt i opinia', 'reklama', 'nadmiar informacji'],
    lessons: [
      'Fakt czy opinia',
      'Reklama',
      'Za dużo informacji',
    ],
    status: 'soon',
  },
  {
    number: 11,
    slug: 'pracownia-lektury',
    title: 'Pracownia lektury',
    goal: 'Pracować z przeczytanym tekstem: śledzić bohatera, opowiadać obrazem, czytać sztukę.',
    intro:
      'Mapa przeżyć bohatera, okładka, która nie zdradza zakończenia, spacer po wystawie obrazów i komiks z jednej sceny — na tekstach z Czytelni kursu, przez cały rok.',
    track: 'semestr-2',
    hours: '4 h',
    weeks: 'cały rok',
    color: '#c2410c',
    icon: 'Palette',
    image: '/images/jezyk-polski/modul-11-pracownia-lektury.jpg',
    highlights: ['mapa bohatera', 'okładka', 'wystawa', 'komiks'],
    lessons: [
      'Mapa bohatera',
      'Nowa okładka',
      'Wystawa online',
      'Komiks z lektury',
    ],
    status: 'soon',
  },
  {
    number: 12,
    slug: 'podsumowanie',
    title: 'Podsumowanie',
    goal: 'Zebrać rok w całość: polecić książkę, złożyć własną książeczkę i sprawdzić, co zostało.',
    intro:
      'Polecenie książki dopasowane do czytelnika, książeczka złożona z tekstów napisanych przez rok i test końcowy z zadaniami do wykonania, a nie do zgadywania.',
    track: 'final',
    hours: '3 h',
    weeks: '32–33',
    color: '#475569',
    icon: 'Trophy',
    image: '/images/jezyk-polski/modul-12-podsumowanie.jpg',
    highlights: ['polecam', 'moja książeczka', 'test końcowy'],
    lessons: [
      'Polecam',
      'Moja książeczka',
      'Test końcowy',
    ],
    status: 'soon',
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

export const getModuleBySlug = (slug: string): PolModule | undefined =>
  POL_MODULES.find((m) => m.slug === slug);

/** Statystyki pod hero — liczone z danych; mapowanie jednostka → lekcja jest 1:1. */
export const CURRICULUM_STATS = {
  modules: POL_MODULES.length,
  topics: POL_MODULES.reduce((sum, m) => sum + m.lessons.length, 0),
  onlineLessons: '48',
  hours: '~48',
};

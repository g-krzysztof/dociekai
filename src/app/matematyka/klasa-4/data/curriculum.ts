/**
 * Program kursu matematyki dla klasy 4 szkoły podstawowej.
 * Zakres i podział na moduły: podstawa programowa MEiN + rozkłady materiału GWO / Nowa Era.
 *
 * To jedyne miejsce z treścią programu — hub kursu `/matematyka/klasa-4`
 * i podstrony modułów renderują wyłącznie te dane.
 */

export type ModuleStatus = 'available' | 'soon';

/** Do której części roku szkolnego należy moduł (harmonogram 32-tygodniowy). */
export type ModuleTrack = 'start' | 'semestr-1' | 'semestr-2' | 'final';

export interface MathModule {
  /** Numer modułu z programu (0–9). */
  number: number;
  slug: string;
  title: string;
  /** Cel modułu — jedno zdanie na kafelek. */
  goal: string;
  /** Dłuższy opis na podstronie modułu. */
  intro: string;
  track: ModuleTrack;
  /** Orientacyjny wymiar godzin, np. „20–23 h”. */
  hours: string;
  /** Tygodnie z harmonogramu rocznego, np. „2–7”. */
  weeks: string;
  /** Kolor przewodni modułu (glow ramki, akcenty). */
  color: string;
  /** Nazwa ikony z lucide-react. */
  icon: string;
  /** Ilustracja modułu (ścieżka w public/). */
  image: string;
  /** Hasła tematów pokazywane jako chipy na kafelku. */
  highlights: string[];
  /** Pełna lista lekcji modułu. */
  lessons: string[];
  status: ModuleStatus;
}

export const MATH_MODULES: MathModule[] = [
  {
    number: 0,
    slug: 'start',
    title: 'Start kursu',
    goal: 'Zanim ruszysz: naucz się uczyć i sprawdź, co już umiesz.',
    intro:
      'Krótki moduł otwierający. Pokazujemy, jak organizować naukę matematyki i jak pracować z błędami, a test diagnostyczny sprawdza wiedzę z klas I–III — dzięki temu wiadomo, które tematy warto powtórzyć przed startem.',
    track: 'start',
    hours: '1–2 lekcje',
    weeks: '1',
    color: '#6366f1',
    icon: 'Compass',
    image: '/images/matematyka/modul-00-start.jpg',
    highlights: ['jak się uczyć', 'praca z błędami', 'test diagnostyczny'],
    lessons: [
      'Jak się uczyć matematyki — organizacja nauki, notatki, poprawa błędów',
      'Test diagnostyczny — wiadomości z klas I–III (działania w zakresie 1000, tabliczka mnożenia, podstawy geometrii, godziny, pieniądze)',
    ],
    status: 'available',
  },
  {
    number: 1,
    slug: 'liczby-naturalne',
    title: 'Liczby naturalne i działania w pamięci',
    goal: 'Sprawność rachunkowa, rozumienie systemu dziesiątkowego i duże liczby.',
    intro:
      'Największy moduł kursu i fundament całego roku. Od zapisu dużych liczb i osi liczbowej, przez własności działań i tabliczkę mnożenia, po dzielenie z resztą, cechy podzielności, kolejność działań i szacowanie wyników.',
    track: 'semestr-1',
    hours: '20–23 h',
    weeks: '2–7',
    color: '#2563eb',
    icon: 'Hash',
    image: '/images/matematyka/modul-01-liczby-naturalne.jpg',
    highlights: ['oś liczbowa', 'dzielenie z resztą', 'cechy podzielności', 'szacowanie'],
    lessons: [
      'Zapisywanie i odczytywanie dużych liczb (rzędy wielkości, klasy: jedności, tysiące, miliony)',
      'Oś liczbowa — zaznaczanie i odczytywanie liczb',
      'Porównywanie liczb naturalnych',
      'Dodawanie i odejmowanie w pamięci — sposoby ułatwiające obliczenia',
      'Przemienność i łączność dodawania i mnożenia, rozdzielność mnożenia względem dodawania',
      'Mnożenie i dzielenie w pamięci, tabliczka mnożenia — utrwalenie',
      'Mnożenie i dzielenie przez 10, 100, 1000',
      'Dzielenie z resztą',
      'Kwadraty i sześciany liczb naturalnych',
      'Cechy podzielności przez 2, 3, 4, 5, 9, 10, 100',
      'Kolejność wykonywania działań (z nawiasami)',
      'Szacowanie wyników działań',
      'Zadania tekstowe — czytanie ze zrozumieniem i strategie rozwiązywania',
      'Powtórzenie i sprawdzian modułowy',
    ],
    status: 'available',
  },
  {
    number: 2,
    slug: 'obliczenia-praktyczne',
    title: 'System zapisu liczb i obliczenia praktyczne',
    goal: 'Liczby w codziennym życiu: pieniądze, czas, kalendarz, jednostki.',
    intro:
      'Moduł najbliższy codzienności. Uczymy się systemu rzymskiego, liczenia pieniędzy, zamiany jednostek długości i masy oraz obliczeń zegarowych i kalendarzowych — wszystkiego, co dziecko wykorzysta poza lekcją.',
    track: 'semestr-1',
    hours: '15–18 h',
    weeks: '8–11',
    color: '#0891b2',
    icon: 'Coins',
    image: '/images/matematyka/modul-02-obliczenia-praktyczne.jpg',
    highlights: ['system rzymski', 'pieniądze', 'zegar i kalendarz', 'jednostki'],
    lessons: [
      'System rzymski (do 3000) — zamiana w obie strony',
      'Jednostki monetarne — złote i grosze, obliczenia pieniężne',
      'Jednostki długości: mm, cm, dm, m, km — zamiana i stosowanie',
      'Jednostki masy: g, dag, kg, tona',
      'Obliczenia zegarowe — godziny, minuty, sekundy, upływ czasu',
      'Obliczenia kalendarzowe — dni, tygodnie, miesiące, lata zwykłe i przestępne',
      'Powtórzenie i sprawdzian modułowy',
    ],
    status: 'available',
  },
  {
    number: 3,
    slug: 'dzialania-pisemne',
    title: 'Działania pisemne',
    goal: 'Algorytmy pisemne jako baza pod ułamki i algebrę.',
    intro:
      'Cztery działania w słupku — od dodawania i odejmowania z pożyczaniem, przez mnożenie przez liczby wielocyfrowe, po wprowadzenie dzielenia pisemnego. To umiejętności, na których opiera się cała dalsza matematyka.',
    track: 'semestr-1',
    hours: '12–17 h',
    weeks: '12–15',
    color: '#7c3aed',
    icon: 'PenLine',
    image: '/images/matematyka/modul-03-dzialania-pisemne.jpg',
    highlights: ['dodawanie w słupku', 'pożyczanie', 'mnożenie pisemne', 'dzielenie pisemne'],
    lessons: [
      'Dodawanie pisemne liczb wielocyfrowych',
      'Odejmowanie pisemne — z przekraczaniem progu i „pożyczaniem” od zer',
      'Mnożenie pisemne przez liczbę jednocyfrową',
      'Mnożenie pisemne przez liczbę wielocyfrową',
      'Mnożenie liczb zakończonych zerami — usprawnienia',
      'Dzielenie pisemne przez liczbę jednocyfrową (wprowadzenie)',
      'Zadania tekstowe z działaniami pisemnymi',
      'Powtórzenie i sprawdzian modułowy',
    ],
    status: 'available',
  },
  {
    number: 4,
    slug: 'geometria',
    title: 'Podstawy geometrii: figury, kąty, symetria',
    goal: 'Język geometrii, rysowanie z przyborami i pierwsze obliczenia.',
    intro:
      'Wchodzimy w geometrię z linijką, ekierką i kątomierzem w ręku. Proste i odcinki, kąty i ich rodzaje, wielokąty, obwody, koła i okręgi, symetria osiowa oraz skala — czyli czytanie planu i mapy.',
    track: 'semestr-2',
    hours: '20–26 h',
    weeks: '16–21',
    color: '#16a34a',
    icon: 'Shapes',
    image: '/images/matematyka/modul-04-geometria.jpg',
    highlights: ['kąty i kątomierz', 'wielokąty', 'obwody', 'symetria', 'skala'],
    lessons: [
      'Punkt, prosta, półprosta, odcinek',
      'Proste i odcinki prostopadłe i równoległe — rysowanie ekierką i linijką',
      'Mierzenie odcinków z dokładnością do 1 mm',
      'Kąty — ramiona, wierzchołek, mierzenie kątomierzem',
      'Rodzaje kątów: prosty, ostry, rozwarty; kąty wierzchołkowe i przyległe',
      'Wielokąty — rozpoznawanie i nazywanie',
      'Prostokąty i kwadraty — własności i rysowanie',
      'Obwody wielokątów, prostokątów i kwadratów',
      'Koła i okręgi — środek, promień, średnica, cięciwa',
      'Figury osiowosymetryczne — oś symetrii',
      'Skala — długość rzeczywista i w skali, czytanie planu i mapy',
      'Rysunek pomocniczy jako strategia rozwiązywania zadań',
      'Układanie własnych zadań i łamigłówek',
      'Powtórzenie i sprawdzian modułowy',
    ],
    status: 'available',
  },
  {
    number: 5,
    slug: 'ulamki-zwykle',
    title: 'Ułamki zwykłe',
    goal: 'Ułamek jako część całości i jako iloraz — fundament pod klasy 5–6.',
    intro:
      'Ułamki wprowadzamy na konkretach: częściach pizzy, paskach, osi liczbowej. Skracanie i rozszerzanie, liczby mieszane, dodawanie i odejmowanie przy jednakowych mianownikach oraz mnożenie ułamka przez liczbę naturalną.',
    track: 'semestr-2',
    hours: '12–23 h',
    weeks: '22–26',
    color: '#ea580c',
    icon: 'PieChart',
    image: '/images/matematyka/modul-05-ulamki-zwykle.jpg',
    highlights: ['licznik i mianownik', 'skracanie', 'liczby mieszane', 'ułamki na osi'],
    lessons: [
      'Ułamek jako część całości — licznik i mianownik',
      'Ułamki na osi liczbowej',
      'Porównywanie ułamków o tych samych licznikach lub mianownikach',
      'Rozszerzanie i skracanie ułamków',
      'Liczby mieszane — zamiana ułamek niewłaściwy ↔ liczba mieszana',
      'Ułamek jako wynik dzielenia',
      'Dodawanie i odejmowanie ułamków o jednakowych mianownikach',
      'Mnożenie ułamka przez liczbę naturalną',
      'Zadania tekstowe z ułamkami',
      'Powtórzenie i sprawdzian modułowy',
    ],
    status: 'available',
  },
  {
    number: 6,
    slug: 'ulamki-dziesietne',
    title: 'Ułamki dziesiętne',
    goal: 'Powiązanie ułamków z zapisem pieniędzy, jednostek i pomiarów.',
    intro:
      'Od zapisu i odczytu ułamka dziesiętnego, przez wyrażenia dwumianowane (3 m 25 cm = 3,25 m), po dodawanie, odejmowanie i mnożenie przez 10, 100, 1000. Naturalne przedłużenie modułu o pieniądzach i jednostkach.',
    track: 'semestr-2',
    hours: '12–19 h',
    weeks: '27–30',
    color: '#d64c29',
    icon: 'Percent',
    image: '/images/matematyka/modul-06-ulamki-dziesietne.jpg',
    highlights: ['zapis dziesiętny', 'wyrażenia dwumianowane', 'porównywanie', 'działania'],
    lessons: [
      'Ułamek dziesiętny — zapis i odczyt, mianowniki 10, 100, 1000',
      'Zapisywanie wyrażeń dwumianowanych jako ułamek dziesiętny',
      'Zamiana ułamek zwykły ↔ ułamek dziesiętny (proste przypadki)',
      'Porównywanie ułamków dziesiętnych',
      'Dodawanie ułamków dziesiętnych — pamięciowo i pisemnie',
      'Odejmowanie ułamków dziesiętnych',
      'Mnożenie i dzielenie ułamków dziesiętnych przez 10, 100, 1000',
      'Powtórzenie i sprawdzian modułowy',
    ],
    status: 'available',
  },
  {
    number: 7,
    slug: 'pola-figur',
    title: 'Pola figur',
    goal: 'Pole jako liczba kwadratów jednostkowych — od intuicji do wzoru.',
    intro:
      'Pole wprowadzamy przez układanie kwadratów jednostkowych, dopiero potem pojawia się wzór na pole prostokąta i kwadratu. Do tego jednostki pola oraz liczenie pól figur metodą podziału i uzupełniania.',
    track: 'semestr-2',
    hours: '8–10 h',
    weeks: '31',
    color: '#db2777',
    icon: 'Grid3x3',
    image: '/images/matematyka/modul-07-pola-figur.jpg',
    highlights: ['kwadrat jednostkowy', 'jednostki pola', 'pole prostokąta', 'ar i hektar'],
    lessons: [
      'Pojęcie pola figury — porównywanie za pomocą kwadratów jednostkowych',
      'Jednostki pola: mm², cm², dm², m², km², ar, hektar',
      'Pole prostokąta i kwadratu',
      'Pola figur metodą podziału i uzupełniania',
      'Powtórzenie i sprawdzian modułowy',
    ],
    status: 'available',
  },
  {
    number: 8,
    slug: 'bryly',
    title: 'Bryły: prostopadłościany i sześciany',
    goal: 'Przejście z płaszczyzny w przestrzeń — siatki, objętość, pole powierzchni.',
    intro:
      'Pracujemy na modelach i siatkach: opis prostopadłościanu, rozpoznawanie brył, rysowanie siatek, pojęcie objętości wraz z jednostkami oraz wprowadzenie pola powierzchni.',
    track: 'semestr-2',
    hours: '7–10 h',
    weeks: '32',
    color: '#0d9488',
    icon: 'Box',
    image: '/images/matematyka/modul-08-bryly.jpg',
    highlights: ['ściany i krawędzie', 'siatki brył', 'objętość', 'pole powierzchni'],
    lessons: [
      'Opis prostopadłościanu — ściany, krawędzie, wierzchołki',
      'Rozpoznawanie brył: graniastosłupy, ostrosłupy, walec, stożek, kula',
      'Siatki prostopadłościanów — rozpoznawanie i rysowanie',
      'Objętość — pojęcie i jednostki (mililitr, litr, cm³, dm³, m³), objętość prostopadłościanu',
      'Pole powierzchni prostopadłościanu (wprowadzenie)',
      'Powtórzenie i sprawdzian modułowy',
    ],
    status: 'available',
  },
  {
    number: 9,
    slug: 'podsumowanie',
    title: 'Podsumowanie roku',
    goal: 'Wielkie powtórzenie i brama do klasy 5.',
    intro:
      'Przekrojowe powtórzenie ze wszystkich działów, test końcowy pełniący rolę diagnozy na wejście do klasy 5 oraz zapowiedź tematów, które czekają w kolejnym roku.',
    track: 'final',
    hours: '2–4 h',
    weeks: 'koniec roku',
    color: '#eab308',
    icon: 'Trophy',
    image: '/images/matematyka/modul-09-podsumowanie.jpg',
    highlights: ['powtórzenie przekrojowe', 'test końcowy', 'zapowiedź klasy 5'],
    lessons: [
      'Duże powtórzenie przekrojowe — zadania ze wszystkich działów',
      'Test końcowy i diagnoza na wejście do klasy 5',
      '„Co dalej” — zapowiedź tematów klasy 5',
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

export const getModuleBySlug = (slug: string): MathModule | undefined =>
  MATH_MODULES.find((m) => m.slug === slug);

export const getModulesByTrack = (track: ModuleTrack): MathModule[] =>
  MATH_MODULES.filter((m) => m.track === track);

/**
 * Statystyki na pasek pod hero — liczone z danych, nie wpisane ręcznie.
 * `topics` to jednostki tematyczne; wg programu 1 lekcja online obejmuje 1–3 z nich,
 * stąd osobna, mniejsza liczba lekcji.
 */
export const CURRICULUM_STATS = {
  modules: MATH_MODULES.length,
  topics: MATH_MODULES.reduce((sum, m) => sum + m.lessons.length, 0),
  onlineLessons: '~65',
  hours: '~130',
};

/** Szablon pojedynczej lekcji online. */
export const LESSON_TEMPLATE = [
  {
    step: 1,
    title: 'Rozgrzewka',
    time: '3–5 min',
    description: 'Krótkie przypomnienie poprzedniej lekcji.',
    icon: 'Sparkles',
  },
  {
    step: 2,
    title: 'Nowe pojęcie',
    time: '5–10 min',
    description: 'Wprowadzenie na konkretnym przykładzie lub animacji.',
    icon: 'Lightbulb',
  },
  {
    step: 3,
    title: 'Przykłady',
    time: '10 min',
    description: 'Zadania rozwiązane krok po kroku.',
    icon: 'ListChecks',
  },
  {
    step: 4,
    title: 'Ćwiczenia',
    time: '10–15 min',
    description: 'Interaktywne zadania o rosnącej trudności.',
    icon: 'Target',
  },
  {
    step: 5,
    title: 'Zadanie problemowe',
    time: '5–10 min',
    description: 'Zadanie tekstowe podsumowujące temat.',
    icon: 'Puzzle',
  },
  {
    step: 6,
    title: 'Quiz',
    time: 'na koniec',
    description: 'Sprawdzenie wiedzy z informacją zwrotną.',
    icon: 'CheckCircle2',
  },
];

/** Poziomy trudności zadań (K/P/R/D) używane w ćwiczeniach. */
export const DIFFICULTY_LEVELS = [
  { code: 'K', name: 'Konieczne', description: 'Absolutne podstawy — każdy musi je opanować.' },
  { code: 'P', name: 'Podstawowe', description: 'Typowe zadania szkolne i klasówkowe.' },
  { code: 'R', name: 'Rozszerzające', description: 'Trudniejsze warianty dla chętnych.' },
  { code: 'D', name: 'Dopełniające', description: 'Zadania problemowe i łamigłówki.' },
];

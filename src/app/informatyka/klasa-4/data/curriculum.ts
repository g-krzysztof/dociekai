/**
 * Program kursu informatyki dla klasy 4 szkoły podstawowej.
 * Źródło zakresu i podziału na moduły: podstawa programowa z rozporządzenia MEN z 11 marca 2026 r., Dz.U. 2026 poz. 378,
 * obowiązująca w klasie IV od 1 września 2026 r.).
 *
 * To jedyne miejsce z treścią programu — hub kursu `/informatyka/klasa-4`
 * i podstrony modułów renderują wyłącznie te dane.
 *
 * Odsyłacze `[3.3]`, `[5.2]` w opisach modułów to numery wymagań szczegółowych
 * dla klas IV–VI; ich dosłowne brzmienie jest w podstawie programowej.
 */

/**
 * `available` = dział jest otwarty, bo ma **choć jedną opublikowaną lekcję**;
 * reszta lekcji może być jeszcze `soon` i widać to przy każdej z osobna.
 * `soon` = w dziale nie ma na razie niczego do kliknięcia.
 *
 * Przełączaj to razem z pierwszą opublikowaną lekcją działu: na półce kursu od
 * tego zależy kolor numeru i kłódka, więc dział z klikalną lekcją i kłódką po
 * prostu kłamie.
 */
export type ModuleStatus = 'available' | 'soon';

/** Do której części roku szkolnego należy moduł (harmonogram 35-tygodniowy). */
export type ModuleTrack = 'start' | 'semestr-1' | 'semestr-2' | 'final';

export interface InfoModule {
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
  /** Nazwa ikony z lucide-react. */
  icon: string;
  /**
   * Ilustracja modułu (klucz `img()` / ścieżka w public/). Opcjonalna, bo kurs
   * dostaje własny język wizualny, odrębny od matematyki — obrazy dochodzą po
   * ustaleniu stylu, a strony renderują się poprawnie bez nich.
   */
  image?: string;
  /** Hasła tematów pokazywane jako chipy na kafelku. */
  highlights: string[];
  /** Pełna lista jednostek tematycznych modułu. */
  lessons: string[];
  status: ModuleStatus;
}

export const INFO_MODULES: InfoModule[] = [
  {
    number: 0,
    slug: 'start',
    title: 'Start kursu',
    goal: 'Zanim usiądziesz do pracy: jak uczyć się informatyki i jak nie zrobić sobie krzywdy przy komputerze.',
    intro:
      'Krótki moduł otwierający. Pokazujemy, jak pracować z kursem i jak wygląda higiena pracy przy komputerze, a test diagnostyczny sprawdza, co dziecko już potrafi — dzięki temu wiadomo, od czego naprawdę zacząć.',
    track: 'start',
    hours: '2 h',
    weeks: '1',
    color: '#6366f1',
    icon: 'Compass',
    highlights: ['praca z kursem', 'BHP i higiena', 'test diagnostyczny'],
    lessons: [
      'Jak korzystać z kursu informatyki — organizacja pracy, BHP i higiena pracy przy komputerze',
      'Test diagnostyczny — mysz i klawiatura, uruchamianie programów, zapis pliku, bezpieczeństwo w sieci',
    ],
    status: 'available',
  },
  {
    number: 1,
    slug: 'komputer-i-pliki',
    title: 'Komputer, pliki i chmura',
    goal: 'Świadomie korzystać ze sprzętu i nie zgubić własnej pracy.',
    intro:
      'Od liczydła do smartfona: skąd wziął się komputer, z czego się składa i jak zapisuje dane. Moduł kończy się umiejętnością, bez której reszta kursu nie ma sensu — porządkowaniem własnych plików i świadomym zapisem, lokalnie oraz w chmurze.',
    track: 'semestr-1',
    hours: '4 h',
    weeks: '2–5',
    color: '#0891b2',
    icon: 'HardDrive',
    highlights: ['historia komputera', 'nośniki i jednostki', 'licencje', 'pliki i chmura'],
    lessons: [
      'Od liczydła do komputera — krótka historia maszyn liczących',
      'Zestaw komputerowy w praktyce — urządzenia wejścia i wyjścia, celowe i bezpieczne korzystanie',
      'Pamięci i nośniki danych — bit, bajt, KB, MB, GB, TB; od dyskietki po chmurę',
      'Programy i ich zastosowania; program płatny, darmowy i open source — zasady licencji',
      'Pliki i foldery — porządkowanie pracy, zapis lokalnie i w chmurze',
    ],
    status: 'available',
  },
  {
    number: 2,
    slug: 'internet-i-bezpieczenstwo',
    title: 'Internet, bezpieczeństwo i dane',
    goal: 'Znaleźć wiarygodną informację, obronić się przed zagrożeniem i wiedzieć, gdzie szukać pomocy.',
    intro:
      'Najważniejszy moduł kursu z punktu widzenia rodzica. Uczymy szukać i sprawdzać informacje, rozpoznawać podejrzane treści, chronić dane osobowe i reagować na zagrożenia — łącznie z gotową listą numerów i osób, do których dziecko może się zwrócić.',
    track: 'semestr-1',
    hours: '5 h',
    weeks: '6–10',
    color: '#2563eb',
    icon: 'Globe',
    highlights: ['ocena informacji', 'podejrzane treści', 'dane osobowe', 'gdzie szukać pomocy'],
    lessons: [
      'Jak działa sieć — przeglądarka a wyszukiwarka, adres strony, komunikacja i dostęp do informacji',
      'Skuteczne wyszukiwanie i krytyczna ocena informacji; rozpoznawanie podejrzanych treści on-line',
      'Dane osobowe i prywatność — mocne hasła, podstawowe ustawienia prywatności',
      'Zagrożenia cyfrowe i wsparcie — cyberprzemoc, wyłudzanie, sposoby reagowania i gdzie szukać pomocy',
      'Netykieta i poczta elektroniczna — adres, temat, treść, załącznik, regulaminy platform',
      'Cudze materiały — prawo autorskie, podawanie źródeł, legalne zasoby',
    ],
    status: 'available',
  },
  {
    number: 3,
    slug: 'grafika',
    title: 'Grafika komputerowa',
    goal: 'Stworzyć i poprawić ilustrację — świadomie, a nie przez przypadek.',
    intro:
      'Praca w edytorze grafiki od narzędzi po gotowy obraz z napisem. Kluczowa myśl modułu: powtarzalne elementy rysuje się raz, a resztę robi kopiowaniem i obrotem — to samo myślenie wróci w module o programowaniu.',
    track: 'semestr-1',
    hours: '4 h',
    weeks: '11–14',
    color: '#7c3aed',
    icon: 'Palette',
    highlights: ['narzędzia i figury', 'kopiowanie i obrót', 'rozmiar i napisy', 'formaty plików'],
    lessons: [
      'Edytor grafiki — narzędzia, kolory, figury i linie, praca na powiększeniu',
      'Zaznaczanie fragmentu — kopiowanie, wklejanie, obracanie i odbicie lustrzane',
      'Rozmiar obrazu i płótna, piksel jako jednostka, napisy na obrazie',
      'Zapis grafiki — formaty i jakość; kartka okolicznościowa wysłana e-mailem',
    ],
    status: 'available',
  },
  {
    number: 4,
    slug: 'dokumenty-tekstowe',
    title: 'Dokumenty tekstowe',
    goal: 'Napisać i sformatować dokument tak, żeby dobrze się go czytało.',
    intro:
      'Edytor tekstu od zasad pisania po dokument z ilustracją i tabelą. Formatowanie traktujemy jako narzędzie czytelności, nie ozdobnik — dziecko ma wiedzieć, po co pogrubia, a nie tylko jak.',
    track: 'semestr-2',
    hours: '4 h',
    weeks: '15–18',
    color: '#0d9488',
    icon: 'FileText',
    highlights: ['kroje czcionki', 'akapity i listy', 'śródtytuły', 'ilustracja i tabela'],
    lessons: [
      'Zasady pisania tekstu; kroje czcionki i ich formatowanie',
      'Akapity, wyrównanie, listy wypunktowane i numerowane',
      'Podział tekstu na części — tytuł, śródtytuły, wyróżnianie kolorem',
      'Dokument rozbudowany o ilustrację i tabelę; sprawdzanie pisowni, zapis i udostępnienie',
    ],
    status: 'available',
  },
  {
    number: 5,
    slug: 'myslenie-komputacyjne',
    title: 'Myślenie komputacyjne',
    goal: 'Rozłożyć problem na kroki, zanim usiądziesz do programowania.',
    intro:
      'Dwie lekcje bez pisania kodu, za to z myśleniem, które kod poprzedza: porządkowanie obiektów, szukanie elementu o zadanych cechach i planowanie zachowania robota zmierzającego do celu.',
    track: 'semestr-2',
    hours: '2 h',
    weeks: '19–20',
    color: '#ea580c',
    icon: 'Workflow',
    highlights: ['kolejność liniowa', 'szukanie elementu', 'plan dla robota'],
    lessons: [
      'Porządkowanie i szukanie — kolejność liniowa, znajdowanie elementów o podanych własnościach',
      'Podejście komputacyjne do problemu z otoczenia i planowanie zachowania robota',
    ],
    status: 'available',
  },
  {
    number: 6,
    slug: 'programowanie-scratch',
    title: 'Programowanie w Scratch',
    goal: 'Zaprojektować program, znaleźć w nim błąd i wytłumaczyć, jak działa.',
    intro:
      'Największy moduł kursu. Od pierwszego skryptu, przez własnego duszka, zdarzenia i pętle, po sterowanie robotem na ekranie. Debugowanie nie jest tu dodatkiem — to osobna umiejętność, której uczymy wprost.',
    track: 'semestr-2',
    hours: '6 h',
    weeks: '21–26',
    color: '#f59e0b',
    icon: 'Blocks',
    highlights: ['własny duszek', 'zdarzenia', 'pętle i warunki', 'debugowanie'],
    lessons: [
      'Scena, duszki i bloki — pierwszy skrypt, uruchamianie i zatrzymywanie',
      'Edytor duszków, ruch i układ współrzędnych sceny, styl obrotu',
      'Zdarzenia i komunikaty — po kolei czy jednocześnie',
      'Powtarzanie i warunki — pętle, animacja, reagowanie na klawisze',
      'Sterowanie robotem na ekranie (albo fizycznym, jeśli jest dostępny)',
      'Testowanie i poprawianie programu — szukanie błędu, objaśnianie własnego rozwiązania',
    ],
    status: 'available',
  },
  {
    number: 7,
    slug: 'dane-i-ai',
    title: 'Dane, multimedia i sztuczna inteligencja',
    goal: 'Pokazać dane, opowiedzieć nimi historię i zrozumieć, skąd AI bierze swoje odpowiedzi.',
    intro:
      'Nowość reformy 2026. Obok arkusza, prezentacji i multimediów pojawia się sztuczna inteligencja — nie jako magia, tylko jako narzędzie, które uczy się z danych. Dziecko samo trenuje prosty model i sprawdza, jak zmiana danych zmienia wynik.',
    track: 'semestr-2',
    hours: '4 h',
    weeks: '27–30',
    color: '#db2777',
    icon: 'Sparkles',
    highlights: ['arkusz i wykres', 'prezentacja', 'multimedia', 'trening modelu AI'],
    lessons: [
      'Pierwsze kroki w arkuszu kalkulacyjnym — tabela, proste obliczenie, wykres, wniosek z danych',
      'Prezentacja na wybrany temat i dla wybranego odbiorcy',
      'Materiały multimedialne — połączenie tekstu, obrazu i prostej animacji',
      'Sztuczna inteligencja — tworzenie treści prostymi narzędziami i trening własnego modelu',
    ],
    status: 'available',
  },
  {
    number: 8,
    slug: 'technologia-i-projekt',
    title: 'Technologia, środowisko i projekt roczny',
    goal: 'Zobaczyć skutki własnych decyzji technologicznych i zbudować coś od początku do końca.',
    intro:
      'Moduł domykający rok pracą własną. Najpierw wpływ technologii na środowisko i współpraca w narzędziach cyfrowych, potem projekt roczny — własny quiz albo gra, przetestowana przez inne osoby i poprawiona po ich uwagach.',
    track: 'final',
    hours: '3 h',
    weeks: '31–33',
    color: '#16a34a',
    icon: 'Leaf',
    highlights: ['zużycie energii', 'współpraca', 'projekt roczny'],
    lessons: [
      'Wpływ technologii na środowisko — zużycie energii i zasady jej oszczędzania',
      'Współpraca w narzędziach cyfrowych — wspólny dokument, podział zadań',
      'Projekt roczny — własny quiz albo gra: od pomysłu przez testy u innych do poprawek',
    ],
    status: 'available',
  },
  {
    number: 9,
    slug: 'podsumowanie',
    title: 'Podsumowanie roku',
    goal: 'Zebrać rok w całość i sprawdzić, co naprawdę zostało.',
    intro:
      'Powtórzenie przekrojowe przez wszystkie moduły i test końcowy, a na koniec zapowiedź tego, co czeka w klasie 5.',
    track: 'final',
    hours: '2 h',
    weeks: '34–35',
    color: '#475569',
    icon: 'Trophy',
    highlights: ['powtórzenie przekrojowe', 'test końcowy', 'co dalej'],
    lessons: [
      'Powtórzenie przekrojowe — cały rok w jednym miejscu',
      'Test końcowy i „Co dalej” — zapowiedź tematów klasy 5',
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

export const getModuleBySlug = (slug: string): InfoModule | undefined =>
  INFO_MODULES.find((m) => m.slug === slug);

export const getModulesByTrack = (track: ModuleTrack): InfoModule[] =>
  INFO_MODULES.filter((m) => m.track === track);

/**
 * Statystyki na pasek pod hero — liczone z danych, nie wpisane ręcznie.
 *
 * W odróżnieniu od matematyki (gdzie jedna lekcja online obejmuje 1–3 jednostki
 * tematyczne) w informatyce jednostki są już wielkości pojedynczej lekcji, więc
 * mapowanie jest 1:1 — `topics` równa się liczbie lekcji online.
 */
export const CURRICULUM_STATS = {
  modules: INFO_MODULES.length,
  topics: INFO_MODULES.reduce((sum, m) => sum + m.lessons.length, 0),
  onlineLessons: '38',
  hours: '~35',
};

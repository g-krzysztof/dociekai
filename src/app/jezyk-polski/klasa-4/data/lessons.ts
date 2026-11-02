/**
 * Rejestr lekcji online kursu języka polskiego klasy 4.
 *
 * Mapowanie jest 1:1 — jedna jednostka tematyczna z `PolModule.lessons` to
 * jedna lekcja online.
 *
 * Dodanie lekcji: przełącz `status` na `'available'`, dodaj komponent w
 * `components/lessons/<slug>/` i jedną linię w mapie `LESSON_COMPONENTS`
 * w `[modul]/[lekcja]/page.tsx`; moduł przełącz na `available` razem z jego
 * pierwszą lekcją.
 */

import { POL_MODULES } from './curriculum';

export type LessonStatus = 'available' | 'soon';

/**
 * `lekcja`       — lekcja o kształcie podyktowanym tematem (paleta bloków).
 * `podsumowanie` — test końcowy (ostatnia pozycja modułu 12).
 */
export type LessonKind = 'lekcja' | 'podsumowanie';

/** Ciekawostka-nagroda po ukończeniu 100% lekcji — prawdziwa, ze źródłem. */
export interface LessonFunFact {
  title: string;
  /** 2–4 zdania, wprost do dziecka. */
  text: string;
  sourceLabel: string;
  sourceUrl?: string;
}

export interface PolLesson {
  /** Slug modułu z curriculum.ts. */
  moduleSlug: string;
  slug: string;
  kind: LessonKind;
  /** Numer lekcji w obrębie modułu (1-based). */
  number: number;
  title: string;
  /** Krótszy tytuł do nawigacji i kafelków. */
  short: string;
  /** Jedno zdanie do dziecka: po co ta lekcja. */
  goal: string;
  /** Opis pod SEO/OG (tor dorosły). */
  description: string;
  /** Orientacyjny czas, np. „20–25 min”. */
  duration: string;
  /** Indeksy jednostek tematycznych z `PolModule.lessons`, które lekcja pokrywa. */
  topics: number[];
  status: LessonStatus;
  /**
   * Lekcja, w której dźwięk jest treścią (słuchanie, ton głosu) — spis pokazuje
   * znacznik słuchawek. Zasada: test głośnika.
   */
  sound?: boolean;
  funFact?: LessonFunFact;
}

export const POL_LESSONS: PolLesson[] = [
  // ─── start ───
  {
    moduleSlug: 'start',
    slug: 'jezyk-dziala',
    kind: 'lekcja',
    number: 1,
    title: 'Język działa — nadawca, odbiorca i intencja',
    short: 'Język działa',
    goal: 'Zobacz, że słowa nie tylko coś znaczą, ale też coś robią — i od czego to zależy.',
    description:
      'Lekcja języka polskiego dla klasy 4: nadawca, odbiorca i intencja wypowiedzi: to samo zdanie wypowiedziane różnie do różnych osób.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
  },
  {
    moduleSlug: 'start',
    slug: 'ja-czytelnik',
    kind: 'lekcja',
    number: 2,
    title: 'Ja czytelnik — jak wybrać książkę',
    short: 'Ja czytelnik',
    goal: 'Spróbuj sześciu książek bez tytułów, wybierz jedną, rozłóż ją na dni i przeczytaj pierwszy odcinek.',
    description:
      'Lekcja języka polskiego dla klasy 4: wybór książki po pierwszych stronach (ślepa degustacja sześciu otwarć z Czytelni kursu), uzasadnienie wyboru zdaniem z tekstu, plan czytania i pierwsze wrażenie na Półce czytelnika.',
    duration: '25–30 min',
    topics: [1],
    status: 'available',
  },
  // ─── komunikacja ───
  {
    moduleSlug: 'komunikacja',
    slug: 'do-kogo-mowie',
    kind: 'lekcja',
    number: 1,
    title: 'Do kogo mówię? — grzeczność językowa',
    short: 'Do kogo mówię?',
    goal: 'Ułóż tę samą prośbę do kolegi, sąsiadki i dyrektorki — i przetłumacz urzędowe ogłoszenie dla pięciolatki.',
    description:
      'Lekcja języka polskiego dla klasy 4: dostosowanie wypowiedzi do odbiorcy i sytuacji, formy grzecznościowe.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
  },
  {
    moduleSlug: 'komunikacja',
    slug: 'twarz-i-ton',
    kind: 'lekcja',
    number: 2,
    title: 'Twarz i ton — komunikacja bez słów',
    short: 'Twarz i ton',
    goal: 'Zobacz, jak twarz i ton potrafią odwrócić znaczenie słów.',
    description:
      'Lekcja języka polskiego dla klasy 4: mimika, gest i intonacja jako część komunikatu.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
    sound: true,
  },
  {
    moduleSlug: 'komunikacja',
    slug: 'slucham-uwaznie',
    kind: 'lekcja',
    number: 3,
    title: 'Słucham uważnie',
    short: 'Słucham uważnie',
    goal: 'Przekonaj się, że słuchanie to praca — i naucz się wyłapywać to, co ważne.',
    description:
      'Lekcja języka polskiego dla klasy 4: słuchanie ze zrozumieniem i notatka ze słuchu.',
    duration: '20–25 min',
    topics: [2],
    status: 'available',
    sound: true,
  },
  {
    moduleSlug: 'komunikacja',
    slug: 'moje-zdanie',
    kind: 'lekcja',
    number: 4,
    title: 'Moje zdanie — argument i „bo”',
    short: 'Moje zdanie',
    goal: 'Naucz się popierać swoje zdanie powodem, który naprawdę go wspiera.',
    description:
      'Lekcja języka polskiego dla klasy 4: wyrażanie opinii, argument i jego związek ze stanowiskiem.',
    duration: '20–25 min',
    topics: [3],
    status: 'available',
  },
  // ─── ja-i-my ───
  {
    moduleSlug: 'ja-i-my',
    slug: 'emocje-i-potrzeby',
    kind: 'lekcja',
    number: 1,
    title: 'Emocje i potrzeby — komunikat „ja”',
    short: 'Emocje i potrzeby',
    goal: 'Naucz się mówić, co czujesz i czego potrzebujesz, zamiast oskarżać.',
    description:
      'Lekcja języka polskiego dla klasy 4: nazywanie emocji i potrzeb, komunikat „ja” w sytuacji sporu.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
  },
  {
    moduleSlug: 'ja-i-my',
    slug: 'moje-wspolnoty',
    kind: 'lekcja',
    number: 2,
    title: 'Moje wspólnoty',
    short: 'Moje wspólnoty',
    goal: 'Zobacz, do ilu wspólnot należysz i co w każdej z nich od siebie dajesz.',
    description:
      'Lekcja języka polskiego dla klasy 4: rodzina, klasa, sąsiedztwo i kraj jako wspólnoty, wartości uzasadniane przykładem.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
  },
  {
    moduleSlug: 'ja-i-my',
    slug: 'mazurek-i-rota',
    kind: 'lekcja',
    number: 3,
    title: 'Hymn i „Rota” — obietnice pisane jako „my”',
    short: 'Mazurek i „Rota”',
    goal: 'Zobacz, jak słowa hymnu pasują do melodii, przypieczętuj obietnice „Roty”, znajdź każde „my” — i napisz własną obietnicę.',
    description:
      'Lekcja języka polskiego dla klasy 4: Mazurek Dąbrowskiego (tekst urzędowy) i „Rota” Marii Konopnickiej — dawne formy dopasowane do melodii, obietnica jako czynność, pierwsza osoba liczby mnogiej także w końcówkach i własna obietnica wspólnoty.',
    duration: '20–25 min',
    topics: [2],
    status: 'available',
  },
  // ─── slowa ───
  {
    moduleSlug: 'slowa',
    slug: 'slownik',
    kind: 'lekcja',
    number: 1,
    title: 'Słownik i znaczenie słowa',
    short: 'Słownik',
    goal: 'Naucz się szukać słów w słowniku i zobacz, jak znaczenie zależy od zdania.',
    description:
      'Lekcja języka polskiego dla klasy 4: wyrazy wieloznaczne i korzystanie ze słownika w porządku alfabetycznym.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
  },
  {
    moduleSlug: 'slowa',
    slug: 'slowa-maja-kolor',
    kind: 'lekcja',
    number: 2,
    title: 'Słowa mają kolor — synonimy, zdrobnienia, zgrubienia',
    short: 'Słowa mają kolor',
    goal: 'Zobacz, jak zdrobnienie albo zgrubienie zmienia opinię o tym, co opisujesz.',
    description:
      'Lekcja języka polskiego dla klasy 4: synonimy, antonimy, zdrobnienia i zgrubienia jako narzędzie opisu.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
  },
  {
    moduleSlug: 'slowa',
    slug: 'frazeologizmy',
    kind: 'lekcja',
    number: 3,
    title: 'Związki frazeologiczne',
    short: 'Frazeologizmy',
    goal: 'Odkryj słowa, które w parze znaczą coś zupełnie innego niż każde osobno.',
    description:
      'Lekcja języka polskiego dla klasy 4: związki frazeologiczne: znaczenie dosłowne i przenośne.',
    duration: '20–25 min',
    topics: [2],
    status: 'available',
  },
  // ─── czesci-mowy ───
  {
    moduleSlug: 'czesci-mowy',
    slug: 'odmienne-i-nieodmienne',
    kind: 'lekcja',
    number: 1,
    title: 'Wyrazy odmienne i nieodmienne',
    short: 'Odmienne i nieodmienne',
    goal: 'Sprawdź, które słowa zmieniają kształt razem ze zdaniem, a które zostają takie same.',
    description:
      'Lekcja języka polskiego dla klasy 4: podział części mowy na odmienne i nieodmienne na podstawie odmiany.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
  },
  {
    moduleSlug: 'czesci-mowy',
    slug: 'rzeczownik',
    kind: 'lekcja',
    number: 2,
    title: 'Rzeczownik — rodzaj i liczba',
    short: 'Rzeczownik',
    goal: 'Poznaj rzeczownik: co nazywa i jak słychać jego rodzaj.',
    description:
      'Lekcja języka polskiego dla klasy 4: rzeczownik, rodzaj, liczba, nazwy własne i wielka litera.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
  },
  {
    moduleSlug: 'czesci-mowy',
    slug: 'czasownik',
    kind: 'lekcja',
    number: 3,
    title: 'Czasownik — czas, osoba, liczba',
    short: 'Czasownik',
    goal: 'Zobacz, jak czasownik przenosi całą historię do wczoraj albo jutra.',
    description:
      'Lekcja języka polskiego dla klasy 4: czasownik: czas przeszły, teraźniejszy i przyszły, osoba i liczba.',
    duration: '20–25 min',
    topics: [2],
    status: 'available',
  },
  {
    moduleSlug: 'czesci-mowy',
    slug: 'przymiotnik-i-przyslowek',
    kind: 'lekcja',
    number: 4,
    title: 'Przymiotnik i przysłówek',
    short: 'Przymiotnik i przysłówek',
    goal: 'Pomaluj przedmiot przymiotnikiem i pokieruj ruchem przysłówkiem.',
    description:
      'Lekcja języka polskiego dla klasy 4: przymiotnik opisujący rzeczownik i przysłówek opisujący czynność.',
    duration: '20–25 min',
    topics: [3],
    status: 'available',
  },
  {
    moduleSlug: 'czesci-mowy',
    slug: 'male-slowa',
    kind: 'lekcja',
    number: 5,
    title: 'Małe słowa — przyimki i zaimki',
    short: 'Małe słowa',
    goal: 'Zobacz, jak małe słowa ustawiają świat i zastępują imiona.',
    description:
      'Lekcja języka polskiego dla klasy 4: przyimek i wyrażenie przyimkowe (na, pod, za, między), zaimek zamiast powtórzeń i zaimek niejasny.',
    duration: '20–25 min',
    topics: [4],
    status: 'available',
  },
  // ─── opowiesci ───
  {
    moduleSlug: 'opowiesci',
    slug: 'swiat-przedstawiony',
    kind: 'lekcja',
    number: 1,
    title: 'Świat przedstawiony i narrator',
    short: 'Świat przedstawiony',
    goal: 'Rozłóż opowieść na miejsce, czas, bohaterów i zdarzenia — i znajdź tego, kto opowiada.',
    description:
      'Lekcja języka polskiego dla klasy 4: elementy świata przedstawionego i narrator.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
  },
  {
    moduleSlug: 'opowiesci',
    slug: 'basn',
    kind: 'lekcja',
    number: 2,
    title: 'Baśń — świat urządzony sprawiedliwie',
    short: 'Baśń',
    goal: 'Odkryj, co sprawia, że opowieść jest baśnią, i czego uczy jej zakończenie.',
    description:
      'Lekcja języka polskiego dla klasy 4: cechy baśni, fantastyka i realizm, morał.',
    duration: '20–25 min',
    topics: [1],
    status: 'soon',
  },
  {
    moduleSlug: 'opowiesci',
    slug: 'mity',
    kind: 'lekcja',
    number: 3,
    title: 'Mity greckie',
    short: 'Mity',
    goal: 'Zobacz, jak mit tłumaczy świat opowieścią — od pór roku po lot Ikara.',
    description:
      'Lekcja języka polskiego dla klasy 4: mit jako opowieść wyjaśniająca świat: Dedal i Ikar, Demeter i Kora, Syzyf.',
    duration: '20–25 min',
    topics: [2],
    status: 'soon',
  },
  {
    moduleSlug: 'opowiesci',
    slug: 'przypowiesci',
    kind: 'lekcja',
    number: 4,
    title: 'Przypowieści — opowieść, która znaczy więcej',
    short: 'Przypowieści',
    goal: 'Przeczytaj przypowieść, która mówi jedno, a znaczy więcej — i znajdź w niej siebie.',
    description:
      'Lekcja języka polskiego dla klasy 4: przypowieść o synu marnotrawnym z trzech perspektyw, znaczenie dosłowne i przenośne.',
    duration: '20–25 min',
    topics: [3],
    status: 'soon',
  },
  {
    moduleSlug: 'opowiesci',
    slug: 'teatrzyk-z-legendy',
    kind: 'lekcja',
    number: 5,
    title: 'Teatrzyk z legendy',
    short: 'Teatrzyk z legendy',
    goal: 'Wystaw legendę w teatrzyku z plansz: wybierz, co pokazać i kiedy zatrzymać obraz.',
    description:
      'Lekcja języka polskiego dla klasy 4: legenda wystawiona w papierowym teatrzyku kamishibai — plansze zgodne z tekstem i napięcie budowane obrazem.',
    duration: '20–25 min',
    topics: [4],
    status: 'soon',
  },
  // ─── zdanie ───
  {
    moduleSlug: 'zdanie',
    slug: 'kregoslup-zdania',
    kind: 'lekcja',
    number: 1,
    title: 'Kręgosłup zdania — podmiot i orzeczenie',
    short: 'Kręgosłup zdania',
    goal: 'Znajdź dwie nogi, na których stoi każde zdanie.',
    description:
      'Lekcja języka polskiego dla klasy 4: podmiot i orzeczenie, wyrazy, które można ze zdania usunąć.',
    duration: '20–25 min',
    topics: [0],
    status: 'soon',
  },
  {
    moduleSlug: 'zdanie',
    slug: 'kropka-pytajnik-wykrzyknik',
    kind: 'lekcja',
    number: 2,
    title: 'Kropka, pytajnik, wykrzyknik',
    short: 'Znaki na końcu zdania',
    goal: 'Zobacz, jak znak na końcu zmienia cel zdania.',
    description:
      'Lekcja języka polskiego dla klasy 4: zdania oznajmujące, pytające i rozkazujące, wykrzyknikowe, zdanie a równoważnik.',
    duration: '20–25 min',
    topics: [1],
    status: 'soon',
  },
  {
    moduleSlug: 'zdanie',
    slug: 'zdania-zlozone',
    kind: 'lekcja',
    number: 3,
    title: 'Zdania złożone i przecinek',
    short: 'Zdania złożone',
    goal: 'Naucz się spinać dwa zdania w jedno i stawiać przecinek tam, gdzie trzeba.',
    description:
      'Lekcja języka polskiego dla klasy 4: zdanie pojedyncze i złożone, przecinek przed „ale”, „bo”, „że”.',
    duration: '20–25 min',
    topics: [2],
    status: 'soon',
  },
  {
    moduleSlug: 'zdanie',
    slug: 'dialog',
    kind: 'lekcja',
    number: 4,
    title: 'Dialog w opowiadaniu',
    short: 'Dialog',
    goal: 'Zapisz rozmowę tak, żeby było słychać, kto mówi.',
    description:
      'Lekcja języka polskiego dla klasy 4: zapis dialogu z myślnikiem i wtrąceniem narratora.',
    duration: '20–25 min',
    topics: [3],
    status: 'soon',
  },
  // ─── ortografia ───
  {
    moduleSlug: 'ortografia',
    slug: 'gloski-i-litery',
    kind: 'lekcja',
    number: 1,
    title: 'Głoski i litery',
    short: 'Głoski i litery',
    goal: 'Policz, ile słyszysz głosek, a ile piszesz liter — i dlaczego to nie zawsze to samo.',
    description:
      'Lekcja języka polskiego dla klasy 4: głoska, litera, sylaba, dwuznaki i spółgłoski miękkie.',
    duration: '20–25 min',
    topics: [0],
    status: 'soon',
  },
  {
    moduleSlug: 'ortografia',
    slug: 'o-z-kreska-i-rz',
    kind: 'lekcja',
    number: 2,
    title: 'Ó i rz — wymiana zdradza pisownię',
    short: 'Ó i rz',
    goal: 'Naucz się sprawdzać ó i rz, odmieniając wyraz albo szukając wyrazu pokrewnego.',
    description:
      'Lekcja języka polskiego dla klasy 4: pisownia ó i rz wymiennych oraz niewymiennych.',
    duration: '20–25 min',
    topics: [1],
    status: 'soon',
  },
  {
    moduleSlug: 'ortografia',
    slug: 'z-kropka-ch-h',
    kind: 'lekcja',
    number: 3,
    title: 'Ż, ch i h — rodzina wyrazów',
    short: 'Ż, ch i h',
    goal: 'Sprawdzaj pisownię ż, ch i h u krewnych wyrazu.',
    description:
      'Lekcja języka polskiego dla klasy 4: pisownia ż, ch i h, rodzina wyrazów.',
    duration: '20–25 min',
    topics: [2],
    status: 'soon',
  },
  {
    moduleSlug: 'ortografia',
    slug: 'nie-z-wyrazami',
    kind: 'lekcja',
    number: 4,
    title: '„Nie” z różnymi częściami mowy',
    short: '„Nie” z wyrazami',
    goal: 'Rozpoznaj część mowy, a dowiesz się, czy „nie” piszesz razem, czy osobno.',
    description:
      'Lekcja języka polskiego dla klasy 4: pisownia „nie” z czasownikami, rzeczownikami i przymiotnikami.',
    duration: '20–25 min',
    topics: [3],
    status: 'soon',
  },
  {
    moduleSlug: 'ortografia',
    slug: 'korekta',
    kind: 'lekcja',
    number: 5,
    title: 'Korekta i dyktando z pamięci',
    short: 'Korekta i dyktando',
    goal: 'Popraw odbitkę gazetki i napisz dyktando z pamięci — przy każdym błędzie poznasz regułę.',
    description:
      'Lekcja języka polskiego dla klasy 4: korekta odbitki i dyktando z pamięci, a przy każdym błędzie reguła ortograficzna.',
    duration: '20–25 min',
    topics: [4],
    status: 'soon',
  },
  // ─── poezja ───
  {
    moduleSlug: 'poezja',
    slug: 'wers-strofa-rym',
    kind: 'lekcja',
    number: 1,
    title: 'Wers, strofa, rym',
    short: 'Wers, strofa, rym',
    goal: 'Poznaj budowę wiersza: wersy, strofy, rymy i rytm.',
    description:
      'Lekcja języka polskiego dla klasy 4: budowa wiersza: wers, strofa, rym i rytm.',
    duration: '20–25 min',
    topics: [0],
    status: 'soon',
  },
  {
    moduleSlug: 'poezja',
    slug: 'epitet-porownanie-dzwiek',
    kind: 'lekcja',
    number: 2,
    title: 'Epitet, porównanie i dźwięki w wierszu',
    short: 'Epitet i porównanie',
    goal: 'Zobacz, jak poeta dobiera słowa, żeby czytelnik zobaczył i usłyszał.',
    description:
      'Lekcja języka polskiego dla klasy 4: epitet, porównanie i wyrazy dźwiękonaśladowcze.',
    duration: '20–25 min',
    topics: [1],
    status: 'soon',
  },
  {
    moduleSlug: 'poezja',
    slug: 'czytam-na-glos',
    kind: 'lekcja',
    number: 3,
    title: 'Czytam wiersz na głos',
    short: 'Czytam na głos',
    goal: 'Wyreżyseruj czytanie wiersza i usłysz, jak głos zmienia jego sens.',
    description:
      'Lekcja języka polskiego dla klasy 4: głośne czytanie wiersza: pauza, akcent, tempo i nastrój.',
    duration: '20–25 min',
    topics: [2],
    status: 'soon',
    sound: true,
  },
  // ─── pisanie ───
  {
    moduleSlug: 'pisanie',
    slug: 'plan-i-notatka',
    kind: 'lekcja',
    number: 1,
    title: 'Plan i notatka',
    short: 'Plan i notatka',
    goal: 'Naucz się dzielić tekst na części i zapisywać najważniejsze w kilku punktach.',
    description:
      'Lekcja języka polskiego dla klasy 4: plan wydarzeń, pytania do tekstu i notatka.',
    duration: '20–25 min',
    topics: [0],
    status: 'soon',
  },
  {
    moduleSlug: 'pisanie',
    slug: 'list-i-zaproszenie',
    kind: 'lekcja',
    number: 2,
    title: 'List i zaproszenie',
    short: 'List i zaproszenie',
    goal: 'Napisz list, w którym adresat od razu wie, od kogo jest, do kogo i po co.',
    description:
      'Lekcja języka polskiego dla klasy 4: budowa listu, zaproszenia i życzeń, adresowanie koperty.',
    duration: '20–25 min',
    topics: [1],
    status: 'soon',
  },
  {
    moduleSlug: 'pisanie',
    slug: 'opis-przedmiotu',
    kind: 'lekcja',
    number: 3,
    title: 'Opis przedmiotu',
    short: 'Opis przedmiotu',
    goal: 'Opisz przedmiot tak, żeby ktoś, kto go nie widział, rozpoznał go od razu.',
    description:
      'Lekcja języka polskiego dla klasy 4: opis przedmiotu: kolejność, cechy i słownictwo.',
    duration: '20–25 min',
    topics: [2],
    status: 'soon',
  },
  {
    moduleSlug: 'pisanie',
    slug: 'opowiadanie',
    kind: 'lekcja',
    number: 4,
    title: 'Opowiadanie',
    short: 'Opowiadanie',
    goal: 'Napisz opowiadanie, które trzyma w napięciu, zanim się rozwiąże.',
    description:
      'Lekcja języka polskiego dla klasy 4: budowa opowiadania: wstęp, rozwinięcie z komplikacją, zakończenie i dialog.',
    duration: '20–25 min',
    topics: [3],
    status: 'soon',
  },
  // ─── media ───
  {
    moduleSlug: 'media',
    slug: 'fakt-czy-opinia',
    kind: 'lekcja',
    number: 1,
    title: 'Fakt czy opinia?',
    short: 'Fakt czy opinia',
    goal: 'Naucz się odróżniać to, co da się sprawdzić, od tego, co ktoś myśli.',
    description:
      'Lekcja języka polskiego dla klasy 4: fakt i opinia w wiadomości, słowa wartościujące.',
    duration: '20–25 min',
    topics: [0],
    status: 'soon',
  },
  {
    moduleSlug: 'media',
    slug: 'reklama',
    kind: 'lekcja',
    number: 2,
    title: 'Język reklamy',
    short: 'Reklama',
    goal: 'Zobacz od środka, jak reklama dobiera słowa, żebyś sam chciał kupić.',
    description:
      'Lekcja języka polskiego dla klasy 4: chwyty językowe reklamy i świadomy wybór.',
    duration: '20–25 min',
    topics: [1],
    status: 'soon',
  },
  {
    moduleSlug: 'media',
    slug: 'przeladowanie',
    kind: 'lekcja',
    number: 3,
    title: 'Za dużo informacji',
    short: 'Za dużo informacji',
    goal: 'Sprawdź, ile naprawdę zostaje w głowie z przewijanego potoku wiadomości.',
    description:
      'Lekcja języka polskiego dla klasy 4: nadmiar informacji i uważne korzystanie z mediów.',
    duration: '20–25 min',
    topics: [2],
    status: 'soon',
  },
  // ─── pracownia-lektury ───
  {
    moduleSlug: 'pracownia-lektury',
    slug: 'mapa-bohatera',
    kind: 'lekcja',
    number: 1,
    title: 'Mapa przeżyć bohatera',
    short: 'Mapa bohatera',
    goal: 'Prześledź, jak zmienia się bohater — kiedy i dlaczego.',
    description:
      'Lekcja języka polskiego dla klasy 4: droga bohatera, jego emocje i ocena postępowania.',
    duration: '20–25 min',
    topics: [0],
    status: 'soon',
  },
  {
    moduleSlug: 'pracownia-lektury',
    slug: 'nowa-okladka',
    kind: 'lekcja',
    number: 2,
    title: 'Nowa okładka',
    short: 'Nowa okładka',
    goal: 'Zaprojektuj okładkę, która mówi o książce prawdę, ale nie zdradza zakończenia.',
    description:
      'Lekcja języka polskiego dla klasy 4: projekt okładki i notki o książce.',
    duration: '20–25 min',
    topics: [1],
    status: 'soon',
  },
  {
    moduleSlug: 'pracownia-lektury',
    slug: 'wystawa-online',
    kind: 'lekcja',
    number: 3,
    title: 'Wystawa online',
    short: 'Wystawa online',
    goal: 'Przejdź się po wystawie i przeczytaj obraz innymi oczami.',
    description:
      'Lekcja języka polskiego dla klasy 4: odbiór dzieła malarskiego: temat, kompozycja, kolor i tytuł.',
    duration: '20–25 min',
    topics: [2],
    status: 'soon',
  },
  {
    moduleSlug: 'pracownia-lektury',
    slug: 'komiks-z-lektury',
    kind: 'lekcja',
    number: 4,
    title: 'Komiks z lektury',
    short: 'Komiks z lektury',
    goal: 'Opowiedz jedną scenę kadrami: co pokazać, a co zostawić między kadrami.',
    description:
      'Lekcja języka polskiego dla klasy 4: scena z tekstu rozpisana na kadry, dymki i ramki narratora.',
    duration: '20–25 min',
    topics: [3],
    status: 'soon',
  },
  // ─── podsumowanie ───
  {
    moduleSlug: 'podsumowanie',
    slug: 'polecam',
    kind: 'lekcja',
    number: 1,
    title: 'Polecam! — dobór książki dla czytelnika',
    short: 'Polecam',
    goal: 'Poleć książkę tak, żeby trafiła w gust czytelnika, a nie twój.',
    description:
      'Lekcja języka polskiego dla klasy 4: polecanie książek innym czytelnikom i półka roku.',
    duration: '20–25 min',
    topics: [0],
    status: 'soon',
  },
  {
    moduleSlug: 'podsumowanie',
    slug: 'moja-ksiazeczka',
    kind: 'lekcja',
    number: 2,
    title: 'Moja książeczka',
    short: 'Moja książeczka',
    goal: 'Złóż swoje teksty z całego roku w książeczkę.',
    description:
      'Lekcja języka polskiego dla klasy 4: wybór, poprawa i złożenie własnych tekstów w książeczkę.',
    duration: '20–25 min',
    topics: [1],
    status: 'soon',
  },
  {
    moduleSlug: 'podsumowanie',
    slug: 'test-koncowy',
    kind: 'podsumowanie',
    number: 3,
    title: 'Test końcowy i most do klasy 5',
    short: 'Test końcowy',
    goal: 'Sprawdź, co zostało po roku polskiego, i zajrzyj do klasy 5.',
    description:
      'Lekcja języka polskiego dla klasy 4: test końcowy z zadaniami wykonywanymi i zapowiedź tematów klasy 5.',
    duration: '30 min',
    topics: [2],
    status: 'soon',
  },
];

export const getModuleLessons = (moduleSlug: string): PolLesson[] =>
  POL_LESSONS.filter((lesson) => lesson.moduleSlug === moduleSlug).sort(
    (a, b) => a.number - b.number
  );

/** Wszystkie opublikowane lekcje w kolejności programu. */
const orderedPublishedLessons = (): PolLesson[] => {
  const moduleOrder = new Map(POL_MODULES.map((m, i) => [m.slug, i]));
  return POL_LESSONS.filter((lesson) => lesson.status === 'available').sort((a, b) => {
    const modA = moduleOrder.get(a.moduleSlug) ?? 0;
    const modB = moduleOrder.get(b.moduleSlug) ?? 0;
    return modA !== modB ? modA - modB : a.number - b.number;
  });
};

/** Kolejna opublikowana lekcja po podanej — także z następnego modułu. */
export const getNextLesson = (moduleSlug: string, slug: string): PolLesson | undefined => {
  const ordered = orderedPublishedLessons();
  const index = ordered.findIndex(
    (lesson) => lesson.moduleSlug === moduleSlug && lesson.slug === slug
  );
  return index === -1 ? undefined : ordered[index + 1];
};

export const getLesson = (moduleSlug: string, slug: string): PolLesson | undefined =>
  POL_LESSONS.find((lesson) => lesson.moduleSlug === moduleSlug && lesson.slug === slug);

/** Lekcja obejmująca daną jednostkę tematyczną — do linkowania listy tematów modułu. */
export const getLessonForTopic = (moduleSlug: string, topicIndex: number): PolLesson | undefined =>
  POL_LESSONS.find(
    (lesson) => lesson.moduleSlug === moduleSlug && lesson.topics.includes(topicIndex)
  );

/** Lekcje z własną stroną — tego używa `generateStaticParams` i liczenie postępu. */
export const getPublishedLessons = (): PolLesson[] =>
  POL_LESSONS.filter((lesson) => lesson.status === 'available');

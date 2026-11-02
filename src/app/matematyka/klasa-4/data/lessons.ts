/**
 * Rejestr lekcji online kursu matematyki.
 *
 * Uwaga na rozróżnienie z curriculum.ts: `MathModule.lessons` to *jednostki
 * tematyczne* z podstawy programowej (~80 w całym kursie), a jedna lekcja
 * online obejmuje 1–3 z nich. Ten plik opisuje właśnie lekcje online — to,
 * co dziecko realnie otwiera i przechodzi.
 *
 * Dodanie lekcji: wpis tutaj + komponent w
 * `components/lessons/<slug>/` podpięty w `[modul]/[lekcja]/page.tsx`.
 */

import { MATH_MODULES } from './curriculum';

export type LessonStatus = 'available' | 'soon';

/**
 * `lekcja`       — interaktywna lekcja na 6-krokowym szablonie (`LessonShell`).
 * `przewodnik`   — teoretyczne wprowadzenie (`GuideShell`): scrollowana narracja
 *                  z klikaniem, bez ćwiczeń, quizu i punktacji. Wykłada zasady,
 *                  zanim lekcja każe ich użyć.
 * `podsumowanie` — powtórzenie i sprawdzian modułowy, zawsze ostatnia pozycja
 *                  w module (patrz komentarz przy `MATH_LESSONS` niżej). Też
 *                  używa `LessonShell` (ta sama mechanika kroków/punktacji co
 *                  `lekcja`), ale z krokami-klastrami zamiast szablonu
 *                  Rozgrzewka/Nowe pojęcie/… — patrz `podsumowanie-liczby-naturalne/`.
 */
export type LessonKind = 'lekcja' | 'przewodnik' | 'podsumowanie';

/**
 * Nagroda odblokowywana po ukończeniu 100% lekcji (`LessonShell`) — prawdziwa,
 * zweryfikowana ciekawostka powiązana z tematem, nie oderwana od niego treść.
 * Dziecko widzi ją dopiero jako `finished === true`, nigdy wcześniej.
 */
export interface LessonFunFact {
  /** Krótki, chwytliwy nagłówek ciekawostki. */
  title: string;
  /** 2–4 zdania treści, napisane wprost do dziecka. */
  text: string;
  /** Podpis źródła pokazywany pod ciekawostką (wiarygodność, nie ozdobnik). */
  sourceLabel: string;
  sourceUrl?: string;
}

export interface MathLesson {
  /** Slug modułu z curriculum.ts. */
  moduleSlug: string;
  slug: string;
  /** Typ treści — decyduje o powłoce i o tym, czy wpis liczy się do ukończenia modułu. */
  kind: LessonKind;
  /** Numer lekcji online w obrębie modułu (1-based; przewodniki dostają 0). */
  number: number;
  title: string;
  /** Krótszy tytuł do nawigacji i kafelków. */
  short: string;
  /** Jedno zdanie: po co ta lekcja. */
  goal: string;
  /** Opis pod SEO/OG. */
  description: string;
  /** Orientacyjny czas, np. „25–30 min”. */
  duration: string;
  /**
   * Indeksy jednostek tematycznych z `MathModule.lessons`, które lekcja pokrywa.
   *
   * INWARIANT: przewodniki mają zawsze `[]`. `getLessonForTopic` zwraca pierwsze
   * trafienie, więc przewodnik z niepustym `topics` przejąłby link wiersza tematu
   * na stronie modułu i odciąłby dostęp do właściwej lekcji.
   */
  topics: number[];
  /**
   * Tylko dla przewodników: indeks tematu z `MathModule.lessons`, przed którym
   * przewodnik ma się wpiąć na liście „Czego się nauczysz" strony modułu.
   * Brak = przewodnik ląduje na końcu listy tematów modułu. Dzięki temu
   * przewodniki mogą stać w dowolnym miejscu programu, nie tylko na starcie
   * modułu — zob. `[modul]/page.tsx`.
   */
  beforeTopic?: number;
  status: LessonStatus;
  /** Dla `kind: 'lekcja'` i `'podsumowanie'` — patrz `LessonFunFact`. Przewodniki nie mają nagrody. */
  funFact?: LessonFunFact;
}

export const MATH_LESSONS: MathLesson[] = [
  {
    moduleSlug: 'start',
    slug: 'jak-sie-uczyc',
    kind: 'lekcja',
    number: 1,
    title: 'Jak się uczyć matematyki',
    short: 'Jak się uczyć matematyki',
    goal: 'Organizacja nauki, notatki, które działają, i poprawa błędów bez stresu.',
    description:
      'Jak uczyć się matematyki w klasie 4: krzywa zapominania, notatka, która działa, warsztat poprawy błędów i plan nauki na tydzień — lekcja startowa.',
    duration: '25–30 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Einstein nigdy nie oblał matematyki',
      text: 'To jeden z najsłynniejszych mitów o nauce — a nieprawdziwy. Einstein świetnie radził sobie z matematyką od dziecka i już w wieku 15 lat samodzielnie uczył się rachunku różniczkowego. Mit prawdopodobnie wziął się stąd, że jego szkoła zmieniła skalę ocen — dawna najlepsza ocena „1” zaczęła oznaczać najgorszą, więc stare świadectwa wyglądały, jakby oblewał. Nawet geniusz może wyglądać na nieudacznika, jeśli źle odczytasz jego wyniki.',
      sourceLabel: 'World Atlas',
      sourceUrl: 'https://www.worldatlas.com/articles/did-einstein-really-fail-math-class.html',
    },
  },
  {
    moduleSlug: 'start',
    slug: 'test-diagnostyczny',
    kind: 'lekcja',
    number: 2,
    title: 'Test diagnostyczny — co już umiem z klas I–III',
    short: 'Test diagnostyczny',
    goal: 'Sprawdź działania w zakresie 1000, tabliczkę mnożenia, geometrię, zegar i pieniądze.',
    description:
      'Krótki test na wejście do klasy 4: dodawanie i odejmowanie w zakresie 1000, tabliczka mnożenia, podstawy geometrii, obliczenia zegarowe i pieniężne.',
    duration: '20 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Najszybszy „ludzki kalkulator” liczy 12 cyfr na sekundę',
      text: 'Neelakantha Bhanu Prakash z Indii ma cztery rekordy Guinnessa w liczeniu w pamięci i jako pierwszy Azjata wygrał Mistrzostwa Świata w Rachunku Pamięciowym. Jego mózg przetwarza liczby jakieś 10 razy szybciej niż przeciętny — skomplikowane działanie potrafi rozwiązać w około 26 sekund. Najciekawsze? Do treningu pamięci namówili go lekarze po wypadku na rowerze, gdy jako pięciolatek złamał czaszkę.',
      sourceLabel: 'CNN',
      sourceUrl: 'https://edition.cnn.com/2020/09/01/world/fastest-human-calculator-intl-scil-hnk',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'przewodnik-liczby-i-os',
    kind: 'przewodnik',
    // 0 sortuje przewodnik przed lekcją 1 i czyta się jako „zanim zaczniesz”.
    number: 0,
    title: 'Liczby, cyfry i oś liczbowa: przewodnik od zera',
    short: 'Przewodnik: liczby i oś liczbowa',
    goal: 'Poznaj cyfry, rzędy, klasy i oś liczbową, zanim zaczniesz zapisywać duże liczby i zaznaczać je na osi.',
    description:
      'Cyfra czy liczba? Rzędy, klasy (jedności, tysiące, miliony) i oś liczbowa — przewodnik dla klasy 4, zanim zaczniesz zapisywać duże liczby i liczyć na osi.',
    duration: '10–12 min',
    topics: [],
    beforeTopic: 0,
    status: 'available',
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'przewodnik-slownik-dzialan',
    kind: 'przewodnik',
    // Przewodnik NIE zawsze dostaje 0 — to zależy od `beforeTopic`. 0 sortuje
    // przed lekcją 1 (tak jak wyżej), ale ten przewodnik ma stanąć między
    // lekcją 3 i 4, więc 3.5: `nextLesson` w [lekcja]/page.tsx i kolejka w
    // ModuleCtaButton idą po `number`, nie po `beforeTopic` — number: 0
    // tutaj cofałoby CTA z tego przewodnika (i z lekcji 3) z powrotem do
    // lekcji 1 zamiast do lekcji 4. Ten sam błąd czeka na kolejny przewodnik
    // niżej, gdyby dostał number: 0.
    number: 3.5,
    title: 'Słownik czterech działań: suma, różnica, iloczyn, iloraz',
    short: 'Przewodnik: słownik działań',
    goal: 'Poznaj nazwy dodawania, odejmowania, mnożenia i dzielenia oraz ich wyników — składnik, suma, odjemna, różnica, czynnik, iloczyn, dzielna, iloraz.',
    description:
      'Składnik, suma, odjemna, różnica, czynnik, iloczyn, dzielna, iloraz — nazwy liczb w czterech działaniach, wyjaśnione zanim lekcje zaczną z nich korzystać.',
    duration: '8–10 min',
    topics: [],
    beforeTopic: 3,
    status: 'available',
  },
  {
    // number: 10.5 — sortuje między lekcją 10 (Cechy podzielności) i przyszłą
    // lekcją 11 (temat 10, przed którym ten przewodnik stoi). Patrz pułapka
    // w komentarzu przy przewodniku-slownik-dzialan wyżej: number: 0 tutaj
    // cofałoby CTA z powrotem do lekcji 1.
    moduleSlug: 'liczby-naturalne',
    slug: 'przewodnik-kolejnosc-dzialan',
    kind: 'przewodnik',
    number: 10.5,
    title: 'Kolejność wykonywania działań: zasady z nawiasami',
    short: 'Przewodnik: kolejność działań',
    goal: 'Poznaj zasady pierwszeństwa działań — nawiasy, mnożenie i dzielenie, dodawanie i odejmowanie — zanim zaczniesz liczyć złożone wyrażenia.',
    description:
      'Dlaczego nawiasy liczymy pierwsze, a mnożenie przed dodawaniem? Zasady kolejności działań z interaktywnym rozwiązywaniem wyrażeń krok po kroku.',
    duration: '10–12 min',
    topics: [],
    beforeTopic: 10,
    status: 'available',
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'zapis-duzych-liczb',
    kind: 'lekcja',
    number: 1,
    title: 'Zapisywanie i odczytywanie dużych liczb',
    short: 'Zapis dużych liczb',
    goal: 'Podziel duże liczby na klasy (jedności, tysiące, miliony) i naucz się je sprawnie zapisywać i czytać.',
    description:
      'Klasy i rzędy w dużych liczbach, czytanie liczb krok po kroku i zadanie o liczbie mieszkańców polskich miast — interaktywna lekcja dla klasy 4.',
    duration: '30–35 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Słowo „googol” wymyślił 9-letni chłopiec',
      text: 'W 1920 roku matematyk Edward Kasner szukał nazwy dla liczby 1 ze stoma zerami. Zapytał swojego 9-letniego siostrzeńca, Miltona Sirottę — a ten bez wahania zaproponował „googol”. Nazwa się przyjęła i trafiła do podręczników matematyki. Kilkadziesiąt lat później twórcy wyszukiwarki internetowej zainspirowali się tym słowem, tworząc nazwę Google — przez pomyłkę w pisowni.',
      sourceLabel: 'Wikipedia',
      sourceUrl: 'https://en.wikipedia.org/wiki/Googol',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'os-liczbowa',
    kind: 'lekcja',
    number: 2,
    title: 'Oś liczbowa — zaznaczanie i odczytywanie liczb',
    short: 'Oś liczbowa',
    goal: 'Naucz się odczytywać i zaznaczać liczby na osi liczbowej — na każdej skali, tą samą metodą.',
    description:
      'Zaznaczanie i odczytywanie liczb na osi liczbowej — wartość odstępu między kreskami i trasa rowerowa z przystankami jako ćwiczenie. Lekcja dla klasy 4.',
    duration: '30–35 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Twój mózg naprawdę „widzi” liczby jak na osi liczbowej',
      text: 'Naukowcy odkryli, że ludzie mimowolnie ustawiają liczby w wyobraźni wzdłuż linii — tak samo jak na osi liczbowej z tej lekcji. W kulturach, w których czyta się od lewej do prawej (jak w Polsce), małe liczby „czujemy” bardziej po lewej, a duże po prawej stronie. W kulturach czytających od prawej do lewej bywa odwrotnie. Nawet niemowlęta i niektóre zwierzęta zdają się porządkować liczby w podobny, przestrzenny sposób.',
      sourceLabel: 'Nature Communications',
      sourceUrl: 'https://www.nature.com/articles/s41467-024-55685-x',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'porownywanie-liczb',
    kind: 'lekcja',
    number: 3,
    title: 'Porównywanie liczb naturalnych',
    short: 'Porównywanie liczb',
    goal: 'Naucz się szybko i bezbłędnie stwierdzać, która liczba jest większa — niezależnie od tego, jak duże są liczby.',
    description:
      'Porównywanie liczb naturalnych cyfra po cyfrze — pojedynek liczb, trzy przypadki na przykładach i zbiórka makulatury jako zadanie problemowe.',
    duration: '30–35 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Znaki < i > mają prawie 400 lat',
      text: 'Zanim ktoś wymyślił znaki „większy niż” i „mniejszy niż”, matematycy musieli za każdym razem pisać słowami, która liczba jest większa. Symbole < i > pojawiły się dopiero w 1631 roku, w książce angielskiego matematyka Thomasa Harriota, wydanej już po jego śmierci. Od tamtej pory oszczędzają uczniom na całym świecie mnóstwo pisania.',
      sourceLabel: 'MacTutor History of Mathematics',
      sourceUrl: 'https://mathshistory.st-andrews.ac.uk/Miller/mathsym/relation/',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'dodawanie-odejmowanie-w-pamieci',
    kind: 'lekcja',
    number: 4,
    title: 'Dodawanie i odejmowanie w pamięci',
    short: 'Dodawanie i odejmowanie w pamięci',
    goal: 'Rozłóż liczby na dziesiątki i jedności, a potem doskocz do wyniku po pustej osi liczbowej — bez kartki.',
    description:
      'Dodawanie i odejmowanie w pamięci metodą skoków po pustej osi liczbowej, trzy sposoby na trudniejsze przypadki i kieszonkowe na majówkę jako zadanie.',
    duration: '30–35 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'W głowie pomnożyła dwie 13-cyfrowe liczby w 28 sekund',
      text: 'W 1980 roku Shakuntala Devi z Indii, nazywana „ludzkim komputerem”, w Imperial College London pomnożyła w pamięci dwie losowo wybrane 13-cyfrowe liczby — i podała poprawny wynik (prawie 19 tryliardów!) już po 28 sekundach. To wciąż oficjalny rekord Guinnessa na najszybsze obliczenie wykonane przez człowieka. Ona też zaczynała od rozkładania liczb na łatwiejsze kawałki — dokładnie tak, jak w tej lekcji.',
      sourceLabel: 'Guinness World Records',
      sourceUrl: 'https://www.guinnessworldrecords.com/world-records/67741-human-computation',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'wlasnosci-dzialan',
    kind: 'lekcja',
    number: 5,
    title: 'Przemienność i łączność dodawania i mnożenia, rozdzielność mnożenia względem dodawania',
    short: 'Własności działań',
    goal: 'Zobacz na jednej siatce, dlaczego kolejność w dodawaniu i mnożeniu nie ma znaczenia — i jak dzięki temu liczyć szybciej.',
    description:
      'Przemienność, łączność i rozdzielność działań na obracanej siatce mnożenia i przeciąganym podziale — z krzesłami na akademii jako zadaniem problemowym.',
    duration: '30–35 min',
    topics: [4],
    status: 'available',
    funFact: {
      title: 'Matematyk wyrył wzór scyzorykiem na moście',
      text: '16 października 1843 roku Irlandczyk William Rowan Hamilton szedł wzdłuż kanału w Dublinie, gdy nagle zrozumiał nowy rodzaj mnożenia, w którym — inaczej niż w tej lekcji — kolejność jednak ma znaczenie. Tak się ucieszył, że scyzorykiem wyrył swój wzór prosto w kamieniu mostu Broom Bridge. Tabliczka upamiętniająca to odkrycie wisi tam do dziś, a matematycy co roku spacerują tą samą trasą, żeby uczcić ten moment.',
      sourceLabel: 'ScienceAlert',
      sourceUrl:
        'https://www.sciencealert.com/how-a-genius-formula-carved-onto-a-bridge-changed-mathematical-history',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'tabliczka-mnozenia',
    kind: 'lekcja',
    number: 6,
    title: 'Mnożenie i dzielenie w pamięci, tabliczka mnożenia — utrwalenie',
    short: 'Tabliczka mnożenia',
    goal: 'Zobacz, jak mnożenie i dzielenie łączą te same trzy liczby, i wytrenuj tabliczkę mnożenia na czas.',
    description:
      'Tabliczka mnożenia i dzielenia: trójkąt faktów, sprytne sposoby na trudne przypadki i 30-sekundowa błyskawiczna runda na czas. Lekcja dla klasy 4.',
    duration: '30–35 min',
    topics: [5],
    status: 'available',
    funFact: {
      title: 'Tę tabliczkę mnożenia liczono już 2300 lat temu',
      text: 'W 2008 roku chiński uniwersytet Tsinghua dostał w darze zabłocone, cuchnące bambusowe paski. Okazało się, że to najstarsza znana na świecie dziesiętna tabliczka mnożenia — licząca około 2300 lat! Babilończycy mieli swoje tabliczki mnożenia jeszcze wcześniej, prawie 4000 lat temu, tyle że liczyli w systemie szóstkowym, a nie dziesiątkowym jak my. Ucząc się tabliczki mnożenia, powtarzasz coś, czego dzieci uczyły się już tysiące lat temu.',
      sourceLabel: 'Scientific American',
      sourceUrl:
        'https://www.scientificamerican.com/article/ancient-times-table-hidden-in-chinese-bamboo-strips/',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'mnozenie-dzielenie-10-100-1000',
    kind: 'lekcja',
    number: 7,
    title: 'Mnożenie i dzielenie przez 10, 100, 1000',
    short: 'Mnożenie i dzielenie przez 10, 100, 1000',
    goal: 'Zobacz, jak mnożenie i dzielenie przez 10, 100 i 1000 przesuwa cyfry po rzędach wielkości — bez liczenia w pamięci.',
    description:
      'Mnożenie i dzielenie przez 10, 100, 1000 na przeciąganym suwaku, który na żywo pokazuje przesuwanie cyfr — plus hurtownia cukierków jako zadanie.',
    duration: '30–35 min',
    topics: [6],
    status: 'available',
    funFact: {
      title: 'Przed erą dziesiątek Francja miała ćwierć miliona różnych miar',
      text: 'Zanim wynaleziono system metryczny, jedna nazwa miary mogła oznaczać zupełnie inną długość w każdym mieście, a nawet w każdym zawodzie. Tuż przed rewolucją francuską, w 1789 roku, we Francji używano około 800 różnych jednostek miar, które miały w sumie aż ćwierć miliona różnych znaczeń! Żeby to uporządkować, w 1791 roku naukowcy zaproponowali system oparty na dziesiątkach — metr, gram, litr — w którym każdą jednostkę zamienia się na inną, po prostu mnożąc albo dzieląc przez 10, 100 czy 1000. Dokładnie ten sam trik, którego użyłeś w tej lekcji, uratował ludzi przed chaosem miar sprzed ponad 230 lat.',
      sourceLabel: 'Wikipedia — History of the metric system',
      sourceUrl: 'https://en.wikipedia.org/wiki/History_of_the_metric_system',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'dzielenie-z-reszta',
    kind: 'lekcja',
    number: 8,
    title: 'Dzielenie z resztą',
    short: 'Dzielenie z resztą',
    goal: 'Naucz się dzielić liczby, które nie dzielą się równo — i sprawdzać, że reszta zawsze jest mniejsza niż dzielnik.',
    description:
      'Dzielenie z resztą na żywo — rozdawanie przedmiotów do grup, pułapka reszty większej niż dzielnik i wycieczka szkolna jako zadanie z zaokrąglaniem w górę.',
    duration: '30–35 min',
    topics: [7],
    status: 'available',
    funFact: {
      title: 'Rok przestępny to reszta z dzielenia, którą liczy cały świat',
      text: 'Sprawdzenie, czy rok jest przestępny, to w gruncie rzeczy dzielenie z resztą: rok jest przestępny, gdy dzieli się przez 4 bez reszty — chyba że dzieli się też przez 100 (wtedy NIE jest przestępny), chyba że dzieli się jeszcze przez 400 (wtedy jednak jest). Tę zasadę wprowadził w październiku 1582 roku papież Grzegorz XIII, żeby naprawić kalendarz, który przez wieki „rozjeżdżał się” z porami roku — zmiana była tak duża, że po czwartku 4 października 1582 roku od razu nastąpił piątek 15 października, a dziesięć dni po prostu zniknęło z kalendarza! Rok 2000 był przestępny (dzieli się przez 400), ale 1900 już nie (dzieli się przez 100, ale nie przez 400) — to dokładnie ta sama reszta z dzielenia, której się dziś nauczyłeś.',
      sourceLabel: 'Wikipedia — Gregorian calendar',
      sourceUrl: 'https://en.wikipedia.org/wiki/Gregorian_calendar',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'kwadraty-i-szesciany',
    kind: 'lekcja',
    number: 9,
    title: 'Kwadraty i sześciany liczb naturalnych',
    short: 'Kwadraty i sześciany',
    goal: 'Zobacz, jak liczba pomnożona przez samą siebie tworzy kwadrat, a przez samą siebie trzy razy — sześcian.',
    description:
      'Kwadraty i sześciany liczb naturalnych — jeden suwak buduje płaski kwadrat i przestrzenny sześcian z kostek, a szachownica i kostka Rubika to zadanie.',
    duration: '30–35 min',
    topics: [8],
    status: 'available',
    funFact: {
      title: 'Rekord świata w układaniu sześcianu 3×3×3 to niecałe 3 sekundy',
      text: 'Kostka Rubika, którą pewnie znasz, to fizyczny sześcian 3×3×3 — dokładnie ten sam wzór, którego się dziś nauczyłeś: 3³ = 27. W jej wnętrzu jest 26 widocznych, ruchomych elementów plus ukryty środkowy mechanizm, do którego są przyczepione — razem dają dokładnie 27 miejsc w siatce 3×3×3. Wynalazł ją w 1974 roku węgierski architekt Ernő Rubik, a patent zgłosił 30 stycznia 1975 roku. Najszybsze oficjalne ułożenie kostki na świecie to obecnie 2,76 sekundy — rekord należący do Polaka, Teodora Zajdera, pobity 8 lutego 2026 roku. To mniej czasu, niż zajmuje przeczytanie tego zdania.',
      sourceLabel: "Wikipedia — Rubik's Cube",
      sourceUrl: 'https://en.wikipedia.org/wiki/Rubik%27s_Cube',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'cechy-podzielnosci',
    kind: 'lekcja',
    number: 10,
    title: 'Cechy podzielności przez 2, 3, 4, 5, 9, 10, 100',
    short: 'Cechy podzielności',
    goal: 'Naucz się sprawdzać podzielność liczby, patrząc tylko na wybrane cyfry — bez wykonywania całego dzielenia.',
    description:
      'Cechy podzielności przez 2, 3, 4, 5, 9, 10 i 100 — widget podświetlający, które cyfry naprawdę mają znaczenie, oraz loteria szkolna jako zadanie.',
    duration: '30–35 min',
    topics: [9],
    status: 'available',
    funFact: {
      title: 'Sprzed ponad 1000 lat: sposób na sprawdzanie rachunków sumą cyfr',
      text: 'Cecha podzielności przez 9, której się dziś nauczyłeś, ma dużo starszego krewnego — sztuczkę zwaną „odrzucaniem dziewiątek”. Kupcy i rachmistrze używali jej do sprawdzania, czy dobrze pomnożyli albo podzielili duże liczby, na długo zanim ktokolwiek wymyślił kalkulator. Najstarszy znany opis tej metody pochodzi z indyjskiego dzieła matematycznego Mahâsiddhânta z około 950 roku. Około roku 1020 opisał ją także perski uczony Ibn Sina (Awicenna), nazywając ją „metodą hinduską”. Do Europy dotarła dzięki słynnej książce Liber Abaci Leonarda Fibonacciego z 1202 roku — tej samej, która wprowadziła Europę do cyfr, których dziś używasz na co dzień. Sztuczka polega na dokładnie tym, czego się dziś nauczyłeś: sumowaniu cyfr liczby.',
      sourceLabel: 'Wikipedia — Casting out nines',
      sourceUrl: 'https://en.wikipedia.org/wiki/Casting_out_nines',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'kolejnosc-dzialan',
    kind: 'lekcja',
    number: 11,
    title: 'Kolejność wykonywania działań (z nawiasami)',
    short: 'Kolejność wykonywania działań',
    goal: 'Wytrenuj trzy zasady kolejności działań na przykładach, ćwiczeniach i prawdziwym budżecie klasowego pikniku.',
    description:
      'Kolejność wykonywania działań na przykładzie samogrającej „maszyny liczącej” i budżetu klasowego pikniku jako zadania problemowego. Lekcja dla klasy 4.',
    duration: '30–35 min',
    topics: [10],
    status: 'available',
    funFact: {
      title: 'Nawet dorośli spierają się o wynik tego jednego działania',
      text: 'Działanie 8 : 2(2 + 2) stało się prawdziwym internetowym hitem — wpisane w różne kalkulatory potrafi dać dwa różne wyniki: 1 albo 16! Wszystko przez zapis 2(2 + 2) bez znaku razy — część ludzi liczy go jako nierozerwalną całość z liczbą przy nawiasie, a część po prostu jak zwykłe mnożenie liczone od lewej do prawej, tak jak Cię dziś nauczono. To jeden z niewielu naprawdę spornych przypadków we współczesnej matematyce — nawet matematycy nie zgadzają się co do jednej, uniwersalnej zasady dla takiego zapisu. Sam termin „kolejność wykonywania działań” i skróty w rodzaju PEMDAS czy BODMAS ujednolicono w podręcznikach dopiero na przełomie XIX i XX wieku.',
      sourceLabel: 'Wikipedia — Order of operations',
      sourceUrl: 'https://en.wikipedia.org/wiki/Order_of_operations',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'szacowanie-wynikow',
    kind: 'lekcja',
    number: 12,
    title: 'Szacowanie wyników działań',
    short: 'Szacowanie wyników',
    goal: 'Zaokrąglaj liczby i szacuj wynik działania w pamięci — żeby wiedzieć, czy dokładny wynik ma sens.',
    description:
      'Zaokrąglanie i szacowanie wyników działań — maszyna zaokrąglająca pokazująca kaskadę przeniesień cyfra po cyfrze i frekwencja na meczu jako zadanie.',
    duration: '30–35 min',
    topics: [11],
    status: 'available',
    funFact: {
      title: 'Fizyk oszacował siłę wybuchu bomby atomowej… kawałkami papieru',
      text: '16 lipca 1945 roku, tuż po pierwszej na świecie eksplozji jądrowej (test Trinity), fizyk Enrico Fermi nie miał pod ręką żadnych przyrządów pomiarowych. Gdy nadeszła fala uderzeniowa, upuścił z ręki kilka skrawków papieru i zmierzył krokami, jak daleko fala je odrzuciła. Na tej podstawie, w kilka minut, oszacował siłę wybuchu na około 10 kiloton. Prawdziwa wartość, obliczona później dokładnymi metodami, wyniosła około 25 kiloton — jego błyskawiczny szacunek trafił w dobry rząd wielkości, a dokładnie o to w szacowaniu chodzi: nie o idealny wynik, tylko o szybką odpowiedź, czy coś ma sens.',
      sourceLabel: 'arXiv — „Fermi at Trinity”',
      sourceUrl: 'https://arxiv.org/abs/2103.05784',
    },
  },
  {
    moduleSlug: 'liczby-naturalne',
    slug: 'zadania-tekstowe',
    kind: 'lekcja',
    number: 13,
    title: 'Zadania tekstowe — czytanie ze zrozumieniem i strategie rozwiązywania',
    short: 'Zadania tekstowe',
    goal: 'Zamień zdanie zadania w dane, pytanie i prosty schemat — zanim zaczniesz liczyć.',
    description:
      'Strategie na zadania tekstowe — klikalne zdanie do wyłowienia danych i pytania (z liczbą-pułapką), schemat belkowy i kiermasz ciast jako zadanie.',
    duration: '30–35 min',
    topics: [12],
    status: 'available',
    funFact: {
      title: 'Ile lat ma kapitan? Zadanie sprzed prawie 200 lat',
      text: 'W 1841 roku pisarz Gustave Flaubert napisał żartem do swojej siostry o bezsensownym zadaniu: „Statek płynie z Hawru do Nowego Jorku. Na pokładzie jest 26 owiec i 10 kóz. Ile lat ma kapitan?”. Chciał w ten sposób wyśmiać uczenie matematyki polegające na mechanicznym liczeniu bez zastanowienia — to pytanie w ogóle nie ma odpowiedzi, bo wiek kapitana nie ma nic wspólnego z liczbą zwierząt na pokładzie. A jednak, gdy niemal 180 lat później, w 2018 roku, bardzo podobne zadanie dostali prawdziwi uczniowie w Chinach, ponad trzy czwarte z nich po prostu dodało obie liczby (26 + 10 = 36) i podało to jako wiek kapitana. Właśnie tego uczy ta lekcja: najpierw sprawdzić, czy liczba w zadaniu w ogóle jest potrzebna, zamiast dodawać wszystko, co się da.',
      sourceLabel: 'Wikipedia — Age of the captain',
      sourceUrl: 'https://en.wikipedia.org/wiki/Age_of_the_captain',
    },
  },
  {
    // Zawsze ostatnia pozycja modułu — number = (numer ostatniej lekcji + 1),
    // nigdy `beforeTopic`/`+0.5` jak przewodniki (żadna z ich pułapek numeracji
    // tu nie dotyczy, bo podsumowanie nigdy nie wstawia się MIĘDZY lekcje).
    moduleSlug: 'liczby-naturalne',
    slug: 'podsumowanie',
    kind: 'podsumowanie',
    number: 14,
    title: 'Powtórzenie i sprawdzian modułowy',
    short: 'Podsumowanie modułu',
    goal: 'Powtórz wszystkie 13 lekcji modułu w pięciu tematycznych blokach i sprawdź, co warto jeszcze utrwalić.',
    description:
      'Powtórzenie i sprawdzian modułu „Liczby naturalne”: pięć bloków tematycznych obejmujących wszystkie 13 lekcji modułu, z rekomendacją, co warto powtórzyć.',
    duration: '25–30 min',
    topics: [13],
    status: 'available',
    funFact: {
      title: 'Liczby, które sam Bóg miał stworzyć',
      text: 'W 1886 roku, na zjeździe przyrodników w Berlinie, niemiecki matematyk Leopold Kronecker wypowiedział zdanie, które stało się jednym z najsłynniejszych cytatów w całej matematyce: „Liczby całkowite stworzył Pan Bóg, wszystko inne jest dziełem człowieka". Miał na myśli dokładnie to, czego się teraz nauczyłeś/aś: liczby, którymi liczymy — 1, 2, 3, 100, milion — są punktem wyjścia dla reszty matematyki. Ułamki, liczby dziesiętne, geometria — to wszystko ludzie zbudowali później, krok po kroku, na fundamencie liczb naturalnych. Ten fundament masz już za sobą.',
      sourceLabel: 'Wikiquote — Leopold Kronecker',
      sourceUrl: 'https://en.wikiquote.org/wiki/Leopold_Kronecker',
    },
  },
  {
    moduleSlug: 'obliczenia-praktyczne',
    slug: 'system-rzymski',
    kind: 'lekcja',
    number: 1,
    title: 'System rzymski (do 3000) — zamiana w obie strony',
    short: 'System rzymski',
    goal: 'Naucz się zamieniać liczby na zapis rzymski i odwrotnie — miejsce po miejscu, do 3000.',
    description:
      'Cyfry rzymskie do 3000 — mechaniczny licznik budujący liczbę symbol po symbolu, zamiana w obie strony i prawdziwe napisy rzymskie jako zadanie.',
    duration: '30–35 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Rzymianie nie mieli cyfry na zero',
      text: 'W systemie rzymskim po prostu nie istniał żaden symbol oznaczający zero — Rzymianom wystarczał do liczenia towarów i żołnierzy, ale poważniejsze obliczenia były przez to bardzo trudne. Zero jako prawdziwą liczbę wymyślono dopiero w Indiach, około V wieku naszej ery — najpierw jako kropkę, potem jako kółko. Właśnie ten indyjski wynalazek, przekazany przez matematykę arabską, w końcu wyparł w Europie system rzymski, bo dzięki niemu liczenie stało się dużo prostsze.',
      sourceLabel: 'History Facts',
      sourceUrl:
        'https://historyfacts.com/science-industry/article/how-did-the-romans-represent-zero/',
    },
  },
  {
    moduleSlug: 'obliczenia-praktyczne',
    slug: 'jednostki-monetarne',
    kind: 'lekcja',
    number: 2,
    title: 'Jednostki monetarne — złote i grosze, obliczenia pieniężne',
    short: 'Złote i grosze',
    goal: 'Zamieniaj złote na grosze i odwrotnie, dodawaj i odejmuj kwoty, i sam/a wydawaj resztę co do grosza.',
    description:
      'Złote i grosze — klikalny portfel budujący dowolną kwotę, zamiana i liczenie pieniędzy oraz wydawanie reszty w szkolnym sklepiku jako zadanie.',
    duration: '30–35 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Kiedyś trzeba było liczyć w milionach, żeby kupić bochenek chleba',
      text: '1 stycznia 1995 roku w Polsce przeprowadzono denominację złotego — skreślono cztery zera, więc 10 000 starych złotych zamieniło się w 1 nowy złoty. Stało się to po latach hiperinflacji z przełomu lat 80. i 90., gdy ceny rosły tak szybko, że w obiegu był nawet banknot o wartości 2 000 000 starych złotych. Stare i nowe pieniądze były w obiegu równocześnie przez dwa lata, a stare banknoty i monety można było wymieniać w bankach aż do 2010 roku.',
      sourceLabel: 'Wikipedia — Denominacja złotego w 1995 roku',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Denominacja_z%C5%82otego_w_1995_roku',
    },
  },
  {
    moduleSlug: 'obliczenia-praktyczne',
    slug: 'jednostki-dlugosci',
    kind: 'lekcja',
    number: 3,
    title: 'Jednostki długości: mm, cm, dm, m, km — zamiana i stosowanie',
    short: 'Jednostki długości',
    goal: 'Zamieniaj mm, cm, dm, m i km w obie strony i dobieraj jednostkę do tego, co naprawdę mierzysz.',
    description:
      'Jednostki długości mm–cm–dm–m–km — przeciąganie przedmiotów na drabinkę jednostek, mierzenie suwmiarką i trasa wycieczki z długościami w różnych jednostkach.',
    duration: '40–45 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Pomyłka jednostek zgubiła sondę wartą 125 milionów dolarów',
      text: 'We wrześniu 1999 roku NASA straciła kontakt z sondą Mars Climate Orbiter, która miała badać klimat Marsa. Powód okazał się banalny: inżynierowie z Lockheed Martin liczyli siłę silniczków w funtach (jednostka angielska), a zespół nawigacyjny NASA oczekiwał wyniku w niutonach (jednostka metryczna) — nikt nie zamienił jednych na drugie. Sonda poleciała dużo bliżej Marsa, niż planowano, i najprawdopodobniej spłonęła w jego atmosferze. Cała misja, licząc budowę i start, kosztowała ponad 300 milionów dolarów — a wszystko przez brakującą zamianę jednostek.',
      sourceLabel: 'NASA JPL — Mars Climate Orbiter',
      sourceUrl: 'https://www.jpl.nasa.gov/missions/mars-climate-orbiter/',
    },
  },
  {
    moduleSlug: 'obliczenia-praktyczne',
    slug: 'jednostki-masy',
    kind: 'lekcja',
    number: 4,
    title: 'Jednostki masy: g, dag, kg, tona',
    short: 'Jednostki masy',
    goal: 'Zamieniaj g, dag, kg i tony w obie strony i poczuj masę fizycznie na wadze szalkowej.',
    description:
      'Jednostki masy g–dag–kg–t — waga szalkowa przechylająca się na żywo, zagadka „kilogram pierza kontra kilogram żelaza” i pakowanie plecaka jako zadanie.',
    duration: '35–40 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Do 2019 roku kilogram ważył tyle, ile jeden konkretny odważnik w Paryżu',
      text: 'Przez ponad 130 lat cały świat opierał kilogram na jednym metalowym wzorcu — „Le Grand K", walcu z platyny i irydu przechowywanym pod trzema szklanymi kloszami w Paryżu. Kłopot w tym, że przez ponad sto lat osiadał na nim kurz i ścierał się przy czyszczeniu — stracił około 50 mikrogramów, czyli mniej niż pyłek, ale to wystarczyło, żeby „wzorcowy" kilogram przestał być idealnie stały. Dlatego 20 maja 2019 roku naukowcy zastąpili go definicją opartą na stałej fizycznej (stałej Plancka), mierzoną specjalną wagą Kibble’a — dziś kilogram nie zależy już od żadnego pojedynczego przedmiotu, który mógłby się zmienić.',
      sourceLabel: 'CNN — Out with the old kilogram, in with the new',
      sourceUrl: 'https://edition.cnn.com/2019/05/20/world/new-kilogram-introduced-scli-intl-scn/index.html',
    },
  },
  {
    moduleSlug: 'obliczenia-praktyczne',
    slug: 'obliczenia-zegarowe',
    kind: 'lekcja',
    number: 5,
    title: 'Obliczenia zegarowe — godziny, minuty, sekundy, upływ czasu',
    short: 'Obliczenia zegarowe',
    goal: 'Zamieniaj godziny, minuty i sekundy między sobą i licz upływ czasu metodą doliczania po tarczy zegara.',
    description:
      'Obliczenia zegarowe metodą doliczania — skoki po tarczy zegara liczące upływ czasu, zamiana godzin na minuty i sobotni plan dnia jako zadanie.',
    duration: '35–40 min',
    topics: [4],
    status: 'available',
    funFact: {
      title: 'Przez wieki zegary miały tylko jedną wskazówkę',
      text: 'Może się wydawać, że zegar zawsze miał wskazówkę godzinową, minutową i sekundową — a jednak przez setki lat wystarczała jedna, godzinowa. Ówczesne mechanizmy myliły się nawet o kilkanaście minut na dobę, więc odczytywanie minut i tak nie miało większego sensu. Dopiero w 1656 roku holenderski uczony Christiaan Huygens zbudował pierwszy zegar wahadłowy, który poprawił dokładność aż sześćdziesięciokrotnie. Ta nowa precyzja sprawiła, że dopiero od około 1690 roku zegarmistrzowie zaczęli dodawać do tarczy wskazówkę minutową — dokładnie tę, której dziś używasz do liczenia upływu czasu.',
      sourceLabel: 'History of Information — Huygens Invents the Pendulum Clock',
      sourceUrl: 'https://www.historyofinformation.com/detail.php?entryid=3506',
    },
  },
  {
    moduleSlug: 'obliczenia-praktyczne',
    slug: 'obliczenia-kalendarzowe',
    kind: 'lekcja',
    number: 6,
    title: 'Obliczenia kalendarzowe — dni, tygodnie, miesiące, lata zwykłe i przestępne',
    short: 'Obliczenia kalendarzowe',
    goal: 'Zamieniaj dni na tygodnie i odwrotnie, i licz upływ dni po prawdziwym kalendarzu, nawet przez kilka miesięcy naraz.',
    description:
      'Obliczenia kalendarzowe — skoki po prawdziwym kalendarzu liczące upływ dni przez granice miesięcy, zamiana dni na tygodnie i obóz sportowy jako zadanie.',
    duration: '35–40 min',
    topics: [5],
    status: 'available',
    funFact: {
      title: 'Tydzień ma 7 dni, bo tyle „wędrujących gwiazd” widać było gołym okiem',
      text: 'Słońce, Księżyc i pięć planet — Merkury, Wenus, Mars, Jowisz i Saturn — to jedyne ciała niebieskie, które starożytni Babilończycy mogli zobaczyć bez teleskopu i zauważyli, że „wędrują” na tle gwiazd. Skoro było ich akurat siedem, podzielili miesiąc księżycowy na odcinki po siedem dni. Rzymianie przez długi czas używali obok siebie tygodnia siedmio- i ośmiodniowego, dopóki cesarz Konstantyn Wielki nie ogłosił 7 marca 321 roku, że w całym Cesarstwie Rzymskim obowiązuje tydzień siedmiodniowy — z dies Solis, „dniem Słońca”, jako dniem odpoczynku. Właśnie stamtąd wzięła się nasza dzisiejsza niedziela.',
      sourceLabel: 'Astronomy.com — Why are there 7 days in a week?',
      sourceUrl: 'https://www.astronomy.com/science/why-are-there-7-days-in-a-week-thank-the-babylonians/',
    },
  },
  {
    // Zawsze ostatnia pozycja modułu — number = (numer ostatniej lekcji + 1),
    // nigdy `beforeTopic`/`+0.5` jak przewodniki.
    moduleSlug: 'obliczenia-praktyczne',
    slug: 'podsumowanie',
    kind: 'podsumowanie',
    number: 7,
    title: 'Powtórzenie i sprawdzian modułowy',
    short: 'Podsumowanie modułu',
    goal: 'Powtórz wszystkie 6 lekcji modułu w trzech tematycznych blokach i sprawdź, co warto jeszcze utrwalić.',
    description:
      'Powtórzenie i sprawdzian modułu „Obliczenia praktyczne”: trzy bloki tematyczne obejmujące wszystkie 6 lekcji modułu, z rekomendacją, co warto powtórzyć.',
    duration: '20–25 min',
    topics: [6],
    status: 'available',
    funFact: {
      title: 'Jedna dodatkowa sekunda w roku potrafi unieruchomić pół internetu',
      text: 'Ziemia nie obraca się wokół własnej osi idealnie równo, więc czasem trzeba dodać „sekundę przestępną", żeby zegary atomowe zgadzały się z prawdziwym czasem na Ziemi. 30 czerwca 2012 roku, gdy do doby dodano taką dodatkową sekundę, komputery wielu popularnych serwisów — w tym Reddita, Mozilli, LinkedIn i Yelp — nie wiedziały, jak obsłużyć minutę trwającą 61 sekund zamiast 60. Programy zawiesiły się w nieskończonej pętli, zużywając cały procesor, a strony przestały działać na kilkadziesiąt minut. Ten sam „razy 60", którego się dziś nauczyłeś/aś, potrafi więc czasem wywrócić do góry nogami nawet największe strony internetu — wystarczy jedna sekunda za dużo.',
      sourceLabel: 'Webopedia — Leap second bug',
      sourceUrl: 'https://www.webopedia.com/definitions/leap-second-bug/',
    },
  },
  {
    moduleSlug: 'obliczenia-praktyczne',
    slug: 'przewodnik-cyfry-rzymskie',
    kind: 'przewodnik',
    // 0 sortuje przewodnik przed lekcją 1 i czyta się jako „zanim zaczniesz”.
    number: 0,
    title: 'Cyfry rzymskie: przewodnik od zera',
    short: 'Przewodnik: cyfry rzymskie',
    goal: 'Poznaj siedem symboli i zasady zapisu, zanim zaczniesz zamieniać liczby.',
    description:
      'Siedem symboli rzymskich (I, V, X, L, C, D, M), rytm ×5 i ×2, zasada dodawania i sześć par odejmowania — przewodnik dla klasy 4 przed lekcją o cyfrach.',
    duration: '8–10 min',
    topics: [],
    beforeTopic: 0,
    status: 'available',
  },

  // Zaślepki (`status: 'soon'`) zaplanowane 2026-08-10 — po jednym przewodniku
  // na temat/klaster tematów w pozostałych modułach, który jest „arbitralną
  // konwencją do zapamiętania" albo „słownictwem, na którym lekcje się opierają,
  // ale nigdy go wprost nie uczą". Moduły 3–8 nie mają
  // dziś żadnej prawdziwej lekcji, więc mapowanie temat→numer lekcji online jest
  // nieznane (jedna lekcja może objąć 1–3 tematy) — `number` poniżej jest
  // prowizoryczny (0 dla przewodnika otwierającego moduł, `topicIndex + 0.5`
  // dla wpiętego głębiej) i wymaga ponownej weryfikacji dopiero gdy w danym
  // module powstaną realne lekcje (ta sama pułapka co przy
  // `przewodnik-kolejnosc-dzialan` wyżej).
  {
    moduleSlug: 'obliczenia-praktyczne',
    slug: 'przewodnik-jednostki-miary',
    kind: 'przewodnik',
    number: 2.5,
    title: 'Jednostki długości i masy: przedrostki i zamiana',
    short: 'Przewodnik: jednostki miary',
    goal: 'Poznaj przedrostki mili-, centy-, decy-, deka- i kilo- oraz zasadę zamiany jednostek długości i masy, zanim zaczniesz przeliczać milimetry na kilometry i gramy na tony.',
    description:
      'Skąd się biorą mm, cm, dm, m, km oraz g, dag, kg, tona — przedrostki miar i mnożenie/dzielenie przez 10 przy zamianie jednostek. Przewodnik dla klasy 4.',
    duration: '8–10 min',
    topics: [],
    beforeTopic: 2,
    status: 'available',
  },
  {
    moduleSlug: 'obliczenia-praktyczne',
    slug: 'przewodnik-zegar',
    kind: 'przewodnik',
    number: 4.5,
    title: 'Zegar: jak odczytywać czas',
    short: 'Przewodnik: zegar',
    goal: 'Poznaj podział doby na godziny, minuty i sekundy oraz zapis 12- i 24-godzinny, zanim zaczniesz liczyć upływ czasu.',
    description:
      'Jak odczytywać czas: wskazówki zegara, minuty i sekundy oraz zapis 12- i 24-godzinny z „rano”/„po południu” — przewodnik dla klasy 4.',
    duration: '8–10 min',
    topics: [],
    beforeTopic: 4,
    status: 'available',
  },
  {
    moduleSlug: 'obliczenia-praktyczne',
    slug: 'przewodnik-kalendarz',
    kind: 'przewodnik',
    number: 5.5,
    title: 'Kalendarz: dni, miesiące i lata przestępne',
    short: 'Przewodnik: kalendarz',
    goal: 'Poznaj liczbę dni w miesiącach, nazwy dni tygodnia i zasadę roku przestępnego, zanim zaczniesz liczyć upływ dni i tygodni.',
    description:
      'Ile dni ma każdy miesiąc, dlaczego co cztery lata luty ma 29 dni i jak liczyć upływ dni i tygodni — przewodnik po kalendarzu dla klasy 4.',
    duration: '8–10 min',
    topics: [],
    beforeTopic: 5,
    status: 'available',
  },
  {
    moduleSlug: 'dzialania-pisemne',
    slug: 'przewodnik-zapis-pisemny',
    kind: 'przewodnik',
    number: 0,
    title: 'Zapis działań pisemnych: ustawianie liczb, przenoszenie, pożyczanie',
    short: 'Przewodnik: zapis pisemny',
    goal: 'Poznaj zasady ustawiania liczb w słupku oraz oznaczenia przeniesienia i pożyczenia, zanim zaczniesz liczyć pisemnie.',
    description:
      'Dlaczego liczby ustawiamy rząd pod rzędem, co oznacza mała cyfra przeniesienia i jak zapisać pożyczanie przy odejmowaniu — przewodnik dla klasy 4.',
    duration: '8–10 min',
    topics: [],
    beforeTopic: 0,
    status: 'available',
  },
  {
    moduleSlug: 'dzialania-pisemne',
    slug: 'dodawanie-pisemne',
    kind: 'lekcja',
    number: 1,
    title: 'Dodawanie pisemne liczb wielocyfrowych',
    short: 'Dodawanie pisemne',
    goal: 'Naucz się dodawać liczby wielocyfrowe w słupku — kolumna po kolumnie, z przenoszeniem, aż po liczby czterocyfrowe.',
    description:
      'Dodawanie pisemne liczb wielocyfrowych kolumna po kolumnie z przenoszeniem, cztery przykłady i sprawdzanie paragonu ze sklepu jako zadanie problemowe.',
    duration: '30–35 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'W 1946 roku liczydło pokonało elektryczny kalkulator w dodawaniu',
      text: '12 listopada 1946 roku w Tokio zorganizowano niezwykły pojedynek: japoński mistrz liczenia na liczydle (soroban), Kiyoshi Matsuzaki, stanął naprzeciw żołnierza armii USA, Thomasa Nathana Wooda — uznanego za najlepszego w Japonii operatora elektrycznego kalkulatora. Zawody, zorganizowane przez wojskową gazetę Stars and Stripes, obejmowały dodawanie, odejmowanie, mnożenie, dzielenie i zadanie łączące wszystkie cztery działania naraz. Liczydło pokonało nowoczesną maszynę elektryczną 4:1, przegrywając tylko w mnożeniu — w dodawaniu, czyli w tym, czego się dziś nauczyłeś/aś, ręczne liczenie okazało się szybsze niż elektronika. Gazeta napisała wtedy, że „epoka maszyn cofnęła się o krok”.',
      sourceLabel: 'History of Information — A Soroban Beats an Electric Calculator',
      sourceUrl: 'https://www.historyofinformation.com/detail.php?id=1361',
    },
  },
  {
    moduleSlug: 'dzialania-pisemne',
    slug: 'odejmowanie-pisemne',
    kind: 'lekcja',
    number: 2,
    title: 'Odejmowanie pisemne — z przekraczaniem progu i „pożyczaniem” od zer',
    short: 'Odejmowanie pisemne',
    goal: 'Naucz się odejmować liczby wielocyfrowe w słupku — z pożyczaniem, także wtedy, gdy pożyczka musi przejść przez kolumnę z zapisanym zerem.',
    description:
      'Odejmowanie pisemne z pożyczaniem — także od zer w kolumnie — kolumna po kolumnie, z liczeniem reszty z zakupów jako zadaniem problemowym.',
    duration: '30–35 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Znak „−” ma ponad 500 lat i pierwotnie w ogóle nie oznaczał odejmowania',
      text: 'Symbole „+” i „−”, których dziś używasz w każdym odejmowaniu pisemnym, po raz pierwszy pojawiły się w druku w 1489 roku, w podręczniku niemieckiego matematyka Johannesa Widmanna „Behende und hüpsche Rechenung auff allen Kauffmanschafft” (czyli „Zgrabny i sprawny rachunek dla wszelkiego kupiectwa”). Widmann nie używał ich jednak jako znaków działań — służyły kupcom do zaznaczania nadwyżki (+) i niedoboru (−) towaru w magazynie. Sam autor tłumaczył to wprost: „was − ist, das ist minus, und das + ist das mer” („co jest minus, to jest minus, a plus to jest więcej”). Dopiero w kolejnych dziesięcioleciach matematycy zaczęli przejmować te same symbole do zapisywania dodawania i odejmowania — i tak zostało już na ponad pięćset lat.',
      sourceLabel: 'MacTutor History of Mathematics — Johannes Widman',
      sourceUrl: 'https://mathshistory.st-andrews.ac.uk/Biographies/Widman/',
    },
  },
  {
    moduleSlug: 'dzialania-pisemne',
    slug: 'mnozenie-pisemne-jednocyfrowa',
    kind: 'lekcja',
    number: 3,
    title: 'Mnożenie pisemne przez liczbę jednocyfrową',
    short: 'Mnożenie pisemne',
    goal: 'Naucz się mnożyć liczby wielocyfrowe przez liczbę jednocyfrową w słupku — z przeniesieniem, które może wynosić więcej niż 1.',
    description:
      'Mnożenie pisemne przez liczbę jednocyfrową kolumna po kolumnie, z przeniesieniem, oraz wyszukiwanie błędu w cudzym rachunku jako zadanie problemowe.',
    duration: '30–35 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Rekordzistka pomnożyła w pamięci dwie 13-cyfrowe liczby w zaledwie 28 sekund',
      text: '18 czerwca 1980 roku w Imperial College London indyjska „ludzka kalkulatorka” Shakuntala Devi dostała do pomnożenia w pamięci dwie losowo wybrane 13-cyfrowe liczby: 7 686 369 774 870 oraz 2 465 099 745 779. Już po 28 sekundach podała poprawny wynik — 25-cyfrową liczbę 18 947 668 177 995 426 462 773 730 — i trafiła do Księgi Rekordów Guinnessa jako autorka najszybszego obliczenia w pamięci w historii. Ty dziś liczysz mnożenie w słupku na papierze, z przeniesieniem co najwyżej do 8 — ona robiła w głowie coś nieporównywalnie trudniejszego, i to szybciej, niż zdążyłbyś/abyś to przepisać.',
      sourceLabel: 'Guinness World Records — Fastest human computation',
      sourceUrl: 'https://www.guinnessworldrecords.com/world-records/67741-human-computation',
    },
  },
  {
    moduleSlug: 'dzialania-pisemne',
    slug: 'mnozenie-pisemne-wielocyfrowa',
    kind: 'lekcja',
    number: 4,
    title: 'Mnożenie pisemne przez liczbę wielocyfrową',
    short: 'Mnożenie przez liczbę wielocyfrową',
    goal: 'Naucz się mnożyć liczby wielocyfrowe w słupku przez mnożnik wielocyfrowy — przez iloczyny cząstkowe, przesunięcie i dodawanie.',
    description:
      'Mnożenie pisemne przez liczbę wielocyfrową: iloczyny cząstkowe, przesunięcie o kolumnę oraz ich dodawanie, a na koniec wyszukiwanie brakującego przesunięcia w cudzym rachunku.',
    duration: '35–40 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Liczenie w zeszycie, a nie na tacy z piaskiem, ma jednego konkretnego wynalazcę',
      text: 'Zanim ludzie zaczęli liczyć mnożenie pisemne w zeszycie, matematycy na Bliskim Wschodzie liczyli metodami hinduskimi na desce pokrytej piaskiem — cyfry ścierało się palcem i przepisywało w trakcie liczenia, tak jak Ty dziś ścierasz coś gumką. Problem w tym, że na papierze nic się nie wyciera. Syryjski matematyk al-Uqlidisi, w książce napisanej w Damaszku w latach 952–953, jako pierwszy pokazał, jak te same metody liczenia — również mnożenie liczb wielocyfrowych — zapisać piórem na papierze, kolumna po kolumnie, bez ścierania niczego po drodze. Ten pomysł sprzed ponad tysiąca lat jest początkiem liczenia „w słupku”, którego uczysz się dziś.',
      sourceLabel: 'MacTutor History of Mathematics — Al-Uqlidisi',
      sourceUrl: 'https://mathshistory.st-andrews.ac.uk/Biographies/Al-Uqlidisi/',
    },
  },
  {
    moduleSlug: 'dzialania-pisemne',
    slug: 'mnozenie-zakonczone-zerami',
    kind: 'lekcja',
    number: 5,
    title: 'Mnożenie liczb zakończonych zerami — usprawnienia',
    short: 'Mnożenie liczb zakończonych zerami',
    goal: 'Naucz się skrótu: obetnij zera końcowe obu czynników, pomnóż to, co zostało, i doklej zera z powrotem.',
    description:
      'Skrót na mnożenie liczb zakończonych zerami: obcinanie zer końcowych, mnożenie rdzenia i doklejanie zer z powrotem — z pułapką rdzenia, który sam kończy się zerem.',
    duration: '30–35 min',
    topics: [4],
    status: 'available',
    funFact: {
      title: 'Szybkie liczenie w głowie wymyślił w nazistowskim więzieniu',
      text: 'Podczas II wojny światowej rosyjsko-żydowski inżynier Jakow Trachtenberg trafił do nazistowskiego więzienia za publiczną krytykę Hitlera. Żeby nie oszaleć w celi, zaczął w głowie układać błyskawiczne sposoby mnożenia i dzielenia dużych liczb — bez kartki, tylko z pamięci. Po wojnie, w 1950 roku, założył w Zurychu Instytut Matematyczny, gdzie uczył swojej metody dzieci uznawanych za „beznadziejne” z matematyki — wiele z nich zaczęło liczyć szybciej niż rówieśnicy. Duch jego metody jest dokładnie taki jak w tej lekcji: zamiast liczyć całość od razu, rozbij działanie na prostszy kawałek, a resztę dołóż na końcu.',
      sourceLabel: 'Wikipedia — Trachtenberg system',
      sourceUrl: 'https://en.wikipedia.org/wiki/Trachtenberg_system',
    },
  },
  {
    moduleSlug: 'dzialania-pisemne',
    slug: 'dzielenie-pisemne',
    kind: 'lekcja',
    number: 6,
    title: 'Dzielenie pisemne przez liczbę jednocyfrową (wprowadzenie)',
    short: 'Dzielenie pisemne',
    goal: 'Poznaj mechanizm dzielenia pisemnego przez liczbę jednocyfrową — pierwsze wprowadzenie, pełne opanowanie przyjdzie w kolejnych latach.',
    description:
      'Dzielenie pisemne przez liczbę jednocyfrową krok po kroku: liczenie od lewej, łączenie cyfr na start i pułapka zera w środku ilorazu — wprowadzenie dla klasy 4.',
    duration: '35–40 min',
    topics: [5],
    status: 'available',
    funFact: {
      title: 'Znak ÷ wymyśliły naraz dwie osoby — i nikt nie wie, która pierwsza',
      text: 'Znak ÷, którego używasz w każdym dzieleniu pisemnym, pojawił się po raz pierwszy w druku w 1659 roku, w szwajcarskiej książce „Teutsche Algebra” Johanna Rahna. Rahn prawdopodobnie zobaczył go wcześniej u swojego prywatnego nauczyciela, angielskiego matematyka Johna Pella, podczas lekcji — więc nikt do dziś nie jest pewien, który z nich naprawdę go wymyślił. Gdy dziewięć lat później szykowano angielskie wydanie książki, tłumacz zastąpił ÷ inną notacją, żeby ułatwić druk — ale Pell, który dołączył do prac nad przekładem, uparł się i kazał przywrócić znak dokładnie taki, jaki zapisał Rahn.',
      sourceLabel: 'MacTutor History of Mathematics — Johann Rahn',
      sourceUrl: 'https://mathshistory.st-andrews.ac.uk/Biographies/Rahn/',
    },
  },
  {
    moduleSlug: 'dzialania-pisemne',
    slug: 'zadania-tekstowe-pisemne',
    kind: 'lekcja',
    number: 7,
    title: 'Zadania tekstowe z działaniami pisemnymi',
    short: 'Zadania tekstowe pisemne',
    goal: 'Naucz się rozwiązywać zadania tekstowe z dużymi liczbami: rozpoznaj, jakiego działania pisemnego potrzebujesz, oszacuj wynik z grubsza, a potem policz go dokładnie — także w dwóch krokach naraz.',
    description:
      'Zadania tekstowe z liczbami wymagającymi dodawania, odejmowania, mnożenia i dzielenia pisemnego — szacowanie przed liczeniem oraz zadanie dwuetapowe, dla klasy 4.',
    duration: '35–40 min',
    topics: [6],
    status: 'available',
    funFact: {
      title: 'Najstarsze znane zadania tekstowe mają prawie 3700 lat',
      text: 'Papirus Rhinda — jeden z najstarszych zachowanych zwojów matematycznych na świecie, długi na około 6 metrów — spisał w Egipcie około 1650 roku p.n.e. skryba imieniem Ahmes. Sam zaznaczył, że przepisuje jeszcze starszy dokument sprzed prawie 200 lat, czyli z około 1850 roku p.n.e. Zwój, dziś przechowywany w British Museum w Londynie, zawiera 87 zadań — a sześć pierwszych to zadania tekstowe: podziel odpowiednio 1, 2, 6, 7, 8 i 9 bochenków chleba między 10 mężczyzn. Metoda, której uczysz się dziś — czytaj uważnie, znajdź dane i pytanie, policz — działa więc dokładnie tak samo, jak działała prawie 3700 lat temu.',
      sourceLabel: 'MacTutor History of Mathematics — Egyptian mathematics',
      sourceUrl: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Egyptian_mathematics/',
    },
  },
  {
    // Zawsze ostatnia pozycja modułu — number = (numer ostatniej lekcji + 1),
    // nigdy `beforeTopic`/`+0.5` jak przewodniki.
    moduleSlug: 'dzialania-pisemne',
    slug: 'podsumowanie',
    kind: 'podsumowanie',
    number: 8,
    title: 'Powtórzenie i sprawdzian modułowy',
    short: 'Podsumowanie modułu',
    goal: 'Powtórz wszystkie 7 lekcji modułu w trzech tematycznych blokach i sprawdź, co warto jeszcze utrwalić.',
    description:
      'Powtórzenie i sprawdzian modułu „Działania pisemne”: trzy bloki tematyczne obejmujące wszystkie 7 lekcji modułu, z rekomendacją, co warto powtórzyć.',
    duration: '25–30 min',
    topics: [7],
    status: 'available',
    funFact: {
      title: 'Zanim John Glenn poleciał na orbitę, kazał sprawdzić komputer ręcznie',
      text: 'Przed lotem na orbitę Ziemi w lutym 1962 roku amerykański astronauta John Glenn miał do dyspozycji trajektorię lotu policzoną przez komputery IBM w NASA. Nie do końca im ufał — maszyny tamtych czasów potrafiły się zawieszać w najmniej odpowiednim momencie. Zażądał więc, żeby te same równania, krok po kroku, przeliczyła jeszcze raz na swoim biurkowym kalkulatorze matematyczka NASA Katherine Johnson. „Jeśli ona powie, że wyniki się zgadzają — jestem gotów lecieć” — miał podobno powiedzieć inżynierom. Johnson przeliczyła wszystko ręcznie, wynik zgadzał się z komputerem co do joty, a 20 lutego 1962 roku Glenn bezpiecznie okrążył Ziemię trzy razy. Dokładnie to robisz teraz w tym podsumowaniu: sprawdzasz krok po kroku, co już naprawdę umiesz policzyć.',
      sourceLabel: 'NASA — Katherine Johnson Biography',
      sourceUrl: 'https://www.nasa.gov/centers-and-facilities/langley/katherine-johnson-biography/',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'przewodnik-jezyk-geometrii',
    kind: 'przewodnik',
    number: 0,
    title: 'Język geometrii: jak nazywamy i oznaczamy figury',
    short: 'Przewodnik: język geometrii',
    goal: 'Poznaj sposób oznaczania punktów, prostych i kątów literami oraz symbole ⊥, ∥ i °, zanim zaczniesz rysować i mierzyć figury.',
    description:
      'Oznaczanie punktów dużymi literami, nazwy odcinków i prostych oraz symbole ⊥, ∥ i ° — przewodnik po języku geometrii dla klasy 4, przed rysowaniem figur.',
    duration: '8–10 min',
    topics: [],
    beforeTopic: 0,
    status: 'available',
  },
  {
    moduleSlug: 'geometria',
    slug: 'punkt-prosta-polprosta-odcinek',
    kind: 'lekcja',
    number: 1,
    title: 'Punkt, prosta, półprosta, odcinek',
    short: 'Punkt, prosta, półprosta, odcinek',
    goal: 'Odróżnij cztery najprostsze obiekty geometrii i naucz się poprawnie je nazywać, zanim zaczniesz z nich budować figury.',
    description:
      'Punkt, prosta, półprosta i odcinek — przeciągane punkty budujące na żywo wszystkie cztery obiekty, rozpoznawanie i nazywanie ich oraz łamigłówka z liczeniem odcinków między punktami.',
    duration: '30–35 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Definicja punktu sprzed 2300 lat',
      text: 'Około 300 roku p.n.e. grecki matematyk Euklides spisał w swoich „Elementach” pierwsze znane formalne definicje geometrii — punkt określił jako „to, co nie ma części”, a linię jako „długość bez szerokości”. „Elementy” stały się jednym z najczęściej kopiowanych i wydawanych podręczników w historii — w wielu krajach uczono z nich geometrii nieprzerwanie aż do początku XX wieku, ponad 2200 lat po ich powstaniu. Definicja punktu, której się dziś uczysz, jest właściwie taka sama, jaką zapisał Euklides.',
      sourceLabel: 'MacTutor History of Mathematics (University of St Andrews)',
      sourceUrl: 'https://mathshistory.st-andrews.ac.uk/Biographies/Euclid/',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'proste-prostopadle-rownolegle',
    kind: 'lekcja',
    number: 2,
    title: 'Proste i odcinki prostopadłe i równoległe — rysowanie ekierką i linijką',
    short: 'Proste prostopadłe i równoległe',
    goal: 'Odróżnij proste prostopadłe od równoległych i narysuj je ekierką oraz linijką, jak prawdziwy geometra.',
    description:
      'Proste prostopadłe i równoległe: laboratoryjny widżet z obracaną prostą odkrywający obie relacje, rysowanie ekierką i linijką oraz plan osiedla z liczeniem par ulic.',
    duration: '30–35 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Egipscy mierniczy wyznaczali kąty proste sznurem',
      text: 'W starożytnym Egipcie granice pól i fundamenty budowli mierzyli harpedonaptowie — „rozciągacze sznurów”, którzy wyznaczali teren sznurami z węzłami, rozciągniętymi tak, żeby nie opadały. Ich rzemiosło jest udokumentowane na przestrzeni ponad 3000 lat, a kąt prosty pomagała wyznaczyć matematyczna sztuczka: sznur o 12 równych odcinkach, związany w pętlę i rozciągnięty w trójkąt o bokach 3, 4 i 5, zawsze tworzy kąt prosty. Historycy spierają się, czy Egipcjanie stosowali właśnie tę sztuczkę, ale ich sznury i piony to udokumentowany fakt — a trójkąt 3–4–5 do dziś nazywa się trójkątem egipskim.',
      sourceLabel: 'Wikipedia — Rope stretcher',
      sourceUrl: 'https://en.wikipedia.org/wiki/Rope_stretcher',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'mierzenie-odcinkow',
    kind: 'lekcja',
    number: 3,
    title: 'Mierzenie odcinków z dokładnością do 1 mm',
    short: 'Mierzenie odcinków',
    goal: 'Naucz się przykładać linijkę tak, żeby zero trafiało w początek odcinka, i odczytuj długość z dokładnością do pojedynczego milimetra.',
    description:
      'Mierzenie odcinków linijką z dokładnością do 1 mm: interaktywna linijka do przeciągania, odczyty przykładowych pomiarów i tropienie klasycznego błędu — mierzenia od krawędzi linijki zamiast od zera.',
    duration: '30–35 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Siedem lat pomiarów, żeby wyznaczyć jeden metr',
      text: 'W 1792 roku dwóch francuskich astronomów, Jean-Baptiste Delambre i Pierre Méchain, wyruszyło w podróż, która miała na nowo zdefiniować metr — jako jedną dziesięciomilionową część odległości od bieguna północnego do równika, mierzoną wzdłuż południka przechodzącego przez Paryż. Przez siedem lat, mimo rewolucji francuskiej i aresztowań po drodze, mierzyli łańcuchem pomiarowym odcinek południka między Dunkierką a Barceloną, punkt po punkcie, żeby na tej podstawie wyliczyć długość metra z dokładnością, jaka wtedy w ogóle była możliwa. Każda linijka, którą dziś odczytujesz co do milimetra, odmierza fragmenty jednostki, za którą stoi ta wieloletnia wyprawa.',
      sourceLabel: 'Wikipedia — History of the metre',
      sourceUrl: 'https://en.wikipedia.org/wiki/History_of_the_metre',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'katy-i-katomierz',
    kind: 'lekcja',
    number: 4,
    title: 'Kąty — ramiona, wierzchołek i pomiar kątomierzem',
    short: 'Kąty i kątomierz',
    goal: 'Nazwij części kąta — wierzchołek i ramiona — i naucz się poprawnie odczytywać jego miarę kątomierzem, nawet gdy ma dwie podziałki.',
    description:
      'Wierzchołek, ramiona i pomiar kątomierzem — jak poprawnie przyłożyć kątomierz i odczytać właściwą podziałkę. Interaktywna lekcja geometrii dla klasy 4.',
    duration: '30–35 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Dlaczego pełny kąt to akurat 360°?',
      text: 'Ponad 2500 lat temu babilońscy astronomowie obserwowali, jak Słońce co roku wędruje po tej samej trasie na niebie. Uznali, że rok trwa mniej więcej 360 dni — 12 miesięcy po 30 dni — więc podzielili tę trasę na 360 równych kawałków, jeden na każdy „dzień” wędrówki Słońca. Grecki astronom Hipparch z Rodos, żyjący w II wieku p.n.e., przejął ten podział do swoich obliczeń geometrycznych na okręgu — i tak liczba 360 trafiła do każdego kątomierza, którego dziś używasz.',
      sourceLabel: 'TIME — A Brief History of the 360-Degree Circle',
      sourceUrl: 'https://time.com/5813871/history-360-degrees-circle/',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'rodzaje-katow',
    kind: 'lekcja',
    number: 5,
    title: 'Rodzaje kątów: ostry, prosty, rozwarty; kąty wierzchołkowe i przyległe',
    short: 'Rodzaje kątów',
    goal: 'Nazywaj kąty według ich miary i odkryj, jak są ze sobą powiązane kąty powstające przy przecięciu dwóch prostych.',
    description:
      'Kąt ostry, prosty i rozwarty oraz kąty wierzchołkowe i przyległe — klasyfikacja kątów, dwie przecinające się proste i obliczanie brakujących miar bez mierzenia. Interaktywna lekcja geometrii dla klasy 4.',
    duration: '35–40 min',
    topics: [4],
    status: 'available',
    funFact: {
      title: 'Ten sam grecki uczony udowodnił to 2600 lat temu',
      text: 'Fakt, że kąty wierzchołkowe są zawsze równe, jest jednym z czterech twierdzeń geometrycznych przypisywanych Talesowi z Miletu — greckiemu filozofowi żyjącemu około 600 roku p.n.e., uznawanemu za pierwszego w historii, który zaczął formalnie dowodzić twierdzeń geometrycznych, zamiast tylko podawać je jako fakty. Starożytny komentator Proklos, piszący blisko tysiąc lat później, przypisał Talesowi właśnie to twierdzenie o kątach wierzchołkowych — obok trzech innych, równie podstawowych reguł geometrii. Kiedy dziś liczysz kąt naprzeciwległy bez mierzenia kątomierzem, korzystasz z dowodu sprzed niemal 2600 lat.',
      sourceLabel: 'MacTutor History of Mathematics — Thales of Miletus',
      sourceUrl: 'https://mathshistory.st-andrews.ac.uk/Biographies/Thales/',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'wielokaty',
    kind: 'lekcja',
    number: 6,
    title: 'Wielokąty — rozpoznawanie i nazywanie',
    short: 'Wielokąty',
    goal: 'Rozpoznaj, czym jest wielokąt, i nazywaj figury po liczbie boków: trójkąt, czworokąt, pięciokąt, sześciokąt.',
    description:
      'Czym jest wielokąt, jak odróżnić go od figur z krzywymi bokami albo niedomkniętych, i jak nazywać trójkąty, czworokąty, pięciokąty i sześciokąty. Interaktywna lekcja geometrii dla klasy 4.',
    duration: '35–40 min',
    topics: [5],
    status: 'available',
    funFact: {
      title: 'Dlaczego pszczoły budują komórki w kształcie sześciokąta?',
      text: 'Już w 36 roku p.n.e. rzymski uczony Marek Terencjusz Warron zauważył, że komórki plastra miodu mają kształt sześciokąta, a nie na przykład kwadratu czy trójkąta. Kilka wieków później grecki matematyk Pappus z Aleksandrii domyślił się dlaczego: sześciokąty pozwalają zbudować plaster z najmniejszą możliwą ilością wosku przy tej samej powierzchni komórek. Ale prawdziwy dowód matematyczny pojawił się dopiero w 1999 roku — amerykański matematyk Thomas Hales udowodnił to twierdzenie, nazywane dziś hipotezą plastra miodu. Prawie 2000 lat minęło między pierwszą obserwacją a pełnym dowodem tego, co pszczoły robią instynktownie.',
      sourceLabel: 'Wikipedia — Honeycomb conjecture',
      sourceUrl: 'https://en.wikipedia.org/wiki/Honeycomb_conjecture',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'prostokaty-i-kwadraty',
    kind: 'lekcja',
    number: 7,
    title: 'Prostokąty i kwadraty — własności i rysowanie',
    short: 'Prostokąty i kwadraty',
    goal: 'Poznaj własności prostokąta i kwadratu — kąty proste, boki naprzeciwległe — i naucz się je rysować linijką i ekierką.',
    description:
      'Prostokąt i kwadrat — przeciąganie rogu na siatce kratek pokazujące na żywo kąty proste i równość boków, oraz ramka na zdjęcie jako zadanie. Lekcja geometrii dla klasy 4.',
    duration: '30–35 min',
    topics: [6],
    status: 'available',
    funFact: {
      title: 'Kartka A4 ma sekretną właściwość, którą możesz sam/a sprawdzić',
      text: 'Przetnij kartkę A4 na pół, krótszym bokiem — dostaniesz dwa mniejsze prostokąty o dokładnie takim samym kształcie jak oryginał, tylko mniejsze. To arkusz A5! Dzieje się tak, bo stosunek dłuższego boku do krótszego wynosi w każdym formacie dokładnie tyle samo — pierwiastek z 2. Zauważył to niemiecki uczony Georg Christoph Lichtenberg już w liście z 1786 roku, ale świat zaczął z tego korzystać dopiero prawie 150 lat później: w 1922 roku niemiecki inżynier Walter Porstmann zamienił ten pomysł w normę DIN 476, z której powstał używany dziś na całym świecie standard ISO 216 — stąd nazwy A3, A4, A5 w każdej drukarce i zeszycie.',
      sourceLabel: 'Wikipedia — Paper size',
      sourceUrl: 'https://en.wikipedia.org/wiki/Paper_size',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'obwody-wielokatow',
    kind: 'lekcja',
    number: 8,
    title: 'Obwody wielokątów, prostokątów i kwadratów',
    short: 'Obwody wielokątów, prostokątów i kwadratów',
    goal: 'Naucz się liczyć obwód dowolnej figury jako sumę długości boków — i skróconych sposobów dla prostokąta i kwadratu.',
    description:
      'Obwód jako suma długości boków — animowane obejście figury dookoła, skróty 2 × (a + b) i 4 × bok oraz ogrodzenie ogródka jako zadanie. Lekcja geometrii dla klasy 4.',
    duration: '30–35 min',
    topics: [7],
    status: 'available',
    funFact: {
      title: 'Bieżnia na stadionie ma obwód dokładnie 400 metrów',
      text: 'Standardowa bieżnia lekkoatletyczna na dużym stadionie to owalny obwód liczący dokładnie 400 metrów — mierzony po wewnętrznej krawędzi pierwszego toru, 30 centymetrów od krawężnika. To dlatego jedno pełne okrążenie biegacza na torze pierwszym to zawsze 400 m, niezależnie od tego, w którym kraju czy na którym stadionie biegnie. Następnym razem, gdy będziesz biegać na W-Fie dookoła boiska, policz, ile takich okrążeń robi 1 kilometr.',
      sourceLabel: 'Wikipedia — Running track',
      sourceUrl: 'https://en.wikipedia.org/wiki/Running_track',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'przewodnik-slownik-kola',
    kind: 'przewodnik',
    number: 8.5,
    title: 'Słownik koła: środek, promień, średnica, cięciwa',
    short: 'Przewodnik: słownik koła',
    goal: 'Poznaj nazwy części koła i okręgu — środek, promień, średnica i cięciwa — zanim lekcje zaczną z nich korzystać.',
    description:
      'Czym różni się koło od okręgu i co to jest środek, promień, średnica i cięciwa — przewodnik po słownictwie koła dla klasy 4.',
    duration: '8–10 min',
    topics: [],
    beforeTopic: 8,
    status: 'available',
  },
  {
    moduleSlug: 'geometria',
    slug: 'kola-i-okregi',
    kind: 'lekcja',
    number: 9,
    title: 'Koła i okręgi — środek, promień, średnica, cięciwa',
    short: 'Koła i okręgi',
    goal: 'Narysuj okrąg cyrklem o zadanym promieniu i policz pierwszą zależność geometryczną: średnica to zawsze 2 × promień.',
    description:
      'Rysowanie okręgu cyrklem, zależność średnica = 2 × promień i rozpoznawanie promienia, średnicy i cięciwy na rysunku. Interaktywna lekcja geometrii dla klasy 4.',
    duration: '35–40 min',
    topics: [8],
    status: 'available',
    funFact: {
      title: 'Najstarsze koło na świecie ma prawie 5150 lat',
      text: 'W 2002 roku archeolodzy wydobyli z bagien pod Lublaną, na terenie dzisiejszej Słowenii, drewniane koło z osią. Datowanie radiowęglowe umieściło je między 3350 a 3100 rokiem p.n.e. — to najstarsze znane na świecie koło z osią, jakie kiedykolwiek znaleziono, starsze nawet od głównej budowy Stonehenge. Ma około 72 centymetrów średnicy i dziś można je oglądać w Muzeum Miejskim w Lublanie.',
      sourceLabel: 'Wikipedia — Ljubljana Marshes Wheel',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'symetria-osiowa',
    kind: 'lekcja',
    number: 10,
    title: 'Figury osiowosymetryczne — oś symetrii',
    short: 'Symetria osiowa',
    goal: 'Rozpoznaj i policz osie symetrii figury, a odbicie punktu względem osi przećwicz, budując drugą połowę latawca.',
    description:
      'Oś symetrii, lustrzane odbicie punktu i liczenie osi symetrii różnych figur — interaktywna lekcja geometrii dla klasy 4, z budową symetrycznego latawca.',
    duration: '35–40 min',
    topics: [9],
    status: 'available',
    funFact: {
      title: 'Cały budynek zaprojektowany wokół jednej linii',
      text: 'Tadź Mahal w indyjskim mieście Agra, wzniesiony w latach 1632–1653 na polecenie władcy Szahdżahana, jest jednym z najsłynniejszych na świecie przykładów symetrii osiowej w architekturze — jego fasada, minarety, kopuła i otaczające ogrody są rozmieszczone dokładnie lustrzanie względem jednej, centralnej osi biegnącej przez grobowiec i sadzawkę przed budynkiem. UNESCO wpisało go na Listę Światowego Dziedzictwa w 1983 roku, częściowo właśnie za tę precyzję. Wystarczy jedna oś, a cały ogromny kompleks składa się w dwie identyczne, lustrzane połówki.',
      sourceLabel: 'UNESCO World Heritage Centre — Taj Mahal',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'przewodnik-skala',
    kind: 'przewodnik',
    number: 10.5,
    title: 'Skala: jak czytać plan i mapę',
    short: 'Przewodnik: skala',
    goal: 'Poznaj, co oznacza zapis skali typu 1:100, zanim zaczniesz liczyć długości rzeczywiste i odczytywać plany.',
    description:
      'Co oznacza zapis skali 1:100 i jak przeliczyć długość na planie na długość rzeczywistą (i odwrotnie) — przewodnik dla klasy 4.',
    duration: '8–10 min',
    topics: [],
    beforeTopic: 10,
    status: 'available',
  },
  {
    moduleSlug: 'geometria',
    slug: 'skala',
    kind: 'lekcja',
    number: 11,
    title: 'Skala — długość rzeczywista i w skali, czytanie planu i mapy',
    short: 'Skala',
    goal: 'Przelicz długość ze skali na rzeczywistość i odwrotnie, i użyj tego do odczytania prawdziwej odległości z planu i mapy.',
    description:
      'Przeliczanie długości w skali 1:100, 1:1000 i innych, w obie strony — plus czytanie prawdziwej odległości z planu pokoju i mapy. Interaktywna lekcja geometrii dla klasy 4.',
    duration: '35–40 min',
    topics: [10],
    status: 'available',
    funFact: {
      title: 'Największa mapa świata narysowana na trawniku',
      text: 'W 2012 roku w chińskim mieście Pekin przygotowano gigantyczną mapę świata z trawy i innych naturalnych materiałów o powierzchni ponad 24 tysięcy metrów kwadratowych — na tyle dużą, że w całości dało się ją zobaczyć dopiero z lotu ptaka. Guinness World Records potwierdził ją jako największą mapę świata na świecie w tamtym czasie. Nawet tak ogromna mapa wciąż jest zbudowana według tej samej zasady, której się dziś uczysz — po prostu ze skalą pomniejszającą naszą planetę o mniej razy niż zwykła mapa w atlasie.',
      sourceLabel: 'Guinness World Records — Largest map of the world',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'rysunek-pomocniczy',
    kind: 'lekcja',
    number: 12,
    title: 'Rysunek pomocniczy jako strategia rozwiązywania zadań',
    short: 'Rysunek pomocniczy',
    goal: 'Dobierz odpowiedni rysunek (schemat belkowy, oś liczbową albo szkic) do zadania tekstowego i użyj go, żeby znaleźć potrzebne działanie.',
    description:
      'Rysunek pomocniczy jako strategia rozwiązywania zadań tekstowych — dobór schematu do zadania, budowanie modelu belkowego i pomijanie podpuch. Interaktywna lekcja geometrii dla klasy 4.',
    duration: '35–40 min',
    topics: [11],
    status: 'available',
    funFact: {
      title: 'Węgierski matematyk spisał tę strategię prawie 80 lat temu',
      text: 'W 1945 roku węgiersko-amerykański matematyk George Pólya wydał książkę „Jak to rozwiązać?” (ang. „How to Solve It”), w której opisał uniwersalną metodę radzenia sobie z trudnymi zadaniami — jednym z jej kroków jest właśnie narysowanie schematu albo rysunku pomocniczego. Książka sprzedała się w ponad milionie egzemplarzy i do dziś jest jedną z najczęściej cytowanych pozycji w dydaktyce matematyki na świecie. Strategia, której się dziś uczysz, pomaga uczniom od pokoleń.',
      sourceLabel: 'MacTutor History of Mathematics — George Pólya',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'ukladanie-zadan',
    kind: 'lekcja',
    number: 13,
    title: 'Układanie własnych zadań i łamigłówek',
    short: 'Układanie zadań',
    goal: 'Ułóż własne zadanie tekstowe pasujące do zadanego wyniku i rozwiąż łamigłówki logiczne bez liczenia.',
    description:
      'Układanie własnych zadań tekstowych i zagadek liczbowych — dobór działania i liczb do zamierzonego wyniku, łamigłówki logiczne oparte na porównaniach. Interaktywna lekcja geometrii dla klasy 4.',
    duration: '35–40 min',
    topics: [12],
    status: 'available',
    funFact: {
      title: 'Człowiek, który wymyślił tysiące zagadek',
      text: 'Amerykanin Sam Loyd, urodzony w 1841 roku, przez całe życie układał łamigłówki matematyczne i logiczne — szacuje się, że stworzył ich ponad pięć tysięcy. Jego najsłynniejsza zagadka, tak zwana „15 Puzzle” (piętnastka), wywołała w 1880 roku prawdziwą falę szału w całych Stanach Zjednoczonych — ludzie próbowali ułożyć piętnaście ponumerowanych kafelków w kolejności, przesuwając je w pudełku z jednym pustym polem. Wiele jego zagadek, tak jak te dzisiejsze, wcale nie miało jednej oczywistej odpowiedzi — trzeba było naprawdę pomyśleć.',
      sourceLabel: 'Wikipedia — Sam Loyd',
    },
  },
  {
    moduleSlug: 'geometria',
    slug: 'podsumowanie',
    kind: 'podsumowanie',
    number: 14,
    title: 'Powtórzenie i sprawdzian modułowy',
    short: 'Podsumowanie modułu',
    goal: 'Powtórz wszystkie 13 lekcji modułu w pięciu tematycznych blokach i sprawdź, co warto jeszcze utrwalić.',
    description:
      'Powtórzenie i sprawdzian modułu „Podstawy geometrii”: pięć bloków tematycznych obejmujących wszystkie 13 lekcji modułu, z rekomendacją, co warto powtórzyć.',
    duration: '25–30 min',
    topics: [13],
    status: 'available',
    funFact: {
      title: 'Słowo, które dosłownie znaczy „mierzenie ziemi”',
      text: 'Słowo „geometria” pochodzi z greckiego geo (ziemia) i metron (miara) — dosłownie „mierzenie ziemi”. Nazwa powstała w starożytnym Egipcie: po corocznych wylewach rzeki Nil znikały granice pól uprawnych, a mierniczowie musieli je wyznaczać na nowo, naciągając sznury i licząc kąty oraz odległości. Grecki historyk Herodot, piszący około 440 roku p.n.e., uznawał właśnie tę praktyczną potrzebę za źródło geometrii jako nauki. Każda umiejętność z tego modułu — mierzenie odcinków, kąty, obwody, skala — wywodzi się z tego samego, bardzo praktycznego pytania: jak dokładnie zmierzyć kawałek świata.',
      sourceLabel: 'Encyclopaedia Britannica — Geometry',
    },
  },
  {
    moduleSlug: 'ulamki-zwykle',
    slug: 'przewodnik-slownik-ulamkow',
    kind: 'przewodnik',
    number: 0,
    title: 'Słownik ułamków: licznik, mianownik i ułamek właściwy',
    short: 'Przewodnik: słownik ułamków',
    goal: 'Poznaj nazwy licznik i mianownik oraz naucz się rozpoznawać ułamek właściwy, zanim zaczniesz działać na ułamkach.',
    description:
      'Licznik, mianownik i ułamek właściwy — przewodnik po słownictwie ułamków dla klasy 4, z interaktywnym budowaniem ułamka klikaniem.',
    duration: '8–10 min',
    topics: [],
    beforeTopic: 0,
    status: 'available',
  },
  {
    moduleSlug: 'ulamki-zwykle',
    slug: 'ulamek-jako-czesc-calosci',
    kind: 'lekcja',
    number: 1,
    title: 'Ułamek jako część całości — licznik i mianownik',
    short: 'Ułamek jako część całości',
    goal: 'Zbuduj ułamek od zera — wybierz mianownik i zamaluj licznik — i użyj tego, żeby czytać ułamki w podzielonych kształtach i grupach przedmiotów.',
    description:
      'Ułamek jako część całości — budowanie licznika i mianownika przez przeciąganie i klikanie, na podzielonych kształtach i grupach przedmiotów. Interaktywna lekcja matematyki dla klasy 4.',
    duration: '35–40 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Starożytny Egipt zapisywał ułamki zupełnie inaczej',
      text: 'Egipscy pisarze niemal zawsze zapisywali ułamki jako sumę „ułamków jednostkowych" — takich, w których licznik zawsze wynosi 1 (np. 1/2, 1/3, 1/6). Zamiast 5/6 zapisaliby to jako 1/2 + 1/3. Papirus Rhinda, spisany około 1650 roku p.n.e. przez pisarza imieniem Ahmes na podstawie dokumentu starszego o kolejne dwa wieki, zawiera całą tabelę takich rozkładów i jest jednym z najstarszych zachowanych tekstów matematycznych na świecie. Dziś jest przechowywany w British Museum w Londynie.',
      sourceLabel: 'British Museum — Rhind Mathematical Papyrus',
    },
  },
  {
    moduleSlug: 'ulamki-zwykle',
    slug: 'ulamki-na-osi-liczbowej',
    kind: 'lekcja',
    number: 2,
    title: 'Ułamki na osi liczbowej',
    short: 'Ułamki na osi liczbowej',
    goal: 'Zaznacz ułamek jako dokładne miejsce na osi liczbowej — przeciągnij punkt po odcinku podzielonym na równe części i przekonaj się, że dalej w prawo zawsze znaczy więcej.',
    description:
      'Ułamki na osi liczbowej — zaznaczanie i odczytywanie punktów przez przeciąganie po odcinku od 0 do 1. Interaktywna lekcja matematyki dla klasy 4.',
    duration: '35–40 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Kreska ułamkowa ma prawie 900 lat',
      text: 'Pozioma kreska między licznikiem a mianownikiem, której używasz w każdym ułamku, pochodzi od al-Hassara — matematyka piszącego w XII wieku w północnej Afryce. Do Europy ten zapis trafił dzięki włoskiemu matematykowi Fibonacciemu, który opisał go w swojej książce „Liber Abaci” w 1202 roku. Od niemal 900 lat licznik piszemy nad kreską, a mianownik pod nią — dokładnie tak, jak Ty dzisiaj.',
      sourceLabel: 'Florian Cajori, „A History of Mathematical Notations” (1928)',
    },
  },
  {
    moduleSlug: 'ulamki-zwykle',
    slug: 'porownywanie-ulamkow',
    kind: 'lekcja',
    number: 3,
    title: 'Porównywanie ułamków o tych samych licznikach lub mianownikach',
    short: 'Porównywanie ułamków',
    goal: 'Odkryj dwie reguły porównywania: przy tym samym mianowniku wygrywa większy licznik, a przy tym samym liczniku — mniejszy mianownik, bo dzieli całość na większe kawałki.',
    description:
      'Porównywanie ułamków o tych samych licznikach lub mianownikach — odkrywanie reguł przez dzielenie tortu między gości i pojedynki pasków ułamkowych. Interaktywna lekcja matematyki dla klasy 4.',
    duration: '35–40 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Na tym pytaniu potknęły się tysiące nastolatków',
      text: 'W ogólnokrajowym amerykańskim badaniu NAEP z 1978 roku trzynastolatkowie mieli tylko oszacować, ile wynosi 12/13 + 7/8, wybierając spośród odpowiedzi 1, 2, 19 i 21. Mniej niż jedna czwarta wskazała poprawną odpowiedź 2 — ponad połowa wybrała 19 albo 21, czyli dodała same liczniki lub same mianowniki. A wystarczyło zauważyć, że 12/13 i 7/8 to ułamki tuż przed całością, więc razem dają prawie 2. Wynik tak zaskoczył badaczy, że cytuje się go do dziś, gdy mowa o uczeniu ułamków.',
      sourceLabel: 'Thomas R. Post, „Fractions: Results and Implications from National Assessment”, Arithmetic Teacher (1981)',
    },
  },
  {
    moduleSlug: 'ulamki-zwykle',
    slug: 'rozszerzanie-i-skracanie-ulamkow',
    kind: 'lekcja',
    number: 4,
    title: 'Rozszerzanie i skracanie ułamków',
    short: 'Rozszerzanie i skracanie',
    goal: 'Naucz się zmieniać nazwę ułamka, nie zmieniając jego wartości — dziel każdy kawałek na mniejsze albo łącz je z powrotem w większe.',
    description:
      'Rozszerzanie i skracanie ułamków — dzielenie i łączenie kawałków całości tak, żeby wartość została ta sama, oraz odmierzanie tej samej ilości na miarce o innej podziałce. Interaktywna lekcja matematyki dla klasy 4.',
    duration: '35–40 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Dlatego godzina ma 60 minut, a nie 100',
      text: 'Babilończycy liczyli w systemie sześćdziesiątkowym i to po nich odziedziczyliśmy 60 minut w godzinie, 60 sekund w minucie i 360 stopni w pełnym kącie. Liczba 60 ma wyjątkowo dużo dzielników: 2, 3, 4, 5, 6, 10, 12, 15, 20 i 30. Dzięki temu pół godziny, jedna trzecia i jedna czwarta godziny wychodzą w okrągłych minutach — bo 1/4 = 15/60, a 1/3 = 20/60. Gdyby godzina miała 100 minut, jedna trzecia nie wyszłaby równo.',
      sourceLabel: 'Otto Neugebauer, „The Exact Sciences in Antiquity” (1957)',
    },
  },
  {
    moduleSlug: 'ulamki-zwykle',
    slug: 'liczby-mieszane',
    kind: 'lekcja',
    number: 5,
    title: 'Liczby mieszane — zamiana ułamek niewłaściwy ↔ liczba mieszana',
    short: 'Liczby mieszane',
    goal: 'Naucz się czytać tę samą ilość na dwa sposoby — jako same kawałki albo jako całości i resztę — i swobodnie przechodzić między tymi zapisami w obie strony.',
    description:
      'Liczby mieszane i ułamki niewłaściwe — składanie kawałków w całości i rozbijanie ich z powrotem, na pudełkach o zadanej pojemności i taśmie do przewijania w obie strony. Interaktywna lekcja matematyki dla klasy 4.',
    duration: '35–40 min',
    topics: [4],
    status: 'available',
    funFact: {
      title: 'Przez dwieście lat ceny akcji podawano w ułamkach',
      text: 'Na nowojorskiej giełdzie NYSE ceny akcji przez ponad dwa stulecia zapisywano nie w setnych częściach dolara, tylko w ósmych — jedna ósma dolara to 12,5 centa. Zwyczaj wziął się od hiszpańskich monet ciętych na osiem kawałków, zwanych „pieces of eight”. Notowanie w rodzaju „25 3/8” było więc dosłownie liczbą mieszaną: 25 dolarów i 3 ósme dolara. Dopiero 9 kwietnia 2001 roku amerykańskie giełdy zakończyły przejście na zapis dziesiętny i ułamki zniknęły z tablic notowań.',
      sourceLabel: 'U.S. Securities and Exchange Commission — Decimalization',
    },
  },
  {
    moduleSlug: 'ulamki-zwykle',
    slug: 'ulamek-jako-wynik-dzielenia',
    kind: 'lekcja',
    number: 6,
    title: 'Ułamek jako wynik dzielenia',
    short: 'Ułamek jako wynik dzielenia',
    goal: 'Odkryj, że kreska ułamkowa znaczy dokładnie to samo, co znak dzielenia — a potem sam zdecyduj, co zrobić z resztą, która nie chce wyjść równo.',
    description:
      'Ułamek jako wynik dzielenia — dzielenie przedmiotów między osoby, zapis a : b = a/b oraz decyzja, kiedy resztę dokrawamy, a kiedy zostawiamy. Interaktywna lekcja matematyki dla klasy 4.',
    duration: '35–40 min',
    topics: [5],
    status: 'available',
    funFact: {
      title: 'Znak dzielenia to narysowany ułamek',
      text: 'Symbol ÷, nazywany obeluzem, wprowadził do druku szwajcarski matematyk Johann Rahn w książce „Teutsche Algebra” wydanej w 1659 roku. Jego kształt tłumaczy się zwykle bardzo prosto: to kreska ułamkowa, na której licznik i mianownik zastąpiono kropkami. Dlatego 6 ÷ 3 i 6/3 to nie są dwa różne zapisy — to dosłownie ten sam rysunek. W Polsce częściej używamy dwukropka, który zaproponował Gottfried Leibniz.',
      sourceLabel: 'Johann Rahn, „Teutsche Algebra” (1659)',
    },
  },
  {
    moduleSlug: 'ulamki-zwykle',
    slug: 'dodawanie-i-odejmowanie-ulamkow',
    kind: 'lekcja',
    number: 7,
    title: 'Dodawanie i odejmowanie ułamków o jednakowych mianownikach',
    short: 'Dodawanie i odejmowanie ułamków',
    goal: 'Przekonaj się, że kawałki tej samej wielkości po prostu się liczy — dodajesz i odejmujesz same liczniki, a mianownik przepisujesz bez zmian.',
    description:
      'Dodawanie i odejmowanie ułamków o jednakowych mianownikach — przesuwanie krawędzi paska, które samo zapisuje działanie, oraz szukanie błędów w cudzych rozwiązaniach. Interaktywna lekcja matematyki dla klasy 4.',
    duration: '35–40 min',
    topics: [6],
    status: 'available',
    funFact: {
      title: 'Dodawanie coraz mniejszych ułamków może nie mieć końca',
      text: 'Około 1350 roku francuski uczony Nicole Oresme udowodnił coś, w co trudno uwierzyć: suma 1/1 + 1/2 + 1/3 + 1/4 + 1/5 + … rośnie bez końca, mimo że dokładane ułamki są coraz mniejsze. Jego pomysł był prosty — 1/3 + 1/4 to więcej niż 1/2, potem 1/5 + 1/6 + 1/7 + 1/8 też daje więcej niż 1/2, i tak w nieskończoność. Ma to zaskakującą konsekwencję: układając klocki jeden na drugim coraz bardziej na skos, można je wysunąć poza krawędź stołu dowolnie daleko — trzeba tylko mieć dość klocków.',
      sourceLabel: 'Nicole Oresme, „Questiones super Geometriam Euclidis” (ok. 1350)',
    },
  },
  {
    moduleSlug: 'ulamki-zwykle',
    slug: 'mnozenie-ulamka-przez-liczbe-naturalna',
    kind: 'lekcja',
    number: 8,
    title: 'Mnożenie ułamka przez liczbę naturalną',
    short: 'Mnożenie ułamka przez liczbę',
    goal: 'Zobacz, że mnożenie ułamka przez liczbę naturalną to skrót wielokrotnego dodawania tej samej porcji — mnożysz licznik, mianownik zostaje.',
    description:
      'Mnożenie ułamka przez liczbę naturalną — dokładanie identycznych porcji i przeliczanie całego przepisu jednym pokrętłem. Interaktywna lekcja matematyki dla klasy 4.',
    duration: '35–40 min',
    topics: [7],
    status: 'available',
    funFact: {
      title: 'W nutach ułamki mnoży się przy każdym takcie',
      text: 'Oznaczenia 4/4, 3/4 czy 6/8 na początku pięciolinii to naprawdę ułamki. Dolna liczba mówi, jak duża nuta jest jednostką (ćwierćnuta to 1/4 całej nuty, ósemka 1/8), a górna — ile takich nut mieści się w jednym takcie. Takt na 6/8 to dosłownie 6 · 1/8, czyli 6/8 całej nuty. Nazwy nut w wielu językach są wprost ułamkowe: po angielsku ćwierćnuta to quarter note, a ósemka — eighth note. System dzielenia nut na połówki, ćwiartki i ósemki ustalił się w Europie w XIII wieku, wraz z tak zwaną notacją menzuralną.',
      sourceLabel: 'Encyclopaedia Britannica — Musical notation',
    },
  },
  {
    moduleSlug: 'ulamki-zwykle',
    slug: 'zadania-tekstowe-z-ulamkami',
    kind: 'lekcja',
    number: 9,
    title: 'Zadania tekstowe z ułamkami',
    short: 'Zadania tekstowe z ułamkami',
    goal: 'Naucz się liczyć ułamek ze zbioru przedmiotów i czytać treść zadania tak, żeby wiedzieć, o którą część naprawdę pyta.',
    description:
      'Zadania tekstowe z ułamkami — obliczanie ułamka danej liczby przez dzielenie zbioru na równe grupy, wyławianie danych i liczb-podpuch oraz pytania o resztę. Interaktywna lekcja matematyki dla klasy 4.',
    duration: '35–40 min',
    topics: [8],
    status: 'available',
    funFact: {
      title: 'Hamburger, który przegrał przez ułamek',
      text: 'W latach 80. amerykańska sieć A&W wprowadziła burgera z 1/3 funta mięsa — większego, a przy tym tańszego niż słynny ćwierćfuntowiec konkurencji. Sprzedaż zawiodła kompletnie. Badania klientów wykazały zaskakującą przyczynę: wielu kupujących uznało, że 1/3 funta to MNIEJ niż 1/4 funta, bo trójka jest mniejsza od czwórki. Historię opisał sam właściciel sieci, Alfred Taubman, w książce „Threshold Resistance”. To dokładnie ten sam błąd, którego unikasz, pamiętając, że im większy mianownik, tym mniejsze kawałki.',
      sourceLabel: 'A. Alfred Taubman, „Threshold Resistance” (2007)',
    },
  },
  {
    moduleSlug: 'ulamki-zwykle',
    slug: 'podsumowanie',
    kind: 'podsumowanie',
    number: 10,
    title: 'Powtórzenie i sprawdzian modułowy',
    short: 'Podsumowanie modułu',
    goal: 'Powtórz wszystkie 9 lekcji modułu w pięciu tematycznych blokach i sprawdź, co warto jeszcze utrwalić.',
    description:
      'Powtórzenie i sprawdzian modułu „Ułamki zwykłe”: pięć bloków tematycznych obejmujących wszystkie 9 lekcji modułu, z rekomendacją, co warto powtórzyć.',
    duration: '25–30 min',
    topics: [9],
    status: 'available',
    funFact: {
      title: 'Rzymianie liczyli ułamki na dwunastki',
      text: 'Rzymianie prawie nie używali ułamków o dowolnym mianowniku — niemal wszystko dzielili na dwanaście części. Podstawowa jednostka nazywała się as i dzieliła się na 12 uncji (łac. uncia). Jedna dwunasta to była właśnie uncia, 3/12 nazywano quadrans, a 6/12 — semis. Dwunastkę wybrano nieprzypadkowo: dzieli się przez 2, 3, 4 i 6, więc połowa, jedna trzecia i jedna czwarta wychodzą w całych uncjach. Od słowa uncia pochodzą dzisiejsza uncja i angielski cal (inch).',
      sourceLabel: 'Oxford English Dictionary — hasła „inch” i „ounce” (od łac. uncia)',
    },
  },
  {
    moduleSlug: 'ulamki-dziesietne',
    slug: 'przewodnik-zapis-dziesietny',
    kind: 'przewodnik',
    number: 0,
    title: 'Ułamki dziesiętne: jak czytamy liczby z przecinkiem',
    short: 'Przewodnik: zapis dziesiętny',
    goal: 'Poznaj miejsca po przecinku — części dziesiąte, setne i tysięczne — zanim zaczniesz zapisywać i porównywać ułamki dziesiętne.',
    description:
      'Co oznacza przecinek w liczbie i czym są części dziesiąte, setne i tysięczne — przewodnik po zapisie dziesiętnym dla klasy 4.',
    duration: '8–10 min',
    topics: [],
    beforeTopic: 0,
    status: 'available',
  },
  {
    moduleSlug: 'ulamki-dziesietne',
    slug: 'zapis-ulamkow-dziesietnych',
    kind: 'lekcja',
    number: 1,
    title: 'Zapisywanie i odczytywanie ułamków dziesiętnych',
    short: 'Zapis ułamków dziesiętnych',
    goal: 'Zamień ułamek o mianowniku 10, 100 lub 1000 na zapis z przecinkiem i naucz się czytać liczby dziesiętne na głos.',
    description:
      'Zapisywanie i odczytywanie ułamków dziesiętnych o mianownikach 10, 100 i 1000 — budowanie liczby z przecinkiem cyfra po cyfrze i wyniki biegu na czas jako zadanie. Lekcja dla klasy 4.',
    duration: '30–35 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Człowiek, który przekonał Europę do liczby z przecinkiem',
      text: 'Ułamki dziesiętne, których dziś używasz, nie zawsze były oczywiste. W 1585 roku flamandzki inżynier i matematyk Simon Stevin wydał niewielką książeczkę pod tytułem „De Thiende” („Dziesiąta”), w której namawiał kupców, mierniczych i astronomów, żeby zamiast kłopotliwych ułamków zwykłych zapisywali części liczb dziesiątkami, setkami i tysiącami — dokładnie tak, jak robisz to dziś. Stevin nie używał jeszcze przecinka w dzisiejszej formie, ale to jego pomysł z czasem przyjął się w całej Europie i doprowadził do zapisu, którego uczysz się w tej lekcji.',
      sourceLabel: 'Wikipedia — Simon Stevin',
      sourceUrl: 'https://en.wikipedia.org/wiki/Simon_Stevin',
    },
  },
  {
    moduleSlug: 'ulamki-dziesietne',
    slug: 'wyrazenia-dwumianowane',
    kind: 'lekcja',
    number: 2,
    title: 'Zapisywanie wyrażeń dwumianowanych jako ułamek dziesiętny',
    short: 'Wyrażenia dwumianowane',
    goal: 'Zamień „3 m 25 cm” czy „2 zł 50 gr” na jedną liczbę z przecinkiem, wpisując mniejszą jednostkę od prawej strony.',
    description:
      'Zapisywanie wyrażeń dwumianowanych jako ułamek dziesiętny: 3 m 25 cm = 3,25 m, 2 zł 50 gr = 2,50 zł, 1 kg 7 g = 1,007 kg — z tablicą pozycyjną, pułapką zer z przodu i miarką stolarską. Lekcja dla klasy 4.',
    duration: '30–35 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Przecinek czy kropka? To zależy od kraju',
      text: 'Piszesz 3,25 z przecinkiem — i tak robi większość Europy. Ale w krajach anglojęzycznych ta sama liczba to 3.25, z kropką, a przecinek służy tam do oddzielania tysięcy: zapis 1,000,000 znaczy milion, nie jeden. Międzynarodowe Biuro Miar, które pilnuje definicji metra i kilograma, dopuszcza oba znaki — stawia tylko jeden warunek: w jednym dokumencie trzeba trzymać się jednego. Liczba jest ta sama, spór toczy się wyłącznie o kropkę.',
      sourceLabel: 'Wikipedia — Decimal separator',
      sourceUrl: 'https://en.wikipedia.org/wiki/Decimal_separator',
    },
  },
  {
    moduleSlug: 'ulamki-dziesietne',
    slug: 'ulamek-zwykly-a-dziesietny',
    kind: 'lekcja',
    number: 3,
    title: 'Zamiana ułamek zwykły ↔ ułamek dziesiętny (proste przypadki)',
    short: 'Ułamek zwykły a dziesiętny',
    goal: 'Przechodź między 3/4 a 0,75 w obie strony — rozszerzając mianownik do 10, 100 lub 1000 i skracając z powrotem.',
    description:
      'Zamiana ułamka zwykłego na dziesiętny i odwrotnie w prostych przypadkach: rozszerzanie mianownika do 10, 100 lub 1000 (3/4 = 75/100 = 0,75), skracanie ułamka dziesiętnego (0,08 = 8/100 = 2/25) i granica „prostych przypadków". Lekcja dla klasy 4.',
    duration: '30–35 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: '1/7 to najbardziej magiczna liczba w kalkulatorze',
      text: 'Niektóre ułamki zamieniają się na krótką, równą liczbę z przecinkiem — 1/4 to 0,25, 1/5 to 0,2. Ale 1/7 nigdy się nie kończy: to 0,142857142857… i blok 142857 powtarza się bez końca. A ten blok jest zaczarowany: 142857 × 2 = 285714, × 3 = 428571, × 4 = 571428 — za każdym razem wychodzą TE SAME sześć cyfr, tylko zaczynając od innego miejsca, jakby były zapisane na obwodzie koła. Dopiero 142857 × 7 daje 999999. Matematycy nazywają 142857 „liczbą cykliczną". Wpisz 1 : 7 do kalkulatora i patrz, jak nie mieści mu się na ekranie.',
      sourceLabel: 'Wikipedia — 142857',
      sourceUrl: 'https://en.wikipedia.org/wiki/142857',
    },
  },
  {
    moduleSlug: 'ulamki-dziesietne',
    slug: 'porownywanie-ulamkow-dziesietnych',
    kind: 'lekcja',
    number: 4,
    title: 'Porównywanie ułamków dziesiętnych',
    short: 'Porównywanie ułamków dziesiętnych',
    goal: 'Ustaw liczby z przecinkiem w kolejności i wstaw znak <, > lub = — porównując rzędy od lewej, nie licząc cyfr po przecinku.',
    description:
      'Porównywanie i porządkowanie ułamków dziesiętnych: część całkowita, potem rząd po rzędzie po przecinku, wyrównanie przecinków i dopisanie zer (0,5 = 0,50), pułapka „więcej cyfr = większa liczba” oraz wyniki skoku w dal jako zadanie. Lekcja dla klasy 4.',
    duration: '30–35 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Dwie tysięczne sekundy, po których zmieniono przepisy',
      text: 'Na igrzyskach w Monachium w 1972 roku, w pływackim wyścigu na 400 m stylem zmiennym, Szwed Gunnar Larsson i Amerykanin Tim McKee dotknęli ściany z czasem 4:31,98 — identycznym co do setnej sekundy. Elektroniczny zegar mierzył jednak dokładniej: 4:31,981 kontra 4:31,983. Złoto przyznano Larssonowi, który wygrał o dwie tysięczne sekundy — mniej, niż trwa mrugnięcie okiem, i mniej niż dystans, jaki pływak pokonuje w tym czasie. Po tych zawodach pływanie ustaliło, że oficjalne czasy liczy się już tylko do setnych sekundy, a przy takim samym wyniku obaj zawodnicy dostają ten sam medal. Czasem o tym, ile miejsc po przecinku ma sens porównywać, decyduje jedna kontrowersyjna liczba.',
      sourceLabel: 'Wikipedia — Swimming at the 1972 Summer Olympics',
      sourceUrl:
        'https://en.wikipedia.org/wiki/Swimming_at_the_1972_Summer_Olympics_%E2%80%93_Men%27s_400_metre_individual_medley',
    },
  },
  {
    moduleSlug: 'ulamki-dziesietne',
    slug: 'dodawanie-ulamkow-dziesietnych',
    kind: 'lekcja',
    number: 5,
    title: 'Dodawanie ułamków dziesiętnych — pamięciowo i pisemnie',
    short: 'Dodawanie ułamków dziesiętnych',
    goal: 'Dodawaj liczby z przecinkiem w pamięci i w słupku — przecinek pod przecinkiem, zera wyrównujące i przeniesienie, które potrafi przeskoczyć przez przecinek.',
    description:
      'Dodawanie ułamków dziesiętnych pamięciowo i pisemnie: koralikowe zwijanie dziesiątki (10 dziesiątych = 1 cała), słupek z przecinkiem pod przecinkiem, dopisywanie zer (2,4 = 2,40), przeniesienie przez przecinek (0,8 + 0,7 = 1,5) i rachunek ze szkolnego sklepiku. Lekcja dla klasy 4.',
    duration: '35–40 min',
    topics: [4],
    status: 'available',
    funFact: {
      title: 'Do 1971 roku dodawanie funtów było koszmarem',
      text: 'W Wielkiej Brytanii przez setki lat 1 funt dzielił się na 20 szylingów, a 1 szyling na 12 pensów — czyli w jednym funcie było aż 240 pensów. Żeby dodać dwie kwoty, trzeba było osobno liczyć pensy (i przenosić po 12), osobno szylingi (i przenosić po 20), a dopiero na końcu funty. 15 lutego 1971 roku, w tzw. Decimal Day, Brytyjczycy przeszli na system dziesiętny: 1 funt = 100 pensów. Od tego dnia dodawanie pieniędzy stało się zwykłym dodawaniem ułamków dziesiętnych — dokładnie takim, jakie ćwiczyłeś/aś w tej lekcji.',
      sourceLabel: 'Wikipedia — Decimal Day',
      sourceUrl: 'https://en.wikipedia.org/wiki/Decimal_Day',
    },
  },
  {
    moduleSlug: 'ulamki-dziesietne',
    slug: 'odejmowanie-ulamkow-dziesietnych',
    kind: 'lekcja',
    number: 6,
    title: 'Odejmowanie ułamków dziesiętnych — pamięciowo i pisemnie',
    short: 'Odejmowanie ułamków dziesiętnych',
    goal: 'Odejmuj liczby z przecinkiem w pamięci i w słupku — przecinek pod przecinkiem, zera wyrównujące i pożyczka, która potrafi przeskoczyć przez przecinek.',
    description:
      'Odejmowanie ułamków dziesiętnych pamięciowo i pisemnie: koralikowe rozbijanie jednostki (1 cała = 10 dziesiątych), słupek z przecinkiem pod przecinkiem, dopisywanie zer (5,2 = 5,20), pożyczka przez przecinek (1,2 − 0,5 = 0,7), łańcuch pożyczek przez zera (6 − 2,63) oraz odejmowanie przez doliczanie do celu na osi liczbowej. Lekcja dla klasy 4.',
    duration: '35–40 min',
    topics: [5],
    status: 'available',
    funFact: {
      title: 'Kraj, który wyrzucił najmniejszą monetę, żeby uprościć odejmowanie',
      text: 'W 2012 roku Kanada przestała bić monetę jednocentową, a 4 lutego 2013 roku ostatecznie wycofała ją z obiegu. Powód był prosty: wybicie jednego centa kosztowało więcej niż cent, a przy kasie i tak wszyscy grzebali w drobnych. Od tej pory gotówkowe rachunki zaokrągla się do najbliższych 5 centów — 6,32 zł stałoby się 6,30, a 6,33 zł stałoby się 6,35. Płatności kartą liczy się dalej co do centa. Dzięki temu kasjer, wydając resztę, odejmuje już tylko „okrągłe” ułamki dziesiętne — dokładnie tak, jak w tej lekcji doliczasz do celu skokami.',
      sourceLabel: 'Wikipedia — Penny (Canadian coin)',
      sourceUrl: 'https://en.wikipedia.org/wiki/Penny_(Canadian_coin)',
    },
  },
  {
    moduleSlug: 'ulamki-dziesietne',
    slug: 'mnozenie-dzielenie-przez-10-100-1000',
    kind: 'lekcja',
    number: 7,
    title: 'Mnożenie i dzielenie ułamków dziesiętnych przez 10, 100 i 1000',
    short: 'Ułamki dziesiętne × 10, 100, 1000',
    goal: 'Pomnóż lub podziel liczbę z przecinkiem przez 10, 100 lub 1000, przesuwając przecinek o tyle miejsc, ile zer ma liczba — i dopisując brakujące zera.',
    description:
      'Mnożenie i dzielenie ułamków dziesiętnych przez 10, 100 i 1000: liczba zer decyduje o liczbie miejsc przesunięcia przecinka, mnożenie przesuwa przecinek w prawo (3,5 · 100 = 350), dzielenie w lewo (4,2 : 100 = 0,042), a brakujące miejsca trzeba dopełnić zerami. Lekcja dla klasy 4.',
    duration: '30–35 min',
    topics: [6],
    status: 'available',
    funFact: {
      title: 'Kraj, w którym przecinek przeskoczył o dwanaście miejsc',
      text: 'W 2008 roku w Zimbabwe ceny podwajały się czasem kilka razy dziennie — bank centralny wypuścił nawet banknot o nominale sto bilionów dolarów. 3 lutego 2009 roku przeprowadzono redenominację: z każdej kwoty skreślono dwanaście zer, czyli podzielono ją przez 1 000 000 000 000 (10 do dwunastej potęgi). W praktyce oznaczało to przesunięcie przecinka o dwanaście miejsc w lewo — dziesięć bilionów starych dolarów stawało się dziesięcioma nowymi. To ta sama zasada co dzielenie przez 10, 100 czy 1000, tylko powtórzona dwanaście razy.',
      sourceLabel: 'Wikipedia — Zimbabwean dollar',
      sourceUrl: 'https://en.wikipedia.org/wiki/Zimbabwean_dollar',
    },
  },
  {
    moduleSlug: 'ulamki-dziesietne',
    slug: 'podsumowanie',
    kind: 'podsumowanie',
    number: 8,
    title: 'Powtórzenie i sprawdzian modułowy',
    short: 'Podsumowanie modułu',
    goal: 'Powtórz wszystkie lekcje modułu o ułamkach dziesiętnych w czterech tematycznych blokach i sprawdź, co warto jeszcze utrwalić.',
    description:
      'Powtórzenie i sprawdzian modułu „Ułamki dziesiętne”: cztery bloki tematyczne obejmujące zapis i odczyt, jednostki i zamianę na ułamki zwykłe, porównywanie oraz działania, z rekomendacją, co warto powtórzyć.',
    duration: '25–30 min',
    topics: [7],
    status: 'available',
    funFact: {
      title: 'Dziesiętny jest prawie wszędzie — poza zegarem',
      text: 'Pieniądze, długości, masy, pola — prawie wszystko, co mierzymy, liczymy dziś dziesiątkami, setkami i tysiącami. Prawie. We Francji po rewolucji spróbowano wprowadzić też czas dziesiętny: dobę podzielono na 10 godzin, godzinę na 100 minut, minutę na 100 sekund. Oficjalnie obowiązywał od 24 listopada 1793 roku, ale ludzie nie chcieli wyrzucać zegarów i już 7 kwietnia 1795 roku z pomysłu zrezygnowano. Dlatego minut w godzinie wciąż jest 60, a nie 100 — zegar to ostatni duży wyjątek od zapisu dziesiętnego, którego uczył się ten moduł.',
      sourceLabel: 'Wikipedia — Decimal time',
      sourceUrl: 'https://en.wikipedia.org/wiki/Decimal_time',
    },
  },
  {
    moduleSlug: 'pola-figur',
    slug: 'pole-figury',
    kind: 'lekcja',
    number: 1,
    title: 'Pole figury — ile kwadratów jednostkowych się mieści',
    short: 'Pojęcie pola figury',
    goal: 'Zrozum, czym jest pole figury, i naucz się je mierzyć, licząc kwadraty jednostkowe — także wtedy, gdy w figurze są połówki kratek.',
    description:
      'Pole figury dla klasy 4: pole jako liczba kwadratów jednostkowych, porównywanie figur na kratkownicy, sklejanie połówek kratek i różnica między polem a obwodem. Interaktywna lekcja z zalewaniem figury kafelkami.',
    duration: '30–35 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Pole, które liczy się na kropkach',
      text: 'Skoro pole można policzyć, licząc kratki, to czy da się je policzyć jeszcze prościej? W 1899 roku austriacki matematyk Georg Alexander Pick zauważył coś zaskakującego: jeśli figura ma wszystkie wierzchołki w węzłach kratownicy, to jej pole można obliczyć, licząc same kropki. Wystarczy policzyć kropki w środku figury, dodać połowę kropek leżących na jej brzegu i odjąć 1. Dla kwadratu jednostkowego: 0 kropek w środku, 4 na brzegu, czyli 0 + 2 − 1 = 1 — dokładnie tyle, ile powinno wyjść. Twierdzenie przeleżało w zapomnieniu prawie 70 lat, aż polski matematyk Hugo Steinhaus opisał je w swojej książce „Kalejdoskop matematyczny” i odkrycie Picka trafiło pod strzechy.',
      sourceLabel: 'Wikipedia — Twierdzenie Picka',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Twierdzenie_Picka',
    },
  },
  {
    moduleSlug: 'pola-figur',
    slug: 'przewodnik-jednostki-pola',
    kind: 'przewodnik',
    number: 1.5,
    title: 'Jednostki pola: od milimetra kwadratowego do hektara',
    short: 'Przewodnik: jednostki pola',
    goal: 'Poznaj jednostki pola mm², cm², dm², m², km², ar i hektar oraz zależności między nimi, zanim zaczniesz liczyć pola figur.',
    description:
      'Dlaczego jednostka pola to zawsze kwadrat, ile m² ma ar i hektar oraz jak zamieniać jednostki pola — przewodnik dla klasy 4, od mm² do hektara.',
    duration: '8–10 min',
    topics: [],
    beforeTopic: 1,
    status: 'available',
  },
  {
    moduleSlug: 'pola-figur',
    slug: 'jednostki-pola',
    kind: 'lekcja',
    number: 2,
    title: 'Jednostki pola — od paznokcia po hektar',
    short: 'Jednostki pola w praktyce',
    goal: 'Naucz się dobierać jednostkę pola do tego, co mierzysz, i zamieniać jednostki równym krokiem \u00d7100 — od milimetra kwadratowego po hektar.',
    description:
      'Jednostki pola dla klasy 4: mm\u00b2, cm\u00b2, dm\u00b2, m\u00b2, ar, hektar i km\u00b2, zamiana jednostek krokiem \u00d7100 i dobieranie jednostki do powierzchni. Interaktywna lekcja z kamerą odjeżdżającą od łebka szpilki aż po kilometr kwadratowy.',
    duration: '30–35 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Pole mierzone pracą, nie linijką',
      text: 'Zanim wymyślono ary i hektary, pola mierzyło się tym, ile dało się na nich zrobić. Morga — nazwa pochodzi od niemieckiego „Morgen”, czyli poranek — to tyle ziemi, ile jeden oracz z jednym zaprzęgiem był w stanie zaorać od rana do południa. Ponieważ zależało to od gleby, wołów i samego oracza, morga w każdym regionie znaczyła co innego; w XIX-wiecznym Królestwie Polskim ustalono w końcu morgę nowopolską na około 5600 m\u00b2, czyli nieco ponad pół hektara. Właśnie dlatego świat przeszedł na ar i hektar: kwadrat o boku 10 i 100 metrów znaczy dokładnie to samo wszędzie i o każdej porze dnia.',
      sourceLabel: 'Wikipedia — Morga (jednostka powierzchni)',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Morga',
    },
  },
  {
    moduleSlug: 'pola-figur',
    slug: 'pole-prostokata-i-kwadratu',
    kind: 'lekcja',
    number: 3,
    title: 'Pole prostokąta i kwadratu — wzór zamiast liczenia kratek',
    short: 'Pole prostokąta i kwadratu',
    goal: 'Zrozum, skąd bierze się wzór P = a · b, policz pole prostokąta i kwadratu bez liczenia kratek i wyznacz brakujący bok, gdy znasz pole.',
    description:
      'Pole prostokąta i kwadratu dla klasy 4: skąd bierze się wzór P = a · b, dlaczego kwadrat liczy się jako a · a i jak z pola wyznaczyć brakujący bok. Interaktywna lekcja z układaniem rzędów kafelków i grządką o stałym polu.',
    duration: '35–40 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Kartka, która ma dokładnie metr kwadratowy',
      text: 'Format A4 nie wziął się z niczyjego widzimisię. Cała seria A zaczyna się od arkusza A0, który zaprojektowano tak, żeby jego pole wynosiło równo 1 m² — to prostokąt o bokach 841 mm i 1189 mm, czyli 0,841 · 1,189 ≈ 1,000 m². Każdy kolejny format powstaje przez przecięcie poprzedniego na pół w poprzek dłuższego boku: A1 to pół A0, A2 to pół A1 i tak dalej. Zwykła kartka A4 jest więc czwartą połówką z rzędu, czyli szesnastą częścią metra kwadratowego — jej pole to niecałe 625 cm². Właśnie dlatego kartki tej serii da się powiększać i pomniejszać na kserokopiarce bez obcinania marginesów.',
      sourceLabel: 'Wikipedia — ISO 216 (formaty arkuszy papieru)',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Format_arkusza',
    },
  },
  {
    moduleSlug: 'pola-figur',
    slug: 'podzial-i-uzupelnianie',
    kind: 'lekcja',
    number: 4,
    title: 'Pola figur metodą podziału i uzupełniania',
    short: 'Podział i uzupełnianie',
    goal: 'Naucz się liczyć pole figury złożonej z prostokątów: potnij ją na prostokąty i dodaj albo domknij do prostokąta i odejmij brakujące kawałki.',
    description:
      'Pola figur złożonych dla klasy 4: metoda podziału na prostokąty i metoda uzupełniania do prostokąta, brakujący bok jako różnica oraz wybór krótszej drogi. Interaktywna lekcja z cięciem figury i przesuwaniem jej kawałków.',
    duration: '35–40 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Układanka, w której ginie jedna kratka',
      text: 'Skoro przesunięcie kawałka figury nie zmienia jej pola, to czym wytłumaczyć słynną łamigłówkę, w której z tych samych czterech kawałków raz układa się pełny trójkąt, a raz taki sam trójkąt z jedną pustą kratką w środku? Zagadkę w tej postaci opublikował w 1953 roku Paul Curry, amerykański magik-amator, i do dziś nosi ona nazwę paradoksu brakującego kwadratu. Sztuczka polega na tym, że „przeciwprostokątna” wcale nie jest prosta: jeden kawałek ma nachylenie 3 do 8, a drugi 2 do 5, więc długa krawędź raz się lekko wgina, a raz wygina. Różnica powierzchni między tymi dwoma ułożeniami to dokładnie jedna kratka — pole nigdzie nie zniknęło, tylko rozłożyło się wzdłuż niedokładnie prostej linii.',
      sourceLabel: 'Wikipedia — Paradoks brakującego kwadratu',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Paradoks_brakuj%C4%85cego_kwadratu',
    },
  },
  {
    moduleSlug: 'pola-figur',
    slug: 'podsumowanie',
    kind: 'podsumowanie',
    number: 5,
    title: 'Powtórzenie i sprawdzian modułowy',
    short: 'Podsumowanie modułu',
    goal: 'Powtórz wszystkie lekcje modułu o polach figur w czterech tematycznych blokach i sprawdź, co warto jeszcze utrwalić.',
    description:
      'Powtórzenie i sprawdzian modułu „Pola figur”: cztery bloki tematyczne obejmujące pojęcie pola, jednostki pola, wzór na pole prostokąta i kwadratu oraz pola figur złożonych, z rekomendacją, co warto powtórzyć.',
    duration: '25–30 min',
    topics: [4],
    status: 'available',
    funFact: {
      title: 'Kwadrat, którego nie da się narysować',
      text: 'Każdą figurę z tego modułu dało się w końcu sprowadzić do prostokątów. Starożytni Grecy zadali sobie pytanie, czy da się tak samo postąpić z kołem: czy mając dane koło, można samym cyrklem i linijką bez podziałki zbudować kwadrat o dokładnie takim samym polu? Problem nazwano kwadraturą koła i przez ponad dwa tysiące lat nikomu się to nie udało. Dopiero w 1882 roku niemiecki matematyk Ferdinand von Lindemann udowodnił, że jest to niewykonalne — nie dlatego, że nikt dotąd nie wpadł na sposób, tylko dlatego, że takiego sposobu w ogóle nie ma. Stąd wzięło się powiedzenie „to kwadratura koła”, którego używa się o zadaniu nie do rozwiązania.',
      sourceLabel: 'Wikipedia — Kwadratura koła',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Kwadratura_ko%C5%82a',
    },
  },
  {
    moduleSlug: 'bryly',
    slug: 'przewodnik-jezyk-bryl',
    kind: 'przewodnik',
    number: 0,
    title: 'Język brył: ściana, krawędź, wierzchołek',
    short: 'Przewodnik: język brył',
    goal: 'Poznaj słowa, którymi opisuje się bryły — ściana, krawędź, wierzchołek — oraz nazwy sześciu podstawowych brył i umowę rysowania krawędzi zasłoniętych linią przerywaną.',
    description:
      'Czym różni się figura płaska od bryły, co to ściana, krawędź i wierzchołek, jak nazywają się graniastosłup, ostrosłup, walec, stożek i kula oraz dlaczego część kresek na rysunku bryły jest przerywana — przewodnik dla klasy 4.',
    duration: '10–12 min',
    topics: [],
    beforeTopic: 0,
    status: 'available',
  },
  {
    moduleSlug: 'bryly',
    slug: 'opis-prostopadloscianu',
    kind: 'lekcja',
    number: 1,
    title: 'Opis prostopadłościanu: ściany, krawędzie i wierzchołki',
    short: 'Opis prostopadłościanu',
    goal: 'Policz ściany, krawędzie i wierzchołki na obracanej bryle, odkryj, że ściany chodzą parami, a krawędzie czwórkami, i opisz każde pudełko trzema liczbami.',
    description:
      'Ile ścian, krawędzi i wierzchołków ma prostopadłościan, dlaczego ściany przeciwległe są identyczne, skąd biorą się długość, szerokość i wysokość oraz ile drutu potrzeba na szkielet pudełka — lekcja matematyki dla klasy 4.',
    duration: '25–30 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Jedna liczba, która wychodzi zawsze taka sama',
      text: 'Weź liczbę wierzchołków, odejmij liczbę krawędzi i dodaj liczbę ścian. Dla prostopadłościanu: 8 − 12 + 6 = 2. Zrób to samo dla ostrosłupa (5 − 8 + 5), dla graniastosłupa trójkątnego (6 − 9 + 5) albo dla piłki futbolowej złożonej z pięcio- i sześciokątów — zawsze wyjdzie 2. Ten wzór odkrył szwajcarski matematyk Leonhard Euler i opisał go w 1758 roku; dziś nazywa się go wzorem Eulera dla wielościanów.',
      sourceLabel: 'Wikipedia — Wzór Eulera dla wielościanów',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Wz%C3%B3r_Eulera_dla_wielo%C5%9Bcian%C3%B3w',
    },
  },
  {
    moduleSlug: 'bryly',
    slug: 'rozpoznawanie-bryl',
    kind: 'lekcja',
    number: 2,
    title: 'Rozpoznawanie brył: graniastosłupy, ostrosłupy, walec, stożek i kula',
    short: 'Rozpoznawanie brył',
    goal: 'Odróżnij bryły o płaskich ścianach od tych z powierzchnią zaokrągloną, naucz się nazywać graniastosłupy i ostrosłupy od ich podstawy i wyliczaj z niej liczbę ścian, krawędzi i wierzchołków.',
    description:
      'Czym różni się graniastosłup od ostrosłupa, dlaczego bryła bierze nazwę od podstawy, skąd biorą się wzory n + 2, 3n i 2n oraz które bryły się toczą — lekcja matematyki dla klasy 4.',
    duration: '25–30 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Czterdzieści tysięcy graniastosłupów, których nikt nie zbudował',
      text: 'Na wybrzeżu Irlandii Północnej leży Grobla Olbrzyma — pole około 40 000 kamiennych kolumn wystających z ziemi jak schody. Prawie wszystkie są graniastosłupami o podstawie sześciokąta, choć nikt ich nie ciosał: powstały same, gdy lawa sprzed około 60 milionów lat stygła i pękała. Miejsce jest tak niezwykłe, że wpisano je na listę światowego dziedzictwa UNESCO.',
      sourceLabel: 'Wikipedia — Grobla Olbrzyma',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Grobla_Olbrzyma',
    },
  },
  {
    moduleSlug: 'bryly',
    slug: 'siatki-prostopadloscianow',
    kind: 'lekcja',
    number: 3,
    title: 'Siatki prostopadłościanów: rozpoznawanie i rysowanie',
    short: 'Siatki prostopadłościanów',
    goal: 'Rozłóż pudełko na płasko, sprawdź składaniem, które układy sześciu prostokątów naprawdę zamykają się w bryłę, i odczytaj wymiary każdego prostokąta z długości, szerokości i wysokości.',
    description:
      'Czym jest siatka bryły, dlaczego jedno pudełko ma wiele różnych siatek, jak rozpoznać układ, który się nie złoży, oraz jakie wymiary mają prostokąty siatki prostopadłościanu — lekcja matematyki dla klasy 4.',
    duration: '25–30 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Siatki wymyślił malarz',
      text: 'Pierwsze drukowane siatki brył narysował Albrecht Dürer — niemiecki malarz i grafik — w podręczniku „Underweysung der Messung” wydanym w 1525 roku. Chciał nauczyć innych artystów rysować przestrzeń, więc rozłożył wielościany na płasko, żeby dało się je wyciąć i skleić z papieru. Dziś tak samo powstaje każde kartonowe pudełko: najpierw jest płaski wykrój, dopiero potem bryła.',
      sourceLabel: 'Wikipedia — Net (polyhedron)',
      sourceUrl: 'https://en.wikipedia.org/wiki/Net_(polyhedron)',
    },
  },
  {
    moduleSlug: 'bryly',
    slug: 'przewodnik-jednostki-objetosci',
    kind: 'przewodnik',
    number: 3.5,
    title: 'Jednostki objętości: od mililitra do metra sześciennego',
    short: 'Przewodnik: jednostki objętości',
    goal: 'Zobacz, dlaczego jednostka objętości jest sześcianem, dlaczego sąsiednie jednostki dzieli 1000 i dlaczego litr to po prostu drugie imię decymetra sześciennego.',
    description:
      'Dlaczego 1 l to to samo co 1 dm³, a 1 ml to 1 cm³, skąd bierze się krok ×1000 między jednostkami objętości i którą jednostką mierzyć lekarstwo, wodę w wannie oraz beton — przewodnik dla klasy 4.',
    duration: '10–12 min',
    topics: [],
    beforeTopic: 3,
    status: 'available',
  },
  {
    moduleSlug: 'bryly',
    slug: 'objetosc-prostopadloscianu',
    kind: 'lekcja',
    number: 4,
    title: 'Objętość prostopadłościanu: ile się w nim mieści',
    short: 'Objętość prostopadłościanu',
    goal: 'Wypełnij bryłę kostkami warstwa po warstwie, wyprowadź z tego wzór V = a · b · c, znajdź brakujący wymiar dzieleniem i policz, ile litrów wody mieści akwarium.',
    description:
      'Czym jest objętość, dlaczego mnoży się trzy wymiary, jak z objętości i dwóch wymiarów odczytać trzeci oraz ile litrów wody stoi w akwarium napełnionym do połowy — lekcja matematyki dla klasy 4.',
    duration: '25–30 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Przez 63 lata litr nie był dokładnie decymetrem sześciennym',
      text: 'W 1901 roku umówiono się, że litr to objętość jednego kilograma czystej wody. Pomiar okazał się jednak odrobinę niedokładny i tak zdefiniowany litr wychodził 1,000028 dm³ — odrobinę za dużo. Różnica była tak mała, że nikt jej nie zauważał przy nalewaniu mleka, ale przeszkadzała w precyzyjnych pomiarach. Dopiero w 1964 roku Generalna Konferencja Miar i Wag skasowała ten drobiazg i ogłosiła, że litr to po prostu, dokładnie, jeden decymetr sześcienny.',
      sourceLabel: 'Wikipedia — Litr',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Litr',
    },
  },
  {
    moduleSlug: 'bryly',
    slug: 'pole-powierzchni-prostopadloscianu',
    kind: 'lekcja',
    number: 5,
    title: 'Pole powierzchni prostopadłościanu: ile trzeba na obłożenie',
    short: 'Pole powierzchni prostopadłościanu',
    goal: 'Odróżnij pole powierzchni od objętości, policz je jako pole siatki — trzy prostokąty wzięte po dwa razy — i sprawdź, ile farby, papieru albo płytek potrzeba na prawdziwą robotę.',
    description:
      'Czym różni się pole powierzchni od objętości, dlaczego wystarczą trzy prostokąty zamiast sześciu, skąd bierze się wzór 2 · (a · b + a · c + b · c) oraz jak liczyć, gdy jakiejś ściany nie trzeba pokrywać — lekcja matematyki dla klasy 4.',
    duration: '25–30 min',
    topics: [4],
    status: 'available',
    funFact: {
      title: 'Dlaczego bańka mydlana jest kulą',
      text: 'Bańka nie wybiera kształtu — błona mydlana kurczy się tak długo, aż jej powierzchnia jest najmniejsza z możliwych przy tej ilości powietrza w środku. Ze wszystkich brył o tej samej objętości najmniejsze pole powierzchni ma kula, więc każda swobodna bańka kończy jako kula. Zjawisko zbadał i opisał belgijski fizyk Joseph Plateau w książce wydanej w 1873 roku — od jego nazwiska nazwano prawa rządzące błonami mydlanymi.',
      sourceLabel: 'Wikipedia — Joseph Plateau',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Joseph_Plateau',
    },
  },
  {
    moduleSlug: 'bryly',
    slug: 'podsumowanie',
    kind: 'podsumowanie',
    number: 6,
    title: 'Powtórzenie i sprawdzian modułowy',
    short: 'Podsumowanie modułu',
    goal: 'Powtórz cały moduł o bryłach w czterech tematycznych blokach — opis i rozpoznawanie brył, siatki, objętość i pole powierzchni — i sprawdź, co warto jeszcze utrwalić.',
    description:
      'Powtórzenie i sprawdzian modułu „Bryły”: cztery bloki tematyczne obejmujące ściany, krawędzie i wierzchołki, rozpoznawanie graniastosłupów i ostrosłupów, siatki prostopadłościanów, objętość wraz z jednostkami oraz pole powierzchni, z rekomendacją, co warto powtórzyć.',
    duration: '25–30 min',
    topics: [5],
    status: 'available',
    funFact: {
      title: 'Pomarańcze na straganie i zagadka na czterysta lat',
      text: 'Sprzedawcy owoców od zawsze układają pomarańcze w piramidę i nikt ich tego nie uczył. W 1611 roku Johannes Kepler stwierdził, że to właśnie jest najlepsze możliwe upakowanie kul — ciaśniej się nie da, a kule wypełniają wtedy około 74 procent miejsca. Brzmi oczywiście, ale udowodnić tego nie potrafił nikt przez prawie czterysta lat. Dopiero w 1998 roku amerykański matematyk Thomas Hales przedstawił dowód, a jego pełne, sprawdzone przez komputer potwierdzenie ogłoszono w 2014 roku.',
      sourceLabel: 'Wikipedia — Hipoteza Keplera',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Hipoteza_Keplera',
    },
  },
  {
    moduleSlug: 'podsumowanie',
    slug: 'powtorzenie-przekrojowe',
    kind: 'lekcja',
    number: 1,
    title: 'Duże powtórzenie przekrojowe — zadania ze wszystkich działów',
    short: 'Powtórzenie przekrojowe',
    goal: 'Przejdź przez cały rok w pięciu działach — liczby, rachunki, ułamki, geometria oraz pola i bryły — rozwiąż mieszankę zadań z różnych lekcji i sprawdź, co warto powtórzyć przed klasą 5.',
    description:
      'Przekrojowa powtórka całej matematyki klasy 4: pięć bloków tematycznych (liczby naturalne i kolejność działań, rachunki pisemne i jednostki, ułamki zwykłe i dziesiętne, geometria, pola i bryły) z mieszanką zadań ze wszystkich modułów oraz rekomendacją, co utrwalić przed piątą klasą.',
    duration: '35–45 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Dlaczego powtórka przez zadania działa lepiej niż samo czytanie',
      text: 'W 2006 roku amerykańscy psycholodzy Henry Roediger i Jeffrey Karpicke sprawdzili to na studentach. Jedna grupa po przeczytaniu tekstu czytała go ponownie, druga zamiast tego rozwiązywała z pamięci krótki test. Tydzień później to grupa, która się sprawdzała — a nie ta, która tylko czytała — pamiętała znacznie więcej. Nazwali to „efektem testowania”: samo wyciąganie wiedzy z głowy utrwala ją mocniej niż ponowne patrzenie na gotową odpowiedź. Ta lekcja jest zbudowana dokładnie na tej zasadzie.',
      sourceLabel: 'Roediger, Karpicke, „Test-Enhanced Learning”, Psychological Science (2006)',
      sourceUrl: 'https://en.wikipedia.org/wiki/Testing_effect',
    },
  },
  {
    moduleSlug: 'podsumowanie',
    slug: 'test-koncowy',
    kind: 'lekcja',
    number: 2,
    title: 'Test końcowy i diagnoza na wejście do klasy 5',
    short: 'Test końcowy',
    goal: 'Sprawdź cztery umiejętności z klasy 4, na których stanie najwięcej nowego materiału w klasie 5 — ułamki i wspólny mianownik, oś liczbowa, setne części całości oraz jednostki i czas — i zobacz, co dopiąć przed wakacjami.',
    description:
      'Test końcowy klasy 4 pełniący rolę diagnozy na wejście do klasy 5: cztery części po pięć zadań (wspólny mianownik ułamków, oś liczbowa i porównywanie, ułamki dziesiętne i procenty, jednostki oraz droga i czas), a na końcu mapa gotowości pokazująca, na czym każdy filar zostanie rozbudowany w piątej klasie.',
    duration: '25–35 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Liczby ujemne wymyślono w Chinach 2000 lat temu — a Europa nie chciała ich przez wieki',
      text: 'W chińskim podręczniku „Dziewięć rozdziałów o sztuce matematycznej”, spisanym około dwóch tysięcy lat temu, do rachunków używano pałeczek: czerwone oznaczały liczby dodatnie, a czarne — ujemne (dziś mówimy odwrotnie: „być na minusie”, „w czerwonych liczbach”). W Europie było zupełnie inaczej — jeszcze w XVIII wieku część matematyków uważała liczby ujemne za „absurdalne” i chciała je z matematyki usunąć. W klasie 5 poznasz je jako coś naturalnego: oś liczbowa po prostu przedłuża się w lewo, za zero.',
      sourceLabel: 'Wikipedia — Dziewięć rozdziałów o sztuce matematycznej',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Dziewi%C4%99%C4%87_rozdzia%C5%82%C3%B3w_o_sztuce_matematycznej',
    },
  },
  {
    moduleSlug: 'podsumowanie',
    slug: 'co-dalej',
    kind: 'lekcja',
    number: 3,
    title: '„Co dalej” — zapowiedź tematów klasy 5',
    short: 'Co dalej: klasa 5',
    goal: 'Zobacz cztery tematy, od których zacznie się klasa 5 — ułamki o różnych mianownikach, liczby ujemne, procenty oraz prędkość, droga i czas — i przekonaj się, że każdy zaczyna się od czegoś, co już umiesz.',
    description:
      'Ostatnia lekcja kursu matematyki klasy 4: zapowiedź czterech tematów klasy 5 (dodawanie ułamków o różnych mianownikach, liczby całkowite i ujemne, procenty, prędkość-droga-czas) pokazana jako naturalne przedłużenie umiejętności z klasy 4, z interaktywną „setką" 10×10 do procentów.',
    duration: '15–20 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Znak % powstał ze skrótu włoskich kupców',
      text: 'Włoscy kupcy w XV wieku pisali „na sto" jako „per cento". Przez kolejne stulecia skracali to coraz mocniej — aż z zapisu liczby 100 ściśniętego w skrót powstał znak, który dziś znasz: %. Dlatego 100% oznacza całość — „sto na sto". W klasie 5 procent okaże się po prostu innym zapisem setnej części, którą już liczysz w ułamkach dziesiętnych: 25% to 0,25, czyli 25 na 100.',
      sourceLabel: 'Wikipedia — Procent',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Procent',
    },
  },
];

export const getModuleLessons = (moduleSlug: string): MathLesson[] =>
  MATH_LESSONS.filter((lesson) => lesson.moduleSlug === moduleSlug).sort(
    (a, b) => a.number - b.number
  );

/**
 * Wszystkie opublikowane pozycje (lekcje, przewodniki, podsumowania) w kolejności
 * programu: najpierw moduł wg `MATH_MODULES`, potem `number` w module — ten sam
 * klucz co `getModuleLessons`, więc przewodniki z ułamkowym `number` (3.5, 10.5)
 * zostają wpięte między właściwe lekcje.
 */
const orderedPublishedLessons = (): MathLesson[] => {
  const moduleOrder = new Map(MATH_MODULES.map((m, i) => [m.slug, i]));
  return MATH_LESSONS.filter((lesson) => lesson.status === 'available').sort((a, b) => {
    const modA = moduleOrder.get(a.moduleSlug) ?? 0;
    const modB = moduleOrder.get(b.moduleSlug) ?? 0;
    return modA !== modB ? modA - modB : a.number - b.number;
  });
};

/**
 * Kolejna opublikowana pozycja po podanej — także pierwsza z następnego modułu.
 * `getModuleLessons(modul).find(number > current)` zatrzymywało się na granicy
 * modułu, więc po ostatniej lekcji modułu bez `podsumowania` (np. „Start kursu")
 * kartka końcowa nie miała dokąd prowadzić. Podsumowanie celowo pomijamy w
 * wywołaniu (prowadzi do strony następnego modułu przez `nextModule`).
 */
export const getNextLesson = (moduleSlug: string, slug: string): MathLesson | undefined => {
  const ordered = orderedPublishedLessons();
  const index = ordered.findIndex(
    (lesson) => lesson.moduleSlug === moduleSlug && lesson.slug === slug
  );
  return index === -1 ? undefined : ordered[index + 1];
};

export const getLesson = (moduleSlug: string, slug: string): MathLesson | undefined =>
  MATH_LESSONS.find((lesson) => lesson.moduleSlug === moduleSlug && lesson.slug === slug);

/** Lekcja obejmująca daną jednostkę tematyczną — do linkowania listy tematów modułu. */
export const getLessonForTopic = (moduleSlug: string, topicIndex: number): MathLesson | undefined =>
  MATH_LESSONS.find(
    (lesson) => lesson.moduleSlug === moduleSlug && lesson.topics.includes(topicIndex)
  );

/**
 * Wszystko, co ma własną stronę — łącznie z przewodnikami. Tego używa
 * `generateStaticParams` i odczyt postępu pojedynczych stron.
 */
export const getPublishedLessons = (): MathLesson[] =>
  MATH_LESSONS.filter((lesson) => lesson.status === 'available');

export const isGuide = (lesson: MathLesson): boolean => lesson.kind === 'przewodnik';

/**
 * Opublikowane lekcje BEZ przewodników — do liczenia ukończenia modułu i kursu.
 * Przewodnik to materiał pomocniczy: ma się dać przeczytać, ale nie może
 * decydować o tym, czy moduł jest zaliczony.
 */
export const getPublishedTeachingLessons = (): MathLesson[] =>
  getPublishedLessons().filter((lesson) => !isGuide(lesson));

/**
 * Wszystkie przewodniki modułu, łącznie z jeszcze niezbudowanymi (`status: 'soon'`)
 * — wpięte w listę „Czego się nauczysz” na stronie modułu. Status decyduje tam
 * o wariancie wiersza (klikalny `GuideRow` vs. wyciszony wiersz „wkrótce”), nie
 * o tym, czy przewodnik w ogóle się pojawia — planowany przewodnik ma się pokazać
 * jako zapowiedź, dokładnie jak jeszcze nieopracowany temat.
 */
export const getModuleGuides = (moduleSlug: string): MathLesson[] =>
  getModuleLessons(moduleSlug).filter(isGuide);

/**
 * Rejestr lekcji online kursu informatyki.
 *
 * W odróżnieniu od matematyki mapowanie jest 1:1 — jedna jednostka tematyczna
 * z `InfoModule.lessons` to jedna lekcja online, bo w informatyce jednostki są
 * już wielkości pojedynczej lekcji. `topics` i tak zostaje tablicą: dzięki temu
 * wiersze tematów na stronie modułu są klikalne (`getLessonForTopic`), a przyszłe
 * połączenie dwóch jednostek w jedną lekcję nie wymaga zmiany typu.
 *
 * Dodanie lekcji: przełącz `status` na `'available'`, dodaj komponent w
 * `components/lessons/<slug>/` i jedną linię w mapie `LESSON_COMPONENTS`
 * w `[modul]/[lekcja]/page.tsx`.
 *
 * Kurs NIE ma przewodników (matematyka ma) — kształt lekcji wynika tu z tematu,
 * więc teoria mieści się w samej lekcji; osobny typ treści byłby tym samym
 * materiałem pod inną nazwą.
 */

import { INFO_MODULES } from './curriculum';

export type LessonStatus = 'available' | 'soon';

/**
 * `lekcja`       — pojedyncza lekcja o kształcie podyktowanym tematem
 *                  (paleta bloków, nie sztywny szablon).
 * `podsumowanie` — powtórzenie i sprawdzian, zawsze ostatnia pozycja w module.
 */
export type LessonKind = 'lekcja' | 'podsumowanie';

/**
 * Nagroda odblokowywana po ukończeniu 100% lekcji — prawdziwa, zweryfikowana
 * ciekawostka powiązana z tematem, nie oderwana od niego treść.
 */
export interface LessonFunFact {
  title: string;
  /** 2–4 zdania treści, napisane wprost do dziecka. */
  text: string;
  /** Podpis źródła pokazywany pod ciekawostką (wiarygodność, nie ozdobnik). */
  sourceLabel: string;
  sourceUrl?: string;
}

export interface InfoLesson {
  /** Slug modułu z curriculum.ts. */
  moduleSlug: string;
  slug: string;
  kind: LessonKind;
  /** Numer lekcji w obrębie modułu (1-based). */
  number: number;
  title: string;
  /** Krótszy tytuł do nawigacji i kafelków. */
  short: string;
  /** Jedno zdanie: po co ta lekcja. */
  goal: string;
  /** Opis pod SEO/OG. */
  description: string;
  /** Orientacyjny czas, np. „20–25 min”. */
  duration: string;
  /** Indeksy jednostek tematycznych z `InfoModule.lessons`, które lekcja pokrywa. */
  topics: number[];
  status: LessonStatus;
  /** Ciekawostka-nagroda po ukończeniu lekcji — patrz `LessonFunFact`. */
  funFact?: LessonFunFact;
}

export const INFO_LESSONS: InfoLesson[] = [
  // ─── MODUŁ 0 — Start kursu ───────────────────────────────────────────────
  {
    moduleSlug: 'start',
    slug: 'jak-sie-uczyc',
    kind: 'lekcja',
    number: 1,
    title: 'Jak uczyć się informatyki i bezpiecznie pracować przy komputerze',
    short: 'Jak uczyć się informatyki',
    goal: 'Ustaw sobie miejsce pracy, plan nauki i przerwy, zanim zaczniesz kurs.',
    description:
      'Pierwsza lekcja kursu informatyki dla klasy 4: jak zorganizować naukę, jak ustawić stanowisko pracy i dlaczego przerwy przy komputerze nie są karą, tylko częścią pracy.',
    duration: '15–20 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Zasadę 20-20-20 wymyślił optometrysta, żeby ludzie w ogóle ją zapamiętali',
      text: 'Amerykański optometrysta Jeffrey Anshel szukał reguły na tyle prostej, żeby pacjenci pracujący przy komputerze naprawdę z niej korzystali — i zamiast tabelek z czasami pracy podał trzy takie same liczby: co 20 minut patrz przez 20 sekund na coś oddalonego o 20 stóp. Amerykańskie Towarzystwo Optometryczne zaleca ją do dziś jako podstawowy sposób na zmęczenie oczu przy ekranie. To rzadki przypadek, w którym o skuteczności porady zdecydowało nie to, co mówi, tylko to, jak łatwo ją zapamiętać.',
      sourceLabel: 'American Optometric Association — Computer Vision Syndrome',
      sourceUrl:
        'https://www.aoa.org/healthy-eyes/eye-and-vision-conditions/computer-vision-syndrome',
    },
  },
  {
    moduleSlug: 'start',
    slug: 'test-diagnostyczny',
    kind: 'lekcja',
    number: 2,
    title: 'Test diagnostyczny — co już umiem',
    short: 'Test diagnostyczny',
    goal: 'Sprawdź mysz i klawiaturę, uruchamianie programów, zapis pliku i podstawy bezpieczeństwa.',
    description:
      'Test diagnostyczny na start kursu informatyki klasy 4: obsługa myszy i klawiatury, uruchamianie programów, zapisywanie plików i podstawowe zasady bezpieczeństwa w sieci.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Pierwsza mysz komputerowa była z drewna',
      text: 'Zbudował ją w 1964 roku Douglas Engelbart: drewniane pudełko z dwoma metalowymi kółkami ustawionymi prostopadle do siebie — jedno mierzyło ruch w bok, drugie w przód i w tył. Nazwa wzięła się z wyglądu, bo pudełko z wystającym kablem przypominało mysz z ogonkiem. Engelbart pokazał ją światu 9 grudnia 1968 roku w San Francisco, podczas prezentacji, którą do dziś nazywa się „matką wszystkich pokazów” — obok myszy pokazał na niej także okna na ekranie, edytor tekstu i wideorozmowę.',
      sourceLabel: 'Computer History Museum — historia myszy komputerowej i pokazu z 1968 r.',
    },
  },

  // ─── MODUŁ 1 — Komputer, pliki i chmura ──────────────────────────────────
  {
    moduleSlug: 'komputer-i-pliki',
    slug: 'historia-komputera',
    kind: 'lekcja',
    number: 1,
    title: 'Od liczydła do komputera',
    short: 'Historia komputera',
    goal: 'Zobacz, jak z maszyn do liczenia powstał komputer, który masz na biurku.',
    description:
      'Historia komputera dla klasy 4: liczydło, maszyna Pascala, maszyna analityczna Babbage’a i Ada Lovelace, ENIAC, komputer osobisty i smartfon.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Ada Lovelace napisała, że maszyna mogłaby komponować muzykę — sto lat przed pierwszym komputerem',
      text: 'W notatkach z 1843 roku Ada Lovelace zauważyła coś, czego nie zauważył nikt inny, łącznie z samym konstruktorem maszyny: skoro maszyna analityczna umie działać na symbolach, to nie musi ograniczać się do liczb. Napisała, że gdyby zapisać regułami relacje między dźwiękami, maszyna mogłaby układać „rozbudowane i naukowe utwory muzyczne dowolnej złożoności i długości”. Pierwsze komputery zagrały muzykę dopiero w 1951 roku — ponad sto lat po tym, jak ktoś to przewidział na maszynie, której nigdy nie zbudowano.',
      sourceLabel: 'Ada Lovelace, przypis A do tłumaczenia „Szkicu maszyny analitycznej” (1843)',
    },
  },
  {
    moduleSlug: 'komputer-i-pliki',
    slug: 'zestaw-komputerowy',
    kind: 'lekcja',
    number: 2,
    title: 'Zestaw komputerowy w praktyce',
    short: 'Zestaw komputerowy',
    goal: 'Rozpoznaj urządzenia wejścia i wyjścia i używaj ich celowo, a nie przypadkiem.',
    description:
      'Budowa zestawu komputerowego dla klasy 4: jednostka centralna, urządzenia wejścia i wyjścia, bezpieczne i celowe korzystanie ze sprzętu.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Pierwszy zeskanowany obraz to zdjęcie trzymiesięcznego dziecka',
      text: 'W 1957 roku Russell Kirsch z amerykańskiego Biura Norm zbudował pierwszy skaner obrazu i podał mu do zeskanowania małe zdjęcie swojego trzymiesięcznego syna Waldena. Wynik — kwadrat 176 na 176 punktów, każdy albo biały, albo czarny — był pierwszym cyfrowym obrazem w historii. Cała dzisiejsza grafika komputerowa wyrasta z tego samego pomysłu: podziel obraz na siatkę drobnych punktów i każdemu przypisz liczbę. Oryginalny skan przechowuje się do dziś w zbiorach amerykańskiego instytutu norm.',
      sourceLabel: 'National Institute of Standards and Technology (NIST) — „Fiftieth Anniversary of First Digital Image”',
    },
  },
  {
    moduleSlug: 'komputer-i-pliki',
    slug: 'nosniki-danych',
    kind: 'lekcja',
    number: 3,
    title: 'Pamięci i nośniki danych — od dyskietki po chmurę',
    short: 'Nośniki danych',
    goal: 'Policz, ile mieści dyskietka, płyta CD i chmura — i co to znaczy dla twoich plików.',
    description:
      'Nośniki danych i jednostki informacji dla klasy 4: bit, bajt, KB, MB, GB, TB oraz porównanie pojemności dyskietek, płyt CD, DVD i Blu-ray.',
    duration: '25–30 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Pierwszy dysk twardy ważył tonę i mieścił mniej niż jedno dzisiejsze zdjęcie',
      text: 'W 1956 roku firma IBM pokazała RAMAC 350 — pierwszy dysk twardy. Pięćdziesiąt wirujących metalowych talerzy wielkości dużej pizzy, całość rozmiaru szafy, waga około tony. Mieścił jakieś 3,75 MB, czyli mniej niż jedno zdjęcie z twojego telefonu. Firmy go nie kupowały, tylko wynajmowały — za mniej więcej 3200 dolarów miesięcznie, a samochód kosztował wtedy taniej. Dziś karta pamięci mniejsza od paznokcia mieści dziesiątki tysięcy razy więcej.',
      sourceLabel: 'IBM — „IBM 350 disk storage unit” oraz Computer History Museum',
    },
  },
  {
    moduleSlug: 'komputer-i-pliki',
    slug: 'programy-i-licencje',
    kind: 'lekcja',
    number: 4,
    title: 'Programy i ich zastosowania',
    short: 'Programy i licencje',
    goal: 'Dobierz program do zadania i sprawdź, czy wolno ci z niego korzystać.',
    description:
      'Programy komputerowe i ich zastosowania dla klasy 4: edytory tekstu, grafiki i arkusze, a także różnica między programem płatnym, darmowym i open source.',
    duration: '20–25 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Program do filmów animowanych jego użytkownicy wykupili na własność za zrzutkę',
      text: 'W 2002 roku firma, która tworzyła Blender — program do grafiki i animacji 3D — zbankrutowała. Właściciele zgodzili się uwolnić kod źródłowy za sto tysięcy euro. Społeczność użytkowników zebrała tę kwotę w siedem tygodni, drobnymi wpłatami z całego świata, i od tej pory Blender jest darmowy oraz otwarty dla każdego. Dziś powstają w nim filmy, gry i efekty specjalne, a nikt nie musi za niego płacić ani prosić o pozwolenie.',
      sourceLabel: 'Blender Foundation — historia projektu i kampania „Free Blender” (2002)',
    },
  },
  {
    moduleSlug: 'komputer-i-pliki',
    slug: 'pliki-i-chmura',
    kind: 'lekcja',
    number: 5,
    title: 'Pliki i foldery — lokalnie i w chmurze',
    short: 'Pliki i chmura',
    goal: 'Zapisz pracę tam, gdzie ją potem znajdziesz — i wiedz, czym się różni dysk od chmury.',
    description:
      'Pliki i foldery dla klasy 4: nazwa i rozszerzenie pliku, porządkowanie w folderach, zapisywanie pracy lokalnie i w środowisku chmurowym.',
    duration: '20–25 min',
    topics: [4],
    status: 'available',
    funFact: {
      title: 'Przez pierwsze piętnaście lat nazwa pliku mogła mieć najwyżej osiem liter',
      text: 'Pierwsze komputery osobiste z systemem MS-DOS pozwalały nazwać plik najwyżej ośmioma znakami, plus trzy znaki rozszerzenia po kropce — i żadnych spacji ani polskich liter. Dlatego referat o pszczołach nazywało się PSZCZOLY.DOC, a jego trzecia wersja PSZCZOL3.DOC. Dłuższe nazwy ze spacjami przyszły dopiero z systemem Windows 95. Kropka z rozszerzeniem została z nami do dziś i nadal robi to samo, co wtedy: mówi komputerowi, jakim programem otworzyć plik.',
      sourceLabel: 'Microsoft — dokumentacja systemu MS-DOS (nazwy 8.3) i premiera Windows 95',
    },
  },

  // ─── MODUŁ 2 — Internet, bezpieczeństwo i dane ───────────────────────────
  {
    moduleSlug: 'internet-i-bezpieczenstwo',
    slug: 'jak-dziala-siec',
    kind: 'lekcja',
    number: 1,
    title: 'Jak działa sieć',
    short: 'Jak działa sieć',
    goal: 'Zrozum różnicę między przeglądarką a wyszukiwarką i po co komputery łączą się ze sobą.',
    description:
      'Jak działa internet — lekcja dla klasy 4: sieć komputerowa, przeglądarka a wyszukiwarka, adres strony, komunikacja i dostęp do informacji.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Pierwsza wiadomość wysłana przez sieć miała dwie litery — bo komputer się zawiesił',
      text: '29 października 1969 roku studenci z uniwersytetu w Kalifornii wysłali pierwszą w historii wiadomość między dwoma odległymi komputerami, przez sieć ARPANET — przodka dzisiejszego internetu. Chcieli wpisać słowo „LOGIN”, ale zaraz po literach „LO” komputer po drugiej stronie się zawiesił. Więc pierwszą rzeczą, jaka kiedykolwiek przeszła przez sieć, było „lo” — jak początek angielskiego „hello”. Godzinę później, po naprawie, przeszło całe słowo.',
      sourceLabel: 'Leonard Kleinrock, UCLA — relacja z pierwszego połączenia ARPANET (1969)',
    },
  },
  {
    moduleSlug: 'internet-i-bezpieczenstwo',
    slug: 'wyszukiwanie-i-ocena-informacji',
    kind: 'lekcja',
    number: 2,
    title: 'Szukanie i sprawdzanie informacji',
    short: 'Wyszukiwanie i ocena źródeł',
    goal: 'Znajdź informację, a potem sprawdź, czy można jej wierzyć.',
    description:
      'Wyszukiwanie informacji w internecie dla klasy 4: dobre słowa kluczowe, porównywanie źródeł, ocena wiarygodności i rozpoznawanie podejrzanych treści.',
    duration: '25–30 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Słowo „spam” na śmieciowe wiadomości wzięło się ze skeczu o puszce mielonki',
      text: 'W 1970 roku brytyjska grupa komików Monty Python nagrała skecz, w którym w barze każde danie jest z konserwową mielonką o nazwie SPAM, a grupa wikingów zagłusza rozmowę, śpiewając w kółko „spam, spam, spam…”. Dwadzieścia lat później użytkownicy pierwszych sieci komputerowych zaczęli tak nazywać wiadomości, które zalewają skrzynkę i zagłuszają te prawdziwe — bo robią dokładnie to samo co ci wikingowie. Nazwa przyjęła się na całym świecie i trafiła do słowników.',
      sourceLabel: 'Oxford English Dictionary — hasło „spam” oraz archiwum Monty Python’s Flying Circus (1970)',
    },
  },
  {
    moduleSlug: 'internet-i-bezpieczenstwo',
    slug: 'dane-osobowe-i-hasla',
    kind: 'lekcja',
    number: 3,
    title: 'Twoje dane i twoje hasła',
    short: 'Dane osobowe i hasła',
    goal: 'Wiedz, czego o sobie nie podawać i jak zbudować hasło, którego nikt nie zgadnie.',
    description:
      'Dane osobowe i prywatność w sieci dla klasy 4: co wolno o sobie udostępniać, jak tworzyć mocne hasła i jak ustawić podstawową prywatność.',
    duration: '25–30 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Pierwszą kradzież hasła w historii zrobiono za pomocą kartki papieru',
      text: 'W 1961 roku komputer w amerykańskiej uczelni MIT jako jeden z pierwszych zaczął chronić pliki hasłami — każdy badacz miał swój limit czasu na maszynie. Rok później Allan Scherr, któremu limit nie wystarczał, złożył zwykłe zamówienie na wydruk i poprosił o wydrukowanie pliku ze wszystkimi hasłami. Dostał kartkę z hasłami wszystkich użytkowników i spokojnie korzystał z ich czasu. To była pierwsza kradzież hasła na świecie — a wystarczył do niej kawałek papieru, nie żadne włamanie.',
      sourceLabel: 'Fernando Corbató (twórca systemu CTSS) oraz relacja Allana Scherra, MIT',
    },
  },
  {
    moduleSlug: 'internet-i-bezpieczenstwo',
    slug: 'zagrozenia-i-pomoc',
    kind: 'lekcja',
    number: 4,
    title: 'Zagrożenia w sieci i gdzie szukać pomocy',
    short: 'Zagrożenia i pomoc',
    goal: 'Rozpoznaj zagrożenie, zareaguj i wiedz, do kogo się zwrócić.',
    description:
      'Zagrożenia w internecie dla klasy 4: cyberprzemoc, wyłudzanie danych, nieznajomi w sieci — sposoby reagowania oraz numery telefonów zaufania i instytucje pomocowe.',
    duration: '35–45 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Numer 116 111 jest taki sam w połowie Europy — i to nie przypadek',
      text: 'W 2007 roku Komisja Europejska zarezerwowała we wszystkich krajach Unii pulę numerów zaczynających się od „116” wyłącznie dla telefonów pomocowych — takich, pod które dzwoni się w trudnej sytuacji, a nie po to, żeby coś kupić. Dzięki temu 116 111 to telefon zaufania dla dzieci nie tylko w Polsce, ale też między innymi w Niemczech, Czechach i Hiszpanii, a numer 116 000 w całej Unii służy do zgłaszania zaginięcia dziecka. Numer jest krótki i wszędzie taki sam po to, żeby dało się go zapamiętać, zanim będzie potrzebny.',
      sourceLabel: 'Decyzja Komisji Europejskiej 2007/116/WE o rezerwacji zakresu „116” dla usług o walorze społecznym',
    },
  },
  {
    moduleSlug: 'internet-i-bezpieczenstwo',
    slug: 'netykieta-i-poczta',
    kind: 'lekcja',
    number: 5,
    title: 'Netykieta i poczta elektroniczna',
    short: 'Netykieta i e-mail',
    goal: 'Napisz e-mail, który da się przeczytać — z tematem, podpisem i załącznikiem.',
    description:
      'Poczta elektroniczna i netykieta dla klasy 4: adres e-mail, temat, treść, podpis, załącznik oraz zasady kulturalnej komunikacji w sieci.',
    duration: '30–40 min',
    topics: [4],
    status: 'available',
    funFact: {
      title: 'Znak @ w adresie e-mail wybrano dlatego, że nikt inny go nie używał',
      text: 'W 1971 roku Ray Tomlinson wysłał pierwszą wiadomość między dwoma komputerami i musiał jakoś oddzielić nazwę osoby od nazwy maszyny, na której ma skrzynkę. Spojrzał na klawiaturę i wybrał znak @ — bo był tuż pod ręką, a przy tym nie pojawiał się w żadnym nazwisku ani nazwie komputera, więc niczego nie mógł popsuć. Po angielsku @ czyta się „at”, czyli „w”, „na” — i tak zostało do dziś: jesteś „na” serwerze, którego nazwa stoi po znaku @.',
      sourceLabel: 'Internet Hall of Fame — biogram Raya Tomlinsona, twórcy sieciowej poczty elektronicznej',
    },
  },
  {
    moduleSlug: 'internet-i-bezpieczenstwo',
    slug: 'prawo-autorskie',
    kind: 'lekcja',
    number: 6,
    title: 'Cudze materiały i prawo autorskie',
    short: 'Prawo autorskie',
    goal: 'Bierz cudze zdjęcia, dźwięki i teksty tak, żeby nikomu ich nie ukraść — i zawsze podpisuj, skąd je masz.',
    description:
      'Prawo autorskie dla klasy 4: co wolno wykorzystać z internetu, jak podawać źródła i gdzie szukać legalnych, darmowych grafik i dźwięków.',
    duration: '25–30 min',
    topics: [5],
    status: 'available',
    funFact: {
      title: 'Za „Happy Birthday” trzeba było płacić — i to przez ponad 80 lat',
      text: 'Najpopularniejsza piosenka świata przez dziesięciolecia miała właściciela: firma Warner/Chappell pobierała opłaty za każde jej zaśpiewanie w filmie, serialu czy reklamie — nawet do dwóch tysięcy dolarów za jedno użycie. Dlatego w starych filmach bohaterowie na urodzinach śpiewają dziwne, wymyślone piosenki: taniej było napisać nową niż zapłacić za tę jedną. W 2015 roku sąd w Los Angeles orzekł, że firma nigdy nie miała praw do słów tej piosenki, a rok później ugoda ostatecznie uwolniła ją dla wszystkich. Prawo autorskie to nie jest szkolna teoria — to są prawdziwe pieniądze i prawdziwe sądy.',
      sourceLabel: 'Wyrok sądu federalnego w Los Angeles w sprawie Marya v. Warner/Chappell Music (2015) i ugoda z 2016 r.',
    },
  },

  // ─── MODUŁ 3 — Grafika komputerowa ───────────────────────────────────────
  {
    moduleSlug: 'grafika',
    slug: 'edytor-grafiki',
    kind: 'lekcja',
    number: 1,
    title: 'Edytor grafiki — pierwsze narzędzia',
    short: 'Edytor grafiki',
    goal: 'Opanuj pędzel, gumkę, figury i cofanie zmian — resztę modułu zbudujesz na tym.',
    description:
      'Praca w edytorze grafiki dla klasy 4: narzędzia, kolory, figury i linie, praca na powiększeniu oraz cofanie zmian.',
    duration: '25–30 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Pierwszy program do rysowania sam prostował krzywe kreski — w 1963 roku',
      text: 'Nazywał się Sketchpad i rysowało się w nim piórem świetlnym prosto po ekranie, bo myszy jeszcze nie wymyślono. Najciekawsze jest to, co robił potem: sam prostował krzywe kreski, wyrównywał kąty i zrównywał długości boków — dokładnie tak, jak dziś robi to narzędzie Linia i klawisz Shift. Jego autor, Ivan Sutherland, dostał za to Nagrodę Turinga, czyli informatyczną Nagrodę Nobla.',
      sourceLabel: 'Ivan E. Sutherland, „Sketchpad: A Man-Machine Graphical Communication System”, MIT 1963',
      sourceUrl: 'https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-574.pdf',
    },
  },
  {
    moduleSlug: 'grafika',
    slug: 'kopiowanie-i-obracanie',
    kind: 'lekcja',
    number: 2,
    title: 'Zaznaczanie, kopiowanie i obracanie',
    short: 'Kopiowanie i obrót',
    goal: 'Narysuj jeden element, a resztę zrób kopiowaniem i obrotem.',
    description:
      'Zaznaczanie fragmentu rysunku dla klasy 4: kopiowanie, wklejanie, przesuwanie, obracanie i odbicie lustrzane na przykładzie czterolistnej koniczyny.',
    duration: '25–30 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Zanim wymyślono Ctrl+C, teksty naprawdę tnie się nożyczkami',
      text: 'Słowa „wytnij” i „wklej” nie są przenośnią — kiedyś tak się właśnie poprawiało teksty: redaktor rozcinał kartkę nożyczkami, przekładał akapit w inne miejsce i przyklejał go klejem. W 1975 roku Larry Tesler i Tim Mott pracowali w ośrodku badawczym Xerox PARC nad edytorem tekstu Gypsy i przenieśli tę samą czynność na ekran — razem z nazwami. Ten sam pomysł działa dziś w każdym programie na świecie: kopiujesz kawałek rysunku dokładnie tak, jak twoja prababcia przekładała akapit.',
      sourceLabel: 'Computer History Museum — Larry Tesler, Tim Mott i edytor Gypsy w Xerox PARC (1975)',
    },
  },
  {
    moduleSlug: 'grafika',
    slug: 'rozmiar-i-napisy',
    kind: 'lekcja',
    number: 3,
    title: 'Rozmiar obrazu i napisy na grafice',
    short: 'Rozmiar i napisy',
    goal: 'Ustaw dokładny rozmiar obrazu i podpisz go tak, żeby dało się to przeczytać.',
    description:
      'Rozmiar obrazu i płótna dla klasy 4: piksel jako jednostka, zmiana wymiarów, przycinanie oraz dodawanie napisów na grafice.',
    duration: '25–30 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Pierwsze zdjęcie w komputerze miało 176 na 176 pikseli',
      text: 'W 1957 roku Russell Kirsch pracował w amerykańskim Narodowym Biurze Standardów przy komputerze SEAC i wpadł na pomysł, żeby wprowadzić do niego prawdziwe zdjęcie. Wybrał fotografię swojego trzymiesięcznego synka Waldena. Wyszło 176 na 176 pikseli, czyli 30 976 — mniej, niż ma dziś ikonka programu na pulpicie. To był pierwszy obraz cyfrowy na świecie i od niego zaczyna się wszystko: każde zdjęcie w telefonie, każdy film i każdy obrazek na tej stronie.',
      sourceLabel: 'NIST — Russell Kirsch i pierwszy zeskanowany obraz cyfrowy (komputer SEAC, 1957)',
    },
  },
  {
    moduleSlug: 'grafika',
    slug: 'formaty-i-kartka',
    kind: 'lekcja',
    number: 4,
    title: 'Formaty plików graficznych i kartka okolicznościowa',
    short: 'Formaty i kartka',
    goal: 'Zapisz obraz w dobrym formacie i wyślij go komuś jako załącznik.',
    description:
      'Formaty plików graficznych dla klasy 4 — PNG, JPG, BMP, GIF — oraz projekt kartki okolicznościowej wysłanej e-mailem jako załącznik.',
    duration: '25–30 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'GIF przetrwał, bo nikt nie mógł się dogadać, jak wymawiać jego nazwę',
      text: 'Format GIF wymyślił w 1987 roku Steve Wilhite, pracując w firmie CompuServe. Do dziś trwa spór, czy mówi się „gif”, czy „dżif” — sam autor twierdził stanowczo, że „dżif”, i w 2013 roku, odbierając nagrodę za całokształt, wyświetlił na ekranie zdanie kończące dyskusję. Internet i tak się z nim nie zgodził. GIF ma tylko 256 kolorów i przegrywa dziś ze wszystkim, ale przetrwał trzydzieści kilka lat dzięki jednej rzeczy, której tamte formaty nie mają: potrafi się ruszać.',
      sourceLabel: 'CompuServe, „Graphics Interchange Format” (1987); The New York Times o nagrodzie Webby dla Steve’a Wilhite’a (2013)',
    },
  },

  // ─── MODUŁ 4 — Dokumenty tekstowe ────────────────────────────────────────
  {
    moduleSlug: 'dokumenty-tekstowe',
    slug: 'czcionki-i-zasady-pisania',
    kind: 'lekcja',
    number: 1,
    title: 'Zasady pisania tekstu i kroje czcionki',
    short: 'Czcionki i zasady pisania',
    goal: 'Pisz tak, żeby edytor ci pomagał — i poznaj kroje, które masz do dyspozycji.',
    description:
      'Edytor tekstu dla klasy 4: zasady pisania (spacja, interpunkcja, akapit), kroje czcionki, ich formatowanie oraz polskie znaki diakrytyczne.',
    duration: '25–30 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Polskie „ł” wymyślono, żeby nie pisać dwóch liter zamiast jednej',
      text: 'Kreskowane „ł” wprowadził do polskiej pisowni Jakub Parkosz z Żurawicy, rektor Akademii Krakowskiej, w pierwszym traktacie o polskiej ortografii spisanym około 1440 roku. Wcześniej ten sam dźwięk zapisywano na kilka sposobów naraz i każdy pisał po swojemu. Dziś ta jedna literka potrafi zepsuć cały dokument: kroje czcionek robione poza Polską często jej nie mają, więc program po cichu podstawia ją z innego kroju — i wyraz nagle wygląda, jakby ktoś go poskładał z dwóch różnych pism.',
      sourceLabel: 'Jakub Parkosz z Żurawicy, traktat o ortografii polskiej (ok. 1440); Biblioteka Jagiellońska',
    },
  },
  {
    moduleSlug: 'dokumenty-tekstowe',
    slug: 'akapity-i-listy',
    kind: 'lekcja',
    number: 2,
    title: 'Akapity, wyrównanie i listy',
    short: 'Akapity i listy',
    goal: 'Rozłóż tekst na stronie tak, żeby dało się go objąć wzrokiem.',
    description:
      'Formatowanie akapitów dla klasy 4: wyrównanie, wcięcia, odstępy oraz listy wypunktowane i numerowane w edytorze tekstu.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Akapit pochodzi od czerwonego znaczka, który stawiał zakonnik',
      text: 'W średniowiecznych rękopisach tekst szedł jednym ciągiem, bez odstępów i bez wcięć — pergamin był za drogi, żeby zostawiać puste miejsca. Żeby dało się cokolwiek znaleźć, skryba wstawiał w miejscu nowej myśli czerwony znaczek ¶ zwany pilcrow. Ten sam znaczek siedzi dziś w każdym edytorze tekstu pod przyciskiem „pokaż znaki niedrukowane” — i dalej robi dokładnie to samo: pokazuje, gdzie kończy się jedna myśl, a zaczyna następna.',
      sourceLabel: 'M.B. Parkes, „Pause and Effect: An Introduction to the History of Punctuation in the West”, 1993',
    },
  },
  {
    moduleSlug: 'dokumenty-tekstowe',
    slug: 'podzial-tekstu',
    kind: 'lekcja',
    number: 3,
    title: 'Podział tekstu na części i wyróżnianie',
    short: 'Śródtytuły i wyróżnienia',
    goal: 'Podziel dłuższy tekst na etapy, ponazywaj je i wyróżnij to, co najważniejsze.',
    description:
      'Podział tekstu na części dla klasy 4: tytuł główny, śródtytuły, akapity oraz wyróżnianie fragmentów kolorem na przykładzie przepisu kulinarnego.',
    duration: '25–30 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Najstarszy zapisany przepis kulinarny ma prawie 4000 lat i jest instrukcją krok po kroku',
      text: 'Na glinianych tabliczkach z Mezopotamii, przechowywanych dziś na Uniwersytecie Yale, zapisano pismem klinowym dwadzieścia pięć przepisów — najstarsze pochodzą sprzed około 1750 roku p.n.e. Co w nich najciekawsze dla informatyka: są napisane dokładnie tak, jak pisze się dziś instrukcje i programy — w trybie rozkazującym i w ściśle określonej kolejności („mięso opłucz, wodę dodaj, tłuszcz dorzuć”). Przepis okazał się jedną z pierwszych rzeczy, które człowiek uznał za warte zapisania krok po kroku.',
      sourceLabel: 'Yale Babylonian Collection, tabliczki YBC 4644, 8958 i 4648 (ok. 1750 p.n.e.)',
    },
  },
  {
    moduleSlug: 'dokumenty-tekstowe',
    slug: 'ilustracja-i-tabela',
    kind: 'lekcja',
    number: 4,
    title: 'Dokument z ilustracją i tabelą',
    short: 'Ilustracja i tabela',
    goal: 'Wstaw obraz i tabelę tak, żeby pomagały czytać, a nie przeszkadzały.',
    description:
      'Dokument tekstowy z ilustracją i tabelą dla klasy 4: wstawianie obrazu, prosta tabela, sprawdzanie pisowni oraz zapis i udostępnienie pliku.',
    duration: '25–30 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Pierwszy sprawdzacz pisowni znał sześć tysięcy słów — i odrzucał połowę zwykłego tekstu',
      text: 'W 1971 roku Ralph Gorin napisał w Stanfordzie program SPELL — pierwszy sprawdzacz pisowni, jaki w ogóle powstał. Jego słownik miał około sześciu tysięcy wyrazów, więc program uparcie podkreślał zupełnie poprawne słowa, których po prostu nie znał. Dziś słowniki mają setki tysięcy haseł i ten problem zniknął, ale ten drugi został ten sam, co pięćdziesiąt lat temu: program sprawdza, czy wyraz istnieje, a nie czy pasuje do zdania.',
      sourceLabel: 'Ralph Gorin, program SPELL, Stanford Artificial Intelligence Laboratory (1971)',
    },
  },

  // ─── MODUŁ 5 — Myślenie komputacyjne ─────────────────────────────────────
  {
    moduleSlug: 'myslenie-komputacyjne',
    slug: 'porzadkowanie-i-szukanie',
    kind: 'lekcja',
    number: 1,
    title: 'Porządkowanie i szukanie',
    short: 'Porządkowanie i szukanie',
    goal: 'Ustaw obiekty w kolejności i znajdź ten, który spełnia warunek.',
    description:
      'Myślenie komputacyjne dla klasy 4: układanie obiektów w kolejności liniowej według cech i relacji oraz znajdowanie elementów o podanych własnościach.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Książka telefoniczna była największą uporządkowaną szufladą świata',
      text: 'Zanim pojawiły się telefony komórkowe, w każdym domu leżała gruba księga ze wszystkimi numerami w mieście — czasem milion nazwisk. Nikt nigdy nie przeglądał jej od początku. Otwierało się mniej więcej w połowie, patrzyło na literę i odrzucało pół książki naraz. To dokładnie to samo szukanie połówkowe, którego właśnie użyłeś przy szufladach: przy milionie nazwisk wystarczy dwadzieścia takich ruchów, żeby trafić w jedno.',
      sourceLabel: 'Donald E. Knuth, „The Art of Computer Programming”, tom 3: Sortowanie i wyszukiwanie (1973)',
    },
  },
  {
    moduleSlug: 'myslenie-komputacyjne',
    slug: 'plan-dla-robota',
    kind: 'lekcja',
    number: 2,
    title: 'Plan dla robota',
    short: 'Plan dla robota',
    goal: 'Rozłóż problem na kroki i zaplanuj drogę robota do celu.',
    description:
      'Podejście komputacyjne dla klasy 4: rozkładanie problemu z otoczenia na kroki i planowanie zachowania robota zmierzającego do określonego celu.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Pierwszego robota-żółwia dzieci programowały już w 1969 roku',
      text: 'Seymour Papert wymyślił w MIT język Logo, a do niego małego robota na kółkach zwanego żółwiem. Dzieci pisały mu polecenia typu „naprzód 50”, „w prawo 90” — dokładnie takie same, jakich używałeś dla robota na planszy — a żółw jeździł po podłodze z pisakiem i rysował. Papert twierdził, że najważniejsze w tym nie jest programowanie, tylko szukanie błędów: dziecko uczy się, że pomyłka nie jest porażką, tylko informacją, gdzie trzeba poprawić plan.',
      sourceLabel: 'Seymour Papert, „Mindstorms: Children, Computers, and Powerful Ideas”, MIT 1980',
    },
  },

  // ─── MODUŁ 6 — Programowanie w Scratch ───────────────────────────────────
  {
    moduleSlug: 'programowanie-scratch',
    slug: 'scena-duszki-bloki',
    kind: 'lekcja',
    number: 1,
    title: 'Scena, duszki i bloki — pierwszy skrypt',
    short: 'Pierwszy skrypt',
    goal: 'Zbuduj i uruchom swój pierwszy działający skrypt w Scratchu.',
    description:
      'Pierwsze kroki w Scratchu dla klasy 4: scena, duszki, paleta bloków, budowanie pierwszego skryptu oraz uruchamianie i zatrzymywanie programu.',
    duration: '30–35 min',
    topics: [0],
    status: 'available',
  },
  {
    moduleSlug: 'programowanie-scratch',
    slug: 'ruch-i-styl-obrotu',
    kind: 'lekcja',
    number: 2,
    title: 'Własny duszek, ruch i styl obrotu',
    short: 'Ruch i styl obrotu',
    goal: 'Namaluj własnego duszka i spraw, żeby chodził w poziomie, a nie głową w dół.',
    description:
      'Ruch duszka w Scratchu dla klasy 4: edytor duszków, układ współrzędnych sceny, kierunek oraz styl obrotu lewo-prawo.',
    duration: '30–35 min',
    topics: [1],
    status: 'available',
  },
  {
    moduleSlug: 'programowanie-scratch',
    slug: 'zdarzenia-i-komunikaty',
    kind: 'lekcja',
    number: 3,
    title: 'Zdarzenia i komunikaty — po kolei czy jednocześnie',
    short: 'Zdarzenia i komunikaty',
    goal: 'Spraw, żeby duszki pojawiały się po kolei, a znikały wszystkie naraz.',
    description:
      'Zdarzenia i komunikaty w Scratchu dla klasy 4: reagowanie na kliknięcie flagi i klawisz, nadawanie komunikatów, pokazywanie i ukrywanie duszków.',
    duration: '30–35 min',
    topics: [2],
    status: 'available',
  },
  {
    moduleSlug: 'programowanie-scratch',
    slug: 'petle-i-warunki',
    kind: 'lekcja',
    number: 4,
    title: 'Pętle i warunki',
    short: 'Pętle i warunki',
    goal: 'Każ programowi powtarzać i wybierać zamiast pisać to samo dziesięć razy.',
    description:
      'Pętle i instrukcje warunkowe w Scratchu dla klasy 4: powtarzanie, animacja kostiumów, reagowanie na dotknięcie i sterowanie klawiaturą.',
    duration: '30–35 min',
    topics: [3],
    status: 'available',
  },
  {
    moduleSlug: 'programowanie-scratch',
    slug: 'robot-na-ekranie',
    kind: 'lekcja',
    number: 5,
    title: 'Sterowanie robotem na ekranie',
    short: 'Robot na ekranie',
    goal: 'Zaprogramuj robota tak, żeby sam dotarł do celu.',
    description:
      'Programowanie robota dla klasy 4: sterowanie obiektem na ekranie (lub robotem fizycznym) w celu wykonania określonego zadania.',
    duration: '25–30 min',
    topics: [4],
    status: 'available',
  },
  {
    moduleSlug: 'programowanie-scratch',
    slug: 'testowanie-i-bledy',
    kind: 'lekcja',
    number: 6,
    title: 'Testowanie i poprawianie programu',
    short: 'Testowanie i błędy',
    goal: 'Znajdź błąd w cudzym programie i wytłumacz, dlaczego twój działa.',
    description:
      'Debugowanie dla klasy 4: porównanie działania programu z założeniami, testowanie na wybranych danych, szukanie błędów i objaśnianie własnego rozwiązania.',
    duration: '25–30 min',
    topics: [5],
    status: 'available',
  },

  // ─── MODUŁ 7 — Dane, multimedia i sztuczna inteligencja ──────────────────
  {
    moduleSlug: 'dane-i-ai',
    slug: 'arkusz-pierwsze-kroki',
    kind: 'lekcja',
    number: 1,
    title: 'Pierwsze kroki w arkuszu kalkulacyjnym',
    short: 'Arkusz kalkulacyjny',
    goal: 'Wpisz dane do tabeli, policz je i pokaż na wykresie.',
    description:
      'Arkusz kalkulacyjny dla klasy 4: komórki i tabela, proste obliczenie, prosty wykres i wniosek wyciągnięty z własnych danych.',
    duration: '25–30 min',
    topics: [0],
    status: 'available',
  },
  {
    moduleSlug: 'dane-i-ai',
    slug: 'prezentacja',
    kind: 'lekcja',
    number: 2,
    title: 'Prezentacja dla konkretnego odbiorcy',
    short: 'Prezentacja',
    goal: 'Zaplanuj prezentację, zanim zaczniesz wstawiać slajdy.',
    description:
      'Prezentacja multimedialna dla klasy 4: plan wystąpienia, budowa slajdu, czytelność i dopasowanie treści do odbiorcy.',
    duration: '30–35 min',
    topics: [1],
    status: 'available',
  },
  {
    moduleSlug: 'dane-i-ai',
    slug: 'multimedia',
    kind: 'lekcja',
    number: 3,
    title: 'Materiały multimedialne',
    short: 'Multimedia',
    goal: 'Połącz tekst, obraz i prostą animację w jeden materiał.',
    description:
      'Materiały multimedialne dla klasy 4: łączenie tekstu, obrazu i prostych animacji w materiał wspierający naukę innych przedmiotów.',
    duration: '25–30 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Spór o to, czy galopujący koń ma kiedyś wszystkie nogi w powietrzu, rozstrzygnęło dwanaście aparatów',
      text: 'W latach siedemdziesiątych XIX wieku nikt nie umiał tego przesądzić — koń galopuje za szybko, żeby oko nadążyło, a malarze rysowali go po swojemu od wieków. Eadweard Muybridge ustawił więc wzdłuż toru w Palo Alto rząd aparatów fotograficznych i rozciągnął nitki, które koń zrywał kopytami, sam wyzwalając kolejne zdjęcia. W 1878 roku pokazał wynik: na jednej z klatek wszystkie cztery kopyta są w powietrzu. Żadne pojedyncze zdjęcie nie mogło tego pokazać wcześniej — potrzebny był ciąg obrazków po kolei, czyli dokładnie to, co ty robiłeś w drugim bloku tej lekcji.',
      sourceLabel: 'Eadweard Muybridge, „The Horse in Motion”, Palo Alto 1878',
    },
  },
  {
    moduleSlug: 'dane-i-ai',
    slug: 'sztuczna-inteligencja',
    kind: 'lekcja',
    number: 4,
    title: 'Sztuczna inteligencja — jak się uczy z danych',
    short: 'Sztuczna inteligencja',
    goal: 'Wytrenuj własny model i zobacz, jak zmiana danych zmienia jego odpowiedzi.',
    description:
      'Sztuczna inteligencja dla klasy 4: tworzenie treści prostymi narzędziami AI, formułowanie zapytań, trenowanie własnego modelu i wpływ danych na jego wyniki.',
    duration: '30–35 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Najpopularniejsza gra w rysowanie na świecie była w rzeczywistości zbieraniem przykładów dla maszyny',
      text: 'W 2016 roku Google udostępnił grę „Quick, Draw!”: dostajesz hasło, masz 20 sekund na rysunek, a maszyna próbuje zgadnąć, co rysujesz. Ludzie z całego świata narysowali w niej ponad 50 milionów rysunków w 345 kategoriach — słońca, domki, ryby, rowery. Każdy z tych rysunków został przykładem, z którego uczą się maszyny rozpoznające rysunki. To dokładnie to, co robiłeś/robiłaś w drugim bloku tej lekcji — tylko twoja maszyna miała kilka rysunków, a tamta pięćdziesiąt milionów.',
      sourceLabel: 'Google Creative Lab, „Quick, Draw!” (2016) i zbiór danych „The Quick, Draw! Dataset”',
      sourceUrl: 'https://quickdraw.withgoogle.com/data',
    },
  },

  // ─── MODUŁ 8 — Technologia, środowisko i projekt roczny ──────────────────
  {
    moduleSlug: 'technologia-i-projekt',
    slug: 'technologia-i-srodowisko',
    kind: 'lekcja',
    number: 1,
    title: 'Technologia a środowisko',
    short: 'Technologia i środowisko',
    goal: 'Zobacz, ile prądu zjadają twoje urządzenia i co możesz z tym zrobić.',
    description:
      'Wpływ technologii na środowisko dla klasy 4: zużycie energii przez urządzenia i usługi cyfrowe oraz praktyczne zasady jej oszczędzania.',
    duration: '25–30 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Medale olimpijskie z Tokio zrobiono ze starych telefonów',
      text: 'Przez dwa lata mieszkańcy Japonii oddawali do żółtych skrzynek na pocztach i w sklepach zużytą elektronikę: telefony, aparaty, laptopy. Zebrało się prawie 79 tysięcy ton, w tym ponad 6 milionów telefonów. Odzyskano z nich 32 kilogramy złota, 3500 kilogramów srebra i 2200 kilogramów brązu — i z tego odlano około 5000 medali igrzysk Tokio 2020. Każdy medal, który zawisł na szyi mistrza, był kiedyś czyimś elektrośmieciem.',
      sourceLabel: 'Komitet Organizacyjny Igrzysk Tokio 2020, „Tokyo 2020 Medal Project” (2017–2019)',
    },
  },
  {
    moduleSlug: 'technologia-i-projekt',
    slug: 'wspolpraca-w-chmurze',
    kind: 'lekcja',
    number: 2,
    title: 'Współpraca w narzędziach cyfrowych',
    short: 'Współpraca w chmurze',
    goal: 'Popracuj nad jednym dokumentem z kimś innym i nie pogub zmian.',
    description:
      'Współpraca w chmurze dla klasy 4: wspólny dokument, podział zadań, komentarze i zasady pracy zespołowej w narzędziach cyfrowych.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Ta sama encyklopedia, milion autorów naraz',
      text: 'Wikipedia to jeden z największych wspólnych dokumentów świata — każdą z jej ponad 60 milionów stron może edytować każdy, a wszystkie zmiany trafiają do jednej, wspólnej wersji widocznej dla wszystkich. Żeby dwie osoby nie nadepnęły sobie na te same zdania, strona zapisuje całą historię zmian: widać, kto co dodał, kto co poprawił i w jakiej kolejności — dokładnie tak, jak w dokumencie z tej lekcji.',
      sourceLabel: 'Fundacja Wikimedia, statystyki Wikipedii (stan na 2026 rok)',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Wikipedia:Statystyka',
    },
  },
  {
    moduleSlug: 'technologia-i-projekt',
    slug: 'projekt-roczny',
    kind: 'lekcja',
    number: 3,
    title: 'Projekt roczny — własny quiz albo gra',
    short: 'Projekt roczny',
    goal: 'Zbuduj własny program, daj go komuś do przetestowania i popraw po uwagach.',
    description:
      'Projekt roczny z informatyki dla klasy 4: własny quiz lub gra zbudowane na stronie — od pomysłu, przez budowę i testy u innych osób, po poprawki.',
    duration: '40–50 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Twórca Scratcha chciał, żeby dzieci projektowały, a nie tylko klikały',
      text: 'Mitchel Resnick z MIT Media Lab zbudował Scratcha w 2007 roku na jednej zasadzie zapożyczonej z przedszkolnych klocków: dziecko uczy się najwięcej, gdy samo projektuje coś swojego, pokazuje to innym i poprawia po ich reakcji — nie gdy tylko wykonuje gotowe ćwiczenia. Dlatego Scratch od początku miał przycisk „udostępnij”, a nie tylko „zapisz”. Dziś w bibliotece projektów Scratcha są dziesiątki milionów prac dzieci z całego świata — każda zaczęła się dokładnie tak jak Twoja: od pustej karty projektu.',
      sourceLabel: 'Mitchel Resnick, MIT Media Lab — „Lifelong Kindergarten” (2017) i projekt Scratch (2007)',
    },
  },

  // ─── MODUŁ 9 — Podsumowanie roku ─────────────────────────────────────────
  {
    moduleSlug: 'podsumowanie',
    slug: 'powtorzenie-przekrojowe',
    kind: 'lekcja',
    number: 1,
    title: 'Powtórzenie przekrojowe — cały rok w jednym miejscu',
    short: 'Powtórzenie przekrojowe',
    goal: 'Przejdź przez wszystkie moduły i sprawdź, co zostało w głowie.',
    description:
      'Powtórzenie całego kursu informatyki klasy 4: urządzenia i pliki, internet i bezpieczeństwo, grafika, tekst, myślenie komputacyjne, Scratch oraz dane i AI — w mikro-grach, nićmi łączącymi działy i na wspólnym plakacie.',
    duration: '30–35 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Sprawdzanie siebie uczy lepiej niż czytanie tego samego jeszcze raz',
      text: 'W 2006 roku psychologowie Henry Roediger i Jeffrey Karpicke porównali dwie grupy studentów. Jedni czytali fragment tekstu kilka razy, drudzy czytali go raz, a potem kilkakrotnie próbowali przypomnieć sobie z niego jak najwięcej. Po tygodniu lepiej pamiętali ci drudzy — choć mieli mniej okazji, żeby ten tekst w ogóle zobaczyć. Dlatego powtórka w tej lekcji składa się z gier i zadań, a nie z kolejnego czytania.',
      sourceLabel: 'Henry L. Roediger, Jeffrey D. Karpicke, „Test-Enhanced Learning”, Psychological Science (2006)',
    },
  },
  {
    moduleSlug: 'podsumowanie',
    slug: 'test-koncowy',
    kind: 'podsumowanie',
    number: 2,
    title: 'Test końcowy i „Co dalej”',
    short: 'Test końcowy',
    goal: 'Sprawdź się na koniec roku i zobacz, co czeka cię w klasie 5.',
    description:
      'Test końcowy kursu informatyki dla klasy 4 wraz z zapowiedzią tematów klasy 5 — dłuższe projekty, arkusz kalkulacyjny i więcej algorytmiki. Dwanaście zadań do wykonania, zakład z samym sobą i most do klasy 5.',
    duration: '35–40 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Pierwszy program powstał, zanim był komputer',
      text: 'W 1843 roku Ada Lovelace opublikowała notatki do opisu Maszyny Analitycznej Charlesa Babbage’a — maszyny, która nigdy nie została zbudowana. W jednej z nich opisała krok po kroku, jak taka maszyna miałaby obliczyć ciąg liczb Bernoulliego. Dziś ten zapis uznaje się za jeden z pierwszych programów komputerowych. Pisała go, nie mając na czym uruchomić — więc musiała najpierw pomyśleć, a potem sprawdzić na papierze, czy to zadziała.',
      sourceLabel: 'Ada Lovelace, „Notes” do tłumaczenia artykułu L. F. Menabrei o Maszynie Analitycznej Babbage’a (1843)',
    },
  },
];

export const getModuleLessons = (moduleSlug: string): InfoLesson[] =>
  INFO_LESSONS.filter((lesson) => lesson.moduleSlug === moduleSlug).sort(
    (a, b) => a.number - b.number
  );

/** Wszystkie opublikowane lekcje w kolejności programu — najpierw moduł, potem numer w module. */
const orderedPublishedLessons = (): InfoLesson[] => {
  const moduleOrder = new Map(INFO_MODULES.map((m, i) => [m.slug, i]));
  return INFO_LESSONS.filter((lesson) => lesson.status === 'available').sort((a, b) => {
    const modA = moduleOrder.get(a.moduleSlug) ?? 0;
    const modB = moduleOrder.get(b.moduleSlug) ?? 0;
    return modA !== modB ? modA - modB : a.number - b.number;
  });
};

/**
 * Kolejna opublikowana lekcja po podanej — także z następnego modułu.
 * `getModuleLessons(modul).find(number > current)` zatrzymywało się na granicy
 * modułu, więc po ostatniej lekcji modułu bez `podsumowania` (np. „Start kursu")
 * kartka końcowa nie miała dokąd prowadzić.
 */
export const getNextLesson = (moduleSlug: string, slug: string): InfoLesson | undefined => {
  const ordered = orderedPublishedLessons();
  const index = ordered.findIndex(
    (lesson) => lesson.moduleSlug === moduleSlug && lesson.slug === slug
  );
  return index === -1 ? undefined : ordered[index + 1];
};

export const getLesson = (moduleSlug: string, slug: string): InfoLesson | undefined =>
  INFO_LESSONS.find((lesson) => lesson.moduleSlug === moduleSlug && lesson.slug === slug);

/** Lekcja obejmująca daną jednostkę tematyczną — do linkowania listy tematów modułu. */
export const getLessonForTopic = (moduleSlug: string, topicIndex: number): InfoLesson | undefined =>
  INFO_LESSONS.find(
    (lesson) => lesson.moduleSlug === moduleSlug && lesson.topics.includes(topicIndex)
  );

/** Lekcje z własną stroną — tego używa `generateStaticParams` i liczenie postępu. */
export const getPublishedLessons = (): InfoLesson[] =>
  INFO_LESSONS.filter((lesson) => lesson.status === 'available');

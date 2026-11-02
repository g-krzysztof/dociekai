/**
 * Rejestr lekcji online kursu historii klasy 4.
 *
 * Mapowanie jest 1:1 — jedna jednostka tematyczna z `HistModule.lessons` to
 * jedna lekcja online (jak w informatyce).
 *
 * Dodanie lekcji: przełącz `status` na `'available'`, dodaj komponent w
 * `components/lessons/<slug>/` i jedną linię w mapie `LESSON_COMPONENTS`
 * w `[modul]/[lekcja]/page.tsx`; moduł przełącz na `available` razem z jego
 * pierwszą lekcją.
 */

import { HIST_MODULES } from './curriculum';

export type LessonStatus = 'available' | 'soon';

/**
 * `lekcja`       — lekcja o kształcie podyktowanym tematem (paleta bloków).
 * `podsumowanie` — test końcowy (ostatnia pozycja modułu 9).
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

export interface HistLesson {
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
  /** Indeksy jednostek tematycznych z `HistModule.lessons`, które lekcja pokrywa. */
  topics: number[];
  status: LessonStatus;
  funFact?: LessonFunFact;
}

export const HIST_LESSONS: HistLesson[] = [
  // ─── start ───
  {
    moduleSlug: 'start',
    slug: 'pierwsza-lekcja-historii',
    kind: 'lekcja',
    number: 1,
    title: 'Pierwsza lekcja historii — przeszłość, opowieść i nauka o przeszłości',
    short: 'Co to jest historia?',
    goal: 'Dowiedz się, czym jest historia i jak odróżnić postać historyczną od legendarnej i baśniowej.',
    description:
      'Pierwsza lekcja kursu historii dla klasy 4: trzy znaczenia słowa „historia”, postacie historyczne, legendarne i baśniowe oraz to, po co w ogóle poznawać przeszłość.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Historia to „dociekanie”',
      text: 'Słowo „historia” przyszło do nas z greki, gdzie znaczyło „badanie, dociekanie”. Około 2500 lat temu grecki podróżnik Herodot zaczął swoją księgę od zdania, że przedstawia w niej to, czego się dowiedział, dociekając — i dlatego nazywa się go ojcem historii. Każdy historyk od tamtej pory robi to samo: dociera do śladów i sprawdza, skąd wie.',
      sourceLabel: 'Herodot, „Dzieje”, zdanie otwierające; Wikipedia — „Herodot”',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Herodot',
    },
  },

  // ─── warsztat-historyka ───
  {
    moduleSlug: 'warsztat-historyka',
    slug: 'zrodla-historyczne',
    kind: 'lekcja',
    number: 1,
    title: 'Ślady przeszłości — źródła historyczne i praca archeologa',
    short: 'Źródła historyczne',
    goal: 'Poznaj źródła pisane, niepisane i niematerialne i odkryj, jak pracuje archeolog.',
    description:
      'Źródła historyczne dla klasy 4: podział na pisane, niepisane i niematerialne, wykopaliska i moneta z jednym z najstarszych zapisów nazwy Polski.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Archeolog, który przekopywał śmietniki',
      text: 'Amerykański archeolog William Rathje uznał w 1973 roku, że współczesne śmieci też są źródłem — i zaczął badać zawartość koszy w mieście Tucson jak wykopalisko. Dopiero w latach 80. jego zespół zaczął też kopać na wysypiskach. Okazało się między innymi, że gazety sprzed trzydziestu, czterdziestu lat leżą tam czytelne jak w dniu wydania. To, co dziś wyrzucasz do kosza, za tysiąc lat opowie o tobie całą historię.',
      sourceLabel: 'Wikipedia — „Tucson Garbage Project”',
      sourceUrl: 'https://en.wikipedia.org/wiki/Tucson_Garbage_Project',
    },
  },
  {
    moduleSlug: 'warsztat-historyka',
    slug: 'wiarygodnosc-zrodla',
    kind: 'lekcja',
    number: 2,
    title: 'Czy źródło mówi prawdę? — kto, kiedy, po co; fakt a opinia',
    short: 'Wiarygodność źródła',
    goal: 'Naucz się sprawdzać, komu i dlaczego wierzyć: fakt, opinia i porównywanie źródeł.',
    description:
      'Wiarygodność źródła historycznego: fakt a opinia, kto, kiedy i po co napisał źródło oraz spór o bitwę na Psim Polu.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Pierwszy polski kronikarz nie ma imienia',
      text: 'Nikt nie wie, jak naprawdę nazywał się autor najstarszej kroniki Polski. Wszystkie jej rękopisy są bez podpisu. Imię „Gall” dopisał mu dopiero w XVI wieku historyk Marcin Kromer — na marginesie rękopisu zanotował, że kronikę napisał Gall, „jak sądzę, jakiś mnich”. Działo się to ponad 400 lat po śmierci kronikarza. Nawet imię Galla Anonima to więc przypuszczenie historyka, a nie pewny fakt.',
      sourceLabel: 'Wikipedia — „Gall Anonim”',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Gall_Anonim',
    },
  },
  {
    moduleSlug: 'warsztat-historyka',
    slug: 'przyczyny-i-skutki',
    kind: 'lekcja',
    number: 3,
    title: 'Dlaczego i co z tego wynikło — przyczyny i skutki',
    short: 'Przyczyny i skutki',
    goal: 'Zobacz, jak jedno wydarzenie prowadzi do następnego, i zbuduj schemat przyczynowo-skutkowy.',
    description:
      'Przyczyny i skutki w historii dla klasy 4: łańcuch zdarzeń, wynalezienie druku i schemat przyczynowo-skutkowy.',
    duration: '20 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Biblia Gutenberga leży w Pelplinie',
      text: 'Gutenberg wydrukował swoją Biblię w Moguncji w latach 1452–1455, prawdopodobnie w około 200 egzemplarzach. Do dziś przetrwało 49 — i jeden z nich jest w Polsce, w Muzeum Diecezjalnym w Pelplinie. Brakuje w nim ostatniej strony, ale ma coś cennego: rozmazaną farbę, po której widać, jak pracowali pierwsi drukarze.',
      sourceLabel: 'Wikipedia — „Biblia Gutenberga”',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Biblia_Gutenberga',
    },
  },
  {
    moduleSlug: 'warsztat-historyka',
    slug: 'historia-mojej-rodziny',
    kind: 'lekcja',
    number: 4,
    title: 'Historia mojej rodziny — pamiątki, pokolenia, drzewo genealogiczne',
    short: 'Historia mojej rodziny',
    goal: 'Dowiedz się, jak badać historię własnej rodziny: pamiątki, opowieści i drzewo genealogiczne.',
    description:
      'Historia rodziny dla klasy 4: pamiątki rodzinne, pokolenia, drzewo genealogiczne i przygotowanie wywiadu z kimś bliskim.',
    duration: '20–25 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Genealogia to po grecku „nauka o rodzie”',
      text: 'Słowo „genealogia” pochodzi od greckich słów genea — ród, pokolenie — i logos — słowo, nauka. Dosłownie to więc „nauka o pokoleniach”. Genealogowie zbierają dokładnie to, co ty dzisiaj: daty, relacje między ludźmi i ślady, które po nich zostały.',
      sourceLabel: 'Wikipedia — „Genealogia”',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Genealogia',
    },
  },

  // ─── czas-i-miejsce ───
  {
    moduleSlug: 'czas-i-miejsce',
    slug: 'os-czasu-i-epoki',
    kind: 'lekcja',
    number: 1,
    title: 'Oś czasu i epoki historyczne',
    short: 'Oś czasu i epoki',
    goal: 'Ułóż wydarzenia na osi czasu i poznaj cztery epoki historyczne.',
    description:
      'Oś czasu i epoki historyczne dla klasy 4: porządek chronologiczny, prehistoria, starożytność, średniowiecze, nowożytność i współczesność.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Chronologia to po grecku „nauka o czasie”',
      text: 'Słowo „chronologia” złożono z dwóch greckich słów: chronos — czas, i logos — słowo, nauka. Chronologia porządkuje wydarzenia w czasie: ustala, co było wcześniej, co później i ile lat dzieli jedno od drugiego. Każda oś czasu to mała chronologia.',
      sourceLabel: 'Wikipedia — „Chronologia”',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Chronologia',
    },
  },
  {
    moduleSlug: 'czas-i-miejsce',
    slug: 'wieki-i-tysiaclecia',
    kind: 'lekcja',
    number: 2,
    title: 'W którym to wieku? — wiek, stulecie, tysiąclecie',
    short: 'Wieki i tysiąclecia',
    goal: 'Naucz się ustalać, w którym wieku wydarzyło się coś przed naszą erą i naszej ery.',
    description:
      'Wieki i tysiąclecia dla klasy 4: jak ustalić wiek wydarzenia, dlaczego wiek zaczyna się w roku z końcówką 01 i jak liczyć wieki przed naszą erą.',
    duration: '20 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Obserwatorium, które liczyło dokładnie',
      text: 'Gdy zbliżał się rok 2000, cały świat szykował się na „wielkie powitanie trzeciego tysiąclecia”. Ale Królewskie Obserwatorium w Greenwich pod Londynem — to samo, od którego liczy się długość geograficzną — przypominało, że skoro naszą erę liczy się od roku 1, a nie od zera, to trzecie tysiąclecie zaczyna się dopiero 1 stycznia 2001 roku. Większość ludzi i tak świętowała w Sylwestra 1999 — dla oka „2000” wyglądało jak nowy początek.',
      sourceLabel: 'Wikipedia — „Millennium” (spór o początek tysiąclecia)',
      sourceUrl: 'https://en.wikipedia.org/wiki/Millennium',
    },
  },
  {
    moduleSlug: 'czas-i-miejsce',
    slug: 'obliczanie-czasu',
    kind: 'lekcja',
    number: 3,
    title: 'Ile lat minęło? — obliczanie czasu i dawne kalendarze',
    short: 'Obliczanie czasu',
    goal: 'Oblicz, ile lat minęło między wydarzeniami, także z dwóch różnych er.',
    description:
      'Obliczanie upływu czasu w historii dla klasy 4: daty naszej ery i przed naszą erą, brak roku zerowego oraz jak dawniej mierzono czas.',
    duration: '20–25 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Rewolucja październikowa w listopadzie',
      text: 'Rosja przeszła na kalendarz gregoriański dopiero w 1918 roku — ponad trzysta lat po Polsce, która zrobiła to od razu, w 1582 roku. Dlatego wydarzenie, które Rosjanie nazywali „rewolucją październikową”, według naszego kalendarza wybuchło 7 listopada 1917 roku. W starym kalendarzu juliańskim był wtedy dopiero 25 października — różnica urosła już do 13 dni.',
      sourceLabel: 'Wikipedia — „Rewolucja październikowa”',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Rewolucja_pa%C5%BAdziernikowa',
    },
  },
  {
    moduleSlug: 'czas-i-miejsce',
    slug: 'mapa-i-plan',
    kind: 'lekcja',
    number: 4,
    title: 'Mapa i plan historyczny — tytuł, legenda, podziałka',
    short: 'Mapa i plan',
    goal: 'Naucz się czytać mapę historyczną i plan za pomocą legendy i podziałki.',
    description:
      'Mapa historyczna i plan dla klasy 4: tytuł, legenda, podziałka, strony świata i plan bitwy pod Grunwaldem.',
    duration: '20–25 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Najstarsza mapa Polski leżała w okładkach książek',
      text: 'Pierwszą mapę ziem polskich narysował Bernard Wapowski i wydrukowano ją w Krakowie w 1526 roku. Jej fragmenty odnaleziono dopiero w 1932 roku — wklejone w oprawy starych ksiąg w warszawskim archiwum. W 1944 roku zniszczyła je wojna.',
      sourceLabel: 'Wikipedia — „Bernard Wapowski”',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Bernard_Wapowski',
    },
  },

  // ─── mala-i-duza-ojczyzna ───
  {
    moduleSlug: 'mala-i-duza-ojczyzna',
    slug: 'symbole-narodowe',
    kind: 'lekcja',
    number: 1,
    title: 'Godło, barwy, hymn — symbole narodowe',
    short: 'Symbole narodowe',
    goal: 'Poznaj polskie symbole narodowe, ich historię i zasady ich szanowania.',
    description:
      'Symbole narodowe Polski dla klasy 4: godło i jego historia, barwy narodowe, hymn „Mazurek Dąbrowskiego” i zasady szacunku dla symboli.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: '„Jeszcze Polska nie umarła”',
      text: 'Pierwszy tekst hymnu, zapisany przez Józefa Wybickiego w 1797 roku, zaczynał się od słów „Jeszcze Polska nie umarła” — „nie zginęła” śpiewamy dopiero później.',
      sourceLabel: 'Muzeum Hymnu Narodowego w Będominie (oddział Muzeum Narodowego w Gdańsku)',
    },
  },
  {
    moduleSlug: 'mala-i-duza-ojczyzna',
    slug: 'swieta-i-wspolnoty',
    kind: 'lekcja',
    number: 2,
    title: 'Wspólnoty i święta państwowe; symbole Unii Europejskiej',
    short: 'Wspólnoty i święta',
    goal: 'Dowiedz się, czym są wspólnota państwowa i naród i dlaczego obchodzimy święta państwowe.',
    description:
      'Wspólnota państwowa i narodowa, Polonia, święta państwowe (11 listopada, 3 maja, 15 sierpnia) oraz flaga i hymn Unii Europejskiej — lekcja dla klasy 4.',
    duration: '30–35 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Święto, które obchodzono tylko dwa razy',
      text: '11 listopada został świętem państwowym dopiero w 1937 roku — prawie dwadzieścia lat po odzyskaniu niepodległości. Przed wojną obchodzono go jako oficjalne święto tylko dwa razy: w 1937 i 1938 roku. W 1945 roku nowe władze je zniosły, a ludzie, którzy chcieli pamiętać, robili to po cichu. Święto wróciło dopiero w 1989 roku.',
      sourceLabel:
        'Ustawa z 23 kwietnia 1937 r. o Święcie Niepodległości; ustawa z 15 lutego 1989 r. o przywróceniu Narodowego Święta Niepodległości; prawo.pl, „11 listopada – Święto Niepodległości”',
      sourceUrl:
        'https://www.prawo.pl/samorzad/11-listopada-8211-swieto-niepodleglosci,78545.html',
    },
  },
  {
    moduleSlug: 'mala-i-duza-ojczyzna',
    slug: 'regiony-i-mala-ojczyzna',
    kind: 'lekcja',
    number: 3,
    title: 'Dlaczego regiony się różnią — mała ojczyzna, gwary, stroje, tradycje',
    short: 'Regiony i mała ojczyzna',
    goal: 'Odkryj, dlaczego regiony Polski się różnią, i znajdź swój region na mapie.',
    description:
      'Regiony Polski i mała ojczyzna dla klasy 4: gwary, stroje ludowe, tradycje regionalne i to, skąd biorą się różnice między regionami.',
    duration: '20–25 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Ostatni tur świata',
      text: 'Kudłaty turoń, z którym chodzą kolędnicy, wziął imię od tura — wielkiego dzikiego byka z dawnych puszcz. Ostatni tur na całym świecie padł w 1627 roku w Puszczy Jaktorowskiej pod Warszawą. Zwierzęcia już nie ma, a jego imię chodzi po kolędzie do dziś.',
      sourceLabel: 'Wikipedia — „Tur”',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Tur',
    },
  },
  {
    moduleSlug: 'mala-i-duza-ojczyzna',
    slug: 'slady-historii-w-okolicy',
    kind: 'lekcja',
    number: 4,
    title: 'Jak czytać swoją okolicę — ślady historii, bohaterowie, zabytki',
    short: 'Ślady historii w okolicy',
    goal: 'Naucz się odczytywać historię miejscowości z nazw ulic, pomników i zabytków.',
    description:
      'Historia okolicy dla klasy 4: nazwy ulic, rynek, pomniki i tablice, bohaterowie regionalni oraz dlaczego chronimy zabytki.',
    duration: '20–25 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Kolumna, która stała się wzorem',
      text: 'Po wielkiej zarazie z 1679 roku mieszkańcy Wiednia postawili na ulicy Graben kamienną kolumnę z podziękowaniem za jej ustanie — ukończono ją w 1693 roku. Stoi do dziś, a w miastach Europy Środkowej, także w Polsce, wyrosły setki podobnych kolumn i figur „morowych”. Jeśli na rynku twojej miejscowości stoi kolumna z datą, sprawdź, czy nie jest jedną z nich.',
      sourceLabel: 'Wikipedia — „Kolumna Morowa w Wiedniu”',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Kolumna_Morowa_w_Wiedniu',
    },
  },
  {
    moduleSlug: 'mala-i-duza-ojczyzna',
    slug: 'legendy-prawda-i-fikcja',
    kind: 'lekcja',
    number: 5,
    title: 'Co w legendzie jest prawdą?',
    short: 'Legendy: prawda i fikcja',
    goal: 'Naucz się oddzielać w legendzie to, co da się sprawdzić, od tego, co zmyślone.',
    description:
      'Legendy w historii dla klasy 4: elementy prawdziwe i zmyślone, skąd biorą się legendy i jak je sprawdzać.',
    duration: '20–25 min',
    topics: [4],
    status: 'available',
    funFact: {
      title: 'Szewc przyszedł później',
      text: 'Najstarszą znaną wersję legendy o smoku spisał ok. 1200 roku kronikarz Wincenty Kadłubek — u niego smoka pokonują synowie Kraka, podrzucając mu bydło wypchane siarką. Szewc Skuba pojawia się dopiero w kronice Marcina Bielskiego, prawie czterysta lat później. Legenda, którą znasz, przez wieki rosła i zmieniała bohaterów.',
      sourceLabel: 'Wikipedia — „Smok wawelski”',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Smok_wawelski',
    },
  },

  // ─── poczatki-cywilizacji ───
  {
    moduleSlug: 'poczatki-cywilizacji',
    slug: 'pierwsi-ludzie',
    kind: 'lekcja',
    number: 1,
    title: 'Koczownicy — ogień, polowanie, wędrówki',
    short: 'Pierwsi ludzie',
    goal: 'Zobacz, jak żyli pierwsi ludzie i dlaczego wciąż wędrowali.',
    description:
      'Pierwsi ludzie dla klasy 4: koczowniczy tryb życia, ogień, polowanie i zbieractwo oraz wędrówki ludzi po świecie.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Milion lat przy ogniu',
      text: 'Najstarsze pewne ślady ognia rozpalanego przez przodków człowieka znaleziono w jaskini Wonderwerk w Afryce Południowej: spalone kości i popiół z roślin sprzed około miliona lat. To dużo dawniej, niż żyje na Ziemi człowiek rozumny — ogień ludzie dostali w spadku po przodkach.',
      sourceLabel: 'Wikipedia — „Control of fire by early humans”',
      sourceUrl: 'https://en.wikipedia.org/wiki/Control_of_fire_by_early_humans',
    },
  },
  {
    moduleSlug: 'poczatki-cywilizacji',
    slug: 'rewolucja-neolityczna',
    kind: 'lekcja',
    number: 2,
    title: 'Od zbieracza do rolnika — rewolucja neolityczna',
    short: 'Rewolucja neolityczna',
    goal: 'Przeżyj przejście od koczownictwa do rolnictwa i zobacz, co z niego wyrosło.',
    description:
      'Rewolucja neolityczna dla klasy 4: osiadły tryb życia, rolnictwo i hodowla, Żyzny Półksiężyc i pierwsze miasta.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Kot przyszedł sam',
      text: 'Na Cyprze archeolodzy znaleźli grób sprzed około 9500 lat, w którym obok człowieka pochowano kota. Koty nie żyły dziko na Cyprze — ktoś musiał je przywieźć łodzią. To najstarszy znany ślad przyjaźni ludzi z kotami, a zaczęła się ona przy spichlerzach pierwszych rolników.',
      sourceLabel: 'Wikipedia — „Cat”',
      sourceUrl: 'https://en.wikipedia.org/wiki/Cat#Domestication',
    },
  },
  {
    moduleSlug: 'poczatki-cywilizacji',
    slug: 'mezopotamia',
    kind: 'lekcja',
    number: 3,
    title: 'Pierwsze miasta — Mezopotamia',
    short: 'Mezopotamia',
    goal: 'Poznaj pierwsze miasta-państwa, wynalazki Sumerów i kodeks Hammurabiego.',
    description:
      'Mezopotamia dla klasy 4: kanały nawadniające, miasta-państwa Sumerów, ich wynalazki i kodeks Hammurabiego.',
    duration: '20–25 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Najstarsza reklamacja świata',
      text: 'W British Museum leży gliniana tabliczka sprzed prawie 3800 lat z miasta Ur. Klient o imieniu Nanni skarży się w niej kupcowi Ea-nasirowi, że dostał miedź złej jakości i że potraktowano go niegrzecznie. To jedna z najstarszych znanych skarg klienta — pismo służyło nie tylko królom, ale i zwykłym sprawom.',
      sourceLabel: 'Wikipedia — „Complaint tablet to Ea-nasir”',
      sourceUrl: 'https://en.wikipedia.org/wiki/Complaint_tablet_to_Ea-nasir',
    },
  },
  {
    moduleSlug: 'poczatki-cywilizacji',
    slug: 'od-pisma-do-alfabetu',
    kind: 'lekcja',
    number: 4,
    title: 'Po co ludziom pismo — od piktogramu do alfabetu',
    short: 'Od pisma do alfabetu',
    goal: 'Odkryj, po co ludziom było pismo i jak z obrazków powstał alfabet.',
    description:
      'Historia pisma dla klasy 4: pismo obrazkowe, klinowe i alfabetyczne, Fenicjanie, Grecy i Rzymianie oraz znaczenie pisma dziś.',
    duration: '20–25 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Najstarsze znane imię to imię księgowego',
      text: 'Na glinianej tabliczce z miasta Uruk, sprzed ponad 5000 lat, zapisano ilość jęczmienia i — obok liczby — znaki, które badacze odczytują jako Kuszim. Prawdopodobnie był to urzędnik, który pilnował magazynu. To jedno z najstarszych imion ludzkich, jakie znamy z pisma: pierwszym „bohaterem” historii nie był król, tylko ktoś, kto liczył worki.',
      sourceLabel: 'Wikipedia — „Kushim (Uruk period)”',
      sourceUrl: 'https://en.wikipedia.org/wiki/Kushim_(Uruk_period)',
    },
  },

  // ─── starozytny-egipt ───
  {
    moduleSlug: 'starozytny-egipt',
    slug: 'egipt-dar-nilu',
    kind: 'lekcja',
    number: 1,
    title: 'Egipt darem Nilu — rok nad rzeką i społeczeństwo',
    short: 'Egipt darem Nilu',
    goal: 'Zobacz, jak Nil rządził życiem Egipcjan i jak wyglądało ich społeczeństwo.',
    description:
      'Starożytny Egipt dla klasy 4: wylewy Nilu, Dolny i Górny Egipt, faraon i grupy społeczne.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Dar rzeki',
      text: 'Grecki podróżnik Herodot, który odwiedził Egipt około 450 roku p.n.e., zapisał, że kraj, do którego przypływają statki, jest „darem rzeki” — ziemią przyniesioną przez Nil. Miał rację dosłownie: czarny muł z wylewów co roku podnosił pola o cienką warstwę, a Egipcjanie nazywali swój kraj Kemet — „Czarna Ziemia”.',
      sourceLabel: 'Herodot, Dzieje, ks. II, rozdz. 5 (omówienie)',
    },
  },
  {
    moduleSlug: 'starozytny-egipt',
    slug: 'bogowie-mumie-piramidy',
    kind: 'lekcja',
    number: 2,
    title: 'Bogowie, mumie, piramidy',
    short: 'Bogowie, mumie, piramidy',
    goal: 'Poznaj wierzenia Egipcjan i dowiedz się, jak budowano piramidy.',
    description:
      'Religia starożytnego Egiptu dla klasy 4: politeizm, życie pozagrobowe, mumie, piramidy w Gizie i Dolina Królów.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Woda pod saniami',
      text: 'Na malowidle w grobowcu Dżehutihotepa (ok. 1900 r. p.n.e.) 172 ludzi ciągnie na saniach ogromny posąg, a jeden człowiek stoi z przodu i leje wodę na piasek. Długo sądzono, że to tylko obrzęd. W 2014 roku fizycy z Amsterdamu sprawdzili to na modelu: piasek zwilżony w sam raz jest sztywniejszy i sanie potrzebują o połowę mniejszej siły. Za dużo wody — i znowu grzęzną.',
      sourceLabel: 'A. Fall i in., Physical Review Letters 112, 2014 (omówienie)',
    },
  },
  {
    moduleSlug: 'starozytny-egipt',
    slug: 'osiagniecia-egipcjan',
    kind: 'lekcja',
    number: 3,
    title: 'Co zawdzięczamy Egipcjanom',
    short: 'Osiągnięcia Egipcjan',
    goal: 'Odkryj osiągnięcia Egipcjan — od hieroglifów po kalendarz i medycynę.',
    description:
      'Osiągnięcia starożytnego Egiptu dla klasy 4: hieroglify i ich odczytanie, kalendarz, mierzenie pól, medycyna i wpływ na Europę.',
    duration: '20–25 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Papier z trzciny',
      text: 'Słowo „papier” ma w sobie egipską trzcinę. Grecy nazywali ją „papyros” — od niej wzięła się łacińska „papyrus”, a stąd nasz „papier”, angielski „paper” i niemiecki „Papier”. Prawdziwy papier wymyślili jednak Chińczycy, prawie 3000 lat po pierwszych papirusach: nazwa przeszła ze starej rzeczy na nową.',
      sourceLabel: 'Wikipedia — „Papirus”',
      sourceUrl: 'https://pl.wikipedia.org/wiki/Papirus',
    },
  },

  // ─── starozytna-grecja ───
  {
    moduleSlug: 'starozytna-grecja',
    slug: 'grecja-gory-i-morze',
    kind: 'lekcja',
    number: 1,
    title: 'Kraina gór i morza — polis i greckie kolonie',
    short: 'Grecja: góry i morze',
    goal: 'Zobacz, jak góry i morze ukształtowały Greków i gdzie dotarła ich cywilizacja.',
    description:
      'Starożytna Grecja dla klasy 4: warunki naturalne, polis, greckie kolonie i zasięg cywilizacji greckiej na mapie dzisiejszego świata.',
    duration: '20–25 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Żaby wokół stawu',
      text: 'Grecki filozof Platon napisał, że Grecy mieszkają wokół morza „jak mrówki albo żaby wokół stawu”. Miał na myśli całe Morze Śródziemne: greckie miasta siedziały na jego brzegach, od dzisiejszej Hiszpanii po Krym — i prawie wszystkie leżały nad wodą.',
      sourceLabel: 'Platon, Fedon 109b (omówienie)',
    },
  },
  {
    moduleSlug: 'starozytna-grecja',
    slug: 'ateny-i-demokracja',
    kind: 'lekcja',
    number: 2,
    title: 'Ateny Peryklesa — demokracja, agora, Akropol',
    short: 'Ateny i demokracja',
    goal: 'Dowiedz się, jak działała demokracja ateńska i kto naprawdę mógł głosować.',
    description:
      'Demokracja ateńska dla klasy 4: obywatele i zgromadzenie ludowe, agora i Akropol w czasach Peryklesa oraz porównanie z demokracją dziś.',
    duration: '20–25 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Kartki przygotowane zawczasu',
      text: 'Ateńczycy mogli raz w roku wygnać z miasta polityka, pisząc jego imię na skorupie — to był ostracyzm. Na stoku Akropolu archeolodzy znaleźli 190 skorup z imieniem Temistoklesa, zapisanych zaledwie przez 14 różnych rąk. Ktoś przygotował je wcześniej, żeby rozdać głosującym. Oszustwo wyborcze ma więc ponad 2400 lat.',
      sourceLabel: 'O. Broneer, wykopaliska na stoku Akropolu, 1938 (omówienie)',
    },
  },
  {
    moduleSlug: 'starozytna-grecja',
    slug: 'bogowie-i-mity',
    kind: 'lekcja',
    number: 3,
    title: 'Olimp i mity',
    short: 'Bogowie i mity',
    goal: 'Poznaj greckich bogów i mity, które wciąż żyją w naszym języku.',
    description:
      'Mitologia grecka dla klasy 4: bogowie Olimpu, herosi, mity i wyrażenia z mitologii używane do dziś.',
    duration: '20–25 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Ścięgno z mitu',
      text: 'Najmocniejsze ścięgno ludzkiego ciała, to nad piętą, nazywa się ścięgnem Achillesa. Nazwę nadał mu w 1693 roku flamandzki lekarz Philip Verheyen — ponad dwa tysiące lat po tym, jak Grecy zaczęli opowiadać o bohaterze trafionym strzałą w piętę. Lekarze mówią więc mitem do dziś.',
      sourceLabel: 'Ph. Verheyen, Corporis humani anatomia, 1693 (omówienie)',
    },
  },
  {
    moduleSlug: 'starozytna-grecja',
    slug: 'teatr-igrzyska-filozofia',
    kind: 'lekcja',
    number: 4,
    title: 'Teatr, igrzyska, filozofia',
    short: 'Teatr, igrzyska, filozofia',
    goal: 'Odkryj, co zostało nam po greckim teatrze, igrzyskach i filozofii.',
    description:
      'Dziedzictwo Grecji dla klasy 4: teatr, tragedia i komedia, igrzyska olimpijskie dawniej i dziś oraz filozofia Sokratesa.',
    duration: '25 min',
    topics: [3],
    status: 'available',
    funFact: {
      title: 'Nagroda: oliwa',
      text: 'Na igrzyskach w Olimpii zwycięzca dostawał tylko wieniec z gałązek oliwnych. Ale w Atenach na igrzyskach panatenajskich nagrodą były amfory pełne oliwy ze świętych drzew Ateny — zwycięzca w wyścigu rydwanów mógł dostać ich nawet 140. To tyle oliwy, ile rodzina zużywała przez wiele lat.',
      sourceLabel: 'inskrypcja IG II² 2311, Ateny, IV w. p.n.e. (omówienie)',
    },
  },

  // ─── starozytny-rzym ───
  {
    moduleSlug: 'starozytny-rzym',
    slug: 'od-wioski-do-imperium',
    kind: 'lekcja',
    number: 1,
    title: 'Od wioski do imperium',
    short: 'Od wioski do imperium',
    goal: 'Zobacz, jak Rzym zmieniał ustroje i granice, aż stał się imperium.',
    description:
      'Starożytny Rzym dla klasy 4: legenda o założeniu, królestwo, republika i cesarstwo, podboje i największy zasięg imperium, legiony.',
    duration: '25 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'SPQR na włazach',
      text: 'Rzymianie podpisywali swoje państwo literami SPQR — Senatus Populusque Romanus, czyli „senat i lud rzymski”. Republika upadła ponad dwa tysiące lat temu, a miasto Rzym do dziś wybija te cztery litery na włazach do kanałów i miejskich budynkach.',
      sourceLabel: 'Roma Capitale, oznaczenia miejskie (omówienie)',
    },
  },
  {
    moduleSlug: 'starozytny-rzym',
    slug: 'rzym-czasow-cezara',
    kind: 'lekcja',
    number: 2,
    title: 'Jeden dzień, trzy życia — Rzym czasów Cezara',
    short: 'Rzym czasów Cezara',
    goal: 'Przeżyj dzień w Rzymie jako patrycjusz, plebejusz i niewolnik.',
    description:
      'Społeczeństwo starożytnego Rzymu dla klasy 4: obywatele i niewolnicy w czasach Juliusza Cezara oraz różne oceny Cezara w źródłach.',
    duration: '25 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Czterdzieści słoni z pochodniami',
      text: 'Po jednym z triumfów w 46 roku p.n.e. Cezar wchodził nocą na wzgórze Kapitol przy świetle pochodni. Nieśli je słonie — czterdzieści, po dwadzieścia z każdej strony drogi. Tak przynajmniej opisał to sto pięćdziesiąt lat później biograf Swetoniusz.',
      sourceLabel: 'Swetoniusz, „Boski Juliusz” 37 (omówienie)',
    },
  },
  {
    moduleSlug: 'starozytny-rzym',
    slug: 'dziedzictwo-rzymu',
    kind: 'lekcja',
    number: 3,
    title: 'Rzymianie budowali na zawsze — dziedzictwo Rzymu',
    short: 'Dziedzictwo Rzymu',
    goal: 'Odkryj akwedukty, drogi, prawo i łacinę — rzymskie dziedzictwo w dzisiejszym świecie.',
    description:
      'Dziedzictwo starożytnego Rzymu dla klasy 4: akwedukty, drogi, amfiteatr, łuk triumfalny, prawo rzymskie i łacina; gra historyczna z anachronizmami.',
    duration: '30 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Beton, który twardnieje w morzu',
      text: 'Rzymskie falochrony stoją w morzu od dwóch tysięcy lat — a dzisiejszy beton w słonej wodzie kruszeje po kilkudziesięciu. Badaczki odkryły dlaczego: Rzymianie mieszali wapno z popiołem wulkanicznym, a morska woda, wnikając w szczeliny, wytwarza w nim nowe kryształy, które je zaklejają. Rzymski beton z czasem robi się mocniejszy.',
      sourceLabel: 'M. Jackson i in., „American Mineralogist” 102, 2017 (omówienie)',
    },
  },

  // ─── narodziny-chrzescijanstwa ───
  {
    moduleSlug: 'narodziny-chrzescijanstwa',
    slug: 'judaizm-i-nauczanie-jezusa',
    kind: 'lekcja',
    number: 1,
    title: 'Z judaizmu do chrześcijaństwa',
    short: 'Judaizm i nauczanie Jezusa',
    goal: 'Dowiedz się, jak chrześcijaństwo wyrosło z judaizmu i czego nauczał Jezus.',
    description:
      'Narodziny chrześcijaństwa dla klasy 4: Palestyna w Cesarstwie Rzymskim, judaizm i monoteizm, Mesjasz, Dekalog i nauczanie Jezusa.',
    duration: '30 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Koza, która znalazła bibliotekę',
      text: 'W 1947 roku beduiński pasterz szukał zagubionej kozy w skałach nad Morzem Martwym. Wrzucił kamień do jaskini i usłyszał, jak coś się tłucze — gliniane dzbany. W środku leżały zwoje sprzed ponad dwóch tysięcy lat, a wśród nich najstarsze znane odpisy ksiąg Biblii hebrajskiej — o mniej więcej tysiąc lat starsze niż te, które znano wcześniej.',
      sourceLabel: 'Encyclopaedia Britannica, hasło „Dead Sea Scrolls” (omówienie)',
    },
  },
  {
    moduleSlug: 'narodziny-chrzescijanstwa',
    slug: 'od-katakumb-do-religii-panujacej',
    kind: 'lekcja',
    number: 2,
    title: 'Od katakumb do religii panującej',
    short: 'Od katakumb do religii panującej',
    goal: 'Prześledź drogę chrześcijaństwa od prześladowanych wspólnot do religii panującej w Rzymie.',
    description:
      'Rozwój chrześcijaństwa w Cesarstwie Rzymskim dla klasy 4: podróże apostołów, prześladowania, edykt mediolański 313 r. i wpływ na Europę.',
    duration: '30 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Kościół w zwykłym domu',
      text: 'Najstarsze znane miejsce spotkań chrześcijan odkopano w Dura Europos, rzymskim mieście nad Eufratem (dziś Syria). To zwykły dom, w którym około 240 roku połączono dwa pokoje w jedną salę i wymalowano ściany scenami z Biblii. Kilkanaście lat później, przed oblężeniem, obrońcy zasypali ziemią ulicę przy murach miasta, razem z tym domem — i dlatego przetrwał.',
      sourceLabel: 'Yale University Art Gallery, „Dura-Europos: Excavating Antiquity” (omówienie)',
    },
  },

  // ─── podsumowanie ───
  {
    moduleSlug: 'podsumowanie',
    slug: 'teczka-postaci',
    kind: 'lekcja',
    number: 1,
    title: 'Teczka postaci — źródła, ocena, wystawa',
    short: 'Teczka postaci',
    goal: 'Zbierz źródła o wybranej postaci ze starożytności i wystaw jej własną, uzasadnioną ocenę.',
    description:
      'Doświadczenie edukacyjne z historii dla klasy 4: praca ze źródłami o postaci ze starożytności, własna ocena z dowodami i wystawa.',
    duration: '30 min',
    topics: [0],
    status: 'available',
    funFact: {
      title: 'Twarz, którą chciano wymazać',
      text: 'Około 20 lat po śmierci Hatszepsut jej posągi rozbito, a imię wykuto z murów świątyń. Archeolodzy z Nowego Jorku w latach 20. XX wieku wydobyli tysiące odłamków z dołów przy jej świątyni — i skleili z nich kilkadziesiąt posągów. Jeden z nich możesz dziś zobaczyć w tej lekcji.',
      sourceLabel: 'The Metropolitan Museum of Art, „Hatshepsut: From Queen to Pharaoh” (omówienie)',
    },
  },
  {
    moduleSlug: 'podsumowanie',
    slug: 'wykopalisko-roku',
    kind: 'lekcja',
    number: 2,
    title: 'Wykopalisko roku — powtórzenie przekrojowe',
    short: 'Wykopalisko roku',
    goal: 'Powtórz cały rok warstwa po warstwie — od pradziejów po Rzym.',
    description:
      'Powtórzenie całego roku historii w klasie 4 jako wykopalisko: warstwa po warstwie, od pradziejów po chrześcijaństwo.',
    duration: '30 min',
    topics: [1],
    status: 'available',
    funFact: {
      title: 'Miasto na mieście',
      text: 'Pod wzgórzem Hisarlik w Turcji archeolodzy odkopali dziewięć miast zbudowanych jedno na drugim — w tym Troję, o której opowiadali Grecy. Najstarsze leży na samym dole i ma około 5000 lat. Każde nowe miasto stawiano na gruzach poprzedniego, więc wzgórze rosło przez tysiące lat.',
      sourceLabel: 'UNESCO World Heritage Centre, „Archaeological Site of Troy” (omówienie)',
    },
  },
  {
    moduleSlug: 'podsumowanie',
    slug: 'test-koncowy',
    kind: 'podsumowanie',
    number: 3,
    title: 'Test końcowy i most do klasy 5',
    short: 'Test końcowy',
    goal: 'Sprawdź, co zostało po roku historii, i zajrzyj do klasy 5.',
    description:
      'Test końcowy z historii dla klasy 4: czas, źródła, mapa i dziedzictwo starożytności oraz zapowiedź tematów klasy 5.',
    duration: '30 min',
    topics: [2],
    status: 'available',
    funFact: {
      title: 'Rok, którego nie było',
      text: 'Kiedy w VI wieku mnich Dionizy Mały układał rachubę lat od narodzin Jezusa, Europa nie znała jeszcze zera. Dlatego po roku 1 p.n.e. od razu następuje rok 1 n.e. — i dlatego, licząc lata między datami z dwóch er, trzeba odjąć jedynkę.',
      sourceLabel: 'Encyclopaedia Britannica, hasło „Dionysius Exiguus” (omówienie)',
    },
  },
];

export const getModuleLessons = (moduleSlug: string): HistLesson[] =>
  HIST_LESSONS.filter((lesson) => lesson.moduleSlug === moduleSlug).sort(
    (a, b) => a.number - b.number
  );

/** Wszystkie opublikowane lekcje w kolejności programu. */
const orderedPublishedLessons = (): HistLesson[] => {
  const moduleOrder = new Map(HIST_MODULES.map((m, i) => [m.slug, i]));
  return HIST_LESSONS.filter((lesson) => lesson.status === 'available').sort((a, b) => {
    const modA = moduleOrder.get(a.moduleSlug) ?? 0;
    const modB = moduleOrder.get(b.moduleSlug) ?? 0;
    return modA !== modB ? modA - modB : a.number - b.number;
  });
};

/** Kolejna opublikowana lekcja po podanej — także z następnego modułu. */
export const getNextLesson = (moduleSlug: string, slug: string): HistLesson | undefined => {
  const ordered = orderedPublishedLessons();
  const index = ordered.findIndex(
    (lesson) => lesson.moduleSlug === moduleSlug && lesson.slug === slug
  );
  return index === -1 ? undefined : ordered[index + 1];
};

export const getLesson = (moduleSlug: string, slug: string): HistLesson | undefined =>
  HIST_LESSONS.find((lesson) => lesson.moduleSlug === moduleSlug && lesson.slug === slug);

/** Lekcja obejmująca daną jednostkę tematyczną — do linkowania listy tematów modułu. */
export const getLessonForTopic = (moduleSlug: string, topicIndex: number): HistLesson | undefined =>
  HIST_LESSONS.find(
    (lesson) => lesson.moduleSlug === moduleSlug && lesson.topics.includes(topicIndex)
  );

/** Lekcje z własną stroną — tego używa `generateStaticParams` i liczenie postępu. */
export const getPublishedLessons = (): HistLesson[] =>
  HIST_LESSONS.filter((lesson) => lesson.status === 'available');

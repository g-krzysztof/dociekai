/**
 * Czysta treść zadania praktycznego lekcji o historii komputera — obchodu
 * mieszkania. Widżet (`home-round.tsx`) tylko to rysuje.
 *
 * Poprzednia wersja kazała dziecku wyjść ze strony, napisać notatkę w Notatniku,
 * zapisać ją w folderze i wrócić z plikiem do sprawdzenia. Użytkownik odrzucił
 * ten model 2026-09-19: **nie wyrzucamy dziecka ze strony**, zapis i odnalezienie
 * pliku to dla dziesięciolatka osobna umiejętność, a tekst pisany własnymi
 * słowami i tak da się sprawdzić tylko po słowach kluczowych — czyli źle.
 *
 * Zadanie zostaje to samo co było w treści notatki („co ta maszyna robi sama,
 * a co przy niej decyduje człowiek”), tylko dowodem jest praca **w lekcji**:
 * dziecko wybiera trzy maszyny, które naprawdę ma u siebie, i rozstrzyga przy
 * każdej robocie, kto ją wykonuje. To są rozstrzygnięcia, nie opinie, więc da
 * się na nie odpowiedzieć co do jednego — dokładnie ta zaleta, którą miał plik,
 * bez żadnej z jego wad.
 *
 * Roboty każdej maszyny są ułożone tak samo: **trzy bierze maszyna, dwie
 * zostają przy człowieku**, a druga z nich jest zawsze decyzją, że coś ma się
 * w ogóle wydarzyć. Dzięki temu na końcu widać gołym okiem to, co jest tezą
 * całej lekcji — i widać, czego żadna maszyna nie przejęła.
 */

export type Doer = 'maszyna' | 'ty';

export interface Job {
  id: string;
  /** Robota widziana oczami dziecka — czynność, nie definicja. */
  text: string;
  by: Doer;
  /** Zdanie na wypadek pomyłki. Nigdy „źle”, zawsze dlaczego. */
  why: string;
}

export interface Machine {
  id: string;
  zone: ZoneId;
  name: string;
  /** Co po tej maszynie widać, że ma w środku komputer. */
  tell: string;
  jobs: Job[];
}

export type ZoneId = 'kuchnia' | 'salon' | 'pokoj' | 'przedpokoj';

export const ZONES: { id: ZoneId; name: string; note: string }[] = [
  { id: 'kuchnia', name: 'Kuchnia', note: 'najwięcej ukrytych komputerów w całym domu' },
  { id: 'salon', name: 'Salon', note: 'te, przy których siedzicie wieczorem' },
  { id: 'pokoj', name: 'Twój pokój', note: 'i to, co nosisz przy sobie' },
  { id: 'przedpokoj', name: 'Łazienka i przedpokój', note: 'maszyny, o których się nie myśli' },
];

/**
 * Maszyny, które dziecko ma szansę mieć u siebie — świadomie **bez komputera,
 * laptopa i telefonu**. Lekcja pyta o te, których nikt w domu komputerem nie
 * nazywa, więc wpisanie na listę czegoś, co komputerem się nazywa, popsułoby
 * całe pytanie.
 */
export const MACHINES: Machine[] = [
  {
    id: 'pralka',
    zone: 'przedpokoj',
    name: 'Pralka',
    tell: 'wyświetlacz i pokrętło z nazwami programów',
    jobs: [
      {
        id: 'woda',
        text: 'sama nabiera tyle wody, ile trzeba',
        by: 'maszyna',
        why: 'wody nie odmierza nikt z domowników — pralka ma w środku czujnik i sama zakręca dopływ, gdy jest jej dość.',
      },
      {
        id: 'temperatura',
        text: 'pilnuje, żeby woda miała 40 stopni, a nie 60',
        by: 'maszyna',
        why: 'temperatury nikt nie sprawdza palcem: pralka mierzy ją przez całe pranie i sama dogrzewa albo przestaje.',
      },
      {
        id: 'obroty',
        text: 'zmienia prędkość bębna w trakcie prania',
        by: 'maszyna',
        why: 'raz kręci wolno, raz wiruje — kolejność i tempo są zapisane w programie, który wykonuje bez ciebie.',
      },
      {
        id: 'wsyp',
        text: 'wkładasz pranie i wsypujesz proszek',
        by: 'ty',
        why: 'to robota dla rąk. Pralka nie otworzy sobie drzwiczek ani nie znajdzie brudnej koszulki na krześle.',
      },
      {
        id: 'decyzja',
        text: 'wybierasz program i mówisz „start”',
        by: 'ty',
        why: 'pralka umie wykonać każdy program, ale nie wie, co dziś pierzesz. Wybór jest twój — i to jest ta jedna robota, której żadna maszyna z tej lekcji nie przejęła.',
      },
    ],
  },
  {
    id: 'zmywarka',
    zone: 'kuchnia',
    name: 'Zmywarka',
    tell: 'przyciski programów i lampka „koniec”',
    jobs: [
      {
        id: 'plyn',
        text: 'sama odmierza płyn i wodę',
        by: 'maszyna',
        why: 'kostkę wkładasz ty, ale ile wody wlać i kiedy otworzyć przegródkę, rozstrzyga zmywarka.',
      },
      {
        id: 'grzanie',
        text: 'podgrzewa wodę do właściwej temperatury',
        by: 'maszyna',
        why: 'w zmywarce woda jest gorętsza niż z kranu — grzeje ją sama i sama pilnuje, kiedy przestać.',
      },
      {
        id: 'suszenie',
        text: 'przełącza mycie na suszenie w swoim momencie',
        by: 'maszyna',
        why: 'kolejność kroków jest zapisana w programie. Nikt nie stoi obok i nie mówi „teraz susz”.',
      },
      {
        id: 'ustaw',
        text: 'ustawiasz naczynia i zamykasz drzwiczki',
        by: 'ty',
        why: 'to robota dla rąk — i całkiem niełatwa, bo trzeba wiedzieć, co gdzie się zmieści.',
      },
      {
        id: 'decyzja',
        text: 'rozstrzygasz, czy jest już dość naczyń, żeby ją włączyć',
        by: 'ty',
        why: 'zmywarka nie wie, czy w zlewie zostało jeszcze pół obiadu. Ten wybór jest twój.',
      },
    ],
  },
  {
    id: 'mikrofalowka',
    zone: 'kuchnia',
    name: 'Kuchenka mikrofalowa',
    tell: 'klawiatura z cyframi i zegar',
    jobs: [
      {
        id: 'czas',
        text: 'odlicza czas co do sekundy',
        by: 'maszyna',
        why: 'nikt nie stoi z zegarkiem — kuchenka sama liczy i sama wie, ile zostało.',
      },
      {
        id: 'stop',
        text: 'wyłącza grzanie dokładnie wtedy, gdy czas minie',
        by: 'maszyna',
        why: 'to jest cała różnica między nią a garnkiem na gazie: garnek będzie grzał, dopóki ktoś nie zakręci.',
      },
      {
        id: 'talerz',
        text: 'kręci talerzem, żeby grzało równo',
        by: 'maszyna',
        why: 'talerz obraca się sam przez cały czas grzania — nie musisz obracać jedzenia w połowie.',
      },
      {
        id: 'wloz',
        text: 'wkładasz jedzenie i zamykasz drzwiczki',
        by: 'ty',
        why: 'kuchenka nie sięgnie do lodówki. Robota dla rąk zostaje po twojej stronie.',
      },
      {
        id: 'decyzja',
        text: 'wystukujesz, ile minut ma grzać',
        by: 'ty',
        why: 'kuchenka wykona każdą liczbę minut, którą wstukasz — ale to ty wiesz, że zupa potrzebuje dwóch, a nie dziesięciu.',
      },
    ],
  },
  {
    id: 'ekspres',
    zone: 'kuchnia',
    name: 'Ekspres do kawy',
    tell: 'ekranik z napisami i przyciski z rodzajami kawy',
    jobs: [
      {
        id: 'mlyn',
        text: 'miele ziarna i odmierza porcję',
        by: 'maszyna',
        why: 'ile gramów zmielić na jedną kawę, ma zapisane w środku — ty tylko wsypujesz ziarna do pojemnika.',
      },
      {
        id: 'cisnienie',
        text: 'pilnuje temperatury i ciśnienia wody',
        by: 'maszyna',
        why: 'to są dwie liczby mierzone przez cały czas parzenia. Człowiek nie ma jak ich sprawdzić.',
      },
      {
        id: 'plukanie',
        text: 'sam się przepłukuje po włączeniu',
        by: 'maszyna',
        why: 'robi to bez pytania, zawsze tak samo — bo ma to zapisane jako pierwszy krok po starcie.',
      },
      {
        id: 'nalej',
        text: 'dolewasz wody i podstawiasz kubek',
        by: 'ty',
        why: 'ekspres umie zawołać o wodę, ale nie umie jej sobie nalać.',
      },
      {
        id: 'decyzja',
        text: 'wybierasz, czy ma być mała czarna, czy duża z mlekiem',
        by: 'ty',
        why: 'każdy z tych przycisków to inny program. Który dziś — rozstrzyga człowiek, nie ekspres.',
      },
    ],
  },
  {
    id: 'telewizor',
    zone: 'salon',
    name: 'Telewizor',
    tell: 'menu na ekranie i aplikacje',
    jobs: [
      {
        id: 'obraz',
        text: 'składa obraz z milionów punktów, 50 razy na sekundę',
        by: 'maszyna',
        why: 'każdy z tych punktów trzeba policzyć osobno. To jest rachunek, którego nikt nie robiłby ręcznie.',
      },
      {
        id: 'lista',
        text: 'pamięta listę kanałów i to, na czym skończyłeś film',
        by: 'maszyna',
        why: 'pamiętanie to pierwsza robota, jaką maszyny przejęły od ludzi — jeszcze przed liczeniem.',
      },
      {
        id: 'aktualizacja',
        text: 'sam sprawdza w nocy, czy jest nowa wersja oprogramowania',
        by: 'maszyna',
        why: 'robi to bez pytania, kiedy nikt nie patrzy. Telewizor bez komputera w środku nie miałby czego aktualizować.',
      },
      {
        id: 'pilot',
        text: 'szukasz pilota pod poduszką',
        by: 'ty',
        why: 'niestety. Tej roboty nie przejęła jeszcze żadna maszyna na świecie.',
      },
      {
        id: 'decyzja',
        text: 'wybierasz, co oglądasz',
        by: 'ty',
        why: 'telewizor potrafi pokazać wszystko, ale nie wie, na co masz ochotę. Wybór jest twój.',
      },
    ],
  },
  {
    id: 'router',
    zone: 'salon',
    name: 'Router',
    tell: 'rząd migających lampek i antena',
    jobs: [
      {
        id: 'adresy',
        text: 'sam nadaje adres każdemu nowemu urządzeniu w domu',
        by: 'maszyna',
        why: 'żeby dane trafiały pod właściwy adres, ktoś musi je rozdać. Router robi to sam, w ułamku sekundy.',
      },
      {
        id: 'kierowanie',
        text: 'rozsyła dane do właściwego urządzenia',
        by: 'maszyna',
        why: 'film leci na telewizor, a wiadomość na telefon — i nie mylą się nawzajem, bo router pilnuje, co gdzie idzie.',
      },
      {
        id: 'pilnowanie',
        text: 'sprawdza hasło każdemu, kto chce się podłączyć',
        by: 'maszyna',
        why: 'sprawdzanie haseł to robota dla maszyny: robi to za każdym razem tak samo i nigdy się nie zamyśli.',
      },
      {
        id: 'kabel',
        text: 'wpinasz kabel i włączasz zasilanie',
        by: 'ty',
        why: 'router bez prądu jest pudełkiem. Rozstawienie sprzętu zostaje po stronie człowieka.',
      },
      {
        id: 'decyzja',
        text: 'rozstrzygasz, komu podajesz hasło do swojej sieci',
        by: 'ty',
        why: 'to decyzja, nie ustawienie. Router wpuści każdego, kto zna hasło — a kto ma je znać, rozstrzygasz ty.',
      },
    ],
  },
  {
    id: 'odkurzacz',
    zone: 'salon',
    name: 'Odkurzacz automatyczny',
    tell: 'jeździ sam i wraca do stacji',
    jobs: [
      {
        id: 'omijanie',
        text: 'omija nogi od stołu i próg',
        by: 'maszyna',
        why: 'ma czujniki dookoła i sam rozstrzyga, gdzie skręcić. Nikt go nie prowadzi.',
      },
      {
        id: 'mapa',
        text: 'pamięta, w których miejscach już był',
        by: 'maszyna',
        why: 'bez tej pamięci jeździłby w kółko po tym samym dywanie — to najważniejsza rzecz, jaką robi jego komputer.',
      },
      {
        id: 'stacja',
        text: 'wraca do ładowarki, gdy kończy mu się bateria',
        by: 'maszyna',
        why: 'sam mierzy, ile mu zostało prądu, i sam odnajduje drogę powrotną.',
      },
      {
        id: 'sprzataj',
        text: 'zbierasz z podłogi kable i skarpetki',
        by: 'ty',
        why: 'odkurzacz wciągnie sznurek od bluzy razem z kurzem. Przygotowanie pokoju to twoja robota.',
      },
      {
        id: 'decyzja',
        text: 'mówisz mu, w których pokojach ma dziś jeździć',
        by: 'ty',
        why: 'objedzie każdy pokój, który mu wskażesz — ale to ty wiesz, że w kuchni rozsypał się cukier.',
      },
    ],
  },
  {
    id: 'zegarek',
    zone: 'pokoj',
    name: 'Zegarek sportowy',
    tell: 'liczy kroki i pokazuje puls',
    jobs: [
      {
        id: 'kroki',
        text: 'zamienia ruch twojej ręki na liczbę kroków',
        by: 'maszyna',
        why: 'to czysty rachunek: z drgań czujnika trzeba wyliczyć, które z nich były krokiem. Robi go bez przerwy, cały dzień.',
      },
      {
        id: 'puls',
        text: 'mierzy puls co kilka sekund',
        by: 'maszyna',
        why: 'sam świeci w skórę i sam liczy, ile razy uderzyło serce. Nikt tego nie liczy na palcach.',
      },
      {
        id: 'przypomnienie',
        text: 'przypomina, że siedzisz od godziny bez ruchu',
        by: 'maszyna',
        why: 'żeby przypomnieć, trzeba było najpierw zapamiętać, kiedy ostatnio się ruszałeś — i sprawdzać zegar. Obie te roboty robi zegarek.',
      },
      {
        id: 'zaloz',
        text: 'zakładasz go na rękę i ładujesz',
        by: 'ty',
        why: 'zegarek zostawiony na biurku nie zmierzy nikomu pulsu.',
      },
      {
        id: 'decyzja',
        text: 'to ty rozstrzygasz, że idziesz pobiegać',
        by: 'ty',
        why: 'zegarek policzy każdy bieg, ale nie wyjdzie z domu zamiast ciebie. Decyzja jest po twojej stronie.',
      },
    ],
  },
  {
    id: 'drukarka',
    zone: 'pokoj',
    name: 'Drukarka',
    tell: 'ekranik, przyciski i światełko tuszu',
    jobs: [
      {
        id: 'kropki',
        text: 'zamienia plik na miliony kropek tuszu',
        by: 'maszyna',
        why: 'z liter w pliku musi wyliczyć, w których miejscach kartki postawić kropkę. To rachunek na miliony pozycji.',
      },
      {
        id: 'papier',
        text: 'pilnuje, żeby kartka szła prosto i pojedynczo',
        by: 'maszyna',
        why: 'ma czujnik, który wykrywa, że wciągnęły się dwie kartki naraz — i wtedy sama się zatrzymuje.',
      },
      {
        id: 'tusz',
        text: 'mówi, kiedy kończy się tusz',
        by: 'maszyna',
        why: 'żeby to powiedzieć, musi cały czas liczyć, ile go zużyła. Nikt nie zagląda do środka.',
      },
      {
        id: 'kartki',
        text: 'wkładasz kartki do podajnika',
        by: 'ty',
        why: 'papieru drukarka sobie nie dołoży. Robota dla rąk zostaje przy tobie.',
      },
      {
        id: 'decyzja',
        text: 'rozstrzygasz, co i ile razy wydrukować',
        by: 'ty',
        why: 'drukarka wydrukuje wszystko, co jej wyślesz — nawet sto razy to samo. Co warto wydrukować, wie tylko człowiek.',
      },
    ],
  },
  {
    id: 'domofon',
    zone: 'przedpokoj',
    name: 'Domofon',
    tell: 'klawiatura z cyframi przy furtce',
    jobs: [
      {
        id: 'numer',
        text: 'rozpoznaje, do którego mieszkania ktoś dzwoni',
        by: 'maszyna',
        why: 'z jednego kabla dochodzi sygnał do wszystkich mieszkań — to domofon rozstrzyga, u kogo ma zadzwonić.',
      },
      {
        id: 'kod',
        text: 'pamięta kod do furtki i sprawdza go cyfra po cyfrze',
        by: 'maszyna',
        why: 'pamiętanie i sprawdzanie to dwie roboty, które maszyny przejęły od ludzi najwcześniej.',
      },
      {
        id: 'zamek',
        text: 'otwiera zamek na te kilka sekund',
        by: 'maszyna',
        why: 'po otwarciu sam odlicza czas i sam zamyka. Nikt nie stoi z zegarkiem przy furtce.',
      },
      {
        id: 'sluchawka',
        text: 'podnosisz słuchawkę i pytasz „kto tam?”',
        by: 'ty',
        why: 'rozmowa jest ludzka. Domofon tylko przenosi głos.',
      },
      {
        id: 'decyzja',
        text: 'rozstrzygasz, czy wpuścić tego kogoś do domu',
        by: 'ty',
        why: 'to jest najważniejszy przycisk w całym domofonie — i jedyny, którego maszyna nie naciśnie za ciebie.',
      },
    ],
  },
];

export const machineById = (id: string): Machine =>
  MACHINES.find((machine) => machine.id === id)!;

/** Ile maszyn dziecko wybiera na obchodzie. Trzy — tak jak w poprzedniej wersji zadania. */
export const PICK_COUNT = 3;

/* ── Kolejność karteczek ──────────────────────────────────────────────────── */

export interface Chip {
  /** `maszyna:robota` — klucz karteczki w stanie widżetu. */
  id: string;
  machineId: string;
  job: Job;
}

/**
 * Karteczki trzech maszyn wymieszane w jedną kupkę. Mieszanie jest **zależne od
 * wyboru dziecka, a nie losowe**: ta sama trójka maszyn daje zawsze tę samą
 * kolejność, więc kupka nie przetasowuje się przy każdym renderze, a strona
 * wygląda tak samo po stronie serwera i klienta.
 *
 * Wymieszanie ma znaczenie merytoryczne: gdyby roboty stały maszynami, dziecko
 * odpowiadałoby rytmem („trzy do lewej, dwie do prawej”) zamiast czytać.
 */
export function shuffleChips(machineIds: string[]): Chip[] {
  const chips: Chip[] = machineIds.flatMap((machineId) =>
    machineById(machineId).jobs.map((job) => ({ id: `${machineId}:${job.id}`, machineId, job }))
  );

  /* Prosty generator z ziarnem z nazw maszyn — powtarzalny i bez zależności. */
  let seed = chips.reduce((acc, chip) => (acc * 31 + chip.id.charCodeAt(0)) % 100003, 7);
  const random = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };

  for (let i = chips.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [chips[i], chips[j]] = [chips[j], chips[i]];
  }
  return chips;
}

/* ── Protokół ─────────────────────────────────────────────────────────────── */

export interface MachineTally {
  machine: Machine;
  byMachine: number;
  byYou: number;
}

export function tally(machineIds: string[]): MachineTally[] {
  return machineIds.map((id) => {
    const machine = machineById(id);
    return {
      machine,
      byMachine: machine.jobs.filter((job) => job.by === 'maszyna').length,
      byYou: machine.jobs.filter((job) => job.by === 'ty').length,
    };
  });
}

/** Zdanie od siebie: liczy się kilka wyrazów, nie ich brzmienie. */
export function ownSentenceOk(text: string): boolean {
  return (text.match(/\p{L}{2,}/gu) ?? []).length >= 3;
}

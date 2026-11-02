/**
 * L1, blok 1 „Kartki pod drzwiami” — dane i czytnik kartek.
 *
 * Dziecko ma sprawę (intencję) i koszyk słów. Składa kartkę z kafelków, stawia
 * znak na końcu i wsuwa ją pod drzwi. Odbiorca **czyta, co jest na kartce**:
 * czynność wynika ze słów i znaku razem (`czytaj`), nie z jednego znaku ani z
 * domysłu autora. Każda reguła ma kafelek-dowód, który odbiorca podświetla —
 * dziecko widzi, które słowo zdecydowało.
 *
 * Zasada z uwagi autora kursu (2026-10-17): ton jest związany ze znaczeniem —
 * prośbę, przeprosiny i obietnicę robią **słowa**, a znak dopowiada, jak je
 * wypowiedzieć. Jedno słowo nie obsłuży wszystkich spraw.
 */

export type Odbiorca = 'zuzia' | 'tymek' | 'ola' | 'halina';
export type Znak = '.' | '!' | '?';

export interface OdbiorcaInfo {
  id: Odbiorca;
  name: string;
  /** Dopełniacz: „sprawa Zuzi”. */
  gen: string;
  /** „zrozumiała” / „zrozumiał”. */
  understood: string;
}

export const ODBIORCY: OdbiorcaInfo[] = [
  { id: 'zuzia', name: 'Zuzia', gen: 'Zuzi', understood: 'zrozumiała' },
  { id: 'tymek', name: 'Tymek', gen: 'Tymka', understood: 'zrozumiał' },
  { id: 'ola', name: 'Ola', gen: 'Oli', understood: 'zrozumiała' },
  { id: 'halina', name: 'pani Halina', gen: 'pani Haliny', understood: 'zrozumiała' },
];

export const odbiorca = (id: Odbiorca): OdbiorcaInfo => ODBIORCY.find((o) => o.id === id)!;

/**
 * Cecha kafelka — co te słowa robią w zdaniu:
 * - `rozkaz` — czasownik w trybie rozkazującym, który każe (stój, napraw mi);
 * - `prosba` — tryb rozkazujący, którym się prosi o pomoc dla siebie (pomóż mi);
 * - `prosze` — słowo „proszę”;
 * - `pytanie-ty` — pytanie do odbiorcy o to, czy coś zrobi (pomożesz mi, czy możesz);
 * - `przeprosiny` / `obietnica` — słowa, które same są czynnością (przepraszam, obiecuję);
 * - `zapowiedz` — co zrobię (oddam ci) — bez „może” to już obietnica;
 * - `moze` — słowo „może”, które odbiera pewność;
 * - `dawanie` — „to pani okulary” — podaję komuś jego rzecz;
 * - `docinek` — słowa, które ranią;
 * - `info` — zwykła informacja;
 * - `ostrzezenie` — słowa, które ostrzegają (uważaj, stój, kałuża) — ostrzeżeniem są dopiero z wykrzyknikiem.
 */
export type Cecha =
  | 'rozkaz'
  | 'prosba'
  | 'prosze'
  | 'pytanie-ty'
  | 'przeprosiny'
  | 'obietnica'
  | 'zapowiedz'
  | 'moze'
  | 'dawanie'
  | 'docinek'
  | 'info'
  | 'ostrzezenie';

/**
 * Miejsce na kartce. Kartka ma zawsze ten sam porządek: wstęp („proszę”,
 * „przepraszam”, „obiecuję”, „może”), główne słowa, dopełnienie („z rowerem”).
 * W każdym miejscu najwyżej jeden kafelek — nowy zastępuje stary.
 */
export type Miejsce = 'wstep' | 'glowne' | 'dopelnienie';
export const MIEJSCA: Miejsce[] = ['wstep', 'glowne', 'dopelnienie'];

export interface Kafelek {
  id: string;
  /** Tekst małą literą (wielką stawia `kartkaText`). */
  text: string;
  pos: Miejsce;
  cechy: Cecha[];
  /** Czy kafelek mówi, o jaką sprawę chodzi. */
  temat?: boolean;
  /** Dopełnia poprzedni kafelek — bez przecinka („przepraszam za hałas”). */
  attach?: boolean;
  /** Główne słowa, które mówią wszystko — dopełnienie jest wtedy zbędne. */
  pelna?: boolean;
}

/** Kafelki kartki w porządku miejsc. */
export function ulozone(card: Partial<Record<Miejsce, Kafelek | null>>): Kafelek[] {
  return MIEJSCA.map((m) => card[m]).filter((t): t is Kafelek => Boolean(t));
}

/** Czynność, którą odbiorca odczytał z kartki. */
export type Czynnosc =
  | 'prosba'
  | 'polecenie'
  | 'rozkaz'
  | 'pytanie'
  | 'stwierdzenie'
  | 'przeprosiny'
  | 'obietnica'
  | 'nie-obietnica'
  | 'dawanie'
  | 'ostrzezenie'
  | 'zranienie'
  | 'informacja'
  | 'niepewne'
  | 'bez-sprawy';

/** Nazwa czynności w dzienniku („zrozumiał jako …”). */
export const CZYNNOSC_NAME: Record<Czynnosc, string> = {
  prosba: 'prośba',
  polecenie: 'polecenie',
  rozkaz: 'rozkaz',
  pytanie: 'pytanie',
  stwierdzenie: 'stwierdzenie',
  przeprosiny: 'przeprosiny',
  obietnica: 'obietnica',
  'nie-obietnica': '„może”, nie obietnica',
  dawanie: 'podanie rzeczy',
  ostrzezenie: 'ostrzeżenie',
  zranienie: 'złośliwość',
  informacja: 'informacja',
  niepewne: 'nie wiadomo: przepraszasz czy pytasz?',
  'bez-sprawy': 'nie wiadomo, o co chodzi',
};

export interface Odczyt {
  czynnosc: Czynnosc;
  /** Kafelki, które zdecydowały (podświetla je odbiorca). */
  dowod: string[];
}

const has = (tiles: Kafelek[], c: Cecha) => tiles.filter((t) => t.cechy.includes(c)).map((t) => t.id);

/**
 * Czytnik kartki — reguły w kolejności, pierwsza pasująca wygrywa.
 * `wymagaTematu` — sprawa, w której kartka musi powiedzieć, o co chodzi.
 */
export function czytaj(tiles: Kafelek[], znak: Znak, wymagaTematu: boolean): Odczyt {
  const docinek = has(tiles, 'docinek');
  if (docinek.length) return { czynnosc: 'zranienie', dowod: docinek };
  // Sam wstęp („Proszę.”, „Obiecuję.”) — nie wiadomo, o co chodzi.
  if (tiles.every((t) => t.pos === 'wstep')) return { czynnosc: 'bez-sprawy', dowod: tiles.map((t) => t.id) };

  const temat = tiles.filter((t) => t.temat).map((t) => t.id);
  const moze = has(tiles, 'moze');

  const przeprosiny = has(tiles, 'przeprosiny');
  if (przeprosiny.length) {
    if (znak === '?') return { czynnosc: 'niepewne', dowod: [...przeprosiny, '?'] };
    if (wymagaTematu && !temat.length) return { czynnosc: 'bez-sprawy', dowod: przeprosiny };
    return { czynnosc: 'przeprosiny', dowod: przeprosiny };
  }

  // Bez głównych słów („Proszę z rowerem?”) kartka nie mówi, czego chcesz.
  if (!tiles.some((t) => t.pos === 'glowne')) return { czynnosc: 'bez-sprawy', dowod: tiles.map((t) => t.id) };

  const obietnica = has(tiles, 'obietnica');
  const zapowiedz = has(tiles, 'zapowiedz');
  if (obietnica.length || zapowiedz.length) {
    if (moze.length) return { czynnosc: 'nie-obietnica', dowod: moze };
    if (znak === '?') return { czynnosc: 'pytanie', dowod: [...zapowiedz, '?'] };
    if (!zapowiedz.length) return { czynnosc: 'bez-sprawy', dowod: obietnica };
    return { czynnosc: 'obietnica', dowod: obietnica.length ? obietnica : zapowiedz };
  }

  const dawanie = has(tiles, 'dawanie');
  if (dawanie.length && znak === '?') return { czynnosc: 'pytanie', dowod: ['?'] };
  if (dawanie.length) return { czynnosc: 'dawanie', dowod: [...has(tiles, 'prosze'), ...dawanie] };

  const pytanieTy = has(tiles, 'pytanie-ty');
  if (pytanieTy.length) {
    if (znak !== '?') return { czynnosc: 'stwierdzenie', dowod: [...pytanieTy, znak] };
    if (wymagaTematu && !temat.length) return { czynnosc: 'bez-sprawy', dowod: pytanieTy };
    return { czynnosc: 'prosba', dowod: [...pytanieTy, '?'] };
  }

  const prosba = has(tiles, 'prosba');
  if (prosba.length) {
    if (wymagaTematu && !temat.length) return { czynnosc: 'bez-sprawy', dowod: prosba };
    if (znak === '?') return { czynnosc: 'pytanie', dowod: [...prosba, '?'] };
    return { czynnosc: 'prosba', dowod: prosba };
  }

  // Ostrzeżenie z wykrzyknikiem wygrywa z rozkazem: „Stój!” wołane do kogoś, kto biegnie w kałużę, ostrzega.
  const ostrzezenie = has(tiles, 'ostrzezenie');
  if (ostrzezenie.length && znak === '!') return { czynnosc: 'ostrzezenie', dowod: [...ostrzezenie, '!'] };

  const rozkaz = has(tiles, 'rozkaz');
  if (rozkaz.length) {
    const prosze = has(tiles, 'prosze');
    if (wymagaTematu && !temat.length) return { czynnosc: 'bez-sprawy', dowod: rozkaz };
    // „Proszę, napraw mi rower?” — tryb rozkazujący z pytajnikiem nie jest ani prośbą, ani pytaniem.
    if (znak === '?') return { czynnosc: 'pytanie', dowod: [...rozkaz, '?'] };
    if (prosze.length) return { czynnosc: 'prosba', dowod: prosze };
    if (znak === '!') return { czynnosc: 'rozkaz', dowod: [...rozkaz, '!'] };
    return { czynnosc: 'polecenie', dowod: [...rozkaz, '.'] };
  }

  if (znak === '?') return { czynnosc: 'pytanie', dowod: ['?'] };
  return { czynnosc: 'informacja', dowod: tiles.map((t) => t.id) };
}

/**
 * Kartka jako zdanie: wielka litera na początku, przecinek między kafelkami
 * („Proszę, pomóż mi”, „Obiecuję, że oddam…” — po „obiecuję” z „że”), ale nigdy przed
 * dopełnieniem (`attach`: „Przepraszam za hałas”, „pomóż mi z rowerem”) ani po „może”.
 */
export function kartkaText(tiles: Kafelek[], znak: Znak | null): string {
  if (!tiles.length) return '';
  let out = '';
  tiles.forEach((t, i) => {
    if (i === 0) {
      out = t.text;
      return;
    }
    const prev = tiles[i - 1];
    const glued = t.attach || prev.cechy.includes('moze');
    // „Obiecuję, że oddam…” — po „obiecuję” zdanie podrzędne łączy „że”, nie sam przecinek.
    const ze = prev.cechy.includes('obietnica') && t.pos === 'glowne' && !t.cechy.includes('docinek');
    out += glued ? ` ${t.text}` : ze ? `, że ${t.text}` : `, ${t.text}`;
  });
  out = out[0].toLocaleUpperCase('pl') + out.slice(1);
  return znak ? out + znak : out;
}

export interface Reakcja {
  /** Co robi odbiorca (narrator). */
  act: string;
  /** Co mówi. */
  say: string;
}

export interface Sprawa {
  id: string;
  to: Odbiorca;
  /** Zlecenie dla dziecka — sytuacja i to, czego chcesz. */
  brief: string;
  /** Twoja intencja jednym słowem (dziennik po sprawie). */
  intencja: string;
  /** Czynności, które załatwiają sprawę. */
  cel: Czynnosc[];
  /** Dopowiedzenie po udanej kartce, gdy odczyt brzmi inaczej niż intencja. */
  okNote?: Partial<Record<Czynnosc, string>>;
  wymagaTematu: boolean;
  koszyk: Kafelek[];
  /** Reakcje adresata — stałe dla czynności. Brakująca → `INNA`. */
  reakcje: Partial<Record<Czynnosc, Reakcja>>;
}

/** Reakcja domyślna: odbiorca mówi, co zrozumiał, i że nie o to szło. */
export const INNA: Reakcja = { act: 'Drzwi uchylają się na chwilę.', say: 'Hm? Nie wiem, czego ode mnie chcesz.' };

/** Kartka trafiła pod drzwi kogoś, kogo sprawa nie dotyczy. */
export const NIE_DO_MNIE: Reakcja = { act: 'Drzwi uchylają się na chwilę.', say: 'To chyba nie do mnie.' };

export const SPRAWY: Sprawa[] = [
  {
    id: 'kaluza',
    to: 'zuzia',
    brief: 'Zuzia w kapciach z pomponami biegnie prosto w wielką kałużę na podwórku. Ostrzeż ją!',
    intencja: 'ostrzec',
    cel: ['ostrzezenie'],
    wymagaTematu: false,
    koszyk: [
      { id: 'stoj', pos: 'glowne', text: 'stój', cechy: ['rozkaz', 'ostrzezenie'] },
      { id: 'uwazaj', pos: 'glowne', text: 'uważaj', cechy: ['rozkaz', 'ostrzezenie'] },
      { id: 'kaluza', pos: 'glowne', text: 'kałuża', cechy: ['ostrzezenie'], temat: true },
      { id: 'czy-mozesz', pos: 'glowne', text: 'czy możesz się zatrzymać', cechy: ['pytanie-ty'] },
      { id: 'lubie-kaluze', pos: 'glowne', text: 'lubię kałuże', cechy: ['info'] },
    ],
    reakcje: {
      ostrzezenie: { act: 'Zuzia staje jak wryta tuż przed kałużą.', say: 'Ojej, prawie wpadłam! Dzięki!' },
      polecenie: { act: 'Zuzia odwraca się powoli… i ląduje w kałuży. Na kartce nic nie wołało, że to pilne.', say: 'Plusk! Moje kapcie!' },
      prosba: { act: 'Zuzia odpowiada w biegu.', say: 'Mogę! — i chlup, prosto w kałużę.' },
      stwierdzenie: { act: 'Zuzia odpowiada w biegu.', say: 'Mogę! — i chlup, prosto w kałużę.' },
      informacja: { act: 'Zuzia biegnie dalej, cała w skowronkach.', say: 'Ja też! — i plusk, prosto w kałużę.' },
      pytanie: { act: 'Zuzia zatrzymuje się, żeby odpowiedzieć… o krok za późno.', say: 'Co mówisz? — chlup.' },
    },
  },
  {
    id: 'rower',
    to: 'tymek',
    brief: 'W twoim rowerze spadł łańcuch, a w pojedynkę nie dasz rady go założyć. Tymek umie. Poproś go o pomoc.',
    intencja: 'poprosić',
    cel: ['prosba'],
    wymagaTematu: true,
    koszyk: [
      { id: 'pomoz', pos: 'glowne', text: 'pomóż mi', cechy: ['prosba'] },
      { id: 'pomozesz', pos: 'glowne', text: 'pomożesz mi', cechy: ['pytanie-ty'] },
      { id: 'prosze', pos: 'wstep', text: 'proszę', cechy: ['prosze'] },
      { id: 'z-rowerem', pos: 'dopelnienie', text: 'z rowerem', cechy: [], temat: true, attach: true },
      { id: 'napraw', pos: 'glowne', pelna: true, text: 'napraw mi rower', cechy: ['rozkaz'], temat: true },
      { id: 'nic-nie-umiesz', pos: 'glowne', pelna: true, text: 'ty i tak nic nie umiesz naprawić', cechy: ['docinek'] },
    ],
    reakcje: {
      prosba: { act: 'Tymek wychodzi z kluczem w ręku.', say: 'Jasne, chodźmy na podwórko!' },
      polecenie: { act: 'Tymek marszczy brwi.', say: 'Nie jesteś moją mamą. Zapytaj normalnie.' },
      rozkaz: { act: 'Tymek nie rusza się z miejsca.', say: 'Nie krzycz na mnie. Nie jesteś moją mamą.' },
      stwierdzenie: { act: 'Tymek wychyla się zza drzwi.', say: 'Pomogę? Skąd wiesz? Nikt mnie nie zapytał.' },
      pytanie: { act: 'Tymek drapie się w głowę.', say: 'Prosisz mnie czy pytasz? Nie rozumiem.' },
      zranienie: { act: 'Tymek zamyka drzwi bez słowa.', say: '…' },
      'bez-sprawy': { act: 'Tymek wychodzi gotowy do pomocy.', say: 'Pomogę, ale w czym? Nie wiem, o co chodzi.' },
    },
  },
  {
    id: 'halas',
    to: 'halina',
    brief: 'Wczoraj wieczorem długo dudnił twój nowy bębenek. Pani Halina mieszka pod tobą i przez ten hałas nie mogła spać. Przeproś ją.',
    intencja: 'przeprosić',
    cel: ['przeprosiny'],
    wymagaTematu: true,
    koszyk: [
      { id: 'przepraszam', pos: 'wstep', text: 'przepraszam', cechy: ['przeprosiny'] },
      { id: 'przepraszam-pania', pos: 'wstep', text: 'przepraszam panią', cechy: ['przeprosiny'] },
      { id: 'za-halas', pos: 'dopelnienie', text: 'za wczorajszy hałas', cechy: [], temat: true, attach: true },
      { id: 'bylo-glosno', pos: 'glowne', pelna: true, text: 'wczoraj było głośno', cechy: ['info'], temat: true },
      { id: 'bebenek', pos: 'glowne', pelna: true, text: 'mam nowy bębenek', cechy: ['info'] },
      { id: 'nie-przesadzaj', pos: 'glowne', pelna: true, text: 'niech pani nie przesadza', cechy: ['docinek'] },
    ],
    reakcje: {
      przeprosiny: { act: 'Pani Halina uśmiecha się zza drzwi.', say: 'Przeprosiny przyjęte, kochanie. Graj sobie, tylko do dziewiątej.' },
      informacja: { act: 'Pani Halina kiwa głową.', say: 'Wiem, nie mogłam spać. I co dalej?' },
      niepewne: { act: 'Pani Halina unosi brwi.', say: 'Przepraszasz mnie czy o coś pytasz?' },
      zranienie: { act: 'Pani Halina poprawia okulary i zamyka drzwi.', say: 'No wiesz…' },
      'bez-sprawy': { act: 'Pani Halina uchyla drzwi.', say: 'A za co przepraszasz, kochanie?' },
    },
  },
  {
    id: 'okulary',
    to: 'halina',
    brief: 'Na schodach leżą okulary pani Haliny — musiały jej wypaść z kieszeni. Położysz je na jej wycieraczce. Wsuń pod drzwi kartkę, żeby wiedziała, że to dla niej.',
    intencja: 'podać jej okulary',
    cel: ['dawanie'],
    wymagaTematu: true,
    koszyk: [
      { id: 'prosze', pos: 'wstep', text: 'proszę', cechy: ['prosze'] },
      { id: 'to-pani-okulary', pos: 'glowne', text: 'to pani okulary', cechy: ['dawanie'], temat: true },
      { id: 'zgubila', pos: 'glowne', text: 'pani zgubiła okulary', cechy: ['info'], temat: true },
      { id: 'niech-pani-uwaza', pos: 'glowne', text: 'niech pani lepiej pilnuje swoich rzeczy', cechy: ['docinek'] },
    ],
    reakcje: {
      dawanie: { act: 'Pani Halina podnosi okulary z wycieraczki i od razu je zakłada.', say: 'Dziękuję, kochanie! Szukałam ich od rana.' },
      informacja: { act: 'Pani Halina klepie się po kieszeniach.', say: 'Zgubiłam? To gdzie one są?' },
      zranienie: { act: 'Pani Halina podnosi okulary z wycieraczki bez uśmiechu.', say: 'Dziękuję… chyba.' },
      pytanie: { act: 'Pani Halina mruży oczy.', say: 'O co pytasz? Nic nie widzę bez okularów.' },
      'bez-sprawy': { act: 'Pani Halina uchyla drzwi i czeka.', say: 'Proszę… co, kochanie?' },
    },
  },
  {
    id: 'ksiazka',
    to: 'ola',
    brief: 'Masz książkę pożyczoną od Oli i zostało ci jeszcze sporo stron. Ola się martwi, czy ją odzyska. Obiecaj, że oddasz ją w piątek.',
    intencja: 'obiecać',
    cel: ['obietnica'],
    wymagaTematu: true,
    koszyk: [
      { id: 'obiecuje', pos: 'wstep', text: 'obiecuję', cechy: ['obietnica'] },
      { id: 'moze', pos: 'wstep', text: 'może', cechy: ['moze'] },
      { id: 'oddam', pos: 'glowne', text: 'oddam ci książkę w piątek', cechy: ['zapowiedz'], temat: true },
      { id: 'jest-u-mnie', pos: 'glowne', text: 'twoja książka jest u mnie', cechy: ['info'], temat: true },
      { id: 'oddaj-sie', pos: 'glowne', text: 'nie bądź taka skąpa', cechy: ['docinek'] },
    ],
    reakcje: {
      obietnica: { act: 'Ola się uśmiecha.', say: 'Trzymam cię za słowo. W piątek!' },
      'nie-obietnica': { act: 'Ola krzyżuje ręce.', say: '„Może” to nie jest obietnica.' },
      informacja: { act: 'Ola wzdycha.', say: 'Wiem, że jest u ciebie. Ale kiedy ją oddasz?' },
      pytanie: { act: 'Ola przechyla głowę.', say: 'Pytasz mnie? To ty masz powiedzieć, kiedy oddasz.' },
      zranienie: { act: 'Ola odwraca się do okna.', say: '…' },
      'bez-sprawy': { act: 'Ola czeka.', say: 'No i? Co z moją książką?' },
    },
  },
];

export type Werdykt =
  | { ok: true; odczyt: Odczyt }
  /** Kartka trafiła pod cudze drzwi. */
  | { ok: false; reason: 'inne-drzwi'; to: Odbiorca }
  /** Odbiorca zrozumiał inną czynność niż zamierzona. */
  | { ok: false; reason: 'inna-czynnosc'; odczyt: Odczyt };

/** Czy kartka załatwia sprawę — po tym, co odbiorca z niej odczytał. */
export function judgeKartka(sprawa: Sprawa, tiles: Kafelek[], znak: Znak, door: Odbiorca): Werdykt {
  if (door !== sprawa.to) return { ok: false, reason: 'inne-drzwi', to: sprawa.to };
  const odczyt = czytaj(tiles, znak, sprawa.wymagaTematu);
  if (sprawa.cel.includes(odczyt.czynnosc)) return { ok: true, odczyt };
  return { ok: false, reason: 'inna-czynnosc', odczyt };
}

export function reakcja(sprawa: Sprawa, odczyt: Odczyt): Reakcja {
  return sprawa.reakcje[odczyt.czynnosc] ?? INNA;
}


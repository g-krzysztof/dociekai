/**
 * L1, blok 3 „Wizytówka na klatce” — palety, gusta mieszkańców i sędzia.
 *
 * Sędzia czyta tylko **strukturę** (jest powitanie, jest jak się zwracać, dwa
 * różne zainteresowania, pytanie z wielką literą i pytajnikiem). Treści dziecka
 * nie ocenia: przezwisko też jest dobre. Odpowiedzi mieszkańców to skutek
 * danych (kto co lubi, kogo dotyczy pytanie), nie ocena wizytówki.
 */

export type Mieszkaniec = 'halina' | 'bogdan' | 'ola' | 'tymek' | 'zuzia' | 'ewa';

export const MIESZKANIEC_NAME: Record<Mieszkaniec, string> = {
  halina: 'pani Halina',
  bogdan: 'pan Bogdan',
  ola: 'Ola',
  tymek: 'Tymek',
  zuzia: 'Zuzia',
  ewa: 'pani Ewa',
};

/** Kolejność, w jakiej mieszkańcy mijają tablicę. */
export const KOLEJNOSC: Mieszkaniec[] = ['ewa', 'halina', 'ola', 'bogdan', 'tymek', 'zuzia'];

export const POWITANIA = ['Dzień dobry!', 'Cześć!', 'Witajcie, sąsiedzi!', 'Hej, kamienico!'];

export interface Zainteresowanie {
  id: string;
  label: string;
}

export const ZAINTERESOWANIA: Zainteresowanie[] = [
  { id: 'ksiazki', label: 'książki' },
  { id: 'pilka', label: 'piłkę nożną' },
  { id: 'rysowanie', label: 'rysowanie' },
  { id: 'zwierzeta', label: 'zwierzęta' },
  { id: 'planszowki', label: 'gry planszowe' },
  { id: 'gotowanie', label: 'gotowanie' },
  { id: 'rower', label: 'jazdę na rowerze' },
  { id: 'muzyka', label: 'muzykę' },
  { id: 'majsterkowanie', label: 'majsterkowanie' },
  { id: 'ogrod', label: 'rośliny i ogród' },
  { id: 'kosmos', label: 'gwiazdy i kosmos' },
  { id: 'taniec', label: 'taniec' },
];

export const UMIEJETNOSCI = [
  'jeździć na rowerze',
  'piec ciasto',
  'rysować zwierzęta',
  'grać na flecie',
  'liczyć w pamięci',
  'robić origami',
  'żonglować',
  'pływać',
];

/** Kartki od mieszkańców: kto lubi to samo, odpisuje właśnie o tym. */
export const WSPOLNE: Record<Mieszkaniec, Partial<Record<string, string>>> = {
  halina: {
    ogrod: 'Też lubisz rośliny? Pod moim oknem rosną pelargonie. Pokażę ci, jak się je podlewa.',
    gotowanie: 'W niedzielę piekę drożdżówki. Przyjdź, nauczę cię zagniatać ciasto.',
    zwierzeta: 'Mruczek lubi, jak ktoś go drapie za uchem. Wpadnij na parter, przedstawię was.',
    planszowki: 'Gram w warcaby od sześćdziesięciu lat. Zagramy?',
  },
  bogdan: {
    ksiazki: 'Mam w piwnicy dwa pudła książek z przygodami. Wybierz coś dla siebie.',
    kosmos: 'W sierpniu spadają gwiazdy. Wyniosę lornetkę na podwórko, popatrzymy razem.',
    pilka: 'Piszę do gazety o naszym klubie. Przyjdź na sobotni mecz nad rzeką.',
    muzyka: 'Mam stare płyty z piosenkami. Puszczę ci kiedyś najlepszą.',
  },
  ola: {
    ksiazki: 'Też czytasz? Mam całą półkę książek. Zapukaj na pierwsze piętro!',
    rysowanie: 'Rysujemy razem? Mam nowe kredki akwarelowe.',
    taniec: 'Ćwiczę taniec na podwórku. Dołączysz?',
  },
  tymek: {
    majsterkowanie: 'Skleiłem samolot, ale nie mam go czym pomalować. Pomożesz?',
    pilka: 'Gramy w soboty za młynem. Brakuje nam jednej osoby!',
    rower: 'Jeździmy nad rzekę. Jedź z nami!',
    planszowki: 'Mam nową grę planszową, ale Zuzia nie umie jeszcze grać. Zagrasz ze mną?',
  },
  zuzia: {
    zwierzeta: 'Lubię kotki i pieski i biedronki!',
    taniec: 'Umiem kręcić się w kółko! Potańczysz ze mną?',
    rysowanie: 'Narysowałam dla ciebie słoneczko.',
  },
  ewa: {
    rower: 'Ja też jeżdżę rowerem codziennie, z całą pocztą!',
    muzyka: 'Na trasie zawsze sobie podśpiewuję. Znasz jakąś wesołą piosenkę?',
    ogrod: 'Na mojej trasie jest ogród z różami. Pokażę ci, gdzie.',
  },
};

export interface Pytanie {
  id: string;
  text: string;
  /** Kogo dotyczy — ten odpowiada. */
  who: Mieszkaniec;
  answer: string;
}

export const PYTANIA: Pytanie[] = [
  { id: 'zwierze', text: 'Kto ma w domu zwierzę?', who: 'halina', answer: 'Ja mam kota, Mruczka. Czyta gazety pana Bogdana, tylko zawsze od końca.' },
  { id: 'boisko', text: 'Gdzie tu jest boisko?', who: 'tymek', answer: 'Za młynem, nad rzeką. Gramy tam w soboty.' },
  { id: 'ksiazka', text: 'Kto pożyczy mi książkę?', who: 'ola', answer: 'Ja! Wybierz sobie coś z mojej półki.' },
  { id: 'poczta', text: 'O której przychodzi poczta?', who: 'ewa', answer: 'Około dziesiątej. Jak masz list do wysłania, daj mi znać.' },
  { id: 'zawidelki', text: 'Co ciekawego dzieje się w Zawidełkach?', who: 'bogdan', answer: 'W sobotę przy młynie jest jarmark. Piszę o nim do gazety.' },
  { id: 'zabawa', text: 'Kto się ze mną pobawi?', who: 'zuzia', answer: 'Ja! Ja! Mam balonik!' },
];

/**
 * Własne pytanie — treści nikt nie ocenia. Jeśli w pytaniu pada temat, który
 * ktoś z kamienicy zna (rdzeń słowa), odpowiada ten mieszkaniec; odpowiedzi są
 * napisane tak, żeby pasowały do każdego pytania o ten temat. Inaczej pan
 * Bogdan zapisuje pytanie na zebranie lokatorów.
 */
export const WLASNE_TEMATY: { stems: RegExp; who: Mieszkaniec; answer: string }[] = [
  {
    stems: /zwierz|pies|psa|psem|psy|piesk|kot|kici|chomik|rybk|królik|papug|śwink/,
    who: 'halina',
    answer: 'W kamienicy mieszka tylko jedno zwierzę: mój kot Mruczek. Wpadnij na parter, przedstawię was.',
  },
  { stems: /boisk|piłk|mecz|grać w/, who: 'tymek', answer: 'Gramy w piłkę w soboty za młynem, nad rzeką. Przyjdź!' },
  { stems: /książ|czyta|bibliotek/, who: 'ola', answer: 'Ja mam całą półkę książek. Zapukaj na pierwsze piętro!' },
  { stems: /poczt|list|paczk|znaczk/, who: 'ewa', answer: 'Pocztę przynoszę około dziesiątej. Jak masz list do wysłania, daj mi znać.' },
  { stems: /rower/, who: 'tymek', answer: 'Jeździmy rowerami nad rzekę. Jedź z nami!' },
];

export const WLASNE_PYTANIE_ANSWER = 'Dobre pytanie! Zapisałem je w notesie i zapytam o nie wszystkich na zebraniu lokatorów.';

/** Kto odpowiada na własne pytanie dziecka i co. */
export function ownAnswer(q: string): { who: Mieszkaniec; answer: string } {
  const low = q.toLocaleLowerCase('pl');
  return WLASNE_TEMATY.find((t) => t.stems.test(low)) ?? { who: 'bogdan', answer: WLASNE_PYTANIE_ANSWER };
}

export interface Wizytowka {
  powitanie: string | null;
  /** Jak się do mnie zwracać — dowolne słowo dziecka. */
  imie: string;
  lubie: string[];
  /** Zainteresowanie spoza palety. */
  lubieWlasne: string;
  umiem: string | null;
  umiemWlasne: string;
  /** Id pytania z palety albo `'wlasne'`. */
  pytanie: string | null;
  pytanieWlasne: string;
}

export const EMPTY_WIZYTOWKA: Wizytowka = {
  powitanie: null,
  imie: '',
  lubie: [],
  lubieWlasne: '',
  umiem: null,
  umiemWlasne: '',
  pytanie: null,
  pytanieWlasne: '',
};

export const IMIE_MAX = 20;
export const WLASNE_MAX = 30;
export const PYTANIE_MAX = 80;

export const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

/** „a, b i c” — wyliczenie po polsku. */
export function joinPl(items: string[]): string {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} i ${items[items.length - 1]}`;
}

/** Zainteresowania na wizytówce: wybrane z palety + własne (jeśli wpisane). */
export function interestsOf(w: Wizytowka): string[] {
  const own = clean(w.lubieWlasne);
  return own ? [...w.lubie, `own:${own}`] : [...w.lubie];
}

export function interestLabel(id: string): string {
  if (id.startsWith('own:')) return id.slice(4);
  return ZAINTERESOWANIA.find((z) => z.id === id)?.label ?? id;
}

export function umiemOf(w: Wizytowka): string | null {
  if (w.umiem === 'wlasne') return clean(w.umiemWlasne) || null;
  return w.umiem;
}

/** Kropka na końcu zdania, chyba że dziecko postawiło już swój znak. */
export const withDot = (s: string) => (/[.!?…]$/.test(s) ? s : `${s}.`);

/** Czy w wizytówce jest już cokolwiek — pusty formularz nie idzie do sprawdzenia. */
export function isTouched(w: Wizytowka): boolean {
  return Boolean(
    w.powitanie || clean(w.imie) || w.lubie.length || clean(w.lubieWlasne) || w.umiem || w.pytanie
  );
}

export function questionOf(w: Wizytowka): string | null {
  if (w.pytanie === 'wlasne') return clean(w.pytanieWlasne) || null;
  return PYTANIA.find((p) => p.id === w.pytanie)?.text ?? null;
}

export type KryteriumId = 'powitanie' | 'imie' | 'lubie' | 'pytanie';

export interface Ocena {
  ok: boolean;
  note: string;
}

/** Werdykt punkt po punkcie — tylko struktura. Konkret mówi postać, która czegoś nie wie. */
export function judgeWizytowka(w: Wizytowka): Record<KryteriumId, Ocena> {
  const imie = clean(w.imie);
  const interests = interestsOf(w);
  const q = questionOf(w);
  const own = w.pytanie === 'wlasne';

  let pytanie: Ocena;
  if (!q) {
    pytanie = { ok: false, note: 'Nie ma pytania — sąsiedzi nie wiedzą, o co chcesz ich zapytać.' };
  } else if (own && q[0] !== q[0].toLocaleUpperCase('pl')) {
    pytanie = { ok: false, note: `Twoje pytanie zaczyna się małą literą: „${q}”. Zdanie zaczynamy wielką.` };
  } else if (own && !q.endsWith('?')) {
    pytanie = { ok: false, note: `Na końcu „${q}” nie ma pytajnika — sąsiedzi nie wiedzą, że czekasz na odpowiedź.` };
  } else {
    pytanie = { ok: true, note: `Pytasz: „${q}”` };
  }

  return {
    powitanie: w.powitanie
      ? { ok: true, note: `Witasz się: „${w.powitanie}”` }
      : { ok: false, note: 'Wizytówka zaczyna się bez powitania — pani Halina czeka na „dzień dobry”.' },
    imie: imie
      ? { ok: true, note: `Sąsiedzi będą mówić do ciebie: ${imie}.` }
      : { ok: false, note: 'Pan Bogdan nie wie, jak cię nazywać — wpisz, jak mają się do ciebie zwracać.' },
    lubie:
      interests.length >= 2
        ? { ok: true, note: `Lubisz ${joinPl(interests.map(interestLabel))}.` }
        : {
            ok: false,
            note:
              interests.length === 1
                ? `Jest jedno zainteresowanie (${interestLabel(interests[0])}) — Ola pyta, co jeszcze lubisz.`
                : 'Nie ma żadnego zainteresowania — Ola nie wie, co lubisz.',
          },
    pytanie,
  };
}

export interface Karteczka {
  from: Mieszkaniec;
  /** Odpisuje na wspólne zainteresowanie albo odpowiada na pytanie. */
  kind: 'lubi' | 'pytanie';
  /** Na co odpowiada: zainteresowanie (`lubie`) albo pytanie. */
  about: string;
  text: string;
}

/**
 * Karteczki, które mieszkańcy zostawiają pod wizytówką: każdy, kto dzieli
 * zainteresowanie, odpisuje o pierwszym wspólnym; na pytanie odpowiada ten,
 * kogo dotyczy (jego karteczka o pytaniu idzie zamiast zainteresowania).
 */
export function karteczki(w: Wizytowka): Karteczka[] {
  const q = PYTANIA.find((p) => p.id === w.pytanie);
  const out: Karteczka[] = [];
  for (const who of KOLEJNOSC) {
    if (q && q.who === who) {
      out.push({ from: who, kind: 'pytanie', about: q.text, text: q.answer });
      continue;
    }
    const shared = w.lubie.find((id) => WSPOLNE[who][id]);
    if (shared) out.push({ from: who, kind: 'lubi', about: interestLabel(shared), text: WSPOLNE[who][shared]! });
  }
  if (w.pytanie === 'wlasne' && questionOf(w)) {
    const a = ownAnswer(questionOf(w)!);
    out.push({ from: a.who, kind: 'pytanie', about: questionOf(w)!, text: a.answer });
  }
  return out;
}

/** Tekst wizytówki do Teczki (akapity rozdzielone `\n`). */
export function wizytowkaText(w: Wizytowka): string {
  const lines = [
    w.powitanie ?? '',
    withDot(`Mówcie do mnie: ${clean(w.imie)}`),
    withDot(`Lubię ${joinPl(interestsOf(w).map(interestLabel))}`),
  ];
  const u = umiemOf(w);
  if (u) lines.push(withDot(`Umiem ${u}`));
  const q = questionOf(w);
  if (q) lines.push(q);
  return lines.filter(Boolean).join('\n');
}

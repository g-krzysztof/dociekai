/**
 * Blok 4 — Kto jest bliźnim? Przypowieść o miłosiernym Samarytaninie
 * (Ewangelia Łukasza 10,25–37, omówienie) jako scena na drodze z Jerozolimy
 * do Jerycha. Dziecko stawia monetę na przechodnia, który — jego zdaniem —
 * pomoże, potem scena rozgrywa się sama. Na końcu krąg „moich bliźnich”
 * porównany z kręgiem z przypowieści.
 */

export type WalkerId = 'kaplan' | 'lewita' | 'samarytanin';

export interface Walker {
  id: WalkerId;
  name: string;
  /** Kim jest — to, co wiedzieli słuchacze Jezusa. */
  who: string;
  helps: boolean;
  /** Co robi w scenie. */
  act: string;
}

export const WALKERS: readonly Walker[] = [
  {
    id: 'kaplan',
    name: 'Kapłan',
    who: 'Żyd, służy w świątyni jedynego Boga w Jerozolimie. Zna Torę lepiej niż ktokolwiek.',
    helps: false,
    act: 'Kapłan zobaczył rannego… i przeszedł drugą stroną drogi.',
  },
  {
    id: 'lewita',
    name: 'Lewita',
    who: 'Żyd, pomocnik kapłanów w świątyni. Też zna Torę i przykazania.',
    helps: false,
    act: 'Lewita podszedł, popatrzył… i też przeszedł drugą stroną drogi.',
  },
  {
    id: 'samarytanin',
    name: 'Samarytanin',
    who: 'Przybysz z sąsiedniej krainy, Samarii. Żydzi i Samarytanie od stuleci się nie lubili i unikali się nawzajem.',
    helps: true,
    act: 'Samarytanin zatrzymał się. Opatrzył rany, posadził rannego na swoim osiołku, zawiózł do gospody i zapłacił za opiekę.',
  },
];

export function betVerdict(bet: WalkerId): string {
  if (bet === 'samarytanin')
    return 'Zgadłeś/łaś. Ale słuchacze Jezusa byli zaskoczeni: spodziewali się, że pomoże ktoś „swój” i pobożny — a pomógł obcy, którego nie lubili.';
  const w = WALKERS.find((x) => x.id === bet);
  return `Postawiłeś/łaś na: ${w?.name.toLowerCase()}. Tak samo myśleli słuchacze Jezusa — że pomoże ktoś pobożny i „swój”. A pomógł obcy, którego nie lubili.`;
}

export type NeighbourVerdict = { ok: true } | { ok: false; message: string };

/** Pytanie Jezusa z końca przypowieści: który z trzech okazał się bliźnim dla rannego? */
export function judgeNeighbour(id: WalkerId): NeighbourVerdict {
  if (id === 'samarytanin') return { ok: true };
  const w = WALKERS.find((x) => x.id === id);
  return {
    ok: false,
    message: `${w?.name} był ranniemu najbliższy wiarą i pochodzeniem — ale przeszedł drugą stroną drogi. Kto się zatrzymał?`,
  };
}

export interface CirclePerson {
  id: string;
  label: string;
}

/** Osoby do kręgu „moich bliźnich” — wybór dziecka nie jest oceniany. */
export const CIRCLE_PEOPLE: readonly CirclePerson[] = [
  { id: 'mama', label: 'mama' },
  { id: 'przyjaciel', label: 'przyjaciel z ławki' },
  { id: 'sasiad', label: 'sąsiad z bloku' },
  { id: 'nielubiany', label: 'chłopak z innej klasy, który ci dokucza' },
  { id: 'turysta', label: 'obcy turysta, który się zgubił' },
  { id: 'daleko', label: 'dziewczynka z dalekiego kraju, której nie znasz' },
];

/** Ile osób dziecko zostawiło poza kręgiem — dla zdania porównania. */
export function leftOut(inside: ReadonlySet<string>): CirclePerson[] {
  return CIRCLE_PEOPLE.filter((p) => !inside.has(p.id));
}

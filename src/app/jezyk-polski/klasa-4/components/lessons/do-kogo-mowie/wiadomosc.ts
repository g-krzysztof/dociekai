/**
 * L3, blok 1 „Piłka w ogródku” — kafelki wiadomości i reakcje odbiorców.
 *
 * Ta sama sprawa (oddaj mi piłkę) na kartce do trojga odbiorców: Tymka (rówieśnik),
 * pani Haliny (starsza sąsiadka) i pani dyrektor (sprawa szkolna). Kafelek nie
 * ma „poziomu grzeczności” do zgadywania — każdy odbiorca ma w danych zapisane,
 * jak go przyjmuje, i **zawsze mówi jednym zdaniem dlaczego**. Za grzecznie też
 * nie trafia: Tymek śmieje się z „Szanowna Pani”. Za szorstko do kolegi też
 * nie: „Dawaj piłkę.” to rozkaz, więc Tymek woli, żeby go zapytać.
 *
 * Wszystkie trzy wiadomości to **kartki** (pismo, nie rozmowa) — stąd
 * „Z wyrazami szacunku” w gnieździe zakończenia.
 *
 * Twarz odbiorcy = najgorsza reakcja z trzech gniazd (jedno złe słowo psuje
 * wiadomość), a zdanie postaci mówi o tym słowie.
 */

export type Odbiorca = 'tymek' | 'halina' | 'dyrektor';
export type Gniazdo = 'powitanie' | 'prosba' | 'zakonczenie';
export type Mina = 'usmiech' | 'smiech' | 'zdziwienie' | 'grymas';

export const ODBIORCY: { id: Odbiorca; label: string; kto: string; gdzie: string }[] = [
  { id: 'tymek', label: 'Tymek', kto: 'kolega z twojej klasy', gdzie: 'Piłka wpadła Tymkowi na balkon. Zostawiasz mu kartkę w drzwiach.' },
  { id: 'halina', label: 'pani Halina', kto: 'sąsiadka z parteru, ma ponad siedemdziesiąt lat', gdzie: 'Piłka wpadła pani Halinie do ogródka. Wsuwasz jej kartkę pod drzwi.' },
  { id: 'dyrektor', label: 'pani dyrektor', kto: 'dyrektorka twojej szkoły', gdzie: 'Piłka przeleciała przez płot do szkolnego ogrodu. Zostawiasz kartkę w sekretariacie.' },
];

export const GNIAZDA: { id: Gniazdo; label: string }[] = [
  { id: 'powitanie', label: 'Powitanie' },
  { id: 'prosba', label: 'Prośba' },
  { id: 'zakonczenie', label: 'Zakończenie' },
];

/** Jak odbiorca przyjmuje kafelek: `ok` albo mina + zdanie „dlaczego”. */
type Przyjecie = 'ok' | { mina: Exclude<Mina, 'usmiech'>; mowi: string };

export interface Kafelek {
  id: string;
  gniazdo: Gniazdo;
  text: string;
  odbior: Record<Odbiorca, Przyjecie>;
}

export const KAFELKI: Kafelek[] = [
  // ── powitanie ──
  {
    id: 'czesc',
    gniazdo: 'powitanie',
    text: 'Cześć!',
    odbior: {
      tymek: 'ok',
      halina: { mina: 'grymas', mowi: '„Cześć”? Do starszej sąsiadki mówi się „dzień dobry”.' },
      dyrektor: { mina: 'grymas', mowi: '„Cześć” mówi się do kolegów, nie do dyrektorki szkoły.' },
    },
  },
  {
    id: 'dzien-dobry',
    gniazdo: 'powitanie',
    text: 'Dzień dobry!',
    odbior: {
      tymek: { mina: 'smiech', mowi: '„Dzień dobry”? Widzieliśmy się rano na podwórku!' },
      halina: 'ok',
      dyrektor: 'ok',
    },
  },
  {
    id: 'szanowna',
    gniazdo: 'powitanie',
    text: 'Szanowna Pani!',
    odbior: {
      tymek: { mina: 'smiech', mowi: '„Szanowna Pani”? Przecież to ja, Tymek!' },
      halina: { mina: 'zdziwienie', mowi: 'Tak oficjalnie? Jestem twoją sąsiadką, nie urzędem.' },
      dyrektor: 'ok',
    },
  },
  // ── prośba ──
  {
    id: 'dawaj',
    gniazdo: 'prosba',
    text: 'Dawaj piłkę.',
    odbior: {
      tymek: { mina: 'zdziwienie', mowi: '„Dawaj”? Rozkazujesz mi? Kolegę też można po prostu zapytać.' },
      halina: { mina: 'grymas', mowi: '„Dawaj”? Tak się nie prosi starszej osoby.' },
      dyrektor: { mina: 'grymas', mowi: '„Dawaj” to rozkaz, i to do kolegi. Prośba do dorosłego brzmi inaczej.' },
    },
  },
  {
    id: 'oddasz',
    gniazdo: 'prosba',
    text: 'Oddasz mi piłkę?',
    odbior: {
      tymek: 'ok',
      halina: { mina: 'zdziwienie', mowi: '„Oddasz”? Mówisz do mnie na „ty”? Do starszych mówi się „Pani”.' },
      dyrektor: { mina: 'zdziwienie', mowi: 'Na „ty” mówisz do kolegów. Do mnie mów „Pani”.' },
    },
  },
  {
    id: 'moglaby',
    gniazdo: 'prosba',
    text: 'Czy mogłaby Pani oddać mi piłkę?',
    odbior: {
      tymek: { mina: 'smiech', mowi: '„Pani”? Ja nie jestem żadną panią!' },
      halina: 'ok',
      dyrektor: 'ok',
    },
  },
  {
    id: 'uprzejmie',
    gniazdo: 'prosba',
    text: 'Uprzejmie proszę o zwrot piłki.',
    odbior: {
      tymek: { mina: 'smiech', mowi: '„Uprzejmie proszę o zwrot”? Mówisz jak list z banku!' },
      halina: { mina: 'zdziwienie', mowi: 'Jak w urzędzie… Po sąsiedzku można prościej.' },
      dyrektor: 'ok',
    },
  },
  // ── zakończenie ──
  {
    id: 'dzieki',
    gniazdo: 'zakonczenie',
    text: 'Dzięki!',
    odbior: {
      tymek: 'ok',
      halina: { mina: 'zdziwienie', mowi: '„Dzięki” mówi się do kolegów. Mnie można podziękować pełnym słowem.' },
      dyrektor: { mina: 'grymas', mowi: '„Dzięki” jest za krótkie do dyrektorki. Lepiej „dziękuję”.' },
    },
  },
  {
    id: 'dziekuje',
    gniazdo: 'zakonczenie',
    text: 'Dziękuję!',
    odbior: { tymek: 'ok', halina: 'ok', dyrektor: 'ok' },
  },
  {
    id: 'z-wyrazami',
    gniazdo: 'zakonczenie',
    text: 'Z wyrazami szacunku',
    odbior: {
      tymek: { mina: 'smiech', mowi: '„Z wyrazami szacunku”? Haha, podpisz się jeszcze pieczątką!' },
      halina: { mina: 'zdziwienie', mowi: 'Tak kończy się oficjalne listy, a nie kartkę do sąsiadki. Wystarczy podziękować.' },
      dyrektor: 'ok',
    },
  },
];

export const kafelek = (id: string) => KAFELKI.find((k) => k.id === id);

export type Wiadomosc = Partial<Record<Gniazdo, string>>;

export interface Reakcja {
  mina: Mina;
  /** Zdanie odbiorcy — zawsze mówi, dlaczego taka mina. */
  mowi: string;
  /** Kafelek, który zdecydował (do podświetlenia). */
  przez?: string;
  pelna: boolean;
}

const WAGA: Record<Exclude<Mina, 'usmiech'>, number> = { grymas: 3, zdziwienie: 2, smiech: 1 };

const USMIECH: Record<Odbiorca, string> = {
  tymek: 'Jasne, łap! — Tymek przeczytał kartkę i rzuca ci piłkę z balkonu.',
  halina: 'Ależ proszę, kochanie. — Pani Halina przeczytała kartkę i podaje ci piłkę przez płotek.',
  dyrektor: 'Oczywiście. Następnym razem grajcie dalej od płotu. — Pani dyrektor przeczytała kartkę i oddaje piłkę.',
};

export function reakcja(o: Odbiorca, w: Wiadomosc): Reakcja {
  const ids = GNIAZDA.map((g) => w[g.id]).filter(Boolean) as string[];
  const pelna = ids.length === GNIAZDA.length;
  let worst: Reakcja | null = null;
  for (const id of ids) {
    const k = kafelek(id);
    if (!k) continue;
    const p = k.odbior[o];
    if (p === 'ok') continue;
    if (!worst || WAGA[p.mina as keyof typeof WAGA] > WAGA[worst.mina as keyof typeof WAGA]) {
      worst = { mina: p.mina, mowi: p.mowi, przez: id, pelna };
    }
  }
  if (worst) return worst;
  if (!pelna) {
    const brak = GNIAZDA.find((g) => !w[g.id])!;
    return {
      mina: 'zdziwienie',
      mowi: ids.length === 0 ? 'Czekam, co mi napiszesz.' : `Brakuje mi jeszcze: ${brak.label.toLowerCase()}.`,
      pelna,
    };
  }
  return { mina: 'usmiech', mowi: USMIECH[o], pelna };
}

export const tekstWiadomosci = (w: Wiadomosc) =>
  GNIAZDA.map((g) => kafelek(w[g.id] ?? '')?.text)
    .filter(Boolean)
    .join(' ');

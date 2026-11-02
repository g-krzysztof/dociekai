/**
 * Rok koczowniczego obozu (L15, blok 2) — czysta symulacja. Trzy miejsca,
 * dwanaście miesięcy od kwietnia. Co miesiąc w każdym miejscu coś odrasta
 * albo przychodzi (jaja, ryby, jagody, grzyby, stada reniferów), a grupa zjada
 * 4 porcje tam, gdzie stoi obóz. Stado odchodzi z porą roku: latem jest na
 * tundrze, zimą schodzi do doliny. Dziecko decyduje tylko o jednym — kiedy
 * zwinąć obóz i dokąd iść. Liczby są wymyślone (model), ale kierunek jest
 * prawdziwy: jedzenie w jednym miejscu się kończy, więc trzeba iść dalej.
 */

export type PlaceId = 'dolina' | 'las' | 'tundra';
export type FoodKind = 'jaja' | 'ryby' | 'jagody' | 'grzyby' | 'renifery';

export const NEED = 4;
export const CAP = 12;
/** Ruszanie się z obozu, w którym zostało tyle porcji, to niepotrzebny trud. */
export const TOO_EARLY_AT = 2 * NEED;
export const MONTHS = ['kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień', 'styczeń', 'luty', 'marzec'];
/** Miejscownik do zdań: „w lipcu”. */
export const MONTHS_IN = ['w kwietniu', 'w maju', 'w czerwcu', 'w lipcu', 'w sierpniu', 'we wrześniu', 'w październiku', 'w listopadzie', 'w grudniu', 'w styczniu', 'w lutym', 'w marcu'];

export interface Place {
  id: PlaceId;
  name: string;
  /** Miejscownik: „w dolinie”. */
  inName: string;
  /** Co miesiąc odrasta / przychodzi (indeks 0 = kwiecień). */
  regen: number[];
  /** Ile zapasu zostaje z miesiąca na miesiąc (1 — wszystko, 0 — stado odeszło). */
  keep: number[];
  kind: (month: number) => FoodKind;
}

export const PLACES: Place[] = [
  {
    id: 'dolina',
    name: 'Dolina rzeki',
    inName: 'w dolinie',
    // wiosną jaja ptaków, latem ryby, zimą stada schodzą z wiatru w dolinę
    regen: [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3],
    keep: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    kind: (m) => (m < 2 ? 'jaja' : m < 7 ? 'ryby' : 'renifery'),
  },
  {
    id: 'las',
    name: 'Las na wzgórzach',
    inName: 'w lesie',
    regen: [0, 1, 3, 4, 4, 4, 2, 0, 0, 0, 0, 0],
    // od listopada jagody i grzyby gniją
    keep: [1, 1, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 0.5],
    kind: (m) => (m < 5 ? 'jagody' : 'grzyby'),
  },
  {
    id: 'tundra',
    name: 'Tundra na północy',
    inName: 'na tundrze',
    regen: [0, 3, 5, 5, 4, 1, 0, 0, 0, 0, 0, 0],
    // po lecie stado odchodzi na południe — na tundrze nie zostaje nic
    keep: [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    kind: () => 'renifery',
  },
];

export const START_STOCK: Record<PlaceId, number> = { dolina: 8, las: 2, tundra: 0 };

export function getPlace(id: PlaceId): Place {
  return PLACES.find((p) => p.id === id)!;
}

export interface MonthLog {
  month: number;
  at: PlaceId;
  /** Obóz zwinięty na początku tego miesiąca (skąd). */
  movedFrom: PlaceId | null;
  /** Ile zostało w opuszczonym miejscu w chwili wymarszu. */
  leftBehind: number;
  eaten: number;
  /** Ile porcji zabrakło. */
  short: number;
}

export interface CampState {
  month: number;
  at: PlaceId;
  stock: Record<PlaceId, number>;
  log: MonthLog[];
}

export function initialCamp(): CampState {
  return { month: 0, at: 'dolina', stock: { ...START_STOCK }, log: [] };
}

/** Ile będzie w miejscu na początku miesiąca `month` (po odroście), zanim ktoś zje. */
export function grown(place: Place, stock: number, month: number): number {
  return Math.min(CAP, Math.floor(stock * place.keep[month]) + place.regen[month]);
}

/**
 * Jeden miesiąc: najpierw wszędzie odrasta (i gnije, i odchodzi), potem grupa
 * idzie (jeśli `goTo` inne niż obecne miejsce) i je tam, gdzie stanęła.
 */
export function advance(state: CampState, goTo: PlaceId = state.at): CampState {
  if (state.month >= MONTHS.length) return state;
  const m = state.month;
  const stock = { ...state.stock };
  for (const p of PLACES) stock[p.id] = grown(p, stock[p.id], m);
  const moved = goTo !== state.at;
  const eaten = Math.min(NEED, stock[goTo]);
  stock[goTo] -= eaten;
  const entry: MonthLog = {
    month: m,
    at: goTo,
    movedFrom: moved ? state.at : null,
    leftBehind: moved ? state.stock[state.at] : 0,
    eaten,
    short: NEED - eaten,
  };
  return { month: m + 1, at: goTo, stock, log: [...state.log, entry] };
}

export function isYearOver(state: CampState): boolean {
  return state.month >= MONTHS.length;
}

export interface CampVerdict {
  ok: boolean;
  hungryMonths: MonthLog[];
  moves: number;
  tooEarly: MonthLog[];
  /** Zdanie werdyktu nazywające konkret (miesiąc, miejsce, ile zostało). */
  text: string;
}

/** Rok przyjęty, gdy głód zdarzył się najwyżej raz. */
export const MAX_HUNGRY = 1;

export function judgeYear(log: readonly MonthLog[]): CampVerdict {
  const hungryMonths = log.filter((l) => l.short > 0);
  const moves = log.filter((l) => l.movedFrom).length;
  const tooEarly = log.filter((l) => l.movedFrom && l.leftBehind >= TOO_EARLY_AT);
  const ok = hungryMonths.length <= MAX_HUNGRY;
  let text: string;
  if (!ok) {
    const first = hungryMonths[0];
    const place = getPlace(first.at);
    const stayedAll = moves === 0;
    text = stayedAll
      ? `Obóz przez cały rok stał w dolinie. Już ${MONTHS_IN[first.month]} zabrakło jedzenia — dolina nie nadąża odrastać, a stado przychodzi tu dopiero zimą. Głód: ${hungryMonths.length} z 12 miesięcy.`
      : `${capital(MONTHS_IN[first.month])} ${place.inName} zabrakło ${first.short} z ${NEED} porcji. Głód: ${hungryMonths.length} z 12 miesięcy — obóz trzeba było zwinąć wcześniej albo pójść tam, gdzie akurat jest stado.`;
  } else {
    text = `Rok przeżyty${hungryMonths.length ? ' — tylko raz było krucho' : ' bez głodu'}. Obóz zwijaliście ${moves} ${moves === 1 ? 'raz' : 'razy'}.`;
    if (tooEarly.length) {
      const t = tooEarly[0];
      text += ` Raz za wcześnie: ${MONTHS_IN[t.month]} odeszliście, choć ${getPlace(t.movedFrom!).inName} zostało jeszcze ${t.leftBehind} porcji — niepotrzebny trud.`;
    }
  }
  return { ok, hungryMonths, moves, tooEarly, text };
}

function capital(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

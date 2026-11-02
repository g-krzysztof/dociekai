/**
 * L11 bloki 2 i 3 — święta państwowe i ustawy, które je ustanawiały.
 * Czyste dane i sędzia, bez Reacta.
 *
 * Fakty (blok 2): F-II.1-19…21 z bazy. Daty ustaw (blok 3) sprawdzone
 * 2026-10-09:
 *  - ustawa z 29 kwietnia 1919 r. — 3 maja świętem narodowym;
 *  - ustawa z 23 kwietnia 1937 r. o Święcie Niepodległości (cytat art. 1
 *    w pisowni oryginału; prawo.pl, „11 listopada – Święto Niepodległości”);
 *    przed wojną obchodzone jako święto państwowe tylko w 1937 i 1938 r.;
 *  - ustawa KRN z 22 lipca 1945 r. o ustanowieniu Narodowego Święta
 *    Odrodzenia Polski (Dz.U. 1945 nr 32 poz. 194, eli.gov.pl) — zastąpiła
 *    ustawę z 1937 r.;
 *  - ustawa z 18 stycznia 1951 r. o dniach wolnych od pracy — bez 3 maja
 *    (dzieje.pl, „60 lat temu zniesiono święto Trzeciego Maja”);
 *  - ustawa z 15 lutego 1989 r. — przywrócenie Narodowego Święta
 *    Niepodległości;
 *  - ustawa z 6 kwietnia 1990 r. (Dz.U. 1990 nr 28 poz. 160) — przywrócenie
 *    Święta Narodowego Trzeciego Maja i zniesienie 22 lipca.
 */

/* ------------------------------------------------------- blok 2: kalendarz */

export interface Holiday {
  id: 'konstytucja' | 'bitwa-warszawska' | 'niepodleglosc';
  /** Dzień i miesiąc na kartce. */
  day: number;
  month: string;
  /** Oficjalna nazwa święta. */
  name: string;
  /** Rok wydarzenia, które upamiętnia. */
  year: number;
  /** Co się stało — własnymi słowami, 2–3 zdania. */
  story: string;
  /** Dopisek, np. o drugim święcie tego dnia. */
  note?: string;
}

/** W kolejności kalendarza (maj → sierpień → listopad). */
export const HOLIDAYS: Holiday[] = [
  {
    id: 'konstytucja',
    day: 3,
    month: 'maja',
    name: 'Święto Narodowe Trzeciego Maja',
    year: 1791,
    story:
      'W 1791 roku posłowie na sejmie w Warszawie uchwalili konstytucję — spisane zasady, według których miało działać całe państwo. Chcieli naprawić Rzeczpospolitą, zanim sąsiedzi ją rozbiorą.',
  },
  {
    id: 'bitwa-warszawska',
    day: 15,
    month: 'sierpnia',
    name: 'Święto Wojska Polskiego',
    year: 1920,
    story:
      'W 1920 roku, zaledwie dwa lata po odzyskaniu niepodległości, armia Rosji bolszewickiej podeszła pod Warszawę. W połowie sierpnia wojsko polskie ją zatrzymało i odepchnęło — to Bitwa Warszawska.',
    note: 'Tego samego dnia katolicy obchodzą święto religijne — dlatego 15 sierpnia ma dwa powody, żeby być czerwoną kartką.',
  },
  {
    id: 'niepodleglosc',
    day: 11,
    month: 'listopada',
    name: 'Narodowe Święto Niepodległości',
    year: 1918,
    story:
      'Przez 123 lata Polski nie było na mapie — jej ziemie podzieliły Rosja, Prusy i Austria. Jesienią 1918 roku, pod koniec wielkiej wojny, Polska znów stała się wolnym państwem. 11 listopada Józef Piłsudski objął w Warszawie dowództwo nad polskim wojskiem.',
  },
];

/* ------------------------------------------------------- blok 3: ustawy */

export type DayId = '3-maja' | '22-lipca' | '11-listopada';
export type YearId = 1938 | 1960 | 1995;

export const DAYS: { id: DayId; label: string }[] = [
  { id: '3-maja', label: '3 maja' },
  { id: '22-lipca', label: '22 lipca' },
  { id: '11-listopada', label: '11 listopada' },
];
export const YEARS: YearId[] = [1938, 1960, 1995];

export interface Act {
  year: number;
  /** Data uchwalenia — do nagłówka. */
  date: string;
  /** Cytat (pisownia oryginału) albo omówienie. */
  text: string;
  quote: boolean;
  /** Co zmienia: dzień → święto od roku `year` (true) albo przestaje nim być (false). */
  sets: Partial<Record<DayId, boolean>>;
}

export const ACTS: Act[] = [
  {
    year: 1919,
    date: '29 kwietnia 1919',
    text: 'Sejm uznaje dzień 3 maja — rocznicę konstytucji — za święto narodowe.',
    quote: false,
    sets: { '3-maja': true },
  },
  {
    year: 1937,
    date: '23 kwietnia 1937',
    text: 'Dzień 11 listopada, jako rocznica odzyskania przez Naród Polski niepodległego bytu państwowego […] — jest uroczystem Świętem Niepodległości.',
    quote: true,
    sets: { '11-listopada': true },
  },
  {
    year: 1945,
    date: '22 lipca 1945',
    text: 'Nowe władze ustanawiają święto państwowe 22 lipca. Ustawa o Święcie Niepodległości z 1937 roku przestaje obowiązywać.',
    quote: false,
    sets: { '22-lipca': true, '11-listopada': false },
  },
  {
    year: 1951,
    date: '18 stycznia 1951',
    text: 'Nowa lista dni wolnych od pracy. Na tej liście nie ma już 3 maja.',
    quote: false,
    sets: { '3-maja': false },
  },
  {
    year: 1989,
    date: '15 lutego 1989',
    text: 'Przywraca się Narodowe Święto Niepodległości 11 listopada.',
    quote: false,
    sets: { '11-listopada': true },
  },
  {
    year: 1990,
    date: '6 kwietnia 1990',
    text: 'Przywraca się Święto Narodowe Trzeciego Maja. Święto 22 lipca zostaje zniesione.',
    quote: false,
    sets: { '3-maja': true, '22-lipca': false },
  },
];

/** Czy dzień był świętem państwowym w danym roku — wyprowadzone z ustaw, nie wpisane ręcznie. */
export function isHoliday(day: DayId, year: number, acts: Act[] = ACTS): boolean {
  let state = false;
  for (const a of [...acts].sort((x, y) => x.year - y.year)) {
    if (a.year > year) break;
    if (a.sets[day] !== undefined) state = a.sets[day]!;
  }
  return state;
}

/** Ostatnia ustawa przed rokiem `year`, która dotyczyła dnia — do odrzutu. */
export function lastActFor(day: DayId, year: number, acts: Act[] = ACTS): Act | undefined {
  return [...acts]
    .sort((x, y) => x.year - y.year)
    .filter((a) => a.year <= year && a.sets[day] !== undefined)
    .pop();
}

export type CellKey = `${YearId}:${DayId}`;
export const cellKey = (year: YearId, day: DayId): CellKey => `${year}:${day}`;

const DAY_LABEL: Record<DayId, string> = {
  '3-maja': '3 maja',
  '22-lipca': '22 lipca',
  '11-listopada': '11 listopada',
};

export interface CellError {
  key: CellKey;
  message: string;
}

/**
 * Sędzia kalendarzy: porównuje zamalowane kartki z tym, co wynika z ustaw.
 * Każdy błąd nazywa kartkę i ustawę, która rozstrzyga.
 */
export function judgeKalendarze(red: ReadonlySet<CellKey>, acts: Act[] = ACTS): CellError[] {
  const errors: CellError[] = [];
  for (const year of YEARS) {
    for (const { id: day } of DAYS) {
      const key = cellKey(year, day);
      const truth = isHoliday(day, year, acts);
      if (red.has(key) === truth) continue;
      const act = lastActFor(day, year, acts);
      const label = `${DAY_LABEL[day]} ${year}`;
      let message: string;
      if (truth) {
        message = `${label}: ustawa z ${act!.date} r. mówi, że to święto — a nikt jej później nie zmienił. Kartka powinna być czerwona.`;
      } else if (!act) {
        const first = acts.find((a) => a.sets[day] === true);
        message = `${label}: w ${year} r. tego święta jeszcze nie było — ustanowiła je dopiero ustawa z ${first?.date ?? '?'} r.`;
      } else {
        message = `${label}: ustawa z ${act.date} r. odebrała temu dniu święto. Kartka powinna być czarna.`;
      }
      errors.push({ key, message });
    }
  }
  return errors;
}

/* -------------------------------------------- blok 2: kartka na osi lat */

export const AXIS_FROM = 1760;
export const AXIS_TO = 2030;
/** Ile lat obok wydarzenia kartka się „przykleja”. */
export const SNAP_YEARS = 4;

export type KartkaVerdict =
  | { ok: true; year: number }
  | { ok: false; year: number; diff: number; message: string };

/** Sędzia kartki: blisko roku wydarzenia — przykleja; daleko — mówi o ile i w którą stronę. */
export function judgeKartka(h: Holiday, droppedYear: number): KartkaVerdict {
  const y = Math.round(droppedYear);
  const diff = h.year - y;
  if (Math.abs(diff) <= SNAP_YEARS) return { ok: true, year: h.year };
  const n = Math.abs(diff);
  const lata = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'lata' : 'lat';
  return {
    ok: false,
    year: y,
    diff,
    message: `Kartka wisi przy roku ${y}. To, o czym pamiętamy ${h.day} ${h.month}, wydarzyło się ${n} ${lata} ${diff > 0 ? 'później' : 'wcześniej'}.`,
  };
}

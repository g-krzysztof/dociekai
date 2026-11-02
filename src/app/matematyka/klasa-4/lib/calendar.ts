/**
 * Czyste funkcje i dane do przewodnika o kalendarzu — miesiące, dni tygodnia
 * i lata przestępne. Ten sam „roman.ts"/„clock.ts" dla tego przewodnika:
 * tabela miesięcy, widżet kostek dłoni, sprawdzarka lat przestępnych i siatka
 * kalendarza czytają z jednego źródła, żeby nie mogły się rozjechać.
 */

export const MONTH_NAMES = [
  'styczeń',
  'luty',
  'marzec',
  'kwiecień',
  'maj',
  'czerwiec',
  'lipiec',
  'sierpień',
  'wrzesień',
  'październik',
  'listopad',
  'grudzień',
] as const;

/** Liczba dni w miesiącu w roku zwykłym — luty koryguje `isLeapYear`. */
const MONTH_DAYS_COMMON = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Prawdziwa reguła gregoriańska, nie tylko „co 4 lata" — patrz akt „Rok przestępny" dla wyjątku stuleci. */
export const isLeapYear = (year: number): boolean =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

export const daysInMonth = (monthIndex: number, year: number): number =>
  monthIndex === 1 && isLeapYear(year) ? 29 : MONTH_DAYS_COMMON[monthIndex];

/** Dni pozostałe w miesiącu, licząc od dnia `day` włącznie z dniem docelowym — 13 sierpnia → 1 września to `daysUntilNextMonth(13, 7, 2026)` dni. */
export const daysUntilNextMonth = (day: number, monthIndex: number, year: number): number =>
  daysInMonth(monthIndex, year) - day + 1;

/** Dni między dwiema datami tego samego roku (może przechodzić przez kilka miesięcy). */
export const daysBetween = (
  fromDay: number,
  fromMonthIndex: number,
  toDay: number,
  toMonthIndex: number,
  year: number
): number => {
  if (fromMonthIndex === toMonthIndex) return toDay - fromDay;
  let total = daysInMonth(fromMonthIndex, year) - fromDay;
  for (let m = fromMonthIndex + 1; m < toMonthIndex; m++) total += daysInMonth(m, year);
  return total + toDay;
};

/** Indeks dnia tygodnia (0 = poniedziałek) dla pierwszego dnia miesiąca — czysta funkcja dat, bez zależności od `Date.now()`. */
export const firstWeekdayOfMonth = (monthIndex: number, year: number): number => {
  const jsDay = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay(); // 0 = niedziela
  return (jsDay + 6) % 7; // przesunięcie na 0 = poniedziałek
};

export const WEEKDAYS = [
  'poniedziałek',
  'wtorek',
  'środa',
  'czwartek',
  'piątek',
  'sobota',
  'niedziela',
] as const;

export const WEEKDAY_SHORT = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'nd'] as const;

/** Stan pojedynczego dnia w `<CalendarGrid>`: punkt startowy, część liczonego zakresu, albo dzień docelowy. */
export interface CalendarDayState {
  day: number;
  kind: 'start' | 'range' | 'target';
}

/** Podświetlenie miesiąca startowego: dzień `fromDay` jako `start`, reszta miesiąca jako `range`. */
export const fromMonthHighlight = (
  fromDay: number,
  monthIndex: number,
  year: number
): CalendarDayState[] => {
  const total = daysInMonth(monthIndex, year);
  const cells: CalendarDayState[] = [{ day: fromDay, kind: 'start' }];
  for (let d = fromDay + 1; d <= total; d++) cells.push({ day: d, kind: 'range' });
  return cells;
};

/** Podświetlenie miesiąca docelowego: dni 1..`toDay-1` jako `range`, `toDay` jako `target`. */
export const toMonthHighlight = (toDay: number): CalendarDayState[] => {
  const cells: CalendarDayState[] = [];
  for (let d = 1; d < toDay; d++) cells.push({ day: d, kind: 'range' });
  cells.push({ day: toDay, kind: 'target' });
  return cells;
};

/** Podświetlenie odcinka `fromDay`..`toDay` w OBRĘBIE jednego miesiąca — `<CalendarTrail>`'s odpowiednik dla skoku `within-month`. */
export const withinMonthHighlight = (fromDay: number, toDay: number): CalendarDayState[] => {
  const cells: CalendarDayState[] = [{ day: fromDay, kind: 'start' }];
  for (let d = fromDay + 1; d < toDay; d++) cells.push({ day: d, kind: 'range' });
  cells.push({ day: toDay, kind: 'target' });
  return cells;
};

/**
 * Pozycja miesiąca w sztuczce „dwóch pięści": złóż obie dłonie w pięści,
 * kostkami do góry, i złącz wskazujące palce ze sobą. Licząc od lewego
 * małego palca do lewego wskazującego to styczeń–lipiec (cztery kostki,
 * trzy doliny), a stamtąd — bez żadnej doliny, bo oba wskazujące palce po
 * prostu się stykają — dalej na prawy wskazujący i w prawo do prawego
 * serdecznego to sierpień–grudzień. Prawy mały palec i dolina przed nim
 * zostają nieużyte (`monthIndex: null`) — w roku jest tylko dwanaście
 * miesięcy, a obie dłonie razem dają czternaście miejsc. Wyliczone
 * algorytmicznie, nie wpisane ręcznie: `isKnuckle` naprzemiennie w obu
 * dłoniach (pierwsze miejsce każdej dłoni to zawsze kostka), a numer
 * miesiąca to po prostu kolejna liczba 0..11 — właśnie dlatego, że oba
 * wskazujące palce (koniec lewej, początek prawej) są kostkami, styczność
 * między dłońmi nigdy nie wypada na dolinie.
 */
export interface KnucklePosition {
  hand: 'left' | 'right';
  indexInHand: number;
  isKnuckle: boolean;
  monthIndex: number | null;
}

export const KNUCKLE_SEQUENCE: KnucklePosition[] = Array.from({ length: 14 }, (_, i) => {
  const hand = i < 7 ? 'left' : 'right';
  const indexInHand = i < 7 ? i : i - 7;
  return {
    hand,
    indexInHand,
    isKnuckle: indexInHand % 2 === 0,
    monthIndex: i < 12 ? i : null,
  };
});

/** Ciąg dni tygodnia dla 1 stycznia kolejnych lat — sprawdzony ręcznie, dowód na przesunięcie o 1 (rok zwykły) i 2 (rok przestępny w środku). */
export interface NewYearWeekday {
  year: number;
  weekdayIndex: number; // 0 = poniedziałek
}

export const NEW_YEAR_SEQUENCE: NewYearWeekday[] = [
  { year: 2024, weekdayIndex: 0 }, // poniedziałek
  { year: 2025, weekdayIndex: 2 }, // środa (2024 był przestępny → skok o 2)
  { year: 2026, weekdayIndex: 3 }, // czwartek
  { year: 2027, weekdayIndex: 4 }, // piątek
  { year: 2028, weekdayIndex: 5 }, // sobota
  { year: 2029, weekdayIndex: 0 }, // poniedziałek (2028 był przestępny → skok o 2)
];

function daysWord(n: number): string {
  return n === 1 ? 'dzień' : 'dni';
}

/** Polska odmiana „tydzień/tygodnie/tygodni" — ten sam wzorzec co `topicsWord` w curriculum.ts. */
function weeksWord(n: number): string {
  if (n === 1) return 'tydzień';
  const last = n % 10;
  const lastTwo = n % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'tygodnie';
  return 'tygodni';
}

/** Rozkład liczby dni na pełne tygodnie i resztę — dzielenie z resztą przez 7 z Modułu 1, zastosowane do kalendarza. */
export const weeksAndDays = (totalDays: number): { weeks: number; days: number } => ({
  weeks: Math.floor(totalDays / 7),
  days: totalDays % 7,
});

/** np. `formatWeeksAndDays(52)` === „7 tygodni i 3 dni"; pomija składnik, który wyszedł na zero. */
export function formatWeeksAndDays(totalDays: number): string {
  const { weeks, days } = weeksAndDays(totalDays);
  if (weeks === 0) return `${totalDays} ${daysWord(totalDays)}`;
  if (days === 0) return `${weeks} ${weeksWord(weeks)}`;
  return `${weeks} ${weeksWord(weeks)} i ${days} ${daysWord(days)}`;
}

export interface DateJump {
  id: string;
  kind: 'within-month' | 'to-month-end' | 'whole-month' | 'into-month';
  monthIndex: number;
  deltaDays: number;
  /** Krótki podpis na chipie/plakietce, np. „+18 dni". */
  shortLabel: string;
  /** Pełne zdanie do narracji pod widżetem. */
  caption: string;
}

/**
 * Rozkłada odcinek od dnia `fromDay` miesiąca `fromMonthIndex` do dnia `toDay`
 * miesiąca `toMonthIndex` (ten sam rok, `toMonthIndex` >= `fromMonthIndex`) na
 * skoki metodą „doliczania" — dokładnie ta sama strategia co `buildTimeJumps`
 * z lib/time.ts (do granicy, potem pełne jednostki, na końcu reszta), z jedną
 * kluczową różnicą: godzina zawsze ma 60 minut, ale miesiąc NIE ma jednej
 * stałej liczby dni — dlatego środkowy krok to jeden osobny skok na każdy
 * cały miesiąc pomiędzy, a nie jedno mnożenie. Suma skoków jest zawsze równa
 * `daysBetween(fromDay, fromMonthIndex, toDay, toMonthIndex, year)`.
 */
export function buildDateJumps(
  fromDay: number,
  fromMonthIndex: number,
  toDay: number,
  toMonthIndex: number,
  year: number
): DateJump[] {
  if (fromMonthIndex === toMonthIndex) {
    const delta = toDay - fromDay;
    return [
      {
        id: 'within-month',
        kind: 'within-month',
        monthIndex: fromMonthIndex,
        deltaDays: delta,
        shortLabel: `+${delta} ${daysWord(delta)}`,
        caption: `${delta} ${daysWord(delta)} w tym samym miesiącu — z dnia ${fromDay} do dnia ${toDay}.`,
      },
    ];
  }

  const jumps: DateJump[] = [];
  const toEnd = daysInMonth(fromMonthIndex, year) - fromDay;
  if (toEnd > 0) {
    jumps.push({
      id: 'to-month-end',
      kind: 'to-month-end',
      monthIndex: fromMonthIndex,
      deltaDays: toEnd,
      shortLabel: `+${toEnd} ${daysWord(toEnd)}`,
      caption: `${toEnd} ${daysWord(toEnd)} do końca miesiąca — zostaje ${MONTH_NAMES[fromMonthIndex]}.`,
    });
  }

  for (let m = fromMonthIndex + 1; m < toMonthIndex; m++) {
    const delta = daysInMonth(m, year);
    jumps.push({
      id: `whole-${m}`,
      kind: 'whole-month',
      monthIndex: m,
      deltaDays: delta,
      shortLabel: `+${delta} ${daysWord(delta)}`,
      caption: `Cały miesiąc ${MONTH_NAMES[m]} — ${delta} ${daysWord(delta)}.`,
    });
  }

  if (toDay > 0) {
    jumps.push({
      id: 'into-month',
      kind: 'into-month',
      monthIndex: toMonthIndex,
      deltaDays: toDay,
      shortLabel: `+${toDay} ${daysWord(toDay)}`,
      caption: `Jeszcze ${toDay} ${daysWord(toDay)} od początku miesiąca ${MONTH_NAMES[toMonthIndex]} — trafiasz na dzień ${toDay}.`,
    });
  }

  return jumps;
}

export const CALENDAR_RULES: string[] = [
  'Tydzień ma zawsze 7 dni: poniedziałek, wtorek, środa, czwartek, piątek, sobota, niedziela — i zaczyna się od nowa w kółko.',
  'Rok ma 12 miesięcy. Siedem z nich ma 31 dni, cztery mają 30 dni, a luty ma 28 albo 29.',
  'Rok zwykły ma 365 dni. Ponieważ 365 = 52 tygodnie i jeszcze 1 dzień, ta sama data w przyszłym roku wypada zwykle jeden dzień tygodnia dalej.',
  'Rok przestępny ma 366 dni — dodatkowy 29 lutego sprawia, że data po lutym przesuwa się o dwa dni tygodnia, nie o jeden.',
  'Rok jest przestępny, gdy liczba roku dzieli się przez 4 — z wyjątkiem pełnych stuleci, które są przestępne tylko wtedy, gdy dzielą się przez 400.',
  'Żeby policzyć, ile dni zostało do końca miesiąca, odejmij dzisiejszy dzień od liczby dni w tym miesiącu i dodaj 1.',
];

export const REAL_LIFE_EXAMPLES: string[] = [
  'Planowanie wakacji albo ferii: „ile dni zostało do wyjazdu” to dokładnie to liczenie, którego uczysz się w tym przewodniku.',
  'Kalendarz w telefonie albo na ścianie w kuchni: każda kartka pokazuje jeden miesiąc w siatce siedmiu kolumn — tych samych siedmiu dni tygodnia.',
  'Rok przestępny co cztery lata: 2024 i 2028 miały 29 lutego, a 2025, 2026 i 2027 — nie.',
  'Urodziny: ta sama data w przyszłym roku prawie zawsze wypada w inny dzień tygodnia niż w tym roku.',
];

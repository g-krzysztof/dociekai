/**
 * Kalendarz szkolny serii — wszystko, co odpowiada na pytanie „czy ten dzień
 * w ogóle liczy się do serii”.
 *
 * Dwie zasady, z których wynika reszta pliku:
 *
 * 1. **Daty są lokalne, nigdy UTC.** Klucz dnia powstaje z `getFullYear()`/
 *    `getMonth()`/`getDate()`, więc lekcja skończona o 23:55 należy do dnia,
 *    w którym dziecko ją robiło, a nie do jutra według serwera. Odbiorca kursu
 *    siedzi w jednej strefie czasowej, więc nie ma tu czego konwertować —
 *    a najczęstszy błąd w systemach serii bierze się właśnie z konwersji.
 * 2. **Seria liczy dni nauki, nie dni kalendarzowe.** Weekend, ferie i dni
 *    ustawowo wolne to `rest` — ich pominięcie nic nie kosztuje. Dziecko ma
 *    wtedy wolne i nie ma powodu, żeby serwis udawał, że jest inaczej.
 */

/** Lokalna data jako `YYYY-MM-DD`. */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Dzisiejszy klucz dnia w czasie lokalnym przeglądarki. */
export function todayKey(): string {
  return dateKey(new Date());
}

/** Klucz dnia → `Date` ustawiony na lokalną północ (bez przesunięcia strefy). */
export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Klucz dnia przesunięty o `n` dni (ujemne = wstecz). Odporny na zmianę czasu. */
export function addDays(key: string, n: number): string {
  const date = parseKey(key);
  date.setDate(date.getDate() + n);
  return dateKey(date);
}

/** Liczba dni między dwoma kluczami (`b - a`). */
export function daysBetween(a: string, b: string): number {
  const ms = parseKey(b).getTime() - parseKey(a).getTime();
  // Doba potrafi mieć 23 lub 25 godzin przy zmianie czasu — zaokrąglenie to łapie.
  return Math.round(ms / 86_400_000);
}

/** 0 = poniedziałek … 6 = niedziela. Tydzień w Polsce zaczyna się w poniedziałek. */
export function weekdayIndex(key: string): number {
  return (parseKey(key).getDay() + 6) % 7;
}

/** Poniedziałek tygodnia, w którym leży `key`. */
export function weekStart(key: string): string {
  return addDays(key, -weekdayIndex(key));
}

/** Identyfikator tygodnia — po prostu jego poniedziałek. Budżet zamrażarek jest per tydzień. */
export function weekKey(key: string): string {
  return weekStart(key);
}

export function isWeekend(key: string): boolean {
  return weekdayIndex(key) >= 5;
}

/* --- przerwy w roku szkolnym ---------------------------------------- */

/** Niedziela wielkanocna danego roku (algorytm Meeusa/Butchera, kalendarz gregoriański). */
function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return dateKey(new Date(year, month - 1, day));
}

/** `MM-DD` dni, w których w Polsce nie ma lekcji niezależnie od roku. */
const FIXED_FREE_DAYS = new Set([
  '01-01', // Nowy Rok
  '01-06', // Trzech Króli
  '05-01', // Święto Pracy
  '05-03', // Święto Konstytucji
  '08-15', // Wniebowzięcie
  '11-01', // Wszystkich Świętych
  '11-11', // Święto Niepodległości
  '12-25',
  '12-26',
]);

/** Przerwy rozciągnięte na wiele dni, jako `MM-DD` od–do (włącznie). */
const FIXED_BREAKS: Array<[string, string]> = [
  ['06-24', '08-31'], // wakacje
  ['12-23', '01-01'], // przerwa świąteczna (przechodzi przez koniec roku)
];

function withinMonthDayRange(key: string, from: string, to: string): boolean {
  const monthDay = key.slice(5);
  // Zakres przechodzący przez sylwestra (np. 12-23 → 01-01) rozpada się na dwa.
  return from <= to ? monthDay >= from && monthDay <= to : monthDay >= from || monthDay <= to;
}

/**
 * Przerwa szkolna: wakacje, przerwa świąteczna, dni ustawowo wolne oraz
 * przerwa wielkanocna (Wielki Czwartek – wtorek po Wielkanocy) i Boże Ciało.
 *
 * Ferie zimowe celowo nie są tu ujęte: ich termin zależy od województwa i zmienia
 * się co roku, więc zgadywanie zrobiłoby więcej szkody niż pożytku. Użytkownik
 * zaznacza je sam — patrz `customBreaks` w `derive.ts`.
 */
export function isSchoolBreak(key: string): boolean {
  if (FIXED_FREE_DAYS.has(key.slice(5))) return true;
  if (FIXED_BREAKS.some(([from, to]) => withinMonthDayRange(key, from, to))) return true;

  const year = Number(key.slice(0, 4));
  const easter = easterSunday(year);
  const fromEaster = daysBetween(easter, key);
  // Od Wielkiego Czwartku do wtorku po Wielkanocy — tyle trwa przerwa w szkołach.
  if (fromEaster >= -3 && fromEaster <= 2) return true;
  // Boże Ciało: 60 dni po Wielkanocy.
  if (fromEaster === 60) return true;

  return false;
}

/** Dzień, którego pominięcie nic nie kosztuje: weekend albo przerwa. */
export function isRestDay(key: string, customBreaks: ReadonlyArray<[string, string]> = []): boolean {
  if (isWeekend(key) || isSchoolBreak(key)) return true;
  return customBreaks.some(([from, to]) => key >= from && key <= to);
}

/* --- rok szkolny ----------------------------------------------------- */

/** 1 września roku szkolnego, w którym leży `key` (wrzesień–sierpień). */
export function schoolYearStart(key: string): string {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(5, 7));
  return `${month >= 9 ? year : year - 1}-09-01`;
}

/** Podpis roku szkolnego, np. `2026/2027`. */
export function schoolYearLabel(key: string): string {
  const start = Number(schoolYearStart(key).slice(0, 4));
  return `${start}/${start + 1}`;
}

export const WEEKDAY_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'] as const;

export const MONTH_SHORT = [
  'sty', 'lut', 'mar', 'kwi', 'maj', 'cze',
  'lip', 'sie', 'wrz', 'paź', 'lis', 'gru',
] as const;

/** Data do odczytania przez człowieka, np. `14 września`. */
const MONTH_GENITIVE = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
] as const;

export function humanDate(key: string): string {
  const date = parseKey(key);
  return `${date.getDate()} ${MONTH_GENITIVE[date.getMonth()]}`;
}

/** Pełne nazwy dni — do opisów dla czytnika ekranu, gdzie „Pn” nic nie znaczy. */
export const WEEKDAY_FULL = [
  'poniedziałek',
  'wtorek',
  'środa',
  'czwartek',
  'piątek',
  'sobota',
  'niedziela',
] as const;

/**
 * Czyste funkcje do przewodnika o zegarze — kąty wskazówek, odmiana godzin
 * przez przypadki i zapis cyfrowy. To ten sam „roman.ts"/„place-value.ts"
 * dla tego przewodnika: tarcza zegara, odczyt słowny i zapis cyfrowy muszą
 * pochodzić z jednego źródła, żeby nie mogły się rozjechać.
 */

/** Liczba dopełniacza mianownika: „pierwsza", „druga"… — indeks 1–12. */
export const HOUR_NOMINATIVE = [
  'pierwsza',
  'druga',
  'trzecia',
  'czwarta',
  'piąta',
  'szósta',
  'siódma',
  'ósma',
  'dziewiąta',
  'dziesiąta',
  'jedenasta',
  'dwunasta',
];

/** Dopełniacz — forma używana po „do" i „po": „pierwszej", „drugiej"… */
export const HOUR_GENITIVE = [
  'pierwszej',
  'drugiej',
  'trzeciej',
  'czwartej',
  'piątej',
  'szóstej',
  'siódmej',
  'ósmej',
  'dziewiątej',
  'dziesiątej',
  'jedenastej',
  'dwunastej',
];

export const nominative = (hour12: number): string => HOUR_NOMINATIVE[hour12 - 1];
export const genitive = (hour12: number): string => HOUR_GENITIVE[hour12 - 1];

/** Zamiana zapisu 24-godzinnego na liczbę godziny 1–12 (bez zera — 0 i 12 to obie „dwunasta"). */
export const to12 = (hours24: number): number => {
  const h = hours24 % 12;
  return h === 0 ? 12 : h;
};

export const nextHour12 = (hour12: number): number => (hour12 % 12) + 1;

/** Pora doby dla danej godziny w zapisie 24-godzinnym — decyduje, jakie słowo dopowiadamy w zapisie 12-godzinnym. */
export type DayPeriod = 'w nocy' | 'rano' | 'przed południem' | 'po południu' | 'wieczorem';

export const dayPeriod = (hours24: number): DayPeriod => {
  if (hours24 < 5) return 'w nocy';
  if (hours24 < 10) return 'rano';
  if (hours24 < 12) return 'przed południem';
  if (hours24 < 18) return 'po południu';
  if (hours24 < 24) return 'wieczorem';
  return 'w nocy';
};

const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Zapis 24-godzinny, np. „19:42". */
export const digital24 = (hours24: number, minutes: number): string =>
  `${pad2(hours24)}:${pad2(minutes)}`;

/** Zapis 12-godzinny ze słownym dopowiedzeniem pory doby, np. „7:42 wieczorem". */
export const digital12 = (hours24: number, minutes: number): string =>
  `${to12(hours24)}:${pad2(minutes)} ${dayPeriod(hours24)}`;

/**
 * Pozycje, których uczy ten przewodnik: pełna godzina, kwadrans po, wpół do,
 * za kwadrans. Inne minuty nie mają jednego, utartego określenia słownego,
 * więc `spokenReading` celowo przyjmuje tylko te cztery wartości.
 */
export type QuarterMinute = 0 | 15 | 30 | 45;

export const spokenReading = (hour12: number, minutes: QuarterMinute): string => {
  switch (minutes) {
    case 0:
      return `Jest ${nominative(hour12)}.`;
    case 15:
      return `Kwadrans po ${genitive(hour12)}.`;
    case 30:
      return `Wpół do ${genitive(nextHour12(hour12))}.`;
    case 45:
      return `Za kwadrans ${nominative(nextHour12(hour12))}.`;
  }
};

/** Kąt wskazówki godzinowej w stopniach (0 = 12:00, mierzony zgodnie z ruchem wskazówek zegara). Uwzględnia minuty — godzinowa też „pełza". */
export const hourHandAngle = (hours24: number, minutes: number): number =>
  ((hours24 % 12) + minutes / 60) * 30;

/** Kąt wskazówki minutowej w stopniach. */
export const minuteHandAngle = (minutes: number): number => minutes * 6;

/** Kąt wskazówki sekundowej w stopniach. */
export const secondHandAngle = (seconds: number): number => seconds * 6;

/**
 * Punkt na tarczy w odległości `radius` od środka, pod kątem `angleDeg` (0 =
 * godzina 12, zgodnie z ruchem wskazówek). Zaokrąglone do 3 miejsc po
 * przecinku — `Math.sin`/`Math.cos` nie mają gwarantowanej identyczności
 * między silnikami JS (Node przy SSR vs przeglądarka przy hydratacji), więc
 * bez zaokrąglenia różnica na ostatnim bicie float64 powodowała mismatch
 * hydratacji na każdej współrzędnej SVG tarczy.
 */
export const polarPoint = (
  angleDeg: number,
  radius: number
): { x: number; y: number } => {
  const rad = (angleDeg * Math.PI) / 180;
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return { x: round(radius * Math.sin(rad)), y: round(-radius * Math.cos(rad)) };
};

/**
 * Ścieżka SVG łuku na tarczy: od `fromAngle` (stopnie, 0 = godzina 12, zgodnie
 * z ruchem wskazówek), przez `deltaDeg` stopni do przodu, w odległości
 * `radius` od środka. Używane do rysowania „skoków" wskazówki minutowej w
 * `<ClockJumps>` — dodatnie `deltaDeg` zawsze idzie zgodnie z ruchem
 * wskazówek, więc `sweepFlag` jest zawsze `1`.
 */
export function arcPath(radius: number, fromAngle: number, deltaDeg: number): string {
  const start = polarPoint(fromAngle, radius);
  const end = polarPoint(fromAngle + deltaDeg, radius);
  const largeArcFlag = deltaDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export const CLOCK_RULES: string[] = [
  'Doba ma 24 godziny, godzina 60 minut, a minuta 60 sekund.',
  'Wskazówka godzinowa okrąża tarczę raz na 12 godzin, minutowa raz na godzinę, a sekundowa raz na minutę.',
  '„Kwadrans po", „wpół do" i „za kwadrans" to trzy najczęstsze sposoby mówienia o czasie bez podawania minut liczbą.',
  'Zapis 24-godzinny liczy godziny od 0 do 23 bez powtórzeń — używają go rozkłady jazdy i telewizja.',
  'Zapis 12-godzinny liczy tylko do 12, a resztę dopowiada słowem: rano, przed południem, po południu, wieczorem albo w nocy.',
  'Żeby zamienić popołudniową albo wieczorną godzinę z zapisu 24-godzinnego na 12-godzinny, odejmujesz 12 — np. 19:42 − 12 = 7:42.',
];

export const REAL_LIFE_EXAMPLES: string[] = [
  'Rozkład jazdy pociągów i autobusów: zawsze zapis 24-godzinny, żeby godzina 7 z rana nie pomyliła się z 7 wieczorem.',
  'Zwykły zegarek na ręku albo ścienny w kuchni: najczęściej tylko 12 cyfr — to wskazówki, a nie cyfry, decydują, która to godzina.',
  'Telefon, kuchenka mikrofalowa, budzik: w ustawieniach możesz przełączyć zapis 12- na 24-godzinny — to dokładnie ta sama zamiana, której się tu nauczyłeś/aś.',
  'Program telewizyjny albo bilet do kina: „20:00” na plakacie to ten sam moment, co „8 wieczorem” w rozmowie.',
];

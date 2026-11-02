import type { GuideActMeta } from '../guide-act';

/**
 * Wszystkie akty na `flow` — ten sam wybór co w każdym przewodniku zbudowanym
 * po 2026-08-12 (`stage` jest wyjątkiem, nie domyślnym
 * trybem). Żadna treść tutaj nie potrzebuje ciągłego scrubowania scrollem —
 * każde odsłonięcie to klik w kostkę, w rok albo w przycisk „Policz".
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Ten sam dzień, inny dzień tygodnia', mode: 'flow' },
  { id: 'dni-tygodnia', label: 'Siedem dni w kółko', mode: 'flow' },
  { id: 'miesiace', label: 'Kostki dłoni', mode: 'flow' },
  { id: 'rok-przestepny', label: 'Rok przestępny', mode: 'flow' },
  { id: 'liczenie-dni', label: 'Liczenie dni', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół Ciebie', mode: 'flow' },
];

/** Akt „Rok przestępny" — lata do sprawdzenia klikiem, w tym dwa lata stuletnie na wyjątek reguły „co 4 lata". */
export const LEAP_YEAR_CHIPS: number[] = [2024, 2025, 2026, 2027, 2028];
export const CENTURY_YEAR_CHIPS: number[] = [1900, 2000];

/** Akt „Liczenie dni" — trzy przykłady na tej samej siatce kalendarza: zwykły miesiąc, luty w roku przestępnym (kontrast o jeden dzień) i skok do konkretnego dnia, nie tylko do pierwszego. */
export interface CountingExample {
  id: string;
  fromDay: number;
  monthIndex: number;
  toDay: number;
  toMonthIndex: number;
  year: number;
  prompt: string;
}

export const COUNTING_EXAMPLES: CountingExample[] = [
  {
    id: 'sierpien-wrzesien',
    fromDay: 13,
    monthIndex: 7, // sierpień
    toDay: 1,
    toMonthIndex: 8, // wrzesień
    year: 2026,
    prompt: 'Dziś jest 13 sierpnia. Za ile dni zacznie się wrzesień?',
  },
  {
    id: 'luty-przestepny',
    fromDay: 20,
    monthIndex: 1, // luty
    toDay: 1,
    toMonthIndex: 2, // marzec
    year: 2028,
    prompt: 'Dziś jest 20 lutego 2028 roku — roku przestępnego. Za ile dni zacznie się marzec?',
  },
  {
    id: 'listopad-grudzien',
    fromDay: 20,
    monthIndex: 10, // listopad
    toDay: 5,
    toMonthIndex: 11, // grudzień
    year: 2026,
    prompt: 'Dziś jest 20 listopada. Ile dni zostało do 5 grudnia — Twoich urodzin?',
  },
];

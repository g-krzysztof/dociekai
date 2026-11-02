import type { GuideActMeta } from '../guide-act';

/**
 * Wszystkie akty na `flow` (2026-08-12) — żaden nigdy nie używał
 * `useActProgress`/`useActStep`; `<EquationRow>`/`<TermSlot>` to lokalny
 * stan kliknięcia, nie scrub scrollem, więc `stage` tylko generował puste,
 * przyklejone ekrany. Ten sam fix co w `jednostki-miary`.
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Jak się nazywają?', mode: 'flow' },
  { id: 'dodawanie-i-odejmowanie', label: 'Dodawanie i odejmowanie', mode: 'flow' },
  { id: 'mnozenie-i-dzielenie', label: 'Mnożenie i dzielenie', mode: 'flow' },
  { id: 'rodziny-liczb', label: 'Rodziny liczb', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół ciebie', mode: 'flow' },
];

export interface Term {
  value: number;
  term: string;
}

/** 8 + 5 = 13 — para z odejmowaniem poniżej używa tych samych trzech liczb. */
export const ADDITION_EQUATION: [Term, Term, Term] = [
  { value: 8, term: 'składnik' },
  { value: 5, term: 'składnik' },
  { value: 13, term: 'suma' },
];

/** 13 − 5 = 8 — odwrotność dodawania powyżej. */
export const SUBTRACTION_EQUATION: [Term, Term, Term] = [
  { value: 13, term: 'odjemna' },
  { value: 5, term: 'odjemnik' },
  { value: 8, term: 'różnica' },
];

/** 4 × 3 = 12 — para z dzieleniem poniżej używa tych samych trzech liczb. */
export const MULTIPLICATION_EQUATION: [Term, Term, Term] = [
  { value: 4, term: 'czynnik' },
  { value: 3, term: 'czynnik' },
  { value: 12, term: 'iloczyn' },
];

/** 12 : 3 = 4 — odwrotność mnożenia powyżej. */
export const DIVISION_EQUATION: [Term, Term, Term] = [
  { value: 12, term: 'dzielna' },
  { value: 3, term: 'dzielnik' },
  { value: 4, term: 'iloraz' },
];

/** Nowe równanie w akcie „Wokół ciebie" — dziecko widzi je po raz pierwszy tutaj. */
export const PRACTICE_EQUATION: [Term, Term, Term] = [
  { value: 20, term: 'odjemna' },
  { value: 7, term: 'odjemnik' },
  { value: 13, term: 'różnica' },
];

export interface FactFamily {
  key: 'addition' | 'multiplication';
  label: string;
  a: number;
  b: number;
  c: number;
  aLabel: string;
  bLabel: string;
  cLabel: string;
  sentence: string;
}

export const FACT_FAMILIES: FactFamily[] = [
  {
    key: 'addition',
    label: 'Dodawanie i odejmowanie',
    a: 8,
    b: 5,
    c: 13,
    aLabel: 'składnik',
    bLabel: 'składnik',
    cLabel: 'suma',
    sentence: '8 + 5 = 13, a więc też 13 − 5 = 8 i 13 − 8 = 5 — trzy liczby, jedna rodzina.',
  },
  {
    key: 'multiplication',
    label: 'Mnożenie i dzielenie',
    a: 4,
    b: 3,
    c: 12,
    aLabel: 'czynnik',
    bLabel: 'czynnik',
    cLabel: 'iloczyn',
    sentence: '4 × 3 = 12, a więc też 12 : 3 = 4 i 12 : 4 = 3 — trzy liczby, jedna rodzina.',
  },
];

export const REAL_LIFE_EXAMPLES: string[] = [
  'Polecenie w zadaniu: „Oblicz sumę…” — czyli dodaj.',
  'Polecenie w zadaniu: „Jaka jest różnica…” — czyli odejmij.',
  'Polecenie w zadaniu: „Znajdź iloczyn…” — czyli pomnóż.',
  'Polecenie w zadaniu: „Oblicz iloraz…” — czyli podziel.',
  'Nauczyciel pytający „co jest tu składnikiem, a co sumą” przy tablicy.',
];

/** Ściąga ze słownika — wspólna baza, gdyby kiedyś powstała lekcja o tym samym temacie. */
export const OPERATION_RULES: string[] = [
  'Liczby, które dodajesz, to składniki. Wynik dodawania to suma.',
  'W odejmowaniu: odjemna minus odjemnik daje różnicę.',
  'Liczby, które mnożysz, to czynniki. Wynik mnożenia to iloczyn.',
  'W dzieleniu: dzielna podzielona przez dzielnik daje iloraz.',
  'Odejmowanie odwraca dodawanie, dzielenie odwraca mnożenie — te same trzy liczby, inny kierunek.',
];

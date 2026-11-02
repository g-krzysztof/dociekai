import type { GuideActMeta } from '../guide-act';
import type { ColumnCellData } from '../../column-grid';

/**
 * Wszystkie akty na `flow` — ten sam wybór co w każdym przewodniku zbudowanym
 * po 2026-08-12 (`stage` jest wyjątkiem, nie domyślnym
 * trybem). Odsłony to kliknięcia „Policz kolejną kolumnę", nie scrub scrollem.
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Dlaczego kolumny muszą się zgadzać', mode: 'flow' },
  { id: 'ustawianie-liczb', label: 'Ustawianie liczb', mode: 'flow' },
  { id: 'przenoszenie', label: 'Przenoszenie', mode: 'flow' },
  { id: 'pozyczanie', label: 'Pożyczanie', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół Ciebie', mode: 'flow' },
];

/**
 * Akt „Otwarcie" i „Ustawianie liczb" — ta sama para liczb, żeby błąd z
 * otwarcia dało się rozwiązać na tej samej stronie. `long` (więcej cyfr)
 * stoi zwyczajowo na górze i nie zmienia kolumn; to `short` (jedna cyfra)
 * jest tym, co w błędnym zapisie ląduje w niewłaściwej kolumnie.
 */
export const ALIGNMENT_EXAMPLE = { long: 84, short: 9, correctSum: 93 };

/** `short` ustawione pod dziesiątkami zamiast pod jednościami — dodawanie „na oślep" kolumna po kolumnie daje 174. */
export const ALIGNMENT_WRONG_CELLS: ColumnCellData[] = [
  { place: 'setki', top: null, bottom: null, result: 1 },
  { place: 'dziesiątki', top: 8, bottom: ALIGNMENT_EXAMPLE.short, result: 7 },
  { place: 'jedności', top: 4, bottom: null, result: 4 },
];

/** Ten sam przykład, `short` poprawnie pod jednościami. */
export const ALIGNMENT_CORRECT_CELLS: ColumnCellData[] = [
  { place: 'setki', top: null, bottom: null, result: null },
  { place: 'dziesiątki', top: 8, bottom: null, result: 9 },
  { place: 'jedności', top: 4, bottom: ALIGNMENT_EXAMPLE.short, result: 3 },
];

/** Drugi przykład w „Ustawianiu liczb" — do samodzielnego porównania Źle/Dobrze klikiem. */
export const ALIGNMENT_PRACTICE_EXAMPLE = { long: 253, short: 6, correctSum: 259 };

/** `short` ustawione pod setkami (pierwsza cyfra `long`) zamiast pod jednościami. */
export const PRACTICE_WRONG_CELLS: ColumnCellData[] = [
  { place: 'setki', top: 2, bottom: ALIGNMENT_PRACTICE_EXAMPLE.short, result: 8 },
  { place: 'dziesiątki', top: 5, bottom: null, result: 5 },
  { place: 'jedności', top: 3, bottom: null, result: 3 },
];

/** Ten sam przykład, `short` poprawnie pod jednościami. */
export const PRACTICE_CORRECT_CELLS: ColumnCellData[] = [
  { place: 'setki', top: 2, bottom: null, result: 2 },
  { place: 'dziesiątki', top: 5, bottom: null, result: 5 },
  { place: 'jedności', top: 3, bottom: ALIGNMENT_PRACTICE_EXAMPLE.short, result: 9 },
];

/** Akt „Przenoszenie" — dwa przeniesienia pod rząd (jedności → dziesiątki → setki). */
export const ADDITION_EXAMPLE = { a: 248, b: 176 };

/** Akt „Pożyczanie" — dwa pożyczenia pod rząd, celowo bez zera (to osobna lekcja modułu). */
export const SUBTRACTION_EXAMPLE = { a: 532, b: 178 };

export const REAL_LIFE_EXAMPLES: string[] = [
  'Sprawdzanie paragonu ze sklepu — czy suma cen produktów się zgadza.',
  'Liczenie reszty przy płaceniu gotówką w kiosku czy piekarni.',
  'Zapisywanie w zeszycie, ile kieszonkowego zostało po zakupach.',
  'Każdy sprawdzian z matematyki, gdzie trzeba policzyć coś w słupku porządnie.',
];

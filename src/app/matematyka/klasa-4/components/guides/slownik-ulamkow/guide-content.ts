import type { GuideActMeta } from '../guide-act';

/**
 * Wszystkie akty na `flow` — żaden nie scrubuje scrollem, budowanie ułamka
 * dzieje się klikiem (kawałek koła / żeton), nie pozycją scrolla. Ten sam
 * wybór co `slownik-kola`/`slownik-dzialan`.
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Jak zapisać, ile zjadłeś?', mode: 'flow' },
  { id: 'licznik-i-mianownik', label: 'Licznik i mianownik', mode: 'flow' },
  { id: 'nie-tylko-kolo', label: 'Nie tylko koło', mode: 'flow' },
  { id: 'ulamek-wlasciwy', label: 'Ułamek właściwy', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół ciebie', mode: 'flow' },
];

/** Pizza z otwarcia i outro — ten sam rysunek wraca, żeby spłacić obietnicę z pierwszego aktu. */
export const OPENING_MIANOWNIK = 8;
export const OPENING_LICZNIK = 3;

/** Wybory mianownika w interaktywnym budowniczym ułamka. */
export const DENOMINATOR_OPTIONS = [2, 3, 4, 5, 6, 8] as const;

export interface FractionExample {
  licznik: number;
  mianownik: number;
  verdict: 'wlasciwy' | 'calosc' | 'niewlasciwy';
  note: string;
}

export const CLASSIFY_EXAMPLES: FractionExample[] = [
  {
    licznik: 3,
    mianownik: 8,
    verdict: 'wlasciwy',
    note: 'Licznik (3) jest mniejszy od mianownika (8) — to mniej niż cała pizza. Ułamek właściwy.',
  },
  {
    licznik: 4,
    mianownik: 4,
    verdict: 'calosc',
    note: 'Licznik równy mianownikowi — to cała pizza, jedna całość. To nie jest ułamek właściwy.',
  },
  {
    licznik: 5,
    mianownik: 3,
    verdict: 'niewlasciwy',
    note: 'Licznik (5) jest większy od mianownika (3) — to więcej niż jedna cała pizza. To ułamek niewłaściwy — o nim więcej dowiesz się w kolejnej lekcji.',
  },
];

export const REAL_LIFE_EXAMPLES: string[] = [
  'Pizza podzielona na 8 kawałków, zjedzone 3 — to 3/8 pizzy.',
  'Tabliczka czekolady podzielona na 12 kostek, odłamane 4 — to 4/12 tabliczki.',
  'Klasa liczy 24 uczniów, 6 zostaje na zajęcia dodatkowe — to 6/24 klasy.',
  'Godzina podzielona na 4 kwadranse — jeden kwadrans to 1/4 godziny.',
  'Przepis „pół szklanki mąki” to inny zapis ułamka 1/2.',
];

export const CHEAT_SHEET: string[] = [
  'Ułamek to dwie liczby oddzielone poziomą kreską — pokazuje, jaką część całości bierzesz.',
  'Mianownik (na dole) mówi, na ile równych części podzielono całość.',
  'Licznik (na górze) mówi, ile z tych części bierzesz albo zamalowujesz.',
  'Ułamek właściwy ma licznik mniejszy od mianownika — jest zawsze mniejszy niż jedna całość.',
  'Gdy licznik jest równy mianownikowi, masz całość — np. 4/4 to jedna cała pizza.',
  'Przy tym samym liczniku większy mianownik oznacza mniejsze kawałki — 1/8 pizzy to mniej niż 1/4 pizzy.',
];

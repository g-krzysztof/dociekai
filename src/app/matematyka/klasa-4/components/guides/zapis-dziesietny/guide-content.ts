import type { GuideActMeta } from '../guide-act';
import type { DecimalValue } from '../../../lib/decimal';

/**
 * Wszystkie akty na `flow` — nic nie scrubuje scrollem, całe odkrywanie dzieje
 * się klikiem (podział paska, pokrętła cyfr, żetony z liczbami). Ten sam wybór
 * co `slownik-ulamkow`/`slownik-kola`.
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Skąd ten przecinek?', mode: 'flow' },
  { id: 'coraz-mniejsze-czesci', label: 'Coraz mniejsze części', mode: 'flow' },
  { id: 'tablica-pozycyjna', label: 'Tablica pozycyjna', mode: 'flow' },
  { id: 'uwaga-na-zera', label: 'Uwaga na zera', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół ciebie', mode: 'flow' },
];

/** Cena z otwarcia — ta sama liczba wraca w outro, żeby spłacić obietnicę pierwszego aktu. */
export const OPENING_VALUE: DecimalValue = { whole: 3, digits: [2, 5] };

/** Gotowe liczby do tablicy pozycyjnej — wszystkie z życia, nie wymyślone „ładne”. */
export interface DecimalPreset {
  label: string;
  value: DecimalValue;
}

export const BOARD_PRESETS: DecimalPreset[] = [
  { label: 'cena bułki', value: { whole: 3, digits: [2, 5] } },
  { label: 'wzrost czwartoklasisty', value: { whole: 1, digits: [4, 5] } },
  { label: 'butelka soku', value: { whole: 0, digits: [5] } },
  { label: 'gram w kilogramach', value: { whole: 0, digits: [0, 0, 1] } },
];

/** Trzy zapisy z aktu o zerach — dwa znaczą to samo, trzeci jest dziesięć razy mniejszy. */
export interface ZeroCase {
  label: string;
  value: DecimalValue;
  note: string;
}

export const ZERO_CASES: ZeroCase[] = [
  {
    label: '0,5',
    value: { whole: 0, digits: [5] },
    note: 'Pięć dziesiątych — połowa całości.',
  },
  {
    label: '0,50',
    value: { whole: 0, digits: [5, 0] },
    note: 'Pięćdziesiąt setnych — dokładnie ta sama długość co 0,5. Zero na końcu niczego nie dodaje.',
  },
  {
    label: '0,05',
    value: { whole: 0, digits: [0, 5] },
    note: 'Pięć setnych — dziesięć razy mniej niż 0,5. Zero między przecinkiem a piątką zmienia wszystko.',
  },
];

export const REAL_LIFE_EXAMPLES: string[] = [
  'Cena na paragonie: 3,25 zł to 3 złote i 25 groszy, czyli 25 setnych złotówki.',
  'Wzrost w książeczce zdrowia: 1,45 m to 1 metr i 45 centymetrów.',
  'Butelka soku: 0,5 l to pół litra, czyli 5 dziesiątych litra.',
  'Waga listu na poczcie: 0,25 kg to ćwierć kilograma, czyli 250 gramów.',
  'Temperatura w prognozie: 21,4 stopnia to 21 stopni i 4 dziesiąte stopnia.',
  'Wynik biegu na 60 metrów: 9,8 s to 9 sekund i 8 dziesiątych sekundy.',
];

export const CHEAT_SHEET: string[] = [
  'Przecinek oddziela całości od części całości — przed nim całe sztuki, za nim kawałki.',
  'Pierwsze miejsce po przecinku to części dziesiąte: jedna dziesiąta to 0,1, czyli 1/10.',
  'Drugie miejsce to części setne: 0,01 to 1/100 — dziesięć razy mniej niż 0,1.',
  'Trzecie miejsce to części tysięczne: 0,001 to 1/1000 — znów dziesięć razy mniej.',
  'Czytasz: najpierw całości, potem „i”, potem części z nazwą ostatniego rzędu — 3,25 to „trzy całe i dwadzieścia pięć setnych”.',
  'Zero dopisane na końcu nic nie zmienia (0,5 = 0,50), ale zero wstawione zaraz za przecinkiem zmienia wszystko (0,05 to dziesięć razy mniej).',
];

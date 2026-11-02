/**
 * Przypominajka L3 (z L2 „Ślady przeszłości”, dystans 1) — dane i sędzia,
 * bez Reacta.
 *
 * Skrót gestu „Dwie bramki”: dwie rzeczy z tej lekcji przechodzą przez te
 * same pytania („Da się tego dotknąć?” → „Jest na tym pismo?”). Kategoria
 * wynika z reguły, nie z klucza — jak w L2.
 */

export type MiniCategory = 'pisane' | 'niepisane' | 'niematerialne';

export interface MiniGateItem {
  id: string;
  name: string;
  touch: boolean;
  /** null — pytanie o pismo nie ma sensu (nie da się dotknąć). */
  writing: boolean | null;
  category: MiniCategory;
  hintTouch: string;
  hintWriting: string;
}

export const MINI_ITEMS: MiniGateItem[] = [
  {
    id: 'kronika',
    name: 'Kronika spisana gęsim piórem na pergaminie',
    touch: true,
    writing: true,
    category: 'pisane',
    hintTouch: 'Pergamin leży w bibliotece — da się go dotknąć (ostrożnie).',
    hintWriting: 'Kronika to same zapiski — jest na niej pismo.',
  },
  {
    id: 'piesn',
    name: 'Pieśń o dawnej bitwie, którą ludzie śpiewali z pamięci',
    touch: false,
    writing: null,
    category: 'niematerialne',
    hintTouch: 'Pieśń słychać, ale nie da się jej wziąć do ręki.',
    hintWriting: '',
  },
];

export type MiniGate = 'touch' | 'writing';

export function judgeMiniGate(item: MiniGateItem, gate: MiniGate, answer: boolean): boolean {
  return gate === 'touch' ? item.touch === answer : item.writing === answer;
}

export const MINI_CATEGORY_LABEL: Record<MiniCategory, string> = {
  pisane: 'źródło pisane',
  niepisane: 'źródło niepisane',
  niematerialne: 'źródło niematerialne',
};

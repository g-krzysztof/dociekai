/**
 * Przypominajka L5 (z L2 „Ślady przeszłości”, dystans 3) — dane i sędzia,
 * bez Reacta.
 *
 * Skrót gestu „Dwie bramki”: trzy pamiątki z rodzinnego kufra przechodzą
 * przez te same pytania („Da się tego dotknąć?” → „Jest na tym pismo?”).
 * Kategoria wynika z reguły, nie z klucza — jak w L2.
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
    id: 'pamietnik',
    name: 'Pamiętnik prababci — zeszyt zapisany ręcznie ołówkiem',
    touch: true,
    writing: true,
    category: 'pisane',
    hintTouch: 'Zeszyt leży w rodzinnym kufrze — da się go wziąć do ręki i przekartkować.',
    hintWriting: 'Pamiętnik to zeszyt zapisany ołówkiem — jest na nim pismo.',
  },
  {
    id: 'konik',
    name: 'Drewniany konik, którym bawił się dziadek',
    touch: true,
    writing: false,
    category: 'niepisane',
    hintTouch: 'Konik leży w rodzinnym kufrze — da się go wziąć do ręki.',
    hintWriting: 'Na koniku nie ma żadnych liter — to zwykła zabawka.',
  },
  {
    id: 'kolysanka',
    name: 'Kołysanka, którą w rodzinie śpiewa się z pamięci od pokoleń',
    touch: false,
    writing: null,
    category: 'niematerialne',
    hintTouch: 'Kołysankę słychać, ale nie da się jej wziąć do ręki.',
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

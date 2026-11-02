/**
 * Przypominajka L4 (z L3 „Czy źródło mówi prawdę?”, dystans 1) — dane
 * i sędzia, bez Reacta. Skrót gestu „zakreślacz w dwóch kolorach”: trzy
 * zdania o Biblii Gutenberga (fakty: pl.wikipedia.org/wiki/Biblia_Gutenberga,
 * 2026-10-03). Zdania są jednoznaczne — granicznych tu nie ma.
 */

export type MiniMark = 'fakt' | 'opinia';

export interface MiniSentence {
  id: string;
  text: string;
  answer: MiniMark;
  why: string;
}

export const MINI_SENTENCES: MiniSentence[] = [
  {
    id: 'pelplin',
    text: 'Jeden egzemplarz Biblii Gutenberga leży dziś w muzeum w Pelplinie.',
    answer: 'fakt',
    why: 'To da się sprawdzić — wystarczy pojechać do muzeum albo zajrzeć do jego katalogu.',
  },
  {
    id: 'piekna',
    text: 'To najpiękniejsza książka, jaką kiedykolwiek wydrukowano.',
    answer: 'opinia',
    why: '„Najpiękniejsza” to czyjaś ocena — ktoś inny może uważać inaczej i nikt nie przyzna racji żadnemu z nich.',
  },
  {
    id: 'rok',
    text: 'Druk tej Biblii skończono około 1455 roku.',
    answer: 'fakt',
    why: 'Datę da się sprawdzić w źródłach z tamtych lat — to fakt, nawet jeśli znamy go tylko „około”.',
  },
];

export function judgeMini(marks: Record<string, MiniMark | undefined>): { ok: boolean; wrong: MiniSentence[]; missing: number } {
  const wrong = MINI_SENTENCES.filter((s) => marks[s.id] && marks[s.id] !== s.answer);
  const missing = MINI_SENTENCES.filter((s) => !marks[s.id]).length;
  return { ok: wrong.length === 0 && missing === 0, wrong, missing };
}

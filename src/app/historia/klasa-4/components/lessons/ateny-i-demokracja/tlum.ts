/**
 * Czysta logika „stu mieszkańców Aten” (bloki 1 i 4). Proporcje to model, nie
 * spis: dorosłych mężczyzn-obywateli było w V w. p.n.e. mniej więcej co siódmy
 * mieszkaniec (ok. 30–40 tys. na 250–300 tys. ludzi w Attyce; szacunki za
 * M.H. Hansenem, „The Athenian Democracy in the Age of Demosthenes”, 1991).
 * Zdania o flocie są wymyślone — i tak podpisane w lekcji.
 */

export type Group = 'obywatel' | 'przybysz' | 'niewolnik';
export type Age = 'dziecko' | 'mlody' | 'dorosly';

export interface Person {
  id: number;
  group: Group;
  male: boolean;
  age: Age;
  /** Wymyślone zdanie o budowie floty. */
  za: boolean;
}

/** [grupa, płeć, wiek, ile osób, ile z nich za flotą] */
const MIX: [Group, boolean, Age, number, number][] = [
  ['obywatel', true, 'dorosly', 14, 9],
  ['obywatel', false, 'dorosly', 14, 4],
  ['obywatel', true, 'mlody', 2, 2],
  ['obywatel', false, 'mlody', 2, 0],
  ['obywatel', true, 'dziecko', 10, 3],
  ['obywatel', false, 'dziecko', 10, 2],
  ['przybysz', true, 'dorosly', 5, 4],
  ['przybysz', false, 'dorosly', 4, 1],
  ['przybysz', true, 'dziecko', 3, 1],
  ['przybysz', false, 'dziecko', 2, 0],
  ['niewolnik', true, 'dorosly', 18, 6],
  ['niewolnik', false, 'dorosly', 12, 2],
  ['niewolnik', true, 'dziecko', 2, 0],
  ['niewolnik', false, 'dziecko', 2, 0],
];

/** Stałe przemieszanie (bez Math.random — ten sam tłum na serwerze i w przeglądarce). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  let s = 23;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const PEOPLE: Person[] = shuffle(
  MIX.flatMap(([group, male, age, n, za]) =>
    Array.from({ length: n }, (_, i) => ({ group, male, age, za: i < za }))
  )
).map((p, id) => ({ ...p, id }));

export const COLS = 10;

// ── blok 1: prawo Aten jako sito ──
export type ClauseId = 'dorosly' | 'mezczyzna' | 'wolny' | 'ateńczyk';

export const CLAUSES: { id: ClauseId; text: string; out: string }[] = [
  { id: 'mezczyzna', text: 'jest mężczyzną', out: 'kobiety i dziewczynki' },
  { id: 'dorosly', text: 'skończył ok. 20 lat', out: 'dzieci i młodzi przed dwudziestką' },
  { id: 'wolny', text: 'jest wolny', out: 'niewolnicy' },
  { id: 'ateńczyk', text: 'ojciec i matka są z Aten', out: 'przybysze z innych miast' },
];

export function passes(p: Person, c: ClauseId): boolean {
  if (c === 'mezczyzna') return p.male;
  if (c === 'dorosly') return p.age === 'dorosly';
  if (c === 'wolny') return p.group !== 'niewolnik';
  return p.group === 'obywatel';
}

export function remaining(clauses: readonly ClauseId[]) {
  return PEOPLE.filter((p) => clauses.every((c) => passes(p, c)));
}

/** Kto odpada w tym przesianiu (spośród tych, którzy jeszcze stoją). */
export function siftOut(applied: readonly ClauseId[], next: ClauseId) {
  return remaining(applied).filter((p) => !passes(p, next));
}

export function tally(people: readonly Person[]) {
  const za = people.filter((p) => p.za).length;
  return { za, przeciw: people.length - za };
}

// ── blok 4: te same osoby według zasad Polski 2026 ──
export type ModernRule = 'kobiety' | 'wiek18' | 'bezNiewoli' | 'pochodzenie';

export const MODERN: { id: ModernRule; athens: string; today: string }[] = [
  { id: 'kobiety', athens: 'głosują tylko mężczyźni', today: 'głosują kobiety i mężczyźni' },
  { id: 'wiek18', athens: 'od ok. 20 lat', today: 'od 18 lat' },
  { id: 'bezNiewoli', athens: 'są niewolnicy', today: 'niewolnictwo zakazane' },
  { id: 'pochodzenie', athens: 'liczą się rodzice z Aten', today: 'liczy się obywatelstwo, nie pochodzenie rodziców' },
];

export function votesUnder(p: Person, on: ReadonlySet<ModernRule>): boolean {
  if (p.age === 'dziecko') return false;
  if (p.age === 'mlody' && !on.has('wiek18')) return false;
  if (!p.male && !on.has('kobiety')) return false;
  if (p.group === 'niewolnik' && !on.has('bezNiewoli')) return false;
  if (p.group === 'przybysz' && !on.has('pochodzenie')) return false;
  return true;
}

// ── blok 4: mowa Peryklesa (omówienie Tukidydesa, II 37–45) ──
export type Who = 'obywatele' | 'kobiety' | 'przybysze' | 'niewolnicy';
export const WHO: { id: Who; label: string }[] = [
  { id: 'obywatele', label: 'obywatele' },
  { id: 'kobiety', label: 'kobiety' },
  { id: 'przybysze', label: 'przybysze' },
  { id: 'niewolnicy', label: 'niewolnicy' },
];

export const SPEECH: { id: string; text: string; ref: string; about: Who[] }[] = [
  { id: 's1', text: 'Nasz ustrój nazywa się demokracją, bo rządzi nie garstka, lecz większość obywateli.', ref: 'II 37', about: ['obywatele'] },
  { id: 's2', text: 'Kto może zrobić coś dobrego dla miasta, nie zostanie odsunięty dlatego, że jest biedny.', ref: 'II 37', about: ['obywatele'] },
  { id: 's3', text: 'Nasze miasto jest otwarte dla wszystkich — nie wypędzamy cudzoziemców.', ref: 'II 39', about: ['przybysze'] },
  { id: 's4', text: 'Największa chwała kobiety jest wtedy, gdy mężczyźni najmniej o niej mówią — ani dobrze, ani źle.', ref: 'II 45', about: ['kobiety'] },
];

export const SILENT = 'milczy';

export function judgeSpeech(who: Who, target: string): { ok: boolean; why?: string } {
  if (target === SILENT) {
    const s = SPEECH.find((x) => x.about.includes(who));
    return s ? { ok: false, why: `Perykles mówi o nich — przeczytaj jeszcze raz: „${s.text}”` } : { ok: true };
  }
  const s = SPEECH.find((x) => x.id === target);
  if (!s) return { ok: false };
  if (s.about.includes(who)) return { ok: true };
  const label = WHO.find((w) => w.id === s.about[0])!.label;
  return { ok: false, why: `To zdanie mówi o grupie „${label}”.` };
}

/**
 * Znaczniki SGJP/NKJP → szkolne części mowy i pomocnicze pytania o kategorie.
 *
 * Słownik dzieli inaczej niż szkoła: „ten”, „mój”, „który” to dla niego
 * przymiotniki, a „kto”, „co” — rzeczowniki. W klasie 4 to zaimki, więc
 * lematy z list niżej idą do `zaimek` bez względu na znacznik.
 */

import type { Morph, SchoolPos } from './types';

const BY_CLASS: Record<string, SchoolPos> = {
  subst: 'rzeczownik',
  depr: 'rzeczownik',
  ger: 'rzeczownik',
  fin: 'czasownik',
  praet: 'czasownik',
  cond: 'czasownik',
  impt: 'czasownik',
  inf: 'czasownik',
  bedzie: 'czasownik',
  imps: 'czasownik',
  winien: 'czasownik',
  pred: 'czasownik',
  aglt: 'czasownik',
  adj: 'przymiotnik',
  adja: 'przymiotnik',
  adjp: 'przymiotnik',
  adjc: 'przymiotnik',
  pact: 'imieslow',
  ppas: 'imieslow',
  pcon: 'imieslow',
  pant: 'imieslow',
  adv: 'przyslowek',
  num: 'liczebnik',
  numcol: 'liczebnik',
  ppron12: 'zaimek',
  ppron3: 'zaimek',
  siebie: 'zaimek',
  prep: 'przyimek',
  conj: 'spojnik',
  comp: 'spojnik',
  part: 'partykula',
  qub: 'partykula',
  interj: 'wykrzyknik',
  brev: 'skrot',
};

/** Lematy, które szkoła nazywa zaimkami, choć słownik daje im inną klasę. */
const SCHOOL_PRONOUNS = new Set([
  'ten', 'tamten', 'ów', 'taki', 'owaki', 'jaki', 'jakiś', 'jakikolwiek', 'który', 'któryś',
  'mój', 'twój', 'swój', 'nasz', 'wasz', 'czyj', 'czyjś', 'niczyj', 'żaden', 'każdy',
  'kto', 'ktoś', 'ktokolwiek', 'nikt', 'co', 'coś', 'cokolwiek', 'nic',
]);

/** Pierwszy człon znacznika: `fin:pl:pri:perf` → `fin`. */
export function tagClass(tag: string): string {
  return tag.split(/[:+]/, 1)[0];
}

/**
 * Czy znacznik ma wartość kategorii. Uwzględnia alternatywy z kropką
 * (`nom.acc`) i sklejki z aglutynantem (`praet:pl:m1:perf+aglt:pl:pri`).
 */
export function tagHas(tag: string, value: string): boolean {
  return tag.split(/[:+]/).some((part) => part.split('.').includes(value));
}

export function schoolPos(morph: Morph): SchoolPos | undefined {
  if (SCHOOL_PRONOUNS.has(morph.lemma)) return 'zaimek';
  return BY_CLASS[tagClass(morph.tag)];
}

/**
 * Liczba mnoga pierwszej osoby: „my”, „damy”, „zrobiliśmy”, „zrobilibyśmy”.
 * SGJP zapisuje osobę wprost w `praet:pl:m1:pri:perf` i `cond:…:pri:…`;
 * sklejki `+aglt:pl:pri` dokłada skrypt dla form, których słownik nie zna.
 */
export function isFirstPersonPlural(morph: Morph): boolean {
  if (morph.lemma === 'my') return true;
  const [head, ...rest] = morph.tag.split('+');
  if (rest.some((part) => part.startsWith('aglt') && tagHas(part, 'pl') && tagHas(part, 'pri'))) {
    return true;
  }
  return (
    ['fin', 'impt', 'bedzie', 'praet', 'cond'].includes(tagClass(head)) &&
    tagHas(head, 'pl') &&
    tagHas(head, 'pri')
  );
}

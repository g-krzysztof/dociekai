/**
 * Blok 4 L20 — „klątwa faraona” sprawdzana datami. Czyste dane i sędziowie.
 *
 * Lata śmierci członków ekipy: lord Carnarvon 5 IV 1923 (zapalenie płuc po
 * zakażeniu ukąszenia), Howard Carter 2 III 1939 (baza F-III.T1-06/10),
 * lady Evelyn Herbert 1980, Harry Burton 1940, Arthur Callender 1936,
 * Alfred Lucas 1945 — por. M. R. Nelson, „The mummy's curse: historical
 * cohort study”, BMJ 325 (2002), i biografie w archiwum Griffith Institute.
 * Nagłówki gazet w lekcji są napisane przez nas (podpisane jako przykład).
 */

export const AXIS_FROM = 1922;
export const AXIS_TO = 1985;
export const CURSE_YEARS = 10;

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  /** Wskazówka na karcie — rok trzeba z niej odczytać albo policzyć. */
  clue: string;
  died: number;
}

export const TEAM: TeamMember[] = [
  {
    id: 'carnarvon',
    name: 'lord Carnarvon',
    role: 'płacił za wykopaliska',
    clue: 'Zmarł w kwietniu 1923 roku, pół roku po odkryciu grobu.',
    died: 1923,
  },
  {
    id: 'carter',
    name: 'Howard Carter',
    role: 'kierował wykopaliskami, pierwszy zajrzał do grobu',
    clue: 'Zmarł 17 lat po odkryciu grobu w 1922 roku.',
    died: 1939,
  },
  {
    id: 'evelyn',
    name: 'lady Evelyn Herbert',
    role: 'córka lorda, weszła do grobu jako jedna z pierwszych',
    clue: 'Weszła do grobu w 1923 roku i żyła potem jeszcze 57 lat.',
    died: 1980,
  },
  {
    id: 'callender',
    name: 'Arthur Callender',
    role: 'inżynier, pomagał rozbierać kaplice',
    clue: 'Zmarł 14 lat po odkryciu grobu w 1922 roku.',
    died: 1936,
  },
  {
    id: 'burton',
    name: 'Harry Burton',
    role: 'sfotografował każdy przedmiot z grobu',
    clue: 'Zmarł w 1940 roku.',
    died: 1940,
  },
  {
    id: 'lucas',
    name: 'Alfred Lucas',
    role: 'chemik, przez lata dotykał niemal każdego przedmiotu z grobu',
    clue: 'Zmarł w 1945 roku, mając 78 lat.',
    died: 1945,
  },
];

export type ThreadVerdict = { ok: true } | { ok: false; hint: string };

export function judgeThread(member: TeamMember, year: number): ThreadVerdict {
  if (year === member.died) return { ok: true };
  return {
    ok: false,
    hint: `${member.name}: nić kończy się w ${year} roku, a karta mówi co innego. Przeczytaj ją jeszcze raz${member.clue.includes('po') ? ' i policz' : ''}.`,
  };
}

/** Ilu zmarło w ciągu `CURSE_YEARS` lat od odkrycia grobu (do 1932 włącznie). */
export function diedWithinCurse(): number {
  return TEAM.filter((m) => m.died - AXIS_FROM <= CURSE_YEARS).length;
}

export function judgeCurseCount(n: number): ThreadVerdict {
  const real = diedWithinCurse();
  if (n === real) return { ok: true };
  return { ok: false, hint: 'Policz nici, które kończą się w zacienionym pasie „klątwy” — przed rokiem 1932.' };
}

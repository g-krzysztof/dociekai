/**
 * Sąd Hammurabiego (L17, blok 3) — czysta logika. Prawa omówione własnymi
 * słowami, z numerami paragrafów według przyjętej numeracji kodeksu
 * (Wikipedia „Code of Hammurabi”; tekst omówiony, nie przekład). Kary
 * opisujemy łagodnym słowem — kodeks był bardzo surowy.
 * Sprawa trafia do prawa, które ją opisuje: dziecko czyta prawo i przykłada
 * do niego sprawę; sędzia porównuje opis (kto komu co zrobił).
 */

export interface Law {
  id: string;
  no: number;
  text: string;
  verdict: string;
}

export const LAWS: Law[] = [
  { id: 'p53', no: 53, text: 'Jeśli ktoś nie dbał o wał przy swoim polu i woda z kanału zalała pola sąsiadów — odda im zboże, które zniszczyła woda.', verdict: 'Rolnik oddaje sąsiadowi zboże zniszczone przez wodę.' },
  { id: 'p196', no: 196, text: 'Jeśli obywatel wybił oko innemu obywatelowi — jemu też wybiją oko.', verdict: 'Ta sama szkoda spotyka winnego: oko za oko.' },
  { id: 'p22', no: 22, text: 'Jeśli ktoś napadł i obrabował innego człowieka i został złapany — czeka go najsurowsza kara.', verdict: 'Najsurowsza kara dla rabusia.' },
  { id: 'p199', no: 199, text: 'Jeśli obywatel wybił oko niewolnikowi innego obywatela — zapłaci jego właścicielowi połowę ceny niewolnika.', verdict: 'Winny płaci — ale nie niewolnikowi, tylko jego właścicielowi.' },
  { id: 'p200', no: 200, text: 'Jeśli obywatel wybił ząb obywatelowi równemu sobie — jemu też wybiją ząb.', verdict: 'Ta sama szkoda spotyka winnego: ząb za ząb.' },
];

export interface Case {
  id: string;
  text: string;
  law: string;
  /** Kim jest poszkodowany — do tabeli porównania. */
  victim?: 'obywatel' | 'niewolnik';
  harm?: 'oko' | 'ząb';
  /** Podpowiedź przy pomyłce: na co patrzeć w treści prawa. */
  look: string;
}

export const CASES: Case[] = [
  { id: 'targ', text: 'Na targu pokłócili się dwaj rolnicy, obaj obywatele. Jeden wybił drugiemu ząb.', law: 'p200', victim: 'obywatel', harm: 'ząb', look: 'Szukaj prawa o zębie i o dwóch obywatelach.' },
  { id: 'wal', text: 'Rolnik nie naprawił wału nad kanałem. Woda zalała pole sąsiada i zniszczyła jęczmień.', law: 'p53', look: 'Szukaj prawa o wale i wodzie z kanału.' },
  { id: 'niewolnik', text: 'Obywatel uderzył niewolnika kupca i wybił mu oko.', law: 'p199', victim: 'niewolnik', harm: 'oko', look: 'Kto został skrzywdzony? Szukaj prawa o niewolniku.' },
  { id: 'oko', text: 'Obywatel wybił oko innemu obywatelowi.', law: 'p196', victim: 'obywatel', harm: 'oko', look: 'Szukaj prawa o oku i o dwóch obywatelach.' },
];

export function judgeCase(caseId: string, lawId: string): { ok: boolean; text: string } {
  const c = CASES.find((x) => x.id === caseId)!;
  const law = LAWS.find((l) => l.id === lawId)!;
  if (c.law === lawId) return { ok: true, text: `Prawo ${law.no}: ${law.verdict}` };
  return { ok: false, text: `Prawo ${law.no} mówi o czymś innym. ${c.look}` };
}

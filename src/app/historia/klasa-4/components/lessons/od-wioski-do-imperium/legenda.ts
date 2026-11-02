/**
 * Blok 1 — Romulus i Remus, sprawdzam (F-V.1-01, F-V.1-02). Legenda opowiedziana
 * własnymi słowami, zdanie po zdaniu. Dziecko zaznacza: „da się sprawdzić” albo
 * „tylko legenda”, potem wysuwa szufladę z wykopaliskami na Palatynie, która
 * stempluje każde zdanie. Wykopaliska: dołki po słupach chat z epoki żelaza
 * (VIII w. p.n.e.) na Palatynie, odkryte w XX w.; ślady muru u stóp Palatynu
 * datowane na ok. 730–720 p.n.e. (A. Carandini, wykopaliska 1985–1988).
 */

export type Mark = 'sprawdzic' | 'legenda';

export interface Sentence {
  id: string;
  text: string;
  truth: Mark;
  /** Co mówi szuflada z dowodami. */
  evidence: string;
}

export const LEGENDA: Sentence[] = [
  {
    id: 'mars',
    text: 'Bliźnięta Romulus i Remus były synami boga wojny, Marsa.',
    truth: 'legenda',
    evidence: 'Boga nie da się wykopać ani zmierzyć.',
  },
  {
    id: 'tyber',
    text: 'Okrutny król kazał wrzucić niemowlęta do Tybru.',
    truth: 'legenda',
    evidence: 'Po rozkazie sprzed prawie trzech tysięcy lat nic nie zostało w ziemi.',
  },
  {
    id: 'wilczyca',
    text: 'Bliźnięta wykarmiła wilczyca.',
    truth: 'legenda',
    evidence: 'Takiego zdarzenia żadna łopata nie potwierdzi — to cud z opowieści.',
  },
  {
    id: 'chaty',
    text: 'Chłopców wychował pasterz, który mieszkał w chacie na wzgórzu Palatyn.',
    truth: 'sprawdzic',
    evidence: 'W skale Palatynu archeolodzy znaleźli dołki po słupach chat z VIII wieku p.n.e. Chaty pasterzy naprawdę tam stały.',
  },
  {
    id: 'wiek',
    text: 'Miasto na Palatynie powstało w VIII wieku p.n.e.',
    truth: 'sprawdzic',
    evidence: 'Najstarsze chaty i resztki muru u stóp Palatynu pochodzą z VIII wieku p.n.e. Wiek się zgadza — choć roku 753 nikt nie wykopie.',
  },
  {
    id: 'nazwa',
    text: 'Romulus nazwał miasto od swojego imienia — Roma.',
    truth: 'legenda',
    evidence: 'Historycy nie są pewni. Może było odwrotnie: imię Romulus wymyślono później, od nazwy miasta.',
  },
];

export interface LegendaScore {
  agree: number;
  total: number;
  wrong: Sentence[];
}

export function scoreMarks(marks: Record<string, Mark | undefined>): LegendaScore {
  const wrong = LEGENDA.filter((s) => marks[s.id] !== s.truth);
  return { agree: LEGENDA.length - wrong.length, total: LEGENDA.length, wrong };
}

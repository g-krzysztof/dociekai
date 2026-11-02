/**
 * Blok 2 — kto decyduje o wojnie (F-V.1-04, F-V.1-05, F-V.1-07). Czysta logika.
 *
 * Ta sama sprawa przechodzi przez trzy ustroje. W republice droga jest
 * prawdziwa: senat wydaje opinię, konsul wnosi wniosek pod głosowanie,
 * zgromadzenie (comitia centuriata) głosuje. W 200 r. p.n.e. zgromadzenie
 * najpierw ODRZUCIŁO wojnę z Macedonią — zmęczone wojną z Hannibalem — i konsul
 * musiał przyjść z wnioskiem drugi raz (Liwiusz, „Dzieje Rzymu” XXXI 6–8,
 * omówienie). Dlatego pierwsze głosowanie w symulacji kończy się „nie”.
 */

export type RegimeId = 'krolestwo' | 'republika' | 'cesarstwo';
export type NodeId = 'krol' | 'senat' | 'lud' | 'konsulowie' | 'zgromadzenie' | 'cesarz';

export interface Regime {
  id: RegimeId;
  name: string;
  when: string;
  nodes: { id: NodeId; name: string; role: string }[];
}

export const REGIMES: Regime[] = [
  {
    id: 'krolestwo',
    name: 'Królestwo',
    when: 'do 509 p.n.e.',
    nodes: [
      { id: 'senat', name: 'Senat', role: 'Rada starszych z najważniejszych rodów. Doradza królowi.' },
      { id: 'lud', name: 'Lud', role: 'Mieszkańcy Rzymu. Słuchają rozkazów.' },
      { id: 'krol', name: 'Król', role: 'Rządzi do końca życia. Sam postanawia o wojnie i pokoju.' },
    ],
  },
  {
    id: 'republika',
    name: 'Republika',
    when: '509–27 p.n.e.',
    nodes: [
      { id: 'zgromadzenie', name: 'Zgromadzenie ludowe', role: 'Obywatele głosują „tak” albo „nie” nad wnioskiem, który przyniesie konsul.' },
      { id: 'senat', name: 'Senat', role: 'Kilkuset byłych urzędników z możnych rodów. Każdą wielką sprawę zaczyna od narady i opinii.' },
      { id: 'konsulowie', name: 'Dwaj konsulowie', role: 'Wybierani tylko na rok. Z opinią senatu wnoszą wniosek pod głosowanie, a potem dowodzą armią.' },
    ],
  },
  {
    id: 'cesarstwo',
    name: 'Cesarstwo',
    when: 'od 27 p.n.e.',
    nodes: [
      { id: 'senat', name: 'Senat', role: 'Wciąż obraduje w togach — ale przytakuje temu, co postanowi cesarz.' },
      { id: 'zgromadzenie', name: 'Zgromadzenie ludowe', role: 'Prawie przestaje się zbierać. Cesarz go nie potrzebuje.' },
      { id: 'cesarz', name: 'Cesarz', role: 'Dowodzi wojskiem, wybiera urzędników i sam postanawia o wojnie.' },
    ],
  },
];

export interface Trip {
  /** Węzły, przez które żeton już przeszedł. */
  path: NodeId[];
  /** Ile głosowań zgromadzenia się odbyło (republika). */
  votes: number;
  decided: boolean;
}

export const startTrip = (): Trip => ({ path: [], votes: 0, decided: false });

export type StepResult =
  | { ok: true; trip: Trip; say: string }
  | { ok: false; say: string };

/** Krok żetonu do węzła `to` w ustroju `regime`. */
export function step(regime: RegimeId, trip: Trip, to: NodeId): StepResult {
  if (trip.decided) return { ok: false, say: 'Decyzja już zapadła.' };
  const last = trip.path[trip.path.length - 1];

  if (regime === 'krolestwo') {
    if (to === 'krol') return { ok: true, trip: { ...trip, path: [...trip.path, to], decided: true }, say: 'Król postanawia: wojna! Jeden człowiek, jedna decyzja.' };
    if (to === 'senat') return { ok: false, say: 'Senat może tylko doradzić. O wojnie postanawia król.' };
    return { ok: false, say: 'Zwykli mieszkańcy nie mają w tej sprawie nic do powiedzenia.' };
  }

  if (regime === 'cesarstwo') {
    if (to === 'cesarz') return { ok: true, trip: { ...trip, path: [...trip.path, to], decided: true }, say: 'Cesarz postanawia: wojna! Senat przyklaskuje.' };
    if (to === 'senat') return { ok: false, say: 'Senat przytaknie — ale dopiero temu, co postanowi cesarz. Sam wojny nie wypowie.' };
    return { ok: false, say: 'Zgromadzenie ludowe już się w tej sprawie nie zbiera.' };
  }

  // Republika: senat → konsulowie → zgromadzenie (a po odrzuceniu: konsulowie → zgromadzenie).
  if (to === 'senat') {
    if (trip.path.length === 0) return { ok: true, trip: { ...trip, path: ['senat'] }, say: 'Senat naradza się i wydaje opinię: wojna jest potrzebna. Ale senat sam wojny nie wypowiada.' };
    return { ok: false, say: 'Senat już wydał opinię. Teraz ktoś musi wnieść sprawę pod głosowanie.' };
  }
  if (to === 'konsulowie') {
    if (last === 'senat' || last === 'zgromadzenie') {
      return { ok: true, trip: { ...trip, path: [...trip.path, to] }, say: last === 'senat' ? 'Konsul bierze opinię senatu i zwołuje zgromadzenie.' : 'Konsul przemawia jeszcze raz: przypomina, że wróg zaatakuje Italię, jeśli Rzym nie uderzy pierwszy.' };
    }
    return { ok: false, say: 'Konsul nie wniesie sprawy wojny bez narady i opinii senatu.' };
  }
  if (to === 'zgromadzenie') {
    if (last !== 'konsulowie') return { ok: false, say: 'Zgromadzenie głosuje tylko nad wnioskiem, który przyniesie konsul.' };
    const votes = trip.votes + 1;
    if (votes === 1) {
      return { ok: true, trip: { ...trip, path: [...trip.path, to], votes }, say: 'Zgromadzenie głosuje: NIE! Ludzie są zmęczeni długą wojną. Sprawa utknęła — co teraz?' };
    }
    return { ok: true, trip: { ...trip, path: [...trip.path, to], votes, decided: true }, say: 'Zgromadzenie głosuje drugi raz: TAK. Wojna wypowiedziana — po decyzji wielu ludzi.' };
  }
  return { ok: false, say: 'W republice nie ma króla.' };
}

/**
 * Blok 1 L4 — „Domino poranka”: dane i sędzia, bez Reacta.
 *
 * Łańcuch zwykłego poranka (postać wymyślona). Każda kostka to zdarzenie,
 * które **wynika z poprzedniego** i **prowadzi do następnego**. W drugiej
 * rundzie jednej kostki brakuje; dziecko wstawia jedną z trzech. Sędzia nie
 * porównuje z kluczem, tylko zadaje te same dwa pytania, które dziecko może
 * zadać samo: czy to mogło wyniknąć z kostki przed luką? czy to mogło
 * spowodować kostkę za luką? Każdy kandydat niesie odpowiedź na oba pytania
 * — odrzut nazywa, które ogniwo pęka.
 */

export interface DominoTile {
  id: string;
  /** Godzina na kostce — porządek w czasie widać bez czytania. */
  time: string;
  text: string;
}

export const MORNING_CHAIN: DominoTile[] = [
  { id: 'telefon', time: '22:40', text: 'Wieczorem Ola nie podłączyła telefonu do ładowarki.' },
  { id: 'budzik', time: '6:30', text: 'Telefon się rozładował i budzik nie zadzwonił.' },
  { id: 'zaspala', time: '7:10', text: 'Ola obudziła się o 40 minut za późno.' },
  { id: 'autobus', time: '7:35', text: 'Autobus odjechał, zanim dobiegła na przystanek.' },
  { id: 'spoznienie', time: '8:15', text: 'Spóźniła się na pierwszą lekcję — na sprawdzian.' },
  { id: 'przerwa', time: '9:00', text: 'Sprawdzian dopisała w pośpiechu na przerwie.' },
];

/** Która kostka znika w drugiej rundzie. */
export const GAP_INDEX = 3;

export interface GapCandidate {
  id: string;
  time: string;
  text: string;
  /** Czy mogło wyniknąć z kostki przed luką? */
  followsPrev: boolean;
  /** Czy mogło spowodować kostkę za luką? */
  causesNext: boolean;
  /** Wyjaśnienie, które pokazuje się, gdy łańcuch stanie (albo ruszy). */
  why: string;
}

export const GAP_CANDIDATES: GapCandidate[] = [
  {
    id: 'deszcz',
    time: '3:00',
    text: 'W nocy padał deszcz.',
    followsPrev: false,
    causesNext: false,
    why: 'Deszcz padał w nocy — zanim Ola zaspała. Coś, co zdarzyło się wcześniej, nie może być skutkiem zaspania. I od deszczu nikt nie spóźnia się na lekcję, jeśli wyszedł na czas.',
  },
  {
    id: 'autobus',
    time: '7:35',
    text: MORNING_CHAIN[GAP_INDEX].text,
    followsPrev: true,
    causesNext: true,
    why: 'Zaspała, więc nie zdążyła na autobus. Nie zdążyła na autobus, więc spóźniła się na lekcję. Obie strony kostki pasują.',
  },
  {
    id: 'plecak',
    time: '7:20',
    text: 'Mama zapakowała Oli kanapkę do plecaka.',
    followsPrev: false,
    causesNext: false,
    why: 'Kanapka nie wynika z zaspania (mama pakuje ją codziennie) i nie spóźnia nikogo na lekcję. Ta kostka stoi obok łańcucha, a nie w nim.',
  },
];

export type GapVerdict =
  | { ok: true; why: string }
  | { ok: false; breaksAt: 'prev' | 'next' | 'both'; why: string };

/** Czy wstawiona kostka podtrzyma przewracanie? */
export function judgeGap(candidateId: string): GapVerdict {
  const c = GAP_CANDIDATES.find((x) => x.id === candidateId);
  if (!c) return { ok: false, breaksAt: 'both', why: 'Nie ma takiej kostki.' };
  if (c.followsPrev && c.causesNext) return { ok: true, why: c.why };
  const breaksAt = !c.followsPrev && !c.causesNext ? 'both' : !c.followsPrev ? 'prev' : 'next';
  return { ok: false, breaksAt, why: c.why };
}

/**
 * Do którego miejsca przewróci się łańcuch z wstawioną kostką: indeks
 * ostatniej kostki, która upadnie. Gdy wstawiona kostka nie wynika
 * z poprzedniej, staje już ona sama (upadnie tylko to, co przed luką);
 * gdy wynika, ale nie prowadzi dalej — upadnie i ona, a stanie następna.
 */
export function fallsUntil(candidateId: string | null): number {
  if (!candidateId) return GAP_INDEX - 1;
  const c = GAP_CANDIDATES.find((x) => x.id === candidateId);
  if (!c || !c.followsPrev) return GAP_INDEX - 1;
  if (!c.causesNext) return GAP_INDEX;
  return MORNING_CHAIN.length - 1;
}

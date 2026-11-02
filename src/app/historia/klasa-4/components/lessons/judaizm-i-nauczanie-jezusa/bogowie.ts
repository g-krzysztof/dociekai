/**
 * Blok 2 — Wielu bogów czy jeden? Dziecko zanosi sprawy z życia do domu
 * Rzymianina Marka (półka z posągami bogów — sędzią jest atrybut boga, znany
 * z L24–L25) i do domu Żyda Judy z Jerozolimy (jeden Bóg, bez posągu).
 * Na koniec rzymski urzędnik przynosi posąg cesarza: na półce Marka mieści się,
 * u Judy odbija się. Politeizm i monoteizm przeżyte jako różnica w odpowiedzi.
 */

export type GodId = 'jowisz' | 'neptun' | 'ceres' | 'eskulap' | 'merkury';

export interface RomanGod {
  id: GodId;
  name: string;
  /** Imię greckie — z L24/L25. */
  greek: string;
  attribute: string;
  /** Zdanie o atrybucie — do odrzutu. */
  sign: string;
  /** Czym się opiekował — pokazywane dopiero po trafieniu albo w odrzucie. */
  care: string;
}

export const GODS: readonly RomanGod[] = [
  { id: 'jowisz', name: 'Jowisz', greek: 'Zeus', attribute: 'piorun', sign: 'Jowisz trzyma piorun', care: 'niebo, burze i pioruny' },
  { id: 'neptun', name: 'Neptun', greek: 'Posejdon', attribute: 'trójząb', sign: 'Neptun trzyma trójząb', care: 'morze i żeglarze' },
  { id: 'ceres', name: 'Ceres', greek: 'Demeter', attribute: 'kłosy zboża', sign: 'Ceres trzyma kłosy zboża', care: 'zboże i urodzaj' },
  { id: 'eskulap', name: 'Eskulap', greek: 'Asklepios', attribute: 'laska z wężem', sign: 'Eskulap wspiera się na lasce z wężem — ten znak do dziś widać na karetkach', care: 'zdrowie i leczenie' },
  { id: 'merkury', name: 'Merkury', greek: 'Hermes', attribute: 'skrzydlate sandały', sign: 'Merkury nosi skrzydlate sandały — to najszybszy z bogów', care: 'podróżni i kupcy' },
];

export interface Matter {
  id: string;
  text: string;
  god: GodId;
}

export const MATTERS: readonly Matter[] = [
  { id: 'burza', text: 'Nad domem szaleje burza, pioruny biją coraz bliżej.', god: 'jowisz' },
  { id: 'statek', text: 'Syn płynie statkiem z ładunkiem przez morze.', god: 'neptun' },
  { id: 'susza', text: 'Od miesiąca nie pada, a zboże na polu usycha.', god: 'ceres' },
  { id: 'goraczka', text: 'Córka od trzech dni ma gorączkę.', god: 'eskulap' },
  { id: 'targ', text: 'Ojciec wyrusza z towarem na targ w dalekim mieście.', god: 'merkury' },
];

export type MarekVerdict = { ok: true; god: RomanGod } | { ok: false; message: string };

/** Do którego boga z półki Marek zaniósłby tę sprawę — sędzią jest to, czym bóg się opiekował. */
export function judgeMarek(matterId: string, godId: GodId): MarekVerdict {
  const matter = MATTERS.find((m) => m.id === matterId);
  const god = GODS.find((g) => g.id === godId);
  if (!matter || !god) return { ok: false, message: 'Przeciągnij sprawę na jeden z posągów.' };
  if (matter.god === god.id) return { ok: true, god };
  return {
    ok: false,
    message: `${god.sign}. Opiekuje się tym: ${god.care}. Ta sprawa potrzebuje kogoś innego.`,
  };
}

/** Po ilu sprawach zaniesionych do Judy reszta leci sama — reguła jest już widoczna. */
export const JUDA_BY_HAND = 2;

/** Ilu różnych adresatów modlitw zebrało się w domu (dla tabeli na końcu bloku). */
export function addressees(assignments: Readonly<Record<string, string>>): number {
  return new Set(Object.values(assignments)).size;
}

export type EmperorTarget = 'marek' | 'juda';

export const EMPEROR_REPLY: Record<EmperorTarget, string> = {
  marek:
    'Marek zapala kadzidło przed posągiem cesarza. Dla niego to nic dziwnego: jeszcze jeden bóg na półce, a cesarzowi trzeba okazać szacunek.',
  juda:
    'Juda odmawia: „Bóg jest jeden. Nie złożę ofiary posągowi człowieka”. Posąg nie ma u niego miejsca.',
};

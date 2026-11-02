/**
 * Blok 4 — rozmowa w stylu Sokratesa (F-IV.3-05). Czysta logika, bez Reacta.
 *
 * Sokrates niczego nie ocenia sam. Dziecko podaje definicję odwagi i mówi,
 * czy kolejne osoby są odważne. Sędzią jest **zgodność dziecka z samym sobą**:
 * gdy definicja mówi co innego niż jego własna odpowiedź, Sokrates pokazuje
 * sprzeczność (metoda elenchos). Klucza autora nie ma — każda odpowiedź
 * „tak/nie” jest dopuszczalna, sprawdzana jest tylko spójność.
 */

export interface Definition {
  id: 'brak-strachu' | 'niebezpieczne' | 'mimo-strachu';
  text: string;
}

export interface Case {
  id: string;
  story: string;
  /** „Ewa jest odważna” / „Ewa nie jest odważna”. */
  yes: string;
  no: string;
  afraid: boolean;
  danger: boolean;
  right: boolean;
}

export const DEFINITIONS: Definition[] = [
  { id: 'brak-strachu', text: 'Odwaga to brak strachu.' },
  { id: 'niebezpieczne', text: 'Odwaga to robienie niebezpiecznych rzeczy.' },
  { id: 'mimo-strachu', text: 'Odwaga to robienie tego, co słuszne, mimo strachu.' },
];

export const CASES: Case[] = [
  {
    id: 'ewa',
    story: 'Strażaczka Ewa boi się ognia. Mimo to wchodzi do płonącego domu, bo w środku zostało dziecko.',
    yes: 'Ewa jest odważna',
    no: 'Ewa nie jest odważna',
    afraid: true,
    danger: true,
    right: true,
  },
  {
    id: 'kuba',
    story: 'Kuba skacze rowerem z dachu garażu, żeby nagrać film dla kolegów. Wcale się nie boi.',
    yes: 'Kuba jest odważny',
    no: 'Kuba nie jest odważny',
    afraid: false,
    danger: true,
    right: false,
  },
  {
    id: 'ola',
    story: 'Ola bardzo się boi, ale idzie do pani i mówi, że to ona zbiła wazon, a nie jej kolega.',
    yes: 'Ola jest odważna',
    no: 'Ola nie jest odważna',
    afraid: true,
    danger: false,
    right: true,
  },
  {
    id: 'stas',
    story: 'Czteroletni Staś nie boi się wielkiego psa sąsiadów i chce go pogłaskać. Nie wie, że ten pies gryzie.',
    yes: 'Staś jest odważny',
    no: 'Staś nie jest odważny',
    afraid: false,
    danger: true,
    right: false,
  },
];

/** Co mówi definicja o danej osobie. */
export function definitionSays(def: Definition['id'], c: Case): boolean {
  if (def === 'brak-strachu') return !c.afraid;
  if (def === 'niebezpieczne') return c.danger;
  return c.afraid && c.right;
}

function reason(def: Definition['id'], c: Case): string {
  if (def === 'brak-strachu') return c.afraid ? 'bo się boi' : 'bo się nie boi';
  if (def === 'niebezpieczne') return c.danger ? 'bo robi coś niebezpiecznego' : 'bo nie robi nic niebezpiecznego';
  if (!c.afraid) return 'bo się nie boi';
  return c.right ? 'bo robi coś słusznego mimo strachu' : 'bo to, co robi, nie jest słuszne';
}

export type Answers = Record<string, boolean>;

/** Pierwsza osoba, przy której definicja przeczy odpowiedzi dziecka, albo `null`. */
export function firstConflict(def: Definition['id'], answers: Answers): Case | null {
  return CASES.find((c) => answers[c.id] !== undefined && definitionSays(def, c) !== answers[c.id]) ?? null;
}

/** Czy któraś z definicji zgadza się ze wszystkimi odpowiedziami. */
export function anyConsistent(answers: Answers): boolean {
  return DEFINITIONS.some((d) => firstConflict(d.id, answers) === null);
}

/** Pytanie Sokratesa, które pokazuje sprzeczność. */
export function socratesObjection(def: Definition, c: Case, answer: boolean): string {
  const says = definitionSays(def.id, c);
  return `Mówisz, że ${answer ? c.yes : c.no}. Ale twoja definicja brzmi: „${def.text}” Według niej ${says ? c.yes : c.no}, ${reason(def.id, c)}. Czy to możliwe, że jedno i drugie jest prawdą?`;
}

/**
 * Blok 1 — „Stryj czy wuj?” (haczyk) — dane i sędzia, bez Reacta.
 *
 * Zdjęcie z rodzinnego spotkania wymyślonego Franka. Sześć osób mówi, kim są
 * **dla Franka** — i z tej jednej wypowiedzi wynika, jak się nazywają
 * (F-I.3-02, F-I.3-12). Nie ma klucza autora: kto jest „stryjem”, rozstrzyga
 * reguła słowa (brat TATY), którą dziecko ma przed oczami po stuknięciu
 * tabliczki, i zdanie, które osoba wypowiada.
 */

export type KinId = 'stryj' | 'wuj' | 'ciotka' | 'dziadek' | 'prababcia' | 'kuzyn';

export interface KinTerm {
  id: KinId;
  /** Napis na tabliczce. */
  label: string;
  /** Reguła słowa — widać ją po stuknięciu tabliczki. */
  rule: string;
}

export const KIN_TERMS: KinTerm[] = [
  { id: 'stryj', label: 'stryj', rule: 'Stryj to brat taty.' },
  { id: 'wuj', label: 'wuj', rule: 'Wuj to brat mamy.' },
  { id: 'ciotka', label: 'ciotka', rule: 'Ciotka to siostra taty albo mamy.' },
  { id: 'dziadek', label: 'dziadek', rule: 'Dziadek to tata taty albo mamy.' },
  { id: 'prababcia', label: 'prababcia', rule: 'Prababcia to mama babci albo dziadka.' },
  { id: 'kuzyn', label: 'kuzyn / kuzynka', rule: 'Kuzyn to dziecko brata albo siostry taty lub mamy.' },
];

export interface KinPerson {
  id: KinId;
  /** Numer na zdjęciu. */
  n: number;
  /** To, co osoba mówi do Franka. Odpowiedź wynika wyłącznie z tego zdania. */
  says: string;
  /** Odpowiedź (tabliczka, która pasuje). */
  answer: KinId;
  /** Dlaczego — pokazywane, gdy dziecko postawi inną tabliczkę. */
  why: string;
}

/** Kolejność wypowiedzi jest wymieszana, żeby kolejność tabliczek nie podpowiadała. */
export const KIN_PEOPLE: KinPerson[] = [
  {
    id: 'wuj',
    n: 1,
    says: 'Jestem bratem mamy Franka.',
    answer: 'wuj',
    why: 'brat mamy',
  },
  {
    id: 'kuzyn',
    n: 2,
    says: 'Mój tata jest bratem taty Franka.',
    answer: 'kuzyn',
    why: 'dziecko brata taty Franka (to nie brat taty — to jego bratanek albo bratanica)',
  },
  {
    id: 'prababcia',
    n: 3,
    says: 'Jestem mamą dziadka Franka.',
    answer: 'prababcia',
    why: 'mama dziadka Franka',
  },
  {
    id: 'stryj',
    n: 4,
    says: 'Jestem bratem taty Franka.',
    answer: 'stryj',
    why: 'brat taty',
  },
  {
    id: 'dziadek',
    n: 5,
    says: 'Jestem tatą mamy Franka.',
    answer: 'dziadek',
    why: 'tata mamy Franka',
  },
  {
    id: 'ciotka',
    n: 6,
    says: 'Jestem siostrą taty Franka.',
    answer: 'ciotka',
    why: 'siostra taty',
  },
];

export interface KinVerdict {
  ok: boolean;
  /** Konkret dla dziecka, gdy pomyłka: reguła wybranej tabliczki kontra to, co mówi osoba. */
  note?: string;
}

export function judgeKin(person: KinPerson, term: KinId): KinVerdict {
  if (person.answer === term) return { ok: true };
  const chosen = KIN_TERMS.find((t) => t.id === term)!;
  return {
    ok: false,
    note: `${chosen.rule} A osoba nr ${person.n} mówi: „${person.says}” — czyli to ${person.why}.`,
  };
}

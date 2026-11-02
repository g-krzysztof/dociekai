/**
 * Silnik `source-desk` — **paszport źródła** (kto, kiedy, po co): dane
 * i sędzia, bez Reacta. Powstał w L2 (moneta Chrobrego), wypromowany przy
 * drugim konsumencie (L3, kronika Kadłubka).
 *
 * Lekcja podaje pola (pytania) i bank karteczek; każda karteczka pasuje do
 * jednego pola albo do żadnego (dystraktor z powodem wziętym ze źródła, które
 * dziecko ma przed oczami — nie z klucza autora).
 */

export interface PassportFieldDef<F extends string = string> {
  id: F;
  question: string;
}

export interface PassportCard<F extends string = string> {
  id: string;
  text: string;
  /** Pole, do którego karta pasuje; null = dystraktor (nie pasuje nigdzie). */
  field: F | null;
  /** Dlaczego karta tu nie pasuje — konkret ze źródła. */
  whyNot?: string;
}

export function passportCard<F extends string>(bank: PassportCard<F>[], id: string): PassportCard<F> {
  const card = bank.find((c) => c.id === id);
  if (!card) throw new Error(`Nie ma karty paszportu „${id}”`);
  return card;
}

/** Sędzia paszportu: karta pasuje do pola, gdy jej `field` się zgadza. */
export function judgePassportCard<F extends string>(
  bank: PassportCard<F>[],
  cardId: string,
  field: F
): { ok: boolean; whyNot?: string } {
  const card = passportCard(bank, cardId);
  if (card.field === field) return { ok: true };
  return { ok: false, whyNot: card.whyNot ?? 'Ta karteczka tu nie pasuje — sprawdź pozostałe pola.' };
}

/** Sprawdza cały paszport naraz; zwraca błędy per pole (puste pole też jest błędem). */
export function judgePassport<F extends string>(
  fields: PassportFieldDef<F>[],
  bank: PassportCard<F>[],
  placed: Partial<Record<F, string>>
): { ok: boolean; errors: Partial<Record<F, string>> } {
  const errors: Partial<Record<F, string>> = {};
  for (const { id } of fields) {
    const cardId = placed[id];
    if (!cardId) {
      errors[id] = 'To pole jest jeszcze puste — wybierz karteczkę z banku.';
      continue;
    }
    const verdict = judgePassportCard(bank, cardId, id);
    if (!verdict.ok) errors[id] = verdict.whyNot;
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

/**
 * L9, blok 2 „Pieczęć obietnicy” — rola każdego wersu 1. zwrotki „Roty”.
 *
 * Reguła podana dziecku z góry i sprawdzalna na tekście: **obietnica mówi, co
 * zrobimy — albo czego nie zrobimy i na co nie pozwolimy.** W każdym
 * wersie-obietnicy stoi czasownik w liczbie mnogiej, w czasie, który jeszcze
 * nie nastąpił (`rzucim`, `damy`) — to on jest dowodem i on się podświetla.
 * Wers, który opisuje, mówi, kim jesteśmy; ostatni wers prosi — tak dawniej
 * kończono przysięgi (mówimy to neutralnie, bez komentarza wyznaniowego).
 */

export type VerseRole = 'obietnica' | 'opis' | 'prosba';

export interface VerseInfo {
  role: VerseRole;
  /** Id wyrazu, który robi obietnicę (czasownik z „my”). */
  verb?: string;
  /** Po dzisiejszemu — pokazywane pod przypieczętowanym wersem. */
  today?: string;
  /** Co robi wers, który nie obiecuje — pokazywane, gdy pieczęć się rozmaże. */
  does?: string;
}

/** Klucz: id wersu z korpusu `ROTA` (`v0`…`v6`). */
export const ROTA_ROLES: Record<string, VerseInfo> = {
  v0: { role: 'obietnica', verb: 'my-r1', today: 'Nie porzucimy ziemi, z której pochodzimy.' },
  v1: { role: 'obietnica', verb: 'my-r3', today: 'Nie pozwolimy pogrzebać naszego języka.' },
  v2: { role: 'opis', does: 'Ten wers niczego nie obiecuje — mówi, kim jesteśmy: polskim narodem.' },
  v3: { role: 'opis', does: 'Ten wers mówi, skąd się wywodzimy: od królów z rodu Piastów. Opis, nie obietnica.' },
  v4: { role: 'obietnica', verb: 'my-r5', today: 'Nie pozwolimy, żeby wróg nas dręczył.' },
  v5: {
    role: 'prosba',
    does: 'Ten wers nie obiecuje, tylko prosi o pomoc. Takimi słowami dawniej kończono przysięgi.',
  },
  v6: {
    role: 'prosba',
    does: 'Ten sam wers jeszcze raz — prośba o pomoc, którą kończono przysięgi. Nie obietnica.',
  },
};

export const PROMISE_VERSES = Object.keys(ROTA_ROLES).filter((v) => ROTA_ROLES[v].role === 'obietnica');

export type SealResult = { ok: true; info: VerseInfo } | { ok: false; info: VerseInfo };

export function seal(verseId: string): SealResult | null {
  const info = ROTA_ROLES[verseId];
  if (!info) return null;
  return info.role === 'obietnica' ? { ok: true, info } : { ok: false, info };
}

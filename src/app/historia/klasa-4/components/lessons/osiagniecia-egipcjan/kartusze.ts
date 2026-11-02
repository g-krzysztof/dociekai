/**
 * L21 blok `kartusze` — metoda Champolliona (1822) na dwóch imionach.
 *
 * Znaki to prawdziwe zapisy z kartuszy (Unicode, lista Gardinera):
 * Ptolemeusz z Kamienia z Rosetty (p-t-wA-l-m-ii-s), Kleopatra z obelisku
 * z File (q-l-i-wA-p-A-d-r-A). Na końcu kartusza Kleopatry stoją jeszcze
 * znak „t” i jajo — oznaczają imię kobiety; pomijamy je i mówimy o tym.
 * Źródło: Wikipedia — „Jean-François Champollion”, „Kamień z Rosetty”,
 * „Obelisk z File”; Gardiner, „Egyptian Grammar” (lista znaków).
 */

import { plural } from '@/lib/plural';

export type CartoucheId = 'pt' | 'kl';

export interface Sign {
  /** Znak hieroglificzny (Unicode). */
  glyph: string;
  /** Kod Gardinera — do opisu, nie do sędziego. */
  code: string;
  /** Głoska, którą znak oddaje w tym imieniu (litera z imienia greckiego). */
  sound: string;
}

/** Ptolemeusz — po grecku ΠΤΟΛΕΜΑΙΟΣ, w kartuszu 7 znaków: P T O L M I S. */
export const PTOLEMEUSZ: Sign[] = [
  { glyph: '\u{132AA}', code: 'Q3', sound: 'P' },
  { glyph: '\u{133CF}', code: 'X1', sound: 'T' },
  { glyph: '\u{1336F}', code: 'V4', sound: 'O' },
  { glyph: '\u{130ED}', code: 'E23', sound: 'L' },
  { glyph: '\u{1341D}', code: 'Aa15', sound: 'M' },
  { glyph: '\u{131CC}', code: 'M17a', sound: 'I' },
  { glyph: '\u{132F4}', code: 'S29', sound: 'S' },
];

/** Kleopatra — po grecku ΚΛΕΟΠΑΤΡΑ, w kartuszu 9 znaków: K L E O P A T R A. */
export const KLEOPATRA: Sign[] = [
  { glyph: '\u{1320E}', code: 'N29', sound: 'K' },
  { glyph: '\u{130ED}', code: 'E23', sound: 'L' },
  { glyph: '\u{131CB}', code: 'M17', sound: 'E' },
  { glyph: '\u{1336F}', code: 'V4', sound: 'O' },
  { glyph: '\u{132AA}', code: 'Q3', sound: 'P' },
  { glyph: '\u{1313F}', code: 'G1', sound: 'A' },
  { glyph: '\u{130A7}', code: 'D46', sound: 'T' },
  { glyph: '\u{1308B}', code: 'D21', sound: 'R' },
  { glyph: '\u{1313F}', code: 'G1', sound: 'A' },
];

export const CARTOUCHES: Record<CartoucheId, Sign[]> = { pt: PTOLEMEUSZ, kl: KLEOPATRA };
export const NAME_LETTERS: Record<CartoucheId, string[]> = {
  pt: PTOLEMEUSZ.map((s) => s.sound),
  kl: KLEOPATRA.map((s) => s.sound),
};

export interface SignRef {
  c: CartoucheId;
  i: number;
}

export const sameRef = (a: SignRef, b: SignRef) => a.c === b.c && a.i === b.i;

/** Para znaków połączona nicią — zawsze zapisana jako [pt, kl]. */
export type Thread = [number, number];

/** Wszystkie pary, które dziecko może połączyć: ten sam znak w obu kartuszach. */
export function allThreads(): Thread[] {
  const out: Thread[] = [];
  PTOLEMEUSZ.forEach((p, i) =>
    KLEOPATRA.forEach((k, j) => {
      if (p.glyph === k.glyph) out.push([i, j]);
    }),
  );
  return out;
}

export type ThreadVerdict =
  | { ok: true; thread: Thread }
  | { ok: false; reason: 'ten-sam-kartusz' | 'rozne-znaki' | 'juz-jest'; text: string };

/** Sędzia nici: wolno łączyć tylko ten sam znak — kształt jest dowodem. */
export function judgeThread(a: SignRef, b: SignRef, existing: Thread[]): ThreadVerdict {
  if (a.c === b.c) {
    return { ok: false, reason: 'ten-sam-kartusz', text: 'Nić łączy dwa różne kartusze — górny z dolnym.' };
  }
  const pt = a.c === 'pt' ? a.i : b.i;
  const kl = a.c === 'kl' ? a.i : b.i;
  const p = PTOLEMEUSZ[pt];
  const k = KLEOPATRA[kl];
  if (p.glyph !== k.glyph) {
    return {
      ok: false,
      reason: 'rozne-znaki',
      text: `To dwa różne znaki — przyjrzyj się kształtom. Szukasz w drugim kartuszu dokładnie tego samego obrazka.`,
    };
  }
  if (existing.some(([x, y]) => x === pt && y === kl)) {
    return { ok: false, reason: 'juz-jest', text: 'Te dwa znaki są już połączone.' };
  }
  return { ok: true, thread: [pt, kl] };
}

/** Litery wspólne obu imion — kandydaci na znaki połączone nicią. */
export const SHARED_LETTERS = ['P', 'T', 'O', 'L'];

export type LetterVerdict = { ok: true } | { ok: false; text: string };

/**
 * Sędzia litery dla nici: znak stoi na i-tym miejscu kartusza Ptolemeusza
 * i na j-tym Kleopatry — litera musi stać na tych samych miejscach w obu
 * imionach greckich. Dziecko stosuje regułę, sędzia ją tylko sprawdza.
 */
export function judgeLetter([pt, kl]: Thread, letter: string): LetterVerdict {
  const inPt = NAME_LETTERS.pt[pt];
  const inKl = NAME_LETTERS.kl[kl];
  if (inPt === letter && inKl === letter) return { ok: true };
  if (inPt !== letter) {
    return {
      ok: false,
      text: `Ten znak stoi na ${pt + 1}. miejscu u Ptolemeusza — a ${pt + 1}. litera imienia PTOLMIS to ${inPt}, nie ${letter}.`,
    };
  }
  return {
    ok: false,
    text: `U Ptolemeusza się zgadza, ale u Kleopatry znak stoi na ${kl + 1}. miejscu — tam jest ${inKl}, nie ${letter}.`,
  };
}

/** T jest w obu imionach, a znaki są różne: chleb (X1) i dłoń (D46). */
export const T_POS: Record<CartoucheId, number> = { pt: 1, kl: 6 };

/** Znak, który powtarza się w jednym kartuszu: sęp (A) w Kleopatrze, miejsca 6 i 9. */
export const REPEAT_POS = [5, 8];

/** Alfabet zebrany z obu kartuszy: znak → głoska (T ma dwa znaki). */
export function collectedAlphabet(): Map<string, string> {
  const m = new Map<string, string>();
  for (const s of [...PTOLEMEUSZ, ...KLEOPATRA]) {
    if (!m.has(s.glyph)) m.set(s.glyph, s.sound);
  }
  return m;
}

/**
 * Trzeci kartusz: Aleksander (gr. ALEKSANDROS) — a-l-k-s-n-d-r-s.
 * Kosz (K) i woda (N) są nowe; reszta z alfabetu dziecka.
 */
export const ALEKSANDER: Sign[] = [
  { glyph: '\u{1313F}', code: 'G1', sound: 'A' },
  { glyph: '\u{130ED}', code: 'E23', sound: 'L' },
  { glyph: '\u{133A1}', code: 'V31', sound: 'K' },
  { glyph: '\u{132F4}', code: 'S29', sound: 'S' },
  { glyph: '\u{13216}', code: 'N35', sound: 'N' },
  { glyph: '\u{130A7}', code: 'D46', sound: 'D' },
  { glyph: '\u{1308B}', code: 'D21', sound: 'R' },
  { glyph: '\u{132F4}', code: 'S29', sound: 'S' },
];

export interface NameCandidate {
  id: string;
  label: string;
  /** Głoski imienia w zapisie kartusza (bez samogłosek pomijanych przez pisarza). */
  sounds: string[];
}

export const CANDIDATES: NameCandidate[] = [
  { id: 'arsinoe', label: 'Arsinoe', sounds: ['A', 'R', 'S', 'I', 'N', 'O', 'E'] },
  { id: 'aleksander', label: 'Aleksander', sounds: ['A', 'L', 'K', 'S', 'N', 'D', 'R', 'S'] },
  { id: 'antoniusz', label: 'Antoniusz', sounds: ['A', 'N', 'T', 'O', 'N', 'I', 'S'] },
];

/** Odczyt dziecka: litera ze zgromadzonego alfabetu albo `null` (znak nowy). */
export function readThird(): (string | null)[] {
  const abc = collectedAlphabet();
  return ALEKSANDER.map((s) => {
    const r = abc.get(s.glyph) ?? null;
    // dłoń to u Kleopatry T, w greckim „D” — Egipcjanin słyszał je podobnie
    return r === 'T' && s.code === 'D46' ? 'T/D' : r;
  });
}

export type CandidateVerdict = { ok: true } | { ok: false; text: string };

/** Sędzia imienia: pierwsza pozycja, na której odczyt kłóci się z imieniem. */
export function judgeCandidate(id: string): CandidateVerdict {
  const cand = CANDIDATES.find((c) => c.id === id);
  if (!cand) return { ok: false, text: 'Nie ma takiego imienia.' };
  const read = readThird();
  for (let i = 0; i < read.length; i++) {
    const r = read[i];
    if (!r) continue;
    const want = cand.sounds[i];
    const fits = r === 'T/D' ? want === 'T' || want === 'D' : want === r;
    if (!fits) {
      return {
        ok: false,
        text: `${i + 1}. znak odczytałeś/łaś jako ${r} — a w imieniu ${cand.label} na ${i + 1}. miejscu jest ${want ?? 'już koniec imienia'}.`,
      };
    }
  }
  if (cand.sounds.length !== read.length) {
    return {
      ok: false,
      text: `Kartusz ma ${read.length} ${plural(read.length, { one: 'znak', few: 'znaki', many: 'znaków' })}, a imię ${cand.label} — ${cand.sounds.length} ${plural(cand.sounds.length, { one: 'głoskę', few: 'głoski', many: 'głosek' })}.`,
    };
  }
  return { ok: true };
}

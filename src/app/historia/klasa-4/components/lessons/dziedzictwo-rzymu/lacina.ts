/**
 * Blok 3 — łacina wokół nas i prawo rzymskie (F-V.3-01, F-V.3-02).
 * Czysta logika, bez Reacta.
 *
 * Słowa: szkoła ← schola (Rzymianie wzięli je od Greków: scholē — czas wolny),
 * lekcja ← lectio (czytanie), tablica ← tabula (deska), komputer ← computare
 * (liczyć; do polskiego przez angielski), wakacje ← vacatio (bycie wolnym).
 * Sędzią jest podobieństwo brzmienia, które dziecko słyszy samo.
 */

export interface Word {
  id: string;
  pl: string;
  latin: string;
  meaning: string;
}

export const WORDS: Word[] = [
  { id: 'szkola', pl: 'szkoły', latin: 'schola', meaning: 'szkoła — a u Greków, od których Rzymianie wzięli to słowo, „czas wolny”!' },
  { id: 'lekcja', pl: 'lekcji', latin: 'lectio', meaning: 'czytanie — dawniej lekcja to było głośne czytanie książki' },
  { id: 'tablica', pl: 'tablicy', latin: 'tabula', meaning: 'deska — Rzymianie pisali na drewnianych tabliczkach z woskiem' },
  { id: 'komputer', pl: 'komputerze', latin: 'computare', meaning: 'liczyć — komputer to po prostu „liczydło”' },
  { id: 'wakacje', pl: 'wakacji', latin: 'vacatio', meaning: 'bycie wolnym od obowiązków' },
];

/** Zdanie z lukami: {id} = słowo do przyklejenia korzenia. */
export const SENTENCE = 'Rano idę do {szkola}. Na {lekcja} pani pisze na {tablica}, a ja liczę na {komputer} dni do {wakacje}.';

export type LatinVerdict = { ok: true } | { ok: false; message: string };

export function judgeRoot(latinOf: string, wordId: string): LatinVerdict {
  const root = WORDS.find((w) => w.id === latinOf);
  const word = WORDS.find((w) => w.id === wordId);
  if (!root || !word) return { ok: false, message: 'Nie ma takiego słowa.' };
  if (root.id === word.id) return { ok: true };
  return { ok: false, message: `Posłuchaj: „${root.latin}” — czy to brzmi jak „${word.pl}”? Szukaj słowa, które zaczyna się podobnie.` };
}

// --- Prawo: „prawo nie działa wstecz” ------------------------------------------------------

export const DAYS = ['pon', 'wt', 'śr', 'czw', 'pt'];
export const DAY_NAMES = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek'];

export interface Event {
  day: number;
  who: string;
  /** Biernik: „ukarać Olę”. */
  acc: string;
}

/** Kto grał na telefonie podczas lekcji — i którego dnia. */
export const EVENTS: Event[] = [
  { day: 0, who: 'Ola', acc: 'Olę' },
  { day: 1, who: 'Kuba', acc: 'Kubę' },
  { day: 3, who: 'Zosia', acc: 'Zosię' },
  { day: 4, who: 'Kuba', acc: 'Kubę' },
];

/** Regulamin uchwalono w środę rano: granica przed dniem o indeksie 2. */
export const RULE_BOUNDARY = 2;

export function punishable(boundary: number): Event[] {
  return EVENTS.filter((e) => e.day >= boundary);
}

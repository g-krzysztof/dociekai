/**
 * L9, blok 1 „Za mało nut” — dane i sędzia (czyste `.ts`).
 *
 * Wers hymnu w **dzisiejszym** brzmieniu („Przejdziemy Wisłę, przejdziemy
 * Wartę”) dziecko przykłada do taktu melodii: jedna sylaba = jedna nuta.
 * Sylab jest za dużo, więc dziecko **ściska** słowa: czasownik z końcówką
 * `-my` oddaje ostatnią sylabę i brzmi po dawnemu (`przejdziemy` → `przejdziem`).
 * Wers pasuje, kiedy sylab jest dokładnie tyle co nut — a wtedy brzmi tak,
 * jak w hymnie. Ściśnięte za dużo (`żyjemy` → `żyjem` w wersie, który już
 * pasował) — jednej nucie brakuje sylaby.
 *
 * Liczby nut to liczby sylab wersu urzędowego (melodia sylabiczna: jedna
 * sylaba na nutę w tych wersach). Podział na sylaby wpisany ręcznie, bo
 * „z narodem” śpiewa się jako „z na-ro-dem” (przyimek bez samogłoski
 * dokleja się do sylaby).
 */

export interface TaktWord {
  /** Sylaby dzisiejszej formy. */
  syl: string[];
  /** Forma ściśnięta (dawna), jeśli słowo da się ścisnąć: sylaby po ściśnięciu. */
  short?: string[];
  /** Znak po słowie (przecinek, kropka) — tylko do wyświetlania. */
  punct?: string;
}

export interface TaktRow {
  id: string;
  /** Skąd wers: do podpisu nad nutami. */
  where: string;
  /** Liczba nut melodii w tym wersie. */
  notes: number;
  /** Takty: ile nut w każdym (suma = `notes`) — kreski taktowe na pięciolinii. */
  bars: number[];
  words: TaktWord[];
  /** Brzmienie w hymnie (do potwierdzenia po dopasowaniu). */
  hymn: string;
}

export const TAKT_ROWS: TaktRow[] = [
  {
    id: 'zyjemy',
    where: 'zwrotka 1, wers 2',
    notes: 6,
    bars: [3, 3],
    words: [{ syl: ['Kie', 'dy'] }, { syl: ['my'] }, { syl: ['ży', 'je', 'my'], short: ['ży', 'jem'], punct: '.' }],
    hymn: 'Kiedy my żyjemy.',
  },
  {
    id: 'zlaczym',
    where: 'refren, wers 4',
    notes: 6,
    bars: [3, 3],
    words: [{ syl: ['Złą', 'czy', 'my'], short: ['Złą', 'czym'] }, { syl: ['się'] }, { syl: ['z na', 'ro', 'dem'], punct: '.' }],
    hymn: 'Złączym się z narodem.',
  },
  {
    id: 'przejdziem',
    where: 'zwrotka 2, wers 1',
    notes: 8,
    bars: [4, 4],
    words: [
      { syl: ['Przej', 'dzie', 'my'], short: ['Przej', 'dziem'] },
      { syl: ['Wi', 'słę'], punct: ',' },
      { syl: ['przej', 'dzie', 'my'], short: ['przej', 'dziem'] },
      { syl: ['War', 'tę'], punct: ',' },
    ],
    hymn: 'Przejdziem Wisłę, przejdziem Wartę,',
  },
  {
    id: 'bedziem',
    where: 'zwrotka 2, wers 2',
    notes: 6,
    bars: [3, 3],
    words: [{ syl: ['Bę', 'dzie', 'my'], short: ['Bę', 'dziem'] }, { syl: ['Po', 'la', 'ka', 'mi'], punct: '.' }],
    hymn: 'Będziem Polakami.',
  },
];

/** Sylaby słowa w bieżącym stanie (ściśnięte albo nie). */
export function sylOf(w: TaktWord, squeezed: boolean): string[] {
  return squeezed && w.short ? w.short : w.syl;
}

/** Słowo tak, jak brzmi w bieżącym stanie. */
export function formOf(w: TaktWord, squeezed: boolean): string {
  return sylOf(w, squeezed).join('');
}

/** Wszystkie sylaby wersu po kolei, z numerem słowa. */
export function rowSyllables(row: TaktRow, squeezed: ReadonlySet<number>): { syl: string; word: number }[] {
  return row.words.flatMap((w, i) => sylOf(w, squeezed.has(i)).map((syl) => ({ syl, word: i })));
}

export type TaktFit = 'pasuje' | 'za-dlugi' | 'za-krotki';

export interface TaktVerdict {
  fit: TaktFit;
  syllables: number;
  notes: number;
  /** Dodatnie: tyle sylab wystaje; ujemne: tylu nutom brakuje sylaby. */
  diff: number;
}

export function judgeRow(row: TaktRow, squeezed: ReadonlySet<number>): TaktVerdict {
  const syllables = rowSyllables(row, squeezed).length;
  const diff = syllables - row.notes;
  return { fit: diff === 0 ? 'pasuje' : diff > 0 ? 'za-dlugi' : 'za-krotki', syllables, notes: row.notes, diff };
}

export type SqueezeResult = { ok: true; squeezed: Set<number> } | { ok: false; reason: string };

/**
 * Stuknięcie słowa: ściska je (albo rozciska z powrotem). Słowo bez dawnej
 * krótszej formy nie da się ścisnąć — powód mówi dlaczego.
 */
export function squeeze(row: TaktRow, squeezed: ReadonlySet<number>, word: number): SqueezeResult {
  const w = row.words[word];
  if (!w) return { ok: false, reason: 'Nie ma takiego słowa.' };
  const next = new Set(squeezed);
  if (next.has(word)) {
    next.delete(word);
    return { ok: true, squeezed: next };
  }
  if (!w.short) {
    const form = formOf(w, false);
    return {
      ok: false,
      reason:
        w.syl.length === 1
          ? `„${form}” ma tylko jedną sylabę — nie ma czego oddać.`
          : `„${form}” nie ma krótszej formy — bez sylaby słowo by się rozpadło.`,
    };
  }
  next.add(word);
  return { ok: true, squeezed: next };
}

/** Wers zapisany w bieżącym stanie (do porównania z hymnem). */
export function rowText(row: TaktRow, squeezed: ReadonlySet<number>): string {
  return row.words.map((w, i) => formOf(w, squeezed.has(i)) + (w.punct ?? '')).join(' ');
}

/** Dopasowanie, które daje dokładnie tekst hymnu (dla każdego wersu jest jedno). */
export function hymnSqueeze(row: TaktRow): Set<number> {
  return new Set(row.words.flatMap((w, i) => (w.short && !row.hymn.includes(formOf(w, false)) ? [i] : [])));
}

/** Komentarz do wyniku — konsekwencja, nie ocena. */
export function fitMessage(row: TaktRow, v: TaktVerdict): string {
  if (v.fit === 'pasuje') return `Każda sylaba ma swoją nutę. Tak właśnie się to śpiewa: „${row.hymn.replace(/[,.]$/, '')}”.`;
  if (v.fit === 'za-dlugi')
    return v.diff === 1
      ? 'Jedna sylaba nie ma swojej nuty — wystaje za takt. Które słowo da się ścisnąć?'
      : `${v.diff} ${v.diff < 5 ? 'sylaby nie mają' : 'sylab nie ma'} swoich nut — wystają za takt. Które słowa da się ścisnąć?`;
  return v.diff === -1
    ? 'Teraz jednej nucie brakuje sylaby — ściśnięte za mocno.'
    : `Teraz ${-v.diff} nutom brakuje sylab — ściśnięte za mocno.`;
}

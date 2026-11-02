/**
 * L21 blok `imie` — imię dziecka znakami jednospółgłoskowymi.
 *
 * Egipcjanie mieli ok. 24 znaki oddające jedną spółgłoskę (lista Gardinera);
 * samogłosek nie pisali. Imiona cudzoziemców (Ptolemeusz, Kleopatra)
 * zapisywali jednak z „samogłoskami” — sępem (a), trzciną (i), lassem (o),
 * pisklęciem przepiórki (u/w). Tak samo zapisujemy imię dziecka. Polskie
 * głoski, których Egipcjanie nie mieli, dostają znak najbliższy brzmieniem
 * (np. Ż → kobra „dż”) — mówimy o tym przy tacy.
 */

import { plural } from '@/lib/plural';

const GLOSKA = { one: 'głoskę', few: 'głoski', many: 'głosek' };
const ZNAK = { one: 'znak', few: 'znaki', many: 'znaków' };

export interface UniSign {
  id: string;
  glyph: string;
  /** Jak go nazwać dziecku. */
  name: string;
  /** Głoski, które oddaje (wielkie litery, dwuznaki też). */
  sounds: string[];
}

export const SIGNS: UniSign[] = [
  { id: 'sep', glyph: '\u{1313F}', name: 'sęp', sounds: ['A', 'Ą'] },
  { id: 'stopa', glyph: '\u{130C0}', name: 'stopa', sounds: ['B'] },
  { id: 'dlon', glyph: '\u{130A7}', name: 'dłoń', sounds: ['D'] },
  { id: 'trzcina', glyph: '\u{131CB}', name: 'trzcina', sounds: ['E', 'Ę', 'I'] },
  { id: 'zmija', glyph: '\u{13191}', name: 'żmija', sounds: ['F'] },
  { id: 'podstawka', glyph: '\u{133BC}', name: 'podstawka dzbana', sounds: ['G'] },
  { id: 'dziedziniec', glyph: '\u{13254}', name: 'dziedziniec', sounds: ['H'] },
  { id: 'sito', glyph: '\u{1340D}', name: 'sito', sounds: ['CH'] },
  { id: 'dwie-trzciny', glyph: '\u{131CC}', name: 'dwie trzciny', sounds: ['J', 'Y'] },
  { id: 'kosz', glyph: '\u{133A1}', name: 'kosz', sounds: ['K'] },
  { id: 'lew', glyph: '\u{130ED}', name: 'lew', sounds: ['L', 'Ł'] },
  { id: 'sowa', glyph: '\u{13153}', name: 'sowa', sounds: ['M'] },
  { id: 'woda', glyph: '\u{13216}', name: 'woda', sounds: ['N', 'Ń'] },
  { id: 'lasso', glyph: '\u{1336F}', name: 'lasso', sounds: ['O'] },
  { id: 'piskle', glyph: '\u{13171}', name: 'pisklę', sounds: ['U', 'Ó', 'W'] },
  { id: 'stolek', glyph: '\u{132AA}', name: 'stołek', sounds: ['P'] },
  { id: 'usta', glyph: '\u{1308B}', name: 'usta', sounds: ['R'] },
  { id: 'material', glyph: '\u{132F4}', name: 'złożony materiał', sounds: ['S'] },
  { id: 'staw', glyph: '\u{13219}', name: 'staw', sounds: ['SZ', 'Ś'] },
  { id: 'chleb', glyph: '\u{133CF}', name: 'chleb', sounds: ['T'] },
  { id: 'sznur', glyph: '\u{1337F}', name: 'sznur do pętania', sounds: ['C', 'CZ', 'Ć'] },
  { id: 'zasuwa', glyph: '\u{13283}', name: 'zasuwa', sounds: ['Z', 'Ź'] },
  { id: 'kobra', glyph: '\u{13193}', name: 'kobra', sounds: ['Ż', 'RZ', 'DŻ', 'DZ'] },
];

export const SIGN_BY_ID = new Map(SIGNS.map((s) => [s.id, s]));

const DIGRAPHS = ['CH', 'CZ', 'SZ', 'RZ', 'DŻ', 'DZ'];

/** Imię → kolejne głoski (dwuznaki razem). Q → K, V → W, X → K S. */
export function toSounds(name: string): string[] {
  const up = name
    .toLocaleUpperCase('pl-PL')
    .replace(/Q/g, 'K')
    .replace(/V/g, 'W')
    .replace(/X/g, 'KS')
    .replace(/[^A-ZĄĆĘŁŃÓŚŹŻ]/g, '');
  const out: string[] = [];
  for (let i = 0; i < up.length; ) {
    const two = up.slice(i, i + 2);
    if (DIGRAPHS.includes(two)) {
      out.push(two);
      i += 2;
    } else {
      out.push(up[i]);
      i += 1;
    }
  }
  return out;
}

/** Znak dla głoski (pierwszy, który ją oddaje). */
export function signFor(sound: string): UniSign | undefined {
  return SIGNS.find((s) => s.sounds.includes(sound));
}

export const MAX_NAME = 10;

export type NameVerdict =
  | { ok: true }
  | { ok: false; index: number; text: string };

/**
 * Sędzia kartusza: znaki dziecka porównane głoska po głosce z jego imieniem.
 * Nazywa pierwszą głoskę, która się nie zgadza, i co stoi na jej miejscu.
 */
export function judgeName(name: string, placed: string[]): NameVerdict {
  const sounds = toSounds(name);
  if (sounds.length === 0) return { ok: false, index: 0, text: 'Najpierw wpisz imię.' };
  for (let i = 0; i < sounds.length; i++) {
    const want = sounds[i];
    const got = placed[i] ? SIGN_BY_ID.get(placed[i]) : undefined;
    if (!got) {
      return {
        ok: false,
        index: i,
        text: `Brakuje znaku dla ${i + 1}. głoski — ${want}.`,
      };
    }
    if (!got.sounds.includes(want)) {
      return {
        ok: false,
        index: i,
        text: `${i + 1}. głoska Twojego imienia to ${want}, a w kartuszu stoi ${got.name} — ${got.sounds[0]}.`,
      };
    }
  }
  if (placed.length > sounds.length) {
    return {
      ok: false,
      index: sounds.length,
      text: `Twoje imię ma ${sounds.length} ${plural(sounds.length, GLOSKA)}, a w kartuszu ${plural(placed.length, { one: 'jest', few: 'są', many: 'jest' })} ${placed.length} ${plural(placed.length, ZNAK)} — usuń nadmiar z końca.`,
    };
  }
  return { ok: true };
}

/** Indeksy samogłosek — tych znaków Egipcjanin w swoim słowie by nie napisał. */
export function vowelIndexes(name: string): number[] {
  return toSounds(name)
    .map((s, i) => (['A', 'Ą', 'E', 'Ę', 'I', 'O', 'U', 'Ó', 'Y'].includes(s) ? i : -1))
    .filter((i) => i >= 0);
}

/**
 * Polskie dzielenie tekstu na wyrazy i zdania — czyste funkcje, bez Reacta.
 * Używa ich `buildKorpus()`, a w E3 także analizator Pisarni (tekst dziecka).
 *
 * Granica zdania to `.`, `!`, `?`, `…` (także `?!`, `...`), po których — za
 * ewentualnym cudzysłowem, nawiasem albo myślnikiem dialogu — zaczyna się wyraz
 * od wielkiej litery. Dlatego:
 * - skrót przed kropką („np.”, „ul.”, „św.”, „J.”) nie kończy zdania;
 * - „— Przyjdź! — zawołała Zuzia.” to jedno zdanie (po myślniku mała litera);
 * - „— Dobrze. — Zuzia wstała.” to dwa zdania;
 * - wielokropek przed małą literą nie kończy zdania.
 */

export interface RawToken {
  type: 'word' | 'punct';
  form: string;
  /** Odstęp po tokenie w tekście źródłowym (`' '` albo `''`). */
  after: string;
  /** Pozycja w napisie wejściowym — do łączenia ze znacznikami źródła. */
  start: number;
  end: number;
}

const LETTER = 'A-Za-zÀ-ÖØ-öø-ÿĀ-žḀ-ỿ';
const WORD_RE = new RegExp(`[${LETTER}0-9]+(?:[-'’][${LETTER}0-9]+)*`, 'y');
const ELLIPSIS_RE = /\.{3}|[?!]+|…/y;

/** Skróty, po których kropka nie kończy zdania (małymi literami, bez kropki). */
export const ABBREVIATIONS = new Set([
  'np', 'itp', 'itd', 'tzn', 'tzw', 'ul', 'al', 'pl', 'os', 'św', 'dr', 'prof', 'mgr', 'inż',
  'p', 'godz', 'min', 'ok', 'r', 'w', 'wg', 'tj', 'm', 'in', 'cdn', 'ds', 'nr', 'str', 's',
  'zob', 'por', 'wyd', 'ang', 'łac', 'gr', 'kpt', 'gen', 'ks', 'pt', 'pn', 'wt', 'śr', 'czw',
  'sob', 'niedz', 'tys', 'mln', 'mld', 'zł', 'gr', 'kg', 'dag', 'cm', 'mm', 'km',
]);

const SENTENCE_END = new Set(['.', '!', '?', '…', '...']);
const CLOSERS = new Set(['"', '”', '»', '’', ')', ']', '«']);
const DASHES = new Set(['—', '–', '-']);

export function tokenize(text: string): RawToken[] {
  const out: RawToken[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    WORD_RE.lastIndex = i;
    const word = WORD_RE.exec(text);
    let form: string;
    let type: RawToken['type'];
    if (word) {
      form = word[0];
      type = 'word';
    } else {
      ELLIPSIS_RE.lastIndex = i;
      const multi = ELLIPSIS_RE.exec(text);
      form = multi ? multi[0] : ch;
      type = 'punct';
    }
    const start = i;
    i += form.length;
    let j = i;
    while (j < text.length && /[ \t ]/.test(text[j])) j++;
    const hasSpace = j > i || /\s/.test(text[i] ?? '');
    out.push({ type, form, after: hasSpace ? ' ' : '', start, end: i });
  }
  if (out.length) out[out.length - 1].after = '';
  return out;
}

const isTerminal = (t: RawToken) =>
  t.type === 'punct' && (SENTENCE_END.has(t.form) || /^[?!]+$/.test(t.form));

const startsUpper = (form: string) => {
  const first = form[0];
  return first !== first.toLowerCase() && first === first.toUpperCase();
};

/**
 * Indeksy tokenów, PO których kończy się zdanie (ostatni token akapitu
 * zawsze zamyka zdanie). Zwraca listę długości zdań w tokenach.
 */
export function sentenceBreaks(tokens: RawToken[]): number[] {
  const ends: number[] = [];
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k];
    if (!isTerminal(t)) continue;

    if (t.form === '.') {
      const prev = tokens[k - 1];
      if (prev?.type === 'word' && t.start === prev.end) {
        const low = prev.form.toLowerCase();
        // Skrót albo inicjał („J. Kowalski”) — kropka należy do wyrazu.
        if (ABBREVIATIONS.has(low) || (prev.form.length === 1 && startsUpper(prev.form))) continue;
      }
    }

    // Zamykające cudzysłowy/nawiasy i kolejne znaki końca należą do tego zdania.
    let last = k;
    while (
      last + 1 < tokens.length &&
      (CLOSERS.has(tokens[last + 1].form) || isTerminal(tokens[last + 1]))
    ) {
      last++;
    }

    // Co jest dalej: za myślnikiem dialogu i otwierającym cudzysłowem — pierwszy wyraz.
    let next = last + 1;
    while (
      next < tokens.length &&
      tokens[next].type === 'punct' &&
      (DASHES.has(tokens[next].form) || ['"', '„', '«', '»', '('].includes(tokens[next].form))
    ) {
      next++;
    }
    if (next >= tokens.length) {
      ends.push(last);
      k = last;
      continue;
    }
    const following = tokens[next];
    if (following.type === 'word' && startsUpper(following.form)) {
      ends.push(last);
    }
    k = last;
  }
  if (tokens.length && ends[ends.length - 1] !== tokens.length - 1) ends.push(tokens.length - 1);
  return ends;
}

/** Wygodne opakowanie: tekst → zdania jako napisy (do testów i Pisarni). */
export function splitSentences(text: string): string[] {
  const tokens = tokenize(text);
  const ends = sentenceBreaks(tokens);
  const out: string[] = [];
  let from = 0;
  for (const end of ends) {
    out.push(text.slice(tokens[from].start, tokens[end].end));
    from = end + 1;
  }
  return out;
}

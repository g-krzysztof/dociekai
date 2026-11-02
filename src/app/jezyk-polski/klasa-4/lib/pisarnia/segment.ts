/**
 * Podział tekstu DZIECKA na akapity i zdania.
 *
 * Inaczej niż `sentenceBreaks` z `korpus` (nasze teksty, poprawne z definicji):
 * tam zdanie kończy się tylko przed wielką literą, tutaj mała litera po kropce
 * to właśnie błąd, który Pisarnia ma pokazać („Mam psa. on szczeka.” = dwa
 * zdania, drugie bez wielkiej litery). Wspólny jest tokenizer i lista skrótów.
 *
 * Granica zdania to `.`, `!`, `?`, `…`, `...`, `?!` (z zamykającym cudzysłowem
 * albo nawiasem), **chyba że**:
 * - kropka stoi po skrócie z `ALWAYS_GLUED` („ul. Lipowa”, „godz. 17”, „p. Halina”);
 * - kropka stoi po innym skrócie („np.”, „itd.”) albo po inicjale, a dalej jest mała litera;
 * - kropka jest sklejona z następnym wyrazem pisanym małą literą albo cyfrą
 *   („12.30”, „3.05.2016”, „www.zoo.pl”); przed wielką literą to granica z błędem odstępu;
 * - po znaku jest myślnik i mała litera — wtrącenie narratora w dialogu
 *   („— Chodź! — zawołała mama.”);
 * - po wielokropku jest mała litera („Myślałam… że przyjdziesz.”).
 *
 * Akapit = niepusta linia (dziecko robi akapit Enterem); zdanie nie przechodzi
 * przez koniec linii.
 */

import { ABBREVIATIONS, tokenize, type RawToken } from '../korpus/split';

/** Skróty, po których nigdy nie kończymy zdania — zwykle stoi za nimi nazwa albo liczba. */
export const ALWAYS_GLUED = new Set([
  'ul', 'al', 'pl', 'os', 'św', 'dr', 'prof', 'mgr', 'inż', 'p', 'ks', 'kpt', 'gen', 'nr', 'godz',
  'str', 'wg', 'tzw', 'np', 'in',
]);

export interface SegToken extends RawToken {
  /** Odstęp PRZED tokenem (w linii). */
  spaceBefore: boolean;
}

export interface SegSentence {
  tokens: SegToken[];
  /** Kropka przed tym zdaniem była sklejona z jego pierwszym wyrazem („psa.On”). */
  gluedToPrevious: boolean;
}

export interface SegParagraph {
  start: number;
  end: number;
  text: string;
  tokens: SegToken[];
  sentences: SegSentence[];
}

const TERMINAL = new Set(['.', '!', '?', '…', '...']);
const CLOSERS = new Set(['"', '”', '»', '’', ')', ']', '«']);
const OPENERS = new Set(['"', '„', '«', '»', '(', '‚']);
export const DASHES = new Set(['—', '–', '-']);

export const isTerminal = (t: { type: string; form: string }) =>
  t.type === 'punct' && (TERMINAL.has(t.form) || /^[?!]+$/.test(t.form));

const isLetter = (ch: string) => ch.toLowerCase() !== ch.toUpperCase();
export const startsUpper = (form: string) => isLetter(form[0]) && form[0] === form[0].toUpperCase();
export const startsLower = (form: string) => isLetter(form[0]) && form[0] === form[0].toLowerCase();

/** Linie tekstu z pozycjami w napisie wejściowym (puste pomijane). */
function lines(text: string): { start: number; end: number; text: string }[] {
  const out: { start: number; end: number; text: string }[] = [];
  const re = /[^\r\n]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const raw = m[0];
    const lead = raw.length - raw.trimStart().length;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const start = m.index + lead;
    out.push({ start, end: start + trimmed.length, text: trimmed });
  }
  return out;
}

function tokensOf(line: { start: number; text: string }): SegToken[] {
  return tokenize(line.text).map((t, i, all) => ({
    ...t,
    start: t.start + line.start,
    end: t.end + line.start,
    spaceBefore: i > 0 && all[i - 1].end < t.start,
  }));
}

function splitLine(tokens: SegToken[]): SegSentence[] {
  const out: SegSentence[] = [];
  let from = 0;
  let glued = false;
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k];
    if (!isTerminal(t)) continue;

    // Zamykające cudzysłowy/nawiasy i kolejne znaki końca należą do tego zdania.
    let last = k;
    while (last + 1 < tokens.length && (CLOSERS.has(tokens[last + 1].form) || isTerminal(tokens[last + 1]))) {
      last++;
    }
    const after = tokens[last + 1];

    if (t.form === '.' && last === k) {
      const prev = tokens[k - 1];
      const prevGlued = prev?.type === 'word' && !t.spaceBefore;
      if (prevGlued) {
        const low = prev.form.toLowerCase();
        if (ALWAYS_GLUED.has(low)) continue;
        const abbrev = ABBREVIATIONS.has(low) || (prev.form.length === 1 && startsUpper(prev.form));
        if (abbrev && after?.type === 'word' && !startsUpper(after.form)) continue;
        // Inicjał przed nazwiskiem („J. Kowalski”).
        if (prev.form.length === 1 && startsUpper(prev.form) && after?.type === 'word' && startsUpper(after.form)) {
          continue;
        }
      }
      // Kropka sklejona z wyrazem: liczba, data, adres („12.30”, „zoo.pl”).
      if (after?.type === 'word' && !after.spaceBefore && !startsUpper(after.form)) continue;
    }

    // Co jest dalej: za myślnikiem i otwierającym cudzysłowem — pierwszy wyraz.
    let next = last + 1;
    let sawDash = false;
    while (next < tokens.length && tokens[next].type === 'punct' && (DASHES.has(tokens[next].form) || OPENERS.has(tokens[next].form))) {
      if (DASHES.has(tokens[next].form)) sawDash = true;
      next++;
    }
    const following = tokens[next];
    if (following) {
      const lower = following.type === 'word' && startsLower(following.form);
      const ellipsis = t.form === '…' || t.form === '...';
      if (lower && (sawDash || ellipsis)) continue;
    }

    out.push({ tokens: tokens.slice(from, last + 1), gluedToPrevious: glued });
    glued = !!after && after.type === 'word' && !after.spaceBefore;
    from = last + 1;
    k = last;
  }
  if (from < tokens.length) out.push({ tokens: tokens.slice(from), gluedToPrevious: glued });
  return out;
}

export function segment(text: string): SegParagraph[] {
  return lines(text).map((line) => {
    const tokens = tokensOf(line);
    return { ...line, tokens, sentences: splitLine(tokens) };
  });
}

/** Zdania tekstu dziecka jako napisy (do testów i podglądu). */
export function splitChildSentences(text: string): string[] {
  return segment(text).flatMap((p) =>
    p.sentences.map((s) => text.slice(s.tokens[0].start, s.tokens[s.tokens.length - 1].end)),
  );
}

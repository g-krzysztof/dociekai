/**
 * Analizator Pisarni — z tekstu dziecka robi strukturę, na której stoją
 * podświetlenia na żywo i werdykt `TaskShell`. Czysta funkcja: ten sam tekst
 * daje zawsze ten sam wynik (żadnego zgadywania treści, § 6 programu).
 */

import { tokenize } from '../korpus/split';
import { findPaletteHits } from './palette';
import { DASHES, isTerminal, segment, startsLower, type SegToken } from './segment';
import type {
  AnalyzeOptions,
  DialogPart,
  EndMark,
  IssueKind,
  PisIssue,
  PisMark,
  PisParagraph,
  PisRepeat,
  PisSentence,
  PisWord,
  PisarniaAnalysis,
  PaletteHit,
} from './types';

/** Krótkie słowa i słowa-kleje, których powtórzenie nie jest usterką stylu. */
export const REPEAT_STOPWORDS = new Set([
  'się', 'nie', 'jest', 'są', 'był', 'była', 'było', 'byli', 'były', 'będzie', 'ale', 'jak', 'już',
  'też', 'tak', 'tylko', 'mnie', 'mój', 'moja', 'moje', 'moim', 'mojej', 'moją', 'jego', 'jej', 'ich',
  'ona', 'ono', 'oni', 'one', 'nas', 'was', 'nam', 'wam', 'mam', 'masz', 'ma', 'czy', 'gdy', 'kiedy',
  'który', 'która', 'które', 'którzy', 'ten', 'tego', 'tej', 'tym', 'tam', 'tu', 'tutaj', 'przez', 'dla',
  'przy', 'pod', 'nad', 'przed', 'bardzo', 'jeszcze', 'potem', 'więc', 'oraz', 'albo', 'lub', 'żeby',
  'bo', 'że', 'ponieważ', 'aby', 'sobie', 'siebie', 'ciebie', 'tobie', 'jestem', 'jesteś',
]);

/** Podpowiedzi dla dziecka do każdej usterki (tor dziecka: krótko, „Ty”). */
export const ISSUE_TEXT: Record<IssueKind, string> = {
  'no-capital': 'Zdanie zaczyna się wielką literą.',
  'no-end-mark': 'Na końcu zdania postaw kropkę, pytajnik albo wykrzyknik.',
  'space-before-punct': 'Przed tym znakiem nie robimy odstępu.',
  'no-space-after-punct': 'Po tym znaku zostaw odstęp.',
  'name-lowercase': 'Imię piszemy wielką literą.',
  'dialog-hyphen': 'Kwestię w dialogu zaczyna myślnik (—), dłuższy niż kreska z klawiatury.',
};

const SPACE_BEFORE_BAD = new Set([',', '.', '!', '?', ';', ':', '…', '...', '?!']);
const NEEDS_SPACE_AFTER = new Set([',', ';', ':', '.', '!', '?', '…', '...']);
const CLOSERS = new Set(['"', '”', '»', '’', ')', ']', '«']);

const isLetterStart = (form: string) => form[0].toLowerCase() !== form[0].toUpperCase();

function endMarkOf(form: string): EndMark {
  if (form === '...' || form === '…') return '…';
  if (form.includes('?') && form.includes('!')) return '?!';
  if (form.includes('?')) return '?';
  if (form.includes('!')) return '!';
  return '.';
}

function dialogParts(tokens: SegToken[]): DialogPart[] {
  const parts: DialogPart[] = [];
  let role: DialogPart['role'] = 'speech';
  let run: SegToken[] = [];
  const flush = () => {
    if (run.length) parts.push({ role, start: run[0].start, end: run[run.length - 1].end });
    run = [];
  };
  tokens.slice(1).forEach((t) => {
    if (t.type === 'punct' && DASHES.has(t.form)) {
      flush();
      role = role === 'speech' ? 'narration' : 'speech';
    } else {
      run.push(t);
    }
  });
  flush();
  return parts;
}

function findRepeats(words: PisWord[], opts: AnalyzeOptions): PisRepeat[] {
  const minLen = opts.repeatMinLength ?? 3;
  const window = opts.repeatWindow ?? 1;
  const ignore = new Set([...(opts.repeatIgnore ?? [])].map((w) => w.toLowerCase()));
  const byLow = new Map<string, PisWord[]>();
  for (const w of words) {
    if (w.low.length < minLen || REPEAT_STOPWORDS.has(w.low) || ignore.has(w.low) || /^\d/.test(w.low)) continue;
    byLow.set(w.low, [...(byLow.get(w.low) ?? []), w]);
  }
  const out: PisRepeat[] = [];
  for (const [low, list] of byLow) {
    let cluster: PisWord[] = [list[0]];
    const close = () => {
      if (cluster.length > 1) out.push({ low, words: cluster.map((w) => w.index) });
    };
    for (let i = 1; i < list.length; i++) {
      if (list[i].sentence - cluster[cluster.length - 1].sentence <= window) {
        cluster.push(list[i]);
      } else {
        close();
        cluster = [list[i]];
      }
    }
    close();
  }
  return out.sort((a, b) => a.words[0] - b.words[0]);
}

export function analyze(text: string, opts: AnalyzeOptions = {}): PisarniaAnalysis {
  const names = new Set([...(opts.names ?? [])].map((n) => n.toLowerCase()));
  const paragraphs: PisParagraph[] = [];
  const sentences: PisSentence[] = [];
  const words: PisWord[] = [];
  const issues: PisIssue[] = [];
  const issue = (kind: IssueKind, start: number, end: number, sentence: number | null, paragraph: number) =>
    issues.push({ kind, start, end, sentence, paragraph });

  segment(text).forEach((seg, pIndex) => {
    const first = seg.tokens[0];
    const dash = first.type === 'punct' && DASHES.has(first.form) ? (first.form as '—' | '–' | '-') : null;
    const para: PisParagraph = {
      index: pIndex,
      start: seg.start,
      end: seg.end,
      text: seg.text,
      sentences: [],
      dialog: dash !== null,
      dash,
      parts: dash ? dialogParts(seg.tokens) : [],
    };
    paragraphs.push(para);
    if (dash === '-') issue('dialog-hyphen', first.start, first.end, null, pIndex);

    // Odstępy wokół znaków — na całej linii, niezależnie od zdań.
    seg.tokens.forEach((t, k) => {
      if (t.type !== 'punct') return;
      if (k > 0 && t.spaceBefore && SPACE_BEFORE_BAD.has(t.form)) {
        issue('space-before-punct', t.start, t.end, null, pIndex);
      }
      const nextTok = seg.tokens[k + 1];
      if (
        NEEDS_SPACE_AFTER.has(t.form) &&
        nextTok?.type === 'word' &&
        !nextTok.spaceBefore &&
        isLetterStart(nextTok.form) &&
        // „m.in.”, „zoo.pl” — kropka sklejona z małą literą to skrót albo adres.
        !(t.form === '.' && startsLower(nextTok.form))
      ) {
        issue('no-space-after-punct', t.start, t.end, null, pIndex);
      }
    });

    seg.sentences.forEach((s) => {
      const sIndex = sentences.length;
      const toks = s.tokens;
      const wordIdx: number[] = [];
      for (const t of toks) {
        if (t.type !== 'word') continue;
        const w: PisWord = {
          index: words.length,
          form: t.form,
          low: t.form.toLowerCase(),
          start: t.start,
          end: t.end,
          sentence: sIndex,
          paragraph: pIndex,
        };
        words.push(w);
        wordIdx.push(w.index);
      }

      let tail = toks.length - 1;
      while (tail > 0 && CLOSERS.has(toks[tail].form)) tail--;
      const lastTok = toks[tail];
      const endMark = isTerminal(lastTok) ? endMarkOf(lastTok.form) : null;
      const firstWord = wordIdx.length ? words[wordIdx[0]] : null;
      const capitalOk = !firstWord || !startsLower(firstWord.form);

      const sentence: PisSentence = {
        index: sIndex,
        paragraph: pIndex,
        start: toks[0].start,
        end: toks[toks.length - 1].end,
        text: text.slice(toks[0].start, toks[toks.length - 1].end),
        words: wordIdx,
        endMark,
        trailingPunct: !endMark && lastTok.type === 'punct' ? lastTok.form : null,
        capitalOk,
        inDialog: para.dialog,
      };
      sentences.push(sentence);
      para.sentences.push(sIndex);

      if (firstWord && !capitalOk) issue('no-capital', firstWord.start, firstWord.start + 1, sIndex, pIndex);
      if (!endMark && wordIdx.length) issue('no-end-mark', lastTok.end - 1, lastTok.end, sIndex, pIndex);
      // Pierwszy wyraz pomijamy: imię na początku zdania ma już usterkę „no-capital”.
      for (const i of wordIdx.slice(1)) {
        const w = words[i];
        if (names.has(w.low) && startsLower(w.form)) issue('name-lowercase', w.start, w.end, sIndex, pIndex);
      }
    });
  });

  issues.sort((a, b) => a.start - b.start);
  const hits: PaletteHit[] = opts.palette ? findPaletteHits(words, opts.palette) : [];
  return { text, paragraphs, sentences, words, issues, repeats: findRepeats(words, opts), hits };
}

// ── Pomocnicy dla sędziów lekcji ────────────────────────────────────────────

/** Usterki danego rodzaju (wszystkie albo tylko w zdaniu). */
export function issuesOf(a: PisarniaAnalysis, kind: IssueKind, sentence?: number): PisIssue[] {
  return a.issues.filter((i) => i.kind === kind && (sentence === undefined || i.sentence === sentence));
}

/**
 * Spójnik w zdaniu i to, co stoi przed nim i po nim („Lubię psy, bo są wierne.”).
 * Bierze pierwsze wystąpienie któregoś ze `connectors` (małymi literami).
 */
export function findConnector(
  a: PisarniaAnalysis,
  sentence: number,
  connectors: string[],
): { word: PisWord; before: PisWord[]; after: PisWord[] } | null {
  const set = new Set(connectors.map((c) => c.toLowerCase()));
  const ws = a.sentences[sentence]?.words.map((i) => a.words[i]) ?? [];
  const k = ws.findIndex((w) => set.has(w.low));
  if (k < 0) return null;
  return { word: ws[k], before: ws.slice(0, k), after: ws.slice(k + 1) };
}

/** Podobieństwo dwóch napisów po wyrazach (współczynnik Dice’a na wielozbiorach, 0–1). */
export function wordSimilarity(x: string, y: string): number {
  const bag = (s: string) => {
    const m = new Map<string, number>();
    for (const t of tokenize(s)) if (t.type === 'word') m.set(t.form.toLowerCase(), (m.get(t.form.toLowerCase()) ?? 0) + 1);
    return m;
  };
  const a = bag(x);
  const b = bag(y);
  const total = [...a.values(), ...b.values()].reduce((s, n) => s + n, 0);
  if (!total) return 0;
  let common = 0;
  for (const [w, n] of a) common += Math.min(n, b.get(w) ?? 0);
  return (2 * common) / total;
}

// ── Podświetlenia ───────────────────────────────────────────────────────────

const TONE_RANK: Record<PisMark['tone'], number> = { error: 0, bad: 1, warn: 2, good: 3, info: 4 };

export interface MarkOptions {
  /** Które usterki podświetlać (`true` = wszystkie). */
  issues?: boolean | IssueKind[];
  /** Podświetlać powtórzenia (ton `warn`). */
  repeats?: boolean;
  /** Ton trafienia palety (np. słowa-oskarżenia → `bad`, uczucia → `good`); `null` = bez podświetlenia. */
  hits?: (hit: PaletteHit) => PisMark['tone'] | null;
}

/** Podświetlenia do pola Pisarni: rozłączne, ważniejszy ton wygrywa przy nakładaniu. */
export function buildMarks(a: PisarniaAnalysis, opts: MarkOptions): PisMark[] {
  const all: PisMark[] = [];
  if (opts.issues) {
    const allow = opts.issues === true ? null : new Set(opts.issues);
    for (const i of a.issues) {
      if (allow && !allow.has(i.kind)) continue;
      all.push({ start: i.start, end: i.end, tone: i.kind === 'dialog-hyphen' ? 'info' : 'error', title: ISSUE_TEXT[i.kind] });
    }
  }
  if (opts.repeats) {
    for (const r of a.repeats) {
      for (const i of r.words) {
        const w = a.words[i];
        all.push({ start: w.start, end: w.end, tone: 'warn', title: `„${r.low}” powtarza się blisko` });
      }
    }
  }
  if (opts.hits) {
    for (const h of a.hits) {
      const tone = opts.hits(h);
      if (tone) all.push({ start: h.start, end: h.end, tone });
    }
  }
  all.sort((x, y) => TONE_RANK[x.tone] - TONE_RANK[y.tone] || x.start - y.start);
  const kept: PisMark[] = [];
  for (const m of all) {
    if (kept.some((k) => m.start < k.end && k.start < m.end)) continue;
    kept.push(m);
  }
  return kept.sort((x, y) => x.start - y.start);
}

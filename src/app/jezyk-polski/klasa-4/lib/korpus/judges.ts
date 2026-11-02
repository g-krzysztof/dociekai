/**
 * Sędziowie tekstu z adnotacją — czyste funkcje. Każdy werdykt wynika z tego,
 * co zapisano w tekście (kotwice, fragmenty, analizy), i umie powiedzieć,
 * DLACZEGO nie: do kogo naprawdę należy wskazany dowód, którego fragmentu
 * brakuje, która forma ma dobry lemat, ale złą końcówkę.
 */

import { schoolPos } from './pos';
import type { AnchorDef, Korpus, Morph, Token } from './types';

/** Tokeny, które obejmuje id: wyraz, fragment `[[…]]` albo zdanie/wers. */
export function tokensOf(k: Korpus, id: string): Token[] {
  if (k.tokenById[id]) return [k.tokenById[id]];
  if (k.spans[id]) return k.spans[id].tokenIds.map((t) => k.tokenById[t]);
  if (k.unitById[id]) return k.unitById[id].tokenIds.map((t) => k.tokenById[t]);
  return [];
}

export const wordsOf = (k: Korpus, id: string): Token[] =>
  tokensOf(k, id).filter((t) => t.type === 'word');

/**
 * Czy wskazanie dziecka `picked` trafia w cel `target`. Trafia, gdy to ten sam
 * id, gdy dziecko stuknęło całe zdanie, w którym cel leży w całości, albo gdy
 * stuknęło wyraz należący do celu.
 */
export function pickHits(k: Korpus, picked: string, target: string): boolean {
  if (picked === target) return true;
  const targetWords = new Set(wordsOf(k, target).map((t) => t.id));
  if (!targetWords.size) return false;
  const pickedWords = wordsOf(k, picked).map((t) => t.id);
  if (k.tokenById[picked]) return targetWords.has(picked);
  // Zdanie/fragment zawiera cały cel.
  return [...targetWords].every((id) => pickedWords.includes(id));
}

export type EvidenceVerdict =
  | { ok: true; anchor: AnchorDef }
  /** Dowód jest w tekście, ale należy do innego fragmentu (`owner`) albo innej relacji. */
  | { ok: false; reason: 'cudzy-dowod'; owner: string; kind: string }
  /** Wskazane miejsce niczego nie dowodzi. */
  | { ok: false; reason: 'brak-dowodu' };

/**
 * Para stuknięć „fragment → dowód/skutek” (L1, L2, L7). `claim` — fragment, który
 * dziecko wybrało; `picked` — zdanie, fragment albo wyraz wskazany jako dowód;
 * `kind` — o jaką relację pyta polecenie (pominięte = dowolna).
 */
export function judgeEvidence(
  k: Korpus,
  claim: string,
  picked: string,
  kind?: string
): EvidenceVerdict {
  const candidates = k.anchors.filter((a) => !kind || a.kind === kind);
  const own = candidates.find((a) => pickHits(k, claim, a.from) && pickHits(k, picked, a.to));
  if (own) return { ok: true, anchor: own };
  const other = k.anchors.find((a) => pickHits(k, picked, a.to));
  if (other) return { ok: false, reason: 'cudzy-dowod', owner: other.from, kind: other.kind };
  return { ok: false, reason: 'brak-dowodu' };
}

/** Fragmenty, które mają kotwicę danego rodzaju — „ile jest do znalezienia”. */
export function anchorsOfKind(k: Korpus, kind: string): AnchorDef[] {
  return k.anchors.filter((a) => a.kind === kind);
}

export interface HighlightVerdict {
  /** Cele zakreślone w co najmniej `minCover` wyrazów. */
  hits: string[];
  misses: string[];
  /** Zakreślone wyrazy spoza wszystkich celów. */
  extras: string[];
  complete: boolean;
}

/**
 * Zakreślacz: `marked` — id zakreślonych tokenów, `targets` — id fragmentów
 * albo zdań, które powinny być zakreślone. Interpunkcja się nie liczy.
 * `maxExtras` — ile wyrazów poza celami toleruje werdykt `complete`.
 */
export function judgeHighlight(
  k: Korpus,
  marked: Iterable<string>,
  targets: string[],
  { minCover = 0.6, maxExtras = 0 }: { minCover?: number; maxExtras?: number } = {}
): HighlightVerdict {
  const set = new Set(marked);
  const inTargets = new Set<string>();
  const hits: string[] = [];
  const misses: string[] = [];
  for (const target of targets) {
    const words = wordsOf(k, target);
    words.forEach((w) => inTargets.add(w.id));
    const covered = words.filter((w) => set.has(w.id)).length;
    (words.length && covered / words.length >= minCover ? hits : misses).push(target);
  }
  const extras = [...set].filter((id) => k.tokenById[id]?.type === 'word' && !inTargets.has(id));
  return { hits, misses, extras, complete: misses.length === 0 && extras.length <= maxExtras };
}

const norm = (s: string) => s.trim().toLocaleLowerCase('pl').replace(/\s+/g, ' ');

export type GapVerdict =
  | { ok: true }
  /** Dobre słowo (ten sam lemat), zła forma — „pasuje, ale nie w tej postaci”. */
  | { ok: false; reason: 'forma'; lemma: string }
  | { ok: false; reason: 'inne-slowo' };

/**
 * Luka: w miejsce tokenu `gapId` dziecko wstawiło `placed`. Przyjmuje formę
 * z tekstu i `accept` (inne poprawne formy). Rozpoznaje „to samo słowo w złej
 * formie” po lemacie z tabeli analiz tekstu.
 */
export function judgeGap(k: Korpus, gapId: string, placed: string, accept: string[] = []): GapVerdict {
  const token = k.tokenById[gapId];
  if (!token) return { ok: false, reason: 'inne-slowo' };
  const answer = norm(placed);
  if ([token.form, ...accept].some((f) => norm(f) === answer)) return { ok: true };
  const lemma = token.morph?.lemma;
  const placedLemmas = (k.morph[answer] ?? []).map((m: Morph) => m.lemma);
  if (lemma && placedLemmas.includes(lemma)) return { ok: false, reason: 'forma', lemma };
  return { ok: false, reason: 'inne-slowo' };
}

/** Wyrazy spełniające warunek (np. `isFirstPersonPlural`), w kolejności tekstu. */
export function findWords(k: Korpus, pred: (t: Token) => boolean): Token[] {
  return k.tokens.filter((t) => t.type === 'word' && pred(t));
}

/**
 * Wyrazy, których analiza jest niepewna: wiele analiz o różnych częściach mowy
 * i brak ujednoznacznienia w tekście. Lekcja, której sędzia czyta część mowy
 * albo kategorię, musi mieć tę listę pustą dla swoich wyrazów (selftest).
 */
export function ambiguousWords(k: Korpus): Token[] {
  return findWords(k, (t) => {
    if (t.resolved) return false;
    const classes = new Set((t.alternatives ?? []).map((m) => schoolPos(m)));
    return classes.size > 1;
  });
}

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Trafienie palcem w wyraz liczone geometrią (wzorzec z L4 historii — nie
 * `elementFromPoint`): najpierw prostokąt, który zawiera punkt, a dopiero
 * potem najbliższy w promieniu `slack` (drugi wybór, żeby przy złamanej
 * linijce nie łapać wyrazu z wiersza wyżej).
 */
export function tokenAtPoint(
  rects: { id: string; rect: Rect }[],
  x: number,
  y: number,
  slack = 8
): string | null {
  for (const { id, rect } of rects) {
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return id;
  }
  let best: string | null = null;
  let bestDist = slack;
  for (const { id, rect } of rects) {
    const dx = Math.max(rect.left - x, 0, x - rect.right);
    const dy = Math.max(rect.top - y, 0, y - rect.bottom);
    const d = Math.hypot(dx, dy);
    if (d <= bestDist) {
      bestDist = d;
      best = id;
    }
  }
  return best;
}

/** Zakres tokenów między dwoma (włącznie), w kolejności tekstu — zakreślanie pociągnięciem. */
export function tokenRange(k: Korpus, a: string, b: string): string[] {
  const ia = k.tokenById[a]?.index;
  const ib = k.tokenById[b]?.index;
  if (ia === undefined || ib === undefined) return [];
  const [from, to] = ia <= ib ? [ia, ib] : [ib, ia];
  return k.tokens.slice(from, to + 1).map((t) => t.id);
}

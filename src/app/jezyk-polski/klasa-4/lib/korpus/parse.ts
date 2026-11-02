/**
 * `buildKorpus()` — źródło tekstu ze znacznikami (`KorpusSource`) → `Korpus`.
 * Czysta funkcja; wołaj ją raz na poziomie modułu lekcji (`const K = buildKorpus(SRC)`),
 * nie w renderze. Błędy w danych (niezamknięty `[[`, kotwica do nieistniejącego
 * id) rzucają wyjątek — mają wyjść w selfteście, nie u dziecka.
 */

import { schoolPos } from './pos';
import { sentenceBreaks, tokenize, type RawToken } from './split';
import type {
  Korpus,
  KorpusSource,
  Morph,
  SchoolPos,
  Span,
  SpanMeta,
  Token,
  Unit,
} from './types';

interface Override {
  lemma?: string;
  tag?: string;
  pos?: SchoolPos;
  id?: string;
}

interface Marked {
  clean: string;
  spans: { id: string; start: number; end: number }[];
  /** Klucz: pozycja końca wyrazu w `clean`. */
  overrides: Map<number, Override>;
}

const SPAN_ID = /^[a-z0-9-]+$/;

function parseOverride(raw: string): Override {
  if (raw.startsWith('#')) return { id: raw.slice(1) };
  const [main, pos] = raw.split('=');
  const out: Override = {};
  if (pos) out.pos = pos as SchoolPos;
  if (main) {
    const bar = main.indexOf('|');
    if (bar === -1) {
      out.lemma = main;
    } else {
      if (bar > 0) out.lemma = main.slice(0, bar);
      if (main.slice(bar + 1)) out.tag = main.slice(bar + 1);
    }
  }
  return out;
}

/** Zdejmuje znaczniki `[[id …]]` i `{…}`, zapamiętując, gdzie stały. */
function stripMarkup(body: string): Marked {
  let clean = '';
  const spans: Marked['spans'] = [];
  const overrides = new Map<number, Override>();
  let open: { id: string; start: number } | null = null;
  let i = 0;
  while (i < body.length) {
    if (body.startsWith('[[', i)) {
      if (open) throw new Error(`korpus: zagnieżdżony fragment w „${open.id}”`);
      const space = body.indexOf(' ', i + 2);
      const id = body.slice(i + 2, space);
      if (space === -1 || !SPAN_ID.test(id)) throw new Error(`korpus: zły identyfikator fragmentu przy „${body.slice(i, i + 20)}”`);
      open = { id, start: clean.length };
      i = space + 1;
      continue;
    }
    if (body.startsWith(']]', i)) {
      if (!open) throw new Error(`korpus: „]]” bez otwarcia przy „${body.slice(Math.max(0, i - 20), i)}”`);
      spans.push({ id: open.id, start: open.start, end: clean.length });
      open = null;
      i += 2;
      continue;
    }
    if (body[i] === '{') {
      const close = body.indexOf('}', i);
      if (close === -1) throw new Error('korpus: niezamknięte „{”');
      const prev = overrides.get(clean.length) ?? {};
      overrides.set(clean.length, { ...prev, ...parseOverride(body.slice(i + 1, close)) });
      i = close + 1;
      continue;
    }
    clean += body[i];
    i++;
  }
  if (open) throw new Error(`korpus: niezamknięty fragment „${open.id}”`);
  return { clean, spans, overrides };
}

/** Akapity/strofy: kawałki tekstu rozdzielone pustą linią, z pozycją początku. */
function splitBlocks(clean: string): { text: string; start: number }[] {
  const out: { text: string; start: number }[] = [];
  const re = /\n[ \t]*\n/g;
  let from = 0;
  let m: RegExpExecArray | null;
  const push = (to: number) => {
    const text = clean.slice(from, to);
    if (text.trim()) out.push({ text, start: from });
  };
  while ((m = re.exec(clean))) {
    push(m.index);
    from = m.index + m[0].length;
  }
  push(clean.length);
  return out;
}

function shift(tokens: RawToken[], by: number): RawToken[] {
  return tokens.map((t) => ({ ...t, start: t.start + by, end: t.end + by }));
}

export function buildKorpus(src: KorpusSource): Korpus {
  const morphTable = src.morph ?? {};
  const { clean, spans: spanRanges, overrides } = stripMarkup(src.body);

  // Zdania/wersy jako listy surowych tokenów.
  const unitsRaw: { block: number; tokens: RawToken[] }[] = [];
  splitBlocks(clean).forEach((block, blockIndex) => {
    if (src.layout === 'verse') {
      let lineStart = block.start;
      for (const line of block.text.split('\n')) {
        const toks = shift(tokenize(line), lineStart);
        if (toks.length) unitsRaw.push({ block: blockIndex, tokens: toks });
        lineStart += line.length + 1;
      }
    } else {
      const toks = shift(tokenize(block.text), block.start);
      let from = 0;
      for (const end of sentenceBreaks(toks)) {
        unitsRaw.push({ block: blockIndex, tokens: toks.slice(from, end + 1) });
        from = end + 1;
      }
    }
  });

  const tokens: Token[] = [];
  const units: Unit[] = [];
  const blocks: string[][] = [];
  const usedIds = new Set<string>();

  unitsRaw.forEach((raw, unitIndex) => {
    const unitId = `${src.layout === 'verse' ? 'v' : 's'}${unitIndex}`;
    const tokenIds: string[] = [];
    raw.tokens.forEach((rt, k) => {
      const index = tokens.length;
      const ov = rt.type === 'word' ? overrides.get(rt.end) : undefined;
      const id = ov?.id ?? `t${index}`;
      if (usedIds.has(id)) throw new Error(`korpus: powtórzony identyfikator wyrazu „${id}”`);
      usedIds.add(id);

      const token: Token = {
        id,
        index,
        type: rt.type,
        form: rt.form,
        // Ostatni token wersu/zdania: odstęp dokłada renderer.
        after: k === raw.tokens.length - 1 ? '' : rt.after,
        unitId,
        spanIds: spanRanges.filter((s) => rt.start >= s.start && rt.end <= s.end).map((s) => s.id),
      };

      if (rt.type === 'word') {
        const alternatives = morphTable[rt.form.toLowerCase()] ?? [];
        let morph: Morph | undefined = alternatives[0];
        if (ov?.tag || ov?.lemma) {
          const byTag = ov.tag ? alternatives.find((a) => a.tag === ov.tag) : undefined;
          morph = {
            lemma: ov.lemma ?? byTag?.lemma ?? alternatives[0]?.lemma ?? rt.form.toLowerCase(),
            tag: ov.tag ?? byTag?.tag ?? alternatives[0]?.tag ?? '',
          };
        }
        token.alternatives = alternatives;
        if (morph) token.morph = morph;
        token.pos = ov?.pos ?? (morph ? schoolPos(morph) : undefined);
        token.resolved = Boolean(ov && (ov.tag || ov.lemma || ov.pos));
      }

      tokens.push(token);
      tokenIds.push(id);
    });

    const unit: Unit = {
      id: unitId,
      index: unitIndex,
      kind: src.layout === 'verse' ? 'verse' : 'sentence',
      block: raw.block,
      tokenIds,
      text: tokens
        .slice(tokens.length - tokenIds.length)
        .map((t) => t.form + t.after)
        .join(''),
    };
    units.push(unit);
    (blocks[raw.block] ??= []).push(unitId);
  });

  const tokenById = Object.fromEntries(tokens.map((t) => [t.id, t]));
  const unitById = Object.fromEntries(units.map((u) => [u.id, u]));

  const spans: Record<string, Span> = {};
  for (const range of spanRanges) {
    if (spans[range.id]) throw new Error(`korpus: powtórzony fragment „${range.id}”`);
    const tokenIds = tokens.filter((t) => t.spanIds.includes(range.id)).map((t) => t.id);
    if (!tokenIds.length) throw new Error(`korpus: pusty fragment „${range.id}”`);
    const meta: SpanMeta = src.spans?.[range.id] ?? { kind: 'fragment' };
    spans[range.id] = {
      id: range.id,
      meta,
      tokenIds,
      unitIds: [...new Set(tokenIds.map((tid) => tokenById[tid].unitId))],
    };
  }
  for (const id of Object.keys(src.spans ?? {})) {
    if (!spans[id]) throw new Error(`korpus: metadane fragmentu „${id}”, którego nie ma w tekście`);
  }

  const anchors = src.anchors ?? [];
  const known = (id: string) => Boolean(spans[id] || unitById[id] || tokenById[id]);
  for (const a of anchors) {
    if (!known(a.from) || !known(a.to)) {
      throw new Error(`korpus: kotwica ${a.kind} ${a.from} → ${a.to} wskazuje nieistniejące id`);
    }
  }

  return {
    id: src.id,
    layout: src.layout,
    tokens,
    tokenById,
    units,
    unitById,
    blocks: blocks.filter(Boolean),
    spans,
    anchors,
    morph: morphTable,
  };
}

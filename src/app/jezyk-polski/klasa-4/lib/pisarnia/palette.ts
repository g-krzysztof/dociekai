/**
 * Zamknięta paleta słów (§ 6, warstwa 2): lekcja podaje dziecku słowa, a
 * Pisarnia rozpoznaje je **we wszystkich formach odmiany** — z paradygmatów
 * wygenerowanych offline (`scripts/polski-paradygmaty.py` → `*.forms.ts`).
 * To nie jest słownik rdzeni zgadujący dowolną myśl: rozpoznajemy tylko słowa,
 * które sami podaliśmy.
 */

import type { CompiledPalette, FormsTable, PaletteEntry, PaletteHit, PisWord } from './types';

const norm = (s: string) => s.toLowerCase().trim().split(/\s+/).filter(Boolean);

/**
 * Kompiluje paletę raz, na poziomie modułu lekcji. Lemat bez wpisu w `forms`
 * daje tylko samą formę słownikową — w dev to ostrzeżenie, bo zwykle znaczy,
 * że zapomniano przegenerować `*.forms.ts`.
 */
export function compilePalette(entries: PaletteEntry[], forms: FormsTable = {}): CompiledPalette {
  const index: CompiledPalette['index'] = new Map();
  const seenIds = new Set<string>();
  for (const entry of entries) {
    if (seenIds.has(entry.id)) throw new Error(`Paleta: powtórzone id „${entry.id}”`);
    seenIds.add(entry.id);
    const all = new Set<string>();
    for (const lemma of entry.lemmas ?? []) {
      const table = forms[lemma];
      if (!table && process.env.NODE_ENV !== 'production') {
        console.warn(`Paleta: brak paradygmatu „${lemma}” — uruchom scripts/polski-paradygmaty.py`);
      }
      for (const f of table ?? [lemma]) all.add(f.toLowerCase());
    }
    for (const f of entry.forms ?? []) all.add(f.toLowerCase().trim());
    for (const form of all) {
      const words = norm(form);
      if (!words.length) continue;
      const bucket = index.get(words[0]) ?? [];
      if (!bucket.some((c) => c.entry === entry && c.words.join(' ') === words.join(' '))) {
        bucket.push({ entry, words });
      }
      index.set(words[0], bucket);
    }
  }
  for (const bucket of index.values()) bucket.sort((a, b) => b.words.length - a.words.length);
  return { entries, index };
}

/**
 * Trafienia palety w wyrazach tekstu. Zwrot kilkuwyrazowy musi stać w jednym
 * zdaniu, wyraz po wyrazie. Na jednej pozycji wygrywa najdłuższy zwrot, a
 * wyrazy już trafione nie zaczynają nowego trafienia tego samego wpisu.
 */
export function findPaletteHits(words: PisWord[], palette: CompiledPalette): PaletteHit[] {
  const hits: PaletteHit[] = [];
  let i = 0;
  while (i < words.length) {
    const w = words[i];
    const candidates = palette.index.get(w.low);
    let matched: { entry: PaletteEntry; words: string[] } | undefined;
    for (const c of candidates ?? []) {
      const ok = c.words.every((cw, k) => {
        const other = words[i + k];
        return other && other.sentence === w.sentence && other.low === cw;
      });
      if (ok) {
        matched = c;
        break;
      }
    }
    if (!matched) {
      i++;
      continue;
    }
    const last = words[i + matched.words.length - 1];
    const prev = words[i - 1];
    hits.push({
      entryId: matched.entry.id,
      group: matched.entry.group,
      words: matched.words.map((_, k) => i + k),
      start: w.start,
      end: last.end,
      sentence: w.sentence,
      negated: !!prev && prev.sentence === w.sentence && prev.low === 'nie',
    });
    i += matched.words.length;
  }
  return hits;
}

/** Wpisy palety użyte w tekście (bez powtórzeń, w kolejności pierwszego użycia). */
export function usedEntries(hits: PaletteHit[]): string[] {
  return [...new Set(hits.map((h) => h.entryId))];
}

/** Grupy palety użyte w tekście, z pominięciem zaprzeczonych („nie cieszę się”), jeśli `skipNegated`. */
export function usedGroups(hits: PaletteHit[], skipNegated = false): string[] {
  return [
    ...new Set(hits.filter((h) => h.group && !(skipNegated && h.negated)).map((h) => h.group as string)),
  ];
}

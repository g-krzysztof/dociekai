/**
 * Kontrola książki Czytelni (`src/app/jezyk-polski/klasa-4/data/czytelnia/<id>/`).
 *
 *   node scripts/polski-czytelnia-check.mjs <id> [--wl <plik.txt>]
 *
 * Sprawdza: każdy odcinek buduje się w `buildKorpus` (żadnych znaczników
 * `[[`, `{`, które parser wziąłby za adnotację), `ODC_N_WORDS` = liczba słów
 * odcinka, odcinki mają 300–1600 słów, a z `--wl` — że odcinki złożone razem
 * to **ciągły fragment** pliku tekstowego Wolnych Lektur (po ujednoliceniu
 * białych znaków), czyli tekst autora co do znaku. Wypisuje raport, kod 1
 * przy błędzie.
 */

import { build } from 'esbuild';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const id = args[0];
const wlIdx = args.indexOf('--wl');
const wlFile = wlIdx >= 0 ? args[wlIdx + 1] : null;
if (!id) {
  console.error('użycie: polski-czytelnia-check.mjs <id-książki> [--wl <plik.txt>]');
  process.exit(2);
}

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-czyt-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
await writeFile(
  entry,
  `export * as BOOK from '${resolve(root, `src/app/jezyk-polski/klasa-4/data/czytelnia/${id}/index.ts`)}';\n` +
    `export { buildKorpus } from '${resolve(root, 'src/app/jezyk-polski/klasa-4/lib/korpus/index.ts')}';\n`
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const book = Object.values(lib.BOOK).find((v) => v && typeof v === 'object' && Array.isArray(v.episodes));
let failed = 0;
const fail = (m) => {
  failed += 1;
  console.log('  ✗', m);
};
if (!book) {
  console.log('✗ index.ts nie eksportuje obiektu CzytelniaBook');
  process.exit(1);
}
console.log(`${book.registry} „${book.title}” — ${book.author}${book.translator ? `, tłum. ${book.translator}` : ''}`);

const countWords = (t) => t.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
const norm = (t) =>
  t
    .replace(/\r/g, '')
    .replace(/[ \t ]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();

const bodies = [];
book.episodes.forEach((ep, i) => {
  if (ep.n !== i + 1) fail(`odcinek ${i + 1} ma n=${ep.n}`);
  let k;
  try {
    k = lib.buildKorpus(ep.source);
  } catch (e) {
    fail(`odc. ${ep.n}: buildKorpus rzuca: ${e.message}`);
    return;
  }
  const words = countWords(ep.source.body);
  if (words !== ep.words) fail(`odc. ${ep.n}: words=${ep.words}, a liczę ${words}`);
  if (words < 300 || words > 1600) fail(`odc. ${ep.n}: ${words} słów — poza 300–1600`);
  if (/\[\[|\]\]|[{}]/.test(ep.source.body)) fail(`odc. ${ep.n}: znaczniki adnotacji w tekście autora`);
  if (ep.source.id !== `${book.id}-${ep.n}`) fail(`odc. ${ep.n}: source.id=${ep.source.id}, oczekiwane ${book.id}-${ep.n}`);
  console.log(`  odc. ${ep.n} „${ep.title}”: ${words} słów, ${k.units.length} zdań, ${k.blocks.length} akapitów${ep.audio ? ', nagrany' : ''}`);
  bodies.push(ep.source.body);
});

if (wlFile) {
  // Nagłówki rozdziałów (same cyfry rzymskie/arabskie albo „Rozdział …”) nie wchodzą do odcinków.
  const wl = norm(
    (await readFile(wlFile, 'utf8'))
      .split('\n')
      .filter((line) => !/^\s*(?:[IVXLC]+|\d+)\.?\s*$|^\s*Rozdział\s/.test(line))
      .join('\n')
  );
  const joined = norm(bodies.join('\n\n'));
  if (wl.includes(joined)) console.log('  ✓ odcinki = ciągły fragment pliku WL (znak w znak)');
  else {
    // pierwsze miejsce rozjazdu — od początku pierwszego akapitu
    const start = wl.indexOf(joined.slice(0, 60));
    if (start < 0) fail('początek pierwszego odcinka nie występuje w pliku WL');
    else {
      let i = 0;
      while (i < joined.length && joined[i] === wl[start + i]) i += 1;
      fail(`rozjazd z WL po ${i} znakach: tekst „${joined.slice(i, i + 50)}” vs WL „${wl.slice(start + i, start + i + 50)}”`);
    }
  }
}

console.log(failed ? `✗ błędów: ${failed}` : '✓ OK');
process.exit(failed ? 1 : 0);

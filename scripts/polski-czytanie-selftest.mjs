/**
 * Selftest narzędzi czytania (E4c, zwrot 2026-10-19): sylaby na żądanie,
 * koniec pierwszej części odcinka (L2) na wszystkich odcinkach Czytelni,
 * odczyt ustawień z magazynu (zepsuty, pusty, brak `window`).
 *
 *   node scripts/polski-czytanie-selftest.mjs
 */

import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const K = 'src/app/jezyk-polski/klasa-4';
const dir = await mkdtemp(join(tmpdir(), 'polski-czytanie-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
await writeFile(
  entry,
  [
    `export * from '${resolve(root, `${K}/lib/czytelnia/sylaby.ts`)}';`,
    `export * from '${resolve(root, `${K}/lib/czytelnia/czytanie.ts`)}';`,
    `export { CZYTELNIA } from '${resolve(root, `${K}/data/czytelnia/index.ts`)}';`,
    `export { buildKorpus } from '${resolve(root, `${K}/lib/korpus/index.ts`)}';`,
  ].join('\n')
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

let pass = 0;
let fail = 0;
const check = (cond, label) => {
  if (cond) pass += 1;
  else {
    fail += 1;
    console.log('  ✗', label);
  }
};

// ── A. sylaby ──
const SYL = {
  mama: 'ma·ma',
  matka: 'mat·ka',
  książka: 'książ·ka',
  szkoła: 'szko·ła',
  kronikarz: 'kro·ni·karz',
  ziemia: 'zie·mia',
  Marysia: 'Ma·ry·sia',
  nauka: 'na·u·ka',
  dżungla: 'dżun·gla',
  pies: 'pies',
  chrząszcz: 'chrząszcz',
  w: 'w',
  siano: 'sia·no',
  nie: 'nie',
  uciekał: 'u·cie·kał',
  Maciuś: 'Ma·ciuś',
  pszczoła: 'pszczo·ła',
  zawołała: 'za·wo·ła·ła',
  dzieci: 'dzie·ci',
  Król: 'Król',
};
for (const [w, want] of Object.entries(SYL)) {
  const got = lib.sylaby(w).join('·');
  check(got === want, `A ${w}: ${got} ≠ ${want}`);
}
// Podział nie gubi ani nie dodaje liter, na każdym wyrazie Czytelni.
let words = 0;
let broken = 0;
for (const book of lib.CZYTELNIA)
  for (const ep of book.episodes) {
    const k = lib.buildKorpus(ep.source);
    for (const t of Object.values(k.tokenById)) {
      if (t.type === 'punct') continue;
      words += 1;
      if (lib.sylaby(t.form).join('') !== t.form) broken += 1;
    }
  }
check(words > 10000 && broken === 0, `A* sylaby sklejają się w wyraz (${broken} z ${words} wyrazów się rozjechało)`);

// ── B. koniec pierwszej części ──
for (const book of lib.CZYTELNIA) {
  const k = lib.buildKorpus(book.episodes[0].source);
  const p = lib.firstPart(k);
  check(p !== null, `B ${book.id}: odcinek 1 ma koniec pierwszej części`);
  if (!p) continue;
  const ids = k.blocks[p.block];
  check(ids[ids.length - 1] === p.unit, `B ${book.id}: część kończy się na ostatnim zdaniu akapitu`);
  check(p.block < k.blocks.length - 1, `B ${book.id}: po części zostaje jeszcze tekst`);
}
check(lib.firstPart(lib.buildKorpus({ id: 'krotki', layout: 'prose', body: 'Ala ma kota.\n\nKot ma Alę.\n\nKoniec.' })) === null, 'B krótki tekst nie ma części');

// ── C. ustawienia ──
const store = {};
globalThis.window = { localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => (store[k] = v) } };
check(JSON.stringify(lib.loadReading()) === JSON.stringify(lib.DEFAULT_READING), 'C pusty magazyn = domyślne');
lib.saveReading({ size: 2, wide: true, ruler: true });
check(lib.loadReading().size === 2 && lib.loadReading().ruler === true, 'C zapis i odczyt');
store['dociekai:pol-czytanie'] = '{zepsute';
check(lib.loadReading().size === lib.DEFAULT_READING.size, 'C zepsuty JSON = domyślne');
store['dociekai:pol-czytanie'] = JSON.stringify({ size: 7, wide: 'tak' });
check(lib.loadReading().size === 1 && lib.loadReading().wide === false, 'C złe wartości = domyślne');
globalThis.window = { localStorage: { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } } };
check(lib.loadReading().size === 1, 'C zablokowany magazyn = domyślne');
lib.saveReading({ size: 0, wide: false, ruler: false });
check(true, 'C zapis do zablokowanego magazynu nie rzuca');
check(lib.textClass({ size: 0, wide: true, ruler: false }).includes('text-[16px]!'), 'C klasa rozmiaru');

console.log(fail ? `✗ ${fail} błędów, ${pass} OK` : `✓ ${pass}/${pass} OK`);
process.exit(fail ? 1 : 0);

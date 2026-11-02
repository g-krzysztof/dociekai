/**
 * Selftest L6 „Moje zdanie” (`moje-zdanie/`) — talie lustrzane, rzut kartą,
 * sędzia zdania z „bo”, miejsce na planie.
 *
 *   node scripts/polski-l06-selftest.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l06-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
await writeFile(entry, [
  `export * from '${resolve(root, 'src/app/jezyk-polski/klasa-4/components/lessons/moje-zdanie/argumenty.ts')}';`,
  `export { analyze } from '${resolve(root, 'src/app/jezyk-polski/klasa-4/lib/pisarnia/index.ts')}';`,
].join('\n'));
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });
let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };

for (const s of ['ogrodek', 'boisko']) {
  const t = lib.talia(s);
  const r = t.map((id) => lib.rodzaj(id, s));
  check(t.length === 8 && new Set(t).size === 8, `A1 ${s}: 8 różnych kart`);
  for (const k of ['za', 'przeciw', 'powtorzenie', 'obok']) check(r.filter((x) => x === k).length === 2, `A2 ${s}: po 2 karty „${k}”`);
  check(r[0] !== 'za', `A3 ${s}: dobra karta nie leży na początku`);
  for (const id of t) {
    const w = lib.rzut(id, s);
    const k = lib.rodzaj(id, s);
    check(k === 'za' ? w.cel === s : k === 'przeciw' ? w.cel === lib.druga(s) : w.cel === 'odbita', `A4 ${s}/${id}: cel zgodny z rodzajem`);
  }
}
// Rodzaj widać w słowach: powtórzenia mają strukturę „X, bo X”, karty za stroną nazywają tę stronę.
for (const k of lib.KARTY) {
  if (k.powtorzenie) check(/bo/.test(k.text) && k.text.toLowerCase().split(' bo ')[1].includes(lib.STRONA_LABEL[k.strona].slice(0, 5)), `A5 ${k.id}: powtórzenie powtarza stronę po „bo”`);
  else if (k.strona) check(k.text.toLowerCase().includes(lib.STRONA_LABEL[k.strona].slice(0, 5)), `A6 ${k.id}: karta nazywa swoją stronę`);
  else check(!/boisk|ogród|ogródk|podwór/.test(k.text.toLowerCase()), `A7 ${k.id}: nie na temat nie dotyczy podwórka`);
}
const J = (t) => lib.judgePowod(lib.analyze(t));
const all = (t) => Object.values(J(t)).every((x) => x.ok);
check(all('Chcę boisko, bo zimą można na nim zrobić lodowisko.'), 'B1 dobre zdanie z „bo”');
check(all('Wybieram ogródek, ponieważ kwiaty są dla pszczół.'), 'B2 „ponieważ”');
check(!J('Chcę boisko.').spojnik.ok, 'B3 bez „bo”');
check(J('Bo tak.').spojnik.note.includes('Przed'), 'B4 nic przed „bo”');
check(J('Chcę boisko, bo.').spojnik.note.includes('Po'), 'B5 nic po „bo”');
check(!J('chcę boisko, bo jest duże.').zapis.ok, 'B6 mała litera');
check(!J('Chcę boisko, bo jest duże').zapis.ok, 'B7 bez kropki');
check(!J('Chcę boisko, bo jest duże. I fajne.').zapis.ok, 'B8 dwa zdania');
check(!J('Na boisku zmieszczą się wszystkie dzieci z kamienicy i jeszcze goście, bo tak.').swoj.ok, 'B9 przepisana karta');
check(J('Boisko, bo boisko jest lepsze.').swoj.ok === false, 'B10 powtórzenie z karty też jest kartą');
check(lib.miejsce(10) === 'ogrodek' && lib.miejsce(50) === 'granica' && lib.miejsce(90) === 'boisko', 'C1 miejsca na osi');
check(lib.komentarzMiejsca(90, 'ogrodek').includes('rozmowa'), 'C2 przesunięcie nazwane bez oceny');
check(!/łeś|łaś/.test(lib.komentarzMiejsca(90, 'ogrodek') + lib.komentarzMiejsca(50, 'boisko') + lib.komentarzMiejsca(10, 'ogrodek')), 'C3 komentarze bez rodzaju gramatycznego');
console.log(fail ? `✗ ${pass}/${pass + fail}` : `✓ ${pass}/${pass} OK`);
process.exit(fail ? 1 : 0);

/**
 * Selftest L2 „Ja, czytelnik” (`ja-czytelnik/`) — otwarcia z Czytelni, gust,
 * plan czytania (daty lokalne, zmiana czasu), tarcza wrażenia, własne słowo.
 *
 *   node scripts/polski-l02-selftest.mjs
 */

import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l02-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
const L = 'src/app/jezyk-polski/klasa-4/components/lessons/ja-czytelnik';
await writeFile(
  entry,
  [
    `export * from '${resolve(root, `${L}/degustacja.ts`)}';`,
    `export { OPENINGS, PLATE_INFO } from '${resolve(root, `${L}/otwarcia.ts`)}';`,
    `export { CZYTELNIA, bookById } from '${resolve(root, 'src/app/jezyk-polski/klasa-4/data/czytelnia/index.ts')}';`,
    `export { buildKorpus } from '${resolve(root, 'src/app/jezyk-polski/klasa-4/lib/korpus/index.ts')}';`,
  ].join('\n')
);
// `dlaczego-ta.tsx` ma `ownWordOk` — wycinamy samą funkcję, żeby nie bundlować Reacta.
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
const eq = (a, b, label) => check(JSON.stringify(a) === JSON.stringify(b), `${label}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);

const { PLATES, OPENINGS, bookById, buildKorpus } = lib;

// ── A. Otwarcia ──
check(PLATES.length === 6 && new Set(PLATES).size === 6, 'A1 sześć różnych talerzy');
for (const id of PLATES) {
  const o = OPENINGS[id];
  const book = bookById(id);
  check(!!book, `A2 ${id}: książka jest w Czytelni`);
  if (!book) continue;
  check(o.words >= 100 && o.words <= 230, `A3 ${id}: otwarcie ma ${o.words} słów (100–230)`);
  const full = buildKorpus(book.episodes[0].source);
  const same = o.units.every((u, i) => full.units[i]?.id === u && full.units[i].text === o.korpus.unitById[u].text);
  check(same, `A4 ${id}: zdania otwarcia = pierwsze zdania odcinka 1 (te same id i tekst)`);
  const low = o.korpus.units.map((u) => u.text).join(' ').toLowerCase();
  const title = book.title.toLowerCase().split(':')[0].trim();
  check(!low.includes(title), `A5 ${id}: otwarcie nie zdradza tytułu „${title}”`);
  check(book.episodes.every((ep) => !('audio' in ep)), `A6 ${id}: Czytelnia bez nagrań (zwrot 2026-10-19, § 3a)`);
  check(book.episodes.length >= 2 && book.episodes.length <= 7, `A7 ${id}: ${book.episodes.length} odcinków (2–7, plan na tydzień)`);
}
const genres = new Set(PLATES.map((id) => lib.PLATE_INFO[id].genre));
check(genres.size >= 5, `A8 stół ma różne gatunki (${genres.size})`);

// ── B. Gust ──
eq(lib.byCloseness({}), [...PLATES], 'B1 bez ruchów — kolejność stołu');
eq(lib.byCloseness({ 'zlota-kaczka': 90, krasnoludki: 80 }).slice(0, 2), ['zlota-kaczka', 'krasnoludki'], 'B2 najbliżej pierwsze');
check(!lib.hasPreference({}), 'B3 sześć na środku — brak gustu');
check(lib.hasPreference({ 'krol-macius': 70 }), 'B4 jeden przysunięty o 20 — jest gust');
check(!lib.hasPreference({ 'krol-macius': 60 }), 'B5 przesunięcie o 10 to za mało');
const msg = lib.gustMessage(['zlota-kaczka', 'krasnoludki', 'krol-macius'], lib.PLATE_INFO);
check(msg.includes('Złota kaczka') && msg.includes('legenda') && msg.includes('baśń'), 'B6 wniosek nazywa tytuły i gatunki');
check(!/łeś|łaś/.test(msg), 'B7 wniosek bez rodzaju gramatycznego');
check(msg.includes('to nie błąd'), 'B8 „inna kolejność to nie błąd”');

// ── C. Plan ──
eq(lib.nextDays('2026-10-23', 4), ['2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26'], 'C1 dni przez zmianę czasu (25 X)');
eq(lib.nextDays('2026-12-30', 4), ['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02'], 'C2 dni przez Nowy Rok');
eq(lib.nextDays('2028-02-28', 2), ['2028-02-28', '2028-02-29'], 'C3 rok przestępny');
eq(lib.localDate(new Date(2026, 9, 17, 23, 59)), '2026-10-17', 'C4 data lokalna o 23:59');
let plan = {};
plan = lib.addToDay(plan, '2026-10-19', 3);
plan = lib.addToDay(plan, '2026-10-19', 3);
plan = lib.addToDay(plan, '2026-10-21', 3);
const full = lib.addToDay(plan, '2026-10-22', 3);
check(full === plan, 'C5 czwarty żeton przy trzech odcinkach się nie kładzie');
eq(lib.episodesByDay(plan), { '2026-10-19': [1, 2], '2026-10-21': [3] }, 'C6 odcinki po kolei na dni');
eq(lib.planEnd(plan, 3), '2026-10-21', 'C7 koniec planu');
eq(lib.planEnd({ '2026-10-19': 1 }, 3), null, 'C8 plan niepełny — brak końca');
check(lib.endMessage(plan, 3) === 'Przy tym planie skończysz w środę, 21 października.', `C9 „w środę”: ${lib.endMessage(plan, 3)}`);
check(lib.endMessage({ '2026-10-25': 3 }, 3).includes('w niedzielę, 25 października'), 'C10 „w niedzielę”');
check(lib.endMessage({ '2026-10-24': 3 }, 3).includes('w sobotę'), 'C11 „w sobotę”');
check(lib.endMessage({ '2026-10-19': 1 }, 3) === 'Zostało 2 odcinki do rozłożenia.', `C12 ile zostało: ${lib.endMessage({ '2026-10-19': 1 }, 3)}`);
check(lib.endMessage({}, 3).startsWith('Połóż pierwszy'), 'C13 pusty plan');
eq(lib.removeFromDay({ '2026-10-19': 1 }, '2026-10-19'), {}, 'C14 zdjęcie ostatniego żetonu usuwa dzień');
eq(lib.removeFromDay({ a: 2 }, 'b'), { a: 2 }, 'C15 zdjęcie z pustego dnia nic nie zmienia');
check(lib.heavyDayNote(2, 8) === null, 'C16 dwa odcinki — bez podpowiedzi');
check(lib.heavyDayNote(3, 8)?.includes('24 minut'), 'C17 trzy odcinki — minuty');
eq(lib.dayParts('2026-10-17').weekend, true, 'C18 sobota to weekend');
eq(lib.dayParts('2026-10-19').short, 'pn', 'C19 poniedziałek „pn”');

// ── D. Tarcza ──
eq(lib.gaugeAngle(0), -90, 'D1 0 → −90°');
eq(lib.gaugeAngle(100), 90, 'D2 100 → 90°');
eq(lib.gaugeAngle(50), 0, 'D3 50 → pion');
eq(lib.gaugeFromPoint(130, 125, 130, 10), 50, 'D4 punkt nad środkiem → 50');
eq(lib.gaugeFromPoint(130, 125, 20, 125), 0, 'D5 punkt z lewej → 0');
eq(lib.gaugeFromPoint(130, 125, 240, 125), 100, 'D6 punkt z prawej → 100');
eq(lib.gaugeFromPoint(130, 125, 240, 200), 100, 'D7 poniżej z prawej → przycięte do 100');
eq(lib.gaugeLabel(10), 'nudno', 'D8 etykieta nisko');
eq(lib.gaugeLabel(95), 'nie mogę się oderwać', 'D9 etykieta wysoko');
check(lib.LOW_GAUGE === 30, 'D10 próg „wolno zmienić książkę”');

console.log(fail ? `✗ ${pass}/${pass + fail}` : `✓ ${pass}/${pass} OK`);
process.exit(fail ? 1 : 0);

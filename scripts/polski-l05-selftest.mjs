/**
 * Selftest L5 „Słucham uważnie” (`slucham-uwaznie/`) — pytanie, sklep, kuchnia,
 * ślady w notatce, karmienie Mruczka, kotwice wiadomości.
 *
 *   node scripts/polski-l05-selftest.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l05-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
const L = 'src/app/jezyk-polski/klasa-4/components/lessons/slucham-uwaznie';
await writeFile(entry, [
  `export * from '${resolve(root, `${L}/sklep.ts`)}';`,
  `export * from '${resolve(root, `${L}/wiadomosci.ts`)}';`,
  `export { buildKorpus } from '${resolve(root, 'src/app/jezyk-polski/klasa-4/lib/korpus/index.ts')}';`,
].join('\n'));
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };

// A. Pytanie
check(lib.odpowiedz('ser').nowe, 'A1 o ser pani Halina odpowiada');
for (const p of lib.PYTANIA.filter((x) => x.id !== 'ser')) check(!lib.odpowiedz(p.id).nowe && lib.odpowiedz(p.id).mowi.includes('Przecież mówiłam'), `A2 ${p.id}: „Przecież mówiłam”`);
const zak = lib.buildKorpus(lib.ZAKUPY);
for (const p of lib.PYTANIA) check(!!zak.spans[p.span], `A3 ${p.id}: fragment nagrania istnieje`);
check(!/\d/.test(lib.ZAKUPY.body) && !/\d/.test(lib.MRUCZEK.body), 'A4 liczby słownie w tekstach do TTS');

// B. Kuchnia
const ideal = { mleko: 2, 'chleb-niekrojony': 1, 'jablko-zielone': 4, 'ser-zolty': 1, drozdze: 1 };
check(lib.kuchnia(ideal).length === 0, 'B1 idealne zakupy — zero kłopotów');
const err = (k) => lib.kuchnia({ ...ideal, ...k });
check(err({ mleko: 1 })[0]?.span === 'mleko' && err({ mleko: 1 })[0].typ === 'liczba', 'B2 jeden litr mleka → liczba');
check(err({ 'chleb-niekrojony': 0, 'chleb-krojony': 1 }).some((b) => b.mowi.includes('Krojony') && b.typ === 'cecha'), 'B3 chleb krojony → cecha');
check(err({ 'jablko-zielone': 0, 'jablko-czerwone': 4 }).length === 1, 'B4 czerwone jabłka — jeden kłopot (bez podwójnego liczenia)');
check(err({ maslo: 1 })[0]?.typ === 'zmiana', 'B5 masło → zmiana zdania');
check(err({ 'ser-zolty': 0, 'ser-bialy': 1 })[0]?.typ === 'niewiadoma', 'B6 biały ser → niewiadoma');
check(err({ 'ser-zolty': 0 })[0]?.mowi.includes('A ser?'), 'B7 brak sera');
check(err({ drozdze: 0 })[0]?.mowi.includes('placka'), 'B8 bez drożdży');
check(err({ gruszka: 2 })[0]?.span === null && err({ gruszka: 2 })[0].typ === 'nadmiar', 'B9 nadmiar bez cytatu');
check(lib.kuchnia({}).length >= 5, 'B10 pusty koszyk — wiele kłopotów');
check(lib.kuchnia({}).every((b) => b.span === null || zak.spans[b.span]), 'B11 każdy cytat wskazuje istniejący fragment');
check(lib.PRODUKTY.every((p) => lib.REGALY.some((r) => r.id === p.regal)), 'B12 każdy produkt ma regał');
check(lib.regalPrzy(70, 27) === 'nabial' && lib.regalPrzy(150, 70) === null && lib.przyKasie(150, 175), 'B13 geometria planu');

// C. Ślady w notatce
const z = (t) => [...lib.zanotowane(t)].sort().join(',');
check(z('mleko 2 l\nchleb niekrojony\n4 jabłka zielone\nmasła nie\nser?\ndrożdże') === 'chleb,drozdze,jablka,maslo,mleko,ser', 'C1 pełna notatka');
check(z('mleko, chleb, jabłka, masło, drożdże') === 'drozdze', `C2 sama lista bez szczegółów: ${z('mleko, chleb, jabłka, masło, drożdże')}`);
check(z('dwa litry mleka') === 'mleko', 'C3 „dwa litry” słownie');
check(z('BEZ MASŁA') === 'maslo', 'C4 „bez masła” wielkimi literami');
check(z('maslo nie') === 'maslo', 'C5 bez polskich znaków');
check(z('drozdze') === 'drozdze', 'C6 drożdże bez ogonków');

// D. Mruczek
check(lib.mruczek('rano', { 'niebieska:mokra': 2 }).ok, 'D1 rano: 2 łyżki mokrej do niebieskiej');
check(lib.mruczek('wieczor', { 'zolta:sucha': 3 }).ok, 'D2 wieczór: 3 łyżki suchej do żółtej');
check(!lib.mruczek('rano', { 'zolta:mokra': 2 }).ok, 'D3 zła miska');
check(lib.mruczek('rano', { 'niebieska:sucha': 2 }).mowi.includes('suchej'), 'D4 zła karma');
check(lib.mruczek('rano', { 'niebieska:mokra': 1 }).mowi.includes('mało'), 'D5 za mało');
check(lib.mruczek('rano', { 'niebieska:mokra': 3 }).mowi.includes('Za dużo'), 'D6 za dużo');
check(lib.mruczek('wieczor', { 'zolta:sucha': 3, 'niebieska:mleko': 1 }).span === 'mleko', 'D7 mleko zawsze źle');
check(lib.mruczek('rano', {}).mowi.includes('Pusta'), 'D8 pusta miska');
const mru = lib.buildKorpus(lib.MRUCZEK);
check(['rano', 'wieczor', 'mleko'].every((s) => mru.spans[s]), 'D9 kotwice wiadomości o Mruczku');

console.log(fail ? `✗ ${pass}/${pass + fail}` : `✓ ${pass}/${pass} OK`);
process.exit(fail ? 1 : 0);

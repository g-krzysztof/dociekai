/**
 * Selftest L4 „Twarz i ton” (`twarz-i-ton/`) — odczyt Zuzi (twarz × ton),
 * klatki niemego filmu i sędzia zatrzymania, dowód z klatki, odpowiedź do Oli
 * (Pisarnia + paleta uczuć z odmianą).
 *
 *   node scripts/polski-l04-selftest.mjs
 */

import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l04-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
const L = 'src/app/jezyk-polski/klasa-4/components/lessons/twarz-i-ton';
const K = 'src/app/jezyk-polski/klasa-4';
await writeFile(
  entry,
  [
    `export * from '${resolve(root, `${L}/ton.ts`)}';`,
    `export * from '${resolve(root, `${L}/film.ts`)}';`,
    `export * from '${resolve(root, `${L}/odpowiedz.ts`)}';`,
    `export { UCZUCIA } from '${resolve(root, `${K}/data/uczucia.ts`)}';`,
    `export { FORMS } from '${resolve(root, `${K}/data/uczucia.forms.ts`)}';`,
    `export { analyze, compilePalette } from '${resolve(root, `${K}/lib/pisarnia/index.ts`)}';`,
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

// ── A. Twarz i ton ──
const { SYTUACJE, zuzia, trafione, odczytTwarzy } = lib;
const usmiech = { brwi: 0.3, oczy: 0.3, usta: 0.9 };
const gniew = { brwi: -0.9, oczy: -0.4, usta: -0.7 };
const nijaka = { brwi: 0, oczy: 0, usta: 0 };
const [tecza, sok] = SYTUACJE;
check(odczytTwarzy(usmiech) === 'radosc' && odczytTwarzy(gniew) === 'zlosc' && odczytTwarzy(nijaka) === 'nijaki', 'A1 odczyt twarzy');
check(trafione(tecza, usmiech, 'zachwyt'), 'A2 tęcza: uśmiech + zachwyt → Zuzia rozumie');
check(trafione(sok, gniew, 'zlosc'), 'A3 sok: gniew + złość → Zuzia rozumie');
check(!trafione(tecza, gniew, 'zlosc'), 'A4 tęcza złością — nie ta intencja');
check(zuzia(tecza, usmiech, 'zlosc').odczyt === 'sprzeczny', 'A5 uśmiech + groźny ton → sprzeczny');
check(zuzia(tecza, usmiech, 'zlosc').mowi.includes('Uśmiechasz się'), 'A6 Zuzia mówi, co się nie zgadza');
check(zuzia(sok, gniew, 'zachwyt').odczyt === 'sprzeczny', 'A7 groźna mina + radosny ton → sprzeczny');
check(zuzia(tecza, usmiech, 'obojetny').mowi.startsWith('Chyba'), 'A8 sama twarz — Zuzia niepewna');
check(!trafione(tecza, usmiech, 'obojetny'), 'A9 niepewność to jeszcze nie sukces');
check(zuzia(tecza, nijaka, 'obojetny').odczyt === 'nijaki', 'A10 nic nie widać i nic nie słychać');
check(zuzia(tecza, usmiech, null).mowi.includes('czeka') && zuzia(tecza, usmiech, null).scena, 'A11 bez tonu Zuzia czeka (opis sceny, nie kwestia)');
check(zuzia(tecza, gniew, 'zlosc').mowi.includes('Ola jest zła') && zuzia(tecza, gniew, 'obojetny').mowi.includes('Ola jest zła?'), 'A13 Ola — „zła”, nie „zły”');
check(zuzia(sok, gniew, 'zlosc').mowi.includes('Tymek jest zły'), 'A14 Tymek — „zły”');
check(zuzia(tecza, usmiech, 'zachwyt').mowi === 'Ola się cieszy!', 'A15 sukces bez pytajnika');
// Każdą sytuację da się trafić (siatka suwaków co 0,25).
const grid = [-1, -0.5, 0, 0.5, 1];
for (const s of SYTUACJE) {
  let any = false;
  for (const b of grid) for (const o of grid) for (const u of grid) if (trafione(s, { brwi: b, oczy: o, usta: u }, s.intencja === 'radosc' ? 'zachwyt' : 'zlosc')) any = true;
  check(any, `A12 ${s.id}: istnieje twarz, przy której Zuzia rozumie`);
}

// ── B. Film ──
const { poseAt, judgeStop, ZMIANY, KLATKI, judgeWiara, DLUGOSC } = lib;
check(poseAt(0).x < 10 && poseAt(2).krok !== 0, 'B1 na początku idzie');
check(poseAt(3).ramiona === 0 && poseAt(6).ramiona === 1, 'B2 ramiona opadają między 4 a 5 s');
check(poseAt(6).rece === 0 && poseAt(9).rece === 1, 'B3 ręce krzyżują się między 7 a 8 s');
check(poseAt(-5).x === poseAt(0).x && poseAt(99).rece === poseAt(DLUGOSC).rece, 'B4 czas przycięty');
check(Object.values(poseAt(4.37)).every((v) => Math.round(v * 100) / 100 === v), 'B5 poza zaokrąglona (hydracja)');
for (const z of ZMIANY) {
  const r = judgeStop(z.t);
  check(r.ok && r.zmiana === z.id, `B6 stop w ${z.t} s łapie „${z.id}”`);
}
check(!judgeStop(1.5).ok && judgeStop(1.5).mowi.includes('idzie'), 'B7 stop za wcześnie — idzie zwyczajnie');
check(!judgeStop(6.1).ok, 'B8 stop w środku bezruchu — nic się nie zmienia');
check(!judgeStop(9.8).ok && judgeStop(9.8).mowi.includes('Za późno'), 'B9 stop po zmianie');
check(judgeStop(4.6 + 0.85).ok && !judgeStop(4.6 + 1.0).ok, 'B10 tolerancja ±0,9 s');
check(judgeWiara('cialu', 'k9').ok && judgeWiara('cialu', 'k6').ok && !judgeWiara('cialu', 'k2').ok, 'B11 „ciału” — dowód z k6/k9');
check(!judgeWiara('slowom', 'k2').ok && judgeWiara('slowom', 'k2').mowi.includes('przed zmianą') && !judgeWiara('slowom', 'k9').ok, 'B12 „słowom” — klatka sprzed zmiany nie jest dowodem, komentarz korygujący');
check(KLATKI.every((k) => k.t > 0 && k.t < DLUGOSC), 'B13 klatki w czasie filmu');

// ── C. Odpowiedź do Oli ──
const P = lib.compilePalette(lib.UCZUCIA, lib.FORMS);
const run = (t) => {
  const m = lib.maskEmotki(t);
  const a = lib.analyze(m.text, { palette: P });
  const v = lib.judgeOdpowiedz(a, m.emotki);
  return { a, v, o: lib.czytaOla(a), m };
};
const ok = (t) => Object.values(run(t).v).every((x) => x.ok);
check(ok('Bardzo się cieszę!'), 'C1 „Bardzo się cieszę!”');
check(run('Bardzo się cieszę!').o.grupy[0] === 'radosc', 'C2 Ola czyta radość');
check(ok('Trochę ci zazdroszczę. Jaki on jest?'), 'C3 zazdrość + pytanie (2 zdania)');
check(run('Trochę ci zazdroszczę.').o.mowi.includes('zazdrościsz'), 'C4 Ola reaguje na zazdrość bez oceny');
check(ok('Cieszyłam się razem z tobą!'), 'C5 forma przeszła, żeńska („cieszyłam”)');
check(ok('Jestem ciekawa, jak ma na imię.'), 'C6 „ciekawa” (forma żeńska przymiotnika)');
check(ok('Jestem bardzo zaskoczony!'), 'C7 „zaskoczony” (imiesłów)');
check(run('Cieszę się, ale trochę zazdroszczę.').o.mowi.includes('Tak też bywa'), 'C8 sprzeczne uczucia — zakłopotana Ola, bez wyrzutu');
check(!ok('Nie cieszę się.') && run('Nie cieszę się.').v.uczucie.note.includes('czego nie czujesz'), 'C9 „nie cieszę się” — co czujesz?');
check(!ok('Super pies!') && run('Super pies!').v.uczucie.note.includes('palety'), 'C10 bez słowa uczucia');
check(!ok('cieszę się!') && run('cieszę się!').v.zapis.note.includes('małą literą'), 'C11 mała litera');
check(!ok('Cieszę się') && run('Cieszę się').v.zapis.note.includes('znaku'), 'C12 brak znaku');
check(!ok('Cieszę się. Bardzo. Naprawdę.'), 'C13 trzy zdania — za dużo');
check(run('Martwię się, czy będzie grzeczny.').o.grupy[0] === 'niepokoj', 'C14 niepokój');
check(run('Smutno mi, bo ja nie mam psa.').o.grupy[0] === 'smutek', 'C15 smutek');
check(run('Złoszczę się, bo też chciałem.').o.grupy[0] === 'zlosc', 'C16 złość');
check(lib.UCZUCIA.every((u) => (u.lemmas ?? []).every((l) => lib.FORMS[l]?.length)), 'C17 każdy lemat palety ma paradygmat');

check(run('super fajnie').v.zapis.note.includes('małą literą') && run('super fajnie').v.zapis.note.includes('nie ma znaku'), 'C18 zapis: obie usterki naraz');
check(ok('Cieszę się :)') && ok('Cieszę się! :)') && ok('Bardzo się cieszę 😊'), 'C19 emotka na końcu działa jak znak');
check(run('Cieszę się :) Jak ma na imię?').m.emotki.length === 1 && ok('Cieszę się :) Jak ma na imię?'), 'C20 emotka między zdaniami');
check(lib.maskEmotki('Cieszę się 😊').text.length === 'Cieszę się 😊'.length, 'C21 maska nie przesuwa pozycji');
check(!ok(':)') && !ok('Super :)') && run('Super :)').v.uczucie.note.includes('Buźka'), 'C22 sama buźka — potrzeba słowa');
check(run('Jestem ciekawa, jak ma na imię.').o.mowi.includes('Kropka'), 'C23 Ola odpowiada na pytanie o imię');
check(run('Cieszę się! Ile ma miesięcy?').o.mowi.includes('dwa miesiące'), 'C24 Ola odpowiada na pytanie o wiek');
check(!run('Cieszę się!').o.mowi.includes('Kropka'), 'C25 bez pytania — bez odpowiedzi');
check(lib.UCZUCIA.every((u) => !/^\p{Ll}+ść$/u.test(u.label)), 'C26 paleta: same zwroty, bez gołego rzeczownika');

console.log(fail ? `✗ ${pass}/${pass + fail}` : `✓ ${pass}/${pass} OK`);
process.exit(fail ? 1 : 0);

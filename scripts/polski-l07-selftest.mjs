/**
 * Selftest L7 „Co czuję, czego potrzebuję” (`emocje-i-potrzeby/`) — skutki
 * linii kłótni, dowody (właściciel i rodzaj), słowa-oskarżenia.
 *
 *   node scripts/polski-l07-selftest.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l07-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
await writeFile(entry, [
  `export * from '${resolve(root, 'src/app/jezyk-polski/klasa-4/components/lessons/emocje-i-potrzeby/klotnia.ts')}';`,
  `export { analyze, compilePalette } from '${resolve(root, 'src/app/jezyk-polski/klasa-4/lib/pisarnia/index.ts')}';`,
  `export { buildKorpus } from '${resolve(root, 'src/app/jezyk-polski/klasa-4/lib/korpus/index.ts')}';`,
].join('\n'));
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });
let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };

check(JSON.stringify(lib.POGARSZAJACE) === '["l2","l3","l5"]', `A1 pogarszające: ${lib.POGARSZAJACE}`);
check(lib.SCENA.filter((l) => l.kto === 'narrator').every((l) => !lib.pogarsza(l.id)), 'A2 narrator nigdy nie „pogarsza”');
check(lib.stukniecie('l0').mowi.includes('narrator'), 'A3 stuknięcie narratora — wyjaśnienie');
check(lib.stukniecie('l5').ok && lib.stukniecie('l5').mowi.includes('rozpłakała'), 'A4 „Jesteś okropna” — Zuzia płacze');
const n = lib.napiecie(lib.SCENA.length - 1);
check(n.tymek >= 3 && n.zuzia >= 3 && n.glosno >= 3, 'A5 napięcie rośnie do końca sceny');
for (let i = 1; i < lib.SCENA.length; i++) {
  const a = lib.napiecie(i - 1), b = lib.napiecie(i);
  check(b.tymek >= a.tymek && b.zuzia >= a.zuzia, `A6 napięcie nie spada (linia ${i})`);
}
check(lib.SCENA.every((l) => !/bij|uderz|kopn|szarp/.test(l.text.toLowerCase())), 'A7 bez przemocy fizycznej');

const k = lib.buildKorpus(lib.MODEL);
const J = (span, kto, r) => lib.judgeDowod(k.spans, span, kto, r);
check(J('u-tymek-2', 'tymek', 'uczucie').ok, 'B1 „Tymek poczerwieniał” — uczucie Tymka');
check(J('u-zuzia-2', 'zuzia', 'uczucie').ok, 'B2 „Zuzia rozpłakała się” — uczucie Zuzi');
check(J('p-tymek', 'tymek', 'potrzeba').ok && J('p-zuzia', 'zuzia', 'potrzeba').ok, 'B3 potrzeby z narratora');
check(!J('u-zuzia-2', 'tymek', 'uczucie').ok && J('u-zuzia-2', 'tymek', 'uczucie').mowi.includes('o Zuzi'), 'B4 cudzy dowód — o kim jest');
check(!J('p-tymek', 'tymek', 'uczucie').ok && J('p-tymek', 'tymek', 'uczucie').mowi.includes('Szukamy, co czuł'), 'B5 potrzeba zamiast uczucia');
check(!J('u-tymek-1', 'tymek', 'potrzeba').ok, 'B6 uczucie zamiast potrzeby');
check(!J(null, 'tymek', 'uczucie').ok, 'B7 brak fragmentu');
check(!/łeś|łaś/.test(Object.keys(k.spans).flatMap((s) => ['tymek', 'zuzia'].flatMap((who) => ['uczucie', 'potrzeba'].map((r) => J(s, who, r).mowi))).join(' ').replace(/czuł|chciał|robił|prosił|potrzebował/g, '')), 'B8 komunikaty bez zwracania się do dziecka w rodzaju');

const P = lib.compilePalette(lib.OSKARZENIA);
const hits = (t) => lib.analyze(t, { palette: P }).hits.map((h) => t.slice(h.start, h.end).toLowerCase());
check(hits('zawsze bierzesz moje rzeczy').includes('zawsze'), 'C1 „zawsze”');
check(hits('nigdy się nie bawisz').includes('nigdy'), 'C2 „nigdy”');
check(hits('ty jesteś niemiła').length === 1, 'C3 „ty jesteś”');
check(hits('jesteś okropna').length >= 1, 'C4 przezwisko');
check(hits('bierzesz skrzydło, które kleję od rana').length === 0, 'C5 zwykłe zdanie — nic');
check(hits('kiedy jesteś zajęty modelem').length === 0, 'C6 „jesteś zajęty” to nie oskarżenie');
check(hits('wynoś się').length === 1, 'C7 „wynoś się”');
// ── D. blok 3: taśma z luką (R4, 2026-10-19) ──
for (const strona of ['tymek', 'zuzia']) {
  const kiedy = lib.KIEDY[strona];
  const prosby = lib.PROSBY[strona];
  const zle = kiedy.filter((p) => lib.oskarza(p.text));
  check(zle.length === 1 && zle[0].z === lib.MOMENT[strona], `D1 ${strona}: jeden pasek „kiedy” oskarża i pochodzi z wyjętej klatki`);
  const momentIdx = lib.SCENA.findIndex((l) => l.id === lib.MOMENT[strona]);
  check(kiedy.every((p) => lib.SCENA.findIndex((l) => l.id === p.z) <= momentIdx), `D2 ${strona}: paski „kiedy” tylko z klatek do luki`);
  check(prosby.filter((p) => lib.oskarza(p.text)).length === 1, `D3 ${strona}: jedna prośba to rozkaz albo przezwisko`);
  // Każde ułożenie: werdykt ok ⇔ żaden pasek nie oskarża.
  for (const k of kiedy)
    for (const p of prosby) {
      const w = lib.ocen({ uczucie: 'smutek', kiedy: k.id, prosba: p.id }, strona);
      const spodziewane = !lib.oskarza(k.text) && !lib.oskarza(p.text);
      check(w.ok === spodziewane, `D4 ${strona} ${k.id}+${p.id}: ok=${w.ok}`);
      if (w.ok) check(/^Czuję smutek, kiedy .+\. Proszę, .+\.$/.test(w.zdanie), `D5 zdanie: ${w.zdanie}`);
      else check('slowo' in w && lib.jezySie(strona, w.slowo).includes(w.slowo), `D6 ${strona}: reakcja cytuje słowo`);
    }
  check(!lib.ocen({ uczucie: null, kiedy: kiedy[0].id, prosba: prosby[0].id }, strona).ok, `D7 ${strona}: bez uczucia nie gra`);
  check(lib.ocen({ uczucie: 'żal', kiedy: null, prosba: prosby[0].id }, strona).brak === 'kiedy', `D8 ${strona}: brak „kiedy”`);
}
console.log(fail ? `✗ ${pass}/${pass + fail}` : `✓ ${pass}/${pass} OK`);
process.exit(fail ? 1 : 0);

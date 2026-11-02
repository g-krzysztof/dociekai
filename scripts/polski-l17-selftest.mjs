/**
 * Selftest L17 „Małe słowa” — `male-slowa/domek.ts` (strefy domku, zdania o kocie),
 * `zaimki.ts` (opowiadanie, jasność zaimków, ocena) i `mapa.ts` (ślady wyspy, zdania mapy).
 *
 *   node scripts/polski-l17-selftest.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l17-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
const L = resolve(root, 'src/app/jezyk-polski/klasa-4/components/lessons/male-slowa');
await writeFile(entry, [
  `export * from '${L}/domek.ts';`,
  `export * from '${L}/zaimki.ts';`,
  `export * from '${L}/mapa.ts';`,
].join('\n') + '\n');
await build({
  entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error',
  alias: { '@': resolve(root, 'src') },
});
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });
let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };
const eq = (a, b, l) => check(JSON.stringify(a) === JSON.stringify(b), `${l} (oczekiwano ${JSON.stringify(b)}, jest ${JSON.stringify(a)})`);

const { SZER, WYS, STREFY, strefa, gdzie, wyrazenie, zdanieKota, dwieKoncowki, czescPierwszaGotowa, brakuje, ZDANIA, sprawdz,
  OPOWIADANIE, WYSTAPIENIA, jasnosc, ocen, przyklej, odklej, tekstZdania,
  CZESCI, POZYCJE, PROMIEN, zbudujMape, pierwszeZdanie, sladPod, odkryte, kartkaMapy } = lib;

// ── D. DOMEK ──
console.log('D. domek');
const wPolu = (s, x, y) => s.pola.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1);
{
  let zle = 0;
  for (let x = 0; x < SZER; x += 2) {
    for (let y = 0; y < WYS; y += 2) {
      const trafione = STREFY.filter((s) => wPolu(s, x, y));
      if (trafione.length !== 1 || gdzie(x, y) !== trafione[0].id) {
        zle += 1;
        if (zle <= 5) console.log('    punkt', x, y, trafione.map((s) => s.id), gdzie(x, y));
      }
    }
  }
  check(zle === 0, `D1 strefy rozłączne i pokrywające (${zle} złych punktów)`);
}
{
  const wyjatki = STREFY.filter((s) => gdzie(s.kotX, s.kotY - 1) !== s.id).map((s) => `${s.id}→${gdzie(s.kotX, s.kotY - 1)}`);
  check(wyjatki.length === 0, `D2 kotwice w swoich strefach (wyjątki: ${wyjatki.join(', ')})`);
}
for (const s of STREFY) {
  check(s.pola.some(([x0, y0, x1, y1]) => x1 - x0 >= 25 && y1 - y0 >= 25), `D3 ${s.id} ma pole ≥ 25×25`);
}
eq(gdzie(-50, 10), 'obok-szafy', 'D4 lewo poza płótnem');
eq(gdzie(240, -100), 'na-stole', 'D4 góra poza płótnem');
eq(gdzie(440, 9999), 'przed-koszem', 'D4 dół poza płótnem');
eq(gdzie(210, 40), 'na-stole', 'D5 nad stołem');
eq(gdzie(80, 10), 'na-szafie', 'D5 nad szafą');
eq(gdzie(350, 60), 'na-kanapie', 'D5 nad kanapą');
eq(gdzie(440, 160), 'w-koszu', 'D5 przy koszu');
for (const s of STREFY) {
  check(s.rz.length >= 1 && s.rz.every((r) => r.koncowka.length > 0 && r.forma.endsWith(r.koncowka)), `D6 ${s.id} końcówki`);
}
eq(wyrazenie(strefa('miedzy')), 'między stołem a kanapą', 'D6 wyrażenie między');
eq(wyrazenie(strefa('na-szafie')), 'na szafie', 'D6 wyrażenie na szafie');
eq(zdanieKota('pod-stolem'), 'Kot siedzi pod stołem.', 'D6 zdanieKota');
// 7. zdania
eq(ZDANIA.length, 6, 'D7 sześć zdań');
check(ZDANIA.every((z) => STREFY.some((s) => s.id === z.cel)), 'D7 cele istnieją');
check(ZDANIA.every((z) => z.tekst.includes(z.wyr)), 'D7 tekst zawiera wyr');
check(ZDANIA.every((z, i) => i === 0 || z.cel !== ZDANIA[i - 1].cel), 'D7 kolejne cele różne');
eq(new Set(ZDANIA.map((z) => z.cel)).size, 6, 'D7 wszystkie cele różne');
{
  let pary = 0;
  for (let i = 0; i < ZDANIA.length; i++) for (let j = i + 1; j < ZDANIA.length; j++) {
    const a = strefa(ZDANIA[i].cel), b = strefa(ZDANIA[j].cel);
    if (a.przyimek !== b.przyimek && a.rz.some((r) => b.rz.some((q) => q.lemat === r.lemat))) pary += 1;
  }
  check(pary >= 2, `D7 pary z tym samym lematem i innym przyimkiem (${pary})`);
}
// 8. sprawdz
{
  const z1 = ZDANIA.find((z) => z.id === 'z1'), z2 = ZDANIA.find((z) => z.id === 'z2');
  for (const z of ZDANIA) eq(sprawdz(z, z.cel), { ok: true }, `D8 ${z.id} przyjmuje cel`);
  const w = sprawdz(z2, 'na-stole');
  check(!w.ok && w.jest === 'na stole' && w.mowi === z2.wyr && w.tenSamMebel === true, `D8 z2 × na-stole ${JSON.stringify(w)}`);
  const w2 = sprawdz(z1, 'na-szafie');
  check(!w2.ok && w2.jest === 'na szafie' && w2.mowi === z1.wyr && w2.tenSamMebel === false, `D8 z1 × na-szafie ${JSON.stringify(w2)}`);
}
// 9. część pierwsza
{
  eq(czescPierwszaGotowa(['na-szafie', 'pod-stolem', 'miedzy', 'na-parapecie']), false, 'D9 cztery strefy');
  const piec = ['na-szafie', 'pod-stolem', 'miedzy', 'na-parapecie', 'przed-kanapa'];
  eq(dwieKoncowki(piec), null, 'D9 pięć bez lematu z dwiema formami');
  eq(czescPierwszaGotowa(piec), false, 'D9 pięć różnych bez dwóch końcówek');
  const dobre = ['na-stole', 'pod-stolem', 'na-szafie', 'w-koszu', 'na-kanapie'];
  eq(czescPierwszaGotowa(dobre), true, 'D9 komplet z stołem');
  eq(czescPierwszaGotowa(['na-stole', 'pod-stolem', 'na-stole', 'pod-stolem', 'na-stole', 'pod-stolem']), false, 'D9 duplikaty nie liczą się podwójnie');
  eq(dwieKoncowki(['na-stole', 'miedzy', 'miedzy'])?.lemat ?? null, null, 'D9 między nie liczy się do dwóch końcówek');
  eq(dwieKoncowki(['miedzy', 'pod-stolem', 'na-stole'])?.lemat, 'stół', 'D9 stół z dwiema końcówkami mimo między');
  for (const set of [[], ['na-stole'], piec, dobre, [...dobre, 'miedzy'], ['na-stole', 'pod-stolem', 'miedzy', 'w-koszu']]) {
    check((brakuje(set) === null) === czescPierwszaGotowa(set), `D9 brakuje ↔ gotowe ${JSON.stringify(set)}`);
  }
}

// ── Z. ZAIMKI ──
console.log('Z. zaimki');
eq(WYSTAPIENIA.length, 8, 'Z10 osiem wystąpień');
check(WYSTAPIENIA.every((w) => w.imie === 'Tymek' || w.imie.startsWith('Tymk')), 'Z10 imiona Tymk*');
eq(new Set(WYSTAPIENIA.map((w) => w.id)).size, 8, 'Z10 id unikalne');
eq(OPOWIADANIE.length, 9, 'Z10 dziewięć zdań');
const J = { t1: 'kto', t2: 'ktory', t3: 'jasne', t4: 'jasne', t5: 'jasne', t6: 'jasne', t7: 'ktory', t8: 'jasne' };
for (const [id, j] of Object.entries(J)) eq(jasnosc(id), j, `Z11 jasnosc ${id}`);
const F = { t1: 'on', t2: 'On', t3: 'on', t4: 'go', t5: 'On', t6: 'mu', t7: 'niego', t8: 'nim' };
for (const [id, f] of Object.entries(F)) eq(WYSTAPIENIA.find((w) => w.id === id)?.zaimek, f, `Z12 forma ${id}`);
{
  const jasne = ['t3', 't4', 't5', 't6', 't8'];
  const o0 = ocen([]);
  check(o0.imion === 8 && o0.przyjete === false, 'Z13 ocen([])');
  const o1 = ocen(jasne);
  check(o1.imion === 3 && o1.niejasne.length === 0 && o1.przyjete === true, `Z13 pięć jasnych ${JSON.stringify(o1)}`);
  const o2 = ocen(jasne.slice(1));
  check(o2.imion === 4 && o2.przyjete === false, 'Z13 cztery imiona');
  const o3 = ocen(WYSTAPIENIA.map((w) => w.id));
  eq(o3.imion, 0, 'Z13 wszystkie: imion 0');
  eq(o3.niejasne.map((x) => `${x.id}:${x.jak}`), ['t1:kto', 't2:ktory', 't7:ktory'], 'Z13 wszystkie: niejasne');
  eq(o3.przyjete, false, 'Z13 wszystkie: nieprzyjęte');
  const o4 = ocen([...jasne, 't2']);
  check(o4.imion === 2 && o4.przyjete === false, 'Z13 pięć jasnych + t2');
}
{
  const a = ['t3'];
  const b = przyklej(a, 't4');
  eq(b, ['t3', 't4'], 'Z14 przyklej dodaje');
  eq(przyklej(b, 't4'), ['t3', 't4'], 'Z14 nie dubluje');
  eq(przyklej(b, 'xyz'), ['t3', 't4'], 'Z14 nieznane id');
  eq(a, ['t3'], 'Z14 nie mutuje wejścia');
  eq(odklej(b, 't3'), ['t4'], 'Z14 odklej');
  eq(b, ['t3', 't4'], 'Z14 odklej nie mutuje');
}
eq(tekstZdania(3, ['t4']), 'Na parapecie spał rudy kot, ale go wcale nie zauważył.', 'Z15 zdanie 4');
{
  const t = tekstZdania(4, ['t5', 't6']);
  check(t.startsWith('On usiadł') && t.includes('wskoczył mu na kolana'), `Z15 zdanie 5: ${t}`);
}
for (let i = 0; i < OPOWIADANIE.length; i++) {
  const z = OPOWIADANIE[i];
  const pelne = z.kawalki.map((k) => ('imie' in k ? k.imie : k.t)).join('');
  check(pelne.trimEnd().endsWith('.'), `Z16 zdanie ${i + 1} kończy się kropką`);
  check(!/ {2}/.test(pelne) && !/ {2}/.test(tekstZdania(i, WYSTAPIENIA.map((w) => w.id))), `Z16 zdanie ${i + 1} bez podwójnych spacji`);
}

// ── M. MAPA ──
console.log('M. mapa');
const wyspa = {
  rzeczy: [
    { id: 'a', slowo: 'pies', x: 30, y: 50, imie: 'Burek' },
    { id: 'b', slowo: 'dom', x: 40, y: 40, ile: 3 },
    { id: 'c', slowo: 'nieznane', x: 1, y: 1 },
  ],
  nazwa: 'Mewia', tor: true,
  tort: { ksztalt: 'okragly', pietra: ['czekoladowy', 'czekoladowy'], kolor: 'rozowy' },
  kot: 'na-szafie',
};
{
  const m = zbudujMape({ rzeczy: [] }, null);
  check(m.startowe === true && m.rzeczy.length === 6, 'M17 wyspa startowa');
  eq([...new Set(m.slady.map((s) => s.czesc))].sort(), [...CZESCI].sort(), 'M17 ślady obejmują CZESCI');
  check(m.slady.find((s) => s.id === 'domek').zdanie.includes('w koszu'), 'M17 domek: w koszu');
}
{
  const m = zbudujMape(wyspa, 'Jutro popłynę łódką. Potem zjem tort.');
  check(m.startowe === false && m.rzeczy.length === 2, `M18 rzeczy ${m.rzeczy.length}`);
  const sl = (id) => m.slady.find((s) => s.id === id)?.zdanie ?? '';
  check(sl('rzecz-a').includes('Burek'), 'M18 pies z imieniem');
  check(sl('rzecz-b').includes('3 domy'), 'M18 3 domy');
  check(sl('nazwa').includes('Mewia'), 'M18 nazwa');
  check(sl('slup').includes('Jutro popłynę łódką.') && !sl('slup').includes('Potem'), 'M18 słup');
  check(sl('tort').includes('okrągły, dwupiętrowy, czekoladowy, różowy'), `M18 tort: ${sl('tort')}`);
  check(sl('domek').includes('na szafie'), 'M18 domek');
  // 23
  check(kartkaMapy(m, wyspa, 'Jutro popłynę łódką.').includes('Wyspa: Mewia'), 'M23 kartka: wyspa');
  const k = kartkaMapy(m, wyspa, null);
  check(k.includes('pies (Burek)'), 'M23 kartka: pies (Burek)');
  check(k.includes('Kot w domku przy latarni: na szafie'), 'M23 kartka: kot');
}
{
  const m = zbudujMape({ rzeczy: [], kot: 'xyz' }, null);
  check(m.slady.find((s) => s.id === 'domek').zdanie.includes('w koszu'), 'M19 nieznana strefa → w koszu');
}
eq(pierwszeZdanie('Ala ma kota. Kot ma Alę.'), 'Ala ma kota.', 'M20 pierwsze zdanie');
eq(pierwszeZdanie('Ala ma kota bez kropki'), 'Ala ma kota bez kropki', 'M20 bez kropki');
{
  const d = pierwszeZdanie('a'.repeat(200), 80);
  check(d.length <= 80 && d.endsWith('…'), `M20 długi przycięty (${d.length})`);
  const d2 = pierwszeZdanie('b'.repeat(200), 30);
  check(d2.length <= 30 && d2.endsWith('…'), `M20 długi max 30 (${d2.length})`);
}
{
  const m = zbudujMape(wyspa, null);
  const s0 = m.slady[0];
  eq(sladPod(m.slady, s0.x, s0.y)?.id, s0.id, 'M21 dokładnie w punkcie');
  eq(sladPod([{ id: 'x', czesc: 'zaimek', x: 50, y: 50, zdanie: '' }], 57.5, 50), null, 'M21 30 jednostek obok → null (PROMIEN 24)');
  eq(sladPod([{ id: 'x', czesc: 'zaimek', x: 50, y: 50, zdanie: '' }], 55, 50)?.id, 'x', 'M21 20 jednostek obok → trafia');
  const dwa = [{ id: 'a', czesc: 'zaimek', x: 50, y: 50, zdanie: '' }, { id: 'b', czesc: 'zaimek', x: 54, y: 50, zdanie: '' }];
  eq(sladPod(dwa, 53, 50)?.id, 'b', 'M21 bliższy z dwóch');
  eq(sladPod(dwa, 51, 50)?.id, 'a', 'M21 bliższy z dwóch (drugi)');
}
{
  const ks = Object.entries(POZYCJE);
  const bliskie = [];
  for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
    const d = Math.hypot(((ks[i][1].x - ks[j][1].x) * 400) / 100, ((ks[i][1].y - ks[j][1].y) * 300) / 100);
    if (d <= 2 * PROMIEN) bliskie.push(`${ks[i][0]}–${ks[j][0]}: ${d.toFixed(1)}`);
  }
  check(bliskie.length === 0, `M22 stałe ślady oddalone o > ${2 * PROMIEN}: ${bliskie.join('; ')}`);
}
check(odkryte(CZESCI) === true, 'M23 odkryte komplet');
check(odkryte(CZESCI.slice(1)) === false, 'M23 odkryte bez jednej');
check(odkryte([]) === false, 'M23 odkryte puste');

console.log(fail === 0 ? `✓ ${pass}/${pass} OK` : `✗ ${fail} błędów, ${pass} OK`);
process.exit(fail === 0 ? 0 : 1);

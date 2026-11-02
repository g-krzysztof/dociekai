/**
 * Selftest L14 „Słowo stawia rzecz” (`rzeczownik/rzeczy.ts`) — paleta wyrazów,
 * sędziowie trzech bloków oraz sprawdzenie rodzaju i form w SGJP.
 *
 *   node scripts/polski-l14-selftest.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l14-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
await writeFile(entry, `export * from '${resolve(root, 'src/app/jezyk-polski/klasa-4/components/lessons/rzeczownik/rzeczy.ts')}';\n`);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });
let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };
const eq = (a, b, l) => check(JSON.stringify(a) === JSON.stringify(b), `${l} (oczekiwano ${JSON.stringify(b)}, jest ${JSON.stringify(a)})`);
const throws = (f) => { try { f(); return false; } catch { return true; } };

const { SLOWA, slowo, stawia, upusc, wPlanszy, TABLICZKA, ocenTabliczke, ileNapis, dolozKopie, tabliczkiGotowe, TABLICZEK, ocenImie, POWOD_IMIENIA, upuscPsa, MAX_ILE } = lib;
const nouns = SLOWA.filter((s) => s.rodzaj);
const non = SLOWA.filter((s) => !s.rodzaj);

// ── A. SLOWA ──
eq(new Set(SLOWA.map((s) => s.id)).size, SLOWA.length, 'A0 id unikalne');
for (const s of SLOWA) {
  check(typeof s.tekst === 'string' && s.tekst.length > 0, `A1 ${s.id} ma tekst`);
  eq(slowo(s.id), s, `A2 slowo(${s.id})`);
}
for (const s of nouns) {
  check(Array.isArray(s.formy) && s.formy.length === 3, `A3 ${s.id} 3 formy`);
  check(s.formy.every((f) => typeof f === 'string' && f.length > 0), `A4 ${s.id} formy niepuste`);
  eq(s.formy[0], s.tekst, `A5 ${s.id} formy[0] = tekst`);
  check(['m', 'f', 'n'].includes(s.rodzaj), `A6 ${s.id} rodzaj poprawny`);
  check(stawia(s) === true, `A7 stawia(${s.id})`);
  eq(upusc(s), 'stoi', `A8 upusc(${s.id})`);
}
for (const r of ['m', 'f', 'n']) {
  check(nouns.filter((s) => s.rodzaj === r && s.policzalne !== false).length >= 2, `A9 ≥2 policzalne rodzaju ${r}`);
}
check(non.length >= 4, `A10 ≥4 nie-rzeczowniki (jest ${non.length})`);
for (const s of non) {
  check(!s.formy && !s.rodzaj, `A11 ${s.id} bez rodzaju i form`);
  check(stawia(s) === false, `A12 stawia(${s.id}) false`);
  eq(upusc(s), 'piasek', `A13 upusc(${s.id})`);
}
{
  const k = SLOWA.map((s) => !!s.rodzaj);
  let ok3 = true, ok4 = true;
  for (let i = 0; i + 2 < k.length; i++) if (!k[i] && !k[i + 1] && !k[i + 2]) { ok3 = false; console.log(`  (kolejność) trzy nie-rzeczowniki od ${SLOWA[i].id}`); }
  for (let i = 0; i + 3 < k.length; i++) if (k[i] && k[i + 1] && k[i + 2] && k[i + 3]) { ok4 = false; console.log(`  (kolejność) cztery rzeczowniki od ${SLOWA[i].id}`); }
  check(ok3, 'A14 nie ma trzech nie-rzeczowników z rzędu');
  check(ok4, 'A15 nie ma czterech rzeczowników z rzędu');
}
check(throws(() => slowo('nie-ma')), 'A16 slowo() rzuca dla nieznanego');
check(throws(() => slowo('')), 'A17 slowo("") rzuca');
for (const id of ['mgla', 'wiatr']) eq(slowo(id).policzalne, false, `A18 ${id} niepoliczalne`);

// ── B. wPlanszy ──
eq(wPlanszy(100, 50, 200, 100), { x: 50, y: 50 }, 'B1 środek');
eq(wPlanszy(0, 0, 200, 100), { x: 6, y: 6 }, 'B2 lewy górny przycięty');
eq(wPlanszy(200, 100, 200, 100), { x: 94, y: 94 }, 'B3 prawy dolny przycięty');
eq(wPlanszy(-50, 500, 200, 100), { x: 6, y: 94 }, 'B4 poza planszą');
eq(wPlanszy(1, 1, 100, 100), { x: 6, y: 6 }, 'B5 1% → 6');
eq(wPlanszy(6, 94, 100, 100), { x: 6, y: 94 }, 'B6 brzeg dokładny');
eq(wPlanszy(333, 100, 1000, 300), { x: 33.3, y: 33.3 }, 'B7 zaokrąglenie do 0,1');
eq(wPlanszy(1, 1, 3, 3), { x: 33.3, y: 33.3 }, 'B8 1/3 → 33,3');
eq(wPlanszy(2, 2, 3, 3), { x: 66.7, y: 66.7 }, 'B9 2/3 → 66,7');
for (const [px, py] of [[10, 20], [50, 80], [137, 91], [199, 3]]) {
  const r = wPlanszy(px, py, 200, 100);
  check(r.x >= 6 && r.x <= 94 && r.y >= 6 && r.y <= 94, `B10 ${px},${py} w zakresie`);
  check(Math.abs(r.x * 10 - Math.round(r.x * 10)) < 1e-9 && Math.abs(r.y * 10 - Math.round(r.y * 10)) < 1e-9, `B11 ${px},${py} jedno miejsce po przecinku`);
}

// ── C. ocenTabliczke, ileNapis, dolozKopie ──
eq(TABLICZKA, { m: 'ten', f: 'ta', n: 'to' }, 'C0 TABLICZKA');
for (const s of nouns) {
  for (const t of ['ten', 'ta', 'to']) {
    const r = ocenTabliczke(s, t);
    check(r.ok === (TABLICZKA[s.rodzaj] === t), `C1 ${s.id} + ${t} ok`);
    eq(r.brzmi, `${t} ${s.tekst}`, `C2 ${s.id} + ${t} brzmi`);
  }
}
for (const s of non) check(throws(() => ocenTabliczke(s, 'ten')), `C3 ocenTabliczke rzuca dla ${s.id}`);
for (const s of non) check(throws(() => ileNapis(s, 2)), `C3b ileNapis rzuca dla ${s.id}`);
for (const s of nouns) {
  eq(ileNapis(s, 1), s.formy[0], `C4 ${s.id} 1`);
  eq(ileNapis(s, 2), `${s.rodzaj === 'f' ? 'dwie' : 'dwa'} ${s.formy[1]}`, `C5 ${s.id} 2`);
  eq(ileNapis(s, 3), `trzy ${s.formy[1]}`, `C6 ${s.id} 3`);
  eq(ileNapis(s, 4), `cztery ${s.formy[1]}`, `C7 ${s.id} 4`);
  eq(ileNapis(s, 5), `pięć ${s.formy[2]}`, `C8 ${s.id} 5`);
}
eq(ileNapis(slowo('koza'), 5), 'pięć kóz', 'C9');
eq(ileNapis(slowo('koza'), 2), 'dwie kozy', 'C10');
eq(ileNapis(slowo('pies'), 2), 'dwa psy', 'C11');
eq(ileNapis(slowo('pies'), 5), 'pięć psów', 'C12');
eq(ileNapis(slowo('jablko'), 2), 'dwa jabłka', 'C13');
eq(ileNapis(slowo('jablko'), 5), 'pięć jabłek', 'C14');
eq(ileNapis(slowo('latarnia'), 5), 'pięć latarni', 'C15');
eq(ileNapis(slowo('latarnia'), 3), 'trzy latarnie', 'C16');
eq(MAX_ILE, 5, 'C17 MAX_ILE');
for (const [n, e] of [[1, 2], [2, 3], [3, 4], [4, 5], [5, 1]]) eq(dolozKopie(n), e, `C18 dolozKopie(${n})`);

// ── D. tabliczkiGotowe ──
{
  const rz = nouns.slice(0, TABLICZEK + 2).map((s, i) => ({ id: `r${i}`, slowo: s.id, x: 10, y: 10 }));
  const pierwsze = rz.slice(0, TABLICZEK);
  const dobre = Object.fromEntries(pierwsze.map((r) => [r.id, TABLICZKA[slowo(r.slowo).rodzaj]]));
  eq(TABLICZEK, 6, 'D0 TABLICZEK = 6');
  check(rz.length === TABLICZEK + 2, 'D0b dość rzeczowników w teście');
  eq(tabliczkiGotowe([], { tabliczki: {}, ile: {} }), false, 'D1 puste');
  eq(tabliczkiGotowe(rz, { tabliczki: {}, ile: { [rz[0].id]: 5 } }), false, 'D2 brak tabliczek');
  eq(tabliczkiGotowe(rz, { tabliczki: dobre, ile: {} }), false, 'D3 znaki dobre, nic nie policzone');
  eq(tabliczkiGotowe(rz, { tabliczki: dobre, ile: { [rz[0].id]: 4 } }), false, 'D4 policzone tylko do 4');
  eq(tabliczkiGotowe(rz, { tabliczki: dobre, ile: { [rz[2].id]: 5 } }), true, 'D5 komplet');
  for (const r of pierwsze) {
    const zly = { ...dobre, [r.id]: TABLICZKA[slowo(r.slowo).rodzaj] === 'ten' ? 'ta' : 'ten' };
    eq(tabliczkiGotowe(rz, { tabliczki: zly, ile: { [r.id]: 5 } }), false, `D6 zły znak przy ${r.id}`);
    const brak = { ...dobre }; delete brak[r.id];
    eq(tabliczkiGotowe(rz, { tabliczki: brak, ile: { [r.id]: 5 } }), false, `D7 brak znaku przy ${r.id}`);
    eq(tabliczkiGotowe(rz, { tabliczki: dobre, ile: { [r.id]: 5 } }), true, `D8 jedna policzona (${r.id}) wystarcza`);
  }
  // rzeczy ponad TABLICZEK są ignorowane
  eq(tabliczkiGotowe(rz, { tabliczki: dobre, ile: { [rz[0].id]: 5 } }), true, 'D9 nadmiarowe bez tabliczek ignorowane');
  eq(tabliczkiGotowe(rz, { tabliczki: dobre, ile: { [rz[7].id]: 5 } }), false, 'D10 policzona tylko nadmiarowa — nie liczy się');
  const zlyNadm = { ...dobre, [rz[6].id]: 'ten', [rz[7].id]: 'ta' };
  eq(tabliczkiGotowe(rz, { tabliczki: zlyNadm, ile: { [rz[0].id]: 5 } }), true, 'D11 złe znaki poza limitem ignorowane');
  eq(tabliczkiGotowe(rz.slice(0, 1), { tabliczki: { [rz[0].id]: TABLICZKA[slowo(rz[0].slowo).rodzaj] }, ile: { [rz[0].id]: 5 } }), true, 'D12 jedna rzecz wystarcza');
}

// ── E. ocenImie ──
for (const s of ['Burek', 'Ćma', 'Łajka', 'Zosia', 'Nowa Wyspa', 'Anna-Maria', '  Burek  ', 'Źrebak', 'Ola']) eq(ocenImie(s), { ok: true }, `E1 ok „${s}”`);
for (const s of ['burek', 'łódka', 'ćma', 'nowa Wyspa']) eq(ocenImie(s), { ok: false, powod: 'mala-litera' }, `E2 mała litera „${s}”`);
for (const s of ['Burek2', '7Burek', 'Bu2rek']) eq(ocenImie(s), { ok: false, powod: 'cyfry' }, `E3 cyfry „${s}”`);
for (const s of ['', '   ']) eq(ocenImie(s), { ok: false, powod: 'puste' }, `E4 puste „${s}”`);
for (const s of ['Bu!rek', '@Ola', '-Ola', '😀', 'Ola.']) eq(ocenImie(s), { ok: false, powod: 'znaki' }, `E5 znaki „${s}”`);
eq(ocenImie('A'.repeat(25)), { ok: false, powod: 'za-dlugie' }, 'E6 25 liter');
eq(ocenImie('A'.repeat(24)), { ok: true }, 'E7 24 litery ok');
for (const p of ['puste', 'mala-litera', 'cyfry', 'za-dlugie', 'znaki']) check(typeof POWOD_IMIENIA[p] === 'string' && POWOD_IMIENIA[p].length > 0, `E8 POWOD_IMIENIA.${p}`);
eq(Object.keys(POWOD_IMIENIA).sort(), ['cyfry', 'mala-litera', 'puste', 'za-dlugie', 'znaki'], 'E9 komplet powodów');
eq([...lib.DO_NAZWANIA], ['pies', 'latarnia', 'lodka'], 'E10 DO_NAZWANIA');
for (const id of lib.DO_NAZWANIA) check(stawia(slowo(id)), `E11 DO_NAZWANIA ${id} jest rzeczownikiem`);

// ── F. upuscPsa ──
{
  let r = upuscPsa([], 'pies');
  eq(r, { psy: [{ burek: false }], nowy: true }, 'F1 pierwszy pies');
  r = upuscPsa(r.psy, 'pies');
  eq(r.psy.length, 2, 'F2 drugi pies → dwa psy');
  eq(r.nowy, true, 'F3 drugi pies nowy');
  check(r.psy.every((p) => !p.burek), 'F4 oba bez imienia');
  let b = upuscPsa([], 'Burek');
  eq(b, { psy: [{ burek: true }], nowy: true }, 'F5 Burek pierwszy → jeden burek');
  const p0 = [{ burek: false }];
  b = upuscPsa(p0, 'Burek');
  eq(b.psy.length, 2, 'F6 Burek dodaje jednego psa');
  eq(b.psy.filter((p) => p.burek).length, 1, 'F7 jeden burek');
  eq(b.nowy, true, 'F8 nowy true');
  const b2 = upuscPsa(b.psy, 'Burek');
  check(b2.psy === b.psy, 'F9 Burek drugi raz — ta sama tablica');
  eq(b2.nowy, false, 'F10 nowy false');
  let psy = [];
  for (let i = 0; i < 8; i++) { psy = upuscPsa(psy, 'pies').psy; check(psy.length <= 4, `F11 po ${i + 1} psach ≤ 4`); }
  eq(psy.length, 4, 'F12 limit 4');
  const pelne = upuscPsa(psy, 'pies');
  eq(pelne.nowy, false, 'F13 pełne podwórko → nowy false');
  eq(pelne.psy.length, 4, 'F14 nadal 4');
  let bb = upuscPsa(psy, 'Burek');
  check(bb.psy.length <= 4 && bb.psy.some((p) => p.burek), 'F15 Burek przy pełnym podwórku mieści się w 4');
  eq(bb.nowy, true, 'F16 Burek przy pełnym nowy');
  const wej = [{ burek: false }, { burek: true }];
  const snap = JSON.stringify(wej);
  upuscPsa(wej, 'pies'); upuscPsa(wej, 'Burek');
  eq(JSON.stringify(wej), snap, 'F17 nie mutuje wejścia');
  const wej2 = [{ burek: false }];
  const s2 = JSON.stringify(wej2);
  upuscPsa(wej2, 'Burek'); upuscPsa(wej2, 'pies');
  eq(JSON.stringify(wej2), s2, 'F18 nie mutuje wejścia (2)');
  check(upuscPsa(wej2, 'pies').psy !== wej2, 'F19 pies → nowa tablica');
}

// ── G. SGJP ──
const SGJP = join(homedir(), '.cache/dociekai/sgjp-20260823.tab.gz');
if (!existsSync(SGJP)) {
  console.log('⚠ Brak zrzutu SGJP (' + SGJP + ') — pomijam sekcję G.');
} else {
  const need = new Map();
  const add = (f, lemat, opis, test) => { if (!need.has(f)) need.set(f, []); need.get(f).push({ lemat, opis, test }); };
  const parts = (t) => t.split(':');
  const isCase = (t, c) => (parts(t)[2] || '').split('.').includes(c);
  const subst = (t, l, c) => parts(t)[0] === 'subst' && parts(t)[1] === l && isCase(t, c);
  const mapGender = (g) => (g || '').split('.').map((x) => (/^m\d?$/.test(x) ? 'm' : x === 'f' ? 'f' : /^n\d?$/.test(x) ? 'n' : '?'));
  for (const s of nouns) {
    const [a, b, c] = s.formy;
    add(a, a, `${s.id} formy[0] „${a}” sg:nom`, (t) => subst(t, 'sg', 'nom'));
    add(a, a, `${s.id} rodzaj ${s.rodzaj} (sg:nom „${a}”)`, (t) => subst(t, 'sg', 'nom') && mapGender(parts(t)[3]).includes(s.rodzaj));
    add(b, a, `${s.id} formy[1] „${b}” pl:nom`, (t) => subst(t, 'pl', 'nom'));
    add(c, a, `${s.id} formy[2] „${c}” pl:gen`, (t) => subst(t, 'pl', 'gen'));
  }
  const nonTag = { biegac: ['inf', 'czasownik'], zielony: ['adj', 'przymiotnik'], wysoki: ['adj', 'przymiotnik'], szybko: ['adv', 'przysłówek'], pod: ['prep', 'przyimek'] };
  for (const s of non) {
    const exp = nonTag[s.id];
    check(!!exp, `G0 znam oczekiwany tag dla ${s.id}`);
    if (exp) add(s.tekst, s.tekst, `${s.id} „${s.tekst}” jako ${exp[1]}`, (t) => parts(t)[0] === exp[0]);
  }
  const found = new Map(), seen = new Map();
  const rl = createInterface({ input: createReadStream(SGJP).pipe(createGunzip()), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line || line[0] === '#') continue;
    const c = line.split('\t');
    const reqs = need.get(c[0]);
    if (!reqs) continue;
    const lem = (c[1] || '').split(':')[0];
    const tag = c[2] || '';
    for (const r of reqs) {
      if (lem !== r.lemat) continue;
      if (!seen.has(r)) seen.set(r, []);
      seen.get(r).push(tag);
      if (r.test(tag)) found.set(r, true);
    }
  }
  let nreq = 0;
  for (const [f, reqs] of need) for (const r of reqs) {
    nreq += 1;
    const tagi = seen.get(r);
    check(found.get(r) === true, `G ${r.opis}: „${f}” z lematem „${r.lemat}” ${tagi ? 'ma tylko tagi ' + [...new Set(tagi)].join(' | ') : 'nie istnieje w SGJP'}`);
  }
  console.log(`  (G: sprawdzono ${nreq} wymagań form w SGJP)`);
}

console.log(`\nL14 selftest: ${pass} OK, ${fail} błędów (${pass + fail} asercji)`);
process.exit(fail ? 1 : 0);

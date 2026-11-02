/**
 * Selftest L11 „Słowa mają kolor” (`slowa-maja-kolor/kolory.ts`) — dane,
 * pokrętło nastroju, zacięta pocztówka, lustro antonimów.
 *
 *   node scripts/polski-l11-selftest.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l11-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
await writeFile(entry, `export * from '${resolve(root, 'src/app/jezyk-polski/klasa-4/components/lessons/slowa-maja-kolor/kolory.ts')}';\n`);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });
let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };
const eq = (a, b, l) => check(JSON.stringify(a) === JSON.stringify(b), `${l} (oczekiwano ${JSON.stringify(b)}, jest ${JSON.stringify(a)})`);

// ── A. dane OPIS ──
const OPIS = lib.OPIS;
eq(OPIS.length, 6, 'A1 6 miejsc');
eq(new Set(OPIS.map((m) => m.id)).size, 6, 'A2 id unikalne');
eq(OPIS.filter((m) => m.prog === 1).length, 3, 'A3 trzy z progiem 1');
eq(OPIS.filter((m) => m.prog === 2).length, 3, 'A4 trzy z progiem 2');
eq(OPIS.map((m) => m.prog), [1, 2, 1, 2, 1, 2], 'A5 progi naprzemiennie');
for (const m of OPIS) {
  eq(m.wyrazy.length, 3, `A6 ${m.id} 3 wyrazy`);
  check(m.prog === 1 || m.prog === 2, `A7 ${m.id} prog ∈ {1,2}`);
  eq(new Set(m.wyrazy.map((w) => w.tekst)).size, 3, `A8 ${m.id} trzy różne formy`);
  for (const [i, w] of m.wyrazy.entries()) {
    check(typeof w.tekst === 'string' && w.tekst.trim().length > 0, `A9 ${m.id}[${i}] tekst niepusty`);
    if (w.znak !== undefined) check(w.tekst.includes(w.znak), `A10 ${m.id}[${i}] znak „${w.znak}” w „${w.tekst}”`);
  }
  check(m.przed.length > 0 || m.po.length > 0, `A11 ${m.id} ma otoczenie`);
}
eq(new Set(OPIS.flatMap((m) => m.wyrazy.map((w) => w.tekst))).size, 18, 'A12 18 form różnych w całości');
for (const m of OPIS) for (const b of [-1, 0, 1]) check(lib.wyraz(m, b) === m.wyrazy[b + 1], `A13 wyraz(${m.id},${b})`);

// ── B. biegunPrzy ──
const T1 = [-1, -1, 0, 1, 1], T2 = [-1, 0, 0, 0, 1];
const ds = [-2, -1, 0, 1, 2];
for (const m of OPIS) {
  const oczek = m.prog === 1 ? T1 : T2;
  for (const [i, d] of ds.entries()) eq(lib.biegunPrzy(m, d), oczek[i], `B1 ${m.id} d=${d}`);
}
const stan = (d) => OPIS.map((m) => lib.biegunPrzy(m, d));
const zmian = (a, b) => a.filter((x, i) => x !== b[i]).length;
eq(zmian(stan(0), stan(1)), 3, 'B2 0→1 zmienia 3 miejsca');
eq(zmian(stan(1), stan(2)), 3, 'B3 1→2 zmienia 3 miejsca');
eq(zmian(stan(0), stan(-1)), 3, 'B4 0→−1 zmienia 3 miejsca');
eq(zmian(stan(-1), stan(-2)), 3, 'B5 −1→−2 zmienia 3 miejsca');
eq(stan(0), [0, 0, 0, 0, 0, 0], 'B6 zapadka 0 = wszystko zwyczajnie');
eq(stan(2), [1, 1, 1, 1, 1, 1], 'B7 zapadka 2 = wszystko zachwyt');
eq(stan(-2), [-1, -1, -1, -1, -1, -1], 'B8 zapadka −2 = wszystko narzekanie');
eq(lib.ZAPADKI.map((z) => z.d), ds, 'B9 ZAPADKI d');
eq(lib.ZAPADKI.length, 5, 'B10 5 zapadek');

// ── C. zapadkaZKata / katZapadki ──
const zk = lib.zapadkaZKata;
const C = [[0, 0], [24, 0], [26, 1], [50, 1], [74, 1], [76, 2], [100, 2], [250, 2], [-26, -1], [-100, -2], [-999, -2], [-24, 0], [-76, -2], [-74, -1]];
for (const [k, d] of C) eq(zk(k), d, `C1 zapadkaZKata(${k})`);
eq(zk(NaN), 0, 'C2 NaN → 0');
for (const d of ds) {
  eq(lib.katZapadki(d), d * 50, `C3 katZapadki(${d})`);
  eq(zk(lib.katZapadki(d)), d, `C4 okrążenie ${d}`);
}
eq(lib.KAT_SKRAJNY, 100, 'C5 KAT_SKRAJNY');

// ── D. katZPunktu ──
const kp = lib.katZPunktu;
eq(kp(0, -1), 0, 'D1 góra');
eq(kp(1, 0), 90, 'D2 prawo');
eq(kp(-1, 0), -90, 'D3 lewo');
eq(kp(1, -1), 45, 'D4 prawa-góra');
eq(kp(-1, -1), -45, 'D5 lewa-góra');
eq(Math.abs(kp(0, 1)), 100, 'D6 dół → skraj');
eq(kp(1, 1), 100, 'D7 prawy dół');
eq(kp(-1, 1), -100, 'D8 lewy dół');
eq(kp(0, 0), 0, 'D9 środek');
{
  let ok = true, bad = '';
  for (let x = -5; x <= 5; x++) for (let y = -5; y <= 5; y++) {
    const w = kp(x * 0.7, y * 1.3);
    if (!Number.isInteger(w) || w < -100 || w > 100) { ok = false; bad = `${x},${y}→${w}`; }
  }
  check(ok, `D10 siatka: całkowite w [−100,100] ${bad}`);
}
eq(kp(0.001, -5), 0, 'D11 prawie pionowo');
eq(kp(5, -0.001), 90, 'D12 prawie poziomo');

// ── E. pokretloGotowe ──
const pg = lib.pokretloGotowe;
eq(pg([]), false, 'E1 []');
eq(pg([2]), false, 'E2 [2]');
eq(pg([-2]), false, 'E3 [−2]');
eq(pg([-2, 2]), true, 'E4 [−2,2]');
eq(pg([0, 1, 2, -1, -2]), true, 'E5 wszystkie');
eq(pg([0, 1, -1]), false, 'E6 bez skrajów');

// ── F. POCZTOWKA ──
const PO = lib.POCZTOWKA;
eq(PO.length, 6, 'F1 6 miejsc');
eq(new Set(PO.map((m) => m.id)).size, 6, 'F2 id unikalne');
for (const m of PO) {
  eq(m.wyrazy.length, 3, `F3 ${m.id} 3 wyrazy`);
  for (const i of [0, 2]) {
    check(typeof m.wyrazy[i].cecha === 'string' && m.wyrazy[i].cecha.length > 0, `F4 ${m.id}[${i}] ma cechę`);
  }
  check(m.wyrazy[1].cecha === undefined, `F5 ${m.id} zwyczajny bez cechy`);
  for (const [i, w] of m.wyrazy.entries()) {
    if (w.znak !== undefined) check(w.tekst.includes(w.znak), `F6 ${m.id}[${i}] znak „${w.znak}” w „${w.tekst}”`);
  }
  check(m.wyrazy[1].znak === undefined, `F7 ${m.id} zwyczajny bez znaku`);
}
const ST = lib.POCZTOWKA_START;
for (const m of PO) check(m.id in ST, `F8 start ma ${m.id}`);
eq(Object.keys(ST).length, 6, 'F9 start 6 kluczy');
eq(Object.values(ST).filter((b) => b === -1).length, 3, 'F10 3× −1');
eq(Object.values(ST).filter((b) => b === 1).length, 3, 'F11 3× +1');
check(typeof lib.POCZTOWKA_NAGLOWEK === 'string' && lib.POCZTOWKA_NAGLOWEK.length > 0, 'F12 nagłówek');
check(typeof lib.POCZTOWKA_PODPIS === 'string' && lib.POCZTOWKA_PODPIS.length > 0, 'F13 podpis');

// ── G. ocenPocztowke ──
const oc = lib.ocenPocztowke;
const ids = PO.map((m) => m.id);
const wszystkie = (b) => Object.fromEntries(ids.map((id) => [id, b]));
eq(oc(null, ST), { ok: false, powod: 'brak-wyboru' }, 'G1 cel null');
eq(oc(0, ST), { ok: false, powod: 'brak-wyboru' }, 'G2 cel 0');
eq(oc(undefined, ST), { ok: false, powod: 'brak-wyboru' }, 'G2b cel undefined');
const minus = ids.filter((id) => ST[id] === -1), plus = ids.filter((id) => ST[id] === 1);
eq(oc(1, ST), { ok: false, powod: 'odstaja', odstaja: PO.filter((m) => ST[m.id] === -1).map((m) => m.id) }, 'G3 start + cel 1');
eq(oc(1, ST).odstaja, minus, 'G4 odstaje = id z −1 (kolejność POCZTOWKA)');
eq(oc(-1, ST), { ok: false, powod: 'odstaja', odstaja: plus }, 'G5 start + cel −1');
eq(oc(1, wszystkie(1)), { ok: true, zgodne: ids }, 'G6 wszystkie +1, cel 1');
eq(oc(1, wszystkie(1)).zgodne.length, 6, 'G7 zgodne 6');
eq(oc(-1, wszystkie(-1)), { ok: true, zgodne: ids }, 'G8 wszystkie −1, cel −1');
eq(oc(1, wszystkie(0)), { ok: false, powod: 'zwyczajnie', zgodne: [] }, 'G9 wszystkie 0, cel 1');
eq(oc(-1, wszystkie(0)), { ok: false, powod: 'zwyczajnie', zgodne: [] }, 'G10 wszystkie 0, cel −1');
const mix = (n, b, reszta = 0) => Object.fromEntries(ids.map((id, i) => [id, i < n ? b : reszta]));
eq(oc(1, mix(2, 1)), { ok: false, powod: 'zwyczajnie', zgodne: ids.slice(0, 2) }, 'G11 dwa +1 reszta 0');
eq(oc(1, mix(2, 1)).zgodne.length, 2, 'G12 zgodne 2');
eq(oc(1, mix(3, 1)), { ok: true, zgodne: ids.slice(0, 3) }, 'G13 trzy +1 reszta 0');
eq(oc(1, mix(4, 1)).ok, true, 'G14 cztery +1');
eq(oc(-1, mix(2, -1)), { ok: false, powod: 'zwyczajnie', zgodne: ids.slice(0, 2) }, 'G15 dwa −1 reszta 0, cel −1');
eq(oc(-1, mix(3, -1)), { ok: true, zgodne: ids.slice(0, 3) }, 'G16 trzy −1 reszta 0, cel −1');
{
  const s = { ...mix(3, 1), [ids[5]]: -1 };
  eq(oc(1, s), { ok: false, powod: 'odstaja', odstaja: [ids[5]] }, 'G17 trzy +1, jeden −1, cel 1');
  const s2 = { ...mix(3, -1), [ids[5]]: 1 };
  eq(oc(-1, s2), { ok: false, powod: 'odstaja', odstaja: [ids[5]] }, 'G18 trzy −1, jeden +1, cel −1');
}
{
  const s = { [ids[0]]: 1, [ids[1]]: 1, [ids[2]]: 1 };
  eq(oc(1, s), { ok: true, zgodne: ids.slice(0, 3) }, 'G19 brakujące klucze = 0, cel 1');
  const s2 = { [ids[3]]: -1, [ids[4]]: -1, [ids[5]]: -1 };
  eq(oc(-1, s2), { ok: true, zgodne: ids.slice(3) }, 'G20 brakujące klucze = 0, cel −1');
  eq(oc(1, {}), { ok: false, powod: 'zwyczajnie', zgodne: [] }, 'G21 pusty stan, cel 1');
  eq(oc(1, { [ids[2]]: -1 }).odstaja, [ids[2]], 'G22 jeden −1 w pustym stanie');
}
eq(lib.MIN_ZGODNYCH, 3, 'G23 MIN_ZGODNYCH = 3');
// pełna tabela: dla każdej pary (cel, stan) ze wszystkich 3^6 stanów sprawdź spójność z regułą
{
  let ok = true, bad = '';
  const vals = [-1, 0, 1];
  for (const cel of [-1, 1]) for (let n = 0; n < 729; n++) {
    const s = {}; let x = n;
    for (const id of ids) { s[id] = vals[x % 3]; x = Math.floor(x / 3); }
    const przeciw = ids.filter((id) => s[id] === -cel).length;
    const zg = ids.filter((id) => s[id] === cel).length;
    const w = oc(cel, s);
    const exp = przeciw ? 'odstaja' : zg < 3 ? 'zwyczajnie' : 'ok';
    const got = w.ok ? 'ok' : w.powod;
    if (exp !== got) { ok = false; bad = `cel ${cel} stan ${JSON.stringify(s)}: ${got} ≠ ${exp}`; }
  }
  check(ok, `G24 wszystkie 1458 kombinacji zgodne z regułą ${bad}`);
}

// ── H. RZECZY / KARTY ──
const R = lib.RZECZY, K = lib.KARTY;
eq(R.length, 6, 'H1 6 rzeczy');
eq(new Set(R.map((r) => r.id)).size, 6, 'H2 id unikalne');
const zmylki = R.filter((r) => r.inne).map((r) => r.inne.slowo);
for (const r of R) {
  eq(K.filter((k) => k === r.przeciwne).length, 1, `H3 przeciwne „${r.przeciwne}” w KARTY raz`);
  if (r.inne) eq(K.filter((k) => k === r.inne.slowo).length, 1, `H4 zmyłka „${r.inne.slowo}” w KARTY raz`);
  check(r.slowo.length > 0, `H5 ${r.id} ma słowo`);
  check(r.przeciwne !== r.slowo, `H6 ${r.id} przeciwne ≠ słowo`);
}
eq(new Set(K).size, K.length, 'H7 KARTY bez duplikatów');
eq(K.length, 6 + zmylki.length, 'H8 długość KARTY = 6 + zmyłki');
{
  const wszystkieOk = new Set([...R.map((r) => r.przeciwne), ...zmylki]);
  check(K.every((k) => wszystkieOk.has(k)), 'H9 KARTY bez obcych słów');
}
{
  const poz = R.map((r) => K.indexOf(r.przeciwne)).sort((a, b) => a - b);
  const miedzy = K.slice(poz[0], poz[5] + 1).filter((k) => zmylki.includes(k)).length;
  check(miedzy >= 1, 'H10 między przeciwnymi jest zmyłka');
  let maxSeria = 0, seria = 0;
  for (const k of K) { if (R.some((r) => r.przeciwne === k)) { seria += 1; maxSeria = Math.max(maxSeria, seria); } else seria = 0; }
  check(maxSeria < 6, 'H11 przeciwne nie stoją w jednym bloku');
  check(maxSeria <= 2, `H12 serie przeciwnych ≤ 2 (jest ${maxSeria})`);
}
eq(zmylki.length, 3, 'H13 3 zmyłki');

// ── I. odbicie ──
const ob = lib.odbicie;
eq(ob(0, null), { rodzaj: 'puste' }, 'I1 null → puste');
eq(ob(-1, 'pusty'), { rodzaj: 'puste' }, 'I2 indeks −1 → puste');
eq(ob(6, 'pusty'), { rodzaj: 'puste' }, 'I3 indeks 6 → puste');
eq(ob(99, 'pusty'), { rodzaj: 'puste' }, 'I4 indeks 99 → puste');
for (const [i, r] of R.entries()) {
  eq(ob(i, r.przeciwne), { rodzaj: 'ostre', rzecz: r.id }, `I5 ${r.id} + przeciwne`);
  if (r.inne) {
    const o = ob(i, r.inne.slowo);
    eq(o.rodzaj, 'krzywe', `I6 ${r.id} + zmyłka → krzywe`);
    eq(o.rzecz, r.id, `I7 ${r.id} krzywe: rzecz`);
    check(o.lustro.includes('nie przeciwne'), `I8 ${r.id} lustro zawiera „nie przeciwne”`);
    eq(o.lustro, r.inne.lustro, `I9 ${r.id} lustro = tekst z danych`);
  }
  for (const [j, r2] of R.entries()) {
    if (j !== i) eq(ob(i, r2.przeciwne), { rodzaj: 'mgla', rzecz: r.id }, `I10 ${r.id} + przeciwne ${r2.id} → mgla`);
  }
}
{
  let ostre = 0, krzywe = 0, mgla = 0, inne = 0;
  for (let i = 0; i < 6; i++) for (const k of K) {
    const o = ob(i, k);
    if (o.rodzaj === 'ostre') ostre++; else if (o.rodzaj === 'krzywe') krzywe++; else if (o.rodzaj === 'mgla') mgla++; else inne++;
  }
  eq(ostre, 6, 'I11 macierz 6×9: 6 ostrych');
  eq(krzywe, 3, 'I12 macierz 6×9: 3 krzywe');
  eq(mgla, 45, 'I13 macierz 6×9: 45 mgieł');
  eq(inne, 0, 'I14 macierz: brak pustych');
}
eq(ob(0, 'nieznane').rodzaj, 'mgla', 'I15 nieznana karta → mgla');

// ── J. rzeczPod / srodekRzeczy ──
const rp = lib.rzeczPod;
eq(rp(0), 0, 'J1 0');
eq(rp(0.999), 5, 'J2 0.999');
eq(rp(1), 5, 'J3 1');
eq(rp(-0.2), 0, 'J4 −0.2');
eq(rp(1.5), 5, 'J5 1.5');
eq(rp(NaN), 0, 'J6 NaN');
eq(rp(0.17), 1, 'J7 0.17');
eq(rp(0.16), 0, 'J8 0.16');
eq(rp(Infinity), 0, 'J9 Infinity → 0 (nieskończoność nie jest skończona)');
for (let i = 0; i < 6; i++) {
  const s = lib.srodekRzeczy(i);
  check(s > i / 6 && s < (i + 1) / 6, `J10 środek ${i} w (${i}/6,${i + 1}/6): ${s}`);
  eq(rp(s), i, `J11 rzeczPod(srodekRzeczy(${i}))`);
}

// ── K. lustroGotowe ──
const lg = lib.lustroGotowe;
eq(lg([]), false, 'K1 []');
eq(lg(R.slice(0, 5).map((r) => r.id)), false, 'K2 5 id');
eq(lg(R.map((r) => r.id)), true, 'K3 6 id');
eq(lg([...R.map((r) => r.id), 'xyz']), true, 'K4 6 id + obce');
eq(lg(['kubek', 'kubek', 'kubek', 'kubek', 'kubek', 'kubek']), false, 'K5 powtórzone jedno');
eq(lib.TERMIN_PO, 3, 'K6 TERMIN_PO = 3');

console.log(`\nL11 selftest: ${pass} ok, ${fail} błędów`);
process.exit(fail ? 1 : 0);

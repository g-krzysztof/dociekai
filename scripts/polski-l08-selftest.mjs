/**
 * Selftest L8 „Moje wspólnoty” (`moje-wspolnoty/wspolnoty.ts`) — kręgi,
 * przypinanie odznak, sceny, podium, kartka Teczki, dane.
 *
 *   node scripts/polski-l08-selftest.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l08-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
await writeFile(entry, `export * from '${resolve(root, 'src/app/jezyk-polski/klasa-4/components/lessons/moje-wspolnoty/wspolnoty.ts')}';\n`);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });
let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };
const eq = (a, b, l) => check(JSON.stringify(a) === JSON.stringify(b), `${l} (oczekiwano ${JSON.stringify(b)}, jest ${JSON.stringify(a)})`);

// ── A. kręgi ──
const kz = lib.kragZOdleglosci;
eq(kz(0), null, 'A1 0 → null');
eq(kz(0.1), null, 'A2 0.1 → null');
eq(kz(0.14), 'dom', 'A3 0.14 → dom');
eq(kz(0.3), 'dom', 'A4 0.3 → dom');
eq(kz(0.32), 'klasa', 'A5 0.32 → klasa');
eq(kz(0.99), 'kraj', 'A6 0.99 → kraj');
eq(kz(1.0), 'kraj', 'A7 1.0 → kraj');
eq(kz(1.01), null, 'A8 1.01 → null');
eq(kz(NaN), null, 'A9 NaN → null');
check(Math.abs(lib.promienKregu(0) - 0.312) < 1e-9, 'A10 promienKregu(0) = 0.312');
for (let i = 0; i < 5; i++) {
  const p = lib.promienKregu(i);
  eq(kz(p - 1e-6), lib.KREGI[i].id, `A11.${i} tuż poniżej promienia ${i}`);
  if (i < 4) eq(kz(p + 1e-6), lib.KREGI[i + 1].id, `A12.${i} tuż powyżej promienia ${i}`);
}
eq(lib.kragZPunktu(0.5, 0.5), null, 'A13 środek planszy → null');
eq(lib.kragZPunktu(0.5, 0.02), 'kraj', 'A14 (0.5,0.02) → kraj');
eq(lib.kragZPunktu(0.02, 0.02), null, 'A15 róg → null');

// ── B. przypnij ──
const P = lib.przypnij;
const p1 = P([], 'kapitan', 0.5, 0.4);
check(p1 && p1.krag === 'dom' && p1.key === 'kapitan:1', 'B1 kapitan w domu, key kapitan:1');
const pr = P([], 'kapitan', 0.12345, 0.4);
check(pr && pr.x === 0.123, 'B2 x zaokrąglone do 3 miejsc');
const pr2 = P([], 'kapitan', 0.5, 0.123456);
check(pr2 && pr2.y === 0.123, 'B3 y zaokrąglone do 3 miejsc');
eq(P([p1], 'kapitan', 0.5, 0.35), null, 'B4 ta sama odznaka w tym samym kręgu → null');
const p2 = P([p1], 'kapitan', 0.5, 0.1);
check(p2 && p2.krag !== 'dom' && p2.key === 'kapitan:2', 'B5 ta sama odznaka w innym kręgu → kapitan:2');
eq(P([], 'xyz', 0.5, 0.4), null, 'B6 nieznana odznaka → null');
eq(P([], 'kapitan', 0.5, 0.5), null, 'B7 punkt w środku → null');
const w = P([], lib.WLASNA, 0.5, 0.4, 'harcerz');
check(w && w.wlasna === 'harcerz', 'B8 własna z tekstem');
for (const t of ['a', '123', '', undefined]) eq(P([], lib.WLASNA, 0.5, 0.4, t), null, `B9 własna z tekstem ${JSON.stringify(t)} → null`);
const w1 = P([], lib.WLASNA, 0.5, 0.4, 'harcerz');
const w2 = P([w1], lib.WLASNA, 0.5, 0.35, 'ministrant');
check(w1 && w2, 'B10 dwie różne własne w tym samym kręgu przyjęte');
eq(P([w1], lib.WLASNA, 0.5, 0.35, 'harcerz'), null, 'B11 ta sama własna w tym samym kręgu → null');
{
  const lst = [
    { key: 'kapitan:1', odznaka: 'kapitan', krag: 'dom', x: 0.5, y: 0.4 },
    { key: 'kibic:2', odznaka: 'kibic', krag: 'dom', x: 0.5, y: 0.4 },
    { key: 'lawka:3', odznaka: 'lawka', krag: 'dom', x: 0.5, y: 0.4 },
  ];
  eq(P(lst, 'sasiad', 0.5, 0.4).key, 'sasiad:4', 'B12 klucz max+1');
  const bez = [lst[0], lst[2]];
  eq(P(bez, 'sasiad', 0.5, 0.4).key, 'sasiad:4', 'B13 klucz max+1 po usunięciu środkowego');
  const bezOstatni = [lst[0], lst[1]];
  eq(P(bezOstatni, 'sasiad', 0.5, 0.4).key, 'sasiad:3', 'B14 klucz po usunięciu ostatniego');
}

// ── C. wlasnaOk ──
const ok = lib.wlasnaOk;
for (const t of ['harcerz', 'starsza siostra', 'kot/pies', '  harcerz  ', 'a'.repeat(24)]) check(ok(t) === true, `C1 „${t}” true`);
for (const t of ['a', '1abc', 'ab!', 'a'.repeat(25), '']) check(ok(t) === false, `C2 „${t}” false`);

// ── D. ileOdznak ──
const mk = (odznaka, krag, wlasna) => ({ key: `${odznaka}:${Math.random()}`, odznaka, krag, x: 0.5, y: 0.4, ...(wlasna ? { wlasna } : {}) });
eq(lib.ileOdznak([mk('kapitan', 'dom'), mk('kapitan', 'klasa')]), 1, 'D1 ta sama odznaka w dwóch kręgach = 1');
eq(lib.ileOdznak([mk('wlasna', 'dom', 'harcerz'), mk('wlasna', 'dom', 'ministrant')]), 2, 'D2 dwie różne własne = 2');
eq(lib.ileOdznak([]), 0, 'D3 pusta lista = 0');

// ── E. sceny ──
const ids = (l) => l.map((s) => s.id);
{
  const s0 = lib.sceny([]);
  eq(ids(s0), lib.SCENY_DOMYSLNE, 'E1 pusta lista → domyślne');
  check(s0.every((s) => s.zDziecka === false), 'E2 domyślne zDziecka false');
  const s1 = lib.sceny([mk('kibic', 'miejscowosc'), mk('kibic', 'kraj'), mk('wlasna', 'dom', 'harcerz'), mk('starsze', 'dom'), mk('lawka', 'klasa'), mk('dyzurny', 'klasa')]);
  eq(ids(s1), ['kibic', 'starsze', 'lawka'], 'E3 trzy z dziecka, bez powtórzeń i własnych');
  check(s1.every((s) => s.zDziecka), 'E4 wszystkie zDziecka true');
  const s2 = lib.sceny([mk('dyzurny', 'klasa')]);
  eq(ids(s2), ['dyzurny', 'kapitan', 'sasiad'], 'E5 jedna z dziecka + domyślne bez duplikatu');
  eq(s2.map((s) => s.zDziecka), [true, false, false], 'E6 zDziecka dla dyzurny/kapitan/sasiad');
  for (const [i, l] of [[0, []], [1, [mk('kibic', 'kraj')]], [2, [mk('kapitan', 'dom'), mk('sasiad', 'dom')]], [3, [mk('wlasna', 'dom', 'harcerz')]], [4, ['starsze', 'mlodsze', 'wnuk', 'zwierzak'].map((o) => mk(o, 'dom'))]]) {
    const r = lib.sceny(l);
    check(r.length === 3 && new Set(ids(r)).size === 3, `E7.${i} zawsze 3 unikalne`);
  }
}

// ── F. wyjmij / wloz / scenyGotowe ──
{
  const n = lib.nowaScena();
  check(n.wSrodku === true && n.widziane === false, 'F1 nowaScena');
  const A = ['a', 'b', 'c'];
  const fresh = () => ({ a: lib.nowaScena(), b: lib.nowaScena(), c: lib.nowaScena() });
  check(lib.scenyGotowe(A, fresh()) === false, 'F2 nietknięte → false');
  const st = fresh(); st.a = lib.wyjmij(st.a); st.b = lib.wyjmij(st.b); st.c = lib.wyjmij(st.c);
  check(lib.scenyGotowe(A, st) === false, 'F3 wyjęte bez wloz → false');
  const st2 = { a: lib.wloz(st.a), b: lib.wloz(st.b), c: lib.wloz(st.c) };
  check(lib.scenyGotowe(A, st2) === true, 'F4 wyjmij+wloz wszystkie → true');
  const st3 = { ...st2, c: lib.nowaScena() };
  check(lib.scenyGotowe(A, st3) === false, 'F5 jedna nie zrobiona → false');
  check(lib.scenyGotowe([], st2) === false, 'F6 pusta lista ids → false');
  check(lib.scenyGotowe(['x'], {}) === false, 'F7 brak stanu sceny → false');
  const w2 = lib.wyjmij(n);
  check(w2.wSrodku === false && w2.widziane === true && n.wSrodku === true, 'F8 wyjmij nie mutuje');
  const w3 = lib.wloz(w2);
  check(w3.wSrodku === true && w3.widziane === true, 'F9 wloz zachowuje widziane');
}

// ── G. postaw / podiumGotowe ──
{
  const SC = ['kibic', 'lawka', 'dyzurny'];
  const orig = JSON.stringify(lib.PUSTE_PODIUM);
  const r1 = lib.postaw(lib.PUSTE_PODIUM, 1, { wartosc: 'odwaga' }, SC);
  check(r1.podium && r1.podium[1].wartosc === 'odwaga', 'G1 wartość na miejsce 1');
  check(JSON.stringify(lib.PUSTE_PODIUM) === orig, 'G2 oryginał niezmutowany');
  const r2 = lib.postaw(r1.podium, 2, { wartosc: 'odwaga' }, SC);
  check(r2.podium && r2.podium[1].wartosc === null && r2.podium[2].wartosc === 'odwaga', 'G3 ta sama wartość przechodzi na miejsce 2');
  check(r1.podium[1].wartosc === 'odwaga', 'G4 poprzednie podium niezmutowane');
  const r3 = lib.postaw(lib.postaw(r1.podium, 1, { scena: 'kibic' }, SC).podium, 1, { wartosc: 'pomoc' }, SC);
  check(r3.podium[1].wartosc === 'pomoc' && r3.podium[1].scena === 'kibic', 'G5 nowa wartość zastępuje starą, scena zostaje');
  eq(lib.postaw(lib.PUSTE_PODIUM, 0, { scena: 'kibic' }, SC), { odrzut: 'najpierw-wartosc' }, 'G6 scena bez wartości');
  eq(lib.postaw(r1.podium, 1, { scena: 'obywatel' }, SC), { odrzut: 'nie-ma-takiej' }, 'G7 scena spoza listy');
  eq(lib.postaw(lib.PUSTE_PODIUM, 0, { wartosc: 'xyz' }, SC), { odrzut: 'nie-ma-takiej' }, 'G8 nieznana wartość');
  eq(lib.postaw(lib.PUSTE_PODIUM, -1, { wartosc: 'pomoc' }, SC), { odrzut: 'nie-ma-takiej' }, 'G9 miejsce -1');
  eq(lib.postaw(lib.PUSTE_PODIUM, 3, { wartosc: 'pomoc' }, SC), { odrzut: 'nie-ma-takiej' }, 'G10 miejsce 3');
  let pod = lib.postaw(lib.PUSTE_PODIUM, 0, { wartosc: 'pomoc' }, SC).podium;
  pod = lib.postaw(pod, 1, { wartosc: 'odwaga' }, SC).podium;
  pod = lib.postaw(pod, 0, { scena: 'kibic' }, SC).podium;
  const dwa = lib.postaw(pod, 1, { scena: 'kibic' }, SC);
  check(dwa.podium && dwa.podium[0].scena === 'kibic' && dwa.podium[1].scena === 'kibic', 'G11 ta sama scena przy dwóch wartościach');
  check(lib.podiumGotowe(lib.PUSTE_PODIUM) === false, 'G12 puste podium nie gotowe');
  let tri = lib.PUSTE_PODIUM;
  for (const [i, v] of [[0, 'pomoc'], [1, 'odwaga'], [2, 'spokój']]) tri = lib.postaw(tri, i, { wartosc: v }, SC).podium;
  check(lib.podiumGotowe(tri) === false, 'G13 trzy wartości bez scen → false');
  for (const [i, s] of [[0, 'kibic'], [1, 'lawka'], [2, 'dyzurny']]) tri = lib.postaw(tri, i, { scena: s }, SC).podium;
  check(lib.podiumGotowe(tri) === true, 'G14 trzy wartości ze scenami → true');
  check(lib.PUSTE_PODIUM.every((m) => m.wartosc === null && m.scena === null) && JSON.stringify(lib.PUSTE_PODIUM) === orig, 'G15 PUSTE_PODIUM nadal puste');
}

// ── H. kartkaTeczki ──
{
  const pp = [mk('kapitan', 'dom'), mk('kapitan', 'dom'), mk('kibic', 'miejscowosc'), mk('wlasna', 'klasa', 'harcerz')];
  const pod = [{ wartosc: 'odwaga', scena: 'kapitan' }, { wartosc: 'pomoc', scena: null }, { wartosc: null, scena: null }];
  const t = lib.kartkaTeczki(pp, pod);
  check(t.includes('Moje kręgi') && t.includes('Moje wartości'), 'H1 nagłówki');
  check(!t.includes('podwórko i kamienica:'), 'H2 krąg bez przypięć się nie pojawia');
  check(t.includes('dom: kapitan drużyny\n') || t.endsWith('dom: kapitan drużyny') || /dom: kapitan drużyny(\n|$)/.test(t), 'H3 duplikat odznaki w kręgu nie dubluje się');
  check(t.includes('klasa: harcerz'), 'H4 własna odznaka w linii');
  check(t.includes('1. odwaga — tu to widać: kapitan drużyny. Zbierasz ludzi razem.'), 'H5 linia podium ze sceną');
  check(t.includes('2. pomoc') && !t.includes('2. pomoc —'), 'H6 podium bez sceny');
  check(!t.includes('3.'), 'H7 puste miejsce pominięte');
  check(lib.kartkaTeczki(pp, pod, 'To jest moje zdanie.').endsWith('\n\nTo jest moje zdanie.'), 'H8 zdanie dopisane na końcu');
  check(lib.kartkaTeczki(pp, pod, '  zdanie z odstępami  ').endsWith('\n\nzdanie z odstępami'), 'H9 zdanie przycięte');
  check(lib.kartkaTeczki(pp, pod, '') === t && lib.kartkaTeczki(pp, pod, '   \n ') === t, 'H10 puste zdanie nic nie dodaje');
}

// ── I. dane ──
{
  const idsO = lib.ODZNAKI.map((o) => o.id);
  check(new Set(idsO).size === idsO.length, 'I1 id odznak unikalne');
  const kr = lib.KREGI.map((k) => k.id);
  check(lib.ODZNAKI.every((o) => kr.includes(o.zwykle)), 'I2 zwykle ∈ KREGI');
  check(lib.WARTOSCI.length === 10 && new Set(lib.WARTOSCI).size === 10, 'I3 WARTOSCI: 10 unikalnych');
  for (const o of lib.ODZNAKI) {
    const s = o.scena;
    check(!!s.z?.trim() && !!s.bez?.trim() && !!s.dajesz?.trim(), `I4 ${o.id}: niepuste z/bez/dajesz`);
    check(Number.isInteger(s.inni) && s.inni >= 0 && s.inni <= 3, `I5 ${o.id}: inni 0..3`);
    check(Array.isArray(s.rekwizyt) && s.rekwizyt.length === 2 && s.rekwizyt.every((x) => typeof x === 'string' && x), `I6 ${o.id}: rekwizyt długości 2`);
    check(!/\d/.test(o.label), `I7 ${o.id}: etykieta bez cyfr`);
  }
  check(lib.SCENY_DOMYSLNE.every((id) => idsO.includes(id)), 'I8 SCENY_DOMYSLNE istnieją w ODZNAKACH');
}

console.log(`polski-l08-selftest: ${pass} zaliczonych, ${fail} oblanych`);
process.exit(fail ? 1 : 0);

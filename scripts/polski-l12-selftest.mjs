/**
 * Selftest L12 „Słowa w parze” (`frazeologizmy/zwroty.ts`) — paski, próby,
 * geometria cięcia, półki, opowieść Zuzi, spójność słownika.
 *
 *   node scripts/polski-l12-selftest.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l12-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
await writeFile(entry,
  `export * from '${resolve(root, 'src/app/jezyk-polski/klasa-4/components/lessons/frazeologizmy/zwroty.ts')}';\n` +
  `export * from '${resolve(root, 'src/app/jezyk-polski/klasa-4/data/slownik/hasla.ts')}';\n`);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });
let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };
const eq = (a, b, l) => check(JSON.stringify(a) === JSON.stringify(b), `${l} (oczekiwano ${JSON.stringify(b)}, jest ${JSON.stringify(a)})`);
const throws = (f, l) => { let t = false; try { f(); } catch { t = true; } check(t, `${l} (powinno rzucić)`); };

// ── A. dane PASKI ──
const P = lib.PASKI;
eq(P.length, 10, 'A1 10 pasków');
eq(new Set(P.map((p) => p.id)).size, 10, 'A2 id unikalne');
eq(P.filter((p) => p.frazeologizm).length, 5, 'A3 5 związków');
eq(P.filter((p) => !p.frazeologizm).length, 5, 'A4 5 zwykłych');
check(!P[0].frazeologizm, 'A5 pierwszy pasek nie jest związkiem');
{
  let seria = 0, maxS = 0;
  for (const p of P) { if (p.frazeologizm) { seria += 1; maxS = Math.max(maxS, seria); } else seria = 0; }
  check(maxS < 3, `A6 brak 3 związków z rzędu (max ${maxS})`);
}
for (const p of P) {
  check(typeof p.slowo === 'string' && p.slowo.trim().length > 0, `A7 ${p.id} słowo niepuste`);
  check(p.szufladka.length >= 1 && p.szufladka.length <= 3, `A8 ${p.id} szufladka 1–3 (${p.szufladka.length})`);
  check(!p.szufladka.includes(p.slowo), `A9 ${p.id} szufladka bez słowa oryginalnego`);
  eq(new Set(p.szufladka).size, p.szufladka.length, `A10 ${p.id} szufladka bez duplikatów`);
  check(p.szufladka.every((s) => typeof s === 'string' && s.trim().length > 0), `A11 ${p.id} wyrazy szufladki niepuste`);
  check(p.przed.length > 0 && p.po.length > 0, `A12 ${p.id} przed i po niepuste`);
  check(p.zwrot.length > 0, `A13 ${p.id} nazwa do dziennika`);
  check(!!p.sens, `A14 ${p.id} ma rysunek sens`);
  if (p.frazeologizm) {
    const z = lib.zwrotKursu(p.frazeologizm);
    check(z !== undefined, `A15 ${p.id} zwrotKursu(${p.frazeologizm}) istnieje`);
    check(z && z.objasnienie.length > 0, `A16 ${p.id} objaśnienie niepuste`);
    check(z && z.zwrot.length > 0, `A16b ${p.id} zwrot niepusty`);
    check(!!p.doslownie, `A17 ${p.id} ma doslownie`);
  } else {
    check(p.doslownie === undefined, `A18 ${p.id} zwykły bez doslownie`);
  }
  const bez = lib.poWymianie(p, p.slowo);
  const kropka = /^[.,!?]/.test(p.po);
  eq(bez, `${p.przed} ${p.slowo}${kropka ? '' : ' '}${p.po}`, `A19 ${p.id} rekonstrukcja`);
  for (const s of [p.slowo, ...p.szufladka]) {
    const z = lib.popoWymianie?.(p, s) ?? lib.poWymianie(p, s);
    check(!/ {2,}/.test(z), `A20 ${p.id}/${s} bez podwójnych spacji`);
    check(!/\s[.,!?]/.test(z), `A21 ${p.id}/${s} bez spacji przed znakiem`);
    check(z.includes(s), `A22 ${p.id}/${s} zawiera wstawione słowo`);
    check(z.startsWith(p.przed), `A23 ${p.id}/${s} zaczyna się od przed`);
    check(z.endsWith(p.po), `A24 ${p.id}/${s} kończy się na po`);
    check(!z.startsWith(' ') && !z.endsWith(' '), `A25 ${p.id}/${s} bez spacji na brzegach`);
  }
  check(/[.]$/.test(bez), `A26 ${p.id} zdanie kończy się kropką`);
  eq(lib.pasek(p.id), p, `A27 pasek(${p.id})`);
}
eq(lib.pasek('nie-ma'), undefined, 'A28 pasek nieznany');

// ── B. probuj ──
for (const p of P) for (const s of p.szufladka) {
  const r = lib.probuj(p, s);
  eq(r.wynik, p.frazeologizm ? 'peklo' : 'wytrzymalo', `B1 ${p.id}/${s} wynik`);
  eq(r.wklejone, s, `B2 ${p.id}/${s} echo`);
}
for (const p of P) throws(() => lib.probuj(p, 'banan'), `B3 ${p.id} „banan”`);
throws(() => lib.probuj(P[0], P[0].slowo), 'B4 oryginalne słowo nie jest w szufladce');

// ── C. geometria cięcia ──
const W = 100, H = 40;
{
  const pts = lib.punktyObwodu(W, H);
  check(pts.length >= 12, `C1 ≥12 punktów (${pts.length})`);
  check(pts.every((p) => Number.isInteger(p.x) && Number.isInteger(p.y)), 'C2 współrzędne całkowite');
  check(pts.every((p) => lib.odObwodu(p.x, p.y, W, H) <= 1), 'C3 wszystkie punkty na obwodzie');
  for (const [w, h] of [[10, 10], [30, 20], [200, 60], [64, 28]]) {
    const q = lib.punktyObwodu(w, h);
    check(q.length >= 12, `C4 ${w}×${h} ≥12 punktów`);
    check(q.every((p) => Number.isInteger(p.x) && Number.isInteger(p.y)), `C5 ${w}×${h} całkowite`);
    check(q.every((p) => lib.odObwodu(p.x, p.y, w, h) <= 1), `C6 ${w}×${h} na obwodzie`);
    check(q.every((p) => p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h), `C7 ${w}×${h} w prostokącie`);
  }
  eq(lib.punktyObwodu(W, H, 20).length >= 12, true, 'C8 większy krok nadal ≥12');
  eq(lib.punktyObwodu(W, H, 4).length > pts.length, true, 'C9 mniejszy krok = więcej punktów');
}
eq(lib.odObwodu(0, 0, W, H), 0, 'C10 róg');
eq(lib.odObwodu(50, 0, W, H), 0, 'C11 górna krawędź');
eq(lib.odObwodu(100, 20, W, H), 0, 'C12 prawa krawędź');
eq(lib.odObwodu(50, 40, W, H), 0, 'C13 dolna krawędź');
eq(lib.odObwodu(0, 20, W, H), 0, 'C14 lewa krawędź');
eq(lib.odObwodu(50, 20, W, H), 20, 'C15 środek');
eq(lib.odObwodu(-5, 20, W, H), 5, 'C16 na lewo na zewnątrz');
eq(lib.odObwodu(-3, -4, W, H), 5, 'C17 róg na zewnątrz');
eq(lib.odObwodu(105, 20, W, H), 5, 'C18 na prawo');
eq(lib.odObwodu(50, 47, W, H), 7, 'C19 pod spodem');
eq(lib.odObwodu(50, -9, W, H), 9, 'C20 nad');
eq(lib.odObwodu(10, 5, W, H), 5, 'C21 wewnątrz blisko góry');

// ścieżka po obwodzie z dużą ilością kroków
function trasa(odx = 0, ody = 0) {
  const seg = [];
  const pt = (x, y) => ({ x: x + odx, y: y + ody });
  for (let x = 0; x < W; x += 4) seg.push([pt(x, 0), pt(Math.min(x + 4, W), 0)]);
  for (let y = 0; y < H; y += 4) seg.push([pt(W, y), pt(W, Math.min(y + 4, H))]);
  for (let x = W; x > 0; x -= 4) seg.push([pt(x, H), pt(Math.max(x - 4, 0), H)]);
  for (let y = H; y > 0; y -= 4) seg.push([pt(0, y), pt(0, Math.max(y - 4, 0))]);
  return seg;
}
const PTS = lib.punktyObwodu(W, H);
const tnijWszystko = (segs, tol) => segs.reduce((z, [a, b]) => (tol === undefined ? lib.tnij(z, PTS, a, b, W, H) : lib.tnij(z, PTS, a, b, W, H, tol)), new Set());
{
  const z = tnijWszystko(trasa());
  check(lib.wycietoDosc(z, PTS.length), `C22 pełny obwód wycina (${z.size}/${PTS.length})`);
  eq(z.size, PTS.length, 'C23 pełny obwód zalicza wszystkie punkty');
  const top = trasa().slice(0, 25);
  const zt = tnijWszystko(top);
  check(zt.size > 0, 'C24 górna krawędź zalicza coś');
  check(!lib.wycietoDosc(zt, PTS.length), `C25 sama górna krawędź nie wystarcza (${zt.size}/${PTS.length})`);
  const zm = lib.tnij(new Set(), PTS, { x: 0, y: 20 }, { x: 100, y: 20 }, W, H);
  check(!lib.wycietoDosc(zm, PTS.length) && zm.size <= 8, `C26 skrót przez środek nie wycina (zalicza tylko ${zm.size} punktów przy końcach)`);
  check([...zm].every((i) => Math.min(Math.hypot(PTS[i].x - 0, PTS[i].y - 20), Math.hypot(PTS[i].x - 100, PTS[i].y - 20)) <= 12 + 4), 'C26b zaliczone tylko punkty przy końcach odcinka');
  const zl = lib.tnij(new Set(), PTS, { x: 0, y: 0 }, { x: 50, y: -30 }, W, H);
  eq(zl.size, 0, 'C27 końcówka 30 px od linii nic nie tnie');
  const zl2 = lib.tnij(new Set(), PTS, { x: 50, y: 20 }, { x: 100, y: 40 }, W, H);
  eq(zl2.size, 0, 'C28 początek 20 px od linii nic nie tnie');
  const zo10 = tnijWszystko(trasa(0, 0).map(([a, b]) => [{ x: a.x, y: a.y - 10 }, { x: b.x, y: b.y - 10 }]).slice(0, 25));
  check(zo10.size > 0, 'C29 odsunięcie 10 px nad górną krawędzią nadal liczy');
  const zo20 = tnijWszystko(trasa(0, 0).map(([a, b]) => [{ x: a.x, y: a.y - 20 }, { x: b.x, y: b.y - 20 }]).slice(0, 25));
  eq(zo20.size, 0, 'C30 odsunięcie 20 px nad krawędzią nic nie liczy');
  // pełna trasa przesunięta o 10 px na zewnątrz (każdy bok osobno)
  const zout10 = tnijWszystko([
    ...trasa().slice(0, 25).map(([a, b]) => [{ x: a.x, y: a.y - 10 }, { x: b.x, y: b.y - 10 }]),
  ]);
  check(zout10.size === zt.size || zout10.size > 0, 'C31 trasa 10 px na zewnątrz zalicza punkty');
  const zt20 = tnijWszystko(trasa(0, 0).slice(0, 25), 20);
  check(zt20.size >= zt.size, 'C32 większa tolerancja nie zmniejsza liczby zaliczonych');
  const zt2 = tnijWszystko(trasa(0, 0).slice(0, 25), 2);
  check(zt2.size <= zt.size, 'C33 mniejsza tolerancja nie zwiększa liczby');
  // niemutowanie
  const wejscie = new Set([1, 2]);
  const kopia = [...wejscie];
  const wy = lib.tnij(wejscie, PTS, { x: 0, y: 0 }, { x: 40, y: 0 }, W, H);
  eq([...wejscie], kopia, 'C34 wejście nietknięte');
  check(wy !== wejscie, 'C35 zwraca nowy zbiór');
  check(wy.has(1) && wy.has(2), 'C36 zachowuje poprzednie');
  check(wy.size > 2, 'C37 dodaje nowe');
  const bez = lib.tnij(wejscie, PTS, { x: 0, y: 20 }, { x: 100, y: 20 }, W, H);
  check(bez !== wejscie, 'C38 przy odrzuceniu też nowy zbiór');
  check(kopia.every((i) => bez.has(i)), 'C39 przy odrzuceniu poprzednie zachowane');
}
eq(lib.wycietoDosc(new Set(), 10), false, 'C40 pusty zbiór');
eq(lib.wycietoDosc(new Set([0, 1, 2, 3, 4, 5, 6]), 10), false, 'C41 7/10 < 0,8');
eq(lib.wycietoDosc(new Set([0, 1, 2, 3, 4, 5, 6, 7]), 10), true, 'C42 8/10 = próg');
eq(lib.TOLERANCJA_PX, 12, 'C43 tolerancja 12');
eq(lib.PROG_CIECIA, 0.8, 'C44 próg 0,8');

// ── D. półki ──
const dz = {
  szybko: { wklejone: 'prędko', wynik: 'wytrzymalo' },
  muchy: { wklejone: 'owady', wynik: 'peklo' },
  nogi: { wklejone: 'stopy', wynik: 'peklo' },
};
eq(lib.odloz('prezent', 'wytrzymalo', dz), { ok: false, powod: 'brak-proby' }, 'D1 brak próby');
eq(lib.odloz('prezent', 'peklo', dz), { ok: false, powod: 'brak-proby' }, 'D2 brak próby, druga półka');
eq(lib.odloz('szybko', 'wytrzymalo', dz), { ok: true }, 'D3 pasuje');
eq(lib.odloz('muchy', 'peklo', dz), { ok: true }, 'D4 pasuje (pękło)');
eq(lib.odloz('szybko', 'peklo', dz), { ok: false, powod: 'inna-polka', proba: dz.szybko }, 'D5 zła półka');
eq(lib.odloz('muchy', 'wytrzymalo', dz), { ok: false, powod: 'inna-polka', proba: dz.muchy }, 'D6 zła półka 2');
eq(lib.odloz('x', 'peklo', {}), { ok: false, powod: 'brak-proby' }, 'D7 pusty dziennik');
{
  const pelny = Object.fromEntries(P.map((p) => [p.id, lib.probuj(p, p.szufladka[0])]));
  for (const p of P) {
    eq(lib.odloz(p.id, p.frazeologizm ? 'peklo' : 'wytrzymalo', pelny), { ok: true }, `D8 ${p.id} właściwa półka`);
    eq(lib.odloz(p.id, p.frazeologizm ? 'wytrzymalo' : 'peklo', pelny).powod, 'inna-polka', `D9 ${p.id} niewłaściwa półka`);
  }
  eq(lib.przykladZPolki(['muchy', 'nogi'], pelny)?.id, 'muchy', 'D10 pierwszy związek w kolejności');
  eq(lib.przykladZPolki(['nogi', 'muchy'], pelny)?.id, 'nogi', 'D11 kolejność odkładania');
  eq(lib.przykladZPolki(['szybko', 'prezent', 'nogi'], pelny)?.id, 'nogi', 'D12 pomija zwykłe');
  eq(lib.przykladZPolki(['szybko', 'prezent', 'kanapa'], pelny), undefined, 'D13 tylko zwykłe');
  eq(lib.przykladZPolki([], pelny), undefined, 'D14 pusta kolejność');
  eq(lib.przykladZPolki(['nieznany', 'muchy'], pelny)?.id, 'muchy', 'D15 nieznany id pomijany');
  eq(lib.przykladZPolki(['muchy'], {}), undefined, 'D16 bez dziennika');
}

// ── E. opowieść ──
const O = lib.OPOWIESC;
eq(O.length, 5, 'E1 5 zdań');
eq(O.filter((z) => z.zwrot).length, 3, 'E2 3 zdania ze zwrotem');
for (const [i, z] of O.entries()) {
  check(typeof z.tekst === 'string' && z.tekst.length > 0, `E3 zdanie ${i} tekst`);
  if (z.zwrot) {
    check(!!z.zuziaPyta && !!z.zuziaRozumie && !!z.doslownie && !!z.sens, `E4 ${z.zwrot} komplet pól`);
    check(lib.zwrotKursu(z.zwrot) !== undefined, `E5 ${z.zwrot} istnieje w słowniku`);
    eq(lib.haslaZwrotu(z.zwrot).length, 1, `E6 ${z.zwrot} jedno hasło`);
  } else {
    check(!z.zuziaPyta && !z.zuziaRozumie && !z.doslownie && !z.sens, `E7 zdanie ${i} zwykłe bez pól Zuzi`);
  }
}
eq(lib.haslaZwrotu('zlote-rece'), ['ręka'], 'E8 zlote-rece pod „ręka”');
eq(lib.haslaZwrotu('nogi-za-pas'), ['noga'], 'E9 nogi-za-pas pod „noga”');
eq(lib.haslaZwrotu('kamien-z-serca'), ['kamień'], 'E10 kamien-z-serca pod „kamień”');
eq(lib.haslaZwrotu('nie-ma'), [], 'E11 nieznany zwrot');
eq(lib.ocenObjasnienie('zlote-rece', 'zlote-rece'), { ok: true }, 'E12 to samo');
{
  const r = lib.ocenObjasnienie('zlote-rece', 'pelne-rece-roboty');
  eq(r.ok, false, 'E13 inny zwrot nie ok');
  eq(r.powod, 'inny-zwrot', 'E14 powód');
  eq(r.podany.zwrot, 'mieć pełne ręce roboty', 'E15 podany.zwrot');
  eq(r.podany.id, 'pelne-rece-roboty', 'E16 podany.id');
}
throws(() => lib.ocenObjasnienie('zlote-rece', 'nie-ma-takiego'), 'E17 nieznany id');
for (const z of O.filter((x) => x.zwrot)) {
  eq(lib.ocenObjasnienie(z.zwrot, z.zwrot), { ok: true }, `E18 ${z.zwrot} ok`);
}
const cw = lib.coWHasle;
eq(cw('ręka', 'zlote-rece'), 'jest', 'E19 ręka/zlote-rece');
eq(cw('złoty', 'zlote-rece'), 'pod-innym', 'E20 złoty/zlote-rece');
eq(cw('serce', 'kamien-z-serca'), 'pod-innym', 'E21 serce/kamien');
eq(cw('kamień', 'kamien-z-serca'), 'jest', 'E22 kamień/kamien');
eq(cw('pas', 'nogi-za-pas'), 'pod-innym', 'E23 pas/nogi');
eq(cw('noga', 'nogi-za-pas'), 'jest', 'E24 noga/nogi');
eq(cw('mucha', 'zlote-rece'), 'obok', 'E25 mucha/zlote-rece');
eq(cw('nieistniejace', 'zlote-rece'), 'brak-hasla', 'E26 brak hasła');
eq(cw('ręka', undefined), 'obok', 'E27 bez szukanego');
eq(cw('nieistniejace', undefined), 'brak-hasla', 'E28 brak hasła, bez szukanego');
eq(cw('noga', 'zlote-rece'), 'obok', 'E29 noga/zlote-rece');
eq(cw('ręka', 'nie-ma'), 'obok', 'E30 nieznany szukany');
eq(lib.slowaZwrotu('zlote-rece'), ['złoty', 'ręka'], 'E31 slowaZwrotu');
eq(lib.slowaZwrotu('nie-ma'), [], 'E32 slowaZwrotu nieznany');

// ── F. spójność słownika ──
{
  const wszystkie = Object.values(lib.HASLA_KURSU).flatMap((h) => h.zwroty ?? []);
  const ids = wszystkie.map((z) => z.id);
  eq(new Set(ids).size, ids.length, 'F1 id zwrotów unikalne w całym słowniku');
  check(wszystkie.length >= 8, `F2 co najmniej 8 zwrotów (${wszystkie.length})`);
  for (const z of wszystkie) {
    check(typeof z.zwrot === 'string' && z.zwrot.trim().length > 0, `F3 ${z.id} zwrot niepusty`);
    check(typeof z.objasnienie === 'string' && z.objasnienie.trim().length > 0, `F4 ${z.id} objaśnienie niepuste`);
  }
  for (const [id, wyrazy] of Object.entries(lib.WYRAZY_ZWROTU)) {
    for (const w of wyrazy) check(w in lib.HASLA_KURSU, `F5 ${id}: „${w}” jest hasłem`);
  }
  for (const z of O.filter((x) => x.zwrot)) check(z.zwrot in lib.WYRAZY_ZWROTU, `F6 ${z.zwrot} w WYRAZY_ZWROTU`);
  for (const p of P.filter((x) => x.frazeologizm)) check(ids.includes(p.frazeologizm), `F7 ${p.id} związek w słowniku`);
  for (const [k, h] of Object.entries(lib.HASLA_KURSU)) check(h.haslo === k, `F8 klucz „${k}” = haslo „${h.haslo}”`);
}

console.log(`\nL12 selftest: ${pass} ok, ${fail} błędów`);
process.exit(fail ? 1 : 0);

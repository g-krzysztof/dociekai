/**
 * Selftest L15 „Czasownik niesie czas” — `czasownik/dzien.ts` (dziennik wyspy,
 * osoby) i `czasownik/plan.ts` (sędzia „Planu na jutro”, z prawdziwym
 * `analyze` Pisarni) oraz sprawdzenie form w SGJP.
 *
 *   node scripts/polski-l15-selftest.mjs
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
const dir = await mkdtemp(join(tmpdir(), 'polski-l15-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
const L = resolve(root, 'src/app/jezyk-polski/klasa-4');
await writeFile(entry, [
  `export * from '${L}/components/lessons/czasownik/dzien.ts';`,
  `export * from '${L}/components/lessons/czasownik/plan.ts';`,
  `export { analyze } from '${L}/lib/pisarnia/index.ts';`,
].join('\n') + '\n');
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });
let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };
const eq = (a, b, l) => check(JSON.stringify(a) === JSON.stringify(b), `${l} (oczekiwano ${JSON.stringify(b)}, jest ${JSON.stringify(a)})`);

const { DZIENNIK, BAGAZ, START_ZDAN, przejazd, naPeronie, dorzuc, dzienGotowy, zapadkaOsi, polozenieCzasu, CZASY_OSI,
  OSOBY, PLYNAC, ZAGADKI, pasujeOsoba, analyze, ocenPlan, czytajPlan, MIN_ZDAN, PALETA_PLANU } = lib;
const ids = DZIENNIK.map((z) => z.id);
const sameSet = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

// ── A. DZIENNIK ──
console.log('A. dziennik');
eq(DZIENNIK.length, 6, 'A0 6 zdań');
eq(new Set(ids).size, 6, 'A1 id unikalne');
eq(CZASY_OSI, ['wczoraj', 'dzis', 'jutro'], 'A1b CZASY_OSI');
for (const z of DZIENNIK) {
  for (const c of CZASY_OSI) check(typeof z.formy[c] === 'string' && z.formy[c].length > 0, `A2 ${z.id} forma ${c}`);
  eq(new Set(CZASY_OSI.map((c) => z.formy[c])).size, 3, `A3 ${z.id} trzy różne formy`);
  check(z.przed.length > 0 && z.po.length > 0, `A3b ${z.id} przed/po`);
}
eq(BAGAZ.wczoraj.length, 3, 'A4 bagaż wczoraj 3');
eq(BAGAZ.jutro.length, 3, 'A5 bagaż jutro 3');
eq(BAGAZ.dzis, [], 'A5b bagaż dzis pusty');
check(BAGAZ.wczoraj.every((i) => ids.includes(i)), 'A6 bagaż wczoraj: id istnieją');
check(BAGAZ.jutro.every((i) => ids.includes(i)), 'A7 bagaż jutro: id istnieją');
eq(BAGAZ.wczoraj.filter((i) => BAGAZ.jutro.includes(i)), [], 'A8 bagaże rozłączne');
eq(new Set(BAGAZ.wczoraj).size, 3, 'A8b bagaż wczoraj bez powtórzeń');
eq(new Set(BAGAZ.jutro).size, 3, 'A8c bagaż jutro bez powtórzeń');
for (const i of ids) eq(START_ZDAN[i], 'dzis', `A9 start ${i} = dzis`);
eq(Object.keys(START_ZDAN).length, 6, 'A9b start 6 kluczy');
eq(naPeronie(START_ZDAN, 'dzis'), [], 'A10 start: peron pusty');
check(dzienGotowy(START_ZDAN, 'dzis'), 'A10b start: dzis gotowy');
check(!dzienGotowy(START_ZDAN, 'wczoraj') && !dzienGotowy(START_ZDAN, 'jutro'), 'A10c start: wczoraj/jutro nie gotowe');

for (const cel of ['wczoraj', 'jutro']) {
  const z = przejazd(START_ZDAN, cel);
  const ruszone = ids.filter((i) => z[i] === cel);
  const inne = BAGAZ[cel];
  check(sameSet(ruszone, ids.filter((i) => !inne.includes(i))), `A11 przejazd→${cel}: jadą dokładnie 3 nie-bagażowe`);
  eq(ruszone.length, 3, `A11b przejazd→${cel}: 3 ruszone`);
  for (const b of inne) eq(z[b], 'dzis', `A12 przejazd→${cel}: bagaż ${b} zostaje w dzis`);
  check(sameSet(naPeronie(z, cel), inne), `A13 naPeronie(${cel}) = bagaż`);
  eq(naPeronie(z, cel).length, 3, `A13b naPeronie(${cel}) 3`);
  check(!dzienGotowy(z, cel), `A14 ${cel} jeszcze nie gotowy`);
  check(Object.isFrozen(START_ZDAN) || START_ZDAN.koza === 'dzis', `A14b start nie zmutowany po przejeździe ${cel}`);

  let cur = z;
  for (const b of inne) {
    const r = dorzuc(cur, cel, b, b);
    const zd = DZIENNIK.find((x) => x.id === b);
    eq(r, { ok: true, forma: zd.formy[cel], byla: zd.formy.dzis }, `A15 dorzuc ${b}→${cel}`);
    const inny = ids.find((i) => i !== b);
    eq(dorzuc(cur, cel, b, inny), { ok: false, powod: 'inne-zdanie' }, `A16 dorzuc ${b} do ${inny}: inne-zdanie`);
    const juz = ruszone[0];
    eq(dorzuc(cur, cel, juz, juz), { ok: false, powod: 'juz-jest' }, `A17 ${juz} już jest w ${cel}`);
    eq(dorzuc(cur, cel, juz, b), { ok: false, powod: 'juz-jest' }, `A17b juz-jest ma pierwszeństwo przed inne-zdanie (${juz}→${b})`);
    cur = { ...cur, [b]: cel };
  }
  check(dzienGotowy(cur, cel), `A18 po dorzuceniu wszystkich ${cel} gotowy`);
  eq(naPeronie(cur, cel), [], `A19 peron pusty po dorzuceniu (${cel})`);
  const wstecz = przejazd(cur, 'dzis');
  for (const i of ids) eq(wstecz[i], 'dzis', `A20 powrót do dzis (z ${cel}): ${i}`);
  check(dzienGotowy(wstecz, 'dzis'), `A20b powrót do dzis gotowy (${cel})`);
}
{
  // przejazd z wczoraj od razu do jutro: bagaż jutro zostaje tam, gdzie był
  const w = przejazd(START_ZDAN, 'wczoraj');
  const j = przejazd(w, 'jutro');
  for (const i of BAGAZ.jutro) eq(j[i], w[i], `A21 wczoraj→jutro: bagaż ${i} bez zmian`);
  for (const i of ids.filter((x) => !BAGAZ.jutro.includes(x))) eq(j[i], 'jutro', `A22 wczoraj→jutro: ${i} jedzie`);
}
for (const [t, c] of [[0, 'wczoraj'], [0.24, 'wczoraj'], [0.26, 'dzis'], [0.5, 'dzis'], [0.76, 'jutro'], [1, 'jutro'], [NaN, 'dzis'], [-1, 'wczoraj'], [2, 'jutro'], [0.25, 'dzis'], [0.74, 'dzis']]) eq(zapadkaOsi(t), c, `A23 zapadkaOsi(${t})`);
eq(polozenieCzasu('wczoraj'), 0, 'A24 polozenie wczoraj');
eq(polozenieCzasu('dzis'), 0.5, 'A24 polozenie dzis');
eq(polozenieCzasu('jutro'), 1, 'A24 polozenie jutro');
for (const c of CZASY_OSI) eq(zapadkaOsi(polozenieCzasu(c)), c, `A25 zapadka∘polozenie ${c}`);

// ── B. blok 2 ──
console.log('B. osoby');
eq(OSOBY.length, 6, 'B0 6 osób');
eq(OSOBY.map((o) => o.id), ['ja', 'ty', 'on', 'my', 'wy', 'oni'], 'B1 id osób');
eq(OSOBY.map((o) => o.ile), [1, 1, 1, 2, 2, 3], 'B1b ile');
for (const o of OSOBY) { check(typeof PLYNAC[o.id] === 'string' && PLYNAC[o.id].length > 0, `B2 PLYNAC.${o.id}`); check(o.label.length > 0, `B2b label ${o.id}`); }
eq(new Set(Object.values(PLYNAC)).size, 6, 'B3 sześć różnych form płynąć');
eq(PLYNAC, { ja: 'płynę', ty: 'płyniesz', on: 'płynie', my: 'płyniemy', wy: 'płyniecie', oni: 'płyną' }, 'B3b PLYNAC dosłownie');
eq(ZAGADKI.length, 4, 'B4 4 zagadki');
eq(new Set(ZAGADKI.map((z) => z.id)).size, 4, 'B4b id zagadek unikalne');
const zag = Object.fromEntries(ZAGADKI.map((z) => [z.forma, z.osoba]));
eq(zag['łowicie'], 'wy', 'B5 łowicie=wy');
eq(zag['naprawiam'], 'ja', 'B5 naprawiam=ja');
eq(zag['śpią'], 'oni', 'B5 śpią=oni');
eq(zag['karmisz'], 'ty', 'B5 karmisz=ty');
for (const z of ZAGADKI) {
  check(OSOBY.some((o) => o.id === z.osoba), `B6 ${z.id} osoba istnieje`);
  for (const o of OSOBY) eq(pasujeOsoba(z, o.id), o.id === z.osoba, `B7 pasujeOsoba(${z.id},${o.id})`);
}

// ── C. ocenPlan ──
console.log('C. ocenPlan');
const oc = (t) => ocenPlan(analyze(t));
const wszystkoOk = (t, l) => { const w = oc(t); check(w.zdania.ok && w.czasownik.ok && w.jutro.ok, `C ok: ${l} → ${JSON.stringify([w.zdania, w.czasownik, w.jutro])}`); return w; };
eq(MIN_ZDAN, 3, 'C0 MIN_ZDAN');
eq(PALETA_PLANU.length, 8, 'C0b paleta 8');
for (const t of [
  'Zbuduję szałas. Będę łowić ryby. Rybak zapali latarnię.',
  'Jutro będziemy płynąć łódką. Będę jutro łowiła ryby. Naprawimy sieć.',
  'Zapalę ognisko! Będziesz karmić kozę? Będziemy szukać muszli.',
  'Łowić będę rano. Zbudujemy dom. Naprawię płot.',
  'Zbuduję szałas.\nBędę łowić ryby.\nPies będzie spał.',
]) { const w = wszystkoOk(t, t); eq(w.plan.length, 3, `C1 3 zdania w „${t.slice(0, 20)}…”`); check(w.plan.every((z) => z.przyszly), `C1b wszystkie przyszłe „${t.slice(0, 20)}…”`); }
{
  const w = oc('Łowić będę rano. Zbudujemy dom. Naprawię płot.');
  eq(w.plan[0].trafienia.map((t) => [t.lemat, t.odczyt]), [['łowić', 'przyszly']], 'C2 „Łowić będę” → łowić/przyszly');
}
// za mało zdań
for (const [t, n] of [['', 0], ['Zbuduję szałas.', 1], ['Zbuduję szałas. Będę łowić ryby.', 2]]) {
  const w = oc(t);
  check(!w.zdania.ok, `C3 ${n} zdań → zdania nie ok`);
  check(w.zdania.note.includes('co najmniej 3'), `C3b ${n} zdań: komunikat o 3`);
  eq(w.plan.length, n, `C3c plan.length ${n}`);
}
check(oc('Zbuduję szałas.').zdania.note.includes('1 zdanie'), 'C3d „jest 1 zdanie”');
check(oc('Zbuduję szałas. Będę łowić ryby.').zdania.note.includes('2 zdania'), 'C3e „są 2 zdania”');
check(oc('').zdania.note.includes('nie ma zdań'), 'C3f „nie ma zdań”');
{
  const w = oc('zbuduję szałas. Będę łowić. Zapalę ogień.');
  check(!w.zdania.ok, 'C4 mała litera → zdania nie ok');
  check(w.zdania.note.includes('zdaniu 1'), `C4b wskazuje zdanie 1 (${w.zdania.note})`);
  check(!w.zdania.note.includes('zdaniu 2') && !w.zdania.note.includes('zdaniu 3'), 'C4c tylko zdanie 1');
  const w2 = oc('Zbuduję szałas. Będę łowić ryby. Zapalę ogień');
  check(!w2.zdania.ok && w2.zdania.note.includes('zdaniu 3'), `C4d brak kropki → zdanie 3 (${w2.zdania.note})`);
}
{
  const w = oc('Pójdę na plażę. Będę łowić ryby. Zapalę ogień.');
  check(!w.czasownik.ok, 'C5 brak czasownika z palety → czasownik nie ok');
  check(w.czasownik.note.includes('zdaniu 1'), `C5b wskazuje zdanie 1 (${w.czasownik.note})`);
  check(w.zdania.ok, 'C5c zdania ok mimo to');
  const w2 = oc('Zbuduję szałas. Pójdę na plażę. Zapalę ogień.');
  check(!w2.czasownik.ok && w2.czasownik.note.includes('zdaniu 2'), `C5d zdanie 2 (${w2.czasownik.note})`);
  const w3 = oc('Zbuduję szałas. Będę łowić ryby. Pójdę na plażę.');
  check(!w3.czasownik.ok && w3.czasownik.note.includes('zdaniu 3'), `C5e zdanie 3 (${w3.czasownik.note})`);
  const w4 = oc('Pójdę na plażę. Pójdę do domu. Pójdę spać do łóżka.');
  check(!w4.czasownik.ok, 'C5f żadnego (ale „spać” jest w palecie?)' + w4.czasownik.note);
}
{
  const w = oc('Łowiłem ryby. Zbuduję dom. Zapalę ogień.');
  check(!w.jutro.ok, 'C6 przeszły → jutro nie ok');
  check(w.jutro.note.includes('„Łowiłem” mówi o wczoraj'), `C6b „Łowiłem” mówi o wczoraj (${w.jutro.note})`);
  check(w.jutro.note.toLowerCase().includes('zdaniu 1'), 'C6c zdaniu 1');
  check(w.zdania.ok && w.czasownik.ok, 'C6d zdania i czasownik ok');
  eq(w.plan[0].trafienia[0].odczyt, 'przeszly', 'C6e odczyt przeszly');
}
{
  const w = oc('Łowię ryby. Zbuduję dom. Zapalę ogień.');
  check(!w.jutro.ok && w.jutro.note.includes('„Łowię” mówi o dziś'), `C7 teraźniejszy (${w.jutro.note})`);
  check(w.jutro.note.toLowerCase().includes('zdaniu 1'), 'C7b zdaniu 1');
  eq(w.plan[0].trafienia[0].odczyt, 'terazniejszy', 'C7c odczyt terazniejszy');
}
{
  const w = oc('Łowić ryby. Zbuduję dom. Zapalę ogień.');
  check(!w.jutro.ok && w.jutro.note.includes('„Łowić” samo nie mówi kiedy'), `C8 bezokolicznik (${w.jutro.note})`);
  eq(w.plan[0].trafienia[0].odczyt, 'bezokolicznik', 'C8b odczyt');
}
{
  const w = oc('Będę naprawić płot. Zbuduję dom. Zapalę ogień.');
  check(!w.jutro.ok && w.jutro.note.includes('tak się nie mówi'), `C9 będę+dokonany (${w.jutro.note})`);
  check(w.jutro.note.includes('„będę naprawić”'), 'C9b cytuje „będę naprawić”');
  eq(w.plan[0].trafienia[0].odczyt, 'dokonany-z-bedzie', 'C9c odczyt');
  const w2 = oc('Będę zbudować dom. Zapalę ogień. Będę łowić ryby.');
  check(!w2.jutro.ok && w2.jutro.note.includes('zdaniu 1'), `C9d będę zbudować (${w2.jutro.note})`);
}
{
  const w = oc('Łowiłem ryby. Łowię ryby. Łowić ryby.');
  check(!w.jutro.ok, 'C10 trzy złe');
  for (const n of [1, 2, 3]) check(w.jutro.note.includes(`zdaniu ${n}`), `C10 note wymienia zdanie ${n}`);
}
{
  const w = oc('');
  check(!w.zdania.ok && !w.czasownik.ok && !w.jutro.ok, 'C11 pusty → wszystkie trzy nie ok');
  const w2 = oc('   \n  ');
  check(!w2.zdania.ok && !w2.czasownik.ok && !w2.jutro.ok, 'C11b same spacje → wszystkie trzy nie ok');
  eq(w.plan, [], 'C11c plan pusty');
}
{
  // czytajPlan: lemat i odczyt
  const hit = (t, s = 0) => czytajPlan(analyze(t))[s]?.trafienia.map((x) => [x.word.low, x.lemat, x.odczyt]);
  eq(hit('Zbuduję szałas.'), [['zbuduję', 'zbudować', 'przyszly']], 'C12 zbuduję');
  eq(hit('Rybak zapali latarnię.'), [['zapali', 'zapalić', 'przyszly']], 'C12 zapali');
  eq(hit('Będę łowić ryby.'), [['łowić', 'łowić', 'przyszly']], 'C12 będę łowić');
  eq(hit('Będę jutro łowiła ryby.'), [['łowiła', 'łowić', 'przyszly']], 'C12 będę jutro łowiła');
  eq(hit('Będziemy płynąć łódką.'), [['płynąć', 'płynąć', 'przyszly']], 'C12 będziemy płynąć');
  eq(hit('Płynę łódką.'), [['płynę', 'płynąć', 'terazniejszy']], 'C12 płynę');
  eq(hit('Spał na pomoście.'), [['spał', 'spać', 'przeszly']], 'C12 spał');
  eq(hit('Szukam muszli.'), [['szukam', 'szukać', 'terazniejszy']], 'C12 szukam');
  eq(hit('Karmić kozę.'), [['karmić', 'karmić', 'bezokolicznik']], 'C12 karmić');
  eq(hit('Naprawię płot.'), [['naprawię', 'naprawić', 'przyszly']], 'C12 naprawię');
  eq(hit('Pójdę na plażę.'), [], 'C12 pójdę — brak');
  const cz = czytajPlan(analyze('Zbuduję szałas. Będę łowić ryby.'));
  eq(cz.map((z) => z.index), [0, 1], 'C13 indeksy zdań');
  eq(cz.map((z) => z.zdanieOk), [true, true], 'C13b zdanieOk');
  eq(cz.map((z) => z.przyszly), [true, true], 'C13c przyszly');
  eq(czytajPlan(analyze('')), [], 'C13d puste');
}

// ── D. SGJP ──
console.log('D. SGJP');
const SGJP = join(homedir(), '.cache/dociekai/sgjp-20260823.tab.gz');
if (!existsSync(SGJP)) {
  console.log('⚠ Brak zrzutu SGJP (' + SGJP + ') — pomijam sekcję D.');
} else {
  const need = new Map();
  const add = (f, lematy, opis, test) => { if (!need.has(f)) need.set(f, []); need.get(f).push({ lematy, opis, test }); };
  const parts = (t) => t.split(':');
  const osobaTag = { ja: ['sg', 'pri'], ty: ['sg', 'sec'], on: ['sg', 'ter'], my: ['pl', 'pri'], wy: ['pl', 'sec'], oni: ['pl', 'ter'] };
  const finOsoba = (o) => (t) => { const p = parts(t); return p[0] === 'fin' && p[1] === osobaTag[o][0] && p[2] === osobaTag[o][1]; };
  const LEMATY = {
    koza: ['skubać'], rybak: ['naprawiać', 'naprawić'], mewy: ['krzyczeć'], pies: ['spać'],
    dzieci: ['budować', 'zbudować'], latarnik: ['zapalać', 'zapalić'],
  };
  for (const z of DZIENNIK) {
    const lem = LEMATY[z.id];
    check(!!lem, `D0 znam lematy dla ${z.id}`);
    const d = z.formy.dzis, w = z.formy.wczoraj, j = z.formy.jutro;
    add(d, lem, `${z.id} dzis „${d}” fin`, (t) => parts(t)[0] === 'fin');
    add(w, lem, `${z.id} wczoraj „${w}” praet`, (t) => parts(t)[0] === 'praet');
    if (j.includes(' ')) {
      const [b, inf] = j.split(' ');
      check(parts(j).length >= 1 && j.split(' ').length === 2, `D1 ${z.id} jutro złożone = 2 słowa`);
      add(b, ['być'], `${z.id} jutro „${b}” bedzie`, (t) => parts(t)[0] === 'bedzie');
      add(inf, lem, `${z.id} jutro „${inf}” inf:imperf`, (t) => parts(t)[0] === 'inf' && parts(t).includes('imperf'));
    } else {
      add(j, lem, `${z.id} jutro „${j}” fin:perf`, (t) => parts(t)[0] === 'fin' && parts(t).includes('perf'));
    }
  }
  const lemPlyn = ['płynąć'];
  for (const o of OSOBY) add(PLYNAC[o.id], lemPlyn, `PLYNAC.${o.id} „${PLYNAC[o.id]}” fin ${osobaTag[o.id].join(':')}`, finOsoba(o.id));
  const LZ = { lowic: ['łowić'], naprawiac: ['naprawiać', 'naprawić'], spac: ['spać'], karmic: ['karmić'] };
  for (const z of ZAGADKI) add(z.forma, LZ[z.id], `ZAGADKI.${z.id} „${z.forma}” fin ${osobaTag[z.osoba].join(':')} (osoba ${z.osoba})`, finOsoba(z.osoba));

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
      if (!r.lematy.includes(lem)) continue;
      if (!seen.has(r)) seen.set(r, []);
      seen.get(r).push(tag);
      if (r.test(tag)) found.set(r, true);
    }
  }
  let nreq = 0;
  for (const [f, reqs] of need) for (const r of reqs) {
    nreq += 1;
    const tagi = seen.get(r);
    check(found.get(r) === true, `D ${r.opis}: „${f}” z lematem ${r.lematy.join('/')} ${tagi ? 'ma tylko tagi ' + [...new Set(tagi)].join(' | ') : 'nie istnieje w SGJP'}`);
  }
  console.log(`  (D: sprawdzono ${nreq} wymagań form w SGJP)`);
}

console.log(`\nL15 selftest: ${pass} OK, ${fail} błędów (${pass + fail} asercji)`);
process.exit(fail ? 1 : 0);

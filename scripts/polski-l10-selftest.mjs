/**
 * Selftest L10 „Gruby słownik” — slownik.ts, lematy, hasla, kameleon.ts, przestaw.ts.
 *
 *   node scripts/polski-l10-selftest.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const L = resolve(root, 'src/app/jezyk-polski/klasa-4/components/lessons/slownik');
const D = resolve(root, 'src/app/jezyk-polski/klasa-4/data/slownik');
const dir = await mkdtemp(join(tmpdir(), 'polski-l10-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
await writeFile(entry, [
  `export * from '${L}/slownik.ts';`,
  `export * from '${L}/kameleon.ts';`,
  `export * from '${L}/przestaw.ts';`,
  `export { LEMATY } from '${D}/lematy.ts';`,
  `export { HASLA_KURSU } from '${D}/hasla.ts';`,
].join('\n') + '\n');
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });
let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };
const eq = (a, b, l) => check(JSON.stringify(a) === JSON.stringify(b), `${l} (oczekiwano ${JSON.stringify(b)}, jest ${JSON.stringify(a)})`);
const { porownaj, pierwszaRoznica, zbudujSlownik, pagina, rozkladowkaHasla, wskazowka, porownajZ, powod, sprawdzHaslo, krokBezwladnosci, pikseliNaRozkladowke, LEMATY, HASLA_KURSU } = lib;

// ── 1. kolejność polska ──
for (const [a, b] of [['a', 'ą'], ['ą', 'b'], ['c', 'ć'], ['ć', 'd'], ['e', 'ę'], ['l', 'ł'], ['ł', 'm'], ['n', 'ń'], ['ń', 'o'], ['o', 'ó'], ['ó', 'p'], ['s', 'ś'], ['ś', 't'], ['z', 'ź'], ['ź', 'ż']])
  check(porownaj(a, b) < 0, `1 ${a} < ${b}`);
check(porownaj('chleb', 'cewka') > 0, '1 chleb > cewka');
check(porownaj('chleb', 'ciasto') < 0, '1 chleb < ciasto');
check(porownaj('kot', 'kotek') < 0, '1 kot < kotek');
eq(porownaj('Kot', 'kot'), 0, '1 Kot = kot');
check(porownaj('łza', 'lzy') > 0, '1 łza > lzy');
check(porownaj('żaba', 'zebra') > 0, '1 żaba > zebra');

// ── 2. LEMATY ──
check(LEMATY.length >= 2400, `2 LEMATY ≥ 2400 (jest ${LEMATY.length})`);
let bad = 0;
for (let i = 1; i < LEMATY.length; i++) if (!(porownaj(LEMATY[i - 1], LEMATY[i]) < 0)) { bad++; if (bad <= 5) console.log('    niepoprawna para:', LEMATY[i - 1], LEMATY[i]); }
eq(bad, 0, '2 LEMATY posortowane ściśle');

// ── 3. pierwszaRoznica ──
eq(pierwszaRoznica('kreda', 'kret'), 3, '3 kreda/kret');
eq(pierwszaRoznica('kot', 'kawa'), 1, '3 kot/kawa');
eq(pierwszaRoznica('kot', 'kotek'), 3, '3 kot/kotek');

// ── 4–6. rundy ──
const RUNDY = [{ strony: 40, cel: 'kot' }, { strony: 150, cel: 'krowa' }, { strony: 400, cel: 'kreda' }];
const NA_STRONE = 6;
const SASIEDZI = ['kot', 'krowa', 'kreda', 'kredka', 'kredens', 'krem', 'kreska', 'kret', 'kretowisko', 'kasza', 'kawa'];
const BLOKADA = new Set(['trup', 'zabić', 'zabijać', 'piwo', 'wódka', 'krewa', 'krewić', 'kroplić', 'krople', 'kropelki', 'kręt']);
const slowniki = RUNDY.map((r) => zbudujSlownik(LEMATY.filter((w) => !BLOKADA.has(w)), r.strony, NA_STRONE, SASIEDZI));
RUNDY.forEach((r, ri) => {
  const s = slowniki[ri];
  const t = `R${ri + 1}`;
  eq(s.strony.length, r.strony, `4 ${t} liczba stron`);
  check(s.strony.every((st) => st.length > 0), `4 ${t} strony niepuste`);
  const flat = s.strony.flat();
  let b = 0;
  for (let i = 1; i < flat.length; i++) if (!(porownaj(flat[i - 1], flat[i]) < 0)) b++;
  eq(b, 0, `4 ${t} hasła ściśle rosnąco`);
  check(rozkladowkaHasla(s, r.cel) >= 0, `4 ${t} cel w słowniku`);
  check(!flat.some((w) => BLOKADA.has(w)), `4 ${t} brak haseł z BLOKADY`);
  const alf = s.litery.map((x) => x.litera);
  const sorted = [...alf].sort(porownaj);
  eq(alf, sorted, `4 ${t} litery w kolejności alfabetu`);
  for (const { litera, strona } of s.litery) {
    check(s.strony[strona].some((w) => w[0] === litera), `4 ${t} litera ${litera} jest na stronie ${strona}`);
    let wczesniej = false;
    for (let j = 0; j < strona; j++) if (s.strony[j].some((w) => w[0] === litera)) wczesniej = true;
    check(!wczesniej, `4 ${t} litera ${litera} nie występuje wcześniej niż na ${strona}`);
  }
  // 6: wskazówka dla każdej rozkładówki
  const nR = s.strony.length / 2;
  const sCel = rozkladowkaHasla(s, r.cel);
  for (let k = 0; k < nR; k++) {
    const exp = k < sCel ? 'dalej' : k > sCel ? 'wczesniej' : 'tu';
    const got = wskazowka(s, k, r.cel).kierunek;
    if (got !== exp) check(false, `6 ${t} rozkładówka ${k}: oczekiwano ${exp}, jest ${got}`);
    else pass += 1;
  }
  eq(wskazowka(s, sCel, r.cel).kierunek, 'tu', `6 ${t} na rozkładówce celu → tu`);
  if (sCel > 0) eq(wskazowka(s, 0, r.cel).kierunek, 'dalej', `6 ${t} rozkładówka 0 → dalej`);
  if (sCel < nR - 1) eq(wskazowka(s, nR - 1, r.cel).kierunek, 'wczesniej', `6 ${t} ostatnia → wczesniej`);
  check(typeof pagina(s, 0).pierwsze === 'string', `4 ${t} pagina`);
});
// 5
for (const w of SASIEDZI) check(rozkladowkaHasla(slowniki[2], w) >= 0, `5 R3 sąsiad ${w} obecny`);
const kStron = slowniki[1].strony.filter((st) => st.some((w) => w[0] === 'k')).length;
check(kStron >= 10, `5 R2 stron z „k” ≥ 10 (jest ${kStron})`);

// ── 6 (domyślne pozycje) – 7 powod ──
const p1 = powod('kot', porownajZ('kot', 'kawa'));
check(['drugą', 'o', 'a', 'dalej'].every((x) => p1.includes(x)), `7 kot/kawa: ${p1}`);
const p2 = powod('kreda', porownajZ('kreda', 'kret'));
check(p2.includes('czwartą') && p2.includes('wcześniej'), `7 kreda/kret: ${p2}`);
const p3 = powod('kot', porownajZ('kot', 'kotek'));
check(p3.includes('początek') && p3.includes('wcześniej'), `7 kot/kotek: ${p3}`);
const p4 = powod('kot', porownajZ('kot', 'las'));
check(p4.startsWith('Spójrz na pierwszą literę'), `7 kot/las: ${p4}`);

// ── 8 ──
eq(sprawdzHaslo('kot', 'kot').trafione, true, '8 trafione');
const sh = sprawdzHaslo('kot', 'kawa');
eq(sh.trafione, false, '8 nietrafione');
check(sh.tekst.includes('dalej'), `8 tekst zawiera dalej: ${sh.tekst}`);

// ── 9 fizyka ──
const MAX = 10;
const z0 = krokBezwladnosci(5, 0, 16, MAX);
eq(z0, { p: 5, v: 0 }, '9 v=0 stoi');
const z1 = krokBezwladnosci(5, 0.1, 16, MAX);
check(z1.p > 5 && Math.abs(z1.v) < 0.1, '9 v>0 rośnie, v maleje');
{
  let p = 2, v = 0.2, n = 0;
  while (v !== 0 && n < 400) { ({ p, v } = krokBezwladnosci(p, v, 16, MAX)); n++; if (p > MAX) check(false, '9 p > max'); }
  check(v === 0 && n < 400, `9 seria kończy się v=0 (kroków ${n})`);
  check(p <= MAX, '9 p ≤ max');
}
eq(krokBezwladnosci(9.99, 5, 16, MAX), { p: MAX, v: 0 }, '9 brzeg max');
{
  const r = krokBezwladnosci(0.5, -50, 16, MAX);
  check(r.p >= 0, '9 nie poniżej 0');
  eq(r.p, 0, '9 przy v<0 p=0');
}
{
  let prev = Infinity, ok = true;
  for (const n of [1, 2, 5, 10, 20, 50, 100, 200, 400]) {
    const px = pikseliNaRozkladowke(n);
    if (px > prev || px < 6 || px > 40) ok = false;
    prev = px;
  }
  check(ok, '9 pikseliNaRozkladowke maleje i mieści się w [6, 40]');
}

// ── 10 kameleon ──
const maxZn = Math.max(...lib.ZDANIA.flatMap((z) => [z.znaczenie, ...Object.values(z.pasuje).flat(), ...Object.keys(z.absurd).map(Number)]));
for (const z of lib.ZDANIA) {
  const k = lib.KORPUSY[z.id];
  const ids = new Set(k.tokens.map((w) => w.id));
  check(ids.has('haslo'), `10 ${z.id} korpus ma token haslo`);
  for (const id of Object.keys(z.pasuje)) check(ids.has(id), `10 ${z.id} token ${id} istnieje`);
  const kot = lib.kotwice(z);
  check(kot.length > 0, `10 ${z.id} kotwice niepuste`);
  for (const id of kot) eq(lib.ocenSlowo(z, id), { rodzaj: 'kotwica', znaczenie: z.znaczenie }, `10 ${z.id} kotwica ${id}`);
  for (const [id, lst] of Object.entries(z.pasuje)) check(lst.includes(z.znaczenie), `10 ${z.id} ${id} zawiera właściwe znaczenie`);
  eq(Object.keys(z.absurd).map(Number).sort(), [1, 2, 3].filter((n) => n !== z.znaczenie), `10 ${z.id} absurd = pozostałe znaczenia`);
  eq(lib.ocenSlowo(z, 'haslo').rodzaj, 'haslo', `10 ${z.id} haslo`);
  const bez = k.tokens.find((w) => w.type === 'word' && w.id !== 'haslo' && !z.pasuje[w.id]);
  if (bez) eq(lib.ocenSlowo(z, bez.id).rodzaj, 'kazde', `10 ${z.id} ${bez.id} → kazde`);
  const hk = HASLA_KURSU[z.haslo];
  check(!!hk && hk.znaczenia.length >= maxZn, `10 ${z.id} hasło ${z.haslo} ma ≥ ${maxZn} znaczeń`);
}
{
  const Z = (id) => lib.ZDANIA.find((z) => z.id === id);
  eq(lib.ocenSlowo(Z('z3'), 'zacial'), { rodzaj: 'kilka', znaczenia: [2, 3] }, '10 z3 zacial');
  eq(lib.ocenSlowo(Z('k3'), 'przelecial'), { rodzaj: 'kilka', znaczenia: [1, 3] }, '10 k3 przelecial');
  eq(lib.ocenSlowo(Z('z1'), 'wrocili').rodzaj, 'kazde', '10 z1 wrocili');
  const nazwy = ['a', 'b', 'c'];
  for (const o of [{ rodzaj: 'kotwica', znaczenie: 2 }, { rodzaj: 'haslo' }, { rodzaj: 'kilka', znaczenia: [2, 3] }, { rodzaj: 'kazde' }])
    check(lib.tekstOceny(o, 'forma', 'zamek', nazwy).length > 0, `10 tekstOceny ${o.rodzaj} niepusty`);
  check(lib.tekstOceny({ rodzaj: 'kilka', znaczenia: [2, 3] }, 'forma', 'zamek', nazwy).includes('2 i 3'), '10 tekstOceny kilka „2 i 3”');
}

// ── 11 przestaw ──
const ids = new Set();
for (const r of lib.RAMY) {
  for (const n of [1, 2, 3]) check(r.kafelki.some((k) => k.zn === n), `11 ${r.id} ma znaczenie ${n}`);
  eq(r.kafelki.filter((k) => k.zn === 0).length, 1, `11 ${r.id} dokładnie jeden zn 0`);
  check(r.kafelki.some((k) => k.id === r.start), `11 ${r.id} start istnieje`);
  for (const k of r.kafelki) { check(!ids.has(k.id), `11 id unikalne ${k.id}`); ids.add(k.id); }
  check(lib.kafelek(r, r.start).zn !== 0, `11 ${r.id} start ma znaczenie ≠ 0`);
}
check(new Set(lib.RAMY.map((r) => lib.kafelek(r, r.start).zn)).size > 1, '11 ramy nie zaczynają od tego samego znaczenia');
eq(lib.odwiedz([], 0), [], '11 odwiedz([],0)');
eq(lib.odwiedz([1], 1), [1], '11 odwiedz([1],1)');
eq(lib.odwiedz([3], 1), [1, 3], '11 odwiedz([3],1)');
eq(lib.ramaGotowa([1, 2, 3]), true, '11 ramaGotowa pełne');
eq(lib.ramaGotowa([1, 3]), false, '11 ramaGotowa niepełne');

console.log(`\nL10 selftest: ${pass} asercji OK, ${fail} błędów`);
process.exit(fail ? 1 : 0);

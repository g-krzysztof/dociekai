/**
 * Selftest L13 „Odmieniarka” (`odmienne-i-nieodmienne/odmiana.ts`) — dźwignie,
 * formy, sędziowie trzech bloków oraz sprawdzenie wszystkich form w SGJP.
 *
 *   node scripts/polski-l13-selftest.mjs
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
const dir = await mkdtemp(join(tmpdir(), 'polski-l13-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
await writeFile(entry, `export * from '${resolve(root, 'src/app/jezyk-polski/klasa-4/components/lessons/odmienne-i-nieodmienne/odmiana.ts')}';\n`);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });
let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };
const eq = (a, b, l) => check(JSON.stringify(a) === JSON.stringify(b), `${l} (oczekiwano ${JSON.stringify(b)}, jest ${JSON.stringify(a)})`);

const { WYRAZY, START, forma, pociagnij, podpis, wszystkieFormy, skutek, wynikProb } = lib;
const words = Object.values(WYRAZY);
const ILE = ['jeden', 'wiele'], KTO = ['on', 'ja'], KIEDY = ['dzis', 'wczoraj', 'jutro'];
const combos = [];
for (const ile of ILE) for (const kto of KTO) for (const kiedy of KIEDY) combos.push({ ile, kto, kiedy });

// ── A. dźwignie ──
eq(START, { ile: 'jeden', kto: 'on', kiedy: 'dzis' }, 'A0 START');
eq(lib.DZWIGNIE, ['ile', 'kto', 'kiedy'], 'A0b DZWIGNIE');
{
  const d0 = { ile: 'jeden', kto: 'on', kiedy: 'dzis' };
  const snap = JSON.stringify(d0);
  eq(pociagnij(d0, 'ile').ile, 'wiele', 'A1 ile jeden→wiele');
  eq(pociagnij(pociagnij(d0, 'ile'), 'ile').ile, 'jeden', 'A2 ile wiele→jeden');
  eq(pociagnij(d0, 'kto').kto, 'ja', 'A3 kto on→ja');
  eq(pociagnij(pociagnij(d0, 'kto'), 'kto').kto, 'on', 'A4 kto ja→on');
  let k = d0; const seq = [];
  for (let i = 0; i < 3; i++) { k = pociagnij(k, 'kiedy'); seq.push(k.kiedy); }
  eq(seq, ['wczoraj', 'jutro', 'dzis'], 'A5 kiedy dzis→wczoraj→jutro→dzis');
  eq(JSON.stringify(d0), snap, 'A6 nie mutuje wejścia');
  for (const k2 of lib.DZWIGNIE) {
    const r = pociagnij(d0, k2);
    check(r !== d0, `A7 ${k2} nowy obiekt`);
    for (const o of lib.DZWIGNIE) if (o !== k2) eq(r[o], d0[o], `A8 ${k2} nie rusza ${o}`);
  }
  for (const d of combos) {
    for (const kk of lib.DZWIGNIE) {
      const a = pociagnij(d, kk);
      check(a[kk] !== d[kk], `A9 ${JSON.stringify(d)} ${kk} się zmienia`);
    }
  }
  eq(podpis({ ile: 'jeden', kto: 'on', kiedy: 'dzis' }, 'ile'), 'jeden', 'A10');
  eq(podpis({ ile: 'wiele', kto: 'on', kiedy: 'dzis' }, 'ile'), 'wiele', 'A11');
  eq(podpis({ ile: 'jeden', kto: 'ja', kiedy: 'dzis' }, 'kto'), 'ja', 'A12');
  eq(podpis({ ile: 'jeden', kto: 'on', kiedy: 'dzis' }, 'kto'), 'on', 'A13');
  eq(podpis({ ile: 'wiele', kto: 'ja', kiedy: 'dzis' }, 'kto'), 'my', 'A14');
  eq(podpis({ ile: 'wiele', kto: 'on', kiedy: 'dzis' }, 'kto'), 'oni', 'A15');
  eq(podpis({ ile: 'jeden', kto: 'on', kiedy: 'dzis' }, 'kiedy'), 'dziś', 'A16');
  eq(podpis({ ile: 'jeden', kto: 'on', kiedy: 'wczoraj' }, 'kiedy'), 'wczoraj', 'A17');
  eq(podpis({ ile: 'jeden', kto: 'on', kiedy: 'jutro' }, 'kiedy'), 'jutro', 'A18');
  for (const d of combos) {
    check(podpis(d, 'ile') === d.ile, `A19 podpis ile ${JSON.stringify(d)}`);
    check(podpis(d, 'kiedy') === (d.kiedy === 'dzis' ? 'dziś' : d.kiedy), `A20 podpis kiedy ${JSON.stringify(d)}`);
  }
}

// ── B. forma ──
for (const [key, w] of Object.entries(WYRAZY)) {
  eq(w.id, key, `B0 id=klucz ${key}`);
  eq(lib.wyraz(key), w, `B0b wyraz(${key})`);
  check(forma(w, START) === w.tekst, `B1 forma(${w.id}, START) === tekst („${forma(w, START)}” vs „${w.tekst}”)`);
  const bez = new Set();
  for (const d of combos) {
    const f = forma(w, d);
    check(typeof f === 'string' && f.length > 0, `B2 ${w.id} ${JSON.stringify(d)} niepusta`);
    if (w.rodzaj === 'nieodmienny') {
      check(f === w.tekst, `B3 nieodmienny ${w.id} stały`);
      check(!w.liczba && !w.czasownik, `B3b nieodmienny ${w.id} bez tablic`);
    } else if (w.rodzaj === 'rzeczownik' || w.rodzaj === 'przymiotnik') {
      check(f === w.liczba[d.ile === 'jeden' ? 0 : 1], `B4 ${w.id} zależy od ile`);
      for (const kto of KTO) for (const kiedy of KIEDY) check(forma(w, { ...d, kto, kiedy }) === f, `B5 ${w.id} nie zależy od kto/kiedy`);
    } else {
      const osoba = d.ile === 'jeden' ? (d.kto === 'ja' ? 0 : 1) : d.kto === 'ja' ? 2 : 3;
      check(f === w.czasownik[d.kiedy][osoba], `B6 ${w.id} tabela`);
      bez.add(f);
    }
  }
  if (w.rodzaj === 'czasownik') eq(bez.size, 12, `B7 ${w.id} 12 różnych form`);
}
eq(forma(WYRAZY.kot, { ...START, ile: 'wiele' }), 'koty', 'B8 kot wiele');
eq(forma(WYRAZY.plynie, { ile: 'wiele', kto: 'ja', kiedy: 'jutro' }), 'będziemy płynąć', 'B9 płynie');
eq(forma(WYRAZY.pic, { ile: 'wiele', kto: 'on', kiedy: 'dzis' }), 'piją', 'B10 pije');
eq(forma(WYRAZY.spiewac, { ile: 'wiele', kto: 'ja', kiedy: 'jutro' }), 'będziemy śpiewać', 'B11 śpiewa');
eq(forma(WYRAZY.zielony, { ...START, ile: 'wiele' }), 'zielone', 'B12 zielony');
eq(forma(WYRAZY.plynie, { ile: 'jeden', kto: 'ja', kiedy: 'wczoraj' }), 'płynąłem', 'B13');
eq(forma(WYRAZY.biegnie, { ile: 'wiele', kto: 'on', kiedy: 'wczoraj' }), 'biegli', 'B14');
eq(forma(WYRAZY.czyta, { ile: 'jeden', kto: 'on', kiedy: 'jutro' }), 'będzie czytać', 'B15');
eq(Object.keys(WYRAZY).length, words.length, 'B16 WYRAZY');
for (const rodzaj of ['rzeczownik', 'przymiotnik', 'czasownik', 'nieodmienny']) check(words.some((w) => w.rodzaj === rodzaj), `B17 jest ${rodzaj}`);

// ── C. wszystkieFormy, skutek ──
for (const w of words) {
  const f = wszystkieFormy(w);
  const oczek = w.rodzaj === 'nieodmienny' ? 1 : w.rodzaj === 'czasownik' ? 12 : 2;
  eq(f.length, oczek, `C1 wszystkieFormy(${w.id}) liczba`);
  eq(new Set(f).size, f.length, `C2 ${w.id} bez powtórzeń`);
  check(f.includes(w.tekst), `C3 ${w.id} zawiera tekst`);
  check(lib.odmienny(w) === (w.rodzaj !== 'nieodmienny'), `C4 odmienny(${w.id})`);
  for (const d of combos) for (const k of lib.DZWIGNIE) {
    const s = skutek(w, d, k);
    check(s.przed === forma(w, d) && s.po === forma(w, pociagnij(d, k)), `C5 ${w.id} skutek przed/po`);
    check(s.zmiana === (s.przed !== s.po), `C6 ${w.id} zmiana spójna`);
    eq(s.d, pociagnij(d, k), `C7 ${w.id} skutek.d`);
  }
}
check(skutek(WYRAZY.kot, START, 'kiedy').zmiana === false, 'C8 kot + kiedy → false');
check(skutek(WYRAZY.kot, START, 'kto').zmiana === false, 'C9 kot + kto → false');
check(skutek(WYRAZY.kot, START, 'ile').zmiana === true, 'C10 kot + ile → true');
check(skutek(WYRAZY.plynie, START, 'kiedy').zmiana === true, 'C11 płynie + kiedy → true');
check(skutek(WYRAZY.plynie, START, 'kto').zmiana === true, 'C12 płynie + kto → true');
check(skutek(WYRAZY.plynie, START, 'ile').zmiana === true, 'C13 płynie + ile → true');
for (const k of lib.DZWIGNIE) check(skutek(WYRAZY.bardzo, START, k).zmiana === false, `C14 bardzo + ${k} → false`);
check(skutek(WYRAZY.zielony, START, 'kto').zmiana === false, 'C15 zielony + kto → false');
check(skutek(WYRAZY.zielony, START, 'ile').zmiana === true, 'C16 zielony + ile → true');

// ── D. wynikProb ──
{
  const wszystkie = ['ile', 'kto', 'kiedy'];
  for (const sub of [[], ['ile'], ['kto'], ['kiedy'], ['ile', 'kto'], ['ile', 'kiedy'], ['kto', 'kiedy']]) {
    for (const w of words) check(wynikProb(w, sub, ['koty', 'wczoraj']) === null, `D1 ${w.id} null przy ${sub.join(',') || '∅'}`);
  }
  eq(wynikProb(WYRAZY.wczoraj, wszystkie, ['wczoraj', 'wczoraj', 'wczoraj']), 'stoi', 'D2 wczoraj stoi');
  eq(wynikProb(WYRAZY.wczoraj, wszystkie, []), 'stoi', 'D3 bez widzianych stoi');
  eq(wynikProb(WYRAZY.kot, wszystkie, ['kot', 'koty']), 'zmienia', 'D4 kot zmienia');
  eq(wynikProb(WYRAZY.kot, wszystkie, ['kot', 'kot']), 'stoi', 'D5 kot bez zmiany stoi');
  eq(wynikProb(WYRAZY.plynie, ['kiedy', 'ile', 'kto'], ['będzie płynąć']), 'zmienia', 'D6 kolejność dźwigni bez znaczenia');
  eq(wynikProb(WYRAZY.zielony, wszystkie, ['zielony', 'zielone']), 'zmienia', 'D7 zielony zmienia');
}

// ── E. blok 2 ──
{
  const T = lib.TASMA;
  eq(T.length, 12, 'E1 TASMA 12');
  eq(new Set(T).size, 12, 'E2 TASMA unikalne');
  for (const id of T) check(!!WYRAZY[id], `E3 ${id} istnieje`);
  eq(T.filter((id) => lib.odmienny(WYRAZY[id])).length, 6, 'E4 6 odmiennych');
  eq(T.filter((id) => !lib.odmienny(WYRAZY[id])).length, 6, 'E5 6 nieodmiennych');
  for (let i = 0; i + 2 < T.length; i++) {
    const k = [0, 1, 2].map((j) => lib.odmienny(WYRAZY[T[i + j]]));
    check(!(k[0] === k[1] && k[1] === k[2]), `E6 brak trzech takich samych od ${i} (${T[i]},${T[i + 1]},${T[i + 2]})`);
  }
  for (const w of words) eq(lib.torWyrazu(w), w.rodzaj === 'nieodmienny' ? 'kamien' : 'guma', `E7 tor ${w.id}`);
  const k0 = ['pies', 'jutro', 'czyta'];
  const s0 = JSON.stringify(k0);
  const ok = lib.poPrzejezdzie(k0, 'guma');
  eq(ok, { kolejka: ['jutro', 'czyta'], trafiony: true }, 'E8 dobry tor');
  const zle = lib.poPrzejezdzie(k0, 'kamien');
  eq(zle, { kolejka: ['jutro', 'czyta', 'pies'], trafiony: false }, 'E9 zły tor');
  eq(JSON.stringify(k0), s0, 'E10 nie mutuje');
  eq(lib.poPrzejezdzie(['jutro', 'pies'], 'kamien'), { kolejka: ['pies'], trafiony: true }, 'E11 nieodmienny kamień');
  eq(lib.poPrzejezdzie(['jutro', 'pies'], 'guma'), { kolejka: ['pies', 'jutro'], trafiony: false }, 'E12 nieodmienny guma');
  eq(lib.poPrzejezdzie(['pies'], 'kamien'), { kolejka: ['pies'], trafiony: false }, 'E13 jeden element zły tor');
  eq(lib.poPrzejezdzie(['pies'], 'guma').kolejka, [], 'E14 jeden element dobry tor');
  // pełne przejście: sama dobra gra opróżnia taśmę w 12 ruchach
  let q = [...T], ruchy = 0;
  while (q.length && ruchy < 100) { q = lib.poPrzejezdzie(q, lib.torWyrazu(WYRAZY[q[0]])).kolejka; ruchy++; }
  eq([q.length, ruchy], [0, 12], 'E15 dobra gra 12 ruchów');
  for (const id of T) {
    const p = lib.pokazZmiany(WYRAZY[id]);
    check(p.length >= 1 && p.length <= 3, `E16 pokazZmiany ${id} 1–3 formy`);
    eq(p.length, Math.min(3, wszystkieFormy(WYRAZY[id]).length), `E17 pokazZmiany ${id} liczba`);
  }
  const S = lib.SKRZYNIA;
  eq(S.length, 8, 'E18 SKRZYNIA 8');
  eq(new Set(S).size, 8, 'E19 SKRZYNIA unikalne');
  for (const id of S) check(!!WYRAZY[id], `E20 ${id} istnieje`);
  eq(S.filter((id) => lib.odmienny(WYRAZY[id])).length, 4, 'E21 skrzynia 4 odmienne');
  eq(S.filter((id) => !lib.odmienny(WYRAZY[id])).length, 4, 'E22 skrzynia 4 nieodmienne');
  eq(S.filter((id) => TASMA_HAS(id)).length, 0, 'E23 skrzynia i taśma rozłączne');
  function TASMA_HAS(id) { return T.includes(id); }
  const M = lib.DO_MAGAZYNU;
  eq(new Set(M).size, M.length, 'E24 DO_MAGAZYNU bez duplikatów');
  eq(M.length, 20, 'E25 DO_MAGAZYNU 20');
  for (const id of M) check(!!WYRAZY[id], `E26 magazyn ${id} istnieje`);
}

// ── F. blok 3 ──
{
  const TB = lib.TABLICE;
  check(TB.length >= 2, 'F0 co najmniej dwie tablice');
  eq(new Set(TB.map((t) => t.id)).size, TB.length, 'F0b id tablic unikalne');
  for (const t of TB) {
    for (const x of t.wyrazy) {
      if (!x.stale) {
        check(!!WYRAZY[x.id], `F1 ${t.id}/${x.id} istnieje w WYRAZY`);
        const w = WYRAZY[x.id];
        if (!w) continue;
        if (lib.odmienny(w)) {
          const ok = combos.some((d) => forma(w, d).toLowerCase() === x.cel.toLowerCase());
          check(ok, `F2 ${t.id}/${x.id} cel „${x.cel}” osiągalny maszyną`);
        } else {
          eq(x.cel.toLowerCase(), w.lemat, `F3 ${t.id}/${x.id} cel nieodmiennego = lemat`);
          check(lib.oddajOdRazu(x.id), `F3b ${t.id}/${x.id} oddajOdRazu`);
        }
      }
    }
    check(t.wyrazy.some((x) => x.stale), `F4 ${t.id} ma wyraz stały`);
    check(t.wyrazy.some((x) => !x.stale && WYRAZY[x.id] && lib.odmienny(WYRAZY[x.id])), `F5 ${t.id} ma odmienne do naprawy`);
    // słownikowe zdanie nie pasuje, a pełne wstawienie pasuje
    eq(lib.tablicaGotowa(t, {}), false, `F6 ${t.id} gotowa bez wstawień → false`);
    const wst = {};
    for (const x of t.wyrazy) if (!x.stale) wst[x.id] = x.cel;
    eq(lib.tablicaGotowa(t, wst), true, `F7 ${t.id} gotowa po wstawieniu cel`);
    t.wyrazy.forEach((x, i) => {
      check(lib.pasuje(t, i, wst), `F8 ${t.id}[${i}] pasuje po wstawieniu`);
      if (x.stale) check(lib.pasuje(t, i, {}), `F9 ${t.id}[${i}] stały pasuje zawsze`);
      else if (WYRAZY[x.id] && lib.odmienny(WYRAZY[x.id]) && WYRAZY[x.id].lemat.toLowerCase() !== x.cel.toLowerCase())
        check(!lib.pasuje(t, i, {}), `F10 ${t.id}[${i}] odmienny przed naprawą nie pasuje`);
      else if (!x.stale) check(!lib.pasuje(t, i, {}), `F11 ${t.id}[${i}] lemat = cel, ale bez przejścia przez maszynę nie pasuje`);
      // wielka litera na początku nie przeszkadza
      if (!x.stale) check(lib.pasuje(t, i, { [x.id]: x.cel.toUpperCase() }), `F12 ${t.id}[${i}] wielkość liter bez znaczenia`);
      if (!x.stale) check(!lib.pasuje(t, i, { [x.id]: x.cel + 'x' }), `F13 ${t.id}[${i}] zła forma nie pasuje`);
    });
    t.wyrazy.forEach((x, i) => {
      const s = lib.naTablicy(t, i, {});
      const exp = x.stale ? x.cel : WYRAZY[x.id].lemat;
      eq(s, i === 0 ? exp[0].toUpperCase() + exp.slice(1) : exp, `F14 naTablicy ${t.id}[${i}]`);
      eq(lib.naTablicy(t, i, wst), i === 0 ? x.cel[0].toUpperCase() + x.cel.slice(1) : x.cel, `F15 naTablicy po wstawieniu ${t.id}[${i}]`);
    });
    // naprawiony wyraz po wyrazie: dopiero komplet daje gotowe
    const cz = {};
    const doNapr = t.wyrazy.filter((x) => !x.stale);
    doNapr.forEach((x, n) => {
      cz[x.id] = x.cel;
      eq(lib.tablicaGotowa(t, cz), n === doNapr.length - 1 || doNapr.slice(n + 1).every((y) => lib.pasuje(t, t.wyrazy.indexOf(y), cz)), `F16 ${t.id} gotowość po ${n + 1} wstawieniach`);
    });
    check(t.koniec.length > 0, `F17 ${t.id} koniec`);
  }
  const t1 = TB[0];
  eq(t1.wyrazy.map((_, i) => lib.naTablicy(t1, i, {})).join(' '), 'Dziś dwa mały kot pić mleko', 'F18 tablica 1 zdanie słownikowe');
  eq(t1.wyrazy.map((_, i) => lib.naTablicy(t1, i, Object.fromEntries(t1.wyrazy.filter((x) => !x.stale).map((x) => [x.id, x.cel])))).join(' '), 'Dziś dwa małe koty piją mleko', 'F19 tablica 1 po naprawie');
  const t2 = TB[1];
  eq(t2.wyrazy.map((_, i) => lib.naTablicy(t2, i, {})).join(' '), 'Jutro my śpiewać głośno', 'F20 tablica 2 zdanie słownikowe');
  check(lib.oddajOdRazu('dzis') === true, 'F21 oddajOdRazu(dzis)');
  check(lib.oddajOdRazu('kot') === false, 'F22 oddajOdRazu(kot)');
  for (const w of words) eq(lib.oddajOdRazu(w.id), w.rodzaj === 'nieodmienny', `F23 oddajOdRazu(${w.id})`);
  // „dwa” i „my” nie są w WYRAZY (stałe)
  for (const t of TB) for (const x of t.wyrazy) if (x.stale) check(!WYRAZY[x.id], `F24 stały ${x.id} nie jest w WYRAZY`);
}

// ── G. SGJP ──
const SGJP = join(homedir(), '.cache/dociekai/sgjp-20260823.tab.gz');
if (!existsSync(SGJP)) {
  console.log('⚠ Brak zrzutu SGJP (' + SGJP + ') — pomijam sekcję G.');
} else {
  // potrzebne formy: forma -> lista wymagań
  const need = new Map(); // form -> [{ lemat, opis, test(tag) }]
  const add = (f, lemat, opis, test) => { if (!need.has(f)) need.set(f, []); need.get(f).push({ lemat, opis, test }); };
  const hasPl = (t) => t.split(':').includes('pl');
  const hasSg = (t) => t.split(':').includes('sg');
  const nom = (t) => /(^|:|\.)nom(\.|:|$)/.test(t);
  for (const w of words) {
    if (w.rodzaj === 'nieodmienny') add(w.tekst, w.lemat, `${w.id} nieodmienny`, () => true);
    else if (w.rodzaj === 'czasownik') {
      for (const f of wszystkieFormy(w)) {
        const m = f.match(/^(będę|będzie|będziemy|będą) (.+)$/);
        if (m) { add(m[1], 'być', `${w.id} „${f}” (być)`, () => true); add(m[2], w.lemat, `${w.id} „${f}” (bezokolicznik)`, (t) => t.startsWith('inf')); }
        else add(f, w.lemat, `${w.id} „${f}”`, () => true);
      }
    } else {
      const [sg, pl] = w.liczba;
      add(sg, w.lemat, `${w.id} sg „${sg}”`, (t) => hasSg(t) && nom(t));
      if (w.rodzaj === 'rzeczownik') add(pl, w.lemat, `${w.id} pl „${pl}”`, (t) => hasPl(t) && nom(t));
      else add(pl, w.lemat, `${w.id} pl „${pl}” (nie męskoosobowa)`, (t) => hasPl(t) && nom(t) && /(^|:|\.)(n|f|m2|m3)(\.|:|$)/.test(t.split(':').slice(3).join(':') || t));
    }
  }
  const found = new Map(); // opis -> true
  const seen = new Map();
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

console.log(`\nL13 selftest: ${pass} OK, ${fail} błędów (${pass + fail} asercji)`);
process.exit(fail ? 1 : 0);

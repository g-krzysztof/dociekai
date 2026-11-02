/**
 * Selftest L16 „Wyścig i tort” — `przymiotnik-i-przyslowek/wyscig.ts`
 * (karty, odcinki, fizyka przejazdu, geometria drogi) i `tort.ts`
 * (zamówienia, sędzia „cecha po cesze”, zmiany budowy, kosz słów).
 *
 *   node scripts/polski-l16-selftest.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l16-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
const L = resolve(root, 'src/app/jezyk-polski/klasa-4/components/lessons/przymiotnik-i-przyslowek');
await writeFile(entry, [
  `export * from '${L}/wyscig.ts';`,
  `export * from '${L}/tort.ts';`,
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
const near = (a, b, tol, l) => check(Math.abs(a - b) <= tol, `${l} (oczekiwano ${b}±${tol}, jest ${a})`);

const { KARTY, REKA, ODCINKI, przejazd, postepRywala, coSieStalo, ileZaliczonych, probkuj, punkt, najblizszy,
  prowadz, fragment, TOLERANCJA, ZASIEG,
  ZAMOWIENIA, ocenTort, tortPrzyjety, nalozForme, dolozPietro, zdejmijPietro, polejLukrem, doWyspy, PUSTA,
  KOSZ, RAMY, wRamie } = lib;

const KARTY_ID = ['szybko', 'powoli', 'ostroznie', 'cicho', 'prosto', 'zygzakiem', 'szybciej'];
const odc = (id) => ODCINKI.find((o) => o.id === id);

// ── W. WYSCIG ──
console.log('W. wyscig');
eq(ODCINKI.map((o) => o.id), ['prosta', 'lod', 'pies', 'kladka', 'final'], 'W0 odcinki');
eq(Object.keys(KARTY).sort(), [...KARTY_ID].sort(), 'W0b karty');

// 1. tabela przejazdu
const META = {
  prosta: ['szybko', 'szybciej'],
  lod: ['powoli', 'ostroznie'],
  pies: ['cicho'],
  kladka: ['prosto', 'ostroznie'],
  final: ['szybciej'],
};
const RODZAJ = { prosta: 'rywal', lod: 'poslizg', pies: 'pies', kladka: 'woda', final: 'rywal' };
for (const o of ODCINKI) {
  for (const k of KARTY_ID) {
    const p = przejazd(o, k);
    if (META[o.id].includes(k)) {
      eq(p, { wynik: 'meta' }, `W1 ${o.id}×${k} meta`);
    } else if (o.id === 'final' && k === 'szybko') {
      eq(p.wynik === 'upadek' && p.rodzaj, 'remis', `W1 final×szybko rodzaj`);
      eq(p.przy, 1, 'W1 final×szybko przy');
    } else {
      check(p.wynik === 'upadek' && p.rodzaj === RODZAJ[o.id], `W1 ${o.id}×${k} upadek ${RODZAJ[o.id]} (jest ${JSON.stringify(p)})`);
    }
  }
}
// meta w REKA
for (const o of ODCINKI) {
  const meta = REKA.filter((k) => przejazd(o, k).wynik === 'meta');
  if (o.id === 'final') eq(meta, [], 'W1b final: w REKA nie ma mety');
  else check(meta.length >= 1, `W1b ${o.id}: w REKA jest karta dająca metę (${meta.join(',')})`);
}
check(!REKA.includes('szybciej'), 'W1c REKA bez szybciej');
eq(przejazd(odc('final'), 'szybciej'), { wynik: 'meta' }, 'W1d final: szybciej meta');
eq(REKA.filter((k) => przejazd(odc('final'), k).wynik === 'meta').length, 0, 'W1e final: żadna z ręki');

// 2. przy
for (const o of ODCINKI) {
  for (const k of KARTY_ID) {
    const p = przejazd(o, k);
    if (p.wynik !== 'upadek') continue;
    check(p.przy > 0 && p.przy <= 1, `W2 ${o.id}×${k} przy w (0,1] (jest ${p.przy})`);
    if (p.rodzaj === 'rywal') {
      near(p.przy, Math.round((KARTY[k].tempo / o.rywal.tempo) * 1000) / 1000, 1e-9, `W2b ${o.id}×${k} przy = tempo/tempo_rywala`);
      check(p.przy < 1, `W2c ${o.id}×${k} przy rywala < 1`);
    }
  }
}

// 3. postępRywala
for (const k of KARTY_ID) for (const f of [0, 0.5, 1]) eq(postepRywala(odc('lod'), k, f), 0, `W3 lod bez rywala ${k} ${f}`);
check(postepRywala(odc('prosta'), 'szybko', 1) < 1, 'W3b prosta szybko frac 1: rywal < 1');
for (const o of ODCINKI.filter((x) => x.rywal)) {
  for (const k of KARTY_ID) {
    for (let f = 0; f <= 1.0001; f += 0.05) check(postepRywala(o, k, Math.min(1, f)) <= 1, `W3c ${o.id}×${k} ≤ 1 przy ${f.toFixed(2)}`);
    const p = przejazd(o, k);
    if (p.wynik === 'upadek' && p.rodzaj === 'rywal') {
      near(postepRywala(o, k, p.przy), 1, 0.002, `W3d ${o.id}×${k} rywal osiąga 1 przy frac = przy`);
    }
  }
}
check(postepRywala(odc('prosta'), 'powoli', 1) === 1, 'W3e prosta powoli frac 1: rywal przycięty do 1');

// 4. coSieStalo
for (const o of ODCINKI) {
  for (const k of KARTY_ID) {
    const p = przejazd(o, k);
    const t = coSieStalo(o, k, p);
    check(typeof t === 'string' && t.length > 0 && !t.includes('undefined'), `W4 ${o.id}×${k} niepusty bez undefined (${t})`);
    if (!(p.wynik === 'upadek' && p.rodzaj === 'remis')) {
      check(t.includes(`„${KARTY[k].slowo}”`), `W4b ${o.id}×${k} zawiera „${KARTY[k].slowo}” (${t})`);
    }
  }
}

// 5. probkuj
const prostaProbki = probkuj('M150 296 L150 30');
near(prostaProbki.len, 266, 0.01, 'W5 prosta len 266');
const PR = {};
for (const o of ODCINKI) {
  const p = probkuj(o.d);
  PR[o.id] = p;
  check(p.len > 200, `W5b ${o.id} len > 200 (${p.len})`);
  check(p.x.length === p.y.length && p.y.length === p.s.length && p.x.length > 2, `W5c ${o.id} równe tablice`);
  let mono = true;
  for (let i = 1; i < p.s.length; i++) if (p.s[i] < p.s[i - 1]) mono = false;
  check(mono, `W5d ${o.id} s niemalejące`);
  near(p.s[p.s.length - 1], p.len, 1e-9, `W5e ${o.id} ostatnie s = len`);
  near(p.s[0], 0, 1e-9, `W5f ${o.id} pierwsze s = 0`);
}

// 6. punkt
const zaokr = (n) => Math.abs(n * 10 - Math.round(n * 10)) < 1e-6;
for (const o of ODCINKI) {
  const p = PR[o.id];
  const a = punkt(p, 0);
  const b = punkt(p, 1);
  near(a.x, Math.round(p.x[0] * 10) / 10, 0.0001, `W6 ${o.id} frac 0 x`);
  near(a.y, Math.round(p.y[0] * 10) / 10, 0.0001, `W6 ${o.id} frac 0 y`);
  const n = p.x.length - 1;
  near(b.x, Math.round(p.x[n] * 10) / 10, 0.0001, `W6 ${o.id} frac 1 x`);
  near(b.y, Math.round(p.y[n] * 10) / 10, 0.0001, `W6 ${o.id} frac 1 y`);
  eq(punkt(p, -0.5), a, `W6b ${o.id} frac<0 przycięte`);
  eq(punkt(p, 1.7), b, `W6b ${o.id} frac>1 przycięte`);
  let zok = true, dok = true, worst = 0;
  for (let f = 0; f <= 1.0001; f += 0.01) {
    const q = punkt(p, f, 5);
    const q0 = punkt(p, f, 0);
    if (!zaokr(q.x) || !zaokr(q.y) || !zaokr(q0.x) || !zaokr(q0.y)) zok = false;
    const d = Math.hypot(q.x - q0.x, q.y - q0.y);
    worst = Math.max(worst, d);
    if (d > 5.1) dok = false;
  }
  check(zok, `W6c ${o.id} współrzędne zaokrąglone do 0.1`);
  check(dok, `W6d ${o.id} chwiej 5: odległość ≤ 5 + zaokrąglenie 0.1 (najgorsza ${worst})`);
}
eq(punkt(prostaProbki, 0.5).kat, 0, 'W6e kat na prostej w górę = 0');
eq(punkt(prostaProbki, 0).kat, 0, 'W6e2 kat na początku prostej');
eq(punkt(prostaProbki, 1).kat, 0, 'W6e3 kat na końcu prostej');
eq(punkt(prostaProbki, 0.5), { x: 150, y: 163, kat: 0 }, 'W6f środek prostej');

// 7. najblizszy
for (const o of ODCINKI) {
  const p = PR[o.id];
  for (let f = 0.05; f < 1; f += 0.1) {
    const q = punkt(p, f, 0);
    const n = najblizszy(p, q.x, q.y);
    check(n.dist < 1.5, `W7 ${o.id} f=${f.toFixed(2)} dist < 1.5 (${n.dist})`);
    near(n.frac, f, 0.02, `W7b ${o.id} f=${f.toFixed(2)} frac`);
  }
}

// 8. prowadz
{
  const p = prostaProbki;
  const at = (f, dx = 0) => { const q = punkt(p, f, 0); return [q.x + dx, q.y]; };
  const cel = 0.3;
  eq(prowadz(p, cel, ...at(0.4, TOLERANCJA + 10)), cel, 'W8 palec poza TOLERANCJĄ: cel bez zmian');
  eq(prowadz(p, cel, ...at(0.4, -(TOLERANCJA + 10))), cel, 'W8b palec poza TOLERANCJĄ (lewo)');
  eq(prowadz(p, cel, ...at(0.9)), cel, 'W8c palec dalej niż ZASIEG przed celem: bez zmian');
  const bliski = prowadz(p, cel, ...at(0.4));
  check(bliski > cel && Math.abs(bliski - 0.4) < 0.02, `W8d palec trochę przed celem zwiększa cel (${bliski})`);
  const blisko2 = prowadz(p, cel, ...at(0.4, TOLERANCJA - 5));
  check(blisko2 > cel, `W8e palec w TOLERANCJI zwiększa cel (${blisko2})`);
  eq(prowadz(p, cel, ...at(0.1)), cel, 'W8f palec za celem nie zmniejsza celu');
  eq(prowadz(p, cel, ...at(0.3)) >= cel, true, 'W8g palec w miejscu celu nie cofa');
  check(ZASIEG === 50 && TOLERANCJA === 40, 'W8h stałe ZASIEG/TOLERANCJA');
}

// 9. fragment
{
  const lod = odc('lod');
  const f = fragment(PR.lod, lod.strefa[0], lod.strefa[1]);
  check(typeof f === 'string' && f.length > 0, 'W9 fragment lodu niepusty');
  check(/^-?\d+(\.\d+)?,-?\d+(\.\d+)? (-?\d+(\.\d+)?,-?\d+(\.\d+)? ?)*$/.test(f.trim() + ' ') || /^(-?\d+(\.\d+)?,-?\d+(\.\d+)?)( -?\d+(\.\d+)?,-?\d+(\.\d+)?)*$/.test(f), `W9b format 'x,y x,y' (${f.slice(0, 40)})`);
  check(f.split(' ').length > 5, 'W9c fragment ma wiele punktów');
  eq(fragment(PR.lod, 2, 3), '', 'W9d poza drogą pusty');
}

// 10. ileZaliczonych
eq(ileZaliczonych({}), 0, 'W10 pusty');
eq(ileZaliczonych({ prosta: 'szybko', lod: 'powoli' }), 2, 'W10b prosta+lod');
eq(ileZaliczonych({ prosta: 'szybko', pies: 'cicho' }), 1, 'W10c dziura');
eq(ileZaliczonych({ prosta: 'szybko', lod: 'powoli', pies: 'cicho', kladka: 'prosto', final: 'szybciej' }), 5, 'W10d wszystkie');

// ── T. TORT ──
console.log('T. tort');
const cechy = (z) => {
  const c = {};
  for (const s of z.slowa) c[s.cecha.cecha] = s.cecha.wartosc;
  return c;
};
const budowa = (c, over = {}) => ({
  ksztalt: c.ksztalt,
  pietra: Array(c.pietra).fill(c.smak),
  kolor: c.kolor,
  ...over,
});
const FORMY = ['okragly', 'kwadratowy'];
const SMAKI = ['waniliowy', 'czekoladowy', 'cytrynowy', 'malinowy'];
const KOLORY = ['rozowy', 'zielony', 'bialy'];
eq(ZAMOWIENIA.length, 3, 'T0 3 zamówienia');

// oczekiwane: zbiór cech, które mają być nie-ok
function sprawdz(z, b, nieOk, l) {
  const oc = ocenTort(b, z);
  eq(oc.length, z.slowa.length, `${l} długość ocen`);
  z.slowa.forEach((s, i) => {
    const o = oc[i];
    if (nieOk.includes(s.cecha.cecha)) check(o.ok === false && typeof o.uwaga === 'string' && o.uwaga.length > 0, `${l} cecha ${s.cecha.cecha} → ok=false z uwagą (jest ${JSON.stringify(o)})`);
    else check(o.ok === true && o.uwaga === '', `${l} cecha ${s.cecha.cecha} → ok z pustą uwagą (jest ${JSON.stringify(o)})`);
  });
  eq(tortPrzyjety(b, z), nieOk.length === 0, `${l} tortPrzyjety`);
}

for (const z of ZAMOWIENIA) {
  const c = cechy(z);
  const n = c.pietra;
  // 11
  sprawdz(z, budowa(c), [], `T11 ${z.id} wzorcowy`);
  // 12
  for (const f of FORMY.filter((x) => x !== c.ksztalt)) sprawdz(z, budowa(c, { ksztalt: f }), ['ksztalt'], `T12 ${z.id} forma ${f}`);
  sprawdz(z, budowa(c, { ksztalt: null }), ['ksztalt'], `T12 ${z.id} brak formy`);
  for (let m = 1; m <= 3; m++) if (m !== n) sprawdz(z, budowa(c, { pietra: Array(m).fill(c.smak) }), ['pietra'], `T12 ${z.id} ${m} pięter`);
  sprawdz(z, budowa(c, { pietra: [] }), ['pietra', 'smak'], `T12 ${z.id} zero pięter`);
  for (let i = 0; i < n; i++) {
    for (const s of SMAKI.filter((x) => x !== c.smak)) {
      const pietra = Array(n).fill(c.smak);
      pietra[i] = s;
      sprawdz(z, budowa(c, { pietra }), ['smak'], `T12 ${z.id} piętro ${i} = ${s}`);
    }
  }
  for (const k of KOLORY.filter((x) => x !== c.kolor)) sprawdz(z, budowa(c, { kolor: k }), ['kolor'], `T12 ${z.id} lukier ${k}`);
  sprawdz(z, budowa(c, { kolor: null }), ['kolor'], `T12 ${z.id} brak lukru`);
}

// treść uwag
{
  const ry = ZAMOWIENIA.find((z) => z.id === 'rybak');
  const la = ZAMOWIENIA.find((z) => z.id === 'latarnik');
  const dz = ZAMOWIENIA.find((z) => z.id === 'dzieci');
  const uw = (z, b, cecha) => ocenTort(b, z)[z.slowa.findIndex((s) => s.cecha.cecha === cecha)].uwaga;
  const cr = cechy(ry), cl = cechy(la), cd = cechy(dz);
  eq(uw(ry, budowa(cr, { pietra: ['czekoladowy', 'czekoladowy'] }), 'pietra'), 'Tort ma dwa piętra.', 'T12u dwa piętra');
  eq(uw(ry, budowa(cr, { pietra: ['czekoladowy'] }), 'pietra'), 'Tort ma jedno piętro.', 'T12u jedno piętro');
  eq(uw(ry, budowa(cr, { pietra: ['czekoladowy', 'waniliowy', 'czekoladowy'] }), 'smak'), 'Środkowe piętro jest waniliowe.', 'T12u środkowe waniliowe');
  eq(uw(la, budowa(cl, { pietra: ['waniliowy', 'malinowy'] }), 'smak'), 'Górne piętro jest malinowe.', 'T12u górne malinowe');
  eq(uw(la, budowa(cl, { pietra: ['malinowy', 'waniliowy'] }), 'smak'), 'Dolne piętro jest malinowe.', 'T12u dolne malinowe (2 piętra)');
  eq(uw(ry, budowa(cr, { pietra: ['cytrynowy', 'czekoladowy', 'czekoladowy'] }), 'smak'), 'Dolne piętro jest cytrynowe.', 'T12u dolne (3 piętra)');
  eq(uw(ry, budowa(cr, { pietra: ['czekoladowy', 'czekoladowy', 'malinowy'] }), 'smak'), 'Górne piętro jest malinowe.', 'T12u górne (3 piętra)');
  eq(uw(dz, budowa(cd, { pietra: ['cytrynowy'] }), 'smak'), 'Jedyne piętro jest cytrynowe.', 'T12u jedyne cytrynowe');
  eq(uw(ry, budowa(cr, { kolor: 'rozowy' }), 'kolor'), 'Lukier jest różowy.', 'T12u lukier różowy');
  eq(uw(ry, budowa(cr, { ksztalt: 'kwadratowy' }), 'ksztalt'), 'Tort jest kwadratowy.', 'T12u kwadratowy');
  eq(uw(la, budowa(cl, { ksztalt: 'okragly' }), 'ksztalt'), 'Tort jest okrągły.', 'T12u okrągły');
  eq(uw(ry, budowa(cr, { pietra: ['czekoladowy', 'czekoladowy', 'czekoladowy'].slice(0, 0) }), 'pietra'), 'Na paterze nie ma jeszcze ani jednego piętra.', 'T12u zero pięter');
  eq(uw(ry, budowa(cr, { ksztalt: null }), 'ksztalt'), 'Tort nie ma jeszcze formy.', 'T12u brak formy');
  eq(uw(ry, budowa(cr, { kolor: null }), 'kolor'), 'Tort nie ma jeszcze lukru.', 'T12u brak lukru');
}

// 13. operacje na budowie
{
  const kopia = (x) => JSON.parse(JSON.stringify(x));
  const b0 = kopia(PUSTA);
  const r0 = dolozPietro(PUSTA, 'waniliowy');
  eq(r0.ok, false, 'T13 dołóż bez formy: ok false');
  eq(r0.powod, 'brak-formy', 'T13b powód brak-formy');
  eq(PUSTA, b0, 'T13c PUSTA niezmieniona');

  const z1 = nalozForme(PUSTA, 'okragly');
  eq(PUSTA, b0, 'T13d nalozForme nie zmienia wejścia');
  eq(z1.ksztalt, 'okragly', 'T13e nalozForme ustawia formę');
  check(z1 !== PUSTA && z1.pietra !== PUSTA.pietra, 'T13f nalozForme nowe obiekty');

  let b = z1;
  for (let i = 0; i < 3; i++) {
    const przed = kopia(b);
    const r = dolozPietro(b, 'czekoladowy');
    eq(b, przed, `T13g dołóż #${i + 1} nie zmienia wejścia`);
    check(r.ok && r.budowa.pietra.length === i + 1 && r.budowa.pietra !== b.pietra, `T13h dołóż #${i + 1} ok, nowa tablica`);
    b = r.budowa;
  }
  const przed4 = kopia(b);
  const r4 = dolozPietro(b, 'malinowy');
  eq(r4.ok, false, 'T13i czwarte piętro ok false');
  eq(r4.powod, 'za-wysoko', 'T13j powód za-wysoko');
  eq(b, przed4, 'T13k czwarte: wejście niezmienione');
  eq(r4.budowa.pietra.length, 3, 'T13l czwarte: nadal 3');

  const pBefore = kopia(b);
  const zd = zdejmijPietro(b, 1);
  eq(b, pBefore, 'T13m zdejmijPietro nie zmienia wejścia');
  eq(zd.pietra.length, 2, 'T13n zdejmijPietro: 2 piętra');
  check(zd.pietra !== b.pietra, 'T13o zdejmijPietro: nowa tablica');
  const zdMid = zdejmijPietro({ ksztalt: 'okragly', pietra: ['waniliowy', 'malinowy', 'cytrynowy'], kolor: null }, 1);
  eq(zdMid.pietra, ['waniliowy', 'cytrynowy'], 'T13p zdejmuje wskazane piętro');

  const bezPieter = kopia(z1);
  const pl0 = polejLukrem(z1, 'bialy');
  eq(pl0.ok, false, 'T13q polejLukrem bez pięter: ok false');
  eq(z1, bezPieter, 'T13r polejLukrem bez pięter nie zmienia wejścia');
  const pl1Wej = kopia(b);
  const pl1 = polejLukrem(b, 'zielony');
  eq(pl1.ok, true, 'T13s polejLukrem z piętrami: ok');
  eq(pl1.budowa.kolor, 'zielony', 'T13t kolor ustawiony');
  eq(b, pl1Wej, 'T13u polejLukrem nie zmienia wejścia');
  check(pl1.budowa.pietra !== b.pietra, 'T13v polejLukrem: nowa tablica pięter');
  const zForma = kopia(b);
  nalozForme(b, 'kwadratowy');
  eq(b, zForma, 'T13w nalozForme na zbudowanym nie zmienia wejścia');
}

// 14. doWyspy
{
  eq(doWyspy(PUSTA), null, 'T14 pusta → null');
  eq(doWyspy({ ksztalt: 'okragly', pietra: [], kolor: 'bialy' }), null, 'T14b bez pięter → null');
  eq(doWyspy({ ksztalt: null, pietra: ['waniliowy'], kolor: 'bialy' }), null, 'T14c bez formy → null');
  eq(doWyspy({ ksztalt: 'okragly', pietra: ['waniliowy'], kolor: null }), null, 'T14d bez lukru → null');
  const pelna = { ksztalt: 'kwadratowy', pietra: ['waniliowy', 'malinowy'], kolor: 'rozowy' };
  const w = doWyspy(pelna);
  eq(w, { ksztalt: 'kwadratowy', pietra: ['waniliowy', 'malinowy'], kolor: 'rozowy' }, 'T14e kompletny → obiekt');
  check(w.pietra !== pelna.pietra, 'T14f nowa tablica pięter');
}

// 15. struktura zamówień
for (const z of ZAMOWIENIA) {
  const liczby = z.zdanie.filter((x) => typeof x === 'number').sort((a, b) => a - b);
  eq(liczby, z.slowa.map((_, i) => i), `T15 ${z.id} indeksy pokrywają 0..n-1 raz`);
  eq(z.slowa.map((s) => s.cecha.cecha).sort(), ['kolor', 'ksztalt', 'pietra', 'smak'], `T15b ${z.id} każda cecha raz`);
  const tekst = z.zdanie.map((x) => (typeof x === 'number' ? z.slowa[x].tekst : x)).join('');
  check(!tekst.includes('  '), `T15c ${z.id} bez podwójnych spacji ("${tekst}")`);
  check(!/\s[,.!]/.test(tekst), `T15d ${z.id} bez spacji przed interpunkcją ("${tekst}")`);
  check(typeof z.kto === 'string' && z.kto.length > 0, `T15e ${z.id} kto`);
}
check(ZAMOWIENIA[2].zdanie[0].endsWith('tort '), `T15f zamówienie 3: pierwszy kawałek kończy się na 'tort ' (jest ${JSON.stringify(ZAMOWIENIA[2].zdanie[0])})`);
eq(new Set(ZAMOWIENIA.map((z) => z.id)).size, 3, 'T15g id unikalne');

// 16. kosz
{
  eq(wRamie('szybko', 'jak'), 'Ślimak pełznie szybko.', 'T16 szybko w ramie jak');
  eq(wRamie('zielony', 'jaki'), 'Tort jest zielony.', 'T16b zielony w ramie jaki');
  for (const k of KOSZ) check(k.rama === 'jak' || k.rama === 'jaki', `T16c ${k.id} ma ramę (${k.rama})`);
  const r = (id) => KOSZ.find((k) => k.id === id)?.rama;
  eq(r('szybko'), 'jak', 'T16d szybko→jak');
  eq(r('zielony'), 'jaki', 'T16e zielony→jaki');
  eq(r('wysoki'), 'jaki', 'T16f wysoki→jaki');
  eq(KOSZ.length, 3, 'T16g kosz ma 3 słowa');
  eq(RAMY.jak.pytanie, 'jak?', 'T16h pytanie jak');
  eq(RAMY.jaki.pytanie, 'jaki?', 'T16i pytanie jaki');
}

console.log(`\nL16 selftest: ${pass} zaliczonych, ${fail} niezaliczonych (razem ${pass + fail})`);
if (fail > 0) process.exit(1);

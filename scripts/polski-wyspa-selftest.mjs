/**
 * Selftest Wyspy (moduł 4) — `src/app/jezyk-polski/klasa-4/lib/wyspa/`.
 * Wzorzec: `scripts/polski-polka-selftest.mjs` (esbuild + atrapa `window`).
 *
 *   node scripts/polski-wyspa-selftest.mjs
 */

import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = await mkdtemp(join(tmpdir(), 'polski-wyspa-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
const base = `${process.cwd()}/src/app/jezyk-polski/klasa-4/lib/wyspa`;
await writeFile(
  entry,
  `export * from '${base}/model';\nexport * from '${base}/storage';\nexport * from '${base}/types';\n`,
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const {
  dodajDoMagazynu, dodajRzecz, zmienRzecz, usunRzecz, ustawNazwe, ustawTor, ustawTort, ustawKota,
  parseWyspa, readWyspa, writeWyspa, adoptSessionWyspa, clearWyspa, mergeWyspa,
  WYSPA_KEY, WYSPA_CHANGED_EVENT, EMPTY_WYSPA,
} = lib;

let failures = 0;
let checks = 0;
const failed = [];
function check(label, actual, expected) {
  checks += 1;
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures += 1;
    failed.push(label);
    console.error(`  ✗ ${label}\n      oczekiwano: ${JSON.stringify(expected)}\n      otrzymano:  ${JSON.stringify(actual)}`);
  }
}
function cond(label, value) {
  checks += 1;
  if (!value) {
    failures += 1;
    failed.push(label);
    console.error(`  ✗ ${label}`);
  }
}
function group(name, fn) {
  console.log(`\n${name}`);
  fn();
}

let events = [];
function memStore() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
  };
}
function resetWindow() {
  events = [];
  globalThis.window = { localStorage: memStore(), sessionStorage: memStore(), dispatchEvent: (e) => events.push(e.type) };
  globalThis.Event = class { constructor(t) { this.type = t; } };
}

const E = () => ({ v: 1, magazyn: [], rzeczy: [], updatedAt: 0 });
const rz = (id, extra = {}) => ({ id, slowo: 'drzewo', x: 10, y: 20, ...extra });

group('A. model', () => {
  const e = E();
  const frozen = JSON.stringify(e);
  const r1 = dodajDoMagazynu(e, ['a', 'b'], 10);
  check('1a. magazyn dodany', r1.magazyn, ['a', 'b']);
  check('1b. updatedAt = now', r1.updatedAt, 10);
  check('1c. wejście niezmienione', JSON.stringify(e), frozen);
  cond('1d. nowy obiekt', r1 !== e && r1.magazyn !== e.magazyn);
  const r2 = dodajDoMagazynu(r1, ['b', 'c', 'a', 'c'], 20);
  check('2a. unia bez duplikatów, kolejność', r2.magazyn, ['a', 'b', 'c']);
  check('2b. r1 nietknięte', r1.magazyn, ['a', 'b']);
  const many = Array.from({ length: 80 }, (_, i) => `w${i}`);
  const r3 = dodajDoMagazynu(e, many, 1);
  check('3a. magazyn max 60', r3.magazyn.length, 60);
  check('3b. zostają pierwsze', r3.magazyn[59], 'w59');
  check('3c. pusta lista ids', dodajDoMagazynu(r1, [], 5).magazyn, ['a', 'b']);

  const r4 = dodajRzecz(e, rz('r1'), 30);
  check('4a. rzecz dodana', r4.rzeczy, [rz('r1')]);
  cond('4b. wejście rzeczy to nie ta sama referencja', r4.rzeczy[0] !== undefined);
  const input = rz('r1');
  const r4b = dodajRzecz(e, input, 30);
  cond('4c. kopia rzeczy', r4b.rzeczy[0] !== input);
  const r5 = dodajRzecz(r4, rz('r2'), 31);
  const r6 = dodajRzecz(r5, rz('r1', { x: 55 }), 32);
  check('5a. zamiana o tym samym id', r6.rzeczy.map((r) => [r.id, r.x]), [['r1', 55], ['r2', 10]]);
  check('5b. r5 nietknięte', r5.rzeczy[0].x, 10);
  const r7 = Array.from({ length: 45 }, (_, i) => i).reduce((acc, i) => dodajRzecz(acc, rz(`q${i}`), i), e);
  check('6a. rzeczy max 40', r7.rzeczy.length, 40);
  check('6b. najstarsze odpadają', [r7.rzeczy[0].id, r7.rzeczy[39].id], ['q5', 'q44']);
  check('7. imie przycięte do 30', dodajRzecz(e, rz('i', { imie: 'x'.repeat(50) }), 1).rzeczy[0].imie.length, 30);

  const z1 = zmienRzecz(r6, 'r2', { x: 99, imie: 'Ala' }, 40);
  check('8a. zmiana pól', z1.rzeczy[1], rz('r2', { x: 99, imie: 'Ala' }));
  check('8b. updatedAt', z1.updatedAt, 40);
  check('8c. oryginał nietknięty', r6.rzeczy[1], rz('r2'));
  const z2 = zmienRzecz(r6, 'brak', { x: 1 }, 50);
  check('9a. brak id: ta sama treść', z2, r6);
  cond('9b. brak id: nowy obiekt', z2 !== r6);
  check('9c. id nie do zmiany', zmienRzecz(r6, 'r1', { id: 'zly' }, 41).rzeczy[0].id, 'r1');
  check('9d. imie w patchu przycięte', zmienRzecz(r6, 'r1', { imie: 'y'.repeat(99) }, 41).rzeczy[0].imie.length, 30);

  const u1 = usunRzecz(r6, 'r1', 60);
  check('10a. usunięcie', u1.rzeczy.map((r) => r.id), ['r2']);
  check('10b. oryginał nietknięty', r6.rzeczy.length, 2);
  check('10c. usunięcie nieistniejącej', usunRzecz(r6, 'nie', 61).rzeczy.length, 2);

  check('11a. nazwa przycięta', ustawNazwe(e, '  Wyspa Ali  ', 1).nazwa, 'Wyspa Ali');
  check('11b. pusta nazwa usuwa pole', 'nazwa' in ustawNazwe(ustawNazwe(e, 'X', 1), '   ', 2), false);
  check('11c. undefined usuwa pole', 'nazwa' in ustawNazwe(ustawNazwe(e, 'X', 1), undefined, 2), false);
  check('11d. max 40 znaków', ustawNazwe(e, 'n'.repeat(100), 1).nazwa.length, 40);
  const named = ustawNazwe(e, 'A', 1);
  ustawNazwe(named, 'B', 2);
  check('11e. wejście nietknięte', named.nazwa, 'A');
  check('11f. nazwa nie psuje reszty', ustawNazwe(r6, 'Z', 70).rzeczy.length, 2);
});

group('B. parseWyspa', () => {
  for (const [i, v] of [null, undefined, 'tekst', 42, [], [1, 2], true].entries()) {
    check(`12.${i} śmieć → pusta`, parseWyspa(v), E());
  }
  check('13a. brak pól', parseWyspa({}), E());
  check('13b. magazyn nie-tablica', parseWyspa({ magazyn: 'abc', rzeczy: 5 }), E());
  check('13c. magazyn: złe elementy', parseWyspa({ magazyn: ['a', 1, null, '', ' ', 'a', 'b'] }).magazyn, ['a', 'b']);
  check('13d. magazyn przycięty do 60', parseWyspa({ magazyn: Array.from({ length: 100 }, (_, i) => `w${i}`) }).magazyn.length, 60);
  check('14a. rzecz bez id odrzucona', parseWyspa({ rzeczy: [{ slowo: 's', x: 1, y: 1 }] }).rzeczy, []);
  check('14b. rzecz bez słowa odrzucona', parseWyspa({ rzeczy: [{ id: 'a', x: 1, y: 1 }] }).rzeczy, []);
  check('14c. x tekstem odrzucone', parseWyspa({ rzeczy: [{ id: 'a', slowo: 's', x: '5', y: 1 }] }).rzeczy, []);
  check('14d. NaN odrzucone', parseWyspa({ rzeczy: [{ id: 'a', slowo: 's', x: NaN, y: 1 }] }).rzeczy, []);
  check('14e. null w rzeczach pominięty', parseWyspa({ rzeczy: [null, 3, 'x', rz('ok')] }).rzeczy, [rz('ok')]);
  const cl = parseWyspa({ rzeczy: [{ id: 'a', slowo: 's', x: -30, y: 250 }] }).rzeczy[0];
  check('15a. x/y do 0–100', [cl.x, cl.y], [0, 100]);
  const rd = parseWyspa({ rzeczy: [{ id: 'a', slowo: 's', x: 12.34, y: 56.78 }] }).rzeczy[0];
  check('15b. zaokrąglenie do 0,1', [rd.x, rd.y], [12.3, 56.8]);
  const it = (extra) => parseWyspa({ rzeczy: [{ id: 'a', slowo: 's', x: 1, y: 1, ...extra }] }).rzeczy[0];
  check('16a. ile zaokrąglone', it({ ile: 3.6 }).ile, 4);
  check('16b. ile min 1', it({ ile: 0 }).ile, 1);
  check('16c. ile max 9', it({ ile: 40 }).ile, 9);
  check('16d. ile tekstem pomijane', 'ile' in it({ ile: '3' }), false);
  check('16e. ile Infinity pomijane', 'ile' in it({ ile: Infinity }), false);
  check('17a. tabliczka ten', it({ tabliczka: 'ten' }).tabliczka, 'ten');
  check('17b. tabliczka ta', it({ tabliczka: 'ta' }).tabliczka, 'ta');
  check('17c. tabliczka to', it({ tabliczka: 'to' }).tabliczka, 'to');
  check('17d. zła tabliczka pomijana', 'tabliczka' in it({ tabliczka: 'tamten' }), false);
  check('17e. tabliczka liczbą pomijana', 'tabliczka' in it({ tabliczka: 1 }), false);
  check('18a. imie przycięte', it({ imie: 'z'.repeat(5000) }).imie.length, 30);
  check('18b. imie trim', it({ imie: '  Ola ' }).imie, 'Ola');
  check('18c. puste imie pomijane', 'imie' in it({ imie: '   ' }), false);
  check('18d. imie nie-tekst pomijane', 'imie' in it({ imie: {} }), false);
  check('19a. id ogromne przycięte', it({ id: 'i'.repeat(9999) }).id.length, 60);
  check('19b. powtórzone id: ostatnie wygrywa', parseWyspa({ rzeczy: [rz('a', { x: 1 }), rz('a', { x: 2 })] }).rzeczy.map((r) => r.x), [2]);
  check('19c. rzeczy max 40 (najstarsze odpadają)', parseWyspa({ rzeczy: Array.from({ length: 50 }, (_, i) => rz(`r${i}`)) }).rzeczy[0].id, 'r10');
  check('20a. nazwa ogromna', parseWyspa({ nazwa: 'n'.repeat(9999) }).nazwa.length, 40);
  check('20b. nazwa pusta pomijana', 'nazwa' in parseWyspa({ nazwa: '  ' }), false);
  check('20c. nazwa liczbą pomijana', 'nazwa' in parseWyspa({ nazwa: 5 }), false);
  check('20d. updatedAt zły → 0', parseWyspa({ updatedAt: 'x' }).updatedAt, 0);
  check('20e. updatedAt ujemny → 0', parseWyspa({ updatedAt: -5 }).updatedAt, 0);
  check('20f. updatedAt dobry', parseWyspa({ updatedAt: 123 }).updatedAt, 123);
  check('20g. v zawsze 1', parseWyspa({ v: 7 }).v, 1);
  const full = { v: 1, magazyn: ['a'], rzeczy: [rz('r', { ile: 2, tabliczka: 'ta', imie: 'Ala' })], updatedAt: 5, nazwa: 'W' };
  check('21. pełny rekord przechodzi bez zmian', parseWyspa(full), full);
});

group('C. magazyn', () => {
  resetWindow();
  const a = readWyspa(window.localStorage);
  const b = readWyspa(window.localStorage);
  check('22a. pusty magazyn → pusty rekord', a, E());
  cond('22b. dwa odczyty to dwa obiekty', a !== b && a.magazyn !== b.magazyn && a.rzeczy !== b.rzeczy);
  a.magazyn.push('zmiana');
  check('22c. zmiana wyniku nie rusza EMPTY_WYSPA', EMPTY_WYSPA.magazyn.length, 0);
  cond('22d. EMPTY_WYSPA zamrożona', Object.isFrozen(EMPTY_WYSPA) && Object.isFrozen(EMPTY_WYSPA.magazyn) && Object.isFrozen(EMPTY_WYSPA.rzeczy));
  check('22e. klucz', WYSPA_KEY, 'dociekai:pol-wyspa');
  check('22f. zdarzenie', WYSPA_CHANGED_EVENT, 'dociekai:pol-wyspa-changed');

  const rec = dodajRzecz(dodajDoMagazynu(E(), ['a'], 5), rz('r'), 6);
  writeWyspa(window.localStorage, rec);
  check('23a. zapis + odczyt', readWyspa(window.localStorage), rec);
  cond('23b. zdarzenie po zapisie', events.includes(WYSPA_CHANGED_EVENT));

  writeWyspa(window.localStorage, E());
  check('24a. pusty zapis usuwa klucz', window.localStorage.getItem(WYSPA_KEY), null);
  writeWyspa(window.localStorage, ustawNazwe(E(), 'Nazwa', 1));
  cond('24b. sama nazwa zostaje', window.localStorage.getItem(WYSPA_KEY) !== null);
  writeWyspa(window.localStorage, dodajDoMagazynu(E(), ['x'], 1));
  cond('24c. sam magazyn zostaje', window.localStorage.getItem(WYSPA_KEY) !== null);
  writeWyspa(window.localStorage, dodajRzecz(E(), rz('r'), 1));
  cond('24d. sama rzecz zostaje', window.localStorage.getItem(WYSPA_KEY) !== null);

  window.localStorage.setItem(WYSPA_KEY, '{zepsute');
  check('25a. zepsuty JSON → pusta', readWyspa(window.localStorage), E());
  window.localStorage.setItem(WYSPA_KEY, '"tekst"');
  check('25b. JSON-owy tekst → pusta', readWyspa(window.localStorage), E());
  window.localStorage.setItem(WYSPA_KEY, JSON.stringify({ magazyn: ['a'], rzeczy: [{ id: 1 }] }));
  check('25c. częściowo zepsuty rekord', readWyspa(window.localStorage).magazyn, ['a']);

  resetWindow();
  window.localStorage.setItem = () => { throw new Error('pełny'); };
  let threw = false;
  try { writeWyspa(window.localStorage, rec); } catch { threw = true; }
  cond('26a. błąd zapisu nie wychodzi', !threw);
  cond('26b. zdarzenie mimo błędu', events.includes(WYSPA_CHANGED_EVENT));
});

group('D. adopt / merge / clear', () => {
  resetWindow();
  adoptSessionWyspa();
  check('27a. pusta sesja: nic nie zapisano', window.localStorage.getItem(WYSPA_KEY), null);
  cond('27b. pusta sesja: bez zdarzenia', events.length === 0);

  const guest = ustawNazwe(dodajRzecz(dodajDoMagazynu(E(), ['a', 'b'], 100), rz('r1'), 110), 'Gość', 120);
  writeWyspa(window.sessionStorage, guest);
  adoptSessionWyspa();
  check('28a. brak konta: przeniesione', readWyspa(window.localStorage), guest);
  check('28b. sesja wyczyszczona', window.sessionStorage.getItem(WYSPA_KEY), null);

  resetWindow();
  const acc = ustawNazwe(dodajRzecz(dodajDoMagazynu(E(), ['b', 'c'], 50), rz('r1', { x: 77 }), 60), 'Konto', 70);
  writeWyspa(window.localStorage, acc);
  writeWyspa(window.sessionStorage, dodajRzecz(guest, rz('r2'), 130));
  adoptSessionWyspa();
  const m = readWyspa(window.localStorage);
  check('29a. magazyn: baza (gość) + reszta konta', m.magazyn, ['a', 'b', 'c']);
  check('29b. rzecz o tym samym id: wygrywa nowszy (gość)', m.rzeczy.find((r) => r.id === 'r1').x, 10);
  check('29c. rzeczy sumowane', m.rzeczy.map((r) => r.id).sort(), ['r1', 'r2']);
  check('29d. nazwa z nowszego', m.nazwa, 'Gość');
  check('29e. updatedAt = max', m.updatedAt, 130);
  check('29f. sesja wyczyszczona', window.sessionStorage.getItem(WYSPA_KEY), null);

  resetWindow();
  writeWyspa(window.localStorage, dodajRzecz(acc, rz('r1', { x: 77 }), 500));
  writeWyspa(window.sessionStorage, guest);
  adoptSessionWyspa();
  const m2 = readWyspa(window.localStorage);
  check('30a. nowsze konto: rzecz konta wygrywa', m2.rzeczy[0].x, 77);
  check('30b. nowsze konto: nazwa konta', m2.nazwa, 'Konto');
  check('30c. magazyn: konto + gość', m2.magazyn, ['b', 'c', 'a']);
  check('30d. updatedAt', m2.updatedAt, 500);

  resetWindow();
  writeWyspa(window.localStorage, dodajDoMagazynu(E(), ['k'], 10));
  writeWyspa(window.sessionStorage, ustawNazwe(E(), 'Tylko nazwa', 20));
  adoptSessionWyspa();
  check('31a. gość tylko z nazwą: nazwa przeniesiona', readWyspa(window.localStorage).nazwa, 'Tylko nazwa');
  check('31b. magazyn konta zachowany', readWyspa(window.localStorage).magazyn, ['k']);

  resetWindow();
  writeWyspa(window.localStorage, ustawNazwe(dodajDoMagazynu(E(), ['k'], 90), 'Konto', 90));
  writeWyspa(window.sessionStorage, dodajDoMagazynu(E(), ['g'], 20));
  adoptSessionWyspa();
  check('32. starszy gość bez nazwy: nazwa konta', readWyspa(window.localStorage).nazwa, 'Konto');

  const big = (p, n, t) => ({ v: 1, magazyn: Array.from({ length: n }, (_, i) => `${p}${i}`), rzeczy: Array.from({ length: n }, (_, i) => rz(`${p}${i}`)), updatedAt: t });
  const mm = mergeWyspa(big('a', 50, 2), big('b', 50, 1));
  check('33a. merge: magazyn ≤ 60', mm.magazyn.length, 60);
  check('33b. merge: rzeczy ≤ 40', mm.rzeczy.length, 40);
  const s1 = big('a', 3, 5);
  const s2 = big('b', 3, 6);
  mergeWyspa(s1, s2);
  check('33c. merge nie rusza wejść', [s1.magazyn.length, s2.rzeczy.length], [3, 3]);
  check('33d. remis updatedAt: baza = pierwszy', mergeWyspa({ ...E(), nazwa: 'A' }, { ...E(), nazwa: 'B' }).nazwa, 'A');

  resetWindow();
  writeWyspa(window.localStorage, guest);
  writeWyspa(window.sessionStorage, guest);
  events = [];
  clearWyspa();
  check('34a. clear: localStorage', window.localStorage.getItem(WYSPA_KEY), null);
  check('34b. clear: sessionStorage', window.sessionStorage.getItem(WYSPA_KEY), null);
  cond('34c. clear: zdarzenie', events.includes(WYSPA_CHANGED_EVENT));
});

group('E. tor i tort (L16)', () => {
  const tort = { ksztalt: 'okragly', pietra: ['czekoladowy', 'malinowy'], kolor: 'rozowy' };
  const e = E();
  const fe = JSON.stringify(e);
  const t1 = ustawTor(e, 7);
  check('35a. tor ustawiony', [t1.tor, t1.updatedAt], [true, 7]);
  check('35b. ustawTor nie rusza wejścia', JSON.stringify(e), fe);
  cond('35c. ustawTor nowy obiekt', t1 !== e);
  const ft = JSON.stringify(tort);
  const t2 = ustawTort(e, tort, 8);
  check('36a. tort zapisany', [t2.tort, t2.updatedAt], [tort, 8]);
  check('36b. ustawTort nie rusza wejść', [JSON.stringify(e), JSON.stringify(tort)], [fe, ft]);
  cond('36c. kopia pięter', t2.tort.pietra !== tort.pietra && t2.tort !== tort);
  check('36d. piętra przycięte do 3', ustawTort(e, { ...tort, pietra: ['waniliowy', 'waniliowy', 'malinowy', 'cytrynowy', 'czekoladowy'] }, 1).tort.pietra.length, 3);
  const withTort = ustawTort(e, tort, 8);
  const after = ustawNazwe(withTort, 'X', 9);
  cond('36e. fresh kopiuje tort głęboko', after.tort !== withTort.tort && after.tort.pietra !== withTort.tort.pietra);
  check('36f. tor przeżywa kolejne funkcje', ustawNazwe(t1, 'X', 9).tor, true);

  const pt = (extra) => parseWyspa({ tort: { ...tort, ...extra } });
  check('37a. poprawny tort przyjęty', parseWyspa({ tort }).tort, tort);
  check('37b. zły kształt', 'tort' in pt({ ksztalt: 'trojkatny' }), false);
  check('37c. zły kolor', 'tort' in pt({ kolor: 'czarny' }), false);
  check('37d. puste piętra', 'tort' in pt({ pietra: [] }), false);
  check('37e. 4 piętra', 'tort' in pt({ pietra: ['waniliowy', 'waniliowy', 'waniliowy', 'waniliowy'] }), false);
  check('37f. nieznany smak', 'tort' in pt({ pietra: ['waniliowy', 'solony'] }), false);
  check('37g. piętra nie-tablica', 'tort' in pt({ pietra: 'waniliowy' }), false);
  check('37h. tort null', 'tort' in parseWyspa({ tort: null }), false);
  check('38a. tor true', parseWyspa({ tor: true }).tor, true);
  check('38b. tor "tak" pomijane', 'tor' in parseWyspa({ tor: 'tak' }), false);
  check('38c. tor 1 pomijane', 'tor' in parseWyspa({ tor: 1 }), false);
  check('38d. tor false pomijane', 'tor' in parseWyspa({ tor: false }), false);

  resetWindow();
  writeWyspa(window.localStorage, ustawTor(E(), 1));
  cond('39a. sam tor zostaje w magazynie', window.localStorage.getItem(WYSPA_KEY) !== null);
  writeWyspa(window.localStorage, E());
  writeWyspa(window.localStorage, ustawTort(E(), tort, 1));
  cond('39b. sam tort zostaje w magazynie', window.localStorage.getItem(WYSPA_KEY) !== null);
  check('39c. round-trip tortu', readWyspa(window.localStorage).tort, tort);
  const full = ustawTort(ustawTor(dodajDoMagazynu(E(), ['a'], 3), 4), tort, 5);
  writeWyspa(window.localStorage, full);
  check('39d. round-trip pełnego rekordu', readWyspa(window.localStorage), full);

  const old = { ...E(), updatedAt: 1, tor: true, tort };
  const nw = { ...E(), updatedAt: 2, tort: { ...tort, kolor: 'zielony' } };
  check('40a. tor ze starszej strony', mergeWyspa(nw, old).tor, true);
  check('40b. tor z nowszej strony', mergeWyspa({ ...E(), updatedAt: 2, tor: true }, { ...E(), updatedAt: 1 }).tor, true);
  check('40c. brak toru po obu stronach', 'tor' in mergeWyspa(E(), E()), false);
  check('40d. tort z nowszej', mergeWyspa(nw, old).tort.kolor, 'zielony');
  check('40e. tort ze starszej, gdy nowsza nie ma', mergeWyspa({ ...E(), updatedAt: 2 }, old).tort, tort);
  const mt = mergeWyspa(nw, old);
  cond('40f. merge kopiuje tort', mt.tort !== nw.tort && mt.tort.pietra !== nw.tort.pietra);
  check('40g. brak tortu po obu stronach', 'tort' in mergeWyspa(E(), E()), false);
});

group('F. kot w domku (L17)', () => {
  const e = E();
  const fe = JSON.stringify(e);
  const k1 = ustawKota(e, 'na-szafie', 11);
  check('41a. kot ustawiony', [k1.kot, k1.updatedAt], ['na-szafie', 11]);
  check('41b. ustawKota nie rusza wejścia', JSON.stringify(e), fe);
  cond('41c. ustawKota nowy obiekt', k1 !== e);
  check('41d. przycięcie do 30 znaków', ustawKota(e, 'a'.repeat(50), 1).kot, 'a'.repeat(30));
  check('41e. trim', ustawKota(e, '  na-szafie  ', 1).kot, 'na-szafie');
  check('41f. pusty usuwa pole', 'kot' in ustawKota(k1, '   ', 12), false);
  check('41g. pusty ustawia updatedAt', ustawKota(k1, '', 12).updatedAt, 12);
  check('41h. kot przeżywa kolejne funkcje', ustawNazwe(k1, 'X', 13).kot, 'na-szafie');

  check('42a. poprawny kot', parseWyspa({ kot: 'na-szafie' }).kot, 'na-szafie');
  check('42b. niedozwolone znaki', 'kot' in parseWyspa({ kot: 'Na Szafie!' }), false);
  check('42c. nie-string', 'kot' in parseWyspa({ kot: 5 }), false);
  check('42d. za długi przycięty', parseWyspa({ kot: 'a'.repeat(50) }).kot, 'a'.repeat(30));
  check('42e. pusty pomijany', 'kot' in parseWyspa({ kot: '  ' }), false);

  resetWindow();
  writeWyspa(window.localStorage, ustawKota(E(), 'na-szafie', 1));
  cond('43a. sam kot zostaje w magazynie', window.localStorage.getItem(WYSPA_KEY) !== null);
  check('43b. round-trip kota', readWyspa(window.localStorage).kot, 'na-szafie');

  const old = { ...E(), updatedAt: 1, kot: 'na-szafie' };
  check('44a. kot z nowszej', mergeWyspa({ ...E(), updatedAt: 2, kot: 'pod-lozkiem' }, old).kot, 'pod-lozkiem');
  check('44b. kot ze starszej, gdy nowsza nie ma', mergeWyspa({ ...E(), updatedAt: 2 }, old).kot, 'na-szafie');
  check('44c. brak kota po obu stronach', 'kot' in mergeWyspa(E(), E()), false);
});

if (failures === 0) console.log(`\n✓ ${checks}/${checks} OK\n`);
else console.log(`\n✗ ${failures} z ${checks} nie przeszło: ${failed.join(', ')}`);
process.exit(failures === 0 ? 0 : 1);

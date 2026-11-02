/**
 * Selftest czystych funkcji L23 (`ateny-i-demokracja`: tlum + losowanie + plan).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l22-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l23-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { copyFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l23-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
const out2 = join(dir, 'bundle2.mjs');

await writeFile(
  entry,
  `export * as T from '${root}/src/app/historia/klasa-4/components/lessons/ateny-i-demokracja/tlum';\n` +
    `export * as L from '${root}/src/app/historia/klasa-4/components/lessons/ateny-i-demokracja/losowanie';\n` +
    `export * as N from '${root}/src/app/historia/klasa-4/components/lessons/ateny-i-demokracja/plan';\n`,
);

/** Alias `@/` → `<root>/src/` (tsconfig paths), jak w Next. */
const aliasPlugin = {
  name: 'at-alias',
  setup(b) {
    b.onResolve({ filter: /^@\// }, (args) => {
      const base = join(root, 'src', args.path.slice(2));
      for (const cand of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')]) {
        if (existsSync(cand)) return { path: cand };
      }
      return { path: base };
    });
  },
};

await build({
  entryPoints: [entry],
  outfile: out,
  bundle: true,
  format: 'esm',
  platform: 'node',
  plugins: [aliasPlugin],
});

// Drugi import tej samej paczki — determinizm PEOPLE (ten sam tłum).
await copyFile(out, out2);
const lib = await import(pathToFileURL(out).href);
const lib2 = await import(pathToFileURL(out2).href);
await rm(dir, { recursive: true, force: true });

const { T, L, N } = lib;
const { T: T2 } = lib2;

let total = 0;
const failures = [];

function t(label, fn) {
  total += 1;
  try {
    fn();
  } catch (e) {
    failures.push(label);
    const detail = e instanceof Error ? e.message : String(e);
    console.error(`  ✗ ${label}\n      ${detail.split('\n').join('\n      ')}`);
  }
}

function group(name, fn) {
  console.log(`\n${name}`);
  fn();
}

const ALL4 = ['mezczyzna', 'dorosly', 'wolny', 'ateńczyk'];
const FULL_MODERN = new Set(['kobiety', 'wiek18', 'bezNiewoli', 'pochodzenie']);
const ids = (people) => people.map((p) => p.id);

/* --- A) tłum: stu mieszkańców i sito ------------------------------------------- */

group('A) tłum: stu mieszkańców i sito', () => {
  t('PEOPLE.length === 100', () => {
    assert.equal(T.PEOPLE.length, 100);
  });
  t('id to 0..99 bez powtórek', () => {
    const got = T.PEOPLE.map((p) => p.id).sort((a, b) => a - b);
    assert.deepEqual(got, Array.from({ length: 100 }, (_, i) => i));
  });
  t('PEOPLE identyczne przy dwóch importach (deterministyczne)', () => {
    assert.deepEqual(T2.PEOPLE, T.PEOPLE);
  });
  t('tłum jest przemieszany (nie posortowany grupami)', () => {
    const groups = T.PEOPLE.map((p) => p.group).join(',');
    const sorted = [...T.PEOPLE].sort((a, b) => (a.group < b.group ? -1 : 1)).map((p) => p.group).join(',');
    assert.notEqual(groups, sorted);
  });
  t('remaining([]) === 100', () => {
    assert.equal(T.remaining([]).length, 100);
  });
  t('wszystkie cztery warunki → 14 osób', () => {
    assert.equal(T.remaining(ALL4).length, 14);
  });
  t('te 14 osób to dorośli mężczyźni-obywatele', () => {
    for (const p of T.remaining(ALL4)) {
      assert.equal(p.group, 'obywatel');
      assert.equal(p.male, true);
      assert.equal(p.age, 'dorosly');
    }
  });
  for (const perm of [
    ['ateńczyk', 'wolny', 'dorosly', 'mezczyzna'],
    ['dorosly', 'ateńczyk', 'mezczyzna', 'wolny'],
    ['wolny', 'mezczyzna', 'ateńczyk', 'dorosly'],
  ]) {
    t(`kolejność warunków nie zmienia wyniku (${perm.join(',')})`, () => {
      assert.deepEqual(ids(T.remaining(perm)), ids(T.remaining(ALL4)));
    });
  }
  t("pojedynczy warunek 'mezczyzna' zostawia samych mężczyzn", () => {
    const r = T.remaining(['mezczyzna']);
    assert.ok(r.length > 0 && r.length < 100, `len=${r.length}`);
    assert.ok(r.every((p) => p.male), 'ktoś nie jest mężczyzną');
  });
  t("siftOut(['mezczyzna'], 'wolny') to sami niewolnicy-mężczyźni", () => {
    const r = T.siftOut(['mezczyzna'], 'wolny');
    assert.ok(r.length > 0, 'pusto');
    for (const p of r) {
      assert.equal(p.group, 'niewolnik');
      assert.equal(p.male, true);
    }
  });
  t('siftOut liczy się spośród stojących (mezczyzna ∩ wolny + reszta)', () => {
    const stayed = T.remaining(['mezczyzna', 'wolny']).length;
    const out = T.siftOut(['mezczyzna'], 'wolny').length;
    const before = T.remaining(['mezczyzna']).length;
    assert.equal(stayed + out, before);
  });
  t('tally(wszystkie 4 warunki) → za 9, przeciw 5', () => {
    assert.deepEqual(T.tally(T.remaining(ALL4)), { za: 9, przeciw: 5 });
  });
  t('tally(PEOPLE) → za < przeciw', () => {
    const r = T.tally(T.PEOPLE);
    assert.ok(r.za < r.przeciw, `za=${r.za} przeciw=${r.przeciw}`);
  });
  t('tally(PEOPLE) sumuje się do 100', () => {
    const r = T.tally(T.PEOPLE);
    assert.equal(r.za + r.przeciw, 100);
  });
});

/* --- B) tłum: głosowanie dziś i mowa -------------------------------------------- */

group('B) tłum: głosowanie dziś i mowa', () => {
  t('votesUnder bez reguł (pusty Set) → 14 osób', () => {
    const n = T.PEOPLE.filter((p) => T.votesUnder(p, new Set())).length;
    assert.equal(n, 14);
  });
  t('bez reguł głosują ci sami co po czterech warunkach Aten', () => {
    const a = ids(T.PEOPLE.filter((p) => T.votesUnder(p, new Set())));
    assert.deepEqual(a, ids(T.remaining(ALL4)));
  });
  t('ze wszystkimi czterema MODERN → 71 osób', () => {
    const n = T.PEOPLE.filter((p) => T.votesUnder(p, FULL_MODERN)).length;
    assert.equal(n, 71);
  });
  t('dziecko nigdy nie głosuje (pusto i pełno)', () => {
    for (const p of T.PEOPLE.filter((p) => p.age === 'dziecko')) {
      assert.equal(T.votesUnder(p, new Set()), false);
      assert.equal(T.votesUnder(p, FULL_MODERN), false);
    }
  });
  t("'mlody' bez 'wiek18' nie głosuje (pusto i same kobiety)", () => {
    for (const p of T.PEOPLE.filter((p) => p.age === 'mlody')) {
      assert.equal(T.votesUnder(p, new Set()), false);
      assert.equal(T.votesUnder(p, new Set(['kobiety'])), false);
    }
  });
  t("'mlody' obywatel-mężczyzna głosuje z samym 'wiek18'", () => {
    const p = T.PEOPLE.find((x) => x.age === 'mlody' && x.male && x.group === 'obywatel');
    assert.ok(p, 'brak młodego obywatela');
    assert.equal(T.votesUnder(p, new Set(['wiek18'])), true);
  });
  t("judgeSpeech('obywatele','s1') ok", () => {
    assert.equal(T.judgeSpeech('obywatele', 's1').ok, true);
  });
  t("judgeSpeech('obywatele','s2') ok", () => {
    assert.equal(T.judgeSpeech('obywatele', 's2').ok, true);
  });
  t("judgeSpeech('kobiety','s4') ok", () => {
    assert.equal(T.judgeSpeech('kobiety', 's4').ok, true);
  });
  t("judgeSpeech('przybysze','s3') ok", () => {
    assert.equal(T.judgeSpeech('przybysze', 's3').ok, true);
  });
  t("judgeSpeech('niewolnicy','milczy') ok (Perykles o nich milczy)", () => {
    assert.equal(T.judgeSpeech('niewolnicy', 'milczy').ok, true);
  });
  t("judgeSpeech('kobiety','milczy') nie ok, why z tekstem zdania s4", () => {
    const r = T.judgeSpeech('kobiety', 'milczy');
    const s4 = T.SPEECH.find((x) => x.id === 's4');
    assert.equal(r.ok, false);
    assert.ok(r.why && r.why.includes(s4.text), `why: ${r.why}`);
  });
  t("judgeSpeech('przybysze','s1') nie ok", () => {
    assert.equal(T.judgeSpeech('przybysze', 's1').ok, false);
  });
});

/* --- C) losowanie: maszyna (kleroterion) ------------------------------------------ */

group('C) losowanie: maszyna (kleroterion)', () => {
  t('200 losowań: zawsze długość KROWS i dokładnie WHITES białych', () => {
    for (let i = 0; i < 200; i++) {
      const tube = L.shakeTube();
      assert.equal(tube.length, L.KROWS);
      assert.equal(tube.filter(Boolean).length, L.WHITES);
    }
  });
  t('shakeTube z deterministycznym rnd (() => 0) też ma WHITES białych', () => {
    const tube = L.shakeTube(() => 0);
    assert.equal(tube.length, L.KROWS);
    assert.equal(tube.filter(Boolean).length, L.WHITES);
  });
  t('chosen(tube,row) === tube[row] dla każdego rzędu', () => {
    const tube = L.shakeTube();
    for (let r = 0; r < L.KROWS; r++) assert.equal(L.chosen(tube, r), tube[r]);
  });
  t('expectedOf(10) === 10*WHITES/KROWS', () => {
    assert.equal(L.expectedOf(10), (10 * L.WHITES) / L.KROWS);
  });
  t('expectedOf(8) === WHITES, expectedOf(0) === 0', () => {
    assert.equal(L.expectedOf(8), L.WHITES);
    assert.equal(L.expectedOf(0), 0);
  });
  t('FREE_SLOTS w zakresie kolumn i rzędów', () => {
    assert.ok(L.FREE_SLOTS.length > 0, 'pusto');
    for (const [c, r] of L.FREE_SLOTS) {
      assert.ok(c >= 0 && c < L.KCOLS, `kolumna ${c}`);
      assert.ok(r >= 0 && r < L.KROWS, `rząd ${r}`);
    }
  });
  t('FREE_SLOTS bez duplikatów', () => {
    const keys = L.FREE_SLOTS.map(([c, r]) => L.slotKey(c, r));
    assert.equal(new Set(keys).size, keys.length);
  });
  t('NAMES wystarczy na całą maszynę (KCOLS*KROWS - FREE_SLOTS)', () => {
    assert.ok(L.NAMES.length >= L.KCOLS * L.KROWS - L.FREE_SLOTS.length, `names=${L.NAMES.length}`);
  });
  t('średnia z 4000 dni (rząd 0) bliska WHITES/KROWS (±0.05)', () => {
    let hit = 0;
    const NDAYS = 4000;
    for (let i = 0; i < NDAYS; i++) if (L.chosen(L.shakeTube(), 0)) hit += 1;
    const avg = hit / NDAYS;
    console.log(`      średnia rzędu 0 z ${NDAYS} dni: ${avg.toFixed(3)} (oczekiwane ${(L.WHITES / L.KROWS).toFixed(3)})`);
    assert.ok(Math.abs(avg - L.WHITES / L.KROWS) < 0.05, `avg=${avg}`);
  });
});

/* --- D) plan: dzień Ateńczyka ----------------------------------------------------- */

group('D) plan: dzień Ateńczyka', () => {
  for (const p of N.PLACES) {
    t(`placeAt w środku '${p.id}' zwraca '${p.id}'`, () => {
      assert.equal(N.placeAt(p.x, p.y), p.id);
    });
  }
  t('placeAt(5,295) === null (poza planem)', () => {
    assert.equal(N.placeAt(5, 295), null);
  });
  t("visit('kleo','pnyks').access === 'zakaz'", () => {
    assert.equal(N.visit('kleo', 'pnyks').access, 'zakaz');
  });
  t("visit('kleo','sad').access === 'zakaz'", () => {
    assert.equal(N.visit('kleo', 'sad').access, 'zakaz');
  });
  t("visit('kleo','teatr').access === 'sporne'", () => {
    assert.equal(N.visit('kleo', 'teatr').access, 'sporne');
  });
  t("visit('kleo','akropol').access === 'ok'", () => {
    assert.equal(N.visit('kleo', 'akropol').access, 'ok');
  });
  t("dla 'kallias' wszystko 'ok'", () => {
    for (const p of N.PLACES) assert.equal(N.visit('kallias', p.id).access, 'ok');
  });
  t("roleDone('kallias', [agora,pnyks,akropol], []) true", () => {
    assert.equal(N.roleDone('kallias', ['agora', 'pnyks', 'akropol'], []), true);
  });
  t("roleDone('kallias') bez 'pnyks' false", () => {
    assert.equal(N.roleDone('kallias', ['agora', 'akropol'], []), false);
  });
  t("roleDone('kleo', [dom,fontanna,akropol], [pnyks]) true", () => {
    assert.equal(N.roleDone('kleo', ['dom', 'fontanna', 'akropol'], ['pnyks']), true);
  });
  t("roleDone('kleo', ...) z refused [] false", () => {
    assert.equal(N.roleDone('kleo', ['dom', 'fontanna', 'akropol'], []), false);
  });
  t("roleDone('kleo', [dom,teatr,akropol], [pnyks]) false (teatr sporny)", () => {
    assert.equal(N.roleDone('kleo', ['dom', 'teatr', 'akropol'], ['pnyks']), false);
  });
  t('miejsca PLACES nie nachodzą na siebie', () => {
    for (let i = 0; i < N.PLACES.length; i++) {
      for (let j = i + 1; j < N.PLACES.length; j++) {
        const a = N.PLACES[i];
        const b = N.PLACES[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        assert.ok(d > a.r + b.r, `${a.id} vs ${b.id}: d=${d.toFixed(1)} <= ${a.r + b.r}`);
      }
    }
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

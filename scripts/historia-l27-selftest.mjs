/**
 * Selftest czystych funkcji L27 (`rzym-czasow-cezara`: dzien + seneka + cezar + paszport).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l26-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l27-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l27-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as Dz from '${root}/src/app/historia/klasa-4/components/lessons/rzym-czasow-cezara/dzien';\n` +
    `export * as Se from '${root}/src/app/historia/klasa-4/components/lessons/rzym-czasow-cezara/seneka';\n` +
    `export * as Cz from '${root}/src/app/historia/klasa-4/components/lessons/rzym-czasow-cezara/cezar';\n` +
    `export * as Pp from '${root}/src/app/historia/klasa-4/components/source-desk/passport';\n`,
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

const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const { Dz, Se, Cz, Pp } = lib;

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

const person = (id) => Dz.PEOPLE.find((p) => p.id === id);

/* --- A) dzien: godziny, triumf, liczby rzymskie -------------------------------- */

group('A) dzien: wolne godziny i triumf', () => {
  t('freeHours gajusz == 7', () => {
    assert.equal(Dz.freeHours(person('gajusz')), 7);
  });
  t('freeHours tulia == 6', () => {
    assert.equal(Dz.freeHours(person('tulia')), 6);
  });
  t('freeHours dawos == 1', () => {
    assert.equal(Dz.freeHours(person('dawos')), 1);
  });
  t('canSeeTriumph gajusz true', () => {
    assert.equal(Dz.canSeeTriumph(person('gajusz')), true);
  });
  t('canSeeTriumph tulia true', () => {
    assert.equal(Dz.canSeeTriumph(person('tulia')), true);
  });
  t('canSeeTriumph dawos false', () => {
    assert.equal(Dz.canSeeTriumph(person('dawos')), false);
  });
  t("roman(1) == 'I'", () => {
    assert.equal(Dz.roman(1), 'I');
  });
  t("roman(12) == 'XII'", () => {
    assert.equal(Dz.roman(12), 'XII');
  });
  t('ACTIVITIES.triumf.fixedStart == 6', () => {
    assert.equal(Dz.ACTIVITIES.triumf.fixedStart, 6);
  });
  t('gajusz ma niepusty triumphView', () => {
    assert.ok(typeof person('gajusz').triumphView === 'string' && person('gajusz').triumphView.length > 0);
  });
  t('tulia ma niepusty triumphView', () => {
    assert.ok(typeof person('tulia').triumphView === 'string' && person('tulia').triumphView.length > 0);
  });
  t('dawos triumphView to pusty string', () => {
    assert.equal(person('dawos').triumphView, '');
  });
});

/* --- B) dzien: place ----------------------------------------------------------- */

group('B) dzien: place', () => {
  t("place(gajusz, {}, 'triumf', 2) ok", () => {
    const r = Dz.place(person('gajusz'), {}, 'triumf', 2);
    assert.equal(r.ok, true);
  });
  t('place(gajusz, {}, triumf, 2) plan.triumf == 6 (stała godzina)', () => {
    const r = Dz.place(person('gajusz'), {}, 'triumf', 2);
    assert.equal(r.ok, true);
    assert.equal(r.plan.triumf, 6);
  });
  t("place(dawos, {}, 'triumf', 7) ok false", () => {
    assert.equal(Dz.place(person('dawos'), {}, 'triumf', 7).ok, false);
  });
  t("place(dawos, triumf) message zawiera 'Nie zobaczy'", () => {
    const r = Dz.place(person('dawos'), {}, 'triumf', 7);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('Nie zobaczy'), r.message);
  });
  t("place(dawos, {}, 'odejsc', 7) ok false (locked)", () => {
    assert.equal(Dz.place(person('dawos'), {}, 'odejsc', 7).ok, false);
  });
  t("place(dawos, odejsc) message zawiera 'własnością'", () => {
    const r = Dz.place(person('dawos'), {}, 'odejsc', 7);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('własnością'), r.message);
  });
  t("place(dawos, {}, 'termy', 7) ok false (nie mieści się)", () => {
    assert.equal(Dz.place(person('dawos'), {}, 'termy', 7).ok, false);
  });
  t("place(dawos, {}, 'odpoczynek', 7) ok", () => {
    const r = Dz.place(person('dawos'), {}, 'odpoczynek', 7);
    assert.equal(r.ok, true);
    assert.equal(r.plan.odpoczynek, 7);
  });
  t("place(tulia, {}, 'termy', 4) ok false (piekarnia)", () => {
    assert.equal(Dz.place(person('tulia'), {}, 'termy', 4).ok, false);
  });
  t("place(tulia, termy, 4) message zawiera 'piekarni'", () => {
    const r = Dz.place(person('tulia'), {}, 'termy', 4);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('piekarni'), r.message);
  });
  t("place(tulia, {triumf:6}, 'termy', 7) ok false (koliduje z triumfem)", () => {
    assert.equal(Dz.place(person('tulia'), { triumf: 6 }, 'termy', 7).ok, false);
  });
  t("place(tulia, termy po triumfie) message zawiera 'triumf'", () => {
    const r = Dz.place(person('tulia'), { triumf: 6 }, 'termy', 7);
    assert.equal(r.ok, false);
    assert.ok(r.message.toLowerCase().includes('triumf'), r.message);
  });
  t("place(tulia, {triumf:6}, 'uczta-ludu', 9) ok", () => {
    const r = Dz.place(person('tulia'), { triumf: 6 }, 'uczta-ludu', 9);
    assert.equal(r.ok, true);
    assert.equal(r.plan['uczta-ludu'], 9);
  });
  t("place(gajusz, {}, 'termy', 11) ok false (uczta / koniec dnia)", () => {
    assert.equal(Dz.place(person('gajusz'), {}, 'termy', 11).ok, false);
  });
  t("place(tulia, {}, 'zabawa', 12) ok false (woda o XII)", () => {
    assert.equal(Dz.place(person('tulia'), {}, 'zabawa', 12).ok, false);
  });
  t("place(tulia, zabawa, 12) message zawiera 'XII'", () => {
    const r = Dz.place(person('tulia'), {}, 'zabawa', 12);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('XII'), r.message);
  });
});

/* --- C) dzien: busyAt ---------------------------------------------------------- */

group('C) dzien: busyAt', () => {
  t('gajusz godz. 1 zajęta (lekcje)', () => {
    assert.ok(typeof Dz.busyAt(person('gajusz'), 1) === 'string');
  });
  t('gajusz godz. 3 zajęta', () => {
    assert.ok(typeof Dz.busyAt(person('gajusz'), 3) === 'string');
  });
  t('gajusz godz. 4 wolna (null)', () => {
    assert.equal(Dz.busyAt(person('gajusz'), 4), null);
  });
  t('gajusz godz. 6 wolna (null)', () => {
    assert.equal(Dz.busyAt(person('gajusz'), 6), null);
  });
  t('gajusz godz. 11 zajęta (uczta)', () => {
    assert.ok(typeof Dz.busyAt(person('gajusz'), 11) === 'string');
  });
  t('tulia godz. 1 zajęta (piekarnia)', () => {
    assert.ok(typeof Dz.busyAt(person('tulia'), 1) === 'string');
  });
  t('tulia godz. 5 zajęta', () => {
    assert.ok(typeof Dz.busyAt(person('tulia'), 5) === 'string');
  });
  t('tulia godz. 6 wolna (null)', () => {
    assert.equal(Dz.busyAt(person('tulia'), 6), null);
  });
  t('tulia godz. 11 wolna (null)', () => {
    assert.equal(Dz.busyAt(person('tulia'), 11), null);
  });
  t('tulia godz. 12 zajęta (woda)', () => {
    assert.ok(typeof Dz.busyAt(person('tulia'), 12) === 'string');
  });
  t('dawos godz. 1 zajęta', () => {
    assert.ok(typeof Dz.busyAt(person('dawos'), 1) === 'string');
  });
  t('dawos godz. 6 zajęta', () => {
    assert.ok(typeof Dz.busyAt(person('dawos'), 6) === 'string');
  });
  t('dawos godz. 7 wolna (null)', () => {
    assert.equal(Dz.busyAt(person('dawos'), 7), null);
  });
  t('dawos godz. 8 zajęta (uczta)', () => {
    assert.ok(typeof Dz.busyAt(person('dawos'), 8) === 'string');
  });
  t('dawos godz. 12 zajęta', () => {
    assert.ok(typeof Dz.busyAt(person('dawos'), 12) === 'string');
  });
});

/* --- D) seneka ----------------------------------------------------------------- */

const ALL_PENS = Object.fromEntries(Se.SENEKA.filter((s) => s.truth).map((s) => [s.id, s.truth]));
const TRUTH_COUNT = Se.SENEKA.filter((s) => s.truth != null).length;

group('D) seneka: zakreślacz', () => {
  t('zaznaczenia zgodne z truth -> ok', () => {
    assert.equal(Se.judgePens({ ...ALL_PENS }).ok, true);
  });
  t('zaznaczenia zgodne z truth -> missed i wrong puste', () => {
    const r = Se.judgePens({ ...ALL_PENS });
    assert.deepEqual(r.missed, []);
    assert.deepEqual(r.wrong, []);
  });
  t('puste zaznaczenia -> ok false', () => {
    assert.equal(Se.judgePens({}).ok, false);
  });
  t('puste zaznaczenia -> missed.length == liczba zdań z truth', () => {
    const r = Se.judgePens({});
    assert.ok(TRUTH_COUNT > 0, 'brak zdań z truth');
    assert.equal(r.missed.length, TRUTH_COUNT);
  });
  t('zaznaczenie zdania z truth null -> wrong je zawiera', () => {
    const bg = Se.SENEKA.find((s) => s.truth === null);
    assert.ok(bg, 'brak zdania-tła z truth null');
    const r = Se.judgePens({ [bg.id]: 'nie-wolno' });
    assert.equal(r.ok, false);
    assert.ok(r.wrong.some((w) => w.id === bg.id), JSON.stringify(r.wrong.map((w) => w.id)));
  });
  t('zaznaczenie niezgodne z truth -> ok false i wrong niepusty', () => {
    const first = Se.SENEKA.find((s) => s.truth);
    const flipped = first.truth === 'nie-wolno' ? 'seneka' : 'nie-wolno';
    const r = Se.judgePens({ ...ALL_PENS, [first.id]: flipped });
    assert.equal(r.ok, false);
    assert.ok(r.wrong.some((w) => w.id === first.id));
  });
});

group('E) seneka: paszport', () => {
  t('poprawny paszport -> ok', () => {
    const r = Pp.judgePassport(Se.SENEKA_FIELDS, Se.SENEKA_BANK, { kto: 'filozof', kiedy: 'rok64', 'po-co': 'list' });
    assert.equal(r.ok, true);
  });
  t("kiedy 'rok46' -> ok false", () => {
    const r = Pp.judgePassport(Se.SENEKA_FIELDS, Se.SENEKA_BANK, { kto: 'filozof', kiedy: 'rok46', 'po-co': 'list' });
    assert.equal(r.ok, false);
  });
  t("kiedy 'rok46' -> błąd przy 'kiedy'", () => {
    const r = Pp.judgePassport(Se.SENEKA_FIELDS, Se.SENEKA_BANK, { kto: 'filozof', kiedy: 'rok46', 'po-co': 'list' });
    assert.ok(r.errors.kiedy, 'brak błędu przy polu kiedy');
  });
});

/* --- F) cezar ------------------------------------------------------------------ */

group('F) cezar: zaufanie i źródła', () => {
  t("samo uwielbienie Cezara -> ok false z 'Cezarowi'", () => {
    const r = Cz.judgeTrust({ cezar: 90, cyceron: 50, swetoniusz: 50 });
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('Cezarowi'), r.message);
  });
  t("samo uwielbienie Cycerona -> ok false z 'Cyceronowi'", () => {
    const r = Cz.judgeTrust({ cezar: 50, cyceron: 90, swetoniusz: 50 });
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('Cyceronowi'), r.message);
  });
  t('najwyższe zaufanie do Swetoniusza -> ok', () => {
    assert.deepEqual(Cz.judgeTrust({ cezar: 30, cyceron: 30, swetoniusz: 80 }), { ok: true });
  });
  t('remis wszystkich -> ok (remis nie jest odrzucany)', () => {
    assert.deepEqual(Cz.judgeTrust({ cezar: 50, cyceron: 50, swetoniusz: 50 }), { ok: true });
  });
  t('remis Cezara ze Swetoniuszem na szczycie -> ok', () => {
    assert.deepEqual(Cz.judgeTrust({ cezar: 80, cyceron: 20, swetoniusz: 80 }), { ok: true });
  });
  t('VERDICT_TEXT ma 3 klucze', () => {
    assert.equal(Object.keys(Cz.VERDICT_TEXT).length, 3);
  });
  t('SOURCES ma 3 źródła', () => {
    assert.equal(Cz.SOURCES.length, 3);
  });
  t('SOURCES ma unikalne id', () => {
    const ids = Cz.SOURCES.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

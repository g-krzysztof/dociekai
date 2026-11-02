/**
 * Selftest czystych funkcji L11 (`swieta-i-wspolnoty`: wspolnoty, swieta, obchody, gwiazdy).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l10-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l11-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l11-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as W from '${root}/src/app/historia/klasa-4/components/lessons/swieta-i-wspolnoty/wspolnoty';\n` +
    `export * as S from '${root}/src/app/historia/klasa-4/components/lessons/swieta-i-wspolnoty/swieta';\n` +
    `export * as O from '${root}/src/app/historia/klasa-4/components/lessons/swieta-i-wspolnoty/obchody';\n` +
    `export * as G from '${root}/src/app/historia/klasa-4/components/lessons/swieta-i-wspolnoty/gwiazdy';\n`
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

const { W, S, O, G } = lib;

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

/* --- A) wspolnoty: strefy -------------------------------------------------- */

group('A) wspolnoty: strefy', () => {
  for (const [zone, pt] of Object.entries(W.ZONE_SAMPLE)) {
    t(`zoneAt(${pt.x},${pt.y}) === '${zone}'`, () => {
      assert.equal(W.zoneAt(pt.x, pt.y), zone);
    });
  }
  t('membershipAt: pl ⇒ ue (w każdej próbce)', () => {
    for (const [zone, pt] of Object.entries(W.ZONE_SAMPLE)) {
      const m = W.membershipAt(pt.x, pt.y);
      assert.ok(!m.pl || m.ue, `${zone}: pl bez ue`);
    }
  });
});

/* --- B) wspolnoty: sędzia -------------------------------------------------- */

const ALL_OK = Object.fromEntries(W.PEOPLE.map((p) => [p.id, W.ZONE_SAMPLE[W.zoneOf(p.truth)]]));

group('B) wspolnoty: sędzia', () => {
  t('wszyscy w ZONE_SAMPLE[zoneOf(truth)] → ok=true', () => {
    assert.equal(W.judgeWspolnoty(ALL_OK).ok, true);
  });
  t('wszyscy dobrze → errors puste', () => {
    assert.deepEqual(W.judgeWspolnoty(ALL_OK).errors, []);
  });
  t('brakująca osoba → missing zawiera jej id', () => {
    const { lukas, ...bezLukasa } = ALL_OK;
    assert.ok(W.judgeWspolnoty(bezLukasa).missing.includes('lukas'));
  });
  t('brakująca osoba → ok=false', () => {
    const { lukas, ...bezLukasa } = ALL_OK;
    assert.equal(W.judgeWspolnoty(bezLukasa).ok, false);
  });
  t("barbara w 'pl-narod' → błąd z cytatem o amerykańskim paszporcie", () => {
    const v = W.judgeWspolnoty({ ...ALL_OK, barbara: W.ZONE_SAMPLE['pl-narod'] });
    assert.equal(v.ok, false);
    assert.equal(v.errors.length, 1);
    assert.ok(v.errors[0].message.includes('amerykański paszport'), v.errors[0].message);
  });
  t("minh w 'pl-narod' → błąd zawiera „Wietnamczykiem”", () => {
    const v = W.judgeWspolnoty({ ...ALL_OK, minh: W.ZONE_SAMPLE['pl-narod'] });
    assert.equal(v.errors.length, 1);
    assert.ok(v.errors[0].message.includes('Wietnamczykiem'), v.errors[0].message);
  });
  t("kasia w 'narod' → błąd zawiera „Litwa”", () => {
    const v = W.judgeWspolnoty({ ...ALL_OK, kasia: W.ZONE_SAMPLE.narod });
    assert.equal(v.errors.length, 1);
    assert.ok(v.errors[0].message.includes('Litwa'), v.errors[0].message);
  });
  t("lukas w 'pl' → błąd zawiera „niemiecki”", () => {
    const v = W.judgeWspolnoty({ ...ALL_OK, lukas: W.ZONE_SAMPLE.pl });
    assert.equal(v.errors.length, 1);
    assert.ok(v.errors[0].message.includes('niemiecki'), v.errors[0].message);
  });
  t('jeden błąd na osobę maksymalnie (wszyscy w „poza”)', () => {
    const placed = Object.fromEntries(W.PEOPLE.map((p) => [p.id, W.ZONE_SAMPLE.poza]));
    const v = W.judgeWspolnoty(placed);
    assert.ok(v.errors.length <= W.PEOPLE.length, `błędów: ${v.errors.length}`);
    assert.equal(new Set(v.errors.map((e) => e.personId)).size, v.errors.length);
  });
  t("klucz 'ty' w placed nie zmienia wyniku", () => {
    const a = W.judgeWspolnoty(ALL_OK);
    const b = W.judgeWspolnoty({ ...ALL_OK, ty: { x: 0, y: 0 } });
    assert.deepEqual(b, a);
  });
});

/* --- C) swieta: isHoliday -------------------------------------------------- */

group('C) swieta: isHoliday', () => {
  t('1938: 3-maja true', () => {
    assert.equal(S.isHoliday('3-maja', 1938), true);
  });
  t('1938: 22-lipca false', () => {
    assert.equal(S.isHoliday('22-lipca', 1938), false);
  });
  t('1938: 11-listopada true', () => {
    assert.equal(S.isHoliday('11-listopada', 1938), true);
  });
  t('1960: 3-maja false', () => {
    assert.equal(S.isHoliday('3-maja', 1960), false);
  });
  t('1960: 22-lipca true', () => {
    assert.equal(S.isHoliday('22-lipca', 1960), true);
  });
  t('1960: 11-listopada false', () => {
    assert.equal(S.isHoliday('11-listopada', 1960), false);
  });
  t('1995: 3-maja true', () => {
    assert.equal(S.isHoliday('3-maja', 1995), true);
  });
  t('1995: 22-lipca false', () => {
    assert.equal(S.isHoliday('22-lipca', 1995), false);
  });
  t('1995: 11-listopada true', () => {
    assert.equal(S.isHoliday('11-listopada', 1995), true);
  });
  t('1950: 3-maja true (ustawa 1951 jeszcze nie)', () => {
    assert.equal(S.isHoliday('3-maja', 1950), true);
  });
  t('1950: 11-listopada false', () => {
    assert.equal(S.isHoliday('11-listopada', 1950), false);
  });
});

/* --- D) swieta: sędzia kalendarzy ------------------------------------------ */

const CORRECT = new Set();
for (const y of S.YEARS) {
  for (const { id } of S.DAYS) {
    if (S.isHoliday(id, y)) CORRECT.add(S.cellKey(y, id));
  }
}

group('D) swieta: sędzia kalendarzy', () => {
  t('poprawny zestaw → []', () => {
    assert.deepEqual(S.judgeKalendarze(CORRECT), []);
  });
  t('pusty zbiór → 5 błędów', () => {
    assert.equal(S.judgeKalendarze(new Set()).length, 5);
  });
  t("nadmiarowa 22-lipca 1938 → „jeszcze nie było”", () => {
    const red = new Set(CORRECT);
    red.add(S.cellKey(1938, '22-lipca'));
    const err = S.judgeKalendarze(red).find((e) => e.key === S.cellKey(1938, '22-lipca'));
    assert.ok(err, 'brak błędu dla 1938:22-lipca');
    assert.ok(err.message.includes('jeszcze nie było'), err.message);
  });
  t('nadmiarowa 22-lipca 1938 → „22 lipca 1945”', () => {
    const red = new Set(CORRECT);
    red.add(S.cellKey(1938, '22-lipca'));
    const err = S.judgeKalendarze(red).find((e) => e.key === S.cellKey(1938, '22-lipca'));
    assert.ok(err.message.includes('22 lipca 1945'), err.message);
  });
  t("brak 11-listopada 1995 → „15 lutego 1989”", () => {
    const red = new Set(CORRECT);
    red.delete(S.cellKey(1995, '11-listopada'));
    const err = S.judgeKalendarze(red).find((e) => e.key === S.cellKey(1995, '11-listopada'));
    assert.ok(err, 'brak błędu dla 1995:11-listopada');
    assert.ok(err.message.includes('15 lutego 1989'), err.message);
  });
  t("zamalowana 11-listopada 1960 → „22 lipca 1945”", () => {
    const red = new Set(CORRECT);
    red.add(S.cellKey(1960, '11-listopada'));
    const err = S.judgeKalendarze(red).find((e) => e.key === S.cellKey(1960, '11-listopada'));
    assert.ok(err, 'brak błędu dla 1960:11-listopada');
    assert.ok(err.message.includes('22 lipca 1945'), err.message);
  });
  t("zamalowana 11-listopada 1960 → „czarna”", () => {
    const red = new Set(CORRECT);
    red.add(S.cellKey(1960, '11-listopada'));
    const err = S.judgeKalendarze(red).find((e) => e.key === S.cellKey(1960, '11-listopada'));
    assert.ok(err.message.includes('czarna'), err.message);
  });
  t('HOLIDAYS w kolejności kalendarza: lata 1791, 1920, 1918', () => {
    assert.deepEqual(S.HOLIDAYS.map((h) => h.year), [1791, 1920, 1918]);
  });
  t("HOLIDAYS: id 'konstytucja','bitwa-warszawska','niepodleglosc'", () => {
    assert.deepEqual(S.HOLIDAYS.map((h) => h.id), ['konstytucja', 'bitwa-warszawska', 'niepodleglosc']);
  });
});

/* --- E) obchody: program ---------------------------------------------------- */

group('E) obchody: program', () => {
  const prog = ['flaga', 'hymn', 'opowiesc', 'bieg'];
  t("['flaga','hymn','opowiesc','bieg'] → symbole ok", () => {
    assert.equal(O.judgeObchody(prog).symbole.ok, true);
  });
  t("['flaga','hymn','opowiesc','bieg'] → otwarcie ok", () => {
    assert.equal(O.judgeObchody(prog).otwarcie.ok, true);
  });
  t("['flaga','hymn','opowiesc','bieg'] → rok1918 ok", () => {
    assert.equal(O.judgeObchody(prog).rok1918.ok, true);
  });
  t("['flaga','hymn','opowiesc','bieg'] → wszyscy ok", () => {
    assert.equal(O.judgeObchody(prog).wszyscy.ok, true);
  });
  t("['flaga','hymn','opowiesc','bieg'] → czas ok (30 min)", () => {
    assert.equal(O.judgeObchody(prog).czas.ok, true);
    assert.equal(O.totalMinutes(prog), 30);
  });
  t("['hymn','flaga','opowiesc','bieg'] też ok", () => {
    const v = O.judgeObchody(['hymn', 'flaga', 'opowiesc', 'bieg']);
    for (const k of ['symbole', 'otwarcie', 'rok1918', 'wszyscy', 'czas']) {
      assert.equal(v[k].ok, true, k);
    }
  });
  t("['opowiesc','flaga','hymn','bieg'] → otwarcie.ok false", () => {
    assert.equal(O.judgeObchody(['opowiesc', 'flaga', 'hymn', 'bieg']).otwarcie.ok, false);
  });
  t("['opowiesc','flaga','hymn','bieg'] → reszta ok", () => {
    const v = O.judgeObchody(['opowiesc', 'flaga', 'hymn', 'bieg']);
    for (const k of ['symbole', 'rok1918', 'wszyscy', 'czas']) {
      assert.equal(v[k].ok, true, k);
    }
  });
  t("bez 'hymn' → symbole false", () => {
    assert.equal(O.judgeObchody(['flaga', 'opowiesc', 'bieg']).symbole.ok, false);
  });
  t("bez 'hymn' → note zawiera „hymnu”", () => {
    assert.ok(O.judgeObchody(['flaga', 'opowiesc', 'bieg']).symbole.note.includes('hymnu'));
  });
  t('bez punktu mowi1918 → rok1918 false', () => {
    assert.equal(O.judgeObchody(['flaga', 'hymn', 'bieg']).rok1918.ok, false);
  });
  t("['flaga','hymn','opowiesc','przemowienie'] → wszyscy false (hymn się nie liczy)", () => {
    assert.equal(O.judgeObchody(['flaga', 'hymn', 'opowiesc', 'przemowienie']).wszyscy.ok, false);
  });
  t("['flaga','hymn','scenka','bieg','quiz'] = 44 min ok", () => {
    const prog2 = ['flaga', 'hymn', 'scenka', 'bieg', 'quiz'];
    assert.equal(O.totalMinutes(prog2), 44);
    assert.equal(O.judgeObchody(prog2).czas.ok, true);
  });
  t("dodanie 'taniec' → czas false", () => {
    assert.equal(O.judgeObchody(['flaga', 'hymn', 'scenka', 'bieg', 'quiz', 'taniec']).czas.ok, false);
  });
  t("dodanie 'taniec' → note zawiera „o 7 za dużo”", () => {
    const v = O.judgeObchody(['flaga', 'hymn', 'scenka', 'bieg', 'quiz', 'taniec']);
    assert.equal(O.totalMinutes(['flaga', 'hymn', 'scenka', 'bieg', 'quiz', 'taniec']), 52);
    assert.ok(v.czas.note.includes('o 7 za dużo'), v.czas.note);
  });
  t("schedule(['flaga','hymn']) → at '10:00' i '10:03'", () => {
    const s = O.schedule(['flaga', 'hymn']);
    assert.equal(s[0].at, '10:00');
    assert.equal(s[1].at, '10:03');
  });
  t("formatClock(605) === '10:05'", () => {
    assert.equal(O.formatClock(605), '10:05');
  });
});

/* --- F) gwiazdy ------------------------------------------------------------- */

group('F) gwiazdy', () => {
  t('starCenters(0,0,10) ma 12 punktów', () => {
    assert.equal(G.starCenters(0, 0, 10).length, 12);
  });
  t('starCenters(0,0,10): pierwszy to (0,-10)', () => {
    const [first] = G.starCenters(0, 0, 10);
    assert.deepEqual(first, { x: 0, y: -10 });
  });
  t('starPoints zwraca 10 par', () => {
    assert.equal(G.starPoints(0, 0, 10).split(' ').length, 10);
  });
  t("noteFreq('A4') === 440", () => {
    assert.equal(G.noteFreq('A4'), 440);
  });
  t("noteFreq('C4') ≈ 261.63", () => {
    assert.ok(Math.abs(G.noteFreq('C4') - 261.63) < 0.01, `jest ${G.noteFreq('C4')}`);
  });
  t('KROKI rosnąco po latach', () => {
    for (let i = 1; i < G.KROKI.length; i++) {
      assert.ok(G.KROKI[i].year > G.KROKI[i - 1].year, `${G.KROKI[i].year} po ${G.KROKI[i - 1].year}`);
    }
  });
  t('KROKI dla 2004: members 25', () => {
    assert.equal(G.KROKI.find((k) => k.year === 2004).members, 25);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

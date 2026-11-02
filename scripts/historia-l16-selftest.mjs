/**
 * Selftest czystych funkcji L16 (`rewolucja-neolityczna`: wioska, warstwy,
 * siekiera).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l15-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l16-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l16-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as V from '${root}/src/app/historia/klasa-4/components/lessons/rewolucja-neolityczna/wioska';\n` +
    `export * as W from '${root}/src/app/historia/klasa-4/components/lessons/rewolucja-neolityczna/warstwy';\n` +
    `export * as S from '${root}/src/app/historia/klasa-4/components/lessons/rewolucja-neolityczna/siekiera';\n`,
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

const { V, W, S } = lib;

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

/* --- A) wioska: start i plon ------------------------------------------------ */

group('A) wioska: start i plon', () => {
  t('initialVillage zaczyna w roku 0', () => {
    assert.equal(V.initialVillage().year, 0);
  });
  t('initialVillage zaczyna z pustym spichlerzem', () => {
    assert.equal(V.initialVillage().granary, 0);
  });
  t('people() na starcie === 6', () => {
    assert.equal(V.people(V.initialVillage()), 6);
  });
  t('houses() na starcie === 3', () => {
    assert.equal(V.houses(V.initialVillage()), 3);
  });
  t('harvestOf(8, 0) === 16 (8 zagonów × plon 2)', () => {
    assert.equal(V.harvestOf(8, 0), 16);
  });
  t('harvestOf(8, DROUGHT_YEAR) === 4 (susza: 8 × 0,5)', () => {
    assert.equal(V.harvestOf(8, V.DROUGHT_YEAR), 4);
  });
  t('harvestOf(0, 0) === 0 (nic nie obsiano)', () => {
    assert.equal(V.harvestOf(0, 0), 0);
  });
  t('DROUGHT_YEAR === 4 (piąty rok, indeks od zera)', () => {
    assert.equal(V.DROUGHT_YEAR, 4);
  });
});

/* --- B) wioska: pierwsze trzy lata ------------------------------------------ */

function firstYears() {
  let s = V.initialVillage();
  s = V.runYear(s, 8);
  const y0 = s;
  s = V.runYear(s, 8);
  const y1 = s;
  s = V.runYear(s, 8);
  return { y0, y1, y2: s };
}

group('B) wioska: pierwsze trzy lata', () => {
  t('rok 1: granary 10 (16 plonu − 6 zjedzonych)', () => {
    assert.equal(firstYears().y0.granary, 10);
  });
  t("rok 1: przychodzi 'garncarz'", () => {
    assert.equal(firstYears().y0.log[0].newcomer, 'garncarz');
  });
  t('rok 1: myszy w spichlerzu (granary >= MICE_AT)', () => {
    assert.equal(firstYears().y0.mice, true);
  });
  t('rok 1: myszy jeszcze nic nie zjadły (log[0].miceAte === 0)', () => {
    assert.equal(firstYears().y0.log[0].miceAte, 0);
  });
  t('rok 2: myszy zjadają MICE_EAT (log[1].miceAte === 2)', () => {
    assert.equal(firstYears().y1.log[1].miceAte, V.MICE_EAT);
    assert.equal(firstYears().y1.log[1].miceAte, 2);
  });
  t('rok 2: kota jeszcze nie ma (log[1].catArrived === false)', () => {
    assert.equal(firstYears().y1.log[1].catArrived, false);
  });
  t('rok 3: kot przychodzi (log[2].catArrived === true)', () => {
    assert.equal(firstYears().y2.log[2].catArrived, true);
  });
  t('rok 3: przy kocie myszy już nic nie zjadają (log[2].miceAte === 0)', () => {
    assert.equal(firstYears().y2.log[2].miceAte, 0);
  });
});

/* --- C) wioska: przykładowa wioska (10 lat pełnego siewu) -------------------- */

group('C) wioska: sampleVillage', () => {
  t('sampleVillage trwa 10 lat', () => {
    assert.equal(V.sampleVillage().year, 10);
    assert.equal(V.sampleVillage().log.length, 10);
  });
  t('statsOf(sampleVillage()).granary === 56', () => {
    assert.equal(V.statsOf(V.sampleVillage()).granary, 56);
  });
  t('statsOf(sampleVillage()).freed === 5 (wszyscy specjaliści)', () => {
    assert.equal(V.statsOf(V.sampleVillage()).freed, 5);
  });
  t('statsOf(sampleVillage()).houses === 8 (3 + 5 nowych)', () => {
    assert.equal(V.statsOf(V.sampleVillage()).houses, 8);
  });
  t('statsOf(sampleVillage()).harvestTotal === 148 (9 × 16 + 4)', () => {
    assert.equal(V.statsOf(V.sampleVillage()).harvestTotal, 148);
  });
  t('przykładowa wioska nie głoduje (hungryYears === 0)', () => {
    assert.equal(V.sampleVillage().hungryYears, 0);
  });
  t('rok suszy to log[4] (drought === true)', () => {
    assert.equal(V.sampleVillage().log[4].drought, true);
  });
  t('w roku suszy plon wynosi 4 (log[4].harvest)', () => {
    assert.equal(V.sampleVillage().log[4].harvest, 4);
  });
  t('po 10 latach kot już mieszka w wiosce', () => {
    assert.equal(V.sampleVillage().cat, true);
  });
  t('przykładowa wioska ma wszystkich 5 specjalistów', () => {
    assert.deepEqual([...V.sampleVillage().specialists].sort(), [
      'budowniczy',
      'garncarz',
      'krzemieniarz',
      'pasterz',
      'tkaczka',
    ]);
  });
});

/* --- D) wioska: głód i granice ------------------------------------------------ */

group('D) wioska: głód i granice', () => {
  t('runYear(s, 0) w pierwszym roku: spichlerz pusty (granary 0)', () => {
    assert.equal(V.runYear(V.initialVillage(), 0).granary, 0);
  });
  t('runYear(s, 0) w pierwszym roku: rok głodu (hungryYears 1)', () => {
    assert.equal(V.runYear(V.initialVillage(), 0).hungryYears, 1);
  });
  t('runYear po 10 latach nie zmienia stanu', () => {
    const done = V.sampleVillage();
    assert.deepEqual(V.runYear(done, 8), done);
  });
  t('runYear przycina ujemny siew do 0 (log sown === 0)', () => {
    assert.equal(V.runYear(V.initialVillage(), -5).log[0].sown, 0);
  });
  t('runYear przycina siew powyżej pola do CELLS (log sown === 8)', () => {
    assert.equal(V.runYear(V.initialVillage(), 100).log[0].sown, V.CELLS);
  });
  t('runYear zaokrągla siew (7,6 → 8)', () => {
    assert.equal(V.runYear(V.initialVillage(), 7.6).log[0].sown, 8);
  });
  t('runYear zaokrągla siew w dół (7,4 → 7)', () => {
    assert.equal(V.runYear(V.initialVillage(), 7.4).log[0].sown, 7);
  });
});

/* --- E) warstwy: geometria i kolebka ------------------------------------------ */

const SQUARE = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
];

group('E) warstwy: geometria i kolebka', () => {
  t('pointInPolygon: środek kwadratu true', () => {
    assert.equal(W.pointInPolygon([5, 5], SQUARE), true);
  });
  t('pointInPolygon: punkt poza kwadratem false', () => {
    assert.equal(W.pointInPolygon([15, 5], SQUARE), false);
  });
  t('isCradle: Jerycho (35.44, 31.87) true', () => {
    assert.equal(W.isCradle([35.44, 31.87]), true);
  });
  t('SITES: Çatalhöyük nie jest kolebką', () => {
    const catal = W.SITES.find((s) => s.id === 'catal');
    assert.ok(catal, 'brak SITES catal');
    assert.equal(W.isCradle(catal.at), false);
  });
  t('SITES: Jerycho jest kolebką', () => {
    const jerycho = W.SITES.find((s) => s.id === 'jerycho');
    assert.ok(jerycho, 'brak SITES jerycho');
    assert.equal(W.isCradle(jerycho.at), true);
  });
  t('judgeVillage: Mosul (43.1, 36.3) ok', () => {
    assert.equal(W.judgeVillage([43.1, 36.3]).ok, true);
  });
  t('judgeVillage: Bagdad (44.4, 33.3) nie ok', () => {
    assert.equal(W.judgeVillage([44.4, 33.3]).ok, false);
  });
});

/* --- F) warstwy: sędzia i rzeki ------------------------------------------------ */

group('F) warstwy: sędzia i rzeki', () => {
  t('judgeVillage: Kair (31.2, 30) nie ok', () => {
    assert.equal(W.judgeVillage([31.2, 30]).ok, false);
  });
  t("judgeVillage: Kair ma w missing 'zboza'", () => {
    assert.ok(W.judgeVillage([31.2, 30]).missing.includes('zboza'));
  });
  t('nearRiver: punkt na Nilu (31.2, 27.2) true', () => {
    assert.equal(W.nearRiver([31.2, 27.2]), true);
  });
  t('nearRiver: pustynia (40, 25) false', () => {
    assert.equal(W.nearRiver([40, 25]), false);
  });
  t('nearRiver: Mosul leży na Tygrysie true', () => {
    assert.equal(W.nearRiver([43.1, 36.3]), true);
  });
  t('judgeVillage: Jerycho ok (kolebka spełnia sędziego)', () => {
    assert.equal(W.judgeVillage([35.44, 31.87]).ok, true);
  });
});

/* --- G) warstwy: siatka -------------------------------------------------------- */

group('G) warstwy: buildGrid', () => {
  t('buildGrid ma co najmniej 40 kratek cradle', () => {
    const n = W.buildGrid().filter((c) => c.cradle).length;
    assert.ok(n >= 40, `cradle=${n}`);
  });
  t("każda kratka cradle ma 'zboza' i 'zwierzeta' w layers", () => {
    for (const c of W.buildGrid()) {
      if (!c.cradle) continue;
      assert.ok(c.layers.includes('zboza') && c.layers.includes('zwierzeta'), JSON.stringify(c));
    }
  });
  t('wszystkie kratki leżą w BOX', () => {
    for (const c of W.buildGrid()) {
      assert.ok(c.lon >= W.BOX.lon0 && c.lon <= W.BOX.lon1 && c.lat >= W.BOX.lat0 && c.lat <= W.BOX.lat1, JSON.stringify(c));
    }
  });
  t('każda kratka ma niepustą listę warstw', () => {
    const cells = W.buildGrid();
    assert.ok(cells.length > 0, 'pusta siatka');
    for (const c of cells) assert.ok(c.layers.length > 0, JSON.stringify(c));
  });
});

/* --- H) siekiera --------------------------------------------------------------- */

function chopTimes(s, i, n) {
  let cur = s;
  let broke = false;
  for (let k = 0; k < n; k += 1) {
    const r = S.chop(cur, i);
    cur = r.state;
    broke = r.broke;
  }
  return { state: cur, broke };
}

function fellField() {
  let s = S.initialChop();
  for (let i = 0; i < S.TREES; i += 1) s = chopTimes(s, i, S.HITS_PER_TREE).state;
  return s;
}

group('H) siekiera', () => {
  t('initialChop: TREES drzew, każde po 0 uderzeń', () => {
    const s = S.initialChop();
    assert.equal(s.trees.length, S.TREES);
    assert.ok(s.trees.every((h) => h === 0), JSON.stringify(s.trees));
  });
  t('initialChop: axeLeft === AXE_HITS', () => {
    assert.equal(S.initialChop().axeLeft, S.AXE_HITS);
  });
  t('initialChop: axesUsed === 1', () => {
    assert.equal(S.initialChop().axesUsed, 1);
  });
  t('po HITS_PER_TREE uderzeniach drzewo 0 ścięte', () => {
    const { state } = chopTimes(S.initialChop(), 0, S.HITS_PER_TREE);
    assert.equal(S.isFelled(state, 0), true);
  });
  t('kolejne uderzenie w ścięte drzewo nic nie zmienia', () => {
    const { state } = chopTimes(S.initialChop(), 0, S.HITS_PER_TREE);
    const r = S.chop(state, 0);
    assert.equal(r.broke, false);
    assert.deepEqual(r.state, state);
  });
  t('ścięcie wszystkich drzew: felledCount === TREES', () => {
    assert.equal(S.felledCount(fellField()), S.TREES);
  });
  t('ścięcie wszystkich drzew: axesUsed === axesForField()', () => {
    assert.equal(fellField().axesUsed, S.axesForField());
  });
  t('axesForField() === 5 (36 uderzeń / 8 na siekierę)', () => {
    assert.equal(S.axesForField(), 5);
  });
  t('po AXE_HITS uderzeniach ostrze pęka (broke === true)', () => {
    let s = S.initialChop();
    s = chopTimes(s, 0, S.HITS_PER_TREE).state;
    s = chopTimes(s, 1, S.HITS_PER_TREE).state;
    const r = chopTimes(s, 2, 2);
    assert.equal(r.broke, true);
  });
  t('po pęknięciu axeLeft wraca do AXE_HITS i jest druga siekiera', () => {
    let s = S.initialChop();
    s = chopTimes(s, 0, S.HITS_PER_TREE).state;
    s = chopTimes(s, 1, S.HITS_PER_TREE).state;
    const r = chopTimes(s, 2, 2);
    assert.equal(r.state.axeLeft, S.AXE_HITS);
    assert.equal(r.state.axesUsed, 2);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

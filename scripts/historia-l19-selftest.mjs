/**
 * Selftest czystych funkcji L19 (`egipt-dar-nilu`: nil + geo-egipt).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l18-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l19-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l19-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as N from '${root}/src/app/historia/klasa-4/components/lessons/egipt-dar-nilu/nil';\n` +
    `export * as G from '${root}/src/app/historia/klasa-4/components/lessons/egipt-dar-nilu/geo-egipt';\n`,
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

const { N, G } = lib;

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

/* --- A) siew, woda, muł, pory roku ------------------------------------------- */

group('A) siew, woda, muł, pory roku', () => {
  t('judgeSowing(0.2) → przed-wylewem', () => {
    assert.equal(N.judgeSowing(0.2), 'przed-wylewem');
  });
  t('judgeSowing(2) → pod-woda', () => {
    assert.equal(N.judgeSowing(2), 'pod-woda');
  });
  t('judgeSowing(4) → w-pore', () => {
    assert.equal(N.judgeSowing(4), 'w-pore');
  });
  t('judgeSowing(5.5) → w-pore', () => {
    assert.equal(N.judgeSowing(5.5), 'w-pore');
  });
  t('judgeSowing(5.6) → za-pozno', () => {
    assert.equal(N.judgeSowing(5.6), 'za-pozno');
  });
  t('judgeSowing(9) → za-pozno', () => {
    assert.equal(N.judgeSowing(9), 'za-pozno');
  });
  t('waterOnField(2.5) === 1', () => {
    assert.equal(N.waterOnField(2.5), 1);
  });
  t('waterOnField(0) === 0', () => {
    assert.equal(N.waterOnField(0), 0);
  });
  t('waterOnField(4) === 0', () => {
    assert.equal(N.waterOnField(4), 0);
  });
  t('mudWetness(5) === 1', () => {
    assert.equal(N.mudWetness(5), 1);
  });
  t('mudWetness(7) === 0', () => {
    assert.equal(N.mudWetness(7), 0);
  });
  t("seasonAt(0).id === 'achet'", () => {
    assert.equal(N.seasonAt(0).id, 'achet');
  });
  t("seasonAt(5).id === 'peret'", () => {
    assert.equal(N.seasonAt(5).id, 'peret');
  });
  t("seasonAt(10).id === 'szemu'", () => {
    assert.equal(N.seasonAt(10).id, 'szemu');
  });
});

/* --- B) wynik wylewu + odczyt ------------------------------------------------ */

group('B) wynik wylewu + odczyt', () => {
  t("floodOutcome(12) → kind 'glod', fields 0", () => {
    const o = N.floodOutcome(12);
    assert.equal(o.kind, 'glod');
    assert.equal(o.fields, 0);
  });
  t("floodOutcome(13) → kind 'bieda'", () => {
    assert.equal(N.floodOutcome(13).kind, 'bieda');
  });
  t("floodOutcome(14) → kind 'dobry'", () => {
    assert.equal(N.floodOutcome(14).kind, 'dobry');
  });
  t("floodOutcome(15) → kind 'dobry'", () => {
    assert.equal(N.floodOutcome(15).kind, 'dobry');
  });
  t("floodOutcome(16) → kind 'dobry'", () => {
    assert.equal(N.floodOutcome(16).kind, 'dobry');
  });
  t('floodOutcome(16) → fields 4', () => {
    assert.equal(N.floodOutcome(16).fields, 4);
  });
  t("floodOutcome(17) → kind 'zalanie', village true", () => {
    const o = N.floodOutcome(17);
    assert.equal(o.kind, 'zalanie');
    assert.equal(o.village, true);
  });
  t("floodOutcome(18) → kind 'zalanie', village true", () => {
    const o = N.floodOutcome(18);
    assert.equal(o.kind, 'zalanie');
    assert.equal(o.village, true);
  });
  t('judgeReading(15.6, 16) → true', () => {
    assert.equal(N.judgeReading(15.6, 16), true);
  });
  t('judgeReading(15.4, 16) → false', () => {
    assert.equal(N.judgeReading(15.4, 16), false);
  });
});

/* --- C) etykiety na tabliczce ------------------------------------------------- */

group('C) etykiety na tabliczce', () => {
  t("judgeRuleLabel('glod', 12) → ok", () => {
    assert.equal(N.judgeRuleLabel('glod', 12).ok, true);
  });
  t("judgeRuleLabel('glod', 11) → ok", () => {
    assert.equal(N.judgeRuleLabel('glod', 11).ok, true);
  });
  t("judgeRuleLabel('glod', 13) → nie ok, why zawiera 'łokciach'", () => {
    const r = N.judgeRuleLabel('glod', 13);
    assert.equal(r.ok, false);
    assert.ok(r.why?.includes('łokciach'), r.why);
  });
  t("judgeRuleLabel('dobry', 14) → ok", () => {
    assert.equal(N.judgeRuleLabel('dobry', 14).ok, true);
  });
  t("judgeRuleLabel('dobry', 15) → ok", () => {
    assert.equal(N.judgeRuleLabel('dobry', 15).ok, true);
  });
  t("judgeRuleLabel('dobry', 16) → ok", () => {
    assert.equal(N.judgeRuleLabel('dobry', 16).ok, true);
  });
  t("judgeRuleLabel('dobry', 17) → nie ok", () => {
    assert.equal(N.judgeRuleLabel('dobry', 17).ok, false);
  });
  t("judgeRuleLabel('zalanie', 17) → ok", () => {
    assert.equal(N.judgeRuleLabel('zalanie', 17).ok, true);
  });
  t("judgeRuleLabel('zalanie', 20) → ok", () => {
    assert.equal(N.judgeRuleLabel('zalanie', 20).ok, true);
  });
  t("judgeRuleLabel('zalanie', 16) → nie ok", () => {
    assert.equal(N.judgeRuleLabel('zalanie', 16).ok, false);
  });
  for (let level = 10; level <= 20; level++) {
    t(`poziom ${level}: dokładnie jedna albo zero etykiet ok${level === 13 ? ' (13 → zero)' : ''}`, () => {
      const oks = N.RULE_LABELS.filter((l) => N.judgeRuleLabel(l.id, level).ok);
      assert.ok(oks.length <= 1, `ok: ${oks.map((l) => l.id).join(',')}`);
      if (level === 13) assert.equal(oks.length, 0, `ok: ${oks.map((l) => l.id).join(',')}`);
      else assert.equal(oks.length, 1, `poziom ${level} bez etykiety`);
    });
  }
});

/* --- D) trzy lata -------------------------------------------------------------- */

group('D) trzy lata', () => {
  t('FLOOD_YEARS: 3 lata', () => {
    assert.equal(N.FLOOD_YEARS.length, 3);
  });
  t("FLOOD_YEARS daje po jednej z rodzajów 'dobry', 'glod', 'zalanie'", () => {
    const kinds = N.FLOOD_YEARS.map((y) => N.floodOutcome(y).kind).sort();
    assert.deepEqual(kinds, ['dobry', 'glod', 'zalanie']);
  });
});

/* --- E) siatka ------------------------------------------------------------------ */

const grid = N.makeGrid(G.FLOOD_ROWS, G.EG_CELL);

function cellCounts() {
  const counts = {};
  for (let r = 0; r < grid.rows; r++)
    for (let c = 0; c < grid.cols; c++) {
      const k = grid.at(c, r);
      counts[k] = (counts[k] ?? 0) + 1;
    }
  return counts;
}
const COUNTS = cellCounts();

function findCell(pred) {
  for (let r = 0; r < grid.rows; r++)
    for (let c = 0; c < grid.cols; c++) {
      if (pred(grid.at(c, r), c, r)) return { c, r, k: grid.at(c, r) };
    }
  return null;
}

group('E) siatka', () => {
  t('makeGrid: cols === EG_COLS', () => {
    assert.equal(grid.cols, G.EG_COLS);
  });
  t('makeGrid: rows === EG_ROWS', () => {
    assert.equal(grid.rows, G.EG_ROWS);
  });
  t('wszystkie wiersze tej samej długości', () => {
    for (const row of G.FLOOD_ROWS) assert.equal(row.length, grid.cols, `wiersz długości ${row.length}`);
  });
  t('znaki tylko z zestawu . d v D f 1 2 3 4 5', () => {
    const allowed = new Set(['.', 'd', 'v', 'D', 'f', '1', '2', '3', '4', '5']);
    for (const [k, n] of Object.entries(COUNTS)) assert.ok(allowed.has(k), `znak '${k}' × ${n}`);
  });
  for (const o of ['1', '2', '3', '4', '5']) {
    t(`oaza '${o}' ma ≥ 5 komórek`, () => {
      assert.ok((COUNTS[o] ?? 0) >= 5, `komórek: ${COUNTS[o] ?? 0}`);
    });
  }
  t("komórek 'v' > 100", () => {
    assert.ok((COUNTS.v ?? 0) > 100, `komórek: ${COUNTS.v ?? 0}`);
  });
  t("komórek 'D' > 100", () => {
    assert.ok((COUNTS.D ?? 0) > 100, `komórek: ${COUNTS.D ?? 0}`);
  });
});

/* --- F) pędzel --------------------------------------------------------------------- */

const centerOf = ({ c, r }) => ({ x: (c + 0.5) * G.EG_CELL, y: (r + 0.5) * G.EG_CELL });

// Pustynia daleko od rzeki: 'd' bez wody i oaz w kwadracie 7×7 wokół.
const desertFar = findCell(
  (k, c, r) =>
    k === 'd' &&
    (() => {
      for (let dr = -3; dr <= 3; dr++)
        for (let dc = -3; dc <= 3; dc++) {
          const nk = grid.at(c + dc, r + dr);
          if (nk !== 'd' && nk !== '.') return false;
        }
      return true;
    })(),
);
const riverCell = findCell((k) => k === 'v');
const oasisCell = findCell((k) => k === '1');

function allCellsOf(kind) {
  const ids = new Set();
  for (let r = 0; r < grid.rows; r++)
    for (let c = 0; c < grid.cols; c++) {
      if (grid.at(c, r) === kind) ids.add(r * grid.cols + c);
    }
  return ids;
}

group('F) pędzel', () => {
  t('znaleziono pustynię daleko od rzeki', () => {
    assert.ok(desertFar, 'brak komórki pustyni z dala od rzeki');
  });
  t('pustynia: wet puste', () => {
    const { x, y } = centerOf(desertFar);
    assert.deepEqual(N.brush(grid, new Set(), x, y, 2).wet, []);
  });
  t('pustynia: dry niepuste', () => {
    const { x, y } = centerOf(desertFar);
    assert.ok(N.brush(grid, new Set(), x, y, 2).dry.length > 0);
  });
  t('rzeka: wet niepuste', () => {
    const { x, y } = centerOf(riverCell);
    assert.ok(N.brush(grid, new Set(), x, y, 6).wet.length > 0);
  });
  t('rzeka: każda komórka wet jest rzeczna', () => {
    const { x, y } = centerOf(riverCell);
    for (const id of N.brush(grid, new Set(), x, y, 6).wet) {
      const k = grid.at(id % grid.cols, Math.floor(id / grid.cols));
      assert.ok(N.isRiverCell(k), `id ${id} to '${k}'`);
    }
  });
  t("oaza '1': zwraca całą oazę i nic poza nią", () => {
    const { x, y } = centerOf(oasisCell);
    const wet = new Set(N.brush(grid, new Set(), x, y, 6).wet);
    assert.deepEqual(wet, allCellsOf('1'));
  });
  t('brush nie zwraca komórek już obecnych w painted', () => {
    const { x, y } = centerOf(oasisCell);
    const all = allCellsOf('1');
    const painted = new Set([...all].slice(0, Math.ceil(all.size / 2)));
    const wet = N.brush(grid, painted, x, y, 6).wet;
    assert.ok(wet.length > 0, 'pusta reszta oazy');
    for (const id of wet) assert.ok(!painted.has(id), `id ${id} już w painted`);
    assert.deepEqual(new Set([...painted, ...wet]), all);
  });
});

/* --- G) statystyki + symulacja malowania -------------------------------------------- */

function riverIds() {
  const ids = new Set();
  for (let r = 0; r < grid.rows; r++)
    for (let c = 0; c < grid.cols; c++) {
      if (N.isRiverCell(grid.at(c, r))) ids.add(r * grid.cols + c);
    }
  return ids;
}

group('G) statystyki + symulacja malowania', () => {
  t('pusty zbiór → river 0', () => {
    assert.equal(N.floodStats(grid, new Set()).river, 0);
  });
  t('pusty zbiór → oases []', () => {
    assert.deepEqual(N.floodStats(grid, new Set()).oases, []);
  });
  t('rzeka + oazy 1 i 2 → river 1', () => {
    const painted = new Set([...riverIds(), ...allCellsOf('1'), ...allCellsOf('2')]);
    assert.equal(N.floodStats(grid, painted).river, 1);
  });
  t("rzeka + oazy 1 i 2 → oases ['1','2']", () => {
    const painted = new Set([...riverIds(), ...allCellsOf('1'), ...allCellsOf('2')]);
    assert.deepEqual(N.floodStats(grid, painted).oases, ['1', '2']);
  });
  t('rzeka + oazy 1 i 2 → greenOfLand między 1 i 15', () => {
    const painted = new Set([...riverIds(), ...allCellsOf('1'), ...allCellsOf('2')]);
    const g = N.floodStats(grid, painted).greenOfLand;
    assert.ok(g > 1 && g < 15, `greenOfLand ${g}`);
  });
  t('malowanie całej rzeki pędzlem r=14 kończy z river ≥ RIVER_GOAL', () => {
    const painted = new Set();
    const ids = riverIds();
    for (const id of ids) {
      const c = id % grid.cols;
      const r = Math.floor(id / grid.cols);
      const { wet } = N.brush(grid, painted, (c + 0.5) * G.EG_CELL, (r + 0.5) * G.EG_CELL, 14);
      for (const w of wet) painted.add(w);
    }
    assert.ok(N.floodStats(grid, painted).river >= N.RIVER_GOAL, `river ${N.floodStats(grid, painted).river}`);
  });
});

/* --- H) połówki ---------------------------------------------------------------------- */

group('H) połówki', () => {
  t("judgeHalf('dolny', 'polnoc') → ok", () => {
    assert.equal(N.judgeHalf('dolny', 'polnoc').ok, true);
  });
  t("judgeHalf('gorny', 'poludnie') → ok", () => {
    assert.equal(N.judgeHalf('gorny', 'poludnie').ok, true);
  });
  t("judgeHalf('dolny', 'poludnie') → nie ok z why", () => {
    const r = N.judgeHalf('dolny', 'poludnie');
    assert.equal(r.ok, false);
    assert.ok(r.why?.length > 0, 'brak wyjaśnienia');
  });
  t("judgeHalf('gorny', 'polnoc') → nie ok z why", () => {
    const r = N.judgeHalf('gorny', 'polnoc');
    assert.equal(r.ok, false);
    assert.ok(r.why?.length > 0, 'brak wyjaśnienia');
  });
});

/* --- I) zboże -------------------------------------------------------------------------- */

group('I) zboże', () => {
  t("leftAfter('good', 3) === 10", () => {
    assert.equal(N.leftAfter('good', 3), 10);
  });
  t("leftAfter('bad', 3) === 2", () => {
    assert.equal(N.leftAfter('bad', 3), 2);
  });
  t('HARVEST.good − suma STOPS.good === 10', () => {
    assert.equal(N.HARVEST.good - N.STOPS.reduce((s, x) => s + x.good, 0), 10);
  });
  t('judgeScoop(5, STOPS[0], good) → ok', () => {
    assert.equal(N.judgeScoop(5, N.STOPS[0], 'good').ok, true);
  });
  t("judgeScoop(7, STOPS[0], good) → nie ok, why zawiera '2'", () => {
    const r = N.judgeScoop(7, N.STOPS[0], 'good');
    assert.equal(r.ok, false);
    assert.ok(r.why?.includes('2'), r.why);
  });
  t('judgeScoop(4, STOPS[0], good) → nie ok', () => {
    assert.equal(N.judgeScoop(4, N.STOPS[0], 'good').ok, false);
  });
});

/* --- J) Herodot ------------------------------------------------------------------------- */

group('J) Herodot', () => {
  for (const n of N.NOTES) {
    if (n.against.length === 0) continue;
    for (const a of n.against) {
      t(`notatka '${n.id}' → '${a}' ok`, () => {
        assert.equal(N.judgeNote(n.id, a).ok, true);
      });
    }
    t(`notatka '${n.id}' → SILENT nie ok`, () => {
      assert.equal(N.judgeNote(n.id, N.SILENT).ok, false);
    });
  }
  t("notatka 'podatek' → SILENT ok", () => {
    assert.equal(N.judgeNote('podatek', N.SILENT).ok, true);
  });
  for (const h of N.HERODOT) {
    t(`notatka 'podatek' → '${h.id}' nie ok`, () => {
      assert.equal(N.judgeNote('podatek', h.id).ok, false);
    });
  }
  for (const h of N.HERODOT) {
    t(`zdanie '${h.id}' jest w against co najmniej jednej notatki`, () => {
      assert.ok(
        N.NOTES.some((n) => n.against.includes(h.id)),
        'brak notatki',
      );
    });
  }
});

/* --- K) Gdzie i kiedy Herodot ma rację ------------------------------------------------- */

group('K) Herodot — rok i miejsce', () => {
  const all = (lvl, spot) => N.HERODOT.every((h) => N.judgeHerodotAt(h.id, lvl, spot).ok);
  t('za groblą nigdy, przy żadnym poziomie', () => {
    for (let l = N.CHECK_MIN; l <= N.CHECK_MAX; l += 0.5) assert.equal(all(l, 'grobla'), false);
  });
  t('brzeg: 16 łokci — wszystkie zdania prawdziwe', () => assert.equal(all(16, 'brzeg'), true));
  t('brzeg: 13 łokci (bieda) — nie', () => assert.equal(all(13, 'brzeg'), false));
  t('brzeg: 17 łokci (wioska) — nie', () => assert.equal(all(17, 'brzeg'), false));
  t('taras: 15 łokci — woda nie doszła', () => assert.equal(all(15, 'taras'), false));
  t('taras: 16 łokci — tak', () => assert.equal(all(16, 'taras'), true));
  t('każde zdanie ma powód odrzutu przy 12 łokciach nad brzegiem albo za groblą', () => {
    for (const h of N.HERODOT) {
      const a = N.judgeHerodotAt(h.id, 12, 'grobla');
      assert.ok(a.ok || a.why, h.id);
    }
  });
  t('start widżetu (12, grobla) — wszystko fałszywe', () => {
    assert.ok(N.HERODOT.every((h) => !N.judgeHerodotAt(h.id, 12, 'grobla').ok));
  });
  t('herodotYears() = [16]', () => assert.deepEqual(N.herodotYears(), [16]));
  t('istnieje rozwiązanie na suwaku', () => {
    let any = false;
    for (let l = N.CHECK_MIN; l <= N.CHECK_MAX; l += 0.5) for (const s of N.SPOTS) any ||= all(l, s.id);
    assert.ok(any);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

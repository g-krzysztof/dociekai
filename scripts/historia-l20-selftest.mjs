/**
 * Selftest czystych funkcji L20 (`bogowie-mumie-piramidy`: sanie + waga + grobowiec + klatwa).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l19-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l20-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l20-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as S from '${root}/src/app/historia/klasa-4/components/lessons/bogowie-mumie-piramidy/sanie';\n` +
    `export * as W from '${root}/src/app/historia/klasa-4/components/lessons/bogowie-mumie-piramidy/waga';\n` +
    `export * as T from '${root}/src/app/historia/klasa-4/components/lessons/bogowie-mumie-piramidy/grobowiec';\n` +
    `export * as K from '${root}/src/app/historia/klasa-4/components/lessons/bogowie-mumie-piramidy/klatwa';\n`,
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

const { S, W, T, K } = lib;

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

/* --- A) sanie: piasek i pochylnia ------------------------------------------------ */

group('A) sanie: piasek i pochylnia', () => {
  t('neededFlat(0) === 46', () => {
    assert.equal(S.neededFlat(0), 46);
  });
  t('neededFlat(2) === 24', () => {
    assert.equal(S.neededFlat(2), 24);
  });
  t('neededFlat(4) > neededFlat(2)', () => {
    assert.ok(S.neededFlat(4) > S.neededFlat(2), `${S.neededFlat(4)} vs ${S.neededFlat(2)}`);
  });
  t("judgeFlatPull(0, 40) → kind 'lina-za-krotka'", () => {
    const r = S.judgeFlatPull(0, 40);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'lina-za-krotka');
  });
  t('judgeFlatPull(2, 24) → ok', () => {
    assert.equal(S.judgeFlatPull(2, 24).ok, true);
  });
  t("judgeFlatPull(2, 20) → kind 'za-malo-ludzi'", () => {
    const r = S.judgeFlatPull(2, 20);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'za-malo-ludzi');
  });
  t("judgeFlatPull(4, 40) → kind 'bloto'", () => {
    const r = S.judgeFlatPull(4, 40);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'bloto');
  });
  t('neededRamp maleje, gdy długość rośnie', () => {
    let prev = S.neededRamp(S.RAMP_MIN_M);
    for (let l = S.RAMP_MIN_M + 5; l <= S.RAMP_MAX_M; l += 5) {
      const cur = S.neededRamp(l);
      assert.ok(cur <= prev, `l=${l}: ${cur} > ${prev}`);
      prev = cur;
    }
    assert.ok(S.neededRamp(S.RAMP_MAX_M) < S.neededRamp(S.RAMP_MIN_M));
  });
  t("judgeRampPull(25, 40) → kind 'lina-za-krotka'", () => {
    const r = S.judgeRampPull(25, 40);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'lina-za-krotka');
  });
  t('shortestWorkingRamp() to pierwsze l z neededRamp(l) <= 40', () => {
    const l = S.shortestWorkingRamp();
    assert.ok(l > S.RAMP_MIN_M, `l=${l}`);
    assert.ok(S.neededRamp(l) <= 40, `neededRamp(${l})=${S.neededRamp(l)}`);
    assert.ok(S.neededRamp(l - 1) > 40, `neededRamp(${l - 1})=${S.neededRamp(l - 1)}`);
  });
  t('rampAngleDeg(20) === 45 (z tolerancją)', () => {
    assert.ok(Math.abs(S.rampAngleDeg(20) - 45) < 1e-9, `kąt: ${S.rampAngleDeg(20)}`);
  });
});

/* --- B) waga: czyny i papirus ------------------------------------------------------ */

group('B) waga: czyny i papirus', () => {
  for (const d of W.DEEDS) {
    if (d.breaks !== null) {
      t(`zły czyn '${d.id}' na sercu → ok`, () => {
        assert.equal(W.judgeDeed(d, 'serce').ok, true);
      });
      t(`zły czyn '${d.id}' obok → nie ok`, () => {
        assert.equal(W.judgeDeed(d, 'obok').ok, false);
      });
    } else {
      t(`dobry czyn '${d.id}' obok → ok`, () => {
        assert.equal(W.judgeDeed(d, 'obok').ok, true);
      });
      t(`dobry czyn '${d.id}' na sercu → nie ok`, () => {
        assert.equal(W.judgeDeed(d, 'serce').ok, false);
      });
    }
  }
  for (const d of W.DEEDS) {
    if (d.breaks === null) continue;
    t(`czyn '${d.id}' łamie istniejącą zasadę '${d.breaks}'`, () => {
      assert.ok(W.RULES.some((r) => r.id === d.breaks), `zasady: ${W.RULES.map((r) => r.id).join(',')}`);
    });
    t(`zły czyn '${d.id}' ma mended`, () => {
      assert.ok(d.mended?.length > 0, 'brak mended');
    });
  }
  t("heartTilt(['odwaznik','placek'], []) === 2", () => {
    assert.equal(W.heartTilt(['odwaznik', 'placek'], []), 2);
  });
  t("heartTilt(['odwaznik','placek'], ['odwaznik','placek']) === 0", () => {
    assert.equal(W.heartTilt(['odwaznik', 'placek'], ['odwaznik', 'placek']), 0);
  });
  t('PAPYRUS_STOPS posortowane rosnąco po x', () => {
    for (let i = 1; i < W.PAPYRUS_STOPS.length; i++) {
      assert.ok(W.PAPYRUS_STOPS[i].x > W.PAPYRUS_STOPS[i - 1].x, `${W.PAPYRUS_STOPS[i].id} po ${W.PAPYRUS_STOPS[i - 1].id}`);
    }
  });
  t('PAPYRUS_STOPS: każdy x w (0, 1)', () => {
    for (const s of W.PAPYRUS_STOPS) assert.ok(s.x > 0 && s.x < 1, `${s.id}: ${s.x}`);
  });
  t('PAPYRUS_STOPS: sąsiednie różnią się o >= 0.06', () => {
    for (let i = 1; i < W.PAPYRUS_STOPS.length; i++) {
      const diff = W.PAPYRUS_STOPS[i].x - W.PAPYRUS_STOPS[i - 1].x;
      assert.ok(diff >= 0.06, `${W.PAPYRUS_STOPS[i - 1].id}→${W.PAPYRUS_STOPS[i].id}: ${diff}`);
    }
  });
});

/* --- C) grobowiec: warstwy ----------------------------------------------------------- */

group('C) grobowiec: warstwy', () => {
  t('LAYER_COUNT === 8', () => {
    assert.equal(T.LAYER_COUNT, 8);
  });
  t('judgePrediction(8) → exact', () => {
    assert.equal(T.judgePrediction(8).exact, true);
  });
  t('judgePrediction(5) → diff === 3', () => {
    const r = T.judgePrediction(5);
    assert.equal(r.exact, false);
    assert.equal(r.diff, 3);
  });
  t('lata TOMB_LAYERS niemalejące', () => {
    for (let i = 1; i < T.TOMB_LAYERS.length; i++) {
      assert.ok(T.TOMB_LAYERS[i].year >= T.TOMB_LAYERS[i - 1].year, `${T.TOMB_LAYERS[i].id}: ${T.TOMB_LAYERS[i].year}`);
    }
  });
  t('yearsSinceFound(7) === 3', () => {
    assert.equal(T.yearsSinceFound(7), 3);
  });
});

/* --- D) klątwa: nici czasu -------------------------------------------------------------- */

const carter = K.TEAM.find((m) => m.id === 'carter');

group('D) klątwa: nici czasu', () => {
  t('diedWithinCurse() === 1', () => {
    assert.equal(K.diedWithinCurse(), 1);
  });
  t('judgeCurseCount(1) → ok', () => {
    assert.equal(K.judgeCurseCount(1).ok, true);
  });
  t('judgeCurseCount(2) → nie ok', () => {
    assert.equal(K.judgeCurseCount(2).ok, false);
  });
  t('znaleziono Cartera w TEAM', () => {
    assert.ok(carter, 'brak carter w TEAM');
  });
  t('judgeThread(carter, 1939) → ok', () => {
    assert.equal(K.judgeThread(carter, 1939).ok, true);
  });
  t('judgeThread(carter, 1938) → nie ok', () => {
    assert.equal(K.judgeThread(carter, 1938).ok, false);
  });
  t('wszystkie died w (AXIS_FROM, AXIS_TO]', () => {
    for (const m of K.TEAM) assert.ok(m.died > K.AXIS_FROM && m.died <= K.AXIS_TO, `${m.id}: ${m.died}`);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

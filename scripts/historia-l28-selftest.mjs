/**
 * Selftest czystych funkcji L28 (`dziedzictwo-rzymu`: akwedukt + droga + lacina + gra).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l27-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l28-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l28-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as Ak from '${root}/src/app/historia/klasa-4/components/lessons/dziedzictwo-rzymu/akwedukt';\n` +
    `export * as Dr from '${root}/src/app/historia/klasa-4/components/lessons/dziedzictwo-rzymu/droga';\n` +
    `export * as La from '${root}/src/app/historia/klasa-4/components/lessons/dziedzictwo-rzymu/lacina';\n` +
    `export * as Gr from '${root}/src/app/historia/klasa-4/components/lessons/dziedzictwo-rzymu/gra';\n`,
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

const { Ak, Dr, La, Gr } = lib;

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

/* --- A) akwedukt: teren, start, przepływ -------------------------------------- */

/** Prosta linia od źródła do miasta (wysokości liniowe, zaokrąglone). */
const straight = () =>
  Array.from({ length: Ak.NODES }, (_, i) => Math.round(Ak.SPRING + ((Ak.CITY - Ak.SPRING) * i) / (Ak.NODES - 1)));

/** Płasko na 80, potem spadek do miasta. */
const flat80 = () => Array.from({ length: Ak.NODES }, (_, i) => (i === Ak.NODES - 1 ? Ak.CITY : 80));

group('A) akwedukt: teren i przepływ', () => {
  t('terrainAt(0) == 80', () => {
    assert.equal(Ak.terrainAt(0), 80);
  });
  t('terrainAt(1) == 30', () => {
    assert.equal(Ak.terrainAt(1), 30);
  });
  t('terrainAt(0.6) == 5', () => {
    assert.equal(Ak.terrainAt(0.6), 5);
  });
  t('startHeights(): długość NODES', () => {
    assert.equal(Ak.startHeights().length, Ak.NODES);
  });
  t('startHeights(): pierwszy SPRING', () => {
    assert.equal(Ak.startHeights()[0], Ak.SPRING);
  });
  t('startHeights(): ostatni CITY', () => {
    assert.equal(Ak.startHeights()[Ak.NODES - 1], Ak.CITY);
  });
  t('flow(startHeights()) ok false', () => {
    assert.equal(Ak.flow(Ak.startHeights()).ok, false);
  });
  t("flow(startHeights()) reason 'pod-gore'", () => {
    const r = Ak.flow(Ak.startHeights());
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'pod-gore');
  });
  t('prosta linia 80 -> 30: ok true', () => {
    assert.equal(Ak.flow(straight()).ok, true);
  });
  t('prosta linia 80 -> 30: maxBridge <= MAX_BRIDGE', () => {
    const r = Ak.flow(straight());
    assert.equal(r.ok, true);
    assert.ok(r.maxBridge <= Ak.MAX_BRIDGE, `maxBridge ${r.maxBridge} > ${Ak.MAX_BRIDGE}`);
  });
  t('płasko na 80: ok false', () => {
    assert.equal(Ak.flow(flat80()).ok, false);
  });
  t("płasko na 80: reason 'za-wysoki-most'", () => {
    const r = Ak.flow(flat80());
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'za-wysoki-most');
  });
  t("wzrost na odcinku 3: reason 'pod-gore'", () => {
    const h = straight();
    h[4] = h[3] + 6;
    const r = Ak.flow(h);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'pod-gore');
  });
  t('wzrost na odcinku 3: stopAt == 3', () => {
    const h = straight();
    h[4] = h[3] + 6;
    const r = Ak.flow(h);
    assert.equal(r.ok, false);
    assert.equal(r.stopAt, 3);
  });
  t("wzrost na odcinku 0: reason 'pod-gore' i stopAt == 0", () => {
    const h = straight();
    h[1] = h[0] + 5;
    const r = Ak.flow(h);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'pod-gore');
    assert.equal(r.stopAt, 0);
  });
  t('wzrost na odcinku 5: stopAt == 5', () => {
    const h = straight();
    h[6] = h[5] + 6;
    const r = Ak.flow(h);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'pod-gore');
    assert.equal(r.stopAt, 5);
  });
  t('ok true -> tunnelKm > 0', () => {
    const r = Ak.flow(straight());
    assert.equal(r.ok, true);
    assert.ok(r.tunnelKm > 0, `tunnelKm ${r.tunnelKm}`);
  });
  t('ok true -> bridgeKm > 0', () => {
    const r = Ak.flow(straight());
    assert.equal(r.ok, true);
    assert.ok(r.bridgeKm > 0, `bridgeKm ${r.bridgeKm}`);
  });
});

/* --- B) droga: warstwy i kamień milowy ---------------------------------------- */

const ROAD_CASES = [
  { stack: ['kamienie', 'gruz', 'zwir', 'plyty'], failYear: null, label: 'poprawna kolejność' },
  { stack: ['kamienie', 'gruz', 'plyty', 'zwir'], failYear: 3, label: 'miękki wierzch' },
  { stack: ['gruz', 'kamienie', 'zwir', 'plyty'], failYear: 20, label: 'dno nie przepuszcza wody' },
  { stack: ['kamienie', 'zwir', 'gruz', 'plyty'], failYear: 55, label: 'grube na drobnym' },
  { stack: ['plyty', 'gruz', 'zwir', 'kamienie'], failYear: 3, label: 'odwrócona kolejność' },
];

group('B) droga: sędzia warstw', () => {
  for (const c of ROAD_CASES) {
    t(`testRoad [${c.stack}] (${c.label}) failYear === ${c.failYear}`, () => {
      assert.equal(Dr.testRoad(c.stack).failYear, c.failYear);
    });
    t(`testRoad [${c.stack}] problem ${c.failYear === null ? 'null' : 'niepusty'}`, () => {
      const r = Dr.testRoad(c.stack);
      if (c.failYear === null) assert.equal(r.problem, null);
      else assert.ok(typeof r.problem === 'string' && r.problem.length > 0, JSON.stringify(r.problem));
    });
  }
  t('LAYERS ma 4 warstwy', () => {
    assert.equal(Dr.LAYERS.length, 4);
  });
  t('LAYERS ma unikalne id', () => {
    const ids = Dr.LAYERS.map((l) => l.id);
    assert.equal(new Set(ids).size, ids.length);
  });
  t('MILESTONE_MILES == 24', () => {
    assert.equal(Dr.MILESTONE_MILES, 24);
  });
  t("MILESTONE_TEXT zawiera 'XXIV'", () => {
    assert.ok(Dr.MILESTONE_TEXT.includes('XXIV'), Dr.MILESTONE_TEXT);
  });
});

/* --- C) lacina: korzenie i prawo ---------------------------------------------- */

group('C) lacina: korzenie', () => {
  for (const w of La.WORDS) {
    t(`judgeRoot(${w.id}, ${w.id}) ok`, () => {
      assert.deepEqual(La.judgeRoot(w.id, w.id), { ok: true });
    });
  }
  for (const root of La.WORDS) {
    for (const word of La.WORDS) {
      if (root.id === word.id) continue;
      t(`judgeRoot(${root.id}, ${word.id}) ok false z „${root.latin}”`, () => {
        const r = La.judgeRoot(root.id, word.id);
        assert.equal(r.ok, false);
        assert.ok(r.message.includes(root.latin), r.message);
      });
    }
  }
  for (const w of La.WORDS) {
    t(`SENTENCE zawiera {${w.id}} dokładnie raz`, () => {
      assert.equal(La.SENTENCE.split(`{${w.id}}`).length - 1, 1);
    });
  }
});

group('C) lacina: prawo nie działa wstecz', () => {
  t('punishable(RULE_BOUNDARY) zwraca 2 wydarzenia', () => {
    assert.equal(La.punishable(La.RULE_BOUNDARY).length, 2);
  });
  t('punishable(RULE_BOUNDARY) to Zosia i Kuba', () => {
    assert.deepEqual(
      La.punishable(La.RULE_BOUNDARY).map((e) => e.who),
      ['Zosia', 'Kuba'],
    );
  });
  t('punishable(RULE_BOUNDARY) tylko day >= 2', () => {
    assert.ok(La.punishable(La.RULE_BOUNDARY).every((e) => e.day >= 2));
  });
  t('punishable(0) zwraca wszystkie wydarzenia', () => {
    assert.equal(La.punishable(0).length, La.EVENTS.length);
  });
  t('punishable(5) zwraca żadne', () => {
    assert.deepEqual(La.punishable(5), []);
  });
  t('każdy EVENT ma acc', () => {
    assert.ok(La.EVENTS.length > 0, 'brak wydarzeń');
    for (const e of La.EVENTS) assert.ok(typeof e.acc === 'string' && e.acc.length > 0, JSON.stringify(e));
  });
});

/* --- D) gra: spacer po Rzymie -------------------------------------------------- */

const ANACHRONISM_IDS = Gr.THINGS.filter((x) => x.reason !== null).map((x) => x.id);
const FITTING_IDS = Gr.THINGS.filter((x) => x.reason === null).map((x) => x.id);

group('D) gra: rzeczy i stuknięcia', () => {
  t('ANACHRONISMS == 7', () => {
    assert.equal(Gr.ANACHRONISMS, 7);
  });
  t('THINGS mają unikalne id', () => {
    const ids = Gr.THINGS.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length);
  });
  t('THINGS mają rosnące x', () => {
    for (let i = 1; i < Gr.THINGS.length; i++) {
      assert.ok(Gr.THINGS[i].x > Gr.THINGS[i - 1].x, `${Gr.THINGS[i - 1].id}.x=${Gr.THINGS[i - 1].x}, ${Gr.THINGS[i].id}.x=${Gr.THINGS[i].x}`);
    }
  });
  for (const id of FITTING_IDS) {
    t(`tapThing(${id}) kind 'pasuje'`, () => {
      const r = Gr.tapThing(id);
      assert.equal(r.kind, 'pasuje');
    });
  }
  for (const id of ANACHRONISM_IDS) {
    t(`tapThing(${id}) kind 'anachronizm'`, () => {
      const r = Gr.tapThing(id);
      assert.equal(r.kind, 'anachronizm');
    });
  }
});

group('D) gra: powody', () => {
  t("judgeReason('koloseum', 'pozniej') ok", () => {
    assert.equal(Gr.judgeReason('koloseum', 'pozniej').ok, true);
  });
  t("judgeReason('pomidory', 'ameryka') ok", () => {
    assert.equal(Gr.judgeReason('pomidory', 'ameryka').ok, true);
  });
  t("judgeReason('strzemiona', 'sredniowiecze') ok", () => {
    assert.equal(Gr.judgeReason('strzemiona', 'sredniowiecze').ok, true);
  });
  t("judgeReason('szyby', 'biedni') ok", () => {
    assert.equal(Gr.judgeReason('szyby', 'biedni').ok, true);
  });
  t("judgeReason('koloseum', 'ameryka') ok false z 'Koloseum'", () => {
    const r = Gr.judgeReason('koloseum', 'ameryka');
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('Koloseum'), r.message);
  });
  for (const thing of Gr.THINGS.filter((x) => x.reason !== null)) {
    t(`${thing.id}: dokładnie jeden powód z REASONS daje ok`, () => {
      const good = Gr.REASONS.filter((r) => Gr.judgeReason(thing.id, r.id).ok);
      assert.equal(good.length, 1, `ok dla: ${good.map((g) => g.id).join(', ')}`);
      assert.equal(good[0].id, thing.reason);
    });
  }
  t('GOOD ma 4 kafelki', () => {
    assert.equal(Gr.GOOD.length, 4);
  });
  t('BAD ma 4 kafelki', () => {
    assert.equal(Gr.BAD.length, 4);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

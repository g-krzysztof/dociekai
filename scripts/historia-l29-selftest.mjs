/**
 * Selftest czystych funkcji L29 (`judaizm-i-nauczanie-jezusa`: palestyna + bogowie + tablice + samarytanin).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l28-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l29-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l29-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as Pal from '${root}/src/app/historia/klasa-4/components/lessons/judaizm-i-nauczanie-jezusa/palestyna';\n` +
    `export * as Geo from '${root}/src/app/historia/klasa-4/components/lessons/judaizm-i-nauczanie-jezusa/geo-palestyna';\n` +
    `export * as Bog from '${root}/src/app/historia/klasa-4/components/lessons/judaizm-i-nauczanie-jezusa/bogowie';\n` +
    `export * as Tab from '${root}/src/app/historia/klasa-4/components/lessons/judaizm-i-nauczanie-jezusa/tablice';\n` +
    `export * as Sam from '${root}/src/app/historia/klasa-4/components/lessons/judaizm-i-nauczanie-jezusa/samarytanin';\n`,
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

const { Pal, Geo, Bog, Tab, Sam } = lib;

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

/* --- A) palestyna: sędzia miejsc -------------------------------------------- */

group('A) palestyna: trafienie w punkt', () => {
  for (const step of Pal.PLACE_STEPS) {
    t(`judgePlace(${step.id}, prawda) ok true`, () => {
      assert.deepEqual(Pal.judgePlace(step, Geo.PAL_PLACES[step.id]), { ok: true });
    });
  }
  for (const step of Pal.PLACE_STEPS) {
    t(`judgePlace(${step.id}, +0.5·tol) ok true`, () => {
      const truth = Geo.PAL_PLACES[step.id];
      const dx = (step.tolKm / Geo.PAL_KM_PER_PX) * 0.5;
      assert.equal(Pal.judgePlace(step, [truth[0] + dx, truth[1]]).ok, true);
    });
  }
  for (const step of Pal.PLACE_STEPS) {
    t(`judgePlace(${step.id}, +3·tol) ok false`, () => {
      const truth = Geo.PAL_PLACES[step.id];
      const dx = (3 * step.tolKm) / Geo.PAL_KM_PER_PX;
      assert.equal(Pal.judgePlace(step, [truth[0] + dx, truth[1]]).ok, false);
    });
    t(`judgePlace(${step.id}, +3·tol) message zawiera expected`, () => {
      const truth = Geo.PAL_PLACES[step.id];
      const dx = (3 * step.tolKm) / Geo.PAL_KM_PER_PX;
      const r = Pal.judgePlace(step, [truth[0] + dx, truth[1]]);
      assert.equal(r.ok, false);
      assert.ok(r.message.includes(step.expected), r.message);
    });
  }
});

group('A) palestyna: Betlejem na północ od Jerozolimy', () => {
  const jer = Geo.PAL_PLACES.jerozolima;
  const at = [jer[0], jer[1] - 8 / Geo.PAL_KM_PER_PX];
  const step = Pal.PLACE_STEPS.find((s) => s.id === 'betlejem');
  t('Betlejem 8 km na północ od Jerozolimy: ok false', () => {
    assert.equal(Pal.judgePlace(step, at).ok, false);
  });
  t('Betlejem 8 km na północ od Jerozolimy: message zawiera „na północ od Jerozolimy”', () => {
    const r = Pal.judgePlace(step, at);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('na północ od Jerozolimy'), r.message);
  });
});

group('A) palestyna: kierunki', () => {
  t("direction([0,0],[10,0]) === 'wschód'", () => {
    assert.equal(Pal.direction([0, 0], [10, 0]), 'wschód');
  });
  t("direction([0,0],[0,-10]) === 'północ'", () => {
    assert.equal(Pal.direction([0, 0], [0, -10]), 'północ');
  });
  t("direction([0,0],[0,10]) === 'południe'", () => {
    assert.equal(Pal.direction([0, 0], [0, 10]), 'południe');
  });
  t("direction([0,0],[-10,10]) === 'południowy zachód'", () => {
    assert.equal(Pal.direction([0, 0], [-10, 10]), 'południowy zachód');
  });
  t("direction(kafarnaum, nazaret) === 'południowy zachód'", () => {
    assert.equal(Pal.direction(Geo.PAL_PLACES.kafarnaum, Geo.PAL_PLACES.nazaret), 'południowy zachód');
  });
});

group('A) palestyna: odległości i jezioro', () => {
  t('km(jerozolima, betlejem) między 6 i 11', () => {
    const d = Pal.km(Geo.PAL_PLACES.jerozolima, Geo.PAL_PLACES.betlejem);
    assert.ok(d > 6 && d < 11, `km = ${d}`);
  });
  t('km(kafarnaum, nazaret) między 25 i 40', () => {
    const d = Pal.km(Geo.PAL_PLACES.kafarnaum, Geo.PAL_PLACES.nazaret);
    assert.ok(d > 25 && d < 40, `km = ${d}`);
  });
  t("judgeLake('galilea') ok true", () => {
    assert.deepEqual(Pal.judgeLake('galilea'), { ok: true });
  });
  t("judgeLake('martwe') ok false", () => {
    assert.equal(Pal.judgeLake('martwe').ok, false);
  });
  for (const id of Object.keys(Geo.PAL_PLACES)) {
    t(`${id} w granicach PAL_VIEW`, () => {
      const [x, y] = Geo.PAL_PLACES[id];
      assert.ok(x >= 0 && x <= Geo.PAL_VIEW.w, `x = ${x}`);
      assert.ok(y >= 0 && y <= Geo.PAL_VIEW.h, `y = ${y}`);
    });
  }
});

/* --- B) bogowie: sprawy do bogów -------------------------------------------- */

group('B) bogowie: dobra sprawa do dobrego boga', () => {
  for (const m of Bog.MATTERS) {
    t(`judgeMarek(${m.id}, ${m.god}) ok`, () => {
      assert.equal(Bog.judgeMarek(m.id, m.god).ok, true);
    });
  }
  for (const m of Bog.MATTERS) {
    for (const g of Bog.GODS) {
      if (g.id === m.god) continue;
      t(`judgeMarek(${m.id}, ${g.id}) ok false z „${g.care}”`, () => {
        const r = Bog.judgeMarek(m.id, g.id);
        assert.equal(r.ok, false);
        assert.ok(r.message.includes(g.care), r.message);
      });
    }
  }
});

group('B) bogowie: pokrycie i cesarz', () => {
  t('każdy bóg jest celem dokładnie jednej sprawy', () => {
    for (const g of Bog.GODS) {
      assert.equal(
        Bog.MATTERS.filter((m) => m.god === g.id).length,
        1,
        `bóg ${g.id}`,
      );
    }
  });
  t("addressees({a:'x',b:'x',c:'y'}) === 2", () => {
    assert.equal(Bog.addressees({ a: 'x', b: 'x', c: 'y' }), 2);
  });
  t('EMPEROR_REPLY ma klucze marek i juda', () => {
    assert.ok(typeof Bog.EMPEROR_REPLY.marek === 'string' && Bog.EMPEROR_REPLY.marek.length > 0, 'brak marek');
    assert.ok(typeof Bog.EMPEROR_REPLY.juda === 'string' && Bog.EMPEROR_REPLY.juda.length > 0, 'brak juda');
  });
});

/* --- C) tablice: przykazania i przepisy ------------------------------------- */

group('C) tablice: podział przykazań', () => {
  t('dokładnie 10 przykazań', () => {
    assert.equal(Tab.COMMANDMENTS.length, 10);
  });
  t("3 przykazania na tablicy 'bog'", () => {
    assert.equal(Tab.COMMANDMENTS.filter((c) => c.tablet === 'bog').length, 3);
  });
  t("7 przykazań na tablicy 'ludzie'", () => {
    assert.equal(Tab.COMMANDMENTS.filter((c) => c.tablet === 'ludzie').length, 7);
  });
  for (const c of Tab.COMMANDMENTS) {
    t(`judgeTablet(${c.id}, ${c.tablet}) ok`, () => {
      assert.deepEqual(Tab.judgeTablet(c.id, c.tablet), { ok: true });
    });
  }
  for (const c of Tab.COMMANDMENTS) {
    const other = c.tablet === 'bog' ? 'ludzie' : 'bog';
    t(`judgeTablet(${c.id}, ${other}) ok false`, () => {
      assert.equal(Tab.judgeTablet(c.id, other).ok, false);
    });
  }
});

group('C) tablice: przepisy i spójność', () => {
  for (const l of Tab.LAWS) {
    t(`judgeLaw(${l.id}, ${l.commandment}) ok`, () => {
      assert.deepEqual(Tab.judgeLaw(l.id, l.commandment), { ok: true });
    });
  }
  for (const l of Tab.LAWS) {
    const other = Tab.COMMANDMENTS.find((c) => c.id !== l.commandment).id;
    t(`judgeLaw(${l.id}, ${other}) ok false`, () => {
      assert.equal(Tab.judgeLaw(l.id, other).ok, false);
    });
  }
  t('lawsPerTablet() deep-równe {bog:0, ludzie:4}', () => {
    assert.deepEqual(Tab.lawsPerTablet(), { bog: 0, ludzie: 4 });
  });
  t('id przykazań unikalne', () => {
    const ids = Tab.COMMANDMENTS.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

/* --- D) samarytanin: zakład, bliźni, krąg ----------------------------------- */

group('D) samarytanin: pomocny, bliźni i krąg', () => {
  t('dokładnie jeden WALKER ma helps === true', () => {
    assert.equal(Sam.WALKERS.filter((w) => w.helps).length, 1);
  });
  t("tym pomocnym jest 'samarytanin'", () => {
    assert.equal(Sam.WALKERS.find((w) => w.helps).id, 'samarytanin');
  });
  t("judgeNeighbour('samarytanin') ok true", () => {
    assert.deepEqual(Sam.judgeNeighbour('samarytanin'), { ok: true });
  });
  for (const w of Sam.WALKERS.filter((x) => !x.helps)) {
    t(`judgeNeighbour('${w.id}') ok false`, () => {
      assert.equal(Sam.judgeNeighbour(w.id).ok, false);
    });
  }
  for (const w of Sam.WALKERS) {
    t(`betVerdict('${w.id}') niepusty string`, () => {
      const s = Sam.betVerdict(w.id);
      assert.ok(typeof s === 'string' && s.length > 0, JSON.stringify(s));
    });
  }
  t("leftOut(new Set(['mama'])).length === CIRCLE_PEOPLE.length - 1", () => {
    assert.equal(Sam.leftOut(new Set(['mama'])).length, Sam.CIRCLE_PEOPLE.length - 1);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

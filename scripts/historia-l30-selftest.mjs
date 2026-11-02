/**
 * Selftest czystych funkcji L30 (`od-katakumb-do-religii-panujacej`:
 * pawel + gmina + pliniusz + rachuba).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l29-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l30-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l30-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as Paw from '${root}/src/app/historia/klasa-4/components/lessons/od-katakumb-do-religii-panujacej/pawel';\n` +
    `export * as Gm from '${root}/src/app/historia/klasa-4/components/lessons/od-katakumb-do-religii-panujacej/gmina';\n` +
    `export * as Pl from '${root}/src/app/historia/klasa-4/components/lessons/od-katakumb-do-religii-panujacej/pliniusz';\n` +
    `export * as Ra from '${root}/src/app/historia/klasa-4/components/lessons/od-katakumb-do-religii-panujacej/rachuba';\n`,
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

const { Paw, Gm, Pl, Ra } = lib;

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

/* --- A) pawel: rzut, miasta, sędzia stuknięcia ------------------------------- */

group('A) pawel: rzut i miasta', () => {
  t('medXY(23.73,37.98)[0] ≈ 389.2 (Ateny)', () => {
    assert.ok(Math.abs(Paw.medXY(23.73, 37.98)[0] - 389.2) < 0.05, String(Paw.medXY(23.73, 37.98)));
  });
  t('medXY(23.73,37.98)[1] ≈ 282.0 (Ateny)', () => {
    assert.ok(Math.abs(Paw.medXY(23.73, 37.98)[1] - 282.0) < 0.05, String(Paw.medXY(23.73, 37.98)));
  });
  t('id miast w CITIES unikalne', () => {
    const ids = Paw.CITIES.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
  });
  t('każdy krok każdej podróży ma `to` istniejące w CITIES', () => {
    const known = new Set(Paw.CITIES.map((c) => c.id));
    for (const j of Paw.JOURNEYS) {
      for (const s of j.steps) {
        assert.ok(known.has(s.to), `podróż ${j.id}: brak miasta ${s.to}`);
      }
    }
  });
});

group('A) pawel: judgeTap', () => {
  for (const j of Paw.JOURNEYS) {
    for (const s of j.steps) {
      t(`judgeTap(${j.id} → ${s.to}, to samo) ok`, () => {
        assert.deepEqual(Paw.judgeTap(s, s.to, []), { ok: true });
      });
    }
  }
  for (const j of Paw.JOURNEYS) {
    for (const s of j.steps) {
      t(`judgeTap(${j.id} → ${s.to}, inne miasto) ok:false + nazwa oczekiwanego`, () => {
        const other = Paw.CITIES.find((c) => c.id !== s.to).id;
        const r = Paw.judgeTap(s, other, []);
        assert.equal(r.ok, false);
        assert.ok(r.message.includes(Paw.getCity(s.to).name), r.message);
      });
    }
  }
  for (const j of Paw.JOURNEYS) {
    t(`judgeTap(${j.id}: start już odwiedzony) message zawiera „już był”`, () => {
      const s = j.steps[0];
      assert.notEqual(j.start, s.to);
      const r = Paw.judgeTap(s, j.start, [j.start]);
      assert.equal(r.ok, false);
      assert.ok(r.message.includes('już był'), r.message);
    });
  }
});

/* --- B) pawel: gminy, listy, szlaki ------------------------------------------ */

group('B) pawel: gminy', () => {
  t('gminyAfter(0,0) to dokładnie OLD_GMINY', () => {
    assert.deepEqual(Paw.gminyAfter(0, 0), [...Paw.OLD_GMINY]);
  });
  t('gminyAfter(3, len) zawiera korynt, filippi, efez, puteoli', () => {
    const g = Paw.gminyAfter(3, Paw.JOURNEYS[3].steps.length);
    for (const id of ['korynt', 'filippi', 'efez', 'puteoli']) {
      assert.ok(g.includes(id), `brak ${id} w [${g}]`);
    }
  });
  t('gminyAfter(3, len) nie zawiera krety, malty, syrakuz', () => {
    const g = Paw.gminyAfter(3, Paw.JOURNEYS[3].steps.length);
    for (const id of ['kreta', 'malta', 'syrakuzy']) {
      assert.ok(!g.includes(id), `jest ${id} w [${g}]`);
    }
  });
});

group('B) pawel: listy', () => {
  for (const l of Paw.LETTERS) {
    t(`judgeLetter(${l.id}, ${l.to}) ok`, () => {
      assert.deepEqual(Paw.judgeLetter(l.id, l.to), { ok: true });
    });
  }
  for (const l of Paw.LETTERS) {
    t(`judgeLetter(${l.id}, inne) ok:false z dopełniaczem ${Paw.getCity(l.to).gen}`, () => {
      const r = Paw.judgeLetter(l.id, 'antiochia');
      assert.equal(r.ok, false);
      assert.ok(r.message.includes(Paw.getCity(l.to).gen), r.message);
    });
  }
});

group('B) pawel: szlaki', () => {
  for (const rt of Paw.ROUTES) {
    t(`judgeRoute(${rt.id}) ok === toRome (${rt.toRome})`, () => {
      assert.equal(Paw.judgeRoute(rt.id).ok, rt.toRome);
    });
  }
  for (const id of Paw.PAUL_GMINY) {
    t(`onTradeRoute(${id}) true`, () => {
      assert.equal(Paw.onTradeRoute(id), true);
    });
  }
});

/* --- C) gmina: zdania-powody -------------------------------------------------- */

group('C) gmina: zdania', () => {
  for (const p of Gm.PEOPLE) {
    t(`${p.id} ma dokładnie jedno zdanie z reason`, () => {
      assert.equal(p.sentences.filter((s) => s.reason).length, 1, p.id);
    });
  }
  for (const p of Gm.PEOPLE) {
    t(`judgeSentence(${p.id}, zdanie-powód) ok + reason`, () => {
      const s = p.sentences.find((x) => x.reason);
      assert.deepEqual(Gm.judgeSentence(p.id, s.id), { ok: true, reason: s.reason });
    });
  }
  for (const p of Gm.PEOPLE) {
    for (const s of p.sentences.filter((x) => !x.reason)) {
      t(`judgeSentence(${p.id}, ${s.id}) ok:false z niepustym message`, () => {
        const r = Gm.judgeSentence(p.id, s.id);
        assert.equal(r.ok, false);
        assert.ok(typeof r.message === 'string' && r.message.length > 0, JSON.stringify(r));
      });
    }
  }
  t('tally po pełnym found sumuje się do 5 osób', () => {
    const found = {};
    for (const p of Gm.PEOPLE) {
      found[p.id] = p.sentences.find((x) => x.reason).reason;
    }
    const sum = Gm.tally(found).reduce((acc, g) => acc + g.who.length, 0);
    assert.equal(sum, 5);
  });
});

/* --- D) pliniusz: paszport i ryba -------------------------------------------- */

group('D) pliniusz: paszport', () => {
  for (const f of Pl.PLINIUSZ_FIELDS) {
    t(`pole ${f.id} ma dokładnie jedną kartę w banku`, () => {
      assert.equal(Pl.PLINIUSZ_BANK.filter((c) => c.field === f.id).length, 1, f.id);
    });
  }
  for (const c of Pl.PLINIUSZ_BANK.filter((x) => x.field === null)) {
    t(`dystraktor ${c.id} ma whyNot`, () => {
      assert.ok(typeof c.whyNot === 'string' && c.whyNot.length > 0, c.id);
    });
  }
});

group('D) pliniusz: ryba i pociągnięcie', () => {
  t('ICHTHYS: litery złączone dają ΙΧΘΥΣ (U+0399,03A7,0398,03A5,03A3)', () => {
    const joined = Pl.ICHTHYS.map((l) => l.letter).join('');
    assert.deepEqual(
      [...joined].map((ch) => ch.codePointAt(0)),
      [0x399, 0x3a7, 0x398, 0x3a5, 0x3a3],
    );
  });
  t('pulled(PULL_PX) true', () => {
    assert.equal(Pl.pulled(Pl.PULL_PX), true);
  });
  t('pulled(PULL_PX-1) false', () => {
    assert.equal(Pl.pulled(Pl.PULL_PX - 1), false);
  });
});

/* --- E) rachuba: lata od zera ------------------------------------------------- */

group('E) rachuba: yearCountedFrom', () => {
  t('yearCountedFrom(-753, 2026) === 2779', () => {
    assert.equal(Ra.yearCountedFrom(-753, 2026), 2779);
  });
  t('yearCountedFrom(-753, 313) === 1066', () => {
    assert.equal(Ra.yearCountedFrom(-753, 313), 1066);
  });
  t('yearCountedFrom(1, 2026) === 2026', () => {
    assert.equal(Ra.yearCountedFrom(1, 2026), 2026);
  });
  t('yearCountedFrom(1, -1) === 0', () => {
    assert.equal(Ra.yearCountedFrom(1, -1), 0);
  });
});

group('E) rachuba: describe i snapZero', () => {
  t("describe(1, -753) === '753 lata przed początkiem'", () => {
    assert.equal(Ra.describe(1, -753), '753 lata przed początkiem');
  });
  t("describe(1, -5) === '5 lat przed początkiem'", () => {
    assert.equal(Ra.describe(1, -5), '5 lat przed początkiem');
  });
  t("describe(1, -1) === '1 rok przed początkiem'", () => {
    assert.equal(Ra.describe(1, -1), '1 rok przed początkiem');
  });
  t("snapZero(rulerU(-753), …).id === 'rzym'", () => {
    assert.equal(Ra.snapZero(Ra.rulerU(-753), Ra.rulerEvents(2026)).id, 'rzym');
  });
  t("snapZero(1, …).id === 'polska' (bo 'dzis' nie jest zero)", () => {
    assert.equal(Ra.snapZero(1, Ra.rulerEvents(2026)).id, 'polska');
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

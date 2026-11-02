/**
 * Selftest czystych funkcji L32 (`wykopalisko-roku`: warstwy + zdania + pinezki).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l31-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l32-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l32-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as Wa from '${root}/src/app/historia/klasa-4/components/lessons/wykopalisko-roku/warstwy';\n` +
    `export * as Zd from '${root}/src/app/historia/klasa-4/components/lessons/wykopalisko-roku/zdania-roku';\n` +
    `export * as Pi from '${root}/src/app/historia/klasa-4/lib/timeline/pins';\n`,
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

const { Wa, Zd, Pi } = lib;

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

/* --- A) warstwy: LAYERS ---------------------------------------------------- */

group('A) warstwy: LAYERS', () => {
  t('LAYERS ma 6 warstw', () => {
    assert.equal(Wa.LAYERS.length, 6);
  });
  t('id warstw unikalne', () => {
    const ids = Wa.LAYERS.map((l) => l.id);
    assert.equal(new Set(ids).size, ids.length);
  });
  t('kolejność id: rzym, grecja, egipt, mezopotamia, neolit, pradzieje', () => {
    assert.deepEqual(
      Wa.LAYERS.map((l) => l.id),
      ['rzym', 'grecja', 'egipt', 'mezopotamia', 'neolit', 'pradzieje'],
    );
  });
  for (const l of Wa.LAYERS) {
    t(`${l.id}: era/when/soil/find/from niepuste`, () => {
      assert.ok(typeof l.era === 'string' && l.era.length > 0, JSON.stringify(l));
      assert.ok(typeof l.when === 'string' && l.when.length > 0, JSON.stringify(l));
      assert.ok(typeof l.soil === 'string' && l.soil.length > 0, JSON.stringify(l));
      assert.ok(typeof l.find === 'string' && l.find.length > 0, JSON.stringify(l));
      assert.ok(typeof l.from === 'string' && l.from.length > 0, JSON.stringify(l));
    });
  }
});

/* --- B) warstwy: judgeChannel (akwedukt L28) -------------------------------- */

group('B) judgeChannel', () => {
  t('judgeChannel(70, 50) ok', () => {
    assert.deepEqual(Wa.judgeChannel(70, 50), { ok: true });
  });
  t('judgeChannel(85, 50) ok:false (powyżej źródła)', () => {
    assert.equal(Wa.judgeChannel(85, 50).ok, false);
  });
  t("judgeChannel(85, 50).message zawiera '85'", () => {
    const r = Wa.judgeChannel(85, 50);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('85'), r.message);
  });
  t('judgeChannel(50, 60) ok:false (pod górę)', () => {
    assert.equal(Wa.judgeChannel(50, 60).ok, false);
  });
  t('judgeChannel(70, 25) ok:false (poniżej miasta)', () => {
    assert.equal(Wa.judgeChannel(70, 25).ok, false);
  });
  t('judgeChannel(79, 31) ok', () => {
    assert.deepEqual(Wa.judgeChannel(79, 31), { ok: true });
  });
  t('judgeChannel(80, 50) ok:false (równo ze źródłem)', () => {
    assert.equal(Wa.judgeChannel(80, 50).ok, false);
  });
  t('judgeChannel(70, 30) ok:false (równo z miastem)', () => {
    assert.equal(Wa.judgeChannel(70, 30).ok, false);
  });
});

/* --- C) warstwy: judgeVoters (Ateny L23) ------------------------------------- */

group('C) judgeVoters', () => {
  t("judgeVoters(['kleon','nikias']) ok", () => {
    assert.deepEqual(Wa.judgeVoters(['kleon', 'nikias']), { ok: true });
  });
  t("judgeVoters(['kleon','nikias','aspazja']) ok:false", () => {
    assert.equal(Wa.judgeVoters(['kleon', 'nikias', 'aspazja']).ok, false);
  });
  t("judgeVoters z 'aspazja': message zawiera 'kobietą'", () => {
    const r = Wa.judgeVoters(['kleon', 'nikias', 'aspazja']);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('kobietą'), r.message);
  });
  t("judgeVoters(['kleon','nikias','manes']) ok:false", () => {
    assert.equal(Wa.judgeVoters(['kleon', 'nikias', 'manes']).ok, false);
  });
  t("judgeVoters z 'manes': message zawiera 'obywatelem'", () => {
    const r = Wa.judgeVoters(['kleon', 'nikias', 'manes']);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('obywatelem'), r.message);
  });
  t("judgeVoters(['kleon','nikias','filip']) ok:false", () => {
    assert.equal(Wa.judgeVoters(['kleon', 'nikias', 'filip']).ok, false);
  });
  t("judgeVoters z 'filip': message zawiera 'dzieckiem'", () => {
    const r = Wa.judgeVoters(['kleon', 'nikias', 'filip']);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('dzieckiem'), r.message);
  });
  t("judgeVoters(['kleon']) ok:false (brakuje Nikiasa)", () => {
    assert.equal(Wa.judgeVoters(['kleon']).ok, false);
  });
  t("judgeVoters(['kleon']).message zawiera 'Nikias'", () => {
    const r = Wa.judgeVoters(['kleon']);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('Nikias'), r.message);
  });
  for (const p of Wa.ATHENIANS) {
    t(`canVote(${p.id}) zgodne z (man && adult && citizen)`, () => {
      assert.equal(Wa.canVote(p), p.man && p.adult && p.citizen);
    });
  }
});

/* --- D) warstwy: judgeSow (Egipt L19) --------------------------------------- */

group('D) judgeSow', () => {
  t("judgeSow('peret') ok", () => {
    assert.deepEqual(Wa.judgeSow('peret'), { ok: true });
  });
  t("judgeSow('achet') ok:false", () => {
    assert.equal(Wa.judgeSow('achet').ok, false);
  });
  t("judgeSow('szemu') ok:false", () => {
    assert.equal(Wa.judgeSow('szemu').ok, false);
  });
});

/* --- E) warstwy: judgeTablet (klinowe L18) ----------------------------------- */

group('E) judgeTablet', () => {
  t('judgeTablet([10,10,1,1,1]) ok', () => {
    assert.deepEqual(Wa.judgeTablet([10, 10, 1, 1, 1]), { ok: true });
  });
  t('judgeTablet([10,1,10,1,1]) ok:false (zła kolejność)', () => {
    assert.equal(Wa.judgeTablet([10, 1, 10, 1, 1]).ok, false);
  });
  t("judgeTablet([10,1,10,1,1]).message zawiera 'dziesiątek'", () => {
    const r = Wa.judgeTablet([10, 1, 10, 1, 1]);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('dziesiątek'), r.message);
  });
  t('judgeTablet([10,10,1,1]) ok:false (zła suma)', () => {
    assert.equal(Wa.judgeTablet([10, 10, 1, 1]).ok, false);
  });
  t("judgeTablet([10,10,1,1]).message zawiera '22'", () => {
    const r = Wa.judgeTablet([10, 10, 1, 1]);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('22'), r.message);
  });
  t('judgeTablet([]) ok:false', () => {
    assert.equal(Wa.judgeTablet([]).ok, false);
  });
});

/* --- F) warstwy: judgeFarm + judgeCamp (L16, L15) ---------------------------- */

group('F) judgeFarm + judgeCamp', () => {
  t("judgeFarm(['karczuj','siej','zbieraj','miel']) ok", () => {
    assert.deepEqual(Wa.judgeFarm(['karczuj', 'siej', 'zbieraj', 'miel']), { ok: true });
  });
  t("judgeFarm(['siej','karczuj','zbieraj','miel']) ok:false", () => {
    assert.equal(Wa.judgeFarm(['siej', 'karczuj', 'zbieraj', 'miel']).ok, false);
  });
  t('judgeCamp(HERD_WENT) ok', () => {
    assert.deepEqual(Wa.judgeCamp(Wa.HERD_WENT), { ok: true });
  });
  for (const pl of Wa.PLACES.filter((p) => p.id !== Wa.HERD_WENT)) {
    t(`judgeCamp('${pl.id}') ok:false`, () => {
      const r = Wa.judgeCamp(pl.id);
      assert.equal(r.ok, false);
      assert.ok(typeof r.message === 'string' && r.message.length > 0, JSON.stringify(r));
    });
  }
});

/* --- G) zdania roku ---------------------------------------------------------- */

group('G) ZDANIA_ROKU', () => {
  t('ZDANIA_ROKU ma 31 wpisów', () => {
    assert.equal(Zd.ZDANIA_ROKU.length, 31);
  });
  t('lesson 1..31 rosnąco bez dziur', () => {
    assert.deepEqual(
      Zd.ZDANIA_ROKU.map((z) => z.lesson),
      Array.from({ length: 31 }, (_, i) => i + 1),
    );
  });
  for (const z of Zd.ZDANIA_ROKU) {
    t(`L${z.lesson}: text niepuste i bez '*'`, () => {
      assert.ok(typeof z.text === 'string' && z.text.length > 0, JSON.stringify(z));
      assert.ok(!z.text.includes('*'), z.text);
    });
    t(`L${z.lesson}: slug bez '/' i title niepuste`, () => {
      assert.ok(typeof z.slug === 'string' && z.slug.length > 0, z.slug);
      assert.ok(!z.slug.includes('/'), z.slug);
      assert.ok(typeof z.title === 'string' && z.title.length > 0, JSON.stringify(z));
    });
  }
});

/* --- H) pinezki: wykopalisko dopina moduły 4–8 -------------------------------- */

const WYKOP = 'podsumowanie/wykopalisko-roku';
const OLD_MODULES = [
  'poczatki-cywilizacji/',
  'starozytny-egipt/',
  'starozytna-grecja/',
  'starozytny-rzym/',
  'narodziny-chrzescijanstwa/',
];
const hasWykop = (p) => p.from.some((f) => f.lesson === WYKOP && f.block === 'os');

group('H) CORE_PINS + wykopalisko', () => {
  for (const p of Pi.CORE_PINS.filter(
    (p) => !p.extension && p.from.some((f) => OLD_MODULES.some((m) => f.lesson.startsWith(m))),
  )) {
    t(`pinezka '${p.id}' ma from { lesson: '${WYKOP}', block: 'os' }`, () => {
      assert.ok(hasWykop(p), JSON.stringify(p.from));
    });
  }
  for (const p of Pi.CORE_PINS.filter((p) => p.extension)) {
    t(`extension '${p.id}' NIE ma wpisu wykopaliska`, () => {
      assert.ok(!hasWykop(p), JSON.stringify(p.from));
    });
  }
  t("pinezka 'grunwald' NIE ma wpisu wykopaliska", () => {
    const p = Pi.getCorePin('grunwald');
    assert.ok(!hasWykop(p), JSON.stringify(p.from));
  });
  t("pinezka 'konstytucja' NIE ma wpisu wykopaliska", () => {
    const p = Pi.getCorePin('konstytucja');
    assert.ok(!hasWykop(p), JSON.stringify(p.from));
  });
  t('żadna pinezka z modułów 1–3 nie ma wpisu wykopaliska', () => {
    const mods13 = ['warsztat-historyka/', 'czas-i-miejsce/', 'mala-i-duza-ojczyzna/'];
    const only13 = Pi.CORE_PINS.filter((p) =>
      p.from.every((f) => mods13.some((m) => f.lesson.startsWith(m))),
    );
    assert.ok(only13.length > 0, 'brak pinezek z modułów 1–3');
    for (const p of only13) {
      assert.ok(!hasWykop(p), `${p.id}: ${JSON.stringify(p.from)}`);
    }
  });
  t("isPinEarned(pismo, { wykopalisko: { completed: ['os'] } }) === true", () => {
    assert.equal(
      Pi.isPinEarned(Pi.getCorePin('pismo'), { [WYKOP]: { completed: ['os'], total: 4 } }),
      true,
    );
  });
  t("isPinEarned(pismo, { wykopalisko: { completed: [] } }) === false", () => {
    assert.equal(
      Pi.isPinEarned(Pi.getCorePin('pismo'), { [WYKOP]: { completed: [], total: 4 } }),
      false,
    );
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

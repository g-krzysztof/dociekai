/**
 * Selftest czystych funkcji L25 (`teatr-igrzyska-filozofia`: akustyka + maski + skok + sokrates).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l24-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l25-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l25-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as Ak from '${root}/src/app/historia/klasa-4/components/lessons/teatr-igrzyska-filozofia/akustyka';\n` +
    `export * as Mk from '${root}/src/app/historia/klasa-4/components/lessons/teatr-igrzyska-filozofia/maski';\n` +
    `export * as Sk from '${root}/src/app/historia/klasa-4/components/lessons/teatr-igrzyska-filozofia/skok';\n` +
    `export * as So from '${root}/src/app/historia/klasa-4/components/lessons/teatr-igrzyska-filozofia/sokrates';\n`,
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

const { Ak, Mk, Sk, So } = lib;

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

/* --- A) akustyka ---------------------------------------------------------------- */

group('A) akustyka', () => {
  t('clarity(1, zbocze) == 1', () => {
    assert.equal(Ak.clarity(1, 'zbocze'), 1);
  });
  t('clarity(ROWS, zbocze) >= 0.7', () => {
    const c = Ak.clarity(Ak.ROWS, 'zbocze');
    assert.ok(c >= 0.7, `clarity=${c}`);
  });
  t('clarity(ROWS, pole) <= 0.2', () => {
    const c = Ak.clarity(Ak.ROWS, 'pole');
    assert.ok(c <= 0.2, `clarity=${c}`);
  });
  t('clarity w [0.03, 1] dla wszystkich rzędów 1..ROWS na zboczu', () => {
    for (let r = 1; r <= Ak.ROWS; r++) {
      const c = Ak.clarity(r, 'zbocze');
      assert.ok(c >= 0.03 && c <= 1, `rząd ${r}: clarity=${c}`);
    }
  });
  t('clarity w [0.03, 1] dla wszystkich rzędów 1..ROWS na polu', () => {
    for (let r = 1; r <= Ak.ROWS; r++) {
      const c = Ak.clarity(r, 'pole');
      assert.ok(c >= 0.03 && c <= 1, `rząd ${r}: clarity=${c}`);
    }
  });
  t('na zboczu clarity maleje (nie rośnie) z rzędem', () => {
    for (let r = 1; r < Ak.ROWS; r++) {
      const a = Ak.clarity(r, 'zbocze');
      const b = Ak.clarity(r + 1, 'zbocze');
      assert.ok(b <= a, `rząd ${r}→${r + 1}: ${a}→${b}`);
    }
  });
  t('na polu clarity maleje (nie rośnie) z rzędem', () => {
    for (let r = 1; r < Ak.ROWS; r++) {
      const a = Ak.clarity(r, 'pole');
      const b = Ak.clarity(r + 1, 'pole');
      assert.ok(b <= a, `rząd ${r}→${r + 1}: ${a}→${b}`);
    }
  });
  t('dla każdego rzędu >= 2 zbocze > pole', () => {
    for (let r = 2; r <= Ak.ROWS; r++) {
      const z = Ak.clarity(r, 'zbocze');
      const p = Ak.clarity(r, 'pole');
      assert.ok(z > p, `rząd ${r}: zbocze=${z} pole=${p}`);
    }
  });
  t('heardWords(LINE, 1): wszystkie słowa heard', () => {
    const ws = Ak.heardWords(Ak.LINE, 1);
    assert.ok(ws.length > 0, 'pusta kwestia?');
    for (const w of ws) assert.equal(w.heard, true, w.word);
  });
  t('heardWords(LINE, 0): żadne słowo heard', () => {
    const ws = Ak.heardWords(Ak.LINE, 0);
    assert.ok(ws.length > 0, 'pusta kwestia?');
    for (const w of ws) assert.equal(w.heard, false, w.word);
  });
  t('heardWords deterministyczne (c = 0.5)', () => {
    assert.deepEqual(Ak.heardWords(Ak.LINE, 0.5), Ak.heardWords(Ak.LINE, 0.5));
  });
  t('heardWords deterministyczne (c = 0.9)', () => {
    assert.deepEqual(Ak.heardWords(Ak.LINE, 0.9), Ak.heardWords(Ak.LINE, 0.9));
  });
  t('liczba słyszanych słów niemalejąca względem c (0, 0.1, …, 1)', () => {
    let prev = -1;
    for (let k = 0; k <= 10; k++) {
      const c = k / 10;
      const n = Ak.heardWords(Ak.LINE, c).filter((w) => w.heard).length;
      assert.ok(n >= prev, `c=${c}: ${n} < ${prev}`);
      prev = n;
    }
  });
});

/* --- B) maski ------------------------------------------------------------------- */

const antygona = Mk.PLAYS.find((p) => p.id === 'antygona');
const ptaki = Mk.PLAYS.find((p) => p.id === 'ptaki');

group('B) maski', () => {
  t("judgeMask('antygona', 'tragiczna') ok", () => {
    assert.deepEqual(Mk.judgeMask('antygona', 'tragiczna'), { ok: true });
  });
  t("judgeMask('ptaki', 'komiczna') ok", () => {
    assert.deepEqual(Mk.judgeMask('ptaki', 'komiczna'), { ok: true });
  });
  t("judgeMask('antygona', 'komiczna') -> ok false", () => {
    assert.equal(Mk.judgeMask('antygona', 'komiczna').ok, false);
  });
  t('zła para do Antygony: message zawiera zakończenie sztuki', () => {
    const r = Mk.judgeMask('antygona', 'komiczna');
    assert.equal(r.ok, false);
    assert.ok(r.message.includes(antygona.ending), `brak zakończenia w: ${r.message}`);
  });
  t("judgeMask('ptaki', 'tragiczna') -> ok false", () => {
    assert.equal(Mk.judgeMask('ptaki', 'tragiczna').ok, false);
  });
  t('zła para do Ptaków: message zawiera zakończenie sztuki', () => {
    const r = Mk.judgeMask('ptaki', 'tragiczna');
    assert.equal(r.ok, false);
    assert.ok(r.message.includes(ptaki.ending), `brak zakończenia w: ${r.message}`);
  });
  t('PLAYS mają różne answer', () => {
    assert.equal(new Set(Mk.PLAYS.map((p) => p.answer)).size, Mk.PLAYS.length);
  });
  t('SCENES ma obie maski', () => {
    assert.ok(Mk.SCENES.tragiczna, 'brak sceny tragicznej');
    assert.ok(Mk.SCENES.komiczna, 'brak sceny komicznej');
  });
  t('judgeMask nieznanej sztuki -> ok false', () => {
    assert.equal(Mk.judgeMask('nie-ma-takiej', 'tragiczna').ok, false);
  });
});

/* --- C) skok -------------------------------------------------------------------- */

group('C) skok', () => {
  t('swingAt(0).arm == 0', () => {
    assert.equal(Sk.swingAt(0).arm, 0);
  });
  t('swingAt(0).forward == true', () => {
    assert.equal(Sk.swingAt(0).forward, true);
  });
  t('swingAt(SWING_MS/4).arm == 1', () => {
    assert.equal(Sk.swingAt(Sk.SWING_MS / 4).arm, 1);
  });
  t('swingAt(3*SWING_MS/4).arm == -1', () => {
    assert.equal(Sk.swingAt((3 * Sk.SWING_MS) / 4).arm, -1);
  });
  t('jump(false, t).metres == BASE_M dla kilku t', () => {
    for (const tt of [0, 100, Sk.SWING_MS / 4, (3 * Sk.SWING_MS) / 4, Sk.SWING_MS]) {
      assert.equal(Sk.jump(false, tt).metres, Sk.BASE_M, `t=${tt}`);
    }
  });
  t("jump(false, t).timing == 'bez'", () => {
    for (const tt of [0, 350, 1050]) assert.equal(Sk.jump(false, tt).timing, 'bez', `t=${tt}`);
  });
  t('jump(true, SWING_MS/4).metres == BASE_M + BONUS_M (do 0,01)', () => {
    const expected = Math.round((Sk.BASE_M + Sk.BONUS_M) * 100) / 100;
    assert.equal(Sk.jump(true, Sk.SWING_MS / 4).metres, expected);
    assert.equal(Sk.jump(true, Sk.SWING_MS / 4).metres, 3.07);
  });
  t("jump(true, SWING_MS/4).timing == 'w-sam-raz'", () => {
    assert.equal(Sk.jump(true, Sk.SWING_MS / 4).timing, 'w-sam-raz');
  });
  t('jump(true, 3*SWING_MS/4).metres == BASE_M - PENALTY_M', () => {
    const expected = Math.round((Sk.BASE_M - Sk.PENALTY_M) * 100) / 100;
    assert.equal(Sk.jump(true, (3 * Sk.SWING_MS) / 4).metres, expected);
    assert.equal(Sk.jump(true, (3 * Sk.SWING_MS) / 4).metres, 2.8);
  });
  // Z kodu: arm = -1, forward = false (cos(3π/2) ≈ -1.8e-16, nie > 0),
  // więc gałąź `forward ? 'za-wczesnie' : 'za-pozno'` daje 'za-pozno'.
  t("jump(true, 3*SWING_MS/4).timing == 'za-pozno' (ręce wracały do tyłu)", () => {
    assert.equal(Sk.jump(true, (3 * Sk.SWING_MS) / 4).timing, 'za-pozno');
  });
  t('maksimum jump(true, t) po t co 1 ms w jednym okresie == BASE_M + BONUS_M', () => {
    const expected = Math.round((Sk.BASE_M + Sk.BONUS_M) * 100) / 100;
    let best = -Infinity;
    for (let tt = 0; tt < Sk.SWING_MS; tt += 1) best = Math.max(best, Sk.jump(true, tt).metres);
    assert.equal(best, expected);
  });
  t('jest t z jump(true, t).metres < BASE_M', () => {
    let found = false;
    for (let tt = 0; tt < Sk.SWING_MS; tt += 10) {
      if (Sk.jump(true, tt).metres < Sk.BASE_M) {
        found = true;
        break;
      }
    }
    assert.ok(found, 'brak t z wynikiem poniżej bazy');
  });
  t("formatM(2.9) == '2,90 m'", () => {
    assert.equal(Sk.formatM(2.9), '2,90 m');
  });
  t('TIMING_TEXT ma 4 klucze', () => {
    assert.equal(Object.keys(Sk.TIMING_TEXT).length, 4);
    for (const k of ['w-sam-raz', 'za-wczesnie', 'za-pozno', 'bez']) {
      assert.ok(Sk.TIMING_TEXT[k], `brak klucza ${k}`);
    }
  });
});

/* --- D) sokrates ----------------------------------------------------------------- */

// Tabela prawdy z kodu: brak-strachu = !afraid; niebezpieczne = danger;
// mimo-strachu = afraid && right.
// ewa (T,T,T), kuba (F,T,F), ola (T,F,T), stas (F,T,F).
const EXPECTED_SAYS = {
  'brak-strachu': { ewa: false, kuba: true, ola: false, stas: true },
  niebezpieczne: { ewa: true, kuba: true, ola: false, stas: true },
  'mimo-strachu': { ewa: true, kuba: false, ola: true, stas: false },
};

const TYPOWE = { ewa: true, kuba: false, ola: true, stas: false };

group('D) sokrates', () => {
  for (const def of So.DEFINITIONS) {
    for (const c of So.CASES) {
      t(`definitionSays('${def.id}', ${c.id}) == ${EXPECTED_SAYS[def.id][c.id]}`, () => {
        assert.equal(So.definitionSays(def.id, c), EXPECTED_SAYS[def.id][c.id]);
      });
    }
  }
  t('firstConflict przy pustych odpowiedziach == null', () => {
    for (const def of So.DEFINITIONS) assert.equal(So.firstConflict(def.id, {}), null, def.id);
  });
  t("typowe: firstConflict('mimo-strachu') == null", () => {
    assert.equal(So.firstConflict('mimo-strachu', { ...TYPOWE }), null);
  });
  t("typowe: firstConflict('brak-strachu') nie null", () => {
    assert.notEqual(So.firstConflict('brak-strachu', { ...TYPOWE }), null);
  });
  t("typowe: firstConflict('niebezpieczne') nie null", () => {
    assert.notEqual(So.firstConflict('niebezpieczne', { ...TYPOWE }), null);
  });
  t('anyConsistent(typowe) == true', () => {
    assert.equal(So.anyConsistent({ ...TYPOWE }), true);
  });
  // niebezpieczne mówi: ewa T, kuba T, ola F, stas T — dokładnie te odpowiedzi.
  t('ewa tak + kuba tak + ola nie + stas tak: anyConsistent == true', () => {
    assert.equal(So.anyConsistent({ ewa: true, kuba: true, ola: false, stas: true }), true);
  });
  // Z kodu: brak-strachu kłóci się na Oli (F vs tak), niebezpieczne i mimo-strachu
  // kłócą się na Ewie (T vs nie) — żadna definicja nie pasuje, więc false.
  t('ewa nie + ola tak: anyConsistent == false', () => {
    assert.equal(So.anyConsistent({ ewa: false, ola: true }), false);
  });
  t('socratesObjection zawiera tekst definicji', () => {
    const def = So.DEFINITIONS.find((d) => d.id === 'mimo-strachu');
    const ewa = So.CASES.find((c) => c.id === 'ewa');
    const o = So.socratesObjection(def, ewa, false);
    assert.ok(o.includes(def.text), o);
  });
  t("socratesObjection dla Ewy zawiera 'Ewa' z wielkiej litery", () => {
    const def = So.DEFINITIONS.find((d) => d.id === 'mimo-strachu');
    const ewa = So.CASES.find((c) => c.id === 'ewa');
    const o = So.socratesObjection(def, ewa, false);
    assert.ok(o.includes('Ewa'), o);
  });
  t('socratesObjection nie zaczyna zdania od małej litery imienia', () => {
    const def = So.DEFINITIONS.find((d) => d.id === 'mimo-strachu');
    const ewa = So.CASES.find((c) => c.id === 'ewa');
    const o = So.socratesObjection(def, ewa, false);
    assert.ok(!o.includes('że ewa'), o);
  });
  t('CASES mają unikalne id', () => {
    assert.equal(new Set(So.CASES.map((c) => c.id)).size, So.CASES.length);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

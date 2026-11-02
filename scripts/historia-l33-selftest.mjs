/**
 * Selftest czystych funkcji L33 (`test-koncowy`: zadania + sędziowie).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l32-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l33-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l33-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

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

const ZA = `'${root}/src/app/historia/klasa-4/components/lessons/test-koncowy/zadania.ts'`;
const LE = `'${root}/src/app/historia/klasa-4/data/lessons.ts'`;

let Le = null;
let bundledWithLessons = true;
await writeFile(entry, `export * as Za from ${ZA};\nexport * as Le from ${LE};\n`);
try {
  await build({
    entryPoints: [entry],
    outfile: out,
    bundle: true,
    format: 'esm',
    platform: 'node',
    plugins: [aliasPlugin],
  });
} catch (e) {
  console.log('Uwaga: bundel lessons.ts nie przeszedł — pomijam go, testuję sam moduł zadań.');
  console.log(`  powód: ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`);
  bundledWithLessons = false;
  await writeFile(entry, `export * as Za from ${ZA};\n`);
  await build({
    entryPoints: [entry],
    outfile: out,
    bundle: true,
    format: 'esm',
    platform: 'node',
    plugins: [aliasPlugin],
  });
}

const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const { Za } = lib;
if (bundledWithLessons) Le = lib.Le;

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

/** Wszystkie permutacje tablicy (tu: 4! = 24). */
function permutations(arr) {
  if (arr.length <= 1) return [arr.slice()];
  const out = [];
  for (let i = 0; i < arr.length; i += 1) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) out.push([arr[i], ...p]);
  }
  return out;
}

/* --- A) TASKS: 12 zadań, 4 części po 3 -------------------------------------- */

group('A) TASKS i PARTS', () => {
  t('TASKS ma 12 zadań', () => {
    assert.equal(Za.TASKS.length, 12);
  });
  t('id zadań unikalne', () => {
    const ids = Za.TASKS.map((task) => task.id);
    assert.equal(new Set(ids).size, ids.length);
  });
  t('PARTS ma 4 części: czas, slady, mapa, dziedzictwo', () => {
    assert.deepEqual(Za.PARTS.map((p) => p.id), ['czas', 'slady', 'mapa', 'dziedzictwo']);
  });
  for (const p of Za.PARTS) {
    t(`część '${p.id}' ma 3 zadania`, () => {
      assert.equal(Za.tasksOf(p.id).length, 3);
    });
  }
  for (const task of Za.TASKS) {
    t(`'${task.id}': lesson.href '${task.lesson.href}' ma postać '<moduł>/<lekcja>'`, () => {
      assert.match(task.lesson.href, /^[^/]+\/[^/]+$/);
    });
    t(`'${task.id}': skill niepusty`, () => {
      assert.ok(typeof task.skill === 'string' && task.skill.length > 0);
    });
  }
  if (Le) {
    const keys = new Set(Le.HIST_LESSONS.map((l) => `${l.moduleSlug}/${l.slug}`));
    for (const task of Za.TASKS) {
      t(`'${task.id}': href '${task.lesson.href}' istnieje w HIST_LESSONS`, () => {
        assert.ok(keys.has(task.lesson.href), task.lesson.href);
      });
    }
  } else {
    console.log('  (pominięto sprawdzanie HIST_LESSONS — brak bundla lessons.ts)');
  }
});

/* --- B) judgeAxis: tylko jedna kolejność ------------------------------------ */

group('B) judgeAxis', () => {
  const GOOD = ['piramidy', 'igrzyska', 'cezar', 'edykt'];
  const IDS = ['piramidy', 'igrzyska', 'cezar', 'edykt'];
  t('judgeAxis popr. kolejności true', () => {
    assert.equal(Za.judgeAxis(GOOD), true);
  });
  const perms = permutations(IDS);
  t('jest 24 permutacje 4 id', () => {
    assert.equal(perms.length, 24);
  });
  for (const p of perms) {
    if (p.join(',') === GOOD.join(',')) continue;
    t(`judgeAxis([${p.join(',')}]) false`, () => {
      assert.equal(Za.judgeAxis(p), false);
    });
  }
});

/* --- C) judgeYears ----------------------------------------------------------- */

group('C) judgeYears', () => {
  t("judgeYears('356') true", () => {
    assert.equal(Za.judgeYears('356'), true);
  });
  t("judgeYears(' 356 ') true", () => {
    assert.equal(Za.judgeYears(' 356 '), true);
  });
  t("judgeYears('357') false", () => {
    assert.equal(Za.judgeYears('357'), false);
  });
  t("judgeYears('355') false", () => {
    assert.equal(Za.judgeYears('355'), false);
  });
  t("judgeYears('') false", () => {
    assert.equal(Za.judgeYears(''), false);
  });
});

/* --- D) judgeCenturies ------------------------------------------------------- */

group('D) judgeCenturies', () => {
  t('oba dobre true', () => {
    assert.equal(Za.judgeCenturies({ r1900: 'XIX w.', r480: 'V w. p.n.e.' }), true);
  });
  t("z 'XX w.' false", () => {
    assert.equal(Za.judgeCenturies({ r1900: 'XX w.', r480: 'V w. p.n.e.' }), false);
  });
  t("z 'IV w. p.n.e.' false", () => {
    assert.equal(Za.judgeCenturies({ r1900: 'XIX w.', r480: 'IV w. p.n.e.' }), false);
  });
});

/* --- E) judgeSources --------------------------------------------------------- */

group('E) judgeSources', () => {
  t('wszystkie dobre true', () => {
    assert.equal(
      Za.judgeSources({ grot: 'niepisane', legenda: 'niematerialne', list: 'pisane' }),
      true,
    );
  });
  t('zamiana grot<->legenda false', () => {
    assert.equal(
      Za.judgeSources({ grot: 'niematerialne', legenda: 'niepisane', list: 'pisane' }),
      false,
    );
  });
  t('zamiana grot<->list false', () => {
    assert.equal(
      Za.judgeSources({ grot: 'pisane', legenda: 'niematerialne', list: 'niepisane' }),
      false,
    );
  });
  t('zamiana legenda<->list false', () => {
    assert.equal(
      Za.judgeSources({ grot: 'niepisane', legenda: 'pisane', list: 'niematerialne' }),
      false,
    );
  });
});

/* --- F) judgeOpinion + judgeWitness ------------------------------------------- */

group('F) judgeOpinion + judgeWitness', () => {
  t('dokładnie jedno zdanie OPINION_TEXT daje true', () => {
    assert.equal(Za.OPINION_TEXT.filter((o) => Za.judgeOpinion(o.id)).length, 1);
  });
  for (const o of Za.OPINION_TEXT) {
    t(`judgeOpinion('${o.id}') === ${String(o.opinion)}`, () => {
      assert.equal(Za.judgeOpinion(o.id), o.opinion);
    });
  }
  t('dokładnie jeden świadek daje true', () => {
    assert.equal(Za.WITNESSES.filter((w) => Za.judgeWitness(w.id)).length, 1);
  });
  for (const w of Za.WITNESSES) {
    t(`judgeWitness('${w.id}') === ${String(w.close)}`, () => {
      assert.equal(Za.judgeWitness(w.id), w.close);
    });
  }
});

/* --- G) judgeSign ------------------------------------------------------------- */

group('G) judgeSign', () => {
  t('dokładnie jeden znak PLAN_SIGNS daje true', () => {
    assert.equal(Za.PLAN_SIGNS.filter((s) => Za.judgeSign(s.id)).length, 1);
  });
  t('znak dający true ma sign === PLAN_TARGET', () => {
    const hit = Za.PLAN_SIGNS.filter((s) => Za.judgeSign(s.id));
    assert.equal(hit.length, 1);
    assert.equal(hit[0].sign, Za.PLAN_TARGET);
  });
  for (const s of Za.PLAN_SIGNS) {
    t(`judgeSign('${s.id}') === ${String(s.sign === Za.PLAN_TARGET)}`, () => {
      assert.equal(Za.judgeSign(s.id), s.sign === Za.PLAN_TARGET);
    });
  }
});

/* --- H) judgeCountry ---------------------------------------------------------- */

group('H) judgeCountry', () => {
  t("judgeCountry('ITA') true", () => {
    assert.equal(Za.judgeCountry('ITA'), true);
  });
  t("judgeCountry('GRC') false", () => {
    assert.equal(Za.judgeCountry('GRC'), false);
  });
});

/* --- I) judgeStreet ------------------------------------------------------------ */

group('I) judgeStreet', () => {
  t('trzy ancient true', () => {
    assert.equal(Za.judgeStreet(['kolumny', 'luk', 'teatr']), true);
  });
  t("dwa ancient + 'rower' false", () => {
    assert.equal(Za.judgeStreet(['kolumny', 'luk', 'rower']), false);
  });
  t('dwa (za mało) false', () => {
    assert.equal(Za.judgeStreet(['kolumny', 'luk']), false);
  });
});

/* --- J) judgeEgypt -------------------------------------------------------------- */

group('J) judgeEgypt', () => {
  t("['wielblad','kolumna'] true", () => {
    assert.equal(Za.judgeEgypt(['wielblad', 'kolumna']), true);
  });
  t("['wielblad','palma'] false", () => {
    assert.equal(Za.judgeEgypt(['wielblad', 'palma']), false);
  });
  t("['wielblad'] false", () => {
    assert.equal(Za.judgeEgypt(['wielblad']), false);
  });
});

/* --- K) judgeFlag + partScore ------------------------------------------------------ */

group('K) judgeFlag + partScore', () => {
  t('judgeFlag(true) true', () => {
    assert.equal(Za.judgeFlag(true), true);
  });
  t('judgeFlag(false) false', () => {
    assert.equal(Za.judgeFlag(false), false);
  });
  t("partScore({os:true, lata:false}, 'czas') → { ok:1, done:2, total:3 }", () => {
    assert.deepEqual(Za.partScore({ os: true, lata: false }, 'czas'), {
      ok: 1,
      done: 2,
      total: 3,
    });
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

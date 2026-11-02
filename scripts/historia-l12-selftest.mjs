/**
 * Selftest czystych funkcji L12 (`regiony-i-mala-ojczyzna`: regiony, stroje, tradycje).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l11-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l12-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l12-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as R from '${root}/src/app/historia/klasa-4/components/lessons/regiony-i-mala-ojczyzna/regiony';\n` +
    `export * as S from '${root}/src/app/historia/klasa-4/components/lessons/regiony-i-mala-ojczyzna/stroje';\n` +
    `export * as T from '${root}/src/app/historia/klasa-4/components/lessons/regiony-i-mala-ojczyzna/tradycje';\n`
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

const { R, S, T } = lib;

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

/* --- A) regiony: kształty i historie ---------------------------------------- */

group('A) regiony: kształty i historie', () => {
  t('REGION_SHAPES ma 11 kawałków', () => {
    assert.equal(R.REGION_SHAPES.length, 11);
  });
  t('id kawałków są unikalne', () => {
    const ids = R.REGION_SHAPES.map((r) => r.id);
    assert.equal(new Set(ids).size, 11);
  });
  for (const shape of R.REGION_SHAPES) {
    t(`REGION_STORIES: dokładnie jedna historia dla '${shape.id}'`, () => {
      const mine = R.REGION_STORIES.filter((s) => s.id === shape.id);
      assert.equal(mine.length, 1);
      assert.ok(
        R.REASONS.some((r) => r.id === mine[0].reason),
        `reason '${mine[0].reason}' spoza REASONS`
      );
    });
  }
  for (const reason of R.REASONS) {
    t(`REASONS: '${reason.id}' ma co najmniej jeden region`, () => {
      assert.ok(R.REGION_STORIES.some((s) => s.reason === reason.id));
    });
  }
});

/* --- B) regiony: słowa ------------------------------------------------------- */

group('B) regiony: słowa (speakLikeYou / narrowed / WORD_QUESTIONS)', () => {
  t('speakLikeYou({}) zwraca wszystkie 11', () => {
    assert.deepEqual(R.speakLikeYou({}), R.ALL_REGIONS);
  });
  t("speakLikeYou({dwor:'na-pole'}) = ['malopolska']", () => {
    assert.deepEqual(R.speakLikeYou({ dwor: 'na-pole' }), ['malopolska']);
  });
  t("speakLikeYou({dwor:'na-pole', jagody:'borowki'}) = ['malopolska']", () => {
    assert.deepEqual(R.speakLikeYou({ dwor: 'na-pole', jagody: 'borowki' }), ['malopolska']);
  });
  t("speakLikeYou({dwor:'na-pole', ziemniaki:'pyry'}) = []", () => {
    assert.deepEqual(R.speakLikeYou({ dwor: 'na-pole', ziemniaki: 'pyry' }), []);
  });
  t("speakLikeYou({ziemniaki:'pyry'}) = ['wielkopolska']", () => {
    assert.deepEqual(R.speakLikeYou({ ziemniaki: 'pyry' }), ['wielkopolska']);
  });
  t("speakLikeYou({szneka:'szneka'}) = ['pomorze','kujawy']", () => {
    assert.deepEqual(R.speakLikeYou({ szneka: 'szneka' }), ['pomorze', 'kujawy']);
  });
  t("narrowed({ziemniaki:'ziemniaki', szneka:'drozdzowka'}) === false", () => {
    assert.equal(R.narrowed({ ziemniaki: 'ziemniaki', szneka: 'drozdzowka' }), false);
  });
  t("narrowed({jagody:'borowki'}) === true", () => {
    assert.equal(R.narrowed({ jagody: 'borowki' }), true);
  });
  for (const q of R.WORD_QUESTIONS) {
    t(`WORD_QUESTIONS '${q.id}': opcje mają unikalne id`, () => {
      const ids = q.options.map((o) => o.id);
      assert.equal(new Set(ids).size, ids.length);
    });
    t(`WORD_QUESTIONS '${q.id}': where niepuste i tylko poprawne RegionId`, () => {
      for (const o of q.options) {
        assert.ok(o.where.length > 0, `opcja '${o.id}' ma puste where`);
        for (const r of o.where) {
          assert.ok(R.ALL_REGIONS.includes(r), `'${r}' spoza RegionId`);
        }
      }
    });
  }
});

/* --- C) regiony: judgePiece --------------------------------------------------- */

group('C) regiony: judgePiece', () => {
  for (const a of R.ALL_REGIONS) {
    t(`judgePiece(${a},${a}).ok === true`, () => {
      assert.equal(R.judgePiece(a, a).ok, true);
    });
  }
  for (const a of R.ALL_REGIONS) {
    for (const b of R.ALL_REGIONS) {
      if (a === b) continue;
      t(`judgePiece(${a},${b}).ok === false i niepusty why`, () => {
        const v = R.judgePiece(a, b);
        assert.equal(v.ok, false);
        assert.ok(typeof v.why === 'string' && v.why.length > 0, 'pusty why');
      });
    }
  }
});

/* --- D) regiony: judgeCrown (trzy stolice) ------------------------------------ */

group('D) regiony: judgeCrown', () => {
  t("judgeCrown(0,'gniezno').ok === true", () => {
    assert.equal(R.judgeCrown(0, 'gniezno').ok, true);
  });
  t("judgeCrown(1,'krakow').ok === true", () => {
    assert.equal(R.judgeCrown(1, 'krakow').ok, true);
  });
  t("judgeCrown(2,'warszawa').ok === true", () => {
    assert.equal(R.judgeCrown(2, 'warszawa').ok, true);
  });
  t("judgeCrown(0,'krakow') false i why zawiera 'Gniezno'", () => {
    const v = R.judgeCrown(0, 'krakow');
    assert.equal(v.ok, false);
    assert.ok(v.why.includes('Gniezno'), v.why);
  });
  t("judgeCrown(0,'warszawa').ok === false", () => {
    assert.equal(R.judgeCrown(0, 'warszawa').ok, false);
  });
  t("judgeCrown(2,'gniezno') false i why zawiera 'wstecz'", () => {
    const v = R.judgeCrown(2, 'gniezno');
    assert.equal(v.ok, false);
    assert.ok(v.why.includes('wstecz'), v.why);
  });
  t("judgeCrown(1,'gniezno').ok === false", () => {
    assert.equal(R.judgeCrown(1, 'gniezno').ok, false);
  });
});

/* --- E) stroje ----------------------------------------------------------------- */

const EXPECTED_ALIEN = [
  { alien: 'ciupaga', owner: 'podhalanski' },
  { alien: 'portki-pasiak', owner: 'lowicki' },
  { alien: 'krakuska', owner: 'krakowski' },
];

group('E) stroje', () => {
  S.PUZZLES.forEach((p, i) => {
    const exp = EXPECTED_ALIEN[i];
    t(`PUZZLES[${i}]: alienOf === '${exp.alien}'`, () => {
      assert.equal(S.alienOf(p), exp.alien);
    });
    t(`PUZZLES[${i}]: costumeOf(alien).id === '${exp.owner}'`, () => {
      assert.equal(S.costumeOf(S.alienOf(p)).id, exp.owner);
    });
    t(`PUZZLES[${i}]: alien dokładnie jeden, reszta w homeOf`, () => {
      const home = S.homeOf(p);
      const outside = p.parts.filter((x) => !home.parts.includes(x));
      assert.deepEqual(outside, [S.alienOf(p)]);
      for (const x of p.parts) {
        if (x === S.alienOf(p)) continue;
        assert.ok(home.parts.includes(x), `'${x}' spoza homeOf (${home.id})`);
      }
    });
    t(`PUZZLES[${i}]: judgeFind(p, alien).ok === true`, () => {
      assert.equal(S.judgeFind(p, S.alienOf(p)).ok, true);
    });
    for (const x of p.parts) {
      if (x === exp.alien) continue;
      t(`PUZZLES[${i}]: judgeFind(p, '${x}').ok === false`, () => {
        assert.equal(S.judgeFind(p, x).ok, false);
      });
    }
    t(`PUZZLES[${i}]: judgeSend(alien, '${exp.owner}').ok === true`, () => {
      assert.equal(S.judgeSend(S.alienOf(p), exp.owner).ok, true);
    });
    for (const c of S.COSTUMES) {
      if (c.id === exp.owner) continue;
      t(`PUZZLES[${i}]: judgeSend(alien, '${c.id}').ok === false`, () => {
        assert.equal(S.judgeSend(S.alienOf(p), c.id).ok, false);
      });
    }
  });
  for (const [part] of Object.entries(S.PARTS)) {
    t(`PARTS '${part}': należy do dokładnie jednego stroju`, () => {
      const owners = S.COSTUMES.filter((c) => c.parts.includes(part));
      assert.equal(owners.length, 1);
    });
  }
});

/* --- F) tradycje ---------------------------------------------------------------- */

const sid = (tr, answers) => tr.sentences.find((s) => s.answers === answers).id;

group('F) tradycje', () => {
  for (const tr of T.TRADITIONS) {
    t(`TRADITIONS '${tr.id}': po jednym zdaniu na 'skad'/'dawniej'/'dzis'`, () => {
      for (const q of ['skad', 'dawniej', 'dzis']) {
        assert.equal(
          tr.sentences.filter((s) => s.answers === q).length,
          1,
          `pytań '${q}': ${tr.sentences.filter((s) => s.answers === q).length}`
        );
      }
    });
    t(`TRADITIONS '${tr.id}': dokładnie jedno zdanie z answers === null`, () => {
      assert.equal(tr.sentences.filter((s) => s.answers === null).length, 1);
    });
    t(`TRADITIONS '${tr.id}': poprawne przypisanie → ok true`, () => {
      const v = T.judgeTradition(tr, {
        skad: sid(tr, 'skad'),
        dawniej: sid(tr, 'dawniej'),
        dzis: sid(tr, 'dzis'),
      });
      assert.equal(v.ok, true);
    });
    t(`TRADITIONS '${tr.id}': puste → ok false i note zawiera 'Brakuje'`, () => {
      const v = T.judgeTradition(tr, {});
      assert.equal(v.ok, false);
      assert.ok(v.note.includes('Brakuje'), v.note);
    });
    t(`TRADITIONS '${tr.id}': zamiana 'dawniej'↔'dzis' → ok false`, () => {
      const v = T.judgeTradition(tr, {
        skad: sid(tr, 'skad'),
        dawniej: sid(tr, 'dzis'),
        dzis: sid(tr, 'dawniej'),
      });
      assert.equal(v.ok, false);
    });
    t(`TRADITIONS '${tr.id}': 'skad' przy zdaniu null → ok false i 'tylko opisuje'`, () => {
      const v = T.judgeTradition(tr, {
        skad: sid(tr, null),
        dawniej: sid(tr, 'dawniej'),
        dzis: sid(tr, 'dzis'),
      });
      assert.equal(v.ok, false);
      assert.ok(v.note.includes('tylko opisuje'), v.note);
    });
  }
  for (const tr of T.TRADITIONS) {
    for (const s of tr.sentences) {
      if (s.answers === 'dawniej') {
        t(`'${tr.id}/${s.id}': zdanie 'dawniej' zawiera 'Dawniej'`, () => {
          assert.ok(/dawniej/i.test(s.text), s.text);
        });
      }
      if (s.answers === 'dzis') {
        t(`'${tr.id}/${s.id}': zdanie 'dzis' zawiera 'Dziś'`, () => {
          assert.ok(s.text.includes('Dziś'), s.text);
        });
      }
      if (s.answers === 'skad') {
        t(`'${tr.id}/${s.id}': zdanie 'skad' zawiera 'wziął' albo 'wzięła'`, () => {
          assert.ok(s.text.includes('wziął') || s.text.includes('wzięła'), s.text);
        });
      }
    }
  }
  t('KINDS ma 5 rodzajów', () => {
    assert.equal(T.KINDS.length, 5);
  });
  for (const k of T.KINDS) {
    t(`KINDS '${k.id}': po 3 pytania`, () => {
      assert.equal(k.questions.length, 3);
    });
  }
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

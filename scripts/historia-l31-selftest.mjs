/**
 * Selftest czystych funkcji L31 (`teczka-postaci`: postacie + teczka + rok).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l30-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l31-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l31-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as Po from '${root}/src/app/historia/klasa-4/components/lessons/teczka-postaci/postacie';\n` +
    `export * as Te from '${root}/src/app/historia/klasa-4/components/lessons/teczka-postaci/teczka';\n` +
    `export * as Rok from '${root}/src/app/historia/klasa-4/components/lessons/teczka-postaci/rok';\n`,
);

/** Alias `@/` → `<root>/src/` (tsconfig paths), jak w Next. */
const aliasPlugin = {
  name: 'at-alias',
  setup(b) {
    b.onResolve({ filter: /^@\// }, (args) => {
      const base = join(root, 'src', args.path.slice(2));
      for (const cand of [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), base]) {
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

const { Po, Te, Rok } = lib;

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

const allSentences = (f) => f.cards.flatMap((c) => c.sentences.map((s) => ({ card: c, sentence: s })));

/* --- A) postacie: kształt teczek ------------------------------------------- */

group('A) postacie: FIGURES', () => {
  t('FIGURES ma 4 postaci', () => {
    assert.equal(Po.FIGURES.length, 4);
  });
  t('id postaci unikalne', () => {
    const ids = Po.FIGURES.map((f) => f.id);
    assert.equal(new Set(ids).size, ids.length);
  });
  t('id zdań globalnie unikalne', () => {
    const ids = Po.FIGURES.flatMap((f) => allSentences(f).map((x) => x.sentence.id));
    assert.equal(new Set(ids).size, ids.length);
  });
  for (const f of Po.FIGURES) {
    t(`${f.id}: ≥5 kart`, () => {
      assert.ok(f.cards.length >= 5, `kart: ${f.cards.length}`);
    });
    t(`${f.id}: unikalne id kart`, () => {
      const ids = f.cards.map((c) => c.id);
      assert.equal(new Set(ids).size, ids.length);
    });
    t(`${f.id}: unikalne id zdań w obrębie postaci`, () => {
      const ids = allSentences(f).map((x) => x.sentence.id);
      assert.equal(new Set(ids).size, ids.length);
    });
    t(`${f.id}: firstCard istnieje w cards`, () => {
      assert.ok(
        f.cards.some((c) => c.id === f.firstCard),
        `firstCard ${f.firstCard} nie ma w [${f.cards.map((c) => c.id)}]`,
      );
    });
    t(`${f.id}: ≥1 zdanie z lean -1`, () => {
      assert.ok(allSentences(f).some((x) => x.sentence.lean === -1), f.id);
    });
    t(`${f.id}: ≥1 zdanie z lean 1`, () => {
      assert.ok(allSentences(f).some((x) => x.sentence.lean === 1), f.id);
    });
    t(`${f.id}: life ma ≥5 zdarzeń`, () => {
      assert.ok(f.life.length >= 5, `zdarzeń: ${f.life.length}`);
    });
    t(`${f.id}: life posortowane rosnąco po year`, () => {
      for (let i = 1; i < f.life.length; i++) {
        assert.ok(f.life[i - 1].year <= f.life[i].year, `${f.life[i - 1].id} (${f.life[i - 1].year}) > ${f.life[i].id} (${f.life[i].year})`);
      }
    });
    t(`${f.id}: photo z teczka-postaci (lokalnie albo Cloudinary)`, () => {
      assert.ok(/(^\/images\/historia\/lekcje\/|historia4\/).*teczka-postaci\//.test(f.photo) || /teczka-postaci/.test(f.photo), f.photo);
    });
  }
  for (const f of Po.FIGURES) {
    for (const { sentence: s } of allSentences(f).filter((x) => x.sentence.kind === 'zdanie')) {
      t(`${f.id}/${s.id}: cue niepuste`, () => {
        assert.ok(typeof s.cue === 'string' && s.cue.length > 0, JSON.stringify(s));
      });
      t(`${f.id}/${s.id}: cue występuje w tekście (text.includes(cue))`, () => {
        assert.ok(s.text.includes(s.cue), `cue ${JSON.stringify(s.cue)} nie ma w ${JSON.stringify(s.text)}`);
      });
    }
  }
});

/* --- B) rok: formatYear ----------------------------------------------------- */

group('B) rok: formatYear', () => {
  t("formatYear(-69) === '69 p.n.e.'", () => {
    assert.equal(Rok.formatYear(-69), '69 p.n.e.');
  });
  t("formatYear(313) === '313 n.e.'", () => {
    assert.equal(Rok.formatYear(313), '313 n.e.');
  });
  t("formatYear(-1479, true) === 'ok. 1479 p.n.e.'", () => {
    assert.equal(Rok.formatYear(-1479, true), 'ok. 1479 p.n.e.');
  });
});

/* --- C) teczka: judgeKind --------------------------------------------------- */

group('C) teczka: judgeKind', () => {
  for (const f of Po.FIGURES) {
    for (const { sentence: s } of allSentences(f)) {
      t(`judgeKind(${f.id}, ${s.id}, ${s.kind}) ok:true`, () => {
        assert.deepEqual(Te.judgeKind(f, s.id, s.kind), { ok: true });
      });
      const opposite = s.kind === 'fakt' ? 'zdanie' : 'fakt';
      t(`judgeKind(${f.id}, ${s.id}, ${opposite}) ok:false + message`, () => {
        const r = Te.judgeKind(f, s.id, opposite);
        assert.equal(r.ok, false);
        assert.ok(typeof r.message === 'string' && r.message.length > 0, JSON.stringify(r));
      });
    }
  }
  for (const f of Po.FIGURES) {
    for (const { sentence: s } of allSentences(f).filter((x) => x.sentence.kind === 'zdanie')) {
      t(`judgeKind(${f.id}, ${s.id}, fakt).message zawiera cue`, () => {
        const r = Te.judgeKind(f, s.id, 'fakt');
        assert.equal(r.ok, false);
        assert.ok(r.message.includes(s.cue), r.message);
      });
    }
  }
});

/* --- D) teczka: judgeOrder -------------------------------------------------- */

group('D) teczka: judgeOrder', () => {
  for (const f of Po.FIGURES) {
    t(`judgeOrder(${f.id}.life) ok:true`, () => {
      assert.deepEqual(Te.judgeOrder(f.life), { ok: true });
    });
  }
  for (const f of Po.FIGURES) {
    t(`judgeOrder(${f.id} po zamianie 2 pierwszych) ok:false, pair to ich id`, () => {
      const swapped = [f.life[1], f.life[0], ...f.life.slice(2)];
      const r = Te.judgeOrder(swapped);
      assert.equal(r.ok, false);
      assert.deepEqual(r.pair, [f.life[1].id, f.life[0].id]);
    });
  }
  t('kleopatra po zamianie: message zawiera „Przed naszą erą”', () => {
    const f = Po.FIGURES.find((x) => x.id === 'kleopatra');
    const r = Te.judgeOrder([f.life[1], f.life[0], ...f.life.slice(2)]);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('Przed naszą erą'), r.message);
  });
  t('konstantyn po zamianie: message NIE zawiera „Przed naszą erą”', () => {
    const f = Po.FIGURES.find((x) => x.id === 'konstantyn');
    const r = Te.judgeOrder([f.life[1], f.life[0], ...f.life.slice(2)]);
    assert.equal(r.ok, false);
    assert.ok(!r.message.includes('Przed naszą erą'), r.message);
  });
});

/* --- E) teczka: ratingSign -------------------------------------------------- */

group('E) teczka: ratingSign', () => {
  t('ratingSign({own:1,others:0}) === 1', () => {
    assert.equal(Te.ratingSign({ own: 1, others: 0 }), 1);
  });
  t('ratingSign({own:-2,others:1}) === -1', () => {
    assert.equal(Te.ratingSign({ own: -2, others: 1 }), -1);
  });
  t('ratingSign({own:1,others:-1}) === 0', () => {
    assert.equal(Te.ratingSign({ own: 1, others: -1 }), 0);
  });
});

/* --- F) teczka: judgeVerdict ----------------------------------------------- */

group('F) teczka: judgeVerdict', () => {
  const kleo = Po.FIGURES.find((x) => x.id === 'kleopatra');
  const good = {
    rating: { own: 2, others: 1 },
    evidence: ['k4', 'k13', 'k10'],
    counter: 'k1',
    measure: 'nasze',
  };
  const byId = (work) => Object.fromEntries(Te.judgeVerdict(kleo, work).map((c) => [c.id, c.ok]));

  for (const id of ['fakt', 'dwa-zrodla', 'kontra', 'miara']) {
    t(`kleopatra dobra praca: check ${id} ok`, () => {
      assert.equal(byId(good)[id], true);
    });
  }
  t("evidence same zdania ['k13','k11'] → 'fakt' false", () => {
    assert.equal(byId({ ...good, evidence: ['k13', 'k11'] }).fakt, false);
  });
  t("evidence z jednej karty ['k4','k5'] → 'dwa-zrodla' false", () => {
    assert.equal(byId({ ...good, evidence: ['k4', 'k5'] })['dwa-zrodla'], false);
  });
  t("counter 'k3' (lean +1 przy ocenie dodatniej) → 'kontra' false", () => {
    assert.equal(byId({ ...good, counter: 'k3' }).kontra, false);
  });
  t("counter null → 'kontra' false", () => {
    assert.equal(byId({ ...good, counter: null }).kontra, false);
  });
  t("measure null → 'miara' false", () => {
    assert.equal(byId({ ...good, measure: null }).miara, false);
  });
  t("ocena ujemna + counter 'k13' → 'kontra' true", () => {
    const work = { ...good, rating: { own: -2, others: -1 }, counter: 'k13' };
    assert.equal(byId(work).kontra, true);
  });
  t("ocena 0 + counter 'k2' (lean 0) → 'kontra' false", () => {
    const work = { ...good, rating: { own: 1, others: -1 }, counter: 'k2' };
    assert.equal(byId(work).kontra, false);
  });
  t("ocena 0 + counter 'k1' → 'kontra' true", () => {
    const work = { ...good, rating: { own: 1, others: -1 }, counter: 'k1' };
    assert.equal(byId(work).kontra, true);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

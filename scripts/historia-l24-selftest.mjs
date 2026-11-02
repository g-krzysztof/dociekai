/**
 * Selftest czystych funkcji L24 (`bogowie-i-mity`: labirynt + olimp + mowa + natura).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l23-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l24-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l24-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as Lb from '${root}/src/app/historia/klasa-4/components/lessons/bogowie-i-mity/labirynt';\n` +
    `export * as Mw from '${root}/src/app/historia/klasa-4/components/lessons/bogowie-i-mity/mowa';\n` +
    `export * as Nt from '${root}/src/app/historia/klasa-4/components/lessons/bogowie-i-mity/natura';\n` +
    `export * as Ol from '${root}/src/app/historia/klasa-4/components/lessons/bogowie-i-mity/olimp';\n` +
    `export * as Tj from '${root}/src/app/historia/klasa-4/components/family-tree/tree-judge';\n`,
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

const { Lb, Mw, Nt, Ol, Tj } = lib;

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

/* --- wspólne: labirynt i najkrótsza ścieżka ---------------------------------- */

const m = Lb.makeMaze(Lb.MAZE_SIZE, Lb.MAZE_SIZE, Lb.MAZE_SEED);

/** Najkrótsza ścieżka BFS-em (przez `neighbor`, czyli tylko korytarzem). */
function bfsPath(mm, from, to) {
  const prev = new Array(mm.w * mm.h).fill(-1);
  const seen = new Array(mm.w * mm.h).fill(false);
  seen[from] = true;
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === to) break;
    for (const d of Object.keys(Lb.DIRS)) {
      const n = Lb.neighbor(mm, cur, d);
      if (n !== null && !seen[n]) {
        seen[n] = true;
        prev[n] = cur;
        queue.push(n);
      }
    }
  }
  assert.ok(seen[to], `brak drogi ${from} → ${to}`);
  const path = [to];
  while (path[0] !== from) path.unshift(prev[path[0]]);
  return path;
}

const popcount = (o) => [1, 2, 4, 8].filter((b) => o & b).length;

const P = bfsPath(m, m.entrance, m.center);
const DIST = P.length - 1;

/* --- A) labirynt: determinizm i doskonałość ----------------------------------- */

group('A) labirynt: determinizm i doskonałość', () => {
  t('makeMaze(MAZE_SIZE, MAZE_SIZE, MAZE_SEED) jest deterministyczny', () => {
    const again = Lb.makeMaze(Lb.MAZE_SIZE, Lb.MAZE_SIZE, Lb.MAZE_SEED);
    assert.deepEqual(again, m);
  });
  t('labirynt doskonały: przejść (suma bitów / 2) == w*h-1', () => {
    const bits = m.open.reduce((s, o) => s + popcount(o), 0);
    assert.equal(bits / 2, m.w * m.h - 1);
  });
  t('wszystkie komórki osiągalne z wejścia (distances >= 0)', () => {
    const d = Lb.distances(m, m.entrance);
    assert.equal(d.length, m.w * m.h);
    for (let i = 0; i < d.length; i++) assert.ok(d[i] >= 0, `komórka ${i} nieosiągalna`);
  });
  t('ściany symetryczne (E↔W, N↔S u sąsiada)', () => {
    for (let i = 0; i < m.w * m.h; i++) {
      const { x, y } = Lb.xy(m, i);
      for (const d of Object.keys(Lb.DIRS)) {
        const nx = x + Lb.DIRS[d].dx;
        const ny = y + Lb.DIRS[d].dy;
        const inBounds = nx >= 0 && ny >= 0 && nx < m.w && ny < m.h;
        const has = Boolean(m.open[i] & Lb.DIRS[d].bit);
        if (!inBounds) {
          assert.equal(has, false, `komórka ${i} ma otwarte ${d} poza planszę`);
          continue;
        }
        const n = ny * m.w + nx;
        const backHas = Boolean(m.open[n] & Lb.DIRS[Lb.DIRS[d].back].bit);
        assert.equal(has, backHas, `komórka ${i} ${d} vs sąsiad ${n}`);
        assert.equal(Lb.neighbor(m, i, d), has ? n : null);
      }
    }
  });
  t('entrance w dolnym rzędzie na środku', () => {
    const { x, y } = Lb.xy(m, m.entrance);
    assert.equal(y, m.h - 1);
    assert.equal(x, Math.floor(m.w / 2));
  });
  t('center w środku planszy', () => {
    const { x, y } = Lb.xy(m, m.center);
    assert.equal(x, Math.floor(m.w / 2));
    assert.equal(y, Math.floor(m.h / 2));
  });
  t('odległość wejście→środek >= 25', () => {
    assert.ok(DIST >= 25, `DIST=${DIST}`);
  });
  t('deadEnds >= 4', () => {
    assert.ok(Lb.deadEnds(m).length >= 4, `deadEnds=${Lb.deadEnds(m).length}`);
  });
  t('ślepe zaułki mają jedno wyjście i omijają wejście oraz środek', () => {
    for (const i of Lb.deadEnds(m)) {
      assert.equal(popcount(m.open[i]), 1, `komórka ${i}`);
      assert.ok(i !== m.entrance && i !== m.center, `komórka ${i}`);
    }
  });
});

/* --- B) labirynt: nić i spacer ------------------------------------------------- */

group('B) labirynt: nić i spacer', () => {
  t('stepThread: krok naprzód wydłuża', () => {
    assert.deepEqual(Lb.stepThread([5, 12], 19), [5, 12, 19]);
  });
  t('stepThread: krok na przedostatnią komórkę zwija', () => {
    assert.deepEqual(Lb.stepThread([5, 12, 19], 12), [5, 12]);
  });
  t("walkTo: dojście do center zmienia phase na 'out'", () => {
    let w = Lb.startWalk(m);
    for (const next of P.slice(1)) w = Lb.walkTo(m, w, next);
    assert.equal(w.phase, 'out');
    assert.equal(w.stepsIn, DIST);
    assert.deepEqual(w.thread, P);
  });
  t("powrót najkrótszą ścieżką daje phase 'done'", () => {
    let w = Lb.startWalk(m);
    for (const next of P.slice(1)) w = Lb.walkTo(m, w, next);
    for (const next of [...P].reverse().slice(1)) w = Lb.walkTo(m, w, next);
    assert.equal(w.phase, 'done');
  });
  t('stepsIn == stepsOut == odległość wejście→środek', () => {
    let w = Lb.startWalk(m);
    for (const next of P.slice(1)) w = Lb.walkTo(m, w, next);
    for (const next of [...P].reverse().slice(1)) w = Lb.walkTo(m, w, next);
    assert.equal(w.stepsIn, DIST);
    assert.equal(w.stepsOut, DIST);
  });
  t('nić na koniec == [entrance]', () => {
    let w = Lb.startWalk(m);
    for (const next of P.slice(1)) w = Lb.walkTo(m, w, next);
    for (const next of [...P].reverse().slice(1)) w = Lb.walkTo(m, w, next);
    assert.deepEqual(w.thread, [m.entrance]);
  });
  t('wejście w ślepy zaułek i powrót zwija nić do rozgałęzienia', () => {
    const E = Lb.deadEnds(m)[0];
    const Q = bfsPath(m, m.entrance, E);
    let common = 0;
    while (common < Q.length && common < P.length && Q[common] === P[common]) common += 1;
    assert.ok(common >= 1 && common < Q.length, `common=${common} Q=${Q.length}`);
    let w = Lb.startWalk(m);
    for (const next of Q.slice(1)) w = Lb.walkTo(m, w, next);
    assert.deepEqual(w.thread, Q);
    for (let k = Q.length - 1; k >= common; k--) w = Lb.walkTo(m, w, Q[k - 1]);
    assert.deepEqual(w.thread, P.slice(0, common));
    assert.equal(w.thread.length, common);
  });
  t('mimo błądzenia nić w środku == najkrótszej (D+1 komórek)', () => {
    const E = Lb.deadEnds(m)[0];
    const Q = bfsPath(m, m.entrance, E);
    let common = 0;
    while (common < Q.length && common < P.length && Q[common] === P[common]) common += 1;
    let w = Lb.startWalk(m);
    for (const next of Q.slice(1)) w = Lb.walkTo(m, w, next);
    for (let k = Q.length - 1; k >= common; k--) w = Lb.walkTo(m, w, Q[k - 1]);
    for (const next of P.slice(common)) w = Lb.walkTo(m, w, next);
    assert.equal(w.phase, 'out');
    assert.ok(w.stepsIn > DIST, `stepsIn=${w.stepsIn} DIST=${DIST}`);
    assert.deepEqual(w.thread, P);
    assert.equal(w.thread.length, DIST + 1);
  });
  t('walkToward nie przechodzi przez ściany (każdy krok to sąsiad)', () => {
    let w = Lb.startWalk(m);
    let moved = 0;
    for (let target = 0; target < m.w * m.h && w.phase !== 'done'; target++) {
      const from = w.thread[w.thread.length - 1];
      const nw = Lb.walkToward(m, w, target, 1);
      const to = nw.thread[nw.thread.length - 1];
      if (to !== from) {
        moved += 1;
        const legal = Object.keys(Lb.DIRS).some((d) => Lb.neighbor(m, from, d) === to);
        assert.ok(legal, `krok ${from} → ${to} (cel ${target}) to ściana`);
        const a = Lb.xy(m, from);
        const b = Lb.xy(m, to);
        assert.equal(Math.abs(a.x - b.x) + Math.abs(a.y - b.y), 1);
      }
      w = nw;
    }
    assert.ok(moved > 0, 'ani jeden krok — test niczego nie sprawdził');
  });
  t('stepToward w miejscu docelowym zwraca null', () => {
    for (const at of [m.entrance, m.center, 0]) assert.equal(Lb.stepToward(m, at, at), null);
  });
  for (const at of [m.entrance, m.center, P[Math.floor(P.length / 2)]]) {
    t(`visibleCells(_, ${at}, 2) zawiera ${at}`, () => {
      assert.ok(Lb.visibleCells(m, at, 2).has(at));
    });
    t(`visibleCells(_, ${at}, 2) to dokładnie komórki w odległości <= 2`, () => {
      const d = Lb.distances(m, at);
      const vis = Lb.visibleCells(m, at, 2);
      for (let i = 0; i < d.length; i++) assert.equal(vis.has(i), d[i] >= 0 && d[i] <= 2, `komórka ${i} d=${d[i]}`);
    });
  }
});

/* --- C) olimp + drzewo ---------------------------------------------------------- */

const TIERS = Tj.derivedTiers(Ol.OLIMP);

group('C) olimp + drzewo', () => {
  t('derivedTiers(OLIMP): najwyższe piętro to 2 (3 piętra)', () => {
    assert.equal(Math.max(...Object.values(TIERS)), 2);
  });
  t('Kronos na piętrze 0', () => {
    assert.equal(TIERS.kronos, 0);
  });
  t('Rea na piętrze 0', () => {
    assert.equal(TIERS.rea, 0);
  });
  for (const id of ['zeus', 'hera', 'posejdon', 'hades', 'demeter']) {
    t(`${id} na piętrze 1`, () => {
      assert.equal(TIERS[id], 1);
    });
  }
  for (const id of ['atena', 'hermes', 'persefona']) {
    t(`${id} na piętrze 2`, () => {
      assert.equal(TIERS[id], 2);
    });
  }
  t('judgeTree z tymi piętrami -> complete true', () => {
    assert.equal(Tj.judgeTree(Ol.OLIMP, { ...TIERS }).complete, true);
  });
  t('judgeTree z tymi piętrami -> brak konfliktów', () => {
    assert.deepEqual(Tj.judgeTree(Ol.OLIMP, { ...TIERS }).conflicts, []);
  });
  t("Zeus na 0 przy Kronosie na 0 -> konflikt 'dziecko-nie-nad-rodzicem' (zeus, kronos)", () => {
    const v = Tj.judgeTree(Ol.OLIMP, { ...TIERS, zeus: 0 });
    const hit = v.conflicts.find(
      (c) => c.kind === 'dziecko-nie-nad-rodzicem' && c.ids.includes('zeus') && c.ids.includes('kronos'),
    );
    assert.ok(hit, `konflikty: ${JSON.stringify(v.conflicts.map((c) => [c.kind, c.ids]))}`);
  });
  t("komunikat o bogach NIE zawiera 'ur.' (bogowie nie mają lat)", () => {
    const v = Tj.judgeTree(Ol.OLIMP, { ...TIERS, zeus: 0 });
    for (const c of v.conflicts) assert.ok(!c.message.includes('ur.'), c.message);
  });
  t("Hera na innym piętrze niż Zeus -> konflikt 'malzonkowie'", () => {
    const v = Tj.judgeTree(Ol.OLIMP, { ...TIERS, hera: 2 });
    const hit = v.conflicts.find(
      (c) => c.kind === 'malzonkowie' && c.ids.includes('hera') && c.ids.includes('zeus'),
    );
    assert.ok(hit, `konflikty: ${JSON.stringify(v.conflicts.map((c) => [c.kind, c.ids]))}`);
  });
  t('isSettled: Atena na miejscu, ale Zeus na tacy -> false', () => {
    const placement = { atena: 2 };
    const v = Tj.judgeTree(Ol.OLIMP, placement);
    assert.equal(Tj.isSettled(Ol.OLIMP, placement, v, 'atena'), false);
  });
  t('isSettled: po dostawieniu Zeusa, Kronosa i Rei poprawnie -> true', () => {
    const placement = { atena: 2, zeus: 1, kronos: 0, rea: 0 };
    const v = Tj.judgeTree(Ol.OLIMP, placement);
    assert.equal(Tj.isSettled(Ol.OLIMP, placement, v, 'atena'), true);
  });
  t('każdy bóg ma unikalny attribute', () => {
    const attrs = Ol.OLIMP.map((g) => g.attribute);
    assert.equal(new Set(attrs).size, Ol.OLIMP.length);
  });
});

/* --- D) mowa --------------------------------------------------------------------- */

group('D) mowa', () => {
  t('6 fraz i 6 zdań', () => {
    assert.equal(Mw.PHRASES.length, 6);
    assert.equal(Mw.SENTENCES.length, 6);
  });
  t("każde zdanie ma dokładnie jedno '___'", () => {
    for (const s of Mw.SENTENCES) {
      const n = (s.text.match(/___/g) ?? []).length;
      assert.equal(n, 1, `${s.id}: luk=${n}`);
    }
  });
  t('answer wskazuje istniejące PHRASES', () => {
    const ids = new Set(Mw.PHRASES.map((p) => p.id));
    for (const s of Mw.SENTENCES) assert.ok(ids.has(s.answer), `${s.id} → ${s.answer}`);
  });
  t('odpowiedzi są różne (bijekcja 6↔6)', () => {
    assert.equal(new Set(Mw.SENTENCES.map((s) => s.answer)).size, 6);
  });
  for (const s of Mw.SENTENCES) {
    t(`judgePhrase poprawna para (${s.answer} → ${s.id}) -> ok true`, () => {
      assert.deepEqual(Mw.judgePhrase(s.answer, s.id), { ok: true });
    });
  }
  for (const s of Mw.SENTENCES) {
    t(`judgePhrase złe pary do ${s.id} -> ok false, tekst wyrażenia i 'potrzebuje'`, () => {
      for (const p of Mw.PHRASES.filter((x) => x.id !== s.answer)) {
        const r = Mw.judgePhrase(p.id, s.id);
        assert.equal(r.ok, false, `${p.id} → ${s.id}`);
        assert.ok(r.message.includes(p.text), `brak „${p.text}” w: ${r.message}`);
        assert.ok(r.message.includes('potrzebuje'), `brak „potrzebuje” w: ${r.message}`);
      }
    });
  }
});

/* --- E) natura --------------------------------------------------------------------- */

group('E) natura', () => {
  t('każde zjawisko ma answer z TOOLS', () => {
    const ids = new Set(Nt.TOOLS.map((x) => x.id));
    for (const p of Nt.PHENOMENA) assert.ok(ids.has(p.answer), `${p.id} → ${p.answer}`);
  });
  t('odpowiedzi zjawisk są różne', () => {
    assert.equal(new Set(Nt.PHENOMENA.map((p) => p.answer)).size, Nt.PHENOMENA.length);
  });
  for (const p of Nt.PHENOMENA) {
    t(`judgeExplanation poprawne (${p.answer} → ${p.id}) -> ok`, () => {
      assert.deepEqual(Nt.judgeExplanation(p.answer, p.id), { ok: true });
    });
  }
  for (const p of Nt.PHENOMENA) {
    t(`judgeExplanation złe do ${p.id} -> message z nazwą właściciela atrybutu`, () => {
      for (const x of Nt.TOOLS.filter((y) => y.id !== p.answer)) {
        const r = Nt.judgeExplanation(x.id, p.id);
        assert.equal(r.ok, false, `${x.id} → ${p.id}`);
        assert.ok(r.message.includes(x.owner), `brak „${x.owner}” w: ${r.message}`);
      }
    });
  }
  t('ECHO_WHO ma 3 elementy', () => {
    assert.equal(Nt.ECHO_WHO.length, 3);
  });
  t('ECHO_WHAT ma 3 elementy', () => {
    assert.equal(Nt.ECHO_WHAT.length, 3);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

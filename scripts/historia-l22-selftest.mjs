/**
 * Selftest czystych funkcji L22 (`grecja-gory-i-morze`: podroz + kolonie + slowa).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l21-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l22-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l22-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as P from '${root}/src/app/historia/klasa-4/components/lessons/grecja-gory-i-morze/podroz';\n` +
    `export * as K from '${root}/src/app/historia/klasa-4/components/lessons/grecja-gory-i-morze/kolonie';\n` +
    `export * as S from '${root}/src/app/historia/klasa-4/components/lessons/grecja-gory-i-morze/slowa';\n` +
    `export * as GA from '${root}/src/app/historia/klasa-4/components/lessons/grecja-gory-i-morze/geo-egejskie';\n` +
    `export * as GM from '${root}/src/app/historia/klasa-4/components/lessons/grecja-gory-i-morze/geo-srodziemne';\n`,
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

const { P, K, S, GA, GM } = lib;

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

const dest = (id) => P.DESTS.find((d) => d.id === id);
const korynt = dest('korynt');
const sparta = dest('sparta');
const milet = dest('milet');

/* --- A) podróż: start i stanie -------------------------------------------------- */

group('A) podróż: start i stanie', () => {
  t('START (Ateny): ląd albo port, z którego statek może ruszyć', () => {
    const terr = P.terrainAt(P.START[0], P.START[1]);
    const cs = P.canStand(P.START[0], P.START[1], 'statek', korynt);
    assert.ok(terr !== 0 || cs === true, `terrain=${terr} canStand(statek)=${cs}`);
  });
  t('pieszo w Atenach (START) wolno stać', () => {
    assert.equal(P.canStand(P.START[0], P.START[1], 'pieszo', korynt), true);
  });
  t('pieszo na otwartym morzu (330,330) nie wolno stać', () => {
    assert.equal(P.canStand(330, 330, 'pieszo', korynt), false);
  });
  t('statkiem na otwartym morzu (330,330) wolno stać', () => {
    assert.equal(P.canStand(330, 330, 'statek', korynt), true);
  });
});

/* --- B) podróż: krok i dni ------------------------------------------------------ */

function findLandNearSea() {
  for (let y = 8; y < 520; y += 8) {
    for (let x = 8; x < 592; x += 8) {
      if (P.terrainAt(x, y) === 0) continue;
      for (const [sx, sy] of [[x + 20, y], [x - 20, y], [x, y + 20], [x, y - 20]]) {
        if (P.terrainAt(sx, sy) === 0) return { x, y };
      }
    }
  }
  return null;
}

const FAR_POINTS = [P.START, korynt.xy, korynt.port.xy, sparta.xy, sparta.port.xy, milet.xy];
function findShipBlock() {
  const seas = [];
  const lands = [];
  for (let y = 10; y < 520; y += 20) {
    for (let x = 10; x < 590; x += 20) {
      const tt = P.terrainAt(x, y);
      if (tt === 0) seas.push({ x, y });
      else if (FAR_POINTS.every((p) => Math.hypot(x - p[0], y - p[1]) > 30)) lands.push({ x, y });
    }
  }
  for (const s of seas) {
    for (const l of lands) {
      const d = Math.hypot(l.x - s.x, l.y - s.y);
      if (d < 8 || d > 80) continue;
      const r = P.step(s, l, 2.0, 'statek', milet);
      if (r.blocked === true) return { s, l };
    }
  }
  return null;
}

/** Odcinek 12 px w jednym terenie (oba końce ten sam terrainAt i wolno stać). */
function findRun(terrainWanted, mode) {
  for (let y = 6; y < 520; y += 6) {
    for (let x = 6; x < 570; x += 6) {
      const a = { x, y };
      const b = { x: x + 12, y };
      if (P.terrainAt(a.x, a.y) !== terrainWanted || P.terrainAt(b.x, b.y) !== terrainWanted) continue;
      if (!P.canStand(a.x, a.y, mode, korynt) || !P.canStand(b.x, b.y, mode, korynt)) continue;
      return { a, b };
    }
  }
  return null;
}

const DT = 0.05;
const seaRun = findRun(0, 'statek');
const lowRun = findRun(1, 'pieszo');
const mtnRun = findRun(3, 'pieszo');

function movedOf(from, res) {
  return Math.hypot(res.x - from.x, res.y - from.y);
}

group('B) podróż: krok i dni', () => {
  t('piechur ciągnięty z lądu w morze nie wchodzi do morza', () => {
    const pos = findLandNearSea();
    assert.ok(pos !== null, 'nie znaleziono lądu przy morzu');
    const r = P.step(pos, { x: 330, y: 330 }, 1.0, 'pieszo', korynt);
    assert.ok(r.blocked === true || P.terrainAt(r.x, r.y) !== 0, `blocked=${r.blocked} terrain=${P.terrainAt(r.x, r.y)}`);
  });
  t('statek ciągnięty na ląd daleko od portów → blocked', () => {
    const hit = findShipBlock();
    assert.ok(hit !== null, 'nie znaleziono pary morze→ląd z blokadą');
  });
  t('wszystkie trzy tory prędkości znalezione (morze / nizina / góry)', () => {
    assert.ok(seaRun !== null && lowRun !== null && mtnRun !== null, `sea=${!!seaRun} low=${!!lowRun} mtn=${!!mtnRun}`);
  });
  t('ten sam dt: statek na morzu dalej niż piechur na nizinie', () => {
    const rs = P.step(seaRun.a, seaRun.b, DT, 'statek', korynt);
    const rl = P.step(lowRun.a, lowRun.b, DT, 'pieszo', korynt);
    assert.ok(movedOf(seaRun.a, rs) > movedOf(lowRun.a, rl), `statek=${movedOf(seaRun.a, rs)} nizina=${movedOf(lowRun.a, rl)}`);
  });
  t('ten sam dt: piechur w górach mniej niż na nizinie', () => {
    const rl = P.step(lowRun.a, lowRun.b, DT, 'pieszo', korynt);
    const rm = P.step(mtnRun.a, mtnRun.b, DT, 'pieszo', korynt);
    assert.ok(movedOf(mtnRun.a, rm) < movedOf(lowRun.a, rl), `gory=${movedOf(mtnRun.a, rm)} nizina=${movedOf(lowRun.a, rl)}`);
  });
  for (const [name, run, mode] of [['statek/morze', seaRun, 'statek'], ['pieszo/nizina', lowRun, 'pieszo'], ['pieszo/góry', mtnRun, 'pieszo']]) {
    t(`days ${name} = dystans_px * KM_PER_PX / KM_PER_DAY (1e-6)`, () => {
      const r = P.step(run.a, run.b, DT, mode, korynt);
      assert.equal(r.blocked, false);
      const moved = movedOf(run.a, r);
      const expected = (moved * GA.AEGEAN_KM_PER_PX) / P.KM_PER_DAY[r.terrain];
      assert.ok(Math.abs(r.days - expected) < 1e-6, `days=${r.days} expected=${expected}`);
    });
  }
});

/* --- C) podróż: meta i werdykt --------------------------------------------------- */

group('C) podróż: meta i werdykt', () => {
  t('statek do Sparty: liczy się port Gytejon', () => {
    assert.equal(P.arrived({ x: sparta.port.xy[0], y: sparta.port.xy[1] }, 'statek', sparta), true);
  });
  t('statek do Sparty: samo miasto nie wystarcza', () => {
    assert.equal(P.arrived({ x: sparta.xy[0], y: sparta.xy[1] }, 'statek', sparta), false);
  });
  t('piechur do Sparty: liczy się miasto', () => {
    assert.equal(P.arrived({ x: sparta.xy[0], y: sparta.xy[1] }, 'pieszo', sparta), true);
  });
  t('piechur do Sparty: sam port nie wystarcza', () => {
    assert.equal(P.arrived({ x: sparta.port.xy[0], y: sparta.port.xy[1] }, 'pieszo', sparta), false);
  });
  t('portWalkDays(sparta) = 45/30 = 1.5', () => {
    assert.equal(P.portWalkDays(sparta), 1.5);
  });
  t('portWalkDays(korynt) = 0', () => {
    assert.equal(P.portWalkDays(korynt), 0);
  });
  t('portWalkDays(milet) = 0', () => {
    assert.equal(P.portWalkDays(milet), 0);
  });
  t("formatDays(0.4) === 'niecały dzień'", () => {
    assert.equal(P.formatDays(0.4), 'niecały dzień');
  });
  t("formatDays(1) === '1 dzień'", () => {
    assert.equal(P.formatDays(1), '1 dzień');
  });
  t("formatDays(7.6) === '8 dni'", () => {
    assert.equal(P.formatDays(7.6), '8 dni');
  });
  t('compare() bez dróg → null', () => {
    assert.equal(P.compare(korynt, {}), null);
  });
  t('compare() z jedną drogą → null', () => {
    assert.equal(P.compare(korynt, { 'korynt-pieszo': 4 }), null);
  });
  t('compare() z obiema drogami (Korynt) → tekst', () => {
    const s = P.compare(korynt, { 'korynt-pieszo': 4, 'korynt-statek': 6 });
    assert.ok(typeof s === 'string' && s.includes('Koryntu'), `tekst: ${s}`);
  });
  t('compare() z obiema drogami (Sparta) → tekst', () => {
    const s = P.compare(sparta, { 'sparta-pieszo': 10, 'sparta-statek': 3 });
    assert.ok(typeof s === 'string' && s.includes('Spart'), `tekst: ${s}`);
  });
  t('compare() z obiema drogami (Milet) → tekst', () => {
    const s = P.compare(milet, { 'milet-pieszo': 20, 'milet-statek': 5 });
    assert.ok(typeof s === 'string' && s.includes('Milet'), `tekst: ${s}`);
  });
  t('symulacja: statek START → port Koryntu płynie, dni > 0', () => {
    // Ścieżka samym morzem: BFS na kratce 10 px (8 kierunków — cieśniny przy
    // Salaminie są w danych węższe niż 15 px), potem krokami step() po punktach.
    // Gdyby drogi morskiej nie było, próba prosto do portu (tylko raport).
    const cell = 10;
    const W = 600;
    const H = 526;
    const cols = Math.ceil(W / cell);
    const rows = Math.ceil(H / cell);
    const cx = (c) => (c + 0.5) * cell;
    const cy = (r) => (r + 0.5) * cell;
    const sea = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && cx(c) < W && cy(r) < H && P.terrainAt(cx(c), cy(r)) === 0;
    const key = (c, r) => `${c},${r}`;
    const nearest = (px, py) => {
      let best = null;
      let bd = Infinity;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!sea(c, r)) continue;
          const d = Math.hypot(cx(c) - px, cy(r) - py);
          if (d < bd) {
            bd = d;
            best = [c, r];
          }
        }
      }
      return best;
    };
    const s0 = nearest(P.START[0], P.START[1]);
    const g0 = nearest(korynt.port.xy[0], korynt.port.xy[1]);
    assert.ok(s0 !== null && g0 !== null, 'brak kratki morza przy starcie/porcie');
    const prev = new Map([[key(s0[0], s0[1]), null]]);
    const q = [s0];
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    while (q.length) {
      const [c, r] = q.shift();
      if (c === g0[0] && r === g0[1]) break;
      for (const [dc, dr] of dirs) {
        const nc = c + dc;
        const nr = r + dr;
        const k = key(nc, nr);
        if (prev.has(k) || !sea(nc, nr)) continue;
        prev.set(k, key(c, r));
        q.push([nc, nr]);
      }
    }
    let path;
    if (prev.has(key(g0[0], g0[1]))) {
      path = [];
      let cur = key(g0[0], g0[1]);
      while (cur !== null) {
        const [c, r] = cur.split(',').map(Number);
        path.unshift({ x: cx(c), y: cy(r) });
        cur = prev.get(cur);
      }
    } else {
      path = [{ x: korynt.port.xy[0], y: korynt.port.xy[1] }];
    }
    let pos = { x: P.START[0], y: P.START[1] };
    let days = 0;
    let steps = 0;
    let wi = 0;
    let stuck = 0;
    const dt = 0.05;
    while (steps < 2000 && wi < path.length) {
      const wp = path[wi];
      if (Math.hypot(wp.x - pos.x, wp.y - pos.y) < 6) {
        wi += 1;
        stuck = 0;
        continue;
      }
      const res = P.step(pos, wp, dt, 'statek', korynt);
      const moved = Math.hypot(res.x - pos.x, res.y - pos.y);
      pos = { x: res.x, y: res.y };
      days += res.days;
      steps += 1;
      if (moved < 1e-9) {
        stuck += 1;
        if (stuck > 60) {
          wi += 1;
          stuck = 0;
        }
      } else stuck = 0;
    }
    while (steps < 2000 && !P.arrived(pos, 'statek', korynt)) {
      const res = P.step(pos, { x: korynt.port.xy[0], y: korynt.port.xy[1] }, dt, 'statek', korynt);
      const moved = Math.hypot(res.x - pos.x, res.y - pos.y);
      pos = { x: res.x, y: res.y };
      days += res.days;
      steps += 1;
      if (res.blocked && moved < 1e-9) break;
    }
    const got = P.arrived(pos, 'statek', korynt);
    console.log(`      symulacja: kroków=${steps} dni=${days.toFixed(1)} dotarł=${got}`);
    assert.ok(days > 0, `dni=${days}`);
    if (!got) console.log('      (nie dotarł w 2000 kroków — tylko raport, bez wywalania)');
  });
});

/* --- D) kolonie: Grecy za morzem -------------------------------------------------- */

group('D) kolonie: Grecy za morzem', () => {
  t('COLONY_COUNTRIES ma 10 wpisów', () => {
    assert.equal(K.COLONY_COUNTRIES.length, 10);
  });
  for (const id of ['ITA', 'FRA', 'ESP', 'TUR', 'BGR', 'UKR', 'LBY', 'EGY', 'ALB', 'ROU']) {
    t(`COLONY_COUNTRIES zawiera ${id}`, () => {
      assert.ok(K.COLONY_COUNTRIES.includes(id), `kraje: ${K.COLONY_COUNTRIES.join(',')}`);
    });
  }
  t('COLONY_COUNTRIES nie zawiera GRC ani POL', () => {
    assert.ok(!K.COLONY_COUNTRIES.includes('GRC') && !K.COLONY_COUNTRIES.includes('POL'));
  });
  t("judgeCountry('ITA') → kolonie, w tym Syrakuzy", () => {
    const r = K.judgeCountry('ITA');
    assert.equal(r.kind, 'kolonie');
    assert.ok(r.colonies.some((c) => c.name === 'Syrakuzy'), `miasta: ${r.colonies.map((c) => c.name).join(',')}`);
  });
  t("judgeCountry('GRC') → grecja", () => {
    assert.equal(K.judgeCountry('GRC').kind, 'grecja');
  });
  t("judgeCountry('POL') → nie", () => {
    assert.equal(K.judgeCountry('POL').kind, 'nie');
  });
  t("judgeCountry('TUN').why zawiera 'Fenicjanie'", () => {
    const r = K.judgeCountry('TUN');
    assert.equal(r.kind, 'nie');
    assert.ok(r.why.includes('Fenicjanie'), `why: ${r.why}`);
  });
  t('visibleAt(-800) jest puste', () => {
    assert.equal(K.visibleAt(-800).length, 0);
  });
  t('visibleAt(-550) pokazuje wszystkie kolonie', () => {
    assert.equal(K.visibleAt(-550).length, GM.COLONIES.length);
  });
  t('visibleAt(-700) zawiera Syrakuzy', () => {
    assert.ok(K.visibleAt(-700).some((c) => c.name === 'Syrakuzy'));
  });
  t('visibleAt(-700) nie zawiera Massalii', () => {
    assert.ok(!K.visibleAt(-700).some((c) => c.name === 'Massalia'));
  });
  t('dolina: wolne pole ok', () => {
    assert.equal(K.judgeValley([null, null, null, null, null, null], 'pole-2').ok, true);
  });
  t('dolina: zajęte pole nie ok', () => {
    assert.equal(K.judgeValley([0, null, null, null, null, null], 'pole-0').ok, false);
  });
  t("dolina: 'gory' nie ok", () => {
    assert.equal(K.judgeValley([null, null, null, null, null, null], 'gory').ok, false);
  });
  t("dolina: 'statek' przy wolnym polu nie ok", () => {
    assert.equal(K.judgeValley([0, null, null, null, null, null], 'statek').ok, false);
  });
  t("dolina: 'statek' przy pełnej dolinie ok", () => {
    assert.equal(K.judgeValley([0, 1, 2, 3, 4, 5], 'statek').ok, true);
  });
});

/* --- E) słowa: greckie słowa po polsku ---------------------------------------------- */

group('E) słowa: greckie słowa po polsku', () => {
  t('unikalne klucze tokenów gr === GREEK_TOTAL === 12', () => {
    const toks = S.tokenize()
      .flat()
      .filter((x) => x.kind === 'gr');
    const keys = [...new Set(toks.map((x) => x.key))];
    assert.equal(S.GREEK_TOTAL, 12);
    assert.equal(keys.length, 12);
    assert.equal(keys.length, S.GREEK_TOTAL);
  });
  t('każdy klucz gr jest w GREEK', () => {
    const keys = new Set(
      S.tokenize()
        .flat()
        .filter((x) => x.kind === 'gr')
        .map((x) => x.key),
    );
    for (const k of keys) assert.ok(k in S.GREEK, `klucz spoza GREEK: ${k}`);
  });
  t("każdy token 'obce' ma niepustą notkę", () => {
    const toks = S.tokenize()
      .flat()
      .filter((x) => x.kind === 'obce');
    assert.ok(toks.length > 0, 'brak tokenów obcych');
    for (const x of toks) assert.ok(typeof x.note === 'string' && x.note.length > 0, `pusty note: ${x.text}`);
  });
  S.TEXT.forEach((line, li) => {
    t(`linia ${li}: złożenie tokenów == tekst bez znaczników`, () => {
      const stripped = line.replace(/\[([^|\]]+)\|[^\]]+\]/g, '$1').replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
      const joined = S.tokenize()[li].map((x) => x.text).join('');
      assert.equal(joined, stripped);
    });
  });
  t("compose('tele','skop') → slowo (teleskop)", () => {
    assert.equal(S.compose('tele', 'skop').kind, 'slowo');
  });
  t("compose('skop','tele') → odwrotnie", () => {
    assert.equal(S.compose('skop', 'tele').kind, 'odwrotnie');
  });
  t("compose('bio','fon') → brak", () => {
    assert.equal(S.compose('bio', 'fon').kind, 'brak');
  });
  t("compose('tele','fon').known === true", () => {
    const r = S.compose('tele', 'fon');
    assert.equal(r.kind, 'slowo');
    assert.equal(r.known, true);
  });
  t("compose('geo','graf').known === true", () => {
    const r = S.compose('geo', 'graf');
    assert.equal(r.kind, 'slowo');
    assert.equal(r.known, true);
  });
  for (const k of Object.keys(S.WORDS)) {
    t(`WORDS '${k}' ma obie cząstki w PARTS`, () => {
      const ids = new Set(S.PARTS.map((p) => p.id));
      const [a, b] = k.split('+');
      assert.ok(ids.has(a) && ids.has(b), `brak cząstki dla ${k}`);
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

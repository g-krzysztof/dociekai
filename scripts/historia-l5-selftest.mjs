/**
 * Selftest czystych funkcji L5 (`historia-mojej-rodziny`).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/streak-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l5-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l5-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * from '${root}/src/app/historia/klasa-4/components/family-tree/tree-judge';\n` +
    `export * from '${root}/src/app/historia/klasa-4/components/lessons/historia-mojej-rodziny/rodzina-lisieckich';\n` +
    `export * from '${root}/src/app/historia/klasa-4/components/lessons/historia-mojej-rodziny/pokrewienstwo';\n` +
    `export * from '${root}/src/app/historia/klasa-4/components/lessons/historia-mojej-rodziny/kufer';\n` +
    `export * from '${root}/src/app/historia/klasa-4/components/lessons/historia-mojej-rodziny/wywiad';\n`
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node' });

const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const {
  judgeTree,
  derivedTiers,
  treeSpan,
  LISIECCY,
  judgeKin,
  KIN_PEOPLE,
  KIN_TERMS,
  judgeYear,
  judgeCrosscheck,
  judgeStoryStep,
  CHEST,
  judgeInterview,
  ownQuestionForm,
  judgeFamilyYear,
  QUESTION_BANK,
} = lib;

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

/* --- A) drzewo ------------------------------------------------------ */

group('A) drzewo', () => {
  const tiers = derivedTiers(LISIECCY);

  t('derivedTiers: wincenty=0', () => assert.equal(tiers.wincenty, 0));
  t('derivedTiers: stanislawa=0', () => assert.equal(tiers.stanislawa, 0));
  t('derivedTiers: jozef=1', () => assert.equal(tiers.jozef, 1));
  t('derivedTiers: halina=1', () => assert.equal(tiers.halina, 1));
  t('derivedTiers: marek=2', () => assert.equal(tiers.marek, 2));
  t('derivedTiers: dorota=2', () => assert.equal(tiers.dorota, 2));
  t('derivedTiers: ewa=2', () => assert.equal(tiers.ewa, 2));
  t('derivedTiers: tomek=2', () => assert.equal(tiers.tomek, 2));
  t('derivedTiers: franek=3', () => assert.equal(tiers.franek, 3));
  t('derivedTiers: zosia=3', () => assert.equal(tiers.zosia, 3));

  t('pełne poprawne rozstawienie: complete true', () => {
    const full = Object.fromEntries(LISIECCY.map((p) => [p.id, tiers[p.id]]));
    const v = judgeTree(LISIECCY, full);
    assert.equal(v.complete, true);
  });
  t('pełne poprawne rozstawienie: conflicts []', () => {
    const full = Object.fromEntries(LISIECCY.map((p) => [p.id, tiers[p.id]]));
    const v = judgeTree(LISIECCY, full);
    assert.deepEqual(v.conflicts, []);
  });
  t('puste rozstawienie: complete false', () => {
    assert.equal(judgeTree(LISIECCY, {}).complete, false);
  });
  t('puste rozstawienie: placed 0', () => {
    assert.equal(judgeTree(LISIECCY, {}).placed, 0);
  });

  t('Marek na 1 przy Józefie na 1: konflikt dziecko-nie-nad-rodzicem', () => {
    const v = judgeTree(LISIECCY, { marek: 1, jozef: 1 });
    const c = v.conflicts.find((x) => x.kind === 'dziecko-nie-nad-rodzicem');
    assert.ok(c, 'brak konfliktu kind dziecko-nie-nad-rodzicem');
    assert.deepEqual([...c.ids].sort(), ['jozef', 'marek']);
    assert.ok(c.message.includes('1978'), `message bez 1978: ${c.message}`);
    assert.ok(c.message.includes('1950'), `message bez 1950: ${c.message}`);
  });

  t('Franek na 3 a Marek na 1: konflikt za-wysoko', () => {
    const v = judgeTree(LISIECCY, { franek: 3, marek: 1 });
    assert.ok(
      v.conflicts.some((x) => x.kind === 'za-wysoko'),
      `brak konfliktu za-wysoko, jest: ${JSON.stringify(v.conflicts.map((x) => x.kind))}`
    );
  });

  t('Halina na 2 przy Józefie na 1: dokładnie jeden konflikt malzonkowie', () => {
    const v = judgeTree(LISIECCY, { halina: 2, jozef: 1 });
    const pair = v.conflicts.filter((x) => x.kind === 'malzonkowie');
    assert.equal(pair.length, 1);
  });

  t('osoba niepostawiona nie generuje konfliktów (pusto)', () => {
    assert.deepEqual(judgeTree(LISIECCY, {}).conflicts, []);
  });
  t('osoba niepostawiona nie generuje konfliktów (sam Marek)', () => {
    assert.deepEqual(judgeTree(LISIECCY, { marek: 1 }).conflicts, []);
  });

  t('treeSpan: generations 4', () => assert.equal(treeSpan(LISIECCY).generations, 4));
  t('treeSpan: oldest.id wincenty', () => assert.equal(treeSpan(LISIECCY).oldest.id, 'wincenty'));
  t('treeSpan: youngest.id franek', () => assert.equal(treeSpan(LISIECCY).youngest.id, 'franek'));
  t('treeSpan: years 92', () => assert.equal(treeSpan(LISIECCY).years, 92));
});

/* --- B) pokrewieństwo ------------------------------------------------ */

group('B) pokrewieństwo', () => {
  for (const p of KIN_PEOPLE) {
    t(`własna tabliczka ok: osoba nr ${p.n}`, () => {
      assert.equal(judgeKin(p, p.answer).ok, true);
    });
  }

  for (const p of KIN_PEOPLE) {
    for (const term of KIN_TERMS) {
      if (term.id === p.answer) continue;
      t(`obca tabliczka nok z notą: osoba nr ${p.n} × ${term.id}`, () => {
        const v = judgeKin(p, term.id);
        assert.equal(v.ok, false);
        assert.equal(typeof v.note, 'string');
        assert.ok(v.note.length > 0, 'pusta nota');
        assert.ok(v.note.includes('osoba nr'), `nota bez numeru osoby: ${v.note}`);
      });
    }
  }

  t('odpowiedzi parami różne (6 unikalnych answer)', () => {
    assert.equal(new Set(KIN_PEOPLE.map((p) => p.answer)).size, 6);
  });
  t('numery 1..6 unikalne', () => {
    assert.deepEqual(
      KIN_PEOPLE.map((p) => p.n)
        .slice()
        .sort((a, b) => a - b),
      [1, 2, 3, 4, 5, 6]
    );
  });

  const bySays = (says) => KIN_PEOPLE.find((p) => p.says === says);
  t('brat taty Franka => stryj', () => {
    assert.equal(bySays('Jestem bratem taty Franka.').answer, 'stryj');
  });
  t('brat mamy Franka => wuj', () => {
    assert.equal(bySays('Jestem bratem mamy Franka.').answer, 'wuj');
  });
  t('tata jest bratem taty Franka => kuzyn', () => {
    assert.equal(bySays('Mój tata jest bratem taty Franka.').answer, 'kuzyn');
  });
});

/* --- C) kufer --------------------------------------------------------- */

group('C) kufer', () => {
  for (const item of CHEST) {
    t(`judgeYear przyjmuje rok przedmiotu: ${item.id}`, () => {
      assert.equal(judgeYear(item, String(item.year)).ok, true);
    });
  }

  const zegarek = CHEST.find((i) => i.id === 'zegarek');
  const legitymacja = CHEST.find((i) => i.id === 'legitymacja');

  t('judgeYear: "abc" => ok false', () => {
    assert.equal(judgeYear(zegarek, 'abc').ok, false);
  });
  t('judgeYear: "25" przy zegarku => ok false z notą o 25', () => {
    const v = judgeYear(zegarek, '25');
    assert.equal(v.ok, false);
    assert.ok(v.note && v.note.includes('25'), `nota bez 25: ${v.note}`);
  });
  t('judgeYear: "1924" przy legitymacji => ok false z notą o roku urodzenia', () => {
    const v = judgeYear(legitymacja, '1924');
    assert.equal(v.ok, false);
    assert.ok(v.note && v.note.includes('urodzenia'), `nota bez roku urodzenia: ${v.note}`);
  });
  t('judgeYear: "1999" => ok false', () => {
    assert.equal(judgeYear(zegarek, '1999').ok, false);
  });

  t('judgeCrosscheck("1950") ok true', () => {
    assert.equal(judgeCrosscheck('1950').ok, true);
  });
  t('judgeCrosscheck("1952") ok false', () => {
    assert.equal(judgeCrosscheck('1952').ok, false);
  });

  const years = { zegarek: 1971, legitymacja: 1948, medal: 1949, list: 1952 };

  t('opowieść: [] + legitymacja => ok', () => {
    assert.equal(judgeStoryStep(years, [], 'legitymacja').ok, true);
  });
  t('opowieść: [] + zegarek => nok z notą o 1948', () => {
    const v = judgeStoryStep(years, [], 'zegarek');
    assert.equal(v.ok, false);
    assert.ok(v.note && v.note.includes('1948'), `nota bez 1948: ${v.note}`);
  });
  t('opowieść: [legitymacja] + medal => ok', () => {
    assert.equal(judgeStoryStep(years, ['legitymacja'], 'medal').ok, true);
  });
  t('opowieść: [legitymacja, medal] + zegarek => nok (został list 1952)', () => {
    assert.equal(judgeStoryStep(years, ['legitymacja', 'medal'], 'zegarek').ok, false);
  });
  t('opowieść: [legitymacja, medal, list] + zegarek => ok', () => {
    assert.equal(judgeStoryStep(years, ['legitymacja', 'medal', 'list'], 'zegarek').ok, true);
  });
});

/* --- D) wywiad -------------------------------------------------------- */

group('D) wywiad', () => {
  t('urodziny+pamiatka+dzien: wszystkie 4 kryteria ok', () => {
    const v = judgeInterview(['urodziny', 'pamiatka', 'dzien'], '').verdicts;
    assert.equal(v.trzy.ok, true);
    assert.equal(v.czas.ok, true);
    assert.equal(v.otwarte.ok, true);
    assert.equal(v.slad.ok, true);
  });
  t('szkola+pies+najstarszy: trzy ok, reszta nok', () => {
    const v = judgeInterview(['szkola', 'pies', 'najstarszy'], '').verdicts;
    assert.equal(v.trzy.ok, true);
    assert.equal(v.czas.ok, false);
    assert.equal(v.otwarte.ok, false);
    assert.equal(v.slad.ok, false);
  });
  t('dwa pytania: trzy nok', () => {
    assert.equal(judgeInterview(['urodziny', 'pamiatka'], '').verdicts.trzy.ok, false);
  });
  t('dwa pytania + własne dobre: trzy ok', () => {
    const v = judgeInterview(['urodziny', 'pamiatka'], 'Jak świętowaliście urodziny, kiedy byłaś mała?').verdicts;
    assert.equal(v.trzy.ok, true);
  });
  t('dwa pytania + "to nie jest pytanie": trzy nok', () => {
    const v = judgeInterview(['urodziny', 'pamiatka'], 'to nie jest pytanie').verdicts;
    assert.equal(v.trzy.ok, false);
  });
  t('cztery pytania: trzy nok', () => {
    const v = judgeInterview(['urodziny', 'pamiatka', 'dzien', 'pies'], '').verdicts;
    assert.equal(v.trzy.ok, false);
  });

  t('ownQuestionForm("Jak było?") => valid false', () => {
    assert.equal(ownQuestionForm('Jak było?').valid, false);
  });
  t('ownQuestionForm("Kiedy poznaliście się z dziadkiem?") => valid + czas + otwarte', () => {
    const f = ownQuestionForm('Kiedy poznaliście się z dziadkiem?');
    assert.equal(f.valid, true);
    assert.ok(f.tags.includes('czas'), `brak tagu czas: ${JSON.stringify(f.tags)}`);
    assert.ok(f.tags.includes('otwarte'), `brak tagu otwarte: ${JSON.stringify(f.tags)}`);
  });
  t('ownQuestionForm("Czy lubiłaś szkołę podstawową?") => valid bez otwarte', () => {
    const f = ownQuestionForm('Czy lubiłaś szkołę podstawową?');
    assert.equal(f.valid, true);
    assert.ok(!f.tags.includes('otwarte'), `nieoczekiwany tag otwarte: ${JSON.stringify(f.tags)}`);
  });

  t('judgeFamilyYear({ja:2016},"rodzic",2020) => string', () => {
    assert.equal(typeof judgeFamilyYear({ ja: 2016 }, 'rodzic', 2020), 'string');
  });
  t('judgeFamilyYear({ja:2016},"rodzic",1980) => null', () => {
    assert.equal(judgeFamilyYear({ ja: 2016 }, 'rodzic', 1980), null);
  });
  t('judgeFamilyYear({rodzic:1980},"dziadek",1990) => string', () => {
    assert.equal(typeof judgeFamilyYear({ rodzic: 1980 }, 'dziadek', 1990), 'string');
  });
  t('judgeFamilyYear({rodzic:1980},"dziadek",1955) => null', () => {
    assert.equal(judgeFamilyYear({ rodzic: 1980 }, 'dziadek', 1955), null);
  });

  t('QUESTION_BANK ma 9 pytań (kontrola importu)', () => {
    assert.equal(QUESTION_BANK.length, 9);
  });
});

if (failures.length === 0) {
  console.log(`\nOK ${total}`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}

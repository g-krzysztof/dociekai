/**
 * Selftest L1 „Język działa” (`jezyk-dziala/`) — kartki, skutki/poranek i wizytówka.
 *
 * Wzorzec: `scripts/polski-korpus-selftest.mjs` — esbuild bundluje moduły TS
 * do pliku tymczasowego w `os.tmpdir()`, potem asercje na czystych funkcjach.
 * Nie zmienia plików lekcji: czerwona asercja to opis w podsumowaniu, nie poprawka.
 *
 *   node scripts/polski-l01-selftest.mjs
 */

import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l01-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

const SOURCES = [
  'src/app/jezyk-polski/klasa-4/components/lessons/jezyk-dziala/kartki.ts',
  'src/app/jezyk-polski/klasa-4/components/lessons/jezyk-dziala/wizytowka.ts',
  'src/app/jezyk-polski/klasa-4/components/lessons/jezyk-dziala/skutki.ts',
  'src/app/jezyk-polski/klasa-4/components/lessons/jezyk-dziala/poranek.ts',
  'src/app/jezyk-polski/klasa-4/components/lessons/jezyk-dziala/gumka.ts',
  'src/app/jezyk-polski/klasa-4/lib/korpus/index.ts',
];

await writeFile(
  entry,
  `${SOURCES.map((s) => `export * from '${resolve(root, s)}';`).join('\n')}\n`,
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node' });

const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const {
  SPRAWY,
  MIEJSCA,
  ODBIORCY,
  INNA,
  ulozone,
  czytaj,
  kartkaText,
  judgeKartka,
  reakcja,
  SKUTKI,
  WYPOWIEDZI,
  PORANEK,
  buildKorpus,
  judgeEvidence,
  anchorsOfKind,
  judgeWizytowka,
  EMPTY_WIZYTOWKA,
  karteczki,
  ZAINTERESOWANIA,
  WSPOLNE,
  PYTANIA,
  MIESZKANIEC_NAME,
  wizytowkaText,
  joinPl,
  WLASNE_PYTANIE_ANSWER,
  KADRY,
  ocenGumke,
  tekstFragmentu,
  MAX_STARTYCH,
} = lib;

let failures = 0;
let checks = 0;

/** Jedna asercja na warunku; `extra` dopisuje diagnozę, gdy warunek pada. */
function cond(label, value, extra) {
  checks += 1;
  if (!value) {
    failures += 1;
    console.error(`  ✗ ${label}\n      otrzymano:  ${JSON.stringify(extra ?? value)}`);
  }
}

function group(name, fn) {
  console.log(`\n${name}`);
  fn();
}

/* --- KARTKI --------------------------------------------------------------- */

const sprawaById = (id) => SPRAWY.find((s) => s.id === id);

/** Kafelki sprawy w porządku miejsc na kartce. */
function card(sprawaId, ...tileIds) {
  const sprawa = sprawaById(sprawaId);
  const tiles = tileIds.map((id) => sprawa.koszyk.find((t) => t.id === id));
  const byPos = { wstep: null, glowne: null, dopelnienie: null };
  for (const t of tiles) byPos[t.pos] = t;
  return ulozone(byPos);
}

function read(sprawaId, tileIds, znak) {
  const sprawa = sprawaById(sprawaId);
  return czytaj(card(sprawaId, ...tileIds), znak, sprawa.wymagaTematu).czynnosc;
}

const KARTKA_ZNAKI = ['.', '!', '?'];

/** Wszystkie kartki sprawy: na każde miejsce null albo jeden kafelek z tego miejsca. */
function wszystkieKartki(sprawa) {
  const naMiejscu = MIEJSCA.map((m) => sprawa.koszyk.filter((t) => t.pos === m));
  const out = [];
  const pick = (idx, acc) => {
    if (idx === MIEJSCA.length) {
      const tiles = MIEJSCA.map((m, i) => acc[i]).filter(Boolean);
      if (!tiles.length) return;
      const glowne = acc[MIEJSCA.indexOf('glowne')];
      const dop = acc[MIEJSCA.indexOf('dopelnienie')];
      if (glowne?.pelna && dop) return;
      for (const znak of KARTKA_ZNAKI) out.push({ tiles, znak });
      return;
    }
    pick(idx + 1, [...acc, null]);
    for (const t of naMiejscu[idx]) pick(idx + 1, [...acc, t]);
  };
  pick(0, []);
  return out;
}

const KARTKI_WSZYSTKIE = new Map(SPRAWY.map((s) => [s.id, wszystkieKartki(s)]));
const KARTKI_OK = new Map(
  SPRAWY.map((s) => [
    s.id,
    KARTKI_WSZYSTKIE.get(s.id).filter(({ tiles, znak }) => judgeKartka(s, tiles, znak, s.to).ok),
  ]),
);

group('KARTKI', () => {
  cond('K1. 5 spraw o id kaluza/rower/halas/okulary/ksiazka; pos z MIEJSCA; ids unikalne',
    JSON.stringify(SPRAWY.map((s) => s.id)) === JSON.stringify(['kaluza', 'rower', 'halas', 'okulary', 'ksiazka'])
    && SPRAWY.every((s) => s.koszyk.every((t) => MIEJSCA.includes(t.pos)))
    && SPRAWY.every((s) => new Set(s.koszyk.map((t) => t.id)).size === s.koszyk.length),
    SPRAWY.map((s) => ({ id: s.id, pos: s.koszyk.map((t) => t.pos), ids: s.koszyk.map((t) => t.id) })));

  cond('K2. każda sprawa ma kartkę przechodzącą i co najmniej 5 nieprzechodzących',
    SPRAWY.every((s) => {
      const wszystkie = KARTKI_WSZYSTKIE.get(s.id);
      const ok = KARTKI_OK.get(s.id).length;
      return ok >= 1 && wszystkie.length - ok >= 5;
    }),
    SPRAWY.map((s) => ({
      id: s.id,
      wszystkie: KARTKI_WSZYSTKIE.get(s.id).length,
      przechodzace: KARTKI_OK.get(s.id).length,
    })));

  cond('K3. cudze drzwi: ok false, reason inne-drzwi, to === sprawa.to',
    SPRAWY.every((s) => {
      const pierwsza = KARTKI_OK.get(s.id)[0];
      if (!pierwsza) return false;
      return ODBIORCY.map((o) => o.id)
        .filter((d) => d !== s.to)
        .every((d) => {
          const v = judgeKartka(s, pierwsza.tiles, pierwsza.znak, d);
          return v.ok === false && v.reason === 'inne-drzwi' && v.to === s.to;
        });
    }),
    SPRAWY.map((s) => {
      const pierwsza = KARTKI_OK.get(s.id)[0];
      return {
        id: s.id,
        werdykty: pierwsza
          ? ODBIORCY.map((o) => o.id)
            .filter((d) => d !== s.to)
            .map((d) => judgeKartka(s, pierwsza.tiles, pierwsza.znak, d))
          : null,
      };
    }));

  cond('K4. kaluza: stój/uważaj/kałuża/czy-możesz — z wykrzyknikiem to ostrzeżenie, nie rozkaz',
    read('kaluza', ['stoj'], '!') === 'ostrzezenie'
    && read('kaluza', ['uwazaj'], '!') === 'ostrzezenie'
    && read('kaluza', ['uwazaj'], '.') === 'polecenie'
    && read('kaluza', ['stoj'], '.') === 'polecenie'
    && read('kaluza', ['kaluza'], '!') === 'ostrzezenie'
    && read('kaluza', ['kaluza'], '.') === 'informacja'
    && read('kaluza', ['czy-mozesz'], '?') === 'prosba'
    && judgeKartka(sprawaById('kaluza'), card('kaluza', 'czy-mozesz'), '?', 'zuzia').ok === false,
    {
      stojW: read('kaluza', ['stoj'], '!'),
      stojK: read('kaluza', ['stoj'], '.'),
      kaluzaW: read('kaluza', ['kaluza'], '!'),
      kaluzaK: read('kaluza', ['kaluza'], '.'),
      czyMozesz: read('kaluza', ['czy-mozesz'], '?'),
    });

  cond('K5. rower: prośba mówi, o co chodzi',
    read('rower', ['pomoz', 'z-rowerem'], '.') === 'prosba'
    && read('rower', ['pomoz'], '.') === 'bez-sprawy'
    && read('rower', ['napraw'], '.') === 'polecenie'
    && read('rower', ['napraw'], '!') === 'rozkaz'
    && read('rower', ['prosze', 'napraw'], '.') === 'prosba'
    && read('rower', ['pomozesz', 'z-rowerem'], '?') === 'prosba'
    && read('rower', ['pomozesz', 'z-rowerem'], '.') === 'stwierdzenie'
    && read('rower', ['nic-nie-umiesz'], '.') === 'zranienie'
    && read('rower', ['prosze'], '.') === 'bez-sprawy',
    {
      pomozTemat: read('rower', ['pomoz', 'z-rowerem'], '.'),
      pomozSam: read('rower', ['pomoz'], '.'),
      naprawK: read('rower', ['napraw'], '.'),
      naprawW: read('rower', ['napraw'], '!'),
      proszeNapraw: read('rower', ['prosze', 'napraw'], '.'),
      pomozeszP: read('rower', ['pomozesz', 'z-rowerem'], '?'),
      pomozeszK: read('rower', ['pomozesz', 'z-rowerem'], '.'),
      docinek: read('rower', ['nic-nie-umiesz'], '.'),
      proszeSamo: read('rower', ['prosze'], '.'),
    });

  cond('K6. halas: samo przepraszam nie mówi, za co',
    read('halas', ['przepraszam', 'za-halas'], '.') === 'przeprosiny'
    && read('halas', ['przepraszam'], '.') === 'bez-sprawy'
    && read('halas', ['przepraszam', 'za-halas'], '?') === 'niepewne'
    && read('halas', ['bylo-glosno'], '.') === 'informacja'
    && read('halas', ['przepraszam', 'bebenek'], '.') === 'bez-sprawy'
    && read('halas', ['przepraszam', 'nie-przesadzaj'], '.') === 'zranienie',
    {
      pelne: read('halas', ['przepraszam', 'za-halas'], '.'),
      same: read('halas', ['przepraszam'], '.'),
      pytajnik: read('halas', ['przepraszam', 'za-halas'], '?'),
      info: read('halas', ['bylo-glosno'], '.'),
      bebenek: read('halas', ['przepraszam', 'bebenek'], '.'),
      docinek: read('halas', ['przepraszam', 'nie-przesadzaj'], '.'),
    });

  cond('K7. okulary: podanie rzeczy to dawanie',
    read('okulary', ['to-pani-okulary'], '.') === 'dawanie'
    && read('okulary', ['prosze', 'to-pani-okulary'], '.') === 'dawanie'
    && read('okulary', ['zgubila'], '.') === 'informacja'
    && read('okulary', ['prosze'], '.') === 'bez-sprawy',
    {
      dawanie: read('okulary', ['to-pani-okulary'], '.'),
      proszeDawanie: read('okulary', ['prosze', 'to-pani-okulary'], '.'),
      info: read('okulary', ['zgubila'], '.'),
      proszeSamo: read('okulary', ['prosze'], '.'),
    });

  cond('K8. ksiazka: może odbiera obietnicę',
    read('ksiazka', ['obiecuje', 'oddam'], '.') === 'obietnica'
    && read('ksiazka', ['oddam'], '.') === 'obietnica'
    && read('ksiazka', ['moze', 'oddam'], '.') === 'nie-obietnica'
    && read('ksiazka', ['obiecuje'], '.') === 'bez-sprawy'
    && read('ksiazka', ['jest-u-mnie'], '.') === 'informacja'
    && read('ksiazka', ['oddam'], '?') === 'pytanie',
    {
      obietnica: read('ksiazka', ['obiecuje', 'oddam'], '.'),
      samZapowiedz: read('ksiazka', ['oddam'], '.'),
      moze: read('ksiazka', ['moze', 'oddam'], '.'),
      samaObietnica: read('ksiazka', ['obiecuje'], '.'),
      info: read('ksiazka', ['jest-u-mnie'], '.'),
      pytanie: read('ksiazka', ['oddam'], '?'),
    });

  cond('K9. dowód podświetla słowo, które zdecydowało',
    czytaj(card('ksiazka', 'moze', 'oddam'), '.', true).dowod.includes('moze')
    && (() => {
      const d = czytaj(card('rower', 'napraw'), '!', true).dowod;
      return d.includes('!') && d.includes('napraw');
    })()
    && czytaj(card('okulary', 'prosze', 'to-pani-okulary'), '.', true).dowod.includes('prosze'),
    {
      moze: czytaj(card('ksiazka', 'moze', 'oddam'), '.', true).dowod,
      napraw: czytaj(card('rower', 'napraw'), '!', true).dowod,
      prosze: czytaj(card('okulary', 'prosze', 'to-pani-okulary'), '.', true).dowod,
    });

  cond('K10. docinek zawsze wygrywa',
    SPRAWY.every((s) => KARTKI_WSZYSTKIE.get(s.id)
      .filter(({ tiles }) => tiles.some((t) => t.cechy.includes('docinek')))
      .every(({ tiles, znak }) => czytaj(tiles, znak, s.wymagaTematu).czynnosc === 'zranienie')),
    SPRAWY.map((s) => ({
      id: s.id,
      zDocinkiem: KARTKI_WSZYSTKIE.get(s.id)
        .filter(({ tiles }) => tiles.some((t) => t.cechy.includes('docinek')))
        .map(({ tiles, znak }) => ({ tiles: tiles.map((t) => t.id), znak, odczyt: czytaj(tiles, znak, s.wymagaTematu) })),
    })));

  cond('K11. kartkaText: Proszę, pomóż mi z rowerem.',
    kartkaText(card('rower', 'prosze', 'pomoz', 'z-rowerem'), '.') === 'Proszę, pomóż mi z rowerem.',
    kartkaText(card('rower', 'prosze', 'pomoz', 'z-rowerem'), '.'));

  cond('K12. kartkaText: Przepraszam za wczorajszy hałas!',
    kartkaText(card('halas', 'przepraszam', 'za-halas'), '!') === 'Przepraszam za wczorajszy hałas!',
    kartkaText(card('halas', 'przepraszam', 'za-halas'), '!'));

  cond('K13. kartkaText: Obiecuję vs Może',
    kartkaText(card('ksiazka', 'obiecuje', 'oddam'), '.') === 'Obiecuję, że oddam ci książkę w piątek.'
    && kartkaText(card('ksiazka', 'moze', 'oddam'), '.') === 'Może oddam ci książkę w piątek.',
    {
      obiecuje: kartkaText(card('ksiazka', 'obiecuje', 'oddam'), '.'),
      moze: kartkaText(card('ksiazka', 'moze', 'oddam'), '.'),
    });

  cond('K14. kartkaText: attach bez przecinka; pusta kartka to pusty tekst',
    kartkaText(card('halas', 'przepraszam', 'bylo-glosno'), '.') === 'Przepraszam, wczoraj było głośno.'
    && kartkaText([], '.') === '',
    {
      halas: kartkaText(card('halas', 'przepraszam', 'bylo-glosno'), '.'),
      pusta: kartkaText([], '.'),
    });

  cond('K15. reakcja ma act i say dla każdej kartki',
    SPRAWY.every((s) => KARTKI_WSZYSTKIE.get(s.id).every(({ tiles, znak }) => {
      const r = reakcja(s, czytaj(tiles, znak, s.wymagaTematu));
      return typeof r.act === 'string' && r.act.length > 0 && typeof r.say === 'string' && r.say.length > 0;
    })),
    SPRAWY.map((s) => ({
      id: s.id,
      bez: KARTKI_WSZYSTKIE.get(s.id)
        .map(({ tiles, znak }) => ({ tiles: tiles.map((t) => t.id), znak, r: reakcja(s, czytaj(tiles, znak, s.wymagaTematu)) }))
        .filter((x) => !(typeof x.r.act === 'string' && x.r.act.length > 0 && typeof x.r.say === 'string' && x.r.say.length > 0)),
    })));

  cond('K16. przechodzące kartki trafiają w cel i mają własną reakcję',
    SPRAWY.every((s) => KARTKI_OK.get(s.id).every(({ tiles, znak }) => {
      const odczyt = czytaj(tiles, znak, s.wymagaTematu);
      return s.cel.includes(odczyt.czynnosc) && reakcja(s, odczyt) !== INNA;
    })),
    SPRAWY.map((s) => ({
      id: s.id,
      zle: KARTKI_OK.get(s.id)
        .map(({ tiles, znak }) => {
          const odczyt = czytaj(tiles, znak, s.wymagaTematu);
          return { tiles: tiles.map((t) => t.id), znak, odczyt, wlasna: reakcja(s, odczyt) !== INNA };
        })
        .filter((x) => !(s.cel.includes(x.odczyt.czynnosc) && x.wlasna)),
    })));

  /* Raport testera 2026-10-19: przecinki i odczyt kartek. */
  cond('K17. „Proszę z rowerem?” — bez przecinka i bez sprawy',
    kartkaText(card('rower', 'prosze', 'z-rowerem'), '?') === 'Proszę z rowerem?'
    && read('rower', ['prosze', 'z-rowerem'], '?') === 'bez-sprawy',
    { text: kartkaText(card('rower', 'prosze', 'z-rowerem'), '?'), odczyt: read('rower', ['prosze', 'z-rowerem'], '?') });

  cond('K18. tryb rozkazujący z pytajnikiem to nie prośba, także z „proszę”',
    (() => {
      const o = czytaj(card('rower', 'prosze', 'napraw'), '?', true);
      return o.czynnosc === 'pytanie' && o.dowod.includes('napraw') && o.dowod.includes('?');
    })()
    && read('rower', ['prosze', 'napraw'], '!') === 'prosba'
    && read('rower', ['prosze', 'napraw'], '.') === 'prosba'
    && read('rower', ['pomoz', 'z-rowerem'], '?') === 'pytanie'
    && read('rower', ['pomoz', 'z-rowerem'], '.') === 'prosba',
    {
      proszeNaprawPyt: czytaj(card('rower', 'prosze', 'napraw'), '?', true),
      pomozPyt: read('rower', ['pomoz', 'z-rowerem'], '?'),
    });

  cond('K19. podanie rzeczy z pytajnikiem to pytanie',
    read('okulary', ['to-pani-okulary'], '?') === 'pytanie'
    && read('okulary', ['prosze', 'to-pani-okulary'], '.') === 'dawanie'
    && kartkaText(card('okulary', 'prosze', 'to-pani-okulary'), '.') === 'Proszę, to pani okulary.'
    && kartkaText(card('halas', 'przepraszam-pania', 'za-halas'), '.') === 'Przepraszam panią za wczorajszy hałas.',
    {
      pyt: read('okulary', ['to-pani-okulary'], '?'),
      text: kartkaText(card('okulary', 'prosze', 'to-pani-okulary'), '.'),
      pania: kartkaText(card('halas', 'przepraszam-pania', 'za-halas'), '.'),
    });

  const zlePrzecinki = [];
  const pytajnikProsba = [];
  for (const s of SPRAWY) {
    for (const { tiles, znak } of KARTKI_WSZYSTKIE.get(s.id)) {
      const text = kartkaText(tiles, znak);
      if (text.includes(', z ') || text.includes(', za ')) zlePrzecinki.push(text);
      const tryb = tiles.some((t) => t.cechy.includes('rozkaz') || t.cechy.includes('prosba'));
      const v = judgeKartka(s, tiles, znak, s.to);
      if (tryb && znak === '?' && v.ok && v.odczyt.czynnosc === 'prosba') pytajnikProsba.push(text);
    }
  }
  cond('K20. żadnego przecinka przed dopełnieniem (wszystkie kartki)', zlePrzecinki.length === 0, zlePrzecinki);
  cond('K21. tryb rozkazujący z „?” nigdy nie przechodzi jako prośba', pytajnikProsba.length === 0, pytajnikProsba);

  const roweroweOk = KARTKI_WSZYSTKIE.get('rower')
    .filter(({ tiles, znak }) => judgeKartka(sprawaById('rower'), tiles, znak, 'tymek').ok)
    .map(({ tiles, znak }) => kartkaText(tiles, znak));
  cond('K22. prośbę do Tymka da się napisać poprawnie',
    ['Pomożesz mi z rowerem?', 'Proszę, pomóż mi z rowerem.', 'Pomóż mi z rowerem.'].every((t) => roweroweOk.includes(t)),
    roweroweOk);

});

/* --- SKUTKI / PORANEK ------------------------------------------------------ */

const k = buildKorpus(PORANEK);

group('SKUTKI / PORANEK', () => {
  cond('7. każdy SKUTEK ma kotwicę w Poranku',
    SKUTKI.every((s) => anchorsOfKind(k, s.kind).length > 0),
    SKUTKI.map((s) => ({ kind: s.kind, kotwic: anchorsOfKind(k, s.kind).length })));

  cond('8. każda kotwica przechodzi parą „słowo → skutek”',
    k.anchors.every((a) => judgeEvidence(k, a.from, a.to, a.kind).ok === true),
    k.anchors.map((a) => ({ ...a, werdykt: judgeEvidence(k, a.from, a.to, a.kind) })));

  cond('9. całe zdanie z dowodem też przechodzi',
    k.anchors.every((a) => {
      const targetIds = k.spans[a.to] ? k.spans[a.to].tokenIds : (k.unitById[a.to]?.tokenIds ?? []);
      const unit = k.units.find((u) => targetIds.every((t) => u.tokenIds.includes(t)));
      return unit ? judgeEvidence(k, a.from, unit.id, a.kind).ok === true : false;
    }),
    k.anchors.map((a) => {
      const targetIds = k.spans[a.to] ? k.spans[a.to].tokenIds : (k.unitById[a.to]?.tokenIds ?? []);
      const unit = k.units.find((u) => targetIds.every((t) => u.tokenIds.includes(t)));
      return { ...a, unit: unit?.id, werdykt: unit && judgeEvidence(k, a.from, unit.id, a.kind) };
    }));

  const v10 = judgeEvidence(k, 'u2', 'r1', 'zranienie');
  cond("10. cudzy dowód: u2 + r1 (zranienie) to 'cudzy-dowod' u1",
    v10.ok === false && v10.reason === 'cudzy-dowod' && v10.owner === 'u1', v10);

  const v11 = judgeEvidence(k, 'u1', 'r1', 'zranienie');
  cond("11. u1 + r1 o zranienie też cudze (kotwica to przeprosiny)",
    v11.ok === false && v11.reason === 'cudzy-dowod' && v11.owner === 'u1', v11);

  const v12 = judgeEvidence(k, 'u2', 'r2b', 'zranienie');
  cond('12. drugi dowód zranienia (u2 + r2b) przechodzi', v12.ok === true, v12);

  const v13 = judgeEvidence(k, 'u1', 's0', 'przeprosiny');
  cond("13. zdanie bez kotwicy (s0) to 'brak-dowodu'",
    v13.ok === false && v13.reason === 'brak-dowodu', v13);

  cond('14. każda WYPOWIEDŹ to fragment rodzaju „wypowiedz”',
    WYPOWIEDZI.every((w) => k.spans[w] && k.spans[w].meta.kind === 'wypowiedz'),
    { WYPOWIEDZI, wKorpusie: Object.keys(k.spans) });
});

/* --- GUMKA (blok 2 po przeglądzie 2026-10-19, R5) --------------------------- */

group('GUMKA', () => {
  cond('G0. żart: skreślony kot zostawia żart, skreślone „czyta” go zabiera',
    ocenGumke('u3', ['Mruczek'], 'rozsmieszenie').wynik === 'zostal'
    && ocenGumke('u3', ['czyta'], 'rozsmieszenie').wynik === 'trafione');
  cond('G8. każdy kadr ma uczciwe wyjaśnienie po trafieniu (bez prostego cudzysłowu)',
    KADRY.every((k) => typeof k.wyjasnienie === 'string' && k.wyjasnienie.length > 20 && !k.wyjasnienie.includes('"')),
    KADRY.map((k) => ({ id: k.id, w: k.wyjasnienie })));
  cond('G9. wyjaśnienie cytuje klucz tak, jak stoi w dymku (wielka litera imienia)',
    KADRY.every((k) => k.klucz.some((kl) => k.wyjasnienie.toLowerCase().includes(kl))),
    KADRY.map((k) => ({ id: k.id, klucz: k.klucz })));
  cond('G1. pięć kadrów, każdy skutek raz', KADRY.length === 5 && SKUTKI.every((s) => KADRY.filter((k) => k.kind === s.kind).length === 1), KADRY.map((k) => k.kind));
  for (const kadr of KADRY) {
    const forms = k.spans[kadr.id].tokenIds.map((t) => k.tokenById[t]).filter((t) => t.type !== 'punct').map((t) => t.form);
    const low = forms.map((f) => f.toLowerCase());
    cond(`G2 ${kadr.id}: klucz jest w dymku`, kadr.klucz.every((x) => low.includes(x)), { klucz: kadr.klucz, forms });
    cond(`G3 ${kadr.id}: reakcja istnieje i to kotwica tej wypowiedzi`, k.spans[kadr.reakcja] && k.anchors.some((a) => a.from === kadr.id && a.to === kadr.reakcja && a.kind === kadr.kind), kadr.reakcja);
    for (const kl of kadr.klucz) {
      const kf = forms[low.indexOf(kl)];
      const w = ocenGumke(kadr.id, [kf], kadr.kind);
      cond(`G4 ${kadr.id}: starcie „${kf}” trafia`, w.wynik === 'trafione', w.wynik);
      const inny = SKUTKI.find((s) => s.kind !== kadr.kind).kind;
      cond(`G5 ${kadr.id}: ten sam ruch przy innym poleceniu = inny skutek`, ocenGumke(kadr.id, [kf], inny).wynik === 'inny-skutek');
    }
    for (const f of forms.filter((f) => !kadr.klucz.includes(f.toLowerCase()))) {
      cond(`G6 ${kadr.id}: „${f}” nie robi skutku`, ocenGumke(kadr.id, [f], kadr.kind).wynik === 'zostal');
    }
    if (forms.length > MAX_STARTYCH) cond(`G7 ${kadr.id}: cały dymek naraz = za dużo`, ocenGumke(kadr.id, forms, kadr.kind).wynik === 'za-duzo');
    cond(`G8 ${kadr.id}: tekst reakcji bez myślnika`, !tekstFragmentu(k, kadr.reakcja).startsWith('—'));
  }
});

/* --- WIZYTÓWKA -------------------------------------------------------------- */

const PELNA = {
  ...EMPTY_WIZYTOWKA, powitanie: 'Cześć!', imie: 'Kasia', lubie: ['ksiazki', 'rower'], pytanie: 'boisko',
};

group('WIZYTÓWKA', () => {
  const pusta = judgeWizytowka(EMPTY_WIZYTOWKA);
  cond('15. pusta wizytówka: 4 × nie, Pan Bogdan nie wie, jak nazywać',
    ['powitanie', 'imie', 'lubie', 'pytanie'].every((c) => pusta[c].ok === false)
    && pusta.imie.note.includes('Pan Bogdan'), pusta);

  const pelna = judgeWizytowka(PELNA);
  cond('16. pełna poprawna: 4 × tak',
    ['powitanie', 'imie', 'lubie', 'pytanie'].every((c) => pelna[c].ok === true), pelna);

  cond("17. imię ze spacji to brak imienia",
    judgeWizytowka({ ...PELNA, imie: '   ' }).imie.ok === false,
    judgeWizytowka({ ...PELNA, imie: '   ' }).imie);

  const jedno = judgeWizytowka({ ...PELNA, lubie: ['ksiazki'], lubieWlasne: '' });
  const zWlasnym = judgeWizytowka({ ...PELNA, lubie: ['ksiazki'], lubieWlasne: 'szachy' });
  cond('18. jedno to za mało; własne „szachy” domyka parę',
    jedno.lubie.ok === false && jedno.lubie.note.includes('książki')
    && zWlasnym.lubie.ok === true && zWlasnym.lubie.note.includes('szachy'),
    { jedno: jedno.lubie, zWlasnym: zWlasnym.lubie });

  const mala = judgeWizytowka({ ...PELNA, pytanie: 'wlasne', pytanieWlasne: 'kto ma psa?' });
  const bezZnaku = judgeWizytowka({ ...PELNA, pytanie: 'wlasne', pytanieWlasne: 'Kto ma psa' });
  const dobre = judgeWizytowka({ ...PELNA, pytanie: 'wlasne', pytanieWlasne: 'Kto ma psa?' });
  const pustePyt = judgeWizytowka({ ...PELNA, pytanie: 'wlasne', pytanieWlasne: '   ' });
  cond('19. własne pytanie: wielka litera i pytajnik',
    mala.pytanie.ok === false && bezZnaku.pytanie.ok === false
    && dobre.pytanie.ok === true && pustePyt.pytanie.ok === false,
    {
      mala: mala.pytanie, bezZnaku: bezZnaku.pytanie, dobre: dobre.pytanie, puste: pustePyt.pytanie,
    });

  const kartki20 = karteczki({ ...EMPTY_WIZYTOWKA, lubie: ['ksiazki', 'rower'], pytanie: 'boisko' });
  const od = (who) => kartki20.filter((x) => x.from === who);
  cond('20. karteczki: pytanie wygrywa, odpowiadają współlubiący',
    od('tymek').some((x) => x.about === 'Gdzie tu jest boisko?')
    && od('ola').length > 0 && od('bogdan').length > 0 && od('ewa').length > 0
    && od('zuzia').length === 0 && od('halina').length === 0,
    kartki20);

  const kartki21 = karteczki({ ...EMPTY_WIZYTOWKA, lubie: ['kosmos', 'taniec'], pytanie: null });
  cond('21. kosmos + taniec wołają dokładnie bogdana, olę i zuzię',
    JSON.stringify([...new Set(kartki21.map((x) => x.from))].sort()) === JSON.stringify(['bogdan', 'ola', 'zuzia']),
    kartki21);

  const kartki22 = karteczki({ ...PELNA, pytanie: 'wlasne', pytanieWlasne: 'Kto ma psa?' });
  const ostatnia = kartki22.at(-1);
  cond('22. własne pytanie o psa odpowiada pani Halina (jedyne zwierzę w kamienicy)',
    ostatnia?.from === 'halina' && ostatnia?.kind === 'pytanie' && ostatnia?.about === 'Kto ma psa?', kartki22);

  const kartki22b = karteczki({ ...PELNA, pytanie: 'wlasne', pytanieWlasne: 'Kto lubi lody?' });
  cond('22b. własne pytanie bez znanego tematu ląduje u pana Bogdana',
    kartki22b.at(-1)?.from === 'bogdan' && kartki22b.at(-1)?.text === WLASNE_PYTANIE_ANSWER, kartki22b);

  const ksz = karteczki({ ...PELNA, pytanie: 'wlasne', pytanieWlasne: 'Czy ktoś ma chomika?' });
  cond('22c. pytanie o chomika też trafia do pani Haliny', ksz.at(-1)?.from === 'halina', ksz);

  cond('23. każde zainteresowanie ma kogoś po drugiej stronie',
    ZAINTERESOWANIA.every((z) => Object.values(WSPOLNE).some((m) => m[z.id])),
    ZAINTERESOWANIA.map((z) => z.id).filter((id) => !Object.values(WSPOLNE).some((m) => m[id])));

  cond('24. pytania trafiają do mieszkańców, każdy do innego',
    PYTANIA.every((p) => p.who in MIESZKANIEC_NAME) && new Set(PYTANIA.map((p) => p.who)).size === 6,
    PYTANIA.map((p) => ({ id: p.id, who: p.who })));

  cond('25. tekst wizytówki do Teczki',
    wizytowkaText(PELNA) === 'Cześć!\nMówcie do mnie: Kasia.\nLubię książki i jazdę na rowerze.\nGdzie tu jest boisko?',
    wizytowkaText(PELNA));

  cond('26. joinPl: jeden, dwa i trzy',
    joinPl(['a']) === 'a' && joinPl(['a', 'b']) === 'a i b' && joinPl(['a', 'b', 'c']) === 'a, b i c',
    [joinPl(['a']), joinPl(['a', 'b']), joinPl(['a', 'b', 'c'])]);
});

const total = checks;
console.log(failures === 0 ? `\n✓ ${total}/${total} OK\n` : `\n✗ ${failures} z ${total} nie przeszło\n`);
process.exit(failures === 0 ? 0 : 1);

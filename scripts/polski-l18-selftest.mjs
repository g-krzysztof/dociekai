/**
 * Selftest L18 „Świat przedstawiony” — `swiat-przedstawiony/makieta.ts` (logika makiety)
 * oraz `otwarcia.ts` (adnotacja otwarć pięciu książek) na tle tekstów Czytelni.
 *
 *   node scripts/polski-l18-selftest.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l18-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
const L = resolve(root, 'src/app/jezyk-polski/klasa-4/components/lessons/swiat-przedstawiony');
const C = resolve(root, 'src/app/jezyk-polski/klasa-4/data/czytelnia');
const BOOKS = ['brzydkie-kaczatko', 'krasnoludki', 'ksiega-dzungli', 'dwoch-takich', 'zlota-kaczka', 'krol-macius'];
await writeFile(entry, [
  `export * from '${L}/makieta.ts';`,
  `export * from '${L}/otwarcia.ts';`,
  `export * from '${L}/narratorzy.ts';`,
  `export { CZYTELNIA } from '${C}/index.ts';`,
  ...BOOKS.map((b, i) => `import { ODC_1 as O${i} } from '${C}/${b}/odc-1.ts';`),
  `export const TEKSTY = { ${BOOKS.map((b, i) => `'${b}': O${i}.body`).join(', ')} };`,
].join('\n') + '\n');
await build({
  entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error',
  alias: { '@': resolve(root, 'src') },
});
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });
let pass = 0, fail = 0;
const check = (c, l) => { if (c) pass += 1; else { fail += 1; console.log('  ✗', l); } };
const eq = (a, b, l) => check(JSON.stringify(a) === JSON.stringify(b), `${l} (oczekiwano ${JSON.stringify(b)}, jest ${JSON.stringify(a)})`);
const throws = (f) => { try { f(); return false; } catch { return true; } };

const { KACZATKO, OTWARCIA, CZYTELNIA, TEKSTY, IKONY, MIEJSCA, akapity, frazyOtwarcia, zakresy, podziel, scena, braki,
  gotowa, jestWWidocznych, pora, SCENA, KARTKI, KARTKI_NA_STOLE, W_REFLEKTORZE, wloz, POWOD, opowiesc, wszystkieRozlozone } = lib;

// ── A. otwarcia na tle tekstów ──
console.log('A. otwarcia');
for (const o of [KACZATKO, ...OTWARCIA]) {
  const b = o.bookId;
  console.log(' ', b);
  check(CZYTELNIA.some((k) => k.id === b), `A1 ${b} jest w CZYTELNI`);
  const ap = akapity(TEKSTY[b]);
  const fr = frazyOtwarcia(o);
  check(o.frazy.length <= ap.length, `A2 ${b} zakres ≤ liczba akapitów`);
  check(o.start >= 1 && o.start <= o.frazy.length, `A3 ${b} 1 ≤ start ≤ zakres`);
  o.frazy.forEach((_, i) => {
    const mine = fr.filter((f) => f.akapit === i);
    check(!throws(() => zakresy(ap[i], mine)), `A4 ${b} akapit ${i}: zakresy nie rzuca`);
    for (const f of mine) check(ap[i].includes(f.tekst), `A5 ${b} fraza ${f.id} „${f.tekst}” w akapicie`);
    if (throws(() => zakresy(ap[i], mine))) return;
    const k = podziel(ap[i], mine);
    check(k.map((x) => x.tekst).join('') === ap[i], `A6 ${b} akapit ${i}: podziel skleja się w akapit`);
    for (const f of mine) check(k.some((x) => x.fraza === f.id), `A7 ${b} fraza ${f.id} pojawia się w podziel`);
  });
  const wszystkie = fr.map((f) => f.id);
  check(gotowa(fr, wszystkie), `A8 ${b} komplet fraz daje gotową makietę`);
  const s = scena(fr, wszystkie);
  for (const m of MIEJSCA) check(s[m].length > 0, `A9 ${b} jest miejsce ${m}`);
  check(s.narrator.length > 0, `A9 ${b} jest narrator`);
  check(s.lampa.every((f) => !!f.pora), `A10 ${b} każda lampa ma porę`);
  for (const f of fr) {
    if (!f.ikona) continue;
    check(f.rola !== 'narrator' && f.rola !== 'lampa' && IKONY[f.rola].includes(f.ikona), `A11 ${b} ikona ${f.ikona} pasuje do ${f.rola}`);
  }
  for (const r of ['tlo', 'deski', 'narrator']) check(jestWWidocznych(fr, o.start, r), `A12 ${b} w ${o.start} widocznych jest ${r}`);
  // ostatni akapit zakresu ma lampę albo zakres jest (prawie) minimalny do kompletu
  const ostatni = o.frazy.length - 1;
  const maLampe = o.frazy[ostatni].some((f) => f.rola === 'lampa');
  const pierwszaLampa = fr.find((f) => f.rola === 'lampa').akapit;
  let min = 0;
  while (min < o.frazy.length && !(MIEJSCA.every((m) => fr.some((f) => f.akapit <= min && f.rola === m)) && fr.some((f) => f.akapit <= min && f.rola === 'narrator'))) min += 1;
  check(maLampe || ostatni - Math.max(min, pierwszaLampa) <= 2, `A13 ${b} koniec zakresu przy lampie albo blisko kompletu (min ${min}, lampa ${pierwszaLampa}, koniec ${ostatni})`);
  check(pierwszaLampa <= ostatni, `A14 ${b} lampa w zakresie`);
}

// ── B. logika makiety ──
console.log('B. logika');
{
  const ap0 = akapity(TEKSTY['brzydkie-kaczatko'])[0];
  const fr = frazyOtwarcia(KACZATKO).filter((f) => f.akapit === 0);
  const z = zakresy(ap0, fr);
  const dl = fr.find((f) => f.tekst === 'Prześlicznie i cudownie').id;
  const kr = fr.find((f) => f.tekst === 'Prześlicznie').id;
  const iDl = ap0.indexOf('Prześlicznie i cudownie');
  check(z.some((r) => r.id === dl && r.od === iDl), 'B1 dłuższa fraza wygrywa na początku akapitu');
  check(!z.some((r) => r.id === kr && r.od === iDl), 'B1 krótsza nie zabiera wystąpienia dłuższej');
  check(z.filter((r) => r.id === dl).length + z.filter((r) => r.id === kr).length === (ap0.match(/Prześlicznie/g) || []).length,
    'B2 każde wystąpienie „Prześlicznie” ma dokładnie jedną frazę');
  const k = podziel(ap0, fr);
  eq(k.find((x) => x.wyraz).fraza, kr, 'B3 „Prześlicznie było” na początku → krótka fraza');
  const wDl = k.filter((x) => x.wyraz && x.fraza === dl).map((x) => x.tekst);
  eq(wDl, ['Prześlicznie', 'i', 'cudownie'], 'B3 „Prześlicznie i cudownie” → dłuższa fraza obejmuje trzy wyrazy');
  const fk = fr.filter((f) => f.tekst === 'na wsi');
  check(throws(() => zakresy(ap0, [{ tekst: 'nie ma mnie tu', rola: 'tlo', id: 'x-0', akapit: 0 }])), 'B4 fraza nieobecna rzuca');
  check(!throws(() => zakresy(ap0, fk)), 'B4 fraza obecna nie rzuca');
}
{
  const fr = frazyOtwarcia(KACZATKO);
  eq(braki(fr, []), { miejsca: ['tlo', 'lampa', 'deski', 'tasma'], reka: false }, 'B5 braki przy pustej scenie');
  const id = (rola, tekst) => fr.find((f) => f.rola === rola && (!tekst || f.tekst === tekst)).id;
  const lato = fr.find((f) => f.tekst === 'Lato gorące, pogodne').id;
  const slonce = fr.find((f) => f.tekst === 'jasne słońce').id;
  eq(pora(fr, []), null, 'B6 pora bez lampy = null');
  eq(pora(fr, [id('tlo')]), null, 'B6 pora bez lampy (samo tło) = null');
  eq(pora(fr, [lato]), 'lato', 'B7 pora z jednej lampy');
  eq(pora(fr, [lato, slonce]), 'dzien', 'B7 pora = ostatnia postawiona lampa');
  eq(pora(fr, [slonce, lato]), 'lato', 'B7 pora zależy od kolejności postawienia');
  const a = id('deski'), b = id('tlo'), c = fr.find((f) => f.rola === 'deski' && f.id !== a).id;
  eq(scena(fr, [c, b, a]).deski.map((f) => f.id), [c, a], 'B8 scena zachowuje kolejność postawienia');
  eq(scena(fr, [c, 'nieznane-9', a]).deski.map((f) => f.id), [c, a], 'B9 nieznane id ignorowane');
  eq(braki(fr, ['nieznane-9']), { miejsca: ['tlo', 'lampa', 'deski', 'tasma'], reka: false }, 'B9 samo nieznane id = pusta scena');
  eq(braki(fr, [id('tlo'), id('deski'), id('narrator')]), { miejsca: ['lampa', 'tasma'], reka: true }, 'B10 braki częściowe');
  check(!gotowa(fr, [id('tlo'), id('lampa'), id('deski'), id('tasma')]), 'B11 bez narratora nie jest gotowa');
  check(gotowa(fr, [id('tlo'), id('lampa'), id('deski'), id('tasma'), id('narrator')]), 'B11 komplet jest gotowy');
}

// ── C. narratorzy (blok 2) ──
console.log('C. narratorzy');
{
  const slowa = (t) => t.split(/[^\p{L}]+/u).filter(Boolean);
  const pierwszaOs = (t) => slowa(t).some((w) => (/łem$/.test(w) && w.toLowerCase() !== 'tyłem') || ['mnie', 'mi', 'mną', 'mój', 'moja', 'moje'].includes(w.toLowerCase()));
  const tymek = (t) => slowa(t).some((w) => /^Tymek$|^Tymka$/.test(w));
  eq(SCENA.length, 6, 'C1 SCENA ma 6 zdań');
  const poza = SCENA.filter((z) => W_REFLEKTORZE[z.gdzie] === false);
  eq(poza.length, 2, 'C2 dokładnie 2 zdania poza reflektorem');
  check(poza.every((z) => z.ja === undefined), 'C3 zdania poza reflektorem nie mają „ja”');
  check(SCENA.filter((z) => z.ja === undefined).length === 2, 'C3 tylko te 2 są bez „ja”');
  for (const z of [...SCENA, ...KARTKI]) {
    if (W_REFLEKTORZE[z.gdzie]) {
      check(typeof z.ja === 'string' && z.ja.length > 0, `C4 ${z.id} w reflektorze ma „ja”`);
      check(z.ja !== z.zBoku, `C4 ${z.id} „ja” ≠ zBoku`);
      check(!tymek(z.ja ?? ''), `C5 ${z.id} „ja” nie zawiera Tymka`);
      check(pierwszaOs(z.ja ?? ''), `C5 ${z.id} „ja” ma formę 1. osoby`);
    } else {
      check(z.ja === undefined, `C4 ${z.id} poza reflektorem bez „ja”`);
    }
    check(!pierwszaOs(z.zBoku), `C6 ${z.id} zBoku bez 1. osoby`);
  }
  eq(new Set(SCENA.map((z) => z.id)).size, 6, 'C7 id zdań sceny unikalne');
  eq(KARTKI.length, 4, 'C8 KARTKI: 4');
  const ids = KARTKI.map((k) => k.id);
  eq(new Set(ids).size, 4, 'C9 id kartek unikalne');
  eq([...KARTKI_NA_STOLE].sort(), [...ids].sort(), 'C10 KARTKI_NA_STOLE to permutacja id');
  check(JSON.stringify(KARTKI_NA_STOLE) !== JSON.stringify(ids), 'C11 stół nie jest w kolejności KARTKI');
  eq(KARTKI.filter((k) => W_REFLEKTORZE[k.gdzie]).length, 2, 'C12 2 kartki w reflektorze');
  eq(KARTKI.filter((k) => !W_REFLEKTORZE[k.gdzie]).length, 2, 'C12 2 kartki poza reflektorem');
  for (const k of KARTKI) {
    const u = wloz(k, 'usta'), r = wloz(k, 'reka');
    check(u.ok !== r.ok, `C13 ${k.id} przyjęta w dokładnie jednym celu`);
    if (W_REFLEKTORZE[k.gdzie]) {
      check(u.ok && !r.ok && r.powod === 'wie-sam', `C14 ${k.id} usta ok, ręka „wie-sam”`);
    } else {
      check(r.ok && !u.ok && u.powod === 'nie-widzi', `C14 ${k.id} ręka ok, usta „nie-widzi”`);
    }
  }
  const rozklad = { k1: 'reka', k2: 'reka', k3: 'usta', k4: 'usta' };
  const w = opowiesc(rozklad);
  eq(w.map((x) => x.id), ids, 'C15 opowieść w kolejności KARTKI');
  const odwrotny = {};
  for (const id of [...ids].reverse()) odwrotny[id] = rozklad[id];
  eq(opowiesc(odwrotny), w, 'C15 kolejność rozkładania nie wpływa na opowieść');
  eq(opowiesc(Object.fromEntries(KARTKI_NA_STOLE.map((id) => [id, rozklad[id]]))), w, 'C15 stół → ta sama opowieść');
  const k3 = KARTKI.find((k) => k.id === 'k3');
  eq(w.find((x) => x.id === 'k3').tekst, k3.ja, 'C16 usta dostają wersję „ja”');
  eq(w.find((x) => x.id === 'k1').tekst, KARTKI.find((k) => k.id === 'k1').zBoku, 'C16 ręka dostaje zBoku');
  eq(w.find((x) => x.id === 'k3').kto, 'usta', 'C16 kto = cel');
  eq(opowiesc({}), [], 'C17 pusta opowieść');
  eq(opowiesc({ k2: 'reka' }).map((x) => x.id), ['k2'], 'C17 częściowa opowieść');
  check(!wszystkieRozlozone({ k1: 'reka', k2: 'reka', k3: 'usta' }), 'C18 3 kartki → false');
  check(wszystkieRozlozone(rozklad), 'C18 4 kartki → true');
  check(!wszystkieRozlozone({}), 'C18 0 kartek → false');
  eq(Object.keys(POWOD).sort(), ['nie-widzi', 'wie-sam'], 'C19 POWOD ma oba klucze');
  check(Object.values(POWOD).every((t) => typeof t === 'string' && t.length > 0), 'C19 powody niepuste');
}
console.log(`\n${fail ? '✗' : '✓'} ${pass} asercji OK, ${fail} błędów`);
process.exit(fail ? 1 : 0);

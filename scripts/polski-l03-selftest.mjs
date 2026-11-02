/**
 * Selftest L3 „Do kogo mówię?” (`do-kogo-mowie/`) — reakcje odbiorców (wszystkie
 * 36 wiadomości × 3 odbiorców), nakładanie i odejmowanie słów, przekład dla Zuzi.
 *
 *   node scripts/polski-l03-selftest.mjs
 */

import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l03-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');
const L = 'src/app/jezyk-polski/klasa-4/components/lessons/do-kogo-mowie';
await writeFile(
  entry,
  ['wiadomosc', 'roznice', 'ogloszenie'].map((m) => `export * from '${resolve(root, `${L}/${m}.ts`)}';`).join('\n')
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'error' });
const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

let pass = 0;
let fail = 0;
const check = (cond, label) => {
  if (cond) pass += 1;
  else {
    fail += 1;
    console.log('  ✗', label);
  }
};

const { KAFELKI, GNIAZDA, ODBIORCY, reakcja, tekstWiadomosci } = lib;

// ── A. Wiadomości: wylicz wszystkie ──
const by = (g) => KAFELKI.filter((k) => k.gniazdo === g).map((k) => k.id);
const all = [];
for (const a of by('powitanie')) for (const b of by('prosba')) for (const c of by('zakonczenie')) all.push({ powitanie: a, prosba: b, zakonczenie: c });
check(all.length === 3 * 4 * 3, `A1 ${all.length} wiadomości`);
for (const o of ODBIORCY) {
  const smiles = all.filter((w) => reakcja(o.id, w).mina === 'usmiech');
  check(smiles.length >= 1, `A2 ${o.id}: jest wiadomość z uśmiechem (${smiles.length})`);
  for (const w of all) {
    const r = reakcja(o.id, w);
    check(r.mowi.length > 10, `A3 ${o.id} „${tekstWiadomosci(w)}”: zdanie dlaczego`);
    if (r.mina !== 'usmiech') check(!!r.przez, `A4 ${o.id} „${tekstWiadomosci(w)}”: wiadomo, które słowo zdecydowało`);
  }
}
// Żadna wiadomość nie pasuje do wszystkich trojga — inaczej lekcja nie miałaby sensu.
check(!all.some((w) => ODBIORCY.every((o) => reakcja(o.id, w).mina === 'usmiech')), 'A5 nie ma jednej wiadomości dla wszystkich');
// Tymek nie uśmiecha się do żadnej wiadomości, przy której uśmiecha się dyrektorka.
check(!all.some((w) => reakcja('tymek', w).mina === 'usmiech' && reakcja('dyrektor', w).mina === 'usmiech'), 'A6 Tymek ≠ dyrektor');
// Za grzecznie: Tymek się śmieje.
check(reakcja('tymek', { powitanie: 'szanowna', prosba: 'oddasz', zakonczenie: 'dzieki' }).mina === 'smiech', 'A7 „Szanowna Pani” → Tymek się śmieje');
check(reakcja('halina', { powitanie: 'czesc', prosba: 'moglaby', zakonczenie: 'dziekuje' }).przez === 'czesc', 'A8 jedno złe słowo psuje wiadomość (i to ono jest wskazane)');
const partial = reakcja('halina', { powitanie: 'dzien-dobry' });
check(partial.mina !== 'usmiech' && partial.mowi.includes('prośba'), 'A9 niepełna wiadomość: czego brakuje');
check(reakcja('dyrektor', {}).mowi.startsWith('Czekam'), 'A10 pusta wiadomość');
check(GNIAZDA.length === 3, 'A11 trzy gniazda');
// Grymas wygrywa ze śmiechem (gorsza reakcja decyduje).
check(reakcja('dyrektor', { powitanie: 'czesc', prosba: 'oddasz', zakonczenie: 'dziekuje' }).mina === 'grymas', 'A12 najgorsza reakcja decyduje');

check(reakcja('tymek', { powitanie: 'czesc', prosba: 'dawaj', zakonczenie: 'dzieki' }).mina !== 'usmiech', 'A13 „Dawaj piłkę.” to rozkaz — Tymek woli, żeby go zapytać');
check(all.filter((w) => reakcja('tymek', w).mina === 'usmiech').every((w) => w.prosba === 'oddasz'), 'A14 do Tymka uśmiech tylko z „Oddasz mi piłkę?”');
const zw = KAFELKI.find((k) => k.id === 'z-wyrazami');
check(zw.gniazdo === 'zakonczenie' && GNIAZDA.find((g) => g.id === 'zakonczenie').label === 'Zakończenie', 'A15 „Z wyrazami szacunku” w zakończeniu, nie w podziękowaniu');

// ── B. Nakładanie ──
const t = lib.slowa('Cześć! Oddasz mi piłkę? Dziękuję!');
const d = lib.slowa('Dzień dobry! Czy mogłaby Pani oddać mi piłkę? Dziękuję!');
const st = lib.wystajace(t, d);
check(!st.has(d.findIndex((s) => s.low === 'piłkę')), 'B1 „piłkę” wspólne — zlewa się');
check(!st.has(d.findIndex((s) => s.low === 'dziękuję')), 'B2 „Dziękuję!” wspólne');
check(st.has(d.findIndex((s) => s.low === 'pani')), 'B3 „Pani” wystaje');
check(lib.odejmij(d.find((s) => s.low === 'pani')).ok, 'B4 „Pani” da się odjąć');
const od = lib.odejmij(d.find((s) => s.low === 'oddać'));
check(!od.ok && od.mowi.includes('sprawę'), 'B5 „oddać” niesie sprawę — nie odejmie się');
const cel = lib.doOdjecia(d, st).map((i) => d[i].low);
check(cel.join(',') === 'dzień,dobry,mogłaby,pani', `B6 do odjęcia wszystkie wystające słowa grzeczności: ${cel}`);
check(lib.minaPoOdjeciu(0, 4) === 'usmiech' && lib.minaPoOdjeciu(1, 4) === 'zdziwienie' && lib.minaPoOdjeciu(4, 4) === 'grymas', 'B7 twarz gaśnie, grymas dopiero po odjęciu wszystkich');
const czy = lib.odejmij(d.find((s) => s.low === 'czy'));
check(!czy.ok && !czy.mowi.includes('sprawę') && czy.mowi.includes('pytanie'), 'B10 „Czy” to nie zwrot grzecznościowy i nie sprawa');
check(lib.zwroty(d, lib.doOdjecia(d, st)).join('|') === 'Dzień dobry|mogłaby Pani', `B11 zwroty sklejone: ${lib.zwroty(d, lib.doOdjecia(d, st))}`);
const tz = lib.slowa('Cześć! Oddasz mi piłkę? Dzięki!');
const urz = lib.slowa('Szanowna Pani! Uprzejmie proszę o zwrot piłki. Z wyrazami szacunku');
check(lib.odejmij(urz.find((s) => s.low === 'zwrot')).ok === false, 'B8 „zwrot” niesie sprawę');
check(lib.odejmij(urz.find((s) => s.low === 'uprzejmie')).ok, 'B9 „Uprzejmie” to grzeczność');
const o = lib.odejmij(urz.find((s) => s.low === 'o'));
check(!o.ok && !o.mowi.includes('sprawę'), 'B12 „o” — słowo pomocnicze, nie sprawa');
check(lib.zwroty(urz, lib.doOdjecia(urz, lib.wystajace(tz, urz))).join('|') === 'Szanowna Pani|Uprzejmie proszę|Z wyrazami szacunku', `B13 wersja urzędowa: ${lib.zwroty(urz, lib.doOdjecia(urz, lib.wystajace(tz, urz)))}`);

// ── C. Ogłoszenie dla Zuzi ──
const { OGLOSZENIE, TACKA, upusc, werdykt, tekstPrzekladu } = lib;
const trudne = OGLOSZENIE.filter((k) => k.trudny).map((k) => k.id);
check(trudne.length === 5, `C1 pięć trudnych kawałków (${trudne.length})`);
check(!OGLOSZENIE.find((k) => k.id === 'k2').trudny && !OGLOSZENIE.find((k) => k.id === 'k5').trudny, 'C2 „poniedziałek” i „dziewiąta” Zuzia zna');
check(TACKA.every((z) => OGLOSZENIE.some((k) => k.id === z.na)), 'C3 każdy zamiennik ma swój kawałek');
check(trudne.every((k) => TACKA.some((z) => z.na === k && !z.gubi)), 'C4 każdy trudny kawałek ma dobry zamiennik');
const w0 = werdykt({});
check(!w0.ok && w0.niejasne.length === 5 && w0.zgubione.length === 0, 'C5 oryginał: 5 pytań Zuzi, nic nie zgubione');
const zle = upusc({}, 'z2', 'k4');
check(!zle.ok && zle.mowi.includes('nie znaczy tego samego'), 'C6 zamiennik w złym miejscu odbija się z powodem');
let p = {};
for (const [z, k] of [['z1', 'k1'], ['z2', 'k3'], ['z3', 'k4'], ['z6', 'k7'], ['z8', 'k8']]) p = upusc(p, z, k).next;
check(werdykt(p).ok, 'C7 dobry przekład: Zuzia rozumie i wie to samo');
check(tekstPrzekladu(p) === 'Słuchaj: w poniedziałek lekcje zaczną się o godzinie dziewiątej. Trzeba przynieść ubranie na WF.', `C8 tekst: ${tekstPrzekladu(p)}`);
const p2 = upusc(p, 'z9', 'k8').next;
const w2 = werdykt(p2);
check(!w2.ok && w2.zgubione[0]?.info === 'stroj' && w2.zgubione[0].skutek.includes('sukience'), 'C9 „coś ładnego” → Zuzia w sukience');
const p3 = upusc(p, 'z4', 'k5').next;
check(werdykt(p3).zgubione[0]?.info === 'godzina', 'C10 „rano” gubi godzinę');
const p4 = upusc(p, 'z7', 'k7').next;
check(werdykt(p4).zgubione[0]?.info === 'obowiazek', 'C11 „można” gubi obowiązek');
const p5 = upusc(p, 'z10', 'k2').next;
check(werdykt(p5).zgubione[0]?.info === 'dzien', 'C12 „kiedyś” gubi dzień');
check(werdykt(lib.cofnij(p, 'k8')).niejasne.length === 1, 'C13 cofnięcie przywraca trudne słowo');
const wszystkie = TACKA.filter((z) => z.gubi).map((z) => z.gubi);
check(new Set(wszystkie).size === 4, 'C14 cztery różne informacje do zgubienia — cztery skutki');

console.log(fail ? `✗ ${pass}/${pass + fail}` : `✓ ${pass}/${pass} OK`);
process.exit(fail ? 1 : 0);

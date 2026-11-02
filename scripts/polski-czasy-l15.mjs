// Generator form czasowników dla L15 (czasy) ze słownika SGJP.
// Uruchom: node scripts/polski-czasy-l15.mjs
import { createReadStream, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SGJP = join(homedir(), '.cache/dociekai/sgjp-20260823.tab.gz');
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../src/app/jezyk-polski/klasa-4/components/lessons/czasownik/czasy.forms.ts');
const LEMATY = ['płynąć', 'łowić', 'naprawić', 'zbudować', 'zapalić', 'karmić', 'szukać', 'spać'];
const WANTED = new Set([...LEMATY, 'być']);
if (!existsSync(SGJP)) { console.error('Brak zrzutu SGJP: ' + SGJP); process.exit(1); }

const acc = {};
for (const l of WANTED) acc[l] = { fin: new Set(), praet: new Set(), inf: new Set(), bedzie: new Set(), aspInf: new Set(), aspAll: new Set() };

const rl = createInterface({ input: createReadStream(SGJP).pipe(createGunzip()), crlfDelay: Infinity });
for await (const line of rl) {
  if (!line || line[0] === '#') continue;
  const c = line.split('\t');
  const lem = (c[1] || '').split(':')[0];
  const a = acc[lem];
  if (!a) continue;
  const form = c[0].toLowerCase();
  for (const tag of (c[2] || '').split('|')) {
    const seg = tag.split(':');
    if (seg.some((s) => s.split('.').includes('neg'))) continue;
    const cls = seg[0];
    const asp = seg.find((s) => s === 'perf' || s === 'imperf');
    if (cls === 'inf') { a.inf.add(form); if (asp) a.aspInf.add(asp); }
    else if (cls === 'fin') { a.fin.add(form); if (asp) a.aspAll.add(asp); }
    else if (cls === 'praet') { a.praet.add(form); if (asp) a.aspAll.add(asp); }
    else if (cls === 'bedzie' && lem === 'być') a.bedzie.add(form);
  }
}

const sorted = (s) => [...s].sort((x, y) => x.localeCompare(y, 'pl'));
const q = (arr) => '[' + arr.map((f) => JSON.stringify(f)).join(', ') + ']';
const result = {};
for (const l of LEMATY) {
  const a = acc[l];
  let asp;
  if (a.aspInf.size === 1) asp = [...a.aspInf][0];
  else { asp = a.aspInf.has('imperf') ? 'imperf' : [...a.aspAll][0]; console.log(`UWAGA: niejednoznaczny aspekt „${l}”: inf=${[...a.aspInf]} wszystkie=${[...a.aspAll]} -> ${asp}`); }
  result[l] = { aspekt: asp, fin: sorted(a.fin), praet: sorted(a.praet), inf: sorted(a.inf) };
}
const bedzie = sorted(acc['być'].bedzie);

let ts = `// WYGENEROWANE przez scripts/polski-czasy-l15.mjs ze słownika SGJP. Nie edytuj ręcznie.
export interface FormyCzasownika {
  aspekt: 'perf' | 'imperf';
  /** Formy osobowe czasu nieprzeszłego (tag fin): dla imperf to czas teraźniejszy, dla perf — przyszły. */
  fin: string[];
  /** Formy czasu przeszłego (praet), także z końcówkami osobowymi (łowiłem, łowiłyśmy...). */
  praet: string[];
  inf: string[];
}

export const CZASY: Record<string, FormyCzasownika> = {
`;
for (const l of LEMATY) {
  const r = result[l];
  ts += `  ${JSON.stringify(l)}: {\n    aspekt: '${r.aspekt}',\n    fin: ${q(r.fin)},\n    praet: ${q(r.praet)},\n    inf: ${q(r.inf)},\n  },\n`;
}
ts += `};

/** Formy czasu przyszłego „być”, które tworzą czas przyszły złożony (tag \`bedzie\`). */
export const BEDZIE: string[] = ${q(bedzie)};
`;
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, ts);

let bad = 0;
const chk = (ok, msg) => { if (!ok) { bad++; console.log('BŁĄD: ' + msg); } };
const has = (l, k, ...fs) => fs.forEach((f) => chk(result[l][k].includes(f), `${l}.${k} brak „${f}”`));
const asp = (l, a) => chk(result[l].aspekt === a, `${l} aspekt ${result[l].aspekt} != ${a}`);
asp('łowić', 'imperf'); has('łowić', 'fin', 'łowię', 'łowisz', 'łowi', 'łowimy', 'łowicie', 'łowią');
has('łowić', 'praet', 'łowił', 'łowiła', 'łowili', 'łowiły', 'łowiłem', 'łowiłam', 'łowiliśmy');
asp('naprawić', 'perf'); has('naprawić', 'fin', 'naprawię', 'naprawi', 'naprawimy');
asp('zbudować', 'perf'); has('zbudować', 'fin', 'zbuduję', 'zbudujemy');
asp('zapalić', 'perf'); has('zapalić', 'fin', 'zapali');
asp('płynąć', 'imperf'); has('płynąć', 'fin', 'płynę', 'płyniemy');
has('płynąć', 'praet', 'płynął', 'płynęła', 'płynęliśmy', 'płynąłem');
asp('spać', 'imperf'); has('spać', 'fin', 'śpię', 'śpimy', 'śpią');
has('spać', 'praet', 'spał', 'spała', 'spaliśmy');
asp('karmić', 'imperf'); asp('szukać', 'imperf');
const exp = ['będę', 'będziemy', 'będziecie', 'będziesz', 'będzie', 'będą'].sort();
chk(JSON.stringify(bedzie) === JSON.stringify(sorted(new Set(exp))), 'BEDZIE != ' + exp + ' (jest ' + bedzie + ')');
for (const l of LEMATY) console.log(`${l}: ${result[l].aspekt} fin=${result[l].fin.length} praet=${result[l].praet.length} inf=${result[l].inf.length}`);
console.log('BEDZIE:', bedzie.join(', '));
console.log(bad ? `${bad} błędów` : 'Wszystkie oczekiwania spełnione.');
process.exit(bad ? 1 : 0);

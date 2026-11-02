import type { Ksztalt } from '../../twarz/twarz';
import type { PaletteHit, PisarniaAnalysis } from '../../../lib/pisarnia/types';
import { ZNAK, type GrupaUczuc } from '../../../data/uczucia';

/**
 * L4, blok 3 „Bez twarzy” — Ola czyta odpowiedź dziecka na „Dostałam psa!”.
 *
 * Sędzia **struktury** (§ 6): jedno albo dwa zdania, wielka litera, znak na
 * końcu, co najmniej jedno słowo z palety uczuć bez „nie” przed nim. Treść
 * należy do dziecka. Maszyna-czytelnik (Ola) czyta tylko rodzinę uczucia ze
 * słów z palety i pokazuje ją twarzą: to skutek, nie ocena. Dwa uczucia o
 * przeciwnym znaku (cieszę się + zazdroszczę) — zakłopotana mina i pytanie,
 * bez wyrzutu: tak też bywa.
 */

export const TWARZ_UCZUCIA: Record<GrupaUczuc, Ksztalt> = {
  radosc: { brwi: 0.4, oczy: 0.3, usta: 1 },
  ciekawosc: { brwi: 0.8, oczy: 0.7, usta: 0.4 },
  zaskoczenie: { brwi: 1, oczy: 1, usta: 0 },
  zazdrosc: { brwi: -0.3, oczy: -0.5, usta: -0.2 },
  niepokoj: { brwi: 0.6, oczy: 0.6, usta: -0.5 },
  smutek: { brwi: 0.2, oczy: -0.4, usta: -0.8 },
  zlosc: { brwi: -1, oczy: -0.3, usta: -0.7 },
};

export const ZAKLOPOTANA: Ksztalt = { brwi: 0.3, oczy: 0, usta: -0.1 };
export const CZEKA: Ksztalt = { brwi: 0, oczy: 0, usta: 0.2 };

const ODPOWIEDZ_OLI: Record<GrupaUczuc, string> = {
  radosc: 'Wiedziałam, że się ucieszysz! Wpadnij po szkole go pogłaskać.',
  ciekawosc: 'Chcesz wiedzieć więcej? To kundelek, ma białą łatkę na oku. Przyjdź zobaczyć!',
  zaskoczenie: 'Ja też byłam zaskoczona! Nikt mi nie powiedział, że to dziś.',
  zazdrosc: 'Rozumiem, że trochę zazdrościsz. Możemy razem z nim chodzić na spacery.',
  niepokoj: 'Martwisz się? Spokojnie, mama nauczy mnie, jak się nim opiekować.',
  smutek: 'Smutno ci? Może przyjdziesz się z nim pobawić, to poprawia humor.',
  zlosc: 'Złościsz się? Nie wiem dlaczego… Napiszesz mi, co się stało?',
};

/**
 * Emotki to pisemna mina — temat tej lekcji, więc nie są błędem zapisu.
 * `maskEmotki` zamienia je w tekście na odstępy (pozycje się nie przesuwają,
 * podświetlenia w Pisarni zostają na miejscu); emotka zamykająca zdanie, bez
 * znaku przed sobą, staje się kropką — działa jak znak końca.
 */
const EMOTKA = /[:;=8]-?[)(DPpOo\]\[/|*]|<3|\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu;
const KONIEC = /[.!?…]\s*$/;

export function maskEmotki(text: string): { text: string; emotki: string[] } {
  const emotki: string[] = [];
  let out = '';
  let last = 0;
  for (const m of text.matchAll(EMOTKA)) {
    const i = m.index ?? 0;
    // „:D” w środku słowa albo „8)” po cyfrze to nie emotka.
    if (/[\p{L}\p{N}]/u.test(text[i - 1] ?? '') && /^[:;=8]/.test(m[0])) continue;
    emotki.push(m[0]);
    const before = out + text.slice(last, i);
    const after = text.slice(i + m[0].length);
    const zamyka = !KONIEC.test(before) && /\S/.test(before) && (/^\s*$/.test(after) || /^\s+[\p{Lu}]/u.test(after) || /^\s*\n/.test(after));
    const ws = before.match(/\s*$/)?.[0].length ?? 0;
    out = zamyka
      ? before.slice(0, before.length - ws) + '.' + ' '.repeat(ws + m[0].length - 1)
      : before + ' '.repeat(m[0].length);
    last = i + m[0].length;
  }
  return { text: out + text.slice(last), emotki };
}

export interface Odczyt {
  grupy: GrupaUczuc[];
  twarz: Ksztalt;
  mowi: string;
}

/**
 * Pytania o psa: Ola odpowiada, o ile dziecko pyta (zdanie z „?” albo
 * „ciekaw…”). Tematy jawne w kodzie; reszta pytań dostaje odpowiedź ogólną.
 */
const PYTANIA: { re: RegExp; odp: string }[] = [
  { re: /imi[eęo]|nazyw|woła/, odp: 'Nazywa się Kropka, bo ma łatkę na oku.' },
  { re: /ras[aęy]|wygląda|jaki|jaka|kolor|duży|duża|mały|mała|kundel/, odp: 'To mały kundelek, biały z brązową łatką na oku.' },
  { re: /(^|\s)ile(\s|$)|stary|stara|(^|\s)wiek|(^|\s)lat|miesi/, odp: 'Ma dopiero dwa miesiące.' },
  { re: /skąd|gdzie|kto ci|od kogo|dosta/, odp: 'Dostałam go od cioci, jej suczka miała szczeniaki.' },
  { re: /przyj|wpa|zobacz|pogłaska|pobawi|odwiedz|mogę/, odp: 'Jasne, wpadaj, kiedy chcesz!' },
];

function odpowiedziNaPytania(a: PisarniaAnalysis): string[] {
  const pyta = a.sentences.filter((s) => s.endMark === '?' || s.endMark === '?!' || /ciekaw/i.test(s.text));
  if (!pyta.length) return [];
  const odp = new Set<string>();
  for (const s of pyta) {
    const low = s.text.toLowerCase();
    const hit = PYTANIA.find((p) => p.re.test(low));
    if (hit) odp.add(hit.odp);
  }
  if (!odp.size && pyta.some((s) => s.endMark === '?' || s.endMark === '?!')) odp.add('O wszystko mnie zapytaj, kiedy go zobaczysz!');
  return [...odp];
}

export function czytaOla(a: PisarniaAnalysis): Odczyt {
  const hits: PaletteHit[] = a.hits;
  const grupy = [...new Set(hits.filter((h) => !h.negated && h.group).map((h) => h.group as GrupaUczuc))];
  const odp = odpowiedziNaPytania(a);
  const z = (s: string) => [s, ...odp].join(' ');
  if (grupy.length === 0) return { grupy, twarz: CZEKA, mowi: 'Ola czyta… i nie wie, co czujesz.' };
  const znaki = new Set(grupy.map((g) => ZNAK[g]).filter((x) => x !== 0));
  if (znaki.size > 1)
    return { grupy, twarz: ZAKLOPOTANA, mowi: z('Cieszysz się i jednocześnie coś cię gryzie? Tak też bywa. Opowiesz mi?') };
  const g = grupy[0];
  // Ciekawość z pytaniem: Ola odpowiada na pytanie zamiast mówić swoje o łatce.
  if (g === 'ciekawosc' && odp.length) return { grupy, twarz: TWARZ_UCZUCIA[g], mowi: z('Chcesz wiedzieć więcej? Proszę bardzo.') };
  return { grupy, twarz: TWARZ_UCZUCIA[g], mowi: z(ODPOWIEDZ_OLI[g]) };
}

export interface Kryterium {
  ok: boolean;
  note: string;
}

export function judgeOdpowiedz(a: PisarniaAnalysis, emotki: string[] = []): { zdania: Kryterium; zapis: Kryterium; uczucie: Kryterium } {
  const s = a.sentences.filter((x) => x.words.length > 0);
  const zdania: Kryterium =
    s.length === 0
      ? { ok: false, note: 'Pole jest jeszcze puste.' }
      : s.length > 2
        ? { ok: false, note: `Widzę ${s.length} ${s.length < 5 ? 'zdania' : 'zdań'}. Krótko: jedno albo dwa.` }
        : { ok: true, note: s.length === 1 ? 'Jedno zdanie.' : 'Dwa zdania.' };
  // Każde wadliwe zdanie ze wszystkimi swoimi usterkami — nie tylko pierwsza z nich.
  const cytat = (t: string) => (t.length > 30 ? `${t.slice(0, 30).trimEnd()}…` : t);
  const usterki = s
    .map((x) => {
      const u = [!x.capitalOk && 'zaczyna się małą literą', !x.endMark && 'nie ma znaku na końcu (kropki, wykrzyknika albo pytajnika)'].filter(Boolean);
      return u.length ? `Zdanie „${cytat(x.text)}” ${u.join(' i ')}.` : null;
    })
    .filter(Boolean);
  const zapis: Kryterium = usterki.length
    ? { ok: false, note: usterki.join(' ') }
    : s.length
      ? { ok: true, note: 'Wielka litera na początku, znak na końcu.' }
      : { ok: false, note: 'Najpierw zdanie.' };
  const trafione = a.hits.filter((h) => !h.negated);
  const zaprzeczone = a.hits.find((h) => h.negated);
  const uczucie: Kryterium = trafione.length
    ? { ok: true, note: `Słowo uczucia: „${a.text.slice(trafione[0].start, trafione[0].end)}”.` }
    : zaprzeczone
      ? {
          ok: false,
          note: `„Nie ${a.text.slice(zaprzeczone.start, zaprzeczone.end)}” mówi Oli tylko, czego nie czujesz — a ona dalej nie wie, co czujesz. Napisz to wprost, bez „nie”.`,
        }
      : emotki.length
        ? { ok: false, note: `Buźka „${emotki[0]}” to pisemna mina — dobra podpowiedź, ale Ola potrzebuje słowa. Dopisz słowo uczucia z palety.` }
        : { ok: false, note: 'Nie ma słowa z palety uczuć — Ola nie zobaczy twojej miny, musi to przeczytać.' };
  return { zdania, zapis, uczucie };
}

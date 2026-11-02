/**
 * L17 blok 2 — „Za dużo Tymka”. Opowiadanie „Tymek na wyspie” (T-L17-1,
 * napisane dla kursu): dziewięć zdań, osiem razy imię. Dziecko zasłania imię
 * naklejką-zaimkiem; forma naklejki (on, go, mu, niego, nim) stoi w danych
 * wystąpienia, nie wynika z reguły w kodzie. Czysta logika — selftest
 * `scripts/polski-l17-selftest.mjs`.
 *
 * **Kiedy zaimek jest jasny, rozstrzyga adnotacja, nie nasza intuicja:**
 * każde zdanie ma listę `osoby` — chłopców, o których mówi (także przez
 * „obaj chłopcy” albo przez zaimek). Zaimek w miejscu imienia jest jasny
 * tylko wtedy, gdy wcześniej — w poprzednim zdaniu albo wcześniej w tym samym
 * zdaniu — był sam Tymek. Gdy byli obaj chłopcy, nie wiadomo „który?”; gdy
 * Tymka jeszcze nie było, nie wiadomo „kto?”. Kot jest rodzaju męskiego, ale
 * w opowiadaniu nigdy nie stoi tuż przed zasłanianym imieniem tak, żeby
 * zaimek mógł iść do niego.
 */

export type Osoba = 'tymek' | 'kuba';

/** Fragment zdania: zwykły tekst albo wystąpienie imienia z formą naklejki. */
export type Kawalek = { t: string } | { imie: string; zaimek: string; id: string };

export interface ZdanieOpowiadania {
  id: string;
  kawalki: Kawalek[];
  /** Chłopcy, o których mówi zdanie, w kolejności pojawienia się. */
  osoby: Osoba[];
  /** Osoby wspomniane w zdaniu PRZED danym wystąpieniem imienia (klucz = id wystąpienia). */
  przed?: Record<string, Osoba[]>;
}

const t = (s: string): Kawalek => ({ t: s });
const im = (id: string, imie: string, zaimek: string): Kawalek => ({ id, imie, zaimek });

export const OPOWIADANIE: ZdanieOpowiadania[] = [
  { id: 's1', kawalki: [t('Rano do pomostu przybiła łódka, a z łódki wyskoczyli '), im('t1', 'Tymek', 'on'), t(' i Kuba.')], osoby: ['tymek', 'kuba'] },
  { id: 's2', kawalki: [im('t2', 'Tymek', 'On'), t(' pobiegł prosto do latarni.')], osoby: ['tymek'] },
  { id: 's3', kawalki: [t('Drzwi białego domku były otwarte, więc '), im('t3', 'Tymek', 'on'), t(' zajrzał do środka.')], osoby: ['tymek'] },
  { id: 's4', kawalki: [t('Na parapecie spał rudy kot, ale '), im('t4', 'Tymka', 'go'), t(' wcale nie zauważył.')], osoby: ['tymek'] },
  {
    id: 's5',
    kawalki: [im('t5', 'Tymek', 'On'), t(' usiadł na kanapie, a kot otworzył jedno oko i wskoczył '), im('t6', 'Tymkowi', 'mu'), t(' na kolana.')],
    osoby: ['tymek'],
    przed: { t6: ['tymek'] },
  },
  { id: 's6', kawalki: [t('Po chwili do domku wpadł zdyszany Kuba i kot zeskoczył na podłogę, między obu chłopców.')], osoby: ['kuba', 'tymek'] },
  { id: 's7', kawalki: [t('Długo się wahał, aż w końcu zaczął się ocierać o '), im('t7', 'Tymka', 'niego'), t('.')], osoby: ['tymek'] },
  { id: 's8', kawalki: [t('Do wieczora kot nie rozstawał się z '), im('t8', 'Tymkiem', 'nim'), t('.')], osoby: ['tymek'] },
  { id: 's9', kawalki: [t('Kuba wyjrzał przez okno i zobaczył, że nad wyspą zachodzi słońce.')], osoby: ['kuba'] },
];

export interface Wystapienie {
  id: string;
  zdanie: number;
  imie: string;
  zaimek: string;
}

export const WYSTAPIENIA: Wystapienie[] = OPOWIADANIE.flatMap((z, i) =>
  z.kawalki.flatMap((k) => ('imie' in k ? [{ id: k.id, zdanie: i, imie: k.imie, zaimek: k.zaimek }] : [])),
);

/** Najwięcej imion, które mogą zostać. */
export const NAJWIECEJ_IMION = 3;

export type Jasnosc = 'jasne' | 'ktory' | 'kto';

/**
 * Czy zaimek w miejscu wystąpienia `id` wiadomo, do kogo idzie. Kontekst =
 * osoby poprzedniego zdania + osoby wcześniej w tym samym zdaniu.
 * `ktory` — w kontekście obaj chłopcy; `kto` — Tymka w kontekście nie ma.
 */
export function jasnosc(id: string): Jasnosc {
  const w = WYSTAPIENIA.find((x) => x.id === id);
  if (!w) throw new Error(`L17: nieznane wystąpienie ${id}`);
  const z = OPOWIADANIE[w.zdanie];
  const kontekst = new Set<Osoba>([...(w.zdanie > 0 ? OPOWIADANIE[w.zdanie - 1].osoby : []), ...(z.przed?.[id] ?? [])]);
  if (kontekst.has('kuba') && kontekst.has('tymek')) return 'ktory';
  if (kontekst.has('kuba')) return 'ktory';
  if (!kontekst.has('tymek')) return 'kto';
  return 'jasne';
}

export interface StanZaimkow {
  /** Ocalone wystąpienia zasłonięte naklejką. */
  naklejki: string[];
}

export interface Ocena {
  imion: number;
  niejasne: { id: string; zdanie: number; jak: Exclude<Jasnosc, 'jasne'> }[];
  przyjete: boolean;
}

export function ocen(naklejki: string[]): Ocena {
  const set = new Set(naklejki);
  const imion = WYSTAPIENIA.filter((w) => !set.has(w.id)).length;
  const niejasne = WYSTAPIENIA.filter((w) => set.has(w.id))
    .map((w) => ({ id: w.id, zdanie: w.zdanie, jak: jasnosc(w.id) }))
    .filter((x): x is Ocena['niejasne'][number] => x.jak !== 'jasne');
  return { imion, niejasne, przyjete: imion <= NAJWIECEJ_IMION && niejasne.length === 0 };
}

/** Przyklej / odklej (czysto). Nieznane id — bez zmian. */
export function przyklej(naklejki: string[], id: string): string[] {
  if (!WYSTAPIENIA.some((w) => w.id === id) || naklejki.includes(id)) return naklejki;
  return [...naklejki, id];
}

export const odklej = (naklejki: string[], id: string) => naklejki.filter((x) => x !== id);

/** Tekst zdania z naklejkami (do zrzutu i podpisu ilustracji). Zaimek na początku zdania — wielką literą, jak w danych. */
export function tekstZdania(i: number, naklejki: string[]): string {
  const set = new Set(naklejki);
  return OPOWIADANIE[i].kawalki.map((k) => ('imie' in k ? (set.has(k.id) ? k.zaimek : k.imie) : k.t)).join('');
}

/** Pytanie ilustracji przy niejasnym zaimku. */
export function pytanie(jak: Exclude<Jasnosc, 'jasne'>, zaimek: string): string {
  return jak === 'ktory'
    ? `„${zaimek}” — który? Tuż przed chwilą byli tu obaj chłopcy.`
    : `„${zaimek}” — kto? Opowiadanie jeszcze nie powiedziało, o kim mowa.`;
}

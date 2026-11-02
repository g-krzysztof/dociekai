import type { KorpusSource } from '../../../lib/korpus/types';
import { analyze, compilePalette } from '../../../lib/pisarnia';
import type { PaletteEntry } from '../../../lib/pisarnia/types';

/**
 * L7 „Co czuję, czego potrzebuję” — scenka „Model” (tekst napisany dla
 * kursu, rejestr T-L7-1). Kłótnia rodzeństwa: zabrane skrzydło i przykre
 * słowa, nic więcej (karta, pułapki).
 *
 * Każda linia ma skutek zapisany w danych: o ile rośnie złość/smutek każdej
 * postaci i głośność. Zdanie „pogarszające” to takie, po którym scena
 * naprawdę idzie w górę — dziecko widzi to w twarzach i na mierniku, więc
 * przyjmowane jest każde takie zdanie, nie jedno „nasze”.
 */

export type Kto = 'narrator' | 'tymek' | 'zuzia';

export interface Linia {
  id: string;
  kto: Kto;
  text: string;
  /** Skutek po tej linii: przyrost napięcia każdej postaci (0–3) i głośności. */
  skutek: { tymek: number; zuzia: number; glosno: number };
}

export const SCENA: Linia[] = [
  { id: 'l0', kto: 'narrator', text: 'Tymek od rana składał model samolotu. Zostało mu tylko przykleić skrzydło.', skutek: { tymek: 0, zuzia: 0, glosno: 0 } },
  { id: 'l1', kto: 'narrator', text: 'Zuzia od tygodnia prosiła, żeby się z nią pobawił. Weszła do pokoju i wzięła skrzydło do ręki.', skutek: { tymek: 1, zuzia: 0, glosno: 0 } },
  { id: 'l2', kto: 'tymek', text: 'Oddawaj! Zawsze mi wszystko zabierasz!', skutek: { tymek: 1, zuzia: 1, glosno: 1 } },
  { id: 'l3', kto: 'zuzia', text: 'A ty nigdy się ze mną nie bawisz!', skutek: { tymek: 1, zuzia: 1, glosno: 1 } },
  { id: 'l4', kto: 'narrator', text: 'Tymek poczerwieniał i zacisnął pięści.', skutek: { tymek: 0, zuzia: 0, glosno: 0 } },
  { id: 'l5', kto: 'tymek', text: 'Jesteś okropna! Wynoś się z mojego pokoju!', skutek: { tymek: 0, zuzia: 2, glosno: 1 } },
  { id: 'l6', kto: 'narrator', text: 'Zuzia rozpłakała się i rzuciła skrzydło na podłogę. Skrzydło pękło na pół.', skutek: { tymek: 1, zuzia: 0, glosno: 1 } },
];

/** Napięcie postaci po linii `i` (włącznie) — suma skutków. */
export function napiecie(i: number): { tymek: number; zuzia: number; glosno: number } {
  return SCENA.slice(0, i + 1).reduce((a, l) => ({ tymek: a.tymek + l.skutek.tymek, zuzia: a.zuzia + l.skutek.zuzia, glosno: a.glosno + l.skutek.glosno }), { tymek: 0, zuzia: 0, glosno: 0 });
}

/** Zdanie pogarsza, jeśli po nim rośnie napięcie drugiej strony albo głośność. Dotyczy tylko wypowiedzi postaci. */
export function pogarsza(id: string): boolean {
  const l = SCENA.find((x) => x.id === id);
  if (!l || l.kto === 'narrator') return false;
  const druga = l.kto === 'tymek' ? 'zuzia' : 'tymek';
  return l.skutek[druga] > 0 || l.skutek.glosno > 0;
}

export const POGARSZAJACE = SCENA.filter((l) => pogarsza(l.id)).map((l) => l.id);

export function stukniecie(id: string): { ok: boolean; mowi: string } {
  const l = SCENA.find((x) => x.id === id)!;
  if (l.kto === 'narrator') return { ok: false, mowi: 'To mówi narrator — opisuje, co się dzieje. Szukaj słów, które ktoś powiedział.' };
  if (pogarsza(id)) {
    const druga = l.kto === 'tymek' ? 'Zuzia' : 'Tymek';
    return { ok: true, mowi: `Tak — po tym zdaniu ${druga} ${l.skutek[l.kto === 'tymek' ? 'zuzia' : 'tymek'] > 1 ? 'aż się rozpłakała' : 'się złości'}, a w pokoju robi się głośniej.` };
  }
  return { ok: false, mowi: 'Po tym zdaniu nic się nie zmieniło.' };
}

// ── Blok 2: tekst z narratorem ───────────────────────────────────────────────

/** Ta sama kłótnia jako tekst z adnotacją: fragmenty mają właściciela i rodzaj (uczucie / potrzeba). */
export const MODEL: KorpusSource = {
  id: 'model',
  layout: 'prose',
  body: `[[p-tymek Tymek od rana składał model samolotu.]] Zostało mu tylko przykleić skrzydło.

[[p-zuzia Zuzia od tygodnia prosiła, żeby się z nią pobawił.]] Weszła do pokoju i wzięła skrzydło do ręki.

[[u-tymek-1 — Oddawaj! Zawsze mi wszystko zabierasz!]] — krzyknął Tymek.

[[u-zuzia-1 — A ty nigdy się ze mną nie bawisz!]] — odkrzyknęła Zuzia.

[[u-tymek-2 Tymek poczerwieniał i zacisnął pięści.]]

[[u-tymek-3 — Jesteś okropna! Wynoś się z mojego pokoju!]]

[[u-zuzia-2 Zuzia rozpłakała się]] i rzuciła skrzydło na podłogę. Skrzydło pękło na pół.`,
  spans: {
    'p-tymek': { kind: 'potrzeba', speaker: 'tymek' },
    'p-zuzia': { kind: 'potrzeba', speaker: 'zuzia' },
    'u-tymek-1': { kind: 'uczucie', speaker: 'tymek' },
    'u-tymek-2': { kind: 'uczucie', speaker: 'tymek' },
    'u-tymek-3': { kind: 'uczucie', speaker: 'tymek' },
    'u-zuzia-1': { kind: 'uczucie', speaker: 'zuzia' },
    'u-zuzia-2': { kind: 'uczucie', speaker: 'zuzia' },
  },
};

export type Rodzaj = 'uczucie' | 'potrzeba';

/** Sędzia dowodu: czy stuknięty fragment należy do tej postaci i mówi o tym, o co pytamy. */
export function judgeDowod(spans: Record<string, { meta: { kind: string; speaker?: string } }>, spanId: string | null, kto: 'tymek' | 'zuzia', rodzaj: Rodzaj): { ok: boolean; mowi: string } {
  const imie = kto === 'tymek' ? 'Tymka' : 'Zuzi';
  if (!spanId || !spans[spanId]) return { ok: false, mowi: `To zdanie nic nie mówi o tym, co ${rodzaj === 'uczucie' ? 'czuje' : 'jest potrzebne'} ${kto === 'tymek' ? 'Tymkowi' : 'Zuzi'}. Szukaj dalej.` };
  const s = spans[spanId].meta;
  if (s.speaker !== kto) return { ok: false, mowi: `To zdanie jest o ${kto === 'tymek' ? 'Zuzi' : 'Tymku'}, nie o ${kto === 'tymek' ? 'Tymku' : 'Zuzi'}.` };
  const imie1 = kto === 'tymek' ? 'Tymek' : 'Zuzia';
  const a = kto === 'tymek' ? '' : 'a';
  if (s.kind !== rodzaj)
    return {
      ok: false,
      mowi:
        rodzaj === 'uczucie'
          ? `To zdanie mówi, co ${imie1} robił${a} albo czego chciał${a}. Szukamy, co czuł${a}.`
          : `To zdanie pokazuje, co ${imie1} czuł${a}. Szukamy, czego potrzebował${a} — co robił${a} albo o co prosił${a} wcześniej.`,
    };
  return { ok: true, mowi: rodzaj === 'uczucie' ? `Tak — tu widać uczucie ${imie}.` : `Tak — tu widać, czego potrzeb${kto === 'tymek' ? 'ował Tymek' : 'owała Zuzia'}.` };
}

// ── Blok 3: komunikat „ja” ───────────────────────────────────────────────────

/** Słowa-oskarżenia z bloku 1 (rejestr T-L7-*) — czytane w paskach „kiedy…” i „Proszę, …”. */
export const OSKARZENIA: PaletteEntry[] = [
  { id: 'zawsze', label: 'zawsze', forms: ['zawsze'], group: 'oskarzenie' },
  { id: 'nigdy', label: 'nigdy', forms: ['nigdy'], group: 'oskarzenie' },
  { id: 'ty-jestes', label: 'ty jesteś', forms: ['ty jesteś', 'jesteś taki', 'jesteś taka'], group: 'oskarzenie' },
  { id: 'przezwiska', label: 'przezwiska', forms: ['okropna', 'okropny', 'głupia', 'głupi', 'głupie', 'wredna', 'wredny', 'beksa', 'złodziejka', 'złodziej'], group: 'oskarzenie' },
  { id: 'wynos', label: 'wynoś się', forms: ['wynoś', 'spadaj', 'odczep'], group: 'oskarzenie' },
];

/**
 * Blok 3 po przeglądzie 2026-10-19 (R4): zamiast dwóch Pisarni — **taśma z luką**. Dziecko wyjmuje z taśmy
 * wyrzut (`MOMENT`) i w lukę wkłada komunikat z trzech pasków: uczucie
 * (wybór dziecka, bez klucza), „kiedy…” **wycięte z klatek taśmy** przed
 * luką i z wyjętej klatki, „Proszę, …” z palety. Czy pasek oskarża, nie
 * mówi klucz autora, tylko słowa z bloku 1 (`OSKARZENIA`: zawsze, nigdy,
 * jesteś…, przezwiska, wynoś się) — `oskarza()` czyta je analizatorem.
 */
export type Strona = 'tymek' | 'zuzia';

/** Klatka, którą dana strona wyjmuje z taśmy (jej wyrzut). */
export const MOMENT: Record<Strona, string> = { tymek: 'l2', zuzia: 'l3' };

export interface Pasek {
  id: string;
  /** Klatka taśmy, z której pasek jest wycięty. */
  z: string;
  text: string;
}

/** „…kiedy” — w drugiej osobie, bo mówi się do drugiej strony. Klatki tylko sprzed luki albo sama wyjęta. */
export const KIEDY: Record<Strona, Pasek[]> = {
  tymek: [
    { id: 't-bierzesz', z: 'l1', text: 'bierzesz skrzydło bez pytania' },
    { id: 't-zawsze', z: 'l2', text: 'zawsze mi wszystko zabierasz' },
    { id: 't-model', z: 'l0', text: 'ktoś rusza model, który kleję od rana' },
  ],
  zuzia: [
    { id: 'z-nigdy', z: 'l3', text: 'nigdy się ze mną nie bawisz' },
    { id: 'z-czekam', z: 'l1', text: 'od tygodnia czekam, aż się ze mną pobawisz' },
    { id: 'z-krzyczysz', z: 'l2', text: 'krzyczysz na mnie' },
  ],
};

/** „Proszę, …” — prośby; jedna z każdej strony to rozkaz albo przezwisko z taśmy. */
export const PROSBY: Record<Strona, Pasek[]> = {
  tymek: [
    { id: 't-zapytaj', z: '', text: 'zapytaj, zanim coś weźmiesz' },
    { id: 't-wynos', z: 'l5', text: 'wynoś się z mojego pokoju' },
    { id: 't-poczekaj', z: '', text: 'poczekaj, aż skończę, a potem się pobawimy' },
  ],
  zuzia: [
    { id: 'z-pobaw', z: '', text: 'pobaw się ze mną, kiedy skończysz' },
    { id: 'z-nie-krzycz', z: '', text: 'nie krzycz na mnie' },
    { id: 'z-wredny', z: '', text: 'nie bądź taki wredny' },
  ],
};

const OSK_PALETA = compilePalette(OSKARZENIA);

/** Słowo-oskarżenie w pasku (pierwsze), albo `null`. */
export function oskarza(text: string): string | null {
  const a = analyze(text, { palette: OSK_PALETA });
  const h = a.hits[0];
  return h ? text.slice(h.start, h.end) : null;
}

export interface Ulozone {
  uczucie: string | null;
  kiedy: string | null;
  prosba: string | null;
}

export type Werdykt =
  | { ok: true; zdanie: string }
  | { ok: false; brak: 'uczucie' | 'kiedy' | 'prosba' }
  | { ok: false; slowo: string; gdzie: 'kiedy' | 'prosba' };

const IMIE: Record<Strona, string> = { tymek: 'Tymek', zuzia: 'Zuzia' };

export function zdanieKomunikatu(u: Ulozone, strona: Strona): string | null {
  const k = KIEDY[strona].find((p) => p.id === u.kiedy);
  const p = PROSBY[strona].find((x) => x.id === u.prosba);
  if (!u.uczucie || !k || !p) return null;
  return `Czuję ${u.uczucie}, kiedy ${k.text}. Proszę, ${p.text}.`;
}

/** Sędzia: trzy paski na miejscu i żaden nie oskarża. Uczucia nie sprawdza — należy do dziecka. */
export function ocen(u: Ulozone, strona: Strona): Werdykt {
  if (!u.uczucie) return { ok: false, brak: 'uczucie' };
  const k = KIEDY[strona].find((p) => p.id === u.kiedy);
  if (!k) return { ok: false, brak: 'kiedy' };
  const p = PROSBY[strona].find((x) => x.id === u.prosba);
  if (!p) return { ok: false, brak: 'prosba' };
  const wK = oskarza(k.text);
  if (wK) return { ok: false, slowo: wK, gdzie: 'kiedy' };
  const wP = oskarza(p.text);
  if (wP) return { ok: false, slowo: wP, gdzie: 'prosba' };
  return { ok: true, zdanie: zdanieKomunikatu(u, strona)! };
}

/** Reakcja drugiej strony na komunikat, który znowu oskarża. */
export function jezySie(strona: Strona, slowo: string): string {
  const druga = strona === 'tymek' ? 'zuzia' : 'tymek';
  return `${IMIE[druga]} słyszy „${slowo}” i znowu się jeży: „Wcale nie!” Taśma idzie tak jak przedtem — oskarżenie wróciło.`;
}

export const ODPOWIEDZ: Record<'tymek' | 'zuzia', { mowi: string; koniec: string }> = {
  tymek: {
    mowi: 'Zuzia odkłada skrzydło na biurko: „Przepraszam. Ja tylko chciałam się z tobą pobawić. Smutno mi, kiedy cały dzień siedzisz przy modelu.”',
    koniec: 'Tymek się zastanawia… „To może kleimy razem? Ty trzymasz, ja smaruję klejem.” Skrzydło trzyma się mocno.',
  },
  zuzia: {
    mowi: 'Tymek przestaje krzyczeć: „Przepraszam, że na ciebie wrzasnąłem. Złoszczę się, kiedy ktoś rusza mój model, bo kleję go od rana.”',
    koniec: '„To może pomogę? Będę trzymać skrzydło.” — „Dobra. Tylko ostrożnie.” Kleją razem.',
  },
};

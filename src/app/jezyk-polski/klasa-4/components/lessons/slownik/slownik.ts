/**
 * L10 — logika „grubego słownika” (czysta, bez Reacta; selftest
 * `scripts/polski-l10-selftest.mjs`).
 *
 * - `porownaj` — **polska kolejność słownikowa**: litera po literze według
 *   `ALFABET` (ą po a, ć po c, ę po e, ł po l, ń po n, ó po o, ś po s, ź i ż
 *   po z); „ch” nie jest osobną literą; krótszy początek stoi przed dłuższym.
 * - `zbudujSlownik` — strony słownika o zadanej grubości z jednej listy
 *   lematów (ta sama lista daje słownik cienki i gruby).
 * - `wskazowka` — gdzie jest hasło względem rozkładówki i **dlaczego**
 *   (pierwsza litera, która się różni) — z tego budujemy „tu było”.
 */

export const ALFABET = 'aąbcćdeęfghijklłmnńoópqrsśtuvwxyzźż';
const RANK: Record<string, number> = Object.fromEntries([...ALFABET].map((c, i) => [c, i]));

function rank(c: string): number {
  return RANK[c] ?? ALFABET.length + c.charCodeAt(0);
}

export function porownaj(a: string, b: string): number {
  const x = [...a.toLowerCase()];
  const y = [...b.toLowerCase()];
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i++) {
    const d = rank(x[i]) - rank(y[i]);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return x.length === y.length ? 0 : x.length < y.length ? -1 : 1;
}

/** Indeks pierwszej różnej litery albo długość krótszego słowa, gdy jedno jest początkiem drugiego. */
export function pierwszaRoznica(a: string, b: string): number {
  const x = [...a.toLowerCase()];
  const y = [...b.toLowerCase()];
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i++) if (x[i] !== y[i]) return i;
  return n;
}

export interface Slownik {
  /** Strony; każda to posortowane hasła. Liczba stron parzysta (rozkładówki). */
  strony: string[][];
  /** Wycięcia na brzegu: litera → pierwsza strona, na której pojawia się hasło na tę literę. */
  litery: { litera: string; strona: number }[];
}

/**
 * Słownik o `liczbaStron` stronach po ok. `naStrone` haseł. Hasła z
 * `wymagane` są zawsze w środku (szukane w rundach), resztę próbkujemy
 * równomiernie z `lematy`, więc cieńszy słownik to rzadsze sito tej samej listy.
 */
export function zbudujSlownik(
  lematy: readonly string[],
  liczbaStron: number,
  naStrone: number,
  wymagane: readonly string[] = []
): Slownik {
  if (liczbaStron < 2 || liczbaStron % 2) throw new Error(`Słownik: liczba stron ${liczbaStron} musi być parzysta`);
  const req = [...new Set(wymagane.map((w) => w.toLowerCase()))];
  const reqSet = new Set(req);
  const pool = [...new Set(lematy.map((w) => w.toLowerCase()))].filter((w) => !reqSet.has(w)).sort(porownaj);
  const ile = Math.max(0, liczbaStron * naStrone - req.length);
  const wybrane: string[] = [];
  if (pool.length <= ile) wybrane.push(...pool);
  else for (let i = 0; i < ile; i++) wybrane.push(pool[Math.floor(((i + 0.5) * pool.length) / ile)]);
  const hasla = [...new Set([...wybrane, ...req])].sort(porownaj);
  if (hasla.length < liczbaStron) throw new Error(`Słownik: za mało haseł (${hasla.length}) na ${liczbaStron} stron`);

  const strony: string[][] = [];
  for (let j = 0; j < liczbaStron; j++) {
    strony.push(hasla.slice(Math.floor((j * hasla.length) / liczbaStron), Math.floor(((j + 1) * hasla.length) / liczbaStron)));
  }
  const litery: Slownik['litery'] = [];
  strony.forEach((s, j) =>
    s.forEach((w) => {
      const l = [...w][0];
      if (!litery.some((x) => x.litera === l)) litery.push({ litera: l, strona: j });
    })
  );
  return { strony, litery };
}

export function liczbaRozkladowek(s: Slownik): number {
  return s.strony.length / 2;
}

/** Żywa pagina rozkładówki: pierwsze hasło lewej strony i ostatnie prawej. */
export function pagina(s: Slownik, rozkladowka: number): { pierwsze: string; ostatnie: string } {
  const lewa = s.strony[rozkladowka * 2];
  const prawa = s.strony[rozkladowka * 2 + 1];
  return { pierwsze: lewa[0], ostatnie: prawa[prawa.length - 1] };
}

export function rozkladowkaHasla(s: Slownik, haslo: string): number {
  const j = s.strony.findIndex((st) => st.includes(haslo));
  return j < 0 ? -1 : Math.floor(j / 2);
}

export type Kierunek = 'tu' | 'dalej' | 'wczesniej';

export interface Wskazowka {
  kierunek: Kierunek;
  /** Słowo, z którym porównujemy (początek albo koniec rozkładówki, albo stuknięte hasło). */
  wzgledem: string;
  /** Indeks litery, która rozstrzyga (od 0); równy długości krótszego słowa, gdy jedno jest początkiem drugiego. */
  litera: number;
}

/** Gdzie jest `cel` względem słowa `wzgledem` — i która litera o tym decyduje. */
export function porownajZ(cel: string, wzgledem: string): Wskazowka {
  const c = porownaj(cel, wzgledem);
  return { kierunek: c === 0 ? 'tu' : c > 0 ? 'dalej' : 'wczesniej', wzgledem, litera: pierwszaRoznica(cel, wzgledem) };
}

/** Gdzie jest `cel` względem rozkładówki. */
export function wskazowka(s: Slownik, rozkladowka: number, cel: string): Wskazowka {
  const { pierwsze, ostatnie } = pagina(s, rozkladowka);
  if (porownaj(cel, pierwsze) < 0) return porownajZ(cel, pierwsze);
  if (porownaj(cel, ostatnie) > 0) return porownajZ(cel, ostatnie);
  return { kierunek: 'tu', wzgledem: pierwsze, litera: 0 };
}

const PORZADKOWE = ['pierwszą', 'drugą', 'trzecią', 'czwartą', 'piątą', 'szóstą', 'siódmą', 'ósmą', 'dziewiątą', 'dziesiątą'];

/**
 * Wyjaśnienie dla dziecka: „Porównaj drugą literę: w „kot” jest o, w „kawa”
 * a — o jest w alfabecie po a, więc „kot” jest dalej.” Zwraca części, żeby
 * komponent mógł pogrubić litery.
 */
export function powod(cel: string, w: Wskazowka): string {
  if (w.kierunek === 'tu') return `„${cel}” jest gdzieś na tej rozkładówce.`;
  const x = [...cel.toLowerCase()];
  const y = [...w.wzgledem.toLowerCase()];
  const gdzie = w.kierunek === 'dalej' ? 'dalej' : 'wcześniej';
  if (w.litera >= Math.min(x.length, y.length)) {
    const krotsze = x.length < y.length ? cel : w.wzgledem;
    const dluzsze = x.length < y.length ? w.wzgledem : cel;
    return `„${krotsze}” to początek słowa „${dluzsze}”, a krótsze słowo stoi w słowniku wcześniej — więc „${cel}” jest ${gdzie}.`;
  }
  const ktora = PORZADKOWE[w.litera] ?? `${w.litera + 1}.`;
  const a = x[w.litera];
  const b = y[w.litera];
  const kolejnosc = w.kierunek === 'dalej' ? `Litera ${a} jest w alfabecie po ${b}` : `Litera ${a} jest w alfabecie przed ${b}`;
  const wstep = w.litera === 0 ? 'Spójrz na pierwszą literę' : `Pierwsze litery się zgadzają. Porównaj ${ktora}`;
  return `${wstep}: w „${cel}” jest ${a}, w „${w.wzgledem}” — ${b}. ${kolejnosc}, więc „${cel}” jest ${gdzie}.`;
}

/** Stuknięcie hasła na stronie: trafione albo wyjaśnienie, w którą stronę szukać. */
export function sprawdzHaslo(cel: string, stukniete: string): { trafione: boolean; tekst: string } {
  if (porownaj(cel, stukniete) === 0) return { trafione: true, tekst: `Jest! „${cel}”.` };
  return { trafione: false, tekst: `To „${stukniete}”, nie „${cel}”. ${powod(cel, porownajZ(cel, stukniete))}` };
}

// ——— fizyka kartkowania (osobno, żeby dało się ją sprawdzić bez przeglądarki) ———

/** Stała czasowa tarcia w ms: po tylu ms prędkość spada do ok. 37%. */
export const TARCIE_MS = 260;
/** Prędkość (rozkładówek/ms), poniżej której strony stają. */
export const STOP = 0.0015;

/** Jeden krok bezwładności: pozycja i prędkość po `dt` ms. Ruch zatrzymuje się na brzegach. */
export function krokBezwladnosci(p: number, v: number, dt: number, max: number): { p: number; v: number } {
  const k = Math.exp(-dt / TARCIE_MS);
  // Całka z v·e^(-t/τ) od 0 do dt.
  let np = p + v * TARCIE_MS * (1 - k);
  let nv = v * k;
  if (np <= 0) {
    np = 0;
    nv = 0;
  } else if (np >= max) {
    np = max;
    nv = 0;
  }
  if (Math.abs(nv) < STOP) nv = 0;
  return { p: np, v: nv };
}

/** Ile pikseli palca na jedną rozkładówkę: gruby słownik przelatuje szybciej. */
export function pikseliNaRozkladowke(rozkladowek: number): number {
  return Math.max(6, Math.min(40, Math.round(1200 / rozkladowek)));
}

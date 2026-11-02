/**
 * L8 „Moje wspólnoty” — kręgi, odznaki ról, sceny „gdyby mnie zabrakło”,
 * wartości na podium. Czysta logika (selftest `scripts/polski-l08-selftest.mjs`).
 *
 * Temat dotyka domu: **żadnych pytań o skład rodziny**, wszystkie role
 * opcjonalne, role zamiast imion. Etykiety ról w obu rodzajach albo
 * bezrodzajowe. Zdanie „co dajesz” opisuje rolę, nie ocenia dziecka. Podium
 * nie ma klucza: każda kolejność i każde przypisanie sceny są przyjmowane.
 */

export const KREGI = [
  { id: 'dom', label: 'dom' },
  { id: 'klasa', label: 'klasa' },
  { id: 'podworko', label: 'podwórko i kamienica' },
  { id: 'miejscowosc', label: 'miejscowość' },
  { id: 'kraj', label: 'kraj' },
] as const;

export type KragId = (typeof KREGI)[number]['id'];

/** Promień „ja” w środku planszy (ułamek promienia planszy). */
export const SRODEK = 0.14;

/** Zewnętrzny promień kręgu `i` (ułamek promienia planszy). */
export const promienKregu = (i: number) => SRODEK + ((1 - SRODEK) * (i + 1)) / KREGI.length;

/** Krąg z odległości od środka w promieniach planszy (0 = środek, 1 = krawędź). Najbliższy krąg to `dom`. */
export function kragZOdleglosci(r: number): KragId | null {
  if (!(r >= SRODEK) || r > 1) return null; // środek to „ja”, rogi kwadratu poza kręgami
  const i = Math.min(KREGI.length - 1, Math.floor(((r - SRODEK) / (1 - SRODEK)) * KREGI.length));
  return KREGI[i].id;
}

/** Krąg z punktu na planszy (x, y w 0…1 od lewego górnego rogu). */
export const kragZPunktu = (x: number, y: number) => kragZOdleglosci(Math.hypot(x - 0.5, y - 0.5) / 0.5);

/** Kto jeszcze stoi w scenie i jak wygląda bez dziecka. */
export interface Scena {
  /** Co widać, gdy jesteś w scenie. */
  z: string;
  /** Co się dzieje, gdy cię wyjmiesz. */
  bez: string;
  /** Co dajesz w tej roli — opis roli, nie ocena. */
  dajesz: string;
  /** Rekwizyt (nazwa ikony w komponencie): z tobą / bez ciebie. */
  rekwizyt: [string, string];
  /** Ile innych postaci stoi w scenie (0–3); bez ciebie przygasają. */
  inni: number;
}

export interface Odznaka {
  id: string;
  label: string;
  /** Ikona pinezki na planszy kręgów. */
  ikona: string;
  /** Gdzie zwykle się ją przypina (podpowiedź w danych, nigdy wymóg). */
  zwykle: KragId;
  scena: Scena;
}

export const ODZNAKI: Odznaka[] = [
  { id: 'starsze', label: 'starsze rodzeństwo', ikona: 'book-open', zwykle: 'dom', scena: { z: 'Czytasz młodszemu bajkę na dobranoc.', bez: 'Młodsze zasypia bez bajki.', dajesz: 'Dajesz czas i opowieść.', rekwizyt: ['book-open', 'book'], inni: 1 } },
  { id: 'mlodsze', label: 'młodsze rodzeństwo', ikona: 'laugh', zwykle: 'dom', scena: { z: 'Opowiadasz żart i wszyscy przy stole się śmieją.', bez: 'Przy stole jest cicho.', dajesz: 'Dajesz śmiech.', rekwizyt: ['laugh', 'meh'], inni: 2 } },
  { id: 'wnuk', label: 'wnuczka / wnuk', ikona: 'message-circle', zwykle: 'dom', scena: { z: 'Słuchasz, jak babcia albo dziadek opowiada o dawnych czasach.', bez: 'Opowieść czeka, bo nie ma komu jej opowiedzieć.', dajesz: 'Dajesz uwagę i słuchanie.', rekwizyt: ['message-circle', 'message-circle-off'], inni: 1 } },
  { id: 'zwierzak', label: 'opiekun / opiekunka zwierzaka', ikona: 'dog', zwykle: 'dom', scena: { z: 'Nalewasz psu świeżej wody.', bez: 'Miska stoi pusta.', dajesz: 'Dajesz opiekę.', rekwizyt: ['droplet', 'droplet-off'], inni: 0 } },
  { id: 'lawka', label: 'kolega / koleżanka z ławki', ikona: 'users', zwykle: 'klasa', scena: { z: 'Pożyczasz kredkę, kiedy komuś się złamała.', bez: 'Ktoś siedzi sam i nie ma czym rysować.', dajesz: 'Dajesz towarzystwo i pomoc.', rekwizyt: ['pencil', 'pencil-off'], inni: 1 } },
  { id: 'dyzurny', label: 'dyżurny / dyżurna', ikona: 'flower-2', zwykle: 'klasa', scena: { z: 'Podlewasz kwiatek na parapecie.', bez: 'Kwiatek więdnie.', dajesz: 'Dbasz o wspólne miejsce.', rekwizyt: ['flower-2', 'leaf'], inni: 0 } },
  { id: 'kapitan', label: 'kapitan drużyny', ikona: 'volleyball', zwykle: 'podworko', scena: { z: 'Zwołujesz wszystkich na mecz.', bez: 'Nikt nie zwołał meczu — każdy siedzi w domu.', dajesz: 'Zbierasz ludzi razem.', rekwizyt: ['volleyball', 'circle-off'], inni: 3 } },
  { id: 'sasiad', label: 'sąsiad / sąsiadka', ikona: 'door-open', zwykle: 'podworko', scena: { z: 'Mówisz „dzień dobry” i przytrzymujesz drzwi pani Halinie.', bez: 'Pani Halina sama mocuje się z ciężkimi drzwiami.', dajesz: 'Dajesz życzliwość.', rekwizyt: ['door-open', 'door-closed'], inni: 1 } },
  { id: 'zakupy', label: 'ktoś, kto pomaga z zakupami', ikona: 'shopping-bag', zwykle: 'podworko', scena: { z: 'Niesiesz jedną siatkę z zakupami.', bez: 'Dwie siatki są za ciężkie dla jednej osoby.', dajesz: 'Dajesz pomoc.', rekwizyt: ['shopping-bag', 'package-x'], inni: 1 } },
  { id: 'kibic', label: 'kibic', ikona: 'megaphone', zwykle: 'miejscowosc', scena: { z: 'Dopingujesz drużynę z trybun.', bez: 'Na trybunach cisza, drużyna gra bez dopingu.', dajesz: 'Dodajesz innym odwagi.', rekwizyt: ['megaphone', 'volume-x'], inni: 2 } },
  { id: 'czytelnik', label: 'czytelnik / czytelniczka', ikona: 'library', zwykle: 'miejscowosc', scena: { z: 'Wypożyczasz książkę z biblioteki.', bez: 'Książka stoi na półce i nikt jej nie otwiera.', dajesz: 'Dajesz książkom życie.', rekwizyt: ['book-open', 'book-x'], inni: 0 } },
  { id: 'obywatel', label: 'obywatel / obywatelka', ikona: 'music', zwykle: 'kraj', scena: { z: 'Śpiewasz hymn razem z całą szkołą na apelu.', bez: 'Jeden głos mniej — i słychać, że go brakuje.', dajesz: 'Dokładasz swój głos do wspólnego.', rekwizyt: ['music', 'volume-1'], inni: 3 } },
];

export const odznaka = (id: string) => ODZNAKI.find((o) => o.id === id);

export const WLASNA = 'wlasna';

export interface Przypiecie {
  /** Unikalny klucz przypięcia (ta sama odznaka może być w kilku kręgach). */
  key: string;
  /** Id z `ODZNAKI` albo `WLASNA`. */
  odznaka: string;
  /** Własna odznaka: tekst wpisany przez dziecko. */
  wlasna?: string;
  krag: KragId;
  /** Miejsce pinezki na planszy (0…1). */
  x: number;
  y: number;
}

/**
 * Nowe przypięcie albo `null`, gdy punkt nie leży w żadnym kręgu albo ta sama
 * odznaka już jest w tym kręgu (drugi raz w tym samym kręgu nic nie wnosi).
 */
export function przypnij(list: Przypiecie[], odz: string, x: number, y: number, wlasna?: string): Przypiecie | null {
  const krag = kragZPunktu(x, y);
  if (!krag) return null;
  if (odz !== WLASNA && !odznaka(odz)) return null;
  const tekst = odz === WLASNA ? (wlasna ?? '').trim() : undefined;
  if (odz === WLASNA && !wlasnaOk(tekst ?? '')) return null;
  if (list.some((p) => p.odznaka === odz && p.krag === krag && (p.wlasna ?? '') === (tekst ?? ''))) return null;
  const n = list.reduce((m, p) => Math.max(m, Number(p.key.split(':')[1]) || 0), 0) + 1;
  return { key: `${odz}:${n}`, odznaka: odz, krag, x: round3(x), y: round3(y), ...(tekst ? { wlasna: tekst } : {}) };
}

const round3 = (v: number) => Math.round(v * 1000) / 1000;

/** Ile różnych odznak przypięto (własna liczy się jako jedna). */
export const ileOdznak = (p: Przypiecie[]) => new Set(p.map((x) => (x.odznaka === WLASNA ? `${WLASNA}:${x.wlasna}` : x.odznaka))).size;

/** Blok 1 jest zrobiony od trzech różnych odznak. */
export const KREGI_MIN = 3;

/** Domyślne sceny, gdy dziecko przypięło mniej niż trzy role z palety. */
export const SCENY_DOMYSLNE = ['dyzurny', 'kapitan', 'sasiad'];

/** Trzy sceny do bloku 2: z odznak przypiętych przez dziecko (kolejność przypinania, bez powtórzeń), dopełnione domyślnymi. */
export function sceny(p: Przypiecie[]): { id: string; zDziecka: boolean }[] {
  const out: { id: string; zDziecka: boolean }[] = [];
  for (const x of p) {
    if (x.odznaka === WLASNA || !odznaka(x.odznaka) || out.some((o) => o.id === x.odznaka)) continue;
    out.push({ id: x.odznaka, zDziecka: true });
    if (out.length === 3) return out;
  }
  for (const d of SCENY_DOMYSLNE) {
    if (out.length === 3) break;
    if (!out.some((o) => o.id === d)) out.push({ id: d, zDziecka: false });
  }
  return out;
}

/** Własna odznaka: krótka, bez cyfr i znaków (rola, nie dane). */
export const wlasnaOk = (t: string) => /^[\p{L}][\p{L} /-]{1,23}$/u.test(t.trim());

// ── Blok 2: scena bez ciebie ────────────────────────────────────────────────

/** Stan jednej sceny: czy jesteś w środku, czy już raz z niej wyszedłeś. */
export interface StanSceny {
  wSrodku: boolean;
  widziane: boolean;
}

export const nowaScena = (): StanSceny => ({ wSrodku: true, widziane: false });

export const wyjmij = (): StanSceny => ({ wSrodku: false, widziane: true });
export const wloz = (s: StanSceny): StanSceny => ({ ...s, wSrodku: true });

/** Blok 2 jest zrobiony, gdy każdą scenę zobaczono bez ciebie i do każdej wróciłeś. */
export const scenyGotowe = (ids: string[], stan: Record<string, StanSceny>) =>
  ids.length > 0 && ids.every((id) => stan[id]?.widziane && stan[id]?.wSrodku);

// ── Blok 3: wartości na podium ──────────────────────────────────────────────

export const WARTOSCI = ['przyjaźń', 'uczciwość', 'odwaga', 'pomoc', 'wolność', 'rodzina', 'sprawiedliwość', 'ciekawość', 'spokój', 'szacunek'];

export interface MiejscePodium {
  wartosc: string | null;
  scena: string | null;
}

export const PUSTE_PODIUM: MiejscePodium[] = [
  { wartosc: null, scena: null },
  { wartosc: null, scena: null },
  { wartosc: null, scena: null },
];

export type Odrzut = 'najpierw-wartosc' | 'nie-ma-takiej';

/**
 * Postawienie żetonu na miejscu podium. Wartość już stojąca gdzie indziej
 * **przechodzi** na nowe miejsce (nie dubluje się); wartość na zajętym miejscu
 * zastępuje poprzednią (scena przy miejscu zostaje). Scena wymaga wartości na
 * tym miejscu; ta sama scena może stać przy kilku wartościach — jedna rola
 * pokazuje często kilka rzeczy naraz.
 */
export function postaw(
  podium: MiejscePodium[],
  miejsce: number,
  zeton: { wartosc: string } | { scena: string },
  sceny: string[]
): { podium: MiejscePodium[] } | { odrzut: Odrzut } {
  if (miejsce < 0 || miejsce >= podium.length) return { odrzut: 'nie-ma-takiej' };
  const next = podium.map((m) => ({ ...m }));
  if ('wartosc' in zeton) {
    if (!WARTOSCI.includes(zeton.wartosc)) return { odrzut: 'nie-ma-takiej' };
    for (const m of next) if (m.wartosc === zeton.wartosc) m.wartosc = null;
    next[miejsce].wartosc = zeton.wartosc;
    return { podium: next };
  }
  if (!sceny.includes(zeton.scena)) return { odrzut: 'nie-ma-takiej' };
  if (!next[miejsce].wartosc) return { odrzut: 'najpierw-wartosc' };
  next[miejsce].scena = zeton.scena;
  return { podium: next };
}

export const podiumGotowe = (p: MiejscePodium[]) => p.length === 3 && p.every((m) => m.wartosc && m.scena);

/** Kolejność wyświetlania stopni: drugi, pierwszy, trzeci (jak prawdziwe podium). */
export const KOLEJNOSC_STOPNI = [1, 0, 2];

/** Kartka do Teczki: kręgi i podium — tekst do druku książeczki. */
export function kartkaTeczki(przypiecia: Przypiecie[], podium: MiejscePodium[], zdanie = ''): string {
  const linie: string[] = ['Moje kręgi'];
  for (const k of KREGI) {
    const tu = przypiecia.filter((p) => p.krag === k.id).map((p) => p.wlasna ?? odznaka(p.odznaka)?.label ?? p.odznaka);
    if (tu.length) linie.push(`${k.label}: ${[...new Set(tu)].join(', ')}`);
  }
  linie.push('', 'Moje wartości');
  podium.forEach((m, i) => {
    if (!m.wartosc) return;
    const o = m.scena ? odznaka(m.scena) : undefined;
    linie.push(`${i + 1}. ${m.wartosc}${o ? ` — tu to widać: ${o.label}. ${o.scena.dajesz}` : ''}`);
  });
  if (zdanie.trim()) linie.push('', zdanie.trim());
  return linie.join('\n');
}

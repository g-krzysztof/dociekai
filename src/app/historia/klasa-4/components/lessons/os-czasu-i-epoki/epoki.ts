/**
 * L6 bloki 2–4 — czyste dane i sędziowie: karty na sznurku, granice epok,
 * belki długości epok i „Kiedy skończyło się średniowiecze?”. Bez Reacta.
 */

import { anchorAstro, formatDating, toAstro, type Dating } from '../../../lib/timeline/dating';

// ─── Blok 2a: karty w kolejności, potem w skali ───────────────────────────────

export interface EventCard {
  id: string;
  label: string;
  dating: Dating;
}

/**
 * Sześć kart z karty lekcji. Daty: piramidy jak pinezka rdzenia (ok. 2500 p.n.e.);
 * zamek w Będzinie — murowany za Kazimierza Wielkiego, XIV w. (Wikipedia, „Zamek
 * w Będzinie”); Kolumb 1492 i 1918 z bazy (`F-I.4-13`, `F-I.4-14`); dzieło
 * Kopernika 1543 (`F-I.4-25`); lot Gagarina 1961 (Wikipedia, „Wostok 1”).
 * Kolejność w tablicy = kolejność na tacy (pomieszana).
 */
export const EVENT_CARDS: EventCard[] = [
  { id: 'kopernik', label: 'Kopernik ogłasza, że Ziemia krąży wokół Słońca', dating: { kind: 'year', year: 1543 } },
  { id: 'piramidy', label: 'budowa piramid w Gizie', dating: { kind: 'year', year: -2500, approx: true } },
  { id: 'rakieta', label: 'pierwszy człowiek w kosmosie', dating: { kind: 'year', year: 1961 } },
  { id: 'zamek', label: 'król buduje zamek w Będzinie', dating: { kind: 'century', century: 14 } },
  { id: 'niepodleglosc', label: 'Polska odzyskuje niepodległość', dating: { kind: 'year', year: 1918 } },
  { id: 'kolumb', label: 'okręty Kolumba docierają do Ameryki', dating: { kind: 'year', year: 1492 } },
];

export const cardWhen = (card: EventCard) => formatDating(card.dating);

export type OrderVerdict =
  | { ok: true }
  | { ok: false; reason: 'niepelne'; missing: number }
  | { ok: false; reason: 'kolejnosc'; earlier: EventCard; later: EventCard; slot: number };

/**
 * Sędzia sznurka: `slots[i]` = id karty w i-tym miejscu od lewej (najdawniejsze).
 * Wskazuje **pierwszą parę sąsiadów** w złej kolejności i nazywa ich daty —
 * nic tu nie zależy od klucza autora, tylko od dat na kartach.
 */
export function judgeOrder(slots: (string | null)[], now: number): OrderVerdict {
  const missing = slots.filter((s) => !s).length;
  if (missing > 0) return { ok: false, reason: 'niepelne', missing };
  const cards = slots.map((id) => EVENT_CARDS.find((c) => c.id === id)!);
  for (let i = 0; i < cards.length - 1; i++) {
    const a = cards[i];
    const b = cards[i + 1];
    if (anchorAstro(a.dating, now) > anchorAstro(b.dating, now)) {
      return { ok: false, reason: 'kolejnosc', earlier: b, later: a, slot: i };
    }
  }
  return { ok: true };
}

export function orderMessage(verdict: OrderVerdict): string {
  if (verdict.ok) return 'Kolejność się zgadza — od najdawniejszego do najnowszego. To jest porządek chronologiczny.';
  if (verdict.reason === 'niepelne') return 'Najpierw rozłóż wszystkie karty na sznurku.';
  const { earlier, later } = verdict;
  return `„${later.label}” (${cardWhen(later)}) wisi przed „${earlier.label}” (${cardWhen(earlier)}) — a było później. Zamień je miejscami.`;
}

// ─── Blok 2b: granice epok ───────────────────────────────────────────────────

export interface Boundary {
  id: 'pismo' | 'upadek-rzymu' | 'kolumb' | 'niepodleglosc';
  /** Wydarzenie graniczne — tak, jak dziecko je widzi na uchwycie. */
  label: string;
  year: number;
  approx?: boolean;
  /** Epoka po lewej i po prawej granicy. */
  between: [string, string];
}

/** `F-I.4-10…15`: pismo (ok. 3400 p.n.e.), 476, 1492, 1918. Id = id pinezek rdzenia. */
export const BOUNDARIES: Boundary[] = [
  { id: 'pismo', label: 'wynalezienie pisma', year: -3400, approx: true, between: ['prehistoria', 'starożytność'] },
  { id: 'upadek-rzymu', label: 'upadek Rzymu', year: 476, between: ['starożytność', 'średniowiecze'] },
  { id: 'kolumb', label: 'Kolumb w Ameryce', year: 1492, between: ['średniowiecze', 'nowożytność'] },
  { id: 'niepodleglosc', label: 'koniec I wojny światowej', year: 1918, between: ['nowożytność', 'współczesność'] },
];

export const boundaryWhen = (b: Boundary) => formatDating({ kind: 'year', year: b.year, approx: b.approx });

/**
 * Tolerancja w latach — na telefonie piksel osi to ok. 16–18 lat, więc trafienie
 * co do roku palcem jest niemożliwe. Uchwyt pokazuje rok na żywo; po przyjęciu
 * przeskakuje dokładnie na datę.
 */
export const BOUNDARY_TOLERANCE_YEARS = 120;

export type BoundaryVerdict =
  | { ok: true }
  | { ok: false; direction: 'wczesniej' | 'pozniej'; offBy: number };

/** `astro` — rok astronomiczny, w którym dziecko puściło uchwyt. */
export function judgeBoundary(boundary: Boundary, astro: number): BoundaryVerdict {
  const target = toAstro(boundary.year);
  const diff = astro - target;
  if (Math.abs(diff) <= BOUNDARY_TOLERANCE_YEARS) return { ok: true };
  return { ok: false, direction: diff > 0 ? 'wczesniej' : 'pozniej', offBy: Math.abs(Math.round(diff)) };
}

/**
 * Rok, który uchwyt pokazuje na żywo, zaokrąglony do 10 lat (dziesiątki to
 * i tak granica tego, co palec potrafi). Format jak w podręczniku.
 */
export function liveYearLabel(astro: number): string {
  // Najpierw rok historyczny (astro 0 = 1 p.n.e.), dopiero potem zaokrąglenie.
  const year = astro <= 0.5 ? Math.round(astro) - 1 : Math.round(astro);
  const rounded = Math.max(10, Math.round(Math.abs(year) / 10) * 10);
  return year < 0 ? `ok. ${rounded} p.n.e.` : `ok. ${rounded}`;
}

/** Epoka karty po ustawieniu granic — do podpisu „piramidy → starożytność”. */
export function eraOf(astro: number): string {
  const edges = BOUNDARIES.map((b) => toAstro(b.year));
  const names = ['prehistoria', 'starożytność', 'średniowiecze', 'nowożytność', 'współczesność'];
  const index = edges.filter((edge) => astro >= edge).length;
  return names[index];
}

// ─── Blok 3: belki długości epok ─────────────────────────────────────────────

export interface EraLength {
  id: string;
  label: string;
  /** Prawdziwa długość w latach (współczesność — do bieżącego roku, i trwa dalej). */
  years: (now: number) => number;
  ongoing?: boolean;
}

/**
 * `F-I.4-12…15`: ok. 3900, 1016 i 426 lat; współczesność „od 1918 do dziś”.
 * Liczone z granic, a nie wpisane — 476 − (−3400) bez roku zero daje 3875,
 * podręcznik zaokrągla do „ok. 3900”.
 */
export const ERA_LENGTHS: EraLength[] = [
  { id: 'starozytnosc', label: 'starożytność', years: () => toAstro(476) - toAstro(-3400) },
  { id: 'sredniowiecze', label: 'średniowiecze', years: () => 1492 - 476 },
  { id: 'nowozytnosc', label: 'nowożytność', years: () => 1918 - 1492 },
  { id: 'wspolczesnosc', label: 'współczesność', years: (now) => now - 1918, ongoing: true },
];

/** Skala belek: 0–4500 lat (starożytność musi się zmieścić z zapasem). */
export const BEAM_MAX_YEARS = 4500;

/** Jak opisać „ok.” długość — starożytność zaokrąglona do setek, jak w podręczniku. */
export function eraLengthLabel(era: EraLength, now: number): string {
  const years = era.years(now);
  if (era.id === 'starozytnosc') return `ok. ${Math.round(years / 100) * 100} lat`;
  return era.ongoing ? `${years} lat i wciąż trwa` : `${years} lat`;
}

export interface BeamComparison {
  id: string;
  guess: number;
  actual: number;
  /** Ile razy szacunek był za duży (>1) albo za mały (<1). */
  ratio: number;
}

export function compareBeams(guesses: Record<string, number>, now: number): BeamComparison[] {
  return ERA_LENGTHS.map((era) => {
    const actual = era.years(now);
    const guess = Math.max(1, Math.round(guesses[era.id] ?? 0));
    return { id: era.id, guess, actual, ratio: guess / actual };
  });
}

/** Czy dziecko samo ułożyło belki od najdłuższej do najkrótszej (najczęstsze odkrycie lekcji). */
export function guessesShrink(guesses: Record<string, number>): boolean {
  const values = ERA_LENGTHS.map((era) => guesses[era.id] ?? 0);
  return values.every((v, i) => i === 0 || v < values[i - 1]);
}

/** Największa pomyłka — werdykt ją nazywa (nie ma złych szacunków, jest jedna rzecz do zobaczenia). */
export function biggestMiss(comparisons: BeamComparison[]): BeamComparison {
  return [...comparisons].sort(
    (a, b) => Math.abs(Math.log(b.ratio)) - Math.abs(Math.log(a.ratio))
  )[0];
}

// ─── Blok 4: kiedy skończyło się średniowiecze? ──────────────────────────────

export type ChangeKind = 'wiedza' | 'wladza' | 'swiat' | 'niebo';

export interface MedievalEnd {
  id: string;
  label: string;
  /** Rok na osi (druk — połowa XV w. ≈ 1450, `F-I.4-25`). */
  year: number;
  when: string;
  /** Co ta zmiana zmieniła — wypisane na karcie, więc dopasowanie powodu to czytanie, nie zgadywanie. */
  changed: ChangeKind;
  what: string;
}

/** Cztery kandydatury z `F-I.4-25`, własnymi słowami. */
export const MEDIEVAL_ENDS: MedievalEnd[] = [
  {
    id: 'druk',
    label: 'druk',
    year: 1450,
    when: 'poł. XV w.',
    changed: 'wiedza',
    what: 'Książki przestają być przepisywane ręcznie. Są tańsze, jest ich więcej — wiedza rozchodzi się szybciej.',
  },
  {
    id: 'konstantynopol',
    label: 'Konstantynopol',
    year: 1453,
    when: '1453',
    changed: 'wladza',
    what: 'Turcy zdobywają Konstantynopol. Upada ostatnie państwo, które przez tysiąc lat nazywało się cesarstwem rzymskim.',
  },
  {
    id: 'kolumb',
    label: 'Kolumb',
    year: 1492,
    when: '1492',
    changed: 'swiat',
    what: 'Europejczycy docierają do lądu, o którym nic nie wiedzieli. Świat okazuje się dużo większy.',
  },
  {
    id: 'kopernik',
    label: 'Kopernik',
    year: 1543,
    when: '1543',
    changed: 'niebo',
    what: 'Kopernik ogłasza, że to Ziemia krąży wokół Słońca. Ludzie zaczynają inaczej patrzeć na niebo i na naukę.',
  },
];

export const CHANGE_REASONS: Record<ChangeKind, string> = {
  wiedza: 'jak ludzie dzielą się wiedzą',
  wladza: 'kto rządzi i jakie państwa istnieją',
  swiat: 'jak duży jest znany świat',
  niebo: 'jak ludzie rozumieją przyrodę i niebo',
};

/** Kolejność powodów na ekranie — inna niż kandydatur, żeby nie dopasowywać po pozycji. */
export const REASON_ORDER: ChangeKind[] = ['swiat', 'wiedza', 'niebo', 'wladza'];

export type ReasonVerdict = { ok: true } | { ok: false; candidate: MedievalEnd; chosen: ChangeKind };

/**
 * Nie ma złej granicy — jest tylko obowiązek podania, dlaczego. Powód musi
 * pasować do tego, co **zmieniło** wybrane wydarzenie (napisane na jego karcie).
 */
export function judgeReason(candidateId: string, reason: ChangeKind): ReasonVerdict {
  const candidate = MEDIEVAL_ENDS.find((m) => m.id === candidateId)!;
  if (candidate.changed === reason) return { ok: true };
  return { ok: false, candidate, chosen: reason };
}

/** Długości średniowiecza i nowożytności przy granicy wybranej przez dziecko. */
export function erasWithEnd(year: number): { sredniowiecze: number; nowozytnosc: number } {
  return { sredniowiecze: year - 476, nowozytnosc: 1918 - year };
}

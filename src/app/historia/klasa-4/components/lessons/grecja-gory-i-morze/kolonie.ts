import { COLONIES, MED_COUNTRIES } from './geo-srodziemne';

/**
 * Czysta logika bloku 3 — **Grecy za morzem**. Państwo kolonii wyliczył skrypt
 * mapy (punkt w wielokącie granic Natural Earth), więc odpowiedź „tu było greckie
 * miasto” wynika z danych, nie z klucza autora.
 */

export const YEAR_FROM = -800;
export const YEAR_TO = -550;

export type Colony = (typeof COLONIES)[number];

export const COLONY_COUNTRIES: readonly string[] = [...new Set(COLONIES.map((c) => c.country))];

export function visibleAt(year: number) {
  return COLONIES.filter((c) => c.year <= year);
}

export function countryName(id: string) {
  return MED_COUNTRIES.find((c) => c.id === id)?.name ?? id;
}

/** Fenicjanie i Kartagina — rywale Greków na zachodzie i wschodzie morza. */
const PHOENICIAN = new Set(['LBN', 'SYR', 'ISR', 'PSX', 'TUN', 'MLT', 'MAR', 'DZA']);
const NOTES: Record<string, string> = {
  CYP: 'Na Cyprze Grecy mieszkali już wcześniej, obok Fenicjan — to nie była kolonia z tego okresu.',
  HRV: 'Greckie osady na wyspach Chorwacji (Issa na wyspie Vis) powstały później, w IV wieku p.n.e. — poza naszym suwakiem.',
  GEO: 'Grecy dotarli i tu, nad wschodni brzeg Morza Czarnego, ale na naszej mapie tych miast nie zaznaczyliśmy.',
  RUS: 'Greckie miasta były też po drugiej stronie Cieśniny Kerczeńskiej, ale na naszej mapie ich nie zaznaczyliśmy.',
  GRC: 'To sama Grecja — stąd wypływały statki z osadnikami.',
};

export type CountryVerdict =
  | { kind: 'kolonie'; colonies: Colony[] }
  | { kind: 'grecja'; why: string }
  | { kind: 'nie'; why: string };

export function judgeCountry(id: string): CountryVerdict {
  const cols = COLONIES.filter((c) => c.country === id);
  if (cols.length) return { kind: 'kolonie', colonies: cols };
  if (id === 'GRC') return { kind: 'grecja', why: NOTES.GRC };
  const name = countryName(id);
  if (NOTES[id]) return { kind: 'nie', why: `${name}: ${NOTES[id]}` };
  if (PHOENICIAN.has(id))
    return { kind: 'nie', why: `${name}: tu miasta i porty mieli Fenicjanie albo Kartagina — rywale Greków na morzu.` };
  return { kind: 'nie', why: `${name}: na naszej mapie nie ma tu greckiego miasta.` };
}

/** Skąd przypłynęli osadnicy — w dopełniaczu, do zdania „przybysze z…”. */
const FROM: Record<string, string> = {
  Chalkida: 'z Chalkidy',
  Korynt: 'z Koryntu',
  Achaja: 'z Achai',
  Sparta: 'ze Sparty',
  Megara: 'z Megary',
  Milet: 'z Miletu',
  Thera: 'z wyspy Thera',
  'Korkyra i Korynt': 'z Korkyry i Koryntu',
  'miasta jońskie': 'z miast Jonii',
  Fokaja: 'z Fokai',
  Massalia: 'z Massalii',
};

export function fromWhere(mother: string) {
  return FROM[mother] ?? `z: ${mother}`;
}

export function formatYear(y: number) {
  return `ok. ${Math.abs(y)} r. p.n.e.`;
}

// ── dolina przed wypłynięciem: każde pole wyżywi jedną rodzinę ──
export const FIELDS = 6;
export const FAMILIES = 9;
export type ValleyTarget = `pole-${number}` | 'gory' | 'statek';

export function judgeValley(
  fields: readonly (number | null)[],
  target: ValleyTarget
): { ok: true } | { ok: false; why: string } {
  if (target === 'gory') return { ok: false, why: 'Na skalistym zboczu zboże nie urośnie. Tu da się najwyżej paść kozy.' };
  if (target === 'statek')
    return fields.some((f) => f === null)
      ? { ok: false, why: 'W dolinie jest jeszcze wolne pole. Nikt nie płynie w nieznane, jeśli w domu ma ziemię.' }
      : { ok: true };
  const i = Number(target.slice(5));
  if (fields[i] !== null) return { ok: false, why: 'To pole już karmi jedną rodzinę — dwóch nie wyżywi.' };
  return { ok: true };
}

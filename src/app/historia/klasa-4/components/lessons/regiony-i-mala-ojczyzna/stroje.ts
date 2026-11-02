/**
 * Stroje ludowe L12 — schematyczne, rysowane kodem (karta: generator pomyli
 * wzory). Elementy z bazy F-II.2-19…21 (krakuska z pawim piórem, cucha,
 * ciupaga, łowickie pasy) i atlasów strojów: krakowskie spodnie w czerwono-białe
 * prążki i granatowa kamizelka, góralskie portki z parzenicami i kapelusz
 * z muszelkami, łowicki pasiak i czarna kamizelka z haftem. Rysunek pokazuje
 * po jednym rozpoznawalnym elemencie na część ciała — to nie jest wierna
 * rekonstrukcja, i lekcja mówi to dziecku.
 */

export type Slot = 'hat' | 'top' | 'bottom' | 'item';

export type PartId =
  | 'krakuska'
  | 'kapelusz-goralski'
  | 'kapelusz-lowicki'
  | 'kamizelka-krakowska'
  | 'cucha'
  | 'kamizelka-lowicka'
  | 'portki-prazki'
  | 'portki-parzenice'
  | 'portki-pasiak'
  | 'ciupaga';

export const PARTS: Record<PartId, { slot: Slot; name: string }> = {
  krakuska: { slot: 'hat', name: 'czerwona czapka z pawim piórem (krakuska)' },
  'kapelusz-goralski': { slot: 'hat', name: 'niski kapelusz z muszelkami' },
  'kapelusz-lowicki': { slot: 'hat', name: 'czarny wysoki kapelusz' },
  'kamizelka-krakowska': { slot: 'top', name: 'granatowa kamizelka z czerwonym obszyciem' },
  cucha: { slot: 'top', name: 'jasna wełniana cucha' },
  'kamizelka-lowicka': { slot: 'top', name: 'czarna kamizelka z kolorowym haftem' },
  'portki-prazki': { slot: 'bottom', name: 'spodnie w czerwono-białe prążki' },
  'portki-parzenice': { slot: 'bottom', name: 'białe portki z parzenicami' },
  'portki-pasiak': { slot: 'bottom', name: 'pomarańczowe spodnie w kolorowe pasy (pasiak)' },
  ciupaga: { slot: 'item', name: 'ciupaga — laska z toporkiem' },
};

export type CostumeId = 'krakowski' | 'lowicki' | 'podhalanski';

export interface Costume {
  id: CostumeId;
  name: string;
  /** Miasto, przy którym strój stoi na mapie. */
  town: string;
  lonlat: readonly [number, number];
  parts: PartId[];
}

export const COSTUMES: Costume[] = [
  { id: 'lowicki', name: 'strój łowicki', town: 'Łowicz', lonlat: [19.94, 52.11], parts: ['kapelusz-lowicki', 'kamizelka-lowicka', 'portki-pasiak'] },
  { id: 'krakowski', name: 'strój krakowski', town: 'Kraków', lonlat: [19.94, 50.06], parts: ['krakuska', 'kamizelka-krakowska', 'portki-prazki'] },
  { id: 'podhalanski', name: 'strój podhalański', town: 'Zakopane', lonlat: [19.95, 49.3], parts: ['kapelusz-goralski', 'cucha', 'portki-parzenice', 'ciupaga'] },
];

export interface Puzzle {
  id: string;
  parts: PartId[];
}

/** Trzy postacie, każda z jednym „przybyszem”. Który to — wynika z porównania, nie z klucza. */
export const PUZZLES: Puzzle[] = [
  { id: 'a', parts: ['krakuska', 'kamizelka-krakowska', 'portki-prazki', 'ciupaga'] },
  { id: 'b', parts: ['kapelusz-goralski', 'cucha', 'portki-pasiak', 'ciupaga'] },
  { id: 'c', parts: ['krakuska', 'kamizelka-lowicka', 'portki-pasiak'] },
];

export const costumeOf = (part: PartId): Costume => COSTUMES.find((c) => c.parts.includes(part))!;

/** Strój, do którego należy większość części postaci. */
export function homeOf(p: Puzzle): Costume {
  const score = (c: Costume) => p.parts.filter((x) => c.parts.includes(x)).length;
  return [...COSTUMES].sort((a, b) => score(b) - score(a))[0];
}

export function alienOf(p: Puzzle): PartId {
  const home = homeOf(p);
  return p.parts.find((x) => !home.parts.includes(x))!;
}

export type FindVerdict = { ok: true } | { ok: false; why: string };

/** Krok 1: dziecko stuka element, który według niego „przywędrował”. */
export function judgeFind(p: Puzzle, part: PartId): FindVerdict {
  const home = homeOf(p);
  if (!home.parts.includes(part)) return { ok: true };
  const others = p.parts.filter((x) => x !== part && home.parts.includes(x));
  return {
    ok: false,
    why: `${cap(PARTS[part].name)} pasuje do reszty: ${others.map((x) => PARTS[x].name).join(' i ')} — wszystko to nosi ${home.name} (${home.town}). Szukaj rzeczy, której na tym stroju nie ma.`,
  };
}

/** Krok 2: odsyła element do stroju na mapie. */
export function judgeSend(part: PartId, to: CostumeId): FindVerdict {
  const owner = costumeOf(part);
  if (owner.id === to) return { ok: true };
  const target = COSTUMES.find((c) => c.id === to)!;
  return {
    ok: false,
    why: `Na stroju z miejscowości ${target.town} nie ma: ${PARTS[part].name}. Porównaj tę samą część ciała na wszystkich trzech strojach.`,
  };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

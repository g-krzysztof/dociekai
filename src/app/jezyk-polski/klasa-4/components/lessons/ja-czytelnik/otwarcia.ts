import { bookById } from '../../../data/czytelnia';
import { buildKorpus } from '../../../lib/korpus';
import type { CzytelniaBook } from '../../../lib/czytelnia/types';
import type { Korpus, KorpusSource } from '../../../lib/korpus/types';
import { PLATES, openingUnits, openingWords, type PlateInfo, type PlateId } from './degustacja';

/**
 * Otwarcia do ślepej degustacji (L2, blok 1) — zbudowane z pierwszego odcinka
 * każdej książki Czytelni. Otwarcie jest **przedrostkiem** odcinka, więc po
 * ponownym zbudowaniu korpusu z tych samych akapitów zdania mają te same id
 * (`s0`, `s1`…).
 */

export interface Opening {
  id: PlateId;
  book: CzytelniaBook;
  korpus: Korpus;
  units: string[];
  words: number;
  info: PlateInfo;
}

function buildOpening(id: PlateId): Opening {
  const book = bookById(id);
  if (!book) throw new Error(`L2: brak książki „${id}” w Czytelni`);
  const ep = book.episodes[0];
  const full = buildKorpus(ep.source);
  const units = openingUnits(full);
  const set = new Set(units);
  const body = full.blocks
    .map((block) => block.filter((u) => set.has(u)).map((u) => full.unitById[u].text).join(' '))
    .filter(Boolean)
    .join('\n\n');
  const source: KorpusSource = { id: `${ep.source.id}-otwarcie`, layout: 'prose', body };
  const korpus = buildKorpus(source);
  return {
    id,
    book,
    korpus,
    units: korpus.units.map((u) => u.id),
    words: openingWords(korpus, korpus.units.map((u) => u.id)),
    info: { id, title: book.title, genre: book.genre, mood: book.mood },
  };
}

export const OPENINGS: Record<PlateId, Opening> = Object.fromEntries(PLATES.map((id) => [id, buildOpening(id)])) as Record<
  PlateId,
  Opening
>;

export const PLATE_INFO: Record<string, PlateInfo> = Object.fromEntries(PLATES.map((id) => [id, OPENINGS[id].info]));

/**
 * Blok 2 — maski. Ta sama kwestia z maską tragiczną albo komiczną zmienia
 * sens (sceny wymyślone, nasze). Potem dwa prawdziwe dramaty, streszczone
 * własnymi słowami w wersji dla dzieci:
 *  - „Antygona” Sofoklesa (ok. 442 p.n.e.) — tragedia,
 *  - „Ptaki” Arystofanesa (414 p.n.e.) — komedia.
 * Sędzią jest reguła podana dziecku: tragedia kończy się nieszczęściem
 * bohatera, który walczy z losem albo z władzą; komedia śmieszy, wyśmiewa
 * ludzi i kończy się dobrze (F-IV.4-03).
 */

export type Mask = 'tragiczna' | 'komiczna';

export const LINE = '„Wróciłem do domu po dziesięciu latach. Nic tu nie jest takie, jak było.”';

export const SCENES: Record<Mask, { story: string; chorus: string; audience: string }> = {
  tragiczna: {
    story: 'Bohater wraca z wojny. Dom stoi pusty, przyjaciele odeszli, a w mieście nikt go nie poznaje.',
    chorus: 'Chór wzdycha: „Biada! Kto pokona los?”',
    audience: 'Widownia milknie. Ktoś ociera łzy.',
  },
  komiczna: {
    story: 'Bohater wraca z targu. Koza zjadła mu sandały, a sąsiad przemalował drzwi na różowo.',
    chorus: 'Chór śpiewa: „Witaj, panie w różowym domu!”',
    audience: 'Widownia wybucha śmiechem.',
  },
};

export interface Play {
  id: string;
  title: string;
  author: string;
  year: string;
  plot: string;
  ending: string;
  answer: Mask;
}

export const PLAYS: Play[] = [
  {
    id: 'ptaki',
    title: 'Ptaki',
    author: 'Arystofanes',
    year: '414 p.n.e.',
    plot: 'Dwóch Ateńczyków ma dość kłótliwego miasta. Namawiają ptaki, żeby zbudowały miasto w chmurach i przestały przepuszczać do bogów dym z ofiar.',
    ending: 'Bogowie muszą się z ptakami dogadać, a bohater urządza wielkie wesele.',
    answer: 'komiczna',
  },
  {
    id: 'antygona',
    title: 'Antygona',
    author: 'Sofokles',
    year: 'ok. 442 p.n.e.',
    plot: 'Król Kreon zakazuje pochować brata Antygony. Antygona uważa, że prawo bogów jest ważniejsze od rozkazu króla, i nie ustępuje.',
    ending: 'Antygona zostaje ukarana, a nieszczęście spada na całą rodzinę króla.',
    answer: 'tragiczna',
  },
];

export type MaskVerdict = { ok: true } | { ok: false; message: string };

export function judgeMask(playId: string, mask: Mask): MaskVerdict {
  const play = PLAYS.find((p) => p.id === playId);
  if (!play) return { ok: false, message: 'Nie ma takiego dramatu.' };
  if (play.answer === mask) return { ok: true };
  return mask === 'komiczna'
    ? { ok: false, message: `Przeczytaj zakończenie: „${play.ending}” Czy to do śmiechu?` }
    : { ok: false, message: `Przeczytaj zakończenie: „${play.ending}” Czy ktoś tu przegrywa z losem?` };
}

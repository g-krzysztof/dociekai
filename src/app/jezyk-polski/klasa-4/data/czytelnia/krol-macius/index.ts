import type { CzytelniaBook } from '../../../lib/czytelnia/types';
import { ODC_1, ODC_1_WORDS } from './odc-1';
import { ODC_2, ODC_2_WORDS } from './odc-2';
import { ODC_3, ODC_3_WORDS } from './odc-3';
import { ODC_4, ODC_4_WORDS } from './odc-4';

/** C10 w rejestrze tekstów. Odcinki: `odc-N.ts`; nagrania lektora dochodzą jako `odc-N.odc_n.audio.ts`. */
export const KROL_MACIUS: CzytelniaBook = {
  id: 'krol-macius',
  registry: 'C10',
  title: 'Król Maciuś Pierwszy',
  author: 'Janusz Korczak',
  authorDied: 1942,
  genre: 'powieść',
  mood: 'poważny i ciekawy: dziecko i władza',
  blurb:
    'Kiedy umiera król, na tronie musi zasiąść jego syn — mały Maciuś. Ministrowie myślą, że będą rządzić za niego. Maciuś myśli inaczej.',
  whole: false,
  source: {
    label: 'Wolne Lektury',
    url: 'https://wolnelektury.pl/katalog/lektura/krol-macius-pierwszy/',
  },
  episodes: [
    { n: 1, title: 'Chory król', source: ODC_1, words: ODC_1_WORDS },
    { n: 2, title: 'Król na spacerze', source: ODC_2, words: ODC_2_WORDS },
    { n: 3, title: 'Wielka lalka', source: ODC_3, words: ODC_3_WORDS },
    { n: 4, title: 'List do Felka', source: ODC_4, words: ODC_4_WORDS },
  ],
};

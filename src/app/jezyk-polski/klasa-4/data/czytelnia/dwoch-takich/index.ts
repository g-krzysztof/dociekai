import type { CzytelniaBook } from '../../../lib/czytelnia/types';
import { ODC_1, ODC_1_WORDS } from './odc-1';
import { ODC_2, ODC_2_WORDS } from './odc-2';
import { ODC_3, ODC_3_WORDS } from './odc-3';
import { ODC_4, ODC_4_WORDS } from './odc-4';

/** C8 w rejestrze tekstów — rozdz. 1–2. Odcinki: `odc-N.ts`. */
export const DWOCH_TAKICH: CzytelniaBook = {
  id: 'dwoch-takich',
  registry: 'C8',
  title: 'O dwóch takich, co ukradli księżyc',
  author: 'Kornel Makuszyński',
  authorDied: 1953,
  genre: 'powieść fantastyczna',
  mood: 'zabawny i psotny',
  blurb:
    'Jacek i Placek są bliźniakami tak leniwymi i psotnymi, że całe miasteczko ma ich dość. A oni wpadają na pomysł, na który nie wpadłby nikt inny.',
  whole: false,
  source: {
    label: 'Wolne Lektury',
    url: 'https://wolnelektury.pl/katalog/lektura/makuszynski-o-dwoch-takich-co-ukradli-ksiezyc/',
  },
  episodes: [
    { n: 1, title: 'Miasteczko Zapiecek', source: ODC_1, words: ODC_1_WORDS },
    { n: 2, title: 'Bliźnięta', source: ODC_2, words: ODC_2_WORDS },
    { n: 3, title: 'Nakrapiane jaja', source: ODC_3, words: ODC_3_WORDS },
    { n: 4, title: 'Krzyk na cały świat', source: ODC_4, words: ODC_4_WORDS },
  ],
};

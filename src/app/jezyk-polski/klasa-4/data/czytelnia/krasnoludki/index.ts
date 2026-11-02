import type { CzytelniaBook } from '../../../lib/czytelnia/types';
import { ODC_1, ODC_1_WORDS } from './odc-1';
import { ODC_2, ODC_2_WORDS } from './odc-2';
import { ODC_3, ODC_3_WORDS } from './odc-3';
import { ODC_4, ODC_4_WORDS } from './odc-4';

/** C1 w rejestrze tekstów. Odcinki: `odc-N.ts`. */
export const KRASNOLUDKI: CzytelniaBook = {
  id: 'krasnoludki',
  registry: 'C1',
  title: 'O krasnoludkach i sierotce Marysi',
  author: 'Maria Konopnicka',
  authorDied: 1910,
  genre: 'baśń',
  mood: 'ciepły i zabawny, zimowy',
  blurb:
    'Zima była taka mroźna, że król krasnoludków przymarzł do tronu. Kiedy wreszcie przychodzi wiosna, krasnoludki ruszają w świat ludzi — i nic nie idzie tak, jak planowały.',
  whole: false,
  source: {
    label: 'Wolne Lektury',
    url: 'https://wolnelektury.pl/katalog/lektura/o-krasnoludkach-i-sierotce-marysi/',
  },
  episodes: [
    { n: 1, title: 'Przymarznięty król', source: ODC_1, words: ODC_1_WORDS },
    { n: 2, title: 'Wyprawa kronikarza', source: ODC_2, words: ODC_2_WORDS },
    { n: 3, title: 'Ognisko w polu', source: ODC_3, words: ODC_3_WORDS },
    { n: 4, title: 'Dawne czasy', source: ODC_4, words: ODC_4_WORDS },
  ],
};

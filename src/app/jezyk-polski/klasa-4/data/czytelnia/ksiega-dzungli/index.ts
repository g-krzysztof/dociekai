import type { CzytelniaBook } from '../../../lib/czytelnia/types';
import { ODC_1, ODC_1_WORDS } from './odc-1';
import { ODC_2, ODC_2_WORDS } from './odc-2';
import { ODC_3, ODC_3_WORDS } from './odc-3';
import { ODC_4, ODC_4_WORDS } from './odc-4';
import { ODC_5, ODC_5_WORDS } from './odc-5';

/** C7 w rejestrze tekstów. Odcinki: `odc-N.ts`; nagrania lektora dochodzą jako `odc-N.odc_n.audio.ts`. */
export const KSIEGA_DZUNGLI: CzytelniaBook = {
  id: 'ksiega-dzungli',
  registry: 'C7',
  title: 'Księga dżungli: Bracia małego Mauli',
  author: 'Rudyard Kipling',
  authorDied: 1936,
  translator: 'Franciszek Mirandola',
  translatorDied: 1930,
  genre: 'opowieść przygodowa',
  mood: 'napięcie, dżungla nocą',
  blurb:
    'Do wilczej jamy w indyjskiej dżungli wchodzi na czworakach małe ludzkie dziecko. Wilki muszą zdecydować, co z nim zrobić — a groźny tygrys już się o nie upomina.',
  whole: false,
  source: {
    label: 'Wolne Lektury',
    url: 'https://wolnelektury.pl/katalog/lektura/ksiega-dzungli/',
  },
  episodes: [
    { n: 1, title: 'Wilcza jama', source: ODC_1, words: ODC_1_WORDS },
    { n: 2, title: 'Skała Rady', source: ODC_2, words: ODC_2_WORDS },
    { n: 3, title: 'Lata w dżungli', source: ODC_3, words: ODC_3_WORDS },
    { n: 4, title: 'Szkarłatne kwiecie', source: ODC_4, words: ODC_4_WORDS },
    { n: 5, title: 'Ogień na Skale', source: ODC_5, words: ODC_5_WORDS },
  ],
};

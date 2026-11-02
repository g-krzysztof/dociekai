import type { CzytelniaBook } from '../../../lib/czytelnia/types';
import { ODC_1, ODC_1_WORDS } from './odc-1';
import { ODC_2, ODC_2_WORDS } from './odc-2';

/** C6 w rejestrze tekstów. Odcinki: `odc-N.ts`; nagrania lektora dochodzą jako `odc-N.odc_n.audio.ts`. */
export const ZLOTA_KACZKA: CzytelniaBook = {
  id: 'zlota-kaczka',
  registry: 'C6',
  title: 'Złota kaczka',
  author: 'Artur Oppman (Or-Ot)',
  authorDied: 1931,
  genre: 'legenda',
  mood: 'tajemniczy, baśniowy',
  blurb:
    'Szewczyk Lutek ma dość biedy. Słyszał, że w lochach pod zamkiem pływa zaczarowana kaczka, która strzeże skarbu. Czy odważy się tam zejść?',
  whole: true,
  source: {
    label: 'Wolne Lektury',
    url: 'https://wolnelektury.pl/katalog/lektura/legendy-warszawskie-zlota-kaczka/',
  },
  episodes: [
    { n: 1, title: 'Lochy pod zamkiem', source: ODC_1, words: ODC_1_WORDS },
    { n: 2, title: 'Sto dukatów', source: ODC_2, words: ODC_2_WORDS },
  ],
};

import type { CzytelniaBook } from '../../../lib/czytelnia/types';
import { ODC_1, ODC_1_WORDS } from './odc-1';
import { ODC_2, ODC_2_WORDS } from './odc-2';
import { ODC_3, ODC_3_WORDS } from './odc-3';
import { ODC_4, ODC_4_WORDS } from './odc-4';

/** C2 w rejestrze tekstów. Odcinki: `odc-N.ts`; nagrania lektora dochodzą jako `odc-N.odc_n.audio.ts`. */
export const BRZYDKIE_KACZATKO: CzytelniaBook = {
  id: 'brzydkie-kaczatko',
  registry: 'C2',
  title: 'Brzydkie kaczątko',
  author: 'Hans Christian Andersen',
  authorDied: 1875,
  translator: 'Cecylia Niewiadomska',
  translatorDied: 1925,
  genre: 'baśń',
  mood: 'zaczyna się smutno, kończy szczęśliwie',
  blurb:
    'Z największego jajka w gnieździe wykluwa się pisklę, które nie jest podobne do nikogo. Wszyscy mówią mu, że jest brzydkie — ale czy wszyscy mają rację?',
  whole: true,
  source: {
    label: 'Wolne Lektury',
    url: 'https://wolnelektury.pl/katalog/lektura/brzydkie-kaczatko/',
  },
  episodes: [
    { n: 1, title: 'Wielkie jajo', source: ODC_1, words: ODC_1_WORDS },
    { n: 2, title: 'Kacze podwórze', source: ODC_2, words: ODC_2_WORDS },
    { n: 3, title: 'Daleko od domu', source: ODC_3, words: ODC_3_WORDS },
    { n: 4, title: 'Łabędzie', source: ODC_4, words: ODC_4_WORDS },
  ],
};

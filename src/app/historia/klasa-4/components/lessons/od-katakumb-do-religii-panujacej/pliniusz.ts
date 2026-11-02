/**
 * Blok 3 — **List Pliniusza do Trajana**. Omówienie listu (Pliniusz Młodszy,
 * Listy X 96, i odpowiedź Trajana X 97, ok. 112 r.) własnymi słowami — bez
 * opisu kar. Paszport źródła (silnik `source-desk`) i akrostych ΙΧΘΥΣ.
 */

import type { PassportCard, PassportFieldDef } from '../../source-desk/passport';

export type PliniuszField = 'kto' | 'kiedy' | 'po-co';

/** Omówienie listu — zdania w kolejności listu. */
export const PLINIUSZ_LIST: readonly string[] = [
  'Cesarzu! Przyprowadzają do mnie ludzi oskarżonych o to, że są chrześcijanami. Nigdy nie byłem przy takim śledztwie, więc nie wiem, jak z nimi postępować.',
  'Oto czego się dowiedziałem. W ustalony dzień zbierają się przed świtem i śpiewają na zmianę pieśń do Chrystusa jak do boga.',
  'Obiecują sobie nawzajem, że nie będą kraść ani rabować, że nie będą oszukiwać i że oddadzą to, co ktoś im powierzył.',
  'Potem się rozchodzą, a później schodzą się znowu na wspólny, zwyczajny posiłek.',
  'Jest ich bardzo wielu — ludzie w każdym wieku, bogaci i biedni, kobiety i mężczyźni, w miastach i na wsi. Świątynie naszych bogów zaczęły pustoszeć.',
  'Pytam cię więc: czy mam karać za samo to, że ktoś nazywa się chrześcijaninem?',
];

export const TRAJAN_ODPOWIEDZ =
  'Cesarz Trajan odpisał: nie szukaj ich specjalnie i nie przyjmuj donosów bez podpisu. Karz tylko tych, których ktoś oskarżył i którzy odmówią złożenia ofiary rzymskim bogom.';

export const PLINIUSZ_FIELDS: PassportFieldDef<PliniuszField>[] = [
  { id: 'kto', question: 'Kto napisał?' },
  { id: 'kiedy', question: 'Kiedy?' },
  { id: 'po-co', question: 'Po co?' },
];

export const PLINIUSZ_BANK: PassportCard<PliniuszField>[] = [
  { id: 'namiestnik', text: 'Pliniusz Młodszy — rzymski namiestnik prowincji Bitynii. Sam nie był chrześcijaninem.', field: 'kto' },
  {
    id: 'chrzescijanin',
    text: 'Chrześcijanin, który opisuje swoją gminę.',
    field: null,
    whyNot: 'Autor pisze o chrześcijanach „oni” i pyta cesarza, czy ich karać. Patrzy na nich z zewnątrz.',
  },
  { id: 'r112', text: 'Ok. 112 roku n.e., za cesarza Trajana.', field: 'kiedy' },
  {
    id: 'r30',
    text: 'Ok. 30 roku n.e., gdy nauczał Jezus.',
    field: null,
    whyNot: 'List jest do cesarza Trajana, a Trajan rządził dopiero od 98 roku — ponad 60 lat później.',
  },
  { id: 'pyta', text: 'Pyta cesarza, jak postępować z oskarżonymi chrześcijanami.', field: 'po-co' },
  {
    id: 'namawia',
    text: 'Chce namówić Rzymian do nowej wiary.',
    field: null,
    whyNot: 'Pliniusz nikogo nie namawia — kończy list pytaniem, czy ma karać.',
  },
];

// ─── Akrostych ΙΧΘΥΣ ────────────────────────────────────────────────────────

export interface AcroLetter {
  letter: string;
  greek: string;
  /** Jak to czytać po polsku. */
  read: string;
  pl: string;
}

/** Ἰησοῦς Χριστὸς Θεοῦ Υἱὸς Σωτήρ — pierwsze litery dają ἰχθύς, „ryba”. */
export const ICHTHYS: readonly AcroLetter[] = [
  { letter: 'Ι', greek: 'Ἰησοῦς', read: 'Iesus', pl: 'Jezus' },
  { letter: 'Χ', greek: 'Χριστός', read: 'Christos', pl: 'Chrystus' },
  { letter: 'Θ', greek: 'Θεοῦ', read: 'Theu', pl: 'Boga' },
  { letter: 'Υ', greek: 'Υἱός', read: 'Hyjos', pl: 'Syn' },
  { letter: 'Σ', greek: 'Σωτήρ', read: 'Soter', pl: 'Zbawiciel' },
];

/** Próg pociągnięcia litery w dół (px), po którym rozwija się w słowo. */
export const PULL_PX = 36;

export function pulled(dy: number): boolean {
  return dy >= PULL_PX;
}

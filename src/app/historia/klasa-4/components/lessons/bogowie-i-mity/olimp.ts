/**
 * Blok 1 — rodzina z Olimpu (drugi konsument silnika `family-tree`).
 *
 * Bogowie nie mają lat urodzenia — piętro wynika z samego pokrewieństwa, które
 * każdy bóg wypowiada sam („Jestem synem…”, „Jestem żoną…”). Atrybuty (F-IV.1-06)
 * doklejają się dopiero, gdy miejsce boga potwierdzą relacje (`isSettled`).
 *
 * Genealogia według Hezjoda („Narodziny bogów”), w wersji dla dzieci:
 *  - Kronos i Rea — tytani, rodzice Zeusa, Posejdona, Hadesa i Demeter;
 *  - Hera — żona Zeusa (w micie także jego siostra; pomijamy, tropem jest małżeństwo);
 *  - Atena i Hermes — dzieci Zeusa; Persefona — córka Zeusa i Demeter
 *    (jej małżeństwo z Hadesem pomijamy: łamałoby regułę „małżonkowie na jednym piętrze”).
 */

import type { TreeToken } from '../../family-tree/family-tree';

export type AttributeId = 'piorun' | 'paw' | 'trojzab' | 'pies' | 'klos' | 'sowa' | 'laska' | 'kwiat' | 'sierp' | 'korona';

export interface God extends TreeToken {
  attribute: AttributeId;
  /** Podpis atrybutu po doklejeniu. */
  attributeLabel: string;
  /** Czym bóg się zajmuje — pokazywane razem z atrybutem. */
  domain: string;
}

/** Kolejność wymieszana celowo — nie podpowiada pokoleń. */
export const OLIMP: God[] = [
  {
    id: 'atena',
    name: 'Atena',
    parents: ['zeus'],
    trail: '„Wyskoczyłam z głowy mojego ojca, Zeusa — od razu w hełmie!”',
    attribute: 'sowa',
    attributeLabel: 'sowa',
    domain: 'mądrość i rzemiosło',
  },
  {
    id: 'kronos',
    name: 'Kronos',
    partner: 'rea',
    trail: '„Jestem tytanem i mężem Rei. Rządziłem światem, zanim zrobiły to moje dzieci.”',
    attribute: 'sierp',
    attributeLabel: 'sierp',
    domain: 'dawny władca świata',
  },
  {
    id: 'posejdon',
    name: 'Posejdon',
    parents: ['kronos', 'rea'],
    trail: '„Jestem synem Kronosa i Rei, bratem Zeusa. Władam morzem.”',
    attribute: 'trojzab',
    attributeLabel: 'trójząb',
    domain: 'morze i trzęsienia ziemi',
  },
  {
    id: 'hermes',
    name: 'Hermes',
    parents: ['zeus'],
    trail: '„Jestem synem Zeusa i jego posłańcem. Mam skrzydełka u sandałów.”',
    attribute: 'laska',
    attributeLabel: 'laska z wężami',
    domain: 'posłańcy, kupcy i podróżni',
  },
  {
    id: 'rea',
    name: 'Rea',
    trail: '„Jestem tytanką, żoną Kronosa. Ukryłam przed nim małego Zeusa.”',
    partner: 'kronos',
    attribute: 'korona',
    attributeLabel: 'korona z wież',
    domain: 'matka bogów',
  },
  {
    id: 'demeter',
    name: 'Demeter',
    parents: ['kronos', 'rea'],
    trail: '„Jestem córką Kronosa i Rei, siostrą Zeusa. Dzięki mnie rośnie zboże.”',
    attribute: 'klos',
    attributeLabel: 'kłos zboża',
    domain: 'urodzaj i rolnictwo',
  },
  {
    id: 'hera',
    name: 'Hera',
    partner: 'zeus',
    trail: '„Jestem żoną Zeusa i królową bogów.”',
    attribute: 'paw',
    attributeLabel: 'paw',
    domain: 'małżeństwo i rodzina',
  },
  {
    id: 'persefona',
    name: 'Persefona',
    parents: ['zeus', 'demeter'],
    trail: '„Moja mama to Demeter, a tata — Zeus.”',
    attribute: 'kwiat',
    attributeLabel: 'kwiat granatu',
    domain: 'wiosna',
  },
  {
    id: 'zeus',
    name: 'Zeus',
    parents: ['kronos', 'rea'],
    trail: '„Jestem synem Kronosa i Rei. Pokonałem ojca i zamieszkałem na Olimpie.”',
    attribute: 'piorun',
    attributeLabel: 'piorun',
    domain: 'niebo, burze i władza nad bogami',
  },
  {
    id: 'hades',
    name: 'Hades',
    parents: ['kronos', 'rea'],
    trail: '„Ja, brat Zeusa, rządzę krainą pod ziemią.”',
    attribute: 'pies',
    attributeLabel: 'pies Cerber',
    domain: 'podziemny świat zmarłych',
  },
];

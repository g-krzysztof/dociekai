/**
 * Blok 2 — Seneka o niewolnikach (F-V.2-02). Omówienie własnymi słowami
 * fragmentów „Listów moralnych do Lucyliusza”, list 47 (ok. 64 n.e.) —
 * nie przekład. Zdania do zakreślenia mają jednoznaczną treść: albo mówią,
 * czego niewolnikom przy uczcie nie wolno, albo co o nich myśli Seneka;
 * pozostałe są tłem.
 */

import type { PassportCard, PassportFieldDef } from '../../source-desk/passport';

export type Pen = 'nie-wolno' | 'seneka';

export interface Phrase {
  id: string;
  text: string;
  truth: Pen | null;
}

export const SENEKA: Phrase[] = [
  { id: 'gospodarz', text: 'Gospodarz leży przy stole i je więcej, niż zmieści jego brzuch.', truth: null },
  { id: 'stoja', text: 'Wokół stoją niewolnicy.', truth: null },
  { id: 'usta', text: 'Nie wolno im nawet poruszyć ustami, żeby coś szepnąć.', truth: 'nie-wolno' },
  { id: 'kaszel', text: 'Za kaszel, kichnięcie czy czkawkę dostaje się rózgą.', truth: 'nie-wolno' },
  { id: 'noc', text: 'Całą noc stoją przy stołach głodni i milczący.', truth: 'nie-wolno' },
  { id: 'prace', text: 'Jeden kroi mięso, drugi nalewa wino, trzeci pilnuje, który gość schlebia panu.', truth: null },
  { id: 'ludzie', text: '„To niewolnicy” — mówią ludzie. Nie: to ludzie.', truth: 'seneka' },
  { id: 'zasada', text: 'Traktuj niższego od siebie tak, jak chciałbyś, żeby wyższy traktował ciebie.', truth: 'seneka' },
];

export interface PenScore {
  ok: boolean;
  missed: Phrase[];
  wrong: Phrase[];
}

export function judgePens(marks: Record<string, Pen | undefined>): PenScore {
  const missed = SENEKA.filter((p) => p.truth && marks[p.id] !== p.truth && !marks[p.id]);
  const wrong = SENEKA.filter((p) => marks[p.id] && marks[p.id] !== p.truth);
  return { ok: missed.length === 0 && wrong.length === 0, missed, wrong };
}

export type SenekaField = 'kto' | 'kiedy' | 'po-co';

export const SENEKA_FIELDS: PassportFieldDef<SenekaField>[] = [
  { id: 'kto', question: 'Kto napisał?' },
  { id: 'kiedy', question: 'Kiedy?' },
  { id: 'po-co', question: 'Po co?' },
];

export const SENEKA_BANK: PassportCard<SenekaField>[] = [
  { id: 'filozof', text: 'Seneka — bogaty filozof, doradca cesarza Nerona. Sam miał niewolników.', field: 'kto' },
  {
    id: 'niewolnik',
    text: 'Niewolnik, który opisał swoje życie.',
    field: null,
    whyNot: 'Tekst pisze ktoś, kto siedzi przy stole i widzi niewolników z boku — nie ten, kto przy stole stoi.',
  },
  { id: 'rok64', text: 'Ok. 64 roku n.e. — sto lat po Cezarze.', field: 'kiedy' },
  {
    id: 'rok46',
    text: '46 rok p.n.e., dzień triumfu Cezara.',
    field: null,
    whyNot: 'Seneka urodził się kilka lat przed naszą erą — triumfu Cezara nie mógł widzieć.',
  },
  { id: 'list', text: 'List do przyjaciela, Lucyliusza: Seneka chce go przekonać, jak żyć mądrze i przyzwoicie.', field: 'po-co' },
];

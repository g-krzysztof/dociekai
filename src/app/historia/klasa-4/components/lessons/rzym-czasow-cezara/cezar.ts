/**
 * Blok 3 — Cezar: bohater czy tyran? (F-V.1-06). Trzy źródła streszczone
 * własnymi słowami:
 *  - Cezar, „O wojnie galijskiej” (ok. 50 p.n.e.) — pisze o sobie w trzeciej osobie;
 *  - Cyceron, „O powinnościach” (44 p.n.e., kilka miesięcy po zabójstwie) —
 *    obrońca republiki, przeciwnik Cezara, nazywa go człowiekiem, który chciał być królem;
 *  - Swetoniusz, „Boski Juliusz” (ok. 120 n.e.) — biograf, opisuje zalety i wady,
 *    i podaje, że wielu uważało zabójstwo za słuszne (rozdz. 76).
 *
 * Sędzia jest strukturalny: nie ocenia, czy Cezar był bohaterem, tylko czy dziecko
 * wzięło pod uwagę, kto pisze i po co. Odrzuca, gdy najbardziej ufa jednemu
 * z dwóch stronniczych źródeł (Cezar o sobie, wróg Cezara).
 */

export type SourceId = 'cezar' | 'cyceron' | 'swetoniusz';
export type Verdict = 'bohater' | 'tyran' | 'jedno-i-drugie';

export interface CezarSource {
  id: SourceId;
  author: string;
  title: string;
  when: string;
  who: string;
  why: string;
  says: string;
}

export const SOURCES: CezarSource[] = [
  {
    id: 'cezar',
    author: 'Juliusz Cezar',
    title: '„O wojnie galijskiej”',
    when: 'ok. 50 p.n.e., w czasie wojny',
    who: 'sam Cezar — pisze o sobie jak o kimś innym: „Cezar postanowił…”',
    why: 'Był daleko od Rzymu; chciał, żeby w mieście czytano o jego zwycięstwach',
    says: 'Cezar szybko zbiera wojsko, przewiduje ruchy wrogów, oszczędza pokonanych. Każde zwycięstwo to zasługa jego odwagi i rozwagi.',
  },
  {
    id: 'cyceron',
    author: 'Cyceron',
    title: '„O powinnościach”',
    when: '44 p.n.e., kilka miesięcy po śmierci Cezara',
    who: 'senator i obrońca republiki, przeciwnik Cezara',
    why: 'Chciał przekonać Rzymian, że zabójcy Cezara bronili wolności',
    says: 'Cezar pragnął zostać królem i dla władzy złamał wszystkie prawa. Kto chce rządzić sam, jest tyranem.',
  },
  {
    id: 'swetoniusz',
    author: 'Swetoniusz',
    title: '„Boski Juliusz”',
    when: 'ok. 120 n.e. — ponad 160 lat później',
    who: 'biograf, który zbierał opowieści i dokumenty o władcach',
    why: 'Chciał opisać całe życie Cezara — i zalety, i wady',
    says: 'Cezar był odważny i łaskawy dla wrogów, ale przyjmował zaszczyty jak król i sam obsadzał urzędy. Wielu uważało, że zabito go słusznie.',
  },
];

export type Trust = Record<SourceId, number>;

export type TrustVerdict = { ok: true } | { ok: false; message: string };

export function judgeTrust(t: Trust): TrustVerdict {
  const max = Math.max(t.cezar, t.cyceron, t.swetoniusz);
  if (t.cezar === max && t.cezar > t.swetoniusz) {
    return { ok: false, message: 'Najbardziej ufasz Cezarowi, który pisze o samym sobie. Czy ktoś napisałby o sobie coś złego — zwłaszcza gdy chce, żeby czytali go w Rzymie?' };
  }
  if (t.cyceron === max && t.cyceron > t.swetoniusz) {
    return { ok: false, message: 'Najbardziej ufasz Cyceronowi — a on był przeciwnikiem Cezara i pisał, żeby bronić jego zabójców. Czy wróg napisze o kimś sprawiedliwie?' };
  }
  return { ok: true };
}

export const VERDICT_TEXT: Record<Verdict, string> = {
  bohater: 'Zgodziłby się z tobą Cezar — ale on pisał o sobie. Pamiętaj, że jego zwycięstwa znamy głównie z jego własnej książki.',
  tyran: 'Zgodziłby się z tobą Cyceron — ale on był wrogiem Cezara i pisał zaraz po zabójstwie, w czasie wielkiego sporu.',
  'jedno-i-drugie': 'Tak widział go Swetoniusz, który pisał najpóźniej i zebrał głosy z obu stron. Historycy spierają się o Cezara do dziś.',
};

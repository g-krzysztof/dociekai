/**
 * Blok 3 — Dwie tablice. Dziecko dzieli przykazania Dekalogu (omówione prostym
 * językiem) między dwie tablice według ich treści: o Bogu albo o ludziach —
 * podział wynika z tekstu przykazania, a odrzut cytuje, o kim ono mówi.
 * Potem przykłada do przykazań przepisy dzisiejszego polskiego prawa: wszystkie
 * lądują na tablicy o ludziach — państwo pilnuje spraw między ludźmi, a wiara
 * zostaje sprawą sumienia (art. 53 Konstytucji RP).
 *
 * Kolejność i brzmienie: omówienie Wj 20,1–17 w układzie, którym posługuje się
 * katechizm w Polsce (3 + 7); tradycja żydowska dzieli dziesięć słów inaczej —
 * mówimy o tym w tekście bloku.
 */

export type TabletId = 'bog' | 'ludzie';

export interface Commandment {
  id: string;
  text: string;
  tablet: TabletId;
  /** O kim mówi przykazanie — do odrzutu. */
  about: string;
}

export const COMMANDMENTS: readonly Commandment[] = [
  { id: 'jeden', text: 'Nie miej innych bogów oprócz jednego Boga.', tablet: 'bog', about: 'o tym, kogo czcić — o Bogu' },
  { id: 'imie', text: 'Nie wymawiaj imienia Boga bez szacunku.', tablet: 'bog', about: 'o imieniu Boga' },
  { id: 'swieto', text: 'Pamiętaj, aby dzień święty był dniem dla Boga i odpoczynku.', tablet: 'bog', about: 'o dniu oddanym Bogu' },
  { id: 'rodzice', text: 'Szanuj ojca i matkę.', tablet: 'ludzie', about: 'o rodzicach' },
  { id: 'zabijaj', text: 'Nie zabijaj.', tablet: 'ludzie', about: 'o życiu drugiego człowieka' },
  { id: 'wiernosc', text: 'Bądź wierny w małżeństwie.', tablet: 'ludzie', about: 'o mężu i żonie' },
  { id: 'kradnij', text: 'Nie kradnij.', tablet: 'ludzie', about: 'o cudzej własności' },
  { id: 'klam', text: 'Nie mów nieprawdy o drugim człowieku.', tablet: 'ludzie', about: 'o tym, co mówimy o innych' },
  { id: 'cudza-zona', text: 'Nie pragnij odebrać nikomu męża ani żony.', tablet: 'ludzie', about: 'o cudzej rodzinie' },
  { id: 'zazdrosc', text: 'Nie pożądaj tego, co należy do innych.', tablet: 'ludzie', about: 'o tym, co mają inni' },
];

export type TabletVerdict = { ok: true } | { ok: false; message: string };

/** Podział według treści: czy przykazanie mówi o Bogu, czy o ludziach. */
export function judgeTablet(commandmentId: string, tablet: TabletId): TabletVerdict {
  const c = COMMANDMENTS.find((x) => x.id === commandmentId);
  if (!c) return { ok: false, message: 'Przeciągnij przykazanie na jedną z tablic.' };
  if (c.tablet === tablet) return { ok: true };
  return {
    ok: false,
    message:
      c.tablet === 'bog'
        ? `To przykazanie mówi ${c.about}. Pasuje na tablicę o Bogu.`
        : `W tym przykazaniu nie ma słowa o Bogu — mówi ${c.about}, czyli o sprawach między ludźmi.`,
  };
}

export interface LawCard {
  id: string;
  /** Skąd przepis. */
  source: string;
  /** Treść, omówiona prostymi słowami. */
  text: string;
  commandment: string;
  /** O czym jest przepis — do odrzutu. */
  topic: string;
}

/**
 * Przepisy dzisiejszego prawa (omówienie): Kodeks karny art. 148 § 1, 278 § 1, 233 § 1;
 * Kodeks rodzinny i opiekuńczy art. 87 („Rodzice i dzieci są obowiązani do wzajemnego
 * szacunku i wspierania się”).
 */
export const LAWS: readonly LawCard[] = [
  { id: 'kk148', source: 'Kodeks karny, art. 148', text: 'Kto zabija człowieka, idzie do więzienia.', commandment: 'zabijaj', topic: 'odebranie komuś życia' },
  { id: 'kk278', source: 'Kodeks karny, art. 278', text: 'Kto zabiera cudzą rzecz, żeby ją sobie przywłaszczyć, podlega karze.', commandment: 'kradnij', topic: 'zabranie cudzej rzeczy' },
  { id: 'kk233', source: 'Kodeks karny, art. 233', text: 'Kto przed sądem zeznaje nieprawdę, podlega karze.', commandment: 'klam', topic: 'mówienie nieprawdy przed sądem' },
  { id: 'kro87', source: 'Kodeks rodzinny i opiekuńczy, art. 87', text: 'Rodzice i dzieci mają się wzajemnie szanować i wspierać.', commandment: 'rodzice', topic: 'szacunek w rodzinie' },
];

export function judgeLaw(lawId: string, commandmentId: string): TabletVerdict {
  const law = LAWS.find((l) => l.id === lawId);
  const c = COMMANDMENTS.find((x) => x.id === commandmentId);
  if (!law || !c) return { ok: false, message: 'Przyłóż przepis do jednego z przykazań.' };
  if (law.commandment === c.id) return { ok: true };
  return { ok: false, message: `Ten przepis mówi o czymś innym: ${law.topic}. Przykazanie „${c.text}” mówi ${c.about}.` };
}

/** Na której tablicy wylądowały przepisy — dla zdania na końcu bloku. */
export function lawsPerTablet(): Record<TabletId, number> {
  const out: Record<TabletId, number> = { bog: 0, ludzie: 0 };
  for (const l of LAWS) {
    const c = COMMANDMENTS.find((x) => x.id === l.commandment);
    if (c) out[c.tablet] += 1;
  }
  return out;
}

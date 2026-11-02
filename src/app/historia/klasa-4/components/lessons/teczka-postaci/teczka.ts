/**
 * L31 — sędziowie teczki postaci (czyste funkcje, bez Reacta).
 *
 *  - `judgeKind` — zakreślacz: „do sprawdzenia” czy „czyjeś zdanie”;
 *  - `judgeOrder` — oś życia: kolejność wynika z lat, nie z klucza;
 *  - `judgeVerdict` — ocena z dowodami: werdykt **strukturalny**, nigdy
 *    „dobra/zła ocena” (fakt wśród dowodów, dwa różne źródła, rozważony
 *    kontrargument przeciwny ocenie, wybrana miara czasów).
 */

import { formatYear } from './rok';
import { findSentence, type Figure, type Kind, type LifeEvent } from './postacie';

export type Verdict = { ok: true } | { ok: false; message: string };

export function judgeKind(f: Figure, sentenceId: string, chosen: Kind): Verdict {
  const hit = findSentence(f, sentenceId);
  if (!hit) return { ok: false, message: 'Nie ma takiego zdania.' };
  const { sentence } = hit;
  if (sentence.kind === chosen) return { ok: true };
  if (sentence.kind === 'zdanie') {
    return {
      ok: false,
      message: `Tu autor ocenia — zdradza go „${sentence.cue}”. Innym razem ktoś mógłby ocenić to zupełnie inaczej.`,
    };
  }
  return {
    ok: false,
    message: 'To zdanie mówi, kto, co, kiedy albo gdzie zrobił — da się je sprawdzić w innych źródłach. Nie ma w nim oceny.',
  };
}

/** Pierwsza para sąsiadów w złej kolejności — albo null, gdy oś jest dobra. */
export function judgeOrder(order: readonly LifeEvent[]): { ok: true } | { ok: false; message: string; pair: [string, string] } {
  for (let i = 1; i < order.length; i++) {
    const a = order[i - 1];
    const b = order[i];
    if (a.year > b.year) {
      const bc = a.year < 0 && b.year < 0;
      return {
        ok: false,
        pair: [a.id, b.id],
        message:
          `„${b.text}” (${formatYear(b.year, b.approx)}) było wcześniej niż „${a.text}” (${formatYear(a.year, a.approx)}).` +
          (bc ? ' Przed naszą erą większa liczba znaczy dawniej — lata liczy się w stronę roku 1.' : ''),
      };
    }
  }
  return { ok: true };
}

/** Suwaki ocen: −2 (bardzo zaszkodził) … +2 (bardzo pomógł). */
export interface Rating {
  own: number;
  others: number;
}

export type Measure = 'tamte' | 'nasze' | null;

export interface Work {
  rating: Rating;
  evidence: readonly string[];
  counter: string | null;
  measure: Measure;
}

export interface Check {
  id: 'fakt' | 'dwa-zrodla' | 'kontra' | 'miara';
  ok: boolean;
  label: string;
  hint: string;
}

/** Kierunek oceny: znak sumy obu suwaków (0 = ani tak, ani tak). */
export function ratingSign(r: Rating): -1 | 0 | 1 {
  const sum = r.own + r.others;
  return sum > 0 ? 1 : sum < 0 ? -1 : 0;
}

export function judgeVerdict(f: Figure, work: Work): Check[] {
  const ev = work.evidence.map((id) => findSentence(f, id)).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const authors = new Set(ev.map((x) => x.card.id));
  const counter = work.counter ? findSentence(f, work.counter) : undefined;
  const sign = ratingSign(work.rating);
  const counterOk = Boolean(counter) && (sign === 0 ? counter!.sentence.lean !== 0 : counter!.sentence.lean === -sign);
  const end = f.she ? 'a' : '';
  const side = sign > 0 ? `że szkodził${end}` : sign < 0 ? `że pomagał${end}` : 'w którąkolwiek stronę';

  return [
    {
      id: 'fakt',
      ok: ev.some((x) => x.sentence.kind === 'fakt'),
      label: 'Wśród dowodów jest fakt, nie tylko czyjeś zdanie',
      hint: 'Czyjeś zdanie to jeszcze nie dowód. Dołóż zdanie, które da się sprawdzić — kto, co, kiedy.',
    },
    {
      id: 'dwa-zrodla',
      ok: authors.size >= 2,
      label: 'Dowody pochodzą z co najmniej dwóch różnych źródeł',
      hint: 'Jeden świadek może się mylić albo kłamać. Weź dowód od innego autora.',
    },
    {
      id: 'kontra',
      ok: counterOk,
      label: 'Rozważony kontrargument — zdanie przeciw Twojej ocenie',
      hint: counter
        ? `To zdanie nie mówi przeciw Twojej ocenie. Szukaj w teczce zdania, które mówi, ${side}.`
        : `Wybierz zdanie, które mówi przeciw Twojej ocenie — ${side}.`,
    },
    {
      id: 'miara',
      ok: work.measure !== null,
      label: 'Wiesz, czyją miarą oceniasz',
      hint: 'Zaznacz, czy oceniasz miarą tamtych czasów, czy naszych.',
    },
  ];
}

/**
 * L11 blok 4 — program szkolnych obchodów 11 listopada w 45 minutach.
 * Czyste dane i sędzia, bez Reacta.
 *
 * Kryteria są jawne i sprawdzane z cech klocków, nie z „dobrego programu”
 * autora: dziecko może ułożyć wiele różnych programów, które przejdą.
 */

export const BUDGET_MIN = 45;
/** Godzina rozpoczęcia — do zaproszenia (minuty od północy). */
export const START_MIN = 10 * 60;

export interface Punkt {
  id: string;
  label: string;
  minutes: number;
  /** Mówi wprost, co się stało w 1918 roku. */
  mowi1918?: boolean;
  /** Biorą w nim udział wszyscy, nie tylko występujący. */
  wszyscy?: boolean;
  /** Krótko: kto i co — do zaproszenia. */
  invite: string;
}

export const PUNKTY: Punkt[] = [
  { id: 'flaga', label: 'Wprowadzenie flagi przez poczet', minutes: 3, invite: 'poczet sztandarowy wprowadza flagę' },
  { id: 'hymn', label: 'Mazurek Dąbrowskiego — wszyscy śpiewają', minutes: 4, wszyscy: true, invite: 'wszyscy śpiewamy hymn' },
  { id: 'przemowienie', label: 'Przemówienie dyrektora', minutes: 6, invite: 'słowo dyrektora szkoły' },
  {
    id: 'opowiesc',
    label: 'Opowieść: jak Polska wróciła na mapę w 1918 r.',
    minutes: 8,
    mowi1918: true,
    invite: 'opowieść o listopadzie 1918 roku',
  },
  {
    id: 'scenka',
    label: 'Scenka: Warszawa, 11 listopada 1918',
    minutes: 12,
    mowi1918: true,
    invite: 'scenka klasy 6 o listopadzie 1918 roku',
  },
  { id: 'bieg', label: 'Bieg Niepodległości wokół boiska', minutes: 15, wszyscy: true, invite: 'Bieg Niepodległości — biegniemy wszyscy' },
  { id: 'piosenki', label: 'Wspólne śpiewanie pieśni legionowych', minutes: 7, wszyscy: true, invite: 'śpiewamy razem pieśni legionów' },
  { id: 'quiz', label: 'Quiz klas o niepodległości', minutes: 10, wszyscy: true, invite: 'quiz klas o niepodległości' },
  { id: 'gazetka', label: 'Gazetka: tydzień po tygodniu, jesień 1918', minutes: 5, mowi1918: true, invite: 'oglądamy gazetkę o jesieni 1918 roku' },
  { id: 'taniec', label: 'Pokaz tańca szkolnego zespołu', minutes: 8, invite: 'występ zespołu tanecznego' },
];

export const PUNKT_BY_ID: Record<string, Punkt> = Object.fromEntries(PUNKTY.map((p) => [p.id, p]));

export type CriterionId = 'symbole' | 'otwarcie' | 'rok1918' | 'wszyscy' | 'czas';

export interface ObchodyVerdict {
  ok: boolean;
  note: string;
}

export function totalMinutes(program: string[]) {
  return program.reduce((s, id) => s + (PUNKT_BY_ID[id]?.minutes ?? 0), 0);
}

/** Sędzia programu: pięć jawnych kryteriów, każde z konkretem w odrzucie. */
export function judgeObchody(program: string[]): Record<CriterionId, ObchodyVerdict> {
  const items = program.map((id) => PUNKT_BY_ID[id]).filter(Boolean);
  const has = (id: string) => program.includes(id);
  const total = totalMinutes(program);

  const symbole: ObchodyVerdict =
    has('flaga') && has('hymn')
      ? { ok: true, note: 'Jest flaga i jest hymn.' }
      : {
          ok: false,
          note: `Brakuje: ${[!has('flaga') && 'wprowadzenia flagi', !has('hymn') && 'hymnu'].filter(Boolean).join(' i ')}. Bez symboli to zwykły apel.`,
        };

  const firstTwo = program.slice(0, 2);
  const otwarcie: ObchodyVerdict =
    symbole.ok && firstTwo.includes('flaga') && firstTwo.includes('hymn')
      ? { ok: true, note: 'Uroczystość otwierają flaga i hymn.' }
      : {
          ok: false,
          note: symbole.ok
            ? `Program zaczyna się od: „${items[0]?.label}”. Uroczystość otwiera się flagą i hymnem — przesuń je na początek.`
            : 'Najpierw flaga i hymn — tak otwiera się każdą uroczystość.',
        };

  const o1918 = items.filter((p) => p.mowi1918);
  const rok1918: ObchodyVerdict = o1918.length
    ? { ok: true, note: `„${o1918[0].label}” mówi, co się stało w 1918 roku.` }
    : {
        ok: false,
        note: 'Żaden punkt nie mówi, co się stało w 1918 roku. Gość wyjdzie i nie będzie wiedział, co świętował.',
      };

  const all = items.filter((p) => p.wszyscy && p.id !== 'hymn');
  const wszyscy: ObchodyVerdict = all.length
    ? { ok: true, note: `W „${all[0].label}” biorą udział wszyscy.` }
    : {
        ok: false,
        note: 'Poza hymnem wszyscy tylko siedzą i patrzą. Dodaj punkt, w którym bierze udział cała szkoła.',
      };

  const czas: ObchodyVerdict =
    total <= BUDGET_MIN
      ? { ok: true, note: `${total} z ${BUDGET_MIN} minut.` }
      : { ok: false, note: `${total} minut — o ${total - BUDGET_MIN} za dużo. Lekcja trwa ${BUDGET_MIN} minut.` };

  return { symbole, otwarcie, rok1918, wszyscy, czas };
}

export function formatClock(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/** Godziny rozpoczęcia punktów — do zaproszenia. */
export function schedule(program: string[], start = START_MIN) {
  let t = start;
  return program.map((id) => {
    const p = PUNKT_BY_ID[id];
    const at = t;
    t += p?.minutes ?? 0;
    return { id, at: formatClock(at), punkt: p };
  });
}

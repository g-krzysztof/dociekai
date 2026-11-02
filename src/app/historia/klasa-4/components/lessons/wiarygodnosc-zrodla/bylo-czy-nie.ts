/**
 * Blok 3 — „Było czy nie było?” (dylemat) — dane i sędzia, bez Reacta.
 *
 * Dziecko ustawia suwak pewności i przypina pod nim dowody, które je
 * przekonały. **Sędzia nie ma jednej dobrej odpowiedzi** (errata bazy:
 * podręcznik pisze „nie doszło”, a to tylko jedno ze stanowisk). Sprawdza
 * strukturę, nie treść:
 *  - stanowisko jest wybrane;
 *  - co najmniej jeden przypięty dowód przemawia za nim (środek suwaka:
 *    po jednym z każdej strony);
 *  - żaden przypięty dowód nie przemawia przeciw niemu;
 *  - dziecko obejrzało co najmniej jeden dowód drugiej strony.
 *
 * Strona dowodu wynika z jego treści (Gall milczy → raczej nie było;
 * Kadłubek opisuje → raczej było) — każdy dowód ma też „ale…”, bo żaden
 * nie rozstrzyga sam. Fakty jak w `psie-pole.ts` (Wikipedia „Bitwa na Psim
 * Polu”, 2026-10-02: nazwa Campus Caninus / Hundsfeld; pogląd S. Trawkowskiego
 * o książęcej psiarni; brak wzmianek w innych kronikach z epoki, także
 * niemieckich; śladów bitwy nie odnaleziono).
 */

export type Side = 'za' | 'przeciw';

export interface Evidence {
  id: string;
  title: string;
  text: string;
  /** Słaby punkt dowodu — pokazywany po odwróceniu karty. */
  but: string;
  side: Side;
}

export const EVIDENCE: Evidence[] = [
  {
    id: 'kadlubek',
    title: 'Kronika Kadłubka',
    text: 'Opisuje wielką bitwę z zasadzką i psami na pobojowisku.',
    but: 'Pisał prawie sto lat później, na dworze syna zwycięzcy. A późniejsze kroniki tylko go powtarzają.',
    side: 'za',
  },
  {
    id: 'gall-milczy',
    title: 'Milczenie Galla',
    text: 'Gall, kronikarz samego Krzywoustego, pisał kilka lat po wojnie — i o wielkim zwycięstwie nie wspomina.',
    but: 'Gall nie musiał opisać wszystkiego. Milczenie to jeszcze nie dowód, że czegoś nie było.',
    side: 'przeciw',
  },
  {
    id: 'gall-wroclaw',
    title: 'Gall o Wrocławiu',
    text: 'Gall pisze, że cesarz pod Wrocławiem nic nie zyskał, tylko stracił ludzi. Jakieś walki tam więc były.',
    but: 'Stracić ludzi można w małych potyczkach albo przy oblężeniu — to nie musi być wielka bitwa w polu.',
    side: 'za',
  },
  {
    id: 'nazwa',
    title: 'Nazwa miejsca',
    text: 'Osada pod Wrocławiem od dawna nazywa się Psie Pole — po łacinie Campus Caninus, po niemiecku Hundsfeld.',
    but: 'Nazwa mogła pochodzić od pola, na którym książę trzymał swoje psy myśliwskie — tak uważał jeden z historyków.',
    side: 'za',
  },
  {
    id: 'inne-kroniki',
    title: 'Inne kroniki z epoki',
    text: 'Żadna inna kronika z tamtych lat — polska ani niemiecka — nie pisze o takiej bitwie. A niemieccy kronikarze opisywali też przegrane bitwy.',
    but: 'Nie wszystkie dawne kroniki przetrwały do naszych czasów.',
    side: 'przeciw',
  },
  {
    id: 'archeologia',
    title: 'Archeolodzy',
    text: 'Na Psim Polu nie znaleziono śladów wielkiej bitwy.',
    but: 'Dziś to dzielnica Wrocławia z domami i ulicami — ślady sprzed 900 lat mogły zniknąć albo leżeć pod budynkami.',
    side: 'przeciw',
  },
];

export function evidenceById(id: string): Evidence {
  const e = EVIDENCE.find((x) => x.id === id);
  if (!e) throw new Error(`Nie ma dowodu „${id}”`);
  return e;
}

/** Pięć pozycji suwaka: -2 „na pewno nie było” … +2 „na pewno było”. */
export type Stance = -2 | -1 | 0 | 1 | 2;

export const STANCE_LABEL: Record<Stance, string> = {
  [-2]: 'Na pewno nie było',
  [-1]: 'Raczej nie było',
  [0]: 'Nie da się rozstrzygnąć',
  [1]: 'Raczej było',
  [2]: 'Na pewno było',
};

export interface DilemmaInput {
  stance: Stance | null;
  pinned: string[];
  opened: string[];
}

export type DilemmaVerdict =
  | { ok: true; note?: string }
  | { ok: false; why: string; highlight?: string[] };

function sideOfStance(stance: Stance): Side | null {
  if (stance > 0) return 'za';
  if (stance < 0) return 'przeciw';
  return null;
}

const SIDE_WORD: Record<Side, string> = { za: 'za tym, że bitwa była', przeciw: 'za tym, że bitwy nie było' };

export function judgeDilemma({ stance, pinned, opened }: DilemmaInput): DilemmaVerdict {
  if (stance === null) return { ok: false, why: 'Najpierw ustaw suwak — co o tym myślisz?' };
  const pinnedEv = pinned.map(evidenceById);

  if (pinnedEv.length === 0) {
    return { ok: false, why: 'Przypnij pod suwakiem co najmniej jeden dowód, który cię przekonał.' };
  }

  const mine = sideOfStance(stance);
  if (mine === null) {
    const sides = new Set(pinnedEv.map((e) => e.side));
    if (sides.size < 2) {
      const has = [...sides][0];
      return {
        ok: false,
        why: `„Nie da się rozstrzygnąć” znaczy, że obie strony mają argumenty. Przypiąłeś/łaś tylko dowody ${SIDE_WORD[has]} — dołóż choć jeden z drugiej strony.`,
      };
    }
    return { ok: true };
  }

  const against = pinnedEv.filter((e) => e.side !== mine);
  if (against.length > 0) {
    const e = against[0];
    return {
      ok: false,
      why: `„${e.title}” przemawia raczej ${SIDE_WORD[e.side]} — a twój suwak stoi na „${STANCE_LABEL[stance]}”. Zdejmij tę kartę albo przesuń suwak.`,
      highlight: against.map((x) => x.id),
    };
  }

  const otherSide = EVIDENCE.filter((e) => e.side !== mine);
  const sawOther = otherSide.some((e) => opened.includes(e.id));
  if (!sawOther) {
    return {
      ok: false,
      why: 'Historyk zawsze sprawdza też drugą stronę. Odwróć choć jedną kartę, która przemawia przeciw twojemu zdaniu — potem zdecyduj jeszcze raz.',
      highlight: otherSide.map((e) => e.id),
    };
  }

  if (Math.abs(stance) === 2) {
    return {
      ok: true,
      note: 'Przyjęte — masz dowód i znasz drugą stronę. Ale zauważ: każda karta ma swoje „ale…”. Dlatego historycy rzadko mówią tu „na pewno”.',
    };
  }
  return { ok: true };
}

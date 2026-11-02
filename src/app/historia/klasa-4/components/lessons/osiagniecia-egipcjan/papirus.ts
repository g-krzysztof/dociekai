/**
 * L21 blok `lekarz` — kartka papirusu i papirus lekarza.
 *
 * Kartkę robiono z rdzenia łodygi papirusu: paski kładziono obok siebie,
 * na nie drugą warstwę w poprzek, przyciskano i suszono — sok kleił warstwy.
 * Źródło: Wikipedia — „Papirus (materiał piśmienny)”.
 */

export const STRIPS = 7;

export type Dir = 'v' | 'h';

export interface Strip {
  dir: Dir;
  idx: number;
}

export const stripKey = (s: Strip) => `${s.dir}${s.idx}`;

export type SheetVerdict =
  | { ok: true }
  | { ok: false; kind: 'pusto' | 'jedna-warstwa' | 'dziura'; text: string };

/** Kolumny/wiersze, których brakuje w danej warstwie (numeracja od 1). */
export function gaps(strips: Strip[], dir: Dir): number[] {
  const have = new Set(strips.filter((s) => s.dir === dir).map((s) => s.idx));
  return Array.from({ length: STRIPS }, (_, i) => i).filter((i) => !have.has(i)).map((i) => i + 1);
}

/** Sędzia kartki: dwie pełne warstwy na krzyż. */
export function judgeSheet(strips: Strip[]): SheetVerdict {
  if (strips.length === 0) return { ok: false, kind: 'pusto', text: 'Na kamieniu nie ma jeszcze ani jednego paska.' };
  const v = gaps(strips, 'v');
  const h = gaps(strips, 'h');
  const vEmpty = v.length === STRIPS;
  const hEmpty = h.length === STRIPS;
  if (vEmpty || hEmpty) {
    const along = vEmpty ? 'poziomo' : 'pionowo';
    const across = vEmpty ? 'pionowo' : 'poziomo';
    return {
      ok: false,
      kind: 'jedna-warstwa',
      text: `Wszystkie paski leżą ${along} — po wyschnięciu kartka rozejdzie się między nimi jak płot bez poprzeczek. Połóż drugą warstwę ${across}, w poprzek pierwszej.`,
    };
  }
  if (v.length) {
    return { ok: false, kind: 'dziura', text: `W warstwie pionowej brakuje paska nr ${v.join(', ')} — w kartce zostałaby szpara.` };
  }
  if (h.length) {
    return { ok: false, kind: 'dziura', text: `W warstwie poziomej brakuje paska nr ${h.join(', ')} — w kartce zostałaby szpara.` };
  }
  return { ok: true };
}

/** Ile milisekund trzeba trzymać kamień, żeby kartka się skleiła. */
export const PRESS_MS = 1400;

/* ─── Papirus lekarza ─── */

export type Mark = 'cialo' | 'slowa';

export interface Segment {
  id: string;
  text: string;
  /** Prawda wynikająca z reguły dziecka: działa przez ciało (co się robi, co się kładzie) czy przez słowa/amulet/bogów. */
  truth: Mark;
  /** Co wiemy dziś — pokazywane po przyjęciu. */
  today: string;
}

export interface Recipe {
  id: string;
  source: string;
  segments: Segment[];
}

/**
 * Omówienia własnymi słowami, uproszczone. Papirus Edwina Smitha (ok. 1600
 * p.n.e., odpis starszego tekstu): 48 przypadków ran i złamań, w tym nos
 * nastawiany i zatykany lnem, świeże mięso pierwszego dnia, potem miód i len.
 * Papirus Ebersa (ok. 1550 p.n.e.): ok. 700 przepisów i zaklęć, m.in.
 * zaklęcie przy podawaniu leku i prośba do Izydy.
 * Źródła: Wikipedia — „Papirus Edwina Smitha”, „Papirus Ebersa”.
 */
export const RECIPES: Recipe[] = [
  {
    id: 'nos',
    source: 'Papirus Edwina Smitha',
    segments: [
      {
        id: 'nos-1',
        text: 'Jeśli człowiek ma złamany nos, wyprostuj go palcami',
        truth: 'cialo',
        today: 'Lekarze nastawiają złamany nos do dziś.',
      },
      {
        id: 'nos-2',
        text: 'i włóż mu do nozdrzy dwa zwitki lnu, żeby nos trzymał kształt.',
        truth: 'cialo',
        today: 'Dziś wkłada się do nosa podobne opatrunki z gazy.',
      },
    ],
  },
  {
    id: 'rana',
    source: 'Papirus Edwina Smitha',
    segments: [
      {
        id: 'rana-1',
        text: 'Na świeżą ranę połóż miód i przewiąż ją lnianym bandażem.',
        truth: 'cialo',
        today: 'Miód hamuje bakterie — opatrunki z miodem są w aptekach do dziś.',
      },
    ],
  },
  {
    id: 'lek',
    source: 'Papirus Ebersa',
    segments: [
      {
        id: 'lek-1',
        text: 'Przygotuj lekarstwo z ziół, miodu i piwa.',
        truth: 'cialo',
        today: 'Część ziół Egipcjan naprawdę działa — inne nie. Ale to jest lek, nie zaklęcie.',
      },
      {
        id: 'lek-2',
        text: 'Podając je, wypowiedz zaklęcie: „Przybywaj, lekarstwo, przepędź zło z mego serca i ciała”.',
        truth: 'slowa',
        today: 'Słowa nie zmieniają leku — choć choremu mogły dodać otuchy.',
      },
    ],
  },
  {
    id: 'izyda',
    source: 'Papirus Ebersa',
    segments: [
      {
        id: 'izyda-1',
        text: 'Poproś boginię Izydę, żeby uwolniła chorego od wszystkiego, co złe.',
        truth: 'slowa',
        today: 'Modlitwa należy do wiary, nie do leczenia ciała.',
      },
    ],
  },
  {
    id: 'amulet',
    source: 'papirusy medyczne',
    segments: [
      {
        id: 'amulet-1',
        text: 'Choremu dziecku zawieś na szyi amulet — demon gorączki się go przestraszy.',
        truth: 'slowa',
        today: 'Gorączki nie wywołują demony, tylko zarazki — tego Egipcjanie nie wiedzieli.',
      },
    ],
  },
];

export const ALL_SEGMENTS = RECIPES.flatMap((r) => r.segments);

export type MarkVerdict =
  | { ok: true }
  | { ok: false; unmarked: string[]; wrong: string[]; text: string };

export function judgeMarks(marks: Record<string, Mark | undefined>): MarkVerdict {
  const unmarked = ALL_SEGMENTS.filter((s) => !marks[s.id]).map((s) => s.id);
  if (unmarked.length) {
    return {
      ok: false,
      unmarked,
      wrong: [],
      text:
        unmarked.length === 1
          ? 'Został jeden niezakreślony fragment.'
          : `${unmarked.length < 5 ? 'Zostały' : 'Zostało'} ${unmarked.length} ${unmarked.length < 5 ? 'niezakreślone fragmenty' : 'niezakreślonych fragmentów'}.`,
    };
  }
  const wrong = ALL_SEGMENTS.filter((s) => marks[s.id] !== s.truth);
  if (wrong.length) {
    const w = wrong[0];
    const text =
      w.truth === 'slowa'
        ? `„${w.text.slice(0, 40)}…” — tu nikt nie dotyka ciała i nic nie kładzie na ranę. Działać mają słowa, bóstwo albo amulet.`
        : `„${w.text.slice(0, 40)}…” — tu lekarz coś robi z ciałem albo coś na nie kładzie. Nie ma zaklęcia ani prośby do bogów.`;
    return { ok: false, unmarked: [], wrong: wrong.map((x) => x.id), text };
  }
  return { ok: true };
}

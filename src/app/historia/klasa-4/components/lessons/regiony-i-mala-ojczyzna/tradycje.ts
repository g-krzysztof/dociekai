/**
 * Zadanie L12 — trzy pytania do tradycji. Opisy własnymi słowami na podstawie
 * F-II.2-03, 05, 06; tur: ostatni osobnik padł w 1627 r. w Puszczy Jaktorowskiej
 * (Wikipedia, „Tur”). Rozróżnienie „skąd / dawniej / dziś” jest w samych
 * zdaniach (słowa „wziął się”, „dawniej”, „dziś”) — sędzia nie zgaduje intencji
 * autora, tylko sprawdza, czy pytanie stoi przy zdaniu, które na nie odpowiada.
 */

export type QuestionId = 'skad' | 'dawniej' | 'dzis';

export const QUESTIONS: { id: QuestionId; label: string; ask: string }[] = [
  { id: 'skad', label: 'Skąd?', ask: 'Skąd się wzięła?' },
  { id: 'dawniej', label: 'Dawniej?', ask: 'Co znaczyła dawniej?' },
  { id: 'dzis', label: 'Dziś?', ask: 'Co znaczy dziś?' },
];

export interface Sentence {
  id: string;
  text: string;
  /** Na które pytanie odpowiada — `null` to zdanie tylko opisujące. */
  answers: QuestionId | null;
}

export interface Tradition {
  id: string;
  name: string;
  where: string;
  sentences: Sentence[];
}

export const TRADITIONS: Tradition[] = [
  {
    id: 'barborka',
    name: 'Barbórka',
    where: 'Śląsk i inne okolice kopalń',
    sentences: [
      { id: 'b1', text: '4 grudnia górnicy obchodzą dzień świętej Barbary.', answers: null },
      {
        id: 'b4',
        text: 'Dziś rano orkiestra górnicza gra pobudkę na ulicach, są pochody w galowych mundurach i koncerty — nawet w miastach, w których kopalnie już zamknięto.',
        answers: 'dzis',
      },
      {
        id: 'b2',
        text: 'Zwyczaj wziął się stąd, że święta Barbara od wieków była patronką ludzi, którym grozi nagła śmierć — a praca pod ziemią była bardzo niebezpieczna.',
        answers: 'skad',
      },
      {
        id: 'b3',
        text: 'Dawniej był to przede wszystkim dzień modlitwy: górnicy prosili świętą, żeby każdy z nich wrócił z kopalni do domu.',
        answers: 'dawniej',
      },
    ],
  },
  {
    id: 'turon',
    name: 'Kolędnicy z turoniem',
    where: 'południe Polski',
    sentences: [
      {
        id: 't3',
        text: 'Dawniej wierzono, że gdy turoń zatańczy w chacie, nowy rok przyniesie gospodarzom urodzaj i zdrowe zwierzęta.',
        answers: 'dawniej',
      },
      {
        id: 't1',
        text: 'Między Bożym Narodzeniem a Trzema Królami po wsiach chodzą kolędnicy: z gwiazdą, ze Śmiercią z kosą i z kudłatym turoniem.',
        answers: null,
      },
      {
        id: 't2',
        text: 'Turoń wziął się od tura — wielkiego dzikiego byka z dawnych polskich puszcz. Ostatni tur padł w 1627 roku.',
        answers: 'skad',
      },
      {
        id: 't4',
        text: 'Dziś kolędnicy chodzą dla zabawy, zbierają pieniądze na dobry cel i występują w konkursach kolędniczych.',
        answers: 'dzis',
      },
    ],
  },
  {
    id: 'czarne-wesele',
    name: 'Czarne wesele',
    where: 'Kaszuby (Pomorze)',
    sentences: [
      {
        id: 'c2',
        text: 'Nazwa wzięła się od torfu: kto go kopał, był czarny od stóp do głów, a po wspólnej pracy była zabawa jak na weselu.',
        answers: 'skad',
      },
      {
        id: 'c4',
        text: 'Dziś torfem nikt już nie pali; czarne wesele pokazują zespoły ludowe na festynach, żeby pamiętać o dawnej pomocy sąsiedzkiej.',
        answers: 'dzis',
      },
      {
        id: 'c1',
        text: 'Na Kaszubach jest wiele torfowisk — pod mokrą łąką leży tam czarny torf.',
        answers: null,
      },
      {
        id: 'c3',
        text: 'Dawniej torf suszono i palono nim w piecach, a sąsiedzi kopali go razem, bo jednej rodzinie trudno było zdążyć przed zimą.',
        answers: 'dawniej',
      },
    ],
  },
];

/** placement[traditionId][questionId] = sentenceId */
export type Placement = Record<string, Partial<Record<QuestionId, string>>>;

const SAYS: Record<QuestionId, string> = {
  skad: 'od czego to się zaczęło',
  dawniej: 'co to znaczyło dawniej',
  dzis: 'jak jest dziś',
};

export function judgeTradition(t: Tradition, placed: Partial<Record<QuestionId, string>>): { ok: boolean; note: string } {
  const missing = QUESTIONS.filter((q) => !placed[q.id]);
  if (missing.length)
    return { ok: false, note: `Brakuje pytań: ${missing.map((q) => `„${q.label}”`).join(', ')}.` };
  for (const q of QUESTIONS) {
    const s = t.sentences.find((x) => x.id === placed[q.id])!;
    if (s.answers === q.id) continue;
    const short = s.text.length > 60 ? s.text.slice(0, 57).trimEnd() + '…' : s.text;
    return {
      ok: false,
      note: s.answers
        ? `„${q.label}” stoi przy zdaniu „${short}” — ono mówi, ${SAYS[s.answers]}. Szukaj zdania, które mówi, ${SAYS[q.id]}.`
        : `„${q.label}” stoi przy zdaniu „${short}” — ono tylko opisuje zwyczaj, nie odpowiada na pytanie.`,
    };
  }
  return { ok: true, note: 'Każde pytanie stoi przy zdaniu, które na nie odpowiada.' };
}

// ─── Karta badacza: moja tradycja ──────────────────────────────────────────

export type KindId = 'swieto' | 'potrawa' | 'zwyczaj' | 'stroj' | 'piosenka';

export const KINDS: { id: KindId; label: string; questions: [string, string, string] }[] = [
  {
    id: 'swieto',
    label: 'święto',
    questions: [
      'Od kiedy w naszej rodzinie albo okolicy obchodzi się to święto?',
      'Jak obchodzili je twoi dziadkowie, gdy byli dziećmi?',
      'Co w tym święcie jest dla ciebie dziś najważniejsze?',
    ],
  },
  {
    id: 'potrawa',
    label: 'potrawa',
    questions: [
      'Od kogo w rodzinie jest ten przepis i skąd go przywiózł?',
      'Kiedy jadło się ją dawniej — na co dzień czy od święta?',
      'Kiedy gotujemy ją dziś i dlaczego?',
    ],
  },
  {
    id: 'zwyczaj',
    label: 'zwyczaj',
    questions: [
      'Skąd wziął się ten zwyczaj — kto go zaczął albo przyniósł?',
      'Co miał znaczyć dawniej? Po co ludzie to robili?',
      'Czy robimy to dziś tak samo? Co się zmieniło?',
    ],
  },
  {
    id: 'stroj',
    label: 'strój',
    questions: [
      'Z jakiego regionu jest ten strój i kto w rodzinie go nosił?',
      'Na jakie okazje zakładało się go dawniej?',
      'Kiedy i kto nosi go dziś?',
    ],
  },
  {
    id: 'piosenka',
    label: 'piosenka',
    questions: [
      'Od kogo znasz tę piosenkę — kto ją śpiewał pierwszy w rodzinie?',
      'Przy jakiej okazji śpiewało się ją dawniej?',
      'Kiedy śpiewamy ją dziś?',
    ],
  },
];

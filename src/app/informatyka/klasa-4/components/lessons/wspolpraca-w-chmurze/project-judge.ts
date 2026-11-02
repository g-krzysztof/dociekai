import { TRIP_BANKS, TRIP_SECTIONS, isAssignmentComplete, type Assignment } from './collab';

/**
 * Werdykt zadania — czysty moduł, bez Reacta, tak jak `timer-judge.ts`.
 * Cztery kryteria, żadne nie ocenia SENSU wolnego tekstu (tylko jego
 * obecność) — dobór treści własnej sekcji jest sprawdzalny, bo dziecko
 * wybiera gotowe punkty z banku, a nie pisze zdania oceniane słownikiem.
 */

export interface ProjectState {
  assignment: Assignment;
  /** Id-ki punktów wybranych do WŁASNEJ sekcji (tej przydzielonej „ty”). */
  ownPicks: string[];
  /** Id-ki sekcji kolegów, które dziecko otworzyło/przejrzało. */
  viewed: string[];
  /** Treść komentarzy zostawionych w cudzych sekcjach, po id sekcji. */
  comments: Record<string, string>;
}

export const freshProjectState = (): ProjectState => ({
  assignment: {},
  ownPicks: [],
  viewed: [],
  comments: {},
});

export interface Criterion {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

const ownSectionId = (assignment: Assignment) =>
  TRIP_SECTIONS.find((section) => assignment[section.id] === 'ty')?.id ?? null;

const otherSectionIds = (assignment: Assignment, own: string | null) =>
  TRIP_SECTIONS.map((section) => section.id).filter((id) => id !== own);

export function judgeProject(state: ProjectState): Criterion[] {
  const complete = isAssignmentComplete(TRIP_SECTIONS, state.assignment);
  const own = ownSectionId(state.assignment);
  const others = otherSectionIds(state.assignment, own);

  const bank = own ? TRIP_BANKS[own] : [];
  const pickedChips = bank.filter((chip) => state.ownPicks.includes(chip.id));
  const offTopicPicked = pickedChips.filter((chip) => !chip.onTopic);
  const onTopicPicked = pickedChips.filter((chip) => chip.onTopic);

  const viewedBoth = others.length === 2 && others.every((id) => state.viewed.includes(id));

  const realComments = Object.entries(state.comments).filter(
    ([sectionId, text]) => sectionId !== own && text.trim().length >= 3
  );

  return [
    {
      id: 'podzial',
      label: 'Wszystkie trzy części mają dokładnie jednego, różnego właściciela.',
      ok: complete,
      detail: complete
        ? 'Program dnia, Co zabrać i Zasady bezpieczeństwa — każda część ma teraz swoją osobę.'
        : 'Przeciągnij imiona na wszystkie trzy części — nikt nie może zostać bez części, a dwie osoby nie mogą mieć tej samej.',
    },
    {
      id: 'wlasna',
      label: 'Twoja część ma co najmniej dwa trafne punkty i żadnego nie na temat.',
      ok: complete && onTopicPicked.length >= 2 && offTopicPicked.length === 0,
      detail: !complete
        ? 'Najpierw dokończ podział — bez tego nie wiadomo, która część jest Twoja.'
        : offTopicPicked.length > 0
          ? `„${offTopicPicked[0].text}” nie pasuje do tej części — odznacz to i wybierz coś na temat.`
          : onTopicPicked.length >= 2
            ? `Wybrałeś/aś: ${onTopicPicked.map((c) => c.text).join('; ')}.`
            : 'Wybierz jeszcze przynajmniej jeden trafny punkt do swojej części.',
    },
    {
      id: 'przejrzal',
      label: 'Zajrzałeś/aś do obu części kolegów, zanim skończyłeś/aś.',
      ok: viewedBoth,
      detail: viewedBoth
        ? 'Obie części kolegów zostały otwarte i przeczytane.'
        : 'Otwórz części, których nie robisz sam/sama — muszą się zgadzać ze sobą i z Twoją.',
    },
    {
      id: 'komentarz',
      label: 'Zostawiłeś/aś co najmniej jeden komentarz zamiast poprawiać cudzy tekst wprost.',
      ok: realComments.length > 0,
      detail:
        realComments.length > 0
          ? 'Komentarz zostawiony — dokładnie tak, jak w poprzednim bloku z Kubą.'
          : 'W jednej z części kolegów jest coś do poprawienia — zostaw komentarz, nie edytuj wprost.',
    },
  ];
}

/**
 * Wspólne dane lekcji 35 — jeden zespół (Ty, Kuba, Zosia) i jeden dokument
 * (plan wycieczki klasowej), które wracają w kilku blokach, tak jak `energy.ts`
 * w `technologia-i-srodowisko`. Blok 1 pokazuje, dlaczego mailowe załączniki
 * do tego dokumentu są bałaganem; blok 3 uczy mechaniki przydzielania części
 * na przykładzie innego, bezpiecznego projektu (prezentacja o zwierzętach);
 * blok 5 stosuje tę samą mechanikę NAPRAWDĘ, na planie wycieczki z bloku 1.
 */

export type MemberId = 'ty' | 'kuba' | 'zosia';

export interface Member {
  id: MemberId;
  name: string;
  blurb: string;
}

/** Zespół zadania (blok 5) — te same trzy osoby, którym poświęcona jest cała lekcja. */
export const TRIP_TEAM: Member[] = [
  { id: 'ty', name: 'Ty', blurb: 'Dokładnie pamiętasz godziny i miejsca.' },
  { id: 'kuba', name: 'Kuba', blurb: 'Zawsze wie, co warto zabrać ze sobą.' },
  { id: 'zosia', name: 'Zosia', blurb: 'Pilnuje zasad i bezpieczeństwa.' },
];

/** Zespół ćwiczenia (blok 3) — inny projekt, żeby blok 5 nie powtarzał tej samej układanki. */
export const ANIMALS_TEAM: Member[] = [
  { id: 'ty', name: 'Ty', blurb: 'Lubisz szukać ciekawostek i sprawdzać, czy to prawda.' },
  { id: 'kuba', name: 'Kuba', blurb: 'Świetnie pisze wstępy, ale czasem myli fakty.' },
  { id: 'zosia', name: 'Zosia', blurb: 'Zawsze pamięta o podsumowaniu i podaniu źródeł.' },
];

export const memberName = (team: Member[], id: MemberId) => team.find((m) => m.id === id)!.name;

/** Sekcja dokumentu do przydzielenia — wspólny kształt dla ćwiczenia i zadania. */
export interface AssignSection {
  id: string;
  title: string;
  /** Który członek zespołu pasuje najlepiej do wskazówek — tylko do miękkiej podpowiedzi. */
  bestFit: MemberId;
}

export const ANIMALS_PROJECT_TITLE = 'Prezentacja o zwierzętach';
export const ANIMALS_SECTIONS: AssignSection[] = [
  { id: 'wstep', title: 'Wstęp', bestFit: 'kuba' },
  { id: 'ciekawostki', title: 'Ciekawostki o zwierzętach', bestFit: 'ty' },
  { id: 'podsumowanie', title: 'Podsumowanie i źródła', bestFit: 'zosia' },
];

export const TRIP_PROJECT_TITLE = 'Plan wycieczki klasowej';
export const TRIP_SECTIONS: AssignSection[] = [
  { id: 'program', title: 'Program dnia', bestFit: 'ty' },
  { id: 'co-zabrac', title: 'Co zabrać', bestFit: 'kuba' },
  { id: 'zasady', title: 'Zasady bezpieczeństwa', bestFit: 'zosia' },
];

export type Assignment = Record<string, MemberId | null>;

export const emptyAssignment = (sections: AssignSection[]): Assignment =>
  Object.fromEntries(sections.map((section) => [section.id, null]));

/** Przydział jest kompletny, gdy każda sekcja ma innego właściciela. */
export function isAssignmentComplete(sections: AssignSection[], assignment: Assignment): boolean {
  const owners = sections.map((section) => assignment[section.id]);
  if (owners.some((owner) => owner === null)) return false;
  return new Set(owners).size === sections.length;
}

export interface Chip {
  id: string;
  text: string;
  onTopic: boolean;
}

/** Bank punktów do wyboru dla WŁASNEJ sekcji w zadaniu — część pasuje, część to zmyłka. */
export const TRIP_BANKS: Record<string, Chip[]> = {
  program: [
    { id: 'p1', text: 'Zbiórka o 8:00 przy głównym wejściu do szkoły', onTopic: true },
    { id: 'p2', text: 'Zwiedzanie muzeum od 10:00 do 12:00', onTopic: true },
    { id: 'p3', text: 'Powrót do szkoły około 15:00', onTopic: true },
    { id: 'p4', text: 'Ulubiony serial całej klasy', onTopic: false },
    { id: 'p5', text: 'Data urodzin pani wychowawczyni', onTopic: false },
  ],
  'co-zabrac': [
    { id: 'z1', text: 'Kanapki i coś do picia', onTopic: true },
    { id: 'z2', text: 'Wygodne buty do chodzenia', onTopic: true },
    { id: 'z3', text: 'Kurtka przeciwdeszczowa', onTopic: true },
    { id: 'z4', text: 'Konsola do gier', onTopic: false },
    { id: 'z5', text: 'Zapasowe klucze do samochodu taty', onTopic: false },
  ],
  zasady: [
    { id: 'b1', text: 'Trzymamy się razem z opiekunem', onTopic: true },
    { id: 'b2', text: 'Numer telefonu do wychowawczyni przy sobie', onTopic: true },
    { id: 'b3', text: 'Nie oddalamy się bez pytania', onTopic: true },
    { id: 'b4', text: 'Kto pierwszy, ten siada z przodu autobusu', onTopic: false },
    { id: 'b5', text: 'Można biegać po parkingu przy muzeum', onTopic: false },
  ],
};

/**
 * Gotowa treść, jaką ma już sekcja NIE przydzielona dziecku — ujawnia się dopiero
 * po przydzieleniu, jakby to był naprawdę szkic kolegi. Jedna sekcja niesie żartobliwy
 * błąd (`flaw`), do złapania wyłącznie komentarzem, nigdy poprawką wprost.
 */
export const TRIP_PREFILLED: Record<string, { items: string[]; flaw?: string }> = {
  program: {
    items: [
      'Zbiórka o 8:00 przy głównym wejściu do szkoły',
      'Zwiedzanie muzeum od 10:00 do 12:00',
      'Powrót do szkoły około 15:00',
    ],
  },
  'co-zabrac': {
    items: ['Kanapki i coś do picia', 'Wygodne buty do chodzenia', 'Deska do prasowania'],
    flaw: 'Deska do prasowania',
  },
  zasady: {
    items: [
      'Trzymamy się razem z opiekunem',
      'Numer telefonu do wychowawczyni przy sobie',
      'Nie oddalamy się bez pytania',
    ],
  },
};

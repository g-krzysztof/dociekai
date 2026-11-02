/**
 * Kształt danych serii. Zapisujemy **tylko surowe dni**; seria, rekord, suma,
 * zamrażarki i odznaki są wyprowadzane w locie przez `derive.ts` — dokładnie tak,
 * jak postęp modułów i kursu liczy się z listy lekcji (patrz
 * `docs/math-progress-backend.md`). Nic zagregowanego nie leży w magazynie, więc
 * nic nie może się rozjechać z prawdą.
 */

/** Klucz lekcji w serii: `<kurs>/<moduł>/<lekcja>`, np. `matematyka/ulamki-zwykle/dodawanie`. */
export type LessonKey = string;

export interface StreakRecord {
  /** Lokalna data `YYYY-MM-DD` → lekcje doprowadzone tego dnia do 100%. */
  days: Record<string, LessonKey[]>;
  /**
   * Lekcje ukończone, zanim seria w ogóle powstała — bez znanej daty. Wypełniane
   * jednorazowo przy pierwszym uruchomieniu, żeby uczeń z 40 lekcjami na koncie
   * nie zobaczył zablokowanej odznaki „Pierwszy krok”.
   */
  legacy: LessonKey[];
  /** Własne przerwy („moje ferie”) jako zakresy dat od–do włącznie. */
  breaks: Array<[string, string]>;
}

export type DayState =
  /** Tego dnia ukończono co najmniej jedną lekcję. */
  | 'done'
  /** Opuszczony dzień nauki uratowany zamrażarką. */
  | 'frozen'
  /** Opuszczony dzień nauki, który zerwał serię. */
  | 'missed'
  /** Weekend, ferie albo dzień wolny — pominięcie nic nie kosztuje. */
  | 'rest'
  /** Dziś, dzień nauki, jeszcze bez lekcji. Dzień trwa, więc seria stoi. */
  | 'pending'
  /** Poza zakresem: przed pierwszą lekcją albo jeszcze przed nami. */
  | 'blank';

export interface DayCell {
  date: string;
  state: DayState;
  lessons: LessonKey[];
}

export interface WeekColumn {
  /** Poniedziałek tego tygodnia. */
  start: string;
  /** Pn–Pt. Weekend nie zajmuje miejsca w kolumnie — patrz `weekendDone`. */
  days: DayCell[];
  /** Czy w sobotę lub niedzielę też była lekcja (nadprogramowo). */
  weekendDone: boolean;
  doneCount: number;
}

export interface StreakSnapshot {
  today: string;
  /** Bieżąca seria w dniach nauki. */
  streak: number;
  /** Najdłuższa seria w historii konta. */
  longest: number;
  longestEndedOn: string | null;
  /** Wszystkie dni z ukończoną lekcją. Ta liczba nigdy nie spada. */
  totalDays: number;
  /** Wszystkie ukończone lekcje (z dniami i zaszłością sprzed wdrożenia). */
  totalLessons: number;
  todayDone: boolean;
  /** Lekcje ukończone dzisiaj. */
  todayLessons: LessonKey[];
  freezesLeft: number;
  freezesTotal: number;
  /** Dni uratowane zamrażarką w bieżącym tygodniu. */
  frozenThisWeek: string[];
  /** Bieżący tydzień, Pn–Nd. */
  week: DayCell[];
  /** Rok szkolny w kolumnach tygodni — taśma roku w profilu. */
  tape: WeekColumn[];
  /** Seria N → data, w której osiągnięto ją po raz pierwszy. Źródło dat odznak. */
  milestones: Map<number, string>;
  /** Aktywne dni weekendowe. */
  weekendDays: number;
  /** Aktywne poniedziałki. */
  mondayDays: number;
  /** Dni z lekcją z obu przedmiotów naraz. */
  twoSubjectDays: number;
  /** Powroty po przerwie dłuższej niż tydzień. */
  returns: number;
}

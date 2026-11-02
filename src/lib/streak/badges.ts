/**
 * Katalog odznak i czysty ewaluator. Żadna odznaka nie jest zapisywana w
 * magazynie — wszystkie wynikają z dni i z postępu kursów, więc nie da się mieć
 * odznaki bez pokrycia w faktach ani stracić jej przy czyszczeniu cache'u.
 *
 * Dwie reguły redakcyjne, których trzymamy się w całym katalogu:
 *
 * - **Zablokowana odznaka pokazuje próg, nie zagadkę.** Dziecko ma widzieć, po
 *   co sięga; ukryty warunek nie motywuje, tylko frustruje.
 * - **Nagradzamy powrót, nie karzemy nieobecności.** Stąd `Powrót` i `Ochotnik`:
 *   pierwsza docenia najtrudniejszy dzień po przerwie, druga — pracę w czasie,
 *   którego seria wcale nie wymaga.
 */

import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  Cpu,
  Crown,
  Flag,
  Flame,
  Footprints,
  Gem,
  GraduationCap,
  Landmark,
  Layers,
  Library,
  Map as MapIcon,
  Medal,
  Mountain,
  RotateCcw,
  Shuffle,
  Sigma,
  Sprout,
  Sun,
  Sunrise,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { plural } from '@/lib/plural';
import type { StreakSnapshot } from './types';

export type BadgeFamily = 'rytm' | 'droga' | 'mapa' | 'charakter';

export interface BadgeDef {
  id: string;
  family: BadgeFamily;
  /** Liczba boków ramki stempla — rośnie z rangą odznaki w rodzinie. */
  tier: 4 | 5 | 6 | 8;
  name: string;
  /** Warunek zdobycia — widoczny także wtedy, gdy odznaka jest zamknięta. */
  requirement: string;
  /** Zdanie, które odznaka mówi po zdobyciu. */
  note: string;
  icon: LucideIcon;
}

export interface BadgeState extends BadgeDef {
  earned: boolean;
  /** Data zdobycia, jeśli da się ją odtworzyć z historii dni. */
  on: string | null;
  /** 0–1, do paska postępu przy zamkniętej odznace. */
  progress: number;
  /** Ile brakuje, zdaniem gotowym do wstawienia: „jeszcze 3 dni”. */
  left: string | null;
}

export const BADGE_FAMILIES: Array<{ id: BadgeFamily; label: string; lead: string }> = [
  { id: 'rytm', label: 'Rytm', lead: 'Za dni nauki jeden po drugim' },
  { id: 'droga', label: 'Droga', lead: 'Za ukończone lekcje' },
  { id: 'mapa', label: 'Mapa', lead: 'Za działy i całe kursy' },
  { id: 'charakter', label: 'Charakter', lead: 'Za to, jak się uczysz' },
];

const DAYS = { one: 'dzień', few: 'dni', many: 'dni' };
const LESSONS = { one: 'lekcja', few: 'lekcje', many: 'lekcji' };
const MODULES = { one: 'dział', few: 'działy', many: 'działów' };

/** Progi rytmu wraz z nazwami — kolejność tablicy to kolejność w gablocie. */
const RHYTHM: Array<{ days: number; name: string; note: string; tier: BadgeDef['tier']; icon: LucideIcon }> = [
  { days: 3, name: 'Rozbieg', note: 'Trzy dni z rzędu. Tak zaczyna się nawyk.', tier: 4, icon: Footprints },
  { days: 5, name: 'Pełny tydzień', note: 'Poniedziałek–piątek bez ani jednej przerwy.', tier: 4, icon: CalendarCheck },
  { days: 10, name: 'Dwa tygodnie', note: 'Rytm się utrzymał także wtedy, gdy przestał być nowy.', tier: 5, icon: CalendarRange },
  { days: 20, name: 'Miesiąc nauki', note: 'Cztery tygodnie nauki jeden po drugim.', tier: 5, icon: CalendarDays },
  { days: 40, name: 'Dwa miesiące', note: 'Dwa miesiące dni nauki bez zerwania.', tier: 6, icon: Flame },
  { days: 60, name: 'Kwartał', note: 'Trzy miesiące. To już nie przypadek.', tier: 6, icon: Mountain },
  { days: 100, name: 'Setka', note: 'Sto dni nauki z rzędu.', tier: 8, icon: Medal },
  { days: 180, name: 'Cały rok szkolny', note: 'Tyle dni nauki ma rok szkolny. Masz je wszystkie.', tier: 8, icon: Crown },
];

const JOURNEY: Array<{ lessons: number; name: string; note: string; tier: BadgeDef['tier']; icon: LucideIcon }> = [
  { lessons: 1, name: 'Pierwszy krok', note: 'Pierwsza lekcja doprowadzona do końca.', tier: 4, icon: Sprout },
  { lessons: 10, name: 'Dziesięć lekcji', note: 'Dziesięć tematów zamkniętych na sto procent.', tier: 4, icon: BookOpen },
  { lessons: 25, name: 'Ćwierć setki', note: 'Dwadzieścia pięć lekcji za Tobą.', tier: 5, icon: Library },
  { lessons: 50, name: 'Pięćdziesiąt', note: 'Połowa setki. Kawał roku.', tier: 6, icon: GraduationCap },
  { lessons: 100, name: 'Sto lekcji', note: 'Sto ukończonych lekcji, licząc wszystkie przedmioty.', tier: 8, icon: Trophy },
];

export const BADGES: BadgeDef[] = [
  ...RHYTHM.map(({ days, name, note, tier, icon }) => ({
    id: `rytm-${days}`,
    family: 'rytm' as const,
    tier,
    name,
    requirement: `${days} ${plural(days, DAYS)} nauki z rzędu`,
    note,
    icon,
  })),
  ...JOURNEY.map(({ lessons, name, note, tier, icon }) => ({
    id: `droga-${lessons}`,
    family: 'droga' as const,
    tier,
    name,
    requirement: `${lessons} ${plural(lessons, LESSONS)} ukończone w całości`,
    note,
    icon,
  })),
  {
    id: 'mapa-dzial-1',
    family: 'mapa',
    tier: 4,
    name: 'Pierwszy dział',
    requirement: '1 dział ukończony w całości',
    note: 'Cały dział od pierwszej lekcji do podsumowania.',
    icon: Flag,
  },
  {
    id: 'mapa-dzial-5',
    family: 'mapa',
    tier: 5,
    name: 'Pięć działów',
    requirement: `5 ${plural(5, MODULES)} ukończonych w całości`,
    note: 'Pięć działów zamkniętych. Mapa roku się zapełnia.',
    icon: MapIcon,
  },
  {
    id: 'mapa-matematyka',
    family: 'mapa',
    tier: 8,
    name: 'Kurs matematyki',
    requirement: 'Wszystkie lekcje matematyki klasy 4',
    note: 'Cały rok matematyki, dział po dziale.',
    icon: Sigma,
  },
  {
    id: 'mapa-informatyka',
    family: 'mapa',
    tier: 8,
    name: 'Kurs informatyki',
    requirement: 'Wszystkie lekcje informatyki klasy 4',
    note: 'Cały rok informatyki, dział po dziale.',
    icon: Cpu,
  },
  {
    id: 'mapa-historia',
    family: 'mapa',
    tier: 8,
    name: 'Kurs historii',
    requirement: 'Wszystkie lekcje historii klasy 4',
    note: 'Cały rok historii, od osi czasu po ostatni dział.',
    icon: Landmark,
  },
  {
    id: 'mapa-oba',
    family: 'mapa',
    tier: 8,
    name: 'Dwa kursy',
    requirement: 'Matematyka i informatyka ukończone w całości',
    note: 'Matematyka i informatyka. Komplet.',
    icon: Layers,
  },
  {
    id: 'mapa-trzy',
    family: 'mapa',
    tier: 8,
    name: 'Trzy kursy',
    requirement: 'Matematyka, informatyka i historia ukończone w całości',
    note: 'Trzy przedmioty, trzy pełne lata nauki. Cała mapa.',
    icon: Gem,
  },
  {
    id: 'charakter-ochotnik',
    family: 'charakter',
    tier: 4,
    name: 'Ochotnik',
    requirement: 'Lekcja w sobotę albo niedzielę',
    note: 'Weekend to Twój wolny czas — a jednak.',
    icon: Sun,
  },
  {
    id: 'charakter-poniedzialek',
    family: 'charakter',
    tier: 5,
    name: 'Dobry początek',
    requirement: '3 poniedziałki z lekcją',
    note: 'Tydzień zaczęty od razu, bez rozkręcania się do środy.',
    icon: Sunrise,
  },
  {
    id: 'charakter-dwa-fronty',
    family: 'charakter',
    tier: 5,
    name: 'Dwa fronty',
    requirement: 'Lekcje z dwóch różnych przedmiotów tego samego dnia',
    note: 'Dwa przedmioty w jeden dzień.',
    icon: Shuffle,
  },
  {
    id: 'charakter-powrot',
    family: 'charakter',
    tier: 6,
    name: 'Powrót',
    requirement: 'Powrót do nauki po przerwie dłuższej niż tydzień',
    note: 'Najtrudniejszy jest pierwszy dzień po przerwie. Ten masz za sobą.',
    icon: RotateCcw,
  },
];

/** Postęp kursów, którego seria sama nie zna — podaje go strona, która ma dane obu kursów. */
export interface JourneyInput {
  doneModules: number;
  mathDone: boolean;
  infoDone: boolean;
  /** Ukończone lekcje historii i wszystkie lekcje programu — także te jeszcze nieopublikowane. */
  histLessonsDone: number;
  histLessonsTotal: number;
}

export const EMPTY_JOURNEY: JourneyInput = {
  doneModules: 0,
  mathDone: false,
  infoDone: false,
  histLessonsDone: 0,
  histLessonsTotal: 0,
};

/**
 * Historia mierzy się do całego programu, nie do opublikowanych dziś lekcji:
 * kurs dopiero rośnie, a odznaka liczona z samych faktów zniknęłaby przy
 * publikacji następnej lekcji. Matematyka i informatyka są kompletne, więc tam
 * „opublikowane” i „cały program” to jedno.
 */
const histDone = (journey: JourneyInput): boolean =>
  journey.histLessonsTotal > 0 && journey.histLessonsDone >= journey.histLessonsTotal;

function measure(value: number, target: number): Pick<BadgeState, 'earned' | 'progress'> {
  return { earned: value >= target, progress: target > 0 ? Math.min(1, value / target) : 0 };
}

function remaining(value: number, target: number, forms: typeof DAYS): string | null {
  const left = target - value;
  return left > 0 ? `jeszcze ${left} ${plural(left, forms)}` : null;
}

/**
 * Stan wszystkich odznak. Daty zdobycia biorą się z `snapshot.milestones` —
 * dla odznak rytmu znamy dzień co do jednego, dla pozostałych zostaje `null`
 * (nie zmyślamy daty, której nie da się odtworzyć).
 */
export function evaluateBadges(
  snapshot: StreakSnapshot,
  journey: JourneyInput = EMPTY_JOURNEY
): BadgeState[] {
  return BADGES.map((badge): BadgeState => {
    const base = { ...badge, on: null as string | null, left: null as string | null };

    if (badge.family === 'rytm') {
      const target = Number(badge.id.slice('rytm-'.length));
      return {
        ...base,
        ...measure(snapshot.longest, target),
        on: snapshot.milestones.get(target) ?? null,
        left: remaining(snapshot.streak, target, DAYS),
      };
    }

    if (badge.family === 'droga') {
      const target = Number(badge.id.slice('droga-'.length));
      return {
        ...base,
        ...measure(snapshot.totalLessons, target),
        left: remaining(snapshot.totalLessons, target, LESSONS),
      };
    }

    switch (badge.id) {
      case 'mapa-dzial-1':
        return { ...base, ...measure(journey.doneModules, 1), left: remaining(journey.doneModules, 1, MODULES) };
      case 'mapa-dzial-5':
        return { ...base, ...measure(journey.doneModules, 5), left: remaining(journey.doneModules, 5, MODULES) };
      case 'mapa-matematyka':
        return { ...base, earned: journey.mathDone, progress: journey.mathDone ? 1 : 0 };
      case 'mapa-informatyka':
        return { ...base, earned: journey.infoDone, progress: journey.infoDone ? 1 : 0 };
      case 'mapa-historia':
        return {
          ...base,
          ...measure(journey.histLessonsDone, journey.histLessonsTotal),
          earned: histDone(journey),
          left: remaining(journey.histLessonsDone, journey.histLessonsTotal, LESSONS),
        };
      case 'mapa-oba': {
        const both = journey.mathDone && journey.infoDone;
        return { ...base, earned: both, progress: (Number(journey.mathDone) + Number(journey.infoDone)) / 2 };
      }
      case 'mapa-trzy': {
        const hist = histDone(journey);
        const histPart = journey.histLessonsTotal > 0 ? journey.histLessonsDone / journey.histLessonsTotal : 0;
        return {
          ...base,
          earned: journey.mathDone && journey.infoDone && hist,
          progress: (Number(journey.mathDone) + Number(journey.infoDone) + Math.min(1, histPart)) / 3,
        };
      }
      case 'charakter-ochotnik':
        return { ...base, ...measure(snapshot.weekendDays, 1) };
      case 'charakter-poniedzialek':
        return {
          ...base,
          ...measure(snapshot.mondayDays, 3),
          left: remaining(snapshot.mondayDays, 3, { one: 'poniedziałek', few: 'poniedziałki', many: 'poniedziałków' }),
        };
      case 'charakter-dwa-fronty':
        return { ...base, ...measure(snapshot.twoSubjectDays, 1) };
      case 'charakter-powrot':
        return { ...base, ...measure(snapshot.returns, 1) };
      default:
        return { ...base, earned: false, progress: 0 };
    }
  });
}

/** Identyfikatory zdobytych odznak — do porównania „co przybyło” po ukończeniu lekcji. */
export function earnedIds(badges: BadgeState[]): string[] {
  return badges.filter((badge) => badge.earned).map((badge) => badge.id);
}

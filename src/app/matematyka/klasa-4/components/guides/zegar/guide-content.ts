import type { GuideActMeta } from '../guide-act';
import type { QuarterMinute } from '../../../lib/clock';

/**
 * Wszystkie akty na `flow` — ten przewodnik nie ma żadnej scrubowanej, ciągłej
 * animacji; każde odsłonięcie to klik w `ClockCard` albo wybór wskazówki w
 * akcie „Trzy wskazówki". Ten sam wybór co w każdym innym przewodniku
 * zbudowanym po 2026-08-12, `stage` jest wyjątkiem, nie
 * domyślnym trybem.
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Rano czy wieczorem?', mode: 'flow' },
  { id: 'wskazowki', label: 'Trzy wskazówki', mode: 'flow' },
  { id: 'czytanie', label: 'Kwadranse', mode: 'flow' },
  { id: 'zapis-12-24', label: 'Zapis 12 i 24', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół ciebie', mode: 'flow' },
];

export interface HandDetail {
  id: 'hour' | 'minute' | 'second';
  label: string;
  fact: string;
}

/** Akt „Trzy wskazówki" — kliknięcie podświetla odpowiednią wskazówkę na tarczy i odsłania fakt. */
export const HAND_DETAILS: HandDetail[] = [
  {
    id: 'hour',
    label: 'Godzinowa',
    fact: 'Najkrótsza i najgrubsza. Okrąża całą tarczę raz na 12 godzin — między dwiema sąsiednimi cyframi mija cała godzina.',
  },
  {
    id: 'minute',
    label: 'Minutowa',
    fact: 'Dłuższa i cieńsza od godzinowej. Okrąża całą tarczę raz na godzinę — każda kreska między cyframi to 5 minut, bo 12 kresek razy 5 daje 60 minut.',
  },
  {
    id: 'second',
    label: 'Sekundowa',
    fact: 'Najdłuższa i najcieńsza, w wielu zegarach czerwona. Okrąża całą tarczę raz na minutę i jako jedyna nigdy się nie zatrzymuje — cały czas płynnie idzie do przodu.',
  },
];

interface QuarterExample {
  hour12: number;
  minutes: QuarterMinute;
}

/** Akt „Kwadranse" — ta sama godzina, cztery pozycje: 0, 15, 30, 45 minut. */
export const QUARTER_SET_A: QuarterExample[] = [
  { hour12: 3, minutes: 0 },
  { hour12: 3, minutes: 15 },
  { hour12: 3, minutes: 30 },
  { hour12: 3, minutes: 45 },
];

/** Druga godzina — ten sam wzór, żeby było jasne, że nie działa tylko dla „trzeciej". */
export const QUARTER_SET_B: QuarterExample[] = [
  { hour12: 9, minutes: 0 },
  { hour12: 9, minutes: 15 },
  { hour12: 9, minutes: 30 },
  { hour12: 9, minutes: 45 },
];

export interface NotationExample {
  hours24: number;
  minutes: number;
  context: string;
}

/** Akt „Zapis 12 i 24" — cztery pory doby, żeby pokazać wszystkie typowe przypadki poza „w nocy" (ta trafia do listy zasad). */
export const NOTATION_EXAMPLES: NotationExample[] = [
  { hours24: 6, minutes: 30, context: 'Budzik dzwoni o' },
  { hours24: 10, minutes: 15, context: 'Długa przerwa zaczyna się o' },
  { hours24: 14, minutes: 45, context: 'Wracasz ze szkoły o' },
  { hours24: 20, minutes: 0, context: 'Zaczyna się twój ulubiony serial o' },
];

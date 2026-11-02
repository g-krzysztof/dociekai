import type { GuideActMeta } from '../guide-act';

/**
 * Wszystkie akty na `flow` (2026-08-12, druga tura). `otwarcie` był jedynym
 * aktem w tym przewodniku z prawdziwym `useActStep` (licznik sekund tykający
 * scrollem) i początkowo został na `stage` jako uzasadniony wyjątek — ale
 * będąc pierwszym aktem, sprawiał, że strona przy wejściu wyglądała
 * identycznie jak przed poprawką (puste, przyklejone pierwsze wrażenie).
 * `useActStep` bez `cinematic` po prostu zwraca `count` od razu (ten sam
 * fallback co na mobile/reduced-motion) — licznik pokazuje finalną wartość
 * bez animacji zamiast tykać, nic się nie psuje.
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Ile to jest?', mode: 'flow' },
  { id: 'cyfra-liczba', label: 'Cyfra i liczba', mode: 'flow' },
  { id: 'rzedy-i-klasy', label: 'Rzędy i klasy', mode: 'flow' },
  { id: 'os-liczbowa', label: 'Oś liczbowa', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół ciebie', mode: 'flow' },
];

/**
 * Sekund w roku (365 dni): 365 × 24 × 60 × 60. Liczba do przeczytania na
 * końcu przewodnika — policzalna z pierwszych zasad, więc bezpieczna do
 * pokazania jako fakt (bez ryzyka nieaktualnej statystyki).
 */
export const HOOK_VALUE = 365 * 24 * 60 * 60;

/** Dziesięć cyfr — „skrzynka narzędziowa", z której buduje się każdą liczbę. */
export const DIGITS_0_9 = Array.from({ length: 10 }, (_, i) => i);

/** Te same cztery cyfry, dwa różne odczyty — demo „kolejność ma znaczenie". */
export const SHUFFLE_DIGITS = [2, 0, 2, 6];

export interface PlaceColumn {
  label: string;
  /** Rząd: 0 = jedności, 1 = dziesiątki, 2 = setki, 3 = tysiące. */
  place: number;
}

/** Kolumny rejestru miejsc, w kolejności czytania liczby: od tysięcy do jedności. */
export const PLACE_COLUMNS: PlaceColumn[] = [
  { label: 'tysiące', place: 3 },
  { label: 'setki', place: 2 },
  { label: 'dziesiątki', place: 1 },
  { label: 'jedności', place: 0 },
];

/** Cyfra przesuwana po rejestrze miejsc w akcie „rzędy i klasy". */
export const PLACE_REGISTER_DIGIT = 5;

/** Wyjaśnienie każdej klasy w rozbiciu `HOOK_VALUE` — klucz to `PlaceValueClass.name`. */
export const CLASS_EXPLANATIONS: Record<string, string> = {
  miliony: 'Pierwsza od lewej grupa to klasa milionów — ile jest całych milionów w tej liczbie.',
  tysiące:
    'Środkowa grupa to klasa tysięcy — ile zostało tysięcy, których nie starczyło na kolejny milion.',
  jedności:
    'Ostatnia grupa to klasa jedności — zwykłe jednostki, dziesiątki i setki, które zostały na końcu.',
};

export const REAL_LIFE_EXAMPLES: string[] = [
  'Licznik przebiegu w samochodzie — pokazuje, ile kilometrów przejechano.',
  'Skarbonka pełna monet — żeby je policzyć, warto zgrupować je tak, jak cyfry w klasy.',
  'Tablica wyników na stadionie — liczba widzów podana w tysiącach.',
  'Cena mieszkania w ogłoszeniu — zawsze z odstępem między klasami.',
  'Numer strony w grubej książce albo numer na koszulce zawodnika.',
];

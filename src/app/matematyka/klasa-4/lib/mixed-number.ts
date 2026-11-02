/**
 * Liczby mieszane — jedna czysta funkcja karmi widżet, przykłady i klucz
 * odpowiedzi (ta sama dyscyplina co `lib/roman.ts`, `lib/long-division.ts`
 * czy `lib/calendar.ts`): nigdzie nie wpisujemy ręcznie „17/5 to 3 2/5”
 * osobno w rysunku i osobno w tekście.
 */

export interface MixedNumber {
  /** Część całkowita — ile pełnych całości mieści się w ułamku. */
  whole: number;
  /** Reszta zapisana jako licznik (zawsze mniejsza od mianownika). */
  licznik: number;
  mianownik: number;
}

/** Ułamek niewłaściwy → liczba mieszana. To zwykłe dzielenie z resztą. */
export function toMixed(licznik: number, mianownik: number): MixedNumber {
  return {
    whole: Math.floor(licznik / mianownik),
    licznik: licznik % mianownik,
    mianownik,
  };
}

/** Liczba mieszana → licznik ułamka niewłaściwego. Droga odwrotna do `toMixed`. */
export function toImproper({ whole, licznik, mianownik }: MixedNumber): number {
  return whole * mianownik + licznik;
}

/** Zapis „3 2/5” jednym stringiem — do treści zadań i wyjaśnień. */
export function formatMixed({ whole, licznik, mianownik }: MixedNumber): string {
  if (licznik === 0) return `${whole}`;
  if (whole === 0) return `${licznik}/${mianownik}`;
  return `${whole} ${licznik}/${mianownik}`;
}

export interface TapeFrame {
  /** Ile pełnych całości leży już poskładanych w tej klatce. */
  wholes: number;
  /** Ile luźnych części 1/mianownik zostało jeszcze niezłożonych. */
  parts: number;
  mianownik: number;
  /** Jak czyta się liczba w tej klatce — zawsze ta sama wartość, inna nazwa. */
  reading: string;
}

export interface TapeTransition {
  /** Opis kroku przy przejściu w prawo (ułamek niewłaściwy → liczba mieszana). */
  forward: string;
  /** Opis DOKŁADNIE tego samego kroku puszczonego w tył (liczba mieszana → ułamek niewłaściwy). */
  back: string;
}

export interface MixedTape {
  frames: TapeFrame[];
  /** Zawsze o jeden krócej niż `frames` — opisuje przejścia MIĘDZY klatkami. */
  transitions: TapeTransition[];
  target: MixedNumber;
}

/**
 * Taśma przekształcenia: każda klatka zbiera kolejne `mianownik` luźnych
 * części w jedną całość. Dzięki temu ta sama sekwencja czyta się sensownie
 * w obie strony — w prawo składamy całości, w lewo rozbijamy je z powrotem.
 * Liczba klatek zależy od części całkowitej (jak w `DivisionLedger` liczba
 * kroków zależy od dzielnej), więc nigdy nie zakładaj stałej długości.
 */
export function buildMixedTape(licznik: number, mianownik: number): MixedTape {
  const target = toMixed(licznik, mianownik);
  const frames: TapeFrame[] = [];
  const transitions: TapeTransition[] = [];

  for (let wholes = 0; wholes <= target.whole; wholes++) {
    const parts = licznik - wholes * mianownik;
    frames.push({
      wholes,
      parts,
      mianownik,
      reading: readFrame(wholes, parts, mianownik),
    });

    if (wholes < target.whole) {
      const numer = wholes + 1;
      transitions.push({
        forward: `Zbierz ${mianownik} części po 1/${mianownik} w ${numer === 1 ? 'pierwszą' : numer === 2 ? 'drugą' : `${numer}.`} całość — luźnych części zostaje ${parts - mianownik}.`,
        back: `Rozbij ${numer === 1 ? 'tę' : 'ostatnią'} całość z powrotem na ${mianownik} części po 1/${mianownik} — luźnych części robi się znowu ${parts}.`,
      });
    }
  }

  return { frames, transitions, target };
}

/**
 * Odczyt klatki. Uwaga na klatki POŚREDNIE: dopóki luźnych części jest co
 * najmniej `mianownik`, nie wolno pisać ich jako ułamka obok całości — „2 całe
 * i 7/5” wygląda jak zepsuta liczba mieszana. Taka klatka opisuje scenę
 * („2 całe i 7 kawałków po 1/5”), a zapis liczby mieszanej pojawia się dopiero
 * w klatce końcowej, gdzie reszta jest naprawdę mniejsza od mianownika.
 */
function readFrame(wholes: number, parts: number, mianownik: number): string {
  if (wholes === 0) return `${parts}/${mianownik}`;
  if (parts === 0) return `${wholes}`;
  if (parts < mianownik) return `${wholes} ${parts}/${mianownik}`;
  return `${wholes} ${wholeWord(wholes)} i ${parts} ${pieceWord(parts)} po 1/${mianownik}`;
}

/** Polska odmiana „cała” po liczebniku: 1 → cała, 2–4 → całe, 5+ → całych. */
function wholeWord(count: number): string {
  if (count === 1) return 'cała';
  return isFewForm(count) ? 'całe' : 'całych';
}

/** Polska odmiana „kawałek”: 2–4 → kawałki, pozostałe → kawałków. */
function pieceWord(count: number): string {
  return isFewForm(count) ? 'kawałki' : 'kawałków';
}

/** Forma „mnoga mała” (2–4), z wyjątkiem nastek 12–14. */
function isFewForm(count: number): boolean {
  const last = count % 10;
  const teen = count % 100 >= 12 && count % 100 <= 14;
  return last >= 2 && last <= 4 && !teen;
}

/**
 * Lektor (E4a kursu polskiego) — typy nagrań.
 *
 * Konwencja: **jeden klip na zdanie albo wers** (`id` = `unitId` z `korpus`:
 * `s0`, `v3`…), albo na nazwany wariant (`kropka`, `wykrzyknik`…). Dzięki temu
 * odtwarzacz podświetla dokładnie czytane zdanie, poprawka jednego zdania to
 * jedno nowe nagranie, a partytura (E4b) składa odczyt z gotowych klipów i ciszy.
 *
 * Pliki: `public/audio/jezyk-polski/<lekcja>/<tekst>/<id>.mp3` (mono, 64 kb/s,
 * cisza z brzegów obcięta). Manifest generuje narzędzie lektora (TTS) do
 * pliku `<tekst>.audio.ts` obok źródła tekstu — ręcznie się go nie edytuje.
 */

export interface LektorClip {
  /** `unitId` zdania/wersu albo nazwa wariantu. */
  id: string;
  /** Ścieżka publiczna, np. `/audio/jezyk-polski/jezyk-dziala/poranek/s0.mp3`. */
  src: string;
  /** Długość w milisekundach (z `ffprobe`). */
  ms: number;
  /**
   * Dokładnie to, co lektor przeczytał (forma mówiona: liczby słownie).
   * Porównujemy z tekstem lekcji, żeby wyłapać nagrania, które się zestarzały.
   */
  text: string;
  /** Akapit/strofa (dla dłuższej pauzy między akapitami). */
  block?: number;
}

export interface LektorManifest {
  /** Nazwa tekstu (np. `poranek`). */
  id: string;
  voice: string;
  /** Klipy w kolejności czytania. */
  clips: LektorClip[];
}

/** Forma mówiona zdań, gdy różni się od pisanej (`{ s3: 'o siedemnastej' }`). */
export type SpeechOverrides = Record<string, string>;

/** Wariant do nagrania (tryb „klipy”): sam tekst albo tekst z ustawieniami głosu. */
export type ClipSpec = string | { text: string; speed?: number; stability?: number; style?: number };

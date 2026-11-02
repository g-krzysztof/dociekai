import type { KorpusSource } from '../korpus/types';

/**
 * Czytelnia (E5b) — biblioteka kursu: dłuższe teksty z domeny publicznej
 * (rejestr tekstów Czytelni), każdy pocięty na
 * odcinki po 5–10 minut. Odcinek to zwykłe źródło `korpus` (więc działają na
 * nim wszystkie gesty i sędziowie). Bez nagrań od zwrotu 2026-10-19 (§ 3a).
 *
 * Dane książek: `data/czytelnia/<id>/` (`odc-N.ts` + `index.ts` z `CzytelniaBook`).
 */

export interface CzytelniaEpisode {
  /** `1`, `2`… — numer odcinka (stały: po nim liczy się postęp na Półce). */
  n: number;
  title: string;
  source: KorpusSource;
  /** Liczba słów (do „ok. 5 minut”). */
  words: number;
}

export interface CzytelniaBook {
  /** Slug, np. `brzydkie-kaczatko` — klucz na Półce, nie zmieniać po publikacji. */
  id: string;
  /** Numer w rejestrze tekstów (`C2`). */
  registry: string;
  title: string;
  author: string;
  authorDied: number;
  translator?: string;
  translatorDied?: number;
  /** Gatunek i nastrój — mówimy do dziecka („baśń”, „zaczyna się smutno, kończy szczęśliwie”). */
  genre: string;
  mood: string;
  /** Dwa zdania zachęty, w torze dziecka, bez zdradzania zakończenia. */
  blurb: string;
  /** Czy w Czytelni jest całość, czy fragment (pierwsze rozdziały). */
  whole: boolean;
  source: { label: string; url: string };
  episodes: CzytelniaEpisode[];
}

/** Minuty czytania na głos (ok. 130 słów/min), zaokrąglone w górę. */
export function episodeMinutes(words: number): number {
  return Math.max(1, Math.ceil(words / 130));
}

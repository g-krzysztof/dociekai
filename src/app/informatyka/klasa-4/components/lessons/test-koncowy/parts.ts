import { ALGO_ITEMS } from './part-algo';
import { SHEET_ITEMS } from './part-sheet';
import { DOC_ITEMS } from './part-doc';
import { SAFE_ITEMS } from './part-safe';
import type { PartItem } from './test-frame';
import { getLesson } from '../../../data/lessons';

/**
 * Cztery części testu końcowego — ta sama lista karmi bloki lekcji, zakład,
 * wynik i most do klasy 5, żeby nazwy i kolejność nie rozjechały się w czterech
 * miejscach.
 *
 * Części odpowiadają temu, na czym stoi klasa 5 (program kursu, moduł 9):
 * dłuższe projekty, arkusz „na poważnie” i więcej algorytmiki — plus to, co
 * przechodzi przez każdy rok, czyli bezpieczne i świadome korzystanie z sieci.
 */

export interface TestPart {
  id: 'algo' | 'arkusz' | 'dokument' | 'siec';
  letter: 'A' | 'B' | 'C' | 'D';
  short: string;
  title: string;
  /** Jednozdaniowy opis tego, co część mierzy — do zakładu. */
  measures: string;
  items: PartItem[];
  /** Temat klasy 5, na którym stoi ta część. */
  next: { title: string; text: string };
  /** Lekcje do dopięcia, gdy wynik jest słaby. */
  revisit: { module: string; slug: string }[];
}

export const PARTS: TestPart[] = [
  {
    id: 'algo',
    letter: 'A',
    short: 'Algorytmy i Scratch',
    title: 'Część A: gdzie skończy kot?',
    measures: 'czytanie skryptu z pętlą i przewidywanie, gdzie się zatrzyma',
    items: ALGO_ITEMS,
    next: {
      title: 'Zmienne i własne algorytmy',
      text: 'W klasie 5 Scratch dostaje pamięć: zmienne (punkty, życie, czas) i decyzje, które od nich zależą — a algorytmy dochodzą do sortowania i szukania.',
    },
    revisit: [
      { module: 'myslenie-komputacyjne', slug: 'plan-dla-robota' },
      { module: 'programowanie-scratch', slug: 'petle-i-warunki' },
      { module: 'programowanie-scratch', slug: 'testowanie-i-bledy' },
    ],
  },
  {
    id: 'arkusz',
    letter: 'B',
    short: 'Dane i arkusz',
    title: 'Część B: arkusz, który liczy sam',
    measures: 'formuły, kopiowanie adresów i zaznaczanie zakresu do wykresu',
    items: SHEET_ITEMS,
    next: {
      title: 'Arkusz na poważnie',
      text: 'W klasie 5 arkusz przestaje być tabelką z jedną sumą: funkcje jak średnia i maksimum, większe tabele i wykresy, z których wyciąga się wnioski.',
    },
    revisit: [{ module: 'dane-i-ai', slug: 'arkusz-pierwsze-kroki' }],
  },
  {
    id: 'dokument',
    letter: 'C',
    short: 'Dokument, obraz i plik',
    title: 'Część C: dokument, obraz i plik',
    measures: 'format obrazu, styl nagłówka i porządny zapis pliku',
    items: DOC_ITEMS,
    next: {
      title: 'Dłuższe projekty',
      text: 'W klasie 5 dokument, obrazy i prezentacja zbiegają się w jednym dłuższym projekcie — a wtedy porządek w plikach i stylach oszczędza godziny.',
    },
    revisit: [
      { module: 'grafika', slug: 'formaty-i-kartka' },
      { module: 'dokumenty-tekstowe', slug: 'podzial-tekstu' },
      { module: 'komputer-i-pliki', slug: 'pliki-i-chmura' },
    ],
  },
  {
    id: 'siec',
    letter: 'D',
    short: 'Bezpieczeństwo i AI',
    title: 'Część D: hasła, generator i wspólny dokument',
    measures: 'hasło, sprawdzanie wyniku generatora i bezpieczne udostępnianie',
    items: SAFE_ITEMS,
    next: {
      title: 'Odpowiedzialna sieć i AI',
      text: 'W klasie 5 dorasta to, co masz już w małym: własne zasady korzystania z AI, wspólne projekty w chmurze i coraz więcej rzeczy, które trzeba umieć sprawdzić.',
    },
    revisit: [
      { module: 'internet-i-bezpieczenstwo', slug: 'dane-osobowe-i-hasla' },
      { module: 'dane-i-ai', slug: 'sztuczna-inteligencja' },
      { module: 'technologia-i-projekt', slug: 'wspolpraca-w-chmurze' },
    ],
  },
];

export const TOTAL_ITEMS = PARTS.reduce((sum, part) => sum + part.items.length, 0);

/** Odnośnik do lekcji z jej krótkim tytułem. */
export function lessonLink(module: string, slug: string): { title: string; href: string } {
  return {
    title: getLesson(module, slug)?.short ?? slug,
    href: `/informatyka/klasa-4/${module}/${slug}`,
  };
}

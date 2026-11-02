import type { DiagnosticTask } from '../../diagnostic-quiz';
import { FractionBarGlyph } from '../../fraction-bar-glyph';

function fill(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

/** Dwa paski o tym samym mianowniku jeden pod drugim — rysunek do zadania „ile razem". */
function twoBars(color: string, mianownik: number, first: number, second: number, captions: [string, string]) {
  return (
    <div className="mx-auto max-w-sm space-y-3">
      {[first, second].map((licznik, i) => (
        <div key={i}>
          <p className="mb-1 text-xs font-semibold" style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
            {captions[i]}
          </p>
          <FractionBarGlyph
            color={color}
            mianownik={mianownik}
            filled={fill(licznik)}
            ariaLabel={`Pasek podzielony na ${mianownik} równych części, zamalowane ${licznik}`}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Ćwiczenia: dodawanie i odejmowanie przy jednakowym mianowniku, odczyt
 * z rysunku, przypadek przekraczający całość i liczby mieszane — poziomy K/P/R/D.
 */
export function buildSumDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'proste-dodawanie',
      prompt: 'Ile wynosi 3/8 + 4/8?',
      type: 'choice',
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: '7/16' },
        { id: 'b', text: '7/8' },
        { id: 'c', text: '12/8' },
        { id: 'd', text: '1/8' },
      ],
      correctId: 'b',
      explanation: 'Dodajemy same liczniki: 3 + 4 = 7. Mianownik przepisujemy bez zmian, bo kawałki nie zmieniły wielkości — wychodzi 7/8.',
    },
    {
      id: 'proste-odejmowanie',
      prompt: 'Oblicz 5/9 − 2/9. Wpisz sam licznik wyniku (mianownik zostaje 9).',
      type: 'input',
      answer: '3',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: '5 − 2 = 3, więc 5/9 − 2/9 = 3/9. Odejmowanie działa dokładnie tak samo jak dodawanie: rusza się tylko licznik.',
    },
    {
      id: 'odczytaj-sume',
      prompt: 'Dwa paski są podzielone na 6 równych części. Ile zamalowanych kawałków jest razem?',
      type: 'choice',
      visual: twoBars(color, 6, 2, 3, ['Pierwszy pasek', 'Drugi pasek']),
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '5/12' },
        { id: 'b', text: '6/6' },
        { id: 'c', text: '1/6' },
        { id: 'd', text: '5/6' },
      ],
      correctId: 'd',
      explanation: '2 kawałki i 3 kawałki tej samej wielkości to razem 5 kawałków po 1/6, czyli 5/6. Mianownik 6 opisuje wielkość kawałka i zostaje.',
    },
    {
      id: 'ktory-zapis',
      prompt: 'Który zapis jest poprawnym wynikiem działania 4/7 + 2/7?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '6/14' },
        { id: 'b', text: '8/7' },
        { id: 'c', text: '6/7' },
        { id: 'd', text: '2/7' },
      ],
      correctId: 'c',
      explanation: 'Mianowników nigdy się nie dodaje — 4/7 + 2/7 = 6/7. Odpowiedź 6/14 to najczęstsza pomyłka: dodany również mianownik.',
    },
    {
      id: 'liczby-mieszane',
      prompt: 'Ile wynosi 2 1/5 + 1 3/5?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '3 4/5' },
        { id: 'b', text: '3 4/10' },
        { id: 'c', text: '4 4/5' },
        { id: 'd', text: '2 4/5' },
      ],
      correctId: 'a',
      explanation: 'Całości dodajemy do całości (2 + 1 = 3), a kawałki do kawałków (1/5 + 3/5 = 4/5). Razem 3 4/5.',
    },
    {
      id: 'przekracza-calosc',
      prompt: 'Na przyjęciu zjedzono 3/4 jednej pizzy i 3/4 drugiej. Ile ćwiartek pizzy zniknęło razem? Wpisz samą liczbę.',
      type: 'input',
      answer: '6',
      unit: 'ćwiartki',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation:
        '3/4 + 3/4 = 6/4, czyli sześć ćwiartek. Ułamek wyszedł niewłaściwy, bo zjedzono więcej niż jedną całą pizzę — czytamy go jako 1 2/4, czyli półtorej pizzy.',
    },
    {
      id: 'dwa-ruchy',
      prompt: 'W butelce było 7/8 litra soku. Wypito 3/8 litra, a potem dolano 2/8 litra. Ile soku jest teraz w butelce?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: '12/8 litra' },
        { id: 'b', text: '2/8 litra' },
        { id: 'c', text: '6/24 litra' },
        { id: 'd', text: '6/8 litra' },
      ],
      correctId: 'd',
      explanation:
        'Dwa ruchy po kolei, oba na tym samym mianowniku: 7/8 − 3/8 = 4/8, a potem 4/8 + 2/8 = 6/8 litra. Mianownik ani razu się nie zmienił.',
    },
  ];
}

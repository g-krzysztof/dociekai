import type { DiagnosticTask } from '../../diagnostic-quiz';
import { FractionBarGlyph } from '../../fraction-bar-glyph';

function fill(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

/** Stos identycznych porcji — rysunek do zadania „zapisz to mnożeniem". */
function portions(color: string, mianownik: number, licznik: number, copies: number, caption: string) {
  return (
    <div className="mx-auto max-w-xs">
      <p className="mb-1 text-xs font-semibold" style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
        {caption}
      </p>
      <div className="space-y-3">
        {Array.from({ length: copies }, (_, i) => (
          <FractionBarGlyph
            key={i}
            color={color}
            mianownik={mianownik}
            filled={fill(licznik)}
            ariaLabel={`Porcja ${i + 1}: ${licznik} z ${mianownik} części`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Ćwiczenia: mnożenie licznika przez liczbę naturalną, odczyt zapisu
 * z rysunku, wynik równy całości oraz mnożenie liczby mieszanej — K/P/R/D.
 */
export function buildMultiplyDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'proste-mnozenie',
      prompt: 'Ile wynosi 3 · 2/7?',
      type: 'choice',
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: '6/21' },
        { id: 'b', text: '5/7' },
        { id: 'c', text: '6/7' },
        { id: 'd', text: '6/14' },
      ],
      correctId: 'c',
      explanation: 'Mnożymy sam licznik: 3 · 2 = 6. Mianownik przepisujemy bez zmian, bo wielkość kawałka się nie zmienia — wychodzi 6/7.',
    },
    {
      id: 'wpisz-licznik',
      prompt: 'Oblicz 4 · 1/5. Wpisz sam licznik wyniku (mianownik zostaje 5).',
      type: 'input',
      answer: '4',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: 'Cztery razy po jednym kawałku to 4 kawałki po 1/5, czyli 4/5. Licznik pomnożony przez 4, mianownik nietknięty.',
    },
    {
      id: 'zapisz-z-rysunku',
      prompt: 'Który zapis pasuje do rysunku i podaje poprawny wynik?',
      type: 'choice',
      visual: portions(color, 6, 2, 3, '3 porcje po 2/6'),
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '2 · 3/6 = 6/18' },
        { id: 'b', text: '3 · 2/6 = 6/6' },
        { id: 'c', text: '3 · 2/6 = 6/18' },
        { id: 'd', text: '3 + 2/6 = 2 3/6' },
      ],
      correctId: 'b',
      explanation: 'Trzy porcje po 2/6 to 3 · 2/6 = 6/6. Sześć szóstych części składa się w całość, więc wynik to dokładnie 1.',
    },
    {
      id: 'wieksze-mnozenie',
      prompt: 'Ile wynosi 5 · 3/8?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '15/8' },
        { id: 'b', text: '15/40' },
        { id: 'c', text: '8/8' },
        { id: 'd', text: '15/13' },
      ],
      correctId: 'a',
      explanation: '5 · 3 = 15, mianownik zostaje 8, czyli 15/8. To ułamek niewłaściwy — czytamy go jako 1 7/8.',
    },
    {
      id: 'przepis-cukier',
      prompt: 'Na jedno ciasto idą 2/3 szklanki cukru. Ile trzecich części szklanki potrzeba na 4 ciasta? Wpisz samą liczbę.',
      type: 'input',
      answer: '8',
      unit: 'trzecich części',
      difficulty: { code: 'P', name: 'Podstawowe' },
      explanation: '4 · 2/3 = 8/3, czyli osiem trzecich części szklanki. To samo można przeczytać jako 2 2/3 szklanki.',
    },
    {
      id: 'rowna-calosc',
      prompt: 'Ile wynosi 5 · 2/10?',
      type: 'choice',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      options: [
        { id: 'a', text: '10/50' },
        { id: 'b', text: '1' },
        { id: 'c', text: '7/10' },
        { id: 'd', text: '10/20' },
      ],
      correctId: 'b',
      explanation: '5 · 2 = 10, więc wynik to 10/10. Dziesięć dziesiątych części składa się w komplet, czyli w liczbę 1.',
    },
    {
      id: 'liczba-mieszana',
      prompt: 'Ile wynosi 3 · 1 1/4?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: '3 1/4' },
        { id: 'b', text: '4 1/4' },
        { id: 'c', text: '3 1/12' },
        { id: 'd', text: '3 3/4' },
      ],
      correctId: 'd',
      explanation:
        'Najpierw zamieniamy liczbę mieszaną na ułamek niewłaściwy: 1 1/4 = 5/4. Potem 3 · 5/4 = 15/4, a 15/4 to 3 3/4. Można też policzyć osobno: 3 całości i 3 · 1/4 = 3/4.',
    },
  ];
}

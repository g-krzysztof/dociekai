import type { DiagnosticTask } from '../../diagnostic-quiz';
import { SliceWedge, WholePie } from './mixed-pieces';

interface SceneSpec {
  wholes: number;
  parts: number;
  mianownik: number;
  noun: string;
}

/** Scena „całości + luźne kawałki” — ten sam rysunek co w rozgrzewce i na tablicy, tylko bez interakcji. */
function scene(color: string, { wholes, parts, mianownik, noun }: SceneSpec) {
  return (
    <div className="mx-auto flex max-w-sm flex-wrap items-center justify-center gap-2.5">
      {Array.from({ length: wholes }, (_, i) => (
        <div key={`w-${i}`} className="w-14 sm:w-16">
          <WholePie color={color} mianownik={mianownik} label={`Cały ${noun}`} />
        </div>
      ))}
      {Array.from({ length: parts }, (_, i) => (
        <SliceWedge key={`p-${i}`} color={color} mianownik={mianownik} className="h-10 w-10" />
      ))}
    </div>
  );
}

/**
 * Ćwiczenia: odczyt liczby mieszanej z rysunku, zamiana w obie strony,
 * rozpoznanie ułamka niewłaściwego i zadanie osadzone w treści — poziomy
 * K/P/R/D. Odpowiedzi liczone z `toMixed`/`toImproper`, nie wpisywane na oko.
 */
export function buildDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'odczytaj-mieszana',
      prompt: 'Jaką liczbę mieszaną przedstawia ten rysunek?',
      type: 'choice',
      visual: scene(color, { wholes: 2, parts: 1, mianownik: 4, noun: 'tort' }),
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: '4 1/2' },
        { id: 'b', text: '2 1/4' },
        { id: 'c', text: '1 2/4' },
        { id: 'd', text: '2 4/1' },
      ],
      correctId: 'b',
      explanation: 'Dwa całe torty i jeszcze jedna ćwiartka, czyli 2 1/4. Część całkowitą piszemy z przodu, resztę jako ułamek.',
    },
    {
      id: 'ile-kawalkow-razem',
      prompt: 'Ile jest na tym rysunku wszystkich kawałków po jednej trzeciej? Wpisz samą liczbę.',
      type: 'input',
      answer: '8',
      visual: scene(color, { wholes: 2, parts: 2, mianownik: 3, noun: 'placek' }),
      unit: 'kawałków',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: 'Każdy cały placek to 3 kawałki: 3 + 3 = 6, plus 2 luźne, razem 8. Zapisujemy to jako 8/3.',
    },
    {
      id: 'niewlasciwy-na-mieszana',
      prompt: 'Zamień ułamek 11/4 na liczbę mieszaną. Wpisz samą część całkowitą.',
      type: 'input',
      answer: '2',
      difficulty: { code: 'P', name: 'Podstawowe' },
      explanation: '11 : 4 = 2 reszty 3, więc 11/4 = 2 3/4. Część całkowita to 2, a reszta 3 zostaje w liczniku.',
    },
    {
      id: 'mieszana-na-niewlasciwy',
      prompt: 'Zamień liczbę mieszaną 3 2/5 na ułamek niewłaściwy. Który to ułamek?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '32/5' },
        { id: 'b', text: '10/5' },
        { id: 'c', text: '17/5' },
        { id: 'd', text: '11/5' },
      ],
      correctId: 'c',
      explanation: 'Każda z 3 całości to 5 piątych: 3 · 5 = 15. Dokładamy resztę: 15 + 2 = 17, więc 3 2/5 = 17/5.',
    },
    {
      id: 'ktory-niewlasciwy',
      prompt: 'Który z tych ułamków jest niewłaściwy, czyli jest równy całości albo od niej większy?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '9/8' },
        { id: 'b', text: '5/6' },
        { id: 'c', text: '3/7' },
        { id: 'd', text: '2/9' },
      ],
      correctId: 'a',
      explanation: 'W ułamku niewłaściwym licznik jest większy od mianownika albo mu równy. 9 > 8, więc 9/8 to trochę więcej niż jedna cała.',
    },
    {
      id: 'ile-calych-miesci',
      prompt: 'Ile pełnych całości mieści się w ułamku 23/6? Wpisz samą liczbę.',
      type: 'input',
      answer: '3',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation: '23 : 6 = 3 reszty 5, więc mieszczą się 3 pełne całości, a zostaje jeszcze 5/6. Czyli 23/6 = 3 5/6.',
    },
    {
      id: 'butelki-soku',
      prompt:
        'Do przyjęcia potrzeba 2 3/4 litra soku, a sok sprzedawany jest w butelkach po ćwierć litra. Ile takich butelek trzeba kupić?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: '9 butelek' },
        { id: 'b', text: '23 butelki' },
        { id: 'c', text: '7 butelek' },
        { id: 'd', text: '11 butelek' },
      ],
      correctId: 'd',
      explanation: 'Zamieniamy 2 3/4 na ćwiartki: 2 · 4 = 8, plus 3 to 11. Potrzeba 11 butelek po ćwierć litra, bo 2 3/4 = 11/4.',
    },
  ];
}

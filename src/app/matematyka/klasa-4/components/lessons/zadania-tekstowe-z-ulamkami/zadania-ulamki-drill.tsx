import type { DiagnosticTask } from '../../diagnostic-quiz';

/**
 * Ćwiczenia: obliczanie ułamka danej liczby, odczytanie reszty, mnożenie
 * porcji w treści zadania i droga odwrotna (znana część, szukana całość) —
 * poziomy K/P/R/D.
 */
export function buildStoryDrillTasks(): DiagnosticTask[] {
  return [
    {
      id: 'jedna-czwarta-z-20',
      prompt: 'Ile to jest 1/4 z 20? Wpisz samą liczbę.',
      type: 'input',
      answer: '5',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: 'Mianownik 4 mówi, na ile równych grup dzielimy: 20 : 4 = 5. Licznik 1 mówi, że bierzemy jedną taką grupę.',
    },
    {
      id: 'dziewczynki-w-klasie',
      prompt: 'W klasie jest 18 uczniów, a 1/3 z nich to dziewczynki. Ile jest dziewczynek?',
      type: 'choice',
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: '3' },
        { id: 'b', text: '6' },
        { id: 'c', text: '15' },
        { id: 'd', text: '54' },
      ],
      correctId: 'b',
      explanation: '18 : 3 = 6. Klasa dzieli się na 3 równe grupy po 6 uczniów, a dziewczynki to jedna z nich.',
    },
    {
      id: 'trzy-osme-z-40',
      prompt: 'Ile to jest 3/8 z 40? Wpisz samą liczbę.',
      type: 'input',
      answer: '15',
      difficulty: { code: 'P', name: 'Podstawowe' },
      explanation: 'Najpierw dzielimy przez mianownik: 40 : 8 = 5. Potem mnożymy przez licznik: 3 · 5 = 15.',
    },
    {
      id: 'ile-ciastek-zostalo',
      prompt: 'Z 24 ciastek zjedzono 3/4. Ile ciastek zostało?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '18' },
        { id: 'b', text: '21' },
        { id: 'c', text: '6' },
        { id: 'd', text: '8' },
      ],
      correctId: 'c',
      explanation:
        'Zostało 1/4 ciastek, bo 4/4 − 3/4 = 1/4. A 24 : 4 = 6. Można też policzyć dłużej: zjedzono 3 · 6 = 18, więc zostało 24 − 18 = 6.',
    },
    {
      id: 'maka-na-chleby',
      prompt: 'Na wypiek jednego chleba potrzeba 2/5 kg mąki. Ile mąki trzeba na 3 chleby?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '6/5 kg, czyli 1 1/5 kg' },
        { id: 'b', text: '6/15 kg' },
        { id: 'c', text: '5/6 kg' },
        { id: 'd', text: '2/15 kg' },
      ],
      correctId: 'a',
      explanation: 'Ta sama porcja trzy razy, czyli 3 · 2/5 = 6/5 kg. Pięć piątych to 1 kg, więc zostaje jeszcze 1/5 kg.',
    },
    {
      id: 'ile-ksiazki-zostalo',
      prompt: 'Ania przeczytała rano 3/7 książki, a wieczorem jeszcze 2/7. Jaka część książki została jej do przeczytania?',
      type: 'choice',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      options: [
        { id: 'a', text: '5/7' },
        { id: 'b', text: '5/14' },
        { id: 'c', text: '2/14' },
        { id: 'd', text: '2/7' },
      ],
      correctId: 'd',
      explanation:
        'Dwa kroki po kolei: 3/7 + 2/7 = 5/7 przeczytane, a cała książka to 7/7. Zostaje 7/7 − 5/7 = 2/7.',
    },
    {
      id: 'cala-trasa',
      prompt:
        'Kuba przebiegł 12 km, co stanowi 3/5 całej trasy. Ile kilometrów ma cała trasa? Wpisz samą liczbę.',
      type: 'input',
      answer: '20',
      unit: 'km',
      difficulty: { code: 'D', name: 'Dopełniające' },
      explanation:
        'Tym razem znamy część, a szukamy całości. 3/5 trasy to 12 km, więc 1/5 trasy to 12 : 3 = 4 km. Cała trasa to 5 takich kawałków: 5 · 4 = 20 km.',
    },
  ];
}

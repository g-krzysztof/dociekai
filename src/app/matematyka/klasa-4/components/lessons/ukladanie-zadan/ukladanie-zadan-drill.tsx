import type { DiagnosticTask } from '../../diagnostic-quiz';

/** Ćwiczenia: dopasowanie działania do treści i budowanie prostych zagadek liczbowych. */
export function buildDrillTasks(): DiagnosticTask[] {
  return [
    {
      id: 'ktore-pasuje-mnozenie',
      prompt: 'Które zadanie pasuje do działania 6 × 7 = ?',
      type: 'choice',
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: 'Ala ma 6 lat, Kasia ma 7 lat. O ile lat starsza jest Kasia?' },
        { id: 'b', text: 'W koszyku jest 6 jabłek, zjedliśmy 7' },
        { id: 'c', text: 'W parku jest 6 ławek, każda ma 7 miejsc. Ile jest miejsc razem?' },
        { id: 'd', text: 'Basen ma 6 torów o długości 7 m. Jaka jest szerokość basenu?' },
      ],
      correctId: 'c',
      explanation: '6 ławek po 7 miejsc to 6 równych grup — dokładnie to liczy mnożenie 6 × 7.',
    },
    {
      id: 'zagadka-cyfry',
      prompt: 'Jestem liczbą dwucyfrową. Suma moich cyfr to 9, a cyfra dziesiątek to 4. Jaką jestem liczbą?',
      type: 'input',
      answer: '45',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: 'Cyfra dziesiątek to 4, więc cyfra jedności to 9 − 4 = 5. Liczba to 45.',
    },
    {
      id: 'jakie-dzialanie-basia',
      prompt: "Zadanie: „Basia ma 3 razy więcej naklejek niż Tomek. Tomek ma 5 naklejek.” Jakie działanie znajdzie liczbę naklejek Basi?",
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '5 × 3' },
        { id: 'b', text: '5 + 3' },
        { id: 'c', text: '5 − 3' },
        { id: 'd', text: '5 : 3' },
      ],
      correctId: 'a',
      explanation: '„3 razy więcej” to mnożenie: 5 × 3 = 15 naklejek.',
    },
    {
      id: 'dobrze-ulozone',
      prompt: 'Które zdanie jest dobrze ułożonym zadaniem tekstowym — ma wszystkie dane i da się je rozwiązać?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: 'Ela ma pewną liczbę cukierków. Ile ma cukierków?' },
        { id: 'b', text: 'Autobus jechał szybko przez długi czas.' },
        { id: 'c', text: 'Kwiatek jest ładny i miło pachnie.' },
        { id: 'd', text: 'W klasie jest 24 uczniów. 10 wyjechało na wycieczkę. Ilu zostało w klasie?' },
      ],
      correctId: 'd',
      explanation: 'Tylko to zdanie ma konkretne dane liczbowe i jasne pytanie, które da się policzyć.',
    },
    {
      id: 'zagadka-o-100-wiecej',
      prompt: 'Jestem liczbą trzycyfrową. Jestem o 100 większa od 250. Jaką jestem liczbą?',
      type: 'input',
      answer: '350',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation: '250 + 100 = 350.',
    },
    {
      id: 'dwie-liczby-na-20',
      prompt: 'Chcesz ułożyć zadanie z wynikiem 20, używając mnożenia. Które dwie liczby wybierzesz?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: '5 i 3' },
        { id: 'b', text: '4 i 5' },
        { id: 'c', text: '10 i 3' },
        { id: 'd', text: '6 i 4' },
      ],
      correctId: 'b',
      explanation: '4 × 5 = 20. Pozostałe pary dają inne wyniki (15, 30, 24).',
    },
  ];
}

/** Zadanie problemowe: łańcuch zagadek liczbowych — czasem odpowiedź nie jest jedna. */
export function buildProblemTasks(): DiagnosticTask[] {
  return [
    {
      id: 'zagadka-jedynki-suma',
      prompt: 'Jestem liczbą dwucyfrową. Moja cyfra jedności to 3. Suma moich cyfr to 10. Jaką jestem liczbą?',
      type: 'input',
      answer: '73',
      explanation: 'Cyfra jedności to 3, więc cyfra dziesiątek to 10 − 3 = 7. Liczba to 73.',
    },
    {
      id: 'zagadka-razy-4',
      prompt: 'Jestem liczbą, która po pomnożeniu przez 4 daje 100. Jaką jestem liczbą?',
      type: 'input',
      answer: '25',
      explanation: '100 : 4 = 25.',
    },
    {
      id: 'zagadka-ile-rozwiazan',
      prompt: 'Zagadka: „Jestem liczbą parzystą między 40 a 50, podzielną przez 3.” Ile jest liczb pasujących do tej zagadki?',
      type: 'choice',
      options: [
        { id: 'a', text: '1' },
        { id: 'b', text: '2' },
        { id: 'c', text: '3' },
        { id: 'd', text: '0' },
      ],
      correctId: 'b',
      explanation: 'Pasują dwie liczby: 42 i 48 — obie parzyste, obie podzielne przez 3. Nie każda zagadka ma tylko jedną odpowiedź!',
    },
  ];
}

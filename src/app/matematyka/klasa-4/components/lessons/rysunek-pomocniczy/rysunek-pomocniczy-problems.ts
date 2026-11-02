import type { WordProblem } from '../../problem-unpacker';

/** Nowe pojęcie: demo z podpuchą, struktura część-całość (odejmowanie). */
export const LIBRARY_PROBLEM: WordProblem = {
  id: 'biblioteka',
  phrases: [
    { id: 'biblioteka-p1', text: 'W bibliotece szkolnej było ' },
    { id: 'biblioteka-g1', text: '145 książek', tappable: true, role: 'given', label: 'książek na starcie' },
    { id: 'biblioteka-p2', text: '. Uczniowie wypożyczyli ' },
    { id: 'biblioteka-g2', text: '58 książek', tappable: true, role: 'given', label: 'wypożyczone' },
    { id: 'biblioteka-p3', text: '. Nauczycielka bibliotekarka ma ' },
    { id: 'biblioteka-decoy', text: '34 lata', tappable: true, role: 'decoy' },
    { id: 'biblioteka-p4', text: '. ' },
    { id: 'biblioteka-q', text: 'Ile książek zostało w bibliotece?', tappable: true, role: 'question' },
  ],
  model: {
    type: 'part-whole',
    wholeLabel: 'książek na starcie',
    wholeValue: 145,
    parts: [
      { label: 'wypożyczone', value: 58 },
      { label: 'zostało', value: null },
    ],
  },
  equation: '145 − 58 = ?',
  answer: 87,
  answerLabel: 'książek',
};

/** Zadanie problemowe: struktura równych grup (mnożenie), inna podpucha. */
export const POOL_PROBLEM: WordProblem = {
  id: 'basen',
  phrases: [
    { id: 'basen-p1', text: 'Na basenie było ' },
    { id: 'basen-g1', text: '6 torów pływackich', tappable: true, role: 'given', label: 'liczba torów' },
    { id: 'basen-p2', text: ', a na każdym torze pływało po ' },
    { id: 'basen-g2', text: '8 osób', tappable: true, role: 'given', label: 'osób na tor' },
    { id: 'basen-p3', text: '. Ratownik na basenie ma ' },
    { id: 'basen-decoy', text: '27 lat', tappable: true, role: 'decoy' },
    { id: 'basen-p4', text: '. ' },
    { id: 'basen-q', text: 'Ilu pływaków było w sumie na basenie?', tappable: true, role: 'question' },
  ],
  model: {
    type: 'equal-groups',
    groupLabel: 'tor',
    unitLabel: 'pływaków',
    groups: 6,
    perGroup: 8,
    total: null,
  },
  equation: '6 × 8 = ?',
  answer: 48,
  answerLabel: 'pływaków',
};

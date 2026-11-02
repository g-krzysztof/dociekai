import type { DiagnosticTask } from '../../diagnostic-quiz';
import { FractionBarGlyph } from '../../fraction-bar-glyph';

function bar(color: string, mianownik: number, filledCount: number, label: string) {
  const filled = new Set(Array.from({ length: filledCount }, (_, i) => i));
  return (
    <div className="mx-auto max-w-xs">
      <FractionBarGlyph color={color} mianownik={mianownik} filled={filled} ariaLabel={label} />
    </div>
  );
}

/** Ćwiczenia: nazywanie licznika/mianownika osobno, czytanie zapisu z rysunku i pułapka odwróconych liczb — poziomy K/P/R/D. */
export function buildDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'tabliczka-4-6',
      prompt: 'Tabliczka ma 6 równych kwadratów, zamalowano 4. Który zapis pasuje?',
      type: 'choice',
      visual: bar(color, 6, 4, 'Tabliczka podzielona na 6 kwadratów, 4 zamalowane'),
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: '6/4' },
        { id: 'b', text: '4/6' },
        { id: 'c', text: '2/6' },
        { id: 'd', text: '4/4' },
      ],
      correctId: 'b',
      explanation: 'Mianownik (6) to wszystkie kwadraty, licznik (4) to zamalowane.',
    },
    {
      id: 'naklejki-licznik',
      prompt: 'Arkusz ma 10 naklejek. Odkleiłeś 3. Ile wynosi LICZNIK ułamka opisującego odklejone naklejki?',
      type: 'input',
      answer: '3',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: 'Licznik to liczba wziętych/odklejonych części — tu 3.',
    },
    {
      id: 'naklejki-mianownik',
      prompt: 'Ten sam arkusz — 10 naklejek, 3 odklejone. Ile wynosi MIANOWNIK tego ułamka?',
      type: 'input',
      answer: '10',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: 'Mianownik to zawsze cała grupa — tu wszystkie 10 naklejek na arkuszu.',
    },
    {
      id: 'rysunek-2-5',
      prompt: 'Który zapis pasuje do rysunku?',
      type: 'choice',
      visual: bar(color, 5, 2, 'Pasek podzielony na 5 części, 2 zamalowane'),
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '5/2' },
        { id: 'b', text: '2/2' },
        { id: 'c', text: '2/5' },
        { id: 'd', text: '3/5' },
      ],
      correctId: 'c',
      explanation: 'Zamalowane 2 z 5 równych części — to 2/5, nie odwrotnie.',
    },
    {
      id: 'szalik-niepomalowane',
      prompt: 'Basia podzieliła szalik na 7 równych pasków i pomalowała 5 z nich. Ile pasków NIE jest pomalowanych?',
      type: 'input',
      answer: '2',
      unit: 'pasków',
      difficulty: { code: 'P', name: 'Podstawowe' },
      explanation: '7 pasków w całości, 5 pomalowanych — zostają 2 niepomalowane.',
    },
    {
      id: 'dlaczego-mianownik',
      prompt: 'Ułamek opisuje, ilu zawodników drużyny ma zielone buty. Dlaczego jego mianownik zawsze jest równy liczbie WSZYSTKICH zawodników drużyny, niezależnie od tego, ile osób ma zielone buty?',
      type: 'choice',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      options: [
        { id: 'a', text: 'Bo mianownik zawsze musi być parzysty' },
        { id: 'b', text: 'Bo mianownik zależy od tego, ilu ma zielone buty' },
        { id: 'c', text: 'Bo mianownik to zawsze największa możliwa liczba' },
        { id: 'd', text: 'Bo mianownik to zawsze cała grupa/całość' },
      ],
      correctId: 'd',
      explanation: 'Mianownik zawsze opisuje całość, na tle której liczymy część — tu całą drużynę.',
    },
    {
      id: 'ogrod-cala-obsadzona',
      prompt: 'Ogród ma 20 grządek. Ułamek obsadzonych grządek to 20/20. Ile grządek NIE jest obsadzonych?',
      type: 'input',
      answer: '0',
      unit: 'grządek',
      difficulty: { code: 'D', name: 'Dopełniające' },
      explanation: 'Licznik równy mianownikowi (20/20) oznacza całość — wszystkie grządki są obsadzone.',
    },
  ];
}

/** Zadanie problemowe: jedna taca muffinek, trzy pytania — ten sam rytm co plan pokoju w `skala`. */
export function buildProblemTasks(color: string): DiagnosticTask[] {
  const visual = bar(color, 10, 7, 'Taca z 10 miejscami na muffinki w rzędzie, 7 zapełnionych');

  return [
    {
      id: 'taca-licznik',
      prompt: 'Taca ma 10 miejsc na muffinki ustawionych w rzędzie. Mama upiekła muffinki w 7 miejscach. Ile wynosi LICZNIK ułamka opisującego zapełnioną część tacy?',
      type: 'input',
      answer: '7',
      visual,
      explanation: 'Licznik to liczba zapełnionych miejsc — tu 7.',
    },
    {
      id: 'taca-mianownik',
      prompt: 'Ta sama taca — ile wynosi jej MIANOWNIK?',
      type: 'input',
      answer: '10',
      visual,
      explanation: 'Mianownik to wszystkie miejsca na tacy, puste i zapełnione razem — tu 10.',
    },
    {
      id: 'taca-zapis',
      prompt: 'Który zapis poprawnie opisuje zapełnioną część tacy?',
      type: 'choice',
      visual,
      options: [
        { id: 'a', text: '10/7' },
        { id: 'b', text: '7/3' },
        { id: 'c', text: '7/10' },
        { id: 'd', text: '3/10' },
      ],
      correctId: 'c',
      explanation: '7 zapełnionych z 10 miejsc razem — czyli 7/10.',
    },
  ];
}

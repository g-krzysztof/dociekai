import type { DiagnosticTask } from '../../diagnostic-quiz';
import { FractionBarGlyph } from '../../fraction-bar-glyph';

interface BarSpec {
  name: string;
  licznik: number;
  mianownik: number;
}

function fillSet(licznik: number): Set<number> {
  return new Set(Array.from({ length: licznik }, (_, i) => i));
}

/** Dwa paski tej samej szerokości jeden pod drugim — ta sama zamalowana długość przy różnej liczbie podziałek. */
function bars(color: string, specs: BarSpec[]) {
  return (
    <div className="mx-auto max-w-sm space-y-3">
      {specs.map((spec, i) => (
        <div key={`${spec.name}-${i}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-xs font-semibold" style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
              {spec.name}
            </span>
            <span className="font-mono text-xs font-bold tabular-nums" style={{ color }}>
              {spec.licznik}/{spec.mianownik}
            </span>
          </div>
          <FractionBarGlyph
            color={color}
            mianownik={spec.mianownik}
            filled={fillSet(spec.licznik)}
            ariaLabel={`${spec.name}: pasek podzielony na ${spec.mianownik} równych części, zamalowane ${spec.licznik}`}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Ćwiczenia: rozpoznanie mnożnika, uzupełnianie brakującej liczby, wskazanie
 * ułamka równego, skracanie krok po kroku, ułamek nieskracalny i zadanie
 * z miarką — poziomy K/P/R/D.
 */
export function buildDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'jaki-mnoznik',
      prompt: 'Ułamek 1/3 rozszerzono do 4/12. Przez jaką liczbę pomnożono licznik i mianownik?',
      type: 'choice',
      visual: bars(color, [
        { name: 'Przed', licznik: 1, mianownik: 3 },
        { name: 'Po', licznik: 4, mianownik: 12 },
      ]),
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: 'Przez 2' },
        { id: 'b', text: 'Przez 4' },
        { id: 'c', text: 'Przez 3' },
        { id: 'd', text: 'Przez 12' },
      ],
      correctId: 'b',
      explanation: '3 · 4 = 12, więc mnożnik to 4. Licznik idzie tą samą drogą: 1 · 4 = 4.',
    },
    {
      id: 'uzupelnij-licznik',
      prompt: 'Uzupełnij brakującą liczbę: 2/5 = ?/10. Wpisz sam licznik.',
      type: 'input',
      answer: '4',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: '5 · 2 = 10, więc licznik też mnożymy przez 2: 2 · 2 = 4. Zatem 2/5 = 4/10.',
    },
    {
      id: 'ktory-rowny',
      prompt: 'Który z tych ułamków jest równy 3/4?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '9/12' },
        { id: 'b', text: '4/5' },
        { id: 'c', text: '6/12' },
        { id: 'd', text: '3/8' },
      ],
      correctId: 'a',
      explanation: '3/4 rozszerzone przez 3 to 9/12 — licznik i mianownik pomnożone przez tę samą liczbę.',
    },
    {
      id: 'skroc-przez-piec',
      prompt: 'Skróć ułamek 10/15 przez 5 i wpisz licznik, który wtedy powstanie.',
      type: 'input',
      answer: '2',
      difficulty: { code: 'P', name: 'Podstawowe' },
      explanation: '10 : 5 = 2 i 15 : 5 = 3, więc 10/15 = 2/3.',
    },
    {
      id: 'nieskracalny',
      prompt: 'Którego z tych ułamków NIE da się już skrócić?',
      type: 'choice',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      options: [
        { id: 'a', text: '6/9' },
        { id: 'b', text: '8/12' },
        { id: 'c', text: '7/10' },
        { id: 'd', text: '10/15' },
      ],
      correctId: 'c',
      explanation: '7 i 10 nie mają wspólnego dzielnika większego od 1. Pozostałe skrócisz: 6/9 przez 3, 8/12 przez 4, 10/15 przez 5.',
    },
    {
      id: 'postac-nieskracalna',
      prompt: 'Doprowadź ułamek 18/24 do postaci nieskracalnej i wpisz jej mianownik.',
      type: 'input',
      answer: '4',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation: '18 i 24 dzielą się przez 6: 18 : 6 = 3, 24 : 6 = 4. Zostaje 3/4 — mianownik 4.',
    },
    {
      id: 'miarka-cukru',
      prompt:
        'Przepis wymaga 2/3 szklanki cukru, a jedyna miarka w domu ma kreski co jedną dziewiątą szklanki. Do której kreski trzeba nasypać cukier?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: 'Do 3. kreski' },
        { id: 'b', text: 'Do 9. kreski' },
        { id: 'c', text: 'Do 2. kreski' },
        { id: 'd', text: 'Do 6. kreski' },
      ],
      correctId: 'd',
      explanation: '3 · 3 = 9, więc 2/3 rozszerzamy przez 3: 2 · 3 = 6. Ta sama ilość to 6/9 szklanki — szósta kreska.',
    },
  ];
}

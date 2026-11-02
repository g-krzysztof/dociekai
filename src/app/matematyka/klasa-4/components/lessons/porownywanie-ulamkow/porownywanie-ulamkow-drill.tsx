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

/** Zestaw pasków jeden pod drugim — ta sama szerokość całości, więc długości da się porównać wzrokiem. */
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
 * Ćwiczenia: obie reguły osobno, potem bez rysunku, na koniec porównanie
 * trzech ułamków naraz i zadanie tekstowe — poziomy K/P/R/D.
 */
export function buildDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'ten-sam-mianownik-paski',
      prompt: 'Oba paski podzielono na 6 równych części. Który ułamek jest większy?',
      type: 'choice',
      visual: bars(color, [
        { name: 'Pasek A', licznik: 2, mianownik: 6 },
        { name: 'Pasek B', licznik: 5, mianownik: 6 },
      ]),
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: '2/6, bo 2 to mniejsza liczba' },
        { id: 'b', text: 'Są równe' },
        { id: 'c', text: '5/6, bo to więcej takich samych części' },
        { id: 'd', text: 'Nie da się porównać' },
      ],
      correctId: 'c',
      explanation: 'Mianowniki są takie same, więc części są jednakowej wielkości — decyduje licznik: 5 części to więcej niż 2.',
    },
    {
      id: 'licznik-wiekszego',
      prompt: 'Ułamki 3/7 i 6/7 mają ten sam mianownik. Wpisz licznik tego z nich, który jest większy.',
      type: 'input',
      answer: '6',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: 'Przy tym samym mianowniku większy jest ten ułamek, który ma większy licznik — czyli 6/7.',
    },
    {
      id: 'ten-sam-licznik-paski',
      prompt: 'Oba paski to ta sama całość, ale pocięta inaczej. Który ułamek jest większy?',
      type: 'choice',
      visual: bars(color, [
        { name: 'Pasek A', licznik: 1, mianownik: 4 },
        { name: 'Pasek B', licznik: 1, mianownik: 9 },
      ]),
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '1/4, bo mniej części to większe części' },
        { id: 'b', text: '1/9, bo 9 to większa liczba' },
        { id: 'c', text: 'Są równe, bo oba mają licznik 1' },
        { id: 'd', text: '1/9, bo ma więcej podziałek' },
      ],
      correctId: 'a',
      explanation: 'Liczniki są takie same, więc decyduje mianownik — im mniejszy mianownik, tym większe kawałki. Jedna czwarta jest większa od jednej dziewiątej.',
    },
    {
      id: 'bez-rysunku',
      prompt: 'Bez rysunku: który ułamek jest większy — 3/5 czy 3/10?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '3/10, bo 10 to więcej niż 5' },
        { id: 'b', text: 'Są równe' },
        { id: 'c', text: 'Nie da się stwierdzić bez rysunku' },
        { id: 'd', text: '3/5, bo piąte części są większe od dziesiątych' },
      ],
      correctId: 'd',
      explanation: 'Ten sam licznik (3), więc porównujemy mianowniki: 5 dzieli całość na większe kawałki niż 10, dlatego 3/5 > 3/10.',
    },
    {
      id: 'trzy-ulamki',
      prompt: 'Który z tych trzech ułamków jest największy: 5/12, 5/9, 5/20?',
      type: 'choice',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      options: [
        { id: 'a', text: '5/20' },
        { id: 'b', text: '5/9' },
        { id: 'c', text: '5/12' },
        { id: 'd', text: 'Wszystkie są równe' },
      ],
      correctId: 'b',
      explanation: 'Wszystkie mają licznik 5, więc wygrywa ten z najmniejszym mianownikiem — 5/9.',
    },
    {
      id: 'srodkowy-licznik',
      prompt: 'Ustaw rosnąco ułamki 7/11, 2/11, 4/11 i wpisz licznik tego, który stanie w środku.',
      type: 'input',
      answer: '4',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation: 'Mianowniki są takie same, więc kolejność wyznaczają liczniki: 2/11 < 4/11 < 7/11 — w środku stoi 4/11.',
    },
    {
      id: 'zadanie-soki',
      prompt:
        'Dwie takie same butelki soku rozlano do szklanek: pierwszą na 4 równe szklanki, drugą na 6 równych szklanek. Zosia wypiła 3 szklanki z pierwszej butelki, Igor 3 szklanki z drugiej. Kto wypił więcej soku?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: 'Igor, bo jego butelkę podzielono na więcej szklanek' },
        { id: 'b', text: 'Wypili tyle samo, bo oboje wypili po 3 szklanki' },
        { id: 'c', text: 'Nie da się porównać, bo szklanki są różne' },
        { id: 'd', text: 'Zosia, bo 3/4 to więcej niż 3/6' },
      ],
      correctId: 'd',
      explanation:
        'Zosia wypiła 3/4 butelki, Igor 3/6. Ten sam licznik, więc decyduje mianownik: butelka podzielona na 4 daje większe szklanki niż podzielona na 6 — 3/4 > 3/6.',
    },
  ];
}

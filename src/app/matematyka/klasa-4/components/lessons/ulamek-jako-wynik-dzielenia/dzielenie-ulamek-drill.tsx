import type { DiagnosticTask } from '../../diagnostic-quiz';
import { FractionBarGlyph } from '../../fraction-bar-glyph';

interface ShareSpec {
  items: number;
  cut: number;
  perPerson: number;
  itemsLabel: string;
}

/** Rząd pokrojonych przedmiotów + porcja jednej osoby pod spodem — ten sam rysunek co w przykładach. */
function shareVisual(color: string, { items, cut, perPerson, itemsLabel }: ShareSpec) {
  const fill = (count: number) => new Set(Array.from({ length: count }, (_, i) => i));
  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div>
        <p className="mb-1 text-xs font-semibold" style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
          {itemsLabel}
        </p>
        <div className="space-y-3">
          {Array.from({ length: items }, (_, i) => (
            <FractionBarGlyph
              key={`src-${i}`}
              color={color}
              mianownik={cut}
              filled={fill(cut)}
              ariaLabel={`Przedmiot ${i + 1} pokrojony na ${cut} równych części`}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold" style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
          Porcja jednej osoby
        </p>
        <div className="space-y-3">
          {Array.from({ length: items }, (_, i) => (
            <FractionBarGlyph
              key={`share-${i}`}
              color={color}
              mianownik={cut}
              filled={fill(perPerson)}
              ariaLabel={`Z przedmiotu ${i + 1}: ${perPerson} z ${cut} części`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Ćwiczenia: zapis dzielenia jako ułamka i odwrotnie, odczyt porcji
 * z rysunku, przypadek wychodzący równo oraz zadania osadzone w treści —
 * poziomy K/P/R/D.
 */
export function buildDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'zapisz-jako-ulamek',
      prompt: 'Jak zapisać wynik dzielenia 5 : 8 w postaci ułamka?',
      type: 'choice',
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: '8/5' },
        { id: 'b', text: '5/8' },
        { id: 'c', text: '5/13' },
        { id: 'd', text: '13/8' },
      ],
      correctId: 'b',
      explanation: 'Dzielna trafia do licznika, dzielnik do mianownika: 5 : 8 = 5/8. Kreska ułamkowa zastępuje znak dzielenia.',
    },
    {
      id: 'odczytaj-porcje',
      prompt: 'Dwa placki podzielono między 3 osoby. Ile placka dostała jedna osoba? Odczytaj z rysunku.',
      type: 'choice',
      visual: shareVisual(color, { items: 2, cut: 3, perPerson: 1, itemsLabel: '2 placki, każdy pokrojony na 3 części' }),
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: '3/2 placka' },
        { id: 'b', text: '1/3 placka' },
        { id: 'c', text: '2/3 placka' },
        { id: 'd', text: '1/2 placka' },
      ],
      correctId: 'c',
      explanation: 'Każda osoba dostaje po jednym kawałku z obu placków, czyli 2 kawałki po jednej trzeciej: 2 : 3 = 2/3.',
    },
    {
      id: 'ile-na-osobe-input',
      prompt: 'Cztery jednakowe pizze dzielimy między 5 osób. Ile piątych części pizzy dostanie każda osoba? Wpisz sam licznik.',
      type: 'input',
      answer: '4',
      difficulty: { code: 'P', name: 'Podstawowe' },
      explanation: '4 : 5 = 4/5. Każda pizza kroi się na 5 części, każdy bierze po jednym kawałku z każdej pizzy — razem 4 piąte.',
    },
    {
      id: 'wychodzi-rowno',
      prompt: 'Ile wynosi 6 : 3 zapisane jako ułamek, a ile po skróceniu?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '6/3, a po skróceniu 2' },
        { id: 'b', text: '3/6, a po skróceniu 1/2' },
        { id: 'c', text: '6/3, a po skróceniu 3' },
        { id: 'd', text: '6/3 i skrócić się nie da' },
      ],
      correctId: 'a',
      explanation: '6 : 3 = 6/3, a 6 : 3 = 2 bez reszty, więc ten ułamek to po prostu liczba 2. Ułamek zapisuje każde dzielenie, także to wychodzące równo.',
    },
    {
      id: 'z-ulamka-na-dzielenie',
      prompt: 'Ułamek 7/9 to zapis wyniku jakiego dzielenia?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '9 : 7' },
        { id: 'b', text: '7 + 9' },
        { id: 'c', text: '9 − 7' },
        { id: 'd', text: '7 : 9' },
      ],
      correctId: 'd',
      explanation: 'Licznik jest dzielną, a mianownik dzielnikiem, więc 7/9 to wynik dzielenia 7 : 9 — na przykład 7 ciast między 9 osób.',
    },
    {
      id: 'niewlasciwy-z-dzielenia',
      prompt:
        'Dziewięć metrów wstążki dzielimy równo na 4 kawałki. Ile ćwiartek metra przypada na jeden kawałek? Wpisz samą liczbę.',
      type: 'input',
      answer: '9',
      unit: 'ćwiartek metra',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation:
        '9 : 4 = 9/4, czyli dziewięć ćwiartek metra. A ponieważ 9 : 4 = 2 reszty 1, ten sam kawałek to 2 1/4 metra — reszta nie znika, zamienia się w ćwiartkę.',
    },
    {
      id: 'kto-dostal-wiecej',
      prompt:
        'W jednej klasie 3 ciasta podzielono między 4 osoby, a w drugiej 5 ciast między 8 osób. Gdzie jedna osoba dostała większy kawałek?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: 'W drugiej klasie, bo było więcej ciast' },
        { id: 'b', text: 'Wszędzie tyle samo' },
        { id: 'c', text: 'W pierwszej klasie' },
        { id: 'd', text: 'Nie da się tego porównać' },
      ],
      correctId: 'c',
      explanation:
        'Pierwsza klasa: 3 : 4 = 3/4 = 6/8. Druga: 5 : 8 = 5/8. Po sprowadzeniu do ósmych części widać, że 6/8 to więcej niż 5/8 — większy kawałek dostała pierwsza klasa.',
    },
  ];
}

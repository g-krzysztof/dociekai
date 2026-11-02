import type { DiagnosticTask } from '../../diagnostic-quiz';
import { PolygonPerimeterGlyph, RectPerimeterGlyph } from './perimeter-glyph';

/** Ćwiczenia: obwód jako suma boków — od prostego prostokąta po nieregularny wielokąt w kształcie litery L. */
export function buildDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'obwod-prostokata-6-3',
      prompt: 'Oblicz obwód prostokąta o bokach 6 cm i 3 cm.',
      type: 'input',
      answer: '18',
      unit: 'cm',
      difficulty: { code: 'K', name: 'Konieczne' },
      visual: <RectPerimeterGlyph widthValue={6} heightValue={3} unit="cm" color={color} />,
      explanation: 'Obwód to suma wszystkich boków: 6 + 3 + 6 + 3 = 18 cm. Krócej: 2 × (6 + 3) = 18 cm.',
    },
    {
      id: 'obwod-kwadratu-9',
      prompt: 'Oblicz obwód kwadratu o boku 9 cm.',
      type: 'input',
      answer: '36',
      unit: 'cm',
      difficulty: { code: 'K', name: 'Konieczne' },
      visual: <RectPerimeterGlyph widthValue={9} heightValue={9} unit="cm" color={color} />,
      explanation: 'Kwadrat ma 4 równe boki, więc wystarczy 4 × 9 = 36 cm.',
    },
    {
      id: 'obwod-nieregularnego-czworokata',
      prompt: 'Ten czworokąt ma boki 4 cm, 5 cm, 3 cm i 6 cm. Ile wynosi jego obwód?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      visual: (
        <PolygonPerimeterGlyph
          points={[
            { x: 20, y: 90 },
            { x: 25, y: 30 },
            { x: 90, y: 20 },
            { x: 140, y: 70 },
          ]}
          sideLengths={[4, 5, 3, 6]}
          unit="cm"
          color={color}
        />
      ),
      options: [
        { id: 'a', text: '16 cm' },
        { id: 'b', text: '18 cm' },
        { id: 'c', text: '20 cm' },
        { id: 'd', text: '15 cm' },
      ],
      correctId: 'b',
      explanation:
        'Dla dowolnego wielokąta obwód to po prostu suma długości wszystkich jego boków: 4 + 5 + 3 + 6 = 18 cm.',
    },
    {
      id: 'wzor-prostokata',
      prompt: 'Który sposób poprawnie liczy obwód prostokąta o bokach a i b?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: 'a × b' },
        { id: 'b', text: 'a + b' },
        { id: 'c', text: '2 × (a + b)' },
        { id: 'd', text: '4 × a' },
      ],
      correctId: 'c',
      explanation:
        'Prostokąt ma dwie pary równych boków (a i b), więc obwód to dwa razy suma jednego boku z każdej pary: 2 × (a + b).',
    },
    {
      id: 'boisko-ogrodzenie',
      prompt: 'Prostokątne boisko ma 25 m długości i 12 m szerokości. Ile metrów siatki potrzeba, żeby ogrodzić je dookoła?',
      type: 'input',
      answer: '74',
      unit: 'm',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      visual: <RectPerimeterGlyph widthValue={25} heightValue={12} unit="m" color={color} />,
      explanation: 'Obwód boiska: 2 × (25 + 12) = 2 × 37 = 74 m siatki.',
    },
    {
      id: 'dzialka-bok-z-obwodu',
      prompt: 'Kwadratowa działka ma obwód 48 m. Ile metrów ma jeden jej bok?',
      type: 'choice',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      options: [
        { id: 'a', text: '12 m' },
        { id: 'b', text: '24 m' },
        { id: 'c', text: '6 m' },
        { id: 'd', text: '16 m' },
      ],
      correctId: 'a',
      explanation: 'Obwód kwadratu to 4 × bok, więc bok to 48 : 4 = 12 m.',
    },
    {
      id: 'plac-w-ksztalcie-l',
      prompt:
        'Plac zabaw w kształcie litery L ma po kolei, dookoła, boki: 6 m, 4 m, 3 m, 2 m, 3 m i 6 m. Jaki jest jego obwód?',
      type: 'input',
      answer: '24',
      unit: 'm',
      difficulty: { code: 'D', name: 'Dopełniające' },
      visual: (
        <PolygonPerimeterGlyph
          points={[
            { x: 30, y: 90 },
            { x: 30, y: 20 },
            { x: 90, y: 20 },
            { x: 90, y: 50 },
            { x: 120, y: 50 },
            { x: 120, y: 90 },
          ]}
          sideLengths={[6, 4, 3, 2, 3, 6]}
          unit="m"
          color={color}
        />
      ),
      explanation:
        'Nawet dla nietypowego kształtu zasada się nie zmienia — dodajesz długości wszystkich boków po kolei: 6 + 4 + 3 + 2 + 3 + 6 = 24 m.',
    },
  ];
}

import type { DiagnosticTask } from '../../diagnostic-quiz';
import { RectangleGlyph } from './rectangle-glyph';

/** Ćwiczenia: właściwości prostokąta i kwadratu — kąty proste, boki naprzeciwległe, kiedy prostokąt jest kwadratem. */
export function buildDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'ile-katow-prostych',
      prompt: 'Ile kątów prostych ma ten prostokąt?',
      type: 'input',
      answer: '4',
      difficulty: { code: 'K', name: 'Konieczne' },
      visual: <RectangleGlyph widthCells={6} heightCells={3} color={color} showTicks={false} />,
      explanation: 'Prostokąt ma zawsze dokładnie 4 kąty proste — po jednym w każdym rogu.',
    },
    {
      id: 'boki-naprzeciwlegle',
      prompt: 'Boki naprzeciwległe prostokąta (te po dwóch przeciwnych stronach) są zawsze...',
      type: 'choice',
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: 'różnej długości' },
        { id: 'b', text: 'prostopadłe do siebie' },
        { id: 'c', text: 'równe i równoległe' },
        { id: 'd', text: 'zakrzywione' },
      ],
      correctId: 'c',
      explanation: 'W prostokącie boki naprzeciwległe zawsze są równej długości i równoległe do siebie.',
    },
    {
      id: 'nazwa-najdokladniejsza',
      prompt: 'Ta figura ma 4 kąty proste i wszystkie boki równe. Jak nazwać ją najdokładniej?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      visual: <RectangleGlyph widthCells={4} heightCells={4} color={color} />,
      options: [
        { id: 'a', text: 'Prostokąt' },
        { id: 'b', text: 'Romb' },
        { id: 'c', text: 'Kwadrat' },
        { id: 'd', text: 'Trapez' },
      ],
      correctId: 'c',
      explanation:
        'Ta figura jest technicznie też prostokątem, ale skoro wszystkie boki są równe, najdokładniejsza nazwa to kwadrat.',
    },
    {
      id: 'kazdy-kwadrat-prostokatem',
      prompt: 'Czy każdy kwadrat jest prostokątem?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: 'Tak, zawsze' },
        { id: 'b', text: 'Nie, nigdy' },
        { id: 'c', text: 'Tylko czasami' },
        { id: 'd', text: 'Tylko gdy jest duży' },
      ],
      correctId: 'a',
      explanation:
        'Kwadrat ma 4 kąty proste i boki naprzeciwległe równe — spełnia wszystkie warunki prostokąta, więc zawsze nim jest.',
    },
    {
      id: 'kazdy-prostokat-kwadratem',
      prompt: 'Czy każdy prostokąt jest kwadratem?',
      type: 'choice',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      options: [
        { id: 'a', text: 'Tak, zawsze' },
        { id: 'b', text: 'Nie — tylko gdy wszystkie boki są równe' },
        { id: 'c', text: 'Nie, nigdy' },
        { id: 'd', text: 'Tylko gdy jest mały' },
      ],
      correctId: 'b',
      explanation: 'Prostokąt staje się kwadratem dopiero wtedy, gdy dodatkowo wszystkie jego boki są równe.',
    },
    {
      id: 'bok-naprzeciwlegly',
      prompt: 'Bok naprzeciwko (równoległy) ma 8 cm. Ile centymetrów ma bok oznaczony znakiem zapytania?',
      type: 'input',
      answer: '8',
      unit: 'cm',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      visual: (
        <RectangleGlyph widthCells={7} heightCells={4} color={color} showTicks={false} topLabel="8 cm" bottomLabel="?" />
      ),
      explanation: 'W prostokącie boki naprzeciwległe są zawsze równe, więc szukany bok też ma 8 cm.',
    },
    {
      id: 'sasiednie-boki',
      prompt:
        'Czworokąt ma cztery kąty proste. Jeden bok ma 6 cm, a sąsiedni (przy tym samym rogu) bok ma 4 cm. Czy to może być kwadrat?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: 'Tak' },
        { id: 'b', text: 'Nie, bo sąsiednie boki są różnej długości' },
        { id: 'c', text: 'Nie, bo nie ma kątów prostych' },
        { id: 'd', text: 'Brakuje informacji' },
      ],
      correctId: 'b',
      explanation:
        'W kwadracie wszystkie boki są równe — również sąsiednie. Skoro sąsiednie boki mają 6 cm i 4 cm, to nie jest kwadrat (choć wciąż może być prostokątem).',
    },
  ];
}

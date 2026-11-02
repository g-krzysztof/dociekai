import type { DiagnosticTask } from '../../diagnostic-quiz';
import { CircleFigure } from '../../circle-figure';
import { buildCircleDiagram } from '../../../lib/circle';

const DIAGRAM = buildCircleDiagram({ x: 110, y: 110 }, 78);
const VIEW_SIZE = 220;

/** Trzy nazwane literami odcinki (A = promień, B = średnica, C = cięciwa nie przez środek) do zadań identyfikacyjnych. */
function LabeledSegmentsGlyph({ color }: { color: string }) {
  const { center, radiusEnd, diameterA, diameterB, chordA, chordB } = DIAGRAM;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  return (
    <svg viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`} className="mx-auto h-auto w-full max-w-[320px]" role="img" aria-label="Koło z trzema odcinkami oznaczonymi literami A, B i C">
      <circle cx={center.x} cy={center.y} r={DIAGRAM.radius} fill="none" stroke={`${color}55`} strokeWidth={2.5} />
      <line x1={chordA.x} y1={chordA.y} x2={chordB.x} y2={chordB.y} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <text x={chordB.x - 14} y={chordB.y + 5} textAnchor="middle" style={{ fontSize: 19, fontWeight: 800 }} fill={textColor}>C</text>
      <line x1={diameterA.x} y1={diameterA.y} x2={diameterB.x} y2={diameterB.y} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <text x={diameterA.x + 6} y={diameterA.y - 10} textAnchor="middle" style={{ fontSize: 19, fontWeight: 800 }} fill={textColor}>B</text>
      <line x1={center.x} y1={center.y} x2={radiusEnd.x} y2={radiusEnd.y} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <text x={radiusEnd.x + 16} y={radiusEnd.y + 5} textAnchor="middle" style={{ fontSize: 19, fontWeight: 800 }} fill={textColor}>A</text>
      <circle cx={center.x} cy={center.y} r={5} fill={color} />
    </svg>
  );
}

/** Ćwiczenia: promień ↔ średnica (2 × promień) i rozpoznawanie promienia, średnicy oraz cięciwy na rysunku. */
export function buildDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'promien-do-srednicy',
      prompt: 'Promień koła to 6 cm. Ile wynosi jego średnica?',
      type: 'input',
      answer: '12',
      unit: 'cm',
      difficulty: { code: 'K', name: 'Konieczne' },
      visual: (
        <CircleFigure
          color={color}
          diagram={DIAGRAM}
          parts={{ srodek: { shown: true, active: false }, promien: { shown: true, active: true, label: '6 cm' }, srednica: { shown: true, active: false } }}
          size={240}
          ariaLabel="Koło z zaznaczonym promieniem 6 cm"
        />
      ),
      explanation: 'Średnica to zawsze 2 × promień: 2 × 6 = 12 cm.',
    },
    {
      id: 'srednica-do-promienia',
      prompt: 'Średnica koła to 18 cm. Ile wynosi jego promień?',
      type: 'input',
      answer: '9',
      unit: 'cm',
      difficulty: { code: 'K', name: 'Konieczne' },
      visual: (
        <CircleFigure
          color={color}
          diagram={DIAGRAM}
          parts={{ srodek: { shown: true, active: false }, promien: { shown: true, active: false }, srednica: { shown: true, active: true, label: '18 cm' } }}
          size={240}
          ariaLabel="Koło z zaznaczoną średnicą 18 cm"
        />
      ),
      explanation: 'Promień to połowa średnicy: 18 : 2 = 9 cm.',
    },
    {
      id: 'ktory-to-promien',
      prompt: 'Który odcinek na rysunku to promień?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      visual: <LabeledSegmentsGlyph color={color} />,
      options: [
        { id: 'a', text: 'Odcinek A' },
        { id: 'b', text: 'Odcinek B' },
        { id: 'c', text: 'Odcinek C' },
        { id: 'd', text: 'Wszystkie trzy są promieniami' },
      ],
      correctId: 'a',
      explanation: 'Promień łączy środek z okręgiem — to odcinek A. B przechodzi przez środek (to średnica), C nie zaczyna się w środku (to cięciwa).',
    },
    {
      id: 'ktory-to-cieciwa',
      prompt: 'Który odcinek na tym samym rysunku to cięciwa, która NIE jest średnicą?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      visual: <LabeledSegmentsGlyph color={color} />,
      options: [
        { id: 'a', text: 'Odcinek B' },
        { id: 'b', text: 'Odcinek A' },
        { id: 'c', text: 'Odcinek C' },
        { id: 'd', text: 'Żaden z nich' },
      ],
      correctId: 'c',
      explanation: 'C łączy dwa punkty okręgu, ale nie przechodzi przez środek — to cięciwa. B też jest cięciwą, ale szczególną: przechodzi przez środek, więc to średnica.',
    },
    {
      id: 'prawda-o-srednicy',
      prompt: 'Co jest zawsze prawdą o średnicy koła?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: 'Jest krótsza niż promień' },
        { id: 'b', text: 'Jest dwa razy dłuższa niż promień' },
        { id: 'c', text: 'Nie przechodzi przez środek' },
        { id: 'd', text: 'To inna nazwa promienia' },
      ],
      correctId: 'b',
      explanation: 'Średnica składa się z dwóch promieni ułożonych w linii prostej przez środek, więc zawsze jest 2 razy dłuższa niż promień.',
    },
    {
      id: 'kolo-rowerowe',
      prompt: 'Koło rowerowe ma promień 30 cm. Jaką średnicę poda producent na opakowaniu opony?',
      type: 'input',
      answer: '60',
      unit: 'cm',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      visual: (
        <CircleFigure
          color={color}
          diagram={DIAGRAM}
          parts={{ srodek: { shown: true, active: false }, promien: { shown: true, active: true, label: '30 cm' }, srednica: { shown: true, active: false } }}
          size={240}
          ariaLabel="Koło rowerowe z zaznaczonym promieniem 30 cm"
        />
      ),
      explanation: '2 × 30 cm = 60 cm — tyle wynosi średnica koła.',
    },
    {
      id: 'okragly-stol',
      prompt: 'Okrągły stół ma średnicę 140 cm. Ile metrów wynosi jego promień?',
      type: 'input',
      answer: '0.7',
      unit: 'm',
      difficulty: { code: 'D', name: 'Dopełniające' },
      explanation: 'Promień to połowa średnicy: 140 cm : 2 = 70 cm, czyli 0,7 m.',
    },
  ];
}

/** Zadanie problemowe: czy okrągły stół przejdzie przez drzwi — jedna historia, dwa różne stoły, ta sama zasada (średnica = 2 × promień). */
export function buildProblemTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'stol-promien',
      prompt: 'Duży, okrągły stół ma promień 55 cm. Jaka jest jego średnica — najszersze miejsce, które musi zmieścić się w drzwiach?',
      type: 'input',
      answer: '110',
      unit: 'cm',
      visual: (
        <CircleFigure
          color={color}
          diagram={DIAGRAM}
          fill
          parts={{ srodek: { shown: true, active: false }, promien: { shown: true, active: true, label: '55 cm' } }}
          size={240}
          ariaLabel="Blat okrągłego stołu z zaznaczonym promieniem 55 cm"
        />
      ),
      explanation: '2 × 55 cm = 110 cm.',
    },
    {
      id: 'stol-drzwi',
      prompt: 'Drzwi do salonu mają szerokość 100 cm. Czy ten stół (średnica 110 cm) przejdzie przez nie bez przechylania?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Tak, zmieści się dokładnie' },
        { id: 'b', text: 'Nie — jest o 10 cm za szeroki' },
        { id: 'c', text: 'Tak, bo promień jest mniejszy niż drzwi' },
        { id: 'd', text: 'Nie da się tego sprawdzić bez ważenia stołu' },
      ],
      correctId: 'b',
      explanation: 'Średnica stołu (110 cm) jest większa niż szerokość drzwi (100 cm) — różnica to 110 − 100 = 10 cm, więc bez przechylenia się nie zmieści.',
    },
    {
      id: 'stolik-mniejszy',
      prompt: 'Mniejszy stolik kawowy ma promień 40 cm. Czy przejdzie przez te same drzwi (100 cm)?',
      type: 'choice',
      visual: (
        <CircleFigure
          color={color}
          diagram={DIAGRAM}
          fill
          parts={{ srodek: { shown: true, active: false }, promien: { shown: true, active: true, label: '40 cm' } }}
          size={240}
          ariaLabel="Blat mniejszego stolika z zaznaczonym promieniem 40 cm"
        />
      ),
      options: [
        { id: 'a', text: 'Nie, bo każdy okrągły mebel utyka w drzwiach' },
        { id: 'b', text: 'Nie — promień jest za duży' },
        { id: 'c', text: 'Tak — jego średnica to 80 cm, mniej niż 100 cm' },
        { id: 'd', text: 'Trzeba znać wysokość stolika, żeby to sprawdzić' },
      ],
      correctId: 'c',
      explanation: '2 × 40 cm = 80 cm średnicy — to mniej niż 100 cm szerokości drzwi, więc stolik przejdzie swobodnie.',
    },
  ];
}

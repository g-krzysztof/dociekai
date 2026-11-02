import type { DiagnosticTask } from '../../diagnostic-quiz';

function RoomPlanGlyph({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  return (
    <svg viewBox="0 0 160 130" className="mx-auto h-auto w-full max-w-[220px]" role="img" aria-label="Plan pokoju: 8 cm na 6 cm, z łóżkiem o długości 3 cm">
      <rect x={20} y={20} width={120} height={90} fill={`${color}18`} stroke={color} strokeWidth={2.5} />
      <rect x={30} y={30} width={45} height={20} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="3 2" />
      <text x={52} y={44} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700 }} fill={textColor}>łóżko: 3 cm</text>
      <text x={80} y={15} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700 }} fill={textColor}>8 cm</text>
      <text x={8} y={68} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700 }} fill={textColor} transform="rotate(-90 8 68)">6 cm</text>
    </svg>
  );
}

/** Ćwiczenia: przeliczanie w obie strony, w tym skala powiększająca (2:1) jako trudniejszy wyjątek od reguły „mnóż, żeby powiększyć". */
export function buildDrillTasks(): DiagnosticTask[] {
  return [
    {
      id: 'pokoj-1-100',
      prompt: 'Skala planu to 1:100. Na planie pokój ma 6 cm długości. Ile wynosi jego prawdziwa długość?',
      type: 'input',
      answer: '600',
      unit: 'cm',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: '6 cm × 100 = 600 cm.',
    },
    {
      id: 'mapa-1-50000',
      prompt: 'Skala mapy to 1:50000. Prawdziwa odległość to 2 km. Ile centymetrów to na mapie?',
      type: 'input',
      answer: '4',
      unit: 'cm',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: '2 km to 200 000 cm. 200 000 : 50 000 = 4 cm.',
    },
    {
      id: 'znaczenie-skali',
      prompt: 'Skala 1:10 oznacza, że rysunek jest...',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '10 razy większy niż w rzeczywistości' },
        { id: 'b', text: 'taki sam jak w rzeczywistości' },
        { id: 'c', text: '10 razy mniejszy niż w rzeczywistości' },
        { id: 'd', text: 'nieznanej wielkości' },
      ],
      correctId: 'c',
      explanation: 'Druga liczba skali mówi, ile razy pomniejszono rzeczywistość — tu: 10 razy.',
    },
    {
      id: 'najwiekszy-rysunek',
      prompt: 'Który zapis skali da NAJWIĘKSZY rysunek tego samego przedmiotu?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '1:10' },
        { id: 'b', text: '1:100' },
        { id: 'c', text: '1:500' },
        { id: 'd', text: '1:1000' },
      ],
      correctId: 'a',
      explanation: 'Im mniejsza druga liczba, tym słabsze pomniejszenie — 1:10 pomniejsza najmniej ze wszystkich.',
    },
    {
      id: 'model-samochodu-1-18',
      prompt: 'Model samochodu jest w skali 1:18. Prawdziwy samochód ma 4,5 m długości. Ile centymetrów długości ma model?',
      type: 'input',
      answer: '25',
      unit: 'cm',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation: '4,5 m to 450 cm. 450 : 18 = 25 cm.',
    },
    {
      id: 'odleglosc-szkol',
      prompt: 'Na planie miasta w skali 1:20000 odległość między dwiema szkołami to 8 cm. Jaka jest prawdziwa odległość?',
      type: 'choice',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      options: [
        { id: 'a', text: '160 m' },
        { id: 'b', text: '16 000 m' },
        { id: 'c', text: '16 m' },
        { id: 'd', text: '1600 m' },
      ],
      correctId: 'd',
      explanation: '8 cm × 20 000 = 160 000 cm = 1600 m.',
    },
    {
      id: 'skala-powiekszajaca',
      prompt: 'Rysunek techniczny śrubki jest w skali 2:1 (dwa razy powiększony). Na rysunku śrubka ma 6 cm długości. Ile milimetrów ma naprawdę?',
      type: 'input',
      answer: '30',
      unit: 'mm',
      difficulty: { code: 'D', name: 'Dopełniające' },
      explanation: 'Skala 2:1 powiększa, więc rzeczywistość jest mniejsza niż rysunek: 6 cm : 2 = 3 cm = 30 mm.',
    },
  ];
}

/** Zadanie problemowe: odczytanie prawdziwych wymiarów z jednego, konkretnego planu pokoju. */
export function buildProblemTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'pokoj-dlugosc',
      prompt: 'Plan pokoju jest w skali 1:50. Długość pokoju na rysunku to 8 cm. Jaka jest prawdziwa długość pokoju, w metrach?',
      type: 'input',
      answer: '4',
      unit: 'm',
      visual: <RoomPlanGlyph color={color} />,
      explanation: '8 cm × 50 = 400 cm = 4 m.',
    },
    {
      id: 'pokoj-szerokosc',
      prompt: 'Szerokość tego samego pokoju na rysunku to 6 cm. Jaka jest jej prawdziwa wartość, w metrach?',
      type: 'input',
      answer: '3',
      unit: 'm',
      visual: <RoomPlanGlyph color={color} />,
      explanation: '6 cm × 50 = 300 cm = 3 m.',
    },
    {
      id: 'lozko-sensownosc',
      prompt: 'Łóżko na tym samym planie ma na rysunku 3 cm długości. Jaka prawdziwa długość ma najwięcej sensu dla łóżka?',
      type: 'choice',
      visual: <RoomPlanGlyph color={color} />,
      options: [
        { id: 'a', text: '30 cm — za krótkie na łóżko' },
        { id: 'b', text: '150 cm' },
        { id: 'c', text: '1500 cm' },
        { id: 'd', text: '3 m' },
      ],
      correctId: 'b',
      explanation: '3 cm × 50 = 150 cm — to sensowna długość łóżka. 30 cm to za mało, a 1500 cm i 3 m to o wiele za dużo.',
    },
  ];
}

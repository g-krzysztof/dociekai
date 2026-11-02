import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'ile-miejsc-zl',
    prompt: 'Grosz to setna część złotego (1 zł = 100 gr). Ile miejsc po przecinku ma kwota zapisana w złotych?',
    type: 'choice',
    options: [
      { id: 'a', text: '1 miejsce' },
      { id: 'b', text: '2 miejsca' },
      { id: 'c', text: '3 miejsca' },
    ],
    correctId: 'b',
    explanation: '100 ma dwa zera, więc grosze zajmują dwa rzędy po przecinku — dziesiąte i setne.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'm-cm-425',
    prompt: 'Zapisz 4 m 25 cm w metrach.',
    type: 'input',
    answer: '4,25',
    unit: 'm',
    explanation: '25 cm to 25 setnych metra — obie cyfry mieszczą się w dwóch miejscach po przecinku: 4,25 m.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'dec-2-7',
    prompt: 'Ile to jest 2,7 m?',
    type: 'choice',
    options: [
      { id: 'a', text: '2 m 7 cm' },
      { id: 'b', text: '27 m' },
      { id: 'c', text: '2 m 70 cm' },
      { id: 'd', text: '2 m 700 cm' },
    ],
    correctId: 'c',
    explanation: 'Cyfra 7 stoi na miejscu dziesiątych, czyli 70 setnych = 70 cm. 2,7 m to 2,70 m, czyli 2 m 70 cm.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'zl-gr-3-5',
    prompt: 'Zapisz 3 zł 5 gr w złotych.',
    type: 'input',
    answer: '3,05',
    unit: 'zł',
    explanation: '5 gr to 5 setnych złotego. Piątka idzie na miejsce setnych, a miejsce dziesiątych dopełniamy zerem: 3,05 zł.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'kg-g-1-7',
    prompt: 'Paczka waży 1 kg 7 g. Ile to kilogramów?',
    type: 'choice',
    options: [
      { id: 'a', text: '1,7 kg' },
      { id: 'b', text: '1,07 kg' },
      { id: 'c', text: '1,007 kg' },
      { id: 'd', text: '1,0007 kg' },
    ],
    correctId: 'c',
    explanation: 'Gram to tysięczna kilograma (1 kg = 1000 g) → trzy miejsca po przecinku. 7 na miejscu tysięcznych, dwa zera z przodu: 1,007 kg.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'audyt-12-8',
    prompt: 'Zosia zapisała 12 m 8 cm jako „12,8 m". Jaki jest poprawny zapis?',
    type: 'choice',
    options: [
      { id: 'a', text: '12,8 m — zapis jest poprawny' },
      { id: 'b', text: '12,08 m' },
      { id: 'c', text: '12,80 m' },
      { id: 'd', text: '1,28 m' },
    ],
    correctId: 'b',
    explanation:
      '8 cm to 8 setnych metra, nie 8 dziesiątych. „12,8 m" znaczyłoby 12 m 80 cm. Poprawnie: 12,08 m — z zerem na miejscu dziesiątych.',
    difficulty: { code: D.code, name: D.name },
  },
];

const RESULT_COPY = {
  perfect: {
    title: 'Komplet! Wyrażenia dwumianowane masz opanowane.',
    message: 'Zera dopełniające i przelicznik 100 czy 1000 już cię nie zaskoczą.',
  },
  good: {
    title: 'Dobra robota!',
    message: 'Większość trafiona — zerknij jeszcze na zadania z zerem z przodu (3 zł 5 gr, 1 kg 7 g).',
  },
  poor: {
    title: 'To jeszcze wymaga treningu',
    message:
      'Wróć do kroku „Nowe pojęcie" i tablicy pozycyjnej — liczba mniejszej jednostki zawsze idzie od prawej strony.',
  },
};

interface CompoundDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) na zamianę wyrażeń dwumianowanych w obie strony. */
export function CompoundDrill({ color, onComplete }: CompoundDrillProps) {
  return (
    <DiagnosticQuiz
      tasks={TASKS}
      color={color}
      onFinish={() => onComplete?.()}
      resultCopy={RESULT_COPY}
    />
  );
}

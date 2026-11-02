import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'ile-miejsc-setne',
    prompt: 'Ułamek o mianowniku 100 zapisany jako liczba dziesiętna ma za przecinkiem…',
    type: 'choice',
    options: [
      { id: 'a', text: '1 miejsce' },
      { id: 'b', text: '2 miejsca' },
      { id: 'c', text: '3 miejsca' },
    ],
    correctId: 'b',
    explanation: 'Mianownik 100 ma dwa zera — dokładnie tyle miejsc po przecinku dostaje liczba.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'szesc-dziesiatych',
    prompt: 'Zapisz jako ułamek dziesiętny: 6/10.',
    type: 'input',
    answer: '0,6',
    explanation: 'Mianownik 10 → jedno miejsce po przecinku, a licznik 6 staje się tą cyfrą: 0,6.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'osiem-setnych',
    prompt: 'Zapisz jako ułamek dziesiętny: 8/100.',
    type: 'input',
    answer: '0,08',
    explanation:
      'Mianownik 100 → dwa miejsca po przecinku. Liczba 8 ma tylko jedną cyfrę, więc z przodu dopisujemy zero: 0,08.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'zero-na-dziesiatych',
    prompt: 'W liczbie 0,05 na miejscu dziesiątych stoi cyfra…',
    type: 'choice',
    options: [
      { id: 'a', text: '0' },
      { id: 'b', text: '5' },
      { id: 'c', text: '50' },
      { id: 'd', text: 'tam nie ma żadnej cyfry' },
    ],
    correctId: 'a',
    explanation:
      'Zero z przodu wypełnia puste miejsce dziesiątych — właściwa cyfra, 5, stoi dopiero na miejscu setnych.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'trzydziesci-cztery-tysieczne',
    prompt: 'Zapisz jako ułamek dziesiętny: 34/1000.',
    type: 'input',
    answer: '0,034',
    explanation:
      'Mianownik 1000 → trzy miejsca po przecinku. Liczba 34 ma dwie cyfry, więc z przodu dopisujemy jedno zero: 0,034.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'ulamek-z-0-9',
    prompt: 'Który ułamek zwykły o mianowniku 10 odpowiada liczbie 0,9?',
    type: 'choice',
    options: [
      { id: 'a', text: '9/100' },
      { id: 'b', text: '9/10' },
      { id: 'c', text: '9/1' },
      { id: 'd', text: '90/10' },
    ],
    correctId: 'b',
    explanation: 'Jedno miejsce po przecinku odpowiada mianownikowi 10, a cyfra 9 jest licznikiem: 9/10.',
    difficulty: { code: D.code, name: D.name },
  },
];

const RESULT_COPY = {
  perfect: {
    title: 'Komplet! Zapis dziesiętny masz opanowany.',
    message: 'Zera wypełniające puste miejsca już cię nie zaskoczą.',
  },
  good: {
    title: 'Dobra robota!',
    message: 'Większość zadań trafiona — zerknij jeszcze raz na te z zerem z przodu, jeśli chcesz się upewnić.',
  },
  poor: {
    title: 'To jeszcze wymaga treningu',
    message: 'Wróć do kroku „Nowe pojęcie" i spróbuj ponownie — liczenie miejsc po przecinku robi się prostsze z każdą próbą.',
  },
};

interface DecimalDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) na zapis i odczyt ułamków dziesiętnych. */
export function DecimalDrill({ color, onComplete }: DecimalDrillProps) {
  return (
    <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} resultCopy={RESULT_COPY} />
  );
}

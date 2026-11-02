import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'ulamek-z-0-5',
    prompt: 'Który ułamek zwykły w postaci nieskracalnej to 0,5?',
    type: 'choice',
    options: [
      { id: 'a', text: '1/5' },
      { id: 'b', text: '2/5' },
      { id: 'c', text: '1/2' },
      { id: 'd', text: '5/1' },
    ],
    correctId: 'c',
    explanation: '0,5 to 5/10, a 5/10 po skróceniu przez 5 daje 1/2.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'siedem-dziesiatych',
    prompt: 'Zapisz 7/10 jako ułamek dziesiętny.',
    type: 'input',
    answer: '0,7',
    explanation: 'Mianownik jest już równy 10, więc licznik 7 staje się cyfrą dziesiątych: 0,7.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'trzy-czwarte',
    prompt: '3/4 zapisane jako ułamek dziesiętny to…',
    type: 'choice',
    options: [
      { id: 'a', text: '0,75' },
      { id: 'b', text: '0,34' },
      { id: 'c', text: '0,25' },
      { id: 'd', text: '3,4' },
    ],
    correctId: 'a',
    explanation: 'Rozszerzamy przez 25: 3/4 = 75/100 = 0,75.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'trzy-dwudzieste-piate',
    prompt: 'Zapisz 3/25 jako ułamek dziesiętny.',
    type: 'input',
    answer: '0,12',
    explanation: 'Mianownik 25 rozszerzamy przez 4 do 100: 3/25 = 12/100 = 0,12.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'audyt-0-35',
    prompt: '0,35 zapisane jako ułamek zwykły w postaci nieskracalnej to…',
    type: 'choice',
    options: [
      { id: 'a', text: '35/100' },
      { id: 'b', text: '5/14' },
      { id: 'c', text: '3,5' },
      { id: 'd', text: '7/20' },
    ],
    correctId: 'd',
    explanation: '0,35 = 35/100, a 35 i 100 dzielą się przez 5: 35/100 = 7/20 (7 i 20 nie mają już wspólnego dzielnika).',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'granica-prostych',
    prompt: 'Którego z tych ułamków NIE da się zapisać jako skończony ułamek dziesiętny?',
    type: 'choice',
    options: [
      { id: 'a', text: '1/4' },
      { id: 'b', text: '2/3' },
      { id: 'c', text: '3/8' },
      { id: 'd', text: '7/25' },
    ],
    correctId: 'b',
    explanation: 'W mianowniku 2/3 kryje się trójka — nie da się dojść do 10, 100 ani 1000, wyszłoby 0,666… 1/4, 3/8 i 7/25 mają mianowniki z samych dwójek i piątek.',
    difficulty: { code: D.code, name: D.name },
  },
];

const RESULT_COPY = {
  perfect: {
    title: 'Komplet! Most ułamek ↔ dziesiętny masz przejezdny w obie strony.',
    message: 'Rozpoznajesz też, kiedy zamiana się nie uda.',
  },
  good: {
    title: 'Dobra robota!',
    message: 'Większość trafiona — zerknij jeszcze na zadania z rozszerzaniem do 100 i 1000.',
  },
  poor: {
    title: 'To jeszcze wymaga treningu',
    message: 'Wróć do kroków „Nowe pojęcie" i „Przykłady" — rozszerzanie i skracanie to cała tajemnica tej zamiany.',
  },
};

interface ConversionDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań K→P→R→D — zamiana w obie strony i rozpoznanie granicy „prostych przypadków". */
export function ConversionDrill({ color, onComplete }: ConversionDrillProps) {
  return (
    <DiagnosticQuiz
      tasks={TASKS}
      color={color}
      onFinish={() => onComplete?.()}
      resultCopy={RESULT_COPY}
    />
  );
}

'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

/** Liczba odniesienia, do której wraca kilka zadań poniżej. */
const REFERENCE_NUMBER = '4 502 316';

const TASKS: DiagnosticTask[] = [
  {
    id: 'cyfry',
    prompt: `Ile cyfr ma liczba ${REFERENCE_NUMBER}?`,
    type: 'choice',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '8' },
      { id: 'c', text: '7' },
    ],
    correctId: 'c',
    explanation: `${REFERENCE_NUMBER} to cyfry 4, 5, 0, 2, 3, 1, 6 — razem siedem.`,
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'klasy',
    prompt: `Na ile klas dzieli się liczba ${REFERENCE_NUMBER}?`,
    type: 'choice',
    options: [
      { id: 'a', text: '3' },
      { id: 'b', text: '2' },
      { id: 'c', text: '4' },
    ],
    correctId: 'a',
    explanation: 'Klasa milionów (4), klasa tysięcy (502) i klasa jedności (316) — trzy klasy.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'dziesiatki-tysiecy',
    prompt: `Jaka cyfra w liczbie ${REFERENCE_NUMBER} jest na miejscu dziesiątek tysięcy?`,
    type: 'choice',
    options: [
      { id: 'a', text: '5' },
      { id: 'b', text: '2' },
      { id: 'c', text: '3' },
      { id: 'd', text: '0' },
    ],
    correctId: 'd',
    explanation: 'Klasa tysięcy to 5-0-2: setki tysięcy 5, dziesiątki tysięcy 0, jedności tysięcy 2.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'zapisz-cyframi',
    prompt: 'Zapisz cyframi: dwieście osiemnaście tysięcy sześćset.',
    type: 'input',
    answer: '218600',
    explanation: 'Dwieście osiemnaście tysięcy to 218 000, plus sześćset daje 218 600.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'najwieksza',
    prompt: `Cyfry liczby ${REFERENCE_NUMBER} to 4, 5, 0, 2, 3, 1, 6. Ułóż z nich największą możliwą liczbę siedmiocyfrową — każdej cyfry użyj dokładnie raz.`,
    type: 'input',
    answer: '6543210',
    explanation: 'Największą liczbę dostajesz, ustawiając cyfry malejąco: 6 543 210.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'zamiana',
    prompt: `W liczbie ${REFERENCE_NUMBER} zamień miejscami pierwszą cyfrę (klasa milionów) z ostatnią cyfrą (jedności). Jaka liczba powstanie?`,
    type: 'input',
    answer: '6502314',
    explanation: '4 i 6 zamieniają się miejscami: 4 502 316 → 6 502 314.',
    difficulty: { code: D.code, name: D.name },
  },
];

const RESULT_COPY = {
  perfect: {
    title: 'Komplet! Klasy masz opanowane.',
    message: 'Poradzisz sobie z każdą liczbą — nawet siedmiocyfrową.',
  },
  good: {
    title: 'Dobra robota!',
    message: 'Większość zadań trafiona. Zerknij jeszcze raz na te trudniejsze, jeśli chcesz się upewnić.',
  },
  poor: {
    title: 'To jeszcze wymaga treningu',
    message: 'Wróć do kroku „Nowe pojęcie” i spróbuj ponownie — klasy robią się prostsze z każdą próbą.',
  },
};

interface PlaceValueDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) wokół jednej liczby odniesienia. */
export function PlaceValueDrill({ color, onComplete }: PlaceValueDrillProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
        Kilka zadań wraca do tej samej liczby:{' '}
        <strong className="font-mono text-foreground">{REFERENCE_NUMBER}</strong>. Trudność rośnie
        od zadania do zadania.
      </p>
      <DiagnosticQuiz
        tasks={TASKS}
        color={color}
        onFinish={() => onComplete?.()}
        resultCopy={RESULT_COPY}
      />
    </div>
  );
}

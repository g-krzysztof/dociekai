'use client';

import { useState } from 'react';
import { Grid3x3, PenLine, Puzzle } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ClusterRecap, type RecapItem } from '../../cluster-recap';
import { ModuleResultSummary, type ResultCluster } from '../../module-result-summary';
import { getLesson } from '../../../data/lessons';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

/** Skrót — wszystkie lekcje tego podsumowania są zawsze z tego samego modułu. */
const L = (slug: string): MathLesson => {
  const lesson = getLesson('dzialania-pisemne', slug);
  if (!lesson) throw new Error(`Brak lekcji dzialania-pisemne/${slug}`);
  return lesson;
};

const STEPS: LessonStepMeta[] = [
  {
    id: 'dodawanie-odejmowanie',
    kind: 'Powtórka 1',
    title: 'Dodawanie i odejmowanie pisemne',
    time: '5 min',
    icon: 'PenLine',
  },
  { id: 'mnozenie-pisemne', kind: 'Powtórka 2', title: 'Mnożenie pisemne', time: '5 min', icon: 'Grid3x3' },
  {
    id: 'dzielenie-zadania',
    kind: 'Powtórka 3',
    title: 'Dzielenie pisemne i zadania tekstowe',
    time: '5 min',
    icon: 'Puzzle',
  },
  { id: 'wynik', kind: 'Wynik', title: 'Twój wynik i co warto powtórzyć', time: '3 min', icon: 'Trophy' },
];

const RECAP_DODAWANIE_ODEJMOWANIE: RecapItem[] = [
  {
    lesson: L('dodawanie-pisemne'),
    reminder:
      'Ustawiasz liczby rząd pod rzędem, dodajesz kolumna po kolumnie od prawej, a przeniesienie zapisujesz małą cyfrą nad następną kolumną.',
  },
  {
    lesson: L('odejmowanie-pisemne'),
    reminder:
      'Gdy górna cyfra jest mniejsza od dolnej, pożyczasz 1 z sąsiedniej kolumny w lewo — także wtedy, gdy pożyczka musi przejść przez zapisane zero.',
  },
];

const QUIZ_DODAWANIE_ODEJMOWANIE: DiagnosticTask[] = [
  {
    id: 'dodawanie-odejmowanie-1',
    prompt: '2456 + 1783 =',
    type: 'input',
    answer: '4239',
    explanation: '2456 + 1783 = 4239.',
    difficulty: { code: '01', name: 'Dodawanie pisemne' },
  },
  {
    id: 'dodawanie-odejmowanie-2',
    prompt: '3678 + 2945 =',
    type: 'choice',
    options: [
      { id: 'a', text: '6623' },
      { id: 'b', text: '6513' },
      { id: 'c', text: '6723' },
      { id: 'd', text: '5623' },
    ],
    correctId: 'a',
    explanation: '3678 + 2945 = 6623.',
    difficulty: { code: '01', name: 'Dodawanie pisemne' },
  },
  {
    id: 'dodawanie-odejmowanie-3',
    prompt: '5023 − 1847 =',
    type: 'input',
    answer: '3176',
    explanation: '5023 − 1847 = 3176.',
    difficulty: { code: '02', name: 'Odejmowanie pisemne' },
  },
  {
    id: 'dodawanie-odejmowanie-4',
    prompt: '4002 − 1358 =',
    type: 'choice',
    options: [
      { id: 'a', text: '2744' },
      { id: 'b', text: '2644' },
      { id: 'c', text: '3644' },
      { id: 'd', text: '3754' },
    ],
    correctId: 'b',
    explanation:
      'Pożyczka od 0 w kolumnie dziesiątek musi przejść dalej, do kolumny setek: 4002 − 1358 = 2644.',
    difficulty: { code: '02', name: 'Odejmowanie pisemne' },
  },
];

const RECAP_MNOZENIE: RecapItem[] = [
  {
    lesson: L('mnozenie-pisemne-jednocyfrowa'),
    reminder:
      'Mnożysz kolumna po kolumnie od prawej przez tę samą jedną cyfrę, a przeniesienie — czasem większe niż 1 — dopisujesz do następnego iloczynu.',
  },
  {
    lesson: L('mnozenie-pisemne-wielocyfrowa'),
    reminder:
      'Liczysz osobny iloczyn cząstkowy dla każdej cyfry mnożnika, każdy kolejny przesuwasz o jedną kolumnę w lewo, a na końcu wszystkie dodajesz.',
  },
  {
    lesson: L('mnozenie-zakonczone-zerami'),
    reminder:
      'Obcinasz zera końcowe obu czynników, mnożysz to, co zostało, a na końcu doklejasz z powrotem tyle zer, ile obcięłaś/eś łącznie.',
  },
];

const QUIZ_MNOZENIE: DiagnosticTask[] = [
  {
    id: 'mnozenie-1',
    prompt: '347 × 6 =',
    type: 'input',
    answer: '2082',
    explanation: '347 × 6 = 2082.',
    difficulty: { code: '03', name: 'Mnożenie pisemne przez jednocyfrową' },
  },
  {
    id: 'mnozenie-2',
    prompt: '528 × 34 =',
    type: 'choice',
    options: [
      { id: 'a', text: '16 952' },
      { id: 'b', text: '17 952' },
      { id: 'c', text: '17 852' },
      { id: 'd', text: '18 952' },
    ],
    correctId: 'b',
    explanation: '528 × 30 = 15 840, 528 × 4 = 2112, razem 15 840 + 2112 = 17 952.',
    difficulty: { code: '04', name: 'Mnożenie pisemne przez wielocyfrową' },
  },
  {
    id: 'mnozenie-3',
    prompt: '4700 × 60 =',
    type: 'input',
    answer: '282000',
    explanation: '47 × 6 = 282, a doklejasz z powrotem 3 zera (2 z 4700 i 1 z 60): 282 000.',
    difficulty: { code: '05', name: 'Mnożenie liczb zakończonych zerami' },
  },
  {
    id: 'mnozenie-4',
    prompt: '250 × 40 =',
    type: 'choice',
    options: [
      { id: 'a', text: '1000' },
      { id: 'b', text: '100' },
      { id: 'c', text: '10 000' },
      { id: 'd', text: '100 000' },
    ],
    correctId: 'c',
    explanation:
      '25 × 4 = 100 — sam rdzeń już kończy się zerem. Doklejasz jeszcze 2 obcięte zera (z 250 i z 40): 10 000.',
    difficulty: { code: '05', name: 'Mnożenie liczb zakończonych zerami' },
  },
];

const RECAP_DZIELENIE_ZADANIA: RecapItem[] = [
  {
    lesson: L('dzielenie-pisemne'),
    reminder:
      'Dzielisz od lewej: bierzesz tyle początkowych cyfr dzielnej, ile potrzeba, żeby dały co najmniej tyle co dzielnik, zapisujesz iloraz nad kreską i znosisz kolejną cyfrę.',
  },
  {
    lesson: L('zadania-tekstowe-pisemne'),
    reminder:
      'Zanim policzysz dokładnie, oszacuj wynik z grubsza — to pozwala złapać błąd, jeśli dokładny wynik wypadnie zupełnie inny.',
  },
];

const QUIZ_DZIELENIE_ZADANIA: DiagnosticTask[] = [
  {
    id: 'dzielenie-zadania-1',
    prompt: '936 : 4 =',
    type: 'input',
    answer: '234',
    explanation: '936 : 4 = 234, bo 4 × 234 = 936.',
    difficulty: { code: '06', name: 'Dzielenie pisemne' },
  },
  {
    id: 'dzielenie-zadania-2',
    prompt: '824 : 4 =',
    type: 'choice',
    options: [
      { id: 'a', text: '206' },
      { id: 'b', text: '26' },
      { id: 'c', text: '260' },
      { id: 'd', text: '216' },
    ],
    correctId: 'a',
    explanation:
      '8 : 4 = 2, ale 2 : 4 nie starcza, więc zapisujesz 0 i znosisz kolejną cyfrę: 24 : 4 = 6 — razem 206.',
    difficulty: { code: '06', name: 'Dzielenie pisemne' },
  },
  {
    id: 'dzielenie-zadania-3',
    prompt: 'W fabryce zapakowano 4128 czekoladek do pudełek po 8 sztuk. Ile pełnych pudełek powstało?',
    type: 'input',
    answer: '516',
    explanation: '4128 : 8 = 516 pudełek.',
    difficulty: { code: '07', name: 'Zadania tekstowe pisemne' },
  },
  {
    id: 'dzielenie-zadania-4',
    prompt:
      'Sklep sprzedał w poniedziałek towar za 3812 zł, we wtorek za 2950 zł. Oszacuj łączną sumę, zaokrąglając obie kwoty do pełnych tysięcy.',
    type: 'choice',
    options: [
      { id: 'a', text: '7000 zł' },
      { id: 'b', text: '6000 zł' },
      { id: 'c', text: '6800 zł' },
      { id: 'd', text: '5762 zł' },
    ],
    correctId: 'a',
    explanation: '3812 zł → 4000 zł, 2950 zł → 3000 zł, razem 4000 + 3000 = 7000 zł.',
    difficulty: { code: '07', name: 'Zadania tekstowe pisemne' },
  },
];

const CLUSTERS: ResultCluster[] = [
  {
    id: 'dodawanie-odejmowanie',
    label: 'Dodawanie i odejmowanie pisemne',
    icon: 'PenLine',
    lessons: RECAP_DODAWANIE_ODEJMOWANIE.map((r) => r.lesson),
  },
  {
    id: 'mnozenie-pisemne',
    label: 'Mnożenie pisemne',
    icon: 'Grid3x3',
    lessons: RECAP_MNOZENIE.map((r) => r.lesson),
  },
  {
    id: 'dzielenie-zadania',
    label: 'Dzielenie pisemne i zadania tekstowe',
    icon: 'Puzzle',
    lessons: RECAP_DZIELENIE_ZADANIA.map((r) => r.lesson),
  },
];

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
  nextModule?: MathModule;
}

export function PodsumowanieDzialaniaPisemneLesson({
  lesson,
  mathModule,
  nextLesson,
  nextModule,
}: LessonProps) {
  return (
    <LessonShell
      lesson={lesson}
      mathModule={mathModule}
      steps={STEPS}
      nextLesson={nextLesson}
      nextModule={nextModule}
    >
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

type Scores = Partial<Record<string, { score: number; total: number }>>;

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const dodawanieOdejmowanie = useStepDone('dodawanie-odejmowanie');
  const mnozeniePisemne = useStepDone('mnozenie-pisemne');
  const dzielenieZadania = useStepDone('dzielenie-zadania');
  const wynik = useStepDone('wynik');

  const [scores, setScores] = useState<Scores>({});
  const recordScore = (id: string) => (score: number, total: number) =>
    setScores((prev) => ({ ...prev, [id]: { score, total } }));

  return (
    <>
      {/* Wstęp */}
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-4 text-base leading-relaxed sm:text-lg">
          Siedem lekcji za Tobą. Zanim ruszysz dalej, przejdź przez{' '}
          <strong>trzy bloki tematyczne</strong> — w każdym krótka powtórka, a potem kilka pytań
          sprawdzających, co zostało. Pod każdym pytaniem zobaczysz, z której lekcji ono pochodzi —
          jeśli coś nie wyjdzie, będziesz wiedzieć, gdzie wrócić.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          To nie klasówka — nikt nie stawia tu ocen. Na końcu zobaczysz swój wynik z każdego bloku i
          podpowiedź, co warto powtórzyć przed startem kolejnego modułu.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { icon: PenLine, text: 'Dodawanie i odejmowanie w słupku' },
            { icon: Grid3x3, text: 'Mnożenie pisemne, także przez liczby wielocyfrowe' },
            { icon: Puzzle, text: 'Dzielenie pisemne i zadania tekstowe z dużymi liczbami' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1. Dodawanie i odejmowanie pisemne */}
      <LessonSection id="dodawanie-odejmowanie">
        <ClusterRecap items={RECAP_DODAWANIE_ODEJMOWANIE} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_DODAWANIE_ODEJMOWANIE}
          color={color}
          onFinish={(score, total) => {
            recordScore('dodawanie-odejmowanie')(score, total);
            dodawanieOdejmowanie.markStepDone();
          }}
        />
      </LessonSection>

      {/* 2. Mnożenie pisemne */}
      <LessonSection id="mnozenie-pisemne">
        <ClusterRecap items={RECAP_MNOZENIE} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_MNOZENIE}
          color={color}
          onFinish={(score, total) => {
            recordScore('mnozenie-pisemne')(score, total);
            mnozeniePisemne.markStepDone();
          }}
        />
      </LessonSection>

      {/* 3. Dzielenie pisemne i zadania tekstowe */}
      <LessonSection id="dzielenie-zadania">
        <ClusterRecap items={RECAP_DZIELENIE_ZADANIA} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_DZIELENIE_ZADANIA}
          color={color}
          onFinish={(score, total) => {
            recordScore('dzielenie-zadania')(score, total);
            dzielenieZadania.markStepDone();
          }}
        />
      </LessonSection>

      {/* 4. Wynik */}
      <LessonSection id="wynik">
        <ModuleResultSummary
          clusters={CLUSTERS}
          scores={scores}
          color={color}
          onComplete={wynik.markStepDone}
        />
      </LessonSection>
    </>
  );
}

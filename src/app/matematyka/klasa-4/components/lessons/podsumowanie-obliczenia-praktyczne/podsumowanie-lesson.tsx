'use client';

import { useState } from 'react';
import { Clock, Coins, Ruler } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ClusterRecap, type RecapItem } from '../../cluster-recap';
import { ModuleResultSummary, type ResultCluster } from '../../module-result-summary';
import { getLesson } from '../../../data/lessons';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

/** Skrót — wszystkie lekcje tego podsumowania są zawsze z tego samego modułu. */
const L = (slug: string): MathLesson => {
  const lesson = getLesson('obliczenia-praktyczne', slug);
  if (!lesson) throw new Error(`Brak lekcji obliczenia-praktyczne/${slug}`);
  return lesson;
};

const STEPS: LessonStepMeta[] = [
  { id: 'liczby-pieniadze', kind: 'Powtórka 1', title: 'Liczby i pieniądze', time: '5 min', icon: 'Coins' },
  { id: 'jednostki-miary', kind: 'Powtórka 2', title: 'Jednostki miary', time: '5 min', icon: 'Ruler' },
  { id: 'czas-kalendarz', kind: 'Powtórka 3', title: 'Czas i kalendarz', time: '5 min', icon: 'Clock' },
  { id: 'wynik', kind: 'Wynik', title: 'Twój wynik i co warto powtórzyć', time: '3 min', icon: 'Trophy' },
];

const RECAP_LICZBY_PIENIADZE: RecapItem[] = [
  {
    lesson: L('system-rzymski'),
    reminder:
      'Symbole I, V, X, L, C, D, M dodajesz z lewa do prawa — chyba że mniejszy stoi przed większym, wtedy go odejmujesz.',
  },
  {
    lesson: L('jednostki-monetarne'),
    reminder: '1 zł to 100 gr — na grosze zamieniasz razy 100, na złote dzielisz przez 100.',
  },
];

const QUIZ_LICZBY_PIENIADZE: DiagnosticTask[] = [
  {
    id: 'liczby-pieniadze-1',
    prompt: 'Zapisz liczbę 24 w systemie rzymskim.',
    type: 'input',
    answer: 'XXIV',
    explanation: '24 = 20 + 4 = XX + IV = XXIV.',
    difficulty: { code: '01', name: 'System rzymski' },
  },
  {
    id: 'liczby-pieniadze-2',
    prompt: 'Ile to jest MCMXCIX w zapisie arabskim?',
    type: 'choice',
    options: [
      { id: 'a', text: '1990' },
      { id: 'b', text: '1899' },
      { id: 'c', text: '1999' },
      { id: 'd', text: '1909' },
    ],
    correctId: 'c',
    explanation: 'M=1000, CM=900, XC=90, IX=9, razem 1000+900+90+9=1999.',
    difficulty: { code: '01', name: 'System rzymski' },
  },
  {
    id: 'liczby-pieniadze-3',
    prompt: '27 zł 50 gr to ile groszy?',
    type: 'input',
    answer: '2750',
    unit: 'gr',
    explanation: '27 zł to 2700 gr, plus 50 gr — razem 2750 gr.',
    difficulty: { code: '02', name: 'Jednostki monetarne' },
  },
  {
    id: 'liczby-pieniadze-4',
    prompt: '365 gr to ile złotych i groszy?',
    type: 'choice',
    options: [
      { id: 'a', text: '36 zł 5 gr' },
      { id: 'b', text: '3 zł 65 gr' },
      { id: 'c', text: '3 zł 6 gr' },
      { id: 'd', text: '365 zł' },
    ],
    correctId: 'b',
    explanation: '365 gr : 100 = 3 zł, reszta 65 gr — czyli 3 zł 65 gr.',
    difficulty: { code: '02', name: 'Jednostki monetarne' },
  },
];

const RECAP_JEDNOSTKI_MIARY: RecapItem[] = [
  {
    lesson: L('jednostki-dlugosci'),
    reminder: 'Drabinka mm–cm–dm–m–km: w prawo mnożysz, w lewo dzielisz (m→km to razy 1000).',
  },
  {
    lesson: L('jednostki-masy'),
    reminder: 'Drabinka g–dag–kg–t działa tak samo — dag to razy 10, kg to razy 100, tona to razy 1000.',
  },
];

const QUIZ_JEDNOSTKI_MIARY: DiagnosticTask[] = [
  {
    id: 'jednostki-miary-1',
    prompt: '3 m 25 cm = ? cm',
    type: 'input',
    answer: '325',
    unit: 'cm',
    explanation: '3 m to 300 cm, plus 25 cm — razem 325 cm.',
    difficulty: { code: '03', name: 'Jednostki długości' },
  },
  {
    id: 'jednostki-miary-2',
    prompt: 'Które jest najdłuższe: 950 cm, 8 m, 3 km, 99 dm?',
    type: 'choice',
    options: [
      { id: 'a', text: '950 cm' },
      { id: 'b', text: '3 km' },
      { id: 'c', text: '8 m' },
      { id: 'd', text: '99 dm' },
    ],
    correctId: 'b',
    explanation: '3 km to 3000 m — dużo więcej niż 950 cm (9,5 m), 8 m i 99 dm (9,9 m).',
    difficulty: { code: '03', name: 'Jednostki długości' },
  },
  {
    id: 'jednostki-miary-3',
    prompt: '2 kg = ? dag',
    type: 'input',
    answer: '200',
    unit: 'dag',
    explanation: '1 kg to 100 dag, więc 2 kg to 200 dag.',
    difficulty: { code: '04', name: 'Jednostki masy' },
  },
  {
    id: 'jednostki-miary-4',
    prompt: 'Ile kilogramów to 1 tona?',
    type: 'input',
    answer: '1000',
    unit: 'kg',
    explanation: '1 tona to 1000 kg.',
    difficulty: { code: '04', name: 'Jednostki masy' },
  },
];

const RECAP_CZAS_KALENDARZ: RecapItem[] = [
  {
    lesson: L('obliczenia-zegarowe'),
    reminder:
      'Upływ czasu liczysz doliczając: najpierw do pełnej godziny, potem pełne godziny, na końcu resztę minut.',
  },
  {
    lesson: L('obliczenia-kalendarzowe'),
    reminder: 'Tą samą metodą liczysz dni: do końca miesiąca, potem całe miesiące, na końcu resztę dni.',
  },
];

const QUIZ_CZAS_KALENDARZ: DiagnosticTask[] = [
  {
    id: 'czas-kalendarz-1',
    prompt: 'Lekcja trwa od 9:15 do 10:00. Ile to minut?',
    type: 'input',
    answer: '45',
    unit: 'min',
    explanation: 'Od 9:15 do 10:00 to po prostu 45 minut.',
    difficulty: { code: '05', name: 'Obliczenia zegarowe' },
  },
  {
    id: 'czas-kalendarz-2',
    prompt: 'Zajęcia: 14:40–16:10. Ile trwały?',
    type: 'choice',
    options: [
      { id: 'a', text: '1 h 20 min' },
      { id: 'b', text: '2 h 30 min' },
      { id: 'c', text: '1 h 30 min' },
      { id: 'd', text: '1 h 40 min' },
    ],
    correctId: 'c',
    explanation: 'Od 14:40 do 15:00 to 20 min, od 15:00 do 16:00 to godzina, od 16:00 do 16:10 to 10 min — razem 1 h 30 min.',
    difficulty: { code: '05', name: 'Obliczenia zegarowe' },
  },
  {
    id: 'czas-kalendarz-3',
    prompt: '23 dni to:',
    type: 'choice',
    options: [
      { id: 'a', text: '2 tygodnie i 3 dni' },
      { id: 'b', text: '3 tygodnie i 3 dni' },
      { id: 'c', text: '3 tygodnie i 2 dni' },
      { id: 'd', text: '2 tygodnie i 5 dni' },
    ],
    correctId: 'c',
    explanation: '23 : 7 = 3 reszta 2 — czyli 3 tygodnie i 2 dni.',
    difficulty: { code: '06', name: 'Obliczenia kalendarzowe' },
  },
  {
    id: 'czas-kalendarz-4',
    prompt: 'Rok 2024 był przestępny. Ile dni miał luty w 2024 roku?',
    type: 'input',
    answer: '29',
    unit: 'dni',
    explanation: 'W roku przestępnym luty ma 29 dni zamiast zwykłych 28.',
    difficulty: { code: '06', name: 'Obliczenia kalendarzowe' },
  },
];

const CLUSTERS: ResultCluster[] = [
  {
    id: 'liczby-pieniadze',
    label: 'Liczby i pieniądze',
    icon: 'Coins',
    lessons: RECAP_LICZBY_PIENIADZE.map((r) => r.lesson),
  },
  {
    id: 'jednostki-miary',
    label: 'Jednostki miary',
    icon: 'Ruler',
    lessons: RECAP_JEDNOSTKI_MIARY.map((r) => r.lesson),
  },
  {
    id: 'czas-kalendarz',
    label: 'Czas i kalendarz',
    icon: 'Clock',
    lessons: RECAP_CZAS_KALENDARZ.map((r) => r.lesson),
  },
];

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
  nextModule?: MathModule;
}

export function PodsumowanieObliczeniaPraktyczneLesson({
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
  const liczbyPieniadze = useStepDone('liczby-pieniadze');
  const jednostkiMiary = useStepDone('jednostki-miary');
  const czasKalendarz = useStepDone('czas-kalendarz');
  const wynik = useStepDone('wynik');

  const [scores, setScores] = useState<Scores>({});
  const recordScore = (id: string) => (score: number, total: number) =>
    setScores((prev) => ({ ...prev, [id]: { score, total } }));

  return (
    <>
      {/* Wstęp */}
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-4 text-base leading-relaxed sm:text-lg">
          Sześć lekcji za Tobą. Zanim ruszysz dalej, przejdź przez{' '}
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
            { icon: Coins, text: 'System rzymski i pieniądze' },
            { icon: Ruler, text: 'Jednostki długości i masy' },
            { icon: Clock, text: 'Obliczenia zegarowe i kalendarzowe' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1. Liczby i pieniądze */}
      <LessonSection id="liczby-pieniadze">
        <ClusterRecap items={RECAP_LICZBY_PIENIADZE} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_LICZBY_PIENIADZE}
          color={color}
          onFinish={(score, total) => {
            recordScore('liczby-pieniadze')(score, total);
            liczbyPieniadze.markStepDone();
          }}
        />
      </LessonSection>

      {/* 2. Jednostki miary */}
      <LessonSection id="jednostki-miary">
        <ClusterRecap items={RECAP_JEDNOSTKI_MIARY} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_JEDNOSTKI_MIARY}
          color={color}
          onFinish={(score, total) => {
            recordScore('jednostki-miary')(score, total);
            jednostkiMiary.markStepDone();
          }}
        />
      </LessonSection>

      {/* 3. Czas i kalendarz */}
      <LessonSection id="czas-kalendarz">
        <ClusterRecap items={RECAP_CZAS_KALENDARZ} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_CZAS_KALENDARZ}
          color={color}
          onFinish={(score, total) => {
            recordScore('czas-kalendarz')(score, total);
            czasKalendarz.markStepDone();
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

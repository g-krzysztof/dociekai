'use client';

import { useState } from 'react';
import { Grid3x3, Ruler, Scissors, Square } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ClusterRecap, type RecapItem } from '../../cluster-recap';
import { ModuleResultSummary, type ResultCluster } from '../../module-result-summary';
import { GridFigure } from '../pole-figury/grid-figure';
import { RectSketch } from '../pole-prostokata-i-kwadratu/rect-sketch';
import type { GridCell } from '../../../lib/area';
import { mergeCells, partCells } from '../../../lib/area-split';
import { getLesson } from '../../../data/lessons';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

/** Skrót — wszystkie lekcje tego podsumowania są zawsze z tego samego modułu. */
const L = (slug: string): MathLesson => {
  const lesson = getLesson('pola-figur', slug);
  if (!lesson) throw new Error(`Brak lekcji pola-figur/${slug}`);
  return lesson;
};

const rect = (x: number, y: number, width: number, height: number): GridCell[] =>
  partCells({ x, y, width, height });

const STEPS: LessonStepMeta[] = [
  { id: 'pojecie', kind: 'Powtórka 1', title: 'Czym jest pole figury', time: '5 min', icon: 'Grid3x3' },
  { id: 'jednostki', kind: 'Powtórka 2', title: 'Jednostki pola i ich zamiana', time: '5 min', icon: 'Ruler' },
  { id: 'wzor', kind: 'Powtórka 3', title: 'Pole prostokąta i kwadratu', time: '6 min', icon: 'Square' },
  { id: 'zlozone', kind: 'Powtórka 4', title: 'Pola figur złożonych', time: '6 min', icon: 'Scissors' },
  { id: 'wynik', kind: 'Wynik', title: 'Twój wynik i co warto powtórzyć', time: '3 min', icon: 'Trophy' },
];

/* ─────────────────────────── 1. Pojęcie pola ─────────────────────────── */

const RECAP_POJECIE: RecapItem[] = [
  {
    lesson: L('pole-figury'),
    reminder:
      'Pole to liczba kwadratów jednostkowych mieszczących się w figurze. Porównywać pola można tylko tą samą kratką, dwie połówki dają jedną całą kratkę, a pole to nie obwód.',
  },
];

function buildQuizPojecie(color: string): DiagnosticTask[] {
  return [
    {
      id: 'czym-jest-pole',
      prompt: 'Czym jest pole figury?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Długością linii, która ją otacza' },
        { id: 'b', text: 'Liczbą kwadratów jednostkowych, które się w niej mieszczą' },
        { id: 'c', text: 'Liczbą jej boków' },
        { id: 'd', text: 'Sumą długości wszystkich jej boków' },
      ],
      correctId: 'b',
      explanation:
        'Pole mierzy powierzchnię — liczymy je kwadratami jednostkowymi. Długość linii otaczającej figurę to obwód.',
      difficulty: { code: '01', name: 'Pole figury' },
    },
    {
      id: 'polowki',
      prompt: 'Policz pole tej figury i wpisz liczbę kratek.',
      type: 'input',
      unit: 'kratek',
      answer: '8',
      visual: (
        <div className="mx-auto max-w-[200px]">
          <GridFigure
            width={6}
            height={4}
            cells={rect(1, 1, 3, 2)}
            halves={[
              { x: 0, y: 1, cut: 'tr' },
              { x: 0, y: 2, cut: 'br' },
              { x: 4, y: 1, cut: 'tl' },
              { x: 4, y: 2, cut: 'bl' },
            ]}
            color={color}
            unit={30}
            title="Figura z całych kratek i czterech połówek"
          />
        </div>
      ),
      explanation:
        'Całych kratek jest 6, a połówek 4 — czyli 2 dodatkowe całe kratki. Razem 6 + 2 = 8 kratek.',
      difficulty: { code: '01', name: 'Pole figury' },
    },
    {
      id: 'pole-czy-obwod',
      prompt: 'Chcesz wiedzieć, ile paneli kupić na podłogę w pokoju. Co musisz policzyć?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Obwód pokoju' },
        { id: 'b', text: 'Długość najdłuższej ściany' },
        { id: 'c', text: 'Sumę długości wszystkich ścian' },
        { id: 'd', text: 'Pole podłogi' },
      ],
      correctId: 'd',
      explanation:
        'Panele przykrywają powierzchnię, więc liczy się pole. Obwód przydałby się przy listwach przypodłogowych.',
      difficulty: { code: '01', name: 'Pole figury' },
    },
    {
      id: 'ta-sama-kratka',
      prompt:
        'Kasia zmierzyła podłogę swoimi kafelkami i wyszły jej 24 kafelki. Piotrek zmierzył tę samą podłogę i naliczył 6. Jak to możliwe?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Kafelki Piotrka są większe — pole to ta sama powierzchnia, ale mierzona inną kratką' },
        { id: 'b', text: 'Ktoś się pomylił, bo pole jest zawsze jedno' },
        { id: 'c', text: 'Piotrek liczył obwód, a Kasia pole' },
        { id: 'd', text: 'Podłoga w międzyczasie się zmieniła' },
      ],
      correctId: 'a',
      explanation:
        'Liczba zależy od wielkości kwadratu jednostkowego. Właśnie dlatego umówiono się na wspólne jednostki: cm², m² i resztę drabinki.',
      difficulty: { code: '01', name: 'Pole figury' },
    },
  ];
}

/* ─────────────────────────── 2. Jednostki pola ─────────────────────────── */

const RECAP_JEDNOSTKI: RecapItem[] = [
  {
    lesson: L('jednostki-pola'),
    reminder:
      'Każda jednostka pola to kwadrat, a sąsiednie szczeble drabinki mm² → cm² → dm² → m² → ar → hektar → km² dzieli zawsze 100. W dół ×100 (dwa zera dopisane), w górę :100 (dwa zera zdjęte).',
  },
];

const QUIZ_JEDNOSTKI: DiagnosticTask[] = [
  {
    id: 'cm2-w-dm2',
    prompt: 'Ile centymetrów kwadratowych mieści się w jednym decymetrze kwadratowym?',
    type: 'choice',
    options: [
      { id: 'a', text: '10' },
      { id: 'b', text: '1000' },
      { id: 'c', text: '100' },
      { id: 'd', text: '10 000' },
    ],
    correctId: 'c',
    explanation:
      'Bok rośnie ×10 (1 dm = 10 cm), więc pole rośnie ×10 · 10 = 100. Cała drabinka jednostek pola idzie krokiem ×100.',
    difficulty: { code: '02', name: 'Jednostki pola' },
  },
  {
    id: 'hektar-w-m2',
    prompt: 'Ile metrów kwadratowych ma jeden hektar? Wpisz samą liczbę.',
    type: 'input',
    unit: 'm²',
    answer: '10000',
    explanation:
      'Hektar to kwadrat o boku 100 m, więc 100 · 100 = 10 000 m². To także 100 arów.',
    difficulty: { code: '02', name: 'Jednostki pola' },
  },
  {
    id: 'piec-m2',
    prompt: 'Ile decymetrów kwadratowych ma 5 m²?',
    type: 'choice',
    options: [
      { id: 'a', text: '500 dm²' },
      { id: 'b', text: '50 dm²' },
      { id: 'c', text: '5000 dm²' },
      { id: 'd', text: '0,05 dm²' },
    ],
    correctId: 'a',
    explanation: 'Z m² na dm² jest jeden szczebel w dół, czyli ×100: do piątki dopisują się dwa zera.',
    difficulty: { code: '02', name: 'Jednostki pola' },
  },
  {
    id: 'jednostka-do-ekranu',
    prompt: 'Którą jednostką najwygodniej podać powierzchnię ekranu telefonu?',
    type: 'choice',
    options: [
      { id: 'a', text: 'w m²' },
      { id: 'b', text: 'w arach' },
      { id: 'c', text: 'w km²' },
      { id: 'd', text: 'w cm²' },
    ],
    correctId: 'd',
    explanation:
      'Ekran ma kilkadziesiąt centymetrów kwadratowych. W metrach kwadratowych wyszłaby liczba z przecinkiem i kilkoma zerami.',
    difficulty: { code: '02', name: 'Jednostki pola' },
  },
];

/* ─────────────────────── 3. Pole prostokąta i kwadratu ─────────────────────── */

const RECAP_WZOR: RecapItem[] = [
  {
    lesson: L('pole-prostokata-i-kwadratu'),
    reminder:
      'W prostokącie każdy rząd jest taki sam, więc P = a · b. Kwadrat to prostokąt o równych bokach: P = a · a. Znając pole i jeden bok, drugi liczysz dzieleniem: b = P : a.',
  },
];

function buildQuizWzor(color: string): DiagnosticTask[] {
  return [
    {
      id: 'prostokat-8-5',
      prompt: 'Policz pole tego prostokąta i wpisz samą liczbę.',
      type: 'input',
      unit: 'cm²',
      answer: '40',
      visual: (
        <div className="mx-auto max-w-[200px]">
          <RectSketch spec={{ width: 8, height: 5 }} color={color} unitLabel="cm" />
        </div>
      ),
      explanation: 'P = a · b = 8 · 5 = 40 cm².',
      difficulty: { code: '03', name: 'Pole prostokąta i kwadratu' },
    },
    {
      id: 'kwadrat-6',
      prompt: 'Kwadratowa serwetka ma bok 6 cm. Jakie ma pole?',
      type: 'choice',
      options: [
        { id: 'a', text: '12 cm²' },
        { id: 'b', text: '36 cm²' },
        { id: 'c', text: '24 cm²' },
        { id: 'd', text: '30 cm²' },
      ],
      correctId: 'b',
      explanation: 'P = a · a = 6 · 6 = 36 cm². Liczba 24 to obwód tego kwadratu.',
      difficulty: { code: '03', name: 'Pole prostokąta i kwadratu' },
    },
    {
      id: 'brakujacy-bok',
      prompt: 'Prostokąt ma pole 56 m², a jeden bok mierzy 8 m. Ile ma drugi bok?',
      type: 'choice',
      options: [
        { id: 'a', text: '48 m' },
        { id: 'b', text: '20 m' },
        { id: 'c', text: '7 m' },
        { id: 'd', text: '64 m' },
      ],
      correctId: 'c',
      explanation: 'b = P : a = 56 : 8 = 7 m. Sprawdzenie: 8 · 7 = 56.',
      difficulty: { code: '03', name: 'Pole prostokąta i kwadratu' },
    },
    {
      id: 'ten-sam-obwod',
      prompt:
        'Prostokąt 2 m na 18 m i kwadrat 6 m na 6 m mają to samo pole 36 m². Który z nich ma większy obwód?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Prostokąt 2 · 18 — jego obwód to 40 m, a kwadratu tylko 24 m' },
        { id: 'b', text: 'Kwadrat, bo ma cztery równe boki' },
        { id: 'c', text: 'Obwody są równe, bo pola są równe' },
        { id: 'd', text: 'Nie da się porównać obwodów bez rysunku' },
      ],
      correctId: 'a',
      explanation:
        'Równe pola nie oznaczają równych obwodów. Im bardziej wydłużony prostokąt, tym dłuższy obwód — najkrótszy ma kształt najbliższy kwadratowi.',
      difficulty: { code: '03', name: 'Pole prostokąta i kwadratu' },
    },
  ];
}

/* ─────────────────────── 4. Pola figur złożonych ─────────────────────── */

const RECAP_ZLOZONE: RecapItem[] = [
  {
    lesson: L('podzial-i-uzupelnianie'),
    reminder:
      'Figurę złożoną z prostokątów albo tniesz na prostokąty i pola dodajesz, albo domykasz do prostokąta i pole braków odejmujesz. Obie drogi muszą dać ten sam wynik.',
  },
];

function buildQuizZlozone(color: string): DiagnosticTask[] {
  return [
    {
      id: 'litera-l',
      prompt: 'Policz pole tej figury i wpisz liczbę kratek.',
      type: 'input',
      unit: 'kratek',
      answer: '14',
      visual: (
        <div className="mx-auto max-w-[200px]">
          <GridFigure
            width={5}
            height={4}
            cells={mergeCells(rect(0, 0, 2, 4), rect(2, 2, 3, 2))}
            color={color}
            unit={30}
            title="Figura w kształcie litery L"
          />
        </div>
      ),
      explanation:
        'Podziałem: 2 · 4 + 3 · 2 = 8 + 6 = 14. Uzupełnianiem: 5 · 4 − 3 · 2 = 20 − 6 = 14.',
      difficulty: { code: '04', name: 'Podział i uzupełnianie' },
    },
    {
      id: 'z-otworem',
      prompt: 'Prostokątna blacha 9 dm na 4 dm ma wycięty prostokątny otwór 3 dm na 2 dm. Jakie pole ma blacha?',
      type: 'choice',
      options: [
        { id: 'a', text: '36 dm²' },
        { id: 'b', text: '42 dm²' },
        { id: 'c', text: '28 dm²' },
        { id: 'd', text: '30 dm²' },
      ],
      correctId: 'd',
      explanation: 'Cała blacha: 9 · 4 = 36 dm². Otwór: 3 · 2 = 6 dm². Zostaje 36 − 6 = 30 dm².',
      difficulty: { code: '04', name: 'Podział i uzupełnianie' },
    },
    {
      id: 'ktora-metoda',
      prompt:
        'Figura to duży prostokąt, któremu brakuje jednego kwadratu w rogu. Która metoda będzie tu krótsza?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Podział — trzeba ją pociąć na trzy prostokąty' },
        { id: 'b', text: 'Uzupełnianie — jedno mnożenie i jedno odejmowanie' },
        { id: 'c', text: 'Żadna, takiej figury nie da się policzyć' },
        { id: 'd', text: 'Obie zajmą dokładnie tyle samo działań' },
      ],
      correctId: 'b',
      explanation:
        'Gdy brakuje jednego kawałka, wystarczy policzyć całą ramkę i odjąć ten brak. Podział wymagałby tu dwóch cięć i trzech mnożeń.',
      difficulty: { code: '04', name: 'Podział i uzupełnianie' },
    },
    {
      id: 'ogrod-ze-sciezka',
      prompt:
        'Prostokątny ogród 10 m na 6 m przecina ścieżka o szerokości 1 m, biegnąca przez całą jego długość (10 m). Ile metrów kwadratowych zostaje na rośliny? Wpisz samą liczbę.',
      type: 'input',
      unit: 'm²',
      answer: '50',
      explanation:
        'Cały ogród: 10 · 6 = 60 m². Ścieżka: 10 · 1 = 10 m². Na rośliny zostaje 60 − 10 = 50 m².',
      difficulty: { code: '04', name: 'Podział i uzupełnianie' },
    },
  ];
}

const CLUSTERS: ResultCluster[] = [
  { id: 'pojecie', label: 'Czym jest pole figury', icon: 'Grid3x3', lessons: RECAP_POJECIE.map((r) => r.lesson) },
  { id: 'jednostki', label: 'Jednostki pola i ich zamiana', icon: 'Ruler', lessons: RECAP_JEDNOSTKI.map((r) => r.lesson) },
  { id: 'wzor', label: 'Pole prostokąta i kwadratu', icon: 'Square', lessons: RECAP_WZOR.map((r) => r.lesson) },
  { id: 'zlozone', label: 'Pola figur złożonych', icon: 'Scissors', lessons: RECAP_ZLOZONE.map((r) => r.lesson) },
];

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
  nextModule?: MathModule;
}

export function PodsumowaniePolaFigurLesson({ lesson, mathModule, nextLesson, nextModule }: LessonProps) {
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
  const pojecie = useStepDone('pojecie');
  const jednostki = useStepDone('jednostki');
  const wzor = useStepDone('wzor');
  const zlozone = useStepDone('zlozone');
  const wynik = useStepDone('wynik');

  const [scores, setScores] = useState<Scores>({});
  const recordScore = (id: string) => (score: number, total: number) =>
    setScores((prev) => ({ ...prev, [id]: { score, total } }));

  return (
    <>
      {/* Wstęp */}
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-4 text-base leading-relaxed sm:text-lg">
          Cały moduł o polach za Tobą — od zalewania figury kafelkami, przez drabinkę jednostek od
          milimetra kwadratowego po hektar, aż po wzór <strong>P = a · b</strong> i figury, które
          trzeba najpierw pociąć albo domknąć. Zanim ruszysz dalej, przejdź przez{' '}
          <strong>cztery bloki tematyczne</strong>: w każdym krótka powtórka, a potem kilka pytań
          sprawdzających, co zostało. Pod każdym pytaniem zobaczysz, z której lekcji pochodzi.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          To nie klasówka — nikt nie stawia tu ocen. Na końcu zobaczysz swój wynik z każdego bloku i
          podpowiedź, co warto powtórzyć.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { icon: Grid3x3, text: 'Czym jest pole figury' },
            { icon: Ruler, text: 'Jednostki pola i ich zamiana' },
            { icon: Square, text: 'Pole prostokąta i kwadratu' },
            { icon: Scissors, text: 'Pola figur złożonych' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1. Pojęcie pola */}
      <LessonSection id="pojecie">
        <ClusterRecap items={RECAP_POJECIE} color={color} />
        <DiagnosticQuiz
          tasks={buildQuizPojecie(color)}
          color={color}
          onFinish={(score, total) => {
            recordScore('pojecie')(score, total);
            pojecie.markStepDone();
          }}
        />
      </LessonSection>

      {/* 2. Jednostki pola */}
      <LessonSection id="jednostki">
        <ClusterRecap items={RECAP_JEDNOSTKI} color={color} />
        <DiagnosticQuiz
          tasks={QUIZ_JEDNOSTKI}
          color={color}
          onFinish={(score, total) => {
            recordScore('jednostki')(score, total);
            jednostki.markStepDone();
          }}
        />
      </LessonSection>

      {/* 3. Pole prostokąta i kwadratu */}
      <LessonSection id="wzor">
        <ClusterRecap items={RECAP_WZOR} color={color} />
        <DiagnosticQuiz
          tasks={buildQuizWzor(color)}
          color={color}
          onFinish={(score, total) => {
            recordScore('wzor')(score, total);
            wzor.markStepDone();
          }}
        />
      </LessonSection>

      {/* 4. Pola figur złożonych */}
      <LessonSection id="zlozone">
        <ClusterRecap items={RECAP_ZLOZONE} color={color} />
        <DiagnosticQuiz
          tasks={buildQuizZlozone(color)}
          color={color}
          onFinish={(score, total) => {
            recordScore('zlozone')(score, total);
            zlozone.markStepDone();
          }}
        />
      </LessonSection>

      {/* 5. Wynik */}
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

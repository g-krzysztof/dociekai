'use client';

import Image from 'next/image';
import { Frame, RectangleHorizontal, Ruler, Square } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { RectangleOrNotSort } from './rectangle-or-not-sort';
import { RectangleBuilder } from './rectangle-builder';
import { RectangleFamilyShowcase } from './rectangle-family-showcase';
import { buildDrillTasks } from './prostokaty-i-kwadraty-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Prostokąt czy nie?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'definicje',
    kind: 'Nowe pojęcie',
    title: 'Zbuduj prostokąt: przeciągnij róg',
    time: '8 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Ten sam kształt, różne proporcje',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Kąty proste i równe boki',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'ramka',
    kind: 'Zadanie problemowe',
    title: 'Ramka na zdjęcie',
    time: '6 min',
    icon: 'Puzzle',
  },
  {
    id: 'quiz',
    kind: 'Quiz',
    title: 'Sprawdź, co zapamiętałeś',
    time: '4 min',
    icon: 'CheckCircle2',
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'katy-proste-liczba',
    question: 'Prostokąt ma zawsze...',
    options: [
      { id: 'a', text: '2 kąty proste' },
      { id: 'b', text: 'żadnego kąta prostego' },
      { id: 'c', text: '4 kąty proste' },
      { id: 'd', text: '3 kąty proste' },
    ],
    correctId: 'c',
    explanation: 'Prostokąt ma zawsze dokładnie 4 kąty proste — po jednym w każdym rogu.',
  },
  {
    id: 'kwadrat-definicja',
    question: 'Kwadrat to prostokąt, w którym dodatkowo...',
    options: [
      { id: 'a', text: 'wszystkie boki są równe' },
      { id: 'b', text: 'jeden kąt jest rozwarty' },
      { id: 'c', text: 'boki są krzywe' },
      { id: 'd', text: 'nie ma kątów prostych' },
    ],
    correctId: 'a',
    explanation:
      'Kwadrat spełnia wszystkie warunki prostokąta (4 kąty proste, boki naprzeciwległe równe), a dodatkowo wszystkie jego boki są równe.',
  },
  {
    id: 'kazdy-kwadrat-prostokatem',
    question: 'Czy każdy kwadrat jest prostokątem?',
    options: [
      { id: 'a', text: 'Nie, nigdy' },
      { id: 'b', text: 'Tylko czasami' },
      { id: 'c', text: 'Tylko gdy jest duży' },
      { id: 'd', text: 'Tak, zawsze' },
    ],
    correctId: 'd',
    explanation: 'Kwadrat spełnia wszystkie warunki prostokąta, więc zawsze nim jest.',
  },
  {
    id: 'kazdy-prostokat-kwadratem',
    question: 'Czy każdy prostokąt jest kwadratem?',
    options: [
      { id: 'a', text: 'Tak, zawsze' },
      { id: 'b', text: 'Nie — tylko gdy wszystkie boki są równe' },
      { id: 'c', text: 'Nie, nigdy' },
      { id: 'd', text: 'Tak, ale tylko duże' },
    ],
    correctId: 'b',
    explanation: 'Prostokąt staje się kwadratem dopiero wtedy, gdy dodatkowo wszystkie jego boki są równe.',
  },
  {
    id: 'bok-naprzeciwlegly-quiz',
    question: 'W prostokącie jeden bok ma 9 cm. Bok naprzeciwko (równoległy do niego) ma...',
    options: [
      { id: 'a', text: 'mniej niż 9 cm' },
      { id: 'b', text: 'więcej niż 9 cm' },
      { id: 'c', text: 'zależy od pozostałych boków' },
      { id: 'd', text: 'dokładnie 9 cm' },
    ],
    correctId: 'd',
    explanation: 'Boki naprzeciwległe w prostokącie są zawsze równe — więc ten bok też ma 9 cm.',
  },
  {
    id: 'sasiednie-boki-quiz',
    question: 'Czworokąt ma 4 kąty proste, ale jego sąsiednie boki mają 5 cm i 3 cm. To...',
    options: [
      { id: 'a', text: 'kwadrat' },
      { id: 'b', text: 'romb' },
      { id: 'c', text: 'prostokąt, ale nie kwadrat' },
      { id: 'd', text: 'równoległobok bez kątów prostych' },
    ],
    correctId: 'c',
    explanation:
      'Cztery kąty proste to prostokąt, ale sąsiednie boki różnej długości wykluczają kwadrat — w kwadracie równe muszą być wszystkie boki, nie tylko naprzeciwległe.',
  },
];

const CHEAT_SHEET = [
  'Prostokąt ma zawsze 4 kąty proste.',
  'W prostokącie boki naprzeciwległe są równe i równoległe.',
  'Kwadrat to prostokąt, w którym dodatkowo wszystkie boki są równe — każdy kwadrat jest prostokątem, ale nie każdy prostokąt jest kwadratem.',
  'Sąsiednie boki prostokąta mogą mieć różną długość — liczy się tylko para naprzeciwległych.',
  'Do rysowania prostokąta potrzebna jest linijka (długości boków) i ekierka (kąty proste w rogach).',
  'Ten sam kształt — prostokąt — spotkasz w bardzo różnych proporcjach: od wąskiego paska po niemal kwadrat.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/prostokaty-i-kwadraty/linijka-ekierka-kartka.jpg',
  rozgrzewka: '/images/matematyka/lekcje/prostokaty-i-kwadraty/plytki-podlogowe.jpg',
  przyklady: '/images/matematyka/lekcje/prostokaty-i-kwadraty/okno-i-drzwi.jpg',
  trening: '/images/matematyka/lekcje/prostokaty-i-kwadraty/klocki-prostokatne.jpg',
  ramka: '/images/matematyka/lekcje/prostokaty-i-kwadraty/ramka-na-zdjecie.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ProstokatyIKwadratyLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const concept = useStepDone('definicje');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('trening');
  const frameCase = useStepDone('ramka');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Znasz już wielokąty. Teraz przyjrzysz się bliżej jednemu z nich —{' '}
            <strong>prostokątowi</strong>: czworokątowi z samymi kątami prostymi. Zobaczysz też, czym
            różni się od jego szczególnego przypadku — <strong>kwadratu</strong>.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: RectangleHorizontal, text: 'Prostokąt — 4 kąty proste' },
              { icon: Square, text: 'Kwadrat — prostokąt o równych bokach' },
              { icon: Ruler, text: 'Linijka i ekierka — narzędzia do rysowania' },
              { icon: Frame, text: 'Ramka na zdjęcie — prostokąt w praktyce' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-sm">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Linijka i ekierka leżące na kartce z naszkicowanym prostokątem"
            width={240}
            height={240}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* 1. Rozgrzewka */}
      <LessonSection id="rozgrzewka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.rozgrzewka}
          alt="Prostokątne i kwadratowe płytki podłogowe ułożone obok siebie"
          lead="Zanim poznasz definicję, oceń kształt na oko."
        >
          Niektóre z tych czworokątów to prostokąty (w tym kwadraty), inne nie. Sprawdź, czy uda Ci
          się je rozróżnić — zwracaj uwagę na kąty w rogach, nie tylko na długość boków.
        </LessonImageCard>
        <RectangleOrNotSort color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="definicje">
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Przeciągnij prawy-dolny róg po siatce kratek. Obserwuj, jak w każdym rogu powstaje kąt
          prosty, a na bokach naprzeciwległych pojawiają się takie same kreski — to znak, że są sobie
          równe.
        </p>
        <RectangleBuilder
          color={color}
          targets={[
            { width: 6, height: 3, prompt: 'Zbuduj dowolny prostokąt — boki różnej długości' },
            { width: 5, height: 5, prompt: 'Teraz przeciągnij róg tak, żeby wszystkie boki były równe — zrób kwadrat' },
          ]}
          onComplete={concept.markStepDone}
        />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          kicker="Zawsze 4 kąty proste"
          image={IMAGES.przyklady}
          alt="Prostokątne okno i kwadratowe drzwiczki szafki obok siebie"
        >
          Okno i drzwiczki szafki mają zupełnie inne proporcje — jedno jest wyraźnie wydłużone, drugie
          niemal kwadratowe. Sprawdź, co mimo to łączy te trzy przedmioty.
        </LessonImageCard>
        <RectangleFamilyShowcase color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Drewniane prostokątne i kwadratowe klocki dziecięce rozłożone na dywanie"
        >
          <p>
            Czas na trening. Bez mierzenia kątomierzem — same rozumowanie o kątach prostych i
            równości boków naprzeciwległych.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="ramka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.ramka}
          alt="Drewniana prostokątna ramka na zdjęcie leżąca na stole warsztatowym"
          reverse
          lead="Dziadek robi ramkę na zdjęcie."
        >
          Najpierw potrzebuje prostokątnej ramki na zdjęcie rodzinne. Potem tę samą ramę chce
          przerobić na kwadratową podkładkę pod doniczkę. Pomóż mu zbudować obie.
        </LessonImageCard>
        <RectangleBuilder
          color={color}
          targets={[
            { width: 6, height: 4, prompt: 'Zbuduj ramkę na zdjęcie: 6 na 4 kratki' },
            { width: 5, height: 5, prompt: 'Przerób ją na kwadratową podkładkę pod doniczkę: 5 na 5 kratek' },
          ]}
          onComplete={frameCase.markStepDone}
        />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: prostokąty i kwadraty w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej w kolejnych lekcjach geometrii — przyda się przy obwodach.
        </p>
        <ol className="divide-y border">
          {CHEAT_SHEET.map((rule, index) => (
            <li key={rule} className="flex items-start gap-4 px-4 py-3">
              <span
                className="w-6 shrink-0 font-mono text-lg font-bold leading-none tabular-nums"
                style={{ color }}
              >
                {index + 1}
              </span>
              <span className="text-sm leading-relaxed">{rule}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

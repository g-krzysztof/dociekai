'use client';

import Image from 'next/image';
import { ListOrdered, Parentheses, SplitSquareHorizontal, X as Multiply } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { FirstStepWarmup } from './first-step-warmup';
import { CalculationCascadeIntro } from './calculation-cascade-intro';
import { OrderExamples } from './order-examples';
import { OrderDrill } from './order-drill';
import { PicnicBudgetChallenge } from './picnic-budget-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Co liczysz najpierw?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Uruchom maszynę liczącą',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy zasady w praktyce',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz kolejność działań',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'piknik',
    kind: 'Zadanie problemowe',
    title: 'Budżet klasowego pikniku',
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
    id: 'oblicz-7-2-5',
    question: '7 + 2 × 5 = ?',
    options: [
      { id: 'a', text: '45' },
      { id: 'b', text: '17' },
      { id: 'c', text: '14' },
      { id: 'd', text: '35' },
    ],
    correctId: 'b',
    explanation: '2 × 5 = 10, więc 7 + 10 = 17.',
  },
  {
    id: 'oblicz-nawias',
    question: '(8 − 3) × 2 = ?',
    options: [
      { id: 'a', text: '10' },
      { id: 'b', text: '13' },
      { id: 'c', text: '8' },
      { id: 'd', text: '11' },
    ],
    correctId: 'a',
    explanation: '8 − 3 = 5, więc 5 × 2 = 10.',
  },
  {
    id: 'oblicz-dwa-priorytety',
    question: '20 : 4 + 3 × 2 = ?',
    options: [
      { id: 'a', text: '10' },
      { id: 'b', text: '13' },
      { id: 'c', text: '11' },
      { id: 'd', text: '16' },
    ],
    correctId: 'c',
    explanation: '20 : 4 = 5, a 3 × 2 = 6, więc 5 + 6 = 11.',
  },
  {
    id: 'ktore-najpierw',
    question: 'Które działania liczysz najpierw w 10 − 2 × 3 + 4 : 2?',
    options: [
      { id: 'a', text: 'Tylko 2 × 3' },
      { id: 'b', text: 'I 2 × 3, i 4 : 2 — oba przed dodawaniem i odejmowaniem' },
      { id: 'c', text: 'Tylko 4 : 2' },
      { id: 'd', text: 'Żadne — liczymy od lewej do prawej' },
    ],
    correctId: 'b',
    explanation: 'Mnożenie i dzielenie mają pierwszeństwo przed dodawaniem i odejmowaniem — oba te działania liczysz najpierw.',
  },
  {
    id: 'oblicz-mieszane',
    question: '6 + (10 − 4) : 3 = ?',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '12' },
      { id: 'c', text: '4' },
      { id: 'd', text: '8' },
    ],
    correctId: 'd',
    explanation: '10 − 4 = 6, a 6 : 3 = 2, więc 6 + 2 = 8.',
  },
];

const CHEAT_SHEET = [
  'Nawiasy zawsze liczysz pierwsze.',
  'Mnożenie i dzielenie liczysz przed dodawaniem i odejmowaniem.',
  'Działania o tym samym priorytecie liczysz od lewej do prawej.',
  'Reguła sama ustawia kolejność — nawiasy dokładasz tylko, gdy chcesz ją zmienić.',
  'Nawet komputery i kalkulatory naukowe trzymają się dokładnie tych samych trzech zasad.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/kolejnosc-dzialan/kolka-zebate.jpg',
  rozgrzewka: '/images/matematyka/lekcje/kolejnosc-dzialan/chlopiec-mysli.jpg',
  nowePojecie: '/images/matematyka/lekcje/kolejnosc-dzialan/kostki-domina.jpg',
  przyklady: '/images/matematyka/lekcje/kolejnosc-dzialan/dziewczynka-liczy.jpg',
  piknik: '/images/matematyka/lekcje/kolejnosc-dzialan/piknik-klasowy.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function KolejnoscDzialanLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const concept = useStepDone('nowe-pojecie');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('trening');
  const problem = useStepDone('piknik');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Znasz już trzy zasady kolejności działań — teraz zobaczysz, jak <strong>same</strong>{' '}
            rozwiązują nawet długie, poplątane wyrażenia, i wytrenujesz je na ćwiczeniach.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Parentheses, text: 'Nawiasy zawsze pierwsze, bez wyjątku' },
              { icon: Multiply, text: 'Mnożenie i dzielenie przed dodawaniem i odejmowaniem' },
              { icon: SplitSquareHorizontal, text: 'Ten sam priorytet — liczysz od lewej do prawej' },
              { icon: ListOrdered, text: 'Jedno długie wyrażenie, rozwiązane krok po kroku' },
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
            alt="Kolorowe drewniane kółka zębate zazębione ze sobą na stole"
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
          variant="basic"
          color={color}
          image={IMAGES.rozgrzewka}
          alt="Chłopiec zastanawiający się nad wyrażeniem matematycznym"
        >
          <p>
            Zanim policzysz wynik, sprawdź wyczucie — którą część wyrażenia policzysz jako
            pierwszą?
          </p>
        </LessonImageCard>
        <FirstStepWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Kostki domina ustawione w rządku, uchwycone w trakcie przewracania się jedna po drugiej"
          lead="Kliknij raz — reszta dzieje się sama, krok po kroku."
        >
          Jedno duże wyrażenie, trzy zasady, jedna kaskada obliczeń — obserwuj, jak się rozwija.
        </LessonImageCard>
        <CalculationCascadeIntro color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="3 przykłady, jedna pułapka"
          alt="Dziewczynka z dwoma warkoczykami licząca w skupieniu"
        >
          Trzy poprawne zastosowania zasad, a czwarty przykład to błąd — dorysowany nawias,
          którego nie było.
        </LessonImageCard>
        <OrderExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <OrderDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="piknik">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.piknik}
          alt="Koc piknikowy z sokami i ciastkami rozłożonymi na trawie"
          reverse
          lead="Budżet pikniku policzysz jednym wyrażeniem — bez rozbijania go na kawałki."
        >
          Wykorzystaj to, czego się nauczyłeś, żeby policzyć koszty klasowego wyjścia.
        </LessonImageCard>
        <PicnicBudgetChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: kolejność wykonywania działań</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama zasada działa dla każdego wyrażenia, niezależnie od tego, jak długie by nie było.
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

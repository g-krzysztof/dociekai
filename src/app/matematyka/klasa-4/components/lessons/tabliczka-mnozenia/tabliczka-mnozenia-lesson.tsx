'use client';

import Image from 'next/image';
import { Divide, Repeat, Timer, X as Multiply } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { ProductDuel } from './product-duel';
import { FactTriangleIntro } from './fact-triangle-intro';
import { MultiplicationExamples } from './multiplication-examples';
import { SpeedRound } from './speed-round';
import { BakeryBoxesChallenge } from './bakery-boxes-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Który iloczyn jest większy?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Trzy liczby, cztery powiązane działania',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Sprytne sposoby na trudne fakty',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Błyskawiczna tabliczka',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'piekarnia',
    kind: 'Zadanie problemowe',
    title: 'Ciastka w pudełkach',
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
    id: 'z-mnozenia-dzielenie',
    question: 'Znasz 8 × 6 = 48. Ile wynosi 48 : 8?',
    options: [
      { id: 'a', text: '8' },
      { id: 'b', text: '48' },
      { id: 'c', text: '7' },
      { id: 'd', text: '6' },
    ],
    correctId: 'd',
    explanation: '48 : 8 pyta, przez co pomnożyć 8, żeby dostać 48 — to 6, bo 8 × 6 = 48.',
  },
  {
    id: 'oblicz-9x7',
    question: '9 × 7 = ?',
    options: [
      { id: 'a', text: '63' },
      { id: 'b', text: '56' },
      { id: 'c', text: '72' },
      { id: 'd', text: '54' },
    ],
    correctId: 'a',
    explanation: '9 × 7 = 63 — jeden z faktów warty zapamiętania na pamięć.',
  },
  {
    id: 'fauszywe-rownanie',
    question: 'Które z tych równań jest fałszywe?',
    options: [
      { id: 'a', text: '7 × 9 = 63' },
      { id: 'b', text: '9 × 7 = 63' },
      { id: 'c', text: '63 : 9 = 6' },
      { id: 'd', text: '63 : 7 = 9' },
    ],
    correctId: 'c',
    explanation: '63 : 9 = 7, nie 6 — to jedyne fałszywe zdanie wśród działań łączących liczby 7, 9 i 63.',
  },
  {
    id: 'strategia-9x8',
    question: 'Żeby policzyć 9 × 8 najszybciej w pamięci, dobrze jest pomyśleć:',
    options: [
      { id: 'a', text: '9 × 8 razy dziesięć' },
      { id: 'b', text: '10 × 8 − 8' },
      { id: 'c', text: '8 + 9' },
      { id: 'd', text: 'To za trudne, trzeba liczyć na kartce' },
    ],
    correctId: 'b',
    explanation: 'Mnożenie przez 9 najłatwiej policzyć jako „przez 10 i odejmij tę liczbę raz”: 80 − 8 = 72.',
  },
  {
    id: 'dlaczego-pomaga',
    question: 'Dlaczego znajomość mnożenia pomaga w dzieleniu?',
    options: [
      { id: 'a', text: 'To dwa zupełnie różne, niepowiązane działania' },
      { id: 'b', text: 'Bo w dzieleniu zawsze wynik jest mniejszy' },
      { id: 'c', text: 'To nieprawda, dzielenia trzeba uczyć się zupełnie osobno' },
      { id: 'd', text: 'Bo dzielenie to szukanie brakującego czynnika w znanym mnożeniu' },
    ],
    correctId: 'd',
    explanation: 'Dzielenie i mnożenie opierają się na tych samych trzech liczbach — znajomość jednego mnożenia daje ci od razu dwa dzielenia za darmo.',
  },
];

const CHEAT_SHEET = [
  'Mnożenie i dzielenie łączą te same trzy liczby: 6 × 7 = 42, 7 × 6 = 42, 42 : 6 = 7, 42 : 7 = 6.',
  'Dzielenie to pytanie o brakujący czynnik: „przez co pomnożyć, żeby dostać tę liczbę?”.',
  'Trudny fakt zamień na łatwiejszy: podwajanie, mnożenie przez 10 i korekta, albo znany sąsiad.',
  'Kwadrat liczby (np. 7 × 7) jest zawsze o 1 większy niż iloczyn jej sąsiadów (6 × 8).',
  'Szybkość w tabliczce mnożenia to trening, nie talent — im częściej ćwiczysz, tym szybciej liczysz.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/tabliczka-mnozenia/domino-pary.jpg',
  rozgrzewka: '/images/matematyka/lekcje/tabliczka-mnozenia/porownanie.jpg',
  nowePojecie: '/images/matematyka/lekcje/tabliczka-mnozenia/trzy-zebatki.jpg',
  przyklady: '/images/matematyka/lekcje/tabliczka-mnozenia/namysl.jpg',
  piekarnia: '/images/matematyka/lekcje/tabliczka-mnozenia/pudelka-ciastek.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function TabliczkaMnozeniaLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('piekarnia');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Znasz już tabliczkę mnożenia z klas I–III — ta lekcja utrwala ją i dokłada coś nowego:{' '}
            <strong>dzielenie to nie osobna umiejętność</strong>, tylko mnożenie odczytane od tyłu.
            Poznasz też sprytne sposoby na te fakty, które wciąż wymagają zastanowienia.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Multiply, text: 'Jak jeden fakt mnożenia daje ci cztery działania za darmo' },
              { icon: Divide, text: 'Dlaczego dzielenie to szukanie brakującego czynnika' },
              { icon: Repeat, text: 'Sprytne sposoby na trudniejsze fakty z tabliczki' },
              { icon: Timer, text: 'Jak trenować szybkość, nie tylko poprawność' },
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
            alt="Kolorowe kostki domina ułożone w dopasowane pary na stole"
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
          alt="Dziecko porównujące coś w obu dłoniach, jakby ważyło, co jest większe"
        >
          <p>
            Zanim zaczniesz ćwiczyć na czas, sprawdź wyczucie — bez liczenia na kartce, który
            iloczyn wygląda na większy?
          </p>
        </LessonImageCard>
        <ProductDuel color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Trzy kolorowe drewniane zębatki, zazębione i obracające się razem"
          lead="Trzy powiązane liczby — poruszą się razem, jak zazębione koła."
        >
          Poznaj oba czynniki i ich iloczyn naraz, a dostaniesz aż cztery działania za darmo.
        </LessonImageCard>
        <FactTriangleIntro color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="3"
          image={IMAGES.przyklady}
          alt="Dziecko zamyślone, z ręką przy podbródku, patrzące w górę"
          kicker="3 sposoby na trudne fakty"
        >
          Kilka faktów z tabliczki mnożenia wymaga chwili zastanowienia — te sztuczki skracają ją
          do sekundy.
        </LessonImageCard>
        <MultiplicationExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <SpeedRound color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="piekarnia">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.piekarnia}
          alt="Świeże ciastka pakowane do kartonowego pudełka w piekarni"
          reverse
          lead="Piekarnia, pudełka po równej liczbie ciastek — mnożenie i dzielenie w jednym miejscu."
        >
          Wykorzystaj to, czego się nauczyłeś, żeby policzyć zamówienia najszybciej, jak się da.
        </LessonImageCard>
        <BakeryBoxesChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: mnożenie i dzielenie w pięciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama zależność działa dla każdej tabliczki, od 1 do 10.
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

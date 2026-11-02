'use client';

import Image from 'next/image';
import { Box, Grid3x3, Ruler, TriangleAlert } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { SquareSpotter } from './square-spotter';
import { SquareCubeBuilder } from './square-cube-builder';
import { SquareCubeExamples } from './square-cube-examples';
import { SquareCubeDrill } from './square-cube-drill';
import { ChessAndCubeChallenge } from './chess-and-cube-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Czy to liczba kwadratowa?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Zbuduj kwadrat i sześcian tej samej liczby',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Nie myl kwadratu z razy dwa',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz kwadraty i sześciany',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'szachownica',
    kind: 'Zadanie problemowe',
    title: 'Szachownica i kostka Rubika',
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
    id: 'co-oznacza-kwadrat',
    question: 'Co oznacza zapis 6²?',
    options: [
      { id: 'a', text: '6 × 6' },
      { id: 'b', text: '6 × 2' },
      { id: 'c', text: '6 + 6' },
      { id: 'd', text: '6 × 6 × 6' },
    ],
    correctId: 'a',
    explanation: 'Mały „2” oznacza kwadrat — liczbę pomnożoną przez samą siebie: 6² = 6 × 6.',
  },
  {
    id: 'oblicz-4-szescian',
    question: '4³ = ?',
    options: [
      { id: 'a', text: '12' },
      { id: 'b', text: '64' },
      { id: 'c', text: '16' },
      { id: 'd', text: '81' },
    ],
    correctId: 'b',
    explanation: '4³ = 4 × 4 × 4 = 64.',
  },
  {
    id: 'szescian-piatki',
    question: 'Która liczba to sześcian liczby 5?',
    options: [
      { id: 'a', text: '25' },
      { id: 'b', text: '10' },
      { id: 'c', text: '125' },
      { id: 'd', text: '15' },
    ],
    correctId: 'c',
    explanation: '5³ = 5 × 5 × 5 = 125.',
  },
  {
    id: 'dziewiec-kwadrat-jakiej',
    question: '9 to kwadrat której liczby?',
    options: [
      { id: 'a', text: '4' },
      { id: 'b', text: '81' },
      { id: 'c', text: '3' },
      { id: 'd', text: '18' },
    ],
    correctId: 'c',
    explanation: '3 × 3 = 9, więc 9 to kwadrat liczby 3.',
  },
  {
    id: 'rubik-male-kostki',
    question: 'Ile małych kostek ma kostka Rubika (sześcian o boku 3)?',
    options: [
      { id: 'a', text: '9' },
      { id: 'b', text: '27' },
      { id: 'c', text: '33' },
      { id: 'd', text: '18' },
    ],
    correctId: 'b',
    explanation: '3³ = 3 × 3 × 3 = 27 — tyle małych kostek ma kostka Rubika.',
  },
];

const CHEAT_SHEET = [
  'Kwadrat liczby: n² = n × n (liczba pomnożona przez samą siebie).',
  'Sześcian liczby: n³ = n × n × n (liczba pomnożona przez samą siebie trzy razy).',
  'Kwadrat to pole kwadratu o boku n, sześcian to objętość sześcianu o boku n.',
  'Nie myl „do kwadratu” z „razy dwa” — 4² = 16, a nie 4 × 2 = 8.',
  'Kostka Rubika to fizyczny przykład sześcianu: 3 × 3 × 3 = 27.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/kwadraty-i-szesciany/klocki-szescian.jpg',
  rozgrzewka: '/images/matematyka/lekcje/kwadraty-i-szesciany/dziewczynka-szacuje-kwadrat.jpg',
  nowePojecie: '/images/matematyka/lekcje/kwadraty-i-szesciany/szachownica.jpg',
  przyklady: '/images/matematyka/lekcje/kwadraty-i-szesciany/chlopiec-liczy-kwadrat.jpg',
  szachownica: '/images/matematyka/lekcje/kwadraty-i-szesciany/kostka-i-szachownica.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function KwadratyISzescianyLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('szachownica');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Liczba pomnożona przez samą siebie ma swoją nazwę — <strong>kwadrat</strong>. A liczba
            pomnożona przez samą siebie trzy razy — <strong>sześcian</strong>. Zobaczysz, jak jedna
            i ta sama liczba tworzy zarówno płaski kwadrat, jak i przestrzenny sześcian.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Grid3x3, text: 'Skąd się bierze kwadrat liczby — i jak wygląda' },
              { icon: Box, text: 'Skąd się bierze sześcian liczby — w trzech wymiarach' },
              { icon: TriangleAlert, text: 'Dlaczego kwadrat to nie to samo co razy dwa' },
              { icon: Ruler, text: 'Jak te wzory ukrywają się w szachownicy i kostce Rubika' },
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
            alt="Drewniane klocki ułożone w większy sześcian złożony z mniejszych kostek"
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
          alt="Dziewczynka zastanawiająca się nad liczbą, z ręką przy podbródku"
        >
          <p>
            Zanim zobaczysz skąd biorą się kwadraty i sześciany, sprawdź wyczucie — czy tę liczbę
            da się otrzymać, mnożąc jakąś liczbę przez samą siebie?
          </p>
        </LessonImageCard>
        <SquareSpotter color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Szachownica z na przemian jasnymi i ciemnymi polami, widok z bliska"
          lead="Ta sama liczba, dwa kształty: płaski kwadrat i przestrzenny sześcian."
        >
          Wybierz liczbę i zobacz, jak jednocześnie rośnie kwadrat obok i sześcian złożony z
          małych kostek.
        </LessonImageCard>
        <SquareCubeBuilder color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="3 przykłady, jedna pułapka"
          alt="Chłopiec liczący w skupieniu, patrzący w bok"
        >
          Kwadrat, sześcian, pytanie odwrotne — a czwarty przykład to błąd, który łatwo popełnić.
        </LessonImageCard>
        <SquareCubeExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <SquareCubeDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="szachownica">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.szachownica}
          alt="Kostka Rubika obok szachownicy na drewnianym stole"
          reverse
          lead="Dwa znane przedmioty, dwa wzory: kwadrat i sześcian."
        >
          Wykorzystaj to, czego się nauczyłeś, żeby policzyć pola szachownicy i kostki różnych
          rozmiarów.
        </LessonImageCard>
        <ChessAndCubeChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: kwadraty i sześciany</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama zasada działa dla każdej liczby naturalnej.
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

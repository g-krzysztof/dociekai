'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowRightLeft, BookOpen, Hash, Landmark, Sparkles } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { TallyWarmup } from './tally-warmup';
import { RomanForgeIntro } from './roman-forge-intro';
import { ConversionExamples } from './conversion-examples';
import { RomanDrill } from './roman-drill';
import { InscriptionChallenge } from './inscription-challenge';
import { ROMAN_RULES } from '../../../lib/roman';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ile kresek widzisz?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Zbuduj liczbę symbol po symbolu',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Zamiana w obie strony',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Zamień liczby',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'napis',
    kind: 'Zadanie problemowe',
    title: 'Napisy, które już rozumiesz',
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
    id: 'podstawowe-symbole',
    question: 'Które litery to podstawowe symbole liczb rzymskich?',
    options: [
      { id: 'a', text: '1, 5, 10, 50, 100' },
      { id: 'b', text: 'A, E, I, O, U' },
      { id: 'c', text: 'I, V, X, L, C, D, M' },
      { id: 'd', text: 'I, II, III, IV, V' },
    ],
    correctId: 'c',
    explanation:
      'Siedem podstawowych symboli: I (1), V (5), X (10), L (50), C (100), D (500), M (1000).',
  },
  {
    id: 'mniejszy-przed-wiekszym',
    question: 'Kiedy mniejszy symbol stoi PRZED większym (np. w IV), to znaczy, że trzeba go:',
    options: [
      { id: 'a', text: 'odjąć' },
      { id: 'b', text: 'pomnożyć przez 2' },
      { id: 'c', text: 'zignorować' },
      { id: 'd', text: 'dodać po nim jeszcze raz' },
    ],
    correctId: 'a',
    explanation: 'IV = 5 − 1 = 4. Mniejszy symbol przed większym zawsze oznacza odejmowanie.',
  },
  {
    id: 'ile-to-xl',
    question: 'Ile to XL?',
    options: [
      { id: 'a', text: '60' },
      { id: 'b', text: '90' },
      { id: 'c', text: '35' },
      { id: 'd', text: '40' },
    ],
    correctId: 'd',
    explanation: 'X przed L odejmuje: 50 − 10 = 40.',
  },
  {
    id: 'zapis-osmiu',
    question: 'Który zapis liczby 8 jest poprawny w systemie rzymskim?',
    options: [
      { id: 'a', text: 'IIX' },
      { id: 'b', text: 'VIII' },
      { id: 'c', text: 'VIIII' },
      { id: 'd', text: 'IIII+IV' },
    ],
    correctId: 'b',
    explanation:
      'VIII = 5 + 1 + 1 + 1 = 8. Symboli I nie powtarza się więcej niż trzy razy pod rząd.',
  },
  {
    id: 'dlaczego-trudno',
    question: 'Dlaczego dodawanie pisemne (w słupku) jest trudne w systemie rzymskim?',
    options: [
      {
        id: 'a',
        text: 'Bo symbole nie mają wartości pozycyjnej — ten sam znak znaczy tyle samo niezależnie od miejsca w zapisie',
      },
      { id: 'b', text: 'Bo są za krótkie do zapisania' },
      { id: 'c', text: 'Bo nie miały zapisu liczb większych niż 100' },
      { id: 'd', text: 'To nieprawda — liczy się nimi tak samo łatwo jak liczbami arabskie' },
    ],
    correctId: 'a',
    explanation:
      'W naszym systemie 3 znaczy co innego w liczbie 30 niż w 300. W rzymskim C zawsze znaczy 100 — dlatego dziś liczymy inaczej.',
  },
  {
    id: 'trzy-tysiace',
    question: 'Ile symboli M potrzeba, żeby zapisać liczbę 3000?',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '2' },
      { id: 'c', text: '3' },
      { id: 'd', text: '4' },
    ],
    correctId: 'c',
    explanation:
      'MMM = 1000 + 1000 + 1000 = 3000 — trzy razy pod rząd, maksymalnie tyle, ile wolno.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/system-rzymski/tajemnicza-tabliczka.jpg',
  rozgrzewka: '/images/matematyka/lekcje/system-rzymski/patyczki-do-liczenia.jpg',
  nowePojecie: '/images/matematyka/lekcje/system-rzymski/budowanie-z-klockow.jpg',
  przyklady: '/images/matematyka/lekcje/system-rzymski/zegar-sloneczny.jpg',
  napis: '/images/matematyka/lekcje/system-rzymski/stary-pomnik.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function SystemRzymskiLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('napis');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Skrót do przewodnika — dla kogoś, kto trafił wprost na lekcję i nie zna jeszcze zasad */}
      <Link
        href="/matematyka/klasa-4/obliczenia-praktyczne/przewodnik-cyfry-rzymskie"
        className="group flex items-center gap-3 border-l-4 p-4 transition-colors"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <BookOpen className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <span className="min-w-0 flex-1 text-sm leading-relaxed sm:text-base">
          Nie znasz jeszcze zasad zapisu?{' '}
          <strong style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
            Zacznij od przewodnika
          </strong>{' '}
          — wykłada je po kolei, bez zadań.
        </span>
        <ArrowRight
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
          style={{ color }}
          aria-hidden
        />
      </Link>

      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Zanim powstały cyfry, których dziś używamy, liczby zapisywano zupełnie inaczej —{' '}
            <strong>bez wartości pozycyjnej</strong>, za to za pomocą siedmiu liter. System rzymski
            wciąż otacza cię na co dzień: na zegarach, starych budynkach i w napisach filmowych.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Hash, text: 'Siedem symboli, które budują każdą liczbę do 3000' },
              {
                icon: ArrowRightLeft,
                text: 'Zamiana w obie strony: z liczby na zapis rzymski i odwrotnie',
              },
              { icon: Landmark, text: 'Gdzie naprawdę spotkasz rzymskie cyfry w codziennym życiu' },
              { icon: Sparkles, text: 'Dlaczego czasem mniejszy symbol stoi przed większym' },
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
            alt="Dziecko oglądające starą, tajemniczą kamienną tabliczkę z wyrytymi znakami"
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
          alt="Patyczki do liczenia ułożone w rządku na drewnianym stole"
        >
          <p>
            Zanim poznasz symbole, sprawdź, dlaczego w ogóle są potrzebne — spróbuj oszacować liczbę
            kresek bez liczenia po kolei.
          </p>
        </LessonImageCard>
        <TallyWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Dziecko układające drewniane klocki różnej wielkości w rządku"
          lead="Liczbę budujesz tak samo jak zawsze — miejsce po miejscu, tylko innymi symbolami."
        >
          Tysiące, setki, dziesiątki, jedności — każde miejsce ma swój symbol, a licznik pokaże ci
          na żywo, jak rośnie wartość.
        </LessonImageCard>
        <RomanForgeIntro color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          alt="Zegar słoneczny w ogrodzie, rzucający długi cień"
          kicker="4 przykłady w obie strony"
        >
          Czasem znasz liczbę i szukasz zapisu rzymskiego, czasem odwrotnie — metoda jest za każdym
          razem ta sama.
        </LessonImageCard>
        <ConversionExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <RomanDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="napis">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.napis}
          alt="Stary kamienny pomnik na miejskim placu, porośnięty bluszczem"
          reverse
          lead="Rzymskie cyfry nie zostały w podręczniku — są tuż obok, trzeba tylko umieć je odczytać."
        >
          Wykorzystaj to, czego się właśnie nauczyłeś, żeby odczytać prawdziwe napisy.
        </LessonImageCard>
        <InscriptionChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: system rzymski w pięciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama metoda działa dla każdej liczby do 3000.
        </p>
        <ol className="divide-y border">
          {ROMAN_RULES.map((rule, index) => (
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

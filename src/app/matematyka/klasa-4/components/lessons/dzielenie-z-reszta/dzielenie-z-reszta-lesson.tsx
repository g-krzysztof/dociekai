'use client';

import Image from 'next/image';
import { Divide, Equal, Shuffle, TriangleAlert } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { RemainderGuess } from './remainder-guess';
import { RemainderDealIntro } from './remainder-deal-intro';
import { RemainderExamples } from './remainder-examples';
import { RemainderDrill } from './remainder-drill';
import { SchoolTripChallenge } from './school-trip-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Wyjdzie równo, czy zostanie reszta?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Rozdaj po kolei i zobacz, co zostaje',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Reszta zawsze mniejsza niż dzielnik',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz dzielenie z resztą',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'wycieczka',
    kind: 'Zadanie problemowe',
    title: 'Wycieczka szkolna',
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
    id: 'co-oznacza',
    question: 'Co to znaczy, że 23 : 5 = 4 r 3?',
    options: [
      { id: 'a', text: '23 rozdzielone na 5 grup — każda dostaje po 4, a 3 zostają' },
      { id: 'b', text: '23 razy 5 to 4, i jeszcze 3' },
      { id: 'c', text: '23 minus 5 to 4 razy 3' },
      { id: 'd', text: '5 podzielone przez 23 daje 4 r 3' },
    ],
    correctId: 'a',
    explanation: 'Iloraz (4) mówi, ile pełnych grup po 5 się zmieściło, a reszta (3) to to, co zostało nierozdzielone.',
  },
  {
    id: 'oblicz-40-7',
    question: '40 : 7 = ?',
    options: [
      { id: 'a', text: '6 r 2' },
      { id: 'b', text: '5 r 5' },
      { id: 'c', text: '5 r 4' },
      { id: 'd', text: '6 r 0' },
    ],
    correctId: 'b',
    explanation: '7 × 5 = 35, a 40 − 35 = 5, więc 40 : 7 = 5 r 5.',
  },
  {
    id: 'niemozliwa-reszta',
    question: 'Dzielisz przez 6. Która z tych liczb NIE może być resztą?',
    options: [
      { id: 'a', text: '0' },
      { id: 'b', text: '3' },
      { id: 'c', text: '6' },
      { id: 'd', text: '5' },
    ],
    correctId: 'c',
    explanation: 'Reszta zawsze musi być mniejsza niż dzielnik — przy dzieleniu przez 6 największa możliwa reszta to 5.',
  },
  {
    id: 'pudelka-ksiazek',
    question: '38 książek pakujemy po 6 do pudełka. Ile pudełek potrzeba, żeby zmieściły się WSZYSTKIE książki?',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '7' },
      { id: 'c', text: '8' },
      { id: 'd', text: '2' },
    ],
    correctId: 'b',
    explanation: '38 : 6 = 6 r 2 — sześć pełnych pudełek i siódme, niepełne, na ostatnie 2 książki.',
  },
  {
    id: 'oblicz-12-4',
    question: '12 : 4 = ?',
    options: [
      { id: 'a', text: '3 r 0' },
      { id: 'b', text: '2 r 4' },
      { id: 'c', text: '3 r 1' },
      { id: 'd', text: '4 r 0' },
    ],
    correctId: 'a',
    explanation: '4 × 3 = 12 dokładnie, więc reszta wynosi 0 — 12 dzieli się przez 4 bez reszty.',
  },
];

const CHEAT_SHEET = [
  'Dzielenie z resztą: dzielna = dzielnik × iloraz + reszta (np. 17 = 5 × 3 + 2).',
  'Reszta zawsze musi być mniejsza niż dzielnik — inaczej dzielenie nie jest skończone.',
  'Reszta może wynosić 0 — wtedy liczba dzieli się bez reszty.',
  'W zadaniach z życia czasem trzeba zaokrąglić w górę (np. autokary), a czasem po prostu podać resztę.',
  'To dokładnie ta sama zasada, która decyduje, czy rok jest przestępny.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/dzielenie-z-reszta/talerzyki-z-resztka.jpg',
  rozgrzewka: '/images/matematyka/lekcje/dzielenie-z-reszta/chlopiec-mysli.jpg',
  nowePojecie: '/images/matematyka/lekcje/dzielenie-z-reszta/rozdawanie-kart.jpg',
  przyklady: '/images/matematyka/lekcje/dzielenie-z-reszta/dziewczynka-liczy.jpg',
  wycieczka: '/images/matematyka/lekcje/dzielenie-z-reszta/autobus-szkolny.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function DzielenieZResztaLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('wycieczka');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Nie każde dzielenie wychodzi równo. Czasem po rozdzieleniu <strong>coś zostaje</strong> —
            i to jest właśnie reszta. Nauczysz się ją liczyć i rozpoznawać, kiedy w ogóle się
            pojawia.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Shuffle, text: 'Jak rozdawanie po kolei pokazuje, co zostaje w resztce' },
              { icon: Equal, text: 'Wzór łączący dzielną, dzielnik, iloraz i resztę' },
              { icon: TriangleAlert, text: 'Dlaczego reszta zawsze musi być mniejsza niż dzielnik' },
              { icon: Divide, text: 'Kiedy resztę trzeba zaokrąglić w górę, a kiedy nie' },
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
            alt="Talerzyki z równo rozłożonymi cukierkami i kilkoma cukierkami odłożonymi osobno jako reszta"
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
          alt="Chłopiec zastanawiający się nad wynikiem dzielenia"
        >
          <p>
            Zanim policzysz resztę dokładnie, sprawdź wyczucie — korzystając z tabliczki mnożenia,
            zgadnij, czy dzielenie wyjdzie równo.
          </p>
        </LessonImageCard>
        <RemainderGuess color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Karty do gry rozdawane po kolei na cztery stosy, z kilkoma kartami odłożonymi osobno"
          lead="Rozdaj po kolei — dokładnie jak karty przy stole."
        >
          Kliknij „Rozdaj!” i zobacz, co się dzieje, gdy przedmiotów nie da się podzielić na równe
          grupy co do jednego.
        </LessonImageCard>
        <RemainderDealIntro color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="3 przykłady, jedna pułapka"
          alt="Dziewczynka licząca w skupieniu, patrząca w bok"
        >
          Trzy poprawne dzielenia z resztą, a czwarty przykład to błąd — znajdziesz go, zanim
          poznasz wyjaśnienie.
        </LessonImageCard>
        <RemainderExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <RemainderDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="wycieczka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wycieczka}
          alt="Wnętrze pustego szkolnego autobusu z rzędami foteli, w ciepłym popołudniowym świetle"
          reverse
          lead="Czasem resztę trzeba zaokrąglić w górę — bo każdy potrzebuje miejsca."
        >
          Policz, ile autokarów naprawdę trzeba wynająć, żeby zabrać wszystkich uczniów.
        </LessonImageCard>
        <SchoolTripChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: dzielenie z resztą</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama zasada działa niezależnie od tego, jak duże są liczby.
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

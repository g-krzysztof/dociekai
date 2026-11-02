'use client';

import Image from 'next/image';
import { ArrowRightLeft, CalendarClock, Hourglass, Timer } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { ZegarowyWarmup } from './zegarowy-warmup';
import { ElapsedTimeIntro } from './elapsed-time-intro';
import { TimeExamples } from './time-examples';
import { CzasDrill } from './czas-drill';
import { PlanDniaChallenge } from './plan-dnia-challenge';
import { TIME_RULES } from '../../../lib/time';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Sekunda, minuta czy godzina?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Doliczaj skoki po tarczy zegara',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: '4 przykłady: zamiana i upływ czasu',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz zamianę i upływ czasu',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'plan-dnia',
    kind: 'Zadanie problemowe',
    title: 'Policz sobotni plan Zosi',
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
    id: 'h-na-min',
    question: 'Ile minut ma 1 godzina?',
    options: [
      { id: 'a', text: '600' },
      { id: 'b', text: '60' },
      { id: 'c', text: '6' },
      { id: 'd', text: '100' },
    ],
    correctId: 'b',
    explanation: '1 godzina to 60 minut.',
  },
  {
    id: 's-na-min',
    question: '180 sekund to ile minut?',
    options: [
      { id: 'a', text: '3' },
      { id: 'b', text: '30' },
      { id: 'c', text: '18' },
      { id: 'd', text: '1,8' },
    ],
    correctId: 'a',
    explanation: '180 s : 60 = 3 min, bo minuta ma 60 sekund.',
  },
  {
    id: 'lekcja',
    question: 'Lekcja trwa od 8:00 do 8:45. Ile trwa lekcja?',
    options: [
      { id: 'a', text: '35 min' },
      { id: 'b', text: '55 min' },
      { id: 'c', text: '40 min' },
      { id: 'd', text: '45 min' },
    ],
    correctId: 'd',
    explanation: 'Od 8:00 do 8:45 to po prostu 45 minut — start jest już na pełnej godzinie.',
  },
  {
    id: 'przerwa',
    question: 'Przerwa: 10:50–11:05. Ile trwa przerwa?',
    options: [
      { id: 'a', text: '55 min' },
      { id: 'b', text: '5 min' },
      { id: 'c', text: '15 min' },
      { id: 'd', text: '25 min' },
    ],
    correctId: 'c',
    explanation: 'Od 10:50 do 11:00 to 10 min, plus jeszcze 5 min do 11:05 — razem 15 min.',
  },
  {
    id: 'podroz',
    question: 'Podróż: wyjazd o 7:40, przyjazd o 10:15. Ile trwała podróż?',
    options: [
      { id: 'a', text: '2 h 35 min' },
      { id: 'b', text: '2 h 45 min' },
      { id: 'c', text: '3 h 25 min' },
      { id: 'd', text: '2 h 25 min' },
    ],
    correctId: 'a',
    explanation:
      'Od 7:40 do 8:00 to 20 min, od 8:00 do 10:00 to 2 godziny, od 10:00 do 10:15 to jeszcze 15 min. Razem 20 + 120 + 15 = 155 min, czyli 2 h 35 min.',
  },
  {
    id: 'zapis-12',
    question: 'Film zaczyna się o 20:00. Która to godzina w zapisie 12-godzinnym?',
    options: [
      { id: 'a', text: '8 rano' },
      { id: 'b', text: '2 po południu' },
      { id: 'c', text: '10 wieczorem' },
      { id: 'd', text: '8 wieczorem' },
    ],
    correctId: 'd',
    explanation: 'Zapis 24-godzinny po południu/wieczorem zamieniasz, odejmując 12: 20 − 12 = 8, czyli 8 wieczorem.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/obliczenia-zegarowe/klepsydra-na-drewnianym-stole.jpg',
  rozgrzewka: '/images/matematyka/lekcje/obliczenia-zegarowe/dzieci-w-wyscigu-rzedy.jpg',
  nowePojecie: '/images/matematyka/lekcje/obliczenia-zegarowe/zegar-scienny-wskazowki-z-bliska.jpg',
  przyklady: '/images/matematyka/lekcje/obliczenia-zegarowe/mechanizm-zegarka-kolka-zebate.jpg',
  planDnia: '/images/matematyka/lekcje/obliczenia-zegarowe/basen-odkryty-sloneczny-dzien.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ObliczeniaZegaroweLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('plan-dnia');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Znasz już tarczę zegara z przewodnika — teraz nauczysz się na niej{' '}
            <strong>liczyć</strong>: zamieniać godziny, minuty i sekundy między sobą i sprawnie
            liczyć, ile czasu upłynęło między dwoma momentami.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Hourglass, text: 'Doba, godzina, minuta, sekunda — wszystko razy 60' },
              { icon: ArrowRightLeft, text: 'Zamiana godzin na minuty i minut na sekundy' },
              {
                icon: Timer,
                text: 'Upływ czasu: doliczaj do pełnej godziny, potem pełne godziny, na końcu resztę minut',
              },
              { icon: CalendarClock, text: 'Prawdziwe plany dnia: trening, kino, wycieczka' },
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
            alt="Klepsydra z przesypującym się piaskiem na drewnianym stole"
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
          alt="Dzieci biegnące w sztafecie na szkolnym boisku"
        >
          <p>Zanim zaczniesz liczyć, sprawdź wyczucie — czy dana czynność trwa sekundy, minuty czy godziny?</p>
        </LessonImageCard>
        <ZegarowyWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Wskazówki i środkowa oś starego drewnianego zegara ściennego z bliska"
          lead="Skoki po osi liczbowej z Modułu 1 wracają — tylko że teraz oś jest okrągła."
        >
          Obejrzyj, jak wskazówka minutowa „doskakuje” do pełnej godziny, jak godzinowa
          przeskakuje całe godziny, a potem sam/a ułóż taką samą sekwencję skoków.
        </LessonImageCard>
        <ElapsedTimeIntro color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 przykłady: zamiana i upływ czasu"
          alt="Mechanizm zegarka z bliska — koła zębate i sprężyny"
        >
          Dwie zamiany jednostek i dwa obliczenia upływu czasu — w tym jedna klasyczna pułapka z
          pożyczaniem.
        </LessonImageCard>
        <TimeExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <CzasDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="plan-dnia">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.planDnia}
          alt="Odkryty basen w słoneczny dzień"
          reverse
          lead="Basen, obiad, kino — trzy odcinki czasu do policzenia, zanim je zsumujesz."
        >
          Policz, ile w sumie minut zajęły Zosi trzy zaplanowane na sobotę zajęcia.
        </LessonImageCard>
        <PlanDniaChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: obliczenia zegarowe w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama zasada „razy 60” i ta sama metoda doliczania działają w każdym zadaniu o czasie.
        </p>
        <ol className="divide-y border">
          {TIME_RULES.map((rule, index) => (
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

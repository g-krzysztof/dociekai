'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Brain, HeartHandshake, NotebookPen, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { MythCheck } from './myth-check';
import { ForgettingCurve } from './forgetting-curve';
import { NoteBuilder } from './note-builder';
import { ErrorWorkshop } from './error-workshop';
import { WeekPlanner } from './week-planner';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Mit czy prawda? Pięć zdań o matematyce',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'pamiec',
    kind: 'Nowe pojęcie',
    title: 'Dlaczego zapominasz — i jak temu zapobiec',
    time: '6 min',
    icon: 'Lightbulb',
  },
  {
    id: 'notatka',
    kind: 'Przykłady',
    title: 'Notatka, która naprawdę pomaga',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'bledy',
    kind: 'Ćwiczenia',
    title: 'Warsztat poprawy błędów',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'plan',
    kind: 'Zadanie problemowe',
    title: 'Zaplanuj swój tydzień z matematyką',
    time: '5 min',
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
    id: 'powtorka',
    question: 'W poniedziałek poznałeś nowy temat. Kiedy najlepiej zrobić pierwszą powtórkę?',
    options: [
      { id: 'a', text: 'Dopiero dzień przed sprawdzianem' },
      { id: 'b', text: 'Następnego dnia, przez 5 minut' },
      { id: 'c', text: 'Po dwóch tygodniach' },
      { id: 'd', text: 'Wcale — jak zrozumiałem, to pamiętam' },
    ],
    correctId: 'b',
    explanation:
      'Największy spadek krzywej zapominania dzieje się w pierwszej dobie. Pięć minut następnego dnia ratuje więcej niż godzina za tydzień.',
  },
  {
    id: 'notatka',
    question: 'Co powinno znaleźć się w dobrej notatce z matematyki?',
    options: [
      { id: 'a', text: 'Cała definicja przepisana z podręcznika' },
      { id: 'b', text: 'Sam wynik zadania' },
      { id: 'c', text: 'Reguła własnymi słowami i jeden przykład krok po kroku' },
      { id: 'd', text: 'Jak najwięcej kolorów, ramek i naklejek' },
    ],
    correctId: 'c',
    explanation:
      'Notatka ma po tygodniu przypomnieć ci, jak się to robi. Do tego wystarczy jedno zdanie po swojemu i jeden porządnie rozpisany przykład.',
  },
  {
    id: 'blad',
    question: 'Zrobiłeś zadanie i wyszedł zły wynik. Co robisz najpierw?',
    options: [
      { id: 'a', text: 'Przekreślam i przepisuję dobry wynik od kolegi' },
      { id: 'b', text: 'Szukam kroku, w którym pojawił się błąd' },
      { id: 'c', text: 'Pomijam to zadanie, bo pewnie jest za trudne' },
      { id: 'd', text: 'Zaczynam całą pracę domową od nowa' },
    ],
    correctId: 'b',
    explanation:
      'Sam poprawny wynik niczego nie uczy. Wartość ma dopiero znalezienie miejsca, w którym rozwiązanie „skręciło” w złą stronę.',
  },
  {
    id: 'plan',
    question: 'Masz w tygodniu 60 minut na matematykę. Jak je rozłożyć?',
    options: [
      { id: 'a', text: '60 minut w niedzielę wieczorem' },
      { id: 'b', text: '4 razy po 15 minut w różne dni' },
      { id: 'c', text: '2 razy po 30 minut tego samego dnia' },
      { id: 'd', text: 'Wszystko tuż przed klasówką' },
    ],
    correctId: 'b',
    explanation:
      'Ta sama godzina, zupełnie inny efekt. Cztery krótkie spotkania z tematem utrwalają go znacznie lepiej niż jeden długi zryw.',
  },
  {
    id: 'zeszyt',
    question: 'Po co prowadzić zeszyt błędów?',
    options: [
      { id: 'a', text: 'Żeby nauczyciel widział, że się staram' },
      { id: 'b', text: 'Żeby przepisać do niego wszystkie zadania z lekcji' },
      { id: 'c', text: 'Żeby przed sprawdzianem powtórzyć dokładnie te miejsca, w których się mylę' },
      { id: 'd', text: 'Żeby rodzice mieli co podpisywać' },
    ],
    correctId: 'c',
    explanation:
      'Zeszyt błędów to twoja osobista lista słabych punktów. Powtarzanie ich jest kilka razy skuteczniejsze niż powtarzanie całego działu.',
  },
];

const CHEAT_SHEET = [
  '15 minut dziennie bije 2 godziny raz w tygodniu.',
  'Powtarzaj po 1 dniu, po 3 dniach i po tygodniu.',
  'Notatka: krótko, własnymi słowami, z jednym przykładem.',
  'Zapisz swoją pułapkę — miejsce, w którym mylisz się najczęściej.',
  'Błąd najpierw znajdź, potem nazwij, na końcu popraw.',
  'Czegoś nie rozumiesz? Zapytaj tego samego dnia, nie przed sprawdzianem.',
];

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/jak-sie-uczyc/nauka.jpg',
  errors: '/images/matematyka/lekcje/jak-sie-uczyc/zeszyt-bledow.jpg',
  plan: '/images/matematyka/lekcje/jak-sie-uczyc/plan-tygodnia.jpg',
});

export function JakSieUczycLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/**
 * Treść lekcji wydzielona z komponentu strony, bo `useStepDone` musi działać
 * wewnątrz kontekstu z `LessonShell`.
 */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const memory = useStepDone('pamiec');
  const notes = useStepDone('notatka');
  const errors = useStepDone('bledy');
  const plan = useStepDone('plan');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Ta lekcja nie jest o liczbach. Jest o tym, co robisz z matematyką{' '}
            <strong>między lekcjami</strong>: jak notujesz, kiedy powtarzasz i co robisz, gdy coś ci
            nie wyjdzie. To ustawienia, które będą pracować dla ciebie przez cały rok — w każdym
            kolejnym module.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Brain, text: 'Dlaczego zapominasz i jak to zatrzymać' },
              { icon: NotebookPen, text: 'Jak wygląda notatka, która działa' },
              { icon: Timer, text: 'Ile i kiedy się uczyć w tygodniu' },
              { icon: HeartHandshake, text: 'Co zrobić z błędem zamiast się wstydzić' },
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
            alt="Uczeń przy biurku z zeszytem, budzikiem i żarówką w kształcie mózgu"
            width={240}
            height={240}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* 1. Rozgrzewka */}
      <LessonSection id="rozgrzewka">
        <MythCheck color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="pamiec">
        <ForgettingCurve color={color} onComplete={memory.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="notatka">
        <NoteBuilder color={color} onComplete={notes.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="bledy">
        <StepIntro
          color={color}
          image={IMAGES.errors}
          alt="Otwarty zeszyt z czerwonym krzyżykiem, zieloną fajką i lupą"
        >
          <p className="mb-3">
            Większość uczniów po sprawdzianie patrzy tylko na ocenę i chowa kartkę do plecaka. A
            właśnie tam jest najcenniejsza informacja w całej matematyce: <strong>lista miejsc, w
            których się mylisz</strong>.
          </p>
          <p>
            Poprawa błędu to trzy ruchy: <strong>znajdź</strong> linijkę, w której coś poszło nie
            tak, <strong>nazwij</strong> rodzaj błędu i dopiero potem <strong>popraw</strong>.
            Przećwiczmy to na trzech cudzych zadaniach — łatwiej zacząć od nie swoich pomyłek.
          </p>
        </StepIntro>
        <ErrorWorkshop color={color} onComplete={errors.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="plan">
        <StepIntro
          color={color}
          image={IMAGES.plan}
          alt="Kalendarz tygodniowy z kolorowymi blokami nauki, budzikiem i klepsydrą"
          reverse
        >
          <p>
            Wiesz już, <em>jak</em> się uczyć. Zostało najtrudniejsze pytanie:{' '}
            <strong>kiedy</strong>. Poniżej ułóż swój prawdziwy tydzień — taki, który naprawdę
            wykonasz, a nie taki, który ładnie wygląda na papierze.
          </p>
        </StepIntro>
        <WeekPlanner color={color} onComplete={plan.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: sześć zasad na cały rok</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Przepisz je na kartkę i przyklej nad biurkiem. Wracamy do nich w każdym module.
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

/** Wprowadzenie do kroku: ilustracja + krótki tekst przed samym ćwiczeniem. */
function StepIntro({
  color,
  image,
  alt,
  reverse = false,
  children,
}: {
  color: string;
  image: string;
  alt: string;
  reverse?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="mb-4 grid items-center gap-5 p-5 sm:p-6 md:grid-cols-[1fr_200px]"
      style={{ backgroundColor: `${color}0f` }}
    >
      <div
        className={cn(
          'text-sm leading-relaxed sm:text-base',
          reverse && 'md:order-2'
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          'relative mx-auto aspect-[4/3] w-full max-w-[220px] overflow-hidden',
          reverse && 'md:order-1'
        )}
      >
        <Image src={image} alt={alt} width={220} height={165} className="absolute inset-0 h-full w-full object-contain" />
      </div>
    </div>
  );
}

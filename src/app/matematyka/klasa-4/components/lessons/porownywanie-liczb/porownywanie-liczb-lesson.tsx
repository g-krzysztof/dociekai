'use client';

import Image from 'next/image';
import { ArrowLeftRight, Equal, Scale, Sparkles } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { NumberDuel } from './number-duel';
import { DigitCompare } from './digit-compare';
import { CompareExamples } from './compare-examples';
import { CompareDrill } from './compare-drill';
import { PaperDrive } from './paper-drive';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Pojedynek liczb',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'cyfry',
    kind: 'Nowe pojęcie',
    title: 'Porównaj cyfrę po cyfrze',
    time: '8 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy przypadki porównania',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Trening porównywania',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'makulatura',
    kind: 'Zadanie problemowe',
    title: 'Zbiórka makulatury',
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
    id: 'wiecej-cyfr',
    question: 'Która liczba jest większa: 950 czy 1005?',
    options: [
      { id: 'a', text: '950' },
      { id: 'b', text: '1005' },
    ],
    correctId: 'b',
    explanation: '950 ma 3 cyfry, a 1005 ma 4 cyfry — więcej cyfr, większa liczba.',
  },
  {
    id: 'znak-tysiace',
    question: 'Który znak pasuje? 6 342 ___ 6 298',
    options: [
      { id: 'a', text: '<' },
      { id: 'b', text: '>' },
      { id: 'c', text: '=' },
    ],
    correctId: 'b',
    explanation: 'Obie liczby zaczynają się na 6. Na miejscu setek: 3 > 2, więc 6342 > 6298.',
  },
  {
    id: 'ktora-cyfra-decyduje',
    question:
      'Liczby 8102 i 8120 mają te same dwie pierwsze cyfry (od lewej). Która cyfra decyduje, która liczba jest większa?',
    options: [
      { id: 'a', text: 'cyfra tysięcy' },
      { id: 'b', text: 'cyfra setek' },
      { id: 'c', text: 'cyfra dziesiątek' },
      { id: 'd', text: 'cyfra jedności' },
    ],
    correctId: 'c',
    explanation: 'Tysiące (8) i setki (1) są takie same w obu liczbach. Różnica pojawia się na miejscu dziesiątek: 0 w 8102, 2 w 8120.',
  },
  {
    id: 'najwieksza-z-trzech',
    question: 'Która z liczb: 4021, 4012, 4201 jest największa?',
    options: [
      { id: 'a', text: '4021' },
      { id: 'b', text: '4012' },
      { id: 'c', text: '4201' },
    ],
    correctId: 'c',
    explanation: 'Wszystkie zaczynają się na 4, ale 4201 ma na miejscu setek cyfrę 2 — więcej niż 0 w pozostałych.',
  },
  {
    id: 'kiedy-rowne',
    question: 'Kiedy między dwiema liczbami stawiamy znak „=”?',
    options: [
      { id: 'a', text: 'Gdy mają tyle samo cyfr' },
      { id: 'b', text: 'Gdy wszystkie cyfry są jednakowe, cyfra po cyfrze' },
      { id: 'c', text: 'Nigdy w matematyce' },
      { id: 'd', text: 'Gdy jedna jest podwojeniem drugiej' },
    ],
    correctId: 'b',
    explanation: 'Sama liczba cyfr to za mało — wszystkie muszą się zgadzać, cyfra po cyfrze, żeby liczby były równe.',
  },
];

const CHEAT_SHEET = [
  'Najpierw policz cyfry — więcej cyfr, większa liczba.',
  'Tyle samo cyfr? Porównuj od lewej, cyfra po cyfrze.',
  'Pierwsza różnica decyduje — reszta się już nie liczy.',
  'Wszystkie cyfry takie same? To znak „=”.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/porownywanie-liczb/waga.jpg',
  makulatura: '/images/matematyka/lekcje/porownywanie-liczb/makulatura.jpg',
  pojedynek: '/images/matematyka/lekcje/porownywanie-liczb/pojedynek.jpg',
  lupaKlocki: '/images/matematyka/lekcje/porownywanie-liczb/lupa-klocki.jpg',
  dymek: '/images/matematyka/lekcje/porownywanie-liczb/dymek.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function PorownywanieLiczbLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const digits = useStepDone('cyfry');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('trening');
  const problem = useStepDone('makulatura');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Umiesz już dzielić duże liczby na klasy i zaznaczać je na osi liczbowej. Teraz połączysz
            to w jedną umiejętność: <strong>szybkie i bezbłędne porównywanie</strong>. Nauczysz się
            reguły, która działa zawsze — niezależnie od tego, jak duże są liczby.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Scale, text: 'Dlaczego liczba cyfr rozstrzyga w pierwszej kolejności' },
              { icon: ArrowLeftRight, text: 'Jak porównywać cyfrę po cyfrze, od lewej' },
              { icon: Equal, text: 'Kiedy dwie liczby są naprawdę równe' },
              { icon: Sparkles, text: 'Klasyczne pułapki, które warto znać' },
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
            alt="Dziecko patrzące na wagę szalkową z kolorowymi klockami — jedna szalka wyżej, druga niżej"
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
          image={IMAGES.pojedynek}
          alt="Dwoje dzieci stojących plecami do siebie w żartobliwej pozie pojedynku"
        >
          <p>
            Zanim poznasz regułę, zaufaj instynktowi. Kliknij liczbę, która wygląda na większą —
            część par jest prostsza, niż myślisz, a część to prawdziwe pułapki.
          </p>
        </LessonImageCard>
        <NumberDuel color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="cyfry">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.lupaKlocki}
          alt="Dziecko z lupą przygląda się dokładnie wieży z kolorowych klocków"
          lead="Gdy liczby mają tyle samo cyfr, instynkt już nie wystarczy."
        >
          Trzeba przyjrzeć się im z bliska — cyfra po cyfrze, od lewej — aż znajdziesz różnicę.
        </LessonImageCard>
        <DigitCompare color={color} onComplete={digits.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="3"
          image={IMAGES.dymek}
          alt="Zamyślone dziecko z dymkiem myśli, w którym świeci żarówka z ptaszkiem"
          kicker="3 sposoby myślenia"
        >
          Trzy przykłady, trzy sposoby myślenia. Prześledź rozumowanie krok po kroku, zanim
          spróbujesz sam w kolejnym kroku.
        </LessonImageCard>
        <CompareExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <CompareDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="makulatura">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.makulatura}
          alt="Dzieci układają związane sznurkiem paczki papieru w dwóch stosach, jeden wyraźnie wyższy"
        >
          <p>
            Cztery klasy zbierały makulaturę na szkolny konkurs. Wykorzystaj to, czego się
            nauczyłeś, żeby porównać ich wyniki i odpowiedzieć na pytania pod tabelą.
          </p>
        </LessonImageCard>
        <PaperDrive color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: porównywanie w czterech zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama reguła działa dla liczb dwucyfrowych i siedmiocyfrowych.
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

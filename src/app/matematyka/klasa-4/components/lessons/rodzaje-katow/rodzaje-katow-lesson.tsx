'use client';

import Image from 'next/image';
import { Fan, Square, Triangle, X } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { AngleTypeSort } from './angle-type-sort';
import { AngleBuilder } from '../katy-i-katomierz/angle-builder';
import { IntersectingLinesShowcase } from './intersecting-lines-showcase';
import { IntersectingLinesAudit } from './intersecting-lines-audit';
import { ScissorsAngleCase } from './scissors-angle-case';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ostry, prosty czy rozwarty?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'definicje',
    kind: 'Nowe pojęcie',
    title: 'Trzy rodzaje kątów na żywo',
    time: '8 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Gdy dwie proste się przecinają',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Wierzchołkowy czy przyległy?',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'nozyczki',
    kind: 'Zadanie problemowe',
    title: 'Kąty otwartych nożyczek',
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
    id: 'ostry-def',
    question: 'Kąt ostry to kąt...',
    options: [
      { id: 'a', text: 'Mniejszy niż 90°' },
      { id: 'b', text: 'Większy niż 90°' },
      { id: 'c', text: 'Dokładnie 90°' },
      { id: 'd', text: 'Większy niż 180°' },
    ],
    correctId: 'a',
    explanation: 'Kąt ostry jest mniejszy niż 90° — jego ramiona są rozchylone najmniej ze wszystkich trzech rodzajów.',
  },
  {
    id: 'prosty-def',
    question: 'Kąt prosty ma dokładnie...',
    options: [
      { id: 'a', text: '45°' },
      { id: 'b', text: '90°' },
      { id: 'c', text: '180°' },
      { id: 'd', text: '60°' },
    ],
    correctId: 'b',
    explanation: 'Kąt prosty to zawsze dokładnie 90° — jego ramiona są prostopadłe, jak róg kartki.',
  },
  {
    id: 'rozwarty-def',
    question: 'Kąt o mierze 130° to kąt...',
    options: [
      { id: 'a', text: 'ostry' },
      { id: 'b', text: 'prosty' },
      { id: 'c', text: 'rozwarty' },
      { id: 'd', text: 'półpełny' },
    ],
    correctId: 'c',
    explanation: '130° jest większe niż 90° i mniejsze niż 180° — to kąt rozwarty.',
  },
  {
    id: 'wierzcholkowe-def',
    question: 'Kąty wierzchołkowe (leżące naprzeciw siebie przez wspólny wierzchołek) zawsze...',
    options: [
      { id: 'a', text: 'sumują się do 180°' },
      { id: 'b', text: 'sumują się do 90°' },
      { id: 'c', text: 'są prostopadłe' },
      { id: 'd', text: 'są równe' },
    ],
    correctId: 'd',
    explanation: 'Kąty wierzchołkowe zawsze mają dokładnie taką samą miarę — to jedna z najstarszych reguł geometrii.',
  },
  {
    id: 'przylegle-def',
    question: 'Kąty przyległe (dzielące jedno ramię, tworzące razem linię prostą) zawsze...',
    options: [
      { id: 'a', text: 'sumują się do 180°' },
      { id: 'b', text: 'sumują się do 360°' },
      { id: 'c', text: 'są równe' },
      { id: 'd', text: 'są ostre' },
    ],
    correctId: 'a',
    explanation: 'Kąty przyległe razem tworzą kąt półpełny — linię prostą — więc ich suma zawsze wynosi 180°.',
  },
  {
    id: 'zastosowanie',
    question: 'Dwie proste przecinają się. Jeden z powstałych kątów ma 65°. Ile ma kąt przyległy do niego?',
    options: [
      { id: 'a', text: '65°' },
      { id: 'b', text: '115°' },
      { id: 'c', text: '90°' },
      { id: 'd', text: '25°' },
    ],
    correctId: 'b',
    explanation: 'Kąty przyległe sumują się do 180°, więc szukany kąt to 180° − 65° = 115°.',
  },
];

const CHEAT_SHEET = [
  'Kąt ostry jest mniejszy niż 90°, kąt prosty ma dokładnie 90°, kąt rozwarty jest większy niż 90° (i mniejszy niż 180°).',
  'Kąt prosty poznasz po tym, że jego ramiona są prostopadłe — pasuje do niego róg kartki.',
  'Gdy dwie proste przecinają się w jednym punkcie, zawsze powstają cztery kąty.',
  'Kąty wierzchołkowe leżą naprzeciw siebie przez wierzchołek i zawsze są równe.',
  'Kąty przyległe dzielą jedno ramię i razem tworzą linię prostą — ich suma zawsze wynosi 180°.',
  'Znając jeden z czterech kątów przy przecięciu dwóch prostych, obliczysz pozostałe trzy bez mierzenia kątomierzem.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/rodzaje-katow/ekierka-notatnik.jpg',
  rozgrzewka: '/images/matematyka/lekcje/rodzaje-katow/lampka-biurkowa.jpg',
  przyklady: '/images/matematyka/lekcje/rodzaje-katow/skrzyzowane-patyczki.jpg',
  trening: '/images/matematyka/lekcje/rodzaje-katow/rozwarty-cyrkiel.jpg',
  nozyczki: '/images/matematyka/lekcje/rodzaje-katow/otwarte-nozyczki.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function RodzajeKatowLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const scissorsCase = useStepDone('nozyczki');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            W poprzedniej lekcji poznałeś/aś wierzchołek, ramiona kąta i pomiar kątomierzem. Teraz
            nauczysz się <strong>nazywać kąty według ich miary</strong> — i odkryjesz, co się
            dzieje, gdy <strong>dwie proste się przecinają</strong>.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Triangle, text: 'Kąt ostry — mniejszy niż 90°' },
              { icon: Square, text: 'Kąt prosty — dokładnie 90°' },
              { icon: Fan, text: 'Kąt rozwarty — większy niż 90°' },
              { icon: X, text: 'Dwie proste = cztery kąty naraz' },
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
            alt="Przezroczysta ekierka i ołówek leżące na otwartym zeszycie z naszkicowanym kątem"
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
          alt="Lampka biurkowa z metalowym ramieniem zgiętym pod wyraźnym kątem"
          lead="Zanim poznasz definicje, oceń kąt na oko."
        >
          Ramię tej lampki zgina się dokładnie tak, jak ramiona kąta. Popatrz na pięć narysowanych
          kątów i rozstrzygnij, który z nich jest ostry, prosty, a który rozwarty.
        </LessonImageCard>
        <AngleTypeSort color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="definicje">
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Przeciągnij ruchome ramię i ustaw po kolei kąt ostry, prosty i rozwarty — obserwuj, jak
          zmienia się łuk, gdy przekraczasz granicę 90°.
        </p>
        <AngleBuilder
          color={color}
          targets={[
            { degrees: 40, prompt: 'Ustaw kąt ostry — mniejszy niż 90°' },
            { degrees: 90, prompt: 'Teraz ustaw kąt prosty — dokładnie 90°' },
            { degrees: 135, prompt: 'I na koniec kąt rozwarty — większy niż 90°' },
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
          kicker="Cztery kąty naraz"
          image={IMAGES.przyklady}
          alt="Dwa drewniane patyczki skrzyżowane w kształt litery X na drewnianym blacie"
        >
          Dwa skrzyżowane patyczki tworzą dokładnie to, co dwie przecinające się proste — cztery
          kąty w jednym punkcie. Zobacz, jak są ze sobą powiązane.
        </LessonImageCard>
        <IntersectingLinesShowcase color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard variant="basic" color={color} image={IMAGES.trening} alt="Metalowy cyrkiel kreślarski szeroko rozwarty na kartce papieru">
          <p>
            Czas na trening bez mierzenia kątomierzem. Znasz miarę jednego kąta — kliknij wprost w
            diagramie ten, który jest z nim wierzchołkowy albo przyległy.
          </p>
        </LessonImageCard>
        <IntersectingLinesAudit color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="nozyczki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nozyczki}
          alt="Dłonie trzymające otwarte nożyczki, ostrza skrzyżowane w kształt litery X"
          reverse
          lead="Otwarte nożyczki to dwie przecinające się proste."
        >
          Ostrza nożyczek krzyżują się dokładnie jak dwie proste — powstają przy tym te same cztery
          kąty. Oblicz brakujące miary, korzystając z reguł, które już znasz.
        </LessonImageCard>
        <ScissorsAngleCase color={color} onComplete={scissorsCase.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: rodzaje kątów w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej w kolejnych lekcjach geometrii — przyda się przy wielokątach i obwodach.
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

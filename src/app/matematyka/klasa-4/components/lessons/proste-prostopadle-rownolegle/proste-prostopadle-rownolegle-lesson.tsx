'use client';

import Image from 'next/image';
import { MoveRight, Ruler, Waypoints, X } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { PairsAroundUs } from './pairs-around-us';
import { LineRelationLab } from './line-relation-lab';
import { EkierkaBoard } from './ekierka-board';
import { ClassifyDrill } from './classify-drill';
import { StreetPlanChallenge } from './street-plan-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Dookoła nas: prostopadłe i równoległe',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'relacje',
    kind: 'Nowe pojęcie',
    title: 'Odkryj obie relacje na żywo',
    time: '8 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Rysowanie ekierką i linijką',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Rozpoznaj i nazwij relację',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'plan',
    kind: 'Zadanie problemowe',
    title: 'Plan osiedla — ile par ulic?',
    time: '7 min',
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
    id: 'definicja-prostopadlych',
    question: 'Dwie proste przecinające się pod kątem 90° to proste…',
    options: [
      { id: 'a', text: 'równoległe' },
      { id: 'b', text: 'prostopadłe' },
      { id: 'c', text: 'przecinające się pod kątem ostrym' },
      { id: 'd', text: 'ukośne' },
    ],
    correctId: 'b',
    explanation: 'Kąt prosty ma dokładnie 90° — proste, które tworzą taki kąt, nazywamy prostopadłymi.',
  },
  {
    id: 'definicja-rownoleglych',
    question: 'Proste równoległe…',
    options: [
      { id: 'a', text: 'nigdy się nie przecinają' },
      { id: 'b', text: 'przecinają się zawsze' },
      { id: 'c', text: 'przecinają się pod kątem prostym' },
      { id: 'd', text: 'spotykają się w nieskończoności' },
    ],
    correctId: 'a',
    explanation: 'Proste równoległe to proste, które nigdy się nie przetną — cały czas są w tej samej odległości.',
  },
  {
    id: 'symbol-rownoleglosci',
    question: 'Znak ∥ czytamy…',
    options: [
      { id: 'a', text: 'prostopadła' },
      { id: 'b', text: 'większa' },
      { id: 'c', text: 'równoległa' },
      { id: 'd', text: 'należy do' },
    ],
    correctId: 'c',
    explanation: 'Symbol ∥ wygląda jak dwie równoległe kreski i czytamy go „jest równoległa do”.',
  },
  {
    id: 'narzedzie',
    question: 'Prostą prostopadłą do prostej k przez punkt P rysujemy…',
    options: [
      { id: 'a', text: 'ekierką i linijką' },
      { id: 'b', text: 'cyrklem' },
      { id: 'c', text: 'kątomierzem' },
      { id: 'd', text: 'od ręki, bez przyborów' },
    ],
    correctId: 'a',
    explanation:
      'Ekierka ma kąt prosty — przyłóż ją do prostej k, przesuń do punktu P i rysuj wzdłuż ramienia.',
  },
  {
    id: 'miara-kata',
    question: 'Dwie proste prostopadłe tworzą kąt o mierze…',
    options: [
      { id: 'a', text: '180°' },
      { id: 'b', text: '45°' },
      { id: 'c', text: '90°' },
      { id: 'd', text: '360°' },
    ],
    correctId: 'c',
    explanation: 'Prostopadłość to zawsze kąt prosty, czyli 90° — dlatego do rysowania służy ekierka.',
  },
  {
    id: 'przenoszenie',
    question: 'Jeśli prosta a jest równoległa do b, a prosta b do c, to…',
    options: [
      { id: 'a', text: 'a jest prostopadła do c' },
      { id: 'b', text: 'a jest równoległa do c' },
      { id: 'c', text: 'a i c to ta sama prosta' },
      { id: 'd', text: 'nie da się tego ustalić' },
    ],
    correctId: 'b',
    explanation: 'Równoległość się przenosi: a ∥ b i b ∥ c, więc a ∥ c.',
  },
];

const CHEAT_SHEET = [
  'Proste prostopadłe przecinają się pod kątem prostym (90°) — zapis: k ⊥ l.',
  'Proste równoległe nigdy się nie przecinają i są zawsze w tej samej odległości — zapis: k ∥ l.',
  'Proste, które przecinają się pod innym kątem, nie są ani prostopadłe, ani równoległe.',
  'Kąt prosty ma zawsze 90° — dlatego do rysowania prostych prostopadłych używa się ekierki.',
  'Prostopadłą przez punkt P rysujesz tak: przyłóż ekierkę do prostej i przesuń, aż ramię trafi w P.',
  'Równoległą przez punkt P rysujesz tak: przyłóż ekierkę do prostej, linijkę do ekierki i przesuń ekierkę po linijce do P.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/proste-prostopadle-rownolegle/ekierka-linijka.jpg',
  rozgrzewka: '/images/matematyka/lekcje/proste-prostopadle-rownolegle/miasto-ulice.jpg',
  przyklady: '/images/matematyka/lekcje/proste-prostopadle-rownolegle/rysowanie-ekierka.jpg',
  trening: '/images/matematyka/lekcje/proste-prostopadle-rownolegle/tory-kolejowe.jpg',
  plan: '/images/matematyka/lekcje/proste-prostopadle-rownolegle/plan-osiedla.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ProsteProstopadleRownolegleLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const relations = useStepDone('relacje');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('trening');
  const plan = useStepDone('plan');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            W przewodniku poznałeś/aś już symbole <strong>⊥</strong> i{' '}
            <strong>∥</strong>. Teraz zobaczysz, co naprawdę oznaczają — i nauczysz się rysować
            proste <strong>prostopadłe</strong> oraz <strong>równoległe</strong> ekierką i linijką,
            tak jak robi się to w szkole i na budowie.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Waypoints, text: 'Prostopadłe — przecinają się pod kątem 90°' },
              { icon: MoveRight, text: 'Równoległe — nigdy się nie przetną' },
              { icon: Ruler, text: 'Rysujemy je ekierką i linijką' },
              { icon: X, text: 'Inny kąt niż 90° = ani ⊥, ani ∥' },
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
            alt="Ekierka i linijka leżące na kartce papieru z narysowanymi prostymi"
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
          alt="Ulice miasta widziane z góry — jedne równoległe, inne przecinające się pod kątem prostym"
          lead="Miasta, tory i okna — pełno tu par prostych."
        >
          Zanim poznasz definicje, zdecyduj o czterech scenach z życia: proste w każdej z nich są
          albo prostopadłe, albo równoległe. Twoja intuicja już pewnie to rozpoznaje.
        </LessonImageCard>
        <PairsAroundUs color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="relacje">
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Obróć prostą <strong>l</strong> wokół punktu O i obserwuj, co się dzieje z kątem. Przy
          obu specjalnych pozycjach widżet „złapie” relację i pokaże jej symbol.
        </p>
        <LineRelationLab color={color} onComplete={relations.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="2"
          kicker="2 konstrukcje z ekierką"
          image={IMAGES.przyklady}
          alt="Dziecko rysujące ekierką prostą na kartce papieru"
        >
          Czas samodzielnie narysować obie proste przez punkt P. Przeciągnij ekierkę we właściwe
          miejsce — przycisk „Rysuj” odblokuje się dopiero, gdy ekierka będzie ustawiona
          idealnie.
        </LessonImageCard>
        <EkierkaBoard color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Dwa tory kolejowe biegnące równolegle w dal"
        >
          <p>
            Czas na trening. Kilka zadań każe Ci rozpoznać relację między prostymi na rysunku —
            a w jednym nawet policzyć miarę kąta między prostymi prostopadłymi.
          </p>
        </LessonImageCard>
        <ClassifyDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="plan">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.plan}
          alt="Plan osiedla z prostopadłymi i równoległymi ulicami na papierze"
          reverse
          lead="Prawdziwe mapy czytają się przez prostopadłość i równoległość."
        >
          Na planie osiedla znajdziesz ulice, które się przecinają i które biegną obok siebie.
          Klikaj ulice, żeby je zaznaczać — na koniec policzysz, ile jest par ulic równoległych.
        </LessonImageCard>
        <StreetPlanChallenge color={color} onComplete={plan.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: prostopadłe i równoległe w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej w kolejnych lekcjach geometrii — przyda się przy prostokątach, kątach i symetrii.
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
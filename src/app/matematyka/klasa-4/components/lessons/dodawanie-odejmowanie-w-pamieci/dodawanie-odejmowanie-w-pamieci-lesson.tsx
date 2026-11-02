'use client';

import Image from 'next/image';
import { ArrowUpRight, Footprints, Layers, RefreshCw } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { MentalWarmup } from './mental-warmup';
import { JumpStrategyIntro } from './jump-strategy-intro';
import { WorkedExamples } from './worked-examples';
import { MentalDrill } from './mental-drill';
import { PocketMoneyChallenge } from './pocket-money-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Czujesz liczby?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Skoki po pustej osi liczbowej',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy sposoby na trudniejsze przypadki',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Trening skoków w pamięci',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'kieszonkowe',
    kind: 'Zadanie problemowe',
    title: 'Kieszonkowe na majówkę',
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
    id: 'rozklad-24',
    question: 'Chcesz policzyć 58 + 24. Na jakie dwie liczby najlepiej rozłożyć 24?',
    options: [
      { id: 'a', text: '25 i −1' },
      { id: 'b', text: '20 i 4' },
      { id: 'c', text: '12 i 12' },
    ],
    correctId: 'b',
    explanation: '24 = 20 + 4 — dziesiątki i jedności osobno to zawsze najprostszy podział na skoki.',
  },
  {
    id: 'oblicz-36-7',
    question: 'Ile to jest 36 + 7?',
    options: [
      { id: 'a', text: '53' },
      { id: 'b', text: '42' },
      { id: 'c', text: '44' },
      { id: 'd', text: '43' },
    ],
    correctId: 'd',
    explanation: 'Rozłóż 7 na 4 i 3: 36 + 4 = 40 (pełna dziesiątka), a potem 40 + 3 = 43.',
  },
  {
    id: 'kompensacja-91-8',
    question: 'Które zdanie o działaniu 91 − 8 jest prawdziwe?',
    options: [
      { id: 'a', text: '91 − 8 = 91 − 10 − 2' },
      { id: 'b', text: 'Tego działania nie da się policzyć w pamięci' },
      { id: 'c', text: '91 − 8 = 91 − 10 + 2, bo 8 = 10 − 2' },
    ],
    correctId: 'c',
    explanation: '8 jest blisko 10 — odejmij 10 (o 2 za dużo), a potem dodaj te 2 z powrotem: 91 − 10 + 2 = 83.',
  },
  {
    id: 'zaokraglenie-198',
    question: 'Które liczenie to przykład sposobu „zaokrąglij i skoryguj” dla 198 + 45?',
    options: [
      { id: 'a', text: '200 + 45 − 2' },
      { id: 'b', text: '200 + 45 + 2' },
      { id: 'c', text: '190 + 55' },
    ],
    correctId: 'a',
    explanation: '198 to 200 minus 2. Dodajesz 200, a na końcu odejmujesz te 2 z powrotem: 245 − 2 = 243.',
  },
  {
    id: 'dlaczego-dziesiatki',
    question: 'Dlaczego przy dodawaniu w pamięci warto zaczynać od dziesiątek?',
    options: [
      { id: 'a', text: 'Bo wtedy liczby robią się mniejsze' },
      { id: 'b', text: 'Bo dodawanie pełnych dziesiątek w głowie jest dużo prostsze niż liczenie „w słupku”' },
      { id: 'c', text: 'Bo to jedyny poprawny sposób liczenia' },
    ],
    correctId: 'b',
    explanation: 'Dziesiątki dodają się i odejmują najprościej — dlatego zawsze zaczynasz właśnie od nich, a jedności dokładasz na końcu.',
  },
];

const CHEAT_SHEET = [
  'Rozkładaj drugą liczbę na dziesiątki i jedności — zawsze w tej kolejności.',
  'Najpierw duży skok (dziesiątki), potem mały (jedności).',
  'Blisko pełnej dziesiątki lub setki? Zaokrąglij, policz, a potem skoryguj wynik.',
  'Kolejność skoków nie ma znaczenia — liczy się, żeby razem dały właściwą liczbę.',
  'Sprawdzaj wynik szacowaniem: czy liczba wygląda sensownie?',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/dodawanie-odejmowanie-w-pamieci/skoki-w-glowie.jpg',
  rozgrzewka: '/images/matematyka/lekcje/dodawanie-odejmowanie-w-pamieci/wyczucie.jpg',
  nowePojecie: '/images/matematyka/lekcje/dodawanie-odejmowanie-w-pamieci/skoki-po-osi.jpg',
  przyklady: '/images/matematyka/lekcje/dodawanie-odejmowanie-w-pamieci/slady-stop.jpg',
  kieszonkowe: '/images/matematyka/lekcje/dodawanie-odejmowanie-w-pamieci/kieszonkowe.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function DodawanieOdejmowanieWPamieciLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('kieszonkowe');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Dotąd liczby głównie zapisywałeś, porównywałeś i zaznaczałeś na osi. Teraz zaczynasz je{' '}
            <strong>naprawdę liczyć</strong> — dodawać i odejmować w pamięci, bez kartki. Poznasz
            jedną uniwersalną sztuczkę: rozkładanie liczby na kawałki i{' '}
            <strong>doskakiwanie do wyniku</strong> krok po kroku, tak jak po pustej osi liczbowej.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Layers, text: 'Jak rozłożyć liczbę na dziesiątki i jedności' },
              { icon: Footprints, text: 'Jak „doskoczyć” do wyniku po pustej osi liczbowej' },
              { icon: ArrowUpRight, text: 'Jak radzić sobie z przekraczaniem pełnej dziesiątki i setki' },
              { icon: RefreshCw, text: 'Jak zaokrąglić liczbę i skorygować wynik na końcu' },
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
            alt="Dziecko radośnie skaczące po śladach ułożonych w rząd, jak po pustej osi liczbowej"
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
          alt="Dziecko z zamkniętymi oczami i uniesioną ręką, zastanawiające się nad odpowiedzią"
        >
          <p>
            Zanim poznasz metodę, zaufaj wyczuciu liczb. Bez liczenia na kartce — sprawdź, jak
            blisko trafiasz.
          </p>
        </LessonImageCard>
        <MentalWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Dziecko skaczące pewnie z jednego okrągłego kamienia na drugi, mniejszy, nad przerwą w ogrodzie"
          lead="Wyobraź sobie oś liczbową bez podziałki — tylko start i cel."
        >
          Dokładasz do niej skoki, jeden po drugim, aż dojdziesz dokładnie tam, gdzie trzeba.
        </LessonImageCard>
        <JumpStrategyIntro color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="3"
          image={IMAGES.przyklady}
          alt="Dziecko przyglądające się z uwagą rzędowi odcisków stóp o różnej długości kroku"
          kicker="3 sposoby na trudniejsze liczby"
        >
          Ta sama metoda skoków radzi sobie z liczbami trzycyfrowymi i z odejmowaniem, które na
          pierwszy rzut oka wygląda niewygodnie.
        </LessonImageCard>
        <WorkedExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <MentalDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="kieszonkowe">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kieszonkowe}
          alt="Dziecko trzymające małą portmonetkę, stojące przy straganie z owocami"
          reverse
          lead="Cztery dni majówki, jedno kieszonkowe i cztery wydatki do policzenia."
        >
          Wykorzystaj to, czego się nauczyłeś, żeby na bieżąco śledzić, ile Zosi zostało w
          portfelu.
        </LessonImageCard>
        <PocketMoneyChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: dodawanie i odejmowanie w pamięci</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama metoda skoków działa dla liczb dwucyfrowych i trzycyfrowych.
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

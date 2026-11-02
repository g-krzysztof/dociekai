'use client';

import Image from 'next/image';
import { ArrowRightLeft, Scale, ShoppingBasket, Weight } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { MasaWarmup } from './masa-warmup';
import { BalanceLab } from './balance-lab';
import { MassLadderExamples } from './mass-ladder-examples';
import { MasaDrill } from './masa-drill';
import { PlecakChallenge } from './plecak-challenge';
import { MASS_RULES } from '../../../lib/mass';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Co jest cięższe?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Zrównoważ szalkę wagi',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Wejdź po drabince jednostek masy',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz zamianę i porównywanie',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'plecak',
    kind: 'Zadanie problemowe',
    title: 'Spakuj plecak na wycieczkę',
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
    id: 'kg-na-g',
    question: 'Ile gramów ma 1 kilogram?',
    options: [
      { id: 'a', text: '100' },
      { id: 'b', text: '10' },
      { id: 'c', text: '1000' },
      { id: 'd', text: '10 000' },
    ],
    correctId: 'c',
    explanation: '1 kg to zawsze 1000 g — tyle samo, co tysiąc odważników jednogramowych razem.',
  },
  {
    id: 'kg-na-dag',
    question: 'Ile dekagramów ma 1 kilogram?',
    options: [
      { id: 'a', text: '100' },
      { id: 'b', text: '10' },
      { id: 'c', text: '1000' },
      { id: 'd', text: '10 000' },
    ],
    correctId: 'a',
    explanation: '1 kg to 100 dag — to drugi, większy skok na drabince jednostek masy.',
  },
  {
    id: 'kg-i-dag-na-g',
    question: '3 kg 5 dag = ? g',
    options: [
      { id: 'a', text: '350' },
      { id: 'b', text: '3050' },
      { id: 'c', text: '305' },
      { id: 'd', text: '3500' },
    ],
    correctId: 'b',
    explanation: '3 kg to 3000 g, plus 5 dag to 50 g. Razem 3000 g + 50 g = 3050 g.',
  },
  {
    id: 'kierunek-zamiany',
    question: 'Zamieniając większą jednostkę masy na mniejszą (np. kilogramy na gramy), musisz:',
    options: [
      { id: 'a', text: 'dzielić' },
      { id: 'b', text: 'odejmować' },
      { id: 'c', text: 'dodawać' },
      { id: 'd', text: 'mnożyć' },
    ],
    correctId: 'd',
    explanation:
      'Mniejsza jednostka oznacza więcej takich samych kawałków, więc liczba rośnie — mnożysz.',
  },
  {
    id: 'prawda-czy-falsz',
    question: 'Które zdanie jest prawdziwe?',
    options: [
      { id: 'a', text: '2000 kg to więcej niż 1 tona' },
      { id: 'b', text: '900 g to więcej niż 1 kg' },
      { id: 'c', text: '5 dag to mniej niż 40 g' },
      { id: 'd', text: '2000 kg to mniej niż 1 tona' },
    ],
    correctId: 'a',
    explanation:
      '2000 kg to więcej niż 1000 kg, czyli więcej niż 1 tona. 900 g to mniej niż 1 kg (1000 g), a 5 dag to aż 50 g — więcej niż 40 g.',
  },
  {
    id: 'wyjatek-kg',
    question: 'Dlaczego zamiana dekagramów na kilogramy to wyjątek na drabince jednostek masy?',
    options: [
      { id: 'a', text: 'Bo dekagram jest większy niż kilogram' },
      { id: 'b', text: 'Bo między dag i kg jest ×100, a nie ×10 jak gdzie indziej' },
      { id: 'c', text: 'Bo dekagramów się nie używa w Polsce' },
      { id: 'd', text: 'Bo to nie jest prawdziwa jednostka masy' },
    ],
    correctId: 'b',
    explanation:
      'Wszędzie indziej na drabince sąsiednie jednostki różnią się ×10. Między dag a kg jest aż ×100 — a między kg a t nawet ×1000.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/jednostki-masy/waga-szalkowa-z-odwaznikami.jpg',
  rozgrzewka: '/images/matematyka/lekcje/jednostki-masy/wazenie-przedmiotow-w-dloniach.jpg',
  nowePojecie: '/images/matematyka/lekcje/jednostki-masy/odwazniki-na-wadze-szalkowej.jpg',
  przyklady: '/images/matematyka/lekcje/jednostki-masy/drewniane-schody-widok-z-gory.jpg',
  plecak: '/images/matematyka/lekcje/jednostki-masy/spakowany-plecak-turystyczny.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function JednostkiMasyLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('plecak');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Spinkę do włosów ważysz w gramach, a swoją wagę w kilogramach — to ten sam pomysł, co
            przy długości: <strong>dobrać jednostkę do skali</strong> i sprawnie zamieniać jedną
            na drugą.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Weight, text: 'Jeden system, cztery jednostki: g, dag, kg, t (tona)' },
              {
                icon: ArrowRightLeft,
                text: 'Zamiana w obie strony — czasem ×10, czasem ×100, a czasem ×1000',
              },
              { icon: Scale, text: 'Waga szalkowa: masa jako fizyczna równowaga, nie tylko liczba' },
              { icon: ShoppingBasket, text: 'Sumowanie mas z różnych jednostek w jednym zadaniu' },
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
            alt="Waga szalkowa z mosiężnymi odważnikami ustawiona na drewnianym stole"
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
          alt="Chłopiec porównujący ciężar dwóch przedmiotów trzymanych w dłoniach"
        >
          <p>
            Zanim poznasz wagę szalkową, sprawdź wyczucie — co jest cięższe, bez ważenia?
          </p>
        </LessonImageCard>
        <MasaWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Dziewczynka układająca odważnik na szalce wagi dwuszalkowej"
          lead="Belka wagi opada w stronę cięższej szalki — i wypoziomuje się dokładnie wtedy, gdy obie masy są równe."
        >
          Obejrzyj, jak 10 gramów staje się 1 dekagramem, a potem sam/a dołóż odważniki, aż
          zrównoważysz zadaną masę.
        </LessonImageCard>
        <BalanceLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 przykłady: krok po kroku po drabince"
          alt="Drewniane schody widziane z góry, jak stopnie drabinki jednostek"
        >
          Każda zamiana to wejście albo zejście po drabince jednostek masy — tylko że tu aż dwa
          stopnie łamią zasadę ×10.
        </LessonImageCard>
        <MassLadderExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <MasaDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="plecak">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.plecak}
          alt="Spakowany plecak turystyczny z widocznym bidonem i pudełkiem na kanapki"
          reverse
          lead="Cztery przedmioty, trzy różne jednostki naraz — zanim zsumujesz, sprowadź je do jednej."
        >
          Policz, ile waży plecak, który Zosia spakowała na jednodniową wycieczkę.
        </LessonImageCard>
        <PlecakChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: jednostki masy w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama drabinka działa dla każdej masy — od spinki po ciężarówkę.
        </p>
        <ol className="divide-y border">
          {MASS_RULES.map((rule, index) => (
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

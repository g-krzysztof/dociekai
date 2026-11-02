'use client';

import Image from 'next/image';
import { ArrowLeftRight, Coins, Ruler, ScanEye } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { UnitPairsWarmup } from './unit-pairs-warmup';
import { UnitSlotBoard } from './unit-slot-board';
import { CompoundConversionSteps } from './compound-conversion-steps';
import { CompoundDrill } from './compound-drill';
import { CutListTape } from './cut-list-tape';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'przeliczniki',
    kind: 'Rozgrzewka',
    title: 'Ile małego mieści się w dużym',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'tablica',
    kind: 'Nowe pojęcie',
    title: 'Mniejsza jednostka idzie od prawej',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'zamiany',
    kind: 'Przykłady',
    title: 'Trzy zamiany krok po kroku',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Trening: w metrach, złotych i kilogramach',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'stolarnia',
    kind: 'Zadanie problemowe',
    title: 'Miarka w stolarni',
    time: '7 min',
    icon: 'Puzzle',
  },
  {
    id: 'quiz',
    kind: 'Quiz',
    title: 'Sprawdź, co zapamiętałeś',
    time: '5 min',
    icon: 'CheckCircle2',
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'm-cm-3-25',
    question: 'Jak zapiszemy 3 m 25 cm w metrach?',
    options: [
      { id: 'a', text: '3,25 m' },
      { id: 'b', text: '3,025 m' },
      { id: 'c', text: '32,5 m' },
      { id: 'd', text: '325 m' },
    ],
    correctId: 'a',
    explanation: '1 m = 100 cm → dwa miejsca po przecinku. Liczba 25 wypełnia je dokładnie: 3,25 m.',
  },
  {
    id: 'ile-miejsc-1000',
    question: 'Zamieniasz gramy na kilogramy (1 kg = 1000 g). Ile miejsc po przecinku dostanie liczba?',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '2' },
      { id: 'c', text: '3' },
      { id: 'd', text: '4' },
    ],
    correctId: 'c',
    explanation: '1000 ma trzy zera, więc gramy zajmują trzy rzędy po przecinku: dziesiąte, setne i tysięczne.',
  },
  {
    id: 'zero-trap-2-3',
    question: 'Ile to jest 2 m 3 cm zapisane w metrach?',
    options: [
      { id: 'a', text: '2,3 m' },
      { id: 'b', text: '2,30 m' },
      { id: 'c', text: '2,03 m' },
      { id: 'd', text: '23 m' },
    ],
    correctId: 'c',
    explanation: '3 cm to 3 setne metra. Trójka idzie na miejsce setnych, a dziesiąte dopełniamy zerem: 2,03 m. „2,3 m" to byłoby 2 m 30 cm.',
  },
  {
    id: 'cena-paragon',
    question: 'Na paragonie widnieje „7,05 zł". Ile to złotych i groszy?',
    options: [
      { id: 'a', text: '7 zł 5 gr' },
      { id: 'b', text: '7 zł 50 gr' },
      { id: 'c', text: '75 gr' },
      { id: 'd', text: '7 zł 500 gr' },
    ],
    correctId: 'a',
    explanation: 'Po przecinku są dwie cyfry: 0 na dziesiątych i 5 na setnych. To 5 setnych złotego, czyli 5 groszy — 7 zł 5 gr.',
  },
  {
    id: 'reverse-1-250',
    question: 'Worek mąki waży 1,250 kg. Ile to kilogramów i gramów?',
    options: [
      { id: 'a', text: '1 kg 25 g' },
      { id: 'b', text: '1 kg 250 g' },
      { id: 'c', text: '1 kg 2500 g' },
      { id: 'd', text: '125 kg' },
    ],
    correctId: 'b',
    explanation: 'Trzy cyfry po przecinku to tysięczne kilograma: 250 tysięcznych = 250 g. Razem 1 kg 250 g.',
  },
  {
    id: 'dwumianowane-def',
    question: 'Które z tych zapisów to wyrażenie dwumianowane?',
    options: [
      { id: 'a', text: '3,5 m' },
      { id: 'b', text: '2 zł 40 gr' },
      { id: 'c', text: '17 cm' },
      { id: 'd', text: '1000 g' },
    ],
    correctId: 'b',
    explanation: 'Wyrażenie dwumianowane podaje jedną wielkość w dwóch jednostkach naraz — jak „2 zł 40 gr" albo „3 m 25 cm".',
  },
];

const CHEAT_SHEET = [
  'Wyrażenie dwumianowane podaje jedną wielkość w dwóch jednostkach: „3 m 25 cm", „2 zł 50 gr", „1 kg 200 g".',
  'Większa jednostka → liczba przed przecinkiem. Mniejsza jednostka → cyfry po przecinku.',
  'Ile miejsc po przecinku? Tyle, ile zer ma przelicznik: 1 m = 100 cm → 2 miejsca; 1 kg = 1000 g → 3 miejsca.',
  'Liczbę mniejszej jednostki wpisujemy od prawej strony i dopełniamy zerami z przodu: 3 m 5 cm = 3,05 m (nie 3,5 m!).',
  'Tak właśnie zapisuje się ceny: 2 zł 50 gr to 2,50 zł na każdym paragonie.',
  'W drugą stronę czytamy tak samo: 3,7 m to 3 m 70 cm, a 1,250 kg to 1 kg 250 g.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/wyrazenia-dwumianowane/miarka-zwijana-i-skladana.jpg',
  przeliczniki: '/images/matematyka/lekcje/wyrazenia-dwumianowane/monety-i-banknot-przy-linijce.jpg',
  zamiany: '/images/matematyka/lekcje/wyrazenia-dwumianowane/dziewczynka-mierzy-roslinke.jpg',
  trening: '/images/matematyka/lekcje/wyrazenia-dwumianowane/chlopiec-pisze-liczby-w-zeszycie.jpg',
  stolarnia: '/images/matematyka/lekcje/wyrazenia-dwumianowane/warsztat-stolarski-z-deskami.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function WyrazeniaDwumianowaneLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const przeliczniki = useStepDone('przeliczniki');
  const tablica = useStepDone('tablica');
  const zamiany = useStepDone('zamiany');
  const trening = useStepDone('trening');
  const stolarnia = useStepDone('stolarnia');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            „2 zł 50 gr”, „3 m 25 cm”, „1 kg 200 g” — to <strong>wyrażenia dwumianowane</strong>:
            jedna wielkość podana w dwóch jednostkach naraz. Dziś zamienisz każde z nich na{' '}
            <strong>jedną liczbę z przecinkiem</strong> — dokładnie tak, jak zapisuje się ceny w
            sklepie.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Coins, text: 'Większa jednostka → przed przecinkiem' },
              { icon: Ruler, text: 'Mniejsza jednostka → cyfry po przecinku' },
              { icon: ScanEye, text: 'Pułapka: 3 m 5 cm to 3,05 m, nie 3,5 m' },
              { icon: ArrowLeftRight, text: 'Ta sama zamiana działa w obie strony' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-sm">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-[240px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Zwijana miarka stolarska i składany metr złożone na drewnianym stole"
            width={240}
            height={180}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* 1. Rozgrzewka */}
      <LessonSection id="przeliczniki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przeliczniki}
          alt="Stosik monet i banknot ułożone obok krótkiej linijki"
          lead="Mała jednostka mieści się w dużej dokładnie 100 albo 1000 razy."
        >
          To ta okrągła liczba — 100 albo 1000 — zdecyduje potem, ile miejsc po przecinku dostanie
          liczba dziesiętna. Przypomnij ją sobie, zanim zaczniesz zamieniać.
        </LessonImageCard>
        <UnitPairsWarmup color={color} onComplete={przeliczniki.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="tablica">
        <UnitSlotBoard color={color} onComplete={tablica.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="zamiany">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="3"
          kicker="3 zamiany krok po kroku"
          image={IMAGES.zamiany}
          alt="Dziewczynka mierzy linijką wysokość doniczkowej roślinki"
        >
          Zobacz cały tok myślenia na trzech przykładach: kwota w złotych, długość w metrach i masa w
          kilogramach. Za każdym razem te same trzy pytania.
        </LessonImageCard>
        <CompoundConversionSteps color={color} onComplete={zamiany.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Chłopiec zapisuje liczby z przecinkiem w zeszycie w kratkę"
        >
          <p>
            Sześć zadań o rosnącej trudności — zamiana w obie strony, przelicznik 100 i 1000 oraz
            pułapka zera z przodu.
          </p>
        </LessonImageCard>
        <CompoundDrill color={color} onComplete={trening.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="stolarnia">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.stolarnia}
          alt="Warsztat stolarski z deskami i rozłożoną miarką zwijaną"
          reverse
          lead="Stolarz zapisuje każdy wymiar dwa razy: raz miarką, raz w metrach."
        >
          Ustaw koniec miarki na podanej długości i sprawdź, że oba zapisy — „metr i centymetry” oraz
          liczba z przecinkiem — pokazują dokładnie to samo.
        </LessonImageCard>
        <CutListTape color={color} onComplete={stolarnia.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: wyrażenia dwumianowane w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej, gdy tylko zobaczysz dwie jednostki w jednym zapisie.
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

'use client';

import Image from 'next/image';
import { Divide, Search, Sigma, TriangleAlert } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { ParityWarmup } from './parity-warmup';
import { DivisibilityLab } from './divisibility-lab';
import { DivisibilityExamples } from './divisibility-examples';
import { DivisibilityDrill } from './divisibility-drill';
import { LotteryChallenge } from './lottery-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Parzysta czy nieparzysta?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Które cyfry mają znaczenie?',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Ostatnie cyfry, albo suma wszystkich',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz cechy podzielności',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'loteria',
    kind: 'Zadanie problemowe',
    title: 'Loteria szkolna',
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
    id: 'ktora-parzysta',
    question: 'Która liczba na pewno dzieli się przez 2?',
    options: [
      { id: 'a', text: '4571' },
      { id: 'b', text: '1235' },
      { id: 'c', text: '3298' },
      { id: 'd', text: '9007' },
    ],
    correctId: 'c',
    explanation: '3298 kończy się cyfrą 8 — parzystą — więc dzieli się przez 2. Pozostałe kończą się cyframi nieparzystymi.',
  },
  {
    id: 'suma-9',
    question: 'Suma cyfr liczby 315 to 9. Co to oznacza?',
    options: [
      { id: 'a', text: '315 dzieli się przez 9 i przez 3' },
      { id: 'b', text: '315 dzieli się przez 2' },
      { id: 'c', text: '315 to liczba nieparzysta, więcej nic nie wiadomo' },
      { id: 'd', text: 'To nic nie oznacza' },
    ],
    correctId: 'a',
    explanation: 'Skoro suma cyfr (9) dzieli się przez 9, to i przez 3 — to właśnie te dwie cechy sprawdza się przez sumę cyfr.',
  },
  {
    id: 'przez-4-5200',
    question: 'Czy 5200 dzieli się przez 4?',
    options: [
      { id: 'a', text: 'Nie' },
      { id: 'b', text: 'Tak' },
    ],
    correctId: 'b',
    explanation: 'Ostatnie dwie cyfry to 00, a 0 dzieli się przez 4, więc 5200 dzieli się przez 4.',
  },
  {
    id: 'ktora-przez-100',
    question: 'Która z tych liczb dzieli się przez 100?',
    options: [
      { id: 'a', text: '3450' },
      { id: 'b', text: '6009' },
      { id: 'c', text: '1080' },
      { id: 'd', text: '2700' },
    ],
    correctId: 'd',
    explanation: '2700 kończy się dwoma zerami, więc dzieli się przez 100. Pozostałe liczby nie kończą się na „00”.',
  },
  {
    id: 'po-co-cechy',
    question: 'Dlaczego cechy podzielności są przydatne?',
    options: [
      { id: 'a', text: 'Bo działają tylko dla liczb parzystych' },
      { id: 'b', text: 'Bo pozwalają sprawdzić podzielność bez wykonywania całego dzielenia' },
      { id: 'c', text: 'Bo zawsze podają dokładny wynik dzielenia' },
      { id: 'd', text: 'Bo działają tylko dla bardzo dużych liczb' },
    ],
    correctId: 'b',
    explanation: 'Cecha podzielności odpowiada tylko na pytanie „tak czy nie” — szybko, bez liczenia całego dzielenia, choć samego wyniku dzielenia nie podaje.',
  },
];

const CHEAT_SHEET = [
  'Podzielność przez 2, 5, 10: wystarczy spojrzeć na ostatnią cyfrę.',
  'Podzielność przez 4, 100: liczą się tylko ostatnie dwie cyfry.',
  'Podzielność przez 3, 9: zsumuj WSZYSTKIE cyfry i sprawdź tę sumę.',
  'Cecha podzielności mówi tylko „tak” albo „nie” — nie podaje wyniku dzielenia.',
  'Sztuczka z sumą cyfr (przez 9) była używana przez kupców do sprawdzania rachunków już ponad 1000 lat temu.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/cechy-podzielnosci/lupa-i-ksiegi.jpg',
  rozgrzewka: '/images/matematyka/lekcje/cechy-podzielnosci/chlopiec-rudy-mysli.jpg',
  nowePojecie: '/images/matematyka/lekcje/cechy-podzielnosci/lupa-nad-kostkami.jpg',
  przyklady: '/images/matematyka/lekcje/cechy-podzielnosci/dziewczynka-blond-liczy.jpg',
  loteria: '/images/matematyka/lekcje/cechy-podzielnosci/losy-loteryjne.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function CechyPodzielnosciLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('loteria');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Żeby sprawdzić, czy liczba się dzieli, <strong>nie musisz jej dzielić</strong>. Wystarczy
            spojrzeć na kilka konkretnych cyfr — czasem tylko na jedną, czasem na wszystkie naraz.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Search, text: 'Które cyfry sprawdzać przy podzielności przez 2, 5, 10' },
              { icon: Divide, text: 'Dlaczego przy 4 i 100 liczą się dwie ostatnie cyfry' },
              { icon: Sigma, text: 'Jak suma wszystkich cyfr zdradza podzielność przez 3 i 9' },
              { icon: TriangleAlert, text: 'Dlaczego cecha podzielności nie zastępuje dzielenia' },
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
            alt="Stara drewniana lupa leżąca na stosie oprawionych ksiąg rachunkowych"
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
          alt="Rudowłosy chłopiec zastanawiający się nad liczbą"
        >
          <p>
            Zanim poznasz resztę reguł, sprawdź wyczucie — bez dzielenia, czy ta liczba jest
            parzysta?
          </p>
        </LessonImageCard>
        <ParityWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Lupa nad kilkoma kostkami do gry, jakby ktoś się im uważnie przyglądał"
          lead="Wybierz regułę i zobacz, które cyfry naprawdę mają znaczenie."
        >
          Reszta cyfr wygasa — liczy się tylko to, co sprawdza dana reguła.
        </LessonImageCard>
        <DivisibilityLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="3 przykłady, jedna pułapka"
          alt="Dziewczynka z blond włosami licząca w skupieniu"
        >
          Trzy poprawne sprawdzenia różnych reguł, a czwarty przykład to błąd — łatwo pomylić
          regułę ostatnich cyfr z regułą sumy.
        </LessonImageCard>
        <DivisibilityExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <DivisibilityDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="loteria">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.loteria}
          alt="Kolorowe losy loteryjne w szklanym słoju"
          reverse
          lead="Zwycięskie losy rozpoznasz po cesze podzielności, bez liczenia na kartce."
        >
          Wykorzystaj to, czego się nauczyłeś, żeby sprawdzić bilety szkolnej loterii.
        </LessonImageCard>
        <LotteryChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: cechy podzielności</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama zasada działa niezależnie od tego, jak duża jest liczba.
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

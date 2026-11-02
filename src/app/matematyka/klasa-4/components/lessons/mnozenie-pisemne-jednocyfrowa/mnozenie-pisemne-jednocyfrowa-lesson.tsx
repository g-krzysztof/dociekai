'use client';

import Image from 'next/image';
import { Layers, PenLine, Search, SquareStack } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { PrzeniesienieWarmup } from './przeniesienie-warmup';
import { ColumnMultiplicationLab } from './column-multiplication-lab';
import { MnozeniePrzyklady } from './mnozenie-przyklady';
import { MnozenieDrill } from './mnozenie-drill';
import { MistakeHunt } from './mistake-hunt';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Będzie przeniesienie?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Mnożenie kolumna po kolumnie',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: '4 przykłady: od zera przeniesień po cyfrę zero w liczbie',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz mnożenie pisemne',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'lowca-bledow',
    kind: 'Zadanie problemowe',
    title: 'Znajdź błąd w cudzym rachunku',
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
    id: 'max-przeniesienie',
    question: 'Ile maksymalnie może wynosić przeniesienie przy mnożeniu przez liczbę jednocyfrową?',
    options: [
      { id: 'a', text: '10' },
      { id: 'b', text: '1' },
      { id: 'c', text: '5' },
      { id: 'd', text: '8' },
    ],
    correctId: 'd',
    explanation: '9 × 9 = 81 to największy możliwy iloczyn dwóch cyfr, więc przeniesienie może wynieść aż 8.',
  },
  {
    id: 'gdzie-mnoznik',
    question: 'Gdzie zapisujemy mnożnik jednocyfrowy w mnożeniu pisemnym?',
    options: [
      { id: 'a', text: 'Pod każdą kolumną osobno' },
      { id: 'b', text: 'Nad wynikiem' },
      { id: 'c', text: 'Tylko pod kolumną jedności' },
      { id: 'd', text: 'Z lewej strony liczby' },
    ],
    correctId: 'c',
    explanation:
      'Mnożnik jest jedną cyfrą, więc zapisujemy go raz — pod kolumną jedności, tak jak w prawdziwym zapisie w zeszycie.',
  },
  {
    id: 'cyfra-zero',
    question: 'Cyfra w mnożonej liczbie to 0. Co się dzieje w tej kolumnie?',
    options: [
      { id: 'a', text: 'Kolumnę pomijamy, jakby jej nie było' },
      { id: 'b', text: '0 razy mnożnik daje 0, ale może dojść przeniesienie z sąsiedniej kolumny' },
      { id: 'c', text: 'Trzeba pożyczyć, tak jak przy odejmowaniu' },
      { id: 'd', text: 'Wynik w tej kolumnie zawsze wynosi 10' },
    ],
    correctId: 'b',
    explanation:
      'Zero razy cokolwiek to zero — ale ta kolumna wciąż może dostać przeniesienie z prawej, więc jej wynik nie zawsze jest samym zerem.',
  },
  {
    id: 'od-ktorej-kolumny',
    question: 'Od której kolumny zaczynamy liczyć mnożenie pisemne?',
    options: [
      { id: 'a', text: 'Od najstarszej, czyli lewej' },
      { id: 'b', text: 'Kolejność nie ma znaczenia' },
      { id: 'c', text: 'Od środka liczby' },
      { id: 'd', text: 'Od jedności, czyli prawej' },
    ],
    correctId: 'd',
    explanation: 'Tak samo jak w dodawaniu i odejmowaniu — licząc od prawej, przeniesienie od razu trafia tam, gdzie jest potrzebne.',
  },
  {
    id: '306-razy-5',
    question: '306 × 5 = ?',
    options: [
      { id: 'a', text: '153' },
      { id: 'b', text: '1536' },
      { id: 'c', text: '1530' },
      { id: 'd', text: '1500' },
    ],
    correctId: 'c',
    explanation: '6 × 5 = 30 → 0, przeniesienie 3. 0 × 5 + 3 = 3. 3 × 5 = 15. Wynik: 1530.',
  },
  {
    id: 'dlaczego-wieksze',
    question: 'Dlaczego w mnożeniu pisemnym przeniesienie bywa większe niż w dodawaniu?',
    options: [
      { id: 'a', text: 'Bo mnożymy cyfrę razy cały mnożnik, a nie tylko dodajemy dwie cyfry' },
      { id: 'b', text: 'Bo liczby w tej lekcji są po prostu większe' },
      { id: 'c', text: 'To nieprawda, przeniesienie zawsze wynosi najwyżej 1' },
      { id: 'd', text: 'Bo zawsze zaczynamy liczenie od setek' },
    ],
    correctId: 'a',
    explanation:
      'Dodawanie dwóch cyfr daje najwyżej 9 + 9 = 18 (przeniesienie ≤ 1), a mnożenie dwóch cyfr daje aż do 9 × 9 = 81 (przeniesienie do 8).',
  },
];

const MULTIPLICATION_RULES: string[] = [
  'Mnożnik jednocyfrowy zapisujemy raz — pod kolumną jedności, tak jak każdą inną liczbę w zapisie pisemnym.',
  'Liczymy zawsze od kolumny jedności, czyli od prawej strony do lewej.',
  'Mnożymy każdą cyfrę górnej liczby przez mnożnik, a do wyniku dodajemy przeniesienie z poprzedniej kolumny.',
  'Gdy wynik kolumny wynosi 10 lub więcej, zapisujemy tylko jego cyfrę jedności, a resztę przenosimy nad kolumnę po lewej — inaczej niż w dodawaniu, to przeniesienie może wynosić dowolną cyfrę od 1 do 8, nie tylko 1.',
  'Zero razy mnożnik zawsze daje zero, ale kolumna z zerem wciąż może pokazać inną cyfrę, jeśli dostanie przeniesienie z sąsiedniej kolumny.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/mnozenie-pisemne-jednocyfrowa/otwarty-zeszyt-z-mnozeniem-w-slupku-i-kredka.jpg',
  rozgrzewka: '/images/matematyka/lekcje/mnozenie-pisemne-jednocyfrowa/dziewczynka-z-czarnymi-wlosami-liczy-na-palcach.jpg',
  nowePojecie:
    '/images/matematyka/lekcje/mnozenie-pisemne-jednocyfrowa/stosiki-drewnianych-klockow-jeden-przelewa-sie-w-nowy-stosik.jpg',
  przyklady: '/images/matematyka/lekcje/mnozenie-pisemne-jednocyfrowa/chlopiec-z-rudymi-wlosami-pisze-przy-oknie.jpg',
  lowcaBledow: '/images/matematyka/lekcje/mnozenie-pisemne-jednocyfrowa/lupa-i-czerwona-kredka-na-biurku.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function MnozeniePisemneJednocyfrowaLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('lowca-bledow');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Dodawanie i odejmowanie pisemne masz już opanowane — teraz czas na{' '}
            <strong>mnożenie pisemne przez liczbę jednocyfrową</strong>. Zasada zapisu jest ta
            sama, ale przeniesienie zachowuje się inaczej niż wcześniej.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Layers, text: 'Mnożymy kolumna po kolumnie, od jedności w lewo' },
              { icon: PenLine, text: 'Mnożnik jednocyfrowy zapisujemy raz — pod kolumną jedności' },
              { icon: SquareStack, text: 'Przeniesienie może wynieść nawet 8, nie tylko 1 jak przy dodawaniu' },
              { icon: Search, text: 'Na koniec: znajdziesz błąd w rachunku, który ktoś już policzył' },
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
            alt="Otwarty zeszyt w kratkę leżący na drewnianym biurku obok pomarańczowej kredki"
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
          alt="Dziewczynka z czarnymi włosami siedzi przy biurku i liczy na palcach, zamyślona"
        >
          <p>
            Zanim zaczniesz liczyć całe działania, naucz się rozpoznawać, kiedy iloczyn cyfry i
            mnożnika w ogóle tworzy przeniesienie.
          </p>
        </LessonImageCard>
        <PrzeniesienieWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Kilka stosików kolorowych drewnianych klocków, jeden z nich przelewa się w nowy, wyższy stosik"
          lead="Przy mnożeniu jedna kolumna czasem musi „przelać” od razu kilka dziesiątek dalej, nie tylko jedną."
        >
          Obejrzyj, jak mnożenie pisemne liczy się kolumna po kolumnie, gdy przeniesienie rośnie
          do 4, a potem sam/a wybierz poprawną cyfrę wyniku w dwóch samodzielnych rundach.
        </LessonImageCard>
        <ColumnMultiplicationLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 przykłady: od zera przeniesień po cyfrę zero w liczbie"
          alt="Chłopiec o rudych włosach siedzi przy oknie i pisze coś w otwartym zeszycie"
        >
          Od mnożenia bez żadnego przeniesienia, przez pojedyncze i potrójne przeniesienie, po
          liczbę z cyfrą zero w środku.
        </LessonImageCard>
        <MnozeniePrzyklady color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <MnozenieDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="lowca-bledow">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.lowcaBledow}
          alt="Lupa i czerwona kredka leżące obok siebie na drewnianym biurku"
          reverse
          lead="Umiejętność sprawdzenia cudzego (albo własnego) rachunku jest tak samo ważna, jak samo liczenie."
        >
          Zosia policzyła mnożenie pisemne, ale w jednej kolumnie się pomyliła. Znajdź tę kolumnę
          i popraw wynik całego działania.
        </LessonImageCard>
        <MistakeHunt color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: mnożenie pisemne w pięciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Te same zasady zapisu — z przewodnika — działają w każdym mnożeniu pisemnym, jakie
          policzysz, tylko przeniesienie może być teraz większe niż 1.
        </p>
        <ol className="divide-y border">
          {MULTIPLICATION_RULES.map((rule, index) => (
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

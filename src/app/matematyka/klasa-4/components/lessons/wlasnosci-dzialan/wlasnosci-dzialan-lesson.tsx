'use client';

import Image from 'next/image';
import { Grid3x3, Layers, Shuffle, Zap } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { OrderMattersWarmup } from './order-matters-warmup';
import { PropertyLabIntro } from './property-lab-intro';
import { PropertyExamples } from './property-examples';
import { PropertyDrill } from './property-drill';
import { AssemblySeatingChallenge } from './assembly-seating-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Czy kolejność ma znaczenie?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Trzy własności na jednej siatce',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Kiedy naprawdę się przydają',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Trening własności działań',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'akademia',
    kind: 'Zadanie problemowe',
    title: 'Krzesła na akademii',
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
    id: 'nazwa-przemiennosci',
    question: 'Jak nazywa się własność, dzięki której 5 × 8 = 8 × 5?',
    options: [
      { id: 'a', text: 'Łączność' },
      { id: 'b', text: 'Rozdzielność' },
      { id: 'c', text: 'Przemienność' },
      { id: 'd', text: 'Podzielność' },
    ],
    correctId: 'c',
    explanation: 'To przemienność — zamiana kolejności składników lub czynników nie zmienia wyniku.',
  },
  {
    id: 'przyklad-lacznosci',
    question: 'Które działanie ilustruje łączność dodawania?',
    options: [
      { id: 'a', text: '(2 + 3) + 9 = 2 + (3 + 9)' },
      { id: 'b', text: '2 + 3 = 3 + 2' },
      { id: 'c', text: '2 × (3 + 9) = 2 × 3 + 2 × 9' },
    ],
    correctId: 'a',
    explanation: 'Łączność mówi o grupowaniu: nieważne, które dwie liczby zsumujesz najpierw — wynik jest ten sam.',
  },
  {
    id: 'oblicz-9x21',
    question: 'Oblicz, korzystając z rozdzielności: 9 × 21 = 9 × 20 + 9 × 1 = ?',
    options: [
      { id: 'a', text: '190' },
      { id: 'b', text: '189' },
      { id: 'c', text: '180' },
      { id: 'd', text: '199' },
    ],
    correctId: 'b',
    explanation: '9 × 20 = 180, 9 × 1 = 9, razem 180 + 9 = 189.',
  },
  {
    id: 'ktore-nieprzemienne-quiz',
    question: 'Które z tych działań NIE jest przemienne?',
    options: [
      { id: 'a', text: 'Mnożenie' },
      { id: 'b', text: 'Dodawanie' },
      { id: 'c', text: 'Dzielenie' },
    ],
    correctId: 'c',
    explanation: 'Dzielenie nie jest przemienne — 20 : 4 i 4 : 20 to zupełnie różne liczby.',
  },
  {
    id: 'ktorej-wlasnosci-uzywa',
    question: 'Zosia liczy 3 × 6 × 5 jako (3 × 5) × 6, żeby po drodze dostać ładniejszą liczbę. Z której własności korzysta?',
    options: [
      { id: 'a', text: 'Przemienności i łączności mnożenia' },
      { id: 'b', text: 'Rozdzielności mnożenia' },
      { id: 'c', text: 'Łączności dodawania' },
    ],
    correctId: 'a',
    explanation: 'Najpierw zamieniła kolejność (przemienność), a potem zgrupowała inaczej (łączność) — obie własności naraz.',
  },
];

const CHEAT_SHEET = [
  'Przemienność: a + b = b + a oraz a × b = b × a — kolejność nie ma znaczenia.',
  'Łączność: (a + b) + c = a + (b + c) — nieważne, które dwie liczby zsumujesz najpierw.',
  'Rozdzielność: a × (b + c) = a × b + a × c — duże mnożenie rozbijasz na mniejsze.',
  'Odejmowanie i dzielenie NIE są przemienne ani łączne — tam kolejność ma znaczenie.',
  'To nie tylko teoria — te własności pozwalają liczyć szybciej w pamięci.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/wlasnosci-dzialan/siatka-klockow.jpg',
  rozgrzewka: '/images/matematyka/lekcje/wlasnosci-dzialan/wahanie.jpg',
  nowePojecie: '/images/matematyka/lekcje/wlasnosci-dzialan/tacka-muffinek.jpg',
  przyklady: '/images/matematyka/lekcje/wlasnosci-dzialan/lupa-siatka.jpg',
  akademia: '/images/matematyka/lekcje/wlasnosci-dzialan/rzedy-krzesel.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function WlasnosciDzialanLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('akademia');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Umiesz już dodawać i odejmować w pamięci. Teraz poznasz <strong>trzy reguły</strong>,
            które sprawiają, że liczenie robi się jeszcze prostsze: dlaczego wolno zamieniać
            kolejność, dlaczego wolno grupować inaczej i jak{' '}
            <strong>rozbić trudne mnożenie na łatwiejsze kawałki</strong>.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Shuffle, text: 'Dlaczego 5 × 8 to to samo co 8 × 5 (przemienność)' },
              { icon: Layers, text: 'Dlaczego kolejność sumowania trzech liczb nie ma znaczenia (łączność)' },
              { icon: Grid3x3, text: 'Jak rozbić duże mnożenie na dwa mniejsze (rozdzielność)' },
              { icon: Zap, text: 'Dlaczego te reguły przyspieszają liczenie w pamięci' },
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
            alt="Kolorowe drewniane klocki ułożone w regularną siatkę rzędów i kolumn"
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
          alt="Dziecko z niepewną miną, patrzące raz w lewo, raz w prawo, jakby się wahało"
        >
          <p>
            Niektóre działania wybaczają zamianę kolejności, inne — nie. Sprawdź, na ile trafisz z
            samego wyczucia.
          </p>
        </LessonImageCard>
        <OrderMattersWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Tacka do muffinek z ciastkami ułożonymi w regularne rzędy i kolumny"
          lead="Jedna siatka kwadracików może pokazać wszystkie trzy własności naraz."
        >
          Obróć ją, pogrupuj liczby inaczej, przeciągnij podział — za każdym razem wynik zostaje
          taki sam.
        </LessonImageCard>
        <PropertyLabIntro color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="3"
          image={IMAGES.przyklady}
          alt="Dziecko z lupą przygląda się uważnie siatce kolorowych kwadracików"
          kicker="3 sytuacje z życia"
        >
          Poznane własności to nie teoria na papierze — realnie przyspieszają liczenie w pamięci.
          Zobacz, jak dokładnie.
        </LessonImageCard>
        <PropertyExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <PropertyDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="akademia">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.akademia}
          alt="Rzędy pustych krzeseł ustawionych równo na sali gimnastycznej przed akademią szkolną"
          reverse
          lead="Rzędy i kolumny krzeseł na akademii to ta sama siatka, co w tej lekcji."
        >
          Wykorzystaj przemienność i rozdzielność, żeby policzyć krzesła najszybciej, jak się da.
        </LessonImageCard>
        <AssemblySeatingChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: trzy własności w pięciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Te same reguły działają dla małych i dużych liczb.
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

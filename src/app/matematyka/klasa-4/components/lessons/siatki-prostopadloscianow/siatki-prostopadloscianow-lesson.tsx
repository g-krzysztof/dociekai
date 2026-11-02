'use client';

import Image from 'next/image';
import { Grid2x2Check, Layers2, Scissors, Ruler } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { UnfoldBox } from './unfold-box';
import { NetFoldCheck } from './net-fold-check';
import { NetDimensionSteps } from './net-dimension-steps';
import { buildNetDrill } from './net-drill';
import { NET_RULES, netTotalArea } from '../../../lib/box-net';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Rozłóż pudełko na płasko',
    time: '7 min',
    icon: 'Sparkles',
  },
  {
    id: 'siatka',
    kind: 'Nowe pojęcie',
    title: 'Nie każdy układ sześciu kwadratów jest siatką',
    time: '9 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Wymiary prostokątów siatki',
    time: '7 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Rozpoznaj i policz samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'zadanie',
    kind: 'Zadanie problemowe',
    title: 'Napraw siatkę jednym ruchem',
    time: '8 min',
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

/** Pudełko z ostatniego pytania quizu — pole liczy ta sama funkcja co lekcja. */
const QUIZ_BOX = { width: 4, depth: 3, height: 2 };

const QUIZ: QuizQuestion[] = [
  {
    id: 'co-to-siatka',
    question:
      'Rozcinasz pudełko wzdłuż kilku krawędzi i rozkładasz je na płasko. Co dzieje się z jego ścianami?',
    options: [
      { id: 'a', text: 'Dwie ściany znikają, bo dno i wieko nakładają się na siebie' },
      { id: 'b', text: 'Ścian jest więcej niż przedtem, bo każde cięcie tworzy nową' },
      { id: 'c', text: 'Nic nie ubywa i nic nie dochodzi — te same 6 ścian leży teraz obok siebie' },
      { id: 'd', text: 'Ściany zmieniają kształt na kwadraty' },
    ],
    correctId: 'c',
    explanation:
      'Siatka to ta sama powierzchnia bryły, tylko rozłożona. Cięcie idzie po krawędziach, więc nie tworzy ani nie kasuje żadnej ściany.',
  },
  {
    id: 'ile-par',
    question: 'Ile par identycznych prostokątów ma siatka prostopadłościanu?',
    options: [
      { id: 'a', text: '3 pary' },
      { id: 'b', text: '6 par' },
      { id: 'c', text: '2 pary' },
      { id: 'd', text: 'Żadnej — wszystkie prostokąty są różne' },
    ],
    correctId: 'a',
    explanation:
      'Ściany przeciwległe są identyczne, a takich par jest trzy: dno z wiekiem, przód z tyłem, lewa z prawą.',
  },
  {
    id: 'ile-siatek-ma-pudelko',
    question: 'Ile różnych siatek może mieć jedno pudełko?',
    options: [
      { id: 'a', text: 'Dokładnie jedną — siatka jest wyznaczona przez bryłę' },
      { id: 'b', text: 'Dwie: jedną „na leżąco” i jedną „na stojąco”' },
      { id: 'c', text: 'Tyle, ile ma ścian, czyli sześć' },
      { id: 'd', text: 'Wiele — zależy od tego, wzdłuż których krawędzi je rozetniesz' },
    ],
    correctId: 'd',
    explanation:
      'To samo pudełko rozcięte inaczej daje inną siatkę. Dlatego w lekcji ta sama bryła rozłożyła się na trzy różne sposoby.',
  },
  {
    id: 'prostokat-3-2',
    question: 'Czy sześć kwadratów ułożonych w prostokąt 3 na 2 złoży się w sześcian?',
    options: [
      { id: 'a', text: 'Tak — jest ich sześć, więc wystarczy zagiąć' },
      { id: 'b', text: 'Nie — dwa kwadraty trafiają na tę samą ścianę, a inna zostaje odkryta' },
      { id: 'c', text: 'Tak, ale tylko wtedy, gdy zaczniemy zaginać od środka' },
      { id: 'd', text: 'Nie, bo prostokąt 3 na 2 ma tylko pięć kwadratów' },
    ],
    correctId: 'b',
    explanation:
      'Liczba kwadratów to za mało. Przy składaniu prostokąta 3 na 2 dwie ścianki nachodzą na siebie, a przeciwległa strona zostaje pusta.',
  },
  {
    id: 'ile-siatek-szescianu',
    question: 'Ile różnych siatek ma sześcian?',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '8' },
      { id: 'c', text: '11' },
      { id: 'd', text: 'Nieskończenie wiele' },
    ],
    correctId: 'c',
    explanation:
      'Sześć kwadratów da się ułożyć na 35 różnych sposobów, ale tylko 11 z nich zamyka się w sześcian. Reszta ma kolizję ścian.',
  },
  {
    id: 'pole-siatki',
    question: `Ile kartonu zajmuje siatka pudełka ${QUIZ_BOX.width} cm × ${QUIZ_BOX.depth} cm × ${QUIZ_BOX.height} cm?`,
    options: [
      { id: 'a', text: '24 cm²' },
      { id: 'b', text: `${netTotalArea(QUIZ_BOX)} cm²` },
      { id: 'c', text: '26 cm²' },
      { id: 'd', text: '104 cm²' },
    ],
    correctId: 'b',
    explanation:
      'Dno i wieko: 2 · (4 · 3) = 24. Przód i tył: 2 · (4 · 2) = 16. Boki: 2 · (3 · 2) = 12. Razem 52 cm². Liczba 24 to samo dno z wiekiem, a 104 — wynik podwojony drugi raz.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/siatki-prostopadloscianow/pudelko-plaskie-i-zlozone.jpg',
  rozgrzewka: '/images/matematyka/lekcje/siatki-prostopadloscianow/dziewczynka-rozklada-karton.jpg',
  siatka: '/images/matematyka/lekcje/siatki-prostopadloscianow/nozyczki-tasma-i-rozciety-karton.jpg',
  przyklady: '/images/matematyka/lekcje/siatki-prostopadloscianow/chlopiec-rysuje-plan-pudelka.jpg',
  cwiczenia: '/images/matematyka/lekcje/siatki-prostopadloscianow/opakowania-roznych-ksztaltow.jpg',
  zadanie: '/images/matematyka/lekcje/siatki-prostopadloscianow/chlopiec-skleja-pudelko-z-papieru.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function SiatkiProstopadloscianowLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozgrzewka = useStepDone('rozgrzewka');
  const siatka = useStepDone('siatka');
  const przyklady = useStepDone('przyklady');
  const cwiczenia = useStepDone('cwiczenia');
  const zadanie = useStepDone('zadanie');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Pudełko można rozciąć wzdłuż kilku krawędzi i rozłożyć na płasko. To, co zostanie na
            stole, nazywa się <strong>siatką</strong> — i ma dokładnie te same sześć ścian co bryła,
            tylko obok siebie zamiast wokół pustego środka. W tej lekcji będziesz rozkładać pudełka,
            sprawdzać, które układy kwadratów naprawdę się zamykają, i czytać wymiary prostokątów
            wprost z bryły.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Scissors, text: 'Siatka = powierzchnia bryły rozłożona na płasko' },
              { icon: Layers2, text: 'Sześć prostokątów w trzech parach identycznych' },
              { icon: Grid2x2Check, text: 'Nie każdy układ sześciu kwadratów się zamyka' },
              { icon: Ruler, text: 'Wymiary prostokątów wprost z długości, szerokości i wysokości' },
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
            alt="Rozłożony płasko karton leżący na drewnianym stole obok takiego samego, ale złożonego pudełka"
            width={240}
            height={180}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* 1. Rozgrzewka */}
      <LessonSection id="rozgrzewka">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="6"
          kicker="Jedno pudełko, trzy siatki"
          image={IMAGES.rozgrzewka}
          alt="Dziewczynka około dziesięciu lat, jasna karnacja, blond włosy związane w kucyk, musztardowy sweter, rozkłada na podłodze kartonowe pudełko"
        >
          Przeciągnij suwak i patrz, jak ściany odchylają się po krawędziach. Potem rozetnij to samo
          pudełko inaczej — układ prostokątów wyjdzie zupełnie inny, choć bryła jest ta sama.
        </LessonImageCard>
        <UnfoldBox color={color} onComplete={rozgrzewka.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="siatka">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.siatka}
          alt="Nożyczki, rolka taśmy i rozcięty wzdłuż krawędzi karton rozłożony płasko na drewnianym blacie"
        >
          <p>
            Skoro siatka ma sześć prostokątów, to czy każde sześć kwadratów jest siatką? Sprawdź to
            jedynym uczciwym sposobem: <strong>każ układowi się złożyć</strong>. Przy dobrym układzie
            sześć kwadratów zakryje sześć różnych ścian; przy złym — dwa wjadą na to samo miejsce,
            a jedna ściana zostanie odkryta.
          </p>
        </LessonImageCard>
        <NetFoldCheck mode="judge" color={color} onComplete={siatka.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Chłopiec około dziesięciu lat, jasna karnacja, krótkie kręcone ciemnobrązowe włosy, zielona koszulka, rysuje ołówkiem i linijką plan pudełka na papierze w kratkę"
          lead="Najpierw pary, potem liczby."
          reverse
        >
          Trzy rozwiązania krok po kroku: raz z bryły na siatkę, raz odwrotnie, a na koniec pytanie,
          ile w ogóle kartonu zajmuje cała siatka.
        </LessonImageCard>
        <NetDimensionSteps color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Kilka pustych kartonowych opakowań o różnych kształtach ustawionych obok siebie na półce"
          reverse
        >
          <p>
            Osiem zadań o rosnącej trudności: od liczby prostokątów w siatce, przez rozpoznanie
            układu, który naprawdę się złoży, po pole całej siatki i pytanie o ściany leżące
            naprzeciw siebie.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildNetDrill(color)}
          color={color}
          onFinish={cwiczenia.markStepDone}
        />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="zadanie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zadanie}
          lead="Prawie siatka to jeszcze nie siatka."
          alt="Chłopiec około dziewięciu lat, jasna karnacja, proste jasnobrązowe włosy, szara bluza z kapturem, składa z grubego papieru małe pudełko na stole"
        >
          Trzy układy, z których żaden się nie zamyka — a każdy da się uratować przełożeniem
          jednego kwadratu. Zanim ruszysz kwadrat, spróbuj przewidzieć, które dwie ściany wchodzą
          na siebie.
        </LessonImageCard>
        <NetFoldCheck mode="repair" color={color} onComplete={zadanie.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: siatki prostopadłościanu</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Siedem zdań, które wystarczą na cały ten temat.
        </p>
        <ol className="divide-y border">
          {NET_RULES.map((rule, index) => (
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

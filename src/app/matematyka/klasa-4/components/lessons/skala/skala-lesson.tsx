'use client';

import Image from 'next/image';
import { Divide, Map, Ruler, X as Multiply } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { imgMap } from '@/lib/media';
import { ScaleCompareWarmup } from './scale-compare-warmup';
import { PlanFitLab, type FitRound } from './plan-fit-lab';
import { ScaleWorkedExamples } from './scale-worked-examples';
import { buildDrillTasks, buildProblemTasks } from './skala-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Który rysunek będzie większy?',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'definicje',
    kind: 'Nowe pojęcie',
    title: 'Który rysunek zmieści się na kartce?',
    time: '8 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Plan łazienki i boisko',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Przelicz w obie strony',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'plan-pokoju',
    kind: 'Zadanie problemowe',
    title: 'Odczytaj plan pokoju',
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

const FIT_ROUNDS: FitRound[] = [
  { label: 'Boisko do koszykówki: 2800 cm długości. Kartka robocza: 20 cm szerokości. Wybierz skalę, która zmieści rysunek na kartce.', realCm: 2800, pageCm: 20 },
  { label: 'Basen: 5000 cm (50 m) długości. Kartka robocza: 15 cm szerokości. Tym razem drzwi się zwężyły — wybierz skalę, która i tak zmieści rysunek.', realCm: 5000, pageCm: 15 },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'zapis-1-250',
    question: 'Zapis 1:250 oznacza, że...',
    options: [
      { id: 'a', text: 'rysunek jest 250 razy mniejszy niż w rzeczywistości' },
      { id: 'b', text: 'rysunek jest 250 razy większy niż w rzeczywistości' },
      { id: 'c', text: 'rzeczywistość jest 250 razy mniejsza niż rysunek' },
      { id: 'd', text: 'obie strony są sobie równe' },
    ],
    correctId: 'a',
    explanation: 'Druga liczba skali mówi, ile razy pomniejszono rzeczywistość na rysunku.',
  },
  {
    id: 'sciezka-1-300',
    question: 'Na planie ogrodu ścieżka ma 5 cm. Skala planu to 1:300. Jaka jest prawdziwa długość ścieżki?',
    options: [
      { id: 'a', text: '60 cm' },
      { id: 'b', text: '1500 cm' },
      { id: 'c', text: '305 cm' },
      { id: 'd', text: '15 cm' },
    ],
    correctId: 'b',
    explanation: '5 cm × 300 = 1500 cm.',
  },
  {
    id: 'mapa-1-1000',
    question: 'Prawdziwa odległość 60 m ma zmieścić się na mapie w skali 1:1000. Ile centymetrów zajmie na mapie?',
    options: [
      { id: 'a', text: '60 cm' },
      { id: 'b', text: '600 cm' },
      { id: 'c', text: '6 cm' },
      { id: 'd', text: '0,6 cm' },
    ],
    correctId: 'c',
    explanation: '60 m to 6000 cm. 6000 : 1000 = 6 cm.',
  },
  {
    id: 'skala-powiekszenie',
    question: 'Który z tych zapisów oznacza POWIĘKSZENIE, a nie pomniejszenie?',
    options: [
      { id: 'a', text: '1:5' },
      { id: 'b', text: '1:50' },
      { id: 'c', text: '1:500' },
      { id: 'd', text: '5:1' },
    ],
    correctId: 'd',
    explanation: 'Gdy pierwsza liczba jest większa niż druga, rysunek jest większy niż rzeczywistość — to powiększenie.',
  },
  {
    id: 'ktory-wiekszy-plan',
    question: 'Dwa plany tego samego mieszkania mają skale 1:50 i 1:100. Który rysunek jest większy?',
    options: [
      { id: 'a', text: '1:50' },
      { id: 'b', text: '1:100' },
      { id: 'c', text: 'Oba takie same' },
      { id: 'd', text: 'Nie da się tego porównać' },
    ],
    correctId: 'a',
    explanation: 'Mniejsza druga liczba (1:50) pomniejsza słabiej, więc daje większy rysunek.',
  },
  {
    id: 'dlaczego-jednostki',
    question: 'Dlaczego przy przeliczaniu kilometrów przez skalę trzeba je najpierw zamienić na centymetry?',
    options: [
      { id: 'a', text: 'Bo skala zawsze musi być zapisana w kilometrach' },
      { id: 'b', text: 'Żeby obie strony skali były zapisane w tej samej jednostce' },
      { id: 'c', text: 'To nie jest konieczne, działa każda jednostka naraz' },
      { id: 'd', text: 'Bo centymetry są po prostu dokładniejsze' },
    ],
    correctId: 'b',
    explanation: 'Skala porównuje dwie długości — obie muszą być w tej samej jednostce, żeby mnożenie i dzielenie miały sens.',
  },
];

const CHEAT_SHEET = [
  'Skala 1:100 znaczy: 1 jednostka na rysunku = 100 takich samych jednostek w rzeczywistości.',
  'Z rysunku na rzeczywistość: mnożysz przez drugą liczbę skali.',
  'Z rzeczywistości na rysunek: dzielisz przez drugą liczbę skali.',
  'Obie strony skali muszą być w tej samej jednostce — zamień km/m na cm przed przeliczeniem.',
  'Mniejsza druga liczba (1:10) = słabsze pomniejszenie = większy rysunek.',
  'Zapis w rodzaju 2:1 to wyjątek — powiększenie, nie pomniejszenie.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/skala/plan-domu-z-linijka.jpg',
  rozgrzewka: '/images/matematyka/lekcje/skala/modele-w-roznych-skalach-na-polce.jpg',
  definicje: '/images/matematyka/lekcje/skala/dziecko-rysuje-plan-na-duzej-kartce.jpg',
  przyklady: '/images/matematyka/lekcje/skala/plan-lazienki-na-biurku.jpg',
  trening: '/images/matematyka/lekcje/skala/atlas-geograficzny-otwarty-na-mapie.jpg',
  'plan-pokoju': '/images/matematyka/lekcje/skala/dziecko-mierzy-plan-pokoju-linijka.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function SkalaLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const roomCase = useStepDone('plan-pokoju');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Z przewodnika znasz już zapis <strong>1:100</strong> i wiesz, że mnożysz albo dzielisz,
            żeby przejść między rysunkiem a rzeczywistością. Dziś użyjesz tego naprawdę — żeby
            wybrać skalę, która zmieści się na kartce, i odczytać prawdziwe wymiary z planu pokoju.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Multiply, text: 'Rysunek → rzeczywistość: mnożysz' },
              { icon: Divide, text: 'Rzeczywistość → rysunek: dzielisz' },
              { icon: Ruler, text: 'Mniejsza druga liczba = większy rysunek' },
              { icon: Map, text: 'Skala czyta się tak samo na planie i na mapie' },
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
            alt="Plan domu narysowany na kartce, obok linijki i ołówka"
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
          alt="Modele w różnych skalach ustawione obok siebie na półce"
          lead="Zanim zaczniesz liczyć, wyrób sobie wyczucie skali."
        >
          Ten sam przedmiot, dwie różne skale — który rysunek wyjdzie większy?
        </LessonImageCard>
        <ScaleCompareWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="definicje">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.definicje}
          alt="Dziecko rysujące plan na dużej kartce papieru rozłożonej na podłodze"
        >
          <p>
            Za duży rysunek nie zmieści się na kartce. Wybierz skalę, która pomniejszy
            rzeczywistość na tyle, żeby rysunek się zmieścił — ale nie bardziej, niż to konieczne.
          </p>
        </LessonImageCard>
        <PlanFitLab color={color} rounds={FIT_ROUNDS} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="2×"
          kicker="Ta sama zależność, nowe liczby"
          image={IMAGES.przyklady}
          alt="Plan łazienki rozłożony na biurku"
        >
          Dwa nowe przykłady — tym razem wanna w łazience i boisko szkolne.
        </LessonImageCard>
        <ScaleWorkedExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Otwarty atlas geograficzny z widoczną mapą"
          reverse
        >
          <p>Czas przeliczać samodzielnie — w obie strony, a na koniec nawet w skali powiększającej.</p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks()} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="plan-pokoju">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES['plan-pokoju']}
          alt="Dziecko mierzące linijką plan pokoju narysowany na kartce"
          reverse
          lead="Jeden plan, trzy prawdziwe wymiary do odczytania."
        >
          Ten sam plan pokoju w skali 1:50 posłuży do wszystkich trzech pytań.
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildProblemTasks(color)}
          color={color}
          onFinish={roomCase.markStepDone}
          resultCopy={{
            perfect: { title: 'Plan odczytany bezbłędnie!', message: 'Każdy wymiar trafiony — od razu na czysto.' },
            good: { title: 'Prawie się udało', message: 'Większość wymiarów trafiona — sprawdź wyjaśnienia przy pomyłkach.' },
            poor: { title: 'Spróbuj jeszcze raz', message: 'Zasada jest zawsze ta sama: długość na rysunku × skala.' },
          }}
        />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: skala w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">Wracaj do niej, gdy w kolejnej lekcji spotkasz rysunek pomocniczy.</p>
        <ol className="divide-y border">
          {CHEAT_SHEET.map((rule, index) => (
            <li key={rule} className="flex items-start gap-4 px-4 py-3">
              <span className="w-6 shrink-0 font-mono text-lg font-bold leading-none tabular-nums" style={{ color }}>
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

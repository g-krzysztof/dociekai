'use client';

import Image from 'next/image';
import { Brain, ListOrdered, Puzzle as PuzzleIcon, Sparkles as SparklesIcon } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { OrderingRiddleWarmup } from './ordering-riddle-warmup';
import { ProblemBuilder } from './problem-builder';
import { BuilderWorkedExamples } from './builder-worked-examples';
import { buildDrillTasks, buildProblemTasks } from './ukladanie-zadan-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Łamigłówki bez liczb',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'definicje',
    kind: 'Nowe pojęcie',
    title: 'Ułóż zadanie z zadanym wynikiem',
    time: '9 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Dwa gotowe wzorce',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Dopasuj i ułóż',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'zagadki',
    kind: 'Zadanie problemowe',
    title: 'Łańcuch zagadek liczbowych',
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
    id: 'dobrze-ulozone-quiz',
    question: 'Co pomaga sprawdzić, czy zadanie tekstowe jest „dobrze ułożone”?',
    options: [
      { id: 'a', text: 'Ma jasne dane liczbowe i pytanie, na które da się odpowiedzieć' },
      { id: 'b', text: 'Jest bardzo długie' },
      { id: 'c', text: 'Ma ładne, ozdobne zdania' },
      { id: 'd', text: 'Nie zawiera żadnych liczb' },
    ],
    correctId: 'a',
    explanation: 'Dobre zadanie zawsze ma konkretne dane i jasne pytanie — bez tego nie da się go rozwiązać.',
  },
  {
    id: 'ktore-nie-daja-30',
    question: 'Który z tych zestawów dwóch liczb NIE daje 30 po pomnożeniu?',
    options: [
      { id: 'a', text: '5 i 6' },
      { id: 'b', text: '4 i 8' },
      { id: 'c', text: '3 i 10' },
      { id: 'd', text: '15 i 2' },
    ],
    correctId: 'b',
    explanation: '4 × 8 = 32, nie 30. Pozostałe trzy pary rzeczywiście dają 30.',
  },
  {
    id: 'zagadka-o-20-mniejsza',
    question: 'Zagadka: „Jestem liczbą o 20 mniejszą od 65.” Jaką jestem liczbą?',
    options: [
      { id: 'a', text: '85' },
      { id: 'b', text: '40' },
      { id: 'c', text: '45' },
      { id: 'd', text: '50' },
    ],
    correctId: 'c',
    explanation: '65 − 20 = 45.',
  },
  {
    id: 'dlaczego-wiecej-odpowiedzi',
    question: 'Dlaczego niektóre zagadki mają więcej niż jedną poprawną odpowiedź?',
    options: [
      { id: 'a', text: 'Bo takie zagadki są zawsze źle ułożone' },
      { id: 'b', text: 'Bo liczby nigdy nie mają dokładnie określonych własności' },
      { id: 'c', text: 'To się nigdy nie zdarza w matematyce' },
      { id: 'd', text: 'Bo kilka różnych liczb może spełniać dokładnie te same warunki' },
    ],
    correctId: 'd',
    explanation: 'Im mniej precyzyjne warunki (np. „liczba parzysta między 40 a 50”), tym więcej liczb może je spełniać naraz.',
  },
  {
    id: 'sensowne-x-y',
    question: 'Ala buduje zadanie: „W klasie jest X uczniów, Y wyjechało na wycieczkę.” Żeby zadanie miało sens, X musi być...',
    options: [
      { id: 'a', text: 'Większe lub równe Y' },
      { id: 'b', text: 'Mniejsze niż Y' },
      { id: 'c', text: 'Zawsze liczbą nieparzystą' },
      { id: 'd', text: 'Zawsze podzielne przez Y' },
    ],
    correctId: 'a',
    explanation: 'Nie można wyjechać więcej uczniów, niż w ogóle jest w klasie — inaczej zadanie nie miałoby sensu.',
  },
  {
    id: 'pierwszy-krok-budowy',
    question: 'Który pierwszy krok pomaga ułożyć własne zadanie pasujące do zadanego wyniku?',
    options: [
      { id: 'a', text: 'Napisać dowolne zdanie, bez liczb' },
      { id: 'b', text: 'Wybrać działanie i dwie liczby, które razem dają ten wynik' },
      { id: 'c', text: 'Od razu zapisać odpowiedź jako pytanie' },
      { id: 'd', text: 'Skopiować cudze zadanie' },
    ],
    correctId: 'b',
    explanation: 'Zaczynasz od matematyki (działanie + liczby dające właściwy wynik), dopiero potem ubierasz to w słowa.',
  },
];

const CHEAT_SHEET = [
  'Dobre zadanie ma konkretne dane liczbowe i jasne pytanie.',
  'Zacznij od działania i liczb, które dają zamierzony wynik — dopiero potem ubierz to w słowa.',
  'Ten sam wynik można otrzymać wieloma różnymi parami liczb.',
  'W zagadce sprawdzaj, czy warunki naprawdę wskazują jedną liczbę — czasem pasuje ich kilka.',
  'Łańcuch porównań („A > B, B > C”) da się rozwikłać bez liczenia — samym rozumowaniem.',
  'Zadanie bez konkretnych danych („pewna liczba cukierków”) nie da się rozwiązać.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/ukladanie-zadan/karteczki-z-zagadkami-na-stole.jpg',
  rozgrzewka: '/images/matematyka/lekcje/ukladanie-zadan/drewniane-figurki-w-rzedzie-wedlug-wzrostu.jpg',
  definicje: '/images/matematyka/lekcje/ukladanie-zadan/dziecko-uklada-zadanie-w-zeszycie.jpg',
  przyklady: '/images/matematyka/lekcje/ukladanie-zadan/notatnik-z-prostym-diagramem.jpg',
  trening: '/images/matematyka/lekcje/ukladanie-zadan/kostki-do-gry-i-kartki-na-biurku.jpg',
  zagadki: '/images/matematyka/lekcje/ukladanie-zadan/dziecko-rozwiazuje-zagadke-z-lupa.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function UkladanieZadanLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const riddleCase = useStepDone('zagadki');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Do tej pory rozwiązywałeś/aś cudze zadania. Dziś zamienisz się rolami: sam/a ułożysz
            zadanie, które ma pasować do konkretnego wyniku — i sprawdzisz, że jedną odpowiedź
            można zbudować na więcej niż jeden sposób.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: ListOrdered, text: 'Łańcuch porównań da się rozwikłać bez liczenia' },
              { icon: SparklesIcon, text: 'Wybierz działanie i liczby dające zadany wynik' },
              { icon: Brain, text: 'Kilka par liczb może dać ten sam wynik' },
              { icon: PuzzleIcon, text: 'Zagadka czasem ma więcej niż jedną odpowiedź' },
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
            alt="Papierowe karteczki z zagadkami rozłożone na stole obok długopisu"
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
          alt="Trzy drewniane figurki różnej wysokości ustawione w rzędzie"
          lead="Nie każda łamigłówka wymaga liczenia."
        >
          Te zagadki rozwiążesz samym rozumowaniem — porównując, kto jest wyższy, szybszy albo
          wcześniejszy.
        </LessonImageCard>
        <OrderingRiddleWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="definicje">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.definicje}
          alt="Dziecko układające własne zadanie tekstowe w zeszycie, z zamyśloną miną"
        >
          <p>
            Wybierz dwie liczby tak, żeby ułożone zadanie dało dokładnie zamierzony wynik. Czasem
            pasuje więcej niż jedna para — to normalne.
          </p>
        </LessonImageCard>
        <ProblemBuilder color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="2×"
          kicker="Od szkieletu do gotowego zadania"
          image={IMAGES.przyklady}
          alt="Otwarty notatnik z narysowanym prostym diagramem"
        >
          Jedno zwykłe zadanie tekstowe, jedna zagadka liczbowa — ten sam sposób budowania.
        </LessonImageCard>
        <BuilderWorkedExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Kostki do gry i kartki papieru rozłożone na biurku"
          reverse
        >
          <p>Czas samodzielnie dopasowywać działania do treści i układać krótkie zagadki.</p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks()} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="zagadki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zagadki}
          alt="Dziecko w okularach patrzące przez lupę, skupione jak młody detektyw"
          reverse
          lead="Trzy zagadki liczbowe pod rząd."
        >
          Ostatnia z nich ma więcej niż jedną poprawną odpowiedź — uważaj.
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildProblemTasks()}
          color={color}
          onFinish={riddleCase.markStepDone}
          resultCopy={{
            perfect: { title: 'Mistrzu zagadek!', message: 'Rozwiązałeś/aś cały łańcuch bezbłędnie.' },
            good: { title: 'Prawie idealnie', message: 'Większość zagadek trafiona — sprawdź wyjaśnienia przy pomyłkach.' },
            poor: { title: 'Spróbuj jeszcze raz', message: 'Każdy warunek zagadki zawęża listę pasujących liczb — sprawdzaj je po kolei.' },
          }}
        />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: układanie zadań w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">Wracaj do niej, gdy w podsumowaniu modułu spotkasz zadania różnych typów naraz.</p>
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

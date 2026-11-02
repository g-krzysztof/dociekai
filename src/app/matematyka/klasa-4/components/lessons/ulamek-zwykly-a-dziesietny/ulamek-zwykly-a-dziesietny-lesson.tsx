'use client';

import Image from 'next/image';
import { ArrowLeftRight, Divide, Equal, X as XIcon } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { PowerOfTenSort } from './power-of-ten-sort';
import { ExpandToDecimal } from './expand-to-decimal';
import { DecimalToFractionReducer } from './decimal-to-fraction-reducer';
import { ConversionDrill } from './conversion-drill';
import { RecipeConversionChallenge } from './recipe-conversion-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'sortowanie',
    kind: 'Rozgrzewka',
    title: 'Da się czy nie da się?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'rozszerzanie',
    kind: 'Nowe pojęcie',
    title: 'Ułamek zwykły → dziesiętny przez rozszerzanie',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'skracanie',
    kind: 'Przykłady',
    title: 'Dziesiętny → ułamek zwykły przez skracanie',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Trening w obie strony',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'przepis',
    kind: 'Zadanie problemowe',
    title: 'Przepis na babeczki',
    time: '6 min',
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
    id: 'trzy-czwarte',
    question: '3/4 zapisane jako ułamek dziesiętny to…',
    options: [
      { id: 'a', text: '0,75' },
      { id: 'b', text: '0,34' },
      { id: 'c', text: '0,25' },
      { id: 'd', text: '3,4' },
    ],
    correctId: 'a',
    explanation: 'Mianownik 4 rozszerzamy przez 25 do 100, licznik też: 75/100 = 0,75.',
  },
  {
    id: 'rozszerz-jedna-piata',
    question: 'Rozszerz 1/5 tak, żeby mianownik był równy 10. Co dostaniesz?',
    options: [
      { id: 'a', text: '1/10' },
      { id: 'b', text: '5/10' },
      { id: 'c', text: '2/10' },
      { id: 'd', text: '10/10' },
    ],
    correctId: 'c',
    explanation: '5 × 2 = 10, więc licznik też mnożymy przez 2: 1 × 2 = 2. Wychodzi 2/10 (czyli 0,2).',
  },
  {
    id: 'cwierc-na-ulamek',
    question: '0,25 zapisane jako ułamek zwykły w postaci nieskracalnej to…',
    options: [
      { id: 'a', text: '25/100' },
      { id: 'b', text: '2/5' },
      { id: 'c', text: '1/5' },
      { id: 'd', text: '1/4' },
    ],
    correctId: 'd',
    explanation: '0,25 = 25/100, a 25 i 100 dzielą się przez 25: wychodzi 1/4.',
  },
  {
    id: 'dlaczego-jedna-trzecia',
    question: 'Dlaczego 1/3 nie da się zapisać jako skończony ułamek dziesiętny?',
    options: [
      { id: 'a', text: 'Bo licznik jest za mały' },
      { id: 'b', text: 'Bo w mianowniku jest trójka — nie da się dojść do 10, 100 ani 1000' },
      { id: 'c', text: 'Bo 3 to liczba nieparzysta' },
      { id: 'd', text: 'Bo 1/3 to więcej niż jedna całość' },
    ],
    correctId: 'b',
    explanation: 'Do potęgi 10 dochodzą tylko mianowniki z samych dwójek i piątek. Trójki nie da się usunąć — 1/3 to 0,333… bez końca.',
  },
  {
    id: 'siedem-dziesiatych',
    question: 'Ile to 7/10 zapisane liczbą z przecinkiem?',
    options: [
      { id: 'a', text: '0,07' },
      { id: 'b', text: '7,0' },
      { id: 'c', text: '0,7' },
      { id: 'd', text: '0,17' },
    ],
    correctId: 'c',
    explanation: 'Mianownik jest już równy 10 — licznik 7 wchodzi wprost na miejsce dziesiątych: 0,7.',
  },
  {
    id: 'trzysta-siedemdziesiat-piec',
    question: '0,375 zapisane jako ułamek zwykły w postaci nieskracalnej to…',
    options: [
      { id: 'a', text: '375/1000' },
      { id: 'b', text: '3/8' },
      { id: 'c', text: '37/100' },
      { id: 'd', text: '3,75' },
    ],
    correctId: 'b',
    explanation: '0,375 = 375/1000. Licznik i mianownik dzielą się przez 125: wychodzi 3/8.',
  },
];

const CHEAT_SHEET = [
  'Ułamek zwykły → dziesiętny: rozszerz go tak, żeby mianownik był równy 10, 100 albo 1000, i odczytaj cyfry z licznika.',
  'Licznik i mianownik mnożymy TĄ SAMĄ liczbą — inaczej zmienisz wartość ułamka.',
  'Da się tylko wtedy, gdy mianownik jest zbudowany z samych dwójek i piątek (2, 4, 5, 8, 20, 25…). 1/3 czy 1/7 dają liczbę bez końca.',
  'Dziesiętny → zwykły: zapisz cyfry po przecinku nad 10, 100 lub 1000 (tyle zer, ile miejsc), a potem skróć.',
  'Skracamy, dzieląc licznik i mianownik przez tę samą liczbę, aż nie mają wspólnego dzielnika większego od 1.',
  'Znane pary warto po prostu pamiętać: 1/2 = 0,5, 1/4 = 0,25, 3/4 = 0,75, 1/5 = 0,2, 1/10 = 0,1.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/ulamek-zwykly-a-dziesietny/kawalek-tortu-i-szklanka-mleka.jpg',
  sortowanie: '/images/matematyka/lekcje/ulamek-zwykly-a-dziesietny/pizza-podzielona-na-czesci.jpg',
  skracanie: '/images/matematyka/lekcje/ulamek-zwykly-a-dziesietny/chlopiec-kroi-placek.jpg',
  trening: '/images/matematyka/lekcje/ulamek-zwykly-a-dziesietny/dziewczynka-z-kalkulatorem.jpg',
  przepis: '/images/matematyka/lekcje/ulamek-zwykly-a-dziesietny/skladniki-do-pieczenia-i-waga.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function UlamekZwyklyADziesietnyLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const sortowanie = useStepDone('sortowanie');
  const rozszerzanie = useStepDone('rozszerzanie');
  const skracanie = useStepDone('skracanie');
  const trening = useStepDone('trening');
  const przepis = useStepDone('przepis');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            <strong>3/4 szklanki</strong> i <strong>0,75 szklanki</strong> to ta sama ilość — tylko
            zapisana dwoma sposobami. Dziś nauczysz się przechodzić między nimi{' '}
            <strong>w obie strony</strong>: rozszerzając ułamek do mianownika 10, 100 lub 1000, i
            skracając z powrotem.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: XIcon, text: 'Zwykły → dziesiętny: rozszerz mianownik do 10/100/1000' },
              { icon: Equal, text: 'Licznik i mianownik mnożymy tą samą liczbą' },
              { icon: Divide, text: 'Dziesiętny → zwykły: nad potęgą 10, potem skróć' },
              { icon: ArrowLeftRight, text: 'Nie każdy ułamek się da — 1/3 to 0,333…' },
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
            alt="Kawałek tortu obok szklanki mleka na kuchennym blacie"
            width={240}
            height={180}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* 1. Rozgrzewka */}
      <LessonSection id="sortowanie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.sortowanie}
          alt="Okrągła pizza podzielona na równe kawałki, kilku brakuje"
          lead="Nie każdy ułamek da się zapisać skończoną liczbą z przecinkiem."
        >
          O tym, czy zamiana się uda, decyduje wyłącznie mianownik. Zanim zaczniesz zamieniać,
          naucz się rozpoznawać, które mianowniki „wpuszczają” do dziesiątek, setek i tysięcy.
        </LessonImageCard>
        <PowerOfTenSort color={color} onComplete={sortowanie.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="rozszerzanie">
        <ExpandToDecimal color={color} onComplete={rozszerzanie.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="skracanie">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="½"
          kicker="Droga powrotna"
          image={IMAGES.skracanie}
          alt="Chłopiec kroi okrągły placek na równe części"
        >
          Teraz w drugą stronę: z liczby z przecinkiem robimy ułamek zwykły. Cyfry po przecinku lądują
          nad potęgą 10 — a potem tniemy ten ułamek na coraz mniejsze kawałki, aż się nie da.
        </LessonImageCard>
        <DecimalToFractionReducer color={color} onComplete={skracanie.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Dziewczynka zapisuje w zeszycie zamiany ułamków, obok leży kalkulator"
        >
          <p>
            Sześć zadań o rosnącej trudności — zamiana w obie strony, rozszerzanie do 100 i 1000 oraz
            rozpoznanie ułamka, którego zapisać się nie da.
          </p>
        </LessonImageCard>
        <ConversionDrill color={color} onComplete={trening.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="przepis">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przepis}
          alt="Mąka, cukier, waga kuchenna i miarka na blacie"
          reverse
          lead="W przepisie część ilości podano ułamkiem zwykłym, część liczbą z przecinkiem."
        >
          Żeby je porównać i ustawić po kolei, musisz najpierw sprowadzić wszystko do jednego zapisu.
        </LessonImageCard>
        <RecipeConversionChallenge color={color} onComplete={przepis.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: ułamek zwykły ↔ dziesiętny</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej, gdy trzeba przejść z jednego zapisu na drugi.
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

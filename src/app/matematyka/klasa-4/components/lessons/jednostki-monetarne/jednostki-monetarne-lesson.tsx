'use client';

import Image from 'next/image';
import { ArrowRightLeft, Banknote, Receipt, Wallet } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { CoinPileWarmup } from './coin-pile-warmup';
import { MoneyBuilder } from './money-builder';
import { MoneyExamples } from './money-examples';
import { MoneyDrill } from './money-drill';
import { ShopChallenge } from './shop-challenge';
import { MONEY_RULES } from '../../../lib/money';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ile wart jest ten stosik?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Ułóż kwotę z portfela',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Zamiana i liczenie pieniędzy',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz obliczenia pieniężne',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'sklepik',
    kind: 'Zadanie problemowe',
    title: 'Wydaj resztę w sklepiku',
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
    id: 'ile-groszy-w-zlotym',
    question: 'Ile groszy ma 1 złoty?',
    options: [
      { id: 'a', text: '10' },
      { id: 'b', text: '1000' },
      { id: 'c', text: '100' },
      { id: 'd', text: '50' },
    ],
    correctId: 'c',
    explanation: '1 złoty to zawsze 100 groszy — tyle samo, co sto groszowych monet razem.',
  },
  {
    id: 'ta-sama-kwota',
    question: 'Które zapisano jako 305 gr?',
    options: [
      { id: 'a', text: '3 zł 5 gr' },
      { id: 'b', text: '3 zł 50 gr' },
      { id: 'c', text: '35 gr' },
      { id: 'd', text: '30 zł 5 gr' },
    ],
    correctId: 'a',
    explanation: '3 zł to 300 gr, plus 5 gr = 305 gr. „3 zł 50 gr” to już 350 gr — inna kwota.',
  },
  {
    id: 'dodawanie-quiz',
    question: '12 zł 80 gr + 5 zł 45 gr = ?',
    options: [
      { id: 'a', text: '17 zł 25 gr' },
      { id: 'b', text: '18 zł 15 gr' },
      { id: 'c', text: '17 zł 125 gr' },
      { id: 'd', text: '18 zł 25 gr' },
    ],
    correctId: 'd',
    explanation: '80 gr + 45 gr = 125 gr, czyli 1 zł 25 gr. 12 zł + 5 zł + 1 zł = 18 zł. Razem: 18 zł 25 gr.',
  },
  {
    id: 'odejmowanie-quiz',
    question: '20 zł − 7 zł 60 gr = ?',
    options: [
      { id: 'a', text: '13 zł 40 gr' },
      { id: 'b', text: '12 zł 40 gr' },
      { id: 'c', text: '12 zł 60 gr' },
      { id: 'd', text: '13 zł 60 gr' },
    ],
    correctId: 'b',
    explanation: '20 zł to 19 zł i 100 gr. 100 gr − 60 gr = 40 gr, 19 zł − 7 zł = 12 zł. Razem: 12 zł 40 gr.',
  },
  {
    id: 'reszta-quiz',
    question: 'Masz banknot 20 zł i kupujesz coś za 13 zł 75 gr. Ile wynosi reszta?',
    options: [
      { id: 'a', text: '6 zł 25 gr' },
      { id: 'b', text: '7 zł 35 gr' },
      { id: 'c', text: '6 zł 35 gr' },
      { id: 'd', text: '7 zł 25 gr' },
    ],
    correctId: 'a',
    explanation: '20 zł to 2000 gr, cena to 1375 gr. 2000 − 1375 = 625 gr, czyli 6 zł 25 gr.',
  },
  {
    id: 'dwie-cyfry-groszy',
    question:
      'Dlaczego grosze w cenach zapisujemy zawsze dwiema cyframi, np. 4 zł 05 gr, a nie 4 zł 5 gr?',
    options: [
      { id: 'a', text: 'Żeby wyglądało ładniej' },
      { id: 'b', text: '05 gr i 50 gr to zupełnie różne kwoty — bez dwóch cyfr łatwo je pomylić' },
      { id: 'c', text: 'To nieważne, oba zapisy znaczą to samo' },
      { id: 'd', text: 'Bo tak każe zasada zaokrąglania' },
    ],
    correctId: 'b',
    explanation:
      'Grosze zawsze zajmują dwa miejsca (00–99). Bez wiodącego zera „4 zł 5 gr” łatwo pomylić z 50 gr, choć to zupełnie inna kwota.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/jednostki-monetarne/skarbonka-z-monetami.jpg',
  rozgrzewka: '/images/matematyka/lekcje/jednostki-monetarne/stos-monet-na-stole.jpg',
  nowePojecie: '/images/matematyka/lekcje/jednostki-monetarne/sortowanie-monet.jpg',
  przyklady: '/images/matematyka/lekcje/jednostki-monetarne/notatnik-z-obliczeniami.jpg',
  sklepik: '/images/matematyka/lekcje/jednostki-monetarne/sklepik-szkolny.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function JednostkiMonetarneLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('sklepik');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Złote i grosze widzisz codziennie — w portfelu, w sklepie, w skarbonce. Ta lekcja
            pokazuje, jak <strong>liczyć nimi tak samo pewnie</strong>, jak liczysz zwykłe liczby.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Wallet, text: '1 złoty to 100 groszy — dwie jednostki, jeden system' },
              { icon: ArrowRightLeft, text: 'Zamiana zł na grosze i odwrotnie, zawsze tą samą metodą' },
              { icon: Banknote, text: 'Dodawanie i odejmowanie kwot — z przeniesieniem przez 100 gr' },
              { icon: Receipt, text: 'Liczenie reszty — dokładnie tak, jak w prawdziwym sklepie' },
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
            alt="Stosy złotych i srebrnych monet ułożone na drewnianym stole"
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
          alt="Dziewczynka z rudymi włosami patrząca na rozsypane na stole monety"
        >
          <p>
            Zanim poznasz metodę, sprawdź wyczucie — ile wart jest stosik monet, patrząc na niego
            bez liczenia po kolei?
          </p>
        </LessonImageCard>
        <CoinPileWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Chłopiec sortujący monety na osobne stosiki na stole"
          lead="100 groszy to zawsze dokładnie 1 złoty — obejrzyj ten moment na własnej tacy."
        >
          Klikaj monety z portfela, buduj kwotę i patrz, co dzieje się, gdy grosze przekroczą
          setkę.
        </LessonImageCard>
        <MoneyBuilder color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 przykłady: zamiana i liczenie"
          alt="Notatnik i ołówek na biurku, w tle rozmyte stosiki monet"
        >
          Czasem zamieniasz złote na grosze, czasem odwrotnie, a czasem dodajesz albo odejmujesz
          całe kwoty — metoda za każdym razem jest ta sama.
        </LessonImageCard>
        <MoneyExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <MoneyDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="sklepik">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.sklepik}
          alt="Dwoje dzieci przy stoliku ze szkolnym sklepikiem, jedno podaje drugiemu banknot"
          reverse
          lead="W prawdziwym sklepiku nikt nie liczy reszty za Ciebie — dziś zrobisz to sam/a."
        >
          Wybierz zakupy, zapłać banknotem 10 zł i wydaj sobie resztę co do grosza.
        </LessonImageCard>
        <ShopChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: złote i grosze w pięciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama zasada działa dla każdej kwoty — od jednego grosza po setki złotych.
        </p>
        <ol className="divide-y border">
          {MONEY_RULES.map((rule, index) => (
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

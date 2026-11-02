'use client';

import Image from 'next/image';
import { Hash, PenLine, ScanEye, Sparkles } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { DecimalOrderWarmup } from './decimal-order-warmup';
import { FractionToDecimalBuilder } from './fraction-to-decimal-builder';
import { DecimalReadingSteps } from './decimal-reading-steps';
import { DecimalDrill } from './decimal-drill';
import { RaceTimesChallenge } from './race-times-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ta sama cyfra, sześć rzędów',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'budowanie',
    kind: 'Nowe pojęcie',
    title: 'Z ułamka na przecinek',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'czytanie',
    kind: 'Przykłady',
    title: 'Czytamy liczby z przecinkiem',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Trening z przecinkiem',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'wyscig',
    kind: 'Zadanie problemowe',
    title: 'Wyniki biegu na czas',
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
    id: 'trzy-dziesiate',
    question: 'Jaki ułamek dziesiętny odpowiada 3/10?',
    options: [
      { id: 'a', text: '0,3' },
      { id: 'b', text: '0,03' },
      { id: 'c', text: '3,10' },
      { id: 'd', text: '0,003' },
    ],
    correctId: 'a',
    explanation: 'Mianownik 10 → jedno miejsce po przecinku, a licznik 3 staje się tą cyfrą: 0,3.',
  },
  {
    id: 'mianownik-007',
    question: 'Liczba 0,07 pochodzi z ułamka o mianowniku…',
    options: [
      { id: 'a', text: '10' },
      { id: 'b', text: '100' },
      { id: 'c', text: '1000' },
      { id: 'd', text: '7' },
    ],
    correctId: 'b',
    explanation: '0,07 ma dwa miejsca po przecinku, więc pochodzi z ułamka 7/100.',
  },
  {
    id: 'odczyt-0006',
    question: 'Jak czytamy liczbę 0,006?',
    options: [
      { id: 'a', text: 'zero całych i sześć tysięcznych' },
      { id: 'b', text: 'zero całych i sześć setnych' },
      { id: 'c', text: 'sześć dziesiątych' },
      { id: 'd', text: 'sześćset' },
    ],
    correctId: 'a',
    explanation: 'Trzy miejsca po przecinku to rząd tysięcznych, więc 0,006 czytamy „zero całych i sześć tysięcznych”.',
  },
  {
    id: 'miejsce-dziesiatych',
    question: 'W liczbie 2,4 na miejscu dziesiątych stoi cyfra…',
    options: [
      { id: 'a', text: '2' },
      { id: 'b', text: '4' },
      { id: 'c', text: '0' },
      { id: 'd', text: '24' },
    ],
    correctId: 'b',
    explanation: 'Pierwsza cyfra po przecinku to zawsze rząd dziesiątych — tutaj jest to 4.',
  },
  {
    id: 'ulamek-1000',
    question: 'Zapisz ułamek 125/1000 jako liczbę dziesiętną.',
    options: [
      { id: 'a', text: '0,125' },
      { id: 'b', text: '1,25' },
      { id: 'c', text: '0,0125' },
      { id: 'd', text: '12,5' },
    ],
    correctId: 'a',
    explanation: 'Mianownik 1000 → trzy miejsca po przecinku, a licznik 125 zapełnia je dokładnie: 0,125.',
  },
  {
    id: 'zero-koncowe',
    question: 'Dlaczego 0,5 i 0,50 to ta sama liczba?',
    options: [
      { id: 'a', text: 'Bo dopisanie zera na końcu części dziesiętnej nie zmienia wartości liczby' },
      { id: 'b', text: 'Bo obie liczby są niecałkowite' },
      { id: 'c', text: 'To nieprawda, to dwie różne liczby' },
      { id: 'd', text: 'Bo 5 i 50 mają te same cyfry' },
    ],
    correctId: 'a',
    explanation: 'Zero na końcu części dziesiętnej nie dokłada żadnej wartości — 0,5 i 0,50 to ta sama liczba.',
  },
];

const CHEAT_SHEET = [
  'Mianownik mówi, ile miejsc po przecinku: 10 → jedno, 100 → dwa, 1000 → trzy.',
  'Licznik staje się cyframi po przecinku, czytanymi od lewej do prawej, tak jak jest zapisany.',
  'Gdy w liczniku jest mniej cyfr niż miejsc po przecinku, brakujące miejsca z przodu wypełniamy zerami (8/100 = 0,08).',
  'Zero na końcu części dziesiętnej nie zmienia wartości liczby: 0,5 = 0,50.',
  'Liczbę z przecinkiem czytamy: najpierw część całkowitą („…całe”), potem część po przecinku z nazwą rzędu („…dziesiątych/setnych/tysięcznych”).',
  'Nazwa rzędu zależy od liczby miejsc po przecinku, nie od wartości cyfr — te same cyfry mogą być „dziesiątymi” albo „setnymi”.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/zapis-ulamkow-dziesietnych/termometr-cyfrowy-w-dloni.jpg',
  rozgrzewka: '/images/matematyka/lekcje/zapis-ulamkow-dziesietnych/miarki-rozne-wielkosci.jpg',
  czytanie: '/images/matematyka/lekcje/zapis-ulamkow-dziesietnych/dziecko-trzyma-stoper.jpg',
  cwiczenia: '/images/matematyka/lekcje/zapis-ulamkow-dziesietnych/dziecko-pisze-w-zeszycie.jpg',
  wyscig: '/images/matematyka/lekcje/zapis-ulamkow-dziesietnych/dzieci-biegna-na-biezni.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ZapisUlamkowDziesietnychLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const budowanie = useStepDone('budowanie');
  const czytanie = useStepDone('czytanie');
  const cwiczenia = useStepDone('cwiczenia');
  const wyscig = useStepDone('wyscig');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Z przewodnika znasz już przecinek, rzędy dziesiąte, setne i tysięczne. Dziś zamienisz tę
            wiedzę w umiejętność: sam <strong>zapiszesz ułamek o mianowniku 10, 100 lub 1000</strong>{' '}
            jako liczbę z przecinkiem — i nauczysz się bezbłędnie czytać ją na głos.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Hash, text: 'Mianownik 10/100/1000 = liczba miejsc po przecinku' },
              { icon: PenLine, text: 'Licznik = cyfry po przecinku, czytane po kolei' },
              { icon: ScanEye, text: 'Pułapka: brakujące miejsca wypełniają zera' },
              { icon: Sparkles, text: 'Odczyt na głos: część całkowita + rząd po przecinku' },
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
            alt="Cyfrowy termometr pokazujący temperaturę z przecinkiem w dłoni dziecka"
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
          alt="Rząd miarek i pojemników różnej wielkości ustawionych od najmniejszego do największego"
          lead="Ta sama cyfra, sześć zupełnie różnych wartości."
        >
          Zanim zaczniesz zapisywać ułamki dziesiętne, poczuj, jak bardzo miejsce cyfry zmienia jej
          wartość — po obu stronach przecinka.
        </LessonImageCard>
        <DecimalOrderWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="budowanie">
        <FractionToDecimalBuilder color={color} onComplete={budowanie.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="czytanie">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="3"
          kicker="3 liczby do przeczytania"
          image={IMAGES.czytanie}
          alt="Dziecko trzyma w dłoni cyfrowy stoper pokazujący czas z przecinkiem"
        >
          Umiesz już zapisywać liczby z przecinkiem. Teraz nauczysz się je{' '}
          <strong>czytać na głos</strong> — część całkowita, potem część po przecinku z nazwą rzędu.
        </LessonImageCard>
        <DecimalReadingSteps color={color} onComplete={czytanie.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Dziecko pisze liczby z przecinkiem w zeszycie w kratkę"
        >
          <p>
            Czas na trening. Zadania rosną trudnością — od liczenia miejsc po przecinku, przez
            pułapkę zer, po zamianę w drugą stronę.
          </p>
        </LessonImageCard>
        <DecimalDrill color={color} onComplete={cwiczenia.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="wyscig">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wyscig}
          alt="Dzieci biegnące na bieżni szkolnego stadionu podczas zawodów sportowych"
          reverse
          lead="Poniżej czasy czwórki zawodników z biegu na 60 metrów."
        >
          Czasy mierzy się w sekundach z setnymi — dokładnie tym zapisem, którego się dziś nauczyłeś.
        </LessonImageCard>
        <RaceTimesChallenge color={color} onComplete={wyscig.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: zapis dziesiętny w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej w każdej kolejnej lekcji o ułamkach dziesiętnych.
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

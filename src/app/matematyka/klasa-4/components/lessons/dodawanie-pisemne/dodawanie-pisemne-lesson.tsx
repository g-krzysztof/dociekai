'use client';

import Image from 'next/image';
import { CornerLeftUp, Layers, Receipt, Sigma } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { UstawianieWarmup } from './ustawianie-warmup';
import { ColumnAdditionLab } from './column-addition-lab';
import { DodawaniePrzyklady } from './dodawanie-przyklady';
import { DodawanieDrill } from './dodawanie-drill';
import { ParagonChallenge } from './paragon-challenge';
import { COLUMN_ALGORITHM_RULES } from '../../../lib/column-algorithm';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Gdzie stoi każda cyfra?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Dodawanie pisemne krok po kroku',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: '4 przykłady: od zera do czterech cyfr',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz dodawanie pisemne',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'paragon',
    kind: 'Zadanie problemowe',
    title: 'Sprawdź paragon ze sklepu',
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
    id: 'ustawianie',
    question: 'W dodawaniu pisemnym liczby ustawiamy jedna pod drugą według…',
    options: [
      { id: 'a', text: 'kolejności zapisania' },
      { id: 'b', text: 'wielkości cyfry' },
      { id: 'c', text: 'miejsca dziesiętnego, czyli rzędu wielkości' },
      { id: 'd', text: 'alfabetycznie' },
    ],
    correctId: 'c',
    explanation: 'Jedności pod jednościami, dziesiątki pod dziesiątkami — liczy się tylko rząd wielkości cyfry.',
  },
  {
    id: 'od-ktorej-kolumny',
    question: 'Od której kolumny zaczynamy liczyć w dodawaniu pisemnym?',
    options: [
      { id: 'a', text: 'Od jedności, czyli od prawej strony' },
      { id: 'b', text: 'Od lewej, od najstarszej cyfry' },
      { id: 'c', text: 'Od dowolnej, jaką wybierzemy' },
      { id: 'd', text: 'Od środka liczby' },
    ],
    correctId: 'a',
    explanation: 'Liczymy zawsze od kolumny jedności — dopiero wtedy przeniesienie trafia tam, gdzie powinno.',
  },
  {
    id: 'przeniesienie',
    question: 'W kolumnie jedności wyszło 7 + 6 = 13. Co robimy?',
    options: [
      { id: 'a', text: 'Zapisujemy 13 w kolumnie jedności' },
      { id: 'b', text: 'Zapisujemy 1, a 3 przenosimy dalej' },
      { id: 'c', text: 'Nic nie zapisujemy, to błąd' },
      { id: 'd', text: 'Zapisujemy 3, a 1 przenosimy do kolumny dziesiątek' },
    ],
    correctId: 'd',
    explanation: 'Zapisujemy tylko cyfrę jedności sumy (3), a dziesiątkę (1) przenosimy małą cyfrą do sąsiedniej kolumny.',
  },
  {
    id: 'krotsza-liczba',
    question: 'Liczba 8 jest krótsza od liczby 245. Jak ustawić 8 pod 245?',
    options: [
      { id: 'a', text: 'Pod cyfrą 2 (setki)' },
      { id: 'b', text: 'Pod cyfrą 5 (jedności)' },
      { id: 'c', text: 'Pod cyfrą 4 (dziesiątki)' },
      { id: 'd', text: 'Obok, nie pod żadną cyfrą' },
    ],
    correctId: 'b',
    explanation: '8 to liczba jednocyfrowa, więc jej jedyna cyfra zawsze staje pod jednościami — czyli pod cyfrą 5.',
  },
  {
    id: 'nowa-kolumna',
    question: 'Dlaczego czasem wynik dodawania pisemnego ma o jedną cyfrę więcej niż obie dodawane liczby?',
    options: [
      { id: 'a', text: 'To zawsze oznacza błąd w liczeniu' },
      { id: 'b', text: 'Tylko przy liczbach ujemnych' },
      { id: 'c', text: 'Bo ostatnie przeniesienie tworzy zupełnie nową kolumnę' },
      { id: 'd', text: 'Bo zawsze dopisujemy zero z lewej strony' },
    ],
    correctId: 'c',
    explanation: 'Gdy przeniesienie z ostatniej kolumny nie ma już gdzie wrócić, tworzy swoją własną, nową kolumnę wyniku.',
  },
  {
    id: '999-plus-1',
    question: '999 + 1 = ?',
    options: [
      { id: 'a', text: '1000' },
      { id: 'b', text: '9991' },
      { id: 'c', text: '910' },
      { id: 'd', text: '99910' },
    ],
    correctId: 'a',
    explanation: 'Przeniesienie kaskadowo przechodzi przez wszystkie trzy dziewiątki i tworzy nową kolumnę tysięcy: 1000.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/dodawanie-pisemne/otwarty-zeszyt-w-kratke-i-olowek.jpg',
  rozgrzewka: '/images/matematyka/lekcje/dodawanie-pisemne/chlopiec-z-kedzierzawymi-wlosami-mysli-nad-zeszytem.jpg',
  nowePojecie: '/images/matematyka/lekcje/dodawanie-pisemne/kolorowe-drewniane-klocki-ulozone-w-kolumnach.jpg',
  przyklady: '/images/matematyka/lekcje/dodawanie-pisemne/dziewczynka-z-rudymi-wlosami-pisze-w-zeszycie.jpg',
  paragon: '/images/matematyka/lekcje/dodawanie-pisemne/zwiniety-paragon-i-drobne-monety-na-blacie.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function DodawaniePisemneLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('paragon');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Znasz już zasady zapisu z przewodnika — ustawianie liczb i przenoszenie. Teraz w
            końcu policzysz nimi naprawdę: <strong>dodawanie pisemne liczb wielocyfrowych</strong>,
            kolumna po kolumnie, aż po liczby czterocyfrowe.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Layers, text: 'Liczby ustawione kolumna pod kolumną — jedności pod jednościami' },
              { icon: CornerLeftUp, text: 'Przenoszenie: gdy suma w kolumnie sięga 10, mała „1” idzie dalej' },
              { icon: Sigma, text: 'Ta sama metoda działa dla liczb dwu-, trzy- i czterocyfrowych' },
              { icon: Receipt, text: 'Prawdziwe zastosowania: paragon, wydatki, sprawdzian z matematyki' },
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
            alt="Otwarty zeszyt w kratkę leżący na drewnianym biurku obok drewnianego ołówka"
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
          alt="Chłopiec z kędzierzawymi włosami siedzi przy biurku, zamyślony patrzy na otwarty zeszyt"
        >
          <p>Zanim zaczniesz liczyć, przypomnij sobie zasadę ustawiania liczb z przewodnika.</p>
        </LessonImageCard>
        <UstawianieWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Kilka stosów kolorowych drewnianych klocków ustawionych w rządkach jak kolumny liczbowe"
          lead="Każda kolumna to osobne, małe dodawanie — trzeba tylko wiedzieć, co zrobić, gdy wynik przekroczy 9."
        >
          Obejrzyj, jak dodawanie pisemne liczy się kolumna po kolumnie z przenoszeniem, a potem
          sam/a wybierz poprawną cyfrę wyniku w dwóch samodzielnych rundach.
        </LessonImageCard>
        <ColumnAdditionLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 przykłady: od zera do czterech cyfr"
          alt="Dziewczynka z rudymi włosami skupiona pisze ołówkiem w otwartym zeszycie w kratkę"
        >
          Od dodawania bez żadnego przeniesienia, przez pojedynczą i potrójną kaskadę, po liczby
          czterocyfrowe — ta sama metoda działa za każdym razem.
        </LessonImageCard>
        <DodawaniePrzyklady color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <DodawanieDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="paragon">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.paragon}
          alt="Zwinięty papierowy paragon leżący obok kilku drobnych monet na drewnianym blacie"
          reverse
          lead="Kasa czasem się myli — teraz Ty jesteś tym, kto to sprawdza."
        >
          Policz prawdziwą sumę dwóch zakupów pisemnie i porównaj ją z sumą wydrukowaną na paragonie.
        </LessonImageCard>
        <ParagonChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: dodawanie pisemne w pięciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Te same zasady zapisu — z przewodnika — działają w każdym dodawaniu pisemnym, jakie
          policzysz.
        </p>
        <ol className="divide-y border">
          {COLUMN_ALGORITHM_RULES.map((rule, index) => (
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

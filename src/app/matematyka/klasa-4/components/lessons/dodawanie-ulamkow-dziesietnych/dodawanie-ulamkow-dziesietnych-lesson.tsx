'use client';

import Image from 'next/image';
import { Brain, Layers, MoveUp, Plus } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { TenthsRollover } from './tenths-rollover';
import { ColumnAddBuild } from './column-add-build';
import { DecimalAddSteps } from './decimal-add-steps';
import { buildDecimalAddDrill } from './decimal-add-drill';
import { ShopTotalTask } from './shop-total-task';
import { DECIMAL_ADDITION_RULES } from '../../../lib/decimal-addition';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Jak zwija się dziesiątka',
    time: '6 min',
    icon: 'Sparkles',
  },
  {
    id: 'pisemne',
    kind: 'Nowe pojęcie',
    title: 'Dodawanie w słupku, przecinek pod przecinkiem',
    time: '12 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy rozpisane dodawania',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Dodaj samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'zadanie',
    kind: 'Zadanie problemowe',
    title: 'Rachunek ze sklepiku',
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
    id: 'proste-06',
    question: 'Ile to 0,3 + 0,6?',
    options: [
      { id: 'a', text: '0,9' },
      { id: 'b', text: '0,09' },
      { id: 'c', text: '0,63' },
      { id: 'd', text: '0,36' },
    ],
    correctId: 'a',
    explanation: '3 dziesiąte + 6 dziesiątych = 9 dziesiątych, czyli 0,9. Część całkowita zostaje 0.',
  },
  {
    id: 'przez-przecinek-0805',
    question: 'Ile to 0,8 + 0,5?',
    options: [
      { id: 'a', text: '0,13' },
      { id: 'b', text: '1,3' },
      { id: 'c', text: '0,85' },
      { id: 'd', text: '1,03' },
    ],
    correctId: 'b',
    explanation:
      '8 dziesiątych + 5 dziesiątych = 13 dziesiątych. Zapisujemy 3, a 1 całą przenosimy przez przecinek: 1,3.',
  },
  {
    id: 'jak-ustawic',
    question: 'Jak ustawić 4,2 + 3,15 do dodawania w słupku?',
    options: [
      { id: 'a', text: 'Wyrównać ostatnie cyfry do prawej strony' },
      { id: 'b', text: 'Nie da się — liczby mają różną długość' },
      { id: 'c', text: 'Przecinek pod przecinkiem, a 4,2 zapisać jako 4,20' },
      { id: 'd', text: 'Napisać 42 + 315, a przecinek dopisać na końcu' },
    ],
    correctId: 'c',
    explanation:
      'Zawsze przecinek pod przecinkiem. Krótszą liczbę wyrównujemy zerem na końcu: 4,2 to 4,20. Wtedy dodajemy rząd do rzędu.',
  },
  {
    id: 'podwojne-07',
    question: 'Ile to 0,7 + 0,7?',
    options: [
      { id: 'a', text: '0,14' },
      { id: 'b', text: '1,14' },
      { id: 'c', text: '0,49' },
      { id: 'd', text: '1,4' },
    ],
    correctId: 'd',
    explanation: '7 dziesiątych + 7 dziesiątych = 14 dziesiątych → 4, przenosimy 1 całą: 1,4.',
  },
  {
    id: 'po-co-zero',
    question: 'Po co przy dodawaniu 2,4 + 1,35 dopisujemy zero do 2,4?',
    options: [
      { id: 'a', text: 'Żeby obie liczby miały tyle samo miejsc po przecinku i można było dodawać rząd do rzędu' },
      { id: 'b', text: 'Żeby liczba 2,4 stała się większa' },
      { id: 'c', text: 'Bo bez zera nie wolno postawić przecinka' },
      { id: 'd', text: 'To pomyłka — nic nie dopisujemy' },
    ],
    correctId: 'a',
    explanation:
      '2,4 zapisujemy jako 2,40. Dopisane zero na końcu nie zmienia wartości, a wyrównuje liczbę miejsc po przecinku.',
  },
  {
    id: 'rachunek',
    question: 'Ile to razem: 3,50 zł + 2,80 zł?',
    options: [
      { id: 'a', text: '5,30 zł' },
      { id: 'b', text: '6,30 zł' },
      { id: 'c', text: '6,03 zł' },
      { id: 'd', text: '6,33 zł' },
    ],
    correctId: 'b',
    explanation:
      'Grosze: 0 + 0 = 0. Dziesiąte: 5 + 8 = 13 → 3, przenosimy 1 zł. Złote: 3 + 2 + 1 = 6. Razem 6,30 zł.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/dodawanie-ulamkow-dziesietnych/dwa-dzbanki-i-jeden-duzy.jpg',
  rozgrzewka: '/images/matematyka/lekcje/dodawanie-ulamkow-dziesietnych/rzad-kamykow-i-jeden-wiekszy.jpg',
  pisemne: '/images/matematyka/lekcje/dodawanie-ulamkow-dziesietnych/dziewczynka-nad-pustym-zeszytem.jpg',
  przyklady: '/images/matematyka/lekcje/dodawanie-ulamkow-dziesietnych/dwa-kosze-jablek-laczone-w-jeden.jpg',
  cwiczenia: '/images/matematyka/lekcje/dodawanie-ulamkow-dziesietnych/chlopiec-mysli-przy-biurku.jpg',
  zadanie: '/images/matematyka/lekcje/dodawanie-ulamkow-dziesietnych/lada-sklepiku-z-produktami.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function DodawanieUlamkowDziesietnychLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozgrzewka = useStepDone('rozgrzewka');
  const pisemne = useStepDone('pisemne');
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
            Ile to <strong>0,8 + 0,7</strong>? Kusi, żeby powiedzieć „0,15” — ale to pułapka. Dziś
            nauczysz się dodawać liczby z przecinkiem <strong>w pamięci</strong> i{' '}
            <strong>w słupku</strong>: przecinek pod przecinkiem, zera wyrównujące liczbę miejsc, a
            przeniesienie „1” — które czasem musi przeskoczyć przez przecinek.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Layers, text: 'Przecinek pod przecinkiem — nie do prawej' },
              { icon: Plus, text: 'Dopisz zera do równej liczby miejsc' },
              { icon: MoveUp, text: 'Przeniesienie potrafi przeskoczyć przez przecinek' },
              { icon: Brain, text: 'W pamięci: osobno całości, osobno części' },
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
            alt="Dwa małe szklane dzbanki z wodą stojące obok jednego dużego szklanego dzbanka na drewnianym blacie"
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
          numeral="10"
          kicker="Zbierz 10, dostaniesz 1"
          image={IMAGES.rozgrzewka}
          alt="Rząd małych, jednakowych kamyków na drewnianym stole, a obok nich jeden wyraźnie większy kamień"
        >
          Tak jak dziesięć małych kamyków można wymienić na jeden większy, na tablicy pozycyjnej
          dziesięć koralików w jednym rzędzie zwija się w jeden koralik rzędu po lewej. Dokładaj
          części do jednego rzędu i rób tę wymianę — czasem przeskok przejdzie przez przecinek,
          czasem nie.
        </LessonImageCard>
        <TenthsRollover color={color} onComplete={rozgrzewka.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="pisemne">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.pisemne}
          alt="Dziewczynka w czerwonym swetrze, z krótkimi ciemnymi włosami, pochyla się nad otwartym zeszytem w kratkę z ołówkiem uniesionym nad pustą stroną"
        >
          <p>
            W słupku ułamki dziesiętne dodajesz w trzech ruchach: ustaw liczby przecinek pod
            przecinkiem, dopisz brakujące zera, a potem dodawaj kolumnami od prawej. Zrób te trzy
            ruchy samodzielnie dla trzech par liczb.
          </p>
        </LessonImageCard>
        <ColumnAddBuild color={color} onComplete={pisemne.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Przewrócony wiklinowy koszyk z wysypującymi się jabłkami obok drugiego, większego kosza pełnego jabłek na drewnianym stole"
          lead="Trzy gotowe dodawania w słupku — po jednym na każdy typowy przypadek."
          reverse
        >
          Raz trzeba dopisać zero, raz przeniesienie przeskakuje przez przecinek, a raz „1” wędruje
          w środku części po przecinku. Zwróć uwagę, gdzie za każdym razem pojawia się mała jedynka.
        </LessonImageCard>
        <DecimalAddSteps color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Chłopiec z jasnymi włosami w zielonej koszulce siedzi przy biurku, podpiera brodę dłonią i zamyślony trzyma ołówek nad pustą kartką"
          reverse
        >
          <p>
            Siedem zadań o rosnącej trudności — dodawanie w pamięci, słupek z przeniesieniem przez
            przecinek, pułapka „wyrównaj do prawej” i rachunek ze sklepiku.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildDecimalAddDrill(color)}
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
          alt="Lada sklepiku: butelka soku, bułka i jabłko, obok słupek monet i pusty papierowy paragon"
          lead="Kupujesz trzy rzeczy w szkolnym sklepiku."
        >
          Ceny w złotych to ułamki dziesiętne z dwoma miejscami po przecinku. Policz cały rachunek,
          potem dołóż jeszcze jeden produkt i sprawdź, czy wystarczy 10 zł.
        </LessonImageCard>
        <ShopTotalTask color={color} onComplete={zadanie.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: dodawanie ułamków dziesiętnych</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej w lekcji o odejmowaniu liczb z przecinkiem — reguły są prawie takie same.
        </p>
        <ol className="divide-y border">
          {DECIMAL_ADDITION_RULES.map((rule, index) => (
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

'use client';

import Image from 'next/image';
import { ArrowRightLeft, MapPin, Ruler, Target } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { DlugoscWarmup } from './dlugosc-warmup';
import { UnitSorterLab } from './unit-sorter-lab';
import { RulerMeasureLab } from './ruler-measure-lab';
import { UnitLadderExamples } from './unit-ladder-examples';
import { DlugoscDrill } from './dlugosc-drill';
import { RouteChallenge } from './route-challenge';
import { LENGTH_RULES } from '../../../lib/length';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Co jest dłuższe?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Rozłóż przedmioty na drabince jednostek',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'pomiar',
    kind: 'Pomiar',
    title: 'Zmierz suwmiarką prawdziwe przedmioty',
    time: '6 min',
    icon: 'Ruler',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Wejdź po drabince jednostek',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz zamianę i porównywanie',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'wycieczka',
    kind: 'Zadanie problemowe',
    title: 'Policz trasę wycieczki',
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
    id: 'm-na-cm',
    question: 'Ile centymetrów ma 1 metr?',
    options: [
      { id: 'a', text: '10' },
      { id: 'b', text: '1000' },
      { id: 'c', text: '100' },
      { id: 'd', text: '10 000' },
    ],
    correctId: 'c',
    explanation: '1 m to zawsze 100 cm — tyle samo, co sto centymetrowych kresek na taśmie.',
  },
  {
    id: 'kolejnosc-jednostek',
    question: 'Które jednostki są ułożone od najmniejszej do największej?',
    options: [
      { id: 'a', text: 'km, m, dm, cm, mm' },
      { id: 'b', text: 'mm, cm, dm, m, km' },
      { id: 'c', text: 'cm, mm, dm, m, km' },
      { id: 'd', text: 'm, dm, cm, mm, km' },
    ],
    correctId: 'b',
    explanation: 'Drabinka jednostek długości zawsze rośnie w tej kolejności: mm, cm, dm, m, km.',
  },
  {
    id: 'km-na-m',
    question: '1 km to ile metrów?',
    options: [
      { id: 'a', text: '1000' },
      { id: 'b', text: '100' },
      { id: 'c', text: '10' },
      { id: 'd', text: '10 000' },
    ],
    correctId: 'a',
    explanation:
      '1 km to od razu 1000 m — to jedyne miejsce na drabince, gdzie skok jest ×1000, a nie ×10.',
  },
  {
    id: 'kierunek-zamiany',
    question: 'Zamieniając większą jednostkę na mniejszą (np. metry na centymetry), musisz:',
    options: [
      { id: 'a', text: 'dzielić' },
      { id: 'b', text: 'dodawać' },
      { id: 'c', text: 'odejmować' },
      { id: 'd', text: 'mnożyć' },
    ],
    correctId: 'd',
    explanation:
      'Mniejsza jednostka oznacza więcej takich samych kawałków, więc liczba rośnie — mnożysz.',
  },
  {
    id: 'prawda-czy-falsz',
    question: 'Które zdanie jest prawdziwe?',
    options: [
      { id: 'a', text: '90 cm to więcej niż 1 m' },
      { id: 'b', text: '5 dm to mniej niż 40 cm' },
      { id: 'c', text: '1200 m to mniej niż 1 km' },
      { id: 'd', text: '1200 m to więcej niż 1 km' },
    ],
    correctId: 'd',
    explanation:
      '1200 m to więcej niż 1000 m, czyli więcej niż 1 km. 90 cm to mniej niż 1 m (100 cm), a 5 dm to aż 50 cm — więcej niż 40 cm.',
  },
  {
    id: 'wyjatek-km',
    question: 'Dlaczego zamiana metrów na kilometry to wyjątek na drabince jednostek?',
    options: [
      { id: 'a', text: 'Bo kilometr jest mniejszy niż metr' },
      { id: 'b', text: 'Bo między m i km jest ×1000, a nie ×10 jak gdzie indziej' },
      { id: 'c', text: 'Bo kilometrów się nie używa w Polsce' },
      { id: 'd', text: 'Bo to nie jest prawdziwa jednostka długości' },
    ],
    correctId: 'b',
    explanation:
      'Wszędzie indziej na drabince sąsiednie jednostki różnią się ×10. Między m a km jest aż ×1000 — trzy ukryte kroki naraz.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/jednostki-dlugosci/przybory-do-mierzenia.jpg',
  rozgrzewka: '/images/matematyka/lekcje/jednostki-dlugosci/porownywanie-na-oko.jpg',
  nowePojecie: '/images/matematyka/lekcje/jednostki-dlugosci/sortowanie-przedmiotow.jpg',
  pomiar: '/images/matematyka/lekcje/jednostki-dlugosci/dlon-z-linijka.jpg',
  przyklady: '/images/matematyka/lekcje/jednostki-dlugosci/drabinka-schodkowa.jpg',
  wycieczka: '/images/matematyka/lekcje/jednostki-dlugosci/wycieczka-lesna-sciezka.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function JednostkiDlugosciLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const measuring = useStepDone('pomiar');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('trening');
  const problem = useStepDone('wycieczka');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Mrówkę mierzysz w milimetrach, a trasę do babci w kilometrach — to ten sam pomysł:
            <strong> dobrać jednostkę do skali</strong> i sprawnie zamieniać jedną na drugą.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Ruler, text: 'Jeden system, pięć jednostek: mm, cm, dm, m, km' },
              {
                icon: ArrowRightLeft,
                text: 'Zamiana w obie strony — najczęściej przez ×10, raz przez ×1000',
              },
              {
                icon: MapPin,
                text: 'Dobierz jednostkę do tego, co mierzysz — mrówka to nie autostrada',
              },
              { icon: Target, text: 'Dodawanie i porównywanie długości w różnych jednostkach' },
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
            alt="Linijka, taśma miernicza i miarka składana ułożone na drewnianym stole"
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
          alt="Dziewczynka porównująca wzrokiem długości dwóch przedmiotów na stole"
        >
          <p>
            Zanim poznasz dokładną metodę, sprawdź wyczucie — co jest dłuższe, patrząc bez
            linijki?
          </p>
        </LessonImageCard>
        <DlugoscWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Chłopiec układający małe przedmioty według rozmiaru na drewnianej półce"
          lead="Każda jednostka to inna skala — od grubości monety po trasę między miastami."
        >
          Przeciągnij każdy przedmiot na słupek jednostki, która najlepiej pasuje do jego
          rozmiaru — albo kliknij przedmiot, a potem słupek.
        </LessonImageCard>
        <UnitSorterLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Pomiar */}
      <LessonSection id="pomiar">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.pomiar}
          alt="Dłoń przykładająca drewnianą linijkę do ołówka leżącego na stole"
          reverse
        >
          <p>
            Drabinka jest po to, żeby zamieniać liczby — ale skąd bierze się ta pierwsza liczba?
            Zmierz ją sam/a suwmiarką.
          </p>
        </LessonImageCard>
        <RulerMeasureLab color={color} onComplete={measuring.markStepDone} />
      </LessonSection>

      {/* 4. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 przykłady: krok po kroku po drabince"
          alt="Drewniany schodkowy stopień o dwóch szczeblach, jak drabinka jednostek"
        >
          Każda zamiana to po prostu wejście albo zejście po drabince jednostek — klikaj strzałkę
          prowadzącą do celu.
        </LessonImageCard>
        <UnitLadderExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 5. Ćwiczenia */}
      <LessonSection id="trening">
        <DlugoscDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 6. Zadanie problemowe */}
      <LessonSection id="wycieczka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wycieczka}
          alt="Grupa dzieci z plecakami idąca leśną ścieżką w stronę autobusu"
          reverse
          lead="Część trasy jest w metrach, część w kilometrach z metrami naraz — zanim zsumujesz, sprowadź je do jednej jednostki."
        >
          Policz, ile kilometrów ma cała trasa wycieczki klasy 4a.
        </LessonImageCard>
        <RouteChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 7. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: jednostki długości w pięciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama drabinka działa dla każdej długości — od mrówki po trasę między miastami.
        </p>
        <ol className="divide-y border">
          {LENGTH_RULES.map((rule, index) => (
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

'use client';

import Image from 'next/image';
import { AlertTriangle, Combine, MoveLeft, Search } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { GroupStackerWarmup } from './group-stacker-warmup';
import { DivisionLab } from './division-lab';
import { DzielenniePrzyklady } from './dzielenie-przyklady';
import { DzielenieDrill } from './dzielenie-drill';
import { ZeroDigitHunt } from './zero-digit-hunt';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ile pełnych grup, ile zostaje?',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Dzielenie pod kreską, krok po kroku',
    time: '12 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: '4 przykłady: od prostego dzielenia po zero w środku ilorazu',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz dzielenie pisemne',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'audyt-zera',
    kind: 'Zadanie problemowe',
    title: 'Znajdź krok, w którym zgubiło się zero',
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
    id: 'od-ktorej-cyfry',
    question: 'Od której cyfry dzielnej zaczynamy dzielenie pisemne?',
    options: [
      { id: 'a', text: 'Od jedności, czyli prawej' },
      { id: 'b', text: 'Od środka liczby' },
      { id: 'c', text: 'Od najstarszej, czyli lewej' },
      { id: 'd', text: 'Kolejność nie ma znaczenia' },
    ],
    correctId: 'c',
    explanation:
      'Inaczej niż w dodawaniu, odejmowaniu i mnożeniu pisemnym — dzielenie liczymy od najstarszej (lewej) cyfry dzielnej.',
  },
  {
    id: 'pierwsza-cyfra-za-mala',
    question: 'Pierwsza cyfra dzielnej jest mniejsza od dzielnika. Co robimy?',
    options: [
      { id: 'a', text: 'Zapisujemy w ilorazie 0 i kończymy dzielenie' },
      { id: 'b', text: 'Łączymy ją z kolejną cyfrą dzielnej i liczymy razem' },
      { id: 'c', text: 'Zamieniamy dzielną z dzielnikiem miejscami' },
      { id: 'd', text: 'Takiego dzielenia nie da się policzyć' },
    ],
    correctId: 'b',
    explanation:
      'Gdy sama pierwsza cyfra nie wystarcza, dokładamy do niej kolejną cyfrę dzielnej — dopiero ta dwucyfrowa grupa staje się pierwszą dzieloną wartością.',
  },
  {
    id: 'zniesiona-za-mala',
    question: 'Zniesiona cyfra jest mniejsza od dzielnika. Co zapisujemy w tym kroku w ilorazie?',
    options: [
      { id: 'a', text: 'Nic — ten krok po prostu pomijamy' },
      { id: 'b', text: 'Zawsze 1' },
      { id: 'c', text: 'Największą możliwą cyfrę, czyli 9' },
      { id: 'd', text: '0, a kolejną cyfrę znosimy od razu do niego' },
    ],
    correctId: 'd',
    explanation: 'To najczęstsza pułapka tego algorytmu: pominięcie zera w ilorazie daje wynik z za małą liczbą cyfr.',
  },
  {
    id: '153-3',
    question: '153 : 3 = ?',
    options: [
      { id: 'a', text: '51' },
      { id: 'b', text: '510' },
      { id: 'c', text: '15' },
      { id: 'd', text: '501' },
    ],
    correctId: 'a',
    explanation: 'Pierwsza cyfra (1) jest za mała, więc start to 15 : 3 = 5. Potem 3 : 3 = 1. Wynik: 51.',
  },
  {
    id: 'iloraz-618-6',
    question: '618 : 6 ma w środku ilorazu cyfrę 0. Ile wynosi cały iloraz?',
    options: [
      { id: 'a', text: '18' },
      { id: 'b', text: '63' },
      { id: 'c', text: '103' },
      { id: 'd', text: '1003' },
    ],
    correctId: 'c',
    explanation: '6 : 6 = 1. Zniesiona cyfra 1 jest mniejsza od 6, więc w środku zapisujemy 0. Na końcu 18 : 6 = 3. Razem: 103.',
  },
  {
    id: 'reszta-743-6',
    question: 'Dzielenie 743 : 6 kończy się resztą 5. Co to dokładnie oznacza?',
    options: [
      { id: 'a', text: '743 wcale nie dzieli się przez 6' },
      { id: 'b', text: '5 to część, która nie zmieściła się w żadnej pełnej grupie po 6' },
      { id: 'c', text: '5 oznacza błąd w obliczeniach' },
      { id: 'd', text: 'Trzeba dodać 5 do dzielnej i policzyć jeszcze raz' },
    ],
    correctId: 'b',
    explanation: 'Reszta to dokładnie to samo, czego nauczyłeś/aś się w dzieleniu z resztą — to, co zostaje niepodzielone.',
  },
];

const DIVISION_RULES: string[] = [
  'Liczymy zawsze od najstarszej (lewej) cyfry dzielnej — to jedyny algorytm pisemny w tym module, który NIE zaczyna się od jedności.',
  'Jeśli pojedyncza cyfra jest mniejsza od dzielnika, łączymy ją z kolejną cyfrą dzielnej, aż grupa będzie wystarczająco duża.',
  'W każdym kroku szukamy największej cyfry ilorazu, dla której (cyfra × dzielnik) nie przekracza aktualnie dzielonej liczby.',
  'Od aktualnie dzielonej liczby odejmujemy ten iloczyn, a do otrzymanej reszty znosimy kolejną cyfrę dzielnej.',
  'Gdy zniesiona cyfra sama jest mniejsza od dzielnika, w ilorazie MUSI pojawić się 0 — pominięcie go to najczęstszy błąd tego algorytmu.',
  'Ostatnia, nieznoszona już dalej reszta to dokładnie to samo „r X", którego nauczyłeś/aś się przy dzieleniu z resztą.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/dzielenie-pisemne/otwarty-zeszyt-obok-cukierkow-podzielonych-na-grupy.jpg',
  rozgrzewka: '/images/matematyka/lekcje/dzielenie-pisemne/dziewczynka-ukladajaca-kasztany-w-rowne-grupy-na-dywanie.jpg',
  nowePojecie: '/images/matematyka/lekcje/dzielenie-pisemne/reka-piszaca-w-zeszycie-w-kratke-przy-oknie.jpg',
  przyklady: '/images/matematyka/lekcje/dzielenie-pisemne/chlopiec-z-ciemnymi-wlosami-piszacy-przy-biurku.jpg',
  audytZera: '/images/matematyka/lekcje/dzielenie-pisemne/lupa-nad-zeszytem-obok-czerwonej-kredki.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function DzielenniePisemneLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('audyt-zera');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Dodawanie, odejmowanie i mnożenie pisemne masz już opanowane — teraz czas na{' '}
            <strong>dzielenie pisemne przez liczbę jednocyfrową</strong>. To pierwsze wprowadzenie
            do algorytmu, którego pełne opanowanie przyjdzie dopiero w kolejnych latach — dziś
            poznasz jego podstawowy mechanizm.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: MoveLeft, text: 'Jedyny algorytm pisemny, który liczymy od LEWEJ, nie od jedności' },
              { icon: Combine, text: 'Gdy jedna cyfra nie wystarcza, łączymy ją z kolejną' },
              { icon: AlertTriangle, text: 'Zniesiona za mała cyfra to zero w ilorazie — nie pominięty krok' },
              { icon: Search, text: 'Na koniec: znajdziesz krok, w którym ktoś zgubił to zero' },
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
            alt="Otwarty zeszyt w kratkę leżący na drewnianym biurku obok cukierków podzielonych na równe grupy"
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
          alt="Dziewczynka siedząca na dywanie i układająca kasztany w równe grupy"
        >
          <p>
            Zanim zobaczysz algorytm, sprawdź to samo pytanie na kropkach: ile pełnych grup się
            zmieści, i co zostanie luzem, gdy zabraknie na kolejną?
          </p>
        </LessonImageCard>
        <GroupStackerWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Zbliżenie na dłoń piszącą coś w otwartym zeszycie w kratkę, przy oknie"
          lead="Dzielenie pisemne liczy się od lewej — inaczej niż wszystko, czego uczyłeś/aś się w tym module do tej pory."
        >
          Obejrzyj, jak dzielenie pisemne rozpisuje się krok po kroku pod kreską, a potem sam/a
          wybierz kolejne cyfry ilorazu w dwóch samodzielnych rundach.
        </LessonImageCard>
        <DivisionLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 przykłady: od prostego dzielenia po zero w środku ilorazu"
          alt="Chłopiec o ciemnych włosach siedzący przy biurku i piszący skupiony w otwartym zeszycie"
        >
          Od dzielenia bez żadnego łączenia cyfr, przez złączenie dwóch cyfr na start i realną
          resztę na końcu, po pułapkę zera w środku ilorazu.
        </LessonImageCard>
        <DzielenniePrzyklady color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <DzielenieDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="audyt-zera">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.audytZera}
          alt="Lupa leżąca nad otwartym zeszytem w kratkę, obok czerwonej kredki"
          reverse
          lead="Zero w ilorazie łatwo pominąć, gdy się spieszysz — a jego brak zmienia cały wynik."
        >
          Kuba policzył dzielenie pisemne, ale w jednym kroku zgubił zero. Znajdź ten krok i podaj
          poprawny wynik całego dzielenia.
        </LessonImageCard>
        <ZeroDigitHunt color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: dzielenie pisemne w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          To jedyny algorytm pisemny w tym module, który liczymy od lewej — reszta zasad zapisu z
          przewodnika działa tak samo, jak wcześniej.
        </p>
        <ol className="divide-y border">
          {DIVISION_RULES.map((rule, index) => (
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

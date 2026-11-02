'use client';

import Image from 'next/image';
import { Frame, Move, Scissors, Sigma } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { CutSlideBoard } from './cut-slide-board';
import { SplitFillBoard, type SplitRound } from './split-fill-board';
import { DecompositionSteps } from './decomposition-steps';
import { buildDecompositionDrill } from './decomposition-drill';
import type { GridCell } from '../../../lib/area';
import { mergeCells, partCells, SPLIT_RULES } from '../../../lib/area-split';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const rect = (x: number, y: number, width: number, height: number): GridCell[] =>
  partCells({ x, y, width, height });

const without = (cells: GridCell[], hole: GridCell[]): GridCell[] => {
  const holes = new Set(hole.map((cell) => `${cell.x},${cell.y}`));
  return cells.filter((cell) => !holes.has(`${cell.x},${cell.y}`));
};

const STEPS: LessonStepMeta[] = [
  {
    id: 'przesuwanie',
    kind: 'Rozgrzewka',
    title: 'Przesuń kawałek, pole zostaje',
    time: '6 min',
    icon: 'Sparkles',
  },
  {
    id: 'podzial',
    kind: 'Nowe pojęcie',
    title: 'Potnij figurę na prostokąty',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Dwie metody, ten sam wynik',
    time: '7 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Policz samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'zadanie',
    kind: 'Zadanie problemowe',
    title: 'Domknij do prostokąta i odejmij',
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

const SPLIT_ROUNDS: SplitRound[] = [
  {
    id: 'litera-l',
    board: { width: 5, height: 4 },
    cells: mergeCells(rect(0, 0, 2, 4), rect(2, 2, 3, 2)),
    story: 'Figura w kształcie litery L. Znajdź linię, która przetnie ją na dwa prostokąty.',
    moral:
      'Jedno cięcie wystarczyło, żeby zostały same prostokąty — a ich pola dają razem 14 kratek. Tę figurę da się przeciąć pionowo albo poziomo i wynik jest ten sam.',
  },
  {
    id: 'litera-t',
    board: { width: 5, height: 4 },
    cells: mergeCells(rect(0, 0, 5, 1), rect(2, 1, 1, 3)),
    story: 'Tym razem litera T. Zastanów się, w którą stronę musi iść cięcie.',
    moral:
      'Litera T rozpada się na poprzeczkę i nóżkę — razem 8 kratek. Najkrócej idzie tu jedno poziome cięcie pod poprzeczką; samo pionowe zostawiłoby poprzeczkę zrośniętą z nóżką.',
  },
  {
    id: 'krzyzyk',
    board: { width: 4, height: 4 },
    cells: mergeCells(rect(1, 0, 2, 4), rect(0, 1, 4, 2)),
    story:
      'Krzyżyk. Uwaga: jedno cięcie tu nie wystarczy — po pierwszym wciąż zostanie kawałek, który nie jest prostokątem.',
    moral:
      'Dopiero dwa cięcia zostawiły same prostokąty, a ich pola dają razem 12 kratek. Cięć wolno zrobić tyle, ile trzeba — nie ma nagrody za jedno.',
  },
];

const FILL_ROUNDS: SplitRound[] = [
  {
    id: 'pokoj-z-wneka',
    board: { width: 5, height: 4 },
    cells: without(rect(0, 0, 5, 4), rect(3, 0, 2, 2)),
    story:
      'Pokój ma wnękę w rogu — po prostu brakuje w nim kawałka prostokąta. Domknij go i odejmij ten brak.',
    moral:
      'Cała ramka to 5 · 4 = 20, a wnęka 2 · 2 = 4. Podłogi jest więc 20 − 4 = 16 kratek — jedno mnożenie i jedno odejmowanie.',
  },
  {
    id: 'trawnik-z-oczkiem',
    board: { width: 6, height: 4 },
    cells: without(rect(0, 0, 6, 4), rect(2, 1, 2, 2)),
    story:
      'Prostokątny trawnik z oczkiem wodnym pośrodku. Tu dziura jest w środku, więc podział byłby wyjątkowo żmudny.',
    moral:
      'Trawnik z oczkiem: 6 · 4 − 2 · 2 = 24 − 4 = 20 kratek trawy. Gdy brak jest w środku figury, uzupełnianie to jedyna szybka droga.',
  },
  {
    id: 'dzialka-z-rogami',
    board: { width: 6, height: 4 },
    cells: without(rect(0, 0, 6, 4), [...rect(0, 0, 2, 1), ...rect(4, 3, 2, 1)]),
    story:
      'Działka ze ściętymi dwoma rogami. Braków jest tym razem dwa — kliknij oba.',
    moral:
      'Odjąć trzeba oba braki: 6 · 4 − 2 · 1 − 2 · 1 = 24 − 2 − 2 = 20 kratek. Liczba braków niczego nie psuje, po prostu odejmujesz kolejno.',
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'na-czym-polega',
    question: 'Na czym polega metoda podziału przy liczeniu pola figury?',
    options: [
      { id: 'a', text: 'Dzielimy pole przez liczbę boków figury' },
      { id: 'b', text: 'Dzielimy figurę na trójkąty i mierzymy każdy linijką' },
      { id: 'c', text: 'Tniemy figurę wzdłuż linii na prostokąty, liczymy ich pola i dodajemy' },
      { id: 'd', text: 'Dzielimy figurę na połowę i mnożymy wynik przez dwa' },
    ],
    correctId: 'c',
    explanation:
      'Prostokąt umiemy policzyć wzorem, więc figurę rozkładamy na prostokąty. Pola kawałków dodajemy — razem dają pole całej figury.',
  },
  {
    id: 'oblicz-l',
    question: 'Figurę w kształcie litery L rozcięto na prostokąty 2 · 4 i 3 · 2. Jakie ma pole?',
    options: [
      { id: 'a', text: '14' },
      { id: 'b', text: '11' },
      { id: 'c', text: '48' },
      { id: 'd', text: '20' },
    ],
    correctId: 'a',
    explanation: '2 · 4 = 8 i 3 · 2 = 6, więc razem 8 + 6 = 14. Pola kawałków się dodaje, a nie mnoży.',
  },
  {
    id: 'z-wycietym',
    question: 'Prostokąt 7 m na 5 m ma wycięty kwadratowy otwór o boku 2 m. Jakie jest pole tej figury?',
    options: [
      { id: 'a', text: '35 m²' },
      { id: 'b', text: '33 m²' },
      { id: 'c', text: '39 m²' },
      { id: 'd', text: '31 m²' },
    ],
    correctId: 'd',
    explanation: 'Cały prostokąt: 7 · 5 = 35 m². Otwór: 2 · 2 = 4 m². Zostaje 35 − 4 = 31 m².',
  },
  {
    id: 'czy-rozne',
    question: 'Czy podział i uzupełnianie mogą dać dla tej samej figury różne wyniki?',
    options: [
      { id: 'a', text: 'Tak, uzupełnianie zawsze daje więcej' },
      { id: 'b', text: 'Nie — to ta sama figura, więc pole musi wyjść takie samo' },
      { id: 'c', text: 'Tak, jeśli figura ma dziurę w środku' },
      { id: 'd', text: 'Tak, zależnie od tego, ile cięć zrobisz' },
    ],
    correctId: 'b',
    explanation:
      'Metoda to tylko sposób liczenia, a nie zmiana figury. Różny wynik oznacza pomyłkę w rachunkach albo w odczytaniu boków.',
  },
  {
    id: 'kiedy-uzupelnianie',
    question: 'Kiedy wygodniej policzyć pole metodą uzupełniania niż podziału?',
    options: [
      { id: 'a', text: 'Zawsze — podział jest błędny' },
      { id: 'b', text: 'Gdy figura jest długa i ma wiele wypustek' },
      { id: 'c', text: 'Gdy figurze brakuje do prostokąta jednego lub dwóch kawałków' },
      { id: 'd', text: 'Gdy pole wychodzi liczbą parzystą' },
    ],
    correctId: 'c',
    explanation:
      'Uzupełnianie zamienia całą robotę w jedno mnożenie i jedno odejmowanie. Gdy braków byłoby dużo, szybszy bywa podział.',
  },
  {
    id: 'przesuniecie',
    question: 'Co dzieje się z polem figury, gdy przesuniesz jeden jej kawałek w inne miejsce?',
    options: [
      { id: 'a', text: 'Nic — pole zostaje takie samo, zmienia się tylko kształt' },
      { id: 'b', text: 'Pole rośnie, bo figura staje się szersza' },
      { id: 'c', text: 'Pole maleje, bo część kratek znika' },
      { id: 'd', text: 'Pole zmienia się tylko wtedy, gdy kawałek obrócisz' },
    ],
    correctId: 'a',
    explanation:
      'Kratek jest tyle samo, tylko leżą gdzie indziej. Dlatego wolno figurę w myślach rozcinać i przekładać, żeby wygodniej policzyć jej pole.',
  },
];

const IMAGES = imgMap({
  intro:
    '/images/matematyka/lekcje/podzial-i-uzupelnianie/wycieta-z-papieru-figura-w-ksztalcie-litery-l.jpg',
  przesuwanie:
    '/images/matematyka/lekcje/podzial-i-uzupelnianie/drewniane-prostokatne-klocki-ukladane-w-prostokat.jpg',
  podzial:
    '/images/matematyka/lekcje/podzial-i-uzupelnianie/dziewczynka-rozcina-nozyczkami-papierowa-figure.jpg',
  przyklady:
    '/images/matematyka/lekcje/podzial-i-uzupelnianie/dwa-papierowe-prostokaty-i-odciety-kawalek.jpg',
  cwiczenia:
    '/images/matematyka/lekcje/podzial-i-uzupelnianie/chlopiec-uklada-klocki-w-ksztalt-litery-l.jpg',
  zadanie:
    '/images/matematyka/lekcje/podzial-i-uzupelnianie/ogrod-z-trawnikiem-i-prostokatnym-oczkiem-wodnym.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function PodzialIUzupelnianieLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const przesuwanie = useStepDone('przesuwanie');
  const podzial = useStepDone('podzial');
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
            Wzór <strong>P = a · b</strong> działa tylko dla prostokąta. A pokój z wnęką, działka ze
            ściętym rogiem czy trawnik z oczkiem wodnym prostokątami nie są. Na szczęście nie trzeba
            dla nich żadnego nowego wzoru — wystarczy{' '}
            <strong>rozłożyć figurę na prostokąty i dodać</strong> albo{' '}
            <strong>domknąć ją do prostokąta i odjąć</strong>. W tej lekcji poznasz obie metody i
            zobaczysz, że zawsze dają ten sam wynik.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Move, text: 'Przesunięty kawałek nie zmienia pola' },
              { icon: Scissors, text: 'Podział: potnij na prostokąty i dodaj' },
              { icon: Frame, text: 'Uzupełnianie: domknij do prostokąta i odejmij' },
              { icon: Sigma, text: 'Obie drogi muszą dać ten sam wynik' },
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
            alt="Wycięta z grubego papieru figura w kształcie litery L, złożona z dwóch prostokątów, leżąca na arkuszu papieru obok nożyczek"
            width={240}
            height={180}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* 1. Rozgrzewka */}
      <LessonSection id="przesuwanie">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="="
          kicker="Inny kształt, to samo pole"
          image={IMAGES.przesuwanie}
          alt="Kilka prostokątnych drewnianych klocków ułożonych na jasnym blacie w obrys jednego dużego prostokąta, jeden klocek leży osobno z boku"
        >
          Każda z tych figur ma jeden luźny kawałek. Przeciągnij go tak, żeby z figury powstał zwykły
          prostokąt, i obserwuj licznik pola — ani razu się nie ruszy.
        </LessonImageCard>
        <CutSlideBoard color={color} onComplete={przesuwanie.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="podzial">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.podzial}
          alt="Dziewczynka około dziesięciu lat, jasna karnacja, krótkie ciemne włosy, granatowy sweter, przecina nożyczkami papierową figurę leżącą na stole"
        >
          <p>
            Skoro przekładanie kawałków niczego nie psuje, to figurę wolno po prostu{' '}
            <strong>pociąć na prostokąty</strong>. Kliknij przerywaną linię, wzdłuż której chcesz
            ciąć. Każdy kawałek dostanie własne działanie, a na końcu wystarczy je dodać. Ostatnia
            figura wymaga dwóch cięć — jedno nie wystarczy i to jest w porządku.
          </p>
        </LessonImageCard>
        <SplitFillBoard
          color={color}
          mode="split"
          rounds={SPLIT_ROUNDS}
          onComplete={podzial.markStepDone}
        />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Dwa prostokątne arkusze jasnego papieru leżące obok siebie na drewnianym stole, trzeci mniejszy odcięty kawałek leży nieco dalej"
          lead="Ta sama figura, dwie różne drogi — i ten sam wynik na końcu."
          reverse
        >
          Pierwszy przykład tnie literę L na dwa prostokąty. Drugi bierze tę samą literę L i liczy ją
          zupełnie inaczej: domyka do dużego prostokąta i odejmuje brak. Trzeci pokazuje, po czym
          poznać, która metoda będzie krótsza.
        </LessonImageCard>
        <DecompositionSteps color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Chłopiec około dziesięciu lat, jasna karnacja, jasne proste włosy, szara bluza, układa na stole drewniane klocki w kształt litery L"
          reverse
        >
          <p>
            Siedem zadań o rosnącej trudności: cztery figury na kratownicy, a potem już same wymiary
            w metrach — trawnik z basenem, brakujący bok litery L i ogród przecięty ścieżką.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildDecompositionDrill(color)}
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
          lead="Czasem szybciej policzyć całość i odjąć to, czego nie ma."
          alt="Widok z góry na przydomowy ogród: prostokątny trawnik, a w jego środku prostokątne oczko wodne obłożone kamieniami"
        >
          Trzy figury, w których czegoś brakuje: pokój z wnęką, trawnik z oczkiem wodnym i działka ze
          ściętymi rogami. Zamiast ciąć — domknij figurę do prostokąta i odejmij brakujące kawałki.
        </LessonImageCard>
        <SplitFillBoard
          color={color}
          mode="fill"
          rounds={FILL_ROUNDS}
          onComplete={zadanie.markStepDone}
        />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: podział i uzupełnianie</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Siedem zdań, które wystarczą na cały ten temat.
        </p>
        <ol className="divide-y border">
          {SPLIT_RULES.map((rule, index) => (
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

'use client';

import Image from 'next/image';
import { Scissors, SplitSquareVertical, Sparkles, Triangle } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { SymmetryCheck } from './symmetry-check';
import { KiteMirror } from './kite-mirror';
import { AxisCountShowcase } from './axis-count-showcase';
import { buildDrillTasks, buildProblemTasks } from './symetria-osiowa-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Które figury są symetryczne?',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'definicje',
    kind: 'Nowe pojęcie',
    title: 'Dokończ latawiec',
    time: '8 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Ile osi ma ta figura?',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Znajdź i policz osie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'wycinanka',
    kind: 'Zadanie problemowe',
    title: 'Papierowe wycinanki',
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
    id: 'definicja-osi',
    question: 'Co to jest oś symetrii figury?',
    options: [
      { id: 'a', text: 'Linia, która dzieli figurę na dwie lustrzane połówki' },
      { id: 'b', text: 'Dowolna linia przechodząca przez figurę' },
      { id: 'c', text: 'Najdłuższy bok figury' },
      { id: 'd', text: 'Punkt dokładnie w środku figury' },
    ],
    correctId: 'a',
    explanation: 'Oś symetrii to linia, po złożeniu wzdłuż której obie połówki figury dokładnie się pokrywają.',
  },
  {
    id: 'trojkat-rownoboczny-osie',
    question: 'Trójkąt równoboczny (wszystkie trzy boki równe) ma...',
    options: [
      { id: 'a', text: '1 oś symetrii' },
      { id: 'b', text: '3 osie symetrii' },
      { id: 'c', text: '2 osie symetrii' },
      { id: 'd', text: 'żadnej osi symetrii' },
    ],
    correctId: 'b',
    explanation: 'Każdy z trzech wierzchołków leży na własnej osi symetrii, przechodzącej przez środek przeciwległego boku — stąd aż 3 osie.',
  },
  {
    id: 'litera-t-l',
    question: 'Która litera ma oś symetrii?',
    options: [
      { id: 'a', text: 'L' },
      { id: 'b', text: 'T' },
      { id: 'c', text: 'Obie' },
      { id: 'd', text: 'Żadna' },
    ],
    correctId: 'b',
    explanation: 'Pionowa linia przez środek litery T daje dwie lustrzane połówki. L takiej linii nie ma.',
  },
  {
    id: 'odbicie-punktu-5cm',
    question: 'Punkt leży 5 cm od osi symetrii. W jakiej odległości od osi leży jego lustrzane odbicie?',
    options: [
      { id: 'a', text: '10 cm po drugiej stronie osi' },
      { id: 'b', text: '2,5 cm po drugiej stronie osi' },
      { id: 'c', text: 'dokładnie na osi' },
      { id: 'd', text: '5 cm po drugiej stronie osi' },
    ],
    correctId: 'd',
    explanation: 'Odbicie zawsze zachowuje tę samą odległość od osi — zmienia się tylko strona.',
  },
  {
    id: 'malowanie-wzoru',
    question: 'Tata maluje symetryczny wzór na ścianie. Ma już gotową lewą stronę i pionową oś. Co musi zrobić, żeby prawa strona była symetryczna?',
    options: [
      { id: 'a', text: 'Skopiować lewą stronę bez zmian, w tym samym miejscu' },
      { id: 'b', text: 'Narysować cokolwiek, byle ładnie wyglądało' },
      { id: 'c', text: 'Odbić każdy punkt lewej strony na tę samą odległość po drugiej stronie osi' },
      { id: 'd', text: 'Obrócić lewą stronę o 90°' },
    ],
    correctId: 'c',
    explanation: 'Symetria to odbicie, nie kopia w tym samym miejscu ani obrót — każdy punkt ląduje po drugiej stronie osi, w tej samej odległości.',
  },
  {
    id: 'prostokat-osie-quiz',
    question: 'Prostokąt, który nie jest kwadratem, ma dokładnie...',
    options: [
      { id: 'a', text: '0 osi symetrii' },
      { id: 'b', text: '1 oś symetrii' },
      { id: 'c', text: '4 osie symetrii' },
      { id: 'd', text: '2 osie symetrii' },
    ],
    correctId: 'd',
    explanation: 'Pozioma i pionowa oś przez środek — ale przekątne prostokąta (w odróżnieniu od kwadratu) osiami symetrii już nie są.',
  },
];

const CHEAT_SHEET = [
  'Oś symetrii dzieli figurę na dwie lustrzane połówki.',
  'Punkt i jego odbicie leżą w tej samej odległości od osi, po przeciwnych stronach.',
  'Niektóre figury mają wiele osi naraz (kwadrat — 4, koło — nieskończenie wiele), inne żadnej.',
  'Trójkąt równoramienny ma 1 oś, równoboczny — 3.',
  'Prostokąt (nie kwadrat) ma 2 osie — ale jego przekątne osiami symetrii nie są.',
  'Obrót to nie to samo co odbicie — figura obracalna nie musi mieć osi symetrii.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/symetria-osiowa/motyl-na-kwiatku.jpg',
  rozgrzewka: '/images/matematyka/lekcje/symetria-osiowa/przedmioty-symetryczne-i-nie-na-stole.jpg',
  definicje: '/images/matematyka/lekcje/symetria-osiowa/dziecko-puszczajace-lataca-latawiec.jpg',
  przyklady: '/images/matematyka/lekcje/symetria-osiowa/figury-wycinane-z-papieru.jpg',
  trening: '/images/matematyka/lekcje/symetria-osiowa/lusterko-na-biurku-z-rysunkiem.jpg',
  wycinanka: '/images/matematyka/lekcje/symetria-osiowa/dziecko-wycina-wzor-ze-zlozonej-kartki.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function SymetriaOsiowaLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const foldCase = useStepDone('wycinanka');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Złóż kartkę na pół — jeśli obie strony dokładnie się pokrywają, linia zgięcia jest{' '}
            <strong>osią symetrii</strong>. Dziś nauczysz się ją rozpoznawać, liczyć i budować drugą
            połowę figury, znając tylko pierwszą.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: SplitSquareVertical, text: 'Oś dzieli figurę na lustrzane połówki' },
              { icon: Triangle, text: 'Niektóre figury mają kilka osi, inne żadnej' },
              { icon: Sparkles, text: 'Punkt i jego odbicie: ta sama odległość od osi' },
              { icon: Scissors, text: 'Wycinanka ze złożonej kartki to gotowa symetria' },
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
            alt="Motyl o symetrycznych skrzydłach siedzący na kwiatku"
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
          alt="Przedmioty na stole — część symetryczna, część nie"
          lead="Zanim zbudujesz symetryczną figurę, naucz się ją rozpoznawać."
        >
          Niektóre kształty da się złożyć na pół tak, żeby obie strony się pokryły. Inne — nie, bez
          względu na to, gdzie poprowadzisz linię.
        </LessonImageCard>
        <SymmetryCheck color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="definicje">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.definicje}
          alt="Dziecko puszczające kolorowego latawca na łące"
        >
          <p>
            Latawiec to figura zbudowana z dwóch lustrzanych połówek. Znasz już lewą stronę —
            przeciągnij punkty prawej strony dokładnie tam, gdzie powinno wylądować ich odbicie.
          </p>
        </LessonImageCard>
        <KiteMirror color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="N×"
          kicker="Jedna figura, różna liczba osi"
          image={IMAGES.przyklady}
          alt="Geometryczne figury wycięte z kolorowego papieru rozłożone na stole"
        >
          Trójkąt, prostokąt i kwadrat — im więcej „porządku” w figurze, tym więcej ma osi symetrii.
        </LessonImageCard>
        <AxisCountShowcase color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Lusterko postawione na rysunku leżącym na biurku"
          reverse
        >
          <p>Czas samodzielnie znajdować i liczyć osie symetrii — od koła po sześciokąt.</p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="wycinanka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wycinanka}
          alt="Dziecko wycinające nożyczkami wzór ze złożonej na pół kartki papieru"
          reverse
          lead="Wycinanka ze złożonej kartki to symetria w praktyce."
        >
          Zanim rozetniesz papier, spróbuj przewidzieć, jak będzie wyglądał wzór po rozłożeniu.
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildProblemTasks(color)}
          color={color}
          onFinish={foldCase.markStepDone}
          resultCopy={{
            perfect: { title: 'Mistrzu wycinanek!', message: 'Bezbłędnie przewidziałeś/aś każdy wynik złożenia.' },
            good: { title: 'Prawie idealnie', message: 'Większość trafiona — sprawdź wyjaśnienia przy pomyłkach.' },
            poor: { title: 'Spróbuj jeszcze raz', message: 'Zgięcie kartki to zawsze oś symetrii — reszta wynika z odbicia.' },
          }}
        />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: symetria osiowa w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">Wracaj do niej, gdy w kolejnej lekcji spotkasz skalę.</p>
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

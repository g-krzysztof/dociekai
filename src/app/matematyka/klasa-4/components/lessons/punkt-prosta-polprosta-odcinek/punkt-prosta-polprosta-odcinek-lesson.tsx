'use client';

import Image from 'next/image';
import { ArrowLeftRight, Dot, Minus, MoveRight } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { RealWorldMatch } from './real-world-match';
import { GeoBuilder } from './geo-builder';
import { ConstructionBoard } from './construction-board';
import { ClassifyDrill } from './classify-drill';
import { SegmentCounter } from './segment-counter';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Cztery obiekty dookoła nas',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'definicje',
    kind: 'Nowe pojęcie',
    title: 'Te same dwa punkty, cztery różne obiekty',
    time: '8 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Nazywamy to, co widzimy',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Rozpoznaj i nazwij',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'lamiglowka',
    kind: 'Zadanie problemowe',
    title: 'Ile prostych i odcinków wyznaczają punkty?',
    time: '7 min',
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
    id: 'nieskonczonosc-obie-strony',
    question: 'Który z czterech obiektów biegnie w nieskończoność w OBIE strony?',
    options: [
      { id: 'a', text: 'Odcinek' },
      { id: 'b', text: 'Prosta' },
      { id: 'c', text: 'Półprosta' },
      { id: 'd', text: 'Punkt' },
    ],
    correctId: 'b',
    explanation: 'Tylko prosta nie ma ani początku, ani końca — biegnie bez granic w obu kierunkach.',
  },
  {
    id: 'konce-odcinka',
    question: 'Ile końców ma odcinek?',
    options: [
      { id: 'a', text: 'Żadnego' },
      { id: 'b', text: 'Jeden' },
      { id: 'c', text: 'Dwa' },
      { id: 'd', text: 'Nieskończenie wiele' },
    ],
    correctId: 'c',
    explanation: 'Odcinek ma dokładnie dwa końce — dzięki nim ma też skończoną, mierzalną długość.',
  },
  {
    id: 'poczatek-polprostej',
    question: 'Półprosta AB zaczyna się w punkcie…',
    options: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
      { id: 'c', text: 'gdzieś pomiędzy A i B' },
      { id: 'd', text: 'zależy, jak narysujesz' },
    ],
    correctId: 'a',
    explanation: 'Pierwsza litera w nazwie półprostej to zawsze jej początek — półprosta BA zaczynałaby się w B.',
  },
  {
    id: 'obiekt-bez-dlugosci',
    question: 'Który obiekt nie ma żadnej długości, bo jest tylko miejscem?',
    options: [
      { id: 'a', text: 'Odcinek' },
      { id: 'b', text: 'Półprosta' },
      { id: 'c', text: 'Prosta' },
      { id: 'd', text: 'Punkt' },
    ],
    correctId: 'd',
    explanation: 'Punkt oznacza dokładne miejsce — nie ma rozmiaru ani kierunku, więc nie ma sensu pytać o jego długość.',
  },
  {
    id: 'rownowaznosc-odcinka',
    question: 'Odcinek MN to dokładnie to samo, co…',
    options: [
      { id: 'a', text: 'odcinek NM' },
      { id: 'b', text: 'półprosta MN' },
      { id: 'c', text: 'półprosta NM' },
      { id: 'd', text: 'prosta MN' },
    ],
    correctId: 'a',
    explanation: 'Odcinek ma dwa równorzędne końce, więc kolejność liter nie ma znaczenia — MN i NM to ten sam odcinek.',
  },
  {
    id: 'dwa-punkty-prosta',
    question: 'Przez dwa różne punkty można poprowadzić…',
    options: [
      { id: 'a', text: 'nieskończenie wiele prostych' },
      { id: 'b', text: 'dokładnie jedną prostą' },
      { id: 'c', text: 'dokładnie dwie proste' },
      { id: 'd', text: 'żadnej prostej' },
    ],
    correctId: 'b',
    explanation:
      'Przez jeden punkt przechodzi nieskończenie wiele prostych, ale gdy dodasz drugi punkt, zostaje dokładnie jedna — to fundament całej geometrii.',
  },
];

const CHEAT_SHEET = [
  'Punkt oznacza dokładne miejsce — nie ma rozmiaru ani długości.',
  'Prosta biegnie w nieskończoność w obie strony — bez początku i bez końca.',
  'Półprosta ma jeden początek i biegnie w nieskończoność w jedną stronę — kolejność liter ma znaczenie (AB ≠ BA).',
  'Odcinek ma dwa równorzędne końce, więc jako jedyny ma skończoną, mierzalną długość (AB = BA).',
  'Im więcej ograniczeń (początek, koniec), tym krótszy obiekt — od nieskończonej prostej po zerowymiarowy punkt.',
  'Przez jeden punkt można poprowadzić nieskończenie wiele prostych, ale przez dwa różne punkty — zawsze dokładnie jedną.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/punkt-prosta-polprosta-odcinek/rysowanie-punktow.jpg',
  latarka: '/images/matematyka/lekcje/punkt-prosta-polprosta-odcinek/latarka.jpg',
  przyklady: '/images/matematyka/lekcje/punkt-prosta-polprosta-odcinek/laczenie-punktow.jpg',
  lupa: '/images/matematyka/lekcje/punkt-prosta-polprosta-odcinek/lupa-rysunek.jpg',
  pinezki: '/images/matematyka/lekcje/punkt-prosta-polprosta-odcinek/pinezki-nitki.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function PunktProstaPolprostaOdcinekLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const definitions = useStepDone('definicje');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('trening');
  const puzzle = useStepDone('lamiglowka');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            W przewodniku poznałeś/aś już, jak <strong>nazywać</strong> punkty, proste i odcinki
            literami. Teraz czas na to, co te nazwy właściwie opisują — <strong>cztery
            najprostsze obiekty geometrii</strong>, z których zbudowana jest każda figura, jaką
            narysujesz w tym module.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Dot, text: 'Punkt — dokładne miejsce, bez rozmiaru' },
              { icon: ArrowLeftRight, text: 'Prosta — nieskończona w obie strony' },
              { icon: MoveRight, text: 'Półprosta — początek i jeden kierunek' },
              { icon: Minus, text: 'Odcinek — dwa końce, mierzalna długość' },
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
            alt="Dziecko rysujące liniałem punkty i linie na kartce papieru przy biurku"
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
          image={IMAGES.latarka}
          alt="Snop światła latarki w ciemnym pokoju, wychodzący z jednego punktu"
          lead="Te cztery obiekty spotykasz na co dzień — tylko nikt ich tak nie nazywał."
        >
          Zanim poznasz definicje, dopasuj cztery codzienne sceny do właściwego obiektu
          geometrycznego. Twoja intuicja pewnie już wie więcej, niż myślisz.
        </LessonImageCard>
        <RealWorldMatch color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="definicje">
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Poniżej masz dwa punkty na płótnie. Przeciągnij je, gdzie chcesz, i przełączaj tryby —
          te same dwa punkty za każdym razem opisują coś innego.
        </p>
        <GeoBuilder color={color} onComplete={definitions.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="3"
          kicker="3 figury do narysowania"
          image={IMAGES.przyklady}
          alt="Dziecko łączące linijką dwa zaznaczone punkty na kartce"
        >
          Umiesz już rozróżnić cztery obiekty. Teraz sam/a je narysuj: wybierz narzędzie, kliknij
          dwa punkty na tablicy konstrukcyjnej — i sprawdź, czy powstała dokładnie ta figura, o
          którą prosiliśmy.
        </LessonImageCard>
        <ConstructionBoard color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.lupa}
          alt="Dziecko z lupą przygląda się rysunkowi z liniami i punktami przypominającemu plan"
        >
          <p>
            Czas na trening. Kilka zadań każe Ci rozpoznać obiekt na rysunku i poprawnie go
            nazwać — łącznie z tym podchwytliwym, w którym kolejność liter ma znaczenie.
          </p>
        </LessonImageCard>
        <ClassifyDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="lamiglowka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pinezki}
          alt="Tablica korkowa z pinezkami i nićmi łączącymi kilka punktów"
          reverse
          lead="Ile prostych i odcinków wyznaczają punkty?"
        >
          Zaczniesz od jednego punktu, potem dojdzie drugi — zobaczysz, ile prostych da się przez
          nie poprowadzić. Na koniec dojdą jeszcze dwa punkty i policzysz, ile odcinków da się
          między wszystkimi czterema narysować.
        </LessonImageCard>
        <SegmentCounter color={color} onComplete={puzzle.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: cztery obiekty w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej w każdej kolejnej lekcji geometrii.
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

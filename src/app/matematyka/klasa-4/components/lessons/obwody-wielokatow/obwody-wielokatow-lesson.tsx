'use client';

import Image from 'next/image';
import { Footprints, RectangleHorizontal, Sigma, Square } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { PerimeterCompare } from './perimeter-compare';
import { PerimeterWalk, type PerimeterTarget } from './perimeter-walk';
import { PerimeterFormulaShowcase } from './perimeter-formula-showcase';
import { rectangleCorners } from './perimeter-geometry';
import { buildDrillTasks } from './obwody-wielokatow-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Który obwód jest większy?',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'definicje',
    kind: 'Nowe pojęcie',
    title: 'Obejdź figurę dookoła',
    time: '7 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Skrót dla prostokąta i kwadratu',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Policz obwód',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'ogrodzenie',
    kind: 'Zadanie problemowe',
    title: 'Ile siatki na ogrodzenie?',
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

const PLAC_ZABAW_TARGET: PerimeterTarget[] = [
  {
    id: 'plac-zabaw',
    prompt: 'Obejdź dookoła plac zabaw, bok po boku.',
    caption: 'Nieregularny plac zabaw — pięć różnych boków',
    points: [
      { x: 40, y: 140 },
      { x: 40, y: 60 },
      { x: 110, y: 30 },
      { x: 200, y: 60 },
      { x: 200, y: 140 },
    ],
    sideLengths: [5, 5, 6, 5, 10],
    unit: 'm',
  },
];

const OGRODZENIE_TARGETS: PerimeterTarget[] = [
  {
    id: 'ogrodek',
    prompt: 'Obejdź dookoła prostokątny ogródek warzywny.',
    caption: '8 m na 5 m — tata chce go ogrodzić siatką',
    points: rectangleCorners({ x: 74, y: 65 }, 112, 70),
    sideLengths: [8, 5, 8, 5],
    unit: 'm',
  },
  {
    id: 'piaskownica',
    prompt: 'Teraz obejdź dookoła kwadratową piaskownicę.',
    caption: 'Bok 3 m — tej samej siatki starczy na obrys',
    points: rectangleCorners({ x: 91, y: 61 }, 78, 78),
    sideLengths: [3, 3, 3, 3],
    unit: 'm',
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'definicja-obwodu',
    question: 'Obwód wielokąta to...',
    options: [
      { id: 'a', text: 'suma długości wszystkich jego boków' },
      { id: 'b', text: 'liczba jego boków' },
      { id: 'c', text: 'pole powierzchni figury' },
      { id: 'd', text: 'długość jego najdłuższego boku' },
    ],
    correctId: 'a',
    explanation: 'Obwód to zawsze suma długości wszystkich boków figury — obojętnie, ile ich ma.',
  },
  {
    id: 'obwod-prostokata-quiz',
    question: 'Prostokąt ma boki 10 cm i 6 cm. Jego obwód to...',
    options: [
      { id: 'a', text: '16 cm' },
      { id: 'b', text: '60 cm' },
      { id: 'c', text: '32 cm' },
      { id: 'd', text: '26 cm' },
    ],
    correctId: 'c',
    explanation: '2 × (10 + 6) = 2 × 16 = 32 cm.',
  },
  {
    id: 'bok-z-obwodu-kwadratu',
    question: 'Kwadrat ma obwód 20 cm. Ile ma bok?',
    options: [
      { id: 'a', text: '4 cm' },
      { id: 'b', text: '10 cm' },
      { id: 'c', text: '80 cm' },
      { id: 'd', text: '5 cm' },
    ],
    correctId: 'd',
    explanation: 'Obwód kwadratu to 4 × bok, więc bok to 20 : 4 = 5 cm.',
  },
  {
    id: 'nieregularny-piecio',
    question: 'Żeby policzyć obwód nieregularnego pięciokąta o pięciu różnych bokach, musisz...',
    options: [
      { id: 'a', text: 'pomnożyć najdłuższy bok przez 5' },
      { id: 'b', text: 'dodać wszystkie pięć długości boków' },
      { id: 'c', text: 'pomnożyć dwa sąsiednie boki' },
      { id: 'd', text: 'policzyć tylko dwa boki i pomnożyć przez 2' },
    ],
    correctId: 'b',
    explanation: 'Dla dowolnego wielokąta zasada jest ta sama — dodajesz długości wszystkich boków po kolei.',
  },
  {
    id: 'dlaczego-2-a-plus-b',
    question: 'Skrót 2 × (a + b) działa dla prostokąta, bo...',
    options: [
      { id: 'a', text: 'w prostokącie wszystkie boki są równe' },
      { id: 'b', text: 'prostokąt ma dokładnie dwie pary równych, naprzeciwległych boków' },
      { id: 'c', text: 'ten wzór działa dla każdego czworokąta' },
      { id: 'd', text: 'a i b muszą mieć tę samą długość' },
    ],
    correctId: 'b',
    explanation:
      'Dzięki temu, że boki naprzeciwległe są równe, zamiast dodawać cztery liczby, wystarczy dwa razy dodać jeden bok z każdej pary.',
  },
  {
    id: 'rama-obrazu-quiz',
    question: 'Rama na obraz ma kształt kwadratu o boku 40 cm. Ile centymetrów listwy potrzeba na całą ramę?',
    options: [
      { id: 'a', text: '80 cm' },
      { id: 'b', text: '1600 cm' },
      { id: 'c', text: '160 cm' },
      { id: 'd', text: '40 cm' },
    ],
    correctId: 'c',
    explanation: '4 × 40 cm = 160 cm listwy na całą ramę.',
  },
];

const CHEAT_SHEET = [
  'Obwód dowolnej figury to suma długości wszystkich jej boków.',
  'Dotyczy to każdego wielokąta — nie tylko prostokąta czy kwadratu.',
  'W prostokącie krócej: 2 × (jeden bok + sąsiedni bok).',
  'W kwadracie jeszcze krócej: 4 × długość boku.',
  'Znając obwód kwadratu, bok policzysz, dzieląc obwód przez 4.',
  'Obwód mierzysz w tych samych jednostkach co boki (cm, m…) — nigdy w jednostkach kwadratowych.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/obwody-wielokatow/tasma-miernicza-wokol-grzadki.jpg',
  rozgrzewka: '/images/matematyka/lekcje/obwody-wielokatow/dwa-ogrodki-do-porownania.jpg',
  przyklady: '/images/matematyka/lekcje/obwody-wielokatow/rama-obrazu-z-tasma.jpg',
  trening: '/images/matematyka/lekcje/obwody-wielokatow/dzieci-na-biezni.jpg',
  ogrodzenie: '/images/matematyka/lekcje/obwody-wielokatow/plot-wokol-ogrodka.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ObwodyWielokatowLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const fenceCase = useStepDone('ogrodzenie');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Znasz już wielokąty, prostokąty i kwadraty. Teraz odpowiesz na pytanie: ile metrów
            ogrodzenia, listwy albo taśmy potrzeba, żeby okrążyć figurę dookoła? To właśnie{' '}
            <strong>obwód</strong>.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Sigma, text: 'Obwód — suma długości wszystkich boków' },
              { icon: Footprints, text: 'Działa dla każdego wielokąta, nie tylko prostokąta' },
              { icon: RectangleHorizontal, text: 'Prostokąt — skrót 2 × (a + b)' },
              { icon: Square, text: 'Kwadrat — skrót 4 × bok' },
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
            alt="Taśma miernicza rozciągnięta wokół prostokątnej grządki w ogrodzie"
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
          alt="Dwa ogródki na działce oznaczone sznurkiem, o różnych kształtach"
          lead="Który ogródek otoczysz dłuższym sznurkiem?"
        >
          Zanim poznasz sposób liczenia, zgadnij na oko — a potem sprawdź, dodając boki. Wygląd
          bywa zwodniczy.
        </LessonImageCard>
        <PerimeterCompare color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="definicje">
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Kliknij, żeby obejść plac zabaw dookoła, bok po boku. Za każdym razem dochodzi długość
          kolejnego boku — a na końcu, gdy wrócisz do startu, wszystkie boki złożą się w obwód.
        </p>
        <PerimeterWalk color={color} targets={PLAC_ZABAW_TARGET} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="2×"
          kicker="Prostokąt i kwadrat mają swój skrót"
          image={IMAGES.przyklady}
          alt="Drewniana rama obrazu na warsztacie z rozłożoną wzdłuż krawędzi taśmą mierniczą"
        >
          Dla prostokąta i kwadratu nie musisz dodawać boków po kolei — te figury mają swoje
          własne, krótsze sposoby liczenia.
        </LessonImageCard>
        <PerimeterFormulaShowcase color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Dzieci biegające po bieżni lekkoatletycznej na stadionie szkolnym"
        >
          <p>
            Czas policzyć obwody samodzielnie — od prostego prostokąta po nietypowy kształt w
            literę L.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="ogrodzenie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.ogrodzenie}
          alt="Mężczyzna budujący siatkowe ogrodzenie wokół warzywnego ogródka"
          reverse
          lead="Tata ogradza ogródek — i piaskownicę obok."
        >
          Najpierw potrzebuje siatki na prostokątny ogródek warzywny. Potem tą samą metodą obudowuje
          kwadratową piaskownicę dla młodszej siostry. Pomóż mu policzyć, ile siatki kupić za każdym
          razem.
        </LessonImageCard>
        <PerimeterWalk color={color} targets={OGRODZENIE_TARGETS} onComplete={fenceCase.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: obwód w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej, gdy w kolejnych lekcjach spotkasz koła, skalę i pola figur.
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

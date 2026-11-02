'use client';

import Image from 'next/image';
import { Hexagon, Pentagon, Square, Triangle } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { PolygonOrNotSort } from './polygon-or-not-sort';
import { DotToDotPolygon } from './dot-to-dot-polygon';
import { PolygonFamilyShowcase } from './polygon-family-showcase';
import { SoccerBallCase } from './soccer-ball-case';
import { buildDrillTasks } from './wielokaty-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Wielokąt czy nie?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'definicje',
    kind: 'Nowe pojęcie',
    title: 'Połącz kropki: jak powstaje wielokąt',
    time: '8 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Ta sama nazwa, różny kształt',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Policz boki i nazwij figurę',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'pilka',
    kind: 'Zadanie problemowe',
    title: 'Wielokąty na piłce nożnej',
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
    id: 'definicja-wielokata',
    question: 'Żeby figura była wielokątem, musi być...',
    options: [
      { id: 'a', text: 'zamknięta i mieć same proste boki' },
      { id: 'b', text: 'okrągła' },
      { id: 'c', text: 'mieć dokładnie 4 boki' },
      { id: 'd', text: 'kolorowa' },
    ],
    correctId: 'a',
    explanation: 'Wielokąt to figura zamknięta, zbudowana wyłącznie z prostych boków — bez krzywych i bez przerw.',
  },
  {
    id: 'trojkat-boki',
    question: 'Trójkąt ma...',
    options: [
      { id: 'a', text: '4 boki' },
      { id: 'b', text: '3 boki' },
      { id: 'c', text: '5 boków' },
      { id: 'd', text: '6 boków' },
    ],
    correctId: 'b',
    explanation: 'Trójkąt to najprostszy wielokąt — ma dokładnie 3 boki i 3 wierzchołki.',
  },
  {
    id: 'szesciokat-nazwa',
    question: 'Figura o 6 bokach nazywa się...',
    options: [
      { id: 'a', text: 'pięciokąt' },
      { id: 'b', text: 'czworokąt' },
      { id: 'c', text: 'sześciokąt' },
      { id: 'd', text: 'ośmiokąt' },
    ],
    correctId: 'c',
    explanation: '6 boków to sześciokąt — tak samo nazywają się komórki plastra miodu.',
  },
  {
    id: 'nieregularny-czworokat',
    question: 'Czy nieregularny (krzywy) czworokąt to nadal wielokąt?',
    options: [
      { id: 'a', text: 'Nie, musi być kwadratem' },
      { id: 'b', text: 'Nie, musi mieć równe boki' },
      { id: 'c', text: 'Tak, ale tylko jeśli jest symetryczny' },
      { id: 'd', text: 'Tak, bo ma proste boki i jest zamknięty' },
    ],
    correctId: 'd',
    explanation: 'Nazwa wielokąta zależy tylko od liczby boków — nie musi być foremny (równy), żeby się liczyć.',
  },
  {
    id: 'ile-wierzcholkow-pieciokat',
    question: 'Ile wierzchołków ma pięciokąt?',
    options: [
      { id: 'a', text: '5' },
      { id: 'b', text: '4' },
      { id: 'c', text: '6' },
      { id: 'd', text: '3' },
    ],
    correctId: 'a',
    explanation: 'Liczba wierzchołków zawsze jest taka sama jak liczba boków — pięciokąt ma 5 i 5.',
  },
  {
    id: 'lamana-otwarta',
    question: 'Otwarta łamana — figura z prostymi bokami, ale bez ostatniego, domykającego boku — to...',
    options: [
      { id: 'a', text: 'wielokąt, mimo że nie jest zamknięta' },
      { id: 'b', text: 'wielokąt tylko czasami' },
      { id: 'c', text: 'nie jest wielokątem, bo nie jest zamknięta' },
      { id: 'd', text: 'nie jest wielokątem, bo ma za mało wierzchołków' },
    ],
    correctId: 'c',
    explanation: 'Same proste boki to za mało — wielokąt musi być też zamknięty, inaczej to tylko łamana otwarta.',
  },
];

const CHEAT_SHEET = [
  'Wielokąt to zamknięta figura zbudowana z samych prostych boków — bez krzywych i bez przerw.',
  'Nazwa wielokąta zależy tylko od liczby boków: 3 to trójkąt, 4 to czworokąt, 5 to pięciokąt, 6 to sześciokąt.',
  'Liczba wierzchołków zawsze jest taka sama jak liczba boków.',
  'Wielokąt nie musi być foremny (równy) — nieregularny czworokąt to wciąż czworokąt.',
  'Koło, łuk i otwarta łamana to nie wielokąty — brakuje im prostych boków albo zamknięcia.',
  'Ten sam kształt spotkasz w naturze i przedmiotach: plaster miodu to sześciokąty, łaty piłki nożnej to pięciokąty i sześciokąty.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/wielokaty/narzedzia-geometryczne.jpg',
  rozgrzewka: '/images/matematyka/lekcje/wielokaty/wycinanki-ksztaltow.jpg',
  przyklady: '/images/matematyka/lekcje/wielokaty/plaster-miodu.jpg',
  trening: '/images/matematyka/lekcje/wielokaty/papierowe-wielokaty.jpg',
  pilka: '/images/matematyka/lekcje/wielokaty/pilka-nozna.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function WielokatyLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const ballCase = useStepDone('pilka');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Znasz już kąty i proste. Teraz połączysz je w coś większego —{' '}
            <strong>wielokąty</strong>: zamknięte figury z prostych boków. Nauczysz się je{' '}
            <strong>rozpoznawać i nazywać</strong> po liczbie boków.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Triangle, text: 'Trójkąt — 3 boki' },
              { icon: Square, text: 'Czworokąt — 4 boki' },
              { icon: Pentagon, text: 'Pięciokąt — 5 boków' },
              { icon: Hexagon, text: 'Sześciokąt — 6 boków' },
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
            alt="Ekierka, cyrkiel i linijka leżące obok naszkicowanych wielokątów na kartce"
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
          alt="Wycięte z papieru kształty leżące na stole — trójkąty, koła i inne figury"
          lead="Zanim poznasz definicję, zaufaj oku."
        >
          Niektóre z tych kształtów to wielokąty, inne nie. Sprawdź, czy uda Ci się je rozróżnić —
          zwracaj uwagę na to, czy figura jest zamknięta i czy wszystkie jej boki są proste.
        </LessonImageCard>
        <PolygonOrNotSort color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="definicje">
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Dotknij ponumerowane kropki po kolei: 1, 2, 3… Gdy dojdziesz do ostatniej, figura zamknie
          się sama — zobaczysz, ile boków ma i jak się nazywa.
        </p>
        <DotToDotPolygon color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="6"
          kicker="Ten sam kształt w naturze"
          image={IMAGES.przyklady}
          alt="Zbliżenie na plaster miodu z widocznymi sześciokątnymi komórkami"
        >
          Komórki plastra miodu to naturalne sześciokąty. Ale nazwa wielokąta nie zależy tylko od
          tego, jak „równo” wygląda — zobacz dwie różne figury o tej samej liczbie boków.
        </LessonImageCard>
        <PolygonFamilyShowcase color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Kolorowe papierowe wielokąty o różnej liczbie boków rozłożone na stole"
        >
          <p>
            Czas na trening. Dla każdej figury policz boki i wybierz właściwą nazwę — niektóre są
            foremne, inne nie, ale zasada jest zawsze ta sama.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="pilka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pilka}
          alt="Piłka nożna z widocznymi czarnymi i białymi łatami w kształcie wielokątów"
          reverse
          lead="Piłka nożna to wielokąty w akcji."
        >
          Klasyczna piłka nożna jest zszyta z dwóch rodzajów łat — jedne mają 5 boków, drugie 6.
          Przyjrzyj się im i policz.
        </LessonImageCard>
        <SoccerBallCase color={color} onComplete={ballCase.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: wielokąty w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej w kolejnych lekcjach geometrii — przyda się przy prostokątach i obwodach.
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

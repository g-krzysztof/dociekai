'use client';

import Image from 'next/image';
import { Box, Layers, Minus, Ruler } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { PartTally } from './part-tally';
import { EdgeGroupBoard } from './edge-group-board';
import { BoxFactSteps } from './box-fact-steps';
import { StickFrame } from './stick-frame';
import { buildBoxDrill } from './box-drill';
import { BOX_RULES } from '../../../lib/solids';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Policz, nie zgaduj',
    time: '6 min',
    icon: 'Sparkles',
  },
  {
    id: 'wymiary',
    kind: 'Nowe pojęcie',
    title: 'Trzy liczby opisują całą bryłę',
    time: '9 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy opisy krok po kroku',
    time: '7 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Sprawdź samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'zadanie',
    kind: 'Zadanie problemowe',
    title: 'Szkielet z patyczków',
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

const QUIZ: QuizQuestion[] = [
  {
    id: 'ile-krawedzi',
    question: 'Ile krawędzi ma prostopadłościan?',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '8' },
      { id: 'c', text: '12' },
      { id: 'd', text: '4' },
    ],
    correctId: 'c',
    explanation:
      'Krawędzi jest 12 — trzy czwórki krawędzi równoległych. Liczba 6 to ściany, a 8 to wierzchołki.',
  },
  {
    id: 'ile-widac',
    question: 'Ile ścian prostopadłościanu widać naraz, patrząc na niego z jednego miejsca?',
    options: [
      { id: 'a', text: 'Najwyżej trzy' },
      { id: 'b', text: 'Wszystkie sześć' },
      { id: 'c', text: 'Najwyżej cztery' },
      { id: 'd', text: 'Tylko jedną' },
    ],
    correctId: 'a',
    explanation:
      'Z jednego ustawienia widać najwyżej trzy ściany — pozostałe trzy są z drugiej strony. Dlatego na rysunku ich krawędzie kreśli się linią przerywaną.',
  },
  {
    id: 'ile-tej-samej-dlugosci',
    question: 'Pudełko ma wymiary 9 cm × 6 cm × 4 cm. Ile jego krawędzi ma po 6 cm?',
    options: [
      { id: 'a', text: '2' },
      { id: 'b', text: '4' },
      { id: 'c', text: '6' },
      { id: 'd', text: '12' },
    ],
    correctId: 'b',
    explanation:
      'Każdy z trzech wymiarów powtarza się dokładnie cztery razy: cztery krawędzie po 9 cm, cztery po 6 cm i cztery po 4 cm. Razem 3 · 4 = 12.',
  },
  {
    id: 'sciany-w-parach',
    question: 'Ile różnych rozmiarów prostokątów może mieć prostopadłościan, który nie jest sześcianem?',
    options: [
      { id: 'a', text: 'Sześć — każda ściana inna' },
      { id: 'b', text: 'Jeden — wszystkie ściany takie same' },
      { id: 'c', text: 'Trzy — ściany chodzą parami' },
      { id: 'd', text: 'Dwa — góra i dół oraz reszta' },
    ],
    correctId: 'c',
    explanation:
      'Ściany przeciwległe są identyczne, więc sześć ścian to trzy pary. Każda para bierze dwa z trzech wymiarów bryły.',
  },
  {
    id: 'szescian-opis',
    question: 'Dlaczego sześcian wystarczy opisać jedną liczbą, a zwykłe pudełko trzema?',
    options: [
      { id: 'a', text: 'Bo sześcian ma mniej krawędzi' },
      { id: 'b', text: 'Bo w sześcianie wszystkie trzy wymiary są równe' },
      { id: 'c', text: 'Bo sześcian nie ma wierzchołków' },
      { id: 'd', text: 'Bo sześcian rysuje się bez linii przerywanych' },
    ],
    correctId: 'b',
    explanation:
      'Sześcian ma tyle samo ścian, krawędzi i wierzchołków co każdy prostopadłościan. Różnica jest jedna: jego długość, szerokość i wysokość to ta sama liczba, więc podaje się ją raz.',
  },
  {
    id: 'drut-na-szkielet',
    question: 'Ile drutu potrzeba na sam szkielet pudełka 10 cm × 4 cm × 2 cm?',
    options: [
      { id: 'a', text: '16 cm' },
      { id: 'b', text: '80 cm' },
      { id: 'c', text: '64 cm' },
      { id: 'd', text: '48 cm' },
    ],
    correctId: 'c',
    explanation:
      'Każdy wymiar powtarza się cztery razy, więc 4 · (10 + 4 + 2) = 4 · 16 = 64 cm. Liczba 16 to suma samych trzech wymiarów, bez powielenia.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/opis-prostopadloscianu/akwarium-szklane.jpg',
  rozgrzewka: '/images/matematyka/lekcje/opis-prostopadloscianu/pudelko-otwarte.jpg',
  wymiary: '/images/matematyka/lekcje/opis-prostopadloscianu/trzy-pudelka-roznych-proporcji.jpg',
  przyklady: '/images/matematyka/lekcje/opis-prostopadloscianu/dziewczynka-oglada-karton.jpg',
  cwiczenia: '/images/matematyka/lekcje/opis-prostopadloscianu/stos-kartonow.jpg',
  zadanie: '/images/matematyka/lekcje/opis-prostopadloscianu/szkielet-z-patyczkow.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function OpisProstopadloscianuLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozgrzewka = useStepDone('rozgrzewka');
  const wymiary = useStepDone('wymiary');
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
            Słowa <strong>ściana</strong>, <strong>krawędź</strong> i <strong>wierzchołek</strong>{' '}
            już znasz z przewodnika. Teraz zaczniesz ich używać: policzysz je sam na bryle, którą
            możesz obrócić, i odkryjesz, że nie są rozrzucone przypadkowo. Ściany chodzą parami,
            krawędzie czwórkami — a na końcu okaże się, że całe pudełko opisują{' '}
            <strong>trzy liczby</strong>.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Box, text: '6 ścian, 12 krawędzi, 8 wierzchołków — policzone, nie podane' },
              { icon: Layers, text: 'Ściany przeciwległe są identyczne: 3 pary' },
              { icon: Minus, text: 'Krawędzie w trzech czwórkach równej długości' },
              { icon: Ruler, text: 'Długość, szerokość i wysokość opisują całą bryłę' },
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
            alt="Szklane akwarium w kształcie prostopadłościanu stoi na drewnianym stole, przez przezroczyste ścianki widać wszystkie jego krawędzie"
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
          numeral="6"
          kicker="Policz, nie zgaduj"
          image={IMAGES.rozgrzewka}
          alt="Otwarte kartonowe pudełko na drewnianym stole, wieko oparte o jego bok, widać ścianki z zewnątrz i od środka"
        >
          Klikaj kolejne ściany bryły — każda kliknięta zostaje zaznaczona, a podwójne kliknięcie nic
          nie zmienia. Kiedy zabraknie ci ścian do klikania, obróć bryłę: reszta jest z drugiej
          strony. Potem to samo z krawędziami i wierzchołkami.
        </LessonImageCard>
        <PartTally color={color} onComplete={rozgrzewka.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="wymiary">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.wymiary}
          alt="Trzy kartonowe pudełka o wyraźnie różnych proporcjach stoją obok siebie: wysokie i wąskie, długie i płaskie oraz sześcienne"
        >
          <p>
            Kliknij dowolną krawędź bryły — podświetlą się od razu wszystkie krawędzie tej samej
            długości. Dwanaście krawędzi to tak naprawdę <strong>trzy czwórki</strong>, a ich trzy
            długości mają nazwy: <strong>długość</strong>, <strong>szerokość</strong> i{' '}
            <strong>wysokość</strong>. Te trzy pudełka na zdjęciu różnią się tylko tymi liczbami —
            ścian, krawędzi i wierzchołków mają dokładnie tyle samo.
          </p>
        </LessonImageCard>
        <EdgeGroupBoard color={color} onComplete={wymiary.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Dziewczynka około dziesięciu lat, jasna karnacja, jasnoblond włosy związane w kucyk, miętowy sweterek, trzyma w rękach kartonowe pudełko i przygląda się jego narożnikowi"
          lead="Trzy liczby wystarczą — także wtedy, gdy trzeba je dopiero odtworzyć."
          reverse
        >
          Klikaj kolejne kroki i sprawdzaj, czy myślisz tak samo. Ostatni przykład idzie w drugą
          stronę: znane są wymiary dwóch ścian, a szukamy wymiarów całej bryły.
        </LessonImageCard>
        <BoxFactSteps color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Stos kartonowych pudeł różnej wielkości ustawionych jedno na drugim w jasnym pustym pokoju"
          reverse
        >
          <p>
            Siedem zadań o rosnącej trudności: liczby ścian i wierzchołków, krawędzie tej samej
            długości, wymiary konkretnej ściany, a na koniec długość całego szkieletu — raz liczona
            wprost, raz od końca.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildBoxDrill(color)}
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
          lead="Sam szkielet, bez ścianek — ile patyczków i ile drutu na to pójdzie?"
          alt="Model bryły zbudowany z drewnianych patyczków połączonych w narożnikach kolorowymi kulkami plasteliny, obok leżą zapasowe patyczki"
        >
          Bierz patyczki z tacki i buduj szkielet pudełka. Zobaczysz, że każdej długości potrzeba
          dokładnie po cztery — i że całej sumy nie trzeba liczyć po jednym patyczku.
        </LessonImageCard>
        <StickFrame color={color} onComplete={zadanie.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: opis prostopadłościanu</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Siedem zdań, które wystarczą na cały ten temat.
        </p>
        <ol className="divide-y border">
          {BOX_RULES.map((rule, index) => (
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

'use client';

import Image from 'next/image';
import { ArrowRight, MoveHorizontal, Ruler, Sparkles } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { ScaleWarmup } from './scale-warmup';
import { LineBuilder } from './line-builder';
import { LineReadingExamples } from './line-reading-examples';
import { LineDrill } from './line-drill';
import { RouteMap } from './route-map';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ta sama oś, inna skala',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'pojecie',
    kind: 'Nowe pojęcie',
    title: 'Zaznacz liczbę na osi',
    time: '8 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Odczytujemy punkt krok po kroku',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Trening czytania osi',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'trasa',
    kind: 'Zadanie problemowe',
    title: 'Trasa rowerowa',
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
    id: 'cztery-dzialki',
    question:
      'Na osi liczbowej od 0 do 1000, z działką co 200, zaznaczono punkt na 4. kresce od zera. Jaka to liczba?',
    options: [
      { id: 'a', text: '600' },
      { id: 'b', text: '700' },
      { id: 'c', text: '800' },
      { id: 'd', text: '900' },
    ],
    correctId: 'c',
    explanation: '4 działki po 200 to 4 × 200 = 800.',
  },
  {
    id: 'wartosc-dzialki-100k',
    question:
      'Oś liczbową od 0 do 100 000 podzielono na 5 równych odcinków. Ile wynosi jedna duża działka?',
    options: [
      { id: 'a', text: '10 000' },
      { id: 'b', text: '20 000' },
      { id: 'c', text: '25 000' },
      { id: 'd', text: '50 000' },
    ],
    correctId: 'b',
    explanation: '100 000 : 5 = 20 000.',
  },
  {
    id: 'kierunek',
    question: 'Im dalej w prawo na osi liczbowej, tym liczba jest:',
    options: [
      { id: 'a', text: 'mniejsza' },
      { id: 'b', text: 'większa' },
      { id: 'c', text: 'taka sama' },
    ],
    correctId: 'b',
    explanation: 'Liczby na osi rosną w prawo — to jedna z jej najważniejszych własności.',
  },
  {
    id: 'trzy-dzialki-miliony',
    question:
      'Na osi liczbowej zaznaczono punkt 3 duże kreski od zera, a jedna duża kreska to 200 000. Jaka to liczba?',
    options: [
      { id: 'a', text: '400 000' },
      { id: 'b', text: '500 000' },
      { id: 'c', text: '600 000' },
      { id: 'd', text: '800 000' },
    ],
    correctId: 'c',
    explanation: '3 działki po 200 000 to 3 × 200 000 = 600 000.',
  },
  {
    id: 'pelne-tysiace',
    question: 'Liczba 4500 leży między którymi sąsiednimi „pełnymi tysiącami” na osi?',
    options: [
      { id: 'a', text: '4000 i 5000' },
      { id: 'b', text: '4000 i 4400' },
      { id: 'c', text: '4500 i 5000' },
      { id: 'd', text: '4400 i 4600' },
    ],
    correctId: 'a',
    explanation: '4500 leży dokładnie w połowie między 4000 a 5000.',
  },
];

const CHEAT_SHEET = [
  'Oś liczbowa to prosta, na której liczby rosną w prawo.',
  'Zawsze najpierw sprawdź, ile wart jest jeden odstęp między kreskami.',
  'Wartość punktu = najbliższa duża kreska + policzone małe kreski.',
  'Im dalej w prawo, tym liczba większa — niezależnie od skali osi.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/os-liczbowa/skoki.jpg',
  flaga: '/images/matematyka/lekcje/os-liczbowa/flaga.jpg',
  rower: '/images/matematyka/lekcje/os-liczbowa/rower.jpg',
  lupa: '/images/matematyka/lekcje/os-liczbowa/lupa.jpg',
  skokiCwiczenia: '/images/matematyka/lekcje/os-liczbowa/skoki-cwiczenia.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function OsLiczbowaLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const concept = useStepDone('pojecie');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('trening');
  const problem = useStepDone('trasa');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            W poprzedniej lekcji dzieliłeś duże liczby na klasy. Oś liczbowa pokazuje to samo w
            zupełnie inny sposób — jako <strong>prostą z kreskami</strong>, na której{' '}
            <strong>każda liczba ma swoje miejsce</strong>. Nauczysz się odczytywać punkty i
            zaznaczać liczby — od dziesiątek po setki tysięcy, zawsze tą samą metodą.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: MoveHorizontal, text: 'Jak odczytać wartość jednego odstępu na osi' },
              { icon: Ruler, text: 'Jak zaznaczyć podaną liczbę na osi' },
              { icon: ArrowRight, text: 'Dlaczego liczby rosną w prawo' },
              { icon: Sparkles, text: 'Ta sama metoda działa na każdej skali' },
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
            alt="Dziecko skaczące po kamieniach ułożonych w rosnącym rzędzie, jak po osi liczbowej"
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
          image={IMAGES.lupa}
          alt="Dziecko patrzące przez lupę na długą kropkowaną ścieżkę na ziemi"
          lead="Ta sama oś może przedstawiać zupełnie różne skale."
        >
          <p>
            Czasem trzeba przyjrzeć jej się z bliska, żeby zobaczyć, ile naprawdę warta jest jedna
            kreska.
          </p>
        </LessonImageCard>
        <ScaleWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="pojecie">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.flaga}
          alt="Dziecko dokładnie stawiające chorągiewkę w wybranym miejscu na kropkowanej ścieżce"
        >
          <p>
            Teraz Twoja kolej. Kliknij dokładnie tam, gdzie powinna stać podana liczba — tak jak
            stawia się chorągiewkę w konkretnym miejscu na ścieżce. Zacznij od małej skali, na
            koniec spróbujesz zaznaczyć liczbę w setkach tysięcy.
          </p>
        </LessonImageCard>
        <LineBuilder color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LineReadingExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.skokiCwiczenia}
          alt="Radosne dziecko w skoku, jak przy grze w klasy, otoczone iskierkami"
          reverse
        >
          <p>
            Czas na trening. Im więcej razy przejdziesz przez oś, tym szybciej zobaczysz, ile jest
            warta jedna kreska — bez liczenia od nowa za każdym razem.
          </p>
        </LessonImageCard>
        <LineDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="trasa">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.rower}
          alt="Dziecko jadące na rowerze wzdłuż ścieżki oznaczonej kolorowymi chorągiewkami"
          reverse
        >
          <p>
            Trasa wycieczki rowerowej też jest osią liczbową — tylko zamiast liczb ma kilometry i
            przystanki. Odpowiedz na pytania pod mapą trasy.
          </p>
        </LessonImageCard>
        <RouteMap color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: oś liczbowa w czterech zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej za każdym razem, gdy trafisz na nową skalę.
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

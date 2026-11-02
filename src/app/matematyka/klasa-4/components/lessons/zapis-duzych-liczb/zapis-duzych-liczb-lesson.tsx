'use client';

import Image from 'next/image';
import { Hash, Layers, Ruler, Sparkles } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { GiantNumbers } from './giant-numbers';
import { PlaceValueBuilder } from './place-value-builder';
import { ReadingSteps } from './reading-steps';
import { PlaceValueDrill } from './place-value-drill';
import { PopulationChallenge } from './population-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Jak duże są duże liczby?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'klasy',
    kind: 'Nowe pojęcie',
    title: 'Klasy i miejsca dziesiętne',
    time: '8 min',
    icon: 'Lightbulb',
  },
  {
    id: 'czytanie',
    kind: 'Przykłady',
    title: 'Czytamy liczby krok po kroku',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Trening z klasami',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'miasta',
    kind: 'Zadanie problemowe',
    title: 'Ile osób mieszka w polskich miastach?',
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
    id: 'niepelna-klasa',
    question: 'W liczbie 82 004 klasa tysięcy ma tylko 2 cyfry. Jakie to cyfry?',
    options: [
      { id: 'a', text: '0 i 0' },
      { id: 'b', text: '8 i 4' },
      { id: 'c', text: '8 i 2' },
      { id: 'd', text: '2 i 0' },
    ],
    correctId: 'c',
    explanation:
      '82 004 ma 5 cyfr, więc licząc od prawej klasa tysięcy mieści tylko 2 cyfry: 8 i 2 — reszta to klasa jedności.',
  },
  {
    id: 'klasa-milionow',
    question: 'Ile milionów jest w liczbie 5 200 018?',
    options: [
      { id: 'a', text: '2' },
      { id: 'b', text: '18' },
      { id: 'c', text: '500' },
      { id: 'd', text: '5' },
    ],
    correctId: 'd',
    explanation: 'Klasa milionów w 5 200 018 to pojedyncza cyfra 5 — to pięć milionów.',
  },
  {
    id: 'zapis-cyframi',
    question: 'Jak zapiszemy cyframi liczbę: sto pięćdziesiąt tysięcy dwadzieścia?',
    options: [
      { id: 'a', text: '150 200' },
      { id: 'b', text: '150 020' },
      { id: 'c', text: '105 020' },
      { id: 'd', text: '150 002' },
    ],
    correctId: 'b',
    explanation: 'Sto pięćdziesiąt tysięcy to 150 000, plus dwadzieścia daje 150 020.',
  },
  {
    id: 'porownanie',
    question: 'Która liczba jest większa: 987 000 czy 1 002 000?',
    options: [
      { id: 'a', text: '1 002 000' },
      { id: 'b', text: '987 000' },
    ],
    correctId: 'a',
    explanation:
      '987 000 ma 6 cyfr, a 1 002 000 ma 7 cyfr — więcej cyfr prawie zawsze znaczy większą liczbę.',
  },
  {
    id: 'miejsce-cyfry',
    question: 'W liczbie 4 502 316 na którym miejscu jest cyfra 3?',
    options: [
      { id: 'a', text: 'setki tysięcy' },
      { id: 'b', text: 'dziesiątki' },
      { id: 'c', text: 'setki' },
      { id: 'd', text: 'jedności tysięcy' },
    ],
    correctId: 'c',
    explanation: 'Klasa jedności w 4 502 316 to 3-1-6: cyfra 3 stoi na miejscu setek.',
  },
];

const CHEAT_SHEET = [
  'Liczby dzielimy na klasy po 3 cyfry, licząc od prawej.',
  'W każdej klasie ten sam wzór: setki, dziesiątki, jedności.',
  'Kolejność klas: jedności → tysiące → miliony.',
  'Zero na danym miejscu nie ma swojego słowa — po prostu je pomijamy przy czytaniu.',
  'Więcej cyfr w zapisie prawie zawsze znaczy większą liczbę.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/zapis-duzych-liczb/duze-liczby.jpg',
  miasta: '/images/matematyka/lekcje/zapis-duzych-liczb/miasta.jpg',
  detektyw: '/images/matematyka/lekcje/zapis-duzych-liczb/detektyw.jpg',
  wieza: '/images/matematyka/lekcje/zapis-duzych-liczb/wieza.jpg',
  megafon: '/images/matematyka/lekcje/zapis-duzych-liczb/megafon.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ZapisDuzychLiczbLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const classes = useStepDone('klasy');
  const reading = useStepDone('czytanie');
  const drill = useStepDone('trening');
  const problem = useStepDone('miasta');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Liczby, których używamy na co dzień, rzadko mają więcej niż dwie–trzy cyfry. Ale świat
            pełen jest znacznie <strong>większych liczb</strong> — mieszkańców miast, kilometrów w
            kosmosie, sekund w roku. W tej lekcji nauczysz się je{' '}
            <strong>zapisywać, dzielić na klasy i czytać na głos</strong> tak, żeby żadna liczba
            cię już nie zaskoczyła.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Layers, text: 'Jak dzielimy liczby na klasy: jedności, tysiące, miliony' },
              { icon: Hash, text: 'Który wzór powtarza się w każdej klasie' },
              { icon: Ruler, text: 'Jak czytać duże liczby krok po kroku' },
              { icon: Sparkles, text: 'Dlaczego więcej cyfr znaczy większą liczbę' },
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
            alt="Dziecko patrzące w górę na unoszące się w powietrzu wielkie, świecące cyfry"
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
          image={IMAGES.wieza}
          alt="Dziecko patrzące z zachwytem na bardzo wysoką wieżę z kolorowych klocków sięgającą chmur"
          lead="Zanim zaczniesz liczyć, poczuj skalę."
        >
          Poniższe liczby z życia pokażą, jak szybko liczby rosną — i dlaczego warto umieć je
          porównywać na pierwszy rzut oka.
        </LessonImageCard>
        <GiantNumbers color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="klasy">
        <PlaceValueBuilder color={color} onComplete={classes.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="czytanie">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="3"
          kicker="3 liczby do przeczytania"
          image={IMAGES.megafon}
          alt="Dziecko z megafonem ogłasza coś grupie słuchających dzieci"
        >
          Umiesz już budować liczby z cyfr. Teraz nauczysz się je{' '}
          <strong>czytać na głos</strong> — dokładnie tak, jakbyś ogłaszał je komuś, kto widzi
          tylko cyfry, a nie słyszy słów.
        </LessonImageCard>
        <ReadingSteps color={color} onComplete={reading.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.detektyw}
          alt="Dziecko z lupą przygląda się kolorowym klockom ułożonym w grupy"
        >
          <p>
            Czas na trening. Kilka zadań wraca do tej samej liczby — jak detektyw, przyjrzyj się
            jej cyfra po cyfrze, klasa po klasie.
          </p>
        </LessonImageCard>
        <PlaceValueDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="miasta">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.miasta}
          alt="Rząd kolorowych budynków miejskich, każdy oznaczony pinezką lokalizacji"
          reverse
          lead="Poniżej liczba mieszkańców sześciu polskich miast."
        >
          Dane orientacyjne. Wykorzystaj to, czego się nauczyłeś, żeby odpowiedzieć na pytania
          pod tabelą.
        </LessonImageCard>
        <PopulationChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: klasy w pięciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej w każdej kolejnej lekcji o liczbach naturalnych.
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

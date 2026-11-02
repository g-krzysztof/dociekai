'use client';

import Image from 'next/image';
import { ArrowLeftRight, CircleDot, Ruler, Target } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { SizeSense } from './size-sense';
import { RulerAlignmentLab } from './ruler-alignment-lab';
import { ReadingWalkthrough } from './reading-walkthrough';
import { MierzenieDrill } from './mierzenie-drill';
import { RulerMistakeHunt } from './ruler-mistake-hunt';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Jak duży jest milimetr?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'pomiar',
    kind: 'Nowe pojęcie',
    title: 'Zero na starcie, dopiero potem odczyt',
    time: '8 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy gotowe odczyty',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Zmierz i zamień na cm',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'sledztwo',
    kind: 'Zadanie problemowe',
    title: 'Który pomiar Kuby jest zły?',
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
    id: 'start-pomiaru',
    question: 'Od czego zawsze zaczynamy pomiar linijką?',
    options: [
      { id: 'a', text: 'Od fizycznego brzegu linijki' },
      { id: 'b', text: 'Od kreski 0' },
      { id: 'c', text: 'Od środka linijki' },
      { id: 'd', text: 'To bez znaczenia' },
    ],
    correctId: 'b',
    explanation: 'Kreska 0 wyznacza prawdziwy początek podziałki — brzeg linijki to nie zawsze to samo miejsce.',
  },
  {
    id: 'mm-w-cm',
    question: '10 mm to ile centymetrów?',
    options: [
      { id: 'a', text: '100 cm' },
      { id: 'b', text: '10 cm' },
      { id: 'c', text: '1 cm' },
      { id: 'd', text: '0,1 cm' },
    ],
    correctId: 'c',
    explanation: '1 cm dzieli się na 10 równych milimetrów — więc 10 mm to dokładnie 1 cm.',
  },
  {
    id: 'odejmowanie-odczytu',
    question: 'Odcinek zaczyna się na kresce 12 mm, a kończy na kresce 45 mm. Ile ma długości?',
    options: [
      { id: 'a', text: '33 mm' },
      { id: 'b', text: '57 mm' },
      { id: 'c', text: '45 mm' },
      { id: 'd', text: '12 mm' },
    ],
    correctId: 'a',
    explanation: 'Odcinek nie zaczyna się w zerze, więc trzeba odjąć: 45 mm − 12 mm = 33 mm.',
  },
  {
    id: 'zapis-62mm',
    question: '62 mm zapiszemy w cm i mm jako:',
    options: [
      { id: 'a', text: '6 cm 20 mm' },
      { id: 'b', text: '2 cm 6 mm' },
      { id: 'c', text: '62 cm' },
      { id: 'd', text: '6 cm 2 mm' },
    ],
    correctId: 'd',
    explanation: '62 mm to 6 pełnych dziesiątek (6 cm) i reszta 2 mm.',
  },
  {
    id: 'dokladnosc-1mm',
    question: 'Dlaczego mówimy o mierzeniu „z dokładnością do 1 mm"?',
    options: [
      { id: 'a', text: 'Bo milimetry są ładniejsze niż centymetry' },
      { id: 'b', text: 'Bo linijka ma kreski co 1 mm — dokładniej się nią nie zmierzy' },
      { id: 'c', text: 'Żeby unikać liczenia w centymetrach' },
      { id: 'd', text: 'Bo tak każe nauczyciel' },
    ],
    correctId: 'b',
    explanation: 'Podziałka linijki ma kreski co 1 mm — to najmniejsza jednostka, jaką nią realnie odczytasz.',
  },
  {
    id: 'dwa-konce',
    question: 'Które dwa punkty wyznaczają długość odcinka, którą mierzysz?',
    options: [
      { id: 'a', text: 'Środek i jeden koniec' },
      { id: 'b', text: 'Dowolne dwa punkty na linijce' },
      { id: 'c', text: 'Dwa końce odcinka' },
      { id: 'd', text: 'Tylko jeden punkt' },
    ],
    correctId: 'c',
    explanation: 'Długość odcinka to zawsze odległość między jego dwoma końcami — dokładnie to, co czytasz z podziałki.',
  },
];

const CHEAT_SHEET = [
  'Pomiar zawsze zaczynamy od kreski 0 — nie od fizycznego brzegu linijki.',
  '1 cm = 10 mm, więc milimetr to jedna dziesiąta centymetra.',
  'Odczyt to liczba mm przy końcu odcinka licząc od zera; jeśli zero nie stoi w punkcie startowym, odejmij.',
  'Zapis mieszany: pełne dziesiątki milimetrów to centymetry, reszta zostaje w mm (np. 62 mm = 6 cm 2 mm).',
  '„Dokładność do 1 mm" znaczy: dokładniej tą linijką się nie zmierzy — kreski są co 1 mm.',
  'Zanim odczytasz wynik, sprawdź, czy zero naprawdę stoi w punkcie startowym odcinka.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/mierzenie-odcinkow/linijka-pomiar.jpg',
  rozgrzewka: '/images/matematyka/lekcje/mierzenie-odcinkow/male-przedmioty.jpg',
  przyklady: '/images/matematyka/lekcje/mierzenie-odcinkow/dziecko-mierzy-linijka.jpg',
  trening: '/images/matematyka/lekcje/mierzenie-odcinkow/zeszyt-pomiary.jpg',
  sledztwo: '/images/matematyka/lekcje/mierzenie-odcinkow/stara-linijka-margines.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function MierzenieOdcinkowLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const measure = useStepDone('pomiar');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('trening');
  const investigation = useStepDone('sledztwo');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Znasz już punkty i odcinki, umiesz rysować proste prostopadłe i równoległe. Teraz czas
            wziąć do ręki linijkę i nauczyć się <strong>mierzyć odcinki</strong> naprawdę dokładnie —
            co do pojedynczego <strong>milimetra</strong>.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: CircleDot, text: 'Zero linijki = początek pomiaru' },
              { icon: Ruler, text: 'Kreski co 1 mm — to nasza dokładność' },
              { icon: ArrowLeftRight, text: '10 mm = 1 cm, zapis mieszany cm+mm' },
              { icon: Target, text: 'Gdy zero nie stoi w punkcie A — odejmujemy' },
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
            alt="Drewniana linijka leżąca obok krótkiej zielonej kredki na drewnianym blacie"
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
          alt="Cztery małe przedmioty różnej wielkości ułożone obok siebie: biedronka, guzik, spinacz i kredka"
          lead="Zanim sięgniesz po linijkę, poczuj skalę."
        >
          Uporządkuj cztery przedmioty od najmniejszego do największego — bez liczb, samą
          intuicją. Dopiero potem zobaczysz, ile naprawdę mają milimetrów.
        </LessonImageCard>
        <SizeSense color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="pomiar">
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Odcinek stoi w miejscu — to Ty przesuwasz linijkę. Chwyć ją i przeciągnij tak, żeby
          kreska 0 trafiła dokładnie w jego początek.
        </p>
        <RulerAlignmentLab color={color} onComplete={measure.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="3"
          kicker="3 gotowe odczyty"
          image={IMAGES.przyklady}
          alt="Dziecko pochylone nad stołem, mierzące liść drewnianą linijką"
        >
          Linijka jest już dobrze ustawiona — Twoje zadanie to tylko odczytać wynik i zamienić go
          na zapis w centymetrach i milimetrach.
        </LessonImageCard>
        <ReadingWalkthrough color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Otwarty zeszyt z linijką i narysowanymi odcinkami na blacie stołu"
        >
          <p>
            Czas na trening. Kilka zadań każe Ci odczytać długość — łącznie z tym podchwytliwym, w
            którym odcinek nie zaczyna się w zerze.
          </p>
        </LessonImageCard>
        <MierzenieDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="sledztwo">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.sledztwo}
          alt="Zbliżenie na starą, zniszczoną drewnianą linijkę z widocznym marginesem przed pierwszą kreską"
          reverse
          lead="Który pomiar Kuby jest zły?"
        >
          Stare linijki bywają podstępne — mają kawałek drewna, zanim zacznie się podziałka. Kuba
          o tym zapomniał. Znajdź, gdzie się pomylił.
        </LessonImageCard>
        <RulerMistakeHunt color={color} onComplete={investigation.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: mierzenie odcinków w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej w kolejnych lekcjach geometrii — przyda się przy obwodach i skali.
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

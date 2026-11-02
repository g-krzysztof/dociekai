'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, PenLine, SplitSquareHorizontal, Tag } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { ProblemUnpacker } from '../../problem-unpacker';
import { DiagramPicker } from './diagram-picker';
import { DiagramAudit } from './diagram-audit';
import { DiagramWorkedExamples } from './diagram-worked-examples';
import { buildDrillTasks } from './rysunek-pomocniczy-drill';
import { LIBRARY_PROBLEM, POOL_PROBLEM } from './rysunek-pomocniczy-problems';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Który rysunek pasuje do zadania?',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'definicje',
    kind: 'Nowe pojęcie',
    title: 'Zbuduj schemat krok po kroku',
    time: '9 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Dwa nowe zadania, dwa schematy',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Dokończ i rozpoznaj',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'basen',
    kind: 'Zadanie problemowe',
    title: 'Ilu pływaków na basenie?',
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
    id: 'co-to-rysunek',
    question: 'Co to jest rysunek pomocniczy?',
    options: [
      { id: 'a', text: 'Narzędzie, które porządkuje dane zadania i pokazuje potrzebne działanie' },
      { id: 'b', text: 'Inny sposób zapisania treści zadania słowo w słowo' },
      { id: 'c', text: 'Obrazek, który tylko upiększa zadanie' },
      { id: 'd', text: 'Coś, co rysuje się dopiero po obliczeniu wyniku' },
    ],
    correctId: 'a',
    explanation: 'Rysunek pomocniczy organizuje dane i pytanie, żeby było widać, jakie działanie pasuje — nie zastępuje myślenia, tylko je ułatwia.',
  },
  {
    id: 'ktore-rownymi-grupami',
    question: 'Które zadanie najlepiej pokażesz modelem belkowym z równymi grupami?',
    options: [
      { id: 'a', text: 'O ile dni dłuższy jest lipiec od czerwca' },
      { id: 'b', text: 'Ile waży w sumie 6 jednakowych paczek po 3 kg' },
      { id: 'c', text: 'Jaki obwód ma trójkąt o bokach 4, 5 i 6 cm' },
      { id: 'd', text: 'O której skończy się film, jeśli zaczął się o 18:40 i trwa 100 minut' },
    ],
    correctId: 'b',
    explanation: '6 paczek po 3 kg to klasyczne równe grupy — dokładnie do tego służy model belkowy równych grup.',
  },
  {
    id: 'ktory-schemat-pasuje',
    question: "Zadanie: „W sklepie było 80 jabłek. Sprzedano 35. Ile zostało?” Który schemat pasuje?",
    options: [
      { id: 'a', text: 'Całość 35, znana część 80' },
      { id: 'b', text: 'Dwie równe grupy po 40' },
      { id: 'c', text: 'Całość 80, znana część 35, szukana część' },
      { id: 'd', text: 'Trzy grupy po 35' },
    ],
    correctId: 'c',
    explanation: '80 jabłek to całość, 35 sprzedanych to znana część — brakującą (zostałe) liczysz odejmowaniem.',
  },
  {
    id: 'babcia-wiek',
    question: "Liczba w zdaniu „Babcia ma 68 lat”, w zadaniu o zakupach na urodziny, to zwykle...",
    options: [
      { id: 'a', text: 'Dana potrzebna do sumy' },
      { id: 'b', text: 'Szukany wynik zadania' },
      { id: 'c', text: 'Liczba do pomnożenia' },
      { id: 'd', text: 'Podpucha — liczba niepotrzebna do obliczeń' },
    ],
    correctId: 'd',
    explanation: 'Wiek babci nie ma związku z pytaniem o zakupy — to typowa podpucha, którą rysunek pomocniczy pomija.',
  },
  {
    id: 'kiedy-najbardziej-pomaga',
    question: 'Rysunek pomocniczy pomaga NAJBARDZIEJ, gdy...',
    options: [
      { id: 'a', text: 'Zadanie ma dużo danych i trzeba je uporządkować' },
      { id: 'b', text: 'Zadanie ma tylko jedną liczbę' },
      { id: 'c', text: 'Zadanie jest bardzo krótkie' },
      { id: 'd', text: 'Trzeba coś narysować na ocenę' },
    ],
    correctId: 'a',
    explanation: 'Im więcej danych i im łatwiej się pomylić, tym więcej daje uporządkowanie ich na rysunku.',
  },
  {
    id: 'pierwszy-krok',
    question: 'Jaki jest pierwszy krok strategii z tej lekcji?',
    options: [
      { id: 'a', text: 'Obliczyć wynik' },
      { id: 'b', text: 'Przeczytać uważnie treść zadania' },
      { id: 'c', text: 'Narysować schemat' },
      { id: 'd', text: 'Sprawdzić odpowiedź w kluczu' },
    ],
    correctId: 'b',
    explanation: 'Zanim cokolwiek narysujesz, musisz wiedzieć, co dokładnie zadanie mówi i o co pyta.',
  },
];

const CHEAT_SHEET = [
  'Rysunek pomocniczy porządkuje dane i pytanie — nie liczy za ciebie.',
  'Model belkowy pasuje do „część + część = całość” i do równych grup.',
  'Oś liczbowa pasuje do skoków wzdłuż skali — czasu, temperatury, odległości.',
  'Zwykły szkic pasuje do kształtów i sytuacji przestrzennych.',
  'Nie każda liczba w treści jest potrzebna — sprawdź, czy odpowiada na pytanie.',
  'Zawsze zacznij od uważnego przeczytania, zanim zaczniesz rysować.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/rysunek-pomocniczy/zeszyt-z-narysowanym-schematem.jpg',
  rozgrzewka: '/images/matematyka/lekcje/rysunek-pomocniczy/przybory-do-rysowania-na-biurku.jpg',
  definicje: '/images/matematyka/lekcje/rysunek-pomocniczy/dziecko-rysuje-schemat-w-zeszycie.jpg',
  przyklady: '/images/matematyka/lekcje/rysunek-pomocniczy/dwa-rozne-schematy-w-zeszycie.jpg',
  trening: '/images/matematyka/lekcje/rysunek-pomocniczy/biurko-z-zeszytem-i-olowkiem.jpg',
  basen: '/images/matematyka/lekcje/rysunek-pomocniczy/dzieci-plywajace-na-torach-basenu.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function RysunekPomocniczyLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const poolCase = useStepDone('basen');
  const quiz = useStepDone('quiz');
  const [demoSolved, setDemoSolved] = useState(false);

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Długie zadanie tekstowe potrafi przytłoczyć samą ilością liczb. Rysunek pomocniczy to
            strategia, nie ozdoba — porządkuje dane i pytanie tak, żeby od razu było widać, jakie
            działanie policzyć.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Eye, text: 'Przeczytaj uważnie — zanim zaczniesz rysować' },
              { icon: Tag, text: 'Wypisz dane i pytanie, pomiń podpuchy' },
              { icon: SplitSquareHorizontal, text: 'Model belkowy, oś liczbowa albo szkic' },
              { icon: PenLine, text: 'Rysunek pokazuje działanie — nie liczy za ciebie' },
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
            alt="Otwarty zeszyt z narysowanym prostym schematem obok ołówka"
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
          alt="Przybory do rysowania — linijka, kredki i kartka w kratkę — ułożone na biurku"
          lead="Nie każdy rysunek pasuje do każdego zadania."
        >
          Zanim zaczniesz liczyć, zdecyduj, jaki rodzaj rysunku najlepiej pokaże to, o co pyta
          zadanie.
        </LessonImageCard>
        <DiagramPicker color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="definicje">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.definicje}
          alt="Dziecko rysujące prosty schemat w zeszycie podczas rozwiązywania zadania"
        >
          <p>
            Kliknij dane i pytanie w zdaniu poniżej — uważaj na liczbę, która nic nie wnosi do
            obliczeń. Schemat belkowy zbuduje się sam, gdy skompletujesz wszystko, czego potrzeba.
          </p>
        </LessonImageCard>
        <ProblemUnpacker problem={LIBRARY_PROBLEM} color={color} mode="solve" onComplete={() => setDemoSolved(true)} />

        {demoSolved && (
          <div className="mt-6">
            <p className="mb-4 text-sm font-semibold leading-relaxed sm:text-base">
              Teraz odwrotnie — dla nowych zadań wybierz, który z trzech narysowanych schematów
              naprawdę pasuje do treści.
            </p>
            <DiagramAudit color={color} onComplete={concept.markStepDone} />
          </div>
        )}
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="2×"
          kicker="Dwa zadania, dwa schematy"
          image={IMAGES.przyklady}
          alt="Zeszyt z dwoma różnymi narysowanymi schematami obok siebie"
        >
          Piórnik z przyborami i tace ciastek — jedno to suma części, drugie to równe grupy.
        </LessonImageCard>
        <DiagramWorkedExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Biurko z otwartym zeszytem, ołówkiem i gumką"
          reverse
        >
          <p>Czas samodzielnie dokańczać schematy i rozpoznawać, który rysunek do czego pasuje.</p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="basen">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.basen}
          alt="Dzieci pływające na wydzielonych torach basenu"
          reverse
          lead="Cała strategia naraz — od czytania po wynik."
        >
          Przeczytaj, wyłap dane i pytanie, pomiń podpuchę, a schemat sam pokaże działanie.
        </LessonImageCard>
        <ProblemUnpacker problem={POOL_PROBLEM} color={color} mode="solve" onComplete={poolCase.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: rysunek pomocniczy w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">Wracaj do niej w kolejnych lekcjach — także spoza geometrii.</p>
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

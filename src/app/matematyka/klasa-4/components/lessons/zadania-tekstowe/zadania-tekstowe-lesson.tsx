'use client';

import Image from 'next/image';
import { AlertTriangle, BookOpen, Ruler, Workflow } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { SpotTheQuestionWarmup } from './spot-the-question-warmup';
import { ReadingStrategyLab } from './reading-strategy-lab';
import { WordProblemExamples } from './word-problem-examples';
import { WordProblemDrill } from './word-problem-drill';
import { KiermaszChallenge } from './kiermasz-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Co jest dane, a o co pytamy?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Zamień zdanie w schemat',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy zadania na równe grupy',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz rozwiązywanie zadań',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'kiermasz',
    kind: 'Zadanie problemowe',
    title: 'Ile zostało kawałków ciasta?',
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
    id: 'basia-kasia',
    question:
      'W zadaniu: „Basia ma 45 zł, a Kasia ma o 12 zł mniej. Ile pieniędzy ma Kasia?” — co jest tu pytaniem?',
    options: [
      { id: 'a', text: 'Basia ma 45 zł' },
      { id: 'b', text: 'Kasia ma o 12 zł mniej' },
      { id: 'c', text: 'Ile pieniędzy ma Kasia' },
      { id: 'd', text: 'Ile pieniędzy mają razem' },
    ],
    correctId: 'c',
    explanation: 'Pytanie to zdanie kończące się znakiem zapytania — reszta zdań to dane.',
  },
  {
    id: 'zeszyty',
    question: 'Sklep miał 340 zeszytów. Sprzedał 128. Ile zeszytów zostało?',
    options: [
      { id: 'a', text: '228' },
      { id: 'b', text: '212' },
      { id: 'c', text: '468' },
      { id: 'd', text: '202' },
    ],
    correctId: 'b',
    explanation:
      'Znasz całość (340) i jedną część (128) — brakującą część liczysz odejmowaniem: 340 − 128 = 212.',
  },
  {
    id: 'pinezki',
    question: '5 pudełek zawiera po 60 pinezek. Ile pinezek jest w sumie?',
    options: [
      { id: 'a', text: '65' },
      { id: 'b', text: '320' },
      { id: 'c', text: '250' },
      { id: 'd', text: '300' },
    ],
    correctId: 'd',
    explanation: 'Pięć równych grup po 60 sztuk — to mnożenie: 5 × 60 = 300.',
  },
  {
    id: 'ola-brat',
    question: 'Ola ma 32 naklejki. Jej brat ma 9 lat. Ile naklejek ma Ola więcej niż jej brat?',
    options: [
      { id: 'a', text: 'Nie da się obliczyć — nie wiemy, ile naklejek ma brat' },
      { id: 'b', text: '23' },
      { id: 'c', text: '41' },
      { id: 'd', text: '9' },
    ],
    correctId: 'a',
    explanation:
      'Wiek brata (9 lat) to nie liczba jego naklejek — bez tej informacji różnicy nie da się policzyć.',
  },
  {
    id: 'pierwszy-krok',
    question: 'Który krok warto wykonać jako pierwszy, rozwiązując zadanie tekstowe?',
    options: [
      { id: 'a', text: 'Od razu dodać wszystkie liczby z treści' },
      { id: 'b', text: 'Przeczytać uważnie i ustalić, co jest dane, a co jest pytaniem' },
      { id: 'c', text: 'Zgadnąć wynik' },
      { id: 'd', text: 'Pominąć trudniejsze zdania' },
    ],
    correctId: 'b',
    explanation:
      'Bez ustalenia, co jest dane, a o co pytamy, łatwo policzyć coś zupełnie innego niż trzeba.',
  },
  {
    id: 'po-obliczeniu',
    question: 'Po obliczeniu wyniku najlepiej...',
    options: [
      { id: 'a', text: 'sprawdzić, czy wynik ma sens, np. przez szacowanie' },
      { id: 'b', text: 'od razu zapomnieć o zadaniu' },
      { id: 'c', text: 'zmienić pytanie na łatwiejsze' },
      { id: 'd', text: 'pomnożyć wynik przez 2 na wszelki wypadek' },
    ],
    correctId: 'a',
    explanation:
      'Szybki szacunek pokazuje, czy dokładny wynik w ogóle ma sens — dokładnie jak w poprzedniej lekcji.',
  },
];

const CHEAT_SHEET = [
  'Przeczytaj zadanie uważnie, czasem dwa razy — nie wszystkie liczby w tekście są potrzebne do obliczeń.',
  'Wypisz dane (liczby, które znasz) i pytanie (o co dokładnie pytasz).',
  'Narysuj prosty schemat — pokaże, czy liczby się łączą, czy jedna wynika z drugiej.',
  'Zapisz działanie, oblicz wynik i sprawdź, czy ma sens — np. przez szacowanie.',
  'Jeśli w zadaniu brakuje potrzebnej informacji, uczciwa odpowiedź brzmi: nie da się obliczyć.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/zadania-tekstowe/zeszyt-ze-schematem.jpg',
  rozgrzewka: '/images/matematyka/lekcje/zadania-tekstowe/dziewczynka-czyta-zdanie.jpg',
  nowePojecie: '/images/matematyka/lekcje/zadania-tekstowe/tablica-ze-schematem.jpg',
  przyklady: '/images/matematyka/lekcje/zadania-tekstowe/chlopiec-skrzynki-jablek.jpg',
  kiermasz: '/images/matematyka/lekcje/zadania-tekstowe/stol-kiermaszowy.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ZadaniaTekstoweLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const concept = useStepDone('nowe-pojecie');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('trening');
  const problem = useStepDone('kiermasz');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Zadanie tekstowe to nie loteria liczb do dodania. Masz gotową metodę: przeczytaj, znajdź{' '}
            <strong>dane</strong> i <strong>pytanie</strong>, zamień je w prosty{' '}
            <strong>schemat</strong> — i dopiero wtedy licz.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: BookOpen, text: 'Nie każda liczba w treści jest potrzebna' },
              { icon: Workflow, text: 'Schemat pokazuje, jakie działanie policzyć' },
              { icon: Ruler, text: 'Ta sama metoda działa dla wszystkich czterech działań' },
              { icon: AlertTriangle, text: 'Czasem uczciwa odpowiedź to: brakuje danych' },
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
            alt="Otwarty zeszyt z odręcznie narysowanym schematem belkowym, lupa i ołówek obok"
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
          variant="basic"
          color={color}
          image={IMAGES.rozgrzewka}
          alt="Dziewczynka z rudymi, kręconymi włosami wskazująca palcem zdanie w otwartej książce, z zaciekawioną miną"
        >
          <p>Zanim zaczniesz liczyć, sprawdź, czy potrafisz wyłowić z tekstu dwie rzeczy.</p>
        </LessonImageCard>
        <SpotTheQuestionWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Tablica szkolna z odręcznie narysowanym schematem belkowym i strzałką, kolorowe kredy obok"
          lead="Zdanie zamienia się w rysunek — a rysunek podpowiada, jakie działanie policzyć."
        >
          Cztery kroki, jedna metoda — działa dla dodawania, odejmowania, mnożenia i dzielenia.
        </LessonImageCard>
        <ReadingStrategyLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="13"
          image={IMAGES.przyklady}
          kicker="3 zadania, jedna struktura"
          alt="Chłopiec z czarnymi włosami układający drewniane skrzynki z jabłkami w równych rzędach"
        >
          Mnożenie i dwa warianty dzielenia — ta sama struktura równych grup, inne pytanie.
        </LessonImageCard>
        <WordProblemExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <WordProblemDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="kiermasz">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kiermasz}
          alt="Stół szkolnego kiermaszu z tacami pokrojonego ciasta i słoikiem na monety"
          reverse
          lead="Upiecz, sprzedaj, policz resztę — i sprawdź wynik szacunkiem z poprzedniej lekcji."
        >
          Dwuetapowe zadanie o klasowym kiermaszu ciast na wycieczkę do muzeum.
        </LessonImageCard>
        <KiermaszChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: jak rozwiązywać zadania tekstowe</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama metoda działa niezależnie od tego, jakie działanie kryje się w zadaniu.
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

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CalendarClock, ClipboardList, Hash, Ruler } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ResultSummary, type DiagnosticDomain } from './result-summary';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { img } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'start',
    kind: 'Rozgrzewka',
    title: 'Zanim zaczniesz — jak działa ten test',
    time: '1 min',
    icon: 'Sparkles',
  },
  {
    id: 'dzialania',
    kind: 'Sprawdzian 1',
    title: 'Dodawanie i odejmowanie do 1000',
    time: '4 min',
    icon: 'Hash',
  },
  {
    id: 'mnozenie',
    kind: 'Sprawdzian 2',
    title: 'Tabliczka mnożenia i dzielenia',
    time: '4 min',
    icon: 'Grid3x3',
  },
  {
    id: 'geometria',
    kind: 'Sprawdzian 3',
    title: 'Figury i podstawy geometrii',
    time: '4 min',
    icon: 'Shapes',
  },
  {
    id: 'czas-pieniadze',
    kind: 'Sprawdzian 4',
    title: 'Zegar i pieniądze',
    time: '5 min',
    icon: 'Coins',
  },
  {
    id: 'wynik',
    kind: 'Wynik',
    title: 'Twój wynik i co dalej',
    time: '2 min',
    icon: 'Trophy',
  },
];

const DOMAINS: DiagnosticDomain[] = [
  {
    id: 'dzialania',
    label: 'Dodawanie i odejmowanie do 1000',
    icon: 'Hash',
    recommendedHref: '/matematyka/klasa-4/liczby-naturalne',
    recommendedLabel: 'Moduł 1: Liczby naturalne',
  },
  {
    id: 'mnozenie',
    label: 'Tabliczka mnożenia i dzielenia',
    icon: 'Grid3x3',
    recommendedHref: '/matematyka/klasa-4/liczby-naturalne',
    recommendedLabel: 'Moduł 1: Liczby naturalne',
  },
  {
    id: 'geometria',
    label: 'Figury i podstawy geometrii',
    icon: 'Shapes',
    recommendedHref: '/matematyka/klasa-4/geometria',
    recommendedLabel: 'Moduł 4: Geometria',
  },
  {
    id: 'czas-pieniadze',
    label: 'Zegar i pieniądze',
    icon: 'Coins',
    recommendedHref: '/matematyka/klasa-4/obliczenia-praktyczne',
    recommendedLabel: 'Moduł 2: Obliczenia praktyczne',
  },
];

const DZIALANIA_TASKS: DiagnosticTask[] = [
  {
    id: 'dodawanie-1',
    prompt: '245 + 138 =',
    type: 'input',
    answer: '383',
    explanation: '245 + 138 = 383. Dodaj jedności, dziesiątki i setki osobno, a potem zsumuj wyniki.',
  },
  {
    id: 'odejmowanie-1',
    prompt: '507 − 259 =',
    type: 'input',
    answer: '248',
    explanation: '507 − 259 = 248. Gdy cyfra na górze jest mniejsza, pożyczasz dziesiątkę z sąsiedniej kolumny.',
  },
  {
    id: 'dodawanie-2',
    prompt: '364 + 297 =',
    type: 'input',
    answer: '661',
    explanation: '364 + 297 = 661. Możesz też zaokrąglić 297 do 300, dodać i odjąć 3 na końcu.',
  },
  {
    id: 'odejmowanie-2',
    prompt: '900 − 456 =',
    type: 'input',
    answer: '444',
    explanation: '900 − 456 = 444. Przy zerach pożyczanie idzie „łańcuszkiem” przez kolejne kolumny.',
  },
  {
    id: 'zadanie-jablka',
    prompt: 'W sklepie było 850 jabłek. Sprzedano 375. Ile zostało?',
    type: 'input',
    answer: '475',
    explanation: '850 − 375 = 475 jabłek. To zwykłe odejmowanie ukryte w treści zadania.',
  },
];

const MNOZENIE_TASKS: DiagnosticTask[] = [
  {
    id: 'mnozenie-1',
    prompt: '7 × 8 =',
    type: 'input',
    answer: '56',
    explanation: '7 × 8 = 56. Jeśli zapomnisz, dolicz jedno 7 do 6 × 8 = 48.',
  },
  {
    id: 'mnozenie-2',
    prompt: '9 × 6 =',
    type: 'input',
    answer: '54',
    explanation: '9 × 6 = 54. Sztuczka na 9: 10 × 6 = 60, odejmij jedno 6 → 54.',
  },
  {
    id: 'dzielenie-1',
    prompt: '72 : 8 =',
    type: 'input',
    answer: '9',
    explanation: '72 : 8 = 9, bo 8 × 9 = 72. Dzielenie to odwrotność mnożenia.',
  },
  {
    id: 'mnozenie-3',
    prompt: '6 × 7 =',
    type: 'input',
    answer: '42',
    explanation: '6 × 7 = 42. To jedna z tych par, którą warto znać na pamięć — wraca bardzo często.',
  },
  {
    id: 'zadanie-czekolada',
    prompt: 'Tabliczka czekolady ma 4 rzędy po 6 kawałków. Ile kawałków ma cała tabliczka?',
    type: 'input',
    answer: '24',
    explanation: '4 × 6 = 24 kawałki. Rzędy razy kawałki w rzędzie — klasyczne mnożenie.',
  },
];

const GEOMETRIA_TASKS: DiagnosticTask[] = [
  {
    id: 'kwadrat',
    prompt: 'Figura ma 4 równe boki i 4 kąty proste. Jak się nazywa?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Prostokąt' },
      { id: 'b', text: 'Romb' },
      { id: 'c', text: 'Trójkąt' },
      { id: 'd', text: 'Kwadrat' },
    ],
    correctId: 'd',
    explanation: 'To kwadrat — prostokąt ma równe tylko przeciwległe boki, a nie wszystkie cztery.',
  },
  {
    id: 'trojkat-boki',
    prompt: 'Ile boków ma trójkąt?',
    type: 'choice',
    options: [
      { id: 'a', text: '2' },
      { id: 'b', text: '4' },
      { id: 'c', text: '3' },
      { id: 'd', text: '5' },
    ],
    correctId: 'c',
    explanation: 'Trójkąt ma 3 boki i 3 kąty — to najmniejsza możliwa liczba boków wielokąta.',
  },
  {
    id: 'kat-prosty',
    prompt: 'Kąt prosty ma:',
    type: 'choice',
    options: [
      { id: 'a', text: '90°' },
      { id: 'b', text: '45°' },
      { id: 'c', text: '180°' },
      { id: 'd', text: '360°' },
    ],
    correctId: 'a',
    explanation: 'Kąt prosty to dokładnie 90° — tyle, ile ma róg kartki papieru.',
  },
  {
    id: 'obwod',
    prompt: 'Prostokąt ma boki 5 cm i 3 cm. Ile wynosi jego obwód?',
    type: 'input',
    answer: '16',
    unit: 'cm',
    explanation: 'Obwód to suma wszystkich boków: 5 + 3 + 5 + 3 = 16 cm.',
  },
  {
    id: 'kolo',
    prompt:
      'Wszystkie punkty na brzegu tej figury są w tej samej odległości od środka. To jest:',
    type: 'choice',
    options: [
      { id: 'a', text: 'Koło' },
      { id: 'b', text: 'Kwadrat' },
      { id: 'c', text: 'Trójkąt' },
      { id: 'd', text: 'Prostokąt' },
    ],
    correctId: 'a',
    explanation: 'To koło — ta stała odległość od środka do brzegu to promień.',
  },
];

const CZAS_PIENIADZE_TASKS: DiagnosticTask[] = [
  {
    id: 'godzina-minuty',
    prompt: 'Ile minut ma jedna godzina?',
    type: 'input',
    answer: '60',
    unit: 'min',
    explanation: 'Godzina ma 60 minut — to podstawa wszystkich obliczeń zegarowych.',
  },
  {
    id: 'koniec-lekcji',
    prompt: 'Lekcja zaczęła się o 8:15 i trwała 45 minut. O której się skończyła?',
    type: 'choice',
    options: [
      { id: 'a', text: '8:45' },
      { id: 'b', text: '9:15' },
      { id: 'c', text: '9:00' },
      { id: 'd', text: '8:60' },
    ],
    correctId: 'c',
    explanation: '8:15 + 45 minut = 9:00. Do pełnej godziny brakowało 45 minut, więc trafiasz idealnie w 9:00.',
  },
  {
    id: 'reszta',
    prompt: 'Masz 5 zł. Bułka kosztuje 2 zł 40 gr. Ile wynosi reszta?',
    type: 'choice',
    options: [
      { id: 'a', text: '2 zł 40 gr' },
      { id: 'b', text: '3 zł 60 gr' },
      { id: 'c', text: '2 zł 50 gr' },
      { id: 'd', text: '2 zł 60 gr' },
    ],
    correctId: 'd',
    explanation: '5,00 zł − 2,40 zł = 2,60 zł, czyli 2 zł 60 gr reszty.',
  },
  {
    id: 'grosze',
    prompt: 'Ile groszy to 1 złoty?',
    type: 'input',
    answer: '100',
    unit: 'gr',
    explanation: '1 złoty to 100 groszy — tak samo jak 1 metr to 100 centymetrów.',
  },
  {
    id: 'koniec-filmu',
    prompt: 'Film trwa 1 godzinę 20 minut i zaczyna się o 16:50. O której się skończy?',
    type: 'choice',
    options: [
      { id: 'a', text: '17:70' },
      { id: 'b', text: '18:10' },
      { id: 'c', text: '18:20' },
      { id: 'd', text: '17:10' },
    ],
    correctId: 'b',
    explanation: '16:50 + 10 minut = 17:00, zostaje jeszcze 1 godzina 10 minut, więc film skończy się o 18:10.',
  },
];

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

const HERO_IMAGE = img('/images/matematyka/lekcje/test-diagnostyczny/start.jpg');

export function TestDiagnostycznyLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

type Scores = Partial<Record<string, { score: number; total: number }>>;

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const start = useStepDone('start');
  const dzialania = useStepDone('dzialania');
  const mnozenie = useStepDone('mnozenie');
  const geometria = useStepDone('geometria');
  const czasPieniadze = useStepDone('czas-pieniadze');
  const wynik = useStepDone('wynik');

  const [scores, setScores] = useState<Scores>({});

  const recordScore = (id: string) => (score: number, total: number) =>
    setScores((prev) => ({ ...prev, [id]: { score, total } }));

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            To nie klasówka — nikt nie stawia tu ocen. Ten test pokazuje, co z klas I–III{' '}
            <strong>pamiętasz świetnie</strong>, a co warto sobie przypomnieć, zanim ruszycie z
            modułem 1. Cztery krótkie sprawdziany, każdy z natychmiastową odpowiedzią.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Hash, text: 'Dodawanie i odejmowanie do 1000' },
              { icon: ClipboardList, text: 'Tabliczka mnożenia i dzielenia' },
              { icon: Ruler, text: 'Figury i podstawy geometrii' },
              { icon: CalendarClock, text: 'Zegar i pieniądze' },
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
            src={HERO_IMAGE}
            alt="Dziecko rozwiązujące test diagnostyczny otoczone symbolami: liczbami, linijką, zegarem i monetą"
            width={240}
            height={240}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* 1. Rozgrzewka */}
      <LessonSection id="start">
        <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
          <p className="mb-4 text-sm leading-relaxed sm:text-base">
            Za chwilę zobaczysz cztery krótkie sprawdziany po 4–5 zadań. Po każdej odpowiedzi od
            razu dowiesz się, czy jest dobrze — i dlaczego, jeśli nie jest. Na końcu zobaczysz
            swój wynik z każdego tematu i podpowiedź, co warto powtórzyć na start.
          </p>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Nie licz na kalkulatorze — chodzi o to, żeby sprawdzić, co naprawdę pamiętasz.
          </p>
          {!start.done ? (
            <button
              type="button"
              onClick={start.markStepDone}
              className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: color }}
            >
              Zaczynam!
            </button>
          ) : (
            <p className="text-sm font-semibold" style={{ color }}>
              Świetnie, jedziemy dalej ↓
            </p>
          )}
        </div>
      </LessonSection>

      {/* 2. Działania do 1000 */}
      <LessonSection id="dzialania">
        <DiagnosticQuiz
          tasks={DZIALANIA_TASKS}
          color={color}
          onFinish={(score, total) => {
            recordScore('dzialania')(score, total);
            dzialania.markStepDone();
          }}
        />
      </LessonSection>

      {/* 3. Tabliczka mnożenia */}
      <LessonSection id="mnozenie">
        <DiagnosticQuiz
          tasks={MNOZENIE_TASKS}
          color={color}
          onFinish={(score, total) => {
            recordScore('mnozenie')(score, total);
            mnozenie.markStepDone();
          }}
        />
      </LessonSection>

      {/* 4. Geometria */}
      <LessonSection id="geometria">
        <DiagnosticQuiz
          tasks={GEOMETRIA_TASKS}
          color={color}
          onFinish={(score, total) => {
            recordScore('geometria')(score, total);
            geometria.markStepDone();
          }}
        />
      </LessonSection>

      {/* 5. Zegar i pieniądze */}
      <LessonSection id="czas-pieniadze">
        <DiagnosticQuiz
          tasks={CZAS_PIENIADZE_TASKS}
          color={color}
          onFinish={(score, total) => {
            recordScore('czas-pieniadze')(score, total);
            czasPieniadze.markStepDone();
          }}
        />
      </LessonSection>

      {/* 6. Wynik */}
      <LessonSection id="wynik">
        <ResultSummary domains={DOMAINS} scores={scores} color={color} onComplete={wynik.markStepDone} />
      </LessonSection>

    </>
  );
}

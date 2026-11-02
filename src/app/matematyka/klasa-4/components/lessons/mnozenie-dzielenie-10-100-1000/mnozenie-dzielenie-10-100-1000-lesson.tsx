'use client';

import Image from 'next/image';
import { Divide, MoveHorizontal, Repeat, X as Multiply } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { ZeroSensDuel } from './zero-sens-duel';
import { PlaceShiftLab } from './place-shift-lab';
import { ShiftExamples } from './shift-examples';
import { ShiftDrill } from './shift-drill';
import { CandyWarehouseChallenge } from './candy-warehouse-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Które działanie da większy wynik?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Przesuń cyfry o rząd wielkości',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Dopisz albo skreśl zera',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz regułę',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'cukierki',
    kind: 'Zadanie problemowe',
    title: 'Hurtownia cukierków',
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
    id: 'jak-dziala-razy-10',
    question: 'Jak zmienia się zapis liczby, gdy mnożysz ją przez 10?',
    options: [
      { id: 'a', text: 'Dodajesz cyfrę 1 z lewej strony' },
      { id: 'b', text: 'Dopisujesz jedno zero z prawej strony' },
      { id: 'c', text: 'Liczba zmniejsza się o 10' },
      { id: 'd', text: 'Nic się nie zmienia' },
    ],
    correctId: 'b',
    explanation: 'Mnożenie przez 10 przesuwa każdą cyfrę o jedno miejsce w lewo, a puste miejsce z prawej wypełnia zero.',
  },
  {
    id: 'oblicz-230x100',
    question: '230 × 100 = ?',
    options: [
      { id: 'a', text: '2300' },
      { id: 'b', text: '230100' },
      { id: 'c', text: '23000' },
      { id: 'd', text: '2300000' },
    ],
    correctId: 'c',
    explanation: 'Mnożenie przez 100 dopisuje dwa zera: 230 → 23000.',
  },
  {
    id: 'oblicz-4000-1000',
    question: '4000 : 1000 = ?',
    options: [
      { id: 'a', text: '400' },
      { id: 'b', text: '40' },
      { id: 'c', text: '4000' },
      { id: 'd', text: '4' },
    ],
    correctId: 'd',
    explanation: 'Dzielenie przez 1000 skreśla trzy zera z końca: 4000 → 4.',
  },
  {
    id: 'ktore-nie-wyjdzie',
    question: 'Które z tych dzieleń NIE wyjdzie bez reszty?',
    options: [
      { id: 'a', text: '600 : 100' },
      { id: 'b', text: '450 : 100' },
      { id: 'c', text: '800 : 100' },
      { id: 'd', text: '90 : 10' },
    ],
    correctId: 'b',
    explanation: '450 ma na końcu tylko jedno zero, a do podzielenia przez 100 trzeba dwóch — jedyne z tych czterech, które nie wyjdzie w całości.',
  },
  {
    id: 'oblicz-7x1000',
    question: '7 × 1000 = ?',
    options: [
      { id: 'a', text: '7000' },
      { id: 'b', text: '700' },
      { id: 'c', text: '70000' },
      { id: 'd', text: '70' },
    ],
    correctId: 'a',
    explanation: 'Mnożenie przez 1000 to trzy przesunięcia naraz — dopisujesz trzy zera: 7 → 7000.',
  },
];

const CHEAT_SHEET = [
  'Mnożenie przez 10, 100, 1000 przesuwa każdą cyfrę o 1, 2 albo 3 miejsca w lewo — z prawej dopisujesz tyle samo zer.',
  'Dzielenie przez 10, 100, 1000 robi dokładnie odwrotnie — skreślasz tyle zer z końca liczby.',
  'Dzielenie wychodzi bez reszty tylko wtedy, gdy liczba ma na końcu wystarczająco dużo zer.',
  '450 : 100 się nie da (tylko jedno zero), ale 450 : 10 = 45 (jedno zero wystarczy).',
  'To ten sam trik, którego używa cały system metryczny: kilogram, kilometr, milimetr — wszystko przelicza się przez 10, 100 albo 1000.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/mnozenie-dzielenie-10-100-1000/wieze-klockow.jpg',
  rozgrzewka: '/images/matematyka/lekcje/mnozenie-dzielenie-10-100-1000/dziewczynka-szacuje.jpg',
  nowePojecie: '/images/matematyka/lekcje/mnozenie-dzielenie-10-100-1000/wieze-monet.jpg',
  przyklady: '/images/matematyka/lekcje/mnozenie-dzielenie-10-100-1000/chlopiec-liczy-zera.jpg',
  cukierki: '/images/matematyka/lekcje/mnozenie-dzielenie-10-100-1000/magazyn-cukierkow.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function MnozenieDzielenie101001000Lesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('cukierki');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Znasz już tabliczkę mnożenia — teraz nauczysz się mnożyć i dzielić przez 10, 100 i 1000{' '}
            <strong>bez żadnego liczenia w pamięci</strong>. Wystarczy zobaczyć, co dzieje się z
            cyframi, gdy przesuwają się o jedno, dwa albo trzy miejsca.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Multiply, text: 'Dlaczego mnożenie przez 10 to dopisanie jednego zera' },
              { icon: Divide, text: 'Dlaczego dzielenie robi dokładnie odwrotnie' },
              { icon: MoveHorizontal, text: 'Jak wygląda to samo na planszy rzędów wielkości' },
              { icon: Repeat, text: 'Kiedy dzielenie NIE wyjdzie bez reszty' },
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
            alt="Drewniane wieże z klocków, każda kolejna dziesięć razy wyższa od poprzedniej"
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
          alt="Dziewczynka zastanawiająca się nad wynikiem, z ręką przy głowie"
        >
          <p>
            Zanim poznasz regułę, sprawdź wyczucie — bez liczenia na kartce, które działanie da
            większy wynik?
          </p>
        </LessonImageCard>
        <ZeroSensDuel color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Trzy wieże monet: pojedyncze grosze, wieża dziesięć razy wyższa i wieża sto razy wyższa"
          lead="Przesuń suwak i zobacz, jak cyfry same się przestawiają."
        >
          Wybierz liczbę, pociągnij suwak od ÷1000 do ×1000 i obserwuj planszę rzędów wielkości.
        </LessonImageCard>
        <PlaceShiftLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 przykłady, jedna reguła"
          alt="Chłopiec liczący na palcach liczbę zer w wyniku mnożenia"
        >
          Trzy przykłady pokazują regułę, a czwarty pokazuje jej granicę — nie każde dzielenie
          wyjdzie bez reszty.
        </LessonImageCard>
        <ShiftExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <ShiftDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="cukierki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.cukierki}
          alt="Regały w magazynie cukierków, od pojedynczych sztuk po palety pełne pudeł"
          reverse
          lead="Hurtownia cukierków: każde opakowanie jest dziesięć razy większe od poprzedniego."
        >
          Wykorzystaj to, czego się nauczyłeś, żeby policzyć zamówienia z magazynu.
        </LessonImageCard>
        <CandyWarehouseChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: mnożenie i dzielenie przez 10, 100, 1000</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama reguła działa niezależnie od tego, jak duża jest liczba.
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

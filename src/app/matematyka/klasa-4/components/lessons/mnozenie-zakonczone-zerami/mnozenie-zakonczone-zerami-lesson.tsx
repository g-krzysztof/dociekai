'use client';

import Image from 'next/image';
import { Layers3, PenLine, Scissors, SquareStack } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { ZeroCountWarmup } from './zero-count-warmup';
import { ZeroPeelLab } from './zero-peel-lab';
import { ZakonczoneZeramiPrzyklady } from './zakonczone-zerami-przyklady';
import { ZakonczoneZeramiDrill } from './zakonczone-zerami-drill';
import { ZeroAuditHunt } from './zero-audit-hunt';
import { ZERO_SHORTCUT_RULES } from '../../../lib/trailing-zeros';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Zero na końcu, nie zero gdziekolwiek',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Obetnij zera, pomnóż rdzeń, doklej z powrotem',
    time: '12 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: '4 przykłady: od jednego zera po pułapkę rdzenia',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz mnożenie liczb zakończonych zerami',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'audyt-zer',
    kind: 'Zadanie problemowe',
    title: 'Znajdź błędnie policzone zero',
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
    id: 'ile-zer-4050',
    question: 'Ile zer KOŃCOWYCH ma liczba 4050?',
    options: [
      { id: 'a', text: '0' },
      { id: 'b', text: '1' },
      { id: 'c', text: '2' },
      { id: 'd', text: '3' },
    ],
    correctId: 'b',
    explanation: '4050 kończy się na 0 — to jedno zero końcowe. Drugie zero (po „4”) stoi w środku, więc się nie liczy.',
  },
  {
    id: 'kolejnosc-krokow',
    question: 'W skrócie przez zera, co robimy NAJPIERW?',
    options: [
      { id: 'a', text: 'Obcinamy zera końcowe obu czynników' },
      { id: 'b', text: 'Mnożymy rdzenie' },
      { id: 'c', text: 'Dopisujemy zera do wyniku' },
      { id: 'd', text: 'Sprawdzamy wynik dzieleniem' },
    ],
    correctId: 'a',
    explanation: 'Zawsze zaczynamy od obcięcia zer końcowych — dopiero to, co zostanie (rdzeń), mnożymy dalej.',
  },
  {
    id: '80-razy-300',
    question: '80 × 300 = ? (podpowiedź: rdzeń 8 × 3 = 24)',
    options: [
      { id: 'a', text: '2400' },
      { id: 'b', text: '240' },
      { id: 'c', text: '240000' },
      { id: 'd', text: '24000' },
    ],
    correctId: 'd',
    explanation: 'Razem obcinamy 3 zera (1 z 80, 2 z 300). Do rdzenia 24 dopisujemy te 3 zera: 24000.',
  },
  {
    id: 'rdzen-konczy-sie-zerem',
    question: 'Rdzeń pewnego mnożenia to 5 × 4 = 20. Obcięto łącznie 2 zera. Ile zer będzie miał ostateczny wynik?',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '2' },
      { id: 'c', text: '3' },
      { id: 'd', text: '4' },
    ],
    correctId: 'c',
    explanation: 'Rdzeń 20 sam już ma jedno własne zero. Dopisujemy do niego jeszcze 2 obcięte — razem 3 zera w wyniku.',
  },
  {
    id: 'dlaczego-205-nie',
    question: 'Dlaczego 205 nie nadaje się do obcięcia żadnego zera w tym skrócie?',
    options: [
      { id: 'a', text: 'Bo 205 jest liczbą nieparzystą' },
      { id: 'b', text: 'Bo 205 ma więcej niż jedną cyfrę' },
      { id: 'c', text: 'Bo skrót działa tylko dla liczb dwucyfrowych' },
      { id: 'd', text: 'Bo zero w 205 stoi w środku, nie na końcu' },
    ],
    correctId: 'd',
    explanation: '205 kończy się na 5 — zero jest w środku, między 2 a 5. Obcinamy tylko zera stojące na samym końcu zapisu.',
  },
  {
    id: '120-razy-40',
    question: '120 × 40 = ? (podpowiedź: rdzeń 12 × 4 = 48)',
    options: [
      { id: 'a', text: '480' },
      { id: 'b', text: '4800' },
      { id: 'c', text: '48000' },
      { id: 'd', text: '4080' },
    ],
    correctId: 'b',
    explanation: 'Razem obcinamy 2 zera (1 z 120, 1 z 40). Do rdzenia 48 dopisujemy te 2 zera: 4800.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/mnozenie-zakonczone-zerami/otwarty-zeszyt-obok-liczydla-i-monet.jpg',
  rozgrzewka:
    '/images/matematyka/lekcje/mnozenie-zakonczone-zerami/chlopiec-liczacy-rulony-monet-w-kolumnach-po-dziesiec.jpg',
  nowePojecie:
    '/images/matematyka/lekcje/mnozenie-zakonczone-zerami/puste-kartony-na-jajka-obok-kartonu-z-kilkoma-jajkami.jpg',
  przyklady: '/images/matematyka/lekcje/mnozenie-zakonczone-zerami/dziewczynka-z-jasnymi-wlosami-piszaca-w-zeszycie.jpg',
  audytZer: '/images/matematyka/lekcje/mnozenie-zakonczone-zerami/lupa-na-stosie-monet-obok-otwartego-zeszytu.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function MnozenieZakonczoneZeramiLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('audyt-zer');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Mnożenie pisemne przez liczbę wielocyfrową masz już opanowane — ale gdy oba czynniki
            kończą się zerami, jest szybszy sposób. Zamiast liczyć cały algorytm w słupku,{' '}
            <strong>obetniesz zera, pomnożysz to, co zostanie, i doklejesz zera z powrotem</strong>.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Scissors, text: 'Obcinasz zera KOŃCOWE obu czynników — nie każde zero w zapisie' },
              { icon: Layers3, text: 'Mnożysz to, co zostało — rdzeń przez rdzeń' },
              { icon: PenLine, text: 'Doklejasz z powrotem łączną liczbę obciętych zer' },
              { icon: SquareStack, text: 'Uwaga: sam rdzeń też może kończyć się zerem' },
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
            alt="Otwarty zeszyt w kratkę leżący na drewnianym biurku obok drewnianego liczydła i kilku monet"
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
          alt="Chłopiec siedzący na dywanie, liczący monety ułożone w równe rulony w kolumnach po dziesięć"
        >
          <p>
            Zanim zaczniesz obcinać zera, musisz bezbłędnie rozpoznawać, które zero jest naprawdę na
            KOŃCU liczby — zero w środku (jak w 205 czy 2050) się nie liczy.
          </p>
        </LessonImageCard>
        <ZeroCountWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Kilka pustych kartonów na jajka odstawionych osobno obok kartonu z kilkoma jajkami w środku"
          lead="Odkładasz puste grupy na bok, zostaje tylko to, co się naprawdę liczy — a puste grupy wracają na koniec."
        >
          Obejrzyj, jak zera znikają z obu czynników, jak liczy się to, co zostało, i jak zera wracają
          do wyniku — a potem sam/a przeprowadź to samo na dwóch nowych przykładach.
        </LessonImageCard>
        <ZeroPeelLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 przykłady: od jednego zera po pułapkę rdzenia"
          alt="Dziewczynka z jasnymi włosami pisząca skupiona coś w otwartym zeszycie przy biurku"
        >
          Od pojedynczego zera do obcięcia, przez zera po obu stronach naraz, po przypadek, w którym
          sam rdzeń kończy się zerem — i wynik ma ich więcej, niż się wydaje.
        </LessonImageCard>
        <ZakonczoneZeramiPrzyklady color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <ZakonczoneZeramiDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="audyt-zer">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.audytZer}
          alt="Lupa leżąca na stosie monet obok otwartego zeszytu w kratkę"
          reverse
          lead="Zero w środku liczby wygląda niemal tak samo jak zero na końcu — ale nie działa tak samo."
        >
          Kuba pomylił zero w środku liczby z zerem końcowym i policzył za dużo. Znajdź, którą liczbę
          policzył źle, i popraw cały wynik.
        </LessonImageCard>
        <ZeroAuditHunt color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: mnożenie liczb zakończonych zerami w pięciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          To nie nowy algorytm — to skrót, który oszczędza czas tam, gdzie pisemne mnożenie by
          zadziałało tak samo, tylko wolniej.
        </p>
        <ol className="divide-y border">
          {ZERO_SHORTCUT_RULES.map((rule, index) => (
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

'use client';

import Image from 'next/image';
import { ArrowRightLeft, Layers3, PenLine, SquareStack } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { MnoznikRozkladWarmup } from './mnoznik-rozklad-warmup';
import { LongMultiplicationLab } from './long-multiplication-lab';
import { MnozenieWielocyfrowePrzyklady } from './mnozenie-wielocyfrowe-przyklady';
import { MnozenieWielocyfroweDrill } from './mnozenie-wielocyfrowe-drill';
import { PrzesuniecieHunt } from './przesuniecie-hunt';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Rozłóż mnożnik na miejsca',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Iloczyny cząstkowe i przesunięcie',
    time: '12 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: '4 przykłady: od dwucyfrowego po trzycyfrowy mnożnik',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz mnożenie przez liczbę wielocyfrową',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'lowca-przesuniec',
    kind: 'Zadanie problemowe',
    title: 'Znajdź brakujące przesunięcie',
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
    id: 'ile-czastkowych',
    question: 'Mnożysz 47 × 236. Żadna cyfra mnożnika nie jest zerem. Ile będzie iloczynów cząstkowych?',
    options: [
      { id: 'a', text: '4' },
      { id: 'b', text: '3' },
      { id: 'c', text: '2' },
      { id: 'd', text: '1' },
    ],
    correctId: 'b',
    explanation: 'Mnożnik 236 ma trzy cyfry (2, 3, 6), więc powstają trzy iloczyny cząstkowe — po jednym na każdą cyfrę.',
  },
  {
    id: 'przesuniecie-setek',
    question: 'O ile kolumn przesuwamy iloczyn cząstkowy policzony przez cyfrę SETEK mnożnika?',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '3' },
      { id: 'c', text: '0' },
      { id: 'd', text: '2' },
    ],
    correctId: 'd',
    explanation: 'Setki to trzecie miejsce od prawej (jedności = 0, dziesiątki = 1, setki = 2), więc iloczyn przesuwamy o 2 kolumny.',
  },
  {
    id: '34-razy-26',
    question: '34 × 26 = ? (podpowiedź: 34 × 6 = 204, a 34 × 20 = 680)',
    options: [
      { id: 'a', text: '884' },
      { id: 'b', text: '272' },
      { id: 'c', text: '894' },
      { id: 'd', text: '780' },
    ],
    correctId: 'a',
    explanation: '204 + 680 = 884. (272 to błąd „zapomniałem przesunąć": 204 + 68.)',
  },
  {
    id: 'dlaczego-przesuwamy',
    question: 'Dlaczego iloczyn cząstkowy z cyfry dziesiątek mnożnika przesuwamy o jedną kolumnę w lewo?',
    options: [
      { id: 'a', text: 'Żeby zmieścić większe liczby na stronie' },
      { id: 'b', text: 'Żeby uniknąć przenoszenia' },
      { id: 'c', text: 'Bo mnożenie przez cyfrę dziesiątek to tak naprawdę mnożenie przez 10 razy więcej' },
      { id: 'd', text: 'Bo tak jest ładniej zapisane w zeszycie' },
    ],
    correctId: 'c',
    explanation:
      'Cyfra dziesiątek mnożnika oznacza całe dziesiątki, nie pojedyncze jedności — mnożenie przez nią to mnożenie przez wielokrotność 10, a to właśnie przesuwa wynik o kolumnę.',
  },
  {
    id: 'brak-przesuniecia-skutek',
    question: 'Ktoś zapomniał przesunąć drugi iloczyn cząstkowy i dodał go bez przesunięcia. Co się stanie z wynikiem?',
    options: [
      { id: 'a', text: 'Będzie taki sam — przesunięcie nie ma znaczenia' },
      { id: 'b', text: 'Będzie dużo za mały' },
      { id: 'c', text: 'Błąd pojawi się tylko w kolumnie jedności' },
      { id: 'd', text: 'Będzie dużo za duży' },
    ],
    correctId: 'b',
    explanation:
      'Bez przesunięcia iloczyn cząstkowy jest wart dziesięć (albo sto) razy mniej, niż powinien — suma wychodzi wtedy dużo mniejsza od prawdziwego wyniku.',
  },
  {
    id: 'przemiennosc',
    question: '213 × 24 to dokładnie to samo, co 24 × 213. Dlaczego?',
    options: [
      { id: 'a', text: 'Bo mnożenie jest przemienne — kolejność czynników nie zmienia iloczynu' },
      { id: 'b', text: 'To przypadek, zwykle wynik by się różnił' },
      { id: 'c', text: 'Bo obie liczby mają tyle samo cyfr' },
      { id: 'd', text: 'Bo 213 i 24 mają wspólny dzielnik' },
    ],
    correctId: 'a',
    explanation: 'Przemienność mnożenia poznałeś/aś już w module 1 — działa dla każdych dwóch liczb, także wielocyfrowych.',
  },
];

const MULTIPLICATION_RULES: string[] = [
  'Mnożnik wielocyfrowy rozkładamy na cyfry — każda niezerowa cyfra tworzy osobny iloczyn cząstkowy.',
  'Liczymy zawsze od cyfry jedności mnożnika, potem dziesiątek, potem setek — czyli od prawej do lewej.',
  'Każdy iloczyn cząstkowy liczymy dokładnie tak, jak mnożenie pisemne przez liczbę jednocyfrową — z tym samym przenoszeniem.',
  'Iloczyn z cyfry dziesiątek zapisujemy przesunięty o jedną kolumnę w lewo, z cyfry setek — o dwie kolumny. Mnożenie przez dziesiątki czy setki to mnożenie przez 10 lub 100 razy więcej.',
  'Na końcu wszystkie iloczyny cząstkowe dodajemy pisemnie, kolumna po kolumnie — to ten sam algorytm dodawania, którego już się nauczyłeś/aś.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/mnozenie-pisemne-wielocyfrowa/otwarty-zeszyt-w-kratke-z-niebieskim-dlugopisem.jpg',
  rozgrzewka:
    '/images/matematyka/lekcje/mnozenie-pisemne-wielocyfrowa/chlopiec-ukladajacy-drewniane-klocki-w-grupy-po-dziesiec.jpg',
  nowePojecie:
    '/images/matematyka/lekcje/mnozenie-pisemne-wielocyfrowa/dwa-rzedy-drewnianych-klockow-drugi-przesuniety-w-prawo.jpg',
  przyklady: '/images/matematyka/lekcje/mnozenie-pisemne-wielocyfrowa/dziewczynka-z-ciemnymi-wlosami-pisze-w-zeszycie.jpg',
  lowcaPrzesuniec: '/images/matematyka/lekcje/mnozenie-pisemne-wielocyfrowa/lupa-i-niebieski-dlugopis-na-otwartym-zeszycie.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function MnozeniePisemneWielocyfrowaLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('lowca-przesuniec');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Mnożenie pisemne przez jedną cyfrę masz już opanowane — teraz czas na{' '}
            <strong>mnożenie przez liczbę wielocyfrową</strong>. Nowość: zamiast jednego wiersza
            mnożenia, policzysz kilka — po jednym na każdą cyfrę mnożnika — a potem złożysz je w
            wynik.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Layers3, text: 'Każda cyfra mnożnika tworzy własny iloczyn cząstkowy' },
              { icon: ArrowRightLeft, text: 'Iloczyn z dziesiątek przesuwamy o kolumnę, z setek — o dwie' },
              { icon: PenLine, text: 'Na końcu iloczyny cząstkowe dodajemy pisemnie, tak jak już umiesz' },
              { icon: SquareStack, text: 'Na koniec: znajdziesz wiersz, w którym zabrakło przesunięcia' },
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
            alt="Otwarty zeszyt w kratkę leżący na drewnianym biurku obok niebieskiego długopisu"
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
          alt="Chłopiec o jasnych włosach układający na dywanie drewniane klocki w grupy po dziesięć"
        >
          <p>
            Zanim zaczniesz liczyć iloczyny cząstkowe, przypomnij sobie, jak rozkłada się mnożnik
            wielocyfrowy na dziesiątki, setki i jedności — to ten rozkład decyduje, ile ich będzie.
          </p>
        </LessonImageCard>
        <MnoznikRozkladWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Dwa równoległe rzędy drewnianych klocków na stole, drugi rząd przesunięty o jedno miejsce w prawo względem pierwszego"
          lead="Mnożenie przez dziesiątki przesuwa cały wynik o jedną kolumnę — dokładnie tak, jak mnożenie przez 10."
        >
          Obejrzyj, jak dwa iloczyny cząstkowe powstają i łączą się w jeden wynik, a potem sam/a
          sprawdź, czy rozumiesz przesunięcie i dodawanie tych iloczynów.
        </LessonImageCard>
        <LongMultiplicationLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 przykłady: od dwucyfrowego po trzycyfrowy mnożnik"
          alt="Dziewczynka z ciemnymi włosami związanymi w warkocz pisząca coś w zeszycie przy biurku"
        >
          Od czystego przesunięcia bez żadnego przeniesienia, przez przeniesienie wewnątrz
          iloczynu cząstkowego i w końcowym dodawaniu, po mnożnik trzycyfrowy z trzema wierszami.
        </LessonImageCard>
        <MnozenieWielocyfrowePrzyklady color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <MnozenieWielocyfroweDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="lowca-przesuniec">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.lowcaPrzesuniec}
          alt="Lupa i niebieski długopis leżące obok siebie na otwartym zeszycie w kratkę"
          reverse
          lead="Brakujące przesunięcie to jeden z najczęstszych błędów w mnożeniu przez liczbę wielocyfrową."
        >
          Kuba policzył mnożenie pisemne, ale zapomniał przesunąć jeden z iloczynów cząstkowych.
          Znajdź ten wiersz i popraw wynik całego działania.
        </LessonImageCard>
        <PrzesuniecieHunt color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: mnożenie przez liczbę wielocyfrową w pięciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Każdy iloczyn cząstkowy to znajome mnożenie przez jedną cyfrę — nowość to tylko
          przesunięcie i końcowe dodawanie.
        </p>
        <ol className="divide-y border">
          {MULTIPLICATION_RULES.map((rule, index) => (
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

'use client';

import Image from 'next/image';
import { Equal, Hash, LayoutGrid, Slice } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { FractionEyeballWarmup } from './fraction-eyeball-warmup';
import { FractionBar, type FractionBarRound } from './fraction-bar';
import { FractionWorkedExamples } from './fraction-worked-examples';
import { buildDrillTasks, buildProblemTasks } from './ulamek-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ile jest zamalowane?',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'budowanie',
    kind: 'Nowe pojęcie',
    title: 'Zbuduj własny ułamek',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Chleb i wstążka',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Licznik czy mianownik?',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'muffinki',
    kind: 'Zadanie problemowe',
    title: 'Taca muffinek',
    time: '6 min',
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

const BUILD_ROUNDS: FractionBarRound[] = [
  {
    label: 'Zbuduj ułamek trzy czwarte: przeciągnij uchwyt, żeby ustawić mianownik, potem stuknij kawałki, żeby zbudować licznik.',
    licznik: 3,
    mianownik: 4,
  },
  { label: 'Teraz zbuduj pięć ósmych.', licznik: 5, mianownik: 8 },
  { label: 'I na koniec dwie szóste.', licznik: 2, mianownik: 6 },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'co-mowi-mianownik',
    question: 'Co mówi MIANOWNIK ułamka?',
    options: [
      { id: 'a', text: 'Ile części zamalowano/wzięto' },
      { id: 'b', text: 'Jak duża jest cała figura' },
      { id: 'c', text: 'Na ile równych części podzielono całość' },
      { id: 'd', text: 'Ile ułamków da się zrobić' },
    ],
    correctId: 'c',
    explanation: 'Mianownik (na dole) mówi, na ile równych części podzielono całość.',
  },
  {
    id: 'co-mowi-licznik',
    question: 'Co mówi LICZNIK ułamka?',
    options: [
      { id: 'a', text: 'Ile części zamalowano/wzięto' },
      { id: 'b', text: 'Na ile równych części podzielono całość' },
      { id: 'c', text: 'Jaki kształt ma całość' },
      { id: 'd', text: 'Czy części są równe' },
    ],
    correctId: 'a',
    explanation: 'Licznik (na górze) mówi, ile z tych części bierzesz albo zamalowujesz.',
  },
  {
    id: 'trzy-siodme',
    question: 'W ułamku 3/7 liczba 7 to...',
    options: [
      { id: 'a', text: 'licznik' },
      { id: 'b', text: 'wynik dzielenia' },
      { id: 'c', text: 'połowa' },
      { id: 'd', text: 'mianownik' },
    ],
    correctId: 'd',
    explanation: '7 stoi pod kreską ułamkową, więc to mianownik.',
  },
  {
    id: 'piec-dwa',
    question: 'Pasek podzielono na 5 równych części i zamalowano 2. Jak to zapiszemy?',
    options: [
      { id: 'a', text: '5/2' },
      { id: 'b', text: '2/5' },
      { id: 'c', text: '2/2' },
      { id: 'd', text: '5/5' },
    ],
    correctId: 'b',
    explanation: 'Licznik (zamalowane) nad kreską, mianownik (wszystkie części) pod kreską: 2/5.',
  },
  {
    id: 'rowne-czesci',
    question: 'Żeby dwie liczby naprawdę tworzyły ułamek „część całości", kawałki całości muszą być...',
    options: [
      { id: 'a', text: 'dowolnej wielkości' },
      { id: 'b', text: 'równe' },
      { id: 'c', text: 'tego samego koloru' },
      { id: 'd', text: 'policzone parzyście' },
    ],
    correctId: 'b',
    explanation: 'Bez równych części zapis licznik/mianownik nie ma sensu — to warunek konieczny ułamka.',
  },
  {
    id: 'okulary',
    question: '8 uczniów z klasy liczącej 20 osób nosi okulary. Jaki to ułamek klasy?',
    options: [
      { id: 'a', text: '20/8' },
      { id: 'b', text: '12/20' },
      { id: 'c', text: '8/12' },
      { id: 'd', text: '8/20' },
    ],
    correctId: 'd',
    explanation: 'Licznik to uczniowie w okularach (8), mianownik to cała klasa (20): 8/20.',
  },
];

const CHEAT_SHEET = [
  'Ułamek to dwie liczby oddzielone poziomą kreską — pokazuje, jaką część całości bierzesz.',
  'Mianownik (na dole) mówi, na ile równych części podzielono całość.',
  'Licznik (na górze) mówi, ile z tych części bierzesz albo zamalowujesz.',
  'Części MUSZĄ być równe — inaczej liczby nie tworzą prawdziwego ułamka.',
  'Całość może być podzielonym kształtem (pasek, koło) albo grupą osobnych przedmiotów — zasada jest ta sama.',
  'Gdy licznik jest równy mianownikowi, masz całość — np. 20/20 to wszystkie grządki.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/ulamek-jako-czesc-calosci/pomarancza-podzielona-na-czastki.jpg',
  rozgrzewka: '/images/matematyka/lekcje/ulamek-jako-czesc-calosci/grzadka-ogrodowa-z-dzieckiem.jpg',
  budowanie: '/images/matematyka/lekcje/ulamek-jako-czesc-calosci/dziecko-tnie-wstazke.jpg',
  przyklady: '/images/matematyka/lekcje/ulamek-jako-czesc-calosci/bochenek-chleba-pokrojony.jpg',
  cwiczenia: '/images/matematyka/lekcje/ulamek-jako-czesc-calosci/wagoniki-pociagu-zabawki.jpg',
  muffinki: '/images/matematyka/lekcje/ulamek-jako-czesc-calosci/taca-muffinek.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function UlamekJakoCzescCalosciLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const budowanie = useStepDone('budowanie');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('cwiczenia');
  const muffinki = useStepDone('muffinki');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Z przewodnika znasz już słowa <strong>licznik</strong> i <strong>mianownik</strong>.
            Dziś sam zbudujesz ułamek od zera — nie tylko go odczytasz, ale przeciągniesz i
            klikniesz, żeby powstał na twoich oczach. Zasada działa tak samo dla podzielonego
            kształtu, jak i dla grupy osobnych przedmiotów.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: LayoutGrid, text: 'Mianownik = na ile części podzielono całość' },
              { icon: Hash, text: 'Licznik = ile z tych części bierzesz' },
              { icon: Slice, text: 'Kawałki muszą być równe' },
              { icon: Equal, text: 'Licznik = mianownik → to cała całość' },
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
            alt="Pomarańcza podzielona na równe cząstki, kilka oddzielonych od reszty"
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
          alt="Grządka w ogrodzie podzielona na równe poletka, dziecko sadzi kwiaty w jednym z nich"
          lead="Zanim zaczniesz budować, wyrób sobie oko do ułamków."
        >
          Pasek jest już podzielony i zamalowany — Twoje zadanie to tylko dobrać właściwy zapis.
        </LessonImageCard>
        <FractionEyeballWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="budowanie">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.budowanie}
          alt="Dziecko tnie nożyczkami długą kolorową wstążkę na równe kawałki"
        >
          <p>
            Teraz Ty decydujesz, na ile części podzielić całość — przeciągnij uchwyt, żeby ustawić
            mianownik, potem stuknij kawałki, żeby zbudować licznik. Zbuduj dokładnie taki ułamek,
            jaki podano w poleceniu.
          </p>
        </LessonImageCard>
        <FractionBar color={color} rounds={BUILD_ROUNDS} onComplete={budowanie.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="2×"
          kicker="Ta sama zasada, inny kształt"
          image={IMAGES.przyklady}
          alt="Bochenek chleba pokrojony na równe kromki, kilka kromek odsuniętych od reszty"
        >
          Dwa gotowe przykłady — chleb pokrojony na kromki i wstążka pocięta na kawałki.
        </LessonImageCard>
        <FractionWorkedExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Rząd drewnianych wagoników zabawkowego pociągu na torach, część pomalowana, część nie"
          reverse
        >
          <p>Czas poćwiczyć samodzielnie — osobno licznik, osobno mianownik, i pułapka odwróconych liczb.</p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="muffinki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.muffinki}
          alt="Taca na muffinki z równymi miejscami, część miejsc zapełniona, część pusta"
          reverse
          lead="Jedna taca, trzy pytania do rozwiązania."
        >
          Ta sama taca muffinek posłuży do wszystkich trzech pytań.
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildProblemTasks(color)}
          color={color}
          onFinish={muffinki.markStepDone}
          resultCopy={{
            perfect: { title: 'Taca odczytana bezbłędnie!', message: 'Licznik, mianownik i cały zapis — wszystko trafione.' },
            good: { title: 'Prawie się udało', message: 'Większość trafiona — sprawdź wyjaśnienia przy pomyłkach.' },
            poor: { title: 'Spróbuj jeszcze raz', message: 'Licznik to zapełnione miejsca, mianownik to wszystkie miejsca razem.' },
          }}
        />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: ułamek jako część całości w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">Wracaj do niej, gdy w kolejnej lekcji spotkasz ułamki na osi liczbowej.</p>
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

'use client';

import Image from 'next/image';
import { Brain, Layers, MoveDown, Scissors } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { TenthsBorrow } from './tenths-borrow';
import { ColumnSubBuild } from './column-sub-build';
import { DecimalSubSteps } from './decimal-sub-steps';
import { buildDecimalSubDrill } from './decimal-sub-drill';
import { MakingChangeLine } from './making-change-line';
import { DECIMAL_SUBTRACTION_RULES } from '../../../lib/decimal-subtraction';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Jak rozbija się koralik',
    time: '6 min',
    icon: 'Sparkles',
  },
  {
    id: 'pisemne',
    kind: 'Nowe pojęcie',
    title: 'Odejmowanie w słupku, przecinek pod przecinkiem',
    time: '12 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy rozpisane odejmowania',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Odejmij samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'zadanie',
    kind: 'Zadanie problemowe',
    title: 'Reszta bez słupka — dolicz do celu',
    time: '7 min',
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

const QUIZ: QuizQuestion[] = [
  {
    id: 'proste-0704',
    question: 'Ile to 0,7 − 0,4?',
    options: [
      { id: 'a', text: '0,03' },
      { id: 'b', text: '0,3' },
      { id: 'c', text: '0,11' },
      { id: 'd', text: '1,1' },
    ],
    correctId: 'b',
    explanation: '7 dziesiątych − 4 dziesiąte = 3 dziesiąte, czyli 0,3. Część całkowita zostaje 0.',
  },
  {
    id: 'przez-przecinek-1207',
    question: 'Ile to 1,2 − 0,7?',
    options: [
      { id: 'a', text: '1,5' },
      { id: 'b', text: '0,05' },
      { id: 'c', text: '0,3' },
      { id: 'd', text: '0,5' },
    ],
    correctId: 'd',
    explanation:
      '2 dziesiąte to za mało, żeby odjąć 7. Pożyczamy 1 całą przez przecinek: 12 dziesiątych − 7 = 5 dziesiątych, a w jednościach zostaje 0. Wynik: 0,5.',
  },
  {
    id: 'jak-ustawic',
    question: 'Jak ustawić 5,2 − 3,15 do odejmowania w słupku?',
    options: [
      { id: 'a', text: 'Wyrównać ostatnie cyfry do prawej strony' },
      { id: 'b', text: 'Nie da się — liczby mają różną długość' },
      { id: 'c', text: 'Przecinek pod przecinkiem, a 5,2 zapisać jako 5,20' },
      { id: 'd', text: 'Napisać 52 − 315, a przecinek dopisać na końcu' },
    ],
    correctId: 'c',
    explanation:
      'Zawsze przecinek pod przecinkiem. Krótszą liczbę wyrównujemy zerem na końcu: 5,2 to 5,20. Wtedy odejmujemy rząd od rzędu.',
  },
  {
    id: 'pozyczka-przez-zero',
    question: 'Ile to 4 − 1,6?',
    options: [
      { id: 'a', text: '2,4' },
      { id: 'b', text: '3,4' },
      { id: 'c', text: '2,6' },
      { id: 'd', text: '3,6' },
    ],
    correctId: 'a',
    explanation:
      '4 zapisujemy jako 4,0. Dziesiąte: 0 − 6 — pożyczamy 1 całą. 10 − 6 = 4. Jedności: 3 − 1 = 2. Wynik: 2,4.',
  },
  {
    id: 'po-co-zero',
    question: 'Po co przy odejmowaniu 6,00 − 2,45 dopisujemy zera do liczby 6?',
    options: [
      { id: 'a', text: 'Żeby liczba 6 stała się większa' },
      { id: 'b', text: 'Bo bez zer nie wolno postawić przecinka' },
      { id: 'c', text: 'To pomyłka — nic nie dopisujemy' },
      {
        id: 'd',
        text: 'Żeby obie liczby miały tyle samo miejsc po przecinku i można było odejmować rząd od rzędu',
      },
    ],
    correctId: 'd',
    explanation:
      '6 zapisujemy jako 6,00. Dopisane zera na końcu nie zmieniają wartości, a wyrównują liczbę miejsc po przecinku — dopiero wtedy widać, że setne to 0 − 5.',
  },
  {
    id: 'reszta',
    question: 'Płacisz banknotem 10 zł za zakupy o wartości 7,30 zł. Ile reszty dostajesz?',
    options: [
      { id: 'a', text: '3,70 zł' },
      { id: 'b', text: '2,70 zł' },
      { id: 'c', text: '2,80 zł' },
      { id: 'd', text: '2,30 zł' },
    ],
    correctId: 'b',
    explanation:
      '10,00 − 7,30. Setne: 0 − 0 = 0. Dziesiąte: 0 − 3 — pożyczka. 10 − 3 = 7. Jedności: 9 − 7 = 2. Reszta: 2,70 zł.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/odejmowanie-ulamkow-dziesietnych/wstega-przycinana-nozyczkami.jpg',
  rozgrzewka: '/images/matematyka/lekcje/odejmowanie-ulamkow-dziesietnych/duzy-koralik-rozbity-na-male.jpg',
  pisemne: '/images/matematyka/lekcje/odejmowanie-ulamkow-dziesietnych/chlopiec-zapisuje-odejmowanie-w-zeszycie.jpg',
  przyklady: '/images/matematyka/lekcje/odejmowanie-ulamkow-dziesietnych/dzbanek-i-pelna-szklanka.jpg',
  cwiczenia: '/images/matematyka/lekcje/odejmowanie-ulamkow-dziesietnych/dziewczynka-liczy-nad-kartka.jpg',
  zadanie: '/images/matematyka/lekcje/odejmowanie-ulamkow-dziesietnych/lada-sklepiku-z-reszta.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function OdejmowanieUlamkowDziesietnychLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozgrzewka = useStepDone('rozgrzewka');
  const pisemne = useStepDone('pisemne');
  const przyklady = useStepDone('przyklady');
  const cwiczenia = useStepDone('cwiczenia');
  const zadanie = useStepDone('zadanie');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Ile zostanie z <strong>1,2 litra</strong>, gdy wypijesz <strong>0,7 litra</strong>? Kusi,
            żeby powiedzieć „0,5” od razu — i tym razem to nawet wynik prawidłowy, ale tylko dlatego,
            że w głowie zrobiłeś pożyczkę. Dziś nauczysz się odejmować liczby z przecinkiem{' '}
            <strong>w pamięci</strong> i <strong>w słupku</strong>: przecinek pod przecinkiem, zera
            wyrównujące liczbę miejsc, a pożyczka „1” — która czasem musi przeskoczyć przez przecinek.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Layers, text: 'Przecinek pod przecinkiem — nie do prawej' },
              { icon: Scissors, text: 'Za mało w rzędzie? Pożycz 1 od kolumny z lewej' },
              { icon: MoveDown, text: 'Pożyczka potrafi przeskoczyć przez przecinek' },
              { icon: Brain, text: 'W pamięci: dolicz do celu krótkimi skokami' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-sm">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-[240px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Kawałek papierowej wstęgi na drewnianym stole, z którego nożyczki odcinają fragment; obok leży zwinięty w rulon pasek tej samej wstęgi"
            width={240}
            height={180}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* 1. Rozgrzewka */}
      <LessonSection id="rozgrzewka">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="10"
          kicker="Rozbij 1, dostaniesz 10"
          image={IMAGES.rozgrzewka}
          alt="Jeden duży drewniany koralik rozbity na kawałki, a wokół niego rozsypane małe koraliki na jasnym stole"
        >
          Odwrotność zwijania dziesiątki z lekcji o dodawaniu: gdy w rzędzie brakuje koralików do
          zabrania, rozbijasz jeden koralik rzędu po lewej na 10 tutejszych. Czasem to rozbicie
          przechodzi przez przecinek, czasem zostaje w części po przecinku.
        </LessonImageCard>
        <TenthsBorrow color={color} onComplete={rozgrzewka.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="pisemne">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.pisemne}
          alt="Chłopiec około dziesięciu lat, jasna karnacja, krótkie kręcone brązowe włosy, siedzi nad otwartym zeszytem w kratkę z ołówkiem uniesionym nad pustą stroną"
        >
          <p>
            W słupku ułamki dziesiętne odejmujesz w trzech ruchach: ustaw liczby przecinek pod
            przecinkiem, dopisz brakujące zera, a potem odejmuj kolumnami od prawej. Gdy górna cyfra
            jest za mała — pożyczasz. Zrób te trzy ruchy samodzielnie dla trzech par liczb.
          </p>
        </LessonImageCard>
        <ColumnSubBuild color={color} onComplete={pisemne.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Szklany dzbanek do połowy opróżniony, obok stoi mniejsza szklanka z wodą, na drewnianym blacie"
          lead="Trzy gotowe odejmowania w słupku — po jednym na każdy typowy przypadek."
          reverse
        >
          Raz trzeba dopisać zero, raz pożyczka przeskakuje przez przecinek, a raz „1” wędruje przez
          dwa zera pod rząd. Zwróć uwagę, gdzie za każdym razem cyfra „się zmniejsza”.
        </LessonImageCard>
        <DecimalSubSteps color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Dziewczynka około dziesięciu lat, jasna karnacja, blond włosy związane w kucyk, zielony sweter, liczy nad kartką trzymając ołówek"
          reverse
        >
          <p>
            Siedem zadań o rosnącej trudności — odejmowanie w pamięci, słupek z pożyczką przez
            przecinek, pułapka „odejmij bez przecinka” i reszta z zakupów.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildDecimalSubDrill(color)}
          color={color}
          onFinish={cwiczenia.markStepDone}
        />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="zadanie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zadanie}
          alt="Lada sklepiku: drewniana miseczka, obok słupek monet i pusty papierowy paragon na wytartym blacie"
          lead="Kupujesz coś i płacisz „na okrągło”."
        >
          Zamiast liczyć resztę w słupku, dolicz od ceny do wpłaconej kwoty krótkimi skokami po osi z
          przecinkiem: do pełnej setnej, dziesiątej, całości. Suma skoków to reszta.
        </LessonImageCard>
        <MakingChangeLine color={color} onComplete={zadanie.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: odejmowanie ułamków dziesiętnych</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Reguły są prawie takie same jak przy dodawaniu — różnica to pożyczka zamiast przeniesienia.
        </p>
        <ol className="divide-y border">
          {DECIMAL_SUBTRACTION_RULES.map((rule, index) => (
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

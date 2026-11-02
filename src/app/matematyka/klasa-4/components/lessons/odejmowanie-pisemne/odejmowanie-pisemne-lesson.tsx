'use client';

import Image from 'next/image';
import { CornerLeftUp, Eraser, Layers, PiggyBank } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { SummaryPlayer } from '../../guides/summary-player';
import { PozyczanieWarmup } from './pozyczanie-warmup';
import { ColumnSubtractionLab } from './column-subtraction-lab';
import { OdejmowaniePrzyklady } from './odejmowanie-przyklady';
import { OdejmowanieDrill } from './odejmowanie-drill';
import { ResztaChallenge } from './reszta-challenge';
import { SummaryDisplay } from './summary-content';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Trzeba pożyczyć?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Pożyczanie — także od zer',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: '4 przykłady: od zera pożyczek po dwa zera z rzędu',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz odejmowanie pisemne',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'reszta',
    kind: 'Zadanie problemowe',
    title: 'Policz resztę z zakupów',
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
    id: 'kiedy-pozyczamy',
    question: 'Kiedy trzeba pożyczyć podczas odejmowania w kolumnie?',
    options: [
      { id: 'a', text: 'Zawsze, w każdej kolumnie' },
      { id: 'b', text: 'Gdy górna cyfra jest mniejsza od dolnej' },
      { id: 'c', text: 'Tylko w kolumnie jedności' },
      { id: 'd', text: 'Gdy dolna cyfra to zero' },
    ],
    correctId: 'b',
    explanation: 'Pożyczamy dokładnie wtedy, gdy nie da się odjąć wprost — górna cyfra jest za mała.',
  },
  {
    id: 'zero-pozycza',
    question: 'W kolumnie, od której chcesz pożyczyć, zapisane jest zero. Co się dzieje?',
    options: [
      { id: 'a', text: 'Pożyczanie jest niemożliwe — trzeba zamienić kolejność liczb' },
      { id: 'b', text: 'Zero zamienia się od razu w 10 bez żadnych dalszych kroków' },
      { id: 'c', text: 'Ta kolumna sama najpierw pożycza od swojego sąsiada po lewej' },
      { id: 'd', text: 'Wynik w tej kolumnie zawsze wychodzi zero' },
    ],
    correctId: 'c',
    explanation: 'Zero nie ma nic do oddania, więc samo pożycza dalej — pożyczka wędruje, aż znajdzie kolumnę, która ma czym się podzielić.',
  },
  {
    id: 'zapis-pozyczki',
    question: 'Jak zapisujemy kolumnę, która oddała sąsiadowi swoją dziesiątkę?',
    options: [
      { id: 'a', text: 'Dopisujemy obok niej znak zapytania' },
      { id: 'b', text: 'Nic się w niej nie zmienia' },
      { id: 'c', text: 'Mnożymy jej cyfrę razy dwa' },
      { id: 'd', text: 'Przekreślamy jej cyfrę i zapisujemy nad nią cyfrę o jeden mniejszą' },
    ],
    correctId: 'd',
    explanation: 'Przekreślenie i mniejsza cyfra nad nią to ślad tego, że ta kolumna oddała jedną dziesiątkę dalej.',
  },
  {
    id: '500-minus-1',
    question: '500 − 1 = ?',
    options: [
      { id: 'a', text: '401' },
      { id: 'b', text: '599' },
      { id: 'c', text: '499' },
      { id: 'd', text: '510' },
    ],
    correctId: 'c',
    explanation: 'Jedności pożyczają od dziesiątek (0, więc te pożyczają od setek) — 500 zmienia się w 4 9 10, i wychodzi 499.',
  },
  {
    id: 'dlaczego-od-jednosci',
    question: 'Dlaczego odejmowanie pisemne zawsze zaczynamy liczyć od kolumny jedności?',
    options: [
      { id: 'a', text: 'Bo tak jest szybciej pisać' },
      { id: 'b', text: 'Żeby ewentualna pożyczka od razu trafiła tam, gdzie jest potrzebna' },
      { id: 'c', text: 'Bo jedności są zawsze największą cyfrą' },
      { id: 'd', text: 'To nieważne, można zacząć od dowolnej kolumny' },
    ],
    correctId: 'b',
    explanation: 'Licząc od prawej strony, wiemy od razu, czy dana kolumna potrzebuje pożyczki, zanim zajmiemy się resztą liczby.',
  },
  {
    id: '1000-minus-1',
    question: '1000 − 1 = ?',
    options: [
      { id: 'a', text: '999' },
      { id: 'b', text: '901' },
      { id: 'c', text: '9991' },
      { id: 'd', text: '1001' },
    ],
    correctId: 'a',
    explanation: 'Pożyczka przechodzi kaskadowo przez trzy zera z rzędu — dokładnie tak samo, jak przeniesienie w 999 + 1 = 1000, tylko w drugą stronę.',
  },
];

const SUBTRACTION_RULES: string[] = [
  'Liczymy zawsze od kolumny jedności, tak jak przy dodawaniu.',
  'Gdy górna cyfra jest mniejsza od dolnej, pożyczamy 10 z sąsiedniej kolumny po lewej — jej cyfrę przekreślamy i zapisujemy nad nią cyfrę o jeden mniejszą.',
  'Gdy ta sąsiednia kolumna ma zapisane zero, sama nic nie ma do oddania — więc najpierw pożycza od swojego sąsiada po lewej, i dopiero z tą pożyczką oddaje dziesiątkę dalej.',
  'Pożyczka może przejść przez kilka kolumn z zerami z rzędu, zanim dotrze do pierwszej cyfry, która naprawdę ma czym się podzielić.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/odejmowanie-pisemne/gumka-i-olowek-obok-przekreslonych-cyfr-w-zeszycie.jpg',
  rozgrzewka: '/images/matematyka/lekcje/odejmowanie-pisemne/dziewczynka-z-ciemnymi-wlosami-w-kucykach-porownuje-liczby.jpg',
  nowePojecie: '/images/matematyka/lekcje/odejmowanie-pisemne/dlonie-przekladajace-drewniany-klocek-miedzy-stosikami.jpg',
  przyklady: '/images/matematyka/lekcje/odejmowanie-pisemne/chlopiec-o-jasnych-wlosach-pisze-przy-oknie.jpg',
  reszta: '/images/matematyka/lekcje/odejmowanie-pisemne/banknot-i-monety-na-drewnianej-ladzie-sklepowej.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function OdejmowaniePisemneLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('reszta');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Dodawanie pisemne masz już opanowane — teraz czas na jego lustrzane odbicie:{' '}
            <strong>odejmowanie pisemne z pożyczaniem</strong>, także wtedy, gdy sąsiednia kolumna
            ma zapisane samo zero.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Layers, text: 'Odejmujemy kolumna po kolumnie, tak samo od jedności w lewo' },
              { icon: CornerLeftUp, text: 'Pożyczanie: gdy górna cyfra jest za mała, bierzemy 10 od sąsiada' },
              { icon: Eraser, text: 'Zero nie ma czego oddać — samo najpierw pożycza dalej' },
              { icon: PiggyBank, text: 'Prawdziwe zastosowanie: liczenie reszty przy płaceniu gotówką' },
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
            alt="Gumka do mazania i ołówek leżące obok kartki z przekreślonymi cyframi"
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
          alt="Dziewczynka z ciemnymi włosami związanymi w kucyki uważnie porównuje dwie liczby zapisane w zeszycie"
        >
          <p>Zanim zaczniesz liczyć całe działania, naucz się rozpoznawać, kiedy w ogóle trzeba pożyczyć.</p>
        </LessonImageCard>
        <PozyczanieWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Dłonie przekładające jeden drewniany klocek z jednego stosika na sąsiedni, mniejszy stosik"
          lead="Pożyczanie to jak przełożenie jednego klocka do sąsiada — tylko że czasem ten sąsiad sam musi najpierw pożyczyć."
        >
          Obejrzyj, jak odejmowanie pisemne liczy się kolumna po kolumnie, gdy trzeba pożyczyć od
          kolumny z zapisanym zerem, a potem sam/a wybierz poprawną cyfrę wyniku w dwóch
          samodzielnych rundach.
        </LessonImageCard>
        <ColumnSubtractionLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 przykłady: od zera pożyczek po dwa zera z rzędu"
          alt="Chłopiec o jasnych, potarganych włosach siedzi przy oknie i pisze coś w otwartym zeszycie"
        >
          Od odejmowania bez żadnego pożyczania, przez pojedyncze i podwójne pożyczenie, po
          pożyczkę przechodzącą przez dwie kolumny z zerami z rzędu.
        </LessonImageCard>
        <OdejmowaniePrzyklady color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <OdejmowanieDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="reszta">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.reszta}
          alt="Banknot i kilka monet leżące na drewnianej ladzie sklepowej obok kasy"
          reverse
          lead="Za każdym razem, gdy płacisz gotówką, ktoś w głowie liczy dokładnie to samo działanie."
        >
          Policz pisemnie, ile reszty powinieneś/aś dostać, gdy płacisz równym banknotem za zakup,
          który nie jest okrągłą kwotą.
        </LessonImageCard>
        <ResztaChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga + odsłuchaj streszczenie */}
      <section className="grid gap-6 border-2 border-dashed p-5 sm:p-6 lg:grid-cols-[1fr_300px]" style={{ borderColor: `${color}59` }}>
        <div>
          <h2 className="mb-1 text-xl font-bold">Ściąga: odejmowanie pisemne w czterech zdaniach</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Te same zasady pożyczania działają w każdym odejmowaniu pisemnym, jakie policzysz — z
            zerami czy bez.
          </p>
          <ol className="divide-y border">
            {SUBTRACTION_RULES.map((rule, index) => (
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
        </div>

        <SummaryPlayer
          color={color}
          audioSrc="/audio/matematyka/lekcje/odejmowanie-pisemne/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      </section>
    </>
  );
}

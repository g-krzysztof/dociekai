'use client';

import Image from 'next/image';
import { Droplets, Frame, Grid3x3, Triangle } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { EyeCheckDuel } from './eye-check-duel';
import { FloodTileBoard } from './flood-tile-board';
import { AreaCountSteps } from './area-count-steps';
import { buildAreaDrill } from './area-drill';
import { HalfPairMerge } from './half-pair-merge';
import { AREA_RULES } from '../../../lib/area';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Oko kontra kratki',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'pole',
    kind: 'Nowe pojęcie',
    title: 'Zalej figurę kafelkami',
    time: '12 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy sposoby liczenia kratek',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Policz pole samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'zadanie',
    kind: 'Zadanie problemowe',
    title: 'Ukośne boki i sklejanie połówek',
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
    id: 'czym-jest-pole',
    question: 'Czym jest pole figury?',
    options: [
      { id: 'a', text: 'Długością jej brzegu' },
      { id: 'b', text: 'Liczbą jej boków' },
      { id: 'c', text: 'Powierzchnią, którą zajmuje — mierzoną liczbą kwadratów jednostkowych' },
      { id: 'd', text: 'Wysokością figury pomnożoną przez jej szerokość w centymetrach' },
    ],
    correctId: 'c',
    explanation:
      'Pole to powierzchnia zajmowana przez figurę. Mierzymy je, sprawdzając, ile kwadratów jednostkowych się w niej mieści.',
  },
  {
    id: 'prostokat-5x3',
    question: 'Prostokąt na kratkownicy ma 5 kratek w rzędzie i 3 rzędy. Ile wynosi jego pole?',
    options: [
      { id: 'a', text: '15 kratek' },
      { id: 'b', text: '8 kratek' },
      { id: 'c', text: '16 kratek' },
      { id: 'd', text: '53 kratki' },
    ],
    correctId: 'a',
    explanation: 'Trzy rzędy po 5 kratek: 5 + 5 + 5 = 15 kratek.',
  },
  {
    id: 'rozne-ksztalty',
    question:
      'Dwie figury mają zupełnie różne kształty, ale w każdej mieści się dokładnie 10 takich samych kratek. Co można powiedzieć o ich polach?',
    options: [
      { id: 'a', text: 'Większe pole ma ta, która jest dłuższa' },
      { id: 'b', text: 'Większe pole ma ta, która wygląda na bardziej rozłożystą' },
      { id: 'c', text: 'Nie da się tego porównać, bo kształty są różne' },
      { id: 'd', text: 'Ich pola są równe' },
    ],
    correctId: 'd',
    explanation:
      'Pole nie zależy od kształtu, tylko od liczby kratek. Dziesięć kratek to dziesięć kratek — niezależnie od tego, jak są ułożone.',
  },
  {
    id: 'dziura-w-obrysie',
    question: 'Dlaczego z figury, która ma przerwę w obrysie, kafelki „uciekają” na całą planszę?',
    options: [
      { id: 'a', text: 'Bo kafelki są za małe' },
      { id: 'b', text: 'Bo przez przerwę wnętrze łączy się z tym, co na zewnątrz — figura nie jest zamknięta' },
      { id: 'c', text: 'Bo trzeba było zacząć od innego miejsca' },
      { id: 'd', text: 'Bo taka figura ma pole równe zero' },
    ],
    correctId: 'b',
    explanation:
      'Pole ma tylko figura zamknięta. Gdy w obrysie jest przerwa, „środek” przestaje być oddzielony od zewnątrz i nie ma czego liczyć.',
  },
  {
    id: 'cztery-polowki',
    question: 'W figurze zostały cztery połówki kratek. Ile całych kratek z nich powstanie?',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '4' },
      { id: 'c', text: '2' },
      { id: 'd', text: '8' },
    ],
    correctId: 'c',
    explanation: 'Każde dwie połówki dają jedną całą kratkę, więc cztery połówki to 2 całe kratki.',
  },
  {
    id: 'pole-vs-obwod',
    question: 'Czym różni się pole figury od jej obwodu?',
    options: [
      { id: 'a', text: 'Obwód mierzymy wzdłuż brzegu, a pole liczymy w środku figury' },
      { id: 'b', text: 'Niczym — to dwie nazwy tej samej wielkości' },
      { id: 'c', text: 'Pole mają tylko prostokąty, a obwód wszystkie figury' },
      { id: 'd', text: 'Obwód jest zawsze większy od pola' },
    ],
    correctId: 'a',
    explanation:
      'Obwód to długość drogi dookoła figury, pole to powierzchnia jej wnętrza. Wychodzą z nich zwykle różne liczby i mierzy się je w różnych jednostkach.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/pole-figury/ukladanie-kwadratowych-kafelkow-na-podlodze.jpg',
  rozgrzewka: '/images/matematyka/lekcje/pole-figury/dwa-dywaniki-o-roznych-ksztaltach.jpg',
  pole: '/images/matematyka/lekcje/pole-figury/dziewczynka-uklada-kwadraty-na-figurze.jpg',
  przyklady: '/images/matematyka/lekcje/pole-figury/kratkowany-koc-piknikowy-na-trawie.jpg',
  cwiczenia: '/images/matematyka/lekcje/pole-figury/chlopiec-liczy-kratki-olowkiem.jpg',
  zadanie: '/images/matematyka/lekcje/pole-figury/namiot-o-ukosnych-polaciach-na-trawie.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function PoleFiguryLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozgrzewka = useStepDone('rozgrzewka');
  const pole = useStepDone('pole');
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
            Która figura jest większa? Na oko łatwo się pomylić — wysoka i chuda potrafi mieć
            dokładnie tyle samo miejsca co niska i szeroka. Dlatego powierzchnię mierzymy, a nie
            oceniamy: sprawdzamy, ile <strong>kwadratów jednostkowych</strong> mieści się w figurze.
            Ta liczba to <strong>pole figury</strong> — i właśnie od niej zaczyna się cały nowy dział.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Grid3x3, text: 'Kratka jako wspólna miarka' },
              { icon: Droplets, text: 'Kafelki wypełniają wnętrze figury' },
              { icon: Triangle, text: 'Dwie połówki to jedna cała kratka' },
              { icon: Frame, text: 'Pole to nie to samo co obwód' },
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
            alt="Kwadratowe kafelki układane jeden przy drugim w narożniku podłogi, obok stosik zapasowych kafelków, kielnia i złożona szmatka"
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
          numeral="?"
          kicker="Najpierw zgadnij, potem zmierz"
          image={IMAGES.rozgrzewka}
          alt="Dwa tkane dywaniki na drewnianej podłodze: po lewej wąski i długi chodnik, po prawej krótszy, ale znacznie szerszy dywan"
        >
          Trzy razy zobaczysz dwie figury i wybierzesz tę, która twoim zdaniem zajmuje więcej
          miejsca. Dopiero po wyborze na figurach pojawi się kratownica i policzy je za ciebie.
          Sprawdź, ile razy oko cię zmyli.
        </LessonImageCard>
        <EyeCheckDuel color={color} onComplete={rozgrzewka.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="pole">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.pole}
          alt="Dziewczynka około dziesięciu lat, jasna karnacja, ciemnobrązowe włosy spięte w kok, układa małe papierowe kwadraty wewnątrz figury narysowanej na dużym arkuszu"
        >
          <p>
            Pole figury to powierzchnia, którą figura zajmuje. Żeby ją zmierzyć, wypełniamy figurę
            jednakowymi kwadratami — kwadratami jednostkowymi. Stuknij w kratkę wewnątrz pokoju, a
            kafelki rozleją się same aż do ścian. Liczba, na której się zatrzymają, to właśnie pole.
          </p>
        </LessonImageCard>
        <FloodTileBoard color={color} onComplete={pole.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Kratkowany koc piknikowy rozłożony na trawie, na nim wiklinowy koszyk i kilka jabłek"
          lead="Kratki nie zawsze wypada liczyć po jednej."
          reverse
        >
          W prostokącie policzysz je rzędami, figurę o dziwniejszym kształcie podzielisz na dwa
          prostokąty, a przy ukośnym boku najpierw policzysz całe kratki, a połówki dobierzesz w
          pary. Trzy przykłady, po jednym na każdy sposób.
        </LessonImageCard>
        <AreaCountSteps color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Chłopiec około dziesięciu lat, jasna karnacja, krótkie jasne włosy, zielona koszulka, siedzi przy biurku i wskazuje ołówkiem kratki na pustym arkuszu papieru w kratkę"
          reverse
        >
          <p>
            Siedem zadań o rosnącej trudności: proste liczenie kratek, figury o nierównych rzędach,
            połówki, pytanie o rozmiar samej kratki i klasyczna pułapka „pole czy obwód”.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildAreaDrill(color)}
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
          lead="Prawdziwe figury rzadko kończą się dokładnie na kresce."
          alt="Rozstawiony płócienny namiot o ukośnych połaciach na trawie, obok zwinięta linka i kilka metalowych śledzi"
        >
          Ukośny bok zawsze przecina kratki na pół. Policz najpierw całe, a potem sklej połówki w
          pary — zobaczysz, jak dwa oddzielne trójkąty stają się jednym kwadratem.
        </LessonImageCard>
        <HalfPairMerge color={color} onComplete={zadanie.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: pole figury</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Sześć zdań, które wystarczą na cały ten temat.
        </p>
        <ol className="divide-y border">
          {AREA_RULES.map((rule, index) => (
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

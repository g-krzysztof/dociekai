'use client';

import Image from 'next/image';
import { Divide, Hash, MoveRight, Ruler } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { FractionLineEyeballWarmup } from './fraction-line-eyeball-warmup';
import { FractionLineLab, type FractionLineRound } from './fraction-line-lab';
import { FractionLineWorkedExamples } from './fraction-line-worked-examples';
import { buildDrillTasks } from './ulamki-na-osi-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Gdzie stoi ten punkt?',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'budowanie',
    kind: 'Nowe pojęcie',
    title: 'Zaznacz ułamek na osi',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Szlak i wstążka',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Odczytaj i porównaj',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'wyprawa',
    kind: 'Zadanie problemowe',
    title: 'Wyprawa na szlak',
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

const BUILD_ROUNDS: FractionLineRound[] = [
  { label: 'Przeciągnij punkt tak, żeby zaznaczyć 3/4.', licznik: 3, mianownik: 4 },
  { label: 'Teraz zaznacz 5/8.', licznik: 5, mianownik: 8 },
  { label: 'I na koniec 2/6.', licznik: 2, mianownik: 6 },
];

const TRAIL_ROUNDS: FractionLineRound[] = [
  { label: 'Ala pokonała już 2/5 szlaku. Zaznacz jej miejsce na trasie.', licznik: 2, mianownik: 5 },
  { label: 'Tomek dobiegł do 3/4 trasy. Zaznacz jego miejsce.', licznik: 3, mianownik: 4 },
  { label: 'Turyści dotarli do 7/10 szlaku — prawie na mecie! Zaznacz to miejsce.', licznik: 7, mianownik: 10 },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'odcinek-0-1',
    question: 'Na osi liczbowej odcinek od 0 do 1 przedstawia...',
    options: [
      { id: 'a', text: 'trzy czwarte całości' },
      { id: 'b', text: 'dwie całości' },
      { id: 'c', text: 'jedną całość' },
      { id: 'd', text: 'połowę całości' },
    ],
    correctId: 'c',
    explanation: 'Odcinek od 0 do 1 to zawsze jedna cała jednostka — na niej rozstawiamy wszystkie ułamki właściwe.',
  },
  {
    id: 'mianownik-podzialu',
    question: 'Odcinek od 0 do 1 podzielono na 5 równych części. Ile wynosi MIANOWNIK ułamków, które można zaznaczyć na tej osi?',
    options: [
      { id: 'a', text: '5' },
      { id: 'b', text: '1' },
      { id: 'c', text: '0' },
      { id: 'd', text: '6' },
    ],
    correctId: 'a',
    explanation: 'Mianownik to liczba równych części, na jaką podzielono odcinek — tu 5.',
  },
  {
    id: 'odczytaj-punkt',
    question: 'Odcinek podzielono na 7 równych części, a punkt zaznaczono po 3 podziałkach od zera. Który zapis pasuje?',
    options: [
      { id: 'a', text: '7/3' },
      { id: 'b', text: '4/7' },
      { id: 'c', text: '3/3' },
      { id: 'd', text: '3/7' },
    ],
    correctId: 'd',
    explanation: '3 podziałki od zera z 7 równych części to 3/7.',
  },
  {
    id: 'punkt-w-zerze',
    question: 'Punkt stoi dokładnie w miejscu 0 na osi. Jaki to zawsze ułamek, niezależnie od mianownika?',
    options: [
      { id: 'a', text: 'mianownik/mianownik' },
      { id: 'b', text: '0/mianownik' },
      { id: 'c', text: '1/mianownik' },
      { id: 'd', text: 'nie da się określić' },
    ],
    correctId: 'b',
    explanation: 'Zero podziałek od zera to zawsze 0/mianownik, niezależnie od tego, na ile części podzielono odcinek.',
  },
  {
    id: 'blizej-jedynki',
    question: 'Na tej samej osi punkt A stoi w miejscu 2/9, a punkt B w miejscu 7/9. Który punkt leży bliżej liczby 1?',
    options: [
      { id: 'a', text: 'Punkt A' },
      { id: 'b', text: 'Leżą w tym samym miejscu' },
      { id: 'c', text: 'Punkt B' },
      { id: 'd', text: 'Nie da się stwierdzić' },
    ],
    correctId: 'c',
    explanation: 'Punkt B (7/9) leży dalej w prawo niż punkt A (2/9), więc jest bliżej liczby 1.',
  },
  {
    id: 'ile-czesci',
    question: 'Chcesz zaznaczyć na osi ułamek 4/6. Na ile równych części musisz podzielić odcinek od 0 do 1?',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '4' },
      { id: 'c', text: '10' },
      { id: 'd', text: '2' },
    ],
    correctId: 'a',
    explanation: 'Mianownik (6) mówi, na ile równych części dzielimy cały odcinek — dopiero potem odliczamy licznik (4) podziałek.',
  },
];

const CHEAT_SHEET = [
  'Odcinek od 0 do 1 na osi liczbowej to jedna całość.',
  'Mianownik mówi, na ile równych części podzielono ten odcinek.',
  'Licznik to liczba podziałek, które minęliśmy licząc od zera do punktu.',
  'Punkt dokładnie w miejscu 0 to zawsze 0/mianownik.',
  'Punkt dokładnie w miejscu 1 to zawsze mianownik/mianownik — cała całość.',
  'Na tej samej osi punkt dalej w prawo zawsze oznacza większy ułamek.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/ulamki-na-osi-liczbowej/molo-poranne-jezioro.jpg',
  rozgrzewka: '/images/matematyka/lekcje/ulamki-na-osi-liczbowej/dziewczynka-na-liesciach-lilii.jpg',
  budowanie: '/images/matematyka/lekcje/ulamki-na-osi-liczbowej/chlopiec-koralik-na-sznurku.jpg',
  przyklady: '/images/matematyka/lekcje/ulamki-na-osi-liczbowej/szlak-lesny-znaczniki.jpg',
  cwiczenia: '/images/matematyka/lekcje/ulamki-na-osi-liczbowej/kamienie-w-strumieniu.jpg',
  wyprawa: '/images/matematyka/lekcje/ulamki-na-osi-liczbowej/chlopiec-biegnie-trawnikiem.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function UlamkiNaOsiLiczbowejLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const wyprawa = useStepDone('wyprawa');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Ułamek to nie tylko pokrojony kształt — to też dokładne miejsce na osi liczbowej.
            Odcinek od 0 do 1 to jedna całość, a dzielimy go na równe części tak samo, jak
            dzieliłeś pasek czy koło. Tym razem zamiast zamalowywać kawałki, przeciągniesz punkt
            dokładnie tam, gdzie powinien stanąć.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Ruler, text: 'Odcinek od 0 do 1 to jedna całość' },
              { icon: Divide, text: 'Mianownik dzieli go na równe części' },
              { icon: Hash, text: 'Licznik liczy podziałki od zera' },
              { icon: MoveRight, text: 'Im dalej w prawo, tym większy ułamek' },
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
            alt="Drewniane molo z równo rozstawionymi deskami i słupkami, biegnące przez spokojne jezioro o wschodzie słońca"
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
          alt="Dziewczynka w żółtym płaszczu przeciwdeszczowym kucająca na liściu lilii wodnej, kolejne liście rozstawione równo w rzędzie na stawie"
          lead="Zanim zaczniesz zaznaczać punkty, wyrób sobie oko do osi."
        >
          Punkt jest już zaznaczony na podzielonej osi — Twoje zadanie to tylko dobrać właściwy zapis.
        </LessonImageCard>
        <FractionLineEyeballWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="budowanie">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.budowanie}
          alt="Chłopiec przesuwający duży drewniany koralik po napiętym sznurku rozciągniętym między dwoma słupkami w ogrodzie"
        >
          <p>
            Teraz Ty ustawiasz punkt na osi — przeciągnij go wzdłuż odcinka od 0 do 1, dokładnie
            tak, jak chłopiec na zdjęciu przesuwa koralik po sznurku z równymi węzełkami. Zbuduj
            dokładnie taki ułamek, jaki podano w poleceniu.
          </p>
        </LessonImageCard>
        <FractionLineLab color={color} rounds={BUILD_ROUNDS} onComplete={budowanie.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="2×"
          kicker="Ta sama zasada, inny kontekst"
          image={IMAGES.przyklady}
          alt="Leśny szlak turystyczny z rzędem równo rozstawionych drewnianych słupków-znaczników wzdłuż ścieżki"
        >
          Dwa gotowe przykłady — szlak turystyczny podzielony na odcinki i wstążka pocięta na kawałki.
        </LessonImageCard>
        <FractionLineWorkedExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Rząd płaskich kamieni prowadzących przez płytki, przejrzysty leśny strumień"
          reverse
        >
          <p>Czas poćwiczyć samodzielnie — odczytywanie punktu, osobno licznik i mianownik, punkty 0 i 1, i porównywanie dwóch punktów na tej samej osi.</p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="wyprawa">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wyprawa}
          alt="Chłopiec biegnący trawiastą ścieżką w ogrodzie oznaczoną małymi, równo rozstawionymi chorągiewkami po obu stronach"
          reverse
          lead="Ten sam mechanizm, tym razem na szlaku turystycznym."
        >
          Trasa biegnie od startu do mety — zaznacz na niej miejsce każdego z trojga turystów.
        </LessonImageCard>
        <FractionLineLab
          color={color}
          rounds={TRAIL_ROUNDS}
          endpointLabels={['Start', 'Meta']}
          onComplete={wyprawa.markStepDone}
        />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: ułamki na osi liczbowej w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">Wracaj do niej, gdy w kolejnej lekcji zaczniesz porównywać ułamki.</p>
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

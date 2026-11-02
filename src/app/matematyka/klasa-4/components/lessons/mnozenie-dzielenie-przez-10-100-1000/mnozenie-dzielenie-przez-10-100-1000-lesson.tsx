'use client';

import Image from 'next/image';
import { ArrowLeftRight, Hash, MoveHorizontal, Sigma } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { PowerZeroWarmup } from './power-zero-warmup';
import { CommaHopBoard } from './comma-hop-board';
import { ScaleShiftSteps } from './scale-shift-steps';
import { buildScalingDrill } from './scaling-drill';
import { BulkPriceTask } from './bulk-price-task';
import { DECIMAL_SCALING_RULES } from '../../../lib/decimal-scaling';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Policz zera',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'przecinek',
    kind: 'Nowe pojęcie',
    title: 'Przecinek przeskakuje o tyle miejsc, ile zer',
    time: '12 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy rozpisane działania przez 10, 100 i 1000',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Policz samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'zadanie',
    kind: 'Zadanie problemowe',
    title: 'Hurt: z paczki na sztukę i z powrotem',
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
    id: 'x10-mem',
    question: 'Ile to 4,7 · 10?',
    options: [
      { id: 'a', text: '0,47' },
      { id: 'b', text: '4,70' },
      { id: 'c', text: '470' },
      { id: 'd', text: '47' },
    ],
    correctId: 'd',
    explanation: '10 ma jedno zero, więc przecinek przeskakuje o 1 w prawo: 4,7 → 47.',
  },
  {
    id: 'd100',
    question: 'Ile to 63 : 100?',
    options: [
      { id: 'a', text: '0,63' },
      { id: 'b', text: '6,3' },
      { id: 'c', text: '6300' },
      { id: 'd', text: '0,063' },
    ],
    correctId: 'a',
    explanation:
      '100 ma dwa zera → przecinek o 2 w lewo. 63 → 0,63 (przed przecinkiem dopisujemy 0).',
  },
  {
    id: 'ile-miejsc',
    question: 'O ile miejsc przeskakuje przecinek przy mnożeniu przez 1000?',
    options: [
      { id: 'a', text: 'O 1' },
      { id: 'b', text: 'O 2' },
      { id: 'c', text: 'O 3' },
      { id: 'd', text: 'O tyle, ile cyfr ma liczba' },
    ],
    correctId: 'c',
    explanation: '1000 ma trzy zera, więc przecinek przeskakuje o 3 miejsca w prawo.',
  },
  {
    id: 'pulapka-5200',
    question: 'Ile to 2,5 · 100?',
    options: [
      { id: 'a', text: '2,500' },
      { id: 'b', text: '250' },
      { id: 'c', text: '25' },
      { id: 'd', text: '2500' },
    ],
    correctId: 'b',
    explanation:
      'Przecinek o 2 w prawo: 2,5 → 25, brakuje jeszcze jednego miejsca → 250. Zapis 2,500 to wciąż 2,5.',
  },
  {
    id: 'kierunek',
    question: 'Co dzieje się z liczbą, gdy dzielimy ją przez 10?',
    options: [
      { id: 'a', text: 'Rośnie 10 razy' },
      { id: 'b', text: 'Nie zmienia się, tylko dopisujemy zero' },
      { id: 'c', text: 'Przecinek idzie w prawo' },
      { id: 'd', text: 'Maleje — przecinek idzie o 1 miejsce w lewo' },
    ],
    correctId: 'd',
    explanation: 'Dzielenie zmniejsza liczbę, więc przecinek wędruje w lewo. Przez 10 — o jedno miejsce.',
  },
  {
    id: 'zadanie-kartki',
    question: '100 jednakowych kartek waży razem 0,5 kg. Ile waży jedna kartka?',
    options: [
      { id: 'a', text: '0,005 kg' },
      { id: 'b', text: '0,05 kg' },
      { id: 'c', text: '5 kg' },
      { id: 'd', text: '50 kg' },
    ],
    correctId: 'a',
    explanation:
      '0,5 : 100 — przecinek o 2 w lewo, z dwoma zerami z przodu: 0,005 kg.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/mnozenie-dzielenie-przez-10-100-1000/rzad-jednakowych-woreczkow.jpg',
  rozgrzewka: '/images/matematyka/lekcje/mnozenie-dzielenie-przez-10-100-1000/wiazka-olowkow-i-jeden-olowek.jpg',
  przecinek: '/images/matematyka/lekcje/mnozenie-dzielenie-przez-10-100-1000/dziewczynka-przesuwa-zakladke-po-pasku.jpg',
  przyklady: '/images/matematyka/lekcje/mnozenie-dzielenie-przez-10-100-1000/duza-butelka-i-rzad-kubeczkow.jpg',
  cwiczenia: '/images/matematyka/lekcje/mnozenie-dzielenie-przez-10-100-1000/chlopiec-rozwiazuje-zadania.jpg',
  zadanie: '/images/matematyka/lekcje/mnozenie-dzielenie-przez-10-100-1000/waga-szalkowa-z-gwozdziami.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function MnozenieDzieleniePrzez101001000Lesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozgrzewka = useStepDone('rozgrzewka');
  const przecinek = useStepDone('przecinek');
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
            Ile to <strong>3,5 · 100</strong>? A <strong>4,2 : 100</strong>? Nie trzeba tego liczyć w
            słupku — wystarczy przesunąć przecinek. Dziś nauczysz się mnożyć i dzielić liczby z
            przecinkiem przez <strong>10, 100 i 1000</strong>: liczysz zera, przesuwasz przecinek o
            tyle miejsc, a brakujące miejsca dopełniasz zerami.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Hash, text: 'Liczba zer = liczba miejsc przeskoku' },
              { icon: MoveHorizontal, text: 'Mnożenie → w prawo, dzielenie → w lewo' },
              { icon: Sigma, text: 'Brakuje miejsca? Dopisz zero' },
              { icon: ArrowLeftRight, text: 'Z paczki na sztukę i z powrotem' },
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
            alt="Rząd jednakowych papierowych woreczków z mąką ustawionych obok siebie na drewnianym blacie"
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
          kicker="Policz zera"
          image={IMAGES.rozgrzewka}
          alt="Wiązka jednakowych ołówków związanych gumką, a obok pojedynczy luźny ołówek, na jasnym stole"
        >
          Cała lekcja mieści się w jednym zdaniu: ile zer ma mnożnik albo dzielnik, o tyle miejsc
          przeskoczy przecinek. 10 to jedno zero, 100 to dwa, 1000 to trzy. Zacznij od policzenia
          zer.
        </LessonImageCard>
        <PowerZeroWarmup color={color} onComplete={rozgrzewka.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="przecinek">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.przecinek}
          alt="Dziewczynka około dziesięciu lat, jasna karnacja, ciemne włosy w warkoczach, przesuwa kolorową zakładkę wzdłuż długiego paska papieru na biurku"
        >
          <p>
            Przecinek to zakładka, która przesuwa się po cyfrach. Mnożąc przez 10, 100 albo 1000,
            przesuwasz ją w prawo o tyle miejsc, ile zer. Dzieląc — w lewo. Gdzie zabraknie cyfry,
            dopisujesz zero. Zrób to sam dla trzech działań.
          </p>
        </LessonImageCard>
        <CommaHopBoard color={color} onComplete={przecinek.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Duża szklana butelka z sokiem, obok dwa rzędy jednakowych małych szklaneczek napełnionych do tej samej wysokości"
          lead="Trzy gotowe działania — po jednym na każdy typowy przypadek."
          reverse
        >
          Raz trzeba dopisać zero z prawej, raz wszystko się mieści bez dopisywania, a raz zero
          dochodzi z przodu, przed przecinkiem. Patrz, dokąd za każdym razem skacze przecinek.
        </LessonImageCard>
        <ScaleShiftSteps color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Chłopiec około dziesięciu lat, jasna karnacja, krótkie rude włosy, niebieski sweter, rozwiązuje zadania przy biurku z ołówkiem w dłoni"
          reverse
        >
          <p>
            Siedem zadań o rosnącej trudności — mnożenie i dzielenie przez 10 w pamięci, dopisywanie
            zer, pułapka „dopisuję zera zawsze” i cena hurtowa.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildScalingDrill(color)}
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
          alt="Waga szalkowa na warsztacie: na jednej szalce kopiec gwoździ, na drugiej kilka gładkich odważników, obok otwarta skrzynka pełna gwoździ"
          lead="Sklep sprzedaje towar na sztuki."
        >
          Gdy wiesz, ile waży albo kosztuje cała paczka, jedną sztukę policzysz dzieleniem przez 10,
          100 lub 1000. A z jednej sztuki wrócisz do wielu — mnożeniem.
        </LessonImageCard>
        <BulkPriceTask color={color} onComplete={zadanie.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: mnożenie i dzielenie przez 10, 100, 1000</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Żadnego słupka — tylko przecinek, kierunek i dopisane zera.
        </p>
        <ol className="divide-y border">
          {DECIMAL_SCALING_RULES.map((rule, index) => (
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

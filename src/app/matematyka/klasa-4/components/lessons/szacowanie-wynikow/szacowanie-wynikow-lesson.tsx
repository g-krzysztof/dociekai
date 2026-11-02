'use client';

import Image from 'next/image';
import { ChevronsUp, Rows3, Scale, Search } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { EstimateWarmup } from './estimate-warmup';
import { RoundingLab } from './rounding-lab';
import { EstimationExamples } from './estimation-examples';
import { EstimationDrill } from './estimation-drill';
import { StadiumEstimateChallenge } from './stadium-estimate-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Do której okrągłej liczby bliżej?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Uruchom maszynę zaokrąglającą',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Szacujemy sumy, różnice i iloczyny',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz zaokrąglanie i szacowanie',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'trybuny',
    kind: 'Zadanie problemowe',
    title: 'Ilu kibiców jest na trybunach?',
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
    id: 'zaokraglij-826',
    question: '826 zaokrąglone do pełnych setek to?',
    options: [
      { id: 'a', text: '800' },
      { id: 'b', text: '900' },
      { id: 'c', text: '700' },
      { id: 'd', text: '850' },
    ],
    correctId: 'a',
    explanation: 'Cyfra dziesiątek to 2 (< 5) → zaokrąglamy w dół: 800.',
  },
  {
    id: 'zaokraglij-295',
    question: '295 zaokrąglone do pełnych dziesiątek to?',
    options: [
      { id: 'a', text: '290' },
      { id: 'b', text: '280' },
      { id: 'c', text: '300' },
      { id: 'd', text: '310' },
    ],
    correctId: 'c',
    explanation: 'Cyfra jedności to 5 (≥ 5) → zaokrąglamy w górę: 300.',
  },
  {
    id: 'oszacuj-612-385',
    question: 'Który szacunek najlepiej pasuje do 612 + 385?',
    options: [
      { id: 'a', text: '900' },
      { id: 'b', text: '1100' },
      { id: 'c', text: '800' },
      { id: 'd', text: '1000' },
    ],
    correctId: 'd',
    explanation: '612 → 600, 385 → 400, więc 600 + 400 = 1000 (dokładnie: 997).',
  },
  {
    id: 'po-co-szacowanie',
    question: 'Do czego przede wszystkim służy szacowanie wyniku?',
    options: [
      { id: 'a', text: 'Do sprawdzenia, czy dokładny wynik ma sens' },
      { id: 'b', text: 'Do zastąpienia dokładnego liczenia' },
      { id: 'c', text: 'Tylko do zadań z pieniędzmi' },
      { id: 'd', text: 'Do liczenia dokładnych wyników szybciej niż kalkulator' },
    ],
    correctId: 'a',
    explanation: 'Szacunek nie zastępuje dokładnego wyniku — pomaga ocenić, czy dokładny wynik w ogóle ma sens.',
  },
  {
    id: 'zaokraglij-9950',
    question: '9950 zaokrąglone do pełnych tysięcy to?',
    options: [
      { id: 'a', text: '9000' },
      { id: 'b', text: '10 000' },
      { id: 'c', text: '9900' },
      { id: 'd', text: '10 900' },
    ],
    correctId: 'b',
    explanation: 'Cyfra setek to 9 (≥ 5) → zaokrąglamy w górę. Przeniesienie leci przez wszystkie miejsca: 9950 → 10 000.',
  },
];

const CHEAT_SHEET = [
  'Patrzysz na cyfrę zaraz za miejscem zaokrąglenia: 5 i więcej — w górę, mniej niż 5 — w dół.',
  'Zaokrąglając w górę, cyfra czasem „przenosi się” dalej — nawet o kilka miejsc naraz (2996 → 3000).',
  'Żeby oszacować wynik działania, najpierw zaokrąglij liczby, a dopiero potem policz w pamięci.',
  'Szacunek nie musi być dokładny — ma sprawdzić, czy dokładny wynik w ogóle ma sens.',
  'Im mniejszy rząd, do którego zaokrąglasz (dziesiątki zamiast tysięcy), tym dokładniejszy szacunek.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/szacowanie-wynikow/sloik-z-kulkami.jpg',
  rozgrzewka: '/images/matematyka/lekcje/szacowanie-wynikow/chlopiec-mierzy-drzewo.jpg',
  nowePojecie: '/images/matematyka/lekcje/szacowanie-wynikow/stare-liczydlo.jpg',
  przyklady: '/images/matematyka/lekcje/szacowanie-wynikow/dziewczynka-sprawdza-wynik.jpg',
  trybuny: '/images/matematyka/lekcje/szacowanie-wynikow/trybuny-kibicow.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function SzacowanieWynikowLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('trybuny');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Nie zawsze potrzebujesz dokładnego wyniku — czasem wystarczy dobre{' '}
            <strong>przybliżenie</strong>. Zaokrąglisz liczby, policzysz w pamięci i od razu
            wiesz, czy dokładny wynik ma sens.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: ChevronsUp, text: '5 i więcej — w górę, mniej niż 5 — w dół' },
              { icon: Rows3, text: 'Przeniesienie może polecieć przez kilka miejsc naraz' },
              { icon: Scale, text: 'Zaokrąglone liczby liczysz w pamięci, szybko' },
              { icon: Search, text: 'Szacunek wyłapuje błędy w dokładnym obliczeniu' },
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
            alt="Szklany słoik wypełniony kolorowymi kulkami, część z nich rozsypana obok na stole"
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
          alt="Chłopiec patrzący w górę na wysokie drzewo, z uniesioną dłonią jakby coś mierzył"
        >
          <p>
            Zanim poznasz regułę, sprawdź wyczucie — do której okrągłej liczby bliżej jest dana
            liczba?
          </p>
        </LessonImageCard>
        <EstimateWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Drewniane liczydło z kolorowymi koralikami na drucikach, stojące na starym biurku"
          lead="Jedna cyfra decyduje o wszystkim — obejrzyj, jak działa przeniesienie."
        >
          Zaokrąglanie to nie tylko dopisywanie zer — czasem jedna decyzja uruchamia całą
          kaskadę zmian.
        </LessonImageCard>
        <RoundingLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="3 szacunki, jedna pułapka"
          alt="Dziewczynka z warkoczykami sprawdzająca wynik obliczeń w zeszycie obok kalkulatora"
        >
          Szacujesz sumę, różnicę i iloczyn, a na koniec — łapiesz błąd w cudzym obliczeniu.
        </LessonImageCard>
        <EstimationExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <EstimationDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="trybuny">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.trybuny}
          alt="Pełne trybuny stadionu z kolorowo ubranymi kibicami widziane z daleka"
          reverse
          lead="Nikt nie liczy kibiców co do jednego — szacunek sektorami wystarczy."
        >
          Wykorzystaj to, czego się nauczyłeś, żeby ocenić frekwencję na szkolnym meczu.
        </LessonImageCard>
        <StadiumEstimateChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: zaokrąglanie i szacowanie wyników</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama reguła działa dla dziesiątek, setek i tysięcy — zmienia się tylko miejsce, na
          które patrzysz.
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

'use client';

import Image from 'next/image';
import { Calculator, Link2, Scale, Search } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { OperationSpotterWarmup } from './operation-spotter-warmup';
import { EstimateFirstLab } from './estimate-first-lab';
import { PisemneWordProblemExamples } from './pisemne-word-problem-examples';
import { PisemneWordProblemDrill } from './pisemne-word-problem-drill';
import { WycieczkaChallenge } from './wycieczka-challenge';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Które działanie? Zgadnij po treści',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Najpierw oszacuj, potem policz dokładnie',
    time: '12 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: '4 zadania, 4 działania pisemne',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz zadania z działaniami pisemnymi',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'wycieczka',
    kind: 'Zadanie problemowe',
    title: 'Zaplanuj budżet szkolnej wycieczki',
    time: '8 min',
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
    id: 'przed-liczeniem',
    question: 'Zanim zaczniesz liczyć w słupku duże liczby z zadania tekstowego, warto najpierw...',
    options: [
      { id: 'a', text: 'zgadnąć wynik na oko' },
      { id: 'b', text: 'pominąć trudniejsze zdanie w treści' },
      { id: 'c', text: 'oszacować wynik, zaokrąglając liczby' },
      { id: 'd', text: 'od razu zapisać najdłuższe możliwe działanie' },
    ],
    correctId: 'c',
    explanation:
      'Szybki szacunek pokazuje, czy dokładny wynik w ogóle ma sens, zanim zaczniesz liczyć w słupku.',
  },
  {
    id: '2650-1780',
    question: '2650 + 1780 = ?',
    options: [
      { id: 'a', text: '4330' },
      { id: 'b', text: '4430' },
      { id: 'c', text: '4420' },
      { id: 'd', text: '3430' },
    ],
    correctId: 'b',
    explanation: '2650 + 1780 = 4430 — dodawanie pisemne z dwoma przeniesieniami.',
  },
  {
    id: '5000-2340',
    question: '5000 − 2340 = ?',
    options: [
      { id: 'a', text: '2760' },
      { id: 'b', text: '3660' },
      { id: 'c', text: '2660' },
      { id: 'd', text: '3760' },
    ],
    correctId: 'c',
    explanation: '5000 − 2340 = 2660 — pożyczanie przechodzi przez same zera, dokładnie jak w lekcji o odejmowaniu.',
  },
  {
    id: '45-62',
    question: '45 × 62 = ?',
    options: [
      { id: 'a', text: '2700' },
      { id: 'b', text: '1970' },
      { id: 'c', text: '2610' },
      { id: 'd', text: '2790' },
    ],
    correctId: 'd',
    explanation: '45 × 62 = 2790 — mnożenie pisemne przez liczbę dwucyfrową, suma dwóch iloczynów cząstkowych.',
  },
  {
    id: '864-6',
    question: '864 : 6 = ?',
    options: [
      { id: 'a', text: '144' },
      { id: 'b', text: '104' },
      { id: 'c', text: '140' },
      { id: 'd', text: '134' },
    ],
    correctId: 'a',
    explanation: '864 : 6 = 144 — dzielenie pisemne od lewej, cyfra po cyfrze.',
  },
  {
    id: 'dwa-etapy',
    question: 'W zadaniu dwuetapowym, takim jak wycieczka do teatru z tej lekcji, wynik pierwszego kroku...',
    options: [
      { id: 'a', text: 'trzeba zignorować przy liczeniu drugiego kroku' },
      { id: 'b', text: 'staje się jedną z danych potrzebnych w drugim kroku' },
      { id: 'c', text: 'zawsze musi być większy niż wynik drugiego kroku' },
      { id: 'd', text: 'jest tylko ciekawostką bez znaczenia dla reszty zadania' },
    ],
    correctId: 'b',
    explanation:
      'Dokładnie tak działały zadania w tej lekcji: koszt biletów z kroku 1 stał się daną w kroku 2, przy liczeniu reszty z budżetu.',
  },
];

const CHEAT_SHEET = [
  'Przeczytaj zadanie uważnie i rozpoznaj, jakie działanie pisemne kryje się w treści — bez tego łatwo policzyć coś zupełnie innego.',
  'Zanim policzysz dokładnie, zaokrąglij liczby i zrób szybki szacunek — to sprawdzi, czy dokładny wynik ma sens.',
  'Duże liczby licz w słupku, tak jak w poprzednich lekcjach tego modułu — dokładnie te same zasady zapisu i przeniesienia/pożyczania.',
  'Jeśli zadanie ma dwa etapy, wynik pierwszego kroku zapisz i użyj go jako danej w drugim kroku.',
  'Na koniec porównaj dokładny wynik z szacunkiem — jeśli są blisko siebie, możesz mu zaufać.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/zadania-tekstowe-pisemne/otwarty-zeszyt-z-zadaniem-obok-biletow-i-monet.jpg',
  rozgrzewka:
    '/images/matematyka/lekcje/zadania-tekstowe-pisemne/dziewczynka-czytajaca-podrecznik-z-zamyslona-mina.jpg',
  nowePojecie:
    '/images/matematyka/lekcje/zadania-tekstowe-pisemne/dlon-ukladajaca-monety-w-rowne-stosy.jpg',
  przyklady:
    '/images/matematyka/lekcje/zadania-tekstowe-pisemne/chlopiec-ustawiajacy-rzedy-krzesel-w-sali.jpg',
  wycieczka: '/images/matematyka/lekcje/zadania-tekstowe-pisemne/dzieci-z-biletami-przed-teatrem.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ZadaniaTekstowePisemneLesson({ lesson, mathModule, nextLesson }: LessonProps) {
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
  const problem = useStepDone('wycieczka');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Cztery działania pisemne masz już opanowane — teraz czas użyć ich tam, gdzie naprawdę
            się przydają: w <strong>zadaniach tekstowych z dużymi liczbami</strong>. Czasem jedno
            zdanie to dwa kroki naraz, a wynik pierwszego staje się daną w drugim.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Search, text: 'Rozpoznajesz, którego działania pisemnego potrzebujesz' },
              { icon: Scale, text: 'Szacujesz wynik, zanim policzysz go dokładnie' },
              { icon: Calculator, text: 'Liczysz w słupku dokładnie tak, jak wcześniej w module' },
              { icon: Link2, text: 'Łączysz dwa kroki w jedną historię' },
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
            alt="Otwarty zeszyt w kratkę z odręcznie zapisanym dwuetapowym zadaniem tekstowym, obok bilety do teatru i kilka monet"
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
          alt="Dziewczynka z ciemnymi, kręconymi włosami czytająca podręcznik z zamyśloną, skupioną miną"
        >
          <p>
            Zanim zaczniesz liczyć, sprawdź, czy potrafisz rozpoznać po samej treści zadania,
            jakiego działania potrzebujesz — bez liczenia czegokolwiek.
          </p>
        </LessonImageCard>
        <OperationSpotterWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Dłoń układająca monety w równe, zaokrąglone stosy obok nieco nierównego, mniejszego stosika monet"
          lead="Zaokrąglij, oszacuj, dopiero potem licz dokładnie w słupku."
        >
          Ta sama metoda działa dla wszystkich czterech działań — zobacz ją na trzech różnych
          zadaniach, jedno po drugim.
        </LessonImageCard>
        <EstimateFirstLab color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 zadania, 4 działania pisemne"
          alt="Chłopiec o czarnych włosach ustawiający równe rzędy krzeseł w szkolnej sali"
        >
          Dodawanie, odejmowanie, mnożenie i dzielenie — te same zasady zapisu, które znasz z
          poprzednich lekcji, tylko teraz ukryte w historyjce.
        </LessonImageCard>
        <PisemneWordProblemExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <PisemneWordProblemDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="wycieczka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wycieczka}
          alt="Dwoje dzieci trzymających bilety przed wejściem do teatru, w tle nauczycielka z clipboardem"
          reverse
          lead="Policz koszt biletów, potem to, co zostanie w budżecie."
        >
          Dwuetapowe zadanie o szkolnej wycieczce do teatru — mnożenie pisemne przez liczbę
          wielocyfrową, a potem odejmowanie z pożyczaniem od zer.
        </LessonImageCard>
        <WycieczkaChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: zadania tekstowe z działaniami pisemnymi</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          To spięcie wszystkiego, czego nauczyłeś/aś się w tym module — teraz w realnych
          historyjkach, nie gotowych działaniach.
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
